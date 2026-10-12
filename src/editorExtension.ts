import { syntaxTree } from "@codemirror/language";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import { moment } from "obsidian";
import { buildDecorations } from "./decorations";
import { DateLinePicker } from "./datepicker";
import { getActiveFormats } from "./formats";
import type { DateLineSettings } from "./types";
import type { DateMatch } from "./types";

export type SettingsGetter = () => DateLineSettings;

function overlapsExisting(
	start: number,
	end: number,
	matches: DateMatch[],
): boolean {
	return matches.some(
		(m) => start >= m.from && (end <= m.to || start <= m.to),
	);
}

export class DateLineCMPlugin implements PluginValue {
	decorations: DecorationSet = Decoration.none;
	dates: DateMatch[] = [];
	datepicker: DateLinePicker | undefined;
	performingReplace = false;

	private scrollAbort = new AbortController();

	constructor(
		private view: EditorView,
		private getSettings: SettingsGetter,
	) {
		view.scrollDOM.addEventListener(
			"scroll",
			() => this.repositionPicker(),
			{ signal: this.scrollAbort.signal },
		);
		this.refreshMatches(view);
	}

	private refreshMatches(view: EditorView): void {
		this.dates = this.scanVisibleDates(view);
		this.decorations = buildDecorations(this.dates, this.getSettings());
	}

	private scanVisibleDates(view: EditorView): DateMatch[] {
		const formats = getActiveFormats(this.getSettings());
		const matches: DateMatch[] = [];

		for (const range of view.visibleRanges) {
			const text = view.state.doc.sliceString(range.from, range.to);
			for (const format of formats) {
				format.regex.lastIndex = 0;
				let exec: RegExpExecArray | null;
				while ((exec = format.regex.exec(text)) !== null) {
					const from = exec.index + range.from;
					const to = from + exec[0].length;
					if (this.isInCodeblock(view, from)) continue;
					if (overlapsExisting(from, to, matches)) continue;
					matches.push({
						from,
						to,
						value: exec[0],
						format,
					});
				}
			}
		}
		return matches;
	}

	private isInCodeblock(view: EditorView, position: number): boolean {
		if (!this.getSettings().ignoreCodeblocks) return false;
		const tree = syntaxTree(view.state);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let node: any = tree.resolve(position, 1);
		while (node) {
			if (
				node.name === "FencedCode" ||
				node.name === "CodeBlock" ||
				node.name === "InlineCode" ||
				node.name === "CodeText" ||
				node.name.includes("Code") ||
				node.name.includes("code")
			) {
				return true;
			}
			node = node.parent;
		}
		return false;
	}

	repositionPicker(): void {
		if (!this.datepicker?.isOpened) return;
		const pos = this.view.coordsAtPos(this.datepicker.cursorPosition);
		if (pos) {
			this.datepicker.updatePosition({
				top: pos.top,
				left: pos.left,
				bottom: pos.bottom,
			});
		}
	}

	formatEditedValue(match: DateMatch, pickerResult: string): string {
		const settings = this.getSettings();
		const parsed = moment(pickerResult);
		if (!parsed.isValid()) return match.value;

		if (match.format.type === "DATETIME") {
			if (settings.overrideFormatOnEdit) {
				const timePart = match.format.formatToUser.includes("A")
					? " hh:mm A"
					: " HH:mm";
				return parsed.format(settings.preferredDateFormat + timePart);
			}
			return parsed.format(match.format.formatToUser);
		}
		if (match.format.type === "DATE") {
			if (settings.overrideFormatOnEdit) {
				return parsed.format(settings.preferredDateFormat);
			}
			return parsed.format(match.format.formatToUser);
		}
		return parsed.format(match.format.formatToUser);
	}

	openDatepicker(view: EditorView, match: DateMatch): void {
		view.requestMeasure({
			read: (v) => v.coordsAtPos(match.from),
			write: (pos) => {
				if (!pos) return;
				this.datepicker?.respectSettingAndClose();
				this.datepicker = new DateLinePicker(this.getSettings);
				this.datepicker.open(pos, match, (result) => {
					const newValue = this.formatEditedValue(match, result);
					if (newValue === match.value) return;
					this.performingReplace = true;
					setTimeout(() => {
						this.performingReplace = false;
					}, 300);
					view.dispatch({
						changes: { from: match.from, to: match.to, insert: newValue },
					});
				});
			},
		});
	}

	update(update: ViewUpdate): void {
		this.view = update.view;
		if (
			update.docChanged ||
			update.geometryChanged ||
			update.viewportChanged ||
			update.heightChanged ||
			this.performingReplace
		) {
			this.repositionPicker();
			this.refreshMatches(update.view);
		}
	}

	destroy(): void {
		this.datepicker?.respectSettingAndClose();
		this.scrollAbort.abort();
	}
}

let settingsGetter: SettingsGetter = () => ({
	enabledPatternIds: [],
	showCalendarIcon: true,
	highlightDates: true,
	style: {
		textColor: "",
		backgroundColor: "",
		fontWeight: "",
		textDecoration: "",
		borderRadius: "",
		padding: "",
	},
	ignoreCodeblocks: true,
	autoApplyEdits: true,
	openCalendarImmediately: true,
	overrideFormatOnEdit: false,
	preferredDateFormat: "YYYY-MM-DD",
});

export function setDateLineSettingsGetter(getter: SettingsGetter): void {
	settingsGetter = getter;
}

let debounceButton = false;

function handleCalendarButtonClick(e: Event, view: EditorView): void {
	if (debounceButton) return;
	debounceButton = true;
	setTimeout(() => {
		debounceButton = false;
	}, 100);

	const target = e.target as HTMLElement;
	if (!target.closest(".date-line-calendar-btn")) return;

	e.preventDefault();
	const plugin = view.plugin(dateLineCMPlugin);
	if (!plugin) return;

	const pos = view.posAtDOM(target);
	const match = plugin.dates.find((d) => d.from === pos || d.from === pos - 1);
	if (!match) {
		const near = plugin.dates.find(
			(d) => pos >= d.from - 2 && pos <= d.from + 2,
		);
		if (!near) return;
		openOrToggle(view, plugin, near);
		return;
	}
	openOrToggle(view, plugin, match);
}

function openOrToggle(
	view: EditorView,
	plugin: DateLineCMPlugin,
	match: DateMatch,
): void {
	if (plugin.datepicker?.isOpened) {
		plugin.datepicker.respectSettingAndClose();
		plugin.datepicker.closedByButton = true;
	} else {
		DateLinePicker.openedByButton = true;
		DateLinePicker.calendarShownOnce = false;
		plugin.openDatepicker(view, match);
	}
}

export const dateLineCMPlugin = ViewPlugin.fromClass(
	class extends DateLineCMPlugin {
		constructor(view: EditorView) {
			super(view, settingsGetter);
		}
	},
	{
		decorations: (v) => v.decorations,
		eventHandlers: {
			mousedown: (e, view) => {
				handleCalendarButtonClick(e, view);
			},
			touchend: (e, view) => {
				handleCalendarButtonClick(e, view);
			},
		},
	},
);

import { Editor, Notice, Plugin } from "obsidian";
import type { EditorView } from "@codemirror/view";
import {
	dateLineCMPlugin,
	setDateLineSettingsGetter,
} from "./src/editorExtension";
import { DateLineSettingTab } from "./src/settingsTab";
import {
	applyHighlightStyles,
	DEFAULT_SETTINGS,
	migrateLegacyPatternSettings,
	normalizeSettings,
} from "./src/settings";
import type { DateLineSettings } from "./src/types";
import { registerCalendarLocales } from "./src/calendarLocales";
import datepickerCss from "vanillajs-datepicker/css/datepicker.min.css";

export default class DateLinePlugin extends Plugin {
	settings: DateLineSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		registerCalendarLocales();
		this.injectDatepickerStyles();
		setDateLineSettingsGetter(() => this.settings);
		applyHighlightStyles(this.settings);

		this.registerEditorExtension(dateLineCMPlugin);

		this.addCommand({
			id: "edit-date-at-cursor",
			name: "Datum op cursor bewerken",
			editorCallback: (editor: Editor) => {
				const editorView = (editor as Editor & { cm: EditorView }).cm;
				const cursor = editorView.state.selection.main.head;
				const plugin = editorView.plugin(dateLineCMPlugin);
				const match = plugin?.dates.find(
					(d) => d.from <= cursor && d.to >= cursor,
				);
				if (match && plugin) {
					plugin.openDatepicker(editorView, match);
				} else {
					new Notice("Geen datum op de cursor gevonden.");
				}
			},
		});

		this.addSettingTab(new DateLineSettingTab(this.app, this));
	}

	onunload(): void {
		document.querySelectorAll(".date-line-picker").forEach((el) => el.remove());
		document.getElementById("date-line-dynamic-styles")?.remove();
		document.getElementById("date-line-vanilla-datepicker-css")?.remove();
	}

	private injectDatepickerStyles(): void {
		const id = "date-line-vanilla-datepicker-css";
		if (document.getElementById(id)) return;
		const el = document.createElement("style");
		el.id = id;
		el.textContent = datepickerCss as string;
		document.head.appendChild(el);
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as
			| (Partial<DateLineSettings> & Record<string, unknown>)
			| null;
		const migrated = migrateLegacyPatternSettings(data);
		this.settings = normalizeSettings(
			migrated ? { ...data, ...migrated } : data,
		);
		if (migrated) {
			await this.saveData(this.settings);
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		applyHighlightStyles(this.settings);
	}
}

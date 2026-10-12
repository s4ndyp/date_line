import { moment, Notice, Platform, setIcon } from "obsidian";
import { Datepicker } from "vanillajs-datepicker";
import type { DatepickerOptions } from "vanillajs-datepicker/Datepicker";
import { ensureCalendarLocales } from "./calendarLocales";
import {
	formatDatetimeNoteValue,
	formatPickerDisplayValue,
	pickWeekFormatForOutput,
	type PickerSelectionKind,
} from "./pickerOutput";
import { parseDateOrWeek } from "./weekParse";
import type { DateLineSettings } from "./types";
import type { DateMatch } from "./types";

declare const activeDocument: Document;

function getActiveDocument(): Document {
	return typeof activeDocument !== "undefined" ? activeDocument : document;
}

function anchorDayForWeekRow(
	calendarHost: HTMLElement,
	rowIndex: number,
): moment.Moment | null {
	const grid = calendarHost.querySelector(".days .datepicker-grid");
	if (!grid || rowIndex < 0) return null;
	const cell = grid.children[rowIndex * 7] as HTMLElement | undefined;
	const ts = cell?.dataset?.date;
	if (!ts) return null;
	const m = moment(Number(ts));
	return m.isValid() ? m : null;
}

function clearWeekRowHighlight(calendarHost: HTMLElement): void {
	calendarHost
		.querySelectorAll(".week-numbers .week.date-line-week-picked")
		.forEach((el) => el.classList.remove("date-line-week-picked"));
}

export class DateLinePicker {
	private onSubmit: (result: string) => void = () => {};
	private submitted = false;
	public isOpened = false;
	private pickerContainer!: HTMLDivElement;
	private pickerInput: HTMLInputElement | null = null;
	private timeInput: HTMLInputElement | null = null;
	private calendarHost!: HTMLDivElement;
	private datepicker: Datepicker | null = null;
	private inputAbort = new AbortController();
	private selectedIsoDate = "";
	private selectionKind: PickerSelectionKind = "date";
	private weekAnchor: moment.Moment | null = null;
	private initializingCalendar = false;
	public datetime!: DateMatch;
	public cursorPosition = 0;
	public closedByButton = false;
	public static escPressed = false;
	public static openedByButton = false;
	public static calendarShownOnce = false;
	public static enterPressed = false;

	constructor(private getSettings: () => DateLineSettings) {}

	updatePosition(pos: { top: number; left: number; bottom: number }): void {
		const el = this.pickerContainer;
		const margin = 8;
		el.style.position = "fixed";
		el.style.zIndex = "1000";

		const width = el.offsetWidth || 300;
		const height = el.offsetHeight || 340;

		let left = pos.left;
		let top = pos.bottom + margin;

		if (left + width > window.innerWidth - margin) {
			left = Math.max(margin, window.innerWidth - width - margin);
		}
		if (top + height > window.innerHeight - margin) {
			top = pos.top - height - margin;
		}
		if (top < margin) top = margin;

		el.style.left = `${left}px`;
		el.style.top = `${top}px`;
	}

	focus(): void {
		if (this.pickerInput) {
			setTimeout(() => this.pickerInput!.focus(), 200);
		}
	}

	close(): void {
		this.isOpened = false;
		this.inputAbort.abort();
		this.inputAbort = new AbortController();
		this.datepicker?.destroy();
		this.datepicker = null;
		this.weekAnchor = null;
		const doc = getActiveDocument();
		Array.from(doc.getElementsByClassName("date-line-picker")).forEach((el) =>
			el.remove(),
		);
	}

	respectSettingAndClose(): void {
		if (this.getSettings().autoApplyEdits) this.submitAndClose();
		else this.close();
	}

	private submitAndClose(): void {
		this.submit();
		this.close();
	}

	private initialSelectionKind(): PickerSelectionKind {
		return this.datetime.format.type === "WEEK" ? "week" : "date";
	}

	private effectiveWeekNumbers(settings: DateLineSettings): number {
		if (settings.weekNumbers !== 0) return settings.weekNumbers;
		return pickWeekFormatForOutput(settings) ? 1 : 0;
	}

	private pickedCalendarMoment(): moment.Moment | null {
		if (this.selectionKind === "week" && this.weekAnchor) {
			return this.weekAnchor.clone();
		}
		const picked = this.datepicker?.getDate() as Date | undefined;
		if (picked) return moment(picked);
		if (this.selectedIsoDate) return moment(this.selectedIsoDate, "YYYY-MM-DD");
		return null;
	}

	private buildFinalNoteText(): string {
		const { datetime } = this;
		if (datetime.format.type === "TIME") {
			return this.pickerInput?.value ?? "";
		}

		if (datetime.format.type === "DATETIME") {
			const picked = this.datepicker?.getDate() as Date | undefined;
			const datePart = picked
				? moment(picked).format("YYYY-MM-DD")
				: this.selectedIsoDate;
			const timePart = this.timeInput?.value || "00:00";
			if (!datePart) return "";
			return formatDatetimeNoteValue(
				`${datePart}T${timePart}`,
				this.getSettings(),
				datetime,
			);
		}

		const parsed = this.pickedCalendarMoment();
		if (!parsed?.isValid()) return "";

		const display = formatPickerDisplayValue(
			this.selectionKind,
			parsed,
			this.getSettings(),
			datetime,
		);
		return display ?? "";
	}

	submit(): void {
		if (this.submitted || DateLinePicker.escPressed || !this.isOpened) return;
		this.submitted = true;
		let noteText = this.buildFinalNoteText();
		if (noteText.length === 0) return;

		if (this.datetime.format.type === "TIME" && this.pickerInput) {
			noteText = this.pickerInput.value;
		}

		if (noteText === this.datetime.value) {
			return;
		}
		setTimeout(() => this.onSubmit(noteText), 0);
	}

	private onWeekNumberClick(weekEl: HTMLElement): void {
		const settings = this.getSettings();
		if (!pickWeekFormatForOutput(settings)) return;

		const weeks = weekEl.parentElement;
		if (!weeks) return;
		const rowIndex = Array.from(weeks.children).indexOf(weekEl);
		const anchor = anchorDayForWeekRow(this.calendarHost, rowIndex);
		if (!anchor) return;

		this.selectionKind = "week";
		this.weekAnchor = anchor;
		clearWeekRowHighlight(this.calendarHost);
		weekEl.classList.add("date-line-week-picked");

		if (settings.autoApplyEdits) {
			this.submitAndClose();
		}
	}

	private onCalendarDayPicked(): void {
		this.selectionKind = "date";
		this.weekAnchor = null;
		clearWeekRowHighlight(this.calendarHost);
	}

	private bindCalendarInteraction(): void {
		const settings = this.getSettings();
		const canPickWeek = !!pickWeekFormatForOutput(settings);

		this.calendarHost.addEventListener(
			"click",
			(ev) => {
				const weekEl = (ev.target as HTMLElement).closest(
					".week-numbers .week",
				) as HTMLElement | null;
				if (weekEl && canPickWeek) {
					ev.preventDefault();
					ev.stopPropagation();
					this.onWeekNumberClick(weekEl);
					return;
				}

				const cell = (ev.target as HTMLElement).closest(
					".datepicker-cell.day",
				) as HTMLElement | null;
				if (!cell || cell.classList.contains("disabled")) return;

				this.onCalendarDayPicked();
			},
			{ signal: this.inputAbort.signal, capture: true },
		);

		this.pickerInput?.addEventListener(
			"changeDate",
			() => {
				const picked = this.datepicker?.getDate() as Date | undefined;
				if (picked) {
					this.selectedIsoDate = moment(picked).format("YYYY-MM-DD");
				}
				if (this.initializingCalendar) return;
				if (settings.autoApplyEdits) {
					this.submitAndClose();
				}
			},
			{ signal: this.inputAbort.signal },
		);
	}

	private mountVanillaCalendar(initial: moment.Moment): void {
		const settings = this.getSettings();
		this.selectionKind = this.initialSelectionKind();
		this.weekAnchor =
			this.selectionKind === "week" && initial.isValid()
				? initial.clone().startOf("isoWeek")
				: null;

		ensureCalendarLocales(settings.calendarLanguage);
		this.calendarHost = this.pickerContainer.createDiv(
			"date-line-calendar-host",
		);
		const weekNumbers = this.effectiveWeekNumbers(settings);
		if (weekNumbers !== 0) {
			this.calendarHost.addClass("has-week-numbers");
		}

		this.pickerInput = this.calendarHost.createEl("input", {
			type: "text",
			cls: "date-line-datepicker-input",
			attr: { readonly: "true", tabindex: "-1" },
		});

		const options: DatepickerOptions = {
			language: settings.calendarLanguage,
			weekStart: settings.weekStart,
			weekNumbers,
			todayHighlight: settings.todayHighlight,
			format: "yyyy-mm-dd",
			container: this.calendarHost,
			autohide: false,
			maxView: 3,
		};

		try {
			this.datepicker = new Datepicker(this.pickerInput, options);
		} catch (err) {
			console.error("Date Line: kalender initialiseren mislukt", err);
			new Notice("Date Line: kalender kon niet geladen worden.");
			return;
		}

		this.bindCalendarInteraction();

		this.initializingCalendar = true;
		if (initial.isValid()) {
			this.datepicker.setDate(initial.toDate());
			this.selectedIsoDate = initial.format("YYYY-MM-DD");
		}

		window.setTimeout(() => {
			this.datepicker?.show();
			if (this.selectionKind === "week" && this.weekAnchor) {
				window.setTimeout(() => this.highlightWeekForAnchor(this.weekAnchor!), 0);
			}
			this.initializingCalendar = false;
		}, 0);
	}

	private highlightWeekForAnchor(anchor: moment.Moment): void {
		const iso = anchor.clone().startOf("isoWeek").valueOf();
		const grid = this.calendarHost.querySelector(".days .datepicker-grid");
		if (!grid) return;
		for (let row = 0; row < 6; row++) {
			const cell = grid.children[row * 7] as HTMLElement | undefined;
			const ts = cell?.dataset?.date;
			if (!ts) continue;
			if (moment(Number(ts)).startOf("isoWeek").valueOf() === iso) {
				const weekEl = this.calendarHost.querySelectorAll(
					".week-numbers .week",
				)[row];
				weekEl?.classList.add("date-line-week-picked");
				break;
			}
		}
	}

	open(
		pos: { top: number; left: number; right: number; bottom: number },
		datetime: DateMatch,
		onSubmit: (result: string) => void,
	): void {
		this.onSubmit = onSubmit;
		this.datetime = datetime;
		this.cursorPosition = datetime.from;
		this.closedByButton = false;
		this.submitted = false;
		this.selectedIsoDate = "";
		DateLinePicker.escPressed = false;
		DateLinePicker.enterPressed = false;

		const doc = getActiveDocument();
		this.close();
		this.pickerContainer = doc.body.createDiv("date-line-picker");
		this.pickerContainer.addClass("date-line-picker--open");

		const parsed =
			datetime.format.type === "TIME"
				? moment(datetime.value, ["hh:mm A", "HH:mm"], true)
				: parseDateOrWeek(datetime.value, datetime.format.formatToUser);

		if (datetime.format.type === "TIME") {
			this.pickerInput = this.pickerContainer.createEl("input");
			this.pickerInput.className = "date-line-picker-input";
			this.pickerInput.type = "time";
			this.pickerInput.value = parsed.isValid()
				? parsed.format(datetime.format.formatToPicker)
				: "";
		} else {
			this.mountVanillaCalendar(parsed);
			if (!this.datepicker) {
				this.close();
				return;
			}
			if (datetime.format.type === "DATETIME") {
				this.timeInput = this.pickerContainer.createEl("input", {
					cls: "date-line-picker-input date-line-time-input",
					attr: { type: "time" },
				});
				this.timeInput.value = parsed.isValid()
					? parsed.format("HH:mm")
					: "12:00";
			}
		}

		const actions = this.pickerContainer.createDiv("date-line-picker-actions");
		const acceptButton = actions.createEl("button", {
			cls: "date-line-picker-btn",
		});
		setIcon(acceptButton, "check");

		const cancelButton = actions.createEl("button", {
			cls: "date-line-picker-btn",
		});
		setIcon(cancelButton, "x");

		const buttonAbort = new AbortController();
		const acceptHandler = () => {
			if (!this.buildFinalNoteText()) {
				new Notice("Voer een geldige datum in");
			} else {
				DateLinePicker.enterPressed = true;
				this.submitAndClose();
				buttonAbort.abort();
			}
		};
		acceptButton.addEventListener("click", acceptHandler, {
			signal: buttonAbort.signal,
		});
		acceptButton.addEventListener("touchend", acceptHandler, {
			signal: buttonAbort.signal,
		});

		const cancelHandler = (event: Event) => {
			event.preventDefault();
			DateLinePicker.escPressed = true;
			this.close();
			buttonAbort.abort();
		};
		cancelButton.addEventListener("click", cancelHandler, {
			signal: buttonAbort.signal,
		});
		cancelButton.addEventListener("touchend", cancelHandler, {
			signal: buttonAbort.signal,
		});

		const keyHandler = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				event.preventDefault();
				acceptHandler();
			}
			if (event.key === "Escape") {
				DateLinePicker.escPressed = true;
				this.close();
			}
		};
		this.pickerContainer.addEventListener("keydown", keyHandler);

		if (datetime.format.type === "TIME" && Platform.isMobile && this.pickerInput) {
			const timeEl = this.pickerInput;
			timeEl.addEventListener("touchstart", (e) => e.preventDefault());
			timeEl.addEventListener("touchend", (e) => {
				e.preventDefault();
				(timeEl as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
			});
		}

		this.isOpened = true;
		DateLinePicker.calendarShownOnce = true;

		this.updatePosition(pos);
		requestAnimationFrame(() => this.updatePosition(pos));
	}
}

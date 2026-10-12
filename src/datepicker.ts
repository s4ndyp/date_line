import { moment, Notice, Platform, setIcon } from "obsidian";
import { Datepicker } from "vanillajs-datepicker";
import type { DatepickerOptions } from "vanillajs-datepicker/Datepicker";
import { ensureCalendarLocales } from "./calendarLocales";
import type { DateLineSettings } from "./types";
import type { DateMatch } from "./types";

declare const activeDocument: Document;

function getActiveDocument(): Document {
	return typeof activeDocument !== "undefined" ? activeDocument : document;
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

	private buildSubmitValue(): string {
		const { datetime } = this;
		if (datetime.format.type === "TIME") {
			return this.pickerInput?.value ?? "";
		}

		const picked = this.datepicker?.getDate() as Date | undefined;
		const datePart = picked
			? moment(picked).format("YYYY-MM-DD")
			: this.selectedIsoDate;

		if (datetime.format.type === "DATETIME") {
			const timePart = this.timeInput?.value || "00:00";
			if (!datePart) return "";
			return `${datePart}T${timePart}`;
		}

		return datePart;
	}

	submit(): void {
		if (this.submitted || DateLinePicker.escPressed || !this.isOpened) return;
		this.submitted = true;
		let submitValue = this.buildSubmitValue();
		if (submitValue.length === 0) return;

		if (this.datetime.format.type === "TIME" && this.pickerInput) {
			submitValue =
				moment().format("YYYY-MM-DD") + "T" + this.pickerInput.value;
		}

		if (
			moment(submitValue).format(this.datetime.format.formatToUser) ===
			this.datetime.value
		) {
			return;
		}
		setTimeout(() => this.onSubmit(submitValue), 0);
	}

	private mountVanillaCalendar(initial: moment.Moment): void {
		const settings = this.getSettings();
		ensureCalendarLocales(settings.calendarLanguage);
		this.calendarHost = this.pickerContainer.createDiv(
			"date-line-calendar-host",
		);
		if (settings.weekNumbers !== 0) {
			this.calendarHost.addClass("has-week-numbers");
		}

		// Zelfde patroon als Date Inserter: input + show(), niet inline in de editor
		this.pickerInput = this.calendarHost.createEl("input", {
			type: "text",
			cls: "date-line-datepicker-input",
			attr: { readonly: "true", tabindex: "-1" },
		});

		const options: DatepickerOptions = {
			language: settings.calendarLanguage,
			weekStart: settings.weekStart,
			weekNumbers: settings.weekNumbers,
			todayHighlight: settings.todayHighlight,
			// Intern altijd ISO; output blijft het formaat van de notitie (moment bij submit)
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

		this.pickerInput.addEventListener(
			"changeDate",
			() => {
				const picked = this.datepicker?.getDate() as Date | undefined;
				if (picked) {
					this.selectedIsoDate = moment(picked).format("YYYY-MM-DD");
				}
			},
			{ signal: this.inputAbort.signal },
		);

		if (initial.isValid()) {
			this.datepicker.setDate(initial.toDate());
			this.selectedIsoDate = initial.format("YYYY-MM-DD");
		}

		window.setTimeout(() => this.datepicker?.show(), 0);
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

		const parsed = moment(datetime.value, [
			"YYYY-MM-DD hh:mm A",
			"YYYY-MM-DDTHH:mm",
			"YYYY-MM-DD HH:mm",
			"YYYY-MM-DD",
			"DD-MM-YYYY HH:mm",
			"DD-MM-YYYY hh:mm A",
			"DD-MM-YYYY",
			"DD.MM.YYYY",
			"YYYY.MM.DD",
			"YYYY/MM/DD",
			"hh:mm A",
			"HH:mm",
		]);

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
			if (!this.buildSubmitValue()) {
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

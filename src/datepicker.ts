import {
	moment,
	Notice,
	Platform,
	setIcon,
} from "obsidian";
import type { DateMatch } from "./types";
import type { DateLineSettings } from "./types";

declare const activeDocument: Document;
function getActiveDocument(): Document {
	return typeof activeDocument !== "undefined" ? activeDocument : document;
}

export class DateLinePicker {
	private onSubmit: (result: string) => void = () => {};
	private submitted = false;
	public isOpened = false;
	private pickerContainer!: HTMLDivElement;
	private pickerInput!: HTMLInputElement;
	private viewContainer!: HTMLElement;
	public datetime!: DateMatch;
	public cursorPosition = 0;
	public closedByButton = false;
	public static escPressed = false;
	public static openedByButton = false;
	public static calendarShownOnce = false;
	public static enterPressed = false;

	constructor(private getSettings: () => DateLineSettings) {}

	updatePosition(pos: { top: number; left: number; bottom: number }): void {
		const left = pos.left - this.viewContainer.getBoundingClientRect().left;
		if (
			left + this.pickerContainer.offsetWidth >
			this.viewContainer.offsetWidth
		) {
			this.pickerContainer.style.left =
				left -
				(left +
					this.pickerContainer.offsetWidth -
					this.viewContainer.offsetWidth) +
				"px";
		} else {
			this.pickerContainer.style.left = left + "px";
		}

		const leafTop = this.viewContainer
			.closest(".workspace-leaf-content")!
			.getBoundingClientRect().top;
		if (pos.bottom - leafTop > this.viewContainer.offsetHeight) {
			this.pickerContainer.style.top =
				pos.top - leafTop - this.pickerContainer.offsetHeight + "px";
		} else {
			this.pickerContainer.style.top = pos.bottom - leafTop + "px";
		}
	}

	focus(): void {
		setTimeout(() => this.pickerInput.focus(), 200);
	}

	close(): void {
		const doc = getActiveDocument();
		const containers = doc.getElementsByClassName("date-line-picker");
		for (let i = 0; i < containers.length; i++) {
			containers[i].remove();
		}
		this.isOpened = false;
	}

	respectSettingAndClose(): void {
		if (this.getSettings().autoApplyEdits) this.submitAndClose();
		else this.close();
	}

	private submitAndClose(): void {
		this.submit();
		this.close();
	}

	submit(): void {
		if (this.submitted || DateLinePicker.escPressed || !this.isOpened) return;
		this.submitted = true;
		let submitValue = this.pickerInput.value;
		if (submitValue.length === 0) return;
		if (
			moment(submitValue).format(this.datetime.format.formatToUser) ===
			this.datetime.value
		) {
			return;
		}
		if (this.datetime.format.type === "TIME") {
			submitValue =
				moment().format("YYYY-MM-DD") + "T" + this.pickerInput.value;
		}
		setTimeout(() => this.onSubmit(submitValue), 0);
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
		DateLinePicker.escPressed = false;
		DateLinePicker.enterPressed = false;

		const doc = getActiveDocument();
		this.viewContainer = doc
			.querySelector(".workspace-leaf.mod-active")
			?.querySelector(".cm-editor") as HTMLElement;
		if (!this.viewContainer) {
			console.error("Date Line: editor container not found");
			return;
		}

		this.close();
		this.pickerContainer = this.viewContainer.createDiv("date-line-picker");
		this.pickerInput = this.pickerContainer.createEl("input");
		this.pickerInput.className = "date-line-picker-input";

		if (datetime.format.type === "TIME") this.pickerInput.type = "time";
		else if (datetime.format.type === "DATE") this.pickerInput.type = "date";
		else this.pickerInput.type = "datetime-local";

		this.pickerInput.value = moment(datetime.value, [
			"YYYY-MM-DD hh:mm A",
			"YYYY-MM-DDThh:mm",
			"YYYY-MM-DD",
			"DD-MM-YYYY HH:mm",
			"DD-MM-YYYY",
			"DD.MM.YYYY",
			"YYYY.MM.DD",
			"YYYY/MM/DD",
			"hh:mm A",
			"HH:mm",
		]).format(datetime.format.formatToPicker);

		const acceptButton = this.pickerContainer.createEl("button", {
			cls: "date-line-picker-btn",
		});
		setIcon(acceptButton, "check");

		const cancelButton = this.pickerContainer.createEl("button", {
			cls: "date-line-picker-btn",
		});
		setIcon(cancelButton, "x");

		const buttonAbort = new AbortController();
		const acceptHandler = () => {
			if (this.pickerInput.value === "") {
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

		this.pickerInput.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				if (this.pickerInput.value === "") {
					new Notice("Voer een geldige datum in");
				} else {
					DateLinePicker.enterPressed = true;
					this.submitAndClose();
				}
			}
			if (event.key === "Escape") {
				DateLinePicker.escPressed = true;
				this.close();
			}
		});

		this.pickerInput.addEventListener("blur", () => {
			setTimeout(() => {
				if (
					!this.submitted &&
					!DateLinePicker.escPressed &&
					!DateLinePicker.enterPressed &&
					this.getSettings().autoApplyEdits
				) {
					this.submit();
				}
			}, 300);
		});

		if (Platform.isMobile) {
			this.pickerInput.addEventListener("touchstart", (e) =>
				e.preventDefault(),
			);
			this.pickerInput.addEventListener("touchend", (e) => {
				e.preventDefault();
				(this.pickerInput as HTMLInputElement & { showPicker?: () => void })
					.showPicker?.();
			});
		}

		this.updatePosition(pos);
		this.isOpened = true;

		const settings = this.getSettings();
		if (settings.openCalendarImmediately && !DateLinePicker.calendarShownOnce) {
			if (Platform.isMobile) {
				this.pickerInput.focus();
				setTimeout(() => {
					(this.pickerInput as HTMLInputElement & { showPicker?: () => void })
						.showPicker?.();
					DateLinePicker.calendarShownOnce = true;
				}, 150);
			} else {
				this.focus();
				setTimeout(() => {
					(this.pickerInput as HTMLInputElement & { showPicker?: () => void })
						.showPicker?.();
					DateLinePicker.calendarShownOnce = true;
				}, 400);
			}
		}
	}
}

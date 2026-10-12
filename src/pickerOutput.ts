import { moment } from "obsidian";
import type { DateLineSettings, DateMatch } from "./types";

export type PickerSelectionKind = "date" | "week";

export function pickDateFormatForOutput(settings: DateLineSettings): string {
	if (settings.customDate1.enabled && settings.customDate1.format.trim()) {
		return settings.customDate1.format.trim();
	}
	if (settings.customDate2.enabled && settings.customDate2.format.trim()) {
		return settings.customDate2.format.trim();
	}
	return settings.preferredDateFormat;
}

export function pickWeekFormatForOutput(settings: DateLineSettings): string | null {
	if (settings.customWeek.enabled && settings.customWeek.format.trim()) {
		return settings.customWeek.format.trim();
	}
	return null;
}

export function formatNoteDateValue(
	parsed: moment.Moment,
	momentFormat: string,
): string {
	if (!parsed.isValid()) return "";
	return parsed.format(momentFormat);
}

export function formatNoteWeekValue(
	anchorDay: moment.Moment,
	momentFormat: string,
): string {
	if (!anchorDay.isValid()) return "";
	const m = anchorDay.clone().startOf("isoWeek");
	return m.format(momentFormat);
}

export function resolveDateOutputFormat(
	settings: DateLineSettings,
	original: DateMatch,
): string {
	if (original.format.type === "DATE") {
		if (settings.overrideFormatOnEdit) {
			return settings.preferredDateFormat;
		}
		return original.format.formatToUser;
	}
	return pickDateFormatForOutput(settings);
}

export function formatDatetimeNoteValue(
	isoDateTime: string,
	settings: DateLineSettings,
	original: DateMatch,
): string {
	const parsed = moment(isoDateTime);
	if (!parsed.isValid()) return original.value;
	if (settings.overrideFormatOnEdit) {
		const timePart = original.format.formatToUser.includes("A")
			? " hh:mm A"
			: " HH:mm";
		return parsed.format(settings.preferredDateFormat + timePart);
	}
	return parsed.format(original.format.formatToUser);
}

export function formatPickerDisplayValue(
	kind: PickerSelectionKind,
	parsed: moment.Moment,
	settings: DateLineSettings,
	original: DateMatch,
): string | null {
	if (kind === "week") {
		const weekFormat = pickWeekFormatForOutput(settings);
		if (!weekFormat) return null;
		return formatNoteWeekValue(parsed, weekFormat);
	}
	const dateFormat = resolveDateOutputFormat(settings, original);
	return formatNoteDateValue(parsed, dateFormat);
}

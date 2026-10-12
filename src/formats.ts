import {
	formatLooksLikeWeekNotation,
	momentFormatToMatchRegex,
} from "./customFormatRegex";
import type { CustomFormatField, DateFormat, DateLineSettings } from "./types";

function buildFromMomentFormat(
	momentFormat: string,
	patternId: string,
): DateFormat[] {
	const regex = momentFormatToMatchRegex(momentFormat);
	if (!regex) return [];

	const isWeek = formatLooksLikeWeekNotation(momentFormat);
	const type = isWeek ? "WEEK" : "DATE";

	return [
		{
			regex,
			formatToUser: momentFormat,
			formatToPicker: "YYYY-MM-DD",
			type,
			patternId,
		},
	];
}

const TIME_FORMATS: DateFormat[] = [
	{
		regex: /\d{1,2}:\d{1,2}( )?([apm]{2})/gi,
		formatToUser: "hh:mm A",
		formatToPicker: "HH:mm",
		type: "TIME",
		patternId: "time",
	},
	{
		regex: /\d{1,2}:\d{1,2}/g,
		formatToUser: "HH:mm",
		formatToPicker: "HH:mm",
		type: "TIME",
		patternId: "time",
	},
];

function addCustomField(
	formats: DateFormat[],
	field: CustomFormatField,
	id: string,
): void {
	if (!field.enabled || !field.format.trim()) return;
	formats.push(...buildFromMomentFormat(field.format.trim(), id));
}

export function getActiveFormats(settings: DateLineSettings): DateFormat[] {
	const formats: DateFormat[] = [];

	addCustomField(formats, settings.customDate1, "custom-date-1");
	addCustomField(formats, settings.customDate2, "custom-date-2");
	addCustomField(formats, settings.customWeek, "custom-week");

	if (settings.scanTime) {
		formats.push(...TIME_FORMATS);
	}

	return formats;
}

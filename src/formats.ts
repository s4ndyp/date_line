import { DATE_PATTERNS } from "./patterns";
import type { DateFormat, DateLineSettings } from "./types";

function separatorForMomentFormat(format: string): string {
	if (format.includes(".")) return "\\.";
	if (format.includes("/")) return "\\/";
	return "-";
}

function buildFormatsForPattern(
	momentFormat: string,
	patternId: string,
): DateFormat[] {
	const separator = separatorForMomentFormat(momentFormat);
	const datePart = `\\d{1,4}${separator}\\d{1,2}${separator}\\d{1,4}`;

	return [
		{
			regex: new RegExp(
				`${datePart} \\d{1,2}:\\d{1,2}( )?([apm]{2})`,
				"ig",
			),
			formatToUser: `${momentFormat} hh:mm A`,
			formatToPicker: "YYYY-MM-DDTHH:mm",
			type: "DATETIME",
			patternId,
		},
		{
			regex: new RegExp(`${datePart} \\d{1,2}:\\d{1,2}`, "g"),
			formatToUser: `${momentFormat} HH:mm`,
			formatToPicker: "YYYY-MM-DDTHH:mm",
			type: "DATETIME",
			patternId,
		},
		{
			regex: new RegExp(datePart, "g"),
			formatToUser: momentFormat,
			formatToPicker: "YYYY-MM-DD",
			type: "DATE",
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

export function getActiveFormats(settings: DateLineSettings): DateFormat[] {
	const enabled = new Set(settings.enabledPatternIds);
	const formats: DateFormat[] = [];

	for (const pattern of DATE_PATTERNS) {
		if (!enabled.has(pattern.id)) continue;
		formats.push(...buildFormatsForPattern(pattern.momentFormat, pattern.id));
	}

	if (enabled.has("time")) {
		formats.push(...TIME_FORMATS);
	}

	return formats;
}

export const TIME_PATTERN_OPTION = {
	id: "time",
	label: "Tijd (HH:mm of hh:mm AM/PM)",
} as const;

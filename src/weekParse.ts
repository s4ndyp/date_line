import { moment } from "obsidian";
import { formatLooksLikeWeekNotation } from "./customFormatRegex";

/** Parse waarde volgens Moment-formaat; weeknotaties via ISO-week waar nodig. */
export function parseDateOrWeek(value: string, momentFormat: string): moment.Moment {
	const strict = moment(value, momentFormat, true);
	if (strict.isValid()) return strict;

	if (formatLooksLikeWeekNotation(momentFormat)) {
		const loose = moment(value, momentFormat);
		if (loose.isValid()) return loose;

		const m = value.match(/(\d{1,2})\D+(\d{4})/);
		if (m) {
			const week = parseInt(m[1], 10);
			const year = parseInt(m[2], 10);
			if (week >= 1 && week <= 53) {
				const iso = moment()
					.isoWeekYear(year)
					.isoWeek(week)
					.startOf("isoWeek");
				if (iso.isValid()) return iso;
			}
		}
	}

	return moment(value, [
		"YYYY-MM-DD",
		"DD-MM-YYYY",
		"DD/MM/YYYY",
		"DD.MM.YYYY",
	], true);
}

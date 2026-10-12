import { Datepicker } from "vanillajs-datepicker";
import nlPack from "vanillajs-datepicker/locales/nl";

const TITLE_FORMAT = "MM y";

const enLocale = {
	en: {
		days: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		],
		daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
		months: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		],
		monthsShort: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		],
		today: "Today",
		clear: "Clear",
		titleFormat: TITLE_FORMAT,
		weekStart: 0,
		format: "yyyy-mm-dd",
	},
};

const nlLocale = {
	nl: {
		...nlPack.nl,
		titleFormat: TITLE_FORMAT,
	},
};

function patchTitleFormat(code: string): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const locales = Datepicker.locales as Record<string, any>;
	const loc = locales[code];
	if (loc && !loc.titleFormat) {
		loc.titleFormat = TITLE_FORMAT;
	}
}

/** Registreer locales (plugin load). */
export function registerCalendarLocales(): void {
	Object.assign(Datepicker.locales, enLocale, nlLocale);
	patchTitleFormat("en");
	patchTitleFormat("nl");
}

/**
 * vanillajs DaysView vereist locale.titleFormat; na destroy/reload kan die verdwijnen.
 * Roep vóór elke Datepicker-constructie aan.
 */
export function ensureCalendarLocales(language: string): void {
	registerCalendarLocales();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const locales = Datepicker.locales as Record<string, any>;
	const fallback = locales.en;
	for (const code of new Set(["en", "nl", language])) {
		if (!code) continue;
		if (!locales[code]) {
			locales[code] = { ...fallback, titleFormat: TITLE_FORMAT };
		} else if (!locales[code].titleFormat) {
			locales[code].titleFormat = TITLE_FORMAT;
		}
	}
}

export const CALENDAR_LANGUAGES: Record<string, string> = {
	en: "English",
	nl: "Nederlands",
};

registerCalendarLocales();

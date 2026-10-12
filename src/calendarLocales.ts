import { Datepicker } from "vanillajs-datepicker";
import nlPack from "vanillajs-datepicker/locales/nl";

/** vanillajs vereist titleFormat op locale (DaysView.switchLabelFormat). */
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
		titleFormat: "MM y",
		weekStart: 0,
		format: "yyyy-mm-dd",
	},
};

const nlLocale = {
	nl: {
		...nlPack.nl,
		titleFormat: "MM y",
	},
};

Object.assign(Datepicker.locales, enLocale, nlLocale);

export const CALENDAR_LANGUAGES: Record<string, string> = {
	en: "English",
	nl: "Nederlands",
};

import type { CustomFormatField, DateLineSettings } from "./types";
import { DATE_PATTERNS } from "./patterns";

/** Zelfde defaults als Shortag (hex + kleurpicker). */
export const DEFAULT_TEXT_COLOR_HEX = "#7c3aed";
export const DEFAULT_BACKGROUND_COLOR_HEX = "#ede9fe";

export const DEFAULT_CUSTOM_DATE1: CustomFormatField = {
	enabled: true,
	format: "DD/MM/YYYY",
};

export const DEFAULT_CUSTOM_DATE2: CustomFormatField = {
	enabled: false,
	format: "YYYY-MM-DD",
};

export const DEFAULT_CUSTOM_WEEK: CustomFormatField = {
	enabled: true,
	format: "[wk]WW/YYYY",
};

export const DEFAULT_SETTINGS: DateLineSettings = {
	customDate1: { ...DEFAULT_CUSTOM_DATE1 },
	customDate2: { ...DEFAULT_CUSTOM_DATE2 },
	customWeek: { ...DEFAULT_CUSTOM_WEEK },
	scanTime: false,
	showCalendarIcon: true,
	highlightDates: true,
	style: {
		textColor: DEFAULT_TEXT_COLOR_HEX,
		backgroundColor: DEFAULT_BACKGROUND_COLOR_HEX,
		fontWeight: "500",
		textDecoration: "none",
		borderRadius: "3px",
		padding: "0 2px",
	},
	ignoreCodeblocks: true,
	autoApplyEdits: true,
	overrideFormatOnEdit: false,
	preferredDateFormat: "YYYY-MM-DD",
	weekNumbers: 1,
	weekStart: 1,
	calendarLanguage: "nl",
	todayHighlight: true,
};

/** Migreer oude `enabledPatternIds` naar custom velden (eenmalig). */
export function migrateLegacyPatternSettings(
	data: Record<string, unknown> | null | undefined,
): Partial<DateLineSettings> | undefined {
	if (!data || !("enabledPatternIds" in data)) return undefined;
	if ("customDate1" in data) return undefined;

	const ids = data.enabledPatternIds;
	if (!Array.isArray(ids)) return undefined;

	const enabledPatterns = DATE_PATTERNS.filter((p) =>
		(ids as string[]).includes(p.id),
	);

	return {
		customDate1: {
			enabled: enabledPatterns.length > 0,
			format: enabledPatterns[0]?.momentFormat ?? DEFAULT_CUSTOM_DATE1.format,
		},
		customDate2: {
			enabled: enabledPatterns.length > 1,
			format: enabledPatterns[1]?.momentFormat ?? DEFAULT_CUSTOM_DATE2.format,
		},
		customWeek: { ...DEFAULT_CUSTOM_WEEK },
		scanTime: (ids as string[]).includes("time"),
	};
}

export function applyHighlightStyles(settings: DateLineSettings): void {
	const styleId = "date-line-dynamic-styles";
	let el = document.getElementById(styleId) as HTMLStyleElement | null;
	if (!el) {
		el = document.createElement("style");
		el.id = styleId;
		document.head.appendChild(el);
	}

	const s = settings.style;
	el.textContent = `
.cm-editor .date-line-highlight {
	color: ${s.textColor};
	background-color: ${s.backgroundColor};
	font-weight: ${s.fontWeight};
	text-decoration: ${s.textDecoration};
	border-radius: ${s.borderRadius};
	padding: ${s.padding};
}
.date-line-calendar-host {
	--date-line-highlight-fg: ${s.textColor};
	--date-line-highlight-bg: ${s.backgroundColor};
}`;
}

function mergeCustomField(
	defaults: CustomFormatField,
	partial: Partial<CustomFormatField> | undefined,
): CustomFormatField {
	if (!partial) return { ...defaults };
	return {
		enabled:
			typeof partial.enabled === "boolean" ? partial.enabled : defaults.enabled,
		format:
			typeof partial.format === "string" && partial.format.trim()
				? partial.format.trim()
				: defaults.format,
	};
}

export function normalizeSettings(
	raw: Partial<DateLineSettings> | null | undefined,
): DateLineSettings {
	const base = Object.assign({}, DEFAULT_SETTINGS, raw);
	if (raw?.style) {
		const merged = Object.assign({}, DEFAULT_SETTINGS.style, raw.style);
		base.style = {
			textColor: merged.textColor?.trim() || DEFAULT_SETTINGS.style.textColor,
			backgroundColor:
				merged.backgroundColor?.trim() ||
				DEFAULT_SETTINGS.style.backgroundColor,
			fontWeight: merged.fontWeight ?? DEFAULT_SETTINGS.style.fontWeight,
			textDecoration:
				merged.textDecoration ?? DEFAULT_SETTINGS.style.textDecoration,
			borderRadius: merged.borderRadius ?? DEFAULT_SETTINGS.style.borderRadius,
			padding: merged.padding ?? DEFAULT_SETTINGS.style.padding,
		};
	}
	base.customDate1 = mergeCustomField(
		DEFAULT_SETTINGS.customDate1,
		raw?.customDate1,
	);
	base.customDate2 = mergeCustomField(
		DEFAULT_SETTINGS.customDate2,
		raw?.customDate2,
	);
	base.customWeek = mergeCustomField(
		DEFAULT_SETTINGS.customWeek,
		raw?.customWeek,
	);
	if (typeof raw?.scanTime === "boolean") {
		base.scanTime = raw.scanTime;
	}
	return base;
}

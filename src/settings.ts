import type { DateLineSettings } from "./types";
import { DEFAULT_ENABLED_PATTERN_IDS } from "./patterns";

export const DEFAULT_SETTINGS: DateLineSettings = {
	enabledPatternIds: [...DEFAULT_ENABLED_PATTERN_IDS, "time"],
	showCalendarIcon: true,
	highlightDates: true,
	style: {
		textColor: "var(--text-accent)",
		backgroundColor: "rgba(var(--color-accent-rgb), 0.12)",
		fontWeight: "500",
		textDecoration: "none",
		borderRadius: "3px",
		padding: "0 2px",
	},
	ignoreCodeblocks: true,
	autoApplyEdits: true,
	openCalendarImmediately: true,
	overrideFormatOnEdit: false,
	preferredDateFormat: "YYYY-MM-DD",
};

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
}`;
}

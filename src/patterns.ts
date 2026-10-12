import type { DateFormatPattern } from "./types";

/** Vaste datumnotities die je in instellingen aan/uit kunt zetten. */
export const DATE_PATTERNS: DateFormatPattern[] = [
	{ id: "iso", label: "YYYY-MM-DD (ISO)", momentFormat: "YYYY-MM-DD", type: "DATE" },
	{ id: "eu-dots", label: "DD.MM.YYYY", momentFormat: "DD.MM.YYYY", type: "DATE" },
	{ id: "us-dash", label: "MM-DD-YYYY", momentFormat: "MM-DD-YYYY", type: "DATE" },
	{ id: "eu-dash", label: "DD-MM-YYYY", momentFormat: "DD-MM-YYYY", type: "DATE" },
	{ id: "us-dots", label: "MM.DD.YYYY", momentFormat: "MM.DD.YYYY", type: "DATE" },
	{ id: "iso-dots", label: "YYYY.MM.DD", momentFormat: "YYYY.MM.DD", type: "DATE" },
	{ id: "iso-slash", label: "YYYY/MM/DD", momentFormat: "YYYY/MM/DD", type: "DATE" },
	{ id: "eu-slash", label: "DD/MM/YYYY", momentFormat: "DD/MM/YYYY", type: "DATE" },
	{ id: "us-slash", label: "MM/DD/YYYY", momentFormat: "MM/DD/YYYY", type: "DATE" },
];

export const DEFAULT_ENABLED_PATTERN_IDS = DATE_PATTERNS.map((p) => p.id);

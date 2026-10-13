import type { DateLineSettings, StylePresetSlot } from "./types";

export const STYLE_PRESET_COUNT = 2;

export function emptyStylePresets(): (StylePresetSlot | null)[] {
	return Array.from({ length: STYLE_PRESET_COUNT }, (): StylePresetSlot | null => null);
}

export function captureStylePreset(settings: DateLineSettings): StylePresetSlot {
	return {
		highlightDates: settings.highlightDates,
		style: { ...settings.style },
		savedAt: Date.now(),
	};
}

export function applyStylePreset(
	settings: DateLineSettings,
	preset: StylePresetSlot,
): void {
	settings.highlightDates = preset.highlightDates;
	settings.style = { ...preset.style };
}

export function presetSummary(preset: StylePresetSlot | null): string {
	if (!preset) return "Leeg — sla eerst de huidige styling op.";
	const s = preset.style;
	const when = preset.savedAt
		? new Date(preset.savedAt).toLocaleString()
		: "onbekend moment";
	return `${s.textColor} / ${s.backgroundColor} · ${s.fontWeight} · radius ${s.borderRadius} · padding ${s.padding}${preset.highlightDates ? "" : " (highlight uit)"} — opgeslagen ${when}`;
}

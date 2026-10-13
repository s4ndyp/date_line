/** Geldige #RGB, #RRGGBB of #RRGGBBAA voor ColorComponent / CSS. */
const HEX_COLOR =
	/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function toPickerHex(
	value: string | undefined,
	fallback: string,
): string {
	if (!value || !HEX_COLOR.test(value.trim())) {
		return fallback;
	}
	const v = value.trim();
	if (v.length === 4) {
		const r = v[1];
		const g = v[2];
		const b = v[3];
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}
	return v.toLowerCase();
}

export function isHexColor(value: string): boolean {
	return HEX_COLOR.test(value.trim());
}

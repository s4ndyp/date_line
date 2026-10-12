const TOKEN_REGEX =
	/(\[[^\]]*\]|YYYY|YY|GGGG|GG|WW|W|MM|M|DD|D|HH|H|mm|m|ss|s|A|a)/g;

function escapeRegexLiteral(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenToRegex(token: string): string {
	if (token.startsWith("[") && token.endsWith("]")) {
		return escapeRegexLiteral(token.slice(1, -1));
	}
	switch (token) {
		case "YYYY":
		case "GGGG":
			return "\\d{4}";
		case "YY":
		case "GG":
			return "\\d{2}";
		case "MM":
			return "(?:0[1-9]|1[0-2])";
		case "M":
			return "(?:[1-9]|1[0-2])";
		case "DD":
			return "(?:0[1-9]|[12]\\d|3[01])";
		case "D":
			return "(?:[1-9]|[12]\\d|3[01])";
		case "WW":
			return "(?:0[1-9]|[1-4]\\d|5[0-3])";
		case "W":
			return "(?:[1-9]|[1-4]\\d|5[0-3])";
		case "HH":
			return "(?:[01]\\d|2[0-3])";
		case "H":
			return "(?:\\d{1,2})";
		case "mm":
			return "(?:[0-5]\\d)";
		case "m":
			return "(?:\\d{1,2})";
		case "ss":
			return "(?:[0-5]\\d)";
		case "s":
			return "(?:\\d{1,2})";
		case "A":
		case "a":
			return "(?:[AaPp][Mm])";
		default:
			return escapeRegexLiteral(token);
	}
}

/** Bouwt een RegExp om tokens in notities te vinden (Moment-notatie). */
export function momentFormatToMatchRegex(momentFormat: string): RegExp | null {
	const trimmed = momentFormat.trim();
	if (!trimmed) return null;

	const parts: string[] = [];
	let lastIndex = 0;
	const re = new RegExp(TOKEN_REGEX.source, "g");
	let match: RegExpExecArray | null;

	while ((match = re.exec(trimmed)) !== null) {
		if (match.index > lastIndex) {
			parts.push(escapeRegexLiteral(trimmed.slice(lastIndex, match.index)));
		}
		parts.push(tokenToRegex(match[1]));
		lastIndex = match.index + match[1].length;
	}
	if (lastIndex < trimmed.length) {
		parts.push(escapeRegexLiteral(trimmed.slice(lastIndex)));
	}
	if (parts.length === 0) return null;

	try {
		return new RegExp(parts.join(""), "gi");
	} catch {
		return null;
	}
}

export function formatLooksLikeWeekNotation(momentFormat: string): boolean {
	const stripped = momentFormat.replace(/\[[^\]]*\]/g, "");
	const hasWeek = /WW|(?:^|[^W])W(?:[^W]|$)/.test(stripped);
	const hasDay = /DD|(?:^|[^D])D(?:[^D]|$)/.test(stripped);
	return hasWeek && !hasDay;
}

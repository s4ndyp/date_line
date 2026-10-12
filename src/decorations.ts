import {
	Decoration,
	DecorationSet,
	WidgetType,
} from "@codemirror/view";
import { setIcon } from "obsidian";
import type { DateMatch } from "./types";
import type { DateLineSettings } from "./types";

class CalendarButtonWidget extends WidgetType {
	constructor(readonly dateFrom: number) {
		super();
	}

	toDOM(): HTMLElement {
		const span = document.createElement("span");
		span.className = "date-line-calendar-btn";
		span.dataset.dateLineFrom = String(this.dateFrom);
		span.setAttribute("aria-label", "Datum wijzigen");
		setIcon(span, "calendar");
		return span;
	}
	ignoreEvent(): boolean {
		return false;
	}
	eq(other: CalendarButtonWidget): boolean {
		return other.dateFrom === this.dateFrom;
	}
}

export function buildDecorations(
	matches: DateMatch[],
	settings: DateLineSettings,
): DecorationSet {
	const items: ReturnType<Decoration["range"]>[] = [];

	for (const match of matches) {
		if (settings.highlightDates && match.format.type !== "TIME") {
			items.push(
				Decoration.mark({ class: "date-line-highlight" }).range(
					match.from,
					match.to,
				),
			);
		}

		if (
			settings.showCalendarIcon &&
			(match.format.type === "DATE" ||
				match.format.type === "DATETIME" ||
				match.format.type === "WEEK")
		) {
			items.push(
				Decoration.widget({
					widget: new CalendarButtonWidget(match.from),
					side: -1,
				}).range(match.from),
			);
		}
	}

	return Decoration.set(items, true);
}

export type DateTokenType = "DATE" | "DATETIME" | "TIME";

export interface DateFormatPattern {
	id: string;
	label: string;
	momentFormat: string;
	type: DateTokenType;
}

export interface DateFormat {
	regex: RegExp;
	formatToUser: string;
	formatToPicker: string;
	type: DateTokenType;
	patternId: string;
}

export interface DateMatch {
	from: number;
	to: number;
	value: string;
	format: DateFormat;
}

export interface DateStyleSettings {
	textColor: string;
	backgroundColor: string;
	fontWeight: string;
	textDecoration: string;
	borderRadius: string;
	padding: string;
}

export interface DateLineSettings {
	enabledPatternIds: string[];
	showCalendarIcon: boolean;
	highlightDates: boolean;
	style: DateStyleSettings;
	ignoreCodeblocks: boolean;
	autoApplyEdits: boolean;
	openCalendarImmediately: boolean;
	overrideFormatOnEdit: boolean;
	preferredDateFormat: string;
}

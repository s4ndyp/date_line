export type DateTokenType = "DATE" | "DATETIME" | "TIME" | "WEEK";

export interface CustomFormatField {
	enabled: boolean;
	/** Moment.js-notatie, bijv. DD/MM/YYYY of [wk]WW/YYYY */
	format: string;
}

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
	customDate1: CustomFormatField;
	customDate2: CustomFormatField;
	customWeek: CustomFormatField;
	scanTime: boolean;
	showCalendarIcon: boolean;
	highlightDates: boolean;
	style: DateStyleSettings;
	ignoreCodeblocks: boolean;
	autoApplyEdits: boolean;
	overrideFormatOnEdit: boolean;
	preferredDateFormat: string;
	/** 0 = uit; 1 = ISO 8601; zie Date Inserter / vanillajs-datepicker */
	weekNumbers: number;
	weekStart: number;
	calendarLanguage: string;
	todayHighlight: boolean;
}

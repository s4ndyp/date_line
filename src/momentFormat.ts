/** Zet Moment.js-notatie om naar vanillajs-datepicker-notatie (alleen datum-tokens). */
export function momentFormatToDatepicker(momentFormat: string): string {
	return momentFormat
		.replace(/YYYY/g, "yyyy")
		.replace(/YY/g, "yy")
		.replace(/DD/g, "dd")
		.replace(/D/g, "d")
		.replace(/MM/g, "mm")
		.replace(/M/g, "m");
}

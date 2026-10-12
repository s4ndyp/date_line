declare module "*.css" {
	const css: string;
	export default css;
}

declare module "vanillajs-datepicker/locales/*" {
	const locale: Record<string, object>;
	export default locale;
}

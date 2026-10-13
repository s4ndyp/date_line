import {
	App,
	ColorComponent,
	MomentFormatComponent,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import { CALENDAR_LANGUAGES } from "./calendarLocales";
import { isHexColor, toPickerHex } from "./colorUtils";
import {
	DEFAULT_BACKGROUND_COLOR_HEX,
	DEFAULT_TEXT_COLOR_HEX,
} from "./settings";
import type DateLinePlugin from "../main";

const WEEK_START_OPTIONS: Record<string, string> = {
	"0": "Zondag",
	"1": "Maandag",
	"2": "Dinsdag",
	"3": "Woensdag",
	"4": "Donderdag",
	"5": "Vrijdag",
	"6": "Zaterdag",
};

const WEEK_NUMBER_OPTIONS: Record<string, string> = {
	"0": "Uit",
	"1": "ISO 8601",
	"2": "Westers (traditioneel)",
	"3": "Midden-Oosten",
	"4": "Automatisch (via weekstart)",
};

export class DateLineSettingTab extends PluginSettingTab {
	plugin: DateLinePlugin;

	constructor(app: App, plugin: DateLinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h3", { text: "Datumformaten scannen" });
		containerEl.createEl("p", {
			cls: "setting-item-description",
			text: "Moment.js-notatie. Vaste tekst tussen vierkante haken, bijv. [wk] voor wk12/2026.",
		});

		this.addCustomFormatSetting(
			"Datumfilter 1",
			"customDate1",
			"DD/MM/YYYY",
		);
		this.addCustomFormatSetting(
			"Datumfilter 2",
			"customDate2",
			"YYYY-MM-DD",
		);
		this.addCustomFormatSetting(
			"Weeknotatie",
			"customWeek",
			"[wk]WW/YYYY",
			"Weeknummers (WW of W) zonder dag. In de picker kun je op een weeknummer klikken om naar weeknotatie te wisselen.",
		);

		new Setting(containerEl)
			.setName("Tijd scannen")
			.setDesc("Herken losse tijden zoals 14:30 of 2:30 pm.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.scanTime)
					.onChange(async (v) => {
						this.plugin.settings.scanTime = v;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h3", { text: "Weergave" });

		new Setting(containerEl)
			.setName("Kalendericoon tonen")
			.setDesc("Klein kalenderlogo vóór elke herkende datum of week.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showCalendarIcon)
					.onChange(async (v) => {
						this.plugin.settings.showCalendarIcon = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Datums highlighten")
			.setDesc("Pas eigen styling toe op herkende datums en weeknotaties.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.highlightDates)
					.onChange(async (v) => {
						this.plugin.settings.highlightDates = v;
						await this.plugin.saveSettings();
					}),
			);

		this.addStyleColorSetting(
			"Tekstkleur",
			"textColor",
			DEFAULT_TEXT_COLOR_HEX,
			"Zoals Shortag: kleur via het rondje of hex (bijv. #7c3aed). Ook CSS-waarden mogelijk.",
		);
		this.addStyleColorSetting(
			"Achtergrondkleur",
			"backgroundColor",
			DEFAULT_BACKGROUND_COLOR_HEX,
			"Achtergrond voor highlights in de editor én geselecteerde dag/week in de picker.",
		);

		new Setting(containerEl)
			.setName("Letterdikte")
			.addText((text) =>
				text
					.setPlaceholder("500")
					.setValue(this.plugin.settings.style.fontWeight)
					.onChange(async (v) => {
						this.plugin.settings.style.fontWeight = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Tekstdecoratie")
			.setDesc("Bijv. underline, none")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.style.textDecoration)
					.onChange(async (v) => {
						this.plugin.settings.style.textDecoration = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Afronding (border-radius)")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.style.borderRadius)
					.onChange(async (v) => {
						this.plugin.settings.style.borderRadius = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Padding")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.style.padding)
					.onChange(async (v) => {
						this.plugin.settings.style.padding = v;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h3", { text: "Kalender" });

		new Setting(containerEl)
			.setName("Weeknummers")
			.setDesc("Toon weeknummers in de kalender (zoals Date Inserter).")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(WEEK_NUMBER_OPTIONS)
					.setValue(String(this.plugin.settings.weekNumbers))
					.onChange(async (v) => {
						this.plugin.settings.weekNumbers = parseInt(v, 10) || 0;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Week start")
			.setDesc("Eerste dag van de week in de kalender.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(WEEK_START_OPTIONS)
					.setValue(String(this.plugin.settings.weekStart))
					.onChange(async (v) => {
						this.plugin.settings.weekStart = parseInt(v, 10) || 0;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Kalendertaal")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(CALENDAR_LANGUAGES)
					.setValue(this.plugin.settings.calendarLanguage)
					.onChange(async (v) => {
						this.plugin.settings.calendarLanguage = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Vandaag markeren")
			.setDesc(
				"Vandaag in het raster en de huidige week in de weeknummerkolom (accenttekst).",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.todayHighlight)
					.onChange(async (v) => {
						this.plugin.settings.todayHighlight = v;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h3", { text: "Picker & bewerken" });

		new Setting(containerEl)
			.setName("Codeblokken negeren")
			.setDesc("Geen datums detecteren in ``` code ``` of `inline code`.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.ignoreCodeblocks)
					.onChange(async (v) => {
						this.plugin.settings.ignoreCodeblocks = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Automatisch toepassen")
			.setDesc(
				"Wijziging direct opslaan bij sluiten van de picker (vinkje of sluiten).",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoApplyEdits)
					.onChange(async (v) => {
						this.plugin.settings.autoApplyEdits = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Formaat overschrijven bij bewerken")
			.setDesc(
				"Vervang bewerkte datums door je voorkeursformaat (anders blijft het originele formaat).",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.overrideFormatOnEdit)
					.onChange(async (v) => {
						this.plugin.settings.overrideFormatOnEdit = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Voorkeursdatumformaat")
			.setDesc("Gebruikt bij overschrijven en voor nieuwe datums via het commando.")
			.addMomentFormat((component: MomentFormatComponent) => {
				component
					.setDefaultFormat("YYYY-MM-DD")
					.setValue(this.plugin.settings.preferredDateFormat)
					.onChange(async (value) => {
						this.plugin.settings.preferredDateFormat = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private addCustomFormatSetting(
		name: string,
		key: "customDate1" | "customDate2" | "customWeek",
		placeholder: string,
		desc?: string,
	): void {
		const setting = new Setting(this.containerEl)
			.setName(name)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings[key].enabled)
					.onChange(async (on) => {
						this.plugin.settings[key].enabled = on;
						await this.plugin.saveSettings();
					}),
			)
			.addMomentFormat((component: MomentFormatComponent) => {
				component
					.setDefaultFormat(placeholder)
					.setValue(this.plugin.settings[key].format)
					.onChange(async (value) => {
						this.plugin.settings[key].format = value;
						await this.plugin.saveSettings();
					});
			});

		if (desc) {
			setting.setDesc(desc);
		}
	}

	private addStyleColorSetting(
		name: string,
		key: "textColor" | "backgroundColor",
		fallbackHex: string,
		desc?: string,
	): void {
		const setting = new Setting(this.containerEl).setName(name);
		if (desc) setting.setDesc(desc);

		let pickerRef: ColorComponent | undefined;
		let textRef: TextComponent | undefined;

		setting.addColorPicker((picker) => {
			pickerRef = picker;
			picker
				.setValue(
					toPickerHex(this.plugin.settings.style[key], fallbackHex),
				)
				.onChange(async (hex) => {
					this.plugin.settings.style[key] = hex;
					textRef?.setValue(hex);
					await this.plugin.saveSettings();
				});
		});

		setting.addText((text) => {
			textRef = text;
			text
				.setPlaceholder(fallbackHex)
				.setValue(this.plugin.settings.style[key])
				.onChange(async (raw) => {
					const trimmed = raw.trim();
					if (!trimmed) return;
					this.plugin.settings.style[key] = trimmed;
					if (isHexColor(trimmed)) {
						const hex = toPickerHex(trimmed, fallbackHex);
						this.plugin.settings.style[key] = hex;
						pickerRef?.setValue(hex);
						text.setValue(hex);
					}
					await this.plugin.saveSettings();
				});
		});
	}
}

import {
	App,
	MomentFormatComponent,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { DATE_PATTERNS } from "./patterns";
import { TIME_PATTERN_OPTION } from "./formats";
import { CALENDAR_LANGUAGES } from "./calendarLocales";
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
			text: "Kies welke datum- en tijdnotaties in je notities herkend worden.",
		});

		const togglePattern = (id: string, label: string) => {
			new Setting(containerEl)
				.setName(label)
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.enabledPatternIds.includes(id))
						.onChange(async (on) => {
							const ids = new Set(this.plugin.settings.enabledPatternIds);
							if (on) ids.add(id);
							else ids.delete(id);
							this.plugin.settings.enabledPatternIds = [...ids];
							await this.plugin.saveSettings();
						}),
				);
		};

		for (const pattern of DATE_PATTERNS) {
			togglePattern(pattern.id, pattern.label);
		}
		togglePattern(TIME_PATTERN_OPTION.id, TIME_PATTERN_OPTION.label);

		containerEl.createEl("h3", { text: "Weergave" });

		new Setting(containerEl)
			.setName("Kalendericoon tonen")
			.setDesc("Klein kalenderlogo vóór elke herkende datum.")
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
			.setDesc("Pas eigen styling toe op herkende datums in de editor.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.highlightDates)
					.onChange(async (v) => {
						this.plugin.settings.highlightDates = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Tekstkleur")
			.addText((text) =>
				text
					.setPlaceholder("var(--text-accent)")
					.setValue(this.plugin.settings.style.textColor)
					.onChange(async (v) => {
						this.plugin.settings.style.textColor = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Achtergrondkleur")
			.addText((text) =>
				text
					.setPlaceholder("rgba(var(--color-accent-rgb), 0.12)")
					.setValue(this.plugin.settings.style.backgroundColor)
					.onChange(async (v) => {
						this.plugin.settings.style.backgroundColor = v;
						await this.plugin.saveSettings();
					}),
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
}

# Date Line (Obsidian plugin)

Herken datums in je Markdown-notities, geef ze een eigen stijl, en wijzig ze met een kalendericoon en native datum-picker.

Geïnspireerd door de community-plugin [Datepicker](https://github.com/joycode-hub/datepicker-plugin), maar opnieuw opgebouwd met configureerbare scan-formaten en styling.

## Functies

- **Datumherkenning** in de editor (zichtbaar gebied) voor veelgebruikte notaties (ISO, NL/EU punten en streepjes, US, slashes, optioneel tijd).
- **Kalendericoon** vóór elke herkende datum; klik om te bewerken.
- **Highlight-styling** (kleur, achtergrond, letterdikte, …) instelbaar in plugin-instellingen.
- **Formaten kiezen** welke patronen gescand worden (per formaat aan/uit).
- Codeblokken optioneel overslaan.

## Ontwikkeling

```bash
npm install
npm run build
```

Kopieer `main.js`, `manifest.json` en `styles.css` naar `.obsidian/plugins/date-line/` in je vault, of symlink deze map.

```bash
npm run dev   # watch mode
```

## Instellingen

Open **Instellingen → Community plugins → Date Line**:

- Datumformaten om te scannen
- Weergave (icoon, highlight, CSS-waarden)
- Picker-gedrag (auto-toepassen, kalender direct openen, formaat overschrijven)

## Commando

**Date Line: Datum op cursor bewerken** — opent de picker voor de datum onder de cursor.

## Licentie

MIT

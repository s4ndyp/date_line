# Date Line (Obsidian plugin)

Herken datums in je Markdown-notities, geef ze een eigen stijl, en wijzig ze met een kalendericoon en native datum-picker.

Geïnspireerd door de community-plugin [Datepicker](https://github.com/joycode-hub/datepicker-plugin), maar opnieuw opgebouwd met configureerbare scan-formaten en styling.

## Functies

- **Datumherkenning** via twee vrij instelbare Moment-formaten (bijv. `DD/MM/YYYY`), plus een **weeknotatie** (bijv. `[wk]WW/YYYY` → `wk12/2026`), en optioneel tijd.
- **Kalendericoon** vóór elke herkende datum; klik om te bewerken.
- **Highlight-styling** (kleur, achtergrond, letterdikte, …) instelbaar in plugin-instellingen.
- **Filters aan/uit** per datum- of weekveld; vaste tekst in Moment tussen `[ ]`, bijv. `[wk]`.
- Codeblokken optioneel overslaan.
- **Inline kalender** (vanillajs-datepicker, zoals Date Inserter) met optionele **weeknummers**, weekstart en taal. Klik op een **weeknummer** in de picker voor weeknotatie (bv. `wk42/2026`), of op een dag voor datumnotatie.

## Ontwikkeling (lokaal)

```bash
npm install
npm run build
```

Kopieer `main.js`, `manifest.json` en `styles.css` naar `.obsidian/plugins/date-line/` in je vault, of symlink deze map.

```bash
npm run dev   # watch mode
```

## Build via GitHub Actions

In `.github/workflows/` staan twee workflows:

| Workflow | Wanneer | Wat |
|----------|---------|-----|
| **build.yml** | Elke push/PR naar `main` | `npm ci` + `npm run build` (controleert dat de code compileert). Artefacten: `main.js`, manifest, CSS. |
| **release.yml** | Elke **push naar `main`** | Leest `version` uit `manifest.json`. Bestaat die release op GitHub nog niet → bouwt en publiceert automatisch tag + release. |

**Nieuwe release na merge (automatisch):**

1. Verhoog `version` in **`manifest.json`** en voeg dezelfde sleutel toe in **`versions.json`** (Obsidian-compat).
2. Merge naar `main`.
3. GitHub Actions maakt release **`x.y.z`** als die nog niet bestaat (geen handmatige tag nodig).

Handmatig taggen kan nog steeds, maar is niet meer vereist.

`main.js` staat bewust **niet** in git (`.gitignore`) — alleen TypeScript-bron. Obsidian heeft het gebundelde `main.js` nodig; dat komt uit je lokale `npm run build` of uit een GitHub Release.

## Installeren met BRAT (alles van GitHub)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (*Beta Reviewers Auto-update Tool*) installeert community-plugins die (nog) niet in de officiële catalog staan, rechtstreeks van GitHub.

### Eenmalig BRAT zelf installeren

1. Obsidian → **Instellingen → Community plugins → Browse**
2. Zoek **BRAT**, installeer en schakel in.

### Date Line toevoegen

1. Command palette (`Ctrl/Cmd+P`) → **BRAT: Add a beta plugin for testing**
2. Vul in: `s4ndyp/date_line` (of de volledige URL `https://github.com/s4ndyp/date_line`)
3. Bevestig.

**Aanbevolen: via GitHub Release (werkt met deze repo)**

BRAT kijkt of er een **Release** is en downloadt daar `main.js`, `manifest.json` en `styles.css`. Zorg dat je minstens één tag/release hebt (zie hierboven). Daarna:

- **BRAT: Check for updates to all beta plugins** — haalt nieuwere releases op.

**Alternatief: direct van branch `main`**

Alleen als `main.js` **op GitHub op die branch staat**. In dit project zit `main.js` niet in git; dan werkt “main branch” **niet** tenzij je een workflow toevoegt die builds naar `main` pusht (meestal niet gewenst). Gebruik daarom releases.

### Na installatie

- Plugin-map in je vault: `.obsidian/plugins/date-line/` (id uit `manifest.json`)
- Schakel **Date Line** in onder Community plugins
- Optioneel: BRAT-instellingen → auto-update voor beta-plugins

### Handmatig van Release (zonder BRAT)

1. Open GitHub → **Releases** → nieuwste release
2. Download `main.js`, `manifest.json`, `styles.css`
3. Plaats in `.obsidian/plugins/date-line/` en herstart Obsidian

## Instellingen

Open **Instellingen → Community plugins → Date Line**:

- Datumformaten om te scannen
- Weergave (icoon, highlight, CSS-waarden)
- Picker-gedrag (auto-toepassen, kalender direct openen, formaat overschrijven)

## Commando

**Date Line: Datum op cursor bewerken** — opent de picker voor de datum onder de cursor.

## Licentie

MIT

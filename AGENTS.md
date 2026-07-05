# AGENTS.md — abivio.de

## Projektziel
abivio.de ist eine KI-gestützte Studienempfehlungsplattform für deutsche Abiturienten und Fachabiturienten mit Studienwunsch.
Der aktuelle Fokus liegt auf **Deutschland** und ausschließlich **Studium** (Bachelor/erststudium).
Langfristig ist Europa/International vorgesehen, aber nicht im MVP.

## Strategie
Detaillierter Deutschland-Fokusplan in `docs/strategy.md`.

### Zielgruppe
- **Primär:** Gymnasialabsolventen (Abiturienten)
- **Sekundär:** Fachabiturienten mit Studienabsicht
- **Nicht im Fokus:** Berufsschulabsolventen ohne Hochschulreife, Studienwechsler, Master-Interessenten, internationale Bewerber

## Aktueller Status
- Domain `abivio.de` ist bereits registriert.
- MVP ist live auf **https://abivio.pages.dev** (Cloudflare Pages Preview).
- MVP-Ziel erreicht: Soft-Launch mit Landingpage + Waitlist + interaktivem Quiz für Studienempfehlungen.
- Eigene Domain `abivio.de` muss noch im Cloudflare-Dashboard als Custom Domain verbunden werden.
- Monetarisierung ist noch offen und wird nach Launch entschieden.

## Technologie-Stack
- **Frontend:** Statische HTML/CSS/JS-Seiten, deployed auf **Cloudflare Pages**.
- **Backend:** **Cloudflare Pages Functions** mit **Hono** (TypeScript) unter `functions/api/`.
- **Datenbank:** **Cloudflare D1** (SQLite).
- **Deployment:** `wrangler` CLI.

## Architektur
```
frontend/         -> Cloudflare Pages (statische Assets)
functions/api/    -> Cloudflare Pages Functions (API-Endpunkte via Hono)
db/               -> D1 Schema + Seed-Daten
scripts/          -> Hilfsskripte für Migrationen/Seeding
wrangler.toml     -> Cloudflare-Konfiguration
```

## API-Endpunkte
- `POST /api/waitlist` — E-Mail für Waitlist speichern
- `POST /api/quiz` — Quiz-Antworten speichern und Empfehlungen berechnen
- `GET /api/recommendations?session_id=...` — Empfehlungen abrufen
- `GET /api/programs` — Liste aller Studiengänge (für interne Zwecke)

## Datenstrategie
- **MVP:** Regelbasiertes Matching auf einem kuratierten Seed-Datensatz deutscher Studiengänge.
- **Zukunft:** LLM-gestützte Empfehlungen (RAG über Studiengangsdaten + natürlichsprachliche Begründungen).
- Mögliche externe Datenquellen für später:
  - Hochschulkompass (alle deutschen Studiengänge)
  - BERUFENET API (Berufs- und Ausbildungsdaten)
  - JOBBÖRSE API (Stellenmarkt)

## Coding Conventions
- TypeScript für Worker-Code.
- Einfaches, wartbares Vanilla-JS im Frontend (kein Framework im MVP).
- Mobile-first CSS mit CSS-Variablen für Branding.
- Keine Hardcoded Secrets — Umgebungsvariablen über `wrangler secret`.
- Deutsche Sprache im UI, Code auf Englisch.

## Wichtige Hinweise
- Der Fokus liegt auf **Schnelligkeit**: Minimaler, funktionierender MVP vor der TUM-Frist und weiteren Bewerbungsfristen.
- Jegliche Änderungen an Architektur oder Tech-Stack sollten in dieser Datei dokumentiert werden.

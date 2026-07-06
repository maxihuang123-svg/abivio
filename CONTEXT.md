# CONTEXT.md — abivio.de

Aktueller Projektstand für den nächsten Chat. Diese Datei sollte am Ende jeder Sitzung aktualisiert werden.

## Fokus
- MVP für abivio.de ist live auf https://abivio.pages.dev
- Datenbasis von 56 auf 200 Studiengänge erweitert und in Cloudflare D1 deployed
- Manuelle Kuratierung + Mock-LLM-Enrichment für Beschreibungen/Tags

## Zuletzt erledigt
- 200 Studiengänge in `db/programs_200_raw.json` generiert (Fachrichtungen verteilt)
- Mit `scripts/enrich-programs.js` angereichert → `db/programs_200_enriched.json`
- `scripts/generate-programs-seed.js` erstellt, wandelt JSON in D1-kompatibles SQL um (char()-Encoding für Umlaute)
- SQL-Seed `db/seed_200.sql` erfolgreich auf Remote-D1 (`abivio-db`) angewendet
- API-Endpunkte getestet:
  - GET /api/programs liefert 200 Programme
  - POST /api/quiz berechnet Empfehlungen korrekt
  - GET /api/recommendations?session_id=... gibt gespeicherte Empfehlungen zurück

## Architektur & Tech-Stack
- Frontend: statische HTML/CSS/JS unter `frontend/`, deployed auf Cloudflare Pages
- Backend: Hono-Worker unter `functions/api/[[route]].ts` (Cloudflare Pages Functions)
- Datenbank: Cloudflare D1 (SQLite), Binding `DB`, Name `abivio-db`
- Deployment: `wrangler` CLI

## Wichtige Dateien
- `db/schema.sql` — D1-Schema
- `db/programs_200_raw.json` — rohe 200-Programm-Liste
- `db/programs_200_enriched.json` — mit Tags/Beschreibungen angereichert
- `db/seed_200.sql` — D1-Seed für 200 Programme
- `scripts/generate-programs-200.js` — generiert die 200-Programm-Liste
- `scripts/enrich-programs.js` — LLB/Mock-Enrichment
- `scripts/generate-programs-seed.js` — JSON → D1 SQL
- `functions/api/[[route]].ts` — Hono API
- `AGENTS.md` — Projekt- und Coding-Conventions

## Bekannte Einschränkungen & Workarounds
- Kein OpenAI-API-Key verfügbar → Enrichment läuft im Mock-Modus (generische, aber passende Beschreibungen/Tags)
- D1 interpretiert UTF-8-Literale beim `wrangler d1 execute` teilweise falsch → Seed verwendet `char()`-Funktion für alle Nicht-ASCII-Zeichen
- Programme haben keine `university_id` (NULL), weil MVP-Fokus auf Fachrichtung/Matching liegt, nicht auf konkreter Hochschule

## Offene Entscheidungen
- Sollen wir echte OpenAI-API-Keys einbinden, um Beschreibungen qualitativ hochwertiger zu machen?
- Sollen wir Programme mit realen Universitäten verknüpfen (z.B. über Hochschulkompass-Daten oder HRK-Kooperation)?
- Wie gehen wir mit NC-Informationen um? Derzeit geschätzte Richtwerte, keine Garantie.

## Nächste Schritte (Vorschläge)
1. Qualität der 200 Programme manuell prüfen und ggf. korrigieren
2. Universitätszuordnung ergänzen oder zumindest Beispiel-Hochschulen verlinken
3. Quiz-Frontend so anpassen, dass es die neuen Tags/Felder nutzt
4. OpenAI-Integration für echtes Enrichment vorbereiten (`OPENAI_API_KEY` als wrangler secret)
5. Monitoring/Analytics für Quiz-Abschlüsse ergänzen
6. Custom Domain `abivio.de` im Cloudflare-Dashboard verbinden
7. Datenschutz-Hinweise und Impressum für MVP ergänzen

## Nützliche Befehle
```powershell
# 200 Programme neu generieren
node scripts/generate-programs-200.js

# Programme anreichern (Mock-Modus ohne API-Key)
node scripts/enrich-programs.js db/programs_200_raw.json db/programs_200_enriched.json

# SQL-Seed generieren
node scripts/generate-programs-seed.js db/programs_200_enriched.json db/seed_200.sql

# Seed auf Remote-D1 anwenden
npx wrangler d1 execute abivio-db --file db/seed_200.sql --remote

# Lokalen Dev-Server starten
npx wrangler pages dev frontend --compatibility-date=2026-07-06 --binding DB=abivio-db

# Deployen
npx wrangler pages deploy frontend
```

## Kontakt & Ressourcen
- GitHub: https://github.com/maxihuang123-svg/abivio
- Live: https://abivio.pages.dev
- Strategie: `docs/strategy.md`
- Datenbeschaffung: `docs/data-acquisition.md`
- HRK-Outreach-Template: `docs/hrk-outreach-template.md`

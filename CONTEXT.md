# CONTEXT.md — abivio.de

Aktueller Projektstand für den nächsten Chat. Diese Datei sollte am Ende jeder Sitzung aktualisiert werden.

## Fokus
- MVP für abivio.de ist live auf https://abivio.de und https://abivio.pages.dev
- Datenbasis: ~1.000 studiengangsspezifische Bachelor-Angebote an 32 Top-Unis
- LLM-Enrichment der Studiengangsbeschreibungen, Tags und Berufsfelder abgeschlossen
- E-Mail-Share-Funktion deployed und via Resend produktiv
- GitHub-Repository mit Cloudflare Pages verbunden (auto-deploy bei Push auf `main`)

## Zuletzt erledigt
- 200 Basis-Studiengänge mit OpenAI (`gpt-4o-mini`) angereichert → `db/programs_200_enriched.json`
- Programme auf 32 Top-Unis ausgeweitet → `db/programs_expanded.json` (~1.000 Einträge)
- `seed_expanded.sql` mit `char()`-Encoding für D1-Kompatibilität generiert
- Remote-D1 (`abivio-db`) mit 1.000 angereicherten Programmen befüllt
- E-Mail-Share-Code zu provider-abstrahiertem Design umgebaut (Resend, Brevo, Sendgrid, AWS SES Stub)
- `RESEND_API_KEY` als Cloudflare Pages Secret gesetzt
- Production-Deploy auf `abivio.de` / `abivio.pages.dev` durchgeführt
- GitHub-Repository mit Cloudflare Pages verbunden, Default-Branch auf `main` umgestellt
- README, Roadmap, Feature-Doku und .gitignore aktualisiert

## Architektur & Tech-Stack
- Frontend: statische HTML/CSS/JS unter `frontend/`, deployed auf Cloudflare Pages
- Backend: Hono-Worker unter `functions/api/[[route]].ts` (Cloudflare Pages Functions)
- Datenbank: Cloudflare D1 (SQLite), Binding `DB`, Name `abivio-db`
- KI: Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`) für Chatbot
- E-Mail: Provider-abstrahiert, aktuell Resend (konfigurierbar über `EMAIL_PROVIDER`)
- Deployment: Automatisch via GitHub → Cloudflare Pages; manuell via `wrangler pages deploy frontend --branch=main`

## Wichtige Dateien
- `db/schema.sql` — D1-Schema
- `db/programs_200_enriched.json` — 200 LLM-angereicherte Basis-Studiengänge
- `db/programs_expanded.json` — ~1.000 uni-spezifische Angebote
- `db/seed_expanded.sql` — D1-Seed für ~1.000 Programme
- `db/seed_200.sql` — D1-Seed für 200 Basis-Programme
- `scripts/enrich-programs.js` — LLM-Enrichment mit Resume-Cache
- `scripts/expand-programs-to-universities.js` — expandiert Basis-Programme auf Unis
- `scripts/generate-programs-seed.js` — JSON → D1 SQL
- `functions/api/[[route]].ts` — Hono API mit Quiz, Empfehlungen, Feedback, E-Mail-Share, Chatbot, Admin
- `AGENTS.md` — Projekt- und Coding-Conventions

## Bekannte Einschränkungen & Workarounds
- D1 interpretiert UTF-8-Literale beim `wrangler d1 execute` teilweise falsch → Seeds verwenden `char()`-Funktion für Nicht-ASCII-Zeichen
- AWS SES-E-Mail-Provider ist im Code als Stub hinterlegt, noch nicht vollständig implementiert
- Absender-Domain `noreply@abivio.de` muss in Resend verifiziert werden, bevor echte E-Mails zuverlässig ankommen
- NC-Informationen sind geschätzte Richtwerte, keine Garantie

## Offene Entscheidungen
- Sollen wir bei Resend bleiben oder auf Brevo/Sendgrid/AWS SES umstellen, wenn das Volumen steigt?
- Wie gehen wir mit User-Accounts / Magic-Link-Login um? (aktuell keine Accounts)
- Welche Analytics/Tracking-Lösung wird eingesetzt? (Cloudflare Web Analytics Token fehlt noch)

## Nächste Schritte (Vorschläge)
1. Resend-Domain `abivio.de` verifizieren
2. Impressum & Datenschutz finalisieren
3. Cloudflare Web Analytics Token einbauen
4. Rate Limiting & Abuse-Schutz für API-Endpoints vervollständigen
5. Erste Nutzerinterviews durchführen und Quiz-Matching iterieren
6. AWS SES-Provider vollständig implementieren (optional)

## Nützliche Befehle
```powershell
# Programme anreichern (mit OPENAI_API_KEY)
node scripts/enrich-programs.js db/programs_200_enriched.json db/programs_200_enriched.json

# Programme auf Unis ausweiten + SQL generieren
node scripts/expand-programs-to-universities.js

# Seed auf Remote-D1 anwenden
npx wrangler d1 execute abivio-db --file db/seed_expanded.sql --remote

# Lokalen Dev-Server starten
npm run dev

# Manuell deployen (normalerweise nicht nötig, da GitHub Auto-Deploy)
npx wrangler pages deploy frontend --branch=main
```

## Kontakt & Ressourcen
- GitHub: https://github.com/maxihuang123-svg/abivio
- Live: https://abivio.de
- Pages Alias: https://abivio.pages.dev
- Strategie: `docs/strategy.md`
- Roadmap: `docs/roadmap.md`
- Feature-Doku: `docs/feature.md`

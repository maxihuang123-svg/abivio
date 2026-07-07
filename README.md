# abivio.de

KI-gestützte Studienempfehlungsplattform für deutsche Abiturienten.

## Live-Version

- **Production:** https://abivio.de
- **Pages Alias:** https://abivio.pages.dev
- **GitHub:** https://github.com/maxihuang123-svg/abivio

## Was ist bereits umgesetzt?

- Landingpage mit Waitlist
- Interaktives Quiz (7 Fragen)
- Regelbasierte Studiumsempfehlungen
- Cloudflare Pages + Functions + D1
- 200 kuratierte deutsche Bachelor-Studiengänge
- LLM-gestützte Anreicherung der Studiengangsbeschreibungen, Tags und Berufsfelder
- Ausgeweitet auf ~1.000 studiengangsspezifische Angebote an 32 Top-Unis
- Bewerbungsfristen-Fokus auf den 15.07. (Wintersemester)
- Teilen-Funktion: Empfehlungen per E-Mail (provider-wechselbar: Resend, Brevo, Sendgrid)
- Schwebender KI-Studienberater-Chatbot mit FAQ-Shortcuts
- Admin-Auswertung für Feedback und Chat-Logs
- GitHub-Repository mit Cloudflare Pages verbunden (auto-deploy bei Push auf `main`)

## Schnellstart (lokal)

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

> Hinweis: Für lokale Entwicklung legt `wrangler pages dev` die D1-Datenbank erst bei der ersten Abfrage an. Am einfachsten startest du den Server, rufst einmal `/api/programs` auf und führst dann `npm run db:reset` aus.

## Deployment

Voraussetzung: Du bist mit `wrangler login` bei Cloudflare angemeldet.

### Automatisch via GitHub (empfohlen)

Das Cloudflare Pages-Projekt ist mit dem GitHub-Repository verbunden. Jeder Push auf `main` löst automatisch einen Deploy aus.

### Manuell via wrangler

```bash
# Datenbank (nur einmal nötig)
npm run db:create
npm run db:migrate
npm run db:seed

# Pages-Projekt (nur einmal nötig)
npx wrangler pages project create abivio --production-branch main

# Deploy
npx wrangler pages deploy frontend --branch=main
```

## Eigene Domain

`abivio.de` ist mit Cloudflare Pages verbunden und erreichbar. Bei Änderungen an DNS oder Custom Domain:

1. Cloudflare Dashboard → Pages → abivio → Custom domains
2. `abivio.de` verwalten oder neu hinzufügen

## Projektstruktur

```
frontend/         # Statische HTML/CSS/JS-Seiten
functions/api/    # Cloudflare Pages Functions (API mit Hono)
db/               # D1 Schema + Seed-Daten
scripts/          # Hilfsskripte (z. B. lokale Tests)
wrangler.toml     # Cloudflare-Konfiguration
```

## Wichtige Skripte

- `npm run dev` — Lokaler Dev-Server
- `npm run deploy` — Deploy auf Cloudflare Pages
- `npm run db:migrate` — Schema auf Remote-D1 anwenden
- `npm run db:seed` — Erweiterte Seed-Daten auf Remote-D1 anwenden (~1.000 Programme)
- `npm run db:seed:200` — Ursprüngliche 200 Programme auf Remote-D1 anwenden
- `npm run db:reset` — Schema + erweiterte Seeds neu anwenden
- `npm run db:expand:programs` — Programme auf Top-Unis ausweiten
- `npm run db:explorer` — Statische Daten-Explorer-Seite neu generieren

## Nächste Schritte

- [ ] Analytics/Tracking aktivieren (Cloudflare Web Analytics Token ersetzen)
- [ ] Impressum + Datenschutz mit echten Daten ausfüllen
- [ ] E-Mail-Absender-Domain `noreply@abivio.de` in Resend verifizieren
- [ ] Nutzerfeedback systematisch auswerten und Quiz-Matching iterieren
- [ ] Bewerbungsfristen-Reminder per E-Mail
- [ ] Daten-Explorer intern verlinken (optional)
- [ ] Rate Limiting & Abuse-Schutz für API-Endpoints vervollständigen

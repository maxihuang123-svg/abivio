# abivio.de

KI-gestützte Studienempfehlungsplattform für deutsche Abiturienten.

## Live-Version

- **Pages Preview:** https://abivio.pages.dev
- **Eigene Domain:** abivio.de (noch zu verbinden, siehe unten)

## Was ist bereits umgesetzt?

- Landingpage mit Waitlist
- Interaktives Quiz (7 Fragen)
- Regelbasierte Studiumsempfehlungen
- Cloudflare Pages + Functions + D1
- 200 kuratierte deutsche Bachelor-Studiengänge
- Ausgeweitet auf ~1.000 studiengangsspezifische Angebote an 32 Top-Unis
- Bewerbungsfristen-Fokus auf den 15.07. (Wintersemester)

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

```bash
# Datenbank (nur einmal nötig)
npm run db:create
npm run db:migrate
npm run db:seed

# Pages-Projekt (nur einmal nötig)
npx wrangler pages project create abivio --production-branch main

# Deploy
npm run deploy
```

## Eigene Domain verbinden

1. Cloudflare Dashboard → Pages → abivio → Custom domains
2. `abivio.de` hinzufügen
3. Wenn die Domain bei Cloudflare registriert ist, wird sie automatisch konfiguriert
4. Andernfalls musst du die Nameserver auf Cloudflare umstellen oder einen CNAME-Eintrag setzen

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

- [ ] abivio.de als Custom Domain verbinden
- [ ] Analytics/Tracking hinzufügen (Cloudflare Web Analytics Token ersetzen)
- [ ] Impressum + Datenschutz mit echten Daten ausfüllen
- [ ] Nutzerfeedback nach dem Quiz sammeln
- [ ] Bewerbungsfristen-Reminder per E-Mail
- [ ] Daten-Explorer intern verlinken (optional)

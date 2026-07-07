# Roadmap: abivio.de

Diese Roadmap basiert auf der Strategie in `docs/strategy.md` und dem aktuellen MVP-Status. Sie ist als lebendes Dokument gedacht und wird bei neuen Erkenntnissen angepasst.

---

## Grundsätzliche Entscheidungen

- **Zielgruppe:** Abiturienten und Fachabiturienten mit Studienwunsch in Deutschland.
- **Produktscope:** Nur Bachelor/Erststudium, nur deutsche Hochschulen, zunächst Deutschland-only.
- **Zusammenarbeit:** Personal GitHub-Repository mit Collaborator(s), keine Organization im MVP.
- **Datenstrategie:** Keine HRK-Kooperation im MVP. Stattdessen Eigenrecherche und kuratierte Seed-Daten.
- **Tech-Stack:** Beibehaltung von Vanilla JS im Frontend, Hono + TypeScript in Cloudflare Pages Functions, D1 als Datenbank.
- **Monetarisierung:** Später entscheiden, erst nach nachweislichem Product-Market-Fit.

---

## Phase 0 — Tech-Grundlagen & Setup (Sofort)

| # | Aufgabe | Priorität | Status |
|---|---------|-----------|--------|
| 0.1 | `abivio.de` als Custom Domain in Cloudflare verbinden | Hoch | Offen |
| 0.2 | GitHub-Collaborator einladen | Hoch | Offen |
| 0.3 | Impressum & Datenschutz finalisieren | Hoch | Offen |
| 0.4 | Analytics/Tracking einbauen (z. B. Cloudflare Web Analytics oder Plausible) | Hoch | Offen |
| 0.5 | Lokale Dev-Umgebung dokumentieren (`npm run dev`, `db:reset`) | Mittel | Offen |
| 0.6 | README aktualisieren (Domain-Status, aktuelle Befehle, Nächste Schritte) | Mittel | Offen |

**Meilenstein:** Domain ist erreichbar, rechtliche Grundlagen stehen, Team kann gemeinsam entwickeln.

---

## Phase 1 — MVP stabilisieren & Soft Launch (Woche 1–2)

| # | Aufgabe | Ziel |
|---|---------|------|
| 1.1 | Landingpage polieren | Klarerer CTA, FAQ, Social Proof |
| 1.2 | Waitlist-E-Mail-Bestätigung | Double-Opt-In für gültige Leads |
| 1.3 | Quiz-UX verbessern | Fortschrittsbalken, weniger Abbrüche, Tooltips |
| 1.4 | Ergebnisseite verbessern | Besseres Layout, Teilen-Funktion, "Merken"-Button |
| 1.5 | Studiengangsdaten erweitern | Von 56 auf 200+ kuratierte Bachelor-Studiengänge |
| 1.6 | Erste Nutzerinterviews durchführen | 10–15 Abiturienten/Fachabiturienten befragen |
| 1.7 | Performance- & Mobile-Optimierung | Ladezeiten, Accessibility, Mobile-First-Design prüfen |

**Meilenstein:** Soft Launch auf `abivio.de` mit funktionierendem Quiz, Waitlist und 200+ Studiengängen.

---

## Phase 2 — Daten erweitern & Nutzerfeedback (Woche 3–4)

| # | Aufgabe | Ziel |
|---|---------|------|
| 2.1 | Hochschul-Grundgerüst aufbauen | Alle ~400 deutschen Hochschulen importieren |
| 2.2 | `universities`-Tabelle erweitern | Parser für `hs_liste.txt`, Typ, Bundesland, Stadt |
| 2.3 | Geocoding | Koordinaten für Hochschulen ermitteln |
| 2.4 | Programme mit Hochschulen verknüpfen | Studiengänge konkreten Hochschulen zuordnen |
| 2.5 | Filter einführen | Bundesland, Hochschultyp (Uni/FH), Sprache |
| 2.6 | Bewerbungsfristen-Übersicht | Winter-/Sommersemester, hochschulstart.de/Uni-Assist |
| 2.7 | Feedback-Loop nach Quiz | "War diese Empfehlung hilfreich?" |

**Meilenstein:** Datenbank enthält Hochschulen + verknüpfte Programme, Nutzer können filtern und Fristen sehen.

---

## Phase 3 — Wachstum & Produktfeatures (Monat 2–3)

| # | Aufgabe | Ziel |
|---|---------|------|
| 3.1 | Account-Funktion | Empfehlungen speichern, Sitzungen wiederherstellen |
| 3.2 | E-Mail-Reminder | Erinnerungen an Bewerbungsfristen und NC-Updates |
| 3.3 | Newsletter-System | Regelmäßiger Studien-Guide für Waitlist |
| 3.4 | SEO-Landingpages | z. B. "Welches Studium passt zu Mathe?", "Studium mit NC 2,5" |
| 3.5 | Social Sharing | Ergebnisse als Link/Bild teilen |
| 3.6 | Content-Marketing | TikTok/Reels-Konzept, authentische Reddit-Posts |
| 3.7 | Kooperationsgespräche vorbereiten | StudySmarter, SimpleClub, Schülerzeitungen |

**Zielmetriken (90 Tage):**

| Metrik | Ziel |
|--------|------|
| Quiz-Starts | 5.000 |
| Abgeschlossene Quizzes | 2.000 |
| Waitlist-Einträge | 1.000 |
| Empfehlungen geteilt | 500 |

---

## Phase 4 — Intelligenz & Personalisierung (Monat 4–6)

| # | Aufgabe | Ziel |
|---|---------|------|
| 4.1 | LLM-gestützte Begründungen | "Warum passt Informatik zu dir?" |
| 4.2 | Natürlichsprachige Suche | "Ich mag Mathe und möchte Klimawandel bekämpfen" |
| 4.3 | Studiengangsbeschreibungen anreichern | LLM-generierte Texte, redaktionell geprüft |
| 4.4 | A/B-Tests für Quiz-Fragen | Conversion-Rate optimieren |
| 4.5 | Umkreissuche | Hochschulen nach Entfernung filtern |
| 4.6 | Karriere-Perspektiven | Verknüpfung Studium → Berufe via BERUFENET API |

**Meilenstein:** Plattform fühlt sich intelligent und personalisiert an, wiederkehrende Nutzer steigen.

---

## Phase 5 — Monetarisierung & Skalierung (Monat 7–12)

| # | Aufgabe | Ziel |
|---|---------|------|
| 5.1 | Monetarisierungsentscheidung treffen | Freemium, Affiliate, Beratung oder Kombination |
| 5.2 | Freemium-Modell testen | Basisempfehlung kostenlos, detaillierter Bericht kostenpflichtig |
| 5.3 | Premium-Features entwickeln | Persönlicher Studienplan, 1:1-Beratung, NC-Prognose |
| 5.4 | Affiliate-Partnerschaften | Bewerbungsportale, Bücher, Lernplattformen |
| 5.5 | Expansion prüfen | Österreich/Schweiz nur bei klarem Product-Market-Fit |

**Meilenstein:** Erste Einnahmen, klare Unit-Economics, Entscheidung über internationale Expansion.

---

## Nächste konkrete Schritte (diese Woche)

1. `abivio.de` als Custom Domain verbinden.
2. Impressum & Datenschutz erstellen/finalisieren.
3. GitHub-Collaborator einladen.
4. Analytics/Tracking einbauen.
5. 50–100 zusätzliche Studiengänge in `db/seed.sql` ergänzen.

---

## Abhängigkeiten & offene Fragen

- **Daten:** Wenn Eigenrecherche zu langsam ist, kann später doch eine HRK-Anfrage geprüft werden.
- **Monetarisierung:** Erst nach ausreichend Nutzerdaten und Feedback entscheiden.
- **Tech-Stack:** Bei wachsendem Frontend-Komplexität kann später ein Framework evaluiert werden — aktuell bleibt es bei Vanilla JS.

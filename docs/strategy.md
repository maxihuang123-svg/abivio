# Strategieplan: abivio.de — Deutschland-Fokus

## 1. Vision & Scope

**Fokus:** abivio.de ist in den nächsten 12 Monaten ausschließlich für Deutschland gedacht.

**Produktumfang:**
- Nur **Studium** (Bachelor, Erststudium)
- Nur **deutsche Hochschulen / Studiengänge**
- Keine Ausbildungen, kein duales Studium, keine internationalen Programme im MVP

**Warum Deutschland zuerst?**
- ~400.000 Abiturienten pro Jahr
- Reife, kostenlose Datenquellen (Hochschulkompass, BERUFENET, JOBBÖRSE)
- Einheitliches Bewerbungssystem (hochschulstart.de, Uni-Assist)
- Klare Sprache, klare Zielgruppe, klare Marketingkanäle

---

## 2. Zielgruppen-Entscheidung

### Empfehlung: Primär Gymnasialabsolventen (Abiturienten)

**Warum Abiturienten zuerst?**
- Größte, homogenste Zielgruppe mit Studienabsicht
- Höchster zeitlicher Druck (Bewerbungsfristen direkt nach dem Abi)
- Einfachste Sprache und Positionierung ("Nach dem Abi das richtige Studium finden")
- Größter viraler Potenzial (Schulen, Abitur-Gruppen, Lerncommunities)

### Sekundär: Fachabiturienten mit Studienabsicht

**Warum einbeziehen?**
- Auch Fachabiturienten können an Fachhochschulen und manchen Universitäten studieren
- Ca. 100.000 weitere potenzielle Nutzer pro Jahr
- Datenmäßig einfach integrierbar, sobald das Grundgerüst steht

### Nicht im Fokus (zunächst)

- Berufsschulabsolventen ohne Hochschulreife
- Studienwechsler
- Master-Interessenten
- Internationale Bewerber

### Wording auf der Plattform

Hauptclaim:
> „Finde dein Studium nach dem Abi.“

Sekundärer Hinweis:
> „Auch für Fachabiturienten mit Studienwunsch geeignet.“

---

## 3. Produkt-Roadmap (Deutschland)

### Phase 1 — MVP (Jetzt)
- Landingpage + Waitlist
- Quiz mit regelbasiertem Matching
- 56 kuratierte Studiengänge
- Ergebnisseite mit Top-Empfehlungen
- Live auf abivio.pages.dev

### Phase 2 — Soft Launch (2–4 Wochen)
- Custom Domain abivio.de
- Impressum & Datenschutz finalisieren
- 200+ Studiengänge im Seed
- E-Mail-Bestätigung für Waitlist
- Erste Nutzerinterviews (10–15 Personen)

### Phase 3 — Wachstum (1–3 Monate)
- Integration von Hochschulkompass-Daten (automatisiert)
- Filter nach Bundesland / Hochschultyp (Uni / FH)
- Bewerbungsfristen-Übersicht
- Account-Funktion: Empfehlungen speichern
- E-Mail-Reminder für wichtige Fristen

### Phase 4 — Intelligenz (3–6 Monate)
- LLM-gestützte Begründungstexte
- Natürlichsprachige Suche („Ich mag Mathe und möchte Klimawandel bekämpfen“)
- Studiengangsbeschreibungen automatisch anreichern
- A/B-Tests für Quiz-Fragen

### Phase 5 — Monetarisierung (6–12 Monate)
- Freemium-Modell: Basisempfehlung kostenlos, detaillierter Bericht kostenpflichtig
- Premium-Features:
  - Persönlicher Studienplan
  - 1:1 Online-Beratung
  - NC-Prognose basierend auf Hochschulkompass-Historie
- Affiliate-Links zu Bewerbungsportalen / Büchern

---

## 4. Datenstrategie

### MVP-Daten
- Manuell kuratierte Seed-Daten in `db/seed.sql`
- Felder: Name, Fachrichtung, Abschluss, Dauer, Sprache, NC, Interessen, Stärken, Arbeitsstil

### Mittelfristige Datenquellen
1. **Hochschulkompass** — vollständiger Katalog deutscher Studiengänge
2. **DAAD-Datenbank** — international orientierte Programme in Deutschland
3. **BERUFENET API** — Berufsbilder für spätere Ausbildungs-Erweiterung
4. **studycheck.de / NC.de** — NCs und Bewertungen (ggf. Scraping, rechtlich prüfen)

### Datenqualität
- Regelmäßiges Update der NCs vor jeder Bewerbungsphase
- Studiengänge ohne NC klar kennzeichnen
- Aufnahme nur von akkreditierten Hochschulen

---

## 5. Go-to-Market (Deutschland)

### Kurzfristig: Heiße Phase nutzen
- TUM-Frist 15.07. für WS 26/27
- Allgemeine Bewerbungsfristen für das Wintersemester

### Kanäle
1. **TikTok / Instagram Reels**
   - „In 5 Minuten dein Studium finden“
   - Vorher/Nachher: „So habe ich 20 Stunden Recherche gespart“

2. **Reddit**
   - r/studium, r/de, r/FragReddit
   - Authentische Hilfe statt Werbung

3. **Schul-Communities**
   - Abitur-WhatsApp-Gruppen
   - Discord-Server von Lernplattformen
   - SchülerVZ-Nachfolger / StudySmarter-Community

4. **SEO**
   - Landingpages für Fächer: „Welches Studium passt zu Mathe?“
   - Longtail: „Studium mit NC 2,5“, „Informatik oder Wirtschaftsinformatik?"

5. **Kooperationen**
   - StudySmarter, SimpleClub, TheSimpleMaths
   - Schülerzeitungen / Abizeitungen
   - Lokale Studienberatungen

---

## 6. Erfolgsmetriken

| Metrik | Ziel 30 Tage | Ziel 90 Tage |
|--------|--------------|--------------|
| Quiz-Starts | 500 | 5.000 |
| Abgeschlossene Quizzes | 200 | 2.000 |
| Waitlist-Einträge | 100 | 1.000 |
| Empfehlungen geteilt | 50 | 500 |
| Newsletter-Öffnungsrate | — | >30% |

---

## 7. Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|--------|---------------|
| Daten unvollständig | Schnell auf Hochschulkompass erweitern |
| Nutzer verlassen Quiz früh | Quiz verkürzen / Fortschrittsbalken optimieren |
| Zu wenig Traffic | TikTok-Content + Reddit-Beiträge skalieren |
| Fristen veraltet | Manuelle Checks vor jeder Bewerbungsphase |
| Konkurrenz kopiert | Schnelle Markenaufbau + Community |

---

## 8. Entscheidung: Deutschland-only vs. DACH

**Entscheidung: Deutschland-only für die nächsten 6–12 Monate.**

Gründe:
- Österreich und Schweiz haben andere Schulsysteme, andere Abschlüsse, andere Bewerbungswege
- Marketing müsste segmentiert werden
- Datenquellen sind andere
- Der deutsche Markt allein ist groß genug für Product-Market-Fit

**Internationale Expansion erst, wenn:**
- Deutschland-Unit-Economics stehen
- Wiederkehrende Nutzer und positive Retention vorliegen
- Klare Nachfrage aus Österreich/Schweiz vorhanden ist

---

## 9. Nächste Aufgaben

1. GitHub-Repo veröffentlichen
2. Impressum & Datenschutz finalisieren
3. abivio.de als Custom Domain verbinden
4. 50 weitere Studiengänge ergänzen
5. Erstes TikTok/Reel-Konzept erstellen
6. 5 Nutzerinterviews führen

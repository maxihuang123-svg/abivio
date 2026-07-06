# Web-Scraping für Studiengangsdaten

## Kurzantwort

**Ja, technisch möglich. Aber rechtlich in Deutschland sehr riskant.**

Scraping sollte nur nach sorgfältiger Prüfung und idealerweise mit Erlaubnis der Dateninhaber erfolgen. Dieses Dokument erklärt die rechtlichen Risiken und zeigt, wie ein verantwortungsvoller Scraper aufgebaut sein muss.

---

## Rechtliche Risiken in Deutschland

### 1. Urheberrecht (§ 2 UrhG)
- **Beschreibungstexte**, **Studieninhalte** und **formulierte Informationen** sind oft urheberrechtlich geschützt.
- **Fakten** (Name, Dauer, Abschluss, NC) sind grundsätzlich nicht urheberrechtlich geschützt.
- **Grauer Bereich:** Eine „Zusammenstellung“ von Fakten kann als Datenbankwerk geschützt sein.

### 2. Datenbankrecht (§§ 87a ff. UrhG)
- Systematische Sammlungen wie der Hochschulkompass oder studycheck.de können ein **Datenbankherstellerrecht** genießen.
- Das unerlaubte Auslesen und Verwerten großer Teile kann verboten sein.

### 3. AGB-Verstoß
- Fast alle großen Portale verbieten Scraping in ihren AGB.
- Ein Verstoß kann zu Abmahnungen, Sperrungen oder Schadensersatzforderungen führen.

### 4. Computergestützter Datenzugriff (§ 303a StGB)
- Wenn Scraping Sicherheitsmechanismen umgeht (CAPTCHAs, Login-Wände, Anti-Bot-Maßnahmen), kann es strafrechtlich relevant werden.

### 5. Datenschutz (DSGVO)
- Persönliche Daten (Bewertungen, Namen von Dozenten, E-Mail-Adressen) dürfen ohne Rechtsgrundlage nicht erhoben werden.

---

## Empfohlene Vorgehensweise

### Option 1: Offizielle Datenpartnerschaft (empfohlen)
Kontaktiere die Betreiber und frage nach:
- API-Zugang
- Datenexport
- Kooperation / Affiliate-Partnerschaft

### Option 2: Scraping eigener Hochschul-Webseiten
- Jede Hochschule veröffentlicht ihre Studiengänge auf ihrer eigenen Webseite.
- Hier ist das rechtliche Risiko geringer, weil es sich um öffentliche Informationen der Anbieter selbst handelt.
- Aber: Auch Hochschul-Websites haben Urheberrechte an Texten.

### Option 3: Faktisches Scraping öffentlicher Aggregatoren
- Nur für **nicht urheberrechtlich geschützte Fakten**.
- Keine Textbeschreibungen kopieren.
- Robots.txt und AGB beachten.
- Rate-Limiting verwenden.
- **Nur nach Rechtsberatung in Produktion nutzen.**

---

## Technischer Aufbau eines verantwortungsvollen Scrapers

### Grundregeln

1. **Robots.txt beachten**
   ```
   https://www.hochschulkompass.de/robots.txt
   ```

2. **Rate-Limiting**
   - Maximal 1 Request pro Sekunde
   - Nachts keine Scraping-Wellen
   - User-Agent mit Kontaktinformationen

3. **Nur öffentliche Seiten**
   - Keine Logins umgehen
   - Keine CAPTCHAs knacken
   - Keine APIs missbrauchen

4. **Daten minimalisieren**
   - Nur Fakten extrahieren
   - Keine Texte 1:1 kopieren
   - Quellenangaben speichern

5. **Respektvolles Verhalten**
   - Bei Blockade sofort stoppen
   - Anfragen auf Wunsch des Betreibers löschen

---

## Robots.txt-Check: Hochschulkompass

Wir haben die robots.txt von Hochschulkompass geprüft:

```
User-agent: *
Disallow: /studium/studiengangsuche/erweiterte-studiengangsuche/*
Disallow: /hochschulen/hochschulsuche/*
Disallow: /promotion/promotionssuche/*
```

**Konsequenz:** Das Scraping der Studiengangs- und Hochschulsuche ist durch robots.txt ausdrücklich untersagt. Das ist sowohl ein ethisches als auch ein rechtliches Stoppschild.

## Prototyp: Generischer Hochschul-Scraper

Der Prototyp in `scripts/scraper/scraper.js` zeigt, wie man verantwortungsvoll scrapen kann:
- CSS-Selektoren konfigurieren
- Ergebnisseiten parst
- strukturierte Daten extrahiert
- Rate-Limiting einbaut

Das Beispiel `scripts/scraper/example.js` arbeitet mit einer lokalen Mock-Datei, damit du die Technik verstehen kannst, ohne gegen robots.txt zu verstoßen.

**Wichtig:** Bevor du den Scraper gegen echte Webseiten einsetzt, kläre die Rechtslage und hole bei Bedarf Erlaubnis ein.

---

## Alternative: Hochschul-eigene Webseiten scrapen

Jede Hochschule hat in der Regel eine URL-Struktur wie:
```
https://www.uni-beispiel.de/studium/studiengaenge/bachelor/informatik/
```

**Vorteile:**
- Höchste Datenqualität (direkt von der Quelle)
- Aktuellste Informationen
- Geringeres rechtliches Risiko bei faktenbasierter Nutzung

**Nachteile:**
- 400+ verschiedene Webseiten-Strukturen
- Hoher Pflegeaufwand
- Viele Seiten nutzen JavaScript-Frameworks

---

## Empfohlene Datenstrategie

| Phase | Quelle | Risiko | Aufwand |
|-------|--------|--------|---------|
| 1 | Hochschulkompass TXT (Hochschulen) | Gering | Sehr gering |
| 2 | Manuelle Kuratierung + LLM | Sehr gering | Mittel |
| 3 | Hochschul-Webseiten (faktenbasiert) | Mittel | Hoch |
| 4 | Offizielle API/Datenpartnerschaft | Gering | Unsicher |
| 5 | Scraping großer Aggregate | Hoch | Mittel |

---

## Fazit

**Scraping ist möglich, aber kein Freifahrtschein.** Für ein sauberes, langfristig skalierbares Produkt empfehlen wir:

1. **Sofort:** Hochschulkompass-TXT + manuelle Kuratierung nutzen
2. **Kurzfristig:** HRK/Hochschulkompass und Hochschulen direkt anschreiben
3. **Mittelfristig:** Faktenbasiertes Scraping eigener Hochschul-Seiten mit Pflegeaufwand
4. **Nur mit Rechtsberatung:** Scraping großer Aggregate wie studycheck.de

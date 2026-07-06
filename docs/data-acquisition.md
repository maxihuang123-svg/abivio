# Datenbeschaffung: Alle Möglichkeiten im Überblick

## „Manuelle Kuratierung + LLM“ — was bedeutet das?

Das ist der schnellste und rechtlich sicherste Weg, um für den MVP qualitativ hochwertige Studiengangsdaten zu bekommen.

### 1. Manuelle Kuratierung

Du (oder ein Freelancer/Redakteur) erstellt eine strukturierte Liste von Studiengängen. Das bedeutet: Für jeden Studiengang werden harte Fakten gesammelt:

- Name des Studiengangs
- Fachrichtung
- Abschluss (Bachelor)
- Regelstudienzeit
- Sprache
- NC (ja/nein, ungefährer Wert)
- Hochschultyp

**Beispiel (CSV/JSON):**

```json
{
  "name": "Informatik",
  "field": "Technik & IT",
  "degree": "Bachelor",
  "duration_semesters": 6,
  "language": "de",
  "nc_required": true,
  "nc_grade": 2.5
}
```

Das kannst du aus:
- Hochschulkompass (manuell ablesen)
- Hochschul-Webseiten
- Deinem eigenen Wissen
- Wikipedia-Artikeln zu Studiengängen

zusammentragen.

### 2. LLM-Enrichment

Ein LLM (z. B. Claude, GPT-4) nimmt die harten Fakten und schreibt daraus:

- **Beschreibung:** „Informatik befasst sich mit Softwareentwicklung, Algorithmen, Datenbanken und KI…“
- **Berufsperspektiven:** „Softwareentwickler, Data Engineer, IT-Berater…“
- **Tags für das Matching:** `technik`, `logik`, `mathematik`, `digitales`
- **Passende Schulfächer:** `mathematik`, `informatik`, `physik`
- **Arbeitsstil-Tags:** `analytisch`, `problemloesend`, `selbstaendig`

**Beispiel-Prompt:**

```
Studiengang: Informatik (Bachelor, 6 Semester, deutsch)

Erstelle:
1. Eine kurze Beschreibung (1–2 Sätze)
2. Typische Berufsperspektiven (kommagetrennt)
3. 3–5 Interessen-Tags für Abiturienten
4. 2–4 passende Schulfächer
5. 2–4 passende Arbeitsstil-Tags

Format: JSON
```

### Warum ist das rechtlich sauber?

**Fakten sind frei.** Dinge wie „Informatik ist ein Bachelor-Studiengang mit 6 Semestern Dauer" sind keine urheberrechtlich geschützten Werke. Sie sind allgemein bekannte Informationen.

**Eigen erstellte Texte sind geschützt.** Wenn du oder ein LLM eine Beschreibung formulieren, entsteht ein neuer Text. Dieser Text gehört dir (bzw. demjenigen, der den Prompt geschrieben hat).

**Was nicht erlaubt ist:** Texte 1:1 aus geschützten Quellen kopieren. Also keine Beschreibungen aus dem Hochschulkompass oder von Hochschul-Webseiten übernehmen.

**Was erlaubt ist:**
- Fakten recherchieren (Name, Dauer, Abschluss, NC)
- Eigene Beschreibungen schreiben
- Ein LLM auf Basis dieser Fakten formulieren lassen

### Vorteile
- Sehr schnell skalierbar
- Rechtlich sauber, wenn Fakten selbst recherchiert
- Konsistente Sprache und Struktur
- Gut für Matching-Algorithmus geeignet

### Nachteile
- LLM kann Halluzinationen produzieren (muss geprüft werden)
- Aktuelle NCs/Bewerbungsfristen müssen separat gepflegt werden
- Keine universitätsspezifischen Details

---

## Andere Möglichkeiten, an Daten zu kommen

### A. Offizielle und halboffizielle Quellen

| Quelle | Was enthält es? | Kosten | Rechtliche Lage |
|--------|-----------------|--------|-----------------|
| **Hochschulkompass TXT** | Alle ~400 deutschen Hochschulen mit Adresse, Typ, Bundesland | Kostenlos | Persönlicher Gebrauch erlaubt, kommerziell nur mit Genehmigung |
| **Hochschulkompass Web** | ~22.700 Studiengänge mit Details | Kostenlos | Scraping per robots.txt/AGB untersagt |
| **DAAD-Datenbank** | Internationale Studienangebote in Deutschland | Kostenlos | Keine öffentliche API bekannt |
| **Wikidata** | Hochschulen, Fächer, Orte, Logos | Kostenlos (CC0) | Frei nutzbar |
| **lobid API** | Hochschulen und Bibliotheken | Kostenlos | Frei nutzbar |
| **govdata.de** | Statistiken der Bundesländer | Kostenlos | Offene Daten |
| **DESTATIS** | Hochschulstatistiken | Kostenlos | Offizielle Statistik |
| **KMK / ANABIN** | Anerkennung ausländischer Abschlüsse | Kostenlos | Nicht für deutsche Programme |

### B. Berufs- und Arbeitsmarktdaten

| Quelle | Nutzen für abivio |
|--------|-------------------|
| **BERUFENET API** | Berufsbilder, Anforderungen, Tätigkeitsfelder |
| **JOBBÖRSE API** | Stellenangebote, Nachfrage nach Berufen |
| **StepStone / Indeed** | Gehaltsdaten (meist nicht öffentlich) |
| **gehalt.de** | Gehaltsbenchmarks (meist nicht öffentlich) |

### C. Bewertungen und Rankings

| Quelle | Nutzen | Problem |
|--------|--------|---------|
| **CHE Hochschulranking** | Studienbedingungen, Fachbereichs-Rankings | Keine öffentliche API, Lizenz nötig |
| **studycheck.de** | Studentenbewertungen | Urheberrechtlich geschützt, kein Scraping |
| **NC.de** | NC-Werte | Urheberrechtlich geschützt, kein Scraping |

### D. Hochschul-Webseiten

Jede Hochschule veröffentlicht ihre Studiengänge selbst. Hier gibt es zwei Ansätze:

1. **Mit Erlaubnis scrapen**
   - Rechtlich am saubersten
   - Hochwertigste und aktuellste Daten
   - Aufwand: 400+ verschiedene Webseitenstrukturen

2. **Manuell auslesen**
   - Sehr aufwändig
   - Aber rechtlich unproblematisch für eigene Recherche

### E. Crowdsourcing / Community

- **Nutzer generieren Inhalte:** Abiturienten ergänzen/verbessern Studiengangsdaten
- **Fachschaften / Studierendenvertretungen:** Können Daten beisteuern
- **Discord-/Reddit-Communities:** Freiwillige Helfer

**Vorteil:** Skalierbar und community-getrieben
**Nachteil:** Qualitätssicherung nötig

### F. Kauf/Lizenz von Datenanbietern

- Hochschulkompass bietet Datenlizenzen an
- CHE bietet Rankings-Daten an
- Spezialisierte EdTech-Datenanbieter

**Vorteil:** Rechtlich sauber
**Nachteil:** Kosten, oft teuer für Startups

---

## Empfohlene Reihenfolge für abivio

### Sofort (MVP)
1. Hochschulkompass-TXT für Hochschulen nutzen ✅
2. 100–200 wichtige Studiengänge manuell kuratieren
3. LLM für Beschreibungen, Tags und Berufsperspektiven nutzen

### Kurzfristig (1–2 Monate)
4. HRK/Hochschulkompass um Datenpartnerschaft fragen
5. Bei größeren Hochschulen individuell um Erlaubnis fragen
6. Erste Nutzer können Daten ergänzen (Crowdsourcing)

### Mittelfristig (3–6 Monate)
7. Mit erlaubten Quellen automatisiert scrapen
8. Bewerbungsfristen und NCs manuell pflegen
9. Karriere- und Gehaltsdaten über BERUFENET ergänzen

---

## Woher hat Hochschulkompass seine Daten?

Hochschulkompass ist das offizielle Portal der **Hochschulrektorenkonferenz (HRK)**.

### Datenherkunft

- Die Daten kommen **direkt von den Hochschulen**.
- Jede Hochschule pflegt ihren eigenen Eintrag.
- Hochschulen melden:
  - Namen und Adressen
  - Studiengänge und Abschlüsse
  - Zulassungsmodalitäten
  - Kontaktdaten
  - Trägerschaft und Hochschultyp

### Warum gibt es keine öffentliche API?

- Die Daten sind Eigentum der Hochschulrektorenkonferenz.
- Der Betrieb wird durch Mitgliedsbeiträge und Kooperationen finanziert.
- Datenlizenzen werden kommerziell vergeben.

### Was bedeutet das für abivio?

- Die TXT-Liste der Hochschulen ist für persönlichen Gebrauch frei.
- Studiengangsdaten sind nicht als Open Data verfügbar.
- Eine saubere Lösung wäre eine **Kooperation oder Lizenzvereinbarung** mit der HRK.

---

## Brauche ich unbedingt eine HRK-Datenpartnerschaft?

### Für den MVP: Nein

Du kannst abivio.de komplett ohne HRK-Daten starten:

- Hochschulen über die TXT-Datei abdecken ✅
- 100–200 Studiengänge manuell kuratieren
- LLM für Beschreibungen und Tags nutzen
- Quiz und Empfehlungen damit betreiben

Das ist ausreichend, um Product-Market-Fit zu testen und erste Nutzer zu gewinnen.

### Für das volle Produkt: Ja, langfristig sinnvoll

Wenn abivio wachsen soll, brauchst du irgendwann:

- Alle ~20.000 Studiengänge
- Aktuelle NCs pro Hochschule
- Bewerbungsfristen
- Sprachanforderungen
- Zulassungsbeschränkungen

Dafür ist eine offizielle Datenpartnerschaft die sauberste Lösung. Aber bis dahin kannst du mit manueller Kuratierung + Crowdsourcing arbeiten.

### Alternative Wege ohne HRK

1. **Einzelne Hochschulen kontaktieren**
   - Viele Hochschulen helfen gerne bei sinnvollen Projekten.
   - Du bekommst aktuellere Daten als vom Aggregator.

2. **Crowdsourcing**
   - Nutzer ergänzen und korrigieren Studiengangsdaten.
   - Community-getrieben und skalierbar.

3. **Freiwillige Helfer / Praktikanten**
   - Studenten kuratieren Daten gegen Anerkennung oder Bezahlung.

4. **Kauf von Datenlizenzen**
   - Hochschulkompass, CHE und andere bieten Lizenzen an.
   - Kostet Geld, aber ist rechtlich sauber.

## Fazit

**Manuelle Kuratierung + LLM** ist der beste Start, weil es:
- schnell ist
- rechtlich sicher ist
- gute Ergebnisse liefert
- später durch offizielle Datenquellen ergänzt werden kann

Eine HRK-Datenpartnerschaft ist wünschenswert, aber **keine Voraussetzung** für den MVP. Scraping und Screenshot-basierte Extraktion sind nur die letzte Option — und nur mit Erlaubnis.

# Bildbasierte KI-Datenextraktion

## Kurzantwort

**Ja, technisch möglich.** Moderne KI-Vision-Modelle (GPT-4o, Claude 3, Gemini) können Text aus Screenshots und Bildern extrahieren und in strukturierte Daten umwandeln.

**Aber rechtlich ist das kein Ausweg.** Wenn du Screenshots von geschützten Webseiten machst und Daten extrahierst, greifen dieselben rechtlichen Probleme wie beim Scraping:
- Urheberrecht an Texten und Layouts
- Datenbankrecht bei systematischen Sammlungen
- AGB-Verstöße
- robots.txt

Der Bildschirm ist nur ein anderer Weg, die gleichen geschützten Daten zu erreichen.

---

## Wie es technisch funktionieren würde

### Beispiel-Workflow

1. **Screenshot machen**
   ```
   https://www.hochschulkompass.de/studium/studiengang/...
   → Screenshot als PNG/JPEG
   ```

2. **KI-Vision-Modell fragen**
   ```
   Extrahiere aus diesem Screenshot:
   - Studiengangsname
   - Abschluss
   - Dauer
   - Sprache
   - NC
   - Beschreibung
   
   Antworte als JSON.
   ```

3. **Strukturierte Daten erhalten**
   ```json
   {
     "name": "Informatik",
     "degree": "Bachelor",
     "duration_semesters": 6,
     "language": "de",
     "nc_required": true
   }
   ```

### Vorteile

- Funktioniert auch bei JavaScript-lastigen Webseiten
- Umgeht manche technische Anti-Scraping-Maßnahmen
- KI kann unstrukturierte Informationen besser interpretieren

### Nachteile

- Teurer als klassisches Scraping (Bild-Tokens kosten mehr)
- Langsamer
- Halluzinationen möglich
- Schlecht skalierbar für tausende Studiengänge

---

## Rechtliche Bewertung

### Screenshots sind keine rechtliche Grauzone

Das Recht beurteilt nicht das **Medium** (HTML vs. Bild), sondern den **Inhalt**.

| Quelle | HTML-Scraping | Screenshot + KI | Bewertung |
|--------|---------------|-----------------|-----------|
| Hochschulkompass | Verboten (robots.txt) | Verboten (gleiche Daten) | ❌ |
| studycheck.de | Urheberrecht | Urheberrecht | ❌ |
| Hochschul-Webseiten | Mittleres Risiko | Mittleres Risiko | ⚠️ |
| Wikipedia / Wikidata | Erlaubt | Erlaubt | ✅ |
| Eigene Screenshots eigener Seiten | Erlaubt | Erlaubt | ✅ |

### Wichtige rechtliche Eckpunkte

1. **Urheberrecht an Texten**
   - Auch als Bild erfasst, bleibt der Text geschützt.
   - 1:1-Kopien sind unzulässig.

2. **Datenbankrecht**
   - Systematische Sammlungen wie Hochschulkompass bleiben geschützt.
   - Der Weg der Extraktion spielt keine Rolle.

3. **AGB**
   - Viele Seiten verbieten „automatisierte Datenerhebung" allgemein.
   - Das umfasst oft auch Screenshots und KI-Verarbeitung.

4. **Wettbewerbsrecht**
   - Wenn du geschützte Daten kommerziell nutzt, kann das unlauterer Wettbewerb sein.

---

## Was ist erlaubt?

### ✅ Erlaubt

- **Eigene Fotos/Screenshots** von eigenen Inhalten
- **Öffentliche Bilder** unter freier Lizenz (Creative Commons)
- **Wikipedia/Wikidata** (CC0 / freie Lizenzen)
- **Screenshots von Webseiten, deren Betreiber zugestimmt haben**

### ⚠️ Nur mit Vorsicht

- **Screenshots von Hochschul-Webseiten** für faktenbasierte Informationen
- Name, Dauer, Abschluss sind Fakten
- Beschreibungstexte sind oft urheberrechtlich geschützt

### ❌ Nicht erlaubt

- **Screenshots von Aggregatoren** wie Hochschulkompass, studycheck, NC.de
- **Massenhafte automatisierte Extraktion** aus geschützten Quellen
- **Umgehung von robots.txt oder AGB** durch den Bildschirmweg

---

## Empfohlene Anwendung für abivio

### Sinnvoll

Bildbasierte KI-Extraktion kann sinnvoll sein für:

1. **Einmalige manuelle Recherche**
   - Du öffnest eine Hochschul-Webseite
   - Machst einen Screenshot
   - Lässt die KI Fakten extrahieren
   - Prüfst und speicherst das Ergebnis

2. **PDFs und Broschüren**
   - Hochschulen veröffentlichen oft PDF-Studienführer
   - Diese kann man mit Erlaubnis verarbeiten
   - KI extrahiert Struktur aus PDF-Bildern

3. **Eigene Marketing-Bilder**
   - Studierende/Community reichen Bilder ein
   - KI extrahiert Informationen

### Nicht sinnvoll

- **Massenautomation über Screenshots**
- **Umgehung von Scraping-Restriktionen**
- **Ungeprüfte Übernahme von KI-generierten Inhalten**

---

## Fazit

KI-Vision ist ein mächtiges Werkzeug für die Datenextraktion, aber **kein juristisches Freifahrtschein**. Wer Screenshots von geschützten Webseiten macht und kommerziell nutzt, handelt rechtlich riskant.

Der saubere Weg bleibt:
1. **Eigene Recherche + LLM**
2. **Offizielle Datenpartnerschaften**
3. **Nutzung freier Datenquellen**

Bildbasierte Extraktion ist eine Ergänzung für spezielle Fälle — nicht das Hauptwerkzeug.

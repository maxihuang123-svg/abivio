# Datenbeschaffungsplan: Hochschulen & Studiengänge in Deutschland

## Ziel

Aufbau einer eigenen, strukturierten Datenbank mit:
- Allen deutschen Hochschulen (ca. 400)
- Studiengängen (langfristig 20.000+, kurzfristig 200–500 für den MVP)
- Groben Beschreibungen, Anforderungen, NC-Infos, Dauer, Sprache, Standort

Der Fokus bleibt auf **Deutschland** und **Bachelor-Studiengänge**.

---

## 1. Datenquellen-Übersicht

### Quelle A: Hochschulkompass (HRK)

**Was ist das?**
Offizielles Portal der Hochschulrektorenkonferenz (HRK). Enthält alle staatlichen und staatlich anerkannten Hochschulen sowie deren Studiengänge.

**Verfügbare Daten:**
- Hochschulliste als TXT-Download ✅
- Adresse, Typ, Trägerschaft, Bundesland, Studentenzahl, Gründungsjahr
- Studiengänge über Web-Suche (ca. 22.700 Treffer)

**Zugriff:**
- TXT-Download der Hochschulliste: https://hs-kompass.de/kompass/xml/download/hs_liste.txt
- Nutzung laut HRK: „ausschließlich für den persönlichen Gebrauch kostenfrei“
- Kommerzielle Nutzung bedarf der Genehmigung

**Empfohlene Vorgehensweise:**
1. TXT-Datei der Hochschulliste als Grundgerüst nutzen
2. Bei HRK / Hochschulkompass um kooperative Nutzung oder API-Zugang anfragen
3. Falls keine Kooperation zustande kommt: Eigenrecherche + kuratierte Datensätze

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐⭐⭐ |
| Aktualität | ⭐⭐⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐⭐ (nur mit Genehmigung) |
| Technischer Aufwand | ⭐⭐ (TXT einfach, Programme schwieriger) |

---

### Quelle B: DAAD (Deutscher Akademischer Austauschdienst)

**Was ist das?**
Datenbank internationaler Studienangebote in Deutschland.

**Verfügbare Daten:**
- Internationale Bachelor- und Masterprogramme
- Englischsprachige Studiengänge
- Hochschulinformationen

**Zugriff:**
- Website: https://www.daad.de/de/studieren-und-forschen-in-deutschland/
- Keine öffentliche API für Studiengänge bekannt
- Daten teilweise als Export für Partner verfügbar

**Empfohlene Vorgehensweise:**
- Als Ergänzung für englischsprachige Programme
- Bei DAAD nach Kooperation fragen

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐ (nur internationale Programme) |
| Aktualität | ⭐⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐⭐ |
| Technischer Aufwand | ⭐⭐⭐ |

---

### Quelle C: Wikidata

**Was ist das?**
Freie Wissensdatenbank mit strukturierten Daten zu Universitäten, Städten, Fächern.

**Verfügbare Daten:**
- Universitäten in Deutschland (Q3918, Q15850083)
- Standorte, Gründungsjahre, Websites, Logos
- Studienfächer (Q11862829)

**Zugriff:**
- SPARQL-Endpoint: https://query.wikidata.org/sparql
- Lizenz: CC0 (frei nutzbar)

**Empfohlene Vorgehensweise:**
- Als Backup/Enrichment für Hochschul-Metadaten
- Nicht als Hauptquelle für Studiengänge

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐ |
| Aktualität | ⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐⭐⭐⭐ (CC0) |
| Technischer Aufwand | ⭐⭐ |

---

### Quelle D: lobid API (hbz)

**Was ist das?**
API des Hochschulbibliothekszentrums NRW für Organisationen und Literatur.

**Verfügbare Daten:**
- Organisationen (Universitäten, Hochschulen)
- Adressen, ISILs, Typen

**Zugriff:**
- https://lobid.org/organisations/api
- Offene JSON-API

**Empfohlene Vorgehensweise:**
- Für Hochschul-Lookup und Normdaten
- Nicht für Studiengänge

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐ |
| Aktualität | ⭐⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐⭐⭐⭐ |
| Technischer Aufwand | ⭐⭐ |

---

### Quelle E: Bundesagentur für Arbeit (BERUFENET & JOBBÖRSE)

**Was ist das?**
Offizielle APIs der Bundesagentur für Arbeit.

**Verfügbare Daten:**
- BERUFENET: Berufsbilder, Tätigkeitsfelder, Anforderungen
- JOBBÖRSE: Stellenangebote, Nachfrage nach Berufen

**Zugriff:**
- https://www.arbeitsagentur.de/arbeitsmarktdaten-und-medien/arbeitsmarkt-informationen/berufenet
- API-Schlüssel erforderlich, kostenlos

**Empfohlene Vorgehensweise:**
- Für Karriere-Perspektiven und Berufs-Matching
- Nicht für Studiengangsdaten

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐⭐ |
| Aktualität | ⭐⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐⭐⭐⭐ |
| Technischer Aufwand | ⭐⭐⭐ |

---

### Quelle F: CHE Hochschulranking / studycheck.de / NC.de

**Was ist das?**
Private Portale mit Hochschulbewertungen und NC-Daten.

**Verfügbare Daten:**
- CHE: Fachbereichs-Rankings, Studienbedingungen
- studycheck.de: Bewertungen von Studierenden
- NC.de / studienplatz.finder: Numerus-Clausus-Werte

**Zugriff:**
- Keine öffentlichen APIs
- Scraping oft gegen AGB

**Empfohlene Vorgehensweise:**
- Manuelle Recherche für wichtige NCs
- Kooperation mit Anbietern prüfen
- Kein automatisches Scraping ohne Rechtsprüfung

**Bewertung:**
| Kriterium | Bewertung |
|-----------|-----------|
| Vollständigkeit | ⭐⭐⭐⭐ |
| Aktualität | ⭐⭐⭐⭐ |
| Rechtliche Sicherheit | ⭐⭐ (Daten urheberrechtlich geschützt) |
| Technischer Aufwand | ⭐⭐⭐⭐ |

---

## 2. Empfohlene Datenarchitektur

### Tabellen

```sql
universities          -- Deutsche Hochschulen
programs              -- Studiengänge (1:n zu universities)
program_details       -- Zusatzinfos (NC, Bewerbungsfristen, etc.)
career_mappings       -- Verknüpfung Studium → Berufe
requirements          -- Zulassungsvoraussetzungen
```

### Felder für `universities`

- `id`
- `name`
- `short_name`
- `type` (Universität, Fachhochschule/HAW, Künstlerische Hochschule, etc.)
- `ownership` (öffentlich-rechtlich, privat, kirchlich)
- `federal_state`
- `city`
- `zip`
- `street`
- `website`
- `student_count`
- `founded_year`
- `has_phd_right`
- `has_habilitation_right`
- `is_hrk_member`
- `coordinates` (lat/lng)

### Felder für `programs`

- `id`
- `university_id`
- `name`
- `degree` (Bachelor, Master, etc.)
- `field`
- `duration_semesters`
- `language`
- `tuition_per_semester`
- `nc_required`
- `nc_grade`
- `description`
- `career`
- `interests` (JSON)
- `strengths` (JSON)
- `work_style` (JSON)
- `admission_requirements`
- `application_deadline_winter`
- `application_deadline_summer`
- `is_dual`
- `is_part_time`
- `is_distance`

---

## 3. Phasenplan

### Phase 1: Hochschul-Grundgerüst (Woche 1)

**Ziel:** Alle deutschen Hochschulen in die Datenbank importieren.

**Quellen:**
- Hochschulkompass TXT-Download (https://hs-kompass.de/kompass/xml/download/hs_liste.txt)
- Wikidata / lobid für Koordinaten und Logos

**Schritte:**
1. Parser für `hs_liste.txt` bauen
2. `universities`-Tabelle anlegen
3. Daten importieren
4. Koordinaten über Nominatim/OpenStreetMap ergänzen
5. Bereinigung der Umlaute/Encoding

**Ergebnis:** 400+ Hochschulen mit Adresse, Typ, Bundesland.

---

### Phase 2: MVP-Studiengänge (Woche 2–3)

**Ziel:** 200–500 wichtige Bachelor-Studiengänge abdecken.

**Quellen:**
- Manuell kuratierte Seed-Daten (wie aktuell in `db/seed.sql`)
- Hochschulkompass-Detailseiten (manuelle Recherche)
- DAAD für internationale Programme

**Schritte:**
1. Top 100 Studiengänge identifizieren (BWL, Informatik, Medizin, Maschinenbau, Psychologie, etc.)
2. Pro Studiengang: Name, Fachrichtung, Dauer, Sprache, NC, Beschreibung, Berufe
3. Zuordnung zu Hochschulen (später: alle anbietenden Hochschulen)
4. Interessen-/Stärken-Tags für Matching

**Ergebnis:** Solide Basis für Quiz-Matching.

---

### Phase 3: Automatisierte Erweiterung (Woche 4–8)

**Ziel:** Mehrere tausend Studiengänge abdecken.

**Optionen:**

#### Option A: HRK-Kooperation (bevorzugt)
- Anfrage an Hochschulkompass / HRK
- Nutzungsvertrag für kommerzielle Zwecke
- Datenlieferung als XML/CSV/API

#### Option B: Gekürzte Eigenrecherche
- Redaktionelles Team / Freelancer recherchieren Top-Programme
- LLM-gestützte Beschreibungserstellung aus Hochschul-Webseiten

#### Option C: Scraping (nur nach Rechtsprüfung)
- Technisch machbar über Hochschulkompass-Suche
- Risiko: AGB-Verstoß, rechtliche Schritte
- Nur mit Anwalt klären

**Empfehlung:** Option A verfolgen, parallel Option B für MVP.

---

### Phase 4: Anreicherung (Woche 8–12)

**Ziel:** Daten qualitativ verbessern.

**Datenpunkte:**
- Aktuelle NC-Werte (manuelle Recherche, NC.de)
- Bewerbungsfristen (hochschulstart.de, Uni-Assist)
- Bewertungen (CHE, studycheck.de)
- Berufsperspektiven (BERUFENET)
- Jobmarktdaten (JOBBÖRSE)
- Gehaltsdaten (gehalt.de, StepStone)

---

## 4. Rechtliche Rahmenbedingungen

### Hochschulkompass TXT-Download
- **Persönlicher Gebrauch:** erlaubt
- **Kommerzielle Nutzung:** nur mit Genehmigung der Stiftung zur Förderung der HRK
- **Empfehlung:** Kontakt aufnehmen, bevor Daten in Produktion genutzt werden

### Scraping
- Technisch möglich, aber meist gegen AGB
- Urheberrecht an Texten/Beschreibungen
- § 44b UrhG (Text and Data Mining) greift nur bei rechtmäßigem Zugriff
- **Empfehlung:** Vermeiden oder juristisch prüfen

### Wikidata / lobid
- Frei nutzbar (CC0 / offene Lizenzen)
- Ideale Quelle für Grunddaten

### Bundesagentur für Arbeit APIs
- Öffentlich und kostenlos
- Nutzungsbedingungen beachten

### Private Portale (studycheck, NC.de)
- Inhalte urheberrechtlich geschützt
- Kein Scraping ohne Zustimmung

---

## 5. Empfohlene technische Umsetzung

### Pipeline

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Hochschulkompass│────▶│  Parser      │────▶│  D1 DB      │────▶│  Matching-   │
│  TXT-Download    │     │  (Node.js)   │     │  universities│     │  Algorithmus │
└─────────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                                                         ▲
                                                         │
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Manuell/LLM    │────▶│  Seed-Daten  │────▶│  D1 DB      │
│  Studiengänge   │     │  (JSON/SQL)  │     │  programs   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

### Tools

- **Parser:** Node.js mit Streams
- **Geocoding:** Nominatim oder OpenStreetMap
- **Datenbank:** Cloudflare D1
- **Enrichment:** LLM (Claude/OpenAI) für Beschreibungen
- **Monitoring:** GitHub Actions für regelmäßige Updates

---

## 6. Nächste konkrete Schritte

1. **Hochschulliste importieren**
   - `universities`-Tabelle erstellen
   - Parser für `hs_liste.txt` bauen
   - ~400 Hochschulen in D1 importieren

2. **HRK/Hochschulkompass kontaktieren**
   - Anfrage für kommerzielle Nutzung / API-Zugang
   - Erklären, dass abivio.de Studieninteressenten hilft

3. **MVP-Studiengänge erweitern**
   - Von 56 auf 200+ Programme
   - Fokus auf die beliebtesten Bachelor-Studiengänge

4. **Geocoding für Kartenansicht**
   - Koordinaten für Hochschulen ermitteln
   - Später: Umkreissuche ermöglichen

5. **Rechtliche Prüfung**
   - Anwalt oder Rechtsberatung für Datenutzung
   - AGB von Hochschulkompass prüfen

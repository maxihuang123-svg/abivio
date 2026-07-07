# Feature-Übersicht — abivio.de

> Dokumentation aller aktuell umgesetzten Features, Endpoints und Konfigurationen.
> Letzte Aktualisierung: 2026-07-07

---

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Frontend | Statisches HTML/CSS/JS (kein Framework) |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Pages Functions mit Hono (TypeScript) |
| Datenbank | Cloudflare D1 (SQLite) |
| KI | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`) |
| E-Mail | Resend (konfigurierbar über `RESEND_API_KEY`) |
| Analytics | Cloudflare Web Analytics |

---

## Frontend-Features

### Landingpage
- Hero-Bereich mit Call-to-Action
- Waitlist-Formular (E-Mail + Abi-Jahr)
- „So funktioniert abivio“-Erklärung
- Impressum & Datenschutz-Seiten

### Quiz
- 7 Fragen zu Interessen, Stärken, Arbeitsstil, NC, Sprache, Dauer, Region
- Fortschrittsbalken
- Mehrfachauswahl mit Min-/Max-Beschränkung
- Zurück-Navigation
- Session-ID wird clientseitig generiert

### Ergebnisse
- Top 5 Bachelor-Studiengänge mit Score und Begründung
- Meta-Informationen: Fach, Abschluss, Dauer, Sprache, NC
- Universitäts- und Bewerbungsfrist-Informationen (falls vorhanden)

### Feedback nach Empfehlungen
- Sterne-Bewertung (1–5)
- Match-Frage (ja / teilweise / nein)
- NPS-Skala (0–10)
- Offener Freitext (max. 500 Zeichen)
- Optional, anonym, mehrere Einträge pro Session möglich

### Teilen & Speichern
- **Per E-Mail senden:** Nutzer gibt E-Mail ein, Backend verschickt formatierte Empfehlungen
- **Teilbarer Link:** `https://abivio.de/?session=SESSION_ID`
- Link lädt Empfehlungen direkt beim Öffnen

### Chatbot
- Schwebender Studienberater-Button
- Regelbasierte FAQ-Shortcuts (kostenlos, schnell)
- KI-Antworten für studienrelevante Fragen
- Themen-Filter blockiert off-topic Fragen
- Max. 5 Nachrichten Verlauf, max. 350 Tokens pro Antwort
- Chat-Logs nur bei Einverständnis (opt-in)

---

## API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---|---|---|
| `GET` | `/api/health` | Health-Check |
| `POST` | `/api/waitlist` | E-Mail für Waitlist speichern |
| `POST` | `/api/quiz` | Quiz abschicken, Empfehlungen berechnen |
| `GET` | `/api/recommendations?session_id=...` | Empfehlungen abrufen |
| `POST` | `/api/feedback` | Feedback zu Empfehlungen speichern |
| `POST` | `/api/share/email` | Empfehlungen per E-Mail senden |
| `POST` | `/api/chat` | Studienberater-Chatbot |
| `GET` | `/api/programs` | Liste aller Studiengänge |
| `GET` | `/api/universities` | Liste aller Universitäten |
| `GET` | `/api/admin/feedback?key=...` | Feedback-Auswertung (Admin) |
| `GET` | `/api/admin/chat-logs?key=...` | Chat-Log-Auswertung (Admin) |

---

## Datenbank-Tabellen (D1)

| Tabelle | Zweck |
|---|---|
| `universities` | Deutsche Hochschulen aus dem Hochschulkompass |
| `programs` | Kuratierter Datensatz deutscher Bachelor-Studiengänge |
| `waitlist` | Waitlist-Einträge mit E-Mail und Abi-Jahr |
| `quiz_sessions` | Anonyme Quiz-Sessions |
| `quiz_answers` | Einzelantworten pro Session |
| `recommendations` | Berechnete Empfehlungen pro Session |
| `recommendation_feedback` | Anonymes Feedback zu Empfehlungen |
| `chat_logs` | Anonyme Chat-Logs (nur mit Einverständnis) |

---

## Konfiguration & Secrets

### In `wrangler.toml`
- `ENVIRONMENT`
- D1-Datenbank-Binding `DB`
- AI-Binding `AI`

### Secrets (über `wrangler pages secret put`)
- `ADMIN_API_KEY` — Zugriff auf Admin-Endpoints
- `RESEND_API_KEY` — E-Mail-Versand über Resend

### Analytics
- Cloudflare Web Analytics Script in `frontend/index.html`
- Token muss noch gegen echten Wert ersetzt werden

---

## Admin-Auswertung

### Feedback
```
GET /api/admin/feedback?key=ADMIN_API_KEY
```
Liefert:
- Gesamtanzahl Feedbacks
- Durchschnittliche Helpfulness
- Durchschnittlicher NPS
- Verteilung der Match-Frage
- Letzte 100 Einträge

### Chat-Logs
```
GET /api/admin/chat-logs?key=ADMIN_API_KEY
```
Liefert:
- Zusammenfassung nach Intent / Quelle / Modell
- Letzte 50 Einträge mit Einverständnis

---

## Offene To-Dos / Bekannte Lücken

1. Absender-Domain `noreply@abivio.de` in Resend verifizieren
2. Cloudflare Web Analytics Token ersetzen
3. Rate Limiting für API-Endpoints einführen
4. Rate Limiting für API-Endpoints einführen
5. E-Mail-Validierung für Waitlist verschärfen (z. B. MX-Check)
6. Chat-Budget pro Session/Tag limitieren
7. Entscheidung: User-Accounts / Magic-Link-Login

---

## Roadmap-Status

- ✅ Landingpage + Waitlist
- ✅ Interaktives Quiz
- ✅ Regelbasierte Empfehlungen
- ✅ Feedback-Formular
- ✅ Teilen per Link + E-Mail
- ✅ KI-Chatbot mit FAQ-Shortcuts
- ✅ Admin-Auswertung
- ⏳ Rate Limiting & Abuse-Schutz
- ⏳ Accounts / Magic Link
- ⏳ Erweiterter Studiengangsdatensatz

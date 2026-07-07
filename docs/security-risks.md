# Sicherheitsrisiken & Abuse-Potenzial — abivio.de

> Bearbeitbare Übersicht der aktuellen Risiken, offenen Maßnahmen und Architekturentscheidungen.
> Letzte Aktualisierung: 2026-07-08

---

## 1. Wie erkennen wir, dass Nutzer wiederkommen wollen?

Aktuell ist abivio komplett anonym. Das ist bewusst für den MVP, weil es Reibung vermeidet. Um zu merken, ob Nutzer Accounts oder eine Speicherfunktion wollen, können wir folgende Signale beobachten:

| Signal | Woher erkennbar? | Was es bedeutet |
|---|---|---|
| Hohe NPS / positive Sterne-Bewertung | `recommendation_feedback` | Nutzer finden das Tool gut — potenziell bereit, wiederkommen |
| Wiederholte Quiz-Durchläufe | `quiz_sessions` mit ähnlichen Antworten | Nutzer vergleichen oder sind unsicher |
| Feedback-Texte wie „kann ich das speichern?“ | `recommendation_feedback.missing` | Direkte Nachfrage nach Persistenz |
| Waitlist-Einträge mit E-Mail | `waitlist` | Bereitschaft, Kontakt zu erlauben |
| Hohe Chat-Nutzung | `chat_logs` | Nutzer investieren Zeit, wollen vielleicht Fortschritt speichern |
| Rückkehr über gleichen Browser / Referrer | Cloudflare Web Analytics | Indikator für wiederkehrende Besucher |

**Empfohlene nächste Schritte:**
1. Freitext-Feld im Feedback gezielt auswerten.
2. Nach 50–100 Feedbacks eine kleine Umfrage an Waitlist-Nutzer schicken.
3. 5–10 kurze Nutzerinterviews führen.

---

## 2. Was ist Magic-Link-Login?

Magic Link (auch „Passwordless Login“) bedeutet:

1. Nutzer gibt seine E-Mail-Adresse ein.
2. Backend erzeugt einen kurzlebigen, geheimen Link (z. B. 15 Minuten gültig).
3. Link wird an die E-Mail gesendet.
4. Nutzer klickt den Link — ist automatisch eingeloggt.
5. Kein Passwort nötig.

**Vorteile für abivio:**
- Sehr geringe Reibung (Abiturienten mögen keine Passwörter).
- Keine Passwort-Verwaltung nötig.
- E-Mail ist bereits über die Waitlist bekannt.

**Nachteile:**
- Abhängig von E-Mail-Zustellung.
- Etwas mehr Komplexität als reines Anonymous.

**Empfohlener Zeitpunkt:** Nach dem Launch, wenn mindestens ein klares Signal für wiederkehrende Nutzer vorliegt.

---

## 3. Empfehlungen speichern / senden — ohne Account

Ja, das ist ein sehr wahrscheinliches Nutzerbedürfnis. Man muss dafür aber nicht sofort Accounts einführen. Einfachere Varianten für den MVP:

| Variante | Aufwand | Datenschutz |
|---|---|---|
| **„Empfehlungen per E-Mail senden“**-Button | Mittel | E-Mail wird nur zum Versand verwendet |
| **Teilbarer Link mit `session_id`** | Niedrig | Session-ID ist zufällig, Link ist öffentlich aber nicht erratbar |
| **PDF / Bild exportieren** | Mittel | Vollständig lokal im Browser möglich |
| **Lokal im Browser speichern** | Niedrig | Kein Backend nötig |

**Empfehlung:** Nach dem Launch zuerst den teilbaren Link oder „Per Mail senden“ testen. Das deckt 80 % des Bedarfs ab, ohne Auth-Komplexität.

---

## 4. Was ist der Admin-Key?

Der Admin-Key ist ein geheimes Token, mit dem administrative Endpoints aufgerufen werden können.

- Name des Secrets: `ADMIN_API_KEY`
- Gesetzt als Cloudflare Pages Secret.
- Verwendung:
  ```
  https://abivio.de/api/admin/feedback?key=DEIN_ADMIN_KEY
  https://abivio.de/api/admin/chat-logs?key=DEIN_ADMIN_KEY
  ```
- Lokal gespeichert in `.admin-key.txt` (liegt in `.gitignore`, wird also nicht committed).

**Wichtig:** Der Key ist nur so sicher wie seine Aufbewahrung. Niemals im Code, nie in Chats oder Screenshots teilen.

---

## 5. Risiko-Register

| # | Risiko | Schwere | Wahrscheinlichkeit | Status | Gegenmaßnahme | Verantwortlich |
|---|---|---|---|---|---|---|
| 1 | Admin-Endpoints ohne Key zugänglich | Hoch | Hoch | ✅ Behoben | Key-Pflicht `if (!expectedKey \|\| providedKey !== expectedKey)` | — |
| 2 | Spam in Waitlist durch fehlendes Rate-Limit | Mittel | Mittel | ✅ Behoben | In-Memory pro-IP-Limit + DNS-MX-Check in `/api/waitlist` | — |
| 3 | Quiz-Spam füllt Datenbank | Mittel | Niedrig | ✅ Behoben | In-Memory pro-IP/Session-Limit in `/api/quiz` | — |
| 4 | Feedback-Spam / Manipulation | Mittel | Mittel | ✅ Behoben | In-Memory pro-IP + pro-Session-Limit in `/api/feedback` | — |
| 5 | Chat-Kosten durch unbegrenzte LLM-Nutzung | Hoch | Mittel | ✅ Behoben | Tägliches Budget pro IP/Session in D1 (`chat_usage`), Max. 5 Nachrichten, max. 350 Tokens | — |
| 6 | Topic-Filter wird umgangen | Mittel | Niedrig | ✅ Behoben | Jailbreak-Erkennung, erweiterte Blocklisten, Output-Moderation nach LLM-Antwort | — |
| 7 | Cloudflare Analytics Token ist Platzhalter | Niedrig | Hoch | ⚠️ Teils offen | Kommentar in `index.html`; Token muss im Cloudflare Dashboard generiert und eingetragen werden | Offen |
| 8 | Admin-Key-Leak | Hoch | Niedrig | ⚠️ Teils offen | Key in `wrangler secret` halten, regelmäßig rotieren, Admin-Endpoint `/api/admin/abuse` für Monitoring | Offen |
| 9 | Offene CORS-Konfiguration | Niedrig | Niedrig | ✅ Behoben | Explizite CORS-Headers nur für abivio-Domains + localhost | — |
| 10 | Keine Logging/Monitoring für Abuse | Mittel | Mittel | ✅ Behoben | `abuse_logs`-Tabelle, Admin-Endpoint `/api/admin/abuse`, Rate-Limit-Events werden geloggt | — |
| 11 | E-Mail-Validierung zu schwach | Mittel | Mittel | ✅ Behoben | Strikte Regex + optionaler DNS-MX-Check für Waitlist/E-Mail-Share | — |
| 12 | Session-ID ist clientseitig generiert | Niedrig | Mittel | ⚠️ Akzeptiert | Genügt für MVP; bei Accounts durch Server-Token ersetzen | Offen |

---

## 6. Empfohlene Priorisierung

### Sofort (vor/nach Launch)
1. Cloudflare Web Analytics Token ersetzen (`index.html` → `data-cf-beacon='{"token": "DEIN_TOKEN"}'`).
2. `ADMIN_API_KEY` per `wrangler secret put ADMIN_API_KEY` setzen und an einem sicheren Ort hinterlegen.
3. Migration `db/migration_006_security_rate_limits.sql` auf D1 ausführen.
4. (Optional) `EMAIL_VALIDATE_MX=true` aktivieren, um DNS-MX-Checks für Waitlist/E-Mail-Share zu erzwingen.

### Kurzfristig (1–2 Wochen nach Launch)
5. Admin-Key rotieren und alte Keys ungültig machen.
6. Feedback-Freitexte regelmäßig prüfen.
7. Erste 20–30 Nutzerinterviews oder Umfragen durchführen.

### Mittelfristig (nach ersten Erkenntnissen)
8. Entscheidung: Account/Magic Link ja/nein.
9. Entscheidung: Empfehlungen per E-Mail/Link teilbar machen.
10. Erweitertes Cloudflare-Monitoring (WAF, Bot Management) aktivieren.

---

## 7. Notizen

- Alle API-Inputs werden über parameterized queries an D1 gebunden — SQL-Injection ist aktuell kein Risiko.
- Keine IP-Adressen, E-Mails oder personenbezogenen Daten werden in Feedback/Chat-Logs gespeichert.
- Für Abuse-Monitoring werden **gehashte** IP-Adressen (SHA-256, truncated) in `chat_usage` und `abuse_logs` gespeichert — keine Roh-IPs.
- Die `session_id` ist eine zufällige Zeichenfolge und dient nur der Verknüpfung von Quiz, Empfehlungen und Feedback.
- Admin-Zugriff ist nur mit `ADMIN_API_KEY` möglich.
- Rate-Limiting läuft aktuell im Worker-Speicher (pro Isolate). Für produktiven Schutz vor verteilten Angriffen sollte zusätzlich Cloudflare Rate Limiting im Dashboard aktiviert werden.

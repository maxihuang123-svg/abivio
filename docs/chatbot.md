# abivio Chatbot — Dokumentation

Der abivio-Chatbot ist ein schwebender Studienberater auf der Startseite, der Abiturienten und Fachabiturienten Fragen zur Studienwahl, NCs, Bewerbung und Hochschulform beantwortet.

## Architektur

```
frontend/index.html   -> Chat-Container
frontend/chat.js      -> Chat-Logik (Vanilla JS)
frontend/styles.css   -> Chat-Styles
functions/api/[[route]].ts -> POST /api/chat Endpoint
wrangler.toml         -> AI-Binding für Workers AI
```

### Komponenten

| Komponente | Technologie | Zweck |
|------------|-------------|-------|
| Frontend | Vanilla JS, CSS | Schwebender Chat-Button + Chat-Fenster |
| Backend | Hono + Cloudflare Pages Functions | API-Endpoint, Validierung, Routing |
| KI-Modell | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`) | Natürlichsprachliche Antworten |

## API-Endpunkt

### `POST /api/chat`

Akzeptiert einen Chatverlauf und gibt eine Antwort zurück.

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "Was ist ein NC?" }
  ]
}
```

**Response:**

```json
{
  "response": "NC steht für Numerus clausus...",
  "model": "faq-shortcut",
  "cached": true
}
```

## Wie der Chatbot funktioniert

1. **Validierung** — Die Anfrage wird auf mindestens eine Nachricht geprüft.
2. **FAQ-Shortcut** — Häufige Fragen (z. B. „Was ist NC?“) werden regelbasiert beantwortet, ohne das LLM zu nutzen.
3. **Verlaufsbegrenzung** — Es werden nur die letzten 5 Nachrichten ans LLM gesendet, um Token-Kosten zu senken.
4. **System-Prompt** — Ein kurzer Prompt definiert Rolle, Themen und Grenzen des Beraters.
5. **LLM-Aufruf** — Cloudflare Workers AI generiert die Antwort mit `max_tokens: 350` und `temperature: 0.5`.
6. **Fehlerbehandlung** — Bei Ausfällen gibt der Endpoint eine freundliche Fehlermeldung zurück.

## Kostenoptimierung

Der Chatbot wurde bewusst kostengünstig konzipiert:

- **Regelbasierte FAQ-Shortcuts** für die häufigsten Fragen (kein LLM-Aufruf)
- **Kurzer System-Prompt** (unter 100 Wörter)
- **Begrenzte Antwortlänge** (`max_tokens: 350`)
- **Chatverlauf auf 5 Nachrichten begrenzt**
- **Kleines Modell** (8B statt 70B Parameter)

## Kostenabschätzung

Preise gültig ab Juli 2026 für `@cf/meta/llama-3.1-8b-instruct-fp8-fast`:

- Input: **$0,045 / 1 Million Tokens**
- Output: **$0,384 / 1 Million Tokens**

Bei einer typischen Anfrage mit 1.000 Input- und 300 Output-Tokens kostet ein LLM-Aufruf ca. **$0,00016**.

| Szenario | Anfragen/Monat | Geschätzte Kosten/Monat |
|----------|---------------|-------------------------|
| MVP / Soft-Launch | 1.500 | ~$0,25 |
| Wachstum | 15.000 | ~$2,40 |
| Etabliert | 30.000 | ~$4,80 |
| Hoher Traffic | 150.000 | ~$24,00 |

Hinweis: Durch FAQ-Shortcuts sinken die realen Kosten weiter, da viele Anfragen gar nicht das LLM erreichen.

## Restraints und Grenzen

Der Chatbot ist bewusst begrenzt:

- **Keine Rechtsberatung** — Bei rechtlichen Fragen wird auf offizielle Stellen verwiesen.
- **Keine medizinische oder psychologische Beratung** — Der Bot ersetzt keine professionelle Hilfe.
- **Keine Zulassungsgarantie** — NCs und Fristen können sich ändern; der Nutzer muss immer die Hochschulseite prüfen.
- **Nur Deutschland, nur Bachelor/Erststudium** — Keine Auskünfte zu Master, Ausbildung oder internationalen Studiengängen.
- **Keine personalisierten Empfehlungen** ohne Quiz — Für konkrete Studiengangsvorschläge wird auf das Quiz verwiesen.
- **Begrenzter Kontext** — Der Bot „vergisst“ alles vor den letzten 5 Nachrichten.
- **Keine Server-seitige Speicherung** — Der Chatverlauf liegt nur im Browser des Nutzers.

## Datenschutz

- Der Chatverlauf wird **nicht in der Datenbank gespeichert**.
- Anfragen werden an **Cloudflare Workers AI** weitergegeben.
- Es werden keine personenbezogenen Daten abgefragt (kein Name, keine E-Mail im Chat).
- Der Datenschutzhinweis der Seite (`datenschutz.html`) sollte um einen Absatz zum Chatbot ergänzt werden.

## Betrieb

### Lokal testen

```bash
npm run dev
```

Der Chat-Endpoint ist dann unter `http://localhost:8788/api/chat` erreichbar.

### Deploy

```bash
npm run deploy
```

Das AI-Binding wird automatisch durch `wrangler.toml` bereitgestellt:

```toml
[ai]
binding = "AI"
```

### Monitoring

- Cloudflare Workers AI Dashboard zeigt Neuron-Verbrauch an.
- Logs erscheinen in `wrangler tail` bzw. im Cloudflare Dashboard.

## Bekannte FAQ-Shortcuts

Derzeit werden diese Fragen regelbasiert beantwortet:

- Was ist der NC?
- Wie bewerbe ich mich für ein Studium?
- Unterschied Uni vs. FH
- Wie lange dauert ein Bachelor?
- Was ist ein Studiengang?
- Wie funktioniert abivio?
- Fachabitur und Studium
- Bewerbungsfristen

## Zukunftsausblick

- **RAG (Retrieval-Augmented Generation):** Studiengangsdaten aus D1 in den Kontext einbauen, damit der Bot konkrete Studiengänge empfehlen kann.
- **Personalisierung:** Quiz-Ergebnisse in den Chat einbeziehen.
- **Streaming:** Antworten Wort für Wort ausgeben statt als Block.
- **Intent-Erkennung verbessern:** Mehr FAQ-Shortcuts oder ein kleines Klassifikationsmodell.

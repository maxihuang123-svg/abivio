/**
 * Beispiel: Bildbasierte KI-Extraktion von Studiengangsdaten
 *
 * WARNUNG: Dieses Skript ist nur für erlaubte Quellen gedacht
 * (z. B. eigene Screenshots, PDFs mit Erlaubnis, freie Inhalte).
 *
 * Voraussetzung: OPENAI_API_KEY als Umgebungsvariable
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/extract-from-image.js pfad/zum/bild.png
 */

const fs = require('fs');

async function extractFromImage(imagePath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Fehler: OPENAI_API_KEY nicht gesetzt.');
    console.error('Setze den Key oder nutze dieses Skript nur als Vorlage.');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`Bild nicht gefunden: ${imagePath}`);
    process.exit(1);
  }

  const imageBase64 = fs.readFileSync(imagePath).toString('base64');

  const prompt = `Du siehst einen Screenshot einer Webseite über einen Studiengang.
Extrahiere daraus folgende Informationen und antworte als JSON:

{
  "name": "Name des Studiengangs",
  "degree": "Bachelor oder Master",
  "duration_semesters": 6,
  "language": "de oder en",
  "nc_required": true,
  "nc_grade": 2.5,
  "description": "Kurze Beschreibung (1–2 Sätze)",
  "career": "Typische Berufsperspektiven",
  "field": "Fachrichtung",
  "source_url": "URL der Seite, falls sichtbar"
}

Falls ein Wert nicht erkennbar ist, verwende null.
Antworte NUR mit gültigem JSON.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Strip possible markdown code block
  const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();

  return JSON.parse(cleanJson);
}

async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.log('Usage: OPENAI_API_KEY=sk-... node scripts/extract-from-image.js <pfad/zum/bild.png>');
    console.log('\nBeispiel ohne API-Key (nur zur Veranschaulichung):');
    console.log(JSON.stringify({
      name: 'Informatik',
      degree: 'Bachelor',
      duration_semesters: 6,
      language: 'de',
      nc_required: true,
      nc_grade: 2.5,
      description: 'Softwareentwicklung, Algorithmen, Künstliche Intelligenz.',
      career: 'Softwareentwickler, IT-Berater, Data Engineer',
      field: 'Technik & IT',
    }, null, 2));
    process.exit(0);
  }

  const result = await extractFromImage(imagePath);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Fehler:', err.message);
  process.exit(1);
});

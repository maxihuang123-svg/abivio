/**
 * LLM-Enrichment für Studiengangsdaten
 *
 * Dieses Skript nimmt eine strukturierte Liste von Studiengängen
 * und bereichert sie mit Beschreibungen, Berufsperspektiven und Tags.
 *
 * Voraussetzung: OPENAI_API_KEY als Umgebungsvariable oder in .env
 *
 * Achtung: LLM-Ausgaben müssen auf Richtigkeit geprüft werden.
 */

const fs = require('fs');
const path = require('path');

// Mock-Modus: Wenn kein API-Key vorhanden ist, werden Beispiel-Daten generiert
const USE_MOCK = !process.env.OPENAI_API_KEY;

const INTEREST_TAGS = [
  'technik', 'wirtschaft', 'medizin', 'natur', 'gesellschaft',
  'kreativ', 'sprachen', 'mensch', 'recht', 'kultur'
];

const STRENGTH_TAGS = [
  'mathematik', 'informatik', 'physik', 'chemie', 'biologie',
  'deutsch', 'englisch', 'geschichte', 'kunst', 'sport',
  'sozialkunde', 'geografie'
];

const WORKSTYLE_TAGS = [
  'analytisch', 'kreativ', 'praktisch', 'kommunikativ',
  'forschung', 'unternehmerisch', 'empathisch'
];

/**
 * Simuliert eine LLM-Anreicherung ohne API-Aufruf.
 * In der echten Version würde hier OpenAI/Claude aufgerufen.
 */
async function mockEnrich(program) {
  // Einfache regelbasierte Zuweisung als Demo
  const fieldToInterests = {
    'Technik & IT': ['technik', 'logik', 'digitales'],
    'Wirtschaft': ['wirtschaft', 'management', 'finanzen'],
    'Medizin & Gesundheit': ['medizin', 'mensch', 'gesundheit'],
    'Naturwissenschaften': ['natur', 'forschung', 'logik'],
    'Design': ['kreativ', 'design', 'technik'],
    'Recht': ['recht', 'gesellschaft', 'logik'],
    'Soziales': ['mensch', 'sozial', 'beratung'],
  };

  const fieldToStrengths = {
    'Technik & IT': ['mathematik', 'informatik'],
    'Wirtschaft': ['mathematik', 'deutsch'],
    'Medizin & Gesundheit': ['biologie', 'chemie'],
    'Naturwissenschaften': ['mathematik', 'physik'],
    'Design': ['kunst', 'informatik'],
    'Recht': ['deutsch', 'geschichte'],
    'Soziales': ['deutsch', 'sozialkunde'],
  };

  const interests = fieldToInterests[program.field] || ['mensch', 'gesellschaft'];
  const strengths = fieldToStrengths[program.field] || ['deutsch', 'englisch'];

  return {
    ...program,
    description: `${program.name} ist ein ${program.degree}-Studiengang im Bereich ${program.field}. ` +
                 `Er vermittelt fachspezifisches Wissen und Methodenkompetenz für den jeweiligen Berufsfeld.`,
    career: 'Berufsmöglichkeiten hängen von Schwerpunktsetzung und Praktika ab.',
    interests: JSON.stringify(interests),
    strengths: JSON.stringify(strengths),
    work_style: JSON.stringify(['analytisch', 'kommunikativ']),
  };
}

/**
 * Echte LLM-Anreicherung über OpenAI API.
 */
async function llmEnrich(program) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY nicht gesetzt');
  }

  const prompt = `Du bist ein deutscher Studienberater. Basierend auf diesen Fakten zu einem Studiengang:

Name: ${program.name}
Fachrichtung: ${program.field}
Abschluss: ${program.degree}
Dauer: ${program.duration_semesters} Semester
Sprache: ${program.language}

Erstelle ein JSON-Objekt mit diesen Feldern:
- description: Eine kurze, ansprechende Beschreibung (1–2 Sätze)
- career: Typische Berufsperspektiven (kommagetrennt)
- interests: Array mit 3–5 Interessen-Tags aus dieser Liste: ${INTEREST_TAGS.join(', ')}
- strengths: Array mit 2–4 passenden Schulfächern aus dieser Liste: ${STRENGTH_TAGS.join(', ')}
- work_style: Array mit 2–3 passenden Arbeitsstil-Tags aus dieser Liste: ${WORKSTYLE_TAGS.join(', ')}

Antworte NUR mit gültigem JSON, ohne Markdown-Formatierung.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const enrichment = JSON.parse(content);

  return {
    ...program,
    description: enrichment.description,
    career: enrichment.career,
    interests: JSON.stringify(enrichment.interests),
    strengths: JSON.stringify(enrichment.strengths),
    work_style: JSON.stringify(enrichment.work_style),
  };
}

async function main() {
  const inputPath = process.argv[2] || path.join(__dirname, '..', 'db', 'programs_raw.json');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'db', 'programs_enriched.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Datei nicht gefunden: ${inputPath}`);
    console.error('Erstelle zuerst eine Datei mit rohen Studiengangsdaten.');
    process.exit(1);
  }

  const programs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Bereichere ${programs.length} Studiengänge...`);

  if (USE_MOCK) {
    console.log('⚠️  Kein OPENAI_API_KEY gefunden — verwende Mock-Enrichment.');
  }

  const enriched = [];
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    console.log(`  [${i + 1}/${programs.length}] ${program.name}`);

    try {
      const result = USE_MOCK ? await mockEnrich(program) : await llmEnrich(program);
      enriched.push(result);

      // Rate limiting
      if (!USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(`    Fehler bei ${program.name}: ${err.message}`);
      enriched.push(program);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf8');
  console.log(`\nFertig. Ausgabe: ${outputPath}`);
}

main().catch(console.error);

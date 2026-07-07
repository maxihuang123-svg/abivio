/**
 * LLM-Enrichment für Studiengangsdaten
 *
 * Dieses Skript bereichert eine strukturierte Liste von Studiengängen
 * mit differenzierten Beschreibungen, Berufsperspektiven und Tags.
 *
 * Ausführung:
 *   OPENAI_API_KEY=... node scripts/enrich-programs.js [input.json] [output.json]
 *
 * Voreingestellt:
 *   Input:  db/programs_200_enriched.json
 *   Output: db/programs_200_enriched.json (überschreibt nur Enrichment-Felder)
 *
 * Features:
 *   - Resume-fähig über .cache/enrich-programs-cache.json
 *   - Kostenoptimiert mit gpt-4o-mini
 *   - Prompt zwingt zur Abgrenzung gegen ähnliche Studiengänge im selben Fach
 *   - Fehlerhafte Einträge werden übersprungen und können erneut angereichert werden
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK = !API_KEY;

const root = path.resolve(__dirname, '..');
const inputPath = process.argv[2] || path.join(root, 'db', 'programs_200_enriched.json');
const outputPath = process.argv[3] || inputPath;
const cacheDir = path.join(root, '.cache');
const cachePath = path.join(cacheDir, 'enrich-programs-cache.json');

const INTEREST_TAGS = [
  'technik', 'wirtschaft', 'medizin', 'natur', 'gesellschaft',
  'kreativ', 'sprachen', 'mensch', 'recht', 'kultur',
  'logik', 'digitales', 'handwerk', 'energie', 'fahrzeuge',
  'management', 'finanzen', 'unternehmertum', 'gesundheit',
  'forschung', 'labor', 'design', 'medien', 'kommunikation',
  'politik', 'sozial', 'beratung', 'bildung', 'umwelt',
  'sport', 'literatur', 'geschichte', 'kunst', 'musik',
  'reisen', 'nachhaltigkeit', 'daten', 'struktur', 'strategie'
];

const STRENGTH_TAGS = [
  'mathematik', 'informatik', 'physik', 'chemie', 'biologie',
  'deutsch', 'englisch', 'geschichte', 'kunst', 'sport',
  'sozialkunde', 'geografie', 'franzoesisch', 'spanisch',
  'musik', 'religion', 'philosophie', 'wirtschaft'
];

const WORKSTYLE_TAGS = [
  'analytisch', 'kreativ', 'praktisch', 'kommunikativ',
  'forschung', 'unternehmerisch', 'empathisch', 'strukturiert',
  'selbstaendig', 'teamfaehig', 'detailorientiert', 'zielorientiert',
  'problemloesend', 'konzeptionell', 'experimentell'
];

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

function loadCache() {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  ensureCacheDir();
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

function cacheKey(program) {
  // Stable key based on the fields that drive the enrichment.
  return `${program.name}|${program.field}|${program.degree}|${program.language}`;
}

/**
 * Simuliert eine LLM-Anreicherung ohne API-Aufruf.
 * Wird verwendet, wenn kein OPENAI_API_KEY gesetzt ist.
 */
async function mockEnrich(program) {
  const field = program.field;

  const fieldToDescription = {
    'Technik & IT': `Im ${program.name}-Studium lernst du, digitale Systeme, Software und Daten zu verstehen, zu gestalten und weiterzuentwickeln.`,
    'Ingenieurwesen': `Das ${program.name}-Studium vermittelt ingenieurwissenschaftliche Grundlagen und Methoden zur Entwicklung technischer Lösungen.`,
    'Wirtschaft': `Im ${program.name}-Studium erwirbst du betriebswirtschaftliches Know-how und lernst, Unternehmen zu führen und zu optimieren.`,
    'Medizin & Gesundheit': `Das ${program.name}-Studium bereitet dich auf Berufe im Gesundheitswesen vor und vermittelt medizinische und pflegerische Kompetenzen.`,
    'Naturwissenschaften': `Im ${program.name}-Studium erforschst du naturwissenschaftliche Zusammenhänge und arbeitest analytisch sowie experimentell.`,
    'Design': `Das ${program.name}-Studium verbindet Kreativität mit technischem Verständnis und lehrt dich, Produkte und Medien zu gestalten.`,
    'Medien': `Im ${program.name}-Studium beschäftigst du dich mit Journalismus, Kommunikation, Medienproduktion und deren gesellschaftlicher Wirkung.`,
    'Recht': `Das ${program.name}-Studium vermittelt Rechtskenntnisse und die Fähigkeit, komplexe Sachverhalte juristisch zu analysieren.`,
    'Soziales': `Im ${program.name}-Studium lernst du, Menschen in schwierigen Lebenslagen zu unterstützen und soziale Projekte zu gestalten.`,
    'Geisteswissenschaften': `Das ${program.name}-Studium fördert analytisches Denken und ein vertieftes Verständnis von Kultur, Geschichte und Gesellschaft.`,
    'Sprachen': `Im ${program.name}-Studium vertiefst du Sprachkenntnisse und beschäftigst dich mit Literatur, Kultur und Übersetzung.`,
    'Kunst': `Das ${program.name}-Studium entwickelt deine künstlerischen Fähigkeiten und vermittelt theoretisches Wissen über Kunst und Kultur.`,
    'Umwelt': `Im ${program.name}-Studium beschäftigst du dich mit ökologischen, naturwissenschaftlichen und gesellschaftlichen Aspekten der Umwelt.`,
    'Sport': `Das ${program.name}-Studium verbindet Sportwissenschaft mit Gesundheit, Management oder pädagogischen Inhalten.`,
    'Lehramt': `Das ${program.name}-Studium bereitet dich auf den Lehrberuf vor und vermittelt Fachwissen sowie Didaktik.`,
    'Interdisziplinär': `Das ${program.name}-Studium verbindet verschiedene Disziplinen und bereitet dich auf komplexe, fachübergreifende Aufgaben vor.`,
  };

  const fieldToCareer = {
    'Technik & IT': 'Softwareentwickler, IT-Berater, Data Engineer, Produktmanager',
    'Ingenieurwesen': 'Ingenieur, Projektleiter, Konstrukteur, F&E-Spezialist',
    'Wirtschaft': 'Consultant, Controller, Marketingmanager, Unternehmensberater',
    'Medizin & Gesundheit': 'Arzt, Psychologe, Therapeut, Gesundheitsmanager',
    'Naturwissenschaften': 'Forscher, Laborleiter, Qualitätsmanager, Berater',
    'Design': 'Designer, Art Director, UX-Designer, Produktdesigner',
    'Medien': 'Journalist, PR-Manager, Content Manager, Medienberater',
    'Recht': 'Rechtsanwalt, Unternehmensjurist, Richter, Compliance-Manager',
    'Soziales': 'Sozialarbeiter, Jugendhilfe, Berater, Projektmanager',
    'Geisteswissenschaften': 'Journalist, Kulturmanager, Lehrer, Berater',
    'Sprachen': 'Lehrer, Übersetzer, Lektor, Kommunikationsmanager',
    'Kunst': 'Künstler, Kulturmanager, Lehrer, Kurator',
    'Umwelt': 'Umweltberater, Naturschützer, Klimamanager, Forscher',
    'Sport': 'Trainer, Sportmanager, Gesundheitsberater, Lehrer',
    'Lehramt': 'Lehrer, Bildungsmanager, Coach',
    'Interdisziplinär': 'Berater, Projektmanager, Forscher, Fachexperte',
  };

  const description = fieldToDescription[field] || `${program.name} ist ein ${program.degree}-Studiengang im Bereich ${field}.`;
  const career = fieldToCareer[field] || 'Berufsmöglichkeiten hängen von Schwerpunktsetzung und Praktika ab.';

  return {
    ...program,
    description,
    career,
  };
}

/**
 * Echte LLM-Anreicherung über OpenAI API.
 */
async function llmEnrich(program) {
  if (!API_KEY) {
    throw new Error('OPENAI_API_KEY nicht gesetzt');
  }

  const prompt = `Du bist ein deutscher Studienberater. Erstelle eine präzise, ansprechende Beschreibung und passende Berufsperspektiven für diesen konkreten Studiengang. Wichtig: Grenze den Studiengang deutlich von ähnlichen Studiengängen im Fachbereich "${program.field}" ab und nenne die spezifischen Inhalte, Methoden oder Ziele, die ihn einzigartig machen.

Name: ${program.name}
Fachbereich: ${program.field}
Abschluss: ${program.degree}
Dauer: ${program.duration_semesters} Semester
Sprache: ${program.language === 'en' ? 'Englisch' : 'Deutsch'}

Erstelle ein JSON-Objekt mit diesen Feldern:
- description: 1–2 Sätze, was diesen Studiengang konkret auszeichnet (max. 240 Zeichen).
- career: 3–5 typische Berufsperspektiven, kommagetrennt, passend zum konkreten Studiengang.
- interests: Array mit 3–5 Interessen-Tags aus dieser Liste: ${INTEREST_TAGS.join(', ')}
- strengths: Array mit 2–4 passenden Schulfächern aus dieser Liste: ${STRENGTH_TAGS.join(', ')}
- work_style: Array mit 2–3 passenden Arbeitsstil-Tags aus dieser Liste: ${WORKSTYLE_TAGS.join(', ')}

Antworte NUR mit gültigem JSON, ohne Markdown-Formatierung, ohne Erklärungen. Beispielformat:
{"description":"...","career":"...","interests":["..."],"strengths":["..."],"work_style":["..."]}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 350,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Leere Antwort von OpenAI API');
  }

  let enrichment;
  try {
    enrichment = JSON.parse(content);
  } catch {
    // Sometimes the model wraps JSON in markdown code fences.
    const cleaned = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    enrichment = JSON.parse(cleaned);
  }

  const normalizeArray = (val) => {
    if (Array.isArray(val)) return val.map((s) => String(s).trim().toLowerCase());
    if (typeof val === 'string') return val.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    return [];
  };

  return {
    ...program,
    description: enrichment.description || program.description,
    career: enrichment.career || program.career,
    interests: JSON.stringify(normalizeArray(enrichment.interests).slice(0, 5)),
    strengths: JSON.stringify(normalizeArray(enrichment.strengths).slice(0, 4)),
    work_style: JSON.stringify(normalizeArray(enrichment.work_style).slice(0, 3)),
  };
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Datei nicht gefunden: ${inputPath}`);
    process.exit(1);
  }

  const programs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Lade ${programs.length} Studiengänge aus ${inputPath}`);

  if (USE_MOCK) {
    console.log('⚠️  Kein OPENAI_API_KEY gefunden — verwende Mock-Enrichment.');
  } else {
    console.log('🔑 OpenAI API-Key gefunden — starte LLM-Enrichment.');
    console.log(`   Geschätzte Kosten: ~$${(programs.length * 0.003).toFixed(2)}-${(programs.length * 0.006).toFixed(2)} (gpt-4o-mini, ${programs.length} Aufrufe)`);
  }

  const cache = loadCache();
  const enriched = [];
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    const key = cacheKey(program);
    const label = `${program.name} (${program.field})`;

    // Re-use cached enrichment if the program hasn't changed.
    if (cache[key] && !USE_MOCK) {
      console.log(`  [${i + 1}/${programs.length}] ${label} — aus Cache`);
      enriched.push({ ...program, ...cache[key] });
      continue;
    }

    console.log(`  [${i + 1}/${programs.length}] ${label}`);

    try {
      const result = USE_MOCK ? await mockEnrich(program) : await llmEnrich(program);
      enriched.push(result);

      if (!USE_MOCK) {
        cache[key] = {
          description: result.description,
          career: result.career,
          interests: result.interests,
          strengths: result.strengths,
          work_style: result.work_style,
        };
        saveCache(cache);
        // Rate limiting: be gentle with the API.
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (err) {
      console.error(`    ❌ Fehler bei ${label}: ${err.message}`);
      enriched.push(program);
      failed++;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf8');

  console.log(`\n✅ Fertig.`);
  console.log(`   Ausgabe: ${outputPath}`);
  console.log(`   Erfolgreich: ${programs.length - failed - skipped}, Fehler: ${failed}, Aus Cache: ${skipped}`);
  console.log(`   Cache: ${cachePath}`);
}

main().catch((err) => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});

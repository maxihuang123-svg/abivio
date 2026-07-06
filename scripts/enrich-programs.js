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
  const name = program.name.toLowerCase();
  const field = program.field;

  // Interessen-Tags nach Fachrichtung
  const fieldToInterests = {
    'Technik & IT': ['technik', 'logik', 'digitales', 'mathematik'],
    'Ingenieurwesen': ['technik', 'handwerk', 'energie', 'fahrzeuge'],
    'Wirtschaft': ['wirtschaft', 'management', 'finanzen', 'unternehmertum'],
    'Medizin & Gesundheit': ['medizin', 'mensch', 'gesundheit', 'beratung'],
    'Naturwissenschaften': ['natur', 'forschung', 'logik', 'labor'],
    'Design': ['kreativ', 'design', 'medien', 'technik'],
    'Medien': ['medien', 'kommunikation', 'kultur', 'kreativ'],
    'Recht': ['recht', 'gesellschaft', 'logik', 'politik'],
    'Soziales': ['mensch', 'sozial', 'beratung', 'gesellschaft'],
    'Geisteswissenschaften': ['kultur', 'sprachen', 'geschichte', 'forschung'],
    'Sprachen': ['sprachen', 'kultur', 'literatur', 'reisen'],
    'Kunst': ['kunst', 'kreativ', 'musik', 'kultur'],
    'Umwelt': ['natur', 'umwelt', 'forschung', 'gesellschaft'],
    'Sport': ['sport', 'gesundheit', 'mensch', 'management'],
    'Lehramt': ['mensch', 'bildung', 'gesellschaft', 'kommunikation'],
    'Interdisziplinär': ['technik', 'mensch', 'forschung', 'logik'],
  };

  // Schulfächer nach Fachrichtung
  const fieldToStrengths = {
    'Technik & IT': ['mathematik', 'informatik', 'physik'],
    'Ingenieurwesen': ['mathematik', 'physik', 'chemie'],
    'Wirtschaft': ['mathematik', 'deutsch', 'englisch'],
    'Medizin & Gesundheit': ['biologie', 'chemie', 'mathematik'],
    'Naturwissenschaften': ['mathematik', 'chemie', 'biologie'],
    'Design': ['kunst', 'informatik', 'mathematik'],
    'Medien': ['deutsch', 'englisch', 'kunst'],
    'Recht': ['deutsch', 'geschichte', 'englisch'],
    'Soziales': ['deutsch', 'sozialkunde', 'biologie'],
    'Geisteswissenschaften': ['deutsch', 'geschichte', 'englisch'],
    'Sprachen': ['englisch', 'deutsch', 'geschichte'],
    'Kunst': ['kunst', 'deutsch', 'englisch'],
    'Umwelt': ['biologie', 'chemie', 'geografie'],
    'Sport': ['sport', 'biologie', 'mathematik'],
    'Lehramt': ['deutsch', 'mathematik', 'englisch'],
    'Interdisziplinär': ['mathematik', 'biologie', 'informatik'],
  };

  // Beschreibungen nach Fachrichtung
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

  // Berufsperspektiven nach Fachrichtung
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

  // Arbeitstile nach Fachrichtung
  const fieldToWorkStyle = {
    'Technik & IT': ['analytisch', 'problemloesend', 'selbstaendig'],
    'Ingenieurwesen': ['praktisch', 'analytisch', 'teamfaehig'],
    'Wirtschaft': ['kommunikativ', 'strategisch', 'zielorientiert'],
    'Medizin & Gesundheit': ['empathisch', 'praezise', 'belastbar'],
    'Naturwissenschaften': ['analytisch', 'experimentell', 'geduldig'],
    'Design': ['kreativ', 'visuell', 'detailorientiert'],
    'Medien': ['kommunikativ', 'recherchefreudig', 'textgewandt'],
    'Recht': ['analytisch', 'sprachgewandt', 'konfliktfaehig'],
    'Soziales': ['empathisch', 'kommunikativ', 'praktisch'],
    'Geisteswissenschaften': ['analytisch', 'recherchefreudig', 'kritisch'],
    'Sprachen': ['sprachgewandt', 'kommunikativ', 'kulturell'],
    'Kunst': ['kreativ', 'ausdrucksstark', 'selbstaendig'],
    'Umwelt': ['engagiert', 'analytisch', 'praktisch'],
    'Sport': ['praktisch', 'motivierend', 'teamfaehig'],
    'Lehramt': ['kommunikativ', 'geduldig', 'strukturiert'],
    'Interdisziplinär': ['analytisch', 'kommunikativ', 'flexibel'],
  };

  const interests = fieldToInterests[field] || ['mensch', 'gesellschaft'];
  const strengths = fieldToStrengths[field] || ['deutsch', 'englisch'];
  const description = fieldToDescription[field] || `${program.name} ist ein ${program.degree}-Studiengang im Bereich ${field}.`;
  const career = fieldToCareer[field] || 'Berufsmöglichkeiten hängen von Schwerpunktsetzung und Praktika ab.';
  const workStyle = fieldToWorkStyle[field] || ['analytisch', 'kommunikativ'];

  return {
    ...program,
    description,
    career,
    interests: JSON.stringify(interests.slice(0, 4)),
    strengths: JSON.stringify(strengths.slice(0, 3)),
    work_style: JSON.stringify(workStyle),
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

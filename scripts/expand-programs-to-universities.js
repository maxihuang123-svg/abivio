// Expands generic programs into university-specific offerings for top German universities.
// Focus: Bachelor programs with 15.07. winter-semester application deadline.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputProgramsPath = path.join(root, 'db', 'programs_200_enriched.json');
const inputUniversitiesPath = path.join(root, 'db', 'universities_seed.json');
const outputJsonPath = path.join(root, 'db', 'programs_expanded.json');
const outputSqlPath = path.join(root, 'db', 'seed_expanded.sql');

const TOP_UNIVERSITY_SHORT_NAMES = [
  'München TUM', 'München U', 'Heidelberg U', 'Köln U', 'Hamburg U',
  'Berlin FU', 'Berlin HU', 'Berlin TU', 'Aachen TH', 'Tübingen U',
  'Göttingen U', 'Freiburg U', 'Frankfurt am Main U', 'Stuttgart U', 'Darmstadt TU',
  'Münster U', 'Karlsruhe U KIT', 'Bonn U', 'Düsseldorf U', 'Bochum U',
  'Dortmund TU', 'Leipzig U', 'Mainz U', 'Saarbrücken U', 'Jena U',
  'Kiel U', 'Mannheim U', 'Regensburg U', 'Marburg U', 'Konstanz U',
  'Dresden TU', 'Bremen U'
];

const FIELD_UNIVERSITY_MAP = {
  'Technik & IT': ['München TUM', 'Aachen TH', 'Karlsruhe U KIT', 'Berlin TU', 'Darmstadt TU', 'Dresden TU', 'Dortmund TU', 'Stuttgart U', 'München U', 'Bochum U'],
  'Ingenieurwesen': ['München TUM', 'Aachen TH', 'Karlsruhe U KIT', 'Berlin TU', 'Darmstadt TU', 'Dresden TU', 'Dortmund TU', 'Stuttgart U', 'Bochum U', 'Bremen U'],
  'Wirtschaft': ['Mannheim U', 'Köln U', 'München U', 'Frankfurt am Main U', 'Berlin FU', 'Münster U', 'Hamburg U', 'Aachen TH'],
  'Medizin & Gesundheit': ['Heidelberg U', 'München U', 'Berlin FU', 'Berlin HU', 'Hamburg U', 'Köln U', 'Tübingen U', 'Freiburg U', 'Bonn U', 'Düsseldorf U', 'Aachen TH'],
  'Naturwissenschaften': ['München TUM', 'Heidelberg U', 'Göttingen U', 'Freiburg U', 'Bonn U', 'Mainz U', 'Jena U', 'Kiel U', 'Karlsruhe U KIT', 'München U'],
  'Design': ['Berlin FU', 'Berlin HU', 'München U', 'Hamburg U', 'Köln U', 'Frankfurt am Main U', 'Dresden TU'],
  'Medien': ['Berlin FU', 'Berlin HU', 'München U', 'Hamburg U', 'Köln U', 'Frankfurt am Main U', 'Leipzig U'],
  'Recht': ['München U', 'Berlin HU', 'Köln U', 'Frankfurt am Main U', 'Heidelberg U', 'Hamburg U', 'Bonn U'],
  'Soziales': ['München U', 'Berlin FU', 'Berlin HU', 'Köln U', 'Hamburg U', 'Mannheim U'],
  'Geisteswissenschaften': ['München U', 'Berlin FU', 'Berlin HU', 'Heidelberg U', 'Tübingen U', 'Göttingen U', 'Freiburg U', 'Köln U', 'Hamburg U'],
  'Sprachen': ['München U', 'Berlin FU', 'Berlin HU', 'Heidelberg U', 'Tübingen U', 'Freiburg U', 'Hamburg U', 'Köln U', 'Mainz U'],
  'Kunst': ['Berlin FU', 'Berlin HU', 'München U', 'Hamburg U', 'Dresden TU', 'Frankfurt am Main U', 'Leipzig U'],
  'Umwelt': ['München TUM', 'Berlin TU', 'Freiburg U', 'Göttingen U', 'Karlsruhe U KIT', 'Kiel U'],
  'Sport': ['Berlin FU', 'Köln U', 'Hamburg U', 'Heidelberg U', 'München U'],
  'Lehramt': ['München U', 'Berlin FU', 'Berlin HU', 'Heidelberg U', 'Tübingen U', 'Freiburg U', 'Göttingen U', 'Köln U', 'Hamburg U', 'Münster U', 'Dresden TU', 'Mainz U'],
  'Interdisziplinär': ['München U', 'Berlin FU', 'Berlin HU', 'Heidelberg U', 'Hamburg U', 'Köln U', 'Frankfurt am Main U']
};

const ENGLISH_FRIENDLY_UNIS = [
  'München TUM', 'Aachen TH', 'Karlsruhe U KIT', 'Berlin TU', 'Darmstadt TU',
  'Dresden TU', 'Dortmund TU', 'Stuttgart U', 'Frankfurt am Main U', 'Mannheim U',
  'Köln U', 'Berlin FU', 'Hamburg U', 'München U', 'Bonn U'
];

const WINTER_DEADLINE = '2026-07-15';
const SUMMER_DEADLINE = '2027-01-15';

const FIELD_FLAGS = {
  'Technik & IT': { is_stem: 1, is_business: 0, is_social: 0, is_creative: 0, is_health: 0 },
  'Ingenieurwesen': { is_stem: 1, is_business: 0, is_social: 0, is_creative: 0, is_health: 0 },
  'Wirtschaft': { is_stem: 0, is_business: 1, is_social: 0, is_creative: 0, is_health: 0 },
  'Medizin & Gesundheit': { is_stem: 0, is_business: 0, is_social: 0, is_creative: 0, is_health: 1 },
  'Naturwissenschaften': { is_stem: 1, is_business: 0, is_social: 0, is_creative: 0, is_health: 0 },
  'Design': { is_stem: 0, is_business: 0, is_social: 0, is_creative: 1, is_health: 0 },
  'Medien': { is_stem: 0, is_business: 0, is_social: 0, is_creative: 1, is_health: 0 },
  'Recht': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Soziales': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Geisteswissenschaften': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Sprachen': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Kunst': { is_stem: 0, is_business: 0, is_social: 0, is_creative: 1, is_health: 0 },
  'Umwelt': { is_stem: 1, is_business: 0, is_social: 0, is_creative: 0, is_health: 0 },
  'Sport': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Lehramt': { is_stem: 0, is_business: 0, is_social: 1, is_creative: 0, is_health: 0 },
  'Interdisziplinär': { is_stem: 0, is_business: 0, is_social: 0, is_creative: 0, is_health: 0 }
};

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUniversities(program, uniMap, count) {
  const candidates = FIELD_UNIVERSITY_MAP[program.field] || FIELD_UNIVERSITY_MAP['Interdisziplinär'];
  const available = candidates.filter((shortName) => uniMap.has(shortName));

  if (available.length === 0) return [];

  let ordered = available;
  if (program.language === 'en') {
    const englishFirst = available.filter((u) => ENGLISH_FRIENDLY_UNIS.includes(u));
    const rest = available.filter((u) => !ENGLISH_FRIENDLY_UNIS.includes(u));
    ordered = [...englishFirst, ...rest];
  }

  const base = ordered.slice(0, Math.min(count + 2, ordered.length));
  const shuffled = shuffleArray(base);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return value;
  return charEncode(String(value));
}

function charEncode(text) {
  if (text === '') return "''";
  let result = '';
  let literalPart = '';

  function flushLiteral() {
    if (literalPart.length > 0) {
      if (result.length > 0) result += ' || ';
      result += `'${literalPart.replace(/'/g, "''")}'`;
      literalPart = '';
    }
  }

  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code > 127) {
      flushLiteral();
      if (result.length > 0) result += ' || ';
      result += `char(${code})`;
    } else {
      literalPart += char;
    }
  }

  flushLiteral();
  return result === '' ? "''" : result;
}

function generateSql(programs) {
  const columns = [
    'university_id', 'name', 'field', 'degree', 'duration_semesters', 'language',
    'nc_required', 'nc_grade', 'description', 'career', 'interests', 'strengths',
    'work_style', 'tuition_per_semester', 'is_stem', 'is_business', 'is_social',
    'is_creative', 'is_health', 'popularity_rank', 'application_deadline_winter', 'application_deadline_summer'
  ];

  const lines = ['DELETE FROM recommendations;', 'DELETE FROM programs;', ''];
  const batchSize = 10;

  for (let i = 0; i < programs.length; i += batchSize) {
    const batch = programs.slice(i, i + batchSize);
    const values = batch.map((p) => {
      const vals = columns.map((col) => escapeSql(p[col]));
      return '  (' + vals.join(', ') + ')';
    }).join(',\n');
    lines.push('INSERT INTO programs (' + columns.join(', ') + ') VALUES\n' + values + ';\n');
  }

  return lines.join('\n');
}

function main() {
  const programs = loadJson(inputProgramsPath);
  const universities = loadJson(inputUniversitiesPath);

  const topUniversities = universities.filter((u) => TOP_UNIVERSITY_SHORT_NAMES.includes(u.short_name));
  const uniMap = new Map(topUniversities.map((u) => [u.short_name, u]));

  console.log('Top universities selected: ' + topUniversities.length);

  const expanded = [];
  let id = 1;

  programs.forEach((program, programIndex) => {
    const uniShortNames = pickUniversities(program, uniMap, 5);
    const flags = FIELD_FLAGS[program.field] || FIELD_FLAGS['Interdisziplinär'];
    const baseRank = program.popularity_rank ?? (programIndex + 1);

    for (const shortName of uniShortNames) {
      const uni = uniMap.get(shortName);
      const city = shortName.split(' ')[0];

      expanded.push({
        id: id++,
        university_id: uni.hs_number,
        name: program.name + ' (' + city + ')',
        field: program.field,
        degree: program.degree,
        duration_semesters: program.duration_semesters,
        language: program.language,
        nc_required: program.nc_required ? 1 : 0,
        nc_grade: program.nc_grade,
        description: program.description,
        career: program.career,
        interests: program.interests,
        strengths: program.strengths,
        work_style: program.work_style,
        tuition_per_semester: program.tuition_per_semester || 0,
        is_stem: program.is_stem ?? flags.is_stem,
        is_business: program.is_business ?? flags.is_business,
        is_social: program.is_social ?? flags.is_social,
        is_creative: program.is_creative ?? flags.is_creative,
        is_health: program.is_health ?? flags.is_health,
        popularity_rank: baseRank,
        application_deadline_winter: WINTER_DEADLINE,
        application_deadline_summer: SUMMER_DEADLINE
      });
    }
  });

  saveJson(outputJsonPath, expanded);
  fs.writeFileSync(outputSqlPath, generateSql(expanded), 'utf8');

  console.log('Expanded programs: ' + expanded.length);
  console.log('JSON: ' + outputJsonPath);
  console.log('SQL:  ' + outputSqlPath);
}

main();

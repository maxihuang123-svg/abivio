/**
 * Wandelt angereicherte Studiengangsdaten (JSON) in ein D1-Seed-SQL-Skript um.
 */

const fs = require('fs');
const path = require('path');

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

function charEncode(text) {
  if (text === null || text === undefined) return 'NULL';
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

function getCategoryFlags(field) {
  const flags = {
    is_stem: 0,
    is_business: 0,
    is_social: 0,
    is_creative: 0,
    is_health: 0,
  };

  switch (field) {
    case 'Technik & IT':
    case 'Ingenieurwesen':
    case 'Naturwissenschaften':
    case 'Umwelt':
      flags.is_stem = 1;
      break;
    case 'Wirtschaft':
    case 'Sport':
      flags.is_business = 1;
      break;
    case 'Medizin & Gesundheit':
      flags.is_health = 1;
      break;
    case 'Soziales':
    case 'Recht':
    case 'Lehramt':
      flags.is_social = 1;
      break;
    case 'Design':
    case 'Medien':
    case 'Kunst':
    case 'Geisteswissenschaften':
    case 'Sprachen':
      flags.is_creative = 1;
      break;
    case 'Interdisziplinär':
      flags.is_stem = 1;
      flags.is_social = 1;
      break;
  }

  return flags;
}

function getPopularityRank(program) {
  // Simple popularity heuristic based on commonness
  const popular = ['Informatik', 'BWL', 'Medizin', 'Psychologie', 'Maschinenbau', 'Elektrotechnik', 'Wirtschaftsinformatik', 'Jura', 'Rechtswissenschaft'];
  if (popular.includes(program.name)) return popular.indexOf(program.name) + 1;
  return 50 + Math.floor(Math.random() * 200);
}

function main() {
  const inputPath = process.argv[2] || path.join(__dirname, '..', 'db', 'programs_200_enriched.json');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'db', 'seed_200.sql');

  const programs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  let sql = '-- Seed data for 200 German Bachelor programs (MVP)\n';
  sql += '-- Generated from manual curation + LLM enrichment\n\n';
  sql += 'DELETE FROM recommendations;\n';
  sql += 'DELETE FROM programs;\n\n';

  const batchSize = 50;
  for (let i = 0; i < programs.length; i += batchSize) {
    const batch = programs.slice(i, i + batchSize);
    sql += 'INSERT INTO programs (university_id, name, field, degree, duration_semesters, language, nc_required, nc_grade, description, career, interests, strengths, work_style, tuition_per_semester, is_stem, is_business, is_social, is_creative, is_health, popularity_rank) VALUES\n';

    const rows = batch.map((p) => {
      const flags = getCategoryFlags(p.field);
      return `  (NULL, ${charEncode(p.name)}, ${charEncode(p.field)}, ${charEncode(p.degree)}, ${p.duration_semesters}, ${charEncode(p.language)}, ${p.nc_required ? 1 : 0}, ${p.nc_grade ?? 'NULL'}, ${charEncode(p.description)}, ${charEncode(p.career)}, ${charEncode(p.interests)}, ${charEncode(p.strengths)}, ${charEncode(p.work_style)}, 0, ${flags.is_stem}, ${flags.is_business}, ${flags.is_social}, ${flags.is_creative}, ${flags.is_health}, ${getPopularityRank(p)})`;
    });

    sql += rows.join(',\n') + ';\n';
  }

  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`SQL seed generated: ${outputPath}`);
  console.log(`Programs: ${programs.length}`);
}

main();

/**
 * Bereinigt den angereicherten Studiengangsdatensatz um bekannte Fehleinträge.
 * - Entfernt Studiengänge, die in Deutschland nicht als Bachelor an Universitäten existieren
 *   oder nur als Master/Schwerpunkt angeboten werden.
 * - Entfernt exakte Dubletten (gleicher Name).
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'db', 'programs_200_enriched.json');
const outputPath = process.argv[3] || inputPath;

const BLOCKLIST = new Set([
  // Nicht als Bachelor-Studiengang in Deutschland existent / weitgehend halluziniert
  'Hüttenwesen',

  // In der Regel nur als Master oder Schwerpunkt innerhalb eines Bachelor-Studiengangs
  'Robotik',
  'Human-Computer Interaction',
  'Machine Learning',
  'Data Engineering',

  // Sehr selten als eigenständiger Uni-Bachelor; eher Schwerpunkt/Master/FH
  'Cloud Computing',
  'Blockchain-Technologie',
  'Bergbau',
  'Raumfahrttechnik',
  'Tiefbau',
  'Wasserwesen',
  'Gebäudetechnik',
  'Feinwerktechnik',
  'Schiffbau',
  'Optotechnik',

  // Eher Fachhochschulen / Kunsthochschulen / kirchliche Hochschulen
  'Möbeldesign',
  'Radiojournalismus',
  'Fernsehjournalismus',
  'Crossmedia',
  'Gemeindediakonie',
  'Nonprofit-Management',
  'Schauspiel',
  'Regie',
  'Tanz',
  'Fotografie',
]);

function main() {
  const programs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const before = programs.length;

  const seen = new Set();
  const cleaned = [];

  for (const program of programs) {
    if (BLOCKLIST.has(program.name)) {
      console.log(`Blocklisted: ${program.name}`);
      continue;
    }
    if (seen.has(program.name)) {
      console.log(`Duplicate removed: ${program.name}`);
      continue;
    }
    seen.add(program.name);
    cleaned.push(program);
  }

  fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2), 'utf8');
  console.log(`\nBefore: ${before} programs`);
  console.log(`After:  ${cleaned.length} programs`);
  console.log(`Removed: ${before - cleaned.length}`);
}

main();

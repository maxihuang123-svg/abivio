const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'db', 'programs_200_enriched.json');
const programs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log('Total:', programs.length);

const counts = {};
programs.forEach((p) => {
  counts[p.name] = (counts[p.name] || 0) + 1;
});

const duplicates = Object.entries(counts).filter(([_, v]) => v > 1);
console.log('Duplicates:', duplicates.length);
duplicates.forEach(([name, count]) => console.log(`  ${name}: ${count}`));

const suspiciousNames = [
  'Hüttenwesen',
  'Robotik',
  'Cloud Computing',
  'Blockchain-Technologie',
  'Human-Computer Interaction',
  'Machine Learning',
  'Data Engineering',
  'Internet of Things',
  'Bergbau',
  'Raumfahrttechnik',
  'Tiefbau',
  'Wasserwesen',
  'Gebäudetechnik',
  'Feinwerktechnik',
  'Schiffbau',
  'Optotechnik',
  'Nanotechnologie',
  'Textiltechnik',
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
];

const foundSuspicious = programs.filter((p) => suspiciousNames.includes(p.name));
console.log('\nSuspicious programs found:', foundSuspicious.length);
foundSuspicious.forEach((p) => console.log(`  - ${p.name} (${p.field})`));

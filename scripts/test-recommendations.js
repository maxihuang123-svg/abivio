/**
 * Lokaler Smoke-Test für den Empfehlungs-Algorithmus.
 * Stellt sicher, dass blockierte Studiengänge nie zurückgegeben werden
 * und bekannte gute Empfehlungen weiterhin möglich sind.
 */

const fs = require('fs');
const path = require('path');

const programs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db', 'programs_expanded.json'), 'utf8'));

const BLOCKED_PROGRAM_NAMES = new Set([
  'Hüttenwesen',
  'Robotik',
  'Cloud Computing',
  'Blockchain-Technologie',
  'Human-Computer Interaction',
  'Data Engineering',
  'Machine Learning',
  'Bergbau',
  'Raumfahrttechnik',
  'Tiefbau',
  'Wasserwesen',
  'Gebäudetechnik',
  'Feinwerktechnik',
  'Schiffbau',
  'Optotechnik',
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

function isBlockedProgram(program) {
  const baseName = program.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return BLOCKED_PROGRAM_NAMES.has(baseName) || BLOCKED_PROGRAM_NAMES.has(program.name.trim());
}

function safeJsonParse(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function intersection(a, b) {
  return a.filter((x) => b.includes(x));
}

function computeRecommendations(programs, answers) {
  const userInterests = answers.interests || [];
  const userStrengths = answers.strengths || [];
  const userWorkStyle = answers.work_style || [];

  const scored = programs
    .filter((p) => !isBlockedProgram(p))
    .map((program) => {
      let score = 0;
      const reasons = [];

      const pInterests = safeJsonParse(program.interests);
      const pStrengths = safeJsonParse(program.strengths);
      const pWorkStyle = safeJsonParse(program.work_style);

      const interestMatches = intersection(userInterests, pInterests);
      score += interestMatches.length * 8;
      if (interestMatches.length > 0) {
        reasons.push(`passt zu deinen Interessen: ${interestMatches.slice(0, 2).join(', ')}`);
      }

      const strengthMatches = intersection(userStrengths, pStrengths);
      score += strengthMatches.length * 6;
      if (strengthMatches.length > 0) {
        reasons.push(`baut auf deinen Stärken auf: ${strengthMatches.slice(0, 2).join(', ')}`);
      }

      const styleMatches = intersection(userWorkStyle, pWorkStyle);
      score += styleMatches.length * 5;
      if (styleMatches.length > 0) {
        reasons.push(`dein Arbeitsstil passt: ${styleMatches.slice(0, 2).join(', ')}`);
      }

      score += Math.max(0, 100 - (program.popularity_rank || 999)) / 50;

      return { program, score, reasoning: reasons.join('; ') + '.' };
    });

  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

// Test 1: No blocked programs in dataset
const blockedInDataset = programs.filter(isBlockedProgram);
console.log('Blocked programs still in expanded dataset:', blockedInDataset.length);
if (blockedInDataset.length > 0) {
  blockedInDataset.forEach((p) => console.log('  -', p.name));
  process.exit(1);
}

// Test 2: Simulate a tech-interested user with Munich preference
const techAnswers = {
  interests: ['technik'],
  strengths: ['mathematik', 'informatik', 'physik'],
  work_style: ['analytisch'],
};

const recs = computeRecommendations(programs, techAnswers);
console.log('\nTop 5 recommendations for tech/math/informatik/physik/analytical:');
recs.forEach((r, i) => console.log(`${i + 1}. ${r.program.name} (score: ${r.score.toFixed(1)})`));

const recNames = recs.map((r) => r.program.name.replace(/\s*\([^)]*\)\s*$/, '').trim());
const hasInformatics = recNames.includes('Informatik') || recNames.includes('Technische Informatik') || recNames.includes('Wirtschaftsinformatik');

if (!hasInformatics) {
  console.error('\nFAIL: No computer science related program in top 5');
  process.exit(1);
}

console.log('\nAll tests passed.');

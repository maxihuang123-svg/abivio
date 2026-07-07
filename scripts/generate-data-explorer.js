// Generates a static data explorer page from seed data
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const programs = JSON.parse(fs.readFileSync(path.join(root, 'db', 'programs_200_enriched.json'), 'utf8'));
const universities = JSON.parse(fs.readFileSync(path.join(root, 'db', 'universities_seed.json'), 'utf8'));

function countBy(key, items) {
  const map = {};
  items.forEach((item) => {
    const val = item[key] ?? 'unbekannt';
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function allTags(items, key) {
  const map = {};
  items.forEach((item) => {
    try {
      const arr = JSON.parse(item[key] || '[]');
      arr.forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    } catch {
      // ignore
    }
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function qualityIssues(items) {
  const issues = [];

  // Generic descriptions
  const descPatterns = {};
  items.forEach((item) => {
    const pattern = item.description.replace(new RegExp(item.name.split(' ')[0], 'g'), 'XXX');
    descPatterns[pattern] = (descPatterns[pattern] || 0) + 1;
  });
  const duplicatePatterns = Object.entries(descPatterns).filter(([k, v]) => v > 1);
  issues.push(`${duplicatePatterns.length} wiederholte Beschreibungsmuster entdeckt. Studiengänge innerhalb desselben Fachbereichs haben oft identische Texte.`);

  // Duplicate careers
  const careers = {};
  items.forEach((item) => {
    careers[item.career] = (careers[item.career] || 0) + 1;
  });
  const dupCareers = Object.entries(careers).filter(([k, v]) => v > 1);
  issues.push(`${dupCareers.length} identische Berufsfelder, die jeweils mehreren Studiengängen zugeordnet sind.`);

  // Missing data
  const missingDesc = items.filter((x) => !x.description || x.description.length < 20).length;
  const missingCareer = items.filter((x) => !x.career).length;
  if (missingDesc) issues.push(`${missingDesc} Studiengänge mit fehlender oder sehr kurzer Beschreibung.`);
  if (missingCareer) issues.push(`${missingCareer} Studiengänge ohne Berufsfeld.`);

  return issues;
}

const fieldCounts = countBy('field', programs);
const languageCounts = countBy('language', programs);
const durationCounts = countBy('duration_semesters', programs);
const ncValues = programs.filter((p) => p.nc_required).map((p) => p.nc_grade);
const ncMin = Math.min(...ncValues);
const ncMax = Math.max(...ncValues);
const ncAvg = (ncValues.reduce((a, b) => a + b, 0) / ncValues.length).toFixed(2);

const interestTags = allTags(programs, 'interests');
const strengthTags = allTags(programs, 'strengths');
const workStyleTags = allTags(programs, 'work_style');

const issues = qualityIssues(programs);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTableRows(items) {
  return items
    .map(
      (p) => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.field)}</td>
      <td>${escapeHtml(p.degree)}</td>
      <td>${p.duration_semesters}</td>
      <td>${escapeHtml(p.language)}</td>
      <td>${p.nc_required ? p.nc_grade : '—'}</td>
      <td>${escapeHtml(p.interests || '')}</td>
      <td>${escapeHtml(p.strengths || '')}</td>
      <td>${escapeHtml(p.work_style || '')}</td>
    </tr>
  `
    )
    .join('');
}

function renderBarChart(entries, max = null) {
  const m = max || Math.max(...entries.map((e) => e[1]));
  return entries
    .map(
      ([label, value]) => `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width: ${(value / m) * 100}%"></div></div>
        <span class="bar-value">${value}</span>
      </div>
    `
    )
    .join('');
}

function renderTagCloud(tags) {
  const max = Math.max(...tags.map((t) => t[1]));
  return tags
    .map(
      ([tag, count]) => `
      <span class="tag" style="opacity: ${0.5 + (count / max) * 0.5}">${escapeHtml(tag)} (${count})</span>
    `
    )
    .join('');
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daten-Explorer — abivio</title>
  <link rel="stylesheet" href="/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .card h3 { margin-top: 0; font-size: 1.1rem; }
    .big-number { font-size: 2.5rem; font-weight: 800; color: var(--color-primary); }
    .bar-row { display: grid; grid-template-columns: 140px 1fr 40px; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .bar-label { font-size: 0.9rem; color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-track { height: 10px; background: var(--color-surface); border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--color-primary); border-radius: 999px; }
    .bar-value { font-size: 0.85rem; color: var(--color-text-muted); text-align: right; }
    .tag-cloud { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag-cloud .tag { background: var(--color-accent); color: var(--color-primary-dark); }
    .issues { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; padding: 1rem 1.25rem; border-radius: var(--radius-sm); }
    .issues ul { margin: 0; padding-left: 1.25rem; }
    .issues li { margin-bottom: 0.25rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.6rem; border-bottom: 1px solid var(--color-border); text-align: left; vertical-align: top; }
    .data-table th { background: var(--color-surface); font-weight: 600; }
    .data-table tr:hover { background: var(--color-surface); }
    .search-box { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 1rem; font-family: inherit; }
    .search-box:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
    .section-muted .card { background: #fff; }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">abivio</a>
      <nav class="nav">
        <a href="/" class="nav-link">Zurück zur Startseite</a>
      </nav>
    </div>
  </header>

  <main class="section section-muted">
    <div class="container">
      <h1>Daten-Explorer</h1>
      <p class="hero-subtitle" style="margin-bottom: 2rem;">Übersicht über alle Seed-Daten, die aktuell für das Quiz verwendet werden.</p>

      <div class="dashboard">
        <div class="card">
          <h3>Studiengänge</h3>
          <div class="big-number">${programs.length}</div>
          <p class="hero-note">Bachelor-Programme im Seed-Datensatz</p>
        </div>
        <div class="card">
          <h3>Hochschulen</h3>
          <div class="big-number">${universities.length}</div>
          <p class="hero-note">Deutsche Hochschulen importiert</p>
        </div>
        <div class="card">
          <h3>Fachbereiche</h3>
          <div class="big-number">${fieldCounts.length}</div>
          <p class="hero-note">Unterschiedliche Studienfelder</p>
        </div>
        <div class="card">
          <h3>NC-Spanne</h3>
          <div class="big-number">${ncMin.toFixed(1)} – ${ncMax.toFixed(1)}</div>
          <p class="hero-note">Durchschnitt: ${ncAvg}</p>
        </div>
      </div>

      <div class="issues" style="margin-bottom: 2rem;">
        <strong>Datenqualität-Hinweise</strong>
        <ul>
          ${issues.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </div>

      <div class="dashboard">
        <div class="card">
          <h3>Verteilung nach Fachbereich</h3>
          ${renderBarChart(fieldCounts)}
        </div>
        <div class="card">
          <h3>Verteilung nach Sprache</h3>
          ${renderBarChart(languageCounts)}
        </div>
        <div class="card">
          <h3>Reguläre Studiendauer</h3>
          ${renderBarChart(durationCounts)}
        </div>
      </div>

      <div class="dashboard">
        <div class="card">
          <h3>Interessen-Tags (${interestTags.length})</h3>
          <div class="tag-cloud">${renderTagCloud(interestTags)}</div>
        </div>
        <div class="card">
          <h3>Stärken-Tags (${strengthTags.length})</h3>
          <div class="tag-cloud">${renderTagCloud(strengthTags)}</div>
        </div>
        <div class="card">
          <h3>Arbeitsstil-Tags (${workStyleTags.length})</h3>
          <div class="tag-cloud">${renderTagCloud(workStyleTags)}</div>
        </div>
      </div>

      <section style="margin-top: 3rem;">
        <h2>Alle Studiengänge</h2>
        <input type="text" id="search" class="search-box" placeholder="Suchen nach Name, Fachbereich oder Tags…">
        <div style="overflow-x: auto;">
          <table class="data-table" id="programs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fachbereich</th>
                <th>Abschluss</th>
                <th>Semester</th>
                <th>Sprache</th>
                <th>NC</th>
                <th>Interessen</th>
                <th>Stärken</th>
                <th>Arbeitsstil</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(programs)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>&copy; 2026 abivio.de — Made for Abiturienten in Deutschland.</p>
      <p class="footer-links">
        <a href="/impressum.html">Impressum</a> · <a href="/datenschutz.html">Datenschutz</a>
      </p>
    </div>
  </footer>

  <script>
    const searchInput = document.getElementById('search');
    const table = document.getElementById('programs-table');
    const rows = table.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  </script>
</body>
</html>
`;

const outPath = path.join(root, 'frontend', 'data-explorer.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Generated ${outPath}`);
console.log(`Programs: ${programs.length}, Universities: ${universities.length}`);

/**
 * Example usage of the generic scraper against a mock university page.
 *
 * To use against a real university page:
 * 1. Inspect the HTML structure
 * 2. Adjust the selectors below
 * 3. Ensure you have permission or the data is public domain
 * 4. Respect robots.txt and rate limits
 */

const fs = require('fs');
const path = require('path');
const { parseProgramList, normalizeProgram, sleep, fetchPage } = require('./scraper');

async function main() {
  // Example 1: Parse local mock HTML
  const mockHtml = fs.readFileSync(path.join(__dirname, 'mock-university.html'), 'utf8');

  const selectors = {
    itemSelector: '.program-card',
    fields: {
      name: { selector: 'h2 a', attr: 'text' },
      // For text extraction, attr: 'text' means inner text; omit attr for default
      degreeText: 'p.degree',
      field: 'p.field',
      durationText: 'p.duration',
      language: 'p.language',
      description: 'p.description',
      website: { selector: 'h2 a', attr: 'href' },
    },
  };

  // The scraper expects plain selectors for text. We'll override with custom parsing
  // because the generic function doesn't support attr: 'text'.
  const customSelectors = {
    itemSelector: '.program-card',
    fields: {
      name: 'h2 a',
      degreeText: 'p.degree',
      field: 'p.field',
      durationText: 'p.duration',
      language: 'p.language',
      description: 'p.description',
      website: { selector: 'h2 a', attr: 'href' },
    },
  };

  const rawPrograms = parseProgramList(mockHtml, customSelectors);
  const programs = rawPrograms.map(normalizeProgram);

  console.log('Gefundene Studiengänge (Mock):');
  console.table(programs);

  // Example 2: Fetch a real URL (commented out to avoid accidental scraping)
  // const url = 'https://www.example-university.de/studiengaenge';
  // try {
  //   await sleep(1000); // Respect rate limit
  //   const html = await fetchPage(url);
  //   const realPrograms = parseProgramList(html, customSelectors).map(normalizeProgram);
  //   console.log('Real programs:', realPrograms);
  // } catch (err) {
  //   console.error('Scraping failed:', err.message);
  // }
}

main().catch(console.error);

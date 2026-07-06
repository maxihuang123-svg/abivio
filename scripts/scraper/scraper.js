/**
 * Generic web scraper for study program pages.
 *
 * WARNING: This scraper is for educational/development purposes only.
 * Before scraping any website, check the legal situation (copyright, AGB,
 * database rights, robots.txt). Only scrape with permission or public data.
 */

const cheerio = require('cheerio');

/**
 * Parse a study program listing page and extract program cards/rows.
 */
function parseProgramList(html, selectors) {
  const $ = cheerio.load(html);
  const items = [];

  $(selectors.itemSelector).each((_, element) => {
    const $el = $(element);

    const extract = (selector, attr = null) => {
      if (!selector) return null;
      const $target = attr ? $el.find(selector).first() : $el.find(selector).first();
      if ($target.length === 0) return null;
      return attr ? $target.attr(attr) : $target.text().trim();
    };

    const item = {};
    for (const [key, config] of Object.entries(selectors.fields)) {
      if (typeof config === 'string') {
        item[key] = extract(config);
      } else {
        item[key] = extract(config.selector, config.attr);
      }
    }

    items.push(item);
  });

  return items;
}

/**
 * Clean and normalize extracted program data.
 */
function normalizeProgram(raw) {
  const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

  const durationMatch = clean(raw.durationText || '').match(/(\d+)/);
  const duration = durationMatch ? parseInt(durationMatch[1], 10) : null;

  const degree = clean(raw.degreeText || '').toLowerCase();
  const isBachelor = degree.includes('bachelor') || degree.includes('bakkalaureus');
  const isMaster = degree.includes('master') || degree.includes('magister');

  return {
    name: clean(raw.name),
    degree: isBachelor ? 'Bachelor' : isMaster ? 'Master' : clean(raw.degreeText),
    field: clean(raw.field),
    duration_semesters: duration,
    language: clean(raw.language || 'de').toLowerCase().startsWith('en') ? 'en' : 'de',
    description: clean(raw.description),
    website: raw.website,
    source_url: raw.sourceUrl,
  };
}

/**
 * Simple rate limiter: returns a promise that resolves after delay ms.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with a respectful user agent and timeout.
 */
async function fetchPage(url, options = {}) {
  const { timeout = 10000, userAgent = 'abivio-scraper/0.1 (research bot; contact: info@abivio.de)' } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  parseProgramList,
  normalizeProgram,
  sleep,
  fetchPage,
};

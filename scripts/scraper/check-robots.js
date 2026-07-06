/**
 * Check robots.txt for a given domain.
 *
 * Usage: node scripts/scraper/check-robots.js https://www.example.com
 */

async function checkRobots(baseUrl) {
  const url = new URL('/robots.txt', baseUrl).toString();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'abivio-scraper/0.1 (research bot; contact: info@abivio.de)',
      },
    });

    if (!response.ok) {
      console.log(`No robots.txt found at ${url} (HTTP ${response.status})`);
      return null;
    }

    const text = await response.text();
    console.log(`robots.txt for ${baseUrl}:\n`);
    console.log(text);
    return text;
  } catch (err) {
    console.error(`Failed to fetch robots.txt: ${err.message}`);
    return null;
  }
}

const target = process.argv[2] || 'https://www.hochschulkompass.de';
checkRobots(target);

/**
 * Parser für die Hochschulkompass Hochschulliste
 * Quelle: https://hs-kompass.de/kompass/xml/download/hs_liste.txt
 *
 * Diese Datei wandelt die tab-getrennte TXT-Datei in ein strukturiertes
 * JSON-Format um, das in D1 importiert werden kann.
 */

const fs = require('fs');
const path = require('path');

function parseLine(line) {
  // Die Datei ist tab-getrennt
  return line.split('\t').map((cell) => cell.trim());
}

function cleanBoolean(value) {
  if (!value) return 0;
  const v = value.toLowerCase().trim();
  if (v === 'ja' || v === '1' || v === 'yes' || v === 'true') return 1;
  return 0;
}

function parseNumber(value) {
  if (!value) return null;
  const cleaned = value.toString().replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function main() {
  const inputPath = process.argv[2] || path.join(__dirname, '..', 'tmp_hs_liste.txt');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'db', 'universities_seed.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Datei nicht gefunden: ${inputPath}`);
    console.error('Bitte lade zuerst https://hs-kompass.de/kompass/xml/download/hs_liste.txt herunter.');
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'latin1');
  const lines = content.split('\n').filter((line) => line.trim());

  // Header in Zeile 1
  const header = parseLine(lines[0]);
  console.log('Gefundene Spalten:', header);

  const universities = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length < 5) continue;

    const [
      hsNr,
      kurzname,
      hochschulname,
      adressname,
      hochschultyp,
      traegerschaft,
      bundesland,
      anzahlStudierende,
      gruendungsjahr,
      promotionsrecht,
      habilitationsrecht,
      strasse,
      plzHaus,
      ortHaus,
      postfach,
      plzPost,
      ortPost,
      telefonvorwahl,
      telefon,
      fax,
      homepage,
      mitgliedHrk,
    ] = cells;

    universities.push({
      hs_number: parseNumber(hsNr),
      short_name: kurzname,
      name: hochschulname,
      address_name: adressname,
      type: hochschultyp,
      ownership: traegerschaft,
      federal_state: bundesland,
      student_count: parseNumber(anzahlStudierende),
      founded_year: parseNumber(gruendungsjahr),
      has_phd_right: cleanBoolean(promotionsrecht),
      has_habilitation_right: cleanBoolean(habilitationsrecht),
      street: strasse,
      zip: plzHaus,
      city: ortHaus,
      po_box: postfach,
      po_zip: plzPost,
      po_city: ortPost,
      phone_prefix: telefonvorwahl,
      phone: telefon,
      fax: fax,
      website: homepage,
      is_hrk_member: cleanBoolean(mitgliedHrk),
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(universities, null, 2), 'utf8');
  console.log(`\n${universities.length} Hochschulen erfolgreich geparst.`);
  console.log(`Ausgabe: ${outputPath}`);

  // Statistik
  const types = {};
  const states = {};
  for (const u of universities) {
    types[u.type] = (types[u.type] || 0) + 1;
    states[u.federal_state] = (states[u.federal_state] || 0) + 1;
  }

  console.log('\nNach Hochschultyp:');
  Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => console.log(`  ${type}: ${count}`));

  console.log('\nNach Bundesland:');
  Object.entries(states)
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => console.log(`  ${state}: ${count}`));
}

main();

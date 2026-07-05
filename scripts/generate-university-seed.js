/**
 * Wandelt db/universities_seed.json in ein D1-kompatibles SQL-Seed-Skript um.
 * Verwendet char()-Konkatenation, um Encoding-Probleme bei wrangler d1 execute zu vermeiden.
 */

const fs = require('fs');
const path = require('path');

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

  if (result === '') return "''";
  return result;
}

function main() {
  const inputPath = path.join(__dirname, '..', 'db', 'universities_seed.json');
  const outputPath = path.join(__dirname, '..', 'db', 'universities_seed.sql');

  const universities = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  let sql = '-- Seed data for German universities from Hochschulkompass\n';
  sql += '-- Source: https://hs-kompass.de/kompass/xml/download/hs_liste.txt\n';
  sql += '-- Note: For personal use only; commercial use requires HRK permission\n\n';
  sql += 'DELETE FROM universities;\n\n';

  const batchSize = 50;
  for (let i = 0; i < universities.length; i += batchSize) {
    const batch = universities.slice(i, i + batchSize);
    sql += 'INSERT INTO universities (hs_number, short_name, name, address_name, type, ownership, federal_state, student_count, founded_year, has_phd_right, has_habilitation_right, street, zip, city, po_box, po_zip, po_city, phone_prefix, phone, fax, website, is_hrk_member) VALUES\n';

    const rows = batch.map((u) => {
      return `  (${[
        u.hs_number ?? 'NULL',
        charEncode(u.short_name),
        charEncode(u.name),
        charEncode(u.address_name),
        charEncode(u.type),
        charEncode(u.ownership),
        charEncode(u.federal_state),
        u.student_count ?? 'NULL',
        u.founded_year ?? 'NULL',
        u.has_phd_right,
        u.has_habilitation_right,
        charEncode(u.street),
        charEncode(u.zip),
        charEncode(u.city),
        charEncode(u.po_box),
        charEncode(u.po_zip),
        charEncode(u.po_city),
        charEncode(u.phone_prefix),
        charEncode(u.phone),
        charEncode(u.fax),
        charEncode(u.website),
        u.is_hrk_member,
      ].join(', ')})`;
    });

    sql += rows.join(',\n') + ';\n';
  }

  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`SQL seed generated: ${outputPath}`);
  console.log(`Universities: ${universities.length}`);
}

main();

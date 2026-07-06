/**
 * Generiert eine Liste von 200 deutschen Bachelor-Studiengängen.
 * Fakten werden recherchiert; Beschreibungen und Tags kommen später per LLM-Enrichment.
 */

const fs = require('fs');
const path = require('path');

function program(name, field, options = {}) {
  return {
    name,
    field,
    degree: options.degree || 'Bachelor',
    duration_semesters: options.duration || 6,
    language: options.language || 'de',
    nc_required: options.ncRequired !== undefined ? options.ncRequired : true,
    nc_grade: options.ncGrade || null,
    ...options.extra,
  };
}

const programs = [
  // Technik & IT (25)
  program('Informatik', 'Technik & IT', { ncGrade: 2.5 }),
  program('Data Science', 'Technik & IT', { ncGrade: 2.3 }),
  program('Künstliche Intelligenz', 'Technik & IT', { ncGrade: 2.2 }),
  program('Cybersecurity', 'Technik & IT', { ncGrade: 2.2 }),
  program('Software Engineering', 'Technik & IT', { ncGrade: 2.4 }),
  program('Medieninformatik', 'Technik & IT', { ncGrade: 2.6 }),
  program('Bioinformatik', 'Technik & IT', { ncGrade: 2.4 }),
  program('Geoinformatik', 'Technik & IT', { ncGrade: 2.6 }),
  program('Wirtschaftsinformatik', 'Technik & IT', { ncGrade: 2.4 }),
  program('Computerlinguistik', 'Technik & IT', { ncGrade: 2.5 }),
  program('Robotik', 'Technik & IT', { ncGrade: 2.0 }),
  program('Game Design', 'Technik & IT', { ncGrade: 2.5 }),
  program('Internet of Things', 'Technik & IT', { ncGrade: 2.4 }),
  program('Cloud Computing', 'Technik & IT', { ncGrade: 2.3 }),
  program('Blockchain-Technologie', 'Technik & IT', { ncGrade: 2.5 }),
  program('Human-Computer Interaction', 'Technik & IT', { ncGrade: 2.5 }),
  program('IT-Sicherheit', 'Technik & IT', { ncGrade: 2.3 }),
  program('Data Engineering', 'Technik & IT', { ncGrade: 2.3 }),
  program('Machine Learning', 'Technik & IT', { ncGrade: 2.2 }),
  program('Computer Science', 'Technik & IT', { language: 'en', ncGrade: 2.0 }),
  program('Information Systems', 'Technik & IT', { language: 'en', ncGrade: 2.3 }),
  program('Business Informatics', 'Technik & IT', { language: 'en', ncGrade: 2.4 }),
  program('Digitale Medien', 'Technik & IT', { ncGrade: 2.6 }),
  program('Technische Informatik', 'Technik & IT', { ncGrade: 2.5 }),
  program('Praktische Informatik', 'Technik & IT', { ncGrade: 2.6 }),

  // Ingenieurwesen (30)
  program('Maschinenbau', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Elektrotechnik', 'Ingenieurwesen', { ncGrade: 2.8 }),
  program('Bauingenieurwesen', 'Ingenieurwesen', { ncGrade: 2.9 }),
  program('Verfahrenstechnik', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Chemieingenieurwesen', 'Ingenieurwesen', { ncGrade: 2.6 }),
  program('Umwelttechnik', 'Ingenieurwesen', { ncGrade: 2.8 }),
  program('Energietechnik', 'Ingenieurwesen', { ncGrade: 2.6 }),
  program('Fahrzeugtechnik', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Luft- und Raumfahrttechnik', 'Ingenieurwesen', { ncGrade: 2.1 }),
  program('Mechatronik', 'Ingenieurwesen', { ncGrade: 2.6 }),
  program('Medizintechnik', 'Ingenieurwesen', { ncGrade: 2.4 }),
  program('Wirtschaftsingenieurwesen', 'Ingenieurwesen', { ncGrade: 2.5 }),
  program('Industrial Engineering', 'Ingenieurwesen', { language: 'en', ncGrade: 2.4 }),
  program('Automotive Engineering', 'Ingenieurwesen', { language: 'en', ncGrade: 2.3 }),
  program('Biomedical Engineering', 'Ingenieurwesen', { language: 'en', ncGrade: 2.2 }),
  program('Materialwissenschaft', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Nanotechnologie', 'Ingenieurwesen', { ncGrade: 2.4 }),
  program('Optotechnik', 'Ingenieurwesen', { ncGrade: 2.6 }),
  program('Schiffbau', 'Ingenieurwesen', { ncGrade: 2.8 }),
  program('Verkehrsingenieurwesen', 'Ingenieurwesen', { ncGrade: 2.8 }),
  program('Gebäudetechnik', 'Ingenieurwesen', { ncGrade: 3.0 }),
  program('Tiefbau', 'Ingenieurwesen', { ncGrade: 2.9 }),
  program('Wasserwesen', 'Ingenieurwesen', { ncGrade: 2.9 }),
  program('Produktionstechnik', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Feinwerktechnik', 'Ingenieurwesen', { ncGrade: 2.7 }),
  program('Textiltechnik', 'Ingenieurwesen', { ncGrade: 3.0 }),
  program('Bergbau', 'Ingenieurwesen', { ncGrade: 3.0 }),
  program('Hüttenwesen', 'Ingenieurwesen', { ncGrade: 3.0 }),
  program('Raumfahrttechnik', 'Ingenieurwesen', { ncGrade: 2.2 }),
  program('Technisches Management', 'Ingenieurwesen', { ncGrade: 2.6 }),

  // Wirtschaft (25)
  program('BWL', 'Wirtschaft', { ncGrade: 2.2 }),
  program('Volkswirtschaftslehre', 'Wirtschaft', { ncGrade: 2.5 }),
  program('International Business', 'Wirtschaft', { language: 'en', ncGrade: 2.3 }),
  program('Marketingmanagement', 'Wirtschaft', { ncGrade: 2.5 }),
  program('Finanzmanagement', 'Wirtschaft', { ncGrade: 2.4 }),
  program('Rechnungswesen', 'Wirtschaft', { ncGrade: 2.7 }),
  program('Logistikmanagement', 'Wirtschaft', { ncGrade: 2.6 }),
  program('Tourismusmanagement', 'Wirtschaft', { ncGrade: 2.6 }),
  program('Hotelmanagement', 'Wirtschaft', { ncGrade: 2.7 }),
  program('Eventmanagement', 'Wirtschaft', { ncGrade: 2.8 }),
  program('Immobilienwirtschaft', 'Wirtschaft', { ncGrade: 2.6 }),
  program('Sportmanagement', 'Wirtschaft', { ncGrade: 2.6 }),
  program('Medienmanagement', 'Wirtschaft', { ncGrade: 2.5 }),
  program('Kulturmanagement', 'Wirtschaft', { ncGrade: 2.7 }),
  program('Gesundheitsmanagement', 'Wirtschaft', { ncGrade: 2.5 }),
  program('Versicherungswirtschaft', 'Wirtschaft', { ncGrade: 2.8 }),
  program('Bankwirtschaft', 'Wirtschaft', { ncGrade: 2.5 }),
  program('Handelsmanagement', 'Wirtschaft', { ncGrade: 2.7 }),
  program('Supply Chain Management', 'Wirtschaft', { language: 'en', ncGrade: 2.4 }),
  program('Business Administration', 'Wirtschaft', { language: 'en', ncGrade: 2.3 }),
  program('Entrepreneurship', 'Wirtschaft', { ncGrade: 2.4 }),
  program('Digital Business', 'Wirtschaft', { ncGrade: 2.4 }),
  program('E-Commerce', 'Wirtschaft', { ncGrade: 2.5 }),
  program('Personalmanagement', 'Wirtschaft', { ncGrade: 2.6 }),
  program('Controlling', 'Wirtschaft', { ncGrade: 2.5 }),

  // Medizin & Gesundheit (20)
  program('Medizin', 'Medizin & Gesundheit', { duration: 12, ncGrade: 1.0 }),
  program('Zahnmedizin', 'Medizin & Gesundheit', { duration: 10, ncGrade: 1.1 }),
  program('Psychologie', 'Medizin & Gesundheit', { ncGrade: 1.3 }),
  program('Pharmazie', 'Medizin & Gesundheit', { ncGrade: 1.4 }),
  program('Pflegewissenschaft', 'Medizin & Gesundheit', { ncGrade: 2.5 }),
  program('Molekulare Biomedizin', 'Medizin & Gesundheit', { ncGrade: 1.5 }),
  program('Ernährungswissenschaft', 'Medizin & Gesundheit', { ncGrade: 2.5 }),
  program('Public Health', 'Medizin & Gesundheit', { ncGrade: 2.3 }),
  program('Medizinische Informatik', 'Medizin & Gesundheit', { ncGrade: 2.4 }),
  program('Gesundheitswissenschaften', 'Medizin & Gesundheit', { ncGrade: 2.4 }),
  program('Humanmedizin', 'Medizin & Gesundheit', { duration: 12, ncGrade: 1.0 }),
  program('Zahnmedizin', 'Medizin & Gesundheit', { duration: 10, ncGrade: 1.1 }),
  program('Molekulare Medizin', 'Medizin & Gesundheit', { ncGrade: 1.6 }),
  program('Medizintechnologie', 'Medizin & Gesundheit', { ncGrade: 2.4 }),
  program('Hebammenwissenschaft', 'Medizin & Gesundheit', { ncGrade: 2.5 }),
  program('Therapiewissenschaften', 'Medizin & Gesundheit', { ncGrade: 2.4 }),
  program('Sporttherapie', 'Medizin & Gesundheit', { ncGrade: 2.5 }),
  program('Logopädie', 'Medizin & Gesundheit', { ncGrade: 2.5 }),
  program('Ergotherapie', 'Medizin & Gesundheit', { ncGrade: 2.6 }),
  program('Physiotherapie', 'Medizin & Gesundheit', { ncGrade: 2.5 }),

  // Naturwissenschaften (15)
  program('Physik', 'Naturwissenschaften', { ncRequired: false }),
  program('Chemie', 'Naturwissenschaften', { ncRequired: false }),
  program('Biologie', 'Naturwissenschaften', { ncRequired: false }),
  program('Mathematik', 'Naturwissenschaften', { ncRequired: false }),
  program('Biochemie', 'Naturwissenschaften', { ncGrade: 2.5 }),
  program('Biotechnologie', 'Naturwissenschaften', { ncGrade: 2.5 }),
  program('Pharmazie', 'Naturwissenschaften', { ncGrade: 1.4 }),
  program('Geowissenschaften', 'Naturwissenschaften', { ncRequired: false }),
  program('Meteorologie', 'Naturwissenschaften', { ncGrade: 2.6 }),
  program('Ozeanographie', 'Naturwissenschaften', { ncGrade: 2.7 }),
  program('Astrophysik', 'Naturwissenschaften', { ncGrade: 2.4 }),
  program('Molekularbiologie', 'Naturwissenschaften', { ncGrade: 2.3 }),
  program('Neuroscience', 'Naturwissenschaften', { language: 'en', ncGrade: 2.0 }),
  program('Umweltnaturwissenschaften', 'Naturwissenschaften', { ncRequired: false }),
  program('Nanowissenschaften', 'Naturwissenschaften', { ncGrade: 2.4 }),

  // Design (12)
  program('Mediendesign', 'Design', { ncGrade: 2.4 }),
  program('Produktdesign', 'Design', { ncGrade: 2.5 }),
  program('Kommunikationsdesign', 'Design', { ncGrade: 2.5 }),
  program('Industriedesign', 'Design', { ncGrade: 2.5 }),
  program('Fashion Design', 'Design', { language: 'en', ncGrade: 2.7 }),
  program('Interior Design', 'Design', { language: 'en', ncGrade: 2.6 }),
  program('Grafikdesign', 'Design', { ncGrade: 2.6 }),
  program('User Experience Design', 'Design', { language: 'en', ncGrade: 2.4 }),
  program('Interaction Design', 'Design', { language: 'en', ncGrade: 2.4 }),
  program('Textildesign', 'Design', { ncGrade: 2.7 }),
  program('Möbeldesign', 'Design', { ncGrade: 2.8 }),
  program('Visuelle Kommunikation', 'Design', { ncGrade: 2.5 }),

  // Medien (10)
  program('Kommunikationswissenschaft', 'Medien', { ncRequired: false }),
  program('Journalismus', 'Medien', { ncGrade: 2.0 }),
  program('Filmwissenschaft', 'Medien', { ncRequired: false }),
  program('Medienwissenschaft', 'Medien', { ncRequired: false }),
  program('Public Relations', 'Medien', { language: 'en', ncGrade: 2.5 }),
  program('Digitale Medien', 'Medien', { ncGrade: 2.5 }),
  program('Radiojournalismus', 'Medien', { ncGrade: 2.6 }),
  program('Fernsehjournalismus', 'Medien', { ncGrade: 2.6 }),
  program('Crossmedia', 'Medien', { ncGrade: 2.5 }),
  program('Medienproduktion', 'Medien', { ncGrade: 2.6 }),

  // Recht (5)
  program('Rechtswissenschaft', 'Recht', { ncGrade: 1.7 }),
  program('Wirtschaftsrecht', 'Recht', { ncGrade: 2.0 }),
  program('Internationales Recht', 'Recht', { language: 'en', ncGrade: 2.0 }),
  program('Steuerrecht', 'Recht', { ncGrade: 2.2 }),
  program('Medienrecht', 'Recht', { ncGrade: 2.3 }),

  // Soziales (12)
  program('Soziale Arbeit', 'Soziales', { ncRequired: false }),
  program('Politikwissenschaft', 'Soziales', { ncRequired: false }),
  program('Soziologie', 'Soziales', { ncRequired: false }),
  program('Pädagogik', 'Soziales', { ncRequired: false }),
  program('Frühpädagogik', 'Soziales', { ncGrade: 2.6 }),
  program('Sozialmanagement', 'Soziales', { ncGrade: 2.7 }),
  program('Politik und Wirtschaft', 'Soziales', { ncGrade: 2.5 }),
  program('Sozialpädagogik', 'Soziales', { ncRequired: false }),
  program('Gemeindediakonie', 'Soziales', { ncRequired: false }),
  program('Interkulturelle Bildung', 'Soziales', { ncGrade: 2.7 }),
  program('Kriminologie', 'Soziales', { ncGrade: 2.5 }),
  program('Nonprofit-Management', 'Soziales', { ncGrade: 2.7 }),

  // Geisteswissenschaften (8)
  program('Geschichte', 'Geisteswissenschaften', { ncRequired: false }),
  program('Philosophie', 'Geisteswissenschaften', { ncRequired: false }),
  program('Kunstgeschichte', 'Geisteswissenschaften', { ncRequired: false }),
  program('Theaterwissenschaft', 'Geisteswissenschaften', { ncRequired: false }),
  program('Musikwissenschaft', 'Geisteswissenschaften', { ncRequired: false }),
  program('Religionswissenschaft', 'Geisteswissenschaften', { ncRequired: false }),
  program('Ethnologie', 'Geisteswissenschaften', { ncRequired: false }),
  program('Kulturwissenschaften', 'Geisteswissenschaften', { ncRequired: false }),

  // Sprachen (8)
  program('Anglistik', 'Sprachen', { ncRequired: false }),
  program('Germanistik', 'Sprachen', { ncRequired: false }),
  program('Romanistik', 'Sprachen', { ncRequired: false }),
  program('Slawistik', 'Sprachen', { ncRequired: false }),
  program('Sinologie', 'Sprachen', { ncGrade: 2.5 }),
  program('Japanologie', 'Sprachen', { ncGrade: 2.5 }),
  program('Übersetzen', 'Sprachen', { ncGrade: 2.4 }),
  program('Dolmetschen', 'Sprachen', { ncGrade: 2.3 }),

  // Kunst (6)
  program('Bildende Kunst', 'Kunst', { ncGrade: 2.5 }),
  program('Musik', 'Kunst', { ncGrade: 2.5 }),
  program('Schauspiel', 'Kunst', { ncGrade: 2.5 }),
  program('Regie', 'Kunst', { ncGrade: 2.6 }),
  program('Tanz', 'Kunst', { ncGrade: 2.7 }),
  program('Fotografie', 'Kunst', { ncGrade: 2.6 }),

  // Umwelt (8)
  program('Umweltwissenschaften', 'Umwelt', { ncRequired: false }),
  program('Geografie', 'Umwelt', { ncRequired: false }),
  program('Landschaftsarchitektur', 'Umwelt', { ncGrade: 2.6 }),
  program('Forstwissenschaft', 'Umwelt', { ncGrade: 2.8 }),
  program('Agrarwissenschaften', 'Umwelt', { ncGrade: 2.9 }),
  program('Gartenbau', 'Umwelt', { ncGrade: 3.0 }),
  program('Lebensmitteltechnologie', 'Umwelt', { ncGrade: 2.7 }),
  program('Nachhaltigkeitswissenschaften', 'Umwelt', { ncGrade: 2.5 }),

  // Sport (4)
  program('Sportwissenschaft', 'Sport', { ncGrade: 2.5 }),
  program('Sportmanagement', 'Sport', { ncGrade: 2.6 }),
  program('Sport und Gesundheit', 'Sport', { ncGrade: 2.5 }),
  program('Bewegungswissenschaft', 'Sport', { ncGrade: 2.6 }),

  // Lehramt (8)
  program('Lehramt Grundschule', 'Lehramt', { ncGrade: 2.5 }),
  program('Lehramt Gymnasium Mathematik/Informatik', 'Lehramt', { ncGrade: 2.3 }),
  program('Lehramt Gymnasium Englisch/Deutsch', 'Lehramt', { ncGrade: 2.4 }),
  program('Lehramt Realschule', 'Lehramt', { ncGrade: 2.6 }),
  program('Lehramt Hauptschule', 'Lehramt', { ncGrade: 2.7 }),
  program('Lehramt Sonderpädagogik', 'Lehramt', { ncGrade: 2.5 }),
  program('Lehramt Berufsschule', 'Lehramt', { ncGrade: 2.7 }),
  program('Lehramt Grundschule Deutsch/Mathematik', 'Lehramt', { ncGrade: 2.5 }),

  // Interdisziplinär (4)
  program('Kognitionswissenschaft', 'Interdisziplinär', { ncGrade: 2.2 }),
  program('Digital Humanities', 'Interdisziplinär', { language: 'en', ncGrade: 2.5 }),
  program('Science and Technology Studies', 'Interdisziplinär', { language: 'en', ncRequired: false }),
  program('European Studies', 'Interdisziplinär', { language: 'en', ncGrade: 2.5 }),
];

const outputPath = path.join(__dirname, '..', 'db', 'programs_200_raw.json');
fs.writeFileSync(outputPath, JSON.stringify(programs, null, 2), 'utf8');
console.log(`${programs.length} Studiengänge generiert: ${outputPath}`);

// Statistik
const byField = {};
for (const p of programs) {
  byField[p.field] = (byField[p.field] || 0) + 1;
}
console.log('\nNach Fachrichtung:');
Object.entries(byField)
  .sort((a, b) => b[1] - a[1])
  .forEach(([field, count]) => console.log(`  ${field}: ${count}`));

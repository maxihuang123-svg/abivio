import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';

// Types
interface Program {
  id: number;
  name: string;
  field: string;
  degree: string;
  duration_semesters: number;
  language: string;
  nc_required: number;
  nc_grade: number | null;
  description: string;
  career: string;
  interests: string;
  strengths: string;
  work_style: string;
  is_stem: number;
  is_business: number;
  is_social: number;
  is_creative: number;
  is_health: number;
  popularity_rank: number;
  application_deadline_winter: string | null;
  application_deadline_summer: string | null;
  university_id: number | null;
  university_name?: string;
  university_short_name?: string;
  university_city?: string;
}

interface QuizAnswers {
  interests: string[];
  strengths: string[];
  work_style: string[];
  nc_grade?: number | null;
  language?: string;
  duration?: string;
  region?: string;
  preferred_university?: string | null;
}

interface Env {
  DB: D1Database;
  AI: Ai;
  ENVIRONMENT?: string;
  ADMIN_API_KEY?: string;
  // Email provider config (default: resend)
  EMAIL_PROVIDER?: string;
  EMAIL_FROM?: string;
  // Provider-specific API keys
  RESEND_API_KEY?: string;
  RESEND_API_TOKEN?: string;
  RESEND_TOKEN?: string;
  BREVO_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  AWS_SES_ACCESS_KEY?: string;
  AWS_SES_SECRET_KEY?: string;
  AWS_SES_REGION?: string;
}

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Health check
app.get('/health', (c) =>
  c.json({
    ok: true,
    env: c.env.ENVIRONMENT || 'dev',
    email_configured: !!(c.env.RESEND_API_KEY || c.env.RESEND_API_TOKEN || c.env.RESEND_TOKEN || c.env.BREVO_API_KEY || c.env.SENDGRID_API_KEY),
  })
);

// Waitlist signup
app.post('/waitlist', async (c) => {
  const { email, graduationYear } = await c.req.json<{ email?: string; graduationYear?: number }>();

  if (!email || !email.includes('@')) {
    throw new HTTPException(400, { message: 'Gültige E-Mail-Adresse erforderlich' });
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO waitlist (email, graduation_year) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET graduation_year = excluded.graduation_year`
    )
      .bind(email, graduationYear || null)
      .run();

    return c.json({ success: true, message: 'Du stehst auf der Warteliste.' });
  } catch (err: any) {
    console.error('waitlist error', err);
    throw new HTTPException(500, { message: `E-Mail konnte nicht gespeichert werden: ${err?.message || err}` });
  }
});

// List all programs (for internal use)
app.get('/programs', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, u.name AS university_name, u.short_name AS university_short_name, u.city AS university_city
    FROM programs p
    LEFT JOIN universities u ON p.university_id = u.hs_number
    ORDER BY p.popularity_rank ASC
  `).all<Program>();
  return c.json({ programs: results || [] });
});

interface University {
  id: number;
  name: string;
  short_name: string;
  type: string;
  federal_state: string;
  city: string;
  website: string;
  student_count: number;
}

// List all universities
app.get('/universities', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT id, name, short_name, type, federal_state, city, website, student_count FROM universities ORDER BY name ASC')
    .all<University>();
  return c.json({ universities: results || [], count: results?.length || 0 });
});

// Submit quiz and compute recommendations
app.post('/quiz', async (c) => {
  const body = await c.req.json<{ session_id?: string; answers?: QuizAnswers }>();
  const sessionId = body.session_id;
  const answers = body.answers;

  if (!sessionId || !answers) {
    throw new HTTPException(400, { message: 'Session-ID und Antworten erforderlich' });
  }

  const db = c.env.DB;

  // Store session + answers
  await db.prepare('INSERT OR IGNORE INTO quiz_sessions (id) VALUES (?)').bind(sessionId).run();

  const insertAnswer = db.prepare('INSERT INTO quiz_answers (session_id, question_key, answer_value) VALUES (?, ?, ?)');
  const answerEntries: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(answers)) {
    const val = Array.isArray(value) ? JSON.stringify(value) : String(value);
    answerEntries.push({ key, value: val });
  }

  for (const entry of answerEntries) {
    await insertAnswer.bind(sessionId, entry.key, entry.value).run();
  }

  await db.prepare('UPDATE quiz_sessions SET completed_at = CURRENT_TIMESTAMP WHERE id = ?').bind(sessionId).run();

  // Compute recommendations
  const recommendations = await computeRecommendations(db, answers);

  // Store recommendations
  await db.prepare('DELETE FROM recommendations WHERE session_id = ?').bind(sessionId).run();
  const insertRec = db.prepare(
    'INSERT INTO recommendations (session_id, program_id, score, reasoning, rank) VALUES (?, ?, ?, ?, ?)'
  );
  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    await insertRec.bind(sessionId, rec.program.id, rec.score, rec.reasoning, i + 1).run();
  }

  return c.json({
    success: true,
    session_id: sessionId,
    recommendations: recommendations.map((r) => ({ ...r.program, score: r.score, reasoning: r.reasoning })),
  });
});

// Submit feedback for recommendations
app.post('/feedback', async (c) => {
  const body = await c.req.json<{
    session_id?: string;
    helpfulness?: number;
    found_match?: string;
    nps?: number;
    missing?: string;
  }>();

  const sessionId = body.session_id;
  const helpfulness = body.helpfulness;
  const foundMatch = body.found_match;
  const nps = body.nps;
  const missing = body.missing?.trim();

  if (!sessionId) {
    throw new HTTPException(400, { message: 'session_id erforderlich' });
  }

  // Validate ranges
  if (helpfulness !== undefined && (helpfulness < 1 || helpfulness > 5)) {
    throw new HTTPException(400, { message: 'helpfulness muss zwischen 1 und 5 liegen' });
  }
  if (foundMatch !== undefined && !['yes', 'somewhat', 'no'].includes(foundMatch)) {
    throw new HTTPException(400, { message: 'found_match ungültig' });
  }
  if (nps !== undefined && (nps < 0 || nps > 10)) {
    throw new HTTPException(400, { message: 'nps muss zwischen 0 und 10 liegen' });
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO recommendation_feedback (session_id, helpfulness, found_match, nps, missing)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(sessionId, helpfulness ?? null, foundMatch ?? null, nps ?? null, missing || null)
      .run();

    return c.json({ success: true, message: 'Feedback gespeichert. Danke!' });
  } catch (err: any) {
    console.error('feedback error', err);
    throw new HTTPException(500, { message: `Feedback konnte nicht gespeichert werden: ${err?.message || err}` });
  }
});

// Send recommendations by email
app.post('/share/email', async (c) => {
  const body = await c.req.json<{ session_id?: string; email?: string }>();
  const sessionId = body.session_id;
  const email = body.email?.trim().toLowerCase();

  if (!sessionId) {
    throw new HTTPException(400, { message: 'session_id erforderlich' });
  }
  if (!email || !email.includes('@')) {
    throw new HTTPException(400, { message: 'Gültige E-Mail-Adresse erforderlich' });
  }

  const recommendations = await fetchRecommendations(c.env.DB, sessionId);
  if (!recommendations || recommendations.length === 0) {
    throw new HTTPException(404, { message: 'Keine Empfehlungen gefunden' });
  }

  const shareUrl = `https://abivio.de/?session=${encodeURIComponent(sessionId)}`;
  const subject = 'Deine abivio-Studiengang-Empfehlungen';
  const html = buildRecommendationEmail(recommendations, shareUrl);
  const text = buildRecommendationEmailText(recommendations, shareUrl);

  const provider = createEmailProvider(c.env);
  if (!provider) {
    const configuredProvider = (c.env.EMAIL_PROVIDER || 'resend').toLowerCase();
    throw new HTTPException(503, {
      message: `E-Mail-Versand ist aktuell nicht konfiguriert.`,
    });
  }

  try {
    await provider.sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    return c.json({ success: true, message: 'Empfehlungen wurden an deine E-Mail gesendet.' });
  } catch (err: any) {
    console.error('email send error', err);
    const message = err instanceof HTTPException ? err.message : 'E-Mail-Versand fehlgeschlagen.';
    throw new HTTPException(502, { message });
  }
});

// Get recommendations for a session
app.get('/recommendations', async (c) => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) {
    throw new HTTPException(400, { message: 'session_id erforderlich' });
  }

  const { results } = await c.env.DB
    .prepare(
      `SELECT p.*, r.score, r.reasoning, r.rank, u.name AS university_name, u.short_name AS university_short_name, u.city AS university_city
       FROM recommendations r
       JOIN programs p ON r.program_id = p.id
       LEFT JOIN universities u ON p.university_id = u.hs_number
       WHERE r.session_id = ?
       ORDER BY r.rank ASC`
    )
    .bind(sessionId)
    .all<Program & { score: number; reasoning: string; rank: number }>();

  if (!results || results.length === 0) {
    throw new HTTPException(404, { message: 'Keine Empfehlungen gefunden' });
  }

  return c.json({ recommendations: results });
});

// Chat endpoint powered by Cloudflare Workers AI
app.post('/chat', async (c) => {
  const body = await c.req.json<{
    messages?: Array<{ role: string; content: string }>;
    consent?: boolean;
  }>();
  const messages = body.messages || [];
  const consent = body.consent === true;

  if (messages.length === 0) {
    throw new HTTPException(400, { message: 'Mindestens eine Nachricht erforderlich' });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage.content || lastMessage.content.trim().length === 0) {
    throw new HTTPException(400, { message: 'Letzte Nachricht darf nicht leer sein' });
  }

  const userQuestion = lastMessage.content.trim();

  // 1. Regelbasierte FAQ-Abkürzung: günstig, schnell, deterministisch
  const shortcut = getFaqShortcut(userQuestion);
  if (shortcut) {
    await logChatQuestion(c.env.DB, userQuestion, shortcut, 'faq', null, consent);
    return c.json({
      response: shortcut,
      model: 'faq-shortcut',
      cached: true,
    });
  }

  // 2. Themen-Filter: Nur studienrelevante Fragen erlauben
  if (!isQuestionAllowed(userQuestion)) {
    const offTopicResponse =
      'Ich bin dein Studienberater für die Studienwahl in Deutschland. Stell mir gerne Fragen zu Studiengängen, NCs, Bewerbung, Uni vs. FH oder Bewerbungsfristen.';
    await logChatQuestion(c.env.DB, userQuestion, offTopicResponse, 'blocked', null, consent);
    return c.json({
      response: offTopicResponse,
      model: 'topic-filter',
      cached: true,
    });
  }

  // 3. Verlauf auf die letzten 5 Nachrichten begrenzen, um Tokens zu sparen
  const recentMessages = messages.slice(-5);

  // 4. Kurzer, präziser System-Prompt
  const systemPrompt = `Du bist der abivio-Studienberater für Abiturienten und Fachabiturienten in Deutschland.
Beantworte AUSSCHLIESSLICH Fragen zu Studienwahl, Bachelor-Studiengängen, NC, Bewerbung, Unterschiede zwischen Uni/FH und Bewerbungsfristen in Deutschland.
Antworte kurz, verständlich und praxisnah (max. 2–3 Absätze).
Wenn eine Frage nichts mit diesen Themen zu tun hat, sage höflich, dass du dazu nicht helfen kannst, und frage nach einer studienbezogenen Frage.
Grenzen: Du gibst keine Rechts-, Therapie- oder Finanzberatung. Du garantierst keine Zulassung.
Wenn dir eine Frage zu spezifisch ist, verweise höflich auf offizielle Quellen wie hochschulkompass.de, uni-assist.de oder hochschulstart.de.`;

  const chatMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...recentMessages,
  ];

  try {
    const modelName = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';
    const result = await c.env.AI.run(modelName, {
      messages: chatMessages,
      max_tokens: 350,
      temperature: 0.5,
    });

    const responseText =
      typeof result === 'string'
        ? result
        : (result as any).response || (result as any).text || 'Entschuldigung, ich konnte keine Antwort generieren.';

    await logChatQuestion(c.env.DB, userQuestion, responseText, 'llm', modelName, consent);

    return c.json({
      response: responseText,
      model: modelName,
      cached: false,
    });
  } catch (err: any) {
    console.error('chat ai error', err);
    throw new HTTPException(502, {
      message: 'Der Studienberater ist momentan nicht erreichbar. Bitte versuche es in wenigen Sekunden erneut.',
    });
  }
});

// Admin endpoint to review anonymous chat logs
app.get('/admin/chat-logs', async (c) => {
  const providedKey = c.req.query('key');
  const expectedKey = c.env.ADMIN_API_KEY;

  if (!expectedKey || providedKey !== expectedKey) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const { results } = await c.env.DB
    .prepare(
      `SELECT
        detected_intent,
        response_source,
        model,
        COUNT(*) as count,
        MAX(created_at) as last_seen
       FROM chat_logs
       GROUP BY detected_intent, response_source, model
       ORDER BY count DESC`
    )
    .all<{
      detected_intent: string | null;
      response_source: string;
      model: string | null;
      count: number;
      last_seen: string;
    }>();

  const recent = await c.env.DB
    .prepare(
      `SELECT id, question_preview, detected_intent, response_source, model, consent_given, created_at
       FROM chat_logs
       WHERE consent_given = 1
       ORDER BY created_at DESC
       LIMIT 50`
    )
    .all<{
      id: number;
      question_preview: string | null;
      detected_intent: string | null;
      response_source: string;
      model: string | null;
      consent_given: number;
      created_at: string;
    }>();

  return c.json({
    summary: results || [],
    recent_consented: recent.results || [],
    note: 'Question previews are only stored when the user explicitly consented.',
  });
});

// Admin endpoint to review recommendation feedback
app.get('/admin/feedback', async (c) => {
  const providedKey = c.req.query('key');
  const expectedKey = c.env.ADMIN_API_KEY;

  if (!expectedKey || providedKey !== expectedKey) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const { results } = await c.env.DB
    .prepare(
      `SELECT
        COUNT(*) as total,
        AVG(helpfulness) as avg_helpfulness,
        AVG(nps) as avg_nps,
        SUM(CASE WHEN found_match = 'yes' THEN 1 ELSE 0 END) as found_yes,
        SUM(CASE WHEN found_match = 'somewhat' THEN 1 ELSE 0 END) as found_somewhat,
        SUM(CASE WHEN found_match = 'no' THEN 1 ELSE 0 END) as found_no
       FROM recommendation_feedback`
    )
    .all<{
      total: number;
      avg_helpfulness: number | null;
      avg_nps: number | null;
      found_yes: number;
      found_somewhat: number;
      found_no: number;
    }>();

  const recent = await c.env.DB
    .prepare(
      `SELECT id, session_id, helpfulness, found_match, nps, missing, created_at
       FROM recommendation_feedback
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .all<{
      id: number;
      session_id: string;
      helpfulness: number | null;
      found_match: string | null;
      nps: number | null;
      missing: string | null;
      created_at: string;
    }>();

  return c.json({
    summary: results?.[0] || null,
    recent: recent.results || [],
  });
});

async function logChatQuestion(
  db: D1Database,
  question: string,
  response: string,
  source: 'faq' | 'llm',
  model: string | null,
  consent: boolean
) {
  try {
    const intent = detectIntent(question, response, source);
    const preview = consent ? question.slice(0, 120) : null;

    await db
      .prepare(
        'INSERT INTO chat_logs (question_preview, detected_intent, response_source, model, consent_given) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(preview, intent, source, model, consent ? 1 : 0)
      .run();
  } catch (err) {
    // Logging must never break the chat experience
    console.error('chat log error', err);
  }
}

function detectIntent(question: string, response: string, source: 'faq' | 'llm'): string | null {
  const normalized = question.toLowerCase();

  const intentMap: Record<string, string[]> = {
    nc: ['nc', 'numerus clausus', 'abiturnote', 'zulassungsgrenze'],
    bewerbung: ['bewerb', 'hochschulstart', 'uni-assist', 'anmeldung'],
    'uni-vs-fh': ['uni', 'fachhochschule', 'fh', 'haw'],
    dauer: ['dauer', 'semester', 'wie lange'],
    fristen: ['frist', 'bewerbungsfrist', 'bis wann'],
    abivio: ['abivio', 'quiz', 'empfehlung'],
    fachabitur: ['fachabitur', 'fachabi'],
  };

  for (const [intent, keywords] of Object.entries(intentMap)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return intent;
    }
  }

  if (source === 'faq') {
    // Fallback for FAQ shortcuts: derive from response keywords
    const responseNormalized = response.toLowerCase();
    if (responseNormalized.includes('nc')) return 'nc';
    if (responseNormalized.includes('bewerb')) return 'bewerbung';
    if (responseNormalized.includes('fachhochschule') || responseNormalized.includes('universitäten')) return 'uni-vs-fh';
    if (responseNormalized.includes('semester')) return 'dauer';
    if (responseNormalized.includes('frist')) return 'fristen';
    if (responseNormalized.includes('abivio')) return 'abivio';
    if (responseNormalized.includes('fachabitur')) return 'fachabitur';
  }

  return 'allgemein';
}

function getFaqShortcut(question: string): string | null {
  const normalized = question.toLowerCase().trim();

  const shortcuts: { patterns: string[]; response: string }[] = [
    {
      patterns: ['was ist nc', 'was ist ein nc', 'was bedeutet nc', 'nc bedeutet', 'numerus clausus', 'was heißt nc'],
      response:
        'NC steht für „Numerus clausus“ (lateinisch für „geschlossene Zahl“). Er gibt die Abiturnote an, die du mindestens brauchst, um für einen Studiengang zugelassen zu werden. Je niedriger der NC, desto besser musst du sein. Nicht jeder Studiengang hat einen NC — viele haben auch ein Losverfahren oder lokale Auswahlverfahren.',
    },
    {
      patterns: ['wie bewerbe ich mich', 'bewerbung studium', 'wo muss ich mich bewerben', 'wie bewerben'],
      response:
        'Das kommt auf den Studiengang an: Bei zulassungsbeschränkten Studiengängen mit bundesweitem NC läuft die Bewerbung oft über hochschulstart.de. Bei Hochschulen mit eigenem Auswahlverfahren oder ohne NC bewirbst du dich direkt an der Hochschule. Internationale Bewerber nutzen oft uni-assist.de.',
    },
    {
      patterns: ['unterschied uni fh', 'uni oder fachhochschule', 'fh oder uni', 'unterschied zwischen uni und fh'],
      response:
        'Universitäten sind stärker forschungs- und theorieorientiert, Fachhochschulen (FH / HAW) sind praxisnäher mit mehr Projekten und oft kleineren Kursen. Beide führen zum Bachelor-Abschluss. Eine FH kann besonders gut sein, wenn du schnell berufsorientiert arbeiten möchtest.',
    },
    {
      patterns: ['wie lange dauert bachelor', 'studium dauer', 'bachelor semest', 'wie lange studium'],
      response:
        'Ein Bachelor-Studium dauert in der Regel 6 Semester (3 Jahre). Manche Studiengänge, z. B. im Gesundheitsbereich oder mit integriertem Praxissemester, können 7–8 Semester dauern.',
    },
    {
      patterns: ['was ist ein studiengang', 'studiengang bedeutet', 'was ist studiengang'],
      response:
        'Ein Studiengang ist ein konkretes Studienprogramm an einer Hochschule, das zu einem Abschluss wie Bachelor of Arts (B.A.) oder Bachelor of Science (B.Sc.) führt. Beispiele sind BWL, Informatik oder Psychologie.',
    },
    {
      patterns: ['wie funktioniert abivio', 'was macht abivio', 'abivio quiz', 'was ist abivio'],
      response:
        'abivio hilft dir, in wenigen Minuten passende Bachelor-Studiengänge in Deutschland zu finden. Du beantwortest ein kurzes Quiz zu deinen Interessen, Stärken und Wünschen — wir zeigen dir dann eine personalisierte Top-Liste mit passenden Studiengängen.',
    },
    {
      patterns: ['fachabitur studium', 'kann ich mit fachabi studieren', 'fachabiturient', 'fachabi studium'],
      response:
        'Ja, mit Fachabitur kannst du an vielen Fachhochschulen und teilweise auch an Universitäten studieren — oft mit eingeschränktem Fachhochschulberechtigungsgebiet. Prüfe am besten direkt auf der Hochschulseite oder beim studienkolleg.de, welche Studiengänge für dich offen sind.',
    },
    {
      patterns: ['bewerbungsfrist', 'fristen studium', 'bis wann bewerben', 'wann bewerben'],
      response:
        'Für das Wintersemester liegt die Bewerbungsfrist meist zwischen dem 15. Mai und dem 15. Juli, für das Sommersemester zwischen dem 15. November und dem 15. Januar. Sie variiert je nach Hochschule und Studiengang — am sichersten ist ein Blick auf die jeweilige Hochschul-Website.',
    },
  ];

  for (const shortcut of shortcuts) {
    if (shortcut.patterns.some((pattern) => normalized.includes(pattern))) {
      return shortcut.response;
    }
  }

  return null;
}

function isQuestionAllowed(question: string): boolean {
  const normalized = question.toLowerCase().trim();

  // Explicitly off-topic patterns that should be blocked immediately
  const blockedPatterns = [
    /^was ist\s+\d+\s*[\+\-\*\/]\s*\d+/, // "was ist 1+1"
    /\d+\s*[\+\-\*\/]\s*\d+\s*=?$/, // "1 + 1", "5*3"
    'weltkrieg',
    'kochrezept',
    'wetter',
    'bundeskanzler',
    'bundespräsident',
    'aktuelle politik',
    'lotto',
    'aktienkurs',
    'bitcoin',
    'krypto',
    'sport ergebnis',
    'fußball',
    'rechne',
    'berechne',
    'wer hat erfunden',
    'wie alt ist',
    'wie viel uhr',
    'welcher tag ist heute',
  ];

  for (const pattern of blockedPatterns) {
    if (typeof pattern === 'string') {
      if (normalized.includes(pattern)) return false;
    } else if (pattern instanceof RegExp) {
      if (pattern.test(normalized)) return false;
    }
  }

  // Allowed study-related keywords. If none match, the question is likely off-topic.
  const allowedKeywords = [
    'studium',
    'studiengang',
    'studieren',
    'bachelor',
    'uni',
    'universität',
    'fachhochschule',
    'fh',
    'haw',
    'nc',
    'numerus clausus',
    'bewerb',
    'hochschulstart',
    'uni-assist',
    'frist',
    'semester',
    'vorlesung',
    'prüfung',
    'abschluss',
    'beruf',
    'karriere',
    'abitur',
    'fachabitur',
    'ausbildung',
    'dual',
    'schüler',
    'student',
    'hörsaal',
    'campus',
    'tum',
    'lmu',
    'kit',
    'rwth',
    'fu berlin',
    'humoldt',
    'tu',
    'informatik',
    'wirtschaft',
    'medizin',
    'psychologie',
    'jura',
    'bwl',
    'vwl',
    'maschinenbau',
    'elektrotechnik',
    'biologie',
    'chemie',
    'physik',
    'mathematik',
    'englisch',
    'deutsch',
    'geschichte',
    'kunst',
    'musik',
    'sport',
    'sozial',
    'pädagogik',
    'lehramt',
    'pflege',
    'gesundheit',
    'pharmazie',
    'architektur',
    'design',
    'medien',
    'journalismus',
    'politik',
    'geisteswissenschaft',
    'naturwissenschaft',
    'ingenieur',
    'technik',
    'ai',
    'künstliche intelligenz',
    'data science',
    'nachhaltigkeit',
    'klimawandel',
    'abivio',
    'quiz',
    'empfehlung',
    'hochschulkompass',
    'daad',
  ];

  return allowedKeywords.some((kw) => normalized.includes(kw));
}

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error('Unhandled error', err);
  return c.json({ error: 'Interner Serverfehler' }, 500);
});

// Recommendation engine
async function computeRecommendations(db: D1Database, answers: QuizAnswers) {
  const { results } = await db.prepare(`
    SELECT p.*, u.name AS university_name, u.short_name AS university_short_name, u.city AS university_city
    FROM programs p
    LEFT JOIN universities u ON p.university_id = u.hs_number
  `).all<Program>();
  const programs = results || [];

  const userInterests = answers.interests || [];
  const userStrengths = answers.strengths || [];
  const userWorkStyle = answers.work_style || [];
  const userNc = answers.nc_grade ?? null;
  const userLanguage = answers.language || 'de';
  const userDuration = answers.duration || 'egal';
  const preferredUniversity = answers.preferred_university || null;

  const scored = programs.map((program) => {
    let score = 0;
    const reasons: string[] = [];

    const pInterests: string[] = safeJsonParse(program.interests);
    const pStrengths: string[] = safeJsonParse(program.strengths);
    const pWorkStyle: string[] = safeJsonParse(program.work_style);

    // Interest overlap (max 40 points)
    const interestMatches = intersection(userInterests, pInterests);
    score += interestMatches.length * 8;
    if (interestMatches.length > 0) {
      reasons.push(`passt zu deinen Interessen: ${interestMatches.slice(0, 2).join(', ')}`);
    }

    // Strengths overlap (max 30 points)
    const strengthMatches = intersection(userStrengths, pStrengths);
    score += strengthMatches.length * 6;
    if (strengthMatches.length > 0) {
      reasons.push(`baut auf deinen Stärken auf: ${strengthMatches.slice(0, 2).join(', ')}`);
    }

    // Work style overlap (max 20 points)
    const styleMatches = intersection(userWorkStyle, pWorkStyle);
    score += styleMatches.length * 5;
    if (styleMatches.length > 0) {
      reasons.push(`dein Arbeitsstil passt: ${styleMatches.slice(0, 2).join(', ')}`);
    }

    // Category bonus
    const categoryScore = categoryBonus(program, userInterests);
    score += categoryScore;

    // NC filter/penalty
    if (userNc !== null && program.nc_required && program.nc_grade !== null) {
      if (userNc < program.nc_grade) {
        score += 5;
      } else if (userNc <= program.nc_grade + 0.3) {
        reasons.push('NC könnte knapp werden');
      } else {
        score -= 15;
        reasons.push('dein NC liegt unter dem üblichen NC');
      }
    }

    // Language preference
    if (userLanguage === 'de' && program.language === 'en') {
      score -= 10;
      reasons.push('auf Englisch — nur falls du das bevorzugst');
    } else if (userLanguage === 'en' && program.language === 'de') {
      score -= 5;
    } else if (userLanguage === 'egal') {
      score += 2;
    }

    // Duration preference
    const duration = program.duration_semesters || 6;
    if (userDuration === 'kurz' && duration <= 6) {
      score += 4;
    } else if (userDuration === 'kurz' && duration > 6) {
      score -= 6;
      reasons.push('längerer Studiengang');
    } else if (userDuration === 'lang' && duration >= 8) {
      score += 3;
    }

    // University preference
    if (preferredUniversity) {
      const uniName = program.university_name || '';
      const uniShortName = program.university_short_name || '';
      const uniCity = program.university_city || '';
      const preferred = preferredUniversity.toLowerCase();
      const isMatch =
        uniName.toLowerCase().includes(preferred) ||
        uniShortName.toLowerCase().includes(preferred) ||
        uniCity.toLowerCase().includes(preferred);
      if (isMatch) {
        score += 20;
        reasons.push(`an deiner Wunsch-Uni ${uniCity}`);
      }
    }

    // Popularity tie-breaker
    score += Math.max(0, (100 - (program.popularity_rank || 999))) / 50;

    return {
      program,
      score,
      reasoning: reasons.length > 0 ? reasons.join('; ') + '.' : 'Solide allgemeine Empfehlung.',
    };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function safeJsonParse(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function intersection(a: string[], b: string[]): string[] {
  return a.filter((x) => b.includes(x));
}

function categoryBonus(program: Program, interests: string[]): number {
  let bonus = 0;
  const map: Record<string, string[]> = {
    technik: ['is_stem'],
    wirtschaft: ['is_business'],
    gesellschaft: ['is_social'],
    sozial: ['is_social'],
    kreativ: ['is_creative'],
    medizin: ['is_health'],
    gesundheit: ['is_health'],
  };

  for (const interest of interests) {
    const flags = map[interest] || [];
    for (const flag of flags) {
      if ((program as any)[flag]) {
        bonus += 3;
      }
    }
  }
  return bonus;
}

async function fetchRecommendations(db: D1Database, sessionId: string) {
  const { results } = await db
    .prepare(
      `SELECT p.*, r.score, r.reasoning, r.rank, u.name AS university_name, u.short_name AS university_short_name, u.city AS university_city
       FROM recommendations r
       JOIN programs p ON r.program_id = p.id
       LEFT JOIN universities u ON p.university_id = u.hs_number
       WHERE r.session_id = ?
       ORDER BY r.rank ASC`
    )
    .bind(sessionId)
    .all<Program & { score: number; reasoning: string; rank: number }>();

  return results || [];
}

function escapeHtmlEmail(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildRecommendationEmail(recommendations: Program[], shareUrl: string): string {
  const items = recommendations
    .map((rec, idx) => {
      const ncText = rec.nc_required
        ? `NC: ca. ${rec.nc_grade?.toFixed(1).replace('.', ',') || 'k.A.'}`
        : 'Ohne NC';
      const uniText = rec.university_name ? ` an der ${escapeHtmlEmail(rec.university_name)}` : '';
      return `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 18px;">${idx + 1}. ${escapeHtmlEmail(rec.name)}${uniText}</h3>
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
            ${escapeHtmlEmail(rec.field)} · ${escapeHtmlEmail(rec.degree)} · ${rec.duration_semesters} Semester · ${ncText}
          </p>
          <p style="margin: 0 0 8px; color: #111827;">${escapeHtmlEmail(rec.description)}</p>
          <p style="margin: 0; padding: 10px; background: #e9eefd; border-radius: 8px; color: #3730a3; font-size: 14px;">
            <strong>Warum das passt:</strong> ${escapeHtmlEmail(rec.reasoning)}
          </p>
        </div>
      `;
    })
    .join('');

  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #4f46e5;">Deine abivio-Empfehlungen</h2>
      <p>Hier sind die Bachelor-Studiengänge, die am besten zu deinen Antworten passen:</p>
      ${items}
      <p style="margin-top: 24px;">
        <a href="${escapeHtmlEmail(shareUrl)}" style="display: inline-block; padding: 12px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">
          Empfehlungen online ansehen
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        Diese E-Mail wurde auf Wunsch von abivio.de versendet.
      </p>
    </div>
  `;
}

function buildRecommendationEmailText(recommendations: Program[], shareUrl: string): string {
  const items = recommendations
    .map((rec, idx) => {
      const ncText = rec.nc_required
        ? `NC: ca. ${rec.nc_grade?.toFixed(1).replace('.', ',') || 'k.A.'}`
        : 'Ohne NC';
      const uniText = rec.university_name ? ` an der ${rec.university_name}` : '';
      return `${idx + 1}. ${rec.name}${uniText}
${rec.field} · ${rec.degree} · ${rec.duration_semesters} Semester · ${ncText}
${rec.description}
Warum das passt: ${rec.reasoning}`;
    })
    .join('\n\n');

  return `Deine abivio-Empfehlungen\n\n${items}\n\nOnline ansehen: ${shareUrl}\n\nDiese E-Mail wurde auf Wunsch von abivio.de versendet.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email provider abstraction
// Supports: resend (default), brevo, sendgrid, aws-ses
// Add new providers here without touching /api/share/email
// ─────────────────────────────────────────────────────────────────────────────

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<void>;
}

function getDefaultFrom(env: Env): string {
  return env.EMAIL_FROM || 'abivio <noreply@abivio.de>';
}

function createEmailProvider(env: Env): EmailProvider | null {
  const provider = (env.EMAIL_PROVIDER || 'resend').toLowerCase();

  switch (provider) {
    case 'resend': {
      // Cloudflare Resend integration may use different binding names
      const key = env.RESEND_API_KEY || env.RESEND_API_TOKEN || env.RESEND_TOKEN;
      return key ? new ResendEmailProvider(key, getDefaultFrom(env)) : null;
    }
    case 'brevo':
      return env.BREVO_API_KEY ? new BrevoEmailProvider(env.BREVO_API_KEY, getDefaultFrom(env)) : null;
    case 'sendgrid':
      return env.SENDGRID_API_KEY ? new SendgridEmailProvider(env.SENDGRID_API_KEY, getDefaultFrom(env)) : null;
    case 'aws-ses':
      return env.AWS_SES_ACCESS_KEY && env.AWS_SES_SECRET_KEY
        ? new AwsSesEmailProvider(env.AWS_SES_ACCESS_KEY, env.AWS_SES_SECRET_KEY, env.AWS_SES_REGION || 'eu-central-1', getDefaultFrom(env))
        : null;
    default:
      console.error(`Unknown email provider: ${provider}`);
      return null;
  }
}

class ResendEmailProvider implements EmailProvider {
  constructor(private apiKey: string, private from: string) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('resend error', response.status, errText);
      throw new HTTPException(502, { message: 'E-Mail konnte nicht versendet werden.' });
    }
  }
}

class BrevoEmailProvider implements EmailProvider {
  constructor(private apiKey: string, private from: string) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: parseSender(this.from),
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('brevo error', response.status, errText);
      throw new HTTPException(502, { message: 'E-Mail konnte nicht versendet werden.' });
    }
  }
}

class SendgridEmailProvider implements EmailProvider {
  constructor(private apiKey: string, private from: string) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: message.to }] }],
        from: parseSender(this.from),
        subject: message.subject,
        content: [
          { type: 'text/plain', value: message.text },
          { type: 'text/html', value: message.html },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('sendgrid error', response.status, errText);
      throw new HTTPException(502, { message: 'E-Mail konnte nicht versendet werden.' });
    }
  }
}

class AwsSesEmailProvider implements EmailProvider {
  constructor(
    private accessKey: string,
    private secretKey: string,
    private region: string,
    private from: string
  ) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    // AWS SES requires signed requests. For now we throw a clear error directing
    // future implementers to add AWS Signature v4 signing.
    console.error('AWS SES provider selected but not fully implemented');
    throw new HTTPException(501, { message: 'AWS SES-Versand ist noch nicht implementiert.' });
  }
}

function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: from.trim() };
}

export const onRequest = handle(app);

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
}

interface QuizAnswers {
  interests: string[];
  strengths: string[];
  work_style: string[];
  nc_grade?: number | null;
  language?: string;
  duration?: string;
  region?: string;
}

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Health check
app.get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT || 'dev' }));

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
  const { results } = await c.env.DB.prepare('SELECT * FROM programs ORDER BY popularity_rank ASC').all<Program>();
  return c.json({ programs: results || [] });
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

// Get recommendations for a session
app.get('/recommendations', async (c) => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) {
    throw new HTTPException(400, { message: 'session_id erforderlich' });
  }

  const { results } = await c.env.DB
    .prepare(
      `SELECT p.*, r.score, r.reasoning, r.rank
       FROM recommendations r
       JOIN programs p ON r.program_id = p.id
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
  const { results } = await db.prepare('SELECT * FROM programs').all<Program>();
  const programs = results || [];

  const userInterests = answers.interests || [];
  const userStrengths = answers.strengths || [];
  const userWorkStyle = answers.work_style || [];
  const userNc = answers.nc_grade ?? null;
  const userLanguage = answers.language || 'de';
  const userDuration = answers.duration || 'egal';

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

export const onRequest = handle(app);

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── CORS ────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

/**
 * Build a cors `origin` option that supports:
 *  - exact strings  → 'https://example.com'
 *  - glob-style wildcards  → 'https://*.vercel.app'
 */
function buildCorsOrigin(origins) {
  const matchers = origins.map((o) => {
    if (!o.includes('*')) return o;
    // Convert 'https://*.vercel.app' to a RegExp
    const escaped = o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+');
    return new RegExp(`^${escaped}$`);
  });

  return function (origin, callback) {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = matchers.some((m) =>
      typeof m === 'string' ? m === origin : m.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  };
}

const corsOptions = {
  origin: buildCorsOrigin(rawOrigins),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
// Explicit preflight handler for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// ── Rate limiting ────────────────────────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verify a Cloudflare Turnstile token server-side.
 * @param {string} token
 * @param {string} remoteip
 * @returns {Promise<boolean>}
 */
async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not configured');

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip,
  });

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body }
  );
  const data = await res.json();
  return data.success === true;
}

/**
 * Resolve approximate location (country, city) from an IP address using
 * the free ip-api.com JSON endpoint.  Falls back gracefully on errors.
 * @param {string} ip
 * @returns {Promise<{country: string, city: string, lat: number|null, lon: number|null}>}
 */
async function resolveLocation(ip) {
  try {
    // Skip private/loopback addresses that ip-api cannot resolve.
    if (
      !ip ||
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    ) {
      return { country: null, city: null, lat: null, lon: null };
    }

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,lat,lon`,
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    if (data.status !== 'success') return { country: null, city: null, lat: null, lon: null };
    return { country: data.country, city: data.city, lat: data.lat, lon: data.lon };
  } catch {
    return { country: null, city: null, lat: null, lon: null };
  }
}

// ── Routes ──────────────────────────────────────────────────────────────────

/** Health check */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/** List all trainers */
app.get('/api/trainers', async (_req, res) => {
  const { data, error } = await supabase
    .from('trainers')
    .select('id, username, trainer_code, team, country, city, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** Register a new trainer */
app.post('/api/trainers', registerLimiter, async (req, res) => {
  const { username, trainer_code, team, turnstile_token } = req.body;

  // ── Input validation ───────────────────────────────────────────────────
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'username must be at least 3 characters' });
  }
  if (!trainer_code || !/^\d{12}$/.test(String(trainer_code).replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'trainer_code must be exactly 12 digits' });
  }
  if (!['mystic', 'valor', 'instinct'].includes(team)) {
    return res.status(400).json({ error: 'team must be mystic, valor or instinct' });
  }
  if (!turnstile_token) {
    return res.status(400).json({ error: 'turnstile_token is required' });
  }

  // ── Turnstile verification ─────────────────────────────────────────────
  const clientIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress;

  try {
    const valid = await verifyTurnstile(turnstile_token, clientIp);
    if (!valid) return res.status(403).json({ error: 'Turnstile verification failed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // ── Geolocation ────────────────────────────────────────────────────────
  const location = await resolveLocation(clientIp);

  // ── Persist ────────────────────────────────────────────────────────────
  const cleanCode = String(trainer_code).replace(/\s/g, '');

  const { data, error } = await supabase
    .from('trainers')
    .insert({
      username: username.trim(),
      trainer_code: cleanCode,
      team,
      ip_address: clientIp,
      country: location.country,
      city: location.city,
      lat: location.lat,
      lon: location.lon,
    })
    .select('id, username, trainer_code, team, country, city, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'username or trainer_code already registered' });
    }
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// ── Start ────────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

export default app;

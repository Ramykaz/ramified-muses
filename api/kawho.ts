import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../src/db/index.js'

// Kawho: live quiz games (/kawho). Players join with a 6-digit PIN and poll
// GET ?action=state, which the CDN caches for a second, so 50 phones cost about
// one database read per second. Answers are scored here from the server clock.
// Hosts sign in with their own username and password (kw_users / kw_sessions).
// The first account is the owner: it can add or remove other hosts. Each host
// only sees their own quizzes and games.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
const GET_READY_MS = 4000
const GRACE_MS = 800
const MAX_PLAYERS = 200
// must match the lists in public/kawho/kawho-core.js: 20 drawn people (p), 60 emoji (e), 24 old critters (a)
const NEW_AVATARS = [...Array.from({ length: 20 }, (_, i) => 'p' + i), ...Array.from({ length: 60 }, (_, i) => 'e' + i)]
const AVATARS = [...NEW_AVATARS, ...Array.from({ length: 24 }, (_, i) => 'a' + i)]

let schemaReady: Promise<unknown> | null = null
function ensureSchema() {
  schemaReady ??= db
    .execute(sql`CREATE TABLE IF NOT EXISTS kw_quizzes (id text PRIMARY KEY, data jsonb NOT NULL, created_at bigint NOT NULL, updated_at bigint NOT NULL)`)
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS kw_games (pin text PRIMARY KEY, quiz_id text, quiz jsonb NOT NULL, state jsonb NOT NULL, created_at bigint NOT NULL)`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS kw_players (pin text NOT NULL, id text NOT NULL, secret text NOT NULL, name text NOT NULL, avatar text NOT NULL, score int NOT NULL DEFAULT 0, streak int NOT NULL DEFAULT 0, react text, react_at bigint, joined_at bigint NOT NULL, PRIMARY KEY (pin, id))`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS kw_answers (pin text NOT NULL, player_id text NOT NULL, q int NOT NULL, answer jsonb, correct boolean, points int NOT NULL DEFAULT 0, ms int NOT NULL, at bigint NOT NULL, PRIMARY KEY (pin, player_id, q))`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS kw_users (username text PRIMARY KEY, pw text NOT NULL, owner boolean NOT NULL DEFAULT false, created_at bigint NOT NULL)`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS kw_sessions (token text PRIMARY KEY, username text NOT NULL, created_at bigint NOT NULL)`))
    .then(() => db.execute(sql`ALTER TABLE kw_quizzes ADD COLUMN IF NOT EXISTS owner text`))
    .then(() => db.execute(sql`ALTER TABLE kw_games ADD COLUMN IF NOT EXISTS owner text`))
    .catch(err => { schemaReady = null; throw err })
  return schemaReady
}

type Opt = { t?: string; img?: string; ok?: boolean }
type Q = { id?: string; type: string; q: string; image?: string; time?: number; points?: number; options?: Opt[]; answers?: string[]; min?: number; max?: number; step?: number; correct?: number; tol?: number; unit?: string; items?: string[] }
type Quiz = { title?: string; description?: string; cover?: string; questions: Q[] }
type State = { phase: 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'podium'; q: number; startAt?: number; endAt?: number; v: number; locked?: boolean; theme?: 'day' | 'night'; order?: number[]; orders?: Record<string, number[]>; stats?: unknown; top?: unknown[]; ranks?: Record<string, number> }
type Row = Record<string, unknown>

const newId = (n = 10) => [...randomBytes(n)].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')
const fold = (s: unknown) => String(s ?? '').replace(/[İIı]/g, 'i').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const SCORED = new Set(['quiz', 'tf', 'multi', 'type', 'slider', 'order'])

const SESSION_MS = 180 * 864e5
const hashPassword = (pw: string) => { const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(pw, salt, 32).toString('hex') }
const checkPassword = (pw: string, stored: string) => {
  const [salt, hash] = String(stored ?? '').split(':'); if (!salt || !hash) return false
  const a = scryptSync(pw, salt, 32), b = Buffer.from(hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
const bearer = (req: VercelRequest) => String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
const cleanUser = (u: unknown) => String(u ?? '').trim().toLowerCase()
const USER_RE = /^[a-z0-9._-]{3,20}$/
const userError = 'Username: 3 to 20 letters or numbers (no spaces).'
async function newSession(username: string) {
  const token = randomBytes(24).toString('hex')
  await db.execute(sql`INSERT INTO kw_sessions (token, username, created_at) VALUES (${token}, ${username}, ${Date.now()})`)
  return token
}
type Me = { username: string; owner: boolean }
async function whoAmI(req: VercelRequest): Promise<Me | null> {
  const token = bearer(req)
  if (!/^[a-f0-9]{48}$/.test(token)) return null
  const r = (await db.execute(sql`SELECT u.username, u.owner FROM kw_sessions s JOIN kw_users u ON u.username = s.username WHERE s.token = ${token} AND s.created_at > ${Date.now() - SESSION_MS}`)).rows[0] as Row | undefined
  return r ? { username: String(r.username), owner: Boolean(r.owner) } : null
}
// the old studio sign-in (before accounts), so only the site owner can make the first account
async function oldStudioOk(body: Row) {
  try {
    const pw = (await db.execute(sql`SELECT v FROM forms_admin WHERE k = 'password'`)).rows[0] as Row | undefined
    if (!pw) return true
    const t = String(body.oldToken ?? '')
    if (/^[a-f0-9]{48}$/.test(t) && (await db.execute(sql`SELECT 1 FROM forms_sessions WHERE token = ${t} AND created_at > ${Date.now() - SESSION_MS}`)).rows.length) return true
    return typeof body.oldPassword === 'string' && checkPassword(body.oldPassword, String(pw.v))
  } catch { return true } // no old studio tables: a fresh site
}
async function loadGame(pin: string) {
  const r = (await db.execute(sql`SELECT pin, quiz_id, quiz, state, owner FROM kw_games WHERE pin = ${pin}`)).rows[0] as Row | undefined
  return r ? { pin, quizId: String(r.quiz_id ?? ''), quiz: r.quiz as Quiz, state: r.state as State, owner: r.owner == null ? null : String(r.owner) } : null
}
const saveState = (pin: string, st: State) => db.execute(sql`UPDATE kw_games SET state = ${JSON.stringify(st)}::jsonb WHERE pin = ${pin}`)

// the question as players may see it: no correct answers
function publicQuestion(q: Q, st: State) {
  const out: Row = { type: q.type, q: q.q, image: q.image ?? null, time: q.time ?? 20, points: q.points ?? 1 }
  if (q.options) out.options = q.options.map(o => ({ t: o.t ?? '', img: o.img ?? null }))
  if (q.type === 'order') out.items = (st.order ?? []).map(i => q.items?.[i] ?? '')
  if (q.type === 'slider') Object.assign(out, { min: q.min ?? 0, max: q.max ?? 100, step: q.step ?? 1, unit: q.unit ?? '' })
  if (q.type === 'type') out.maxLen = 40
  return out
}
function revealInfo(q: Q) {
  const out: Row = {}
  if (q.options) out.correct = q.options.map((o, i) => (o.ok ? i : -1)).filter(i => i >= 0)
  if (q.type === 'type') out.answers = q.answers ?? []
  if (q.type === 'slider') Object.assign(out, { value: q.correct ?? 0, tol: q.tol ?? 0 })
  if (q.type === 'order') out.items = q.items ?? []
  return out
}
// is this answer right? (null for polls and word clouds)
function check(q: Q, a: unknown, st: State): boolean | null {
  switch (q.type) {
    case 'quiz': case 'tf': return typeof a === 'number' && !!q.options?.[a]?.ok
    case 'multi': {
      if (!Array.isArray(a)) return false
      const want = (q.options ?? []).map((o, i) => (o.ok ? i : -1)).filter(i => i >= 0).sort().join(',')
      return [...new Set(a.map(Number))].sort().join(',') === want
    }
    case 'type': return (q.answers ?? []).some(x => fold(x) === fold(a)) && fold(a) !== ''
    case 'slider': return typeof a === 'number' && Math.abs(a - (q.correct ?? 0)) <= (q.tol ?? 0) + 1e-9
    case 'order': {
      // a = positions in the shuffled list; map back to the original items
      if (!Array.isArray(a) || !st.order) return false
      const picked = a.map(i => st.order![Number(i)])
      return picked.length === (q.items ?? []).length && picked.every((v, i) => v === i)
    }
    default: return null
  }
}
function stats(q: Q, answers: Row[]) {
  const n = answers.length, right = answers.filter(a => a.correct === true).length
  const s: Row = { answered: n, right }
  if (q.options) {
    const counts = q.options.map(() => 0)
    for (const a of answers) for (const i of ([] as unknown[]).concat(a.answer)) if (typeof i === 'number' && counts[i] !== undefined) counts[i]++
    s.counts = counts
  }
  if (q.type === 'type' || q.type === 'cloud') {
    const m = new Map<string, { text: string; n: number }>()
    for (const a of answers) {
      const words = q.type === 'cloud' ? [String(a.answer ?? '')] : [String(a.answer ?? '')]
      for (const w of words) { const k = fold(w); if (!k) continue; const e = m.get(k) ?? { text: w.trim().slice(0, 40), n: 0 }; e.n++; m.set(k, e) }
    }
    s.words = [...m.values()].sort((x, y) => y.n - x.n).slice(0, 40)
  }
  if (q.type === 'slider') s.values = answers.map(a => Number(a.answer)).filter(Number.isFinite)
  return s
}
async function top(pin: string, limit: number) {
  const r = await db.execute(sql`SELECT id, name, avatar, score, streak FROM kw_players WHERE pin = ${pin} ORDER BY score DESC, joined_at ASC LIMIT ${limit}`)
  return r.rows as Row[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()
  const action = String(req.query.action ?? '')
  const body = (req.body ?? {}) as Row
  const now = Date.now()
  const pinOf = (v: unknown) => String(v ?? '').replace(/\D/g, '').slice(0, 6)
  if (action !== 'state') res.setHeader('Cache-Control', 'no-store')

  try {
    await ensureSchema()

    // ---------------- players ----------------
    if (action === 'state' && req.method === 'GET') {
      const g = await loadGame(pinOf(req.query.pin))
      res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=1')
      if (!g) return res.status(404).json({ error: 'No game with that PIN.' })
      const st = g.state, qs = g.quiz.questions, q = qs[st.q]
      const cnt = Number(((await db.execute(sql`SELECT count(*) AS n FROM kw_players WHERE pin = ${g.pin}`)).rows[0] as Row).n)
      const out: Row = { pin: g.pin, title: g.quiz.title ?? 'Quiz', cover: g.quiz.cover ?? null, phase: st.phase, q: st.q, total: qs.length, v: st.v, players: cnt, locked: !!st.locked, theme: st.theme ?? null, serverNow: now }
      if (q && st.phase !== 'lobby') { out.question = publicQuestion(q, st); out.startAt = st.startAt; out.endAt = st.endAt }
      if (q && (st.phase === 'reveal')) { out.reveal = revealInfo(q); out.stats = st.stats }
      if (st.phase === 'leaderboard' || st.phase === 'podium') out.top = (st.top ?? []).slice(0, 5)
      return res.status(200).json(out)
    }
    if (action === 'join' && req.method === 'POST') {
      const pin = pinOf(body.pin)
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'No game with that PIN. Check the number on the screen.' })
      if (g.state.locked) return res.status(423).json({ error: 'This game is locked. Ask the host to unlock it.' })
      if (g.state.phase === 'podium') return res.status(409).json({ error: 'This game has finished.' })
      const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 20)
      if (name.length < 2) return res.status(400).json({ error: 'Write a name with at least 2 letters.' })
      const avatar = AVATARS.includes(String(body.avatar)) ? String(body.avatar) : NEW_AVATARS[randomInt(NEW_AVATARS.length)]
      const players = (await db.execute(sql`SELECT name FROM kw_players WHERE pin = ${pin}`)).rows as Row[]
      if (players.length >= MAX_PLAYERS) return res.status(409).json({ error: 'This game is full.' })
      if (players.some(p => fold(p.name) === fold(name))) return res.status(409).json({ error: 'Someone already has that name. Try another one.' })
      const id = newId(8), secret = newId(16)
      await db.execute(sql`INSERT INTO kw_players (pin, id, secret, name, avatar, joined_at) VALUES (${pin}, ${id}, ${secret}, ${name}, ${avatar}, ${now})`)
      return res.status(200).json({ pid: id, secret, name, avatar, serverNow: now })
    }
    const player = async () => {
      const r = (await db.execute(sql`SELECT id, name, avatar, score, streak FROM kw_players WHERE pin = ${pinOf(body.pin ?? req.query.pin)} AND id = ${String(body.pid ?? req.query.pid ?? '')} AND secret = ${String(body.secret ?? req.query.secret ?? '')}`)).rows[0] as Row | undefined
      return r ?? null
    }
    if (action === 'answer' && req.method === 'POST') {
      const pin = pinOf(body.pin), p = await player()
      if (!p) return res.status(404).json({ error: 'You are not in this game any more.' })
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'The game has ended.' })
      const st = g.state, qi = Number(body.q), q = g.quiz.questions[qi]
      if (st.phase !== 'question' || qi !== st.q || !q) return res.status(409).json({ error: 'Too late for this question.' })
      if (now < (st.startAt ?? 0) - 300) return res.status(409).json({ error: 'Wait for the question to start.' })
      if (now > (st.endAt ?? 0) + GRACE_MS) return res.status(409).json({ error: "Time's up!" })
      let a: unknown = body.answer
      if (q.type === 'type' || q.type === 'cloud') a = String(a ?? '').slice(0, 40)
      if (q.type === 'slider' || q.type === 'quiz' || q.type === 'tf' || q.type === 'poll') a = Number(a)
      if (q.type === 'multi' || q.type === 'order') a = Array.isArray(a) ? a.slice(0, 12).map(Number) : []
      const ok = check(q, a, st)
      const limit = Math.max(1000, (st.endAt ?? 0) - (st.startAt ?? 0))
      const ms = Math.max(0, Math.min(limit, now - (st.startAt ?? now)))
      const base = SCORED.has(q.type) ? 1000 * (q.points ?? 1) : 0
      let points = 0, streak = Number(p.streak)
      if (base && ok) {
        streak += 1
        points = Math.round(base * (1 - (ms / limit) / 2)) + Math.min(streak - 1, 5) * 100
      } else if (base) streak = 0
      const ins = await db.execute(sql`INSERT INTO kw_answers (pin, player_id, q, answer, correct, points, ms, at) VALUES (${pin}, ${String(p.id)}, ${qi}, ${JSON.stringify(a)}::jsonb, ${ok}, ${points}, ${ms}, ${now}) ON CONFLICT DO NOTHING RETURNING q`)
      if (!ins.rows.length) return res.status(409).json({ error: 'You already answered.' })
      if (base) await db.execute(sql`UPDATE kw_players SET score = score + ${points}, streak = ${streak} WHERE pin = ${pin} AND id = ${String(p.id)}`)
      return res.status(200).json({ ok: true, serverNow: now })
    }
    if (action === 'me' && req.method === 'GET') {
      const p = await player()
      if (!p) return res.status(404).json({ error: 'You are not in this game any more.' })
      const pin = pinOf(req.query.pin), qi = Number(req.query.q ?? -1)
      const above = (await db.execute(sql`SELECT name, score FROM kw_players WHERE pin = ${pin} AND score > ${Number(p.score)} ORDER BY score ASC LIMIT 1`)).rows[0] as Row | undefined
      const rank = Number(((await db.execute(sql`SELECT count(*) AS n FROM kw_players WHERE pin = ${pin} AND score > ${Number(p.score)}`)).rows[0] as Row).n) + 1
      const total = Number(((await db.execute(sql`SELECT count(*) AS n FROM kw_players WHERE pin = ${pin}`)).rows[0] as Row).n)
      const last = qi >= 0 ? (await db.execute(sql`SELECT answer, correct, points FROM kw_answers WHERE pin = ${pin} AND player_id = ${String(p.id)} AND q = ${qi}`)).rows[0] as Row | undefined : undefined
      return res.status(200).json({ name: p.name, avatar: p.avatar, score: Number(p.score), streak: Number(p.streak), rank, total, above: above ? { name: above.name, gap: Number(above.score) - Number(p.score) } : null, last: last ?? null, serverNow: now })
    }
    if (action === 'react' && req.method === 'POST') {
      const p = await player()
      if (!p) return res.status(404).json({ error: 'Not in the game.' })
      const emoji = ['like', 'haha', 'wow', 'fire', 'love', 'clap'].includes(String(body.emoji)) ? String(body.emoji) : 'like'
      await db.execute(sql`UPDATE kw_players SET react = ${emoji}, react_at = ${now} WHERE pin = ${pinOf(body.pin)} AND id = ${String(p.id)}`)
      return res.status(200).json({ ok: true })
    }

    // ---------------- host accounts ----------------
    if (action === 'auth-status' && req.method === 'GET') {
      const any = (await db.execute(sql`SELECT 1 FROM kw_users LIMIT 1`)).rows.length > 0
      return res.status(200).json({ setup: any, me: any ? await whoAmI(req) : null })
    }
    if (action === 'setup' && req.method === 'POST') {
      if ((await db.execute(sql`SELECT 1 FROM kw_users LIMIT 1`)).rows.length) return res.status(409).json({ error: 'The first account is already made. Sign in instead.' })
      const username = cleanUser(body.username), pw = String(body.password ?? '')
      if (!USER_RE.test(username)) return res.status(400).json({ error: userError })
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters for the password.' })
      if (!(await oldStudioOk(body))) return res.status(403).json({ error: 'Type your old studio password once, so we know it is you.', needOld: true })
      const ins = await db.execute(sql`INSERT INTO kw_users (username, pw, owner, created_at) SELECT ${username}, ${hashPassword(pw)}, true, ${now} WHERE NOT EXISTS (SELECT 1 FROM kw_users) RETURNING username`)
      if (!ins.rows.length) return res.status(409).json({ error: 'The first account is already made. Sign in instead.' })
      // everything made before accounts belongs to the owner
      await db.execute(sql`UPDATE kw_quizzes SET owner = ${username} WHERE owner IS NULL`)
      await db.execute(sql`UPDATE kw_games SET owner = ${username} WHERE owner IS NULL`)
      return res.status(200).json({ token: await newSession(username), me: { username, owner: true } })
    }
    if (action === 'login' && req.method === 'POST') {
      const username = cleanUser(body.username), pw = String(body.password ?? '')
      const u = (await db.execute(sql`SELECT username, pw, owner FROM kw_users WHERE username = ${username}`)).rows[0] as Row | undefined
      if (!u || !checkPassword(pw, String(u.pw))) return res.status(401).json({ error: 'Wrong username or password.' })
      return res.status(200).json({ token: await newSession(username), me: { username, owner: Boolean(u.owner) } })
    }
    if (action === 'logout' && req.method === 'POST') {
      await db.execute(sql`DELETE FROM kw_sessions WHERE token = ${bearer(req)}`)
      return res.status(200).json({ ok: true })
    }

    // ---------------- host (signed in) ----------------
    const me = await whoAmI(req)
    if (!me) return res.status(401).json({ error: 'Please sign in.' })
    const mine = (g: { owner: string | null } | null) => g && g.owner === me.username ? g : null

    if (action === 'me' && req.method === 'GET') return res.status(200).json({ me })
    if (action === 'password' && req.method === 'POST') {
      const pw = String(body.password ?? '')
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters for the password.' })
      await db.execute(sql`UPDATE kw_users SET pw = ${hashPassword(pw)} WHERE username = ${me.username}`)
      await db.execute(sql`DELETE FROM kw_sessions WHERE username = ${me.username} AND token <> ${bearer(req)}`)
      return res.status(200).json({ ok: true })
    }
    if (action.startsWith('user') && !me.owner) return res.status(403).json({ error: 'Only the owner can manage hosts.' })
    if (action === 'users' && req.method === 'GET') {
      const r = (await db.execute(sql`SELECT u.username, u.owner, u.created_at, (SELECT count(*) FROM kw_quizzes q WHERE q.owner = u.username) AS quizzes FROM kw_users u ORDER BY u.owner DESC, u.created_at`)).rows as Row[]
      return res.status(200).json({ users: r.map(u => ({ username: u.username, owner: Boolean(u.owner), quizzes: Number(u.quizzes), createdAt: Number(u.created_at) })) })
    }
    if (action === 'user-add' && req.method === 'POST') {
      const username = cleanUser(body.username), pw = String(body.password ?? '')
      if (!USER_RE.test(username)) return res.status(400).json({ error: userError })
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters for the password.' })
      const count = Number(((await db.execute(sql`SELECT count(*) AS n FROM kw_users`)).rows[0] as Row).n)
      if (count >= 20) return res.status(409).json({ error: 'That is enough hosts (20).' })
      const ins = await db.execute(sql`INSERT INTO kw_users (username, pw, owner, created_at) VALUES (${username}, ${hashPassword(pw)}, false, ${now}) ON CONFLICT DO NOTHING RETURNING username`)
      if (!ins.rows.length) return res.status(409).json({ error: 'That username is taken.' })
      return res.status(200).json({ ok: true })
    }
    if (action === 'user-password' && req.method === 'POST') {
      const username = cleanUser(body.username), pw = String(body.password ?? '')
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters for the password.' })
      const up = await db.execute(sql`UPDATE kw_users SET pw = ${hashPassword(pw)} WHERE username = ${username} RETURNING username`)
      if (!up.rows.length) return res.status(404).json({ error: 'No host with that username.' })
      if (username !== me.username) await db.execute(sql`DELETE FROM kw_sessions WHERE username = ${username}`)
      return res.status(200).json({ ok: true })
    }
    if (action === 'user-delete' && req.method === 'POST') {
      const username = cleanUser(body.username)
      if (username === me.username) return res.status(400).json({ error: "You can't remove yourself." })
      const del = await db.execute(sql`DELETE FROM kw_users WHERE username = ${username} AND NOT owner RETURNING username`)
      if (!del.rows.length) return res.status(404).json({ error: 'No host with that username.' })
      await db.execute(sql`DELETE FROM kw_sessions WHERE username = ${username}`)
      // their quizzes move to you, so nothing is lost
      await db.execute(sql`UPDATE kw_quizzes SET owner = ${me.username} WHERE owner = ${username}`)
      await db.execute(sql`UPDATE kw_games SET owner = ${me.username} WHERE owner = ${username}`)
      return res.status(200).json({ ok: true })
    }

    if (action === 'quizzes' && req.method === 'GET') {
      const r = await db.execute(sql`SELECT id, data, created_at, updated_at FROM kw_quizzes WHERE owner = ${me.username} ORDER BY updated_at DESC`)
      return res.status(200).json({ quizzes: (r.rows as Row[]).map(x => ({ id: x.id, data: x.data, updatedAt: Number(x.updated_at) })) })
    }
    if (action === 'quiz-save' && req.method === 'POST') {
      const data = body.data as Quiz | undefined
      if (!data || !Array.isArray(data.questions) || !data.questions.length) return res.status(400).json({ error: 'Add at least one question.' })
      if (JSON.stringify(data).length > 400_000) return res.status(400).json({ error: 'This quiz is too big.' })
      let id = String(body.id ?? '')
      if (id) { const up = await db.execute(sql`UPDATE kw_quizzes SET data = ${JSON.stringify(data)}::jsonb, updated_at = ${now} WHERE id = ${id} AND owner = ${me.username} RETURNING id`); if (!up.rows.length) return res.status(404).json({ error: 'Quiz not found.' }) }
      else { id = newId(8); await db.execute(sql`INSERT INTO kw_quizzes (id, data, created_at, updated_at, owner) VALUES (${id}, ${JSON.stringify(data)}::jsonb, ${now}, ${now}, ${me.username})`) }
      return res.status(200).json({ id })
    }
    if (action === 'quiz-delete' && req.method === 'POST') {
      await db.execute(sql`DELETE FROM kw_quizzes WHERE id = ${String(body.id ?? '')} AND owner = ${me.username}`)
      return res.status(200).json({ ok: true })
    }
    if (action === 'game-create' && req.method === 'POST') {
      const qz = (await db.execute(sql`SELECT data FROM kw_quizzes WHERE id = ${String(body.quizId ?? '')} AND owner = ${me.username}`)).rows[0] as Row | undefined
      if (!qz) return res.status(404).json({ error: 'Quiz not found.' })
      // clear out games older than two days
      const old = now - 2 * 864e5
      await db.execute(sql`DELETE FROM kw_answers WHERE pin IN (SELECT pin FROM kw_games WHERE created_at < ${old})`)
      await db.execute(sql`DELETE FROM kw_players WHERE pin IN (SELECT pin FROM kw_games WHERE created_at < ${old})`)
      await db.execute(sql`DELETE FROM kw_games WHERE created_at < ${old}`)
      const st: State = { phase: 'lobby', q: -1, v: 1 }
      for (let k = 0; k < 20; k++) {
        const pin = String(randomInt(100000, 1000000))
        const ins = await db.execute(sql`INSERT INTO kw_games (pin, quiz_id, quiz, state, created_at, owner) VALUES (${pin}, ${String(body.quizId)}, ${JSON.stringify(qz.data)}::jsonb, ${JSON.stringify(st)}::jsonb, ${now}, ${me.username}) ON CONFLICT DO NOTHING RETURNING pin`)
        if (ins.rows.length) return res.status(200).json({ pin })
      }
      return res.status(503).json({ error: 'Could not make a PIN. Try again.' })
    }
    if (action === 'host-state' && req.method === 'GET') {
      const pin = pinOf(req.query.pin), g = mine(await loadGame(pin))
      if (!g) return res.status(404).json({ error: 'Game not found.' })
      const players = (await db.execute(sql`SELECT p.id, p.name, p.avatar, p.score, p.streak, p.react, p.react_at, (a.player_id IS NOT NULL) AS answered FROM kw_players p LEFT JOIN kw_answers a ON a.pin = p.pin AND a.player_id = p.id AND a.q = ${g.state.q} WHERE p.pin = ${pin} ORDER BY p.joined_at`)).rows as Row[]
      return res.status(200).json({ pin, quizId: g.quizId, quiz: g.quiz, state: g.state, players: players.map(p => ({ ...p, score: Number(p.score), react_at: p.react_at == null ? null : Number(p.react_at) })), serverNow: now })
    }
    if (action === 'host' && req.method === 'POST') {
      const pin = pinOf(body.pin), g = mine(await loadGame(pin))
      if (!g) return res.status(404).json({ error: 'Game not found.' })
      const st = g.state, qs = g.quiz.questions, what = String(body.do ?? '')
      if (what === 'next') {
        // ranks before this question, for the arrows on the next leaderboard
        st.ranks = Object.fromEntries((await top(pin, 1000)).map((p, i) => [String(p.id), i + 1]))
        const nq = st.q + 1
        if (nq >= qs.length) {
          st.phase = 'podium'; st.top = (await top(pin, 10)).map(p => ({ name: p.name, avatar: p.avatar, score: Number(p.score) }))
        } else {
          const q = qs[nq]
          st.phase = 'question'; st.q = nq; st.stats = undefined
          st.startAt = now + GET_READY_MS; st.endAt = st.startAt + (q.time ?? 20) * 1000
          st.order = q.type === 'order' ? (() => { const o = (q.items ?? []).map((_, i) => i); for (let i = o.length - 1; i > 0; i--) { const j = randomInt(i + 1); [o[i], o[j]] = [o[j], o[i]] } if (o.every((v, i) => v === i) && o.length > 1) [o[0], o[1]] = [o[1], o[0]]; return o })() : undefined
          if (st.order) st.orders = { ...(st.orders ?? {}), [nq]: st.order }
        }
      } else if (what === 'reveal') {
        if (st.phase !== 'question') return res.status(200).json({ state: st })
        const q = qs[st.q]
        const answers = (await db.execute(sql`SELECT answer, correct FROM kw_answers WHERE pin = ${pin} AND q = ${st.q}`)).rows as Row[]
        st.phase = 'reveal'; st.endAt = Math.min(st.endAt ?? now, now); st.stats = stats(q, answers)
        // no right answer this time: the streak is broken
        if (SCORED.has(q.type)) await db.execute(sql`UPDATE kw_players SET streak = 0 WHERE pin = ${pin} AND id NOT IN (SELECT player_id FROM kw_answers WHERE pin = ${pin} AND q = ${st.q} AND correct)`)
      } else if (what === 'leaderboard') {
        const prev = st.ranks ?? {}
        const t = await top(pin, 1000)
        st.top = t.slice(0, 5).map((p, i) => ({ name: p.name, avatar: p.avatar, score: Number(p.score), streak: Number(p.streak), move: prev[String(p.id)] ? prev[String(p.id)] - (i + 1) : 0 }))
        st.phase = 'leaderboard'
      } else if (what === 'end') {
        st.phase = 'podium'; st.top = (await top(pin, 10)).map(p => ({ name: p.name, avatar: p.avatar, score: Number(p.score) }))
      } else if (what === 'theme') {
        st.theme = body.theme === 'night' ? 'night' : 'day'
      } else if (what === 'lock' || what === 'unlock') {
        st.locked = what === 'lock'
      } else if (what === 'kick') {
        await db.execute(sql`DELETE FROM kw_answers WHERE pin = ${pin} AND player_id = ${String(body.pid ?? '')}`)
        await db.execute(sql`DELETE FROM kw_players WHERE pin = ${pin} AND id = ${String(body.pid ?? '')}`)
      } else return res.status(400).json({ error: 'Unknown command.' })
      st.v = (st.v ?? 0) + 1
      await saveState(pin, st)
      return res.status(200).json({ state: st, serverNow: now })
    }
    if (action === 'results' && req.method === 'GET') {
      const pin = pinOf(req.query.pin), g = mine(await loadGame(pin))
      if (!g) return res.status(404).json({ error: 'Game not found.' })
      const players = (await db.execute(sql`SELECT id, name, avatar, score FROM kw_players WHERE pin = ${pin} ORDER BY score DESC, joined_at ASC`)).rows as Row[]
      const answers = (await db.execute(sql`SELECT player_id, q, answer, correct, points, ms FROM kw_answers WHERE pin = ${pin}`)).rows as Row[]
      return res.status(200).json({ quiz: g.quiz, orders: g.state.orders ?? {}, players: players.map(p => ({ ...p, score: Number(p.score) })), answers })
    }
    return res.status(404).json({ error: 'Unknown action.' })
  } catch (err) {
    console.error('/api/kawho failed:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

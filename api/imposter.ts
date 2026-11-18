import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes, randomInt } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../src/db/index.js'
import { CATS, PAIRS } from './_imposter-words.js'

// Imposter (/imposter). The host makes a game and gets a PIN; players join on
// their phones. Each round most players get the same word and the imposter gets
// a similar, different one. Nobody is told who the imposter is until the host
// reveals it. Phones poll GET ?action=state (cached for a second by the CDN,
// so a full class costs about one database read per second) and only ask for
// their own word (?action=me) when a new round starts.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
const MAX_PLAYERS = 60

let schemaReady: Promise<unknown> | null = null
function ensureSchema() {
  schemaReady ??= db
    .execute(sql`CREATE TABLE IF NOT EXISTS imp_games (pin text PRIMARY KEY, host text NOT NULL, state jsonb NOT NULL, created_at bigint NOT NULL)`)
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS imp_players (pin text NOT NULL, id text NOT NULL, secret text NOT NULL, name text NOT NULL, joined_at bigint NOT NULL, PRIMARY KEY (pin, id))`))
    .catch(err => { schemaReady = null; throw err })
  return schemaReady
}

type State = {
  v: number; round: number; revealed: boolean
  pair?: number; flip?: boolean; imposters?: string[]; first?: string
  cats?: string[]; imps?: number; used?: number[]
}
type Row = Record<string, unknown>
const newId = (n: number) => [...randomBytes(n)].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')
const fold = (s: unknown) => String(s ?? '').toLocaleLowerCase('tr').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
const words = (st: State) => {
  const p = PAIRS[st.pair ?? -1]
  if (!p) return null
  return st.flip ? { cat: CATS[p[0]], main: p[2], odd: p[1] } : { cat: CATS[p[0]], main: p[1], odd: p[2] }
}

async function loadGame(pin: string) {
  const r = (await db.execute(sql`SELECT pin, host, state FROM imp_games WHERE pin = ${pin}`)).rows[0] as Row | undefined
  return r ? { pin, host: String(r.host), state: r.state as State } : null
}
const players = async (pin: string) =>
  (await db.execute(sql`SELECT id, name FROM imp_players WHERE pin = ${pin} ORDER BY joined_at`)).rows as { id: string; name: string }[]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()
  const action = String(req.query.action ?? '')
  const body = (req.body ?? {}) as Row
  const q = { ...req.query, ...body } as Row
  const pin = String(q.pin ?? '').replace(/\D/g, '').slice(0, 6)
  const now = Date.now()
  if (action !== 'state') res.setHeader('Cache-Control', 'no-store')

  try {
    await ensureSchema()

    if (action === 'cats') return res.status(200).json({ cats: Object.entries(CATS).map(([id, name]) => ({ id, name, n: PAIRS.filter(p => p[0] === id).length })) })

    // ---------- players
    if (action === 'state' && req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=1')
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'No game with that PIN.' })
      const st = g.state, w = words(st)
      const out: Row = { pin, v: st.v, round: st.round, revealed: st.revealed, cat: st.round ? w?.cat ?? null : null }
      if (st.round) out.first = st.first ?? null
      if (st.revealed && w) {
        const ps = await players(pin)
        out.reveal = { main: w.main, odd: w.odd, imposters: ps.filter(p => st.imposters?.includes(p.id)).map(p => p.name) }
      }
      return res.status(200).json(out)
    }
    if (action === 'join' && req.method === 'POST') {
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'No game with that PIN. Check the number on the screen.' })
      const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 20)
      if (name.length < 2) return res.status(400).json({ error: 'Write a name with at least 2 letters.' })
      const ps = await players(pin)
      if (ps.length >= MAX_PLAYERS) return res.status(409).json({ error: 'This game is full.' })
      if (ps.some(p => fold(p.name) === fold(name))) return res.status(409).json({ error: 'Someone already has that name. Try another one.' })
      const id = newId(8), secret = newId(16)
      await db.execute(sql`INSERT INTO imp_players (pin, id, secret, name, joined_at) VALUES (${pin}, ${id}, ${secret}, ${name}, ${now})`)
      return res.status(200).json({ pid: id, secret, name })
    }
    if (action === 'me' && req.method === 'GET') {
      const p = (await db.execute(sql`SELECT id, name FROM imp_players WHERE pin = ${pin} AND id = ${String(q.pid ?? '')} AND secret = ${String(q.secret ?? '')}`)).rows[0] as Row | undefined
      if (!p) return res.status(404).json({ error: 'You are not in this game any more.' })
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'The game has ended.' })
      const st = g.state, w = words(st)
      // nobody is told they are the imposter: they just get a different word
      const inRound = !!w && st.round > 0 && (st as State & { dealt?: string[] }).dealt?.includes(String(p.id))
      return res.status(200).json({ name: p.name, round: st.round, cat: w?.cat ?? null, word: inRound ? (st.imposters?.includes(String(p.id)) ? w!.odd : w!.main) : null })
    }

    // ---------- host
    if (action === 'create' && req.method === 'POST') {
      const old = now - 2 * 864e5
      await db.execute(sql`DELETE FROM imp_players WHERE pin IN (SELECT pin FROM imp_games WHERE created_at < ${old})`)
      await db.execute(sql`DELETE FROM imp_games WHERE created_at < ${old}`)
      const host = newId(16), st: State = { v: 1, round: 0, revealed: false, used: [] }
      for (let k = 0; k < 20; k++) {
        const p = String(randomInt(100000, 1000000))
        const ins = await db.execute(sql`INSERT INTO imp_games (pin, host, state, created_at) VALUES (${p}, ${host}, ${JSON.stringify(st)}::jsonb, ${now}) ON CONFLICT DO NOTHING RETURNING pin`)
        if (ins.rows.length) return res.status(200).json({ pin: p, host })
      }
      return res.status(503).json({ error: 'Could not make a PIN. Try again.' })
    }
    const g = await loadGame(pin)
    if (!g || g.host !== String(q.host ?? '')) return res.status(404).json({ error: 'Game not found.' })
    const st = g.state as State & { dealt?: string[] }

    if (action === 'host-state' && req.method === 'GET') {
      const ps = await players(pin), w = words(st)
      return res.status(200).json({
        pin, state: { v: st.v, round: st.round, revealed: st.revealed, cats: st.cats ?? [], imps: st.imps ?? 1, first: st.first ?? null },
        cat: st.round ? w?.cat ?? null : null,
        // the words and the imposter stay hidden on the big screen until the reveal
        reveal: st.revealed && w ? { main: w.main, odd: w.odd, imposters: ps.filter(p => st.imposters?.includes(p.id)).map(p => p.name) } : null,
        players: ps.map(p => ({ id: p.id, name: p.name, inRound: !!st.dealt?.includes(p.id) })),
      })
    }
    if (action === 'next' && req.method === 'POST') {
      const ps = await players(pin)
      if (ps.length < 3) return res.status(409).json({ error: 'You need at least 3 players.' })
      const cats = Array.isArray(body.cats) ? (body.cats as unknown[]).map(String).filter(c => c in CATS) : []
      const imps = Math.max(1, Math.min(Number(body.imps) || 1, Math.floor((ps.length - 1) / 2)))
      let pool = PAIRS.map((p, i) => i).filter(i => !cats.length || cats.includes(PAIRS[i][0]))
      let used = (st.used ?? []).filter(i => pool.includes(i))
      if (used.length >= pool.length) used = []
      pool = pool.filter(i => !used.includes(i))
      const pair = pool[randomInt(pool.length)]
      const ids = ps.map(p => p.id)
      for (let i = ids.length - 1; i > 0; i--) { const j = randomInt(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]] }
      const next: State & { dealt?: string[] } = {
        v: (st.v ?? 0) + 1, round: (st.round ?? 0) + 1, revealed: false,
        pair, flip: randomInt(2) === 1, imposters: ids.slice(0, imps),
        first: ps[randomInt(ps.length)].name, cats, imps, used: [...used, pair], dealt: ps.map(p => p.id),
      }
      await db.execute(sql`UPDATE imp_games SET state = ${JSON.stringify(next)}::jsonb WHERE pin = ${pin}`)
      return res.status(200).json({ ok: true, round: next.round })
    }
    if (action === 'reveal' && req.method === 'POST') {
      if (!st.round) return res.status(409).json({ error: 'Start a round first.' })
      const next = { ...st, revealed: true, v: (st.v ?? 0) + 1 }
      await db.execute(sql`UPDATE imp_games SET state = ${JSON.stringify(next)}::jsonb WHERE pin = ${pin}`)
      return res.status(200).json({ ok: true })
    }
    if (action === 'kick' && req.method === 'POST') {
      await db.execute(sql`DELETE FROM imp_players WHERE pin = ${pin} AND id = ${String(body.pid ?? '')}`)
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: 'Unknown action.' })
  } catch (err) {
    console.error('/api/imposter failed:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

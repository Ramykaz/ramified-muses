import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes, randomInt } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../src/db/index.js'
import { CATS, PAIRS } from './_imposter-words.js'

// Imposter (/imposter). The host makes a game and gets a PIN; players join on
// their phones. Each round everyone gets the same word except the imposter.
// mode "topic" (default): the imposter is told they are the imposter and only
// sees the topic. mode "word": the imposter gets a similar word and isn't told.
// Nothing about the words or the imposter reaches the host screen until the
// host presses Reveal. Phones poll GET ?action=state (cached for a second by the
// CDN) and only ask for their own card (?action=me) when a new round starts.
// Word packs the host makes (pasted from an AI) are kept in imp_packs, shared
// by every device, like the Class Games library.

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
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS imp_packs (id text PRIMARY KEY, title text NOT NULL, pairs jsonb NOT NULL, updated_at bigint NOT NULL)`))
    .catch(err => { schemaReady = null; throw err })
  return schemaReady
}

type Card = { cat: string; main: string; odd: string | null }
type State = {
  v: number; round: number; revealed: boolean
  cur?: Card; mode?: 'topic' | 'word'; imposters?: string[]; dealt?: string[]; first?: string
  used?: Record<string, number[]>
}
type Row = Record<string, unknown>
type Pair = [string, string, string | null]
const newId = (n: number) => [...randomBytes(n)].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')
const fold = (s: unknown) => String(s ?? '').toLocaleLowerCase('tr').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
const clean = (s: unknown, n = 60) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

async function loadGame(pin: string) {
  const r = (await db.execute(sql`SELECT pin, host, state FROM imp_games WHERE pin = ${pin}`)).rows[0] as Row | undefined
  return r ? { pin, host: String(r.host), state: r.state as State } : null
}
const players = async (pin: string) =>
  (await db.execute(sql`SELECT id, name FROM imp_players WHERE pin = ${pin} ORDER BY joined_at`)).rows as { id: string; name: string }[]
const revealOf = (st: State, ps: { id: string; name: string }[]) =>
  st.revealed && st.cur ? { main: st.cur.main, odd: st.mode === 'word' ? st.cur.odd : null, imposters: ps.filter(p => st.imposters?.includes(p.id)).map(p => p.name) } : null

// a pack from the host: [[topic, word, similar word?], …]
function cleanPairs(raw: unknown): Pair[] {
  if (!Array.isArray(raw)) return []
  const out: Pair[] = []
  for (const x of raw.slice(0, 400)) {
    if (!Array.isArray(x)) continue
    const cat = clean(x[0], 40), a = clean(x[1]), b = clean(x[2])
    if (cat && a) out.push([cat, a, b && fold(b) !== fold(a) ? b : null])
  }
  return out
}

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

    // ---------- word packs (shared by every device)
    if (action === 'packs' && req.method === 'GET') {
      const r = (await db.execute(sql`SELECT id, title, pairs, updated_at FROM imp_packs ORDER BY updated_at DESC`)).rows as Row[]
      return res.status(200).json({ packs: r.map(x => ({ id: x.id, title: x.title, pairs: x.pairs, updatedAt: Number(x.updated_at) })) })
    }
    if (action === 'pack-save' && req.method === 'POST') {
      const title = clean(body.title, 60) || 'My words'
      const pairs = cleanPairs(body.pairs)
      if (pairs.length < 3) return res.status(400).json({ error: 'Add at least 3 words.' })
      const count = Number(((await db.execute(sql`SELECT count(*) AS n FROM imp_packs`)).rows[0] as Row).n)
      let id = String(body.id ?? '')
      if (id) await db.execute(sql`UPDATE imp_packs SET title = ${title}, pairs = ${JSON.stringify(pairs)}::jsonb, updated_at = ${now} WHERE id = ${id}`)
      else {
        if (count >= 100) return res.status(409).json({ error: 'That is a lot of packs (100). Delete some first.' })
        id = newId(8)
        await db.execute(sql`INSERT INTO imp_packs (id, title, pairs, updated_at) VALUES (${id}, ${title}, ${JSON.stringify(pairs)}::jsonb, ${now})`)
      }
      return res.status(200).json({ id, title, n: pairs.length })
    }
    if (action === 'pack-delete' && req.method === 'POST') {
      await db.execute(sql`DELETE FROM imp_packs WHERE id = ${String(body.id ?? '')}`)
      return res.status(200).json({ ok: true })
    }

    // ---------- players
    if (action === 'state' && req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=1')
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'No game with that PIN.' })
      const st = g.state
      const out: Row = { pin, v: st.v, round: st.round, revealed: st.revealed, cat: st.round ? st.cur?.cat ?? null : null, first: st.round ? st.first ?? null : null }
      if (st.revealed) out.reveal = revealOf(st, await players(pin))
      return res.status(200).json(out)
    }
    if (action === 'join' && req.method === 'POST') {
      const g = await loadGame(pin)
      if (!g) return res.status(404).json({ error: 'No game with that PIN. Check the number on the screen.' })
      const name = clean(body.name, 20)
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
      const st = g.state, c = st.cur, id = String(p.id)
      const base = { name: p.name, round: st.round, cat: c?.cat ?? null }
      if (!c || !st.round || !st.dealt?.includes(id)) return res.status(200).json({ ...base, word: null, imposter: false, waiting: true })
      const imp = !!st.imposters?.includes(id)
      // topic mode: the imposter only knows the topic. word mode: a different word, and no label.
      if (st.mode === 'word') return res.status(200).json({ ...base, word: imp ? c.odd : c.main, imposter: false })
      return res.status(200).json({ ...base, word: imp ? null : c.main, imposter: imp })
    }

    // ---------- host
    if (action === 'create' && req.method === 'POST') {
      const old = now - 2 * 864e5
      await db.execute(sql`DELETE FROM imp_players WHERE pin IN (SELECT pin FROM imp_games WHERE created_at < ${old})`)
      await db.execute(sql`DELETE FROM imp_games WHERE created_at < ${old}`)
      const host = newId(16), st: State = { v: 1, round: 0, revealed: false, used: {} }
      for (let k = 0; k < 20; k++) {
        const p = String(randomInt(100000, 1000000))
        const ins = await db.execute(sql`INSERT INTO imp_games (pin, host, state, created_at) VALUES (${p}, ${host}, ${JSON.stringify(st)}::jsonb, ${now}) ON CONFLICT DO NOTHING RETURNING pin`)
        if (ins.rows.length) return res.status(200).json({ pin: p, host })
      }
      return res.status(503).json({ error: 'Could not make a PIN. Try again.' })
    }
    const g = await loadGame(pin)
    if (!g || g.host !== String(q.host ?? '')) return res.status(404).json({ error: 'Game not found.' })
    const st = g.state

    if (action === 'host-state' && req.method === 'GET') {
      const ps = await players(pin)
      // the big screen gets no words and no imposter until the reveal
      return res.status(200).json({
        pin, state: { v: st.v, round: st.round, revealed: st.revealed, first: st.round ? st.first ?? null : null },
        cat: st.round ? st.cur?.cat ?? null : null,
        reveal: revealOf(st, ps),
        players: ps.map(p => ({ id: p.id, name: p.name, inRound: !!st.dealt?.includes(p.id) })),
      })
    }
    if (action === 'next' && req.method === 'POST') {
      const ps = await players(pin)
      if (ps.length < 3) return res.status(409).json({ error: 'You need at least 3 players.' })
      const mode = body.mode === 'word' ? 'word' : 'topic'
      let all: Pair[], key: string, only: string[] = []
      if (body.pack) {
        const r = (await db.execute(sql`SELECT pairs FROM imp_packs WHERE id = ${String(body.pack)}`)).rows[0] as Row | undefined
        if (!r) return res.status(404).json({ error: 'That word pack was deleted. Choose another one.' })
        all = r.pairs as Pair[]; key = 'pack:' + String(body.pack)
      } else {
        const cats = Array.isArray(body.cats) ? (body.cats as unknown[]).map(String).filter(c => c in CATS) : []
        all = PAIRS.map(p => [CATS[p[0]], p[1], p[2]] as Pair)
        only = cats.map(c => CATS[c])
        key = 'built-in'
      }
      // a similar word is needed in word mode
      let pool = all.map((p, i) => i).filter(i => (!only.length || only.includes(all[i][0])) && (mode === 'topic' || all[i][2]))
      if (!pool.length) return res.status(409).json({ error: mode === 'word' ? 'This pack has no similar words. Choose "Only the topic".' : 'No words to play with.' })
      const usedAll = st.used ?? {}
      let used = (usedAll[key] ?? []).filter(i => pool.includes(i))
      if (used.length >= pool.length) used = []
      pool = pool.filter(i => !used.includes(i))
      const pick = pool[randomInt(pool.length)], pair = all[pick]
      const flip = mode === 'word' && randomInt(2) === 1
      const cur: Card = { cat: pair[0], main: flip ? pair[2]! : pair[1], odd: flip ? pair[1] : pair[2] }
      const imps = Math.max(1, Math.min(Number(body.imps) || 1, Math.floor((ps.length - 1) / 2)))
      const ids = ps.map(p => p.id)
      for (let i = ids.length - 1; i > 0; i--) { const j = randomInt(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]] }
      const next: State = {
        v: (st.v ?? 0) + 1, round: (st.round ?? 0) + 1, revealed: false, cur, mode,
        imposters: ids.slice(0, imps), dealt: ps.map(p => p.id), first: ps[randomInt(ps.length)].name,
        used: { ...usedAll, [key]: [...used, pick] },
      }
      await db.execute(sql`UPDATE imp_games SET state = ${JSON.stringify(next)}::jsonb WHERE pin = ${pin}`)
      return res.status(200).json({ ok: true, round: next.round })
    }
    if (action === 'reveal' && req.method === 'POST') {
      if (!st.round) return res.status(409).json({ error: 'Start a round first.' })
      await db.execute(sql`UPDATE imp_games SET state = ${JSON.stringify({ ...st, revealed: true, v: (st.v ?? 0) + 1 })}::jsonb WHERE pin = ${pin}`)
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

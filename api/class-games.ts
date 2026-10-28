import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../src/db/index.js'

// Sync for the Class Games page (/English/jeopardy). Games are grouped by a
// sync code the teacher types on each device; only a hash of it is stored.
// Each game is last-write-wins on updatedAt, and deletes are kept as
// tombstones so they spread to other devices.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const MAX_GAMES = 300
const MAX_GAME_BYTES = 100_000

let schemaReady: Promise<unknown> | null = null
function ensureSchema() {
  schemaReady ??= db
    .execute(sql`CREATE TABLE IF NOT EXISTS class_games (
      owner text NOT NULL,
      id text NOT NULL,
      data jsonb,
      updated_at bigint NOT NULL,
      deleted boolean NOT NULL DEFAULT false,
      PRIMARY KEY (owner, id)
    )`)
    .catch(err => { schemaReady = null; throw err })
  return schemaReady
}

type IncomingGame = { id?: unknown; updatedAt?: unknown; deleted?: unknown; data?: unknown }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const body = (req.body ?? {}) as { code?: unknown; games?: unknown }
  const code = String(body.code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code.length < 8 || code.length > 64) return res.status(400).json({ error: 'The sync code must be 8 to 64 letters or numbers.' })
  const incoming = Array.isArray(body.games) ? (body.games as IncomingGame[]) : []
  if (incoming.length > MAX_GAMES * 2) return res.status(400).json({ error: 'Too many games.' })

  const now = Date.now()
  const rows = []
  for (const g of incoming) {
    const id = String(g.id ?? '')
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) continue
    // a client clock running ahead must not make its copy win forever
    const updatedAt = Math.min(Math.max(1, Math.floor(Number(g.updatedAt) || 1)), now + 60_000)
    const deleted = g.deleted === true
    const data = deleted ? null : g.data
    if (!deleted && (!data || typeof data !== 'object')) continue
    if (data && JSON.stringify(data).length > MAX_GAME_BYTES) return res.status(400).json({ error: 'One of the games is too big to sync.' })
    rows.push({ id, updated_at: updatedAt, deleted, data })
  }
  if (rows.filter(r => !r.deleted).length > MAX_GAMES) return res.status(400).json({ error: `You can sync up to ${MAX_GAMES} games.` })

  const owner = createHash('sha256').update('class-games:' + code).digest('hex')
  try {
    await ensureSchema()
    if (rows.length) {
      await db.execute(sql`
        INSERT INTO class_games (owner, id, data, updated_at, deleted)
        SELECT ${owner}, x.id, x.data, x.updated_at, x.deleted
        FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(id text, data jsonb, updated_at bigint, deleted boolean)
        ON CONFLICT (owner, id) DO UPDATE
          SET data = excluded.data, updated_at = excluded.updated_at, deleted = excluded.deleted
          WHERE class_games.updated_at < excluded.updated_at`)
    }
    const result = await db.execute(sql`
      SELECT id, data, updated_at, deleted FROM class_games
      WHERE owner = ${owner} ORDER BY updated_at`)
    const games = (result.rows as Array<{ id: string; data: unknown; updated_at: string | number; deleted: boolean }>)
      .map(r => ({ id: r.id, data: r.data, updatedAt: Number(r.updated_at), deleted: r.deleted }))
    return res.status(200).json({ games })
  } catch (err) {
    console.error('POST /api/class-games failed:', err)
    return res.status(500).json({ error: 'sync failed' })
  }
}

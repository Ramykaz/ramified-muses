import express from 'express'
import cors from 'cors'
import { JSONFilePreset } from 'lowdb/node'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultContent } from './defaultContent.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbFile = join(__dirname, 'data', 'content-db.json')

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '8mb' }))

const db = await JSONFilePreset(dbFile, { content: defaultContent })

function normalizeContent(input) {
  if (!input || typeof input !== 'object') return defaultContent
  const next = input
  return {
    profile: { ...defaultContent.profile, ...(next.profile || {}) },
    contact: { ...defaultContent.contact, ...(next.contact || {}) },
    blogPosts: Array.isArray(next.blogPosts) ? next.blogPosts : [],
    filmReviews: Array.isArray(next.filmReviews) ? next.filmReviews : [],
    researchAreas: Array.isArray(next.researchAreas) ? next.researchAreas : [],
    books: Array.isArray(next.books) ? next.books : [],
    experiences: Array.isArray(next.experiences) ? next.experiences : [],
  }
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, storage: 'json-db' })
})

app.get('/api/content', async (_req, res) => {
  await db.read()
  res.status(200).json(normalizeContent(db.data.content))
})

app.put('/api/content', async (req, res) => {
  const normalized = normalizeContent(req.body)
  db.data.content = normalized
  await db.write()
  res.status(200).json({ ok: true, content: normalized })
})

app.listen(port, () => {
  console.log(`Ramified Muses API running on http://localhost:${port}`)
})

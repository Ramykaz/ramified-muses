import { put, list } from '@vercel/blob'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const BLOB_PATH = 'content.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH })
      if (!blobs.length) return res.status(404).json({ error: 'no content saved yet' })
      const upstream = await fetch(blobs[0].downloadUrl)
      const data = await upstream.json() as unknown
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'read failed' })
    }
  }

  if (req.method === 'PUT') {
    try {
      await put(BLOB_PATH, JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      })
      return res.status(200).json({ ok: true })
    } catch {
      return res.status(500).json({ error: 'write failed' })
    }
  }

  return res.status(405).json({ error: 'method not allowed' })
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  try {
    const { name, contentType, data } = req.body as { name: string; contentType: string; data: string }
    const base64 = data.includes(',') ? data.split(',')[1] : data
    const buffer = Buffer.from(base64, 'base64')
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`uploads/${Date.now()}-${safeName}`, buffer, {
      access: 'public',
      contentType,
    })
    return res.status(200).json({ url: blob.url })
  } catch (err) {
    console.error('Upload failed:', err)
    return res.status(500).json({ error: 'upload failed' })
  }
}

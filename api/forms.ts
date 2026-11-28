import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../src/db/index.js'

// API for the forms app (forms.ramyfied.me, also /forms on the main site).
// Public:  GET ?action=form&id=  ·  POST ?action=submit
// Admin:   everything else, with "Authorization: Bearer <token>". The admin
// password is chosen on the first visit and stored as a scrypt hash.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const MAX_FORM_BYTES = 200_000
const MAX_ANSWER_BYTES = 60_000
const SESSION_DAYS = 180

// The lesson application form on ramyfied.me/English (short links /basvuru and /apply) sends here.
// It is created once, so its answers show in the forms admin like any other form.
// The question ids must match what public/English.html sends.
export const LESSON_FORM_ID = 'ders-basvuru'
const LESSON_FORM = {
  title: 'Ders Başvurusu: İngilizce özel ders',
  description: 'Applications from ramyfied.me/English (short links: ramyfied.me/basvuru and ramyfied.me/apply).',
  slug: LESSON_FORM_ID,
  theme: '#1f6f6b',
  thankYou: 'Teşekkürler! 24 saat içinde WhatsApp üzerinden size ulaşacağım.',
  sections: [
    { title: 'Kişisel bilgiler / Personal information', questions: [
      { id: 'fullName', type: 'short', title: 'Ad Soyad / Full name', required: true },
      { id: 'phone', type: 'phone', title: 'Telefon (WhatsApp) / Phone (WhatsApp)', required: true },
      { id: 'ageGroup', type: 'single', title: 'Yaş grubu / Age group', required: true, options: ['15 yaş altı', '15-18', '18-25', '25+'] },
    ] },
    { title: 'Ders hedefi / Goal', questions: [
      { id: 'goals', type: 'multiple', title: 'Neden İngilizce öğrenmek istiyor? / Why English?', options: ['Günlük konuşma & akıcılık', 'TOEFL hazırlığı', 'SAT hazırlığı', 'YÖKDİL / YDS hazırlığı', 'Diğer ÖSYM sınavı', 'Akademik yazı / essay', 'Üniversite başvuru metni', 'Genel gelişim'], other: 'Diğer', optional: true },
      { id: 'currentLevel', type: 'dropdown', title: 'Mevcut seviye / Current level', options: ['Bilmiyorum', 'A1', 'A2', 'B1', 'B2', 'C1'] },
    ] },
    { title: 'Ders tercihleri / Lesson preferences', questions: [
      { id: 'format', type: 'single', title: 'Format', options: ['Online', 'Yüz yüze (Ankara)', 'Fark etmez'] },
      { id: 'availableDays', type: 'multiple', title: 'Uygun günler / Available days', options: ['Hafta içi sabah', 'Hafta içi öğleden sonra', 'Hafta içi akşam', 'Hafta sonu'], optional: true },
      { id: 'referral', type: 'dropdown', title: 'Beni nereden duydu? / How did they hear about you?', options: ['Arkadaş tavsiyesi', 'Instagram', 'Web sitesi', 'Diğer'] },
      { id: 'notes', type: 'long', title: 'Ek not / Anything else' },
    ] },
  ],
}

let schemaReady: Promise<unknown> | null = null
function ensureSchema() {
  schemaReady ??= db
    .execute(sql`CREATE TABLE IF NOT EXISTS forms (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      status text NOT NULL DEFAULT 'open',
      created_at bigint NOT NULL,
      updated_at bigint NOT NULL
    )`)
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS form_responses (
      id text PRIMARY KEY,
      form_id text NOT NULL,
      answers jsonb NOT NULL,
      created_at bigint NOT NULL
    )`))
    .then(() => db.execute(sql`CREATE INDEX IF NOT EXISTS form_responses_form_idx ON form_responses (form_id, created_at)`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS forms_admin (k text PRIMARY KEY, v text NOT NULL)`))
    .then(() => db.execute(sql`CREATE TABLE IF NOT EXISTS forms_sessions (token text PRIMARY KEY, created_at bigint NOT NULL)`))
    .then(() => db.execute(sql`INSERT INTO forms (id, data, status, created_at, updated_at) VALUES (${LESSON_FORM_ID}, ${JSON.stringify(LESSON_FORM)}::jsonb, 'open', ${Date.now()}, ${Date.now()}) ON CONFLICT (id) DO NOTHING`))
    .catch(err => { schemaReady = null; throw err })
  return schemaReady
}

const newId = (n = 10) => {
  const abc = 'abcdefghijkmnpqrstuvwxyz23456789'
  return [...randomBytes(n)].map(b => abc[b % abc.length]).join('')
}
const hashPassword = (pw: string) => {
  const salt = randomBytes(16).toString('hex')
  return salt + ':' + scryptSync(pw, salt, 32).toString('hex')
}
const checkPassword = (pw: string, stored: string) => {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const a = scryptSync(pw, salt, 32), b = Buffer.from(hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

async function getPasswordHash(): Promise<string | null> {
  const r = await db.execute(sql`SELECT v FROM forms_admin WHERE k = 'password'`)
  return (r.rows[0] as { v?: string } | undefined)?.v ?? null
}
async function newSession() {
  const token = randomBytes(24).toString('hex')
  await db.execute(sql`INSERT INTO forms_sessions (token, created_at) VALUES (${token}, ${Date.now()})`)
  return token
}
async function isAdmin(req: VercelRequest) {
  const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  if (!/^[a-f0-9]{48}$/.test(token)) return false
  const since = Date.now() - SESSION_DAYS * 864e5
  const r = await db.execute(sql`SELECT 1 FROM forms_sessions WHERE token = ${token} AND created_at > ${since}`)
  return r.rows.length > 0
}

type Row = Record<string, unknown>
const formOut = (r: Row) => ({
  id: r.id, data: r.data, status: r.status,
  createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  responses: r.n == null ? undefined : Number(r.n), lastResponse: r.last == null ? null : Number(r.last),
})
const isClosed = (r: Row) => {
  if (r.status !== 'open') return true
  const closesAt = (r.data as { closesAt?: string } | null)?.closesAt
  return !!closesAt && !Number.isNaN(Date.parse(closesAt)) && Date.parse(closesAt) < Date.now()
}
// keep only answers to questions that exist in the form
function questionIds(data: unknown): Set<string> {
  const ids = new Set<string>()
  const sections = ((data as { sections?: unknown[] })?.sections ?? []) as Array<{ questions?: Array<{ id?: string }> }>
  for (const s of sections) for (const q of s.questions ?? []) if (q.id) ids.add(q.id)
  return ids
}

// ---------- email on a new response (Resend: https://resend.com)
// Vercel env: RESEND_API_KEY (required), NOTIFY_EMAIL (where to send),
// RESEND_FROM (optional, e.g. "Ramyfied <forms@ramyfied.me>" once the domain is verified in Resend).
// Sent for the lesson application form, and for any form whose JSON has "notify": true.
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
type Q = { id?: string; type?: string; title?: string; other?: string }
async function notifyByEmail(formId: string, data: Record<string, unknown>, answers: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_EMAIL
  if (!key || !to) return
  if (formId !== LESSON_FORM_ID && data.notify !== true) return
  const qs = (((data.sections ?? []) as Array<{ questions?: Q[] }>).flatMap(sx => sx.questions ?? [])).filter(q => q.id && q.type !== 'info')
  const show = (q: Q) => {
    const v = answers[q.id as string]
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) return ''
    const list = Array.isArray(v) ? v : typeof v === 'object' ? Object.entries(v as object).map(([k, x]) => `${k}: ${x}`) : [v]
    return list.map(x => q.other && x === q.other ? `${x}: ${answers[q.id + '__other'] ?? ''}` : String(x)).join(', ')
  }
  const rows = qs.map(q => [q.title ?? q.id, show(q)]).filter(r => r[1])
  const name = String(answers.fullName ?? '').trim()
  const phone = String(answers.phone ?? '').replace(/[^\d]/g, '')
  const waNum = phone.startsWith('0') ? '9' + phone : phone.length === 10 && phone.startsWith('5') ? '90' + phone : phone
  const title = String(data.title ?? 'Form')
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
<h2 style="margin:0 0 4px">${esc(title)}</h2><p style="color:#666;margin:0 0 16px">New response${name ? ' from <b>' + esc(name) + '</b>' : ''}</p>
<table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;vertical-align:top;width:40%">${esc(k)}</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(v)}</b></td></tr>`).join('')}</table>
${waNum.length >= 10 ? `<p style="margin:20px 0"><a href="https://wa.me/${waNum}" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Reply on WhatsApp</a></p>` : ''}
<p style="color:#888;font-size:13px">All responses: <a href="https://forms.ramyfied.me">forms.ramyfied.me</a></p></div>`
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (waNum.length >= 10 ? `\n\nWhatsApp: https://wa.me/${waNum}` : '')
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 5000)
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: ctl.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Ramyfied Forms <onboarding@resend.dev>',
        to: to.split(',').map(x => x.trim()).filter(Boolean),
        subject: formId === LESSON_FORM_ID ? `Yeni ders başvurusu${name ? ': ' + name : ''}` : `New response: ${title}`,
        html, text,
      }),
    })
    if (!r.ok) console.error('notify email failed:', r.status, await r.text())
  } catch (err) {
    console.error('notify email failed:', err)  // the response is saved either way
  } finally { clearTimeout(timer) }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()
  res.setHeader('Cache-Control', 'no-store')
  const action = String(req.query.action ?? '')
  const body = (req.body ?? {}) as Record<string, unknown>

  try {
    await ensureSchema()

    // ---------- public
    if (action === 'form' && req.method === 'GET') {
      const id = String(req.query.id ?? '')
      const r = (await db.execute(sql`SELECT id, data, status FROM forms WHERE id = ${id}`)).rows[0] as Row | undefined
      if (!r) return res.status(404).json({ error: 'This form does not exist.' })
      const data = r.data as Record<string, unknown>
      if (isClosed(r)) return res.status(200).json({ id: r.id, closed: true, title: data.title, theme: data.theme, closedMessage: data.closedMessage ?? null })
      return res.status(200).json({ id: r.id, closed: false, data })
    }

    if (action === 'submit' && req.method === 'POST') {
      const id = String(body.id ?? '')
      const r = (await db.execute(sql`SELECT id, data, status FROM forms WHERE id = ${id}`)).rows[0] as Row | undefined
      if (!r) return res.status(404).json({ error: 'This form does not exist.' })
      if (isClosed(r)) return res.status(409).json({ error: 'Sorry, this form is closed.' })
      const ids = questionIds(r.data)
      const raw = (body.answers && typeof body.answers === 'object') ? body.answers as Record<string, unknown> : {}
      const answers: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(raw)) {
        const base = k.replace(/__other$/, '')
        if (ids.has(base) && v != null && v !== '') answers[k] = v
      }
      if (JSON.stringify(answers).length > MAX_ANSWER_BYTES) return res.status(400).json({ error: 'Your answers are too long.' })
      const rid = newId(12)
      await db.execute(sql`INSERT INTO form_responses (id, form_id, answers, created_at) VALUES (${rid}, ${id}, ${JSON.stringify(answers)}::jsonb, ${Date.now()})`)
      await notifyByEmail(id, r.data as Record<string, unknown>, answers)
      return res.status(200).json({ ok: true, id: rid })
    }

    // ---------- admin sign-in
    if (action === 'status' && req.method === 'GET') {
      return res.status(200).json({ setup: !!(await getPasswordHash()), admin: await isAdmin(req) })
    }
    if (action === 'setup' && req.method === 'POST') {
      const pw = String(body.password ?? '')
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters.' })
      const ins = await db.execute(sql`INSERT INTO forms_admin (k, v) VALUES ('password', ${hashPassword(pw)}) ON CONFLICT (k) DO NOTHING RETURNING k`)
      if (!ins.rows.length) return res.status(409).json({ error: 'A password is already set. Sign in instead.' })
      return res.status(200).json({ token: await newSession() })
    }
    if (action === 'login' && req.method === 'POST') {
      const stored = await getPasswordHash()
      if (!stored) return res.status(409).json({ error: 'No password yet. Create one first.' })
      if (!checkPassword(String(body.password ?? ''), stored)) {
        await new Promise(r => setTimeout(r, 600))
        return res.status(401).json({ error: 'Wrong password.' })
      }
      return res.status(200).json({ token: await newSession() })
    }

    if (!(await isAdmin(req))) return res.status(401).json({ error: 'Please sign in.' })

    // ---------- admin
    if (action === 'logout' && req.method === 'POST') {
      const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
      await db.execute(sql`DELETE FROM forms_sessions WHERE token = ${token}`)
      return res.status(200).json({ ok: true })
    }
    if (action === 'password' && req.method === 'POST') {
      const pw = String(body.password ?? '')
      if (pw.length < 6) return res.status(400).json({ error: 'Use at least 6 characters.' })
      await db.execute(sql`UPDATE forms_admin SET v = ${hashPassword(pw)} WHERE k = 'password'`)
      await db.execute(sql`DELETE FROM forms_sessions`)
      return res.status(200).json({ token: await newSession() })
    }
    if (action === 'list' && req.method === 'GET') {
      const r = await db.execute(sql`
        SELECT f.id, f.data, f.status, f.created_at, f.updated_at,
          (SELECT count(*) FROM form_responses x WHERE x.form_id = f.id) AS n,
          (SELECT max(created_at) FROM form_responses x WHERE x.form_id = f.id) AS last
        FROM forms f ORDER BY f.updated_at DESC`)
      return res.status(200).json({ forms: (r.rows as Row[]).map(formOut) })
    }
    if (action === 'save' && req.method === 'POST') {
      const data = body.data
      if (!data || typeof data !== 'object' || !Array.isArray((data as { sections?: unknown }).sections)) return res.status(400).json({ error: 'The form needs sections with questions.' })
      if (JSON.stringify(data).length > MAX_FORM_BYTES) return res.status(400).json({ error: 'The form is too big.' })
      const now = Date.now()
      let id = String(body.id ?? '')
      if (id) {
        const up = await db.execute(sql`UPDATE forms SET data = ${JSON.stringify(data)}::jsonb, updated_at = ${now} WHERE id = ${id} RETURNING id`)
        if (!up.rows.length) return res.status(404).json({ error: 'Form not found.' })
      } else {
        const want = String((data as { slug?: unknown }).slug ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
        id = want && want !== 'admin' && want !== 'forms' ? want : newId(8)
        let ins = await db.execute(sql`INSERT INTO forms (id, data, status, created_at, updated_at) VALUES (${id}, ${JSON.stringify(data)}::jsonb, 'open', ${now}, ${now}) ON CONFLICT (id) DO NOTHING RETURNING id`)
        if (!ins.rows.length) {
          id = (want ? want + '-' : '') + newId(4)
          ins = await db.execute(sql`INSERT INTO forms (id, data, status, created_at, updated_at) VALUES (${id}, ${JSON.stringify(data)}::jsonb, 'open', ${now}, ${now}) RETURNING id`)
        }
      }
      return res.status(200).json({ id })
    }
    if (action === 'status-set' && req.method === 'POST') {
      const status = body.status === 'closed' ? 'closed' : 'open'
      await db.execute(sql`UPDATE forms SET status = ${status}, updated_at = ${Date.now()} WHERE id = ${String(body.id ?? '')}`)
      return res.status(200).json({ ok: true, status })
    }
    if (action === 'delete' && req.method === 'POST') {
      const id = String(body.id ?? '')
      await db.execute(sql`DELETE FROM form_responses WHERE form_id = ${id}`)
      await db.execute(sql`DELETE FROM forms WHERE id = ${id}`)
      return res.status(200).json({ ok: true })
    }
    if (action === 'responses' && req.method === 'GET') {
      const id = String(req.query.id ?? '')
      const f = (await db.execute(sql`SELECT id, data, status, created_at, updated_at FROM forms WHERE id = ${id}`)).rows[0] as Row | undefined
      if (!f) return res.status(404).json({ error: 'Form not found.' })
      const r = await db.execute(sql`SELECT id, answers, created_at FROM form_responses WHERE form_id = ${id} ORDER BY created_at`)
      return res.status(200).json({
        form: formOut(f),
        responses: (r.rows as Row[]).map(x => ({ id: x.id, answers: x.answers, createdAt: Number(x.created_at) })),
      })
    }
    if (action === 'response-delete' && req.method === 'POST') {
      await db.execute(sql`DELETE FROM form_responses WHERE id = ${String(body.id ?? '')}`)
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: 'Unknown action.' })
  } catch (err) {
    console.error('/api/forms failed:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

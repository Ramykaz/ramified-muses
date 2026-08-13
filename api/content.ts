import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { db } from '../src/db/index.js'
import {
  profile, contact, blogPosts, filmReviews,
  researchAreas, books, experiences, projects,
} from '../src/db/schema.js'
import { defaultContent } from '../server/defaultContent.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const [[profileRow], [contactRow], blogRows, filmRows, researchRows, bookRows, expRows, projRows] =
        await Promise.all([
          db.select().from(profile).limit(1),
          db.select().from(contact).limit(1),
          db.select().from(blogPosts),
          db.select().from(filmReviews),
          db.select().from(researchAreas),
          db.select().from(books),
          db.select().from(experiences),
          db.select().from(projects),
        ])

      // Auto-seed on first request if DB is empty
      if (!profileRow) {
        await db.insert(profile).values({
          id: 1,
          name: defaultContent.profile.name,
          image: defaultContent.profile.image,
          bio: defaultContent.profile.bio,
          subtitle: defaultContent.profile.subtitle,
          quote: defaultContent.profile.quote,
          quoteAuthor: defaultContent.profile.quoteAuthor,
          currentWork: defaultContent.profile.currentWork,
          interests: defaultContent.profile.interests,
          languages: defaultContent.profile.languages,
          studying: defaultContent.profile.studying,
          links: defaultContent.profile.links,
        })
        await db.insert(contact).values({
          id: 1,
          email: defaultContent.contact.email,
          phone: defaultContent.contact.phone,
          location: defaultContent.contact.location,
          linkedin: defaultContent.contact.linkedin,
          github: defaultContent.contact.github,
          intro: defaultContent.contact.intro,
          cvUrl: defaultContent.contact.cvUrl ?? '',
        })
        if (defaultContent.books.length > 0) {
          await db.insert(books).values(
            defaultContent.books.map(b => ({
              id: b.id,
              title: b.title,
              author: b.author,
              status: b.status,
              notes: b.notes ?? '',
              coverImage: null,
              date: b.date ?? null,
            }))
          )
        }
        if (defaultContent.experiences.length > 0) {
          await db.insert(experiences).values(
            defaultContent.experiences.map(e => ({
              id: e.id,
              title: e.title,
              company: e.company,
              period: e.period,
              details: e.details,
              blocks: null,
              type: e.type,
              image: null,
            }))
          )
        }
        if (defaultContent.projects.length > 0) {
          await db.insert(projects).values(
            defaultContent.projects.map(p => ({
              id: p.id,
              name: p.name,
              org: p.org,
              period: p.period,
              description: p.description,
              stack: p.stack,
              links: p.links,
            }))
          )
        }

        return res.status(200).json({
          profile: defaultContent.profile,
          contact: defaultContent.contact,
          blogPosts: [],
          filmReviews: [],
          researchAreas: [],
          books: defaultContent.books,
          experiences: defaultContent.experiences,
          projects: defaultContent.projects,
        })
      }

      // Backfill new profile columns added after initial seed
      if (profileRow.subtitle === null) {
        await db.update(profile).set({
          subtitle: defaultContent.profile.subtitle,
          interests: defaultContent.profile.interests,
          languages: defaultContent.profile.languages,
          studying: defaultContent.profile.studying,
          links: defaultContent.profile.links,
        }).where(eq(profile.id, 1))
      }

      // Seed projects if table is empty and it's a migrated DB
      if (projRows.length === 0 && defaultContent.projects.length > 0) {
        await db.insert(projects).values(
          defaultContent.projects.map(p => ({
            id: p.id,
            name: p.name,
            org: p.org,
            period: p.period,
            description: p.description,
            stack: p.stack,
            links: p.links,
          }))
        )
      }

      const proj = projRows.length > 0 ? projRows : defaultContent.projects

      return res.status(200).json({
        profile: {
          name: profileRow.name,
          image: profileRow.image,
          bio: profileRow.bio,
          subtitle: profileRow.subtitle ?? defaultContent.profile.subtitle,
          quote: profileRow.quote,
          quoteAuthor: profileRow.quoteAuthor,
          currentWork: profileRow.currentWork,
          interests: profileRow.interests ?? defaultContent.profile.interests,
          languages: profileRow.languages ?? defaultContent.profile.languages,
          studying: profileRow.studying ?? defaultContent.profile.studying,
          links: (profileRow.links as Array<{ label: string; href: string }> | null) ?? defaultContent.profile.links,
        },
        contact: {
          email: contactRow?.email ?? '',
          phone: contactRow?.phone ?? '',
          location: contactRow?.location ?? '',
          linkedin: contactRow?.linkedin ?? '',
          github: contactRow?.github ?? '',
          intro: contactRow?.intro ?? '',
          cvUrl: contactRow?.cvUrl ?? '',
        },
        blogPosts: blogRows,
        filmReviews: filmRows,
        researchAreas: researchRows,
        books: bookRows,
        experiences: expRows,
        projects: proj,
      })
    } catch (err) {
      console.error('GET /api/content failed:', err)
      return res.status(500).json({ error: 'read failed' })
    }
  }

  if (req.method === 'PUT') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = req.body as any
    try {
      if (data.profile) {
        await db.insert(profile).values({
          id: 1,
          name: data.profile.name,
          image: data.profile.image,
          bio: data.profile.bio,
          subtitle: data.profile.subtitle ?? '',
          quote: data.profile.quote,
          quoteAuthor: data.profile.quoteAuthor ?? '',
          currentWork: data.profile.currentWork,
          interests: data.profile.interests ?? '',
          languages: data.profile.languages ?? '',
          studying: data.profile.studying ?? '',
          links: data.profile.links ?? [],
        }).onConflictDoUpdate({
          target: profile.id,
          set: {
            name: data.profile.name,
            image: data.profile.image,
            bio: data.profile.bio,
            subtitle: data.profile.subtitle ?? '',
            quote: data.profile.quote,
            quoteAuthor: data.profile.quoteAuthor ?? '',
            currentWork: data.profile.currentWork,
            interests: data.profile.interests ?? '',
            languages: data.profile.languages ?? '',
            studying: data.profile.studying ?? '',
            links: data.profile.links ?? [],
          },
        })
      }

      if (data.contact) {
        await db.insert(contact).values({
          id: 1,
          email: data.contact.email,
          phone: data.contact.phone,
          location: data.contact.location,
          linkedin: data.contact.linkedin,
          github: data.contact.github,
          intro: data.contact.intro,
          cvUrl: data.contact.cvUrl ?? '',
        }).onConflictDoUpdate({
          target: contact.id,
          set: {
            email: data.contact.email,
            phone: data.contact.phone,
            location: data.contact.location,
            linkedin: data.contact.linkedin,
            github: data.contact.github,
            intro: data.contact.intro,
            cvUrl: data.contact.cvUrl ?? '',
          },
        })
      }

      await db.delete(blogPosts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.blogPosts?.length) await db.insert(blogPosts).values(data.blogPosts.map((p: any) => ({
        id: p.id, title: p.title, date: p.date, excerpt: p.excerpt ?? '',
        fullContent: p.fullContent ?? '', blocks: p.blocks ?? null,
        tags: p.tags ?? [], image: p.image ?? null,
        stylePreset: p.stylePreset ?? null, bodyFont: p.bodyFont ?? null, titleFont: p.titleFont ?? null,
      })))

      await db.delete(filmReviews)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.filmReviews?.length) await db.insert(filmReviews).values(data.filmReviews.map((f: any) => ({
        id: f.id, title: f.title, director: f.director ?? '', year: f.year ?? null,
        excerpt: f.excerpt ?? '', fullReview: f.fullReview ?? '', blocks: f.blocks ?? null,
        rating: f.rating ?? null, image: f.image ?? null,
      })))

      await db.delete(researchAreas)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.researchAreas?.length) await db.insert(researchAreas).values(data.researchAreas.map((r: any) => ({
        id: r.id, title: r.title, excerpt: r.excerpt ?? '', details: r.details ?? '',
        blocks: r.blocks ?? null, tags: r.tags ?? null, image: r.image ?? null,
      })))

      await db.delete(books)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.books?.length) await db.insert(books).values(data.books.map((b: any) => ({
        id: b.id, title: b.title, author: b.author, status: b.status,
        notes: b.notes ?? '', coverImage: b.coverImage ?? null, date: b.date ?? null,
      })))

      await db.delete(experiences)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.experiences?.length) await db.insert(experiences).values(data.experiences.map((e: any) => ({
        id: e.id, title: e.title, company: e.company, period: e.period,
        details: e.details ?? '', blocks: e.blocks ?? null, type: e.type, image: e.image ?? null,
      })))

      await db.delete(projects)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.projects?.length) await db.insert(projects).values(data.projects.map((p: any) => ({
        id: p.id, name: p.name, org: p.org ?? '', period: p.period ?? '',
        description: p.description ?? '', stack: p.stack ?? [], links: p.links ?? [],
      })))

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('PUT /api/content failed:', err)
      return res.status(500).json({ error: 'write failed' })
    }
  }

  return res.status(405).json({ error: 'method not allowed' })
}

import 'dotenv/config'
import { db } from '../src/db/index'
import { profile, contact, books, experiences, blogPosts, filmReviews, researchAreas } from '../src/db/schema'
import { defaultContent } from '../server/defaultContent.js'

async function seed() {
  console.log('Seeding database with default content...')

  await db.insert(profile).values({
    id: 1,
    name: defaultContent.profile.name,
    image: defaultContent.profile.image,
    bio: defaultContent.profile.bio,
    quote: defaultContent.profile.quote,
    quoteAuthor: defaultContent.profile.quoteAuthor,
    currentWork: defaultContent.profile.currentWork,
  }).onConflictDoNothing()

  await db.insert(contact).values({
    id: 1,
    email: defaultContent.contact.email,
    phone: defaultContent.contact.phone,
    location: defaultContent.contact.location,
    linkedin: defaultContent.contact.linkedin,
    github: defaultContent.contact.github,
    intro: defaultContent.contact.intro,
    cvUrl: defaultContent.contact.cvUrl ?? '',
  }).onConflictDoNothing()

  const existingBooks = await db.select().from(books)
  if (existingBooks.length === 0 && defaultContent.books.length > 0) {
    await db.insert(books).values(
      defaultContent.books.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status,
        notes: b.notes ?? '',
        coverImage: null,
      }))
    )
  }

  const existingExp = await db.select().from(experiences)
  if (existingExp.length === 0 && defaultContent.experiences.length > 0) {
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

  // blogPosts, filmReviews, researchAreas start empty
  console.log('Seed complete.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})

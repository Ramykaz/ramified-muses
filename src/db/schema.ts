import { pgTable, integer, bigint, text, jsonb } from 'drizzle-orm/pg-core'

export const profile = pgTable('profile', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull(),
  bio: text('bio').array().notNull(),
  subtitle: text('subtitle'),
  quote: text('quote').notNull(),
  quoteAuthor: text('quote_author').notNull(),
  currentWork: text('current_work').notNull(),
  interests: text('interests'),
  languages: text('languages'),
  studying: text('studying'),
  links: jsonb('links'),
  experienceFooter: text('experience_footer'),
})

export const contact = pgTable('contact', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  location: text('location').notNull(),
  linkedin: text('linkedin').notNull(),
  github: text('github').notNull(),
  intro: text('intro').notNull(),
  cvUrl: text('cv_url').notNull(),
})

export const blogPosts = pgTable('blog_posts', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  excerpt: text('excerpt').notNull(),
  fullContent: text('full_content').notNull(),
  blocks: jsonb('blocks'),
  tags: text('tags').array().notNull(),
  image: text('image'),
  stylePreset: text('style_preset'),
  bodyFont: text('body_font'),
  titleFont: text('title_font'),
})

export const filmReviews = pgTable('film_reviews', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  director: text('director').notNull(),
  year: text('year'),
  excerpt: text('excerpt').notNull(),
  fullReview: text('full_review').notNull(),
  blocks: jsonb('blocks'),
  rating: text('rating'),
  image: text('image'),
})

export const researchAreas = pgTable('research_areas', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  details: text('details').notNull(),
  blocks: jsonb('blocks'),
  tags: text('tags').array(),
  image: text('image'),
})

export const books = pgTable('books', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  status: text('status').notNull(),
  notes: text('notes').notNull(),
  coverImage: text('cover_image'),
  date: text('date'),
})

export const experiences = pgTable('experiences', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  period: text('period').notNull(),
  details: text('details').notNull(),
  blocks: jsonb('blocks'),
  type: text('type').notNull(),
  image: text('image'),
})

export const projects = pgTable('projects', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  org: text('org').notNull(),
  period: text('period').notNull(),
  description: text('description').notNull(),
  stack: text('stack').array().notNull(),
  links: jsonb('links').notNull(),
})

export const clientSites = pgTable('client_sites', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  description: text('description').notNull(),
  tag: text('tag').notNull(),
})

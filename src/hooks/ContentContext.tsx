import React, { createContext, useContext, useState } from 'react'
import type { Block } from '../components/BlockEditor'

export interface BlogPost {
  id: number; title: string; date: string; excerpt: string
  fullContent: string; blocks?: Block[]; tags?: string[]; image?: string
}
export interface FilmReview {
  id: number; title: string; director: string; year?: string
  excerpt: string; fullReview: string; blocks?: Block[]; rating?: string; image?: string
}
export interface ResearchArea {
  id: number; title: string; excerpt: string
  details: string; blocks?: Block[]; tags?: string[]; image?: string
}
export interface Book {
  id: number; title: string; author: string
  status: 'Reading' | 'Finished' | 'Reference' | 'Want to Read'
  notes: string; coverImage?: string
}
export interface Experience {
  id: number; title: string; company: string; period: string
  details: string; blocks?: Block[]; type: 'work' | 'volunteer'; image?: string
}
export interface SiteContent {
  profile: { name: string; image: string; bio: string[]; quote: string; quoteAuthor: string; currentWork: string }
  contact: { email: string; phone: string; location: string; linkedin: string; github: string; intro: string; cvUrl?: string }
  blogPosts: BlogPost[]
  filmReviews: FilmReview[]
  researchAreas: ResearchArea[]
  books: Book[]
  experiences: Experience[]
}

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: "Ramadan Shemsu Hussen", image: "/profi.jpg",
    bio: ["My name is Ramadan Shemsu Hussen. I am a Computer Engineering student at Hacettepe University passionate about AI research, computer vision, and building solutions that create impact."],
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    quoteAuthor: "Aristotle",
    currentWork: "Currently working on computer vision systems for renewable energy and exploring the intersections of AI, cinema, and literature."
  },
  contact: {
    email: "Ramadanshemsu341@gmail.com", phone: "+9053 4614 6330",
    location: "Çankaya, Ankara, Turkey",
    linkedin: "https://linkedin.com/in/ramadan-shemsu-hussen-0b995a191",
    github: "https://github.com/Ramykaz",
    intro: "If you'd like to reach out for collaborations, inquiries, or just to say hello, feel free to contact me through the following channels.",
    cvUrl: ""
  },
  blogPosts: [
    { id: 1, title: "Computer Vision in Renewable Energy", date: "February 2025", excerpt: "Exploring how deep learning models can identify defects in solar panels...", fullContent: "", blocks: [{ type: 'paragraph', text: "Working with drone imagery presents unique challenges for computer vision systems. The fusion of IR, EL, and RGB data requires sophisticated preprocessing and model architectures." }, { type: 'paragraph', text: "Recent advances in attention mechanisms have shown promise for multi-modal defect detection in renewable energy applications." }], tags: ["AI", "Computer Vision", "Renewable Energy"] },
    { id: 2, title: "Multilingual NLP Challenges", date: "January 2025", excerpt: "Reflections on processing Arabic social media posts...", fullContent: "", blocks: [{ type: 'paragraph', text: "Arabic NLP faces challenges from dialect variations to complex morphology. The gap between Modern Standard Arabic and regional dialects requires careful dataset construction." }, { type: 'paragraph', text: "Transfer learning from larger languages shows potential but requires cultural and linguistic adaptation." }], tags: ["NLP", "Arabic", "Machine Learning"] },
    { id: 3, title: "Cross-Cultural AI Development", date: "December 2024", excerpt: "Experiences working on AI projects across Turkey and Qatar...", fullContent: "", blocks: [{ type: 'paragraph', text: "Cultural context significantly influences technology development. Working across different regions reveals how user expectations and infrastructure shape AI system design." }, { type: 'paragraph', text: "The most successful projects often incorporate local knowledge from the earliest stages." }], tags: ["AI", "Culture", "Research"] }
  ],
  filmReviews: [
    { id: 1, title: "Stalker", director: "Andrei Tarkovsky", year: "1979", excerpt: "A profound meditation on desire, faith, and human limitation...", fullReview: "", blocks: [{ type: 'paragraph', text: "The Zone operates as both physical and metaphysical space. The gradual deterioration of film stock mirrors the characters' psychological unraveling." }, { type: 'paragraph', text: "Tarkovsky masterfully uses long takes to create a contemplative rhythm that draws viewers into the philosophical questions at the film's core." }], rating: "★★★★★" },
    { id: 2, title: "Arrival", director: "Denis Villeneuve", year: "2016", excerpt: "Exceptional exploration of language, time, and communication...", fullReview: "", blocks: [{ type: 'paragraph', text: "The non-linear narrative structure perfectly mirrors the film's thematic concerns about time and perception." }, { type: 'paragraph', text: "The visual design of the heptapod language is particularly innovative." }], rating: "★★★★★" },
    { id: 3, title: "Parasite", director: "Bong Joon-ho", year: "2019", excerpt: "Masterful class commentary disguised as a genre-blending thriller...", fullReview: "", blocks: [{ type: 'paragraph', text: "The architectural space becomes a character in itself, representing social stratification through vertical composition." }, { type: 'paragraph', text: "The tonal shifts from comedy to thriller to horror are handled with incredible precision." }], rating: "★★★★★" }
  ],
  researchAreas: [
    { id: 1, title: "Computer Vision for Renewable Energy", excerpt: "Using deep learning for solar panel defect detection...", details: "", blocks: [{ type: 'paragraph', text: "Developing computer vision pipelines that analyze IR, EL, and RGB drone imagery to identify micro-cracks, hotspots, and other defects in solar panels." }], tags: ["Computer Vision", "Deep Learning", "Energy"] },
    { id: 2, title: "Multilingual NLP", excerpt: "Arabic sentiment analysis and cross-cultural AI...", details: "", blocks: [{ type: 'paragraph', text: "Exploring the challenges of Arabic natural language processing, including dialect variations and morphological complexity." }], tags: ["NLP", "Arabic", "AI"] },
    { id: 3, title: "Real-time AI Systems", excerpt: "Optimizing object detection for security applications...", details: "", blocks: [{ type: 'paragraph', text: "Researching efficient inference pipelines for real-time computer vision applications using YOLO architectures." }], tags: ["YOLO", "Real-time", "Optimization"] }
  ],
  books: [
    { id: 1, title: "Gödel, Escher, Bach", author: "Douglas Hofstadter", status: "Reading", notes: "Exploring connections between formal systems, art, and consciousness." },
    { id: 2, title: "The Order of Time", author: "Carlo Rovelli", status: "Finished", notes: "Beautiful meditation on the nature of time from a theoretical physicist's perspective." },
    { id: 3, title: "Film Art: An Introduction", author: "Bordwell & Thompson", status: "Reference", notes: "Essential for understanding film form and style." }
  ],
  experiences: [
    { id: 1, title: "Generative AI Research Intern", company: "UNDP-ICPSD", period: "Nov 2025 - present", details: "Conducting research on generative AI models and their applications in sustainable development.", type: "work" },
    { id: 2, title: "Computer Vision & AI Intern", company: "Oasis Global Energy", period: "July 2025 - Present", details: "Developing computer vision pipelines for solar panel defect detection using drone imagery.", type: "work" },
    { id: 3, title: "Frontend Development Intern", company: "BUTHUR QSTP, Qatar", period: "May 2025 - July 2025", details: "Built responsive web interfaces for Arabic learning platform.", type: "work" },
    { id: 4, title: "Computer Vision Intern", company: "Optima Engineering", period: "Aug 2024 - Oct 2024", details: "Designed real-time driver detection system using YOLOv8.", type: "work" },
    { id: 5, title: "Data Science Research Intern", company: "ORSAM", period: "Aug 2022 - Oct 2022", details: "Analyzed socio-economic datasets to identify regional trends.", type: "work" },
    { id: 10, title: "Community Development Volunteer", company: "Habeşistan Kalkınma Derneği", period: "Jan 2022 - Present", details: "Coordinated water well and school construction projects in Ethiopia.", type: "volunteer" }
  ]
}

const STORAGE_KEY = 'ramified_muses_v4'

function safeMerge(stored: Partial<SiteContent>): SiteContent {
  return {
    profile: { ...DEFAULT_CONTENT.profile, ...(stored.profile || {}) },
    contact: { ...DEFAULT_CONTENT.contact, ...(stored.contact || {}) },
    blogPosts: Array.isArray(stored.blogPosts) ? stored.blogPosts : DEFAULT_CONTENT.blogPosts,
    filmReviews: Array.isArray(stored.filmReviews) ? stored.filmReviews : DEFAULT_CONTENT.filmReviews,
    researchAreas: Array.isArray(stored.researchAreas) ? stored.researchAreas : DEFAULT_CONTENT.researchAreas,
    books: Array.isArray(stored.books) ? stored.books : DEFAULT_CONTENT.books,
    experiences: Array.isArray(stored.experiences) ? stored.experiences : DEFAULT_CONTENT.experiences,
  }
}

function load(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return safeMerge(JSON.parse(raw))
  } catch { /* ignore */ }
  return DEFAULT_CONTENT
}

// ── Context ────────────────────────────────────────────────────
interface Ctx {
  content: SiteContent
  updateProfile: (p: Partial<SiteContent['profile']>) => void
  updateContact: (c: Partial<SiteContent['contact']>) => void
  addItem: <T extends { id: number }>(key: keyof SiteContent, item: Omit<T, 'id'>) => T
  updateItem: <T extends { id: number }>(key: keyof SiteContent, id: number, updates: Partial<T>) => void
  deleteItem: (key: keyof SiteContent, id: number) => void
  resetToDefaults: () => void
}

const ContentContext = createContext<Ctx | null>(null)

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(load)

  const save = (next: SiteContent) => {
    setContent(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateProfile = (p: Partial<SiteContent['profile']>) =>
    save({ ...content, profile: { ...content.profile, ...p } })

  const updateContact = (c: Partial<SiteContent['contact']>) =>
    save({ ...content, contact: { ...content.contact, ...c } })

  function addItem<T extends { id: number }>(key: keyof SiteContent, item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Date.now() } as unknown as T
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: [newItem, ...list] })
    return newItem
  }
  function updateItem<T extends { id: number }>(key: keyof SiteContent, id: number, updates: Partial<T>) {
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: list.map(i => i.id === id ? { ...i, ...updates } : i) })
  }
  function deleteItem(key: keyof SiteContent, id: number) {
    const list = content[key] as { id: number }[]
    save({ ...content, [key]: list.filter(i => i.id !== id) })
  }
  const resetToDefaults = () => { localStorage.removeItem(STORAGE_KEY); setContent(DEFAULT_CONTENT) }

  return (
    <ContentContext.Provider value={{ content, updateProfile, updateContact, addItem, updateItem, deleteItem, resetToDefaults }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): Ctx {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

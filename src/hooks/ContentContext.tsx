import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Block } from '../components/BlockEditor'

export interface BlogPost {
  id: number; title: string; date: string; excerpt: string
  fullContent: string; blocks?: Block[]; tags?: string[]; image?: string
  stylePreset?: 'editorial' | 'cinematic' | 'minimal'
  bodyFont?: 'serif' | 'sans' | 'mono'
  titleFont?: 'serif' | 'sans'
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
    name: "Ramadan Shemsu Hussen",
    image: "/profi.jpg",
    bio: [
      "Machine learning engineer and researcher building production AI systems. Studying Computer Engineering at Hacettepe University (2022–2026).",
      "My work spans LLM pipelines and RAG architectures, edge AI deployment, and computer vision — from document intelligence at the UN to TensorRT-optimized object detection on NVIDIA Jetson devices.",
      "Currently conducting undergraduate research on hardware-aware edge AI optimization for UAV-based search-and-rescue. Published at ICHORA 2026, Ankara."
    ],
    quote: "Simplicity is a great virtue but it requires hard work to achieve it and education to appreciate it.",
    quoteAuthor: "Edsger W. Dijkstra",
    currentWork: "Undergraduate researcher at Hacettepe BAP — optimizing YOLO/RT-DETR on NVIDIA Jetson Orin Nano for thermal UAV search-and-rescue. Also: generative AI research intern at UNDP SDG AI Lab."
  },
  contact: {
    email: "Ramadanshemsu341@gmail.com",
    phone: "+90 534 614 6330",
    location: "Çankaya, Ankara, Turkey",
    linkedin: "https://linkedin.com/in/ramadan-shemsu-hussen-0b995a191",
    github: "https://github.com/Ramykaz",
    intro: "Open to research collaborations, ML engineering roles, and interesting projects. Best reached by email.",
    cvUrl: ""
  },
  blogPosts: [],
  filmReviews: [],
  researchAreas: [],
  books: [
    { id: 1, title: "Gödel, Escher, Bach: An Eternal Golden Braid", author: "Douglas Hofstadter", status: "Reference", notes: "Strange loops through mathematics, music, and mind. The book that made me fall in love with recursion and formal systems." },
    { id: 2, title: "The Order of Time", author: "Carlo Rovelli", status: "Finished", notes: "Physics meets poetry. Rovelli makes thermal time feel personal." },
    { id: 3, title: "The Alignment Problem", author: "Brian Christian", status: "Reading", notes: "What it means to build AI that does what we actually want. Terrifying and essential." },
    { id: 4, title: "Crime and Punishment", author: "Fyodor Dostoevsky", status: "Finished", notes: "Raskolnikov's psychology is as vivid as any model's decision boundary. Literature's answer to the alignment problem." },
    { id: 5, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", status: "Finished", notes: "System 1 vs System 2. Cognitive bias as the original adversarial examples." },
    { id: 6, title: "Superintelligence", author: "Nick Bostrom", status: "Want to Read", notes: "" }
  ],
  experiences: [
    { id: 1, title: "Undergraduate Researcher", company: "Hacettepe University — BAP", period: "May 2026 – Present", details: "Hardware-aware edge AI optimization for real-time UAV-based search-and-rescue. Benchmarked 14 detector variants (YOLO v5–v11, RT-DETR, RF-DETR) across 278 configurations on the WiSARD thermal dataset. Key finding: TensorRT FP16 is the highest-impact optimization. Published at ICHORA 2026.", type: "work" },
    { id: 2, title: "Generative AI Research Intern", company: "UNDP IICPSD — SDG AI Lab", period: "Nov 2024 – May 2026", details: "Designed and implemented production LLM pipelines for document analysis, QA, and stakeholder intelligence. Sole developer of the AI Stakeholder Mapping Tool — full-stack platform (Django, Next.js, PostgreSQL/pgvector, Celery, Redis) with NER, semantic search, RAG-based summarization, and NL query interface for policy document analysis at scale.", type: "work" },
    { id: 3, title: "Computer Vision Engineer", company: "Oasis Global Energy Technology Software", period: "Jul 2025 – Sep 2025", details: "End-to-end CV workflows for solar panel defect detection using multi-modal drone imagery (IR, EL, RGB). Trained CNN-based models for field deployment. Automated Python pipelines for defect detection and reporting.", type: "work" },
    { id: 4, title: "Frontend Development Engineer", company: "BUTHUR QSTP, Doha (Remote)", period: "May 2025 – Jul 2025", details: "Designed and maintained frontend components for a multi-region education platform. Integrated secure REST APIs and role-based authentication workflows.", type: "work" },
    { id: 5, title: "Computer Vision Engineer", company: "Optima Engineering, Ankara", period: "Aug 2024 – Oct 2024", details: "Built real-time driver and steering wheel detection system (YOLO, Faster R-CNN) optimized for low-latency edge inference. Labeled and augmented datasets for varied lighting conditions.", type: "work" },
    { id: 6, title: "Data Science Researcher", company: "ORSAM — Center for Middle Eastern Studies", period: "Aug 2023 – Oct 2023", details: "Sentiment and discourse analysis on large-scale Arabic social media datasets. Designed NLP preprocessing pipelines and built interaction networks to identify key influencers and propagation patterns.", type: "work" }
  ]
}

const STORAGE_KEY = 'ramified_muses_v6'
const API_BASE = import.meta.env.VITE_API_URL || '/api'

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

async function readFromApi(): Promise<SiteContent | null> {
  try {
    const res = await fetch(`${API_BASE}/content`)
    if (!res.ok) return null
    const data = await res.json() as Partial<SiteContent>
    return safeMerge(data)
  } catch {
    return null
  }
}

async function writeToApi(content: SiteContent): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── Context ────────────────────────────────────────────────────
interface Ctx {
  content: SiteContent
  isLoading: boolean
  storageMode: 'db' | 'local'
  updateProfile: (p: Partial<SiteContent['profile']>) => void
  updateContact: (c: Partial<SiteContent['contact']>) => void
  addItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', item: Omit<T, 'id'>) => T
  updateItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', id: number, updates: Partial<T>) => void
  deleteItem: (key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', id: number) => void
  resetToDefaults: () => void
  reloadFromSource: () => Promise<void>
}

const ContentContext = createContext<Ctx | null>(null)

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(load)
  const [isLoading, setIsLoading] = useState(true)
  const [storageMode, setStorageMode] = useState<'db' | 'local'>('local')

  const saveLocal = (next: SiteContent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const persist = async (next: SiteContent) => {
    const ok = await writeToApi(next)
    if (ok) {
      setStorageMode('db')
      saveLocal(next)
      return
    }
    setStorageMode('local')
    saveLocal(next)
  }

  const save = (next: SiteContent) => {
    setContent(next)
    void persist(next)
  }

  const hydrate = async () => {
    setIsLoading(true)
    const remote = await readFromApi()
    if (remote) {
      setContent(remote)
      saveLocal(remote)
      setStorageMode('db')
      setIsLoading(false)
      return
    }
    const local = load()
    setContent(local)
    setStorageMode('local')
    setIsLoading(false)
  }

  useEffect(() => {
    void hydrate()
  }, [])

  const reloadFromSource = async () => {
    await hydrate()
  }

  const updateProfile = (p: Partial<SiteContent['profile']>) =>
    save({ ...content, profile: { ...content.profile, ...p } })

  const updateContact = (c: Partial<SiteContent['contact']>) =>
    save({ ...content, contact: { ...content.contact, ...c } })

  function addItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Date.now() } as unknown as T
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: [newItem, ...list] })
    return newItem
  }
  function updateItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', id: number, updates: Partial<T>) {
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: list.map(i => i.id === id ? { ...i, ...updates } : i) })
  }
  function deleteItem(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences', id: number) {
    const list = content[key] as { id: number }[]
    save({ ...content, [key]: list.filter(i => i.id !== id) })
  }
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY)
    save(DEFAULT_CONTENT)
  }

  return (
    <ContentContext.Provider value={{
      content,
      isLoading,
      storageMode,
      updateProfile,
      updateContact,
      addItem,
      updateItem,
      deleteItem,
      resetToDefaults,
      reloadFromSource,
    }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): Ctx {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

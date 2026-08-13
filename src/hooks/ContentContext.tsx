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
  date?: string
}
export interface Experience {
  id: number; title: string; company: string; period: string
  details: string; blocks?: Block[]; type: 'work' | 'volunteer'; image?: string
}
export interface HomeLink { label: string; href: string }
export interface FeaturedProject {
  id: number; name: string; org: string; period: string
  description: string; stack: string[]; links: HomeLink[]
}
export interface SiteContent {
  profile: {
    name: string; image: string; bio: string[]
    subtitle: string
    quote: string; quoteAuthor: string; currentWork: string
    interests: string; languages: string; studying: string
    links: HomeLink[]
  }
  contact: { email: string; phone: string; location: string; linkedin: string; github: string; intro: string; cvUrl?: string }
  blogPosts: BlogPost[]
  filmReviews: FilmReview[]
  researchAreas: ResearchArea[]
  books: Book[]
  experiences: Experience[]
  projects: FeaturedProject[]
}

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: "Ramadan Shemsu Hussen",
    image: "/profi.jpg",
    subtitle: "ML Engineer · CS Undergrad · Ankara, Turkey",
    bio: [
      "Computer engineering student at Hacettepe University, mostly curious about how intelligence — artificial or otherwise — actually works under the hood. I like systems that fold back on themselves: recursive functions, feedback loops, models that learn to see.",
      "Lately that curiosity has gone into edge AI — fitting detection models onto small, cheap hardware and getting them fast enough to matter. Before that it was RAG pipelines, turning a mountain of UN policy documents into something you could actually ask a question.",
      "Outside of that: strange loops, the thermodynamics of time, and whatever book currently has me rethinking something I assumed was settled."
    ],
    quote: "Simplicity is a great virtue but it requires hard work to achieve it and education to appreciate it.",
    quoteAuthor: "Edsger W. Dijkstra",
    currentWork: "Undergraduate researcher at Hacettepe BAP — optimizing YOLO/RT-DETR on NVIDIA Jetson Orin Nano for thermal UAV search-and-rescue. Also: generative AI research intern at UNDP SDG AI Lab.",
    interests: "AI systems · edge computing · computer vision · NLP · robotics · literature · academic research",
    languages: "Amharic (native) · English (fluent) · Turkish (proficient) · Arabic (beginner)",
    studying: "B.Sc. Computer Engineering, Hacettepe University (2022–2026)",
    links: [
      { label: "github ↗", href: "https://github.com/Ramykaz" },
      { label: "linkedin ↗", href: "https://linkedin.com/in/ramadan-shemsu-hussen-0b995a191" },
      { label: "google scholar ↗", href: "https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en" },
      { label: "email ↗", href: "mailto:Ramadanshemsu341@gmail.com" },
      { label: "IEEE paper ↗", href: "https://ieeexplore.ieee.org/document/11537125" },
    ],
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
    { id: 1, title: "Gödel, Escher, Bach: An Eternal Golden Braid", author: "Douglas Hofstadter", status: "Reference", notes: "Strange loops through mathematics, music, and mind. The book that made me fall in love with recursion and formal systems.", date: "" },
    { id: 2, title: "The Order of Time", author: "Carlo Rovelli", status: "Finished", notes: "Physics meets poetry. Rovelli makes thermal time feel personal.", date: "" },
    { id: 3, title: "The Alignment Problem", author: "Brian Christian", status: "Reading", notes: "What it means to build AI that does what we actually want. Terrifying and essential.", date: "" },
    { id: 4, title: "Crime and Punishment", author: "Fyodor Dostoevsky", status: "Finished", notes: "Raskolnikov's psychology is as vivid as any model's decision boundary. Literature's answer to the alignment problem.", date: "" },
    { id: 5, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", status: "Finished", notes: "System 1 vs System 2. Cognitive bias as the original adversarial examples.", date: "" },
    { id: 6, title: "Superintelligence", author: "Nick Bostrom", status: "Want to Read", notes: "", date: "" }
  ],
  experiences: [
    { id: 1, title: "Undergraduate Researcher", company: "Hacettepe University — BAP", period: "May 2026 – Present", details: "Benchmarking 14 detector architectures — YOLOv5 through v11, RT-DETR, RF-DETR — across 278 configurations on WiSARD, a thermal dataset built for UAV search-and-rescue.\nThe biggest lever turned out to be unglamorous: TensorRT FP16 quantization beat every architecture swap I tried.\nPublished the results at ICHORA 2026. Now getting the whole pipeline to run in real time on a Jetson Orin Nano strapped to a drone.", type: "work" },
    { id: 2, title: "Generative AI Research Intern", company: "UNDP IICPSD — SDG AI Lab", period: "Nov 2024 – May 2026", details: "Sole developer of the AI Stakeholder Mapping Tool — Django, Next.js, Postgres + pgvector, Celery, Redis — built to turn thousands of policy documents into something searchable.\nBuilt the NER pipeline for entity extraction and deduplication, plus semantic search and RAG-based summarization over the corpus.\nAdded a natural-language query interface, so a policy analyst can ask a plain-English question instead of grepping PDFs by hand.", type: "work" },
    { id: 3, title: "Computer Vision Engineer", company: "Oasis Global Energy Technology Software", period: "Jul 2025 – Sep 2025", details: "Built CV pipelines fusing infrared, electroluminescence, and RGB drone imagery to catch solar panel defects a normal camera can't see — micro-cracks, hotspots, delamination.\nTrained the CNN models used for field deployment and automated the reporting pipeline from raw imagery to flagged defect.", type: "work" },
    { id: 4, title: "Frontend Development Engineer", company: "BUTHUR QSTP, Doha (Remote)", period: "May 2025 – Jul 2025", details: "Built frontend components for a multi-region education platform, fully remote and mostly async.\nIntegrated REST APIs and role-based auth across student, teacher, and admin permission levels.", type: "work" },
    { id: 5, title: "Computer Vision Engineer", company: "Optima Engineering, Ankara", period: "Aug 2024 – Oct 2024", details: "Built a real-time driver and steering-wheel detection system (YOLO, Faster R-CNN) tuned for low-latency edge inference.\nLabeled and augmented the training data myself to cover conditions the original dataset didn't — different lighting, hand positions, cabin angles.", type: "work" },
    { id: 6, title: "Data Science Researcher", company: "ORSAM — Center for Middle Eastern Studies", period: "Aug 2023 – Oct 2023", details: "Ran sentiment and discourse analysis on large-scale Arabic social media datasets — my first real NLP project, dialectal preprocessing included.\nBuilt interaction networks to separate who was actually driving conversations from who was just amplifying them.", type: "work" }
  ],
  projects: [
    { id: 1, name: "AI Stakeholder Mapping Tool", org: "UNDP SDG AI Lab", period: "2024–2026", stack: ["Django", "Next.js", "PostgreSQL", "pgvector", "Celery", "Redis", "RAG", "NER"], description: "NER pipeline for entity recognition and deduplication across thousands of policy documents.\nSemantic search with pgvector, RAG-based summarization, and a natural-language query interface on top.\nSole developer from architecture through deployment.", links: [] },
    { id: 2, name: "Edge AI for UAV Search-and-Rescue", org: "Hacettepe University BAP", period: "2026", stack: ["TensorRT", "NVIDIA Jetson Orin Nano", "YOLO v5–v11", "RT-DETR", "RF-DETR", "PyTorch", "Python"], description: "Benchmarked 14 detector architectures across 278 configurations for real-time thermal human detection on edge hardware.\nTensorRT FP16 quantization was the single highest-impact optimization — more than any architecture swap.\nPresented at ICHORA 2026, Ankara.", links: [{ label: "IEEE paper ↗", href: "https://ieeexplore.ieee.org/document/11537125" }, { label: "Google Scholar ↗", href: "https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en" }] },
    { id: 3, name: "Solar Panel Defect Detection", org: "Oasis Global Energy Technology Software", period: "2025", stack: ["PyTorch", "OpenCV", "CNN", "IR imaging", "EL imaging", "RGB", "Python"], description: "Multi-modal CV pipeline fusing infrared, electroluminescence, and RGB drone imagery.\nCatches micro-cracks, hotspots, and delamination invisible to a standard camera.\nAutomated reporting pipeline turns flagged defects into actionable field maintenance reports.", links: [] },
    { id: 4, name: "Real-time Driver Detection System", org: "Optima Engineering", period: "2024", stack: ["YOLO", "Faster R-CNN", "Python", "edge deployment"], description: "Real-time driver-presence and steering-wheel detection (YOLO, Faster R-CNN) for continuous low-latency edge inference.\nCustom data labeling and augmentation pipeline to handle varied cabin lighting conditions.", links: [] },
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
    projects: Array.isArray(stored.projects) ? stored.projects : DEFAULT_CONTENT.projects,
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
  addItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', item: Omit<T, 'id'>) => T
  updateItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', id: number, updates: Partial<T>) => void
  deleteItem: (key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', id: number) => void
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

  function addItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Date.now() } as unknown as T
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: [newItem, ...list] })
    return newItem
  }
  function updateItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', id: number, updates: Partial<T>) {
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: list.map(i => i.id === id ? { ...i, ...updates } : i) })
  }
  function deleteItem(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects', id: number) {
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

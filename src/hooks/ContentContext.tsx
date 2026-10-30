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
export interface ClientSite {
  id: number; name: string; url: string; description: string; tag: string
}
export interface SiteContent {
  profile: {
    name: string; image: string; bio: string[]
    subtitle: string
    quote: string; quoteAuthor: string; currentWork: string
    interests: string; languages: string; studying: string
    links: HomeLink[]
    /** Experience page footer — one line per entry, trailing [text] = badge */
    experienceFooter?: string
  }
  contact: { email: string; phone: string; location: string; linkedin: string; github: string; intro: string; cvUrl?: string }
  blogPosts: BlogPost[]
  filmReviews: FilmReview[]
  researchAreas: ResearchArea[]
  books: Book[]
  experiences: Experience[]
  projects: FeaturedProject[]
  clientSites: ClientSite[]
}

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: "Ramadan Shemsu Hussen",
    image: "/profi.jpg",
    subtitle: "ML Engineer · CS Undergrad · Ankara, Turkey",
    bio: [
      "Computer engineering student at Hacettepe University. Five internships in so far — computer vision, LLM systems, full-stack — and I still like figuring out how things work more than collecting titles.",
      "Current research: testing 14 object detectors across 278 configurations to find the fastest reliable setup for search-and-rescue drones on embedded hardware. Presented at ICHORA 2026. Before that, I built an AI tool for the UN alone, from the database up.",
      "Outside of that I just read a lot and follow whatever I'm curious about that week."
    ],
    quote: "Simplicity is a great virtue but it requires hard work to achieve it and education to appreciate it.",
    quoteAuthor: "Edsger W. Dijkstra",
    currentWork: "Undergraduate researcher at Hacettepe BAP — testing 14 object detectors across 278 configurations for real-time search-and-rescue on an NVIDIA Jetson Orin Nano. Most recently: generative AI research intern at UNDP.",
    interests: "AI systems · edge computing · computer vision · NLP · robotics · literature · academic research",
    languages: "Amharic (native) · English (fluent) · Turkish (proficient) · Arabic (beginner)",
    studying: "B.Sc. Computer Engineering, Hacettepe University",
    links: [
      { label: "github ↗", href: "https://github.com/Ramykaz" },
      { label: "linkedin ↗", href: "https://linkedin.com/in/ramadan-shemsu-hussen-0b995a191" },
      { label: "google scholar ↗", href: "https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en" },
      { label: "email ↗", href: "mailto:Ramadanshemsu341@gmail.com" },
      { label: "IEEE paper ↗", href: "https://ieeexplore.ieee.org/document/11537125" },
    ],
    experienceFooter: [
      "B.Sc. Computer Engineering · Hacettepe University",
      "MENA ML Winter School · Google DeepMind & QCRI · Doha, Qatar · Feb 2025",
      "Frontier Tech Leaders ML Bootcamp · UNDP ICPSD · Mar–Jun 2024 [Hackathon Winner]",
    ].join("\n"),
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
    { id: 1, title: "Undergraduate Researcher", company: "Hacettepe University — BAP", period: "May 2026 – Present", details: "Testing 14 detector variants — YOLO v5 through v11, RT-DETR, RF-DETR — across 278 configurations on WiSARD, a thermal dataset built for search-and-rescue drones.\nFour optimization angles: TensorRT quantization (FP32/FP16/INT8), unstructured pruning, input resolution, and power mode — all run on an NVIDIA Jetson Orin Nano under embedded Linux.\nTensorRT FP16 turned out to be the biggest lever. Best configuration landed on YOLO26s at FP16, 416px. Wrote the Python/Bash tooling that automates the whole benchmark-and-deploy loop.\nPresented the results at ICHORA 2026 (IEEE Xplore).", type: "work" },
    { id: 2, title: "Generative AI Research Intern", company: "United Nations Development Programme (UNDP)", period: "Nov 2025 – May 2026", details: "Sole developer of an AI stakeholder mapping tool — Django, Next.js, Postgres + pgvector, Llama 3 via Groq — built to turn policy documents into something searchable and queryable.\nBuilt NER, semantic search, fuzzy and acronym-based entity deduplication, RAG-based summarization, and a natural-language query interface.\nBuilt and benchmarked RAG pipelines against vector databases for document analysis and QA, and kept an eye on where they broke.\nAlso contributed to three other UNDP projects: an AI Value Chain Tool for Afghanistan, a job-matching system for Trinidad and Tobago, and NLP analysis of survey responses across Moldova, Georgia, and Ukraine.", type: "work" },
    { id: 3, title: "Computer Vision and AI Intern", company: "Oasis Global Energy Technology Software", period: "Jul 2025 – Sep 2025", details: "Built CV pipelines for SolarVulture, the company's drone platform for solar plant inspection — detecting defects across infrared, electroluminescence, and visible-light imagery.\nCurated and augmented the training data, then trained and validated the CNN models that went into the field.\nAutomated defect detection and reporting in Python, and tuned inference speed to fit the deployment constraints.", type: "work" },
    { id: 4, title: "Frontend Development Intern", company: "BUTHUR — Qatar Science and Technology Park, Doha (Remote)", period: "May 2025 – Jul 2025", details: "Built and maintained frontend components for an education platform used across several regions.\nIntegrated REST APIs and authentication, keeping data consistent across different user roles.\nWorked with the backend team on modular components, refining them through testing and user feedback.", type: "work" },
    { id: 5, title: "Computer Vision Intern", company: "Optima Engineering, Ankara", period: "Aug 2024 – Oct 2024", details: "Worked on vision systems for the company's vehicle recognition products — high-security entry points and on-street parking cameras — building real-time driver and steering-wheel detection with YOLO and Faster R-CNN, tuned for low latency.\nLabeled and augmented data to hold up under different lighting and camera conditions.\nDeployed and tested the inference pipelines on edge devices running continuously.", type: "work" },
    { id: 6, title: "Data Science Research Intern", company: "ORSAM — Center for Middle Eastern Studies", period: "Aug 2023 – Oct 2023", details: "Analyzed sentiment and discourse in large Arabic social media datasets for the center's research on political and social trends in the region.\nBuilt NLP preprocessing pipelines — tokenization, stemming, stopword removal, vectorization — for classification and exploratory work.\nBuilt interaction networks to trace who was actually driving conversations versus just amplifying them, and wrote up the methods and limitations.", type: "work" }
  ],
  projects: [
    { id: 1, name: "AI Stakeholder Mapping Tool", org: "UNDP", period: "2025–2026", stack: ["Django", "Next.js", "PostgreSQL", "pgvector", "Llama 3", "Groq", "RAG", "NER"], description: "NER, semantic search, and fuzzy/acronym-based entity deduplication across thousands of policy documents.\nRAG-based summarization and a natural-language query interface on top, powered by Llama 3 via Groq.\nSole developer from architecture through deployment — plus three sister projects: an AI Value Chain Tool for Afghanistan, job-matching for Trinidad and Tobago, and NLP survey analysis across Moldova, Georgia, and Ukraine.", links: [] },
    { id: 2, name: "Edge AI for UAV Search-and-Rescue", org: "Hacettepe University BAP", period: "2026", stack: ["TensorRT", "NVIDIA Jetson Orin Nano", "YOLO v5–v11", "YOLO26", "RT-DETR", "RF-DETR", "Python"], description: "Four optimization angles — TensorRT quantization (FP32/FP16/INT8), unstructured pruning, input resolution, and power mode — tested across 278 configurations of 14 detector variants on the WiSARD thermal dataset.\nTensorRT FP16 was the single highest-impact lever. Best configuration: YOLO26s at FP16, 416px, running on a Jetson Orin Nano under embedded Linux.\nWrote the Python/Bash tooling that automates benchmarking and deployment. Presented at ICHORA 2026, Ankara (IEEE Xplore).", links: [{ label: "IEEE paper ↗", href: "https://ieeexplore.ieee.org/document/11537125" }, { label: "Google Scholar ↗", href: "https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en" }] },
    { id: 3, name: "SolarVulture — Solar Panel Defect Detection", org: "Oasis Global Energy Technology Software", period: "2025", stack: ["PyTorch", "OpenCV", "CNN", "IR imaging", "EL imaging", "RGB", "Python"], description: "Computer vision pipeline for SolarVulture, the company's drone platform for solar plant inspection — defect detection across infrared, electroluminescence, and visible-light imagery.\nCurated and augmented training data, then trained and validated the CNN models deployed in the field.\nAutomated defect detection and reporting in Python, tuned for inference speed within deployment limits.", links: [] },
    { id: 4, name: "Real-time Driver Detection System", org: "Optima Engineering", period: "2024", stack: ["YOLO", "Faster R-CNN", "Python", "edge deployment"], description: "Vision system behind the company's vehicle recognition products — high-security entry points and on-street parking cameras.\nReal-time driver-presence and steering-wheel detection (YOLO, Faster R-CNN) tuned for low-latency edge inference.\nCustom data labeling and augmentation to hold up across lighting and camera conditions; deployed and tested on edge devices running continuously.", links: [] },
  ],
  clientSites: [
    { id: 1, name: "Sapanca Business Group", url: "https://www.sapancabusinessgroup.com/", tag: "Client website", description: "Corporate site for a cross-border consultancy connecting Ethiopia and Türkiye — education, health, and trade services for students, patients, and investors." },
    { id: 2, name: "ANTSAR Foreign Trade Agency", url: "https://antsartrade.com/", tag: "Client website", description: "Corporate site for a foreign trade agency offering international trade and commerce facilitation services." },
    { id: 3, name: "SmartPark MQTT", url: "https://smartpark-mqtt.vercel.app/", tag: "Personal project", description: "IoT parking system — an MQTT broker, a React dashboard, and a FastAPI bridge tying live sensor data to a real-time occupancy view." },
    { id: 4, name: "Tracker.ME", url: "https://trackerme-two.vercel.app", tag: "Personal project", description: "Personal goal and habit tracker — sign in, set objectives, and log progress toward them over time." },
    { id: 5, name: "UAV Search-and-Rescue Demo", url: "https://uav-sar.vercel.app/", tag: "Research demo", description: "Live front-end for the Hacettepe BAP edge AI research — visualizing thermal UAV search-and-rescue detection." },
    { id: 6, name: "Stakeholder Mapping Tool", url: "https://stakemapper.ramyfied.me/", tag: "Research demo", description: "Live deployment of the AI Stakeholder Mapping Tool — upload policy documents, get back structured stakeholder reports." },
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
    clientSites: Array.isArray(stored.clientSites) ? stored.clientSites : DEFAULT_CONTENT.clientSites,
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
  addItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', item: Omit<T, 'id'>) => T
  updateItem: <T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', id: number, updates: Partial<T>) => void
  deleteItem: (key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', id: number) => void
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

  function addItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Date.now() } as unknown as T
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: [newItem, ...list] })
    return newItem
  }
  function updateItem<T extends { id: number }>(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', id: number, updates: Partial<T>) {
    const list = (content[key] as unknown) as T[]
    save({ ...content, [key]: list.map(i => i.id === id ? { ...i, ...updates } : i) })
  }
  function deleteItem(key: 'blogPosts' | 'filmReviews' | 'researchAreas' | 'books' | 'experiences' | 'projects' | 'clientSites', id: number) {
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

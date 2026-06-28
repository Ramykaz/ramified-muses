import React, { useEffect, useState } from 'react'

interface GHRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  fork: boolean
  pushed_at: string
}

interface FeaturedProject {
  name: string
  org: string
  period: string
  stack: string[]
  description: string
  links: { label: string; href: string }[]
}

const FEATURED: FeaturedProject[] = [
  {
    name: 'AI Stakeholder Mapping Tool',
    org: 'UNDP SDG AI Lab',
    period: '2024–2026',
    stack: ['Django', 'Next.js', 'PostgreSQL', 'pgvector', 'Celery', 'Redis', 'RAG', 'NER'],
    description:
      'Production AI platform for extracting structured stakeholder intelligence from policy documents at scale. Built NER pipelines for entity recognition and deduplication, semantic search with pgvector, RAG-based summarization, and a natural language query interface. The system processes hundreds of policy documents and surfaces structured insights — relationships, affiliations, positions — that would take analysts days to compile manually. Sole developer from architecture through deployment.',
    links: [],
  },
  {
    name: 'Edge AI for UAV Search-and-Rescue',
    org: 'Hacettepe University BAP',
    period: '2026',
    stack: ['TensorRT', 'NVIDIA Jetson Orin Nano', 'YOLO v5–v11', 'RT-DETR', 'RF-DETR', 'PyTorch', 'Python'],
    description:
      'Hardware-aware optimization research for real-time thermal human detection on edge devices. Benchmarked 14 detector architectures (YOLO v5 through v11, RT-DETR, RF-DETR) across 278 experimental configurations on the WiSARD thermal dataset — evaluating four optimization axes: TensorRT PTQ quantization (FP32/FP16/INT8), unstructured pruning, resolution scaling, and Jetson power modes. Key finding: TensorRT FP16 is the single highest-impact optimization; YOLO26s FP16 at 416px is the recommended balanced deployment. Presented at ICHORA 2026, Ankara.',
    links: [
      { label: 'IEEE paper ↗', href: 'https://ieeexplore.ieee.org/document/11537125' },
      { label: 'Google Scholar ↗', href: 'https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en' },
    ],
  },
  {
    name: 'Solar Panel Defect Detection',
    org: 'Oasis Global Energy Technology Software',
    period: '2025',
    stack: ['PyTorch', 'OpenCV', 'CNN', 'IR imaging', 'EL imaging', 'RGB', 'Python'],
    description:
      'End-to-end computer vision pipeline for multi-modal solar panel inspection using drone imagery. Fused infrared, electroluminescence, and RGB data to detect micro-cracks, hotspots, and delamination across large-scale solar installations. Designed data curation and augmentation workflows to handle real-world variation in lighting, altitude, and weather. Built automated reporting pipelines that convert detection outputs into actionable field maintenance reports.',
    links: [],
  },
  {
    name: 'Real-time Driver Detection System',
    org: 'Optima Engineering',
    period: '2024',
    stack: ['YOLO', 'Faster R-CNN', 'Python', 'edge deployment'],
    description:
      'Real-time detection system for driver presence and steering wheel position, optimized for continuous low-latency inference on edge hardware. Developed custom data labeling and augmentation pipelines to handle varied cabin lighting conditions, camera angles, and driver appearances. Deployed and stress-tested on embedded devices — validated for stability in uninterrupted operation over extended periods.',
    links: [],
  },
]

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#888',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
}

const Projects: React.FC = () => {
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('https://api.github.com/users/Ramykaz/repos?sort=pushed&per_page=30')
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json() as Promise<GHRepo[]>
      })
      .then(data => {
        setRepos(
          data
            .filter(r => !r.fork)
            .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        )
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <div className="page page-projects">
      <div className="page-content">

        <h2 className="section-label">featured projects</h2>
        <div className="featured-list">
          {FEATURED.map((proj, i) => (
            <div key={i} className="featured-item">
              <div className="featured-header">
                <div>
                  <span className="featured-name">{proj.name}</span>
                  <span className="featured-org"> — {proj.org} · {proj.period}</span>
                </div>
                {proj.links.length > 0 && (
                  <div className="featured-links">
                    {proj.links.map(l => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="repo-link">
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <p className="featured-desc">{proj.description}</p>
              <div className="featured-stack">
                {proj.stack.map(s => <span key={s} className="stack-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <h2 className="section-label">github repos</h2>
        <div className="repo-list">
          {loading && <p className="gh-status">// fetching repos...</p>}
          {error && <p className="gh-status">// could not reach github — check back later.</p>}
          {!loading && !error && repos.length === 0 && (
            <p className="gh-status">// no public repos found.</p>
          )}
          {repos.map(repo => (
            <div key={repo.id} className="repo-item">
              <div className="repo-top">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-name"
                >
                  {repo.name}
                </a>
                <div className="repo-links">
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      site ↗
                    </a>
                  )}
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-link"
                  >
                    repo ↗
                  </a>
                </div>
              </div>
              {repo.description && (
                <p className="repo-desc">{repo.description}</p>
              )}
              <div className="repo-meta">
                {repo.language && (
                  <span className="repo-lang">
                    <span
                      className="lang-dot"
                      style={{ background: LANG_COLORS[repo.language] ?? '#666' }}
                    />
                    {repo.language}
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="repo-stars">★ {repo.stargazers_count}</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Projects

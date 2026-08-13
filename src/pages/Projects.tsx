import React, { useEffect, useState } from 'react'
import { useContent } from '../hooks/ContentContext'

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
  const { content } = useContent()
  const featured = content.projects ?? []
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reposOpen, setReposOpen] = useState(false)

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
          {featured.map((proj, i) => (
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
              <ul className="bullet-list">
                {proj.description.split('\n').map(line => line.trim()).filter(Boolean).map((line, li) => (
                  <li key={li}>{line}</li>
                ))}
              </ul>
              <div className="featured-stack">
                {proj.stack.map(s => <span key={s} className="stack-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <button
          type="button"
          className="section-label repo-toggle"
          onClick={() => setReposOpen(o => !o)}
          aria-expanded={reposOpen}
        >
          github repos{!loading && !error ? ` (${repos.length})` : ''}
          <span className="repo-toggle-caret">{reposOpen ? '▾' : '▸'}</span>
        </button>

        {reposOpen && (
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
        )}

      </div>
    </div>
  )
}

export default Projects

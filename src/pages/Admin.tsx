import React, { useState, useRef, useEffect } from 'react'
import '../styles/admin.css'
import { useContent, DEFAULT_CONTENT } from '../hooks/ContentContext'
import type { BlogPost, Book, Experience, FeaturedProject, ClientSite } from '../hooks/ContentContext'
import BlockEditor from '../components/BlockEditor'
import type { Block } from '../components/BlockEditor'

const ADMIN_PASSWORD = 'ramified2025'
const ADMIN_SESSION_KEY = 'rm_admin_session_v1'
const SESSION_TTL = 1000 * 60 * 60 * 24

type Tab = 'profile' | 'contact' | 'blog' | 'books' | 'experience' | 'projects' | 'clientSites'
const TABS: { key: Tab; label: string }[] = [
  { key: 'profile',    label: 'Profile' },
  { key: 'contact',   label: 'Contact' },
  { key: 'blog',      label: 'Blog' },
  { key: 'books',     label: 'Books' },
  { key: 'experience',label: 'Experience' },
  { key: 'projects',  label: 'Projects' },
  { key: 'clientSites', label: 'Client Sites' },
]

// ── Small UI helpers ─────────────────────────────────────────────
const F = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="admin-field">
    <label className="admin-label">{label}</label>
    {hint && <p className="admin-hint">{hint}</p>}
    {children}
  </div>
)
const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="admin-input" {...props} />
const Txt = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="admin-textarea" {...props} />
const Sel = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className="admin-input" {...props} />

// ── Image upload helper ──────────────────────────────────────────
async function uploadFile(file: File): Promise<string> {
  const data = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = e => res(e.target?.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  try {
    const resp = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, contentType: file.type, data }),
    })
    if (resp.ok) return ((await resp.json()) as { url: string }).url
  } catch { /* fall through */ }
  return data
}

// ── Shared image field ───────────────────────────────────────────
const ImageField = ({ label, value, onChange, hint, circle }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; circle?: boolean
}) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setBusy(true); onChange(await uploadFile(f)); setBusy(false); e.target.value = ''
  }

  return (
    <F label={label} hint={hint}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {value && <img src={value} alt="preview" className={circle ? 'img-circle' : 'img-rect'} />}
      <div className="img-row">
        <Inp value={value} placeholder="Paste image URL…" onChange={e => onChange(e.target.value)} />
        <button type="button" className="admin-btn secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? '…' : '↑ Upload'}
        </button>
      </div>
    </F>
  )
}

// ── Admin page ───────────────────────────────────────────────────
const Admin: React.FC = () => {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY)
      const t = Number(raw)
      return Number.isFinite(t) && Date.now() - t < SESSION_TTL
    } catch { return false }
  })
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [tab, setTab] = useState<Tab>('profile')
  const [flash, setFlash] = useState('')

  const { content, isLoading, storageMode, updateProfile, updateContact, addItem, updateItem, deleteItem, resetToDefaults } = useContent()
  const [pf, setPf] = useState(content.profile)
  const [cf, setCf] = useState(content.contact)

  // Sync form state once DB data arrives
  useEffect(() => {
    if (storageMode === 'db') { setPf(content.profile); setCf(content.contact) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageMode])

  const toast = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500) }

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuth(true); setPwErr(false)
      localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()))
    } else { setPwErr(true) }
  }
  const logout = () => { localStorage.removeItem(ADMIN_SESSION_KEY); setAuth(false); setPw('') }

  if (!auth) return (
    <div className="page page-admin">
      <div className="page-content">
        <div className="admin-login-box">
          <p className="section-label">Admin</p>
          <h1 className="admin-login-h">Content Panel</h1>
          <p className="admin-login-sub">
            {isLoading ? 'Loading…' : `Storage: ${storageMode === 'db' ? 'database ✓' : 'local fallback'}`}
          </p>
          <Inp
            type="password" placeholder="Password" value={pw} autoFocus
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={`admin-input${pwErr ? ' err' : ''}`}
          />
          {pwErr && <p className="admin-err">Wrong password.</p>}
          <button className="admin-btn primary" onClick={login}>Enter</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page page-admin">
      <div className="page-content admin-wide">
        {/* Header bar */}
        <div className="admin-bar">
          <p className="section-label" style={{ margin: 0 }}>Admin</p>
          <div className="admin-bar-right">
            {flash && <span className="admin-toast">{flash}</span>}
            <span className={`admin-mode ${storageMode === 'db' ? 'mode-db' : 'mode-local'}`}>
              {storageMode === 'db' ? '● db' : '◌ local'}
            </span>
            <button className="admin-btn danger small" onClick={() => {
              if (confirm('Reset ALL content to defaults?')) { resetToDefaults(); toast('Reset to defaults') }
            }}>Reset</button>
            <button className="admin-btn secondary small" onClick={logout}>Lock</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`admin-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="admin-section">
            <ImageField label="Profile Photo" value={pf.image} onChange={v => setPf(f => ({ ...f, image: v }))} circle />
            <F label="Name"><Inp value={pf.name} onChange={e => setPf(f => ({ ...f, name: e.target.value }))} /></F>
            <F label="Subtitle" hint="Shown below your name on the home page">
              <Inp value={pf.subtitle ?? ''} placeholder="ML Engineer · CS Undergrad · Ankara, Turkey" onChange={e => setPf(f => ({ ...f, subtitle: e.target.value }))} />
            </F>
            <F label="Bio — one entry per paragraph">
              {pf.bio.map((para, i) => (
                <div key={i} className="bio-row">
                  <Txt
                    rows={2} value={para}
                    onChange={e => { const b = [...pf.bio]; b[i] = e.target.value; setPf(f => ({ ...f, bio: b })) }}
                    style={{ fontFamily: 'var(--serif)', fontSize: '15px' }}
                  />
                  <button className="admin-btn danger small" onClick={() => setPf(f => ({ ...f, bio: f.bio.filter((_, j) => j !== i) }))}>×</button>
                </div>
              ))}
              <button className="admin-btn secondary small" style={{ marginTop: '0.4rem' }}
                onClick={() => setPf(f => ({ ...f, bio: [...f.bio, ''] }))}>+ Add paragraph</button>
            </F>
            <F label="Current Work"><Txt rows={2} value={pf.currentWork} onChange={e => setPf(f => ({ ...f, currentWork: e.target.value }))} /></F>
            <F label="Interests" hint="Shown in the meta section on the home page">
              <Inp value={pf.interests ?? ''} placeholder="AI systems · edge computing · computer vision…" onChange={e => setPf(f => ({ ...f, interests: e.target.value }))} />
            </F>
            <F label="Languages" hint="Shown in the meta section on the home page">
              <Inp value={pf.languages ?? ''} placeholder="Amharic (native) · English (fluent)…" onChange={e => setPf(f => ({ ...f, languages: e.target.value }))} />
            </F>
            <F label="Studying" hint="Shown in the meta section on the home page">
              <Inp value={pf.studying ?? ''} placeholder="B.Sc. Computer Engineering, … (2022–2026)" onChange={e => setPf(f => ({ ...f, studying: e.target.value }))} />
            </F>
            <F label="Experience page footer" hint="Education, schools, awards — one line per entry. End a line with [text] to show it as a badge. Leave empty to hide the footer.">
              <Txt
                rows={4}
                value={pf.experienceFooter ?? DEFAULT_CONTENT.profile.experienceFooter ?? ''}
                placeholder="B.Sc. Computer Engineering · Hacettepe University"
                onChange={e => setPf(f => ({ ...f, experienceFooter: e.target.value }))}
              />
            </F>
            <F label="Home page links" hint="All links shown below the bio. Label and URL for each.">
              {(pf.links ?? []).map((link, i) => (
                <div key={i} className="bio-row">
                  <Inp
                    value={link.label}
                    placeholder="Label (e.g. github ↗)"
                    onChange={e => { const ls = [...(pf.links ?? [])]; ls[i] = { ...ls[i], label: e.target.value }; setPf(f => ({ ...f, links: ls })) }}
                    style={{ flex: '0 0 30%' }}
                  />
                  <Inp
                    value={link.href}
                    placeholder="https://… or mailto:…"
                    onChange={e => { const ls = [...(pf.links ?? [])]; ls[i] = { ...ls[i], href: e.target.value }; setPf(f => ({ ...f, links: ls })) }}
                  />
                  <button className="admin-btn danger small" onClick={() => setPf(f => ({ ...f, links: (f.links ?? []).filter((_, j) => j !== i) }))}>×</button>
                </div>
              ))}
              <button className="admin-btn secondary small" style={{ marginTop: '0.4rem' }}
                onClick={() => setPf(f => ({ ...f, links: [...(f.links ?? []), { label: '', href: '' }] }))}>+ Add link</button>
            </F>
            <F label="Quote"><Inp value={pf.quote} onChange={e => setPf(f => ({ ...f, quote: e.target.value }))} /></F>
            <F label="Quote Author"><Inp value={pf.quoteAuthor} onChange={e => setPf(f => ({ ...f, quoteAuthor: e.target.value }))} /></F>
            <div className="admin-actions">
              <button className="admin-btn primary" onClick={() => { updateProfile(pf); toast('Profile saved') }}>Save Profile</button>
            </div>
          </div>
        )}

        {/* ── Contact ── */}
        {tab === 'contact' && (
          <div className="admin-section">
            <F label="Intro text"><Txt rows={3} value={cf.intro} onChange={e => setCf(c => ({ ...c, intro: e.target.value }))} /></F>
            <div className="admin-two-col">
              <F label="Email"><Inp value={cf.email} onChange={e => setCf(c => ({ ...c, email: e.target.value }))} /></F>
              <F label="Phone"><Inp value={cf.phone} onChange={e => setCf(c => ({ ...c, phone: e.target.value }))} /></F>
              <F label="Location"><Inp value={cf.location} onChange={e => setCf(c => ({ ...c, location: e.target.value }))} /></F>
            </div>
            <F label="LinkedIn URL"><Inp value={cf.linkedin} onChange={e => setCf(c => ({ ...c, linkedin: e.target.value }))} /></F>
            <F label="GitHub URL"><Inp value={cf.github} onChange={e => setCf(c => ({ ...c, github: e.target.value }))} /></F>
            <F label="CV URL" hint="Upload to Google Drive, set sharing to Anyone with link, paste URL here.">
              <Inp value={cf.cvUrl ?? ''} placeholder="https://drive.google.com/…" onChange={e => setCf(c => ({ ...c, cvUrl: e.target.value }))} />
            </F>
            <div className="admin-actions">
              <button className="admin-btn primary" onClick={() => { updateContact(cf); toast('Contact saved') }}>Save Contact</button>
            </div>
          </div>
        )}

        {/* ── Blog ── */}
        {tab === 'blog' && (
          <div className="admin-section">
            <BlogEditor
              posts={content.blogPosts}
              onAdd={p => { addItem<BlogPost>('blogPosts', p); toast('Post published') }}
              onUpdate={(id, u) => { updateItem<BlogPost>('blogPosts', id, u); toast('Saved') }}
              onDelete={id => { deleteItem('blogPosts', id); toast('Deleted') }}
            />
          </div>
        )}

        {/* ── Books ── */}
        {tab === 'books' && (
          <div className="admin-section">
            <BookEditor
              books={content.books}
              onAdd={b => { addItem<Book>('books', b); toast('Book added') }}
              onUpdate={(id, u) => { updateItem<Book>('books', id, u); toast('Saved') }}
              onDelete={id => { deleteItem('books', id); toast('Deleted') }}
            />
          </div>
        )}

        {/* ── Experience ── */}
        {tab === 'experience' && (
          <div className="admin-section">
            <ExperienceEditor
              experiences={content.experiences}
              onAdd={e => { addItem<Experience>('experiences', e); toast('Entry added') }}
              onUpdate={(id, u) => { updateItem<Experience>('experiences', id, u); toast('Saved') }}
              onDelete={id => { deleteItem('experiences', id); toast('Deleted') }}
            />
          </div>
        )}

        {/* ── Projects ── */}
        {tab === 'projects' && (
          <div className="admin-section">
            <ProjectEditor
              projects={content.projects ?? []}
              onAdd={p => { addItem<FeaturedProject>('projects', p); toast('Project added') }}
              onUpdate={(id, u) => { updateItem<FeaturedProject>('projects', id, u); toast('Saved') }}
              onDelete={id => { deleteItem('projects', id); toast('Deleted') }}
            />
          </div>
        )}

        {/* ── Client Sites ── */}
        {tab === 'clientSites' && (
          <div className="admin-section">
            <ClientSiteEditor
              sites={content.clientSites ?? []}
              onAdd={s => { addItem<ClientSite>('clientSites', s); toast('Site added') }}
              onUpdate={(id, u) => { updateItem<ClientSite>('clientSites', id, u); toast('Saved') }}
              onDelete={id => { deleteItem('clientSites', id); toast('Deleted') }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Generic list shell ────────────────────────────────────────────
function ListShell<T extends { id: number }>({
  items, addLabel, newLabel, renderSummary, renderForm, onDelete, onAdd, onUpdate, blank,
}: {
  items: T[]; addLabel: string; newLabel: string
  renderSummary: (item: T) => React.ReactNode
  renderForm: (draft: T, ch: (u: Partial<T>) => void) => React.ReactNode
  onDelete: (id: number) => void
  onAdd: (item: Omit<T, 'id'>) => void
  onUpdate: (id: number, u: Partial<T>) => void
  blank: () => Omit<T, 'id'>
}) {
  const [draft, setDraft] = useState<T | null>(null)
  const [isNew, setIsNew] = useState(false)

  const open = (item?: T) => { setDraft(item ? { ...item } : { ...blank(), id: -1 } as unknown as T); setIsNew(!item) }
  const close = () => { setDraft(null); setIsNew(false) }
  const save = () => {
    if (!draft) return
    isNew ? onAdd(draft as unknown as Omit<T, 'id'>) : onUpdate(draft.id, draft)
    close()
  }
  const ch = (u: Partial<T>) => setDraft(d => d ? { ...d, ...u } : d)

  if (draft) return (
    <div className="item-editor">
      <div className="item-editor-head">
        <span className="admin-label" style={{ margin: 0 }}>{isNew ? newLabel : 'Edit entry'}</span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="admin-btn primary" onClick={save}>{isNew ? 'Publish' : 'Save'}</button>
          <button className="admin-btn secondary" onClick={close}>Cancel</button>
        </div>
      </div>
      {renderForm(draft, ch)}
    </div>
  )

  return (
    <>
      <button className="admin-btn primary" onClick={() => open()} style={{ marginBottom: '1.2rem' }}>
        + {addLabel}
      </button>
      {items.length === 0 && <p className="admin-empty">No entries yet.</p>}
      <div className="admin-list">
        {items.map(item => (
          <div key={item.id} className="admin-list-item">
            <div className="admin-list-info">{renderSummary(item)}</div>
            <div className="admin-list-actions">
              <button className="admin-btn secondary small" onClick={() => open(item)}>Edit</button>
              <button className="admin-btn danger small" onClick={() => { if (confirm('Delete?')) onDelete(item.id) }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Blog Editor ───────────────────────────────────────────────────
const BlogEditor: React.FC<{
  posts: BlogPost[]
  onAdd: (p: Omit<BlogPost, 'id'>) => void
  onUpdate: (id: number, u: Partial<BlogPost>) => void
  onDelete: (id: number) => void
}> = ({ posts, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={posts}
    addLabel="New Post"
    newLabel="New blog post"
    blank={() => ({
      title: '', date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      excerpt: '', fullContent: '', blocks: [] as Block[],
      tags: [], image: '',
      stylePreset: 'editorial' as const, bodyFont: 'serif' as const, titleFont: 'serif' as const,
    })}
    renderSummary={p => (
      <>
        <strong>{p.title || '(untitled)'}</strong>
        <span className="list-meta">{p.date}{p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}</span>
      </>
    )}
    renderForm={(d, ch) => (
      <>
        {/* Writing options bar */}
        <div className="writing-bar">
          <WritingOpts label="TITLE FONT" value={d.titleFont ?? 'serif'} onChange={v => ch({ titleFont: v as BlogPost['titleFont'] })}
            opts={[{ v: 'serif', label: 'Serif' }, { v: 'sans', label: 'Mono' }]} />
          <WritingOpts label="BODY FONT" value={d.bodyFont ?? 'serif'} onChange={v => ch({ bodyFont: v as BlogPost['bodyFont'] })}
            opts={[{ v: 'serif', label: 'Serif' }, { v: 'sans', label: 'Sans' }, { v: 'mono', label: 'Mono' }]} />
          <WritingOpts label="STYLE" value={d.stylePreset ?? 'editorial'} onChange={v => ch({ stylePreset: v as BlogPost['stylePreset'] })}
            opts={[{ v: 'editorial', label: 'Editorial' }, { v: 'minimal', label: 'Minimal' }, { v: 'cinematic', label: 'Cinematic' }]} />
        </div>

        <F label="Title">
          <input
            className="admin-input title-input"
            style={{ fontFamily: d.titleFont === 'sans' ? 'var(--mono)' : 'var(--serif)' }}
            value={d.title ?? ''} placeholder="Post title…"
            onChange={e => ch({ title: e.target.value })}
          />
        </F>
        <div className="admin-two-col">
          <F label="Date"><Inp value={d.date ?? ''} placeholder="July 2026" onChange={e => ch({ date: e.target.value })} /></F>
          <F label="Tags — comma separated"><Inp value={(d.tags ?? []).join(', ')} placeholder="AI, Research"
            onChange={e => ch({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} /></F>
        </div>
        <F label="Excerpt"><Txt rows={2} value={d.excerpt ?? ''} placeholder="Short teaser shown on the blog listing…"
          onChange={e => ch({ excerpt: e.target.value })} /></F>
        <ImageField label="Cover Image" value={d.image ?? ''} onChange={v => ch({ image: v })} />
        <F label="Content">
          <BlockEditor blocks={d.blocks ?? []} onChange={blocks => ch({ blocks })} />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Segmented writing option control ─────────────────────────────
function WritingOpts({ label, value, onChange, opts }: {
  label: string; value: string; onChange: (v: string) => void
  opts: { v: string; label: string }[]
}) {
  return (
    <div className="wopt-group">
      <span className="wopt-label">{label}</span>
      <div className="wopt-btns">
        {opts.map(o => (
          <button key={o.v} className={`wopt-btn${value === o.v ? ' active' : ''}`} onClick={() => onChange(o.v)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Book Editor ───────────────────────────────────────────────────
const BookEditor: React.FC<{
  books: Book[]
  onAdd: (b: Omit<Book, 'id'>) => void
  onUpdate: (id: number, u: Partial<Book>) => void
  onDelete: (id: number) => void
}> = ({ books, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={books}
    addLabel="New Book"
    newLabel="Add book"
    blank={() => ({ title: '', author: '', status: 'Want to Read' as const, notes: '', coverImage: '', date: '' })}
    renderSummary={b => (
      <>
        <strong>{b.title || '(untitled)'}</strong>
        <span className="list-meta">{b.author} · {b.status}{b.date ? ` · ${b.date}` : ''}</span>
      </>
    )}
    renderForm={(d, ch) => (
      <>
        <div className="admin-two-col">
          <F label="Title"><Inp value={d.title ?? ''} onChange={e => ch({ title: e.target.value })} /></F>
          <F label="Author"><Inp value={d.author ?? ''} onChange={e => ch({ author: e.target.value })} /></F>
        </div>
        <div className="admin-two-col">
          <F label="Status">
            <Sel value={d.status} onChange={e => ch({ status: e.target.value as Book['status'] })}>
              {(['Reading', 'Finished', 'Reference', 'Want to Read'] as const).map(s => <option key={s} value={s}>{s}</option>)}
            </Sel>
          </F>
          <F label="Month" hint="Used to group the reading list chronologically">
            <Inp value={d.date ?? ''} placeholder="July 2026" onChange={e => ch({ date: e.target.value })} />
          </F>
        </div>
        <ImageField label="Cover Image" value={d.coverImage ?? ''} onChange={v => ch({ coverImage: v })}
          hint="Book cover — upload or paste URL" />
        <F label="Notes"><Txt rows={4} value={d.notes ?? ''} placeholder="Your thoughts on this book…"
          onChange={e => ch({ notes: e.target.value })} style={{ fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: '1.7' }} /></F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Experience Editor ─────────────────────────────────────────────
const ExperienceEditor: React.FC<{
  experiences: Experience[]
  onAdd: (e: Omit<Experience, 'id'>) => void
  onUpdate: (id: number, u: Partial<Experience>) => void
  onDelete: (id: number) => void
}> = ({ experiences, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={experiences}
    addLabel="New Entry"
    newLabel="New experience"
    blank={() => ({ title: '', company: '', period: '', details: '', blocks: [] as Block[], type: 'work' as const, image: '' })}
    renderSummary={e => (
      <>
        <strong>{e.title || '(untitled)'}</strong>
        <span className="list-meta">{e.company} · {e.period}</span>
      </>
    )}
    renderForm={(d, ch) => (
      <>
        <div className="admin-two-col">
          <F label="Title / Role"><Inp value={d.title ?? ''} onChange={e => ch({ title: e.target.value })} /></F>
          <F label="Company"><Inp value={d.company ?? ''} onChange={e => ch({ company: e.target.value })} /></F>
        </div>
        <div className="admin-two-col">
          <F label="Period"><Inp value={d.period ?? ''} placeholder="Jan 2024 – Present" onChange={e => ch({ period: e.target.value })} /></F>
          <F label="Type">
            <Sel value={d.type} onChange={e => ch({ type: e.target.value as 'work' | 'volunteer' })}>
              <option value="work">Work</option>
              <option value="volunteer">Volunteer</option>
            </Sel>
          </F>
        </div>
        <ImageField label="Company Logo" value={d.image ?? ''} onChange={v => ch({ image: v })}
          hint="Upload SVG/PNG logo or paste a URL" />
        <F label="Description" hint="One bullet point per line — each line renders as its own bullet on the site.">
          <Txt rows={6} value={d.details ?? ''}
            onChange={e => ch({ details: e.target.value })}
            style={{ fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: '1.7' }}
            placeholder={'Led development of…\nBuilt a pipeline that…\nReduced latency by…'} />
        </F>
        <F label="Extended content" hint="Optional — add images, code snippets, or detailed sections">
          <BlockEditor blocks={d.blocks ?? []} onChange={blocks => ch({ blocks })} />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Project Editor ────────────────────────────────────────────────
const ProjectEditor: React.FC<{
  projects: FeaturedProject[]
  onAdd: (p: Omit<FeaturedProject, 'id'>) => void
  onUpdate: (id: number, u: Partial<FeaturedProject>) => void
  onDelete: (id: number) => void
}> = ({ projects, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={projects}
    addLabel="New Project"
    newLabel="New featured project"
    blank={() => ({ name: '', org: '', period: '', description: '', stack: [], links: [] })}
    renderSummary={p => (
      <>
        <strong>{p.name || '(untitled)'}</strong>
        <span className="list-meta">{p.org} · {p.period}</span>
      </>
    )}
    renderForm={(d, ch) => (
      <>
        <div className="admin-two-col">
          <F label="Project Name"><Inp value={d.name ?? ''} placeholder="AI Stakeholder Mapping Tool" onChange={e => ch({ name: e.target.value })} /></F>
          <F label="Organization"><Inp value={d.org ?? ''} placeholder="UNDP SDG AI Lab" onChange={e => ch({ org: e.target.value })} /></F>
        </div>
        <F label="Period"><Inp value={d.period ?? ''} placeholder="2024–2026" onChange={e => ch({ period: e.target.value })} /></F>
        <F label="Description" hint="One bullet point per line — each line renders as its own bullet on the site.">
          <Txt rows={6} value={d.description ?? ''}
            onChange={e => ch({ description: e.target.value })}
            style={{ fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: '1.7' }}
            placeholder={'Built…\nDesigned…\nShipped…'} />
        </F>
        <F label="Tech stack — comma separated">
          <Inp value={(d.stack ?? []).join(', ')} placeholder="Python, PyTorch, Docker"
            onChange={e => ch({ stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </F>
        <F label="Links" hint="Optional external links — paper, demo, repo, etc.">
          {(d.links ?? []).map((link, i) => (
            <div key={i} className="bio-row">
              <Inp
                value={link.label}
                placeholder="Label (e.g. GitHub ↗)"
                onChange={e => { const ls = [...(d.links ?? [])]; ls[i] = { ...ls[i], label: e.target.value }; ch({ links: ls }) }}
                style={{ flex: '0 0 30%' }}
              />
              <Inp
                value={link.href}
                placeholder="https://…"
                onChange={e => { const ls = [...(d.links ?? [])]; ls[i] = { ...ls[i], href: e.target.value }; ch({ links: ls }) }}
              />
              <button className="admin-btn danger small" onClick={() => ch({ links: (d.links ?? []).filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button className="admin-btn secondary small" style={{ marginTop: '0.4rem' }}
            onClick={() => ch({ links: [...(d.links ?? []), { label: '', href: '' }] })}>+ Add link</button>
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Client Site Editor ───────────────────────────────────────────
const ClientSiteEditor: React.FC<{
  sites: ClientSite[]
  onAdd: (s: Omit<ClientSite, 'id'>) => void
  onUpdate: (id: number, u: Partial<ClientSite>) => void
  onDelete: (id: number) => void
}> = ({ sites, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={sites}
    addLabel="New Site"
    newLabel="New client site"
    blank={() => ({ name: '', url: '', description: '', tag: 'Client website' })}
    renderSummary={s => (
      <>
        <strong>{s.name || '(untitled)'}</strong>
        <span className="list-meta">{s.tag} · {s.url}</span>
      </>
    )}
    renderForm={(d, ch) => (
      <>
        <div className="admin-two-col">
          <F label="Site Name"><Inp value={d.name ?? ''} placeholder="Sapanca Business Group" onChange={e => ch({ name: e.target.value })} /></F>
          <F label="Tag" hint="Short label shown next to the name"><Inp value={d.tag ?? ''} placeholder="Client website" onChange={e => ch({ tag: e.target.value })} /></F>
        </div>
        <F label="URL"><Inp value={d.url ?? ''} placeholder="https://…" onChange={e => ch({ url: e.target.value })} /></F>
        <F label="Description">
          <Txt rows={3} value={d.description ?? ''}
            onChange={e => ch({ description: e.target.value })}
            style={{ fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: '1.6' }}
            placeholder="One sentence describing what the site is for…" />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

export default Admin

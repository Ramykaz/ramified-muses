import React, { useState } from 'react'
import { useContent } from '../hooks/useContent'
import type { BlogPost, FilmReview, ResearchArea, Book, Experience } from '../hooks/useContent'
import BlockEditor from '../components/BlockEditor'
import type { Block } from '../components/BlockEditor'

const ADMIN_PASSWORD = 'ramified2025'
type Tab = 'profile' | 'contact' | 'blog' | 'films' | 'research' | 'books' | 'experience'
const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' }, { key: 'contact', label: 'Contact' },
  { key: 'blog', label: 'Blog' }, { key: 'films', label: 'Films' },
  { key: 'research', label: 'Research' }, { key: 'books', label: 'Books' },
  { key: 'experience', label: 'Experience' },
]

const F = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="admin-field">
    <label className="admin-label">{label}</label>
    {hint && <p style={{ fontSize: '0.72rem', opacity: 0.55, marginBottom: '0.4rem' }}>{hint}</p>}
    {children}
  </div>
)
const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="admin-input" {...props} />
const Txt = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="admin-textarea" {...props} />

function useImageUpload(onImage: (url: string) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}

const ProfileImageField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const handle = useImageUpload(onChange)
  return (
    <F label="Profile Photo">
      <div className="image-upload-area">
        {value && <img src={value} alt="preview" className="profile-preview" />}
        <div>
          <input type="file" accept="image/*" id="pf-img" style={{ display: 'none' }} onChange={handle} />
          <label htmlFor="pf-img" className="admin-btn secondary" style={{ cursor: 'pointer' }}>Choose Image</label>
          <p style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: '0.3rem' }}>Stored in browser localStorage.</p>
        </div>
      </div>
    </F>
  )
}

// ── Main Admin ─────────────────────────────────────────────────
const Admin: React.FC = () => {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [tab, setTab] = useState<Tab>('profile')
  const [flashMsg, setFlashMsg] = useState('')

  const { content, updateProfile, updateContact, addItem, updateItem, deleteItem, resetToDefaults } = useContent()
  const [pf, setPf] = useState(content?.profile)
  const [cf, setCf] = useState(content?.contact)

  const toast = (msg: string) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(''), 2500) }
  const handleLogin = () => { if (pw === ADMIN_PASSWORD) { setAuth(true); setPwErr(false) } else setPwErr(true) }

  if (!auth) return (
    <div className="notebook-page page-admin">
      <div className="content-wrapper">
        <div className="admin-login">
          <h1 className="section-title">Admin</h1>
          <p style={{ opacity: 0.6 }}>Enter password to manage content.</p>
          <Inp type="password" placeholder="Password" value={pw}
            onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className={`admin-input${pwErr ? ' input-error' : ''}`} autoFocus />
          {pwErr && <p className="error-msg">Incorrect password.</p>}
          <button className="admin-btn primary" onClick={handleLogin}>Enter</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="notebook-page page-admin">
      <div className="content-wrapper">
        <div className="admin-header">
          <h1 className="section-title">Admin Panel</h1>
          {flashMsg && <span className="save-badge">{flashMsg}</span>}
          <button className="admin-btn danger small" style={{ marginLeft: 'auto' }}
            onClick={() => { if (confirm('Reset ALL content to defaults?')) { resetToDefaults(); toast('Reset!') } }}>
            Reset Defaults
          </button>
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`admin-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {tab === 'profile' && pf && (
          <div className="admin-section">
            <ProfileImageField value={pf.image} onChange={v => setPf(f => f ? { ...f, image: v } : f)} />
            <F label="Name"><Inp value={pf.name} onChange={e => setPf(f => f ? { ...f, name: e.target.value } : f)} /></F>
            <F label="Bio Paragraphs">
              {pf.bio.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Txt rows={2} value={p} onChange={e => { const b = [...pf.bio]; b[i] = e.target.value; setPf(f => f ? { ...f, bio: b } : f) }} />
                  <button className="admin-btn danger small" onClick={() => setPf(f => f ? { ...f, bio: f.bio.filter((_, j) => j !== i) } : f)}>×</button>
                </div>
              ))}
              <button className="admin-btn secondary small" onClick={() => setPf(f => f ? { ...f, bio: [...f.bio, ''] } : f)}>+ Add Paragraph</button>
            </F>
            <F label="Quote"><Inp value={pf.quote} onChange={e => setPf(f => f ? { ...f, quote: e.target.value } : f)} /></F>
            <F label="Quote Author"><Inp value={pf.quoteAuthor} onChange={e => setPf(f => f ? { ...f, quoteAuthor: e.target.value } : f)} /></F>
            <F label="Current Work"><Txt rows={2} value={pf.currentWork} onChange={e => setPf(f => f ? { ...f, currentWork: e.target.value } : f)} /></F>
            <div className="admin-actions">
              <button className="admin-btn primary" onClick={() => { updateProfile(pf); toast('Profile saved!') }}>Save Profile</button>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {tab === 'contact' && cf && (
          <div className="admin-section">
            <F label="Intro Text"><Txt rows={3} value={cf.intro} onChange={e => setCf(c => c ? { ...c, intro: e.target.value } : c)} /></F>
            <F label="Email"><Inp value={cf.email} onChange={e => setCf(c => c ? { ...c, email: e.target.value } : c)} /></F>
            <F label="Phone"><Inp value={cf.phone} onChange={e => setCf(c => c ? { ...c, phone: e.target.value } : c)} /></F>
            <F label="Location"><Inp value={cf.location} onChange={e => setCf(c => c ? { ...c, location: e.target.value } : c)} /></F>
            <F label="LinkedIn URL"><Inp value={cf.linkedin} onChange={e => setCf(c => c ? { ...c, linkedin: e.target.value } : c)} /></F>
            <F label="GitHub URL"><Inp value={cf.github} onChange={e => setCf(c => c ? { ...c, github: e.target.value } : c)} /></F>
            <F label="CV Link" hint="Upload your CV to Google Drive, set sharing to 'Anyone with the link', paste the URL here.">
              <Inp value={cf.cvUrl || ''} placeholder="https://drive.google.com/..." onChange={e => setCf(c => c ? { ...c, cvUrl: e.target.value } : c)} />
            </F>
            <div className="admin-actions">
              <button className="admin-btn primary" onClick={() => { updateContact(cf); toast('Contact saved!') }}>Save Contact</button>
            </div>
          </div>
        )}

        {/* ── BLOG ── */}
        {tab === 'blog' && (
          <div className="admin-section">
            <BlogEditor posts={content?.blogPosts ?? []}
              onAdd={p => { addItem<BlogPost>('blogPosts', p); toast('Post published!') }}
              onUpdate={(id, u) => { updateItem<BlogPost>('blogPosts', id, u); toast('Saved!') }}
              onDelete={id => { deleteItem<BlogPost>('blogPosts', id); toast('Deleted.') }}
            />
          </div>
        )}

        {/* ── FILMS ── */}
        {tab === 'films' && (
          <div className="admin-section">
            <FilmEditor reviews={content?.filmReviews ?? []}
              onAdd={r => { addItem<FilmReview>('filmReviews', r); toast('Review added!') }}
              onUpdate={(id, u) => { updateItem<FilmReview>('filmReviews', id, u); toast('Saved!') }}
              onDelete={id => { deleteItem<FilmReview>('filmReviews', id); toast('Deleted.') }}
            />
          </div>
        )}

        {/* ── RESEARCH ── */}
        {tab === 'research' && (
          <div className="admin-section">
            <ResearchEditor areas={content?.researchAreas ?? []}
              onAdd={a => { addItem<ResearchArea>('researchAreas', a); toast('Added!') }}
              onUpdate={(id, u) => { updateItem<ResearchArea>('researchAreas', id, u); toast('Saved!') }}
              onDelete={id => { deleteItem<ResearchArea>('researchAreas', id); toast('Deleted.') }}
            />
          </div>
        )}

        {/* ── BOOKS ── */}
        {tab === 'books' && (
          <div className="admin-section">
            <BookEditor books={content?.books ?? []}
              onAdd={b => { addItem<Book>('books', b); toast('Book added!') }}
              onUpdate={(id, u) => { updateItem<Book>('books', id, u); toast('Saved!') }}
              onDelete={id => { deleteItem<Book>('books', id); toast('Deleted.') }}
            />
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {tab === 'experience' && (
          <div className="admin-section">
            <ExperienceEditor experiences={content?.experiences ?? []}
              onAdd={e => { addItem<Experience>('experiences', e); toast('Added!') }}
              onUpdate={(id, u) => { updateItem<Experience>('experiences', id, u); toast('Saved!') }}
              onDelete={id => { deleteItem<Experience>('experiences', id); toast('Deleted.') }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared list shell ──────────────────────────────────────────
function ListShell<T extends { id: number }>({
  items, label, newLabel, renderSummary, renderForm, onDelete,
  onAdd, onUpdate, blankItem
}: {
  items: T[]; label: string; newLabel: string
  renderSummary: (item: T) => React.ReactNode
  renderForm: (draft: T, onChange: (u: Partial<T>) => void, isNew: boolean) => React.ReactNode
  onDelete: (id: number) => void
  onAdd: (item: Omit<T, 'id'>) => void
  onUpdate: (id: number, u: Partial<T>) => void
  blankItem: () => Omit<T, 'id'>
}) {
  const [draft, setDraft] = useState<T | null>(null)
  const [isNew, setIsNew] = useState(false)

  const startNew = () => { setDraft({ ...blankItem(), id: -1 } as T); setIsNew(true) }
  const startEdit = (item: T) => { setDraft({ ...item }); setIsNew(false) }
  const cancel = () => { setDraft(null); setIsNew(false) }
  const save = () => {
    if (!draft) return
    if (isNew) onAdd(draft as Omit<T, 'id'>)
    else onUpdate(draft.id, draft)
    cancel()
  }
  const change = (u: Partial<T>) => setDraft(d => d ? { ...d, ...u } : d)

  if (draft) return (
    <div className="post-editor">
      <p className="admin-sublabel">{isNew ? newLabel : `Edit: ${(draft as any).title || (draft as any).name || ''}`}</p>
      {renderForm(draft, change, isNew)}
      <div className="admin-actions">
        <button className="admin-btn primary" onClick={save}>{isNew ? 'Publish' : 'Save Changes'}</button>
        <button className="admin-btn secondary" onClick={cancel}>Cancel</button>
      </div>
    </div>
  )

  return (
    <>
      <button className="admin-btn primary" onClick={startNew} style={{ marginBottom: '1rem' }}>+ {label}</button>
      {items.length === 0 && <p style={{ opacity: 0.5 }}>No entries yet.</p>}
      <div className="admin-post-list">
        {items.map(item => (
          <div key={item.id} className="admin-post-item">
            <div className="admin-post-info">{renderSummary(item)}</div>
            <div className="admin-post-actions">
              <button className="admin-btn secondary small" onClick={() => startEdit(item)}>Edit</button>
              <button className="admin-btn danger small" onClick={() => { if (confirm('Delete?')) onDelete(item.id) }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Blog Editor ────────────────────────────────────────────────
const BlogEditor: React.FC<{ posts: BlogPost[]; onAdd: (p: Omit<BlogPost,'id'>) => void; onUpdate: (id:number, u:Partial<BlogPost>) => void; onDelete: (id:number) => void }> = ({ posts, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={posts} label="New Post" newLabel="New Blog Post"
    blankItem={() => ({ title: '', date: new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}), excerpt: '', fullContent: '', blocks: [], tags: [], image: '' })}
    renderSummary={p => (<><strong>{p.title || '(untitled)'}</strong><span className="admin-post-date">{p.date}</span></>)}
    renderForm={(d, ch) => (
      <>
        <F label="Title"><Inp value={d.title||''} placeholder="Post title..." onChange={e => ch({title:e.target.value} as any)} /></F>
        <F label="Date"><Inp value={d.date||''} placeholder="March 2025" onChange={e => ch({date:e.target.value} as any)} /></F>
        <F label="Excerpt (shown on list)"><Txt rows={2} value={d.excerpt||''} placeholder="Short teaser..." onChange={e => ch({excerpt:e.target.value} as any)} /></F>
        <F label="Tags (comma-separated)"><Inp value={(d.tags||[]).join(', ')} placeholder="AI, Research" onChange={e => ch({tags:e.target.value.split(',').map((t:string)=>t.trim()).filter(Boolean)} as any)} /></F>
        <F label="Content" hint="Add paragraphs, headings, quotes, and images in any order. Use the 🖼 button to insert images between paragraphs.">
          <BlockEditor blocks={d.blocks || []} onChange={blocks => ch({blocks} as any)} />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Film Editor ────────────────────────────────────────────────
const FilmEditor: React.FC<{ reviews: FilmReview[]; onAdd: (r: Omit<FilmReview,'id'>) => void; onUpdate: (id:number, u:Partial<FilmReview>) => void; onDelete: (id:number) => void }> = ({ reviews, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={reviews} label="New Review" newLabel="New Film Review"
    blankItem={() => ({ title: '', director: '', year: '', excerpt: '', fullReview: '', blocks: [], rating: '', image: '' })}
    renderSummary={r => (<><strong>{r.title||'(untitled)'} {r.year&&`(${r.year})`}</strong><span className="admin-post-date">{r.director}</span></>)}
    renderForm={(d, ch) => (
      <>
        <F label="Title"><Inp value={d.title||''} onChange={e => ch({title:e.target.value} as any)} /></F>
        <F label="Director"><Inp value={d.director||''} onChange={e => ch({director:e.target.value} as any)} /></F>
        <F label="Year"><Inp value={d.year||''} placeholder="2024" onChange={e => ch({year:e.target.value} as any)} /></F>
        <F label="Rating"><Inp value={d.rating||''} placeholder="★★★★☆" onChange={e => ch({rating:e.target.value} as any)} /></F>
        <F label="Excerpt"><Txt rows={2} value={d.excerpt||''} onChange={e => ch({excerpt:e.target.value} as any)} /></F>
        <F label="Review Content" hint="Add your full review with images, quotes, and headings.">
          <BlockEditor blocks={d.blocks || []} onChange={blocks => ch({blocks} as any)} />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Research Editor ────────────────────────────────────────────
const ResearchEditor: React.FC<{ areas: ResearchArea[]; onAdd: (a: Omit<ResearchArea,'id'>) => void; onUpdate: (id:number, u:Partial<ResearchArea>) => void; onDelete: (id:number) => void }> = ({ areas, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={areas} label="New Area" newLabel="New Research Area"
    blankItem={() => ({ title: '', excerpt: '', details: '', blocks: [], tags: [], image: '' })}
    renderSummary={a => (<><strong>{a.title||'(untitled)'}</strong></>)}
    renderForm={(d, ch) => (
      <>
        <F label="Title"><Inp value={d.title||''} onChange={e => ch({title:e.target.value} as any)} /></F>
        <F label="Excerpt"><Txt rows={2} value={d.excerpt||''} onChange={e => ch({excerpt:e.target.value} as any)} /></F>
        <F label="Tags (comma-separated)"><Inp value={(d.tags||[]).join(', ')} onChange={e => ch({tags:e.target.value.split(',').map((t:string)=>t.trim()).filter(Boolean)} as any)} /></F>
        <F label="Content" hint="Write your research details with inline images and structured sections.">
          <BlockEditor blocks={d.blocks || []} onChange={blocks => ch({blocks} as any)} />
        </F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Book Editor ────────────────────────────────────────────────
const BookEditor: React.FC<{ books: Book[]; onAdd: (b: Omit<Book,'id'>) => void; onUpdate: (id:number, u:Partial<Book>) => void; onDelete: (id:number) => void }> = ({ books, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={books} label="New Book" newLabel="New Book"
    blankItem={() => ({ title: '', author: '', status: 'Want to Read' as const, notes: '', coverImage: '' })}
    renderSummary={b => (<><strong>{b.title||'(untitled)'}</strong><span className="admin-post-date">{b.author} · {b.status}</span></>)}
    renderForm={(d, ch) => (
      <>
        <F label="Title"><Inp value={d.title||''} onChange={e => ch({title:e.target.value} as any)} /></F>
        <F label="Author"><Inp value={d.author||''} onChange={e => ch({author:e.target.value} as any)} /></F>
        <F label="Status">
          <select className="admin-input" value={d.status} onChange={e => ch({status:e.target.value as Book['status']} as any)}>
            {(['Reading','Finished','Reference','Want to Read'] as const).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </F>
        <F label="Notes"><Txt rows={4} value={d.notes||''} onChange={e => ch({notes:e.target.value} as any)} /></F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

// ── Experience Editor ──────────────────────────────────────────
const ExperienceEditor: React.FC<{ experiences: Experience[]; onAdd: (e: Omit<Experience,'id'>) => void; onUpdate: (id:number, u:Partial<Experience>) => void; onDelete: (id:number) => void }> = ({ experiences, onAdd, onUpdate, onDelete }) => (
  <ListShell
    items={experiences} label="New Entry" newLabel="New Experience"
    blankItem={() => ({ title: '', company: '', period: '', details: '', blocks: [], type: 'work' as const, image: '' })}
    renderSummary={e => (<><strong>{e.title||'(untitled)'}</strong><span className="admin-post-date">{e.company} · {e.period}</span></>)}
    renderForm={(d, ch) => (
      <>
        <F label="Title / Role"><Inp value={d.title||''} onChange={e => ch({title:e.target.value} as any)} /></F>
        <F label="Company / Organization"><Inp value={d.company||''} onChange={e => ch({company:e.target.value} as any)} /></F>
        <F label="Period"><Inp value={d.period||''} placeholder="Jan 2024 - Present" onChange={e => ch({period:e.target.value} as any)} /></F>
        <F label="Type">
          <select className="admin-input" value={d.type} onChange={e => ch({type:e.target.value as 'work'|'volunteer'} as any)}>
            <option value="work">Work</option><option value="volunteer">Volunteer</option>
          </select>
        </F>
        <F label="Details"><Txt rows={3} value={d.details||''} onChange={e => ch({details:e.target.value} as any)} /></F>
      </>
    )}
    onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete}
  />
)

export default Admin

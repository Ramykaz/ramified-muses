import React, { useRef, useEffect, useState } from 'react'

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'divider' }
  | { type: 'code'; text: string }

interface Props {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

async function uploadToBlob(file: File): Promise<string> {
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
    if (resp.ok) {
      const { url } = await resp.json() as { url: string }
      return url
    }
  } catch { /* fall through */ }
  return data // fallback to base64
}

function AutoTextarea({ value, onChange, placeholder, minRows = 3, style }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      className="be-textarea"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      style={style}
    />
  )
}

const LABELS: Record<string, string> = {
  paragraph: 'TEXT', heading: 'HEADING', quote: 'QUOTE',
  image: 'IMAGE', divider: 'DIVIDER', code: 'CODE',
}

const BlockEditor: React.FC<Props> = ({ blocks, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const insertAtRef = useRef<number>(-1)
  const [uploading, setUploading] = useState(false)

  const update = (i: number, b: Block) => {
    const next = [...blocks]; next[i] = b; onChange(next)
  }
  const remove = (i: number) => onChange(blocks.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir
    if (t < 0 || t >= blocks.length) return
    const next = [...blocks];
    [next[i], next[t]] = [next[t], next[i]]
    onChange(next)
  }
  const addBlock = (type: Block['type'], at?: number) => {
    const idx = at !== undefined ? at : blocks.length
    const b: Block =
      type === 'paragraph' ? { type: 'paragraph', text: '' } :
      type === 'heading'   ? { type: 'heading', text: '', level: 2 } :
      type === 'quote'     ? { type: 'quote', text: '' } :
      type === 'image'     ? { type: 'image', src: '', caption: '' } :
      type === 'code'      ? { type: 'code', text: '' } :
                             { type: 'divider' }
    const next = [...blocks]; next.splice(idx, 0, b); onChange(next)
  }

  const triggerUpload = (at: number) => {
    insertAtRef.current = at; fileRef.current?.click()
  }

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const at = insertAtRef.current >= 0 ? insertAtRef.current : blocks.length
    const newBlocks = await Promise.all(
      files.map(async f => ({ type: 'image' as const, src: await uploadToBlob(f), caption: '' }))
    )
    const next = [...blocks]; next.splice(at, 0, ...newBlocks); onChange(next)
    e.target.value = ''; insertAtRef.current = -1; setUploading(false)
  }

  const updateImageSrc = async (i: number, file: File) => {
    setUploading(true)
    const src = await uploadToBlob(file)
    update(i, { ...(blocks[i] as { type: 'image'; src: string; caption?: string }), src })
    setUploading(false)
  }

  return (
    <div className="be-editor">
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

      {blocks.length === 0 && (
        <div className="be-empty">Add a block to start writing</div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className={`be-block be-${block.type}`}>
          {/* Block header */}
          <div className="be-head">
            <span className="be-type">{LABELS[block.type]}</span>
            {block.type === 'heading' && (
              <select
                className="be-level"
                value={(block as Extract<Block, { type: 'heading' }>).level ?? 2}
                onChange={e => update(i, { ...block, level: Number(e.target.value) as 2 | 3 })}
              >
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            )}
            <div className="be-ctrls">
              <button className="be-ctrl" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button className="be-ctrl" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} title="Move down">↓</button>
              <button className="be-ctrl be-del" onClick={() => remove(i)} title="Remove">×</button>
            </div>
          </div>

          {/* Block content */}
          <div className="be-body">
            {block.type === 'paragraph' && (
              <AutoTextarea
                value={block.text}
                onChange={v => update(i, { ...block, text: v })}
                placeholder="Write a paragraph…"
                minRows={3}
                style={{ fontFamily: 'var(--serif)', fontSize: '16px', lineHeight: '1.8' }}
              />
            )}

            {block.type === 'heading' && (
              <input
                className="be-heading"
                style={{ fontSize: block.level === 3 ? '1.05rem' : '1.35rem' }}
                placeholder={block.level === 3 ? 'Sub-heading…' : 'Section heading…'}
                value={block.text}
                onChange={e => update(i, { ...block, text: e.target.value })}
              />
            )}

            {block.type === 'quote' && (
              <div className="be-quote-wrap">
                <AutoTextarea
                  value={block.text}
                  onChange={v => update(i, { ...block, text: v })}
                  placeholder="Quote or pull quote…"
                  minRows={2}
                  style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '15px', lineHeight: '1.65' }}
                />
                <input
                  className="be-attribution"
                  placeholder="— Attribution (optional)"
                  value={(block as Extract<Block, { type: 'quote' }>).attribution ?? ''}
                  onChange={e => update(i, { ...block, attribution: e.target.value })}
                />
              </div>
            )}

            {block.type === 'image' && (
              <div className="be-img-wrap">
                {block.src
                  ? <img src={block.src} alt={block.caption ?? ''} className="be-img-preview" />
                  : <div className="be-img-empty">No image yet</div>
                }
                <div className="be-img-row">
                  <input
                    className="be-field"
                    placeholder="Paste image URL…"
                    value={block.src}
                    onChange={e => update(i, { ...block, src: e.target.value })}
                  />
                  <label className="be-upload" title="Upload image">
                    {uploading ? '…' : '↑ Upload'}
                    <input
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) { void updateImageSrc(i, f) }; e.target.value = '' }}
                    />
                  </label>
                </div>
                <input
                  className="be-caption"
                  placeholder="Caption (optional)…"
                  value={block.caption ?? ''}
                  onChange={e => update(i, { ...block, caption: e.target.value })}
                />
              </div>
            )}

            {block.type === 'divider' && (
              <div className="be-divider-preview">── ── ──</div>
            )}

            {block.type === 'code' && (
              <AutoTextarea
                value={block.text}
                onChange={v => update(i, { ...block, text: v })}
                placeholder="Paste or write code…"
                minRows={3}
                style={{ fontFamily: 'var(--mono)', fontSize: '12.5px', lineHeight: '1.55' }}
              />
            )}
          </div>
        </div>
      ))}

      {/* Bottom toolbar */}
      <div className="be-toolbar">
        <span className="be-toolbar-lbl">+ Add</span>
        <button className="be-add" onClick={() => addBlock('paragraph')}>¶ Text</button>
        <button className="be-add" onClick={() => addBlock('heading')}>H Heading</button>
        <button className="be-add" onClick={() => addBlock('quote')}>&ldquo; Quote</button>
        <button className="be-add" onClick={() => addBlock('code')}>&lt;/&gt; Code</button>
        <button className="be-add" onClick={() => addBlock('divider')}>— Divider</button>
        <button className="be-add" onClick={() => triggerUpload(blocks.length)} disabled={uploading}>
          {uploading ? 'Uploading…' : '🖼 Image'}
        </button>
      </div>
    </div>
  )
}

export default BlockEditor

// ── Public page renderer ─────────────────────────────────────────
export const BlockRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  if (!blocks?.length) return null
  return (
    <div className="block-renderer">
      {blocks.map((block, i) => {
        if (block.type === 'paragraph')
          return <p key={i} className="block-p">{block.text}</p>
        if (block.type === 'heading') {
          const Tag = (block.level === 3 ? 'h3' : 'h2') as keyof React.JSX.IntrinsicElements
          return <Tag key={i} className="block-h">{block.text}</Tag>
        }
        if (block.type === 'quote')
          return (
            <blockquote key={i} className="block-q">
              <p>{block.text}</p>
              {block.attribution && <cite className="block-cite">{block.attribution}</cite>}
            </blockquote>
          )
        if (block.type === 'image')
          return (
            <figure key={i} className="block-figure">
              <img src={block.src} alt={block.caption ?? ''} className="block-img" />
              {block.caption && <figcaption className="block-caption">{block.caption}</figcaption>}
            </figure>
          )
        if (block.type === 'divider')
          return <hr key={i} className="block-divider" />
        if (block.type === 'code')
          return <pre key={i} className="block-code"><code>{block.text}</code></pre>
        return null
      })}
    </div>
  )
}

import React, { useRef } from 'react'

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'quote'; text: string }

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

function readImageFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = e => res(e.target?.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const insertingAtRef = useRef<number>(-1)

  const update = (index: number, updated: Block) => {
    const next = [...blocks]
    next[index] = updated
    onChange(next)
  }

  const addBlock = (type: Block['type'], atIndex?: number) => {
    const idx = atIndex !== undefined ? atIndex : blocks.length
    const newBlock: Block =
      type === 'paragraph' ? { type: 'paragraph', text: '' } :
      type === 'heading'   ? { type: 'heading', text: '' } :
      type === 'quote'     ? { type: 'quote', text: '' } :
                             { type: 'image', src: '', caption: '' }
    const next = [...blocks]
    next.splice(idx, 0, newBlock)
    onChange(next)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, dir: -1 | 1) => {
    const next = [...blocks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const handleImageInsert = async (index: number) => {
    insertingAtRef.current = index
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const insertAt = insertingAtRef.current >= 0 ? insertingAtRef.current : blocks.length
    const newBlocks = await Promise.all(files.map(async f => ({
      type: 'image' as const,
      src: await readImageFile(f),
      caption: ''
    })))
    const next = [...blocks]
    next.splice(insertAt, 0, ...newBlocks)
    onChange(next)
    e.target.value = ''
    insertingAtRef.current = -1
  }

  return (
    <div className="block-editor">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {blocks.length === 0 && (
        <div className="block-empty-state">
          Click a button below to start writing...
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className="block-row">
          {/* Block controls */}
          <div className="block-controls">
            <button className="block-ctrl-btn" onClick={() => moveBlock(i, -1)} title="Move up" disabled={i === 0}>↑</button>
            <button className="block-ctrl-btn" onClick={() => moveBlock(i, 1)} title="Move down" disabled={i === blocks.length - 1}>↓</button>
            <button className="block-ctrl-btn danger" onClick={() => removeBlock(i)} title="Remove">×</button>
          </div>

          {/* Block content */}
          <div className="block-content">
            {block.type === 'paragraph' && (
              <textarea
                className="block-textarea"
                placeholder="Write a paragraph..."
                value={block.text}
                rows={3}
                onChange={e => update(i, { ...block, text: e.target.value })}
              />
            )}
            {block.type === 'heading' && (
              <input
                className="block-heading-input"
                placeholder="Section heading..."
                value={block.text}
                onChange={e => update(i, { ...block, text: e.target.value })}
              />
            )}
            {block.type === 'quote' && (
              <textarea
                className="block-textarea block-quote-input"
                placeholder="Quote or pull quote..."
                value={block.text}
                rows={2}
                onChange={e => update(i, { ...block, text: e.target.value })}
              />
            )}
            {block.type === 'image' && (
              <div className="block-image-editor">
                {block.src ? (
                  <div className="block-image-preview-wrap">
                    <img src={block.src} alt="preview" className="block-image-preview" />
                    <button
                      className="block-image-replace"
                      onClick={() => handleImageInsert(i)}
                    >Replace image</button>
                  </div>
                ) : (
                  <button className="block-image-upload-btn" onClick={() => handleImageInsert(i)}>
                    📷 Upload Image
                  </button>
                )}
                <input
                  className="block-caption-input"
                  placeholder="Caption (optional)..."
                  value={block.caption || ''}
                  onChange={e => update(i, { ...block, caption: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Insert-after toolbar */}
          <div className="block-insert-after">
            <button className="block-add-btn" onClick={() => addBlock('paragraph', i + 1)} title="Add paragraph">¶</button>
            <button className="block-add-btn" onClick={() => addBlock('heading', i + 1)} title="Add heading">H</button>
            <button className="block-add-btn" onClick={() => addBlock('quote', i + 1)} title="Add quote">"</button>
            <button className="block-add-btn" onClick={() => handleImageInsert(i + 1)} title="Insert image here">🖼</button>
          </div>
        </div>
      ))}

      {/* Bottom toolbar when empty or to start */}
      <div className="block-toolbar">
        <span className="block-toolbar-label">Add:</span>
        <button className="block-add-btn labeled" onClick={() => addBlock('paragraph')}>¶ Paragraph</button>
        <button className="block-add-btn labeled" onClick={() => addBlock('heading')}>H Heading</button>
        <button className="block-add-btn labeled" onClick={() => addBlock('quote')}>" Quote</button>
        <button className="block-add-btn labeled" onClick={() => handleImageInsert(blocks.length)}>🖼 Image</button>
      </div>
    </div>
  )
}

export default BlockEditor

// ── Renderer: used on public-facing full post pages ────────────
export const BlockRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) return null
  return (
    <div className="block-renderer">
      {blocks.map((block, i) => {
        if (block.type === 'paragraph') return (
          <p key={i} className="block-p">{block.text}</p>
        )
        if (block.type === 'heading') return (
          <h2 key={i} className="block-h">{block.text}</h2>
        )
        if (block.type === 'quote') return (
          <blockquote key={i} className="block-q">{block.text}</blockquote>
        )
        if (block.type === 'image') return (
          <figure key={i} className="block-figure">
            <img src={block.src} alt={block.caption || ''} className="block-img" />
            {block.caption && <figcaption className="block-caption">{block.caption}</figcaption>}
          </figure>
        )
        return null
      })}
    </div>
  )
}

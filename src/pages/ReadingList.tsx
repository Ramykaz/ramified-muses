import React, { useMemo, useState } from 'react'
import { useContent } from '../hooks/ContentContext'
import type { Book } from '../hooks/ContentContext'

const STATUS_CLASS: Record<string, string> = {
  'Reading':      'status-reading',
  'Finished':     'status-finished',
  'Reference':    'status-reference',
  'Want to Read': 'status-want',
}

const UNDATED = 'Undated'

function monthKey(date?: string): string {
  return date && date.trim() ? date.trim() : UNDATED
}

function monthSortValue(key: string): number {
  if (key === UNDATED) return -Infinity
  const t = Date.parse(`1 ${key}`)
  return Number.isNaN(t) ? -Infinity : t
}

function groupByMonth(books: Book[]): { key: string; books: Book[] }[] {
  const map = new Map<string, Book[]>()
  for (const book of books) {
    const key = monthKey(book.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(book)
  }
  return [...map.entries()]
    .map(([key, books]) => ({ key, books }))
    .sort((a, b) => monthSortValue(b.key) - monthSortValue(a.key))
}

const ReadingList: React.FC = () => {
  const { content } = useContent()
  const books = content.books
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (id: number) => setOpen(open === id ? null : id)
  const groups = useMemo(() => groupByMonth(books), [books])

  return (
    <div className="page page-reading">
      <div className="page-content">
        <h2 className="section-label">reading</h2>

        {books.length === 0 && (
          <p className="empty-msg">// nothing listed yet.</p>
        )}

        {groups.map(group => (
          <div key={group.key} className="book-month-group">
            <h3 className="book-month-heading">{group.key}</h3>
            <div className="book-list">
              {group.books.map(book => (
                <div
                  key={book.id}
                  className={`book-item ${open === book.id ? 'open' : ''}`}
                  onClick={() => toggle(book.id)}
                >
                  <div className="book-header">
                    <span className="book-title">
                      {book.title}
                      <span className="book-author"> — {book.author}</span>
                    </span>
                    <span className={`book-status ${STATUS_CLASS[book.status] ?? ''}`}>
                      {book.status}
                    </span>
                  </div>
                  {(book.coverImage || book.notes) && (
                    <div className="book-expand">
                      {book.coverImage && (
                        <img src={book.coverImage} alt={`${book.title} cover`} className="book-cover" />
                      )}
                      {book.notes && <p className="book-notes">{book.notes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReadingList

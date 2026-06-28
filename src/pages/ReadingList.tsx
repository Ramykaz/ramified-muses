import React, { useState } from 'react'
import { useContent } from '../hooks/ContentContext'

const STATUS_CLASS: Record<string, string> = {
  'Reading':      'status-reading',
  'Finished':     'status-finished',
  'Reference':    'status-reference',
  'Want to Read': 'status-want',
}

const ReadingList: React.FC = () => {
  const { content } = useContent()
  const books = content?.books ?? []
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (id: number) => setOpen(open === id ? null : id)

  return (
    <div className="page page-reading">
      <div className="page-content">
        <h2 className="section-label">reading</h2>

        {books.length === 0 && (
          <p className="empty-msg">// nothing listed yet.</p>
        )}

        <div className="book-list">
          {books.map(book => (
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
              {book.notes && (
                <p className="book-notes">{book.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReadingList

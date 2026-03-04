import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

const STATUS_COLORS: Record<string, string> = {
  'Reading': '#3498db',
  'Finished': '#27ae60',
  'Reference': '#9b59b6',
  'Want to Read': '#e67e22'
}

const ReadingList: React.FC = () => {
  const { content } = useContent()
  const books = content?.books ?? []
  const [openBook, setOpenBook] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-reading">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Current Reading</h2>
          {books.length === 0 && (
            <p style={{ opacity: 0.6 }}>No books yet — add some from the <Link to="/admin" className="link">admin panel</Link>.</p>
          )}
          <ul className="content-list">
            {books.map(book => (
              <li key={book.id} onClick={() => setOpenBook(openBook === book.id ? null : book.id)}>
                <strong>{book.title}</strong> by {book.author}{' '}
                <span style={{ color: STATUS_COLORS[book.status] || '#7f8c8d', fontSize: '0.85rem' }}>({book.status})</span>
                <div className={`collapsible-content ${openBook === book.id ? 'open' : ''}`}>
                  {book.coverImage && <img src={book.coverImage} alt={book.title} className="entry-image-inline" />}
                  <p>{book.notes}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default ReadingList

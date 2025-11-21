import { useState } from 'react'

const ReadingList: React.FC = () => {
  const [openBook, setOpenBook] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const books = [
    {
      id: 1,
      title: "Gödel, Escher, Bach",
      author: "Douglas Hofstadter",
      status: "Reading",
      notes: "Exploring connections between formal systems, art, and consciousness. The chapter on self-reference has fascinating implications for AI."
    },
    {
      id: 2,
      title: "The Order of Time",
      author: "Carlo Rovelli",
      status: "Finished",
      notes: "Beautiful meditation on the nature of time from a theoretical physicist's perspective. Changed how I think about temporal structures."
    },
    {
      id: 3,
      title: "Film Art: An Introduction",
      author: "Bordwell & Thompson",
      status: "Reference",
      notes: "Essential for understanding film form and style. The analysis of editing patterns has been particularly useful."
    }
  ]

  const toggleBook = (id: number) => {
    setOpenBook(openBook === id ? null : id)
  }

  return (
    <div className="notebook-page page-reading">
      <div className="content-wrapper">
        <h1 className="page-title"></h1>

        <div className="section">
          <h2 className="section-title">Current Reading</h2>
          <div className="content">
            <ul className="content-list">
              {books.map(book => (
                <li key={book.id} onClick={() => toggleBook(book.id)}>
                  <strong>{book.title}</strong> by {book.author} ({book.status})
                  <div className={`collapsible-content ${openBook === book.id ? 'open' : ''}`}>
                    <p>{book.notes}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="date">{currentDate}</div>
    </div>
  )
}

export default ReadingList

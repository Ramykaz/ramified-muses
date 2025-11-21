import { useState } from 'react'

const FilmReviews: React.FC = () => {
  const [openReview, setOpenReview] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const reviews = [
    {
      id: 1,
      title: "Stalker (1979)",
      director: "Andrei Tarkovsky",
      excerpt: "A profound meditation on desire, faith, and human limitation...",
      fullReview: "The Zone operates as both physical and metaphysical space. The gradual deterioration of film stock mirrors the characters' psychological unraveling. Tarkovsky masterfully uses long takes to create a contemplative rhythm that draws viewers into the philosophical questions at the film's core."
    },
    {
      id: 2,
      title: "Arrival (2016)",
      director: "Denis Villeneuve",
      excerpt: "Exceptional exploration of language, time, and communication...",
      fullReview: "The non-linear narrative structure perfectly mirrors the film's thematic concerns about time and perception. Amy Adams delivers a nuanced performance that carries the emotional weight. The visual design of the heptapod language is particularly innovative."
    },
    {
      id: 3,
      title: "Parasite (2019)",
      director: "Bong Joon-ho",
      excerpt: "Masterful class commentary disguised as a genre-blending thriller...",
      fullReview: "The architectural space becomes a character in itself, representing social stratification through vertical composition. The tonal shifts from comedy to thriller to horror are handled with incredible precision."
    }
  ]

  const toggleReview = (id: number) => {
    setOpenReview(openReview === id ? null : id)
  }

  return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <h1 className="page-title"></h1>

        <div className="section">
          <h2 className="section-title">Recent Analysis</h2>
          <div className="content">
            <ul className="content-list">
              {reviews.map(review => (
                <li key={review.id} onClick={() => toggleReview(review.id)}>
                  <strong>{review.title}</strong> - {review.director}
                  <div className={`collapsible-content ${openReview === review.id ? 'open' : ''}`}>
                    <p>{review.fullReview}</p>
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

export default FilmReviews

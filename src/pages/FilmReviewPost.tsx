import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'

const FilmReviewPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const review = content.filmReviews.find(r => r.id === Number(id))
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!review) return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/film-reviews')}>← Back to Film Reviews</button>
        <p>Review not found.</p>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )

  const idx = content.filmReviews.findIndex(r => r.id === review.id)
  const prev = idx < content.filmReviews.length - 1 ? content.filmReviews[idx + 1] : null
  const next = idx > 0 ? content.filmReviews[idx - 1] : null

  return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/film-reviews')}>← Back to Film Reviews</button>
        <article className="blog-post-full">
          <header className="blog-post-header">
            <h1 className="blog-post-title">
              {review.title} {review.year && <span style={{ fontWeight: 400, fontSize: '1.2rem' }}>({review.year})</span>}
            </h1>
            <p className="blog-meta">dir. {review.director}</p>
            {review.rating && <p className="film-rating-large">{review.rating}</p>}
          </header>
          <div className="blog-post-body">
            {review.fullReview.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>
        <nav className="post-navigation">
          {prev && (
            <Link to={`/film-reviews/${prev.id}`} className="post-nav-link post-nav-prev">
              <span className="post-nav-label">← Previous</span>
              <span className="post-nav-title">{prev.title}</span>
            </Link>
          )}
          {next && (
            <Link to={`/film-reviews/${next.id}`} className="post-nav-link post-nav-next">
              <span className="post-nav-label">Next →</span>
              <span className="post-nav-title">{next.title}</span>
            </Link>
          )}
        </nav>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default FilmReviewPost

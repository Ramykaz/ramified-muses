import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

const FilmReviews: React.FC = () => {
  const { content } = useContent()
  const reviews = content?.filmReviews ?? []
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Recent Analysis</h2>
          {reviews.length === 0 && (
            <p style={{ opacity: 0.6 }}>No reviews yet — add some from the <Link to="/admin" className="link">admin panel</Link>.</p>
          )}
          {reviews.map(review => (
            <Link key={review.id} to={`/film-reviews/${review.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="blog-post">
                {review.image && (
                  <img src={review.image} alt={review.title} className="entry-image" />
                )}
                <h3 className="blog-title">
                  {review.title}{review.year && <span style={{ fontWeight: 400 }}> ({review.year})</span>}
                  {review.rating && <span className="film-rating"> {review.rating}</span>}
                </h3>
                <p className="blog-meta">{review.director}</p>
                <p className="blog-excerpt">{review.excerpt}</p>
                <span className="read-more">Read review →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default FilmReviews

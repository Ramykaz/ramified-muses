import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

const Research: React.FC = () => {
  const { content } = useContent()
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-research">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Current Research Areas</h2>
          {content.researchAreas.length === 0 && (
            <p style={{ opacity: 0.6 }}>No areas yet — add some from the <Link to="/admin" className="link">admin panel</Link>.</p>
          )}
          {content.researchAreas.map(area => (
            <Link key={area.id} to={`/research/${area.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="blog-post">
                <h3 className="blog-title">{area.title}</h3>
                <p className="blog-excerpt">{area.excerpt}</p>
                {area.tags && area.tags.length > 0 && (
                  <div className="blog-tags">{area.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}</div>
                )}
                <span className="read-more">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Research

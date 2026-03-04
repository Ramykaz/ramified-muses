import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'

const Home: React.FC = () => {
  const { content } = useContent()
  const { profile } = content
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-home">
      <div className="content-wrapper">
        <div className="profile-section">
          <div>
            <img src={profile.image} alt={profile.name} className="profile-image" />
          </div>
          <div className="profile-content">
            <div className="section">
              <h2 className="section-title">About Me</h2>
              <div className="content">
                {profile.bio.map((p, i) => <p key={i}>{p}</p>)}
                <p className="quote">"{profile.quote}" — {profile.quoteAuthor}</p>
                <p>{profile.currentWork}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="date">
        {currentDate}
        <Link to="/admin" className="admin-secret-link" title="Admin">·</Link>
      </div>
    </div>
  )
}

export default Home

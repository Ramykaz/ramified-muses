import React from 'react'
import { useContent } from '../hooks/ContentContext'

const Home: React.FC = () => {
  const { content } = useContent()
  const { profile, contact } = content

  return (
    <div className="page page-home">
      <div className="page-content">
        <div className="home-header">
          <div className="home-header-text">
            <h1 className="home-name">{profile.name}</h1>
            <p className="home-subtitle">ML Engineer · CS Undergrad · Ankara, Turkey</p>
          </div>
          {profile.image && (
            <img src={profile.image} alt={profile.name} className="home-avatar" />
          )}
        </div>

        <hr className="divider" />

        <div className="home-bio">
          {profile.bio.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <hr className="divider" />

        <div className="home-meta">
          <div className="meta-row">
            <span className="meta-key">now</span>
            <span className="meta-val">{profile.currentWork}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">interests</span>
            <span className="meta-val">AI systems · edge computing · computer vision · NLP · robotics · literature · academic research</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">languages</span>
            <span className="meta-val">Amharic (native) · English (fluent) · Turkish (proficient) · Arabic (beginner)</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">studying</span>
            <span className="meta-val">B.Sc. Computer Engineering, Hacettepe University (2022–2026)</span>
          </div>
        </div>

        <hr className="divider" />

        <div className="home-links">
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noopener noreferrer" className="home-link">github ↗</a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="home-link">linkedin ↗</a>
          )}
          <a
            href="https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
          >
            google scholar ↗
          </a>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="home-link">email ↗</a>
          )}
          <a
            href="https://ieeexplore.ieee.org/document/11537125"
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
          >
            IEEE paper ↗
          </a>
        </div>

        {profile.quote && (
          <blockquote className="home-quote">
            <span>"{profile.quote}"</span>
            {profile.quoteAuthor && <cite> — {profile.quoteAuthor}</cite>}
          </blockquote>
        )}
      </div>
    </div>
  )
}

export default Home

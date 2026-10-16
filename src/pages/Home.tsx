import React from 'react'
import { useContent } from '../hooks/ContentContext'

const Home: React.FC = () => {
  const { content } = useContent()
  const { profile } = content

  return (
    <div className="page page-home">
      <div className="page-content">
        <div className="home-header">
          <div className="home-header-text">
            <h1 className="home-name">{profile.name}</h1>
            <p className="home-subtitle">{profile.subtitle}</p>
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
          {profile.interests && (
            <div className="meta-row">
              <span className="meta-key">interests</span>
              <span className="meta-val">{profile.interests}</span>
            </div>
          )}
          {profile.languages && (
            <div className="meta-row">
              <span className="meta-key">languages</span>
              <span className="meta-val">{profile.languages}</span>
            </div>
          )}
          {profile.studying && (
            <div className="meta-row">
              <span className="meta-key">studying</span>
              <span className="meta-val">{profile.studying}</span>
            </div>
          )}
        </div>

        <hr className="divider" />

        <div className="home-links">
          {(profile.links ?? []).map((link, i) => (
            <a
              key={i}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="home-link"
            >
              {link.label}
            </a>
          ))}
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

import React from 'react'
import { useContent } from '../hooks/ContentContext'

const Contact: React.FC = () => {
  const { content } = useContent()
  const { contact } = content

  return (
    <div className="page page-contact">
      <div className="page-content">
        <h2 className="section-label">contact</h2>

        <div className="contact-list">
          {contact.email && (
            <div className="contact-row">
              <span className="contact-key">email</span>
              <a href={`mailto:${contact.email}`} className="contact-val">{contact.email}</a>
            </div>
          )}
          {contact.github && (
            <div className="contact-row">
              <span className="contact-key">github</span>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="contact-val">
                {contact.github.replace('https://', '')}
              </a>
            </div>
          )}
          {contact.linkedin && (
            <div className="contact-row">
              <span className="contact-key">linkedin</span>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-val">
                ramadan-shemsu-hussen ↗
              </a>
            </div>
          )}
          <div className="contact-row">
            <span className="contact-key">scholar</span>
            <a
              href="https://scholar.google.com/citations?user=J_m9GIYAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-val"
            >
              google scholar ↗
            </a>
          </div>
          <div className="contact-row">
            <span className="contact-key">paper</span>
            <a
              href="https://ieeexplore.ieee.org/document/11537125"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-val"
            >
              IEEE Xplore — ICHORA 2026 ↗
            </a>
          </div>
          {contact.location && (
            <div className="contact-row">
              <span className="contact-key">location</span>
              <span className="contact-val">{contact.location}</span>
            </div>
          )}
          {contact.phone && (
            <div className="contact-row">
              <span className="contact-key">phone</span>
              <span className="contact-val">{contact.phone}</span>
            </div>
          )}
        </div>

        {contact.intro && (
          <p className="contact-note">{contact.intro}</p>
        )}
      </div>
    </div>
  )
}

export default Contact

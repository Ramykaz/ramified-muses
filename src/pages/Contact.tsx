import React from 'react'
import { useContent } from '../hooks/ContentContext'

const Contact: React.FC = () => {
  const { content } = useContent()
  const contact = content?.contact
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!contact) return null

  return (
    <div className="notebook-page page-contact">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Get In Touch</h2>
          <div className="content">
            <p>{contact.intro}</p>
          </div>
        </div>

        <div className="contact-grid">
          {/* Left: details */}
          <div className="contact-details-card">
            <div className="contact-detail-row">
              <span className="contact-icon">✉</span>
              <div>
                <div className="contact-detail-label">Email</div>
                <a href={`mailto:${contact.email}`} className="link">{contact.email}</a>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="contact-icon">☎</span>
              <div>
                <div className="contact-detail-label">Phone</div>
                <span>{contact.phone}</span>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="contact-icon">◎</span>
              <div>
                <div className="contact-detail-label">Location</div>
                <span>{contact.location}</span>
              </div>
            </div>
          </div>

          {/* Right: links + CV */}
          <div className="contact-links-card">
            {contact.linkedin && (
              <a href={contact.linkedin} className="contact-link-card" target="_blank" rel="noopener noreferrer">
                <span className="contact-link-icon">in</span>
                <span>LinkedIn</span>
              </a>
            )}
            {contact.github && (
              <a href={contact.github} className="contact-link-card" target="_blank" rel="noopener noreferrer">
                <span className="contact-link-icon">⌥</span>
                <span>GitHub</span>
              </a>
            )}
            {contact.cvUrl && (
              <a href={contact.cvUrl} className="contact-link-card cv-link" target="_blank" rel="noopener noreferrer" download>
                <span className="contact-link-icon">↓</span>
                <span>Download CV</span>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Contact

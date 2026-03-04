import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'

const Projects: React.FC = () => {
  const { content } = useContent()
  const experiences = content?.experiences ?? []
  const [openItem, setOpenItem] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const workExp = experiences.filter(e => e.type === 'work')
  const volunteerExp = experiences.filter(e => e.type === 'volunteer')

  return (
    <div className="notebook-page page-projects">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Professional Experience</h2>
          {workExp.length === 0 && (
            <p style={{ opacity: 0.6 }}>No entries yet — add from <Link to="/admin" className="link">admin panel</Link>.</p>
          )}
          <ul className="content-list">
            {workExp.map(exp => (
              <li key={exp.id} onClick={() => setOpenItem(openItem === exp.id ? null : exp.id)}>
                <strong>{exp.title}</strong> — {exp.company}{' '}
                <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>({exp.period})</span>
                <div className={`collapsible-content ${openItem === exp.id ? 'open' : ''}`}>
                  {exp.image && <img src={exp.image} alt={exp.title} className="entry-image-inline" />}
                  <p>{exp.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {volunteerExp.length > 0 && (
          <div className="section">
            <h2 className="section-title">Volunteering</h2>
            <ul className="content-list">
              {volunteerExp.map(vol => (
                <li key={vol.id} onClick={() => setOpenItem(openItem === vol.id ? null : vol.id)}>
                  <strong>{vol.title}</strong> — {vol.company}{' '}
                  <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>({vol.period})</span>
                  <div className={`collapsible-content ${openItem === vol.id ? 'open' : ''}`}>
                    {vol.image && <img src={vol.image} alt={vol.title} className="entry-image-inline" />}
                    <p>{vol.details}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Projects

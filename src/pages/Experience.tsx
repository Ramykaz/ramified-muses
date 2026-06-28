import React from 'react'
import { useContent } from '../hooks/ContentContext'

const Experience: React.FC = () => {
  const { content } = useContent()
  const experiences = (content?.experiences ?? []).filter(e => e.type === 'work')

  return (
    <div className="page page-experience">
      <div className="page-content">
        <h2 className="section-label">experience</h2>

        <div className="timeline">
          {experiences.map((exp, i) => (
            <div key={exp.id} className="timeline-item">
              <div className="timeline-header">
                <div className="timeline-meta">
                  <span className="timeline-title">{exp.title}</span>
                  <span className="timeline-company">{exp.company}</span>
                </div>
                <span className="timeline-period">{exp.period}</span>
              </div>
              {exp.details && (
                <p className="timeline-details">{exp.details}</p>
              )}
              {i < experiences.length - 1 && <hr className="timeline-rule" />}
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="exp-footer">
          <p className="exp-footer-text">
            B.Sc. Computer Engineering · Hacettepe University · 2022–2026
          </p>
          <p className="exp-footer-text">
            MENA ML Winter School · Google DeepMind &amp; QCRI · Doha, Qatar · Feb 2025
          </p>
          <p className="exp-footer-text">
            Frontier Tech Leaders ML Bootcamp · UNDP ICPSD · 2024 <span className="exp-badge">Hackathon Winner</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Experience

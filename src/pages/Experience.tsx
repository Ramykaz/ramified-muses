import React from 'react'
import { useContent, DEFAULT_CONTENT } from '../hooks/ContentContext'
import { DomainIcon } from '../components/DomainIcons'

const LOGOS: [string, string][] = [
  ['hacettepe', '/logos/hacettepe.svg'],
  ['undp',      '/logos/undp.svg'],
  ['oasis',     '/logos/oasis.png'],
  ['optima',    '/logos/optima.png'],
  ['orsam',     '/logos/orsam.png'],
  ['buthur',    '/logos/buthur.png'],
  ['qstp',      '/logos/buthur.png'],
]

function getLogo(company: string): string | null {
  const lower = company.toLowerCase()
  const match = LOGOS.find(([key]) => lower.includes(key))
  return match ? match[1] : null
}

const Experience: React.FC = () => {
  const { content } = useContent()
  const experiences = (content?.experiences ?? []).filter(e => e.type === 'work')
  const footerLines = (content?.profile.experienceFooter ?? DEFAULT_CONTENT.profile.experienceFooter ?? '')
    .split('\n').map(line => line.trim()).filter(Boolean)

  return (
    <div className="page page-experience">
      <div className="page-content">
        <h2 className="section-label">experience</h2>

        <div className="timeline">
          {experiences.map((exp, i) => {
            const logo = getLogo(exp.company)
            return (
              <div key={exp.id} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title-row">
                    <DomainIcon text={`${exp.title} ${exp.company} ${exp.details}`} />
                    <div className="timeline-meta">
                      <span className="timeline-title">{exp.title}</span>
                      <div className="timeline-company-row">
                        {logo && (
                          <img
                            src={logo}
                            alt=""
                            className="company-logo"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <span className="timeline-company">{exp.company}</span>
                      </div>
                    </div>
                  </div>
                  <span className="timeline-period">{exp.period}</span>
                </div>
                {exp.details && (
                  <ul className="bullet-list">
                    {exp.details.split('\n').map(line => line.trim()).filter(Boolean).map((line, li) => (
                      <li key={li}>{line}</li>
                    ))}
                  </ul>
                )}
                {i < experiences.length - 1 && <hr className="timeline-rule" />}
              </div>
            )
          })}
        </div>

        {footerLines.length > 0 && (
          <>
            <hr className="divider" />

            <div className="exp-footer">
              {footerLines.map((line, i) => {
                // a trailing "[text]" becomes a badge
                const m = line.match(/^(.*?)\s*\[([^\]]+)\]$/)
                return (
                  <p key={i} className="exp-footer-text">
                    {m ? <>{m[1]} <span className="exp-badge">{m[2]}</span></> : line}
                  </p>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Experience

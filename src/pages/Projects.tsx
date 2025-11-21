import { useState } from 'react'

const Projects: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const experiences = [
    {
      id: 1,
      title: "Computer Vision & AI Intern",
      company: "Oasis Global Energy",
      period: "July 2025 - Present",
      details: "Developing computer vision pipelines for solar panel defect detection using drone imagery. Working on renewable energy optimization across Gulf countries."
    },
    {
      id: 2,
      title: "Frontend Development Intern",
      company: "BUTHUR QSTP, Qatar",
      period: "May 2025 - July 2025",
      details: "Built responsive web interfaces for Arabic learning platform. Implemented authentication systems and multilingual support."
    },
    {
      id: 3,
      title: "Computer Vision Intern",
      company: "Optima Engineering",
      period: "Aug 2024 - Oct 2024",
      details: "Designed real-time driver detection system using YOLOv8. Optimized pipelines for security applications."
    }
  ]

  const volunteer = [
    {
      id: 1,
      title: "Community Development Volunteer",
      organization: "Habeşistan Kalkınma Derneği",
      period: "Jan 2022 - Present",
      details: "Coordinated water well and school construction projects in Ethiopia. Organized technology training for students."
    }
  ]

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
    <div className="notebook-page page-projects">
      <div className="content-wrapper">
        <h1 className="page-title"></h1>

        <div className="section">
          <h2 className="section-title">Professional Experience</h2>
          <div className="content">
            <ul className="content-list">
              {experiences.map(exp => (
                <li key={exp.id} onClick={() => toggleItem(exp.id)}>
                  <strong>{exp.title}</strong> - {exp.company} ({exp.period})
                  <div className={`collapsible-content ${openItem === exp.id ? 'open' : ''}`}>
                    <p>{exp.details}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Volunteering</h2>
          <div className="content">
            <ul className="content-list">
              {volunteer.map(vol => (
                <li key={vol.id} onClick={() => toggleItem(vol.id + 10)}>
                  <strong>{vol.title}</strong> - {vol.organization} ({vol.period})
                  <div className={`collapsible-content ${openItem === vol.id + 10 ? 'open' : ''}`}>
                    <p>{vol.details}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Projects

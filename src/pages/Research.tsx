import { useState } from 'react'

const Research: React.FC = () => {
  const [openTopic, setOpenTopic] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const researchAreas = [
    {
      id: 1,
      title: "Computer Vision for Renewable Energy",
      excerpt: "Using deep learning for solar panel defect detection...",
      details: "Developing computer vision pipelines that analyze IR, EL, and RGB drone imagery to identify micro-cracks, hotspots, and other defects in solar panels. Focus on improving renewable energy efficiency through automated inspection systems."
    },
    {
      id: 2,
      title: "Multilingual NLP",
      excerpt: "Arabic sentiment analysis and cross-cultural AI...",
      details: "Exploring the challenges of Arabic natural language processing, including dialect variations and morphological complexity. Working on sentiment analysis systems that can understand cultural context and regional linguistic nuances."
    },
    {
      id: 3,
      title: "Real-time AI Systems",
      excerpt: "Optimizing object detection for security applications...",
      details: "Researching efficient inference pipelines for real-time computer vision applications. Focus on optimizing YOLO architectures for low-latency performance in security and monitoring systems while maintaining high accuracy."
    }
  ]

  const toggleTopic = (id: number) => {
    setOpenTopic(openTopic === id ? null : id)
  }

  return (
    <div className="notebook-page page-research">
      <div className="content-wrapper">
        <h1 className="page-title"></h1>

        <div className="section">
          <h2 className="section-title">Current Research Areas</h2>
          <div className="content">
            <ul className="content-list">
              {researchAreas.map(area => (
                <li key={area.id} onClick={() => toggleTopic(area.id)}>
                  <strong>{area.title}</strong>
                  <div className={`collapsible-content ${openTopic === area.id ? 'open' : ''}`}>
                    <p>{area.details}</p>
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

export default Research

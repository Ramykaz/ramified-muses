import { useState } from 'react'

const Blog: React.FC = () => {
  const [openPost, setOpenPost] = useState<number | null>(null)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const blogPosts = [
    {
      id: 1,
      title: "Computer Vision in Renewable Energy",
      date: "February 2025",
      excerpt: "Exploring how deep learning models can identify defects in solar panels...",
      fullContent: "Working with drone imagery presents unique challenges for computer vision systems. The fusion of IR, EL, and RGB data requires sophisticated preprocessing and model architectures. Recent advances in attention mechanisms have shown promise for multi-modal defect detection in renewable energy applications."
    },
    {
      id: 2,
      title: "Multilingual NLP Challenges",
      date: "January 2025",
      excerpt: "Reflections on processing Arabic social media posts...",
      fullContent: "Arabic NLP faces challenges from dialect variations to complex morphology. The gap between Modern Standard Arabic and regional dialects requires careful dataset construction and model training strategies. Transfer learning from larger languages shows potential but requires cultural and linguistic adaptation."
    },
    {
      id: 3,
      title: "Cross-Cultural AI Development",
      date: "December 2024",
      excerpt: "Experiences working on AI projects across Turkey and Qatar...",
      fullContent: "Cultural context significantly influences technology development and deployment. Working across different regions reveals how user expectations, regulatory environments, and technical infrastructure shape AI system design. The most successful projects often incorporate local knowledge from the earliest stages."
    }
  ]

  const togglePost = (id: number) => {
    setOpenPost(openPost === id ? null : id)
  }

  return (
    <div className="notebook-page page-blog">
      <div className="content-wrapper">
        <h1 className="page-title">Blog</h1>

        <div className="section">
          <h2 className="section-title">Latest Writings</h2>

          {blogPosts.map(post => (
            <div key={post.id} className="blog-post" onClick={() => togglePost(post.id)}>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-meta">{post.date}</p>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className={`collapsible-content ${openPost === post.id ? 'open' : ''}`}>
                <p>{post.fullContent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Blog

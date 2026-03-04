import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

const Blog: React.FC = () => {
  const { content } = useContent()
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-blog">
      <div className="content-wrapper">
        <div className="section">
          <h2 className="section-title">Latest Writings</h2>
          {content.blogPosts.length === 0 && (
            <p style={{ opacity: 0.6 }}>No posts yet — add some from the <Link to="/admin" className="link">admin panel</Link>.</p>
          )}
          {content.blogPosts.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="blog-post">
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-meta">{post.date}</p>
                <p className="blog-excerpt">{post.excerpt}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="blog-tags">
                    {post.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}
                  </div>
                )}
                <span className="read-more">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Blog

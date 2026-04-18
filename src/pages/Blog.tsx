import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'

const Blog: React.FC = () => {
  const { content } = useContent()
  const posts = content.blogPosts
  const featured = posts[0]
  const secondaryPosts = posts.slice(1)
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="notebook-page page-blog">
      <div className="content-wrapper">
        <section className="section blog-shell">
          <h2 className="section-title">Latest Writings</h2>

          {posts.length === 0 && (
            <p className="empty-state">Nothing published yet. Fresh writing will appear here soon.</p>
          )}

          {featured && (
            <Link to={`/blog/${featured.id}`} className={`blog-featured blog-post-style-${featured.stylePreset || 'editorial'}`}>
              {featured.image && <img src={featured.image} alt={featured.title} className="blog-featured-image" />}
              <div className="blog-featured-content">
                <p className="blog-featured-kicker">Featured Essay</p>
                <h3 className="blog-featured-title">{featured.title}</h3>
                <p className="blog-meta">{featured.date}</p>
                <p className="blog-excerpt">{featured.excerpt}</p>
                {featured.tags && featured.tags.length > 0 && (
                  <div className="blog-tags">
                    {featured.tags.map(tag => <span key={tag} className="blog-tag">{tag}</span>)}
                  </div>
                )}
                <span className="read-more">Read feature →</span>
              </div>
            </Link>
          )}

          {secondaryPosts.length > 0 && (
            <div className="blog-grid">
              {secondaryPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.id}`} className={`blog-post-card blog-post-style-${post.stylePreset || 'editorial'}`}>
                  {post.image && <img src={post.image} alt={post.title} className="blog-card-image" />}
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-meta">{post.date}</p>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-tags">{post.tags.map(tag => <span key={tag} className="blog-tag">{tag}</span>)}</div>
                  )}
                  <span className="read-more">Read more →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Blog

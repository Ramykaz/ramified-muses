import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const post = (content?.blogPosts ?? []).find(p => p.id === Number(id))
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!post) return (
    <div className="notebook-page page-blog">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/blog')}>← Back to Blog</button>
        <p>Post not found.</p>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )

  const idx = (content?.blogPosts ?? []).findIndex(p => p.id === post.id)
  const all = content?.blogPosts ?? []
  const prev = idx < all.length - 1 ? all[idx + 1] : null
  const next = idx > 0 ? all[idx - 1] : null

  return (
    <div className="notebook-page page-blog">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/blog')}>← Back to Blog</button>
        <article className="blog-post-full">
          {post.image && <img src={post.image} alt={post.title} className="post-hero-image" />}
          <header className="blog-post-header">
            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-meta">{post.date}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="blog-tags">{post.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}</div>
            )}
          </header>
          <div className="blog-post-body">
            {post.fullContent.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>
        <nav className="post-navigation">
          {prev && <Link to={`/blog/${prev.id}`} className="post-nav-link post-nav-prev"><span className="post-nav-label">← Previous</span><span className="post-nav-title">{prev.title}</span></Link>}
          {next && <Link to={`/blog/${next.id}`} className="post-nav-link post-nav-next"><span className="post-nav-label">Next →</span><span className="post-nav-title">{next.title}</span></Link>}
        </nav>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

export default BlogPost

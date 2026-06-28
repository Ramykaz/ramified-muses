import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'
import { BlockRenderer } from '../components/BlockEditor'

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const all = content.blogPosts
  const post = all.find(p => p.id === Number(id))

  if (!post) return (
    <div className="page page-blog">
      <div className="page-content">
        <button className="post-back" onClick={() => navigate('/blog')}>← writing</button>
        <p className="empty-msg">// post not found.</p>
      </div>
    </div>
  )

  const idx = all.findIndex(p => p.id === post.id)
  const prev = idx < all.length - 1 ? all[idx + 1] : null
  const next = idx > 0 ? all[idx - 1] : null
  const hasBlocks = post.blocks && post.blocks.length > 0

  return (
    <div className="page page-blog">
      <div className="page-content">
        <button className="post-back" onClick={() => navigate('/blog')}>← writing</button>

        <article className={`post-article bodyfont-${post.bodyFont || 'serif'}`}>
          {post.image && (
            <img src={post.image} alt={post.title} className="post-hero" />
          )}
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <p className="post-date">{post.date}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map(t => <span key={t} className="post-tag">{t}</span>)}
              </div>
            )}
          </header>

          <div className="post-body">
            {hasBlocks
              ? <BlockRenderer blocks={post.blocks!} />
              : post.fullContent
                ? post.fullContent.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                : <p className="empty-msg">// draft not yet published.</p>
            }
          </div>
        </article>

        {(prev || next) && (
          <nav className="post-nav">
            {prev && (
              <Link to={`/blog/${prev.id}`} className="post-nav-link post-nav-prev">
                <span className="post-nav-label">← previous</span>
                <span className="post-nav-title">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link to={`/blog/${next.id}`} className="post-nav-link post-nav-next">
                <span className="post-nav-label">next →</span>
                <span className="post-nav-title">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}

export default BlogPost

import React from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'
import TerminalGame from '../components/TerminalGame'
import { MarginDoodle, NotebookStamp, CircuitDoodle, NeuralDoodle } from '../components/Doodles'

const Blog: React.FC = () => {
  const { content } = useContent()
  const posts = content.blogPosts

  return (
    <div className="page page-blog">
      <MarginDoodle top="160px" side="left" offset="5%" rotate={-6} accent><CircuitDoodle /></MarginDoodle>
      <MarginDoodle top="520px" side="right" offset="6%" rotate={6}><NeuralDoodle /></MarginDoodle>
      <div className="page-content">
        <NotebookStamp>terminal log</NotebookStamp>
        <h2 className="section-label">writing</h2>

        {posts.length === 0 ? (
          <>
            <p className="blog-empty-msg">// nothing published yet.</p>
            <p className="blog-empty-sub">play while you wait ↓</p>
            <TerminalGame />
          </>
        ) : (
          <div className="blog-posts">
            {posts.map(post => (
              <div key={post.id} className="blog-post-item">
                <Link to={`/blog/${post.id}`} className="blog-post-link">
                  {post.title}
                </Link>
                <div className="blog-post-meta">
                  <span>{post.date}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span className="blog-post-tags">
                      {post.tags.map(t => <span key={t} className="post-tag">{t}</span>)}
                    </span>
                  )}
                </div>
                {post.excerpt && (
                  <p className="blog-post-excerpt">{post.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog

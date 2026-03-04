import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useContent } from '../hooks/ContentContext'
import { BlockRenderer } from '../components/BlockEditor'

// ── Shared nav ─────────────────────────────────────────────────
const PostNav = ({ prev, next, basePath }: { prev: { id: number; title: string } | null; next: { id: number; title: string } | null; basePath: string }) => (
  <nav className="post-navigation">
    {prev && (
      <Link to={`${basePath}/${prev.id}`} className="post-nav-link post-nav-prev">
        <span className="post-nav-label">← Previous</span>
        <span className="post-nav-title">{prev.title}</span>
      </Link>
    )}
    {next && (
      <Link to={`${basePath}/${next.id}`} className="post-nav-link post-nav-next">
        <span className="post-nav-label">Next →</span>
        <span className="post-nav-title">{next.title}</span>
      </Link>
    )}
  </nav>
)

// ── Blog Post ──────────────────────────────────────────────────
export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const all = content?.blogPosts ?? []
  const post = all.find(p => p.id === Number(id))
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

  const idx = all.findIndex(p => p.id === post.id)
  const prev = idx < all.length - 1 ? all[idx + 1] : null
  const next = idx > 0 ? all[idx - 1] : null

  // Support both old fullContent string and new blocks
  const hasBlocks = post.blocks && post.blocks.length > 0

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
          {hasBlocks
            ? <BlockRenderer blocks={post.blocks!} />
            : <div className="blog-post-body">{post.fullContent.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
          }
        </article>
        <PostNav prev={prev} next={next} basePath="/blog" />
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

// ── Film Review Post ───────────────────────────────────────────
export const FilmReviewPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const all = content?.filmReviews ?? []
  const review = all.find(r => r.id === Number(id))
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!review) return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/film-reviews')}>← Back</button>
        <p>Review not found.</p>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )

  const idx = all.findIndex(r => r.id === review.id)
  const hasBlocks = review.blocks && review.blocks.length > 0

  return (
    <div className="notebook-page page-film">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/film-reviews')}>← Back to Film Reviews</button>
        <article className="blog-post-full">
          {review.image && <img src={review.image} alt={review.title} className="post-hero-image" />}
          <header className="blog-post-header">
            <h1 className="blog-post-title">
              {review.title}{review.year && <span style={{ fontWeight: 400, fontSize: '1.2rem' }}> ({review.year})</span>}
            </h1>
            <p className="blog-meta">dir. {review.director}</p>
            {review.rating && <p className="film-rating-large">{review.rating}</p>}
          </header>
          {hasBlocks
            ? <BlockRenderer blocks={review.blocks!} />
            : <div className="blog-post-body">{review.fullReview.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
          }
        </article>
        <PostNav prev={idx < all.length - 1 ? all[idx + 1] : null} next={idx > 0 ? all[idx - 1] : null} basePath="/film-reviews" />
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

// ── Research Post ──────────────────────────────────────────────
export const ResearchPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const navigate = useNavigate()
  const all = content?.researchAreas ?? []
  const area = all.find(r => r.id === Number(id))
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!area) return (
    <div className="notebook-page page-research">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/research')}>← Back</button>
        <p>Area not found.</p>
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )

  const idx = all.findIndex(r => r.id === area.id)
  const hasBlocks = area.blocks && area.blocks.length > 0

  return (
    <div className="notebook-page page-research">
      <div className="content-wrapper">
        <button className="back-link" onClick={() => navigate('/research')}>← Back to Research</button>
        <article className="blog-post-full">
          {area.image && <img src={area.image} alt={area.title} className="post-hero-image" />}
          <header className="blog-post-header">
            <h1 className="blog-post-title">{area.title}</h1>
            {area.tags && area.tags.length > 0 && (
              <div className="blog-tags">{area.tags.map(t => <span key={t} className="blog-tag">{t}</span>)}</div>
            )}
          </header>
          {hasBlocks
            ? <BlockRenderer blocks={area.blocks!} />
            : <div className="blog-post-body">{area.details.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
          }
        </article>
        <PostNav prev={idx < all.length - 1 ? all[idx + 1] : null} next={idx > 0 ? all[idx - 1] : null} basePath="/research" />
      </div>
      <div className="date">{currentDate}</div>
    </div>
  )
}

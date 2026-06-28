import React, { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/ThemeContext'

const NAV_ITEMS = [
  { path: '/projects',     label: 'projects' },
  { path: '/experience',   label: 'experience' },
  { path: '/blog',         label: 'blog' },
  { path: '/reading-list', label: 'reading' },
  { path: '/contact',      label: 'contact' },
]

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const taps = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHome = () => {
    taps.current++
    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { taps.current = 0 }, 1400)
    if (taps.current >= 5) {
      taps.current = 0
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <button className="nav-home" onClick={handleHome}>
          ramadan.sh
        </button>

        <div className="nav-links">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          className="theme-btn"
          onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
          aria-label="Toggle theme"
        >
          {theme === 'day' ? '○' : '●'}
        </button>

        <button
          className={`nav-burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-mobile-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navigation

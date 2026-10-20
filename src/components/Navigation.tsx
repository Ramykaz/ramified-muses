import React, { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ThemeToggleChain from './ThemeToggleChain'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const lightOn = theme === 'day'
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
    <>
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
            {/* the bulb retracts once you scroll on mobile, so the spell lives here */}
            <button
              type="button"
              className="nav-mobile-spell"
              onClick={() => setTheme(lightOn ? 'night' : 'day')}
              aria-label={lightOn ? 'Turn the light off (night mode)' : 'Turn the light on (day mode)'}
            >
              {lightOn ? 'nox' : 'lumos'}
            </button>
          </div>
        )}
      </nav>
      <ThemeToggleChain />
    </>
  )
}

export default Navigation

import React, { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeSwitcher from './ThemeSwitcher'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoTapCount, setLogoTapCount] = useState(0)
  const logoTapTimer = useRef<number | null>(null)

  const navItems = [
    { path: '/',             label: 'Home' },
    { path: '/projects',     label: 'Projects' },
    { path: '/reading-list', label: 'Reading List' },
    { path: '/film-reviews', label: 'Film Reviews' },
    { path: '/research',     label: 'Research' },
    { path: '/blog',         label: 'Blog' },
    { path: '/contact',      label: 'Contact' },
  ]

  const handleNav = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  const handleSecretDoor = () => {
    const nextCount = logoTapCount + 1
    setLogoTapCount(nextCount)
    if (logoTapTimer.current) window.clearTimeout(logoTapTimer.current)
    logoTapTimer.current = window.setTimeout(() => setLogoTapCount(0), 1200)
    if (nextCount >= 5) {
      setLogoTapCount(0)
      if (logoTapTimer.current) window.clearTimeout(logoTapTimer.current)
      navigate('/admin')
    }
  }

  return (
    <>
      <div className="logo-container">
        <img
          src="/3-Photoroom1.png"
          alt="Ramified Muses"
          className="logo-image"
          onClick={handleSecretDoor}
        />
      </div>

      <nav className="top-nav">
        {/* Desktop tabs — hidden on mobile */}
        <div className="nav-tabs">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side: theme switcher + hamburger */}
        <div className="nav-right">
          <ThemeSwitcher />
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`bar ${menuOpen ? 'open-top' : ''}`} />
            <span className={`bar ${menuOpen ? 'open-mid' : ''}`} />
            <span className={`bar ${menuOpen ? 'open-bot' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {navItems.map(item => (
              <button
                key={item.path}
                className={`nav-mobile-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation

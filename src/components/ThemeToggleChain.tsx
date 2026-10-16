import React, { useState } from 'react'
import { useTheme } from '../hooks/ThemeContext'

/**
 * A ceiling-light pull-chain used as the day/night toggle — click (or pull)
 * the bead to switch themes. Replaces the old low-contrast dot button,
 * which was nearly invisible in night mode.
 */
const ThemeToggleChain: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [pulling, setPulling] = useState(false)

  const handlePull = () => {
    setPulling(true)
    setTheme(theme === 'day' ? 'night' : 'day')
    window.setTimeout(() => setPulling(false), 480)
  }

  return (
    <button
      type="button"
      className={`chain-toggle${pulling ? ' pulling' : ''}`}
      onClick={handlePull}
      aria-label="Toggle day/night theme"
      title={theme === 'day' ? 'Pull for night mode' : 'Pull for day mode'}
    >
      <svg className="chain-cord" viewBox="0 0 10 50" width="9" height="50" aria-hidden="true">
        <line x1="5" y1="0" x2="5" y2="40" stroke="currentColor" strokeWidth="1.3" strokeDasharray="0.5 6" strokeLinecap="round" />
        <circle cx="5" cy="4" r="1.5" fill="currentColor" />
        <circle cx="5" cy="14" r="1.5" fill="currentColor" />
        <circle cx="5" cy="24" r="1.5" fill="currentColor" />
        <circle cx="5" cy="34" r="1.5" fill="currentColor" />
      </svg>
      <svg className="chain-bead" viewBox="0 0 20 26" width="16" height="21" aria-hidden="true">
        <path
          d="M10 1.5c3 0 5.2 2.3 5.2 5.3 0 2.9-2.2 4.4-2.2 7.3v7.2a3 3 0 0 1-6 0v-7.2c0-2.9-2.2-4.4-2.2-7.3 0-3 2.2-5.3 5.2-5.3Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

export default ThemeToggleChain

import React from 'react'
import { useTheme } from '../hooks/ThemeContext'

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const isNight = theme === 'night'
  const nextTheme = isNight ? 'day' : 'night'
  const icon = isNight ? '☾' : '☀'
  const label = isNight ? 'Night' : 'Day'

  return (
    <div className="theme-switcher">
      <button
        className="theme-toggle-btn"
        onClick={() => setTheme(nextTheme)}
        title={`Switch to ${nextTheme} mode`}
        tabIndex={0}
      >
        <span>{icon}</span>
        <span className="theme-current-label">{label}</span>
      </button>
    </div>
  )
}

export default ThemeSwitcher

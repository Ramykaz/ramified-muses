import React, { useEffect, useId, useState } from 'react'
import { useTheme } from '../hooks/ThemeContext'

/**
 * A hanging incandescent bulb used as the day/night toggle. Day = lit,
 * night = switched off. Click the bulb (or "lumos"/"nox" in the mobile menu)
 * to flip it; any theme change plays the pull-swing + filament flicker.
 */
const ThemeToggleChain: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const isOn = theme === 'day'
  const [anim, setAnim] = useState(false)
  const [prevTheme, setPrevTheme] = useState(theme)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${name}-${uid}`

  // theme changed (from the bulb or the nav icon) → replay swing + flicker
  if (theme !== prevTheme) {
    setPrevTheme(theme)
    setAnim(true)
  }

  // once the page scrolls, the bulb retracts into the nav on narrow screens
  // (CSS decides when) so it never hangs over text or photos
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!anim) return
    const t = window.setTimeout(() => setAnim(false), 900)
    return () => window.clearTimeout(t)
  }, [anim, theme])

  return (
    <>
      {/* laptop view: the spell sits in the nav bar, right above the bulb */}
      <button
        type="button"
        className={`bulb-spell${isOn ? ' on' : ''}`}
        onClick={() => setTheme(isOn ? 'night' : 'day')}
        aria-label={isOn ? 'Turn the light off (night mode)' : 'Turn the light on (day mode)'}
      >
        {isOn ? 'nox' : 'lumos'}
      </button>
      <button
        type="button"
        className={`bulb-toggle${isOn ? ' on' : ' off'}${anim ? ' pulling' : ''}${scrolled ? ' scrolled' : ''}`}
        onClick={() => setTheme(isOn ? 'night' : 'day')}
        aria-label={isOn ? 'Turn the light off (night mode)' : 'Turn the light on (day mode)'}
        title={isOn ? 'Turn off the light' : 'Turn on the light'}
      >
        <svg className="bulb-svg" viewBox="0 0 60 104" width="46" height="80" aria-hidden="true">
          <defs>
            <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9a3" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#ffd25e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffc93c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id('glassOn')} cx="45%" cy="40%" r="62%">
              <stop offset="0%" stopColor="#fffdf2" />
              <stop offset="35%" stopColor="#fff1b8" />
              <stop offset="75%" stopColor="#ffd56b" />
              <stop offset="100%" stopColor="#f0a92e" />
            </radialGradient>
            <radialGradient id={id('glassOff')} cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#f4f6f8" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#c9cfd6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#8e969f" stopOpacity="0.7" />
            </radialGradient>
            <linearGradient id={id('metal')} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#7d7f82" />
              <stop offset="25%" stopColor="#e9eaec" />
              <stop offset="50%" stopColor="#b4b6b9" />
              <stop offset="80%" stopColor="#6c6e71" />
              <stop offset="100%" stopColor="#4d4f52" />
            </linearGradient>
            <linearGradient id={id('socket')} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1b1b1b" />
              <stop offset="35%" stopColor="#4a4a4a" />
              <stop offset="100%" stopColor="#141414" />
            </linearGradient>
            <filter id={id('fglow')} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="bulb-swing">
            {/* cord */}
            <line x1="30" y1="0" x2="30" y2="20" stroke="currentColor" strokeWidth="1.6" />

            {/* light halo (only visible when on) */}
            <circle className="bulb-halo" cx="30" cy="72" r="30" fill={`url(#${id('halo')})`} />

            {/* socket */}
            <rect x="22" y="18" width="16" height="11" rx="2" fill={`url(#${id('socket')})`} />
            <rect x="21" y="27" width="18" height="2.5" rx="1" fill="#2b2b2b" />

            {/* threaded screw base */}
            <rect x="23" y="29.5" width="14" height="13" fill={`url(#${id('metal')})`} />
            {[32, 35.5, 39].map(y => (
              <path key={y} d={`M23 ${y} Q30 ${y + 1.8} 37 ${y}`} stroke="#55575a" strokeWidth="0.9" fill="none" opacity="0.8" />
            ))}
            <path d="M24 42.5 h12 l-1.5 2.5 h-9 Z" fill="#5e6063" />

            {/* glass globe */}
            <path
              className="bulb-glass"
              d="M24.5 45 C24.5 51, 12 56, 12 70 A18 18 0 0 0 48 70 C48 56, 35.5 51, 35.5 45 Z"
              fill={`url(#${id(isOn ? 'glassOn' : 'glassOff')})`}
              stroke={isOn ? '#e9a93a' : '#9aa1a9'}
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />

            {/* filament stem + support wires */}
            <path d="M27 45 L27 52 M33 45 L33 52" stroke="#9a9a9a" strokeWidth="0.8" />
            <path d="M27 52 L24 66 M33 52 L36 66" stroke={isOn ? '#e8c06a' : '#7c7c7c'} strokeWidth="0.7" />
            <path d="M28.5 48 h3 l-0.4 5 h-2.2 Z" fill="#dcdcdc" opacity="0.7" />

            {/* coiled filament */}
            <path
              className="bulb-filament"
              d="M24 66 q1 -2.4 2 0 t2 0 t2 0 t2 0 t2 0 t2 0"
              stroke={isOn ? '#fffbe0' : '#6b5a45'}
              strokeWidth={isOn ? 1.3 : 1}
              fill="none"
              strokeLinecap="round"
              filter={isOn ? `url(#${id('fglow')})` : undefined}
            />

            {/* glass highlights */}
            <path d="M17.5 64 C17.5 58, 21 54, 25 52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
            <ellipse cx="19.5" cy="72" rx="1.6" ry="3.2" fill="#ffffff" opacity="0.4" />
          </g>
        </svg>
      </button>
    </>
  )
}

export default ThemeToggleChain

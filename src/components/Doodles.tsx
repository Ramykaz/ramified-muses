import React from 'react'

/**
 * Small hand-drawn-style SVG doodles used as margin decoration per page.
 * Each renders at 100%/100% so sizing is controlled by the wrapper's CSS
 * (see .margin-doodle in globals.css). All use currentColor so they pick
 * up theme/accent color from their wrapper.
 */
const base = {
  viewBox: '0 0 64 64',
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const GearDoodle: React.FC = () => (
  <svg {...base}>
    <circle cx="32" cy="32" r="13" />
    <circle cx="32" cy="32" r="4.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
      <line key={angle} x1="32" y1="14" x2="32" y2="20" transform={`rotate(${angle} 32 32)`} />
    ))}
  </svg>
)

export const CircuitDoodle: React.FC = () => (
  <svg {...base}>
    <path d="M4 52 L18 52 L18 32 L38 32 L38 14 L58 14" />
    <circle cx="4" cy="52" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="18" cy="32" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="38" cy="14" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="58" cy="14" r="2.4" fill="currentColor" stroke="none" />
  </svg>
)

export const RadarDoodle: React.FC = () => (
  <svg {...base}>
    <line x1="32" y1="56" x2="32" y2="24" />
    <path d="M18 24 A14 14 0 0 1 46 24" />
    <path d="M23 24 A9 9 0 0 1 41 24" />
    <circle cx="32" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="40" cy="16" r="1.6" fill="currentColor" stroke="none" />
  </svg>
)

export const NeuralDoodle: React.FC = () => (
  <svg {...base}>
    <circle cx="12" cy="16" r="3" />
    <circle cx="12" cy="48" r="3" />
    <circle cx="48" cy="24" r="3" />
    <circle cx="48" cy="42" r="3" />
    <line x1="12" y1="16" x2="48" y2="24" />
    <line x1="12" y1="16" x2="48" y2="42" />
    <line x1="12" y1="48" x2="48" y2="24" />
    <line x1="12" y1="48" x2="48" y2="42" />
  </svg>
)

export const BookStackDoodle: React.FC = () => (
  <svg {...base}>
    <rect x="9" y="39" width="38" height="8" rx="1.5" transform="rotate(-4 28 43)" />
    <rect x="7" y="28" width="42" height="8" rx="1.5" transform="rotate(3 28 32)" />
    <rect x="11" y="17" width="34" height="8" rx="1.5" transform="rotate(-2 28 21)" />
  </svg>
)

export const BookmarkDoodle: React.FC = () => (
  <svg {...base}>
    <path d="M21 8 H41 V54 L31 45 L21 54 Z" />
  </svg>
)

export const CoffeeRingDoodle: React.FC = () => (
  <svg {...base}>
    <ellipse cx="32" cy="32" rx="18" ry="13" />
    <ellipse cx="32" cy="32" rx="13" ry="9.5" />
  </svg>
)

export const PinDoodle: React.FC = () => (
  <svg {...base}>
    <path d="M32 57 C20 40 14 29 14 21 a18 18 0 0 1 36 0 c0 8 -6 19 -18 36 Z" />
    <circle cx="32" cy="21" r="6" />
  </svg>
)

export const BriefcaseDoodle: React.FC = () => (
  <svg {...base}>
    <rect x="9" y="23" width="46" height="29" rx="3" />
    <path d="M23 23 v-6 a4 4 0 0 1 4-4 h10 a4 4 0 0 1 4 4 v6" />
    <line x1="9" y1="36" x2="55" y2="36" />
  </svg>
)

export const EnvelopeDoodle: React.FC = () => (
  <svg {...base}>
    <rect x="7" y="16" width="50" height="33" rx="2" />
    <path d="M7 18 L32 37 L57 18" />
  </svg>
)

export const PaperPlaneDoodle: React.FC = () => (
  <svg {...base}>
    <path d="M5 35 L58 13 L33 59 L27 38 Z" />
    <path d="M27 38 L58 13" />
  </svg>
)

export const CompassDoodle: React.FC = () => (
  <svg {...base}>
    <circle cx="32" cy="32" r="21" />
    <path d="M32 15 L37 32 L32 49 L27 32 Z" />
    <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
  </svg>
)

export const BulbDoodle: React.FC = () => (
  <svg {...base}>
    <path d="M32 9 a15 15 0 0 1 8 27 c-2 2 -3 4.5 -3 7.5 h-10 c0 -3 -1 -5.5 -3 -7.5 a15 15 0 0 1 8 -27 Z" />
    <line x1="27" y1="49" x2="37" y2="49" />
    <line x1="28.5" y1="53" x2="35.5" y2="53" />
  </svg>
)

/** Absolutely-positioned margin decoration — hidden on narrower viewports. */
export const MarginDoodle: React.FC<{
  children: React.ReactNode
  top: string
  side: 'left' | 'right'
  offset?: string
  rotate?: number
  accent?: boolean
}> = ({ children, top, side, offset = '4%', rotate = 0, accent = false }) => (
  <div
    className={`margin-doodle${accent ? ' margin-doodle--accent' : ''}`}
    style={{ top, [side]: offset, transform: `rotate(${rotate}deg)` }}
    aria-hidden="true"
  >
    {children}
  </div>
)

/** Small rotated handwritten-style badge, meant to sit at the top of a page. */
export const NotebookStamp: React.FC<{ children: React.ReactNode; rotate?: number }> = ({ children, rotate = -3 }) => (
  <span className="notebook-stamp page-stamp" style={{ transform: `rotate(${rotate}deg)` }}>
    {children}
  </span>
)

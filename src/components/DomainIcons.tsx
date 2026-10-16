import React from 'react'

const base = {
  viewBox: '0 0 24 24',
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const DroneIcon: React.FC = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="2.3" />
    <line x1="12" y1="9.7" x2="12" y2="5.2" />
    <line x1="12" y1="14.3" x2="12" y2="18.8" />
    <line x1="9.7" y1="12" x2="5.2" y2="12" />
    <line x1="14.3" y1="12" x2="18.8" y2="12" />
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
    <circle cx="12" cy="5" r="1.9" />
    <circle cx="12" cy="19" r="1.9" />
  </svg>
)

export const ChipIcon: React.FC = () => (
  <svg {...base}>
    <rect x="7" y="7" width="10" height="10" rx="1.4" />
    <rect x="10.2" y="10.2" width="3.6" height="3.6" />
    <line x1="9" y1="3" x2="9" y2="7" />
    <line x1="15" y1="3" x2="15" y2="7" />
    <line x1="9" y1="17" x2="9" y2="21" />
    <line x1="15" y1="17" x2="15" y2="21" />
    <line x1="3" y1="9" x2="7" y2="9" />
    <line x1="3" y1="15" x2="7" y2="15" />
    <line x1="17" y1="9" x2="21" y2="9" />
    <line x1="17" y1="15" x2="21" y2="15" />
  </svg>
)

export const VisionIcon: React.FC = () => (
  <svg {...base}>
    <path d="M3 12c3-5.2 6.4-7.5 9-7.5s6 2.3 9 7.5c-3 5.2-6.4 7.5-9 7.5s-6-2.3-9-7.5Z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)

export const BrainIcon: React.FC = () => (
  <svg {...base}>
    <circle cx="7" cy="7.5" r="2" />
    <circle cx="17" cy="7.5" r="2" />
    <circle cx="7" cy="16.5" r="2" />
    <circle cx="17" cy="16.5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <line x1="8.4" y1="8.9" x2="10.6" y2="10.6" />
    <line x1="15.6" y1="8.9" x2="13.4" y2="10.6" />
    <line x1="8.4" y1="15.1" x2="10.6" y2="13.4" />
    <line x1="15.6" y1="15.1" x2="13.4" y2="13.4" />
  </svg>
)

export const SolarIcon: React.FC = () => (
  <svg {...base}>
    <rect x="4" y="9.5" width="16" height="10.5" rx="1" />
    <line x1="4" y1="14.75" x2="20" y2="14.75" />
    <line x1="9.3" y1="9.5" x2="9.3" y2="20" />
    <line x1="14.7" y1="9.5" x2="14.7" y2="20" />
    <circle cx="12" cy="3.6" r="1.5" />
    <line x1="8.3" y1="5.1" x2="6.6" y2="3.6" />
    <line x1="15.7" y1="5.1" x2="17.4" y2="3.6" />
  </svg>
)

export const FrontendIcon: React.FC = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <circle cx="6" cy="7" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="8.4" cy="7" r="0.5" fill="currentColor" stroke="none" />
    <path d="M9 13 L6.8 15 L9 17" />
    <path d="M15 13 L17.2 15 L15 17" />
  </svg>
)

export const ResearchIcon: React.FC = () => (
  <svg {...base}>
    <rect x="5" y="3" width="10" height="13" rx="1" />
    <line x1="7.5" y1="6.6" x2="12.5" y2="6.6" />
    <line x1="7.5" y1="9.6" x2="12.5" y2="9.6" />
    <circle cx="15.3" cy="15.3" r="3.4" />
    <line x1="17.7" y1="17.7" x2="20.5" y2="20.5" />
  </svg>
)

export const GearIcon: React.FC = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4.4" />
    <circle cx="12" cy="12" r="1.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
      <line key={angle} x1="12" y1="2.6" x2="12" y2="6.2" transform={`rotate(${angle} 12 12)`} />
    ))}
  </svg>
)

const RULES: [RegExp, React.FC][] = [
  [/drone|uav|search-and-rescue|wisard/, DroneIcon],
  [/solar|electroluminescence|panel defect/, SolarIcon],
  [/vehicle|driver|parking|steering wheel|optima/, VisionIcon],
  [/stakeholder|undp|\bllm\b|\brag\b|groq|llama|natural language|pgvector/, BrainIcon],
  [/frontend|buthur|education platform/, FrontendIcon],
  [/orsam|sentiment|discourse|arabic|social media/, ResearchIcon],
  [/tensorrt|jetson|embedded|quantiz|edge ai|pruning/, ChipIcon],
]

function pickIcon(text: string): React.FC {
  const t = text.toLowerCase()
  for (const [pattern, Icon] of RULES) {
    if (pattern.test(t)) return Icon
  }
  return GearIcon
}

export const DomainIcon: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const Icon = pickIcon(text)
  return (
    <span className={`domain-icon${className ? ' ' + className : ''}`} aria-hidden="true">
      <Icon />
    </span>
  )
}

import { useNavigate, useLocation } from 'react-router-dom'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/reading-list', label: 'Reading List' },
    { path: '/film-reviews', label: 'Film Reviews' },
    { path: '/research', label: 'Research' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' }
  ]

  return (
    <>
      <div className="logo-container">
        <img
          src="/log.svg"
          alt="Ramified Muses"
          className="logo-image"
        />
      </div>

      <nav className="top-nav">
        <div className="nav-tabs">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Navigation

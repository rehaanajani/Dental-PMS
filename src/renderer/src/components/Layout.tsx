import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const modules = [
  { path: '/', label: 'Dashboard', end: true },
  { path: '/patients', label: 'Patients', end: false },
  { path: '/appointments', label: 'Appointments', end: false },
  { path: '/visits', label: 'Visits', end: false },
  { path: '/prescriptions', label: 'Prescriptions', end: false },
  { path: '/billing', label: 'Billing', end: false },
  { path: '/backup', label: 'Backup', end: false },
  { path: '/settings', label: 'Settings', end: false },
]

export function Layout(): JSX.Element {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  function handleGlobalSearch(e: React.FormEvent): void {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/patients?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <div className="desktop-bg">
      <div className="app-shell">
        {/* Header */}
        <header className="app-header">
          <div className="brand-block">
            <div className="brand-logo">D</div>
            <div>
              <div className="brand-name">Darediya Dental Hub PMS</div>

            </div>
          </div>

          <nav className="module-pills">
            {modules.map(m => (
              <NavLink key={m.path} to={m.path} end={m.end}
                className={({ isActive }) => `module-pill${isActive ? ' active' : ''}`}>
                {m.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <form onSubmit={handleGlobalSearch} style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find patient..."
                className="field-input"
                style={{ width: 160, fontSize: 12 }}
              />
            </form>
            <span className="status-dot status-dot-success" title="Offline — local database" />
            <span className="header-date">{dateStr}</span>
          </div>
        </header>

        {/* Body */}
        <div className="shell-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

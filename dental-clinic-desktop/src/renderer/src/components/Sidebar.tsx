import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/backup', label: 'Backup' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dental Clinic</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

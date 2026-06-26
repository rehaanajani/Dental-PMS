import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let title = 'Dashboard';
  if (location.pathname.startsWith('/patients')) title = 'Patients';
  if (location.pathname.startsWith('/appointments')) title = 'Appointments';
  if (location.pathname.startsWith('/settings')) title = 'Settings';
  if (location.pathname.startsWith('/backup')) title = 'Backup';

  return (
    <header className="topbar">
      <h1 className="page-title">{title}</h1>
      <div className="current-date">{dateStr}</div>
    </header>
  );
}

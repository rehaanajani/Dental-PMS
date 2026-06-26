import { createHashRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BackupPage } from './pages/BackupPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'patients', element: <PatientsPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'backup', element: <BackupPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

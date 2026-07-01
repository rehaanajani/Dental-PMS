import { createHashRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { NewPatientPage } from './pages/NewPatientPage'
import { EditPatientPage } from './pages/EditPatientPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { NewVisitPage } from './pages/NewVisitPage'
import { VisitDetailPage } from './pages/VisitDetailPage'
import { PrescriptionPrintPage } from './pages/PrescriptionPrintPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { NewAppointmentPage } from './pages/NewAppointmentPage'
import { EditAppointmentPage } from './pages/EditAppointmentPage'
import { VisitsPage } from './pages/VisitsPage'
import { EditVisitPage } from './pages/EditVisitPage'
import { PrescriptionsPage } from './pages/PrescriptionsPage'
import { BillingPage } from './pages/BillingPage'
import { BackupPage } from './pages/BackupPage'
import { SettingsPage } from './pages/SettingsPage'

export const router = createHashRouter([
  // Print page outside main layout (no sidebar/header)
  { path: '/visits/:visitId/print', element: <PrescriptionPrintPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'patients', element: <PatientsPage /> },
      { path: 'patients/new', element: <NewPatientPage /> },
      { path: 'patients/:id', element: <PatientDetailPage /> },
      { path: 'patients/:id/edit', element: <EditPatientPage /> },
      { path: 'patients/:id/new-visit', element: <NewVisitPage /> },
      { path: 'visits/:visitId', element: <VisitDetailPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'appointments/new', element: <NewAppointmentPage /> },
      { path: 'appointments/:id/edit', element: <EditAppointmentPage /> },
      { path: 'visits', element: <VisitsPage /> },
      { path: 'visits/:visitId/edit', element: <EditVisitPage /> },
      { path: 'prescriptions', element: <PrescriptionsPage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'backup', element: <BackupPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
])

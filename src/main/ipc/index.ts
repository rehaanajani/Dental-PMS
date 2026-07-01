import { registerPatientIpc } from './patient.ipc'
import { registerVisitIpc } from './visit.ipc'
import { registerAppointmentIpc } from './appointment.ipc'
import { registerSettingsIpc } from './settings.ipc'
import { registerBackupIpc } from './backup.ipc'
import { registerPrintIpc } from './print.ipc'

export function registerAllIpc(): void {
  registerPatientIpc()
  registerVisitIpc()
  registerAppointmentIpc()
  registerSettingsIpc()
  registerBackupIpc()
  registerPrintIpc()
}

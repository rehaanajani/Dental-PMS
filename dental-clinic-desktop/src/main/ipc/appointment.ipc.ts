import { ipcMain } from 'electron'
import {
  createAppointment,
  updateAppointment,
  getAppointmentById,
  listAppointmentsByDate,
  listUpcomingAppointments,
  listAllAppointments,
  markCompleted,
  cancelAppointment,
  deleteAppointment
} from '../services/appointment.service'

export function registerAppointmentIpc(): void {
  ipcMain.handle('appointments:create', (_event, data) => {
    return createAppointment(data)
  })

  ipcMain.handle('appointments:update', (_event, id: string, data) => {
    return updateAppointment(id, data)
  })

  ipcMain.handle('appointments:getById', (_event, id: string) => {
    return getAppointmentById(id)
  })

  ipcMain.handle('appointments:listByDate', (_event, date: string) => {
    return listAppointmentsByDate(date)
  })

  ipcMain.handle('appointments:listUpcoming', () => {
    return listUpcomingAppointments()
  })

  ipcMain.handle('appointments:listAll', () => {
    return listAllAppointments()
  })

  ipcMain.handle('appointments:markCompleted', (_event, id: string) => {
    return markCompleted(id)
  })

  ipcMain.handle('appointments:cancel', (_event, id: string) => {
    return cancelAppointment(id)
  })

  ipcMain.handle('appointments:delete', (_event, id: string) => {
    return deleteAppointment(id)
  })
}

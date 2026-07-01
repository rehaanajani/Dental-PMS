import { ipcMain } from 'electron'
import {
  createPatient,
  updatePatient,
  getPatientById,
  searchPatients,
  listRecentPatients,
  countPatients,
  deletePatient
} from '../services/patient.service'

export function registerPatientIpc(): void {
  ipcMain.handle('patients:create', (_event, data) => {
    return createPatient(data)
  })

  ipcMain.handle('patients:update', (_event, id: string, data) => {
    return updatePatient(id, data)
  })

  ipcMain.handle('patients:getById', (_event, id: string) => {
    return getPatientById(id)
  })

  ipcMain.handle('patients:search', (_event, query: string) => {
    return searchPatients(query)
  })

  ipcMain.handle('patients:listRecent', () => {
    return listRecentPatients()
  })

  ipcMain.handle('patients:count', () => {
    return countPatients()
  })

  ipcMain.handle('patients:delete', (_event, id: string) => {
    return deletePatient(id)
  })
}

import { ipcMain } from 'electron'
import {
  createVisit,
  updateVisit,
  getVisitById,
  getVisitWithMedicines,
  listVisitsByPatient,
  listRecentVisits,
  getMedicinesByVisit,
  listAllVisits,
  listPrescriptions,
  getDashboardStats,
  deleteVisit
} from '../services/visit.service'

export function registerVisitIpc(): void {
  ipcMain.handle('visits:create', (_event, data) => {
    return createVisit(data)
  })

  ipcMain.handle('visits:update', (_event, id: string, data) => {
    return updateVisit(id, data)
  })

  ipcMain.handle('visits:getById', (_event, id: string) => {
    return getVisitById(id)
  })

  ipcMain.handle('visits:getWithMedicines', (_event, id: string) => {
    return getVisitWithMedicines(id)
  })

  ipcMain.handle('visits:listByPatient', (_event, patientId: string) => {
    return listVisitsByPatient(patientId)
  })

  ipcMain.handle('visits:listRecent', () => {
    return listRecentVisits()
  })

  ipcMain.handle('visits:getMedicines', (_event, visitId: string) => {
    return getMedicinesByVisit(visitId)
  })

  ipcMain.handle('visits:listAll', () => {
    return listAllVisits()
  })

  ipcMain.handle('visits:listPrescriptions', () => {
    return listPrescriptions()
  })

  ipcMain.handle('visits:getDashboardStats', () => {
    return getDashboardStats()
  })

  ipcMain.handle('visits:delete', (_event, id: string) => {
    return deleteVisit(id)
  })
}

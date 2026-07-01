import { ipcMain } from 'electron'
import { createBackup, getLastBackup } from '../services/backup.service'

export function registerBackupIpc(): void {
  ipcMain.handle('backup:create', async () => {
    return createBackup()
  })

  ipcMain.handle('backup:getLast', () => {
    return getLastBackup()
  })
}

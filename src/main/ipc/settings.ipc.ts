import { ipcMain } from 'electron'
import { getSettings, updateSettings } from '../services/settings.service'

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:update', (_event, data) => {
    return updateSettings(data)
  })
}

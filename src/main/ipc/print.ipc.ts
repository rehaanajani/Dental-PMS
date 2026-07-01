import { ipcMain, app, shell } from 'electron'
import path from 'path'
import fs from 'fs'

export function registerPrintIpc(): void {
  ipcMain.handle('print:generateAndOpen', async (event) => {
    const pdfBuffer = await event.sender.printToPDF({})
    const filePath = path.join(app.getPath('temp'), `prescription-${Date.now()}.pdf`)
    fs.writeFileSync(filePath, pdfBuffer)

    const error = await shell.openPath(filePath)
    if (error) {
      throw new Error(`Could not open PDF: ${error}`)
    }
    return { success: true, path: filePath }
  })
}

import { app, BrowserWindow, shell, Menu } from 'electron'
import path from 'path'
import { initDb } from './database/db'
import { runMigrations } from './database/migrations'
import { registerAllIpc } from './ipc/index'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    title: 'Darediya Dental Hub PMS',
    icon,
    backgroundColor: '#D8DEE8',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  console.log('[Main] ELECTRON_RENDERER_URL =', process.env['ELECTRON_RENDERER_URL'])

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('[Main] did-start-loading')
  })

  mainWindow.webContents.on('dom-ready', () => {
    console.log('[Main] dom-ready')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Main] did-finish-load')
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Main] did-fail-load:', errorCode, errorDescription)
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Main] render-process-gone:', details.reason, details.exitCode)
  })

  mainWindow.on('unresponsive', () => {
    console.error('[Main] window unresponsive')
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levels = ['verbose', 'info', 'warning', 'error']
    console.log(`[Renderer:${levels[level] ?? level}] ${message} (${sourceId}:${line})`)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    if (process.env['ELECTRON_RENDERER_URL']) {
      mainWindow!.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  try {
    const db = initDb()
    runMigrations(db)
    console.log('[Main] Database initialized successfully')
  } catch (err) {
    console.error('[Main] Database initialization failed:', err)
  }

  // Register all IPC handlers
  try {
    registerAllIpc()
    console.log('[Main] IPC handlers registered')
  } catch (err) {
    console.error('[Main] IPC registration failed:', err)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

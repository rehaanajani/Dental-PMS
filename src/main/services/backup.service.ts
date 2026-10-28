import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

import { getDb } from '../database/db'

export interface BackupRecord {
  id: string
  backup_path: string
  backup_date: string
  status: string
  notes: string
}

export function getLastBackup(): BackupRecord | null {
  const db = getDb()
  return db.prepare('SELECT * FROM backups ORDER BY backup_date DESC LIMIT 1').get() as BackupRecord | null
}

export async function createBackup(): Promise<{ success: boolean; path?: string; error?: string }> {

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
  const fileName = `dental-pms-backup-${timestamp}.zip`

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Save Backup',
    defaultPath: path.join(app.getPath('documents'), fileName),
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
  })

  if (canceled || !filePath) {
    return { success: false, error: 'Cancelled' }
  }

  // The DB runs in WAL mode, so clinic.db alone may be missing recent writes
  // that still sit in clinic.db-wal. db.backup() writes a consistent snapshot.
  const snapshotPath = path.join(os.tmpdir(), `dental-pms-snapshot-${Date.now()}.db`)
  try {
    await getDb().backup(snapshotPath)
  } catch (e) {
    return { success: false, error: `Could not snapshot database: ${(e as Error).message}` }
  }

  return new Promise(async (resolve) => {
    const archiverModule = await import('archiver')
    const archiver = archiverModule.default || archiverModule

    const output = fs.createWriteStream(filePath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      // Record in DB
      try {
        const db = getDb()
        const now = new Date().toISOString()
        const crypto = require('crypto')
        db.prepare(`
          INSERT INTO backups (id, backup_path, backup_date, status, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), filePath, now, 'Success', `${archive.pointer()} bytes`)
      } catch (e) {
        console.error('[Backup] Failed to record backup:', e)
      }
      fs.rm(snapshotPath, { force: true }, () => {})
      resolve({ success: true, path: filePath })
    })

    archive.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })

    archive.pipe(output)

    // Add database file
    archive.file(snapshotPath, { name: 'data/clinic.db' })

    // Add metadata
    const meta = JSON.stringify({
      version: '1.0',
      created_at: new Date().toISOString(),
      app: 'Darediya Dental Hub PMS',
    }, null, 2)
    archive.append(meta, { name: 'metadata.json' })

    archive.finalize()
  })
}

import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import crypto from 'crypto'

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
  return db.prepare("SELECT * FROM backups WHERE status = 'Success' ORDER BY backup_date DESC LIMIT 1").get() as BackupRecord | null
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

  // archiver v8 is ESM-only and has no default export — use the ZipArchive class
  const { ZipArchive } = await import('archiver')

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: { success: boolean; path?: string; error?: string }, notes: string): void => {
      if (settled) return
      settled = true
      fs.rm(snapshotPath, { force: true }, () => {})
      recordBackup(filePath, result.success ? 'Success' : 'Failed', notes)
      resolve(result)
    }

    const output = fs.createWriteStream(filePath)
    const archive = new ZipArchive({ zlib: { level: 9 } })

    output.on('close', () => {
      finish({ success: true, path: filePath }, `${archive.pointer()} bytes`)
    })

    // Without these the promise never settles when the location is read-only or the disk is full
    output.on('error', (err: Error) => {
      archive.abort()
      finish({ success: false, error: err.message }, err.message)
    })
    archive.on('error', (err: Error) => {
      output.destroy()
      finish({ success: false, error: err.message }, err.message)
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

function recordBackup(backupPath: string, status: 'Success' | 'Failed', notes: string): void {
  try {
    getDb().prepare(`
      INSERT INTO backups (id, backup_path, backup_date, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), backupPath, new Date().toISOString(), status, notes)
  } catch (e) {
    console.error('[Backup] Failed to record backup:', e)
  }
}

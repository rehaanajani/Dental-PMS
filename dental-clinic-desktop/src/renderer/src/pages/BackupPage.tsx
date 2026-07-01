import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function BackupPage(): JSX.Element {
  const [lastBackup, setLastBackup] = useState<{ backup_path: string; backup_date: string; status: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.backup.getLast().then(b => setLastBackup(b))
  }, [])

  async function handleBackup(): Promise<void> {
    setCreating(true); setResult(''); setError('')
    try {
      const res = await api.backup.create()
      if (res.success) {
        setResult(`Backup created: ${res.path}`)
        api.backup.getLast().then(b => setLastBackup(b))
      } else {
        if (res.error !== 'Cancelled') setError(res.error ?? 'Backup failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="workspace">
      <div className="page-header">
        <div><h2 className="page-title">Backup</h2><div className="page-subtitle">Protect local clinic data</div></div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="premium-card" style={{ marginBottom: 16 }}>
          <div className="section-title">Backup Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="summary-row">
              <span className="summary-label">Last Backup</span>
              <span style={{ color: lastBackup ? '#33B978' : '#EDA534', fontWeight: 600 }}>
                {lastBackup ? new Date(lastBackup.backup_date).toLocaleString('en-IN') : 'Never'}
              </span>
            </div>
            {lastBackup && (
              <div className="summary-row">
                <span className="summary-label">Location</span>
                <span style={{ fontSize: 12, wordBreak: 'break-all' }}>{lastBackup.backup_path}</span>
              </div>
            )}

          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFF2C8', borderRadius: 8, border: '1px solid #EDA534', color: '#854d0e', fontSize: 13 }}>
            Create daily backups once regular data entry begins.
          </div>
        </div>

        {result && <div className="alert-success" style={{ marginBottom: 12 }}>{result}</div>}
        {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleBackup} disabled={creating}>
            {creating ? 'Creating...' : 'Create Backup'}
          </button>
          <button className="btn btn-ghost" disabled title="Restore is disabled in this version">
            Restore Backup
          </button>
        </div>
      </div>
    </div>
  )
}

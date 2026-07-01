import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { VisitListItem } from '../lib/types'

export function VisitsPage(): JSX.Element {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<VisitListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.visits.listAll().then(v => { setVisits(v); setLoading(false) })
  }, [])

  return (
    <div className="workspace">
      <div className="page-header">
        <div><h2 className="page-title">Visits / Chart</h2><div className="page-subtitle">All clinical visit records</div></div>
      </div>
      <div className="premium-card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Patient</th><th>Complaint</th><th>Treatment</th><th>Next Visit</th><th>Action</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="empty-table-state">Loading...</td></tr>
              : visits.length === 0
              ? <tr><td colSpan={6} className="empty-table-state">No visits recorded yet.</td></tr>
              : visits.map(v => (
                <tr key={v.id} className="table-row-clickable" onClick={() => navigate(`/visits/${v.id}`)}>
                  <td>{new Date(v.visit_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 500 }}>{v.full_name} <span style={{ color: 'var(--text-gray)', fontWeight: 400 }}>#{v.patient_number}</span></td>
                  <td>{v.chief_complaint || '—'}</td>
                  <td>{v.treatment_done || '—'}</td>
                  <td>{v.next_visit_date ? new Date(v.next_visit_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); navigate(`/visits/${v.id}`) }}>Open</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

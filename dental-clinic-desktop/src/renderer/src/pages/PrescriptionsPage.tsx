import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { PrescriptionListItem } from '../lib/types'

export function PrescriptionsPage(): JSX.Element {
  const navigate = useNavigate()
  const [items, setItems] = useState<PrescriptionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.visits.listPrescriptions().then(p => { setItems(p); setLoading(false) })
  }, [])

  return (
    <div className="workspace">
      <div className="page-header">
        <div><h2 className="page-title">Prescriptions</h2><div className="page-subtitle">All prescription records</div></div>
      </div>
      <div className="premium-card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Patient</th><th>Medicines</th><th>Next Visit</th><th>Action</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={5} className="empty-table-state">Loading...</td></tr>
              : items.length === 0
              ? <tr><td colSpan={5} className="empty-table-state">No prescriptions recorded yet.</td></tr>
              : items.map(p => (
                <tr key={p.visit_id} className="table-row-clickable" onClick={() => navigate(`/visits/${p.visit_id}`)}>
                  <td>{new Date(p.visit_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 500 }}>{p.full_name} <span style={{ color: 'var(--text-gray)', fontWeight: 400 }}>#{p.patient_number}</span></td>
                  <td>{p.medicines}</td>
                  <td>{p.next_visit_date ? new Date(p.next_visit_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm" onClick={e => { e.stopPropagation(); navigate(`/visits/${p.visit_id}`) }}>Open</button>
                      <button className="btn btn-sm btn-teal" onClick={e => { e.stopPropagation(); navigate(`/visits/${p.visit_id}/print`) }}>Print</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { VisitListItem } from '../lib/types'

export function BillingPage(): JSX.Element {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<VisitListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.visits.listAll().then(v => { setVisits(v); setLoading(false) })
  }, [])

  return (
    <div className="workspace">
      <div className="page-header">
        <div><h2 className="page-title">Billing</h2><div className="page-subtitle">Patient fees and payments</div></div>
      </div>
      <div className="premium-card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Patient</th><th>Fee</th><th>Paid</th><th>Balance</th><th>Action</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="empty-table-state">Loading...</td></tr>
              : visits.length === 0
              ? <tr><td colSpan={6} className="empty-table-state">Billing records will appear here as visits are created.</td></tr>
              : visits.map(v => (
                <tr key={v.id} className="table-row-clickable" onClick={() => navigate(`/visits/${v.id}`)}>
                  <td>{new Date(v.visit_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 500 }}>{v.full_name} <span style={{ color: 'var(--text-gray)', fontWeight: 400 }}>#{v.patient_number}</span></td>
                  <td>₹{v.fee_charged}</td>
                  <td>₹{v.amount_paid}</td>
                  <td style={{ color: v.balance > 0 ? '#C8173B' : '#33B978', fontWeight: 600 }}>₹{v.balance}</td>
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

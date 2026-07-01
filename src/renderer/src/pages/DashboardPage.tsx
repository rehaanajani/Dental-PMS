import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient, Appointment } from '../lib/types'

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [metrics, setMetrics] = useState({ patients: 0, totalPrescriptions: 0, pendingBalance: 0 })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.patients.listRecent().then(setRecentPatients)
    api.appointments.listByDate(today).then(setTodayAppts)
    api.patients.count().then(count => setMetrics(m => ({ ...m, patients: count })))
    api.visits.getDashboardStats().then(stats => setMetrics(m => ({
      ...m,
      totalPrescriptions: stats.totalPrescriptions,
      pendingBalance: stats.pendingBalance
    })))
  }, [])

  async function handleSearch(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!searchQ.trim()) return
    navigate(`/patients?q=${encodeURIComponent(searchQ.trim())}`)
    setSearchQ('')
  }

  return (
    <div className="workspace">
      <div className="dashboard-grid">
        {/* LEFT STACK */}
        <div className="left-stack">
          <div className="premium-card">
            <div className="section-title">Quick Actions</div>
            <div className="quick-action-grid">
              <button className="quick-action-button" onClick={() => navigate('/patients/new')}>
                <span className="quick-action-label">New Patient</span>
                <span className="quick-action-sub">Register patient record</span>
              </button>
              <button className="quick-action-button" onClick={() => navigate('/patients')}>
                <span className="quick-action-label">Find Patient</span>
                <span className="quick-action-sub">Search local records</span>
              </button>
              <button className="quick-action-button" onClick={() => navigate('/appointments/new')}>
                <span className="quick-action-label">New Appointment</span>
                <span className="quick-action-sub">Schedule a visit</span>
              </button>
              <button className="quick-action-button" onClick={() => navigate('/backup')}>
                <span className="quick-action-label">Backup Data</span>
                <span className="quick-action-sub">Export clinic data</span>
              </button>
            </div>
          </div>

          <div className="premium-card">
            <div className="section-title">Today's Appointments</div>
            {todayAppts.length === 0
              ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No appointments today.</div>
              : todayAppts.map(a => (
                <div key={a.id} className="summary-row">
                  <span>{a.appointment_time} — {a.patient_name_snapshot}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-gray)' }}>{a.status}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* MAIN STACK */}
        <div className="main-stack">
          {/* Hero Search */}
          <div className="hero-panel">
            <div className="hero-title">Find patient record</div>
            <div className="hero-sub">Search local clinic records by name, mobile number, or patient number.</div>
            <form onSubmit={handleSearch}>
              <div className="search-row">
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Enter name, mobile, or patient number..."
                  className="field-input" style={{ fontSize: 15, padding: '11px 14px' }} />
                <button type="submit" className="btn btn-primary">Search</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/patients/new')}>New Patient</button>
              </div>
            </form>

          </div>

          {/* Metrics */}
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-value">{metrics.patients}</div>
              <div className="metric-label">Patients</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{todayAppts.length}</div>
              <div className="metric-label">Appts Today</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.totalPrescriptions}</div>
              <div className="metric-label">Prescriptions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ fontSize: 20 }}>₹{metrics.pendingBalance}</div>
              <div className="metric-label">Pending Bal.</div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="premium-card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px 0' }}>
              <div className="table-toolbar">
                <span className="section-title" style={{ margin: 0 }}>Recent Patients</span>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate('/patients')}>View All</button>
              </div>
            </div>
            <table className="data-table">
              <thead><tr><th>Pt No.</th><th>Name</th><th>Mobile</th><th>Registered</th></tr></thead>
              <tbody>
                {recentPatients.length === 0
                  ? <tr><td colSpan={4} className="empty-table-state">No patients added yet. Add a patient to begin.</td></tr>
                  : recentPatients.map(p => (
                    <tr key={p.id} className="table-row-clickable" onClick={() => navigate(`/patients/${p.id}`)}>
                      <td>#{p.patient_number}</td>
                      <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                      <td>{p.mobile || '—'}</td>
                      <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

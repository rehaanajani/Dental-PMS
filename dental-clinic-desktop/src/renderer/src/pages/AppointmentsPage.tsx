import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Appointment } from '../lib/types'

type Tab = 'today' | 'upcoming' | 'all'

export function AppointmentsPage(): JSX.Element {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('today')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  async function load(t: Tab): Promise<void> {
    setLoading(true)
    let data: Appointment[]
    if (t === 'today') data = await api.appointments.listByDate(today)
    else if (t === 'upcoming') data = await api.appointments.listUpcoming()
    else data = await api.appointments.listAll()
    setAppointments(data)
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function handleComplete(id: string): Promise<void> {
    await api.appointments.markCompleted(id)
    load(tab)
  }

  async function handleCancel(id: string): Promise<void> {
    await api.appointments.cancel(id)
    load(tab)
  }

  async function handleDelete(id: string): Promise<void> {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.appointments.delete(id)
        load(tab)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete appointment')
      }
    }
  }

  const statusColor: Record<string, string> = {
    Scheduled: '#2FB6A3', Completed: '#33B978', Cancelled: '#C8173B', 'No Show': '#EDA534'
  }

  return (
    <div className="workspace">
      <div className="page-header">
        <div>
          <h2 className="page-title">Appointments</h2>
          <div className="page-subtitle">View and manage today's and upcoming visits</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>New Appointment</button>
      </div>

      <div className="premium-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 16px 0' }}>
          <div className="tab-row">
            {(['today', 'upcoming', 'all'] as Tab[]).map(t => (
              <button key={t} className={`tab-btn${tab === t ? ' tab-active' : ''}`} onClick={() => setTab(t)}>
                {t === 'today' ? 'Today' : t === 'upcoming' ? 'Upcoming' : 'All'}
              </button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr>
            <th>Time</th><th>Patient</th><th>Mobile</th><th>Reason</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="empty-table-state">Loading...</td></tr>
              : appointments.length === 0
              ? <tr><td colSpan={6} className="empty-table-state">No appointments found for this filter.</td></tr>
              : appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.appointment_time}</td>
                  <td>{a.patient_name_snapshot}</td>
                  <td>{a.mobile_snapshot || '—'}</td>
                  <td>{a.reason || '—'}</td>
                  <td><span className="status-badge" style={{ background: statusColor[a.status] + '20', color: statusColor[a.status] }}>{a.status}</span></td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/appointments/${a.id}/edit`)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                      {a.status === 'Scheduled' && <>
                        <button className="btn btn-sm btn-teal" onClick={() => handleComplete(a.id)}>Complete</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>Cancel</button>
                      </>}
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

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient, Visit } from '../lib/types'

export function PatientDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'visits'>('overview')
  const [error, setError] = useState('')

  async function handleDelete(): Promise<void> {
    if (!patient) return
    if (window.confirm(`Are you sure you want to delete patient: ${patient.full_name}?`)) {
      try {
        await api.patients.delete(patient.id)
        navigate('/patients')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete patient')
      }
    }
  }

  useEffect(() => {
    if (!id) return
    api.patients.getById(id).then(p => setPatient(p))
    api.visits.listByPatient(id).then(v => setVisits(v))
  }, [id])

  if (!patient) return <div className="workspace"><p>Loading patient...</p></div>

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/patients')}>← Back</button>
          <div>
            <h2 className="page-title">{patient.full_name}</h2>
            <div className="page-subtitle">Patient #{patient.patient_number}</div>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => navigate(`/patients/${id}/edit`)}>Edit Patient</button>
          <button className="btn btn-primary" onClick={() => navigate(`/patients/${id}/new-visit`)}>New Visit</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Patient</button>
        </div>
      </div>

      <div className="detail-layout">
        {error && <div className="alert-error" style={{ gridColumn: '1 / -1' }}>{error}</div>}
        <div className="patient-summary">
          <div className="premium-card">
            <div className="section-title">Patient Summary</div>
            <div className="summary-row"><span className="summary-label">Patient No.</span><strong>#{patient.patient_number}</strong></div>
            <div className="summary-row"><span className="summary-label">Name</span><span>{patient.full_name}</span></div>
            <div className="summary-row"><span className="summary-label">Mobile</span><span>{patient.mobile || '—'}</span></div>
            <div className="summary-row"><span className="summary-label">Age / Gender</span><span>{patient.age ? `${patient.age} yrs` : '—'} {patient.gender ? `/ ${patient.gender}` : ''}</span></div>
            <div className="summary-row"><span className="summary-label">Balance</span>
              <span style={{ color: visits.reduce((s, v) => s + v.balance, 0) > 0 ? '#C8173B' : '#33B978', fontWeight: 600 }}>
                ₹{visits.reduce((s, v) => s + v.balance, 0)}
              </span>
            </div>
            {patient.allergies && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#C8173B', marginBottom: 4 }}>ALLERGIES</div>
                <div style={{ fontSize: 13 }}>{patient.allergies}</div>
              </div>
            )}
            {patient.medical_history && (
              <div style={{ marginTop: 8 }}>
                <div className="summary-label" style={{ marginBottom: 4 }}>Medical History</div>
                <div style={{ fontSize: 13 }}>{patient.medical_history}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="tab-row">
            <button className={`tab-btn${activeTab === 'overview' ? ' tab-active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`tab-btn${activeTab === 'visits' ? ' tab-active' : ''}`} onClick={() => setActiveTab('visits')}>Visits ({visits.length})</button>
          </div>

          {activeTab === 'overview' && (
            <div className="premium-card">
              <div className="section-title">Patient Details</div>
              <div className="form-grid">
                <div><div className="summary-label">Address</div><div>{patient.address || '—'}</div></div>
                <div><div className="summary-label">Registered</div><div>{new Date(patient.created_at).toLocaleDateString('en-IN')}</div></div>
              </div>
              {patient.notes && <div style={{ marginTop: 12 }}><div className="summary-label">Notes</div><div>{patient.notes}</div></div>}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="premium-card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 16px 0' }}>
                <div className="table-toolbar">
                  <span className="section-title" style={{ margin: 0 }}>Visit History</span>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/patients/${id}/new-visit`)}>New Visit</button>
                </div>
              </div>
              <table className="data-table">
                <thead><tr>
                  <th>Date</th><th>Complaint</th><th>Treatment</th><th>Fee</th><th>Paid</th><th>Balance</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {visits.length === 0
                    ? <tr><td colSpan={7} className="empty-table-state">No visits recorded. Click New Visit to add one.</td></tr>
                    : visits.map(v => (
                      <tr key={v.id}>
                        <td>{new Date(v.visit_date).toLocaleDateString('en-IN')}</td>
                        <td>{v.chief_complaint || '—'}</td>
                        <td>{v.treatment_done || '—'}</td>
                        <td>₹{v.fee_charged}</td>
                        <td>₹{v.amount_paid}</td>
                        <td style={{ color: v.balance > 0 ? '#C8173B' : '#33B978', fontWeight: 600 }}>₹{v.balance}</td>
                        <td><button className="btn btn-sm" onClick={() => navigate(`/visits/${v.id}`)}>Open</button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

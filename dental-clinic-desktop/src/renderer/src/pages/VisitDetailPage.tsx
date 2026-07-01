import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient, VisitWithMedicines } from '../lib/types'

export function VisitDetailPage(): JSX.Element {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const [visit, setVisit] = useState<VisitWithMedicines | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)

  async function handleDelete(): Promise<void> {
    if (!visit || !visitId) return
    if (window.confirm('Are you sure you want to delete this visit?')) {
      try {
        await api.visits.delete(visitId)
        navigate(`/patients/${visit.patient_id}`)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete visit')
      }
    }
  }

  useEffect(() => {
    if (!visitId) return
    api.visits.getWithMedicines(visitId).then(v => {
      setVisit(v)
      if (v) api.patients.getById(v.patient_id).then(p => setPatient(p))
    })
  }, [visitId])

  if (!visit) return <div className="workspace"><p>Loading visit...</p></div>

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/patients/${visit.patient_id}`)}>← Back to Patient</button>
          <div><h2 className="page-title">Visit Details</h2>
            <div className="page-subtitle">{patient?.full_name} — {new Date(visit.visit_date).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => navigate(`/visits/${visitId}/edit`)}>Edit Visit</button>
          <button className="btn btn-teal" onClick={() => navigate(`/visits/${visitId}/print`)}>Print Prescription</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Visit</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
        <div className="premium-card">
          <div className="section-title">Visit Summary</div>
          <div className="form-grid">
            <div><div className="summary-label">Visit Date</div><div>{new Date(visit.visit_date).toLocaleDateString('en-IN')}</div></div>
            <div><div className="summary-label">Next Visit</div><div>{visit.next_visit_date ? new Date(visit.next_visit_date).toLocaleDateString('en-IN') : '—'}</div></div>
            <div><div className="summary-label">Chief Complaint</div><div>{visit.chief_complaint || '—'}</div></div>
            <div><div className="summary-label">Diagnosis</div><div>{visit.diagnosis || '—'}</div></div>
          </div>
          {visit.treatment_done && <div style={{ marginTop: 12 }}><div className="summary-label">Treatment Done</div><div>{visit.treatment_done}</div></div>}
          {visit.clinical_notes && <div style={{ marginTop: 8 }}><div className="summary-label">Clinical Notes</div><div>{visit.clinical_notes}</div></div>}
          {visit.advice && <div style={{ marginTop: 8 }}><div className="summary-label">Advice</div><div>{visit.advice}</div></div>}
        </div>

        {visit.medicines.length > 0 && (
          <div className="premium-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px' }}><div className="section-title" style={{ margin: 0 }}>Prescription</div></div>
            <table className="data-table">
              <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
              <tbody>
                {visit.medicines.map((m, i) => (
                  <tr key={i}><td>{i + 1}</td><td>{m.medicine_name}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.duration}</td><td>{m.instructions}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="premium-card">
          <div className="section-title">Billing</div>
          <div className="form-grid">
            <div><div className="summary-label">Fee Charged</div><div style={{ fontWeight: 600 }}>₹{visit.fee_charged}</div></div>
            <div><div className="summary-label">Amount Paid</div><div style={{ fontWeight: 600 }}>₹{visit.amount_paid}</div></div>
            <div><div className="summary-label">Balance</div><div style={{ fontWeight: 600, color: visit.balance > 0 ? '#C8173B' : '#33B978' }}>₹{visit.balance}</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

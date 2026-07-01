import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient, MedicineItem } from '../lib/types'

const EMPTY_MED: MedicineItem = { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }

export function NewVisitPage(): JSX.Element {
  const navigate = useNavigate()
  const { id: patientId } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    visit_date: today,
    chief_complaint: '', diagnosis: '', treatment_done: '',
    clinical_notes: '', advice: '', next_visit_date: '',
    fee_charged: 0, amount_paid: 0
  })
  const [medicines, setMedicines] = useState<MedicineItem[]>([{ ...EMPTY_MED }])

  useEffect(() => {
    if (!patientId) return
    api.patients.getById(patientId).then(p => setPatient(p))
  }, [patientId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'fee_charged' || name === 'amount_paid' ? parseInt(value) || 0 : value }))
  }

  function handleMedChange(idx: number, field: keyof MedicineItem, value: string): void {
    setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  function addMed(): void { setMedicines(prev => [...prev, { ...EMPTY_MED }]) }
  function removeMed(idx: number): void { setMedicines(prev => prev.filter((_, i) => i !== idx)) }

  async function handleSubmit(printAfter = false): Promise<void> {
    if (!patientId) return
    setSaving(true); setError('')
    try {
      const visit = await api.visits.create({
        ...form, patient_id: patientId,
        medicines: medicines.filter(m => m.medicine_name.trim())
      })
      if (printAfter) navigate(`/visits/${visit.id}/print`)
      else navigate(`/visits/${visit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save visit')
      setSaving(false)
    }
  }

  if (!patient) return <div className="workspace"><p>Loading...</p></div>

  const balance = form.fee_charged - form.amount_paid

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/patients/${patientId}`)}>← Back to Patient</button>
          <div><h2 className="page-title">New Visit</h2><div className="page-subtitle">{patient.full_name} — #{patient.patient_number}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
        {error && <div className="alert-error">{error}</div>}

        <div className="premium-card">
          <div className="section-title">Visit Details</div>
          <div className="form-grid">
            <div className="form-field"><label>Visit Date *</label><input type="date" name="visit_date" value={form.visit_date} onChange={handleChange} className="field-input" /></div>
            <div className="form-field"><label>Next Visit Date</label><input type="date" name="next_visit_date" value={form.next_visit_date} onChange={handleChange} className="field-input" /></div>
          </div>
          <div className="form-field"><label>Chief Complaint</label><textarea name="chief_complaint" value={form.chief_complaint} onChange={handleChange} className="field-input" rows={2} placeholder="Main reason for visit" /></div>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-field"><label>Diagnosis</label><textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} className="field-input" rows={2} /></div>
            <div className="form-field"><label>Treatment Done</label><textarea name="treatment_done" value={form.treatment_done} onChange={handleChange} className="field-input" rows={2} /></div>
          </div>
          <div className="form-field" style={{ marginTop: 12 }}><label>Clinical Notes</label><textarea name="clinical_notes" value={form.clinical_notes} onChange={handleChange} className="field-input" rows={2} /></div>
          <div className="form-field" style={{ marginTop: 12 }}><label>Advice</label><textarea name="advice" value={form.advice} onChange={handleChange} className="field-input" rows={2} /></div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title" style={{ margin: 0 }}>Prescription</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}>+ Add Medicine</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {medicines.map((med, idx) => (
                <tr key={idx}>
                  <td><input value={med.medicine_name} onChange={e => handleMedChange(idx, 'medicine_name', e.target.value)} className="field-input" placeholder="Medicine name" /></td>
                  <td><input value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} className="field-input" placeholder="500mg" /></td>
                  <td><input value={med.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} className="field-input" placeholder="Twice daily" /></td>
                  <td><input value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} className="field-input" placeholder="5 days" /></td>
                  <td><input value={med.instructions} onChange={e => handleMedChange(idx, 'instructions', e.target.value)} className="field-input" placeholder="After food" /></td>
                  <td><button type="button" onClick={() => removeMed(idx)} style={{ color: '#C8173B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="premium-card">
          <div className="section-title">Billing</div>
          <div className="form-grid">
            <div className="form-field"><label>Fee Charged (₹)</label><input type="number" name="fee_charged" min={0} value={form.fee_charged} onChange={handleChange} className="field-input" /></div>
            <div className="form-field"><label>Amount Paid (₹)</label><input type="number" name="amount_paid" min={0} value={form.amount_paid} onChange={handleChange} className="field-input" /></div>
            <div className="form-field"><label>Balance</label><div className="field-input" style={{ background: '#f9fafb', color: balance > 0 ? '#C8173B' : '#33B978', fontWeight: 600 }}>₹{balance}</div></div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" disabled={saving} onClick={() => handleSubmit(false)}>{saving ? 'Saving...' : 'Save Visit'}</button>
          <button className="btn btn-teal" disabled={saving} onClick={() => handleSubmit(true)}>Save & Print Prescription</button>
          <button className="btn btn-ghost" onClick={() => navigate(`/patients/${patientId}`)} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

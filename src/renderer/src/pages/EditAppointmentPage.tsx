import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'

export function EditAppointmentPage(): JSX.Element {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({
    patient_name_snapshot: '', mobile_snapshot: '', appointment_date: '',
    appointment_time: '', reason: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.appointments.getById(id).then(app => {
      if (!app) {
        setError('Appointment not found')
        setLoading(false)
        return
      }
      setForm({
        patient_name_snapshot: app.patient_name_snapshot,
        mobile_snapshot: app.mobile_snapshot,
        appointment_date: app.appointment_date,
        appointment_time: app.appointment_time,
        reason: app.reason,
        notes: app.notes
      })
      setLoading(false)
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load appointment')
      setLoading(false)
    })
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!id) return
    if (!form.patient_name_snapshot.trim()) { setError('Patient name is required'); return }
    if (!form.appointment_time) { setError('Appointment time is required'); return }
    setSaving(true); setError('')
    try {
      await api.appointments.update(id, form)
      navigate('/appointments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  if (loading) return <div className="workspace"><p>Loading appointment...</p></div>

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/appointments')}>← Back</button>
          <div><h2 className="page-title">Edit Appointment</h2><div className="page-subtitle">Update clinic visit details</div></div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="premium-card" style={{ maxWidth: 600 }}>
          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="section-title">Appointment Details</div>
          <div className="form-grid">
            <div className="form-field"><label>Patient Name *</label><input name="patient_name_snapshot" value={form.patient_name_snapshot} onChange={handleChange} className="field-input" placeholder="Patient name" /></div>
            <div className="form-field"><label>Mobile</label><input name="mobile_snapshot" value={form.mobile_snapshot} onChange={handleChange} className="field-input" placeholder="Mobile number" /></div>
            <div className="form-field"><label>Date *</label><input type="date" name="appointment_date" value={form.appointment_date} onChange={handleChange} className="field-input" /></div>
            <div className="form-field"><label>Time *</label><input type="time" name="appointment_time" value={form.appointment_time} onChange={handleChange} className="field-input" /></div>
          </div>
          <div className="form-field" style={{ marginTop: 12 }}><label>Reason</label><input name="reason" value={form.reason} onChange={handleChange} className="field-input" placeholder="Reason for visit" /></div>
          <div className="form-field" style={{ marginTop: 12 }}><label>Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} className="field-input" rows={2} /></div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/appointments')} disabled={saving}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}

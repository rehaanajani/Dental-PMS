import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export function NewPatientPage(): JSX.Element {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', mobile: '', age: '', gender: '',
    address: '', medical_history: '', allergies: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Patient name is required'); return }
    setSaving(true); setError('')
    try {
      const patient = await api.patients.create({
        ...form,
        age: form.age ? parseInt(form.age) : undefined
      })
      navigate(`/patients/${patient.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient')
      setSaving(false)
    }
  }

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/patients')}>← Back</button>
          <div>
            <h2 className="page-title">New Patient</h2>
            <div className="page-subtitle">Register a new patient record</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="premium-card" style={{ maxWidth: 800 }}>
          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="section-title">Patient Information</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Patient full name" className="field-input" required />
            </div>
            <div className="form-field">
              <label>Mobile Number</label>
              <input name="mobile" value={form.mobile} onChange={handleChange}
                placeholder="Mobile number" className="field-input" />
            </div>
            <div className="form-field">
              <label>Age</label>
              <input name="age" type="number" min={0} max={120} value={form.age} onChange={handleChange}
                placeholder="Age" className="field-input" />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="field-input">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: 16 }}>
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange}
              placeholder="Patient address" className="field-input" rows={2} />
          </div>

          <div className="section-title" style={{ marginTop: 24 }}>Medical Information</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Medical History</label>
              <textarea name="medical_history" value={form.medical_history} onChange={handleChange}
                placeholder="Known conditions, past treatments..." className="field-input" rows={3} />
            </div>
            <div className="form-field">
              <label>Allergies</label>
              <textarea name="allergies" value={form.allergies} onChange={handleChange}
                placeholder="Drug allergies, food allergies..." className="field-input" rows={3} />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: 16 }}>
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Additional notes..." className="field-input" rows={2} />
          </div>

          <div className="btn-row" style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Patient'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/patients')} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

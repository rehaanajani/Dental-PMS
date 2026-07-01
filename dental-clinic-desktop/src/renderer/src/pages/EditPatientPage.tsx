import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient } from '../lib/types'

export function EditPatientPage(): JSX.Element {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({ full_name: '', mobile: '', age: '', gender: '', address: '', medical_history: '', allergies: '', notes: '' })
  const [patient, setPatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.patients.getById(id).then(p => {
      if (p) {
        setPatient(p)
        setForm({
          full_name: p.full_name,
          mobile: p.mobile ?? '',
          age: p.age != null ? String(p.age) : '',
          gender: p.gender ?? '',
          address: p.address ?? '',
          medical_history: p.medical_history ?? '',
          allergies: p.allergies ?? '',
          notes: p.notes ?? ''
        })
      }
    })
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Patient name is required'); return }
    if (!id) return
    setSaving(true); setError('')
    try {
      await api.patients.update(id, { ...form, age: form.age ? parseInt(form.age) : undefined })
      navigate(`/patients/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient')
      setSaving(false)
    }
  }

  if (!patient) return <div className="workspace"><p>Loading...</p></div>

  return (
    <div className="workspace">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/patients/${id}`)}>← Back to Patient</button>
          <div>
            <h2 className="page-title">Edit Patient</h2>
            <div className="page-subtitle">Pt #{patient.patient_number} — {patient.full_name}</div>
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
              <input name="full_name" value={form.full_name} onChange={handleChange} className="field-input" required />
            </div>
            <div className="form-field">
              <label>Mobile Number</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className="field-input" />
            </div>
            <div className="form-field">
              <label>Age</label>
              <input name="age" type="number" min={0} max={120} value={form.age} onChange={handleChange} className="field-input" />
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
            <textarea name="address" value={form.address} onChange={handleChange} className="field-input" rows={2} />
          </div>
          <div className="section-title" style={{ marginTop: 24 }}>Medical Information</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Medical History</label>
              <textarea name="medical_history" value={form.medical_history} onChange={handleChange} className="field-input" rows={3} />
            </div>
            <div className="form-field">
              <label>Allergies</label>
              <textarea name="allergies" value={form.allergies} onChange={handleChange} className="field-input" rows={3} />
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/patients/${id}`)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}

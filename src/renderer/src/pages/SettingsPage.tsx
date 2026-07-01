import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { ClinicSettings } from '../lib/types'

export function SettingsPage(): JSX.Element {
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [form, setForm] = useState<Partial<ClinicSettings>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.settings.get().then(s => {
      if (s) { setSettings(s); setForm(s) }
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const updated = await api.settings.update(form)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <div className="workspace"><p>Loading settings...</p></div>

  const field = (name: keyof ClinicSettings, label: string, placeholder = '') => (
    <div className="form-field">
      <label>{label}</label>
      <input name={name} value={(form[name] as string) ?? ''} onChange={handleChange}
        placeholder={placeholder} className="field-input" />
    </div>
  )

  return (
    <div className="workspace">
      <div className="page-header">
        <div><h2 className="page-title">Settings</h2><div className="page-subtitle">Clinic and prescription configuration</div></div>
      </div>
      <form onSubmit={handleSave}>
        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {saved && <div className="alert-success" style={{ marginBottom: 16 }}>Settings saved successfully.</div>}

        <div className="form-grid" style={{ gap: 16, marginBottom: 16 }}>
          <div className="premium-card">
            <div className="section-title">Clinic Details</div>
            {field('clinic_name', 'Clinic Name')}
            {field('clinic_name_gujarati', 'Clinic Name (Gujarati)')}
            {field('address', 'Address')}
            {field('phone', 'Phone Number')}
            {field('prescription_accent_color', 'Prescription Accent Color', '#C8173B')}
          </div>
          <div className="premium-card">
            <div className="section-title">Doctor 1 (Left Side)</div>
            {field('doctor_left_name', 'Name')}
            {field('doctor_left_qualification', 'Qualification')}
            {field('doctor_left_reg_no', 'Registration No.')}
            {field('doctor_left_mobile', 'Mobile')}
          </div>
          <div className="premium-card">
            <div className="section-title">Doctor 2 (Right Side)</div>
            {field('doctor_right_name', 'Name')}
            {field('doctor_right_qualification', 'Qualification')}
            {field('doctor_right_reg_no', 'Registration No.')}
            {field('doctor_right_mobile', 'Mobile')}
          </div>
          <div className="premium-card">
            <div className="section-title">Footer / Distributor</div>
            {field('footer_title', 'Footer Title')}
            {field('footer_address', 'Footer Address')}
            {field('cash_note', 'Cash Registration Note', 'e.g. કેશ નોંધાવવા માટે મો. 9XXXXXXXXX')}
          </div>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </form>
    </div>
  )
}

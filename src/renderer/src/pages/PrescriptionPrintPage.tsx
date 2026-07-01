import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient, VisitWithMedicines, ClinicSettings } from '../lib/types'
import '@fontsource/noto-sans-gujarati/400.css'
import '@fontsource/noto-sans-gujarati/700.css'
import '../styles/prescription.css'
import logo from '../assets/logo.png'

export function PrescriptionPrintPage(): JSX.Element {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const [visit, setVisit] = useState<VisitWithMedicines | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [printing, setPrinting] = useState(false)
  const [printError, setPrintError] = useState('')

  useEffect(() => {
    if (!visitId) return
    Promise.all([
      api.visits.getWithMedicines(visitId),
      api.settings.get()
    ]).then(([v, s]) => {
      setVisit(v)
      setSettings(s)
      if (v) api.patients.getById(v.patient_id).then(p => setPatient(p))
    })
  }, [visitId])

  if (!visit || !patient || !settings) return (
    <div style={{ padding: 40, fontFamily: 'system-ui', color: '#333' }}>Loading prescription...</div>
  )

  async function handlePrint(): Promise<void> {
    setPrinting(true)
    setPrintError('')
    try {
      await api.print.generateAndOpen()
    } catch (err) {
      setPrintError(err instanceof Error ? err.message : 'Failed to open PDF')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <>
      <div className="rx-toolbar no-print">
        <span style={{ fontWeight: 600 }}>Prescription Preview</span>
        <button onClick={handlePrint} className="btn btn-primary" disabled={printing}>
          {printing ? 'Preparing...' : 'Print'}
        </button>
        <button onClick={() => navigate(`/visits/${visitId}`)} className="btn btn-ghost">← Back to Visit</button>
        {printError && <span style={{ color: '#fff', background: '#a32d2d', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>{printError}</span>}
      </div>

      <div className="rx-page">
        <div className="rx-header">
          <div className="rx-doctor-block">
            <div className="rx-doctor-name">{settings.doctor_left_name}</div>
            <div className="rx-doctor-qual">{settings.doctor_left_qualification}</div>
            <div className="rx-doctor-meta">{settings.doctor_left_reg_no}</div>
            <div className="rx-doctor-meta">{settings.doctor_left_mobile}</div>
          </div>

          <div className="rx-logo-block">
            <img src={logo} className="rx-logo-svg" alt="" />
          </div>

          <div className="rx-doctor-block rx-doctor-right">
            <div className="rx-doctor-name">{settings.doctor_right_name}</div>
            <div className="rx-doctor-qual">{settings.doctor_right_qualification}</div>
            <div className="rx-doctor-meta">{settings.doctor_right_reg_no}</div>
            <div className="rx-doctor-meta">{settings.doctor_right_mobile}</div>
          </div>
        </div>

        <div className="rx-clinic-name-row">
          <div className="rx-rule" />
          <div className="rx-clinic-name-gu">{settings.clinic_name_gujarati}</div>
          <div className="rx-rule" />
        </div>

        <div className="rx-header-underline" />

        <div className="rx-body">
          <div className="rx-patient-row">
            <div className="rx-patient-field"><span className="rx-label">Name:</span> {patient.full_name}</div>
            <div className="rx-patient-field"><span className="rx-label">Pt No:</span> #{patient.patient_number}</div>
            <div className="rx-patient-field"><span className="rx-label">Age/Sex:</span> {patient.age ? `${patient.age} yrs` : '—'} {patient.gender ? `/ ${patient.gender}` : ''}</div>
            <div className="rx-patient-field"><span className="rx-label">Date:</span> {new Date(visit.visit_date).toLocaleDateString('en-IN')}</div>
          </div>

          {visit.diagnosis && (
            <div className="rx-diagnosis">
              <span className="rx-label">Diagnosis: </span>{visit.diagnosis}
            </div>
          )}

          <div className="rx-medicines">
            <div className="rx-symbol">Rx</div>
            {visit.medicines.length === 0
              ? <div style={{ padding: '16px 0', color: '#666' }}>No medicines prescribed.</div>
              : visit.medicines.map((med, idx) => (
                <div key={idx} className="rx-med-row">
                  <div className="rx-med-num">{idx + 1}.</div>
                  <div className="rx-med-body">
                    <div className="rx-med-name">{med.medicine_name}</div>
                    <div className="rx-med-sig">
                      {[med.dosage, med.frequency, med.duration, med.instructions].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {visit.advice && (
            <div className="rx-advice">
              <span className="rx-label">Advice: </span>{visit.advice}
            </div>
          )}
          {visit.next_visit_date && (
            <div className="rx-next-visit">
              <span className="rx-label">Next Visit: </span>{new Date(visit.next_visit_date).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>

        {settings.cash_note && <div className="rx-cash-note">{settings.cash_note}</div>}
        <div className="rx-footer-line" />
        <div className="rx-footer">
          <div className="rx-footer-label">દવા ખરીદવાનું<br />વિશ્વાસપાત્ર સ્થળ :</div>
          <div className="rx-footer-main">
            <div className="rx-footer-title">{settings.footer_title}</div>
            <div className="rx-footer-addr">{settings.footer_address}</div>
          </div>
        </div>
      </div>
    </>
  )
}

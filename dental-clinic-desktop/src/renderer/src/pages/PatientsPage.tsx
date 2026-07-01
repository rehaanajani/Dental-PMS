import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Patient } from '../lib/types'

export function PatientsPage(): JSX.Element {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  async function load(q = ''): Promise<void> {
    setLoading(true)
    if (q.trim()) {
      const results = await api.patients.search(q)
      setPatients(results)
    } else {
      const results = await api.patients.listRecent()
      setPatients(results)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent): void {
    e.preventDefault()
    load(query)
  }

  return (
    <div className="workspace">
      <div className="page-header">
        <div>
          <h2 className="page-title">Patients</h2>
          <div className="page-subtitle">Search and manage local patient records</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>New Patient</button>
      </div>

      <div className="premium-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, mobile, or patient number..."
              className="field-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary">Search</button>
            {query && <button type="button" className="btn btn-ghost" onClick={() => { setQuery(''); load() }}>Clear</button>}
          </form>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Pt No.</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Age / Gender</th>
              <th>Registered</th>
              <th style={{ width: 80 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="empty-table-state">Loading...</td></tr>
              : patients.length === 0
              ? <tr><td colSpan={6} className="empty-table-state">
                  {query ? `No patients found for "${query}"` : 'No patients yet. Click New Patient to add one.'}
                </td></tr>
              : patients.map(p => (
                <tr key={p.id} className="table-row-clickable" onClick={() => navigate(`/patients/${p.id}`)}>
                  <td>#{p.patient_number}</td>
                  <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                  <td>{p.mobile || '—'}</td>
                  <td>{p.age ? `${p.age} yrs` : '—'}{p.gender ? ` / ${p.gender}` : ''}</td>
                  <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}>Open</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { z } from 'zod'
import crypto from 'crypto'
import { getDb } from '../database/db'

export const PatientCreateSchema = z.object({
  full_name: z.string().min(1, 'Name is required').transform(s => s.trim()),
  mobile: z.string().optional().transform(s => s?.trim() ?? ''),
  age: z.number().int().min(0).max(120).optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other', '']).optional().default(''),
  address: z.string().optional().transform(s => s?.trim() ?? ''),
  medical_history: z.string().optional().transform(s => s?.trim() ?? ''),
  allergies: z.string().optional().transform(s => s?.trim() ?? ''),
  notes: z.string().optional().transform(s => s?.trim() ?? '')
})

export const PatientUpdateSchema = PatientCreateSchema.partial()

export type PatientCreate = z.infer<typeof PatientCreateSchema>
export type PatientUpdate = z.infer<typeof PatientUpdateSchema>

export interface Patient {
  id: string
  patient_number: number
  full_name: string
  mobile: string
  age: number | null
  gender: string
  address: string
  medical_history: string
  allergies: string
  notes: string
  created_at: string
  updated_at: string
}

export function createPatient(data: PatientCreate): Patient {
  const db = getDb()
  const validated = PatientCreateSchema.parse(data)

  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const maxRow = db.prepare('SELECT MAX(patient_number) as maxNum FROM patients').get() as { maxNum: number | null }
  const patient_number = (maxRow.maxNum ?? 0) + 1

  const stmt = db.prepare(`
    INSERT INTO patients (id, patient_number, full_name, mobile, age, gender, address, medical_history, allergies, notes, created_at, updated_at)
    VALUES (@id, @patient_number, @full_name, @mobile, @age, @gender, @address, @medical_history, @allergies, @notes, @created_at, @updated_at)
  `)

  stmt.run({
    id,
    patient_number,
    full_name: validated.full_name,
    mobile: validated.mobile ?? '',
    age: validated.age ?? null,
    gender: validated.gender ?? '',
    address: validated.address ?? '',
    medical_history: validated.medical_history ?? '',
    allergies: validated.allergies ?? '',
    notes: validated.notes ?? '',
    created_at: now,
    updated_at: now
  })

  return getPatientById(id)!
}

export function updatePatient(id: string, data: PatientUpdate): Patient {
  const db = getDb()
  const validated = PatientUpdateSchema.parse(data)
  const now = new Date().toISOString()

  const current = getPatientById(id)
  if (!current) throw new Error(`Patient ${id} not found`)

  const merged = { ...current, ...validated, updated_at: now }

  db.prepare(`
    UPDATE patients SET
      full_name = @full_name, mobile = @mobile, age = @age, gender = @gender,
      address = @address, medical_history = @medical_history, allergies = @allergies,
      notes = @notes, updated_at = @updated_at
    WHERE id = @id
  `).run({
    ...merged,
    id
  })

  return getPatientById(id)!
}

export function getPatientById(id: string): Patient | null {
  const db = getDb()
  return db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as Patient | null
}

export function searchPatients(query: string): Patient[] {
  const db = getDb()
  const q = `%${query.trim()}%`
  return db.prepare(`
    SELECT * FROM patients
    WHERE full_name LIKE ? OR mobile LIKE ? OR CAST(patient_number AS TEXT) LIKE ?
    ORDER BY patient_number DESC
    LIMIT 50
  `).all(q, q, q) as Patient[]
}

export function listRecentPatients(limit = 10): Patient[] {
  const db = getDb()
  return db.prepare('SELECT * FROM patients ORDER BY created_at DESC LIMIT ?').all(limit) as Patient[]
}

export function countPatients(): number {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number }
  return row.c
}
export function deletePatient(id: string): void {
  const db = getDb()
  const visitCount = db.prepare('SELECT COUNT(*) as c FROM visits WHERE patient_id = ?').get(id) as { c: number }

  if (visitCount.c > 0) {
    throw new Error(`Cannot delete: this patient has ${visitCount.c} visit record(s). Delete those visits first if you really need to remove this patient.`)
  }

  const deletePatientTxn = db.transaction(() => {
    // Keep any appointment history (it has its own snapshot of name/mobile), just unlink it from the deleted patient
    db.prepare('UPDATE appointments SET patient_id = NULL WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM patients WHERE id = ?').run(id)
  })

  deletePatientTxn()
}

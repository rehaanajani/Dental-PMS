import { z } from 'zod'
import crypto from 'crypto'
import { getDb } from '../database/db'

export const MedicineItemSchema = z.object({
  id: z.string().optional(),
  medicine_name: z.string().min(1),
  dosage: z.string().optional().default(''),
  frequency: z.string().optional().default(''),
  duration: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  sort_order: z.number().int().optional().default(0)
})

export const VisitCreateSchema = z.object({
  patient_id: z.string().min(1),
  visit_date: z.string().min(1),
  chief_complaint: z.string().optional().default(''),
  diagnosis: z.string().optional().default(''),
  treatment_done: z.string().optional().default(''),
  clinical_notes: z.string().optional().default(''),
  advice: z.string().optional().default(''),
  next_visit_date: z.string().optional().default(''),
  fee_charged: z.number().int().min(0).default(0),
  amount_paid: z.number().int().min(0).default(0),
  medicines: z.array(MedicineItemSchema).optional().default([])
})

export const VisitUpdateSchema = VisitCreateSchema.omit({ patient_id: true }).partial()

export type VisitCreate = z.infer<typeof VisitCreateSchema>
export type VisitUpdate = z.infer<typeof VisitUpdateSchema>
export type MedicineItem = z.infer<typeof MedicineItemSchema>

export interface Visit {
  id: string
  patient_id: string
  visit_date: string
  chief_complaint: string
  diagnosis: string
  treatment_done: string
  clinical_notes: string
  advice: string
  next_visit_date: string
  fee_charged: number
  amount_paid: number
  balance: number
  created_at: string
  updated_at: string
}

export interface VisitWithMedicines extends Visit {
  medicines: MedicineItem[]
}

export function createVisit(data: VisitCreate): Visit {
  const db = getDb()
  const validated = VisitCreateSchema.parse(data)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const balance = validated.fee_charged - validated.amount_paid

  const createVisitAndMeds = db.transaction(() => {
    db.prepare(`
      INSERT INTO visits (id, patient_id, visit_date, chief_complaint, diagnosis, treatment_done, clinical_notes, advice, next_visit_date, fee_charged, amount_paid, balance, created_at, updated_at)
      VALUES (@id, @patient_id, @visit_date, @chief_complaint, @diagnosis, @treatment_done, @clinical_notes, @advice, @next_visit_date, @fee_charged, @amount_paid, @balance, @created_at, @updated_at)
    `).run({
      id,
      patient_id: validated.patient_id,
      visit_date: validated.visit_date,
      chief_complaint: validated.chief_complaint,
      diagnosis: validated.diagnosis,
      treatment_done: validated.treatment_done,
      clinical_notes: validated.clinical_notes,
      advice: validated.advice,
      next_visit_date: validated.next_visit_date,
      fee_charged: validated.fee_charged,
      amount_paid: validated.amount_paid,
      balance,
      created_at: now,
      updated_at: now
    })

    const validMeds = (validated.medicines ?? []).filter(m => m.medicine_name.trim())
    validMeds.forEach((med, idx) => {
      db.prepare(`
        INSERT INTO prescription_items (id, visit_id, medicine_name, dosage, frequency, duration, instructions, sort_order)
        VALUES (@id, @visit_id, @medicine_name, @dosage, @frequency, @duration, @instructions, @sort_order)
      `).run({
        id: crypto.randomUUID(),
        visit_id: id,
        medicine_name: med.medicine_name.trim(),
        dosage: med.dosage ?? '',
        frequency: med.frequency ?? '',
        duration: med.duration ?? '',
        instructions: med.instructions ?? '',
        sort_order: idx
      })
    })
  })

  createVisitAndMeds()
  return getVisitById(id)!
}

export function updateVisit(id: string, data: VisitUpdate): Visit {
  const db = getDb()
  const validated = VisitUpdateSchema.parse(data)
  const now = new Date().toISOString()

  const current = getVisitById(id)
  if (!current) throw new Error(`Visit ${id} not found`)

  const merged = { ...current, ...validated }
  const balance = (merged.fee_charged ?? 0) - (merged.amount_paid ?? 0)

  const updateVisitAndMeds = db.transaction(() => {
    db.prepare(`
      UPDATE visits SET
        visit_date = @visit_date, chief_complaint = @chief_complaint, diagnosis = @diagnosis,
        treatment_done = @treatment_done, clinical_notes = @clinical_notes, advice = @advice,
        next_visit_date = @next_visit_date, fee_charged = @fee_charged, amount_paid = @amount_paid,
        balance = @balance, updated_at = @updated_at
      WHERE id = @id
    `).run({ ...merged, balance, updated_at: now, id })

    if (validated.medicines !== undefined) {
      db.prepare('DELETE FROM prescription_items WHERE visit_id = ?').run(id)
      const validMeds = validated.medicines.filter(m => m.medicine_name.trim())
      validMeds.forEach((med, idx) => {
        db.prepare(`
          INSERT INTO prescription_items (id, visit_id, medicine_name, dosage, frequency, duration, instructions, sort_order)
          VALUES (@id, @visit_id, @medicine_name, @dosage, @frequency, @duration, @instructions, @sort_order)
        `).run({
          id: crypto.randomUUID(),
          visit_id: id,
          medicine_name: med.medicine_name.trim(),
          dosage: med.dosage ?? '',
          frequency: med.frequency ?? '',
          duration: med.duration ?? '',
          instructions: med.instructions ?? '',
          sort_order: idx
        })
      })
    }
  })

  updateVisitAndMeds()
  return getVisitById(id)!
}

export function getVisitById(id: string): Visit | null {
  const db = getDb()
  return db.prepare('SELECT * FROM visits WHERE id = ?').get(id) as Visit | null
}

export function getVisitWithMedicines(id: string): VisitWithMedicines | null {
  const visit = getVisitById(id)
  if (!visit) return null
  const db = getDb()
  const medicines = db.prepare('SELECT * FROM prescription_items WHERE visit_id = ? ORDER BY sort_order').all(id) as MedicineItem[]
  return { ...visit, medicines }
}

export function listVisitsByPatient(patientId: string): Visit[] {
  const db = getDb()
  return db.prepare('SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC').all(patientId) as Visit[]
}

export function listRecentVisits(limit = 10): (Visit & { full_name: string })[] {
  const db = getDb()
  return db.prepare(`
    SELECT v.*, p.full_name FROM visits v
    JOIN patients p ON p.id = v.patient_id
    ORDER BY v.created_at DESC LIMIT ?
  `).all(limit) as (Visit & { full_name: string })[]
}

export function getMedicinesByVisit(visitId: string): MedicineItem[] {
  const db = getDb()
  return db.prepare('SELECT * FROM prescription_items WHERE visit_id = ? ORDER BY sort_order').all(visitId) as MedicineItem[]
}
export function listAllVisits(): (Visit & { full_name: string; patient_number: number })[] {
  const db = getDb()
  return db.prepare(`
    SELECT v.*, p.full_name, p.patient_number FROM visits v
    JOIN patients p ON p.id = v.patient_id
    ORDER BY v.visit_date DESC, v.created_at DESC
    LIMIT 500
  `).all() as (Visit & { full_name: string; patient_number: number })[]
}

export interface PrescriptionListItem {
  visit_id: string
  visit_date: string
  next_visit_date: string
  full_name: string
  patient_number: number
  medicines: string
}

export function listPrescriptions(): PrescriptionListItem[] {
  const db = getDb()
  return db.prepare(`
    SELECT v.id as visit_id, v.visit_date, v.next_visit_date, p.full_name, p.patient_number,
      GROUP_CONCAT(pi.medicine_name, ', ') as medicines
    FROM visits v
    JOIN patients p ON p.id = v.patient_id
    JOIN prescription_items pi ON pi.visit_id = v.id
    GROUP BY v.id
    ORDER BY v.visit_date DESC
    LIMIT 300
  `).all() as PrescriptionListItem[]
}

export function getDashboardStats(): { totalPrescriptions: number; pendingBalance: number } {
  const db = getDb()
  const rx = db.prepare('SELECT COUNT(DISTINCT visit_id) as c FROM prescription_items').get() as { c: number }
  const bal = db.prepare('SELECT COALESCE(SUM(balance), 0) as s FROM visits WHERE balance > 0').get() as { s: number }
  return { totalPrescriptions: rx.c, pendingBalance: bal.s }
}

export function deleteVisit(id: string): void {
  const db = getDb()
  const deleteVisitTxn = db.transaction(() => {
    db.prepare('DELETE FROM prescription_items WHERE visit_id = ?').run(id)
    db.prepare('DELETE FROM visits WHERE id = ?').run(id)
  })
  deleteVisitTxn()
}

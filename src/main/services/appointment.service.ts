import { z } from 'zod'
import crypto from 'crypto'
import { getDb } from '../database/db'

export const AppointmentCreateSchema = z.object({
  patient_id: z.string().optional().nullable(),
  patient_name_snapshot: z.string().min(1),
  mobile_snapshot: z.string().optional().default(''),
  appointment_date: z.string().min(1),
  appointment_time: z.string().min(1),
  reason: z.string().optional().default(''),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No Show']).default('Scheduled'),
  notes: z.string().optional().default('')
})

export type AppointmentCreate = z.infer<typeof AppointmentCreateSchema>

export interface Appointment {
  id: string
  patient_id: string | null
  patient_name_snapshot: string
  mobile_snapshot: string
  appointment_date: string
  appointment_time: string
  reason: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export function createAppointment(data: AppointmentCreate): Appointment {
  const db = getDb()
  const validated = AppointmentCreateSchema.parse(data)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name_snapshot, mobile_snapshot, appointment_date, appointment_time, reason, status, notes, created_at, updated_at)
    VALUES (@id, @patient_id, @patient_name_snapshot, @mobile_snapshot, @appointment_date, @appointment_time, @reason, @status, @notes, @created_at, @updated_at)
  `).run({
    id,
    patient_id: validated.patient_id ?? null,
    patient_name_snapshot: validated.patient_name_snapshot,
    mobile_snapshot: validated.mobile_snapshot,
    appointment_date: validated.appointment_date,
    appointment_time: validated.appointment_time,
    reason: validated.reason,
    status: validated.status,
    notes: validated.notes,
    created_at: now,
    updated_at: now
  })

  return getAppointmentById(id)!
}

export function updateAppointment(id: string, data: Partial<AppointmentCreate>): Appointment {
  const db = getDb()
  const now = new Date().toISOString()
  const current = getAppointmentById(id)
  if (!current) throw new Error(`Appointment ${id} not found`)

  const merged = { ...current, ...data, updated_at: now }
  db.prepare(`
    UPDATE appointments SET
      patient_name_snapshot = @patient_name_snapshot, mobile_snapshot = @mobile_snapshot,
      appointment_date = @appointment_date, appointment_time = @appointment_time,
      reason = @reason, status = @status, notes = @notes, updated_at = @updated_at
    WHERE id = @id
  `).run({ ...merged, id })

  return getAppointmentById(id)!
}

export function getAppointmentById(id: string): Appointment | null {
  const db = getDb()
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as Appointment | null
}

export function listAppointmentsByDate(date: string): Appointment[] {
  const db = getDb()
  return db.prepare('SELECT * FROM appointments WHERE appointment_date = ? ORDER BY appointment_time').all(date) as Appointment[]
}

export function listUpcomingAppointments(): Appointment[] {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  return db.prepare("SELECT * FROM appointments WHERE appointment_date >= ? AND status = 'Scheduled' ORDER BY appointment_date, appointment_time LIMIT 50").all(today) as Appointment[]
}

export function listAllAppointments(): Appointment[] {
  const db = getDb()
  return db.prepare('SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC LIMIT 100').all() as Appointment[]
}

export function markCompleted(id: string): Appointment {
  return updateAppointment(id, { status: 'Completed' })
}

export function cancelAppointment(id: string): Appointment {
  return updateAppointment(id, { status: 'Cancelled' })
}

export function deleteAppointment(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM appointments WHERE id = ?').run(id)
}

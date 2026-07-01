import { getDb } from '../database/db'

export interface ClinicSettings {
  id: string
  clinic_name: string
  clinic_name_gujarati: string
  doctor_left_name: string
  doctor_left_qualification: string
  doctor_left_reg_no: string
  doctor_left_mobile: string
  doctor_right_name: string
  doctor_right_qualification: string
  doctor_right_reg_no: string
  doctor_right_mobile: string
  address: string
  phone: string
  footer_title: string
  footer_address: string
  cash_note: string
  prescription_accent_color: string
  created_at: string
  updated_at: string
}

export function getSettings(): ClinicSettings | null {
  const db = getDb()
  return db.prepare('SELECT * FROM clinic_settings LIMIT 1').get() as ClinicSettings | null
}

export function updateSettings(data: Partial<Omit<ClinicSettings, 'id' | 'created_at' | 'updated_at'>>): ClinicSettings {
  const db = getDb()
  const current = getSettings()
  if (!current) throw new Error('No settings row found')

  const now = new Date().toISOString()
  const merged = { ...current, ...data, updated_at: now }

  db.prepare(`
    UPDATE clinic_settings SET
      clinic_name = @clinic_name,
      clinic_name_gujarati = @clinic_name_gujarati,
      doctor_left_name = @doctor_left_name,
      doctor_left_qualification = @doctor_left_qualification,
      doctor_left_reg_no = @doctor_left_reg_no,
      doctor_left_mobile = @doctor_left_mobile,
      doctor_right_name = @doctor_right_name,
      doctor_right_qualification = @doctor_right_qualification,
      doctor_right_reg_no = @doctor_right_reg_no,
      doctor_right_mobile = @doctor_right_mobile,
      address = @address,
      phone = @phone,
      footer_title = @footer_title,
      footer_address = @footer_address,
      cash_note = @cash_note,
      prescription_accent_color = @prescription_accent_color,
      updated_at = @updated_at
    WHERE id = @id
  `).run(merged)

  return getSettings()!
}

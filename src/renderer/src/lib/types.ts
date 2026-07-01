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

export interface MedicineItem {
  id?: string
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  sort_order?: number
}

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

export interface VisitListItem extends Visit {
  full_name: string
  patient_number: number
}

export interface PrescriptionListItem {
  visit_id: string
  visit_date: string
  next_visit_date: string
  full_name: string
  patient_number: number
  medicines: string
}

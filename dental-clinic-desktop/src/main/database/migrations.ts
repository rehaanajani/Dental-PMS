import crypto from 'crypto'
import type Database from 'better-sqlite3'

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS clinic_settings (
  id TEXT PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  clinic_name_gujarati TEXT,
  doctor_left_name TEXT,
  doctor_left_qualification TEXT,
  doctor_left_reg_no TEXT,
  doctor_left_mobile TEXT,
  doctor_right_name TEXT,
  doctor_right_qualification TEXT,
  doctor_right_reg_no TEXT,
  doctor_right_mobile TEXT,
  address TEXT,
  phone TEXT,
  footer_title TEXT,
  footer_address TEXT,
  cash_note TEXT DEFAULT '',
  prescription_accent_color TEXT DEFAULT '#c8173b',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  patient_number INTEGER NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT,
  age INTEGER,
  gender TEXT,
  address TEXT,
  medical_history TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_done TEXT,
  clinical_notes TEXT,
  advice TEXT,
  next_visit_date TEXT,
  fee_charged INTEGER DEFAULT 0,
  amount_paid INTEGER DEFAULT 0,
  balance INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name_snapshot TEXT,
  mobile_snapshot TEXT,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  backup_path TEXT NOT NULL,
  backup_date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT
);
`

export function runMigrations(db: Database.Database): void {
  db.exec(SCHEMA_SQL)

  // Safety net for existing databases created before cash_note existed
  const columns = db.prepare("PRAGMA table_info(clinic_settings)").all() as { name: string }[]
  const hasCashNote = columns.some(c => c.name === 'cash_note')
  if (!hasCashNote) {
    db.exec("ALTER TABLE clinic_settings ADD COLUMN cash_note TEXT DEFAULT ''")
  }

  const row = db.prepare('SELECT COUNT(*) as count FROM clinic_settings').get() as { count: number }

  if (row.count === 0) {
    const stmt = db.prepare(`
      INSERT INTO clinic_settings (
        id, clinic_name, clinic_name_gujarati, doctor_left_name, doctor_left_qualification,
        doctor_left_reg_no, doctor_left_mobile, doctor_right_name, doctor_right_qualification,
        doctor_right_reg_no, doctor_right_mobile, footer_title, footer_address, cash_note, prescription_accent_color,
        created_at, updated_at
      ) VALUES (
        @id, @clinic_name, @clinic_name_gujarati, @doctor_left_name, @doctor_left_qualification,
        @doctor_left_reg_no, @doctor_left_mobile, @doctor_right_name, @doctor_right_qualification,
        @doctor_right_reg_no, @doctor_right_mobile, @footer_title, @footer_address, @cash_note, @prescription_accent_color,
        @created_at, @updated_at
      )
    `)

    const now = new Date().toISOString()
    stmt.run({
      id: crypto.randomUUID(),
      clinic_name: 'Darediya Dental Hub',
      clinic_name_gujarati: 'દરેડીયા ડેન્ટલ હબ',
      doctor_left_name: 'ડૉ. દીલીપ.બી. દરેડીયા',
      doctor_left_qualification: 'BAMS, DVV',
      doctor_left_reg_no: 'Reg No. GBI 13834',
      doctor_left_mobile: 'Mo. 93774 35183',
      doctor_right_name: 'ડૉ. અમીત. એસ. કુશવાહા',
      doctor_right_qualification: 'B.D.S',
      doctor_right_reg_no: 'Reg No. A.11189',
      doctor_right_mobile: 'Mo. 85111 80308',
      footer_title: 'માનવતા મેડીકલ એજન્સી',
      footer_address: 'અટેડા ગેઇટ, બોટાદ. મો. ૯૫૪૫૦ ૫૪૦૫૫',
      cash_note: '',
      prescription_accent_color: '#c8173b',
      created_at: now,
      updated_at: now
    })
    console.log('Default clinic settings seeded')
  }
}

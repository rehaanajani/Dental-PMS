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

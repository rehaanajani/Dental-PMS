import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import type Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations(db: Database.Database) {
  // Read schema.sql and execute
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema);

  // Seed default settings if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM clinic_settings');
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO clinic_settings (
        id, clinic_name, clinic_name_gujarati, doctor_left_name, doctor_left_qualification,
        doctor_left_reg_no, doctor_left_mobile, doctor_right_name, doctor_right_qualification,
        doctor_right_reg_no, doctor_right_mobile, footer_title, footer_address, prescription_accent_color,
        created_at, updated_at
      ) VALUES (
        @id, @clinic_name, @clinic_name_gujarati, @doctor_left_name, @doctor_left_qualification,
        @doctor_left_reg_no, @doctor_left_mobile, @doctor_right_name, @doctor_right_qualification,
        @doctor_right_reg_no, @doctor_right_mobile, @footer_title, @footer_address, @prescription_accent_color,
        @created_at, @updated_at
      )
    `);

    const now = new Date().toISOString();
    insertStmt.run({
      id: crypto.randomUUID(),
      clinic_name: "Darediya Dental Home",
      clinic_name_gujarati: "દરેડીયા ડેન્ટલ હોમ",
      doctor_left_name: "ડૉ. દીલીપ.બી. દરેડીયા",
      doctor_left_qualification: "BAMS, DVV",
      doctor_left_reg_no: "Reg No. GBI 13834",
      doctor_left_mobile: "Mo. 93774 35183",
      doctor_right_name: "ડૉ. અમીત. એસ. કુરાવાલા",
      doctor_right_qualification: "B.D.S",
      doctor_right_reg_no: "Reg No. A.11189",
      doctor_right_mobile: "Mo. 85111 80308",
      footer_title: "માનવતા મેડીકલ એજન્સી",
      footer_address: "અટેડા ગેઇટ, બોટાદ. મો. ૯૫૪૫૦ ૫૪૦૫૫",
      prescription_accent_color: "#c8173b",
      created_at: now,
      updated_at: now
    });
  }
}

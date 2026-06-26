import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function initDb(): Database.Database {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'DentalClinicData');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'clinic.db');
  db = new Database(dbPath, { verbose: console.log });

  // Apply required PRAGMAs
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return db;
}

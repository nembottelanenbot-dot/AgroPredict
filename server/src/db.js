const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'agropredict.db'));
db.pragma('journal_mode = WAL');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agriculteur',
      region TEXT,
      cooperative_id INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cooperatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT,
      admin_user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      area_ha REAL NOT NULL,
      soil_type TEXT,
      irrigation TEXT DEFAULT 'pluvial',
      region TEXT,
      polygon TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_id INTEGER NOT NULL,
      crop_type TEXT NOT NULL,
      variety TEXT,
      sowing_date TEXT,
      stage TEXT,
      status TEXT DEFAULT 'en_cours',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_id INTEGER NOT NULL,
      predicted_at TEXT DEFAULT (datetime('now')),
      horizon_days INTEGER,
      yield_min REAL,
      yield_med REAL,
      yield_max REAL,
      confidence_80_low REAL,
      confidence_80_high REAL,
      confidence_95_low REAL,
      confidence_95_high REAL,
      scenario_opt REAL,
      scenario_med REAL,
      scenario_pes REAL,
      factors TEXT,
      recommendation TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      parcel_id INTEGER,
      type TEXT,
      severity TEXT,
      message TEXT,
      recommendation TEXT,
      status TEXT DEFAULT 'active',
      triggered_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT,
      format TEXT,
      generated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ml_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_type TEXT,
      algorithm TEXT,
      version TEXT,
      mape REAL,
      rmse REAL,
      r2 REAL,
      is_active INTEGER DEFAULT 1,
      trained_at TEXT
    );

    CREATE TABLE IF NOT EXISTS crop_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_id INTEGER NOT NULL,
      event_type TEXT,
      event_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { db, init };

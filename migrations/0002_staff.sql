-- Staff accounts for the team area (/equipe). Passwords are PBKDF2-SHA256 hashes with a random salt;
-- sessions store only a SHA-256 of the token, so a database leak never exposes a usable login.

CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'barbeiro')),
  professional_id TEXT, -- barber profile in src/config/catalog.ts, when the account belongs to one
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  last_login_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX sessions_staff_idx ON sessions (staff_id);

-- Who booked or changed an appointment from the team area.
ALTER TABLE bookings ADD COLUMN created_by INTEGER;
ALTER TABLE bookings ADD COLUMN updated_by INTEGER;

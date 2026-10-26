-- Schedule database (Cloudflare D1 / SQLite). Times are epoch milliseconds; local_day/local_time
-- are the shop's wall-clock values, kept for fast day queries and display.

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  professional_id TEXT NOT NULL,
  service_ids TEXT NOT NULL, -- JSON array
  local_day TEXT NOT NULL,
  local_time TEXT NOT NULL,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  busy_until INTEGER NOT NULL, -- ends_at + preparation buffer
  duration_min INTEGER NOT NULL, -- snapshot: catalog changes never alter existing bookings
  total_cents INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX bookings_day_idx ON bookings (local_day, status);
CREATE INDEX bookings_code_phone_idx ON bookings (code, customer_phone);
-- Extra guard: one confirmed booking per professional and start time.
CREATE UNIQUE INDEX bookings_slot_idx ON bookings (professional_id, starts_at) WHERE status = 'confirmed';

CREATE TABLE blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id TEXT, -- NULL = whole shop
  local_day TEXT NOT NULL,
  start_time TEXT, -- NULL = whole day
  end_time TEXT,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX blocks_day_idx ON blocks (local_day);

-- Bumped on every change so open devices know when to refresh.
CREATE TABLE meta (key TEXT PRIMARY KEY, value INTEGER NOT NULL);
INSERT INTO meta (key, value) VALUES ('version', 1);

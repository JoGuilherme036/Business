-- Online bookings become requests the team approves ('pending' → 'confirmed' or 'declined').
-- A pending request already holds its slot, so nobody else can take it while the team decides.
-- SQLite cannot alter a CHECK constraint, so the table is rebuilt with the same data.

CREATE TABLE bookings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show')),
  professional_id TEXT NOT NULL,
  service_ids TEXT NOT NULL,
  local_day TEXT NOT NULL,
  local_time TEXT NOT NULL,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  busy_until INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by INTEGER,
  updated_by INTEGER
);
INSERT INTO bookings_new SELECT id, code, status, professional_id, service_ids, local_day, local_time, starts_at, ends_at, busy_until,
  duration_min, total_cents, customer_name, customer_phone, customer_email, notes, idempotency_key, created_at, updated_at, created_by, updated_by
  FROM bookings;
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
CREATE INDEX bookings_day_idx ON bookings (local_day, status);
CREATE INDEX bookings_code_phone_idx ON bookings (code, customer_phone);
CREATE INDEX bookings_phone_idx ON bookings (customer_phone);
-- One active booking (pending or confirmed) per professional and start time.
CREATE UNIQUE INDEX bookings_slot_idx ON bookings (professional_id, starts_at) WHERE status IN ('pending', 'confirmed');

-- What the team knows about a client: a private note and whether the shop prefers not to book them online.
CREATE TABLE customers (
  phone TEXT PRIMARY KEY,
  blocked INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  updated_at INTEGER NOT NULL,
  updated_by INTEGER
);

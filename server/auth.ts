// Team accounts and sessions for the staff area. Passwords: PBKDF2-SHA256 (100k iterations, the
// Workers maximum) with a per-user salt. Sessions: random 256-bit token, stored as SHA-256 only.
import { team } from '../src/config/catalog';
import type { NewStaffUser, StaffPatch, StaffRole, StaffUser } from '../src/booking/types';
import type { D1Database, Env } from './d1';

export class AuthError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

type StaffRow = {
  id: number;
  username: string;
  name: string;
  role: StaffRole;
  professional_id: string | null;
  password_hash: string;
  password_salt: string;
  active: number;
  failed_attempts: number;
  locked_until: number | null;
  last_login_at: number | null;
};

const ITERATIONS = 100_000;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const USERNAME = /^[a-z0-9._-]{3,32}$/;

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const randomHex = (bytes: number) => hex(crypto.getRandomValues(new Uint8Array(bytes)));

export const toStaff = (r: StaffRow): StaffUser => ({
  id: r.id,
  username: r.username,
  name: r.name,
  role: r.role,
  proId: r.professional_id,
  active: !!r.active,
  lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : null,
});

export async function hashPassword(password: string, saltHex: string) {
  const salt = new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return hex(bits);
}

async function sha256Hex(text: string) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

/** Constant-time comparison of two hex strings of the same length. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function validatePassword(password: unknown): asserts password is string {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new AuthError(400, 'weak_password');
  }
}

function validateUser(u: Partial<NewStaffUser>, partial = false) {
  if (!partial || u.username !== undefined) {
    if (typeof u.username !== 'string' || !USERNAME.test(u.username.toLowerCase())) throw new AuthError(400, 'invalid');
  }
  if (!partial || u.name !== undefined) {
    if (typeof u.name !== 'string' || u.name.trim().length < 2 || u.name.trim().length > 60) throw new AuthError(400, 'invalid');
  }
  if (!partial || u.role !== undefined) {
    if (u.role !== 'admin' && u.role !== 'barbeiro') throw new AuthError(400, 'invalid');
  }
  if (u.proId !== undefined && u.proId !== null && !team.some((p) => p.id === u.proId)) throw new AuthError(400, 'invalid');
}

async function insertUser(db: D1Database, u: NewStaffUser) {
  validateUser(u);
  validatePassword(u.password);
  const salt = randomHex(16);
  const now = Date.now();
  try {
    const res = await db
      .prepare('INSERT INTO staff (username, name, role, professional_id, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(u.username.toLowerCase(), u.name.trim(), u.role, u.proId ?? null, await hashPassword(u.password, salt), salt, now, now)
      .run();
    const row = await db.prepare('SELECT * FROM staff WHERE id = ?').bind(res.meta.last_row_id).first<StaffRow>();
    return toStaff(row!);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new AuthError(409, 'username_taken');
    throw e;
  }
}

async function newSession(db: D1Database, staffId: number, remember: boolean) {
  const token = randomHex(32);
  const now = Date.now();
  const expires = now + (remember ? REMEMBER_DAYS * 86_400_000 : SESSION_HOURS * 3_600_000);
  await db.batch([
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    db.prepare('INSERT INTO sessions (token_hash, staff_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(await sha256Hex(token), staffId, expires, now),
  ]);
  return { token, expiresAt: new Date(expires).toISOString() };
}

const bearer = (request: Request) => (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();

/** Resolves the signed-in staff account or throws 401. */
export async function requireStaff(request: Request, db: D1Database, role?: StaffRole) {
  const token = bearer(request);
  if (!/^[0-9a-f]{64}$/.test(token)) throw new AuthError(401, 'unauthorized');
  const row = await db
    .prepare('SELECT staff.* FROM sessions JOIN staff ON staff.id = sessions.staff_id WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND staff.active = 1')
    .bind(await sha256Hex(token), Date.now())
    .first<StaffRow>();
  if (!row) throw new AuthError(401, 'unauthorized');
  if (role && row.role !== role) throw new AuthError(403, 'forbidden');
  return toStaff(row);
}

const countStaff = async (db: D1Database) => (await db.prepare('SELECT COUNT(*) AS n FROM staff').first<{ n: number }>())?.n ?? 0;

export async function setupNeeded(db: D1Database) {
  return (await countStaff(db)) === 0;
}

/** First admin account. Needs the ADMIN_TOKEN secret set in Cloudflare, and works only once. */
export async function setup(body: { setupKey?: unknown; username?: unknown; name?: unknown; password?: unknown }, env: Env) {
  if (!env.ADMIN_TOKEN) throw new AuthError(503, 'admin_not_configured');
  const given = typeof body.setupKey === 'string' ? body.setupKey : '';
  if (!safeEqual(await sha256Hex(given), await sha256Hex(env.ADMIN_TOKEN))) throw new AuthError(401, 'unauthorized');
  if (!(await setupNeeded(env.DB))) throw new AuthError(409, 'setup_done');
  const user = await insertUser(env.DB, { username: String(body.username ?? ''), name: String(body.name ?? ''), password: body.password as string, role: 'admin', proId: null });
  return { user, ...(await newSession(env.DB, user.id, false)) };
}

export async function login(body: { username?: unknown; password?: unknown; remember?: unknown }, db: D1Database) {
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const row = username ? await db.prepare('SELECT * FROM staff WHERE username = ?').bind(username).first<StaffRow>() : null;
  const now = Date.now();
  if (!row || !row.active) {
    // Same work as a real check, so response time does not reveal which usernames exist.
    await hashPassword(password, 'ab'.repeat(16));
    throw new AuthError(401, 'unauthorized');
  }
  if (row.locked_until && row.locked_until > now) throw new AuthError(429, 'locked');
  if (!safeEqual(await hashPassword(password, row.password_salt), row.password_hash)) {
    const attempts = row.failed_attempts + 1;
    const lock = attempts >= MAX_ATTEMPTS ? now + LOCK_MINUTES * 60_000 : null;
    await db.prepare('UPDATE staff SET failed_attempts = ?, locked_until = ? WHERE id = ?').bind(lock ? 0 : attempts, lock, row.id).run();
    throw new AuthError(lock ? 429 : 401, lock ? 'locked' : 'unauthorized');
  }
  await db.prepare('UPDATE staff SET failed_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?').bind(now, row.id).run();
  return { user: toStaff({ ...row, last_login_at: now }), ...(await newSession(db, row.id, body.remember === true)) };
}

export async function logout(request: Request, db: D1Database) {
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(bearer(request))).run();
}

export async function changePassword(me: StaffUser, body: { current?: unknown; next?: unknown }, request: Request, db: D1Database) {
  const row = await db.prepare('SELECT * FROM staff WHERE id = ?').bind(me.id).first<StaffRow>();
  if (!row || !safeEqual(await hashPassword(String(body.current ?? ''), row.password_salt), row.password_hash)) throw new AuthError(401, 'unauthorized');
  validatePassword(body.next);
  const salt = randomHex(16);
  const keep = await sha256Hex(bearer(request));
  await db.batch([
    db.prepare('UPDATE staff SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?').bind(await hashPassword(body.next, salt), salt, Date.now(), me.id),
    // Signs out every other device.
    db.prepare('DELETE FROM sessions WHERE staff_id = ? AND token_hash <> ?').bind(me.id, keep),
  ]);
}

export async function listUsers(db: D1Database) {
  const { results } = await db.prepare('SELECT * FROM staff ORDER BY active DESC, name').all<StaffRow>();
  return results.map(toStaff);
}

export const createUser = (body: NewStaffUser, db: D1Database) => insertUser(db, body);

export async function updateUser(me: StaffUser, id: number, patch: StaffPatch, db: D1Database) {
  validateUser(patch, true);
  const row = await db.prepare('SELECT * FROM staff WHERE id = ?').bind(id).first<StaffRow>();
  if (!row) throw new AuthError(404, 'not_found');
  // Never lock the shop out: an admin cannot demote or deactivate themselves.
  if (id === me.id && (patch.active === false || (patch.role && patch.role !== 'admin'))) throw new AuthError(400, 'invalid');
  const sets: string[] = [];
  const values: unknown[] = [];
  if (patch.name !== undefined) sets.push('name = ?'), values.push(patch.name.trim());
  if (patch.role !== undefined) sets.push('role = ?'), values.push(patch.role);
  if (patch.proId !== undefined) sets.push('professional_id = ?'), values.push(patch.proId);
  if (patch.active !== undefined) sets.push('active = ?'), values.push(patch.active ? 1 : 0);
  if (patch.password !== undefined) {
    validatePassword(patch.password);
    const salt = randomHex(16);
    sets.push('password_hash = ?', 'password_salt = ?', 'failed_attempts = 0', 'locked_until = NULL');
    values.push(await hashPassword(patch.password, salt), salt);
  }
  if (!sets.length) return toStaff(row);
  sets.push('updated_at = ?');
  values.push(Date.now(), id);
  const statements = [db.prepare(`UPDATE staff SET ${sets.join(', ')} WHERE id = ?`).bind(...values)];
  // A new password or a deactivated account ends that person's open sessions.
  if (patch.password !== undefined || patch.active === false) statements.push(db.prepare('DELETE FROM sessions WHERE staff_id = ?').bind(id));
  await db.batch(statements);
  return toStaff((await db.prepare('SELECT * FROM staff WHERE id = ?').bind(id).first<StaffRow>())!);
}

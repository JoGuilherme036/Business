// Schedule API for the Cloudflare Worker (server/worker.ts) + D1.
// Availability rules are the same modules the site uses, so client and server always agree;
// the server re-checks everything and the insert itself is atomic (INSERT … WHERE NOT EXISTS).
import { site } from '../src/config/site';
import { serviceById, team } from '../src/config/catalog';
import { eligiblePros, proSlots, summarize, type BusyMap } from '../src/booking/availability';
import { isValidBrPhone, normalizeBrPhone } from '../src/lib/phone';
import { addDays, shopInstant } from '../src/lib/time';
import type { Block, Booking, BookingStatus, DayClosures } from '../src/booking/types';
import type { D1Database, Env, ExecutionContext } from './d1';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';

type BookingRow = {
  code: string;
  status: BookingStatus;
  professional_id: string;
  service_ids: string;
  local_day: string;
  local_time: string;
  starts_at: number;
  ends_at: number;
  duration_min: number;
  total_cents: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  created_at: number;
};

type BlockRow = {
  id: number;
  professional_id: string | null;
  local_day: string;
  start_time: string | null;
  end_time: string | null;
  starts_at: number;
  ends_at: number;
  reason: string | null;
};

const toBooking = (r: BookingRow, withContact = true): Booking => ({
  code: r.code,
  status: r.status,
  day: r.local_day,
  time: r.local_time,
  start: new Date(r.starts_at).toISOString(),
  end: new Date(r.ends_at).toISOString(),
  proId: r.professional_id,
  serviceIds: JSON.parse(r.service_ids) as string[],
  durationMin: r.duration_min,
  totalCents: r.total_cents,
  customer: withContact
    ? { name: r.customer_name, phone: r.customer_phone, email: r.customer_email ?? undefined, notes: r.notes ?? undefined }
    : { name: r.customer_name, phone: r.customer_phone },
  createdAt: new Date(r.created_at).toISOString(),
});

const toBlock = (r: BlockRow): Block => ({
  id: r.id,
  proId: r.professional_id,
  day: r.local_day,
  startTime: r.start_time,
  endTime: r.end_time,
  reason: r.reason,
});

class HttpError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'invalid');
  }
}

const bumpVersion = (db: D1Database) => db.prepare("UPDATE meta SET value = value + 1 WHERE key = 'version'").run();

async function busyForDay(db: D1Database, day: string): Promise<BusyMap> {
  const [bookings, blocks] = await Promise.all([
    db.prepare("SELECT professional_id, starts_at, ends_at FROM bookings WHERE local_day = ? AND status = 'confirmed'").bind(day).all<{ professional_id: string; starts_at: number; ends_at: number }>(),
    db.prepare('SELECT professional_id, starts_at, ends_at FROM blocks WHERE local_day = ?').bind(day).all<{ professional_id: string | null; starts_at: number; ends_at: number }>(),
  ]);
  const map: BusyMap = {};
  const push = (pro: string, start: number, end: number) => (map[pro] ??= []).push({ start, end });
  for (const b of bookings.results) push(b.professional_id, b.starts_at, b.ends_at);
  for (const b of blocks.results) {
    for (const p of b.professional_id ? [b.professional_id] : team.map((t) => t.id)) push(p, b.starts_at, b.ends_at);
  }
  return map;
}

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return 'RB-' + Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

async function sha256(text: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

async function requireAdmin(request: Request, env: Env) {
  if (!env.ADMIN_TOKEN) throw new HttpError(503, 'admin_not_configured');
  const given = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const [a, b] = await Promise.all([sha256(given), sha256(env.ADMIN_TOKEN)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) throw new HttpError(401, 'unauthorized');
}

/* ---------------- public ---------------- */

async function createBooking(request: Request, db: D1Database, opts: { admin?: boolean } = {}) {
  type Body = {
    idempotencyKey?: unknown;
    serviceIds?: unknown;
    proId?: unknown;
    day?: unknown;
    time?: unknown;
    customer?: { name?: unknown; phone?: unknown; email?: unknown; notes?: unknown };
  };
  const body = await readJson<Body>(request);
  const key = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds.filter((x): x is string => typeof x === 'string') : [];
  const proId = typeof body.proId === 'string' ? body.proId : '';
  const day = typeof body.day === 'string' ? body.day : '';
  const time = typeof body.time === 'string' ? body.time : '';
  const name = typeof body.customer?.name === 'string' ? body.customer.name.trim() : '';
  const phone = typeof body.customer?.phone === 'string' ? body.customer.phone : '';
  const email = typeof body.customer?.email === 'string' ? body.customer.email.trim().slice(0, 120) : '';
  const notes = typeof body.customer?.notes === 'string' ? body.customer.notes.slice(0, 280) : '';

  // The shop may book walk-ins without a phone; online clients always need one.
  const phoneOk = isValidBrPhone(phone) || (opts.admin && phone.replace(/\D/g, '') === '');
  if (key.length < 8 || key.length > 100 || !DAY.test(day) || !TIME.test(time) || name.length < 2 || name.length > 80 || !phoneOk) {
    throw new HttpError(400, 'invalid');
  }
  if (!serviceIds.length || serviceIds.length > 6 || serviceIds.some((id) => !serviceById(id))) throw new HttpError(400, 'invalid');
  if (proId !== 'any' && !team.some((p) => p.id === proId)) throw new HttpError(400, 'invalid');

  const existing = await db.prepare('SELECT * FROM bookings WHERE idempotency_key = ?').bind(key).first<BookingRow>();
  if (existing) return json(toBooking(existing));

  const { durationMin, priceCents } = summarize(serviceIds);
  const busy = await busyForDay(db, day);
  const now = new Date();
  const candidates = eligiblePros(serviceIds).filter((p) => proId === 'any' || p.id === proId);
  // Walk-ins booked by the shop skip the online minimum notice.
  const rules = opts.admin ? { ...site.booking, minLeadMin: 0 } : site.booking;
  const start = shopInstant(day, time).getTime();
  const end = start + durationMin * 60_000;
  const busyUntil = end + site.booking.bufferMin * 60_000;

  for (const pro of candidates) {
    if (!proSlots(pro, day, durationMin, busy[pro.id] ?? [], now, rules).includes(time)) continue;
    const code = newCode();
    const stamp = Date.now();
    try {
      const res = await db
        .prepare(
          `INSERT INTO bookings (code, professional_id, service_ids, local_day, local_time, starts_at, ends_at, busy_until,
             duration_min, total_cents, customer_name, customer_phone, customer_email, notes, idempotency_key, created_at, updated_at)
           SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?16
           WHERE NOT EXISTS (
             SELECT 1 FROM bookings WHERE professional_id = ?2 AND status = 'confirmed' AND starts_at < ?8 AND busy_until > ?6
           ) AND NOT EXISTS (
             SELECT 1 FROM blocks WHERE (professional_id IS NULL OR professional_id = ?2) AND starts_at < ?7 AND ends_at > ?6
           )`,
        )
        .bind(code, pro.id, JSON.stringify(serviceIds), day, time, start, end, busyUntil, durationMin, priceCents, name, normalizeBrPhone(phone), email || null, notes || null, key, stamp)
        .run();
      if (res.meta.changes === 1) {
        await bumpVersion(db);
        const row = await db.prepare('SELECT * FROM bookings WHERE code = ?').bind(code).first<BookingRow>();
        return json(toBooking(row!), 201);
      }
    } catch (e) {
      // Same idempotency key raced in from a retry: return the booking that won.
      const raced = await db.prepare('SELECT * FROM bookings WHERE idempotency_key = ?').bind(key).first<BookingRow>();
      if (raced) return json(toBooking(raced));
      if (!String(e).includes('UNIQUE')) throw e;
    }
  }
  throw new HttpError(409, 'slot_taken');
}

async function findBooking(request: Request, db: D1Database) {
  const { code, phone } = await readJson<{ code?: string; phone?: string }>(request);
  if (typeof code !== 'string' || typeof phone !== 'string') throw new HttpError(400, 'invalid');
  const row = await db.prepare('SELECT * FROM bookings WHERE code = ? AND customer_phone = ?').bind(code.trim().toUpperCase(), normalizeBrPhone(phone)).first<BookingRow>();
  if (!row) throw new HttpError(404, 'not_found');
  return json(toBooking(row, false));
}

async function cancelBooking(request: Request, db: D1Database) {
  const { code, phone } = await readJson<{ code?: string; phone?: string }>(request);
  if (typeof code !== 'string' || typeof phone !== 'string') throw new HttpError(400, 'invalid');
  const c = code.trim().toUpperCase();
  const p = normalizeBrPhone(phone);
  const row = await db.prepare('SELECT * FROM bookings WHERE code = ? AND customer_phone = ?').bind(c, p).first<BookingRow>();
  if (!row) throw new HttpError(404, 'not_found');
  if (row.status === 'confirmed') {
    if (row.starts_at - Date.now() < site.booking.cancelUntilHours * 3_600_000) throw new HttpError(422, 'too_late');
    await db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE code = ? AND status = 'confirmed'").bind(Date.now(), c).run();
    await bumpVersion(db);
  }
  const updated = await db.prepare('SELECT * FROM bookings WHERE code = ?').bind(c).first<BookingRow>();
  return json(toBooking(updated!, false));
}

async function closures(url: URL, db: D1Database) {
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';
  if (!DAY.test(from) || !DAY.test(to)) throw new HttpError(400, 'invalid');
  const { results } = await db
    .prepare('SELECT professional_id, local_day FROM blocks WHERE start_time IS NULL AND local_day BETWEEN ? AND ?')
    .bind(from, to)
    .all<{ professional_id: string | null; local_day: string }>();
  const out: DayClosures = { closed: [], off: {} };
  for (const r of results) {
    if (r.professional_id) (out.off[r.professional_id] ??= []).push(r.local_day);
    else out.closed.push(r.local_day);
  }
  return json(out);
}

/* ---------------- admin ---------------- */

async function adminDay(url: URL, db: D1Database) {
  const day = url.searchParams.get('day') ?? '';
  if (!DAY.test(day)) throw new HttpError(400, 'invalid');
  const [bookings, blocks] = await Promise.all([
    db.prepare('SELECT * FROM bookings WHERE local_day = ? ORDER BY starts_at').bind(day).all<BookingRow>(),
    db.prepare('SELECT * FROM blocks WHERE local_day = ? ORDER BY starts_at').bind(day).all<BlockRow>(),
  ]);
  return json({ bookings: bookings.results.map((r) => toBooking(r)), blocks: blocks.results.map(toBlock) });
}

async function addBlock(request: Request, db: D1Database) {
  const b = await readJson<{ proId?: string | null; from?: string; to?: string; startTime?: string; endTime?: string; reason?: string }>(request);
  const proId = b.proId ?? null;
  const from = b.from ?? '';
  const to = b.to ?? from;
  const partial = !!b.startTime;
  if (proId !== null && !team.some((p) => p.id === proId)) throw new HttpError(400, 'invalid');
  if (!DAY.test(from) || !DAY.test(to) || to < from) throw new HttpError(400, 'invalid');
  if (partial && (!TIME.test(b.startTime!) || !TIME.test(b.endTime ?? '') || b.endTime! <= b.startTime!)) throw new HttpError(400, 'invalid');
  const reason = typeof b.reason === 'string' ? b.reason.trim().slice(0, 120) || null : null;

  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    days.push(d);
    if (days.length > 90) throw new HttpError(400, 'invalid');
  }
  const ranges = days.map((day) => ({
    day,
    start: shopInstant(day, partial ? b.startTime! : '00:00').getTime(),
    end: partial ? shopInstant(day, b.endTime!).getTime() : shopInstant(addDays(day, 1), '00:00').getTime(),
  }));

  const now = Date.now();
  await db.batch(
    ranges.map((r) =>
      db
        .prepare('INSERT INTO blocks (professional_id, local_day, start_time, end_time, starts_at, ends_at, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(proId, r.day, partial ? b.startTime! : null, partial ? b.endTime! : null, r.start, r.end, reason, now),
    ),
  );
  await bumpVersion(db);

  // Bookings that already sat inside the blocked period: the shop should contact these clients.
  const conflicts: Booking[] = [];
  for (const r of ranges) {
    const { results } = await db
      .prepare(
        `SELECT * FROM bookings WHERE local_day = ? AND status = 'confirmed' AND starts_at < ? AND ends_at > ? ${proId ? 'AND professional_id = ?' : ''} ORDER BY starts_at`,
      )
      .bind(...(proId ? [r.day, r.end, r.start, proId] : [r.day, r.end, r.start]))
      .all<BookingRow>();
    conflicts.push(...results.map((x) => toBooking(x)));
  }
  return json({ created: ranges.length, conflicts }, 201);
}

async function removeBlock(id: number, db: D1Database) {
  const res = await db.prepare('DELETE FROM blocks WHERE id = ?').bind(id).run();
  if (res.meta.changes === 0) throw new HttpError(404, 'not_found');
  await bumpVersion(db);
  return json({ ok: true });
}

async function setStatus(code: string, request: Request, db: D1Database) {
  const { status } = await readJson<{ status?: string }>(request);
  if (!['cancelled', 'completed', 'no_show'].includes(status ?? '')) throw new HttpError(400, 'invalid');
  const res = await db.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE code = ?').bind(status, Date.now(), code).run();
  if (res.meta.changes === 0) throw new HttpError(404, 'not_found');
  await bumpVersion(db);
  const row = await db.prepare('SELECT * FROM bookings WHERE code = ?').bind(code).first<BookingRow>();
  return json(toBooking(row!));
}

/* ---------------- router ---------------- */

// Requests that change the schedule; after a successful one, every open screen is told at once.
const MUTATIONS = [/^POST \/api\/bookings$/, /^POST \/api\/admin\/bookings$/, /^POST \/api\/bookings\/cancel$/, /^POST \/api\/admin\/blocks$/, /^DELETE \/api\/admin\/blocks\/\d+$/, /^POST \/api\/admin\/bookings\/[^/]+\/status$/];

async function broadcast(env: Env) {
  if (!env.HUB) return;
  const row = await env.DB.prepare("SELECT value FROM meta WHERE key = 'version'").first<{ value: number }>();
  await env.HUB.get(env.HUB.idFromName('schedule')).fetch('https://hub/notify', {
    method: 'POST',
    body: JSON.stringify({ type: 'changed', version: row?.value ?? 0 }),
  });
}

export async function handle(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
  try {
    // Await here so errors thrown inside any route are caught below.
    const response = await route(request, env);
    const key = `${request.method} ${new URL(request.url).pathname.replace(/\/+$/, '')}`;
    if (response.ok && MUTATIONS.some((m) => m.test(key))) {
      const done = broadcast(env).catch((e) => console.error('broadcast failed', e));
      if (ctx) ctx.waitUntil(done);
      else await done;
    }
    return response;
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.code }, e.status);
    console.error(e);
    return json({ error: 'server_error' }, 500);
  }
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;
  const db = env.DB;
  {
    if (!db) throw new HttpError(503, 'database_not_configured');
    if (method === 'GET' && path === '/api/health') return json({ ok: true });
    if (method === 'GET' && path === '/api/version') {
      const row = await db.prepare("SELECT value FROM meta WHERE key = 'version'").first<{ value: number }>();
      return json({ version: row?.value ?? 0 });
    }
    if (method === 'GET' && path === '/api/busy') {
      const day = url.searchParams.get('day') ?? '';
      if (!DAY.test(day)) throw new HttpError(400, 'invalid');
      return json({ busy: await busyForDay(db, day) });
    }
    if (method === 'GET' && path === '/api/closures') return closures(url, db);
    if (method === 'POST' && path === '/api/bookings') return createBooking(request, db);
    if (method === 'POST' && path === '/api/bookings/lookup') return findBooking(request, db);
    if (method === 'POST' && path === '/api/bookings/cancel') return cancelBooking(request, db);

    if (path.startsWith('/api/admin/')) {
      await requireAdmin(request, env);
      if (method === 'GET' && path === '/api/admin/session') return json({ ok: true });
      if (method === 'GET' && path === '/api/admin/day') return adminDay(url, db);
      if (method === 'POST' && path === '/api/admin/blocks') return addBlock(request, db);
      if (method === 'POST' && path === '/api/admin/bookings') return createBooking(request, db, { admin: true });
      const blockMatch = path.match(/^\/api\/admin\/blocks\/(\d+)$/);
      if (method === 'DELETE' && blockMatch) return removeBlock(Number(blockMatch[1]), db);
      const statusMatch = path.match(/^\/api\/admin\/bookings\/(RB-[A-Z0-9]{5})\/status$/);
      if (method === 'POST' && statusMatch) return setStatus(statusMatch[1], request, db);
    }
    throw new HttpError(404, 'not_found');
  }
}

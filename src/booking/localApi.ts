import { site } from '@/config/site';
import { team } from '@/config/catalog';
import { normalizeBrPhone, isValidBrPhone } from '@/lib/phone';
import { addDays, shopInstant } from '@/lib/time';
import { eligiblePros, overlaps, proSlots, summarize, type BusyMap } from './availability';
import { BookingError, type AdminApi, type Block, type Booking, type BookingApi, type CreateBookingRequest, type StaffUser } from './types';

// DEMO adapter: simulates the server in the browser so the full flow (and the admin panel)
// can be tried without a backend. Data lives only on this device. Not a real schedule.

type StoredBlock = Block & { start: number; end: number };
type Store = { bookings: Booking[]; idempotency: Record<string, string>; blocks: StoredBlock[]; version: number; nextBlockId: number };

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const LOCAL_STORE_KEY = 'business.demo.bookings.v1';
// Demo accounts (this browser only). The live system uses the accounts in the Cloudflare database.
export const DEMO_LOGINS = [
  { username: 'admin', password: 'business123', name: 'Administração', role: 'admin' as const, proId: null },
  { username: 'lucas', password: 'business123', name: 'Lucas', role: 'barbeiro' as const, proId: 'lucas' },
];
const USERS_KEY = 'business.demo.staff.v1';
const SESSION_KEY = 'business.demo.session';
type DemoUser = StaffUser & { password: string };
const CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';

export function createLocalApi(storage: StorageLike, opts: { latencyMs?: number; now?: () => Date } = {}): BookingApi & { admin: AdminApi } {
  const latency = opts.latencyMs ?? 350;
  const now = opts.now ?? (() => new Date());
  const wait = () => new Promise((r) => setTimeout(r, latency));

  const read = (): Store => {
    try {
      const s = JSON.parse(storage.getItem(LOCAL_STORE_KEY) ?? '') as Partial<Store>;
      return { bookings: s.bookings ?? [], idempotency: s.idempotency ?? {}, blocks: s.blocks ?? [], version: s.version ?? 1, nextBlockId: s.nextBlockId ?? 1 };
    } catch {
      return { bookings: [], idempotency: {}, blocks: [], version: 1, nextBlockId: 1 };
    }
  };
  const write = (s: Store, changed = true) => {
    if (changed) s.version += 1;
    storage.setItem(LOCAL_STORE_KEY, JSON.stringify(s));
  };

  const busyFor = (store: Store, day: string): BusyMap => {
    const map: BusyMap = {};
    const push = (pro: string, start: number, end: number) => (map[pro] ??= []).push({ start, end });
    for (const b of store.bookings) if (b.status === 'confirmed' && b.day === day) push(b.proId, Date.parse(b.start), Date.parse(b.end));
    for (const b of store.blocks) if (b.day === day) for (const p of b.proId ? [b.proId] : team.map((t) => t.id)) push(p, b.start, b.end);
    return map;
  };

  const newCode = (store: Store) => {
    let code = '';
    do {
      code = 'BU-' + Array.from({ length: 5 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
    } while (store.bookings.some((b) => b.code === code));
    return code;
  };

  async function createBooking(req: CreateBookingRequest, byShop: boolean): Promise<Booking> {
    await wait();
    const store = read();
    const existing = store.idempotency[req.idempotencyKey];
    if (existing) return store.bookings.find((b) => b.code === existing)!;

    const name = req.customer.name.trim();
    const phoneOk = isValidBrPhone(req.customer.phone) || (byShop && req.customer.phone.replace(/\D/g, '') === '');
    if (name.length < 2 || !phoneOk) throw new BookingError('invalid');
    const { durationMin, priceCents, services } = summarize(req.serviceIds);
    if (!services.length) throw new BookingError('invalid');

    // Re-validate at "commit time": the slot must still be free for the chosen professional.
    const busy = busyFor(store, req.day);
    const candidates = eligiblePros(req.serviceIds).filter((p) => req.proId === 'any' || p.id === req.proId);
    const rules = byShop ? { ...site.booking, minLeadMin: 0 } : site.booking;
    const pro = candidates.find((p) => proSlots(p, req.day, durationMin, busy[p.id] ?? [], now(), rules).includes(req.time));
    if (!pro) throw new BookingError('slot_taken');

    const start = shopInstant(req.day, req.time);
    const end = new Date(start.getTime() + durationMin * 60_000);
    const interval = { start: start.getTime(), end: end.getTime() };
    if ((busy[pro.id] ?? []).some((b) => overlaps(interval, b, site.booking.bufferMin * 60_000))) {
      throw new BookingError('slot_taken');
    }

    const booking: Booking = {
      code: newCode(store),
      status: 'confirmed',
      day: req.day,
      time: req.time,
      start: start.toISOString(),
      end: end.toISOString(),
      proId: pro.id,
      serviceIds: req.serviceIds,
      durationMin,
      totalCents: priceCents,
      customer: { ...req.customer, name, phone: normalizeBrPhone(req.customer.phone) },
      createdAt: now().toISOString(),
    };
    store.bookings.push(booking);
    store.idempotency[req.idempotencyKey] = booking.code;
    write(store);
    return booking;
  }

  const strip = ({ start: _s, end: _e, ...b }: StoredBlock): Block => b;

  const readUsers = (): DemoUser[] => {
    try {
      const u = JSON.parse(storage.getItem(USERS_KEY) ?? '') as DemoUser[];
      if (Array.isArray(u) && u.length) return u;
    } catch {
      /* first run */
    }
    return DEMO_LOGINS.map((l, i) => ({ id: i + 1, username: l.username, name: l.name, role: l.role, proId: l.proId, active: true, password: l.password, lastLoginAt: null }));
  };
  const writeUsers = (u: DemoUser[]) => storage.setItem(USERS_KEY, JSON.stringify(u));
  const pub = ({ password: _p, ...u }: DemoUser): StaffUser => u;
  const current = () => {
    const id = Number(storage.getItem(SESSION_KEY) ?? 0);
    const u = readUsers().find((x) => x.id === id && x.active);
    if (!u) throw new BookingError('unauthorized');
    return u;
  };
  const requireAdmin = () => {
    if (current().role !== 'admin') throw new BookingError('forbidden');
  };
  const checkPassword = (p: string) => {
    if (p.length < 8 || !/[a-zA-Z]/.test(p) || !/\d/.test(p)) throw new BookingError('weak_password');
  };

  const admin: AdminApi = {
    async setupNeeded() {
      return false;
    },
    async setup() {
      throw new BookingError('setup_done');
    },
    async login(username, password) {
      await wait();
      const u = readUsers().find((x) => x.username === username.trim().toLowerCase() && x.active);
      if (!u || u.password !== password) throw new BookingError('unauthorized');
      const users = readUsers();
      const stored = users.find((x) => x.id === u.id)!;
      stored.lastLoginAt = now().toISOString();
      writeUsers(users);
      storage.setItem(SESSION_KEY, String(u.id));
      return pub(stored);
    },
    async me() {
      return pub(current());
    },
    async logout() {
      storage.setItem(SESSION_KEY, '0');
    },
    async changePassword(cur, next) {
      await wait();
      const users = readUsers();
      const u = users.find((x) => x.id === current().id)!;
      if (u.password !== cur) throw new BookingError('unauthorized');
      checkPassword(next);
      u.password = next;
      writeUsers(users);
    },
    async users() {
      requireAdmin();
      return readUsers().map(pub);
    },
    async createUser(nu) {
      await wait();
      requireAdmin();
      const users = readUsers();
      if (!/^[a-z0-9._-]{3,32}$/.test(nu.username.toLowerCase()) || nu.name.trim().length < 2) throw new BookingError('invalid');
      if (users.some((x) => x.username === nu.username.toLowerCase())) throw new BookingError('username_taken');
      checkPassword(nu.password);
      const u: DemoUser = { id: Math.max(0, ...users.map((x) => x.id)) + 1, username: nu.username.toLowerCase(), name: nu.name.trim(), role: nu.role, proId: nu.proId, active: true, password: nu.password, lastLoginAt: null };
      writeUsers([...users, u]);
      return pub(u);
    },
    async updateUser(id, patch) {
      await wait();
      requireAdmin();
      const users = readUsers();
      const u = users.find((x) => x.id === id);
      if (!u) throw new BookingError('not_found');
      if (id === current().id && (patch.active === false || (patch.role && patch.role !== 'admin'))) throw new BookingError('invalid');
      if (patch.password !== undefined) checkPassword(patch.password);
      Object.assign(u, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
      writeUsers(users);
      return pub(u);
    },
    async day(day) {
      await wait();
      const s = read();
      return {
        bookings: s.bookings.filter((b) => b.day === day).sort((a, b) => a.start.localeCompare(b.start)),
        blocks: s.blocks.filter((b) => b.day === day).sort((a, b) => a.start - b.start).map(strip),
      };
    },
    async addBlock(nb) {
      await wait();
      const s = read();
      const partial = !!nb.startTime;
      const created: StoredBlock[] = [];
      for (let d = nb.from; d <= nb.to; d = addDays(d, 1)) {
        created.push({
          id: s.nextBlockId++,
          proId: nb.proId,
          day: d,
          startTime: partial ? nb.startTime! : null,
          endTime: partial ? nb.endTime! : null,
          reason: nb.reason?.trim() || null,
          start: shopInstant(d, partial ? nb.startTime! : '00:00').getTime(),
          end: partial ? shopInstant(d, nb.endTime!).getTime() : shopInstant(addDays(d, 1), '00:00').getTime(),
        });
      }
      s.blocks.push(...created);
      write(s);
      const conflicts = s.bookings.filter(
        (b) => b.status === 'confirmed' && (!nb.proId || b.proId === nb.proId) && created.some((c) => c.day === b.day && Date.parse(b.start) < c.end && Date.parse(b.end) > c.start),
      );
      return { created: created.length, conflicts };
    },
    async removeBlock(id) {
      await wait();
      const s = read();
      s.blocks = s.blocks.filter((b) => b.id !== id);
      write(s);
    },
    book: (req) => createBooking(req, true),
    async setStatus(code, status) {
      await wait();
      const s = read();
      const b = s.bookings.find((x) => x.code === code);
      if (!b) throw new BookingError('not_found');
      b.status = status;
      write(s);
      return b;
    },
  };

  return {
    mode: 'demo',
    admin,

    async version() {
      return read().version;
    },

    async getBusy(day) {
      await wait();
      return busyFor(read(), day);
    },

    async closures(from, to) {
      const out = { closed: [] as string[], off: {} as Record<string, string[]> };
      for (const b of read().blocks) {
        if (b.startTime || b.day < from || b.day > to) continue;
        if (b.proId) (out.off[b.proId] ??= []).push(b.day);
        else out.closed.push(b.day);
      }
      return out;
    },

    create: (req: CreateBookingRequest) => createBooking(req, false),

    async find(code, phone) {
      await wait();
      const c = code.trim().toUpperCase();
      return read().bookings.find((b) => b.code === c && b.customer.phone === normalizeBrPhone(phone)) ?? null;
    },

    async cancel(code, phone) {
      await wait();
      const store = read();
      const b = store.bookings.find((x) => x.code === code.trim().toUpperCase() && x.customer.phone === normalizeBrPhone(phone));
      if (!b) throw new BookingError('not_found');
      if (b.status === 'confirmed') {
        if (Date.parse(b.start) - now().getTime() < site.booking.cancelUntilHours * 3_600_000) throw new BookingError('too_late');
        b.status = 'cancelled';
        write(store);
      }
      return b;
    },
  };
}

import { normalizeBrPhone } from '@/lib/phone';
import { BookingError, type AdminApi, type Booking, type BookingApi, type BookingErrorCode, type BusyMap, type DayClosures, type StaffUser } from './types';

// LIVE adapter: talks to the Cloudflare Worker API in server/ (D1 database).

const KNOWN: BookingErrorCode[] = ['slot_taken', 'invalid', 'not_found', 'too_late', 'unauthorized', 'forbidden', 'locked', 'username_taken', 'weak_password', 'setup_done'];
const SESSION_KEY = 'business.staff.session';

async function request<T>(base: string, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) }, cache: 'no-store' });
  } catch {
    throw new BookingError('network');
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const code = KNOWN.find((k) => k === body.error) ?? (res.status >= 500 ? 'network' : 'invalid');
    throw new BookingError(code, body.error);
  }
  return (await res.json()) as T;
}

// Session token: localStorage when "keep me signed in" is checked, otherwise only for this tab.
function adminToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeToken(token: string, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, token);
  } catch {
    /* storage unavailable: the session lasts for this page only */
  }
}

export function createCloudflareApi(base = ''): BookingApi & { admin: AdminApi } {
  const authed = (): RequestInit => ({ headers: { Authorization: `Bearer ${adminToken()}` } });

  type SessionResponse = { user: StaffUser; token: string };
  const admin: AdminApi = {
    async setupNeeded() {
      return (await request<{ needed: boolean }>(base, '/api/staff/setup')).needed;
    },
    async setup(req) {
      const res = await request<SessionResponse>(base, '/api/staff/setup', { method: 'POST', body: JSON.stringify(req) });
      storeToken(res.token, false);
      return res.user;
    },
    async login(username, password, remember) {
      const res = await request<SessionResponse>(base, '/api/staff/login', { method: 'POST', body: JSON.stringify({ username, password, remember }) });
      clearAdminSession();
      storeToken(res.token, remember);
      return res.user;
    },
    me: () => request<StaffUser>(base, '/api/staff/me', authed()),
    async logout() {
      await request(base, '/api/staff/logout', { ...authed(), method: 'POST' }).catch(() => undefined);
      clearAdminSession();
    },
    async changePassword(current, next) {
      await request(base, '/api/staff/password', { ...authed(), method: 'POST', body: JSON.stringify({ current, next }) });
    },
    async users() {
      return (await request<{ users: StaffUser[] }>(base, '/api/staff/users', authed())).users;
    },
    createUser: (user) => request<StaffUser>(base, '/api/staff/users', { ...authed(), method: 'POST', body: JSON.stringify(user) }),
    updateUser: (id, patch) => request<StaffUser>(base, `/api/staff/users/${id}`, { ...authed(), method: 'PATCH', body: JSON.stringify(patch) }),
    day: (day) => request(base, `/api/admin/day?day=${day}`, authed()),
    addBlock: (block) => request(base, '/api/admin/blocks', { ...authed(), method: 'POST', body: JSON.stringify(block) }),
    async removeBlock(id) {
      await request(base, `/api/admin/blocks/${id}`, { ...authed(), method: 'DELETE' });
    },
    setStatus: (code, status) => request(base, `/api/admin/bookings/${code}/status`, { ...authed(), method: 'POST', body: JSON.stringify({ status }) }),
    book: (req) => request<Booking>(base, '/api/admin/bookings', { ...authed(), method: 'POST', body: JSON.stringify(req) }),
  };

  return {
    mode: 'live',
    admin,
    async version() {
      return (await request<{ version: number }>(base, '/api/version')).version;
    },
    async getBusy(day) {
      return (await request<{ busy: BusyMap }>(base, `/api/busy?day=${day}`)).busy;
    },
    closures: (from, to) => request<DayClosures>(base, `/api/closures?from=${from}&to=${to}`),
    create: (req) => request<Booking>(base, '/api/bookings', { method: 'POST', body: JSON.stringify(req) }),
    async find(code, phone) {
      try {
        return await request<Booking>(base, '/api/bookings/lookup', { method: 'POST', body: JSON.stringify({ code, phone: normalizeBrPhone(phone) }) });
      } catch (e) {
        if (e instanceof BookingError && e.code === 'not_found') return null;
        throw e;
      }
    },
    cancel: (code, phone) => request<Booking>(base, '/api/bookings/cancel', { method: 'POST', body: JSON.stringify({ code, phone: normalizeBrPhone(phone) }) }),
  };
}

export const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

import { normalizeBrPhone } from '@/lib/phone';
import { BookingError, type AdminApi, type Booking, type BookingApi, type BookingErrorCode, type BusyMap, type DayClosures } from './types';

// LIVE adapter: talks to the Cloudflare Worker API in server/ (D1 database).

const KNOWN: BookingErrorCode[] = ['slot_taken', 'invalid', 'not_found', 'too_late', 'unauthorized'];
const ADMIN_KEY = 'rb.admin.token';

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

function adminToken() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function createCloudflareApi(base = ''): BookingApi & { admin: AdminApi } {
  const authed = (): RequestInit => ({ headers: { Authorization: `Bearer ${adminToken()}` } });

  const admin: AdminApi = {
    async login(password) {
      await request(base, '/api/admin/session', { headers: { Authorization: `Bearer ${password}` } });
      try {
        sessionStorage.setItem(ADMIN_KEY, password);
      } catch {
        /* storage unavailable: login lasts for this page only */
      }
    },
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
    sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
};

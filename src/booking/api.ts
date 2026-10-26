import { createCloudflareApi } from './cloudflareApi';
import { createLocalApi } from './localApi';

// Production builds talk to the Cloudflare API (VITE_BOOKING_BACKEND=cloudflare in .env.production).
// Development and the static preview run the in-browser demo adapter.
const backend = import.meta.env.VITE_BOOKING_BACKEND as string | undefined;

const memory = new Map<string, string>();
const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
};

const api = backend === 'cloudflare' ? createCloudflareApi((import.meta.env.VITE_API_BASE as string | undefined) ?? '') : createLocalApi(safeStorage);

export const bookingApi = api;
export const adminApi = api.admin;

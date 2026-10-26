import { bookingApi } from './api';
import type { BusyMap } from './types';

// Short-lived cache so the home page sections (hero shortcut, live board, team) share one request
// per day. Cleared whenever the schedule changes, so nothing stale survives a push.
const cache = new Map<string, { at: number; promise: Promise<BusyMap> }>();

export function cachedBusy(day: string, maxAgeMs = 5_000) {
  const hit = cache.get(day);
  if (hit && Date.now() - hit.at < maxAgeMs) return hit.promise;
  const promise = bookingApi.getBusy(day);
  cache.set(day, { at: Date.now(), promise });
  promise.catch(() => cache.delete(day));
  return promise;
}

export const invalidateBusy = () => cache.clear();

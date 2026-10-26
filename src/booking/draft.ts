import { useCallback, useSyncExternalStore } from 'react';

// Booking draft shared by the home page (comanda, live board) and the booking flow.
// Kept in sessionStorage so a refresh or the back button never loses what the visitor chose.

export type Draft = {
  serviceIds: string[];
  proId: string | 'any' | null;
  day: string | null;
  time: string | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
  idempotencyKey: string;
};

const KEY = 'rb.booking.draft.v1';

export const emptyDraft = (): Draft => ({
  serviceIds: [],
  proId: null,
  day: null,
  time: null,
  name: '',
  phone: '',
  email: '',
  notes: '',
  idempotencyKey: crypto.randomUUID?.() ?? String(Math.random()).slice(2),
});

function load(): Draft {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...emptyDraft(), ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* storage unavailable */
  }
  return emptyDraft();
}

let state: Draft = load();
const listeners = new Set<() => void>();

function set(next: Draft) {
  state = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useDraft() {
  const draft = useSyncExternalStore(subscribe, () => state);
  const update = useCallback((patch: Partial<Draft>) => set({ ...state, ...patch }), []);
  const reset = useCallback(() => set(emptyDraft()), []);
  return { draft, update, reset };
}

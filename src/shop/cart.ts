import { useCallback, useSyncExternalStore } from 'react';
import { productById } from '@/config/products';

// Shopping bag. Persisted in localStorage so it survives reloads; checkout is a WhatsApp message
// (payment happens at the shop), so no personal data is stored here.

export type CartLine = { id: string; qty: number };
type State = { lines: CartLine[]; open: boolean };

const KEY = 'business.cart.v1';
const MAX_QTY = 20;

function load(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[];
    return raw.filter((l) => productById(l.id) && l.qty > 0).map((l) => ({ id: l.id, qty: Math.min(l.qty, MAX_QTY) }));
  } catch {
    return [];
  }
}

let state: State = { lines: load(), open: false };
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state.lines));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) set({ ...state, lines: load() });
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCart() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  const add = useCallback((id: string, qty = 1) => {
    const found = state.lines.find((l) => l.id === id);
    const lines = found
      ? state.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l))
      : [...state.lines, { id, qty: Math.min(qty, MAX_QTY) }];
    set({ ...state, lines });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    const lines = qty <= 0 ? state.lines.filter((l) => l.id !== id) : state.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, MAX_QTY) } : l));
    set({ ...state, lines });
  }, []);
  const clear = useCallback(() => set({ ...state, lines: [] }), []);
  const setOpen = useCallback((open: boolean) => set({ ...state, open }), []);

  const items = s.lines.flatMap((l) => {
    const product = productById(l.id);
    return product ? [{ ...l, product }] : [];
  });
  const count = items.reduce((n, l) => n + l.qty, 0);
  const totalCents = items.reduce((n, l) => n + l.qty * l.product.priceCents, 0);
  return { items, count, totalCents, open: s.open, add, setQty, clear, setOpen };
}

export const qtyOf = (lines: { id: string; qty: number }[], id: string) => lines.find((l) => l.id === id)?.qty ?? 0;

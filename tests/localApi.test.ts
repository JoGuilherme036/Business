import { describe, expect, it } from 'vitest';
import { createLocalApi } from '@/booking/localApi';
import { BookingError } from '@/booking/types';
import { shopInstant } from '@/lib/time';

function memoryStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}

const now = () => shopInstant('2026-11-03', '08:00');
const base = {
  serviceIds: ['corte-assinatura'],
  day: '2026-11-03',
  time: '10:00',
  customer: { name: 'Ana Teste', phone: '(11) 98765-4321' },
};

describe('local booking adapter', () => {
  it('creates a booking and is idempotent on retries', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const a = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    expect(a.code).toBe(b.code);
    expect(a.customer.phone).toBe('11987654321');
    expect((await api.getBusy('2026-11-03')).lucas).toHaveLength(1);
  });

  it('rejects an overlapping booking for the same professional', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    await expect(api.create({ ...base, time: '10:30', proId: 'lucas', idempotencyKey: 'k2' })).rejects.toMatchObject({ code: 'slot_taken' });
  });

  it('assigns another professional for "any" when the first is busy, then runs out', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const first = await api.create({ ...base, proId: 'any', idempotencyKey: 'a' });
    const second = await api.create({ ...base, proId: 'any', idempotencyKey: 'b' });
    expect(first.proId).not.toBe(second.proId);
    // Only lucas and mateus work on Tuesday for this service.
    await expect(api.create({ ...base, proId: 'any', idempotencyKey: 'c' })).rejects.toBeInstanceOf(BookingError);
  });

  it('validates customer data', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    await expect(api.create({ ...base, customer: { name: 'A', phone: '123' }, proId: 'lucas', idempotencyKey: 'x' })).rejects.toMatchObject({ code: 'invalid' });
  });

  it('finds by code + phone and cancels within the policy window', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    expect(await api.find(b.code.toLowerCase(), '+55 11 98765-4321')).toMatchObject({ code: b.code });
    expect(await api.find(b.code, '11900000000')).toBeNull();
    const cancelled = await api.cancel(b.code, '11987654321');
    expect(cancelled.status).toBe('cancelled');
    expect((await api.getBusy('2026-11-03')).lucas).toBeUndefined();
  });

  it('refuses online cancellation too close to the appointment', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now: () => shopInstant('2026-11-03', '08:00') });
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    const later = createLocalApi(
      { getItem: () => JSON.stringify({ bookings: [b], idempotency: {} }), setItem: () => {} },
      { latencyMs: 0, now: () => shopInstant('2026-11-03', '09:00') },
    );
    await expect(later.cancel(b.code, '11987654321')).rejects.toMatchObject({ code: 'too_late' });
  });
});

describe('blocks, closures and sync version (demo adapter)', () => {
  it('a time block removes those slots and bumps the version', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const v0 = await api.version();
    const r = await api.admin.addBlock({ proId: 'lucas', from: '2026-11-03', to: '2026-11-03', startTime: '10:00', endTime: '12:00', reason: 'Curso' });
    expect(r.created).toBe(1);
    expect(await api.version()).toBeGreaterThan(v0);
    await expect(api.create({ ...base, time: '10:30', proId: 'lucas', idempotencyKey: 'b1' })).rejects.toMatchObject({ code: 'slot_taken' });
    // "Any" falls through to the next professional who is free.
    expect((await api.create({ ...base, time: '10:30', proId: 'any', idempotencyKey: 'b2' })).proId).toBe('mateus');
  });

  it('a shop-wide whole-day block closes the day for everyone', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    await api.admin.addBlock({ proId: null, from: '2026-11-04', to: '2026-11-05' });
    expect(await api.closures('2026-11-01', '2026-11-30')).toEqual({ closed: ['2026-11-04', '2026-11-05'], off: {} });
    await expect(api.create({ ...base, day: '2026-11-04', proId: 'any', idempotencyKey: 'c1' })).rejects.toMatchObject({ code: 'slot_taken' });
  });

  it('reports existing bookings that fall inside a new block', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k1' });
    const r = await api.admin.addBlock({ proId: 'lucas', from: '2026-11-03', to: '2026-11-03', startTime: '09:00', endTime: '12:00' });
    expect(r.conflicts.map((c) => c.code)).toEqual([b.code]);
  });

  it('removing a block frees the slots again; status changes are tracked', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    await api.admin.addBlock({ proId: 'lucas', from: '2026-11-03', to: '2026-11-03' });
    const { blocks } = await api.admin.day('2026-11-03');
    await api.admin.removeBlock(blocks[0].id);
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'k9' });
    expect((await api.admin.setStatus(b.code, 'completed')).status).toBe('completed');
    expect((await api.getBusy('2026-11-03')).lucas).toBeUndefined(); // completed no longer occupies
  });

  it('signs team members in with user and password, and only admins manage accounts', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    await expect(api.admin.me()).rejects.toMatchObject({ code: 'unauthorized' });
    await expect(api.admin.login('admin', 'errada', false)).rejects.toMatchObject({ code: 'unauthorized' });
    expect((await api.admin.login('admin', 'business123', false)).role).toBe('admin');
    const novo = await api.admin.createUser({ username: 'mateus', name: 'Mateus', password: 'senha1234', role: 'barbeiro', proId: 'mateus' });
    await expect(api.admin.createUser({ username: 'mateus', name: 'Outro', password: 'senha1234', role: 'barbeiro', proId: null })).rejects.toMatchObject({ code: 'username_taken' });
    await expect(api.admin.createUser({ username: 'fraca', name: 'Fraca', password: '123', role: 'barbeiro', proId: null })).rejects.toMatchObject({ code: 'weak_password' });
    await api.admin.login('mateus', 'senha1234', false);
    await expect(api.admin.users()).rejects.toMatchObject({ code: 'forbidden' });
    await api.admin.login('admin', 'business123', false);
    await api.admin.updateUser(novo.id, { active: false });
    await expect(api.admin.login('mateus', 'senha1234', false)).rejects.toMatchObject({ code: 'unauthorized' });
  });
});

describe('shop-side booking (admin panel)', () => {
  it('books walk-ins without the online minimum notice and without a phone', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now: () => shopInstant('2026-11-03', '09:50') });
    // 10:00 is inside the 60-min online notice: refused online, accepted for the shop.
    await expect(api.create({ ...base, time: '10:00', proId: 'lucas', idempotencyKey: 'w1' })).rejects.toMatchObject({ code: 'slot_taken' });
    const b = await api.admin.book({ ...base, time: '10:00', proId: 'lucas', idempotencyKey: 'w2', customer: { name: 'Walk-in', phone: '' } });
    expect(b.proId).toBe('lucas');
    expect(b.customer.phone).toBe('');
  });
});

describe('online requests and client notes', () => {
  it('online bookings wait for the team, hold the slot, and are confirmed or declined in the panel', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const req = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'p1' });
    expect(req.status).toBe('pending');
    await expect(api.create({ ...base, proId: 'lucas', idempotencyKey: 'p2' })).rejects.toMatchObject({ code: 'slot_taken' });
    expect((await api.admin.pending()).bookings.map((b) => b.code)).toEqual([req.code]);
    expect((await api.admin.setStatus(req.code, 'confirmed')).status).toBe('confirmed');
    await expect(api.admin.setStatus(req.code, 'declined')).rejects.toMatchObject({ code: 'not_found' }); // already answered
    const other = await api.create({ ...base, time: '14:00', proId: 'lucas', idempotencyKey: 'p3' });
    await api.admin.setStatus(other.code, 'declined');
    expect((await api.getBusy('2026-11-03')).lucas).toHaveLength(1); // the declined request frees its slot
    const walkIn = await api.admin.book({ ...base, time: '16:00', proId: 'lucas', idempotencyKey: 'p4' });
    expect(walkIn.status).toBe('confirmed'); // the team's own bookings need no approval
  });

  it('a client the team marked is asked to talk on WhatsApp, and the panel shows their history', async () => {
    const api = createLocalApi(memoryStorage(), { latencyMs: 0, now });
    const b = await api.create({ ...base, proId: 'lucas', idempotencyKey: 'c1' });
    await api.admin.setStatus(b.code, 'confirmed');
    await api.admin.setStatus(b.code, 'no_show');
    await api.admin.saveCustomer(base.customer.phone, { blocked: true, note: 'Faltou sem avisar' });
    await expect(api.create({ ...base, time: '15:00', proId: 'lucas', idempotencyKey: 'c2' })).rejects.toMatchObject({ code: 'contact_shop' });
    const day = await api.admin.day('2026-11-03');
    expect(day.customers['11987654321']).toMatchObject({ noShows: 1, blocked: true, note: 'Faltou sem avisar' });
    expect((await api.admin.book({ ...base, time: '15:00', proId: 'lucas', idempotencyKey: 'c3' })).status).toBe('confirmed'); // the team can still book them
  });
});

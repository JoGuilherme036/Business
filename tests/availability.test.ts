import { describe, expect, it } from 'vitest';
import { team } from '@/config/catalog';
import { bookableDays, eligiblePros, overlaps, proSlots, slotsFor, summarize } from '@/booking/availability';
import { toggleService } from '@/booking/selection';
import { shopInstant } from '@/lib/time';

const lucas = team.find((p) => p.id === 'lucas')!;
// Same pro, but with a lunch break: exercises split working ranges.
const split = { ...lucas, schedule: { 2: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '20:00' }] } };
// Tuesday 2026-11-03, 08:00 in Teresina: a full working day ahead.
const now = shopInstant('2026-11-03', '08:00');
const day = '2026-11-03';

describe('summarize', () => {
  it('sums duration and price', () => {
    expect(summarize(['fade', 'sobrancelha'])).toMatchObject({ durationMin: 60, priceCents: 9000 });
  });
  it('never charges a service twice when a combo already includes it', () => {
    const s = summarize(['corte-barba', 'corte-assinatura', 'barba-ritual']);
    expect(s.services.map((x) => x.id)).toEqual(['corte-barba']);
    expect(s.priceCents).toBe(10500);
  });
});

describe('toggleService', () => {
  it('replaces included services when a combo is chosen, and vice versa', () => {
    expect(toggleService(['corte-assinatura', 'sobrancelha'], 'corte-barba')).toEqual(['sobrancelha', 'corte-barba']);
    expect(toggleService(['corte-barba'], 'barba-ritual')).toEqual(['barba-ritual']);
    expect(toggleService(['fade'], 'fade')).toEqual([]);
  });
});

describe('proSlots', () => {
  it('respects working ranges, lunch break and service duration', () => {
    const slots = proSlots(split, day, 45, [], now);
    expect(slots[0]).toBe('09:00'); // 08:00 + 60 min lead = opening time
    expect(slots).toContain('11:15'); // 11:15 + 45 = 12:00 fits before lunch
    expect(slots).not.toContain('11:30'); // would run into lunch
    expect(slots).toContain('13:00');
    expect(slots.at(-1)).toBe('19:15'); // must end by 20:00
  });

  it('blocks overlapping bookings including the preparation buffer', () => {
    const busy = [{ start: shopInstant(day, '15:00').getTime(), end: shopInstant(day, '15:45').getTime() }];
    const slots = proSlots(lucas, day, 45, busy, now);
    expect(slots).not.toContain('14:15'); // ends 15:00, buffer 10 min collides
    expect(slots).toContain('14:00'); // ends 14:45 + 10 = 14:55 < 15:00
    expect(slots).not.toContain('15:45'); // buffer after the booking
    expect(slots).toContain('16:00');
  });

  it('returns nothing on days off, closed dates and beyond the horizon', () => {
    expect(proSlots(lucas, '2026-11-08', 45, [], now)).toEqual([]); // Sunday
    expect(proSlots(lucas, '2026-12-25', 45, [], shopInstant('2026-12-20', '08:00'))).toEqual([]);
    expect(proSlots(lucas, '2027-01-20', 45, [], now)).toEqual([]);
  });

  it('honours the minimum lead time', () => {
    const late = shopInstant(day, '18:10'); // earliest start 19:10
    expect(proSlots(lucas, day, 45, [], late)).toEqual(['19:15']);
  });
});

describe('slotsFor "any"', () => {
  it('merges professionals and lists who can take each slot', () => {
    const allBusy = { lucas: [{ start: shopInstant(day, '09:00').getTime(), end: shopInstant(day, '12:00').getTime() }] };
    const slots = slotsFor(['corte-assinatura'], 'any', day, allBusy, now);
    const s1000 = slots.find((s) => s.time === '10:00');
    expect(s1000?.proIds).toEqual(['mateus']); // lucas busy, gabriel off on Tuesdays
  });

  it('only includes professionals that perform every chosen service', () => {
    expect(eligiblePros(['sobrancelha', 'classico']).map((p) => p.id)).toEqual(['lucas']);
  });
});

describe('bookableDays', () => {
  it('marks days nobody works', () => {
    const days = bookableDays(['fade'], 'any', now);
    expect(days[0]).toEqual({ day, works: true });
    expect(days.find((d) => d.day === '2026-11-08')?.works).toBe(false);
  });
  it('respects whole-day closures from the admin panel', () => {
    const closures = { closed: ['2026-11-04'], off: { lucas: ['2026-11-05'] } };
    const any = bookableDays(['fade'], 'any', now, undefined, closures);
    expect(any.find((d) => d.day === '2026-11-04')?.works).toBe(false);
    expect(any.find((d) => d.day === '2026-11-05')?.works).toBe(true); // Mateus still works
    const pro = bookableDays(['fade'], 'lucas', now, undefined, closures);
    expect(pro.find((d) => d.day === '2026-11-05')?.works).toBe(false);
  });
});

describe('overlaps', () => {
  it('treats touching intervals with zero buffer as free', () => {
    expect(overlaps({ start: 0, end: 10 }, { start: 10, end: 20 }, 0)).toBe(false);
    expect(overlaps({ start: 0, end: 10 }, { start: 10, end: 20 }, 1)).toBe(true);
  });
});

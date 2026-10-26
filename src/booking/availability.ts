import { site } from '../config/site';
import { serviceById, team, type Professional } from '../config/catalog';
import { shopRanges } from '../lib/hours';
import { addDays, fromMinutes, shopInstant, shopNow, toMinutes, weekdayOf } from '../lib/time';

// Pure availability rules. The server re-validates everything on create; this module only
// decides what the visitor is offered.

export type Interval = { start: number; end: number }; // epoch ms, end = service end (no buffer)
export type BusyMap = Record<string, Interval[]>;

export type Settings = {
  slotStepMin: number;
  bufferMin: number;
  minLeadMin: number;
  maxDaysAhead: number;
};

const defaults: Settings = site.booking;

/** Total duration and price, counting each service once even if it is part of a combo. */
export function summarize(serviceIds: string[]) {
  const selected = serviceIds.map(serviceById).filter((s) => !!s);
  const covered = new Set(selected.flatMap((s) => s.includes ?? []));
  const billable = selected.filter((s) => !covered.has(s.id));
  return {
    services: billable,
    durationMin: billable.reduce((t, s) => t + s.durationMin, 0),
    priceCents: billable.reduce((t, s) => t + s.priceCents, 0),
  };
}

export const eligiblePros = (serviceIds: string[], pros: Professional[] = team) =>
  pros.filter((p) => serviceIds.every((id) => p.serviceIds.includes(id)));

function workingRanges(pro: Professional, day: string) {
  const shop = shopRanges(day);
  const own = pro.schedule[weekdayOf(day)] ?? [];
  const out: { start: number; end: number }[] = [];
  for (const a of own) {
    for (const b of shop) {
      const start = Math.max(toMinutes(a.start), toMinutes(b.start));
      const end = Math.min(toMinutes(a.end), toMinutes(b.end));
      if (end > start) out.push({ start, end });
    }
  }
  return out;
}

export const overlaps = (a: Interval, b: Interval, bufferMs: number) =>
  a.start < b.end + bufferMs && b.start < a.end + bufferMs;

export function isWithinHorizon(day: string, now: Date, s: Settings = defaults) {
  const today = shopNow(now).day;
  return day >= today && day <= addDays(today, s.maxDaysAhead);
}

/** Start times ("HH:mm") a professional can take on `day` for a given duration. */
export function proSlots(
  pro: Professional,
  day: string,
  durationMin: number,
  busy: Interval[],
  now: Date,
  s: Settings = defaults,
) {
  if (durationMin <= 0 || !isWithinHorizon(day, now, s)) return [];
  const earliest = now.getTime() + s.minLeadMin * 60_000;
  const bufferMs = s.bufferMin * 60_000;
  const slots: string[] = [];
  for (const r of workingRanges(pro, day)) {
    for (let t = r.start; t + durationMin <= r.end; t += s.slotStepMin) {
      const start = shopInstant(day, fromMinutes(t)).getTime();
      if (start < earliest) continue;
      const candidate = { start, end: start + durationMin * 60_000 };
      if (!busy.some((b) => overlaps(candidate, b, bufferMs))) slots.push(fromMinutes(t));
    }
  }
  return slots;
}

/** Slots for a specific professional or for "any" (union, with the pros that can take each one). */
export function slotsFor(
  serviceIds: string[],
  proId: string | 'any',
  day: string,
  busy: BusyMap,
  now: Date,
  s: Settings = defaults,
) {
  const { durationMin } = summarize(serviceIds);
  const pros = eligiblePros(serviceIds).filter((p) => proId === 'any' || p.id === proId);
  const map = new Map<string, string[]>();
  for (const p of pros) {
    for (const t of proSlots(p, day, durationMin, busy[p.id] ?? [], now, s)) {
      map.set(t, [...(map.get(t) ?? []), p.id]);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([time, proIds]) => ({ time, proIds }));
}

/** Whole-day closures set in the admin panel: the shop (`closed`) or one professional (`off`). */
export type DayClosures = { closed: string[]; off: Record<string, string[]> };

/** Days offered in the date strip, with a flag for days where nobody can take the booking. */
export function bookableDays(serviceIds: string[], proId: string | 'any', now: Date, s: Settings = defaults, closures?: DayClosures) {
  const today = shopNow(now).day;
  const pros = eligiblePros(serviceIds).filter((p) => proId === 'any' || p.id === proId);
  return Array.from({ length: s.maxDaysAhead + 1 }, (_, i) => {
    const day = addDays(today, i);
    const works =
      !closures?.closed.includes(day) && pros.some((p) => workingRanges(p, day).length > 0 && !closures?.off[p.id]?.includes(day));
    return { day, works };
  });
}

import { site, type TimeRange, type Weekday } from '../config/site';
import { addDays, fromMinutes, shopNow, toMinutes, weekdayNames, weekdayOf } from './time';

export const shopRanges = (day: string): readonly TimeRange[] =>
  site.closedDates.includes(day) ? [] : site.hours[weekdayOf(day) as Weekday];

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: 'hoje' | 'amanhã' | string }
  | { open: false; opensAt: null };

/** Open/closed status computed in the shop's own time zone, including closed dates. */
export function openStatus(now = new Date()): OpenStatus {
  const { day, minutes } = shopNow(now);
  for (const r of shopRanges(day)) {
    if (minutes >= toMinutes(r.start) && minutes < toMinutes(r.end)) return { open: true, closesAt: r.end };
  }
  for (let i = 0; i < 8; i++) {
    const d = addDays(day, i);
    const next = shopRanges(d).find((r) => i > 0 || toMinutes(r.start) > minutes);
    if (next) {
      const opensDay = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : weekdayNames[weekdayOf(d)].toLowerCase();
      return { open: false, opensAt: next.start, opensDay };
    }
  }
  return { open: false, opensAt: null };
}

export function statusLabel(s: OpenStatus) {
  if (s.open) return { short: 'Aberto agora', detail: `fecha às ${s.closesAt}` };
  if (s.opensAt) return { short: 'Fechado', detail: `abre ${s.opensDay} às ${s.opensAt}` };
  return { short: 'Fechado', detail: 'consulte os horários' };
}

export const formatRanges = (ranges: readonly TimeRange[]) =>
  ranges.length ? ranges.map((r) => `${r.start}–${r.end}`).join(' · ') : 'Fechado';

export { fromMinutes };

/** Compact weekly hours, grouping consecutive days with the same ranges: "Seg–Sex 09h–20h · Sáb 09h–18h". */
export function hoursSummary() {
  const short = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const fmt = (r: TimeRange[]) => r.map((x) => `${x.start.replace(':00', 'h')}–${x.end.replace(':00', 'h')}`).join(', ');
  const groups: { from: number; to: number; text: string }[] = [];
  for (const d of [1, 2, 3, 4, 5, 6, 0] as Weekday[]) {
    const ranges = site.hours[d];
    if (!ranges.length) continue;
    const text = fmt(ranges);
    const last = groups.at(-1);
    if (last && last.text === text && (last.to + 1) % 7 === d) last.to = d;
    else groups.push({ from: d, to: d, text });
  }
  return groups.map((g) => `${short[g.from]}${g.to !== g.from ? `–${short[g.to]}` : ''} ${g.text}`);
}

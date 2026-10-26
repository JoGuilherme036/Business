import { site, type Weekday } from '../config/site';

// All shop times are wall-clock times in site.timeZone. We work with "YYYY-MM-DD" day keys
// and "HH:mm" strings, and convert to absolute instants with the fixed site offset.

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Absolute instant for a shop-local day + time. */
export const shopInstant = (day: string, hhmm: string) => new Date(`${day}T${hhmm}:00${site.utcOffset}`);

/** Current date/time parts in the shop's time zone. */
export function shopNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: site.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const day = `${get('year')}-${get('month')}-${get('day')}`;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')), weekday: weekdayOf(day) };
}

export const weekdayOf = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay() as Weekday;

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const weekdayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' });
const longFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });

export const formatDayShort = (day: string) => weekdayFmt.format(new Date(`${day}T12:00:00Z`)).replace('.', '');
export const formatDayLong = (day: string) => {
  const s = longFmt.format(new Date(`${day}T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const formatMonth = (day: string) => monthFmt.format(new Date(`${day}T12:00:00Z`)).replace('.', '');
export const dayOfMonth = (day: string) => Number(day.slice(8, 10));

export const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** "Hoje", "Amanhã" or the weekday name, relative to today in the shop's time zone. */
export function relativeDayName(day: string, now = new Date()) {
  const today = shopNow(now).day;
  if (day === today) return 'Hoje';
  if (day === addDays(today, 1)) return 'Amanhã';
  return weekdayNames[weekdayOf(day)];
}

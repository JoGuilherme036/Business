import { describe, expect, it } from 'vitest';
import { openStatus, statusLabel } from '@/lib/hours';
import { isValidBrPhone, maskBrPhone, normalizeBrPhone } from '@/lib/phone';
import { whatsappLink } from '@/lib/whatsapp';
import { buildIcs } from '@/lib/ics';
import { relativeDayName, shopInstant } from '@/lib/time';

describe('openStatus (shop time zone)', () => {
  it('is open during hours and reports closing time', () => {
    expect(openStatus(shopInstant('2026-11-03', '10:00'))).toEqual({ open: true, closesAt: '20:00' });
  });
  it('points to the next opening, skipping Sunday', () => {
    expect(openStatus(shopInstant('2026-11-08', '10:00'))).toEqual({ open: false, opensAt: '13:00', opensDay: 'amanhã' });
    expect(openStatus(shopInstant('2026-11-07', '19:00'))).toMatchObject({ opensDay: 'segunda' });
  });
  it('opens later the same day', () => {
    expect(statusLabel(openStatus(shopInstant('2026-11-09', '09:00'))).detail).toBe('abre hoje às 13:00');
  });
  it('treats configured closed dates as closed', () => {
    expect(openStatus(shopInstant('2026-12-25', '10:00')).open).toBe(false);
  });
});

describe('phone', () => {
  it('normalizes pasted formats', () => {
    expect(normalizeBrPhone('+55 (11) 98765-4321')).toBe('11987654321');
    expect(normalizeBrPhone('011 98765 4321')).toBe('11987654321');
  });
  it('validates mobile and landline numbers', () => {
    expect(isValidBrPhone('11987654321')).toBe(true);
    expect(isValidBrPhone('1133334444')).toBe(true);
    expect(isValidBrPhone('1198765')).toBe(false);
  });
  it('masks progressively', () => {
    expect(maskBrPhone('119')).toBe('(11) 9');
    expect(maskBrPhone('11987654321')).toBe('(11) 98765-4321');
  });
});

describe('links', () => {
  it('encodes WhatsApp text', () => {
    expect(whatsappLink('Olá & até já')).toBe('https://wa.me/5511999999999?text=Ol%C3%A1%20%26%20at%C3%A9%20j%C3%A1');
  });
  it('builds an ICS event in UTC', () => {
    const ics = buildIcs({ uid: 'RB-1', start: shopInstant('2026-11-03', '10:00'), end: shopInstant('2026-11-03', '10:45'), title: 'Corte', description: 'x' });
    expect(ics).toContain('DTSTART:20261103T130000Z');
    expect(ics).toContain('DTEND:20261103T134500Z');
  });
});

describe('relativeDayName', () => {
  it('names today, tomorrow and later days', () => {
    const now = shopInstant('2026-11-03', '10:00');
    expect(relativeDayName('2026-11-03', now)).toBe('Hoje');
    expect(relativeDayName('2026-11-04', now)).toBe('Amanhã');
    expect(relativeDayName('2026-11-06', now)).toBe('Sexta');
  });
});

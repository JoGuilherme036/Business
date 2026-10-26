// Single source of truth for business data.
// Every value marked DEMO must be replaced with the real information before going live.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export type TimeRange = { start: string; end: string }; // "HH:mm", local time of the shop

export const site = {
  demo: true, // DEMO: set to false once the values marked DEMO below are confirmed by the owner
  name: 'Business Barbearia',
  shortName: 'Business',
  concept: 'Especialistas em imagem masculina',
  tagline: 'Barbearia · Teresina',
  url: 'https://businessbarbearia.example', // DEMO: production domain, no trailing slash

  seo: {
    title: 'Business Barbearia — Especialistas em imagem masculina em Teresina',
    description:
      'Corte, barba e cuidado com a imagem masculina em Teresina. Agende online em menos de um minuto e conheça os produtos Business.',
  },

  contact: {
    whatsapp: '5586900000000', // DEMO: country + area code + number, digits only
    phone: '+55 86 90000-0000', // DEMO: display format
    phoneHref: '+5586900000000', // DEMO
    email: 'contato@businessbarbearia.example', // DEMO
    instagram: 'https://instagram.com/businessbarbearia',
    instagramHandle: '@businessbarbearia',
  },

  address: {
    street: 'Avenida Homero Castelo Branco, 615',
    district: '', // DEMO: fill in the neighbourhood
    city: 'Teresina',
    state: 'PI',
    zip: '', // DEMO
    lat: -5.0839, // DEMO: approximate, confirm on the map
    lng: -42.7889, // DEMO
    reference: '', // DEMO: landmark to help first-time clients
    parking: '', // DEMO
  },

  timeZone: 'America/Fortaleza',
  utcOffset: '-03:00',

  hours: {
    0: [],
    1: [{ start: '09:00', end: '20:00' }],
    2: [{ start: '09:00', end: '20:00' }],
    3: [{ start: '09:00', end: '20:00' }],
    4: [{ start: '09:00', end: '20:00' }],
    5: [{ start: '09:00', end: '20:00' }],
    6: [{ start: '09:00', end: '18:00' }],
  } as Record<Weekday, TimeRange[]>,

  // Dates the shop is closed (YYYY-MM-DD).
  closedDates: ['2026-12-25', '2027-01-01'] as string[], // DEMO

  booking: {
    slotStepMin: 15,
    bufferMin: 10, // preparation time between clients
    minLeadMin: 60, // earliest booking from now
    maxDaysAhead: 30,
    cancelUntilHours: 2,
    policy:
      'Tolerância de 10 minutos de atraso. Cancelamentos e remarcações gratuitos até 2 horas antes do horário.', // DEMO
  },

  social: {
    reviews: [] as { author: string; text: string; rating: number; source: string }[], // only real, authorized reviews
  },
} as const;

export const fullAddress = [site.address.street, site.address.district, `${site.address.city}/${site.address.state}`, site.address.zip].filter(Boolean).join(' — ');

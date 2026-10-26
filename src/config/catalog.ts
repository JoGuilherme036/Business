// DEMO catalog: replace names, prices and durations with the real ones.

export type ServiceCategory = 'cortes' | 'barba' | 'combos' | 'adicionais';

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  priceCents: number;
  image?: string; // media id from src/data/media.json
  includes?: string[]; // for combos: ids of included services
};

export const categories: { id: ServiceCategory; label: string }[] = [
  { id: 'cortes', label: 'Cortes' },
  { id: 'barba', label: 'Barba' },
  { id: 'combos', label: 'Combos' },
  { id: 'adicionais', label: 'Adicionais' },
];

export const services: Service[] = [
  {
    id: 'corte-assinatura',
    name: 'Corte assinatura',
    category: 'cortes',
    description: 'Consulta de estilo, corte na tesoura e máquina, lavagem e finalização com pomada.',
    durationMin: 45,
    priceCents: 7000,
    image: 'estilo-ondulado',
  },
  {
    id: 'fade',
    name: 'Fade de precisão',
    category: 'cortes',
    description: 'Degradê do zero ao topo, transição invisível e contorno à navalha.',
    durationMin: 50,
    priceCents: 7500,
    image: 'servico-corte',
  },
  {
    id: 'classico',
    name: 'Clássico na tesoura',
    category: 'cortes',
    description: 'Corte social com volume controlado, risca marcada e acabamento natural.',
    durationMin: 45,
    priceCents: 7000,
    image: 'estilo-classico',
  },
  {
    id: 'barba-ritual',
    name: 'Barba ritual',
    category: 'barba',
    description: 'Toalha quente, óleo pré-barba, navalha, toalha fria e bálsamo.',
    durationMin: 35,
    priceCents: 5500,
    image: 'servico-barba',
  },
  {
    id: 'corte-barba',
    name: 'Corte + barba ritual',
    category: 'combos',
    description: 'O atendimento completo da casa: corte assinatura seguido da barba ritual.',
    durationMin: 80,
    priceCents: 11500,
    image: 'estilo-barba',
    includes: ['corte-assinatura', 'barba-ritual'],
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha na navalha',
    category: 'adicionais',
    description: 'Limpeza e alinhamento discreto.',
    durationMin: 10,
    priceCents: 2000,
  },
  {
    id: 'hidratacao',
    name: 'Hidratação capilar',
    category: 'adicionais',
    description: 'Máscara nutritiva com massagem no couro cabeludo.',
    durationMin: 15,
    priceCents: 3000,
  },
];

export type Professional = {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  serviceIds: string[];
  photo?: string; // media id; leave empty until a real portrait exists
  // Weekday -> working ranges. Must fall within the shop hours.
  schedule: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, { start: string; end: string }[]>>;
};

const allServices = services.map((s) => s.id);
const fullDay = [
  { start: '09:00', end: '12:00' },
  { start: '13:00', end: '20:00' },
];

export const team: Professional[] = [
  {
    id: 'rafael',
    name: 'Rafael', // DEMO
    role: 'Barbeiro fundador',
    specialties: ['Fade', 'Navalha', 'Desenho'],
    serviceIds: allServices,
    schedule: { 1: [{ start: '13:00', end: '20:00' }], 2: fullDay, 3: fullDay, 4: fullDay, 5: fullDay, 6: [{ start: '09:00', end: '18:00' }] },
  },
  {
    id: 'bruno',
    name: 'Bruno', // DEMO
    role: 'Barbeiro',
    specialties: ['Tesoura', 'Clássicos', 'Cabelo crespo'],
    serviceIds: ['corte-assinatura', 'classico', 'fade', 'corte-barba', 'barba-ritual', 'hidratacao'],
    schedule: { 2: fullDay, 3: fullDay, 4: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '21:00' }], 5: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '21:00' }], 6: [{ start: '09:00', end: '18:00' }] },
  },
  {
    id: 'diego',
    name: 'Diego', // DEMO
    role: 'Barbeiro',
    specialties: ['Barba', 'Toalha quente', 'Sobrancelha'],
    serviceIds: ['barba-ritual', 'corte-barba', 'corte-assinatura', 'sobrancelha', 'hidratacao'],
    schedule: { 1: [{ start: '13:00', end: '20:00' }], 3: fullDay, 4: fullDay, 5: fullDay, 6: [{ start: '09:00', end: '18:00' }] },
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const proById = (id: string) => team.find((p) => p.id === id);

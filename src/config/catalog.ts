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
    name: 'Corte Business',
    category: 'cortes',
    description: 'Consulta de imagem, corte na tesoura e máquina, lavagem e finalização com os produtos da casa.',
    durationMin: 45,
    priceCents: 6500,
    image: 'corte',
  },
  {
    id: 'fade',
    name: 'Degradê de precisão',
    category: 'cortes',
    description: 'Transição limpa do zero ao topo, desenho milimétrico e acabamento na navalha.',
    durationMin: 50,
    priceCents: 7000,
    image: 'salao-barbeiro',
  },
  {
    id: 'classico',
    name: 'Corte social',
    category: 'cortes',
    description: 'Corte alinhado e natural, com volume controlado e risca marcada.',
    durationMin: 40,
    priceCents: 5500,
    image: 'corte',
  },
  {
    id: 'barba-ritual',
    name: 'Barba completa',
    category: 'barba',
    description: 'Toalha quente, óleo pré-barba, navalha, toalha fria e finalização hidratante.',
    durationMin: 35,
    priceCents: 5000,
    image: 'barba',
  },
  {
    id: 'corte-barba',
    name: 'Corte + barba',
    category: 'combos',
    description: 'O atendimento completo da casa: Corte Business seguido da barba completa.',
    durationMin: 80,
    priceCents: 10500,
    image: 'barba',
    includes: ['corte-assinatura', 'barba-ritual'],
  },
  {
    id: 'experience',
    name: 'Business Experience',
    category: 'combos',
    description: 'Corte, barba, lavagem com massagem e sobrancelha. Imagem completa, sem pressa.',
    durationMin: 110,
    priceCents: 15500,
    image: 'lavagem',
    includes: ['corte-assinatura', 'barba-ritual', 'hidratacao', 'sobrancelha'],
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
    name: 'Lavagem + massagem capilar',
    category: 'adicionais',
    description: 'Lavatório com massagem no couro cabeludo e máscara nutritiva.',
    durationMin: 15,
    priceCents: 3000,
    image: 'lavagem',
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
const weekday = [{ start: '09:00', end: '20:00' }];
const saturday = [{ start: '09:00', end: '18:00' }];

// DEMO: replace names, roles and schedules with the real team. Schedules must fall within site.hours.
export const team: Professional[] = [
  {
    id: 'lucas',
    name: 'Lucas', // DEMO
    role: 'Barbeiro sênior',
    specialties: ['Degradê', 'Visagismo', 'Navalha'],
    serviceIds: allServices,
    schedule: { 1: weekday, 2: weekday, 3: weekday, 4: weekday, 5: weekday, 6: saturday },
  },
  {
    id: 'mateus',
    name: 'Mateus', // DEMO
    role: 'Barbeiro',
    specialties: ['Tesoura', 'Corte social', 'Cabelo cacheado'],
    serviceIds: ['corte-assinatura', 'classico', 'fade', 'corte-barba', 'barba-ritual', 'hidratacao', 'experience'],
    schedule: { 2: weekday, 3: weekday, 4: weekday, 5: weekday, 6: saturday },
  },
  {
    id: 'gabriel',
    name: 'Gabriel', // DEMO
    role: 'Barbeiro',
    specialties: ['Barba', 'Toalha quente', 'Sobrancelha'],
    serviceIds: ['barba-ritual', 'corte-barba', 'corte-assinatura', 'sobrancelha', 'hidratacao', 'experience'],
    schedule: { 1: weekday, 3: weekday, 4: weekday, 5: weekday, 6: saturday },
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const proById = (id: string) => team.find((p) => p.id === id);

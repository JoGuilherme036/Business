// Product catalog of the Business line. DEMO: names, sizes and prices are placeholders to be
// confirmed by the owner. Photos are crops of the shelf photo (see scripts/build-assets.py);
// replace `image` with the id of a real product photo when available.

export type ProductCategory = 'cabelo' | 'barba' | 'acessorios' | 'kits';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  size: string;
  priceCents: number;
  image: string; // media id from src/data/media.json
  focal?: string;
  highlights: string[];
  usage: string;
  badge?: string;
  featured?: boolean;
  includes?: string[]; // product ids, for kits
};

export const productCategories: { id: ProductCategory | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'cabelo', label: 'Cabelo' },
  { id: 'barba', label: 'Barba' },
  { id: 'acessorios', label: 'Acessórios' },
  { id: 'kits', label: 'Kits' },
];

export const products: Product[] = [
  {
    id: 'pomada-matte',
    name: 'Pomada Modeladora Matte',
    category: 'cabelo',
    tagline: 'Fixação forte, acabamento seco.',
    description: 'A mesma pomada usada na finalização dos atendimentos. Modela com precisão e mantém o penteado o dia todo, sem brilho e sem pesar.',
    size: '120 g',
    priceCents: 6900,
    image: 'produto-pomada',
    highlights: ['Fixação forte', 'Efeito matte natural', 'Remove com água'],
    usage: 'Aqueça uma pequena quantidade entre as mãos e aplique do fundo para a ponta, no cabelo seco ou levemente úmido.',
    badge: 'Mais pedido',
    featured: true,
  },
  {
    id: 'oleo-barba',
    name: 'Óleo para Barba',
    category: 'barba',
    tagline: 'Maciez, brilho discreto e fio alinhado.',
    description: 'Hidrata os fios e a pele por baixo da barba, reduz o frizz e deixa o fio mais fácil de modelar.',
    size: '30 ml',
    priceCents: 5900,
    image: 'produto-oleo',
    highlights: ['Hidratação profunda', 'Toque seco', 'Aroma amadeirado'],
    usage: 'Aplique 3 a 5 gotas nas palmas das mãos e distribua pela barba, da raiz para a ponta, com a barba limpa.',
    featured: true,
  },
  {
    id: 'shampoo',
    name: 'Shampoo Business',
    category: 'cabelo',
    tagline: 'Limpeza profunda sem ressecar.',
    description: 'Fórmula de uso diário que remove resíduos de pomada e oleosidade e preserva a hidratação natural do couro cabeludo.',
    size: '250 ml',
    priceCents: 4900,
    image: 'produto-shampoo',
    highlights: ['Uso diário', 'Remove resíduos de pomada', 'Couro cabeludo equilibrado'],
    usage: 'Massageie no cabelo molhado por 1 minuto e enxágue bem. Repita se necessário.',
    featured: true,
  },
  {
    id: 'spray-fixador',
    name: 'Spray Fixador',
    category: 'cabelo',
    tagline: 'Volume e fixação leve, sem pesar.',
    description: 'Dá textura e volume antes de secar e segura o penteado ao longo do dia com acabamento natural.',
    size: '150 ml',
    priceCents: 5900,
    image: 'produto-spray',
    highlights: ['Fixação leve a média', 'Volume e textura', 'Sem resíduo branco'],
    usage: 'Borrife a 20 cm no cabelo úmido ou seco e modele com os dedos ou com o secador.',
  },
  {
    id: 'pincel-barbear',
    name: 'Pincel de Barbear',
    category: 'acessorios',
    tagline: 'O ritual da toalha quente em casa.',
    description: 'Cerdas macias que levantam os fios e espalham a espuma de forma uniforme para um barbear mais próximo e confortável.',
    size: 'Cabo preto',
    priceCents: 8900,
    image: 'produto-pincel',
    highlights: ['Cerdas macias', 'Espuma mais cremosa', 'Cabo resistente'],
    usage: 'Molhe o pincel em água morna, faça espuma com o sabão e aplique em movimentos circulares.',
    featured: true,
  },
  {
    id: 'kit-cabelo',
    name: 'Kit Cabelo',
    category: 'kits',
    tagline: 'Shampoo + spray fixador para a rotina de casa.',
    description: 'Limpeza e finalização no mesmo kit: shampoo para remover resíduos e spray fixador para dar volume e segurar o penteado.',
    size: '2 itens',
    priceCents: 9900,
    image: 'produto-kit-cabelo',
    highlights: ['Economia no conjunto', 'Pronto para presente'],
    usage: 'Veja o modo de uso de cada item na página do produto.',
    includes: ['shampoo', 'spray-fixador'],
  },
  {
    id: 'kit-barba',
    name: 'Kit Barba',
    category: 'kits',
    tagline: 'Óleo, pincel e pomada para a rotina completa.',
    description: 'O essencial para cuidar da barba e do cabelo entre as visitas: óleo hidratante, pincel de barbear e pomada modeladora.',
    size: '2 itens',
    priceCents: 17900,
    image: 'produto-kit-barba',
    highlights: ['Economia no conjunto', 'Pronto para presente'],
    usage: 'Veja o modo de uso de cada item na página do produto.',
    includes: ['oleo-barba', 'pincel-barbear', 'pomada-matte'],
  },
  {
    id: 'kit-business',
    name: 'Kit Business',
    category: 'kits',
    tagline: 'Pomada, óleo, shampoo e spray da casa.',
    description: 'A seleção que usamos nos atendimentos, num só kit: pomada modeladora, óleo para barba, shampoo e spray fixador.',
    size: '3 itens',
    priceCents: 19900,
    image: 'produto-kit-business',
    highlights: ['Economia no conjunto', 'Pronto para presente'],
    usage: 'Veja o modo de uso de cada item na página do produto.',
    badge: 'Kit da casa',
    featured: true,
    includes: ['pomada-matte', 'oleo-barba', 'shampoo', 'spray-fixador'],
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);

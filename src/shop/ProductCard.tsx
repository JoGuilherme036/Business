import { motion } from 'framer-motion';
import type { Product } from '@/config/products';
import { formatPrice } from '@/lib/format';
import { SmartImage } from '@/components/ui/SmartImage';
import { Icon } from '@/components/ui/Icon';
import { qtyOf, useCart } from './cart';

const categoryLabel = { cabelo: 'Cabelo', barba: 'Barba', acessorios: 'Acessório', kits: 'Kit' } as const;

export function ProductCard({ product, onOpen, className = '', sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 80vw' }: { product: Product; onOpen: (p: Product) => void; className?: string; sizes?: string }) {
  const { items, add, setOpen } = useCart();
  const inBag = qtyOf(items, product.id);
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-lg glass transition-colors duration-500 hover:border-accent/40 ${className}`}>
      <button onClick={() => onOpen(product)} className="relative block text-left" aria-label={`Ver detalhes de ${product.name}`}>
        <SmartImage id={product.image} alt={product.name} sizes={sizes} ratio="4 / 5" focal={product.focal} imgClassName="transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.06]" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-[3px] bg-ivory px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink">{product.badge}</span>
        )}
        <span className="absolute right-3 top-3 rounded-[3px] border border-ivory/15 bg-ink/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/80 backdrop-blur-[2px]">
          {categoryLabel[product.category]}
        </span>
      </button>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-display text-[17px] font-semibold leading-tight tracking-[-0.02em] md:text-lg">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{product.tagline}</p>
        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold tabular-nums text-accent-light">{formatPrice(product.priceCents)}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{product.size}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              add(product.id);
              setOpen(true);
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-ivory/25 px-3.5 sm:w-auto text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-accent hover:bg-ivory hover:text-ink"
            aria-label={`Adicionar ${product.name} à sacola${inBag ? ` (já tem ${inBag})` : ''}`}
          >
            <Icon name={inBag ? 'check' : 'plus'} className="h-4 w-4" />
            {inBag ? `${inBag} na sacola` : 'Adicionar'}
          </motion.button>
        </div>
      </div>
    </article>
  );
}

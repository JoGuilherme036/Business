import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { productById, type Product } from '@/config/products';
import { formatPrice } from '@/lib/format';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { SmartImage } from '@/components/ui/SmartImage';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useCart } from './cart';

const ease = [0.16, 1, 0.3, 1] as const;

/** Product detail as a modal sheet: bottom sheet on phones, centered split view on desktop. */
export function ProductDialog({ product, onClose, onOpenProduct }: { product: Product | null; onClose: () => void; onOpenProduct: (p: Product) => void }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setQty(1), [product?.id]);

  useEffect(() => {
    if (!product) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default bg-black/80" tabIndex={-1} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-2 md:max-h-[86vh] md:grid-cols-2 md:rounded-xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="relative md:sticky md:top-0 md:self-start">
              <SmartImage id={product.image} alt={product.name} sizes="(min-width: 768px) 40vw, 100vw" ratio="4 / 5" focal={product.focal} className="max-h-[46svh] w-full md:max-h-none" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-2/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink-2/40" />
            </div>

            <div className="relative flex flex-col p-6 md:p-10">
              <button ref={closeRef} onClick={onClose} aria-label="Fechar detalhes" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-ink/70">
                <Icon name="close" className="h-5 w-5" />
              </button>
              <p className="eyebrow">{product.size} · Linha Business</p>
              <h2 className="display mt-3 pr-12 text-3xl md:text-4xl">{product.name}</h2>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-accent-light">{formatPrice(product.priceCents)}</p>
              <p className="mt-5 text-[15px] leading-relaxed text-ivory/80">{product.description}</p>

              <ul className="mt-6 grid gap-2.5" aria-label="Destaques">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[14px]">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-accent" />
                    {h}
                  </li>
                ))}
              </ul>

              {product.includes && (
                <div className="mt-6 border-t hairline pt-5">
                  <p className="eyebrow">Neste kit</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.includes.map((id) => {
                      const p = productById(id);
                      return p ? (
                        <li key={id}>
                          <button onClick={() => onOpenProduct(p)} className="rounded-full border hairline px-3.5 py-2 text-[12.5px] hover:border-accent/60">
                            {p.name}
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              <div className="mt-6 border-t hairline pt-5">
                <p className="eyebrow">Modo de uso</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{product.usage}</p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-[3px] border border-white/20" role="group" aria-label="Quantidade">
                  <button className="grid h-12 w-12 place-items-center disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Diminuir">
                    <Icon name="minus" className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{qty}</span>
                  <button className="grid h-12 w-12 place-items-center" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar">
                    <Icon name="plus" className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  className="min-w-0 flex-1"
                  icon="bag"
                  onClick={() => {
                    add(product.id, qty);
                    onClose();
                    setOpen(true);
                  }}
                >
                  Adicionar · {formatPrice(product.priceCents * qty)}
                </Button>
              </div>
              <a
                href={whatsappLink(waMessages.product(product.name))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { from: 'product', product: product.id })}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-accent-light"
              >
                <Icon name="whatsapp" className="h-4 w-4" /> Perguntar sobre disponibilidade
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

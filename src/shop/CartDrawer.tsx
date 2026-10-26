import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { formatPrice } from '@/lib/format';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { SmartImage } from '@/components/ui/SmartImage';
import { Icon } from '@/components/ui/Icon';
import { ExternalButton, LinkButton } from '@/components/ui/Button';
import { useCart } from './cart';

const ease = [0.16, 1, 0.3, 1] as const;

/** Product bag. Checkout is a WhatsApp message with the list; payment and pickup happen at the shop. */
export function CartDrawer() {
  const { items, count, totalCents, open, setOpen, setQty, clear } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[55]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button aria-label="Fechar sacola" onClick={close} className="absolute inset-0 cursor-default bg-black/70" tabIndex={-1} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sacola de produtos"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-ivory/10 bg-ink"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="flex items-center justify-between border-b hairline px-5 py-4 pt-[max(env(safe-area-inset-top),16px)]">
              <div>
                <p className="eyebrow">Sacola</p>
                <p className="mt-1 text-[13px] text-muted">{count ? `${count} ${count === 1 ? 'item' : 'itens'}` : 'Vazia'}</p>
              </div>
              <button ref={closeRef} onClick={close} aria-label="Fechar sacola" className="grid h-11 w-11 place-items-center rounded-full border hairline">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <Icon name="bag" className="h-10 w-10 text-accent" strokeWidth={1.2} />
                <p className="display mt-5 text-2xl">Sua sacola está vazia</p>
                <p className="mt-2 max-w-xs text-sm text-muted">Escolha produtos da linha Business e reserve para retirar na barbearia.</p>
                <LinkButton to="/produtos" className="mt-7" onClick={close}>
                  Ver produtos
                </LinkButton>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ivory/10 overflow-y-auto px-5">
                  {items.map(({ product, qty }) => (
                    <li key={product.id} className="flex gap-4 py-5">
                      <SmartImage id={product.image} alt="" sizes="96px" ratio="4 / 5" focal={product.focal} className="w-20 shrink-0 rounded-md" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="font-display text-[15px] font-semibold leading-tight">{product.name}</p>
                        <p className="mt-1 text-[12px] text-muted">{product.size}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-[3px] border border-ivory/20" role="group" aria-label={`Quantidade de ${product.name}`}>
                            <button className="grid h-10 w-10 place-items-center" onClick={() => setQty(product.id, qty - 1)} aria-label={qty === 1 ? `Remover ${product.name}` : 'Diminuir'}>
                              <Icon name={qty === 1 ? 'close' : 'minus'} className="h-4 w-4" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{qty}</span>
                            <button className="grid h-10 w-10 place-items-center" onClick={() => setQty(product.id, qty + 1)} aria-label="Aumentar">
                              <Icon name="plus" className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="font-display text-base font-semibold tabular-nums text-accent-light">{formatPrice(product.priceCents * qty)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t hairline px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] uppercase tracking-[0.16em] text-muted">Total</span>
                    <span className="font-display text-3xl font-semibold tabular-nums">{formatPrice(totalCents)}</span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">Reserve pelo WhatsApp e retire na {site.name}. O pagamento é feito na retirada.</p>
                  <ExternalButton
                    href={whatsappLink(waMessages.order(items.map((l) => ({ name: l.product.name, qty: l.qty, priceCents: l.product.priceCents })), totalCents))}
                    icon="whatsapp"
                    size="lg"
                    className="mt-4 w-full"
                    onClick={() => track('whatsapp_click', { from: 'cart', items: count })}
                  >
                    Reservar pelo WhatsApp
                  </ExternalButton>
                  <div className="mt-3 flex items-center justify-between text-[12.5px]">
                    <Link to="/agendar" onClick={close} className="inline-flex min-h-11 items-center gap-1.5 text-accent-light">
                      <Icon name="calendar" className="h-4 w-4" /> Agendar um horário também
                    </Link>
                    <button onClick={clear} className="min-h-11 text-muted underline underline-offset-4 hover:text-ivory">
                      Esvaziar
                    </button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

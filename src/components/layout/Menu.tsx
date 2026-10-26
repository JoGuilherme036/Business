import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { site } from '@/config/site';
import { useOpenStatus } from '@/hooks/useMisc';
import { statusLabel } from '@/lib/hours';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { Icon } from '../ui/Icon';
import { LinkButton } from '../ui/Button';
import { navLinks } from './nav';
import { asset } from '@/lib/asset';

const ease = [0.16, 1, 0.3, 1] as const;

export function Menu({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const status = statusLabel(useOpenStatus());
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <img src={asset('media/poster-portrait.webp')} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
          </div>

          <div className="container-x relative flex h-16 items-center justify-between pt-[env(safe-area-inset-top)]">
            <span className="eyebrow">Menu</span>
            <button ref={closeRef} onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full border hairline" aria-label="Fechar menu">
              <Icon name="close" />
            </button>
          </div>

          <nav aria-label="Seções" className="container-x relative mt-6 flex-1">
            <ul className="space-y-1">
              {navLinks.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease }}>
                  <button onClick={() => onNavigate(l.id)} className="group flex w-full items-baseline gap-5 border-b hairline py-4 text-left">
                    <span className="w-8 font-display text-sm italic text-brass">{l.numeral}</span>
                    <span className="display text-[2.6rem] transition-transform duration-500 ease-expo group-hover:translate-x-2">{l.label}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="container-x relative space-y-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${status.short === 'Aberto agora' ? 'bg-emerald-400' : 'bg-muted'}`} />
              {status.short} · {status.detail}
            </p>
            <LinkButton to="/agendar" size="lg" iconRight="arrowRight" className="w-full" onClick={onClose}>
              Agendar horário
            </LinkButton>
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <a href={whatsappLink(waMessages.general())} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { from: 'menu' })} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border hairline">
                <Icon name="whatsapp" /> WhatsApp
              </a>
              <a href={`tel:${site.contact.phoneHref}`} onClick={() => track('call_click', { from: 'menu' })} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border hairline">
                <Icon name="phone" /> Ligar
              </a>
              <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border hairline">
                <Icon name="instagram" /> Instagram
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

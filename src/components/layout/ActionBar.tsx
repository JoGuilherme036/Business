import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { site } from '@/config/site';
import { summarize } from '@/booking/availability';
import { useDraft } from '@/booking/draft';
import { formatPrice } from '@/lib/format';
import { routeLink } from '@/lib/maps';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { Icon, type IconName } from '../ui/Icon';

/** Thumb-zone action bar (mobile). Hidden on the hero (it has its own CTAs), during booking and in 3D. */
export function ActionBar() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(pathname !== '/');
  const hiddenRoute = pathname.startsWith('/agendar') || pathname.startsWith('/admin');
  const { draft } = useDraft();
  const order = summarize(draft.serviceIds);

  useEffect(() => {
    if (pathname !== '/') return setVisible(true);
    const on = () => setVisible(window.scrollY > window.innerHeight * 0.4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);

  // Keyboard open on mobile -> hide so it never covers a focused field.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => document.documentElement.classList.toggle('kb-open', vv.height < window.innerHeight * 0.75);
    vv.addEventListener('resize', on);
    return () => vv.removeEventListener('resize', on);
  }, []);

  const show = visible && !hiddenRoute;

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          aria-label="Ações rápidas"
          className="action-bar fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),12px)] z-40 md:hidden"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        >
          <div className="flex items-center gap-1.5 rounded-full border hairline bg-ink/95 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)]">
            <Link
              to={order.services.length ? '/agendar?de=comanda' : '/agendar'}
              onClick={() => track('cta_book_click', { from: 'action_bar' })}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-brass px-4 text-[14px] font-semibold text-ink active:scale-[0.97]"
            >
              <Icon name="calendar" className="h-[18px] w-[18px] shrink-0" />
              <span>Agendar</span>
              {order.services.length > 0 && (
                <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold tabular-nums text-brass-light" aria-label={`${order.services.length} serviços, ${formatPrice(order.priceCents)}`}>
                  {order.services.length}
                </span>
              )}
            </Link>
            <Action href={whatsappLink(waMessages.general())} icon="whatsapp" label="WhatsApp" onClick={() => track('whatsapp_click', { from: 'action_bar' })} />
            <Action href={routeLink()} icon="route" label="Rota" onClick={() => track('route_click', { from: 'action_bar' })} />
            <Action href={`tel:${site.contact.phoneHref}`} icon="phone" label="Ligar" onClick={() => track('call_click', { from: 'action_bar' })} />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

function Action({ href, icon, label, onClick }: { href: string; icon: IconName; label: string; onClick: () => void }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-14 flex-col items-center justify-center gap-0.5 rounded-full text-ivory/85 active:scale-95 active:bg-ivory/5"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <Icon name={icon} className="h-[19px] w-[19px]" />
      <span className="text-[9.5px] font-medium tracking-wide">{label}</span>
    </a>
  );
}

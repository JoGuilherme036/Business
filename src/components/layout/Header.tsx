import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { site } from '@/config/site';
import { useMotionPref } from '@/hooks/useMotionPref';
import { useOpenStatus, useScrolledPast } from '@/hooks/useMisc';
import { statusLabel } from '@/lib/hours';
import { track } from '@/lib/analytics';
import { Icon } from '../ui/Icon';
import { Monogram } from '../ui/Monogram';
import { LinkButton } from '../ui/Button';
import { Menu } from './Menu';
import { navLinks, scrollToSection } from './nav';

export function Header() {
  const scrolled = useScrolledPast(24);
  const [open, setOpen] = useState(false);
  const { reduced } = useMotionPref();
  const status = statusLabel(useOpenStatus());
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (id: string) => {
    setOpen(false);
    if (pathname !== '/' || !scrollToSection(id, reduced)) navigate(`/#${id}`);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-500 ${
          scrolled ? 'border-b hairline bg-ink/92' : 'border-b border-transparent'
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="flex items-center gap-3" aria-label={`${site.name}, página inicial`}>
            <Monogram className="h-10 w-10 md:h-11 md:w-11" />
            <span className="hidden flex-col leading-none xs:flex">
              <span className="font-display text-lg italic tracking-tight">{site.name}</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">{site.concept.split(' ')[0]} noturno</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="rounded-full px-4 py-2 text-[13px] font-medium text-ivory/75 transition-colors hover:text-ivory">
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-[12px] text-muted md:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${status.short === 'Aberto agora' ? 'bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153)]' : 'bg-muted'}`} />
              {status.short}
            </span>
            <LinkButton to="/agendar" className="hidden !min-h-11 md:inline-flex" onClick={() => track('cta_book_click', { from: 'header' })}>
              Agendar
            </LinkButton>
            <button
              onClick={() => setOpen(true)}
              className="grid h-12 w-12 place-items-center rounded-full border hairline bg-ink/40 text-ivory transition-colors hover:border-brass/60 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} onNavigate={go} />
    </>
  );
}

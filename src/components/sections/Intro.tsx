import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotionPref } from '@/hooks/useMotionPref';
import { useOpenStatus } from '@/hooks/useMisc';
import { hoursSummary, statusLabel } from '@/lib/hours';
import { site } from '@/config/site';
import { routeLink } from '@/lib/maps';
import { asset } from '@/lib/asset';
import { track } from '@/lib/analytics';
import { relativeDayName } from '@/lib/time';
import { cachedBusy } from '@/booking/busyCache';
import { bookableDays, slotsFor } from '@/booking/availability';
import { useScheduleVersion } from '@/booking/sync';
import { ScrollFilm } from '../background/ScrollFilm';
import { LinkButton, Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { scrollToSection } from '../layout/nav';

const ease = [0.16, 1, 0.3, 1] as const;
const QUICK_SERVICE = 'corte-assinatura';

/** First free start time for the signature cut, so the opening screen can offer a one-tap booking. */
function useNextSlot() {
  const [next, setNext] = useState<{ day: string; time: string } | null>(null);
  const { tick } = useScheduleVersion({ fallbackMs: 30_000 });
  useEffect(() => {
    let alive = true;
    (async () => {
      const now = new Date();
      for (const d of bookableDays([QUICK_SERVICE], 'any', now).filter((x) => x.works).slice(0, 7)) {
        const slot = slotsFor([QUICK_SERVICE], 'any', d.day, await cachedBusy(d.day), now)[0];
        if (slot) return alive && setNext({ day: d.day, time: slot.time });
      }
      if (alive) setNext(null);
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [tick]);
  return next;
}

// Mobile: 360svh tall with a 50svh overlap from the agenda → it starts covering at 210/260 ≈ 0.81.
// Desktop: 380vh with 60vh overlap → 220/280 ≈ 0.79. The film plays in the first 60% of the scroll,
// then the finished logo holds while the hero content appears below it.
const FILM_END = 0.6;
const HERO_IN = [0.55, 0.63];

/**
 * Pinned opening: the clipper animation is scrubbed frame by frame by this section's scroll. It
 * comes apart and its parts assemble the BUSINESS logo; the headline and actions then appear under
 * the logo. A corporate info bar (status, next slot, address, hours) stays at the bottom throughout.
 */
export function Intro() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPref();
  const status = useOpenStatus();
  const label = statusLabel(status);
  const next = useNextSlot();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const film = useTransform(p, [0, FILM_END], [0, 1]);
  const cueOpacity = useTransform(p, [0, 0.04], [1, 0]);
  const heroOpacity = useTransform(p, HERO_IN, [0, 1]);
  const heroY = useTransform(p, HERO_IN, [30, 0]);
  const heroEvents = useTransform(heroOpacity, (v) => (v < 0.5 ? 'none' : 'auto'));
  const skipOpacity = useTransform(p, [0, 0.45, 0.52], [1, 1, 0]);

  const fade = (delay: number) => ({ initial: { opacity: 0, y: reduced ? 0 : 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease } });
  const skip = () => {
    const el = ref.current;
    if (!el) return;
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * HERO_IN[1];
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };
  const hours = hoursSummary();

  return (
    <section ref={ref} aria-labelledby="hero-title" className={reduced ? 'relative' : 'relative h-[360svh] md:h-[380vh]'}>
      <div className={`${reduced ? 'relative' : 'sticky top-0'} h-[100svh] min-h-[640px] overflow-hidden bg-ink`}>
        {reduced ? (
          <picture aria-hidden="true">
            <source media="(min-aspect-ratio: 1/1)" srcSet={asset('media/end-landscape.webp')} />
            <img src={asset('media/end-portrait.webp')} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
        ) : (
          <ScrollFilm progress={film} />
        )}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/90 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

        {/* Opening cue, before the animation starts. */}
        {!reduced && (
          <motion.div style={{ opacity: cueOpacity }} className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+9.5rem)] md:top-32">
            <div className="container-x flex flex-col items-center text-center">
              <motion.p {...fade(0.2)} className="text-[10.5px] font-semibold uppercase tracking-[0.36em] text-ivory/70">{site.concept}</motion.p>
              <motion.p {...fade(0.35)} className="mt-3 text-[12.5px] text-ivory/55">{site.address.city} · {site.address.state}</motion.p>
            </div>
          </motion.div>
        )}
        {!reduced && (
          <motion.div style={{ opacity: cueOpacity }} className="container-x pointer-events-none absolute inset-x-0 bottom-36 flex flex-col items-center gap-3 md:bottom-40 md:items-start">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-ivory/70">Role para descobrir</span>
            <span className="relative h-12 w-px overflow-hidden bg-ivory/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_ease-in-out_infinite] bg-ivory" />
            </span>
          </motion.div>
        )}

        {!reduced && (
          <>
            <Caption progress={p} range={[0.1, 0.15, 0.24, 0.29]} chapter="01" label="A máquina" text="Cada peça no seu lugar." />
            <Caption progress={p} range={[0.31, 0.36, 0.45, 0.5]} chapter="02" label="A marca" text="Precisão que vira identidade." />
          </>
        )}

        {/* Hero content: appears under the finished logo. */}
        <motion.div
          className="absolute inset-x-0 top-[calc(50%+3.2rem)] md:top-[calc(50%+5.5rem)]"
          style={reduced ? undefined : { opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}
        >
          <div className="container-x flex flex-col items-center text-center">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.36em] text-ivory/70 md:text-[10.5px]">
              <span className="h-px w-8 bg-ivory/50" />
              {site.concept}
              <span className="h-px w-8 bg-ivory/50" />
            </p>
            <h1 id="hero-title" className="display mt-4 max-w-[22ch] text-[clamp(1.35rem,5.6vw,2.6rem)] uppercase leading-[1.05]" style={{ fontStretch: '125%' }}>
              Imagem masculina <span className="outline-text">em outro nível.</span>
            </h1>
            <div className="mt-6 flex w-full max-w-md gap-2.5 sm:w-auto sm:max-w-none sm:gap-3">
              <LinkButton to="/agendar" size="lg" iconRight="arrowRight" className="flex-1 !px-5 sm:flex-none sm:!px-8" onClick={() => track('cta_book_click', { from: 'hero' })}>
                Agendar horário
              </LinkButton>
              <Button variant="ghost" size="lg" className="!bg-ink/40 !px-5 sm:!px-8" onClick={() => scrollToSection('servicos', reduced)}>
                <span className="sm:hidden">Serviços</span>
                <span className="hidden sm:inline">Serviços e preços</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Corporate info bar: status, next free slot, address and hours at a glance. */}
        <div className="absolute inset-x-0 bottom-0">
          <motion.dl {...fade(0.5)} className="container-x grid grid-cols-2 pb-[max(env(safe-area-inset-bottom),16px)] md:grid-cols-4 md:pb-6">
            <InfoCell label="Agora" className="border-t border-ivory/15">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.open ? 'bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153)]' : 'bg-muted'}`} />
                {label.short}
              </span>
              <span className="text-ivory/50">{label.detail}</span>
            </InfoCell>
            <InfoCell label="Próximo horário" className="border-l border-t border-ivory/15">
              {next ? (
                <Link
                  to={`/agendar?servico=${QUICK_SERVICE}&dia=${next.day}&hora=${next.time}`}
                  onClick={() => track('cta_book_click', { from: 'hero_next_slot' })}
                  className="group inline-flex items-center gap-1.5 underline decoration-ivory/30 underline-offset-4 hover:decoration-ivory"
                >
                  {relativeDayName(next.day)} às {next.time}
                  <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-ivory/50">Consultando agenda…</span>
              )}
            </InfoCell>
            <InfoCell label="Endereço" className="hidden border-l border-t border-ivory/15 md:block">
              <a href={routeLink()} target="_blank" rel="noopener noreferrer" onClick={() => track('route_click', { from: 'hero' })} className="hover:underline">
                {site.address.street}
              </a>
              <span className="text-ivory/50">{site.address.city}/{site.address.state}</span>
            </InfoCell>
            <InfoCell label="Horários" className="hidden border-l border-t border-ivory/15 md:block">
              {hours.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </InfoCell>
          </motion.dl>
        </div>

        {!reduced && (
          <motion.button
            onClick={skip}
            style={{ opacity: skipOpacity }}
            className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[calc(env(safe-area-inset-top)+5rem)] inline-flex min-h-11 items-center gap-2 rounded-[3px] border border-ivory/20 bg-ink/50 px-4 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ivory/80 hover:text-ivory md:right-12 md:top-[calc(env(safe-area-inset-top)+6.5rem)]"
          >
            Pular animação <Icon name="arrowDown" className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </section>
  );
}

function InfoCell({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 py-4 pr-3 first:pl-0 md:py-6 [&:not(:first-child)]:pl-4 md:[&:not(:first-child)]:pl-6 ${className}`}>
      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.3em] text-ivory/45">{label}</dt>
      <dd className="mt-2 flex flex-col gap-0.5 text-[13px] leading-snug text-ivory">{children}</dd>
    </div>
  );
}

function Caption({ progress, range, chapter, label, text }: { progress: MotionValue<number>; range: number[]; chapter: string; label: string; text: string }) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[1]], [28, 0]);
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-36 md:bottom-40">
      <div className="container-x">
        <p className="eyebrow flex items-center gap-3">
          <span className="font-display text-[11px] font-bold tracking-[0.2em] text-ivory">{chapter}</span>
          <span className="h-px w-10 bg-ivory/40" />
          {label}
        </p>
        <p className="display mt-4 max-w-3xl text-[clamp(1.7rem,6vw,4rem)] [text-shadow:0_4px_40px_rgb(0_0_0/0.8)]">{text}</p>
      </div>
    </motion.div>
  );
}

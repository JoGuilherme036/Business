import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotionPref } from '@/hooks/useMotionPref';
import { useOpenStatus } from '@/hooks/useMisc';
import { hoursSummary, statusLabel } from '@/lib/hours';
import { site } from '@/config/site';
import { routeLink } from '@/lib/maps';
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

// Section scroll fraction where the film ends and the next section starts covering it.
// Mobile: 250svh tall, 50svh overlap → 100/150. Desktop: 270vh, 60vh overlap → 110/170.
const FILM_END = 0.65;

/**
 * Pinned opening: the film plays only here, driven by this section's scroll.
 * The headline sits on a dedicated scrim so it stays readable over any frame; it hands over
 * to two short captions, then the frame fades to ink and the page continues on solid ground.
 */
export function Intro() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPref();
  const status = useOpenStatus();
  const label = statusLabel(status);
  const next = useNextSlot();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // The next section overlaps the end of this one (negative margin in LiveBoard) and slides over
  // the last frame at FILM_END, so there is no dead scroll between the film and the content.
  const film = useTransform(p, [0, FILM_END], [0, 1]);
  const dim = useTransform(p, [0, 0.05, 0.16, FILM_END, 1], [0.42, 0.42, 0.08, 0.12, 0.5]);
  const heroOpacity = useTransform(p, [0, 0.05, 0.14], [1, 1, 0]);
  const heroY = useTransform(p, [0, 0.14], [0, -70]);
  const heroEvents = useTransform(heroOpacity, (v) => (v < 0.2 ? 'none' : 'auto'));
  const skipOpacity = useTransform(p, [0, FILM_END - 0.12, FILM_END - 0.05], [1, 1, 0]);

  const line = (delay: number) => ({ initial: { y: '110%' }, animate: { y: '0%' }, transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease } });
  const fade = (delay: number) => ({ initial: { opacity: 0, y: reduced ? 0 : 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease } });
  const skip = () => document.getElementById('agenda')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  const hours = hoursSummary();

  return (
    <section ref={ref} aria-labelledby="hero-title" className={reduced ? 'relative' : 'relative h-[250svh] md:h-[270vh]'}>
      <div className={`${reduced ? 'relative' : 'sticky top-0'} h-[100svh] min-h-[640px] overflow-hidden`}>
        <ScrollFilm progress={film} />

        {/* Light shaping. The text scrim only exists while the headline is on screen. */}
        <motion.div aria-hidden="true" className="absolute inset-0 bg-ink" style={{ opacity: reduced ? 0.45 : dim }} />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: reduced ? 1 : heroOpacity }}>
          <div className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-ink via-ink/90 to-transparent md:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[78%] bg-gradient-to-r from-ink via-ink/85 to-transparent md:block" />
          <div className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-ink to-transparent md:block" />
        </motion.div>

        <motion.div
          className="container-x relative flex h-full flex-col pt-24 md:pt-28"
          style={reduced ? undefined : { opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}
        >
          <div className="flex flex-1 flex-col justify-end pb-8 md:justify-center md:pb-0">
            <motion.p {...fade(0.1)} className="flex items-center gap-4 text-[10.5px] font-semibold uppercase tracking-[0.36em] text-ivory/70 short:text-[9.5px]">
              <span className="h-px w-10 bg-ivory/60" />
              {site.concept}
            </motion.p>

            <h1 id="hero-title" className="display mt-6 max-w-[15ch] text-[clamp(2.2rem,9.6vw,5.6rem)] uppercase leading-[0.98] tracking-[-0.03em] short:mt-4 short:text-[clamp(1.8rem,7.4vw,3.6rem)]" style={{ fontStretch: '125%' }}>
              <span className="block overflow-hidden pb-[0.04em]"><motion.span className="block font-black" {...line(0.15)}>Imagem</motion.span></span>
              <span className="block overflow-hidden pb-[0.04em]"><motion.span className="block font-black" {...line(0.25)}>masculina</motion.span></span>
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span className="outline-text block font-extrabold" {...line(0.35)}>em outro nível.</motion.span>
              </span>
            </h1>

            <motion.p {...fade(0.55)} className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/75 short:mt-4 short:text-[14px] sm:text-base tiny:hidden">
              Corte, barba e cuidado completo para quem leva a própria imagem a sério. Hora marcada, ambiente exclusivo e atendimento sem pressa.
            </motion.p>

            <motion.div {...fade(0.65)} className="mt-8 flex gap-2.5 short:mt-5 sm:gap-3">
              <LinkButton to="/agendar" size="lg" iconRight="arrowRight" className="flex-1 !px-5 sm:flex-none sm:!px-8" onClick={() => track('cta_book_click', { from: 'hero' })}>
                Agendar horário
              </LinkButton>
              <Button variant="ghost" size="lg" className="!bg-ink/40 !px-5 sm:!px-8" onClick={() => scrollToSection('servicos', reduced)}>
                <span className="sm:hidden">Serviços</span>
                <span className="hidden sm:inline">Serviços e preços</span>
              </Button>
            </motion.div>
          </div>

          {/* Corporate info bar: status, next free slot, address and hours at a glance. */}
          <motion.dl {...fade(0.8)} className="grid grid-cols-2 border-t border-white/15 pb-[max(env(safe-area-inset-bottom),20px)] md:grid-cols-4 md:pb-8">
            <InfoCell label="Agora">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.open ? 'bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153)]' : 'bg-muted'}`} />
                {label.short}
              </span>
              <span className="text-ivory/50">{label.detail}</span>
            </InfoCell>
            <InfoCell label="Próximo horário" className="border-l border-white/15 md:border-l">
              {next ? (
                <Link
                  to={`/agendar?servico=${QUICK_SERVICE}&dia=${next.day}&hora=${next.time}`}
                  onClick={() => track('cta_book_click', { from: 'hero_next_slot' })}
                  className="group inline-flex items-center gap-1.5 underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  {relativeDayName(next.day)} às {next.time}
                  <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-ivory/50">Consultando agenda…</span>
              )}
            </InfoCell>
            <InfoCell label="Endereço" className="hidden border-l border-white/15 md:block">
              <a href={routeLink()} target="_blank" rel="noopener noreferrer" onClick={() => track('route_click', { from: 'hero' })} className="hover:underline">
                {site.address.street}
              </a>
              <span className="text-ivory/50">{site.address.city}/{site.address.state}</span>
            </InfoCell>
            <InfoCell label="Horários" className="hidden border-l border-white/15 md:block">
              {hours.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </InfoCell>
          </motion.dl>
        </motion.div>

        {!reduced && (
          <>
            <Caption progress={p} range={[0.17, 0.23, 0.33, 0.39]} chapter="02" label="A cadeira" text="Cada detalhe da sua imagem, no seu tempo." />
            <Caption progress={p} range={[0.43, 0.49, 0.57, 0.63]} chapter="03" label="A bancada" text="Técnica, ferramentas e produtos de verdade." />
            <motion.button
              onClick={skip}
              style={{ opacity: skipOpacity }}
              className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[calc(env(safe-area-inset-top)+5rem)] inline-flex min-h-11 items-center gap-2 rounded-[3px] border border-white/20 bg-ink/50 px-4 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ivory/80 hover:text-ivory md:top-[calc(env(safe-area-inset-top)+6.5rem)] md:right-12"
            >
              Pular introdução <Icon name="arrowDown" className="h-4 w-4" />
            </motion.button>
          </>
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
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-32 md:bottom-24">
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

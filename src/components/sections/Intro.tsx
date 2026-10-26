import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotionPref } from '@/hooks/useMotionPref';
import { useOpenStatus } from '@/hooks/useMisc';
import { statusLabel } from '@/lib/hours';
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

// Where each chapter starts on the film (0–1), matching the camera path of the video.
const chapters = [
  { n: 'I', label: 'A chegada', at: 0 },
  { n: 'II', label: 'A cadeira', at: 0.36 },
  { n: 'III', label: 'A bancada', at: 0.72 },
];

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
  const dim = useTransform(p, [0, 0.05, 0.16, FILM_END, 1], [0.38, 0.38, 0.06, 0.1, 0.5]);
  const heroOpacity = useTransform(p, [0, 0.05, 0.14], [1, 1, 0]);
  const heroY = useTransform(p, [0, 0.14], [0, -70]);
  const heroEvents = useTransform(heroOpacity, (v) => (v < 0.2 ? 'none' : 'auto'));
  const skipOpacity = useTransform(p, [0, FILM_END - 0.12, FILM_END - 0.05], [1, 1, 0]);

  const line = (delay: number) => ({ initial: { y: '110%' }, animate: { y: '0%' }, transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease } });
  const fade = (delay: number) => ({ initial: { opacity: 0, y: reduced ? 0 : 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease } });
  const skip = () => document.getElementById('agenda')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  return (
    <section ref={ref} aria-labelledby="hero-title" className={reduced ? 'relative' : 'relative h-[250svh] md:h-[270vh]'}>
      <div className={`${reduced ? 'relative' : 'sticky top-0'} h-[100svh] min-h-[620px] overflow-hidden`}>
        <ScrollFilm progress={film} />

        {/* Light shaping. The text scrim only exists while the headline is on screen. */}
        <motion.div aria-hidden="true" className="absolute inset-0 bg-ink" style={{ opacity: reduced ? 0.38 : dim }} />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/85 to-transparent" />
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: reduced ? 1 : heroOpacity }}>
          <div className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-ink via-ink/85 to-transparent md:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[72%] bg-gradient-to-r from-ink via-ink/80 to-transparent md:block" />
        </motion.div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 to-transparent" />

        <motion.div
          className="container-x relative flex h-full flex-col justify-end pb-8 pt-24 short:pb-6 md:justify-center md:pb-16"
          style={reduced ? undefined : { opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}
        >
          <motion.p {...fade(0.1)} className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border hairline bg-ink/70 px-3.5 py-2 text-[12px] short:mb-4">
            <span className="relative flex h-2 w-2">
              {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${status.open ? 'bg-emerald-400' : 'bg-muted'}`} />
            </span>
            <span className="font-semibold">{label.short}</span>
            <span className="text-ivory/70">· {label.detail}</span>
          </motion.p>

          <h1 id="hero-title" className="display text-[clamp(3.3rem,15.5vw,9.5rem)] [text-shadow:0_4px_40px_rgb(0_0_0/0.55)] short:text-[clamp(2.8rem,13vw,5.5rem)] tiny:text-[clamp(2.4rem,11.5vw,4rem)]">
            <span className="block overflow-hidden pb-[0.06em]"><motion.span className="block" {...line(0.15)}>Precisão</motion.span></span>
            <span className="block overflow-hidden pb-[0.06em]"><motion.span className="block" {...line(0.25)}>sob luz</motion.span></span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span className="brass-text block italic" {...line(0.35)}>âmbar.</motion.span>
            </span>
          </h1>

          <motion.p {...fade(0.55)} className="mt-5 max-w-md text-[15.5px] leading-relaxed text-ivory short:mt-3 short:text-[14.5px] sm:text-base tiny:hidden">
            Corte, barba e ritual de toalha quente num ateliê feito para a noite da cidade. Hora marcada, sem fila, sem pressa.
          </motion.p>

          <motion.div {...fade(0.65)} className="mt-7 flex gap-2.5 short:mt-5 sm:gap-3">
            <LinkButton to="/agendar" size="lg" iconRight="arrowRight" className="flex-1 !px-5 sm:flex-none sm:!px-7" onClick={() => track('cta_book_click', { from: 'hero' })}>
              Agendar horário
            </LinkButton>
            <Button variant="ghost" size="lg" className="!bg-ink/60 !px-5 sm:!px-7" onClick={() => scrollToSection('servicos', reduced)}>
              <span className="sm:hidden">Serviços</span>
              <span className="hidden sm:inline">Ver serviços e preços</span>
            </Button>
          </motion.div>

          {next && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <Link
                to={`/agendar?servico=${QUICK_SERVICE}&dia=${next.day}&hora=${next.time}`}
                onClick={() => track('cta_book_click', { from: 'hero_next_slot' })}
                className="group mt-4 inline-flex min-h-11 flex-wrap items-center gap-x-2.5 text-[13.5px] text-ivory/85 short:mt-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brass" />
                </span>
                <span className="tiny:hidden">Próximo horário livre:</span>
                <span className="hidden tiny:inline">Livre</span>
                <span className="font-semibold text-brass-light underline decoration-brass/40 underline-offset-4 group-hover:decoration-brass">
                  {relativeDayName(next.day).toLowerCase()} às {next.time}
                </span>
                <Icon name="arrowRight" className="h-4 w-4 text-brass transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {!reduced && (
          <>
            <Caption progress={p} range={[0.17, 0.23, 0.33, 0.39]} chapter="II" label="A cadeira" text="Toda noite começa com uma cadeira vazia." />
            <Caption progress={p} range={[0.43, 0.49, 0.57, 0.63]} chapter="III" label="A bancada" text="Ferramentas afiadas, tempo de sobra." />
            <ChapterRail progress={film} />
            <motion.button
              onClick={skip}
              style={{ opacity: skipOpacity }}
              className="absolute right-4 top-[calc(env(safe-area-inset-top)+5rem)] inline-flex min-h-11 items-center gap-2 rounded-full border hairline bg-ink/60 px-4 text-[12px] font-semibold text-ivory/85 hover:text-ivory md:bottom-10 md:right-12 md:top-auto"
            >
              Pular introdução <Icon name="arrowDown" className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>
    </section>
  );
}

function Caption({ progress, range, chapter, label, text }: { progress: MotionValue<number>; range: number[]; chapter: string; label: string; text: string }) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[1]], [28, 0]);
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-32 md:bottom-24">
      <div className="container-x">
        <p className="eyebrow flex items-center gap-3">
          <span className="font-display text-[13px] normal-case italic tracking-normal text-brass-light">{chapter}</span>
          <span className="h-px w-10 bg-brass/50" />
          {label}
        </p>
        <p className="display mt-4 max-w-3xl text-[clamp(2.2rem,8.5vw,5.4rem)] italic [text-shadow:0_4px_40px_rgb(0_0_0/0.8)]">{text}</p>
      </div>
    </motion.div>
  );
}

function ChapterRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div aria-hidden="true" className="absolute right-6 top-1/2 hidden -translate-y-1/2 md:block lg:right-12">
      <div className="relative h-56 w-px bg-ivory/15">
        <motion.div style={{ scaleY: progress }} className="absolute inset-0 origin-top bg-brass" />
        {chapters.map((c) => (
          <ChapterMark key={c.n} progress={progress} chapter={c} />
        ))}
      </div>
    </div>
  );
}

function ChapterMark({ progress, chapter }: { progress: MotionValue<number>; chapter: (typeof chapters)[number] }) {
  const opacity = useTransform(progress, (v) => (v >= chapter.at - 0.01 ? 1 : 0.35));
  return (
    <motion.div style={{ opacity, top: `${chapter.at * 100}%` }} className="absolute right-0 flex -translate-y-1/2 translate-x-[3px] items-center gap-3 whitespace-nowrap">
      <span className="text-right text-[11px] uppercase tracking-[0.25em] text-ivory/80">
        <span className="mr-2 font-display text-[13px] normal-case italic tracking-normal text-brass-light">{chapter.n}</span>
        {chapter.label}
      </span>
      <span className="h-[7px] w-[7px] rounded-full bg-brass shadow-[0_0_12px_rgb(var(--brass))]" />
    </motion.div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { proById, serviceById } from '@/config/catalog';
import { cachedBusy } from '@/booking/busyCache';
import { bookableDays, slotsFor } from '@/booking/availability';
import { formatDuration, formatPrice } from '@/lib/format';
import { relativeDayName, shopNow } from '@/lib/time';
import { track } from '@/lib/analytics';
import { useMotionPref } from '@/hooks/useMotionPref';
import { useNearViewport } from '@/hooks/useMisc';
import { useScheduleVersion } from '@/booking/sync';
import { Icon } from '../ui/Icon';

const featured = ['corte-assinatura', 'fade', 'barba-ritual', 'corte-barba'];
const MAX = 8;

type Board = { day: string; slots: { time: string; proIds: string[] }[] };


/** Next free start times for one service, straight from the schedule. One tap opens the booking at the details step. */
export function LiveBoard() {
  const [serviceId, setServiceId] = useState(featured[0]);
  const [board, setBoard] = useState<Board | null | 'error'>(null);
  const [tick, setTick] = useState(0);
  const service = serviceById(serviceId)!;
  const { reduced } = useMotionPref();
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, '200px');
  const { tick: changes } = useScheduleVersion({ active: near, fallbackMs: 10_000 });

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const now = new Date();
      for (const d of bookableDays([serviceId], 'any', now).filter((x) => x.works).slice(0, 7)) {
        const busy = await cachedBusy(d.day);
        const slots = slotsFor([serviceId], 'any', d.day, busy, now);
        if (slots.length) return alive && setBoard({ day: d.day, slots: slots.slice(0, MAX) });
      }
      if (alive) setBoard({ day: shopNow(now).day, slots: [] });
    })().catch(() => alive && setBoard('error'));
    return () => {
      alive = false;
    };
  }, [serviceId, tick, changes]);

  const ready = board && board !== 'error';

  return (
    <section
      ref={ref}
      id="agenda"
      aria-labelledby="agenda-title"
      // Slides over the end of the pinned intro (see FILM_END in Intro.tsx).
      className={`relative z-20 scroll-mt-20 overflow-hidden rounded-t-[2rem] border-t hairline bg-ink pb-20 pt-14 shadow-[0_-40px_80px_-30px_rgb(0_0_0/0.9)] md:rounded-t-[3rem] md:pb-28 md:pt-20 ${reduced ? '' : '-mt-[50svh] md:-mt-[60vh]'}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--brass)/0.16),transparent)]" />
      <div className="container-x relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brass" />
              </span>
              Agenda ao vivo
            </p>
            <h2 id="agenda-title" className="display mt-4 text-[clamp(2.4rem,9vw,4.6rem)]">
              {ready ? relativeDayName(board.day) : 'Hoje'} <em className="brass-text">na cadeira.</em>
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-muted">Toque num horário livre e reserve em seguida, sem passar pelo calendário.</p>
          </div>
          <div role="radiogroup" aria-label="Serviço" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {featured.map((id) => {
              const s = serviceById(id)!;
              const on = id === serviceId;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setServiceId(id)}
                  className={`min-h-11 shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-colors ${on ? 'border-brass bg-brass text-ink' : 'hairline text-ivory/80 hover:border-brass/50'}`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border hairline bg-ink-2/80 p-3 sm:p-4" aria-live="polite" aria-busy={!board}>
          {board === 'error' ? (
            <div className="flex flex-col items-start gap-3 p-4">
              <p>Não conseguimos carregar a agenda agora.</p>
              <button onClick={() => setTick((t) => t + 1)} className="min-h-11 rounded-full border border-brass/60 px-5 text-[14px] font-semibold text-brass-light">
                Tentar de novo
              </button>
            </div>
          ) : !board ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: MAX }, (_, i) => (
                <span key={i} className="h-[5.5rem] animate-pulse rounded-2xl bg-ivory/5" />
              ))}
            </div>
          ) : board.slots.length === 0 ? (
            <p className="p-4 text-muted">Sem horários livres nos próximos dias. Chame a gente no WhatsApp para um encaixe.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" style={{ perspective: 800 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {board.slots.map((s, i) => (
                  <motion.li
                    key={`${serviceId}-${board.day}-${s.time}`}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: '50% 0%' }}
                  >
                    <Link
                      to={`/agendar?servico=${serviceId}&dia=${board.day}&hora=${s.time}`}
                      onClick={() => track('cta_book_click', { from: 'live_board', service: serviceId })}
                      aria-label={`Reservar ${service.name} ${relativeDayName(board.day).toLowerCase()} às ${s.time}`}
                      className="group relative flex h-[5.5rem] flex-col justify-between overflow-hidden rounded-2xl border hairline bg-ink px-4 py-3 transition-colors hover:border-brass/70"
                    >
                      {/* split-flap seam */}
                      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-ink-3" />
                      <span className="flex items-center justify-between">
                        <span className="font-display text-[2rem] leading-none tabular-nums text-ivory">{s.time}</span>
                        <Icon name="arrowUpRight" className="h-4 w-4 text-brass opacity-60 transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="truncate text-[12px] text-muted">{s.proIds.map((id) => proById(id)?.name).join(' · ')}</span>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
          <span>
            {service.name} · {formatDuration(service.durationMin)} · {formatPrice(service.priceCents)}
          </span>
          <Link to={`/agendar?servico=${serviceId}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-brass-light">
            Ver todos os horários <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

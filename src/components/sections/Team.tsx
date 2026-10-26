import { useEffect, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { team, type Professional } from '@/config/catalog';
import { cachedBusy } from '@/booking/busyCache';
import { useScheduleVersion } from '@/booking/sync';
import { proSlots } from '@/booking/availability';
import { addDays, shopNow } from '@/lib/time';
import { track } from '@/lib/analytics';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';

/** First free 45-min slot today or in the next days, computed from real availability. */
function useNextSlots() {
  const [next, setNext] = useState<Record<string, string>>({});
  const { tick } = useScheduleVersion({ fallbackMs: 30_000 });
  useEffect(() => {
    let alive = true;
    (async () => {
      const now = new Date();
      const today = shopNow(now).day;
      const result: Record<string, string> = {};
      for (let i = 0; i < 4 && Object.keys(result).length < team.length; i++) {
        const day = addDays(today, i);
        const busy = await cachedBusy(day).catch(() => null);
        if (!busy) return;
        for (const p of team) {
          if (result[p.id]) continue;
          const slot = proSlots(p, day, 45, busy[p.id] ?? [], now)[0];
          if (slot) result[p.id] = `${i === 0 ? 'hoje' : i === 1 ? 'amanhã' : new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`))} às ${slot}`;
        }
      }
      if (alive) setNext(result);
    })();
    return () => {
      alive = false;
    };
  }, [tick]);
  return next;
}

function ProCard({ pro, next, index }: { pro: Professional; next?: string; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -6, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };
  return (
    <Reveal delay={index * 0.08} className="w-[78%] max-w-[22rem] shrink-0 snap-center md:w-auto md:max-w-none">
      <article
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        className="group relative overflow-hidden rounded-[1.75rem] border hairline bg-ink-2 transition-transform duration-300 ease-out"
      >
        {pro.photo ? (
          <SmartImage id={pro.photo} alt={`Retrato de ${pro.name}`} sizes="(min-width: 768px) 30vw, 78vw" ratio="4 / 5" />
        ) : (
          <div
            role="img"
            aria-label={`Foto de ${pro.name} em breve`}
            className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[radial-gradient(90%_70%_at_30%_25%,rgb(var(--brass)/0.22),transparent_65%),linear-gradient(160deg,rgb(var(--ink-3)),rgb(var(--ink)))]"
          >
            <span aria-hidden="true" className="absolute inset-6 rounded-full border border-brass/15" />
            <span aria-hidden="true" className="display brass-text text-[8.5rem] italic leading-none">{pro.name.slice(0, 1)}</span>
            <span className="absolute left-5 top-5 rounded-full border hairline bg-ink/70 px-3 py-1 text-[11px] text-muted">Foto em breve</span>
          </div>
        )}
        <div className="p-6">
          <p className="eyebrow">{pro.role}</p>
          <h3 className="mt-2 font-display text-4xl italic">{pro.name}</h3>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Especialidades">
            {pro.specialties.map((s) => (
              <li key={s} className="rounded-full border hairline px-3 py-1 text-[12px] text-ivory/80">{s}</li>
            ))}
          </ul>
          <p className="mt-5 flex items-start gap-2 text-[13px] text-muted">
            <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
            <span>{next ? <>Próximo horário livre: <span className="text-ivory">{next}</span></> : 'Consultando agenda…'}</span>
          </p>
          <Link
            to={`/agendar?barbeiro=${pro.id}`}
            onClick={() => track('cta_book_click', { from: 'team', pro: pro.id })}
            className="mt-5 flex min-h-12 items-center justify-between rounded-full border border-brass/50 px-5 text-[14px] font-semibold text-brass-light transition-colors hover:bg-brass hover:text-ink"
          >
            Agendar com {pro.name} <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export function Team() {
  const next = useNextSlots();
  return (
    <section id="equipe" aria-labelledby="equipe-title" className="relative z-10 scroll-mt-20 bg-ink py-20 md:py-28">
      <div className="container-x" id="equipe-title">
        <SectionHeading chapter="V" label="Barbeiros" lines={['As mãos', <em key="e" className="brass-text">por trás da navalha.</em>]} intro="Escolha quem vai te atender ou deixe com o primeiro horário disponível." />
      </div>
      <div className="no-scrollbar container-x mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {team.map((p, i) => (
          <ProCard key={p.id} pro={p} next={next[p.id]} index={i} />
        ))}
      </div>
    </section>
  );
}

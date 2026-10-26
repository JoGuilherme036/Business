import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { categories, services, team } from '@/config/catalog';
import { toggleService } from '@/booking/selection';
import { site } from '@/config/site';
import { bookingApi } from '@/booking/api';
import { bookableDays, eligiblePros, slotsFor, summarize, type BusyMap, type DayClosures } from '@/booking/availability';
import { useScheduleVersion } from '@/booking/sync';
import type { Draft } from '@/booking/draft';
import { formatDuration, formatPrice } from '@/lib/format';
import { maskBrPhone } from '@/lib/phone';
import { addDays, dayOfMonth, formatDayLong, formatDayShort, formatMonth, shopNow, toMinutes } from '@/lib/time';
import { whatsappLink } from '@/lib/whatsapp';
import { Icon } from '../ui/Icon';
import { Link } from 'react-router-dom';

type StepProps = { draft: Draft; update: (p: Partial<Draft>) => void };

export function StepTitle({ id, title, hint }: { id: string; title: string; hint?: string }) {
  return (
    <header className="mb-7">
      <h1 id={id} tabIndex={-1} className="display text-[clamp(2.2rem,9vw,3.4rem)] outline-none">
        {title}
      </h1>
      {hint && <p className="mt-2 text-[15px] text-muted">{hint}</p>}
    </header>
  );
}

/* ---------- 1. Services ---------- */

export function ServicesStep({ draft, update }: StepProps) {
  return (
    <div>
      <StepTitle id="step-title" title="O que vamos fazer?" hint="Escolha um ou mais serviços. Duração e valor são somados automaticamente." />
      <div className="space-y-8">
        {categories.map((c) => (
          <fieldset key={c.id}>
            <legend className="eyebrow mb-3">{c.label}</legend>
            <div className="grid gap-2.5">
              {services
                .filter((s) => s.category === c.id)
                .map((s) => {
                  const on = draft.serviceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => update({ serviceIds: toggleService(draft.serviceIds, s.id), time: null })}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-[border-color,background-color] duration-200 ${
                        on ? 'border-brass bg-brass/10' : 'hairline bg-ink-2/60 hover:border-brass/40'
                      }`}
                    >
                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${on ? 'border-brass bg-brass text-ink' : 'border-ivory/30'}`}>
                        {on && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-xl">{s.name}</span>
                          <span className="font-display text-lg tabular-nums text-brass-light">{formatPrice(s.priceCents)}</span>
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-muted">{s.description}</span>
                        <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-ivory/70">
                          <Icon name="clock" className="h-3.5 w-3.5" /> {formatDuration(s.durationMin)}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

/* ---------- 2. Professional ---------- */

export function ProStep({ draft, update }: StepProps) {
  const pros = eligiblePros(draft.serviceIds);
  const hidden = team.length - pros.length;
  const Option = ({ id, title, subtitle, initials }: { id: string; title: string; subtitle: string; initials?: string }) => {
    const on = draft.proId === id;
    return (
      <button
        role="radio"
        aria-checked={on}
        onClick={() => update({ proId: id, time: null })}
        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${on ? 'border-brass bg-brass/10' : 'hairline bg-ink-2/60 hover:border-brass/40'}`}
      >
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border font-display text-xl italic ${on ? 'border-brass text-brass-light' : 'hairline text-ivory/80'}`}>
          {initials ?? <Icon name="sparkle" className="h-6 w-6 text-brass" />}
        </span>
        <span className="flex-1">
          <span className="block font-display text-2xl">{title}</span>
          <span className="block text-[13px] text-muted">{subtitle}</span>
        </span>
        <span className={`h-5 w-5 rounded-full border-2 ${on ? 'border-brass bg-brass shadow-[inset_0_0_0_3px_rgb(var(--ink))]' : 'border-ivory/30'}`} />
      </button>
    );
  };
  return (
    <div>
      <StepTitle id="step-title" title="Com quem?" hint="Escolha um barbeiro ou deixe com quem tiver o primeiro horário livre." />
      <div role="radiogroup" aria-labelledby="step-title" className="grid gap-2.5">
        <Option id="any" title="Primeiro disponível" subtitle="Mais opções de horário" />
        {pros.map((p) => (
          <Option key={p.id} id={p.id} title={p.name} subtitle={p.specialties.join(' · ')} initials={p.name.slice(0, 1)} />
        ))}
      </div>
      {hidden > 0 && <p className="mt-4 text-[13px] text-muted">{hidden === 1 ? '1 barbeiro não faz' : `${hidden} barbeiros não fazem`} todos os serviços escolhidos e não aparece{hidden === 1 ? '' : 'm'} aqui.</p>}
    </div>
  );
}

/* ---------- 3. Date & time ---------- */

const periods = [
  { label: 'Manhã', from: 0, to: 12 * 60 },
  { label: 'Tarde', from: 12 * 60, to: 18 * 60 },
  { label: 'Noite', from: 18 * 60, to: 24 * 60 },
];

export function TimeStep({ draft, update, refreshKey, onSlotLost }: StepProps & { refreshKey: number; onSlotLost?: (time: string) => void }) {
  const proId = draft.proId ?? 'any';
  // Bookings and blocks made on other devices arrive here without a reload.
  const { tick } = useScheduleVersion();
  const now = useMemo(() => new Date(), [refreshKey, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const [closures, setClosures] = useState<DayClosures>();
  const days = useMemo(() => bookableDays(draft.serviceIds, proId, now, undefined, closures), [draft.serviceIds, proId, now, closures]);
  const [busy, setBusy] = useState<BusyMap | null>(null);
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [searching, setSearching] = useState(false);
  const day = draft.day && days.some((d) => d.day === draft.day && d.works) ? draft.day : days.find((d) => d.works)?.day ?? null;

  useEffect(() => {
    if (day && day !== draft.day) update({ day, time: null });
  }, [day]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const today = shopNow().day;
    bookingApi
      .closures(today, addDays(today, site.booking.maxDaysAhead))
      .then(setClosures)
      .catch(() => undefined);
  }, [tick, refreshKey]);

  useEffect(() => {
    if (!day) return;
    let alive = true;
    if (busyDay !== day) setBusy(null); // skeleton only when switching days; live refreshes swap in place
    setError(false);
    bookingApi
      .getBusy(day)
      .then((b) => {
        if (!alive) return;
        setBusy(b);
        setBusyDay(day);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [day, refreshKey, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots = busy && day && busyDay === day ? slotsFor(draft.serviceIds, proId, day, busy, now) : [];

  // The chosen time was just taken or blocked elsewhere: clear it and say so.
  useEffect(() => {
    if (!busy || busyDay !== day || !draft.time) return;
    if (!slots.some((s) => s.time === draft.time)) {
      onSlotLost?.(draft.time);
      update({ time: null });
    }
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps

  const findNext = async () => {
    if (!day) return;
    setSearching(true);
    for (const d of days.filter((x) => x.works && x.day > day)) {
      const b = await bookingApi.getBusy(d.day).catch(() => null);
      if (b && slotsFor(draft.serviceIds, proId, d.day, b, now).length) {
        update({ day: d.day, time: null });
        break;
      }
    }
    setSearching(false);
  };

  return (
    <div>
      <StepTitle id="step-title" title="Quando?" hint={`Horários de ${formatDuration(summarize(draft.serviceIds).durationMin)} com ${proId === 'any' ? 'qualquer barbeiro' : team.find((p) => p.id === proId)?.name}.`} />

      <div role="listbox" aria-label="Dia" className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1">
        {days.map((d) => {
          const on = d.day === day;
          return (
            <button
              key={d.day}
              role="option"
              aria-selected={on}
              disabled={!d.works}
              onClick={() => update({ day: d.day, time: null })}
              aria-label={`${formatDayLong(d.day)}${d.works ? '' : ', fechado'}`}
              className={`flex w-[4.4rem] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition-colors disabled:opacity-30 ${
                on ? 'border-brass bg-brass text-ink' : 'hairline bg-ink-2/60 hover:border-brass/40'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${on ? 'text-ink/70' : 'text-muted'}`}>{formatDayShort(d.day)}</span>
              <span className="font-display text-2xl leading-tight">{dayOfMonth(d.day)}</span>
              <span className={`text-[11px] ${on ? 'text-ink/70' : 'text-muted'}`}>{formatMonth(d.day)}</span>
            </button>
          );
        })}
      </div>

      {day && <p className="mt-6 text-sm text-ivory/80">{formatDayLong(day)}</p>}

      <div className="mt-4 min-h-[14rem]" aria-live="polite" aria-busy={!busy && !error}>
        {error ? (
          <div className="rounded-2xl border hairline p-5">
            <p className="text-[15px]">Não conseguimos carregar os horários.</p>
            <p className="mt-1 text-sm text-muted">Verifique sua conexão e tente de novo.</p>
            <button onClick={() => update({ day })} className="mt-4 min-h-11 rounded-full border border-brass/60 px-5 text-[14px] font-semibold text-brass-light">
              Tentar de novo
            </button>
          </div>
        ) : !busy || busyDay !== day ? (
          <div className="grid grid-cols-3 gap-2 xs:grid-cols-4">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="h-12 animate-pulse rounded-xl bg-ivory/5" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-2xl border hairline p-5">
            <p className="font-display text-xl">Sem horários livres neste dia.</p>
            <p className="mt-1 text-sm text-muted">Procure o próximo dia com vaga ou peça um encaixe (o encaixe não é uma reserva confirmada).</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={findNext} disabled={searching} className="min-h-11 rounded-full bg-brass px-5 text-[14px] font-semibold text-ink disabled:opacity-60">
                {searching ? 'Procurando…' : 'Próximo dia com vaga'}
              </button>
              <a href={whatsappLink(`Olá! Procuro um encaixe em ${formatDayLong(day!)}. É possível?`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border hairline px-5 text-[14px]">
                <Icon name="whatsapp" className="h-4 w-4" /> Pedir encaixe
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {periods.map((p) => {
              const list = slots.filter((s) => toMinutes(s.time) >= p.from && toMinutes(s.time) < p.to);
              if (!list.length) return null;
              return (
                <div key={p.label} role="radiogroup" aria-label={p.label}>
                  <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">{p.label}</p>
                  <div className="grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5">
                    {list.map((s) => {
                      const on = draft.time === s.time;
                      return (
                        <motion.button
                          key={s.time}
                          role="radio"
                          aria-checked={on}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => update({ time: s.time })}
                          className={`min-h-12 rounded-xl border text-[15px] font-semibold tabular-nums transition-colors ${on ? 'border-brass bg-brass text-ink' : 'hairline bg-ink-2/60 hover:border-brass/50'}`}
                        >
                          {s.time}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {proId === 'any' && <p className="text-[13px] text-muted">Vamos reservar com o primeiro barbeiro livre neste horário.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 4. Details ---------- */

export type FieldErrors = Partial<Record<'name' | 'phone' | 'email', string>>;

export function DetailsStep({ draft, update, errors }: StepProps & { errors: FieldErrors }) {
  const field = 'mt-2 block w-full rounded-2xl border bg-ink-2/70 px-4 py-3.5 text-ivory placeholder:text-ivory/30 transition-colors focus:border-brass focus:outline-none';
  return (
    <div>
      <StepTitle id="step-title" title="Quem vem?" hint="Sem cadastro e sem senha. Usamos seus dados só para este agendamento." />
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Nome</span>
          <input
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            autoComplete="name"
            enterKeyHint="next"
            placeholder="Como podemos te chamar"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'err-name' : undefined}
            className={`${field} ${errors.name ? 'border-danger' : 'hairline'}`}
          />
          {errors.name && <span id="err-name" className="mt-1.5 block text-[13px] text-danger">{errors.name}</span>}
        </label>
        <label className="block">
          <span className="text-sm font-medium">WhatsApp</span>
          <input
            value={draft.phone}
            onChange={(e) => update({ phone: maskBrPhone(e.target.value) })}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            enterKeyHint="next"
            placeholder="(11) 91234-5678"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'err-phone' : 'hint-phone'}
            className={`${field} ${errors.phone ? 'border-danger' : 'hairline'}`}
          />
          {errors.phone ? (
            <span id="err-phone" className="mt-1.5 block text-[13px] text-danger">{errors.phone}</span>
          ) : (
            <span id="hint-phone" className="mt-1.5 block text-[12px] text-muted">Para confirmar e, se precisar, remarcar.</span>
          )}
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            E-mail <span className="text-muted">(opcional)</span>
          </span>
          <input
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="next"
            placeholder="voce@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'err-email' : undefined}
            className={`${field} ${errors.email ? 'border-danger' : 'hairline'}`}
          />
          {errors.email && <span id="err-email" className="mt-1.5 block text-[13px] text-danger">{errors.email}</span>}
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            Observações <span className="text-muted">(opcional)</span>
          </span>
          <textarea
            value={draft.notes}
            onChange={(e) => update({ notes: e.target.value.slice(0, 280) })}
            rows={3}
            enterKeyHint="done"
            placeholder="Ex.: quero manter o comprimento em cima"
            className={`${field} hairline resize-none`}
          />
        </label>
      </div>
    </div>
  );
}

/* ---------- 5. Review ---------- */

export function ReviewStep({ draft, accepted, setAccepted, acceptError }: StepProps & { accepted: boolean; setAccepted: (v: boolean) => void; acceptError: boolean }) {
  const { services: list, durationMin, priceCents } = summarize(draft.serviceIds);
  const pro = draft.proId === 'any' ? 'Primeiro disponível' : team.find((p) => p.id === draft.proId)?.name;
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
  return (
    <div>
      <StepTitle id="step-title" title="Tudo certo?" hint="Confira antes de confirmar. Você pode voltar e mudar qualquer coisa." />
      <div className="rounded-3xl border hairline bg-ink-2/70 p-5">
        <p className="font-display text-3xl italic">{draft.day && formatDayLong(draft.day)}</p>
        <p className="mt-1 font-display text-5xl text-brass-light tabular-nums">{draft.time}</p>
        <dl className="mt-4 divide-y divide-brass/10 text-[15px]">
          <Row label="Barbeiro" value={pro ?? ''} />
          {list.map((s) => (
            <Row key={s.id} label={s.name} value={formatPrice(s.priceCents)} />
          ))}
          <Row label="Duração" value={formatDuration(durationMin)} />
          <div className="flex justify-between gap-4 py-3 text-lg">
            <dt>Total</dt>
            <dd className="font-display text-2xl text-brass-light">{formatPrice(priceCents)}</dd>
          </div>
          <Row label="Nome" value={draft.name} />
          <Row label="WhatsApp" value={draft.phone} />
        </dl>
        <p className="mt-2 text-[13px] text-muted">Pagamento na barbearia, após o atendimento.</p>
      </div>

      <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${acceptError ? 'border-danger' : 'hairline'}`}>
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--brass))]" aria-describedby="policy" />
        <span id="policy" className="text-[14px] leading-relaxed text-ivory/85">
          {site.booking.policy} Li e aceito a política de atendimento e a{' '}
          <Link to="/privacidade" className="text-brass-light underline underline-offset-2">
            política de privacidade
          </Link>
          .
        </span>
      </label>
      {acceptError && <p className="mt-2 text-[13px] text-danger">Para confirmar, aceite a política de atendimento.</p>}
    </div>
  );
}

export function StepTransition({ stepKey, dir, children }: { stepKey: string; dir: number; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.div
        key={stepKey}
        custom={dir}
        initial={{ opacity: 0, x: dir * 36 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: dir * -36 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

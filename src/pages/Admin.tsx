import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { proById, serviceById, services, team } from '@/config/catalog';
import { site } from '@/config/site';
import { adminApi, bookingApi } from '@/booking/api';
import { clearAdminSession } from '@/booking/cloudflareApi';
import { DEMO_ADMIN_PASSWORD } from '@/booking/localApi';
import { notifyScheduleChanged, useScheduleVersion } from '@/booking/sync';
import { BookingError, type Block, type Booking, type BookingStatus, type BusyMap } from '@/booking/types';
import { eligiblePros, slotsFor, summarize } from '@/booking/availability';
import { toggleService } from '@/booking/selection';
import { maskBrPhone } from '@/lib/phone';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { formatDuration } from '@/lib/format';
import { formatPrice } from '@/lib/format';
import { formatRanges } from '@/lib/hours';
import { addDays, dayOfMonth, formatDayLong, formatDayShort, shopNow, weekdayOf } from '@/lib/time';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Icon } from '@/components/ui/Icon';
import { Monogram } from '@/components/ui/Monogram';

const clock = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: site.timeZone });
const clockSec = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: site.timeZone });
const statusLabel: Record<BookingStatus, string> = { confirmed: 'Confirmado', completed: 'Concluído', no_show: 'Faltou', cancelled: 'Cancelado' };
const statusStyle: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-400/15 text-emerald-300',
  completed: 'bg-brass/20 text-brass-light',
  no_show: 'bg-danger/15 text-danger',
  cancelled: 'bg-ivory/10 text-muted line-through',
};
const field = 'mt-1.5 block w-full rounded-xl border hairline bg-ink px-3.5 py-3 text-ivory focus:border-brass focus:outline-none';

export default function Admin() {
  useDocumentTitle('Painel da barbearia');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(bookingApi.mode === 'live');

  // A live session survives a refresh (token in sessionStorage); confirm it is still valid.
  useEffect(() => {
    if (bookingApi.mode !== 'live') return;
    adminApi
      .day(shopNow().day)
      .then(() => setAuthed(true))
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="grid min-h-[100svh] place-items-center text-muted">Carregando…</div>;
  return authed ? (
    <Dashboard
      onLogout={() => {
        clearAdminSession();
        setAuthed(false);
      }}
    />
  ) : (
    <Login onSuccess={() => setAuthed(true)} />
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'wrong' | 'error'>('idle');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setState(err instanceof BookingError && err.code === 'unauthorized' ? 'wrong' : 'error');
    }
  };
  return (
    <main id="conteudo" className="grid min-h-[100svh] place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border hairline bg-ink-2 p-7">
        <Monogram className="h-12 w-12" />
        <h1 className="display mt-6 text-4xl">
          Painel da <em className="brass-text">barbearia</em>
        </h1>
        <p className="mt-2 text-sm text-muted">Agenda do dia, bloqueios de horário, dia ou barbeiro.</p>
        <label className="mt-6 block">
          <span className="text-sm font-medium">Senha</span>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} required />
        </label>
        <div aria-live="polite" className="mt-2 min-h-5 text-[13px] text-danger">
          {state === 'wrong' && 'Senha incorreta.'}
          {state === 'error' && 'Não foi possível conectar. Tente de novo.'}
        </div>
        <button type="submit" disabled={state === 'loading'} className="mt-3 min-h-12 w-full rounded-full bg-brass text-[15px] font-semibold text-ink disabled:opacity-50">
          {state === 'loading' ? 'Entrando…' : 'Entrar'}
        </button>
        {bookingApi.mode === 'demo' && (
          <p className="mt-4 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2 text-[12px] text-brass-light">
            Modo demonstração: senha <b>{DEMO_ADMIN_PASSWORD}</b>. Os dados ficam só neste navegador.
          </p>
        )}
        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] text-muted hover:text-ivory">
          <Icon name="arrowLeft" className="h-4 w-4" /> Voltar ao site
        </Link>
      </form>
    </main>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const today = shopNow().day;
  const [day, setDay] = useState(today);
  const [filter, setFilter] = useState<string>('all');
  const [data, setData] = useState<{ bookings: Booking[]; blocks: Block[] } | null>(null);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState<'block' | 'book' | null>(null);
  const { tick, syncedAt, live } = useScheduleVersion();

  const load = useCallback(async () => {
    try {
      setData(await adminApi.day(day));
      setError(false);
    } catch (e) {
      if (e instanceof BookingError && e.code === 'unauthorized') onLogout();
      else setError(true);
    }
  }, [day, onLogout]);

  useEffect(() => {
    setData(null);
  }, [day]);
  useEffect(() => {
    load();
  }, [load, tick]);

  const changed = () => {
    notifyScheduleChanged();
    load();
  };

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => addDays(today, i - 3)), [today]);
  const pros = team.filter((p) => filter === 'all' || p.id === filter);
  const active = data?.bookings.filter((b) => b.status !== 'cancelled') ?? [];
  const revenue = active.reduce((t, b) => t + b.totalCents, 0);
  const wholeDay = data?.blocks.filter((b) => !b.startTime) ?? [];

  return (
    <div className="min-h-[100svh] pb-32">
      <header className="sticky top-0 z-30 border-b hairline bg-ink/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Monogram className="hidden h-9 w-9 sm:block" />
            <div className="leading-tight">
              <p className="font-display text-lg italic">Agenda</p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted" aria-live="polite">
                <span className="relative flex h-1.5 w-1.5">
                  {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live || syncedAt ? 'bg-emerald-400' : 'bg-muted'}`} />
                </span>
                {live ? 'Ao vivo' : syncedAt ? `Atualizado ${clockSec.format(syncedAt)}` : 'Conectando…'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => setSheet('book')} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brass/60 px-3.5 text-[13px] font-semibold text-brass-light sm:px-4">
              <Icon name="calendar" className="h-4 w-4" /> Agendar
            </button>
            <button onClick={() => setSheet('block')} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brass px-3.5 text-[13px] font-semibold text-ink sm:px-4">
              <Icon name="close" className="h-4 w-4 rotate-45" /> Bloquear
            </button>
            <button onClick={onLogout} className="grid h-11 w-11 place-items-center rounded-full border hairline" aria-label="Sair do painel">
              <Icon name="arrowUpRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 pb-3" role="listbox" aria-label="Dia">
          {days.map((d) => {
            const on = d === day;
            const closed = site.hours[weekdayOf(d)].length === 0;
            return (
              <button
                key={d}
                role="option"
                aria-selected={on}
                onClick={() => setDay(d)}
                className={`flex w-14 shrink-0 flex-col items-center rounded-xl border py-1.5 ${on ? 'border-brass bg-brass text-ink' : 'hairline'} ${closed && !on ? 'opacity-40' : ''}`}
              >
                <span className="text-[10px] font-semibold uppercase">{d === today ? 'Hoje' : formatDayShort(d)}</span>
                <span className="font-display text-xl leading-tight">{dayOfMonth(d)}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl px-4 pt-6">
        {bookingApi.mode === 'demo' && (
          <p className="mb-4 rounded-xl border border-brass/30 bg-brass/10 px-4 py-2 text-[13px] text-brass-light">
            Modo demonstração: abra o site em outra aba para ver os bloqueios aparecerem lá na hora.
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(2rem,7vw,3rem)]">{formatDayLong(day)}</h1>
            <p className="mt-1 text-sm text-muted">
              {active.length} {active.length === 1 ? 'atendimento' : 'atendimentos'} · {formatPrice(revenue)} previstos · horário da casa {formatRanges(site.hours[weekdayOf(day)])}
            </p>
          </div>
          <div role="group" aria-label="Barbeiro" className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {[{ id: 'all', name: 'Todos' }, ...team].map((p) => (
              <button key={p.id} onClick={() => setFilter(p.id)} aria-pressed={filter === p.id} className={`min-h-10 shrink-0 rounded-full border px-4 text-[13px] font-semibold ${filter === p.id ? 'border-brass bg-brass text-ink' : 'hairline'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {wholeDay.length > 0 && (
          <div className="mt-5 space-y-2">
            {wholeDay.map((b) => (
              <BlockRow key={b.id} block={b} onRemoved={changed} />
            ))}
          </div>
        )}

        {error && <p className="mt-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">Sem conexão com a agenda. Tentando de novo…</p>}

        <div className={`mt-6 grid gap-4 ${pros.length > 1 ? 'md:grid-cols-3' : ''}`}>
          {pros.map((p) => {
            const schedule = p.schedule[weekdayOf(day)] ?? [];
            const items = [
              ...(data?.bookings.filter((b) => b.proId === p.id).map((b) => ({ at: b.start, kind: 'booking' as const, b })) ?? []),
              ...(data?.blocks.filter((b) => b.startTime && (b.proId === p.id || b.proId === null)).map((b) => ({ at: b.startTime!, kind: 'block' as const, b })) ?? []),
            ].sort((x, y) => (x.kind === 'block' ? x.at : clock.format(new Date(x.at))).localeCompare(y.kind === 'block' ? y.at : clock.format(new Date(y.at))));
            const off = data?.blocks.some((b) => !b.startTime && (b.proId === p.id || b.proId === null));
            return (
              <section key={p.id} aria-label={p.name} className="rounded-3xl border hairline bg-ink-2 p-4">
                <header className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-2xl italic">{p.name}</h2>
                  <span className="text-[12px] text-muted">{off ? 'Bloqueado o dia todo' : schedule.length ? formatRanges(schedule) : 'Folga'}</span>
                </header>
                {!data ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <span key={i} className="block h-20 animate-pulse rounded-2xl bg-ivory/5" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed hairline px-4 py-6 text-center text-sm text-muted">Nenhum horário marcado.</p>
                ) : (
                  <ul className="space-y-2">
                    <AnimatePresence initial={false}>
                      {items.map((it) => (
                        <motion.li key={it.kind + (it.kind === 'booking' ? it.b.code : it.b.id)} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          {it.kind === 'booking' ? <BookingCard booking={it.b} onChanged={changed} /> : <BlockRow block={it.b} onRemoved={changed} compact />}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {sheet === 'block' && <BlockSheet day={day} onClose={() => setSheet(null)} onCreated={changed} />}
        {sheet === 'book' && <BookSheet day={day} onClose={() => setSheet(null)} onCreated={changed} />}
      </AnimatePresence>
    </div>
  );
}

function BookingCard({ booking: b, onChanged }: { booking: Booking; onChanged: () => void }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = async (status: Exclude<BookingStatus, 'confirmed'>) => {
    setBusy(true);
    try {
      await adminApi.setStatus(b.code, status);
      onChanged();
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  };
  const phone = b.customer.phone;
  const pretty = phone.length === 11 ? `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}` : phone;
  return (
    <article className={`rounded-2xl border hairline bg-ink p-4 ${b.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-2xl tabular-nums leading-none text-brass-light">
          {clock.format(new Date(b.start))}
          <span className="text-base text-muted">–{clock.format(new Date(b.end))}</span>
        </p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[b.status]}`}>{statusLabel[b.status]}</span>
      </div>
      <p className="mt-2 text-[15px] font-semibold">{b.customer.name}</p>
      <p className="text-[13px] text-muted">
        {b.serviceIds.map((id) => serviceById(id)?.name ?? id).join(' + ')} · {formatPrice(b.totalCents)}
      </p>
      {b.customer.notes && <p className="mt-1 text-[13px] italic text-ivory/70">“{b.customer.notes}”</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href={`https://wa.me/55${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border hairline px-3 text-[12px]">
          <Icon name="whatsapp" className="h-4 w-4 text-brass" /> {pretty}
        </a>
        <span className="font-mono text-[11px] text-muted">{b.code}</span>
      </div>
      {b.status === 'confirmed' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {confirmCancel ? (
            <>
              <button disabled={busy} onClick={() => set('cancelled')} className="min-h-10 rounded-full bg-danger px-4 text-[12px] font-semibold text-ink">
                Confirmar cancelamento
              </button>
              <button onClick={() => setConfirmCancel(false)} className="min-h-10 rounded-full border hairline px-4 text-[12px]">
                Manter
              </button>
            </>
          ) : (
            <>
              <button disabled={busy} onClick={() => set('completed')} className="min-h-10 rounded-full border border-brass/50 px-4 text-[12px] font-semibold text-brass-light">
                Concluir
              </button>
              <button disabled={busy} onClick={() => set('no_show')} className="min-h-10 rounded-full border hairline px-4 text-[12px]">
                Faltou
              </button>
              <button disabled={busy} onClick={() => setConfirmCancel(true)} className="min-h-10 rounded-full border hairline px-4 text-[12px] hover:border-danger/60">
                Cancelar
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function BlockRow({ block: b, onRemoved, compact }: { block: Block; onRemoved: () => void; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const who = b.proId ? proById(b.proId)?.name ?? b.proId : 'Toda a barbearia';
  const when = b.startTime ? `${b.startTime}–${b.endTime}` : 'Dia inteiro';
  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.removeBlock(b.id);
      onRemoved();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border border-dashed border-brass/40 px-4 ${compact ? 'py-3' : 'py-3.5'} bg-[repeating-linear-gradient(135deg,rgb(var(--brass)/0.07)_0_8px,transparent_8px_16px)]`}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">
          Bloqueado · {when}
          {!compact || !b.proId ? <span className="font-normal text-muted"> · {who}</span> : null}
        </p>
        {b.reason && <p className="truncate text-[12px] text-muted">{b.reason}</p>}
      </div>
      <button disabled={busy} onClick={remove} className="min-h-10 shrink-0 rounded-full border hairline px-3 text-[12px] hover:border-brass/60">
        {busy ? 'Removendo…' : 'Desbloquear'}
      </button>
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border hairline bg-ink-2 p-6 pb-[max(env(safe-area-inset-bottom),24px)] md:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="display text-3xl">{title}</h2>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border hairline" aria-label="Fechar">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const shopRules = { ...site.booking, minLeadMin: 0 };

/** Book for a client who called or walked in: no minimum notice, phone optional. */
function BookSheet({ day, onClose, onCreated }: { day: string; onClose: () => void; onCreated: () => void }) {
  const [serviceIds, setServiceIds] = useState<string[]>([services[0].id]);
  const [proId, setProId] = useState<string>('any');
  const [date, setDate] = useState(day < shopNow().day ? shopNow().day : day);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState<BusyMap | null>(null);
  const [state, setState] = useState<'idle' | 'saving' | 'taken' | 'invalid' | 'error'>('idle');
  const [done, setDone] = useState<Booking | null>(null);
  const [key] = useState(() => crypto.randomUUID?.() ?? String(Math.random()).slice(2));
  const { tick } = useScheduleVersion();

  useEffect(() => {
    let alive = true;
    bookingApi
      .getBusy(date)
      .then((b) => alive && setBusy(b))
      .catch(() => alive && setBusy({}));
    return () => {
      alive = false;
    };
  }, [date, tick]);

  const eligible = eligiblePros(serviceIds);
  const slots = busy && serviceIds.length ? slotsFor(serviceIds, proId, date, busy, new Date(), shopRules) : [];
  const sum = summarize(serviceIds);

  useEffect(() => {
    if (proId !== 'any' && !eligible.some((p) => p.id === proId)) setProId('any');
  }, [serviceIds]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (time && busy && !slots.some((s) => s.time === time)) setTime(null);
  }, [busy, serviceIds, proId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!time) return;
    setState('saving');
    try {
      const b = await adminApi.book({ idempotencyKey: key, serviceIds, proId, day: date, time, customer: { name, phone } });
      setDone(b);
      setState('idle');
      onCreated();
    } catch (err) {
      const code = err instanceof BookingError ? err.code : 'network';
      setState(code === 'slot_taken' ? 'taken' : code === 'invalid' ? 'invalid' : 'error');
      if (code === 'slot_taken') setTime(null);
    }
  };

  if (done) {
    const pro = proById(done.proId)?.name ?? '';
    const servicesText = done.serviceIds.map((id) => serviceById(id)?.name).join(' + ');
    return (
      <Sheet title="Agendado" onClose={onClose}>
        <div className="mt-5 space-y-4" aria-live="polite">
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-[14px]">
            {done.customer.name} · {formatDayShort(done.day)} {dayOfMonth(done.day)} às {done.time} com {pro}. Já aparece em todos os aparelhos.
          </p>
          <p className="text-[13px] text-muted">
            Código <span className="font-mono text-ivory">{done.code}</span> · {servicesText} · {formatPrice(done.totalCents)}
          </p>
          {done.customer.phone && (
            <a
              href={whatsappLink(waMessages.booking({ code: done.code, date: formatDayLong(done.day), time: done.time, pro, services: servicesText })).replace(/wa\.me\/\d+/, `wa.me/55${done.customer.phone}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-brass/60 text-[14px] font-semibold text-brass-light"
            >
              <Icon name="whatsapp" className="h-4 w-4" /> Enviar confirmação ao cliente
            </a>
          )}
          <button onClick={onClose} className="min-h-12 w-full rounded-full bg-brass text-[15px] font-semibold text-ink">
            Pronto
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Agendar cliente" onClose={onClose}>
      <form onSubmit={submit} className="mt-5 space-y-5">
        <fieldset>
          <legend className="text-sm font-medium">Serviços</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {services.map((s) => {
              const on = serviceIds.includes(s.id);
              return (
                <button type="button" key={s.id} onClick={() => setServiceIds(toggleService(serviceIds, s.id))} aria-pressed={on} className={`min-h-10 rounded-full border px-3.5 text-[12px] font-semibold ${on ? 'border-brass bg-brass text-ink' : 'hairline'}`}>
                  {s.name}
                </button>
              );
            })}
          </div>
          {sum.services.length > 0 && <p className="mt-2 text-[12px] text-muted">{formatDuration(sum.durationMin)} · {formatPrice(sum.priceCents)}</p>}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Barbeiro</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[{ id: 'any', name: 'Primeiro livre' }, ...eligible].map((p) => (
              <button type="button" key={p.id} onClick={() => setProId(p.id)} aria-pressed={proId === p.id} className={`min-h-10 rounded-full border px-3.5 text-[12px] font-semibold ${proId === p.id ? 'border-brass bg-brass text-ink' : 'hairline'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium">Dia</span>
          <input id="book-date" type="date" value={date} min={shopNow().day} onChange={(e) => (setDate(e.target.value), setTime(null))} className={field} required />
        </label>

        <fieldset>
          <legend className="text-sm font-medium">Horário livre</legend>
          {!busy ? (
            <p className="mt-2 text-[13px] text-muted">Carregando horários…</p>
          ) : slots.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed hairline px-3 py-3 text-[13px] text-muted">Nenhum horário livre nesse dia para esses serviços.</p>
          ) : (
            <div className="mt-2 grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-5">
              {slots.map((s) => (
                <button type="button" key={s.time} onClick={() => setTime(s.time)} aria-pressed={time === s.time} className={`min-h-10 rounded-lg border text-[13px] font-semibold tabular-nums ${time === s.time ? 'border-brass bg-brass text-ink' : 'hairline'}`}>
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Nome do cliente</span>
            <input id="book-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={field} required minLength={2} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              WhatsApp <span className="text-muted">(opcional)</span>
            </span>
            <input id="book-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(maskBrPhone(e.target.value))} placeholder="(11) 91234-5678" className={field} />
          </label>
        </div>

        <div aria-live="polite" className="text-[13px] text-danger">
          {state === 'taken' && 'Esse horário acabou de ser ocupado. Escolha outro.'}
          {state === 'invalid' && 'Confira o nome e o telefone (com DDD).'}
          {state === 'error' && 'Não foi possível salvar. Verifique a conexão.'}
        </div>
        <button type="submit" disabled={!time || !serviceIds.length || name.trim().length < 2 || state === 'saving'} className="min-h-12 w-full rounded-full bg-brass text-[15px] font-semibold text-ink disabled:opacity-40">
          {state === 'saving' ? 'Salvando…' : time ? `Agendar às ${time}` : 'Escolha um horário'}
        </button>
      </form>
    </Sheet>
  );
}

function BlockSheet({ day, onClose, onCreated }: { day: string; onClose: () => void; onCreated: () => void }) {
  const [proId, setProId] = useState<string>('all');
  const [mode, setMode] = useState<'day' | 'time'>('time');
  const [from, setFrom] = useState(day);
  const [to, setTo] = useState(day);
  const [startTime, setStart] = useState('12:00');
  const [endTime, setEnd] = useState('13:00');
  const [reason, setReason] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [result, setResult] = useState<{ created: number; conflicts: Booking[] } | null>(null);

  const invalid = to < from || (mode === 'time' && endTime <= startTime);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    setState('saving');
    try {
      const r = await adminApi.addBlock({
        proId: proId === 'all' ? null : proId,
        from,
        to,
        ...(mode === 'time' ? { startTime, endTime } : {}),
        reason,
      });
      setResult(r);
      setState('idle');
      onCreated();
    } catch {
      setState('error');
    }
  };

  return (
    <Sheet title="Bloquear" onClose={onClose}>

        {result ? (
          <div className="mt-5 space-y-4" aria-live="polite">
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-[14px]">
              Bloqueio salvo em {result.created} {result.created === 1 ? 'dia' : 'dias'}. Já aparece como indisponível em todos os aparelhos.
            </p>
            {result.conflicts.length > 0 && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 p-4">
                <p className="text-[14px] font-semibold">Esses clientes já tinham horário nesse período. Avise e remarque:</p>
                <ul className="mt-3 space-y-2">
                  {result.conflicts.map((c) => (
                    <li key={c.code} className="flex items-center justify-between gap-3 text-[13px]">
                      <span>
                        {formatDayShort(c.day)} {dayOfMonth(c.day)} · {c.time} · {c.customer.name} ({proById(c.proId)?.name})
                      </span>
                      <a
                        href={`https://wa.me/55${c.customer.phone}?text=${encodeURIComponent(`Olá, ${c.customer.name}! Precisamos remarcar seu horário de ${formatDayLong(c.day)} às ${c.time} (código ${c.code}). Qual outro horário fica bom para você?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-brass px-3 text-[12px] font-semibold text-ink"
                      >
                        <Icon name="whatsapp" className="h-4 w-4" /> Avisar
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={onClose} className="min-h-12 w-full rounded-full bg-brass text-[15px] font-semibold text-ink">
              Pronto
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-sm font-medium">Quem</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[{ id: 'all', name: 'Toda a barbearia' }, ...team].map((p) => (
                  <button type="button" key={p.id} onClick={() => setProId(p.id)} aria-pressed={proId === p.id} className={`min-h-11 rounded-full border px-4 text-[13px] font-semibold ${proId === p.id ? 'border-brass bg-brass text-ink' : 'hairline'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">O quê</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    ['time', 'Um horário'],
                    ['day', 'Dia inteiro'],
                  ] as const
                ).map(([id, label]) => (
                  <button type="button" key={id} onClick={() => setMode(id)} aria-pressed={mode === id} className={`min-h-11 rounded-xl border text-[13px] font-semibold ${mode === id ? 'border-brass bg-brass/15 text-brass-light' : 'hairline'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-sm font-medium">De</span>
                <input id="block-from" type="date" value={from} onChange={(e) => (setFrom(e.target.value), e.target.value > to && setTo(e.target.value))} className={field} required />
              </label>
              <label>
                <span className="text-sm font-medium">Até</span>
                <input id="block-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={field} required />
              </label>
            </div>

            {mode === 'time' && (
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="text-sm font-medium">Início</span>
                  <input id="block-start" type="time" step={900} value={startTime} onChange={(e) => setStart(e.target.value)} className={field} required />
                </label>
                <label>
                  <span className="text-sm font-medium">Fim</span>
                  <input id="block-end" type="time" step={900} value={endTime} onChange={(e) => setEnd(e.target.value)} className={field} required />
                </label>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium">
                Motivo <span className="text-muted">(opcional, só a equipe vê)</span>
              </span>
              <input id="block-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: almoço, curso, férias" maxLength={120} className={field} />
            </label>

            {invalid && <p className="text-[13px] text-danger">Confira as datas e os horários: o fim precisa ser depois do início.</p>}
            {state === 'error' && <p className="text-[13px] text-danger">Não foi possível salvar. Verifique a conexão e tente de novo.</p>}
            <button type="submit" disabled={invalid || state === 'saving'} className="min-h-12 w-full rounded-full bg-brass text-[15px] font-semibold text-ink disabled:opacity-40">
              {state === 'saving' ? 'Salvando…' : 'Salvar bloqueio'}
            </button>
          </form>
        )}
    </Sheet>
  );
}

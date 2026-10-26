import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { proById, serviceById } from '@/config/catalog';
import { site } from '@/config/site';
import { bookingApi } from '@/booking/api';
import { notifyScheduleChanged } from '@/booking/sync';
import { BookingError, type Booking } from '@/booking/types';
import { formatDuration, formatPrice } from '@/lib/format';
import { maskBrPhone } from '@/lib/phone';
import { formatDayLong } from '@/lib/time';
import { whatsappLink } from '@/lib/whatsapp';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Icon } from '@/components/ui/Icon';

export default function ManageBooking() {
  useDocumentTitle('Meu agendamento');
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('codigo') ?? '');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'notfound' | 'error'>('idle');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const find = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    setMessage(null);
    try {
      const b = await bookingApi.find(code, phone);
      setBooking(b);
      setState(b ? 'idle' : 'notfound');
    } catch {
      setState('error');
    }
  };

  const cancel = async () => {
    if (!booking) return;
    setState('loading');
    try {
      setBooking(await bookingApi.cancel(booking.code, phone));
      notifyScheduleChanged();
      setMessage('Agendamento cancelado. O horário foi liberado.');
      setState('idle');
    } catch (e) {
      setState('idle');
      setMessage(
        e instanceof BookingError && e.code === 'too_late'
          ? `Cancelamentos online só até ${site.booking.cancelUntilHours}h antes. Fale com a gente no WhatsApp.`
          : 'Não foi possível cancelar agora. Tente de novo ou fale no WhatsApp.',
      );
    }
    setConfirming(false);
  };

  const input = 'mt-2 block w-full rounded-2xl border hairline bg-ink-2/70 px-4 py-3.5 placeholder:text-ivory/30 focus:border-brass focus:outline-none';
  const canCancel = booking?.status === 'confirmed' && Date.parse(booking.start) - Date.now() > site.booking.cancelUntilHours * 3_600_000;

  return (
    <main id="conteudo" className="container-x relative z-10 min-h-[100svh] max-w-2xl pb-32 pt-28 md:pt-36">
      <p className="eyebrow">Meu agendamento</p>
      <h1 className="display mt-4 text-[clamp(2.6rem,10vw,4rem)]">
        Consultar, remarcar <em className="brass-text">ou cancelar.</em>
      </h1>

      <form onSubmit={find} className="mt-10 space-y-4 rounded-3xl border hairline bg-ink-2/50 p-5 md:p-7">
        <label className="block">
          <span className="text-sm font-medium">Código do agendamento</span>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="RB-XXXXX" autoCapitalize="characters" autoComplete="off" required className={`${input} font-mono tracking-widest`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">WhatsApp usado na reserva</span>
          <input value={phone} onChange={(e) => setPhone(maskBrPhone(e.target.value))} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(11) 91234-5678" required className={input} />
        </label>
        <button type="submit" disabled={state === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brass text-[15px] font-semibold text-ink disabled:opacity-50">
          {state === 'loading' ? 'Buscando…' : 'Buscar agendamento'}
        </button>
        <div aria-live="polite">
          {state === 'notfound' && <p className="text-[14px] text-danger">Não encontramos um agendamento com esse código e telefone.</p>}
          {state === 'error' && <p className="text-[14px] text-danger">Sem conexão. Tente de novo em instantes.</p>}
        </div>
      </form>

      {booking && (
        <section aria-label="Detalhes" className="mt-6 rounded-3xl border hairline bg-ink-2/70 p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono tracking-widest">{booking.code}</p>
            <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${booking.status === 'confirmed' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-danger/15 text-danger'}`}>
              {booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
            </span>
          </div>
          <p className="mt-4 font-display text-3xl italic">{formatDayLong(booking.day)}</p>
          <p className="font-display text-4xl text-brass-light">{booking.time}</p>
          <p className="mt-3 text-[15px] text-ivory/85">
            {booking.serviceIds.map((id) => serviceById(id)?.name).join(' + ')} com {proById(booking.proId)?.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatDuration(booking.durationMin)} · {formatPrice(booking.totalCents)}
          </p>
          {message && <p role="status" className="mt-4 rounded-xl border hairline px-4 py-3 text-[14px]">{message}</p>}

          {booking.status === 'confirmed' && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a href={whatsappLink(`Olá! Quero remarcar meu agendamento ${booking.code} (${formatDayLong(booking.day)} às ${booking.time}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brass/60 text-[14px] font-semibold text-brass-light">
                <Icon name="whatsapp" className="h-[18px] w-[18px]" /> Remarcar pelo WhatsApp
              </a>
              {canCancel ? (
                confirming ? (
                  <div className="flex gap-2">
                    <button onClick={cancel} className="min-h-12 flex-1 rounded-full bg-danger text-[14px] font-semibold text-ink">Confirmar cancelamento</button>
                    <button onClick={() => setConfirming(false)} className="min-h-12 rounded-full border hairline px-4 text-[14px]">Manter</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirming(true)} className="min-h-12 rounded-full border hairline text-[14px] hover:border-danger/60">Cancelar agendamento</button>
                )
              ) : (
                <p className="self-center text-[13px] text-muted">Cancelamento online até {site.booking.cancelUntilHours}h antes.</p>
              )}
            </div>
          )}
          {booking.status === 'cancelled' && (
            <Link to="/agendar" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-brass px-6 text-[14px] font-semibold text-ink">
              Agendar novo horário <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </main>
  );
}

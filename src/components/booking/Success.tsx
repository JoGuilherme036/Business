import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { proById, serviceById } from '@/config/catalog';
import { fullAddress, site } from '@/config/site';
import type { Booking } from '@/booking/types';
import { bookingApi } from '@/booking/api';
import { formatDuration, formatPrice } from '@/lib/format';
import { downloadIcs, googleCalendarLink, type CalendarEvent } from '@/lib/ics';
import { routeLink } from '@/lib/maps';
import { formatDayLong } from '@/lib/time';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { Icon, type IconName } from '../ui/Icon';

export function Success({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);
  const pro = proById(booking.proId)?.name ?? '';
  const serviceNames = booking.serviceIds.map((id) => serviceById(id)?.name).filter(Boolean).join(' + ');
  const event: CalendarEvent = {
    uid: booking.code,
    start: new Date(booking.start),
    end: new Date(booking.end),
    title: `${serviceNames} · ${site.name}`,
    description: `Código ${booking.code}. Barbeiro: ${pro}. ${site.booking.policy}`,
  };
  const wa = whatsappLink(waMessages.booking({ code: booking.code, date: formatDayLong(booking.day), time: booking.time, pro, services: serviceNames }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(booking.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* code remains selectable */
    }
  };

  const share = async () => {
    const text = `${serviceNames} na ${site.name}, ${formatDayLong(booking.day)} às ${booking.time}.`;
    if (navigator.share) await navigator.share({ title: site.name, text, url: site.url }).catch(() => undefined);
    else await navigator.clipboard.writeText(`${text} ${site.url}`).catch(() => undefined);
  };

  return (
    <div className="text-center">
      <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28" aria-hidden="true">
        <motion.circle cx="60" cy="60" r="54" fill="none" stroke="rgb(var(--brass))" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
        <motion.path d="M38 62l15 15 30-32" fill="none" stroke="rgb(var(--brass-light))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }} />
      </svg>

      <h1 id="step-title" tabIndex={-1} className="display mt-6 text-[clamp(2.4rem,10vw,3.6rem)] outline-none" aria-live="assertive">
        Agendamento <em className="brass-text">confirmado.</em>
      </h1>
      {bookingApi.mode === 'demo' && (
        <p className="mx-auto mt-3 max-w-sm rounded-xl border border-brass/30 bg-brass/10 px-4 py-2 text-[13px] text-brass-light">
          Modo demonstração: este agendamento ficou salvo só neste aparelho e não chegou à barbearia.
        </p>
      )}

      <div className="mx-auto mt-8 max-w-md rounded-3xl border hairline bg-ink-2/70 p-6 text-left">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Código</p>
            <p className="mt-1 select-all font-mono text-2xl tracking-widest">{booking.code}</p>
          </div>
          <button onClick={copy} className="grid h-12 w-12 place-items-center rounded-full border hairline" aria-label="Copiar código">
            <Icon name={copied ? 'check' : 'copy'} className={copied ? 'text-emerald-400' : ''} />
          </button>
        </div>
        <dl className="mt-5 space-y-2 text-[15px]">
          <div className="flex justify-between gap-4"><dt className="text-muted">Quando</dt><dd className="text-right">{formatDayLong(booking.day)}, {booking.time}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Barbeiro</dt><dd>{pro}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Serviços</dt><dd className="text-right">{serviceNames}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Duração</dt><dd>{formatDuration(booking.durationMin)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Total</dt><dd className="font-display text-xl text-brass-light">{formatPrice(booking.totalCents)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Onde</dt><dd className="text-right text-[13px]">{fullAddress}</dd></div>
        </dl>
      </div>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2">
        <Action onClick={() => downloadIcs(event)} icon="calendar" label="Salvar na agenda" />
        <Action href={googleCalendarLink(event)} icon="calendar" label="Google Agenda" />
        <Action href={wa} icon="whatsapp" label="Enviar no WhatsApp" />
        <Action href={routeLink()} icon="route" label="Como chegar" />
        <Action onClick={share} icon="share" label="Compartilhar" />
        <Action to={`/meu-agendamento?codigo=${booking.code}`} icon="reset" label="Remarcar ou cancelar" />
      </div>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center gap-2 text-[14px] text-muted hover:text-ivory">
        <Icon name="arrowLeft" className="h-4 w-4" /> Voltar ao início
      </Link>
    </div>
  );
}

function Action({ href, to, onClick, icon, label }: { href?: string; to?: string; onClick?: () => void; icon: IconName; label: string }) {
  const cls = 'flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border hairline bg-ink-2/60 px-2 text-[13px] transition-colors hover:border-brass/60';
  const inner = (
    <>
      <Icon name={icon} className="h-5 w-5 text-brass" /> {label}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

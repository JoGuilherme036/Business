import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { proById, serviceById } from '@/config/catalog';
import { bookingApi } from '@/booking/api';
import { eligiblePros, summarize } from '@/booking/availability';
import { useDraft } from '@/booking/draft';
import { notifyScheduleChanged } from '@/booking/sync';
import { BookingError, type Booking as BookingT } from '@/booking/types';
import { formatDuration, formatPrice } from '@/lib/format';
import { isValidBrPhone } from '@/lib/phone';
import { track } from '@/lib/analytics';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Icon } from '@/components/ui/Icon';
import { DetailsStep, ProStep, ReviewStep, ServicesStep, StepTransition, TimeStep, type FieldErrors } from '@/components/booking/steps';
import { Success } from '@/components/booking/Success';
import { asset } from '@/lib/asset';

const steps = [
  { id: 'servicos', label: 'Serviço' },
  { id: 'barbeiro', label: 'Barbeiro' },
  { id: 'horario', label: 'Horário' },
  { id: 'dados', label: 'Seus dados' },
  { id: 'revisao', label: 'Revisão' },
] as const;

const detailsSchema = z.object({
  name: z.string().trim().min(2, 'Digite seu nome.').max(80, 'Nome muito longo.'),
  phone: z.string().refine(isValidBrPhone, 'Confira o número com DDD, ex.: (11) 91234-5678.'),
  email: z.union([z.literal(''), z.string().trim().email('E-mail inválido.')]),
});

export default function Booking() {
  useDocumentTitle('Agendar');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { draft, update, reset } = useDraft();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [booking, setBooking] = useState<BookingT | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Deep links from service/professional CTAs preselect choices and skip ahead.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const svc = params.get('servico');
    const pro = params.get('barbeiro');
    const dia = params.get('dia');
    const hora = params.get('hora');
    // Live board: service + day + time chosen on the home page → straight to the details step.
    if (svc && serviceById(svc) && dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) && hora && /^\d{2}:\d{2}$/.test(hora)) {
      update({ serviceIds: [svc], proId: pro && proById(pro) ? pro : 'any', day: dia, time: hora });
      setStep(3);
      return;
    }
    // Comanda: services already picked on the home page.
    if (params.get('de') === 'comanda' && draft.serviceIds.length) {
      setStep(1);
      return;
    }
    const patch: Partial<typeof draft> = {};
    if (svc && serviceById(svc)) patch.serviceIds = [svc];
    if (pro && proById(pro)) patch.proId = pro;
    if (Object.keys(patch).length) {
      update({ ...patch, time: null });
      const ids = patch.serviceIds ?? draft.serviceIds;
      if (ids.length && patch.proId && eligiblePros(ids).some((p) => p.id === patch.proId)) setStep(2);
      else if (ids.length && !patch.proId) setStep(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Professional chosen first (from a barber card) but with incompatible services → clear it.
  useEffect(() => {
    if (draft.proId && draft.proId !== 'any' && draft.serviceIds.length && !eligiblePros(draft.serviceIds).some((p) => p.id === draft.proId)) {
      update({ proId: null });
    }
  }, [draft.serviceIds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    track('booking_step_view', { step: booking ? 'confirmado' : steps[step].id });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.getElementById('step-title')?.focus({ preventScroll: true }));
  }, [step, booking]);

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setNotice(null);
    setStep(to);
  };

  const canContinue = [
    draft.serviceIds.length > 0,
    !!draft.proId,
    !!draft.day && !!draft.time,
    true,
    true,
  ][step];

  const next = async () => {
    if (step === 3) {
      const r = detailsSchema.safeParse({ name: draft.name, phone: draft.phone, email: draft.email });
      if (!r.success) {
        const e: FieldErrors = {};
        for (const issue of r.error.issues) e[issue.path[0] as keyof FieldErrors] ??= issue.message;
        setErrors(e);
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      setErrors({});
    }
    if (step < 4) return go(step + 1);
    if (!accepted) return setAcceptError(true);
    if (honeypot.current?.value) return; // bot
    setSubmitting(true);
    setNotice(null);
    try {
      const b = await bookingApi.create({
        idempotencyKey: draft.idempotencyKey,
        serviceIds: draft.serviceIds,
        proId: draft.proId ?? 'any',
        day: draft.day!,
        time: draft.time!,
        customer: { name: draft.name, phone: draft.phone, email: draft.email || undefined, notes: draft.notes || undefined },
      });
      track('booking_confirmed', { services: draft.serviceIds.length });
      notifyScheduleChanged();
      navigator.vibrate?.(30);
      setBooking(b);
      reset();
    } catch (e) {
      const code = e instanceof BookingError ? e.code : 'network';
      if (code === 'slot_taken') {
        update({ time: null, idempotencyKey: crypto.randomUUID?.() ?? String(Math.random()) });
        setRefreshKey((k) => k + 1);
        go(2);
        setNotice('Esse horário acabou de ser reservado por outra pessoa. Escolha outro, por favor.');
      } else if (code === 'invalid') {
        go(3);
        setNotice('Confira seus dados e tente de novo.');
      } else {
        setNotice('Sem conexão com o servidor. Sua reserva ainda NÃO foi feita. Tente de novo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => (step === 0 ? navigate(-1) : go(step - 1));
  const sum = summarize(draft.serviceIds);
  const progress = booking ? 1 : (step + 1) / steps.length;

  return (
    <div className="relative min-h-[100svh]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0">
        <img src={asset('media/end-portrait.webp')} alt="" className="h-full w-full object-cover opacity-25 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/95 to-ink" />
      </div>

      <header className="sticky top-0 z-30 border-b hairline bg-ink/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-5">
          {!booking ? (
            <button onClick={back} className="grid h-11 w-11 place-items-center rounded-full border hairline" aria-label={step === 0 ? 'Sair do agendamento' : 'Voltar ao passo anterior'}>
              <Icon name="arrowLeft" />
            </button>
          ) : (
            <span className="h-11 w-11" />
          )}
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted">{booking ? 'Pronto' : `Passo ${step + 1} de ${steps.length}`}</p>
            <p className="font-display text-lg italic">{booking ? 'Confirmação' : steps[step].label}</p>
          </div>
          <button onClick={() => navigate('/')} className="grid h-11 w-11 place-items-center rounded-full border hairline" aria-label="Fechar e voltar ao início">
            <Icon name="close" />
          </button>
        </div>
        <div className="h-[2px] bg-ivory/10">
          <motion.div className="h-full origin-left bg-brass" animate={{ scaleX: progress }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </header>

      <main id="conteudo" className="relative mx-auto max-w-2xl px-5 pb-40 pt-8">
        {notice && (
          <div role="alert" className="mb-6 rounded-2xl border border-danger/50 bg-danger/10 px-4 py-3 text-[14px] text-ivory">
            {notice}
          </div>
        )}
        {bookingApi.mode === 'demo' && !booking && step === 0 && (
          <p className="mb-6 rounded-2xl border border-brass/30 bg-brass/10 px-4 py-3 text-[13px] text-brass-light">
            Modo demonstração: as reservas ficam salvas apenas neste aparelho até a agenda online ser conectada.
          </p>
        )}

        {booking ? (
          <Success booking={booking} />
        ) : (
          <StepTransition stepKey={steps[step].id} dir={dir}>
            {step === 0 && <ServicesStep draft={draft} update={update} />}
            {step === 1 && <ProStep draft={draft} update={update} />}
            {step === 2 && <TimeStep draft={draft} update={update} refreshKey={refreshKey} onSlotLost={(t) => setNotice(`O horário das ${t} acabou de ser ocupado ou bloqueado. Escolha outro, por favor.`)} />}
            {step === 3 && <DetailsStep draft={draft} update={(p) => (setErrors({}), update(p))} errors={errors} />}
            {step === 4 && <ReviewStep draft={draft} update={update} accepted={accepted} setAccepted={(v) => (setAccepted(v), setAcceptError(false))} acceptError={acceptError} />}
          </StepTransition>
        )}
        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      </main>

      {!booking && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t hairline bg-ink/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3.5">
            <div className="min-w-0 flex-1" aria-live="polite">
              {sum.services.length ? (
                <>
                  <p className="font-display text-xl leading-none text-brass-light">{formatPrice(sum.priceCents)}</p>
                  <p className="mt-1 truncate text-[12px] text-muted">
                    {sum.services.length} {sum.services.length === 1 ? 'serviço' : 'serviços'} · {formatDuration(sum.durationMin)}
                    {draft.time && step >= 2 ? ` · ${draft.time}` : ''}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-muted">Nenhum serviço escolhido</p>
              )}
            </div>
            <button
              onClick={next}
              disabled={!canContinue || submitting}
              className="inline-flex min-h-14 items-center gap-2 rounded-full bg-brass px-6 text-[15px] font-semibold text-ink shadow-[0_10px_30px_-12px_rgb(var(--brass)/0.7)] transition-[transform,opacity] active:scale-[0.97] disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" /> Confirmando…
                </>
              ) : step === 4 ? (
                <>Confirmar agendamento</>
              ) : (
                <>
                  Continuar <Icon name="arrowRight" className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

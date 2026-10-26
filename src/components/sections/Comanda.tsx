import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { summarize } from '@/booking/availability';
import { useDraft } from '@/booking/draft';
import { formatDuration, formatPrice } from '@/lib/format';
import { track } from '@/lib/analytics';
import { Icon } from '../ui/Icon';

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: site.timeZone });

/** The barbershop order slip: what the visitor picked, totals, and a direct path to booking. */
export function Comanda({ className = '' }: { className?: string }) {
  const { draft, update } = useDraft();
  const { services: items, durationMin, priceCents } = summarize(draft.serviceIds);
  const remove = (id: string) => update({ serviceIds: draft.serviceIds.filter((x) => x !== id), time: null });

  return (
    <div className={`comanda text-ink ${className}`}>
      <div className="comanda-paper bg-ivory px-6 pb-8 pt-9">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/25 pb-3">
          <p className="font-display text-[1.7rem] italic leading-none">Comanda</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
            {site.shortName} · {dateFmt.format(new Date()).replace('.', '')}
          </p>
        </div>

        <ul aria-live="polite" aria-label="Serviços na comanda" className="min-h-[4.5rem] py-3">
          <AnimatePresence initial={false}>
            {items.map((s) => (
              <motion.li key={s.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="flex items-baseline gap-2 py-1.5 text-[14.5px]">
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-ink/35" />
                  <span className="tabular-nums">{formatPrice(s.priceCents)}</span>
                  <button onClick={() => remove(s.id)} className="-my-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label={`Tirar ${s.name} da comanda`}>
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {!items.length && (
            <li className="py-2 text-[14px] leading-relaxed text-ink/60">
              Toque em <span className="inline-grid h-5 w-5 place-items-center rounded-full border border-ink/40 align-[-4px]"><Icon name="plus" className="h-3 w-3" /></span> nos serviços para montar seu atendimento.
            </li>
          )}
        </ul>

        <div className="flex items-baseline justify-between border-t border-dashed border-ink/25 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">Total{durationMin ? ` · ${formatDuration(durationMin)}` : ''}</span>
          <span className="font-display text-[2rem] leading-none tabular-nums">{formatPrice(priceCents)}</span>
        </div>

        {items.length > 0 ? (
          <>
            <Link
              to="/agendar?de=comanda"
              onClick={() => track('cta_book_click', { from: 'comanda', services: items.length })}
              className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-semibold text-ivory transition-transform active:scale-[0.97]"
            >
              Escolher horário <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <button onClick={() => update({ serviceIds: [], time: null })} className="mt-2 min-h-10 w-full text-[12px] text-ink/55 underline underline-offset-2 hover:text-ink">
              Limpar comanda
            </button>
          </>
        ) : (
          <p className="mt-6 text-center text-[12px] text-ink/50">Pagamento na barbearia, depois do atendimento.</p>
        )}
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { categories, serviceById, services, type ServiceCategory } from '@/config/catalog';
import { site } from '@/config/site';
import { useDraft } from '@/booking/draft';
import { toggleService } from '@/booking/selection';
import { formatDuration, formatPrice } from '@/lib/format';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Icon } from '../ui/Icon';
import { Comanda } from './Comanda';

const ease = [0.16, 1, 0.3, 1] as const;

export function Services() {
  const [filter, setFilter] = useState<ServiceCategory | 'all'>('all');
  const [preview, setPreview] = useState(services[0].id);
  const { draft, update } = useDraft();
  const list = services.filter((s) => filter === 'all' || s.category === filter);
  const previewService = serviceById(preview);
  const previewImage = previewService?.image ?? 'ritual-bancada';

  const toggle = (id: string) => {
    update({ serviceIds: toggleService(draft.serviceIds, id), time: null });
    setPreview(id);
    navigator.vibrate?.(8);
  };

  return (
    <section id="servicos" aria-labelledby="servicos-title" className="relative z-10 scroll-mt-20 rounded-[2rem] slab py-20 md:rounded-[3rem] md:py-28">
      <div className="container-x">
        <div id="servicos-title">
          <SectionHeading
            chapter="III"
            label="Serviços"
            lines={['O menu', <em key="e" className="brass-text">da casa.</em>]}
            intro="Monte sua comanda: toque em + nos serviços que quiser. Tempo e valor somam na hora, e você agenda tudo de uma vez."
          />
        </div>

        <div role="group" aria-label="Filtrar serviços" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {[{ id: 'all' as const, label: 'Todos' }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-pressed={filter === c.id}
              className={`min-h-11 shrink-0 rounded-full border px-5 text-[13px] font-semibold transition-colors ${filter === c.id ? 'border-brass bg-brass text-ink' : 'hairline text-ivory/80 hover:border-brass/50'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <ul className="border-t hairline">
            <AnimatePresence initial={false}>
              {list.map((s, i) => {
                const on = draft.serviceIds.includes(s.id);
                return (
                  <motion.li key={s.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }} className="border-b hairline">
                    <button
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(s.id)}
                      onMouseEnter={() => setPreview(s.id)}
                      onFocus={() => setPreview(s.id)}
                      className="group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-4 text-left sm:grid-cols-[4rem_1fr_auto] md:py-5"
                    >
                      {s.image ? (
                        <SmartImage id={s.image} alt="" sizes="64px" ratio="4 / 5" focal="50% 30%" className={`rounded-xl transition-[box-shadow] duration-300 ${on ? 'shadow-[0_0_0_2px_rgb(var(--brass))]' : ''}`} />
                      ) : (
                        <span className={`grid aspect-[4/5] place-items-center rounded-xl border font-display text-lg italic text-brass transition-colors ${on ? 'border-brass' : 'hairline'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}

                      <span className="min-w-0">
                        <span className="block font-display text-[1.4rem] leading-tight transition-transform duration-500 ease-expo group-hover:translate-x-1 md:text-[1.75rem]">{s.name}</span>
                        <span className="mt-1 block text-[13px] text-ivory/75 sm:hidden">
                          {formatDuration(s.durationMin)} · <span className="text-brass-light">{formatPrice(s.priceCents)}</span>
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-muted">{s.description}</span>
                        {s.includes && <span className="mt-1 block text-[12px] text-brass/90">Inclui {s.includes.map((id) => serviceById(id)?.name).join(' + ')}</span>}
                      </span>

                      <span className="flex items-center gap-4">
                        <span className="hidden text-right sm:block">
                          <span className="block font-display text-2xl tabular-nums text-brass-light">{formatPrice(s.priceCents)}</span>
                          <span className="block text-[12px] text-muted">{formatDuration(s.durationMin)}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`grid h-11 w-11 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 ${on ? 'border-brass bg-brass text-ink' : 'hairline text-ivory group-hover:border-brass/60'}`}
                        >
                          <Icon name={on ? 'check' : 'plus'} className="h-[18px] w-[18px]" strokeWidth={on ? 2.2 : 1.5} />
                        </span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <aside aria-label="Sua comanda" className="relative">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <div className="relative hidden overflow-hidden rounded-[1.75rem] border hairline lg:block">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={previewImage} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease }}>
                    <SmartImage id={previewImage} alt={previewService?.name ?? ''} sizes="36vw" ratio="16 / 11" focal="50% 30%" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
                  <p className="font-display text-xl italic">{previewService?.name}</p>
                </div>
              </div>
              <Comanda />
            </div>
          </aside>
        </div>
        {site.demo && <p className="mt-6 text-[12px] text-muted/80">Valores e serviços de demonstração.</p>}
      </div>
    </section>
  );
}

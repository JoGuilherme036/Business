import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { styles } from '@/config/content';
import { site } from '@/config/site';
import { whatsappLink } from '@/lib/whatsapp';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';

// Asymmetric layout: spans vary so the grid never reads as a template.
const layout = ['row-span-2', '', '', 'row-span-2', '', ''];

export function Styles() {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section id="estilos" aria-labelledby="estilos-title" className="relative z-10 scroll-mt-20 bg-ink pb-24 pt-4 md:pb-32">
      <div className="container-x" id="estilos-title">
        <SectionHeading chapter="VI" label="Estilos" lines={['Do fade', <em key="e" className="brass-text">ao clássico.</em>]} intro="Alguns dos estilos que fazemos. Toque em uma foto para ver em tela cheia e pedir o seu." />
      </div>
      <div className="container-x mt-12 grid auto-rows-[44vw] grid-cols-2 gap-3 sm:auto-rows-[34vw] md:auto-rows-[22vw] md:grid-cols-3 md:gap-5 lg:auto-rows-[18rem]">
        {styles.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 0.06} className={`${layout[i]} h-full`}>
            <button onClick={() => setIndex(i)} className="group relative block h-full w-full overflow-hidden rounded-2xl border hairline text-left md:rounded-3xl" aria-label={`Ampliar: ${s.title}`}>
              <SmartImage id={s.id} alt={s.title} sizes="(min-width: 768px) 33vw, 50vw" className="h-full !aspect-auto" focal="50% 30%" imgClassName="transition-transform duration-[1.2s] ease-expo group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-brass-light">{s.tag}</span>
                <span className="mt-1 block font-display text-lg italic leading-tight md:text-2xl">{s.title}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      {site.demo && <p className="container-x mt-5 text-[12px] text-muted/80">Imagens ilustrativas de estilos. Substitua por trabalhos reais da casa.</p>}
      <Lightbox index={index} onChange={setIndex} />
    </section>
  );
}

function Lightbox({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0);
  const n = styles.length;
  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onChange((index + d + n) % n);
    },
    [index, n, onChange],
  );

  useEffect(() => {
    if (index === null) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index === null, go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
    else if (info.offset.y > 120) onChange(null);
  };

  const item = index !== null ? styles[index] : null;
  return (
    <AnimatePresence>
      {item && (
        <motion.div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-50 flex flex-col bg-ink/97" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="container-x flex h-16 items-center justify-between pt-[env(safe-area-inset-top)]">
            <span className="text-[13px] tabular-nums text-muted" aria-live="polite">
              {String(index! + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <button ref={closeRef} onClick={() => onChange(null)} className="grid h-12 w-12 place-items-center rounded-full border hairline" aria-label="Fechar">
              <Icon name="close" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={item.id}
                custom={dir}
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                initial={{ opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md cursor-grab touch-none active:cursor-grabbing"
              >
                <SmartImage id={item.id} alt={item.title} sizes="(min-width: 768px) 28rem, 92vw" className="rounded-3xl" imgClassName="pointer-events-none" />
              </motion.div>
            </AnimatePresence>
            <button onClick={() => go(-1)} className="absolute left-4 hidden h-12 w-12 place-items-center rounded-full border hairline bg-ink/60 md:grid" aria-label="Anterior">
              <Icon name="arrowLeft" />
            </button>
            <button onClick={() => go(1)} className="absolute right-4 hidden h-12 w-12 place-items-center rounded-full border hairline bg-ink/60 md:grid" aria-label="Próxima">
              <Icon name="arrowRight" />
            </button>
          </div>
          <div className="container-x flex items-center justify-between gap-3 pb-[max(env(safe-area-inset-bottom),20px)] pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-brass-light">{item.tag}</p>
              <p className="font-display text-2xl italic">{item.title}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full border hairline md:hidden" aria-label="Anterior">
                <Icon name="arrowLeft" />
              </button>
              <a href={whatsappLink(`Olá! Quero um corte no estilo *${item.title}*. Tem horário?`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brass px-5 text-[14px] font-semibold text-ink">
                <Icon name="whatsapp" className="h-[18px] w-[18px]" /> Quero esse
              </a>
              <button onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full border hairline md:hidden" aria-label="Próxima">
                <Icon name="arrowRight" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

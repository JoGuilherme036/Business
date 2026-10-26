import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ritualSteps } from '@/config/content';
import { useMediaQuery } from '@/hooks/useMisc';
import { useMotionPref } from '@/hooks/useMotionPref';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';

function StepCard({ step, className = '' }: { step: (typeof ritualSteps)[number]; className?: string }) {
  return (
    <article className={`group relative overflow-hidden rounded-[1.75rem] border hairline bg-ink-2 ${className}`}>
      <SmartImage id={step.image} alt={step.title} sizes="(min-width: 768px) 40vw, 85vw" ratio="4 / 5" focal="50% 40%" imgClassName="transition-transform duration-[1.2s] ease-expo group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <span className="display brass-text text-6xl italic md:text-7xl">{step.n}</span>
        <h3 className="mt-2 font-display text-3xl">{step.title}</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ivory/75">{step.text}</p>
      </div>
    </article>
  );
}

/** Desktop: vertical scroll drives a pinned horizontal track. Mobile/reduced motion: native snap carousel. */
export function Ritual() {
  const desktop = useMediaQuery('(min-width: 768px)');
  const { reduced } = useMotionPref();
  return desktop && !reduced ? <PinnedRitual /> : <SnapRitual />;
}

function PinnedRitual() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '-58%']);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);
  return (
    <section id="ritual" ref={ref} aria-labelledby="ritual-title" className="relative z-10 h-[300vh] scroll-mt-20 bg-ink">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-x" id="ritual-title">
          <SectionHeading chapter="IV" label="O ritual" lines={['Quatro tempos,', <em key="e" className="brass-text">nenhuma pressa.</em>]} />
        </div>
        <motion.div style={{ x }} className="mt-10 flex gap-6 pl-[max(3rem,calc((100vw-1320px)/2+3rem))]">
          {ritualSteps.map((s) => (
            <StepCard key={s.n} step={s} className="w-[min(30rem,38vw)] shrink-0" />
          ))}
        </motion.div>
        <div className="container-x mt-8">
          <div className="h-px w-full bg-ivory/10">
            <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-brass" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SnapRitual() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (card) setActive(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };
  return (
    <section id="ritual" aria-labelledby="ritual-title" className="relative z-10 scroll-mt-20 bg-ink py-20">
      <div className="container-x" id="ritual-title">
        <SectionHeading chapter="IV" label="O ritual" lines={['Quatro tempos,', <em key="e" className="brass-text">nenhuma pressa.</em>]} />
      </div>
      <div ref={track} onScroll={onScroll} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2" aria-label="Etapas do ritual" tabIndex={0}>
        {ritualSteps.map((s) => (
          <StepCard key={s.n} step={s} className="w-[82%] max-w-sm shrink-0 snap-center" />
        ))}
      </div>
      <div className="container-x mt-6 flex items-center gap-2" aria-hidden="true">
        {ritualSteps.map((s, i) => (
          <span key={s.n} className={`h-[3px] rounded-full transition-all duration-500 ${i === active ? 'w-10 bg-brass' : 'w-4 bg-ivory/20'}`} />
        ))}
        <span className="ml-auto text-[12px] tabular-nums text-muted">
          {String(active + 1).padStart(2, '0')} / {String(ritualSteps.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}

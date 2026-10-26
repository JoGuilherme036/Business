import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { amenities } from '@/config/content';
import { useMotionPref } from '@/hooks/useMotionPref';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Reveal } from '../ui/Reveal';

/** Gallery of the space: a parallax wide shot, a portrait detail and the amenities list. */
export function Space() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-7%', '7%']);

  return (
    <section aria-labelledby="espaco-title" className="relative z-10 rounded-xl slab py-20 md:rounded-2xl md:py-28">
      <div className="container-x" id="espaco-title">
        <SectionHeading chapter="V" label="O espaço" lines={['Um ambiente', <em key="e" className="accent-text">à sua altura.</em>]} intro="Linhas retas, luz precisa e materiais escuros. Tudo pensado para você desacelerar enquanto cuidamos do resultado." />
      </div>

      <div className="container-x mt-12 grid gap-4 md:grid-cols-12 md:gap-6">
        <Reveal className="md:col-span-8">
          <div ref={ref} className="h-full overflow-hidden rounded-lg border hairline">
            <motion.div style={{ y, scale: 1.14 }} className="h-full">
              <SmartImage id="salao-barbeiro" alt="Salão da barbearia com cadeiras pretas e iluminação em LED" sizes="(min-width: 768px) 66vw, 100vw" ratio="16 / 10" className="h-full md:!aspect-auto" />
            </motion.div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="md:col-span-4">
          <div className="relative h-full overflow-hidden rounded-lg border hairline">
            <SmartImage id="lavagem" alt="Cliente recebendo lavagem e massagem capilar no lavatório" sizes="(min-width: 768px) 33vw, 100vw" ratio="4 / 5" className="h-full md:!aspect-auto" focal="50% 40%" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-xl font-semibold leading-tight tracking-[-0.02em]">Lavagem e massagem capilar</p>
          </div>
        </Reveal>

        {amenities.map((a, i) => (
          <Reveal key={a.title} delay={0.05 + i * 0.06} className="md:col-span-4">
            <div className="h-full rounded-lg glass p-6 md:p-7">
              <span className="font-display text-sm italic text-accent-light">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

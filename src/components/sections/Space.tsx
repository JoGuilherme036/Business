import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { useMotionPref } from '@/hooks/useMotionPref';
import { SectionHeading } from '../ui/SectionHeading';
import { SmartImage } from '../ui/SmartImage';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';

// Points on the chair photo (poltrona-vertical) shown in a 4:5 frame with focal "50% 60%".
const details = [
  { id: 'encosto', x: 35, y: 31, title: 'Encosto em canais', text: 'Couro com costura vertical e apoio de cabeça regulável para a navalha.' },
  { id: 'bracos', x: 70, y: 40, title: 'Braços cromados', text: 'Apoio firme para relaxar durante a toalha quente.' },
  { id: 'base', x: 40, y: 77, title: 'Base hidráulica', text: 'Sobe, desce e gira para o barbeiro trabalhar no ângulo certo.' },
  { id: 'apoio', x: 74, y: 81, title: 'Apoio de pés', text: 'Plataforma em aço para a postura reclinada da barba.' },
];

function ChairDetails() {
  const [active, setActive] = useState(details[0].id);
  const current = details.find((d) => d.id === active)!;
  return (
    <div className="relative h-full overflow-hidden rounded-[1.75rem] border hairline">
      <SmartImage id="poltrona-vertical" alt="Poltrona de barbeiro em couro marrom com base cromada" sizes="(min-width: 768px) 40vw, 100vw" ratio="4 / 5" focal="50% 60%" className="h-full md:!aspect-auto" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      <p className="eyebrow absolute left-5 top-5">A poltrona · toque nos pontos</p>
      {details.map((d) => {
        const on = d.id === active;
        return (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            aria-pressed={on}
            aria-label={d.title}
            className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {!on && <span className="absolute h-6 w-6 animate-ping rounded-full bg-brass/40" />}
            <span className={`relative grid h-6 w-6 place-items-center rounded-full border-2 transition-colors ${on ? 'border-ivory bg-brass' : 'border-brass bg-ink/70'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-ink' : 'bg-brass'}`} />
            </span>
          </button>
        );
      })}
      <div className="absolute inset-x-0 bottom-0 p-5" aria-live="polite">
        <motion.div key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="font-display text-2xl italic">{current.title}</p>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-ivory/80">{current.text}</p>
        </motion.div>
      </div>
    </div>
  );
}

export function Space() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%', '6%']);

  return (
    <section aria-labelledby="espaco-title" className="relative z-10 rounded-[2rem] slab py-20 md:rounded-[3rem] md:py-28">
      <div className="container-x" id="espaco-title">
        <SectionHeading chapter="VII" label="O espaço" lines={['Um ateliê', <em key="e" className="brass-text">para a noite.</em>]} intro="Mármore escuro, couro, latão e luz baixa. Tudo pensado para você desligar por uma hora." />
      </div>

      <div className="container-x mt-12 grid gap-4 md:grid-cols-12 md:gap-6">
        <Reveal className="md:col-span-7">
          <div ref={ref} className="h-full overflow-hidden rounded-[1.75rem] border hairline">
            <motion.div style={{ y, scale: 1.12 }} className="h-full">
              <SmartImage id="ambiente-principal" alt="Salão da barbearia com cadeiras de couro e luz âmbar" sizes="(min-width: 768px) 58vw, 100vw" ratio="16 / 10" className="h-full md:!aspect-auto" />
            </motion.div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="md:col-span-5">
          <ChairDetails />
        </Reveal>

        <Reveal delay={0.05} className="md:col-span-5">
          <div className="grid h-full grid-cols-[1fr_1.1fr] overflow-hidden rounded-[1.75rem] border hairline bg-ink">
            <SmartImage id="produto-pomada" alt="Pote de pomada capilar sobre pedra escura" sizes="(min-width: 768px) 20vw, 45vw" className="h-full !aspect-auto" />
            <div className="flex flex-col justify-between gap-4 p-5">
              <div>
                <p className="eyebrow">Na bancada</p>
                <p className="mt-2 font-display text-2xl italic leading-tight">Pomada matte da casa</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">Fixação média, efeito seco. A mesma que usamos na finalização.</p>
              </div>
              <a href={whatsappLink(waMessages.product('a pomada matte da casa'))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-brass-light">
                <Icon name="whatsapp" className="h-4 w-4" /> Perguntar disponibilidade
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <div className="overflow-hidden rounded-[1.75rem] border hairline">
            <SmartImage id="ritual-bancada" alt="Bancada com pincel, tesoura, pente e toalha" sizes="(min-width: 768px) 58vw, 100vw" ratio="16 / 9" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

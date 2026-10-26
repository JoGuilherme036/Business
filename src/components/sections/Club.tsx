import { lazy, Suspense, useRef } from 'react';
import { clubPlans } from '@/config/content';
import { site } from '@/config/site';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { useNearViewport } from '@/hooks/useMisc';
import { useMotionPref } from '@/hooks/useMotionPref';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';
import { MedallionFallback } from '../three/MedallionFallback';

const Medallion = lazy(() => import('../three/Medallion'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Club() {
  const stage = useRef<HTMLDivElement>(null);
  const near = useNearViewport(stage, '200px');
  const mounted = useRef(false);
  if (near) mounted.current = true; // mount once, then only pause when off-screen
  const { reduced } = useMotionPref();
  const webgl = useRef<boolean | null>(null);
  if (webgl.current === null && typeof document !== 'undefined') webgl.current = hasWebGL();

  return (
    <section aria-labelledby="clube-title" className="relative z-10 overflow-hidden py-24 md:py-32">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div ref={stage} className="relative mx-auto aspect-square w-full max-w-[30rem]">
          <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(var(--brass)/0.28),transparent_65%)] blur-2xl" />
          {mounted.current && webgl.current ? (
            <Suspense fallback={<MedallionFallback />}>
              <Medallion reduced={reduced} active={near} />
            </Suspense>
          ) : (
            <MedallionFallback />
          )}
        </div>

        <div id="clube-title">
          <SectionHeading chapter="VIII" label="Clube RB" lines={['Sua cadeira,', <em key="e" className="brass-text">todo mês.</em>]} intro="Assinatura para quem não abre mão do corte em dia. Prioridade na agenda e benefícios da casa." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {clubPlans.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <article className={`relative flex h-full flex-col rounded-3xl border p-6 ${'highlight' in p && p.highlight ? 'border-brass/60 bg-gradient-to-b from-brass/15 to-transparent' : 'hairline bg-ink/60'}`}>
                  {'highlight' in p && p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brass px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Mais escolhido</span>}
                  <h3 className="font-display text-3xl italic">{p.name}</h3>
                  <p className="mt-1 font-display text-xl text-brass-light">{p.price}</p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ivory/85">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex gap-2.5">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <a href={whatsappLink(waMessages.plan(p.name))} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brass/50 text-[14px] font-semibold text-brass-light transition-colors hover:bg-brass hover:text-ink">
                    <Icon name="whatsapp" className="h-[18px] w-[18px]" /> Quero assinar
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted/80">*Uso justo: 1 corte por semana.{site.demo ? ' Planos e valores ilustrativos.' : ''}</p>
        </div>
      </div>
    </section>
  );
}

import { clubPlans } from '@/config/content';
import { site } from '@/config/site';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';

/** Subscription plans. The recommended plan is the one inverted (white card) so it reads first. */
export function Club() {
  return (
    <section aria-labelledby="clube-title" className="relative z-10 overflow-hidden border-t hairline py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
        <div id="clube-title">
          <SectionHeading
            chapter="VI"
            label="Business Club"
            lines={['Sua imagem,', <em key="e">todo mês.</em>]}
            intro="Assinatura para quem não abre mão do corte em dia. Prioridade na agenda e benefícios da casa."
          />
          <p aria-hidden="true" className="mt-12 hidden select-none font-display text-[7.5rem] font-black uppercase leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.14)] lg:block" style={{ fontStretch: '125%' }}>
            Club
          </p>
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {clubPlans.map((p, i) => {
              const hl = 'highlight' in p && p.highlight;
              return (
                <Reveal key={p.id} delay={i * 0.08} className="h-full">
                  <article className={`relative flex h-full flex-col rounded-lg border p-7 ${hl ? 'border-ivory bg-ivory text-ink' : 'hairline bg-ink-2'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[10.5px] font-semibold uppercase tracking-[0.3em] ${hl ? 'text-ink/60' : 'text-ivory/55'}`}>Plano</p>
                      {hl && <span className="rounded-[3px] bg-ink px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-ivory">Mais escolhido</span>}
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-bold uppercase tracking-[-0.01em]">{p.name}</h3>
                    <p className={`mt-2 font-display text-xl font-medium tabular-nums ${hl ? 'text-ink/75' : 'text-ivory/75'}`}>{p.price}</p>
                    <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 text-sm ${hl ? 'border-ink/15' : 'border-ivory/10 text-ivory/85'}`}>
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex gap-2.5">
                          <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={whatsappLink(waMessages.plan(p.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${hl ? 'bg-ink text-ivory hover:bg-ink-3' : 'border border-ivory/25 hover:bg-ivory hover:text-ink'}`}
                    >
                      <Icon name="whatsapp" className="h-[18px] w-[18px]" /> Quero assinar
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-4 text-[12px] text-muted/80">*Uso justo: 1 corte por semana.{site.demo ? ' Planos e valores ilustrativos.' : ''}</p>
        </div>
      </div>
    </section>
  );
}

import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { track } from '@/lib/analytics';
import { asset } from '@/lib/asset';
import { LinkButton, ExternalButton } from '../ui/Button';
import { MaskLines, Reveal } from '../ui/Reveal';

/** Closing scene: the film's last frame (the tools on the counter) as a still, bookending the intro. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative z-10 flex min-h-[88svh] items-end overflow-hidden pb-20 pt-32 md:items-center md:pb-24">
      <picture aria-hidden="true">
        <source media="(min-aspect-ratio: 1/1)" srcSet={asset('media/end-landscape.webp')} />
        <img src={asset('media/end-portrait.webp')} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30 md:bg-gradient-to-r md:from-ink md:via-ink/75 md:to-ink/10" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="font-display text-[13px] normal-case italic tracking-normal text-brass-light">XI</span>
            <span className="h-px w-10 bg-brass/50" />
            Epílogo
          </p>
        </Reveal>
        <MaskLines as="h2" lines={['Sua cadeira', <em key="e" className="brass-text">está pronta.</em>]} className="display mt-5 text-[clamp(3.2rem,14vw,9rem)] [text-shadow:0_6px_40px_rgb(0_0_0/0.7)]" />
        <Reveal delay={0.15} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/agendar" size="lg" iconRight="arrowRight" onClick={() => track('cta_book_click', { from: 'final' })}>
            Agendar agora
          </LinkButton>
          <ExternalButton href={whatsappLink(waMessages.general())} variant="ghost" size="lg" icon="whatsapp" className="!bg-ink/60" onClick={() => track('whatsapp_click', { from: 'final' })}>
            Falar no WhatsApp
          </ExternalButton>
        </Reveal>
      </div>
    </section>
  );
}

import { site } from '@/config/site';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';

/** Renders only when real, authorized reviews are configured in site.social.reviews. */
export function Reviews() {
  const reviews = site.social.reviews;
  if (!reviews.length) return null;
  return (
    <section aria-labelledby="reviews-title" className="relative z-10 bg-ink/95 py-24">
      <div className="container-x" id="reviews-title">
        <SectionHeading chapter="—" label="Quem senta, volta" lines={['Palavra', <em key="e" className="brass-text">de cliente.</em>]} />
        <div className="no-scrollbar mt-10 flex snap-x gap-4 overflow-x-auto">
          {reviews.map((r, i) => (
            <Reveal key={i} className="w-[85%] max-w-md shrink-0 snap-center">
              <figure className="h-full rounded-3xl border hairline bg-ink-2 p-6">
                <p className="text-brass" aria-label={`${r.rating} de 5 estrelas`}>{'★'.repeat(r.rating)}</p>
                <blockquote className="mt-4 font-display text-xl italic leading-snug">“{r.text}”</blockquote>
                <figcaption className="mt-4 text-sm text-muted">{r.author} · {r.source}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

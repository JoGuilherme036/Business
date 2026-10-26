import media from '@/data/media.json';
import { asset } from '@/lib/asset';

type MediaId = keyof typeof media;

type Props = {
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  focal?: string; // CSS object-position, e.g. "50% 30%"
  ratio?: string; // CSS aspect-ratio, defaults to the source ratio
};

/** Responsive image from the media manifest. Reserves space (no CLS) and falls back to a branded placeholder. */
export function SmartImage({ id, alt, sizes = '100vw', className = '', imgClassName = '', priority, focal = '50% 50%', ratio }: Props) {
  const m = media[id as MediaId];
  if (!m) return <ImagePlaceholder label={alt} className={className} ratio={ratio} />;
  const srcSet = m.widths.map((w) => `${asset(`media/img/${id}-${w}.webp`)} ${w}w`).join(', ');
  const fallback = asset(`media/img/${id}-${m.widths[Math.min(1, m.widths.length - 1)]}.webp`);
  return (
    <div className={`relative overflow-hidden bg-ink-2 ${className}`} style={{ aspectRatio: ratio ?? `${m.width} / ${m.height}` }}>
      <img
        src={fallback}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={m.width}
        height={m.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        style={{ objectPosition: focal }}
      />
    </div>
  );
}

export function ImagePlaceholder({ label, className = '', ratio = '4 / 5' }: { label: string; className?: string; ratio?: string }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden border hairline bg-[radial-gradient(120%_80%_at_30%_20%,rgb(var(--brass)/0.18),transparent_60%),linear-gradient(160deg,rgb(var(--ink-3)),rgb(var(--ink)))] ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label}
    >
      <span className="display text-6xl text-brass/50">RB</span>
    </div>
  );
}

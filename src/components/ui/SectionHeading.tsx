import type { ReactNode } from 'react';
import { MaskLines, Reveal } from './Reveal';

/** Chapter heading: numbered label over a thin rule, then the headline in the brand's expanded type. */
export function SectionHeading({ chapter, label, lines, intro, align = 'left', id }: { chapter: string; label: string; lines: ReactNode[]; intro?: string; align?: 'left' | 'center'; id?: string }) {
  return (
    <header className={`relative ${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      <Reveal>
        <p className={`eyebrow relative flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="font-display text-[11px] font-bold tracking-[0.2em] text-ivory">{chapter}</span>
          <span className="h-px w-10 bg-ivory/30" />
          {label}
        </p>
      </Reveal>
      <MaskLines lines={lines} className="display relative mt-5 text-[clamp(2rem,7.6vw,4.4rem)]" />
      {intro && (
        <Reveal delay={0.1}>
          <p id={id} className="relative mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            {intro}
          </p>
        </Reveal>
      )}
    </header>
  );
}

import type { ReactNode } from 'react';
import { MaskLines, Reveal } from './Reveal';

/** Chapter heading. A pendant-lamp cord and glow (the film's amber lamps) mark where each chapter starts. */
export function SectionHeading({ chapter, label, lines, intro, align = 'left', id }: { chapter: string; label: string; lines: ReactNode[]; intro?: string; align?: 'left' | 'center'; id?: string }) {
  return (
    <header className={`relative ${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      <span aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgb(var(--brass)/0.13),transparent)]" />
      <Reveal>
        <p className={`eyebrow relative flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <span aria-hidden="true" className="relative h-[7px] w-[7px] shrink-0 rounded-full bg-brass-light shadow-[0_0_14px_3px_rgb(var(--brass)/0.6)]">
            <span className="absolute bottom-full left-1/2 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-brass/60" />
          </span>
          <span className="font-display text-[13px] normal-case italic tracking-normal text-brass-light">{chapter}</span>
          <span className="h-px w-8 bg-brass/50" />
          {label}
        </p>
      </Reveal>
      <MaskLines lines={lines} className="display relative mt-5 text-[clamp(2.4rem,9vw,5.2rem)]" />
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

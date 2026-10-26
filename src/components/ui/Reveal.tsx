import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

/** Small rise + fade when the block enters the viewport. Content stays visible if JS/motion fails. */
export function Reveal({ children, delay = 0, className = '', y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Mask reveal for display headlines: each line slides up from behind its own clip. */
export function MaskLines({ lines, className = '', as: Tag = 'h2' }: { lines: ReactNode[]; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, delay: i * 0.08, ease } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** Words light up as the paragraph scrolls through the viewport. */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block pr-[0.25em]">
      {children}
    </motion.span>
  );
}

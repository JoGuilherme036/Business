import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { faq } from '@/config/content';
import { SectionHeading } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-labelledby="faq-title" className="relative z-10 rounded-b-[2rem] bg-ink-2 pb-24 pt-4 md:rounded-b-[3rem] md:pb-32">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div id="faq-title">
          <SectionHeading chapter="X" label="Dúvidas" lines={['Antes de', <em key="e" className="brass-text">sentar.</em>]} />
        </div>
        <ul className="border-t hairline">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b hairline">
                <h3>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="flex w-full items-center justify-between gap-6 py-5 text-left">
                    <span className="text-[17px] font-medium md:text-lg">{item.q}</span>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border hairline transition-transform duration-300 ${isOpen ? 'rotate-45 border-brass/60 text-brass' : ''}`}>
                      <Icon name="plus" className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="max-w-xl pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

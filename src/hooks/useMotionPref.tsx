import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// Reduced motion = system preference OR the visitor's own toggle in the footer.
type Pref = 'system' | 'reduced' | 'full';
type Ctx = { reduced: boolean; pref: Pref; setPref: (p: Pref) => void };

const MotionCtx = createContext<Ctx>({ reduced: false, pref: 'system', setPref: () => {} });
const KEY = 'rb.motion';

export function MotionPrefProvider({ children }: { children: ReactNode }) {
  const [system, setSystem] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [pref, setPrefState] = useState<Pref>(() => {
    try {
      return (localStorage.getItem(KEY) as Pref) || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSystem(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      pref,
      reduced: pref === 'reduced' || (pref === 'system' && system),
      setPref: (p) => {
        setPrefState(p);
        try {
          localStorage.setItem(KEY, p);
        } catch {
          /* ignore */
        }
      },
    }),
    [pref, system],
  );
  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}

export const useMotionPref = () => useContext(MotionCtx);

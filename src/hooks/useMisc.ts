import { useEffect, useState } from 'react';
import { openStatus, type OpenStatus } from '@/lib/hours';

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > px);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [px]);
  return past;
}

/** Re-evaluates the open/closed status every minute. */
export function useOpenStatus() {
  const [status, setStatus] = useState<OpenStatus>(() => openStatus());
  useEffect(() => {
    const id = setInterval(() => setStatus(openStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** True once the element has been near the viewport; used to lazy-mount heavy things. */
export function useNearViewport<T extends Element>(ref: React.RefObject<T>, margin = '300px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

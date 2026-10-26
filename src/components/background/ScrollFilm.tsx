import { useEffect, useRef, useState } from 'react';
import type { MotionValue } from 'framer-motion';
import frames from '@/data/frames.json';
import { useMotionPref } from '@/hooks/useMotionPref';
import { asset } from '@/lib/asset';

type SetName = keyof typeof frames;
type Frame = ImageBitmap | HTMLImageElement;

const pickSet = (): SetName => (window.innerWidth / window.innerHeight < 1 ? 'portrait' : 'landscape');
const frameUrl = (set: SetName, i: number) => asset(`media/frames/${set}/${String(i).padStart(3, '0')}.webp`);

const KEY_STEP = 8; // every 8th frame stays decoded, so a nearby frame is always ready
const WINDOW = 6; // frames decoded on each side of the scroll position
const MAX_DECODING = 3;

/** Coarse-to-fine order (0, 64, 32, 16, 48, …) so the whole film is scrubbable early and sharpens as it loads. */
function loadOrder(count: number, minStep: number) {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let step = 2 ** Math.floor(Math.log2(count)); step >= minStep; step /= 2) {
    for (let i = 0; i < count; i += step) if (!seen.has(i)) seen.add(i), order.push(i);
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

/**
 * Film scrubbed by a 0–1 progress value (the intro section's scroll), drawn on a canvas from a
 * light WebP sequence. Works in every browser, including iOS Safari and in-app browsers where
 * inline video won't load without a tap. Compressed frames are kept as small blobs; only the
 * frames around the scroll position are decoded (off the main thread), and two neighbours are
 * cross-faded so 72 frames read as continuous motion.
 */
export function ScrollFilm({ progress }: { progress: MotionValue<number> }) {
  const { reduced } = useMotionPref();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [set, setSet] = useState<SetName>(pickSet);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onResize = () => setSet(pickSet());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    const { count, width, height } = frames[set];
    canvas.width = width;
    canvas.height = height;
    setReady(false);

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lite = !!conn?.saveData || /(^|-)2g/.test(conn?.effectiveType ?? '');
    const queue = loadOrder(count, lite ? 2 : 1);
    const canBitmap = typeof createImageBitmap === 'function';

    const blobs: (Blob | null)[] = new Array(count).fill(null);
    const decoded = new Map<number, Frame>();
    const decoding = new Set<number>();
    let disposed = false;
    let target = progress.get();
    let current = target;
    let raf = 0;
    let drawnKey = '';

    const release = (f: Frame) => 'close' in f && f.close();

    const decode = (i: number) => {
      const blob = blobs[i];
      if (!blob || decoded.has(i) || decoding.has(i) || decoding.size >= MAX_DECODING) return;
      decoding.add(i);
      const done = (f: Frame | null) => {
        decoding.delete(i);
        if (disposed) return f && release(f);
        if (f) decoded.set(i, f);
        schedule();
        pump();
      };
      if (canBitmap) {
        createImageBitmap(blob).then(done, () => done(null));
      } else {
        const img = new Image();
        img.onload = () => done(img);
        img.onerror = () => done(null);
        img.src = URL.createObjectURL(blob);
      }
    };

    // Decode what the current position needs, drop what is far away.
    const pump = () => {
      const center = Math.round(current * (count - 1));
      for (let d = 0; d <= WINDOW; d++) {
        decode(center + d);
        decode(center - d);
      }
      for (let i = 0; i < count; i += KEY_STEP) decode(i);
      for (const [i, f] of decoded) {
        if (Math.abs(i - center) > WINDOW + 2 && i % KEY_STEP !== 0) {
          release(f);
          decoded.delete(i);
        }
      }
    };

    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (decoded.has(i - d)) return i - d;
        if (decoded.has(i + d)) return i + d;
      }
      return -1;
    };

    const draw = () => {
      const pos = current * (count - 1);
      const i0 = Math.floor(pos);
      const frac = pos - i0;
      const a = nearest(i0);
      if (a < 0) return;
      const exact = a === i0 && decoded.has(i0 + 1) && frac > 0.02;
      const key = exact ? `${i0}:${frac.toFixed(2)}` : `${a}`;
      if (key === drawnKey) return;
      ctx.globalAlpha = 1;
      ctx.drawImage(decoded.get(a)!, 0, 0, width, height);
      if (exact) {
        ctx.globalAlpha = frac;
        ctx.drawImage(decoded.get(i0 + 1)!, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }
      drawnKey = key;
      setReady(true);
    };

    const tick = () => {
      current += (target - current) * 0.22;
      if (Math.abs(target - current) < 0.0005) current = target;
      pump();
      draw();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const unsubscribe = progress.on('change', (v) => {
      target = Math.min(1, Math.max(0, v));
      schedule();
    });

    let cursor = 0;
    const loader = async () => {
      while (!disposed && cursor < queue.length) {
        const i = queue[cursor++];
        try {
          const res = await fetch(frameUrl(set, i));
          if (!res.ok) continue;
          blobs[i] = await res.blob();
        } catch {
          continue;
        }
        if (disposed) return;
        pump();
      }
    };
    Array.from({ length: 4 }, loader);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      unsubscribe();
      decoded.forEach(release);
      decoded.clear();
    };
  }, [set, reduced, progress]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-ink">
      <img src={asset(`media/poster-${set}.webp`)} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
      {!reduced && <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} />}
    </div>
  );
}

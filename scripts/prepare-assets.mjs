// Generates optimized media for the site.
// Usage: node scripts/prepare-assets.mjs <images-dir> <video-landscape.mp4> <video-portrait.mp4>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const [imagesDir, videoLandscape, videoPortrait] = process.argv.slice(2);
if (!imagesDir || !videoLandscape || !videoPortrait) {
  console.error('Usage: node scripts/prepare-assets.mjs <images-dir> <landscape.mp4> <portrait.mp4>');
  process.exit(1);
}

const out = resolve('public/media');

// Source file prefix -> media id. Source names come from the owner's export.
const IMAGE_MAP = {
  'Fade natural': 'servico-corte',
  'Aparar barba': 'servico-barba',
  'Retrato masculino': 'estilo-barba',
  'Cachos naturais': 'estilo-cachos',
  'Corte cl': 'estilo-classico',
  'Corte ondulado': 'estilo-ondulado',
  'Barbearia contempor': 'ambiente-principal',
  'Poltrona de barbeiro no': 'poltrona-horizontal',
  'Poltrona de barbeiro em': 'poltrona-vertical',
  'Pomada capilar': 'produto-pomada',
  'Ritual de toalha': 'ritual-toalha',
  'Ritual refinado': 'ritual-bancada',
};
const WIDTHS = [480, 800, 1200];
const FPS = 9; // 8 s film → 72 frames

async function images() {
  const dir = join(out, 'img');
  mkdirSync(dir, { recursive: true });
  const manifest = {};
  for (const file of readdirSync(imagesDir).filter((f) => f.endsWith('.png'))) {
    const key = Object.keys(IMAGE_MAP).find((k) => file.startsWith(k));
    if (!key) continue;
    const id = IMAGE_MAP[key];
    const src = sharp(join(imagesDir, file));
    const { width, height } = await src.metadata();
    const { dominant } = await src.stats();
    const widths = [...WIDTHS.filter((w) => w < width), ...(width < 1200 ? [width] : [])];
    for (const w of widths) {
      await sharp(join(imagesDir, file)).resize(w).webp({ quality: 72 }).toFile(join(dir, `${id}-${w}.webp`));
    }
    manifest[id] = {
      width,
      height,
      widths,
      color: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
    };
    console.log('image', id, widths.join(','));
  }
  writeFileSync(resolve('src/data/media.json'), JSON.stringify(manifest, null, 2) + '\n');
}

// Scroll-scrubbed film as a light image sequence: works in every browser, including iOS Safari
// and in-app browsers (Instagram, WhatsApp) where inline video does not load without a tap.
// The player decodes only the frames near the scroll position, so memory stays small.
async function frames(video, name, size, quality) {
  const [w, h] = size.split(':').map(Number);
  const tmp = join(out, `.tmp-${name}`);
  const dir = join(out, 'frames', name);
  rmSync(tmp, { recursive: true, force: true });
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  mkdirSync(dir, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-i', video, '-vf', `fps=${FPS},scale=${w}:${h}`, join(tmp, '%03d.png')]);
  const files = readdirSync(tmp).sort();
  for (const [i, f] of files.entries()) {
    await sharp(join(tmp, f)).webp({ quality }).toFile(join(dir, `${String(i).padStart(3, '0')}.webp`));
  }
  // First frame: instant paint (LCP) and reduced-motion still. Last frame: the epilogue background.
  await sharp(join(tmp, files[0])).webp({ quality: 70 }).toFile(join(out, `poster-${name}.webp`));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-sseof', '-0.1', '-i', video, '-vf', `scale=${(w * 4) / 3}:${(h * 4) / 3}`, '-frames:v', '1', '-update', '1', join(tmp, 'last.png')]);
  await sharp(join(tmp, 'last.png')).webp({ quality: 66 }).toFile(join(out, `end-${name}.webp`));
  rmSync(tmp, { recursive: true, force: true });
  console.log('frames', name, files.length);
  return { count: files.length, width: w, height: h };
}

await images();
rmSync(join(out, 'film'), { recursive: true, force: true });
const landscape = await frames(videoLandscape, 'landscape', '1280:720', 48);
const portrait = await frames(videoPortrait, 'portrait', '540:960', 50);
writeFileSync(resolve('src/data/frames.json'), JSON.stringify({ landscape, portrait }, null, 2) + '\n');

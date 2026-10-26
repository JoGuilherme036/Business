#!/usr/bin/env python3
"""Builds all site media from the owner's source files.

Usage: python3 scripts/build-assets.py <images-dir> <intro-video.mp4>

  <images-dir>      the 10 PNGs exported by the owner (file names end in -1.png … -10.png)
  <intro-video.mp4> the opening animation (16:9); it is scrubbed frame by frame with the scroll

Outputs (public/media, src/data):
  - img/<id>-<w>.webp + media.json     responsive photos and product crops
  - frames/{portrait,landscape}/NNN.webp + frames.json   intro film
  - poster-*.webp (first frame), end-*.webp (last frame), og-image.jpg
Requires Pillow and ffmpeg. MONO=1 converts the photos to black and white.
"""
import json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

src_dir, video = Path(sys.argv[1]), sys.argv[2]
OUT = Path('public/media')
DATA = Path('src/data')
MONO = os.environ.get('MONO') == '1'

def find(n):  # source files end with "-<n>.png"
    return next(p for p in src_dir.glob('*.png') if p.stem.endswith(f'-{n}'))

def load(path):
    im = Image.open(path).convert('RGB')
    if MONO:
        im = ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(1.12).convert('RGB')
    return im

SRC = {k: load(find(n)) for k, n in {
    'salao': 1, 'corte': 2, 'barba': 3, 'navalha': 4, 'lavagem': 5,
    'finalizacao': 6, 'resultado': 7, 'consultoria': 8, 'bancada': 9, 'bancada-barba': 10}.items()}

WIDTHS = [480, 800, 1200]

def avg_color(im):
    r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    return f'rgb({r},{g},{b})'

def save_set(img_id, im, manifest, quality=76):
    d = OUT / 'img'
    d.mkdir(parents=True, exist_ok=True)
    w0, h0 = im.size
    widths = sorted({w for w in WIDTHS if w < w0} | {min(w0, 1200)})
    for w in widths:
        im.resize((w, round(h0 * w / w0)), Image.LANCZOS).save(d / f'{img_id}-{w}.webp', quality=quality, method=6)
    manifest[img_id] = {'width': w0, 'height': h0, 'widths': widths, 'color': avg_color(im)}
    print('image', img_id, widths)

# ---------------------------------------------------------------- photos and product crops
shutil.rmtree(OUT / 'img', ignore_errors=True)
manifest = {}
for k, im in SRC.items():
    save_set(k, im, manifest)

# Product crops, 4:5, coordinates in the 1122x1402 shelf photos.
PRODUCT_CROPS = {
    'produto-shampoo': ('bancada', (185, 215, 645, 790)),
    'produto-spray': ('bancada', (530, 290, 1050, 940)),
    'produto-kit-cabelo': ('bancada', (0, 150, 700, 1025)),
    'produto-kit-business': ('bancada', (0, 0, 1122, 1402)),
    'produto-oleo': ('bancada-barba', (80, 360, 560, 960)),
    'produto-pincel': ('bancada-barba', (264, 270, 776, 910)),
    'produto-pomada': ('bancada-barba', (480, 470, 1100, 1245)),
    'produto-kit-barba': ('bancada-barba', (0, 0, 1122, 1402)),
}
for pid, (key, box) in PRODUCT_CROPS.items():
    im = SRC[key].crop(box)
    if box[2] - box[0] == 1122:  # whole photo, cropped to 4:5
        w = round(1402 * 0.8)
        im = SRC[key].crop(((1122 - w) // 2, 0, (1122 - w) // 2 + w, 1402))
    save_set(pid, im, manifest)

DATA.mkdir(exist_ok=True)
json.dump(manifest, open(DATA / 'media.json', 'w'), indent=2)

# ---------------------------------------------------------------- intro film (video → WebP frames)
FPS = 12  # 8 s video → 96 frames

def raw_frames():
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={FPS},scale=1280:720', str(tmp / '%03d.png')], check=True)
    return tmp, sorted(tmp.glob('*.png'))

def portrait(im):
    """9:16 frame: the 16:9 film enlarged so the logo fills the width, feathered over a blurred copy."""
    W, H = 540, 960
    bg = ImageOps.fit(im, (W, H)).filter(ImageFilter.GaussianBlur(28))
    bg = ImageEnhance.Brightness(bg).enhance(0.55)
    fw = 640
    fg = im.resize((fw, round(im.height * fw / im.width)), Image.LANCZOS)
    fg = fg.crop(((fw - W) // 2, 0, (fw - W) // 2 + W, fg.height))
    mask = Image.new('L', fg.size, 255)
    feather = 90
    for y in range(feather):
        v = round(255 * y / feather)
        mask.paste(v, (0, y, W, y + 1))
        mask.paste(v, (0, fg.height - 1 - y, W, fg.height - y))
    bg.paste(fg, (0, (H - fg.height) // 2), mask)
    return bg

def write(name, frames, quality):
    d = OUT / 'frames' / name
    shutil.rmtree(d, ignore_errors=True)
    d.mkdir(parents=True)
    for i, im in enumerate(frames):
        im.save(d / f'{i:03d}.webp', quality=quality, method=6)
    frames[0].save(OUT / f'poster-{name}.webp', quality=74, method=6)
    frames[-1].save(OUT / f'end-{name}.webp', quality=74, method=6)
    print('frames', name, len(frames))
    return {'count': len(frames), 'width': frames[0].width, 'height': frames[0].height}

tmp, files = raw_frames()
land = [Image.open(f).convert('RGB') for f in files]
if MONO:
    land = [ImageOps.grayscale(f).convert('RGB') for f in land]
info = {'landscape': write('landscape', land, 58), 'portrait': write('portrait', [portrait(f) for f in land], 60)}
shutil.rmtree(tmp)
json.dump(info, open(DATA / 'frames.json', 'w'), indent=2)

# Open Graph: the salon photo
og = SRC['salao']
og.resize((1200, round(og.height * 1200 / og.width)), Image.LANCZOS).crop((0, 0, 1200, 630)).save(OUT / 'og-image.jpg', quality=84)
print('done')

#!/usr/bin/env python3
"""Builds all site media from the owner's source images (the ChatGPT export zip).

Usage: python3 scripts/build-assets.py <images-dir>

Outputs (public/media, src/data):
  - img/<id>-<w>.webp + media.json     responsive photos and product crops
  - frames/{portrait,landscape}/NNN.webp + frames.json   scroll-scrubbed intro film (Ken Burns + crossfades)
  - poster-*.webp, end-*.webp, og-image.jpg
"""
import json, math, os, shutil, sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

src_dir = Path(sys.argv[1])
OUT = Path('public/media')
DATA = Path('src/data')

def find(n):  # source files end with "-<n>.png"
    return next(p for p in src_dir.glob('*.png') if p.stem.endswith(f'-{n}'))

# The brand palette is black and white, so photos are converted to monochrome (MONO=0 keeps colour).
MONO = os.environ.get('MONO', '1') != '0'

def load(path):
    im = Image.open(path).convert('RGB')
    if MONO:
        im = ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(1.12).convert('RGB')
    return im

SRC = {k: load(find(n)) for k, n in {
    'salao-vazio': 2, 'salao-barbeiro': 1, 'corte': 3, 'barba': 4, 'lavagem': 5, 'bancada': 6}.items()}

WIDTHS = [480, 800, 1200]

def avg_color(im):
    r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    return f'rgb({r},{g},{b})'

def save_set(img_id, im, manifest, quality=74):
    d = OUT / 'img'
    d.mkdir(parents=True, exist_ok=True)
    w0, h0 = im.size
    widths = [w for w in WIDTHS if w < w0] + [w0 if w0 <= 1200 else 1200]
    widths = sorted(set(widths))
    for w in widths:
        im.resize((w, round(h0 * w / w0)), Image.LANCZOS).save(d / f'{img_id}-{w}.webp', quality=quality, method=6)
    manifest[img_id] = {'width': w0, 'height': h0, 'widths': widths, 'color': avg_color(im)}
    print('image', img_id, widths)

# ---------------------------------------------------------------- photos and product crops
shutil.rmtree(OUT / 'img', ignore_errors=True)
manifest = {}
for k, im in SRC.items():
    save_set(k, im, manifest)

# Product crops from the shelf photo (coordinates in the 1122x1402 source), 4:5.
PRODUCT_CROPS = {
    'produto-pomada': (115, 650, 495, 1125),
    'produto-oleo': (377, 525, 733, 970),
    'produto-shampoo': (560, 330, 1040, 930),
    'produto-pincel': (770, 640, 1118, 1075),
    'produto-kit-cabelo': (60, 600, 660, 1350),
    'produto-kit-barba': (460, 380, 1100, 1180),
}
for pid, box in PRODUCT_CROPS.items():
    save_set(pid, SRC['bancada'].crop(box), manifest)
# the whole shelf, cropped to 4:5
w = round(1402 * 0.8)
save_set('produto-kit', SRC['bancada'].crop(((1122 - w) // 2, 0, (1122 - w) // 2 + w, 1402)), manifest)

(DATA).mkdir(exist_ok=True)
json.dump(manifest, open(DATA / 'media.json', 'w'), indent=2)

# ---------------------------------------------------------------- intro film
def cover(im, aspect, cx, cy, zoom):
    """Window with the given aspect ratio centred at (cx, cy) in 0-1 coords, zoom 1 = largest window."""
    W, H = im.size
    if W / H > aspect:
        h = H / zoom; w = h * aspect
    else:
        w = W / zoom; h = w / aspect
    x0 = min(max(cx * W - w / 2, 0), W - w)
    y0 = min(max(cy * H - h / 2, 0), H - h)
    return im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h)))

# (image, boundary start, {orientation: (cx0, cy0, z0, cx1, cy1, z1)})
SEGMENTS = [
    ('salao-vazio',    0.00, {'portrait': (.27, .5, 1.0, .62, .5, 1.1), 'landscape': (.5, .5, 1.0, .5, .5, 1.18)}),
    ('salao-barbeiro', 0.20, {'portrait': (.34, .5, 1.2, .40, .48, 1.7), 'landscape': (.40, .5, 1.0, .36, .5, 1.5)}),
    ('corte',          0.38, {'portrait': (.58, .5, 1.0, .56, .45, 1.15), 'landscape': (.5, .30, 1.0, .5, .40, 1.15)}),
    ('lavagem',        0.56, {'portrait': (.50, .5, 1.0, .55, .5, 1.12), 'landscape': (.5, .50, 1.0, .5, .62, 1.12)}),
    ('bancada',        0.72, {'portrait': (.5, .55, 1.0, .5, .55, 1.06), 'landscape': (.5, .42, 1.0, .5, .60, 1.0)}),
]
BOUNDS = [s[1] for s in SEGMENTS] + [1.0]
XF = 0.05  # crossfade half-width

def smooth(t):
    t = min(max(t, 0), 1)
    return t * t * (3 - 2 * t)

def render(p, orient, size):
    aspect = size[0] / size[1]
    layers = []
    for i, (key, b0, mot) in enumerate(SEGMENTS):
        b1 = BOUNDS[i + 1]
        lo = b0 - XF if i else -1
        hi = b1 + XF if i < len(SEGMENTS) - 1 else 2
        if not lo <= p <= hi:
            continue
        u = (p - b0) / (b1 - b0)
        u = min(max(u, -0.25), 1.25)
        e = u * u * (3 - 2 * u) if 0 <= u <= 1 else u
        cx0, cy0, z0, cx1, cy1, z1 = mot[orient]
        lerp = lambda a, b: a + (b - a) * e
        im = cover(SRC[key], aspect, lerp(cx0, cx1), lerp(cy0, cy1), lerp(z0, z1)).resize(size, Image.LANCZOS)
        w = 1.0
        if i and p < b0 + XF:
            w = smooth((p - (b0 - XF)) / (2 * XF))
        layers.append((im, w))
    base = layers[0][0]
    for im, w in layers[1:]:
        base = Image.blend(base, im, w)
    return base

FRAMES = 72
info = {}
for orient, size, q in (('portrait', (540, 960), 52), ('landscape', (1280, 720), 50)):
    d = OUT / 'frames' / orient
    shutil.rmtree(d, ignore_errors=True)
    d.mkdir(parents=True)
    for n in range(FRAMES):
        render(n / (FRAMES - 1), orient, size).save(d / f'{n:03d}.webp', quality=q, method=6)
    render(0, orient, size).save(OUT / f'poster-{orient}.webp', quality=72, method=6)
    big = (round(size[0] * 4 / 3), round(size[1] * 4 / 3))
    render(1, orient, big).save(OUT / f'end-{orient}.webp', quality=68, method=6)
    info[orient] = {'count': FRAMES, 'width': size[0], 'height': size[1]}
    print('frames', orient)
json.dump(info, open(DATA / 'frames.json', 'w'), indent=2)

# Open Graph: wide shot with the sign
cover(SRC['salao-vazio'], 1200 / 630, .3, .35, 1.0).resize((1200, 630), Image.LANCZOS).save(OUT / 'og-image.jpg', quality=82)
print('done')

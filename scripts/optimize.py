#!/usr/bin/env python3
"""
Builds the light, web-ready derivatives used by the page from the untouched /assets folder.

    bash scripts/encode-video.sh      (videos, needs ffmpeg)
    python3 scripts/optimize.py       (images, cutouts, shapes, textures, posters)

Outputs go to /media. The originals in /assets are never modified.
 - images    : every A-visual as WebP
 - cutouts   : B01/B02/B04 and the halftone people (B05/B06) get a real alpha channel
               (the supplied files are JPG on white); B03/B07 stay on white and are
               blended with mix-blend-mode: multiply in CSS
 - shapes    : individual blobs / torn strips cut out of C03
 - tex       : paper grid, blue paper, wax tile (fabric crop of A10)
"""
import json
import os
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
OUT = ROOT / "media"


def save_webp(im, path, q=80, **kw):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=q, method=6, **kw)
    print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")


# ───────────────────────────── images ─────────────────────────────
def do_images():
    print("images")
    for f in sorted((SRC / "images").glob("*.jpg")):
        im = Image.open(f).convert("RGB")
        save_webp(im, OUT / "img" / (f.stem + ".webp"), q=76)


def do_textures():
    print("textures")
    im = Image.open(SRC / "textures" / "C01_paper-grid_texture.jpg").convert("RGB")
    save_webp(im, OUT / "tex" / "C01_paper-grid.webp", q=70)
    im = Image.open(SRC / "textures" / "C02_blue-paper_texture.jpg").convert("RGB")
    save_webp(im, OUT / "tex" / "C02_blue-paper.webp", q=70)
    # wax tile: clean interior of the fabric in A10
    a10 = Image.open(SRC / "images" / "A10_wax-fabric-code-pattern_paper-bg_16x9.jpg").convert("RGB")
    wax = a10.crop((392, 196, 948, 556))
    save_webp(wax, OUT / "tex" / "wax-tile.webp", q=82)


# ───────────────────────────── helpers ─────────────────────────────
def flood(mask, seeds_from_border=True):
    """4-connected flood fill over True pixels of `mask`, seeded from the image border."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    dq = deque()
    def push(y, x):
        if mask[y, x] and not seen[y, x]:
            seen[y, x] = True
            dq.append((y, x))
    for x in range(w):
        push(0, x); push(h - 1, x)
    for y in range(h):
        push(y, 0); push(y, w - 1)
    while dq:
        y, x = dq.popleft()
        if y > 0 and mask[y - 1, x] and not seen[y - 1, x]:
            seen[y - 1, x] = True; dq.append((y - 1, x))
        if y < h - 1 and mask[y + 1, x] and not seen[y + 1, x]:
            seen[y + 1, x] = True; dq.append((y + 1, x))
        if x > 0 and mask[y, x - 1] and not seen[y, x - 1]:
            seen[y, x - 1] = True; dq.append((y, x - 1))
        if x < w - 1 and mask[y, x + 1] and not seen[y, x + 1]:
            seen[y, x + 1] = True; dq.append((y, x + 1))
    return seen


def dilate(m, r):
    out = m.copy()
    h, w = m.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dy == 0 and dx == 0:
                continue
            sh = np.zeros_like(m)
            ys = slice(max(dy, 0), h + min(dy, 0))
            yd = slice(max(-dy, 0), h + min(-dy, 0))
            xs = slice(max(dx, 0), w + min(dx, 0))
            xd = slice(max(-dx, 0), w + min(-dx, 0))
            sh[ys, xs] = m[yd, xd]
            out |= sh
    return out


def erode(m, r):
    return ~dilate(~m, r)


def feather(alpha_bool, radius=1.1):
    a = Image.fromarray((alpha_bool * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(a)


def crop_to_alpha(rgba, pad=12, max_side=900):
    a = rgba[..., 3]
    ys, xs = np.where(a > 8)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, a.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, a.shape[1])
    im = Image.fromarray(rgba[y0:y1, x0:x1], "RGBA")
    s = max_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return im


# ───────────────────────────── cutouts ─────────────────────────────
def cut_halftone(path, name):
    """B&W torn-paper stickers: keep the white torn border, drop the white page around it."""
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    mn = rgb.min(axis=2)
    white = mn >= 250
    wall = dilate(~white, 2)  # seal hairline gaps in the sticker outline
    outside_core = flood(~wall)
    outside = dilate(outside_core, 2) & white
    inside = ~outside
    inside = erode(inside, 1) | (inside & ~erode(inside, 1))
    alpha = feather(inside, 0.9)
    rgba = np.dstack([rgb.astype(np.uint8), alpha])
    save_webp(crop_to_alpha(rgba), OUT / "cutouts" / f"{name}.webp", q=84, alpha_quality=92)


def cut_object(path, name, global_white=False):
    """Glossy colored 3D objects on white: transparent outside + a soft neutral shadow."""
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    chroma = mx - mn
    neutral_light = (chroma <= 14) & (mn >= 188)
    if global_white:
        outside = (chroma <= 12) & (mn >= 236)
    else:
        wall = dilate(~neutral_light, 1)
        outside_core = flood(~wall)
        outside = dilate(outside_core, 1) & neutral_light
    inside = ~outside
    alpha_obj = feather(inside, 0.8).astype(np.float32) / 255.0
    # shadow alpha from darkness of the outside pixels
    shadow = np.clip((255 - mn) / 150.0, 0, 0.55) * outside
    shadow = np.asarray(Image.fromarray((shadow * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255.0
    a = np.maximum(alpha_obj, shadow)
    col = rgb.astype(np.float32).copy()
    sh = (shadow > alpha_obj)[..., None]
    col = np.where(sh, np.array([32, 33, 36], np.float32), col)
    rgba = np.dstack([np.clip(col, 0, 255).astype(np.uint8), (a * 255).astype(np.uint8)])
    save_webp(crop_to_alpha(rgba, pad=24, max_side=900), OUT / "cutouts" / f"{name}.webp", q=86, alpha_quality=92)


def keep_on_white(path, name):
    im = Image.open(path).convert("RGB")
    # crop the empty white margin, keep soft shadow
    a = np.asarray(im).astype(np.int16)
    ys, xs = np.where(a.min(axis=2) < 244)
    pad = 30
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, im.width), min(ys.max() + pad, im.height))
    im = im.crop(box)
    s = 900 / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    save_webp(im, OUT / "cutouts" / f"{name}.webp", q=84)


def do_cutouts():
    print("cutouts")
    c = SRC / "cutouts"
    cut_object(c / "B01_keycaps-4-colors_cutout.jpg", "B01_keycaps")
    cut_object(c / "B02_blue-curly-brace_cutout.jpg", "B02_blue-brace")
    keep_on_white(c / "B03_paper-plane_cutout.jpg", "B03_paper-plane")
    cut_object(c / "B04_confetti-burst_cutout.jpg", "B04_confetti", global_white=True)
    cut_halftone(c / "B05_woman-pointing-halftone_cutout.jpg", "B05_woman-pointing")
    cut_halftone(c / "B06_man-walking-laptop-halftone_cutout.jpg", "B06_man-walking")
    keep_on_white(c / "B07_mint-tea-glass_cutout.jpg", "B07_tea-glass")


# ───────────────────────────── C03 shapes ─────────────────────────────
def label_components(mask):
    h, w = mask.shape
    labels = np.zeros((h, w), np.int32)
    n = 0
    for y0 in range(h):
        row = mask[y0]
        if not row.any():
            continue
        for x0 in np.nonzero(row)[0]:
            if labels[y0, x0]:
                continue
            n += 1
            labels[y0, x0] = n
            dq = deque([(y0, x0)])
            while dq:
                y, x = dq.popleft()
                for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = n
                        dq.append((ny, nx))
    return labels, n


def hue_name(r, g, b):
    import colorsys
    hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    hh *= 360
    if hh < 20 or hh > 340:
        return "red"
    if hh < 75:
        return "yellow"
    if hh < 170:
        return "green"
    return "blue"


def do_shapes():
    print("shapes (C03)")
    im = Image.open(SRC / "textures" / "C03_organic-blobs-torn-paper_shapes.jpg").convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    chroma = arr.max(axis=2) - arr.min(axis=2)
    mask = chroma > 70
    # a light open to drop JPEG specks
    mask = erode(mask, 1)
    mask = dilate(mask, 1)
    labels, n = label_components(mask)
    manifest = []
    counts = {}
    for i in range(1, n + 1):
        ys, xs = np.nonzero(labels == i)
        if len(ys) < 1400:
            continue
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        pad = 6
        y0, x0 = max(y0 - pad, 0), max(x0 - pad, 0)
        y1, x1 = min(y1 + pad, arr.shape[0]), min(x1 + pad, arr.shape[1])
        sub = (labels[y0:y1, x0:x1] == i)
        sub = dilate(sub, 1)  # recover the antialiased rim
        alpha = feather(sub, 0.7)
        rgba = np.dstack([arr[y0:y1, x0:x1].astype(np.uint8), alpha])
        # dominant colour from the solid core
        core = erode(sub, 3)
        px = arr[y0:y1, x0:x1][core] if core.any() else arr[y0:y1, x0:x1][sub]
        r, g, b = [int(v) for v in px.mean(axis=0)]
        color = hue_name(r, g, b)
        w, h = x1 - x0, y1 - y0
        ratio = max(w, h) / max(1, min(w, h))
        kind = "strip" if ratio > 2.3 else "blob"
        counts[(color, kind)] = counts.get((color, kind), 0) + 1
        fname = f"{kind}-{color}-{counts[(color, kind)]:02d}.webp"
        save_webp(Image.fromarray(rgba, "RGBA"), OUT / "shapes" / fname, q=84, alpha_quality=90)
        manifest.append({"file": fname, "color": color, "kind": kind, "w": int(w), "h": int(h)})
    (OUT / "shapes" / "shapes.json").write_text(json.dumps(manifest, indent=1))
    print(f"  {len(manifest)} shapes")


def do_highlights():
    """Torn strips rotated so their main axis is horizontal: used as highlighter marks behind words."""
    print("highlights")
    import glob, math
    for f in sorted(glob.glob(str(OUT / "shapes" / "blob-*.webp")) + glob.glob(str(OUT / "shapes" / "strip-*.webp"))):
        im = Image.open(f).convert("RGBA")
        a = np.asarray(im)[..., 3] > 128
        ys, xs = np.nonzero(a)
        if len(xs) < 500:
            continue
        pts = np.stack([xs - xs.mean(), ys - ys.mean()])
        ev, evec = np.linalg.eigh(np.cov(pts))
        if ev[1] / max(ev[0], 1e-6) < 5.5:   # keep long thin torn strips only
            continue
        ang = math.degrees(math.atan2(evec[1, 1], evec[0, 1]))
        rot = im.rotate(ang, expand=True, resample=Image.BICUBIC)
        arr = np.asarray(rot)
        yy, xx = np.nonzero(arr[..., 3] > 8)
        rot = rot.crop((xx.min(), yy.min(), xx.max() + 1, yy.max() + 1))
        name = Path(f).stem.replace("blob-", "").replace("strip-", "")
        save_webp(rot, OUT / "shapes" / f"hl-{name}.webp", q=86, alpha_quality=90)


def do_posters():
    print("video posters")
    d = OUT / "video" / "_frames"
    if not d.exists():
        print("  (no frames yet — run scripts/encode-video.sh first)")
        return
    for f in sorted(d.glob("*.png")):
        save_webp(Image.open(f).convert("RGB"), OUT / "video" / (f.stem + ".poster.webp"), q=76)


if __name__ == "__main__":
    which = set(sys.argv[1:]) or {"images", "textures", "cutouts", "shapes", "posters"}
    if "images" in which: do_images()
    if "textures" in which: do_textures()
    if "cutouts" in which: do_cutouts()
    if "shapes" in which: do_shapes()
    if "highlights" in which: do_highlights()
    if "posters" in which: do_posters()

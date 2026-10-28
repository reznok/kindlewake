#!/usr/bin/env node
/**
 * Packs the sprites listed in a manifest into one PNG atlas plus a JSON index.
 *
 *   node tools/build-atlas.mjs [tools/manifest.json] [public/atlas]
 *
 * Manifest (see tools/manifest.json):
 *   { "width": 1024, "groups": { "<name>": { ...defaults } }, "sprites": [ Sprite ] }
 *
 * Sprite: { "key", "group"?, "dir"?, "src"? | "anims"?, ...ops }
 *   src / anims[name][i]: "file.png" | { "file", "x", "y", "w", "h" } | "file_{0-3}.png" (expands) |
 *                         { "file", "strip": [n, w, h, x0?, y0?] } (n frames left to right)
 *   ops (sprite or group level):
 *     bgKey: "auto" | "rrggbb" colour-key the background (flood from the edges; keyAll: true keys every pixel)
 *     tol: 0..255              colour-key tolerance (default 8)
 *     recolor: { "rrggbb": "rrggbb" | ["rrggbb","rrggbb"] }  exact palette swap (an array alternates by row: stripes)
 *     tint: "rrggbb"           greyscale then multiply (stone / statue looks)
 *     bright: [brightness, saturation]   e.g. [1.08, 1.25]
 *     flip: true               mirror horizontally (atlas frames face the side's canonical direction)
 *     scale: n                 nearest-neighbour upscale of the source by an integer (after shrink, before keying)
 *     overlay: [ Overlay ]     composite more art onto every frame (after the base's key / recolour / tint):
 *                              { "src", "dir"?, "dx", "dy", "scale"?, "flip"?, "under"?, bgKey/tol/recolor/tint/bright }
 *                              dx, dy place the overlay's top-left relative to the base frame's opaque box (source px,
 *                              after the base's scale); the canvas grows to fit; under: true draws it behind the base
 *     bust: { "from": key, "rows"?: 0.8, "scale"?: n, "bg": ["rrggbb", "rrggbb"], "rim": "rrggbb", "edge"?: "rrggbb",
 *             "headRows"?: 8 }
 *                              framed portrait (portrait size, px 1): the top `rows` of key's processed idle frame 0,
 *                              nearest-upscaled (scale default: the largest integer that fits), centred on the head,
 *                              standing on the frame's bottom edge, over a banded bg[0]->bg[1] backdrop with a rim
 *     cell: [w, h]             logical cell in display px; size: small|medium|large picks 80/128/200 squares
 *     px: n | "auto"           display pixel scale (atlas stays at native res; the game draws px times bigger);
 *                              auto = integer fit from 2x up, quarter steps between 1x and 2x, area-downscale below 1x
 *     maxPx: n                 cap for px auto (default 6)
 *     down: true               painterly art: area-downscale to fit the cell, px 1
 *     anchor: n                which frame's box anchors a multi-frame sprite (default 0)
 *     face: 1 | -1 | 0         which way the baked frames face (1 right, -1 left, 0 n/a)
 *     fps: { anim: n }         playback hints written to the index
 * Output: <out>.png and <out>.json:
 *   { width, height, frames: { "<key>:<anim>:<i>": { x, y, w, h, ox, oy, cw, ch, px } },
 *     sprites: { "<key>": { face, cw, ch, anims: { idle: n, ... }, fps, smooth } } }   (smooth: painterly, draw filtered)
 *   (ox, oy, cw, ch are display px: the frame sits at (ox, oy) inside a cw x ch cell, drawn w*px x h*px.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const manifestPath = process.argv[2] ?? 'tools/manifest.json';
const outBase = process.argv[3] ?? 'public/atlas';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const SIZES = { small: [80, 80], medium: [128, 128], large: [200, 200], icon: [16, 16], portrait: [96, 96] };

const cache = new Map();
function load(file) {
  if (!cache.has(file)) {
    if (!fs.existsSync(file)) throw new Error('missing source: ' + file);
    // some packs (Dungeon Crawl tiles) carry junk after IEND; cut it off
    let buf = fs.readFileSync(file);
    const end = buf.indexOf('IEND');
    if (end > 0) buf = buf.subarray(0, end + 8);
    cache.set(file, PNG.sync.read(buf));
  }
  return cache.get(file);
}

const hex = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const hexOf = (d, i) => ((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]).toString(16).padStart(6, '0');

/** "@name/rest" -> manifest.dirs[name]/rest. */
function resolveDir(p) {
  return p.replace(/^@([\w-]+)/, (_, n) => { if (!manifest.dirs?.[n]) throw new Error('unknown dir @' + n); return manifest.dirs[n]; });
}

/** Expand "a_{0-3}.png" and strips into plain source rects. */
function expand(src, dir) {
  dir = resolveDir(dir);
  if (typeof src === 'string') {
    const m = src.match(/\{(\d+)-(\d+)\}/);
    if (m) {
      const out = [];
      for (let i = +m[1]; i <= +m[2]; i++) out.push({ file: path.join(dir, src.replace(m[0], String(i))) });
      return out;
    }
    return [{ file: path.join(dir, src) }];
  }
  if (src.strip) {
    const [n, w, h, x0 = 0, y0 = 0] = src.strip;
    return Array.from({ length: n }, (_, i) => ({ file: path.join(dir, src.file), x: x0 + i * w, y: y0, w, h }));
  }
  return [{ ...src, file: path.join(dir, src.file) }];
}

function crop(s) {
  const src = load(s.file);
  const x0 = s.x ?? 0, y0 = s.y ?? 0, w = s.w ?? src.width - x0, h = s.h ?? src.height - y0;
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(src, out, x0, y0, w, h, 0, 0);
  return out;
}

function colorKey(img, o) {
  if (!o.bgKey) return;
  const d = img.data, W = img.width, H = img.height, tol = o.tol ?? 8;
  const [kr, kg, kb] = o.bgKey === 'auto' ? [d[0], d[1], d[2]] : hex(o.bgKey);
  const near = (i) => d[i + 3] > 0 && Math.abs(d[i] - kr) <= tol && Math.abs(d[i + 1] - kg) <= tol && Math.abs(d[i + 2] - kb) <= tol;
  if (o.keyAll) { for (let i = 0; i < d.length; i += 4) if (near(i)) d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0; return; }
  const seen = new Uint8Array(W * H), st = [];
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
  while (st.length) {
    const p = st.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (!near(p * 4) && d[p * 4 + 3] > 0) continue;
    d[p * 4] = d[p * 4 + 1] = d[p * 4 + 2] = d[p * 4 + 3] = 0;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W);
  }
}

function recolor(img, o) {
  const d = img.data;
  if (o.recolor) {
    const map = new Map(Object.entries(o.recolor).map(([k, v]) => [k.toLowerCase(), (Array.isArray(v) ? v : [v]).map(hex)]));
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const to = map.get(hexOf(d, i));
      if (!to) continue;
      const y = Math.floor(i / 4 / img.width);
      const c = to[y % to.length];
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    }
  }
  if (o.tint) {
    const [tr, tg, tb] = hex(o.tint);
    for (let i = 0; i < d.length; i += 4) {
      const l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
      const k = Math.min(1.25, l * 1.35);
      d[i] = Math.min(255, tr * k); d[i + 1] = Math.min(255, tg * k); d[i + 2] = Math.min(255, tb * k);
    }
  }
  if (o.bright) {
    const [b, s] = o.bright;
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (l + (d[i + k] - l) * s) * b));
    }
  }
}

/** Nearest downscale by an integer factor (art that ships pre-scaled). */
function shrink(img, k) {
  const out = new PNG({ width: Math.floor(img.width / k), height: Math.floor(img.height / k) });
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) {
    const si = (y * k * img.width + x * k) * 4, di = (y * out.width + x) * 4;
    for (let c = 0; c < 4; c++) out.data[di + c] = img.data[si + c];
  }
  return out;
}

/** Nearest upscale by an integer factor. */
function grow(img, k) {
  if (!k || k === 1) return img;
  const out = new PNG({ width: img.width * k, height: img.height * k });
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) {
    const si = (Math.floor(y / k) * img.width + Math.floor(x / k)) * 4, di = (y * out.width + x) * 4;
    for (let c = 0; c < 4; c++) out.data[di + c] = img.data[si + c];
  }
  return out;
}

/** Alpha-blend src onto dst at (x, y). */
function blit(src, dst, x, y) {
  for (let sy = 0; sy < src.height; sy++) for (let sx = 0; sx < src.width; sx++) {
    const dx = x + sx, dy = y + sy;
    if (dx < 0 || dy < 0 || dx >= dst.width || dy >= dst.height) continue;
    const s = (sy * src.width + sx) * 4, d = (dy * dst.width + dx) * 4, a = src.data[s + 3] / 255;
    if (!a) continue;
    const da = dst.data[d + 3] / 255, oa = a + da * (1 - a);
    for (let k = 0; k < 3; k++) dst.data[d + k] = Math.round((src.data[s + k] * a + dst.data[d + k] * da * (1 - a)) / oa);
    dst.data[d + 3] = Math.round(oa * 255);
  }
}

/** Composite overlays onto a processed frame; the canvas grows to fit them. */
function applyOverlays(img, o, dir) {
  if (!o.overlay?.length) return img;
  const b = bbox(img) ?? { x: 0, y: 0, w: img.width, h: img.height };
  const parts = o.overlay.map((ov) => {
    const [s] = expand(ov.src, ov.dir ?? dir);
    let im = grow(crop({ ...s, file: resolveDir(s.file) }), ov.scale);
    colorKey(im, ov);
    recolor(im, ov);
    if (ov.flip) im = flipX(im);
    return { im, x: b.x + (ov.dx ?? 0), y: b.y + (ov.dy ?? 0), under: !!ov.under };
  });
  const x0 = Math.min(0, ...parts.map((p) => p.x)), y0 = Math.min(0, ...parts.map((p) => p.y));
  const x1 = Math.max(img.width, ...parts.map((p) => p.x + p.im.width)), y1 = Math.max(img.height, ...parts.map((p) => p.y + p.im.height));
  const out = new PNG({ width: x1 - x0, height: y1 - y0 });
  out.data.fill(0);
  for (const p of parts) if (p.under) blit(p.im, out, p.x - x0, p.y - y0);
  blit(img, out, -x0, -y0);
  for (const p of parts) if (!p.under) blit(p.im, out, p.x - x0, p.y - y0);
  return out;
}

/** A framed portrait bust from another sprite's processed idle frame (see the header). */
function makeBust(o, cell) {
  const spec = o.bust;
  const srcSprite = built.get(spec.from);
  if (!srcSprite) throw new Error(`${o.key}: bust source ${spec.from} not built yet (list it earlier in the manifest)`);
  let base = srcSprite.list.find((f) => f.anim === 'idle' && f.i === 0)?.img ?? srcSprite.list[0].img;
  if (srcSprite.o.flip) base = flipX(base);
  const b = bbox(base);
  const rows = Math.max(1, Math.round(b.h * (spec.rows ?? 0.8)));
  // centre on the head: mean opaque column over the top few rows (weapons skew the full box)
  const headRows = spec.headRows ?? Math.max(4, Math.round(b.h * 0.3));
  let sum = 0, n = 0;
  for (let y = b.y; y < b.y + headRows; y++) for (let x = b.x; x < b.x + b.w; x++) if (base.data[(y * base.width + x) * 4 + 3] > 8) { sum += x; n++; }
  const cx = n ? sum / n : b.x + b.w / 2;
  const [W, H] = cell;
  const k = spec.scale ?? Math.max(1, Math.min(spec.maxScale ?? 6, Math.floor((H - 12) / rows)));
  const part = sub(base, { x: b.x, y: b.y, w: b.w, h: rows });
  const big = grow(part, k);
  const out = new PNG({ width: W, height: H });
  out.data.fill(0);
  // backdrop: banded vertical gradient inside a rounded rim
  const [ta, tb] = (spec.bg ?? ['ffffff', 'cccccc']).map(hex), rim = hex(spec.rim ?? '888888'), edge = hex(spec.edge ?? '1e1a2e');
  const bands = 6, R = 6;
  const inside = (x, y, inset) => {
    const l = inset, t = inset, r = W - 1 - inset, bt = H - 1 - inset, rr = Math.max(0, R - inset);
    if (x < l || y < t || x > r || y > bt) return false;
    const qx = x < l + rr ? l + rr : x > r - rr ? r - rr : x, qy = y < t + rr ? t + rr : y > bt - rr ? bt - rr : y;
    return (x - qx) ** 2 + (y - qy) ** 2 <= rr * rr + 0.5;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    let c = null;
    if (inside(x, y, 3)) { const t = Math.min(bands - 1, Math.floor((y / H) * bands)) / (bands - 1); c = ta.map((v, j) => Math.round(v + (tb[j] - v) * t)); }
    else if (inside(x, y, 1)) c = rim;
    else if (inside(x, y, 0)) c = edge;
    if (c) { out.data[i] = c[0]; out.data[i + 1] = c[1]; out.data[i + 2] = c[2]; out.data[i + 3] = 255; }
  }
  // the bust stands on the inner bottom edge, head-centred; clip to the inner area
  const px0 = Math.round(W / 2 - (cx - b.x + 0.5) * k), py0 = H - 3 - big.height;
  const clip = new PNG({ width: W, height: H });
  clip.data.fill(0);
  blit(big, clip, px0, py0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!inside(x, y, 3)) clip.data[(y * W + x) * 4 + 3] = 0;
  blit(clip, out, 0, 0);
  return out;
}

function flipX(img) {
  const out = new PNG({ width: img.width, height: img.height });
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
    const si = (y * img.width + x) * 4, di = (y * img.width + img.width - 1 - x) * 4;
    for (let k = 0; k < 4; k++) out.data[di + k] = img.data[si + k];
  }
  return out;
}

/** Opaque bounding box, or null. */
function bbox(img) {
  let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) if (img.data[(y * img.width + x) * 4 + 3] > 8) {
    if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

function sub(img, b) {
  const out = new PNG({ width: b.w, height: b.h });
  PNG.bitblt(img, out, b.x, b.y, b.w, b.h, 0, 0);
  return out;
}

/** Area-average resample with premultiplied alpha (for painterly downscales). */
function resample(img, W, H) {
  const out = new PNG({ width: W, height: H });
  const sx = img.width / W, sy = img.height / H;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    const ax = x * sx, bx = (x + 1) * sx, ay = y * sy, by = (y + 1) * sy;
    for (let yy = Math.floor(ay); yy < Math.ceil(by); yy++) for (let xx = Math.floor(ax); xx < Math.ceil(bx); xx++) {
      const wx = Math.min(bx, xx + 1) - Math.max(ax, xx), wy = Math.min(by, yy + 1) - Math.max(ay, yy), wgt = wx * wy;
      const i = (yy * img.width + xx) * 4, al = img.data[i + 3] / 255;
      r += img.data[i] * al * wgt; g += img.data[i + 1] * al * wgt; b += img.data[i + 2] * al * wgt; a += al * wgt; n += wgt;
    }
    const i = (y * W + x) * 4;
    if (a > 0) { out.data[i] = r / a; out.data[i + 1] = g / a; out.data[i + 2] = b / a; }
    out.data[i + 3] = Math.round((a / n) * 255);
  }
  return out;
}

// ---------------------------------------------------------------- build sprites

const frames = []; // { key, img, ox, oy, px }
const spritesIdx = {};
const built = new Map(); // key -> { o, list } processed frames, for busts

// { "glob": "dir", "prefix": "icon_", ...ops } adds one sprite per PNG in dir
const spriteList = (manifest.sprites ?? []).flatMap((s) => {
  if (!s.glob) return [s];
  const d = resolveDir(s.glob);
  if (!fs.existsSync(d)) throw new Error('missing dir ' + d + ' (run tools/build-icons.mjs first?)');
  return fs.readdirSync(d).filter((f) => f.endsWith('.png')).sort().map((f) => {
    const { glob: _g, prefix = '', ...rest } = s;
    return { ...rest, key: prefix + f.slice(0, -4), src: path.join(d, f) };
  });
});

for (const raw of spriteList) {
  const o = { ...(manifest.groups?.[raw.group] ?? {}), ...raw };
  const dir = o.dir ?? '';
  const cell = o.cell ?? SIZES[o.size ?? 'medium'];
  if (o.bust) {
    frames.push({ key: `${o.key}:idle:0`, img: makeBust(o, cell), ox: 0, oy: 0, px: 1 });
    spritesIdx[o.key] = { face: 0, cw: cell[0], ch: cell[1], anims: { idle: 1 } };
    continue;
  }
  const anims = o.anims ?? { idle: [o.src] };
  // load + process every frame
  const list = [];
  for (const [anim, srcs] of Object.entries(anims)) {
    const exp = (Array.isArray(srcs) ? srcs : [srcs]).flatMap((s) => expand(s, dir));
    exp.forEach((s, i) => {
      let img = crop({ ...s, file: resolveDir(s.file) });
      if (o.shrink) img = shrink(img, o.shrink);
      img = grow(img, o.scale);
      colorKey(img, o);
      recolor(img, o);
      img = applyOverlays(img, o, dir);
      list.push({ anim, i, img });
    });
  }
  built.set(o.key, { o, list });
  // pixel scale: from the anchor frame's opaque box (single-frame sprites are trimmed to their art)
  const anchor = list[Math.min(o.anchor ?? 0, list.length - 1)];
  const ab = bbox(anchor.img) ?? { x: 0, y: 0, w: anchor.img.width, h: anchor.img.height };
  const multi = list.length > 1;
  let px = o.px ?? 'auto';
  let down = !!o.down;
  if (px === 'auto') {
    const ref = multi ? { w: Math.max(...list.map((f) => f.img.width)), h: Math.max(...list.map((f) => f.img.height)) } : ab;
    // integer scales from 2x up; between 1x and 2x a quarter-step scale so big pixel art still fills its class
    const fit = Math.min(cell[0] / ref.w, cell[1] / ref.h);
    px = fit >= 2 ? Math.min(o.maxPx ?? 6, Math.floor(fit)) : fit >= 1 ? Math.max(1, Math.floor(fit * 0.95 * 4) / 4) : fit;
    if (px < 1) { px = 1; down = true; }
  }
  if (down) {
    // single painterly frame: fit its art box into the cell
    const f = list[0];
    const b = bbox(f.img) ?? ab;
    const k = Math.min(cell[0] / b.w, cell[1] / b.h, 1);
    f.img = resample(sub(f.img, b), Math.max(1, Math.round(b.w * k)), Math.max(1, Math.round(b.h * k)));
  }
  // placement: the anchor frame's art bottom-centre goes to the cell's bottom-centre; other frames share the offset
  const cwN = cell[0] / px, chN = cell[1] / px;
  const baseX = down ? 0 : cwN / 2 - (ab.x + ab.w / 2), baseY = down ? 0 : chN - (ab.y + ab.h);
  const counts = {};
  for (const f of list) {
    const b = bbox(f.img);
    counts[f.anim] = (counts[f.anim] ?? 0) + 1;
    if (!b) { console.warn('empty frame', o.key, f.anim, f.i); continue; }
    let img = sub(f.img, b);
    let ox, oy;
    if (down) { ox = (cwN - b.w) / 2; oy = chN - b.h; }
    else { ox = Math.round(baseX) + b.x; oy = Math.round(baseY) + b.y; }
    // mirror after placement so every frame keeps the anchor alignment
    if (o.flip) { img = flipX(img); ox = cwN - ox - b.w; }
    if (ox < -0.01 || oy < -0.01 || ox + b.w > cwN + 0.01) console.warn(`${o.key}:${f.anim}:${f.i} spills out of its cell (${ox},${oy} ${b.w}x${b.h} in ${cwN}x${chN})`);
    frames.push({ key: `${o.key}:${f.anim}:${f.i}`, img, ox: ox * px, oy: oy * px, px });
  }
  spritesIdx[o.key] = { face: o.face ?? 0, cw: cell[0], ch: cell[1], anims: counts, ...(o.fps ? { fps: o.fps } : {}), ...(down ? { smooth: true } : {}) };
}

// legacy flat entries
for (const e of manifest.entries ?? []) {
  let img = crop(e);
  if (e.flip) img = flipX(img);
  frames.push({ key: e.key, img, ox: 0, oy: 0, px: e.scale ?? 1 });
}

// ---------------------------------------------------------------- pack (shelves, tallest first)

frames.sort((a, b) => b.img.height - a.img.height || b.img.width - a.img.width);
const PAD = 1;
const maxW = manifest.width ?? 1024;
let x = PAD, y = PAD, shelf = 0, atlasW = 0;
const placed = [];
for (const f of frames) {
  if (x + f.img.width + PAD > maxW) { x = PAD; y += shelf + PAD; shelf = 0; }
  placed.push({ f, x, y });
  x += f.img.width + PAD;
  shelf = Math.max(shelf, f.img.height);
  atlasW = Math.max(atlasW, x);
}
const atlasH = y + shelf + PAD;
const atlas = new PNG({ width: atlasW, height: atlasH });
const index = {};
const r2 = (v) => Math.round(v * 100) / 100;
for (const p of placed) {
  PNG.bitblt(p.f.img, atlas, 0, 0, p.f.img.width, p.f.img.height, p.x, p.y);
  index[p.f.key] = { x: p.x, y: p.y, w: p.f.img.width, h: p.f.img.height, ox: r2(p.f.ox), oy: r2(p.f.oy), px: p.f.px };
}
// clear the colour of fully transparent pixels (smaller PNG, no fringes when the browser filters)
for (let i = 0; i < atlas.data.length; i += 4) if (atlas.data[i + 3] === 0) atlas.data[i] = atlas.data[i + 1] = atlas.data[i + 2] = 0;
fs.mkdirSync(path.dirname(outBase), { recursive: true });
fs.writeFileSync(outBase + '.png', PNG.sync.write(atlas, { colorType: 6, deflateLevel: 9 }));
fs.writeFileSync(outBase + '.json', JSON.stringify({ width: atlasW, height: atlasH, frames: index, sprites: spritesIdx }));
const kb = (fs.statSync(outBase + '.png').size / 1024).toFixed(0);
console.log(`${outBase}.png ${atlasW}x${atlasH} (${kb} KB), ${placed.length} frames, ${Object.keys(spritesIdx).length} sprites`);

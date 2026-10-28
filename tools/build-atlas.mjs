#!/usr/bin/env node
/**
 * Packs sprites listed in a manifest into one PNG atlas plus a JSON index.
 *
 *   node tools/build-atlas.mjs tools/manifest.json public/atlas
 *
 * Manifest: { "entries": [ { "key": "hero_tank_idle_0", "file": "assets/raw/pack/x.png", "x": 0, "y": 0, "w": 32, "h": 32,
 *             "scale": 1, "flip": false, "trim": false } ] }
 * `x,y,w,h` default to the whole file. `scale` is an integer nearest-neighbour upscale. `flip` mirrors horizontally.
 * `trim` cuts fully transparent borders (the index records the original box so anchors stay put).
 * Output: <out>.png and <out>.json ({ frames: { key: { x, y, w, h, ox, oy, sw, sh } } }).
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const [manifestPath, outBase] = process.argv.slice(2);
if (!manifestPath || !outBase) { console.error('usage: build-atlas <manifest.json> <out-base>'); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const cache = new Map();
function load(file) {
  if (!cache.has(file)) cache.set(file, PNG.sync.read(fs.readFileSync(file)));
  return cache.get(file);
}

/** Cut a region into its own PNG, with scale and flip. */
function extract(e) {
  const src = load(e.file);
  const x0 = e.x ?? 0, y0 = e.y ?? 0, w = e.w ?? src.width - x0, h = e.h ?? src.height - y0;
  const s = Math.max(1, Math.round(e.scale ?? 1));
  const out = new PNG({ width: w * s, height: h * s });
  for (let y = 0; y < h * s; y++) for (let x = 0; x < w * s; x++) {
    const sx = x0 + (e.flip ? w - 1 - Math.floor(x / s) : Math.floor(x / s)), sy = y0 + Math.floor(y / s);
    const si = (sy * src.width + sx) * 4, di = (y * out.width + x) * 4;
    out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1]; out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = src.data[si + 3];
  }
  let ox = 0, oy = 0, img = out;
  if (e.trim) {
    let minX = out.width, minY = out.height, maxX = -1, maxY = -1;
    for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) if (out.data[(y * out.width + x) * 4 + 3] > 0) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    if (maxX >= 0) {
      const tw = maxX - minX + 1, th = maxY - minY + 1;
      const t = new PNG({ width: tw, height: th });
      PNG.bitblt(out, t, minX, minY, tw, th, 0, 0);
      ox = minX; oy = minY; img = t;
    }
  }
  return { img, ox, oy, sw: out.width, sh: out.height };
}

const sprites = manifest.entries.map((e) => ({ e, ...extract(e) }));
// shelf packing, tallest first
sprites.sort((a, b) => b.img.height - a.img.height);
const PAD = 1;
const maxW = manifest.width ?? 2048;
let x = PAD, y = PAD, shelf = 0, atlasW = 0;
const placed = [];
for (const s of sprites) {
  if (x + s.img.width + PAD > maxW) { x = PAD; y += shelf + PAD; shelf = 0; }
  placed.push({ s, x, y });
  x += s.img.width + PAD;
  shelf = Math.max(shelf, s.img.height);
  atlasW = Math.max(atlasW, x);
}
const atlasH = y + shelf + PAD;
const atlas = new PNG({ width: atlasW, height: atlasH });
const frames = {};
for (const p of placed) {
  PNG.bitblt(p.s.img, atlas, 0, 0, p.s.img.width, p.s.img.height, p.x, p.y);
  frames[p.s.e.key] = { x: p.x, y: p.y, w: p.s.img.width, h: p.s.img.height, ox: p.s.ox, oy: p.s.oy, sw: p.s.sw, sh: p.s.sh };
}
fs.mkdirSync(path.dirname(outBase), { recursive: true });
fs.writeFileSync(outBase + '.png', PNG.sync.write(atlas));
fs.writeFileSync(outBase + '.json', JSON.stringify({ width: atlasW, height: atlasH, frames }));
console.log(`${outBase}.png ${atlasW}x${atlasH}, ${placed.length} frames`);

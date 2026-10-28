#!/usr/bin/env node
/**
 * Battle / title backdrops and the map tile -> public/bg/<key>.png.
 *
 *   node tools/build-backgrounds.mjs
 *
 * Painted backdrops are area-downscaled to a low "16-bit" resolution (the game draws them with smoothing off, so they come
 * out chunky and pixelated) and brightened. Needs ffmpeg (env FFMPEG, else C:\ffmpeg-shared\bin\ffmpeg.exe, else PATH).
 * The map tile is composed from Kenney Tiny Town tiles with pngjs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const FFMPEG = process.env.FFMPEG ?? (fs.existsSync('C:/ffmpeg-shared/bin/ffmpeg.exe') ? 'C:/ffmpeg-shared/bin/ffmpeg.exe' : 'ffmpeg');
const OUT = 'public/bg';
const NID = 'assets/raw/oga-battle-backgrounds-nidhoggn';
const MRPG = 'assets/raw/oga-monster-rpg2-bg-matthew-smith/bgs';

/** key: [source, filter]. Nidhoggn backs are 1104x621 -> 276x155; Monster RPG 2 backs are already 240x110 pixel art. */
const NIDF = (b = 0.04, s = 1.3, g = 1) => `scale=276:155:flags=area,eq=brightness=${b}:saturation=${s}:gamma=${g}`;
const MRPGF = (b = 0.03, s = 1.15) => `eq=brightness=${b}:saturation=${s}`;
const BGS = {
  bg_meadow: [`${NID}/battleback10.png`, NIDF(0.05, 1.35, 1.05)],
  bg_forest: [`${NID}/battleback1.png`, NIDF(0.07, 1.4, 1.15)],
  bg_autumn: [`${NID}/battleback6.png`, NIDF(0.04, 1.2)],
  bg_autumn_red: [`${NID}/battleback7.png`, NIDF(0.04, 1.15)],
  bg_snow: [`${NID}/battleback2.png`, NIDF(0.04, 1.2)],
  bg_desert: [`${NID}/battleback3.png`, NIDF(0.03, 1.15)],
  bg_town: [`${NID}/battleback4.png`, NIDF(0.03, 1.2)],
  bg_dungeon: [`${NID}/battleback8.png`, NIDF(0.1, 1.35, 1.3)],
  bg_cave: [`${NID}/battleback5.png`, NIDF(0.05, 1.25, 1.1)],
  bg_arena: [`${NID}/battleback9.png`, NIDF(0.05, 1.2)],
  bg_lake: [`${MRPG}/water.png`, MRPGF(0.04, 1.1)],
  bg_castle: [`${MRPG}/keep_outer.png`, MRPGF()],
  bg_keep: [`${MRPG}/keep.png`, MRPGF()],
  bg_fort: [`${MRPG}/fort.png`, MRPGF()],
  bg_mountains: [`${MRPG}/mountains.png`, MRPGF(0.03, 1.1)],
  bg_sky: [`${MRPG}/mountains_bridge.png`, MRPGF()],
  bg_bridge: [`${MRPG}/rope_bridge.png`, MRPGF()],
  bg_moon: [`${MRPG}/moon.png`, MRPGF(0.02, 1.0)],
  bg_volcano: [`${MRPG}/volcano.png`, MRPGF(0.02, 1.1)],
  bg_jungle: [`${MRPG}/jungle.png`, MRPGF(0.05, 1.15)],
  bg_grass: [`${MRPG}/grass.png`, MRPGF(0.02, 1.05)],
  bg_title: ['assets/raw/oga-meadow-background/meadow.jpg', 'scale=348:234:flags=area,eq=brightness=0.02:saturation=1.3'],
};

fs.mkdirSync(OUT, { recursive: true });
for (const [key, [src, vf]] of Object.entries(BGS)) {
  if (!fs.existsSync(src)) { console.warn('missing', src); continue; }
  const out = path.join(OUT, key + '.png');
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', src, '-vf', `${vf},format=rgb24`, '-frames:v', '1', out]);
}

// ---------------------------------------------------------------- map tile: grass, flowers, a few trees (seamless)
const TOWN = 'assets/raw/kenney-tiny-town/Tilemap/tilemap_packed.png';
const town = PNG.sync.read(fs.readFileSync(TOWN));
const T = 16, N = 12; // tiles per side of the map tile
const map = new PNG({ width: T * N, height: T * N });
let seed = 1234567;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const tile = (id, tx, ty) => {
  const sx = (id % 12) * T, sy = Math.floor(id / 12) * T;
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const si = ((sy + y) * town.width + sx + x) * 4, a = town.data[si + 3] / 255;
    if (!a) continue;
    const di = (((ty * T + y) % map.height) * map.width + ((tx * T + x) % map.width)) * 4;
    for (let k = 0; k < 3; k++) map.data[di + k] = map.data[di + k] * (1 - a) + town.data[si + k] * a;
    map.data[di + 3] = 255;
  }
};
for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) tile(rnd() < 0.18 ? (rnd() < 0.5 ? 1 : 2) : 0, tx, ty);
// two-tile trees (top over trunk), bushes and mushrooms
for (let i = 0; i < 6; i++) {
  const tx = Math.floor(rnd() * N), ty = Math.floor(rnd() * N), r = rnd();
  if (r < 0.35) { tile(4, tx, ty); tile(16, tx, ty + 1); } else if (r < 0.55) { tile(3, tx, ty); tile(15, tx, ty + 1); } else if (r < 0.8) tile(5, tx, ty); else tile(29, tx, ty);
}
fs.writeFileSync(path.join(OUT, 'bg_map.png'), PNG.sync.write(map));

let total = 0;
for (const f of fs.readdirSync(OUT)) total += fs.statSync(path.join(OUT, f)).size;
console.log(`${fs.readdirSync(OUT).length} backdrops -> ${OUT} (${(total / 1024).toFixed(0)} KB)`);

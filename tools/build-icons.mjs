#!/usr/bin/env node
/**
 * Draws the 12 px UI glyphs (elements, statuses, map nodes) from the ASCII art below into assets/cache/icons/<name>.png.
 * Original art for this project (CC0). The atlas build picks them up as `icon_<name>`.
 *
 *   node tools/build-icons.mjs [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const outDir = process.argv[2] ?? 'assets/cache/icons';

/** Project palette (matches src/ui/palette.ts and style.css). */
const PAL = {
  k: '1d2b53', w: 'ffffff', y: 'ffe14d', Y: 'f2b705', o: 'ff9f1c', O: 'e85d04', r: 'ff4d6d', R: 'c1121f',
  g: '5ee05e', G: '2a9d3a', b: '4cc9f0', B: '1e6fd9', c: 'bff6ff', C: '7df9ff', p: 'b388ff', P: '7b2cbf',
  s: 'c2c3c7', S: '83769c', n: 'b5713a', N: '7a3b1d', m: 'ff8fab',
};

const A = {
  slash: `
.........kkk
........kwwk
.......kwsk.
......kwsk..
.....kwsk...
.kk.kwsk....
.kykwsk.....
..kysk......
..kNyk......
.kNkkyk.....
kNk..kk.....
kk..........`,
  pierce: `
.......kkkkk
.......kwwwk
........kssk
.......kwsk.
......kwsk.k
.....kwsk...
....kwsk....
...kwsk.....
.kknsk......
kRRnk.......
kRRk........
kkk.........`,
  blunt: `
..kkkkkkk...
.kssssswsk..
.ksssssssk..
.kSSSSSSSk..
..kkkNkkk...
.....kNk....
.....kNk....
.....kNk....
.....kNk....
.....kNk....
.....kNk....
.....kkk....`,
  fire: `
.....k......
....kok.....
....kyok....
...kyyok.k..
..kyyyyokok.
..kyywyyoyk.
.kyywwyyyok.
.koywwwyyok.
.koywwwyyok.
..koyyyyok..
...kooook...
....kkkk....`,
  frost: `
.....kk.....
..kk.kbk.kk.
..kbkkbkkbk.
...kbbbbbk..
.kkkbwwbkkk.
kbbbwwwwbbbk
kbbbwwwwbbbk
.kkkbwwbkkk.
...kbbbbbk..
..kbkkbkkbk.
..kk.kbk.kk.
.....kk.....`,
  storm: `
.....kkkkk..
....kyyyyk..
....kyyyk...
...kyyyk....
...kyyykkk..
..kyyyyyyk..
..kkkkyyk...
.....kyk....
....kyk.....
....kyk.....
...kkk......
...k........`,
  spirit: `
.....kk.....
....kpk.....
...kppk.....
...kpppk....
..kpppppk...
.kpwwpwwpk..
.kpwkpwkpk..
.kpppppppk..
.kpppppppk..
..kpPpPpk...
..kPkPkPk...
...k.k.k....`,
  drop: `
.....kk.....
....kgk.....
....kggk....
...kgggk....
..kggwggk...
..kgwgggk...
.kgggggggk..
.kgGgggGgk..
.kggGGGggk..
..kgggggk...
...kkkkk....
............`,
  taunt: `
...kkkkkk...
..krrrrrrk..
.krrkkkkrrk.
.krrkwwkrrk.
.krrkwwkrrk.
.krrkwwkrrk.
.krrrkkrrrk.
.krrrkkrrrk.
.krrkwwkrrk.
..krrkkrrk..
...krrrrk...
....kkkk....`,
  regen: `
............
.kkk...kkk..
kgggk.kgggk.
kggwgkggggk.
kgwgggggggk.
kgggggggggk.
.kgggggggk..
..kgggggk...
...kgggk....
....kgk.....
.....k......
............`,
  shield: `
.kkkkkkkkkk.
.kbbbbbbbbk.
.kbwwbbbbbk.
.kbwbbbbbbk.
.kbbbbbbbbk.
.kbbbbbbbbk.
.kbbbbbbbBk.
..kbbbbbBk..
..kbbbbBBk..
...kbbBBk...
....kBBk....
.....kk.....`,
  haste: `
............
.kk...kk....
.kyk..kyk...
..kyk..kyk..
...kyk..kyk.
....kyk..kyk
....kyk..kyk
...kyk..kyk.
..kyk..kyk..
.kyk..kyk...
.kk...kk....
............`,
  slow: `
.kkkkkkkkkk.
.kNNNNNNNNk.
..kwwwwwwk..
..kyyyyyyk..
...kyyyyk...
....kyyk....
....kwwk....
...kwyywk...
..kwwyywwk..
..kyyyyyyk..
.kNNNNNNNNk.
.kkkkkkkkkk.`,
  break: `
.....kk.....
....kyyk....
....kyyk....
kkkkyykyykkk
kyyyykyyyyyk
.kyyyykyyyk.
..kyyykyyk..
..kyyyyyyk..
.kyykkkkyyk.
.kyk....kyk.
.kk......kk.
............`,
  fight: `
kk........kk
kwk......kwk
kswk....kwsk
.kswk..kwsk.
..kswkkwsk..
...kswwsk...
...kswwsk...
..kNkkkkNk..
.kNk....kNk.
kyk......kyk
kk........kk
............`,
  elite: `
k..........k
kk.kkkkkk.kk
kwkwwwwwwkwk
.kwwwwwwwwk.
.kwkkwwkkwk.
.kwkkwwkkwk.
.kwwwkkwwwk.
..kwwwwwwk..
..kwkwkwkk..
...kkkkkk...
............
............`,
  event: `
...kkkkkk...
..kwwwwwwk..
.kwwkkkkwwk.
.kwk....kwk.
.kk....kwwk.
......kwwk..
.....kwwk...
.....kwk....
.....kkk....
.....kwk....
.....kwk....
.....kkk....`,
  recruit: `
...kkk......
..kwwwk.....
..kwwwk..kk.
..kwwwk.kgk.
...kkk.kkgkk
..kwwwkkgggk
.kwwwwwkkgkk
.kwwwwwk.kgk
.kwwwwwk..k.
.kwwwwwk....
.kkkkkkk....
............`,
  camp: `
.....k......
....kok.....
...kyok.....
...kyyok....
..kyywyok...
..koyyyok...
...kooook...
.kNkkkkkNk..
kNNNkkkNNNk.
.kNNNNNNNk..
kNk.kkk.kNk.
kk.......kk.`,
  shop: `
...kkkkkk...
..kyyyyyyk..
.kyyYkkYyyk.
kyyYkyykYyyk
kyyYkyyyyyyk
kyyyYkkYyyyk
kyyyyyykYyyk
kyyYkyykYyyk
.kyyYkkYyyk.
..kyyyyyyk..
...kkkkkk...
............`,
  boss: `
............
k....kk....k
kk..kyyk..kk
kyk.kyyk.kyk
kyykyyyykyyk
kyyyyyyyyyyk
kyyrryyrryyk
kyyrryyrryyk
kyyyyyyyyyyk
kYYYYYYYYYYk
kkkkkkkkkkkk
............`,
  start: `
.kk.........
.kwkkkkk....
.kwkrrrrkkk.
.kwkrrrrrrrk
.kwkrrrrrrrk
.kwkrrrrrrk.
.kwkkkkkkk..
.kwk........
.kwk........
.kwk........
kkwkk.......
kkkkk.......`,
};

const UP = ['..k..', '.kgk.', 'kgggk', '.kgk.', '.kkk.'];
const DOWN = ['.kkk.', '.krk.', 'krrrk', '.krk.', '..k..'];

const grid = (s) => s.trim().split('\n').map((r) => r.trim());
const swap = (g, m) => g.map((r) => [...r].map((ch) => m[ch] ?? ch).join(''));
const overlay = (g, o) => g.map((r, y) => {
  const oy = y - (g.length - o.length);
  if (oy < 0) return r;
  return [...r].map((ch, x) => { const ox = x - (r.length - o[0].length); const c = ox >= 0 ? o[oy][ox] : '.'; return c !== '.' ? c : ch; }).join('');
});

const ICONS = {
  // elements
  slash: grid(A.slash), pierce: grid(A.pierce), blunt: grid(A.blunt), fire: grid(A.fire), frost: grid(A.frost),
  storm: grid(A.storm), spirit: grid(A.spirit),
  // statuses
  poison: grid(A.drop),
  burn: swap(grid(A.fire), { y: 'o', o: 'R', w: 'y' }),
  chill: swap(grid(A.frost), { b: 'C', w: 'w' }),
  shock: grid(A.storm),
  bleed: swap(grid(A.drop), { g: 'r', G: 'R' }),
  taunt: grid(A.taunt),
  regen: grid(A.regen),
  barrier: grid(A.shield),
  atkUp: overlay(grid(A.slash), UP),
  atkDown: overlay(grid(A.slash), DOWN),
  defUp: overlay(grid(A.shield), UP),
  defDown: overlay(grid(A.shield), DOWN),
  haste: grid(A.haste),
  slow: grid(A.slow),
  guard: swap(grid(A.shield), { b: 's', B: 'S' }),
  break: grid(A.break),
  // map nodes
  node_fight: grid(A.fight), node_elite: grid(A.elite), node_event: grid(A.event), node_recruit: grid(A.recruit),
  node_camp: grid(A.camp), node_shop: grid(A.shop), node_boss: grid(A.boss), node_start: grid(A.start),
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, g] of Object.entries(ICONS)) {
  const h = g.length, w = Math.max(...g.map((r) => r.length));
  if (h !== 12 || w !== 12 || g.some((r) => r.length !== 12)) console.warn('icon', name, 'is', w, 'x', h);
  const png = new PNG({ width: 12, height: 12 });
  g.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.' || x >= 12 || y >= 12) return;
    const hex = PAL[ch];
    if (!hex) { console.warn('icon', name, 'unknown colour', ch); return; }
    const i = (y * 12 + x) * 4;
    png.data[i] = parseInt(hex.slice(0, 2), 16); png.data[i + 1] = parseInt(hex.slice(2, 4), 16); png.data[i + 2] = parseInt(hex.slice(4, 6), 16); png.data[i + 3] = 255;
  }));
  fs.writeFileSync(path.join(outDir, name + '.png'), PNG.sync.write(png));
}
console.log(`${Object.keys(ICONS).length} icons -> ${outDir}`);

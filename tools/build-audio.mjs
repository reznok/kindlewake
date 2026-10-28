#!/usr/bin/env node
/**
 * Music loops and SFX -> public/audio/<id>.ogg (Vorbis). Music is re-encoded to stay under ~1.5 MB per track; SFX are
 * mono, trimmed of silence, and some are layered (perfect = bell + sparkle).
 *
 *   node tools/build-audio.mjs
 *
 * Needs ffmpeg (env FFMPEG, else C:\ffmpeg-shared\bin\ffmpeg.exe, else PATH).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FFMPEG = process.env.FFMPEG ?? (fs.existsSync('C:/ffmpeg-shared/bin/ffmpeg.exe') ? 'C:/ffmpeg-shared/bin/ffmpeg.exe' : 'ffmpeg');
const OUT = 'public/audio';
const R = 'assets/raw';
const CA = `${R}/oga-music-chiptune-adventures/Juhani Junkala [Chiptune Adventures] OGG/Juhani Junkala [Chiptune Adventures]`;

const MUSIC = {
  title: `${CA} 4. Stage Select.ogg`,
  map: `${R}/oga-music-jrpg-pack-1-exploration/Grasslands.ogg`,
  battle: `${R}/oga-music-jrpg-pack-5-action/Action3 - Preparing For Battle.ogg`,
  boss: `${CA} 3. Boss Fight.ogg`,
  camp: `${R}/oga-music-jrpg-pack-4-calm/Calm3 - Peaceful Days.ogg`,
};

const I = `${R}/kenney-interface-sounds/Audio`, IM = `${R}/kenney-impact-sounds/Audio`, D = `${R}/kenney-digital-audio/Audio`;
/** id: one file, or several layered with their gains. */
const SFX = {
  menu: [[`${I}/select_001.ogg`, 0.8]],
  confirm: [[`${I}/confirmation_001.ogg`, 0.9]],
  hit: [[`${IM}/impactPunch_medium_001.ogg`, 1.0]],
  perfect: [[`${IM}/impactBell_heavy_001.ogg`, 0.7], [`${D}/pepSound1.ogg`, 0.5]],
  guard: [[`${IM}/impactPlate_heavy_002.ogg`, 0.9]],
  break: [[`${IM}/impactGlass_heavy_002.ogg`, 1.0], [`${IM}/impactPunch_heavy_001.ogg`, 0.6]],
  ko: [[`${D}/lowDown.ogg`, 0.8]],
  heal: [[`${D}/powerUp3.ogg`, 0.7]],
  buff: [[`${D}/threeTone1.ogg`, 0.6]],
  levelup: [[`${R}/kenney-music-jingles/Audio/8-Bit jingles/jingles_NES00.ogg`, 0.8]],
  coin: [[`${R}/kenney-rpg-audio/Audio/handleCoins.ogg`, 0.9]],
};

const run = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args]);
fs.mkdirSync(OUT, { recursive: true });

for (const [id, src] of Object.entries(MUSIC)) {
  if (!fs.existsSync(src)) { console.warn('missing', src); continue; }
  const out = path.join(OUT, `music_${id}.ogg`);
  // 44.1 kHz stereo, Vorbis q2 (~96 kbps): a 70 s loop lands near 0.9 MB
  run(['-i', src, '-ar', '44100', '-ac', '2', '-c:a', 'libvorbis', '-q:a', '2', out]);
  if (fs.statSync(out).size > 1.5 * 1024 * 1024) run(['-i', src, '-ar', '44100', '-ac', '2', '-c:a', 'libvorbis', '-q:a', '0', out]);
}

for (const [id, layers] of Object.entries(SFX)) {
  const missing = layers.find(([f]) => !fs.existsSync(f));
  if (missing) { console.warn('missing', missing[0]); continue; }
  const out = path.join(OUT, `sfx_${id}.ogg`);
  const inputs = layers.flatMap(([f]) => ['-i', f]);
  const vols = layers.map(([, g], i) => `[${i}:a]volume=${g},aformat=channel_layouts=mono[a${i}]`).join(';');
  const mix = layers.length > 1 ? `${layers.map((_, i) => `[a${i}]`).join('')}amix=inputs=${layers.length}:normalize=0[m]` : '[a0]anull[m]';
  const filter = `${vols};${mix};[m]silenceremove=start_periods=1:start_threshold=-50dB[o]`;
  run([...inputs, '-filter_complex', filter, '-map', '[o]', '-ar', '44100', '-ac', '1', '-c:a', 'libvorbis', '-q:a', '4', out]);
}

let total = 0;
for (const f of fs.readdirSync(OUT)) {
  const s = fs.statSync(path.join(OUT, f)).size;
  total += s;
  if (s > 1.5 * 1024 * 1024) console.warn(f, 'is over 1.5 MB');
}
console.log(`${fs.readdirSync(OUT).length} audio files -> ${OUT} (${(total / 1024).toFixed(0)} KB)`);

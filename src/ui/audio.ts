/**
 * Music and sound effects on WebAudio. Files live in public/audio (built by `npm run audio`). Browsers only allow sound
 * after a user gesture, so the context is created or resumed on the first pointer / key press; anything asked for before
 * that is remembered (the current track starts on unlock). Music loops seamlessly and crossfades between tracks.
 */
import type { Settings } from '../core/types';

export type Sfx = 'menu' | 'confirm' | 'hit' | 'perfect' | 'guard' | 'break' | 'ko' | 'heal' | 'buff' | 'levelup' | 'coin';
export type Track = 'title' | 'map' | 'battle' | 'boss' | 'camp' | null;

const BASE: string = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';
const MUSIC_VOL = 0.45;
const SFX_VOL = 0.8;
const FADE = 0.9;

let soundOn = true;
let musicOn = true;
let muted = false;
let current: Track = null;
/** Last few requests, for debugging from the console (`kw.audioLog`). */
export const audioLog: string[] = [];

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let playing: { track: Track; src: AudioBufferSourceNode; gain: GainNode } | null = null;
/** Bumped on every music change so late-decoding tracks do not start over a newer one. */
let musicSeq = 0;

function log(s: string) {
  audioLog.push(s);
  if (audioLog.length > 30) audioLog.shift();
}

function context(): AudioContext | null {
  if (ac) return ac;
  const Ctor = typeof window !== 'undefined' ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!Ctor) return null;
  ac = new Ctor();
  master = ac.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ac.destination);
  sfxBus = ac.createGain();
  sfxBus.gain.value = SFX_VOL;
  sfxBus.connect(master);
  musicBus = ac.createGain();
  musicBus.gain.value = MUSIC_VOL;
  musicBus.connect(master);
  return ac;
}

function load(name: string): Promise<AudioBuffer | null> {
  let p = buffers.get(name);
  if (!p) {
    const a = context();
    p = !a ? Promise.resolve(null) : fetch(`${BASE}audio/${name}.ogg`)
      .then((r) => { if (!r.ok) throw new Error(name + ' ' + r.status); return r.arrayBuffer(); })
      .then((b) => a.decodeAudioData(b))
      .catch((e) => { console.warn('[audio]', e); return null; });
    buffers.set(name, p);
  }
  return p;
}

/** Create / resume the context on the first gesture, then start whatever track is wanted. */
function unlock() {
  const a = context();
  if (!a) return;
  if (a.state !== 'running') void a.resume().then(() => startMusic(current));
  else if (current && playing?.track !== current) startMusic(current);
}

if (typeof window !== 'undefined') {
  const once = () => { unlock(); for (const s of ['sfx_menu', 'sfx_confirm', 'sfx_hit']) void load(s); };
  window.addEventListener('pointerdown', once, { capture: true });
  window.addEventListener('keydown', once, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) void ac.suspend(); else if (!muted) void ac.resume();
  });
}

export function configureAudio(s: Settings) {
  soundOn = s.sound;
  musicOn = s.music;
  if (!musicOn) stopMusic();
  else if (current && playing?.track !== current) startMusic(current);
}

/** Global mute (the M key); independent of the sound / music settings. */
export function setMuted(m: boolean) {
  muted = m;
  log(m ? 'mute' : 'unmute');
  if (master && ac) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.05);
}
export function isMuted(): boolean { return muted; }
export function toggleMute(): boolean { setMuted(!muted); return muted; }

/** Play a sound effect; `rate` pitches it (1.45 = brighter, 0.8 = lower). */
export function play(sfx: Sfx, rate = 1) {
  if (!soundOn) return;
  log(sfx);
  const a = context();
  if (!a || a.state !== 'running' || muted) { if (a) void load('sfx_' + sfx); return; }
  void load('sfx_' + sfx).then((buf) => {
    if (!buf || !ac || !sfxBus) return;
    const src = ac.createBufferSource();
    src.buffer = buf;
    if (rate !== 1) src.playbackRate.value = rate;
    src.connect(sfxBus);
    src.start();
  });
}

export function music(track: Track) {
  if (track === current) return;
  current = track;
  log('music:' + (track ?? 'none'));
  if (!musicOn) return;
  startMusic(track);
}

function stopMusic() {
  musicSeq++;
  const p = playing;
  playing = null;
  if (p && ac) fadeOut(p);
}

function fadeOut(p: { src: AudioBufferSourceNode; gain: GainNode }) {
  if (!ac) return;
  const t = ac.currentTime;
  p.gain.gain.cancelScheduledValues(t);
  p.gain.gain.setValueAtTime(p.gain.gain.value, t);
  p.gain.gain.linearRampToValueAtTime(0, t + FADE);
  try { p.src.stop(t + FADE + 0.05); } catch { /* already stopped */ }
}

function startMusic(track: Track) {
  if (!musicOn) return;
  if (playing?.track === track) return;
  const seq = ++musicSeq;
  if (playing) { fadeOut(playing); playing = null; }
  if (!track) return;
  const a = context();
  if (!a || a.state !== 'running') { void load('music_' + track); return; }
  void load('music_' + track).then((buf) => {
    if (!buf || !ac || !musicBus || seq !== musicSeq || !musicOn) return;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(1, ac.currentTime + FADE);
    src.connect(gain).connect(musicBus);
    src.start();
    playing = { track, src, gain };
  });
}

export function currentTrack(): Track { return current; }

/** What is actually audible right now (debugging). */
export function audioState() {
  return { context: ac?.state ?? 'none', muted, soundOn, musicOn, wanted: current, playing: playing?.track ?? null, loaded: [...buffers.keys()] };
}

/** Audio hook. Stubs for now: they honour the settings and remember what was asked, real files come later. */
import type { Settings } from '../core/types';

export type Sfx = 'menu' | 'confirm' | 'hit' | 'perfect' | 'guard' | 'break' | 'ko' | 'heal' | 'buff';
export type Track = 'title' | 'map' | 'battle' | 'boss' | 'camp' | null;

let soundOn = true;
let musicOn = true;
let current: Track = null;
/** Last few requests, for debugging from the console. */
export const audioLog: string[] = [];

export function configureAudio(s: Settings) {
  soundOn = s.sound;
  musicOn = s.music;
  if (!musicOn) current = null;
}

export function play(sfx: Sfx) {
  if (!soundOn) return;
  audioLog.push(sfx);
  if (audioLog.length > 30) audioLog.shift();
}

export function music(track: Track) {
  if (!musicOn) { current = null; return; }
  if (track === current) return;
  current = track;
  audioLog.push('music:' + (track ?? 'none'));
  if (audioLog.length > 30) audioLog.shift();
}

export function currentTrack(): Track { return current; }

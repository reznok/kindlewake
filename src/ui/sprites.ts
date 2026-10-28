/**
 * Sprite abstraction. Scenes only call `drawActor` / `drawBackground` / `drawIcon`; art comes from the packed atlas
 * (`public/atlas.png` + `.json`, built by `npm run atlas`) and `public/bg/*.png`. Any key without art falls back to a
 * coloured placeholder shape, so data can name sprites before the art exists.
 */
import { CHARACTERS } from '../data/characters';
import { ROLE_COLOR } from './palette';

export type Anim = 'idle' | 'attack' | 'hurt' | 'ko' | 'cast';

export interface ActorOpts {
  /** Name; its initial is drawn on the placeholder. */
  label?: string;
  /** 0..1 white flash overlay. */
  flash?: number;
  alpha?: number;
  /** 1 faces right, -1 faces left (default: the art's own facing). */
  facing?: 1 | -1;
  ko?: boolean;
  broken?: boolean;
  /** Time in ms for idle loops and the bob (omit for a still pose). */
  time?: number;
  /** Animation to show (default idle). Attack plays once and holds; hurt shows briefly then returns to idle. */
  anim?: Anim;
  /** performance.now() when `anim` started. */
  animAt?: number;
}

/** Legacy single-frame registration (kept for callers that build their own art). */
export interface Frame { img: CanvasImageSource; sx: number; sy: number; sw: number; sh: number }

interface AtlasFrame { x: number; y: number; w: number; h: number; ox: number; oy: number; px: number }
interface SpriteMeta { face: number; cw: number; ch: number; anims: Record<string, number>; fps?: Record<string, number>; smooth?: boolean }
interface AtlasIndex { frames: Record<string, AtlasFrame>; sprites: Record<string, SpriteMeta> }

const frames = new Map<string, Frame>();
const backgrounds = new Map<string, CanvasImageSource>();
const bgState = new Map<string, 'loading' | 'failed'>();
let atlas: HTMLImageElement | null = null;
/** White silhouettes of the atlas, for hit flashes. */
let atlasWhite: HTMLCanvasElement | null = null;
let index: AtlasIndex = { frames: {}, sprites: {} };

export function registerSprite(key: string, f: Frame) { frames.set(key, f); }
export function registerBackground(key: string, img: CanvasImageSource) { backgrounds.set(key, img); }

const BASE: string = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('failed to load ' + src));
    img.src = src;
  });
}

/** Load the atlas, the UI fonts and the default backdrops. Resolves (never rejects) once done or failed. */
export async function loadArt(): Promise<void> {
  const fonts = typeof document !== 'undefined' && document.fonts
    ? Promise.all([document.fonts.load('16px "Pixelify Sans"'), document.fonts.load('16px "Press Start 2P"')]).catch(() => [])
    : Promise.resolve([]);
  try {
    const [json, img] = await Promise.all([
      fetch(BASE + 'atlas.json').then((r) => { if (!r.ok) throw new Error('atlas.json ' + r.status); return r.json() as Promise<AtlasIndex>; }),
      loadImage(BASE + 'atlas.png'),
    ]);
    index = json;
    atlas = img;
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#fff';
    x.fillRect(0, 0, c.width, c.height);
    atlasWhite = c;
  } catch (e) {
    console.warn('[art] atlas not loaded, using placeholders', e);
  }
  for (const k of ['bg_title', 'bg_map', 'bg_meadow']) ensureBackground(k);
  await fonts;
  // warm the rest of the backdrops in the background so a battle never opens on the stand-in
  setTimeout(() => { for (const k of BG_KEYS) ensureBackground(k); }, 1500);
}

/** True when the atlas has art for this sprite key. */
export function hasSprite(key: string): boolean { return !!index.sprites[key] || frames.has(key); }

/** All sprite keys in the atlas (debugging / the enemy catalog). */
export function spriteKeys(): string[] { return Object.keys(index.sprites); }

function hashHue(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; }

/** The base colour for a sprite key (also used by the timeline and portraits). */
export function actorColor(key: string): string {
  const ch = Object.values(CHARACTERS).find((c) => c.sprite === key);
  if (ch) return ROLE_COLOR[ch.role];
  return `hsl(${hashHue(key)} 70% 55%)`;
}

export function shade(hex: string, f: number): string {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const ANIM_FALLBACK: Record<Anim, Anim[]> = {
  idle: ['idle'], attack: ['attack', 'idle'], hurt: ['hurt', 'idle'], ko: ['ko', 'hurt', 'idle'], cast: ['cast', 'attack', 'idle'],
};
const DEFAULT_FPS: Record<Anim, number> = { idle: 5, attack: 12, hurt: 1, ko: 1, cast: 6 };
/** How long a hurt pose shows before the actor returns to idle. */
export const HURT_MS = 380;
/** How long an attack / cast holds its last frame before returning to idle. */
export const ACTION_HOLD_MS = 1600;

/** Pick the animation and frame index for a sprite at time `now`. */
function pickFrame(key: string, meta: SpriteMeta, o: ActorOpts, now: number): { anim: Anim; frame: AtlasFrame } | null {
  let want: Anim = o.ko ? 'ko' : o.anim ?? 'idle';
  const since = now - (o.animAt ?? now);
  if (!o.ko) {
    const n0 = meta.anims[want] ?? 0;
    const fps0 = meta.fps?.[want] ?? DEFAULT_FPS[want];
    if (want === 'hurt' && since > HURT_MS) want = 'idle';
    else if ((want === 'attack' || want === 'cast') && since > Math.max(ACTION_HOLD_MS, (n0 / fps0) * 1000 + 300)) want = 'idle';
  }
  const anim = ANIM_FALLBACK[want].find((a) => meta.anims[a]) ?? 'idle';
  const n = meta.anims[anim] ?? 0;
  if (!n) return null;
  const fps = meta.fps?.[anim] ?? DEFAULT_FPS[anim];
  let i = 0;
  if (anim === 'idle') i = o.time === undefined ? 0 : Math.floor((o.time + hashHue(key) * 37) / (1000 / fps)) % n;
  else if (anim === 'attack') i = Math.min(n - 1, Math.floor(Math.max(0, since) / (1000 / fps)));
  else if (anim === 'cast') i = Math.floor(Math.max(0, since) / (1000 / fps)) % n;
  const frame = index.frames[`${key}:${anim}:${i}`];
  return frame ? { anim, frame } : null;
}

/** Draw an actor into the box (x, y) top-left, w x h. Art is fitted to the box, standing on its bottom edge. */
export function drawActor(ctx: CanvasRenderingContext2D, key: string, x: number, y: number, w: number, h: number, opts: ActorOpts = {}) {
  ctx.save();
  ctx.globalAlpha *= opts.alpha ?? 1;
  const meta = atlas ? index.sprites[key] : undefined;
  const now = performance.now();
  const pick = meta ? pickFrame(key, meta, opts, now) : null;
  if (meta && pick && atlas) {
    drawAtlasActor(ctx, key, meta, pick.frame, pick.anim, x, y, w, h, opts);
    ctx.restore();
    return;
  }
  const bob = opts.time !== undefined && !opts.ko ? Math.sin(opts.time / 260 + hashHue(key)) * h * 0.025 : 0;
  const f = frames.get(key);
  shadow(ctx, x + w / 2, y + h - h * 0.02, w * 0.42, h * 0.07);
  if (f) {
    ctx.save();
    if (opts.facing === -1) { ctx.translate(x + w, y + bob); ctx.scale(-1, 1); ctx.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, 0, 0, w, h); }
    else ctx.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, x, y + bob, w, h);
    ctx.restore();
  } else placeholder(ctx, key, x, y + bob, w, h * 0.94, opts);
  if (opts.flash && opts.flash > 0 && !f) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, opts.flash)})`;
    roundRect(ctx, x, y + bob, w, h, w * 0.3);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function shadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = 'rgba(20,40,20,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAtlasActor(ctx: CanvasRenderingContext2D, key: string, meta: SpriteMeta, fr: AtlasFrame, anim: Anim, x: number, y: number, w: number, h: number, o: ActorOpts) {
  const k = Math.min(w / meta.cw, h / meta.ch);
  const cw = meta.cw * k, ch = meta.ch * k;
  const cx = x + (w - cw) / 2, cy = y + h - ch;
  const want = o.facing ?? (meta.face || 1);
  const mirror = meta.face !== 0 && want !== meta.face;
  const single = (meta.anims.idle ?? 0) <= 1;
  // static art breathes: a small squash and stretch anchored at the feet
  const t = o.time;
  const breathe = single && t !== undefined && !o.ko && anim === 'idle' ? Math.sin(t / 300 + hashHue(key)) * 0.025 : 0;
  // footprint for the shadow: the art's width at the feet
  const artW = fr.w * fr.px * k;
  shadow(ctx, cx + (mirror ? cw - (fr.ox * k + artW / 2) : fr.ox * k + artW / 2), y + h - Math.max(2, h * 0.02), Math.max(10, artW * 0.42), Math.max(3, Math.min(h * 0.07, artW * 0.12)));
  ctx.save();
  ctx.imageSmoothingEnabled = !!meta.smooth;
  ctx.translate(cx + cw / 2, cy + ch);
  if (o.ko) {
    // fall over backwards, toward the side the actor faces away from
    ctx.rotate((want === -1 ? 1 : -1) * Math.PI * 0.42);
    ctx.translate(0, ch * 0.08);
    ctx.filter = 'grayscale(0.85) brightness(0.95)';
  }
  ctx.scale((mirror ? -1 : 1) * (1 - breathe * 0.6), 1 + breathe);
  const dx = -cw / 2 + fr.ox * k, dy = -ch + fr.oy * k, dw = fr.w * fr.px * k, dh = fr.h * fr.px * k;
  ctx.drawImage(atlas!, fr.x, fr.y, fr.w, fr.h, dx, dy, dw, dh);
  if (o.flash && o.flash > 0 && atlasWhite) {
    ctx.globalAlpha *= Math.min(1, o.flash);
    ctx.drawImage(atlasWhite, fr.x, fr.y, fr.w, fr.h, dx, dy, dw, dh);
  }
  ctx.restore();
  if (o.broken && !o.ko) {
    // dizzy stars over the head
    const tt = (t ?? 0) / 300;
    ctx.fillStyle = '#ffd60a';
    ctx.strokeStyle = '#1d2b53';
    ctx.lineWidth = 1.5;
    const top = cy + fr.oy * k, mid = cx + cw / 2;
    for (let i = 0; i < 3; i++) {
      const a = tt + (i * Math.PI * 2) / 3;
      const sx = mid + Math.cos(a) * cw * 0.22, sy = top - 4 + Math.sin(a) * 4;
      starPath(ctx, sx, sy, 5);
      ctx.fill(); ctx.stroke();
    }
  }
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** True when the atlas has the glyph `icon_<name>`. */
export function hasIcon(name: string): boolean { return !!atlas && !!index.frames[`icon_${name}:idle:0`]; }

/** Draw a UI glyph (`icon_<name>` in the atlas) into a size x size square. Returns false when there is no such icon. */
export function drawIcon(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number): boolean {
  const fr = atlas ? index.frames[`icon_${name}:idle:0`] : undefined;
  if (!fr || !atlas) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(atlas, fr.x, fr.y, fr.w, fr.h, x, y, size, size);
  ctx.restore();
  return true;
}

/** Portrait key for a hero sprite key (`hero_x` -> `por_x`). */
export function portraitKey(spriteKey: string): string { return spriteKey.replace(/^hero_/, 'por_'); }

/** Draw the painted portrait for a sprite key into a square; false when there is none. */
export function drawPortrait(ctx: CanvasRenderingContext2D, spriteKey: string, x: number, y: number, size: number, ko = false): boolean {
  const key = portraitKey(spriteKey);
  const meta = atlas ? index.sprites[key] : undefined;
  const fr = meta ? index.frames[`${key}:idle:0`] : undefined;
  if (!meta || !fr || !atlas) return false;
  const k = size / Math.max(meta.cw, meta.ch);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (ko) ctx.filter = 'grayscale(1) brightness(0.9)';
  ctx.drawImage(atlas, fr.x, fr.y, fr.w, fr.h, x + fr.ox * k, y + fr.oy * k, fr.w * k, fr.h * k);
  ctx.restore();
  return true;
}

/** A round head-shot for the turn timeline: portrait if there is one, else the idle frame fitted into the circle. */
export function drawHead(ctx: CanvasRenderingContext2D, key: string, cx: number, cy: number, r: number): boolean {
  const meta = atlas ? index.sprites[key] : undefined;
  const por = atlas ? index.sprites[portraitKey(key)] : undefined;
  if (!meta && !por) return false;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  if (por) drawPortrait(ctx, key, cx - r * 1.25, cy - r * 1.15, r * 2.5);
  else if (meta) {
    const fr = index.frames[`${key}:idle:0`];
    if (fr && atlas) {
      const aw = fr.w * fr.px, ah = fr.h * fr.px;
      const k = (r * 2.3) / Math.max(aw, ah);
      ctx.imageSmoothingEnabled = !!meta.smooth;
      const mirror = meta.face === -1;
      ctx.translate(cx, cy);
      if (mirror) ctx.scale(-1, 1);
      ctx.drawImage(atlas, fr.x, fr.y, fr.w, fr.h, -aw * k / 2, -ah * k * 0.42, aw * k, ah * k);
    }
  }
  ctx.restore();
  return true;
}

function placeholder(ctx: CanvasRenderingContext2D, key: string, x: number, y: number, w: number, h: number, o: ActorOpts) {
  const base = o.ko ? '#9aa0a6' : actorColor(key);
  const r = Math.min(w, h) * 0.32;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, shade(base, 0.25));
  g.addColorStop(1, shade(base, -0.15));
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(2, w * 0.05);
  ctx.strokeStyle = shade(base, -0.5);
  ctx.stroke();
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  roundRect(ctx, x + w * 0.14, y + h * 0.08, w * 0.42, h * 0.16, h * 0.08);
  ctx.fill();
  // eyes
  const face = o.facing ?? 1;
  const ey = y + h * 0.36, ex = x + w / 2 + face * w * 0.08, sep = w * 0.16, er = Math.max(2, w * 0.085);
  for (const dx of [-sep, sep]) {
    if (o.ko) {
      ctx.strokeStyle = '#33393f';
      ctx.lineWidth = Math.max(1.5, w * 0.03);
      ctx.beginPath();
      ctx.moveTo(ex + dx - er, ey - er); ctx.lineTo(ex + dx + er, ey + er);
      ctx.moveTo(ex + dx + er, ey - er); ctx.lineTo(ex + dx - er, ey + er);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(ex + dx, ey, er, er * 1.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1d2b53';
      ctx.beginPath(); ctx.arc(ex + dx + face * er * 0.35, ey + er * 0.15, er * 0.55, 0, Math.PI * 2); ctx.fill();
    }
  }
  // initial
  if (o.label) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = shade(base, -0.55);
    ctx.lineWidth = Math.max(2, w * 0.05);
    ctx.font = `900 ${Math.round(h * 0.34)}px ui-rounded, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(o.label[0].toUpperCase(), x + w / 2, y + h * 0.7);
    ctx.fillText(o.label[0].toUpperCase(), x + w / 2, y + h * 0.7);
  }
  if (o.broken) {
    ctx.strokeStyle = '#ffd60a';
    ctx.lineWidth = Math.max(2, w * 0.04);
    ctx.setLineDash([w * 0.08, w * 0.06]);
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, r + 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ---------------------------------------------------------------- backdrops

/** Every backdrop in public/bg (tools/build-backgrounds.mjs). */
export const BG_KEYS = ['bg_meadow', 'bg_forest', 'bg_autumn', 'bg_autumn_red', 'bg_snow', 'bg_desert', 'bg_town', 'bg_cave', 'bg_dungeon', 'bg_arena',
  'bg_lake', 'bg_castle', 'bg_keep', 'bg_fort', 'bg_mountains', 'bg_sky', 'bg_bridge', 'bg_moon', 'bg_volcano', 'bg_jungle', 'bg_grass', 'bg_title', 'bg_map'];

/** Scene aliases for the generic keys the scenes pass. */
const BG_ALIAS: Record<string, string> = { title: 'bg_title', map: 'bg_map', battle: 'bg_meadow', battle_boss: 'bg_arena' };

function ensureBackground(key: string): CanvasImageSource | null {
  const img = backgrounds.get(key);
  if (img) return img;
  if (!bgState.has(key) && typeof Image !== 'undefined' && key.startsWith('bg_')) {
    bgState.set(key, 'loading');
    loadImage(`${BASE}bg/${key}.png`).then((i) => { backgrounds.set(key, i); bgState.delete(key); }, () => bgState.set(key, 'failed'));
  }
  return null;
}

/** Fixed pseudo-random sequence so backgrounds do not flicker. */
function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/**
 * Fill the whole w x h area with a scene backdrop. Keys: any `bg_*` file in public/bg, or the scene aliases 'battle',
 * 'battle_boss', 'map', 'title'. `scroll` pans tiled backdrops (the map). Draws a procedural stand-in while loading.
 */
export function drawBackground(ctx: CanvasRenderingContext2D, key: string, w: number, h: number, scroll = 0) {
  const real = BG_ALIAS[key] ?? key;
  const img = ensureBackground(real);
  if (img) {
    const iw = (img as HTMLImageElement).width, ih = (img as HTMLImageElement).height;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (real === 'bg_map') {
      // tiled at an integer scale
      const s = Math.max(2, Math.round(Math.min(w, h) / 160));
      const tw = iw * s, th = ih * s;
      const ox = -(((scroll * 0.6) % tw) + tw) % tw;
      for (let ty = 0; ty < h; ty += th) for (let tx = ox; tx < w; tx += tw) ctx.drawImage(img, tx, ty, tw, th);
    } else {
      // cover, anchored a little below centre so the ground stays in view
      const s = Math.max(w / iw, h / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) * 0.35, dw, dh);
    }
    ctx.restore();
    return;
  }
  if (real === 'bg_map') return mapBackground(ctx, w, h);
  const boss = key === 'battle_boss';
  const horizon = key === 'title' ? h * 0.62 : h * 0.5;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, boss ? '#ff8c69' : '#3fb6f5');
  sky.addColorStop(1, boss ? '#ffd6a5' : '#bdeeff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 2);
  // sun
  ctx.fillStyle = boss ? '#fff1a8' : '#ffe14d';
  ctx.beginPath(); ctx.arc(w * 0.82, horizon * 0.32, Math.min(w, h) * 0.07, 0, Math.PI * 2); ctx.fill();
  // clouds
  const rnd = lcg(7);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 5; i++) {
    const cx = rnd() * w, cy = horizon * (0.15 + rnd() * 0.45), s = Math.min(w, h) * (0.035 + rnd() * 0.03);
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.arc(cx + s, cy - s * 0.4, s * 1.2, 0, Math.PI * 2); ctx.arc(cx + s * 2.1, cy, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  // hills
  ctx.fillStyle = boss ? '#7aa34a' : '#8fd65a';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= w; x += w / 16) ctx.lineTo(x, horizon - Math.sin(x / w * Math.PI * 3 + 1) * h * 0.05 - h * 0.03);
  ctx.lineTo(w, horizon + 4); ctx.lineTo(0, horizon + 4); ctx.fill();
  // ground
  const gr = ctx.createLinearGradient(0, horizon, 0, h);
  gr.addColorStop(0, boss ? '#5f8f3a' : '#6cc644');
  gr.addColorStop(1, boss ? '#3e6b27' : '#3f9a2c');
  ctx.fillStyle = gr;
  ctx.fillRect(0, horizon, w, h - horizon);
  // grass tufts
  ctx.strokeStyle = 'rgba(30,90,20,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    const tx = rnd() * w, ty = horizon + 10 + rnd() * (h - horizon - 10);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 3, ty - 7); ctx.moveTo(tx, ty); ctx.lineTo(tx + 3, ty - 7); ctx.stroke();
  }
}

function mapBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#9be36d');
  g.addColorStop(1, '#5fbf3f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const rnd = lcg(11);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = i % 3 ? 'rgba(40,110,30,0.18)' : 'rgba(255,255,200,0.25)';
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 2 + rnd() * 5, 0, Math.PI * 2); ctx.fill();
  }
}

/** Canvas fonts (loaded from public/fonts via style.css). */
export const FONT_UI = '"Pixelify Sans", ui-rounded, system-ui, sans-serif';
export const FONT_NUM = '"Press Start 2P", ui-monospace, monospace';

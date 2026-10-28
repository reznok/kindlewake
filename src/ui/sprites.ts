/**
 * Sprite abstraction. Scenes only call `drawActor` / `drawBackground`; today they draw coloured placeholder shapes.
 * Real art drops in through `registerSprite` / `registerBackground` without touching the scenes.
 */
import { CHARACTERS } from '../data/characters';
import { ROLE_COLOR } from './palette';

export interface ActorOpts {
  /** Name; its initial is drawn on the placeholder. */
  label?: string;
  /** 0..1 white flash overlay. */
  flash?: number;
  alpha?: number;
  /** 1 faces right, -1 faces left. */
  facing?: 1 | -1;
  ko?: boolean;
  broken?: boolean;
  /** Time in ms for the idle bob (omit for a still pose). */
  time?: number;
}

export interface Frame { img: CanvasImageSource; sx: number; sy: number; sw: number; sh: number }

const frames = new Map<string, Frame>();
const backgrounds = new Map<string, CanvasImageSource>();

export function registerSprite(key: string, f: Frame) { frames.set(key, f); }
export function registerBackground(key: string, img: CanvasImageSource) { backgrounds.set(key, img); }

const ENEMY_COLOR: Record<string, string> = {
  en_slime: '#57cc99',
  en_wolf: '#8d99ae',
  en_golem: '#b08968',
  en_wisp: '#72ddf7',
  en_bandit: '#7b2cbf',
  en_boss: '#9d0208',
};

function hashHue(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; }

/** The base colour for a sprite key (also used by the timeline and portraits). */
export function actorColor(key: string): string {
  if (ENEMY_COLOR[key]) return ENEMY_COLOR[key];
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

/** Draw an actor into the box (x, y) top-left, w x h. */
export function drawActor(ctx: CanvasRenderingContext2D, key: string, x: number, y: number, w: number, h: number, opts: ActorOpts = {}) {
  ctx.save();
  ctx.globalAlpha *= opts.alpha ?? 1;
  const bob = opts.time !== undefined && !opts.ko ? Math.sin(opts.time / 260 + hashHue(key)) * h * 0.025 : 0;
  const f = frames.get(key);
  // ground shadow
  ctx.fillStyle = 'rgba(20,40,20,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - h * 0.02, w * 0.42, h * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  if (f) {
    ctx.save();
    if (opts.facing === -1) { ctx.translate(x + w, y + bob); ctx.scale(-1, 1); ctx.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, 0, 0, w, h); }
    else ctx.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, x, y + bob, w, h);
    ctx.restore();
  } else placeholder(ctx, key, x, y + bob, w, h * 0.94, opts);
  if (opts.flash && opts.flash > 0) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, opts.flash)})`;
    roundRect(ctx, x, y + bob, w, h, w * 0.3);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
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

/** Fixed pseudo-random sequence so backgrounds do not flicker. */
function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Fill the whole w x h area with a scene backdrop. Keys: 'battle', 'battle_boss', 'map', 'title'. */
export function drawBackground(ctx: CanvasRenderingContext2D, key: string, w: number, h: number) {
  const img = backgrounds.get(key);
  if (img) { ctx.drawImage(img, 0, 0, w, h); return; }
  if (key === 'map') return mapBackground(ctx, w, h);
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

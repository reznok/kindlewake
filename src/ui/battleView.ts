/** Battle scene drawing: layout, actors, bars, intents, timeline strip, targeting and timing rings. */
import { ABILITIES } from '../data/abilities';
import { STATUSES } from '../data/statuses';
import { type Combatant, byId, nextIntent, timeline } from '../engine/battle';
import type { BattleScene } from './battle';
import { INTENT_STYLE, STATUS_ABBR } from './palette';
import { type Anim, actorColor, drawActor, drawBackground, drawHead, drawIcon, FONT_NUM, hasIcon, FONT_UI, roundRect } from './sprites';
import { star } from './fx';

export interface Box { x: number; y: number; w: number; h: number; cx: number; cy: number; side: 'hero' | 'enemy' }

export interface Vis { hp: number; mp: number; brk: number; ox: number; oy: number; flash: number; alpha: number; anim?: Anim; animAt?: number }

export const TOP_H = 46;

const ENEMY_SPOTS: [number, number][][] = [
  [],
  [[0.27, 0.5]],
  [[0.31, 0.12], [0.17, 0.88]],
  [[0.33, 0], [0.15, 0.5], [0.33, 1]],
  [[0.35, 0], [0.15, 0.22], [0.35, 1], [0.15, 0.78]],
  [[0.39, 0], [0.25, 0.5], [0.39, 1], [0.11, 0.08], [0.11, 0.92]],
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function layoutBattle(sc: BattleScene): Map<string, Box> {
  const { w: W, h: H } = sc.surf;
  const bottom = H - sc.bottomH;
  const area = bottom - TOP_H;
  const k = clamp(area / 240, 0.68, 1.35);
  const out = new Map<string, Box>();
  const heroes = sc.heroSlots;
  heroes.forEach((id, i) => {
    // hero art cells are 160 x 112 (see tools/manifest.json); the box keeps that shape so every hero shares one scale
    const s = (heroes.length > 3 ? 78 : 88) * k, sw = s * (160 / 112);
    // spread the slots so the top box starts under the timeline and the bottom box ends above the command bar
    const slots = Math.max(3, heroes.length);
    const cy = TOP_H + s / 2 + Math.max(0, area - s - 2) * (i / (slots - 1));
    const cx = W * 0.655 + i * Math.min(34, W * 0.045);
    out.set(id, { x: cx - sw / 2, y: cy - s / 2, w: sw, h: s, cx, cy, side: 'hero' });
  });
  const enemies = sc.enemySlots;
  const n = Math.min(5, enemies.length);
  enemies.forEach((id, i) => {
    const c = byId(sc.state, id);
    const size = c?.size ?? 'medium';
    // enemy art cells are 80 / 128 / 200 px squares; boxes keep those proportions
    let s = (size === 'small' ? 56 : size === 'large' ? 124 : 82) * k * (n >= 3 ? 0.85 : 1);
    if (n === 1 && size === 'large') s *= 1.15;
    const spot = (ENEMY_SPOTS[n] ?? ENEMY_SPOTS[5])[i] ?? [0.1 + (i % 3) * 0.12, ((i * 0.37) % 1)];
    const yMin = TOP_H + 24 + s / 2, yMax = bottom - 34 - s / 2;
    const cy = yMax > yMin ? yMin + spot[1] * (yMax - yMin) : (yMin + yMax) / 2;
    const cx = W * spot[0];
    out.set(id, { x: cx - s / 2, y: cy - s / 2, w: s, h: s, cx, cy, side: 'enemy' });
  });
  return out;
}

export function drawBattle(sc: BattleScene, t: number) {
  const { ctx, w, h } = sc.surf;
  const st = sc.state;
  sc.fx.update();
  sc.boxes = layoutBattle(sc);
  drawBackground(ctx, st.encounter.background ?? 'bg_meadow', w, h);
  const [sx, sy] = sc.fx.shakeOffset();
  ctx.save();
  ctx.translate(sx, sy);
  const order = [...sc.enemySlots, ...sc.heroSlots];
  order.sort((a, b) => (sc.boxes.get(a)?.cy ?? 0) - (sc.boxes.get(b)?.cy ?? 0));
  for (const id of order) {
    const c = byId(st, id), b = sc.boxes.get(id);
    if (!c || !b) continue;
    if (c.side === 'enemy') drawEnemy(sc, ctx, c, b, t);
    else drawHero(sc, ctx, c, b, t);
  }
  drawTargeting(sc, ctx, t);
  drawRings(sc, ctx);
  ctx.restore();
  drawTimeline(sc, ctx);
  sc.fx.draw(ctx, w, h);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = '#fff', align: CanvasTextAlign = 'center') {
  ctx.font = `700 ${size}px ${FONT_UI}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(29,43,83,0.9)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function hpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, v: number, max: number, color: string, back = 'rgba(29,43,83,0.75)') {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = back;
  ctx.fill();
  const k = max > 0 ? Math.max(0, Math.min(1, v / max)) : 0;
  if (k > 0) {
    roundRect(ctx, x + 1.5, y + 1.5, Math.max(h - 3, (w - 3) * k), h - 3, (h - 3) / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function hpColor(k: number) { return k > 0.5 ? '#5ee05e' : k > 0.25 ? '#ffd43b' : '#ff5c5c'; }

function chips(ctx: CanvasRenderingContext2D, c: Combatant, x: number, y: number, maxW: number, align: 'left' | 'center') {
  // each chip: the status glyph plus turns left (falls back to the short name when there is no glyph)
  const list: { icon: string; text: string; abbr: string; color: string }[] = c.statuses.map((s) => ({
    icon: s.id, text: String(s.turns), abbr: (STATUS_ABBR[s.id] ?? s.id.slice(0, 3).toUpperCase()) + s.turns, color: STATUSES[s.id]?.color ?? '#ccc',
  }));
  if (c.guard) list.unshift({ icon: 'guard', text: '', abbr: 'GRD', color: '#7df9ff' });
  if (!list.length) return;
  ctx.font = `700 10px ${FONT_UI}`;
  const hasIcons = hasIcon('guard');
  const widths = list.map((l) => (hasIcons ? 14 + (l.text ? ctx.measureText(l.text).width + 3 : 0) : ctx.measureText(l.abbr).width + 8));
  const total = widths.reduce((a, b) => a + b + 2, -2);
  let cx = align === 'center' ? x - Math.min(total, maxW) / 2 : x;
  let row = 0;
  list.forEach((l, i) => {
    if (cx + widths[i] > x + maxW && align === 'left' && row === 0 && i > 0) { row = 1; cx = x; }
    const cy = y + row * 15;
    roundRect(ctx, cx, cy, widths[i], 14, 4);
    ctx.fillStyle = hasIcons ? 'rgba(255,255,255,0.92)' : l.color;
    ctx.fill();
    if (hasIcons) {
      ctx.lineWidth = 1.5; ctx.strokeStyle = l.color; ctx.stroke();
      if (!drawIcon(ctx, l.icon, cx + 1, cy + 1, 12)) { ctx.fillStyle = l.color; ctx.beginPath(); ctx.arc(cx + 7, cy + 7, 5, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = '#1d2b53';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(hasIcons ? l.text : l.abbr, cx + (hasIcons ? 14 : 4), cy + 7.5);
    cx += widths[i] + 2;
  });
}

function drawEnemy(sc: BattleScene, ctx: CanvasRenderingContext2D, c: Combatant, b: Box, t: number) {
  const v = sc.vis(c.id);
  if (v.alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = v.alpha;
  const x = b.x + v.ox, y = b.y + v.oy;
  if (sc.activeId === c.id) {
    ctx.fillStyle = 'rgba(255,90,90,0.35)';
    ctx.beginPath(); ctx.ellipse(b.cx + v.ox, b.y + b.h, b.w * 0.6, b.h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  }
  drawActor(ctx, c.sprite, x, y, b.w, b.h, { label: c.name, flash: v.flash, facing: 1, broken: c.broken, time: t, ko: c.ko, anim: v.anim, animAt: v.animAt });
  if (!c.ko) {
    // intent pill
    const plan = sc.state.plan && sc.state.actor === c.id ? sc.state.plan.intent : null;
    const intent = plan ?? nextIntent(c);
    const style = c.broken ? { glyph: '~', color: '#ffd60a' } : INTENT_STYLE[intent.kind];
    const nHits = ABILITIES[intent.ability]?.hits?.length ?? 0;
    const glyph = c.broken ? '' : intent.kind === 'multi' && nHits > 1 ? 'x' + nHits : style.glyph;
    const text = c.broken ? 'BROKEN' : intent.name;
    ctx.font = `700 11px ${FONT_UI}`;
    const tw = ctx.measureText(text).width;
    const gw = glyph ? ctx.measureText(glyph).width + 10 : 0;
    const pw = tw + gw + 12, ph = 18;
    const px = b.cx + v.ox - pw / 2, py = y - ph - 5;
    roundRect(ctx, px, py, pw, ph, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = style.color; ctx.stroke();
    if (glyph) {
      roundRect(ctx, px + 2, py + 2, gw, ph - 4, 7);
      ctx.fillStyle = style.color; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(glyph, px + 2 + gw / 2, py + ph / 2 + 0.5);
    }
    ctx.fillStyle = '#1d2b53'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, px + gw + 6, py + ph / 2 + 0.5);
    // name, hp, break pips
    const bw = Math.max(b.w, 74);
    const bx = b.cx - bw / 2;
    let by = b.y + b.h + 3;
    label(ctx, c.name, b.cx, by + 5, 11);
    by += 11;
    hpBar(ctx, bx, by, bw, 8, v.hp, c.maxHp, hpColor(v.hp / c.maxHp));
    by += 10;
    if (c.breakMax > 0) {
      const n = c.breakMax, gap = 2, pw2 = Math.min(10, (bw - gap * (n - 1)) / n);
      const total = n * pw2 + (n - 1) * gap;
      for (let i = 0; i < n; i++) {
        roundRect(ctx, b.cx - total / 2 + i * (pw2 + gap), by, pw2, 6, 2);
        ctx.fillStyle = c.broken ? '#ffd60a' : i < v.brk ? '#fff' : 'rgba(29,43,83,0.55)';
        ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(29,43,83,0.8)'; ctx.stroke();
      }
      by += 8;
    }
    chips(ctx, c, b.cx, by, bw + 20, 'center');
  }
  ctx.restore();
}

function drawHero(sc: BattleScene, ctx: CanvasRenderingContext2D, c: Combatant, b: Box, t: number) {
  const v = sc.vis(c.id);
  ctx.save();
  ctx.globalAlpha = Math.max(0.15, v.alpha);
  const x = b.x + v.ox, y = b.y + v.oy;
  const active = sc.activeId === c.id;
  if (active) {
    ctx.fillStyle = 'rgba(255,230,80,0.55)';
    ctx.beginPath(); ctx.ellipse(b.cx + v.ox, b.y + b.h, b.w * 0.62, b.h * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    const ay = y - 10 + Math.sin(t / 160) * 3;
    ctx.fillStyle = '#ffe14d'; ctx.strokeStyle = '#1d2b53'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(b.cx + v.ox - 8, ay - 10); ctx.lineTo(b.cx + v.ox + 8, ay - 10); ctx.lineTo(b.cx + v.ox, ay); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  drawActor(ctx, c.sprite, x, y, b.w, b.h, { label: c.name, flash: v.flash, facing: -1, ko: c.ko, time: t, anim: v.anim, animAt: v.animAt });
  // info block to the right
  const ix = b.x + b.w + 8, iw = Math.min(100, sc.surf.w - ix - 6);
  let iy = b.cy - 22;
  label(ctx, c.name, ix, iy + 5, 12, active ? '#ffe14d' : '#fff', 'left');
  iy += 11;
  hpBar(ctx, ix, iy, iw, 11, v.hp, c.maxHp, hpColor(v.hp / c.maxHp));
  ctx.font = `7px ${FONT_NUM}`;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.max(0, Math.round(v.hp))}/${c.maxHp}`, ix + iw - 4, iy + 6);
  iy += 13;
  hpBar(ctx, ix, iy, iw, 7, v.mp, c.maxMp, '#5aa9ff');
  ctx.font = `6px ${FONT_NUM}`;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(v.mp)} MP`, ix + iw - 4, iy + 3.8);
  iy += 9;
  chips(ctx, c, ix, iy, iw, 'left');
  ctx.restore();
}

function drawTargeting(sc: BattleScene, ctx: CanvasRenderingContext2D, t: number) {
  const tg = sc.targeting;
  if (!tg) return;
  tg.ids.forEach((id, i) => {
    const b = sc.boxes.get(id);
    if (!b) return;
    const sel = i === tg.idx;
    const bounce = Math.sin(t / 140) * 4;
    ctx.strokeStyle = sel ? '#ffe14d' : 'rgba(255,255,255,0.7)';
    ctx.lineWidth = sel ? 4 : 2;
    ctx.setLineDash(sel ? [] : [6, 5]);
    ctx.beginPath(); ctx.ellipse(b.cx, b.cy, b.w * 0.75, b.h * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    if (sel) {
      const top = b.side === 'enemy' ? b.y - 34 : b.y - 18;
      ctx.fillStyle = '#ffe14d'; ctx.strokeStyle = '#1d2b53'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.cx - 10, top - 14 + bounce); ctx.lineTo(b.cx + 10, top - 14 + bounce); ctx.lineTo(b.cx, top + bounce); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  });
}

function drawRings(sc: BattleScene, ctx: CanvasRenderingContext2D) {
  const w = sc.timing.active;
  if (!w || w.sizes.auto) return;
  const now = performance.now();
  w.impacts.forEach((imp, i) => {
    if (w.grades[i] !== null || now < w.ringStart[i]) return;
    const p = Math.max(0, Math.min(1, (imp - now) / (imp - w.ringStart[i])));
    const late = now > imp;
    const inGood = Math.abs(now - imp) <= w.sizes.good;
    for (const id of w.targets) {
      const b = sc.boxes.get(id);
      if (!b) continue;
      const rT = Math.max(b.w, b.h) * 0.58, r0 = rT * 2.6;
      const r = late ? rT : rT + (r0 - rT) * p;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(b.cx, b.cy, rT, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 6;
      ctx.strokeStyle = w.kind === 'guard' ? (inGood ? '#7df9ff' : '#d8fbff') : inGood ? '#ffe14d' : '#ffffff';
      ctx.beginPath(); ctx.arc(b.cx, b.cy, r, 0, Math.PI * 2); ctx.stroke();
      if (i === w.grades.findIndex((g) => g === null)) {
        label(ctx, w.kind === 'guard' ? 'GUARD!' : 'TAP!', b.cx, b.y - (b.side === 'enemy' ? 34 : 14), 13, w.kind === 'guard' ? '#7df9ff' : '#ffe14d');
      }
    }
  });
}

function drawTimeline(sc: BattleScene, ctx: CanvasRenderingContext2D) {
  const ids = sc.state.over ? [] : timeline(sc.state, 8);
  const x0 = 8, y0 = 6, s = Math.min(32, (sc.surf.w * 0.55) / 8.6);
  roundRect(ctx, x0 - 4, y0 - 3, ids.length * (s + 4) + 10, s + 8, (s + 8) / 2);
  ctx.fillStyle = 'rgba(29,43,83,0.55)';
  ctx.fill();
  ids.forEach((id, i) => {
    const c = byId(sc.state, id);
    if (!c) return;
    const size = i === 0 ? s + 2 : s - 2;
    const x = x0 + i * (s + 4) + (i === 0 ? 0 : 3), y = y0 + (s - size) / 2 + 1;
    ctx.fillStyle = c.side === 'hero' ? '#bdeeff' : '#ffd6e0';
    if (!c.sprite || !(c.sprite.startsWith('hero_') || c.sprite.startsWith('mon_'))) ctx.fillStyle = actorColor(c.sprite);
    ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
    const head = drawHead(ctx, c.sprite, x + size / 2, y + size / 2, size / 2 - 1);
    if (!head) { ctx.fillStyle = actorColor(c.sprite); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.lineWidth = i === 0 ? 3 : 2;
    ctx.strokeStyle = c.side === 'hero' ? '#ffffff' : '#ff4d6d';
    if (i === 0) ctx.strokeStyle = '#ffe14d';
    ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.stroke();
    if (!head) label(ctx, c.name[0].toUpperCase(), x + size / 2, y + size / 2 + 1, Math.round(size * 0.5));
    if (i === 0) { ctx.fillStyle = '#ffe14d'; star(ctx, x + size - 2, y + 3, 4); }
  });
}

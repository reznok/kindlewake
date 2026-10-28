/** Battle scene drawing: layout, actors, bars, intents, timeline strip, targeting and timing rings. */
import type { DamageType } from '../core/types';
import { ABILITIES } from '../data/abilities';
import { STATUSES } from '../data/statuses';
import { type Combatant, byId, nextIntent, timeline } from '../engine/battle';
import type { BattleScene } from './battle';
import { INTENT_STYLE, STATUS_ABBR, TYPE_COLOR } from './palette';
import { speaker } from './flavour';
import { type Anim, actorColor, drawActor, drawBackground, drawHead, drawIcon, hasIcon, FONT_UI, roundRect } from './sprites';
import { star } from './fx';

export interface Box { x: number; y: number; w: number; h: number; cx: number; cy: number; side: 'hero' | 'enemy' }

/** What a foe looks like on screen. A boss reshapes in the engine before its reveal plays, so the old shape is held. */
export interface Shape { name: string; sprite: string; size: Combatant['size']; weak: DamageType[]; resist: DamageType[]; immune: DamageType[]; breakMax: number }

export interface Vis {
  hp: number; mp: number; brk: number; ox: number; oy: number; flash: number; alpha: number; anim?: Anim; animAt?: number; facing?: 1 | -1;
  /** Shown KO / Broken state: set by the playback events, not the engine's final state. */
  ko?: boolean; broken?: boolean;
  /** Held pre-step shape (see Shape); cleared when the `phase` event plays. */
  shape?: Shape;
}

export function shapeOf(c: Combatant): Shape {
  return { name: c.name, sprite: c.sprite, size: c.size, weak: [...c.weak], resist: [...c.resist], immune: [...c.immune], breakMax: c.breakMax };
}

/** The shape to draw: the held one while a reveal is pending, else the live one. */
export function shown(sc: BattleScene, c: Combatant): Shape { return sc.vis(c.id).shape ?? c; }

export type Verdict = 'weak' | 'resist' | 'immune' | null;

/** How a set of damage types lands on a foe: any weakness wins; all immune; all resisted (or immune). */
export function verdict(types: DamageType[], f: Pick<Shape, 'weak' | 'resist' | 'immune'>): Verdict {
  if (!types.length) return null;
  if (types.some((t) => f.weak.includes(t))) return 'weak';
  if (types.every((t) => f.immune.includes(t))) return 'immune';
  if (types.every((t) => f.resist.includes(t) || f.immune.includes(t))) return 'resist';
  return null;
}

export const VERDICT_TEXT: Record<'weak' | 'resist' | 'immune', string> = { weak: 'WEAK', resist: 'resist', immune: 'immune' };

export const TOP_H = 46;

const BG_DIM: Record<string, number> = { bg_bridge: 0.2 };

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
  // summons beside a large foe stack in a column to its left, so they never sit on its name and bar
  const big = sc.enemySlots.map((id) => byId(sc.state, id)).find((c) => c && !c.summoned && !c.ko && shown(sc, c).size === 'large');
  const summons = big ? sc.enemySlots.filter((id) => byId(sc.state, id)?.summoned) : [];
  const enemies = sc.enemySlots.filter((id) => !summons.includes(id));
  const n = Math.min(5, enemies.length);
  enemies.forEach((id, i) => {
    const c = byId(sc.state, id);
    const size = c ? shown(sc, c).size : 'medium';
    // enemy art cells are 80 / 128 / 200 px squares; boxes keep those proportions
    let s = (size === 'small' ? 56 : size === 'large' ? 124 : 82) * k * (n >= 3 ? 0.85 : 1);
    if (n === 1 && size === 'large') s *= 1.15;
    const spot = (ENEMY_SPOTS[n] ?? ENEMY_SPOTS[5])[i] ?? [0.1 + (i % 3) * 0.12, ((i * 0.37) % 1)];
    const yMin = TOP_H + 24 + s / 2, yMax = bottom - 34 - s / 2;
    const cy = yMax > yMin ? yMin + spot[1] * (yMax - yMin) : (yMin + yMax) / 2;
    const cx = W * spot[0];
    out.set(id, { x: cx - s / 2, y: cy - s / 2, w: s, h: s, cx, cy, side: 'enemy' });
  });
  const bb = big ? out.get(big.id) : undefined;
  if (bb && summons.length) {
    // each summon needs its pill, art, name, bar, pips and dots stacked (~110 px at k = 1)
    const top = TOP_H + 24, span = bottom - 40 - top;
    const perCol = Math.max(1, Math.floor(span / (110 * k)));
    const cols = Math.ceil(summons.length / perCol);
    const colW = 84;
    // make room on the left by sliding the big foe right when the columns do not fit
    const need = cols * colW + 8 - bb.x;
    if (need > 0) { bb.x += need; bb.cx += need; }
    summons.forEach((id, i) => {
      const c = byId(sc.state, id);
      const size = c ? shown(sc, c).size : 'small';
      const s = (size === 'small' ? 50 : size === 'large' ? 90 : 64) * k * 0.85;
      const col = Math.floor(i / perCol), row = i % perCol;
      const inCol = Math.min(perCol, summons.length - col * perCol);
      const cx = bb.x - 6 - colW / 2 - col * colW;
      const cy = top + (row + 0.5) * (span / inCol);
      out.set(id, { x: cx - s / 2, y: cy - s / 2, w: s, h: s, cx, cy, side: 'enemy' });
    });
  }
  return out;
}

export function drawBattle(sc: BattleScene, t: number) {
  const { ctx, w, h } = sc.surf;
  const st = sc.state;
  sc.fx.update();
  sc.boxes = layoutBattle(sc);
  const bg = st.encounter.background ?? 'bg_meadow';
  drawBackground(ctx, bg, w, h);
  // busy backdrops are dimmed so the actors read against them
  const dim = BG_DIM[bg];
  if (dim) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, w, h); }
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

/** A number on a bar: the UI face, outlined, right-aligned. */
function barText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  ctx.font = `700 ${size}px ${FONT_UI}`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(29,43,83,0.95)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y);
}

function hpColor(k: number) { return k > 0.5 ? '#5ee05e' : k > 0.25 ? '#ffd43b' : '#ff5c5c'; }

function chips(ctx: CanvasRenderingContext2D, c: Combatant, x: number, y: number, maxW: number, align: 'left' | 'center') {
  // 16 px chips: the status glyph plus turns left, on a buff (green) or debuff (red) ground
  const list: { icon: string; text: string; abbr: string; color: string; bad: boolean }[] = c.statuses.map((s) => ({
    icon: s.id, text: String(s.turns), abbr: (STATUS_ABBR[s.id] ?? s.id.slice(0, 3).toUpperCase()) + s.turns, color: STATUSES[s.id]?.color ?? '#ccc', bad: !!STATUSES[s.id]?.bad,
  }));
  if (c.guard) list.unshift({ icon: 'guard', text: '', abbr: 'GRD', color: '#7df9ff', bad: false });
  if (!list.length) return;
  const H = 16;
  ctx.font = `700 11px ${FONT_UI}`;
  const hasIcons = hasIcon('guard');
  const widths = list.map((l) => (hasIcons ? H + (l.text ? ctx.measureText(l.text).width + 4 : 0) : ctx.measureText(l.abbr).width + 8));
  const total = widths.reduce((a, b) => a + b + 2, -2);
  let cx = align === 'center' ? x - Math.min(total, maxW) / 2 : x;
  let row = 0;
  list.forEach((l, i) => {
    if (cx + widths[i] > x + maxW && align === 'left' && row === 0 && i > 0) { row = 1; cx = x; }
    const cy = y + row * (H + 2);
    roundRect(ctx, cx, cy, widths[i], H, 5);
    ctx.fillStyle = l.bad ? '#ffd3d3' : '#c9f7e0';
    ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = l.bad ? '#d6336c' : '#0ca678'; ctx.stroke();
    if (hasIcons && !drawIcon(ctx, l.icon, cx + 1, cy + 1, H - 2)) { ctx.fillStyle = l.color; ctx.beginPath(); ctx.arc(cx + H / 2, cy + H / 2, H / 2 - 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#1d2b53';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(hasIcons ? l.text : l.abbr, cx + (hasIcons ? H + 1 : 4), cy + H / 2 + 0.5);
    cx += widths[i] + 2;
  });
}

/** Weak types as dots under a foe: weak bright, resisted dimmed, immune dimmed and crossed. Returns the row height. */
function typeDots(ctx: CanvasRenderingContext2D, sh: Shape, cx: number, y: number): number {
  const items: { t: DamageType; k: 'weak' | 'resist' | 'immune' }[] = [
    ...sh.weak.map((t) => ({ t, k: 'weak' as const })),
    ...sh.resist.filter((t) => !sh.immune.includes(t)).map((t) => ({ t, k: 'resist' as const })),
    ...sh.immune.map((t) => ({ t, k: 'immune' as const })),
  ];
  if (!items.length) return 0;
  const d = 10, gap = 3, split = sh.weak.length && items.length > sh.weak.length ? 5 : 0;
  const total = items.length * d + (items.length - 1) * gap + split;
  roundRect(ctx, cx - total / 2 - 4, y, total + 8, d + 4, (d + 4) / 2);
  ctx.fillStyle = 'rgba(29,43,83,0.6)';
  ctx.fill();
  let x = cx - total / 2 + d / 2;
  items.forEach((it, i) => {
    if (i === sh.weak.length && split) x += split;
    const yy = y + 2 + d / 2;
    ctx.save();
    ctx.globalAlpha *= it.k === 'weak' ? 1 : 0.4;
    ctx.fillStyle = TYPE_COLOR[it.t];
    ctx.beginPath(); ctx.arc(x, yy, d / 2, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = it.k === 'weak' ? '#fff' : '#1d2b53'; ctx.stroke();
    ctx.restore();
    if (it.k === 'immune') {
      ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 4, yy - 4); ctx.lineTo(x + 4, yy + 4); ctx.moveTo(x + 4, yy - 4); ctx.lineTo(x - 4, yy + 4); ctx.stroke();
    }
    x += d + gap;
  });
  return d + 6;
}

function drawEnemy(sc: BattleScene, ctx: CanvasRenderingContext2D, c: Combatant, b: Box, t: number) {
  const v = sc.vis(c.id);
  if (v.alpha <= 0.01) return;
  const sh = shown(sc, c);
  const ko = v.ko ?? c.ko, broken = v.broken ?? c.broken;
  ctx.save();
  ctx.globalAlpha = v.alpha;
  const x = b.x + v.ox, y = b.y + v.oy;
  if (sc.activeId === c.id) {
    ctx.fillStyle = 'rgba(255,90,90,0.35)';
    ctx.beginPath(); ctx.ellipse(b.cx + v.ox, b.y + b.h, b.w * 0.6, b.h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  }
  // routed foes run off upright (see BattleScene.scarper) instead of tipping over
  drawActor(ctx, sh.sprite, x, y, b.w, b.h, { label: sh.name, flash: v.flash, facing: v.facing ?? 1, broken: broken && !ko, time: t, anim: v.anim, animAt: v.animAt });
  if (!ko) {
    // intent pill
    const plan = sc.state.plan && sc.state.actor === c.id ? sc.state.plan.intent : null;
    const intent = plan ?? nextIntent(c);
    const style = broken ? { glyph: '~', color: '#ffd60a' } : INTENT_STYLE[intent.kind];
    const nHits = ABILITIES[intent.ability]?.hits?.length ?? 0;
    const glyph = broken ? '' : intent.kind === 'multi' && nHits > 1 ? 'x' + nHits : style.glyph;
    const text = broken ? 'BROKEN' : intent.name;
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
    label(ctx, sh.name, b.cx, by + 6, 12);
    by += 13;
    hpBar(ctx, bx, by, bw, 8, v.hp, c.maxHp, hpColor(v.hp / c.maxHp));
    by += 10;
    if (sh.breakMax > 0) {
      const n = sh.breakMax, gap = 2, pw2 = Math.min(10, (bw - gap * (n - 1)) / n);
      const total = n * pw2 + (n - 1) * gap;
      for (let i = 0; i < n; i++) {
        roundRect(ctx, b.cx - total / 2 + i * (pw2 + gap), by, pw2, 6, 2);
        ctx.fillStyle = broken ? '#ffd60a' : i < v.brk ? '#fff' : 'rgba(29,43,83,0.55)';
        ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(29,43,83,0.8)'; ctx.stroke();
      }
      by += 8;
    }
    by += typeDots(ctx, sh, b.cx, by);
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
    // the marker sits at the hero's left at mid-height, pointing in, so it never lands beside the hero above
    const ax = b.x + v.ox + b.w * 0.12 - 4 + Math.sin(t / 160) * 3, ay = b.cy + v.oy;
    ctx.fillStyle = '#ffe14d'; ctx.strokeStyle = '#1d2b53'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax - 12, ay - 9); ctx.lineTo(ax - 12, ay + 9); ctx.lineTo(ax, ay); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  drawActor(ctx, c.sprite, x, y, b.w, b.h, { label: c.name, flash: v.flash, facing: -1, ko: v.ko ?? c.ko, time: t, anim: v.anim, animAt: v.animAt });
  // info block to the right
  const ix = b.x + b.w + 8, iw = Math.min(100, sc.surf.w - ix - 6);
  let iy = b.cy - 26;
  // the short name ("Dell", not the full one) so it fits beside the bars on a phone
  label(ctx, speaker(c.def), ix, iy + 6, 12, active ? '#ffe14d' : '#fff', 'left');
  iy += 13;
  hpBar(ctx, ix, iy, iw, 14, v.hp, c.maxHp, hpColor(v.hp / c.maxHp));
  barText(ctx, `${Math.max(0, Math.round(v.hp))}/${c.maxHp}`, ix + iw - 5, iy + 7.5, 11);
  iy += 16;
  hpBar(ctx, ix, iy, iw, 12, v.mp, c.maxMp, '#5aa9ff');
  barText(ctx, `${Math.max(0, Math.round(v.mp))} MP`, ix + iw - 5, iy + 6.5, 10);
  iy += 14;
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
    // how this command lands on each foe
    const c = b.side === 'enemy' ? byId(sc.state, id) : undefined;
    const sh = c ? shown(sc, c) : undefined;
    const vd = sh && tg.types?.length ? verdict(tg.types, sh) : null;
    if (sh && vd) {
      const wt = tg.types!.find((ty) => sh.weak.includes(ty));
      tag(ctx, VERDICT_TEXT[vd], b.cx, b.y + Math.min(18, b.h * 0.2), vd === 'weak' ? (wt ? TYPE_COLOR[wt] : '#ffe14d') : vd === 'immune' ? '#ff8fab' : '#dde3ee', vd === 'weak' ? 14 : 12, sel);
    }
  });
}

/** A small pill label on the field (verdicts). */
function tag(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size: number, strong: boolean) {
  ctx.font = `700 ${size}px ${FONT_UI}`;
  const w = ctx.measureText(text).width + 12, h = size + 6;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = strong ? 'rgba(29,43,83,0.92)' : 'rgba(29,43,83,0.75)';
  ctx.fill();
  ctx.lineWidth = strong ? 2 : 1.5; ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.5);
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
    const c0 = byId(sc.state, id);
    if (!c0) return;
    const c = { ...c0, ...shown(sc, c0) };
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

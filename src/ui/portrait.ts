/** Small DOM portraits and shared info blocks (stats, abilities, type tags). */
import { ABILITIES } from '../data/abilities';
import type { AbilityDef, DamageType, Stats, TargetMode } from '../core/types';
import { STAT_KEYS } from '../core/types';
import { statLabel } from '../engine/stats';
import { el } from './dom';
import { TYPE_COLOR, cap } from './palette';
import { drawActor, drawIcon, drawPortrait, hasSprite } from './sprites';

export function portrait(key: string, label: string, size = 48, opts: { ko?: boolean } = {}): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(size * dpr);
  c.height = Math.round(size * dpr);
  c.style.width = size + 'px';
  c.style.height = size + 'px';
  c.className = 'portrait';
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  // painted portrait when the atlas has one (por_<id>), else the battler's idle frame
  if (!drawPortrait(ctx, key, 0, 0, size, opts.ko)) {
    if (hasSprite(key)) drawActor(ctx, key, size * 0.04, size * 0.04, size * 0.92, size * 0.92, { label, facing: 1 });
    else drawActor(ctx, key, size * 0.08, size * 0.06, size * 0.84, size * 0.88, { label, facing: 1, ko: opts.ko });
  }
  return c;
}

/** A small DOM icon for an element / status glyph (falls back to a coloured dot). */
export function iconEl(name: string, size = 14, color = '#ccc'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(size * dpr);
  c.height = Math.round(size * dpr);
  c.style.width = size + 'px';
  c.style.height = size + 'px';
  c.className = 'icon';
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  if (!drawIcon(ctx, name, 0, 0, size)) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2.5, 0, Math.PI * 2); ctx.fill(); }
  return c;
}

export function typeTag(t: DamageType): HTMLElement {
  return el('span.type-tag', { style: { background: TYPE_COLOR[t] }, title: cap(t) }, iconEl(t, 12, TYPE_COLOR[t]), cap(t));
}

export function typeDot(t: DamageType): HTMLElement {
  return el('span.type-dot', { style: { background: TYPE_COLOR[t] }, title: cap(t) });
}

export function statGrid(st: Stats, compare?: Stats): HTMLElement {
  return el('div.stat-grid', STAT_KEYS.map((k) => {
    const diff = compare ? st[k] - compare[k] : 0;
    return el('div.stat', el('span.k', statLabel(k)), el('span.v', String(st[k]), diff ? el('small.' + (diff > 0 ? 'up' : 'down'), (diff > 0 ? ' +' : ' ') + diff) : null));
  }));
}

const TARGET_TEXT: Record<TargetMode, string> = {
  enemy: 'one foe', enemies: 'all foes', ally: 'one ally', allies: 'all allies', self: 'self', enemyRandom: 'random foe', allyKo: 'fallen ally',
};

export function abilityRow(id: string, extra?: HTMLElement | null): HTMLElement {
  const a: AbilityDef | undefined = ABILITIES[id];
  if (!a) return el('div.ability', id);
  const types = [...new Set((a.hits ?? []).map((h) => h.type))];
  return el('div.ability',
    el('div.ab-head', el('b', a.name), a.mp ? el('span.mp-cost', a.mp + ' MP') : el('span.mp-cost.free', 'free'), types.map(typeTag),
      (a.hits?.length ?? 0) > 1 ? el('span.hits', a.hits!.length + ' hits') : null, el('span.target', TARGET_TEXT[a.target])),
    el('div.ab-desc', a.desc),
    extra ?? null,
  );
}

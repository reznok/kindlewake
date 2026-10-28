import type { DamageType, IntentKind, NodeKind, Role, StatusId } from '../core/types';

export const TYPE_COLOR: Record<DamageType, string> = {
  slash: '#ff4d6d',
  pierce: '#9aa5b1',
  blunt: '#b5713a',
  fire: '#ff7b00',
  frost: '#4cc9f0',
  storm: '#ffd60a',
  spirit: '#b388ff',
};

export const KIND_COLOR: Record<NodeKind, string> = {
  fight: '#ff6b6b',
  elite: '#9b5de5',
  event: '#00a6ed',
  recruit: '#06d6a0',
  camp: '#ff9f1c',
  shop: '#ffd43b',
  boss: '#d00000',
  start: '#ffffff',
};

export const KIND_GLYPH: Record<NodeKind, string> = {
  fight: '!', elite: 'E', event: '?', recruit: '+', camp: 'C', shop: '$', boss: 'B', start: 'S',
};

export const ROLE_COLOR: Record<Role, string> = {
  tank: '#4361ee',
  striker: '#ef476f',
  mender: '#06d6a0',
  trickster: '#9b5de5',
  caster: '#ff7b00',
  warden: '#5c7c99',
  support: '#ffb703',
  wildcard: '#f15bb5',
};

export const INTENT_STYLE: Record<IntentKind, { glyph: string; color: string }> = {
  attack: { glyph: '!', color: '#ff6b6b' },
  heavy: { glyph: '!!', color: '#c1121f' },
  multi: { glyph: 'x', color: '#ff8fab' },
  buff: { glyph: '+', color: '#ff9f1c' },
  debuff: { glyph: '-', color: '#9b5de5' },
  heal: { glyph: '♥', color: '#06d6a0' },
  summon: { glyph: '*', color: '#00a6ed' },
  charge: { glyph: '>>', color: '#e85d04' },
  wait: { glyph: 'z', color: '#8d99ae' },
};

export const STATUS_ABBR: Record<StatusId, string> = {
  poison: 'PSN', burn: 'BRN', chill: 'CHL', shock: 'SHK', bleed: 'BLD', taunt: 'TNT', regen: 'RGN', barrier: 'BAR',
  atkUp: 'ATK+', atkDown: 'ATK-', defUp: 'DEF+', defDown: 'DEF-', haste: 'HST', slow: 'SLW',
};

export function cap(s: string): string { return s ? s[0].toUpperCase() + s.slice(1) : s; }

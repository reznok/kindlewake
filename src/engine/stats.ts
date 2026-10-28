import type { CharacterDef, PartyMember, Passive, PassiveId, Run, SparkDef, Stats, StatKey } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { STAT_KEYS } from '../core/types';

export function charDef(m: PartyMember): CharacterDef { return CHARACTERS[m.def]; }

export function sparkDef(m: PartyMember, id: string): SparkDef | undefined { return charDef(m).sparks.find((s) => s.id === id); }

/** XP needed to reach a level (cumulative). */
export function xpForLevel(level: number): number { return Math.round(20 * Math.pow(Math.max(0, level - 1), 1.5)); }

export const MAX_LEVEL = 20;

/** Stats from class, level, sparks and gear. No statuses (those are battle-time). */
export function memberStats(m: PartyMember, run?: Run | null): Stats {
  const d = charDef(m);
  const out = { ...d.base } as Stats;
  for (const k of STAT_KEYS) out[k] += (d.growth[k] ?? 0) * (m.level - 1) + (m.bumps?.[k] ?? 0);
  for (const sid of m.sparks) {
    const s = sparkDef(m, sid);
    if (s?.effect.kind === 'stat') out[s.effect.stat] += s.effect.amount;
  }
  for (const p of memberPassives(m, run)) {
    if (p.id === 'spdPlus') out.spd += p.power ?? 2;
  }
  for (const k of STAT_KEYS) out[k] = Math.max(k === 'hp' ? 1 : 0, Math.round(out[k]));
  return out;
}

/** Abilities the member can use: starting four, plus spark grants/replacements. */
export function memberAbilities(m: PartyMember): string[] {
  const d = charDef(m);
  let list = [...d.abilities];
  for (const sid of m.sparks) {
    const s = sparkDef(m, sid);
    if (!s) continue;
    if (s.effect.kind === 'ability' && !list.includes(s.effect.id)) list.push(s.effect.id);
    if (s.effect.kind === 'replace') list = list.map((a) => a === (s.effect as { from: string }).from ? (s.effect as { to: string }).to : a);
  }
  return list;
}

/** Passives from sparks, gear and (if a run is given) relics. */
export function memberPassives(m: PartyMember, run?: Run | null): Passive[] {
  const out: Passive[] = [];
  for (const sid of m.sparks) {
    const s = sparkDef(m, sid);
    if (s?.effect.kind === 'passive') out.push(s.effect.passive);
  }
  for (const it of [m.weapon, m.trinket]) {
    const p = it && ITEMS[it.def]?.passive;
    if (p) out.push(p);
  }
  if (run) for (const r of run.relics) { const p = RELICS[r]?.passive; if (p) out.push(p); }
  return out;
}

export function passivePower(list: Passive[], id: PassiveId): number {
  let n = 0;
  for (const p of list) if (p.id === id) n += p.power ?? 1;
  return n;
}

export function hasPassive(list: Passive[], id: PassiveId): boolean { return list.some((p) => p.id === id); }

/** Weapon damage type and power for the plain Attack command. */
export function memberWeapon(m: PartyMember): { type: import('../core/types').DamageType; power: number; name: string } {
  const def = m.weapon ? ITEMS[m.weapon.def] : ITEMS[charDef(m).weapon];
  const plus = m.weapon?.plus ?? 0;
  return { type: def?.type ?? 'blunt', power: (def?.power ?? 100) + plus * 10, name: def?.name ?? 'Fists' };
}

export function statLabel(k: StatKey): string {
  return { hp: 'HP', mp: 'MP', atk: 'Attack', mag: 'Magic', def: 'Defence', res: 'Resist', spd: 'Speed', luck: 'Luck' }[k];
}

/**
 * Pure, deterministic battle engine. No DOM. The UI (or the bot) decides actions and timing grades; the engine applies
 * them and records events for animation.
 *
 * Flow: `createBattle` -> loop { if `state.actor` is a hero: `step(state, action, { grades })`;
 * else `step(state, null, { guard })` } until `state.over`.
 */
import { Rng } from '../core/rng';
import type { AbilityDef, DamageType, Effect, EncounterDef, Grade, Hit, IntentDef, ItemInst, Passive, PartyMember, Run, Stats, StatusId, TargetMode } from '../core/types';
import { ABILITIES } from '../data/abilities';
import { ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import { STATUSES } from '../data/statuses';
import { charDef, memberAbilities, memberPassives, memberStats, memberWeapon, passivePower, hasPassive } from './stats';

export interface StatusInst { id: StatusId; turns: number; power?: number }

export interface Combatant {
  id: string;
  side: 'hero' | 'enemy';
  def: string;
  name: string;
  level: number;
  hp: number; maxHp: number; mp: number; maxMp: number;
  base: Stats;
  statuses: StatusInst[];
  tick: number;
  breakMax: number; breakNow: number; broken: boolean;
  guard: boolean;
  ko: boolean;
  passives: Passive[];
  abilities: string[];
  weapon: { type: DamageType; power: number };
  weak: DamageType[]; resist: DamageType[]; immune: DamageType[];
  intentIdx: number;
  phase: number;
  summoned?: boolean;
  cheated?: boolean;
  /** Link back to the party member (heroes). */
  member?: string;
  sprite: string;
  size: 'small' | 'medium' | 'large';
  acted: number;
}

export type BattleAction =
  | { t: 'attack'; target: string }
  | { t: 'skill'; id: string; target?: string }
  | { t: 'item'; item: string; target?: string }
  | { t: 'guard' }
  | { t: 'swap'; member: string }
  | { t: 'flee' };

/** Timing grades from the input layer. `grades` per hero hit; `guard` per enemy hit (the targeted heroes' taps). */
export interface Timing { grades?: Grade[]; guard?: Grade[] }

export type BattleEvent =
  | { kind: 'turn'; who: string }
  | { kind: 'use'; who: string; ability: string; name: string; targets: string[] }
  | { kind: 'hit'; who: string; target: string; dmg: number; type: DamageType; grade: Grade; crit: boolean; weak: boolean; resist: boolean; immune: boolean; guarded: boolean }
  | { kind: 'heal'; who: string; target: string; amount: number }
  | { kind: 'mp'; target: string; amount: number }
  | { kind: 'status'; target: string; id: StatusId; on: boolean }
  | { kind: 'chip'; target: string; amount: number; left: number }
  | { kind: 'break'; target: string }
  | { kind: 'recover'; target: string }
  | { kind: 'ko'; target: string }
  | { kind: 'revive'; target: string }
  | { kind: 'guard'; who: string }
  | { kind: 'swap'; out: string; in: string }
  | { kind: 'reinforce'; in: string }
  | { kind: 'summon'; who: string; enemy: string }
  | { kind: 'phase'; who: string; message: string }
  | { kind: 'tick'; who: string; id: StatusId; amount: number }
  | { kind: 'flee'; ok: boolean }
  | { kind: 'cheatDeath'; who: string }
  | { kind: 'counter'; who: string; target: string; dmg: number }
  | { kind: 'msg'; text: string }
  | { kind: 'end'; result: 'win' | 'lose' | 'flee' };

export interface EnemyPlan { ability: string; targets: string[]; intent: IntentDef }

export interface BattleState {
  rng: Rng;
  encounter: EncounterDef;
  heroes: Combatant[];
  bench: Combatant[];
  enemies: Combatant[];
  bag: ItemInst[];
  actor: string | null;
  plan: EnemyPlan | null;
  turns: number;
  over: null | 'win' | 'lose' | 'flee';
  events: BattleEvent[];
  nextId: number;
  /** Party-wide passives (relics) live here so summons and swaps see them. */
  partyPassives: Passive[];
  stats: { perfects: number; breaks: number; kills: number };
}

export const GRADE_MULT: Record<Grade, number> = { miss: 0.9, good: 1, perfect: 1.25 };
export const GUARD_MULT: Record<Grade, number> = { miss: 1, good: 0.7, perfect: 0.5 };

// ---------------------------------------------------------------- helpers

export function all(s: BattleState): Combatant[] { return [...s.heroes, ...s.enemies]; }
export function byId(s: BattleState, id: string): Combatant | undefined { return all(s).find((c) => c.id === id) ?? s.bench.find((c) => c.id === id); }
export function alive(list: Combatant[]): Combatant[] { return list.filter((c) => !c.ko); }
export function foesOf(s: BattleState, c: Combatant): Combatant[] { return alive(c.side === 'hero' ? s.enemies : s.heroes); }
export function alliesOf(s: BattleState, c: Combatant): Combatant[] { return alive(c.side === 'hero' ? s.heroes : s.enemies); }

export function eff(c: Combatant, k: 'atk' | 'mag' | 'def' | 'res' | 'spd'): number {
  let v = c.base[k];
  for (const st of c.statuses) { const m = STATUSES[st.id].mods?.[k]; if (m) v *= m; }
  return Math.max(1, v);
}

export function turnCost(c: Combatant, mult = 1): number { return Math.max(60, Math.round((1000 / eff(c, 'spd')) * mult)); }

export function hasStatus(c: Combatant, id: StatusId): StatusInst | undefined { return c.statuses.find((s) => s.id === id); }

function emit(s: BattleState, e: BattleEvent) { s.events.push(e); }

function passives(s: BattleState, c: Combatant): Passive[] { return c.side === 'hero' ? [...c.passives, ...s.partyPassives] : c.passives; }

// ---------------------------------------------------------------- creation

export function heroCombatant(s: BattleState | null, m: PartyMember, run: Run | null): Combatant {
  const d = charDef(m);
  const st = memberStats(m, run);
  const w = memberWeapon(m);
  return {
    id: 'h:' + m.id, side: 'hero', def: m.def, name: d.name, level: m.level,
    hp: Math.min(m.hp, st.hp), maxHp: st.hp, mp: Math.min(m.mp, st.mp), maxMp: st.mp,
    base: st, statuses: [], tick: 0, breakMax: 0, breakNow: 0, broken: false, guard: false, ko: m.hp <= 0,
    passives: memberPassives(m, null), abilities: memberAbilities(m), weapon: { type: w.type, power: w.power },
    weak: [], resist: [], immune: [], intentIdx: 0, phase: 0, member: m.id, sprite: d.sprite, size: 'medium', acted: 0,
  };
}

export function enemyCombatant(s: BattleState, defId: string, level: number, summoned = false): Combatant {
  const d = ENEMIES[defId];
  if (!d) throw new Error('unknown enemy ' + defId);
  const L = Math.max(1, level);
  const hpMult = 1 + 0.12 * (L - 1), atkMult = 1 + 0.07 * (L - 1);
  const base: Stats = { ...d.stats, hp: Math.round(d.stats.hp * hpMult), atk: Math.round(d.stats.atk * atkMult), mag: Math.round(d.stats.mag * atkMult), def: Math.round(d.stats.def * (1 + 0.05 * (L - 1))), res: Math.round(d.stats.res * (1 + 0.05 * (L - 1))) };
  const n = s.enemies.filter((e) => e.def === defId).length;
  const suffix = n ? ' ' + String.fromCharCode(65 + n) : '';
  const c: Combatant = {
    id: 'e:' + s.nextId++, side: 'enemy', def: defId, name: d.name + suffix, level: L,
    hp: base.hp, maxHp: base.hp, mp: base.mp, maxMp: base.mp, base, statuses: [], tick: 0,
    breakMax: d.breakMax, breakNow: d.breakMax, broken: false, guard: false, ko: false,
    passives: d.passives ?? [], abilities: d.intents.map((i) => i.ability), weapon: { type: 'blunt', power: 100 },
    weak: d.weak, resist: d.resist, immune: d.immune ?? [], intentIdx: d.pattern === 'random' ? 0 : s.rng.int(0, Math.max(0, d.pattern.length - 1)), phase: 0, summoned, sprite: d.sprite, size: d.size, acted: 0,
  };
  return c;
}

export function createBattle(rng: Rng, run: Run, encounter: EncounterDef, partyPassives: Passive[] = []): BattleState {
  const s: BattleState = {
    rng, encounter, heroes: [], bench: [], enemies: [], bag: run.bag, actor: null, plan: null, turns: 0, over: null, events: [],
    nextId: 1, partyPassives, stats: { perfects: 0, breaks: 0, kills: 0 },
  };
  for (const id of run.active) { const m = run.party.find((p) => p.id === id); if (m) s.heroes.push(heroCombatant(s, m, run)); }
  for (const m of run.party) if (!run.active.includes(m.id)) s.bench.push(heroCombatant(s, m, run));
  const tier = encounter.tier;
  for (const e of encounter.enemies) s.enemies.push(enemyCombatant(s, e.def, e.level ?? tierLevel(tier)));
  // initial ticks: a random slice of one turn so the order is not a pure speed sort
  for (const c of all(s)) c.tick = Math.round(turnCost(c) * rng.float(0.3, 0.9));
  for (const c of s.heroes) {
    const p = passives(s, c);
    if (hasPassive(p, 'firstStrike')) c.tick = 0;
    const barrier = passivePower(p, 'startBarrier');
    if (barrier) addStatus(s, c, 'barrier', 99, Math.round(c.maxHp * 0.15 * barrier), 1, true);
    if (hasPassive(p, 'tauntAura')) addStatus(s, c, 'taunt', 3, undefined, 1, true);
  }
  // heroes who start KO'd (carried over) are swapped out for living bench members
  for (const c of [...s.heroes]) if (c.ko) reinforce(s, c);
  if (encounter.intro) emit(s, { kind: 'msg', text: encounter.intro });
  advance(s);
  return s;
}

export function tierLevel(tier: 1 | 2 | 3): number { return [0, 1, 7, 13][tier]; }

// ---------------------------------------------------------------- turn order

/** Simulated upcoming order (ids), ignoring statuses that may change. */
export function timeline(s: BattleState, n = 8): string[] {
  const sim = alive(all(s)).map((c) => ({ id: c.id, tick: c.tick, cost: turnCost(c) }));
  const out: string[] = [];
  for (let i = 0; i < n && sim.length; i++) {
    sim.sort((a, b) => a.tick - b.tick || a.id.localeCompare(b.id));
    out.push(sim[0].id);
    sim[0].tick += sim[0].cost;
  }
  return out;
}

/** Find the next actor, run start-of-turn effects, plan enemy moves. Sets `s.actor`. */
export function advance(s: BattleState): void {
  s.plan = null;
  s.actor = null;
  if (s.over) return;
  for (let guard = 0; guard < 50; guard++) {
    const living = alive(all(s));
    if (!living.length) return;
    living.sort((a, b) => a.tick - b.tick || a.id.localeCompare(b.id));
    const c = living[0];
    const t = c.tick;
    for (const o of living) o.tick -= t; // keep numbers small
    c.guard = false;
    startOfTurn(s, c);
    if (checkEnd(s)) return;
    if (c.ko) continue;
    if (c.broken) {
      c.broken = false;
      c.breakNow = c.breakMax;
      emit(s, { kind: 'recover', target: c.id });
      c.tick += turnCost(c);
      continue;
    }
    s.actor = c.id;
    s.turns++;
    emit(s, { kind: 'turn', who: c.id });
    if (c.side === 'enemy') s.plan = planEnemy(s, c);
    return;
  }
}

function startOfTurn(s: BattleState, c: Combatant) {
  const p = passives(s, c);
  const regen = passivePower(p, 'hpRegen');
  if (regen && c.hp > 0 && c.hp < c.maxHp) heal(s, c, c, Math.round(c.maxHp * 0.04 * regen), true);
  const mpr = passivePower(p, 'mpRegen');
  if (mpr && c.mp < c.maxMp) { c.mp = Math.min(c.maxMp, c.mp + 2 * mpr); emit(s, { kind: 'mp', target: c.id, amount: 2 * mpr }); }
  for (const st of [...c.statuses]) {
    const d = STATUSES[st.id];
    if (d.tick && !c.ko) {
      const amt = Math.max(1, Math.round(c.maxHp * Math.abs(d.tick) / 100));
      if (d.tick > 0) { c.hp = Math.max(0, c.hp - amt); emit(s, { kind: 'tick', who: c.id, id: st.id, amount: -amt }); if (c.hp === 0) koCheck(s, c, undefined); }
      else { const h = Math.min(amt, c.maxHp - c.hp); c.hp += h; emit(s, { kind: 'tick', who: c.id, id: st.id, amount: h }); }
    }
    st.turns--;
    if (st.turns <= 0) { c.statuses = c.statuses.filter((x) => x !== st); emit(s, { kind: 'status', target: c.id, id: st.id, on: false }); }
  }
}

// ---------------------------------------------------------------- actions

export function legalActions(s: BattleState): { attack: boolean; skills: { id: string; ok: boolean; why?: string }[]; items: ItemInst[]; guard: boolean; swap: string[]; flee: boolean } {
  const c = s.actor ? byId(s, s.actor) : null;
  if (!c || c.side !== 'hero') return { attack: false, skills: [], items: [], guard: false, swap: [], flee: false };
  return {
    attack: true,
    skills: c.abilities.map((id) => { const a = ABILITIES[id]; return { id, ok: !!a && c.mp >= a.mp, why: a && c.mp < a.mp ? 'Not enough MP' : undefined }; }),
    items: s.bag.filter((i) => ITEMS[i.def]?.use && i.qty > 0),
    guard: true,
    swap: s.bench.filter((b) => !b.ko).map((b) => b.member!),
    flee: !s.encounter.elite && !s.encounter.boss,
  };
}

export function step(s: BattleState, action: BattleAction | null, timing: Timing = {}): BattleEvent[] {
  const start = s.events.length;
  const c = s.actor ? byId(s, s.actor) : null;
  if (!c || s.over) return [];
  if (c.side === 'enemy') enemyAct(s, c, timing.guard ?? []);
  else if (action) heroAct(s, c, action, timing.grades ?? []);
  else return [];
  if (!checkEnd(s)) advance(s);
  return s.events.slice(start);
}

function heroAct(s: BattleState, c: Combatant, a: BattleAction, grades: Grade[]) {
  c.acted++;
  switch (a.t) {
    case 'attack': {
      const target = byId(s, a.target);
      if (!target || target.ko) return;
      const ab: AbilityDef = { id: 'attack', name: 'Attack', desc: '', mp: 0, target: 'enemy', hits: [{ type: c.weapon.type, power: c.weapon.power, scale: 'atk' }] };
      useAbility(s, c, ab, [target], grades);
      c.tick += turnCost(c);
      return;
    }
    case 'skill': {
      const ab = ABILITIES[a.id];
      if (!ab || !c.abilities.includes(a.id) || c.mp < ab.mp) return;
      const targets = resolveTargets(s, c, ab.target, a.target);
      if (!targets.length) return;
      c.mp -= ab.mp;
      useAbility(s, c, ab, targets, grades);
      c.tick += turnCost(c, ab.delay ?? 1);
      return;
    }
    case 'item': {
      const inst = s.bag.find((i) => i.id === a.item);
      const def = inst && ITEMS[inst.def];
      if (!inst || !def?.use || inst.qty <= 0) return;
      const targets = resolveTargets(s, c, def.use.target, a.target);
      if (!targets.length) return;
      inst.qty--;
      if (inst.qty <= 0) s.bag.splice(s.bag.indexOf(inst), 1);
      const ab: AbilityDef = { id: 'item:' + def.id, name: def.name, desc: def.desc, mp: 0, target: def.use.target, hits: def.use.hits, effects: def.use.effects };
      useAbility(s, c, ab, targets, grades);
      c.tick += turnCost(c, 0.8);
      return;
    }
    case 'guard': {
      c.guard = true;
      const mp = 3 + passivePower(passives(s, c), 'guardMp') * 3;
      c.mp = Math.min(c.maxMp, c.mp + mp);
      emit(s, { kind: 'guard', who: c.id });
      emit(s, { kind: 'mp', target: c.id, amount: mp });
      c.tick += turnCost(c, 0.7);
      return;
    }
    case 'swap': {
      const inc = s.bench.find((b) => b.member === a.member && !b.ko);
      if (!inc) return;
      swap(s, c, inc);
      inc.tick = c.tick + turnCost(inc, 0.6);
      return;
    }
    case 'flee': {
      if (s.encounter.elite || s.encounter.boss) return;
      const hs = alive(s.heroes).reduce((a, h) => a + eff(h, 'spd'), 0) / Math.max(1, alive(s.heroes).length);
      const es = alive(s.enemies).reduce((a, h) => a + eff(h, 'spd'), 0) / Math.max(1, alive(s.enemies).length);
      const p = Math.max(0.2, Math.min(0.9, 0.5 + (hs - es) / 60));
      const ok = s.rng.chance(p);
      emit(s, { kind: 'flee', ok });
      if (ok) { s.over = 'flee'; emit(s, { kind: 'end', result: 'flee' }); }
      else c.tick += turnCost(c);
      return;
    }
  }
}

function swap(s: BattleState, out: Combatant, inc: Combatant) {
  const i = s.heroes.indexOf(out), j = s.bench.indexOf(inc);
  s.heroes[i] = inc; s.bench[j] = out;
  out.statuses = out.statuses.filter((st) => st.id !== 'taunt');
  out.guard = false;
  emit(s, { kind: 'swap', out: out.id, in: inc.id });
}

/** A KO'd active hero is replaced by the first living bench member. */
function reinforce(s: BattleState, out: Combatant): boolean {
  const inc = s.bench.find((b) => !b.ko);
  if (!inc) return false;
  const i = s.heroes.indexOf(out), j = s.bench.indexOf(inc);
  s.heroes[i] = inc; s.bench[j] = out;
  inc.tick = Math.max(...alive(all(s)).map((c) => c.tick), 0) + turnCost(inc, 0.5);
  emit(s, { kind: 'reinforce', in: inc.id });
  return true;
}

export function resolveTargets(s: BattleState, c: Combatant, mode: TargetMode, pick?: string): Combatant[] {
  const foes = foesOf(s, c), allies = alliesOf(s, c);
  const chosen = pick ? byId(s, pick) : undefined;
  switch (mode) {
    case 'enemy': return chosen && !chosen.ko && foes.includes(chosen) ? [chosen] : foes.length ? [foes[0]] : [];
    case 'enemies': return foes;
    case 'enemyRandom': return foes.length ? [s.rng.pick(foes)] : [];
    case 'ally': return chosen && !chosen.ko && allies.includes(chosen) ? [chosen] : [c];
    case 'allies': return allies;
    case 'self': return [c];
    case 'allyKo': {
      const kos = (c.side === 'hero' ? [...s.heroes, ...s.bench] : s.enemies).filter((x) => x.ko);
      return chosen && kos.includes(chosen) ? [chosen] : kos.length ? [kos[0]] : [];
    }
  }
}

function useAbility(s: BattleState, c: Combatant, ab: AbilityDef, targets: Combatant[], grades: Grade[]) {
  emit(s, { kind: 'use', who: c.id, ability: ab.id, name: ab.name, targets: targets.map((t) => t.id) });
  const p = passives(s, c);
  if (ab.hits) {
    ab.hits.forEach((hit, i) => {
      const g = grades[i] ?? 'good';
      if (g === 'perfect') s.stats.perfects++;
      for (const t of targets) {
        if (t.ko) continue;
        const dealt = damage(s, c, t, hit, g, 'good');
        if (dealt > 0) {
          const ls = passivePower(p, 'lifesteal');
          if (ls && c.hp < c.maxHp) heal(s, c, c, Math.max(1, Math.round(dealt * 0.1 * ls)), true);
          if (g === 'perfect' && hasPassive(p, 'perfectHeal')) heal(s, c, c, Math.max(1, Math.round(c.maxHp * 0.05)), true);
          for (const touch of ['poisonTouch', 'burnTouch', 'chillTouch', 'shockTouch', 'bleedTouch'] as const) {
            if (hasPassive(p, touch) && s.rng.chance(0.3)) addStatus(s, t, touch.replace('Touch', '') as StatusId, 3);
          }
        }
      }
    });
  }
  for (const e of ab.effects ?? []) applyEffect(s, c, e, targets);
}

function applyEffect(s: BattleState, c: Combatant, e: Effect, targets: Combatant[]) {
  const who = (w?: 'target' | 'self' | 'allies' | 'enemies'): Combatant[] => w === 'self' ? [c] : w === 'allies' ? alliesOf(s, c) : w === 'enemies' ? foesOf(s, c) : targets;
  switch (e.kind) {
    case 'heal': {
      for (const t of targets) {
        if (t.ko) continue;
        const stat = e.scale === 'flat' ? 1 : eff(c, e.scale);
        const amt = e.scale === 'flat' ? e.power : Math.round(e.power / 100 * stat * 1.2);
        heal(s, c, t, amt);
      }
      return;
    }
    case 'revive': {
      for (const t of targets) if (t.ko) { t.ko = false; t.hp = Math.max(1, Math.round(t.maxHp * e.fraction)); t.statuses = []; emit(s, { kind: 'revive', target: t.id }); if (!s.heroes.includes(t) && !s.bench.includes(t)) { /* enemy */ } }
      return;
    }
    case 'mp': {
      for (const t of targets) if (!t.ko) { const a = Math.min(e.amount, t.maxMp - t.mp); t.mp += a; emit(s, { kind: 'mp', target: t.id, amount: a }); }
      return;
    }
    case 'status': {
      for (const t of who(e.who)) if (!t.ko && s.rng.chance(e.chance ?? 1)) addStatus(s, t, e.id, e.turns, e.power);
      return;
    }
    case 'cleanse': {
      for (const t of who(e.who)) { for (const st of [...t.statuses]) if (STATUSES[st.id].bad) { t.statuses.splice(t.statuses.indexOf(st), 1); emit(s, { kind: 'status', target: t.id, id: st.id, on: false }); } }
      return;
    }
    case 'chip': {
      for (const t of targets) if (t.side === 'enemy' && !t.ko && !t.broken) chip(s, t, e.amount);
      return;
    }
    case 'delay': {
      for (const t of targets) if (!t.ko) t.tick += Math.round(turnCost(t) * e.amount);
      return;
    }
    case 'hasteSelf': {
      c.tick += Math.round(turnCost(c) * e.amount);
      return;
    }
    case 'summon': {
      const n = alive(s.enemies).filter((x) => x.def === e.enemy).length;
      const cap = e.max ?? ENEMIES[e.enemy]?.summonCap ?? 2;
      if (c.side === 'enemy' && n < cap && alive(s.enemies).length < 5) {
        const sm = enemyCombatant(s, e.enemy, c.level, true);
        sm.tick = c.tick + turnCost(sm);
        s.enemies.push(sm);
        emit(s, { kind: 'summon', who: c.id, enemy: sm.id });
      }
      return;
    }
    case 'breakRefill': {
      c.breakNow = c.breakMax;
      return;
    }
  }
}

export function addStatus(s: BattleState, t: Combatant, id: StatusId, turns: number, power?: number, _chance = 1, silent = false) {
  if (t.side === 'enemy' && (id === 'taunt')) return;
  if (t.side === 'enemy' && ENEMIES[t.def]?.boss && (id === 'slow' || id === 'chill') && s.rng.chance(0.5)) return;
  const ex = hasStatus(t, id);
  if (ex) { ex.turns = Math.max(ex.turns, turns); if (power !== undefined) ex.power = Math.max(ex.power ?? 0, power); }
  else t.statuses.push({ id, turns, power });
  if (!silent) emit(s, { kind: 'status', target: t.id, id, on: true });
}

function heal(s: BattleState, who: Combatant, t: Combatant, amt: number, _silentSource = false) {
  if (t.ko) return;
  const a = Math.max(0, Math.min(amt, t.maxHp - t.hp));
  t.hp += a;
  emit(s, { kind: 'heal', who: who.id, target: t.id, amount: a });
}

// ---------------------------------------------------------------- damage

/** Returns HP actually removed. `guardGrade` is the target's timed guard (enemy attacks on heroes). */
export function damage(s: BattleState, att: Combatant, def: Combatant, hit: Hit, grade: Grade, guardGrade: Grade): number {
  const ap = passives(s, att);
  const stat = hit.scale === 'none' ? 0 : eff(att, hit.scale);
  const defStat = hit.scale === 'mag' ? eff(def, 'res') : eff(def, 'def');
  let raw = hit.scale === 'none' ? hit.power : (hit.power / 100) * Math.max(stat * 0.25, stat * 1.6 - defStat * 0.8);
  let mult = 1;
  const immune = def.immune.includes(hit.type);
  const weak = !immune && def.weak.includes(hit.type);
  const resist = !immune && def.resist.includes(hit.type);
  if (immune) mult = 0;
  if (weak) mult *= 1.5;
  if (resist) mult *= 0.5;
  if (def.broken) mult *= 1.5;
  mult *= GRADE_MULT[grade];
  let guarded = false;
  if (!hit.pierceGuard) {
    let gm = 1;
    if (def.guard) { gm *= hasPassive(passives(s, def), 'ironGuard') ? 0.35 : 0.5; guarded = true; }
    if (def.side === 'hero' && att.side === 'enemy') {
      const g = hasStatus(def, 'shock') ? 'miss' : guardGrade;
      gm *= GUARD_MULT[g];
      if (g !== 'miss') guarded = true;
      if (g === 'perfect') { def.mp = Math.min(def.maxMp, def.mp + 5); }
    }
    mult *= Math.max(0.35, gm);
  }
  const critChance = (att.base.luck + (hit.crit ?? 0) + passivePower(ap, 'critPlus') * 5) / 100;
  const crit = mult > 0 && s.rng.chance(critChance);
  if (crit) mult *= 1.5;
  raw *= s.rng.float(0.92, 1.08);
  let dmg = mult === 0 ? 0 : Math.max(1, Math.round(raw * mult));
  // barrier absorbs first
  const bar = hasStatus(def, 'barrier');
  if (bar && dmg > 0 && !hit.pierceGuard) {
    const absorb = Math.min(bar.power ?? 0, dmg);
    dmg -= absorb;
    bar.power = (bar.power ?? 0) - absorb;
    if ((bar.power ?? 0) <= 0) { def.statuses.splice(def.statuses.indexOf(bar), 1); emit(s, { kind: 'status', target: def.id, id: 'barrier', on: false }); }
  }
  const before = def.hp;
  def.hp = Math.max(0, def.hp - dmg);
  emit(s, { kind: 'hit', who: att.id, target: def.id, dmg, type: hit.type, grade, crit, weak, resist, immune, guarded });
  // break chips
  if (weak && def.side === 'enemy' && !def.broken && (hit.chip ?? 1) > 0) {
    let n = hit.chip ?? 1;
    if (grade === 'perfect') n++;
    n += passivePower(ap, 'chipPlus');
    if (hasStatus(def, 'bleed')) n *= 2;
    chip(s, def, n);
  }
  // thorns / counter
  if (dmg > 0 && !def.ko && def.hp > 0) {
    const dp = passives(s, def);
    const th = passivePower(dp, 'thorns');
    if (th && att.hp > 0) { const back = Math.max(1, Math.round(dmg * 0.15 * th)); att.hp = Math.max(0, att.hp - back); emit(s, { kind: 'counter', who: def.id, target: att.id, dmg: back }); koCheck(s, att, def); }
    if (hasPassive(dp, 'counter') && def.side === 'hero' && att.side === 'enemy' && s.rng.chance(0.35)) {
      const back = Math.max(1, Math.round(eff(def, 'atk') * 0.6));
      att.hp = Math.max(0, att.hp - back);
      emit(s, { kind: 'counter', who: def.id, target: att.id, dmg: back });
      koCheck(s, att, def);
    }
  }
  koCheck(s, def, att);
  return before - def.hp;
}

function chip(s: BattleState, t: Combatant, n: number) {
  t.breakNow = Math.max(0, t.breakNow - n);
  emit(s, { kind: 'chip', target: t.id, amount: n, left: t.breakNow });
  if (t.breakNow === 0 && !t.broken) {
    t.broken = true;
    s.stats.breaks++;
    emit(s, { kind: 'break', target: t.id });
    for (const h of alive(s.heroes)) { const mp = passivePower(passives(s, h), 'mpOnBreak'); if (mp) { h.mp = Math.min(h.maxMp, h.mp + 4 * mp); emit(s, { kind: 'mp', target: h.id, amount: 4 * mp }); } }
    bossPhase(s, t, true);
  }
}

function koCheck(s: BattleState, c: Combatant, by?: Combatant) {
  if (c.ko || c.hp > 0) { if (c.side === 'enemy' && !c.ko) bossPhase(s, c, false); return; }
  const p = passives(s, c);
  if (c.side === 'hero' && !c.cheated && (hasPassive(p, 'cheatDeath') || hasPassive(p, 'reviveOnce'))) {
    c.cheated = true;
    c.hp = Math.max(1, Math.round(c.maxHp * 0.3));
    emit(s, { kind: 'cheatDeath', who: c.id });
    return;
  }
  c.ko = true;
  c.statuses = [];
  c.guard = false;
  emit(s, { kind: 'ko', target: c.id });
  if (c.side === 'enemy') {
    s.stats.kills++;
    if (by && by.side === 'hero' && hasPassive(passives(s, by), 'hasteOnKill')) by.tick -= Math.round(turnCost(by) * 0.5);
  } else if (s.heroes.includes(c)) {
    reinforce(s, c);
  }
}

function bossPhase(s: BattleState, c: Combatant, onBreak: boolean) {
  const d = ENEMIES[c.def];
  if (!d.phases) return;
  const next = d.phases[c.phase];
  if (!next) return;
  const trigger = (onBreak && next.onBreak) || (next.hpBelow !== undefined && c.hp / c.maxHp < next.hpBelow);
  if (!trigger) return;
  c.phase++;
  c.intentIdx = 0;
  emit(s, { kind: 'phase', who: c.id, message: next.message });
  if (next.heal) heal(s, c, c, Math.round(c.maxHp * next.heal));
  if (next.breakMax) { c.breakMax = next.breakMax; if (!c.broken) c.breakNow = next.breakMax; }
}

function checkEnd(s: BattleState): boolean {
  if (s.over) return true;
  if (!alive(s.enemies).length) { s.over = 'win'; emit(s, { kind: 'end', result: 'win' }); return true; }
  if (!alive(s.heroes).length && !alive(s.bench).length) { s.over = 'lose'; emit(s, { kind: 'end', result: 'lose' }); return true; }
  return false;
}

// ---------------------------------------------------------------- enemies

export function currentPattern(c: Combatant): string[] | 'random' {
  const d = ENEMIES[c.def];
  if (c.phase > 0 && d.phases?.[c.phase - 1]) return d.phases[c.phase - 1].pattern;
  return d.pattern;
}

/** The intent an enemy will use on its next turn (shown in the UI). */
export function nextIntent(c: Combatant): IntentDef {
  const d = ENEMIES[c.def];
  const pat = currentPattern(c);
  if (pat === 'random') return d.intents[c.intentIdx % d.intents.length];
  const id = pat[c.intentIdx % pat.length];
  return d.intents.find((i) => i.id === id) ?? d.intents[0];
}

function planEnemy(s: BattleState, c: Combatant): EnemyPlan {
  const d = ENEMIES[c.def];
  const pat = currentPattern(c);
  if (pat === 'random') c.intentIdx = s.rng.int(0, d.intents.length - 1);
  const intent = nextIntent(c);
  const ab = ABILITIES[intent.ability];
  let targets: Combatant[] = [];
  if (ab) {
    if (ab.target === 'enemy') {
      const heroes = alive(s.heroes);
      const taunters = heroes.filter((h) => hasStatus(h, 'taunt'));
      const pool = taunters.length ? taunters : heroes;
      targets = pool.length ? [s.rng.weighted(pool, (h) => 1 + (h.hp / h.maxHp < 0.4 ? 0.6 : 0))] : [];
    } else targets = resolveTargets(s, c, ab.target);
  }
  return { ability: intent.ability, targets: targets.map((t) => t.id), intent };
}

function enemyAct(s: BattleState, c: Combatant, guard: Grade[]) {
  c.acted++;
  const plan = s.plan ?? planEnemy(s, c);
  const ab = ABILITIES[plan.ability];
  const targets = plan.targets.map((id) => byId(s, id)).filter((t): t is Combatant => !!t && !t.ko);
  // targets may have fallen since planning: retarget singles
  const final = targets.length ? targets : ab ? resolveTargets(s, c, ab.target) : [];
  if (ab && final.length) {
    emit(s, { kind: 'use', who: c.id, ability: ab.id, name: plan.intent.name, targets: final.map((t) => t.id) });
    if (ab.hits) ab.hits.forEach((hit, i) => { for (const t of final) if (!t.ko) damage(s, c, t, hit, 'good', guard[i] ?? 'miss'); });
    for (const e of ab.effects ?? []) applyEffect(s, c, e, final);
  }
  // advance the pattern
  const pat = currentPattern(c);
  if (pat !== 'random') c.intentIdx = (c.intentIdx + 1) % pat.length;
  c.tick += turnCost(c, ab?.delay ?? 1);
}

// ---------------------------------------------------------------- after

/** Write HP/MP back to the party. On a win, KO'd members stand up with 1 HP. */
export function applyToParty(s: BattleState, run: Run) {
  for (const c of [...s.heroes, ...s.bench]) {
    const m = run.party.find((p) => p.id === c.member);
    if (!m) continue;
    m.hp = c.ko ? (s.over === 'win' ? 1 : 0) : c.hp;
    m.mp = c.mp;
  }
}

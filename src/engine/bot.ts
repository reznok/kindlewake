/**
 * A greedy bot that plays battles and runs headlessly: balance sims and the UI's "auto" button share it.
 * `timingSkill` in [0,1] is the probability of a perfect; most of the rest is good; a little is miss.
 */
import { Rng } from '../core/rng';
import type { Grade, Ledger, MapNode, Run } from '../core/types';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { alive, type BattleAction, type BattleState, byId, type Combatant, commandKey, eff, hasStatus, legalActions, nextIntent, rehearsedFoes, step } from './battle';
import { campHeal, campSpark, campForge, canChoose, chooseEvent, claimReward, enterNode, eventChoices, finishBattle, pickSpark, reachable, recruit, shopBuy, sparkOffers, startBattle, price, equip } from './run';
import { memberStats, memberWeapon } from './stats';

export interface BotOptions { timingSkill: number; rng: Rng }

export function grade(o: BotOptions): Grade {
  const r = o.rng.next();
  if (r < o.timingSkill) return 'perfect';
  if (r < o.timingSkill + (1 - o.timingSkill) * 0.85) return 'good';
  return 'miss';
}

function grades(o: BotOptions, n: number): Grade[] { return Array.from({ length: n }, () => grade(o)); }

/** Expected damage of one hit against a target, roughly as the engine computes it (no variance, no crit). */
function expectDmg(att: Combatant, def: Combatant, hit: { type: string; power: number; scale: 'atk' | 'mag' | 'none' }): number {
  const stat = hit.scale === 'none' ? 0 : eff(att, hit.scale);
  const defStat = hit.scale === 'mag' ? eff(def, 'res') : eff(def, 'def');
  let raw = hit.scale === 'none' ? hit.power : (hit.power / 100) * Math.max(stat * 0.25, stat * 1.6 - defStat * 0.8);
  if (def.immune.includes(hit.type as never)) return 0;
  if (def.weak.includes(hit.type as never)) raw *= 1.5;
  if (def.resist.includes(hit.type as never)) raw *= 0.5;
  if (def.broken) raw *= 1.5;
  return raw;
}

/** Pick the hero's action. */
export function chooseHeroAction(s: BattleState, o: BotOptions): { action: BattleAction; grades: Grade[] } {
  const c = byId(s, s.actor!)!;
  const legal = legalActions(s);
  const foes = alive(s.enemies);
  const allies = alive(s.heroes);
  const lowAlly = allies.filter((h) => h.hp / h.maxHp < 0.4).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  const koAlly = [...s.heroes, ...s.bench].find((h) => h.ko);
  const watched = rehearsedFoes(s).length > 0;
  /** A command that would repeat the last one while a rehearsed foe stands gets countered: avoid it. */
  const fresh = (a: BattleAction) => !(watched && commandKey(s, a) === s.lastCommand);
  // 1. revive if someone is down and we can
  if (koAlly) {
    const rev = legal.skills.find((k) => k.ok && ABILITIES[k.id].effects?.some((e) => e.kind === 'revive') && fresh({ t: 'skill', id: k.id }));
    if (rev) return { action: { t: 'skill', id: rev.id, target: koAlly.id }, grades: [] };
    const item = legal.items.find((i) => ITEMS[i.def].use?.effects?.some((e) => e.kind === 'revive') && fresh({ t: 'item', item: i.id }));
    if (item && s.heroes.includes(koAlly)) return { action: { t: 'item', item: item.id, target: koAlly.id }, grades: [] };
  }
  // 2. heal a low ally
  if (lowAlly) {
    const heal = legal.skills.filter((k) => k.ok && ABILITIES[k.id].effects?.some((e) => e.kind === 'heal') && fresh({ t: 'skill', id: k.id })).sort((a, b) => (ABILITIES[a.id].target === 'allies' ? 1 : 0) - (ABILITIES[b.id].target === 'allies' ? 1 : 0))[0];
    if (heal) return { action: { t: 'skill', id: heal.id, target: lowAlly.id }, grades: [] };
    const pot = legal.items.find((i) => ITEMS[i.def].use?.effects?.some((e) => e.kind === 'heal') && fresh({ t: 'item', item: i.id }));
    if (pot) return { action: { t: 'item', item: pot.id, target: lowAlly.id }, grades: [] };
    // tank with taunt takes the heat off
    if (c.hp / c.maxHp > 0.6) { const taunt = legal.skills.find((k) => k.ok && ABILITIES[k.id].effects?.some((e) => e.kind === 'status' && e.id === 'taunt')); if (taunt && !hasStatus(c, 'taunt')) return { action: { t: 'skill', id: taunt.id }, grades: [] }; }
  }
  // 3. a heavy intent is coming at us and we are a tank: taunt
  const heavyComing = foes.some((e) => ['heavy', 'charge'].includes(nextIntent(e).kind));
  if (heavyComing && c.maxHp >= 60 && !hasStatus(c, 'taunt')) {
    const taunt = legal.skills.find((k) => k.ok && ABILITIES[k.id].effects?.some((e) => e.kind === 'status' && e.id === 'taunt'));
    if (taunt) return { action: { t: 'skill', id: taunt.id }, grades: [] };
  }
  // 4. best damage option: score skills and the weapon by expected damage + break value
  let best: { action: BattleAction; n: number; score: number } | null = null;
  const consider = (action: BattleAction, hits: { type: string; power: number; scale: 'atk' | 'mag' | 'none'; chip?: number }[], targets: Combatant[], mp: number) => {
    let score = 0;
    if (watched && commandKey(s, action) === s.lastCommand) score -= 1000;
    for (const t of targets) for (const h of hits) {
      const d = expectDmg(c, t, h);
      score += Math.min(d, t.hp) * (t.hp <= d ? 1.2 : 1);
      if (t.weak.includes(h.type as never) && !t.broken) score += 6 * (h.chip ?? 1) * (t.breakNow <= 2 ? 2 : 1);
    }
    score -= mp * 0.8 * (c.mp / c.maxMp < 0.3 ? 3 : 1);
    if (!best || score > best.score) best = { action, n: hits.length, score };
  };
  const target = foes.sort((a, b) => a.hp - b.hp)[0];
  if (!target) return { action: { t: 'guard' }, grades: [] };
  consider({ t: 'attack', target: target.id }, [{ type: c.weapon.type, power: c.weapon.power, scale: 'atk' }], [target], 0);
  for (const k of legal.skills) {
    if (!k.ok) continue;
    const a = ABILITIES[k.id];
    if (!a.hits) continue;
    const targets = a.target === 'enemies' ? foes : a.target === 'enemy' ? [foes.reduce((best, f) => expectDmg(c, f, a.hits![0]) * (f.weak.includes(a.hits![0].type) ? 1.3 : 1) > expectDmg(c, best, a.hits![0]) * (best.weak.includes(a.hits![0].type) ? 1.3 : 1) ? f : best, foes[0])] : [];
    if (!targets.length) continue;
    consider({ t: 'skill', id: k.id, target: targets[0].id }, a.hits, targets, a.mp);
  }
  // throwables on a weakness
  for (const it of legal.items) {
    const u = ITEMS[it.def].use;
    if (!u?.hits) continue;
    const targets = u.target === 'enemies' ? foes : [foes.find((f) => f.weak.includes(u.hits![0].type)) ?? foes[0]];
    if (targets.some((t) => t.weak.includes(u.hits![0].type))) consider({ t: 'item', item: it.id, target: targets[0].id }, u.hits, targets, 4);
  }
  // 5. buffs when nothing is urgent and MP is plentiful
  if (c.mp / c.maxMp > 0.6 && o.rng.chance(0.3)) {
    const buff = legal.skills.find((k) => k.ok && !ABILITIES[k.id].hits && ABILITIES[k.id].effects?.some((e) => e.kind === 'status' && (e.id === 'atkUp' || e.id === 'haste' || e.id === 'barrier') && !hasStatus(allies[0], e.id)));
    if (buff) return { action: { t: 'skill', id: buff.id, target: allies.sort((a, b) => eff(b, 'atk') + eff(b, 'mag') - eff(a, 'atk') - eff(a, 'mag'))[0].id }, grades: [] };
  }
  const b = best as { action: BattleAction; n: number; score: number } | null;
  if (b) return { action: b.action, grades: grades(o, b.n) };
  return { action: { t: 'guard' }, grades: [] };
}

/** Play a whole battle. */
export function playBattle(s: BattleState, o: BotOptions, maxTurns = 400): BattleState {
  let guard = 0;
  while (!s.over && guard++ < maxTurns) {
    const c = byId(s, s.actor!);
    if (!c) break;
    if (c.side === 'enemy') {
      const n = ABILITIES[s.plan?.ability ?? '']?.hits?.length ?? 0;
      step(s, null, { guard: grades(o, n) });
    } else {
      const { action, grades: g } = chooseHeroAction(s, o);
      step(s, action, { grades: g });
    }
  }
  if (!s.over) { s.over = 'lose'; }
  return s;
}

/** Map policy: camp when hurt, recruit while short, else the richest option. */
export function chooseNode(run: Run, o: BotOptions): MapNode {
  const opts = reachable(run);
  const avgHp = run.party.reduce((a, m) => a + m.hp / memberStats(m, run).hp, 0) / run.party.length;
  const score = (n: MapNode) => {
    switch (n.kind) {
      case 'camp': return avgHp < 0.6 ? 10 : run.party.some((m) => sparkOffers(run, m.id).length) ? 4 : 2;
      case 'recruit': return run.party.length < 6 ? 8 : 1;
      case 'shop': return run.gold >= 40 ? 5 : 1;
      case 'elite': return avgHp > 0.7 && run.party.reduce((a, m) => a + m.level, 0) / run.party.length >= 3 ? 6 : 0.3;
      case 'event': return 4;
      case 'fight': return 3;
      case 'boss': return 1;
      default: return 1;
    }
  };
  return o.rng.weighted(opts, (n) => score(n) + 0.5);
}

/** Spend pending sparks and gear up from the bag. */
export function tidyParty(run: Run, o: BotOptions) {
  for (const m of run.party) {
    while (m.pendingSparks > 0) { const offers = sparkOffers(run, m.id); if (!offers.length) { m.pendingSparks = 0; break; } pickSpark(run, m.id, o.rng.pick(offers).id); }
    for (const it of [...run.bag]) {
      const d = ITEMS[it.def];
      if (d.kind === 'weapon') { const cur = memberWeapon(m); if (d.type === cur.type && (d.power ?? 100) > cur.power) equip(run, m.id, it.id); }
      if (d.kind === 'trinket' && !m.trinket) equip(run, m.id, it.id);
    }
  }
  // put the three highest-level living members in front
  const living = run.party.filter((m) => m.hp > 0).sort((a, b) => b.level - a.level);
  if (living.length >= 3) run.active = living.slice(0, 3).map((m) => m.id);
}

export interface RunResult { seed: number; act: number; result: 'won' | 'lost'; killedBy?: string; nodes: number; turns: number; fights: number; levels: number[]; diedAt?: string }

/** Play a run to the end. */
export function playRun(run: Run, ledger: Ledger, o: BotOptions, maxNodes = 80): RunResult {
  void ledger;
  let guard = 0;
  while (!run.over && guard++ < maxNodes) {
    if (!run.pending) {
      tidyParty(run, o);
      enterNode(run, chooseNode(run, o).id);
    }
    const p = run.pending;
    if (!p) continue;
    switch (p.kind) {
      case 'fight': { const s = startBattle(run); playBattle(s, o); finishBattle(run, s); break; }
      case 'reward': claimReward(run, p.relics?.[0]); break;
      case 'event': {
        const ok = eventChoices(run).map((c, i) => ({ c, i })).filter((x) => canChoose(run, x.c));
        if (!ok.length) { run.pending = null; run.map.nodes[run.map.at!].done = true; break; }
        chooseEvent(run, o.rng.pick(ok).i);
        break;
      }
      case 'recruit': recruit(run, true, run.party.length >= 6 ? run.party.sort((a, b) => a.level - b.level)[0].id : undefined); break;
      case 'camp': {
        const avgHp = run.party.reduce((a, m) => a + m.hp / memberStats(m, run).hp, 0) / run.party.length;
        const sparkable = run.party.find((m) => sparkOffers(run, m.id).length);
        if (avgHp < 0.6 || !sparkable) { if (!campHeal(run)) campForge(run, run.party[0].id); } else campSpark(run, sparkable.id);
        break;
      }
      case 'shop': {
        for (const id of [...p.stock]) if (run.gold >= price(run, id) + 10 && (ITEMS[id]?.kind === 'consumable' || o.rng.chance(0.5))) shopBuy(run, id);
        run.pending = null; run.map.nodes[run.map.at!].done = true;
        break;
      }
    }
  }
  const at = run.map.at !== null ? run.map.nodes[run.map.at] : null;
  return { seed: run.seed, act: run.stats.deepestAct, result: run.over === 'won' ? 'won' : 'lost', killedBy: run.stats.killedBy, nodes: run.stats.nodes, turns: run.stats.turns, fights: run.stats.fights, levels: run.party.map((m) => m.level), diedAt: run.over === 'lost' && at ? `${at.kind}@c${at.col}` : undefined };
}

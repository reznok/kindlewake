/** Run-level logic: map generation, node resolution, rewards, growth, party and bag management. Pure; no DOM. */
import { Rng, hashString } from '../core/rng';
import type { ActMap, EncounterDef, EventChoice, ItemInst, Ledger, MapNode, NodeKind, Outcome, PartyMember, Run, SparkDef, StatKey } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ENCOUNTERS, encounterPool } from '../data/encounters';
import { eventPool, EVENTS } from '../data/events';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { KITS, UNLOCKS } from '../data/unlocks';
import { applyToParty, type BattleState, createBattle } from './battle';
import { recruitable, relicPool } from './ledger';
import { MAX_LEVEL, memberPassives, memberStats, passivePower, sparkDef, xpForLevel } from './stats';

export const COLUMNS = 7;
export const PARTY_MAX = 6;
export const ACTIVE_MAX = 3;
export const BAG_BASE = 10;
export const RELIC_MAX = 8;

// ---------------------------------------------------------------- rng plumbing

/** Run the callback with the run's RNG and store the advanced state back. */
export function withRng<T>(run: Run, f: (r: Rng) => T): T {
  const r = new Rng(run.rng);
  const out = f(r);
  run.rng = r.s;
  return out;
}

// ---------------------------------------------------------------- creation

export function newMember(run: Run, def: string, level = 1): PartyMember {
  const m: PartyMember = { id: 'm' + run.nextId++, def, level: 1, xp: 0, hp: 1, mp: 1, weapon: null, trinket: null, sparks: [], pendingSparks: 0 };
  while (m.level < level) { m.level++; }
  m.xp = xpForLevel(m.level);
  const st = memberStats(m, run);
  m.hp = st.hp; m.mp = st.mp;
  return m;
}

export function newRun(seed: number, starters: string[], ledger: Ledger): Run {
  const run: Run = {
    seed, rng: new Rng(seed).s, act: 1, map: { act: 1, nodes: [], at: null }, party: [], active: [], gold: 40, bag: [], relics: [], flags: {},
    stats: { kills: 0, turns: 0, perfects: 0, breaks: 0, fights: 0, deepestAct: 1, nodes: 0 }, pending: null, over: null, log: [], createdAt: Date.now(), nextId: 1,
  };
  for (const id of starters.slice(0, ACTIVE_MAX)) { if (!CHARACTERS[id]) throw new Error('unknown character ' + id); const m = newMember(run, id); run.party.push(m); run.active.push(m.id); }
  // starting lunch: two scones, or an unlocked kit in their place
  const kits = UNLOCKS.filter((u) => u.kind === 'kit' && ledger.unlocks.includes(u.id)).map((u) => KITS[u.target]).filter(Boolean);
  if (kits.length) for (const it of kits[kits.length - 1].items) addItem(run, it.id, it.qty);
  else addItem(run, 'c_potion', 2);
  run.map = withRng(run, (r) => genMap(r, 1, ledger, run));
  return run;
}

// ---------------------------------------------------------------- map

export function genMap(r: Rng, act: 1 | 2 | 3, ledger: Ledger, run: Run): ActMap {
  const nodes: MapNode[] = [];
  const cols: MapNode[][] = [];
  // two starts, three choices through the middle, a narrow pass before the boss (one of its two stops is a Bigwig)
  const counts = [2, 3, 3, 3, 3, 2, 1].map((n, i) => (i === 1 || i === 2) && r.chance(0.3) ? 2 : n);
  for (let c = 0; c < COLUMNS; c++) {
    cols[c] = [];
    for (let row = 0; row < counts[c]; row++) { const n: MapNode = { id: nodes.length, col: c, row, kind: 'fight', next: [] }; nodes.push(n); cols[c].push(n); }
  }
  // kinds
  cols[COLUMNS - 1][0].kind = 'boss';
  const inner = nodes.filter((n) => n.col > 0 && n.col < COLUMNS - 1);
  const place = (kind: NodeKind, colMin: number, colMax: number, count: number, spread = true) => {
    let cand = r.shuffle(inner.filter((n) => n.kind === 'fight' && n.col >= colMin && n.col <= colMax));
    let placed = 0;
    const usedCols = new Set<number>();
    for (const n of cand) {
      if (placed >= count) break;
      if (spread && usedCols.has(n.col)) continue;
      n.kind = kind; usedCols.add(n.col); placed++;
    }
    if (placed < count) { cand = cand.filter((n) => n.kind === 'fight'); for (let i = 0; i < count - placed && i < cand.length; i++) cand[i].kind = kind; }
  };
  // one Bigwig guards the pass (column 5), the other sits mid-act
  cols[5][r.int(0, cols[5].length - 1)].kind = 'elite';
  place('elite', 3, 4, 1);
  place('shop', 3, 4, 1);
  place('recruit', 1, 3, 1);
  place('camp', 2, 4, r.int(1, 2));
  place('event', 1, 4, 2, false);
  // edges: monotone mapping plus a random extra link, every node reachable and every node leads on
  for (let c = 0; c < COLUMNS - 1; c++) {
    const a = cols[c], b = cols[c + 1];
    for (let i = 0; i < a.length; i++) {
      const j = a.length === 1 ? Math.floor(b.length / 2) : Math.round(i * (b.length - 1) / (a.length - 1));
      a[i].next.push(b[j].id);
      if (b.length > 1 && r.chance(0.45)) { const k = Math.max(0, Math.min(b.length - 1, j + (r.chance(0.5) ? 1 : -1))); if (!a[i].next.includes(b[k].id)) a[i].next.push(b[k].id); }
    }
    for (const t of b) if (!a.some((n) => n.next.includes(t.id))) { const src = a.reduce((best, n) => Math.abs(n.row - t.row) < Math.abs(best.row - t.row) ? n : best, a[0]); src.next.push(t.id); }
    for (const n of a) n.next.sort((x, y) => x - y);
  }
  // content
  const pools = { fight: encounterPool(act, 'fight'), elite: encounterPool(act, 'elite'), boss: encounterPool(act, 'boss') };
  const used = new Set<string>();
  const pickEnc = (list: EncounterDef[], col: number) => {
    const inBand = list.filter((e) => !e.cols || e.cols.includes(col));
    const pool = inBand.length ? inBand : list;
    const fresh = pool.filter((e) => !used.has(e.id));
    const e = r.pick(fresh.length ? fresh : pool);
    used.add(e.id);
    return e.id;
  };
  const events = r.shuffle(eventPool(act).filter((e) => !(e.once && run.flags['event:' + e.id])));
  const recruits = r.shuffle(recruitable(ledger, run, act));
  const base = [0, 1, 7, 13][act];
  for (const n of nodes) {
    if (n.kind === 'fight' || n.kind === 'elite' || n.kind === 'boss') {
      if (!pools[n.kind].length) throw new Error('no encounters for act ' + act + ' ' + n.kind);
      n.encounter = pickEnc(pools[n.kind], n.col);
      n.level = base + Math.floor(n.col * 0.6);
    }
    if (n.kind === 'event') n.event = events.length ? events.pop()!.id : undefined;
    if (n.kind === 'event' && !n.event) n.kind = 'fight', n.encounter = pickEnc(pools.fight, n.col), n.level = base + Math.floor(n.col * 0.6);
    if (n.kind === 'recruit') { n.recruit = recruits.pop(); if (!n.recruit) { n.kind = 'camp'; } }
    if (n.kind === 'shop') n.stock = rollStock(r, act, run, ledger);
  }
  return { act, nodes, at: null };
}

function rollStock(r: Rng, act: 1 | 2 | 3, run: Run, ledger: Ledger): string[] {
  const gear = Object.values(ITEMS).filter((i) => i.kind !== 'consumable' && (i.tier ?? 1) <= act);
  const cons = Object.values(ITEMS).filter((i) => i.kind === 'consumable' && (i.tier ?? 1) <= act);
  const stock = [...r.shuffle([...gear]).slice(0, 3).map((i) => i.id), ...r.shuffle([...cons]).slice(0, 3).map((i) => i.id)];
  const relics = relicPool(ledger, run);
  if (relics.length) stock.push(r.pick(relics));
  return stock;
}

/** Nodes the player may move to now. */
export function reachable(run: Run): MapNode[] {
  const m = run.map;
  if (m.at === null) return m.nodes.filter((n) => n.col === 0);
  return m.nodes[m.at].next.map((id) => m.nodes[id]);
}

export function currentNode(run: Run): MapNode | null { return run.map.at === null ? null : run.map.nodes[run.map.at]; }

/** Move to a node and set up what happens there. */
export function enterNode(run: Run, id: number): MapNode {
  const n = run.map.nodes[id];
  if (!reachable(run).includes(n)) throw new Error('node not reachable');
  run.map.at = id;
  run.stats.nodes++;
  switch (n.kind) {
    case 'fight': case 'elite': case 'boss': run.pending = { kind: 'fight', encounter: n.encounter!, from: 'node' }; break;
    case 'event': run.pending = { kind: 'event', event: n.event! }; break;
    case 'recruit': run.pending = { kind: 'recruit', def: n.recruit! }; break;
    case 'camp': run.pending = { kind: 'camp' }; break;
    case 'shop': run.pending = { kind: 'shop', stock: [...(n.stock ?? [])] }; break;
    case 'start': run.pending = null; n.done = true; break;
  }
  return n;
}

/** Mark the current node finished (after its pending business is over). */
export function finishNode(run: Run) {
  const n = currentNode(run);
  if (n) n.done = true;
  run.pending = null;
}

// ---------------------------------------------------------------- battles

export function partyPassives(run: Run) { return run.relics.map((id) => RELICS[id]?.passive).filter((p): p is NonNullable<typeof p> => !!p); }

export function startBattle(run: Run): BattleState {
  if (run.pending?.kind !== 'fight') throw new Error('no fight pending');
  const enc = ENCOUNTERS[run.pending.encounter];
  if (!enc) throw new Error('unknown encounter ' + run.pending.encounter);
  const node = currentNode(run);
  const level = run.pending.from === 'node' && node?.level !== undefined ? node.level : [0, 1, 7, 13][run.act as 1 | 2 | 3] ?? 1;
  const e: EncounterDef = { ...enc, enemies: enc.enemies.map((x) => ({ def: x.def, level: x.level ?? level })) };
  run.stats.fights++;
  return withRng(run, (r) => createBattle(r.child(), run, e, partyPassives(run)));
}

/** Apply a finished battle: HP/MP, stats, rewards or defeat. */
export function finishBattle(run: Run, s: BattleState) {
  applyToParty(s, run);
  run.stats.turns += s.turns;
  run.stats.kills += s.stats.kills;
  run.stats.perfects += s.stats.perfects;
  run.stats.breaks += s.stats.breaks;
  const enc = s.encounter;
  if (s.over === 'lose') {
    const killer = s.events.slice().reverse().find((e) => e.kind === 'hit' && e.who.startsWith('e:'));
    const by = killer && killer.kind === 'hit' ? s.enemies.find((e) => e.id === killer.who) : undefined;
    run.stats.killedBy = by ? by.name.replace(/ [A-Z]$/, '') : 'the dark';
    run.over = 'lost';
    run.pending = null;
    return;
  }
  if (s.over === 'flee') { finishNode(run); return; }
  // rewards
  const pp = partyPassives(run);
  const allP = [...pp, ...run.party.flatMap((m) => memberPassives(m, null))];
  const goldPct = passivePower(allP, 'goldPct');
  const xpPct = passivePower(allP, 'xpPct');
  const rawGold = s.enemies.reduce((a, e) => a + (e.summoned ? 0 : ENEMIES_GOLD(e.def)), 0);
  const gold = withRng(run, (r) => Math.round(rawGold * (1 + goldPct / 100) * r.float(0.85, 1.2)));
  const xp = Math.round(s.enemies.reduce((a, e) => a + (e.summoned ? 0 : ENEMIES_XP(e.def)), 0) * (1 + xpPct / 100));
  run.gold += gold;
  const levelUps = addXp(run, xp);
  const items: string[] = [];
  const relics: string[] = [];
  withRng(run, (r) => {
    const lucky = passivePower(allP, 'luckyDrops');
    const drops = s.enemies.flatMap((e) => ENEMIES_DROPS(e.def));
    if (drops.length && r.chance(0.5)) items.push(r.pick(drops));
    else if (r.chance(0.35 + lucky * 0.2)) items.push(r.pick(Object.values(ITEMS).filter((i) => (i.tier ?? 1) <= run.act && (i.kind === 'consumable' || r.chance(0.3 + lucky * 0.2))).map((i) => i.id)));
    if (enc.elite || enc.boss) { const pool = r.shuffle(relicPool(LEDGER_FOR_POOL(run), run)); relics.push(...pool.slice(0, 3)); }
  });
  const kept = items.filter((id) => addItem(run, id, 1));
  run.pending = { kind: 'reward', gold, items: kept, relics: relics.length ? relics : undefined, xp, levelUps };
}

// data accessors kept local so the engine does not import the enemy table twice
import { ENEMIES } from '../data/enemies';
const ENEMIES_GOLD = (id: string) => ENEMIES[id]?.gold ?? 0;
const ENEMIES_XP = (id: string) => ENEMIES[id]?.xp ?? 0;
const ENEMIES_DROPS = (id: string) => ENEMIES[id]?.drops ?? [];
/** The ledger is only needed for relic unlock gating; the run carries a snapshot of locked relics instead. */
let ledgerRef: Ledger | null = null;
export function bindLedger(l: Ledger) { ledgerRef = l; }
const LEDGER_FOR_POOL = (_run: Run): Ledger => ledgerRef ?? { runs: [], unlocks: [], seen: {} };

/** Take the reward (relic choice optional). Boss rewards also advance the act. */
export function claimReward(run: Run, relic?: string) {
  if (run.pending?.kind !== 'reward') return;
  if (relic && run.pending.relics?.includes(relic) && run.relics.length < RELIC_MAX && !run.relics.includes(relic)) run.relics.push(relic);
  const n = currentNode(run);
  finishNode(run);
  if (n?.kind === 'boss') nextAct(run);
}

export function nextAct(run: Run) {
  if (run.act >= 3) { run.over = 'won'; return; }
  run.act = (run.act + 1) as 2 | 3;
  run.stats.deepestAct = run.act;
  run.map = withRng(run, (r) => genMap(r, run.act as 2 | 3, LEDGER_FOR_POOL(run), run));
}

// ---------------------------------------------------------------- growth

/** Grant XP to everyone (bench at 70%). Returns ids of members who levelled. */
export function addXp(run: Run, amount: number): string[] {
  const ups: string[] = [];
  for (const m of run.party) {
    const bench = !run.active.includes(m.id);
    const p = memberPassives(m, run);
    const share = bench && !passivePower(p, 'benchXp') ? 0.85 : 1;
    m.xp += Math.round(amount * share);
    let grew = false;
    while (m.level < MAX_LEVEL && m.xp >= xpForLevel(m.level + 1)) {
      const before = memberStats(m, run);
      m.level++;
      if (m.level % 2 === 0) m.pendingSparks++;
      const after = memberStats(m, run);
      m.hp = Math.min(after.hp, m.hp + (after.hp - before.hp));
      m.mp = Math.min(after.mp, m.mp + (after.mp - before.mp));
      grew = true;
    }
    if (grew) ups.push(m.id);
  }
  return ups;
}

/** Two spark options for the member's next pick, stable for (seed, member, sparks so far). */
export function sparkOffers(run: Run, memberId: string): SparkDef[] {
  const m = run.party.find((x) => x.id === memberId);
  if (!m) return [];
  const d = CHARACTERS[m.def];
  const avail = d.sparks.filter((s) => !m.sparks.includes(s.id) && (!s.requires || m.sparks.includes(s.requires)));
  const r = new Rng(hashString(`${run.seed}:${m.def}:${m.sparks.join(',')}`));
  return r.shuffle([...avail]).slice(0, 2);
}

export function pickSpark(run: Run, memberId: string, sparkId: string): boolean {
  const m = run.party.find((x) => x.id === memberId);
  if (!m || m.pendingSparks <= 0) return false;
  if (!sparkOffers(run, memberId).some((s) => s.id === sparkId)) return false;
  const before = memberStats(m, run);
  m.sparks.push(sparkId);
  m.pendingSparks--;
  const after = memberStats(m, run);
  m.hp = Math.min(after.hp, m.hp + Math.max(0, after.hp - before.hp));
  m.mp = Math.min(after.mp, m.mp + Math.max(0, after.mp - before.mp));
  return true;
}

export function sparkName(m: PartyMember, id: string): string { return sparkDef(m, id)?.name ?? id; }

// ---------------------------------------------------------------- party

export function setActive(run: Run, ids: string[]) {
  const ok = ids.filter((id) => run.party.some((m) => m.id === id)).slice(0, ACTIVE_MAX);
  if (ok.length !== ACTIVE_MAX && run.party.length >= ACTIVE_MAX) return false;
  run.active = ok;
  return true;
}

/** Recruit the pending character; `replace` drops a current member when the party is full. */
export function recruit(run: Run, accept: boolean, replace?: string): PartyMember | null {
  if (run.pending?.kind !== 'recruit') return null;
  const def = run.pending.def;
  if (!accept) { finishNode(run); return null; }
  if (run.party.length >= PARTY_MAX) {
    const idx = run.party.findIndex((m) => m.id === replace);
    if (idx < 0) return null;
    const [gone] = run.party.splice(idx, 1);
    run.active = run.active.filter((id) => id !== gone.id);
  }
  const level = recruitLevel(run);
  const m = newMember(run, def, level);
  run.party.push(m);
  if (run.active.length < ACTIVE_MAX) run.active.push(m.id);
  finishNode(run);
  return m;
}

/** New members join at the lowest level in the front line (never below 1). */
export function recruitLevel(run: Run): number {
  const front = run.party.filter((m) => run.active.includes(m.id));
  const pool = front.length ? front : run.party;
  return Math.max(1, Math.min(...pool.map((m) => m.level)));
}

export function dismiss(run: Run, memberId: string): boolean {
  if (run.party.length <= ACTIVE_MAX) return false;
  const idx = run.party.findIndex((m) => m.id === memberId);
  if (idx < 0) return false;
  run.party.splice(idx, 1);
  run.active = run.active.filter((id) => id !== memberId);
  while (run.active.length < ACTIVE_MAX) { const next = run.party.find((m) => !run.active.includes(m.id)); if (!next) break; run.active.push(next.id); }
  return true;
}

// ---------------------------------------------------------------- bag and gear

export function bagSize(run: Run): number { return BAG_BASE + passivePower(partyPassives(run), 'extraBag'); }

export function addItem(run: Run, defId: string, qty = 1): boolean {
  const def = ITEMS[defId];
  if (!def) return false;
  if (def.kind === 'consumable') {
    const ex = run.bag.find((i) => i.def === defId);
    if (ex) { ex.qty += qty; return true; }
  }
  if (run.bag.length >= bagSize(run)) return false;
  run.bag.push({ id: 'i' + run.nextId++, def: defId, qty: def.kind === 'consumable' ? qty : 1 });
  return true;
}

/** Equip a bag item on a member (weapon or trinket); the old one goes back to the bag. */
export function equip(run: Run, memberId: string, instId: string): boolean {
  const m = run.party.find((x) => x.id === memberId);
  const idx = run.bag.findIndex((i) => i.id === instId);
  if (!m || idx < 0) return false;
  const inst = run.bag[idx];
  const def = ITEMS[inst.def];
  if (def.kind === 'consumable') return false;
  run.bag.splice(idx, 1);
  const slot = def.kind === 'weapon' ? 'weapon' : 'trinket';
  const old = m[slot];
  m[slot] = inst;
  if (old) run.bag.push(old);
  const st = memberStats(m, run);
  m.hp = Math.min(m.hp, st.hp); m.mp = Math.min(m.mp, st.mp);
  return true;
}

export function unequip(run: Run, memberId: string, slot: 'weapon' | 'trinket'): boolean {
  const m = run.party.find((x) => x.id === memberId);
  if (!m || !m[slot] || run.bag.length >= bagSize(run)) return false;
  run.bag.push(m[slot]!);
  m[slot] = null;
  return true;
}

export function price(run: Run, defId: string): number {
  const base = ITEMS[defId]?.price ?? (RELICS[defId] ? 90 : 0);
  const disc = passivePower(partyPassives(run), 'shopDiscount');
  return Math.max(1, Math.round(base * (1 - disc / 100)));
}

export function shopBuy(run: Run, defId: string): boolean {
  if (run.pending?.kind !== 'shop') return false;
  const i = run.pending.stock.indexOf(defId);
  if (i < 0) return false;
  const cost = price(run, defId);
  if (run.gold < cost) return false;
  if (RELICS[defId]) { if (run.relics.length >= RELIC_MAX) return false; run.relics.push(defId); }
  else if (!addItem(run, defId, 1)) return false;
  run.gold -= cost;
  run.pending.stock.splice(i, 1);
  return true;
}

export function leaveShop(run: Run) { if (run.pending?.kind === 'shop') finishNode(run); }

/** Use a consumable outside battle (heal, MP, revive, cleanse). Damage items are battle-only. */
export function useItemField(run: Run, instId: string, memberId: string): boolean {
  const inst = run.bag.find((i) => i.id === instId);
  const def = inst && ITEMS[inst.def];
  const m = run.party.find((x) => x.id === memberId);
  if (!inst || !def?.use || !m || inst.qty <= 0) return false;
  const st = memberStats(m, run);
  let used = false;
  for (const e of def.use.effects ?? []) {
    if (e.kind === 'heal' && m.hp > 0 && m.hp < st.hp) { m.hp = Math.min(st.hp, m.hp + (e.scale === 'flat' ? e.power : Math.round(st.mag * e.power / 100))); used = true; }
    if (e.kind === 'mp' && m.mp < st.mp) { m.mp = Math.min(st.mp, m.mp + e.amount); used = true; }
    if (e.kind === 'revive' && m.hp <= 0) { m.hp = Math.max(1, Math.round(st.hp * e.fraction)); used = true; }
    if (e.kind === 'cleanse') used = true;
  }
  if (!used) return false;
  inst.qty--;
  if (inst.qty <= 0) run.bag.splice(run.bag.indexOf(inst), 1);
  return true;
}

export function canUseField(def: string): boolean {
  const u = ITEMS[def]?.use;
  return !!u && !u.hits && !!u.effects?.some((e) => e.kind === 'heal' || e.kind === 'mp' || e.kind === 'revive');
}

// ---------------------------------------------------------------- camp

export function campHeal(run: Run) {
  if (run.pending?.kind !== 'camp') return false;
  for (const m of run.party) { const st = memberStats(m, run); m.hp = Math.min(st.hp, Math.max(1, m.hp) + Math.round(st.hp * 0.5)); m.mp = Math.min(st.mp, m.mp + Math.round(st.mp * 0.5)); }
  finishNode(run);
  return true;
}

/** Camp: a free spark pick for one member (must have an unchosen spark). */
export function campSpark(run: Run, memberId: string): boolean {
  if (run.pending?.kind !== 'camp') return false;
  const m = run.party.find((x) => x.id === memberId);
  if (!m || !sparkOffers(run, memberId).length) return false;
  m.pendingSparks++;
  finishNode(run);
  return true;
}

export function campForge(run: Run, memberId: string): boolean {
  if (run.pending?.kind !== 'camp') return false;
  const m = run.party.find((x) => x.id === memberId);
  if (!m) return false;
  if (!m.weapon) m.weapon = { id: 'i' + run.nextId++, def: CHARACTERS[m.def].weapon, qty: 1 };
  m.weapon.plus = (m.weapon.plus ?? 0) + 1;
  finishNode(run);
  return true;
}

// ---------------------------------------------------------------- events

/** Choices visible for the pending event (flag-gated ones hidden). */
export function eventChoices(run: Run): EventChoice[] {
  if (run.pending?.kind !== 'event') return [];
  return EVENTS[run.pending.event].choices.filter((c) => !c.requires || run.flags[c.requires]);
}

/** Why a choice cannot be taken (gold, party full, bag full), or null when it can. */
export function choiceBlocker(run: Run, c: EventChoice): string | null {
  const cost = c.outcomes.filter((o) => o.kind === 'gold' && o.amount < 0).reduce((a, o) => a + (o.kind === 'gold' ? -o.amount : 0), 0);
  if (run.gold < cost) return 'Not enough gold';
  if (c.outcomes.some((o) => o.kind === 'recruit') && run.party.length >= PARTY_MAX) return 'Party is full';
  if (c.outcomes.some((o) => o.kind === 'item' && ITEMS[o.id]?.kind !== 'consumable') && run.bag.length >= bagSize(run)) return 'Bag is full';
  return null;
}

export function canChoose(run: Run, c: EventChoice): boolean { return choiceBlocker(run, c) === null; }

export function chooseEvent(run: Run, choice: number): { text: string; fight: boolean } {
  if (run.pending?.kind !== 'event') throw new Error('no event pending');
  const ev = EVENTS[run.pending.event];
  const ch = eventChoices(run)[choice];
  if (!ch) throw new Error('bad choice');
  if (!canChoose(run, ch)) throw new Error('cannot afford');
  run.flags['event:' + ev.id] = true;
  const branch = ch.gamble && withRng(run, (r) => r.chance(ch.gamble!.chance)) ? ch.gamble : ch;
  let fight = false;
  for (const o of branch.outcomes) if (applyOutcome(run, o)) fight = true;
  if (!fight) finishNode(run);
  return { text: branch.result, fight };
}

/** Returns true when the outcome starts a fight (the node finishes after it). */
export function applyOutcome(run: Run, o: Outcome): boolean {
  switch (o.kind) {
    case 'gold': run.gold = Math.max(0, run.gold + o.amount); return false;
    case 'item': addItem(run, o.id, 1); return false;
    case 'relic': if (RELICS[o.id] && !run.relics.includes(o.id) && run.relics.length < RELIC_MAX) run.relics.push(o.id); return false;
    case 'recruit': {
      if (run.party.some((m) => m.def === o.id) || run.party.length >= PARTY_MAX || !CHARACTERS[o.id]) return false;
      const m = newMember(run, o.id, recruitLevel(run));
      run.party.push(m);
      if (run.active.length < ACTIVE_MAX) run.active.push(m.id);
      return false;
    }
    case 'heal': for (const m of run.party) { const st = memberStats(m, run); m.hp = Math.min(st.hp, Math.max(1, m.hp) + Math.round(st.hp * o.pct / 100)); } return false;
    case 'hurt': for (const m of run.party) { const st = memberStats(m, run); m.hp = Math.max(1, m.hp - Math.round(st.hp * o.pct / 100)); } return false;
    case 'stat': {
      const targets = o.who === 'all' ? run.party : [withRng(run, (r) => r.pick(run.party))];
      for (const m of targets) bumpStat(run, m, o.stat, o.amount);
      return false;
    }
    case 'xp': addXp(run, o.amount); return false;
    case 'fight': run.pending = { kind: 'fight', encounter: o.encounter, from: 'event' }; return true;
    case 'flag': run.flags[o.flag] = true; return false;
    case 'text': return false;
  }
}

/** Permanent stat bumps from events live on the member. */
export function bumpStat(run: Run, m: PartyMember, stat: StatKey, amount: number) {
  m.bumps = m.bumps ?? {};
  m.bumps[stat] = (m.bumps[stat] ?? 0) + amount;
  const st = memberStats(m, run);
  if (stat === 'hp') m.hp = Math.min(st.hp, m.hp + amount);
  if (stat === 'mp') m.mp = Math.min(st.mp, m.mp + amount);
}

// ---------------------------------------------------------------- misc

export function partyAlive(run: Run): boolean { return run.party.some((m) => m.hp > 0); }

export function describeNode(n: MapNode): string {
  return { fight: 'Fight', elite: 'Elite', event: 'Event', recruit: 'Recruit', camp: 'Camp', shop: 'Shop', boss: 'Boss', start: 'Start' }[n.kind];
}

export function nodeTypes(n: MapNode): string[] {
  const enc = n.encounter ? ENCOUNTERS[n.encounter] : null;
  if (!enc) return [];
  const set = new Set<string>();
  for (const e of enc.enemies) for (const w of ENEMIES[e.def]?.weak ?? []) set.add(w);
  return [...set];
}

export function memberById(run: Run, id: string): PartyMember | undefined { return run.party.find((m) => m.id === id); }
export function itemInst(run: Run, id: string): ItemInst | undefined { return run.bag.find((i) => i.id === id); }

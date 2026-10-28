import type { Ledger, Run, RunRecord } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { RELICS } from '../data/relics';
import { UNLOCKS, type UnlockDef } from '../data/unlocks';

export function newLedger(): Ledger { return { runs: [], unlocks: [], seen: {} }; }

export function isUnlocked(ledger: Ledger, id: string): boolean { return ledger.unlocks.includes(id); }

/** Characters the player may start with: flagged starters plus the targets of unlocked `starter` rules. */
export function starters(ledger: Ledger): string[] {
  const extra = new Set(UNLOCKS.filter((u) => u.kind === 'starter' && isUnlocked(ledger, u.id)).map((u) => u.target));
  return Object.values(CHARACTERS).filter((c) => c.starter || extra.has(c.id)).map((c) => c.id);
}

/** Characters that may appear as recruits in a run (not in the party, unlocked, allowed in the act). */
export function recruitable(ledger: Ledger, run: Run, act: 1 | 2 | 3): string[] {
  return Object.values(CHARACTERS)
    .filter((c) => !run.party.some((m) => m.def === c.id))
    .filter((c) => !c.unlock || isUnlocked(ledger, c.unlock))
    .filter((c) => !c.acts || c.acts.includes(act))
    .map((c) => c.id);
}

/** Relics in the pool for this ledger. Relics with an unlock rule need it; others are always in. */
export function relicPool(ledger: Ledger, run: Run): string[] {
  const locked = new Set(UNLOCKS.filter((u) => u.kind === 'relic' && !isUnlocked(ledger, u.id)).map((u) => u.target));
  return Object.keys(RELICS).filter((id) => !locked.has(id) && !run.relics.includes(id));
}

/** Record a finished run and apply unlock rules. Returns the newly unlocked rules. */
export function recordRun(ledger: Ledger, run: Run): UnlockDef[] {
  const rec: RunRecord = {
    seed: run.seed, act: run.stats.deepestAct, nodes: run.stats.nodes, result: run.over === 'won' ? 'won' : 'lost',
    killedBy: run.stats.killedBy, party: run.party.map((m) => m.def), kills: run.stats.kills, turns: run.stats.turns, when: Date.now(),
  };
  ledger.runs.push(rec);
  for (const m of run.party) ledger.seen['char:' + m.def] = (ledger.seen['char:' + m.def] ?? 0) + 1;
  const fresh: UnlockDef[] = [];
  for (const u of UNLOCKS) {
    if (ledger.unlocks.includes(u.id)) continue;
    if (u.when(ledger, rec)) { ledger.unlocks.push(u.id); fresh.push(u); }
  }
  return fresh;
}

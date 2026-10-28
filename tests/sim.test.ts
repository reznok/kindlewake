/**
 * Balance simulation. Skipped unless SIM=1.
 *   SIM=1 npx vitest run sim            36 runs at timing 0.4
 *   SIM=1 RUNS=100 SKILL=0.6 npx vitest run sim
 * Prints act reached, win rate, killers and level curve.
 * Targets (skill 0.4): ~60% of runs past act 1; the act-1 boss beaten by ~70% of parties that reach it; skill 0.15 about 20%, skill 0.7 about 85%.
 * TUNE=hp=1.5,atk=1.2 overrides ENEMY_TUNE for probes.
 */
import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { newRun } from '../src/engine/run';
import { newLedger } from '../src/engine/ledger';
import { playRun, type RunResult } from '../src/engine/bot';
import { CHARACTERS } from '../src/data/characters';
import { ENEMY_TUNE } from '../src/engine/battle';
for (const kv of (process.env.TUNE ?? '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); (ENEMY_TUNE as Record<string, number>)[k] = +v; }
import { UNLOCKS } from '../src/data/unlocks';

const SIM = !!process.env.SIM;
const RUNS = +(process.env.RUNS ?? 36);
const SKILL = +(process.env.SKILL ?? 0.4);

describe.skipIf(!SIM)('balance sim', () => {
  it('plays many runs and reports', () => {
    const starters = Object.values(CHARACTERS).filter((c) => c.starter).map((c) => c.id);
    const results: RunResult[] = [];
    const t0 = Date.now();
    for (let i = 0; i < RUNS; i++) {
      const seed = 1000 + i;
      const r = new Rng(seed);
      const trio = r.shuffle([...starters]).slice(0, 3);
      const ledger = newLedger();
      // simulate a mid-game ledger: everything unlocked so recruits exist
      ledger.unlocks = UNLOCKS.map((u) => u.id);
      const run = newRun(seed, trio, ledger);
      results.push(playRun(run, ledger, { timingSkill: SKILL, rng: new Rng(seed * 7) }));
    }
    const byAct: Record<number, number> = {};
    const killers: Record<string, number> = {};
    for (const x of results) { byAct[x.act] = (byAct[x.act] ?? 0) + 1; if (x.killedBy) killers[x.killedBy] = (killers[x.killedBy] ?? 0) + 1; }
    const wins = results.filter((x) => x.result === 'won').length;
    const act1Boss = results.filter((x) => x.act >= 2).length;
    const lines = [
      `runs=${RUNS} skill=${SKILL} time=${Date.now() - t0}ms`,
      `won ${wins}/${RUNS} (${Math.round(100 * wins / RUNS)}%)  past act 1: ${act1Boss} (${Math.round(100 * act1Boss / RUNS)}%)`,
      'deepest act: ' + Object.entries(byAct).map(([a, n]) => `A${a}:${n}`).join(' '),
      'killers: ' + Object.entries(killers).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k}:${n}`).join(' '),
      'avg nodes ' + (results.reduce((a, x) => a + x.nodes, 0) / RUNS).toFixed(1) + ' avg turns ' + (results.reduce((a, x) => a + x.turns, 0) / RUNS).toFixed(0) + ' avg fights ' + (results.reduce((a, x) => a + x.fights, 0) / RUNS).toFixed(1),
      'avg top level ' + (results.reduce((a, x) => a + Math.max(...x.levels), 0) / RUNS).toFixed(1),
      'deaths at: ' + Object.entries(results.filter((x) => x.diedAt).reduce((m, x) => { m[x.diedAt!] = (m[x.diedAt!] ?? 0) + 1; return m; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join(' '),
      'avg level of the dead ' + (results.filter((x) => x.result === 'lost').reduce((a, x) => a + Math.max(...x.levels), 0) / Math.max(1, results.filter((x) => x.result === 'lost').length)).toFixed(1),
    ];
    console.log('\n' + lines.join('\n'));
    expect(results.length).toBe(RUNS);
  });
});

import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { createBattle, step, byId, alive, timeline, nextIntent, legalActions, advance } from '../src/engine/battle';
import { newRun, startBattle, finishBattle, enterNode, reachable, newMember } from '../src/engine/run';
import { newLedger } from '../src/engine/ledger';
import { ENCOUNTERS } from '../src/data/encounters';

const ledger = newLedger();
const starters = ['ph_tank', 'ph_striker', 'ph_mender'];

function battle(seed = 1, enc = 'ph_a1_1') {
  const run = newRun(seed, starters, ledger);
  return { run, s: createBattle(new Rng(seed), run, ENCOUNTERS[enc]) };
}

describe('battle', () => {
  it('starts with an actor and a timeline', () => {
    const { s } = battle();
    expect(s.actor).toBeTruthy();
    expect(timeline(s).length).toBe(8);
    expect(alive(s.enemies).length).toBe(2);
  });

  it('a weakness hit chips Break and breaks at zero', () => {
    const { s } = battle(3);
    // force the striker to act first with a slash weapon against the blob (weak to slash, break 3)
    const striker = s.heroes.find((h) => h.def === 'ph_striker')!;
    for (const c of [...s.heroes, ...s.enemies]) c.tick = 100;
    striker.tick = 0;
    advance(s);
    expect(s.actor).toBe(striker.id);
    const blob = s.enemies[0];
    const before = blob.breakNow;
    const ev = step(s, { t: 'attack', target: blob.id }, { grades: ['perfect'] });
    const hit = ev.find((e) => e.kind === 'hit');
    expect(hit && hit.kind === 'hit' && hit.weak).toBe(true);
    // perfect on a weakness chips 2
    expect(blob.breakNow).toBe(Math.max(0, before - 2));
    expect(ev.some((e) => e.kind === 'chip')).toBe(true);
  });

  it('runs to a result with random legal actions', () => {
    const { s } = battle(7, 'ph_a1_3');
    const r = new Rng(9);
    let guard = 0;
    while (!s.over && guard++ < 500) {
      const c = byId(s, s.actor!)!;
      if (c.side === 'enemy') { step(s, null, { guard: ['good'] }); continue; }
      const legal = legalActions(s);
      const foe = alive(s.enemies)[0];
      const ok = legal.skills.filter((k) => k.ok);
      if (ok.length && r.chance(0.5)) step(s, { t: 'skill', id: r.pick(ok).id, target: foe.id }, { grades: ['good', 'good', 'good'] });
      else step(s, { t: 'attack', target: foe.id }, { grades: ['good'] });
    }
    expect(s.over).toBeTruthy();
    expect(s.events.at(-1)?.kind).toBe('end');
  });

  it('enemy intents cycle through the pattern', () => {
    const { s } = battle(2, 'ph_a1_1');
    const blob = s.enemies[0];
    const first = nextIntent(blob).id;
    expect(['bite', 'spit']).toContain(first);
  });

  it('a KO on the front row pulls in the bench', () => {
    const run = newRun(5, starters, ledger);
    run.party.push(newMember(run, 'ph_caster'));
    const s = createBattle(new Rng(5), run, ENCOUNTERS['ph_a1_1']);
    expect(s.bench.length).toBe(1);
    const victim = s.heroes[0];
    victim.hp = 1;
    // enemy acts next
    for (const c of [...s.heroes, ...s.enemies]) c.tick = 100;
    s.enemies[0].tick = 0;
    advance(s);
    // the plan may target someone else; force it
    s.plan!.targets = [victim.id];
    const ev = step(s, null, { guard: ['miss'] });
    if (ev.some((e) => e.kind === 'ko')) {
      expect(ev.some((e) => e.kind === 'reinforce')).toBe(true);
      expect(s.heroes.length).toBe(3);
      expect(s.bench[0].id).toBe(victim.id);
    }
  });

  it('a run battle writes HP back and pays rewards', () => {
    const run = newRun(11, starters, ledger);
    const first = reachable(run)[0];
    enterNode(run, first.id);
    const s = startBattle(run);
    const r = new Rng(1);
    let guard = 0;
    while (!s.over && guard++ < 600) {
      const c = byId(s, s.actor!)!;
      if (c.side === 'enemy') { step(s, null, { guard: ['good'] }); continue; }
      step(s, { t: 'attack', target: alive(s.enemies)[0].id }, { grades: [r.chance(0.5) ? 'perfect' : 'good'] });
    }
    const gold = run.gold;
    finishBattle(run, s);
    if (s.over === 'win') { expect(run.pending?.kind).toBe('reward'); expect(run.gold).toBeGreaterThan(gold); }
    else expect(run.over).toBe('lost');
  });
});

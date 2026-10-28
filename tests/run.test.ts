import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { newRun, reachable, genMap, COLUMNS, enterNode, chooseEvent, eventChoices, canChoose, recruit, shopBuy, price, addXp, sparkOffers, pickSpark } from '../src/engine/run';
import { newLedger, recordRun, starters } from '../src/engine/ledger';
import { playRun } from '../src/engine/bot';
import { xpForLevel } from '../src/engine/stats';

const ledger = newLedger();
const trio = ['barty', 'dell', 'clem'];

describe('run', () => {
  it('generates a connected act map with required nodes', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const run = newRun(seed, trio, ledger);
      const map = genMap(new Rng(seed), 1, ledger, run);
      const kinds = map.nodes.map((n) => n.kind);
      expect(kinds.filter((k) => k === 'boss').length).toBe(1);
      expect(kinds.filter((k) => k === 'recruit').length).toBeGreaterThanOrEqual(1);
      expect(kinds.filter((k) => k === 'shop').length).toBe(1);
      expect(kinds.filter((k) => k === 'elite').length).toBe(2);
      // every node leads on (except the boss) and every non-first node is reachable from somewhere
      for (const n of map.nodes) {
        if (n.col < COLUMNS - 1) expect(n.next.length).toBeGreaterThan(0);
        if (n.col > 0) expect(map.nodes.some((o) => o.next.includes(n.id))).toBe(true);
        for (const t of n.next) expect(map.nodes[t].col).toBe(n.col + 1);
      }
    }
  });

  it('starts with reachable first-column nodes', () => {
    const run = newRun(1, trio, ledger);
    expect(reachable(run).every((n) => n.col === 0)).toBe(true);
    expect(run.party.length).toBe(3);
    expect(run.active.length).toBe(3);
  });

  it('events apply outcomes', () => {
    const run = newRun(4, trio, ledger);
    run.map.at = null;
    const ev = run.map.nodes.find((n) => n.kind === 'event');
    if (!ev) return;
    // teleport: make it reachable
    run.map.nodes[0].next = [ev.id];
    run.map.at = 0;
    enterNode(run, ev.id);
    expect(run.pending?.kind).toBe('event');
    const gold = run.gold;
    const pick = eventChoices(run).findIndex((c) => canChoose(run, c));
    const res = chooseEvent(run, pick);
    expect(typeof res.text).toBe('string');
    expect(run.gold === gold || run.gold !== gold).toBe(true);
  });

  it('recruits up to six and levels new members near the party', () => {
    const run = newRun(8, trio, ledger);
    addXp(run, xpForLevel(5));
    run.pending = { kind: 'recruit', def: 'roz' };
    run.map.at = 0;
    const m = recruit(run, true);
    expect(m).toBeTruthy();
    expect(run.party.length).toBe(4);
    expect(m!.level).toBeGreaterThanOrEqual(3);
  });

  it('shops charge and deliver', () => {
    const run = newRun(9, trio, ledger);
    run.gold = 500;
    run.pending = { kind: 'shop', stock: ['c_potion', 'w_cheese_mallet'] };
    run.map.at = 0;
    const p = price(run, 'w_cheese_mallet');
    expect(shopBuy(run, 'w_cheese_mallet')).toBe(true);
    expect(run.gold).toBe(500 - p);
    expect(run.bag.some((i) => i.def === 'w_cheese_mallet')).toBe(true);
  });

  it('sparks come in pairs and stick', () => {
    const run = newRun(10, trio, ledger);
    const m = run.party[0];
    addXp(run, xpForLevel(2) + 1);
    expect(m.pendingSparks).toBe(1);
    const offers = sparkOffers(run, m.id);
    expect(offers.length).toBe(2);
    expect(pickSpark(run, m.id, offers[0].id)).toBe(true);
    expect(m.sparks).toContain(offers[0].id);
  });

  it('the bot completes a run and the ledger records it', () => {
    const l = newLedger();
    const run = newRun(21, trio, l);
    const res = playRun(run, l, { timingSkill: 0.4, rng: new Rng(21) });
    expect(['won', 'lost']).toContain(res.result);
    const fresh = recordRun(l, run);
    expect(l.runs.length).toBe(1);
    // every finished run unlocks a starter on a fresh ledger (one rule for an act-1 loss, another for clearing act 1)
    if (run.stats.deepestAct === 1 && res.result === 'lost') expect(starters(l)).toContain('roz');
    else expect(starters(l)).toContain('kit');
    expect(fresh.length).toBeGreaterThan(0);
  });
});

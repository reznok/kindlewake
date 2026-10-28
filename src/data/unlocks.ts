import type { Ledger, RunRecord } from '../core/types';

/**
 * Ledger unlock rules, checked when a run ends. Placeholder set until the content pass.
 * kinds: `starter` makes a character a starting option; `recruit` lets a character appear in runs;
 * `relic` adds a relic to the pool; `kit` adds a starting kit.
 */
export interface UnlockDef {
  id: string;
  name: string;
  desc: string;
  kind: 'starter' | 'recruit' | 'relic' | 'kit';
  target: string;
  when: (ledger: Ledger, rec: RunRecord) => boolean;
}

export const UNLOCKS: UnlockDef[] = [
  { id: 'u_first_run', name: 'First steps', desc: 'Finish a run, any way.', kind: 'starter', target: 'ph_caster', when: (l) => l.runs.length >= 1 },
  { id: 'u_act1', name: 'Past the first gate', desc: 'Beat the act 1 boss.', kind: 'starter', target: 'ph_trickster', when: (l) => l.runs.some((r) => r.act >= 2) },
  { id: 'u_three_runs', name: 'Persistent', desc: 'Three runs.', kind: 'recruit', target: 'ph_warden', when: (l) => l.runs.length >= 3 },
  { id: 'u_kills', name: 'Well travelled', desc: '100 kills in total.', kind: 'recruit', target: 'ph_support', when: (l) => l.runs.reduce((a, r) => a + r.kills, 0) >= 100 },
  { id: 'u_lucky', name: 'Lucky streak', desc: 'Win a run.', kind: 'recruit', target: 'ph_wild', when: (l) => l.runs.some((r) => r.result === 'won') },
  { id: 'u_relic_glass', name: 'Patience', desc: 'Survive 300 turns in one run.', kind: 'relic', target: 'r_glass', when: (_l, r) => r.turns >= 300 },
];

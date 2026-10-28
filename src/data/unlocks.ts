import type { Ledger, RunRecord } from '../core/types';
import { ENEMIES } from './enemies';

/**
 * Ledger unlock rules (act 1), checked when a run ends. Unlocks add options, never numbers.
 * kinds: `starter` makes a character a starting option; `recruit` lets a character appear in runs;
 * `relic` adds a relic to the pool; `kit` adds a starting kit. `desc` is the rule (shown while locked);
 * `ledger` is what Nan's Ledger says on the run-end screen once it unlocks.
 */
export interface UnlockDef {
  id: string;
  name: string;
  desc: string;
  ledger: string;
  kind: 'starter' | 'recruit' | 'relic' | 'kit';
  target: string;
  when: (ledger: Ledger, rec: RunRecord) => boolean;
}

/** Starting kits a `kit` unlock can grant: items that replace the default two Buttered Scones. */
export const KITS: Record<string, { name: string; desc: string; items: { id: string; qty: number }[] }> = {
  kit_frostjam: { name: 'Frost-jam lunch', desc: 'Two Snow Globes instead of two Buttered Scones.', items: [{ id: 'c_snow_globe', qty: 2 }] },
};

/** The act-1 map has seven columns; entering the seventh node of act 1 means the boss was reached. */
const ACT1_COLUMNS = 7;
const reachedAct1Boss = (r: RunRecord) => r.act >= 2 || r.nodes >= ACT1_COLUMNS;
const nameOf = (id: string) => ENEMIES[id]?.name ?? id;
/** RunRecord carries no event flags; a `seen['event:<id>']` tally (if the Ledger keeps one) unlocks exactly, else a Wake count stands in. */
const finishedEvent = (l: Ledger, id: string, fallbackWakes: number) => (l.seen['event:' + id] ?? 0) > 0 || l.runs.length >= fallbackWakes;

export const UNLOCKS: UnlockDef[] = [
  {
    id: 'u_roz', name: 'Roz Gale', kind: 'starter', target: 'roz',
    desc: 'Gutter in the first act.',
    ledger: 'The sky did something odd. Nan has written to the Almanac. Roz Gale will be here by breakfast, complaining about the weather.',
    when: (_l, r) => r.result === 'lost' && r.act === 1,
  },
  {
    id: 'u_pell', name: 'Pell', kind: 'starter', target: 'pell',
    desc: 'Finish a Wake with the mime in your party.',
    ledger: 'A mime was seen in the Topiary. Nan left a note on the caravan. It came back with a drawing of a door.',
    when: (_l, r) => r.party.includes('pell'),
  },
  {
    id: 'u_ashlar', name: 'Ashlar', kind: 'starter', target: 'ashlar',
    desc: 'Reach the end of the first act.',
    ledger: "Nan has noticed the statue is missing from the garden. She's left the gate open for him.",
    when: (_l, r) => reachedAct1Boss(r),
  },
  {
    id: 'u_gertie', name: 'Gertie Bellow', kind: 'starter', target: 'gertie',
    desc: 'Finish a Wake with the crier in your party, or sign for three Wakes.',
    ledger: 'Nan has paid a goat sixty buttons in advance.',
    when: (l, r) => r.party.includes('gertie') || l.runs.length >= 3,
  },
  {
    id: 'u_kit', name: 'Kit Brassfinch', kind: 'starter', target: 'kit',
    desc: 'Clear the first act.',
    ledger: "Nan has written to Thimble Mill. Kit Brassfinch is coming. She's bringing the machine.",
    when: (_l, r) => r.act >= 2,
  },
  {
    id: 'u_soot_smudge', name: 'Soot Smudge', kind: 'relic', target: 'r_soot_smudge',
    desc: 'Be stopped by the grey hoods.',
    ledger: "Grey on the thumbs. Nan didn't write that.",
    when: (_l, r) => r.result === 'lost' && (r.killedBy === nameOf('a1_snuffer') || r.killedBy === nameOf('a1_nocturne')),
  },
  {
    id: 'u_moth_jar', name: 'Moth in a Jar', kind: 'relic', target: 'r_moth_jar',
    desc: 'Help the Professor (or keep at it for four Wakes).',
    ledger: "Nan told Dun. He said he'd keep an eye out.",
    when: (l) => finishedEvent(l, 'ev_mothersole', 4),
  },
  {
    id: 'u_turnip_medal', name: 'Turnip War Medal', kind: 'relic', target: 'r_turnip_medal',
    desc: 'Meet the veteran (or keep at it for five Wakes).',
    ledger: "Nan told Dun. He said he'd keep an eye out.",
    when: (l) => finishedEvent(l, 'ev_veteran', 5),
  },
  {
    id: 'u_frostjam', name: 'Frost-jam lunch', kind: 'kit', target: 'kit_frostjam',
    desc: 'Clear the first act.',
    ledger: "There's frost-jam in your kit. Don't ask.",
    when: (_l, r) => r.act >= 2,
  },
];

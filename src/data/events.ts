import type { EventDef } from '../core/types';

/** Event pool. Placeholder until the content pass. */
export const EVENTS: Record<string, EventDef> = {};

export function defineEvents(list: EventDef[]) { for (const e of list) EVENTS[e.id] = e; }

defineEvents([
  {
    id: 'ph_well', act: 1, title: 'A well', text: 'A well. Something glints at the bottom.',
    choices: [
      { label: 'Climb down', result: 'Coins! And a cold.', outcomes: [{ kind: 'gold', amount: 30 }, { kind: 'hurt', pct: 10 }], gamble: { chance: 0.25, result: 'Something was living down there.', outcomes: [{ kind: 'fight', encounter: 'ph_a1_2' }] } },
      { label: 'Drink', result: 'Refreshing.', outcomes: [{ kind: 'heal', pct: 30 }] },
      { label: 'Leave it', result: 'Probably wise.', outcomes: [] },
    ],
  },
  {
    id: 'ph_pedlar', act: 1, title: 'A pedlar', text: 'A pedlar with one item and a lot of opinions.',
    choices: [
      { label: 'Buy (20 gold)', result: 'Sold.', outcomes: [{ kind: 'gold', amount: -20 }, { kind: 'item', id: 'c_potion' }] },
      { label: 'Haggle', result: 'They are offended but impressed.', outcomes: [{ kind: 'item', id: 'c_antidote' }], gamble: { chance: 0.3, result: 'They are only offended.', outcomes: [{ kind: 'fight', encounter: 'ph_a1_5' }] } },
    ],
  },
  {
    id: 'ph_shrine', act: 1, title: 'A small shrine', text: 'A shrine to somebody. The plaque is worn.',
    choices: [
      { label: 'Pray', result: 'Someone feels stronger.', outcomes: [{ kind: 'stat', stat: 'atk', amount: 2, who: 'random' }] },
      { label: 'Donate 15 gold', result: 'A relic appears. Convenient.', outcomes: [{ kind: 'gold', amount: -15 }, { kind: 'relic', id: 'r_coin' }] },
      { label: 'Kick it', result: 'Ow.', outcomes: [{ kind: 'hurt', pct: 5 }, { kind: 'xp', amount: 10 }] },
    ],
  },
]);

export function eventPool(act: 1 | 2 | 3): EventDef[] { return Object.values(EVENTS).filter((e) => e.act === act); }

import type { RelicDef } from '../core/types';

/**
 * Keepsakes (relics): party-wide passives. Three are held out of the drop/shop pool until a Ledger unlock
 * (see unlocks.ts); events can still hand them out directly.
 */
export const RELICS: Record<string, RelicDef> = {};

export function defineRelics(list: RelicDef[]) { for (const r of list) RELICS[r.id] = r; }

defineRelics([
  { id: 'r_lamplighters_button', name: "The Lamplighter's Button", desc: 'The party acts first. Brass, stamped with a wick and the numeral XI. Still polished. Someone has polished it for a very long time.', passive: { id: 'firstStrike' }, tier: 1 },
  { id: 'r_patient_blanket', name: 'The Patient Blanket', desc: 'Everyone starts each battle with a small barrier. It waited seventy-nine years. It can wait while you nap.', passive: { id: 'startBarrier' }, tier: 1 },
  { id: 'r_bellamy_button', name: "Bellamy's Golden Button", desc: '+20% buttons from fights. She paid an army with her coat. You can pay for a scone.', passive: { id: 'goldPct', power: 20 }, tier: 1 },
  { id: 'r_moth_jar', name: 'Moth in a Jar', desc: "Each Break gives the Front 4 Moxie. It's very happy in there. It thinks the jar is the sun.", passive: { id: 'mpOnBreak' }, tier: 1 },
  { id: 'r_turnip_medal', name: 'Turnip War Medal', desc: 'The Wagon earns full XP. For holding a field for one hundred and forty-one years.', passive: { id: 'benchXp' }, tier: 1 },
  { id: 'r_soot_smudge', name: 'Soot Smudge', desc: "Timing windows wider. A grey thumbprint that won't wash off. You feel you've done this before.", passive: { id: 'timingWide' }, tier: 1 },
  { id: 'r_tide_clock', name: "Glee's Pocket Tide-Clock", desc: 'Once per battle, each ally who would fall stands back up at 30%. It runs backwards for exactly one second, then apologises.', passive: { id: 'reviveOnce' }, tier: 1 },
  { id: 'r_compass', name: "Inkwhistle's Compass", desc: "Better drops. Points north, mostly. Points at the Rim when it thinks you're not looking.", passive: { id: 'luckyDrops' }, tier: 1 },
  { id: 'r_soup_tureen', name: 'Peace Soup Tureen', desc: "Everyone regains a little HP each turn. It's hard to fight on a full stomach. It's harder to lose on one.", passive: { id: 'hpRegen' }, tier: 1 },
  { id: 'r_wrens_egg', name: "The Wren's Egg", desc: 'Guard blocks more. Small, blue, very well looked after. Ashlar would like it back eventually.', passive: { id: 'ironGuard' }, tier: 1 },
  { id: 'r_almanac', name: 'The Almanac of Tuesdays', desc: '+20% XP. Every page is Tuesday. You end up learning Tuesday by heart.', passive: { id: 'xpPct', power: 20 }, tier: 1 },
  { id: 'r_geralds_cousin', name: "Gerald's Cousin", desc: 'Bright hits heal the hitter 5%. A starter from the same batch as Gerald. Gerald does not acknowledge him.', passive: { id: 'perfectHeal' }, tier: 1 },
]);

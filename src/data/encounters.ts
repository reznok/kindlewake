import type { EncounterDef } from '../core/types';

/**
 * Encounter pools. `tier` 1-3 maps to act; elites and bosses are flagged. Event-fight encounters (ids `e_*`) are
 * started by event outcomes only and are kept out of the map pools.
 * Act 1 bands: columns 1-2 use only teacher foes; columns 3-4 bring the first telegraphed heavies; 5-6 mix three makers.
 */
export const ENCOUNTERS: Record<string, EncounterDef> = {};

export function defineEncounters(list: EncounterDef[]) { for (const e of list) ENCOUNTERS[e.id] = e; }

const E = (...defs: string[]) => defs.map((def) => ({ def }));
const L = (level: number, ...defs: string[]) => defs.map((def) => ({ def, level }));

defineEncounters([
  // ---- act 1: the Marigold Downs (cols 1-2, teacher foes only)
  { id: 'a1_jam', tier: 1, cols: [0, 1, 2], enemies: E('a1_jamble', 'a1_jamble'), background: 'bg_meadow' },
  { id: 'a1_buzz', tier: 1, cols: [0, 1, 2], enemies: E('a1_scab_bee', 'a1_waistcoat_wasp'), background: 'bg_meadow' },
  { id: 'a1_post', tier: 1, cols: [0, 1, 2], enemies: E('a1_runaway_kite', 'a1_cawdle'), background: 'bg_grass' },
  { id: 'a1_dusk_early', tier: 1, cols: [0, 1, 2], enemies: E('a1_murkwing', 'a1_murkwing', 'a1_jamble'), background: 'bg_forest' },
  // cols 3-4
  { id: 'a1_field', tier: 1, cols: [2, 3, 4], enemies: E('a1_haywarden', 'a1_cawdle'), background: 'bg_autumn' },
  { id: 'a1_bridge', tier: 1, cols: [2, 3, 4], enemies: E('a1_toll_goat', 'a1_cawdle'), background: 'bg_bridge' },
  { id: 'a1_topiary', tier: 1, cols: [2, 3, 4], enemies: E('a1_leafhound', 'a1_cawdle'), background: 'bg_castle' },
  { id: 'a1_garden', tier: 1, cols: [2, 3, 4], enemies: E('a1_trundlesnail', 'a1_puffcap'), background: 'bg_meadow' },
  { id: 'a1_picnic', tier: 1, cols: [2, 3, 4], enemies: E('a1_luncheon', 'a1_scab_bee'), background: 'bg_meadow' },
  // cols 5-6
  { id: 'a1_war', tier: 1, cols: [4, 5], enemies: E('a1_turnipcutter', 'a1_haywarden'), background: 'bg_autumn' },
  { id: 'a1_sett', tier: 1, cols: [4, 5], enemies: E('a1_grumbadger', 'a1_puffcap', 'a1_scab_bee'), background: 'bg_forest' },
  { id: 'a1_snuffers', tier: 1, cols: [4, 5], enemies: E('a1_snuffer', 'a1_murkwing', 'a1_murkwing'), background: 'bg_forest' },
  { id: 'a1_duskedge', tier: 1, cols: [4, 5], enemies: E('a1_snuffer', 'a1_sheetling', 'a1_murkwing'), background: 'bg_forest' },
  // Bigwigs
  { id: 'a1_elite_baron', tier: 1, elite: true, enemies: E('a1_baron', 'a1_toll_goat'), background: 'bg_bridge', intro: 'Bylaw one: the toll. Bylaw two: see bylaw one.' },
  { id: 'a1_elite_colossus', tier: 1, elite: true, enemies: E('a1_colossus'), background: 'bg_autumn_red', intro: 'The jam regards you. The jam has always regarded you.' },
  { id: 'a1_elite_nocturne', tier: 1, elite: true, enemies: E('a1_nocturne', 'a1_snuffer'), background: 'bg_forest', intro: '"You always open with that."' },
  // boss
  { id: 'a1_boss', tier: 1, boss: true, enemies: E('a1_thief'), background: 'bg_jungle', intro: 'Duskwood. Something enormous and grey is circling, and somebody on its back is screaming.' },

  // ---- act 1 event fights (no node; started by event outcomes)
  { id: 'e_picnic', tier: 1, enemies: L(1, 'a1_sheetling', 'a1_sheetling'), background: 'bg_meadow' },
  { id: 'e_snuffer', tier: 1, enemies: L(2, 'a1_snuffer', 'a1_murkwing', 'a1_murkwing'), background: 'bg_town' },
  { id: 'e_specs', tier: 1, enemies: L(2, 'a1_grumbadger', 'a1_puffcap'), background: 'bg_forest' },
  { id: 'e_duchy', tier: 1, enemies: L(3, 'a1_turnipcutter', 'a1_haywarden'), background: 'bg_autumn', intro: '"FINALLY."' },
  { id: 'e_customs', tier: 1, enemies: L(2, 'a1_toll_goat', 'a1_toll_goat'), background: 'bg_bridge', intro: 'Bylaw 12(b): Arguing. Also noise.' },
  { id: 'e_pond', tier: 1, enemies: L(1, 'a1_murkwing', 'a1_murkwing'), background: 'bg_lake' },

  // ---- STUB: acts 2 and 3 reuse act-1 packs at higher tiers until their own content exists (levels come from the map)
  { id: 'a2_war', tier: 2, enemies: E('a1_turnipcutter', 'a1_haywarden', 'a1_cawdle'), background: 'bg_desert' },
  { id: 'a2_sett', tier: 2, enemies: E('a1_grumbadger', 'a1_puffcap', 'a1_scab_bee'), background: 'bg_lake' },
  { id: 'a2_snuffers', tier: 2, enemies: E('a1_snuffer', 'a1_snuffer', 'a1_murkwing'), background: 'bg_town' },
  { id: 'a2_duskedge', tier: 2, enemies: E('a1_snuffer', 'a1_sheetling', 'a1_murkwing'), background: 'bg_lake' },
  { id: 'a2_garden', tier: 2, enemies: E('a1_trundlesnail', 'a1_leafhound', 'a1_waistcoat_wasp'), background: 'bg_desert' },
  { id: 'a2_bridge', tier: 2, enemies: E('a1_toll_goat', 'a1_toll_goat', 'a1_cawdle'), background: 'bg_lake' },
  { id: 'a2_elite', tier: 2, elite: true, enemies: E('a1_nocturne', 'a1_snuffer'), background: 'bg_town' },
  { id: 'a2_elite_jam', tier: 2, elite: true, enemies: E('a1_colossus', 'a1_jamble'), background: 'bg_desert' },
  { id: 'a2_boss', tier: 2, boss: true, enemies: E('a1_thief', 'a1_murkwing'), background: 'bg_lake' },
  { id: 'a3_war', tier: 3, enemies: E('a1_turnipcutter', 'a1_turnipcutter', 'a1_haywarden'), background: 'bg_snow' },
  { id: 'a3_sett', tier: 3, enemies: E('a1_grumbadger', 'a1_luncheon', 'a1_puffcap'), background: 'bg_mountains' },
  { id: 'a3_snuffers', tier: 3, enemies: E('a1_snuffer', 'a1_snuffer', 'a1_sheetling'), background: 'bg_snow' },
  { id: 'a3_bridge', tier: 3, enemies: E('a1_toll_goat', 'a1_leafhound', 'a1_cawdle'), background: 'bg_mountains' },
  { id: 'a3_garden', tier: 3, enemies: E('a1_trundlesnail', 'a1_trundlesnail', 'a1_jamble'), background: 'bg_snow' },
  { id: 'a3_elite', tier: 3, elite: true, enemies: E('a1_baron', 'a1_toll_goat'), background: 'bg_mountains' },
  { id: 'a3_elite_dusk', tier: 3, elite: true, enemies: E('a1_nocturne', 'a1_snuffer', 'a1_murkwing'), background: 'bg_snow' },
  { id: 'a3_boss', tier: 3, boss: true, enemies: E('a1_thief', 'a1_snuffer'), background: 'bg_volcano' },
]);

/** Event-fight encounters are never placed on map nodes. */
export function isEventFight(e: EncounterDef): boolean { return e.id.startsWith('e_'); }

export function encounterPool(act: 1 | 2 | 3, kind: 'fight' | 'elite' | 'boss'): EncounterDef[] {
  return Object.values(ENCOUNTERS).filter((e) => e.tier === act && !isEventFight(e) && (kind === 'elite' ? e.elite : kind === 'boss' ? e.boss : !e.elite && !e.boss));
}

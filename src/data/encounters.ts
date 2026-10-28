import type { EncounterDef } from '../core/types';

/** Encounter pools. Placeholder until the content pass. `tier` 1-3 maps to act; elites and bosses are flagged. */
export const ENCOUNTERS: Record<string, EncounterDef> = {};

export function defineEncounters(list: EncounterDef[]) { for (const e of list) ENCOUNTERS[e.id] = e; }

defineEncounters([
  { id: 'ph_a1_1', tier: 1, enemies: [{ def: 'ph_slime' }, { def: 'ph_slime' }] },
  { id: 'ph_a1_2', tier: 1, enemies: [{ def: 'ph_wolf' }, { def: 'ph_slime' }] },
  { id: 'ph_a1_3', tier: 1, enemies: [{ def: 'ph_wolf' }, { def: 'ph_wolf' }] },
  { id: 'ph_a1_4', tier: 1, enemies: [{ def: 'ph_sprite' }, { def: 'ph_slime' }, { def: 'ph_slime' }] },
  { id: 'ph_a1_5', tier: 1, enemies: [{ def: 'ph_bandit' }, { def: 'ph_bandit' }] },
  { id: 'ph_a1_6', tier: 1, enemies: [{ def: 'ph_golem' }, { def: 'ph_sprite' }] },
  { id: 'ph_a1_7', tier: 1, enemies: [{ def: 'ph_bandit' }, { def: 'ph_wolf' }, { def: 'ph_sprite' }] },
  { id: 'ph_a1_e1', tier: 1, elite: true, enemies: [{ def: 'ph_elite' }] },
  { id: 'ph_a1_e2', tier: 1, elite: true, enemies: [{ def: 'ph_golem' }, { def: 'ph_golem' }, { def: 'ph_sprite' }] },
  { id: 'ph_a1_boss', tier: 1, boss: true, enemies: [{ def: 'ph_boss' }] },
  // acts 2 and 3 reuse act-1 placeholders at higher levels until their content exists
  { id: 'ph_a2_1', tier: 2, enemies: [{ def: 'ph_wolf' }, { def: 'ph_wolf' }, { def: 'ph_bandit' }] },
  { id: 'ph_a2_2', tier: 2, enemies: [{ def: 'ph_golem' }, { def: 'ph_sprite' }, { def: 'ph_sprite' }] },
  { id: 'ph_a2_3', tier: 2, enemies: [{ def: 'ph_bandit' }, { def: 'ph_bandit' }, { def: 'ph_slime' }, { def: 'ph_slime' }] },
  { id: 'ph_a2_e1', tier: 2, elite: true, enemies: [{ def: 'ph_elite' }, { def: 'ph_wolf' }] },
  { id: 'ph_a2_boss', tier: 2, boss: true, enemies: [{ def: 'ph_boss' }, { def: 'ph_sprite' }] },
  { id: 'ph_a3_1', tier: 3, enemies: [{ def: 'ph_golem' }, { def: 'ph_golem' }, { def: 'ph_bandit' }] },
  { id: 'ph_a3_2', tier: 3, enemies: [{ def: 'ph_sprite' }, { def: 'ph_sprite' }, { def: 'ph_sprite' }, { def: 'ph_wolf' }] },
  { id: 'ph_a3_e1', tier: 3, elite: true, enemies: [{ def: 'ph_elite' }, { def: 'ph_elite' }] },
  { id: 'ph_a3_boss', tier: 3, boss: true, enemies: [{ def: 'ph_boss' }, { def: 'ph_golem' }] },
]);

export function encounterPool(act: 1 | 2 | 3, kind: 'fight' | 'elite' | 'boss'): EncounterDef[] {
  return Object.values(ENCOUNTERS).filter((e) => e.tier === act && (kind === 'elite' ? e.elite : kind === 'boss' ? e.boss : !e.elite && !e.boss));
}

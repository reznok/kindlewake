import type { AbilityDef } from '../core/types';

/**
 * Ability table. Placeholder set until the content pass; ids used by placeholder characters and enemies.
 * Conventions: `power` 100 = a plain weapon swing; MP costs 0-12; multi-hit abilities list one Hit per tap.
 */
export const ABILITIES: Record<string, AbilityDef> = {};

export function defineAbilities(list: AbilityDef[]) { for (const a of list) ABILITIES[a.id] = a; }

defineAbilities([
  // ---- generic enemy moves
  { id: 'e_bite', name: 'Bite', desc: 'A bite.', mp: 0, target: 'enemy', hits: [{ type: 'pierce', power: 100, scale: 'atk' }] },
  { id: 'e_slam', name: 'Slam', desc: 'A heavy slam.', mp: 0, target: 'enemy', hits: [{ type: 'blunt', power: 170, scale: 'atk' }], delay: 1.3 },
  { id: 'e_scratch', name: 'Scratch', desc: 'Two quick scratches.', mp: 0, target: 'enemy', hits: [{ type: 'slash', power: 55, scale: 'atk' }, { type: 'slash', power: 55, scale: 'atk' }] },
  { id: 'e_spit', name: 'Spit', desc: 'Poison spit.', mp: 0, target: 'enemy', hits: [{ type: 'spirit', power: 70, scale: 'mag' }], effects: [{ kind: 'status', id: 'poison', turns: 3, chance: 0.7 }] },
  { id: 'e_ember', name: 'Ember', desc: 'A puff of fire.', mp: 0, target: 'enemy', hits: [{ type: 'fire', power: 90, scale: 'mag' }], effects: [{ kind: 'status', id: 'burn', turns: 2, chance: 0.4 }] },
  { id: 'e_gust', name: 'Gust', desc: 'Wind at everyone.', mp: 0, target: 'enemies', hits: [{ type: 'storm', power: 60, scale: 'mag' }] },
  { id: 'e_howl', name: 'Howl', desc: 'Might for the pack.', mp: 0, target: 'allies', effects: [{ kind: 'status', id: 'atkUp', turns: 3 }] },
  { id: 'e_hiss', name: 'Hiss', desc: 'Weakens a hero.', mp: 0, target: 'enemy', effects: [{ kind: 'status', id: 'atkDown', turns: 3 }] },
  { id: 'e_mend', name: 'Mend', desc: 'Heals an ally.', mp: 0, target: 'ally', effects: [{ kind: 'heal', power: 120, scale: 'mag' }] },
  { id: 'e_wait', name: 'Lurk', desc: 'Does nothing, menacingly.', mp: 0, target: 'self' },
  { id: 'e_charge', name: 'Wind up', desc: 'Winds up a big one.', mp: 0, target: 'self', effects: [{ kind: 'status', id: 'atkUp', turns: 2, who: 'self' }] },

  // ---- generic hero moves (placeholder roster)
  { id: 'h_cleave', name: 'Cleave', desc: 'Slash all enemies.', mp: 6, target: 'enemies', hits: [{ type: 'slash', power: 80, scale: 'atk' }] },
  { id: 'h_pierce', name: 'Lunge', desc: 'A piercing lunge that chips twice.', mp: 5, target: 'enemy', hits: [{ type: 'pierce', power: 120, scale: 'atk', chip: 2 }] },
  { id: 'h_bash', name: 'Bash', desc: 'A heavy blunt blow.', mp: 5, target: 'enemy', hits: [{ type: 'blunt', power: 150, scale: 'atk' }], delay: 1.2 },
  { id: 'h_fire', name: 'Spark', desc: 'A burst of fire.', mp: 6, target: 'enemy', hits: [{ type: 'fire', power: 130, scale: 'mag' }], effects: [{ kind: 'status', id: 'burn', turns: 2, chance: 0.5 }] },
  { id: 'h_frost', name: 'Rime', desc: 'Frost on all enemies; may chill.', mp: 8, target: 'enemies', hits: [{ type: 'frost', power: 80, scale: 'mag' }], effects: [{ kind: 'status', id: 'chill', turns: 2, chance: 0.5 }] },
  { id: 'h_storm', name: 'Jolt', desc: 'Lightning; may shock.', mp: 6, target: 'enemy', hits: [{ type: 'storm', power: 120, scale: 'mag' }], effects: [{ kind: 'status', id: 'shock', turns: 2, chance: 0.5 }] },
  { id: 'h_spirit', name: 'Hymn', desc: 'Spirit damage to one foe.', mp: 5, target: 'enemy', hits: [{ type: 'spirit', power: 120, scale: 'mag' }] },
  { id: 'h_heal', name: 'Mend', desc: 'Heal an ally.', mp: 6, target: 'ally', effects: [{ kind: 'heal', power: 150, scale: 'mag' }] },
  { id: 'h_healall', name: 'Chorus', desc: 'Heal the party a little.', mp: 10, target: 'allies', effects: [{ kind: 'heal', power: 80, scale: 'mag' }] },
  { id: 'h_revive', name: 'Rally', desc: 'Revive a fallen ally at 40% HP.', mp: 12, target: 'allyKo', effects: [{ kind: 'revive', fraction: 0.4 }] },
  { id: 'h_taunt', name: 'Challenge', desc: 'Taunt enemies for 2 turns and raise defence.', mp: 3, target: 'self', effects: [{ kind: 'status', id: 'taunt', turns: 2 }, { kind: 'status', id: 'defUp', turns: 2 }], delay: 0.7 },
  { id: 'h_barrier', name: 'Ward', desc: 'A barrier on an ally.', mp: 6, target: 'ally', effects: [{ kind: 'status', id: 'barrier', turns: 4, power: 30 }] },
  { id: 'h_might', name: 'Embolden', desc: 'Might on an ally.', mp: 5, target: 'ally', effects: [{ kind: 'status', id: 'atkUp', turns: 3 }] },
  { id: 'h_crack', name: 'Crack', desc: 'Lowers a foe\'s defence.', mp: 4, target: 'enemy', hits: [{ type: 'blunt', power: 60, scale: 'atk' }], effects: [{ kind: 'status', id: 'defDown', turns: 3 }] },
  { id: 'h_flurry', name: 'Flurry', desc: 'Three quick cuts.', mp: 7, target: 'enemy', hits: [{ type: 'slash', power: 50, scale: 'atk' }, { type: 'slash', power: 50, scale: 'atk' }, { type: 'slash', power: 50, scale: 'atk' }] },
  { id: 'h_poison', name: 'Dose', desc: 'Poisons a foe.', mp: 4, target: 'enemy', hits: [{ type: 'pierce', power: 70, scale: 'atk' }], effects: [{ kind: 'status', id: 'poison', turns: 4 }] },
  { id: 'h_delay', name: 'Trip', desc: 'Pushes a foe\'s turn back.', mp: 4, target: 'enemy', hits: [{ type: 'blunt', power: 50, scale: 'atk' }], effects: [{ kind: 'delay', amount: 0.6 }] },
  { id: 'h_haste', name: 'Quickstep', desc: 'Haste on an ally.', mp: 6, target: 'ally', effects: [{ kind: 'status', id: 'haste', turns: 3 }] },
  { id: 'h_cleanse', name: 'Tidy', desc: 'Cleanse an ally.', mp: 4, target: 'ally', effects: [{ kind: 'cleanse' }] },
]);

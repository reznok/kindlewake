import type { ItemDef } from '../core/types';

export const ITEMS: Record<string, ItemDef> = {};

export function defineItems(list: ItemDef[]) { for (const i of list) ITEMS[i.id] = i; }

defineItems([
  // weapons (one per damage type; power 100 = baseline)
  { id: 'w_sword', name: 'Sword', desc: 'Slashes.', kind: 'weapon', type: 'slash', power: 100, price: 40, tier: 1 },
  { id: 'w_spear', name: 'Spear', desc: 'Pierces.', kind: 'weapon', type: 'pierce', power: 100, price: 40, tier: 1 },
  { id: 'w_mace', name: 'Mace', desc: 'Bludgeons.', kind: 'weapon', type: 'blunt', power: 100, price: 40, tier: 1 },
  { id: 'w_dagger', name: 'Dagger', desc: 'Quick pierce.', kind: 'weapon', type: 'pierce', power: 85, price: 35, tier: 1, passive: { id: 'spdPlus', power: 2 } },
  { id: 'w_staff', name: 'Staff', desc: 'Bonks.', kind: 'weapon', type: 'blunt', power: 80, price: 35, tier: 1, passive: { id: 'mpRegen' } },
  { id: 'w_wand', name: 'Wand', desc: 'Spirit pokes.', kind: 'weapon', type: 'spirit', power: 80, price: 35, tier: 1 },
  { id: 'w_torch', name: 'Torch', desc: 'Fire swings.', kind: 'weapon', type: 'fire', power: 90, price: 45, tier: 1 },
  { id: 'w_icepick', name: 'Ice pick', desc: 'Frost pokes.', kind: 'weapon', type: 'frost', power: 90, price: 45, tier: 1 },
  { id: 'w_rod', name: 'Storm rod', desc: 'Storm jabs.', kind: 'weapon', type: 'storm', power: 90, price: 45, tier: 1 },
  // trinkets
  { id: 't_charm', name: 'Lucky charm', desc: '+crits.', kind: 'trinket', price: 50, passive: { id: 'critPlus' }, tier: 1 },
  { id: 't_band', name: 'Iron band', desc: 'Guard blocks more.', kind: 'trinket', price: 50, passive: { id: 'ironGuard' }, tier: 1 },
  { id: 't_leaf', name: 'Green leaf', desc: 'Regen each turn.', kind: 'trinket', price: 60, passive: { id: 'hpRegen' }, tier: 1 },
  { id: 't_bead', name: 'Blue bead', desc: 'MP each turn.', kind: 'trinket', price: 60, passive: { id: 'mpRegen' }, tier: 1 },
  { id: 't_feather', name: 'Feather', desc: 'Acts first.', kind: 'trinket', price: 70, passive: { id: 'firstStrike' }, tier: 1 },
  // consumables
  { id: 'c_potion', name: 'Potion', desc: 'Heals 40 HP.', kind: 'consumable', price: 20, use: { target: 'ally', effects: [{ kind: 'heal', power: 40, scale: 'flat' }] }, tier: 1 },
  { id: 'c_ether', name: 'Ether', desc: 'Restores 12 MP.', kind: 'consumable', price: 25, use: { target: 'ally', effects: [{ kind: 'mp', amount: 12 }] }, tier: 1 },
  { id: 'c_revive', name: 'Smelling salts', desc: 'Revives at 30% HP.', kind: 'consumable', price: 60, use: { target: 'allyKo', effects: [{ kind: 'revive', fraction: 0.3 }] }, tier: 1 },
  { id: 'c_antidote', name: 'Antidote', desc: 'Cleanses an ally.', kind: 'consumable', price: 15, use: { target: 'ally', effects: [{ kind: 'cleanse' }] }, tier: 1 },
  { id: 'c_bomb', name: 'Fire bomb', desc: 'Fire damage to all enemies.', kind: 'consumable', price: 30, use: { target: 'enemies', hits: [{ type: 'fire', power: 45, scale: 'none' }] }, tier: 1 },
  { id: 'c_snow', name: 'Snowball', desc: 'Frost damage to one enemy.', kind: 'consumable', price: 20, use: { target: 'enemy', hits: [{ type: 'frost', power: 50, scale: 'none' }] }, tier: 1 },
  { id: 'c_jar', name: 'Storm jar', desc: 'Storm damage to one enemy.', kind: 'consumable', price: 20, use: { target: 'enemy', hits: [{ type: 'storm', power: 50, scale: 'none' }] }, tier: 1 },
  { id: 'c_salt', name: 'Spirit salt', desc: 'Spirit damage to one enemy.', kind: 'consumable', price: 20, use: { target: 'enemy', hits: [{ type: 'spirit', power: 50, scale: 'none' }] }, tier: 1 },
]);

import type { ItemDef } from '../core/types';

/**
 * Items: the eight starting weapons (one per character's `weapon`), eight drop/shop weapons, ten knick-knacks
 * (trinkets) and the consumables. Starting weapons and event-only consumables are `tier: 3` so act-1 shops and
 * drops do not offer them (shops and drops include items whose tier is at most the current act).
 * `c_potion` is the Buttered Scone: the run starts with two (the engine seeds the bag with this id).
 */
export const ITEMS: Record<string, ItemDef> = {};

export function defineItems(list: ItemDef[]) { for (const i of list) ITEMS[i.id] = i; }

defineItems([
  // ---- starting weapons
  { id: 'w_rolling_pin', name: 'Crumb Rolling Pin', desc: 'Blunt 100. Four generations of dough have been flattened by it.', kind: 'weapon', type: 'blunt', power: 100, price: 30, tier: 3 },
  { id: 'w_carving_knife', name: 'Carving Knife', desc: 'Slash 100. Royal issue. She kept it. She was owed.', kind: 'weapon', type: 'slash', power: 100, price: 30, tier: 3 },
  { id: 'w_honey_dipper', name: 'Honey-Dipper', desc: 'Pierce 90. The girls do the hitting.', kind: 'weapon', type: 'pierce', power: 90, price: 30, tier: 3 },
  { id: 'w_stone_sword', name: 'Stone Sword', desc: 'Slash 100. Part of the statue. Not removable.', kind: 'weapon', type: 'slash', power: 100, price: 30, tier: 3 },
  { id: 'w_handbell', name: 'Brass Handbell', desc: 'Spirit 95. Rung at every proclamation since the old queen.', kind: 'weapon', type: 'spirit', power: 95, price: 30, tier: 3 },
  { id: 'w_big_wrench', name: 'Big Wrench', desc: 'Blunt 100. Fits every nut in Halcyra, eventually.', kind: 'weapon', type: 'blunt', power: 100, price: 30, tier: 3 },
  { id: 'w_hatpin', name: 'Silver Hatpin', desc: 'Pierce 95. Holds on a beret that does not need holding on.', kind: 'weapon', type: 'pierce', power: 95, price: 30, tier: 3 },
  { id: 'w_barometer', name: 'Barometer Staff', desc: 'Storm 90. Reads "Change". It always reads "Change".', kind: 'weapon', type: 'storm', power: 90, price: 30, tier: 3 },

  // ---- drop and shop weapons
  { id: 'w_rusty_scythe', name: 'Rusty Scythe of Thimble Mill', desc: 'Slash 110; hits may Bleed. Reaped its last turnip in 1061. Has been thinking about it since.', kind: 'weapon', type: 'slash', power: 110, price: 60, passive: { id: 'bleedTouch' }, tier: 1 },
  { id: 'w_toasting_fork', name: 'Toasting Fork', desc: 'Pierce 100; hits may Burn. Also toasts.', kind: 'weapon', type: 'pierce', power: 100, price: 55, passive: { id: 'burnTouch' }, tier: 1 },
  { id: 'w_cheese_mallet', name: 'Cheese Mallet', desc: 'Blunt 125. Aged two years. The mallet, not the cheese.', kind: 'weapon', type: 'blunt', power: 125, price: 55, tier: 1 },
  { id: 'w_lantern_stick', name: 'Lantern on a Stick', desc: 'Fire 100; the wielder regains a little Moxie each turn. Not *the* Lantern. *A* lantern.', kind: 'weapon', type: 'fire', power: 100, price: 60, passive: { id: 'mpRegen' }, tier: 1 },
  { id: 'w_ice_scoop', name: 'Ice-Cream Scoop', desc: 'Frost 100; hits may Chill. Single or double?', kind: 'weapon', type: 'frost', power: 100, price: 55, passive: { id: 'chillTouch' }, tier: 1 },
  { id: 'w_proto_kite', name: "Glee's Prototype Kite", desc: "Storm 100; a rout brings the wielder's next turn sooner. The string is copper. Don't fly it in a storm. Fly it *at* one.", kind: 'weapon', type: 'storm', power: 100, price: 60, passive: { id: 'hasteOnKill' }, tier: 1 },
  { id: 'w_tuning_fork', name: 'Abbey Tuning Fork', desc: 'Spirit 100; hits heal the wielder a little. Hums grace before meals.', kind: 'weapon', type: 'spirit', power: 100, price: 65, passive: { id: 'lifesteal' }, tier: 1 },
  { id: 'w_hedge_shears', name: "The Duke's Hedge Shears", desc: 'Slash 95; more critical hits. Still has a little hedge-duke in the blades.', kind: 'weapon', type: 'slash', power: 95, price: 55, passive: { id: 'critPlus' }, tier: 1 },

  // ---- knick-knacks (trinkets)
  { id: 't_thimble', name: 'Lucky Thimble', desc: "More critical hits. From Thimble Mill, where it was the mill's only thimble.", kind: 'trinket', price: 50, passive: { id: 'critPlus' }, tier: 1 },
  { id: 't_ribbon', name: 'Kite-Post Ribbon', desc: '+2 Speed. Neither rain nor gale nor unusually large bird.', kind: 'trinket', price: 50, passive: { id: 'spdPlus', power: 2 }, tier: 1 },
  { id: 't_brooch', name: 'Honeycomb Brooch', desc: 'Regains a little HP each turn. Smells of Sunday.', kind: 'trinket', price: 60, passive: { id: 'hpRegen' }, tier: 1 },
  { id: 't_locket', name: 'Cast-Iron Locket', desc: 'Guard blocks more. Contains a small portrait of a frying pan.', kind: 'trinket', price: 50, passive: { id: 'ironGuard' }, tier: 1 },
  { id: 't_vane_pin', name: 'Weather-Vane Pin', desc: "Sometimes counter-attacks. Always points the way you're about to be hit from.", kind: 'trinket', price: 60, passive: { id: 'counter' }, tier: 1 },
  { id: 't_goat_bell', name: "Goat's Bell", desc: 'Starts every battle with Taunt. Ding. Look at me. Ding.', kind: 'trinket', price: 50, passive: { id: 'tauntAura' }, tier: 1 },
  { id: 't_earring', name: 'Clockwork Earring', desc: "Guard restores more Moxie. Ticks when you're brave.", kind: 'trinket', price: 55, passive: { id: 'guardMp' }, tier: 1 },
  { id: 't_apron_string', name: "Baker's Apron String", desc: 'Starts every battle with a small barrier. Tied in a double knot by a nervous man.', kind: 'trinket', price: 55, passive: { id: 'startBarrier' }, tier: 1 },
  { id: 't_horseshoe', name: 'Unlucky Horseshoe', desc: 'Attackers take a little back. Nailed up the wrong way. Everything fell out except the kick.', kind: 'trinket', price: 55, passive: { id: 'thorns' }, tier: 1 },
  { id: 't_agnes_notebook', name: "Agnes's Notebook", desc: 'Weakness hits chip one more. Case notes. Several of them are about you.', kind: 'trinket', price: 60, passive: { id: 'chipPlus' }, tier: 1 },

  // ---- consumables
  { id: 'c_potion', name: 'Buttered Scone', desc: 'Heals one ally 60 HP. Butter first, then jam. Fight about it later.', kind: 'consumable', price: 20, use: { target: 'ally', effects: [{ kind: 'heal', power: 60, scale: 'flat' }] }, tier: 1 },
  { id: 'c_strong_tea', name: 'Strong Tea', desc: "+20 Moxie, one ally. Builder's. Stand the spoon up in it.", kind: 'consumable', price: 25, use: { target: 'ally', effects: [{ kind: 'mp', amount: 20 }] }, tier: 1 },
  { id: 'c_fruitcake', name: "Nan's Fruitcake", desc: 'Revives one ally at 40% HP. It survived the journey. Of course it did.', kind: 'consumable', price: 60, use: { target: 'allyKo', effects: [{ kind: 'revive', fraction: 0.4 }] }, tier: 1 },
  { id: 'c_jar_of_bees', name: 'Jar of Bees', desc: 'Pierce at every foe; may Poison (3). Non-union. Clem disapproves and asks where you got it.', kind: 'consumable', price: 30, use: { target: 'enemies', hits: [{ type: 'pierce', power: 30, scale: 'none' }], effects: [{ kind: 'status', id: 'poison', turns: 3, chance: 0.6 }] }, tier: 1 },
  { id: 'c_snow_globe', name: 'Snow Globe', desc: "Frost at one foe, and Chill (2). Of Butterwick. It's snowing on the inn.", kind: 'consumable', price: 25, use: { target: 'enemy', hits: [{ type: 'frost', power: 50, scale: 'none' }], effects: [{ kind: 'status', id: 'chill', turns: 2 }] }, tier: 1 },
  { id: 'c_firecracker', name: 'Firecracker', desc: 'Fire at one foe, and Burn (2). Guild surplus. Procedure 31: celebrate.', kind: 'consumable', price: 25, use: { target: 'enemy', hits: [{ type: 'fire', power: 50, scale: 'none' }], effects: [{ kind: 'status', id: 'burn', turns: 2 }] }, tier: 1 },
  { id: 'c_thunder_bottle', name: 'Thunder in a Bottle', desc: 'Storm at every foe. Do not shake. Do not *not* shake.', kind: 'consumable', price: 30, use: { target: 'enemies', hits: [{ type: 'storm', power: 35, scale: 'none' }] }, tier: 1 },
  { id: 'c_gravy', name: 'Blessed Gravy', desc: 'Spirit at one foe, chips 2. The Abbey blesses everything. Especially the gravy.', kind: 'consumable', price: 25, use: { target: 'enemy', hits: [{ type: 'spirit', power: 45, scale: 'none', chip: 2 }] }, tier: 1 },
  // event-only
  { id: 'c_very_old_cake', name: 'Very Old Cake', desc: 'Fully heals one ally. It has been under glass since 1121. It has kept beautifully. Nobody knows how.', kind: 'consumable', price: 40, use: { target: 'ally', effects: [{ kind: 'heal', power: 999, scale: 'flat' }] }, tier: 3 },
  { id: 'c_field_turnip', name: 'Field Turnip', desc: 'Heals one ally 25 HP. Very well protected.', kind: 'consumable', price: 10, use: { target: 'ally', effects: [{ kind: 'heal', power: 25, scale: 'flat' }] }, tier: 3 },
  { id: 'c_peace_soup', name: 'Peace Soup', desc: 'Clears ailments and heals every ally 20 HP. Ingredient one: everybody.', kind: 'consumable', price: 30, use: { target: 'allies', effects: [{ kind: 'cleanse' }, { kind: 'heal', power: 20, scale: 'flat' }] }, tier: 3 },
]);

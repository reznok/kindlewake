import type { AbilityDef, DamageType, Effect, Hit, StatusId } from '../core/types';

/**
 * Ability table: every hero ability (starting four and spark grants) and every enemy intent ability.
 * Conventions: `power` 100 = a plain weapon swing; MP costs 0-12; multi-hit abilities list one Hit per tap.
 * Physical verbs scale `atk`; "mag" in the bible means `scale: 'mag'`. Barrier `power` is flat.
 * Enemy side: `target: 'enemy'` picks a hero (taunt-aware), `'enemies'` is the whole party, `'allies'` the enemy side.
 */
export const ABILITIES: Record<string, AbilityDef> = {};

export function defineAbilities(list: AbilityDef[]) { for (const a of list) ABILITIES[a.id] = a; }

// ---- small builders (data-only helpers)
const atk = (type: DamageType, power: number, extra: Partial<Hit> = {}): Hit => ({ type, power, scale: 'atk', ...extra });
const mag = (type: DamageType, power: number, extra: Partial<Hit> = {}): Hit => ({ type, power, scale: 'mag', ...extra });
const times = (n: number, h: Hit): Hit[] => Array.from({ length: n }, () => ({ ...h }));
const st = (id: StatusId, turns: number, chance?: number, who?: 'target' | 'self' | 'allies' | 'enemies', power?: number): Effect =>
  ({ kind: 'status', id, turns, ...(chance !== undefined ? { chance } : {}), ...(who ? { who } : {}), ...(power !== undefined ? { power } : {}) });
const barrier = (power: number, turns = 4, who?: 'target' | 'self'): Effect => st('barrier', turns, undefined, who, power);

defineAbilities([
  // ================================================================ heroes
  // ---- Barty Crumb (tank)
  { id: 'barty_knead', name: 'Knead', desc: 'Pound one foe and firm up. Blunt 100, Stone on self (2).', mp: 2, target: 'enemy', hits: [atk('blunt', 100)], effects: [st('defUp', 2, undefined, 'self')] },
  { id: 'barty_queue', name: 'Orderly Queue', desc: '"Form a queue, please. One at a time." Taunt on self (2).', mp: 3, target: 'self', effects: [st('taunt', 2, undefined, 'self')], delay: 0.7 },
  { id: 'barty_hot_cross', name: 'Hot Cross Bash', desc: 'A big floury swing, fresh from the oven. Fire 140; may Burn (3). Slow to recover.', mp: 5, target: 'enemy', hits: [atk('fire', 140)], effects: [st('burn', 3, 0.4)], delay: 1.3 },
  { id: 'barty_crust_over', name: 'Crust Over', desc: 'Bake a crust on yourself. Barrier and Stone on self (2).', mp: 5, target: 'self', effects: [barrier(20, 4, 'self'), st('defUp', 2, undefined, 'self')] },
  { id: 'barty_bakers_dozen', name: "Baker's Dozen", desc: 'Two kneads for the price of one. 2x blunt 65, Stone on self (2).', mp: 3, target: 'enemy', hits: times(2, atk('blunt', 65)), effects: [st('defUp', 2, undefined, 'self')] },
  { id: 'barty_score_loaf', name: 'Score the Loaf', desc: 'A neat slash across the top. Slash 100, Cracked (2).', mp: 4, target: 'enemy', hits: [atk('slash', 100)], effects: [st('defDown', 2)] },
  { id: 'barty_cold_proof', name: 'Cold Proof', desc: 'Gerald is let out on a foe. Frost 90, Chill (2).', mp: 4, target: 'enemy', hits: [atk('frost', 90)], effects: [st('chill', 2)] },

  // ---- Delphine "Dell" Quartermaine (striker)
  { id: 'dell_against_grain', name: 'Against the Grain', desc: 'Cut where it least wants cutting. Slash 110, chips 2.', mp: 4, target: 'enemy', hits: [atk('slash', 110, { chip: 2 })] },
  { id: 'dell_fork_over', name: 'Fork Over', desc: 'A precise prong. Pierce 100, +20% crit.', mp: 3, target: 'enemy', hits: [atk('pierce', 100, { crit: 20 })] },
  { id: 'dell_tenderise', name: 'Tenderise', desc: 'Softens the cut. Blunt 80, Cracked (2).', mp: 4, target: 'enemy', hits: [atk('blunt', 80)], effects: [st('defDown', 2)] },
  { id: 'dell_platter', name: 'Present the Platter', desc: 'Three slices, plated. 3x slash 50.', mp: 6, target: 'enemy', hits: times(3, atk('slash', 50)) },
  { id: 'dell_flambe', name: 'Flambé', desc: 'Brandy, a match, a flourish. Fire 110; may Burn (2).', mp: 5, target: 'enemy', hits: [atk('fire', 110)], effects: [st('burn', 2, 0.3)] },
  { id: 'dell_second_helping', name: 'Second Helping', desc: 'Four slices. Nobody asked. 4x slash 45.', mp: 7, target: 'enemy', hits: times(4, atk('slash', 45)) },

  // ---- Clem Honeysett (mender)
  { id: 'clem_poultice', name: 'Honey Poultice', desc: 'Heal one ally and clear their ailments.', mp: 5, target: 'ally', effects: [{ kind: 'heal', power: 140, scale: 'mag' }, { kind: 'cleanse' }] },
  { id: 'clem_sting', name: 'Sting Operation', desc: 'The girls go in. Pierce 80 (magic); may Poison (3).', mp: 4, target: 'enemy', hits: [mag('pierce', 80)], effects: [st('poison', 3, 0.6)] },
  { id: 'clem_hum', name: 'Hum of Grace', desc: 'A hive-hum that reminds a thing what it is. Spirit 100 (magic), Regen on self (2).', mp: 5, target: 'enemy', hits: [mag('spirit', 100)], effects: [st('regen', 2, undefined, 'self')] },
  { id: 'clem_royal_jelly', name: 'Royal Jelly', desc: 'Revive a fallen ally at 30% HP. Very dear.', mp: 12, target: 'allyKo', effects: [{ kind: 'revive', fraction: 0.3 }] },
  { id: 'clem_busy_bees', name: 'Busy Bees', desc: 'Heal one ally, clear their ailments, and leave a few bees on it. Regen (2).', mp: 6, target: 'ally', effects: [{ kind: 'heal', power: 140, scale: 'mag' }, { kind: 'cleanse' }, st('regen', 2)] },
  { id: 'clem_whole_hive', name: 'The Whole Hive', desc: 'A little honey for everyone. Heals all allies (small).', mp: 9, target: 'allies', effects: [{ kind: 'heal', power: 70, scale: 'mag' }] },
  { id: 'clem_picket_line', name: 'Picket Line', desc: 'Nobody crosses. 3x pierce 35 (magic); may Poison (3).', mp: 6, target: 'enemy', hits: times(3, mag('pierce', 35)), effects: [st('poison', 3, 0.6)] },
  { id: 'clem_antihistamine', name: 'Antihistamine', desc: '"Finally." Clears ailments from all allies.', mp: 4, target: 'allies', effects: [{ kind: 'cleanse' }] },
  { id: 'clem_comb_wall', name: 'Comb Wall', desc: 'Wax and honeycomb between one ally and harm. Barrier.', mp: 5, target: 'ally', effects: [barrier(22)] },

  // ---- Ashlar (warden)
  { id: 'ashlar_hold_line', name: 'Hold the Line', desc: 'A small barrier on every ally.', mp: 6, target: 'allies', effects: [barrier(12)] },
  { id: 'ashlar_plinth_slam', name: 'Plinth Slam', desc: 'He arrives presently, and all at once. Blunt 150, chips 2. Very slow.', mp: 5, target: 'enemy', hits: [atk('blunt', 150, { chip: 2 })], delay: 1.6 },
  { id: 'ashlar_stand_firm', name: 'Stand Firm', desc: 'A large barrier on one ally, and their ailments cleared.', mp: 6, target: 'ally', effects: [barrier(28), { kind: 'cleanse' }] },
  { id: 'ashlar_wrens', name: 'Nesting Wrens', desc: 'The wrens object on his behalf. 2x pierce 55.', mp: 3, target: 'enemy', hits: times(2, atk('pierce', 55)) },
  { id: 'ashlar_keystone', name: 'Keystone', desc: 'Hold the Line, but load-bearing. A larger barrier on every ally.', mp: 8, target: 'allies', effects: [barrier(20)] },
  { id: 'ashlar_gossip', name: 'Garden Gossip', desc: '"I was present for the Incident with the Turnip." Weak (2), Cracked (2), and chips 1, weakness or not.', mp: 4, target: 'enemy', effects: [st('defDown', 2), st('atkDown', 2), { kind: 'chip', amount: 1 }] },
  { id: 'ashlar_sanctuary', name: 'Sanctuary', desc: 'A barrier on every ally, and all their ailments cleared.', mp: 11, target: 'allies', effects: [barrier(18), { kind: 'cleanse' }] },

  // ---- Gertie Bellow (support)
  { id: 'gertie_hear_ye', name: 'HEAR YE', desc: 'A proclamation of strength. Might on one ally (3).', mp: 4, target: 'ally', effects: [st('atkUp', 3)] },
  { id: 'gertie_order', name: 'Order! Order!', desc: 'Blunt 90 and push the foe\'s turn back. A Cracked foe stays Cracked longer.', mp: 4, target: 'enemy', hits: [atk('blunt', 90)], effects: [{ kind: 'delay', amount: 0.5 }] },
  { id: 'gertie_public_notice', name: 'Public Notice', desc: 'Posted on one foe: Bleed (2). Break chips on it count double while posted.', mp: 3, target: 'enemy', effects: [st('bleed', 2)] },
  { id: 'gertie_ring_out', name: 'Ring Out', desc: 'The handbell, at volume. Spirit 50 (magic) to all foes.', mp: 6, target: 'enemies', hits: [mag('spirit', 50)] },
  { id: 'gertie_furthermore', name: 'AND FURTHERMORE', desc: 'HEAR YE, with an addendum. Might (3) and Stone (3) on one ally.', mp: 6, target: 'ally', effects: [st('atkUp', 3), st('defUp', 3)] },
  { id: 'gertie_decree', name: 'By Royal Decree', desc: 'Might on every ally (3).', mp: 9, target: 'allies', effects: [st('atkUp', 3)] },
  { id: 'gertie_town_meeting', name: 'Town Meeting', desc: 'Tea and biscuits. +5 Moxie to every Front ally.', mp: 3, target: 'allies', effects: [{ kind: 'mp', amount: 5 }] },
  { id: 'gertie_curfew', name: 'Curfew', desc: '"EVERYONE TO BED!" Weak (2) on all foes.', mp: 6, target: 'enemies', effects: [st('atkDown', 2)] },
  { id: 'gertie_lungs_of_brass', name: 'Lungs of Brass', desc: 'Ring Out, louder. Spirit 65 (magic) to all foes; may Weaken (1).', mp: 7, target: 'enemies', hits: [mag('spirit', 65)], effects: [st('atkDown', 1, 0.3)] },

  // ---- Kit Brassfinch (wildcard)
  { id: 'kit_thingomatic', name: 'Thing-o-Matic', desc: "It's meant to make tea. Three hits: frost, storm, spirit (40, magic).", mp: 5, target: 'enemy', hits: [mag('frost', 40), mag('storm', 40), mag('spirit', 40)] },
  { id: 'kit_percussive', name: 'Percussive Maintenance', desc: 'Hit it until it works. Blunt 120.', mp: 3, target: 'enemy', hits: [atk('blunt', 120)] },
  { id: 'kit_spare_parts', name: 'Spare Parts', desc: 'Bolt something useful onto one ally. Each may stick: Might, Stone, Regen (2), a Barrier.', mp: 4, target: 'ally', effects: [st('atkUp', 2, 0.5), st('defUp', 2, 0.5), st('regen', 2, 0.5), st('barrier', 4, 0.5, undefined, 16)] },
  { id: 'kit_flare', name: "Uncle Odo's Patented Flare", desc: '"It\'s mostly paint." Fire 90 (magic); may Burn (2).', mp: 4, target: 'enemy', hits: [mag('fire', 90)], effects: [st('burn', 2, 0.3)] },
  { id: 'kit_calibrated', name: 'Thing-o-Matic (Calibrated)', desc: 'Now with a dial. Three hits: frost, storm, spirit (55, magic).', mp: 6, target: 'enemy', hits: [mag('frost', 55), mag('storm', 55), mag('spirit', 55)] },
  { id: 'kit_overclocked', name: 'Thing-o-Matic (Overclocked)', desc: 'Five hits: frost, storm, spirit, fire, pierce (50, magic).', mp: 9, target: 'enemy', hits: [mag('frost', 50), mag('storm', 50), mag('spirit', 50), mag('fire', 50), mag('pierce', 50)] },
  { id: 'kit_duct_tape', name: 'Duct Tape', desc: 'Small heal and ailments cleared on one ally.', mp: 4, target: 'ally', effects: [{ kind: 'heal', power: 80, scale: 'mag' }, { kind: 'cleanse' }] },
  { id: 'kit_big_red_button', name: 'Big Red Button', desc: 'Do not press. Fire, frost, storm, spirit (35, magic) at every foe. Kit is busy afterwards.', mp: 10, target: 'enemies', hits: [mag('fire', 35), mag('frost', 35), mag('storm', 35), mag('spirit', 35)], delay: 2.0 },
  { id: 'kit_apprentice', name: 'Apprentice No More', desc: 'A flare that is not mostly paint. Fire 130 (magic), chips 2; may Burn (3).', mp: 7, target: 'enemy', hits: [mag('fire', 130, { chip: 2 })], effects: [st('burn', 3, 0.5)] },

  // ---- Pell (trickster)
  { id: 'pell_box', name: 'Invisible Box', desc: 'Puts one foe in a box. Pushes its turn back.', mp: 3, target: 'enemy', effects: [{ kind: 'delay', amount: 0.6 }] },
  { id: 'pell_tug', name: 'Tug of War', desc: "Hauls one ally's next turn sooner.", mp: 3, target: 'ally', effects: [{ kind: 'delay', amount: -0.6 }] },
  { id: 'pell_pinprick', name: 'Pinprick', desc: 'Pierce 80; likely Bleed (2).', mp: 3, target: 'enemy', hits: [atk('pierce', 80)], effects: [st('bleed', 2, 0.7)] },
  { id: 'pell_wind', name: 'Walking Against the Wind', desc: 'The wind is real now. Storm 90 (magic), Weak (2).', mp: 5, target: 'enemy', hits: [mag('storm', 90)], effects: [st('atkDown', 2)] },
  { id: 'pell_encore', name: 'Encore', desc: 'Invisible Box, and a bow. Pushes one foe back; Pell acts sooner.', mp: 4, target: 'enemy', effects: [{ kind: 'delay', amount: 0.6 }, { kind: 'hasteSelf', amount: -0.3 }] },
  { id: 'pell_heckle', name: 'Heckle', desc: 'Silent, devastating. Weak (2) and Cracked (2) on one foe.', mp: 4, target: 'enemy', effects: [st('atkDown', 2), st('defDown', 2)] },
  { id: 'pell_bow', name: 'The Bow', desc: 'Everyone waits for the applause. Pushes every foe back a little.', mp: 7, target: 'enemies', effects: [{ kind: 'delay', amount: 0.35 }] },

  // ---- Roz Gale (caster)
  { id: 'roz_heatwave', name: 'Heatwave', desc: '"Moving in from the east, highs of very." Fire 110 (magic); may Burn (3).', mp: 5, target: 'enemy', hits: [mag('fire', 110)], effects: [st('burn', 3, 0.4)] },
  { id: 'roz_cold_snap', name: 'Cold Snap', desc: 'Frost 110 (magic); may Chill (2).', mp: 5, target: 'enemy', hits: [mag('frost', 110)], effects: [st('chill', 2, 0.5)] },
  { id: 'roz_thunder', name: 'Thunder Warning', desc: 'Storm 120 (magic); may Slow (2).', mp: 6, target: 'enemy', hits: [mag('storm', 120)], effects: [st('slow', 2, 0.3)] },
  { id: 'roz_forecast', name: 'Long-Range Forecast', desc: 'Cracked (3) on one foe, and Roz gets to her next spell sooner.', mp: 3, target: 'enemy', effects: [st('defDown', 3), { kind: 'hasteSelf', amount: -0.4 }] },
  { id: 'roz_front', name: 'Front Moving In', desc: 'Storm 60 (magic) to all foes.', mp: 8, target: 'enemies', hits: [mag('storm', 60)] },
  { id: 'roz_hailstorm', name: 'Hailstorm', desc: '3x frost 45 (magic).', mp: 7, target: 'enemy', hits: times(3, mag('frost', 45)) },
  { id: 'roz_record_high', name: 'Record High', desc: 'Heatwave, upgraded to a warning. Fire 130 (magic); likely Burn (3).', mp: 7, target: 'enemy', hits: [mag('fire', 130)], effects: [st('burn', 3, 0.7)] },
  { id: 'roz_sunny_spells', name: 'Sunny Spells', desc: 'Small heal on every ally.', mp: 9, target: 'allies', effects: [{ kind: 'heal', power: 60, scale: 'mag' }] },

  // ================================================================ enemies (act 1)
  // generic
  { id: 'e_wait', name: 'Wait', desc: 'Does nothing this turn.', mp: 0, target: 'self' },
  { id: 'e_charge', name: 'Wind up', desc: 'Winds up a big one.', mp: 0, target: 'self', effects: [st('atkUp', 2, undefined, 'self')] },
  { id: 'e_buff_def', name: 'Firm up', desc: 'Stone on self (2).', mp: 0, target: 'self', effects: [st('defUp', 2, undefined, 'self')] },
  { id: 'e_buff_atk', name: 'Psych up', desc: 'Might on self (2).', mp: 0, target: 'self', effects: [st('atkUp', 2, undefined, 'self')] },
  { id: 'e_weaken', name: 'Weaken', desc: 'Weak on one hero (2).', mp: 0, target: 'enemy', effects: [st('atkDown', 2)] },
  { id: 'e_weaken_all', name: 'Weaken all', desc: 'Weak on every hero (2).', mp: 0, target: 'enemies', effects: [st('atkDown', 2)] },
  { id: 'e_expose', name: 'Expose', desc: 'Cracked on one hero (2).', mp: 0, target: 'enemy', effects: [st('defDown', 2)] },
  { id: 'e_chill_one', name: 'Chill', desc: 'Chill on one hero (2).', mp: 0, target: 'enemy', effects: [st('chill', 2)] },
  { id: 'e_chill_all', name: 'Chill all', desc: 'Chill on every hero (2).', mp: 0, target: 'enemies', effects: [st('chill', 2)] },
  { id: 'e_bite', name: 'Bite', desc: 'A bite.', mp: 0, target: 'enemy', hits: [atk('pierce', 100)] },
  { id: 'e_bash', name: 'Bash', desc: 'A blunt blow.', mp: 0, target: 'enemy', hits: [atk('blunt', 100)] },
  { id: 'e_swipe', name: 'Swipe', desc: 'A slash.', mp: 0, target: 'enemy', hits: [atk('slash', 100)] },
  { id: 'e_heavy_blunt', name: 'Heavy blow', desc: 'A huge blunt blow.', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], delay: 1.2 },

  // Jamble
  { id: 'e_preserve', name: 'Preserve', desc: 'Tops up every foe a little.', mp: 0, target: 'allies', effects: [{ kind: 'heal', power: 55, scale: 'mag' }] },
  // Scab Bee
  { id: 'e_working_lunch', name: 'Working Lunch', desc: 'Heals itself.', mp: 0, target: 'self', effects: [{ kind: 'heal', power: 80, scale: 'mag' }] },
  { id: 'e_overtime', name: 'Overtime', desc: 'Three stings; may Poison (3).', mp: 0, target: 'enemy', hits: times(3, atk('pierce', 40)), effects: [st('poison', 3, 0.5)] },
  // Cawdle
  { id: 'e_shiny', name: 'Shiny!', desc: "You look for your button. One hero's turn is pushed back.", mp: 0, target: 'enemy', effects: [{ kind: 'delay', amount: 0.4 }] },
  // Puffcap
  { id: 'e_spore_burst', name: 'Spore Burst', desc: 'Spores at everyone; may Poison (3).', mp: 0, target: 'enemies', hits: [mag('spirit', 45)], effects: [st('poison', 3, 0.4)] },
  // Murkwing
  { id: 'e_flutter', name: 'Flutter', desc: 'Haste on self (2).', mp: 0, target: 'self', effects: [st('haste', 2, undefined, 'self')] },
  { id: 'e_eat_light', name: 'Eat the Light', desc: '-4 Moxie on one hero.', mp: 0, target: 'enemy', effects: [{ kind: 'mp', amount: -4 }] },
  // Runaway Kite
  { id: 'e_special_delivery', name: 'Special Delivery', desc: 'A parcel, at speed. Blunt 160.', mp: 0, target: 'enemy', hits: [atk('blunt', 160)], delay: 1.2 },
  // Sheetling
  { id: 'e_smother', name: 'Smother', desc: 'Wraps one hero up. Spirit 160 (magic).', mp: 0, target: 'enemy', hits: [mag('spirit', 160)], delay: 1.2 },
  { id: 'e_flap', name: 'Flap', desc: 'A flap.', mp: 0, target: 'enemy', hits: [atk('slash', 90)] },
  // Trundlesnail
  { id: 'e_shell_slam', name: 'Shell Slam', desc: 'It comes out swinging. Blunt 170.', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], delay: 1.2 },
  // Haywarden
  { id: 'e_flail', name: 'Flail', desc: 'Three straw swipes.', mp: 0, target: 'enemy', hits: times(3, atk('slash', 40)) },
  { id: 'e_call_crows', name: 'Call the Crows', desc: 'Calls a Cawdle.', mp: 0, target: 'self', effects: [{ kind: 'summon', enemy: 'a1_cawdle', max: 2 }] },
  // Toll Goat
  { id: 'e_gore', name: 'Gore', desc: 'Horns first. Pierce 170.', mp: 0, target: 'enemy', hits: [atk('pierce', 170)], delay: 1.2 },
  // Leafhound
  { id: 'e_bury_you', name: 'Bury You', desc: 'Neatly. Blunt 170.', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], delay: 1.2 },
  // Grumbadger
  { id: 'e_badgering', name: 'Badgering', desc: 'Three hits of nagging.', mp: 0, target: 'enemy', hits: times(3, atk('blunt', 40)) },
  // Snuffer
  { id: 'e_shush', name: 'Shush', desc: 'Shock on one hero (2): no Guard, tighter timing.', mp: 0, target: 'enemy', effects: [st('shock', 2)] },
  { id: 'e_not_again', name: 'Not Again', desc: 'Blunt 170.', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], delay: 1.2 },
  // Tin Turnipcutter
  { id: 'e_harvest', name: 'Harvest', desc: 'Three chops. Slash 60 each.', mp: 0, target: 'enemy', hits: times(3, atk('slash', 60)), delay: 1.2 },
  // Lurking Luncheon
  { id: 'e_offer_sandwich', name: 'Offer Sandwich', desc: 'The sandwiches are real. Heals your party a little.', mp: 0, target: 'enemies', effects: [{ kind: 'heal', power: 40, scale: 'mag' }] },
  { id: 'e_snap_shut', name: 'Snap Shut', desc: 'The lid. Pierce 160.', mp: 0, target: 'enemy', hits: [atk('pierce', 160)], delay: 1.2 },
  { id: 'e_chew', name: 'Chew', desc: 'Pierce 80; may Bleed (2).', mp: 0, target: 'enemy', hits: [atk('pierce', 80)], effects: [st('bleed', 2, 0.6)] },
  // Waistcoat Wasp
  { id: 'e_wasp_sting', name: 'Sting', desc: 'Pierce 90; may Poison (3).', mp: 0, target: 'enemy', hits: [atk('pierce', 90)], effects: [st('poison', 3, 0.5)] },
  { id: 'e_invite_itself', name: 'Invite Itself', desc: 'Another wasp arrives.', mp: 0, target: 'self', effects: [{ kind: 'summon', enemy: 'a1_waistcoat_wasp', max: 2 }] },

  // ---- Baron Bleatham (elite)
  { id: 'e_toll_ten', name: 'Toll: Ten Buttons', desc: 'Blunt 100.', mp: 0, target: 'enemy', hits: [atk('blunt', 100)] },
  { id: 'e_toll_fifty', name: 'Toll: Fifty Buttons', desc: 'Two hits. Blunt 60 each.', mp: 0, target: 'enemy', hits: times(2, atk('blunt', 60)) },
  { id: 'e_call_counsel', name: 'Call Counsel', desc: 'Calls a Toll Goat (if none stands).', mp: 0, target: 'self', effects: [{ kind: 'summon', enemy: 'a1_toll_goat', max: 1 }] },
  { id: 'e_pay_up', name: 'PAY UP', desc: 'The top rung. Blunt 110 to every hero.', mp: 0, target: 'enemies', hits: [atk('blunt', 110)], delay: 1.2 },
  // ---- Conserve Colossus (elite)
  { id: 'e_spread_thin', name: 'Spread Thin', desc: 'Sheds a Jamble.', mp: 0, target: 'self', effects: [{ kind: 'summon', enemy: 'a1_jamble', max: 3 }] },
  { id: 'e_wave_of_jam', name: 'Wave of Jam', desc: 'Frost 50 to every hero; may Chill (2).', mp: 0, target: 'enemies', hits: [atk('frost', 50)], effects: [st('chill', 2, 0.4)] },
  { id: 'e_seal_jar', name: 'Seal the Jar', desc: 'Blunt 170 and Chill (2).', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], effects: [st('chill', 2)], delay: 1.2 },
  // ---- Sister Nocturne (elite)
  { id: 'e_hush', name: 'Hush', desc: 'Shock on every hero (2): you cannot Guard the next blow.', mp: 0, target: 'enemies', effects: [st('shock', 2)] },
  { id: 'e_twin_snuff', name: 'Twin Snuff', desc: 'Two bell-snuffers. Blunt 60 each.', mp: 0, target: 'enemy', hits: times(2, atk('blunt', 60)) },
  { id: 'e_not_this_time', name: 'Not This Time', desc: 'Blunt 170.', mp: 0, target: 'enemy', hits: [atk('blunt', 170)], delay: 1.2 },

  // ---- the act-1 boss (three shapes)
  { id: 'e_wingbeat', name: 'Wingbeat', desc: 'Storm 50 to every hero.', mp: 0, target: 'enemies', hits: [atk('storm', 50)] },
  { id: 'e_smoke_bomb', name: 'Smoke Bomb', desc: '"BEGONE! I mean, HELP!" Weak (2) on every hero.', mp: 0, target: 'enemies', effects: [st('atkDown', 2)] },
  { id: 'e_call_murk', name: 'Call the Murk', desc: 'Calls a Murkwing.', mp: 0, target: 'self', effects: [{ kind: 'summon', enemy: 'a1_murkwing', max: 2 }] },
  { id: 'e_throw_sandwich', name: 'Throw Sandwich', desc: 'The rider panics and throws his lunch. It heals one of you.', mp: 0, target: 'enemy', effects: [{ kind: 'heal', power: 60, scale: 'mag' }] },
  { id: 'e_moonless_swoop', name: 'Moonless Swoop', desc: 'Pierce 170.', mp: 0, target: 'enemy', hits: [atk('pierce', 170)], delay: 1.2 },
  { id: 'e_lamplighters_due', name: "Lamplighter's Due", desc: 'Blunt 160.', mp: 0, target: 'enemy', hits: [atk('blunt', 160)], delay: 1.2 },
  { id: 'e_grey_dust', name: 'Grey Dust', desc: 'Cracked (2) on every hero.', mp: 0, target: 'enemies', effects: [st('defDown', 2)] },
  { id: 'e_wingstorm', name: 'Wingstorm', desc: 'Three wing-blows. Slash 45 each.', mp: 0, target: 'enemy', hits: times(3, atk('slash', 45)) },
  { id: 'e_odo_protect', name: 'Odo: Protect the Public', desc: '"I\'m not brave. I\'ve just read the procedure." A barrier on every hero.', mp: 0, target: 'enemies', effects: [barrier(18)] },
  { id: 'e_eat_light_all', name: 'Eat the Light', desc: '-4 Moxie on every hero.', mp: 0, target: 'enemies', effects: [{ kind: 'mp', amount: -4 }] },
  { id: 'e_totality', name: 'Totality', desc: 'Spirit 130 to every hero.', mp: 0, target: 'enemies', hits: [atk('spirit', 130)], delay: 1.3 },
]);

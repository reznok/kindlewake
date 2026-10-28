import type { CharacterDef, Passive, SparkDef } from '../core/types';

/**
 * The roster: eight characters, one per role. Three start; the other five are met on the act-1 map (recruit nodes,
 * and Gertie also through Goat Customs) and become start options through Ledger `starter` unlocks (see unlocks.ts).
 * Recruits deliberately carry no `unlock` gate: they must be meetable on a fresh Ledger.
 * Gertie's lines are capitals except her KO line; Pell's lines are stage directions (rendered in italics).
 */
export const CHARACTERS: Record<string, CharacterDef> = {};

export function defineCharacters(list: CharacterDef[]) { for (const c of list) CHARACTERS[c.id] = c; }

const ability = (id: string, name: string, desc: string, ab: string): SparkDef => ({ id, name, desc, effect: { kind: 'ability', id: ab } });
const replace = (id: string, name: string, desc: string, from: string, to: string, requires?: string): SparkDef =>
  ({ id, name, desc, effect: { kind: 'replace', from, to }, ...(requires ? { requires } : {}) });
const passive = (id: string, name: string, desc: string, p: Passive): SparkDef =>
  ({ id, name, desc, effect: { kind: 'passive', passive: p } });

defineCharacters([
  {
    id: 'barty', name: 'Barty Crumb', role: 'tank', title: 'Baker of Butterwick', starter: true,
    desc: 'Enormous, soft-spoken, flour-dusted. Apologises to everything he hits. Carries Gerald, an 81-year-old sourdough starter, in a jar on his belt.',
    base: { hp: 72, mp: 12, atk: 12, mag: 4, def: 12, res: 8, spd: 7, luck: 4 }, growth: { hp: 7, mp: 1, atk: 1.5, def: 1.5, res: 1 },
    abilities: ['barty_knead', 'barty_queue', 'barty_hot_cross', 'barty_crust_over'], weapon: 'w_rolling_pin', sprite: 'hero_barty', portrait: 'por_barty',
    sparks: [
      passive('sp_barty_second_rise', 'Second Rise', 'Once per battle, a fatal blow leaves him standing at 30%.', { id: 'cheatDeath' }),
      passive('sp_barty_proving', 'Proving Drawer', 'Rises while resting: regains a little HP each turn.', { id: 'hpRegen' }),
      replace('sp_barty_dozen', "Baker's Dozen", 'Knead becomes two blunt 65 hits, still firming him up.', 'barty_knead', 'barty_bakers_dozen'),
      passive('sp_barty_lid_bash', 'Lid Bash', 'Sometimes answers a blow with the skillet lid.', { id: 'counter' }),
      ability('sp_barty_score', 'Score the Loaf', 'Learn Score the Loaf: slash 100, Cracked (2).', 'barty_score_loaf'),
      ability('sp_barty_cold_proof', 'Cold Proof', 'Learn Cold Proof: frost 90, Chill (2). Gerald is let out on a foe.', 'barty_cold_proof'),
    ],
    lines: { recruit: "Oh! A party. I'll bring rolls. I always bring rolls.", perfect: 'Ooh, sorry! That was a good one, though.', ko: 'Tell Gerald... feed him... at four...', levelUp: "I've risen! Sorry. Baking joke." },
  },
  {
    id: 'dell', name: 'Delphine "Dell" Quartermaine', role: 'striker', title: 'Carver Royal (dismissed)', starter: true,
    desc: 'Precise, dry, formal. Scores every hit out of ten, including her own. Unflappable about monsters, appalled by sloppy knife-work.',
    base: { hp: 50, mp: 14, atk: 15, mag: 5, def: 7, res: 6, spd: 11, luck: 8 }, growth: { hp: 4.5, mp: 1, atk: 2, spd: 0.5, luck: 0.5 },
    abilities: ['dell_against_grain', 'dell_fork_over', 'dell_tenderise', 'dell_platter'], weapon: 'w_carving_knife', sprite: 'hero_dell', portrait: 'por_dell',
    sparks: [
      passive('sp_dell_mise', 'Mise en Place', 'Everything in its place: she acts first in every battle.', { id: 'firstStrike' }),
      passive('sp_dell_eye', "Carver's Eye", 'More critical hits.', { id: 'critPlus' }),
      passive('sp_dell_clean_plate', 'Clean Plate', '"Next." Her next turn comes sooner after she routs a foe.', { id: 'hasteOnKill' }),
      passive('sp_dell_ten', 'Ten Out of Ten', 'Weakness hits chip one more.', { id: 'chipPlus' }),
      ability('sp_dell_flambe', 'Flambé', 'Learn Flambé: fire 110; may Burn (2).', 'dell_flambe'),
      replace('sp_dell_second_helping', 'Second Helping', 'Present the Platter becomes four slash 45 hits.', 'dell_platter', 'dell_second_helping'),
    ],
    lines: { recruit: "You need a carver. I need an employer who doesn't count the spoons.", perfect: 'Ten. Note the wrist.', ko: 'A six... at best...', levelUp: "An eight. I'm improving." },
  },
  {
    id: 'clem', name: 'Clem Honeysett', role: 'mender', title: 'Keeper of the Honeysett Hives', starter: true,
    desc: "Sunny, earnest, a little frazzled. Shop steward of the Butterwick Apiarists' Union, Local 7 (her bees). Allergic to bees. Carries on.",
    base: { hp: 48, mp: 24, atk: 6, mag: 13, def: 7, res: 11, spd: 9, luck: 6 }, growth: { hp: 4, mp: 2.5, mag: 1.8, res: 1 },
    abilities: ['clem_poultice', 'clem_sting', 'clem_hum', 'clem_royal_jelly'], weapon: 'w_honey_dipper', sprite: 'hero_clem', portrait: 'por_clem',
    sparks: [
      replace('sp_clem_busy_bees', 'Busy Bees', 'Honey Poultice also leaves Regen (2).', 'clem_poultice', 'clem_busy_bees'),
      ability('sp_clem_whole_hive', 'The Whole Hive', 'Learn The Whole Hive: a small heal on every ally.', 'clem_whole_hive'),
      replace('sp_clem_picket', 'Picket Line', 'Sting Operation becomes three pierce 35 (magic) hits that may Poison.', 'clem_sting', 'clem_picket_line'),
      ability('sp_clem_antihistamine', 'Antihistamine', 'Learn Antihistamine: clears ailments from every ally. "Finally."', 'clem_antihistamine'),
      ability('sp_clem_comb_wall', 'Comb Wall', 'Learn Comb Wall: a barrier on one ally.', 'clem_comb_wall'),
      passive('sp_clem_overtime', 'Overtime', 'The union approves overtime: once per battle, a fatal blow leaves her at 30%.', { id: 'cheatDeath' }),
    ],
    lines: { recruit: "The hive's voted. Eleven thousand to two. We're coming.", perfect: 'Lovely work, girls!', ko: 'Tell the union... I never crossed... a line...', levelUp: "The girls say I've grown. They're very supportive." },
  },
  {
    id: 'ashlar', name: 'Ashlar', role: 'warden', title: 'Knight of the Stair (self-appointed)',
    desc: 'A sandstone knight who walked off his plinth when the sun hiccupped. Courtly, grave, glacial. Wrens nest in his helmet; he will not evict them.',
    base: { hp: 62, mp: 18, atk: 11, mag: 9, def: 11, res: 10, spd: 6, luck: 5 }, growth: { hp: 6, mp: 1.5, atk: 1.2, def: 1.3, res: 1.2 },
    abilities: ['ashlar_hold_line', 'ashlar_plinth_slam', 'ashlar_stand_firm', 'ashlar_wrens'], weapon: 'w_stone_sword', sprite: 'hero_ashlar', portrait: 'por_ashlar',
    sparks: [
      passive('sp_ashlar_weathered', 'Weathered', 'Guard blocks more.', { id: 'ironGuard' }),
      passive('sp_ashlar_mossy', 'Mossy', 'Regains a little HP each turn.', { id: 'hpRegen' }),
      replace('sp_ashlar_keystone', 'Keystone', 'Hold the Line becomes a larger barrier on every ally.', 'ashlar_hold_line', 'ashlar_keystone'),
      ability('sp_ashlar_gossip', 'Garden Gossip', 'Learn Garden Gossip: Weak and Cracked on a foe, and chip 1 whether it is weak or not.', 'ashlar_gossip'),
      ability('sp_ashlar_sanctuary', 'Sanctuary', 'Learn Sanctuary: a barrier on every ally and their ailments cleared.', 'ashlar_sanctuary'),
      passive('sp_ashlar_stair', 'Hold the Stair', 'Starts every battle drawing the foes\' attention (Taunt).', { id: 'tauntAura' }),
    ],
    lines: { recruit: 'I have stood still for a hundred years. I believe I am ready for a walk.', perfect: 'Most satisfactory!', ko: 'I shall... sit down... for a century or so...', levelUp: 'I have moved. Considerably. For me.' },
  },
  {
    id: 'gertie', name: 'Gertie Bellow', role: 'support', title: 'Town Crier of Butterwick',
    desc: 'LOUD. Cheerful, nosy, unstoppable; adores procedure. Forty-one years a crier. Keeps an ear trumpet in her belt and pretends it is a bugle.',
    base: { hp: 48, mp: 22, atk: 8, mag: 11, def: 7, res: 9, spd: 10, luck: 7 }, growth: { hp: 4.2, mp: 2, atk: 0.8, mag: 1.4, spd: 0.5 },
    abilities: ['gertie_hear_ye', 'gertie_order', 'gertie_public_notice', 'gertie_ring_out'], weapon: 'w_handbell', sprite: 'hero_gertie', portrait: 'por_gertie',
    sparks: [
      replace('sp_gertie_furthermore', 'AND FURTHERMORE', 'HEAR YE also grants Stone (3).', 'gertie_hear_ye', 'gertie_furthermore'),
      ability('sp_gertie_decree', 'By Royal Decree', 'Learn By Royal Decree: Might on every ally.', 'gertie_decree'),
      ability('sp_gertie_town_meeting', 'Town Meeting', 'Learn Town Meeting: +5 Moxie to every Front ally. Tea and biscuits.', 'gertie_town_meeting'),
      ability('sp_gertie_curfew', 'Curfew', 'Learn Curfew: Weak on every foe. "EVERYONE TO BED!"', 'gertie_curfew'),
      replace('sp_gertie_lungs', 'Lungs of Brass', 'Ring Out becomes spirit 65 (magic) on all foes and may Weaken.', 'gertie_ring_out', 'gertie_lungs_of_brass'),
      passive('sp_gertie_second_wind', 'Second Wind', 'Regains a little Moxie each turn.', { id: 'mpRegen' }),
    ],
    lines: { recruit: 'HEAR YE! I AM JOINING! THAT IS ALL!', perfect: 'LET IT BE KNOWN! THAT WAS SUPERB!', ko: '...hear... ye...', levelUp: 'LET IT BE KNOWN THAT I HAVE IMPROVED!' },
  },
  {
    id: 'kit', name: 'Kit Brassfinch', role: 'wildcard', title: 'Apprentice Tinker of Thimble Mill',
    desc: 'Fifteen, fast-talking, oil-smudged, overconfident. Builds things that almost work. Carries the Thing-o-Matic, a clanking backpack contraption.',
    base: { hp: 52, mp: 18, atk: 11, mag: 12, def: 7, res: 7, spd: 10, luck: 12 }, growth: { hp: 4.5, mp: 1.6, atk: 1.2, mag: 1.4, luck: 0.8 },
    abilities: ['kit_thingomatic', 'kit_percussive', 'kit_spare_parts', 'kit_flare'], weapon: 'w_big_wrench', sprite: 'hero_kit', portrait: 'por_kit',
    sparks: [
      replace('sp_kit_calibrated', 'Calibrated', 'The Thing-o-Matic gets a dial: three hits at 55.', 'kit_thingomatic', 'kit_calibrated'),
      replace('sp_kit_overclocked', 'Overclocked', 'Five hits, adding fire and pierce. Needs Calibrated.', 'kit_calibrated', 'kit_overclocked', 'sp_kit_calibrated'),
      { id: 'sp_kit_washer', name: 'Lucky Washer', desc: '+6 Luck.', effect: { kind: 'stat', stat: 'luck', amount: 6 } },
      ability('sp_kit_duct_tape', 'Duct Tape', 'Learn Duct Tape: a small heal and ailments cleared on one ally.', 'kit_duct_tape'),
      ability('sp_kit_big_red_button', 'Big Red Button', 'Learn Big Red Button: four verbs at every foe. Kit is busy afterwards.', 'kit_big_red_button'),
      replace('sp_kit_apprentice', 'Apprentice No More', "Uncle Odo's Patented Flare becomes fire 130 (magic), chip 2, likely Burn.", 'kit_flare', 'kit_apprentice'),
    ],
    lines: { recruit: 'I can fix that! Whatever it is! Probably!', perfect: 'IT WORKED? It worked! Somebody write that down!', ko: 'Note to self... more... rivets...', levelUp: 'Upgrade! Somebody write that down!' },
  },
  {
    id: 'pell', name: 'Pell', role: 'trickster', title: 'Mime of the Fairground of Lesser Wonders',
    desc: 'Never speaks. Expressive, mischievous, weirdly competent. Enemies are more offended by her than hurt.',
    base: { hp: 46, mp: 16, atk: 12, mag: 9, def: 6, res: 7, spd: 13, luck: 10 }, growth: { hp: 4, mp: 1.3, atk: 1.4, mag: 0.8, spd: 0.8, luck: 0.6 },
    abilities: ['pell_box', 'pell_tug', 'pell_pinprick', 'pell_wind'], weapon: 'w_hatpin', sprite: 'hero_pell', portrait: 'por_pell',
    sparks: [
      replace('sp_pell_encore', 'Encore', 'Invisible Box also brings her own next turn sooner.', 'pell_box', 'pell_encore'),
      ability('sp_pell_heckle', 'Heckle', 'Learn Heckle: Weak and Cracked on one foe.', 'pell_heckle'),
      passive('sp_pell_stage_fright', 'Stage Fright', 'More critical hits.', { id: 'critPlus' }),
      passive('sp_pell_pratfall', 'Pratfall', 'Sometimes answers a blow with a well-timed fall onto the attacker.', { id: 'counter' }),
      ability('sp_pell_bow', 'The Bow', 'Learn The Bow: pushes every foe back a little.', 'pell_bow'),
      passive('sp_pell_applause', 'Applause', 'Every Break gives the Front 4 Moxie.', { id: 'mpOnBreak' }),
    ],
    lines: {
      recruit: "*Pell points at you, at herself, mimes a very long road, and shrugs enormously. She's in.*",
      perfect: '*Pell bows to an audience nobody else can see.*',
      ko: '*Pell mimes a curtain coming down. It comes down slowly.*',
      levelUp: '*Pell takes a bow. Then another. Then a third, for luck.*',
    },
  },
  {
    id: 'roz', name: 'Roz Gale', role: 'caster', title: 'Senior Weather Reader of the Royal Almanac',
    desc: 'Brisk, splendidly self-important, speaks in forecast cadence. Forecasts her own spells, and her misses.',
    base: { hp: 42, mp: 26, atk: 5, mag: 16, def: 5, res: 10, spd: 9, luck: 6 }, growth: { hp: 3.5, mp: 2.5, mag: 2.2, res: 0.8 },
    abilities: ['roz_heatwave', 'roz_cold_snap', 'roz_thunder', 'roz_forecast'], weapon: 'w_barometer', sprite: 'hero_roz', portrait: 'por_roz',
    sparks: [
      ability('sp_roz_front', 'Front Moving In', 'Learn Front Moving In: storm 60 (magic) on all foes.', 'roz_front'),
      ability('sp_roz_hail', 'Hailstorm', 'Learn Hailstorm: three frost 45 (magic) hits.', 'roz_hailstorm'),
      replace('sp_roz_record_high', 'Record High', 'Heatwave becomes fire 130 (magic), likely Burn.', 'roz_heatwave', 'roz_record_high'),
      passive('sp_roz_accurate', 'Accurate to Within', 'Regains a little Moxie each turn.', { id: 'mpRegen' }),
      ability('sp_roz_sunny', 'Sunny Spells', 'Learn Sunny Spells: a small heal on every ally.', 'roz_sunny_spells'),
      passive('sp_roz_pressure', 'Pressure System', 'Her hits may Chill.', { id: 'chillTouch' }),
    ],
    lines: { recruit: "Forecast: you'll need me. Confidence: total.", perfect: 'As predicted!', ko: 'Outlook... overcast...', levelUp: 'Forecast revised: upward.' },
  },
]);

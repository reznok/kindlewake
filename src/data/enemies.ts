import type { EnemyDef, IntentDef } from '../core/types';

/**
 * Act-1 bestiary (the Marigold Downs): sixteen foes, three Bigwigs (elites) and the three-shape boss.
 * Tier-1 numbers; the engine scales HP and attack by level. Foes are "routed", never killed.
 * Teaching: every heavy follows a charge, wait or lure in its loop. Elite and boss loops start at index 0.
 */
export const ENEMIES: Record<string, EnemyDef> = {};

export function defineEnemies(list: EnemyDef[]) { for (const e of list) ENEMIES[e.id] = e; }

const I = (id: string, kind: IntentDef['kind'], name: string, ability: string): IntentDef => ({ id, kind, name, ability });

// stat templates
const S = (hp: number, atk: number, spd: number, x: Partial<EnemyDef['stats']> = {}): EnemyDef['stats'] => ({ hp, mp: 0, atk, mag: 8, def: 5, res: 5, spd, luck: 3, ...x });

defineEnemies([
  // ================================================================ normal foes
  {
    id: 'a1_jamble', name: 'Jamble', size: 'small', sprite: 'mon_jelly_pink', stats: S(40, 9, 7, { def: 6, mag: 8 }),
    desc: 'Set jam from the Great Jam Flood. Sticky, sweet, and legally a preserve.',
    weak: ['frost', 'fire'], resist: ['slash', 'blunt'], breakMax: 3, summonCap: 3,
    intents: [I('wobble', 'buff', 'Wobble', 'e_buff_def'), I('splat', 'attack', 'Splat', 'e_bash'), I('preserve', 'heal', 'Preserve', 'e_preserve')],
    pattern: ['wobble', 'splat', 'preserve'], xp: 6, gold: 5,
  },
  {
    id: 'a1_scab_bee', name: 'Scab Bee', size: 'small', sprite: 'mon_bee', stats: S(34, 9, 11, { mag: 8 }),
    desc: 'A non-union bee. Works through lunch. Clem will not speak to it.',
    weak: ['frost', 'blunt'], resist: ['pierce'], breakMax: 3,
    intents: [I('buzz', 'attack', 'Buzz', 'e_bite'), I('lunch', 'heal', 'Working Lunch', 'e_working_lunch'), I('overtime', 'multi', 'Overtime', 'e_overtime')],
    pattern: ['buzz', 'lunch', 'overtime'], xp: 7, gold: 5,
  },
  {
    id: 'a1_cawdle', name: 'Cawdle', size: 'small', sprite: 'mon_crow', stats: S(32, 9, 12),
    desc: "A crow that has never stolen anything it didn't find interesting. It finds buttons very interesting.",
    weak: ['blunt', 'storm'], resist: ['spirit'], breakMax: 3, summonCap: 2,
    intents: [I('caw', 'debuff', 'Caw', 'e_weaken'), I('peck', 'attack', 'Peck', 'e_bite'), I('shiny', 'debuff', 'Shiny!', 'e_shiny')],
    pattern: ['caw', 'peck', 'shiny'], xp: 6, gold: 7,
  },
  {
    id: 'a1_puffcap', name: 'Puffcap', size: 'small', sprite: 'mon_mushroom_imp', stats: S(38, 9, 7, { mag: 9 }),
    desc: 'A mushroom that releases spores when nervous. It is always nervous.',
    weak: ['pierce', 'slash'], resist: ['blunt', 'storm'], breakMax: 3,
    intents: [I('swell', 'buff', 'Swell', 'e_buff_atk'), I('spores', 'multi', 'Spore Burst', 'e_spore_burst'), I('deflate', 'wait', 'Deflate', 'e_wait')],
    pattern: ['swell', 'spores', 'deflate'], xp: 7, gold: 5,
  },
  {
    id: 'a1_murkwing', name: 'Murkwing', size: 'small', sprite: 'mon_moth_green', stats: S(32, 9, 12, { res: 6 }),
    desc: 'A grey moth that flies toward the bite in the sun the way other moths fly toward porches.',
    weak: ['pierce', 'spirit'], resist: ['blunt', 'frost'], breakMax: 3, summonCap: 2,
    intents: [I('flutter', 'buff', 'Flutter', 'e_flutter'), I('dim', 'debuff', 'Dim', 'e_weaken'), I('eat', 'debuff', 'Eat the Light', 'e_eat_light')],
    pattern: ['flutter', 'dim', 'eat'], xp: 6, gold: 5,
  },
  {
    id: 'a1_runaway_kite', name: 'Runaway Kite', size: 'small', sprite: 'mon_parrot', stats: S(36, 10, 11),
    desc: 'A post-kite that slipped its string. Still carrying a parcel. Would like you to sign for it.',
    weak: ['slash', 'pierce'], resist: ['storm'], breakMax: 3,
    intents: [I('swoop', 'attack', 'Swoop', 'e_swipe'), I('tangle', 'debuff', 'Tangle', 'e_chill_one'), I('gust', 'charge', 'Ride the Gust', 'e_charge'), I('delivery', 'heavy', 'Special Delivery', 'e_special_delivery')],
    pattern: ['swoop', 'tangle', 'gust', 'delivery'], xp: 8, gold: 6,
  },
  {
    id: 'a1_sheetling', name: 'Sheetling', size: 'small', sprite: 'mon_ghost', stats: S(36, 9, 9, { mag: 10, res: 6 }),
    desc: 'A picnic blanket that remembers somebody sitting on it. Haunts politely. Immune to Pound: there is nothing under there.',
    weak: ['spirit', 'fire'], resist: ['slash', 'pierce'], immune: ['blunt'], breakMax: 3,
    intents: [I('billow', 'charge', 'Billow', 'e_charge'), I('smother', 'heavy', 'Smother', 'e_smother'), I('flap', 'attack', 'Flap', 'e_flap'), I('sigh', 'debuff', 'Wistful Sigh', 'e_weaken_all')],
    pattern: ['billow', 'smother', 'flap', 'sigh'], xp: 8, gold: 6,
  },
  {
    id: 'a1_trundlesnail', name: 'Trundlesnail', size: 'medium', sprite: 'mon_snail', stats: S(64, 12, 5, { def: 9 }),
    desc: 'Has been on its way somewhere since spring. You are in the way.',
    weak: ['blunt', 'frost'], resist: ['pierce', 'fire'], breakMax: 5,
    intents: [I('trundle', 'attack', 'Trundle', 'e_bash'), I('retreat', 'buff', 'Retreat', 'e_buff_def'), I('slime', 'debuff', 'Slime Trail', 'e_chill_all'), I('slam', 'heavy', 'Shell Slam', 'e_shell_slam')],
    pattern: ['trundle', 'retreat', 'slime', 'slam'], xp: 10, gold: 8,
  },
  {
    id: 'a1_haywarden', name: 'Haywarden', size: 'medium', sprite: 'mon_mandrake', stats: S(56, 11, 8, { def: 6 }),
    desc: 'A scarecrow that stood nine years with its arms out, walked off when the sun hiccupped, and has opinions about crows.',
    weak: ['fire', 'spirit'], resist: ['pierce'], breakMax: 4,
    intents: [I('stare', 'debuff', 'Stare', 'e_expose'), I('flail', 'multi', 'Flail', 'e_flail'), I('crows', 'summon', 'Call the Crows', 'e_call_crows')],
    pattern: ['stare', 'flail', 'crows'], xp: 9, gold: 8,
  },
  {
    id: 'a1_toll_goat', name: 'Toll Goat', size: 'medium', sprite: 'mon_bison', stats: S(58, 12, 8, { def: 7 }),
    desc: 'Member of the Billy Brotherhood. Knows every bridge bylaw and finds them delicious.',
    weak: ['slash', 'frost'], resist: ['blunt', 'spirit'], breakMax: 4, summonCap: 1,
    intents: [I('bylaws', 'debuff', 'Cite the Bylaws', 'e_expose'), I('headbutt', 'attack', 'Headbutt', 'e_bash'), I('horns', 'charge', 'Lower Horns', 'e_charge'), I('gore', 'heavy', 'Gore', 'e_gore')],
    pattern: ['bylaws', 'headbutt', 'horns', 'gore'], xp: 10, gold: 9,
  },
  {
    id: 'a1_leafhound', name: 'Leafhound', size: 'medium', sprite: 'mon_fox', stats: S(54, 12, 10),
    desc: 'Clipped into the shape of a dog in 1079 by a duke who had never seen one up close.',
    weak: ['slash', 'fire'], resist: ['pierce'], breakMax: 4,
    intents: [I('sniff', 'buff', 'Sniff', 'e_buff_atk'), I('pounce', 'attack', 'Pounce', 'e_swipe'), I('dig', 'charge', 'Dig', 'e_charge'), I('bury', 'heavy', 'Bury You', 'e_bury_you')],
    pattern: ['sniff', 'pounce', 'dig', 'bury'], xp: 9, gold: 8,
  },
  {
    id: 'a1_grumbadger', name: 'Grumbadger', size: 'medium', sprite: 'mon_raccoon', stats: S(62, 12, 7, { def: 8, res: 7 }),
    desc: 'A Spoken badger. Was here first. Will tell you. Will keep telling you. Resists Grace: very sure of itself.',
    weak: ['pierce', 'storm'], resist: ['frost', 'spirit'], breakMax: 5,
    intents: [I('grumble', 'buff', 'Grumble', 'e_buff_atk'), I('swipe', 'attack', 'Swipe', 'e_swipe'), I('dig_in', 'buff', 'Dig In', 'e_buff_def'), I('badgering', 'multi', 'Badgering', 'e_badgering')],
    pattern: ['grumble', 'swipe', 'dig_in', 'badgering'], xp: 10, gold: 9,
  },
  {
    id: 'a1_snuffer', name: 'Snuffer', size: 'medium', sprite: 'mon_reaper', stats: S(56, 12, 9, { res: 7 }),
    desc: "A grey hood, a bell-shaped snuffer on a pole, and the eyes of someone who hasn't slept since breakfast.",
    weak: ['storm', 'slash'], resist: ['spirit'], breakMax: 4,
    intents: [I('shush', 'debuff', 'Shush', 'e_shush'), I('pole', 'attack', 'Snuffing Pole', 'e_bash'), I('go_home', 'wait', 'Please Go Home', 'e_wait'), I('not_again', 'heavy', 'Not Again', 'e_not_again')],
    pattern: ['shush', 'pole', 'go_home', 'not_again'], xp: 10, gold: 9,
  },
  {
    id: 'a1_turnipcutter', name: 'Tin Turnipcutter', size: 'medium', sprite: 'mon_robot_crab', stats: S(62, 12, 8, { def: 9 }),
    desc: 'Built in 1059 for the Turnip War. Nobody has told it the war is over. Nobody has been brave enough.',
    weak: ['storm', 'blunt'], resist: ['slash', 'fire'], breakMax: 5,
    intents: [I('march', 'buff', 'March', 'e_buff_atk'), I('chop', 'attack', 'Chop', 'e_swipe'), I('wind_up', 'charge', 'Wind Up', 'e_charge'), I('harvest', 'heavy', 'Harvest', 'e_harvest')],
    pattern: ['march', 'chop', 'wind_up', 'harvest'], xp: 10, gold: 10,
  },
  {
    id: 'a1_luncheon', name: 'Lurking Luncheon', size: 'medium', sprite: 'mon_mud_maw', stats: S(58, 12, 8, { mag: 8 }),
    desc: "A picnic hamper waiting for someone hungry. The sandwiches are real. That's the trick. Resists Chill: there's an ice pack in the lid.",
    weak: ['spirit', 'fire'], resist: ['frost'], breakMax: 4,
    intents: [I('sandwich', 'heal', 'Offer Sandwich', 'e_offer_sandwich'), I('snap', 'heavy', 'Snap Shut', 'e_snap_shut'), I('chew', 'attack', 'Chew', 'e_chew')],
    pattern: ['sandwich', 'snap', 'chew'], xp: 9, gold: 9,
  },
  {
    id: 'a1_waistcoat_wasp', name: 'Waistcoat Wasp', size: 'small', sprite: 'mon_firefly', stats: S(32, 9, 12),
    desc: 'Dressed for a garden party it was not invited to. Will not be leaving. Weak to Grace: it is pretending to be a guest.',
    weak: ['spirit', 'storm'], resist: ['slash'], breakMax: 3, summonCap: 2,
    intents: [I('preen', 'buff', 'Preen', 'e_buff_atk'), I('sting', 'attack', 'Sting', 'e_wasp_sting'), I('invite', 'summon', 'Invite Itself', 'e_invite_itself')],
    pattern: ['preen', 'sting', 'invite'], xp: 7, gold: 6,
  },

  // ================================================================ Bigwigs (elites)
  {
    id: 'a1_baron', name: 'Baron Bleatham', size: 'large', sprite: 'mon_bison_red', elite: true, stats: S(170, 16, 7, { def: 10, res: 7, mag: 8 }),
    desc: 'King of the Billy Brotherhood, in a bucket crown and a velvet waistcoat with a fob watch he cannot read. "The bridge is free. Crossing it is a hundred buttons."',
    weak: ['slash', 'frost'], resist: ['blunt', 'spirit'], breakMax: 6,
    intents: [I('ten', 'attack', 'Toll: Ten Buttons', 'e_toll_ten'), I('fifty', 'multi', 'Toll: Fifty Buttons', 'e_toll_fifty'), I('counsel', 'summon', 'Call Counsel', 'e_call_counsel'), I('hundred', 'charge', 'Toll: One Hundred', 'e_charge'), I('pay_up', 'heavy', 'PAY UP', 'e_pay_up')],
    pattern: ['ten', 'fifty', 'counsel', 'hundred', 'pay_up'],
    phases: [{ hpBelow: 0.5, pattern: ['ten', 'fifty', 'hundred', 'pay_up'], message: 'The Baron consults his fob watch. He cannot read it. He decides it is later than it is.' }],
    xp: 40, gold: 45, drops: ['w_cheese_mallet', 't_goat_bell'],
  },
  {
    id: 'a1_colossus', name: 'The Conserve Colossus', size: 'large', sprite: 'mon_boss_gourd', elite: true, stats: S(180, 15, 6, { def: 9, mag: 10, res: 6 }),
    desc: 'Thirty-seven years ago it was an orchard\'s worth of strawberries. It has not forgiven anyone. A hill of jam wearing a few trees.',
    weak: ['frost', 'fire'], resist: ['slash', 'blunt'], breakMax: 7,
    intents: [I('bubble', 'buff', 'Bubble', 'e_buff_def'), I('spread', 'summon', 'Spread Thin', 'e_spread_thin'), I('wave', 'multi', 'Wave of Jam', 'e_wave_of_jam'), I('set', 'charge', 'Set', 'e_charge'), I('seal', 'heavy', 'Seal the Jar', 'e_seal_jar')],
    pattern: ['bubble', 'spread', 'wave', 'spread', 'set', 'seal'],
    xp: 40, gold: 40, drops: ['w_ice_scoop', 'c_snow_globe'],
  },
  {
    id: 'a1_nocturne', name: 'Sister Nocturne', size: 'medium', sprite: 'mon_shade', elite: true, stats: S(150, 16, 9, { def: 8, res: 9 }),
    desc: 'A Quiet Hour adept in a grey habit with two bell-snuffers and tired, certain eyes. Counters any command used twice in a row.',
    weak: ['storm', 'slash'], resist: ['spirit', 'blunt'], breakMax: 6, passives: [{ id: 'rehearsed' }],
    intents: [I('hush', 'debuff', 'Hush', 'e_hush'), I('twin', 'multi', 'Twin Snuff', 'e_twin_snuff'), I('lullaby', 'debuff', 'Lullaby', 'e_chill_one'), I('i_know', 'charge', 'I Know What You\'ll Do', 'e_charge'), I('not_this_time', 'heavy', 'Not This Time', 'e_not_this_time')],
    pattern: ['hush', 'twin', 'lullaby', 'i_know', 'not_this_time'],
    xp: 42, gold: 40, drops: ['w_proto_kite', 'c_strong_tea'],
  },

  // ================================================================ boss: one enemy, three shapes
  {
    id: 'a1_thief', name: 'The Hooded Thief, Mounted', size: 'large', sprite: 'mon_boss_bee_queen', boss: true, stats: S(230, 16, 8, { def: 9, res: 9, mag: 12 }),
    desc: 'An enormous grey moth with a hooded figure clinging to its back, shrieking. The rider throws things. One of them is a sandwich.',
    weak: ['fire', 'pierce'], resist: ['frost', 'blunt'], breakMax: 8,
    intents: [
      // phase 1: the Hooded Thief, Mounted
      I('wingbeat', 'multi', 'Wingbeat', 'e_wingbeat'), I('smoke', 'debuff', 'Smoke Bomb', 'e_smoke_bomb'), I('murk', 'summon', 'Call the Murk', 'e_call_murk'),
      I('sandwich', 'heal', 'Throw Sandwich', 'e_throw_sandwich'), I('dive', 'charge', 'Dive', 'e_charge'), I('swoop', 'heavy', 'Moonless Swoop', 'e_moonless_swoop'),
      // phase 2: Lamplighter Odo Brassfinch
      I('proc_4b', 'buff', 'Procedure 4(b)', 'e_buff_def'), I('odo_pole', 'attack', 'Snuffing Pole', 'e_bash'), I('speech', 'debuff', 'Interminable Speech', 'e_chill_all'),
      I('faint', 'charge', 'Dramatic Faint', 'e_charge'), I('due', 'heavy', "Lamplighter's Due", 'e_lamplighters_due'),
      // phase 3: the Duskmother, Hushed
      I('dust', 'debuff', 'Grey Dust', 'e_grey_dust'), I('wingstorm', 'multi', 'Wingstorm', 'e_wingstorm'), I('odo_protect', 'wait', 'Odo: Protect the Public', 'e_odo_protect'),
      I('eat_all', 'debuff', 'Eat the Light', 'e_eat_light_all'), I('eclipse', 'charge', 'Eclipse', 'e_charge'), I('totality', 'heavy', 'Totality', 'e_totality'),
    ],
    pattern: ['wingbeat', 'smoke', 'murk', 'sandwich', 'dive', 'swoop'],
    phases: [
      {
        onBreak: true, hpBelow: 0.6, pattern: ['proc_4b', 'odo_pole', 'speech', 'faint', 'due'], breakMax: 4,
        name: 'Lamplighter Odo Brassfinch', sprite: 'mon_armor_blob', size: 'medium', weak: ['spirit', 'blunt'], resist: ['slash', 'pierce'], immune: [],
        message: "The moth spirals into the trees. The rider tumbles into a fern, the hood falls back, and it is Lamplighter Odo Brassfinch, still clutching the reliquary. He gets up. 'Procedure 1: Nobody Saw That.'",
      },
      {
        onBreak: true, hpBelow: 0.35, pattern: ['dust', 'wingstorm', 'odo_protect', 'eat_all', 'eclipse', 'eclipse', 'totality'], breakMax: 7, heal: 0.5,
        name: 'The Duskmother, Hushed', sprite: 'mon_dragon_purple', size: 'large', weak: ['fire', 'spirit'], resist: ['slash', 'frost'], immune: [],
        message: 'The reliquary falls. The Coal bounces twice. A flake of black paint peels off grey papier-mâché. Odo sits down in the fern. Then the trees start to shake.',
      },
    ],
    xp: 120, gold: 90, drops: ['c_fruitcake'],
  },
]);

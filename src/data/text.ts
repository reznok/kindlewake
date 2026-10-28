/**
 * Flavour text tables: death quips, taglines, tips, Fireside scenes, the shop, Bigwig barks, boss messages, recruit
 * scenes, event variants, the in-world glossary and the first-run intro.
 * Conventions: Halcyran British spelling; Gertie speaks in capitals (except her KO line); Pell's lines are stage
 * directions (rendered in italics); *asterisks* mark emphasis; foes are "routed".
 * Character-keyed lines play only when that character is in the party (Front or Wagon); base text always stands alone.
 */
import { ENEMIES } from './enemies';

// ---------------------------------------------------------------- death quips (end screen)

export const DEATH_HEADER = 'The candle gutters.';

/**
 * `byKiller` is keyed by enemy id; boss shapes add `#2`, `#3` keys (second and third shape). `deathQuip` resolves the run's `killedBy`
 * (a display name) to a key, falling back to the general list.
 */
export const DEATH_QUIPS: { general: string[]; byKiller: Record<string, string> } = {
  general: [
    'Somewhere in Butterwick, a kettle goes on.',
    "The Ledger will remember. It's a very good listener.",
    "Well. That's gone off.",
    'Half a loaf is still a loaf. This was more of a crust.',
    'The goats are going to be insufferable about this.',
    "Mothersole's Bestiary has been updated with your mistakes.",
    'Dell would like it noted that she gave that a four.',
    'Somewhere in Duskwood, a moth is having the best day of its life.',
    'Gerald survived. Gerald always survives.',
    "That one's going in the Ledger in very small handwriting.",
    'Gone, but noted.',
    'The bees have called an emergency meeting.',
    'The Kite-Post regrets to inform you.',
    'Another page. She reads them all.',
    'Brave, mostly. Timing, occasionally.',
    "Nan puts the pie back in the oven. It'll keep.",
  ],
  byKiller: {
    a1_jamble: 'Preserved. Indefinitely.',
    a1_colossus: 'Preserved. Indefinitely.',
    a1_toll_goat: 'Fined. Heavily. See bylaw one.',
    a1_baron: 'Fined. Heavily. See bylaw one.',
    a1_luncheon: 'You were told not to eat anything a hamper offers you.',
    a1_trundlesnail: 'Overtaken by a snail. Take a moment with that.',
    a1_turnipcutter: 'Mistaken for Duchy. Easy mistake.',
    a1_snuffer: 'She did ask nicely.',
    a1_nocturne: '"Not again," says someone, very quietly.',
    a1_runaway_kite: 'Signed for.',
    a1_puffcap: 'It was more scared of you. It still won.',
    a1_sheetling: 'Smothered, politely.',
    a1_grumbadger: 'It was here first. It has said so.',
    a1_cawdle: 'It took the buttons. Then it took everything.',
    a1_haywarden: 'The crows send their regards.',
    a1_leafhound: 'Buried. Neatly. In a topiary shape.',
    a1_waistcoat_wasp: "It wasn't invited either.",
    a1_scab_bee: 'Clem is not surprised.',
    a1_murkwing: 'The light went first.',
    a1_thief: "The moth goes home. You don't.",
    'a1_thief#2': 'Felled by procedure.',
    'a1_thief#3': "The moth goes home. You don't.",
  },
};

/** Display name (as recorded in `killedBy`) to a `byKiller` key, including boss shape names. */
function killerKey(name: string): string | null {
  for (const e of Object.values(ENEMIES)) {
    if (e.name === name) return e.id;
    let shape = 2;
    for (const p of e.phases ?? []) { if (p.name === name) return `${e.id}#${shape}`; shape++; }
  }
  return null;
}

/** A quip for the end screen. `pick` chooses from the general list (pass the run's RNG pick for determinism). */
export function deathQuip(killedBy: string | undefined, pick: (list: string[]) => string = (l) => l[0]): string {
  const key = killedBy ? killerKey(killedBy) : null;
  return (key && DEATH_QUIPS.byKiller[key]) || pick(DEATH_QUIPS.general);
}

// ---------------------------------------------------------------- title taglines and tips

/** `always` shows from the first launch; each gated set needs the Ledger `seen` key before it joins the pool. */
export const TAGLINES: { always: string[]; gated: { seen: string; lines: string[] }[] } = {
  always: [
    'The sun has a bite in it.',
    'Bring a friend. Bring five.',
    'Every hearth gives something.',
    'A party RPG about timing, teamwork and jam.',
    'Hit it with the right verb.',
    "Mind you come back. There's a pie in for Thursday.",
    'Sign the book, dears.',
    'Now with forty per cent more goats.',
    'Someone has to carry the light.',
    'Legally, the jam is a preserve.',
    'Ten out of ten. Note the wrist.',
    'The bees have voted in favour.',
    'HEAR YE! A NEW WAKE BEGINS!',
  ],
  gated: [
    { seen: 'act2', lines: ["The people come back. The kindling doesn't.", 'Every Wake costs a day of sun.', 'Outlook: bright, with a chance of tomorrow.'] },
  ],
};

/**
 * A hero's reaction when a lure or debuff lands, keyed by the enemy intent id. `{who}` is the hero it landed on
 * (or the first of them). The battle UI picks one at random and shows it only sometimes.
 */
export const REACTIONS: Record<string, string[]> = {
  shiny: ['{who} checks for buttons. All present. For now.', '"It\'s looking at my buttons," says {who}, and covers them.'],
  caw: ['{who} is being heckled by a crow and takes it personally.'],
  dim: ['The light goes thin around {who}. It is still a nice day. It is just a slightly less nice one.'],
  eat: ['{who} feels the warmth go out of the afternoon.'],
  eat_all: ['The afternoon goes grey. Everybody feels it.'],
  stare: ['The scarecrow stares at {who}. {who} stares back. The scarecrow is better at it.'],
  bylaws: ['{who} is read a bylaw. It is very long. It is not even the relevant one.'],
  tangle: ['{who} is tangled in kite string and a parcel that wants a signature.'],
  slime: ['{who} steps in it. Everyone steps in it. It was the whole path.'],
  sigh: ['The blanket sighs. {who} feels unaccountably sad about a picnic that happened to someone else.'],
  hush: ['"Shh," says the Sister, and {who} finds that the Guard has gone quiet too.'],
  lullaby: ['{who} yawns. It is not even late.'],
  smoke: ['{who} coughs. Somewhere in the smoke, somebody is apologising.'],
  speech: ['Odo is on his seventh point. {who} has lost count of the sub-points.'],
  dust: ['Grey dust settles on everyone. It is very hard to feel brave while dusty.'],
  shush: ['The snuffer bell dips over {who}. The world is briefly quieter and worse.'],
  lunch: ['The bee eats. {who} is somehow offended by this.'],
  preserve: ['The jam reknits. It is, {who} supposes, what jam is for.'],
  sandwich: ['A sandwich is offered. {who} does not take it. The sandwich is offended.'],
  go_home: ['"Please go home," it says. {who} considers it, briefly.'],
};

export const TIPS: string[] = [
  'Tap as the ring closes. A Bright hit on a weakness takes two off the Break bar.',
  "A Broken foe has to remember what it is. Hit it while it's remembering.",
  'Push a Broken foe\'s turn back and it stays Broken longer.',
  'Heavy and charge intents are the ones to Crack, or to Guard.',
  'A Steady guard restores Moxie. Nothing restores your nerve like a goat bouncing off a skillet lid.',
  "The map shows what's coming. Pack your verbs accordingly.",
  'Jam: Chill it or Bake it. Pounding it only annoys it.',
  "Grace can't hurt anything that's exactly what it seems. Goats are exactly what they seem.",
  'The Wagon earns know-how too. Not as much. It mostly naps.',
  'At a Fireside you can rest, take a spark, or sharpen something. Not all three. Nobody can.',
  'Swapping costs a turn. Falling over costs more.',
  'When in doubt, read the intent. When not in doubt, read it anyway.',
];

// ---------------------------------------------------------------- Fireside scenes (camp)

/**
 * A line plays when its speaker (`who`, a character id; null = narration) and everyone in `requires` are in the
 * party. Bracketed blocks in the bible become `requires: [owner]` on every line of the block.
 */
export interface SceneLine { who: string | null; text: string; requires?: string[] }
export interface CampScene { id: string; title: string; cols: [number, number]; lines: SceneLine[] }

/** Plays once per Wake, the first time a camp is chosen in the matching (0-based) column range. */
export const CAMP_SCENES: CampScene[] = [
  {
    id: 'fireside_gerald', title: 'Gerald', cols: [0, 2],
    lines: [
      { who: 'barty', text: 'Barty unscrews a jar. "Dinner, Gerald."' },
      { who: 'dell', text: '"Who is Gerald."', requires: ['barty'] },
      { who: 'barty', text: '"My starter. Sourdough. He\'s eighty-one."' },
      { who: 'dell', text: '"You brought a jar of eighty-one-year-old paste on a monster hunt."', requires: ['barty'] },
      { who: 'barty', text: '"I couldn\'t leave him. He\'s never been on his own."' },
      { who: 'clem', text: '"The girls like him. They say he smells like a kitchen at four in the morning."', requires: ['barty'] },
      { who: 'barty', text: '"That\'s the nicest thing anyone\'s ever said about Gerald."', requires: ['clem'] },
      { who: 'dell', text: '"I\'d score your hit on that snail a seven, by the way."', requires: ['barty'] },
      { who: 'barty', text: '"Oh! Thank you!"', requires: ['dell'] },
      { who: 'dell', text: '"Out of twenty."', requires: ['barty'] },
      { who: 'pell', text: 'Pell mimes stirring a jar and patting it, then mouths *Gerald* before Barty has told her the name.', requires: ['barty'] },
      { who: 'barty', text: '"How did you know his name?"', requires: ['pell'] },
      { who: 'pell', text: 'Pell mimes *lucky guess*. Then she mimes it again, slower, and doesn\'t look at anyone.', requires: ['barty'] },
      { who: 'gertie', text: '"HE\'S EIGHTY-ONE? HAPPY BIRTHDAY, GERALD!"', requires: ['barty'] },
      { who: 'barty', text: '"It isn\'t his birthday."', requires: ['gertie'] },
      { who: 'gertie', text: '"IT IS NOW!"', requires: ['barty'] },
      { who: 'kit', text: '"Can I take him apart? Not *apart* apart."', requires: ['barty'] },
      { who: 'barty', text: '"No."', requires: ['kit'] },
      { who: 'kit', text: '"Just to see how he works."', requires: ['barty'] },
      { who: 'barty', text: '"Flour and water and eighty-one years of being looked after."', requires: ['kit'] },
      { who: 'kit', text: 'Quietly impressed: "...That\'s a good design."', requires: ['barty'] },
      { who: 'clem', text: '"Whose ember\'s in the Coal from your house?"', requires: ['barty'] },
      { who: 'barty', text: '"Ours. Crumb ember, every Kindlewake since Florian. Dad got up at three to bank the oven for it." A pause. "I hope it\'s alright. Wherever it is."' },
      { who: 'dell', text: 'Quietly: "It will be exactly as alright as it was before it was stolen."', requires: ['barty'] },
      { who: 'clem', text: '"That\'s a strange way to put it."', requires: ['dell'] },
      { who: 'dell', text: '"I\'m a strange woman. Go to sleep. Somebody wake the baker at three. He\'ll do it anyway."' },
    ],
  },
  {
    id: 'fireside_outlook', title: 'Outlook', cols: [3, 5],
    lines: [
      { who: 'dell', text: '"Report. The snail, a seven. The goats, a four; they cheated. Barty, a nine."' },
      { who: 'barty', text: '"Out of?"', requires: ['dell'] },
      { who: 'dell', text: '"Ten."', requires: ['barty'] },
      { who: null, text: '*Barty goes very quiet and very pink and has to walk around the fire once.*', requires: ['barty', 'dell'] },
      { who: 'clem', text: '"The girls keep flying back toward Butterwick at night. They say the inn\'s got the oldest wax they\'ve ever smelled. Older than the hives. Older than anything."' },
      { who: 'barty', text: '"Nan\'s candles? She gets them off Dun."', requires: ['clem'] },
      { who: 'clem', text: '"Bees don\'t lie. They exaggerate. It\'s in the agreement."' },
      { who: 'roz', text: 'Roz looks at the sky a long time, then closes her almanac. "Outlook for tomorrow." A pause. "Today. Since the parade, the sky shows tomorrow as today. Like a page stuck in the press."' },
      { who: 'dell', text: '"Has that happened before?"', requires: ['roz'] },
      { who: 'roz', text: '"I have never once been wrong, Delphine. I would like very much not to start now."', requires: ['dell'] },
      { who: 'pell', text: 'Pell draws a circle in the air with one finger, round and round. Then she points at the Kindle, at herself, and lays her head on her hands. Nobody understands. She rubs her eyes and stops.' },
      { who: 'kit', text: '"Uncle Odo\'s not a bad man. He\'s a procedure man." A pause. "If the Coal turned out to be a bit... less than... would that matter? Hypothetically?"' },
      { who: 'dell', text: 'Dell looks at her very carefully. "Hypothetically, I was dismissed over a pot of paint."', requires: ['kit'] },
      { who: 'gertie', text: '"I\'VE CRIED THE COAL DAY PROCLAMATION FORTY-ONE YEARS." Quieter, still in capitals: "I\'VE NEVER ONCE SEEN IT GLOW."' },
      { who: 'ashlar', text: '"I should mention that statues hear everything at night. Mister Crumb talks in his sleep about crumb structure."', requires: ['barty'] },
      { who: 'barty', text: '"Everyone does."', requires: ['ashlar'] },
      { who: 'ashlar', text: '"Not at that length."', requires: ['barty'] },
      { who: 'dell', text: '"Bed. We have a moth to catch."' },
    ],
  },
  {
    // Fallback: plays for any party (no `requires`), so a camp is never silent.
    id: 'fireside_kettle', title: 'The Kettle', cols: [0, 5],
    lines: [
      { who: null, text: 'Somebody finds the kettle. Somebody else finds the water. Nobody finds the tea, and then everybody does, in the Wagon, under the maps.' },
      { who: 'barty', text: '"I brought scones. I always bring scones. One day someone will say thank you for the scones."' },
      { who: 'dell', text: '"Thank you for the scones." A pause. "Seven out of twenty."' },
      { who: 'clem', text: '"The girls are asleep in the hive. They did good work today. Say it so they can hear."' },
      { who: 'roz', text: '"Pressure is dropping. Tomorrow will be fine, or terrible, or both. I keep telling people this and they keep going outside."' },
      { who: 'ashlar', text: '"I do not sleep. I will watch the fire. I have watched a great many fires. This one is small but sincere."' },
      { who: 'gertie', text: '"GOODNIGHT, EVERYONE." A long pause. "GOODNIGHT, FIRE."' },
      { who: 'kit', text: 'Kit has taken the kettle apart. It is a better kettle now, apparently. It whistles the Proclamation.' },
      { who: 'pell', text: 'Pell mimes putting the whole fire into her pocket for later, then mimes that it is warm in there, then mimes *sorry*.' },
      { who: null, text: 'The fire does the thing fires do, which is look like it knows something. Nobody asks it.' },
    ],
  },
];

// ---------------------------------------------------------------- Dun's Sundries (the shop)

/** First shop of a Wake vs later is tracked with the run flag `SHOP.visitedFlag`. Dun never buys: no sell UI. */
export const SHOP = {
  name: "Dun's Sundries",
  keeper: 'Dun',
  sign: "DUN'S SUNDRIES: EVERYTHING YOU'LL NEED (AGAIN)",
  desc: 'An old Spoken tortoise the size of a pony with a whole shop built onto his shell: striped awning, a little bell, shelves of jars and tins. Half-moon spectacles, a cardigan with a grey thread through it, sooty fingertips.',
  visitedFlag: 'shop:visited',
  /** Keepsake (relic) price in buttons. */
  keepsakePrice: 90,
  lines: {
    first: ["Dun's Sundries. Everything you'll need. Have a look. Take your time. I've got plenty."],
    again: ['Back again. Course you are.'],
    browse: ["That one's good against jam. Don't ask me how I know. Jam sort of week."],
    buy: ['Lovely. Mind how you go.', 'Good choice. Better than last time.'],
    poor: ["No credit. Not because I don't trust you. Because I've done the maths."],
    keepsake: ["That one's been in a lot of pockets."],
    leave: ['Have you considered going home? No? No. Never mind. Mind the moths.'],
    idle: ["Lovely place, the inn. Lovely pies. Don't sit by the candle."],
  },
  /** Extra greeting lines keyed by run flag. */
  byFlag: {
    wrote_to_nan: 'She got your letter. She says you should have eaten the cake.',
    asked_snuffer: "Somebody's been telling you to ask the tortoise. I'm a tortoise. Ask away. (You don't know what to ask. He looks relieved.)",
  } as Record<string, string>,
  /** Extra greeting lines keyed by party member (character id). */
  byMember: {
    pell: 'Dun and Pell exchange a look. "Evening, miss." Pell tips an invisible hat, very slowly, like a tortoise.',
    ashlar: 'Dun goes quiet. "You\'ve weathered well, sir." Ashlar: "Have we met?" Dun: "...No. No, I don\'t suppose we have."',
    kit: '"Your uncle owes me for four pots of paint."',
  } as Record<string, string>,
};

// ---------------------------------------------------------------- Bigwig barks (elites)

export interface EliteBarks {
  intro: string;
  routed: string;
  /** `rehearsed` counter line. */
  counter?: string;
  cracked?: string;
  /** Party-presence exchanges after the intro: the member's line, then the elite's answer. */
  replies?: Record<string, { line: string; answer?: string }>;
}

export const ELITE_BARKS: Record<string, EliteBarks> = {
  a1_baron: {
    intro: 'Bylaw one: the toll. Bylaw two: see bylaw one.',
    routed: "I'll be lodging a complaint. With myself. I'm the complaints department.",
  },
  a1_colossus: {
    intro: '*The jam regards you. The jam has always regarded you.*',
    routed: '*It slumps into a very large, very sulky trifle.*',
  },
  a1_nocturne: {
    intro: 'You always open with that.',
    counter: 'I know.',
    cracked: "...That's new.",
    routed: "Go home. It's kinder. You won't, though. You never do.",
    replies: { barty: { line: "We haven't done anything yet.", answer: 'You will.' } },
  },
};

// ---------------------------------------------------------------- the act-1 boss

export const BOSS_MESSAGES = {
  a1_thief: {
    intro: 'Duskwood. Something enormous and grey is circling, and somebody on its back is screaming.',
    /** Phase messages are on the enemy's phases; these are the party-keyed UI substitutions and extra barks. */
    phaseVariants: {
      1: { kit: 'Kit: "I painted it, Uncle Odo. I painted it every year." Odo: "Not *now*, Kitten."' },
    } as Record<number, Record<string, string>>,
    /** Odo's speech barks escalate once per loop of his shape. */
    speech: ['Stand back! This Coal is very real!', "Extremely hot! Don't touch it!", "It's *fine*. It's *fine*. Everyone look at the moth."],
    smokeBomb: 'BEGONE! I mean, HELP!',
    odoProtect: "I'm not brave. I've just read the procedure.",
    defeat: 'The moth dissolves into grey dust that drifts upward toward the bite.',
    bestiary: 'Not feeding on the dark. *Going home* to it.',
    /** The act-end scene (after the boss, before act 2). */
    after: {
      text: [
        'Odo, unhooded, sitting in a fern.',
        "The Guild lost the Lamplighter's Lantern when Hesper Vane walked out of her own homecoming feast in 1101; without it no ember lives a day. The Guild has carried a painted lump on every Coal Day since, and meant to do the same at the Wickspire.",
        'Then the sun hiccupped for real, and he panicked. He meant to "lose" the Coal in the crowd, blame the nap cult and resign with dignity. The moth grabbed him because he was holding something gold.',
        '"I\'ve been up there since lunch. Yesterday\'s lunch. I missed *today\'s*."',
        'The bite in the sun is still there. Somebody has to go to the Rim anyway. Odo knows one thing worth knowing: the only map of the road through the Blank is in Marisol Inkwhistle\'s papers at the Saltglass Observatory.',
      ],
      byMember: {
        barty: 'Barty picks up a flake of paint and says nothing for a long time. Then: "We got up early for that."',
        kit: 'Kit: "I painted it, Uncle Odo. Every year." Odo: "You did a lovely job, Kitten."',
        dell: 'Dell: "Paint, coal-black, one pot. For discretion, one pension." Odo: "...How do you know that?" Dell: "I was the discretion."',
      } as Record<string, string>,
      byFlag: { agnes: 'Agnes Plum steps out of the ferns with her notebook. "It *bounced*." She writes something down and leaves.' } as Record<string, string>,
    },
  },
};

// ---------------------------------------------------------------- recruit scenes (Volunteer nodes)

export const RECRUIT_SCENES: Record<string, string> = {
  ashlar: 'A statue sits on a milestone at the roadside, holding its stone shield over a wren\'s nest against the drizzle. It has been there since breakfast. "Good day. I am waiting for the rain to stop, for the birds\' sake. I wonder, are you going anywhere slowly?"',
  gertie: 'From a lock-up behind a toll booth, a voice that rattles the bars. "HELLO! I AM BEING DETAINED UNDER BYLAW TWELVE! THE GOAT HAS GONE FOR LUNCH! THE KEY IS ON THE NAIL!" It is.',
  kit: 'Thimble Mill\'s patchwork sails are turning backwards. A girl in goggles is hanging off one of them with a wrench in her teeth. "Don\'t touch anything! It\'s *meant* to do that!" It isn\'t.',
  pell: 'Beside a stranded caravan painted *THE FAIRGROUND OF LESSER WONDERS*, a mime is trapped in an invisible box. She has been in it, a sign beside her says, since the parade. She looks at you for a long moment, as if she\'s seen your faces before and is sorry about it. Then she opens a door in the box that was always there, and steps out.',
  roz: 'Kite Hill, a hundred tethered post-kites humming. A woman in a cloud-patterned robe is staring at the sky with an almanac open and a pencil she isn\'t using. "Tomorrow\'s forecast is—" She stops. "Is being revised. Where are you going? I\'ll come. I\'m told the air\'s better there."',
};

/** Kit's Thing-o-Matic: the UI shows one random pair per use. */
export const THINGOMATIC = {
  meant: ['make tea', 'sharpen pencils', 'play the national anthem', 'find north'],
  did: ['none of that', 'something else', "it's on fire, slightly"],
  format: (meant: string, did: string) => [`It's *meant* to ${meant}.`, `It did ${did}.`],
};

// ---------------------------------------------------------------- event presence variants

/** Optional lines added after an event's text (`choice` undefined) or a choice's result, keyed by party member. */
export const EVENT_VARIANTS: Record<string, { choice?: number; who: string; text: string }[]> = {
  ev_rehearsal: [{ choice: 0, who: 'dell', text: 'Dell: "Ten out of ten. Note the handwriting."' }],
  ev_guild_stores: [{ choice: 0, who: 'kit', text: 'Kit produces a key and avoids eye contact.' }],
  ev_stile: [
    { who: 'barty', text: '*B.C. + GERALD*, in blocky capitals.' },
    { who: 'dell', text: 'A precise *D.Q.* with *4/10* beside it.' },
    { who: 'clem', text: 'A bee, drawn by someone who loves bees.' },
    { choice: 0, who: 'barty', text: 'Barty: "Feels like we already did."' },
    { choice: 2, who: 'roz', text: "Roz checks the sky and doesn't say what she sees." },
  ],
  ev_letter: [
    { who: 'barty', text: 'Barty: "That\'s Nan Hess. She always knows. First time I ever met her she knew I take two sugars."' },
    { who: 'dell', text: 'Dell: "And how does an innkeeper know about the goats?"' },
    { choice: 2, who: 'barty', text: 'Barty is aghast about the cake.' },
  ],
};

// ---------------------------------------------------------------- glossary (the words the UI should use)

export const GLOSSARY: Record<string, { term: string; meaning: string; ui?: string }> = {
  world: { term: 'Halcyra', meaning: 'the world', ui: 'Title and map headers.' },
  sun: { term: 'the Kindle', meaning: 'the sun' },
  run: { term: 'Wake', meaning: 'one run', ui: '"Wake 14", "Begin a new Wake"' },
  ledger: { term: 'the Ledger', meaning: 'the meta-progression book', ui: 'Ledger screen title: "The Ledger"' },
  party: { term: 'the Kindling', meaning: 'your party', ui: 'Party sheet title: "Your Kindling"' },
  front: { term: 'the Front', meaning: 'the active three' },
  bench: { term: 'the Wagon', meaning: 'the bench three', ui: 'Swap = "Call from the Wagon"' },
  wipe: { term: 'guttered', meaning: 'the party wiped', ui: 'End screen header: "The candle gutters."' },
  camp: { term: 'Fireside', meaning: 'camp node', ui: '"Fireside: Rest / Spark / Forge"' },
  relic: { term: 'Keepsake', meaning: 'relic', ui: '"Keepsakes (5/8)"' },
  spark: { term: 'Spark', meaning: 'upgrade pick', ui: '"A spark settles in Barty."' },
  trinket: { term: 'Knick-knack', meaning: 'trinket slot' },
  gold: { term: 'buttons', meaning: 'gold', ui: '"120 buttons"' },
  mp: { term: 'Moxie', meaning: 'MP', ui: '"MX" or "MP"; tooltip "Moxie"' },
  break: { term: 'Break / Broken', meaning: 'Break bar / Broken', ui: 'The UI says BREAK and BROKEN; "Set" and "Cracked" are dialogue flavour only' },
  weakness: { term: 'Undoing', meaning: 'weakness', ui: 'Bestiary: "Undoing: Chill, Bake"' },
  perfect: { term: 'Bright', meaning: 'perfect timing', ui: '"BRIGHT!"' },
  good: { term: 'Warm', meaning: 'good timing', ui: '"Warm"' },
  miss: { term: 'Cold', meaning: 'missed timing', ui: '"Cold"' },
  perfectGuard: { term: 'Steady!', meaning: 'perfect guard', ui: 'Popup' },
  event: { term: 'Happenstance', meaning: 'event node' },
  recruit: { term: 'Volunteer', meaning: 'recruit node', ui: '"A volunteer approaches."' },
  routed: { term: 'routed', meaning: 'enemy defeated', ui: '"The Toll Goat is routed." Foes scarper, sulk or fall over; nobody dies on the Downs.' },
  elite: { term: 'Bigwig', meaning: 'elite', ui: 'Map tooltip' },
  shop: { term: "Dun's Sundries", meaning: 'the shop', ui: 'Shop header' },
  bestiary: { term: "Mothersole's Bestiary", meaning: 'the bestiary' },
  slash: { term: 'Cut', meaning: 'slash damage' },
  pierce: { term: 'Skewer', meaning: 'pierce damage' },
  blunt: { term: 'Pound', meaning: 'blunt damage' },
  fire: { term: 'Bake', meaning: 'fire damage' },
  frost: { term: 'Chill', meaning: 'frost damage' },
  storm: { term: 'Whisk', meaning: 'storm damage' },
  spirit: { term: 'Grace', meaning: 'spirit damage' },
};

// ---------------------------------------------------------------- first-run intro (spoiler-free)

export const INTRO: { title?: string; text: string }[] = [
  { title: 'Kindlewake Morning', text: 'Monday, 1200 Y.K. Butterwick green is all bunting and pie stalls. Once a century every hearth in Halcyra gives one ember, and the Lamplighter carries the Gathered Coal to the Wickspire to feed the sun. Every hearth gives something.' },
  { text: 'At noon the sun *hiccups*: a sound like a giant blowing out a birthday candle. A grey bite appears in its edge. The green goes quiet. Somebody\'s dog starts to cry.' },
  { text: 'Grey moths pour out of Duskwood. An enormous one swoops over the green and carries off a hooded figure clutching the reliquary, screaming. The Lamplighter is nowhere to be seen. "They\'ve taken him too!"' },
  { title: 'The Kindlewake Inn', text: 'Nan Hess rings the inn bell. "Right. Who\'s going?" She lights the stub of candle in the brass lantern over the bar, for luck, and slides a vast black guest book across the counter, moving the cat.' },
  { text: '"Sign here, dears. Mind you come back. I\'ve a pie in for Thursday."' },
];

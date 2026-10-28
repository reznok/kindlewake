import type { EventDef, Outcome } from '../core/types';

/**
 * Act-1 events (Happenstances). Text uses *asterisks* for emphasis. Character-presence variants live in
 * `EVENT_VARIANTS` (text.ts); the base text always stands alone. Choices whose cost can't be paid are greyed out by
 * the UI (`choiceBlocker`). Automatic flag on any choice: `event:<id>`. Flags set here: `agnes`, `asked_snuffer`,
 * `wrote_to_nan`.
 */
export const EVENTS: Record<string, EventDef> = {};

export function defineEvents(list: EventDef[]) { for (const e of list) EVENTS[e.id] = e; }

const item = (id: string, n = 1): Outcome[] => Array.from({ length: n }, () => ({ kind: 'item', id }) as Outcome);

defineEvents([
  {
    id: 'ev_last_picnic', act: 1, once: true, title: 'The Last Picnic',
    text: 'A picnic laid for two on a hilltop: cucumber sandwiches, a seed cake under a glass dome, two cups still steaming. A red-checked blanket hovers a foot off the grass, rippling the way a blanket would if it were trying very hard to look relaxed. A card against the teapot: *Expecting Wilfred. Since 1121. Please don\'t mind me.* It billows toward you, hopeful, then away, embarrassed.',
    choices: [
      { label: 'Sit down and eat.', result: 'The blanket folds itself across your shoulders. "The cucumber is seventy-nine."', outcomes: [{ kind: 'relic', id: 'r_patient_blanket' }, { kind: 'hurt', pct: 10 }] },
      {
        label: "Tell it Wilfred isn't coming.", result: 'It takes it badly.', outcomes: [{ kind: 'fight', encounter: 'e_picnic' }],
        gamble: { chance: 0.5, result: 'It goes very still, folds itself corner to corner the way you fold something for the last time, and is just a blanket. "Thank you. Nobody would *say*."', outcomes: [...item('c_very_old_cake'), { kind: 'xp', amount: 25 }] },
      },
      {
        label: 'Take the cake and run.', result: 'You run. The cake is magnificent.', outcomes: item('c_very_old_cake'),
        gamble: { chance: 0.3, result: 'The blanket follows, sorrowfully, then less sorrowfully.', outcomes: [...item('c_very_old_cake'), { kind: 'fight', encounter: 'e_picnic' }] },
      },
    ],
  },
  {
    id: 'ev_rehearsal', act: 1, once: true, title: 'A Rehearsal, Overheard',
    text: 'A girl of about eight on a gate with a notebook and a magnifying glass: Agnes Plum, who reported the sun blinking last year and was laughed at by the Almanac. "I was at the dress rehearsal yesterday. The Lamplighter dropped the Coal. It bounced. *Twice.* Coals don\'t bounce. I checked. I bounced some." She turns a page. "Also the thief had the Lamplighter\'s boots on. The ones with the little suns. I drew them." It is a good drawing.',
    choices: [
      { label: 'Take her report seriously.', result: 'Agnes underlines something three times and looks, for the first time, satisfied.', outcomes: [{ kind: 'xp', amount: 30 }, { kind: 'flag', flag: 'agnes' }] },
      { label: 'Give her a button for her trouble. (10 buttons)', result: '"Case notes. Several of them are about you."', outcomes: [{ kind: 'gold', amount: -10 }, ...item('t_agnes_notebook')] },
      { label: "Tell her to go home, it's dangerous.", result: '"That\'s what the grey people keep saying." She leaves, offended.', outcomes: [] },
    ],
  },
  {
    id: 'ev_guild_stores', act: 1, once: true, title: 'The Guild Stores',
    text: 'A padlocked stone shed: *WORSHIPFUL GUILD OF LAMPLIGHTERS. STORES. NO ADMITTANCE. THIS MEANS YOU, AGNES.* Through the window: procedure manuals, a spare brass reliquary identical to the stolen one, boxes of fireworks, four large pots of black paint. A notice inside the door: *Procedure 9. In the event the Coal is examined: faint.*',
    choices: [
      { label: 'Break in.', result: 'Fireworks, and a cash box. On the shelf, a stores book: *"Paint, coal-black, 4 pots. Signed: O. Brassfinch. Purpose: touching up."*', outcomes: [...item('c_firecracker', 2), { kind: 'gold', amount: 30 }] },
      { label: 'Laugh at Procedure 9.', result: 'Everyone laughs more than it deserves. It does you good.', outcomes: [{ kind: 'heal', pct: 15 }] },
      { label: 'Respect the sign.', result: 'A Guild clerk pops up from behind the shed, astonished. "Nobody *ever* respects the sign." He presses something on you for your trouble. "Not *the* Lantern. *A* lantern."', outcomes: item('w_lantern_stick') },
    ],
  },
  {
    id: 'ev_stile', act: 1, once: true, title: 'Names on the Stile',
    text: 'An old stile covered in initials, but not carved: written in something grey that comes off on your thumb and isn\'t chalk. And they are yours, in your own hands. None of you has ever been here. Round the posts and down into the grass, in a smaller hand, tally marks in bundles of five. Thousands. At the bottom: *PLEASE GO HOME.*',
    choices: [
      { label: 'Add your names properly.', result: 'Everyone signs again, in ink. Somebody says it feels like you already did.', outcomes: [{ kind: 'stat', stat: 'luck', amount: 2, who: 'all' }] },
      { label: 'Try to rub it out.', result: 'It won\'t come off. Your thumbs stay grey. Someone says, "Have we been here before?" Nobody answers.', outcomes: [{ kind: 'relic', id: 'r_soot_smudge' }] },
      { label: 'Walk on quickly.', result: 'You walk on. Quickly.', outcomes: [] },
    ],
  },
  {
    id: 'ev_go_home', act: 1, once: true, title: 'Please Go Home',
    text: 'A lone Snuffer in the lane with her hood down: young, soot-grey smudges on her eyelids, not slept in a very long time. She doesn\'t raise her pole. "You\'re going to Duskwood. You\'re going to fight a moth. And some of you are going to—" She stops. "I\'m not allowed to say. Please. Go back to Butterwick. Have a nice lunch. Let the century end quietly." She opens her satchel. "I\'ll give you anything in here if you promise to turn back at the next fork."',
    choices: [
      { label: 'Promise.', result: 'She hands over the tea. As you pass she says, without anger, "You always say yes."', outcomes: [...item('c_strong_tea', 2), { kind: 'heal', pct: 20 }] },
      { label: 'Ask her why.', result: '"Every time you—" She bites it off. "Ask the tortoise. No. Don\'t. Forget I said that."', outcomes: [{ kind: 'xp', amount: 20 }, { kind: 'flag', flag: 'asked_snuffer' }] },
      { label: 'Move her aside.', result: 'She sighs. "Not again."', outcomes: [{ kind: 'fight', encounter: 'e_snuffer' }] },
    ],
  },
  {
    id: 'ev_letter', act: 1, once: true, title: 'Letter by Kite',
    text: 'A post-kite with a red ribbon tail has snagged in a hawthorn. Its pouch holds a letter addressed *To the party, c/o the Downs*, on Kindlewake Inn notepaper, in a looping old-fashioned hand: *"Mind the goats at the bridge; the big one hates frost. Don\'t eat anything a hamper offers you. Do eat something, though. — H."* Wrapped underneath, a thick slice of fruitcake.',
    choices: [
      { label: 'Eat it now.', result: 'It is the best fruitcake any of you has ever eaten. Nobody says so. Everybody knows.', outcomes: [{ kind: 'heal', pct: 25 }] },
      { label: 'Save it.', result: 'You wrap it up again, carefully.', outcomes: item('c_fruitcake') },
      { label: 'Write back: "Who are you?"', result: 'The kite insists on a parcel, so the cake goes back with the letter. Within the hour another kite drops a jar on your heads: *"Frost-jam. Don\'t ask. — H."*', outcomes: [...item('c_snow_globe', 2), { kind: 'flag', flag: 'wrote_to_nan' }] },
    ],
  },
  {
    id: 'ev_mothersole', act: 1, once: true, title: 'Professor Mothersole Needs a Hand',
    text: 'Professor Hilda Mothersole, author of the Bestiary, sixty-one, in a pith helmet, waist-deep in a bramble with a grey moth in her net, in no hurry to be rescued. "Don\'t move. You\'re standing on something rare. Not you. The plant. Murkwings. New to science as of this morning. Moths fly to light; these fly toward the *dark*. Straight at the bite in the sun." A frown. "I\'d swear I\'d catalogued them before. Like a word on the tip of your tongue." A badger has made off with her spectacles.',
    choices: [
      { label: 'Hold the jar.', result: '"It thinks the jar is the sun. Let it."', outcomes: [{ kind: 'relic', id: 'r_moth_jar' }] },
      { label: 'Get her spectacles back.', result: 'She pays in advance, which is optimistic of her. The badger is not giving them up quietly.', outcomes: [{ kind: 'gold', amount: 40 }, { kind: 'fight', encounter: 'e_specs' }] },
      { label: 'Let the moth go.', result: 'It flies straight up toward the bite. "Sentiment. Terrible science. Lovely, though."', outcomes: [{ kind: 'xp', amount: 30 }] },
    ],
  },
  {
    id: 'ev_well', act: 1, once: true, title: 'The Well of Moderate Wishes',
    text: 'A mossy well: *WISHES GRANTED. MODERATE ONLY. NO SUNS.* A bored, echoing voice: "One button. Moderate wishes. Read the sign."',
    choices: [
      {
        label: 'Wish for riches. (1 button)', result: '"That\'s moderate."', outcomes: [{ kind: 'gold', amount: -1 }, { kind: 'gold', amount: 25 }],
        gamble: { chance: 0.5, result: '"Moderately."', outcomes: [{ kind: 'gold', amount: -1 }, { kind: 'gold', amount: 2 }] },
      },
      { label: 'Wish for strength. (1 button)', result: 'Somebody feels moderately stronger.', outcomes: [{ kind: 'gold', amount: -1 }, { kind: 'stat', stat: 'atk', amount: 2, who: 'random' }] },
      { label: 'Wish for the sun to be mended.', result: 'The button comes straight back up and hits you on the nose. "*No suns.*" A pause. "Someone wished that, a hundred years back. Young woman. Brass buttons on her coat. Wished it with her whole heart." A longer pause. "Didn\'t go well." Then, gruffly: "Here. One on the house."', outcomes: [{ kind: 'heal', pct: 20 }] },
    ],
  },
  {
    id: 'ev_veteran', act: 1, once: true, title: 'The Veteran of the Turnip War',
    text: 'A field of enormous turnips; in the middle, a rust-red Tin Turnipcutter at attention, *PVT. 9, 2ND DOWNS TURNIP FUSILIERS* painted on its chest. Its head ratchets round. "HALT. FRIEND OR DUCHY?" Its orders, stencilled on its back, are to hold the field until relieved. It has held it since 1059. The turnips have been very well protected.',
    choices: [
      { label: '"The war\'s over. You\'re relieved, Private."', result: 'It processes for an uncomfortably long time. Then it sits down among the turnips and stops ticking, very gently, like someone falling asleep.', outcomes: [{ kind: 'relic', id: 'r_turnip_medal' }] },
      { label: '"We\'re Duchy!"', result: '"FINALLY." Its old comrade\'s scythe is leaning on the fence. You take it. It takes exception.', outcomes: [...item('w_rusty_scythe'), { kind: 'fight', encounter: 'e_duchy' }] },
      { label: '"Friend."', result: '"PASS, FRIEND. TAKE RATIONS."', outcomes: item('c_field_turnip', 2) },
    ],
  },
  {
    id: 'ev_abbey', act: 1, once: true, title: 'The Abbey of the Open Basket',
    text: 'Red-roofed, smelling of soup; monks in red-checked habits wave you in before you\'ve explained anything. The refectory table is a quarter of a mile long; no one eats alone, and the Abbess, Mother Tureen, keeps a rota for midnight snacks. Supper is Gus Pottage\'s Peace Soup from the original recipe book on the lectern. Ingredient one: *everybody.* Mother Tureen turns to the last page, written the year Gus died: *"H. — you can\'t keep everyone. Feed them and let them go."* "Nobody knows who H. was," she says. "We think it was his cat."',
    choices: [
      { label: 'Stay for supper.', result: 'Seconds. Thirds. Someone starts a song.', outcomes: [{ kind: 'heal', pct: 40 }] },
      { label: 'Help in the kitchen.', result: 'You learn more peeling potatoes than you\'d think.', outcomes: [{ kind: 'xp', amount: 45 }] },
      { label: 'Ask for the recipe.', result: 'Mother Tureen gives you two flasks instead. "The recipe\'s the easy part."', outcomes: item('c_peace_soup', 2) },
    ],
  },
  {
    id: 'ev_pond', act: 1, once: true, title: 'The Pond of Second Looks',
    text: 'A round pond so still it looks varnished, filmed with something grey like ash on cold tea. Your reflections move half a beat late, as if remembering rather than copying. And there are more of them than of you: behind your reflections stand others, faint and grey, wearing your faces in rows going back into the water. One waves.',
    choices: [
      { label: 'Wave back.', result: 'The grey figures wave too. One gives a thumbs up.', outcomes: [{ kind: 'xp', amount: 30 }] },
      {
        label: 'Drink.', result: "You feel you've learned something you already knew.", outcomes: [{ kind: 'stat', stat: 'mag', amount: 2, who: 'random' }],
        gamble: { chance: 0.5, result: 'Ash. Cold tea. Regret.', outcomes: [{ kind: 'hurt', pct: 15 }] },
      },
      { label: 'Throw a stone.', result: 'The reflections scatter. One grey shape mouths *don\'t*.', outcomes: [{ kind: 'fight', encounter: 'e_pond' }] },
    ],
  },
  {
    id: 'ev_customs', act: 1, once: true, title: 'Goat Customs',
    text: 'Bleatham Bridge, a striped toll booth, a Toll Goat in a peaked cap with a clipboard. "Purpose of crossing? Anything to declare? Any turnips, cheeses, or loud persons?" From the lock-up behind the booth: "HELLO! I AM BEING DETAINED! IT IS AN OUTRAGE!" Gertie Bellow, Town Crier, held under Bylaw 12 (Noise). Her fine is sixty buttons, or detention until the end of the century, "which," the goat notes, glancing at the bite in the sun, "could be any day now."',
    choices: [
      { label: 'Pay her fine. (60 buttons)', result: '"THANK YOU! I SHALL BE PROCLAIMING THIS!"', outcomes: [{ kind: 'gold', amount: -60 }, { kind: 'recruit', id: 'gertie' }] },
      { label: 'Argue the bylaws.', result: 'The goat produces Bylaw 12(b): *Arguing: also noise.* Gertie is out of the lock-up and shouting encouragement before the clipboard comes down.', outcomes: [{ kind: 'recruit', id: 'gertie' }, { kind: 'fight', encounter: 'e_customs' }] },
      { label: 'Pay your own toll and cross. (15 buttons)', result: 'Behind you: "I WILL REMEMBER THIS!" (She won\'t. The Ledger will.)', outcomes: [{ kind: 'gold', amount: -15 }] },
    ],
  },
]);

export function eventPool(act: 1 | 2 | 3): EventDef[] { return Object.values(EVENTS).filter((e) => e.act === act); }

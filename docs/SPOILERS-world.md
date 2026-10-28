# Kindlewake: world bible

> **SPOILERS.** The owner plays blind. Nothing in this file goes into chat, commit messages, the README, or code comments
> outside `src/data`. Companion file: `docs/SPOILERS-story.md` (plot, twists, act-1 content). Mechanics are fixed by
> `docs/superpowers/specs/2026-10-28-kindlewake-design.md`; this file explains them, it never changes them. Revised
> after the critical review (`docs/SPOILERS-review-lore.md`): the backlog of Wakes (4.2), act-1 ecology (10), H. (5).

## 1. At a glance

| | |
|---|---|
| **World** | **Halcyra**, a small, sunny kingdom of chalk downs, candy-striped coasts and mountains made of wax |
| **Sun** | **the Kindle**, a flame that hangs over the world on a golden wick rising from the **Wickspire**, a white tower at the Rim |
| **Genre** | storybook *picnic fantasy*: village fêtes, kite-post, clockwork, talking tortoises, and a sun that needs looking after |
| **Tone** | bright and silly on the surface, sincere underneath. Earthbound's deadpan, Paper Mario's warmth, Dragon Quest's belief that a village matters |
| **Calendar** | **Y.K.**, Years of the Kindle. The game opens on **Kindlewake Morning, 1200 Y.K.**, the twelfth centennial festival |
| **The big idea** | The sun runs on people being together. Grief that will not let go has been quietly starving it. |

## 2. Tone and look

**Colour.** Halcyra is saturated and sunlit: thatched cottages with poppy-red doors, buttercup fields, turquoise surf,
lilac peaks. Every region has its own palette (section 7). The only "evil" colour is **grey**. When something is wrong in
Halcyra, it looks *less coloured*: greyed moths, a grey bite in the sun, grey ash on a pond. Artists can use saturation as
a storytelling tool: act 3 has grey patches creeping into the lilac, and the finale ends in the brightest frame of the game.

**Humour rules.**

1. **Specificity beats randomness.** Not "a wacky goat" but a goat who has read the bridge bylaws and will cite them.
2. **Understatement.** Halcyrans meet the end of the world the way they meet rain at a fête: with an umbrella and a letter
   to the committee.
3. **Character first.** Every joke is something that person would actually say. Barty apologises; Dell scores; Gertie shouts.
4. **Stop one line early.** The joke ends before the sad thing. Never undercut a death, the Ledger, or Nan Hess.
5. **Kitchen and village vocabulary.** The world was cooked. People say "she's come out of the oven a different cake",
   "that's gone off", "proper job", "half a loaf is still a loaf".

**Stakes.** The Kindle is dimming. If it goes out, Halcyra does not explode; it goes **Hushed**: grey, cold and quiet, a
dish left on the side to go cold forever. The personal stake is quieter and sharper: one old woman who cannot stop giving
people second chances, and what that has cost everyone.

## 3. Cosmology

### 3.1 The First Cook

Halcyrans say the world was cooked. The **First Cook** (nobody agrees on her name; grandmothers call her Old Mother Pot)
made Halcyra as a feast, hung the Kindle over it to keep it warm, and stepped out, saying it would be ready when it was
ready. Most kitchens still leave an empty chair at festival suppers "for when she's in". The game never settles whether
the Cook is real. What is real: the world behaves like a recipe. Everything that exists was made by one or more of seven
kitchen verbs, and it holds its shape by its **Set**.

### 3.2 The Seven Verbs (damage types)

Every attack is one of the seven verbs the world was made with. A thing is weak to the verb that undoes what it was made
of, and shrugs off verbs that have nothing to grip.

| UI type | Verb | What it does | Weak to it (it undoes them) | Resists it |
|---|---|---|---|---|
| `slash` | **Cut** | separates fibre and skin | leaves, hedges, straw, cloth, paper, hide, wings | shell, stone, metal, jelly (it closes up behind the blade) |
| `pierce` | **Skewer** | finds the gap and goes through | puffed and airy things, flyers, jointed armour, anything with a soft middle | straw and loose stuff (nothing to hit), stone, shells, swarms, ghosts |
| `blunt` | **Pound** | crushes the brittle and the hollow | shells, crust, glass, crystal, clockwork, bone, hollow things (birds, brass plate), anything you can swat | jelly, padding, fluff, water, horn and hard heads |
| `fire` | **Bake** | dries, crisps, chars | plants, straw, cloth, wicker, ice, common wax | stone, metal, wet and slimy things, fire things, sun-tallow |
| `frost` | **Chill** | slows and sets | fire things, jams and gels (they set and crack), sun-tallow, cold-blooded creatures, insects | fur, wool, ice things, deep-sea things, anything insulated |
| `storm` | **Whisk** | shakes what is tightly held; runs through metal and water | metal, clockwork, wet and sea creatures, soot and fluff (blows it away), small flyers | stone and earth (it grounds), rubber, clouds, kites, spores |
| `spirit` | **Grace** | the Cook's blessing; reminds a thing what it is | anything pretending, borrowed, hollow or forgotten: ghosts, walking objects, disguises, soot, the Hush | honest beasts and very sure folk |

The Grace rule deserves its own line, because it is the funniest and saddest of the seven: *Grace cannot hurt you if you
are exactly what you appear to be. Almost nobody is.* A goat is a goat and shrugs it off. A scarecrow walking around
pretending to be a farmer comes apart. A Lamplighter in a hood pretending to be a thief takes it very badly.

**Designer's rule of thumb:** ask "what was it made with, and what undoes that?" Give two weaknesses and one or two
resists; save immunities for things that are truly not there (a ghost-blanket is immune to Pound: there is nothing under
the sheet).

### 3.3 The Set (Break)

Everything made holds together by its **Set**, like a custard. Hit a thing with the verb that undoes it and its Set
wobbles. Enough wobbles (the Break bar) and it **Cracks**: it has to stop and remember what it is, which takes a turn, and
while it is remembering it is soft (x1.5 damage). Then it re-sets and the bar refills. A perfect hit on a weakness wobbles
the Set twice, because a clean cut finds the seam.

Big and old things have deep Sets. When something very large Cracks, it sometimes re-sets *differently*, into a new
shape: this is a boss phase change. Halcyrans say "she's come out of the oven a different cake."

UI may say "Break" and "Broken" (as in the spec) or the flavour words "Set" and "Cracked"; both are canon.

### 3.4 Moxie (MP)

Magic in Halcyra is not studied, it is *dared*. **Moxie** is nerve, cheek and warmth: the small personal version of what
feeds the sun. Spells and skills spend it. Guarding recovers a little ("taking a breath"); a perfect guard recovers more,
because nothing restores your nerve like watching a goat bounce off your skillet lid. Moxie comes back properly at a
Fireside, over tea.

### 3.5 Sparks

When a person grows, a **spark** from the Kindle settles in them: a literal mote of sun. That is why Halcyrans say "she's
got a spark" and mean it. Sparks become new tricks (level-up picks, camp upgrades). Sparks settle best beside a fire,
which is why travellers make camp. Everyone alive carries a little of the sun; this matters in the finale.

### 3.6 The Kindle, the wick and the Tallow

The Kindle hangs over Halcyra on a **wick**, a thread of gold light rising from the top of the **Wickspire** at the Rim of
the world. The Kindle does not burn wood. It burns **Tallow**: the warmth people make together. Shared meals, songs,
arguments that end in laughing, a hand held on a bad night. Halcyrans call that warmth **Cheer** and mean it as a
substance, not a greeting card.

Over a century the Kindle uses up its Tallow and must be fed. That is the **Kindlewake**. Every hundred years, every
hearth in Halcyra gives one ember. The embers are gathered into the **Gathered Coal**, carried in the **Lamplighter's
Lantern** (the only vessel that keeps an ember alive longer than a day), by the **Lamplighter** and their companions, to
the top of the Wickspire, and fed to the wick. The festival motto is *Every hearth gives something.* (The finale reveals
that every hearth has given *someone*.)

### 3.7 The Hush

Where the Kindle's light thins, the world forgets its recipe. Colour goes first, then sound, then shape: a soft grey
called the **Hush**. Things in the Hush are not evil; they are *unset*. Soot-moths, grey shapes, things that used to be
something. The Hush has always lain beyond the Rim (the blank on the Inkwhistle map). Since 1101 it has crept inward a
little every year, because the Kindle's wick is short a piece. Hush creatures are weak to Grace and Bake (remind them,
warm them) and shrug off blows (there is not enough of them left to hit).

## 4. The Unburning and the Ledger (the reset)

This is the engine of the whole story. Read it before writing anything that touches a wipe, a new run, or the Ledger.

### 4.1 What the world believes (acts 1 and 2)

The **Kindlewake Inn** in Butterwick keeps an enormous black-paged guest book on its counter, usually under a sleeping
black cat called Cinders. Every party that sets out from the inn signs it. Its landlady, **Nan Hess**, reads it every
morning with her tea. Nobody else thinks about it. It is called **the Ledger** because Nan says so.

### 4.2 The truth: the Wake Candle

Over the inn's bar, inside an old dented brass lantern, stands a stub of candle that never seems to burn down. Nan calls
it the **Wake Candle** and lights it whenever a party leaves ("for luck, dears").

It is not a candle. It is **the end of the Kindle's own wick**, cut off at the top of the Wickspire in 1100 by the
Lamplighter **Hesper Vane**, who is Nan Hess. The lantern it sits in is the lost Lamplighter's Lantern. Wick-fire knows
where mornings begin, because the Kindle makes the days. A piece of it, lit, takes the morning it was lit on as its own.

The rules, which every scene must respect:

1. When the Wake Candle is lit for a party, that morning becomes the candle's morning.
2. While anyone in that party lives, the candle burns quietly.
3. When the last of them falls, the candle **gutters**, and the world **unburns** back to its morning, like wax running
   back up a candle. Every step, fight and friendship of that journey unhappens.
4. The candle is the only object that does not unburn. It burns a little shorter each time.
5. **Soot**, which is fire that did not finish, is the only other exception. The guttering's soot settles into the
   Ledger as pale grey handwriting: what that party learned, who they met, where they fell. Nan did not write it. It
   writes itself overnight, in the order things happened.
6. Soot in the eyes makes a person **sooted**: they remember every unburning from then on. Dun the tortoise was sooted in
   1100. He has since smudged soot into the eyes of everyone in the Quiet Hour's inner circle.
7. **Soot fades.** A page is clear for a few mornings, grey for a few hundred, then just warm. Nan can only act on the
   newest pages; the Quiet Hour copy pages into their Grey Archive before they fade.

**The backlog (canon numbers).** The loop began on Kindlewake Morning 1200 with the first party Nan sent. By the morning
the player first signs the book, she has lit the candle **3,871** times; every one of those parties was drawn from the
same Halcyrans the player recruits (which is why sooted characters say "you always" on the player's very first Wake).
The old volumes, grey and unreadable, fill her cellar. The book on the counter is a fresh volume she started because she
could not bear the old one: its first page says *Wake 1* in her hand, with a much longer number rubbed out underneath.
The UI numbers the player's Wakes from 1; dialogue that counts all Wakes uses "four thousand" loosely, and the finale
credits end "and three thousand eight hundred and seventy-one more". Pell's "two hundred and six" counts only the Wakes
she walked with. Hesper's own 1100 count is 411.

### 4.3 Why a fallen party is gone for good

The people come back. The *party* does not. When the world unburns, Barty is alive again at three in the morning, feeding
his sourdough starter; Dell is still dismissed; Clem's bees are still unionised. None of them have met. The jokes they
told at the Fireside on day four were never told. The fellowship, the thing that was *them together*, is gone, and only
the Ledger says it ever happened. You can make friends with them again. You cannot get *those* friends back.

The line for the game's heart: **"The people come back. The kindling doesn't."**

This is also the emotional key to Nan Hess. Every morning she reads, in grey, how a group of strangers became friends and
died together. Then they walk into her taproom for breakfast, alive, laughing, strangers again. She knows how each of them
takes their tea. They have never met her.

### 4.4 Why a new party sets out

Every morning is the same Monday: the parade, the bite in the sun, the Coal snatched by a hooded rider. And every
morning Nan Hess has read the night's new page. She rings the inn bell, calls for volunteers, and, because she now knows
things, makes sure the right people are in the taproom when she rings it. In the UI that is the roster pick. She only
trusts the clear new pages (soot fades), which is why the newest Wakes change who she sends for.

### 4.5 What carries over

Only words cross the Unburning. *You can't carry a sword back through it. You can carry a sentence.* Every Ledger unlock
is something Nan read and acted on before the parade:

| Mechanic | In-world explanation | Sample Ledger text |
|---|---|---|
| Recruit becomes a start option | Nan sends a kite-letter at dawn; they are at the inn by breakfast | "Nan Hess has written to Roz Gale. She'll be here by breakfast, complaining about the weather." |
| Relic enters the pool | Nan tells Dun, the Abbey or the Kite-Post where a keepsake was found; it may now turn up on the road | "Nan mentioned a pocket tide-clock to a tortoise. He said he'd keep an eye out." |
| Start kit | Nan's packed lunches, tailored to what killed the last lot | "There's frost-jam in your kit. Don't ask." |
| Run history | the soot pages | "Wake 14. Fell at Bleatham Bridge to a goat with legal training." |
| Bestiary notes | soot in the margins | "Jam. Frost. Trust me. — H." |

**Why it can never make a party stronger:** soot is only words. Levels, gold, sparks, gear and muscle all unburn. A new
party is never tougher than the last, only better advised. This is the in-world form of the spec's rule that unlocks add
options, never numbers.

### 4.6 The cost (revealed in act 2)

The candle is part of the Kindle's wick. Every guttering burns it shorter, and the sun's wick shortens with it. The world
unburns; the wick does not. So each morning the bite in the sun is a hair wider than the morning before, though only the
sooted can tell. The Quiet Hour keep a soot-written archive under the Saltglass Observatory recording it: *every Wake
costs a day of sun.* Seen this way the Ledger is exactly what its name says: a book of debts, and the player has been
running up the bill.

### 4.7 The deeper truth (revealed in the finale)

The Ledger is not only a bill. Soot is fire that did not finish: warmth that was never spent. Every fallen party's Cheer,
their Fireside jokes, their last stands, the way they looked after each other, did not vanish in the Unburning. It settled
into the Ledger and its grey old volumes. Those parties came from every hearth in Halcyra. The book is always warm, the
cat always sleeps on it,
and without anyone meaning it to be, it is the realest **Gathered Coal** there has ever been. Fed to the wick with the
candle given back, it relights the Kindle whole, brighter than it has burned in a thousand years.

The price: once it burns, the fallen are gone. No more pages. No more mornings over. The party at the top of the Wickspire
gets one go, like everyone else who ever lived.

The Ledger was a debt *and* a savings account. At the end, the sun remembers them, so Nan doesn't have to.

### 4.8 Writer's rules for the reset

- Nothing physical ever crosses the Unburning. If a scene needs something carried over, it is a sentence in the Ledger.
- Nobody in Halcyra says "time loop". They say *the Unburning*, *guttering*, *she's lit it again*.
- Sooted people say "again" a lot, and say "you always do that". Use as clues, sparingly.
- The player's real Ledger history (fallen characters, places, causes) is diegetic. Events and the finale may quote it,
  but it only ever supplies names, sprites and lines, never stats: the Ledger is not a difficulty knob.
- Never write a number of Wakes that contradicts the backlog canon in 4.2.
- Nothing in act 1 may point straight at Nan being old or being from 1100 (no age, no "Hess" beside the 1100 party, no
  Wendell). Act-1 clues to the act-3 twist stay cryptic until act 2 names the candle.
- After the finale is won, the Ledger becomes **the Daybook**, a record of days that went forward. Further runs are framed
  as "tales told at the inn": stories of what might have happened. No contradiction with the ending.

## 5. History

Dates in Y.K. (Years of the Kindle). Bold names are the named historical figures; section 6 says where they are now.

| Year | Event | How it shapes 1200 |
|---|---|---|
| 0 | **The First Kindling.** The **First Cook** hangs the Kindle over the feast. | Kitchen idiom everywhere; the Seven Verbs; the empty chair at suppers. |
| 100 | **The First Kindlewake.** **Ansel Tallowby**, a candle-maker of Butterwick, carries the first Gathered Coal to the Wickspire in a brass lantern of his own design. He founds the Worshipful Guild of Lamplighters. | Butterwick is "the Hearth of Halcyra"; every parade leaves from its green. The Lantern is the Guild's one real secret. |
| 712-780 | **Saint Ottilie of the Open Basket** founds an abbey on the Downs with one rule: *no one eats alone*. | The Abbey (act 1 event) feeds every traveller. Picnics are holy. |
| 1041 | **Queen Bellamy the Unbothered** crowned. She reigns 52 years without once raising her voice. | The Sunday Picnic Law (no wars on Sundays) is still on the books. |
| 1058-1061 | **The Turnip War.** Downs farmers against the Duchy of Vantwhistle over the Turnip Levy. Both sides build clockwork **Turnipcutters**. | The automata were never switched off. Some still patrol the fields (act 1 enemy and event). |
| 1061 | **The Peace Supper.** A nineteen-year-old army cook, **Gus Pottage**, serves both armies the same soup in the same field. Nobody can fight with their mouth full. The war ends by the pudding. | Pottage's Peace Soup is the Abbey's founding recipe for travellers; "ingredient one: everybody". |
| 1062 | **The War Against the Tide.** **Duke Mortimer Vantwhistle**, humiliated by the Supper, declares war on the sea for encroachment. The sea wins twice a day. | The Duke retires to clip topiary of his enemies. The **Vantwhistle Topiary** hounds still prowl (act 1). Halcyran idiom: "fighting the tide" for any doomed pride. |
| 1066 | **The Button Standard.** Short of coin after two wars, Queen Bellamy pays the army with the buttons off her coats and declares buttons legal tender. | Halcyra's money is **buttons** ("gilt buttons" for big sums). The UI's gold is buttons. |
| 1093 | Queen Bellamy dies in a hammock, mid-nap, as she would have wanted. | A golden button with her face is the rarest coin in the land (a relic). |
| 1100 | **The Eleventh Kindlewake.** Lamplighter **Hesper Vane**, aged 22, sets out with the knight **Sir Wendell Ashbury**, the cartographer **Marisol Inkwhistle**, the cook Gus Pottage (58 and "only coming for the catering") and a young tortoise porter, **Dunstan Greaves**. Official history: they relight the Kindle; Sir Wendell dies holding the Wickspire stair; the rest come home heroes. | *The true record:* the party died on the Wickspire 411 times. Hesper cut the end off the Kindle's wick to unburn the day, again and again. On the 412th climb they won and only Wendell stayed dead. She never gave the wick-end back. (Section 4; finale.) |
| 1101 | **The Hundred-Foot Loaf.** Master baker **Florian Crumb** bakes a loaf a hundred feet long for the homecoming feast. Halfway through the feast, Hesper Vane walks out and is never seen again. The Lamplighter's Lantern goes with her. That autumn a young widow calling herself "Hess" buys a derelict coaching house in Butterwick, names it the Kindlewake Inn, and puts a sandstone statue of a knight in its garden. | The Guild, without the Lantern, cannot carry embers. It spends the next century faking it. The Crumbs have baked the festival loaf ever since; Barty is Florian's great-grandson. |
| 1120 | Dunstan Greaves retires from public life, "presumed passed". A tortoise pedlar called **Dun**, who carries his shop on his back, starts trading the Downs. | Dun is the shopkeeper of every act (and more, see story). |
| 1131 | **The Inkwhistle Survey.** Marisol publishes the first full map of Halcyra. The country around the Wickspire is left blank, captioned *"Here Be Nothing I'd Care To Draw Again."* | "The Blank" is what everyone calls the Rim country. Her compass is a relic. |
| 1144 | **The Parasol Rebellion.** **Baron Ulric Shadwell** of the Saltglass Coast stretches vast canvas awnings over the coast farms and charges for sunlight by the hour. Farmers cut the awnings down with bread knives. Shadwell flees by night. | Halcyra's only real historical villain ("a man who looked at the sun and saw an invoice"). His striped awnings became the tents of the Port Merriment carnival (act 2). |
| 1149 | Gus Pottage dies, aged 107, leaving his recipe book to the Abbey. On the last page: *"H. — you can't keep everyone. Feed them and let them go."* | Act 1 clue (the Abbey event); cryptic until act 3. The Abbey thinks H. was his cat. |
| 1150 | **The Society of the Quiet Hour** is founded "by an anonymous tortoise of means" to promote the afternoon nap. | Thousands of members join for the naps. A sooted inner circle, the **Snuffers**, exists for another reason (story). |
| 1158 | Retired pirate **Captain Jory Saltbuckle**, now Harbourmaster of Port Merriment, opens the Pier Carnival in Shadwell's old awnings. | Port Merriment is a carnival city (act 2). The harbour's motto: "No Plundering Before Noon". |
| 1161 | **The kite-post.** Inventor **Tobias Glee** builds a self-steering post-kite; letters cross Halcyra within the hour. The Kite-Post Office is founded. | How Nan Hess "sends for" recruits each morning. Runaway post-kites are an act 1 enemy. |
| 1163 | **The Great Jam Flood.** In a heatwave the preserving vats of the Jamboree Orchards burst. Jam runs through three villages. Some of it sets and gets ideas. | Jambles and the Conserve Colossus (act 1). Jam is still a sore subject on the Downs. |
| 1166 | Marisol Inkwhistle dies. Her papers go to the Saltglass Observatory. | The act 2 goal. |
| 1175 | Glee completes **the Tidewright**, a tide-driven clock the size of a lighthouse that counts days by the sea. | Act 2 boss. |
| 1179 | Tobias Glee climbs inside the Tidewright to fix a squeak and is never seen again. | He is still in there, asleep and the same age. He climbs out after the act 2 boss. |
| 1180 | **Queen Philippa the Punctual** is crowned at eighteen, four minutes early. | Reigning monarch. Dell was her Carver Royal until last spring. |
| 1188 | **Professor Hilda Mothersole** publishes *Mothersole's Bestiary*, classifying every creature in Halcyra by its "undoing". | The in-game bestiary is "Mothersole's". She appears in an act 1 event. |
| 1199 | **The Plum Flicker.** Seven-year-old **Agnes Plum** reports that the sun blinked. The Almanac blames a large kite. | The first visible symptom of the short wick. Agnes appears in an act 1 event. |
| 1200 | **The Twelfth Kindlewake.** Lamplighter **Odo Brassfinch** leads the parade from Butterwick green. At noon the sun hiccups, a grey bite appears in it, and a hooded rider on a giant moth snatches the Gathered Coal. | The game begins (story, section 1). |

## 6. Who's who: where they are now

| Figure | Famous for | In 1200 |
|---|---|---|
| The First Cook | making the world | Absent. An empty chair at every festival supper. |
| Ansel Tallowby | first Lamplighter (100) | Long dead. His Lantern hangs over the Kindlewake Inn's bar, holding the Wake Candle. |
| Saint Ottilie | the Abbey; no one eats alone | Dead six centuries. Her picnic blanket is a relic. |
| Queen Bellamy the Unbothered | Button Standard | Dead. Her face is on the golden button. |
| Duke Mortimer Vantwhistle | declared war on the sea | Dead. His topiary hounds are not. |
| Gus Pottage | the Peace Supper; cook of the 1100 party | Dead (1149). His recipe book and a note to "Hess" are at the Abbey. |
| **Hesper Vane** | Lamplighter of 1100; "vanished" 1101 | **Alive, aged 122, as Nan Hess** of the Kindlewake Inn. Keeper of the Ledger and the Wake Candle. The act 3 reveal; the final boss. |
| **Sir Wendell Ashbury** | held the Wickspire stair (1100) | Dead. His statue in the inn garden walked off its plinth on Kindlewake Morning and calls itself Sir Ashlar (playable warden). |
| **Dunstan Greaves** | porter of 1100; "presumed passed" 1120 | **Alive, aged 140 (young for a tortoise), as Dun the pedlar**, the shopkeeper. Sooted since 1100. Secretly founder of the Quiet Hour and its Snuffers: **the Lull**, act 3 boss. |
| Marisol Inkwhistle | the Inkwhistle Survey; the Blank | Dead (1166). Her papers and the road to the Rim are in the Saltglass Observatory. |
| Florian Crumb | the Hundred-Foot Loaf | Dead. Great-grandfather of Barty Crumb (playable tank). |
| Baron Ulric Shadwell | the Parasol Rebellion | Dead in exile. His great-nephew runs a parasol shop in Port Merriment and is very defensive about it. |
| Captain Jory Saltbuckle | pirate turned harbourmaster | Dead. His parrot, Admiral, is alive, 70, and runs the Gull Parliament (act 2). |
| **Tobias Glee** | kite-post; the Tidewright | **Thought vanished; alive inside the Tidewright**, asleep, still 39. Wakes after the act 2 boss: "Is it still Monday?" |
| **Hilda Mothersole** | the Bestiary | Alive, 61, in a pith helmet, in a bramble (act 1 event). |
| Queen Philippa the Punctual | being early | Reigning, in Gildenbrook. Never seen; sends letters that arrive before they are needed. |
| **Odo Brassfinch** | current Lamplighter | Alive, pompous, terrified. The hooded thief (act 1 boss twist). Uncle of Kit (playable wildcard). |
| **Agnes Plum** | the Plum Flicker | Eight, and conducting her own investigation (act 1 event). |

## 7. Regions and landmarks

Each act has a distinct palette and ecology. Act 1 is the green-and-gold heartland, act 2 the turquoise-and-coral coast,
act 3 the lilac-and-peach wax mountains at the Rim, and the finale is white gold with a grey hole in it.

### Act 1: the Marigold Downs

*Palette:* buttercup yellow, apple green, poppy red, sky blue, chalk white, thatch gold. Rolling hills, hedgerows,
orchards, windmills. The sun is huge and kind, with a small grey bite out of its edge.

| Landmark | Look | What happens there | Hazard |
|---|---|---|---|
| **Butterwick** and the **Kindlewake Inn** | A village of white cottages and red doors round a green with a maypole. The inn is crooked and timber-framed, with a brass lantern over the bar and a cat on a black book. | The parade; the theft; every run starts here. | None, unless you count Nan's portion sizes. |
| **The Jamboree Orchards** | Endless rows of cherry and plum trees, a ruined preserving works with burst copper vats, ground glossy and red. | Jam creatures since the Flood; the Conserve Colossus elite. | Sticky ground (chill). |
| **Thimble Mill** | A tall windmill with patchwork sails on a hill of scarecrows. | Kit's workshop (recruit); Haywardens wander the fields since the sun hiccupped. | Sails that swat. |
| **Bleatham Bridge** | A humpbacked stone bridge over the river Dimble, with a striped toll booth and a lot of signage. | The Billy Brotherhood's toll; Baron Bleatham elite; Gertie in the lock-up. | Bylaws. |
| **The Abbey of the Open Basket** | A long red-roofed abbey with a refectory table a quarter of a mile long under an orchard. | Saint Ottilie's monks feed travellers; Gus Pottage's recipe book and note. | Seconds. Thirds. |
| **The Vantwhistle Topiary** | A hedge maze clipped into battle scenes: hedge-cavalry, hedge-sea-monsters, a hedge-duke shaking his fist at a hedge-wave. | Leafhounds; Pell's stranded fairground caravan (recruit). | The hedges rearrange when you look away. |
| **Kite Hill** | A chalk hill crowned with the Kite-Post relay station, hundreds of kites tethered on the wind like a flower bed in the sky. | Roz reading a sky that won't show tomorrow (recruit); runaway kites. | Gusts. |
| **Duskwood** | The Downs' only dark wood, birches gone ash-pale at the edge nearest the bite. Moths hang from every branch like grey leaves. | Act 1 boss: the Duskmother and the hooded thief. | Light-eating moths (Moxie drain). |

### Act 2: the Saltglass Coast

*Palette:* turquoise, coral pink, lemon, bleached white, candy stripes, deep teal shadow. Beaches of sand that is half
sea-glass and glitters.

| Landmark | Look | What happens there | Hazard |
|---|---|---|---|
| **Port Merriment** | A harbour city built along a mile of pier, all striped awnings, carousels and seafood stalls; ships moored to the helter-skelter. | Carnival enemies, the parasol shop, Odo's comic return, harbour rumours of the Observatory. | Pickpocket gulls; "No Plundering Before Noon" (afternoons get lively). |
| **The Gull Parliament** | A rookery of white sea-stacks where ten thousand gulls hold sessions, chaired by a seventy-year-old parrot called Admiral. | A political event: the gulls control the coast road and want chips. | Divebombing; filibusters. |
| **The Kelpwind Shallows** | Turquoise tidal flats with a forest of tall kelp and the bleached wrecks of the War Against the Tide. | Crabs, jellies, eels; Vantwhistle's sunken flagship. | Tides that come in mid-fight. |
| **The Saltglass Observatory** | A white lighthouse-observatory on a glass cliff, with the giant brass tide-clock (the Tidewright) built into its base. Underneath: the Grey Archive. | Marisol's papers; the Snuffers' headquarters; act 2 boss and twist. | The clock's tide floods the lower floors on the hour. |

### Act 3: the Tallow Peaks

*Palette:* lilac, peach, cream, rose gold, honey. The mountains at the Rim are made of **sun-tallow**: wax that has dripped
from the Kindle over thousands of years and set into peaks, smooth and translucent, glowing from inside at dusk. Grey Hush
patches creep down from the summits like frost.

| Landmark | Look | What happens there | Hazard |
|---|---|---|---|
| **The Tallow Peaks** | Translucent peach-and-lilac wax mountains, drip-shaped spires, frozen waterfalls of wax. | Wax creatures, mountain goats (Bleatham's cousins), the road to the Rim. | Soft wax underfoot by day, slick by night. |
| **Glasswing Glade** | A forest whose moths have wings of stained glass; sunlight through them throws colours on everything. | Beautiful, dangerous, the last colourful place before the Hush. | Shards. |
| **The Cloister of the Quiet Hour** | A grey stone monastery wedged in a pass, every window shuttered, a bell with no clapper. | The Snuffers' last stand; the inner circle's choice. | Silence: shouting is an offence. |
| **The Blank** | The country Marisol refused to draw: grey on grey, shapes half-remembered, a soft hiss like a kettle cooling. | Hush creatures; the approach to the Wickspire. | The Hush itself (colour drains from your sprites). |
| **The Wickspire** | A slender white tower rising out of the Blank, stair spiralling up the outside, the golden wick rising from its top into the Kindle overhead. | Act 3 boss at its foot (the Lull); the finale climb; the summit. | The stair. Somebody always has to hold it. |

### Elsewhere (referenced, not visited)

| Landmark | Notes |
|---|---|
| **Gildenbrook** and **Chiming Castle** | The capital, inland. The castle has 400 clocks and they all agree. Queen Philippa and the Royal Almanac are here. |

## 8. Factions

| Faction | Leader | Goal (public / secret) | In-jokes |
|---|---|---|---|
| **The Worshipful Guild of Lamplighters** | Lamplighter Odo Brassfinch | Public: carry the Gathered Coal to the Wickspire every century. Secret: they lost the Lantern in 1101 and have been faking the Coal ever since. | Motto: *Light Is Our Business.* They have not lit anything in a hundred years. Their manual has 400 procedures; Procedure 9 reads "In the event the Coal is examined, faint." |
| **The Society of the Quiet Hour** ("Snuffers") | Public: a committee. Secret: **the Lull** (Dun) | Public: the afternoon nap, for everyone. Secret: the sooted inner circle tries to stop parties setting out, because every Wake costs a day of sun. | Meetings are silent; minutes are taken in mime. Their badge is a bell-shaped candle snuffer. Their initiation is a smudge of soot on the eyelids. Rank-and-file members truly just like naps. |
| **The Royal Almanac** | Chief Almanacker (unnamed; never wrong, never seen) | Read tomorrow in the sky and print it. | They forecast their own budget cuts. Roz is their best reader. Since Kindlewake Morning, every reader's forecast for tomorrow says "see today". |
| **The Order of the Open Basket** | Abbess Mother Tureen | Feed every traveller; never eat alone. | Habits are red-checked like picnic blankets. Their vow forbids eating alone, so the Abbess has a rota for midnight snacks. |
| **The Kite-Post Office** | Postmistress Velma Updraft | Deliver everything within the hour. | Motto: *Neither rain nor gale nor unusually large bird.* Runaway kites are "on unofficial delivery". |
| **The Billy Brotherhood** | Baron Bleatham | Hold every bridge on the Downs and charge for it. | Goats who have read the law and found it delicious, sometimes literally. Fines are payable in buttons or turnips. |
| **The Gull Parliament** (act 2) | Speaker Admiral, a parrot | Chips. | Every motion is "chips". Every vote passes. |
| **The Fairground of Lesser Wonders** | (scattered since Kindlewake Morning) | Tour the Downs with modest marvels: the Slightly Strong Man, the Quite Small Horse. | Pell was their mime. Their posters undersell everything on purpose. |

## 9. Peoples of Halcyra

- **Folk**: humans, most of Halcyra. All the shapes and colours you'd expect; long-lived by our standards in good
  sunlight, so a 122-year-old landlady is remarkable but not impossible (the Queen sends Nan a cake every birthday; Nan
  sends it back with notes).
- **The Spoken**: animals who talk. Some goats, tortoises, badgers, gulls and parrots do; most animals don't; it is
  considered rude to ask which before you've been introduced. Spoken tortoises live two centuries.
- **Made things**: scarecrows, statues, topiary, clockwork. They have always had a little life in them (they were made,
  after all). When the sun hiccupped on Kindlewake Morning, the strange light loosened their Sets, and a lot of them got
  up and wandered off. Some are frightened, some are cross, one is a knight.
- **Hush things**: what is left when something forgets its recipe. Grey, soft, sad. Not evil. Hungry for light.

## 10. Enemy ecology

The rule for every region: *what was it made with, and what undoes it?* Encounters mix makers so one damage type never
clears a pack (spec section 5).

### Act 1: Marigold Downs (garden, farm and orchard; plus the first moths)

The Downs are farmland. The sun's hiccup unset its made things and emboldened its animals, and grey moths have come out
of Duskwood flying *toward* the bite in the sun.

Authoritative per-foe numbers are in the story file (section 5); this table is the reasoning. Each verb is a weakness of
four or five of the sixteen normal foes; Pound (the tank's verb) has real targets; Bake has real resisters.

| Group | Members | Made of | Weak | Resists |
|---|---|---|---|---|
| Preserves | Jamble, Conserve Colossus | set jam | frost (sets and cracks), fire (caramelises) | slash (closes up), blunt (jelly) |
| Garden bugs | Scab Bee; Waistcoat Wasp | buzz and nerve | Bee: frost, blunt (swat it) · Wasp: storm (blown off), spirit (pretending to be a guest) | Bee: pierce · Wasp: slash (too small to hit) |
| Fungus | Puffcap | spongy gills, spores | pierce (puffed), slash | blunt, storm (spores just spread) |
| Made things | Haywarden (straw), Leafhound (hedge), Runaway Kite (paper), Sheetling (cloth that remembers), Lurking Luncheon (wicker) | straw, leaves, paper, cloth | Bake for most; slash for hedge and paper; spirit for the ones pretending to be alive | pierce for straw and hedge; Kite resists storm; Sheetling slash, pierce, immune blunt; Luncheon frost (ice pack in the lid) |
| Clockwork | Tin Turnipcutter | tin and spring | storm, blunt | slash, fire (metal) |
| Shells | Trundlesnail | shell and slime | blunt, frost | pierce, fire (wet) |
| Spoken beasts | Toll Goat, Baron Bleatham, Grumbadger, Cawdle | fur, horn, hollow bones, stubbornness | goats: slash, frost · badger: pierce, storm · crow: blunt (hollow bones), storm | goats: blunt, spirit · badger: frost (fur), spirit · crow: spirit (honest beasts are exactly what they seem) |
| Hush-touched | Murkwing; Duskmother | soot and dark | Murkwing: pierce, spirit · Duskmother: fire, spirit | blunt, frost (Duskmother: slash, frost) |
| Quiet Hour | Snuffer, Sister Nocturne | folk who remember too much | storm (blows the soot off), slash | spirit (they are very sure of what they have seen); Nocturne also blunt |

### Act 2: Saltglass Coast (sea, carnival and clockwork)

Sea creatures are wet (weak to Whisk), shelled ones crack under Pound, and the carnival's automata are tin and spring.
The Snuffers are strongest here.

| Group | Examples | Weak | Resists |
|---|---|---|---|
| Shellfolk | Rock Crab, Hermit Tenant (a crab living in a beach hut), Barnacle Bishop | blunt, storm | slash, pierce |
| Jellies | Lemonade Jelly, Man-o'-Mild | storm, frost | blunt, slash |
| Gulls | Chip Gull, Gull Whip (parliamentary enforcer) | pierce, storm | blunt |
| Carnival automata | Carousel Charger, Coconut Shy Sentinel, Helter-Skelter Serpent | storm, blunt | slash, pierce |
| Sea-glass | Glass Golem, Shard Skate | blunt, storm | slash, pierce, fire |
| Deep things | Kelp Strangler, Dimble Eel | fire (kelp) / blunt (eel) | storm (eel), frost |
| Snuffers | Snuffer Deckhand, Grey Archivist | storm, slash | spirit |
| Boss | The Tidewright | storm, blunt | slash, pierce, frost |

### Act 3: Tallow Peaks and the Blank (wax, glass and Hush)

The twist on expectations: **sun-tallow resists fire** (it is sun-stuff) and **cracks under frost**. Players who learned
"wax melts" in act 1 must relearn. Hush things shrug off blows and fear Grace and Bake.

| Group | Examples | Weak | Resists |
|---|---|---|---|
| Wax | Tallow Golem, Drip Sprite, Candle Ram | frost, blunt | fire, slash |
| Glasswings | Glasswing Moth, Lattice Queen | blunt, storm | slash, pierce |
| Mountain goats | Crag Billy (Bleatham's cousins, more bylaws) | slash, frost | blunt, spirit |
| Hush | Greyling, Unset (a thing that used to be a cottage), Soot Echo | spirit, fire | slash, pierce, blunt |
| Quiet Hour | Snuffer Abbot, Silent Sister | storm, slash | spirit |
| Boss | The Lull | storm, blunt (shell-up phase) / spirit (phase 2) | slash, pierce |

### Finale: the Wickspire

Soot Echoes (grey versions of the player's own fallen characters, named from the Ledger), the Lamplighter Hesper Vane,
and the Unlit (the cold where the wick-end should be). All Hush-touched: Grace and Bake matter most. Details in the story
file.

## 11. Glossary (UI-ready)

| Term | Meaning | Use in UI |
|---|---|---|
| **Halcyra** | the world | title, map headers |
| **the Kindle** | the sun | |
| **Kindlewake** | the centennial festival; also the inn; also the game | |
| **the Ledger** | the meta-progression book | Ledger screen title: "The Ledger" |
| **a Wake** | one run | "Wake 14", "Begin a new Wake" |
| **the Kindling** | your party | party sheet title: "Your Kindling" |
| **the Front / the Wagon** | active three / bench three | "Front", "Wagon" tabs; Swap = "Call from the Wagon" |
| **guttered** | party wiped | end screen header: "The candle gutters." |
| **the Unburning** | the reset | Ledger flavour only |
| **Fireside** | camp node | "Fireside: Rest / Spark / Forge" |
| **Keepsake** | relic | "Keepsakes (5/8)" |
| **Spark** | upgrade | "A spark settles in Barty." |
| **Knick-knack** | trinket slot | |
| **buttons** | gold | "120 buttons" |
| **Moxie** | MP | "MX" or "MP"; tooltip "Moxie" |
| **Set / Cracked** | Break bar / Broken | "CRACKED!" popup is optional flavour; "Break" is fine |
| **Undoing** | weakness | bestiary: "Undoing: Chill, Bake" |
| **Bright / Warm / Cold** | perfect / good / miss timing grades | popups: "BRIGHT!", "Warm", "Cold" |
| **Steady!** | perfect guard | popup |
| **Happenstance** | event node | |
| **Volunteer** | recruit node | "A volunteer approaches." |
| **routed** | enemy defeated | foes scarper, sulk or fall over: "The Toll Goat is routed." Nobody dies on the Downs |
| **Bigwig** | elite | map tooltip |
| **Dun's Sundries** | the shop | shop header |
| **Mothersole's Bestiary** | the bestiary | |
| **the Hush** | grey, colour-draining blight | |
| **sooted** | remembering across Unburnings | never shown in UI before act 2 |

# Kindlewake: story and act-1 content bible

> **SPOILERS.** The owner plays blind. Nothing here goes into chat, commit messages, the README, or code comments outside
> `src/data`. World, cosmology, the reset rules and history live in `docs/SPOILERS-world.md`; read section 4 of that file
> first. Mechanics are fixed by `docs/superpowers/specs/2026-10-28-kindlewake-design.md`. Revised after the critical
> review (`docs/SPOILERS-review-lore.md`), which also holds the engine decisions and the content-derivation notes.
>
> **Notation.** Abilities: `type power` is one hit (power 100 = a plain swing; physical types scale on atk, "mag" marks
> magic scaling); `2×` is a rhythm hit; statuses read `[status turns, chance]`; "delay" is the engine's turn-cost
> multiplier or `delay` effect. Event outcomes use the engine's `Outcome` kinds. Every mechanic in sections 5-9 is
> expressible with the current engine plus the two approved additions (phase reshape, `rehearsed`), which are marked ★.

## 0. The spine

The sun over Halcyra runs on people being together, and it is going out. A kind old innkeeper keeps a piece of it in a
lantern over her bar, so every party she sends to save the world gets another go when it dies. Each go costs the sun a
little more. The party chases a stolen Coal (act 1); learns the world unburns every time a party falls and that this is
shrinking the sun (act 2); learns the innkeeper who sent them is the hero of a century ago who started it (act 3); and at
the top of the world finds that the Ledger of every fallen party is the only fuel warm enough to relight the sun, if she
can bear to let them go (finale).

## 1. Opening (scripted, before the first map)

**Kindlewake Morning, Monday, 1200 Y.K.** Butterwick green is bunting and pie stalls. Lamplighter **Odo Brassfinch**, in
brass plate shaped like a lantern, will carry the Gathered Coal to the Wickspire.

1. **Dawn.** Gertie Bellow cries the proclamation from the maypole. The Crumb bakery's ember goes into the reliquary, as it
   has every century. Odo will not let anyone near the reliquary. "Procedure!"
2. **Noon.** The sun *hiccups*, a sound like a giant blowing out a birthday candle. A grey bite appears in its edge. The
   green goes quiet. Somebody's dog starts to cry.
3. **Moths.** Grey moths pour out of Duskwood. An enormous moth swoops over the green and carries off a hooded figure
   clutching the reliquary, screaming. The Lamplighter is nowhere to be seen. "They've taken him too!"
4. **The Kindlewake Inn.** Nan Hess rings the inn bell. "Right. Who's going?" She lights the stub of candle in the brass
   lantern over the bar, "for luck", and slides a vast black guest book across the counter, moving the cat. "Sign here,
   dears. Mind you come back. I've a pie in for Thursday."
5. The roster pick is "who signs". The map opens.

Nan says the Thursday line at the start of every Wake. No party has ever lived to Thursday. The epilogue is Thursday.

**Time.** A winning Wake runs Monday noon to Thursday dawn: act 1 Monday-Tuesday, act 2 Tuesday-Wednesday, act 3 Wednesday
night, the finale before dawn on Thursday. Never put a day count in text that breaks this.

**Why parties keep forming.** Halcyrans volunteer the way they bring a dish to a funeral: because somebody should. Up to
six go: three at the **Front**, three in the **Wagon** (Nan lends the inn's donkey cart; the donkey is called Monday).
When the last of them falls the Wake Candle gutters, the world unburns to Monday morning, the same people wake as
strangers, Nan reads the night's new page, makes sure the right people are in her taproom, and rings the bell again.

## 2. The twist ladder

| | Surface | Twist | Planted in act 1 (strength) | Escalation |
|---|---|---|---|---|
| **Act 1** | Grey-hooded nap cultists stole the Coal | The thief is **Odo**. The Coal is **painted papier-mâché**; the Guild has faked it since 1101. | Heavy: E2, E3, Dell, Kit, Gertie, Odo's shape weak to Grace | Local fraud |
| **Act 2** | Find Marisol Inkwhistle's map to the Rim | The world **unburns** when a party falls. The Snuffers remember, and stop parties because **every Wake costs a day of sun**. The Ledger is a bill. | Medium: Snuffers, Nocturne's ★rehearsed counter, the stile, the pond, Roz's stuck sky, Pell, Dun's "again", the Ledger page numbering | Cosmic cost; your own deaths |
| **Act 3** | Stop the Snuffers' leader snuffing the stolen candle | **Nan Hess is Hesper Vane**, Lamplighter of 1100, who cut the end off the sun's wick to save her party and kept it. The Lull is **Dun**. | Light and cryptic only: Gus's note to "H.", the well's "brass buttons", Clem's oldest wax, the Button's numeral XI, "don't sit by the candle" | The person who sent you is the cause |
| **Finale** | Relight the Kindle; there is no real Coal | **The Ledger is the Gathered Coal.** Burn it with the wick-end returned and the sun relights whole, ending the Unburning; Nan must let her dead go. She can't, and fights you. | The motto, the warm book, Barty's family ember | Your real history becomes the sun |

**Planting rule.** In a roguelike the act-1 map is replayed many times before act 3 is seen, so act-1 clues are read
dozens of times. Act 1 may plant act 1 heavily, act 2 moderately, act 3 only with clues that mean nothing until act 2
names the candle. Anything that points from act 1 straight at Nan (her age, her name beside the 1100 party, Wendell) is
held until act 2 or later.

## 3. Act 1: "The Coal Chase" (the Marigold Downs)

- **Goal:** catch the hooded thief and recover the Gathered Coal before it leaves the Downs.
- **Map:** 6-7 columns. Recruit nodes draw from the five non-starters (section 4).
- **Boss:** the Hooded Thief and the Duskmother, in Duskwood (section 5.4).
- **Act-end scene** (after the boss, before act 2). Odo, unhooded, sitting in a fern. The Guild lost the Lamplighter's
  Lantern when Hesper Vane walked out of her own homecoming feast in 1101; without it no ember lives a day. The Guild has
  carried a painted lump on every Coal Day since and meant to do the same at the Wickspire. Then the sun hiccupped for
  real, and he panicked: he meant to "lose" the Coal in the crowd, blame the nap cult and resign with dignity. The moth
  grabbed him because he was holding something gold. "I've been up there since lunch. Yesterday's lunch. I missed
  *today's*." Barty (if present) picks up a flake of paint and says nothing for a long time, then: "We got up early for
  that." The bite in the sun is still there. Somebody has to go to the Rim anyway. Odo knows one thing worth knowing: the
  only map of the road through the Blank is in Marisol Inkwhistle's papers at the Saltglass Observatory.
  - *Variants (UI picks by party; base text must stand alone):* Kit present: "I painted it, Uncle Odo. Every year." Odo:
    "You did a lovely job, Kitten." Dell present: "Paint, coal-black, one pot. For discretion, one pension." Odo: "...How
    do you know that?" Dell: "I was the discretion." Flag `agnes` set (E2): Agnes Plum steps out of the ferns with her
    notebook. "It *bounced*." She writes something down and leaves.

## 4. The roster

Eight characters, one per role, first names on different letters. Three start; five are met on the act-1 map and later
become start options through the Ledger (section 12).

**Coverage.** Starting abilities and weapons together cover all seven verbs: slash (Dell, Ashlar), pierce (Dell, Clem,
Ashlar, Pell), blunt (Barty, Dell, Ashlar, Gertie, Kit), fire (Barty, Kit, Roz), frost (Kit, Roz), storm (Kit, Pell,
Roz), spirit (Clem, Gertie, Kit). The starting trio covers five and lacks frost and storm, which pushes an early recruit
without ever locking a fight.

**Sparks.** Six per character: two or three new abilities, one or two upgrades (`replace`), two or three passives from
`PassiveId`, and at most one plain stat bump. No spark uses `guardAll` or `breakBonus` (not implemented in the engine).

### 4.1 Barty Crumb · tank · starting

- **Who:** human, 34, baker of Crumb's of Butterwick; great-grandson of Florian Crumb of the Hundred-Foot Loaf. Enormous,
  soft-spoken, flour-dusted. Wakes at three every morning and wakes everyone else. Apologises to everything he hits.
  Carries **Gerald**, an 81-year-old sourdough starter, in a jar on his belt.
- **Arc:** the Crumb ember has gone into the Coal every century; his father got up at three to bank the oven for it. The
  paint crushes him quietly. In the finale he is the one who understands what the Ledger is: "Every hearth gave someone.
  That's what an ember *is*." He notices early that the Ledger is warm "like a loaf just out".
- **Visual:** big round silhouette; white baker's smock with floury handprints, red-and-white checked neckerchief, tall
  squashed toque, brown apron, rolled sleeves; tan skin, short ginger beard; copper skillet lid as a buckler; Gerald's jar
  bubbling at his belt.
- **Weapon:** Crumb Rolling Pin (blunt 100).
- **Abilities:** **Knead** blunt 100 + [defUp 2, self] · **Orderly Queue** [taunt 2, self] "Form a queue, please. One at
  a time." · **Hot Cross Bash** fire 140 + [burn 3, 40%], delay 1.3 · **Crust Over** [barrier, self] + [defUp 2, self].
- **Sparks:** **Second Rise** (passive `cheatDeath`) · **Proving Drawer** (passive `hpRegen`: "rises while resting") ·
  **Baker's Dozen** (replace Knead: 2× blunt 65 + defUp) · **Lid Bash** (passive `counter`) · **Score the Loaf**
  (ability: slash 100 + [defDown 2]) · **Cold Proof** (ability: frost 90 + [chill 2]; Gerald is let out on a foe).
- **Lines:** recruit "Oh! A party. I'll bring rolls. I always bring rolls." · Bright "Ooh, sorry! That was a good one,
  though." · KO "Tell Gerald... feed him... at four..." · level up "I've risen! Sorry. Baking joke."

### 4.2 Delphine "Dell" Quartermaine · striker · starting

- **Who:** human, 41, until last spring Carver Royal to Queen Philippa the Punctual; dismissed. Precise, dry, formal.
  Scores every hit out of ten, including her own. Unflappable about monsters, appalled by sloppy knife-work. Fiercely kind
  and would never admit it.
- **Secret / arc:** dismissed for asking about a line in the palace accounts: *"To the Worshipful Guild of Lamplighters:
  paint, coal-black, one pot; for discretion, one pension."* The act-1 twist explains it. From bitterness at the crown to
  choosing to serve something better; in the finale she trims the guttered wick-end clean: "Let me. Clean."
- **Visual:** tall, narrow, upright; long black tailcoat with silver piping, starched white cravat, silver monocle on a
  chain, grey bun, brown skin; velvet knife-roll at the hip.
- **Weapon:** Carving Knife (slash 100).
- **Abilities:** **Against the Grain** slash 110, chip 2 · **Fork Over** pierce 100, crit +20 · **Tenderise** blunt 80 +
  [defDown 2] · **Present the Platter** 3× slash 50.
- **Sparks:** **Mise en Place** (`firstStrike`) · **Carver's Eye** (`critPlus`) · **Clean Plate** (`hasteOnKill`: "Next.")
  · **Ten Out of Ten** (`chipPlus`) · **Flambé** (ability: fire 110 + [burn 2, 30%]) · **Second Helping** (replace
  Platter: 4× slash 45).
- **Lines:** recruit "You need a carver. I need an employer who doesn't count the spoons." · Bright "Ten. Note the wrist."
  · KO "A six... at best..." · level up "An eight. I'm improving."

### 4.3 Clem Honeysett · mender · starting

- **Who:** human, 23, keeper of the Honeysett Hives; shop steward of the Butterwick Apiarists' Union, Local 7 (her bees).
  Sunny, earnest, a little frazzled, loyal. Talks to the bees as colleagues. Never lets anyone tend *her*. Allergic to
  bees; everyone works it out within a day; she swells up magnificently and carries on.
- **Secret / arc:** her bees fly back toward Butterwick at night: the inn has "the oldest wax they've ever smelled". Learns
  to let people look after her; in the finale Barty carries her up the last flight.
- **Visual:** short, round-faced, freckled, dark curls; wide straw hat with the veil pushed back; mustard-yellow smock-dress
  with black-striped hem; green wellies, white gloves, brass bee-smoker on a chain; sparkle-bees.
- **Weapon:** Honey-Dipper (pierce 90; the girls do the hitting).
- **Abilities:** **Honey Poultice** heal one ally (mag) + cleanse target · **Sting Operation** pierce 80 mag + [poison 3,
  60%] · **Hum of Grace** spirit 100 mag + [regen 2, self] · **Royal Jelly** revive 30% (expensive).
- **Sparks:** **Busy Bees** (replace Poultice: also [regen 2]) · **The Whole Hive** (ability: heal all allies, small) ·
  **Picket Line** (replace Sting: 3× pierce 35 mag + poison) · **Antihistamine** (ability: cleanse all allies; "Finally.")
  · **Comb Wall** (ability: [barrier] one ally) · **Overtime** (`cheatDeath`: the union approves overtime).
- **Lines:** recruit "The hive's voted. Eleven thousand to two. We're coming." · Bright "Lovely work, girls!" · KO "Tell
  the union... I never crossed... a line..." · level up "The girls say I've grown. They're very supportive."

### 4.4 Ashlar · warden · met on the road

- **Who:** a sandstone knight, about a century old, who stood in the Kindlewake Inn's garden until the sun's hiccup
  loosened his Set and he walked off his plinth. The plaque is weathered to "SIR ...ASH..."; he has decided he is Sir
  Ashlar, Knight of the Stair. Courtly, grave, glacial ("I shall arrive presently."). Wrens nest in his helmet; he will
  not evict them. A century of garden conversation means he knows everyone's business and is devastatingly discreet about
  it ("Mister Crumb, I was present for the Incident with the Custard. I have told no one.").
- **Secret / arc:** he is the memorial of **Sir Wendell Ashbury**, who held the Wickspire stair in 1100. *Act 1 keeps
  this quiet;* his "Wendell" line belongs to act 2 (section 10). In act 3 he learns he is not Wendell; in the finale he
  holds the stair anyway.
- **Visual:** big blocky sandstone knight, moss patches, a nest of tiny blue eggs on the helmet, one chipped shoulder,
  amber light in the visor; stone kite shield and stone sword.
- **Weapon:** Stone Sword (slash 100).
- **Abilities:** **Hold the Line** [barrier] all allies, small · **Plinth Slam** blunt 150, chip 2, delay 1.6 · **Stand
  Firm** large [barrier] on one ally + cleanse target · **Nesting Wrens** 2× pierce 55.
- **Sparks:** **Weathered** (`ironGuard`) · **Mossy** (`hpRegen`) · **Keystone** (replace Hold the Line: larger barrier) ·
  **Garden Gossip** (ability: [defDown 2] + [atkDown 2] + `chip 1` on any foe, weakness or not: "Mister Bleatham. I was
  present for the Incident with the Turnip.") · **Sanctuary** (ability: barrier and cleanse on all allies; expensive) ·
  **Hold the Stair** (`tauntAura`).
- **Lines:** recruit "I have stood still for a hundred years. I believe I am ready for a walk." · Bright "Most
  satisfactory!" · KO "I shall... sit down... for a century or so..." · level up "I have moved. Considerably. For me."
- **Recruit scene:** a statue sits on a milestone at the roadside, holding its stone shield over a wren's nest against
  the drizzle. It has been there since breakfast. "Good day. I am waiting for the rain to stop, for the birds' sake. I
  wonder, are you going anywhere slowly?"

### 4.5 Gertie Bellow · support · met at Bleatham Bridge

- **Who:** human, 67, Town Crier of Butterwick for forty-one years. LOUD. Cheerful, nosy, unstoppable; adores procedure.
  All her lines are capitals, including the quiet ones. Buffs are proclamations ("HEAR YE! BARTY IS NOW STRONGER! LONG
  LIVE THE QUEEN!").
- **Secret / arc:** going deaf; keeps an ear trumpet in her belt and pretends it's a bugle. She shouts because she is
  afraid nobody is listening. "I've cried the Coal Day proclamation forty-one years. I've never once seen the Coal glow."
  In the finale she reads the names of the fallen aloud as the Ledger burns, so each is heard once.
- **Visual:** short, stout; scarlet tricorn with gold trim and a white feather; scarlet coat with gold braid and brass
  buttons; white stockings, buckled shoes; grey bun, spectacles; brass ear trumpet at the belt; a scroll.
- **Weapon:** Brass Handbell (spirit 95).
- **Abilities:** **HEAR YE** [atkUp 3] one ally · **Order! Order!** blunt 90 + `delay 0.5` (a Cracked foe stays Cracked
  longer) · **Public Notice** [bleed 2] one foe: Break chips on it count double while posted · **Ring Out** spirit 50 mag,
  all foes.
- **Sparks:** **AND FURTHERMORE** (replace HEAR YE: also [defUp 3]) · **By Royal Decree** (ability: [atkUp 3] all allies)
  · **Town Meeting** (ability: +5 Moxie to every Front ally; tea and biscuits) · **Curfew** (ability: [atkDown 2] all
  foes: "EVERYONE TO BED!") · **Lungs of Brass** (replace Ring Out: spirit 65 mag, all, + [atkDown 1, 30%]) · **Second
  Wind** (`mpRegen`).
- **Lines:** recruit "HEAR YE! I AM JOINING! THAT IS ALL!" · Bright "LET IT BE KNOWN! THAT WAS SUPERB!" · KO "...hear...
  ye..." (her only lowercase line) · level up "LET IT BE KNOWN THAT I HAVE IMPROVED!"
- **Recruit scene** (recruit node; E12 is the other way to meet her): from a lock-up behind a toll booth, a voice that
  rattles the bars. "HELLO! I AM BEING DETAINED UNDER BYLAW TWELVE! THE GOAT HAS GONE FOR LUNCH! THE KEY IS ON THE NAIL!"
  It is.

### 4.6 Kit Brassfinch · wildcard · met at Thimble Mill

- **Who:** human, 15, apprentice (and niece) to Odo; tinker. Earnest, fast-talking, oil-smudged, overconfident. Builds
  things that almost work. Loves her uncle and is mortified by him. Kinder to machines than to people.
- **Comic angle:** the **Thing-o-Matic**, a clanking backpack contraption. Each use, the UI picks a random pair "It's
  *meant* to [make tea / sharpen pencils / play the national anthem / find north]." / "It did [none of that / something
  else / it's on fire, slightly]."
- **Secret / arc:** she painted the Coal; this year it was her job. She believes Odo has "a real plan". From apprentice of
  a fake to a real Lamplighter: in the finale she sets the wick-end back.
- **Visual:** small, wiry, copper hair under brass goggles, grease-smudged orange overalls, one oversized glove; a huge
  backpack of pipes with a tiny chimney, a crank and a bell.
- **Weapon:** Big Wrench (blunt 100).
- **Abilities:** **Thing-o-Matic** 3 hits: frost 40 mag, storm 40 mag, spirit 40 mag (a rhythm of three different verbs;
  it finds weaknesses by trying everything) · **Percussive Maintenance** blunt 120 · **Spare Parts** one ally: [atkUp 2,
  50%], [defUp 2, 50%], [regen 2, 50%], [barrier, 50%] · **Uncle Odo's Patented Flare** fire 90 mag + [burn 2, 30%]
  ("It's mostly paint.").
- **Sparks:** **Calibrated** (replace Thing-o-Matic: three hits at 55) · **Overclocked** (requires Calibrated; replace
  again: five hits, adding fire and pierce) · **Lucky Washer** (+6 luck) · **Duct Tape** (ability: small heal + cleanse
  one ally) · **Big Red Button** (ability: all foes, 4 hits fire/frost/storm/spirit 35 mag, delay 2.0: Kit is busy
  afterwards) · **Apprentice No More** (replace Flare: fire 130 mag, chip 2, [burn 3, 50%]).
- **Lines:** recruit "I can fix that! Whatever it is! Probably!" · Bright "IT WORKED? It worked! Somebody write that
  down!" · KO "Note to self... more... rivets..." · level up "Upgrade! Somebody write that down!"
- **Recruit scene:** Thimble Mill's patchwork sails are turning backwards. A girl in goggles is hanging off one of them
  with a wrench in her teeth. "Don't touch anything! It's *meant* to do that!" It isn't.

### 4.7 Pell · trickster · met in the Vantwhistle Topiary

- **Who:** human, 27, mime with the Fairground of Lesser Wonders. Never speaks; a pocket chalkboard she almost never uses.
  Expressive, mischievous, weirdly competent. Her lines are stage directions (italics). Enemies are more offended by her
  than hurt.
- **Secret / arc:** a sworn, sooted member of the Quiet Hour's inner circle, sent to turn parties back. She never could,
  so she walks with them and watches them die. Her silence is the order's vow and fear: if she starts talking she will not
  stop telling them how it ends. Act-1 clues: she flinches at spots on the map; she mimes a finger going round and round;
  she knows Gerald's name before Barty says it; she won't sit near the Ledger. She speaks for the first time in act 2.
- **Visual:** slender, exaggerated poses; white face paint with a black teardrop; black-and-white striped shirt, black
  braces, baggy red trousers, tiny black beret, white gloves; slate chalkboard at the hip.
- **Weapon:** Silver Hatpin (pierce 95).
- **Abilities:** **Invisible Box** one foe `delay 0.6` · **Tug of War** one ally `delay -0.6` (their next turn comes
  sooner) · **Pinprick** pierce 80 + [bleed 2, 70%] · **Walking Against the Wind** storm 90 mag + [atkDown 2].
- **Sparks:** **Encore** (replace Box: also `hasteSelf -0.3`) · **Heckle** (ability: [atkDown 2] + [defDown 2]) · **Stage
  Fright** (`critPlus`) · **Pratfall** (`counter`) · **The Bow** (ability: all foes `delay 0.35`) · **Applause**
  (`mpOnBreak`).
- **Lines:** recruit "*Pell points at you, at herself, mimes a very long road, and shrugs enormously. She's in.*" ·
  Bright "*Pell bows to an audience nobody else can see.*" · KO "*Pell mimes a curtain coming down. It comes down
  slowly.*" · level up "*Pell takes a bow. Then another. Then a third, for luck.*"
- **Recruit scene:** beside a stranded caravan painted *THE FAIRGROUND OF LESSER WONDERS*, a mime is trapped in an
  invisible box. She has been in it, a sign beside her says, since the parade. She looks at you for a long moment, as if
  she's seen your faces before and is sorry about it. Then she opens a door in the box that was always there, and steps
  out.

### 4.8 Roz Gale · caster · met on Kite Hill

- **Who:** human, 52, Senior Weather Reader of the Royal Almanac; reads tomorrow in the sky and has never been wrong.
  Brisk, splendidly self-important, speaks in forecast cadence. Secretly afraid of the dark; the first to notice when
  someone else is frightened.
- **Comic angle:** forecasts her own spells ("Heatwave moving in from the east, highs of *very*") and her misses ("A light
  drizzle of failure").
- **Secret / arc:** since Monday she cannot read tomorrow; the sky shows tomorrow as *today*, "like a page stuck in the
  press". She thinks her gift is broken and hides it. Her last line of the game: "Outlook for tomorrow: there will be one."
- **Visual:** tall, angular, silver bob, round spectacles; cobalt robe with little white clouds, sunbursts and lightning
  bolts; red silk scarf; pointed hat topped with a brass weathercock.
- **Weapon:** Barometer Staff (storm 90).
- **Abilities:** **Heatwave** fire 110 mag + [burn 3, 40%] · **Cold Snap** frost 110 mag + [chill 2, 50%] · **Thunder
  Warning** storm 120 mag + [slow 2, 30%] · **Long-Range Forecast** [defDown 3] one foe (lowers def and res) +
  `hasteSelf -0.4` (she gets to her next spell sooner).
- **Sparks:** **Front Moving In** (ability: storm 60 mag, all foes) · **Hailstorm** (ability: 3× frost 45 mag) · **Record
  High** (replace Heatwave: fire 130 mag + [burn 3, 70%]) · **Accurate to Within** (`mpRegen`) · **Sunny Spells**
  (ability: small heal, all allies) · **Pressure System** (`chillTouch`).
- **Lines:** recruit "Forecast: you'll need me. Confidence: total." · Bright "As predicted!" · KO "Outlook...
  overcast..." · level up "Forecast revised: upward."
- **Recruit scene:** Kite Hill, a hundred tethered post-kites humming. A woman in a cloud-patterned robe is staring at the
  sky with an almanac open and a pencil she isn't using. "Tomorrow's forecast is—" She stops. "Is being revised. Where
  are you going? I'll come. I'm told the air's better there."

## 5. Act 1 enemies

Halcyra is a friendly place to be beaten up in: foes are **routed**, not killed (they scarper, sulk, deflate or fall over;
the KO message and animation say so). Format: size · weak / resist (immune) · Break · intent loop (kind) · notes.

**Teaching rules.** Columns 1-2 draw only from the six *teacher* foes (Jamble, Scab Bee, Cawdle, Puffcap, Murkwing,
Runaway Kite): no heavies. Every heavy is preceded in its loop by a charge, a wait or a lure. Intents are visible from the
start of a fight, so a foe that starts its loop on a heavy has still shown it.

### 5.1 Normal foes (16)

| # | Foe | Size | Weak | Resist | Break | Loop | Notes |
|---|---|---|---|---|---|---|---|
| 1 | **Jamble** | S | frost, fire | slash, blunt | 3 | Wobble (buff: defUp self) → Splat (attack) → Preserve (heal: all its allies, small) | *Set jam from the Great Jam Flood. Sticky, sweet, and legally a preserve.* |
| 2 | **Scab Bee** | S | frost, blunt | pierce | 3 | Buzz (attack) → Working Lunch (heal self) → Overtime (multi: 3 stings, poison) | *A non-union bee. Works through lunch. Clem will not speak to it.* |
| 3 | **Cawdle** | S | blunt, storm | spirit | 3 | Caw (debuff: atkDown) → Peck (attack) → Shiny! (debuff: target `delay 0.4`; "you look for your button") | *A crow that has never stolen anything it didn't find interesting. It finds buttons very interesting.* |
| 4 | **Puffcap** | S | pierce, slash | blunt, storm | 3 | Swell (buff) → Spore Burst (multi, all, poison) → Deflate (wait) | *A mushroom that releases spores when nervous. It is always nervous.* |
| 5 | **Murkwing** | S | pierce, spirit | blunt, frost | 3 | Flutter (buff: haste self) → Dim (debuff: atkDown) → Eat the Light (debuff: −4 Moxie) | *A grey moth that flies toward the bite in the sun the way other moths fly toward porches.* |
| 6 | **Runaway Kite** | S | slash, pierce | storm | 3 | Swoop (attack) → Tangle (debuff: chill) → Ride the Gust (charge) → Special Delivery (heavy) | *A post-kite that slipped its string. Still carrying a parcel. Would like you to sign for it.* |
| 7 | **Sheetling** | S | spirit, fire | slash, pierce (immune blunt) | 3 | Billow (charge) → Smother (heavy) → Flap (attack) → Wistful Sigh (debuff: atkDown, all) | *A picnic blanket that remembers somebody sitting on it. Haunts politely.* Immune to Pound: there is nothing under there. |
| 8 | **Trundlesnail** | M | blunt, frost | pierce, fire | 5 | Trundle (attack) → Retreat (buff: defUp self) → Slime Trail (debuff: chill, all) → Shell Slam (heavy) | *Has been on its way somewhere since spring. You are in the way.* Retreat is the lure: it comes out swinging. |
| 9 | **Haywarden** | M | fire, spirit | pierce | 4 | Stare (debuff: defDown) → Flail (multi) → Call the Crows (summon Cawdle, cap 2) | *A scarecrow that stood nine years with its arms out, walked off when the sun hiccupped, and has opinions about crows.* |
| 10 | **Toll Goat** | M | slash, frost | blunt, spirit | 4 | Cite the Bylaws (debuff: defDown) → Headbutt (attack) → Lower Horns (charge) → Gore (heavy) | *Member of the Billy Brotherhood. Knows every bridge bylaw and finds them delicious.* |
| 11 | **Leafhound** | M | slash, fire | pierce | 4 | Sniff (buff: atkUp self) → Pounce (attack) → Dig (charge) → Bury You (heavy) | *Clipped into the shape of a dog in 1079 by a duke who had never seen one up close.* |
| 12 | **Grumbadger** | M | pierce, storm | frost, spirit | 5 | Grumble (buff: atkUp self) → Swipe (attack) → Dig In (buff: defUp self) → Badgering (multi: 3 hits of nagging) | *A Spoken badger. Was here first. Will tell you. Will keep telling you.* Resists Grace: very sure of itself. |
| 13 | **Snuffer** | M | storm, slash | spirit | 4 | Shush (debuff: shock) → Snuffing Pole (attack) → Please Go Home (wait: it just asks) → Not Again (heavy) | *A grey hood, a bell-shaped snuffer on a pole, and the eyes of someone who hasn't slept since breakfast.* Bark: "Not again. Please, not again." |
| 14 | **Tin Turnipcutter** | M | storm, blunt | slash, fire | 5 | March (buff: atkUp self) → Chop (attack) → Wind Up (charge) → Harvest (heavy: 3 chops) | *Built in 1059 for the Turnip War. Nobody has told it the war is over. Nobody has been brave enough.* |
| 15 | **Lurking Luncheon** | M | spirit, fire | frost | 4 | Offer Sandwich (heal: heals *your* party a little) → Snap Shut (heavy) → Chew (attack, bleed) | *A picnic hamper waiting for someone hungry. The sandwiches are real. That's the trick.* Resists Chill: there's an ice pack in the lid. |
| 16 | **Waistcoat Wasp** | S | spirit, storm | slash | 3 | Preen (buff: atkUp self) → Sting (attack, poison) → Invite Itself (summon Waistcoat Wasp, cap 2) | *Dressed for a garden party it was not invited to. Will not be leaving.* Weak to Grace: it is pretending to be a guest. |

Spread check: each verb is a weakness of four or five foes; fire is resisted by two, blunt by three (plus one immunity);
no verb clears more than a third of the act. Pound is the tank's verb and is a weakness of three foes, not a liability.

**Offer Sandwich** is an enemy ability whose target is the party (`enemies` from the hamper's side) with a heal effect.
**Eat the Light** is a negative `mp` effect (see the review doc: clamp at 0).

### 5.2 Encounters (act 1)

Each pack mixes makers so no verb clears it. Levels by column band; the engine scales HP and attack.

| Band | Encounter | Foes | Why |
|---|---|---|---|
| Cols 1-2 | `a1_jam` | 2 Jamble | The first lesson: Chill or Bake, Pound does little |
| Cols 1-2 | `a1_buzz` | Scab Bee, Waistcoat Wasp | frost/blunt against spirit/storm |
| Cols 1-2 | `a1_post` | Runaway Kite, Cawdle | the Kite shrugs off Whisk; the crow is weak to it |
| Cols 1-2 | `a1_dusk_early` | 2 Murkwing, Jamble | Murkwings resist Chill; the Jamble wants it |
| Cols 3-4 | `a1_field` | Haywarden, Cawdle | Bake the scarecrow, Pound the crows it calls |
| Cols 3-4 | `a1_bridge` | Toll Goat, Cawdle | the first telegraphed heavy (Gore) |
| Cols 3-4 | `a1_topiary` | Leafhound, Cawdle | |
| Cols 3-4 | `a1_garden` | Trundlesnail, Puffcap | Pound the snail; the Puffcap resists it |
| Cols 3-4 | `a1_picnic` | Lurking Luncheon, Scab Bee | the hamper resists Chill; the bee wants it |
| Cols 5-6 | `a1_war` | Tin Turnipcutter, Haywarden | |
| Cols 5-6 | `a1_sett` | Grumbadger, Puffcap, Scab Bee | three answers needed |
| Cols 5-6 | `a1_snuffers` | Snuffer, 2 Murkwing | |
| Cols 5-6 | `a1_duskedge` | Snuffer, Sheetling, Murkwing | |

Event fights: `e_picnic` (2 Sheetling), `e_snuffer` (Snuffer, 2 Murkwing), `e_specs` (Grumbadger, Puffcap), `e_duchy`
(Tin Turnipcutter, Haywarden), `e_customs` (2 Toll Goat), `e_pond` (2 Murkwing).

### 5.3 Bigwigs (elites)

**Baron Bleatham** · L · weak slash, frost / resist blunt, spirit · Break 6 · with 1 Toll Goat. *King of the Billy
Brotherhood, in a bucket crown and a velvet waistcoat with a fob watch he cannot read. "The bridge is free. Crossing it
is a hundred buttons."*
- **Gimmick: the Toll Rises.** His loop is a visible price ladder: Toll: Ten Buttons (attack) → Toll: Fifty Buttons
  (multi) → Call Counsel (summon Toll Goat, cap 1) → Toll: One Hundred (charge) → **PAY UP** (heavy, all foes). A Cracked
  Baron loses his turn without climbing the ladder, and Box/Order! delays push PAY UP back. Teaches: Crack it before the
  top rung, or Guard.
- Phase at 50% HP: "The Baron consults his fob watch. He cannot read it. He decides it is later than it is." The loop
  drops Call Counsel and the ladder speeds up.
- Barks: intro "Bylaw one: the toll. Bylaw two: see bylaw one." · routed "I'll be lodging a complaint. With myself. I'm
  the complaints department."

**The Conserve Colossus** · L · weak frost, fire / resist slash, blunt · Break 7 · alone. *Thirty-seven years ago it was
an orchard's worth of strawberries. It has not forgiven anyone.* A hill of jam wearing a few trees.
- **Gimmick: Spread Thin.** It sheds Jambles (summon, cap 3), and Jambles spend their turns Preserving their allies,
  which tops the Colossus up. Teaches: clear the small jam or the big jam never goes down; and hitting jam with blades or
  mallets is slow.
- Loop: Bubble (buff: defUp self) → Spread Thin (summon Jamble) → Wave of Jam (multi, all, chill) → Spread Thin → Set
  (charge) → **Seal the Jar** (heavy, chill).
- Barks: intro "*The jam regards you. The jam has always regarded you.*" · routed "*It slumps into a very large, very
  sulky trifle.*"

**Sister Nocturne** · M · weak storm, slash / resist spirit, blunt · Break 6 · with 1 Snuffer. *A Quiet Hour adept in a
grey habit with two bell-snuffers and tired, certain eyes.*
- **Gimmick: ★rehearsed ("I've Seen This").** If the party uses the same command twice in a row (the same ability, the
  plain Attack, or the same item, by any members), she counters the second use. The command menu marks a would-repeat
  command with a small eye while she stands, so the rule is taught before it bites. Teaches variety; plants act 2 in the
  player's hands.
- Loop: Hush (debuff: shock, all; you can't Guard the next blow) → Twin Snuff (multi) → Lullaby (debuff: chill) → I Know
  What You'll Do (charge) → **Not This Time** (heavy).
- Barks: intro, before anyone has acted: "You always open with that." (Barty, if present: "We haven't done anything
  yet." Nocturne: "You will.") · on counter "I know." · when Cracked "...That's new." · routed "Go home. It's kinder. You
  won't, though. You never do."

### 5.4 Act 1 boss: the Hooded Thief (Duskwood)

One enemy with three shapes, using ★phase reshape (weak/resist/name/sprite/size change per phase; it cannot be routed
while phases remain). Phase 1 → 2 on its first Break or below 60% HP; 2 → 3 on Break or below 35% HP.

**Phase 1: the Hooded Thief, Mounted** · L · weak fire, pierce / resist frost, blunt · Break 8. *An enormous grey moth
with a hooded figure clinging to its back, shrieking. The rider throws things. One of them is a sandwich.*
- Loop: Wingbeat (multi, all) → Smoke Bomb (debuff: atkDown, all; "BEGONE! I mean, HELP!") → Call the Murk (summon
  Murkwing, cap 2) → **Throw Sandwich** (the rider panics and throws his lunch: heals one of *you*) → Dive (charge) →
  **Moonless Swoop** (heavy).
- Reshape message: "The moth spirals into the trees. The rider tumbles into a fern, the hood falls back, and it is
  Lamplighter Odo Brassfinch, still clutching the reliquary. He gets up. 'Procedure 1: Nobody Saw That.'" He starts
  phase 2 Cracked (he's in a fern): a free punish turn.

**Phase 2: Lamplighter Odo Brassfinch** · M · weak spirit, blunt (he is pretending, in hollow brass) / resist slash,
pierce · Break 4 (short on purpose: a comic breather). *In ceremonial plate shaped like a lantern, defending the
reliquary with a snuffing pole and a great deal of procedure.*
- Loop: Procedure 4(b) (buff: defUp self) → Snuffing Pole (attack) → Interminable Speech (debuff: chill, all) → Dramatic
  Faint (charge: he lies down, then gets up very fast) → **Lamplighter's Due** (heavy).
- Speech barks escalate per loop: "Stand back! This Coal is very real!" → "Extremely hot! Don't touch it!" → "It's
  *fine*. It's *fine*. Everyone look at the moth."
- Kit present (UI variant of the phase-2 message): "Kit: I painted it, Uncle Odo. I painted it every year." Odo: "Not
  *now*, Kitten."
- Reshape message: "The reliquary falls. The Coal bounces twice. A flake of black paint peels off grey papier-mâché. Odo
  sits down in the fern. Then the trees start to shake."

**Phase 3: the Duskmother, Hushed** · L · weak fire, spirit / resist slash, frost · Break 7 · heals 50% on reshape. *The
moth was never his. It comes back grey all the way through, twice the size, the colour of the bite in the sun.*
- **Fight-twist: Odo changes sides.** He has no sprite turn of his own; his help is written into the Duskmother's loop as
  turns it loses to him (intent kind `wait`, shown over the moth as "Odo: Procedure 1").
- Loop: Grey Dust (debuff: defDown, all) → Wingstorm (multi, 3) → **Odo: Protect the Public** (barrier on all of you; "I'm
  not brave. I've just read the procedure.") → Eat the Light (debuff: −Moxie, all) → Eclipse (charge) → Eclipse (charge)
  → **Totality** (heavy, all). The double Eclipse is the beat the whole act teaches you to Crack or Guard.
- On defeat: the moth dissolves into grey dust that drifts upward toward the bite. Mothersole's Bestiary later notes:
  "Not feeding on the dark. *Going home* to it."

## 6. Act 1 events (12)

All outcomes are engine `Outcome` kinds. `heal`/`hurt` affect the whole party, Wagon included, and touch HP only.
Choices whose cost the party can't pay (buttons, a full party for a recruit) are greyed out with the reason (UI rule).
Character-presence lines are optional UI variants; the base text always stands alone.

### E1. The Last Picnic · tone

A picnic laid for two on a hilltop: cucumber sandwiches, a seed cake under a glass dome, two cups still steaming. A
red-checked blanket hovers a foot off the grass, rippling the way a blanket would if it were trying very hard to look
relaxed. A card against the teapot: *Expecting Wilfred. Since 1121. Please don't mind me.* It billows toward you,
hopeful, then away, embarrassed.

- **Sit down and eat.** The blanket folds itself across your shoulders. `relic: patient_blanket`, `hurt 10` ("The
  cucumber is seventy-nine.")
- **Tell it Wilfred isn't coming.** 50%: it takes it badly: `fight: e_picnic`. Gamble 50%: it goes very still, folds
  itself corner to corner the way you fold something for the last time, and is just a blanket. "Thank you. Nobody would
  *say*." `item: very_old_cake`, `xp 25`.
- **Take the cake and run.** `item: very_old_cake`. Gamble 30%: the blanket follows, sorrowfully, then less sorrowfully:
  `fight: e_picnic`.

### E2. A Rehearsal, Overheard · plants act 1

A girl of about eight on a gate with a notebook and a magnifying glass: **Agnes Plum**, who reported the sun blinking
last year and was laughed at by the Almanac. "I was at the dress rehearsal yesterday. The Lamplighter dropped the Coal.
It bounced. *Twice.* Coals don't bounce. I checked. I bounced some." She turns a page. "Also the thief had the
Lamplighter's boots on. The ones with the little suns. I drew them." It is a good drawing.

- **Take her report seriously.** `xp 30`, `flag: agnes` (she turns up at the act-end scene). Dell: "Ten out of ten. Note
  the handwriting."
- **Give her a button for her trouble.** `gold -10`, `item: agnes_notebook`. "Case notes. Several of them are about you."
- **Tell her to go home, it's dangerous.** "That's what the grey people keep saying." She leaves, offended. No outcome.

### E3. The Guild Stores · plants act 1

A padlocked stone shed: *WORSHIPFUL GUILD OF LAMPLIGHTERS. STORES. NO ADMITTANCE. THIS MEANS YOU, AGNES.* Through the
window: procedure manuals, a spare brass reliquary identical to the stolen one, boxes of fireworks, four large pots of
black paint. A notice inside the door: *Procedure 9. In the event the Coal is examined: faint.*

- **Break in.** `item: firecracker` ×2, `gold 30`. On the shelf, a stores book: *"Paint, coal-black, 4 pots. Signed: O.
  Brassfinch. Purpose: touching up."* (Kit variant: she produces a key and avoids eye contact.)
- **Laugh at Procedure 9.** Everyone laughs more than it deserves. `heal 15`.
- **Respect the sign.** A Guild clerk pops up from behind the shed, astonished. "Nobody *ever* respects the sign." He
  presses something on you for your trouble. `item: lantern_on_a_stick`. "Not *the* Lantern. *A* lantern."

### E4. Names on the Stile · plants act 2

An old stile covered in initials, but not carved: written in something grey that comes off on your thumb and isn't chalk.
And they are yours. The UI draws the current party's initials in their own hands: *B.C. + GERALD* in blocky capitals; a
precise *D.Q.* with *4/10* beside it; a bee drawn by someone who loves bees. None of you has ever been here. Round the
posts and down into the grass, in a smaller hand, tally marks in bundles of five. Thousands. At the bottom: *PLEASE GO
HOME.*

- **Add your names properly.** Everyone signs again, in ink. `stat luck +2, all`. Barty: "Feels like we already did."
- **Try to rub it out.** It won't come off. Your thumbs stay grey. `relic: soot_smudge`. Someone says, "Have we been here
  before?" Nobody answers.
- **Walk on quickly.** No outcome. (Roz variant: she checks the sky and doesn't say what she sees.)

### E5. Please Go Home · plants act 2

A lone Snuffer in the lane with her hood down: young, soot-grey smudges on her eyelids, not slept in a very long time.
She doesn't raise her pole. "You're going to Duskwood. You're going to fight a moth. And some of you are going to—" She
stops. "I'm not allowed to say. Please. Go back to Butterwick. Have a nice lunch. Let the century end quietly." She opens
her satchel. "I'll give you anything in here if you promise to turn back at the next fork."

- **Promise.** `item: strong_tea` ×2, `heal 20`. As you pass she says, without anger, "You always say yes."
- **Ask her why.** "Every time you—" She bites it off. "Ask the tortoise. No. Don't. Forget I said that." `xp 20`, `flag:
  asked_snuffer`.
- **Move her aside.** She sighs. "Not again." `fight: e_snuffer`.

### E6. Letter by Kite · plants acts 2 and 3 (lightly)

A post-kite with a red ribbon tail has snagged in a hawthorn. Its pouch holds a letter addressed *To the party, c/o the
Downs (the one with [lead character's name])*, on Kindlewake Inn notepaper, in a looping old-fashioned hand: *"Mind the
goats at the bridge; the big one hates frost. Don't eat anything a hamper offers you. Do eat something, though. — H."*
Wrapped underneath, a thick slice of fruitcake. Barty: "That's Nan Hess. She always knows. First time I ever met her she
knew I take two sugars." Dell: "And how does an innkeeper know about the goats?"

- **Eat it now.** `heal 25`.
- **Save it.** `item: nans_fruitcake`.
- **Write back: "Who are you?"** The kite insists on a parcel, so the cake goes back with the letter; Barty is aghast. Within
  the hour another kite drops a jar on your heads: *"Frost-jam. Don't ask. — H."* `item: snow_globe` ×2, `flag:
  wrote_to_nan` (Dun at the next shop: "She got your letter. She says you should have eaten the cake.").

### E7. Professor Mothersole Needs a Hand · plants the finale; ecology

**Professor Hilda Mothersole**, author of the Bestiary, 61, in a pith helmet, waist-deep in a bramble with a grey moth in
her net, in no hurry to be rescued. "Don't move. You're standing on something rare. Not you. The plant. Murkwings. New to
science as of this morning. Moths fly to light; these fly toward the *dark*. Straight at the bite in the sun." A frown.
"I'd swear I'd catalogued them before. Like a word on the tip of your tongue." A badger has made off with her spectacles.

- **Hold the jar.** `relic: moth_in_a_jar`. "It thinks the jar is the sun. Let it."
- **Get her spectacles back.** `fight: e_specs`, then `gold 40`. She annotates your bestiary in red ink: "Badger: rude."
- **Let the moth go.** It flies straight up toward the bite. "Sentiment. Terrible science. Lovely, though." `xp 30`.

### E8. The Well of Moderate Wishes · plants act 3 (cryptic)

A mossy well: *WISHES GRANTED. MODERATE ONLY. NO SUNS.* A bored, echoing voice: "One button. Moderate wishes. Read the
sign."

- **Wish for riches.** `gold -1`, `gold 25` ("That's moderate."). Gamble 50%: `gold 2` instead ("Moderately.").
- **Wish for strength.** `gold -1`, `stat atk +2, random`.
- **Wish for the sun to be mended.** The button comes straight back up and hits you on the nose. "*No suns.*" A pause.
  "Someone wished that, a hundred years back. Young woman. Brass buttons on her coat. Wished it with her whole heart." A
  longer pause. "Didn't go well." Then, gruffly: "Here. One on the house." `heal 20`.

### E9. The Veteran of the Turnip War · humour and heart

A field of enormous turnips; in the middle, a rust-red Tin Turnipcutter at attention, *PVT. 9, 2ND DOWNS TURNIP
FUSILIERS* painted on its chest. Its head ratchets round. "HALT. FRIEND OR DUCHY?" Its orders, stencilled on its back, are
to hold the field until relieved. It has held it since 1059. The turnips have been very well protected.

- **"The war's over. You're relieved, Private."** It processes for an uncomfortably long time. Then it sits down among the
  turnips and stops ticking, very gently, like someone falling asleep. `relic: turnip_war_medal`.
- **"We're Duchy!"** `item: rusty_scythe`, `fight: e_duchy`. ("FINALLY.")
- **"Friend."** "PASS, FRIEND. TAKE RATIONS." `item: field_turnip` ×2.

### E10. The Abbey of the Open Basket · plants act 3 (cryptic) and the finale

Red-roofed, smelling of soup; monks in red-checked habits wave you in before you've explained anything. The refectory table
is a quarter of a mile long; no one eats alone, and the Abbess, **Mother Tureen**, keeps a rota for midnight snacks. Supper
is Gus Pottage's Peace Soup from the original recipe book on the lectern. Ingredient one: *everybody.* Mother Tureen turns
to the last page, written the year Gus died: *"H. — you can't keep everyone. Feed them and let them go."* "Nobody knows who
H. was," she says. "We think it was his cat."

- **Stay for supper.** `heal 40`.
- **Help in the kitchen.** You learn more peeling potatoes than you'd think. `xp 45`.
- **Ask for the recipe.** `item: peace_soup` ×2.

### E11. The Pond of Second Looks · plants act 2 and the finale

A round pond so still it looks varnished, filmed with something grey like ash on cold tea. Your reflections move half a
beat late, as if remembering rather than copying. And there are more of them than of you: behind your reflections stand
others, faint and grey, wearing your faces in rows going back into the water. One waves. (UI: draw greyed copies of the
current party, several rows deep. No Ledger data is needed.)

- **Wave back.** The grey figures wave too. One gives a thumbs up. `xp 30`.
- **Drink.** 50%: `stat mag +2, random` ("You feel you've learned something you already knew."). Gamble 50%: `hurt 15`
  ("Ash. Cold tea. Regret.").
- **Throw a stone.** The reflections scatter. One grey shape mouths *don't*. `fight: e_pond`.

### E12. Goat Customs · recruit: Gertie

Bleatham Bridge, a striped toll booth, a Toll Goat in a peaked cap with a clipboard. "Purpose of crossing? Anything to
declare? Any turnips, cheeses, or loud persons?" From the lock-up behind the booth: "HELLO! I AM BEING DETAINED! IT IS AN
OUTRAGE!" **Gertie Bellow**, held under Bylaw 12 (Noise). Her fine is sixty buttons, or detention until the end of the
century, "which," the goat notes, glancing at the bite in the sun, "could be any day now."

- **Pay her fine.** `gold -60`, `recruit: gertie`. "THANK YOU! I SHALL BE PROCLAIMING THIS!"
- **Argue the bylaws.** The goat produces Bylaw 12(b): *Arguing: also noise.* `recruit: gertie`, `fight: e_customs`.
- **Pay your own toll and cross.** `gold -15`. Behind you: "I WILL REMEMBER THIS!" (She won't. The Ledger will.)

## 7. Firesides and the shop

Fireside scenes play once per Wake, the first time a camp is chosen in the matching column range. Bracketed lines play
only if that character is in the party (Front or Wagon); skip absent speakers' lines.

### Fireside 1: "Gerald" (columns 1-3)

> **BARTY** unscrews a jar. "Dinner, Gerald."
> **DELL:** "Who is Gerald."
> **BARTY:** "My starter. Sourdough. He's eighty-one."
> **DELL:** "You brought a jar of eighty-one-year-old paste on a monster hunt."
> **BARTY:** "I couldn't leave him. He's never been on his own."
> **CLEM:** "The girls like him. They say he smells like a kitchen at four in the morning."
> **BARTY:** "That's the nicest thing anyone's ever said about Gerald."
> **DELL:** "I'd score your hit on that snail a seven, by the way."
> **BARTY:** "Oh! Thank you!"
> **DELL:** "Out of twenty."
> [**PELL** mimes stirring a jar and patting it, then mouths *Gerald* before Barty has told her the name. Barty: "How did
> you know his name?" Pell mimes *lucky guess*. Then she mimes it again, slower, and doesn't look at anyone.]
> [**GERTIE:** "HE'S EIGHTY-ONE? HAPPY BIRTHDAY, GERALD!" **BARTY:** "It isn't his birthday." **GERTIE:** "IT IS NOW!"]
> [**KIT:** "Can I take him apart? Not *apart* apart." **BARTY:** "No." **KIT:** "Just to see how he works." **BARTY:**
> "Flour and water and eighty-one years of being looked after." **KIT**, quietly impressed: "...That's a good design."]
> **CLEM:** "Whose ember's in the Coal from your house?"
> **BARTY:** "Ours. Crumb ember, every Kindlewake since Florian. Dad got up at three to bank the oven for it." A pause. "I
> hope it's alright. Wherever it is."
> **DELL**, quietly: "It will be exactly as alright as it was before it was stolen."
> **CLEM:** "That's a strange way to put it."
> **DELL:** "I'm a strange woman. Go to sleep. Somebody wake the baker at three. He'll do it anyway."

### Fireside 2: "Outlook" (columns 4-6)

> **DELL:** "Report. The snail, a seven. The goats, a four; they cheated. Barty, a nine."
> **BARTY:** "Out of?"
> **DELL:** "Ten."
> *Barty goes very quiet and very pink and has to walk around the fire once.*
> **CLEM:** "The girls keep flying back toward Butterwick at night. They say the inn's got the oldest wax they've ever
> smelled. Older than the hives. Older than anything."
> **BARTY:** "Nan's candles? She gets them off Dun."
> **CLEM:** "Bees don't lie. They exaggerate. It's in the agreement."
> [**ROZ** looks at the sky a long time, then closes her almanac. "Outlook for tomorrow." A pause. "Today. Since the
> parade, the sky shows tomorrow as today. Like a page stuck in the press." **DELL:** "Has that happened before?" **ROZ:**
> "I have never once been wrong, Delphine. I would like very much not to start now."]
> [**PELL** draws a circle in the air with one finger, round and round. Then she points at the Kindle, at herself, and
> lays her head on her hands. Nobody understands. She rubs her eyes and stops.]
> [**KIT:** "Uncle Odo's not a bad man. He's a procedure man." A pause. "If the Coal turned out to be a bit... less
> than... would that matter? Hypothetically?" **DELL** looks at her very carefully. "Hypothetically, I was dismissed over
> a pot of paint."]
> [**GERTIE:** "I'VE CRIED THE COAL DAY PROCLAMATION FORTY-ONE YEARS." Quieter, still in capitals: "I'VE NEVER ONCE SEEN
> IT GLOW."]
> [**ASHLAR:** "I should mention that statues hear everything at night. Mister Crumb talks in his sleep about crumb
> structure." **BARTY:** "Everyone does." **ASHLAR:** "Not at that length."]
> **DELL:** "Bed. We have a moth to catch."

### Dun's Sundries (the shop)

**Dun** is an old Spoken tortoise the size of a pony with a whole shop built onto his shell: striped awning, a little bell,
shelves of jars and tins, a hand-painted sign *DUN'S SUNDRIES: EVERYTHING YOU'LL NEED (AGAIN)*. Half-moon spectacles, a
cardigan with a grey thread through it, sooty fingertips. (He is Dunstan Greaves, porter of 1100, sooted, founder of the
Quiet Hour, the Lull. None of this is said in act 1.) Dry, slow, kind and very tired, like someone having a conversation
for the four-thousandth time and still trying to have it well. He doesn't haggle and doesn't buy. He always has what you
need on the front shelf and always suggests you go home; he can't help doing both.

| Moment | Line |
|---|---|
| First shop of a Wake | "Dun's Sundries. Everything you'll need. Have a look. Take your time. I've got plenty." |
| Later shops in the same Wake | "Back again. Course you are." |
| Browsing | "That one's good against jam. Don't ask me how I know. Jam sort of week." |
| Buying | "Lovely. Mind how you go." / "Good choice. Better than last time." |
| Can't afford | "No credit. Not because I don't trust you. Because I've done the maths." |
| Buying a keepsake | "That one's been in a lot of pockets." |
| Leaving | "Have you considered going home? No? No. Never mind. Mind the moths." |
| Flag `wrote_to_nan` | "She got your letter. She says you should have eaten the cake." |
| Flag `asked_snuffer` | "Somebody's been telling you to ask the tortoise. I'm a tortoise. Ask away." (You don't know what to ask. He looks relieved.) |
| Pell in party | Dun and Pell exchange a look. "Evening, miss." Pell tips an invisible hat, very slowly, like a tortoise. |
| Ashlar in party | Dun goes quiet. "You've weathered well, sir." Ashlar: "Have we met?" Dun: "...No. No, I don't suppose we have." |
| Kit in party | "Your uncle owes me for four pots of paint." |
| Asked about the inn (idle line) | "Lovely place. Lovely pies. Don't sit by the candle." |

## 8. Items

### Keepsakes (relics, 12; party-wide passives)

| Keepsake | Passive | Effect text | Flavour |
|---|---|---|---|
| **The Lamplighter's Button** | `firstStrike` | The party acts first | Brass, stamped with a wick and the numeral XI. Still polished. Someone has polished it for a very long time. |
| **The Patient Blanket** | `startBarrier` | Everyone starts each battle with a small barrier | It waited seventy-nine years. It can wait while you nap. |
| **Bellamy's Golden Button** | `goldPct` 20 | +20% buttons from fights | She paid an army with her coat. You can pay for a scone. |
| **Moth in a Jar** | `mpOnBreak` | Each Break gives the Front 4 Moxie | It's very happy in there. It thinks the jar is the sun. |
| **Turnip War Medal** | `benchXp` | The Wagon earns full XP | For holding a field for one hundred and forty-one years. |
| **Soot Smudge** | `timingWide` | Timing windows wider | A grey thumbprint that won't wash off. You feel you've done this before. |
| **Glee's Pocket Tide-Clock** | `reviveOnce` | Once per battle each ally who would fall stands back up at 30% | It runs backwards for exactly one second, then apologises. |
| **Inkwhistle's Compass** | `luckyDrops` | Better drops | Points north, mostly. Points at the Rim when it thinks you're not looking. |
| **Peace Soup Tureen** | `hpRegen` | Everyone regains a little HP each turn | It's hard to fight on a full stomach. It's harder to lose on one. |
| **The Wren's Egg** | `ironGuard` | Guard blocks more | Small, blue, very well looked after. Ashlar would like it back eventually. |
| **The Almanac of Tuesdays** | `xpPct` 20 | +20% XP | Every page is Tuesday. You end up learning Tuesday by heart. |
| **Gerald's Cousin** | `perfectHeal` | Bright hits heal the hitter 5% | A starter from the same batch as Gerald. Gerald does not acknowledge him. |

### Knick-knacks (trinkets, 10; one wearer)

| Knick-knack | Passive | Flavour |
|---|---|---|
| Lucky Thimble | `critPlus` | From Thimble Mill, where it was the mill's only thimble. |
| Kite-Post Ribbon | `spdPlus` | Neither rain nor gale nor unusually large bird. |
| Honeycomb Brooch | `hpRegen` | Smells of Sunday. |
| Cast-Iron Locket | `ironGuard` | Contains a small portrait of a frying pan. |
| Weather-Vane Pin | `counter` | Always points the way you're about to be hit from. |
| Goat's Bell | `tauntAura` | Ding. Look at me. Ding. |
| Clockwork Earring | `guardMp` | Ticks when you're brave. |
| Baker's Apron String | `startBarrier` | Tied in a double knot by a nervous man. |
| Unlucky Horseshoe | `thorns` | Nailed up the wrong way. Everything fell out except the kick. |
| Agnes's Notebook | `chipPlus` | Case notes. Several of them are about you. (E2 only; also in the pool.) |

### Weapons (8, plus the eight starting weapons in section 4)

| Weapon | Type / power | Passive | Flavour |
|---|---|---|---|
| Rusty Scythe of Thimble Mill | slash 110 | `bleedTouch` | Reaped its last turnip in 1061. Has been thinking about it since. |
| Toasting Fork | pierce 100 | `burnTouch` | Also toasts. |
| Cheese Mallet | blunt 125 | none | Aged two years. The mallet, not the cheese. |
| Lantern on a Stick | fire 100 | `mpRegen` | Not *the* Lantern. *A* lantern. |
| Ice-Cream Scoop | frost 100 | `chillTouch` | Single or double? |
| Glee's Prototype Kite | storm 100 | `hasteOnKill` | The string is copper. Don't fly it in a storm. Fly it *at* one. |
| Abbey Tuning Fork | spirit 100 | `lifesteal` | Hums grace before meals. |
| The Duke's Hedge Shears | slash 95 | `critPlus` | Still has a little hedge-duke in the blades. |

### Consumables (8, plus 3 event-only)

| Item | Effect | Flavour |
|---|---|---|
| Buttered Scone | heal one ally (large) | Butter first, then jam. Fight about it later. |
| Strong Tea | +20 Moxie, one ally | Builder's. Stand the spoon up in it. |
| Nan's Fruitcake | revive one ally at 40% | It survived the journey. Of course it did. |
| Jar of Bees | pierce, all foes, [poison 3, 60%] | Non-union. Clem disapproves and asks where you got it. |
| Snow Globe | frost, one foe, [chill 2] | Of Butterwick. It's snowing on the inn. |
| Firecracker | fire, one foe, [burn 2] | Guild surplus. Procedure 31: celebrate. |
| Thunder in a Bottle | storm, all foes | Do not shake. Do not *not* shake. |
| Blessed Gravy | spirit, one foe, chip 2 | The Abbey blesses everything. Especially the gravy. |
| *Very Old Cake* (event) | full heal one ally | It has been under glass since 1121. It has kept beautifully. Nobody knows how. |
| *Field Turnip* (event) | heal one ally (small) | Very well protected. |
| *Peace Soup* (event) | cleanse and small heal, all allies | Ingredient one: everybody. |

## 9. Voice lines

### Death quips (end screen, under "The candle gutters.")

**Keyed to the killer** (use when `killedBy` matches; else a general one):

| Killer | Quip |
|---|---|
| Jamble / Conserve Colossus | Preserved. Indefinitely. |
| Toll Goat / Baron Bleatham | Fined. Heavily. See bylaw one. |
| Lurking Luncheon | You were told not to eat anything a hamper offers you. |
| Trundlesnail | Overtaken by a snail. Take a moment with that. |
| Tin Turnipcutter | Mistaken for Duchy. Easy mistake. |
| Snuffer | She did ask nicely. |
| Sister Nocturne | "Not again," says someone, very quietly. |
| Runaway Kite | Signed for. |
| Puffcap | It was more scared of you. It still won. |
| Sheetling | Smothered, politely. |
| Grumbadger | It was here first. It has said so. |
| Cawdle | It took the buttons. Then it took everything. |
| Haywarden | The crows send their regards. |
| Leafhound | Buried. Neatly. In a topiary shape. |
| Waistcoat Wasp | It wasn't invited either. |
| Scab Bee | Clem is not surprised. |
| Murkwing | The light went first. |
| Odo | Felled by procedure. |
| Duskmother | The moth goes home. You don't. |

**General (16):**

1. Somewhere in Butterwick, a kettle goes on.
2. The Ledger will remember. It's a very good listener.
3. Well. That's gone off.
4. Half a loaf is still a loaf. This was more of a crust.
5. The goats are going to be insufferable about this.
6. Mothersole's Bestiary has been updated with your mistakes.
7. Dell would like it noted that she gave that a four.
8. Somewhere in Duskwood, a moth is having the best day of its life.
9. Gerald survived. Gerald always survives.
10. That one's going in the Ledger in very small handwriting.
11. Gone, but noted.
12. The bees have called an emergency meeting.
13. The Kite-Post regrets to inform you.
14. Another page. She reads them all.
15. Brave, mostly. Timing, occasionally.
16. Nan puts the pie back in the oven. It'll keep.

### Title-screen taglines

Always (13): The sun has a bite in it. · Bring a friend. Bring five. · Every hearth gives something. · A party RPG about
timing, teamwork and jam. · Hit it with the right verb. · Mind you come back. There's a pie in for Thursday. · Sign the
book, dears. · Now with forty per cent more goats. · Someone has to carry the light. · Legally, the jam is a preserve. ·
Ten out of ten. Note the wrist. · The bees have voted in favour. · HEAR YE! A NEW WAKE BEGINS!

After the act-2 twist has been seen (Ledger `seen`): The people come back. The kindling doesn't. · Every Wake costs a day
of sun. · Outlook: bright, with a chance of tomorrow.

### Loading and menu tips (12)

1. Tap as the ring closes. A Bright hit on a weakness wobbles a Set twice.
2. A Cracked foe has to remember what it is. Hit it while it's remembering.
3. Push a Cracked foe's turn back and it stays Cracked longer.
4. Heavy and charge intents are the ones to Crack, or to Guard.
5. A Steady guard restores Moxie. Nothing restores your nerve like a goat bouncing off a skillet lid.
6. The map shows what's coming. Pack your verbs accordingly.
7. Jam: Chill it or Bake it. Pounding it only annoys it.
8. Grace can't hurt anything that's exactly what it seems. Goats are exactly what they seem.
9. The Wagon earns know-how too. Not as much. It mostly naps.
10. At a Fireside you can rest, take a spark, or sharpen something. Not all three. Nobody can.
11. Swapping costs a turn. Falling over costs more.
12. When in doubt, read the intent. When not in doubt, read it anyway.

## 10. Act 2 outline: "Salt and Soot" (the Saltglass Coast) · milestone 2

**Goal.** Reach the Saltglass Observatory and Marisol Inkwhistle's papers: the only map through the Blank. Odo tags along
in events, brave by procedure ("Procedure 112: Be Brave. I've never had to use it.").

**Flow.** Port Merriment's carnival pier → the Gull Parliament (the coast road belongs to the gulls; every motion is
"chips"; you must get one passed) → the Kelpwind Shallows and the Duke's drowned flagship → the Observatory. Snuffers are
more numerous and their barks turn specific: "Not the Shallows. You drown on the second tide. Every time."

**Elites and events (ideas).** The Carousel Champion (circles back on the timeline after every hit unless Cracked); the
Barnacle Bishop (blesses other foes with defUp); a Snuffer fortune-teller who tells your actual fortune; a sea-glass beach
that spells *AGAIN*; the Duke's log: "Day 3. The sea has not responded to our ultimatum." Dun: "Mind the second tide."

**Fireside (act 2): "Wendell".** Ashlar's line moves here from act 1: "In the garden of that inn, the lady of the house
would sit with me at night after the last guest had gone. She called me Wendell. She said 'sorry' a great deal." A long
pause. "Statues are not told why."

**Boss: the Tidewright.** Tobias Glee's lighthouse-sized tide-clock, wound by the Snuffers to guard the archive. Weak
storm, blunt; resist slash, pierce, frost. Phase 1 counts bells: Six Bells → Seven Bells → **Eight Bells: High Tide**
(heavy, all). **Rewind** is a heal intent ("its face spins backwards") placed after High Tide: Crack it or delay it before
it rewinds. On Break, phase 2 "Slack Water": the loop runs in reverse and its face shows a number that will not stop
climbing: mornings it has counted that were the same morning. On defeat Tobias Glee climbs out of a hatch, thirty-nine,
holding a spanner. "Is it still Monday?" "It's Tuesday." "Oh, thank goodness. It's felt like Monday for *ages*."

**The twist: the Grey Archive.** Beneath the Observatory, shelves of pages in soot ink, copied by the Quiet Hour before the
originals fade. The archivist is Sister Nocturne (routed in act 1, not killed). One page has a sketch of the party's lead
and a line from the player's own most recent fallen Wake if one exists (from the Ledger), else a fixed one: *"The baker
held the bridge. Fell at the Shallows on the second tide."* She explains plainly: a candle; when a party falls the world
goes back to Monday; the Quiet Hour remember because of soot; and every time, the bite in the sun grows. *Every Wake costs
a day of sun.* The Snuffers have been trying to save the world. The party, and the player, are the problem; the Ledger is a
list of debts. Keep the scene on the cost, not on "it's a loop".

Pell present: she speaks for the first time. "Two hundred and six. That's how many times I've watched you die. I'd like
it to stay two hundred and six." Absent: Nocturne says, "There's a mime in our order. She's watched you die two hundred
and six times. She asked me to tell you she likes your hat."

**Clues forward.** The archive's index has a section *THE CANDLE: WHERE AND WHO*, pages torn out (Dun protects Hesper).
Pell starts to chalk an **H** and rubs it out. Marisol's map has a margin note in a young woman's hand: *"The Lamplighter
knows the stair. Ask H."* Her sketch of the 1100 party has the Lamplighter's face smudged with ash.

**Hook.** The Snuffers beg the party to let the century end quietly, but the Tallow is spent and the Coal is paint: doing
nothing is night. They go on. Nocturne: "Then don't die. It would make such a nice change." On the road out a post-kite
finds them, the handwriting shaky: *"The candle's gone from the bar. Someone took it in the night. Please be careful.
Please come back. — H."* Barty defends Nan at once: "She lit it for luck. She didn't know." They know which candle now.
Not who lit it first.

## 11. Act 3 outline: "Closing Time" (the Tallow Peaks and the Blank) · milestone 2

**Goal.** Catch the candle thief before he reaches the Wickspire. Sister Nocturne admits what her leader hid: the candle
is the end of the Kindle's own wick. Snuff it and the Unburning ends, but the sun can never be whole again: one long
night, which her leader thinks kinder than a thousand short days.

**Flow.** The Tallow Peaks → Glasswing Glade (stained-glass moths, the last riot of colour) → the Cloister of the Quiet
Hour, where the rank and file hold a silent vote on helping you → the Blank, where colour drains from your sprites → the
Wickspire's foot. **Sun-tallow resists fire and cracks under frost**: players who learned "wax melts" must relearn.

**Dun's shop is shut.** A sign on a post: *CLOSED. GONE TO THE RIM. BACK NEVER. — D.* A Snuffer apprentice runs a sad
little stall instead: "He'd have known what you needed."

**Events (ideas).** An Unset cottage that still tries to make tea; the Cloister's vote, in mime; Odo alone holding a pass
against Greylings because "Procedure 112 is the only one I haven't tried"; Roz unable to forecast in the Blank and making
one up: "Outlook: we'll see."

**Boss: the Lull.** Dun in a grey robe, shop-shell bolted shut like a fortress, a giant bell-snuffer for a staff, the Wake
Candle in a jar at his side.
- Phase 1 "Shell Up": weak storm, blunt; resists the rest. Inventory (throws shop stock), ★rehearsed **Sooted Memory**
  ("I've watched you do that four thousand times"), Lights Out (see the review doc: hidden intents are deferred),
  Closing Time (charge) → **Last Orders** (heavy).
- On Break, phase 2 "Shop's Shut" (★reshape): the shell cracks, the shelves spill; faster, weak to spirit. He talks as he
  fights: *"She's your innkeeper. Hesper Vane. I carried her bags up that stair four hundred and eleven times. I watched
  Wendell hold it four hundred and eleven times. The first time she cut the wick because she couldn't watch us die.
  Afterwards she never gave it back, because she couldn't bear not having it. Just in case. A hundred years, just in
  case. She's lit it again. She'll always light it again."*
- At his final Break he has the snuffer over the candle. He doesn't. "I've watched you die four thousand times. I've
  never once watched you win. I'd quite like to." He hands you the candle.

**The twist.** Nan Hess is Hesper Vane, Lamplighter of the Eleventh Kindlewake. She cut the end off the sun's wick, founded
the inn with the Lantern over the bar and Wendell in the garden, and has sent parties up the road for four thousand
mornings, reading how they died and lighting the candle again. Recontextualises: her age; the Button's XI; the Thursday
pie; letters signed "H."; Gus's note to "H."; the well's young woman with brass buttons; Ashlar's "Wendell"; Clem's oldest
wax; Dun's "don't sit by the candle". She did it out of love.

**Hook into the finale.** As Dun sits down in the grey, a great kite descends: the Kindlewake Inn's painted sign, rigged as
a kite by Tobias Glee. In its basket: Nan Hess, Cinders the cat, the Ledger and every older volume from her cellar, and a
stowaway Odo. "Hello, Dun." "Hello, Hess." Ashlar present: "...My lady?" She puts a hand on his stone face. "Hello,
Wendell. Sorry. Sorry." Leave a quiet beat (a Fireside-style scene, no choice) before the climb: the reveal needs room.

## 12. Finale outline: "The Gathered Coal" (the Wickspire) · milestone 3

A fixed sequence: three battles and a summit, no map. A wipe here still unburns (the candle burns until Kit sets it back);
its quip: "She lit it again. Of course she did."

**1. The Stair.** The Hush pours up from below; halfway, someone must hold the stair. Ashlar present: "I am not Wendell. I
find I should like to hold the stair regardless." He leaves the party (not KO'd; back in the epilogue). Absent: Dun, shell
to the steps: "Porters go last. It's the rule." Battle: Greylings and Unset things, with the holder's barrier written into
the enemy loop as lost turns (the guest pattern from the act-1 boss).

**2. The Gallery of Wakes.** A spiral hall where the Ledger's soot has drifted up toward the wick for a hundred years.
**Soot Echoes** line the walls: greyed sprites with names and places from the player's real Ledger, topped up with
generic echoes from the older volumes ("Wake 1,204. The baker held the bridge."). Fixed stats, never scaled by how many
runs were lost. The Hush has filled a few; they attack. Each, Cracked, speaks its Ledger line and goes still.

**3. The Summit.** The Kindle hangs overhead like a ceiling of gold, the bite exactly the shape of the missing wick-end.
Nan has come up the keeper's stair. She tells it plainly: 1100, Wendell, four hundred and eleven climbs, the cut wick, a
century of "just in case". The Coal is paint; there is nothing to feed the wick. The party works it out in lines that
depend on who is present. Barty: "The book's warm. Always, like a loaf just out." Clem: "The bees said. The oldest wax."
Gertie: "EVERY HEARTH GIVES SOMETHING!" Barty, quietly: "Every hearth gave *someone*. That's what an ember is." The Ledger
is the Gathered Coal. Put the wick-end back, burn the Ledger, and the sun relights whole; and it's over: no more mornings
over, the fallen gone for good, this party gets one go.

**Final boss: Hesper.** She can't. She takes the candle and the books. Up here the Kindle's light is pure Grace, and Grace
shows a thing what it is: what Hesper is, under the apron, is twenty-two and still on this stair. She comes out of the
light in Lamplighter's brass. "Let me keep them. I know how they take their tea."
- **Phase 1, the Lamplighter.** Weak spirit, storm; resist fire, slash. Trim the Wick (debuff), Last Orders (multi),
  **Just in Case** (a Rewind heal intent, as the Tidewright's), Mind You Come Back (charge) → For Luck (heavy).
- **Phase 2, the Keeper** (★reshape). She opens the Ledger and Soot Echoes of the player's own fallen stand up from the
  pages two at a time (summons) and fight for her; she heals them: "I fed you." Weak spirit only.
- **Phase 3, Letting Go.** The echoes lower their weapons and walk into the wick one by one; Gertie (or Hesper, if Gertie
  is absent) reads their names. Hesper falls to her knees, old again. The cold that waited where the wick-end should be
  comes down: **the Unlit**, a vast grey hand closing over a candle (★reshape into a new enemy). Hesper fights beside you,
  written into its loop as lost turns where she heals you with the Lantern. Weak spirit, fire; resists all physical;
  Break 8. Hush (debuff), Cold Hand (heavy), Forget (Moxie drain, all), Long Night (charge ×2) → **Never Morning**
  (heavy, all).

**Ending.** Dell trims the wick-end clean. Kit (or Hesper) sets it back with the Lantern. The Ledger goes onto the wick and
catches, warm, like bread. The Kindle relights whole: the brightest frame in the game. Credits open with *They were
kindling.*, then every fallen character from the player's Ledger, by Wake, in the order they fell, then: *and three
thousand eight hundred and seventy-one more.*

**Epilogue.** Thursday. The Kindlewake Inn. Nan, old again and fine, takes the pie out of the oven. "Thursday," she says
to nobody, and laughs until she cries. Ashlar is back on his plinth, wrens and all. Odo is Kit's apprentice. Roz: "Outlook
for tomorrow: there will be one." On the counter, a new book, the **Daybook**. First entry: *"Friday. Nothing happened.
Lovely."* After a win, further runs are "tales told at the inn" (world bible 4.8).

## 13. Act-1 Ledger unlocks

Unlocks add options, never numbers. The text is what Nan's Ledger says on the run-end screen.

| Rule | Unlock | Ledger text |
|---|---|---|
| First wipe in act 1 | Roz: start option | "The sky did something odd. Nan has written to the Almanac. Roz Gale will be here by breakfast, complaining about the weather." |
| Recruit Pell on the map | Pell: start option | "A mime was seen in the Topiary. Nan left a note on the caravan. It came back with a drawing of a door." |
| First Wake to reach the act-1 boss | Ashlar: start option | "Nan has noticed the statue is missing from the garden. She's left the gate open for him." |
| Recruit Gertie, or 3 Wakes total | Gertie: start option | "Nan has paid a goat sixty buttons in advance." |
| Beat the act-1 boss | Kit: start option | "Nan has written to Thimble Mill. Kit Brassfinch is coming. She's bringing the machine." |
| Wipe to a Snuffer or Sister Nocturne | Soot Smudge enters the pool | "Grey on the thumbs. Nan didn't write that." |
| Finish E7 / E9 | Moth in a Jar / Turnip War Medal enter the pool | "Nan told Dun. He said he'd keep an eye out." |
| Beat the act-1 boss | Start kit "Frost-jam lunch" (2 Snow Globes instead of 2 Scones) | "There's frost-jam in your kit. Don't ask." |

## 14. Clue map

| Clue | Where | Pays off |
|---|---|---|
| Odo won't let anyone touch the reliquary | Opening | Act 1 |
| The Coal bounced; the thief wore the Lamplighter's boots | E2 | Act 1 |
| "Paint, coal-black... Signed O. Brassfinch"; Procedure 9 | E3 | Act 1 |
| Dell's palace-accounts line; Kit's hypotheticals; Gertie never saw it glow | Dell; Fireside 2 | Act 1 |
| Odo's shape is weak to Grace (he is pretending) | boss phase 2 | Act 1 |
| Snuffers' "Not again", "Please go home"; E5 "You always say yes" | foes; E5 | Act 2 |
| Nocturne's ★rehearsed counter and "You always open with that" | elite | Act 2 |
| Your initials in soot on the stile; thousands of tallies | E4 | Act 2 |
| The pond's rows of grey reflections | E11 | Act 2, finale |
| Roz's sky shows tomorrow as today | Fireside 2 | Act 2 |
| Pell knows Gerald's name; circles; silence | Firesides; recruit scene | Act 2 |
| Dun's "Better than last time"; "Everything you'll need (again)" | shop | Act 2 |
| Mothersole's "I'd swear I'd catalogued them before" | E7 | Act 2 |
| The Ledger's first page: *Wake 1*, a longer number rubbed out underneath | Ledger screen | Act 2, finale |
| "A pie in for Thursday"; Kindlewake Morning is a Monday | opening, every Wake | Acts 2-3, epilogue |
| "Don't sit by the candle"; Clem's oldest wax | shop; Fireside 2 | Act 2 (candle), act 3 |
| Letters signed "H."; Gus's note to "H." | E6; E10 | Act 3 |
| The well's young woman with brass buttons; the Button's XI | E8; keepsake | Act 3 |
| Ashlar: "She called me Wendell" | act-2 Fireside | Act 3 |
| The Ledger is warm; the cat sleeps on it; "every hearth gives something" | world; opening; Fireside 1 | Finale |
| The Tidewright's Rewind | act-2 boss | Finale (Just in Case) |

# Kindlewake: critical review of build 1 (milestone 1, played)

> **SPOILERS.** Played 2026-10-28 at 800x400 from a fresh Ledger. Run 1 (Barty/Dell/Clem, by hand) cleared act 1 via
> both Bigwigs, then ran Auto+Fast in act 2 until Auto soft-locked. Run 2 (plus Kit; shop, events; boss on Auto) wiped
> in phase 3. Run 3 (Ashlar/Roz/Clem) went to the first Fireside. HP/damage numbers are skipped.

## Verdict

The bones are good, and in places the game is already charming. The timing ring reads instantly, BRIGHT! has a real
freeze-frame click, and event sheets are crisp and funny. Sister Nocturne is the best thing in the build: the eye
marker, "watching for repeats", "I know." and "...That's new." teach a rule before they punish it, and Barty's "We
haven't done anything yet." / "You will." got a laugh. A wipe teaches and widens the roster.

It is not ready to publish. Four things break the experience a paying player meets first. The font turns every "fi"
and "fl" into "A" ("Are", "Arst", "BrassAnch"). Weaknesses, the core decision, are invisible in battle. The teaching
curve isn't implemented, so fight one can open with an unwarned heavy. And the act-1 payoff is broken twice over: the
boss's new name is printed *before* each reveal, and the act-end scene never plays. Behind those: Break often pays
nothing, MP starvation turns elites into Guard-spam, and much written humour isn't wired up. Most fixes are small.

## P0: must fix before publishing

1. **Ligatures corrupt text everywhere** (`src/style.css`, canvas text in `src/ui/battleView.ts`/`fx.ts`). Pixelify
   Sans maps the "fi"/"fl" ligatures to an "A"-like glyph: "weak to frost, Are", "Gutter in the Arst act", "Aour-dusted",
   "hooded Agure", "Kit BrassAnch". Fix: `font-variant-ligatures: none;
   font-feature-settings: "liga" 0;` on `body`, inputs and buttons (verified: fixes DOM text). Canvas text ignores
   that CSS; insert U+200C between "f" and "i"/"l" in the canvas label/float helpers.
2. **Weaknesses are invisible in battle** (`src/ui/battle.ts` `describe`, `battleView.ts` `drawEnemy`,
   `battleMenu.ts`). The only way to learn a weakness is tapping an enemy outside targeting, which nothing tells you.
   Fix: (a) draw the enemy's weak types as small type-colour dots or tags under its HP bar, with resist shown dimmed and
   immune crossed; (b) in target mode and in the Skill list, mark each option "WEAK" / "resist" / "immune" against the
   highlighted foe; (c) on the first battle of a fresh Ledger, one message: "Tap a foe to read it. Hit what it's weak
   to." Without this, Break, the roster's type spread and the map dots mean nothing.
3. **Boss reveal is spoiled by the Break message** (`src/ui/battle.ts` `case 'break'`). The engine renames the boss
   before playback, so the log reads "Lamplighter Odo Brassfinch is BROKEN!" and *then* "the hood falls back, and it
   is...". Same for "The Duskmother, Hushed is BROKEN!". Seen in both runs. Fix: when a `phase` event follows the
   `break` for the same target, print the break line with the *previous* shape's name (store `prevName` on the phase
   event or snapshot names at step start), or just "It is BROKEN!".
4. **The act-1 ending never plays** (`BOSS_MESSAGES.a1_thief.after` in `src/data/text.ts` is not referenced anywhere in
   `src/ui`). After the boss, the player goes straight to the act-2 map: no Odo in the fern, no paint, no Lantern history,
   no reason to go to the Observatory. That is the act's punchline and the hook for act 2. Fix: an `openActEnd()` sheet
   in `src/ui/nodes.ts` before `toMap`, showing `after.text`, then `byMember`/`byFlag` lines for who's present, with one
   "Onward" button. Also show `bestiary` there.
5. **Teaching bands are not implemented** (`src/engine/run.ts` `genMap` `pickEnc`). It picks from the whole tier pool,
   so 69% of column 0-1 fights (300 seeds) are not teacher packs. Seen in play: fight one Toll Goat opening on Gore;
   column 1 Sheetling opening on Smother; Luncheon opening on Snap Shut. Fix: add a `band` (or `cols`) field to
   `EncounterDef` and filter by `n.col`. Also start normal foes' patterns so a heavy is never the first intent in
   columns 0-2.
6. **Auto can soft-lock forever** (`src/engine/bot.ts`, enemy `summonCap`). Against the Colossus, Auto kills Jamble
   after Jamble (A to G) while the Colossus sits at full HP. It never ends. Fix: a per-battle total summon cap (e.g. 3
   summons per summoner), routing summons when their summoner is routed, and bot targeting that prefers the summoner
   once a summon is up.

## P1: should fix for milestone 1

**Combat feel and rules**

1. **Break often pays nothing** (`src/engine/battle.ts` break/recover). In 9 observed Breaks, 5 "shook it off" before
   any hero acted (Snuffer, Nocturne, Cawdle, Luncheon, Wasp). Fix: on Break, push the foe's `tick` back by one turn
   cost, so at least one hero always acts into the x1.5 window. Also say it: "Broken! Takes 150% until it recovers."
2. **MP never refills between fights** (only Rest and level-up). By the first Bigwig, Barty and Dell had 2 MP each, and
   the elite became a Guard-fest. Fix: restore 50% MP (or all of it) after each victory; keep HP carry-over.
3. **Odo's phase is a blip.** In run 1 it lasted two hero actions. He never spoke and the Procedure jokes never played.
   Fix: phase 2 can't be Broken (chips ignored) until Odo has acted twice, or enters with `breakNow` locked for 2 of his
   turns.
4. **The boss gets less ceremony than elites.** Its intro is a plain message line that scrolls into the grey "previous"
   slot, truncated. Fix: the same `bigLine` banner elites get.
5. **KO poses play before the blow lands** (`battleView.ts` passes `ko: c.ko`, the engine's final state). During
   Totality, Dell and Clem lay greyed out while their bars still read 59/59. Fix: drive the KO pose from the vis state,
   set in the `ko` event.
6. **Auto never taps** (`battle.ts` `heroTurn`/`enemyTurn`), so every hit and guard on Auto is Cold. Auto is weaker than
   the sim's bot and looks broken. Fix: when Auto is on and the player hasn't tapped, grade `good`, or label the button
   "Auto (you still tap)".
7. **Terminology collides.** "WEAK" pops for a weakness hit, and "Weak" is also the attack-down status. "Cracked" is
   the defence-down status, but the tips use "Cracked"/"Crack"/"Set" to mean Break. Help says Perfect/Good/Miss; the game
   says Bright/Warm/Cold. Fix: the UI says BREAK/BROKEN. Rename atkDown to "Feeble" and defDown to "Soft" (doughy, on
   brand). Rewrite tips 1-4 to say Break. Help uses Bright/Warm/Cold with the plain words in brackets.
8. **Rehearsed ignores Guard.** Dell Attack, Barty Guard, Dell Attack got countered, though the desc says "twice in a
   row". The eye marked it; reword the desc and hint: "the last command anyone used (Guard and Swap don't count)".
9. **Reloading mid-fight restarts the fight** at pre-fight HP, a free retry. Count an abandoned fight as a loss, or
   resume it.

**Readability on a phone**

10. **Hero HP/MP numbers are 7px and 6px** (`drawHero`), and enemy names are 11px. Minimum 10px for numbers and 12px
    for names. Status chips are 12px icons with no names, and Stone and Cracked look alike (two blue shields). Fix:
    16px chips, buff/debuff colour-coded backgrounds, and a tap on a hero lists statuses with turns (`describe` already
    does it; surface it).
11. **The active-hero triangle** draws above the hero's box and lands beside the hero above (Barty's bar on Dell's turn).
    Fix: draw it at the hero's left at mid-height, or drop it and rely on the ellipse plus the gold name.
12. **Summons overlap the big enemy.** Jamble B's intent pill covered the Colossus's name and HP bar. Fix: reserve
    slots around large enemies, or stack summons in a column left of them.
13. **Map dots carry no signal** (`map.ts`). They show the union of all foes' weaknesses, so most nodes show 4-5
    colours. Fix: show enemy heads and count on the node; on tap, list foes with their weak types; mark a pack with a
    heavy with "!!".
14. **Spark picks are buried** in the Party sheet; the reward screen just says to go there. Fix: offer the pick inline
    on the reward sheet, one card row per character.
15. **The reward sheet's primary button is "Skip keepsake"**, so a stray tap or Enter throws away the relic. Fix: make
    Skip a ghost button and require a pick or an explicit skip.

**Structure and decisions**

16. **Act 1 is light on fighting.** Average path: 1.25 to 2.7 normal fights. 75% of maps allow a path with at most one
    normal fight, and 82% let you skip both Bigwigs. Cause: `genMap` places 2 elites, a shop, 2 recruits, 1-2 camps
    and 3 events on 10-12 inner nodes. Fix: 2 events, 1 recruit (plus Goat Customs), and use 3 rows in more columns.
    Aim for 3-4 fights on every path and one Bigwig on most.
17. **Recruits join at Lv 1, and the Wagon earns 70%.** Kit joined at Lv 1 when the party was Lv 2, and Gertie
    trailed by 2 levels. Fix: join at the lowest Front level; bench XP to 85%, or let the Turnip Medal be the only
    full-XP source.
18. **In-battle swaps revert after the fight**, with no explanation. Either persist them (preferred: the Wagon
    matters) or show "Back to the usual line-up".
19. **The Bag can't be used on the map.** Scones only work in battle, so a party walks into a Bigwig at 11 HP holding
    two heals. Allow consumables with `target: ally` from the Bag sheet.
20. **Abandoning a Wake ("Start fresh") loses Ledger credit**, even after beating the act-1 boss. Record act clears and
    unlock checks at the moment of the boss win.

**Humour wired, not just written**

21. **Unused content** (grep shows no references): `EVENT_VARIANTS` (the stile initials, "Ten out of ten. Note the
    handwriting", the cake), `THINGOMATIC` ("It's *meant* to make tea." / "It did something else."), the boss
    `bestiary` line, each unlock's `ledger` line (Nan's notes: "Roz Gale will be here by breakfast, complaining about
    the weather"); the end screen shows the bare rule instead. Wire all four.
22. **Fireside scenes need Barty.** Gerald is all Barty, so a Roz/Ashlar/Clem party got no scene. Add a generic
    Fireside for parties without the starters.
23. **Battle text is mostly "X uses Y!"** Perfect lines fire at 20%, and level-up lines repeat every level. Raise
    perfect lines to 35% (max once per fight per hero), add two level-up lines each, and give lures and debuffs a line
    ("Shiny!": "Dell looks for her button.").

**Twist protection**

24. **Act 1 over-plants act 3 again.** The letter is "— H." on Kindlewake Inn notepaper. The Abbey shows Gus's note to
    "H." from a century ago. The well remembers "a young woman, brass buttons, a hundred years back". The Button relic is
    "polished for a very long time". Together that is Nan = century-old H. in one act. Fix: sign the letter "— Nan" or
    "— the Inn", and keep Gus's "H." as the only H. in act 1. Do not wire Barty's "That's Nan Hess" variant onto that
    letter.
25. **Odo's reveal sprite** is a yellow armoured blob, and phase 1 is a bright bee, not "an enormous grey moth with a
    hooded rider". The visual punchline doesn't land. Give Odo a humanoid hero-family base in Guild livery, and phase 1
    a grey moth.

**Sound**

26. `music_camp.ogg` is never played (no `music('camp')`), so camp, shop and events keep map music. `sfx_levelup`
    never plays. Victory uses `confirm`, not a jingle. A perfect attack plays `perfect` twice (on the tap and on the hit
    event). A perfect guard sounds the same as a good one. Fix: camp track for Fireside, shop and event sheets; levelup
    on the reward sheet; a victory sting; one `perfect` per hit; a brighter variant for STEADY!.

**Death**

27. "Kit took 22 ... with 9 HP left" is ambiguous; write "Kit (9 HP) took 22". Add a **turning-point line** for the
    fight's biggest action ("Totality hit three of you for 66. Eclipse warned you twice. Guard halves it."). That is
    the run's real lesson, and the last 12 messages had already scrolled past it.

## P2: later

1. **Art mismatches.** Battlers vs portraits: Dell is a ninja, Clem a samurai, Gertie a pirate, Roz a bearded wizard,
   and Barty and Ashlar share the red-faced brute portrait. The Colossus is a green gourd, the Duskmother a dragon.
2. **The roster on a fresh Ledger** is "Choose three" from three. Pre-fill them, and show locked silhouettes with their
   unlock hint. Add a "NEW" badge on fresh unlocks.
3. **The intro** has no art and no goal line. Add "Get the Coal back from whoever took it. Be home by Thursday."
4. **A Perfect that does 2 damage** (resisted, Stone) gets the full burst and shake. Scale the flourish with the result.
5. **Percentage DoTs** (Burn 8%, Poison 6% of max HP) did 32-48 a tick to Bigwigs and the boss. Cap DoT on bosses by
   rule (e.g. 3%), whatever the numbers become.
6. **Shop purchases** are one tap with no undo.
7. **The title tagline** is white on pale sky. Add a dark backing or stroke.
8. **Touch hints** read "Press ? for keys" and "Arrows pick, Enter goes". Hide them when `(pointer: coarse)`.
9. **No mute or settings in battle.** Add a gear on the battle toolbar.
10. **Hover/focus descriptions leak** into the message line (Knead's text printed before "Barty uses Cold Proof").
11. **"Cawdle: Shiny!!"** gets double punctuation from the intent name plus "!".
12. **Ledger rows** show the raw tag "starter", and Wakes are unnumbered ("Wake 1").
13. **Word drift.** The Keepsakes empty state says "Bigwigs, happenstances" while the map says Elite and Event. Pick
    one glossary.
14. **Timeline** shows blank pink circles for some foes (no head crop) and a stray ▼ after the strip.
15. **"Party healed"** for a 20% heal. Say "Everyone heals a little (20%)".
16. **The bridge backdrop** is busy orange planks behind orange/brown sprites, so contrast is low. Dim it 20%.

## What's working (don't break it)

- **The timing ring**: TAP!/GUARD! label, gold inside the window, 500 ms lead, 80/220 ms windows felt fair; BRIGHT!
  freeze-frame.
- **Sister Nocturne**: entrance bark, Barty's reply, the eye on the repeat command, "watching for repeats", "I know." over
  both sides, "...That's new." on Break, "Go home. It's kinder." on rout.
- **Event sheets**: readable at phone size, costed choices, subversive outcomes. "*No suns.*" at the well is a perfect
  quiet plant.
- **Recruit scenes**: Gertie's key on the nail, Kit on the backwards sail.
- **Dun**: greeting, the buy line ("Better than last time"), the leave line.
- **Character lines**: "Ten. Note the wrist.", "I've risen! Sorry. Baking joke.", "As predicted!", KO lines, and Kit's
  "I painted it, Uncle Odo" at the reveal.
- **The Wagon**: "Kit jumps in!" when the Front falls is exactly the bench mattering.
- **The end screen**: killer-keyed quip ("The moth goes home. You don't."), last moments, unlocks; run 3 felt different.
- **Fast** halves fight time without touching the timing windows.

# Kindlewake: critical review of the lore and story (pre-content, milestone 1)

> **SPOILERS.** Same policy as the other `SPOILERS-*` files. Reviewed: `SPOILERS-world.md`, `SPOILERS-story.md` (both now
> revised in place), against the design spec and the engine as of 2026-10-28 (`src/core/types.ts`, `src/engine/battle.ts`,
> `src/engine/run.ts`, `src/engine/stats.ts`).

## Verdict

The world is good: specific, warm, and built around one idea (warmth as fuel, grief as the leak) that carries a four-step
twist ladder with an earned emotional finale. What was wrong was not the writing but the fit. About a third of the act-1
content described mechanics the engine cannot express or the spec contradicts. The act-1 enemy table let one verb (Bake)
clear the act while punishing the starting tank's verb. Act 1 also over-planted the act-3 twist, and the Wake numbers
contradicted the player's own Ledger. All of that is fixed in the docs now. Milestone 1 content can be derived from them
with two small engine additions.

## What changed and why

### 1. Mechanics the engine can't do (biggest change)

Every ability, spark, relic, trinket, weapon, intent and event outcome in story sections 4-9 is now written in terms the
engine supports (`Hit`, `Effect`, `PassiveId`, `SparkEffect`, `Outcome`) or one of the two approved additions (marked ★).
The main rewrites:

- **Weakness reveal was everywhere** (E2, E5, E7, Inkwhistle's Compass, Garden Gossip, Long-Range Forecast, the Almanac
  relic). The spec makes weaknesses visible (the map shows them on fight nodes; the battle UI already lists them), so all
  "reveal" rewards were worthless. They are replaced with XP, items, flags or other effects.
- **Event outcomes that don't exist**: Moxie restore, "status for the next fight", "take a spark now", a temporary shop
  discount. These are replaced with `heal`/`hurt`/`xp`/`stat`/`item`/`flag`.
- **Trinkets were "+3 def" and the like.** `ItemDef` has no stat field, only a passive, so every trinket now maps to a
  `PassiveId`.
- **Sparks**: about 15 of the 48 used effects outside `PassiveId` ("guard grants regen", "Steady guard dodges", "kill
  refunds Moxie", "+20% vs debuffed", "immune to poison", "swap is free"...). They are remapped to real passives or new
  abilities. Each character now has two or three abilities, one or two upgrades, two or three passives and at most one
  stat bump.
- **Kit's Thing-o-Matic** rolled a random damage type. `Hit.type` is fixed. It is now a three-hit rhythm across frost,
  storm and spirit, so it finds weaknesses by trying everything. The randomness lives in a UI flavour pair ("It's *meant*
  to make tea." / "It did something else."). This keeps the joke and the wildcard role.
- **Shock on enemies does nothing** (it only blocks Guard and shrinks timing windows, and enemies do neither). Roz's
  Thunder Warning and Gertie's Lungs of Brass no longer shock; nothing enemy-targeted applies shock.
- **Gold-stealing intents** (Cawdle, Toll Goat, Baron) can't be done in battle. Cawdle's "Shiny!" is now a `delay` on a
  hero ("you look for your button"), which is cute and readable. The others are cut.
- **Nice finds kept as features**: `delay` on a Cracked foe extends the Crack, because recovery happens on its turn. That
  is now Gertie's Order! Order!, plus a tip. Bleed doubles Break chips, which is now Gertie's Public Notice. An enemy
  ability aimed at the party with a heal effect heals *you*, which the Lurking Luncheon's lure and the thief's thrown
  sandwich both use.

### 2. Act-1 weakness spread

Before the fix, fire was a weakness of 9 of the 16 normal foes and resisted by none. Blunt, the starting tank's verb, was
resisted by 11 and a weakness of 2. A Bake party cleared act 1, and Barty felt bad to play. The table is rebalanced. Every
verb is now a weakness of four or five foes. Bake has resisters (Trundlesnail is wet, the Turnipcutter is metal). Pound
has real targets (bees you swat, crows with hollow bones, clockwork, shells). The reasons are in the world bible's verb
table, so future acts can follow the same logic. There is now an encounter table (13 packs plus 6 event fights), each
checked so that no single verb clears it. The early columns use only "teacher" foes with no heavies.

### 3. Twists and planting

- **Act 1 (Odo, paint)**: heavily planted and guessable. That is fine. In a roguelike the act-1 twist is a surprise once
  and a running gag after, and the Scooby-Doo unmasking is the joke. I added a mechanical plant (the Odo phase is weak to
  Grace because he is pretending) and fixed a timeline bug. Odo "dangling three days" made it Thursday before act 2, which
  broke the "no party ever reaches Thursday" payoff. There is now an explicit Monday-to-Thursday schedule.
- **Act 2 (the loop costs the sun)**: good. The sting is the cost, not the loop. Sister Nocturne's elite gimmick now puts
  the plant into the player's hands: she counters repeated commands (★rehearsed). They *feel* "she has seen this before"
  an act before they are told. The tagline "The people come back. The kindling doesn't." is the act-2 thesis, so it moves
  out of the title pool until act 2 has been seen.
- **Act 3 (Nan is Hesper; Dun is the Lull)**: badly over-planted in act 1. Players replay act 1 dozens of times before
  they see act 3. Gus's note addressed to "Hess", Ashlar's "she called me Wendell", and the Button keepsake's "Nan's
  apron is missing one" together solved the twist before act 2 had even named the candle. Fixes: the note now says "H."
  (the Abbey thinks H. was his cat), Wendell moves to an act-2 Fireside, and the Button flavour no longer names Nan. A
  planting rule is now in both docs: act 1 plants act 3 only cryptically.
- **Finale**: it earns its turn. The "the Ledger is the Coal" logic is planted from the opening motto onward, and Hesper
  fighting beside you in phase 3 rescues the "kindly innkeeper as final boss" risk. One rule break is fixed: she used the
  candle to unburn *herself* to age 22, which the reset rules don't allow. Now the summit's light is pure Grace, which
  shows a thing what it is, and what she is is twenty-two and still on that stair. This is consistent with the Grace verb
  and explains her spirit weakness. The act-3 reveal now gets a quiet scene with no choices before the climb.

### 4. Reset and Ledger holes a player would poke

- **Numbers.** Pell's "206 times", the Archive's "Wake 3,880", the Tidewright's 4,117 and Dun's "four thousand" could not
  coexist with a player whose Ledger says Wake 9. Sooted characters saying "you always" on the very first run made no
  sense either. Fix (world 4.2): the loop ran 3,871 times before the player first signs. Nan started a fresh volume (page
  one says *Wake 1*, with a longer number rubbed out underneath, which is a lovely plant). The old volumes are grey in her
  cellar. Soot fades, which explains why Nan relies on new pages, and why the Ledger unlocks (who she sends for) change
  with the player's runs. The finale credits end "and three thousand eight hundred and seventy-one more."
- **Wipe = gone; the Ledger adds options, never stats**: coherent. I added an explicit rule that real Ledger data supplies
  names, sprites and lines, never stats.
- **The pond (E11)** no longer needs Ledger data. With the backlog canon, its rows of grey reflections are your own
  current party, so the UI just greys the party sprites.

### 5. Humour

Mostly it lands: Gertie, Dell's scoring, the bylaw goats, Procedure 9, Gerald, the well. Flat or generic lines were
rewritten. Four death quips were swapped for character-specific ones ("Dell would like it noted that she gave that a
four.", "Gerald survived. Gerald always survives."). I added **19 killer-keyed death quips**, the single biggest humour
win, because death is when the player reads most closely: "Overtaken by a snail. Take a moment with that.", "You were
told not to eat anything a hamper offers you." Other changes:

- Fireside 2 was a seven-clue info dump. It now opens on a joke (Dell scores Barty a nine "out of ten" and he has to walk
  round the fire) and drops the act-3 clue.
- Recruit scenes were added for the five recruits (Pell steps out of her box through a door that was always there).
- Level-up lines were added for all eight.
- Elite barks were added: Nocturne says "You always open with that" *before anyone has acted*, and Barty answers "We
  haven't done anything yet."
- Two event choices now subvert the obvious read. Respecting the Guild sign gets the best item ("Nobody *ever* respects
  the sign."). Wishing for the sun gets one on the house.

### 6. Elites and boss

- **Baron**: "toll rises when not hit by a weakness" needed stacking and conditional buffs. It is now a visible price
  ladder (Ten → Fifty → One Hundred → PAY UP). Break and delay push the top rung back. It is readable, fair, and uses the
  engine as is.
- **Conserve Colossus**: "splits when hit wrong" became "sheds Jambles that heal it" (summon plus the Jamble's ally-heal
  intent). The lesson is still to clear the jam.
- **Nocturne**: ★rehearsed, with an eye icon on the would-repeat command so it teaches before it punishes.
- **Boss**: one enemy, three shapes. Phase changes need different weaknesses per shape, and the old doc silently assumed
  the engine could do that. It can't, so that is ★reshape. Without it, an early burst could also kill the boss in phase 1
  and skip the Odo reveal; the ★reshape rule prevents that. Odo's phase is now short (Break 4) and starts Cracked (he's in
  a fern) as a comic breather. Odo-as-guest is written into the Duskmother's loop (see below). The double Eclipse is the
  act's final exam.

### 7. Scope (act 1)

The act-1 checklist is complete: 8 characters (all 8 roles, all 7 verbs in starting abilities and weapons, starting trio
missing frost and storm on purpose), 16 normal foes + 3 elites + 1 three-phase boss (≈20), 13 encounters + 6 event fights,
12 events, 2 Firesides, Dun's shop, 35 death quips, 16 taglines, 12 tips, 12 relics, 10 trinkets, 8 weapons + 8 starting
weapons, 8 consumables + 3 event-only, 8 Ledger unlocks.

### 8. Length

The story doc is about the same size as before (~12.5k words of prose). I cut the reviewer-notes section and tightened
the act 2, act 3 and finale outlines. I added content agents need: encounters, recruit scenes, killer quips, mechanical
notation. Nothing left in it is unimplementable. Acts 2-3 and the finale are kept as outlines because they carry the
planting.

## Engine-ask decisions (story section 16)

Stingy rule: two small additions for milestone 1.

| Ask | Decision | Notes |
|---|---|---|
| **Boss phase reshape** (not asked, but the boss silently needed it) | **(a) Approve** | Phase entries gain optional `name`, `sprite`, `size`, `weak`, `resist`, `immune`. While a phase remains, lethal damage leaves the enemy at 1 HP and triggers the next phase. Bundle a one-liner: elite and boss patterns start at index 0 (normal foes keep the random start). Used by the act-1 boss, the Lull, Hesper and the Unlit. |
| **Counter on a repeated ability** (Nocturne) | **(a) Approve as `rehearsed`** | A new enemy `PassiveId`. When a hero's command key (`attack`, a skill id or an item def) equals the previous hero command this battle, each living `rehearsed` enemy counters the user (~60% of its atk, ignores Guard) and the engine emits `counter` plus the message "I know." The UI marks the would-repeat command with an eye while one stands. The bot must alternate. Reused by the Lull's Sooted Memory. |
| Guest ally (Odo; Hesper) | **(b) Fallback** | The guest's help is written into the boss's own loop as intents of kind `wait` named "Odo: Protect the Public", whose ability targets `enemies` (the party, from the enemy's side) with a barrier or heal effect. The foe "loses" those turns to the guest. No new combatant. |
| Splitting enemy (Colossus) | **(b) Fallback** | A summon intent (Jamble, cap 3), plus Jambles' Preserve intent (heal `allies`). |
| Hidden intents (the Lull) | **(c) Not for milestone 1** | Act 3. Revisit at the milestone-2 review. The likely fallback is a phase with `pattern: 'random'` and generic intent names. |
| HP rewind (Tidewright; Hesper) | **(c) Not for milestone 1** | Act 2 and finale. The fallback is already written into the outlines: Rewind is a telegraphed heal intent you Crack or delay. |
| Real Ledger data as enemies (Soot Echoes) | **(b) UI/data only, milestone 3** | Fixed stats; only the name, sprite and line come from the Ledger, padded with generic backlog echoes. The act-1 pond no longer needs Ledger data. |
| Routed-not-killed | **(b) UI wording only** | No engine change: KO text says "routed" (glossary), and the sprite scarpers instead of fading. |

**Engine facts that bit the content** (bugs or no-ops; not features, flag to the engine owner):

1. A negative `mp` effect (Moxie drain: Murkwing, Duskmother) can push MP below 0. It needs a clamp in `applyEffect`.
2. `shock`, `taunt`, Guard-related effects and `counter` do nothing on enemies. Don't author them on enemy targets.
3. `guardAll` and `breakBonus` exist in `PassiveId` but are implemented nowhere, so nothing uses them.
4. `cheatDeath` and `reviveOnce` share one per-combatant flag, so a Barty with Second Rise and the Tide-Clock relic gets one
   save, not two. That is acceptable; describe it in the relic text as "once per battle".
5. Event `recruit` fails silently on a full party, and `gold` clamps at 0, so "pay 60" can be bought with 12 buttons. The
   UI must grey out choices whose outcomes can't apply (gold too low, party full, bag full) and say why.
6. Event `heal`/`hurt` hit the whole party, Wagon included, and touch HP only.

## Content-derivation notes (for the agent writing `src/data/*`)

- **Source of truth.** The story file, sections 4-9 and 13. The world file explains *why*. Where they disagree, the story
  file's tables win.
- **Notation.** `type power` is one `Hit`. Physical verbs scale `atk`; "mag" means `scale: 'mag'`. `chip N` sets
  `Hit.chip`. `[status turns, chance]` is a `status` effect; add `who: 'self'` where it says self. "delay 1.6" on an
  ability is `AbilityDef.delay` (turn cost). `delay 0.6` / `delay -0.6` on a target is the `delay` effect; negative pulls a
  turn sooner. `hasteSelf -0.4` is the effect.
- **Barrier `power` is flat.** Set it per band (roughly 20-30% of the caster's level-appropriate max HP) and expect to
  retune after the sim.
- **Enemy targeting.** On an enemy ability, `target: 'enemy'` picks a hero (taunt-aware). `'enemies'` is the whole party,
  which is how Offer Sandwich, Throw Sandwich and the guest "Odo: Protect the Public" turns work. `'allies'` is the enemy
  side (Jamble Preserve). `'self'` is for buffs and charges. Charges are `kind: 'charge'` with a self `atkUp`, as in the
  placeholder `e_charge`.
- **Intent kinds.** Use `wait` for Please Go Home, Deflate and the guest turns. Use `heal` for the lures, so the icon tells
  the truth about the effect.
- **Teaching.** Columns 1-2 use only `a1_jam`, `a1_buzz`, `a1_post`, `a1_dusk_early`. Every heavy follows a charge, wait or
  lure in its loop.
- **Boss.** One `EnemyDef`, base shape = phase 1. `phases[0]`: `{ onBreak: true, hpBelow: 0.6, ...odoShape, breakMax: 4 }`.
  `phases[1]`: `{ onBreak: true, hpBelow: 0.35, ...duskmotherShape, heal: 0.5, breakMax: 7 }`. Messages come from story
  5.4. The Kit variant of the phase-2 message is a UI substitution. Tune HP so the whole fight is about 1.5× an elite.
- **Baron phase.** `{ hpBelow: 0.5, pattern: [ten, fifty, hundred, payUp] }`, no reshape.
- **Shop (Dun's Sundries).** Stock is pre-rolled on the node (`MapNode.stock`): about 4 consumables, 1-2 gear, 1 keepsake
  (relic price ≈ 90). Dun's lines are keyed by moment: first shop of a Wake vs later (track with a run flag
  `shop:visited`), buy, can't afford, buy keepsake, leave. Then optional lines keyed by run flags (`wrote_to_nan`,
  `asked_snuffer`) and party presence (Pell, Ashlar, Kit). He never buys, so there is no sell UI. That matches the spec.
- **Flags used.** Automatic: `event:<id>`. Set by events: `agnes` (E2; act-end variant), `wrote_to_nan` (E6; Dun),
  `asked_snuffer` (E5; Dun). No event choice is gated by `requires` in act 1. Gating by Ledger knowledge ("sooted"
  choices) belongs to act 2+, after the reveal, and would need run creation to copy Ledger unlocks into `run.flags`.
- **Recruit outcomes and fights.** Outcomes apply in order, and a `fight` only sets pending. So E12's "Argue" recruits
  Gertie *before* the fight (intended: she shouts from the Wagon), and E9's "Duchy" gives the scythe up front.
- **Event fight encounters.** These are extra `EncounterDef`s with no node (`e_picnic`, `e_snuffer`, `e_specs`,
  `e_duchy`, `e_customs`, `e_pond`).
- **Starting weapons.** Eight entries (story 4.x "Weapon"), separate from the eight drop/shop weapons.
- **Ledger unlocks.** Story section 13 maps onto `UnlockDef` kinds: `starter` for the five recruits, `relic` for the pool
  adds, `kit` for Frost-jam lunch. "Recruit Pell/Gertie on the map" needs the run record to include who was recruited.
  `RunRecord.party` lists the party at the end, which is close enough: accept "was in the final party".
- **Text conventions.** Gertie is all capitals except her KO line. Pell's lines are italic stage directions (the message
  line needs italic support). Halcyran British spelling. Foes are "routed".
- **Taglines.** The three post-act-2 taglines are gated on a Ledger `seen` key such as `act2`. Show only the "always" set
  in milestone 1.
- **Ledger screen.** Number Wakes from 1. Optional flavour: on page one, "Wake 1" with a struck-through longer number.

## Open risks

1. **★rehearsed annoyance.** If the eye marker is missing or unclear, Nocturne will feel like a gotcha. Playtest that she
   reads as a puzzle. If the sim shows bots losing to her far more than to the other elites, lower the counter to about
   40% atk.
2. **Boss length.** Three shapes at act 1 can drag. Watch turns-per-fight in the sim; the phase-3 `heal` is the knob.
3. **Kit's Thing-o-Matic** is a strong weakness-finder at low MP. Watch its share of chips in the sim.
4. **Act-3 guessability** is reduced, not removed. Nan's name begins with H, and sharp players will connect the letters
   to Gus's note. That is fair play; the guard rail is to keep anything stronger out of act 1.

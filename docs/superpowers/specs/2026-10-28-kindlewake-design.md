# Kindlewake: design spec (mechanics only, spoiler-free)

Approved 2026-10-28. World, story, characters and enemies live in `docs/SPOILERS-*.md`; this document never names them.

## 1. What it is

A browser party RPG with turn-based, timed-hit combat (Paper Mario feel on a Final Fantasy skeleton), built as a roguelike: a
run is 3 acts plus a finale, 30-60 minutes, on a branching node map. A total party wipe ends the run. A persistent **Ledger**
carries unlocks between runs. The lore explains both the wipe and the Ledger.

Targets: phones in landscape first (iOS Safari, Android Chrome), desktop browsers second (keyboard + mouse from day one).
Hosted on GitHub Pages (`reznok/kindlewake`). Bright, colourful 16-bit sprite art from CC0/CC-BY packs. CC0 music and SFX
with a mute toggle. No accounts, no server: everything in `localStorage`.

## 2. Run loop

- **Start**: pick a starting trio from the unlocked roster (the Ledger decides what is unlocked), get a seed, enter act 1.
- **Map**: each act is a directed graph of ~12-16 nodes in 6-7 columns, left to right; the player picks a reachable next node.
  Node kinds: `fight`, `elite`, `event`, `recruit`, `camp`, `shop`, `boss` (last column). Paths are visible for the whole act.
- **Fight / elite**: a battle; rewards gold, XP for all six party members (bench included, at 70%), one item drop; elites also
  drop a relic choice (pick 1 of 3).
- **Event**: a short text scene with 2-3 choices; outcomes are stat/gold/item/relic/recruit/status changes, sometimes a fight.
- **Recruit**: a character offers to join; party holds 6 (3 active + 3 bench); a full party may swap someone out.
- **Camp**: choose one: heal the party 50%, or upgrade (pick a spark for one character), or forge (+1 to one weapon).
- **Shop**: buy gear, consumables, one relic; sell nothing (gold only flows in from fights and events).
- **Boss**: act boss; beating it ends the act and opens the next; the finale is a single fixed sequence.
- **Wipe**: run over; the Ledger records the run and applies unlocks; the end screen shows the cause, HP before the last blow,
  unused consumables and the last 12 messages (lessons learned from the dungeoncrawler).
- **Save**: the whole run is one JSON blob in `localStorage`, written after every state change; resume from the title.

## 3. Party and growth

- **Roster**: ~16 characters eventually, 8 in the first milestone; each has a role (tank, striker, mender, trickster, caster,
  warden, support, wildcard), base stats, a growth curve, 4 starting abilities and a spark tree of 6 upgrades.
- **Stats**: `hp`, `mp`, `atk` (physical), `mag` (magical), `def`, `res`, `spd`, `luck` (crit and timing-window bonus).
- **Levels**: XP from fights; level up = stat growth; every second level = pick 1 of 2 sparks (new ability, ability upgrade,
  or passive). Max level 20 in a run.
- **Gear**: 2 slots per character: weapon (sets damage type and power, can carry a passive) and trinket (passive). No armour
  slot: defence comes from the character and sparks.
- **Relics**: run-wide passives held by the party (up to 8), from elites, events and shops.
- **Consumables**: potions, ethers, revives, throwables (damage type items that hit weaknesses), 10-slot shared bag.

## 4. Strengths and weaknesses (the reason to build a party)

- **Damage types**: `slash`, `pierce`, `blunt`, `fire`, `frost`, `storm`, `spirit`. Every attack has exactly one.
- **Enemy profile**: `weak[]` (x1.5 and chips Break), `resist[]` (x0.5), optional `immune[]`.
- **Break**: every enemy has a Break bar (3-8 points). A weakness hit removes 1 point (some abilities 2). At 0 the enemy is
  **Broken**: loses its next turn, takes x1.5 damage until it acts again, then the bar refills. Bosses have bigger bars and
  phase changes on Break.
- **Intents**: every enemy shows an icon for its next action (attack, heavy attack, multi-hit, buff, debuff, heal, summon,
  charge). Heavy and charge intents are the ones to Break or Guard.
- **Roles answer intents**: tanks taunt and guard, menders cure and revive, strikers chase weaknesses, casters cover element
  gaps, tricksters apply debuffs and steal turns, wardens protect the row with barriers, supports buff and extend Break.
- A party that covers at most two damage types will stall against act-2 enemy packs; the map shows upcoming enemy types on
  fight nodes so the player can plan recruits and swaps.

## 5. Combat

- **Order**: CTB timeline (Final Fantasy X style). Each actor has a tick counter; the next to act is the lowest; acting adds
  `1000 / spd` (abilities can add more or less). The top strip shows the next 8 turns.
- **Commands** (active member's turn): `Attack` (weapon, free), `Skill` (MP), `Item`, `Guard` (halve damage until next turn,
  recover a little MP), `Swap` (bench member in, costs the turn). Targets: tap an enemy or ally; auto-target the last target.
- **Timed hits**: every player attack has a timing window at the impact frame; the grade is `miss | good | perfect`
  (damage x0.9 / x1.0 / x1.25, perfect also +1 Break chip on a weakness hit). Multi-hit skills are rhythm taps, one window per
  hit. Enemy attacks have a **Guard** window: tap at impact for `good` (x0.7) or `perfect` (x0.5, and the guarding member
  gains 5 MP). Windows: perfect 80 ms, good 220 ms, scaled by the accessibility setting and `luck`.
- **Accessibility**: settings for window size (normal / wide / auto-good) and for disabling screen shake. Auto-good scores
  every window as `good`, never `perfect`.
- **Bot interface**: the engine takes timing grades from an input layer; the headless bot's `timingSkill` in [0, 1] is the
  probability of `perfect`, with `good` for most of the rest. Balance targets use `timingSkill = 0.4`.
- **Statuses** (10): poison, burn, chill (spd down), shock (cannot guard), bleed, taunt, regen, barrier, atk up/down,
  def up/down. Each has a turn count. Broken is a state, not a status.
- **Fleeing**: not from elites or bosses; from normal fights with a speed check, forfeits rewards.
- **Encounter size**: 1-4 enemies; packs are designed with a type spread so one damage type cannot clear them efficiently.

## 6. Screens (landscape)

- **Battle**: enemies left, party of 3 right (sprites on a bright background), timeline strip top, HP/MP/Break readouts under
  each actor, command menu bottom-right, message line bottom-left. Timing windows draw a shrinking ring on the target; a tap
  anywhere (or Space/Enter) answers it.
- **Map**: the act graph scrolls horizontally; nodes show their kind and, for fights, the enemy damage-type icons.
- **Party sheet**: portraits, stats, gear, sparks, bench swap.
- **Camp / shop / event**: DOM sheets.
- **Title**: continue, new run (roster pick), Ledger (unlocks and run history), settings, credits.
- Portrait orientation shows a "rotate your phone" card over the game; desktop gets hover tooltips and a key legend.

## 7. Ledger (meta progression)

- Records every run (seed, acts reached, cause of death, kills, turns).
- Unlock rules fire on run end: first wipe in act N, first boss beaten, first run with X role, total runs, etc. Unlocks are
  recruits (start-roster options), relics (added to the pool), and start kits.
- Unlocks never make the run numerically easier (no permanent stat buffs); they add options.

## 8. Architecture (TypeScript, Vite, no framework)

```
src/
  core/      rng (seeded sfc32), types, geom, events
  data/      characters, enemies, abilities, items, relics, statuses, encounters, events, acts (content tables)
  engine/    battle (pure, deterministic), run (map, nodes, rewards, party), ledger, save, balance helpers
  ui/        battle scene (canvas), map scene (canvas), sheets (DOM), audio, input (timing windows), sprites atlas
  main.ts
tests/       vitest: engine unit tests, headless bot sim (SIM=1), balance report
tools/       atlas builder, asset manifest/credits generator
public/      sprite atlases, audio
docs/        SPOILERS-* (world, story, enemies, characters), this spec, plans, CREDITS.md
```

- **Engine is pure**: `battle.ts` exposes `createBattle(seed, party, encounter)`, `legalActions(state)`, `step(state, action,
  timing)` and emits events (`hit`, `break`, `status`, `ko`, `turn`) the UI animates; no DOM imports under `engine/` or
  `data/`.
- **Timing** is resolved by the UI before calling `step`: the UI runs the window, collects grades, then steps.
- **Sim**: `tests/sim.test.ts` plays full runs with a greedy bot (weakness chase, heal under 40%, guard on heavy intent,
  swap on KO) and prints act reached, cause of death and timing-skill sensitivity. Balance targets: act 1 boss beaten by 60%
  of bots at timing 0.4; whole run won by 10-15%.

## 9. Content pipeline

- Lore bible and story are written first (`docs/SPOILERS-world.md`, `docs/SPOILERS-story.md`), then characters, enemies,
  events and act scripts are derived from them into `src/data/*`.
- Sprites: CC0/CC-BY packs only, recorded in `docs/CREDITS.md` with licence and URL; a manifest maps every character, enemy
  and tile to a pack sprite. No ROM rips or commercial packs.
- Audio: CC0 tracks (title, map, battle, boss, camp) and SFX (menu, hit, perfect, guard, break, KO), credited the same way.

## 10. Milestones

1. **Full loop, act 1** (this plan): engine, sim, act-1 content (8 characters, ~20 enemies, 3 elites, 1 boss, 12 events),
   all screens, audio, Ledger with act-1 unlocks, deploy. Acts 2-3 and the finale exist as stubs with placeholder encounters.
2. Acts 2-3 content and bosses, more roster.
3. Finale, polish, balance pass with human play.

## 10b. Tone and craft (owner's direction)

- **Goofy humour** baked in: character banter, enemy names and descriptions, event text, item flavour, death quips. Think
  Paper Mario and Earthbound more than grimdark. Humour never undercuts stakes at the moments that matter.
- **Twists and turns**: the story has real reversals (at least one per act, one big one in the finale); events have outcomes
  that subvert the obvious read; some enemies and recruits are not what they seem.
- **What makes games good**: readable decisions with consequences, a satisfying "click" on perfect hits, enemies that teach
  before they punish, a run that feels different each time, and a death that teaches instead of annoys.
- A **game-designer agent** (critical, Opus) has the final say on tone, pacing and twist placement: it reviews the lore and
  story before content is derived from them, and again before each milestone ships.

## 11. Process

- Fable orchestrates; Opus subagents for lore, content design and critical review; Sonnet for mechanical implementation and
  asset work. Every milestone ends with a critical-designer review (`docs/SPOILERS-review-*.md`).
- Spoiler policy: chat, commit messages, README and this spec stay spoiler-free; names, plot, enemies and twists only in
  `docs/SPOILERS-*.md`.

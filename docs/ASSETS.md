# Asset inventory

Scouted 2026-10-28. Everything below lives under `assets/raw/<pack>/` (gitignored, about 1 GB, the music WAVs and the 1000px
"Cute" illustrations are the bulk). Licences and URLs are in `docs/CREDITS.md`; each OGA pack folder also has a `SOURCE.txt`
with the page URL, uploader and licence read from the page. Nothing in `raw/` has been executed. Paths below are relative to
`assets/raw/`.

Score key (1-5, 5 = ship it): **H** hero battlers, **M** monsters, **B** backgrounds, **U** UI, **F** font, **Mu** music,
**S** SFX. A dash means not applicable.

Palette note legend: **bright** = saturated, light, matches the "bright 16-bit" brief; **mid** = fine with a tint pass;
**muted** = earthy / dark, needs recolouring or a bright backdrop.

## 1. Hero battlers

| Pack (folder) | Licence | Contents | Frames / layout | Palette | Scores | Use |
|---|---|---|---|---|---|---|
| `oga-samurai-animated`, `oga-ninja-animated`, `oga-classic-pirate-captain-animated`, `oga-viking-shieldmaiden-animated`, `oga-mechanic-animated`, `oga-ranger-animated` | CC0 | 6 side-view chibi heroes, same rig | Separate PNGs `<Name>/<1x..5x>/<anim>_<n>.png`, frame 40x29 at 1x (character about 16-24 px tall). Anims: idle 4, run 6, jump 3-6, attack 3-8 (Samurai 8, Pirate 5, Ranger 4, others 3), swim 4-6, `x_n` 4-5 misc (damaged / victory poses; Samurai page lists "damaged, victory, crouch, land, fall") | mid-bright, retro, small | H 3 | Main side-view heroes. Draw at 3x-4x (120-160 px wide). No KO frame: fake KO in code (flash, tilt, fall, fade). |
| `oga-classic-knight-animated`, `oga-mr-necromancer-man-animated`, `oga-skeleton-guy-animated`, `oga-musketeer-officer-caonnon-animated`, `oga-gremlin-animated-classic-hero-edit`, `oga-savage-animated-classic-hero-edit`, `oga-classic-hero` | CC0 | 7 more characters on the same template (knight, necromancer, skeleton, musketeer captain, cannon guy, gremlin, savages) | One sheet per character (e.g. 175x141, 164x134, 256x224), small cells, same pose set as above | mid | H 3, M 3 | Fills the roster to 12+ and doubles as enemy humanoids. Slice by hand once and record in the manifest. |
| `oga-tiny-tactics-battle-kit-i` | CC0 | 3 heroes (fighter, mage, cleric) + 6 weapons, isometric tileset | 32x32 frames in files `2024xxxx<class>-<anim><NE\|SE>.png`: attack (128x32 = 4 frames), charging, release, damage, dead, weak (single 32x32), walking (128x64) | **bright**, saturated, dark outline | H 4 (only 3 classes) | Best animation set (hurt and KO present). NE and SE facings supplied per action (pick the one that faces left for a party on the right, or mirror). Weapon overlays `weapons-*attack*.png`. |
| `oga-puny-characters` | CC0 | Warrior, Soldier x3, Archer x2, Mage x2, Human Soldier / Worker, Orc Grunt / Peon / Soldier, Slime; `Character-Base.png` | 32x32 cells, 24 columns x 8 rows per sheet (8 directions per row; idle, walk, sword / bow / staff / throw attacks, hurt, death). Figures are about 12 px inside the cell | muted | H 2 | Extra classes with hurt + death. Too small and dull for hero duty; usable for NPCs and as enemy humanoids. |
| `kenney-tiny-dungeon` | CC0 | 12 hero / NPC tiles (wizard, warrior, rogue, knight, elf...), 10 monster tiles, items, 132 tiles total | 16x16 tiles with 1 px gap, 12x11 grid (`Tiles/tile_0000..0131.png`, hero rows near the bottom), `Tilemap/tilemap_packed.png` 192x176 | **bright**, dark outline | H 3, M 3 | Static fallback heroes, animated in code (bob, lunge, hop, squash). Pairs with Tiny Creatures. |
| `kenney-roguelike-characters` | CC0 | Layered character builder (skins, hair, clothes, armour, weapons) | `Spritesheet/roguelikeChar_transparent.png` 918x203, 16x16 cells, 1 px gap | bright-mid | H 3 | Unlimited distinct 16px heroes by compositing layers; static. |
| `oga-tiny-characters-set` | CC0 | 32 characters (12 male, 20 female) in 4 directions | `32_Characters/Males/M_01..12.png`, `Females/F_01..20.png`, each 64x51 (4 poses at 16x17) | mid-bright | H 2 | Cheap extra roster faces; static. |
| `oga-32x32-rpg-character-sprites`, `oga-2d-jrpg-dot-character` | CC0 | 20 static 32x32 characters (walk / stand / charge); JRPG dot sheet 200x132 | single sheets | mid | H 2 | Extra static poses. |
| `oga-js-actors-aeon-warriors-field-battle-sprites`, `oga-js-actors-aeon-warriors` | CC-BY 3.0 | 4 RPG-Maker-style heroes (field sprites + battle) and faceset | `Heroes_01.png` 288x256 | bright | H 2 | Optional; style differs from the Classic Hero family. |
| `kenney-pixel-platformer` | CC0 | Animated 24x24 characters (walk, jump, climb) | `Tilesheet (Characters).txt` 8x3 | **bright** | H 2 | Reference only; no attack / hurt / KO. |
| `oga-2d-chibi-ninja-8-actions` | CC0 | One smooth (not pixel) chibi ninja: idle, walk, run, jump, climb, sword attack, hurt, death | per-action strips about 125 px tall | bright, vector-ish | H 2 | Style mismatch; skip unless the art direction goes smooth. |
| `oga-cute-heroes` | CC-BY 4.0 | 16 class illustrations (artificer, assassin, barbarian, bard, cleric, druid, ... wizard), transparent PNG inside a gold circle | 1000x1000 each, static | **bright**, painterly | H 2 (not a battler), portraits 5 | Party sheet portraits and roster pick. Downscale to 96-192 px. Not a pixel style. |
| `oga-cute-npcs` | CC-BY 4.0 | 2 NPC illustrations (adventurer, dwarf) | 1000x1000, `.kra` sources | bright | portraits 3 | Event / shop portraits. |
| `ninja-adventure` | CC0 (itch page) | GitHub demo subset only: 4 characters (`ninja_blue`, `samurai_blue`, `samurai_green`, `pig`) | 64x112 sheets (4 directions x 7 rows of 16x16), top-down only | **bright** | H 2 | The full pack (50+ characters, 30+ monsters, 9 bosses, 37 tracks) is not on GitHub: see manual downloads. |

**Hero verdict.** There are 13+ distinct side-view heroes (Classic Hero family) plus 3 fully animated bright 32 px classes
(Tiny Tactics). Nobody has a complete idle / attack / hurt / KO set at 32-64 px in one bright, consistent style, so the
production plan is: Classic Hero family as the roster, Tiny Tactics for 3 classes, KO / hurt synthesised in code, and Cute
Heroes for portraits. See "Gaps".

## 2. Monster battlers

| Pack (folder) | Licence | Contents | Frames / layout | Palette | Score | Use |
|---|---|---|---|---|---|---|
| `oga-50-monsters-pack-2d` | CC0 | 56 monsters (dino, bee, kangaroo, dolphin, golem, sheep, ghost-candle, crab, snake, boss-like beasts), front and back, alternate colourways | 64x64 PNGs `Monsters/Normal Colors/Monster #N Front Normal Color Palette.png` (112 files) + `Alternative Colors/` (112 files); black + 4 colours each | **bright** (alt palettes brighter still) | M 5 | Core enemy roster; static. Alt palettes give elite / variant enemies for free. |
| `oga-tiny-creatures` | CC0 | About 150 monsters and animals: undead, slimes, plants, elementals, beasts, birds, bosses | 16x16 tiles, `tiny-creatures/tiny-creatures/Tiles/tile_*.png`, sheet `Tilemap/tilemap_packed.png` 160x288; matches Kenney Tiny Dungeon | **bright**, outlined | M 4 | Fill every type (plants, undead, elementals) at low cost. Draw at 4x-6x. |
| `oga-32x32-colorful-slimes` | CC0 | 48 cute blobs and creatures in a full hue sweep | `creatures4_.png` 288x224 (9 x 7 grid at 32 px); `creatures4_2.png` is the 2x version | **bright** | M 4 | Slimes, elementals, mascots. |
| `oga-cute-monsters-a-e`, `-f-o`, `-p-z`, `oga-cute-boss-monsters` | CC-BY 4.0 | 58 monsters (abyssal, elementals, golems, goblins, cultists, cthulhu-ish, dragons) + 9 bosses (cinder dragon, goblin boss, hag matriarch...) | 1000x1000 PNG, static, gold-circle backdrop baked in | **bright**, painterly | M 4 (boss 5) | Boss and elite battlers and the bestiary. Not pixel; downscale and optionally posterise. |
| `oga-kicas-enemy-pack` | CC0 | 10 detailed enemies (Basilisk, Caput, Copse Haunter, Fiend, Goop, Ruin Gazer, Trench Rat, Vile Eye, Wicked Gourd, Zoetic Fog) | 144x144 (two 256x256), static; `sample_enemies_0.png` | mid-bright, high detail | M 4 | Elites and bosses. Higher detail than the pixel packs; downscale 0.5x. |
| `oga-plant-and-mushroom-enemies-charset-and-battlers` | CC0 | 8 plant / fungus enemies (pumpkin, chamomile, lotus, fly agaric, nettle, paris herb, morel, ginseng) | `plant_enemy_01..08.png` 268x316; `plant_enemies_charset.png` 576x384 | bright | M 3 | Plant type. |
| `oga-spring-monster-pack` | CC0 | 7 monsters (beenforcer, queen beenforcer, bun bunny, sakura spirit, springling bulb / sprout, springlord) | `springmonsterspack/*.png` 96-338 px | bright | M 3 | Meadow / forest enemies. The RPG Maker screenshots in the original zip were deleted (they show RPG Maker default art). |
| `oga-gilgaphoenixignis-rpg-ennemy-sprite-pack` (`x/` extracted) | CC-BY 3.0 | About 300 pixel RPG monsters in folders 1-3 (beasts, demons, undead, constructs), many with `Alt` and `NB` (no background) variants | 30x30 to 145x198 PNG, 18 at 80x80, 17 at 34x34 | mid (some dark) | M 4 | Largest pixel bestiary; cherry-pick bright ones. |
| `oga-monster-rebirth-pack` | CC-BY 4.0 | 35 RPG Maker 2000-style monsters + overview `monster_rebirth2.png` | 34x34 to 119x136 | mid | M 3 | Extra pixel variety. |
| `oga-boss-cohort` | CC-BY 4.0 | 5 bosses (alvaric, behemoth, terradaemon, medieval elephant, spectre gentleman) at 1x and 2x | 84x90 to 111x178 (2x versions double) | mid | M 3 (boss 4) | Pixel bosses. |
| `oga-dungeon-crawl-32x32`, `oga-dungeon-crawl-supplemental` | CC0 | 3000+ tiles each: `dc-mon` (547 monsters, animals, undead, demons, dragons), `player`, `spells`, `effect`, `gui`, `item`, `dc-dngn` terrain | 32x32 PNG per tile under `crawl-tiles Oct-5-2010/crawl-tiles Oct-5-2010/` | muted-mid (dungeon palette) | M 4 | Deep catalogue for rare types (undead, demons, dragons) and the spell / status glyphs (see section 4). |
| `oga-js-monster-pack-4-ascent`, `oga-js-monster-set-elementals-iii` | CC-BY 3.0 | 10 battlers (GreenGoo, Salamander, Bird, WailingPrince, Shello, Witch, Pirate, LaserDrone, ScoutMachine, Outlaw); an elementals sheet | 64x64 to 128x128; `elementals3.png` 144x176 (`elementals3big.png` 5x) | mid-bright | M 3 | Elementals and constructs. |
| `oga-phantasy-tiny-rpg-mobs-pack-2` | CC0 | 5 machine enemies (Drone, Metal Slug, Observer, Sentinel, Steel Eagle) | 70x86 to 124x110 | mid | M 3 | Constructs. |
| `oga-singular-direction-monsters-battlers` | CC0 | About 20 forward-facing monsters (ooze, crawler, flier, floatguy, bat, bad optics...) | 96x96 to 144x240, sheet `forward_monsters.png` 576x384 | mid-muted, spooky | M 2 | Filler only. |
| `oga-steam-monster`, `oga-flame-creature`, `oga-pixel-art-animated-slime` | CC0 | Steam monster; fire creature (burn loop, last 4 frames); platformer slime (idle, move, attack, hurt, 17 frames) | 144x208; 400x184 and 786x326; 32x25 frames | mid-bright | M 3 | Animated fire / slime examples. |
| `oga-10-fantasy-rpg-enemies`, `oga-10-basic-rpg-enemies`, `oga-6-more-rpg-enemies`, `oga-more-rpg-enemies`, `oga-rpg-enemies-11-dragons`, `oga-chibi-monsters-set-01` | CC-BY 3.0 | Redshrike FF6-style enemy sets (slime, snake, goblin, cockatrice, ghost, wolf, dragons...) and ansimuz chibi monsters (bat, frog, ghost, skeleton) | sheets about 171-365 px wide; chibi sprites 16 px high, 3-4 frame strips | mid | M 3 | Classic RPG enemy types; the 11 dragons are good boss material. |
| `oga-monster-rpg-2-art` | CC0 | 164 PNGs (monsters, attacks, battle icons) with 110 `.png.xml` animation descriptors + 15 combat backgrounds | `Combat Media (Monsters, Attacks)/combat_media/` | mid | M 3 | Extra animated monsters and attack FX; XML needs a tiny parser. |
| `kenney-tiny-battle` | CC0 | 16 px units, buildings, map tiles | 18x11 grid, 16 px, 1 px gap | **bright** | M 2 | Map-node icons more than battlers. |

**Monster verdict.** 20+ varied creatures are covered several times over: plants (Plant and Mushroom, Spring, 50+ #8 / #17 /
#50, Tiny Creatures), beasts (50+ Monsters, Tiny Creatures), slimes (colorful slimes, animated slime, Tiny Creatures), constructs
(Phantasy, Steam, Ascent), undead (Tiny Creatures, Gilgaphoenix, DCSS), elementals (Elementals III, flame, Cute Monsters),
bosses (Boss Cohort, Cute Bosses, Kica, 11 Dragons). Animated monsters are the weak spot (slime, flame, Monster RPG 2 only);
static plus code tweens is the plan.

## 3. Backgrounds

| Pack (folder) | Licence | Contents | Size / layout | Palette | Score | Use |
|---|---|---|---|---|---|---|
| `oga-battle-backgrounds-nidhoggn` | CC0 | 10 painted battle backs: `battleback1` forest meadow, `2` snow forest, `3` desert, `4` desert market town, `5` cave, `6` and `7` autumn forest (two colourways), `8` stone dungeon with torches, `9` arena / ruin floor, `10` meadow edge (`battleback1_0` is a forest duplicate; `BG/` repeats 1, 2, 10 from the original 7z) | 1104x621 PNG, painted | mid-bright, slightly dark at the edges | B 4 | Primary backdrops. Place actors on the lower half. Pixelate by downscaling to 276x155 and nearest-neighbour up to match the sprites. |
| `oga-monster-rpg2-bg-matthew-smith`, `oga-monster-rpg-2-art/Combat Backgrounds` | CC0 | 14 pixel backdrops: fort, grass, jungle, keep, keep_outer, moon, mountains, mountains_bridge, rope_bridge, sand, underground, volcano, volc_bridge, water (plus `foo.png` 256x256 in the combat set) | 240x110 PNG | mid, stylised | B 4 | Castle (keep, keep_outer, fort), lakeside (water), sky-ish (mountains_bridge, moon), ruins feel (fort). Integer-scale 4x to 960x440. |
| `oga-meadow-background` | CC0 | One watercolour meadow | `meadow.jpg` 1390x934 | **bright**, soft | B 3 | Title or meadow backdrop. |
| `kenney-tiny-town` | CC0 | Town, grass, trees, fences, houses, 132 tiles | 16 px, 12x11 | **bright** | B 4 as tileset | Compose a town / village backdrop. |
| `oga-16x16-puny-world-tileset`, `oga-puny-trees`, `oga-16x16-puny-dungeon-tileset` | CC0 | Overworld tiles (grass, water, trees), tree set, dungeon set | `punyworld-overworld-tileset_0.png` 432x1040, 16 px | bright-mid | B 4 as tileset | Compose lakeside / forest / ruins. |
| `oga-tiny-rpg-forest`, `oga-pastoral-overworld`, `oga-8-bit-jrpg-tilesets`, `kenney-roguelike-rpg-pack` | CC0 | Forest tileset and props; rural overworld (DB32 palette); four 320x200 JRPG tilesets; Kenney overworld / dungeon | 16 px grids | bright-mid | B 3 as tilesets | Extra terrain for composed scenes and the map screen. |
| `kenney-background-elements`, `kenney-pixel-platformer` (Backgrounds tiles) | CC0 | Clouds, hills, mountains, towers, trees (vector-clean), plus pixel sky / hills / desert gradient tiles | PNG + vector | **bright** | B 4 as parallax | Sky backdrop and parallax layers. |

**Background verdict.** 10 + 14 + 1 ready backdrops cover meadow, forest (two), autumn, snow, desert, cave, dungeon, arena,
town, castle, lakeside (water), mountains. A genuine bright "ruins" and "open sky" scene have to be composed from tilesets
(Puny / Tiny Town) and Kenney Background Elements.

## 4. UI, icons, effects

| Pack (folder) | Licence | Contents | Size | Palette | Score | Use |
|---|---|---|---|---|---|---|
| `kenney-ui-pack-pixel-adventure` | CC0 | 514 PNGs: panels, buttons (square, round), bars, frames, arrows, checkboxes | 16 px tiles in `Tiles/`, sheets in `Tilesheets/` | **bright** | U 5 | Command menu, HP / MP bars, message frame. |
| `kenney-pixel-ui-pack` | CC0 | 750 assets, 9-slice panels (`9-Slice/Ancient`, etc.), buttons, arrows, cursors | 16-48 px | bright-mid | U 4 | 9-slice windows. |
| `kenney-ui-pack-rpg-expansion` | CC0 | 90 parchment / wood / metal panels, bars, tabs | vector-clean PNG | mid | U 3 | Party sheet, shop, camp sheets. |
| `kenney-fantasy-ui-borders` | CC0 | 282 border and panel pieces | PNG + vector | mid | U 3 | Dialogue / event frames. |
| `kenney-game-icons`, `kenney-board-game-icons`, `kenney-emotes-pack`, `kenney-1-bit-pack` | CC0 | 425 / 513 / 513 icons, emotes, 1-bit sheet (49x22 tiles at 16 px) | PNG + vector | mono / bright | U 3 | Generic icons, status bubbles (sweat, anger, sleep, heart), recolourable 1-bit glyphs. |
| `oga-496-rpg-icons` | CC0 | 496 item / gear / spell icons (34x34) plus `spritesheet_7.png` | 34x34 | bright-mid | U 4 | Items, gear, spell icons. |
| `oga-16x16-assorted-rpg-icons`, `oga-16x16-weapon-rpg-icons` | CC0 | Armours, books, chests, consumables, weapons | 16 px sheets | mid-bright | U 3 | Small inventory icons. |
| DCSS `spells/`, `effect/`, `gui/` folders (in the Dungeon Crawl packs) | CC0 | Fire, ice, lightning, poison, holy, death and status glyphs in 32 px | 32x32 | mid | U 3 | Best candidates for element and status icons. |
| `kenney-particle-pack`, `oga-lots-of-game-effects`, `oga-2d-spell-effects` | CC0 | Sparks, smoke, glows, explosion and fire sheets, 10 spell effects | PNG (particles 193 files, 15 MB) | bright | U 4 | Hit, perfect, break and heal VFX. |

**UI verdict.** Frames, buttons, bars and item icons are covered with room to spare. Status and element icons (burn, chill,
shock, bleed, poison, shield, break) are the one weak area: no pack ships a ready, bright, consistent set.

## 5. Fonts

| Font (folder) | Licence | Notes | Score |
|---|---|---|---|
| `fonts/pressstart2p/PressStart2P-Regular.ttf` | SIL OFL 1.1 (`OFL.txt` alongside) | Classic 8x8 pixel face; use at multiples of 8 px | F 5 |
| `fonts/pixelifysans/PixelifySans[wght].ttf` | SIL OFL 1.1 | Variable-weight pixel face, friendlier for body text | F 5 |
| `fonts/silkscreen/Silkscreen-Regular.ttf` | SIL OFL 1.1 | Caps-only small labels | F 4 |
| `fonts/vt323/VT323-Regular.ttf` | SIL OFL 1.1 | Terminal look for the message line | F 4 |
| `kenney-fonts/Fonts/*.ttf` | CC0 | Kenney Pixel, Pixel Square, Mini, Mini Square, Blocks, High, Future, Rocket | F 4 |

Note: `ninja-adventure/theme/font_normal.ttf` is not recorded as OFL or CC0 in the repo; do not ship it.

## 6. Music (needs: title, map, battle, boss, camp)

All CC0. Juhani Junkala's tracks are described by the author as seamlessly looping; verify the loop points in-engine. Convert
WAV-only tracks to OGG with ffmpeg before shipping.

| Role | Primary pick | Alternates | Notes |
|---|---|---|---|
| Title | `oga-music-5-chiptunes-action/` `title screen.mp3` (0.3 MB; WAV 1.9 MB) | `oga-music-monster-rpg-2/x/Monster RPG 2 OGG Music - Revised/title.ogg`; `oga-music-jrpg-pack-4-calm/Calm1 - A Place I Call Home.ogg` | Chiptune, bright; the MP3 is short, check it loops cleanly. |
| Map | `oga-music-jrpg-pack-1-exploration/Grasslands.ogg` (2.8 MB) | `Prairie Nights.ogg`, `Tropical Island.ogg`; `oga-music-flowerbed-fields/flowerbed_fields.ogg` (cute chiptune); `oga-music-chiptune-adventures/.../4. Stage Select.ogg` | Pack 1 has 6 exploration tracks (grass, military base, mines, prairie night, sneaking, tropical). |
| Battle | `oga-music-jrpg-pack-5-action/Action3 - Preparing For Battle.ogg` (1.8 MB) | `Action2 - Army Approaching.ogg`, `Action1 - Encounter With The Witches.ogg`; `oga-music-chiptune-adventures/.../1. Stage 1.ogg`, `2. Stage 2.ogg`; `oga-music-5-chiptunes-action` Level 1-3 (MP3 + WAV); Monster RPG 2 `battle.ogg` | Plenty of choice for 3 acts. |
| Boss | `oga-music-chiptune-adventures/.../3. Boss Fight.ogg` (2.9 MB) | `oga-music-epic-boss-battle/` (WAV only, 20.8 MB; orchestral, needs OGG transcode); `oga-music-jrpg-pack-3-evil/Evil1 - Ancient Evil Awakens.ogg`; Monster RPG 2 `boss.ogg`, `final_boss.ogg` | Chiptune boss keeps the bright feel; Evil pack fits a late-act villain. |
| Camp | `oga-music-jrpg-pack-4-calm/Calm3 - Peaceful Days.ogg` (1.8 MB) | `Calm1`, `Calm2 - Childhood Friends`, `Calm4 - Sand Castles`; `oga-music-a-small-fire-will-do/mp3.mp3` (1.5 MB; WAV 16 MB); Towns pack `Town1 - Home Town.ogg` | Calm pack has 6 tracks for camp, shop, events. |
| Stingers | `kenney-music-jingles/Audio/{8-Bit, Hit, Pizzicato, Sax, Steel} jingles` | | Victory, defeat, level-up, perfect-hit flourish. |
| Extra | `ninja-adventure/audio/music/*.ogg` (4 tracks: dream, lost village, plain, swamp), 37 more in the full pack | | |

Music verdict: Mu 5. Every role has at least three CC0 candidates, OGG available for all but the epic boss and "A Small Fire"
(MP3 provided).

## 7. SFX (menu move / confirm, hit, perfect hit, guard, break, KO, heal, buff)

All CC0, OGG, from Kenney. Suggested picks (file numbers vary, audition 2-3):

| Need | Pack folder and files |
|---|---|
| Menu move | `kenney-interface-sounds/Audio/select_00x.ogg`, `tick_00x.ogg`; `kenney-ui-audio` clicks |
| Confirm / back / error | `kenney-interface-sounds`: `confirmation_00x`, `back_00x`, `error_00x` |
| Hit | `kenney-impact-sounds`: `impactPunch_medium_00x`, `impactPunch_heavy_00x`, `impactSoft_*`; `kenney-rpg-audio`: `knifeSlice`, `drawKnife`, `chop` |
| Perfect hit | `kenney-impact-sounds`: `impactBell_heavy_00x` layered with `kenney-digital-audio/Audio/powerUp*.ogg` or `pepSound*.ogg` |
| Guard | `kenney-impact-sounds`: `impactPlate_heavy_00x`, `impactMetal_light_00x`, `impactMetal_medium_00x` |
| Break (shield / Break meter) | `kenney-impact-sounds`: `impactGlass_heavy_00x` (+ `glass_00x` from interface sounds) |
| KO | `kenney-digital-audio/Audio/lowDown.ogg`, `phaserDown*.ogg`; stinger from `kenney-music-jingles` |
| Heal | `kenney-digital-audio/Audio/powerUp*.ogg`, `phaserUp*.ogg`; `kenney-sci-fi-sounds` for a longer sparkle |
| Buff | `kenney-digital-audio/Audio/pepSound*.ogg`, `threeTone*.ogg`, `zapTwoTone*.ogg` |
| Misc | `kenney-rpg-audio` (doors, cloth, coins, books, footsteps), `kenney-sci-fi-sounds` (energy / magic whooshes) |

SFX verdict: S 5 (100 interface, 130 impact, 63 digital, 52 UI, 52 RPG, 73 sci-fi sounds).

## 8. Recommended usage plan

1. **Look**: pixel sprites (Classic Hero family, Tiny Tactics, 50+ Monsters, Tiny Creatures, colourful slimes) drawn with
   nearest-neighbour at integer scales (3x-4x for 16 px, 2x for 32 px, 1.5x-2x for 64 px). Painted "Cute" and Nidhoggn art
   only where a painted layer is acceptable (portraits, bestiary, backdrops after pixelation).
2. **Roster**: 8 starting heroes = Samurai, Ninja, Pirate Captain, Viking Shieldmaiden, Mechanic, Ranger, Knight, Necromancer
   (Classic Hero family) with Tiny Tactics fighter / mage / cleric as bonus unlocks; portraits from Cute Heroes (16).
3. **Enemies**: 56 from 50+ Monsters (alt palettes for elites) + Tiny Creatures + colourful slimes; bosses from Cute Boss Monsters,
   Boss Cohort, Kica, 11 Dragons.
4. **Scenes**: Nidhoggn backdrops for acts 1-3 plus Monster RPG 2 backdrops for castle, lake, mountains.
5. **UI**: Kenney Pixel Adventure + Pixel UI Pack; Press Start 2P (numbers, titles) and Pixelify Sans (body).
6. **Audio**: the table in section 6/7; build a manifest that maps each in-game id to one file and its credit key.

## 9. Gaps

| Gap | Best fallback |
|---|---|
| Bright, consistent 32-64 px side-view hero battlers with idle / attack / hurt / KO for 8+ characters | Classic Hero family (13 chars, attack / damaged, no KO) with code-driven KO, hurt flash and recoil; Tiny Tactics for 3 fully animated classes. Manual download that fixes it: Luiz Melo's CC0 packs (27x45 px, idle / attack / take-hit / death) or the Mighty Battle Pack addon (see below). |
| Animated monsters | Static battlers plus code tweens (idle bob, squash on hit, dissolve on KO). Animated examples: pixel slime, flame creature, Monster RPG 2 combat media. |
| Status and element icons (burn, chill, shock, bleed, poison, regen, shield, break) | DCSS `spells` / `effect` / `gui` glyphs, Kenney Emotes and Board Game Icons, 496 RPG icons for spell icons; or draw 8 simple 16 px glyphs in the project palette (small job). |
| Bright "ruins" and "open sky" battle scenes | Compose from Puny World / Tiny Town tiles and Kenney Background Elements; Nidhoggn `battleback9` (arena floor) as base. |
| A pixel-style match between 16 px Kenney, 32 px DCSS / Puny and 64 px monsters | Pick one on-screen scale per layer (heroes ~96-128 px tall, monsters 128-192 px) and keep all sprites at integer multiples; recolour muted packs with a palette swap. |
| Perfect-hit "ring" and break "shatter" signature SFX | Layer Kenney bell + glass + power-up files; no ready sample. |
| Epic boss track and "A Small Fire" ship as WAV | Transcode to OGG (ffmpeg is at `C:\ffmpeg-shared\bin`); MP3 copies exist as stand-ins. |
| Full Ninja Adventure content (bright top-down chars, 37 tracks, 100+ SFX) | Manual download (below). |

## 10. Needs manual download (not fetched)

| Pack | Why | URL | Licence (as read on the page) |
|---|---|---|---|
| Ninja Adventure full asset pack (82 MB zip; 50+ characters, 30+ monsters, 9 bosses, 37 tracks, 100+ SFX, fonts) | itch.io name-your-price; GitHub repo `pixel-boy/NinjaAdventure` holds only a Godot demo subset (already in `ninja-adventure/`) | https://pixel-boy.itch.io/ninja-adventure-asset-pack | CC0 |
| Luiz Melo hero packs (Fantasy Warrior 27x45: idle 10, run 8, jump, fall, attack x3, take hit 3, death 7; also Martial Hero 2, Medieval Warrior Pack 2 / 3, Fantasy Creatures 2) | itch.io name-your-price, no mirror found; best fit for the hero-battler gap | https://luizmelo.itch.io/fantasy-warrior (Martial Hero 2: https://luizmelo.itch.io/martial-hero-2 , Medieval Warrior Pack 3: https://luizmelo.itch.io/medieval-warrior-pack-3 , Fantasy Creatures 2: https://luizmelo.itch.io/fantasy-creatures-2) | CC0 on the Fantasy Warrior page; confirm each other page before use |
| Mighty Battle Pack Addon (32 side-view battlers for RPG Maker MZ at 2x, plus evil pack and final boss sprite, RAR) | itch.io name-your-price | https://themightypalm.itch.io/mighty-battle-pack-addon | CC0 |
| The Mighty Pack (tilesets, characters, icons, UI; RAR, RPG Maker format) | itch.io name-your-price | https://themightypalm.itch.io/the-mighty-pack | CC0 |
| PH Myth Creatures (25 folklore creatures, static battle sprites, 4-direction walk) | itch.io, no mirror found | https://merchant-shade.itch.io/ph-myth-creatures | CC0 |

## 11. Rejected or removed

- Segel Studio characters (Trainee Knight, Samurai Character): CC0 but smooth vector renders at 595-1250 px, not pixel art; deleted.
- Spring Monster Pack sample screenshots: show RPG Maker default art and GUI; deleted, only the 7 monster PNGs kept.
- Kenney "Pixel UI pack (750)" OGA copy: duplicate of `kenney-pixel-ui-pack`; deleted.
- Not downloaded on licence grounds: all CC-BY-SA / GPL-only packs (LPC, Allacrost 2D RPG Enemy Set, Wesnoth ports), Atari-Boy "Old Hero" (custom
  licence), Pixel Hero Character Pack (CC-BY but paid), Tiny RPG Character Asset Pack and Tiny Swords (custom licences), Summer Engine
  "asset store" listings (AI-generated, unclear terms), 12 Public Domain Boss Sprites (AI-processed images of uncertain provenance).
- `oga-cute-heroes/gemrogue-concept.png` is the author's concept screenshot, not a pack asset; do not ship.

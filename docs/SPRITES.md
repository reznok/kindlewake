# Sprite catalog

Every battler and UI key in `public/atlas.png` (built by `npm run atlas` from `tools/manifest.json`). Enemies are named by
what they look like, not by who they are in the story: a later pass assigns enemies to keys (`EnemyDef.sprite`).

## How sizes work

Each sprite sits in a logical cell, standing on the cell's bottom edge: **small** 80 x 80, **medium** 128 x 128, **large**
200 x 200 display px; heroes 160 x 112. The battle view fits the cell into the enemy's box (the box follows the enemy's
`size` field), so pick a key whose size class matches the enemy's `size`; a mismatch still works but the art shrinks or
grows with the box. "Art" is the drawn size inside the cell (pixel art is stored at native resolution and scaled up 2x-6x
nearest-neighbour; painted packs are pre-shrunk and drawn smooth). Enemies face **right**, heroes face **left**.
Single-frame enemies get a code-driven breathe, a white flash on hit and a fade on KO; heroes have real frames.
Composite battlers use the manifest's `scale` (integer pre-upscale), `overlay` (stack more art on top or `under`) and
`tint` ops; see the header of `tools/build-atlas.mjs`.

## Heroes (idle / attack / hurt / ko / cast)

| Key | Source | Notes |
|---|---|---|
| `hero_barty` | Tiny Tactics fighter | ginger hair, white smock recolour; drawn at 4x, the biggest |
| `hero_dell` | Ninja (DezrasDragons) | black outfit, silver headband |
| `hero_clem` | Samurai (DezrasDragons) | straw hat, mustard outfit recolour |
| `hero_ashlar` | Classic Knight (Disthron) | tinted sandstone grey (statue) |
| `hero_gertie` | Classic Pirate Captain (DezrasDragons) | scarlet tricorn and coat |
| `hero_kit` | Mechanic (DezrasDragons) | goggles, copper hair recolour |
| `hero_pell` | Ranger (DezrasDragons) | mime recolour: pale face, black hair, striped shirt, red trousers |
| `hero_roz` | Tiny Tactics mage | cobalt robe recolour, pointed hat (3x) |

`ko` reuses the hurt frame; the view tips the actor over and greys it. `cast` is a charge pose (Tiny Tactics) or a
victory / idle pose. Portraits `por_<id>` (96 px, px 1) are framed busts cut from the battler's own idle frame 0 (top
~80% of the figure, 60% for the taller Tiny Tactics pair), nearest-upscaled 4x-6x, head-centred, on a banded backdrop in
the hero's role colour with a role-colour rim (`bust` op in the manifest), so portrait and battler always agree.
Any key not in the atlas falls back to the placeholder shape.

## Enemies (155)

| Key | Looks like | Size | Art (px) | Pack |
|---|---|---|---|---|
| `mon_armor_blob` | chubby round knight in golden armour | medium | 104x116 | 50+ Monsters |
| `mon_robot_ball` | little round robot with an antenna and a cannon nose | small | 68x70 | 50+ Monsters |
| `mon_bulb_blue` | blue bulb creature with three eye-stalks | medium | 52x98 | 50+ Monsters |
| `mon_sprout_bud` | green blob with a pink flower bud on top | small | 46x64 | 50+ Monsters |
| `mon_dino_teal` | teal long-necked dinosaur | medium | 114x100 | 50+ Monsters |
| `mon_bee` | round striped bee | small | 78x54 | 50+ Monsters |
| `mon_moth_green` | green leaf moth | small | 66x60 | 50+ Monsters |
| `mon_frog_blob` | green frog-blob with goggly eyes | medium | 86x78 | 50+ Monsters |
| `mon_ghost_knight` | white winged ghost holding a flaming sword | medium | 118x84 | 50+ Monsters |
| `mon_chick` | chick peeking out of an egg | small | 44x60 | 50+ Monsters |
| `mon_seadragon_pink` | pink curly sea dragon | medium | 96x108 | 50+ Monsters |
| `mon_beetle_red` | red ladybird beetle with pincers | medium | 108x84 | 50+ Monsters |
| `mon_crystal_purple` | cluster of purple crystals | medium | 112x88 | 50+ Monsters |
| `mon_crystal_red` | cluster of red crystals | medium | 112x88 | 50+ Monsters (alt palette) |
| `mon_bat` | grey-brown bat, wings spread | medium | 94x56 | 50+ Monsters (alt palette) |
| `mon_firefly` | red-and-black firefly bug with a glowing tail | small | 62x74 | 50+ Monsters |
| `mon_sheep` | fluffy white sheep | medium | 92x68 | 50+ Monsters |
| `mon_seedling` | tiny green seed sprout | small | 54x69 | 50+ Monsters |
| `mon_fox` | orange fox with a leafy tail | medium | 100x104 | 50+ Monsters |
| `mon_fuzzball_blue` | blue fuzzball | small | 56x50 | 50+ Monsters |
| `mon_snail` | pink-shelled snail | medium | 128x120 | 50+ Monsters (alt palette) |
| `mon_ghost_candle` | melting candle ghost | medium | 56x96 | 50+ Monsters |
| `mon_owl` | big brown owl | medium | 126x100 | 50+ Monsters |
| `mon_puffer_mine` | spiky grey puffer / sea mine | medium | 86x90 | 50+ Monsters |
| `mon_cobra` | green cobra | medium | 96x118 | 50+ Monsters |
| `mon_swordfish` | blue swordfish | medium | 102x86 | 50+ Monsters |
| `mon_thistle_octo` | green octopus with a purple thistle crown | medium | 126x98 | 50+ Monsters |
| `mon_boxer_roo` | kangaroo with boxing gloves | medium | 94x116 | 50+ Monsters |
| `mon_whale` | big blue whale on its belly | large | 192x153 | 50+ Monsters |
| `mon_robot_crab` | grey robot with crab claws | medium | 124x96 | 50+ Monsters |
| `mon_drill_shark` | grey shark with a drill nose | medium | 106x92 | 50+ Monsters |
| `mon_raptor` | small orange raptor | small | 72x68 | 50+ Monsters |
| `mon_mud_clam` | green mud clam / flat slime | medium | 124x68 | 50+ Monsters (alt palette) |
| `mon_mushroom_dino` | orange dino with mushroom caps on its back | medium | 94x80 | 50+ Monsters |
| `mon_onion` | onion bulb creature with a leafy top | small | 46x78 | 50+ Monsters |
| `mon_fish_red` | red fish | small | 74x80 | 50+ Monsters |
| `mon_pterodactyl` | purple pterodactyl | medium | 84x100 | 50+ Monsters |
| `mon_seahorse` | yellow curly seahorse | small | 80x68 | 50+ Monsters |
| `mon_golem_stone` | tan stone golem | medium | 122x98 | 50+ Monsters |
| `mon_golem_gold` | big gold golem | large | 183x147 | 50+ Monsters (alt palette) |
| `mon_croc` | brown crocodile | medium | 128x98 | 50+ Monsters |
| `mon_bison` | brown woolly bison | medium | 114x94 | 50+ Monsters |
| `mon_bison_red` | big red woolly bison | large | 171x141 | 50+ Monsters (alt palette) |
| `mon_trex_purple` | big purple t-rex | large | 168x153 | 50+ Monsters (alt palette) |
| `mon_hermit_spider` | hermit crab with spider legs | medium | 90x76 | 50+ Monsters |
| `mon_mushroom_brown` | small brown mushroom | small | 80x50 | 50+ Monsters |
| `mon_nautilus` | pink nautilus with tentacles | medium | 108x96 | 50+ Monsters (alt palette) |
| `mon_raccoon` | raccoon | medium | 120x94 | 50+ Monsters |
| `mon_wisp_white` | white ghost wisp with a curly tail | medium | 94x88 | 50+ Monsters |
| `mon_octopus_green` | green octopus | medium | 96x78 | 50+ Monsters |
| `mon_bird` | brown sparrow | medium | 88x80 | 50+ Monsters |
| `mon_crow` | black crow | small | 66x60 | 50+ Monsters (alt palette) |
| `mon_alien_blob` | tiny green alien blob with antennae | small | 54x56 | 50+ Monsters |
| `mon_spider` | small grey spider | small | 64x36 | 50+ Monsters |
| `mon_sea_slug` | red-orange sea slug | medium | 90x84 | 50+ Monsters |
| `mon_turtle_isle` | giant turtle with an island on its shell | large | 183x138 | 50+ Monsters |
| `mon_caterpillar` | green caterpillar | small | 60x36 | 50+ Monsters (alt palette) |
| `mon_jelly_pink` | pink jelly blob with spots | small | 75x72 | Colorful Slimes |
| `mon_flame_sprite` | orange flame sprite | small | 48x58 | Colorful Slimes |
| `mon_eyeball_purple` | floating purple eyeball | small | 52x54 | Colorful Slimes |
| `mon_ghost_cyan` | cyan ghost with little arms | small | 62x52 | Colorful Slimes |
| `mon_slime_grey` | grey sleepy slime | small | 69x69 | Colorful Slimes |
| `mon_jelly_teal` | teal many-eyed jelly | medium | 112x120 | Colorful Slimes |
| `mon_jelly_blue` | big blue grumpy jelly | medium | 104x120 | Colorful Slimes |
| `mon_octo_purple` | purple octopus blob | medium | 112x128 | Colorful Slimes |
| `mon_coral_orange` | orange coral creature | small | 48x56 | Colorful Slimes |
| `mon_imp_blue` | blue jelly imp | small | 54x52 | Colorful Slimes |
| `mon_shade` | dark purple ghost with a cape | medium | 104x120 | Colorful Slimes |
| `mon_crab` | red crab blob | small | 54x44 | Colorful Slimes |
| `mon_mushroom_cap` | brown mushroom-cap blob | small | 44x60 | Colorful Slimes |
| `mon_bush_dark` | dark green many-eyed bush | medium | 104x112 | Colorful Slimes |
| `mon_toad_navy` | navy toad blob | medium | 116x100 | Colorful Slimes |
| `mon_slime_green` | classic green slime | small | 58x44 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_slime_red` | classic red slime | small | 58x44 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_slime_blue` | classic blue slime | small | 58x44 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_snake` | green coiled snake | medium | 96x118 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_snake_brown` | brown coiled cobra | medium | 96x118 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_goblin` | green goblin with axe and shield | medium | 100x112 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_goblin_blue` | blue goblin with axe and shield | medium | 100x112 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_cockatrice` | white cockatrice (rooster-lizard) | medium | 82x117 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_lizard` | green spiny lizard | medium | 118x96 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_rat` | grey rat | medium | 126x110 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_scorpion` | red scorpion | medium | 82x114 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_wolf` | grey wolf | medium | 94x110 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_wolf_red` | russet wolf | medium | 94x110 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_ghost` | white sheet ghost | small | 69x58 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_dragon_green` | chubby green dragon, wings spread (front) | large | 196x140 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_dragon_red` | chubby red dragon, wings spread (front) | large | 196x140 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_dragon_purple` | chubby purple dragon, wings spread (front) | large | 196x140 | 10 Fantasy RPG Enemies (CC-BY) |
| `mon_wyvern_red` | red wyvern with dark wings | large | 136x146 | 11 Dragons (CC-BY) |
| `mon_dragon_serpent` | green serpent dragon with a curled tail | large | 168x162 | 11 Dragons (CC-BY) |
| `mon_boss_dragon` | huge brown winged dragon (side view) | large | 173x103 | 11 Dragons (CC-BY) |
| `mon_zombie` | green zombie | medium | 84x90 | Tiny Creatures |
| `mon_skeleton` | skeleton | medium | 96x90 | Tiny Creatures |
| `mon_skull_fire` | flaming skull | small | 80x80 | Tiny Creatures |
| `mon_reaper` | hooded grey reaper | medium | 96x90 | Tiny Creatures |
| `mon_eye` | bloodshot eyeball | small | 80x75 | Tiny Creatures |
| `mon_plant` | venus flytrap | medium | 96x96 | Tiny Creatures |
| `mon_orc` | green orc | medium | 96x96 | Tiny Creatures |
| `mon_mushroom_imp` | red-capped mushroom imp | small | 80x70 | Tiny Creatures |
| `mon_knight_dark` | dark hooded knight | medium | 96x96 | Tiny Creatures |
| `mon_dragon_blue` | small blue dragon | medium | 96x96 | Tiny Creatures |
| `mon_demon` | red horned demon | medium | 96x96 | Tiny Creatures |
| `mon_imp` | little red imp | small | 70x65 | Tiny Creatures |
| `mon_elemental_fire` | fire elemental | medium | 96x96 | Tiny Creatures |
| `mon_elemental_water` | water elemental | medium | 96x96 | Tiny Creatures |
| `mon_golem_rock` | grey rock golem | medium | 96x96 | Tiny Creatures |
| `mon_tornado` | tornado / air elemental | medium | 96x96 | Tiny Creatures |
| `mon_elemental_ice` | ice elemental | medium | 96x96 | Tiny Creatures |
| `mon_wisp_fire` | small flame wisp | small | 60x66 | Tiny Creatures |
| `mon_witch` | witch in a purple hat | medium | 96x96 | Tiny Creatures |
| `mon_gargoyle` | grey gargoyle | medium | 96x96 | Tiny Creatures |
| `mon_cube_green` | green gelatinous cube | medium | 96x96 | Tiny Creatures |
| `mon_wisp` | glowing blue orb wisp | small | 78x78 | Tiny Creatures |
| `mon_troll` | green troll | medium | 96x96 | Tiny Creatures |
| `mon_parrot` | bright parrot | small | 80x80 | Tiny Creatures |
| `mon_treant` | walking tree | medium | 96x96 | Tiny Creatures |
| `mon_eagle` | brown eagle | medium | 96x96 | Tiny Creatures |
| `mon_chicken` | white chicken | small | 70x60 | Tiny Creatures |
| `mon_goat` | white goat | medium | 96x96 | Tiny Creatures |
| `mon_bee_knight` | armoured bee knight with a lance | medium | 119x76 | Spring Monster Pack |
| `mon_boss_bee_queen` | queen bee knight with a honey lance (boss) | large | 169x121 | Spring Monster Pack |
| `mon_bunny` | pink long-eared bunny | medium | 109x115 | Spring Monster Pack |
| `mon_sakura_spirit` | pink blossom spirit with a staff | medium | 61x100 | Spring Monster Pack |
| `mon_bulbling` | small onion-bulb sprite | small | 74x75 | Spring Monster Pack |
| `mon_sproutling` | little sprout sprite with a leaf cape | small | 47x68 | Spring Monster Pack |
| `mon_boss_springlord` | leafy spring lord with a scythe (boss) | large | 179x156 | Spring Monster Pack |
| `mon_pumpkin` | smiling jack-o-lantern pumpkin | medium | 118x128 | Plant & Mushroom Enemies |
| `mon_daisy` | smiling daisy | medium | 85x128 | Plant & Mushroom Enemies |
| `mon_lotus` | lotus on a lily pad | medium | 109x128 | Plant & Mushroom Enemies |
| `mon_mushroom_red` | red fly agaric mushroom | medium | 118x128 | Plant & Mushroom Enemies |
| `mon_nettle` | grumpy nettle plant | medium | 98x128 | Plant & Mushroom Enemies |
| `mon_berry_bloom` | dark berry flower on leaves | medium | 98x128 | Plant & Mushroom Enemies |
| `mon_morel` | purple morel mushroom | medium | 77x128 | Plant & Mushroom Enemies |
| `mon_mandrake` | mandrake root | medium | 64x128 | Plant & Mushroom Enemies |
| `mon_basilisk` | red-crested basilisk bird-serpent | medium | 128x127 | Kica's Enemy Pack |
| `mon_mushroom_blue` | blue-capped walking mushroom | medium | 112x128 | Kica's Enemy Pack |
| `mon_stone_haunt` | mossy stone spirit with blue mist | medium | 97x128 | Kica's Enemy Pack |
| `mon_boss_mantis` | tall red-bladed mantis robot (boss) | large | 200x200 | Kica's Enemy Pack |
| `mon_goop` | green-and-blue dripping goop | medium | 101x128 | Kica's Enemy Pack |
| `mon_ruin_eye` | floating stone blocks around an eye | large | 153x180 | Kica's Enemy Pack |
| `mon_rat_big` | big tan rat with a long tail | medium | 128x122 | Kica's Enemy Pack |
| `mon_eye_beast` | purple one-eyed toothy beast | medium | 128x124 | Kica's Enemy Pack |
| `mon_boss_gourd` | giant toothy green gourd (boss) | large | 176x200 | Kica's Enemy Pack |
| `mon_mud_maw` | tan toothy mud blob | medium | 128x116 | Kica's Enemy Pack |
| `mon_boss_behemoth` | dark hunched behemoth (boss) | large | 105x155 | Boss Cohort (CC-BY) |
| `mon_boss_dark_lord` | dark armoured lord with blades (boss) | large | 111x177 | Boss Cohort (CC-BY) |
| `mon_boss_elephant` | hunched brown bestiary elephant, bear-like (boss) | large | 168x120 | Boss Cohort (CC-BY) |
| `mon_boss_terra` | tangled green-brown earth demon (boss) | large | 154x172 | Boss Cohort (CC-BY) |
| `mon_boss_spectre` | gentleman spectre in a top hat (boss) | large | 90x181 | Boss Cohort (CC-BY) |
| `mon_moth_grey` | grey moth (the leaf moth, tinted) | small | 66x60 | 50+ Monsters (tinted) |
| `mon_boss_moth_rider` | enormous grey moth with a small brown-hooded rider on its head | large | 198x180 | 50+ Monsters moth (2x, tinted) + Mr. Necromancer Man (recoloured) |
| `mon_odo` | official in mustard-and-brass livery, plumed hat, sword at his side | medium | 96x126 | Musketeer Officer (Disthron, recoloured) |
| `mon_boss_duskmother` | huge dusk-blue grey moth, no rider | large | 198x180 | 50+ Monsters moth (3x, tinted) |
| `mon_jam_colossus` | hill of red jam with a face, three little trees growing out of its top | large | 152x196 | Colorful Slimes blob (3x, tinted) + Kenney Tiny Town trees |

## UI glyphs (12 px, `icon_<name>`, original art in tools/build-icons.mjs)

Elements: slash, pierce, blunt, fire, frost, storm, spirit. Statuses: poison, burn, chill, shock, bleed, taunt, regen,
barrier, atkUp, atkDown, defUp, defDown, haste, slow, plus guard and break. Map nodes: node_fight, node_elite, node_event,
node_recruit, node_camp, node_shop, node_boss, node_start. A status id without a glyph shows a coloured dot.

## Backdrops (`public/bg/<key>.png`, `EncounterDef.background`)

bg_meadow, bg_forest, bg_autumn, bg_autumn_red, bg_snow, bg_desert, bg_town, bg_cave, bg_dungeon, bg_arena (Nidhoggn);
bg_lake, bg_castle, bg_keep, bg_fort, bg_mountains, bg_sky, bg_bridge, bg_moon, bg_volcano, bg_jungle, bg_grass
(Monster RPG 2); bg_title (meadow watercolour); bg_map (tiled, Kenney Tiny Town). No background set -> bg_meadow.

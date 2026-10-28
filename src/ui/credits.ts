/**
 * Credits for every pack that ships in public/ (atlas, backdrops, fonts, audio). The in-game Credits sheet reads this
 * list; docs/CREDITS.md is the full legal record. CC-BY entries must stay visible in game.
 */
export interface Credit {
  pack: string;
  author: string;
  licence: 'CC0' | 'CC-BY 3.0' | 'CC-BY 4.0' | 'SIL OFL 1.1';
  url: string;
  use: string;
}

export const CREDITS: Credit[] = [
  // ---- attribution required
  { pack: '10 Fantasy RPG enemies', author: 'Antifarea (art), CharlesGabriel (upload)', licence: 'CC-BY 3.0', url: 'https://opengameart.org/content/10-fantasy-rpg-enemies', use: 'Slimes, snakes, goblins, wolves, ghosts, dragons and more' },
  { pack: 'RPG Enemies: 11 Dragons', author: 'Redshrike, Surt, Blarumyrran', licence: 'CC-BY 3.0', url: 'https://opengameart.org/content/rpg-enemies-11-dragons', use: 'Dragons' },
  { pack: 'Boss Cohort', author: 'Gilgaphoenixignis', licence: 'CC-BY 4.0', url: 'https://opengameart.org/content/boss-cohort', use: 'Boss battlers' },
  // ---- CC0 (credited with thanks)
  { pack: 'Tiny Tactics - Battle Kit I', author: 'Gabriel "tiopalada" Lima', licence: 'CC0', url: 'https://opengameart.org/content/tiny-tactics-battle-kit-i', use: 'Hero battlers' },
  { pack: 'Samurai, Ninja, Classic Pirate Captain, Mechanic, Ranger (animated)', author: 'DezrasDragons', licence: 'CC0', url: 'https://opengameart.org/users/dezrasdragons', use: 'Hero battlers' },
  { pack: 'Classic Knight (animated)', author: 'Disthron', licence: 'CC0', url: 'https://opengameart.org/content/classic-knight-animated', use: 'Hero battler' },
  { pack: 'Mr. Necromancer Man, Musketeer Officer (animated)', author: 'Disthron', licence: 'CC0', url: 'https://opengameart.org/content/musketeer-officer-caonnon-animated', use: 'Enemy battlers' },
  { pack: '50+ Monsters Pack 2D', author: 'isaiah658', licence: 'CC0', url: 'https://opengameart.org/content/50-monsters-pack-2d', use: 'Enemy battlers' },
  { pack: 'Tiny Creatures', author: 'Clint Bellanger', licence: 'CC0', url: 'https://opengameart.org/content/tiny-creatures', use: 'Enemy battlers' },
  { pack: '32x32 colorful slimes', author: 'AndHeGames', licence: 'CC0', url: 'https://opengameart.org/content/32x32-colorful-slimes', use: 'Enemy battlers' },
  { pack: 'Spring Monster Pack', author: 'tiopalada', licence: 'CC0', url: 'https://opengameart.org/content/spring-monster-pack', use: 'Enemy battlers' },
  { pack: 'Plant and Mushroom Enemies', author: 'NettySvit', licence: 'CC0', url: 'https://opengameart.org/content/plant-and-mushroom-enemies-charset-and-battlers', use: 'Enemy battlers' },
  { pack: "Kica's Enemy Pack", author: 'Fava Beans', licence: 'CC0', url: 'https://opengameart.org/content/kicas-enemy-pack', use: 'Enemy and boss battlers' },
  { pack: 'Backgrounds (RPG battle backs)', author: 'Nidhoggn', licence: 'CC0', url: 'https://opengameart.org/content/backgrounds-3', use: 'Battle backdrops' },
  { pack: '14 Battle Backgrounds From Monster RPG 2', author: 'Matthew Smith (uploaded by troutsneeze)', licence: 'CC0', url: 'https://opengameart.org/content/14-battle-backgrounds-from-monster-rpg-2-by-matthew-smith', use: 'Battle backdrops' },
  { pack: 'Meadow background', author: 'bart', licence: 'CC0', url: 'https://opengameart.org/content/meadow-background', use: 'Title backdrop' },
  { pack: 'Tiny Town', author: 'Kenney', licence: 'CC0', url: 'https://kenney.nl/assets/tiny-town', use: 'Map tiles, trees' },
  { pack: 'JRPG Pack 1 (Exploration), 4 (Calm), 5 (Action)', author: 'Juhani Junkala (SubspaceAudio)', licence: 'CC0', url: 'https://opengameart.org/content/jrpg-pack-1-exploration', use: 'Map, camp and battle music' },
  { pack: '4 Chiptunes (Adventure)', author: 'Juhani Junkala (SubspaceAudio)', licence: 'CC0', url: 'https://opengameart.org/content/4-chiptunes-adventure', use: 'Title and boss music' },
  { pack: 'Interface Sounds, Impact Sounds, Digital Audio, RPG Audio, Music Jingles', author: 'Kenney', licence: 'CC0', url: 'https://kenney.nl/assets', use: 'Sound effects' },
  // ---- fonts
  { pack: 'Pixelify Sans', author: 'The Pixelify Sans Project Authors', licence: 'SIL OFL 1.1', url: 'https://github.com/eifetx/Pixelify-Sans', use: 'Body text' },
  { pack: 'Press Start 2P', author: 'The Press Start 2P Project Authors (CodeMan38)', licence: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Press+Start+2P', use: 'Titles and numbers' },
];

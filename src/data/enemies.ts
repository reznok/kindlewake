import type { EnemyDef } from '../core/types';

/** Placeholder bestiary until the content pass. Tier-1 numbers; the engine scales by level. */
export const ENEMIES: Record<string, EnemyDef> = {};

export function defineEnemies(list: EnemyDef[]) { for (const e of list) ENEMIES[e.id] = e; }

const A = (id: string, kind: EnemyDef['intents'][0]['kind'], name: string, ability: string) => ({ id, kind, name, ability });

defineEnemies([
  {
    id: 'ph_slime', name: 'Blob', desc: 'A blob.', size: 'small', stats: { hp: 40, mp: 0, atk: 9, mag: 6, def: 5, res: 4, spd: 7, luck: 2 },
    weak: ['fire', 'slash'], resist: ['blunt'], breakMax: 3, intents: [A('bite', 'attack', 'Squish', 'e_bite'), A('spit', 'debuff', 'Ooze', 'e_spit')], pattern: ['bite', 'bite', 'spit'],
    xp: 6, gold: 5, sprite: 'en_slime',
  },
  {
    id: 'ph_wolf', name: 'Howler', desc: 'A howler.', size: 'medium', stats: { hp: 55, mp: 0, atk: 13, mag: 4, def: 6, res: 5, spd: 12, luck: 5 },
    weak: ['pierce', 'fire'], resist: ['frost'], breakMax: 4, intents: [A('scratch', 'multi', 'Rake', 'e_scratch'), A('bite', 'attack', 'Bite', 'e_bite'), A('howl', 'buff', 'Howl', 'e_howl')], pattern: ['scratch', 'bite', 'howl', 'bite'],
    xp: 9, gold: 7, sprite: 'en_wolf',
  },
  {
    id: 'ph_golem', name: 'Lump', desc: 'A lump of rock.', size: 'large', stats: { hp: 90, mp: 0, atk: 15, mag: 3, def: 12, res: 6, spd: 5, luck: 1 },
    weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], breakMax: 6, intents: [A('charge', 'charge', 'Wind up', 'e_charge'), A('slam', 'heavy', 'Slam', 'e_slam'), A('wait', 'wait', 'Creak', 'e_wait')], pattern: ['wait', 'charge', 'slam'],
    xp: 14, gold: 10, sprite: 'en_golem',
  },
  {
    id: 'ph_sprite', name: 'Wisp', desc: 'A wisp.', size: 'small', stats: { hp: 35, mp: 20, atk: 5, mag: 14, def: 4, res: 10, spd: 13, luck: 8 },
    weak: ['spirit', 'frost'], resist: ['fire', 'storm'], breakMax: 3, intents: [A('ember', 'attack', 'Flicker', 'e_ember'), A('gust', 'multi', 'Flare', 'e_gust'), A('mend', 'heal', 'Glow', 'e_mend')], pattern: 'random',
    xp: 8, gold: 8, sprite: 'en_wisp',
  },
  {
    id: 'ph_bandit', name: 'Mugger', desc: 'A mugger.', size: 'medium', stats: { hp: 60, mp: 0, atk: 12, mag: 5, def: 8, res: 6, spd: 10, luck: 6 },
    weak: ['storm', 'spirit'], resist: [], breakMax: 4, intents: [A('scratch', 'multi', 'Stab-stab', 'e_scratch'), A('hiss', 'debuff', 'Jeer', 'e_hiss'), A('slam', 'heavy', 'Haymaker', 'e_slam')], pattern: ['scratch', 'hiss', 'scratch', 'slam'],
    xp: 10, gold: 14, sprite: 'en_bandit',
  },
  {
    id: 'ph_elite', name: 'Big Lump', desc: 'A bigger lump.', size: 'large', stats: { hp: 180, mp: 0, atk: 18, mag: 6, def: 13, res: 8, spd: 6, luck: 3 }, elite: true,
    weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], breakMax: 8, intents: [A('slam', 'heavy', 'Slam', 'e_slam'), A('gust', 'multi', 'Quake', 'e_gust'), A('charge', 'charge', 'Wind up', 'e_charge')], pattern: ['gust', 'charge', 'slam', 'slam'],
    xp: 40, gold: 40, sprite: 'en_golem',
  },
  {
    id: 'ph_boss', name: 'The Placeholder', desc: 'Stands in for the real thing.', size: 'large', stats: { hp: 320, mp: 30, atk: 20, mag: 16, def: 12, res: 12, spd: 8, luck: 5 }, boss: true,
    weak: ['fire', 'spirit'], resist: ['blunt'], breakMax: 8,
    intents: [A('scratch', 'multi', 'Flail', 'e_scratch'), A('ember', 'attack', 'Scorch', 'e_ember'), A('gust', 'multi', 'Sweep', 'e_gust'), A('slam', 'heavy', 'Crush', 'e_slam'), A('mend', 'heal', 'Patch', 'e_mend'), A('howl', 'buff', 'Rage', 'e_howl')],
    pattern: ['scratch', 'ember', 'gust', 'slam'],
    phases: [{ onBreak: true, pattern: ['howl', 'slam', 'gust', 'ember', 'mend'], message: 'It gets angry.', breakMax: 10 }],
    xp: 120, gold: 90, sprite: 'en_boss',
  },
]);

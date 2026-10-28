import type { CharacterDef } from '../core/types';

/** Placeholder roster until the content pass. Eight roles, one each. */
export const CHARACTERS: Record<string, CharacterDef> = {};

export function defineCharacters(list: CharacterDef[]) { for (const c of list) CHARACTERS[c.id] = c; }

defineCharacters([
  {
    id: 'ph_tank', name: 'Bulwark', role: 'tank', title: 'placeholder', desc: 'Stands in front.', starter: true,
    base: { hp: 70, mp: 12, atk: 12, mag: 4, def: 12, res: 8, spd: 7, luck: 4 }, growth: { hp: 7, mp: 1, atk: 1.5, def: 1.5, res: 1 },
    abilities: ['h_taunt', 'h_bash', 'h_crack', 'h_barrier'], weapon: 'w_mace', sprite: 'hero_tank',
    sparks: [
      { id: 's_tank_hp', name: 'Thick skin', desc: '+20 HP', effect: { kind: 'stat', stat: 'hp', amount: 20 } },
      { id: 's_tank_counter', name: 'Riposte', desc: 'Sometimes counter-attacks.', effect: { kind: 'passive', passive: { id: 'counter' } } },
      { id: 's_tank_iron', name: 'Iron guard', desc: 'Guard blocks more.', effect: { kind: 'passive', passive: { id: 'ironGuard' } } },
      { id: 's_tank_thorns', name: 'Spiky', desc: 'Attackers take 15% back.', effect: { kind: 'passive', passive: { id: 'thorns' } } },
      { id: 's_tank_def', name: 'Braced', desc: '+4 Defence', effect: { kind: 'stat', stat: 'def', amount: 4 } },
      { id: 's_tank_aura', name: 'Loud', desc: 'Starts fights taunting.', effect: { kind: 'passive', passive: { id: 'tauntAura' } } },
    ],
    lines: { recruit: 'Point me at it.', perfect: 'Felt that one.', ko: 'Hold the line without me...' },
  },
  {
    id: 'ph_striker', name: 'Edge', role: 'striker', title: 'placeholder', desc: 'Hits weak points.', starter: true,
    base: { hp: 50, mp: 14, atk: 15, mag: 5, def: 7, res: 6, spd: 11, luck: 8 }, growth: { hp: 4.5, mp: 1, atk: 2, spd: 0.5, luck: 0.5 },
    abilities: ['h_pierce', 'h_flurry', 'h_cleave', 'h_poison'], weapon: 'w_sword', sprite: 'hero_striker',
    sparks: [
      { id: 's_str_crit', name: 'Keen', desc: 'More crits.', effect: { kind: 'passive', passive: { id: 'critPlus' } } },
      { id: 's_str_atk', name: 'Sharpened', desc: '+4 Attack', effect: { kind: 'stat', stat: 'atk', amount: 4 } },
      { id: 's_str_chip', name: 'Pressure', desc: 'Weakness hits chip one more.', effect: { kind: 'passive', passive: { id: 'chipPlus' } } },
      { id: 's_str_haste', name: 'Momentum', desc: 'Faster after a kill.', effect: { kind: 'passive', passive: { id: 'hasteOnKill' } } },
      { id: 's_str_bleed', name: 'Serrated', desc: 'Attacks may bleed.', effect: { kind: 'passive', passive: { id: 'bleedTouch' } } },
      { id: 's_str_spd', name: 'Light feet', desc: '+3 Speed', effect: { kind: 'stat', stat: 'spd', amount: 3 } },
    ],
    lines: { recruit: 'I was going that way anyway.', perfect: 'Clean.', ko: 'Ugh. Rude.' },
  },
  {
    id: 'ph_mender', name: 'Salve', role: 'mender', title: 'placeholder', desc: 'Keeps everyone up.', starter: true,
    base: { hp: 48, mp: 24, atk: 6, mag: 13, def: 7, res: 11, spd: 9, luck: 6 }, growth: { hp: 4, mp: 2.5, mag: 1.8, res: 1 },
    abilities: ['h_heal', 'h_healall', 'h_revive', 'h_spirit'], weapon: 'w_staff', sprite: 'hero_mender',
    sparks: [
      { id: 's_men_mp', name: 'Deep well', desc: '+10 MP', effect: { kind: 'stat', stat: 'mp', amount: 10 } },
      { id: 's_men_regen', name: 'Tended', desc: 'Regenerates HP each turn.', effect: { kind: 'passive', passive: { id: 'hpRegen' } } },
      { id: 's_men_mpr', name: 'Breath', desc: 'Regenerates MP each turn.', effect: { kind: 'passive', passive: { id: 'mpRegen' } } },
      { id: 's_men_cleanse', name: 'Tidy', desc: 'Learn Tidy.', effect: { kind: 'ability', id: 'h_cleanse' } },
      { id: 's_men_mag', name: 'Focus', desc: '+4 Magic', effect: { kind: 'stat', stat: 'mag', amount: 4 } },
      { id: 's_men_cheat', name: 'Stubborn', desc: 'Survives one fatal blow per fight.', effect: { kind: 'passive', passive: { id: 'cheatDeath' } } },
    ],
    lines: { recruit: 'Someone has to patch you up.', perfect: 'There.', ko: 'Who heals the healer...' },
  },
  {
    id: 'ph_caster', name: 'Cinder', role: 'caster', title: 'placeholder', desc: 'Elements.',
    base: { hp: 42, mp: 26, atk: 5, mag: 16, def: 5, res: 10, spd: 9, luck: 6 }, growth: { hp: 3.5, mp: 2.5, mag: 2.2, res: 0.8 },
    abilities: ['h_fire', 'h_frost', 'h_storm', 'h_spirit'], weapon: 'w_wand', sprite: 'hero_caster',
    sparks: [
      { id: 's_cas_mag', name: 'Brighter', desc: '+5 Magic', effect: { kind: 'stat', stat: 'mag', amount: 5 } },
      { id: 's_cas_mp', name: 'Reservoir', desc: '+12 MP', effect: { kind: 'stat', stat: 'mp', amount: 12 } },
      { id: 's_cas_mpr', name: 'Draw', desc: 'Regenerates MP each turn.', effect: { kind: 'passive', passive: { id: 'mpRegen' } } },
      { id: 's_cas_burn', name: 'Smoulder', desc: 'Hits may burn.', effect: { kind: 'passive', passive: { id: 'burnTouch' } } },
      { id: 's_cas_break', name: 'Overload', desc: 'MP on every Break.', effect: { kind: 'passive', passive: { id: 'mpOnBreak' } } },
      { id: 's_cas_crit', name: 'Precise', desc: 'More crits.', effect: { kind: 'passive', passive: { id: 'critPlus' } } },
    ],
    lines: { recruit: 'I know seven ways to set that on fire.', perfect: 'Ha!', ko: 'Out of... sparks...' },
  },
  {
    id: 'ph_trickster', name: 'Nix', role: 'trickster', title: 'placeholder', desc: 'Steals turns.',
    base: { hp: 46, mp: 16, atk: 12, mag: 8, def: 6, res: 7, spd: 13, luck: 10 }, growth: { hp: 4, mp: 1.2, atk: 1.4, spd: 0.8, luck: 0.7 },
    abilities: ['h_delay', 'h_poison', 'h_crack', 'h_flurry'], weapon: 'w_dagger', sprite: 'hero_trickster',
    sparks: [
      { id: 's_tri_spd', name: 'Slippery', desc: '+4 Speed', effect: { kind: 'stat', stat: 'spd', amount: 4 } },
      { id: 's_tri_poison', name: 'Coated', desc: 'Attacks may poison.', effect: { kind: 'passive', passive: { id: 'poisonTouch' } } },
      { id: 's_tri_first', name: 'Jumpy', desc: 'Always acts first.', effect: { kind: 'passive', passive: { id: 'firstStrike' } } },
      { id: 's_tri_luck', name: 'Charmed', desc: '+5 Luck', effect: { kind: 'stat', stat: 'luck', amount: 5 } },
      { id: 's_tri_haste', name: 'Quickstep', desc: 'Learn Quickstep.', effect: { kind: 'ability', id: 'h_haste' } },
      { id: 's_tri_gold', name: 'Pockets', desc: '+20% gold.', effect: { kind: 'passive', passive: { id: 'goldPct', power: 20 } } },
    ],
    lines: { recruit: 'What\'s in it for me? Fine, fine.', perfect: 'Didn\'t even see me.', ko: 'That\'s... not fair...' },
  },
  {
    id: 'ph_warden', name: 'Hearth', role: 'warden', title: 'placeholder', desc: 'Protects the row.', unlock: 'u_three_runs',
    base: { hp: 60, mp: 18, atk: 9, mag: 11, def: 10, res: 11, spd: 7, luck: 5 }, growth: { hp: 5.5, mp: 1.5, def: 1.2, res: 1.3, mag: 1 },
    abilities: ['h_barrier', 'h_frost', 'h_cleanse', 'h_bash'], weapon: 'w_mace', sprite: 'hero_warden',
    sparks: [
      { id: 's_war_barrier', name: 'Shieldwall', desc: 'Starts fights with a barrier.', effect: { kind: 'passive', passive: { id: 'startBarrier' } } },
      { id: 's_war_res', name: 'Steady', desc: '+4 Resist', effect: { kind: 'stat', stat: 'res', amount: 4 } },
      { id: 's_war_guardall', name: 'Cover', desc: 'Guarding shields allies too.', effect: { kind: 'passive', passive: { id: 'guardAll' } } },
      { id: 's_war_hp', name: 'Sturdy', desc: '+18 HP', effect: { kind: 'stat', stat: 'hp', amount: 18 } },
      { id: 's_war_chill', name: 'Cold hands', desc: 'Hits may chill.', effect: { kind: 'passive', passive: { id: 'chillTouch' } } },
      { id: 's_war_guardmp', name: 'Patience', desc: 'Guard restores more MP.', effect: { kind: 'passive', passive: { id: 'guardMp' } } },
    ],
    lines: { recruit: 'Stay behind me.', perfect: 'Solid.', ko: 'The wall... falls...' },
  },
  {
    id: 'ph_support', name: 'Lilt', role: 'support', title: 'placeholder', desc: 'Buffs and tempo.', unlock: 'u_kills',
    base: { hp: 46, mp: 22, atk: 7, mag: 11, def: 6, res: 9, spd: 10, luck: 8 }, growth: { hp: 4, mp: 2, mag: 1.4, spd: 0.5 },
    abilities: ['h_might', 'h_haste', 'h_storm', 'h_healall'], weapon: 'w_wand', sprite: 'hero_support',
    sparks: [
      { id: 's_sup_xp', name: 'Teacher', desc: '+15% XP.', effect: { kind: 'passive', passive: { id: 'xpPct', power: 15 } } },
      { id: 's_sup_bench', name: 'Encore', desc: 'Bench earns full XP.', effect: { kind: 'passive', passive: { id: 'benchXp' } } },
      { id: 's_sup_mp', name: 'Second wind', desc: '+10 MP', effect: { kind: 'stat', stat: 'mp', amount: 10 } },
      { id: 's_sup_shock', name: 'Static', desc: 'Hits may shock.', effect: { kind: 'passive', passive: { id: 'shockTouch' } } },
      { id: 's_sup_spd', name: 'Tempo', desc: '+3 Speed', effect: { kind: 'stat', stat: 'spd', amount: 3 } },
      { id: 's_sup_revive', name: 'Rally', desc: 'Learn Rally.', effect: { kind: 'ability', id: 'h_revive' } },
    ],
    lines: { recruit: 'Every band needs a conductor.', perfect: 'On the beat!', ko: 'Off... key...' },
  },
  {
    id: 'ph_wild', name: 'Dice', role: 'wildcard', title: 'placeholder', desc: 'Chaos.', unlock: 'u_lucky',
    base: { hp: 52, mp: 18, atk: 11, mag: 11, def: 7, res: 7, spd: 10, luck: 14 }, growth: { hp: 4.5, mp: 1.5, atk: 1.2, mag: 1.2, luck: 1 },
    abilities: ['h_fire', 'h_flurry', 'h_delay', 'h_might'], weapon: 'w_sword', sprite: 'hero_wild',
    sparks: [
      { id: 's_wil_luck', name: 'Loaded', desc: '+8 Luck', effect: { kind: 'stat', stat: 'luck', amount: 8 } },
      { id: 's_wil_crit', name: 'Jackpot', desc: 'More crits.', effect: { kind: 'passive', passive: { id: 'critPlus', power: 2 } } },
      { id: 's_wil_drops', name: 'Finder', desc: 'Better drops.', effect: { kind: 'passive', passive: { id: 'luckyDrops' } } },
      { id: 's_wil_life', name: 'Leech', desc: 'Heals on hit.', effect: { kind: 'passive', passive: { id: 'lifesteal' } } },
      { id: 's_wil_cheat', name: 'Nine lives', desc: 'Survives one fatal blow per fight.', effect: { kind: 'passive', passive: { id: 'cheatDeath' } } },
      { id: 's_wil_atk', name: 'All in', desc: '+3 Attack, +3 Magic', effect: { kind: 'stat', stat: 'atk', amount: 3 } },
    ],
    lines: { recruit: 'Heads I join, tails I also join.', perfect: 'Called it.', ko: 'Snake eyes...' },
  },
]);

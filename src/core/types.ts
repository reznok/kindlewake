import type { RngState } from './rng';

// ---------------------------------------------------------------- shared vocab

export const DAMAGE_TYPES = ['slash', 'pierce', 'blunt', 'fire', 'frost', 'storm', 'spirit'] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export const ROLES = ['tank', 'striker', 'mender', 'trickster', 'caster', 'warden', 'support', 'wildcard'] as const;
export type Role = (typeof ROLES)[number];

export const STAT_KEYS = ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luck'] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;

export type StatusId = 'poison' | 'burn' | 'chill' | 'shock' | 'bleed' | 'taunt' | 'regen' | 'barrier' | 'atkUp' | 'atkDown' | 'defUp' | 'defDown' | 'haste' | 'slow';

/** Timing grade from the input layer (the UI's window, or the bot's skill roll). */
export type Grade = 'miss' | 'good' | 'perfect';

export type IntentKind = 'attack' | 'heavy' | 'multi' | 'buff' | 'debuff' | 'heal' | 'summon' | 'charge' | 'wait';

// ---------------------------------------------------------------- abilities

export type TargetMode = 'enemy' | 'enemies' | 'ally' | 'allies' | 'self' | 'enemyRandom' | 'allyKo';

export interface Hit {
  type: DamageType;
  /** Percent of the scaling stat; 100 is a plain weapon swing. */
  power: number;
  scale: 'atk' | 'mag' | 'none';
  /** Break points removed on a weakness hit (default 1). 0 for chip-less hits. */
  chip?: number;
  /** Flat crit chance bonus (percent). */
  crit?: number;
  /** Ignores Guard and barriers. */
  pierceGuard?: boolean;
}

export type Effect =
  | { kind: 'heal'; power: number; scale: 'mag' | 'atk' | 'flat' }
  | { kind: 'revive'; fraction: number }
  | { kind: 'mp'; amount: number }
  | { kind: 'status'; id: StatusId; turns: number; power?: number; chance?: number; who?: 'target' | 'self' | 'allies' | 'enemies' }
  | { kind: 'cleanse'; who?: 'target' | 'self' | 'allies' }
  | { kind: 'chip'; amount: number }
  /** Push the target's next turn later (multiplier of one of its turns). */
  | { kind: 'delay'; amount: number }
  /** Pull the user's next turn sooner (multiplier of one of its turns, negative = sooner). */
  | { kind: 'hasteSelf'; amount: number }
  | { kind: 'summon'; enemy: string; max?: number }
  | { kind: 'breakRefill'; who: 'self' };

export interface AbilityDef {
  id: string;
  name: string;
  desc: string;
  mp: number;
  target: TargetMode;
  /** Damage hits; several hits make a rhythm ability. */
  hits?: Hit[];
  effects?: Effect[];
  /** Turn cost multiplier (1 = normal). Heavy attacks cost more, quick ones less. */
  delay?: number;
  /** Can be used while the user is on the bench? No. Can it be used outside battle (camp)? */
  field?: boolean;
  icon?: string;
  tags?: string[];
}

// ---------------------------------------------------------------- content defs

export type PassiveId =
  | 'counter' | 'lifesteal' | 'chipPlus' | 'guardMp' | 'firstStrike' | 'thorns' | 'cheatDeath' | 'critPlus' | 'timingWide'
  | 'mpRegen' | 'hpRegen' | 'goldPct' | 'xpPct' | 'startBarrier' | 'reviveOnce' | 'shopDiscount' | 'extraBag' | 'perfectHeal'
  | 'benchXp' | 'breakBonus' | 'guardAll' | 'poisonTouch' | 'burnTouch' | 'chillTouch' | 'shockTouch' | 'bleedTouch'
  | 'tauntAura' | 'hasteOnKill' | 'mpOnBreak' | 'luckyDrops' | 'ironGuard' | 'spdPlus'
  /** Enemy only: counters a hero who repeats the previous hero command. */
  | 'rehearsed';

export interface Passive { id: PassiveId; power?: number }

export type SparkEffect =
  | { kind: 'ability'; id: string }
  | { kind: 'replace'; from: string; to: string }
  | { kind: 'stat'; stat: StatKey; amount: number }
  | { kind: 'passive'; passive: Passive };

export interface SparkDef { id: string; name: string; desc: string; effect: SparkEffect; requires?: string }

export interface CharacterDef {
  id: string;
  name: string;
  role: Role;
  title: string;
  desc: string;
  base: Stats;
  /** Per level after the first. */
  growth: Partial<Stats>;
  abilities: string[];
  sparks: SparkDef[];
  weapon: string;
  sprite: string;
  portrait?: string;
  lines: { recruit: string; perfect: string; ko: string; levelUp?: string };
  /** Starting option on a fresh Ledger. */
  starter?: boolean;
  /** Ledger unlock id required before this character can appear (recruit nodes, events, start). */
  unlock?: string;
  /** Acts whose recruit nodes may offer this character (default: all). */
  acts?: (1 | 2 | 3)[];
}

export interface IntentDef {
  id: string;
  kind: IntentKind;
  name: string;
  ability: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  desc: string;
  size: 'small' | 'medium' | 'large';
  stats: Stats;
  weak: DamageType[];
  resist: DamageType[];
  immune?: DamageType[];
  breakMax: number;
  intents: IntentDef[];
  /** Intent ids in order (loops); 'random' picks any. */
  pattern: string[] | 'random';
  xp: number;
  gold: number;
  sprite: string;
  elite?: boolean;
  boss?: boolean;
  /**
   * Boss phases, in order. A phase triggers when HP drops below `hpBelow` (fraction) and/or on a Break (`onBreak`).
   * While a phase remains, lethal damage leaves the enemy at 1 HP and triggers the next phase instead of a KO.
   * A phase may reshape the enemy: new name, sprite, size, weaknesses, Break bar; `heal` is a fraction of max HP.
   */
  phases?: {
    hpBelow?: number; onBreak?: boolean; pattern: string[]; message: string; heal?: number; breakMax?: number;
    name?: string; sprite?: string; size?: 'small' | 'medium' | 'large'; weak?: DamageType[]; resist?: DamageType[]; immune?: DamageType[];
  }[];
  /** Can be summoned up to this many copies at once. */
  summonCap?: number;
  passives?: Passive[];
  drops?: string[];
}

export interface EncounterDef {
  id: string;
  enemies: { def: string; level?: number }[];
  tier: 1 | 2 | 3;
  elite?: boolean;
  boss?: boolean;
  background?: string;
  intro?: string;
}

export type ItemKind = 'weapon' | 'trinket' | 'consumable';

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  kind: ItemKind;
  price: number;
  type?: DamageType;
  /** Weapon power percent (100 = baseline). */
  power?: number;
  passive?: Passive;
  /** Consumable: used like an ability with no MP cost. */
  use?: { target: TargetMode; hits?: Hit[]; effects?: Effect[] };
  icon?: string;
  tier?: 1 | 2 | 3;
}

export interface RelicDef {
  id: string;
  name: string;
  desc: string;
  passive: Passive;
  icon?: string;
  tier?: 1 | 2 | 3;
}

export type Outcome =
  | { kind: 'gold'; amount: number }
  | { kind: 'item'; id: string }
  | { kind: 'relic'; id: string }
  | { kind: 'recruit'; id: string }
  | { kind: 'heal'; pct: number }
  | { kind: 'hurt'; pct: number }
  | { kind: 'stat'; stat: StatKey; amount: number; who: 'random' | 'all' }
  | { kind: 'xp'; amount: number }
  | { kind: 'fight'; encounter: string }
  | { kind: 'flag'; flag: string }
  | { kind: 'text'; text: string };

export interface EventChoice {
  label: string;
  /** Shown after choosing. */
  result: string;
  outcomes: Outcome[];
  /** Hidden unless this flag is set on the run. */
  requires?: string;
  /** Weighted alternative outcome branch (surprises). */
  gamble?: { chance: number; result: string; outcomes: Outcome[] };
}

export interface EventDef {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
  act: 1 | 2 | 3;
  once?: boolean;
  sprite?: string;
}

// ---------------------------------------------------------------- run state

export interface ItemInst { id: string; def: string; qty: number; plus?: number }

export interface PartyMember {
  id: string;
  def: string;
  level: number;
  xp: number;
  hp: number;
  mp: number;
  weapon: ItemInst | null;
  trinket: ItemInst | null;
  sparks: string[];
  /** Sparks offered but not yet chosen (one choice per pending). */
  pendingSparks: number;
  /** Permanent stat bumps from events. */
  bumps?: Partial<Stats>;
}

export type NodeKind = 'fight' | 'elite' | 'event' | 'recruit' | 'camp' | 'shop' | 'boss' | 'start';

export interface MapNode {
  id: number;
  col: number;
  row: number;
  kind: NodeKind;
  next: number[];
  /** Pre-rolled content so the map is honest: encounter id, event id, recruit def, shop stock. */
  encounter?: string;
  /** Enemy level for this node's encounter. */
  level?: number;
  event?: string;
  recruit?: string;
  stock?: string[];
  done?: boolean;
}

export interface ActMap { act: 1 | 2 | 3; nodes: MapNode[]; at: number | null }

export interface RunStats { kills: number; turns: number; perfects: number; breaks: number; fights: number; killedBy?: string; deepestAct: number; nodes: number }

export interface Run {
  seed: number;
  rng: RngState;
  act: 1 | 2 | 3 | 4;
  map: ActMap;
  party: PartyMember[];
  active: string[];
  gold: number;
  bag: ItemInst[];
  relics: string[];
  flags: Record<string, true>;
  stats: RunStats;
  /** Resolved outcome: a pending fight/event/etc. the UI is in the middle of. */
  pending: null | { kind: 'fight'; encounter: string; from: 'node' | 'event'; eventText?: string } | { kind: 'event'; event: string } | { kind: 'recruit'; def: string } | { kind: 'camp' } | { kind: 'shop'; stock: string[] } | { kind: 'reward'; gold: number; items: string[]; relics?: string[]; xp: number; levelUps: string[] };
  over: null | 'won' | 'lost';
  log: string[];
  createdAt: number;
  nextId: number;
}

// ---------------------------------------------------------------- ledger (meta)

export interface RunRecord { seed: number; act: number; nodes: number; result: 'won' | 'lost'; killedBy?: string; party: string[]; kills: number; turns: number; when: number }

export interface Ledger {
  runs: RunRecord[];
  unlocks: string[];
  /** Tally of things seen, for unlock rules and the Ledger screen. */
  seen: Record<string, number>;
}

export interface Settings { sound: boolean; music: boolean; timing: 'normal' | 'wide' | 'auto'; shake: boolean; seenIntro?: boolean }

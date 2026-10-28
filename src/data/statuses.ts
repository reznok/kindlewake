import type { StatusId } from '../core/types';

export interface StatusDef {
  id: StatusId;
  name: string;
  color: string;
  bad: boolean;
  desc: string;
  /** Percent of max HP lost (positive) or gained (negative) at the start of each of the owner's turns. */
  tick?: number;
  /** Stat multipliers while active. */
  mods?: Partial<Record<'atk' | 'mag' | 'def' | 'res' | 'spd', number>>;
  icon?: string;
}

export const STATUSES: Record<StatusId, StatusDef> = {
  poison: { id: 'poison', name: 'Poison', color: '#9ad64a', bad: true, desc: 'Loses 6% HP each turn.', tick: 6 },
  burn: { id: 'burn', name: 'Burn', color: '#ff8a3c', bad: true, desc: 'Loses 8% HP each turn and deals 20% less physical damage.', tick: 8, mods: { atk: 0.8 } },
  chill: { id: 'chill', name: 'Chill', color: '#8fd8ff', bad: true, desc: 'Acts 30% slower.', mods: { spd: 0.7 } },
  shock: { id: 'shock', name: 'Shock', color: '#ffe95c', bad: true, desc: 'Cannot Guard; timing windows shrink.' },
  bleed: { id: 'bleed', name: 'Bleed', color: '#ff5c7a', bad: true, desc: 'Loses 4% HP each turn; Break chips hit twice as hard.', tick: 4 },
  taunt: { id: 'taunt', name: 'Taunt', color: '#ffb35c', bad: false, desc: 'Enemies must attack this one.' },
  regen: { id: 'regen', name: 'Regen', color: '#8fdf7a', bad: false, desc: 'Recovers 8% HP each turn.', tick: -8 },
  barrier: { id: 'barrier', name: 'Barrier', color: '#9cc8ff', bad: false, desc: 'Absorbs damage until it pops.' },
  atkUp: { id: 'atkUp', name: 'Might', color: '#ff9a5c', bad: false, desc: 'Deals 30% more damage.', mods: { atk: 1.3, mag: 1.3 } },
  atkDown: { id: 'atkDown', name: 'Feeble', color: '#c9a0ff', bad: true, desc: 'Deals 30% less damage.', mods: { atk: 0.7, mag: 0.7 } },
  defUp: { id: 'defUp', name: 'Stone', color: '#d8c8a0', bad: false, desc: 'Takes 30% less damage.', mods: { def: 1.4, res: 1.4 } },
  defDown: { id: 'defDown', name: 'Soft', color: '#ff8a8a', bad: true, desc: 'Takes 30% more damage.', mods: { def: 0.6, res: 0.6 } },
  haste: { id: 'haste', name: 'Haste', color: '#fff0a0', bad: false, desc: 'Acts 40% faster.', mods: { spd: 1.4 } },
  slow: { id: 'slow', name: 'Slow', color: '#a0a0c0', bad: true, desc: 'Acts 40% slower.', mods: { spd: 0.6 } },
};

import type { RelicDef } from '../core/types';

export const RELICS: Record<string, RelicDef> = {};

export function defineRelics(list: RelicDef[]) { for (const r of list) RELICS[r.id] = r; }

defineRelics([
  { id: 'r_purse', name: 'Deep purse', desc: '+25% gold from fights.', passive: { id: 'goldPct', power: 25 }, tier: 1 },
  { id: 'r_primer', name: 'Primer', desc: '+20% XP.', passive: { id: 'xpPct', power: 20 }, tier: 1 },
  { id: 'r_whetstone', name: 'Whetstone', desc: 'Weakness hits chip one more.', passive: { id: 'chipPlus' }, tier: 1 },
  { id: 'r_bell', name: 'Bell', desc: 'Everyone starts with a barrier.', passive: { id: 'startBarrier' }, tier: 1 },
  { id: 'r_kettle', name: 'Kettle', desc: 'Everyone regenerates a little MP.', passive: { id: 'mpRegen' }, tier: 1 },
  { id: 'r_bandage', name: 'Endless bandage', desc: 'Everyone regenerates a little HP.', passive: { id: 'hpRegen' }, tier: 1 },
  { id: 'r_coin', name: 'Two-headed coin', desc: 'More crits for everyone.', passive: { id: 'critPlus' }, tier: 1 },
  { id: 'r_glass', name: 'Hourglass', desc: 'Wider timing windows.', passive: { id: 'timingWide' }, tier: 1 },
  { id: 'r_satchel', name: 'Satchel', desc: 'Four more bag slots.', passive: { id: 'extraBag', power: 4 }, tier: 1 },
  { id: 'r_token', name: 'Merchant token', desc: 'Shops are 20% cheaper.', passive: { id: 'shopDiscount', power: 20 }, tier: 1 },
  { id: 'r_drum', name: 'Drum', desc: 'MP for all on every Break.', passive: { id: 'mpOnBreak' }, tier: 1 },
  { id: 'r_horseshoe', name: 'Horseshoe', desc: 'Better drops.', passive: { id: 'luckyDrops' }, tier: 1 },
]);

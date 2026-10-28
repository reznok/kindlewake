import type { Ledger, Run, Settings } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ENCOUNTERS } from '../data/encounters';
import { EVENTS } from '../data/events';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { newLedger } from './ledger';

const RUN_KEY = 'kw.run', LEDGER_KEY = 'kw.ledger', SETTINGS_KEY = 'kw.settings';

function store(): Storage | null { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } }

export function saveRun(run: Run | null) {
  const s = store();
  if (!s) return;
  try { if (run) s.setItem(RUN_KEY, JSON.stringify(run)); else s.removeItem(RUN_KEY); } catch { /* quota */ }
}

/** A saved run is only usable when every piece of content it references still exists. */
export function runIsValid(run: Run): boolean {
  if (!run || !Array.isArray(run.party) || !run.map?.nodes) return false;
  if (!run.party.every((m) => CHARACTERS[m.def])) return false;
  if (run.pending?.kind === 'fight' && !ENCOUNTERS[run.pending.encounter]) return false;
  if (run.pending?.kind === 'event' && !EVENTS[run.pending.event]) return false;
  if (run.pending?.kind === 'recruit' && !CHARACTERS[run.pending.def]) return false;
  if (!run.map.nodes.every((n) => (!n.encounter || ENCOUNTERS[n.encounter]) && (!n.event || EVENTS[n.event]) && (!n.recruit || CHARACTERS[n.recruit]))) return false;
  if (!run.bag.every((i) => ITEMS[i.def]) || !run.relics.every((r) => RELICS[r])) return false;
  return true;
}

export function loadRun(): Run | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(RUN_KEY);
    const run = raw ? (JSON.parse(raw) as Run) : null;
    if (run && !runIsValid(run)) { s.removeItem(RUN_KEY); return null; }
    return run;
  } catch { return null; }
}

export function saveLedger(l: Ledger) { const s = store(); if (!s) return; try { s.setItem(LEDGER_KEY, JSON.stringify(l)); } catch { /* quota */ } }

export function loadLedger(): Ledger {
  const s = store();
  if (!s) return newLedger();
  try { const raw = s.getItem(LEDGER_KEY); return raw ? { ...newLedger(), ...(JSON.parse(raw) as Ledger) } : newLedger(); } catch { return newLedger(); }
}

export const DEFAULT_SETTINGS: Settings = { sound: true, music: true, timing: 'normal', shake: true };

export function loadSettings(): Settings {
  const s = store();
  if (!s) return { ...DEFAULT_SETTINGS };
  try { const raw = s.getItem(SETTINGS_KEY); return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) } : { ...DEFAULT_SETTINGS }; } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(v: Settings) { const s = store(); if (!s) return; try { s.setItem(SETTINGS_KEY, JSON.stringify(v)); } catch { /* quota */ } }

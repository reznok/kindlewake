import type { Ledger, Run, Settings } from '../core/types';
import { newLedger } from './ledger';

const RUN_KEY = 'kw.run', LEDGER_KEY = 'kw.ledger', SETTINGS_KEY = 'kw.settings';

function store(): Storage | null { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } }

export function saveRun(run: Run | null) {
  const s = store();
  if (!s) return;
  try { if (run) s.setItem(RUN_KEY, JSON.stringify(run)); else s.removeItem(RUN_KEY); } catch { /* quota */ }
}

export function loadRun(): Run | null {
  const s = store();
  if (!s) return null;
  try { const raw = s.getItem(RUN_KEY); return raw ? (JSON.parse(raw) as Run) : null; } catch { return null; }
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

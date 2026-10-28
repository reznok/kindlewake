/** App shell: screen router, overlay stack, settings, Ledger, global keys. */
import type { Ledger, Run, Settings } from '../core/types';
import type { BattleState } from '../engine/battle';
import { bindLedger } from '../engine/run';
import { loadLedger, loadSettings, saveLedger, saveRun, saveSettings } from '../engine/save';
import { configureAudio, play } from './audio';
import { el } from './dom';
import { toggleHelp } from './help';
import { focusFirst, navKey } from './input';

export interface Screen {
  name: string;
  root: HTMLElement;
  mount?(): void;
  unmount?(): void;
  /** Return true when the key was handled. */
  key?(e: KeyboardEvent): boolean;
  back?(): void;
  /** Redraw DOM bits after a sheet changed the run. */
  refresh?(): void;
}

export interface Layer {
  root: HTMLElement;
  closable: boolean;
  key?(e: KeyboardEvent): boolean;
  close(): void;
}

/** What killed the last hero, for the end screen. */
export interface LastBlow { by: string; target: string; dmg: number; hpBefore: number }

export class App {
  root: HTMLElement;
  stage: HTMLElement;
  layerRoot: HTMLElement;
  screen: Screen | null = null;
  layers: Layer[] = [];
  settings: Settings;
  ledger: Ledger;
  run: Run | null = null;
  /** Live battle state while a fight is on screen (dev hook). */
  battle: BattleState | null = null;
  auto = false;
  fast = false;
  lastBlow: LastBlow | null = null;
  /** The biggest foe action of the fight that ended the run, as a lesson line for the end screen. */
  turningPoint: string | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.settings = loadSettings();
    configureAudio(this.settings);
    this.ledger = loadLedger();
    bindLedger(this.ledger);
    this.stage = el('div.stage');
    this.layerRoot = el('div.layers');
    root.replaceChildren(this.stage, this.layerRoot);
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  go(s: Screen) {
    while (this.layers.length) this.layers[this.layers.length - 1].close();
    this.screen?.unmount?.();
    this.stage.replaceChildren(s.root);
    this.screen = s;
    s.mount?.();
  }

  pushLayer(l: Layer) {
    this.layers.push(l);
    this.layerRoot.append(l.root);
    requestAnimationFrame(() => focusFirst(l.root));
  }

  popLayer(l: Layer) {
    const i = this.layers.indexOf(l);
    if (i < 0) return;
    this.layers.splice(i, 1);
    l.root.remove();
    this.refresh();
  }

  topLayer(): Layer | null { return this.layers[this.layers.length - 1] ?? null; }

  setSettings(patch: Partial<Settings>) {
    Object.assign(this.settings, patch);
    saveSettings(this.settings);
    configureAudio(this.settings);
  }

  persist() { if (this.run) saveRun(this.run); }
  persistLedger() { saveLedger(this.ledger); }

  refresh() { this.screen?.refresh?.(); }

  /** Append a narration line to the run log (shown on the end screen). */
  log(text: string) {
    if (!this.run) return;
    this.run.log.push(text);
    if (this.run.log.length > 60) this.run.log.splice(0, this.run.log.length - 60);
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) { toggleHelp(this); e.preventDefault(); return; }
    const top = this.topLayer();
    if (top) {
      if (top.key?.(e)) { e.preventDefault(); return; }
      if (e.key === 'Escape') { if (top.closable) { play('menu'); top.close(); } e.preventDefault(); return; }
      if (navKey(top.root, e)) e.preventDefault();
      return;
    }
    const s = this.screen;
    if (!s) return;
    if (s.key?.(e)) { e.preventDefault(); return; }
    if (e.key === 'Escape' && s.back) { s.back(); e.preventDefault(); return; }
    if (navKey(s.root, e)) e.preventDefault();
  }
}

/** Screen-to-screen flow. Screens call these instead of importing each other. */
import { newRun, startBattle } from '../engine/run';
import { loadRun } from '../engine/save';
import type { App } from './app';
import { BattleScene } from './battle';
import { EndScreen } from './end';
import { MapScreen } from './map';
import { openCamp, openEvent, openRecruit, openReward, openShop } from './nodes';
import { RosterScreen } from './roster';
import { TitleScreen } from './title';

export function toTitle(app: App) {
  app.run = null;
  app.battle = null;
  app.go(new TitleScreen(app));
}

export function toRoster(app: App) { app.go(new RosterScreen(app)); }

export function beginRun(app: App, seed: number, picks: string[]) {
  app.run = newRun(seed, picks, app.ledger);
  app.lastBlow = null;
  app.log('The run begins. Seed ' + seed + '.');
  app.persist();
  toMap(app);
}

export function continueRun(app: App) {
  const r = loadRun();
  if (!r) return;
  app.run = r;
  if (r.over) toEnd(app);
  else toMap(app);
}

/** Show the map, then resume whatever the run was in the middle of. */
export function toMap(app: App) {
  const run = app.run;
  if (!run) return toTitle(app);
  if (run.over) return toEnd(app);
  app.battle = null;
  if (run.pending?.kind === 'fight') return toBattle(app);
  app.go(new MapScreen(app));
  handlePending(app);
}

/** Open the sheet for the run's pending business (after entering a node or on resume). */
export function handlePending(app: App) {
  const run = app.run;
  const p = run?.pending;
  if (!run || !p) return;
  switch (p.kind) {
    case 'fight': return toBattle(app);
    case 'event': return void openEvent(app);
    case 'recruit': return void openRecruit(app);
    case 'camp': return void openCamp(app);
    case 'shop': return void openShop(app);
    case 'reward': return void openReward(app);
  }
}

export function toBattle(app: App) {
  const run = app.run!;
  const state = startBattle(run);
  app.battle = state;
  app.go(new BattleScene(app, state));
}

export function toEnd(app: App) {
  app.battle = null;
  app.go(new EndScreen(app));
}

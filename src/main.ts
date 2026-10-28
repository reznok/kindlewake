import './style.css';
import { App } from './ui/app';
import { audioLog } from './ui/audio';
import type { BattleScene } from './ui/battle';
import { drawBattle } from './ui/battleView';
import * as flow from './ui/flow';

const app = new App(document.getElementById('app')!);
flow.toTitle(app);

/** Dev hook for poking at the game from the console. */
const kw = {
  app,
  flow,
  audioLog,
  get run() { return app.run; },
  get battle() { return app.battle; },
  get scene() { return app.screen?.name === 'battle' ? (app.screen as BattleScene) : null; },
  /** Draw one battle frame now (frames are throttled while the tab is hidden). */
  redraw() { const s = kw.scene; if (s) drawBattle(s, performance.now()); },
  /** Answer a timing window as if tapped now. */
  press() { return (app.screen as BattleScene | null)?.timing?.press() ?? false; },
};
(window as unknown as { kw: typeof kw }).kw = kw;

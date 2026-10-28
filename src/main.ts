import './style.css';
import { App } from './ui/app';
import { audioLog, audioState, play, toggleMute } from './ui/audio';
import type { BattleScene } from './ui/battle';
import { drawBattle } from './ui/battleView';
import * as flow from './ui/flow';
import { loadArt, spriteKeys } from './ui/sprites';

const app = new App(document.getElementById('app')!);

// M toggles all sound (outside text fields)
window.addEventListener('keydown', (e) => {
  if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target instanceof HTMLInputElement)) toggleMute();
}, { capture: true });

/** Dev hook for poking at the game from the console. */
const kw = {
  app,
  flow,
  audioLog,
  audioState,
  play,
  spriteKeys,
  get run() { return app.run; },
  get battle() { return app.battle; },
  get scene() { return app.screen?.name === 'battle' ? (app.screen as BattleScene) : null; },
  /** Draw one battle frame now (frames are throttled while the tab is hidden). */
  redraw() { const s = kw.scene; if (s) drawBattle(s, performance.now()); },
  /** Answer a timing window as if tapped now. */
  press() { return (app.screen as BattleScene | null)?.timing?.press() ?? false; },
};
(window as unknown as { kw: typeof kw }).kw = kw;

// art first (atlas, fonts, first backdrops) so portraits and DOM cards are drawn with it; never blocks for long
void Promise.race([loadArt(), new Promise((r) => setTimeout(r, 4000))]).then(() => flow.toTitle(app));

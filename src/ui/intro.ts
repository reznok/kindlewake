/** First-run intro: a few full-screen story cards. Tap / Enter advances, Esc or Skip ends. Replayable from the menus. */
import { INTRO } from '../data';
import type { App, Layer } from './app';
import { play } from './audio';
import { btn, el, fill, rich } from './dom';
import { isConfirm } from './input';

export function showIntro(app: App, onDone?: () => void): void {
  let i = 0;
  let closed = false;
  const card = el('div.intro-card');
  const root = el('div.intro-layer', card);
  const finish = () => {
    if (closed) return;
    closed = true;
    app.setSettings({ seenIntro: true });
    app.popLayer(layer);
    onDone?.();
  };
  const next = () => {
    if (closed) return;
    play('menu');
    if (++i >= INTRO.length) finish();
    else render();
  };
  const layer: Layer = {
    root,
    closable: false,
    key: (e) => {
      if (isConfirm(e) || e.key === 'ArrowRight') { if (!e.repeat) next(); return true; }
      if (e.key === 'Escape') { finish(); return true; }
      return true;
    },
    close: finish,
  };
  const render = () => {
    const p = INTRO[i];
    const last = i === INTRO.length - 1;
    fill(card,
      p.title ? el('h2.intro-title', p.title) : null,
      el('p.intro-text', rich(p.text)),
      el('div.intro-foot',
        el('span.intro-dots', INTRO.map((_, k) => el('span.dot' + (k === i ? '.on' : '')))),
        btn('Skip', finish, 'ghost small'),
        btn(last ? (onDone ? 'Begin' : 'Close') : 'Next', next, 'small', { data: { default: '' } }),
      ),
    );
  };
  // a tap anywhere outside the buttons turns the page
  root.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('button')) next(); });
  render();
  app.pushLayer(layer);
}

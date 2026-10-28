/** Title screen: logo, tagline, Continue / New / Ledger / Story / Settings / Credits. */
import { CHARACTERS } from '../data/characters';
import { starters } from '../engine/ledger';
import { loadRun } from '../engine/save';
import type { App, Screen } from './app';
import { music, play } from './audio';
import { frameLoop, Surface } from './canvas';
import { btn, el } from './dom';
import { tagline } from './flavour';
import { continueRun, toNewRun } from './flow';
import { showIntro } from './intro';
import { focusFirst } from './input';
import { ask, openCredits, openLedger, openSettings } from './sheets';
import { drawActor, drawBackground } from './sprites';

export class TitleScreen implements Screen {
  name = 'title';
  root: HTMLElement;
  private surf!: Surface;
  private stop: (() => void) | null = null;

  constructor(private app: App) {
    this.root = el('div.screen.title-screen');
  }

  mount() {
    const saved = loadRun();
    const canContinue = !!saved;
    const menu = el('div.title-menu',
      canContinue ? btn('Continue', () => { play('confirm'); continueRun(this.app); }, 'big', { data: { default: '' } }) : null,
      btn('Begin a new Wake', () => { play('confirm'); if (saved && !saved.over) ask(this.app, 'Begin a new Wake?', 'The Wake in progress will be lost.', 'Start fresh', () => toNewRun(this.app)); else toNewRun(this.app); }, canContinue ? 'big blue' : 'big', { title: 'A Wake is one run' }),
      btn('The Ledger', () => { play('menu'); openLedger(this.app); }, 'ghost'),
      this.app.settings.seenIntro ? btn('Story so far', () => { play('menu'); showIntro(this.app); }, 'ghost') : null,
      btn('Settings', () => { play('menu'); openSettings(this.app); }, 'ghost'),
      btn('Credits', () => { play('menu'); openCredits(this.app); }, 'ghost'),
    );
    const logo = el('div.logo', el('h1', 'Kindlewake'), el('p.tagline', tagline(this.app.ledger)));
    const art = el('div.title-art');
    this.root.replaceChildren(art, el('div.title-front', logo, menu), el('div.title-foot', 'Press ? for keys'));
    this.surf = new Surface(art);
    const heroes = starters(this.app.ledger).slice(0, 3).map((id) => CHARACTERS[id]);
    this.stop = frameLoop((t) => {
      const { ctx, w, h } = this.surf;
      drawBackground(ctx, 'title', w, h);
      const s = Math.min(96, h * 0.22);
      heroes.forEach((c, i) => drawActor(ctx, c.sprite, w * 0.04 + i * s * 1.1, h - s * 1.12 - (i % 2) * s * 0.18, s * (160 / 112), s, { label: c.name, time: t + i * 400, facing: 1 }));
    });
    music('title');
    requestAnimationFrame(() => focusFirst(menu));
  }

  unmount() { this.stop?.(); this.surf?.destroy(); }
}

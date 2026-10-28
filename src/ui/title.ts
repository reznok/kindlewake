/** Title screen: logo, Continue / New run / Ledger / Settings / Credits. */
import { CHARACTERS } from '../data/characters';
import { starters } from '../engine/ledger';
import { loadRun } from '../engine/save';
import type { App, Screen } from './app';
import { music, play } from './audio';
import { frameLoop, Surface } from './canvas';
import { btn, el } from './dom';
import { continueRun, toRoster } from './flow';
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
      btn('New run', () => { play('confirm'); if (saved && !saved.over) ask(this.app, 'Start a new run?', 'The saved run will be lost.', 'Start fresh', () => toRoster(this.app)); else toRoster(this.app); }, canContinue ? 'big blue' : 'big'),
      btn('Ledger', () => { play('menu'); openLedger(this.app); }, 'ghost'),
      btn('Settings', () => { play('menu'); openSettings(this.app); }, 'ghost'),
      btn('Credits', () => { play('menu'); openCredits(this.app); }, 'ghost'),
    );
    const logo = el('div.logo', el('h1', 'Kindlewake'), el('p.tagline', 'a party RPG of timed hits and bad decisions'));
    const art = el('div.title-art');
    this.root.replaceChildren(art, el('div.title-front', logo, menu), el('div.title-foot', 'Press ? for keys'));
    this.surf = new Surface(art);
    const heroes = starters(this.app.ledger).slice(0, 3).map((id) => CHARACTERS[id]);
    this.stop = frameLoop((t) => {
      const { ctx, w, h } = this.surf;
      drawBackground(ctx, 'title', w, h);
      const s = Math.min(70, h * 0.17);
      heroes.forEach((c, i) => drawActor(ctx, c.sprite, w * 0.07 + i * s * 1.3, h - s * 1.25 - (i % 2) * s * 0.2, s, s, { label: c.name, time: t + i * 400, facing: 1 }));
    });
    music('title');
    requestAnimationFrame(() => focusFirst(menu));
  }

  unmount() { this.stop?.(); this.surf?.destroy(); }
}

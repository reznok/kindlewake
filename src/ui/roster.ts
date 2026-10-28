/** Roster pick: choose three starters, optional seed, Begin. */
import type { CharacterDef } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { starters } from '../engine/ledger';
import type { App, Screen } from './app';
import { play } from './audio';
import { btn, el, fill } from './dom';
import { beginRun, toTitle } from './flow';
import { focusFirst } from './input';
import { cap, ROLE_COLOR } from './palette';
import { abilityRow, portrait, statGrid, typeTag } from './portrait';

export class RosterScreen implements Screen {
  name = 'roster';
  root: HTMLElement;
  private picks: string[] = [];
  private focus: string;
  private list: CharacterDef[];
  private cards = new Map<string, HTMLElement>();
  private detail = el('div.roster-detail');
  private slots = el('div.roster-slots');
  private seedInput: HTMLInputElement;
  private begin: HTMLButtonElement;

  constructor(private app: App) {
    this.list = starters(app.ledger).map((id) => CHARACTERS[id]).filter(Boolean);
    this.focus = this.list[0]?.id ?? '';
    // with only three to choose from, they are already chosen
    if (this.list.length <= 3) this.picks = this.list.map((c) => c.id);
    this.root = el('div.screen.roster-screen');
    this.seedInput = el<HTMLInputElement>('input.seed', { type: 'text', placeholder: 'random', attrs: { inputmode: 'numeric', 'aria-label': 'Seed', maxlength: '10' } });
    this.begin = btn('Begin', () => this.start(), 'big');
  }

  mount() {
    const grid = el('div.roster-grid');
    for (const c of this.list) {
      const card = el('button.card.char-card', { type: 'button', onclick: () => this.toggle(c.id), onfocus: () => this.show(c.id), onpointerenter: () => this.show(c.id) },
        portrait(c.sprite, c.name, 52),
        el('div.cc-name', c.name),
        el('div.role-chip', { style: { background: ROLE_COLOR[c.role] } }, cap(c.role)),
        el('div.pick-badge'),
      );
      this.cards.set(c.id, card);
      grid.append(card);
    }
    const head = el('div.screen-head',
      btn('Back', () => toTitle(this.app), 'ghost small'),
      el('h2', this.list.length <= 3 ? 'Your three' : 'Choose three'),
      el('label.seed-label', 'Seed ', this.seedInput),
      this.begin,
    );
    this.root.replaceChildren(head, el('div.roster-body', el('div.roster-left', grid, this.slots), this.detail));
    this.show(this.focus);
    this.update();
    requestAnimationFrame(() => focusFirst(grid));
  }

  back() { toTitle(this.app); }

  private toggle(id: string) {
    const i = this.picks.indexOf(id);
    if (i >= 0) this.picks.splice(i, 1);
    else if (this.picks.length < 3) this.picks.push(id);
    else { this.picks.shift(); this.picks.push(id); }
    play('menu');
    this.show(id);
    this.update();
  }

  private update() {
    for (const [id, card] of this.cards) {
      const i = this.picks.indexOf(id);
      card.classList.toggle('picked', i >= 0);
      card.querySelector('.pick-badge')!.textContent = i >= 0 ? String(i + 1) : '';
    }
    fill(this.slots, [0, 1, 2].map((i) => {
      const id = this.picks[i];
      const c = id ? CHARACTERS[id] : null;
      return el('div.slot' + (c ? '.full' : ''), c ? [portrait(c.sprite, c.name, 30), el('span', c.name)] : el('span.muted', 'Slot ' + (i + 1)));
    }));
    this.begin.disabled = this.picks.length !== 3;
  }

  private show(id: string) {
    const c = CHARACTERS[id];
    if (!c) return;
    this.focus = id;
    const w = ITEMS[c.weapon];
    fill(this.detail,
      el('div.detail-head', portrait(c.sprite, c.name, 64), el('div',
        el('h3', c.name), el('div.role-chip', { style: { background: ROLE_COLOR[c.role] } }, cap(c.role)), el('p.muted', c.desc))),
      statGrid(c.base),
      w ? el('p.weapon-line', 'Weapon: ', el('b', w.name), ' ', w.type ? typeTag(w.type) : null) : null,
      el('h4', 'Abilities'),
      c.abilities.map((a) => abilityRow(a)),
    );
  }

  private start() {
    if (this.picks.length !== 3) return;
    const raw = this.seedInput.value.trim();
    const seed = raw && /^\d+$/.test(raw) ? Number(raw) >>> 0 : (Math.random() * 1e9) >>> 0;
    play('confirm');
    beginRun(this.app, seed, [...this.picks]);
  }
}

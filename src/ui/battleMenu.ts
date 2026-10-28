/** The DOM command menu for the active hero, with skill / item / swap lists and target picking. */
import type { ItemInst, TargetMode } from '../core/types';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { type BattleAction, type Combatant, alive, legalActions } from '../engine/battle';
import { play } from './audio';
import type { BattleScene } from './battle';
import { btn, el, fill } from './dom';
import { focusFirst, isConfirm, navKey } from './input';
import { typeTag } from './portrait';

type Mode = 'main' | 'skill' | 'item' | 'swap' | 'revive' | 'target';

export class CommandMenu {
  root = el('div.cmd');
  visible = false;
  private resolve: ((a: BattleAction | null) => void) | null = null;
  private hero!: Combatant;
  private mode: Mode = 'main';
  /** Number-key shortcuts for the current view. */
  private hot: HTMLButtonElement[] = [];

  constructor(private sc: BattleScene) {
    this.root.style.display = 'none';
  }

  choose(c: Combatant): Promise<BattleAction | null> {
    this.hero = c;
    return new Promise((res) => {
      this.resolve = res;
      this.visible = true;
      this.root.style.display = '';
      this.show('main');
    });
  }

  /** Abandon the current choice (Auto switched on, scene left). */
  cancel() {
    this.sc.cancelTarget();
    const r = this.resolve;
    this.resolve = null;
    this.hide();
    r?.(null);
  }

  private hide() {
    this.visible = false;
    this.root.style.display = 'none';
    this.root.classList.remove('expanded');
    fill(this.root);
  }

  private done(a: BattleAction) {
    play('confirm');
    const r = this.resolve;
    this.resolve = null;
    this.hide();
    r?.(a);
  }

  key(e: KeyboardEvent): boolean {
    if (!this.visible || this.mode === 'target') return false;
    if (/^[1-9]$/.test(e.key)) {
      const b = this.hot[Number(e.key) - 1];
      if (b && !b.disabled) b.click();
      return true;
    }
    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (this.mode !== 'main') { play('menu'); this.show('main'); }
      return true;
    }
    if (isConfirm(e) && !this.root.contains(document.activeElement)) { focusFirst(this.root); return true; }
    return navKey(this.root, e);
  }

  private show(mode: Mode) {
    this.mode = mode;
    const s = this.sc.state;
    const legal = legalActions(s);
    this.hot = [];
    this.root.classList.toggle('expanded', mode !== 'main' && mode !== 'target');
    const hk = (b: HTMLButtonElement) => { this.hot.push(b); b.dataset.key = String(this.hot.length); return b; };
    if (mode === 'main') {
      const foes = alive(s.enemies);
      fill(this.root, el('div.cmd-grid',
        hk(btn('Attack', () => this.pickTarget(foes.map((f) => f.id), (id) => ({ t: 'attack', target: id })), 'cmd-btn attack', { data: { default: '' } })),
        hk(btn('Skill', () => { play('menu'); this.show('skill'); }, 'cmd-btn', { disabled: !legal.skills.length })),
        hk(btn('Item', () => { play('menu'); this.show('item'); }, 'cmd-btn', { disabled: !legal.items.length })),
        hk(btn('Guard', () => this.done({ t: 'guard' }), 'cmd-btn')),
        hk(btn('Swap', () => { play('menu'); this.show('swap'); }, 'cmd-btn', { disabled: !legal.swap.length })),
        hk(btn('Flee', () => this.done({ t: 'flee' }), 'cmd-btn', { disabled: !legal.flee, title: legal.flee ? 'Try to escape' : 'Cannot flee this fight' })),
      ));
      this.sc.say(`${this.hero.name}'s turn.`, false);
    } else if (mode === 'skill') {
      this.list('Skills', legal.skills.map((k) => {
        const a = ABILITIES[k.id];
        const types = [...new Set((a.hits ?? []).map((h) => h.type))];
        const b = btn([el('span.li-name', a.name), types.map(typeTag), (a.hits?.length ?? 0) > 1 ? el('span.hits', 'x' + a.hits!.length) : null, el('span.li-cost', a.mp ? a.mp + ' MP' : 'free')],
          () => this.useTarget(a.target, (target) => ({ t: 'skill', id: k.id, target })), 'li', { disabled: !k.ok, title: k.why ?? a.desc });
        b.addEventListener('focus', () => this.sc.say(a.desc + (k.why ? ' (' + k.why + ')' : ''), false));
        b.addEventListener('pointerenter', () => this.sc.say(a.desc + (k.why ? ' (' + k.why + ')' : ''), false));
        return hk(b);
      }));
    } else if (mode === 'item') {
      this.list('Items', legal.items.map((it: ItemInst) => {
        const d = ITEMS[it.def];
        const b = btn([el('span.li-name', d.name), d.use?.hits?.[0] ? typeTag(d.use.hits[0].type) : null, el('span.li-cost', 'x' + it.qty)],
          () => this.useTarget(d.use!.target, (target) => ({ t: 'item', item: it.id, target })), 'li', { title: d.desc });
        b.addEventListener('focus', () => this.sc.say(d.desc, false));
        b.addEventListener('pointerenter', () => this.sc.say(d.desc, false));
        return hk(b);
      }));
    } else if (mode === 'swap') {
      this.list('Swap in', legal.swap.map((mid) => {
        const c = s.bench.find((b) => b.member === mid)!;
        return hk(btn([el('span.li-name', c.name), el('span.li-cost', `${c.hp}/${c.maxHp} HP`)], () => this.done({ t: 'swap', member: mid }), 'li'));
      }));
      this.sc.say('Swapping costs this turn. The newcomer acts soon.', false);
    }
    requestAnimationFrame(() => { if (this.visible && !(document.activeElement && this.root.contains(document.activeElement))) focusFirst(this.root); });
  }

  private list(title: string, items: HTMLButtonElement[], back: Mode = 'main') {
    fill(this.root, el('div.cmd-list',
      el('div.cmd-list-head', btn('← Back', () => { play('menu'); this.show(back); }, 'small ghost'), el('b', title)),
      el('div.cmd-items', items.length ? items : el('p.muted', 'Nothing here.')),
    ));
  }

  /** Decide targets by mode: pick one, or go straight on for group / self modes. */
  private useTarget(mode: TargetMode, make: (target?: string) => BattleAction) {
    const s = this.sc.state;
    if (mode === 'enemy') return this.pickTarget(alive(s.enemies).map((c) => c.id), make);
    if (mode === 'ally') return this.pickTarget(alive(s.heroes).map((c) => c.id), make);
    if (mode === 'allyKo') {
      const kos = [...s.heroes, ...s.bench].filter((c) => c.ko);
      if (!kos.length) { this.sc.say('Nobody is down.', false); return; }
      const prev = this.mode;
      this.mode = 'revive';
      this.hot = [];
      this.list('Revive who?', kos.map((c, i) => { const b = btn(c.name, () => this.done(make(c.id)), 'li'); this.hot[i] = b; return b; }), prev === 'item' ? 'item' : 'skill');
      requestAnimationFrame(() => focusFirst(this.root));
      return;
    }
    this.done(make(undefined));
  }

  private async pickTarget(ids: string[], make: (id: string) => BattleAction) {
    if (!ids.length) return;
    const back = this.mode;
    play('menu');
    this.mode = 'target';
    this.hot = [];
    this.root.classList.remove('expanded');
    fill(this.root, el('div.cmd-target', el('b', 'Pick a target'), el('span.muted', 'Tap one, or arrows + Enter'), btn('Cancel', () => this.sc.cancelTarget(), 'small ghost')));
    const id = await this.sc.pickTarget(ids, this.hero.id);
    if (!this.resolve) return;
    if (id) { this.sc.rememberTarget(this.hero.id, id); this.done(make(id)); }
    else { play('menu'); this.show(back === 'target' ? 'main' : back); }
  }
}

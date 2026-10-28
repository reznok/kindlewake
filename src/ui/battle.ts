/**
 * Battle scene controller. Each turn: the hero picks (or the bot picks under Auto), timing windows collect grades,
 * then `step` runs and its events are animated. Enemy turns run guard windows on the targeted heroes first.
 */
import { Rng } from '../core/rng';
import type { Grade } from '../core/types';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { STATUSES } from '../data/statuses';
import { type BattleAction, type BattleEvent, type BattleState, type Combatant, alive, byId, hasStatus, step } from '../engine/battle';
import { chooseHeroAction } from '../engine/bot';
import { finishBattle } from '../engine/run';
import { hasPassive } from '../engine/stats';
import type { App, Screen } from './app';
import { music, play } from './audio';
import { CommandMenu } from './battleMenu';
import { type Box, type Vis, drawBattle } from './battleView';
import { frameLoop, Surface } from './canvas';
import { btn, el } from './dom';
import { toEnd, toMap } from './flow';
import { Fx } from './fx';
import { toggleHelp } from './help';
import { isConfirm, keyDir } from './input';
import { openReward } from './nodes';
import { TYPE_COLOR } from './palette';
import type { Anim } from './sprites';
import { TimingRunner, windowSizes } from './timing';

export class BattleScene implements Screen {
  name = 'battle';
  root: HTMLElement;
  surf!: Surface;
  fx = new Fx();
  timing = new TimingRunner();
  menu: CommandMenu;
  heroSlots: string[] = [];
  enemySlots: string[] = [];
  boxes = new Map<string, Box>();
  activeId: string | null = null;
  targeting: { ids: string[]; idx: number; resolve: (id: string | null) => void } | null = null;
  bottomH = 104;
  private visMap = new Map<string, Vis>();
  private msgPrev = el('div.msg-prev');
  private msgCur = el('div.msg-cur');
  private lines: string[] = [];
  private autoBtn!: HTMLButtonElement;
  private fastBtn!: HTMLButtonElement;
  private live = true;
  private stop: (() => void) | null = null;
  private botRng = new Rng((Math.random() * 1e9) >>> 0);
  private lastTargets = new Map<string, string>();
  private lastHeroHit: { by: string; target: string; dmg: number; hpBefore: number } | null = null;

  constructor(public app: App, public state: BattleState) {
    this.root = el('div.screen.battle-screen');
    this.menu = new CommandMenu(this);
  }

  // ------------------------------------------------------------ lifecycle

  mount() {
    const wrap = el('div.battle-canvas');
    this.autoBtn = btn('Auto', () => this.toggleAuto(), 'toggle small');
    this.fastBtn = btn('Fast', () => this.toggleFast(), 'toggle small');
    const tools = el('div.battle-tools', this.autoBtn, this.fastBtn, btn('?', () => toggleHelp(this.app), 'toggle small round', { title: 'Help (?)' }));
    const bottom = el('div.battle-bottom', el('div.msg', this.msgPrev, this.msgCur), this.menu.root);
    this.root.replaceChildren(wrap, tools, bottom);
    this.surf = new Surface(wrap);
    this.surf.canvas.addEventListener('pointerdown', (e) => this.onCanvasDown(e));
    // a tap anywhere answers an open timing window
    this.root.addEventListener('pointerdown', (e) => {
      if (this.timing.active && this.timing.press(e.timeStamp || performance.now())) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    this.fx.shakeOn = this.app.settings.shake;
    this.applyToggles();
    this.timing.onGrade = (i, g, w) => this.onGrade(i, g, w.kind, w.targets);
    this.sync();
    this.stop = frameLoop((t) => {
      const bh = this.surf.h < 420 ? 104 : 116;
      if (bh !== this.bottomH) { this.bottomH = bh; }
      this.root.style.setProperty('--bh', this.bottomH + 'px');
      drawBattle(this, t);
    });
    music(this.state.encounter.boss ? 'boss' : 'battle');
    void this.loop();
  }

  unmount() {
    this.live = false;
    this.stop?.();
    this.timing.cancel();
    this.menu.cancel();
    this.surf?.destroy();
  }

  // ------------------------------------------------------------ helpers for view and menu

  vis(id: string): Vis {
    let v = this.visMap.get(id);
    if (!v) {
      const c = byId(this.state, id);
      v = { hp: c?.hp ?? 0, mp: c?.mp ?? 0, brk: c?.breakNow ?? 0, ox: 0, oy: 0, flash: 0, alpha: c?.ko ? (c.side === 'enemy' ? 0 : 0.5) : 1 };
      this.visMap.set(id, v);
    }
    return v;
  }

  /** Snap displayed values and lineups to the engine state. */
  sync() {
    const s = this.state;
    for (const c of [...s.heroes, ...s.bench, ...s.enemies]) {
      const v = this.vis(c.id);
      v.hp = c.hp; v.mp = c.mp; v.brk = c.breakNow;
      v.alpha = c.ko ? (c.side === 'enemy' ? 0 : 0.5) : 1;
    }
    this.heroSlots = s.heroes.map((c) => c.id);
    this.enemySlots = s.enemies.map((c) => c.id);
  }

  /** Narrate on the message line; `log` lines also go to the run log. */
  say(text: string, log = true) {
    if (log) { this.lines.push(text); this.app.log(text); if (this.lines.length > 20) this.lines.shift(); }
    const n = this.lines.length;
    this.msgPrev.textContent = (log ? this.lines[n - 2] : this.lines[n - 1]) ?? '';
    this.msgCur.textContent = text;
  }

  /** Switch an actor's sprite animation (idle / attack / hurt / cast); the view times it from now. */
  setAnim(id: string, anim: Anim) {
    const v = this.vis(id);
    v.anim = anim === 'idle' ? undefined : anim;
    v.animAt = performance.now();
  }

  rememberTarget(hero: string, target: string) { this.lastTargets.set(hero, target); }

  pickTarget(ids: string[], hero: string): Promise<string | null> {
    this.cancelTarget();
    const last = this.lastTargets.get(hero);
    const idx = Math.max(0, last ? ids.indexOf(last) : 0);
    return new Promise((res) => { this.targeting = { ids, idx, resolve: res }; });
  }

  cancelTarget() {
    const t = this.targeting;
    this.targeting = null;
    t?.resolve(null);
  }

  private confirmTarget(id?: string) {
    const t = this.targeting;
    if (!t) return;
    this.targeting = null;
    t.resolve(id ?? t.ids[t.idx]);
  }

  // ------------------------------------------------------------ input

  key(e: KeyboardEvent): boolean {
    if (this.timing.active) {
      if (isConfirm(e)) { if (!e.repeat) this.timing.press(e.timeStamp || performance.now()); return true; }
      return e.key !== 'Escape' && e.key !== '?';
    }
    const t = this.targeting;
    if (t) {
      const dir = keyDir(e);
      if (dir || e.key === 'Tab') {
        const back = dir === 'up' || dir === 'left' || (e.key === 'Tab' && e.shiftKey);
        t.idx = (t.idx + (back ? -1 : 1) + t.ids.length) % t.ids.length;
        play('menu');
        const c = byId(this.state, t.ids[t.idx]);
        if (c) this.say(this.describe(c), false);
        return true;
      }
      if (isConfirm(e)) { this.confirmTarget(); return true; }
      if (e.key === 'Escape') { this.cancelTarget(); return true; }
      return false;
    }
    if (e.key === 'Tab') return true;
    if (this.menu.visible) return this.menu.key(e);
    return isConfirm(e);
  }

  private onCanvasDown(e: PointerEvent) {
    if (this.timing.active) return;
    const { x, y } = this.surf.local(e);
    let hit: string | null = null;
    for (const [id, b] of this.boxes) {
      const pad = 12;
      if (x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad + 20) { hit = id; break; }
    }
    if (this.targeting) {
      if (hit && this.targeting.ids.includes(hit)) this.confirmTarget(hit);
      return;
    }
    const c = hit ? byId(this.state, hit) : null;
    if (c) this.say(this.describe(c), false);
  }

  private describe(c: Combatant): string {
    const sts = c.statuses.map((s) => STATUSES[s.id].name).join(', ');
    if (c.side === 'enemy') {
      const w = c.weak.length ? 'weak to ' + c.weak.join(', ') : 'no weakness';
      const r = c.resist.length ? '; resists ' + c.resist.join(', ') : '';
      return `${c.name}: ${c.hp}/${c.maxHp} HP, ${w}${r}${sts ? '. ' + sts : ''}`;
    }
    return `${c.name}: ${c.hp}/${c.maxHp} HP, ${c.mp}/${c.maxMp} MP${sts ? '. ' + sts : ''}`;
  }

  private toggleAuto() {
    this.app.auto = !this.app.auto;
    play('menu');
    this.applyToggles();
    if (this.app.auto && this.menu.visible) this.menu.cancel();
  }

  private toggleFast() {
    this.app.fast = !this.app.fast;
    play('menu');
    this.applyToggles();
  }

  private applyToggles() {
    this.fx.speed = this.app.fast ? 0.5 : 1;
    this.autoBtn.classList.toggle('on', this.app.auto);
    this.fastBtn.classList.toggle('on', this.app.fast);
  }

  // ------------------------------------------------------------ turn loop

  private async loop() {
    await this.playEvents(this.state.events.slice());
    while (this.live && !this.state.over) {
      const id = this.state.actor;
      const c = id ? byId(this.state, id) : null;
      if (!c) break;
      this.activeId = c.id;
      if (c.side === 'enemy') await this.enemyTurn(c);
      else await this.heroTurn(c);
      if (!this.live) return;
      this.sync();
      await this.fx.wait(180);
    }
    if (this.live) await this.finish();
  }

  private async heroTurn(c: Combatant) {
    let action: BattleAction | null = null;
    if (!this.app.auto) action = await this.menu.choose(c);
    if (!this.live) return;
    if (!action) {
      this.say(`${c.name}'s turn (auto).`, false);
      await this.fx.wait(350);
      action = chooseHeroAction(this.state, { timingSkill: 0.4, rng: this.botRng }).action;
    }
    const pv = this.preview(c, action);
    this.say(pv.label);
    let grades: Grade[] = [];
    if (pv.hits > 0 && pv.targets.length) {
      await this.windup(c, pv.targets);
      const sizes = windowSizes(this.app.settings, { luck: c.base.luck, wideRelic: hasPassive(this.state.partyPassives, 'timingWide'), shock: !!hasStatus(c, 'shock') });
      grades = await this.timing.run('attack', pv.targets, pv.hits, sizes);
    } else await this.hop(c);
    if (!this.live) return;
    const evs = step(this.state, action, { grades });
    const home = this.fx.tween(this.vis(c.id), 'ox', 0, 260);
    await this.playEvents(evs);
    await home;
    this.setAnim(c.id, 'idle');
  }

  private async enemyTurn(c: Combatant) {
    const plan = this.state.plan;
    const ab = plan ? ABILITIES[plan.ability] : undefined;
    const hits = ab?.hits?.length ?? 0;
    this.say(plan ? `${c.name}: ${plan.intent.name}!` : `${c.name} acts.`);
    let guard: Grade[] = [];
    const targets = (plan?.targets ?? []).filter((id) => { const t = byId(this.state, id); return t && !t.ko && t.side === 'hero'; });
    if (hits > 0 && targets.length) {
      await this.windup(c, targets);
      const canGuard = targets.filter((id) => !hasStatus(byId(this.state, id)!, 'shock'));
      if (!canGuard.length) {
        for (const id of targets) { const b = this.boxes.get(id); if (b) this.fx.float(b.cx, b.y - 8, 'Shocked!', '#ffe95c', 15); }
        await this.fx.wait(450);
      } else {
        const h = byId(this.state, canGuard[0])!;
        const sizes = windowSizes(this.app.settings, { luck: h.base.luck, wideRelic: hasPassive(this.state.partyPassives, 'timingWide') });
        guard = await this.timing.run('guard', canGuard, hits, sizes);
      }
    } else {
      await this.hop(c);
      await this.fx.wait(250);
    }
    if (!this.live) return;
    const evs = step(this.state, null, { guard });
    const home = this.fx.tween(this.vis(c.id), 'ox', 0, 260);
    await this.playEvents(evs);
    await home;
    this.setAnim(c.id, 'idle');
  }

  private preview(c: Combatant, a: BattleAction): { hits: number; targets: string[]; label: string } {
    const foes = alive(this.state.enemies).map((f) => f.id);
    const pick = (mode: string, t?: string) => mode === 'enemy' ? [t && foes.includes(t) ? t : foes[0]].filter(Boolean) as string[] : mode === 'enemies' || mode === 'enemyRandom' ? foes : [];
    switch (a.t) {
      case 'attack': return { hits: 1, targets: pick('enemy', a.target), label: `${c.name} attacks!` };
      case 'skill': { const ab = ABILITIES[a.id]; return { hits: ab?.hits?.length ?? 0, targets: pick(ab?.target ?? '', a.target), label: `${c.name} uses ${ab?.name ?? a.id}!` }; }
      case 'item': {
        const inst = this.state.bag.find((i) => i.id === a.item);
        const d = inst ? ITEMS[inst.def] : undefined;
        return { hits: d?.use?.hits?.length ?? 0, targets: pick(d?.use?.target ?? '', a.target), label: `${c.name} uses ${d?.name ?? 'an item'}!` };
      }
      case 'guard': return { hits: 0, targets: [], label: `${c.name} guards.` };
      case 'swap': return { hits: 0, targets: [], label: `${c.name} steps back.` };
      case 'flee': return { hits: 0, targets: [], label: `${c.name} looks for a way out...` };
    }
  }

  /** Step toward the target and coil (~500 ms). */
  private async windup(c: Combatant, targets: string[]) {
    const v = this.vis(c.id);
    const b = this.boxes.get(c.id), tb = this.boxes.get(targets[0]);
    const dir = c.side === 'hero' ? -1 : 1;
    let dist = 34;
    if (b && tb && targets.length === 1) dist = Math.max(20, Math.min(Math.abs(tb.cx - b.cx) * 0.3, c.side === 'hero' ? 110 : 70));
    await this.fx.tween(v, 'ox', dir * dist, 300, (t) => 1 - Math.pow(1 - t, 3));
    this.setAnim(c.id, 'attack');
    await this.fx.wait(200);
  }

  private async hop(c: Combatant) {
    const v = this.vis(c.id);
    this.setAnim(c.id, 'cast');
    await this.fx.tween(v, 'oy', -12, 140);
    await this.fx.tween(v, 'oy', 0, 140);
  }

  private onGrade(_i: number, g: Grade, kind: 'attack' | 'guard', targets: string[]) {
    for (const id of targets) {
      const b = this.boxes.get(id);
      if (!b) continue;
      const v = this.vis(id);
      if (g === 'perfect') {
        this.fx.freeze(60);
        this.fx.float(b.cx, b.y - 6, 'PERFECT!', '#ffe14d', 24, 1000);
        this.fx.burst(b.cx, b.cy, '#ffe14d', 14, true);
        this.fx.shake(6, 160);
      } else if (g === 'good') {
        this.fx.float(b.cx, b.y - 6, kind === 'guard' ? 'Guard' : 'Good', kind === 'guard' ? '#7df9ff' : '#ffffff', 18, 800);
        this.fx.burst(b.cx, b.cy, '#ffffff', 6, false);
      } else {
        this.fx.float(b.cx, b.y - 6, '...', '#c8d0e0', 18, 700);
      }
      if (kind === 'attack' || g !== 'miss') { v.flash = 1; void this.fx.tween(v, 'flash', 0, 220); }
      if (kind === 'attack') this.setAnim(id, 'hurt');
    }
    play(g === 'perfect' ? (kind === 'attack' ? 'perfect' : 'guard') : kind === 'guard' && g === 'good' ? 'guard' : 'hit');
  }

  // ------------------------------------------------------------ event playback

  private async playEvents(evs: BattleEvent[]) {
    for (const e of evs) {
      if (!this.live) return;
      await this.playEvent(e);
    }
    this.sync();
  }

  private nm(id: string) { return byId(this.state, id)?.name ?? '?'; }

  private async playEvent(e: BattleEvent) {
    const fx = this.fx;
    const box = (id: string) => this.boxes.get(id);
    switch (e.kind) {
      case 'turn': this.activeId = e.who; return;
      case 'use': return;
      case 'hit': {
        const b = box(e.target), v = this.vis(e.target);
        const tgt = byId(this.state, e.target);
        if (tgt?.side === 'hero') this.lastHeroHit = { by: this.nm(e.who), target: tgt.name, dmg: e.dmg, hpBefore: Math.round(v.hp) };
        v.hp = Math.max(0, v.hp - e.dmg);
        if (!b) return;
        const big = e.grade === 'perfect' && e.who.startsWith('h:');
        v.flash = 1; void fx.tween(v, 'flash', 0, 200);
        if (e.dmg > 0) this.setAnim(e.target, 'hurt');
        const kick = tgt?.side === 'hero' ? 10 : -10;
        void fx.tween(v, 'ox', v.ox + kick, 60).then(() => fx.tween(v, 'ox', 0, 160));
        const text = e.immune ? 'Immune' : String(e.dmg) + (e.crit ? '!' : '');
        const color = e.dmg === 0 ? '#c8d0e0' : tgt?.side === 'hero' ? '#ff6b6b' : e.crit ? '#ffe14d' : '#ffffff';
        fx.float(b.cx + (Math.random() * 16 - 8), b.cy - 4, text, color, big ? 32 : e.crit ? 26 : 21, 950);
        if (e.weak) fx.float(b.cx, b.y - 22, 'WEAK', TYPE_COLOR[e.type], 14, 900);
        else if (e.resist) fx.float(b.cx, b.y - 22, 'resist', '#c8d0e0', 13, 800);
        if (e.guarded && tgt?.side === 'hero') fx.float(b.cx + 26, b.y + 4, 'guarded', '#7df9ff', 12, 800);
        if (big) { fx.freeze(60); fx.burst(b.cx, b.cy, '#ffe14d', 16, true); play('perfect'); } else play('hit');
        if (e.dmg > 0) fx.shake(big ? 8 : e.crit ? 6 : 3, big ? 220 : 160);
        await fx.wait(big ? 300 : 210);
        return;
      }
      case 'counter': {
        const b = box(e.target), v = this.vis(e.target);
        v.hp = Math.max(0, v.hp - e.dmg);
        this.say(`${this.nm(e.who)} hits back!`, false);
        if (b) { fx.float(b.cx, b.cy, String(e.dmg), '#ffb35c', 19); v.flash = 1; void fx.tween(v, 'flash', 0, 200); }
        play('hit');
        await fx.wait(260);
        return;
      }
      case 'heal': {
        if (e.amount <= 0) return;
        const b = box(e.target), v = this.vis(e.target);
        v.hp += e.amount;
        if (b) fx.float(b.cx, b.cy - 6, '+' + e.amount, '#5ee05e', 20);
        play('heal');
        await fx.wait(220);
        return;
      }
      case 'mp': {
        const v = this.vis(e.target);
        v.mp += e.amount;
        const b = box(e.target);
        if (b && e.amount > 0 && e.target.startsWith('h:')) fx.float(b.cx + 20, b.cy + 6, '+' + e.amount + ' MP', '#7ab8ff', 13, 700);
        await fx.wait(90);
        return;
      }
      case 'status': {
        const b = box(e.target);
        const d = STATUSES[e.id];
        if (!e.on) return;
        if (b) fx.float(b.cx, b.y + 4, d.name, d.color, 15, 850);
        play(d.bad ? 'hit' : 'buff');
        await fx.wait(200);
        return;
      }
      case 'chip': {
        this.vis(e.target).brk = e.left;
        await fx.wait(70);
        return;
      }
      case 'break': {
        const b = box(e.target);
        this.vis(e.target).brk = 0;
        this.say(`${this.nm(e.target)} is BROKEN!`);
        if (b) { fx.float(b.cx, b.y - 10, 'BREAK!', '#ffd60a', 30, 1200); fx.burst(b.cx, b.cy, '#ffd60a', 18, true); }
        fx.freeze(90);
        fx.shake(10, 300);
        play('break');
        await fx.wait(480);
        return;
      }
      case 'recover': {
        const b = box(e.target);
        this.say(`${this.nm(e.target)} shakes it off.`);
        if (b) fx.float(b.cx, b.y, 'Recovered', '#ffffff', 14);
        await fx.wait(300);
        return;
      }
      case 'ko': {
        const c = byId(this.state, e.target);
        const v = this.vis(e.target);
        v.hp = 0;
        play('ko');
        this.say(c?.side === 'enemy' ? `${this.nm(e.target)} is defeated.` : `${this.nm(e.target)} is down!`);
        await fx.tween(v, 'alpha', c?.side === 'enemy' ? 0 : 0.5, 420, (t) => t);
        return;
      }
      case 'revive': {
        const c = byId(this.state, e.target);
        const v = this.vis(e.target);
        v.hp = c?.hp ?? 1;
        const b = box(e.target);
        if (b) fx.float(b.cx, b.cy, 'Back up!', '#5ee05e', 18);
        this.say(`${this.nm(e.target)} is back on their feet!`);
        play('heal');
        await fx.tween(v, 'alpha', 1, 300);
        return;
      }
      case 'guard': {
        const b = box(e.who);
        if (b) fx.float(b.cx, b.y, 'Guard', '#7df9ff', 16);
        play('guard');
        await fx.wait(260);
        return;
      }
      case 'swap': {
        const i = this.heroSlots.indexOf(e.out);
        if (i >= 0) this.heroSlots[i] = e.in;
        const v = this.vis(e.in);
        v.alpha = 0;
        this.say(`${this.nm(e.in)} swaps in for ${this.nm(e.out)}.`);
        await fx.tween(v, 'alpha', 1, 320);
        return;
      }
      case 'reinforce': {
        const slot = this.state.heroes.findIndex((c) => c.id === e.in);
        if (slot >= 0) this.heroSlots[slot] = e.in;
        const v = this.vis(e.in);
        v.alpha = 0;
        this.say(`${this.nm(e.in)} jumps in!`);
        await fx.tween(v, 'alpha', 1, 320);
        return;
      }
      case 'summon': {
        if (!this.enemySlots.includes(e.enemy)) this.enemySlots.push(e.enemy);
        const v = this.vis(e.enemy);
        v.alpha = 0;
        this.say(`${this.nm(e.who)} calls ${this.nm(e.enemy)}!`);
        await fx.tween(v, 'alpha', 1, 360);
        return;
      }
      case 'phase': {
        this.say(e.message);
        fx.showBanner(e.message, '#ff8fab', 1200);
        fx.shake(8, 400);
        await fx.wait(1000);
        return;
      }
      case 'tick': {
        const b = box(e.who), v = this.vis(e.who);
        const d = STATUSES[e.id];
        const c = byId(this.state, e.who);
        if (e.amount < 0 && c?.side === 'hero') this.lastHeroHit = { by: d.name, target: c.name, dmg: -e.amount, hpBefore: Math.round(v.hp) };
        v.hp = Math.max(0, v.hp + e.amount);
        if (b && e.amount !== 0) fx.float(b.cx, b.cy, (e.amount > 0 ? '+' : '') + e.amount, e.amount > 0 ? '#5ee05e' : d.color, 17);
        await fx.wait(240);
        return;
      }
      case 'flee': {
        this.say(e.ok ? 'Got away!' : 'Could not escape!');
        await fx.wait(450);
        return;
      }
      case 'cheatDeath': {
        const b = box(e.who);
        const c = byId(this.state, e.who);
        this.vis(e.who).hp = c?.hp ?? 1;
        if (b) fx.float(b.cx, b.y, 'Hangs on!', '#ffe14d', 18);
        this.say(`${this.nm(e.who)} refuses to fall!`);
        await fx.wait(450);
        return;
      }
      case 'msg': {
        this.say(e.text);
        await fx.wait(700);
        return;
      }
      case 'end': return;
    }
  }

  // ------------------------------------------------------------ end

  private async finish() {
    const run = this.app.run!;
    const r = this.state.over;
    this.activeId = null;
    if (r === 'win') {
      this.fx.showBanner('Victory!', '#ffe14d', 1100);
      play('confirm');
      this.say('Victory!');
      await this.fx.wait(1100);
      if (!this.live) return;
      finishBattle(run, this.state);
      this.app.persist();
      openReward(this.app);
    } else if (r === 'lose') {
      this.fx.showBanner('The party falls...', '#ff8fab', 1500);
      this.say('The party falls.');
      await this.fx.wait(1500);
      if (!this.live) return;
      this.app.lastBlow = this.lastHeroHit;
      finishBattle(run, this.state);
      this.app.persist();
      toEnd(this.app);
    } else if (r === 'flee') {
      await this.fx.wait(400);
      if (!this.live) return;
      finishBattle(run, this.state);
      this.app.log('Fled a fight.');
      this.app.persist();
      toMap(this.app);
    }
  }
}

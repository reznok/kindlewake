/** Map scene: the act graph on canvas, scrollable, with a DOM top bar. */
import type { DamageType, MapNode } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { COLUMNS, currentNode, describeNode, enterNode, nodeTypes, reachable } from '../engine/run';
import { memberStats } from '../engine/stats';
import type { App, Screen } from './app';
import { music, play } from './audio';
import { frameLoop, Surface } from './canvas';
import { bar, btn, el, fill } from './dom';
import { tip } from './flavour';
import { handlePending } from './flow';
import { keyDir, isConfirm } from './input';
import { cap, KIND_COLOR, KIND_GLYPH, TYPE_COLOR } from './palette';
import { openBag, openMenu, openRelics } from './sheets';
import { openParty } from './party';
import { drawActor, drawBackground, drawIcon, FONT_NUM, roundRect } from './sprites';

let shownAct = '';

interface Pos { x: number; y: number; r: number }

export class MapScreen implements Screen {
  name = 'map';
  root: HTMLElement;
  private surf!: Surface;
  private stop: (() => void) | null = null;
  private top = el('div.topbar');
  private info = el('div.map-info');
  private scroll = 0;
  private drag: { x: number; s: number; moved: boolean; id: number } | null = null;
  private sel: number | null = null;
  private hover: number | null = null;
  private pos = new Map<number, Pos>();
  private worldW = 0;
  private banner: { text: string; until: number } | null = null;
  private scrolled = false;
  /** Now and then the idle bottom line carries a tip instead of the controls hint. */
  private tip: string | null = null;

  constructor(private app: App) {
    this.root = el('div.screen.map-screen');
  }

  private get run() { return this.app.run!; }

  mount() {
    const wrap = el('div.map-canvas');
    this.root.replaceChildren(this.top, wrap, this.info);
    this.surf = new Surface(wrap);
    const c = this.surf.canvas;
    c.addEventListener('pointerdown', (e) => this.onDown(e));
    c.addEventListener('pointermove', (e) => this.onMove(e));
    c.addEventListener('pointerup', (e) => this.onUp(e));
    c.addEventListener('pointercancel', () => { this.drag = null; });
    c.addEventListener('pointerleave', () => { this.hover = null; this.updateInfo(); });
    c.addEventListener('wheel', (e) => { this.scroll += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY); this.clamp(); e.preventDefault(); }, { passive: false });
    // never on the very first map of a first Wake, where the controls hint matters most
    const veteran = this.app.ledger.runs.length > 0 || this.run.map.at !== null;
    this.tip = veteran && Math.random() < 0.45 ? tip() : null;
    const key = this.run.seed + ':' + this.run.act;
    if (shownAct !== key) { shownAct = key; this.banner = { text: 'Act ' + this.run.act, until: performance.now() + 1600 }; }
    this.stop = frameLoop((t) => this.draw(t));
    music('map');
    this.refresh();
  }

  unmount() { this.stop?.(); this.surf?.destroy(); }

  refresh() {
    if (!this.app.run) return;
    const run = this.run;
    const key = run.seed + ':' + run.act;
    if (shownAct !== key) { shownAct = key; this.banner = { text: 'Act ' + run.act, until: performance.now() + 1600 }; this.scrolled = false; }
    const sparks = run.party.reduce((a, m) => a + m.pendingSparks, 0);
    const hp = run.active.map((id) => run.party.find((m) => m.id === id)).filter(Boolean).map((m) => {
      const st = memberStats(m!, run);
      return el('div.hp-mini', { title: `${CHARACTERS[m!.def].name} ${m!.hp}/${st.hp}` }, el('span', CHARACTERS[m!.def].name), bar(m!.hp, st.hp, 'hp'));
    });
    fill(this.top,
      el('div.chip.act', 'Act ' + Math.min(3, run.act)),
      el('div.chip.gold', { title: 'Buttons (gold)' }, el('span.coin'), String(run.gold)),
      el('div.hp-sum', hp),
      el('div.spacer'),
      btn(['Party', sparks ? el('span.badge', String(sparks)) : null], () => { play('menu'); openParty(this.app); }, 'small'),
      btn('Bag', () => { play('menu'); openBag(this.app); }, 'small ghost'),
      btn('Keepsakes', () => { play('menu'); openRelics(this.app); }, 'small ghost', { title: 'Relics' }),
      btn('Menu', () => { play('menu'); openMenu(this.app); }, 'small ghost'),
    );
    if (this.sel !== null && !reachable(run).some((n) => n.id === this.sel)) this.sel = null;
    this.updateInfo();
  }

  back() { openMenu(this.app); }

  key(e: KeyboardEvent): boolean {
    const opts = reachable(this.run);
    const dir = keyDir(e);
    if (dir && opts.length) {
      const order = [...opts].sort((a, b) => a.row - b.row || a.col - b.col);
      const i = this.sel === null ? -1 : order.findIndex((n) => n.id === this.sel);
      const step = dir === 'down' || dir === 'right' ? 1 : -1;
      const next = order[(i + step + order.length) % order.length];
      if (i < 0) this.sel = order[0].id; else this.sel = next.id;
      this.focusNode(this.sel);
      play('menu');
      this.updateInfo();
      return true;
    }
    if (isConfirm(e)) {
      if (this.sel === null && opts.length) { this.sel = opts[0].id; this.focusNode(this.sel); this.updateInfo(); return true; }
      if (this.sel !== null) { this.go(this.sel); return true; }
    }
    if (e.key === 'p' || e.key === 'P') { openParty(this.app); return true; }
    return false;
  }

  // ------------------------------------------------------------ layout

  private layout() {
    const { w, h } = this.surf;
    const colW = Math.max(105, Math.min(170, w / 5.4));
    const pad = 86;
    this.worldW = pad * 2 + (COLUMNS - 1) * colW;
    const top = 30, bottom = h - 34;
    const counts = new Map<number, number>();
    for (const n of this.run.map.nodes) counts.set(n.col, (counts.get(n.col) ?? 0) + 1);
    const r = Math.max(16, Math.min(24, h / 16));
    this.pos.clear();
    for (const n of this.run.map.nodes) {
      const k = counts.get(n.col)!;
      const off = this.worldW < w ? (w - this.worldW) / 2 : 0;
      this.pos.set(n.id, { x: off + pad + n.col * colW, y: top + ((n.row + 0.5) * (bottom - top)) / k, r: n.kind === 'boss' ? r * 1.45 : r });
    }
  }

  private clamp() { this.scroll = Math.max(0, Math.min(Math.max(0, this.worldW - this.surf.w), this.scroll)); }

  private focusNode(id: number) {
    const p = this.pos.get(id);
    if (!p) return;
    const sx = p.x - this.scroll;
    if (sx < 80 || sx > this.surf.w - 80) { this.scroll = p.x - this.surf.w / 2; this.clamp(); }
  }

  // ------------------------------------------------------------ input

  private hit(e: PointerEvent): MapNode | null {
    const { x, y } = this.surf.local(e);
    for (const n of this.run.map.nodes) {
      const p = this.pos.get(n.id);
      if (p && Math.hypot(p.x - this.scroll - x, p.y - y) <= p.r + 10) return n;
    }
    return null;
  }

  private onDown(e: PointerEvent) {
    this.drag = { x: e.clientX, s: this.scroll, moved: false, id: e.pointerId };
    this.surf.canvas.setPointerCapture(e.pointerId);
  }

  private onMove(e: PointerEvent) {
    if (this.drag && this.drag.id === e.pointerId) {
      const dx = e.clientX - this.drag.x;
      if (Math.abs(dx) > 8) this.drag.moved = true;
      if (this.drag.moved) { this.scroll = this.drag.s - dx; this.clamp(); }
      return;
    }
    const n = this.hit(e);
    const id = n?.id ?? null;
    if (id !== this.hover) { this.hover = id; this.updateInfo(); }
    this.surf.canvas.style.cursor = n && reachable(this.run).includes(n) ? 'pointer' : 'grab';
  }

  private onUp(e: PointerEvent) {
    const d = this.drag;
    this.drag = null;
    if (!d || d.moved) return;
    const n = this.hit(e);
    if (!n) return;
    if (reachable(this.run).includes(n)) {
      if (e.pointerType === 'mouse' || this.sel === n.id) this.go(n.id);
      else { this.sel = n.id; this.updateInfo(); play('menu'); }
    } else { this.hover = n.id; this.updateInfo(); }
  }

  private go(id: number) {
    const run = this.run;
    if (!reachable(run).some((n) => n.id === id)) return;
    play('confirm');
    const n = enterNode(run, id);
    this.app.log('Entered ' + describeNode(n).toLowerCase() + ' (act ' + run.act + ').');
    this.sel = null;
    this.app.persist();
    this.refresh();
    handlePending(this.app);
  }

  private updateInfo() {
    const id = this.sel ?? this.hover;
    const n = id !== null ? this.run.map.nodes[id] : null;
    if (!n) {
      const touch = matchMedia('(pointer: coarse)').matches;
      if (this.tip) { fill(this.info, el('span.muted', el('b', 'Tip: '), this.tip)); return; }
      fill(this.info, el('span.muted', touch ? 'Tap a glowing stop to see it, tap again to go. Drag to scroll.' : 'Click a glowing stop to go. Arrows pick, Enter goes. Drag or wheel to scroll.'));
      return;
    }
    const types = nodeTypes(n) as DamageType[];
    const can = reachable(this.run).includes(n);
    fill(this.info,
      el('b', { style: { color: KIND_COLOR[n.kind] === '#ffd43b' ? '#b8860b' : KIND_COLOR[n.kind] } }, describeNode(n)),
      n.level ? el('span.muted', ' Lv ' + n.level) : null,
      types.length ? [el('span', ' • weak to '), types.map((t) => el('span.type-tag', { style: { background: TYPE_COLOR[t] } }, cap(t)))] : null,
      n.done ? el('span.muted', ' • done') : null,
      can ? el('span.go-hint', this.sel === n.id ? ' • tap again / Enter to go' : ' • reachable') : null,
    );
  }

  // ------------------------------------------------------------ draw

  private draw(t: number) {
    if (!this.app.run) return;
    const { ctx, w, h } = this.surf;
    this.layout();
    if (!this.scrolled && w > 1) {
      this.scrolled = true;
      const cur = currentNode(this.run);
      const p = cur ? this.pos.get(cur.id) : null;
      this.scroll = p ? p.x - w * 0.35 : 0;
      this.clamp();
    }
    this.clamp();
    drawBackground(ctx, 'map', w, h, this.scroll);
    const run = this.run;
    const reach = new Set(reachable(run).map((n) => n.id));
    const at = run.map.at;
    ctx.save();
    ctx.translate(-this.scroll, 0);
    // edges
    for (const n of run.map.nodes) {
      const a = this.pos.get(n.id)!;
      for (const nid of n.next) {
        const b = this.pos.get(nid)!;
        const m = run.map.nodes[nid];
        const walked = n.done && m.done;
        const live = n.id === at && reach.has(nid);
        ctx.lineWidth = live ? 5 : walked ? 5 : 3;
        ctx.strokeStyle = live ? '#ffe14d' : walked ? '#2b3a67' : 'rgba(255,255,255,0.75)';
        ctx.setLineDash(live || walked ? [] : [8, 7]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2;
        ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    // nodes
    for (const n of run.map.nodes) {
      const p = this.pos.get(n.id)!;
      const isReach = reach.has(n.id);
      const pulse = isReach ? 1 + Math.sin(t / 220) * 0.08 : 1;
      const r = p.r * pulse;
      if (isReach) {
        ctx.fillStyle = 'rgba(255,240,120,0.45)';
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 9 + Math.sin(t / 220) * 3, 0, Math.PI * 2); ctx.fill();
      }
      if (this.sel === n.id || this.hover === n.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = n.done && n.id !== at ? 0.55 : !isReach && !n.done && at !== null && n.col <= (run.map.nodes[at]?.col ?? 0) ? 0.45 : 1;
      ctx.fillStyle = KIND_COLOR[n.kind];
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1d2b53';
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(p.x, p.y, r - 3, 0, Math.PI * 2); ctx.stroke();
      // node glyph: the 12 px pixel icon at an integer scale, else the letter
      const isz = Math.max(12, Math.floor((r * 1.25) / 12) * 12);
      if (!drawIcon(ctx, 'node_' + n.kind, Math.round(p.x - isz / 2), Math.round(p.y - isz / 2), isz)) {
        ctx.fillStyle = n.kind === 'shop' || n.kind === 'camp' ? '#1d2b53' : '#fff';
        ctx.font = `900 ${Math.round(r * (KIND_GLYPH[n.kind].length > 1 ? 0.8 : 1.05))}px ui-rounded, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(KIND_GLYPH[n.kind], p.x, p.y + 1);
      }
      if (n.done && n.id !== at) {
        ctx.strokeStyle = '#1d2b53'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(p.x - r * 0.5, p.y); ctx.lineTo(p.x - r * 0.1, p.y + r * 0.4); ctx.lineTo(p.x + r * 0.55, p.y - r * 0.45); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // weakness dots
      const types = nodeTypes(n) as DamageType[];
      if (types.length) {
        const d = 9, total = types.length * d + (types.length - 1) * 3;
        let x = p.x - total / 2 + d / 2;
        ctx.fillStyle = 'rgba(29,43,83,0.55)';
        roundRect(ctx, p.x - total / 2 - 4, p.y + p.r + 4, total + 8, d + 6, 7);
        ctx.fill();
        for (const ty of types) {
          ctx.fillStyle = TYPE_COLOR[ty];
          ctx.beginPath(); ctx.arc(x, p.y + p.r + 7 + d / 2, d / 2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
          x += d + 3;
        }
      }
    }
    // party token
    const cur = at !== null ? this.pos.get(at) : null;
    const lead = run.party.find((m) => m.id === run.active[0]);
    if (lead) {
      const s = 30;
      const tx = cur ? cur.x - s / 2 : this.pos.get(run.map.nodes.find((n) => n.col === 0)!.id)!.x - 68;
      const ty = cur ? cur.y - cur.r - s - 4 : this.surf.h / 2 - s / 2;
      drawActor(ctx, CHARACTERS[lead.def].sprite, tx - s * 0.35, ty - s * 0.4, s * 1.7, s * 1.4, { label: CHARACTERS[lead.def].name, time: t, facing: 1 });
    }
    ctx.restore();
    // edge fades hint that the map scrolls
    if (this.scroll > 2) this.fade(ctx, 0, h, true);
    if (this.scroll < this.worldW - w - 2) this.fade(ctx, w, h, false);
    if (this.banner && performance.now() < this.banner.until) {
      const k = Math.min(1, (this.banner.until - performance.now()) / 400);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.fillStyle = 'rgba(29,43,83,0.75)';
      ctx.fillRect(0, h / 2 - 34, w, 68);
      ctx.fillStyle = '#ffe14d';
      ctx.font = `28px ${FONT_NUM}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.banner.text, w / 2, h / 2 + 2);
      ctx.restore();
    }
  }

  private fade(ctx: CanvasRenderingContext2D, x: number, h: number, left: boolean) {
    const g = ctx.createLinearGradient(x, 0, left ? x + 30 : x - 30, 0);
    g.addColorStop(0, 'rgba(29,43,83,0.35)');
    g.addColorStop(1, 'rgba(29,43,83,0)');
    ctx.fillStyle = g;
    ctx.fillRect(left ? x : x - 30, 0, 30, h);
  }
}

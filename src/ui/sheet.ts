/** DOM overlay sheet: backdrop, title bar, scrolling body, footer. */
import type { App, Layer } from './app';
import { play } from './audio';
import { type Child, el, fill } from './dom';

export interface SheetOpts {
  title: string;
  closable?: boolean;
  /** Extra class on the panel (e.g. 'wide', 'small'). */
  cls?: string;
  onClose?: () => void;
}

export class Sheet implements Layer {
  root: HTMLElement;
  panel: HTMLElement;
  titleEl: HTMLElement;
  body: HTMLElement;
  foot: HTMLElement;
  closable: boolean;
  key?: (e: KeyboardEvent) => boolean;
  private closed = false;

  constructor(public app: App, public opts: SheetOpts) {
    this.closable = opts.closable ?? true;
    this.titleEl = el('h2.sheet-title', opts.title);
    this.body = el('div.sheet-body');
    this.foot = el('div.sheet-foot');
    const x = this.closable ? el('button.sheet-x', { type: 'button', title: 'Close (Esc)', onclick: () => { play('menu'); this.close(); } }, '×') : null;
    this.panel = el('div.sheet' + (opts.cls ? '.' + opts.cls : ''), el('div.sheet-head', this.titleEl, x), this.body, this.foot);
    this.root = el('div.sheet-backdrop', this.panel);
    this.root.addEventListener('pointerdown', (e) => { if (e.target === this.root && this.closable) { this.close(); } });
  }

  open(): this { this.app.pushLayer(this); return this; }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.app.popLayer(this);
    this.opts.onClose?.();
  }

  setTitle(t: string) { this.titleEl.textContent = t; }

  /** Replace body and footer content. */
  fill(body: Child[], foot: Child[] = []) {
    const y = this.body.scrollTop;
    fill(this.body, ...body);
    fill(this.foot, ...foot);
    this.foot.style.display = foot.length ? '' : 'none';
    this.body.scrollTop = y;
  }

  get isOpen() { return !this.closed; }
}

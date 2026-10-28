/** Tiny DOM helpers: `el('button.btn.big', { onclick }, 'Label')`. */

export type Child = Node | string | number | null | undefined | false | Child[];

export interface Props {
  text?: string;
  html?: string;
  title?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
  placeholder?: string;
  style?: Partial<CSSStyleDeclaration> | string;
  attrs?: Record<string, string>;
  data?: Record<string, string>;
  onclick?: (e: MouseEvent) => void;
  oninput?: (e: Event) => void;
  onfocus?: (e: FocusEvent) => void;
  onpointerenter?: (e: PointerEvent) => void;
}

function isProps(x: unknown): x is Props {
  return !!x && typeof x === 'object' && !(x instanceof Node) && !Array.isArray(x);
}

export function el<T extends HTMLElement = HTMLElement>(spec: string, props?: Props | Child, ...children: Child[]): T {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div') as T;
  if (classes.length) node.className = classes.join(' ');
  let kids = children;
  if (isProps(props)) {
    const p = props;
    if (p.text !== undefined) node.textContent = p.text;
    if (p.html !== undefined) node.innerHTML = p.html;
    if (p.title) node.title = p.title;
    if (p.disabled) (node as unknown as HTMLButtonElement).disabled = true;
    if (p.type) node.setAttribute('type', p.type);
    if (p.value !== undefined) (node as unknown as HTMLInputElement).value = p.value;
    if (p.placeholder) node.setAttribute('placeholder', p.placeholder);
    if (typeof p.style === 'string') node.setAttribute('style', p.style);
    else if (p.style) Object.assign(node.style, p.style);
    if (p.attrs) for (const [k, v] of Object.entries(p.attrs)) node.setAttribute(k, v);
    if (p.data) for (const [k, v] of Object.entries(p.data)) node.dataset[k] = v;
    if (p.onclick) node.addEventListener('click', p.onclick as EventListener);
    if (p.oninput) node.addEventListener('input', p.oninput);
    if (p.onfocus) node.addEventListener('focus', p.onfocus as EventListener);
    if (p.onpointerenter) node.addEventListener('pointerenter', p.onpointerenter as EventListener);
  } else if (props !== undefined) kids = [props as Child, ...children];
  append(node, kids);
  return node;
}

export function append(node: HTMLElement, kids: Child[]) {
  for (const k of kids) {
    if (k === null || k === undefined || k === false) continue;
    if (Array.isArray(k)) append(node, k);
    else node.append(k instanceof Node ? k : String(k));
  }
}

/** Replace all children. */
export function fill(node: HTMLElement, ...kids: Child[]) {
  node.replaceChildren();
  append(node, kids);
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** A standard chunky button. */
export function btn(label: Child, onclick: () => void, cls = '', props: Props = {}): HTMLButtonElement {
  return el<HTMLButtonElement>('button.btn' + (cls ? '.' + cls.split(' ').join('.') : ''), { type: 'button', ...props, onclick: () => onclick() }, label);
}

/** A small horizontal bar (HP/MP/XP). */
export function bar(value: number, max: number, cls = 'hp', label?: string): HTMLElement {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return el('div.bar.' + cls, el('div.fill', { style: { width: pct + '%' } }), label !== undefined ? el('span.bar-label', label) : null);
}

export function isTouch(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
}

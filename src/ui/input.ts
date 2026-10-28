/** Keyboard helpers: spatial focus navigation for DOM menus. */

export type Dir = 'up' | 'down' | 'left' | 'right';

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

export function keyDir(e: KeyboardEvent): Dir | null {
  if (isTyping(e) && e.key.length === 1) return null;
  return KEY_DIR[e.key] ?? null;
}

export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
}

export function isConfirm(e: KeyboardEvent): boolean { return e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'; }

function visible(n: HTMLElement): boolean { return n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden'; }

export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, [data-nav]')].filter(visible);
}

export function focusFirst(root: HTMLElement) {
  const list = focusables(root);
  const pick = list.find((n) => n.dataset.default !== undefined) ?? list[0];
  pick?.focus({ preventScroll: false });
}

/** Move focus within `root` in the arrow direction. Returns true if the key was used. */
export function navKey(root: HTMLElement, e: KeyboardEvent): boolean {
  const list = focusables(root);
  if (!list.length) return false;
  const cur = document.activeElement as HTMLElement | null;
  const inside = !!cur && list.includes(cur);
  if (isConfirm(e)) {
    if (inside) return false; // native button activation
    focusFirst(root);
    return true;
  }
  const dir = keyDir(e);
  if (!dir) return false;
  if (inside && isTyping(e) && (dir === 'left' || dir === 'right')) return false;
  if (!inside) { focusFirst(root); return true; }
  const a = cur!.getBoundingClientRect();
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  let best: HTMLElement | null = null, bestScore = Infinity;
  for (const n of list) {
    if (n === cur) continue;
    const b = n.getBoundingClientRect();
    const bx = b.left + b.width / 2, by = b.top + b.height / 2;
    const dx = bx - ax, dy = by - ay;
    let main = 0, side = 0;
    if (dir === 'right') { main = dx; side = Math.abs(dy); }
    if (dir === 'left') { main = -dx; side = Math.abs(dy); }
    if (dir === 'down') { main = dy; side = Math.abs(dx); }
    if (dir === 'up') { main = -dy; side = Math.abs(dx); }
    if (main <= 2) continue;
    const score = main + side * 2.5;
    if (score < bestScore) { bestScore = score; best = n; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  return true;
}

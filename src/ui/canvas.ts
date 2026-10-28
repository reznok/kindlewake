/** A hi-DPI canvas that tracks its CSS box, plus a frame loop helper. */
export class Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  private ro: ResizeObserver;

  constructor(parent: HTMLElement, cls = 'surface') {
    this.canvas = document.createElement('canvas');
    this.canvas.className = cls;
    parent.append(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    this.w = r.width;
    this.h = r.height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Pointer position in CSS px relative to the canvas. */
  local(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  destroy() { this.ro.disconnect(); this.canvas.remove(); }
}

/** Run `fn` every animation frame until the returned stop function is called. */
export function frameLoop(fn: (t: number) => void): () => void {
  let on = true;
  const tick = (t: number) => { if (!on) return; fn(t); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return () => { on = false; };
}

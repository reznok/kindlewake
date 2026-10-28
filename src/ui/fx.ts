/**
 * Battle effects: timer-driven tweens (they resolve even if frames are throttled), floating text, particles, screen
 * shake, hit-stop and banners. Everything is sampled at draw time.
 */
import { FONT_NUM, FONT_UI } from './sprites';

export type Ease = (t: number) => number;
export const ease = {
  linear: (t: number) => t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  back: (t: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

interface Tween { obj: Record<string, number>; key: string; from: number; to: number; t0: number; dur: number; ease: Ease }
interface Floater { x: number; y: number; text: string; color: string; size: number; t0: number; dur: number; rise: number }
interface Particle { x: number; y: number; vx: number; vy: number; t0: number; dur: number; color: string; size: number; star: boolean }

export class Fx {
  /** Animation speed multiplier for waits and tweens (0.5 when Fast). */
  speed = 1;
  shakeOn = true;
  private tweens: Tween[] = [];
  private floaters: Floater[] = [];
  private particles: Particle[] = [];
  private shakeMag = 0;
  private shakeT0 = 0;
  private shakeDur = 0;
  private frozenUntil = 0;
  private frozenAt = 0;
  private lost = 0;
  banner: { text: string; color: string; t0: number; dur: number } | null = null;

  /** Scene clock in ms; stands still during hit-stop. */
  now(): number {
    const r = performance.now();
    if (r < this.frozenUntil) return this.frozenAt - this.lost;
    if (this.frozenAt) { this.lost += this.frozenUntil - this.frozenAt; this.frozenAt = 0; }
    return r - this.lost;
  }

  freeze(ms: number) {
    const r = performance.now();
    if (r >= this.frozenUntil) { this.now(); this.frozenAt = r; }
    this.frozenUntil = Math.max(this.frozenUntil, r + ms);
  }

  wait(ms: number): Promise<void> { return new Promise((res) => setTimeout(res, Math.max(0, ms * this.speed))); }

  /** Tween obj[key] to `to` over `ms` (scaled by speed). Resolves on a timer. */
  tween<T extends object>(obj: T, key: keyof T & string, to: number, ms: number, e: Ease = ease.out): Promise<void> {
    const o = obj as unknown as Record<string, number>;
    const dur = Math.max(1, ms * this.speed);
    this.tweens = this.tweens.filter((t) => !(t.obj === o && t.key === key));
    const tw: Tween = { obj: o, key, from: o[key], to, t0: this.now(), dur, ease: e };
    this.tweens.push(tw);
    return new Promise((res) => setTimeout(() => {
      if (this.tweens.includes(tw)) { o[key] = to; this.tweens.splice(this.tweens.indexOf(tw), 1); }
      res();
    }, dur + 5));
  }

  float(x: number, y: number, text: string, color = '#fff', size = 18, dur = 900) {
    this.floaters.push({ x, y, text, color, size, t0: this.now(), dur: dur * Math.max(0.7, this.speed), rise: 34 });
  }

  burst(x: number, y: number, color = '#ffe14d', n = 12, star = true) {
    const t0 = this.now();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, sp = 90 + Math.random() * 120;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t0, dur: 450 + Math.random() * 250, color, size: star ? 7 + Math.random() * 4 : 3 + Math.random() * 3, star });
    }
  }

  shake(mag: number, ms: number) {
    if (!this.shakeOn) return;
    this.shakeMag = mag; this.shakeT0 = this.now(); this.shakeDur = ms;
  }

  showBanner(text: string, color = '#ffe14d', dur = 1100) { this.banner = { text, color, t0: this.now(), dur }; }

  /** Apply tweens; call once per frame before drawing. */
  update() {
    const t = this.now();
    for (const tw of this.tweens) {
      const k = Math.min(1, (t - tw.t0) / tw.dur);
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * tw.ease(k);
    }
  }

  shakeOffset(): [number, number] {
    const t = this.now() - this.shakeT0;
    if (t > this.shakeDur || !this.shakeMag) return [0, 0];
    const k = this.shakeMag * (1 - t / this.shakeDur);
    return [Math.sin(t * 0.09) * k, Math.cos(t * 0.13) * k * 0.6];
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const t = this.now();
    this.particles = this.particles.filter((p) => t - p.t0 < p.dur);
    for (const p of this.particles) {
      const s = (t - p.t0) / 1000, k = 1 - (t - p.t0) / p.dur;
      const x = p.x + p.vx * s, y = p.y + p.vy * s + 220 * s * s;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = p.color;
      if (p.star) star(ctx, x, y, p.size * (0.6 + k * 0.4), t / 120);
      else { ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    this.floaters = this.floaters.filter((f) => t - f.t0 < f.dur);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of this.floaters) {
      const k = (t - f.t0) / f.dur;
      const pop = k < 0.15 ? 0.6 + (k / 0.15) * 0.55 : k < 0.3 ? 1.15 - ((k - 0.15) / 0.15) * 0.15 : 1;
      ctx.globalAlpha = k > 0.7 ? Math.max(0, 1 - (k - 0.7) / 0.3) : 1;
      // numbers in the 8-bit face (it runs wide, so a touch smaller), words in the body face
      const num = /^[+-]?\d/.test(f.text);
      ctx.font = num ? `${Math.round(f.size * pop * 0.72)}px ${FONT_NUM}` : `700 ${Math.round(f.size * pop)}px ${FONT_UI}`;
      const y = f.y - f.rise * ease.out(Math.min(1, k * 1.6));
      ctx.lineWidth = Math.max(3, f.size / 5);
      ctx.strokeStyle = '#1d2b53';
      ctx.strokeText(f.text, f.x, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, y);
    }
    ctx.globalAlpha = 1;
    const b = this.banner;
    if (b) {
      const k = (t - b.t0) / b.dur;
      if (k >= 1) this.banner = null;
      else {
        ctx.globalAlpha = k < 0.1 ? k / 0.1 : k > 0.8 ? (1 - k) / 0.2 : 1;
        ctx.fillStyle = 'rgba(29,43,83,0.72)';
        ctx.fillRect(0, h / 2 - 36, w, 72);
        ctx.font = `${Math.round(Math.min(32, w / 20))}px ${FONT_NUM}`;
        ctx.lineWidth = 6; ctx.strokeStyle = '#1d2b53';
        ctx.strokeText(b.text, w / 2, h / 2 + 2);
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, w / 2, h / 2 + 2);
        ctx.globalAlpha = 1;
      }
    }
  }
}

export function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

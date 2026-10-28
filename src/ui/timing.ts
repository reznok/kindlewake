/**
 * Timing windows. One window per hit: a ring shrinks onto the target and closes at the impact instant. A press within
 * `perfect` ms of it scores perfect, within `good` ms good; a press while the ring is up but outside the window, or no
 * press at all, is a miss. Grades go to the engine afterwards.
 */
import type { Grade, Settings } from '../core/types';

export const PERFECT_MS = 80;
export const GOOD_MS = 220;
export const LEAD_MS = 500;
export const GAP_MS = 450;

export interface WindowSizes { perfect: number; good: number; auto: boolean }

export function windowSizes(settings: Settings, o: { luck?: number; wideRelic?: boolean; shock?: boolean } = {}): WindowSizes {
  let k = settings.timing === 'wide' ? 2 : 1;
  k *= 1 + Math.min(0.3, (o.luck ?? 0) / 100);
  if (o.wideRelic) k *= 1.3;
  if (o.shock) k *= 0.7;
  return { perfect: PERFECT_MS * k, good: GOOD_MS * k, auto: settings.timing === 'auto' };
}

export interface ActiveWindow {
  kind: 'attack' | 'guard';
  targets: string[];
  impacts: number[];
  ringStart: number[];
  grades: (Grade | null)[];
  sizes: WindowSizes;
}

export class TimingRunner {
  active: ActiveWindow | null = null;
  private done: (() => void) | null = null;
  private timers: number[] = [];
  /** Called as each hit resolves. */
  onGrade: (i: number, g: Grade, w: ActiveWindow) => void = () => {};
  /** The grade an untapped ring gets (miss; the battle makes it good under Auto). Asked when the ring expires. */
  fallback: () => Grade = () => 'miss';

  /** Run `hits` windows on `targets`; resolves with one grade per hit. */
  run(kind: 'attack' | 'guard', targets: string[], hits: number, sizes: WindowSizes): Promise<Grade[]> {
    this.cancel();
    const start = performance.now();
    const gap = Math.max(GAP_MS, sizes.good + 160);
    const impacts = Array.from({ length: hits }, (_, i) => start + LEAD_MS + i * gap);
    const ringStart = impacts.map((t, i) => (i === 0 ? start : t - Math.min(LEAD_MS, gap - 60)));
    const w: ActiveWindow = { kind, targets, impacts, ringStart, grades: impacts.map(() => null), sizes };
    this.active = w;
    return new Promise((res) => {
      this.done = () => {
        this.timers.forEach(clearTimeout);
        this.timers = [];
        const out = w.grades.map((g) => g ?? 'miss');
        this.timers.push(window.setTimeout(() => { if (this.active === w) this.active = null; res(out); }, 160));
      };
      impacts.forEach((t, i) => {
        if (sizes.auto) this.timers.push(window.setTimeout(() => this.resolve(i, 'good'), t - start));
        else this.timers.push(window.setTimeout(() => this.resolve(i, this.fallback()), t - start + sizes.good + 1));
      });
    });
  }

  /** A tap / Space / Enter. Returns true if it was used by an open window. */
  press(t = performance.now()): boolean {
    const w = this.active;
    if (!w || w.sizes.auto) return false;
    const open = w.impacts.map((imp, i) => ({ i, imp })).filter(({ i }) => w.grades[i] === null && t >= w.ringStart[i]);
    if (!open.length) return w.grades.some((g) => g === null);
    const inWin = open.filter(({ imp }) => Math.abs(t - imp) <= w.sizes.good).sort((a, b) => Math.abs(t - a.imp) - Math.abs(t - b.imp));
    if (inWin.length) {
      const { i, imp } = inWin[0];
      this.resolve(i, Math.abs(t - imp) <= w.sizes.perfect ? 'perfect' : 'good');
    } else {
      // too early: the earliest open ring is spent
      this.resolve(open[0].i, 'miss');
    }
    return true;
  }

  private resolve(i: number, g: Grade) {
    const w = this.active;
    if (!w || w.grades[i] !== null) return;
    w.grades[i] = g;
    this.onGrade(i, g, w);
    if (w.grades.every((x) => x !== null)) this.done?.();
  }

  cancel() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.active = null;
    this.done = null;
  }
}

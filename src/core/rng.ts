/** Seeded sfc32 RNG. State is four 32-bit words so a run can be saved and resumed exactly. */
export type RngState = [number, number, number, number];

export class Rng {
  s: RngState;

  constructor(seed: number | RngState) {
    if (typeof seed === 'number') {
      // splitmix-style seeding so nearby seeds diverge
      let h = seed >>> 0;
      const next = () => { h = (h + 0x9e3779b9) >>> 0; let z = h; z = Math.imul(z ^ (z >>> 16), 0x85ebca6b); z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35); return (z ^ (z >>> 16)) >>> 0; };
      this.s = [next(), next(), next(), next()];
      for (let i = 0; i < 12; i++) this.next();
    } else this.s = [...seed] as RngState;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    const s = this.s;
    const t = (((s[0] + s[1]) >>> 0) + s[3]) >>> 0;
    s[3] = (s[3] + 1) >>> 0;
    s[0] = s[1] ^ (s[1] >>> 9);
    s[1] = (s[2] + (s[2] << 3)) >>> 0;
    s[2] = ((s[2] << 21) | (s[2] >>> 11)) >>> 0;
    s[2] = (s[2] + t) >>> 0;
    return t / 4294967296;
  }

  /** Integer in [lo, hi] inclusive. */
  int(lo: number, hi: number): number { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  float(lo: number, hi: number): number { return lo + this.next() * (hi - lo); }
  chance(p: number): boolean { return this.next() < p; }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  /** Weighted pick; weights need not sum to 1. */
  weighted<T>(arr: readonly T[], weight: (t: T) => number): T {
    let total = 0;
    for (const a of arr) total += Math.max(0, weight(a));
    let r = this.next() * total;
    for (const a of arr) { r -= Math.max(0, weight(a)); if (r < 0) return a; }
    return arr[arr.length - 1];
  }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  /** A child generator for a sub-system (battle, map) so UI-driven calls do not shift the run's stream. */
  child(): Rng { return new Rng([this.int(0, 0xffffffff), this.int(0, 0xffffffff), this.int(0, 0xffffffff), this.int(0, 0xffffffff)]); }
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

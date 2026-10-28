/** Picks flavour text from the content tables for the screens: taglines, tips, scenes, shop lines, barks, quips. */
import type { Ledger, Run } from '../core/types';
import { CAMP_SCENES, CHARACTERS, deathQuip, ELITE_BARKS, SHOP, TAGLINES, TIPS, type CampScene, type SceneLine } from '../data';

/** UI-side randomness only (never the run's RNG, so flavour never shifts a seed). */
export function pick<T>(list: readonly T[]): T { return list[Math.floor(Math.random() * list.length)]; }

/** A title tagline: the always-on set plus any gated set the Ledger has unlocked by sight. */
export function tagline(ledger: Ledger): string {
  const pool = [...TAGLINES.always, ...TAGLINES.gated.filter((g) => (ledger.seen[g.seen] ?? 0) > 0).flatMap((g) => g.lines)];
  return pick(pool);
}

export function tip(): string { return pick(TIPS); }

/** Character ids in the party (Front or Wagon). */
export function members(run: Run): Set<string> { return new Set(run.party.map((m) => m.def)); }

/** Short name for a character id, for speaker tags: the quoted nickname if the name has one, else the first name. */
export function speaker(id: string): string {
  const name = CHARACTERS[id]?.name ?? id;
  return /"([^"]+)"/.exec(name)?.[1] ?? name.split(' ')[0];
}

/** The scene for this camp, once per run, the first time a camp is chosen in its column range (opening act only). */
export function campScene(run: Run): { scene: CampScene; lines: SceneLine[] } | null {
  if (run.act !== 1 || run.map.at === null) return null;
  const col = run.map.nodes[run.map.at]?.col ?? -1;
  const scene = CAMP_SCENES.find((s) => col >= s.cols[0] && col <= s.cols[1] && !run.flags['scene:' + s.id]);
  if (!scene) return null;
  const here = members(run);
  const lines = scene.lines.filter((l) => (l.who === null || here.has(l.who)) && (l.requires ?? []).every((r) => here.has(r)));
  if (!lines.length) return null;
  run.flags['scene:' + scene.id] = true;
  return { scene, lines };
}

export type ShopMoment = keyof typeof SHOP.lines;

export function shopLine(moment: ShopMoment): string { return pick(SHOP.lines[moment]); }

/** The keeper's greeting on arrival: first visit of the run vs a return, plus any flag- or member-keyed extras. */
export function shopGreeting(run: Run): string[] {
  const first = !run.flags[SHOP.visitedFlag];
  run.flags[SHOP.visitedFlag] = true;
  const out = [shopLine(first ? 'first' : 'again')];
  for (const [flag, line] of Object.entries(SHOP.byFlag)) if (run.flags[flag]) out.push(line);
  const here = members(run);
  for (const [who, line] of Object.entries(SHOP.byMember)) if (here.has(who)) out.push(line);
  return out;
}

export function eliteBarks(def: string) { return ELITE_BARKS[def]; }

/** End-screen quip: the killer's own line when there is one, else a general one. */
export function endQuip(killedBy: string | undefined): string { return deathQuip(killedBy, pick); }

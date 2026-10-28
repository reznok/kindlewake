import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DAMAGE_TYPES, ROLES, type AbilityDef, type Effect, type Outcome } from '../src/core/types';
import { ABILITIES, CHARACTERS, ENCOUNTERS, ENEMIES, EVENTS, ITEMS, RELICS, UNLOCKS, KITS, DEATH_QUIPS, CAMP_SCENES, SHOP, ELITE_BARKS, INTRO, TIPS, TAGLINES, deathQuip, encounterPool } from '../src/data';

const chars = Object.values(CHARACTERS);
const enemies = Object.values(ENEMIES);
const act1 = enemies.filter((e) => e.id.startsWith('a1_'));
const act1Normal = act1.filter((e) => !e.elite && !e.boss);
/** Sprite keys shipped in the atlas. */
const atlasSprites = new Set(Object.keys(JSON.parse(readFileSync(new URL('../public/atlas.json', import.meta.url), 'utf8')).sprites as Record<string, unknown>));

/** Every ability id a character can ever use (starting four plus spark grants and replacements). */
function heroAbilityIds(): string[] {
  const ids = new Set<string>();
  for (const c of chars) {
    c.abilities.forEach((a) => ids.add(a));
    for (const s of c.sparks) {
      if (s.effect.kind === 'ability') ids.add(s.effect.id);
      if (s.effect.kind === 'replace') { ids.add(s.effect.from); ids.add(s.effect.to); }
    }
  }
  return [...ids];
}

function outcomesOf(): Outcome[] {
  return Object.values(EVENTS).flatMap((e) => e.choices.flatMap((c) => [...c.outcomes, ...(c.gamble?.outcomes ?? [])]));
}

describe('content tables', () => {
  it('has no placeholder content left', () => {
    for (const table of [ABILITIES, CHARACTERS, ENCOUNTERS, ENEMIES, EVENTS, ITEMS, RELICS]) {
      for (const id of Object.keys(table)) expect(id.startsWith('ph_'), id).toBe(false);
    }
  });

  it('every referenced ability exists', () => {
    for (const id of heroAbilityIds()) expect(ABILITIES[id], id).toBeTruthy();
    for (const e of enemies) for (const i of e.intents) expect(ABILITIES[i.ability], `${e.id}:${i.id}`).toBeTruthy();
  });

  it('enemy patterns name real intents; summons name real enemies', () => {
    for (const e of enemies) {
      const ids = new Set(e.intents.map((i) => i.id));
      const pats = [e.pattern, ...(e.phases ?? []).map((p) => p.pattern)];
      for (const p of pats) if (p !== 'random') for (const id of p) expect(ids.has(id), `${e.id}:${id}`).toBe(true);
      for (const i of e.intents) for (const fx of ABILITIES[i.ability].effects ?? []) if (fx.kind === 'summon') expect(ENEMIES[fx.enemy], fx.enemy).toBeTruthy();
    }
  });

  it('every encounter names real enemies', () => {
    for (const enc of Object.values(ENCOUNTERS)) {
      expect(enc.enemies.length).toBeGreaterThan(0);
      for (const x of enc.enemies) expect(ENEMIES[x.def], `${enc.id}:${x.def}`).toBeTruthy();
    }
  });

  it('every act has fights, elites and a boss; event fights stay off the map', () => {
    for (const act of [1, 2, 3] as const) {
      expect(encounterPool(act, 'fight').length).toBeGreaterThan(2);
      expect(encounterPool(act, 'elite').length).toBeGreaterThan(0);
      expect(encounterPool(act, 'boss').length).toBe(1);
      expect(encounterPool(act, 'fight').some((e) => e.id.startsWith('e_'))).toBe(false);
    }
    expect(encounterPool(1, 'fight').length).toBe(13);
    expect(encounterPool(1, 'elite').length).toBe(3);
  });

  it('every event outcome points at real content', () => {
    for (const o of outcomesOf()) {
      if (o.kind === 'item') expect(ITEMS[o.id], o.id).toBeTruthy();
      if (o.kind === 'relic') expect(RELICS[o.id], o.id).toBeTruthy();
      if (o.kind === 'recruit') expect(CHARACTERS[o.id], o.id).toBeTruthy();
      if (o.kind === 'fight') expect(ENCOUNTERS[o.encounter], o.encounter).toBeTruthy();
    }
    expect(Object.values(EVENTS).filter((e) => e.act === 1).length).toBe(12);
  });

  it('eight characters, one per role, four abilities and six sparks each', () => {
    expect(chars.length).toBe(8);
    expect(new Set(chars.map((c) => c.role)).size).toBe(ROLES.length);
    for (const c of chars) {
      expect(c.abilities.length, c.id).toBe(4);
      expect(c.sparks.length, c.id).toBe(6);
      expect(ITEMS[c.weapon]?.kind, c.weapon).toBe('weapon');
      expect(c.sprite).toBe('hero_' + c.id);
      expect(c.portrait).toBe('por_' + c.id);
      for (const s of c.sparks) if (s.requires) expect(c.sparks.some((x) => x.id === s.requires)).toBe(true);
    }
    expect(chars.filter((c) => c.starter).map((c) => c.id).sort()).toEqual(['barty', 'clem', 'dell']);
  });

  it('starting abilities cover all seven damage types', () => {
    const types = new Set(chars.flatMap((c) => c.abilities.flatMap((a) => (ABILITIES[a].hits ?? []).map((h) => h.type))));
    for (const t of DAMAGE_TYPES) expect(types.has(t), t).toBe(true);
  });

  it('every verb has act-1 targets and no verb is walled', () => {
    for (const t of DAMAGE_TYPES) {
      expect(act1.filter((e) => e.weak.includes(t)).length, `weak ${t}`).toBeGreaterThanOrEqual(3);
      expect(act1Normal.filter((e) => e.resist.includes(t) || e.immune?.includes(t)).length, `resist ${t}`).toBeLessThanOrEqual(6);
    }
  });

  it('no enemy-targeted hero ability applies shock, taunt or guard effects to foes', () => {
    const banned = new Set(['shock', 'taunt', 'barrier']);
    const heroAbs: AbilityDef[] = [
      ...heroAbilityIds().map((id) => ABILITIES[id]),
      ...Object.values(ITEMS).filter((i) => i.use).map((i) => ({ id: i.id, name: i.name, desc: '', mp: 0, target: i.use!.target, effects: i.use!.effects })),
    ];
    for (const a of heroAbs) {
      if (!['enemy', 'enemies', 'enemyRandom'].includes(a.target)) continue;
      for (const fx of a.effects ?? [] as Effect[]) {
        if (fx.kind !== 'status') continue;
        const onFoe = !fx.who || fx.who === 'target' || fx.who === 'enemies';
        if (onFoe) expect(banned.has(fx.id), `${a.id}:${fx.id}`).toBe(false);
      }
    }
    // nor do sparks hand out the passives the engine leaves unimplemented
    for (const c of chars) for (const s of c.sparks) if (s.effect.kind === 'passive') expect(['guardAll', 'breakBonus']).not.toContain(s.effect.passive.id);
  });

  it('enemies keep sprite and reward conventions; one rehearsed foe; the boss reshapes', () => {
    for (const e of act1) {
      expect(atlasSprites.has(e.sprite), e.id + ' sprite ' + e.sprite).toBe(true);
      if (!e.elite && !e.boss) { expect(e.xp).toBeGreaterThanOrEqual(6); expect(e.xp).toBeLessThanOrEqual(10); }
    }
    expect(act1Normal.length).toBe(16);
    expect(act1.filter((e) => e.elite).length).toBe(3);
    expect(act1.filter((e) => e.passives?.some((p) => p.id === 'rehearsed')).map((e) => e.id)).toEqual(['a1_nocturne']);
    const boss = act1.find((e) => e.boss)!;
    expect(boss.phases?.length).toBe(2);
    for (const p of boss.phases!) { expect(p.name).toBeTruthy(); expect(atlasSprites.has(p.sprite!)).toBe(true); expect(p.weak?.length).toBeGreaterThan(0); }
    // the three shapes are three different sprites
    expect(new Set([boss.sprite, ...boss.phases!.map((p) => p.sprite)]).size).toBe(3);
    // heavies are telegraphed: the previous step of the loop is a charge, wait, heal (lure) or buff
    for (const e of act1) {
      for (const pat of [e.pattern, ...(e.phases ?? []).map((p) => p.pattern)]) {
        if (pat === 'random') continue;
        pat.forEach((id, i) => {
          const kind = e.intents.find((x) => x.id === id)!.kind;
          if (kind !== 'heavy') return;
          const prev = e.intents.find((x) => x.id === pat[(i - 1 + pat.length) % pat.length])!.kind;
          expect(['charge', 'wait', 'heal', 'buff', 'debuff'], `${e.id}:${id}`).toContain(prev);
        });
      }
    }
  });

  it('ability numbers stay in range', () => {
    for (const a of Object.values(ABILITIES)) {
      expect(a.mp, a.id).toBeGreaterThanOrEqual(0);
      expect(a.mp, a.id).toBeLessThanOrEqual(12);
    }
  });

  it('items, relics and unlocks', () => {
    const items = Object.values(ITEMS);
    expect(items.filter((i) => i.kind === 'weapon').length).toBe(16);
    expect(items.filter((i) => i.kind === 'trinket').length).toBe(10);
    expect(items.filter((i) => i.kind === 'trinket').every((i) => !!i.passive)).toBe(true);
    expect(items.filter((i) => i.kind === 'consumable').length).toBe(11);
    expect(ITEMS.c_potion).toBeTruthy();
    expect(Object.keys(RELICS).length).toBe(12);
    for (const u of UNLOCKS) {
      if (u.kind === 'starter' || u.kind === 'recruit') expect(CHARACTERS[u.target], u.id).toBeTruthy();
      if (u.kind === 'relic') expect(RELICS[u.target], u.id).toBeTruthy();
      if (u.kind === 'kit') expect(KITS[u.target], u.id).toBeTruthy();
    }
    for (const c of chars) if (c.unlock) expect(UNLOCKS.some((u) => u.id === c.unlock)).toBe(true);
    for (const c of chars.filter((x) => !x.starter)) expect(UNLOCKS.some((u) => u.kind === 'starter' && u.target === c.id), c.id).toBe(true);
  });

  it('text tables are filled and keyed to real content', () => {
    expect(DEATH_QUIPS.general.length).toBe(16);
    for (const k of Object.keys(DEATH_QUIPS.byKiller)) expect(ENEMIES[k.split('#')[0]], k).toBeTruthy();
    // killer quips resolve from the recorded display name, including boss shapes
    expect(deathQuip(ENEMIES.a1_trundlesnail.name)).toBe(DEATH_QUIPS.byKiller.a1_trundlesnail);
    const shape = ENEMIES.a1_thief.phases![0].name!;
    expect(deathQuip(shape)).toBe(DEATH_QUIPS.byKiller['a1_thief#2']);
    expect(deathQuip('the dark', (l) => l[1])).toBe(DEATH_QUIPS.general[1]);
    for (const k of Object.keys(ELITE_BARKS)) expect(ENEMIES[k]?.elite, k).toBe(true);
    expect(CAMP_SCENES.length).toBe(2);
    for (const sc of CAMP_SCENES) for (const l of sc.lines) for (const who of [l.who, ...(l.requires ?? [])]) if (who) expect(CHARACTERS[who], who).toBeTruthy();
    for (const k of Object.keys(SHOP.byMember)) expect(CHARACTERS[k]).toBeTruthy();
    expect(TIPS.length).toBe(12);
    expect(TAGLINES.always.length).toBe(13);
    expect(INTRO.length).toBeGreaterThanOrEqual(3);
    expect(INTRO.length).toBeLessThanOrEqual(5);
  });
});

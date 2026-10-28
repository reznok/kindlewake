/** Sheets for node business: event, recruit, camp, shop, reward. */
import type { Run } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { EVENTS } from '../data/events';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { RECRUIT_SCENES, SHOP } from '../data/text';
import { bagSize, campForge, campHeal, campSpark, canChoose, chooseEvent, claimReward, eventChoices, finishNode, memberById, PARTY_MAX, price, recruit, RELIC_MAX, shopBuy, sparkOffers } from '../engine/run';
import { memberStats, memberWeapon } from '../engine/stats';
import type { App } from './app';
import { play } from './audio';
import { btn, el, rich } from './dom';
import { campScene, pick as pickOne, shopGreeting, shopLine, speaker } from './flavour';
import { toBattle, toEnd, toMap } from './flow';
import { cap, ROLE_COLOR } from './palette';
import { openSparkPick } from './party';
import { abilityRow, portrait, statGrid, typeTag } from './portrait';
import { Sheet } from './sheet';

// ------------------------------------------------------------ outcome summary

interface Snap { gold: number; bag: Map<string, number>; relics: string[]; party: string[]; hp: number }

function snap(run: Run): Snap {
  const bag = new Map<string, number>();
  for (const i of run.bag) bag.set(i.def, (bag.get(i.def) ?? 0) + i.qty);
  return { gold: run.gold, bag, relics: [...run.relics], party: run.party.map((m) => m.def), hp: run.party.reduce((a, m) => a + m.hp, 0) };
}

function diff(a: Snap, b: Snap): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (b.gold !== a.gold) out.push(el('span.pill' + (b.gold > a.gold ? '.good' : '.bad'), (b.gold > a.gold ? '+' : '') + (b.gold - a.gold) + ' buttons'));
  for (const [def, n] of b.bag) { const d = n - (a.bag.get(def) ?? 0); if (d > 0) out.push(el('span.pill.good', 'Got ' + (ITEMS[def]?.name ?? def) + (d > 1 ? ' x' + d : ''))); }
  for (const [def, n] of a.bag) { const d = n - (b.bag.get(def) ?? 0); if (d > 0) out.push(el('span.pill.bad', 'Lost ' + (ITEMS[def]?.name ?? def))); }
  for (const r of b.relics) if (!a.relics.includes(r)) out.push(el('span.pill.good', 'Keepsake: ' + RELICS[r].name));
  for (const p of b.party) if (!a.party.includes(p)) out.push(el('span.pill.good', CHARACTERS[p].name + ' joins!'));
  if (b.hp > a.hp) out.push(el('span.pill.good', 'Party healed'));
  if (b.hp < a.hp) out.push(el('span.pill.bad', 'Party hurt'));
  return out;
}

// ------------------------------------------------------------ voice lines

/** A character line for a sheet: "Name: line", or the bare stage direction when the line is one. */
function speakerLine(def: string, line: string) {
  return /^\*[^*]+\*$/.test(line) ? rich(line) : [el('b', speaker(def) + ': '), ...rich(line)];
}

// ------------------------------------------------------------ event

export function openEvent(app: App): Sheet | null {
  const run = app.run!;
  if (run.pending?.kind !== 'event') return null;
  const ev = EVENTS[run.pending.event];
  const s = new Sheet(app, { title: ev.title, closable: false });
  const choices = eventChoices(run);
  s.fill([el('p.event-text', ev.text)], [el('div.choices', choices.map((c, i) => btn(c.label, () => {
    if (!canChoose(run, c)) { play('menu'); return; }
    const before = snap(run);
    const r = chooseEvent(run, i);
    const after = snap(run);
    play('confirm');
    app.log(`${ev.title}: ${c.label}. ${r.text}`);
    app.persist();
    s.fill([el('p.event-text.muted', ev.text), el('p.event-choice', '→ ' + c.label), el('p.event-result', r.text), el('div.pills', diff(before, after))],
      [btn(r.fight ? 'Fight!' : 'Continue', () => {
        s.close();
        if (r.fight) toBattle(app);
        else app.refresh();
      }, r.fight ? 'big red' : 'big', { data: { default: '' } })]);
    requestAnimationFrame(() => (s.foot.querySelector('button') as HTMLButtonElement | null)?.focus());
  }, 'choice' + (canChoose(run, c) ? '' : ' disabled'))))]);
  return s.open();
}

// ------------------------------------------------------------ recruit

export function openRecruit(app: App): Sheet | null {
  const run = app.run!;
  if (run.pending?.kind !== 'recruit') return null;
  const c = CHARACTERS[run.pending.def];
  const s = new Sheet(app, { title: `${c.name} wants to join`, closable: false, cls: 'wide' });
  const full = run.party.length >= PARTY_MAX;
  const accept = (replace?: string) => {
    const m = recruit(run, true, replace);
    if (m) { play('confirm'); app.log(`${c.name} joined the party.`); }
    app.persist();
    s.close();
  };
  const decline = () => { recruit(run, false); play('menu'); app.log(`Waved goodbye to ${c.name}.`); app.persist(); s.close(); };
  const scene = RECRUIT_SCENES[c.id];
  // a line wrapped wholly in *...* is a stage direction, not speech: no quote marks
  const line = /^\*[^*]+\*$/.test(c.lines.recruit) ? rich(c.lines.recruit) : ['“', ...rich(c.lines.recruit), '”'];
  s.fill([
    scene ? el('p.event-text', rich(scene)) : null,
    el('div.detail-head', portrait(c.sprite, c.name, 64), el('div',
      el('h3', c.name), el('div.role-chip', { style: { background: ROLE_COLOR[c.role] } }, cap(c.role)),
      el('p.quote', line), el('p.muted', c.desc))),
    statGrid(c.base),
    el('h4', 'Abilities'),
    c.abilities.map((a) => abilityRow(a)),
  ], full ? [
    el('div.foot-note', 'Your Kindling is full (6). Pick someone to part ways with:'),
    el('div.choices.row', run.party.map((m) => btn(`${CHARACTERS[m.def].name} (Lv ${m.level})`, () => accept(m.id), 'small'))),
    btn('Decline', decline, 'ghost'),
  ] : [
    btn('Welcome aboard', () => accept(), 'big', { data: { default: '' } }),
    btn('Decline', decline, 'ghost'),
    el('span.muted', run.active.length < 3 ? 'Joins the Front (the active three).' : 'Joins the Wagon (the bench; call them up from the Party sheet).'),
  ]);
  return s.open();
}

// ------------------------------------------------------------ camp

export function openCamp(app: App): Sheet | null {
  const run = app.run!;
  if (run.pending?.kind !== 'camp') return null;
  const fireside = campScene(run);
  if (fireside) app.persist();
  const s = new Sheet(app, { title: fireside ? `Fireside: ${fireside.scene.title}` : 'Fireside', closable: false, cls: 'wide' });
  const sceneBox = fireside ? el('div.scene', fireside.lines.map((l) => {
    if (l.who === null) return el('p.narr', rich(l.text));
    const name = speaker(l.who);
    const body = l.who === 'pell' ? el('i', rich(l.text)) : rich(l.text);
    return el('p', l.text.startsWith(name) ? null : el('span.who', name + ':'), body);
  })) : null;
  const main = () => {
    const sparkable = run.party.filter((m) => sparkOffers(run, m.id).length);
    s.fill([
      sceneBox,
      el('p', 'A quiet spot by the fire. There is time for one thing.'),
      el('div.option-grid',
        el('div.option', el('h4', 'Rest'), el('p', 'Everyone recovers half their HP and Moxie (MP).'), btn('Rest', () => {
          campHeal(run); play('heal'); app.log('Rested at the Fireside.'); app.persist(); s.close();
        }, '', { data: { default: '' } })),
        el('div.option', el('h4', 'Spark'), el('p', 'One of the Kindling picks a spark (upgrade) now.'), btn('Spark...', () => pick('spark'), '', { disabled: !sparkable.length })),
        el('div.option', el('h4', 'Forge'), el('p', "+1 to one member's weapon (+10 power)."), btn('Forge...', () => pick('forge'))),
      ),
    ], [btn('Move on', () => { finishNode(run); app.persist(); s.close(); }, 'ghost')]);
  };
  const pick = (what: 'spark' | 'forge') => {
    play('menu');
    const list = what === 'spark' ? run.party.filter((m) => sparkOffers(run, m.id).length) : run.party;
    s.fill([
      el('p', what === 'spark' ? 'Who takes the spark?' : 'Whose weapon?'),
      el('div.member-list', list.map((m) => {
        const d = CHARACTERS[m.def];
        const w = memberWeapon(m);
        return btn([portrait(d.sprite, d.name, 34), el('span.li-name', d.name), el('span.muted', what === 'forge' ? `${w.name} ${w.power}` : 'Lv ' + m.level)], () => {
          if (what === 'spark') {
            campSpark(run, m.id);
            app.log(`A spark settles in ${d.name}.`);
            app.persist();
            s.close();
            openSparkPick(app, m.id);
          } else {
            campForge(run, m.id);
            play('confirm');
            app.log(`Forged ${d.name}'s weapon.`);
            app.persist();
            s.close();
          }
        }, 'li');
      })),
    ], [btn('Back', main, 'ghost')]);
  };
  main();
  return s.open();
}

// ------------------------------------------------------------ shop

export function openShop(app: App): Sheet | null {
  const run = app.run!;
  if (run.pending?.kind !== 'shop') return null;
  const s = new Sheet(app, { title: SHOP.name, closable: false, cls: 'wide' });
  let said = shopGreeting(run);
  app.persist();
  const keeper = () => el('div.keeper', el('span.who', SHOP.keeper + ':'), el('div', said.map((l) => el('p', rich(l)))));
  const render = () => {
    if (run.pending?.kind !== 'shop') return;
    const stock = run.pending.stock;
    const full = run.bag.length >= bagSize(run);
    s.setTitle(`${SHOP.name} • ${run.gold} buttons`);
    s.fill([
      keeper(),
      stock.length ? el('div.shop-list', stock.map((id) => {
        const it = ITEMS[id], rl = RELICS[id];
        const cost = price(run, id);
        const owned = it?.kind === 'consumable' ? run.bag.find((b) => b.def === id)?.qty ?? 0 : 0;
        const poor = run.gold < cost;
        const blocked = rl ? (run.relics.length >= RELIC_MAX ? 'Keepsakes full' : '') : full && !(it?.kind === 'consumable' && owned) ? 'Bag full' : '';
        // can't-afford stays clickable so the keeper can say so; full bag / slots are hard blocks
        const buy = () => {
          if (poor) { play('menu'); said = [shopLine('poor')]; render(); return; }
          if (!shopBuy(run, id)) return;
          play('coin');
          app.log('Bought ' + (it?.name ?? rl?.name) + '.');
          said = [shopLine(rl ? 'keepsake' : 'buy')];
          app.persist(); render(); app.refresh();
        };
        return el('div.shop-row',
          el('div.shop-info',
            el('div', el('b', it?.name ?? rl?.name ?? id), ' ', el('span.kind', rl ? 'keepsake' : it?.kind ?? ''), it?.type ? typeTag(it.type) : null, it?.power ? el('span.muted', ' power ' + it.power) : null, owned ? el('span.muted', ` (have ${owned})`) : null),
            el('div.muted', it?.desc ?? rl?.desc ?? '')),
          btn([String(cost), ' ', el('span.coin')], buy, 'small buy' + (poor ? ' poor' : ''), { disabled: !!blocked, title: blocked || (poor ? 'Not enough buttons' : `Buy for ${cost} buttons`) }),
        );
      })) : el('p.muted', 'Sold out.'),
      el('p.muted.small', `Bag ${run.bag.length}/${bagSize(run)} • Keepsakes ${run.relics.length}/${RELIC_MAX}`),
    ], [btn('Leave', leave, 'big')]);
  };
  // the parting line gets a moment on screen; a tap skips it
  const leave = () => {
    finishNode(run); app.persist();
    said = [shopLine('leave')];
    s.fill([keeper()], [btn('Off you go', () => s.close(), 'big', { data: { default: '' } })]);
    requestAnimationFrame(() => (s.foot.querySelector('button') as HTMLButtonElement | null)?.focus());
    setTimeout(() => s.close(), 2600);
  };
  render();
  return s.open();
}

// ------------------------------------------------------------ reward

export function openReward(app: App): Sheet | null {
  const run = app.run!;
  const p = run.pending;
  if (p?.kind !== 'reward') return null;
  const s = new Sheet(app, { title: 'Victory!', closable: false, cls: 'wide' });
  let relic: string | undefined;
  const ups = p.levelUps.map((id) => memberById(run, id)).filter(Boolean);
  // one level-up line per reward, from whoever levelled (when they have one)
  const speakers = ups.filter((m) => CHARACTERS[m!.def].lines.levelUp);
  const lu = speakers.length ? pickOne(speakers)! : null;
  const levelLine = lu ? speakerLine(lu.def, CHARACTERS[lu.def].lines.levelUp!) : null;
  const render = () => {
    s.fill([
      el('div.pills', el('span.pill.good', '+' + p.gold + ' buttons'), el('span.pill', '+' + p.xp + ' XP'), p.items.map((i) => el('span.pill.good', 'Found ' + (ITEMS[i]?.name ?? i)))),
      ups.length ? [el('h4', 'Level up!'), el('div.lvl-ups', ups.map((m) => {
        const d = CHARACTERS[m!.def];
        const st = memberStats(m!, run);
        return el('div.lvl-up', { title: `${m!.hp}/${st.hp} HP` }, portrait(d.sprite, d.name, 28), el('span', el('b', d.name), ' Lv ' + m!.level), m!.pendingSparks ? el('span.pill.spark', 'Spark!') : null);
      })), levelLine ? el('p.quote', levelLine) : null, ups.some((m) => m!.pendingSparks) ? el('p.muted.small', 'Pick sparks from the Party sheet (Your Kindling) on the map.') : null] : null,
      p.relics?.length ? [el('h4', 'Pick a keepsake'), el('div.option-grid', p.relics.map((id) => {
        const r = RELICS[id];
        const b = btn([el('b', r.name), el('span.muted', r.desc)], () => { relic = relic === id ? undefined : id; play('menu'); render(); }, 'relic-card' + (relic === id ? ' picked' : ''));
        return b;
      }))] : null,
      run.relics.length >= RELIC_MAX && p.relics?.length ? el('p.muted', 'Keepsake slots are full.') : null,
    ], [btn(p.relics?.length && !relic ? 'Skip keepsake' : 'Continue', () => {
      claimReward(run, relic);
      if (relic) app.log('Took keepsake ' + RELICS[relic].name + '.');
      play('confirm');
      app.persist();
      s.close();
      if (run.over) toEnd(app);
      else toMap(app);
    }, 'big', { data: { default: '' } })]);
  };
  render();
  play(ups.length ? 'levelup' : 'coin');
  return s.open();
}

/** Sheets for node business: event, recruit, camp, shop, reward. */
import type { Run } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { EVENTS } from '../data/events';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { bagSize, campForge, campHeal, campSpark, canChoose, chooseEvent, claimReward, eventChoices, finishNode, memberById, PARTY_MAX, price, recruit, RELIC_MAX, shopBuy, sparkOffers } from '../engine/run';
import { memberStats, memberWeapon } from '../engine/stats';
import type { App } from './app';
import { play } from './audio';
import { btn, el } from './dom';
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
  if (b.gold !== a.gold) out.push(el('span.pill' + (b.gold > a.gold ? '.good' : '.bad'), (b.gold > a.gold ? '+' : '') + (b.gold - a.gold) + ' gold'));
  for (const [def, n] of b.bag) { const d = n - (a.bag.get(def) ?? 0); if (d > 0) out.push(el('span.pill.good', 'Got ' + (ITEMS[def]?.name ?? def) + (d > 1 ? ' x' + d : ''))); }
  for (const [def, n] of a.bag) { const d = n - (b.bag.get(def) ?? 0); if (d > 0) out.push(el('span.pill.bad', 'Lost ' + (ITEMS[def]?.name ?? def))); }
  for (const r of b.relics) if (!a.relics.includes(r)) out.push(el('span.pill.good', 'Relic: ' + RELICS[r].name));
  for (const p of b.party) if (!a.party.includes(p)) out.push(el('span.pill.good', CHARACTERS[p].name + ' joins!'));
  if (b.hp > a.hp) out.push(el('span.pill.good', 'Party healed'));
  if (b.hp < a.hp) out.push(el('span.pill.bad', 'Party hurt'));
  return out;
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
  s.fill([
    el('div.detail-head', portrait(c.sprite, c.name, 64), el('div',
      el('h3', c.name), el('div.role-chip', { style: { background: ROLE_COLOR[c.role] } }, cap(c.role)),
      el('p.quote', '“' + c.lines.recruit + '”'), el('p.muted', c.desc))),
    statGrid(c.base),
    el('h4', 'Abilities'),
    c.abilities.map((a) => abilityRow(a)),
  ], full ? [
    el('div.foot-note', 'The party is full (6). Pick someone to part ways with:'),
    el('div.choices.row', run.party.map((m) => btn(`${CHARACTERS[m.def].name} (Lv ${m.level})`, () => accept(m.id), 'small'))),
    btn('Decline', decline, 'ghost'),
  ] : [
    btn('Welcome aboard', () => accept(), 'big', { data: { default: '' } }),
    btn('Decline', decline, 'ghost'),
    el('span.muted', run.active.length < 3 ? 'Joins the active trio.' : 'Joins the bench (swap in from the Party sheet).'),
  ]);
  return s.open();
}

// ------------------------------------------------------------ camp

export function openCamp(app: App): Sheet | null {
  const run = app.run!;
  if (run.pending?.kind !== 'camp') return null;
  const s = new Sheet(app, { title: 'Camp', closable: false, cls: 'wide' });
  const main = () => {
    const sparkable = run.party.filter((m) => sparkOffers(run, m.id).length);
    s.fill([
      el('p', 'A quiet spot. There is time for one thing.'),
      el('div.option-grid',
        el('div.option', el('h4', 'Rest'), el('p', 'Everyone recovers half their HP and MP.'), btn('Rest', () => {
          campHeal(run); play('heal'); app.log('Rested at camp.'); app.persist(); s.close();
        }, '', { data: { default: '' } })),
        el('div.option', el('h4', 'Train'), el('p', 'One member picks a spark now.'), btn('Train...', () => pick('spark'), '', { disabled: !sparkable.length })),
        el('div.option', el('h4', 'Forge'), el('p', "+1 to one member's weapon (+10 power)."), btn('Forge...', () => pick('forge'))),
      ),
    ], [btn('Move on', () => { finishNode(run); app.persist(); s.close(); }, 'ghost')]);
  };
  const pick = (what: 'spark' | 'forge') => {
    play('menu');
    const list = what === 'spark' ? run.party.filter((m) => sparkOffers(run, m.id).length) : run.party;
    s.fill([
      el('p', what === 'spark' ? 'Who trains?' : 'Whose weapon?'),
      el('div.member-list', list.map((m) => {
        const d = CHARACTERS[m.def];
        const w = memberWeapon(m);
        return btn([portrait(d.sprite, d.name, 34), el('span.li-name', d.name), el('span.muted', what === 'forge' ? `${w.name} ${w.power}` : 'Lv ' + m.level)], () => {
          if (what === 'spark') {
            campSpark(run, m.id);
            app.log(`${d.name} trained at camp.`);
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
  const s = new Sheet(app, { title: 'Shop', closable: false, cls: 'wide' });
  const render = () => {
    if (run.pending?.kind !== 'shop') return;
    const stock = run.pending.stock;
    const full = run.bag.length >= bagSize(run);
    s.setTitle(`Shop • ${run.gold} gold`);
    s.fill([
      stock.length ? el('div.shop-list', stock.map((id) => {
        const it = ITEMS[id], rl = RELICS[id];
        const cost = price(run, id);
        const owned = it?.kind === 'consumable' ? run.bag.find((b) => b.def === id)?.qty ?? 0 : 0;
        const blocked = run.gold < cost ? 'Not enough gold' : rl ? (run.relics.length >= RELIC_MAX ? 'Relics full' : '') : full && !(it?.kind === 'consumable' && owned) ? 'Bag full' : '';
        return el('div.shop-row',
          el('div.shop-info',
            el('div', el('b', it?.name ?? rl?.name ?? id), ' ', el('span.kind', rl ? 'relic' : it?.kind ?? ''), it?.type ? typeTag(it.type) : null, it?.power ? el('span.muted', ' power ' + it.power) : null, owned ? el('span.muted', ` (have ${owned})`) : null),
            el('div.muted', it?.desc ?? rl?.desc ?? '')),
          btn(cost + 'g', () => { if (shopBuy(run, id)) { play('coin'); app.log('Bought ' + (it?.name ?? rl?.name) + '.'); app.persist(); render(); app.refresh(); } }, 'small buy', { disabled: !!blocked, title: blocked || 'Buy' }),
        );
      })) : el('p.muted', 'Sold out.'),
      el('p.muted.small', `Bag ${run.bag.length}/${bagSize(run)} • Relics ${run.relics.length}/${RELIC_MAX}`),
    ], [btn('Leave', () => { finishNode(run); app.persist(); s.close(); }, 'big')]);
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
  const render = () => {
    s.fill([
      el('div.pills', el('span.pill.good', '+' + p.gold + ' gold'), el('span.pill', '+' + p.xp + ' XP'), p.items.map((i) => el('span.pill.good', 'Found ' + (ITEMS[i]?.name ?? i)))),
      ups.length ? [el('h4', 'Level up!'), el('div.lvl-ups', ups.map((m) => {
        const d = CHARACTERS[m!.def];
        const st = memberStats(m!, run);
        return el('div.lvl-up', { title: `${m!.hp}/${st.hp} HP` }, portrait(d.sprite, d.name, 28), el('span', el('b', d.name), ' Lv ' + m!.level), m!.pendingSparks ? el('span.pill.spark', 'Spark!') : null);
      })), ups.some((m) => m!.pendingSparks) ? el('p.muted.small', 'Pick sparks from the Party sheet on the map.') : null] : null,
      p.relics?.length ? [el('h4', 'Pick a relic'), el('div.option-grid', p.relics.map((id) => {
        const r = RELICS[id];
        const b = btn([el('b', r.name), el('span.muted', r.desc)], () => { relic = relic === id ? undefined : id; play('menu'); render(); }, 'relic-card' + (relic === id ? ' picked' : ''));
        return b;
      }))] : null,
      run.relics.length >= RELIC_MAX && p.relics?.length ? el('p.muted', 'Relic slots are full.') : null,
    ], [btn(p.relics?.length && !relic ? 'Skip relic' : 'Continue', () => {
      claimReward(run, relic);
      if (relic) app.log('Took relic ' + RELICS[relic].name + '.');
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

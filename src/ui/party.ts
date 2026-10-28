/** Party sheet: lineup, stats, gear, sparks, abilities, bench swaps. */
import type { PartyMember } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { equip, pickSpark, setActive, sparkName, sparkOffers, unequip } from '../engine/run';
import { memberAbilities, memberStats, memberWeapon, xpForLevel, MAX_LEVEL } from '../engine/stats';
import type { App } from './app';
import { play } from './audio';
import { bar, btn, el } from './dom';
import { cap, ROLE_COLOR } from './palette';
import { abilityRow, portrait, statGrid, typeTag } from './portrait';
import { Sheet } from './sheet';

export function openSparkPick(app: App, memberId: string): Sheet { return openParty(app, memberId); }

export function openParty(app: App, focus?: string): Sheet {
  const run = app.run!;
  const s = new Sheet(app, { title: 'Your Kindling', cls: 'wide tall' });
  let sel = focus ?? run.party.find((m) => m.pendingSparks > 0)?.id ?? run.active[0] ?? run.party[0]?.id;

  const card = (m: PartyMember) => {
    const d = CHARACTERS[m.def];
    const st = memberStats(m, run);
    return el('button.member-card' + (m.id === sel ? '.sel' : ''), { type: 'button', onclick: () => { sel = m.id; play('menu'); render(); } },
      portrait(d.sprite, d.name, 36, { ko: m.hp <= 0 }),
      el('div.mc-body', el('div.mc-name', d.name, el('small', ' Lv ' + m.level)), bar(m.hp, st.hp, 'hp')),
      m.pendingSparks ? el('span.badge', String(m.pendingSparks)) : null,
    );
  };

  const detail = (m: PartyMember) => {
    const d = CHARACTERS[m.def];
    const st = memberStats(m, run);
    const w = memberWeapon(m);
    const lo = xpForLevel(m.level), hi = xpForLevel(Math.min(MAX_LEVEL, m.level + 1));
    const isActive = run.active.includes(m.id);
    const others = run.party.filter((o) => o.id !== m.id && run.active.includes(o.id) !== isActive);
    const gear = run.bag.filter((i) => ITEMS[i.def]?.kind === 'weapon' || ITEMS[i.def]?.kind === 'trinket');
    const offers = m.pendingSparks > 0 ? sparkOffers(run, m.id) : [];
    const swap = (other: string) => {
      const next = isActive ? run.active.map((id) => (id === m.id ? other : id)) : run.active.map((id) => (id === other ? m.id : id));
      if (setActive(run, next)) { play('confirm'); app.persist(); render(); }
    };
    return el('div.party-detail',
      el('div.detail-head', portrait(d.sprite, d.name, 60, { ko: m.hp <= 0 }), el('div.grow',
        el('h3', d.name, el('small', ' Lv ' + m.level)),
        el('div.role-chip', { style: { background: ROLE_COLOR[d.role] } }, cap(d.role)),
        el('div.bars', bar(m.hp, st.hp, 'hp', `HP ${m.hp}/${st.hp}`), Object.assign(bar(m.mp, st.mp, 'mp', `MP ${m.mp}/${st.mp}`), { title: 'Moxie (MP)' }),
          bar(m.xp - lo, Math.max(1, hi - lo), 'xp', m.level >= MAX_LEVEL ? 'Max level' : `XP ${m.xp - lo}/${hi - lo}`)),
      )),
      offers.length ? el('div.spark-pick', el('h4', 'Pick a spark'), el('div.option-grid', offers.map((sp) => btn([el('b', sp.name), el('span.muted', sp.desc)], () => {
        if (pickSpark(run, m.id, sp.id)) { play('buff'); app.log(`${d.name} learned ${sp.name}.`); app.persist(); render(); }
      }, 'relic-card', { data: { default: '' } })))) : null,
      el('div.lineup-actions', el('span.muted', isActive ? 'On the Front. Send to the Wagon for: ' : 'In the Wagon (bench). Call up for: '),
        others.length ? others.map((o) => btn(CHARACTERS[o.def].name, () => swap(o.id), 'small')) : el('span.muted', 'nobody')),
      statGrid(st),
      el('h4', 'Gear'),
      el('div.gear-row', el('span.slot-k', 'Weapon'), el('b', w.name), ' ', typeTag(w.type), el('span.muted', ` power ${w.power}`),
        m.weapon ? btn('Unequip', () => { if (unequip(run, m.id, 'weapon')) { play('menu'); app.persist(); render(); } }, 'small ghost') : el('span.muted', ' (default)')),
      el('div.gear-row', el('span.slot-k', 'Trinket'), m.trinket ? [el('b', ITEMS[m.trinket.def].name), el('span.muted', ' ' + ITEMS[m.trinket.def].desc),
        btn('Unequip', () => { if (unequip(run, m.id, 'trinket')) { play('menu'); app.persist(); render(); } }, 'small ghost')] : el('span.muted', 'none')),
      gear.length ? el('div.equip-list', el('span.muted', 'From the bag: '), gear.map((g) => {
        const gd = ITEMS[g.def];
        return btn([gd.name, gd.type ? typeTag(gd.type) : null], () => { if (equip(run, m.id, g.id)) { play('confirm'); app.persist(); render(); } }, 'small', { title: gd.desc });
      })) : null,
      m.sparks.length ? [el('h4', 'Sparks'), el('div.pills', m.sparks.map((id) => el('span.pill.spark', sparkName(m, id))))] : null,
      el('h4', 'Abilities'),
      memberAbilities(m).map((a) => abilityRow(a)),
    );
  };

  const render = () => {
    const m = run.party.find((x) => x.id === sel) ?? run.party[0];
    if (!m) return;
    sel = m.id;
    const active = run.active.map((id) => run.party.find((x) => x.id === id)).filter((x): x is PartyMember => !!x);
    const bench = run.party.filter((x) => !run.active.includes(x.id));
    s.fill([el('div.party-layout',
      el('div.party-side', el('div.side-label', 'Active'), active.map(card), el('div.side-label', 'Bench'), bench.length ? bench.map(card) : el('p.muted.small', 'Recruit more at + stops.')),
      detail(m),
    )]);
  };
  render();
  return s.open();
}

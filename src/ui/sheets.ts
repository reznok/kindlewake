/** General sheets: confirm, bag, relics, menu, settings, Ledger, credits. */
import type { Settings } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { UNLOCKS } from '../data/unlocks';
import { bagSize, equip, RELIC_MAX } from '../engine/run';
import type { App } from './app';
import { CREDITS } from './credits';
import { play } from './audio';
import { btn, el } from './dom';
import { toEnd, toTitle } from './flow';
import { helpSheet } from './help';
import { typeTag } from './portrait';
import { Sheet } from './sheet';

export function ask(app: App, title: string, text: string, yes: string, onYes: () => void): Sheet {
  const s = new Sheet(app, { title, cls: 'small' });
  s.fill([el('p', text)], [btn(yes, () => { s.close(); onYes(); }, 'red'), btn('Cancel', () => s.close(), 'ghost', { data: { default: '' } })]);
  return s.open();
}

export function openBag(app: App): Sheet {
  const run = app.run!;
  const s = new Sheet(app, { title: 'Bag', cls: 'wide' });
  const render = () => {
    s.setTitle(`Bag ${run.bag.length}/${bagSize(run)}`);
    s.fill([run.bag.length ? el('div.shop-list', run.bag.map((i) => {
      const d = ITEMS[i.def];
      const gear = d.kind !== 'consumable';
      return el('div.shop-row',
        el('div.shop-info', el('div', el('b', d.name), i.qty > 1 ? ' x' + i.qty : '', ' ', el('span.kind', d.kind), d.type ? typeTag(d.type) : null, d.power ? el('span.muted', ' power ' + d.power) : null), el('div.muted', d.desc)),
        gear ? el('div.equip-to', run.party.map((m) => btn(CHARACTERS[m.def].name, () => { if (equip(run, m.id, i.id)) { play('confirm'); app.persist(); render(); app.refresh(); } }, 'small', { title: 'Equip on ' + CHARACTERS[m.def].name }))) : el('span.muted.small', 'Use in battle'),
      );
    })) : el('p.muted', 'Empty.')]);
  };
  render();
  return s.open();
}

export function openRelics(app: App): Sheet {
  const run = app.run!;
  const s = new Sheet(app, { title: `Relics ${run.relics.length}/${RELIC_MAX}` });
  s.fill([run.relics.length ? el('div.shop-list', run.relics.map((id) => el('div.shop-row', el('div.shop-info', el('b', RELICS[id].name), el('div.muted', RELICS[id].desc))))) : el('p.muted', 'No relics yet. Elites, events and shops have them.')]);
  return s.open();
}

export function openMenu(app: App): Sheet {
  const s = new Sheet(app, { title: 'Menu', cls: 'small' });
  s.fill([el('div.choices',
    btn('Resume', () => s.close(), 'big', { data: { default: '' } }),
    btn('Settings', () => openSettings(app)),
    btn('How to play', () => helpSheet(app)),
    btn('Save and quit to title', () => { app.persist(); toTitle(app); }, 'ghost'),
    app.run ? btn('Abandon run', () => ask(app, 'Abandon run?', 'The run ends here and goes in the Ledger.', 'Abandon', () => {
      const run = app.run!;
      run.over = 'lost';
      run.stats.killedBy = 'giving up';
      run.pending = null;
      app.log('The party gave up.');
      app.persist();
      toEnd(app);
    }), 'ghost red-text') : null,
  )]);
  return s.open();
}

export function openSettings(app: App): Sheet {
  const s = new Sheet(app, { title: 'Settings', cls: 'small' });
  const render = () => {
    const st = app.settings;
    const toggle = (key: 'sound' | 'music' | 'shake', label: string) => el('div.setting', el('span', label),
      btn(st[key] ? 'On' : 'Off', () => { app.setSettings({ [key]: !st[key] } as Partial<Settings>); play('menu'); render(); }, 'small ' + (st[key] ? 'on' : 'ghost')));
    const timing = (v: Settings['timing'], label: string) => btn(label, () => { app.setSettings({ timing: v }); play('menu'); render(); }, 'small ' + (st.timing === v ? 'on' : 'ghost'));
    s.fill([
      toggle('sound', 'Sound'),
      toggle('music', 'Music'),
      toggle('shake', 'Screen shake'),
      el('div.setting', el('span', 'Timing window'), el('div.seg', timing('normal', 'Normal'), timing('wide', 'Wide'), timing('auto', 'Auto'))),
      el('p.muted.small', st.timing === 'auto' ? 'Auto: every hit and guard scores Good, never Perfect. No rings.' : st.timing === 'wide' ? 'Wide: windows are twice as long.' : 'Normal: Perfect within ~80 ms, Good within ~220 ms.'),
    ]);
  };
  render();
  return s.open();
}

export function openLedger(app: App): Sheet {
  const l = app.ledger;
  const s = new Sheet(app, { title: 'Ledger', cls: 'wide' });
  const runs = [...l.runs].reverse().slice(0, 30);
  s.fill([
    el('h4', 'Unlocks'),
    el('div.unlocks', UNLOCKS.map((u) => {
      const got = l.unlocks.includes(u.id);
      return el('div.unlock' + (got ? '.got' : ''), el('b', got ? u.name : '???'), el('span.muted', ' ' + u.desc), got ? el('span.pill.good', u.kind) : null);
    })),
    el('h4', `Runs (${l.runs.length})`),
    runs.length ? el('table.runs', el('tr', el('th', 'When'), el('th', 'Result'), el('th', 'Act'), el('th', 'Party'), el('th', 'Ended by')),
      runs.map((r) => el('tr',
        el('td', new Date(r.when).toLocaleDateString()),
        el('td', el('span.pill' + (r.result === 'won' ? '.good' : '.bad'), r.result)),
        el('td', String(r.act)),
        el('td', r.party.map((p) => CHARACTERS[p]?.name ?? p).join(', ')),
        el('td', r.killedBy ?? '-'),
      ))) : el('p.muted', 'No runs yet. Go make some history.'),
  ]);
  return s.open();
}

export function openCredits(app: App): Sheet {
  const s = new Sheet(app, { title: 'Credits', cls: 'small' });
  s.fill([
    el('p', el('b', 'Kindlewake'), ' — a browser party RPG. Art, music and sound by these generous creators:'),
    el('ul.credits', CREDITS.map((c) => el('li',
      el('b', c.pack), ' by ', c.author, ' ',
      el('span.pill' + (c.licence.startsWith('CC-BY') ? '.good' : ''), c.licence), ' ',
      el('a', { attrs: { href: c.url, target: '_blank', rel: 'noopener' } }, 'source'),
      el('div.muted.small', c.use),
    ))),
    el('p.muted', 'UI glyphs drawn for Kindlewake. Made with TypeScript and Vite.'),
  ]);
  return s.open();
}

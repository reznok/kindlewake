/** General sheets: confirm, bag, relics, menu, settings, Ledger, credits. */
import type { Settings } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { RELICS } from '../data/relics';
import { type UnlockDef, UNLOCKS } from '../data/unlocks';
import { bagSize, canUseField, equip, RELIC_MAX, useItemField } from '../engine/run';
import { memberStats } from '../engine/stats';
import type { App } from './app';
import { CREDITS } from './credits';
import { play } from './audio';
import { btn, el, rich } from './dom';
import { speaker } from './flavour';
import { toEnd, toTitle } from './flow';
import { helpSheet } from './help';
import { showIntro } from './intro';
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
  let note = '';
  /** Heals, Moxie and revives work on the map too: pick who gets it. */
  const useRow = (instId: string, def: string) => {
    const kinds = new Set((ITEMS[def].use?.effects ?? []).map((e) => e.kind));
    const mpOnly = kinds.has('mp') && !kinds.has('heal');
    return el('div.equip-to', el('span.muted.small', 'Use on:'), run.party.map((m) => {
      const st = memberStats(m, run);
      const name = CHARACTERS[m.def].name;
      const stat = mpOnly ? `${m.mp}/${st.mp} MP` : m.hp <= 0 ? 'down' : `${m.hp}/${st.hp}`;
      return btn([speaker(m.def), el('span.muted', ' ' + stat)], () => {
        if (useItemField(run, instId, m.id)) {
          play(kinds.has('revive') && m.hp > 0 && !kinds.has('heal') ? 'buff' : 'heal');
          note = `${name} uses the ${ITEMS[def].name}.`;
          app.log(`Used ${ITEMS[def].name} on ${name}.`);
          app.persist(); render(); app.refresh();
        } else { play('menu'); note = `That would do nothing for ${name} right now.`; render(); }
      }, 'small', { title: `Use on ${name}` });
    }));
  };
  const render = () => {
    s.setTitle(`Bag ${run.bag.length}/${bagSize(run)}`);
    s.fill([
      note ? el('p.bag-note', note) : null,
      run.bag.length ? el('div.shop-list', run.bag.map((i) => {
        const d = ITEMS[i.def];
        const gear = d.kind !== 'consumable';
        return el('div.shop-row',
          el('div.shop-info', el('div', el('b', d.name), i.qty > 1 ? ' x' + i.qty : '', ' ', el('span.kind', d.kind), d.type ? typeTag(d.type) : null, d.power ? el('span.muted', ' power ' + d.power) : null), el('div.muted', d.desc)),
          gear ? el('div.equip-to', run.party.map((m) => btn(CHARACTERS[m.def].name, () => { if (equip(run, m.id, i.id)) { play('confirm'); app.persist(); render(); app.refresh(); } }, 'small', { title: 'Equip on ' + CHARACTERS[m.def].name })))
            : canUseField(i.def) ? useRow(i.id, i.def) : el('span.muted.small', 'Use in battle'),
        );
      })) : el('p.muted', 'Empty.'),
    ]);
  };
  render();
  return s.open();
}

export function openRelics(app: App): Sheet {
  const run = app.run!;
  const s = new Sheet(app, { title: `Keepsakes ${run.relics.length}/${RELIC_MAX}` });
  s.fill([run.relics.length ? el('div.shop-list', run.relics.map((id) => el('div.shop-row', el('div.shop-info', el('b', RELICS[id].name), el('div.muted', RELICS[id].desc))))) : el('p.muted', 'No keepsakes (relics) yet. Elites, bosses and shops have them.')]);
  return s.open();
}

export function openMenu(app: App): Sheet {
  const s = new Sheet(app, { title: 'Menu', cls: 'small' });
  s.fill([el('div.choices',
    btn('Resume', () => s.close(), 'big', { data: { default: '' } }),
    btn('Settings', () => openSettings(app)),
    btn('How to play', () => helpSheet(app)),
    btn('Story so far', () => { s.close(); showIntro(app); }),
    btn('Save and quit to title', () => { app.persist(); toTitle(app); }, 'ghost'),
    app.run ? btn('Abandon this Wake', () => ask(app, 'Abandon this Wake?', 'The Wake ends here and goes in the Ledger.', 'Abandon', () => {
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
      el('p.muted.small', st.timing === 'auto' ? 'Auto: every hit and guard scores Warm (good), never Bright (perfect). No rings.' : st.timing === 'wide' ? 'Wide: windows are twice as long.' : 'Normal: Bright (perfect) within ~80 ms, Warm (good) within ~220 ms.'),
    ]);
  };
  render();
  return s.open();
}

const KIND_LABEL: Record<UnlockDef['kind'], string> = { starter: 'New starter', recruit: 'New recruit', relic: 'Keepsake', kit: 'Starting kit' };

/** An unlock as the Ledger tells it: the name, Nan's line, and what kind of thing it is. */
export function unlockRow(u: UnlockDef): HTMLElement {
  return el('div.unlock.got', el('b', u.name), ' ', el('span.pill.good', KIND_LABEL[u.kind] ?? u.kind), el('div.ledger-line', rich(u.ledger)));
}

/** Show fresh unlocks (after a Wake is abandoned from the title), then carry on. */
export function openUnlocks(app: App, fresh: UnlockDef[], then: () => void): Sheet {
  const s = new Sheet(app, { title: 'The Ledger', cls: 'small', onClose: () => setTimeout(then, 0) });
  s.fill([el('p', 'The Wake goes in the book.'), fresh.length ? [el('h4', 'Unlocked!'), fresh.map(unlockRow)] : null],
    [btn('Carry on', () => { play('confirm'); s.close(); }, 'big', { data: { default: '' } })]);
  return s.open();
}

export function openLedger(app: App): Sheet {
  const l = app.ledger;
  const s = new Sheet(app, { title: 'The Ledger', cls: 'wide' });
  const runs = l.runs.map((r, i) => ({ r, n: i + 1 })).reverse().slice(0, 30);
  s.fill([
    el('h4', 'Unlocks'),
    el('div.unlocks', UNLOCKS.map((u) => (l.unlocks.includes(u.id) ? unlockRow(u) : el('div.unlock', el('b', '???'), el('span.muted', ' ' + u.desc))))),
    el('h4', `Wakes (${l.runs.length})`),
    runs.length ? el('table.runs', el('tr', el('th', 'Wake'), el('th', 'When'), el('th', 'Result'), el('th', 'Act'), el('th', 'Party'), el('th', 'Routed by')),
      runs.map(({ r, n }) => el('tr',
        el('td', 'Wake ' + n),
        el('td', new Date(r.when).toLocaleDateString()),
        el('td', el('span.pill' + (r.result === 'won' ? '.good' : '.bad'), r.result)),
        el('td', String(r.act)),
        el('td', r.party.map((p) => CHARACTERS[p]?.name ?? p).join(', ')),
        el('td', r.killedBy ?? '-'),
      ))) : el('p.muted', 'No Wakes yet. Sign the book.'),
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

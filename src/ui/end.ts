/** End of a run: result, cause, party, stats, last messages. Records the run in the Ledger on arrival. */
import type { Run } from '../core/types';
import { CHARACTERS } from '../data/characters';
import { ITEMS } from '../data/items';
import { recordRun } from '../engine/ledger';
import { saveRun } from '../engine/save';
import type { UnlockDef } from '../data/unlocks';
import type { App, Screen } from './app';
import { music, play } from './audio';
import { btn, el, rich } from './dom';
import { toTitle } from './flow';
import { endQuip, tip } from './flavour';
import { portrait } from './portrait';
import { DEATH_HEADER } from '../data/text';

const recorded = new WeakMap<Run, UnlockDef[]>();

export class EndScreen implements Screen {
  name = 'end';
  root: HTMLElement;

  constructor(private app: App) {
    this.root = el('div.screen.end-screen');
  }

  mount() {
    const run = this.app.run;
    if (!run) { toTitle(this.app); return; }
    if (!run.over) run.over = 'lost';
    let fresh = recorded.get(run);
    if (!fresh) {
      fresh = recordRun(this.app.ledger, run);
      recorded.set(run, fresh);
      this.app.persistLedger();
      saveRun(null);
    }
    const won = run.over === 'won';
    const lb = this.app.lastBlow;
    const consumables = run.bag.filter((i) => ITEMS[i.def]?.kind === 'consumable');
    const st = run.stats;
    const stat = (k: string, v: string | number) => el('div.stat', el('span.k', k), el('span.v', String(v)));
    const done = run.map.nodes.filter((n) => n.done).length;
    const inner = el('div.end-inner',
      el('h1.end-title' + (won ? '.won' : ''), won ? 'Victory!' : DEATH_HEADER),
      won ? el('p', 'The Kindling made it all the way. Remarkable.') : [
        el('p.end-quip', rich(endQuip(st.killedBy))),
        st.killedBy === 'giving up' ? el('p', `The Wake was abandoned in act ${st.deepestAct}.`) : el('p', 'The Kindling was routed by ', el('b', st.killedBy ?? 'misadventure'), ` in act ${st.deepestAct}. The Wake is over.`),
      ],
      lb && !won ? el('p.muted', `Last blow: ${lb.target} took ${lb.dmg} from ${lb.by} with ${lb.hpBefore} HP left.`) : null,
      el('div.end-cols',
        el('div',
          el('h4', 'The Kindling'),
          el('div.member-list', run.party.map((m) => {
            const d = CHARACTERS[m.def];
            return el('div.member-row', portrait(d.sprite, d.name, 32, { ko: m.hp <= 0 }), el('span.li-name', d.name), el('span.muted', 'Lv ' + m.level));
          })),
          el('h4', 'Numbers'),
          el('div.stat-grid', stat('Act', st.deepestAct), stat('Stops', done), stat('Fights', st.fights), stat('Routed', st.kills), stat('Turns', st.turns), stat('Brights', st.perfects), stat('Breaks', st.breaks), stat('Buttons', run.gold)),
          consumables.length ? el('p.muted.small', 'Unused: ' + consumables.map((i) => `${ITEMS[i.def].name} x${i.qty}`).join(', ')) : null,
        ),
        el('div',
          el('h4', 'Last moments'),
          el('ol.last-log', run.log.slice(-12).map((l) => el('li', l))),
        ),
      ),
      fresh.length ? el('div.unlocked', el('h4', 'Unlocked!'), fresh.map((u) => el('div', el('b', u.name), el('span.muted', ' — ' + u.desc)))) : null,
      el('p.muted.small.end-tip', el('b', 'Tip: '), tip()),
      el('div.end-foot', btn('Return to title', () => { play('confirm'); toTitle(this.app); }, 'big', { data: { default: '' } })),
    );
    this.root.replaceChildren(inner);
    music(null);
    requestAnimationFrame(() => { (this.root.querySelector('.end-foot button') as HTMLButtonElement | null)?.focus({ preventScroll: true }); this.root.scrollTop = 0; });
  }
}

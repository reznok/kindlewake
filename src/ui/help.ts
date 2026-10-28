/** The `?` overlay: keys and the timing rule. */
import type { App } from './app';
import { el } from './dom';
import { Sheet } from './sheet';

let open: Sheet | null = null;

export function toggleHelp(app: App) {
  if (open?.isOpen) { open.close(); return; }
  open = helpSheet(app);
}

export function helpSheet(app: App): Sheet {
  const s = new Sheet(app, { title: 'How to play', cls: 'wide', onClose: () => { open = null; } });
  const keys: [string, string][] = [
    ['Arrows / WASD', 'Move around menus, pick targets, scroll the map'],
    ['Enter / Space', 'Confirm; also answers a timing window'],
    ['Esc', 'Back / close'],
    ['1 - 6', 'Battle commands (Attack, Skill, Item, Guard, Swap, Flee) and list entries'],
    ['Tab', 'Cycle targets'],
    ['?', 'This help'],
    ['M', 'Mute or unmute all sound'],
  ];
  s.fill([
    el('h3', 'Timed hits'),
    el('p', 'When you attack, a ring shrinks onto the target. Tap anywhere (or press Space / Enter) the moment it closes.'),
    el('ul.tight',
      el('li', el('b', 'Bright!'), ' (perfect, within about 0.08 s): 125% damage, an extra Break chip on a weak spot.'),
      el('li', el('b', 'Warm'), ' (good, within about 0.22 s): normal damage.'),
      el('li', el('b', 'Cold'), ' (miss): 90% damage. Tapping too early is Cold too.'),
    ),
    el('p', 'Multi-hit skills give one ring per hit. When an enemy attacks, the ring appears on your hero: tap to ', el('b', 'Guard'),
      ' (Warm takes 70% damage; ', el('b', 'Steady!'), ', the perfect guard, takes 50% and restores 5 MP). Shocked heroes cannot guard.'),
    el('p.muted', 'Settings: "Wide" doubles the windows; "Auto" timing always scores Warm with no ring. The Auto button picks commands for you; rings you leave alone score Warm, rings you tap get your real grade. Luck widens windows a little.'),
    el('h3', 'Weak spots'),
    el('p', 'The coloured dots under a foe are the damage types it is weak to (dimmed: it resists them; crossed: immune). Tap a foe to read it. When you pick a target or a skill, ', el('b', 'WEAK'), ' marks a hit on a weak spot.'),
    el('h3', 'BREAK'),
    el('p', 'Hitting a weak spot chips the pips under a foe. At zero it is ', el('b', 'BROKEN'), ': it loses its next turn and takes 150% damage until it recovers.'),
    el('h3', 'Keys'),
    el('table.keys', keys.map(([k, v]) => el('tr', el('td', el('kbd', k)), el('td', v)))),
  ]);
  return s.open();
}

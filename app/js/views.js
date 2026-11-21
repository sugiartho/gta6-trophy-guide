// Views: the progress card, the checklist, the trophy detail pane, the roadmap
// and the missables page. Everything is built from the trophy data, so the
// roadmap and the missable flags always match the official descriptions.

import { KIND_LABELS, GRADE_LABELS, GRADE_ORDER, countByGrade, guideParagraphs, isSpoilerMasked, trophyKind } from './data.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(trophy) {
  return el('span', 'grade-badge grade-' + trophy.grade, GRADE_LABELS[trophy.grade]);
}

function trophyChip(trophy, earned, actions) {
  const chip = el('button', 'chip' + (earned.has(trophy.name) ? ' chip-earned' : ''), '');
  chip.type = 'button';
  chip.append(el('span', 'chip-grade grade-' + trophy.grade, ''));
  chip.append(document.createTextNode(trophy.name));
  chip.addEventListener('click', () => actions.openTrophy(trophy.name));
  return chip;
}

export function renderProgressCard(card, trophies, earned) {
  card.replaceChildren();
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const big = el('p', 'big-count', '');
  big.append(document.createTextNode(done + ' '));
  big.append(el('small', '', '/ ' + total + ' earned'));
  card.append(big);
  card.append(el('p', 'pct', pct + '% of the way to the platinum'));
  const bar = el('div', 'progress-bar', '');
  const fill = el('span', '', '');
  fill.style.width = pct + '%';
  bar.append(fill);
  card.append(bar);
  const counts = countByGrade(trophies, earned);
  const lines = GRADE_ORDER.map((g) => GRADE_LABELS[g] + ': ' + counts[g].done + ' of ' + counts[g].total).join(' · ');
  card.append(el('p', 'grade-counts', lines));
}

function trophyRow(trophy, state, actions) {
  const { earned, spoiler } = state;
  const masked = isSpoilerMasked(trophy, spoiler, earned);
  const row = el('li', 'trophy-row' + (earned.has(trophy.name) ? ' earned' : '') + (state.selected === trophy.name ? ' selected' : ''), '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    actions.toggleEarned(trophy.name);
  });
  row.append(box);
  const body = el('div', '', '');
  body.append(el('div', 'trophy-name', masked ? 'Hidden trophy' : trophy.name));
  if (masked) {
    body.append(el('div', 'trophy-desc', 'Hidden until earned — tick it off to reveal its name and guide.'));
  } else {
    body.append(el('div', 'trophy-desc', trophy.description));
    const tags = el('div', 'trophy-tags', '');
    tags.append(el('span', 'tag', KIND_LABELS[trophyKind(trophy)]));
    if (trophy.missable) tags.append(el('span', 'tag missable', 'Missable'));
    if (trophy.timeSensitive) tags.append(el('span', 'tag watch', 'Start early'));
    if (trophy.hidden) tags.append(el('span', 'tag', 'Hidden on PSN'));
    body.append(tags);
  }
  row.append(body);
  row.append(gradeBadge(trophy));
  row.addEventListener('click', (event) => {
    if (event.target !== box) actions.select(trophy.name);
  });
  return row;
}

export function renderChecklist(view, detail, state, actions) {
  const { trophies, earned, filters } = state;
  const query = filters.q.trim().toLowerCase();
  const shown = trophies.filter((t) => {
    if (filters.kind !== 'all' && trophyKind(t) !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earned.has(t.name)) return false;
    if (filters.status === 'missing' && earned.has(t.name)) return false;
    if (query && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(query)) return false;
    return true;
  });
  view.replaceChildren();
  view.append(el('p', 'list-head', shown.length + ' of ' + trophies.length + ' trophies shown · ' + earned.size + ' earned'));
  if (filters.kind === 'online') {
    view.append(el('p', 'empty-note', 'No online trophies: the official list is entirely offline single-player, so this filter is empty by design. Every trophy on it can be earned without ever playing online.'));
  }
  if (shown.length === 0 && filters.kind !== 'online') {
    view.append(el('p', 'empty-note', 'Nothing matches those filters. Clear the search or widen the kind and grade filters.'));
  }
  const list = el('ul', 'trophy-list', '');
  for (const trophy of shown) list.append(trophyRow(trophy, state, actions));
  view.append(list);
  renderDetail(detail, state, actions);
}

export function renderDetail(detail, state, actions) {
  const { trophies, earned, spoiler } = state;
  detail.replaceChildren();
  const trophy = trophies.find((t) => t.name === state.selected);
  if (!trophy) {
    const hint = el('div', 'detail-card', '');
    hint.append(el('h2', '', 'Read a guide'));
    hint.append(el('p', 'official', 'Pick any trophy on the checklist and its guide opens here: what to do, where, how, when it can be missed, and the sources each fact comes from.'));
    detail.append(hint);
    return;
  }
  const masked = isSpoilerMasked(trophy, spoiler, earned);
  const card = el('div', 'detail-card', '');
  card.append(el('h2', '', masked ? 'Hidden trophy' : trophy.name));
  card.append(el('p', 'official', masked ? 'Its name and description stay hidden until you earn it.' : trophy.description));
  const meta = el('div', 'detail-meta', '');
  meta.append(gradeBadge(trophy));
  meta.append(el('span', 'tag', KIND_LABELS[trophyKind(trophy)]));
  if (trophy.missable) meta.append(el('span', 'tag missable', 'Missable'));
  if (trophy.timeSensitive) meta.append(el('span', 'tag watch', 'Start early — chain has story windows'));
  if (trophy.hidden) meta.append(el('span', 'tag', 'Hidden on PSN until earned'));
  card.append(meta);
  if (masked) {
    card.append(el('p', 'spoiler-mask', 'Turn the spoiler setting off, or tick this trophy earned, to read its guide.'));
  } else {
    const guide = el('div', 'guide-text', '');
    for (const paragraph of guideParagraphs(trophy.guide)) {
      guide.append(el('p', '', paragraph));
    }
    card.append(guide);
    card.append(el('h3', '', 'Sources'));
    const sources = el('ol', 'source-list', '');
    for (const source of trophy.sources || []) {
      const item = el('li', '', '');
      const link = document.createElement('a');
      link.href = source.url;
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      sources.append(item);
    }
    card.append(sources);
  }
  const actionsRow = el('div', 'detail-actions', '');
  const toggle = el('button', '', earned.has(trophy.name) ? 'Mark not earned' : 'Mark earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => actions.toggleEarned(trophy.name));
  actionsRow.append(toggle);
  const next = el('button', 'secondary', 'Next trophy');
  next.type = 'button';
  next.addEventListener('click', () => actions.selectNext(trophy.name));
  actionsRow.append(next);
  card.append(actionsRow);
  detail.append(card);
}

const STEP_TWO_NAMES = [
  'A Long Road', 'The Shootist', 'Top Fun', 'Earn Cash, Not Kudos', 'Cunning Stunts',
  'One Last Thing', "Don't Touch My Deck", 'You WAiNKer!', 'Whip It Good',
  'The Goodtime State', 'Maximum Withdrawal', 'Pest Control', 'Hot Together',
  'Dime on the Dollar', 'Little Boxes', 'On the Spot', 'Master of None',
];

const STEP_THREE_NAMES = [
  'Strangers & Freaks', 'Fair Game', 'Catch Me If You Can', 'Challenging Tank',
  'In The Beginning…', 'Capital Offense', 'Let’s Go Bowling', 'Personal Best',
  'Actions Speak Louder', 'Bad Luck, I Guess', 'The Truth Is Out There', 'Ten Pin',
  'Sneakthief', 'A Classic Blitz Play', 'Treat Yo Self', 'Baited My Tackle',
  'Stick Fiddler', 'Gunslinger', 'Retail Therapy',
];

function byName(trophies, name) {
  return trophies.find((t) => t.name === name);
}

function trophyChipList(trophies, names, earned, actions) {
  const wrap = el('div', 'chip-list', '');
  for (const name of names) {
    const trophy = byName(trophies, name);
    if (trophy) wrap.append(trophyChip(trophy, earned, actions));
  }
  return wrap;
}

export function renderRoadmap(view, detail, state, actions) {
  const { trophies, earned } = state;
  view.replaceChildren();
  detail.replaceChildren();
  const page = el('div', 'page', '');
  page.append(el('h2', '', 'Roadmap to the platinum'));
  page.append(el('p', 'intro', 'One playthrough is enough, and there is no mission replay, so the order below is built to keep you safe: story first with the one missable moment handled in Chapter 1, then the long 100% checklist, then the stranger strands and the cleanup.'));
  const glance = el('div', 'glance', '');
  const glanceItems = [
    ['4 / 10', 'Estimated difficulty (PowerPyx)'],
    ['~200 hours', 'To the platinum'],
    ['5 chapters', 'Story, about 60–80 hours'],
    ['1 missable', 'Positive Mental Attitude, Chapter 1'],
  ];
  for (const [value, label] of glanceItems) {
    const cell = el('div', '', '');
    cell.append(el('b', '', value));
    cell.append(el('span', '', label));
    glance.append(cell);
  }
  page.append(glance);

  const step1 = el('section', 'step', '');
  step1.append(el('p', 'hours', 'Step 1 · 60–80 hours'));
  step1.append(el('h3', '', 'Finish the story, and mind the one missable moment'));
  step1.append(el('p', '', 'Play the five chapters in order. The 100% checklist is not viewable until after the story, but everything you do now already counts toward it, so scan every new vehicle with the WAiNK app and study animals through the binoculars as you go. Keep a save at the start of every chapter, since there is no mission replay. Keep cheats off: they switch trophies and saving off.'));
  step1.append(el('p', '', 'The story trophies:'));
  step1.append(trophyChipList(trophies, trophies.filter((t) => trophyKind(t) === 'story' && t.grade !== 'platinum').map((t) => t.name), earned, actions));
  step1.append(el('p', '', 'Do the Chapter 1 balcony meditation before Chapter 1 ends (see Missables), and start the stranger chains below as soon as they appear — one guide reports their windows follow story progress.'));
  step1.append(trophyChipList(trophies, ['Positive Mental Attitude', 'Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider', 'Supply & Demand', 'Spin On This!'], earned, actions));
  page.append(step1);

  const step2 = el('section', 'step', '');
  step2.append(el('p', 'hours', 'Step 2 · About 100 hours'));
  step2.append(el('h3', '', 'Clear the 100% completion checklist'));
  step2.append(el('p', '', 'After the credits, open Progress, then Stats, then 100% Completion. The checklist has 35 lines; the biggest are 42 of 42 shooting range gold medals, 10 of 13 race challenge golds, 30 of 40 unique races won, 42 of 42 drone time trials, 200 of 277 vehicle models, 100 of 255 animals, 15 card sets, 100 WAiNK locations, 33 underwater discoveries, 100 Cocaine Flamingos, 39 gang operations, 22 bank jobs, 7 payday loan jobs, 8 bank vault robberies, 70 of 80 challenges, 300 of 397 stunts and 15 of 18 meditations. Only 70 of the 80 challenges are needed, so skip the nastiest ten.'));
  step2.append(el('p', '', 'The trophies this step finishes:'));
  step2.append(trophyChipList(trophies, STEP_TWO_NAMES, earned, actions));
  page.append(step2);

  const step3 = el('section', 'step', '');
  step3.append(el('p', 'hours', 'Step 3 · 10–20 hours'));
  step3.append(el('h3', '', 'Stranger strands and cleanup'));
  step3.append(el('p', '', 'The checklist does not ask for the stranger strands, so they are usually what is left, together with any stray trophies that did not pop on their own. Finish the eight strands for the silver, then work through what remains, easiest first.'));
  step3.append(trophyChipList(trophies, STEP_THREE_NAMES, earned, actions));
  step3.append(el('p', 'checkline', 'When the last trophy pops, the platinum — Vice Got a Price! — follows at once.'));
  page.append(step3);
  view.append(page);
}

export function renderMissables(view, detail, state, actions) {
  const { trophies, earned } = state;
  view.replaceChildren();
  detail.replaceChildren();
  const page = el('div', 'page', '');
  page.append(el('h2', '', 'Missables'));
  page.append(el('p', 'intro', 'Good news first: almost nothing on this list can be missed. There is free roam after the story, no mission replay is needed for any trophy, and every quest giver tied to a trophy is still around in free roam. One trophy is the exception, and five chains deserve an early start.'));
  const missable = trophies.find((t) => t.missable);
  if (missable) {
    const warning = el('section', 'warning', '');
    warning.append(el('h3', '', 'The one trophy you can miss: ' + missable.name));
    warning.append(el('p', '', 'Meditate at every spot across Leonida. The first meditation happens on the balcony at Jason’s house in Chapter 1, after the mission Down to Earth: find Lucia in the kitchen in the morning, follow her out, and accept. It disappears for good once Chapter 1 ends, and the guides have not confirmed whether the trophy needs it — so do it.'));
    const open = el('button', '', 'Read the full guide');
    open.type = 'button';
    open.addEventListener('click', () => actions.openTrophy(missable.name));
    warning.append(open);
    page.append(warning);
  }
  const watch = el('section', 'note-card', '');
  watch.append(el('h3', '', 'Start early: stranger chains with story windows'));
  watch.append(el('p', '', 'One guide reports that the stranger chains behind these five trophies have windows tied to story progress. Begin each chain as soon as it appears; the quest givers stay available in free roam afterwards, so a chain you started can be finished later.'));
  watch.append(trophyChipList(trophies, ['Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider', 'Supply & Demand', 'Spin On This!'], earned, actions));
  page.append(watch);
  const safe = el('section', 'note-card', '');
  safe.append(el('h3', '', 'Nothing else can lock you out'));
  safe.append(el('p', '', 'Optional missions expire and a few fences disappear for good, but none of that touches trophies or the 100% checklist. All trophy-related characters return in free roam. Two things do matter for the whole run: keep cheats off, because they disable trophies and saving, and keep a save at the start of each chapter, because the game has no mission replay.'));
  page.append(safe);
  view.append(page);
}

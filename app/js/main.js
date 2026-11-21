// Trophy Trail boot: load the data, restore saved progress and settings,
// wire the toolbar, and route between the checklist, the roadmap and the
// missables page with the location hash.

import { loadTrophies } from './data.js';
import { loadProgress, saveProgress, loadSettings, saveSettings, exportProgress, importProgressFile } from './store.js';
import { renderProgressCard, renderChecklist, renderRoadmap, renderMissables } from './views.js';

const ROUTES = ['checklist', 'roadmap', 'missables'];

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(hash) ? hash : 'checklist';
}

function bootApp() {
  const view = document.getElementById('view');
  const detail = document.getElementById('detail');
  const layout = document.querySelector('.layout');
  const progressCard = document.getElementById('progressCard');
  const spoilerToggle = document.getElementById('spoilerToggle');
  const searchInput = document.getElementById('search');
  const kindFilter = document.getElementById('kindFilter');
  const gradeFilter = document.getElementById('gradeFilter');
  const statusFilter = document.getElementById('statusFilter');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');

  const state = {
    trophies: [],
    earned: loadProgress(),
    spoiler: loadSettings().spoiler,
    filters: { q: '', kind: 'all', grade: 'all', status: 'all' },
    selected: null,
    route: currentRoute(),
  };

  const actions = {
    toggleEarned(name) {
      if (state.earned.has(name)) state.earned.delete(name);
      else state.earned.add(name);
      saveProgress(state.earned);
      renderAll();
    },
    select(name) {
      state.selected = name;
      renderAll();
    },
    selectNext(name) {
      const index = state.trophies.findIndex((t) => t.name === name);
      const next = state.trophies[(index + 1) % state.trophies.length];
      state.selected = next.name;
      renderAll();
    },
    openTrophy(name) {
      state.selected = name;
      if (location.hash !== '#/checklist') location.hash = '#/checklist';
      state.route = 'checklist';
      renderAll();
      window.scrollTo(0, 0);
    },
  };

  function renderAll() {
    renderProgressCard(progressCard, state.trophies, state.earned);
    document.querySelectorAll('.tabs a').forEach((tab) => {
      if (tab.dataset.tab === state.route) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    const isChecklist = state.route === 'checklist';
    layout.classList.toggle('single', !isChecklist);
    spoilerToggle.checked = state.spoiler;
    if (state.route === 'roadmap') renderRoadmap(view, detail, state, actions);
    else if (state.route === 'missables') renderMissables(view, detail, state, actions);
    else renderChecklist(view, detail, state, actions);
  }

  searchInput.addEventListener('input', () => {
    state.filters.q = searchInput.value;
    renderAll();
  });
  kindFilter.addEventListener('change', () => {
    state.filters.kind = kindFilter.value;
    renderAll();
  });
  gradeFilter.addEventListener('change', () => {
    state.filters.grade = gradeFilter.value;
    renderAll();
  });
  statusFilter.addEventListener('change', () => {
    state.filters.status = statusFilter.value;
    renderAll();
  });
  spoilerToggle.addEventListener('change', () => {
    state.spoiler = spoilerToggle.checked;
    saveSettings({ spoiler: state.spoiler });
    renderAll();
  });
  exportBtn.addEventListener('click', () => {
    exportProgress(state.earned, { spoiler: state.spoiler });
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    try {
      const imported = await importProgressFile(file);
      state.earned = new Set([...imported.earned].filter((name) => state.trophies.some((t) => t.name === name)));
      state.spoiler = imported.spoiler;
      saveProgress(state.earned);
      saveSettings({ spoiler: state.spoiler });
      renderAll();
    } catch {
      alert('That file could not be read as a Trophy Trail progress export.');
    }
    importFile.value = '';
  });
  window.addEventListener('hashchange', () => {
    state.route = currentRoute();
    renderAll();
  });

  return loadTrophies()
    .then((trophies) => {
      state.trophies = trophies;
      document.getElementById('dataNote').textContent =
        'Data: ' + trophies.length + ' trophies · grades ' +
        trophies.filter((t) => t.grade === 'platinum').length + ' platinum, ' +
        trophies.filter((t) => t.grade === 'gold').length + ' gold, ' +
        trophies.filter((t) => t.grade === 'silver').length + ' silver, ' +
        trophies.filter((t) => t.grade === 'bronze').length + ' bronze · ' +
        trophies.filter((t) => t.hidden).length + ' hidden on PlayStation · 0 online.';
      renderAll();
    })
    .catch(() => {
      view.replaceChildren();
      const note = document.createElement('p');
      note.className = 'empty-note';
      note.textContent = 'The trophy list could not be loaded. Check that data/trophies.json sits beside this page and reload.';
      view.append(note);
    });
}

bootApp();

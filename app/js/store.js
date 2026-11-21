// Saved progress and settings: localStorage only, with export to a file and import back.

const PROGRESS_KEY = 'trophy-trail-progress-v1';
const SETTINGS_KEY = 'trophy-trail-settings-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const names = JSON.parse(raw);
    if (!Array.isArray(names)) return new Set();
    return new Set(names.filter((n) => typeof n === 'string'));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { spoiler: true };
    const parsed = JSON.parse(raw);
    return { spoiler: parsed.spoiler !== false };
  } catch {
    return { spoiler: true };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Download the earned list (and the spoiler setting) as a JSON file.
export function exportProgress(earned, settings) {
  const payload = {
    app: 'trophy-trail',
    version: 1,
    exportedAt: new Date().toISOString(),
    spoiler: settings.spoiler,
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'trophy-trail-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Read a progress file back. Returns { earned, spoiler } or throws on bad input.
export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file does not hold a progress list.');
  const earned = new Set(names.filter((n) => typeof n === 'string'));
  const spoiler = Array.isArray(parsed) ? true : parsed.spoiler !== false;
  return { earned, spoiler };
}

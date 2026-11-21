// Trophy data: loading the official list and the rules that shape what the reader sees.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

// Load the trophy list (a file under app/, fetched at run time, never over the network).
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load the trophy list.');
  const doc = await response.json();
  const list = Array.isArray(doc) ? doc : doc.trophies;
  return list.slice().sort((a, b) => a.id - b.id);
}

export function trophyKind(trophy) {
  return trophy.kind || 'activities';
}

// A trophy is spoiler-masked while the spoiler setting is on, it is hidden on
// PlayStation, and the reader has not earned it yet.
export function isSpoilerMasked(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden === true && !earned.has(trophy.name);
}

export function countByGrade(trophies, earned) {
  const out = {};
  for (const grade of GRADE_ORDER) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    out[grade] = { total, done };
  }
  return out;
}

// Split guide text into sentences, then group them into readable paragraphs.
export function guideParagraphs(guide) {
  const sentences = guide.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(' '));
  }
  return paragraphs;
}

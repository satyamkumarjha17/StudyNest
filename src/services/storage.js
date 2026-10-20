// Single gateway to LocalStorage. Same key/format as before, so existing user data keeps working.
export const KEY = 'studyos:v1';
export const emptyState = { subjects: [], notes: [], cards: [], attempts: [], exams: [], tasks: [], reviews: [], seeded: false };
const LISTS = ['subjects', 'notes', 'cards', 'attempts', 'exams', 'tasks', 'reviews'];
let lastJson = null; export let loadIssue = null;
const sanitize = (d) => { const o = structuredClone(emptyState); for (const k of LISTS) if (Array.isArray(d[k])) o[k] = d[k].filter((x) => x && typeof x === 'object'); o.seeded = !!d.seeded; return o; };
export function load() {
  loadIssue = null;
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { loadIssue = 'Browser storage is unavailable. Changes will not be saved.'; return structuredClone(emptyState); }
  if (!raw) return structuredClone(emptyState);
  try { const d = JSON.parse(raw); if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('bad'); lastJson = raw; return sanitize(d); }
  catch { try { localStorage.setItem(KEY + ':corrupt', raw); } catch { /* ignore */ } loadIssue = 'Saved data was unreadable. A copy was kept under "studyos:v1:corrupt".'; return structuredClone(emptyState); }
}
/** Returns false if the write failed. Skips identical writes. */
export function save(state) {
  const j = JSON.stringify(state); if (j === lastJson) return true;
  try { localStorage.setItem(KEY, j); lastJson = j; return true; } catch { return false; }
}
export function clear() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } lastJson = null; }

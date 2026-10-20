export const SCHEMA = 1;
export const COLS = ['subjects', 'notes', 'cards', 'attempts', 'exams', 'tasks', 'reviews'];
const REQ = { subjects: ['name'], notes: ['title', 'content'], cards: ['question', 'answer'], exams: ['title', 'date'], tasks: ['title', 'deadline'], attempts: ['topic'], reviews: ['type'] };
const REFS = ['notes', 'cards', 'exams', 'tasks'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const buildExport = (state) => ({ app: 'StudyOS', schemaVersion: SCHEMA, exportedAt: new Date().toISOString(), data: Object.fromEntries(COLS.map((c) => [c, state[c] || []])) });
export function parseImport(text) {
  let o; try { o = JSON.parse(text); } catch { return { error: 'This file is not valid JSON.' }; }
  if (!o || o.app !== 'StudyOS' || typeof o.data !== 'object' || !o.data) return { error: 'This is not a StudyNest backup file.' };
  if (o.schemaVersion !== SCHEMA) return { error: `Unsupported backup version ${o.schemaVersion}. This app reads version ${SCHEMA}.` };
  const data = {};
  for (const c of COLS) {
    const arr = o.data[c] ?? [];
    if (!Array.isArray(arr)) return { error: `"${c}" must be a list.` };
    for (const [i, r] of arr.entries()) {
      const bad = (m) => ({ error: `${c}[${i}]: ${m}` });
      if (!r || typeof r !== 'object' || Array.isArray(r)) return bad('not a record');
      if (c !== 'reviews' && (typeof r.id !== 'string' || !r.id)) return bad('missing id');
      for (const f of REQ[c]) if (typeof r[f] !== 'string' || !r[f].trim()) return bad(`missing ${f}`);
      if (c === 'exams' && !DATE.test(r.date)) return bad('invalid date');
      if (c === 'tasks' && !DATE.test(r.deadline)) return bad('invalid deadline');
      if (c === 'attempts' && !(Number.isFinite(r.pct) && r.pct >= 0 && r.pct <= 100)) return bad('invalid pct');
      if (c === 'reviews' && !Number.isFinite(r.t)) return bad('invalid timestamp');
    }
    data[c] = arr;
  }
  return { data };
}
const key = (c, r) => (c === 'reviews' ? `${r.t}|${r.type}` : r.id);
const fixRefs = (s) => { const ids = new Set(s.subjects.map((x) => x.id)); for (const c of REFS) s[c] = s[c].map((r) => (r.subjectId && !ids.has(r.subjectId) ? { ...r, subjectId: '' } : r)); return s; };
/** Merge: records already present (same id) are kept; only new ids are added. */
export function mergeData(state, data) {
  const out = { ...state }; const added = {}; const skipped = {};
  for (const c of COLS) {
    const seen = new Set((state[c] || []).map((r) => key(c, r))); const fresh = [];
    for (const r of data[c]) { const k = key(c, r); if (!seen.has(k)) { seen.add(k); fresh.push(r); } }
    out[c] = [...(state[c] || []), ...fresh]; added[c] = fresh.length; skipped[c] = data[c].length - fresh.length;
  }
  return { state: fixRefs(out), added, skipped };
}
export const replaceData = (state, data) => fixRefs({ ...state, ...Object.fromEntries(COLS.map((c) => [c, data[c]])) });

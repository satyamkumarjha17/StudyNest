export const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const validQ = (q) => q && q.q && Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.answer) && q.options[q.answer] !== undefined;
export function score(questions, answers) {
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  return { correct, total: questions.length, pct: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
}
const sentences = (t) => t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.length > 30 && s.length < 260);
const words = (t) => [...new Set(t.match(/[A-Za-z][A-Za-z-]{4,}/g) || [])];
/* HEURISTIC cloze generator (not AI): blanks the longest term in "X is/are/uses..." sentences,
   distractors come from other long words in the same text. */
export function generateFromText(text, max = 5) {
  const pool = words(text); const out = [];
  for (const s of sentences(text)) {
    if (!/\b(is|are|uses|means|allows|returns|stores)\b/i.test(s)) continue;
    const key = (s.match(/[A-Za-z][A-Za-z-]{4,}/g) || []).sort((a, b) => b.length - a.length)[0];
    const distract = shuffle(pool.filter((w) => w.toLowerCase() !== key?.toLowerCase())).slice(0, 3);
    if (!key || distract.length < 3) continue;
    const options = shuffle([key, ...distract]);
    out.push({ q: s.replace(key, '_____'), options, answer: options.indexOf(key), explanation: `Source: "${s}"`, difficulty: 'medium', generated: true });
    if (out.length >= max) break;
  }
  return out;
}
export const summarize = (text, n = 3) => {
  const ss = sentences(text); const low = text.toLowerCase();
  const sc = (s) => (s.toLowerCase().match(/[a-z-]{5,}/g) || []).reduce((a, w) => a + low.split(w).length - 1, 0) / s.length;
  return [...ss].sort((a, b) => sc(b) - sc(a)).slice(0, n).sort((a, b) => ss.indexOf(a) - ss.indexOf(b));
};

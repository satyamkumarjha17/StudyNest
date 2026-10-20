import test from 'node:test'; import assert from 'node:assert/strict';
import { schedule, isDue } from '../src/utils/srs.js';
import { buildExport, parseImport, mergeData, replaceData } from '../src/utils/backup.js';
import { score, validQ, generateFromText } from '../src/utils/quiz.js';
const T0 = 1_700_000_000_000, DAY = 864e5;
test('srs: good x3 gives 1, 3, 8 day intervals', () => {
  let c = {}; const out = [];
  for (let i = 0; i < 3; i++) { c = schedule(c, 'good', T0); out.push(c.interval); }
  assert.deepEqual(out, [1, 3, 8]); assert.equal(c.due, T0 + 8 * DAY);
});
test('srs: again resets, counts lapses, becomes difficult at 3', () => {
  let c = schedule(schedule({}, 'good', T0), 'again', T0); assert.equal(c.reps, 0); assert.equal(c.due, T0); assert.equal(c.lapses, 1);
  c = schedule(schedule(c, 'again', T0), 'again', T0); assert.equal(c.status, 'difficult');
});
test('srs: ease floor, invalid grade rejected, new card is due', () => {
  let c = {}; for (let i = 0; i < 20; i++) c = schedule(c, 'hard', T0); assert.ok(c.ease >= 1.3);
  assert.throws(() => schedule({}, 'bogus')); assert.ok(isDue({})); assert.ok(!isDue({ due: Date.now() + DAY }));
});
const good = { app: 'StudyOS', schemaVersion: 1, data: { subjects: [{ id: 's1', name: 'A' }], notes: [{ id: 'n1', title: 'T', content: 'C', subjectId: 'gone' }], exams: [{ id: 'e1', title: 'E', date: '2026-12-01' }] } };
test('backup: rejects malformed, wrong app, wrong version, bad records', () => {
  assert.ok(parseImport('{nope').error); assert.ok(parseImport('{"a":1}').error);
  assert.ok(parseImport(JSON.stringify({ ...good, schemaVersion: 9 })).error);
  assert.ok(parseImport(JSON.stringify({ ...good, data: { subjects: [{ name: 'x' }] } })).error);
  assert.ok(parseImport(JSON.stringify({ ...good, data: { exams: [{ id: 'e', title: 't', date: 'tomorrow' }] } })).error);
});
test('backup: roundtrip, merge dedupes, orphan subject refs cleared', () => {
  const r = parseImport(JSON.stringify(good)); assert.ok(r.data);
  const base = { subjects: [{ id: 's1', name: 'Mine' }], notes: [], cards: [], attempts: [], exams: [], tasks: [], reviews: [] };
  const m = mergeData(base, r.data); assert.equal(m.state.subjects.length, 1); assert.equal(m.state.subjects[0].name, 'Mine'); assert.equal(m.skipped.subjects, 1);
  assert.equal(m.state.notes[0].subjectId, '');
  assert.equal(replaceData(base, r.data).subjects[0].name, 'A');
  assert.equal(parseImport(JSON.stringify(buildExport(base))).data.subjects.length, 1);
});
test('quiz: scoring, validation, generator, empty input', () => {
  const qs = [{ q: 'a', options: ['x', 'y'], answer: 1 }, { q: 'b', options: ['x', 'y'], answer: 0 }];
  assert.deepEqual(score(qs, [1, 1]), { correct: 1, total: 2, pct: 50 }); assert.equal(score([], []).pct, 0);
  assert.ok(!validQ({ q: 'a', options: ['x'], answer: 0 }));
  assert.deepEqual(generateFromText(''), []);
});

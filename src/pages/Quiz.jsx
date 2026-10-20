import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { QUESTION_BANK } from '../data/sampleQuestions.js';
import { shuffle, validQ, score, generateFromText } from '../utils/quiz.js';
import { Empty, Bar } from '../components/ui.jsx';
const PER_Q = 45; // seconds per question
export default function Quiz() {
  const { state: s, add, log } = useStore();
  const [cfg, setCfg] = useState({ topic: 'JavaScript', diff: 'all', n: 5, timed: false });
  const [run, setRun] = useState(null); const [msg, setMsg] = useState(''); const [left, setLeft] = useState(0);
  const deadline = useRef(0); const submitted = useRef(false); const runRef = useRef(null); runRef.current = run;
  const topics = [...new Set(QUESTION_BANK.map((q) => q.topic))];
  const active = !!run && !run.done;
  const start = () => {
    const pool = (cfg.topic === '__notes' ? generateFromText(s.notes.map((n) => n.content).join(' '), 20) : QUESTION_BANK.filter((q) => q.topic === cfg.topic && (cfg.diff === 'all' || q.difficulty === cfg.diff))).filter(validQ);
    if (!pool.length) return setMsg('No questions match. Change the topic or difficulty, or add notes with full sentences.');
    const qs = shuffle(pool).slice(0, Math.min(20, Math.max(1, cfg.n))); setMsg('');
    deadline.current = Date.now() + qs.length * PER_Q * 1000; submitted.current = false; setLeft(qs.length * PER_Q);
    setRun({ qs, ans: [], i: 0, done: false });
  };
  // Single guarded submit: manual finish and timeout both land here, so an attempt is saved once.
  const finish = () => {
    const r = runRef.current; if (submitted.current || !r || r.done) return; submitted.current = true;
    const sc = score(r.qs, r.ans); add('attempts', { t: Date.now(), topic: cfg.topic === '__notes' ? 'My notes' : cfg.topic, ...sc, qs: r.qs, ans: r.ans, timedOut: cfg.timed && Date.now() >= deadline.current });
    log('Completed a quiz'); setRun({ ...r, done: true, sc });
  };
  // Elapsed-time based: derived from a fixed deadline, so throttled tabs or late callbacks cannot drift.
  useEffect(() => {
    if (!active || !cfg.timed) return;
    const tick = () => { const l = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setLeft(l); if (l === 0) finish(); };
    tick(); const id = setInterval(tick, 500); document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [active, cfg.timed]);
  const review = (a) => setRun({ qs: a.qs, ans: a.ans, i: 0, done: true, sc: { correct: a.correct, total: a.total, pct: a.pct }, past: true });
  if (!run) return (<div className="card"><h3>Start a quiz</h3>
    <label>Topic<select value={cfg.topic} onChange={(e) => setCfg({ ...cfg, topic: e.target.value })}>{topics.map((t) => <option key={t}>{t}</option>)}<option value="__notes">My notes (heuristic generator, not AI)</option></select></label>
    <label>Difficulty<select value={cfg.diff} onChange={(e) => setCfg({ ...cfg, diff: e.target.value })}>{['all', 'easy', 'medium', 'hard'].map((d) => <option key={d}>{d}</option>)}</select></label>
    <label>Questions (1 to 20)<input type="number" min="1" max="20" value={cfg.n} onChange={(e) => setCfg({ ...cfg, n: +e.target.value || 1 })} /></label>
    <label className="row"><input type="checkbox" checked={cfg.timed} onChange={(e) => setCfg({ ...cfg, timed: e.target.checked })} /> Timer ({PER_Q}s per question)</label>
    <button className="btn" onClick={start}>Start quiz</button>{msg && <p className="err" role="alert">{msg}</p>}
    <h3>Past attempts</h3>{s.attempts.length ? s.attempts.slice(0, 10).map((a) => <div className="row" key={a.id}><span>{a.topic}: {a.correct}/{a.total} ({a.pct}%) <small>{new Date(a.t).toLocaleString()}{a.timedOut ? ' · timed out' : ''}</small></span>{Array.isArray(a.qs) && <button className="btn ghost sm" onClick={() => review(a)}>Review</button>}</div>) : <Empty text="No attempts yet." />}</div>);
  if (run.done) return (<div className="card"><h3>{run.past ? 'Past attempt' : 'Score'}: {run.sc.correct}/{run.sc.total} ({run.sc.pct}%)</h3>
    {run.qs.map((q, i) => <div key={i} className={'rev ' + (run.ans[i] === q.answer ? 'ok' : 'bad')}><b>{q.q}</b><p>Your answer: {q.options[run.ans[i]] ?? 'skipped'}. Correct: {q.options[q.answer]}.</p><small>{q.explanation}</small></div>)}
    <button className="btn" onClick={() => setRun(null)}>Back</button></div>);
  const q = run.qs[run.i]; const pick = (k) => setRun({ ...run, ans: Object.assign([...run.ans], { [run.i]: k }) });
  return (<div className="card"><div className="row"><small>Question {run.i + 1} of {run.qs.length}</small>{cfg.timed && <small role="timer">⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</small>}</div><Bar pct={((run.i + 1) / run.qs.length) * 100} />
    <h3>{q.q}</h3>{q.options.map((o, k) => <button key={k} aria-pressed={run.ans[run.i] === k} className={'opt ' + (run.ans[run.i] === k ? 'sel' : '')} onClick={() => pick(k)}>{o}</button>)}
    <div className="row"><button className="btn ghost" disabled={!run.i} onClick={() => setRun({ ...run, i: run.i - 1 })}>Previous</button>
      {run.i < run.qs.length - 1 ? <button className="btn" onClick={() => setRun({ ...run, i: run.i + 1 })}>Next</button> : <button className="btn" onClick={finish}>Finish</button>}</div></div>);
}

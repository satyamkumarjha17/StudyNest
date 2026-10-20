import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Stat, Empty, Bar, Confirm } from '../components/ui.jsx';
import Backup from '../components/Backup.jsx';
import { isDue } from '../utils/srs.js';
import { daysUntil, today, fmt, localDate } from '../utils/dates.js';
export default function Dashboard() {
  const { state: s, loadDemo, reset, notify } = useStore(); const [ask, setAsk] = useState(false);
  const avg = s.attempts.length ? Math.round(s.attempts.reduce((a, x) => a + x.pct, 0) / s.attempts.length) : null;
  const days = [...Array(7)].map((_, i) => { const d = localDate(Date.now() - (6 - i) * 864e5); return { d: d.slice(5), n: s.reviews.filter((r) => localDate(r.t) === d).length }; });
  const max = Math.max(1, ...days.map((x) => x.n));
  const exams = s.exams.filter((e) => e.status !== 'done' && daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const tasks = s.tasks.filter((t) => t.status !== 'done' && t.deadline <= today());
  const recent = [...s.attempts.map((a) => ({ t: a.t, x: `Quiz on ${a.topic}: ${a.pct}%` })), ...s.reviews.map((r) => ({ t: r.t, x: r.type }))].sort((a, b) => b.t - a.t).slice(0, 5);
  return (<>
    <p className="muted">Welcome back. Today is {new Date().toLocaleDateString([], { dateStyle: 'full' })}.</p>
    <div className="grid stats"><Stat label="Subjects" value={s.subjects.length} /><Stat label="Notes" value={s.notes.length} /><Stat label="Cards due" value={s.cards.filter(isDue).length} /><Stat label="Quizzes done" value={s.attempts.length} /><Stat label="Average score" value={avg === null ? '–' : avg + '%'} /></div>
    <div className="grid two">
      <section className="card"><h3>Reviews this week</h3>{days.map((x) => <div className="row" key={x.d}><small style={{ width: 44 }}>{x.d}</small><Bar pct={(x.n / max) * 100} /><small>{x.n}</small></div>)}</section>
      <section className="card"><h3>Upcoming exams</h3>{exams.length ? exams.map((e) => <p key={e.id}>{e.title} <b>{daysUntil(e.date)}d</b></p>) : <Empty text="No upcoming exams." />}</section>
      <section className="card"><h3>Due and overdue tasks</h3>{tasks.length ? tasks.map((t) => <p key={t.id}>{t.title} <small>{t.deadline}</small></p>) : <Empty text="Nothing due today." />}</section>
      <section className="card"><h3>Recent activity</h3>{recent.length ? recent.map((r, i) => <p key={i}>{r.x} <small>{fmt(r.t)}</small></p>) : <Empty text="Review a flashcard or take a quiz to see activity." />}</section>
    </div>
    <Backup />
    <div className="row"><button className="btn ghost" onClick={() => { loadDemo(); notify('Demo data loaded'); }}>Load demo data</button><button className="btn ghost" onClick={() => setAsk(true)}>Reset all data</button></div>
    {ask && <Confirm message="This erases every subject, note, card and result." onNo={() => setAsk(false)} onYes={() => { reset(); setAsk(false); notify('Data reset'); }} />}
  </>);
}

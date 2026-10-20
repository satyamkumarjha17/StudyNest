import { useStore } from '../context/StoreContext.jsx';
import { Stat, Empty, Bar } from '../components/ui.jsx';
export default function Analytics() {
  const { state: s } = useStore(); const A = s.attempts;
  const by = {}; A.forEach((a) => { (by[a.topic] ||= []).push(a.pct); });
  const rows = Object.entries(by).map(([t, v]) => ({ t, avg: Math.round(v.reduce((x, y) => x + y, 0) / v.length), n: v.length })).sort((a, b) => a.avg - b.avg);
  const days = new Set(s.reviews.map((r) => new Date(r.t).toDateString())).size;
  return (<>
    <div className="grid stats"><Stat label="Quizzes completed" value={A.length} /><Stat label="Tasks completed" value={s.tasks.filter((t) => t.status === 'done').length} /><Stat label="Flashcards reviewed" value={s.reviews.filter((r) => r.type.startsWith('Reviewed')).length} /><Stat label="Active study days" value={days} /></div>
    <div className="grid two">
      <section className="card"><h3>Quiz scores over time</h3>{A.length < 2 ? <Empty text="Complete at least two quizzes to see a trend." /> : [...A].reverse().map((a) => <div className="row" key={a.id}><small style={{ width: 90 }}>{new Date(a.t).toLocaleDateString()}</small><Bar pct={a.pct} /><small>{a.pct}%</small></div>)}</section>
      <section className="card"><h3>Average by subject</h3>{rows.length ? rows.map((r) => <div className="row" key={r.t}><small style={{ width: 110 }}>{r.t}</small><Bar pct={r.avg} /><small>{r.avg}%</small></div>) : <Empty text="No quiz results yet." />}</section>
      <section className="card"><h3>Weak subjects (under 60%)</h3>{rows.filter((r) => r.avg < 60).length ? rows.filter((r) => r.avg < 60).map((r) => <p key={r.t}>{r.t}: {r.avg}% over {r.n} quizzes</p>) : <Empty text={rows.length ? 'No weak subjects. Keep going.' : 'Take quizzes to find weak spots.'} />}</section>
    </div></>);
}

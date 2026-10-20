import { useStore } from '../context/StoreContext.jsx';
import { Crud } from '../components/ui.jsx';
import { daysUntil, today } from '../utils/dates.js';
const PRI = [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];
export default function Planner() {
  const { state: s, update } = useStore();
  const subj = [['', 'No subject'], ...s.subjects.map((x) => [x.id, x.name])];
  const label = (e) => { const d = daysUntil(e.date); return e.status === 'done' ? 'Completed' : d < 0 ? `Overdue by ${-d}d` : d === 0 ? 'Today' : `${d} days left`; };
  return (<>
    <h3>Exams</h3>
    <Crud coll="exams" label="Exam" items={[...s.exams].sort((a, b) => a.date.localeCompare(b.date))}
      fields={[{ k: 'title', label: 'Title', required: true }, { k: 'subjectId', label: 'Subject', options: subj }, { k: 'date', label: 'Date', type: 'date', required: true }, { k: 'time', label: 'Time (optional)', type: 'time' }, { k: 'priority', label: 'Priority', options: PRI }, { k: 'status', label: 'Preparation', options: [['not-started', 'Not started'], ['in-progress', 'In progress'], ['ready', 'Ready'], ['done', 'Completed']] }]}
      render={(e) => <><h3>{e.title}</h3><p><b>{label(e)}</b> · {e.date} {e.time} · {e.priority} priority · {e.status}</p></>} />
    <h3>Study tasks</h3>
    <Crud coll="tasks" label="Task" items={[...s.tasks].sort((a, b) => a.deadline.localeCompare(b.deadline))}
      fields={[{ k: 'title', label: 'Title', required: true }, { k: 'subjectId', label: 'Subject', options: subj }, { k: 'deadline', label: 'Deadline', type: 'date', required: true }, { k: 'priority', label: 'Priority', options: PRI }]}
      extra={(t) => <button className="btn ghost sm" onClick={() => update('tasks', t.id, { status: t.status === 'done' ? 'open' : 'done' })}>{t.status === 'done' ? 'Reopen' : 'Mark done'}</button>}
      render={(t) => <><h3 style={{ textDecoration: t.status === 'done' ? 'line-through' : '' }}>{t.title}</h3><p>{t.status !== 'done' && t.deadline < today() ? <b className="err">Overdue · </b> : t.deadline === today() && t.status !== 'done' ? <b>Due today · </b> : ''}{t.deadline} · {t.priority}</p></>} />
  </>);
}

import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Crud } from '../components/ui.jsx';
import { fmt } from '../utils/dates.js';
const fmtText = (t = '') => t.split('\n').map((l, i) => <p key={i}>{l.startsWith('- ') ? '• ' + l.slice(2) : l.split(/\*\*(.+?)\*\*/g).map((p, j) => (j % 2 ? <b key={j}>{p}</b> : p))}</p>);
export function Subjects() {
  const { state: s } = useStore(); const [q, setQ] = useState('');
  const items = s.subjects.filter((x) => (x.name + x.description).toLowerCase().includes(q.toLowerCase()));
  return <Crud coll="subjects" label="Subject" items={items} toolbar={<input placeholder="Search subjects" value={q} onChange={(e) => setQ(e.target.value)} />}
    fields={[{ k: 'name', label: 'Name', required: true }, { k: 'description', label: 'Description' }, { k: 'color', label: 'Colour', type: 'color', def: '#6d5efc' }]}
    render={(x) => <><h3><span className="dot" style={{ background: x.color }} />{x.name}</h3><p className="muted">{x.description}</p><small>{s.notes.filter((n) => n.subjectId === x.id).length} notes · {s.cards.filter((c) => c.subjectId === x.id).length} cards</small></>} />;
}
export function Notes() {
  const { state: s, update } = useStore(); const [q, setQ] = useState(''); const [sub, setSub] = useState(''); const [sort, setSort] = useState('updatedAt');
  const items = s.notes.filter((n) => (!sub || n.subjectId === sub) && (n.title + n.content).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.pinned === true) - (a.pinned === true) || b[sort] - a[sort]);
  const name = (id) => s.subjects.find((x) => x.id === id)?.name || 'No subject';
  return <Crud coll="notes" label="Note" items={items}
    toolbar={<><input placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} /><select value={sub} onChange={(e) => setSub(e.target.value)}><option value="">All subjects</option>{s.subjects.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="updatedAt">Last updated</option><option value="createdAt">Created</option></select></>}
    fields={[{ k: 'title', label: 'Title', required: true }, { k: 'subjectId', label: 'Subject', options: [['', 'No subject'], ...s.subjects.map((x) => [x.id, x.name])] }, { k: 'content', label: 'Content (supports **bold** and "- " lists)', area: true, required: true }]}
    extra={(n) => <button className="btn ghost sm" onClick={() => update('notes', n.id, { pinned: !n.pinned })}>{n.pinned ? 'Unpin' : 'Pin'}</button>}
    render={(n) => <><h3>{n.pinned && '📌 '}{n.title}</h3><small>{name(n.subjectId)} · created {fmt(n.createdAt)} · edited {fmt(n.updatedAt)}</small>{fmtText(n.content)}</>} />;
}

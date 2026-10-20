import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Crud, Empty } from '../components/ui.jsx';
import { schedule, isDue } from '../utils/srs.js';
export default function Flashcards() {
  const { state: s, update, log } = useStore(); const [mode, setMode] = useState('manage'); const [flip, setFlip] = useState(false);
  const due = s.cards.filter(isDue); const c = due[0];
  const grade = (g) => { const { id, ...next } = schedule(c, g); update('cards', id, next); log(`Reviewed card (${g})`); setFlip(false); };
  return (<>
    <div className="row"><button className={'btn ' + (mode === 'manage' ? '' : 'ghost')} onClick={() => setMode('manage')}>Cards ({s.cards.length})</button><button className={'btn ' + (mode === 'review' ? '' : 'ghost')} onClick={() => setMode('review')}>Review due ({due.length})</button>
      <small>Mastered: {s.cards.filter((x) => x.status === 'mastered').length} · Difficult: {s.cards.filter((x) => x.status === 'difficult').length}</small></div>
    {mode === 'manage' ? <Crud coll="cards" label="Card" items={s.cards}
      fields={[{ k: 'subjectId', label: 'Subject', options: [['', 'No subject'], ...s.subjects.map((x) => [x.id, x.name])] }, { k: 'question', label: 'Question', required: true }, { k: 'answer', label: 'Answer', required: true }]}
      render={(x) => <><h3>{x.question}</h3><small>{x.status || 'new'} · next: {x.due ? new Date(x.due).toLocaleDateString() : 'now'} · {x.history?.length || 0} reviews</small></>} />
      : !c ? <Empty text={s.cards.length ? 'All caught up. No cards are due.' : 'Add cards first.'} /> :
        <div className="card review"><small>{due.length} due</small><h3 onClick={() => setFlip(!flip)} style={{ cursor: 'pointer' }}>{flip ? c.answer : c.question}</h3>
          {!flip ? <button className="btn" onClick={() => setFlip(true)}>Show answer</button> : <div className="row">{['again', 'hard', 'good', 'easy'].map((g) => <button key={g} className="btn ghost" onClick={() => grade(g)}>{g[0].toUpperCase() + g.slice(1)}</button>)}</div>}</div>}
  </>);
}

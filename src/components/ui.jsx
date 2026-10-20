import { useEffect, useId, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
export function Modal({ title, onClose, children }) {
  const ref = useRef(null); const id = useId(); const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const prev = document.activeElement; const el = ref.current;
    const items = () => [...el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
    (items()[0] || el).focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab') return;
      const f = items(); if (!f.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, []);
  return (<div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1}><h3 id={id}>{title}</h3>{children}</div></div>);
}
export const Confirm = ({ message, onYes, onNo }) => (
  <Modal title="Are you sure?" onClose={onNo}><p>{message}</p><div className="row end"><button className="btn ghost" onClick={onNo}>Cancel</button><button className="btn danger" onClick={onYes}>Delete</button></div></Modal>
);
export const Empty = ({ text, action }) => <div className="empty"><p>{text}</p>{action}</div>;
export const Stat = ({ label, value }) => <div className="card stat"><b>{value}</b><span>{label}</span></div>;
export const Bar = ({ pct, color }) => <div className="bar"><i style={{ width: pct + '%', background: color }} /></div>;
/* Generic CRUD list: fields drive both form and validation. Reused by subjects, notes, exams, tasks. */
export function Crud({ coll, label, fields, items, render, extra, toolbar }) {
  const { add, update, remove, notify } = useStore();
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null); const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    const er = {}; fields.forEach((f) => { if (f.required && !String(d[f.k] || '').trim()) er[f.k] = `${f.label} is required`; });
    setErr(er); if (Object.keys(er).length) return;
    edit.id ? update(coll, edit.id, d) : add(coll, d); notify(`${label} saved`); setEdit(null);
  };
  return (<>
    <div className="row"><button className="btn" onClick={() => { setErr({}); setEdit({}); }}>New {label.toLowerCase()}</button>{toolbar}</div>
    {items.length === 0 ? <Empty text={`No ${label.toLowerCase()}s yet. Create your first one.`} /> :
      <div className="grid">{items.map((it) => (
        <div className="card" key={it.id}>{render(it)}
          <div className="row">{extra?.(it)}<button className="btn ghost sm" onClick={() => { setErr({}); setEdit(it); }}>Edit</button><button className="btn ghost sm" onClick={() => setDel(it)}>Delete</button></div>
        </div>))}</div>}
    {edit && <Modal title={`${edit.id ? 'Edit' : 'New'} ${label.toLowerCase()}`} onClose={() => setEdit(null)}>
      <form onSubmit={submit} noValidate>{fields.map((f) => (
        <label key={f.k}>{f.label}
          {f.options ? <select name={f.k} defaultValue={edit[f.k] ?? f.options[0]?.[0] ?? ''}>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            : f.area ? <textarea name={f.k} rows="7" defaultValue={edit[f.k] || ''} />
            : <input name={f.k} type={f.type || 'text'} defaultValue={edit[f.k] ?? f.def ?? ''} />}
          {err[f.k] && <em className="err">{err[f.k]}</em>}</label>))}
        <div className="row end"><button type="button" className="btn ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn">Save</button></div></form></Modal>}
    {del && <Confirm message={`Delete "${del.title || del.name}"? This cannot be undone.`} onNo={() => setDel(null)} onYes={() => { remove(coll, del.id); notify(`${label} deleted`); setDel(null); }} />}
  </>);
}

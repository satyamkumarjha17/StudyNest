import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Modal } from './ui.jsx';
import { buildExport, parseImport, mergeData, COLS } from '../utils/backup.js';
import { localDate } from '../utils/dates.js';
const MAX = 5 * 1024 * 1024;
export default function Backup() {
  const { state, notify, importData } = useStore(); const [pending, setPending] = useState(null); const [error, setError] = useState('');
  const exportJson = () => {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(buildExport(state), null, 2)], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: `studynest-backup-${localDate()}.json` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Backup downloaded');
    } catch { notify('Export failed'); }
  };
  const pick = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; setError(''); if (!f) return;
    if (f.size > MAX) return setError('File is larger than 5 MB.');
    try { const r = await parseImport(await f.text()); r.error ? setError(r.error) : setPending(r.data); } catch { setError('Could not read the file.'); }
  };
  const apply = (mode) => { importData(mode, pending); notify(mode === 'replace' ? 'Data replaced from backup' : 'Backup merged'); setPending(null); };
  const m = pending && mergeData(state, pending);
  return (<section className="card"><h3>Backup</h3>
    <p className="muted">Exports subjects, notes, flashcards, quiz attempts, exams, tasks and review history. Preferences are not stored.</p>
    <div className="row"><button className="btn ghost" onClick={exportJson}>Export JSON</button>
      <label className="btn ghost" style={{ margin: 0 }}>Import JSON<input type="file" accept="application/json,.json" onChange={pick} style={{ display: 'none' }} /></label></div>
    {error && <p className="err" role="alert">{error}</p>}
    {pending && <Modal title="Import backup" onClose={() => setPending(null)}>
      <p>Merge adds only records whose ids are new and keeps your existing ones.</p>
      <ul>{COLS.map((c) => <li key={c}>{c}: {pending[c].length} in file, {m.added[c]} new, {m.skipped[c]} already here</li>)}</ul>
      <p className="err">Replace deletes everything currently stored and uses the file instead.</p>
      <div className="row end"><button className="btn ghost" onClick={() => setPending(null)}>Cancel</button><button className="btn danger" onClick={() => apply('replace')}>Replace all</button><button className="btn" onClick={() => apply('merge')}>Merge</button></div></Modal>}
  </section>);
}

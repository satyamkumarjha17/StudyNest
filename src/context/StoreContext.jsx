import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { load, save, clear, emptyState, KEY, loadIssue } from '../services/storage.js';
import { SAMPLE } from '../data/sampleQuestions.js';
import { mergeData, replaceData } from '../utils/backup.js';
import { uid } from '../utils/dates.js';
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
export function StoreProvider({ children }) {
  const [state, setState] = useState(load); // lazy init: reads storage once
  const [toast, setToast] = useState(null);
  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 2400); }, []);
  const failed = useRef(false);
  useEffect(() => { const ok = save(state); if (!ok && !failed.current) notify('Could not save to browser storage. Export a backup.'); failed.current = !ok; }, [state, notify]);
  useEffect(() => { if (loadIssue) notify(loadIssue); }, [notify]);
  useEffect(() => { const f = (e) => { if (e.key === KEY) setState(load()); }; window.addEventListener('storage', f); return () => window.removeEventListener('storage', f); }, []);
  const api = {
    state, notify,
    add: (c, item) => setState((s) => ({ ...s, [c]: [{ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), ...item }, ...s[c]] })),
    update: (c, id, patch) => setState((s) => ({ ...s, [c]: s[c].map((x) => (x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x)) })),
    remove: (c, id) => setState((s) => ({ ...s, [c]: s[c].filter((x) => x.id !== id) })),
    log: (type) => setState((s) => ({ ...s, reviews: [...s.reviews, { t: Date.now(), type }] })),
    importData: (mode, data) => setState((s) => (mode === 'replace' ? replaceData(s, data) : mergeData(s, data).state)),
    loadDemo: () => setState({ ...emptyState, ...structuredClone(SAMPLE), seeded: true }),
    reset: () => { clear(); setState(structuredClone(emptyState)); },
  };
  return <Ctx.Provider value={api}>{children}{toast && <div className="toast" role="status">{toast}</div>}</Ctx.Provider>;
}

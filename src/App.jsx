import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import { Subjects, Notes } from './pages/Library.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Quiz from './pages/Quiz.jsx';
import Planner from './pages/Planner.jsx';
import Analytics from './pages/Analytics.jsx';
import Assistant from './pages/Assistant.jsx';
const NAV = [['/', 'Dashboard'], ['/subjects', 'Subjects'], ['/notes', 'Notes'], ['/flashcards', 'Flashcards'], ['/quiz', 'Quiz'], ['/planner', 'Planner'], ['/analytics', 'Analytics'], ['/assistant', 'Assistant']];
export default function App() {
  const { pathname } = useLocation(); const [open, setOpen] = useState(false);
  const title = NAV.find(([p]) => p === pathname)?.[1] || 'StudyNest';
  useEffect(() => { setOpen(false); document.title = `${title} · StudyNest`; }, [pathname, title]);
  useEffect(() => { if (!open) return; const k = (e) => e.key === 'Escape' && setOpen(false); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open]);
  return (<div className="shell">
    <aside><h1>StudyNest</h1>
      <button className="menu-btn" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      <nav id="nav" aria-label="Main" className={open ? 'open' : ''}>{NAV.map(([p, l]) => <NavLink key={p} to={p} end={p === '/'}>{l}</NavLink>)}</nav></aside>
    <main><header><h2>{title}</h2></header>
      <Routes><Route path="/" element={<Dashboard />} /><Route path="/subjects" element={<Subjects />} /><Route path="/notes" element={<Notes />} /><Route path="/flashcards" element={<Flashcards />} /><Route path="/quiz" element={<Quiz />} /><Route path="/planner" element={<Planner />} /><Route path="/analytics" element={<Analytics />} /><Route path="/assistant" element={<Assistant />} /><Route path="*" element={<p className="empty">Page not found.</p>} /></Routes>
    </main></div>);
}

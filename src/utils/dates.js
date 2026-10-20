export const today = () => localDate();
export const daysUntil = (d) => Math.ceil((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);
export const fmt = (t) => new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const pad = (n) => String(n).padStart(2, '0');
/** Local-time YYYY-MM-DD (toISOString is UTC and is wrong near midnight in IST). */
export const localDate = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

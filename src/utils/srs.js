/* Spaced repetition (simplified SM-2).
   Grades -> quality q: again=0, hard=3, good=4, easy=5.
   q<3  : lapse. reps reset, card due immediately.
   else : interval = 1 day, then 3 days, then previous*ease (hard x0.8, easy x1.3).
   ease += 0.1-(5-q)*(0.08+(5-q)*0.02), floored at 1.3.
   status: learning | mastered (interval>=21d) | difficult (3+ lapses). */
const Q = { again: 0, hard: 3, good: 4, easy: 5 };
export function schedule(card, grade, now = Date.now()) {
  if (!Object.hasOwn(Q, grade)) throw new RangeError(`Invalid grade: ${grade}`);
  const q = Q[grade];
  let { ease = 2.5, interval = 0, reps = 0, lapses = 0 } = card;
  if (q < 3) { reps = 0; interval = 0; lapses++; }
  else {
    reps++;
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease * (grade === 'hard' ? 0.8 : grade === 'easy' ? 1.3 : 1)) || 1;
  }
  interval = Math.max(0, interval);
  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const status = lapses >= 3 ? 'difficult' : interval >= 21 ? 'mastered' : 'learning';
  return { ...card, ease, interval, reps, lapses, status, due: now + interval * 864e5, history: [...(card.history || []), { t: now, grade }] };
}
export const isDue = (c) => !Number.isFinite(c.due) || c.due <= Date.now();

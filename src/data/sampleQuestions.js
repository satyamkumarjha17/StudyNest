const q = (topic, difficulty, text, options, answer, explanation) => ({ topic, difficulty, q: text, options, answer, explanation });
export const QUESTION_BANK = [
  q('JavaScript', 'easy', 'Which keyword declares a block-scoped variable that can be reassigned?', ['var', 'let', 'const', 'static'], 1, '`let` is block-scoped and reassignable.'),
  q('JavaScript', 'medium', 'What does `typeof null` return?', ['"null"', '"undefined"', '"object"', '"number"'], 2, 'A long-standing quirk: null reports "object".'),
  q('JavaScript', 'hard', 'Which array method returns a single accumulated value?', ['map', 'filter', 'reduce', 'flatMap'], 2, '`reduce` folds the array into one value.'),
  q('React', 'easy', 'Which Hook adds state to a function component?', ['useRef', 'useState', 'useMemo', 'useId'], 1, '`useState` returns [value, setter].'),
  q('React', 'medium', 'When does useEffect(fn, []) run?', ['Every render', 'Only after first render', 'Never', 'Before render'], 1, 'An empty dependency array runs once after mount.'),
  q('React', 'hard', 'Why are keys needed in lists?', ['Styling', 'Stable identity for reconciliation', 'Faster CSS', 'Event binding'], 1, 'Keys let React match elements between renders.'),
  q('Data Structures', 'easy', 'Which structure is LIFO?', ['Queue', 'Stack', 'Heap', 'Graph'], 1, 'A stack pops the most recently pushed item.'),
  q('Data Structures', 'medium', 'Average lookup time of a hash table?', ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], 2, 'Hashing gives constant average-case lookup.'),
  q('Data Structures', 'hard', 'Worst-case height of an unbalanced BST with n nodes?', ['log n', 'n', 'sqrt n', 'n^2'], 1, 'Sorted insertions create a linked-list shape.'),
  q('DBMS', 'easy', 'Which SQL clause filters rows?', ['ORDER BY', 'GROUP BY', 'WHERE', 'LIMIT'], 2, 'WHERE filters rows before grouping.'),
  q('DBMS', 'medium', 'What does the I in ACID stand for?', ['Integrity', 'Isolation', 'Indexing', 'Inheritance'], 1, 'Isolation: concurrent transactions do not interfere.'),
];
export const SAMPLE = {
  subjects: [{ id: 's1', name: 'Data Structures', description: 'Arrays to graphs', color: '#6d5efc' }, { id: 's2', name: 'React', description: 'Hooks and routing', color: '#0ea5e9' }],
  notes: [{ id: 'n1', title: 'Stack vs Queue', subjectId: 's1', content: 'A stack is LIFO. A queue is FIFO. A deque allows insertion at both ends.', pinned: true, createdAt: Date.now(), updatedAt: Date.now() }],
  cards: [{ id: 'c1', subjectId: 's2', question: 'What does useEffect do?', answer: 'Runs side effects after render.', status: 'new' }],
};

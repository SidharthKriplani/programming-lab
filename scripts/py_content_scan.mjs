// py_content_scan — PyLab content gate (PYLAB-BUILD-SPEC §6.2). Flags jargon-in-prompt,
// <2 hints, missing debrief/signature, and stretch problems without beforeWriting.
// Exits non-zero on any GATE failure. Usage: node scripts/py_content_scan.mjs
import { pyLabProblems } from '../src/data/pyLabProblems.js';

// technique names that must NOT appear in a prompt — the choice of technique is the test
const JARGON = [
  'groupby', 'pivot_table', 'pivot', 'transform', 'merge', 'apply', 'vectorize',
  'defaultdict', 'setdefault', 'reset_index', 'dropna', 'itertools', 'comprehension',
  'np.where', 'concat', 'unstack',
];

const fails = [];
for (const p of pyLabProblems) {
  const prompt = (p.prompt || '').toLowerCase();
  for (const j of JARGON) {
    if (prompt.includes(j)) fails.push(p.id + ' :: jargon in prompt: "' + j + '"');
  }
  if ((p.hints || []).length < 2) fails.push(p.id + ' :: <2 hints');
  if (!p.debrief) fails.push(p.id + ' :: missing debrief');
  if (!p.signature) fails.push(p.id + ' :: missing signature');
  if (!p.solution) fails.push(p.id + ' :: missing solution');
  if (p.difficulty === 'stretch' && !p.beforeWriting) fails.push(p.id + ' :: stretch without beforeWriting');
}

console.log('PyLab content-scan: ' + pyLabProblems.length + ' problems, ' + fails.length + ' GATE failures');
for (const f of fails) console.log('  GATE ' + f);
process.exit(fails.length ? 1 : 0);

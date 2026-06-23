// pyLabTraps — the Trap Museum's data layer (PYLAB-VISION §3, Phase 3). Pure aggregation,
// no new content: it flattens every methods[].isTrap across the bank into one gallery —
// the catalogue of "code that passes review and fails in production." Each trap is already
// verified (verify_py_methods proved it RUNS and DIVERGES from the canonical), so the museum
// is just a lens over gated truth.
import { pyLabProblems, PYLAB_TOPICS } from './pyLabProblems.js';

export const pyLabTraps = pyLabProblems.flatMap(p =>
  (p.methods || [])
    .filter(m => m.isTrap)
    .map(m => ({
      problemId: p.id,
      problemTitle: p.title,
      topic: p.topic,
      topicLabel: PYLAB_TOPICS[p.topic] || p.topic,
      difficulty: p.difficulty,
      name: m.name,
      code: m.code,
      tradeoff: m.tradeoff || '',
      breaksWhen: m.breaksWhen || '',
      detection: m.detectionSignature || '',
    }))
);

// topics that actually have traps, in bank order (for the filter)
export const trapTopicOrder = [...new Set(pyLabTraps.map(t => t.topic))];

export const trapCount = pyLabTraps.length;

export default pyLabTraps;

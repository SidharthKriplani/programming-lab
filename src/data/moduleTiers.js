// src/data/moduleTiers.js — the family S/A/B interview-frequency tiering, PL
// edition. Derived from the seniority level (pyLabMeta.levelOf) rather than a
// hand-curated map: systems -> S, judgment -> A, correctness/fluency -> B.
// Per-problem OVERRIDES below win — populate as real interview-frequency data
// arrives (family convention: never guess a tier upgrade without a receipt).

import { levelOf } from './pyLabMeta.js';

const OVERRIDES = {
  // problemId: 'S' | 'A' | 'B'
};

export function tierOf(problem) {
  const id = typeof problem === 'string' ? problem : problem?.id;
  if (id && OVERRIDES[id]) return OVERRIDES[id];
  if (typeof problem === 'string') return 'B';
  const level = levelOf(problem);
  if (level === 'systems') return 'S';
  if (level === 'judgment') return 'A';
  return 'B';
}

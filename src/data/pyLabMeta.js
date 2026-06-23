// pyLabMeta — the two-axis tagging for PyLab (PYLAB-VISION §1): ROLE × SENIORITY.
// roles[] and level are DERIVED from a problem's topic + difficulty + judgment layer,
// and can be OVERRIDDEN per-problem (set `roles` / `level` on the problem object).
// One source of truth so the filters, the readiness dashboard, and the diagnostic agree.

export const ROLES = {
  SWE: 'Software Engineer',
  DS:  'Data Scientist',
  MLE: 'ML Engineer',
  AIE: 'AI Engineer',
  DA:  'Data Analyst',
  BA:  'Business Analyst',
  PA:  'Product Analyst',
};
export const ROLE_ORDER = ['SWE', 'DS', 'MLE', 'AIE', 'DA', 'BA', 'PA'];

// The seniority ladder (the depth dial). Order matters — index = depth.
export const LEVELS = {
  fluency:     { label: 'Fluency',     sub: 'syntax, the ops, predict the output' },
  correctness: { label: 'Correctness', sub: 'edge cases, the obvious trap' },
  judgment:    { label: 'Judgment',    sub: 'many valid methods, the right call' },
  systems:     { label: 'Systems',     sub: 'scale, craft, lead the call' },
};
export const LEVEL_ORDER = ['fluency', 'correctness', 'judgment', 'systems'];

// Which roles a topic is most relevant to (the default mapping; override per-problem).
const TOPIC_ROLES = {
  'pandas-groupby':  ['DS', 'DA', 'PA', 'BA', 'MLE', 'AIE'],
  'pandas-merge':    ['DS', 'DA', 'PA', 'BA', 'MLE', 'AIE'],
  'pandas-reshape':  ['DS', 'DA', 'PA', 'BA'],
  'pandas-window':   ['DS', 'DA', 'PA', 'MLE', 'AIE'],
  'numpy-vectorize': ['MLE', 'AIE', 'DS'],
  'python-core':     ['SWE', 'MLE', 'AIE', 'DS'],
  'idioms':          ['SWE', 'MLE', 'AIE', 'DS', 'DA'],
  'oop':             ['SWE', 'MLE', 'AIE'],
};

export function rolesOf(p) {
  if (Array.isArray(p.roles) && p.roles.length) return p.roles;
  return TOPIC_ROLES[p.topic] || ['SWE'];
}

// Derive the seniority level from difficulty + the judgment layer:
//   single-method warmup        -> fluency
//   single-method core/stretch  -> correctness
//   multi-method + a trap        -> judgment
//   stretch + multi-method       -> systems
export function levelOf(p) {
  if (p.level) return p.level;
  const methods = p.methods || [];
  const multi = methods.length >= 2;
  const hasTrap = methods.some(m => m.isTrap);
  if (p.difficulty === 'stretch' && multi) return 'systems';
  if (multi && hasTrap) return 'judgment';
  if (p.difficulty === 'warmup') return 'fluency';
  return 'correctness';
}

// Does a problem match a chosen role ('all' = any) and level ('all' = any)?
export function matchesRoleLevel(p, role, level) {
  if (role !== 'all' && !rolesOf(p).includes(role)) return false;
  if (level !== 'all' && levelOf(p) !== level) return false;
  return true;
}

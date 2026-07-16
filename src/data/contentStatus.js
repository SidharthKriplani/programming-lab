// src/data/contentStatus.js — 3B1B content-pipeline ledger for programming-lab.
// Family recordkeeping law (see BreakLabs CLAUDE.md, Recordkeeping rules 4-5):
//   THE one queryable answer to "has module X passed the writer+audit pipeline".
//   status: 'unclassified' | 'pending' | 'in_progress' | 'clean'
//   A 'clean' entry REQUIRES a real verifiedBy receipt — 3 parts: (1) timestamp of
//   the actual check, (2) a re-runnable command/grep, (3) what it specifically
//   confirmed. A 'clean' without a receipt is worse than 'unclassified'.
//   Never set clean from memory of a prior summary — only in the same edit where
//   it was personally verified. Enforced by scripts/validate-content-status.mjs
//   (npm run check:content-status).
//
// Seeded 2026-07-16 from src/data/knowModules.js (all 20 KNOW module ids,
// extracted programmatically — enumerate-before-claim). No PL module has had a
// narrative pass yet, so every entry starts unclassified. PyLab PROBLEMS are
// governed by their own gates (audit_py / verify_py_methods / py_content_scan)
// and are deliberately NOT tracked here.

export const CONTENT_STATUS = {
  'know-names-are-bindings': { status: 'unclassified' },
  'know-generators-are-lazy': { status: 'unclassified' },
  'know-legb-and-closures': { status: 'unclassified' },
  'know-truthiness-or-default': { status: 'unclassified' },
  'know-dunder-data-model': { status: 'unclassified' },
  'know-mutable-default-args': { status: 'unclassified' },
  'know-is-vs-equals': { status: 'unclassified' },
  'know-bool-len-fallback': { status: 'unclassified' },
  'know-operator-dispatch': { status: 'unclassified' },
  'know-args-kwargs-binding': { status: 'unclassified' },
  'know-decorators-from-scratch': { status: 'unclassified' },
  'know-functools-wraps': { status: 'unclassified' },
  'know-iterator-protocol': { status: 'unclassified' },
  'know-context-manager': { status: 'unclassified' },
  'know-eq-hash-contract': { status: 'unclassified' },
  'know-dataclass-generates': { status: 'unclassified' },
  'know-property-descriptor': { status: 'unclassified' },
  'know-eafp-vs-lbyl': { status: 'unclassified' },
  'know-hints-dont-enforce': { status: 'unclassified' },
  'know-import-runs-once': { status: 'unclassified' },
};

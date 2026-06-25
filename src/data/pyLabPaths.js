// pyLabPaths — structured learning tracks for PyLab.
//
// Two tiers per scope:
//   '3day' — intermediate: 3 focused days, covers the core patterns a DA/DS/PA
//            needs for take-home screens. Assumes zero prior depth in the world.
//   '7day' — advanced:     7 days, adds edge cases, judgment layer, senior-bar
//            problems. Exits at a level where you can handle most interview problems.
//
// Two scopes:
//   per-world — tight focus on one world; days map directly to that world's concepts.
//   lab-wide  — cross-world track; each day may pull from multiple worlds.
//
// STATUS: SKELETON ONLY — problemIds and conceptSlugs are empty everywhere.
// Fill in after the problem bank has enough coverage (ramp batches 2+).
// Do NOT import or wire this anywhere until the content is there.
//
// DATA-FILE SYNTAX: single quotes only; escape apostrophes as \'; no backticks.

// ── Per-world paths ──────────────────────────────────────────────────────────

export const WORLD_PATHS = {

  'python-core': {
    '3day': {
      id: 'python-core-3day',
      label: '3 Days to Intermediate',
      tagline: 'Variables to functions — the floor every screen tests',
      days: [
        { day: 1, title: 'Day 1 — Data & Control', focus: 'int/float quirks, string ops, list mutation, if/for/while', problemIds: [], conceptSlugs: ['int-float', 'string-ops', 'list-mutation', 'for-loop'] },
        { day: 2, title: 'Day 2 — Collections & Comprehensions', focus: 'dict, set, tuple, list/dict comprehensions, enumerate/zip', problemIds: [], conceptSlugs: ['dict-ops', 'set-ops', 'comprehensions', 'enumerate-zip'] },
        { day: 3, title: 'Day 3 — Functions & Scope', focus: 'args/kwargs, default mutable trap, closures, lambda', problemIds: [], conceptSlugs: ['args-kwargs', 'mutable-default', 'closures', 'lambda'] },
      ],
    },
    '7day': {
      id: 'python-core-7day',
      label: '7 Days to Advanced',
      tagline: 'From beginner syntax to senior-bar Python',
      days: [
        { day: 1, title: 'Day 1 — Primitives & Truthiness', focus: 'numbers, strings, booleans, truthiness traps', problemIds: [], conceptSlugs: ['int-float', 'string-ops', 'truthiness'] },
        { day: 2, title: 'Day 2 — Collections Deep Cut', focus: 'list mutation, dict edge cases, set ops, tuple unpacking', problemIds: [], conceptSlugs: ['list-mutation', 'dict-ops', 'set-ops', 'unpacking'] },
        { day: 3, title: 'Day 3 — Iteration Patterns', focus: 'for/while, enumerate, zip, comprehensions, generator expressions', problemIds: [], conceptSlugs: ['for-loop', 'enumerate-zip', 'comprehensions', 'genexpr'] },
        { day: 4, title: 'Day 4 — Functions & Scope', focus: 'args/kwargs, mutable default, closures, scope rules (LEGB)', problemIds: [], conceptSlugs: ['args-kwargs', 'mutable-default', 'closures', 'legb'] },
        { day: 5, title: 'Day 5 — Sorting, Counter & defaultdict', focus: 'sort vs sorted, key=, Counter, defaultdict, most-common patterns', problemIds: [], conceptSlugs: ['sort-key', 'counter', 'defaultdict'] },
        { day: 6, title: 'Day 6 — Error Handling & File I/O', focus: 'try/except/finally, context manager, reading/writing files', problemIds: [], conceptSlugs: ['try-except', 'context-manager', 'file-io'] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'mixed patterns: write a real solve() using all prior concepts', problemIds: [], conceptSlugs: [] },
      ],
    },
  },

  'pandas-numpy': {
    '3day': {
      id: 'pandas-numpy-3day',
      label: '3 Days to Intermediate',
      tagline: 'Core pandas ops from scratch — DA take-home floor',
      days: [
        { day: 1, title: 'Day 1 — Series & Single-Col Ops', focus: 'mean/sum/count, boolean filter, NaN handling', problemIds: [], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna'] },
        { day: 2, title: 'Day 2 — groupby & Aggregation', focus: 'groupby+mean, groupby+NaN groups, multi-agg', problemIds: [], conceptSlugs: ['groupby-mean', 'groupby-count-nan', 'groupby-multi-agg'] },
        { day: 3, title: 'Day 3 — Merge & Reshape', focus: 'inner merge, left merge+NaN, pivot_table basics', problemIds: [], conceptSlugs: ['simple-merge', 'left-merge', 'pivot-table'] },
      ],
    },
    '7day': {
      id: 'pandas-numpy-7day',
      label: '7 Days to Advanced',
      tagline: 'The 20 patterns in 90% of take-homes — plus the traps',
      days: [
        { day: 1, title: 'Day 1 — Foundations', focus: 'Series, single-col agg, boolean filter, NaN filter', problemIds: [], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna'] },
        { day: 2, title: 'Day 2 — groupby Core', focus: 'groupby+mean, NaN group trap, multi-agg', problemIds: [], conceptSlugs: ['groupby-mean', 'groupby-count-nan', 'groupby-multi-agg'] },
        { day: 3, title: 'Day 3 — Merge Patterns', focus: 'inner merge, duplicate fan-out trap, left merge + NaN', problemIds: [], conceptSlugs: ['simple-merge', 'merge-duplicates', 'left-merge'] },
        { day: 4, title: 'Day 4 — Reshape & Window', focus: 'pivot_table, melt/stack, rolling window, shift', problemIds: [], conceptSlugs: ['pivot-table', 'melt', 'rolling-window', 'shift'] },
        { day: 5, title: 'Day 5 — numpy Vectorize', focus: 'broadcasting rules, ufuncs vs apply, where, advanced indexing', problemIds: [], conceptSlugs: ['numpy-broadcast', 'numpy-where', 'numpy-index'] },
        { day: 6, title: 'Day 6 — Judgment Layer', focus: 'which method + which trap: the dial problems', problemIds: [], conceptSlugs: [] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'end-to-end: load → clean → aggregate → answer', problemIds: [], conceptSlugs: [] },
      ],
    },
  },

  'dsa-patterns': {
    '3day': {
      id: 'dsa-patterns-3day',
      label: '3 Days to Intermediate',
      tagline: 'Hashing + two-pointer + sliding window — the easy-floor patterns',
      days: [
        { day: 1, title: 'Day 1 — Hashing', focus: 'frequency map, two-sum, anagram, group-by-hash', problemIds: [], conceptSlugs: ['hash-frequency', 'two-sum', 'anagram'] },
        { day: 2, title: 'Day 2 — Two Pointer', focus: 'sorted array, palindrome, container with most water', problemIds: [], conceptSlugs: ['two-pointer', 'palindrome'] },
        { day: 3, title: 'Day 3 — Sliding Window', focus: 'fixed window, variable window, max subarray', problemIds: [], conceptSlugs: ['sliding-fixed', 'sliding-variable'] },
      ],
    },
    '7day': {
      id: 'dsa-patterns-7day',
      label: '7 Days to Advanced',
      tagline: '8 patterns — from easy to medium, no contest grind',
      days: [
        { day: 1, title: 'Day 1 — Hashing', focus: 'frequency map, two-sum, anagram, group-by-hash', problemIds: [], conceptSlugs: ['hash-frequency', 'two-sum'] },
        { day: 2, title: 'Day 2 — Two Pointer + Sliding Window', focus: 'sorted two-pointer, palindrome, fixed/variable window', problemIds: [], conceptSlugs: ['two-pointer', 'sliding-fixed', 'sliding-variable'] },
        { day: 3, title: 'Day 3 — Binary Search', focus: 'sorted array search, search-insert, rotated array', problemIds: [], conceptSlugs: ['binary-search', 'binary-rotated'] },
        { day: 4, title: 'Day 4 — Heap / Priority Queue', focus: 'k-largest, merge k sorted, running median', problemIds: [], conceptSlugs: ['heap-k-largest', 'heap-merge'] },
        { day: 5, title: 'Day 5 — DFS / BFS', focus: 'grid traversal, connected components, level-order', problemIds: [], conceptSlugs: ['dfs-grid', 'bfs-level'] },
        { day: 6, title: 'Day 6 — Intervals + Prefix Sum', focus: 'merge intervals, insert interval, subarray sum', problemIds: [], conceptSlugs: ['merge-intervals', 'prefix-sum'] },
        { day: 7, title: 'Day 7 — DP Foundations', focus: '1D DP: climb stairs, coin change, house robber', problemIds: [], conceptSlugs: ['dp-1d'] },
      ],
    },
  },

  'python-internals': {
    '3day': {
      id: 'python-internals-3day',
      label: '3 Days to Intermediate',
      tagline: 'The gotchas that separate mid from senior',
      days: [
        { day: 1, title: 'Day 1 — Identity & Mutation', focus: 'is vs ==, copy vs reference, mutable default', problemIds: [], conceptSlugs: ['is-vs-eq', 'mutable-default'] },
        { day: 2, title: 'Day 2 — Closures & Scope', focus: 'LEGB, late-binding, the loop closure trap', problemIds: [], conceptSlugs: ['closures', 'late-binding'] },
        { day: 3, title: 'Day 3 — Generators & Iterators', focus: 'yield, lazy evaluation, generator vs list RAM cost', problemIds: [], conceptSlugs: ['generators', 'iterator-protocol'] },
      ],
    },
    '7day': {
      id: 'python-internals-7day',
      label: '7 Days to Advanced',
      tagline: 'Every layer Python hides from you — made visible',
      days: [
        { day: 1, title: 'Day 1 — Memory Model', focus: 'id(), reference counting, interning, is vs ==', problemIds: [], conceptSlugs: ['memory-model', 'is-vs-eq'] },
        { day: 2, title: 'Day 2 — Mutation & Copying', focus: 'shallow vs deep copy, mutable default, aliasing', problemIds: [], conceptSlugs: ['shallow-copy', 'mutable-default', 'aliasing'] },
        { day: 3, title: 'Day 3 — Closures & Scope', focus: 'LEGB, late-binding trap, nonlocal, the loop closure', problemIds: [], conceptSlugs: ['closures', 'late-binding', 'nonlocal'] },
        { day: 4, title: 'Day 4 — Generators & Iteration', focus: 'yield, send, generator RAM vs list, itertools', problemIds: [], conceptSlugs: ['generators', 'itertools'] },
        { day: 5, title: 'Day 5 — Decorators', focus: 'functools.wraps, stacked decorators, the class decorator', problemIds: [], conceptSlugs: ['decorators', 'functools'] },
        { day: 6, title: 'Day 6 — GIL & Threading', focus: 'GIL semantics, threading vs multiprocessing, asyncio basics', problemIds: [], conceptSlugs: ['gil', 'threading', 'asyncio'] },
        { day: 7, title: 'Day 7 — Dunder Methods & Protocol', focus: '__repr__, __eq__/__hash__ contract, __iter__, __enter__/__exit__', problemIds: [], conceptSlugs: ['dunder-repr', 'dunder-eq-hash', 'dunder-iter', 'context-protocol'] },
      ],
    },
  },

  'oop-design': {
    '3day': {
      id: 'oop-design-3day',
      label: '3 Days to Intermediate',
      tagline: 'Classes, inheritance, and the protocols that matter',
      days: [
        { day: 1, title: 'Day 1 — Class Basics', focus: '__init__, instance vs class attributes, @property', problemIds: [], conceptSlugs: ['class-init', 'class-vs-instance', 'property'] },
        { day: 2, title: 'Day 2 — Inheritance & MRO', focus: 'super(), MRO (C3), ABC and abstract methods', problemIds: [], conceptSlugs: ['inheritance', 'mro', 'abc'] },
        { day: 3, title: 'Day 3 — Composition & Protocols', focus: 'composition over inheritance, iterator protocol, context manager', problemIds: [], conceptSlugs: ['composition', 'iterator-protocol', 'context-manager'] },
      ],
    },
    '7day': {
      id: 'oop-design-7day',
      label: '7 Days to Advanced',
      tagline: 'From class basics to design patterns for data systems',
      days: [
        { day: 1, title: 'Day 1 — Class Mechanics', focus: '__init__, instance/class/static, @property, slots', problemIds: [], conceptSlugs: ['class-init', 'class-vs-instance', 'property', 'slots'] },
        { day: 2, title: 'Day 2 — Inheritance & MRO', focus: 'super(), MRO, diamond problem, ABC/Protocol', problemIds: [], conceptSlugs: ['inheritance', 'mro', 'abc', 'typing-protocol'] },
        { day: 3, title: 'Day 3 — Dunder Methods', focus: '__repr__, __eq__/__hash__, __len__, __getitem__', problemIds: [], conceptSlugs: ['dunder-repr', 'dunder-eq-hash', 'dunder-len', 'dunder-getitem'] },
        { day: 4, title: 'Day 4 — Iterator & Context Protocol', focus: '__iter__/__next__, the context manager, contextlib', problemIds: [], conceptSlugs: ['iterator-protocol', 'context-manager'] },
        { day: 5, title: 'Day 5 — Composition Patterns', focus: 'composition over inheritance, mixin, decorator pattern', problemIds: [], conceptSlugs: ['composition', 'mixin', 'decorator-pattern'] },
        { day: 6, title: 'Day 6 — Data Classes & Typing', focus: 'dataclasses, NamedTuple, Pydantic basics, Enum', problemIds: [], conceptSlugs: ['dataclasses', 'namedtuple', 'pydantic', 'enum'] },
        { day: 7, title: 'Day 7 — Design for Scale', focus: 'registry pattern, strategy, plugin arch — in Python', problemIds: [], conceptSlugs: ['registry-pattern', 'strategy-pattern'] },
      ],
    },
  },

  'data-craft': {
    '3day': {
      id: 'data-craft-3day',
      label: '3 Days to Intermediate',
      tagline: 'Cleaning, funnels, and the right denominator',
      days: [
        { day: 1, title: 'Day 1 — Data Cleaning Patterns', focus: 'dedup, NaN policy, type coercion, schema check', problemIds: [], conceptSlugs: ['dedup', 'nan-policy', 'type-coerce'] },
        { day: 2, title: 'Day 2 — Funnel & Retention', focus: 'conversion funnel, cohort retention matrix, churn definition', problemIds: [], conceptSlugs: ['funnel', 'retention-cohort'] },
        { day: 3, title: 'Day 3 — Metric Judgment', focus: 'the right denominator, metric ambiguity, A/B gotchas', problemIds: [], conceptSlugs: ['denominator', 'metric-ambiguity'] },
      ],
    },
    '7day': {
      id: 'data-craft-7day',
      label: '7 Days to Advanced',
      tagline: 'Analyst judgment from take-home to senior-bar',
      days: [
        { day: 1, title: 'Day 1 — Cleaning Pipeline', focus: 'dedup, NaN policy, dtype coercion, schema validation', problemIds: [], conceptSlugs: ['dedup', 'nan-policy', 'type-coerce', 'schema-check'] },
        { day: 2, title: 'Day 2 — Funnel Analysis', focus: 'conversion funnel, drop-off, session vs user denominator', problemIds: [], conceptSlugs: ['funnel', 'denominator'] },
        { day: 3, title: 'Day 3 — Cohort & Retention', focus: 'retention matrix, cohort definition, churn vs dormant', problemIds: [], conceptSlugs: ['retention-cohort', 'churn-definition'] },
        { day: 4, title: 'Day 4 — Metric Design', focus: 'the right metric, guardrail vs north-star, gaming risk', problemIds: [], conceptSlugs: ['metric-design', 'guardrail-metric'] },
        { day: 5, title: 'Day 5 — Aggregation Judgment', focus: 'mean vs median, weighted average, Simpson\'s paradox', problemIds: [], conceptSlugs: ['mean-vs-median', 'weighted-avg', 'simpsons-paradox'] },
        { day: 6, title: 'Day 6 — Experimentation Basics', focus: 'A/B gotchas, novelty effect, pre-experiment bias', problemIds: [], conceptSlugs: ['ab-gotchas', 'novelty-effect'] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'end-to-end: dirty data → metric → decision write-up', problemIds: [], conceptSlugs: [] },
      ],
    },
  },

  'code-craft': {
    '3day': {
      id: 'code-craft-3day',
      label: '3 Days to Intermediate',
      tagline: 'Testing and typing — the senior floor',
      days: [
        { day: 1, title: 'Day 1 — Testing Basics', focus: 'assert patterns, edge case discipline, pytest basics', problemIds: [], conceptSlugs: ['assert-patterns', 'edge-cases'] },
        { day: 2, title: 'Day 2 — Type Hints', focus: 'basic type hints, Optional, Union, List/Dict generics', problemIds: [], conceptSlugs: ['type-hints', 'optional', 'generics'] },
        { day: 3, title: 'Day 3 — Refactoring', focus: 'extract function, name the concept, single responsibility', problemIds: [], conceptSlugs: ['extract-function', 'srp'] },
      ],
    },
    '7day': {
      id: 'code-craft-7day',
      label: '7 Days to Advanced',
      tagline: 'Production habits for ML and data engineers',
      days: [
        { day: 1, title: 'Day 1 — Testing Fundamentals', focus: 'assert discipline, edge case taxonomy, parametrize', problemIds: [], conceptSlugs: ['assert-patterns', 'edge-cases', 'parametrize'] },
        { day: 2, title: 'Day 2 — Advanced Testing', focus: 'mock, patch, fixture design, property-based testing', problemIds: [], conceptSlugs: ['mock-patch', 'fixture', 'property-testing'] },
        { day: 3, title: 'Day 3 — Type System', focus: 'type hints, Optional/Union, TypeVar, Protocol, overload', problemIds: [], conceptSlugs: ['type-hints', 'typevar', 'typing-protocol'] },
        { day: 4, title: 'Day 4 — Dataclasses & Validation', focus: 'dataclasses, Pydantic, Enum — illegal-state prevention', problemIds: [], conceptSlugs: ['dataclasses', 'pydantic'] },
        { day: 5, title: 'Day 5 — Refactoring Patterns', focus: 'extract function/class, SRP, DI, naming-the-concept', problemIds: [], conceptSlugs: ['extract-function', 'di', 'srp'] },
        { day: 6, title: 'Day 6 — Reproducibility & Packaging', focus: 'virtual envs, pyproject.toml, pinning, __version__', problemIds: [], conceptSlugs: ['virtual-envs', 'pyproject', 'pinning'] },
        { day: 7, title: 'Day 7 — Code Review', focus: 'read LLM\'s code critically: hallucinated APIs, mutable defaults, off-by-one', problemIds: [], conceptSlugs: ['llm-review', 'mutable-default', 'off-by-one'] },
      ],
    },
  },

};

// ── Lab-wide paths ────────────────────────────────────────────────────────────
// Cross-world tracks — each day may pull from multiple worlds.

export const LAB_PATHS = {

  '3day': {
    id: 'lab-3day',
    label: '3 Days to Intermediate',
    tagline: 'The Python + pandas floor every DA/DS screen tests',
    worlds: ['python-core', 'pandas-numpy'],
    days: [
      { day: 1, title: 'Day 1 — Python Core Floor', focus: 'Collections, comprehensions, functions — the assumed baseline', worlds: ['python-core'], problemIds: [], conceptSlugs: ['list-mutation', 'dict-ops', 'comprehensions', 'args-kwargs'] },
      { day: 2, title: 'Day 2 — pandas Foundations', focus: 'Single-col ops, boolean filter, NaN, first groupby', worlds: ['pandas-numpy'], problemIds: [], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna', 'groupby-mean'] },
      { day: 3, title: 'Day 3 — pandas Aggregation', focus: 'groupby edge cases, multi-agg, inner merge', worlds: ['pandas-numpy'], problemIds: [], conceptSlugs: ['groupby-count-nan', 'groupby-multi-agg', 'simple-merge'] },
    ],
  },

  '7day': {
    id: 'lab-7day',
    label: '7 Days to Advanced',
    tagline: 'Full-stack fluency — Python internals to pandas judgment to DSA',
    worlds: ['python-core', 'python-internals', 'pandas-numpy', 'dsa-patterns'],
    days: [
      { day: 1, title: 'Day 1 — Python Core', focus: 'Collections, comprehensions, functions, closures', worlds: ['python-core'], problemIds: [], conceptSlugs: ['dict-ops', 'comprehensions', 'args-kwargs', 'closures'] },
      { day: 2, title: 'Day 2 — Python Internals', focus: 'is vs ==, mutable default, late-binding, generators', worlds: ['python-internals'], problemIds: [], conceptSlugs: ['is-vs-eq', 'mutable-default', 'late-binding', 'generators'] },
      { day: 3, title: 'Day 3 — pandas Foundations', focus: 'Single-col ops, filter, NaN, groupby core', worlds: ['pandas-numpy'], problemIds: [], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna', 'groupby-mean', 'groupby-count-nan'] },
      { day: 4, title: 'Day 4 — pandas Advanced', focus: 'Multi-agg, merge patterns, pivot, window', worlds: ['pandas-numpy'], problemIds: [], conceptSlugs: ['groupby-multi-agg', 'merge-duplicates', 'left-merge', 'pivot-table', 'rolling-window'] },
      { day: 5, title: 'Day 5 — DSA Patterns I', focus: 'Hashing, two-pointer, sliding window', worlds: ['dsa-patterns'], problemIds: [], conceptSlugs: ['hash-frequency', 'two-pointer', 'sliding-fixed', 'sliding-variable'] },
      { day: 6, title: 'Day 6 — DSA Patterns II', focus: 'Binary search, heap, BFS/DFS', worlds: ['dsa-patterns'], problemIds: [], conceptSlugs: ['binary-search', 'heap-k-largest', 'bfs-level', 'dfs-grid'] },
      { day: 7, title: 'Day 7 — Judgment & Synthesis', focus: 'Traps across all worlds: which is right and why', worlds: ['python-core', 'pandas-numpy', 'dsa-patterns'], problemIds: [], conceptSlugs: [] },
    ],
  },

};

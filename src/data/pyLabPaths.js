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
// STATUS: wired into PyLabBrowser (path selector + day strip). python-core, pandas-numpy
// and the lab-wide tracks carry curated problemIds; the remaining worlds are populated as
// their banks fill. When a day has problemIds, the browser filters to exactly those; a
// lab-wide day with no problemIds falls back to its worlds' topics; a per-world day with
// none falls back to the world's whole topic set.
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
        { day: 1, title: 'Day 1 — Data & Control', focus: 'sorting by key, unpacking, dict merge, any/all, zip/enumerate, grouping', problemIds: ['pylab-idiom-sorted-key', 'pylab-idiom-starred-unpack', 'pylab-idiom-dict-merge', 'pylab-idiom-any-all', 'pylab-idiom-zip-enumerate', 'pylab-group-names-by-team'], conceptSlugs: ['string-ops', 'list-mutation', 'sort-key', 'unpacking'] },
        { day: 2, title: 'Day 2 — Collections & Comprehensions', focus: 'dict/list comprehensions, Counter, zip/enumerate, defaultdict grouping, any/all', problemIds: ['pylab-idiom-dict-comp-index', 'pylab-idiom-nested-vs-flat-comp', 'pylab-idiom-counter-topn', 'pylab-idiom-zip-enumerate', 'pylab-idiom-defaultdict-groupby', 'pylab-idiom-any-all'], conceptSlugs: ['comprehensions', 'counter', 'defaultdict', 'enumerate-zip'] },
        { day: 3, title: 'Day 3 — Functions & Scope', focus: 'decorators, closures over state, context-manager decorators, reduce, generator expressions', problemIds: ['pylab-idiom-decorator-memoize', 'pylab-idiom-decorator-counter', 'pylab-idiom-contextmanager-decorator', 'pylab-idiom-reduce-running', 'pylab-idiom-gen-expr-stream'], conceptSlugs: ['closures', 'decorators', 'genexpr'] },
      ],
    },
    '7day': {
      id: 'python-core-7day',
      label: '7 Days to Advanced',
      tagline: 'From beginner syntax to senior-bar Python',
      days: [
        { day: 1, title: 'Day 1 — Primitives & Idioms', focus: 'sort keys, any/all short-circuit, zip/enumerate, unpacking', problemIds: ['pylab-idiom-sorted-key', 'pylab-idiom-any-all', 'pylab-idiom-zip-enumerate', 'pylab-idiom-starred-unpack'], conceptSlugs: ['sort-key', 'truthiness'] },
        { day: 2, title: 'Day 2 — Collections Deep Cut', focus: 'dict comprehensions, dict merge, unpacking, nested comprehensions, grouping', problemIds: ['pylab-idiom-dict-comp-index', 'pylab-idiom-dict-merge', 'pylab-idiom-starred-unpack', 'pylab-idiom-nested-vs-flat-comp', 'pylab-group-names-by-team'], conceptSlugs: ['dict-ops', 'unpacking', 'comprehensions'] },
        { day: 3, title: 'Day 3 — Iteration Patterns', focus: 'zip/enumerate, Counter top-n, defaultdict, generator streams, itertools', problemIds: ['pylab-idiom-zip-enumerate', 'pylab-idiom-counter-topn', 'pylab-idiom-defaultdict-groupby', 'pylab-idiom-gen-expr-stream', 'pylab-idiom-itertools-groupby', 'pylab-idiom-itertools-accumulate'], conceptSlugs: ['enumerate-zip', 'counter', 'genexpr', 'itertools'] },
        { day: 4, title: 'Day 4 — Functions & Scope', focus: 'decorators, closure state, reduce/running-fold', problemIds: ['pylab-idiom-decorator-counter', 'pylab-idiom-decorator-memoize', 'pylab-idiom-reduce-running'], conceptSlugs: ['closures', 'decorators'] },
        { day: 5, title: 'Day 5 — Sorting, Counter & defaultdict', focus: 'sort key, Counter top-n, defaultdict grouping, itertools', problemIds: ['pylab-idiom-sorted-key', 'pylab-idiom-counter-topn', 'pylab-idiom-defaultdict-groupby', 'pylab-idiom-itertools-groupby'], conceptSlugs: ['sort-key', 'counter', 'defaultdict'] },
        { day: 6, title: 'Day 6 — Context Managers & Iteration Protocol', focus: 'context-manager decorator, context-manager class, deque window', problemIds: ['pylab-idiom-contextmanager-decorator', 'pylab-idiom-context-class', 'pylab-idiom-deque-window'], conceptSlugs: ['context-manager', 'iterator-protocol'] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'dunder repr/eq, len/getitem, group anagrams — put it together', problemIds: ['pylab-idiom-dunder-repr-eq', 'pylab-idiom-dunder-len-getitem', 'pylab-py-group-anagrams'], conceptSlugs: [] },
      ],
    },
  },

  'pandas-numpy': {
    '3day': {
      id: 'pandas-numpy-3day',
      label: '3 Days to Intermediate',
      tagline: 'Core pandas ops from scratch — DA take-home floor',
      days: [
        { day: 1, title: 'Day 1 — Series & Single-Col Ops', focus: 'mean/count, boolean filter, NaN handling, nunique', problemIds: ['pylab-col-mean', 'pylab-filter-rows', 'pylab-filter-notna', 'pylab-groupby-nunique'], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna'] },
        { day: 2, title: 'Day 2 — groupby & Aggregation', focus: 'groupby+mean, NaN groups, filter-before-aggregate, named agg', problemIds: ['pylab-groupby-mean', 'pylab-groupby-count-nan', 'pylab-filter-before-aggregate', 'pylab-groupby-named-agg', 'pylab-groupby-revenue'], conceptSlugs: ['groupby-mean', 'groupby-count-nan', 'groupby-multi-agg'] },
        { day: 3, title: 'Day 3 — Merge & Reshape', focus: 'safe merge (no fan-out), left merge, pivot to a table, spread columns', problemIds: ['pylab-attach-price-no-fanout', 'pylab-keep-every-left-row', 'pylab-monthly-category-table', 'pylab-spread-category-columns'], conceptSlugs: ['simple-merge', 'left-merge', 'pivot-table'] },
      ],
    },
    '7day': {
      id: 'pandas-numpy-7day',
      label: '7 Days to Advanced',
      tagline: 'The 20 patterns in 90% of take-homes — plus the traps',
      days: [
        { day: 1, title: 'Day 1 — Foundations', focus: 'single-col agg, boolean filter, NaN filter, nunique', problemIds: ['pylab-col-mean', 'pylab-filter-rows', 'pylab-filter-notna', 'pylab-groupby-nunique'], conceptSlugs: ['col-mean', 'filter-rows', 'filter-notna'] },
        { day: 2, title: 'Day 2 — groupby Core', focus: 'groupby+mean, NaN group trap, filter-first, named agg, share of total', problemIds: ['pylab-groupby-mean', 'pylab-groupby-count-nan', 'pylab-filter-before-aggregate', 'pylab-groupby-named-agg', 'pylab-groupby-share-of-total'], conceptSlugs: ['groupby-mean', 'groupby-count-nan', 'groupby-multi-agg'] },
        { day: 3, title: 'Day 3 — Merge Patterns', focus: 'safe merge, anti-join (no orders), left merge, unmatched-key audit, stack', problemIds: ['pylab-attach-price-no-fanout', 'pylab-users-with-no-orders', 'pylab-keep-every-left-row', 'pylab-audit-unmatched-keys', 'pylab-stack-two-months'], conceptSlugs: ['simple-merge', 'merge-duplicates', 'left-merge'] },
        { day: 4, title: 'Day 4 — Reshape & Window', focus: 'pivot table, spread/columns, quarters-to-rows, rolling, diff, cumsum', problemIds: ['pylab-monthly-category-table', 'pylab-spread-category-columns', 'pylab-quarters-to-rows', 'pylab-window-rolling-mean', 'pylab-window-diff', 'pylab-window-cumsum'], conceptSlugs: ['pivot-table', 'melt', 'rolling-window', 'shift'] },
        { day: 5, title: 'Day 5 — numpy Vectorize', focus: 'vectorized ops, min-max normalize, cosine similarity, one-hot, softmax', problemIds: ['pylab-vectorize', 'pylab-minmax-normalize', 'pylab-cosine-similarity', 'pylab-one-hot', 'pylab-softmax'], conceptSlugs: ['numpy-broadcast', 'numpy-where', 'numpy-index'] },
        { day: 6, title: 'Day 6 — Judgment Layer', focus: 'which method + which trap: filter-first, keep-unknown, group-mean fill, safe CTR, transform-broadcast', problemIds: ['pylab-filter-before-aggregate', 'pylab-region-total-keep-unknown', 'pylab-missing-fillna-group-mean', 'pylab-pd-metrics-safe-ctr', 'pylab-groupby-transform-broadcast'], conceptSlugs: [] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'end-to-end: dedup → rate per group → top-n per group', problemIds: ['pylab-pd-dedup-keep-last', 'pylab-pd-metrics-rate-per-group', 'pylab-groupby-topn-per-group'], conceptSlugs: [] },
      ],
    },
  },

  'dsa-patterns': {
    '3day': {
      id: 'dsa-patterns-3day',
      label: '3 Days to Intermediate',
      tagline: 'Hashing + two-pointer + sliding window — the easy-floor patterns',
      days: [
        { day: 1, title: 'Day 1 — Hashing', focus: 'frequency map, two-sum, anagram, group-by-hash', problemIds: ['pylab-py-two-sum', 'pylab-py-first-unique', 'pylab-py-anagram', 'pylab-py-group-anagrams', 'pylab-py-majority-element'], conceptSlugs: ['hash-frequency', 'two-sum', 'anagram'] },
        { day: 2, title: 'Day 2 — Two Pointer', focus: 'sorted pair-sum, palindrome, move zeroes, most water', problemIds: ['pylab-py-pair-sum-sorted', 'pylab-py-valid-palindrome', 'pylab-py-move-zeroes', 'pylab-py-max-water'], conceptSlugs: ['two-pointer', 'palindrome'] },
        { day: 3, title: 'Day 3 — Sliding Window', focus: 'fixed window, variable window, longest-k-distinct', problemIds: ['pylab-py-max-window-sum', 'pylab-py-min-window-len', 'pylab-py-longest-k-distinct', 'pylab-py-max-vowels-window'], conceptSlugs: ['sliding-fixed', 'sliding-variable'] },
      ],
    },
    '7day': {
      id: 'dsa-patterns-7day',
      label: '7 Days to Advanced',
      tagline: '8 patterns — from easy to medium, no contest grind',
      days: [
        { day: 1, title: 'Day 1 — Hashing', focus: 'frequency map, two-sum, anagram, group-by-hash', problemIds: ['pylab-py-two-sum', 'pylab-py-first-unique', 'pylab-py-anagram', 'pylab-py-group-anagrams'], conceptSlugs: ['hash-frequency', 'two-sum'] },
        { day: 2, title: 'Day 2 — Two Pointer + Sliding Window', focus: 'sorted two-pointer, palindrome, most water, fixed/variable window', problemIds: ['pylab-py-pair-sum-sorted', 'pylab-py-valid-palindrome', 'pylab-py-max-water', 'pylab-py-max-window-sum', 'pylab-py-min-window-len'], conceptSlugs: ['two-pointer', 'sliding-fixed', 'sliding-variable'] },
        { day: 3, title: 'Day 3 — Binary Search', focus: 'sorted search, search-insert, first-geq, integer sqrt, koko rate', problemIds: ['pylab-py-binary-search', 'pylab-py-search-insert', 'pylab-py-first-geq', 'pylab-py-integer-sqrt', 'pylab-py-koko-rate'], conceptSlugs: ['binary-search'] },
        { day: 4, title: 'Day 4 — Heap / Priority Queue', focus: 'k-largest, kth-smallest, top-k frequent, merge k sorted', problemIds: ['pylab-py-k-largest', 'pylab-py-kth-smallest', 'pylab-py-top-k-frequent-heap', 'pylab-py-merge-k-sorted'], conceptSlugs: ['heap-k-largest', 'heap-merge'] },
        { day: 5, title: 'Day 5 — Stack', focus: 'balanced parens, daily temperatures, next greater, min-stack, RPN', problemIds: ['pylab-py-balanced', 'pylab-py-daily-temperatures', 'pylab-py-next-greater', 'pylab-py-min-stack', 'pylab-py-eval-rpn'], conceptSlugs: ['stack-monotonic'] },
        { day: 6, title: 'Day 6 — Intervals + Prefix Sum', focus: 'attend meetings, min rooms, insert/merge intervals, subarray sum', problemIds: ['pylab-can-attend', 'pylab-min-meeting-rooms', 'pylab-insert-interval', 'pylab-py-merge-intervals', 'pylab-py-prefix-sum', 'pylab-py-subarray-sum-k'], conceptSlugs: ['merge-intervals', 'prefix-sum'] },
        { day: 7, title: 'Day 7 — Greedy + 1-D DP', focus: 'max subarray, can-jump, best buy-sell, gas station, fibonacci', problemIds: ['pylab-max-subarray', 'pylab-can-jump', 'pylab-best-buy-sell', 'pylab-gas-station', 'pylab-fibonacci'], conceptSlugs: ['dp-1d'] },
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
        { day: 1, title: 'Day 1 — Class Basics', focus: '__init__, instance vs class attributes, @property', problemIds: ['oop-bank-account', 'oop-running-average', 'oop-computed-property', 'oop-property-validation'], conceptSlugs: ['class-init', 'class-vs-instance', 'property'] },
        { day: 2, title: 'Day 2 — Dataclasses & Dunder', focus: 'dataclass records, frozen, default factory, __eq__/__hash__, __add__', problemIds: ['oop-dataclass-record', 'oop-frozen-point', 'oop-dataclass-default-factory', 'oop-dunder-eq-hash', 'oop-dunder-add'], conceptSlugs: ['dataclasses', 'dunder-eq-hash'] },
        { day: 3, title: 'Day 3 — Inheritance, Composition & Protocols', focus: 'override, has-a composition, sort key dunder, classmethod/staticmethod', problemIds: ['oop-inheritance-override', 'oop-composition-has-a', 'oop-dunder-lt-sort', 'oop-classmethod-from-dict', 'oop-staticmethod-util'], conceptSlugs: ['inheritance', 'composition', 'abc'] },
      ],
    },
    '7day': {
      id: 'oop-design-7day',
      label: '7 Days to Advanced',
      tagline: 'From class basics to design patterns for data systems',
      days: [
        { day: 1, title: 'Day 1 — Class Mechanics', focus: '__init__, instance/class attrs, @property, validation', problemIds: ['oop-bank-account', 'oop-running-average', 'oop-computed-property', 'oop-property-validation'], conceptSlugs: ['class-init', 'class-vs-instance', 'property'] },
        { day: 2, title: 'Day 2 — Rate Limiter & State', focus: 'stateful objects: rate limiter over a counter', problemIds: ['oop-rate-limiter-counter'], conceptSlugs: ['class-vs-instance'] },
        { day: 3, title: 'Day 3 — Dunder Methods', focus: '__eq__/__hash__ contract, __lt__ for sort, __add__', problemIds: ['oop-dunder-eq-hash', 'oop-dunder-lt-sort', 'oop-dunder-add'], conceptSlugs: ['dunder-eq-hash'] },
        { day: 4, title: 'Day 4 — Dataclasses & Typing', focus: 'dataclass record, frozen, default factory', problemIds: ['oop-dataclass-record', 'oop-frozen-point', 'oop-dataclass-default-factory'], conceptSlugs: ['dataclasses'] },
        { day: 5, title: 'Day 5 — Composition Patterns', focus: 'composition over inheritance, override', problemIds: ['oop-composition-has-a', 'oop-inheritance-override'], conceptSlugs: ['composition', 'inheritance'] },
        { day: 6, title: 'Day 6 — Constructors & Utilities', focus: 'classmethod alternate constructor, staticmethod utility', problemIds: ['oop-classmethod-from-dict', 'oop-staticmethod-util'], conceptSlugs: ['classmethod', 'staticmethod'] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'combine validation, dunder, dataclass into one design', problemIds: ['oop-property-validation', 'oop-dunder-eq-hash', 'oop-dataclass-default-factory'], conceptSlugs: [] },
      ],
    },
  },

  'data-craft': {
    '3day': {
      id: 'data-craft-3day',
      label: '3 Days to Intermediate',
      tagline: 'Cleaning, funnels, and the right denominator',
      days: [
        { day: 1, title: 'Day 1 — Data Cleaning Patterns', focus: 'dedup latest, NaN-is-not-zero, text-to-number coercion', problemIds: ['dc-dedup-latest', 'dc-mean-exclude-missing', 'dc-numeric-coerce'], conceptSlugs: ['dedup', 'nan-policy', 'type-coerce'] },
        { day: 2, title: 'Day 2 — Funnel & Retention', focus: 'step-to-step funnel conversion, week-1 cohort retention', problemIds: ['dc-funnel-step-conversion', 'dc-retention-week1'], conceptSlugs: ['funnel', 'retention-cohort'] },
        { day: 3, title: 'Day 3 — Metric Judgment', focus: 'the right denominator, weighted rate, safe division', problemIds: ['dc-conversion-rate-users', 'dc-weighted-rate', 'dc-safe-ctr'], conceptSlugs: ['denominator', 'metric-ambiguity'] },
      ],
    },
    '7day': {
      id: 'data-craft-7day',
      label: '7 Days to Advanced',
      tagline: 'Analyst judgment from take-home to senior-bar',
      days: [
        { day: 1, title: 'Day 1 — Cleaning Pipeline', focus: 'dedup to the latest record, NaN-is-not-zero, text-to-number coercion', problemIds: ['dc-dedup-latest', 'dc-mean-exclude-missing', 'dc-numeric-coerce'], conceptSlugs: ['dedup', 'nan-policy', 'type-coerce', 'schema-check'] },
        { day: 2, title: 'Day 2 — The Right Denominator', focus: 'per-user vs per-session conversion, weighted overall rate', problemIds: ['dc-conversion-rate-users', 'dc-weighted-rate'], conceptSlugs: ['funnel', 'denominator'] },
        { day: 3, title: 'Day 3 — Funnel & Retention', focus: 'step-to-step funnel conversion, week-1 cohort retention', problemIds: ['dc-funnel-step-conversion', 'dc-retention-week1'], conceptSlugs: ['retention-cohort', 'funnel'] },
        { day: 4, title: 'Day 4 — Safe Rates', focus: 'divide-by-zero is undefined (NaN), not infinity', problemIds: ['dc-safe-ctr'], conceptSlugs: ['metric-design', 'guardrail-metric'] },
        { day: 5, title: 'Day 5 — Aggregation Judgment', focus: 'median vs mean under outliers, Simpson\'s paradox', problemIds: ['dc-median-not-mean', 'dc-simpsons-winner'], conceptSlugs: ['mean-vs-median', 'weighted-avg', 'simpsons-paradox'] },
        { day: 6, title: 'Day 6 — Denominator & Weighting Review', focus: 'revisit the traps: per-user denominator, weighting, pooling', problemIds: ['dc-conversion-rate-users', 'dc-weighted-rate', 'dc-simpsons-winner'], conceptSlugs: ['ab-gotchas', 'denominator'] },
        { day: 7, title: 'Day 7 — Synthesis', focus: 'end-to-end: clean → dedup → the honest metric', problemIds: ['dc-numeric-coerce', 'dc-dedup-latest', 'dc-weighted-rate'], conceptSlugs: [] },
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

  'ai-ml': {
    '3day': {
      id: 'ai-ml-3day',
      label: '3 Days to Intermediate',
      tagline: 'ML metrics + AI-engineering logic, from scratch',
      days: [
        { day: 1, title: 'Day 1 — ML Metrics', focus: 'precision/recall, confusion counts, F1', problemIds: ['mlx-precision-recall', 'mlx-confusion-counts', 'ml-f1-score'], conceptSlugs: ['metrics'] },
        { day: 2, title: 'Day 2 — ML Primitives', focus: 'sigmoid, z-score, train-stat standardization, k-NN', problemIds: ['mlx-sigmoid', 'ml-zscore', 'mlx-standardize-train-stats', 'mlx-knn-classify'], conceptSlugs: ['from-scratch'] },
        { day: 3, title: 'Day 3 — AI Engineering', focus: 'cosine top-k, recall@k, MRR, chunking, LLM-as-judge', problemIds: ['aix-cosine-topk', 'aix-recall-at-k', 'aix-mrr', 'aix-chunk-overlap', 'aix-llm-judge-passrate'], conceptSlugs: ['retrieval', 'evaluation'] },
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
      { day: 1, title: 'Day 1 — Python Core Floor', focus: 'Comprehensions, grouping, zip/enumerate, memoize', worlds: ['python-core'], problemIds: ['pylab-idiom-dict-comp-index', 'pylab-idiom-defaultdict-groupby', 'pylab-idiom-zip-enumerate', 'pylab-idiom-decorator-memoize'], conceptSlugs: ['comprehensions', 'defaultdict'] },
      { day: 2, title: 'Day 2 — pandas Foundations', focus: 'Single-col ops, boolean filter, NaN, first groupby', worlds: ['pandas-numpy'], problemIds: ['pylab-col-mean', 'pylab-filter-rows', 'pylab-filter-notna', 'pylab-groupby-mean'], conceptSlugs: ['col-mean', 'filter-rows', 'groupby-mean'] },
      { day: 3, title: 'Day 3 — pandas Aggregation', focus: 'groupby edge cases, named agg, safe merge', worlds: ['pandas-numpy'], problemIds: ['pylab-groupby-count-nan', 'pylab-groupby-named-agg', 'pylab-attach-price-no-fanout'], conceptSlugs: ['groupby-count-nan', 'simple-merge'] },
    ],
  },

  '7day': {
    id: 'lab-7day',
    label: '7 Days to Advanced',
    tagline: 'Full-stack fluency — Python idioms to pandas judgment to DSA',
    worlds: ['python-core', 'pandas-numpy'],
    days: [
      { day: 1, title: 'Day 1 — Python Core', focus: 'Comprehensions, Counter, zip/enumerate, memoize', worlds: ['python-core'], problemIds: ['pylab-idiom-dict-comp-index', 'pylab-idiom-counter-topn', 'pylab-idiom-zip-enumerate', 'pylab-idiom-decorator-memoize'], conceptSlugs: ['comprehensions', 'counter'] },
      { day: 2, title: 'Day 2 — Closures & Generators', focus: 'Closure state, generator streams, reduce/running-fold', worlds: ['python-core'], problemIds: ['pylab-idiom-decorator-counter', 'pylab-idiom-gen-expr-stream', 'pylab-idiom-reduce-running'], conceptSlugs: ['closures', 'genexpr'] },
      { day: 3, title: 'Day 3 — pandas Foundations', focus: 'Single-col ops, filter, NaN, groupby core', worlds: ['pandas-numpy'], problemIds: ['pylab-col-mean', 'pylab-filter-rows', 'pylab-filter-notna', 'pylab-groupby-mean', 'pylab-groupby-count-nan'], conceptSlugs: ['col-mean', 'groupby-mean'] },
      { day: 4, title: 'Day 4 — pandas Advanced', focus: 'Named agg, unmatched-key audit, left merge, pivot, rolling', worlds: ['pandas-numpy'], problemIds: ['pylab-groupby-named-agg', 'pylab-audit-unmatched-keys', 'pylab-keep-every-left-row', 'pylab-monthly-category-table', 'pylab-window-rolling-mean'], conceptSlugs: ['groupby-multi-agg', 'left-merge', 'pivot-table'] },
      { day: 5, title: 'Day 5 — DSA Patterns I', focus: 'Hashing, two-pointer, sliding window', worlds: ['dsa-patterns'], problemIds: ['pylab-py-two-sum', 'pylab-py-group-anagrams', 'pylab-py-pair-sum-sorted', 'pylab-py-max-window-sum', 'pylab-py-min-window-len'], conceptSlugs: ['hash-frequency', 'two-pointer', 'sliding-variable'] },
      { day: 6, title: 'Day 6 — DSA Patterns II', focus: 'Binary search, heap, intervals', worlds: ['dsa-patterns'], problemIds: ['pylab-py-binary-search', 'pylab-py-search-insert', 'pylab-py-k-largest', 'pylab-py-top-k-frequent-heap', 'pylab-py-merge-intervals'], conceptSlugs: ['binary-search', 'heap-k-largest', 'merge-intervals'] },
      { day: 7, title: 'Day 7 — Judgment & Synthesis', focus: 'Traps across worlds: which is right and why', worlds: ['python-core', 'pandas-numpy'], problemIds: ['pylab-filter-before-aggregate', 'pylab-py-max-water', 'pylab-groupby-share-of-total'], conceptSlugs: [] },
    ],
  },

};

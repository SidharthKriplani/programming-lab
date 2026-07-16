// pyLabPlanned — PyLab curriculum coverage map + SKELETON placeholders for the gaps.
//
// Mirrors PAL's PythonLab "Planned curriculum" (6 categories) against PyLab's actual
// 136-problem bank, from the coverage audit on 2026-06-24. Two exports:
//   pyLabCurriculum — the full 25-item map, each tagged covered | partial | planned.
//   pyLabPlanned    — the partial + planned items as authoring stubs (topic + level + seed).
//
// DISPLAY-ONLY placeholders: `pyLabPlanned` is rendered as greyed "Planned · coming soon"
// cards in PyLab (imported by PyLabBrowser) — but NOT in the problem bank (`pyLabProblems`),
// so gates, readiness and grading are untouched. A future authoring pass turns each stub into
// a real gated problem (fixture + solution + judgment layer) in a pyLabBatch_*.js, run through
// the four gates, then removes the stub. Most gaps are the SYSTEMS tier (currently 0 problems)
// — i.e. Phase-4 take-home content. See docs/PYLAB-CURRICULUM.md. House syntax: single quotes.

export const pyLabCurriculum = [
  { category: 'Core pandas', items: [
    { title: 'groupby + agg', status: 'covered', evidence: 'pandas-groupby (19)' },
    { title: 'merge safety', status: 'covered', evidence: 'pandas-merge: fan-out / validate / audit (5)' },
    { title: 'pivot_table cohorts', status: 'partial', plannedId: 'plan-pandas-pivot-cohort', note: 'pivot/reshape covered (5); cohort-framed pivots not yet' },
    { title: 'apply vs np.select', status: 'partial', plannedId: 'plan-pandas-npselect', note: 'apply -> np.where covered; np.select multi-branch absent' },
    { title: 'data cleaning pipeline', status: 'planned', plannedId: 'plan-e2e-cleaning', note: 'atomic ops exist (fillna/dropna/ffill); no end-to-end pipeline' },
  ] },
  { category: 'Time Series', items: [
    { title: 'rolling averages', status: 'covered', evidence: 'window: Smoothed three-day average' },
    { title: 'resample + WoW growth', status: 'covered', evidence: 'window: Roll up to months + Growth vs prior month' },
    { title: 'pct_change pitfalls', status: 'covered', evidence: 'window: Change from the day before (+ unsorted trap)' },
    { title: 'date arithmetic', status: 'covered', evidence: 'window: Days from signup to purchase; half-open range' },
  ] },
  { category: 'NumPy & Stats', items: [
    { title: 'percentile distributions', status: 'planned', plannedId: 'plan-stats-percentile' },
    { title: 'weighted averages', status: 'planned', plannedId: 'plan-stats-weighted-avg' },
    { title: 'array operations', status: 'covered', evidence: 'numpy-vectorize: rmse, cosine, softmax, min-max (7)' },
    { title: 'bootstrap in numpy', status: 'planned', plannedId: 'plan-stats-bootstrap' },
  ] },
  { category: 'Python stdlib', items: [
    { title: 'collections.Counter', status: 'covered', evidence: 'idioms: most frequent levels; top-k tags' },
    { title: 'defaultdict patterns', status: 'covered', evidence: 'idioms: group names by team; build a lookup' },
    { title: 'itertools for analytics', status: 'covered', evidence: 'idioms: run-length / accumulate' },
    { title: 'functools.reduce', status: 'partial', plannedId: 'plan-stdlib-reduce', note: 'a fold idiom exists but not via functools.reduce' },
  ] },
  { category: 'End-to-End Tasks', items: [
    { title: 'funnel in pandas', status: 'planned', plannedId: 'plan-e2e-funnel' },
    { title: 'cohort LTV', status: 'planned', plannedId: 'plan-e2e-cohort-ltv' },
    { title: 'user classification', status: 'partial', plannedId: 'plan-e2e-user-classification', note: 'touched (new-user AOV, label high/low); no dedicated segmentation task' },
    { title: 'retention matrix', status: 'planned', plannedId: 'plan-e2e-retention-matrix' },
  ] },
  { category: 'Systems floor (SWE-for-AI)', items: [
    { title: 'memory hierarchy & cache locality (strides, layout)', status: 'planned', plannedId: 'plan-sys-strides' },
    { title: 'references vs copies under pressure', status: 'covered', evidence: 'internals: is-vs-==, shallow-vs-deep, mutable default (6)' },
    { title: 'complexity in practice (measure, don\'t recite)', status: 'planned', plannedId: 'plan-sys-bigo-bench' },
    { title: 'the GIL: threads vs processes, measured', status: 'planned', plannedId: 'plan-sys-gil-bench' },
    { title: 'Amdahl\'s law on real pipelines', status: 'planned', plannedId: 'plan-sys-amdahl' },
    { title: 'generators as streaming (memory footprint, measured)', status: 'planned', plannedId: 'plan-sys-genstream' },
    { title: 'float representation traps', status: 'planned', plannedId: 'plan-sys-float' },
  ] },
  { category: 'Async & concurrency (the AIE floor)', items: [
    { title: 'asyncio basics: order the awaits', status: 'planned', plannedId: 'plan-async-order' },
    { title: 'bounded concurrency: semaphore + gather for LLM calls', status: 'planned', plannedId: 'plan-async-semaphore' },
    { title: 'fix the race (deterministic replay)', status: 'planned', plannedId: 'plan-async-race' },
    { title: 'timeout, retry, cancel — structured concurrency', status: 'planned', plannedId: 'plan-async-timeout' },
    { title: 'producer/consumer with backpressure', status: 'planned', plannedId: 'plan-async-backpressure' },
  ] },
  { category: 'Notebook → Service (the bridge campaign)', items: [
    { title: 'stage 1: extract functions from the mess', status: 'planned', plannedId: 'plan-n2s-stage1' },
    { title: 'stage 2: dicts become classes at the boundary', status: 'planned', plannedId: 'plan-n2s-stage2' },
    { title: 'stage 3: package structure + config', status: 'planned', plannedId: 'plan-n2s-stage3' },
    { title: 'stage 4: tests around the pipeline', status: 'planned', plannedId: 'plan-n2s-stage4' },
    { title: 'stage 5: a mock inference endpoint', status: 'planned', plannedId: 'plan-n2s-stage5' },
  ] },
  { category: 'Interview Patterns', items: [
    { title: 'explain your approach before coding', status: 'covered', evidence: 'Ambiguity drill + beforeWriting' },
    { title: 'catch silent bugs (merge inflation, unsorted pct_change)', status: 'covered', evidence: 'trap system + Trap Museum (100 traps)' },
    { title: 'validate output row counts', status: 'covered', evidence: 'schema shape-only panel + merge-audit problem' },
    { title: 'narrate trade-offs', status: 'covered', evidence: 'judgment dial: methods + tradeoff/breaksWhen' },
  ] },
];

export const pyLabPlanned = [
  // ── FAANG interview level — SKELETONS ONLY (authoring pass later; these are the hard tier
  //    that sits above PyLab's easy->medium charter, kept as placeholders per Sidharth) ──
  { id: 'plan-faang-lru-cache', title: 'LRU cache', topic: 'oop', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'O(1) get/put with OrderedDict.move_to_end (or dict + doubly-linked list); eviction order + the update-is-a-use trap.' },
  { id: 'plan-faang-median-stream', title: 'Median of a data stream', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'two heaps (max-heap low / min-heap high) kept balanced; the rebalance and even/odd-count trap.' },
  { id: 'plan-faang-topk-buckets', title: 'Top-K frequent in O(n)', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'bucket sort by frequency instead of heap/sort; the tie-order and k-bounds trap.' },
  { id: 'plan-faang-lis', title: 'Longest increasing subsequence', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'patience sorting with bisect (O(n log n)); the subsequence-vs-substring and equal-elements trap.' },
  { id: 'plan-faang-num-islands', title: 'Number of islands', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'DFS/BFS flood fill over a grid; the visited-set vs in-place-mark and diagonal-neighbour trap.' },
  { id: 'plan-faang-coin-change', title: 'Coin change (min coins)', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'bottom-up DP over amounts; the unreachable-amount (inf) and greedy-fails trap.' },
  { id: 'plan-faang-word-break', title: 'Word break', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'DP / memoized recursion over prefixes with a word set; the exponential-without-memo trap.' },
  { id: 'plan-faang-longest-substring', title: 'Longest substring without repeats', topic: 'dsa', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'sliding window + last-seen index map; the move-left-past-old-index trap.' },
  { id: 'plan-faang-merge-asof', title: 'As-of join (merge_asof)', topic: 'pandas-merge', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'time-ordered nearest-prior join (prices to trades); the must-be-sorted and direction (backward/forward) trap.' },
  { id: 'plan-faang-topn-per-group-ties', title: 'Top-N per group with ties', topic: 'pandas-groupby', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'rank(method="dense") within group then filter; nlargest drops ties — the tie-handling trap.' },
  { id: 'plan-faang-sessionize', title: 'Sessionize an event log', topic: 'pandas-window', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'per-user 30-min inactivity gap -> session ids via groupby diff + cumsum; the global-diff-across-users trap.' },
  { id: 'plan-faang-rolling-per-group', title: 'Rolling metric per group', topic: 'pandas-window', level: 'systems', curriculum: 'FAANG interview', status: 'planned', seed: 'groupby().rolling() then reset the extra index level; the leak-across-group-boundaries trap.' },

  // ── NumPy & Stats — the thin Stats half ──
  { id: 'plan-stats-percentile', title: 'Percentile distribution', topic: 'numpy-vectorize', level: 'correctness', curriculum: 'NumPy & Stats', status: 'planned', seed: 'np.percentile / quantile cuts; the interpolation trap (linear vs nearest) and NaN handling.' },
  { id: 'plan-stats-weighted-avg', title: 'Weighted average', topic: 'numpy-vectorize', level: 'correctness', curriculum: 'NumPy & Stats', status: 'planned', seed: 'sum(w*x)/sum(w); the mean-of-ratios vs weighted-mean trap, like safe-ctr but weighted.' },
  { id: 'plan-stats-bootstrap', title: 'Bootstrap a confidence interval', topic: 'numpy-vectorize', level: 'systems', curriculum: 'NumPy & Stats', status: 'planned', seed: 'seeded np.random resample WITH replacement; percentile CI; the without-replacement trap.' },
  // ── End-to-End / the empty SYSTEMS tier ──
  { id: 'plan-e2e-funnel', title: 'Funnel in pandas', topic: 'pandas-groupby', level: 'systems', curriculum: 'End-to-End', status: 'planned', seed: 'step-over-step conversion; the denominator trap (each step vs the first step).' },
  { id: 'plan-e2e-retention-matrix', title: 'Retention matrix', topic: 'pandas-reshape', level: 'systems', curriculum: 'End-to-End', status: 'planned', seed: 'cohort x period pivot of returning users; first-period = 100% and leaky-denominator checks.' },
  { id: 'plan-e2e-cohort-ltv', title: 'Cohort LTV', topic: 'pandas-groupby', level: 'systems', curriculum: 'End-to-End', status: 'planned', seed: 'cumulative revenue per signup cohort over months; the partial-period survivorship bias.' },
  { id: 'plan-e2e-cleaning', title: 'Data cleaning pipeline', topic: 'pandas-groupby', level: 'systems', curriculum: 'Core pandas', status: 'planned', seed: 'dtype coercion + dedup + null policy + outlier clip in one chain; the silent dropna row-loss.' },
  { id: 'plan-e2e-user-classification', title: 'User classification', topic: 'numpy-vectorize', level: 'judgment', curriculum: 'End-to-End', status: 'planned', seed: 'np.select tiers (power / casual / churned) from activity; boundary and default-bucket trap.' },
  // ── Core pandas partials ──
  { id: 'plan-pandas-npselect', title: 'Multi-branch label with np.select', topic: 'numpy-vectorize', level: 'correctness', curriculum: 'Core pandas', status: 'planned', seed: 'np.select vs nested np.where; condition order, the default, first-match-wins.' },
  { id: 'plan-pandas-pivot-cohort', title: 'Cohort table with pivot_table', topic: 'pandas-reshape', level: 'judgment', curriculum: 'Core pandas', status: 'planned', seed: 'signup-cohort x month pivot, fill_value=0; aggfunc choice and the margins trap.' },
  // ── Python stdlib partial ──
  { id: 'plan-stdlib-reduce', title: 'Fold with functools.reduce', topic: 'idioms', level: 'fluency', curriculum: 'Python stdlib', status: 'planned', seed: 'reduce for a running fold/merge; readability vs a loop; the no-initializer-on-empty trap.' },

  // ── Systems floor (SWE-for-AI) — SKELETONS (2026-07-16). The systems-depth
  //    interview layer for senior MLE/AIE: measured, runnable, Python analogs of
  //    the substrate concepts (memory, complexity, concurrency, performance). ──
  { id: 'plan-sys-strides', title: 'Cache locality: row-major vs column-major, measured', topic: 'internals', level: 'systems', curriculum: 'Systems floor', status: 'planned', seed: 'sum a 2-D numpy array along rows vs columns; measure with the glass-box HUD; explain the ~x-fold gap via strides/cache lines. The recite-vs-measure trap.' },
  { id: 'plan-sys-bigo-bench', title: 'Big-O in practice: list vs set membership', topic: 'internals', level: 'systems', curriculum: 'Systems floor', status: 'planned', seed: 'benchmark `x in list` vs `x in set` across sizes; fit the growth; the small-n-where-constants-win trap.' },
  { id: 'plan-sys-gil-bench', title: 'The GIL, measured: threads vs processes', topic: 'internals', level: 'systems', curriculum: 'Systems floor', status: 'planned', seed: 'CPU-bound work under ThreadPoolExecutor vs sequential (Pyodide-safe simulation of the accounting); why threads don\'t help CPU-bound Python; when they DO help (I/O). The threads-always-faster trap.' },
  { id: 'plan-sys-amdahl', title: 'Amdahl\'s law on a real pipeline', topic: 'code-craft', level: 'systems', curriculum: 'Systems floor', status: 'planned', seed: 'given stage timings, compute the max speedup from parallelizing one stage; the optimize-the-wrong-stage trap.' },
  { id: 'plan-sys-genstream', title: 'Generator vs list: memory footprint, measured', topic: 'internals', level: 'systems', curriculum: 'Systems floor', status: 'planned', seed: 'process a large synthetic stream with a list pipeline vs generator pipeline; peak-memory via the HUD; the generators-are-always-better trap (single pass only!).' },
  { id: 'plan-sys-float', title: 'Float traps: 0.1 + 0.2, summation order, big+small', topic: 'code-craft', level: 'correctness', curriculum: 'Systems floor', status: 'planned', seed: 'predict-then-verify float snippets; math.fsum vs sum; the equality-comparison and catastrophic-cancellation traps.' },

  // ── Async & concurrency — SKELETONS. The #1 AIE software skill. ──
  { id: 'plan-async-order', title: 'Order the awaits: what prints when?', topic: 'python-core', level: 'correctness', curriculum: 'Async & concurrency', status: 'planned', seed: 'predict output of gather vs sequential awaits vs create_task; deterministic event-loop replay; the create_task-starts-immediately trap.' },
  { id: 'plan-async-semaphore', title: 'Bounded concurrency for LLM calls', topic: 'ai-eng', level: 'systems', curriculum: 'Async & concurrency', status: 'planned', seed: 'fetch N mock endpoints with at most K in flight (Semaphore + gather); assert max concurrency via an instrumented counter; the unbounded-gather trap.' },
  { id: 'plan-async-race', title: 'Fix the race: shared counter, deterministic replay', topic: 'python-core', level: 'systems', curriculum: 'Async & concurrency', status: 'planned', seed: 'two tasks increment shared state around awaits; scripted scheduling reproduces the lost update; fix with a Lock; the check-then-act trap.' },
  { id: 'plan-async-timeout', title: 'Timeout + retry + cancel, structured', topic: 'ai-eng', level: 'systems', curriculum: 'Async & concurrency', status: 'planned', seed: 'wait_for + retry-with-backoff around a flaky mock call; assert cancelled tasks actually stop; the orphaned-task trap.' },
  { id: 'plan-async-backpressure', title: 'Producer/consumer with backpressure', topic: 'python-core', level: 'systems', curriculum: 'Async & concurrency', status: 'planned', seed: 'asyncio.Queue(maxsize) between a fast producer and slow consumer; assert bounded memory; the unbounded-queue trap.' },

  // ── Notebook → Service — the bridge campaign, staged. SKELETONS. ──
  { id: 'plan-n2s-stage1', title: 'N→S stage 1: extract functions from the mess', topic: 'code-craft', level: 'judgment', curriculum: 'Notebook → Service', status: 'planned', seed: 'a realistic messy analysis script; extract pure functions so provided tests pass; AST check bans globals; the hidden-state-in-cell-order trap.' },
  { id: 'plan-n2s-stage2', title: 'N→S stage 2: the dict becomes a class', topic: 'oop', level: 'judgment', curriculum: 'Notebook → Service', status: 'planned', seed: 'replace the config/row dicts crossing function boundaries with dataclasses; tests enforce the interface; the stringly-typed trap.' },
  { id: 'plan-n2s-stage3', title: 'N→S stage 3: package structure + config', topic: 'code-craft', level: 'systems', curriculum: 'Notebook → Service', status: 'planned', seed: 'multi-file layout (io / transforms / model / config); imports must resolve; the circular-import and config-sprawl traps.' },
  { id: 'plan-n2s-stage4', title: 'N→S stage 4: tests around the pipeline', topic: 'code-craft', level: 'systems', curriculum: 'Notebook → Service', status: 'planned', seed: 'write pytest-style tests (fixtures, edge rows, a regression case) that catch three planted bugs; the happy-path-only trap.' },
  { id: 'plan-n2s-stage5', title: 'N→S stage 5: a mock inference endpoint', topic: 'ai-eng', level: 'systems', curriculum: 'Notebook → Service', status: 'planned', seed: 'implement handle(request)->response over the pipeline: validation, error codes, idempotent retries; tests simulate requests; the 500-for-bad-input trap.' },
];

export default pyLabPlanned;

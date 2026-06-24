// pyLabPlanned — PyLab curriculum coverage map + SKELETON placeholders for the gaps.
//
// Mirrors PAL's PythonLab "Planned curriculum" (6 categories) against PyLab's actual
// 136-problem bank, from the coverage audit on 2026-06-24. Two exports:
//   pyLabCurriculum — the full 25-item map, each tagged covered | partial | planned.
//   pyLabPlanned    — the partial + planned items as authoring stubs (topic + level + seed).
//
// SKELETON ONLY: this file is UNIMPORTED (no build/gate impact, like foundationsRooms.js).
// A future authoring pass turns each stub into a real gated problem (fixture + solution +
// judgment layer) in a pyLabBatch_*.js, run through the four gates. Most gaps are the
// SYSTEMS tier (currently 0 problems) — i.e. Phase-4 take-home content. See
// docs/PYLAB-CURRICULUM.md. House syntax: single quotes, no backticks.

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
  { category: 'Interview Patterns', items: [
    { title: 'explain your approach before coding', status: 'covered', evidence: 'Ambiguity drill + beforeWriting' },
    { title: 'catch silent bugs (merge inflation, unsorted pct_change)', status: 'covered', evidence: 'trap system + Trap Museum (100 traps)' },
    { title: 'validate output row counts', status: 'covered', evidence: 'schema shape-only panel + merge-audit problem' },
    { title: 'narrate trade-offs', status: 'covered', evidence: 'judgment dial: methods + tradeoff/breaksWhen' },
  ] },
];

export const pyLabPlanned = [
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
];

export default pyLabPlanned;

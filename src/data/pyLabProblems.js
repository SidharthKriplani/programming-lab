// pyLabProblems — PyLab problem bank (PYLAB-BUILD-SPEC §2). One filterable bank for
// pandas/numpy AND Python. SEED set (4) proving the pipeline end-to-end; the full
// fluency + footgun + judgment banks are authored in gated batches on top of this.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for
// newlines; escape prose apostrophes as \' ; NO template literals / backticks.
//
// Per-problem: id, title, topic, difficulty, tags, estimatedMin, fixtureId, prompt
// (de-jargoned), signature, starterCode, hints[>=2], solution (canonical, defines solve),
// compare (typed-comparator cfg), debrief (from EXECUTED divergence), and the optional
// judgment layer (canonicalMethodId, methods[], dial, mcqs). Single-method problems get
// an EMPTY dial (honesty rule). Expected output is NEVER stored - computed from solution.

import { problems as _bRamp1 } from './pyLabBatch_ramp1.js';
import { problems as _bGroupby } from './pyLabBatch_groupby.js';
import { problems as _bMergeReshape } from './pyLabBatch_mergereshape.js';
import { problems as _bWindowMissing } from './pyLabBatch_windowmissing.js';
import { problems as _bMisc } from './pyLabBatch_misc.js';
import { problems as _bOop } from './pyLabBatch_oop.js';
import { problems as _bDrills1 } from './pyLabBatch_drills1.js';
import { problems as _bIdioms } from './pyLabBatch_idioms.js';
import { problems as _bDrills3 } from './pyLabBatch_drills3.js';
import { problems as _bDrills2 } from './pyLabBatch_drills2.js';

export const PYLAB_TOPICS = {
  'pandas-groupby': 'pandas · groupby',
  'pandas-merge':   'pandas · merge',
  'pandas-reshape': 'pandas · reshape',
  'pandas-window':  'pandas · window',
  'numpy-vectorize':'numpy · vectorize',
  'python-core':    'python · core',
  'idioms':         'python · idioms',
  'oop':            'python · oop',
};

export const PYLAB_TOPIC_ORDER = [
  'pandas-groupby', 'pandas-merge', 'pandas-reshape', 'pandas-window',
  'numpy-vectorize', 'python-core', 'idioms', 'oop',
];

const _seedProblems = [

  // ───────────────────────── P1 · warmup · single-method (empty dial) ─────────────────────────
  {
    id: 'pylab-total-per-rep',
    title: 'Total sold per rep',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['groupby', 'aggregate'],
    estimatedMin: 4,
    fixtureId: 'fx_sales',
    prompt: 'Each row is one sale. Return a table with one row per rep and the total amount that rep sold.',
    signature: 'solve(sales)',
    starterCode: 'def solve(sales):\n    # one row per rep, with their total amount\n    ...',
    hints: [
      'Collapse the rows down to one per rep.',
      'Within each rep, add up the amount.',
    ],
    solution: 'def solve(sales):\n    return sales.groupby("rep", as_index=False)["amount"].sum()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'One row per rep with amount summed. There is one honest way to do this - collapse by rep and total the amount. No judgment fork here, so no method dial: this is a fluency rep, not a decision.',
    canonicalMethodId: 'groupby_sum',
    methods: [
      { id: 'groupby_sum', name: 'groupby + sum', code: 'return sales.groupby("rep", as_index=False)["amount"].sum()', tradeoff: 'The direct, single-pass aggregation.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── P2 · core · multi-method + judgment + trap ─────────────────────
  {
    id: 'pylab-rep-share-of-region',
    title: 'Each rep\'s share of their region',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'transform', 'window'],
    estimatedMin: 7,
    fixtureId: 'fx_sales',
    prompt: 'Add a column "share" giving each row\'s amount as a fraction of the total amount sold in that same region. Keep every original row.',
    beforeWriting: 'The denominator is the region\'s total - not the whole table\'s total. Which rows share a denominator?',
    signature: 'solve(sales)',
    starterCode: 'def solve(sales):\n    df = sales.copy()\n    # df["share"] = each amount over its REGION total\n    return df',
    hints: [
      'Every row needs its own region\'s total alongside it - same number of rows out as in.',
      'You can broadcast a per-group total back onto every row of that group without collapsing the frame.',
    ],
    solution: 'def solve(sales):\n    df = sales.copy()\n    df["share"] = df["amount"] / df.groupby("region")["amount"].transform("sum")\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The tell is the denominator. The trap divides by the WHOLE table total (600) instead of the region total, so West\'s ana comes out 100/600 = 0.167 instead of 100/400 = 0.25 - it runs, it looks like a share, and it is wrong. Both honest methods (broadcast the group sum back with transform, or compute region totals and merge them on) give the same frame; transform does it in one pass with no join.',
    canonicalMethodId: 'transform',
    methods: [
      { id: 'transform', name: 'groupby.transform("sum")', code: 'df = sales.copy()\ndf["share"] = df["amount"] / df.groupby("region")["amount"].transform("sum")\nreturn df', detectionSignature: { mustMatch: ['transform'], mustNotMatch: ['merge'], note: 'broadcasts the group total back onto every row' }, tradeoff: 'One pass, no join, keeps row order and index - the idiomatic broadcast-back.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'merge_back', name: 'group totals + merge', code: 'tot = sales.groupby("region", as_index=False)["amount"].sum().rename(columns={"amount": "rt"})\ndf = sales.merge(tot, on="region")\ndf["share"] = df["amount"] / df["rt"]\ndf = df.drop(columns="rt")\nreturn df', detectionSignature: { mustMatch: ['merge'], mustNotMatch: [], note: 'aggregate then join the total back' }, tradeoff: 'Same result, but materialises a totals frame and a join - more memory and a merge to reason about.', breaksWhen: 'If the merge key is not unique on the right it fans out and silently duplicates rows.', isTrap: false },
      { id: 'global_total', name: 'divide by the whole-table total', code: 'df = sales.copy()\ndf["share"] = df["amount"] / df["amount"].sum()\nreturn df', detectionSignature: { mustMatch: ['amount"].sum()'], mustNotMatch: ['groupby', 'transform', 'merge'], note: 'wrong denominator - global, not per region' }, tradeoff: 'Looks like a share and runs cleanly.', breaksWhen: 'Always wrong here - it answers "share of all sales", not "share of region".', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['transform', 'merge_back'], why: 'transform is one vectorized pass; the merge builds an extra frame and shuffles to join.' },
        { when: { 'readability': 'team' }, rank: ['merge_back', 'transform'], why: 'an explicit totals-then-join reads more obviously to reviewers unfamiliar with transform broadcasting.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the third approach run but return the wrong answer?', options: ['transform', 'merge_back', 'global_total'], answerId: 'global_total', explanation: 'It divides by the whole-table sum (600), not the per-region sum, so every share is scaled to the wrong denominator. It is a textbook "runs, wrong" - the shape is right, the numbers are not.' },
      { id: 'q2', stem: 'On a 50M-row frame, which valid method is cheaper?', options: ['transform', 'merge_back'], answerId: 'transform', explanation: 'transform broadcasts the group aggregate back in a single vectorized pass; merge_back materialises a second frame and performs a join (hash/sort + extra memory). Same answer, more work. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── P3 · core · footgun / forensic (dropna) ─────────────────────
  {
    id: 'pylab-region-total-keep-unknown',
    title: 'Region totals, including unknown',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'nan', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_sales_nan',
    prompt: 'Return the total amount for each region. Rows whose region is unknown still count - report them as their own "unknown" group, do not drop them.',
    beforeWriting: 'What does the default grouping do with a missing key? Will the unknown-region sale show up at all?',
    signature: 'solve(sales)',
    starterCode: 'def solve(sales):\n    # total per region - and the unknown-region row must NOT vanish\n    ...',
    hints: [
      'Group by region and sum - but check whether the missing-region row survives.',
      'Grouping drops rows with a missing key unless you tell it not to.',
    ],
    solution: 'def solve(sales):\n    return sales.groupby("region", dropna=False, as_index=False)["amount"].sum()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The footgun is silent: a plain groupby("region") drops the row whose region is None, so the 50 from that sale just disappears and the totals quietly understate. The fix is dropna=False, which keeps the missing key as its own NaN group. It runs either way - the only tell is a row that should be there and is not.',
    canonicalMethodId: 'keep_nan',
    methods: [
      { id: 'keep_nan', name: 'groupby(dropna=False)', code: 'return sales.groupby("region", dropna=False, as_index=False)["amount"].sum()', detectionSignature: { mustMatch: ['dropna=False'], mustNotMatch: [], note: 'keeps the missing-key group' }, tradeoff: 'Correct - the unknown-region sale is kept as its own group.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'drop_nan', name: 'plain groupby (default)', code: 'return sales.groupby("region", as_index=False)["amount"].sum()', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: ['dropna=False'], note: 'default dropna=True silently drops the None group' }, tradeoff: 'Reads fine and runs clean.', breaksWhen: 'Any missing group key - the row vanishes and the total silently understates.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the default groupby return a total that is too low?', options: ['keep_nan', 'drop_nan'], answerId: 'drop_nan', explanation: 'groupby drops rows with a NaN key by default (dropna=True), so the unknown-region sale is excluded from every total. dropna=False keeps it as its own group.' },
    ],
  },

  // ───────────────────── P4 · core · python-core (value compare) + trap ─────────────────────
  {
    id: 'pylab-group-names-by-team',
    title: 'Group names by team',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['dict', 'collections'],
    estimatedMin: 5,
    fixtureId: 'fx_pairs',
    prompt: 'Given a list of (team, name) pairs, return a dict mapping each team to the list of its names, in the order they appear.',
    signature: 'solve(pairs)',
    starterCode: 'def solve(pairs):\n    out = {}\n    # map each team -> [names in order]\n    return out',
    hints: [
      'A team can appear more than once - you are appending, not assigning.',
      'You need a list to grow per team, created the first time you see that team.',
    ],
    solution: 'def solve(pairs):\n    from collections import defaultdict\n    out = defaultdict(list)\n    for t, n in pairs:\n        out[t].append(n)\n    return dict(out)',
    compare: { kind: 'value' },
    debrief: 'The trap is a dict comprehension {t: n for t, n in pairs} - it ASSIGNS rather than appends, so each team keeps only its last name ("A" ends up "amy", losing "ann"). It runs and returns a dict, just the wrong one. Both honest answers (defaultdict(list) or setdefault) accumulate a list per key.',
    canonicalMethodId: 'defaultdict',
    methods: [
      { id: 'defaultdict', name: 'defaultdict(list)', code: 'from collections import defaultdict\nout = defaultdict(list)\nfor t, n in pairs:\n    out[t].append(n)\nreturn dict(out)', detectionSignature: { mustMatch: ['defaultdict'], mustNotMatch: [], note: 'auto-creates the list per key' }, tradeoff: 'The idiomatic accumulate-into-groups.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'setdefault', name: 'dict.setdefault', code: 'out = {}\nfor t, n in pairs:\n    out.setdefault(t, []).append(n)\nreturn out', detectionSignature: { mustMatch: ['setdefault'], mustNotMatch: [], note: 'creates the list on first sight of the key' }, tradeoff: 'Same result without an import; setdefault is a touch easier to misread.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'dict_comp', name: 'dict comprehension', code: 'return {t: n for t, n in pairs}', detectionSignature: { mustMatch: ['for'], mustNotMatch: ['append', 'setdefault'], note: 'assigns, so later names overwrite earlier ones' }, tradeoff: 'Compact and runs.', breaksWhen: 'Any repeated key - it keeps only the last value, silently dropping the rest.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the dict comprehension lose names?', options: ['defaultdict', 'setdefault', 'dict_comp'], answerId: 'dict_comp', explanation: 'A dict comprehension assigns out[t] = n on each pair, so a repeated team overwrites its earlier value and keeps only the last name. Grouping needs accumulation (append into a list), not assignment.' },
    ],
  },

];

// Seed + every migrated batch. PyLab is the single bank for pandas/numpy AND Python;
// the standalone pandas/idioms/oop/drills rooms fold in here as they migrate (D-PL-20).
export const pyLabProblems = [..._bRamp1, ..._seedProblems, ..._bGroupby, ..._bMergeReshape, ..._bWindowMissing, ..._bMisc, ..._bOop, ..._bDrills1, ..._bIdioms, ..._bDrills3, ..._bDrills2];

export default pyLabProblems;

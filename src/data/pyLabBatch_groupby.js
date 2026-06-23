// pyLabBatch_groupby — migrated pandas groupby / numpy-vectorize problems (PYLAB-BUILD-SPEC
// §2 schema, §3 compare contract, §5 judgment layer, §7 content standard). Source: the nine
// pd-* problems in src/data/pandasProblems.js, re-authored to solve(df) -> output, executed
// expected, >=2 hints, debriefs built from REAL divergence, traps proven to RUN AND DIVERGE.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside;
// \n for newlines; escape prose apostrophes as \' ; NO template literals / backticks.
//
// Honesty rule (§5): two problems are genuinely single-method (revenue, region-summary) and
// ship with an EMPTY dial. The other seven carry a real fork or footgun with >=1 trap that
// runs but diverges. Every trap below was proven divergent in CPython (pandas 2.3) before
// being written - see the batch verify output.

export const problems = [

  // ───────────────────────── pylab-groupby-revenue · warmup · single-method ─────────────────────────
  {
    id: 'pylab-groupby-revenue',
    title: 'Revenue by category',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['groupby', 'aggregate', 'sort'],
    estimatedMin: 4,
    fixtureId: 'fx_category_revenue',
    prompt: 'Each row is one sale with a category and a revenue amount. Return a table with one row per category and its total revenue, ordered with the biggest category first. Columns: category, then revenue. Reset the index.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # one row per category, total revenue, biggest first\n    ...',
    hints: [
      'Collapse the rows down to one per category and total the revenue inside each.',
      'Once you have a total per category, order the result so the largest total sits on top, then renumber the index.',
    ],
    solution: 'def solve(df):\n    return (df.groupby("category", as_index=False)["revenue"]\n              .sum()\n              .sort_values("revenue", ascending=False)\n              .reset_index(drop=True))',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'One row per category, revenue summed, largest first - a is 60, b is 10. There is one honest way: collapse by category, total the revenue, sort descending. No competing valid approach and no plausible runs-but-wrong fork (a mis-sort would just be a slip, not a different method), so no dial - this is a fluency rep, not a judgment call.',
    canonicalMethodId: 'groupby_sum_sort',
    methods: [
      { id: 'groupby_sum_sort', name: 'groupby + sum + sort', code: 'return (df.groupby("category", as_index=False)["revenue"]\n          .sum()\n          .sort_values("revenue", ascending=False)\n          .reset_index(drop=True))', tradeoff: 'The direct collapse-total-order in one chain.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── pylab-filter-before-aggregate · core · multi-method + trap ─────────────────────
  {
    id: 'pylab-filter-before-aggregate',
    title: 'New-user average order value',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'filter', 'aggregate'],
    estimatedMin: 5,
    fixtureId: 'fx_new_user_orders',
    prompt: 'Each row is one order, tagged with whether the buyer was a new user, and its order value. Return the average order value for new users only, as a single number.',
    beforeWriting: 'Which rows belong in the average - all of them, or only the new-user rows? Decide the population before you take any mean.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # average order value across new-user rows only\n    ...',
    hints: [
      'Narrow to the rows you actually want before computing anything.',
      'Keep only the new-user rows, then take the mean of their order value - not the mean of everyone.',
    ],
    solution: 'def solve(df):\n    new = df[df["is_new"]]\n    return float(new["order_value"].mean())',
    compare: { kind: 'float' },
    debrief: 'New-user orders are 100 and 200, so the answer is 150.0. The trap averages every order (100, 200, 999, 999) and returns 574.5 - it runs, it is a real number, and it silently folds in the two big returning-user orders. The tell: the population was never narrowed. Select the new-user rows first; the mean over that subset is the only thing the question asked for.',
    canonicalMethodId: 'mask_then_mean',
    methods: [
      { id: 'mask_then_mean', name: 'boolean mask, then mean', code: 'new = df[df["is_new"]]\nreturn float(new["order_value"].mean())', tradeoff: 'Filter the population to new users, then aggregate over just those rows - the order the question implies.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'loc_then_mean', name: '.loc filter, then mean', code: 'return float(df.loc[df["is_new"], "order_value"].mean())', tradeoff: 'Same select-then-aggregate in one .loc expression; identical result.', breaksWhen: 'Nothing for this task; a stylistic choice.', isTrap: false },
      { id: 'mean_everyone', name: 'mean over every order', code: 'return float(df["order_value"].mean())', tradeoff: 'Reads as one clean line and returns a number.', breaksWhen: 'Always wrong here - it averages all buyers, contaminating the new-user number with returning-user orders.', isTrap: true },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        { when: { readability: 'team' }, rank: ['mask_then_mean', 'loc_then_mean'], why: 'a named intermediate frame (new) makes the filter-then-aggregate intent explicit to a reviewer; the one-line .loc is terser but easier to skim past.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does averaging every order return the wrong new-user number?', options: ['mask_then_mean', 'loc_then_mean', 'mean_everyone'], answerId: 'mean_everyone', explanation: 'It aggregates before filtering, so the two returning-user orders (999 each) drag the mean up to 574.5. The metric is defined on a subpopulation - you must restrict to that population first, then take the mean.' },
    ],
  },

  // ───────────────────── pylab-vectorize · warmup · multi-method + boundary trap ─────────────────────
  {
    id: 'pylab-vectorize',
    title: 'Label orders high or low',
    topic: 'numpy-vectorize',
    difficulty: 'warmup',
    tags: ['vectorize', 'conditional', 'copy'],
    estimatedMin: 5,
    fixtureId: 'fx_order_values',
    prompt: 'Each row has an order value. Add a column tier set to "high" when the order value is 100 or more, otherwise "low", and return the frame. Do not change the caller\'s original frame.',
    beforeWriting: 'Is 100 itself high or low? The threshold is inclusive - an order of exactly 100 is high.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # add tier: high if order value is at least 100, else low (do not mutate the caller)\n    ...',
    hints: [
      'You are tagging a whole column at once based on a single comparison - no row-by-row loop needed.',
      'Work on a copy so the caller\'s frame is untouched, and remember an order of exactly 100 counts as high (at least 100, not strictly above).',
    ],
    solution: 'def solve(df):\n    import numpy as np\n    df = df.copy()\n    df["tier"] = np.where(df["order_value"] >= 100, "high", "low")\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'With values [50, 100, 150, 99] the tiers are [low, high, high, low] - the 100 is high. The trap uses a strict greater-than (> 100), which silently demotes the exactly-100 order to "low", giving [low, low, high, low]. It runs and looks plausible; only the boundary row exposes it. "At least 100" means >= 100. Both honest forms (np.where or a column .map) produce the same column at compiled speed; the choice is style, not correctness.',
    canonicalMethodId: 'np_where',
    methods: [
      { id: 'np_where', name: 'np.where over the column', code: 'import numpy as np\ndf = df.copy()\ndf["tier"] = np.where(df["order_value"] >= 100, "high", "low")\nreturn df', tradeoff: 'One vectorized pass over the whole column in compiled code - the idiomatic two-way label.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'map_compare', name: 'comparison + map to labels', code: 'df = df.copy()\ndf["tier"] = (df["order_value"] >= 100).map({True: "high", False: "low"})\nreturn df', tradeoff: 'Builds the boolean column then maps it to labels - same result, also vectorized.', breaksWhen: 'Nothing for this task; a stylistic alternative.', isTrap: false },
      { id: 'strict_gt', name: 'strict greater-than threshold', code: 'import numpy as np\ndf = df.copy()\ndf["tier"] = np.where(df["order_value"] > 100, "high", "low")\nreturn df', tradeoff: 'Looks almost identical and runs cleanly.', breaksWhen: 'Any value sitting exactly on the threshold - 100 is labelled "low" when the rule says it should be "high".', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the strict greater-than version mislabel one row?', options: ['np_where', 'map_compare', 'strict_gt'], answerId: 'strict_gt', explanation: 'The rule is inclusive ("100 or more"), so the boundary value 100 must be "high". A strict > 100 excludes exactly 100 and labels it "low". Off-by-one on an inclusive threshold runs without error and only the boundary row reveals it.' },
    ],
  },

  // ───────────────────── pylab-groupby-topn-per-group · core · multi-method + sort trap ─────────────────────
  {
    id: 'pylab-groupby-topn-per-group',
    title: 'Top rep per region',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'top-n', 'sort'],
    estimatedMin: 7,
    fixtureId: 'fx_region_rep_sales',
    prompt: 'Each row is a rep in a region with their sales. Return one row per region: the rep who sold the most in that region. Order the result by region and reset the index.',
    beforeWriting: 'Within a region, which rep do you keep? The one with the highest sales - so the winner has to be identified before you take one row per region.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # one row per region: the highest-selling rep in that region\n    ...',
    hints: [
      'Inside each region you only want the single best-selling rep - so the best one needs to be first before you take one row per region.',
      'Order by region and by sales (highest first), then keep the first row of each region; or pick the index of each region\'s max directly.',
    ],
    solution: 'def solve(df):\n    df = df.sort_values(["region", "sales"], ascending=[True, False])\n    return (df.groupby("region", as_index=False)\n              .head(1)\n              .sort_values("region")\n              .reset_index(drop=True))',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'East\'s winner is d (40) and West\'s is b (30). The trap takes the first row of each region WITHOUT sorting by sales first, so it returns whoever simply appears first in the data - c (5) for East, a (10) for West. It runs and gives one row per region, so the shape looks right, but the reps are wrong. The tell: taking the first row only finds the top seller if the rows were ordered by sales descending first. Sorting then head(1), or picking each group\'s idxmax, both land the real winner.',
    canonicalMethodId: 'sort_head',
    methods: [
      { id: 'sort_head', name: 'sort desc, then first per region', code: 'df = df.sort_values(["region", "sales"], ascending=[True, False])\nreturn (df.groupby("region", as_index=False)\n          .head(1)\n          .sort_values("region")\n          .reset_index(drop=True))', tradeoff: 'Order by sales first so the winner is on top, then take one row per region - generalises to top-N by swapping head(1) for head(N).', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'idxmax', name: 'index of each region\'s max', code: 'idx = df.groupby("region")["sales"].idxmax()\nreturn df.loc[idx].sort_values("region").reset_index(drop=True)', tradeoff: 'Goes straight to the row holding each region\'s maximum - no sort needed, but only returns one winner per group (ties resolve to the first max).', breaksWhen: 'When you need the top N rather than just the single top row - idxmax is single-winner only.', isTrap: false },
      { id: 'unsorted_head', name: 'first row per region, unsorted', code: 'return (df.groupby("region", as_index=False)\n          .head(1)\n          .sort_values("region")\n          .reset_index(drop=True))', tradeoff: 'Looks like the sorted version and runs to one row per region.', breaksWhen: 'Always, unless the input already happens to be sorted by sales - head(1) takes whoever appears first, not the top seller.', isTrap: true },
    ],
    dial: {
      axes: ['top-n-vs-single'],
      rules: [
        { when: { 'top-n-vs-single': 'single' }, rank: ['idxmax', 'sort_head'], why: 'for exactly one winner per group, idxmax goes straight to the max row without ordering the whole frame.' },
        { when: { 'top-n-vs-single': 'topN' }, rank: ['sort_head', 'idxmax'], why: 'sort-then-head(N) generalises to the top N per group; idxmax only ever returns a single row.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does taking the first row of each region (without sorting) return the wrong rep?', options: ['sort_head', 'idxmax', 'unsorted_head'], answerId: 'unsorted_head', explanation: 'head(1) returns whichever row appears first within the group, which equals the top seller only if the rows were already ordered by sales descending. Without that sort it returns a positional first, not the maximum.' },
      { id: 'q2', stem: 'You need the top THREE reps per region, not just one. Which approach extends cleanly?', options: ['sort_head', 'idxmax'], answerId: 'sort_head', explanation: 'sort-then-head(N) becomes top-N by changing 1 to N. idxmax is structurally single-winner - it returns the index of one maximum per group and cannot give you the next two.' },
    ],
  },

  // ───────────────────── pylab-groupby-rank-within · core · multi-method + global-rank trap ─────────────────────
  {
    id: 'pylab-groupby-rank-within',
    title: 'Rank reps inside their region',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'rank', 'window'],
    estimatedMin: 7,
    fixtureId: 'fx_region_rank',
    prompt: 'Each row is a rep in a region with their sales. Add a column rnk that ranks reps by sales within their own region - the top seller in each region is 1, and reps tied on sales share the same rank with no gap after. Keep every row.',
    beforeWriting: 'Is rank 1 the best seller across the whole company, or the best within each region? The comparison resets at every region boundary.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # add rnk: 1 = top seller WITHIN the region, ties share a rank, every row kept\n    ...',
    hints: [
      'The ranking restarts inside each region - a rep is only competing with others in the same region.',
      'Rank the sales separately within each region (highest = 1), using a dense ranking so ties share a number and the next rank does not skip.',
    ],
    solution: 'def solve(df):\n    df = df.copy()\n    df["rnk"] = df.groupby("region")["sales"].rank(method="dense", ascending=False).astype(int)\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Within West, b (30) is 1 and a (10) is 2; within East, c and d both sit at 40 and share rank 1. The trap ranks sales across the WHOLE table, so West\'s a and b become 3 and 2 (because East\'s 40s outrank them) instead of 2 and 1. It runs and fills the column, but the numbers answer the wrong question - global standing, not within-region standing. The fix is to rank inside each region; dense ranking keeps tied reps on the same number with no gap.',
    canonicalMethodId: 'group_rank',
    methods: [
      { id: 'group_rank', name: 'rank within each region', code: 'df = df.copy()\ndf["rnk"] = df.groupby("region")["sales"].rank(method="dense", ascending=False).astype(int)\nreturn df', tradeoff: 'Ranks each region independently and broadcasts back to every row - dense so ties share a rank with no gap.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'global_rank', name: 'rank across the whole table', code: 'df = df.copy()\ndf["rnk"] = df["sales"].rank(method="dense", ascending=False).astype(int)\nreturn df', tradeoff: 'Reads almost identically and produces an integer rank column.', breaksWhen: 'Always here - it ranks every rep against every other rep regardless of region, so a region\'s local leader can show a rank > 1.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does ranking sales across the whole table give the wrong answer?', options: ['group_rank', 'global_rank'], answerId: 'global_rank', explanation: 'A global rank compares every rep against every other rep, so reps in a lower-selling region are pushed down by higher numbers elsewhere. The question asks for standing within each region, which requires grouping by region before ranking.' },
    ],
  },

  // ───────────────────── pylab-groupby-transform-broadcast · core · multi-method + global-mean trap ─────────────────────
  {
    id: 'pylab-groupby-transform-broadcast',
    title: 'Region average beside every row',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'transform', 'broadcast'],
    estimatedMin: 7,
    fixtureId: 'fx_region_sales_broadcast',
    prompt: 'Each row is a sale in a region. Add a column region_mean holding the average sales of that row\'s region, and keep exactly the same number of rows as the input.',
    beforeWriting: 'The output has the same row count as the input - so this is a value placed next to each row, not a collapsed summary table.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # add region_mean: this row\'s region average, same number of rows as the input\n    ...',
    hints: [
      'You are attaching each region\'s average back onto every one of its rows - the frame must not shrink.',
      'Compute the per-region average and broadcast it back to every row of that region, rather than collapsing to one row per region.',
    ],
    solution: 'def solve(df):\n    df = df.copy()\n    df["region_mean"] = df.groupby("region")["sales"].transform("mean")\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'West averages 20 and East averages 50, and each value lands on its own region\'s rows. The trap assigns the WHOLE-table mean (35) to every row - it runs, the column is full, but it ignores region entirely. The tell: a single constant down the column instead of one value per region. Both honest paths give the same frame - broadcast the group mean back with a transform, or aggregate region means and merge them on - but the transform does it in one pass without building and joining a second frame.',
    canonicalMethodId: 'transform_mean',
    methods: [
      { id: 'transform_mean', name: 'broadcast the group mean back', code: 'df = df.copy()\ndf["region_mean"] = df.groupby("region")["sales"].transform("mean")\nreturn df', tradeoff: 'One pass, no join, preserves row order and length - the idiomatic broadcast-back.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'merge_mean', name: 'region means + merge', code: 'm = df.groupby("region", as_index=False)["sales"].mean().rename(columns={"sales": "region_mean"})\nreturn df.merge(m, on="region")', tradeoff: 'Same result, but builds a separate means frame and joins it on - more memory and a merge to reason about.', breaksWhen: 'If the region key were duplicated on the means side it would fan out and duplicate rows - safe here because the aggregate produces one row per region.', isTrap: false },
      { id: 'global_mean', name: 'assign the whole-table mean', code: 'df = df.copy()\ndf["region_mean"] = df["sales"].mean()\nreturn df', tradeoff: 'Keeps the row count and fills the column without error.', breaksWhen: 'Always here - it ignores region and writes the single overall average to every row.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['transform_mean', 'merge_mean'], why: 'transform broadcasts in a single vectorized pass; the merge materialises a second frame and shuffles to join.' },
        { when: { readability: 'team' }, rank: ['merge_mean', 'transform_mean'], why: 'an explicit means-then-join reads more obviously to reviewers unfamiliar with transform broadcasting.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does assigning df["sales"].mean() to the column give the wrong answer?', options: ['transform_mean', 'merge_mean', 'global_mean'], answerId: 'global_mean', explanation: 'df["sales"].mean() is one scalar - the average over all rows - so every region gets the same 35 instead of its own average. The value has to be computed per region (grouped) and broadcast back, which is what transform does.' },
      { id: 'q2', stem: 'On a very large frame, which valid method does less work?', options: ['transform_mean', 'merge_mean'], answerId: 'transform_mean', explanation: 'transform computes the per-group aggregate and aligns it back in a single vectorized pass. The merge path materialises a second frame and performs a join (hash/sort plus extra memory) for the same result. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── pylab-groupby-named-agg · core · single-method ─────────────────────
  {
    id: 'pylab-groupby-named-agg',
    title: 'Region summary in one pass',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'aggregate', 'named-agg'],
    estimatedMin: 6,
    fixtureId: 'fx_region_summary',
    prompt: 'Each row is a sale in a region. Return one row per region with three columns - total_sales (the sum), avg_sales (the average), and n_orders (the count of orders) - with region first and the rows ordered by region.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # one row per region: total_sales, avg_sales, n_orders\n    ...',
    hints: [
      'All three numbers come from the same sales column, summarised per region in one collapse.',
      'Produce the three summaries together and give each output column its exact name, with region as a plain column up front.',
    ],
    solution: 'def solve(df):\n    return (df.groupby("region")\n              .agg(total_sales=("sales", "sum"),\n                   avg_sales=("sales", "mean"),\n                   n_orders=("sales", "count"))\n              .reset_index()\n              .sort_values("region")\n              .reset_index(drop=True))',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'East: total 40, avg 40, 1 order. West: total 40, avg 20, 2 orders. Computing several named summaries of the same column in one collapse is a single honest approach - whether you name the outputs directly or aggregate a list and rename afterward, it is the same operation and the same result. No runs-but-wrong fork lives here (getting a column name wrong fails loudly rather than passing quietly), so there is no dial: this is fluency.',
    canonicalMethodId: 'named_agg',
    methods: [
      { id: 'named_agg', name: 'named aggregation', code: 'return (df.groupby("region")\n          .agg(total_sales=("sales", "sum"),\n               avg_sales=("sales", "mean"),\n               n_orders=("sales", "count"))\n          .reset_index()\n          .sort_values("region")\n          .reset_index(drop=True))', tradeoff: 'Computes all three summaries in one pass and names each output column explicitly - no MultiIndex to flatten afterward.', breaksWhen: 'Nothing for this task; it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── pylab-groupby-nunique · warmup · multi-method + count trap ─────────────────────
  {
    id: 'pylab-groupby-nunique',
    title: 'Distinct products per region',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['groupby', 'distinct', 'aggregate'],
    estimatedMin: 5,
    fixtureId: 'fx_region_products',
    prompt: 'Each row records a product sold in a region, and a product can appear more than once. Return one row per region with n_products = how many DIFFERENT products were sold there. Order by region and reset the index.',
    beforeWriting: 'A product that sold three times is still one product. Are you counting rows, or counting different products?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # n_products = number of DIFFERENT products per region\n    ...',
    hints: [
      'Repeated sales of the same product must not inflate the count - you want how many distinct products, not how many sales.',
      'Per region, count the distinct product values (collapsing repeats), then name the column n_products.',
    ],
    solution: 'def solve(df):\n    return (df.groupby("region", as_index=False)["product"]\n              .nunique()\n              .rename(columns={"product": "n_products"})\n              .sort_values("region")\n              .reset_index(drop=True))',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'West sold x, x, y - two distinct products; East sold z, z - one. The trap counts rows instead of distinct values, so West comes out as 3 and East as 2 - it runs and returns a tidy table, but it answers "how many sales" not "how many different products". The tell: repeats were never collapsed. Counting distinct values per group is the only thing that matches "different products".',
    canonicalMethodId: 'group_nunique',
    methods: [
      { id: 'group_nunique', name: 'distinct count per region', code: 'return (df.groupby("region", as_index=False)["product"]\n          .nunique()\n          .rename(columns={"product": "n_products"})\n          .sort_values("region")\n          .reset_index(drop=True))', tradeoff: 'Counts distinct product values per region, ignoring repeats - exactly "how many different products".', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'group_count', name: 'count rows per region', code: 'return (df.groupby("region", as_index=False)["product"]\n          .count()\n          .rename(columns={"product": "n_products"})\n          .sort_values("region")\n          .reset_index(drop=True))', tradeoff: 'Reads almost the same and returns a per-region integer.', breaksWhen: 'Whenever a product repeats - count tallies rows (sales), so duplicates inflate the number above the true distinct-product count.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does counting rows overstate the number of products?', options: ['group_nunique', 'group_count'], answerId: 'group_count', explanation: 'count tallies every row in the group, so a product sold three times contributes three to the total. "How many different products" needs distinct values (nunique), which collapses repeats to one.' },
    ],
  },

  // ───────────────────── pylab-groupby-share-of-total · core · multi-method + wrong-denominator trap ─────────────────────
  {
    id: 'pylab-groupby-share-of-total',
    title: 'Each region\'s share of the total',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['groupby', 'share', 'aggregate'],
    estimatedMin: 7,
    fixtureId: 'fx_region_share',
    prompt: 'Each row is a sale in a region. Return one row per region with its total sales and a share column - that region\'s percent of the overall sales, rounded to one decimal. The shares across all regions should add up to 100.',
    beforeWriting: 'What goes in the denominator of "share of total" - the overall sum across all regions, or something else? Get that wrong and the shares will not add to 100.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # per region: total sales, and its percent of the overall total (1 decimal)\n    ...',
    hints: [
      'First get each region\'s total, then express it against the grand total of all regions.',
      'The denominator is the sum of every region\'s total (the overall sales). Divide each region total by that, times 100, rounded to one decimal - and the shares should sum to 100.',
    ],
    solution: 'def solve(df):\n    g = df.groupby("region", as_index=False)["sales"].sum()\n    g["share"] = (g["sales"] / g["sales"].sum() * 100).round(1)\n    return g.sort_values("region").reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Region totals are West 60 and East 40 on a grand total of 100, so the shares are 60.0 and 40.0 and they sum to 100. The trap divides by the LARGEST region total (the max, 60) instead of the grand total (100), giving West 100.0 and East 66.7 - it runs, it looks like a percentage, but the shares sum to 166.7, not 100. The tell is the denominator: share of total needs the sum of all regions underneath, not the biggest one.',
    canonicalMethodId: 'div_by_grand_total',
    methods: [
      { id: 'div_by_grand_total', name: 'divide by the grand total', code: 'g = df.groupby("region", as_index=False)["sales"].sum()\ng["share"] = (g["sales"] / g["sales"].sum() * 100).round(1)\nreturn g.sort_values("region").reset_index(drop=True)', tradeoff: 'Aggregate to region totals first, then divide each by the sum of all totals - shares add to 100 by construction.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'div_by_max', name: 'divide by the largest region', code: 'g = df.groupby("region", as_index=False)["sales"].sum()\ng["share"] = (g["sales"] / g["sales"].max() * 100).round(1)\nreturn g.sort_values("region").reset_index(drop=True)', tradeoff: 'Produces a percent and runs cleanly; the top region even reads as a tidy 100.', breaksWhen: 'Always for share-of-total - dividing by the max gives "percent of the biggest region", so the column no longer sums to 100.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why do the trap\'s shares fail to add up to 100?', options: ['div_by_grand_total', 'div_by_max'], answerId: 'div_by_max', explanation: 'Dividing by the largest region total instead of the sum of all totals rescales every share to the biggest region, not the whole. Share of total requires the grand total (the sum) as the denominator so the parts add to the whole.' },
    ],
  },

];

export const fixtures = {

  'fx_category_revenue': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"category": ["a", "b", "a", "b", "a"], "revenue": [10, 5, 20, 5, 30]})',
    preview: 'df: category, revenue - a totals 60 (10+20+30), b totals 10 (5+5); distinct so the sort order is unambiguous',
  },

  'fx_new_user_orders': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"is_new": [True, True, False, False], "order_value": [100, 200, 999, 999]})',
    preview: 'df: is_new, order_value - new users ordered 100 and 200 (mean 150); the two returning-user 999s exist to poison a mean-over-everyone',
  },

  'fx_order_values': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"order_value": [50, 100, 150, 99]})',
    preview: 'df: order_value [50, 100, 150, 99] - the exact-100 row is the boundary that a strict > 100 mislabels',
  },

  'fx_region_rep_sales': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E", "E", "E"], "rep": ["a", "b", "c", "d", "e"], "sales": [10, 30, 5, 40, 20]})',
    preview: 'df: region, rep, sales - West top is b (30), East top is d (40); the first-appearing reps (a, c) are NOT the winners, so an unsorted head(1) diverges',
  },

  'fx_region_rank': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E", "E"], "rep": ["a", "b", "c", "d"], "sales": [10, 30, 40, 40]})',
    preview: 'df: region, rep, sales - within West b>a; East c and d tie at 40 (share rank 1). East\'s 40s outrank West globally, so a global rank diverges from a within-region rank',
  },

  'fx_region_sales_broadcast': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E", "E"], "sales": [10, 30, 40, 60]})',
    preview: 'df: region, sales - West mean 20, East mean 50, whole-table mean 35; the distinct region means diverge from the global mean a trap would assign',
  },

  'fx_region_summary': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E"], "sales": [10, 30, 40]})',
    preview: 'df: region, sales - West has two orders (sum 40, avg 20), East one (sum 40, avg 40)',
  },

  'fx_region_products': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "W", "E", "E"], "product": ["x", "x", "y", "z", "z"]})',
    preview: 'df: region, product - West sold x, x, y (2 distinct, 3 rows); East sold z, z (1 distinct, 2 rows); repeats make count diverge from nunique',
  },

  'fx_region_share': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E"], "sales": [30, 30, 40]})',
    preview: 'df: region, sales - West totals 60, East 40, grand total 100; dividing by the max (60) instead of the sum (100) overstates and breaks the sum-to-100 check',
  },

};

export default problems;

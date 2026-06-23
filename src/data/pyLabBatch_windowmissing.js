// pyLabBatch_windowmissing — PyLab migration batch: window + missing-data (PYLAB-BUILD-SPEC §2,3,5,7).
// Migrated from the legacy pandasProblems.js window/missing slices into the solve()->output contract.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside
// (so no inner escaping); \n for newlines; escape prose apostrophes as \' ; NO template literals.
//
// Fixtures are engineered so the footguns FIRE: window fixtures use UNSORTED day/month order so a
// diff/cumsum/rolling/pct_change without a sort silently diverges; the missing-data fixtures use a
// NaN group so per-group fill forks from global fill. Every solution + method VERIFIED in CPython
// (pandas 2.3.3 / numpy 2.2.6) via scripts/pl_compare.py: non-trap == solution, trap runs + diverges.

export const fixtures = {

  // UNSORTED days (3,1,2,5,4) — a window op without sort_values silently uses row order, not time order.
  'fx_daily_unsorted': {
    args: ['daily'],
    setup: 'import pandas as pd\ndaily = pd.DataFrame({"day": [3, 1, 2, 5, 4], "sales": [30, 10, 20, 50, 40]})',
    preview: 'daily: day, sales - rows arrive OUT of day order (3,1,2,5,4). A window op that skips the sort reads them in the wrong order.',
  },

  // UNSORTED month numbers (2,1,3) — a period-over-period growth without sort compares the wrong neighbours.
  'fx_months_unsorted': {
    args: ['monthly'],
    setup: 'import pandas as pd\nmonthly = pd.DataFrame({"month_num": [2, 1, 3], "sales": [150, 100, 120]})',
    preview: 'monthly: month_num, sales - rows arrive out of order (2,1,3). Growth-vs-previous-row needs a sort first.',
  },

  // Date strings out of calendar order — resample re-buckets by the parsed datetime, so order does not matter here.
  'fx_dated_txns': {
    args: ['txns'],
    setup: 'import pandas as pd\ntxns = pd.DataFrame({"date": ["2023-02-10", "2023-01-05", "2023-01-20"], "sales": [30, 10, 20]})',
    preview: 'txns: date (strings, out of order), sales - two January rows and one February row to roll up by month.',
  },

  // NaN inside the West group; West mean (10) != global mean (23.33) so per-group fill forks from global fill.
  'fx_region_scores_nan': {
    args: ['scores'],
    setup: 'import pandas as pd\nimport numpy as np\nscores = pd.DataFrame({"region": ["West", "West", "East", "East"], "score": [10.0, np.nan, 20.0, 40.0]})',
    preview: 'scores: region, score - one West score is missing. West mean is 10; the all-rows mean is ~23.3, so the denominator choice changes the fill.',
  },

  // Three rows at different sparsity: 3 / 2 / 0 non-null. thresh=2 keeps two; dropping any NaN keeps only one.
  'fx_sparse_records': {
    args: ['records'],
    setup: 'import pandas as pd\nimport numpy as np\nrecords = pd.DataFrame({"a": [1.0, 2.0, np.nan], "b": [2.0, 3.0, np.nan], "c": [3.0, np.nan, np.nan]})',
    preview: 'records: a, b, c - row 0 has 3 values, row 1 has 2, row 2 has 0. A near-empty row vs a partial row are different things.',
  },

  // Two products; B has no prior value, so a global forward-fill would bleed A\'s last price into B\'s gap.
  'fx_product_prices_nan': {
    args: ['prices'],
    setup: 'import pandas as pd\nimport numpy as np\nprices = pd.DataFrame({"product": ["A", "A", "B", "B"], "day": [1, 2, 1, 2], "price": [10.0, np.nan, np.nan, 20.0]})',
    preview: 'prices: product, day, price - product A holds at 10 then goes missing; product B starts missing. B has no earlier price of its own to carry.',
  },

  // Plain NaN-per-column audit fixture: a has 1 missing, b has 2, c has none.
  'fx_nan_columns': {
    args: ['data'],
    setup: 'import pandas as pd\nimport numpy as np\ndata = pd.DataFrame({"a": [1.0, np.nan, 3.0], "b": [np.nan, np.nan, 6.0], "c": [7.0, 8.0, 9.0]})',
    preview: 'data: a, b, c - scattered missing values. The first move in a data-quality audit is to count the holes per column.',
  },

};

export const problems = [

  // ───────────────────── pylab-window-rolling-mean · core · multi-method + trap (order) ─────────────────────
  {
    id: 'pylab-window-rolling-mean',
    title: 'Smoothed three-day average',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['window', 'rolling', 'order'],
    estimatedMin: 6,
    fixtureId: 'fx_daily_unsorted',
    prompt: 'Each row is one day of sales. Add a column "roll3" that, for each day, averages that day and the two days before it. The first two days do not have two earlier days, so leave them empty.',
    beforeWriting: 'The rows did not arrive in date order. Does your method read them in time order, or in the order they happen to sit in?',
    signature: 'solve(daily)',
    starterCode: 'def solve(daily):\n    # roll3 = average of this day and the two prior days; first two stay empty\n    ...',
    hints: [
      'A trailing average over a fixed number of days assumes the rows are already in day order - are they?',
      'Put the rows in day order first, then take the trailing average; the first two rows have no full window and stay missing.',
    ],
    solution: 'def solve(daily):\n    df = daily.sort_values("day").reset_index(drop=True)\n    df["roll3"] = df["sales"].rolling(window=3).mean()\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The tell is the order. The rows arrive as days 3,1,2,5,4. If you take the trailing average WITHOUT sorting, the window averages whatever rows are physically adjacent - so the "3-day average" at day 2 is really (day3 + day1 + day2)/3, a meaningless mix. It runs, it produces numbers, and every value is wrong. Sort by day first; then the window walks real time and day 3 correctly averages days 1,2,3 to 20.',
    canonicalMethodId: 'sort_then_roll',
    methods: [
      { id: 'sort_then_roll', name: 'sort by day, then trailing average', code: 'df = daily.sort_values("day").reset_index(drop=True)\ndf["roll3"] = df["sales"].rolling(window=3).mean()\nreturn df', detectionSignature: { mustMatch: ['sort_values', 'rolling'], mustNotMatch: [], note: 'orders by day before windowing' }, tradeoff: 'Correct - the window walks real day order.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'roll_unsorted', name: 'trailing average on the rows as-is', code: 'df = daily.copy()\ndf["roll3"] = df["sales"].rolling(window=3).mean()\nreturn df', detectionSignature: { mustMatch: ['rolling'], mustNotMatch: ['sort_values'], note: 'windows in arrival order, not day order' }, tradeoff: 'Looks identical and runs clean.', breaksWhen: 'Any time the rows are not already sorted by day - the window mixes non-adjacent days and every average is wrong.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does windowing the rows as-is return wrong numbers here?', options: ['sort_then_roll', 'roll_unsorted'], answerId: 'roll_unsorted', explanation: 'A rolling window walks the rows in their current physical order. The rows arrive as days 3,1,2,5,4, so the window averages days that are not actually consecutive in time. Sorting by day first is what makes "trailing 3-day" mean trailing in time.' },
    ],
  },

  // ───────────────────── pylab-window-diff · warmup · multi-method + trap (order) ─────────────────────
  {
    id: 'pylab-window-diff',
    title: 'Change from the day before',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['window', 'diff', 'order'],
    estimatedMin: 5,
    fixtureId: 'fx_daily_unsorted',
    prompt: 'Each row is one day of sales. Add a column "delta" giving how much sales changed from the previous day (today minus yesterday). The earliest day has no day before it, so leave it empty.',
    beforeWriting: 'The rows are not in day order. "The previous day" means the previous row only if the rows are sorted by day.',
    signature: 'solve(daily)',
    starterCode: 'def solve(daily):\n    # delta = this day\'s sales minus the previous DAY\'s sales; earliest day stays empty\n    ...',
    hints: [
      '"Yesterday" is the previous ROW only when the rows are already ordered by day.',
      'Sort by day first, then subtract each row from the one before it; the earliest day has no prior row and stays missing.',
    ],
    solution: 'def solve(daily):\n    df = daily.sort_values("day").reset_index(drop=True)\n    df["delta"] = df["sales"].diff()\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The rows arrive out of day order (3,1,2,5,4). Subtracting each row from the one above it WITHOUT sorting computes "change from the previous ROW", not "change from the previous DAY" - so day 3 gets compared to day 5 and the deltas are nonsense. It runs and fills the column; that is the trap. Sorted by day, sales climb 10,20,30,40,50 and every honest delta is +10.',
    canonicalMethodId: 'sort_then_diff',
    methods: [
      { id: 'sort_then_diff', name: 'sort by day, then subtract the prior row', code: 'df = daily.sort_values("day").reset_index(drop=True)\ndf["delta"] = df["sales"].diff()\nreturn df', detectionSignature: { mustMatch: ['sort_values', 'diff'], mustNotMatch: [], note: 'orders by day so prior-row is prior-day' }, tradeoff: 'Correct - the previous row is genuinely the previous day.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'diff_unsorted', name: 'subtract the prior row as-is', code: 'df = daily.copy()\ndf["delta"] = df["sales"].diff()\nreturn df', detectionSignature: { mustMatch: ['diff'], mustNotMatch: ['sort_values'], note: 'diffs in arrival order, not day order' }, tradeoff: 'Compact and runs.', breaksWhen: 'Any time the rows are not sorted by day - it subtracts the wrong neighbour and the deltas are meaningless.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the as-is difference wrong on this data?', options: ['sort_then_diff', 'diff_unsorted'], answerId: 'diff_unsorted', explanation: 'Differencing subtracts each row from the row physically above it. The rows are not in day order, so "the previous row" is not "the previous day". Sorting by day first makes the prior row the genuine prior day.' },
    ],
  },

  // ───────────────────── pylab-window-cumsum · warmup · multi-method + trap (order) ─────────────────────
  {
    id: 'pylab-window-cumsum',
    title: 'Sales accumulated so far',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['window', 'cumulative', 'order'],
    estimatedMin: 5,
    fixtureId: 'fx_daily_unsorted',
    prompt: 'Each row is one day of sales. Add a column "cumulative" giving the total sales up to and including that day, so the last day equals the grand total.',
    beforeWriting: 'A running total only means anything in day order. The rows are not sorted - does that change your answer?',
    signature: 'solve(daily)',
    starterCode: 'def solve(daily):\n    # cumulative = total sales up to and including each day, in day order\n    ...',
    hints: [
      'A running total walks the rows top to bottom - so the row order has to be the day order, or the partial totals are meaningless.',
      'Sort by day first, then accumulate the sales down the column.',
    ],
    solution: 'def solve(daily):\n    df = daily.sort_values("day").reset_index(drop=True)\n    df["cumulative"] = df["sales"].cumsum()\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'A running total adds the rows top to bottom in their physical order. The rows arrive as days 3,1,2,5,4, so an un-sorted accumulation gives "total of the first N rows as they happen to sit", not "total through day N" - the per-day partials are wrong even though the final grand total happens to match. Sort by day first and the accumulation reads 10,30,60,100,150 - each row a true total-so-far.',
    canonicalMethodId: 'sort_then_cumsum',
    methods: [
      { id: 'sort_then_cumsum', name: 'sort by day, then accumulate', code: 'df = daily.sort_values("day").reset_index(drop=True)\ndf["cumulative"] = df["sales"].cumsum()\nreturn df', detectionSignature: { mustMatch: ['sort_values', 'cumsum'], mustNotMatch: [], note: 'orders by day before accumulating' }, tradeoff: 'Correct - each partial total is a real total-through-that-day.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'cumsum_unsorted', name: 'accumulate the rows as-is', code: 'df = daily.copy()\ndf["cumulative"] = df["sales"].cumsum()\nreturn df', detectionSignature: { mustMatch: ['cumsum'], mustNotMatch: ['sort_values'], note: 'accumulates in arrival order' }, tradeoff: 'Final total matches, so it looks right at a glance.', breaksWhen: 'Any time the rows are not in day order - the intermediate running totals are wrong even though the last value still equals the grand total.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'The un-sorted running total ends at the right grand total. Why is it still wrong?', options: ['sort_then_cumsum', 'cumsum_unsorted'], answerId: 'cumsum_unsorted', explanation: 'The final value of any running total is the full sum regardless of order, so the last cell looks fine. But every intermediate "total so far" is computed in arrival order, not day order, so the per-day partials are wrong. Sorting by day fixes the partials.' },
    ],
  },

  // ───────────────────── pylab-window-pct-change · core · multi-method + trap (order) ─────────────────────
  {
    id: 'pylab-window-pct-change',
    title: 'Growth versus the prior month',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['window', 'growth', 'order'],
    estimatedMin: 6,
    fixtureId: 'fx_months_unsorted',
    prompt: 'Each row is one month of sales (month_num is the calendar order). Add a column "growth" giving the percent change in sales versus the previous month, rounded to one decimal. The first month has nothing before it, so leave it empty.',
    beforeWriting: 'The rows are not in month order. Percent-change-vs-previous compares each row to the one above it - so order is the whole game.',
    signature: 'solve(monthly)',
    starterCode: 'def solve(monthly):\n    # growth = percent change vs the previous month, 1 decimal; first month stays empty\n    ...',
    hints: [
      'Percent change compares each row to the row above it - that only equals "vs previous month" when the rows are in month order.',
      'Sort by month_num first, then take the percent change down the sales column and multiply by 100.',
    ],
    solution: 'def solve(monthly):\n    df = monthly.sort_values("month_num").reset_index(drop=True)\n    df["growth"] = (df["sales"].pct_change() * 100).round(1)\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The rows arrive as months 2,1,3. Percent-change-vs-previous-row WITHOUT sorting compares month 2 to nothing, month 1 to month 2, month 3 to month 1 - all the wrong pairings, and it runs cleanly. Sorted by month_num the series is 100,150,120, so month 2 is +50.0% and month 3 is -20.0%. The fix is one sort before the growth call.',
    canonicalMethodId: 'sort_then_pct',
    methods: [
      { id: 'sort_then_pct', name: 'sort by month, then percent change', code: 'df = monthly.sort_values("month_num").reset_index(drop=True)\ndf["growth"] = (df["sales"].pct_change() * 100).round(1)\nreturn df', detectionSignature: { mustMatch: ['sort_values', 'pct_change'], mustNotMatch: [], note: 'orders by month before comparing' }, tradeoff: 'Correct - each row is compared to the genuine previous month.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'pct_unsorted', name: 'percent change on the rows as-is', code: 'df = monthly.copy()\ndf["growth"] = (df["sales"].pct_change() * 100).round(1)\nreturn df', detectionSignature: { mustMatch: ['pct_change'], mustNotMatch: ['sort_values'], note: 'compares in arrival order, not month order' }, tradeoff: 'Runs and looks like a growth column.', breaksWhen: 'Any time the rows are not in month order - it compares each month to the wrong neighbour.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the as-is percent change report the wrong growth?', options: ['sort_then_pct', 'pct_unsorted'], answerId: 'pct_unsorted', explanation: 'Percent-change compares each row to the row above it. With months arriving 2,1,3, the row above is not the previous month, so each growth figure compares the wrong pair. Sorting by month_num first restores the real month-over-month comparison.' },
    ],
  },

  // ───────────────────── pylab-window-resample-monthly · core · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-window-resample-monthly',
    title: 'Roll daily sales up to months',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['window', 'datetime', 'aggregate'],
    estimatedMin: 6,
    fixtureId: 'fx_dated_txns',
    prompt: 'Each row is a dated sale; the date is stored as text and the rows are not in date order. Return a series of total sales per calendar month, labelled by the first day of each month and in month order.',
    signature: 'solve(txns)',
    starterCode: 'def solve(txns):\n    # parse the date text, then total the sales within each calendar month\n    ...',
    hints: [
      'The date is text right now - turn it into real dates before you can bucket by month.',
      'With a real datetime index you can re-bucket into calendar months and total each bucket; the month grouping handles the out-of-order rows for you.',
    ],
    solution: 'def solve(txns):\n    df = txns.copy()\n    df["date"] = pd.to_datetime(df["date"])\n    return df.set_index("date")["sales"].resample("MS").sum()',
    compare: { kind: 'series', checkDtype: true, checkNames: false, ignoreIndex: false },
    debrief: 'Parse the text to real datetimes, set them as the index, then re-bucket into month-start buckets and sum each. The two January rows (10 + 20) total 30 and February totals 30. There is one honest way to do a calendar-month rollup of a datetime series, and the bucketing re-orders the out-of-order rows by itself - so the rows being unsorted does not matter here. No judgment fork, so no method dial: this is a fluency rep. The only real footgun is forgetting to parse the text date first, which would make month bucketing fail.',
    canonicalMethodId: 'resample_ms',
    methods: [
      { id: 'resample_ms', name: 'parse to datetime, then month-bucket and sum', code: 'df = txns.copy()\ndf["date"] = pd.to_datetime(df["date"])\nreturn df.set_index("date")["sales"].resample("MS").sum()', detectionSignature: { mustMatch: ['to_datetime', 'resample'], mustNotMatch: [], note: 'datetime index re-bucketed to month start' }, tradeoff: 'The direct time-aware monthly rollup; the bucketing sorts the rows for you.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── pylab-missing-fillna-group-mean · core · multi-method + trap (group vs global) ─────────────────────
  {
    id: 'pylab-missing-fillna-group-mean',
    title: 'Patch a missing score',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['missing', 'groupby', 'transform'],
    estimatedMin: 7,
    fixtureId: 'fx_region_scores_nan',
    prompt: 'Each row is a score for one region, and one score is missing. Fill the missing score with the average score of its OWN region - not the average across all rows. Keep every row.',
    beforeWriting: 'Which average is "the score it should have had"? The whole-table average, or the average of the rows that share its region?',
    signature: 'solve(scores)',
    starterCode: 'def solve(scores):\n    # fill the missing score with the mean score of THAT row\'s region\n    ...',
    hints: [
      'The replacement value depends on which region the missing row belongs to - so the average has to be computed per region, not once for the whole table.',
      'Compute each region\'s average and align it back onto that region\'s rows, then use it to fill the gap.',
    ],
    solution: 'def solve(scores):\n    df = scores.copy()\n    df["score"] = df.groupby("region")["score"].transform(lambda s: s.fillna(s.mean()))\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The tell is the denominator of the average. West has one real score (10) and one gap; East has 20 and 40. The trap fills the gap with the WHOLE-TABLE mean of the present scores ((10+20+40)/3 = 23.33) instead of West\'s own mean (10). It runs, it leaves no NaN behind, and the patched West score is silently wrong - 23.3 instead of 10. Computing the mean within each region and filling from that gives the honest answer and preserves the real between-region difference.',
    canonicalMethodId: 'group_mean',
    methods: [
      { id: 'group_mean', name: 'fill from the region\'s own mean', code: 'df = scores.copy()\ndf["score"] = df.groupby("region")["score"].transform(lambda s: s.fillna(s.mean()))\nreturn df', detectionSignature: { mustMatch: ['groupby', 'transform'], mustNotMatch: [], note: 'per-region mean aligned back to fill the gap' }, tradeoff: 'Correct - the gap inherits its own region\'s level.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'global_mean', name: 'fill from the whole-table mean', code: 'df = scores.copy()\ndf["score"] = df["score"].fillna(df["score"].mean())\nreturn df', detectionSignature: { mustMatch: ['fillna'], mustNotMatch: ['groupby', 'transform'], note: 'one mean for everyone, ignoring region' }, tradeoff: 'Shorter, and runs without leaving any NaN.', breaksWhen: 'Whenever groups differ in level - the global mean drags the gap toward the overall average and washes out the real per-region difference.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does filling with the whole-table mean give the wrong score for West?', options: ['group_mean', 'global_mean'], answerId: 'global_mean', explanation: 'The whole-table mean of the present scores is ~23.3, pulled up by East\'s 20 and 40. West\'s only real score is 10, so the gap should be 10. Filling from the global mean ignores region and contaminates the patch with other groups\' levels.' },
    ],
  },

  // ───────────────────── pylab-missing-dropna-thresh · core · multi-method + trap (thresh vs any) ─────────────────────
  {
    id: 'pylab-missing-dropna-thresh',
    title: 'Drop only the near-empty rows',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['missing', 'filter'],
    estimatedMin: 6,
    fixtureId: 'fx_sparse_records',
    prompt: 'Each row has three fields (a, b, c), some missing. Keep every row that has at least two of the three fields filled in; drop only the rows that are emptier than that. Renumber the rows from zero.',
    beforeWriting: 'A row with one gap is still mostly usable. The task is to drop near-empty rows, not every row that has any gap at all.',
    signature: 'solve(records)',
    starterCode: 'def solve(records):\n    # keep rows with at least 2 of the 3 fields present; renumber from 0\n    ...',
    hints: [
      'Keeping rows with "at least two values" is a threshold on the count of present fields - not the same as dropping any row that has a single gap.',
      'There is a row-dropping option that takes a minimum number of non-missing values to survive.',
    ],
    solution: 'def solve(records):\n    return records.dropna(thresh=2).reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Three rows: one full (3 values), one partial (2 values), one near-empty (0 values). The task keeps the first two and drops only the last. The trap drops EVERY row that has any gap at all, so it throws away the usable 2-value row too and keeps only the single complete row. It runs and returns a clean frame - just a smaller one than intended. The threshold ("at least 2 present") keeps the partial row; "drop any NaN" does not.',
    canonicalMethodId: 'thresh_2',
    methods: [
      { id: 'thresh_2', name: 'drop rows below the value threshold', code: 'return records.dropna(thresh=2).reset_index(drop=True)', detectionSignature: { mustMatch: ['thresh'], mustNotMatch: [], note: 'survives with >= 2 non-missing values' }, tradeoff: 'Correct - partial-but-usable rows are kept.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'drop_any', name: 'drop every row with any gap', code: 'return records.dropna().reset_index(drop=True)', detectionSignature: { mustMatch: ['dropna'], mustNotMatch: ['thresh'], note: 'drops a row if it has even one missing field' }, tradeoff: 'Simplest call, and runs.', breaksWhen: 'When partial rows are still useful - it discards every row with a single gap, keeping far fewer rows than the threshold asks for.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does dropping every row with a gap keep too few rows?', options: ['thresh_2', 'drop_any'], answerId: 'drop_any', explanation: 'Dropping any row that has even one missing value also removes the row with two of three fields present - a row the task wants to keep. The threshold ("at least 2 non-missing") keeps partial-but-usable rows and only removes the near-empty one.' },
    ],
  },

  // ───────────────────── pylab-missing-ffill · core · multi-method + trap (group bleed) ─────────────────────
  {
    id: 'pylab-missing-ffill',
    title: 'Carry the last known price forward',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['missing', 'groupby', 'order'],
    estimatedMin: 7,
    fixtureId: 'fx_product_prices_nan',
    prompt: 'Each row is a product\'s price on a day; some prices are missing. For each product, fill a missing price by carrying that SAME product\'s most recent known price forward. A product with no earlier price of its own stays missing.',
    beforeWriting: 'The carry-forward must stay inside one product. Should product B ever inherit product A\'s last price?',
    signature: 'solve(prices)',
    starterCode: 'def solve(prices):\n    # carry each product\'s last known price forward into its own gaps only\n    ...',
    hints: [
      'Carrying a value forward across the whole column lets one product\'s last price leak into the next product\'s gap - the fill has to be done per product.',
      'Carry the price forward within each product\'s own rows, so a product with no prior price of its own keeps its gap.',
    ],
    solution: 'def solve(prices):\n    df = prices.copy()\n    df["price"] = df.groupby("product")["price"].ffill()\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Product A holds at 10 then goes missing; product B starts missing then is 20. The trap carries forward across the WHOLE column, so when it reaches B\'s opening gap it grabs A\'s last price (10) and bleeds it into product B - a price that never belonged to B. It runs and leaves a clean column; the leaked value is the only tell. Carrying forward within each product keeps the fill inside the product, so B\'s opening gap - which has no earlier B price - correctly stays missing.',
    canonicalMethodId: 'group_ffill',
    methods: [
      { id: 'group_ffill', name: 'carry forward within each product', code: 'df = prices.copy()\ndf["price"] = df.groupby("product")["price"].ffill()\nreturn df', detectionSignature: { mustMatch: ['groupby', 'ffill'], mustNotMatch: [], note: 'the carry-forward resets at each product boundary' }, tradeoff: 'Correct - no product inherits another\'s price.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'global_ffill', name: 'carry forward down the whole column', code: 'df = prices.copy()\ndf["price"] = df["price"].ffill()\nreturn df', detectionSignature: { mustMatch: ['ffill'], mustNotMatch: ['groupby'], note: 'one carry-forward across all products' }, tradeoff: 'One call, and runs without leaving NaN.', breaksWhen: 'At any product boundary - the previous product\'s last price bleeds into the next product\'s opening gap.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does carrying forward down the whole column put a wrong price on product B?', options: ['group_ffill', 'global_ffill'], answerId: 'global_ffill', explanation: 'A column-wide carry-forward does not stop at product boundaries, so when it hits product B\'s opening gap it reuses product A\'s last price. Carrying forward within each product resets at the boundary, so B - having no earlier price of its own - keeps its gap.' },
    ],
  },

  // ───────────────────── pylab-missing-count-per-column · warmup · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-missing-count-per-column',
    title: 'Where are the holes',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['missing', 'audit'],
    estimatedMin: 4,
    fixtureId: 'fx_nan_columns',
    prompt: 'A table has scattered missing values. Return a plain mapping from each column name to the number of missing values in that column.',
    signature: 'solve(data)',
    starterCode: 'def solve(data):\n    # map each column name -> how many values are missing in it\n    ...',
    hints: [
      'A "missing" flag per cell is a true/false grid; counting the trues per column gives the holes per column.',
      'Reduce the missing-value grid down each column to a count, then turn it into a plain dictionary.',
    ],
    solution: 'def solve(data):\n    return data.isna().sum().to_dict()',
    compare: { kind: 'value' },
    debrief: 'Mark each cell missing-or-not, then count the missing marks down each column: a has 1, b has 2, c has 0. Booleans count as 1/0 so summing the missing-flag grid per column gives the per-column hole count directly, and converting to a dict gives the plain mapping asked for. There is one honest way to do a per-column missing audit, so no method dial - this is a fluency rep, the first move before trusting any aggregate.',
    canonicalMethodId: 'isna_sum',
    methods: [
      { id: 'isna_sum', name: 'count the missing flags per column', code: 'return data.isna().sum().to_dict()', detectionSignature: { mustMatch: ['isna', 'sum'], mustNotMatch: [], note: 'sum of the per-cell missing flags, per column' }, tradeoff: 'The direct per-column missing count.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

];

export default problems;

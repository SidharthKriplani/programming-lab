// pyLabBatch_misc — migration batch: selection / metrics / dedup / datetime (13 problems)
// from the legacy pandasProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// Topic map (spec-constrained, no invented topics): selection -> pandas-window
// (loc-assign is the chained-assignment footgun); metrics (ctr/rate) -> pandas-groupby;
// dedup -> pandas-groupby; datetime -> pandas-window.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside; \n for newlines; escape PROSE apostrophes as \' ; NO template literals / backticks.
//
// Every solution + method + trap VERIFIED in CPython (pandas 2.3) via pl_compare:
// 6 single-method (empty dial, honesty rule), 7 multi-method (each carries >=1 trap that
// RUNS and DIVERGES). Expected output is NEVER stored - computed from `solve`.

export const fixtures = {
  // selection multi-mask: West+>=100 must match two rows; one West<100 and one East>=100
  // exercise BOTH legs of the AND (region wrong, amount wrong).
  'fx_orders_region': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"region": ["West", "West", "East", "West"], "amount": [150, 50, 200, 100]})',
    preview: 'orders: region, amount. West>=100 -> rows 0 and 3 (150, 100); the West/50 and East/200 rows must be excluded.',
  },
  // selection query: amount>100 AND region East -> exactly one row (East/150).
  'fx_orders_east': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"region": ["East", "East", "West"], "amount": [150, 80, 200]})',
    preview: 'orders: region, amount. Only East/150 satisfies amount>100 AND region==East (East/80 fails amount, West/200 fails region).',
  },
  // nlargest: 5 orders, top-3 by amount with a clear order (90, 50, 30).
  'fx_orders_amount': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 2, 3, 4, 5], "amount": [10, 50, 30, 90, 20]})',
    preview: 'orders: order_id, amount. Top 3 amounts are 90 (id 4), 50 (id 2), 30 (id 3).',
  },
  // loc-assign: chained-assignment target. Writing into a boolean-filtered slice no-ops.
  'fx_orders_flag': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 2, 3], "amount": [50, 100, 150]})',
    preview: 'orders: order_id, amount. amount>=100 -> ids 2,3 are "big", id 1 is "small". The chained-assignment trap silently leaves all three "small".',
  },
  // safe-ctr: a ZERO-denominator row (impressions 0) so naive divide yields inf/NaN.
  'fx_clicks': {
    args: ['ad'],
    setup: 'import pandas as pd\nad = pd.DataFrame({"clicks": [5, 0, 3], "impressions": [100, 0, 0]})',
    preview: 'ad: clicks, impressions. Row 0 is a clean 0.05; rows 1 and 2 have ZERO impressions - the naive ratio is NaN then inf.',
  },
  // conversion-rate scalar: 2 of 4 converted -> 50.0.
  'fx_signups': {
    args: ['users'],
    setup: 'import pandas as pd\nusers = pd.DataFrame({"user_id": [1, 2, 3, 4], "converted": [True, False, True, False]})',
    preview: 'users: user_id, converted. 2 of 4 converted -> 50.0 percent.',
  },
  // rate per region: West 1/2=50, East 2/2=100; the global-denominator trap divides by 4.
  'fx_conv_region': {
    args: ['users'],
    setup: 'import pandas as pd\nusers = pd.DataFrame({"region": ["West", "West", "East", "East"], "converted": [True, False, True, True]})',
    preview: 'users: region, converted. West 1/2 -> 50.0, East 2/2 -> 100.0. The global-denominator trap divides by all 4 users -> 25.0 / 50.0.',
  },
  // dedup keep-last: time-ordered, repeated user rows. Last state wins.
  'fx_user_states': {
    args: ['events'],
    setup: 'import pandas as pd\nevents = pd.DataFrame({"user_id": [1, 1, 2, 2, 2], "status": ["a", "b", "c", "d", "e"]})',
    preview: 'events: user_id, status, oldest-first. Latest per user is 1->b, 2->e. keep="first" would hand back the stale a, c.',
  },
  // count duplicates: fully-repeated rows. (1,x) appears 3 times -> 2 extra copies.
  'fx_rows_dupe': {
    args: ['rows'],
    setup: 'import pandas as pd\nrows = pd.DataFrame({"a": [1, 1, 2, 1], "b": ["x", "x", "y", "x"]})',
    preview: 'rows: a, b. The row (1,x) appears 3 times -> 2 are duplicates of an earlier row; (2,y) is unique.',
  },
  // dense-rank: a TIE on the key (two reps at 100) so dense vs min diverges after the tie.
  'fx_rep_sales_tie': {
    args: ['sales'],
    setup: 'import pandas as pd\nsales = pd.DataFrame({"rep": ["a", "b", "c", "d"], "sales": [100, 100, 80, 60]})',
    preview: 'sales: rep, sales. a and b TIE at 100. Dense ranks: 1,1,2,3. The min-method trap skips to 1,1,3,4.',
  },
  // datetime extract-month
  'fx_dates': {
    args: ['logs'],
    setup: 'import pandas as pd\nlogs = pd.DataFrame({"date": ["2023-01-15", "2023-03-20", "2023-12-31"]})',
    preview: 'logs: date as strings. Months are 1, 3, 12.',
  },
  // half-open range: a row EXACTLY on the end boundary (2023-02-01) - the double-count tell.
  'fx_dated_amounts': {
    args: ['logs'],
    setup: 'import pandas as pd\nlogs = pd.DataFrame({"date": ["2023-01-01", "2023-01-15", "2023-02-01"], "amount": [10, 20, 30]})',
    preview: 'logs: date strings, amount. For [2023-01-01, 2023-02-01) two rows qualify (10, 20); the 2023-02-01 boundary row (30) belongs to NEXT month.',
  },
  // days-between
  'fx_signup_purchase': {
    args: ['cust'],
    setup: 'import pandas as pd\ncust = pd.DataFrame({"signup": ["2023-01-01", "2023-01-10"], "purchase": ["2023-01-08", "2023-01-12"]})',
    preview: 'cust: signup, purchase strings. Gaps are 7 and 2 whole days.',
  },
};

export const problems = [

  // ───────────────────── selection · multi-mask (window) · single-method ─────────────────────
  {
    id: 'pylab-pd-selection-multi-mask',
    title: 'Big orders in one region',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['selection', 'filter', 'boolean'],
    estimatedMin: 4,
    fixtureId: 'fx_orders_region',
    prompt: 'Each row is an order with its region and amount. Return only the orders from the West region that are worth at least 100, with a clean 0-based row numbering.',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # keep West orders worth >= 100; renumber the rows\n    ...',
    hints: [
      'You have two conditions that must BOTH hold - region is West and amount is at least 100.',
      'Build each condition over the whole column, then combine them so a row survives only when both are true.',
    ],
    solution: 'def solve(orders):\n    mask = (orders["region"] == "West") & (orders["amount"] >= 100)\n    return orders[mask].reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Two rows survive: West/150 and West/100. The fixture is built to punish a half-filter - West/50 fails the amount test and East/200 fails the region test, so any answer that keeps three rows combined the conditions wrong (an OR, or only one of them). Combine the two column-wide conditions so a row survives only when both are true, wrapping each comparison in parentheses. There is one honest way to express this, so no method dial - it is a fluency rep.',
    canonicalMethodId: 'two_masks',
    methods: [
      { id: 'two_masks', name: 'combined boolean mask', code: 'mask = (orders["region"] == "West") & (orders["amount"] >= 100)\nreturn orders[mask].reset_index(drop=True)', detectionSignature: { mustMatch: ['&'], mustNotMatch: [], note: 'element-wise AND of the two conditions' }, tradeoff: 'The direct, single-pass row filter.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── selection · query (window) · single-method ─────────────────────
  {
    id: 'pylab-pd-selection-query',
    title: 'High-value East orders',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['selection', 'filter', 'boolean'],
    estimatedMin: 4,
    fixtureId: 'fx_orders_east',
    prompt: 'Each row is an order with its region and amount. Return only the East-region orders worth more than 100, renumbered from zero.',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # keep East orders with amount strictly greater than 100\n    ...',
    hints: [
      'Strictly greater than 100 means the boundary value 100 itself does NOT qualify - use a strict comparison.',
      'Both conditions must hold at once: region is East and amount exceeds 100.',
    ],
    solution: 'def solve(orders):\n    return orders[(orders["amount"] > 100) & (orders["region"] == "East")].reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Exactly one row qualifies: East/150. The fixture has two near-misses - East/80 is the right region but fails amount > 100, and West/200 clears the amount but is the wrong region - so any answer returning two rows lost one of the conditions. Combine both column-wide conditions and keep the amount comparison strict. One honest expression, so no fork.',
    canonicalMethodId: 'bracket_mask',
    methods: [
      { id: 'bracket_mask', name: 'combined boolean mask', code: 'return orders[(orders["amount"] > 100) & (orders["region"] == "East")].reset_index(drop=True)', detectionSignature: { mustMatch: ['&'], mustNotMatch: [], note: 'AND of a strict amount test and an equality test' }, tradeoff: 'One readable filter expression.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── selection · nlargest (window) · multi-method + trap ─────────────────────
  {
    id: 'pylab-pd-selection-nlargest',
    title: 'Three biggest orders',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['selection', 'top-n', 'sort'],
    estimatedMin: 5,
    fixtureId: 'fx_orders_amount',
    prompt: 'Each row is an order with an amount. Return the three highest-amount orders, already ordered from biggest to smallest, with a clean 0-based row numbering.',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # the three biggest orders, biggest first\n    ...',
    hints: [
      'You want the top of the distribution - the rows with the largest amounts, in descending order.',
      'Whether you take the top directly or order the whole frame first, the three rows you keep must be the LARGEST three, not the smallest.',
    ],
    solution: 'def solve(orders):\n    return orders.nlargest(3, "amount").reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The right answer is amounts [90, 50, 30] (order ids 4, 2, 3). The trap orders ascending and takes the first three, returning the SMALLEST orders [10, 20, 30] - it runs cleanly and has the right shape, which is exactly why it slips through review. Two honest methods give the same frame: pull the top three directly, or order descending and take the head. The direct top-N avoids ordering the whole frame, so it is cheaper at scale; the explicit sort reads more obviously to a reviewer.',
    canonicalMethodId: 'nlargest',
    methods: [
      { id: 'nlargest', name: 'take the top N directly', code: 'return orders.nlargest(3, "amount").reset_index(drop=True)', detectionSignature: { mustMatch: ['nlargest'], mustNotMatch: [], note: 'partial selection of the top rows, no full ordering' }, tradeoff: 'Returns the top rows pre-ordered without ordering the entire frame - cheaper on large data.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'sort_head', name: 'order descending, take the head', code: 'return orders.sort_values("amount", ascending=False).head(3).reset_index(drop=True)', detectionSignature: { mustMatch: ['sort_values', 'head'], mustNotMatch: ['nlargest'], note: 'full descending order then slice the first three' }, tradeoff: 'Same result and very explicit, but orders the whole frame before discarding most of it.', breaksWhen: 'Nothing for this task - just does more work than needed at scale.', isTrap: false },
      { id: 'wrong_direction', name: 'order ascending, take the head', code: 'return orders.sort_values("amount").head(3).reset_index(drop=True)', detectionSignature: { mustMatch: ['sort_values', 'head'], mustNotMatch: ['ascending=False', 'nlargest'], note: 'default ascending order returns the smallest rows' }, tradeoff: 'Runs and returns three rows in the right shape.', breaksWhen: 'Always wrong here - the default order is ascending, so it hands back the three SMALLEST orders instead of the largest.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['nlargest', 'sort_head'], why: 'nlargest does a partial selection of the top rows; the full sort orders every row before throwing most of them away.' },
        { when: { 'readability': 'team' }, rank: ['sort_head', 'nlargest'], why: 'an explicit descending sort then head reads unambiguously to a reviewer; nlargest is a touch more idiomatic but less universally known.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the ascending-sort approach return the wrong rows?', options: ['nlargest', 'sort_head', 'wrong_direction'], answerId: 'wrong_direction', explanation: 'The default sort order is ascending, so taking the head returns the three smallest amounts, not the largest. It runs and has the right shape - a textbook "runs, wrong".' },
      { id: 'q2', stem: 'On a 50M-row frame, which valid method does less work?', options: ['nlargest', 'sort_head'], answerId: 'nlargest', explanation: 'nlargest does a partial top-N selection without ordering the full frame; sort_head orders all 50M rows and then discards all but three. Same answer, far more work. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── selection · loc-assign (window) · multi-method + chained-assignment trap ─────────────────────
  {
    id: 'pylab-pd-selection-loc-assign',
    title: 'Flag the big orders',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['selection', 'assignment', 'copy-view', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_orders_flag',
    prompt: 'Each row is an order with an amount. Add a label column set to "big" when the amount is at least 100 and "small" otherwise, without changing the frame the caller handed in.',
    beforeWriting: 'You need to write a value into only the rows that match a condition. Are you writing into the frame itself, or into a temporary slice of it that gets thrown away?',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # add a label: "big" when amount >= 100, else "small"; do not mutate the caller\'s frame\n    ...',
    hints: [
      'Work on your own copy first so the caller\'s frame is never touched.',
      'Select-then-assign on a filtered view can write into a throwaway copy instead of the frame - address the rows AND the column in a single targeted write.',
    ],
    solution: 'def solve(orders):\n    out = orders.copy()\n    out.loc[out["amount"] >= 100, "flag"] = "big"\n    out["flag"] = out["flag"].fillna("small")\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The correct labels are ["small", "big", "big"]. The trap writes "small" everywhere, then does out[out["amount"] >= 100]["flag"] = "big" - and the "big" SILENTLY NEVER LANDS. That double-bracket form selects a temporary slice and assigns into the copy pandas hands back, not into out; the result stays ["small", "small", "small"] and a SettingWithCopyWarning is the only tell. Both honest methods - a single targeted row+column write, or a vectorized two-way choice over the whole column - address the real frame in one operation, so the write actually persists.',
    canonicalMethodId: 'copy_loc',
    methods: [
      { id: 'copy_loc', name: 'targeted row+column write', code: 'out = orders.copy()\nout.loc[out["amount"] >= 100, "flag"] = "big"\nout["flag"] = out["flag"].fillna("small")\nreturn out', detectionSignature: { mustMatch: ['.loc['], mustNotMatch: [], note: 'single .loc[rows, col] write addresses the real frame' }, tradeoff: 'One unambiguous write into the frame you own - the assignment cannot leak into a copy.', breaksWhen: 'Nothing here - it is the reference.', isTrap: false },
      { id: 'np_where', name: 'vectorized two-way choice', code: 'import numpy as np\nout = orders.copy()\nout["flag"] = np.where(out["amount"] >= 100, "big", "small")\nreturn out', detectionSignature: { mustMatch: ['where'], mustNotMatch: [], note: 'builds the whole column at once, both branches in one pass' }, tradeoff: 'Builds the full column in a single vectorized pass; no fill-the-rest step.', breaksWhen: 'Nothing for this task - identical result.', isTrap: false },
      { id: 'chained_slice', name: 'assign into a filtered slice', code: 'out = orders.copy()\nout["flag"] = "small"\nout[out["amount"] >= 100]["flag"] = "big"\nreturn out', detectionSignature: { mustMatch: ['][\"flag\"]'], mustNotMatch: ['.loc['], note: 'chained selection then assignment - writes into a throwaway copy' }, tradeoff: 'Looks like it labels the big rows and runs (with a warning).', breaksWhen: 'Always here - the double-bracket select-then-assign writes into a temporary copy, so "big" never reaches the returned frame; every row stays "small".', isTrap: true },
    ],
    dial: {
      axes: ['copy-vs-view', 'readability'],
      rules: [
        { when: { 'copy-vs-view': 'must-persist' }, rank: ['copy_loc', 'np_where'], why: 'a single .loc[rows, col] write targets the actual frame; chained select-then-assign writes into a copy pandas may discard, so the change can silently vanish.' },
        { when: { 'readability': 'team' }, rank: ['np_where', 'copy_loc'], why: 'a two-way vectorized choice states both branches in one line and needs no separate fill-the-rest step; .loc is fine but the second fill can read as an afterthought.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the filtered-slice assignment leave every row "small"?', options: ['copy_loc', 'np_where', 'chained_slice'], answerId: 'chained_slice', explanation: 'orders[mask]["flag"] = "big" selects a temporary slice first, then assigns into THAT copy, not the original frame. pandas warns (SettingWithCopy) and the write is lost. A single .loc[mask, "flag"] = "big" targets the real frame in one step.' },
      { id: 'q2', stem: 'Which property makes the .loc and np.where forms safe where the chained form is not?', options: ['copy_loc', 'np_where', 'chained_slice'], answerId: 'copy_loc', explanation: 'Both safe forms write in a SINGLE indexing operation on the frame you own, so the assignment cannot be redirected into a discarded copy. The chained form splits selection and assignment across two operations, which is where the value leaks away.' },
    ],
  },

  // ───────────────────── metrics · safe-ctr (groupby) · multi-method + zero-denominator trap ─────────────────────
  {
    id: 'pylab-pd-metrics-safe-ctr',
    title: 'Click rate that survives zero impressions',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['metrics', 'rate', 'safe-divide', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_clicks',
    prompt: 'Each row is an ad with its clicks and impressions. Add a rate column giving clicks per impression - but when an ad had zero impressions the rate must read as 0.0, never infinity or a missing value.',
    beforeWriting: 'What happens to the ratio when the denominator is zero? Will that value quietly poison a later sum or average?',
    signature: 'solve(ad)',
    starterCode: 'def solve(ad):\n    # add rate = clicks / impressions, but 0.0 wherever impressions is 0\n    ...',
    hints: [
      'Dividing by zero does not crash a column - it produces infinity or a missing value that spreads into anything downstream.',
      'Guard the denominator: compute the ratio only where impressions are above zero, and substitute 0.0 everywhere else, in one pass over the column.',
    ],
    solution: 'def solve(ad):\n    import numpy as np\n    out = ad.copy()\n    out["ctr"] = np.where(out["impressions"] > 0, out["clicks"] / out["impressions"], 0.0)\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The safe rate is [0.05, 0.0, 0.0]. The naive ratio clicks / impressions produces [0.05, NaN, inf]: zero clicks over zero impressions is NaN, and three clicks over zero impressions is inf. Both poison any later total or mean and render as garbage on a dashboard. The fix guards the denominator - compute the ratio only where impressions exceed zero and substitute 0.0 elsewhere, all in one vectorized pass. There is one safe way to do this, so no judgment fork; the trap is purely the unguarded divide.',
    canonicalMethodId: 'guarded',
    methods: [
      { id: 'guarded', name: 'guarded divide', code: 'import numpy as np\nout = ad.copy()\nout["ctr"] = np.where(out["impressions"] > 0, out["clicks"] / out["impressions"], 0.0)\nreturn out', detectionSignature: { mustMatch: ['where'], mustNotMatch: [], note: 'ratio only where the denominator is safe, else 0.0' }, tradeoff: 'Correct and vectorized - the zero-impression rows read as 0.0.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'naive_divide', name: 'plain division', code: 'out = ad.copy()\nout["ctr"] = out["clicks"] / out["impressions"]\nreturn out', detectionSignature: { mustMatch: ['/'], mustNotMatch: ['where'], note: 'unguarded division leaves inf / NaN on zero impressions' }, tradeoff: 'Reads cleanly and runs without error.', breaksWhen: 'Any zero-impression row - the rate becomes inf or NaN and silently poisons every downstream sum and average.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the plain division dangerous even though it runs?', options: ['guarded', 'naive_divide'], answerId: 'naive_divide', explanation: 'Dividing by zero impressions yields inf (positive clicks) or NaN (zero clicks). pandas does not raise - it stores those values, and a later sum or mean over the column inherits the inf/NaN, breaking the aggregate without an obvious error.' },
    ],
  },

  // ───────────────────── metrics · conversion-rate scalar (groupby) · single-method ─────────────────────
  {
    id: 'pylab-pd-metrics-conversion-rate',
    title: 'Conversion rate of the cohort',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['metrics', 'rate', 'scalar'],
    estimatedMin: 4,
    fixtureId: 'fx_signups',
    prompt: 'Each row is a user with a flag for whether they converted. Return the conversion rate as a percentage rounded to one decimal place - and do not crash if the cohort is empty.',
    signature: 'solve(users)',
    starterCode: 'def solve(users):\n    # percent of users who converted, one decimal, as a number\n    ...',
    hints: [
      'Count the converters, divide by the total number of users, scale to a percent.',
      'An empty cohort means dividing by zero - return 0.0 in that case instead of letting it error.',
    ],
    solution: 'def solve(users):\n    converters = users[users["converted"]].shape[0]\n    total = users.shape[0]\n    return round(converters / total * 100, 1) if total else 0.0',
    compare: { kind: 'float', rtol: 1e-9 },
    debrief: 'Two of four users converted, so the rate is 50.0. The only real footgun here is an empty cohort: total = 0 makes the division raise, which is exactly the edge case that crashes a dashboard during a quiet hour. Guarding it (return 0.0 when there are no users) keeps the metric robust. It returns a single number, so the comparison is a float check, not a frame check. One honest computation - no method dial.',
    canonicalMethodId: 'guarded_rate',
    methods: [
      { id: 'guarded_rate', name: 'count, divide, guard empty', code: 'converters = users[users["converted"]].shape[0]\ntotal = users.shape[0]\nreturn round(converters / total * 100, 1) if total else 0.0', detectionSignature: { mustMatch: ['converted'], mustNotMatch: [], note: 'converters over total, with an empty-cohort guard' }, tradeoff: 'The direct rate with a robust empty-cohort guard.', breaksWhen: 'Nothing for this task.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── metrics · rate-per-group (groupby) · multi-method + global-denominator trap ─────────────────────
  {
    id: 'pylab-pd-metrics-rate-per-group',
    title: 'Conversion rate by region',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['metrics', 'groupby', 'rate', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_conv_region',
    prompt: 'Each row is a user with their region and a flag for whether they converted. Return one row per region carrying the number of conversions, the number of users, and the conversion rate as a percentage rounded to one decimal.',
    beforeWriting: 'The rate for a region is its conversions over ITS OWN users - not over every user in the table. Which count goes in the denominator?',
    signature: 'solve(users)',
    starterCode: 'def solve(users):\n    # per region: conversions, users, and the conversion-rate percent\n    ...',
    hints: [
      'Collapse to one row per region first, carrying both the conversion count and the user count for that region.',
      'Form the rate from those two per-region numbers - the denominator is the region\'s own user count, not the whole table\'s.',
    ],
    solution: 'def solve(users):\n    g = users.groupby("region", as_index=False).agg(conversions=("converted", "sum"), users=("converted", "count"))\n    g["rate"] = (g["conversions"] / g["users"] * 100).round(1)\n    return g.sort_values("region").reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The correct rates are East 100.0 (2 of 2) and West 50.0 (1 of 2). The trap aggregates per region correctly but divides each region\'s conversions by the WHOLE-table user count (4), giving East 50.0 and West 25.0 - the shape and columns are right, only the denominator is wrong, which is the hardest kind of bug to spot in review. The fix divides each region\'s conversions by that same region\'s user count. The flag sums as 1/0 so a count of the flag gives users and a sum gives conversions in one pass. Single honest computation, so the trap is the only fork.',
    canonicalMethodId: 'agg_then_divide',
    methods: [
      { id: 'agg_then_divide', name: 'aggregate then divide per region', code: 'g = users.groupby("region", as_index=False).agg(conversions=("converted", "sum"), users=("converted", "count"))\ng["rate"] = (g["conversions"] / g["users"] * 100).round(1)\nreturn g.sort_values("region").reset_index(drop=True)', detectionSignature: { mustMatch: ['groupby', '"users"]'], mustNotMatch: ['len(users)'], note: 'denominator is the per-region user count' }, tradeoff: 'Correct - each region\'s rate uses its own user count.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'global_denominator', name: 'divide by the whole-table user count', code: 'g = users.groupby("region", as_index=False).agg(conversions=("converted", "sum"), users=("converted", "count"))\ntotal = len(users)\ng["rate"] = (g["conversions"] / total * 100).round(1)\nreturn g.sort_values("region").reset_index(drop=True)', detectionSignature: { mustMatch: ['len(users)'], mustNotMatch: [], note: 'wrong denominator - global user count, not per region' }, tradeoff: 'Runs and has the exact right columns and shape.', breaksWhen: 'Always wrong here - it answers "this region\'s share of all users who converted", not "this region\'s conversion rate", so every rate is scaled to the wrong base.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the global-denominator version return rates that are too low?', options: ['agg_then_divide', 'global_denominator'], answerId: 'global_denominator', explanation: 'It divides each region\'s conversions by the total user count across all regions (4), not by that region\'s own users (2). East becomes 50.0 instead of 100.0. The output shape is right, so it passes a glance - the denominator is the only tell.' },
    ],
  },

  // ───────────────────── dedup · keep-last (groupby) · multi-method + keep-first trap ─────────────────────
  {
    id: 'pylab-pd-dedup-keep-last',
    title: 'Each user\'s current state',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['dedup', 'recency', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_user_states',
    prompt: 'The rows are state changes for users, ordered oldest first, with a user repeating each time their state changed. Return one row per user holding only their most recent state, ordered by user.',
    beforeWriting: 'When a user has several rows and you collapse to one, which occurrence is the current state - the first one you saw or the last?',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # keep only the latest row per user (their current state)\n    ...',
    hints: [
      'Each user appears more than once; you want exactly one row per user out.',
      'The rows are oldest-first, so the CURRENT state is the last occurrence of each user, not the first.',
    ],
    solution: 'def solve(events):\n    return events.drop_duplicates("user_id", keep="last").sort_values("user_id").reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The current states are user 1 -> "b" and user 2 -> "e" (the last row for each). The trap keeps the FIRST occurrence instead, returning the stale "a" and "c" - the user\'s original state, not their current one. It runs and returns one row per user, so the row count looks right; only the values are stale. Because the rows are time-ordered oldest-first, "keep the last occurrence" is the recency choice. Same operation, opposite keep policy - that is the whole judgment.',
    canonicalMethodId: 'keep_last',
    methods: [
      { id: 'keep_last', name: 'keep the last occurrence', code: 'return events.drop_duplicates("user_id", keep="last").sort_values("user_id").reset_index(drop=True)', detectionSignature: { mustMatch: ['keep="last"'], mustNotMatch: [], note: 'last occurrence = current state on oldest-first data' }, tradeoff: 'Correct - the most recent row per user survives.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'keep_first', name: 'keep the first occurrence', code: 'return events.drop_duplicates("user_id", keep="first").sort_values("user_id").reset_index(drop=True)', detectionSignature: { mustMatch: ['keep="first"'], mustNotMatch: [], note: 'first occurrence = the stale original state' }, tradeoff: 'Runs and returns one row per user.', breaksWhen: 'Time-ordered data where you want the current state - it keeps the OLDEST row and silently reports stale state.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does keeping the first occurrence report the wrong state?', options: ['keep_last', 'keep_first'], answerId: 'keep_first', explanation: 'The rows are ordered oldest-first, so the first occurrence of a user is their original (stale) state and the last occurrence is their current one. keep="first" therefore returns each user\'s outdated state while still producing one row per user.' },
    ],
  },

  // ───────────────────── dedup · count-duplicates (groupby) · single-method ─────────────────────
  {
    id: 'pylab-pd-dedup-count-duplicates',
    title: 'How many rows are repeats',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['dedup', 'integrity', 'scalar'],
    estimatedMin: 4,
    fixtureId: 'fx_rows_dupe',
    prompt: 'The table may contain fully-repeated rows. Return the count of rows that repeat a row appearing earlier in the table - that is, every copy after the first.',
    signature: 'solve(rows)',
    starterCode: 'def solve(rows):\n    # count rows that are copies of an earlier row\n    ...',
    hints: [
      'The first time a row appears it is not a repeat; only the later copies count.',
      'Flag each row as "have I seen this exact row before", then total the flags.',
    ],
    solution: 'def solve(rows):\n    return int(rows.duplicated().sum())',
    compare: { kind: 'value' },
    debrief: 'The row (1, "x") appears three times, so two of those are repeats of an earlier row; (2, "y") is unique. The count is 2. The rule that matters: the FIRST appearance is not a duplicate - only the second copy onward is - which is why three identical rows contribute two, not three. Totaling the per-row "seen before" flags gives the integrity check for a load or join that accidentally doubled rows. Returns a number, so a value comparison. One honest computation.',
    canonicalMethodId: 'duplicated_sum',
    methods: [
      { id: 'duplicated_sum', name: 'flag repeats and total them', code: 'return int(rows.duplicated().sum())', detectionSignature: { mustMatch: ['duplicated'], mustNotMatch: [], note: 'first occurrence is False; later copies are True' }, tradeoff: 'The direct integrity count - first occurrence excluded.', breaksWhen: 'Nothing for this task.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── dedup · dense-rank (groupby) · multi-method + min-method (gap) trap ─────────────────────
  {
    id: 'pylab-pd-dedup-dense-rank',
    title: 'Rank reps with no gaps after ties',
    topic: 'pandas-groupby',
    difficulty: 'core',
    tags: ['dedup', 'rank', 'ties', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_rep_sales_tie',
    prompt: 'Each row is a rep with their sales. Add an integer position ordering reps from highest sales (position 1) to lowest. Reps tied on sales share the same position, and the very next position must NOT be skipped.',
    beforeWriting: 'Two reps tie for first. After a tie of two, should the next rep be position 2 or position 3?',
    signature: 'solve(sales)',
    starterCode: 'def solve(sales):\n    # add an integer position: highest sales = 1, ties share, no gap after a tie\n    ...',
    hints: [
      'Higher sales means a smaller position number, with position 1 at the top.',
      'Tied reps share a position; the constraint is that the NEXT distinct value continues at the very next integer rather than skipping over the tied slots.',
    ],
    solution: 'def solve(sales):\n    out = sales.copy()\n    out["rank"] = sales["sales"].rank(method="dense", ascending=False).astype(int)\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Reps a and b tie at 100, so the correct positions are [1, 1, 2, 3] - the tie shares position 1 and the next rep continues at 2, no gap. The trap uses the minimum-rank tie policy, which also gives the tied reps position 1 but then SKIPS to 3, producing [1, 1, 3, 4]. Both run and both put the tie at 1; the divergence is only in what happens after the tie. The "no gap after a tie" wording is the whole decision - it picks the dense policy over the gap-leaving one.',
    canonicalMethodId: 'dense',
    methods: [
      { id: 'dense', name: 'dense ranking (no gaps)', code: 'out = sales.copy()\nout["rank"] = sales["sales"].rank(method="dense", ascending=False).astype(int)\nreturn out', detectionSignature: { mustMatch: ['"dense"'], mustNotMatch: [], note: 'tied rows share a rank; the next value is the next integer' }, tradeoff: 'Correct - ties share a position and the next distinct value continues with no gap.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'min_method', name: 'minimum-rank ties (leaves a gap)', code: 'out = sales.copy()\nout["rank"] = sales["sales"].rank(method="min", ascending=False).astype(int)\nreturn out', detectionSignature: { mustMatch: ['"min"'], mustNotMatch: [], note: 'tied rows share the lowest rank, then a gap' }, tradeoff: 'Also assigns the tie to position 1 and runs.', breaksWhen: 'Whenever the spec forbids gaps after a tie - it skips the tied slots, so two reps tied at 1 are followed by position 3, not 2.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'After two reps tie for position 1, what does the minimum-rank policy give the next rep?', options: ['dense', 'min_method'], answerId: 'min_method', explanation: 'The minimum-rank policy assigns the next distinct value position 3, skipping the two tied slots - so it produces [1, 1, 3, 4]. Dense ranking continues at 2, producing [1, 1, 2, 3], which is what "no gap after a tie" requires.' },
    ],
  },

  // ───────────────────── datetime · extract-month (window) · single-method ─────────────────────
  {
    id: 'pylab-pd-datetime-extract-month',
    title: 'Pull the month out of a date',
    topic: 'pandas-window',
    difficulty: 'warmup',
    tags: ['datetime', 'parse'],
    estimatedMin: 4,
    fixtureId: 'fx_dates',
    prompt: 'Each row has a date stored as text. Turn the text into real dates, then add a column holding the month as an integer from 1 to 12.',
    signature: 'solve(logs)',
    starterCode: 'def solve(logs):\n    # parse the text dates, then add an integer month column\n    ...',
    hints: [
      'The dates arrive as strings; convert them into real date values first.',
      'Once they are real dates, the month is one field you can read straight off each date.',
    ],
    solution: 'def solve(logs):\n    out = logs.copy()\n    out["date"] = pd.to_datetime(out["date"])\n    out["month"] = out["date"].dt.month\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The months come out as 1, 3, 12. The dependency that matters: the month field is only available AFTER the text is parsed into real dates - read it off the raw strings and you would be slicing characters, which breaks the moment a date format varies. Parse first, then read the month field. One honest path - no fork.',
    canonicalMethodId: 'parse_dt',
    methods: [
      { id: 'parse_dt', name: 'parse, then read the month', code: 'out = logs.copy()\nout["date"] = pd.to_datetime(out["date"])\nout["month"] = out["date"].dt.month\nreturn out', detectionSignature: { mustMatch: ['to_datetime'], mustNotMatch: [], note: 'parse text to real dates before reading the month field' }, tradeoff: 'The direct parse-then-extract.', breaksWhen: 'Nothing for this task.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── datetime · half-open range (window) · multi-method + inclusive-bound trap ─────────────────────
  {
    id: 'pylab-pd-datetime-half-open-range',
    title: 'A clean one-month window',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['datetime', 'range', 'boundary', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_dated_amounts',
    prompt: 'Each row has a date stored as text and an amount. Return the rows that fall in January 2023 - on or after 2023-01-01 and strictly before 2023-02-01 - so that the first day of February belongs to February, not January.',
    beforeWriting: 'A row dated exactly 2023-02-01 - does it belong to this window or the next one? If both windows include their end day, which month claims it?',
    signature: 'solve(logs)',
    starterCode: 'def solve(logs):\n    # rows on or after 2023-01-01 and strictly before 2023-02-01\n    ...',
    hints: [
      'Parse the text dates first, then compare against the two boundary dates.',
      'Include the start day but EXCLUDE the end day - a strict less-than on the upper bound is what stops the boundary day being counted in two adjacent windows.',
    ],
    solution: 'def solve(logs):\n    out = logs.copy()\n    out["date"] = pd.to_datetime(out["date"])\n    s = pd.Timestamp("2023-01-01")\n    e = pd.Timestamp("2023-02-01")\n    return out[(out["date"] >= s) & (out["date"] < e)].reset_index(drop=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'January should keep amounts [10, 20] - the 2023-01-01 and 2023-01-15 rows - and leave 2023-02-01 (amount 30) for February. The trap uses a less-than-OR-EQUAL on the upper bound, so it also grabs the 2023-02-01 row and returns [10, 20, 30]. Run the same inclusive logic for February and that boundary day gets counted twice, inflating both months. The half-open window (include the start, exclude the end) is what keeps adjacent periods from both claiming the boundary day - the strict upper bound is the whole fix.',
    canonicalMethodId: 'half_open',
    methods: [
      { id: 'half_open', name: 'half-open window (exclude the end)', code: 'out = logs.copy()\nout["date"] = pd.to_datetime(out["date"])\ns = pd.Timestamp("2023-01-01")\ne = pd.Timestamp("2023-02-01")\nreturn out[(out["date"] >= s) & (out["date"] < e)].reset_index(drop=True)', detectionSignature: { mustMatch: ['< e'], mustNotMatch: ['<= e'], note: 'strict upper bound excludes the boundary day' }, tradeoff: 'Correct - the boundary day belongs to exactly one window.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'inclusive', name: 'inclusive window (include the end)', code: 'out = logs.copy()\nout["date"] = pd.to_datetime(out["date"])\ns = pd.Timestamp("2023-01-01")\ne = pd.Timestamp("2023-02-01")\nreturn out[(out["date"] >= s) & (out["date"] <= e)].reset_index(drop=True)', detectionSignature: { mustMatch: ['<= e'], mustNotMatch: [], note: 'inclusive upper bound double-counts the boundary day' }, tradeoff: 'Runs and looks like a reasonable date filter.', breaksWhen: 'Adjacent windows - the boundary day (2023-02-01) is claimed by both January and February, double-counting it and inflating both periods.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the inclusive upper bound cause double-counting?', options: ['half_open', 'inclusive'], answerId: 'inclusive', explanation: 'With <= on the end, the day 2023-02-01 falls inside January\'s window; the same inclusive rule for February also includes it, so the boundary day is counted in both months. A strict < on the upper bound gives each day to exactly one window.' },
    ],
  },

  // ───────────────────── datetime · days-between (window) · single-method ─────────────────────
  {
    id: 'pylab-pd-datetime-days-between',
    title: 'Days from signup to purchase',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['datetime', 'duration'],
    estimatedMin: 5,
    fixtureId: 'fx_signup_purchase',
    prompt: 'Each row has a signup date and a purchase date, both stored as text. Add a column holding the whole number of days from signup to purchase.',
    signature: 'solve(cust)',
    starterCode: 'def solve(cust):\n    # add days: whole days between signup and purchase\n    ...',
    hints: [
      'Both dates arrive as text - convert each into real date values before doing any arithmetic.',
      'Subtracting one real date from another gives a duration; read the whole-day count off that duration.',
    ],
    solution: 'def solve(cust):\n    out = cust.copy()\n    out["signup"] = pd.to_datetime(out["signup"])\n    out["purchase"] = pd.to_datetime(out["purchase"])\n    out["days"] = (out["purchase"] - out["signup"]).dt.days\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The gaps come out as 7 and 2 days. The order of operations is the lesson: both columns must be parsed into real dates BEFORE the subtraction, or the arithmetic fails on plain strings; the difference is a duration, and the whole-day count is read off that duration. Compute purchase minus signup (not the reverse) so the gap is positive. One honest path - no fork.',
    canonicalMethodId: 'timedelta_days',
    methods: [
      { id: 'timedelta_days', name: 'parse both, subtract, read days', code: 'out = cust.copy()\nout["signup"] = pd.to_datetime(out["signup"])\nout["purchase"] = pd.to_datetime(out["purchase"])\nout["days"] = (out["purchase"] - out["signup"]).dt.days\nreturn out', detectionSignature: { mustMatch: ['to_datetime'], mustNotMatch: [], note: 'parse both dates, then read whole days off the difference' }, tradeoff: 'The direct duration computation.', breaksWhen: 'Nothing for this task.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

];

export default problems;

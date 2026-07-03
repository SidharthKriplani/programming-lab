// pyLabBatch_datacraft — the Data Craft world: analyst-judgment problems (PYLAB-BUILD-SPEC
// §2 schema, §3 compare, §5 judgment layer; rubric docs/PYLAB-CONTENT-RUBRIC.md). The layer
// that separates analysis from arithmetic: the right denominator, missing-data policy, dedup,
// mean-vs-median, weighted averages, Simpson\'s paradox, funnels, retention, safe rates, type
// coercion. Weighted to PA/BA/DA/DS. Every solution + honest method + trap was executed in
// CPython (pandas 2.3) and proven (honest == canonical, trap RUNS AND DIVERGES) before shipping.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside;
// \n for newlines; escape prose apostrophes as \' ; NO template literals / backticks.
//
// Honesty rule (§5): a problem with one honest method + a trap ships with an EMPTY dial; only
// a genuine method fork (>=2 honest ways with a real trade-off) carries dial axes + rules.

export const fixtures = {
  'fx_dc_sessions': {
    args: ['sessions'],
    setup: 'import pandas as pd\nsessions = pd.DataFrame({"user_id": [1, 1, 2, 3, 3, 3], "converted": [False, True, False, False, False, False]})',
    preview: 'sessions: user_id, converted (bool). 3 users, 6 sessions; only user 1 ever converted.',
  },
  'fx_dc_orders_dedup': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 1, 2], "ts": [1, 2, 1], "status": ["pending", "shipped", "pending"]})',
    preview: 'orders: order_id, ts, status. order 1 was updated (pending@1 -> shipped@2); order 2 is pending.',
  },
  'fx_dc_amount_nan': {
    args: ['orders'],
    setup: 'import pandas as pd, numpy as np\norders = pd.DataFrame({"amount": [100.0, 200.0, np.nan, 300.0]})',
    preview: 'orders: amount, one value not recorded (NaN). Recorded values are 100, 200, 300.',
  },
  'fx_dc_values_outlier': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"value": [10, 12, 11, 13, 1000]})',
    preview: 'orders: value. Four clustered around 11-13 and one whale at 1000.',
  },
  'fx_dc_segments': {
    args: ['segs'],
    setup: 'import pandas as pd\nsegs = pd.DataFrame({"segment": ["a", "b"], "rate": [0.1, 0.5], "n": [900, 100]})',
    preview: 'segs: per-segment conversion rate + segment size n. Segment a is 9x bigger than b.',
  },
  'fx_dc_simpsons': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"group": ["A", "A", "B", "B"], "segment": ["s1", "s2", "s1", "s2"], "success": [81, 192, 234, 55], "total": [87, 263, 270, 80]})',
    preview: 'df: two groups A/B across two segments, with success + total counts (a Simpson\'s-paradox setup).',
  },
  'fx_dc_funnel': {
    args: ['funnel'],
    setup: 'import pandas as pd\nfunnel = pd.DataFrame({"step": ["view", "cart", "checkout", "purchase"], "users": [1000, 400, 300, 150]})',
    preview: 'funnel: ordered steps view -> cart -> checkout -> purchase with the user count at each step.',
  },
  'fx_dc_activity': {
    args: ['activity'],
    setup: 'import pandas as pd\nactivity = pd.DataFrame({"user_id": [1, 2, 3, 1, 2, 4], "week": [0, 0, 0, 1, 1, 1]})',
    preview: 'activity: user_id, week. Week 0 users {1,2,3}; week 1 users {1,2,4}.',
  },
  'fx_dc_imps': {
    args: ['imps'],
    setup: 'import pandas as pd\nimps = pd.DataFrame({"group": ["a", "b", "c"], "clicks": [10, 0, 5], "impressions": [100, 50, 0]})',
    preview: 'imps: clicks + impressions per group. Group c logged clicks but zero impressions (a data glitch).',
  },
  'fx_dc_amount_str': {
    args: ['raw'],
    setup: 'import pandas as pd\nraw = pd.DataFrame({"amount": ["100", "200", "", "300"]})',
    preview: 'raw: amount stored as text, with one blank string. The real numbers are 100, 200, 300.',
  },
};

export const problems = [

  // ───────────────── dc-conversion-rate-users · the right denominator ─────────────────
  {
    id: 'dc-conversion-rate-users',
    title: 'Conversion rate — per user, not per session',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['denominator', 'metric-ambiguity', 'groupby'],
    estimatedMin: 6,
    fixtureId: 'fx_dc_sessions',
    prompt: 'Each row is one session, tagged with whether it ended in a purchase. A user can have several sessions. Return the fraction of USERS who purchased in at least one session, as a single number.',
    beforeWriting: 'A user with three sessions is still one user. Are you averaging over sessions, or over people?',
    signature: 'solve(sessions)',
    starterCode: 'def solve(sessions):\n    # fraction of USERS who converted at least once\n    ...',
    hints: [
      'Collapse to one row per user first: did this user ever purchase?',
      'Then take the mean over users - the denominator is the number of distinct users, not the number of rows.',
    ],
    solution: 'def solve(sessions):\n    by_user = sessions.groupby("user_id")["converted"].any()\n    return float(by_user.mean())',
    compare: { kind: 'float' },
    debrief: 'Three users, and only user 1 ever purchased, so the answer is 0.333 - the denominator is people.\n\n**Wrong answer that runs:** averaging the converted flag over every row measures SESSION conversion - 1 purchase in 6 sessions gives 0.167. It runs and returns a rate; it just answers a different question than the one asked.\n\n**Sanity check:** the count in your denominator should equal the number of distinct user_ids (3 here), not the number of rows (6). If they differ, you averaged the wrong grain.\n\n**Interviewer follow-up:** if a user has one converting and one non-converting session, do they count as converted? Define the grain out loud before you code it.',
    canonicalMethodId: 'by_user',
    methods: [
      { id: 'by_user', name: 'collapse per user, then mean', code: 'by_user = sessions.groupby("user_id")["converted"].any()\nreturn float(by_user.mean())', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: [], note: 'reduce to one flag per user first' }, tradeoff: 'Reduce to one boolean per user, then average over users - the grain the question asks for.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'nunique', name: 'distinct converters over distinct users', code: 'conv = sessions.loc[sessions["converted"], "user_id"].nunique()\ntot = sessions["user_id"].nunique()\nreturn conv / tot', detectionSignature: { mustMatch: ['nunique'], mustNotMatch: [], note: 'count distinct users on each side' }, tradeoff: 'Count distinct converters over distinct users - reads as a ratio and needs no groupby.', breaksWhen: 'Nothing for this task; equivalent result.', isTrap: false },
      { id: 'per_session', name: 'mean of the flag over rows', code: 'return float(sessions["converted"].mean())', detectionSignature: { mustMatch: ['converted"].mean()'], mustNotMatch: ['groupby', 'nunique'], note: 'averages at the session grain, not the user grain' }, tradeoff: 'One clean line; returns a plausible rate.', breaksWhen: 'Whenever users have unequal session counts - it weights heavy-session users more and answers session conversion, not user conversion.', isTrap: true },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        { when: { 'readability': 'team' }, rank: ['nunique', 'by_user'], why: 'distinct-over-distinct reads as an obvious ratio; groupby-any needs the reader to know .any() collapses to one row per user.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does averaging the flag over rows return the wrong rate?', options: ['by_user', 'nunique', 'per_session'], answerId: 'per_session', explanation: 'It averages at the session grain, so a user with more sessions counts more than once. The question asks what fraction of PEOPLE converted - collapse to one row per user first.' },
    ],
  },

  // ───────────────── dc-dedup-latest · keep the current record ─────────────────
  {
    id: 'dc-dedup-latest',
    title: 'Dedup — keep the latest, not the first',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['dedup', 'drop_duplicates', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_dc_orders_dedup',
    prompt: 'This table has one row per UPDATE to an order, with a timestamp ts and the status at that time. Return one row per order showing its most recent status. Order the result by order_id and reset the index.',
    beforeWriting: 'Duplicates here are versions of the same order. Which version wins - the first one written or the last?',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # one row per order_id, its most-recent status\n    ...',
    hints: [
      'Rows for the same order_id are older and newer versions - you want the newest by ts.',
      'Deduplicating keeps the FIRST occurrence by default; order by ts (or take the max ts per group) so the newest survives.',
    ],
    solution: 'def solve(orders):\n    return (orders.sort_values("ts")\n                  .drop_duplicates("order_id", keep="last")\n                  .sort_values("order_id")\n                  .reset_index(drop=True))',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Order 1\'s newest row is shipped (ts 2), order 2 is pending - so the current view is order 1 shipped, order 2 pending.\n\n**Wrong answer that runs:** drop_duplicates("order_id") with no keep argument keeps the FIRST row it sees, which is order 1\'s stale pending@ts1. It runs and returns one row per order - with the wrong, outdated status.\n\n**Sanity check:** pick any order that was updated and confirm the surviving row has its MAX ts. If a shipped order still reads pending, you kept the wrong version.\n\n**Interviewer follow-up:** what if two updates share the same ts? Decide the tiebreak (e.g. a sequence id) rather than trusting row order.',
    canonicalMethodId: 'sort_keep_last',
    methods: [
      { id: 'sort_keep_last', name: 'sort by ts, keep last', code: 'return (orders.sort_values("ts")\n              .drop_duplicates("order_id", keep="last")\n              .sort_values("order_id")\n              .reset_index(drop=True))', detectionSignature: { mustMatch: ['keep="last"'], mustNotMatch: [], note: 'newest survives after sorting by ts' }, tradeoff: 'Order by recency, then keep the last per key - explicit and easy to read.', breaksWhen: 'Ties on ts need an explicit tiebreak column; otherwise fine.', isTrap: false },
      { id: 'idxmax', name: 'row at max ts per group', code: 'idx = orders.groupby("order_id")["ts"].idxmax()\nreturn orders.loc[idx].sort_values("order_id").reset_index(drop=True)', detectionSignature: { mustMatch: ['idxmax'], mustNotMatch: [], note: 'select the argmax-ts row per group' }, tradeoff: 'Grab the argmax-ts row per order directly - no global sort.', breaksWhen: 'idxmax picks the first on ties; same caveat as above.', isTrap: false },
      { id: 'default_first', name: 'drop_duplicates (default keep)', code: 'return orders.drop_duplicates("order_id").sort_values("order_id").reset_index(drop=True)', detectionSignature: { mustMatch: ['drop_duplicates'], mustNotMatch: ['keep="last"', 'idxmax', 'sort_values("ts")'], note: 'default keep="first" grabs the stale row' }, tradeoff: 'One line and it dedups.', breaksWhen: 'When rows are ordered oldest-first (the usual append order) - it keeps the oldest version and silently reports stale state.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['idxmax', 'sort_keep_last'], why: 'idxmax is a single grouped reduction; sort_values orders the whole frame first.' },
        { when: { 'readability': 'team' }, rank: ['sort_keep_last', 'idxmax'], why: 'sort-then-keep-last states the intent ("newest wins") more plainly than an idxmax index trick.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the bare drop_duplicates return stale statuses?', options: ['sort_keep_last', 'idxmax', 'default_first'], answerId: 'default_first', explanation: 'drop_duplicates keeps keep="first" by default. With rows appended oldest-first, the first row per order is the oldest version, so updated orders report their original status.' },
    ],
  },

  // ───────────────── dc-mean-exclude-missing · NaN is not zero ─────────────────
  {
    id: 'dc-mean-exclude-missing',
    title: 'Average with missing values — NaN is not zero',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['nan-policy', 'missing-data', 'mean'],
    estimatedMin: 5,
    fixtureId: 'fx_dc_amount_nan',
    prompt: 'Return the average order amount. A missing amount means the value was never recorded - it should not count as a zero-dollar order.',
    beforeWriting: 'A blank is "unknown", not "zero". Does your average treat the missing row as 0, or leave it out?',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # average of the recorded amounts (ignore the missing one)\n    ...',
    hints: [
      'A not-recorded value should not pull the average toward zero.',
      'pandas mean() already skips NaN - the danger is filling NaN with 0 before averaging.',
    ],
    solution: 'def solve(orders):\n    return float(orders["amount"].mean())',
    compare: { kind: 'float' },
    debrief: 'The recorded amounts are 100, 200, 300, so the average is 200.0 over three orders.\n\n**Wrong answer that runs:** fillna(0) then mean treats the missing order as a real $0 order, averaging over four rows: (100+200+0+300)/4 = 150. It runs and returns a smaller, wrong number - a missing value silently became a zero-dollar sale.\n\n**Sanity check:** the denominator should be the count of RECORDED amounts (3), not every row (4). If your average dropped because of a blank, you imputed a zero you did not mean to.',
    canonicalMethodId: 'mean_skipna',
    methods: [
      { id: 'mean_skipna', name: 'mean (skips NaN)', code: 'return float(orders["amount"].mean())', detectionSignature: { mustMatch: ['mean()'], mustNotMatch: ['fillna'], note: 'default skipna leaves the blank out' }, tradeoff: 'pandas mean() skips NaN by default - the recorded-only average, in one call.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'dropna_mean', name: 'dropna, then mean', code: 'return float(orders["amount"].dropna().mean())', detectionSignature: { mustMatch: ['dropna'], mustNotMatch: ['fillna'], note: 'explicitly remove missing, then average' }, tradeoff: 'Same number, spelled out - drop the missing rows, then average. Useful when a reader might not trust the implicit skip.', breaksWhen: 'Nothing for this task; identical to the default.', isTrap: false },
      { id: 'fill_zero', name: 'fillna(0), then mean', code: 'return float(orders["amount"].fillna(0).mean())', detectionSignature: { mustMatch: ['fillna(0)'], mustNotMatch: [], note: 'turns "unknown" into a real zero' }, tradeoff: 'Looks defensive ("handle the missing value") and runs.', breaksWhen: 'Whenever missing means "unknown" rather than "zero" - it invents a $0 order and drags the mean down.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is fillna(0).mean() wrong here?', options: ['mean_skipna', 'dropna_mean', 'fill_zero'], answerId: 'fill_zero', explanation: 'It converts a not-recorded amount into a real $0 order, adding a row to the denominator and lowering the average. Missing here means unknown, so the value should be excluded, not zero-filled.' },
    ],
  },

  // ───────────────── dc-median-not-mean · robust to outliers ─────────────────
  {
    id: 'dc-median-not-mean',
    title: 'Typical order value — median vs mean',
    topic: 'data-craft',
    difficulty: 'warmup',
    tags: ['mean-vs-median', 'robustness', 'outliers'],
    estimatedMin: 5,
    fixtureId: 'fx_dc_values_outlier',
    prompt: 'Return the "typical" order value - the amount where half of orders are above and half below - so that one unusually large order does not distort the number.',
    beforeWriting: 'The word is "typical", and there is one whale in the data. Which summary does a single outlier NOT move much?',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # the middle value - robust to the one huge order\n    ...',
    hints: [
      '"Half above, half below" is the definition of one specific statistic.',
      'The mean is dragged toward extreme values; the median is not.',
    ],
    solution: 'def solve(orders):\n    return float(orders["value"].median())',
    compare: { kind: 'float' },
    debrief: 'Four orders sit around 10-13 and one is 1000; the middle value is 12.0 - what a customer typically spends.\n\n**Wrong answer that runs:** the mean is (10+12+11+13+1000)/5 = 209.2. It runs and returns a number, but the lone 1000 drags it far above anything an actual customer spent - it describes no one.\n\n**Sanity check:** compare your answer to the bulk of the data. If the "typical" value is larger than almost every row, you reported a mean over a skewed distribution and should reach for the median.',
    canonicalMethodId: 'median',
    methods: [
      { id: 'median', name: 'median', code: 'return float(orders["value"].median())', detectionSignature: { mustMatch: ['median'], mustNotMatch: [], note: 'the middle value, unmoved by one whale' }, tradeoff: 'The middle value - a single outlier barely moves it.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'mean_trap', name: 'mean', code: 'return float(orders["value"].mean())', detectionSignature: { mustMatch: ['mean'], mustNotMatch: ['median'], note: 'pulled toward the outlier' }, tradeoff: 'The default "average" and runs cleanly.', breaksWhen: 'On skewed data with outliers - the mean is pulled toward the extreme and stops representing a typical value.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why report the median for "typical" spend here?', options: ['median', 'mean_trap'], answerId: 'median', explanation: 'The distribution is skewed by one 1000 order. The mean (209.2) is pulled toward it and represents no real customer; the median (12) sits in the bulk of the data.' },
    ],
  },

  // ───────────────── dc-weighted-rate · don\'t average the averages ─────────────────
  {
    id: 'dc-weighted-rate',
    title: 'Overall rate — weight by size',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['weighted-avg', 'denominator', 'metric-ambiguity'],
    estimatedMin: 6,
    fixtureId: 'fx_dc_segments',
    prompt: 'Each row is a segment with its conversion rate and its size n (number of users in that segment). Return the overall conversion rate across all users, as a single number.',
    beforeWriting: 'Segment a has 900 users, segment b has 100. Should both segments count equally toward the overall rate?',
    signature: 'solve(segs)',
    starterCode: 'def solve(segs):\n    # overall rate across all users - segments are not the same size\n    ...',
    hints: [
      'The overall rate is total conversions over total users, not the average of two percentages.',
      'Recover conversions per segment as rate * n, then divide by the total n.',
    ],
    solution: 'def solve(segs):\n    return float((segs["rate"] * segs["n"]).sum() / segs["n"].sum())',
    compare: { kind: 'float' },
    debrief: 'Segment a converts 90 of 900, segment b converts 50 of 100; overall that is 140 of 1000 = 0.14.\n\n**Wrong answer that runs:** averaging the two rates, (0.1 + 0.5)/2 = 0.3, gives every segment equal weight. It runs and returns a rate, but it lets the tiny 100-user segment count as much as the 900-user one - more than double the true rate.\n\n**Sanity check:** reconstruct the counts - total conversions over total users. If your overall rate sits outside the user-weighted blend of the parts, you averaged the averages.',
    canonicalMethodId: 'weighted',
    methods: [
      { id: 'weighted', name: 'weighted by n', code: 'return float((segs["rate"] * segs["n"]).sum() / segs["n"].sum())', detectionSignature: { mustMatch: ['n"]).sum()'], mustNotMatch: [], note: 'rebuild counts, then divide by total size' }, tradeoff: 'Rebuild conversions (rate * n), sum, divide by total users - the true pooled rate.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'mean_of_rates', name: 'mean of the rates', code: 'return float(segs["rate"].mean())', detectionSignature: { mustMatch: ['rate"].mean()'], mustNotMatch: ['n"]'], note: 'ignores segment size' }, tradeoff: 'Simple and returns a percentage.', breaksWhen: 'Whenever segments differ in size - it weights a 100-user segment equally with a 900-user one, distorting the overall rate.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the plain mean of the two rates wrong?', options: ['weighted', 'mean_of_rates'], answerId: 'mean_of_rates', explanation: 'It gives each segment equal weight regardless of size. The overall rate is total conversions / total users; with a 900 vs 100 split, the small segment is over-counted and the rate inflates from 0.14 to 0.30.' },
    ],
  },

  // ───────────────── dc-simpsons-winner · the aggregate can flip ─────────────────
  {
    id: 'dc-simpsons-winner',
    title: 'Which group wins — Simpson\'s paradox',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['simpsons-paradox', 'weighted-avg', 'denominator'],
    estimatedMin: 8,
    fixtureId: 'fx_dc_simpsons',
    prompt: 'Two groups, A and B, each measured in two segments, with success and total counts per segment. Return the group ("A" or "B") with the higher overall success rate when you pool all of its records together.',
    beforeWriting: 'You could average each group\'s two segment rates, or pool the raw counts. On uneven segment sizes, those can disagree - which one answers "overall"?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # pool the counts per group, then compare rates. Return "A" or "B".\n    ...',
    hints: [
      'Pool first: sum successes and totals within each group, then form the rate.',
      'Averaging the two per-segment rates ignores that the segments have different sizes - and here it flips the winner.',
    ],
    solution: 'def solve(df):\n    tot = df.groupby("group")[["success", "total"]].sum()\n    rate = tot["success"] / tot["total"]\n    return str(rate.idxmax())',
    compare: { kind: 'value' },
    debrief: 'Pooled, A is 273/350 = 0.78 and B is 289/350 = 0.826, so B wins overall.\n\n**Wrong answer that runs:** averaging each group\'s two segment rates gives A = (0.93+0.73)/2 = 0.83 and B = (0.87+0.69)/2 = 0.78, which names A. It runs and returns a group - the opposite one - because the unweighted average hides that A\'s strong segment is tiny and its weak segment is huge.\n\n**Sanity check:** confirm your denominators are the pooled totals per group (350 each here), not an average of two fractions. If the winner flips when you pool the raw counts, you hit Simpson\'s paradox.\n\n**Interviewer follow-up:** which answer would you present to a stakeholder, and why? Pooled counts reflect the real user base; the segment average answers a different, size-blind question.',
    canonicalMethodId: 'pooled',
    methods: [
      { id: 'pooled', name: 'pool counts per group', code: 'tot = df.groupby("group")[["success", "total"]].sum()\nrate = tot["success"] / tot["total"]\nreturn str(rate.idxmax())', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: [], note: 'sum success and total, then divide' }, tradeoff: 'Sum successes and totals per group, then divide - the real overall rate.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'avg_of_segment_rates', name: 'average the segment rates', code: 'r = df["success"] / df["total"]\ng = r.groupby(df["group"]).mean()\nreturn str(g.idxmax())', detectionSignature: { mustMatch: ['mean()'], mustNotMatch: [], note: 'unweighted mean of per-row rates' }, tradeoff: 'Averages each group\'s two segment rates - looks fair.', breaksWhen: 'When segment sizes differ within a group - the unweighted average can flip the ranking (Simpson\'s paradox), as it does here.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can averaging the segment rates pick the wrong group?', options: ['pooled', 'avg_of_segment_rates'], answerId: 'avg_of_segment_rates', explanation: 'It weights each segment equally even when one segment is far larger. Pooling the raw counts (Simpson\'s paradox) can reverse the ranking - here the unweighted average names A while the pooled rate names B.' },
    ],
  },

  // ───────────────── dc-funnel-step-conversion · over the previous step ─────────────────
  {
    id: 'dc-funnel-step-conversion',
    title: 'Funnel — step-to-step conversion',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['funnel', 'denominator', 'shift'],
    estimatedMin: 6,
    fixtureId: 'fx_dc_funnel',
    prompt: 'Each row is one step of an ordered funnel with the number of users who reached it. Add a column "conv" giving, for each step, the fraction of the PREVIOUS step\'s users who reached it. The first step has no previous step, so its conv is missing (NaN). Keep every row.',
    beforeWriting: 'Step-to-step conversion divides by the step just before - not by the very first step. Which denominator moves as you go down the funnel?',
    signature: 'solve(funnel)',
    starterCode: 'def solve(funnel):\n    df = funnel.copy()\n    # df["conv"] = each step over the PREVIOUS step\n    return df',
    hints: [
      'Each step needs the count from the row directly above it as its denominator.',
      'Shifting the users column down by one lines up each step with its previous step; the first row divides by NaN and becomes NaN.',
    ],
    solution: 'def solve(funnel):\n    df = funnel.copy()\n    df["conv"] = df["users"] / df["users"].shift()\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Step-to-step: cart/view = 0.40, checkout/cart = 0.75, purchase/checkout = 0.50, and view is NaN (no prior step).\n\n**Wrong answer that runs:** dividing every step by the FIRST step (users / users.iloc[0]) gives 1.0, 0.40, 0.30, 0.15. It runs and returns a column of fractions, but those are cumulative rates from the top, not step-to-step - checkout reads 0.30 instead of the true 0.75 of the people who had a cart.\n\n**Sanity check:** each conv should be "of the people at the previous step, how many advanced". Multiply the step-to-step rates back up (0.40 * 0.75 * 0.50 = 0.15) and confirm it equals the overall top-to-bottom rate.',
    canonicalMethodId: 'prev_step',
    methods: [
      { id: 'prev_step', name: 'divide by shift()', code: 'df = funnel.copy()\ndf["conv"] = df["users"] / df["users"].shift()\nreturn df', detectionSignature: { mustMatch: ['shift()'], mustNotMatch: [], note: 'previous row is the denominator' }, tradeoff: 'Divide each step by the row above it - the step-to-step rate, with a natural NaN at the top.', breaksWhen: 'Rows must be in funnel order; otherwise shift lines up the wrong neighbour.', isTrap: false },
      { id: 'over_first', name: 'divide by the first step', code: 'df = funnel.copy()\ndf["conv"] = df["users"] / df["users"].iloc[0]\nreturn df', detectionSignature: { mustMatch: ['iloc[0]'], mustNotMatch: ['shift'], note: 'denominator is fixed at the top of the funnel' }, tradeoff: 'Returns a clean column and reads like "conversion".', breaksWhen: 'It computes cumulative rate from the top, not step-to-step - every step below the first understates its own conversion.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does dividing by the first step misreport checkout conversion?', options: ['prev_step', 'over_first'], answerId: 'over_first', explanation: 'Dividing by the first step gives the cumulative rate from the top (0.30), not the fraction of the previous step (0.75). Step-to-step conversion uses the immediately preceding step as the denominator.' },
    ],
  },

  // ───────────────── dc-retention-week1 · the cohort is the denominator ─────────────────
  {
    id: 'dc-retention-week1',
    title: 'Week-1 retention — of the week-0 cohort',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['retention-cohort', 'denominator', 'sets'],
    estimatedMin: 7,
    fixtureId: 'fx_dc_activity',
    prompt: 'Each row means a user was active in a given week. The cohort is the users active in week 0. Return the fraction of that cohort who were also active in week 1, as a single number.',
    beforeWriting: 'Retention is measured against the starting cohort. Is your denominator the week-0 users, or something else (all users, or the week-1 users)?',
    signature: 'solve(activity)',
    starterCode: 'def solve(activity):\n    # of the week-0 cohort, what fraction returned in week 1\n    ...',
    hints: [
      'Build the set of week-0 users (the cohort) and the set of week-1 users.',
      'Retention is (cohort AND week-1) divided by the cohort size - not divided by all users or by the week-1 users.',
    ],
    solution: 'def solve(activity):\n    cohort = set(activity.loc[activity["week"] == 0, "user_id"])\n    w1 = set(activity.loc[activity["week"] == 1, "user_id"])\n    return len(cohort & w1) / len(cohort)',
    compare: { kind: 'float' },
    debrief: 'The week-0 cohort is {1,2,3}; of those, 1 and 2 came back in week 1, so retention is 2/3 = 0.667.\n\n**Wrong answer that runs:** dividing the returners by ALL distinct users (there are 4, including the week-1 newcomer 4) gives 2/4 = 0.5. It runs and returns a rate, but it dilutes the denominator with a user who was never in the cohort.\n\n**Sanity check:** the denominator must be the cohort size (3), and the numerator can never exceed it. A brand-new week-1 user should not appear anywhere in a retention calculation.\n\n**Interviewer follow-up:** is a user who skipped week 1 but returned in week 2 "retained"? Classic retention says no for week 1; state your definition before computing.',
    canonicalMethodId: 'cohort_denom',
    methods: [
      { id: 'cohort_denom', name: 'returners over cohort', code: 'cohort = set(activity.loc[activity["week"] == 0, "user_id"])\nw1 = set(activity.loc[activity["week"] == 1, "user_id"])\nreturn len(cohort & w1) / len(cohort)', detectionSignature: { mustMatch: ['len(cohort)'], mustNotMatch: ['nunique'], note: 'denominator is the week-0 cohort' }, tradeoff: 'Intersect cohort with week-1, divide by the cohort - the definition of retention.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'all_users_denom', name: 'returners over all users', code: 'cohort = set(activity.loc[activity["week"] == 0, "user_id"])\nw1 = set(activity.loc[activity["week"] == 1, "user_id"])\nreturn len(cohort & w1) / activity["user_id"].nunique()', detectionSignature: { mustMatch: ['nunique'], mustNotMatch: [], note: 'denominator is all users, not the cohort' }, tradeoff: 'Uses a tidy "total users" denominator and runs.', breaksWhen: 'Whenever new users join after week 0 - they inflate the denominator and understate retention of the actual cohort.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is dividing by all distinct users wrong?', options: ['cohort_denom', 'all_users_denom'], answerId: 'all_users_denom', explanation: 'Retention is measured against the starting cohort (week-0 users). Dividing by all users pulls in later joiners who were never in the cohort, diluting the denominator and understating retention.' },
    ],
  },

  // ───────────────── dc-safe-ctr · undefined is not infinity ─────────────────
  {
    id: 'dc-safe-ctr',
    title: 'Rate with a zero denominator — undefined, not infinite',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['safe-rate', 'divide-by-zero', 'nan'],
    estimatedMin: 6,
    fixtureId: 'fx_dc_imps',
    prompt: 'Add a column "ctr" giving clicks divided by impressions for each group. A group with zero impressions has no defined click-through rate, so its ctr must be missing (NaN) - never infinity. Keep every row.',
    beforeWriting: 'One group logged clicks but zero impressions. What does clicks / 0 produce, and is that a rate you would show anyone?',
    signature: 'solve(imps)',
    starterCode: 'def solve(imps):\n    df = imps.copy()\n    # df["ctr"] = clicks / impressions, but 0 impressions -> NaN, not inf\n    ...\n    return df',
    hints: [
      'Dividing a positive number by zero yields infinity in pandas, which is not a valid rate.',
      'Guard the division: only compute where impressions > 0, and leave the rest as NaN.',
    ],
    solution: 'def solve(imps):\n    df = imps.copy()\n    df["ctr"] = df["clicks"].div(df["impressions"]).where(df["impressions"] > 0)\n    return df',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Group a is 0.1, group b is 0.0, and group c (5 clicks, 0 impressions) has no defined rate, so its ctr is NaN.\n\n**Wrong answer that runs:** a plain clicks / impressions leaves group c as 5/0 = inf. It runs and returns a column, but inf is not a click-through rate - it will blow up any later mean, sort, or chart that touches it.\n\n**Sanity check:** scan the result for inf or -inf. A rate with an empty denominator should read as NaN (undefined), and NaN is skipped by later aggregations while inf poisons them.\n\n**Approach:** either mask the division to where impressions > 0, or divide then replace([inf, -inf], NaN) - both land the same frame; masking never computes the infinity in the first place.',
    canonicalMethodId: 'mask_first',
    methods: [
      { id: 'mask_first', name: 'divide where impressions > 0', code: 'df = imps.copy()\ndf["ctr"] = df["clicks"].div(df["impressions"]).where(df["impressions"] > 0)\nreturn df', detectionSignature: { mustMatch: ['.where('], mustNotMatch: [], note: 'keep the rate only where the denominator is positive' }, tradeoff: 'Only keep the rate where the denominator is positive - the zero-impression group stays NaN and no infinity is ever formed.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'replace_inf', name: 'divide, then replace inf', code: 'import numpy as np\ndf = imps.copy()\ndf["ctr"] = (df["clicks"] / df["impressions"]).replace([np.inf, -np.inf], np.nan)\nreturn df', detectionSignature: { mustMatch: ['replace('], mustNotMatch: [], note: 'compute, then scrub the infinities' }, tradeoff: 'Compute the division, then scrub inf/-inf to NaN - same result, one extra pass.', breaksWhen: 'Fine here; it does momentarily create the infinities before replacing them.', isTrap: false },
      { id: 'plain_div', name: 'plain clicks / impressions', code: 'df = imps.copy()\ndf["ctr"] = df["clicks"] / df["impressions"]\nreturn df', detectionSignature: { mustMatch: ['clicks"] / df'], mustNotMatch: ['.where(', 'replace('], note: 'leaves inf on the zero-denominator row' }, tradeoff: 'The obvious one-liner, and it runs.', breaksWhen: 'Any zero denominator with a nonzero numerator - it yields inf, which is not a rate and silently corrupts every downstream aggregation.', isTrap: true },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        { when: { 'readability': 'team' }, rank: ['mask_first', 'replace_inf'], why: 'masking states the rule ("no rate without impressions") and never forms an infinity; replace-after cleans up a value it should not have made.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why is a plain division unsafe for the zero-impression group?', options: ['mask_first', 'replace_inf', 'plain_div'], answerId: 'plain_div', explanation: 'clicks / 0 with clicks > 0 yields inf, which is not a valid rate. It survives into later means/sorts and corrupts them. A missing denominator should read as NaN (undefined), which aggregations skip.' },
    ],
  },

  // ───────────────── dc-numeric-coerce · text that looks like numbers ─────────────────
  {
    id: 'dc-numeric-coerce',
    title: 'Sum a numeric column stored as text',
    topic: 'data-craft',
    difficulty: 'warmup',
    tags: ['type-coerce', 'dtype', 'footgun'],
    estimatedMin: 5,
    fixtureId: 'fx_dc_amount_str',
    prompt: 'The amount column arrived as text (strings), with one blank entry. Return the total amount as a single number. The blank is a missing value, not a zero.',
    beforeWriting: 'This column is text, not numbers. What does summing a column of strings actually do?',
    signature: 'solve(raw)',
    starterCode: 'def solve(raw):\n    # total the amounts - but they are stored as text\n    ...',
    hints: [
      'Summing a text column concatenates the strings instead of adding numbers.',
      'Convert to numbers first, turning the blank into a missing value that the sum will skip.',
    ],
    solution: 'def solve(raw):\n    s = pd.to_numeric(raw["amount"], errors="coerce")\n    return float(s.sum())',
    compare: { kind: 'float' },
    debrief: 'The real values are 100, 200, 300, so the total is 600.0 - the blank is skipped, not counted as zero.\n\n**Wrong answer that runs:** calling .sum() on the text column concatenates it into "100200300" (the blank adds nothing). It runs and returns a value - a 9-character string, not a total. Any downstream math then either explodes or silently misbehaves.\n\n**Sanity check:** check the dtype (or the type of your result). If summing "added" your numbers end-to-end into a giant string, the column was still text - coerce to numeric before aggregating.',
    canonicalMethodId: 'coerce',
    methods: [
      { id: 'coerce', name: 'to_numeric(coerce), then sum', code: 's = pd.to_numeric(raw["amount"], errors="coerce")\nreturn float(s.sum())', detectionSignature: { mustMatch: ['to_numeric'], mustNotMatch: [], note: 'parse to numbers, blank -> NaN' }, tradeoff: 'Parse to real numbers (blank becomes NaN), then sum - NaN is skipped, so the blank never counts as zero.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'string_sum', name: 'sum the text column', code: 'return raw["amount"].sum()', detectionSignature: { mustMatch: ['amount"].sum()'], mustNotMatch: ['to_numeric'], note: 'string + string = concatenation' }, tradeoff: 'Looks like the obvious total.', breaksWhen: 'Whenever the column is text - + concatenates strings, so you get "100200300" instead of 600, and the type is wrong for any later math.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does .sum() on the raw column not total the amounts?', options: ['coerce', 'string_sum'], answerId: 'string_sum', explanation: 'The column is text, and + concatenates strings, so .sum() glues them into "100200300". Convert with pd.to_numeric first (blank -> NaN, skipped) to add the real numbers.' },
    ],
  },

];

export default problems;

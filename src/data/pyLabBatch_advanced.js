// pyLabBatch_advanced — the senior/advanced (stretch/systems) tier (D-PL-29 / Track 2): multi-
// step problems where the mistake compounds across stages. Retention curve over multiple weeks,
// a clean->dedup->join->aggregate revenue pipeline, and per-user sessionization. Every trap RUNS
// AND DIVERGES (proven in CPython, pandas 2.3). These carry difficulty 'stretch' → level 'systems'.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_adv_retention': {
    args: ['activity'],
    setup: 'import pandas as pd\nactivity = pd.DataFrame({"user_id": [1, 2, 3, 1, 2, 4, 1, 4], "week": [0, 0, 0, 1, 1, 1, 2, 2]})',
    preview: 'activity: week 0 cohort {1,2,3}; week 1 {1,2,4}; week 2 {1,4}. User 4 joins late; user 3 churns.',
  },
  'fx_adv_orders_region': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 1, 2, 3], "ts": [1, 2, 1, 1], "region": ["W", "W", "E", "W"], "amount": [100, 120, 50, 80], "returned": [False, False, True, False]})',
    preview: 'orders: order 1 updated (100->120), order 2 (E) returned, order 3 (W) kept. Net by region: W=200, E=0.',
  },
  'fx_adv_events': {
    args: ['events'],
    setup: 'import pandas as pd\nevents = pd.DataFrame({"user": [1, 1, 1, 2, 2], "t": [0, 10, 50, 0, 5]})',
    preview: 'events: user 1 at t=0,10,50 (a 40-gap → 2 sessions); user 2 at t=0,5 (1 session). Gap threshold 30.',
  },
};

export const problems = [

  // ───────────────── dc-retention-curve ─────────────────
  {
    id: 'dc-retention-curve',
    title: 'Retention curve over weeks',
    topic: 'data-craft',
    difficulty: 'stretch',
    tags: ['retention-cohort', 'denominator', 'multi-step'],
    estimatedMin: 9,
    fixtureId: 'fx_adv_retention',
    prompt: 'The cohort is the users active in week 0. For each later week, compute the fraction of that cohort still active. Return a dict mapping each later week number to its retention fraction.',
    beforeWriting: 'Every week in the curve is measured against the SAME fixed cohort (week 0). What must the denominator be for every week — and what belongs in the numerator?',
    signature: 'solve(activity)',
    starterCode: 'def solve(activity):\n    # {week: fraction of the week-0 cohort still active}\n    ...',
    hints: [
      'Fix the cohort once (week-0 users); it never changes across the curve.',
      'For each later week, the numerator is cohort members still active — intersect, do not just count that week\'s users.',
    ],
    solution: 'def solve(activity):\n    cohort = set(activity.loc[activity["week"] == 0, "user_id"])\n    out = {}\n    for w in sorted(activity.loc[activity["week"] > 0, "week"].unique()):\n        act = set(activity.loc[activity["week"] == w, "user_id"])\n        out[int(w)] = len(cohort & act) / len(cohort)\n    return out',
    compare: { kind: 'value' },
    debrief: 'Cohort {1,2,3}: week 1 keeps {1,2} → 2/3 ≈ 0.667; week 2 keeps {1} → 1/3 ≈ 0.333. So {1: 0.667, 2: 0.333}.\n\n**Wrong answer that runs:** using each week\'s TOTAL active-user count as the numerator (len(act) instead of len(cohort & act)) counts newcomers like user 4 as if they were retained. Week 1 becomes 3/3 = 1.0 — a retention curve that never decays. It runs and returns a dict; it just measured activity, not cohort retention.\n\n**Sanity check:** retention is monotone non-increasing for a fixed cohort and can never exceed 1.0 or count a user who was not in week 0. If a later week rises, newcomers leaked into the numerator.\n\n**Interviewer follow-up:** how would you extend this to a full cohort matrix (multiple start weeks)? Each row is a cohort fixed at its own week 0.',
    canonicalMethodId: 'cohort',
    methods: [
      { id: 'cohort', name: 'intersect with the fixed cohort', code: 'cohort = set(activity.loc[activity["week"] == 0, "user_id"])\nout = {}\nfor w in sorted(activity.loc[activity["week"] > 0, "week"].unique()):\n    act = set(activity.loc[activity["week"] == w, "user_id"])\n    out[int(w)] = len(cohort & act) / len(cohort)\nreturn out', detectionSignature: { mustMatch: ['cohort & act'], mustNotMatch: [], note: 'numerator = cohort still active' }, tradeoff: 'Fix the cohort, intersect each week with it, divide by the cohort size — true retention.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'all_active', name: 'each week\'s total active count', code: 'cohort = set(activity.loc[activity["week"] == 0, "user_id"])\nout = {}\nfor w in sorted(activity.loc[activity["week"] > 0, "week"].unique()):\n    act = set(activity.loc[activity["week"] == w, "user_id"])\n    out[int(w)] = len(act) / len(cohort)\nreturn out', detectionSignature: { mustMatch: ['len(act) / len(cohort)'], mustNotMatch: ['cohort & act'], note: 'counts newcomers as retained' }, tradeoff: 'Uses a fixed denominator and looks like retention.', breaksWhen: 'Whenever new users join later — they inflate the numerator, so the curve overstates retention (and can exceed 1.0).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does counting each week\'s active users overstate retention?', options: ['cohort', 'all_active'], answerId: 'all_active', explanation: 'Retention counts only cohort members who stayed. Using the raw active count adds newcomers (like user 4) to the numerator, so week 1 reads 1.0 instead of 0.667. Intersect each week with the fixed cohort.' },
    ],
  },

  // ───────────────── dm-net-revenue-per-region ─────────────────
  {
    id: 'dm-net-revenue-per-region',
    title: 'Net revenue per region — full pipeline',
    topic: 'data-craft',
    difficulty: 'stretch',
    tags: ['pipeline', 'dedup', 'groupby', 'multi-step'],
    estimatedMin: 10,
    fixtureId: 'fx_adv_orders_region',
    prompt: 'This table has one row per UPDATE to an order (order_id, ts, region, amount, returned). Compute net revenue per region: take each order\'s MOST RECENT row, drop the returned orders, then sum the amount per region. Return a frame with columns region and amount, one row per region that has revenue.',
    beforeWriting: 'Three stages stack: collapse to the latest row per order, drop returns, then group by region. Get the ORDER of those stages wrong and stale or returned rows leak into the totals.',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # latest per order -> drop returned -> sum amount per region\n    ...',
    hints: [
      'Collapse to one row per order first (sort by ts, keep last) — before any summing.',
      'Then filter out returned orders, and only then group by region and sum.',
    ],
    solution: 'def solve(orders):\n    latest = orders.sort_values("ts").drop_duplicates("order_id", keep="last")\n    kept = latest[~latest["returned"]]\n    return kept.groupby("region", as_index=False)["amount"].sum()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Order 1\'s latest is 120 (W), order 3 is 80 (W), order 2 is returned (E, dropped). Net: region W = 200, and E has no revenue → one row, W = 200.\n\n**Wrong answer that runs:** skipping the dedup and grouping the raw rows sums BOTH versions of order 1 (100 + 120), so region W reports 300 instead of 200. It runs and returns a per-region frame; the superseded update just leaked into the total because the pipeline aggregated before it collapsed.\n\n**Sanity check:** after the dedup, the row count should equal the number of distinct order_ids. If a region\'s total exceeds the sum of its orders\' latest amounts, a stale version survived into the groupby.\n\n**Interviewer follow-up:** does the returned order define E out of the result, or should E appear with 0? State whether the output lists only regions with net revenue.',
    canonicalMethodId: 'dedup_first',
    methods: [
      { id: 'dedup_first', name: 'dedup → filter → group', code: 'latest = orders.sort_values("ts").drop_duplicates("order_id", keep="last")\nkept = latest[~latest["returned"]]\nreturn kept.groupby("region", as_index=False)["amount"].sum()', detectionSignature: { mustMatch: ['drop_duplicates'], mustNotMatch: [], note: 'collapse before aggregating' }, tradeoff: 'Collapse to the latest row per order, drop returns, then group — each order counts once.', breaksWhen: 'Ties on ts need a tiebreak; otherwise correct.', isTrap: false },
      { id: 'skip_dedup', name: 'filter → group (no dedup)', code: 'kept = orders[~orders["returned"]]\nreturn kept.groupby("region", as_index=False)["amount"].sum()', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: ['drop_duplicates'], note: 'sums every version' }, tradeoff: 'Handles the returns and looks complete.', breaksWhen: 'Whenever an order has multiple update rows — every version is summed, so revised orders inflate their region.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does skipping the dedup inflate region W?', options: ['dedup_first', 'skip_dedup'], answerId: 'skip_dedup', explanation: 'Order 1 has two update rows (100 and 120). Without collapsing to the latest first, the groupby sums both, adding a stale 100 to region W. Dedup to one row per order before aggregating.' },
    ],
  },

  // ───────────────── dm-sessionize-count ─────────────────
  {
    id: 'dm-sessionize-count',
    title: 'Sessionize events by inactivity gap',
    topic: 'pandas-window',
    difficulty: 'stretch',
    tags: ['sessionization', 'groupby', 'diff', 'multi-step'],
    estimatedMin: 9,
    fixtureId: 'fx_adv_events',
    prompt: 'Each row is an event with a user and a timestamp t. A new session starts on a user\'s first event, or whenever the gap since their previous event exceeds 30. Return the total number of sessions across all users, as an int.',
    beforeWriting: 'The gap that starts a new session is between a user\'s OWN consecutive events. If you diff the timestamps globally, whose gap are you measuring?',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # count sessions: new session on first event or gap > 30, PER USER\n    ...',
    hints: [
      'Sort within each user by time, then look at the gap to the previous event of the SAME user.',
      'A global diff mixes the last event of one user with the first of the next — compute the gap per user (groupby diff).',
    ],
    solution: 'def solve(events):\n    e = events.sort_values(["user", "t"])\n    gap = e.groupby("user")["t"].diff()\n    new = (gap.isna()) | (gap > 30)\n    return int(new.sum())',
    compare: { kind: 'value' },
    debrief: 'User 1 (t=0,10,50) has a 40-gap between 10 and 50 → 2 sessions; user 2 (t=0,5) → 1 session. Total 3.\n\n**Wrong answer that runs:** diffing t globally (without grouping by user) measures the gap between the last event of one user and the first of the next. It miscounts the session boundaries — the first event of each later user is judged against another user\'s time. It runs and returns an int; the boundaries are just computed across user lines.\n\n**Sanity check:** every user\'s FIRST event must start a new session (its gap is undefined). If your count is not at least the number of distinct users, the per-user firsts were not all counted — you diffed globally.',
    canonicalMethodId: 'per_user',
    methods: [
      { id: 'per_user', name: 'groupby diff per user', code: 'e = events.sort_values(["user", "t"])\ngap = e.groupby("user")["t"].diff()\nnew = (gap.isna()) | (gap > 30)\nreturn int(new.sum())', detectionSignature: { mustMatch: ['groupby("user")["t"].diff'], mustNotMatch: [], note: 'gap within each user' }, tradeoff: 'Diff within each user (groupby) so a NaN marks each user\'s first event — correct boundaries.', breaksWhen: 'Events must be sorted by time within user; the sort handles that.', isTrap: false },
      { id: 'global_gap', name: 'global diff', code: 'e = events.sort_values("t")\ngap = e["t"].diff()\nnew = (gap.isna()) | (gap > 30)\nreturn int(new.sum())', detectionSignature: { mustMatch: ['e["t"].diff'], mustNotMatch: ['groupby'], note: 'gap across user boundaries' }, tradeoff: 'One diff, no groupby.', breaksWhen: 'With more than one user — a global diff compares across users, so one user\'s first event is measured against another\'s last, miscounting sessions.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why must the diff be per user?', options: ['per_user', 'global_gap'], answerId: 'per_user', explanation: 'Sessions are per-user runs of activity. A global diff measures the gap between different users\' events, so it does not reliably mark each user\'s first event or their true inactivity gaps. groupby("user").diff() keeps the gap within a user.' },
    ],
  },

];

export default problems;

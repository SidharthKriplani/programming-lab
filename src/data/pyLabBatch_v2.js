// pyLabBatch_v2 — depth batch (D-PL-29 / Track 2): Data Craft v2 (analyst judgment) + more
// data-structure reflex. Active-user definition, bounce rate, trimmed mean, median-per-group,
// small-sample rate guard; flatten-one-level, merge-dicts-summing, second-largest-distinct.
// Every trap RUNS AND DIVERGES (proven in CPython, pandas 2.3).
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_v2_active': {
    args: ['events'],
    setup: 'import pandas as pd\nevents = pd.DataFrame({"user_id": [1, 1, 2, 3, 3, 3]})',
    preview: 'events: user 1 (×2), user 2 (×1), user 3 (×3). "Active" = 2+ events → users 1 and 3.',
  },
  'fx_v2_bounce': {
    args: ['events'],
    setup: 'import pandas as pd\nevents = pd.DataFrame({"session_id": [1, 1, 2, 3, 3]})',
    preview: 'events: session 1 (×2), session 2 (×1, a bounce), session 3 (×2). 3 sessions, 5 events.',
  },
  'fx_v2_trim': {
    args: ['vals'],
    setup: 'vals = [1, 10, 11, 12, 100]',
    preview: 'vals: three around 10-12, plus a low 1 and a high 100 outlier to trim.',
  },
  'fx_v2_median': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "W", "E", "E"], "val": [10, 20, 90, 5, 7]})',
    preview: 'df: region W has a skewing 90; E is small. Median W=20, E=6.',
  },
  'fx_v2_guard': {
    args: ['users'],
    setup: 'import pandas as pd\nusers = pd.DataFrame({"region": ["A", "A", "A", "A", "B", "B"], "converted": [True, False, True, True, True, False]})',
    preview: 'users: region A has 4 users (rate 0.75); region B has only 2 (too few to trust).',
  },
  'fx_v2_nested': {
    args: ['nested'],
    setup: 'nested = [[1, 2], [3], [4, [5]]]',
    preview: 'nested: one level down are 1,2,3,4 and a still-nested [5]. Flatten ONE level only.',
  },
  'fx_v2_dicts': {
    args: ['a', 'b'],
    setup: 'a = {"x": 1, "y": 2}\nb = {"y": 3, "z": 4}',
    preview: 'a and b share key "y" (2 and 3). Merging should SUM it → y = 5.',
  },
  'fx_v2_nums': {
    args: ['nums'],
    setup: 'nums = [5, 5, 3, 1]',
    preview: 'nums: 5 repeats. The second-largest DISTINCT value is 3, not 5.',
  },
};

export const problems = [

  // ───────────────── dc-active-users ─────────────────
  {
    id: 'dc-active-users',
    title: 'Active users — 2+ events',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['active-user', 'definition', 'denominator'],
    estimatedMin: 5,
    fixtureId: 'fx_v2_active',
    prompt: 'Each row is one event by a user. Count the ACTIVE users, where "active" means a user with at least 2 events. Return a single int.',
    beforeWriting: '"Active" is a definition, not just "appears in the data". Does one event make a user active here?',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # count users with 2 or more events\n    ...',
    hints: [
      'Count events per user first.',
      'Then keep only the users whose count meets the threshold — not every user who shows up once.',
    ],
    solution: 'def solve(events):\n    vc = events["user_id"].value_counts()\n    return int((vc >= 2).sum())',
    compare: { kind: 'value' },
    debrief: 'Users 1 and 3 have 2+ events; user 2 has only one → 2 active users.\n\n**Wrong answer that runs:** counting DISTINCT users (nunique) treats anyone who appears at all as active, returning 3. It runs and returns a count; it just used the wrong definition of "active" — presence, not the 2-event bar.\n\n**Sanity check:** the active count can never exceed the distinct-user count, and should drop as you raise the threshold. If they are equal, you counted appearances, not activity.\n\n**Interviewer follow-up:** why does the definition of "active" matter for a DAU/MAU metric? A looser bar inflates the number and hides churn.',
    canonicalMethodId: 'two_plus',
    methods: [
      { id: 'two_plus', name: 'count per user, threshold', code: 'vc = events["user_id"].value_counts()\nreturn int((vc >= 2).sum())', detectionSignature: { mustMatch: ['>= 2'], mustNotMatch: [], note: 'apply the activity bar' }, tradeoff: 'Count per user, then keep those meeting the 2-event bar — the stated definition.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'any_event', name: 'distinct users', code: 'return int(events["user_id"].nunique())', detectionSignature: { mustMatch: ['nunique'], mustNotMatch: [], note: 'counts presence, not activity' }, tradeoff: 'Simple and returns a count.', breaksWhen: 'Whenever "active" has a threshold — nunique counts anyone present once, ignoring the definition.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is nunique the wrong count here?', options: ['two_plus', 'any_event'], answerId: 'any_event', explanation: 'nunique counts every user who appears at least once. "Active" was defined as 2+ events, so a single-event user (user 2) should not count. Threshold the per-user event count instead.' },
    ],
  },

  // ───────────────── dc-bounce-rate ─────────────────
  {
    id: 'dc-bounce-rate',
    title: 'Bounce rate — per session',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['bounce-rate', 'denominator', 'grain'],
    estimatedMin: 5,
    fixtureId: 'fx_v2_bounce',
    prompt: 'Each row is one event, tagged with its session. Bounce rate is the fraction of SESSIONS that had exactly one event. Return a single number.',
    beforeWriting: 'The denominator is the number of sessions, not the number of events. Which count goes on the bottom?',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # fraction of sessions with exactly one event\n    ...',
    hints: [
      'Count events per session, then count how many sessions have exactly one.',
      'Divide by the number of SESSIONS (distinct session_ids), not the number of event rows.',
    ],
    solution: 'def solve(events):\n    vc = events["session_id"].value_counts()\n    return float((vc == 1).sum() / vc.size)',
    compare: { kind: 'float' },
    debrief: 'One of three sessions bounced (session 2) → 1/3 ≈ 0.333.\n\n**Wrong answer that runs:** dividing the bounce count by the number of EVENT ROWS (len(events) = 5) gives 1/5 = 0.2. It runs and returns a rate; it just used the wrong denominator — events instead of sessions.\n\n**Sanity check:** bounce rate is a per-session fraction, so the denominator must equal the number of distinct sessions (3). If it equals the row count, you divided by events.',
    canonicalMethodId: 'per_session',
    methods: [
      { id: 'per_session', name: 'over session count', code: 'vc = events["session_id"].value_counts()\nreturn float((vc == 1).sum() / vc.size)', detectionSignature: { mustMatch: ['vc.size'], mustNotMatch: ['len(events)'], note: 'denominator = sessions' }, tradeoff: 'Single-event sessions over total sessions — the per-session bounce rate.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'per_event', name: 'over event count', code: 'vc = events["session_id"].value_counts()\nreturn float((vc == 1).sum() / len(events))', detectionSignature: { mustMatch: ['len(events)'], mustNotMatch: [], note: 'denominator = events' }, tradeoff: 'Looks like a rate and runs.', breaksWhen: 'Always — dividing by event rows instead of sessions understates the rate whenever sessions have multiple events.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why divide by session count, not event count?', options: ['per_session', 'per_event'], answerId: 'per_session', explanation: 'Bounce rate is the share of sessions with one event. The denominator must be the number of sessions; dividing by event rows measures something else and understates the rate.' },
    ],
  },

  // ───────────────── dc-trimmed-mean ─────────────────
  {
    id: 'dc-trimmed-mean',
    title: 'Trimmed mean — drop the extremes',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['trimmed-mean', 'robustness', 'outliers'],
    estimatedMin: 5,
    fixtureId: 'fx_v2_trim',
    prompt: 'Return the trimmed mean: drop the single smallest and single largest value, then average what remains. This resists the outliers.',
    beforeWriting: 'The point of trimming is to exclude the extremes BEFORE averaging. Does a plain mean do that?',
    signature: 'solve(vals)',
    starterCode: 'def solve(vals):\n    # drop min and max, then average the rest\n    ...',
    hints: [
      'Sort, then slice off the first and last element.',
      'Average the middle slice — not the whole list.',
    ],
    solution: 'def solve(vals):\n    s = sorted(vals)\n    mid = s[1:-1]\n    return sum(mid) / len(mid)',
    compare: { kind: 'float' },
    debrief: 'Dropping 1 and 100 leaves 10, 11, 12 → mean 11.0.\n\n**Wrong answer that runs:** a plain mean over all five values is (1+10+11+12+100)/5 = 26.8 — dominated by the 100 the trim was meant to remove. It runs and returns a number; it just never excluded the extremes.\n\n**Sanity check:** a trimmed mean should sit inside the bulk of the data. If your result is pulled far above the middle values, you averaged the outliers in.',
    canonicalMethodId: 'trimmed',
    methods: [
      { id: 'trimmed', name: 'drop extremes, average', code: 's = sorted(vals)\nmid = s[1:-1]\nreturn sum(mid) / len(mid)', detectionSignature: { mustMatch: ['[1:-1]'], mustNotMatch: [], note: 'slice off min and max' }, tradeoff: 'Sort, drop the ends, average the middle — resists outliers.', breaksWhen: 'Very short lists (≤2) leave nothing after trimming; guard if possible.', isTrap: false },
      { id: 'plain_mean', name: 'plain mean', code: 'return sum(vals) / len(vals)', detectionSignature: { mustMatch: ['sum(vals) / len(vals)'], mustNotMatch: ['[1:-1]'], note: 'includes the extremes' }, tradeoff: 'The obvious average.', breaksWhen: 'When the task is a TRIMMED mean — it keeps the extremes it was supposed to drop, so outliers dominate.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the plain mean wrong for a trimmed mean?', options: ['trimmed', 'plain_mean'], answerId: 'plain_mean', explanation: 'Trimming exists to exclude the smallest and largest values before averaging. A plain mean includes them, so the 100 outlier pulls it to 26.8 instead of 11.' },
    ],
  },

  // ───────────────── dc-median-per-group ─────────────────
  {
    id: 'dc-median-per-group',
    title: 'Median per group, not mean',
    topic: 'data-craft',
    difficulty: 'core',
    tags: ['median-vs-mean', 'groupby', 'robustness'],
    estimatedMin: 6,
    fixtureId: 'fx_v2_median',
    prompt: 'Return the typical (median) value per region as a frame with columns region and val. The median resists a single large value inside a group.',
    beforeWriting: 'Region W has a skewing 90. Which per-group summary is not dragged toward it?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # median val per region\n    ...',
    hints: [
      'Group by region and take the median of val.',
      'The mean of a group with an outlier is pulled toward it; the median is not.',
    ],
    solution: 'def solve(df):\n    return df.groupby("region", as_index=False)["val"].median()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Region W: median of 10, 20, 90 is 20; region E: median of 5, 7 is 6.\n\n**Wrong answer that runs:** taking the mean per group gives W = (10+20+90)/3 = 40, dragged up by the 90. It runs and returns a per-region frame; the W value just no longer represents a typical row.\n\n**Sanity check:** for a group with an outlier, the median should sit among the ordinary values. If W reads 40 when most rows are 10-20, you summarised with the mean.',
    canonicalMethodId: 'median',
    methods: [
      { id: 'median', name: 'groupby median', code: 'return df.groupby("region", as_index=False)["val"].median()', detectionSignature: { mustMatch: ['median'], mustNotMatch: [], note: 'robust per-group centre' }, tradeoff: 'Median per group — unmoved by a single large value.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'mean', name: 'groupby mean', code: 'return df.groupby("region", as_index=False)["val"].mean()', detectionSignature: { mustMatch: ['mean'], mustNotMatch: ['median'], note: 'pulled by the outlier' }, tradeoff: 'The default aggregation and runs.', breaksWhen: 'When a group has an outlier — the mean is pulled toward it, so it no longer reflects a typical value.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why report the median per region here?', options: ['median', 'mean'], answerId: 'median', explanation: 'Region W has a skewing 90. The mean (40) is dragged toward it; the median (20) stays among the typical values. For skewed groups, median is the robust summary.' },
    ],
  },

  // ───────────────── dc-small-sample-guard ─────────────────
  {
    id: 'dc-small-sample-guard',
    title: 'Rate per group with a small-sample guard',
    topic: 'data-craft',
    difficulty: 'stretch',
    tags: ['small-sample', 'reliability', 'nan-policy'],
    estimatedMin: 8,
    fixtureId: 'fx_v2_guard',
    prompt: 'Compute the conversion rate per region, but a rate from fewer than 3 users is too noisy to report — set it to NaN. Return a frame with columns region, rate, n (the user count per region).',
    beforeWriting: 'A 100% rate from 1 user is not the same as from 1000. How do you stop a tiny sample from reporting a confident-looking rate?',
    signature: 'solve(users)',
    starterCode: 'def solve(users):\n    # rate per region; rate = NaN where the group has < 3 users\n    ...',
    hints: [
      'Compute both the mean (rate) and the size (n) per region.',
      'Blank out the rate where n is below the threshold — keep n so the reader sees why.',
    ],
    solution: 'def solve(users):\n    g = users.groupby("region")["converted"]\n    out = g.mean().reset_index().rename(columns={"converted": "rate"})\n    out["n"] = g.size().values\n    out["rate"] = out["rate"].where(out["n"] >= 3)\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Region A has 4 users (rate 0.75); region B has only 2, so its rate is suppressed to NaN.\n\n**Wrong answer that runs:** reporting every group\'s rate with no guard gives region B a confident-looking 0.5 from just 2 users. It runs and returns a rate per region; it just presents a noisy small-sample estimate as if it were reliable.\n\n**Sanity check:** any group below the sample threshold should read NaN, not a number. If a 2-user group shows a precise rate, you skipped the guard.\n\n**Interviewer follow-up:** why NaN rather than dropping the row? Keeping the region with its n makes the "not enough data" visible instead of silently missing.',
    canonicalMethodId: 'guarded',
    methods: [
      { id: 'guarded', name: 'suppress small samples', code: 'g = users.groupby("region")["converted"]\nout = g.mean().reset_index().rename(columns={"converted": "rate"})\nout["n"] = g.size().values\nout["rate"] = out["rate"].where(out["n"] >= 3)\nreturn out', detectionSignature: { mustMatch: ['.where('], mustNotMatch: [], note: 'blank the rate below threshold' }, tradeoff: 'Compute rate and n, then blank the rate where n is too small — honest about reliability.', breaksWhen: 'Nothing for this task; the threshold is a judgment call.', isTrap: false },
      { id: 'no_guard', name: 'report every rate', code: 'g = users.groupby("region")["converted"]\nout = g.mean().reset_index().rename(columns={"converted": "rate"})\nout["n"] = g.size().values\nreturn out', detectionSignature: { mustMatch: ['g.mean()'], mustNotMatch: ['.where('], note: 'no reliability guard' }, tradeoff: 'Simpler and returns a rate for every group.', breaksWhen: 'When some groups are tiny — it presents a noisy 2-user rate with the same confidence as a large one.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why suppress region B\'s rate?', options: ['guarded', 'no_guard'], answerId: 'guarded', explanation: 'A rate from 2 users is too noisy to trust. Setting it to NaN (while keeping n visible) prevents a small sample from being read as a reliable estimate.' },
    ],
  },

  // ───────────────── ds-flatten-one-level ─────────────────
  {
    id: 'ds-flatten-one-level',
    title: 'Flatten exactly one level',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['list', 'flatten', 'comprehension'],
    estimatedMin: 5,
    fixtureId: 'fx_v2_nested',
    prompt: 'Flatten the list of lists by exactly ONE level: join the sublists end to end into a single list, leaving any deeper nesting intact.',
    beforeWriting: 'One level means each sublist is spread once. A deeper list stays as an element — do you recurse, or not?',
    signature: 'solve(nested)',
    starterCode: 'def solve(nested):\n    # one level of flattening only\n    ...',
    hints: [
      'A double comprehension spreads each sublist exactly once.',
      'Recursing would also unwrap the deeper [5] — the prompt says leave it.',
    ],
    solution: 'def solve(nested):\n    return [x for sub in nested for x in sub]',
    compare: { kind: 'seq' },
    debrief: 'One level gives [1, 2, 3, 4, [5]] — the inner [5] stays wrapped.\n\n**Wrong answer that runs:** a recursive flatten keeps unwrapping and returns [1, 2, 3, 4, 5], dissolving the [5] the prompt asked to preserve. It runs and returns a flat list; it just flattened more levels than requested.\n\n**Sanity check:** the result should still contain the nested [5] as an element. If every value is a scalar, you recursed instead of flattening a single level.',
    canonicalMethodId: 'one_level',
    methods: [
      { id: 'one_level', name: 'double comprehension', code: 'return [x for sub in nested for x in sub]', detectionSignature: { mustMatch: ['for sub in nested for x in sub'], mustNotMatch: [], note: 'spreads each sublist once' }, tradeoff: 'Spread each sublist exactly once — one level, no recursion.', breaksWhen: 'A top-level element that is not iterable would error; here all are lists.', isTrap: false },
      { id: 'recursive', name: 'recursive flatten', code: 'def flat(xs):\n    out = []\n    for x in xs:\n        if isinstance(x, list):\n            out.extend(flat(x))\n        else:\n            out.append(x)\n    return out\nreturn flat(nested)', detectionSignature: { mustMatch: ['flat(x)'], mustNotMatch: [], note: 'unwraps all levels' }, tradeoff: 'Handles arbitrary depth.', breaksWhen: 'When only ONE level was wanted — it also dissolves deeper lists like [5], changing the result.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the recursive version differ?', options: ['one_level', 'recursive'], answerId: 'recursive', explanation: 'Recursion unwraps every level, so the nested [5] becomes a bare 5. The prompt asked for one level only, which a double comprehension does — leaving [5] intact.' },
    ],
  },

  // ───────────────── ds-merge-dicts-sum ─────────────────
  {
    id: 'ds-merge-dicts-sum',
    title: 'Merge dicts, summing shared keys',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['dict', 'counter', 'merge'],
    estimatedMin: 5,
    fixtureId: 'fx_v2_dicts',
    prompt: 'Combine two dicts of numbers into one. For a key present in both, ADD the two values together (do not let one overwrite the other). Return the combined dict.',
    beforeWriting: 'For a shared key, you want the sum. Does {**a, **b} add, or does the second value win?',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # merge; shared keys get the SUM of both values\n    ...',
    hints: [
      'Overwriting merges (like {**a, **b}) keep only one value per key.',
      'collections.Counter supports +, which adds counts on shared keys.',
    ],
    solution: 'def solve(a, b):\n    from collections import Counter\n    return dict(Counter(a) + Counter(b))',
    compare: { kind: 'value' },
    debrief: 'Shared key "y" sums to 5, so the merge is {"x": 1, "y": 5, "z": 4}.\n\n**Wrong answer that runs:** {**a, **b} lets b\'s value overwrite a\'s on the shared key, giving y = 3 (not 5) → {"x": 1, "y": 3, "z": 4}. It runs and returns a merged dict; it just replaced the shared value instead of adding it.\n\n**Sanity check:** for a key in both dicts, the merged value should equal a[k] + b[k]. If it equals just one side, you overwrote instead of summing.',
    canonicalMethodId: 'counter_sum',
    methods: [
      { id: 'counter_sum', name: 'Counter addition', code: 'from collections import Counter\nreturn dict(Counter(a) + Counter(b))', detectionSignature: { mustMatch: ['Counter'], mustNotMatch: [], note: '+ adds shared keys' }, tradeoff: 'Counter + Counter adds values on shared keys — exactly the ask.', breaksWhen: 'Counter drops non-positive totals; fine for these positive values.', isTrap: false },
      { id: 'dict_unpack', name: '{**a, **b}', code: 'return {**a, **b}', detectionSignature: { mustMatch: ['**a, **b'], mustNotMatch: [], note: 'later value overwrites' }, tradeoff: 'The idiomatic merge — when overwrite is what you want.', breaksWhen: 'When shared keys must be COMBINED — unpacking overwrites, so a\'s value is lost on any shared key.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does {**a, **b} give the wrong "y"?', options: ['counter_sum', 'dict_unpack'], answerId: 'dict_unpack', explanation: 'Dict unpacking overwrites: the later dict\'s value for a shared key replaces the earlier one, so y becomes 3, not 5. Counter addition sums shared keys.' },
    ],
  },

  // ───────────────── ds-second-largest-distinct ─────────────────
  {
    id: 'ds-second-largest-distinct',
    title: 'Second-largest DISTINCT value',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['list', 'set', 'sorting'],
    estimatedMin: 4,
    fixtureId: 'fx_v2_nums',
    prompt: 'Return the second-largest DISTINCT value in the list (duplicates of the largest do not count as second).',
    beforeWriting: 'The largest value repeats. If you sort without deduping, what sits in the second slot?',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # second-largest distinct value\n    ...',
    hints: [
      'Dedup first so repeats of the max collapse to one.',
      'Then the second element of the descending-sorted distinct values is the answer.',
    ],
    solution: 'def solve(nums):\n    return sorted(set(nums), reverse=True)[1]',
    compare: { kind: 'value' },
    debrief: 'Distinct descending is [5, 3, 1], so the second-largest distinct value is 3.\n\n**Wrong answer that runs:** sorting WITHOUT deduping gives [5, 5, 3, 1], whose second element is another 5 — a duplicate of the max, not the second-largest distinct value. It runs and returns a number; it just counted the repeated maximum as "second".\n\n**Sanity check:** the answer must be strictly less than the maximum. If it equals the max, duplicates of the largest slipped into the second slot — dedup first.',
    canonicalMethodId: 'distinct',
    methods: [
      { id: 'distinct', name: 'dedup, then sort', code: 'return sorted(set(nums), reverse=True)[1]', detectionSignature: { mustMatch: ['set(nums)'], mustNotMatch: [], note: 'collapse duplicates first' }, tradeoff: 'Dedup with a set, sort descending, take index 1 — the second distinct value.', breaksWhen: 'Fewer than 2 distinct values has no second; guard if possible.', isTrap: false },
      { id: 'with_dups', name: 'sort with duplicates', code: 'return sorted(nums, reverse=True)[1]', detectionSignature: { mustMatch: ['sorted(nums'], mustNotMatch: ['set('], note: 'keeps duplicate max' }, tradeoff: 'Shorter, and it runs.', breaksWhen: 'When the maximum repeats — the second slot is another copy of the max, not the second-largest distinct value.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why dedup before taking the second element?', options: ['distinct', 'with_dups'], answerId: 'distinct', explanation: 'If the max repeats, a plain descending sort puts another copy of the max in position 1, so you get the max again. Deduping with a set makes index 1 the genuine second-largest.' },
    ],
  },

];

export default problems;

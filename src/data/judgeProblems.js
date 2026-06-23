// Bank — JUDGE frame (PL / Programming Lab, the forensic rung).
// "Spot the Flaw": a pandas snippet that RUNS and returns a plausibly-wrong
// result. The user reads the symptom, spots the bug, then reveals the fix.
//
// HOUSE SYNTAX (PAL CLAUDE.md): single quotes only; escape apostrophes as \' ;
// NO template literals (backticks) — Rolldown parse error. All Python is stored
// as \n-joined single-quoted strings, with DOUBLE quotes used INSIDE the Python.
// Every brokenCode/fixedCode + its output below is VERIFIED against pandas 2.3
// (Pyodide ships a compatible pandas — identical for these).
//
// Schema per problem:
//   id, cluster, title, difficulty:'warmup'|'core'|'stretch', company, tags:[...]
//   setup        — 1-2 sentence business context
//   brokenCode   — runnable pandas that RETURNS a plausibly-wrong result
//   brokenOutput — the wrong output (verified, stdout only)
//   symptom      — one line: what looks off
//   question     — the forensic prompt
//   flaw         — the bug explained
//   impact       — what it corrupts downstream if shipped
//   fixedCode    — runnable corrected pandas (verified)
//   fixedOutput  — the correct output (verified)
//   debrief      — marker text for DebriefBlocks (**Sanity check:** / **Interviewer follow-up:**)
//   keyTakeaways — [...] reflexes to keep
//
// Canon used as TAXONOMY ONLY (bug families) — every case is original, analyst-framed.

export const JUDGE_CLUSTERS = {
  'join-integrity':   { label: 'Join Integrity',     accent: 'var(--accent)' },
  'silent-mutation':  { label: 'Silent Mutation',    accent: 'var(--red)' },
  'aggregation-gaps': { label: 'Aggregation Gaps',   accent: 'var(--teal)' },
  'numeric-traps':    { label: 'Numeric Traps',      accent: 'var(--green)' },
  'dtype-traps':      { label: 'Dtype Traps',        accent: 'var(--yellow)' },
};

export const JUDGE_CLUSTER_ORDER = [
  'join-integrity', 'silent-mutation', 'aggregation-gaps', 'numeric-traps', 'dtype-traps',
];

export const judgeProblems = [
  // ───────────────────────────── Join Integrity ─────────────────────────────
  {
    id: 'judge-merge-fanout',
    cluster: 'join-integrity',
    title: 'Revenue that grew on the way to the join',
    difficulty: 'core',
    company: 'Subscriptions analytics',
    tags: ['merge', 'fan-out', 'duplicate-keys', 'revenue'],
    setup: 'You join three orders onto a customer-to-region lookup so finance can split revenue by region. The orders table is the source of truth for revenue.',
    brokenCode: 'import pandas as pd\n\norders = pd.DataFrame({\n    "order_id": [1, 2, 3],\n    "customer_id": ["c1", "c2", "c1"],\n    "revenue": [100, 250, 75],\n})\n# customer_id is NOT unique in the lookup: c1 maps to two rows\nregions = pd.DataFrame({\n    "customer_id": ["c1", "c1", "c2"],\n    "region": ["West", "West-Legacy", "East"],\n})\n\nmerged = orders.merge(regions, on="customer_id", how="left")\ntotal = merged["revenue"].sum()\nprint("rows after merge:", len(merged))\nprint("total revenue:", total)',
    brokenOutput: 'rows after merge: 5\ntotal revenue: 600',
    symptom: 'You started with 3 orders worth 425, but the merged frame has 5 rows and reports 600 in revenue.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'The join key customer_id is not unique on the right side - c1 appears twice in the regions lookup (a current and a legacy label). A left merge is one-to-many here, so every c1 order is duplicated, once per matching lookup row. The 100 and 75 orders each appear twice, inflating both the row count and the revenue sum.',
    impact: 'Revenue is double-counted for any customer with a duplicated lookup row. The regional split finance signs off on is overstated, and the error scales with how many keys are duplicated - it will not show up as an obvious crash, just numbers that are quietly too big.',
    fixedCode: 'import pandas as pd\n\norders = pd.DataFrame({\n    "order_id": [1, 2, 3],\n    "customer_id": ["c1", "c2", "c1"],\n    "revenue": [100, 250, 75],\n})\nregions = pd.DataFrame({\n    "customer_id": ["c1", "c1", "c2"],\n    "region": ["West", "West-Legacy", "East"],\n})\n\n# Collapse the lookup to one row per key, then assert the shape of the join\nregions_unique = regions.drop_duplicates(subset="customer_id", keep="first")\nmerged = orders.merge(regions_unique, on="customer_id", how="left", validate="many_to_one")\ntotal = merged["revenue"].sum()\nprint("rows after merge:", len(merged))\nprint("total revenue:", total)',
    fixedOutput: 'rows after merge: 3\ntotal revenue: 425',
    debrief: '**Sanity check:** After any merge, compare len(merged) to len(left). If it grew, your key is not unique on the side you expected. Summing a metric column before that check is how inflated revenue ships. \n\n **Interviewer follow-up:** "What if the duplicate region rows are both legitimate?" Then the lookup is genuinely many-to-one only after you pick a rule (latest, primary, non-legacy). The fix is not just drop_duplicates - it is deciding which region wins, and validate="many_to_one" makes the join fail loudly if you got that wrong.',
    keyTakeaways: [
      'A left merge does not guarantee one output row per left row - it fans out on duplicate right-side keys.',
      'Pass validate="many_to_one" (or "one_to_one") so pandas raises instead of silently duplicating.',
      'Row-count before vs after a join is the cheapest fan-out detector you have.',
    ],
  },
  {
    id: 'judge-inner-merge-drop',
    cluster: 'join-integrity',
    title: 'The sessions that vanished in the join',
    difficulty: 'core',
    company: 'Product engagement',
    tags: ['merge', 'inner-join', 'row-loss', 'engagement'],
    setup: 'You enrich a sessions table with each user\'s plan so you can report total minutes watched. Two of the five users have no row in the plan lookup yet.',
    brokenCode: 'import pandas as pd\n\nsessions = pd.DataFrame({\n    "user_id": [1, 2, 3, 4, 5],\n    "minutes": [12, 30, 5, 22, 8],\n})\n# Plan lookup is missing users 4 and 5\nplans = pd.DataFrame({\n    "user_id": [1, 2, 3],\n    "plan": ["pro", "free", "pro"],\n})\nmerged = sessions.merge(plans, on="user_id")\nprint("session rows in:", len(sessions))\nprint("rows after merge:", len(merged))\nprint("total minutes:", merged["minutes"].sum())',
    brokenOutput: 'session rows in: 5\nrows after merge: 3\ntotal minutes: 47',
    symptom: 'Five sessions go in, only three come out, and total minutes drops from 77 to 47.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'merge defaults to how="inner". Users 4 and 5 have no matching row in the plan lookup, so their sessions are dropped entirely from the result. The total is now computed over only the three matched users.',
    impact: 'Engagement is silently understated whenever the right-side lookup is incomplete - exactly the case for new users, late-arriving dimension rows, or any partial reference table. The number looks clean and self-consistent, which is what makes it dangerous: nothing flags that 40 percent of the sessions were thrown away.',
    fixedCode: 'import pandas as pd\n\nsessions = pd.DataFrame({\n    "user_id": [1, 2, 3, 4, 5],\n    "minutes": [12, 30, 5, 22, 8],\n})\nplans = pd.DataFrame({\n    "user_id": [1, 2, 3],\n    "plan": ["pro", "free", "pro"],\n})\n# Left join keeps every session; unmatched users get a NaN plan, not a deletion\nmerged = sessions.merge(plans, on="user_id", how="left")\nprint("session rows in:", len(sessions))\nprint("rows after merge:", len(merged))\nprint("total minutes:", merged["minutes"].sum())',
    fixedOutput: 'session rows in: 5\nrows after merge: 5\ntotal minutes: 77',
    debrief: '**Sanity check:** When the left table is the population you are reporting on, the join should be how="left" and len(merged) must equal len(left). An inner join is a filter dressed up as an enrichment. \n\n **Interviewer follow-up:** "When is an inner join the right call?" When the unmatched rows genuinely should not count - e.g. joining transactions to a fraud-allowlist where only allowlisted users are in scope. The point is to choose the join type on purpose, not inherit the default.',
    keyTakeaways: [
      'merge defaults to an INNER join - unmatched left rows disappear with no warning.',
      'If the left table is your reporting population, use how="left" and check the row count held.',
      'A metric that drops after a join is the tell that rows were filtered, not enriched.',
    ],
  },

  // ───────────────────────────── Silent Mutation ─────────────────────────────
  {
    id: 'judge-chained-indexing',
    cluster: 'silent-mutation',
    title: 'The update that updated nothing',
    difficulty: 'core',
    company: 'Billing operations',
    tags: ['chained-indexing', 'SettingWithCopy', 'assignment', 'no-op'],
    setup: 'You want to grant every free-plan user a 9-unit trial credit by writing it into their monthly_spend before a billing export.',
    brokenCode: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "user_id": [1, 2, 3, 4],\n    "plan": ["free", "pro", "free", "pro"],\n    "monthly_spend": [0, 49, 0, 49],\n})\n# Goal: bump free users\' spend to a 9 trial credit\ndf[df["plan"] == "free"]["monthly_spend"] = 9\nprint(df["monthly_spend"].tolist())\nprint("free users still at 0:", (df.loc[df["plan"] == "free", "monthly_spend"] == 0).all())',
    brokenOutput: '[0, 49, 0, 49]\nfree users still at 0: True',
    symptom: 'The assignment runs without error, but every free user is still at 0 afterward - the credit never landed.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'df[df["plan"] == "free"] returns a new temporary copy of the matching rows. The ["monthly_spend"] = 9 assignment writes into that throwaway copy, which is discarded the moment the statement ends. The original df is never touched. pandas emits a SettingWithCopyWarning to stderr, but the code does not raise, so it looks like it worked.',
    impact: 'Every free user is exported with a 0 credit instead of 9. The pipeline produces a silently wrong billing file - no error, no failed row, just a no-op that the next person assumes succeeded. This is the most dangerous bug class precisely because the happy path looks identical to success.',
    fixedCode: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "user_id": [1, 2, 3, 4],\n    "plan": ["free", "pro", "free", "pro"],\n    "monthly_spend": [0, 49, 0, 49],\n})\n# One .loc call selects rows AND column together, then assigns into the real frame\ndf.loc[df["plan"] == "free", "monthly_spend"] = 9\nprint(df["monthly_spend"].tolist())\nprint("free users still at 0:", (df.loc[df["plan"] == "free", "monthly_spend"] == 0).all())',
    fixedOutput: '[9, 49, 9, 49]\nfree users still at 0: False',
    debrief: '**Sanity check:** Any assignment of the shape df[mask][col] = value is a chained assignment and will not stick. If you see a SettingWithCopyWarning, treat it as an error, not a suggestion. \n\n **Interviewer follow-up:** "Why does it sometimes work?" Whether the intermediate is a view or a copy depends on memory layout, so the same pattern can appear to work in one run and silently fail in another. That non-determinism is the reason the single-.loc form is the only safe rule.',
    keyTakeaways: [
      'df[mask][col] = value assigns into a temporary copy - the write is a no-op on the original.',
      'Always select rows and column in a single .loc[mask, col] before assigning.',
      'A SettingWithCopyWarning means the data did not change the way you think it did.',
    ],
  },

  // ──────────────────────────── Aggregation Gaps ────────────────────────────
  {
    id: 'judge-groupby-dropna',
    cluster: 'aggregation-gaps',
    title: 'The channel that groupby forgot',
    difficulty: 'core',
    company: 'Growth marketing',
    tags: ['groupby', 'dropna', 'NaN-keys', 'attribution'],
    setup: 'You sum signups per acquisition channel for a weekly attribution report. Some events have a missing channel because the tracker dropped the UTM tag.',
    brokenCode: 'import pandas as pd\nimport numpy as np\n\nevents = pd.DataFrame({\n    "channel": ["email", "email", np.nan, "ads", np.nan, "ads"],\n    "signups": [10, 5, 40, 8, 30, 12],\n})\nby_channel = events.groupby("channel")["signups"].sum()\nprint(by_channel)\nprint("total counted:", by_channel.sum())\nprint("true total:", events["signups"].sum())',
    brokenOutput: 'channel\nads      20\nemail    15\nName: signups, dtype: int64\ntotal counted: 35\ntrue total: 105',
    symptom: 'The per-channel sums add up to 35, but the raw signups column sums to 105 - 70 signups are missing.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'groupby defaults to dropna=True, so every row whose channel is NaN is excluded from the grouping entirely. The two untagged events (40 and 30 signups) are silently removed before the sum, so the grouped total no longer reconciles to the raw total.',
    impact: 'Two thirds of the week\'s signups disappear from the attribution report. Channel-level numbers look internally consistent, but the total is wrong, and any budget decision made on per-channel ROI is based on a population that quietly excludes all untracked traffic.',
    fixedCode: 'import pandas as pd\nimport numpy as np\n\nevents = pd.DataFrame({\n    "channel": ["email", "email", np.nan, "ads", np.nan, "ads"],\n    "signups": [10, 5, 40, 8, 30, 12],\n})\n# Keep the NaN bucket so untagged events are reported, not dropped\nby_channel = events.groupby("channel", dropna=False)["signups"].sum()\nprint(by_channel)\nprint("total counted:", by_channel.sum())\nprint("true total:", events["signups"].sum())',
    fixedOutput: 'channel\nads      20\nemail    15\nNaN      70\nName: signups, dtype: int64\ntotal counted: 105\ntrue total: 105',
    debrief: '**Sanity check:** After any groupby-and-sum, check that the grouped total equals the raw column total. If they disagree, NaN keys were dropped. \n\n **Interviewer follow-up:** "Should the untagged signups go in their own bucket or be reassigned?" That is a business call - an Unknown bucket keeps the total honest and makes the tracking gap visible, which is usually better than hiding it. Either way, you decide on purpose; you do not let the default decide for you.',
    keyTakeaways: [
      'groupby drops rows with NaN keys by default (dropna=True) - they vanish from every group.',
      'Pass dropna=False to keep an explicit NaN bucket and preserve the total.',
      'A grouped sum that does not reconcile to the raw sum is a missing-key smell.',
    ],
  },

  // ───────────────────────────── Numeric Traps ─────────────────────────────
  {
    id: 'judge-integer-division',
    cluster: 'numeric-traps',
    title: 'The conversion rate that rounded to zero',
    difficulty: 'warmup',
    company: 'Funnel analytics',
    tags: ['integer-division', 'floor-division', 'rate', 'percentage'],
    setup: 'You compute a conversion rate as a percentage from two integer counters: conversions and visitors.',
    brokenCode: 'conversions = 3\nvisitors = 8\n# Conversion rate as a percentage\nrate = conversions // visitors * 100\nprint("conversion rate (%):", rate)',
    brokenOutput: 'conversion rate (%): 0',
    symptom: 'Three conversions out of eight visitors reports a 0 percent conversion rate.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'The // operator is floor division, not true division. 3 // 8 is 0 (the integer floor of 0.375), and 0 * 100 is still 0. The percentage scaling happens after the value has already been collapsed to zero, so it can never recover the lost fraction.',
    impact: 'Any conversion rate below 100 percent of one whole step floors to 0 - which is essentially every real funnel rate. The metric reads as a flat 0 across the board, and an alert or dashboard built on it would either fire constantly or look permanently broken.',
    fixedCode: 'conversions = 3\nvisitors = 8\n# True division first, then scale to a percentage\nrate = conversions / visitors * 100\nprint("conversion rate (%):", round(rate, 1))',
    fixedOutput: 'conversion rate (%): 37.5',
    debrief: '**Sanity check:** When a ratio of two counts comes back as a clean 0 or 1, suspect integer or floor division before you suspect the data. A rate should rarely be a whole number. \n\n **Interviewer follow-up:** "Where does this bite in pandas specifically?" Same trap with astype(int) on a column mid-calculation, or dividing two integer Series where you expected floats. The reflex is to force float early - divide before you scale, and round only for display.',
    keyTakeaways: [
      '// is floor division: 3 // 8 is 0, so the rate is dead before the * 100 ever runs.',
      'Use / for true division and apply any scaling after, then round only for display.',
      'A rate that is suspiciously a whole 0 or 1 is the signature of integer division.',
    ],
  },

  // ───────────────────────────── Dtype Traps ─────────────────────────────
  {
    id: 'judge-fillna-object',
    cluster: 'dtype-traps',
    title: 'The country code that became a number',
    difficulty: 'core',
    company: 'User demographics',
    tags: ['fillna', 'object-dtype', 'mixed-types', 'value-counts'],
    setup: 'You fill missing country codes before counting users per country for a demographics breakdown.',
    brokenCode: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "user_id": [1, 2, 3, 4],\n    "country": ["US", np.nan, "IN", np.nan],\n})\ndf["country"] = df["country"].fillna(0)\ncounts = df["country"].value_counts()\nprint(counts)\nprint("dtype:", df["country"].dtype)',
    brokenOutput: 'country\n0     2\nUS    1\nIN    1\nName: count, dtype: int64\ndtype: object',
    symptom: 'The country breakdown has a category literally called 0, sitting next to US and IN as if it were a real country.',
    question: 'What is wrong, what does it corrupt, and how do you fix it?',
    flaw: 'fillna(0) inserts the integer 0 into a string (object) column. pandas does not error - object columns hold mixed types - so now the column contains two strings and two integer 0s. value_counts treats 0 as its own distinct category, and any downstream string operation (.str methods, joins on country, groupby) will hit a mix of str and int.',
    impact: 'The demographics breakdown gains a phantom 0 country that no map or lookup will recognise, and the column is now type-unsafe: a later df["country"].str.upper() or a merge on country will break or silently mismatch. The bug is planted quietly and detonates one transformation later, far from where it was introduced.',
    fixedCode: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "user_id": [1, 2, 3, 4],\n    "country": ["US", np.nan, "IN", np.nan],\n})\n# Fill a string column with a string sentinel, never the integer 0\ndf["country"] = df["country"].fillna("Unknown")\ncounts = df["country"].value_counts()\nprint(counts)\nprint("dtype:", df["country"].dtype)',
    fixedOutput: 'country\nUnknown    2\nUS         1\nIN         1\nName: count, dtype: int64\ndtype: object',
    debrief: '**Sanity check:** Match the fill value to the column dtype - a string sentinel for object columns, a numeric default only for numeric columns. fillna(0) on text is a type-mixing landmine. \n\n **Interviewer follow-up:** "How would you catch this in a pipeline?" Assert the dtype and the unique value set after the fill, or use a categorical dtype that rejects out-of-vocabulary values. The general rule: a fillna should never change what kind of thing lives in the column.',
    keyTakeaways: [
      'fillna(0) on an object/string column inserts an integer - pandas allows it silently.',
      'The column becomes mixed-type; later .str operations or joins break one step downstream.',
      'Fill string columns with a string sentinel like "Unknown" so the dtype stays honest.',
    ],
  },
];

export default judgeProblems;

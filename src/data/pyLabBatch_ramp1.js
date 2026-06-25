// pyLabBatch_ramp1 — pandas/numpy world: concept ladder, batch 1 (rampIndex 1-5).
// Concept sequence (one new idea per problem):
//   1. single-col aggregation (scalar out)
//   2. row filter (boolean index)
//   3. row filter + NaN-aware (notna vs dropna)
//   4. groupby + mean (first groupby, as_index=False)
//   5. groupby + NaN group key (dropna=False)
//
// Every solution + trap VERIFIED in CPython (pandas 2.x) before transcribing.
// Trap outputs confirmed to diverge from canonical on the engineered fixtures.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside;
// \n for newlines; escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {

  'fx_scores': {
    args: ['scores'],
    setup: 'import pandas as pd\nscores = pd.DataFrame({"name": ["ada", "bo", "cara", "dan"], "score": [90, 80, 85, 60]})',
    preview: 'scores: name, score  (ada=90, bo=80, cara=85, dan=60 — bo is the boundary case)',
  },

  'fx_scores_na': {
    args: ['scores'],
    setup: 'import pandas as pd\nscores = pd.DataFrame({"name": ["ada", "bo", "cara", "dan"], "dept": ["eng", "eng", "pm", None], "score": [90.0, None, 85.0, 60.0]})',
    preview: 'scores: name, dept, score  (bo has NaN score; dan has valid score but NaN dept — the dropna trap fires on dan)',
  },

  'fx_dept_scores': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"dept": ["eng", "eng", "eng", "pm", "pm"], "score": [90, 80, 70, 85, 65]})',
    preview: 'df: dept, score  (eng: 90/80/70 → mean 80.0; pm: 85/65 → mean 75.0)',
  },

  'fx_dept_count_na': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"dept": ["eng", "eng", "pm", "pm", None], "score": [90, 80, 85, 65, 70]})',
    preview: 'df: dept, score  (eng×2, pm×2, one row with dept=None — the dropna=True footgun fixture)',
  },

};

export const problems = [

  // ─────────────────────────────────────────────────────────────────────────
  // ramp-1 · single-col aggregation → scalar
  // One new concept: select a column, call an aggregation, get a scalar back.
  // No groupby, no filter, no NaN. Establishes the solve() return pattern.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pylab-col-mean',
    title: 'Average score',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['aggregate', 'column-select'],
    estimatedMin: 3,
    fixtureId: 'fx_scores',
    prompt: 'Return the average score across all students as a single number.',
    signature: 'solve(scores)',
    starterCode: 'def solve(scores):\n    # return the average score as a float\n    ...',
    hints: [
      'Select the score column first, then ask for its average.',
      'A column\'s .mean() gives a scalar — wrap in float() to normalise the type.',
    ],
    solution: 'def solve(scores):\n    return float(scores["score"].mean())',
    compare: { kind: 'float' },
    debrief: 'scores["score"].mean() totals 90+80+85+60=315 across 4 students, giving 78.75. Calling .mean() on the whole DataFrame instead of one column returns a Series (one mean per numeric column) — the right value is buried inside the wrong container. Select the column first, then aggregate to a scalar.',
    canonicalMethodId: 'col_mean',
    methods: [
      {
        id: 'col_mean',
        name: 'scores["score"].mean()',
        code: 'return float(scores["score"].mean())',
        tradeoff: 'Select the column, aggregate to a scalar — one clear operation.',
        breaksWhen: 'Nothing here; this is the direct answer.',
        isTrap: false,
      },
      {
        id: 'df_mean',
        name: 'scores.mean(numeric_only=True)',
        code: 'return scores.mean(numeric_only=True)',
        tradeoff: 'Reads as one short line with no column selection.',
        breaksWhen: 'Returns a Series, not a float. If the DataFrame had more numeric columns you\'d get means for all of them — a Series{"score": 78.75} instead of the scalar 78.75.',
        isTrap: true,
      },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      {
        id: 'q1',
        stem: 'What does scores.mean(numeric_only=True) return for this data?',
        options: ['col_mean', 'df_mean'],
        answerId: 'df_mean',
        explanation: 'Without column selection, .mean() aggregates every numeric column and returns a Series — here Series({"score": 78.75}). The value 78.75 is inside a container, not a bare float. Selecting the column first with scores["score"].mean() gives the scalar directly.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ramp-2 · row filter via boolean index
  // New concept: build a True/False mask from a column condition, use it to
  // index the DataFrame. Boundary trap (> vs >=) engineered to fire on bo=80.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pylab-filter-rows',
    title: 'Students who scored above 80',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['filter', 'boolean-index'],
    estimatedMin: 3,
    fixtureId: 'fx_scores',
    prompt: 'Return only the rows where the score is strictly above 80.',
    signature: 'solve(scores)',
    starterCode: 'def solve(scores):\n    # keep only the rows with score > 80\n    ...',
    hints: [
      'Build a True/False mask by comparing the score column against 80, then index the DataFrame with it.',
      '\"Above 80\" is strict — a score of exactly 80 does not qualify.',
    ],
    solution: 'def solve(scores):\n    return scores[scores["score"] > 80]',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'scores["score"] > 80 produces [True, False, True, False] — 90 and 85 qualify, 80 and 60 do not. Indexing with that mask returns ada and cara. The boundary trap >= 80 includes bo\'s 80, adding a third row that the question explicitly excludes. It runs, it returns a DataFrame, and it is silently wrong by one row.',
    canonicalMethodId: 'gt_filter',
    methods: [
      {
        id: 'gt_filter',
        name: 'scores[scores["score"] > 80]',
        code: 'return scores[scores["score"] > 80]',
        tradeoff: 'Strict inequality — 80 itself does not qualify. Two rows returned.',
        breaksWhen: 'Nothing for this task.',
        isTrap: false,
      },
      {
        id: 'gte_filter',
        name: 'scores[scores["score"] >= 80]',
        code: 'return scores[scores["score"] >= 80]',
        tradeoff: 'Reads almost identically — one character difference.',
        breaksWhen: 'Includes the boundary value 80, so bo\'s row appears in the result even though the task says "above 80". Three rows returned instead of two.',
        isTrap: true,
      },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      {
        id: 'q1',
        stem: 'bo has score=80. Which filter includes bo\'s row in the result?',
        options: ['gt_filter', 'gte_filter'],
        answerId: 'gte_filter',
        explanation: '>= includes the boundary: score=80 satisfies score >= 80, so bo is kept. > is strict: score must exceed 80, so bo is excluded. One character changes the row count from 2 to 3.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ramp-3 · filter + NaN-aware (notna vs dropna)
  // New concept: NaN is present; filtering on one column must not accidentally
  // drop rows where a DIFFERENT column is NaN. dropna() trap fires on dan.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pylab-filter-notna',
    title: 'Drop rows with a missing score',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['filter', 'nan', 'notna'],
    estimatedMin: 4,
    fixtureId: 'fx_scores_na',
    prompt: 'Return only the rows where score is not missing. Rows with a missing dept are fine — keep them as long as the score is present.',
    beforeWriting: 'The task says "missing score" only. Is there a way to accidentally drop rows where a different column is missing?',
    signature: 'solve(scores)',
    starterCode: 'def solve(scores):\n    # keep rows where score is not NaN — do not penalise a missing dept\n    ...',
    hints: [
      'Check just the score column for NaN — not every column at once.',
      '.notna() returns True wherever a value exists. Build the mask from scores["score"].notna().',
    ],
    solution: 'def solve(scores):\n    return scores[scores["score"].notna()]',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'bo\'s score is NaN so the notna mask is [True, False, True, True] — ada, cara and dan all survive. The trap scores.dropna() considers every column: dan\'s dept is also None, so dan gets dropped too. Two rows gone for two different reasons when only one was asked for. The column-specific mask is the precise tool; dropna() is a blunt one.',
    canonicalMethodId: 'score_notna',
    methods: [
      {
        id: 'score_notna',
        name: 'scores[scores["score"].notna()]',
        code: 'return scores[scores["score"].notna()]',
        tradeoff: 'Filters on the score column only — exactly what the task asks. Three rows returned.',
        breaksWhen: 'Nothing for this task.',
        isTrap: false,
      },
      {
        id: 'dropna_all_cols',
        name: 'scores.dropna()',
        code: 'return scores.dropna()',
        tradeoff: 'One short line, reads as "remove the NaN rows".',
        breaksWhen: 'Drops any row with NaN in ANY column — dan\'s row is removed because dept is None, even though dan\'s score is 60.0 and valid. Two rows returned instead of three.',
        isTrap: true,
      },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      {
        id: 'q1',
        stem: 'dan has score=60 but dept=None. Which method drops dan\'s row?',
        options: ['score_notna', 'dropna_all_cols'],
        answerId: 'dropna_all_cols',
        explanation: 'dropna() without arguments removes any row that has NaN in any column. dan\'s dept is None, so the row disappears even though the score is present and valid. scores[scores["score"].notna()] only looks at the score column and correctly keeps dan.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ramp-4 · groupby + mean (first groupby problem)
  // New concept: collapse rows into groups, compute a per-group aggregate.
  // Key decision: as_index=False keeps the group key as a column, not an index.
  // Trap: omitting as_index=False returns a Series, wrong shape.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pylab-groupby-mean',
    title: 'Mean score per department',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['groupby', 'aggregate', 'mean'],
    estimatedMin: 4,
    fixtureId: 'fx_dept_scores',
    prompt: 'Return a table with one row per department and that department\'s mean score. The department name should be a column, not the index.',
    beforeWriting: 'groupby uses the group key as the index by default. The task explicitly says dept should be a column — how do you control that?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # one row per dept, mean score, dept as a column not the index\n    ...',
    hints: [
      'Group by dept, select the score column, take the mean.',
      'By default groupby makes the key the index — as_index=False keeps it as a column instead.',
    ],
    solution: 'def solve(df):\n    return df.groupby("dept", as_index=False)["score"].mean()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'eng mean is (90+80+70)/3=80.0 and pm mean is (85+65)/2=75.0. Without as_index=False, groupby promotes dept to the index and returns a Series — the numbers are right but dept is the row label, not a column. Either as_index=False (one step) or .reset_index() after (two steps) restores it to the right shape. Both are valid; as_index=False is the idiomatic single-step form.',
    canonicalMethodId: 'as_index_false',
    methods: [
      {
        id: 'as_index_false',
        name: 'groupby(as_index=False)',
        code: 'return df.groupby("dept", as_index=False)["score"].mean()',
        tradeoff: 'Keeps dept as a column in one call — idiomatic and concise.',
        breaksWhen: 'Nothing for this task.',
        isTrap: false,
      },
      {
        id: 'reset_index_after',
        name: 'groupby + .reset_index()',
        code: 'return df.groupby("dept")["score"].mean().reset_index()',
        tradeoff: 'Same result in two steps — more explicit about converting the index back to a column.',
        breaksWhen: 'Nothing; a valid second approach.',
        isTrap: false,
      },
      {
        id: 'series_with_index',
        name: 'groupby (default as_index=True)',
        code: 'return df.groupby("dept")["score"].mean()',
        tradeoff: 'Shortest version — one argument fewer.',
        breaksWhen: 'Returns a Series with dept as the index, not a DataFrame with a dept column. The numbers are correct but the shape is wrong for a "return a table" task.',
        isTrap: true,
      },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        {
          when: { readability: 'team' },
          rank: ['reset_index_after', 'as_index_false'],
          why: 'An explicit .reset_index() call makes the "turn the index back into a column" intent visible to reviewers who haven\'t internalised as_index=False.',
        },
      ],
    },
    mcqs: [
      {
        id: 'q1',
        stem: 'What does df.groupby("dept")["score"].mean() return — without as_index=False or .reset_index()?',
        options: ['as_index_false', 'reset_index_after', 'series_with_index'],
        answerId: 'series_with_index',
        explanation: 'Without as_index=False, the group key becomes the index. The result is a Series indexed by dept (eng→80.0, pm→75.0), not a DataFrame with a dept column. The numbers are correct but the shape is wrong for a table output.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ramp-5 · groupby + NaN group key (dropna=False)
  // New concept: same groupby as ramp-4, but the group key has a missing value.
  // Default dropna=True silently discards the NaN group. One argument fixes it.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pylab-groupby-count-nan',
    title: 'Count per department including unknown',
    topic: 'pandas-groupby',
    difficulty: 'warmup',
    tags: ['groupby', 'nan', 'dropna', 'footgun'],
    estimatedMin: 4,
    fixtureId: 'fx_dept_count_na',
    prompt: 'Return a table with one row per department and the number of students in it. One student has no department — count them too, keeping their dept as NaN in the output.',
    beforeWriting: 'groupby silently drops rows with a NaN group key by default. Will the student with no department show up?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # count per dept — and the unknown-dept row must NOT vanish\n    ...',
    hints: [
      'A plain groupby("dept") drops the row whose dept is None before counting — the student disappears.',
      'dropna=False tells groupby to keep the NaN key as its own group.',
    ],
    solution: 'def solve(df):\n    return df.groupby("dept", dropna=False, as_index=False)["score"].count()',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'With dropna=False the result has three rows: eng=2, pm=2, NaN=1 — the total is 5, which matches the input. The default dropna=True drops the row whose dept is None before grouping, so only eng and pm appear, the count totals 4, and one student is silently unaccounted for. The fix is one argument; the symptom is a count that adds up to less than the row count.',
    canonicalMethodId: 'keep_nan',
    methods: [
      {
        id: 'keep_nan',
        name: 'groupby(dropna=False)',
        code: 'return df.groupby("dept", dropna=False, as_index=False)["score"].count()',
        tradeoff: 'The NaN group is preserved as its own row — count sums to 5.',
        breaksWhen: 'Nothing for this task.',
        isTrap: false,
      },
      {
        id: 'drop_nan',
        name: 'groupby (default dropna=True)',
        code: 'return df.groupby("dept", as_index=False)["score"].count()',
        tradeoff: 'Reads identically — missing one argument.',
        breaksWhen: 'Silently drops the NaN-dept row before counting. Two rows returned instead of three, total is 4 instead of 5 — the unknown-dept student is gone with no error.',
        isTrap: true,
      },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      {
        id: 'q1',
        stem: 'For this data, how many rows does df.groupby("dept", as_index=False)["score"].count() return without dropna=False?',
        options: ['keep_nan', 'drop_nan'],
        answerId: 'drop_nan',
        explanation: 'The default dropna=True removes rows whose group key is NaN before counting — only eng and pm groups appear, giving 2 rows. The student without a department is silently lost. dropna=False keeps that student as their own NaN group, producing 3 rows and a total that matches the input.',
      },
    ],
  },

];

// pyLabBatch_pandas2 — pandas everyday breadth, round 2 (D-PL-29 / Track 2). More joins (outer,
// multi-key, map-lookup), groupby breadth (within-group transform, group filter, cumcount,
// first), and selection/transform (between, isin, np.where tier, clip, rank, pct-of-total,
// fillna, column select). Easy->medium; warmups single-method, core carries one honest trap.
// All executed in CPython (pandas 2.3) before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_p2_outer': { args: ['left', 'right'], setup: 'import pandas as pd\nleft = pd.DataFrame({"id": [1, 2], "lval": [10, 20]})\nright = pd.DataFrame({"id": [2, 3], "rval": [100, 300]})', preview: 'left ids {1,2}, right ids {2,3}; only 2 is shared. Outer keeps all three.' },
  'fx_p2_twokeys': { args: ['left', 'right'], setup: 'import pandas as pd\nleft = pd.DataFrame({"y": [2023, 2023], "m": [1, 2], "a": [10, 20]})\nright = pd.DataFrame({"y": [2023, 2023], "m": [1, 2], "b": [100, 200]})', preview: 'both keyed by (y, m); joining on y alone fans out 2x2 = 4 rows.' },
  'fx_p2_maplookup': { args: ['df', 'mapping'], setup: 'import pandas as pd\ndf = pd.DataFrame({"code": ["a", "b", "x"]})\nmapping = {"a": 1, "b": 2}', preview: 'codes a,b,x; mapping has a,b. x is unmapped → its value should be missing (NaN).' },
  'fx_p2_zscore': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"g": ["A", "A", "B", "B"], "v": [10, 20, 100, 200]})', preview: 'group B has much larger values; z-scores must be computed WITHIN each group.' },
  'fx_p2_gfilter': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"g": ["A", "A", "B", "B"], "v": [1, 2, 4, 4]})', preview: 'group A sums to 3, B to 8. Keep whole GROUPS whose sum > 5 → B.' },
  'fx_p2_cumcount': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"g": ["A", "A", "B", "A"], "v": [1, 2, 3, 4]})', preview: 'per-group sequence: A rows get 0,1,2; B row gets 0.' },
  'fx_p2_firstg': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"g": ["A", "A", "B"], "v": [10, 20, 30]})', preview: 'first v per group → A: 10, B: 30.' },
  'fx_p2_between': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"v": [1, 5, 10, 15]})', preview: 'keep 5..10 INCLUSIVE → rows 5 and 10.' },
  'fx_p2_isin': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "E", "S", "W"]})', preview: 'keep rows whose region is W or E → 3 rows.' },
  'fx_p2_tier': { args: ['df'], setup: 'import pandas as pd, numpy as np\ndf = pd.DataFrame({"score": [40, 60, 90]})', preview: 'pass if score >= 60 → fail, pass, pass. The boundary (60) is a pass.' },
  'fx_p2_clip': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"v": [-5, 50, 150]})', preview: 'clip to [0,100] → -5→0, 50, 150→100. All rows kept.' },
  'fx_p2_rank': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"score": [90, 90, 80]})', preview: 'dense rank desc: the two 90s tie at 1, 80 is 2 (no gap).' },
  'fx_p2_pct': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"v": [10, 30, 60]})', preview: 'each v as a share of the column total (100) → 0.1, 0.3, 0.6.' },
  'fx_p2_fillna': { args: ['df'], setup: 'import pandas as pd, numpy as np\ndf = pd.DataFrame({"v": [1.0, np.nan, 3.0]})', preview: 'the middle value is missing → fill it with 0.' },
  'fx_p2_colsel': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"a": [1], "b": [2], "c": [3]})', preview: 'keep only columns a and c.' },
};

const W = (o) => ({ dial: { axes: [], rules: [] }, mcqs: [], difficulty: 'warmup', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true }, ...o });
const CO = (o) => ({ dial: { axes: [], rules: [] }, difficulty: 'core', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true }, ...o });

export const problems = [

  CO({ id: 'pm-outer-merge', title: 'Outer join keeps everyone', topic: 'pandas-merge', tags: ['merge', 'outer-join'], estimatedMin: 5, fixtureId: 'fx_p2_outer',
    prompt: 'Join left and right on id keeping ALL ids from either side (a full outer join); non-matching cells are NaN. Return the frame.',
    beforeWriting: 'Only id 2 is in both. To keep ids 1 and 3 as well, which join type do you need?',
    signature: 'solve(left, right)', starterCode: 'def solve(left, right):\n    # keep all ids from both sides\n    ...',
    hints: ['how="outer" keeps keys from both frames.', 'The default (inner) keeps only shared keys.'],
    solution: 'def solve(left, right):\n    return left.merge(right, on="id", how="outer")',
    debrief: 'Outer keeps ids 1, 2, 3; the unmatched cells are NaN.\n\n**Wrong answer that runs:** the default inner join keeps only id 2 (the sole shared key), dropping 1 and 3. It runs and returns a joined frame; it just discarded every non-matching row.\n\n**Sanity check:** an outer join\'s row count is the size of the UNION of keys. If you only got the shared keys, you used an inner join.',
    canonicalMethodId: 'outer', methods: [
      { id: 'outer', name: 'how="outer"', code: 'return left.merge(right, on="id", how="outer")', detectionSignature: { mustMatch: ['how="outer"'], mustNotMatch: [], note: 'union of keys' }, tradeoff: 'Keeps every key from both sides.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'inner', name: 'default (inner)', code: 'return left.merge(right, on="id")', detectionSignature: { mustMatch: ['merge(right, on="id")'], mustNotMatch: ['how='], note: 'shared keys only' }, tradeoff: 'Shorter.', breaksWhen: 'When you must keep unmatched rows — inner drops every non-shared key.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Which join keeps ids 1 and 3?', options: ['outer', 'inner'], answerId: 'outer', explanation: 'Outer keeps the union of keys (1,2,3) with NaN where a side has no match. Inner keeps only the intersection (2).' }] }),

  CO({ id: 'pm-merge-two-keys', title: 'Join on a composite key', topic: 'pandas-merge', tags: ['merge', 'multi-key', 'fan-out'], estimatedMin: 5, fixtureId: 'fx_p2_twokeys',
    prompt: 'Both frames are keyed by (y, m). Join them on BOTH columns and return the frame.',
    beforeWriting: 'If you join on y alone, every row of one year matches every row of the same year. What does that do to the row count?',
    signature: 'solve(left, right)', starterCode: 'def solve(left, right):\n    # join on both y and m\n    ...',
    hints: ['Pass a list of columns to on=.', 'Joining on y alone lets same-year rows cross-match and fan out.'],
    solution: 'def solve(left, right):\n    return left.merge(right, on=["y", "m"])',
    debrief: 'On (y, m) each row matches its single counterpart → 2 rows.\n\n**Wrong answer that runs:** joining on y alone lets both rows of 2023 match both rows of 2023, fanning out to 2×2 = 4 rows with mismatched months. It runs and returns a joined frame; it just multiplied rows by ignoring the second key.\n\n**Sanity check:** the row count should match one-to-one here. If it grew, you dropped a key and the join fanned out.',
    canonicalMethodId: 'two_keys', methods: [
      { id: 'two_keys', name: 'on=["y","m"]', code: 'return left.merge(right, on=["y", "m"])', detectionSignature: { mustMatch: ['["y", "m"]'], mustNotMatch: [], note: 'both keys' }, tradeoff: 'Join on the full composite key.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'one_key', name: 'on="y"', code: 'return left.merge(right, on="y")', detectionSignature: { mustMatch: ['on="y"'], mustNotMatch: ['"m"'], note: 'partial key fans out' }, tradeoff: 'Fewer characters.', breaksWhen: 'When the real key is composite — joining on part of it cross-matches and multiplies rows.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does joining on y alone give 4 rows?', options: ['two_keys', 'one_key'], answerId: 'one_key', explanation: 'Both rows share y=2023, so each left row matches each right row (2×2). Joining on the full (y,m) key matches one-to-one.' }] }),

  CO({ id: 'pm-map-lookup', title: 'Map codes to values', topic: 'pandas-merge', tags: ['map', 'lookup', 'nan'], estimatedMin: 5, fixtureId: 'fx_p2_maplookup',
    prompt: 'Add a column "val" by looking up each code in the mapping dict. A code that is not in the mapping should get a missing value (NaN). Return the frame.',
    beforeWriting: 'Code "x" is not in the mapping. Should it become NaN, or keep the original code? map and replace differ here.',
    signature: 'solve(df, mapping)', starterCode: 'def solve(df, mapping):\n    # df["val"] = lookup of code in mapping; unknown -> NaN\n    ...',
    hints: ['Series.map with a dict looks each value up; misses become NaN.', 'Series.replace leaves unmatched values unchanged instead of NaN.'],
    solution: 'def solve(df, mapping):\n    out = df.copy()\n    out["val"] = df["code"].map(mapping)\n    return out',
    debrief: 'a→1, b→2, x→NaN (not in the mapping).\n\n**Wrong answer that runs:** replace leaves an unmapped code as its ORIGINAL string, so "x" stays "x" and the column becomes a mix of numbers and text. It runs and returns a frame; the unmapped row just silently kept its code instead of going missing.\n\n**Sanity check:** unmapped codes should be NaN. If an original code string survives in the value column, you used replace instead of map.',
    canonicalMethodId: 'map', methods: [
      { id: 'map', name: 'Series.map(dict)', code: 'out = df.copy()\nout["val"] = df["code"].map(mapping)\nreturn out', detectionSignature: { mustMatch: ['.map(mapping)'], mustNotMatch: [], note: 'misses -> NaN' }, tradeoff: 'map looks up and marks misses NaN.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'replace', name: 'Series.replace(dict)', code: 'out = df.copy()\nout["val"] = df["code"].replace(mapping)\nreturn out', detectionSignature: { mustMatch: ['.replace(mapping)'], mustNotMatch: [], note: 'misses keep original' }, tradeoff: 'Looks equivalent.', breaksWhen: 'When some codes are unmapped — replace keeps the original value, mixing types instead of producing NaN.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'How do map and replace differ on an unmapped code?', options: ['map', 'replace'], answerId: 'map', explanation: 'map returns NaN for a key not in the dict; replace leaves the original value untouched. For a lookup where misses should be missing, use map.' }] }),

  CO({ id: 'pg-transform-zscore', title: 'Standardize within each group', topic: 'pandas-groupby', tags: ['groupby', 'transform', 'zscore'], estimatedMin: 6, fixtureId: 'fx_p2_zscore',
    prompt: 'Add a column "z" holding each value\'s z-score computed WITHIN its group ((value − group mean) / group std). Keep every row.',
    beforeWriting: 'Group B\'s values are much larger. Should the mean and std come from the whole column, or from each row\'s own group?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # within-group z-score\n    ...',
    hints: ['groupby(...).transform("mean") / "std" broadcast a per-group stat back onto every row.', 'Using the global mean/std ignores the group structure.'],
    solution: 'def solve(df):\n    g = df.groupby("g")["v"]\n    out = df.copy()\n    out["z"] = (df["v"] - g.transform("mean")) / g.transform("std")\n    return out',
    debrief: 'Each value is standardized against its own group\'s mean and std, so both groups get comparable z-scores.\n\n**Wrong answer that runs:** using the GLOBAL mean and std standardizes every row against the whole column, so group A (small values) all get large negative z-scores and B large positive ones — the group structure is erased. It runs and returns a z column; it just used the wrong mean and std.\n\n**Sanity check:** within each group the z-scores should center on 0. If a whole group is all-negative or all-positive, you standardized globally.',
    canonicalMethodId: 'within', methods: [
      { id: 'within', name: 'groupby.transform', code: 'g = df.groupby("g")["v"]\nout = df.copy()\nout["z"] = (df["v"] - g.transform("mean")) / g.transform("std")\nreturn out', detectionSignature: { mustMatch: ['transform'], mustNotMatch: [], note: 'per-group stats' }, tradeoff: 'transform broadcasts each group\'s mean/std back onto its rows.', breaksWhen: 'A group of size 1 has undefined std.', isTrap: false },
      { id: 'global', name: 'global mean/std', code: 'out = df.copy()\nout["z"] = (df["v"] - df["v"].mean()) / df["v"].std()\nreturn out', detectionSignature: { mustMatch: ['v"].mean()'], mustNotMatch: ['transform'], note: 'ignores groups' }, tradeoff: 'Simpler.', breaksWhen: 'When standardization is meant to be per group — global stats erase the group structure.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why use groupby.transform here?', options: ['within', 'global'], answerId: 'within', explanation: 'The z-score is meant to be per group. transform gives each row its own group\'s mean/std; global stats compare across groups and destroy the within-group meaning.' }] }),

  CO({ id: 'pg-groupby-filter', title: 'Keep whole groups by a condition', topic: 'pandas-groupby', tags: ['groupby', 'filter', 'groups'], estimatedMin: 6, fixtureId: 'fx_p2_gfilter',
    prompt: 'Keep only the rows belonging to GROUPS whose total v exceeds 5. Return the surviving rows with a reset index.',
    beforeWriting: 'This is a filter on GROUPS (by their aggregate), not on individual rows. Do those give the same result here?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # keep rows from groups whose sum(v) > 5\n    ...',
    hints: ['groupby(...).filter(func) keeps or drops whole groups by a predicate on each group.', 'Filtering rows by v > 5 tests individual values, not the group total.'],
    solution: 'def solve(df):\n    return df.groupby("g").filter(lambda x: x["v"].sum() > 5).reset_index(drop=True)',
    debrief: 'Group A sums to 3 (dropped); B sums to 8 (kept) → the two B rows.\n\n**Wrong answer that runs:** filtering rows with v > 5 tests each value, and no single value here exceeds 5, so it returns an empty frame. It runs and returns rows; it just answered a per-row question instead of a per-group one.\n\n**Sanity check:** a group either fully stays or fully goes. If you kept a partial group (or nothing) when a group\'s TOTAL qualifies, you filtered rows instead of groups.',
    canonicalMethodId: 'group_filter', methods: [
      { id: 'group_filter', name: 'groupby.filter', code: 'return df.groupby("g").filter(lambda x: x["v"].sum() > 5).reset_index(drop=True)', detectionSignature: { mustMatch: ['groupby("g").filter'], mustNotMatch: [], note: 'predicate per group' }, tradeoff: 'Keeps or drops whole groups by their aggregate.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'row_filter', name: 'boolean row filter', code: 'return df[df["v"] > 5].reset_index(drop=True)', detectionSignature: { mustMatch: ['df["v"] > 5'], mustNotMatch: ['groupby'], note: 'tests each value' }, tradeoff: 'The usual mask.', breaksWhen: 'When the condition is on the group total — a row mask tests individual values, not the aggregate.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the row filter return nothing?', options: ['group_filter', 'row_filter'], answerId: 'group_filter', explanation: 'No single v exceeds 5, so a row mask keeps nothing. The condition is on the group SUM (B=8), which groupby.filter evaluates per group.' }] }),

  CO({ id: 'pg-cumcount', title: 'Sequence number within group', topic: 'pandas-groupby', tags: ['groupby', 'cumcount', 'sequence'], estimatedMin: 5, fixtureId: 'fx_p2_cumcount',
    prompt: 'Add a column "seq" that numbers each row within its group starting at 0 (a per-group running index). Keep row order. Return the frame.',
    beforeWriting: 'The counter resets for each group. Does a single global 0..n-1 counter do that?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # per-group 0-based sequence number\n    ...',
    hints: ['groupby(...).cumcount() numbers rows within each group from 0.', 'A global range() never resets per group.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["seq"] = df.groupby("g").cumcount()\n    return out',
    debrief: 'A\'s rows get 0, 1, 2; B\'s single row gets 0 → seq is [0, 1, 0, 2].\n\n**Wrong answer that runs:** assigning a global range(len(df)) gives 0,1,2,3 straight through, never restarting for group B. It runs and adds a column; the numbers just do not reset per group.\n\n**Sanity check:** each group\'s sequence should start at 0. If the first row of a later group is not 0, you used a global counter.',
    canonicalMethodId: 'cumcount', methods: [
      { id: 'cumcount', name: 'groupby.cumcount()', code: 'out = df.copy()\nout["seq"] = df.groupby("g").cumcount()\nreturn out', detectionSignature: { mustMatch: ['cumcount'], mustNotMatch: [], note: 'resets per group' }, tradeoff: 'A per-group 0-based counter.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'global_seq', name: 'global range', code: 'out = df.copy()\nout["seq"] = range(len(df))\nreturn out', detectionSignature: { mustMatch: ['range(len(df))'], mustNotMatch: ['cumcount'], note: 'never resets' }, tradeoff: 'Simple.', breaksWhen: 'When the sequence should restart per group — a global range counts straight through.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is a global range wrong?', options: ['cumcount', 'global_seq'], answerId: 'cumcount', explanation: 'cumcount restarts at 0 for each group; range(len(df)) counts across the whole frame and never resets, so group B does not start at 0.' }] }),

  W({ id: 'pg-first-per-group', title: 'First value per group', topic: 'pandas-groupby', tags: ['groupby', 'first', 'fluency'], estimatedMin: 3, fixtureId: 'fx_p2_firstg',
    prompt: 'Return the first v for each group g, as a frame with columns g and v.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # first v per group\n    ...',
    hints: ['Group by g and take .first() of v.', 'as_index=False keeps g as a column.'],
    solution: 'def solve(df):\n    return df.groupby("g", as_index=False)["v"].first()',
    debrief: 'A\'s first v is 10, B\'s is 30. groupby(...).first() takes the first value in each group.',
    canonicalMethodId: 'first', methods: [{ id: 'first', name: 'groupby.first()', code: 'return df.groupby("g", as_index=False)["v"].first()', tradeoff: 'The first row per group.', breaksWhen: 'Depends on row order.', isTrap: false }] }),

  CO({ id: 'pc-between', title: 'Inclusive range filter', topic: 'pandas-window', tags: ['filter', 'between', 'inclusive'], estimatedMin: 4, fixtureId: 'fx_p2_between',
    prompt: 'Keep the rows where v is between 5 and 10, INCLUSIVE of both ends. Return them with a reset index.',
    beforeWriting: 'Inclusive means 5 and 10 both stay. Do strict < and > comparisons keep the endpoints?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # v in [5, 10] inclusive\n    ...',
    hints: ['Series.between(lo, hi) is inclusive by default.', 'Strict > and < would exclude the endpoints 5 and 10.'],
    solution: 'def solve(df):\n    return df[df["v"].between(5, 10)].reset_index(drop=True)',
    debrief: 'Inclusive keeps 5 and 10 → 2 rows.\n\n**Wrong answer that runs:** the strict mask (v > 5) & (v < 10) drops both endpoints, and since no value lies strictly between, it returns an empty frame. It runs and filters; it just used exclusive bounds where inclusive were asked.\n\n**Sanity check:** the endpoints (5 and 10) must be present. If they are gone, your comparisons were strict — use between (inclusive) or >= / <=.',
    canonicalMethodId: 'between', methods: [
      { id: 'between', name: 'Series.between', code: 'return df[df["v"].between(5, 10)].reset_index(drop=True)', detectionSignature: { mustMatch: ['.between('], mustNotMatch: [], note: 'inclusive bounds' }, tradeoff: 'between is inclusive of both ends.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'strict', name: 'strict > and <', code: 'return df[(df["v"] > 5) & (df["v"] < 10)].reset_index(drop=True)', detectionSignature: { mustMatch: ['> 5) & (df["v"] < 10'], mustNotMatch: ['between'], note: 'excludes endpoints' }, tradeoff: 'Explicit.', breaksWhen: 'When the range is inclusive — strict comparisons drop the endpoints.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the strict mask return empty?', options: ['between', 'strict'], answerId: 'between', explanation: 'v > 5 and v < 10 exclude 5 and 10, and no value lies strictly between them, so nothing survives. between (or >= / <=) keeps the inclusive endpoints.' }] }),

  W({ id: 'pc-isin-filter', title: 'Filter by a set of values', topic: 'pandas-window', tags: ['filter', 'isin', 'fluency'], estimatedMin: 3, fixtureId: 'fx_p2_isin',
    prompt: 'Keep only the rows whose region is W or E. Return them with a reset index.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # rows where region is W or E\n    ...',
    hints: ['Series.isin([...]) tests membership in a set of values.', 'It is cleaner than chaining region == "W" | region == "E".'],
    solution: 'def solve(df):\n    return df[df["region"].isin(["W", "E"])].reset_index(drop=True)',
    debrief: 'Three rows are W or E. isin(["W","E"]) is the membership filter.',
    canonicalMethodId: 'isin', methods: [{ id: 'isin', name: 'Series.isin', code: 'return df[df["region"].isin(["W", "E"])].reset_index(drop=True)', tradeoff: 'Membership test against a list.', breaksWhen: 'Nothing here.', isTrap: false }] }),

  CO({ id: 'pc-np-where-tier', title: 'Label rows by a threshold', topic: 'pandas-window', tags: ['np-where', 'threshold', 'boundary'], estimatedMin: 4, fixtureId: 'fx_p2_tier',
    prompt: 'Add a column "tier": "pass" when score is 60 or more, otherwise "fail". A score of exactly 60 is a pass. Return the frame.',
    beforeWriting: '"60 or more" includes 60 itself. Does a strict > 60 keep the boundary as a pass?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # tier = pass if score >= 60 else fail\n    ...',
    hints: ['np.where(cond, a, b) labels each row by a condition.', 'The boundary 60 must satisfy the condition — use >=, not >.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["tier"] = np.where(df["score"] >= 60, "pass", "fail")\n    return out',
    debrief: 'Scores 40/60/90 → fail/pass/pass; the 60 passes because the bar is "60 or more".\n\n**Wrong answer that runs:** using a strict > 60 makes the boundary score of 60 a "fail". It runs and labels every row; the off-by-one on the boundary just flips the 60.\n\n**Sanity check:** decide whether the boundary is included and match the operator. "60 or more" is >= 60; > 60 excludes the boundary.',
    canonicalMethodId: 'geq', methods: [
      { id: 'geq', name: '>= 60', code: 'out = df.copy()\nout["tier"] = np.where(df["score"] >= 60, "pass", "fail")\nreturn out', detectionSignature: { mustMatch: ['>= 60'], mustNotMatch: [], note: 'boundary included' }, tradeoff: '>= includes the boundary as a pass.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'gt', name: '> 60', code: 'out = df.copy()\nout["tier"] = np.where(df["score"] > 60, "pass", "fail")\nreturn out', detectionSignature: { mustMatch: ['> 60'], mustNotMatch: ['>= 60'], note: 'boundary excluded' }, tradeoff: 'Looks equivalent.', breaksWhen: 'At the boundary — a score of exactly 60 becomes a fail under > 60.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does > 60 mislabel the 60?', options: ['geq', 'gt'], answerId: 'geq', explanation: '"60 or more" includes 60, so the operator must be >=. Strict > 60 excludes the boundary, turning a passing 60 into a fail.' }] }),

  CO({ id: 'pc-clip-outliers', title: 'Cap values, do not drop them', topic: 'pandas-window', tags: ['clip', 'outliers', 'transform'], estimatedMin: 4, fixtureId: 'fx_p2_clip',
    prompt: 'Cap the v column to the range [0, 100]: values below 0 become 0, values above 100 become 100, others unchanged. Keep every row. Return the frame.',
    beforeWriting: 'Capping keeps every row; filtering removes the out-of-range ones. Which does the prompt want?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # cap v to [0, 100], keep all rows\n    ...',
    hints: ['Series.clip(lo, hi) caps values at the bounds without removing rows.', 'Filtering with a mask would drop the out-of-range rows instead of capping.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["v"] = df["v"].clip(0, 100)\n    return out',
    debrief: '-5 → 0, 50 stays, 150 → 100; all three rows remain.\n\n**Wrong answer that runs:** filtering to 0 <= v <= 100 DROPS the -5 and 150 rows, leaving just one row. It runs and returns a frame; it removed the outliers instead of capping them.\n\n**Sanity check:** the row count must be unchanged (3). If rows disappeared, you filtered instead of clipping.',
    canonicalMethodId: 'clip', methods: [
      { id: 'clip', name: 'Series.clip', code: 'out = df.copy()\nout["v"] = df["v"].clip(0, 100)\nreturn out', detectionSignature: { mustMatch: ['.clip('], mustNotMatch: [], note: 'cap, keep rows' }, tradeoff: 'clip caps at the bounds and keeps every row.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'filter', name: 'mask filter', code: 'return df[(df["v"] >= 0) & (df["v"] <= 100)].reset_index(drop=True)', detectionSignature: { mustMatch: ['>= 0) & (df["v"] <= 100'], mustNotMatch: ['clip'], note: 'drops out-of-range rows' }, tradeoff: 'Also handles outliers.', breaksWhen: 'When rows must be kept — a mask removes the out-of-range rows instead of capping their values.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the mask lose rows?', options: ['clip', 'filter'], answerId: 'clip', explanation: 'clip changes out-of-range VALUES to the bounds but keeps every row. A boolean mask removes the rows entirely, which is not capping.' }] }),

  CO({ id: 'pc-rank-dense', title: 'Dense rank with ties', topic: 'pandas-window', tags: ['rank', 'ties', 'dense'], estimatedMin: 5, fixtureId: 'fx_p2_rank',
    prompt: 'Add a column "rank" giving each score a DENSE rank (highest score is 1; equal scores share a rank; no gaps after ties), as an int. Return the frame.',
    beforeWriting: 'Two scores tie. Dense rank gives them the same rank with no gap after. Does the default ranking do that?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # dense rank, highest = 1\n    ...',
    hints: ['rank(method="dense", ascending=False) gives 1,1,2 with no gap.', 'The default method is "average", which returns 1.5 for a two-way tie.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["rank"] = df["score"].rank(method="dense", ascending=False).astype(int)\n    return out',
    debrief: 'The two 90s share rank 1, and 80 is rank 2 (no gap).\n\n**Wrong answer that runs:** the default rank() uses method="average", so the tied 90s each get 1.5 and 80 gets 3 — fractional ranks with a gap, not dense integer ranks. It runs and adds a column; the ranking scheme is just the wrong one.\n\n**Sanity check:** dense ranks are consecutive integers (1,1,2). If you see 1.5 or a jump to 3, you used the default (average) method.',
    canonicalMethodId: 'dense', methods: [
      { id: 'dense', name: 'rank(method="dense")', code: 'out = df.copy()\nout["rank"] = df["score"].rank(method="dense", ascending=False).astype(int)\nreturn out', detectionSignature: { mustMatch: ['method="dense"'], mustNotMatch: [], note: 'consecutive integers' }, tradeoff: 'Dense rank: ties share, no gaps.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'avg_rank', name: 'default rank()', code: 'out = df.copy()\nout["rank"] = df["score"].rank(ascending=False)\nreturn out', detectionSignature: { mustMatch: ['.rank(ascending=False)'], mustNotMatch: ['method='], note: 'average, fractional' }, tradeoff: 'Shorter.', breaksWhen: 'On ties — the default "average" gives fractional ranks (1.5) and a gap, not dense integers.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'What does the default rank do to the tied 90s?', options: ['dense', 'avg_rank'], answerId: 'dense', explanation: 'The default method="average" averages the tied positions (1 and 2) to 1.5 and jumps 80 to 3. Dense rank gives 1,1,2 — consecutive integers with no gap.' }] }),

  CO({ id: 'pc-pct-of-total', title: 'Share of the column total', topic: 'pandas-window', tags: ['proportion', 'total', 'transform'], estimatedMin: 4, fixtureId: 'fx_p2_pct',
    prompt: 'Add a column "pct" giving each row\'s v as a fraction of the SUM of the whole column (so the pcts add to 1). Return the frame.',
    beforeWriting: 'A share of the total divides by the sum. Dividing by the max gives something else — which sums to 1?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # each v divided by the column total\n    ...',
    hints: ['Divide the column by its sum.', 'Dividing by the max scales the largest to 1 but the column will not sum to 1.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["pct"] = df["v"] / df["v"].sum()\n    return out',
    debrief: 'Total is 100, so 10/30/60 → 0.1/0.3/0.6, summing to 1.\n\n**Wrong answer that runs:** dividing by the MAX (60) gives 0.167/0.5/1.0 — a valid rescaling, but the shares no longer sum to 1. It runs and returns fractions; it just used the wrong denominator.\n\n**Sanity check:** the pct column should sum to 1. If the largest value maps to 1.0 and the total exceeds 1, you divided by the max.',
    canonicalMethodId: 'of_total', methods: [
      { id: 'of_total', name: 'divide by sum', code: 'out = df.copy()\nout["pct"] = df["v"] / df["v"].sum()\nreturn out', detectionSignature: { mustMatch: ['v"].sum()'], mustNotMatch: [], note: 'shares sum to 1' }, tradeoff: 'Divide by the total for true shares.', breaksWhen: 'A zero total divides by zero.', isTrap: false },
      { id: 'of_max', name: 'divide by max', code: 'out = df.copy()\nout["pct"] = df["v"] / df["v"].max()\nreturn out', detectionSignature: { mustMatch: ['v"].max()'], mustNotMatch: ['sum()'], note: 'does not sum to 1' }, tradeoff: 'Also normalizes.', breaksWhen: 'When you need shares of the total — dividing by the max rescales to [0,1] but the column will not sum to 1.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Which denominator makes the shares sum to 1?', options: ['of_total', 'of_max'], answerId: 'of_total', explanation: 'Dividing each value by the column SUM yields shares that add to 1. Dividing by the max only scales the largest to 1.' }] }),

  W({ id: 'pc-fillna-const', title: 'Fill missing with a constant', topic: 'pandas-window', tags: ['fillna', 'missing', 'fluency'], estimatedMin: 2, fixtureId: 'fx_p2_fillna',
    prompt: 'Fill the missing values in the v column with 0. Return the frame.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # replace NaN in v with 0\n    ...',
    hints: ['Series.fillna(value) replaces NaN with the given value.', 'Assign it back to the column.'],
    solution: 'def solve(df):\n    out = df.copy()\n    out["v"] = df["v"].fillna(0)\n    return out',
    debrief: 'The missing middle value becomes 0. fillna(0) replaces NaN with the constant.',
    canonicalMethodId: 'fill', methods: [{ id: 'fill', name: 'fillna(0)', code: 'out = df.copy()\nout["v"] = df["v"].fillna(0)\nreturn out', tradeoff: 'Replace NaN with a constant.', breaksWhen: 'When 0 is a meaningful value; here it is the intended fill.', isTrap: false }] }),

  W({ id: 'pc-column-select', title: 'Select specific columns', topic: 'pandas-window', tags: ['select', 'columns', 'fluency'], estimatedMin: 2, fixtureId: 'fx_p2_colsel',
    prompt: 'Return a frame with only columns a and c (drop b), in that order.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # keep only columns a and c\n    ...',
    hints: ['Index with a LIST of column names to select several.', 'df[["a","c"]] returns those columns as a frame.'],
    solution: 'def solve(df):\n    return df[["a", "c"]]',
    debrief: 'df[["a","c"]] selects the two named columns in order. A single-bracket df["a"] would return one Series instead.',
    canonicalMethodId: 'select', methods: [{ id: 'select', name: 'df[["a","c"]]', code: 'return df[["a", "c"]]', tradeoff: 'A list of names selects columns as a frame.', breaksWhen: 'Nothing here.', isTrap: false }] }),

];

export default problems;

// pyLabBatch_pandas_everyday — breadth on the most common pandas tasks (D-PL-29 / Track 2):
// merge patterns, reshape (pivot/melt/crosstab), and everyday cleaning + datetime. Skewed
// easy->medium (the common band). Warmups are single-method fluency reps; core problems carry
// one honest runs-but-wrong trap. All executed in CPython (pandas 2.3) before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_pe_merge': { args: ['left', 'right'], setup: 'import pandas as pd\nleft = pd.DataFrame({"id": [1, 2, 3], "name": ["a", "b", "c"]})\nright = pd.DataFrame({"id": [1, 2], "score": [10, 20]})', preview: 'left (id,name) has 3 rows; right (id,score) has 2. id 3 has no score.' },
  'fx_pe_anti': { args: ['left', 'right'], setup: 'import pandas as pd\nleft = pd.DataFrame({"id": [1, 2, 3]})\nright = pd.DataFrame({"id": [1, 2]})', preview: 'left ids {1,2,3}, right ids {1,2}. Only id 3 is in left but not right.' },
  'fx_pe_suffix': { args: ['a', 'b'], setup: 'import pandas as pd\na = pd.DataFrame({"id": [1, 2], "val": [10, 20]})\nb = pd.DataFrame({"id": [1, 2], "val": [1, 2]})', preview: 'both frames have a "val" column that will collide on merge.' },
  'fx_pe_pivot': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"dept": ["A", "A", "B"], "role": ["x", "y", "x"], "n": [1, 2, 3]})', preview: 'long rows of dept/role/n → pivot to a dept × role grid of n.' },
  'fx_pe_melt': { args: ['wide'], setup: 'import pandas as pd\nwide = pd.DataFrame({"id": [1, 2], "jan": [10, 20], "feb": [30, 40]})', preview: 'wide: id plus month columns jan/feb → melt to long (id, month, value).' },
  'fx_pe_crosstab': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["W", "W", "E"], "status": ["paid", "free", "paid"]})', preview: 'region × status counts; region E has no "free" (must read 0, not missing).' },
  'fx_pe_rename': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"Name": ["a"], "Score": [1]})', preview: 'columns "Name","Score" → lowercase them to "name","score".' },
  'fx_pe_contains': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"name": ["Ana", "BEN", "ana"]})', preview: 'names in mixed case; "an" appears in Ana and ana (case-insensitively).' },
  'fx_pe_dedup': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"user": [1, 1, 2], "day": [1, 2, 1], "v": [9, 9, 5]})', preview: 'user 1 appears twice on different days → dedup on user, keep first.' },
  'fx_pe_split': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"name": ["Ada Lovelace", "Bo Peep"]})', preview: 'full names → split into first and last columns.' },
  'fx_pe_vcnorm': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"cat": ["a", "a", "b", "a"]})', preview: 'cat a×3, b×1 → proportions a=0.75, b=0.25.' },
  'fx_pe_dayname': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"date": ["2023-01-02", "2023-01-07"]})', preview: 'dates as text → add the weekday name (Monday, Saturday).' },
  'fx_pe_month': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"date": ["2023-01-05", "2023-01-20", "2023-02-10"], "amt": [10, 20, 30]})', preview: 'two January rows + one February → sum amt per MONTH (Jan 30, Feb 30).' },
  'fx_pe_currency': { args: ['df'], setup: 'import pandas as pd\ndf = pd.DataFrame({"amount": ["$100", "$200", "$300"]})', preview: 'amounts as text with a $ prefix → total is 600 after stripping the $.' },
};

const W = (o) => ({ difficulty: 'warmup', dial: { axes: [], rules: [] }, mcqs: [], ...o });

export const problems = [

  W({
    id: 'pm-inner-merge-basic', title: 'Inner merge on a key', topic: 'pandas-merge', tags: ['merge', 'join', 'fluency'], estimatedMin: 3, fixtureId: 'fx_pe_merge',
    prompt: 'Join left and right on the id column, keeping only ids present in BOTH (an inner join). Return the joined frame.',
    signature: 'solve(left, right)', starterCode: 'def solve(left, right):\n    # inner join on id\n    ...',
    hints: ['pd.merge / .merge joins two frames on a shared column.', 'The default how is "inner" — only matching ids survive.'],
    solution: 'def solve(left, right):\n    return left.merge(right, on="id")', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'ids 1 and 2 are in both; id 3 (no score) drops out under an inner join. .merge(on="id") defaults to inner.',
    canonicalMethodId: 'inner', methods: [{ id: 'inner', name: '.merge(on="id")', code: 'return left.merge(right, on="id")', tradeoff: 'The default inner join keeps only matching keys.', breaksWhen: 'Duplicate keys on either side fan out.', isTrap: false }],
  }),

  {
    id: 'pm-left-merge-fill', title: 'Left join, fill the gaps', topic: 'pandas-merge', difficulty: 'core', tags: ['merge', 'left-join', 'fillna'], estimatedMin: 5, fixtureId: 'fx_pe_merge',
    prompt: 'Keep EVERY row of left and attach the score from right. Where there is no matching score, fill it with 0. Return the frame.',
    beforeWriting: 'You must not lose id 3. Which join keeps every left row, and what does the missing score become before you fill it?',
    signature: 'solve(left, right)', starterCode: 'def solve(left, right):\n    # keep all left rows; missing score -> 0\n    ...',
    hints: ['how="left" keeps every row of left; unmatched right columns become NaN.', 'Then fillna(0) turns the gaps into zeros.'],
    solution: 'def solve(left, right):\n    m = left.merge(right, on="id", how="left")\n    m["score"] = m["score"].fillna(0)\n    return m', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'All three ids survive; id 3\'s score fills to 0.\n\n**Wrong answer that runs:** a default (inner) merge silently drops id 3 for having no score, returning 2 rows instead of 3. It runs and returns a joined frame; it just lost the row you were told to keep.\n\n**Sanity check:** the row count out must equal the row count of left. If it shrank, you used an inner join instead of how="left".',
    canonicalMethodId: 'left_fill', dial: { axes: [], rules: [] },
    methods: [
      { id: 'left_fill', name: 'left join + fillna', code: 'm = left.merge(right, on="id", how="left")\nm["score"] = m["score"].fillna(0)\nreturn m', detectionSignature: { mustMatch: ['how="left"'], mustNotMatch: [], note: 'keep all left rows' }, tradeoff: 'Left join keeps every left row; fillna handles the unmatched score.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'inner_drop', name: 'default (inner) merge', code: 'return left.merge(right, on="id")', detectionSignature: { mustMatch: ['merge(right, on="id")'], mustNotMatch: ['how="left"'], note: 'drops unmatched left rows' }, tradeoff: 'Shorter and it runs.', breaksWhen: 'Whenever a left row has no match — an inner join silently drops it, so you lose rows you meant to keep.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does the default merge lose id 3?', options: ['left_fill', 'inner_drop'], answerId: 'inner_drop', explanation: 'The default join is inner, which keeps only keys present in both frames. id 3 has no score, so it is dropped. how="left" keeps all left rows (score NaN), then fillna(0) fills the gap.' }],
  },

  {
    id: 'pm-anti-join', title: 'Ids in left but not right (anti-join)', topic: 'pandas-merge', difficulty: 'core', tags: ['anti-join', 'set', 'merge'], estimatedMin: 5, fixtureId: 'fx_pe_anti',
    prompt: 'Return the sorted list of ids that appear in left but NOT in right.',
    beforeWriting: 'An anti-join is directional: left-minus-right is not the same as right-minus-left. Which side is the base?',
    signature: 'solve(left, right)', starterCode: 'def solve(left, right):\n    # ids in left that are missing from right\n    ...',
    hints: ['Set difference captures "in A but not B".', 'The order matters: left minus right, then sort.'],
    solution: 'def solve(left, right):\n    return sorted(set(left["id"]) - set(right["id"]))', compare: { kind: 'seq' },
    debrief: 'Only id 3 is in left but not right → [3].\n\n**Wrong answer that runs:** reversing the direction (right minus left) asks the opposite question. Here right\'s ids are all in left, so it returns [] — an empty list that looks like "nothing unmatched". It runs; it just answered the mirror-image question.\n\n**Sanity check:** every id you return must be in left and absent from right. If you get an empty result when left is clearly bigger, you subtracted the wrong way.',
    canonicalMethodId: 'anti', dial: { axes: [], rules: [] },
    methods: [
      { id: 'anti', name: 'left − right', code: 'return sorted(set(left["id"]) - set(right["id"]))', detectionSignature: { mustMatch: ['left["id"]) - set(right'], mustNotMatch: [], note: 'left minus right' }, tradeoff: 'Set difference in the correct direction, then sort.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'wrong_dir', name: 'right − left', code: 'return sorted(set(right["id"]) - set(left["id"]))', detectionSignature: { mustMatch: ['right["id"]) - set(left'], mustNotMatch: [], note: 'reversed direction' }, tradeoff: 'Also a set difference and runs.', breaksWhen: 'Whenever the direction matters — right-minus-left answers the opposite question and here returns an empty list.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does right − left return []?', options: ['anti', 'wrong_dir'], answerId: 'anti', explanation: 'Anti-join is directional. left−right finds ids only in left (id 3). right−left finds ids only in right — and every right id is already in left, so it is empty.' }],
  },

  {
    id: 'pm-merge-suffixes', title: 'Disambiguate colliding columns', topic: 'pandas-merge', difficulty: 'core', tags: ['merge', 'suffixes', 'columns'], estimatedMin: 5, fixtureId: 'fx_pe_suffix',
    prompt: 'Both frames have a column named "val". Join them on id and label the two value columns "val_a" (from a) and "val_b" (from b). Return the frame.',
    beforeWriting: 'When a non-key column name collides, pandas renames both. What are the DEFAULT names, and are they the ones asked for?',
    signature: 'solve(a, b)', starterCode: 'def solve(a, b):\n    # merge on id; value columns become val_a and val_b\n    ...',
    hints: ['The suffixes= argument controls the two renamed columns.', 'The default suffixes are _x and _y — not what the prompt wants.'],
    solution: 'def solve(a, b):\n    return a.merge(b, on="id", suffixes=("_a", "_b"))', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The merge yields id, val_a, val_b.\n\n**Wrong answer that runs:** merging without suffixes= produces the DEFAULT names val_x and val_y. It runs and joins correctly; the columns are just named wrong for the spec (val_x instead of val_a), which breaks any downstream code that expects val_a/val_b.\n\n**Sanity check:** confirm the output column names are exactly val_a and val_b. If you see val_x/val_y, you did not pass suffixes=.',
    canonicalMethodId: 'suffixes', dial: { axes: [], rules: [] },
    methods: [
      { id: 'suffixes', name: 'suffixes=("_a","_b")', code: 'return a.merge(b, on="id", suffixes=("_a", "_b"))', detectionSignature: { mustMatch: ['suffixes='], mustNotMatch: [], note: 'names the collided columns' }, tradeoff: 'Explicit suffixes name the two value columns as required.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'default_suffix', name: 'no suffixes', code: 'return a.merge(b, on="id")', detectionSignature: { mustMatch: ['merge(b, on="id")'], mustNotMatch: ['suffixes='], note: 'default _x/_y names' }, tradeoff: 'Joins fine.', breaksWhen: 'When column names matter — the defaults _x/_y do not match the spec and break downstream references.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'What are the default collision suffixes?', options: ['suffixes', 'default_suffix'], answerId: 'default_suffix', explanation: 'Without suffixes=, pandas uses _x and _y. To get val_a/val_b you must pass suffixes=("_a","_b").' }],
  },

  W({
    id: 'pr-pivot-basic', title: 'Pivot long rows to a grid', topic: 'pandas-reshape', tags: ['pivot', 'reshape', 'fluency'], estimatedMin: 4, fixtureId: 'fx_pe_pivot',
    prompt: 'Reshape the long dept/role/n rows into a grid: one row per dept, one column per role, cells holding the summed n (0 where a combination is absent). Reset the index and drop the columns axis name.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # dept x role grid of summed n\n    ...',
    hints: ['pivot_table(index=..., columns=..., values=..., aggfunc="sum") builds the grid.', 'fill_value=0 fills absent combinations; reset_index() flattens it.'],
    solution: 'def solve(df):\n    p = df.pivot_table(index="dept", columns="role", values="n", aggfunc="sum", fill_value=0)\n    p = p.reset_index()\n    p.columns.name = None\n    return p', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'dept A gets x=1, y=2; dept B gets x=3, y=0. pivot_table sums into the grid and fill_value=0 fills the empty B/y cell.',
    canonicalMethodId: 'pivot', methods: [{ id: 'pivot', name: 'pivot_table', code: 'p = df.pivot_table(index="dept", columns="role", values="n", aggfunc="sum", fill_value=0)\np = p.reset_index()\np.columns.name = None\nreturn p', tradeoff: 'The standard long-to-grid reshape.', breaksWhen: 'Duplicate index/column pairs need an aggfunc (given here).', isTrap: false }],
  }),

  {
    id: 'pr-melt', title: 'Melt wide months to long', topic: 'pandas-reshape', difficulty: 'core', tags: ['melt', 'reshape', 'wide-to-long'], estimatedMin: 5, fixtureId: 'fx_pe_melt',
    prompt: 'The frame has an id plus one column per month (jan, feb). Reshape it to long form: columns id, month, value — one row per id-month. Keep id as the identifier.',
    beforeWriting: 'Melt turns columns into rows. Which column must stay fixed as the identifier rather than being melted away?',
    signature: 'solve(wide)', starterCode: 'def solve(wide):\n    # id, month, value — one row per id-month\n    ...',
    hints: ['melt(id_vars=...) keeps the identifier column and unpivots the rest.', 'Without id_vars, id itself gets melted into the value column.'],
    solution: 'def solve(wide):\n    return wide.melt(id_vars="id", var_name="month", value_name="value")', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Each id-month becomes a row: (1,jan,10), (2,jan,20), (1,feb,30), (2,feb,40).\n\n**Wrong answer that runs:** melting WITHOUT id_vars treats id as just another column to unpivot, so id values (1, 2) end up in the value column and the structure is wrong. It runs and returns a long frame; it just dissolved the identifier.\n\n**Sanity check:** id must remain its own column with its original values. If id appears as a "variable" alongside jan/feb, you forgot id_vars.',
    canonicalMethodId: 'melt', dial: { axes: [], rules: [] },
    methods: [
      { id: 'melt', name: 'melt(id_vars="id")', code: 'return wide.melt(id_vars="id", var_name="month", value_name="value")', detectionSignature: { mustMatch: ['id_vars'], mustNotMatch: [], note: 'keep id fixed' }, tradeoff: 'id_vars pins the identifier; the month columns unpivot.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'melt_no_id', name: 'melt without id_vars', code: 'return wide.melt(var_name="month", value_name="value")', detectionSignature: { mustMatch: ['melt('], mustNotMatch: ['id_vars'], note: 'melts id too' }, tradeoff: 'Shorter and runs.', breaksWhen: 'When there is an identifier column — without id_vars it gets melted into the value column, corrupting the shape.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why keep id_vars="id"?', options: ['melt', 'melt_no_id'], answerId: 'melt', explanation: 'melt unpivots every column not in id_vars. Without it, id is treated as a value column and its numbers land in "value". id_vars pins id as the identifier.' }],
  },

  {
    id: 'pr-crosstab', title: 'Count table with zeros', topic: 'pandas-reshape', difficulty: 'core', tags: ['crosstab', 'reshape', 'nan'], estimatedMin: 5, fixtureId: 'fx_pe_crosstab',
    prompt: 'Build a count table of region (rows) by status (columns): each cell is how many rows have that region-status pair. A pair that never occurs must read 0, not missing. Reset the index and drop the columns axis name.',
    beforeWriting: 'Region E never appears as "free". Should that cell be 0 or NaN — and which method gives which?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # region x status counts, absent pairs = 0\n    ...',
    hints: ['pd.crosstab counts region-by-status and fills absent pairs with 0.', 'A groupby().size().unstack() leaves absent pairs as NaN instead.'],
    solution: 'def solve(df):\n    c = pd.crosstab(df["region"], df["status"])\n    c = c.reset_index()\n    c.columns.name = None\n    return c', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'W has paid=1, free=1; E has paid=1, free=0.\n\n**Wrong answer that runs:** groupby(["region","status"]).size().unstack() leaves the E/free cell as NaN (and turns the counts into floats), because that pair never occurred. It runs and returns a table; the missing 0 becomes a NaN that will break later integer math or sums.\n\n**Sanity check:** every cell should be an integer count, with 0 where a pair is absent. If you see NaN, use crosstab (or unstack(fill_value=0)).',
    canonicalMethodId: 'crosstab', dial: { axes: [], rules: [] },
    methods: [
      { id: 'crosstab', name: 'pd.crosstab', code: 'c = pd.crosstab(df["region"], df["status"])\nc = c.reset_index()\nc.columns.name = None\nreturn c', detectionSignature: { mustMatch: ['crosstab'], mustNotMatch: [], note: 'fills absent pairs with 0' }, tradeoff: 'crosstab counts and fills absent pairs with integer 0.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'unstack_nan', name: 'groupby.size().unstack()', code: 'g = df.groupby(["region", "status"]).size().unstack()\ng = g.reset_index()\ng.columns.name = None\nreturn g', detectionSignature: { mustMatch: ['unstack()'], mustNotMatch: ['fill_value'], note: 'absent pairs become NaN' }, tradeoff: 'Also produces a table.', breaksWhen: 'When some pairs never occur — unstack leaves them NaN (and floats), instead of 0.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does the unstack version show NaN?', options: ['crosstab', 'unstack_nan'], answerId: 'unstack_nan', explanation: 'groupby only produces rows for pairs that occur; unstacking leaves never-seen pairs (E/free) as NaN. crosstab (or unstack(fill_value=0)) fills them with 0.' }],
  },

  W({
    id: 'pc-rename-columns', title: 'Lowercase the column names', topic: 'pandas-window', tags: ['rename', 'columns', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pe_rename',
    prompt: 'Return the frame with every column name lowercased (e.g. "Name" -> "name").',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # lowercase all column names\n    ...',
    hints: ['rename(columns=...) can take a function applied to each name.', 'str.lower lowercases a string.'],
    solution: 'def solve(df):\n    return df.rename(columns=str.lower)', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: '"Name"->"name", "Score"->"score". rename(columns=str.lower) applies the function to every column label.',
    canonicalMethodId: 'rename', methods: [{ id: 'rename', name: 'rename(columns=str.lower)', code: 'return df.rename(columns=str.lower)', tradeoff: 'Applies lower() to each column name.', breaksWhen: 'Nothing here.', isTrap: false }],
  }),

  {
    id: 'pc-str-contains-filter', title: 'Case-insensitive text filter', topic: 'pandas-window', difficulty: 'core', tags: ['str', 'filter', 'case'], estimatedMin: 4, fixtureId: 'fx_pe_contains',
    prompt: 'Return only the rows whose name contains "an", treating upper and lower case as the same.',
    beforeWriting: 'str.contains is case-SENSITIVE by default. Does that match "the same case or not" requirement?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # rows whose name contains "an", ignoring case\n    ...',
    hints: ['.str.contains filters rows by substring.', 'Pass case=False so "An" and "an" both match.'],
    solution: 'def solve(df):\n    return df[df["name"].str.contains("an", case=False)]', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Case-insensitively, both "Ana" and "ana" contain "an" → 2 rows.\n\n**Wrong answer that runs:** the default str.contains("an") is case-sensitive, so "Ana" (capital A) does not match the lowercase "an" and only "ana" survives. It runs and filters; it just applied the wrong case rule and dropped a valid row.\n\n**Sanity check:** if a differently-cased match is missing from your result, you left case-sensitivity on — pass case=False.',
    canonicalMethodId: 'caseless', dial: { axes: [], rules: [] },
    methods: [
      { id: 'caseless', name: 'contains(case=False)', code: 'return df[df["name"].str.contains("an", case=False)]', detectionSignature: { mustMatch: ['case=False'], mustNotMatch: [], note: 'ignore case' }, tradeoff: 'case=False matches regardless of letter case.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'case_sensitive', name: 'contains (default)', code: 'return df[df["name"].str.contains("an")]', detectionSignature: { mustMatch: ['str.contains("an")'], mustNotMatch: ['case=False'], note: 'case-sensitive default' }, tradeoff: 'Shorter and runs.', breaksWhen: 'When case should not matter — the default is case-sensitive, so "Ana" is missed.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does the default filter miss "Ana"?', options: ['caseless', 'case_sensitive'], answerId: 'case_sensitive', explanation: 'str.contains is case-sensitive by default, so capital-A "Ana" does not match lowercase "an". case=False makes the match ignore case.' }],
  },

  {
    id: 'pc-drop-dup-subset', title: 'Dedup on a subset of columns', topic: 'pandas-window', difficulty: 'core', tags: ['drop_duplicates', 'subset', 'dedup'], estimatedMin: 5, fixtureId: 'fx_pe_dedup',
    prompt: 'Keep only the first row per user (dedup on the user column). Return the frame with a reset index.',
    beforeWriting: 'user 1 has two rows that differ in other columns. Deduping on ALL columns vs on just "user" gives different results — which does the prompt want?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # one row per user (the first)\n    ...',
    hints: ['drop_duplicates(subset) restricts which columns define a duplicate.', 'Without a subset, rows must match on EVERY column to be duplicates.'],
    solution: 'def solve(df):\n    return df.drop_duplicates("user", keep="first").reset_index(drop=True)', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'One row per user → users 1 (first) and 2, so 2 rows.\n\n**Wrong answer that runs:** drop_duplicates() with no subset compares ALL columns, and user 1\'s two rows differ (day 1 vs day 2), so neither is a duplicate — both survive, giving 3 rows. It runs and returns a frame; it just deduped on the wrong key.\n\n**Sanity check:** the output should have one row per distinct user. If a user still appears twice, you deduped on all columns instead of subset="user".',
    canonicalMethodId: 'subset', dial: { axes: [], rules: [] },
    methods: [
      { id: 'subset', name: 'drop_duplicates("user")', code: 'return df.drop_duplicates("user", keep="first").reset_index(drop=True)', detectionSignature: { mustMatch: ['drop_duplicates("user"'], mustNotMatch: [], note: 'dedup key = user' }, tradeoff: 'Restrict the duplicate key to user — one row per user.', breaksWhen: 'Which row wins depends on order; keep="first" is explicit.', isTrap: false },
      { id: 'all_cols', name: 'drop_duplicates() (all cols)', code: 'return df.drop_duplicates().reset_index(drop=True)', detectionSignature: { mustMatch: ['drop_duplicates()'], mustNotMatch: ['"user"'], note: 'needs every column equal' }, tradeoff: 'Looks like a dedup.', breaksWhen: 'When duplicate rows differ in other columns — a full-row dedup keeps them all, so users are not collapsed.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does the no-subset dedup keep both user-1 rows?', options: ['subset', 'all_cols'], answerId: 'all_cols', explanation: 'drop_duplicates() compares every column. user 1\'s rows differ in day, so they are not identical and both survive. subset="user" makes user the dedup key.' }],
  },

  W({
    id: 'pc-str-split-expand', title: 'Split a name into two columns', topic: 'pandas-window', tags: ['str', 'split', 'fluency'], estimatedMin: 4, fixtureId: 'fx_pe_split',
    prompt: 'Split the "name" column on the first space into two new columns, "first" and "last". Return the frame with name, first, last.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # add first and last from the name column\n    ...',
    hints: ['.str.split(" ", n=1, expand=True) returns a two-column frame.', 'Assign column 0 to first, column 1 to last.'],
    solution: 'def solve(df):\n    s = df["name"].str.split(" ", n=1, expand=True)\n    out = df.copy()\n    out["first"] = s[0]\n    out["last"] = s[1]\n    return out', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: '"Ada Lovelace" -> first "Ada", last "Lovelace". expand=True turns the split into columns; n=1 splits only on the first space.',
    canonicalMethodId: 'expand', methods: [{ id: 'expand', name: 'str.split(expand=True)', code: 's = df["name"].str.split(" ", n=1, expand=True)\nout = df.copy()\nout["first"] = s[0]\nout["last"] = s[1]\nreturn out', tradeoff: 'expand=True gives columns you can assign directly.', breaksWhen: 'Names without a space leave last as NaN.', isTrap: false }],
  }),

  {
    id: 'pc-value-counts-normalize', title: 'Proportions, not counts', topic: 'pandas-window', difficulty: 'core', tags: ['value_counts', 'normalize', 'proportion'], estimatedMin: 4, fixtureId: 'fx_pe_vcnorm',
    prompt: 'Return the PROPORTION of each category in the cat column (each category\'s share of the total, summing to 1), as a Series.',
    beforeWriting: 'value_counts gives raw counts by default. What turns those counts into shares that sum to 1?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # each category\'s share of the total\n    ...',
    hints: ['value_counts(normalize=True) returns proportions instead of counts.', 'Without normalize, you get integer counts (3, 1), not shares.'],
    solution: 'def solve(df):\n    return df["cat"].value_counts(normalize=True)', compare: { kind: 'series' },
    debrief: 'a is 3 of 4 (0.75), b is 1 of 4 (0.25).\n\n**Wrong answer that runs:** value_counts() without normalize returns the raw counts (a=3, b=1). It runs and returns a Series; the numbers are just frequencies, not the proportions that sum to 1.\n\n**Sanity check:** the values should add up to 1. If they add up to the row count, you left off normalize=True.',
    canonicalMethodId: 'normalized', dial: { axes: [], rules: [] },
    methods: [
      { id: 'normalized', name: 'value_counts(normalize=True)', code: 'return df["cat"].value_counts(normalize=True)', detectionSignature: { mustMatch: ['normalize=True'], mustNotMatch: [], note: 'shares that sum to 1' }, tradeoff: 'normalize=True divides each count by the total.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'raw_counts', name: 'value_counts()', code: 'return df["cat"].value_counts()', detectionSignature: { mustMatch: ['value_counts()'], mustNotMatch: ['normalize'], note: 'raw counts' }, tradeoff: 'Returns frequencies.', breaksWhen: 'When you need shares — raw counts do not sum to 1.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'How do you get shares instead of counts?', options: ['normalized', 'raw_counts'], answerId: 'normalized', explanation: 'value_counts(normalize=True) divides each count by the total, giving proportions that sum to 1. Plain value_counts returns integer counts.' }],
  },

  W({
    id: 'pd-dt-dayname', title: 'Weekday name from a date', topic: 'pandas-window', tags: ['datetime', 'dt-accessor', 'fluency'], estimatedMin: 3, fixtureId: 'fx_pe_dayname',
    prompt: 'The date column is text. Add a column "day" holding the weekday name (Monday, Tuesday, …) for each date. Return the frame.',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # add the weekday name for each date\n    ...',
    hints: ['pd.to_datetime parses the text into real dates.', 'The .dt.day_name() accessor gives the weekday name.'],
    solution: 'def solve(df):\n    d = pd.to_datetime(df["date"])\n    out = df.copy()\n    out["day"] = d.dt.day_name()\n    return out', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: '2023-01-02 is a Monday, 2023-01-07 a Saturday. Parse with to_datetime, then read .dt.day_name().',
    canonicalMethodId: 'dayname', methods: [{ id: 'dayname', name: 'dt.day_name()', code: 'd = pd.to_datetime(df["date"])\nout = df.copy()\nout["day"] = d.dt.day_name()\nreturn out', tradeoff: 'Parse to datetime, then use the dt accessor.', breaksWhen: 'Unparseable dates need errors="coerce".', isTrap: false }],
  }),

  {
    id: 'pd-groupby-month-sum', title: 'Total per month from a date', topic: 'pandas-window', difficulty: 'core', tags: ['datetime', 'groupby', 'month'], estimatedMin: 5, fixtureId: 'fx_pe_month',
    prompt: 'Sum amt per calendar month. Parse the date, group by its month number, and return a frame with columns month and amt.',
    beforeWriting: 'The dates are distinct strings. If you group by the raw date, do same-month rows land together?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # sum amt per month\n    ...',
    hints: ['Parse with to_datetime, then take .dt.month.', 'Grouping by the raw date string keeps each date separate — group by the month instead.'],
    solution: 'def solve(df):\n    d = pd.to_datetime(df["date"])\n    return df.assign(month=d.dt.month).groupby("month", as_index=False)["amt"].sum()', compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'Two January rows (10+20=30) and one February (30) → month 1: 30, month 2: 30.\n\n**Wrong answer that runs:** grouping by the raw date string keeps each distinct date separate, so you get one row per date (three rows), not per month. It runs and returns a per-date sum; it just never rolled up to months.\n\n**Sanity check:** the number of output rows should equal the number of distinct months (2). If it equals the number of distinct dates, you grouped by the wrong key.',
    canonicalMethodId: 'by_month', dial: { axes: [], rules: [] },
    methods: [
      { id: 'by_month', name: 'group by dt.month', code: 'd = pd.to_datetime(df["date"])\nreturn df.assign(month=d.dt.month).groupby("month", as_index=False)["amt"].sum()', detectionSignature: { mustMatch: ['dt.month'], mustNotMatch: [], note: 'roll up to month' }, tradeoff: 'Derive the month, then group by it.', breaksWhen: 'Spanning multiple years needs (year, month), not month alone.', isTrap: false },
      { id: 'by_raw_date', name: 'group by the raw date', code: 'return df.groupby("date", as_index=False)["amt"].sum()', detectionSignature: { mustMatch: ['groupby("date"'], mustNotMatch: ['dt.month'], note: 'per exact date, not month' }, tradeoff: 'Simple and runs.', breaksWhen: 'When same-month dates should combine — grouping by the exact date keeps them separate.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does grouping by the raw date give three rows?', options: ['by_month', 'by_raw_date'], answerId: 'by_raw_date', explanation: 'Each date string is distinct, so grouping by it never combines the two January rows. Derive the month (dt.month) and group by that to roll up.' }],
  },

  {
    id: 'pc-clean-then-parse-sum', title: 'Strip the symbol, then total', topic: 'pandas-window', difficulty: 'core', tags: ['str', 'to_numeric', 'cleaning'], estimatedMin: 5, fixtureId: 'fx_pe_currency',
    prompt: 'The amount column is text with a leading "$" (e.g. "$100"). Return the total of the amounts as a number.',
    beforeWriting: 'A "$100" string is not a number yet. What does to_numeric do with the "$" still attached?',
    signature: 'solve(df)', starterCode: 'def solve(df):\n    # total the amounts (strip the $ first)\n    ...',
    hints: ['Remove the "$" from the text before converting.', 'to_numeric on "$100" cannot parse it and yields NaN — clean first.'],
    solution: 'def solve(df):\n    s = pd.to_numeric(df["amount"].str.replace("$", "", regex=False))\n    return float(s.sum())', compare: { kind: 'float' },
    debrief: 'Stripped of "$", the values are 100, 200, 300 → total 600.\n\n**Wrong answer that runs:** to_numeric with errors="coerce" applied to the raw "$100" strings cannot parse them, turns every value into NaN, and sums to 0.0. It runs and returns a number; the "$" quietly defeated the parse, so the total collapsed to zero.\n\n**Sanity check:** if the total is 0 (or NaN) when there are clearly real amounts, the strings never converted — strip non-numeric characters before to_numeric.',
    canonicalMethodId: 'clean_first', dial: { axes: [], rules: [] },
    methods: [
      { id: 'clean_first', name: 'strip $, then to_numeric', code: 's = pd.to_numeric(df["amount"].str.replace("$", "", regex=False))\nreturn float(s.sum())', detectionSignature: { mustMatch: ['str.replace'], mustNotMatch: [], note: 'clean before parse' }, tradeoff: 'Remove the symbol first so the numbers parse.', breaksWhen: 'Other stray characters need cleaning too.', isTrap: false },
      { id: 'parse_raw', name: 'to_numeric on the raw text', code: 'return float(pd.to_numeric(df["amount"], errors="coerce").sum())', detectionSignature: { mustMatch: ['errors="coerce"'], mustNotMatch: ['str.replace'], note: 'every value -> NaN' }, tradeoff: 'Looks defensive with errors="coerce".', breaksWhen: 'When the text has non-numeric characters ($) — coerce turns every value into NaN and the sum is 0.', isTrap: true },
    ],
    mcqs: [{ id: 'q1', stem: 'Why does to_numeric on the raw column sum to 0?', options: ['clean_first', 'parse_raw'], answerId: 'parse_raw', explanation: '"$100" is not parseable as a number, so errors="coerce" makes it NaN. Every value becomes NaN and the sum is 0. Strip the "$" first, then convert.' }],
  },

];

export default problems;

// pyLabBatch_mergereshape — PyLab migration batch: pandas merge + reshape (PYLAB-BUILD-SPEC).
// Source: the 10 merge/reshape drills from src/data/pandasProblems.js, re-authored to the
// PyLab solve()->output + pl_compare contract. Prompts are DE-JARGONED (no merge/join/pivot/
// melt/crosstab/stack vocabulary); debriefs are built from REAL executed divergences; traps
// RUN AND DIVERGE (verified in CPython pandas 2.x). Fixtures are engineered so the footguns
// fire: merge fixtures carry a duplicate right-side key (fan-out), reshape fixtures carry a
// duplicate (index, column) pair (pivot vs pivot_table forks on dupe handling).
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside
// (so no inner escaping); \n for newlines; escape prose apostrophes as \' ; NO backticks.

export const fixtures = {

  // ── merge fixtures (right-side duplicate key engineered for the fan-out footgun) ──

  'fx_orders_products_dupe': {
    args: ['orders', 'products'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 2, 3], "product_id": [10, 20, 10]})\nproducts = pd.DataFrame({"product_id": [10, 20, 10], "price": [5.0, 7.0, 5.0]})',
    preview: 'orders (3 rows) + products whose product_id 10 appears TWICE - a naive join fans out to 4 rows.',
  },

  'fx_users_orders': {
    args: ['users', 'orders'],
    setup: 'import pandas as pd\nusers = pd.DataFrame({"user_id": [1, 2, 3, 4]})\norders = pd.DataFrame({"user_id": [2, 4], "amount": [10, 20]})',
    preview: 'users 1-4; orders only for 2 and 4. Non-buyers are 1 and 3.',
  },

  'fx_left_right_partial': {
    args: ['left', 'right'],
    setup: 'import pandas as pd\nleft = pd.DataFrame({"key": [1, 2, 3], "val": ["a", "b", "c"]})\nright = pd.DataFrame({"key": [1, 2], "extra": [10, 20]})',
    preview: 'left has keys 1,2,3; right has only 1,2. Key 3 is unmatched on the right.',
  },

  'fx_key_overlap': {
    args: ['left', 'right'],
    setup: 'import pandas as pd\nleft = pd.DataFrame({"key": [1, 2, 3]})\nright = pd.DataFrame({"key": [2, 3, 4]})',
    preview: 'left keys 1,2,3; right keys 2,3,4. left_only=1, right_only=1, both=2.',
  },

  'fx_two_months': {
    args: ['jan', 'feb'],
    setup: 'import pandas as pd\njan = pd.DataFrame({"order_id": [1, 2], "amount": [10, 20]})\nfeb = pd.DataFrame({"order_id": [3, 4], "amount": [30, 40]})',
    preview: 'two same-shape frames to be laid end to end into one 4-row frame.',
  },

  // ── reshape fixtures (duplicate (index, column) pair engineered for the pivot fork) ──

  'fx_wide_quarters': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["West", "East"], "q1": [10, 30], "q2": [20, 40]})',
    preview: 'wide: one row per region, a column per quarter (q1, q2). 2 rows x 3 cols.',
  },

  'fx_region_status': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"region": ["West", "West", "East", "East", "East"], "status": ["paid", "free", "paid", "paid", "free"]})',
    preview: 'one row per event; West: paid+free, East: paid+paid+free. Counts: West paid 1, East paid 2.',
  },

  'fx_month_category_dupe': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"month": ["Jan", "Jan", "Feb", "Feb"], "category": ["a", "b", "a", "a"], "revenue": [10, 20, 30, 5]})',
    preview: 'Feb/a appears TWICE (30 and 5) - the duplicate (month, category) pair that forks pivot vs pivot_table.',
  },

  'fx_store_product_dupe': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"store": ["s1", "s1", "s2"], "product": ["x", "x", "y"], "price": [10.0, 20.0, 5.0]})',
    preview: 's1/x appears TWICE (10.0 and 20.0) - duplicate (store, product) pair; mean is 15.0, sum is 30.0.',
  },

};

export const problems = [

  // ───────────────────── M1 · merge · fan-out footgun (multi-method) ─────────────────────
  {
    id: 'pylab-attach-price-no-fanout',
    title: 'Attach each order\'s price',
    topic: 'pandas-merge',
    difficulty: 'core',
    tags: ['merge', 'fan-out', 'footgun', 'cardinality'],
    estimatedMin: 7,
    fixtureId: 'fx_orders_products_dupe',
    prompt: 'You have an orders table (one row per order, with a product_id) and a product reference table that lists a price for each product_id. Attach the matching price to every order. Catch: the reference table has accidental duplicate rows for some products, and your result must end up with exactly as many rows as there were orders - no more.',
    beforeWriting: 'If a product_id shows up twice in the reference table, how many rows does one order pick up? What guarantees one price per order?',
    signature: 'solve(orders, products)',
    starterCode: 'def solve(orders, products):\n    # attach price to each order WITHOUT inflating the row count\n    ...',
    hints: [
      'Each order should come out with one price and the row count should not change - check len(out) against len(orders).',
      'The duplicate is on the reference side. Make the lookup key unique there before you combine the tables.',
    ],
    solution: 'def solve(orders, products):\n    prices = products.drop_duplicates("product_id")\n    return orders.merge(prices, on="product_id", how="left")',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The tell is the row count. A plain orders.merge(products, on="product_id", how="left") runs clean but product_id 10 matches TWO reference rows, so order 1 and order 3 each duplicate - the frame comes back with 4 rows instead of 3, and any downstream sum of amount double-counts those orders. De-duplicating the reference key first (drop_duplicates) guarantees one match per order. The 30-second habit: compare out.shape[0] to orders.shape[0] after every combine.',
    canonicalMethodId: 'dedupe_right',
    methods: [
      { id: 'dedupe_right', name: 'de-dupe the key, then left-join', code: 'prices = products.drop_duplicates("product_id")\nreturn orders.merge(prices, on="product_id", how="left")', tradeoff: 'Explicit about the assumption (one price per product) and keeps the order row count fixed.', breaksWhen: 'If the duplicate rows disagree on price, drop_duplicates keeps the first - you would need a real aggregation to pick.', isTrap: false },
      { id: 'agg_first', name: 'collapse the reference first', code: 'prices = products.groupby("product_id", as_index=False)["price"].first()\nreturn orders.merge(prices, on="product_id", how="left")', tradeoff: 'Same fix via a collapse-to-one-row-per-key; makes the dedupe intent obvious and extends to first/last/mean.', breaksWhen: 'Slightly more work than drop_duplicates for the identical-rows case.', isTrap: false },
      { id: 'naive_merge', name: 'just merge them', code: 'return orders.merge(products, on="product_id", how="left")', tradeoff: 'Reads like the obvious answer and runs without error.', breaksWhen: 'Any duplicate key on the reference side fans out: matching orders are silently duplicated and the row count grows.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'correctness-risk'],
      rules: [
        { when: { 'correctness-risk': 'high' }, rank: ['dedupe_right', 'agg_first'], why: 'enforcing a unique key before the join makes the one-price-per-order assumption explicit and fails loudly if it is violated.' },
        { when: { 'data-size': 'large' }, rank: ['dedupe_right', 'agg_first'], why: 'both pre-shrink the reference side so the join is one-to-one; the naive merge can blow up memory when a hot key fans out.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the plain merge return more rows than there are orders?', options: ['dedupe_right', 'agg_first', 'naive_merge'], answerId: 'naive_merge', explanation: 'The reference key product_id is not unique (10 appears twice), so each matching order pairs with both reference rows - a one-to-many fan-out. The row count grows and any later sum double-counts. De-duplicating the key first keeps it one-to-one.' },
      { id: 'q2', stem: 'On a large feed where one product_id is extremely common, which is the memory risk?', options: ['dedupe_right', 'naive_merge'], answerId: 'naive_merge', explanation: 'A hot duplicated key fans out multiplicatively in the join, so the intermediate result can be far larger than either input. Shrinking the reference to one row per key first bounds the output at one match per order. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── M2 · merge · anti-join (multi-method) ─────────────────────
  {
    id: 'pylab-users-with-no-orders',
    title: 'Customers who never bought',
    topic: 'pandas-merge',
    difficulty: 'core',
    tags: ['merge', 'anti-join', 'indicator'],
    estimatedMin: 6,
    fixtureId: 'fx_users_orders',
    prompt: 'You have a table of every registered customer (each with a user_id) and a separate table of orders (each order also carries a user_id). Return a sorted list of the user_ids belonging to customers who have never placed a single order.',
    signature: 'solve(users, orders)',
    starterCode: 'def solve(users, orders):\n    # sorted list of user_ids present in users but absent from orders\n    ...',
    hints: [
      'You want the customers who are in the first table but have no row at all in the second.',
      'One way tags every customer as matched-or-not and keeps the unmatched ones; another asks directly which user_ids are not in the order table.',
    ],
    solution: 'def solve(users, orders):\n    merged = users.merge(orders, on="user_id", how="left", indicator=True)\n    only_left = merged[merged["_merge"] == "left_only"]\n    return sorted(only_left["user_id"].tolist())',
    compare: { kind: 'value' },
    debrief: 'The trap is an inner combine: users.merge(orders, on="user_id") keeps only the user_ids that DO appear in orders - it runs and returns a clean list, but it is the exact opposite population (the buyers 2 and 4, not the non-buyers 1 and 3). Both honest answers select the absent set: a left combine with indicator filtered to left_only, or ~users["user_id"].isin(orders["user_id"]). The tell is reading the result back: it should contain people with NO orders, and the inner version contains only people WITH orders.',
    canonicalMethodId: 'indicator',
    methods: [
      { id: 'indicator', name: 'left + indicator, keep left_only', code: 'merged = users.merge(orders, on="user_id", how="left", indicator=True)\nonly_left = merged[merged["_merge"] == "left_only"]\nreturn sorted(only_left["user_id"].tolist())', tradeoff: 'Explicit anti-join; the indicator column documents exactly which side each row came from.', breaksWhen: 'Carries the order columns along for the ride - wasteful if orders is very wide.', isTrap: false },
      { id: 'isin_negate', name: 'negated membership test', code: 'has_order = users["user_id"].isin(orders["user_id"])\nreturn sorted(users.loc[~has_order, "user_id"].tolist())', tradeoff: 'Direct and cheap - asks membership without building a merged frame.', breaksWhen: 'Only answers presence/absence; if you also needed matched columns you would still have to join.', isTrap: false },
      { id: 'inner_merge', name: 'inner combine on user_id', code: 'merged = users.merge(orders, on="user_id")\nreturn sorted(merged["user_id"].unique().tolist())', tradeoff: 'Compact and runs without error.', breaksWhen: 'Returns the matched users (the buyers), the exact opposite of the customers you were asked for.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'memory'],
      rules: [
        { when: { 'memory': 'tight' }, rank: ['isin_negate', 'indicator'], why: 'isin tests membership without materialising a merged frame that carries every order column.' },
        { when: { 'data-size': 'large' }, rank: ['isin_negate', 'indicator'], why: 'the membership test avoids building and filtering a full outer-style result; the indicator merge allocates the joined frame first.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does an inner combine return the wrong people?', options: ['indicator', 'isin_negate', 'inner_merge'], answerId: 'inner_merge', explanation: 'An inner combine keeps only user_ids found in BOTH tables - that is the buyers. The question asks for customers absent from orders, which is the complement. You need a left-with-indicator (keep left_only) or a negated membership test.' },
      { id: 'q2', stem: 'orders has 200 columns and you only need the missing ids. Which is leaner?', options: ['indicator', 'isin_negate'], answerId: 'isin_negate', explanation: 'isin tests membership against a single column and never builds the joined frame, so the 200 order columns never get materialised. The indicator merge allocates the full combined frame before you filter it down. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── M3 · merge · left vs inner (multi-method) ─────────────────────
  {
    id: 'pylab-keep-every-left-row',
    title: 'Count rows after attaching optional info',
    topic: 'pandas-merge',
    difficulty: 'warmup',
    tags: ['merge', 'join-type', 'row-count'],
    estimatedMin: 5,
    fixtureId: 'fx_left_right_partial',
    prompt: 'You have a primary table of 3 records (keyed by key) and a secondary table that has extra info for only SOME of those keys. Attach the extra info where it exists, but every primary record must survive even when no extra info is found. Return how many rows the result has.',
    beforeWriting: 'When a primary record has no matching extra info, should it disappear or stay with blanks? That choice sets the row count.',
    signature: 'solve(left, right)',
    starterCode: 'def solve(left, right):\n    # attach optional info, keep ALL primary rows, return the row count\n    ...',
    hints: [
      'The result row count should equal the number of primary records, not the number of matches.',
      'Choosing which table is the one whose rows are all preserved is the whole decision here.',
    ],
    solution: 'def solve(left, right):\n    return left.merge(right, on="key", how="left").shape[0]',
    compare: { kind: 'value' },
    debrief: 'The trap is how="inner": left.merge(right, on="key", how="inner") keeps only keys present on BOTH sides, so the unmatched primary record (key 3) is silently dropped and the count comes back 2 instead of 3 - it runs, no error, just a quietly shrunken result. This is the most common cause of "my totals got smaller after I joined a lookup table". how="left" keeps every primary row and fills blanks where the secondary side has no match.',
    canonicalMethodId: 'left_join',
    methods: [
      { id: 'left_join', name: 'keep all primary rows', code: 'return left.merge(right, on="key", how="left").shape[0]', tradeoff: 'Preserves every primary record; unmatched ones get NaN in the attached columns.', breaksWhen: 'Nothing for this task - it is the reference. (Watch for fan-out if the right key is non-unique.)', isTrap: false },
      { id: 'inner_join', name: 'keep only matched rows', code: 'return left.merge(right, on="key", how="inner").shape[0]', tradeoff: 'Compact and runs clean.', breaksWhen: 'Drops every primary record with no match - the row count shrinks and rows vanish silently.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does an inner combine return 2 instead of 3?', options: ['left_join', 'inner_join'], answerId: 'inner_join', explanation: 'An inner combine keeps only keys present on both sides. Key 3 has no match on the secondary side, so that primary record is dropped and the count falls from 3 to 2. A left combine preserves all primary rows and fills NaN where there is no match.' },
    ],
  },

  // ───────────────────── M4 · merge · audit unmatched (multi-method) ─────────────────────
  {
    id: 'pylab-audit-unmatched-keys',
    title: 'Audit which keys matched',
    topic: 'pandas-merge',
    difficulty: 'core',
    tags: ['merge', 'indicator', 'audit'],
    estimatedMin: 6,
    fixtureId: 'fx_key_overlap',
    prompt: 'You have two tables that each carry a key column, with only partial overlap. Before you trust combining them, audit the overlap: return a dict with three counts - how many keys are only in the first table, how many are only in the second, and how many are in both.',
    beforeWriting: 'To count keys that are ONLY on the second side, your combine has to keep rows from BOTH sides. Which combine keeps everything?',
    signature: 'solve(left, right)',
    starterCode: 'def solve(left, right):\n    # dict: counts of keys only-in-first, only-in-second, in-both\n    ...',
    hints: [
      'A combine that keeps unmatched rows from both sides lets you label where each row came from.',
      'pandas can tag each combined row with its origin; then you just count the three labels.',
    ],
    solution: 'def solve(left, right):\n    merged = left.merge(right, on="key", how="outer", indicator=True)\n    counts = merged["_merge"].value_counts()\n    return {\n        "left_only": int(counts.get("left_only", 0)),\n        "right_only": int(counts.get("right_only", 0)),\n        "both": int(counts.get("both", 0)),\n    }',
    compare: { kind: 'value' },
    debrief: 'The trap is how="left" instead of how="outer". A left combine keeps unmatched rows from the FIRST table but throws away keys that exist only in the second, so right_only comes back 0 every time - it runs, returns a perfectly shaped dict, and silently under-reports the keys you are missing on the right (here it reports right_only=0 when the truth is 1). Only an outer combine keeps both sides\' unmatched rows, which is exactly what an overlap audit needs.',
    canonicalMethodId: 'outer_indicator',
    methods: [
      { id: 'outer_indicator', name: 'outer + indicator, count labels', code: 'merged = left.merge(right, on="key", how="outer", indicator=True)\ncounts = merged["_merge"].value_counts()\nreturn {\n    "left_only": int(counts.get("left_only", 0)),\n    "right_only": int(counts.get("right_only", 0)),\n    "both": int(counts.get("both", 0)),\n}', tradeoff: 'Keeps every key from both sides and labels its origin - the honest full audit.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'set_ops', name: 'compare the key sets directly', code: 'ls = set(left["key"])\nrs = set(right["key"])\nreturn {\n    "left_only": len(ls - rs),\n    "right_only": len(rs - ls),\n    "both": len(ls & rs),\n}', tradeoff: 'No merge at all - set difference and intersection say exactly the same thing on unique keys.', breaksWhen: 'Counts DISTINCT keys, not rows; if a key repeats within a table the row-level audit and this disagree.', isTrap: false },
      { id: 'left_indicator', name: 'left + indicator', code: 'merged = left.merge(right, on="key", how="left", indicator=True)\ncounts = merged["_merge"].value_counts()\nreturn {\n    "left_only": int(counts.get("left_only", 0)),\n    "right_only": int(counts.get("right_only", 0)),\n    "both": int(counts.get("both", 0)),\n}', tradeoff: 'Looks almost identical to the answer and runs cleanly.', breaksWhen: 'A left combine never keeps right-only rows, so right_only is always 0 - it silently hides the keys missing from the first table.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the left-combine version always report right_only = 0?', options: ['outer_indicator', 'set_ops', 'left_indicator'], answerId: 'left_indicator', explanation: 'A left combine keeps unmatched rows only from the first table; rows whose key exists solely on the right are never emitted, so the right_only label can never appear. An outer combine keeps both sides\' unmatched rows, which the audit requires.' },
    ],
  },

  // ───────────────────── M5 · merge · stack vertically (multi-method) ─────────────────────
  {
    id: 'pylab-stack-two-months',
    title: 'Combine two months of orders',
    topic: 'pandas-merge',
    difficulty: 'warmup',
    tags: ['concat', 'append', 'axis'],
    estimatedMin: 4,
    fixtureId: 'fx_two_months',
    prompt: 'You have two same-shaped tables of orders - one for January, one for February - each with the same columns (order_id, amount). Combine them into a single table containing all of January\'s rows followed by all of February\'s, numbered cleanly from 0.',
    signature: 'solve(jan, feb)',
    starterCode: 'def solve(jan, feb):\n    # one table: January rows then February rows, fresh 0..n-1 numbering\n    ...',
    hints: [
      'You are laying the second table directly underneath the first - same columns, just more rows.',
      'Ask for a fresh row numbering so the two frames\' original positions do not collide.',
    ],
    solution: 'def solve(jan, feb):\n    return pd.concat([jan, feb], ignore_index=True)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The trap is laying the frames side by side instead of end to end: pd.concat([jan, feb], axis=1) runs without error but glues February\'s columns to the RIGHT of January\'s, giving a 2-row, 4-column frame (duplicate order_id and amount columns) instead of the 4-row, 2-column stack you wanted. The tell is the shape - you expected twice the rows, you got twice the columns. The default axis=0 stacks vertically; ignore_index=True renumbers 0..n-1 so the two original indexes do not collide.',
    canonicalMethodId: 'concat_rows',
    methods: [
      { id: 'concat_rows', name: 'stack end to end', code: 'return pd.concat([jan, feb], ignore_index=True)', tradeoff: 'The direct vertical stack with a clean fresh index.', breaksWhen: 'Nothing for this task - matching columns stack cleanly.', isTrap: false },
      { id: 'concat_cols', name: 'glue side by side', code: 'return pd.concat([jan, feb], axis=1)', tradeoff: 'Same function, one wrong argument - and it runs.', breaksWhen: 'axis=1 joins on the index horizontally: you get duplicated columns and half the rows you expected, not a stack.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does axis=1 give the wrong shape?', options: ['concat_rows', 'concat_cols'], answerId: 'concat_cols', explanation: 'axis=1 concatenates along columns, aligning the two frames on their shared index and placing February beside January - duplicate columns, row count unchanged. Stacking rows is axis=0 (the default), which is what "all of one then all of the other" means.' },
    ],
  },

  // ───────────────────── R1 · reshape · monthly pivot (sum vs mean fork) ─────────────────────
  {
    id: 'pylab-monthly-category-table',
    title: 'Monthly totals by category',
    topic: 'pandas-reshape',
    difficulty: 'core',
    tags: ['pivot', 'reshape', 'aggregate', 'dupes'],
    estimatedMin: 7,
    fixtureId: 'fx_month_category_dupe',
    prompt: 'You have a long log where each row is one month, one category, and a revenue figure - and the same month-and-category pair can appear on more than one row. Reshape it into a grid: months down the side, categories across the top, and each cell holding the TOTAL revenue for that month-and-category. Where a month had no rows for a category, the cell should be 0.',
    beforeWriting: 'When a month-and-category pair shows up on two rows, what should the cell hold - their sum, or just one of them? The grid has only one cell for that pair.',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # grid: month down, category across, cell = TOTAL revenue, gaps = 0\n    ...',
    hints: [
      'Because a month-category pair can repeat, the cell has to combine the duplicates rather than expect exactly one value.',
      'You need to say HOW duplicates collapse into one cell (here: add them) and what fills empty cells (here: 0).',
    ],
    solution: 'def solve(df):\n    return df.pivot_table(index="month", columns="category", values="revenue", aggfunc="sum", fill_value=0)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: false },
    debrief: 'The tell is the Feb/a cell. The duplicate (Feb, a) rows are 30 and 5. The trap leaves aggfunc at its default "mean", so that cell comes back 17.5 (the average) instead of 35 (the total) - it runs, produces a clean grid, and quietly answers a different question. Always name the aggregation when the key can repeat. (The other footgun, df.pivot, would raise outright on the duplicate pair rather than guess - so it never makes it past the first run.)',
    canonicalMethodId: 'pivot_sum',
    methods: [
      { id: 'pivot_sum', name: 'aggregate duplicates by summing', code: 'return df.pivot_table(index="month", columns="category", values="revenue", aggfunc="sum", fill_value=0)', tradeoff: 'States the aggregation explicitly - duplicates add up, gaps become 0.', breaksWhen: 'Nothing for this task; it is the reference for a TOTAL.', isTrap: false },
      { id: 'pivot_mean', name: 'leave the aggregation defaulted', code: 'return df.pivot_table(index="month", columns="category", values="revenue", fill_value=0)', tradeoff: 'Shorter - one fewer argument - and runs without complaint.', breaksWhen: 'pivot_table defaults to mean, so repeated pairs are averaged not totalled; the cell is wrong whenever a pair repeats.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does omitting aggfunc give 17.5 in the Feb/a cell?', options: ['pivot_sum', 'pivot_mean'], answerId: 'pivot_mean', explanation: 'pivot_table defaults aggfunc to "mean". The two Feb/a rows (30 and 5) average to 17.5 instead of summing to 35. When the index/column pair can repeat, you must name the aggregation that matches the question - here, a total means sum.' },
    ],
  },

  // ───────────────────── R2 · reshape · wide to long (honest single-method) ─────────────────────
  {
    id: 'pylab-quarters-to-rows',
    title: 'One row per region-quarter',
    topic: 'pandas-reshape',
    difficulty: 'core',
    tags: ['melt', 'reshape', 'tidy'],
    estimatedMin: 6,
    fixtureId: 'fx_wide_quarters',
    prompt: 'You have a table with one row per region and a separate column for each quarter\'s sales (q1, q2). Reshape it so there is one row per region-and-quarter combination: keep the region, add a column naming the quarter, and a column holding that quarter\'s sales figure. Name the two new columns "quarter" and "sales".',
    beforeWriting: 'Each region currently spans one row and several quarter columns. After reshaping, how many rows should one region occupy?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # turn the per-quarter columns into rows: region, quarter, sales\n    ...',
    hints: [
      'The quarter columns should become VALUES in a "quarter" column, with their numbers in a "sales" column.',
      'Hold the region fixed as the identifier while the quarter columns unpivot into rows.',
    ],
    solution: 'def solve(df):\n    return df.melt(id_vars="region", value_vars=["q1", "q2"], var_name="quarter", value_name="sales")',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The honest divergence here is forgetting to hold region fixed: df.melt(value_vars=["q1","q2"], var_name="quarter", value_name="sales") - with no id_vars - runs and unpivots the quarter columns, but region is dropped entirely, so you lose which region each figure belongs to. The fix is id_vars="region", which repeats the region label down every unpivoted row. There is one honest reshape here (unpivot the quarter columns, keep region as the id), so no method dial - this is a fluency rep, not a judgment fork.',
    canonicalMethodId: 'melt',
    methods: [
      { id: 'melt', name: 'unpivot the quarter columns', code: 'return df.melt(id_vars="region", value_vars=["q1", "q2"], var_name="quarter", value_name="sales")', tradeoff: 'The direct wide-to-long reshape, keeping region as the identifier.', breaksWhen: 'Nothing here - it is the canonical tidy reshape.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── R3 · reshape · count table (count vs distinct trap) ─────────────────────
  {
    id: 'pylab-region-status-counts',
    title: 'How many of each combination',
    topic: 'pandas-reshape',
    difficulty: 'core',
    tags: ['crosstab', 'reshape', 'frequency'],
    estimatedMin: 6,
    fixtureId: 'fx_region_status',
    prompt: 'You have a log where each row records one event\'s region and its status. Build a grid that shows, for every region-and-status combination, HOW MANY rows fall into it: regions down the side, status values across the top, each cell a count.',
    beforeWriting: 'Each row is one event. Should two identical (region, status) rows count as one or two in their cell?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # grid: region down, status across, cell = number of rows\n    ...',
    hints: [
      'Every row contributes one to the count for its (region, status) cell - repeats add up.',
      'pandas has a one-call frequency grid for two categorical columns; or group by both and count, then spread one out into columns.',
    ],
    solution: 'def solve(df):\n    return pd.crosstab(df["region"], df["status"])',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: false },
    debrief: 'The tell is the East/paid cell. East has two paid events, so its count is 2. The trap de-duplicates first - pd.crosstab on df.drop_duplicates(["region","status"]) collapses the two identical East/paid rows into one, so the cell reads 1 instead of 2 - it runs and looks like a valid count table, but it is counting DISTINCT combinations, not events. A frequency table counts rows; only drop duplicates if the question literally asks how many distinct pairs exist.',
    canonicalMethodId: 'crosstab',
    methods: [
      { id: 'crosstab', name: 'one-call frequency grid', code: 'return pd.crosstab(df["region"], df["status"])', tradeoff: 'Counts co-occurrences of the two columns directly into a grid.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'groupby_unstack', name: 'group by both, then spread out', code: 'return df.groupby(["region", "status"]).size().unstack(fill_value=0)', tradeoff: 'Same counts the long way - group on both keys, size, then move status into columns; more explicit about the count step.', breaksWhen: 'Nothing for this task - it produces the identical grid.', isTrap: false },
      { id: 'distinct_first', name: 'de-duplicate, then count', code: 'return pd.crosstab(df.drop_duplicates(["region", "status"])["region"], df.drop_duplicates(["region", "status"])["status"])', tradeoff: 'Compact and runs - looks like a reasonable cleanup step.', breaksWhen: 'Dropping duplicate (region, status) rows first counts DISTINCT pairs, not events: any repeated combination is under-counted (East/paid reads 1, not 2).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does de-duplicating first under-count East/paid?', options: ['crosstab', 'groupby_unstack', 'distinct_first'], answerId: 'distinct_first', explanation: 'A frequency table counts rows. Dropping duplicate (region, status) pairs collapses the two East/paid events into one, so the cell reads 1 instead of 2 - it now counts how many distinct combinations exist, not how many events occurred.' },
    ],
  },

  // ───────────────────── R4 · reshape · unstack with fill (multi-method) ─────────────────────
  {
    id: 'pylab-spread-category-columns',
    title: 'Spread categories across columns',
    topic: 'pandas-reshape',
    difficulty: 'core',
    tags: ['unstack', 'pivot', 'reshape', 'fillna'],
    estimatedMin: 7,
    fixtureId: 'fx_month_category_dupe',
    prompt: 'You have a long log of month, category, and revenue rows. Reshape it into a grid with months down the side and a column for each category, each cell holding that month-and-category revenue total. Where a month had no revenue in a category, the cell must read 0 - not blank.',
    beforeWriting: 'A month-category pair appears more than once in this log. The grid has one cell per pair - what has to happen to the duplicates first?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # grid: month down, a column per category, cell = total revenue, gaps = 0\n    ...',
    hints: [
      'Two things to handle: combine the repeated month-category rows into one total, and turn empty cells into 0 instead of blank.',
      'You can collapse to one total per month-category pair first, then move category up into columns - or do both in one reshaping call.',
    ],
    solution: 'def solve(df):\n    totals = df.groupby(["month", "category"])["revenue"].sum()\n    return totals.unstack(fill_value=0)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: false },
    debrief: 'The tell is a blank where a 0 belongs. The trap drops fill_value: totals.unstack() leaves the absent Feb/b combination as NaN instead of 0, so the grid carries a missing value that quietly breaks the next sum or comparison - it runs and looks right until something downstream chokes on the NaN. unstack(fill_value=0) (or pivot_table(..., fill_value=0)) writes the 0 explicitly. Both honest methods agree; the dupe in the log (Feb/a twice) is why you must total before spreading.',
    canonicalMethodId: 'unstack',
    methods: [
      { id: 'unstack', name: 'total per pair, then spread up', code: 'totals = df.groupby(["month", "category"])["revenue"].sum()\nreturn totals.unstack(fill_value=0)', tradeoff: 'Explicit two-step: collapse duplicates to a total, then move category into columns with 0 for gaps.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'pivot_table', name: 'one reshaping call', code: 'return df.pivot_table(index="month", columns="category", values="revenue", aggfunc="sum", fill_value=0)', tradeoff: 'Does the total-and-spread in one call; reads more directly as "make me this grid".', breaksWhen: 'Nothing for this task - identical grid to the groupby+unstack.', isTrap: false },
      { id: 'unstack_no_fill', name: 'spread without filling gaps', code: 'totals = df.groupby(["month", "category"])["revenue"].sum()\nreturn totals.unstack()', tradeoff: 'One argument shorter and runs fine.', breaksWhen: 'Absent month-category cells come back as NaN, not 0 - the missing value silently propagates into later arithmetic.', isTrap: true },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        { when: { 'readability': 'team' }, rank: ['pivot_table', 'unstack'], why: 'pivot_table reads as a single declarative "build this grid", where groupby+unstack spells out the mechanics in two steps.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does dropping fill_value leave a problem behind?', options: ['unstack', 'pivot_table', 'unstack_no_fill'], answerId: 'unstack_no_fill', explanation: 'unstack() inserts NaN where a month-category combination is absent. The grid looks fine, but the NaN propagates: a later sum or comparison on that column silently returns NaN or skips the cell. fill_value=0 writes the intended 0 so downstream arithmetic is clean.' },
      { id: 'q2', stem: 'Why must you total before spreading the categories out?', options: ['unstack', 'pivot_table', 'unstack_no_fill'], answerId: 'pivot_table', explanation: 'The log has the (Feb, a) pair twice. The grid has one cell per pair, so the duplicates must be aggregated first - pivot_table does it with aggfunc="sum", and the groupby+unstack does it with the explicit .sum(). Without aggregating, the reshape has two values destined for one cell.' },
    ],
  },

  // ───────────────────── R5 · reshape · average pivot over dupes (sum vs mean fork) ─────────────────────
  {
    id: 'pylab-average-price-grid',
    title: 'Average price by store and product',
    topic: 'pandas-reshape',
    difficulty: 'core',
    tags: ['pivot', 'reshape', 'aggregate', 'dupes'],
    estimatedMin: 7,
    fixtureId: 'fx_store_product_dupe',
    prompt: 'You have a log of store, product, and the price charged - and the same store sometimes lists the same product more than once at different prices. Build a grid with stores down the side and products across the top, each cell holding the AVERAGE price that store charged for that product. Where a store never sold a product, the cell should be 0.',
    beforeWriting: 'When a store lists the same product at two different prices, the grid has one cell for it - what number belongs there, given the question asks for an average?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    # grid: store down, product across, cell = AVERAGE price, gaps = 0\n    ...',
    hints: [
      'A store-product pair can repeat at different prices, so the cell has to combine those prices - here by averaging.',
      'Name the aggregation that matches "average", and set what fills the empty store-product cells.',
    ],
    solution: 'def solve(df):\n    return df.pivot_table(index="store", columns="product", values="price", aggfunc="mean", fill_value=0)',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: false },
    debrief: 'The tell is the s1/x cell. That store lists product x at 10.0 and 20.0, so the average is 15.0. The trap uses aggfunc="sum", giving 30.0 - it runs, produces a clean grid, and answers "total price charged" instead of "average price", which is a different and usually meaningless number for a price. When a cell can hold duplicates, the aggregation IS the question: a price wants mean, a revenue wants sum. (Plain df.pivot would raise on the duplicate pair rather than run at all.)',
    canonicalMethodId: 'pivot_mean',
    methods: [
      { id: 'pivot_mean', name: 'average the duplicate prices', code: 'return df.pivot_table(index="store", columns="product", values="price", aggfunc="mean", fill_value=0)', tradeoff: 'Names the aggregation that matches the question - duplicate prices average, gaps become 0.', breaksWhen: 'Nothing for this task; it is the reference for an AVERAGE.', isTrap: false },
      { id: 'pivot_sum', name: 'total the duplicate prices', code: 'return df.pivot_table(index="store", columns="product", values="price", aggfunc="sum", fill_value=0)', tradeoff: 'One word different from the answer and runs identically.', breaksWhen: 'Summing prices answers a different question: s1/x reads 30.0 (10+20) instead of the 15.0 average, and totalling a price is rarely meaningful.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does aggfunc="sum" give 30.0 in the s1/x cell?', options: ['pivot_mean', 'pivot_sum'], answerId: 'pivot_sum', explanation: 'The two s1/x rows are 10.0 and 20.0. Summing them gives 30.0; averaging gives 15.0. The question asks for the average price, so aggfunc must be "mean". When the cell aggregates duplicates, the chosen aggregation is the answer - sum and mean are different questions.' },
    ],
  },

];

export default problems;

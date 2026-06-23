// Bank D (first slice) — pandas / numpy, the analyst-native operations.
// Test-based: implement the function so __pl_checks pass. Runs on Pyodide with the
// pandas + numpy wheels loaded on demand. Every solution + test VERIFIED in
// pandas 2.3 (CPython). Stored Python uses "double quotes" (house syntax: the
// single-quoted JS strings stay escape-free).

export const PD_PATTERNS = {
  'groupby':   { label: 'GroupBy / Aggregate', accent: 'var(--accent)' },
  'merge':     { label: 'Merge / Join',        accent: 'var(--teal)' },
  'reshape':   { label: 'Reshape / Pivot',     accent: 'var(--yellow)' },
  'vectorize': { label: 'Vectorization',       accent: 'var(--green)' },
};
export const PD_PATTERN_ORDER = ['groupby', 'merge', 'reshape', 'vectorize'];

export const pandasProblems = [
  {
    id: 'pd-groupby-revenue',
    bank: 'pandas',
    pattern: 'groupby',
    title: 'Revenue by category',
    difficulty: 'warmup',
    prompt: 'df has columns category and revenue. Return a DataFrame with one row per category and its total revenue, sorted highest first, columns ["category", "revenue"], index reset. This is split-apply-combine.',
    starterCode: 'def revenue_by_category(df):\n    # total revenue per category, sorted desc, columns ["category","revenue"]\n    pass',
    testSource: 'import pandas as pd\ndef _df():\n    return pd.DataFrame({"category":["a","b","a","b","a"], "revenue":[10,5,20,5,30]})\ndef _out():\n    return revenue_by_category(_df())\n__pl_checks = [\n  ("top category", lambda: _out().iloc[0]["category"] == "a"),\n  ("top total", lambda: _out().iloc[0]["revenue"] == 60),\n  ("second total", lambda: _out().iloc[1]["revenue"] == 10),\n  ("two groups", lambda: len(_out()) == 2),\n]',
    solution: 'def revenue_by_category(df):\n    return (df.groupby("category", as_index=False)["revenue"]\n              .sum()\n              .sort_values("revenue", ascending=False)\n              .reset_index(drop=True))',
    glassBox: { lesson: 'groupby splits the rows by category, applies sum to each group, and combines back. as_index=False keeps category as a column (not the index), so the result is a tidy two-column DataFrame ready to sort.' },
  },
  {
    id: 'pd-filter-before-aggregate',
    bank: 'pandas',
    pattern: 'groupby',
    title: 'New-user AOV (filter, then aggregate)',
    difficulty: 'core',
    prompt: 'df has is_new (bool) and order_value. Return the average order value for new users only, as a float. The trap: filter to the population FIRST, then aggregate — never aggregate over everyone and hope.',
    starterCode: 'def new_user_aov(df):\n    # mean order_value for rows where is_new is True\n    pass',
    testSource: 'import pandas as pd\ndef _df():\n    return pd.DataFrame({"is_new":[True,True,False,False], "order_value":[100,200,999,999]})\n__pl_checks = [\n  ("filters first", lambda: new_user_aov(_df()) == 150.0),\n  ("ignores old users", lambda: new_user_aov(_df()) != 574.5),\n]',
    solution: 'def new_user_aov(df):\n    new = df[df["is_new"]]\n    return float(new["order_value"].mean())',
    glassBox: { lesson: 'Boolean indexing (df[df["is_new"]]) selects the population first; the mean then runs over only those rows. Aggregating before filtering — or averaging a per-user lifetime value and then filtering — contaminates the number with rows you do not want.' },
  },
  {
    id: 'pd-merge-no-fanout',
    bank: 'pandas',
    pattern: 'merge',
    title: 'Attach price without fanning out orders',
    difficulty: 'core',
    prompt: 'Left-join orders to products on product_id to attach price. Catch: the products feed has DUPLICATE rows per product_id, so a naive merge would multiply your order rows. Return a frame with exactly len(orders) rows.',
    starterCode: 'def orders_with_price(orders, products):\n    # left-join price onto orders WITHOUT inflating the row count\n    pass',
    testSource: 'import pandas as pd\ndef _orders():\n    return pd.DataFrame({"order_id":[1,2,3], "product_id":[10,20,10]})\ndef _products():\n    return pd.DataFrame({"product_id":[10,20,10], "price":[5.0,7.0,5.0]})\ndef _m():\n    return orders_with_price(_orders(), _products())\n__pl_checks = [\n  ("no row fan-out", lambda: _m().shape[0] == 3),\n  ("price attached", lambda: list(_m()["price"]) == [5.0, 7.0, 5.0]),\n]',
    solution: 'def orders_with_price(orders, products):\n    prices = products.drop_duplicates("product_id")\n    return orders.merge(prices, on="product_id", how="left")',
    glassBox: { lesson: 'A merge key that is non-unique on the right side fans out: each left row pairs with every matching right row. drop_duplicates on the join key first guarantees one match per order. The 30-second habit: compare merged.shape[0] to orders.shape[0] after every join.' },
  },
  {
    id: 'pd-pivot',
    bank: 'pandas',
    pattern: 'reshape',
    title: 'Month x category revenue pivot',
    difficulty: 'core',
    prompt: 'df has month, category, revenue (with duplicate month+category rows). Return a pivot table: month as the index, category as columns, summed revenue in the cells, missing combinations filled with 0. Use pivot_table (it handles duplicates; bare pivot does not).',
    starterCode: 'def monthly_pivot(df):\n    # index=month, columns=category, values=summed revenue, missing -> 0\n    pass',
    testSource: 'import pandas as pd\ndef _df():\n    return pd.DataFrame({"month":["Jan","Jan","Feb","Feb"], "category":["a","b","a","a"], "revenue":[10,20,30,5]})\ndef _p():\n    return monthly_pivot(_df())\n__pl_checks = [\n  ("jan a", lambda: _p().loc["Jan","a"] == 10),\n  ("feb a sums dupes", lambda: _p().loc["Feb","a"] == 35),\n  ("missing filled 0", lambda: _p().loc["Feb","b"] == 0),\n]',
    solution: 'def monthly_pivot(df):\n    return df.pivot_table(index="month", columns="category",\n                          values="revenue", aggfunc="sum", fill_value=0)',
    glassBox: { lesson: 'pivot_table aggregates duplicates via aggfunc (here sum) — that is why Feb/a (30 + 5) becomes 35. Plain df.pivot raises on duplicate index/column pairs. fill_value=0 turns absent combinations into 0 instead of NaN.' },
  },
  {
    id: 'pd-vectorize',
    bank: 'pandas',
    pattern: 'vectorize',
    title: 'Tier orders without apply',
    difficulty: 'warmup',
    prompt: 'df has order_value. Add a column tier set to "high" when order_value >= 100 else "low", and return the frame. Do it vectorized with np.where — not a row-wise apply or a Python loop. Do not mutate the caller\'s frame.',
    starterCode: 'import numpy as np\n\ndef add_tier(df):\n    # add a vectorized "tier" column: high if order_value >= 100 else low\n    pass',
    testSource: 'import pandas as pd\ndef _df():\n    return pd.DataFrame({"order_value":[50,100,150,99]})\ndef _o():\n    return add_tier(_df())\n__pl_checks = [\n  ("tiers", lambda: list(_o()["tier"]) == ["low","high","high","low"]),\n  ("does not mutate input", lambda: "tier" not in _df().columns),\n]',
    solution: 'import numpy as np\n\ndef add_tier(df):\n    df = df.copy()\n    df["tier"] = np.where(df["order_value"] >= 100, "high", "low")\n    return df',
    glassBox: { lesson: 'np.where runs the comparison across the whole column in compiled C — one vectorized operation. df.apply(..., axis=1) calls a Python function per row, 10–100x slower at scale. The glass-box timer makes that gap visible on a big frame. df.copy() keeps the mutation local.' },
  },
];

export default pandasProblems;

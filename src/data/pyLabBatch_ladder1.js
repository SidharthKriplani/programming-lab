// pyLabBatch_ladder1 — the difficulty-ladder top-up (D-PL-29 / Track 2): Python data-structure
// manipulation + senior/advanced data manipulation, incl. the first stretch (systems-tier)
// problems. Buckets 1 + 2 of docs/PYLAB-TRACK2-BACKLOG.md. Every solution + honest method +
// trap executed in CPython (pandas 2.3 / numpy 2.2) and proven (honest == canonical, trap RUNS
// AND DIVERGES) before shipping. Rubric: docs/PYLAB-CONTENT-RUBRIC.md.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside;
// \n for newlines; escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_ds_items': {
    args: ['items'],
    setup: 'items = ["b", "a", "b", "c", "a"]',
    preview: 'items: ["b","a","b","c","a"] - first-seen order is b, a, c.',
  },
  'fx_ds_multimap': {
    args: ['d'],
    setup: 'd = {"a": 1, "b": 2, "c": 1}',
    preview: 'd: keys a,b,c -> values 1,2,1 (value 1 is shared by a and c).',
  },
  'fx_ds_consecutive': {
    args: ['seq'],
    setup: 'seq = [1, 1, 2, 2, 1, 3, 3]',
    preview: 'seq: [1,1,2,2,1,3,3] - note the 1s come in two separate runs.',
  },
  'fx_ds_words': {
    args: ['words'],
    setup: 'words = ["z", "z", "z", "a", "a", "m"]',
    preview: 'words: z x3, a x2, m x1 - frequency order (z,a) differs from alphabetical (a,m,z).',
  },
  'fx_dm_sales_prices': {
    args: ['sales', 'prices'],
    setup: 'import pandas as pd\nsales = pd.DataFrame({"sku": ["a", "b"], "qty": [2, 3]})\nprices = pd.DataFrame({"sku": ["a", "a", "b"], "price": [10, 10, 5]})',
    preview: 'sales: sku, qty. prices: sku, price - but sku "a" has a DUPLICATE row (bad data).',
  },
  'fx_dm_gv': {
    args: ['df'],
    setup: 'import pandas as pd\ndf = pd.DataFrame({"g": ["a", "a", "b"], "v": [1, 2, 3]})',
    preview: 'df: g, v. Two rows in group a, one in group b.',
  },
  'fx_dm_orders_net': {
    args: ['orders'],
    setup: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 1, 2, 3], "ts": [1, 2, 1, 1], "amount": [100, 120, 50, 80], "returned": [False, False, True, False]})',
    preview: 'orders: order 1 updated (100@1 -> 120@2), order 2 returned, order 3 kept. Net = 120 + 80.',
  },
  'fx_ml_binary': {
    args: ['y_true', 'y_pred'],
    setup: 'import numpy as np\ny_true = np.array([1, 1, 1, 1, 0, 0])\ny_pred = np.array([1, 0, 0, 0, 0, 0])',
    preview: 'y_true / y_pred: 4 real positives, the model predicts only 1 positive (1 TP, 3 FN, 0 FP).',
  },
  'fx_ml_x': {
    args: ['x'],
    setup: 'import numpy as np\nx = np.array([10.0, 20.0, 30.0, 40.0])',
    preview: 'x: [10,20,30,40], mean 25, population std ~11.18.',
  },
};

export const problems = [

  // ───────────────── ds-dedup-order · unique, first-seen order ─────────────────
  {
    id: 'ds-dedup-order',
    title: 'Unique items, in first-seen order',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['list', 'dict', 'order-preserving'],
    estimatedMin: 5,
    fixtureId: 'fx_ds_items',
    prompt: 'Return the unique items, keeping them in the order they first appear.',
    beforeWriting: 'A set dedups but throws away order. What preserves both uniqueness AND first-seen order?',
    signature: 'solve(items)',
    starterCode: 'def solve(items):\n    # unique, in the order they first appear\n    ...',
    hints: [
      'A plain set() loses the ordering you were asked to keep.',
      'dict keys are unique and, since Python 3.7, keep insertion order - dict.fromkeys is the one-liner.',
    ],
    solution: 'def solve(items):\n    return list(dict.fromkeys(items))',
    compare: { kind: 'seq' },
    debrief: 'First-seen order is b, a, c - the second b and second a are dropped where they repeat.\n\n**Wrong answer that runs:** sorted(set(items)) dedups but returns ["a","b","c"] - alphabetical order, not first-seen. It runs and returns a unique list; it just reordered the data. (Plain list(set(items)) is worse: its order is arbitrary.)\n\n**Sanity check:** the first element of your result should equal the first element of the input (b here). If it changed, you sorted or set-ified away the ordering.',
    canonicalMethodId: 'fromkeys',
    methods: [
      { id: 'fromkeys', name: 'dict.fromkeys', code: 'return list(dict.fromkeys(items))', detectionSignature: { mustMatch: ['fromkeys'], mustNotMatch: [], note: 'dict keys dedup and keep insertion order' }, tradeoff: 'dict keys are unique and ordered since 3.7 - dedup and order in one call.', breaksWhen: 'Items must be hashable (same as a set); otherwise fine.', isTrap: false },
      { id: 'seen_loop', name: 'explicit seen-set loop', code: 'seen = set()\nout = []\nfor x in items:\n    if x not in seen:\n        seen.add(x)\n        out.append(x)\nreturn out', detectionSignature: { mustMatch: ['seen'], mustNotMatch: [], note: 'track seen, append first time only' }, tradeoff: 'The explicit version - a seen-set plus an output list. Verbose but obvious, and works on any iterable.', breaksWhen: 'Nothing for this task; more code than fromkeys.', isTrap: false },
      { id: 'set_sorted', name: 'sorted(set(...))', code: 'return sorted(set(items))', detectionSignature: { mustMatch: ['sorted(set'], mustNotMatch: [], note: 'dedups but imposes sort order' }, tradeoff: 'Compact and dedups.', breaksWhen: 'Whenever order matters - it returns sorted order, not first-seen, silently reordering the output.', isTrap: true },
    ],
    dial: {
      axes: ['readability'],
      rules: [
        { when: { 'readability': 'team' }, rank: ['fromkeys', 'seen_loop'], why: 'fromkeys is idiomatic once known; the seen-set loop is more explicit for readers who have not seen the trick.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why is sorted(set(items)) wrong here?', options: ['fromkeys', 'seen_loop', 'set_sorted'], answerId: 'set_sorted', explanation: 'It dedups but returns the items in sorted order, not the first-seen order the prompt requires. dict.fromkeys keeps insertion order while removing repeats.' },
    ],
  },

  // ───────────────── ds-invert-multimap · a value maps to many keys ─────────────────
  {
    id: 'ds-invert-multimap',
    title: 'Invert a dict when values repeat',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['dict', 'defaultdict', 'grouping'],
    estimatedMin: 6,
    fixtureId: 'fx_ds_multimap',
    prompt: 'Invert the dict: return a new dict mapping each value to the list of keys that had that value, keeping keys in their original order.',
    beforeWriting: 'Two keys share the value 1. If you just swap key and value, what happens to the second one?',
    signature: 'solve(d)',
    starterCode: 'def solve(d):\n    # value -> [keys that had it]\n    ...',
    hints: [
      'A value can come from several keys, so each value maps to a LIST, not a single key.',
      'Accumulate keys into a list per value - defaultdict(list) makes the first insert free.',
    ],
    solution: 'def solve(d):\n    from collections import defaultdict\n    out = defaultdict(list)\n    for k, v in d.items():\n        out[v].append(k)\n    return dict(out)',
    compare: { kind: 'value' },
    debrief: 'Value 1 comes from both a and c, so it maps to ["a","c"]; value 2 maps to ["b"].\n\n**Wrong answer that runs:** {v: k for k, v in d.items()} swaps each pair, so when value 1 shows up again the second key overwrites the first - you get {1: "c", 2: "b"} and "a" vanishes. It runs and returns an inverted dict; it just silently dropped a key on the collision.\n\n**Sanity check:** count the keys across all the lists in your result - it must equal the number of keys in the input (3 here). If a key went missing, two inputs collided on the same value.',
    canonicalMethodId: 'accumulate',
    methods: [
      { id: 'accumulate', name: 'defaultdict(list) accumulate', code: 'from collections import defaultdict\nout = defaultdict(list)\nfor k, v in d.items():\n    out[v].append(k)\nreturn dict(out)', detectionSignature: { mustMatch: ['defaultdict'], mustNotMatch: [], note: 'append keys into a list per value' }, tradeoff: 'Accumulate keys into a list per value - handles repeated values by design.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'comp_overwrite', name: 'dict comprehension swap', code: 'return {v: k for k, v in d.items()}', detectionSignature: { mustMatch: ['for'], mustNotMatch: ['append', 'defaultdict'], note: 'later key overwrites on a shared value' }, tradeoff: 'One tidy line and it inverts.', breaksWhen: 'Whenever two keys share a value - the later one overwrites the earlier, so the inverse loses keys.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the comprehension lose a key?', options: ['accumulate', 'comp_overwrite'], answerId: 'comp_overwrite', explanation: 'A dict has unique keys, so {v: k ...} overwrites whenever a value repeats - key a is replaced by c under value 1. Inverting a non-injective map needs a list per value.' },
    ],
  },

  // ───────────────── ds-group-consecutive · runs, not totals ─────────────────
  {
    id: 'ds-group-consecutive',
    title: 'Group into consecutive runs',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['itertools', 'groupby', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_ds_consecutive',
    prompt: 'Compress the sequence into consecutive runs: return a list of (value, run-length) pairs, one per unbroken run of equal values.',
    beforeWriting: 'The 1s appear in two separate runs. Should they stay separate, or be merged into one total?',
    signature: 'solve(seq)',
    starterCode: 'def solve(seq):\n    # list of (value, length) for each consecutive run\n    ...',
    hints: [
      'A "run" is an unbroken stretch of equal values; the two groups of 1s are different runs.',
      'itertools.groupby groups CONSECUTIVE equal items - but only if you do NOT sort first.',
    ],
    solution: 'def solve(seq):\n    from itertools import groupby\n    return [(k, len(list(g))) for k, g in groupby(seq)]',
    compare: { kind: 'seq' },
    debrief: 'The runs are (1,2), (2,2), (1,1), (3,2) - the two stretches of 1 stay separate because they are not adjacent.\n\n**Wrong answer that runs:** sorting before groupby collapses the two 1-runs into one, giving (1,3),(2,2),(3,2). It runs and returns run-pairs; it just answered "total count per value" instead of "consecutive runs".\n\n**Sanity check:** the run-lengths in your result should sum to the length of the input (7 here), and a value can legitimately appear more than once. If every value appears exactly once, you sorted and counted totals.',
    canonicalMethodId: 'groupby_asis',
    methods: [
      { id: 'groupby_asis', name: 'groupby (no sort)', code: 'from itertools import groupby\nreturn [(k, len(list(g))) for k, g in groupby(seq)]', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: ['sorted'], note: 'groups consecutive equal items as-is' }, tradeoff: 'itertools.groupby over the sequence as-is - exactly consecutive-run semantics.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'sort_first', name: 'sort, then groupby', code: 'from itertools import groupby\nreturn [(k, len(list(g))) for k, g in groupby(sorted(seq))]', detectionSignature: { mustMatch: ['sorted'], mustNotMatch: [], note: 'sorting merges non-adjacent runs' }, tradeoff: 'Looks like the safe habit ("sort before groupby").', breaksWhen: 'For consecutive-run problems - sorting brings non-adjacent equal values together and merges distinct runs into one total.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does sorting first break this?', options: ['groupby_asis', 'sort_first'], answerId: 'sort_first', explanation: 'groupby only groups adjacent equal items. The habit of sorting-before-groupby (right for TOTAL counts) merges the two separate runs of 1 into one, which is not what "consecutive runs" means.' },
    ],
  },

  // ───────────────── ds-topk-frequent · by count, not alphabet ─────────────────
  {
    id: 'ds-topk-frequent',
    title: 'Top-2 most frequent words',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['counter', 'collections', 'top-k'],
    estimatedMin: 5,
    fixtureId: 'fx_ds_words',
    prompt: 'Return the 2 most frequent words, most frequent first.',
    beforeWriting: 'Ranking by frequency is not the same as sorting the words. Which one does the question ask for?',
    signature: 'solve(words)',
    starterCode: 'def solve(words):\n    # the 2 words with the highest counts, most frequent first\n    ...',
    hints: [
      'You need counts first, then the two highest.',
      'Counter(words).most_common(2) returns the top pairs already ordered by count.',
    ],
    solution: 'def solve(words):\n    from collections import Counter\n    return [w for w, _ in Counter(words).most_common(2)]',
    compare: { kind: 'seq' },
    debrief: 'z appears 3 times and a twice, so the top two by frequency are ["z","a"].\n\n**Wrong answer that runs:** sorted(set(words))[:2] takes the first two ALPHABETICALLY - ["a","m"] - which has nothing to do with frequency. It runs and returns two words; they are just the wrong two, chosen by spelling instead of count.\n\n**Sanity check:** the first word you return should be the one that occurs most often (z here). If it is whatever comes first alphabetically, you sorted the keys instead of ranking by count.',
    canonicalMethodId: 'most_common',
    methods: [
      { id: 'most_common', name: 'Counter.most_common(2)', code: 'from collections import Counter\nreturn [w for w, _ in Counter(words).most_common(2)]', detectionSignature: { mustMatch: ['most_common'], mustNotMatch: [], note: 'ranks by count descending' }, tradeoff: 'Count, then take the two highest - built for exactly this.', breaksWhen: 'Ties in count fall back to insertion order; specify a tiebreak if it matters.', isTrap: false },
      { id: 'alpha_sort', name: 'sorted(set(...))[:2]', code: 'return sorted(set(words))[:2]', detectionSignature: { mustMatch: ['sorted(set'], mustNotMatch: ['most_common', 'Counter'], note: 'ranks alphabetically, ignores counts' }, tradeoff: 'Short, and returns two words.', breaksWhen: 'Always for a frequency question - it ranks by the word text, not by how often each occurs.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does sorted(set(words))[:2] miss the answer?', options: ['most_common', 'alpha_sort'], answerId: 'alpha_sort', explanation: 'It ignores counts entirely and returns the two alphabetically-first distinct words. Frequency ranking needs the counts - Counter.most_common orders by count.' },
    ],
  },

  // ───────────────── dm-merge-fanout · a duplicate key silently doubles rows ─────────────────
  {
    id: 'dm-merge-fanout',
    title: 'Attach a price when the lookup has a duplicate',
    topic: 'pandas-merge',
    difficulty: 'stretch',
    tags: ['merge', 'fan-out', 'cardinality'],
    estimatedMin: 8,
    fixtureId: 'fx_dm_sales_prices',
    prompt: 'Each sales row has a sku and a quantity. The prices table gives one price per sku - except sku "a" was accidentally entered twice (both rows say 10). Return total revenue = sum of quantity * price, without letting the bad duplicate inflate it.',
    beforeWriting: 'A merge repeats a left row once for every matching right row. What does the duplicate price row for "a" do to your sales row for "a"?',
    signature: 'solve(sales, prices)',
    starterCode: 'def solve(sales, prices):\n    # total revenue = qty * price, without the duplicate blowing it up\n    ...',
    hints: [
      'The price lookup should be one row per sku; a duplicate key makes the merge emit two rows for that sku.',
      'Collapse prices to one row per sku (drop_duplicates or a groupby) BEFORE merging.',
    ],
    solution: 'def solve(sales, prices):\n    p = prices.drop_duplicates("sku")\n    m = sales.merge(p, on="sku")\n    return float((m["qty"] * m["price"]).sum())',
    compare: { kind: 'float' },
    debrief: 'One price per sku: a=10, b=5, so revenue is 2*10 + 3*5 = 35.\n\n**Wrong answer that runs:** merging directly against the duplicated prices table fans sku "a" out into TWO rows, so its quantity is counted twice: 2*10 + 2*10 + 3*5 = 55. It runs and returns a revenue - inflated by a silent row multiplication no error ever flagged.\n\n**Sanity check:** compare the row count after the merge to the row count of sales. If it grew, a non-unique key fanned out - dedup the lookup (or validate the merge is one-to-one) first.\n\n**Interviewer follow-up:** how would you catch this in production? merge(..., validate="m:1") raises on a non-unique right key instead of silently doubling revenue.',
    canonicalMethodId: 'dedup_first',
    methods: [
      { id: 'dedup_first', name: 'dedup the lookup, then merge', code: 'p = prices.drop_duplicates("sku")\nm = sales.merge(p, on="sku")\nreturn float((m["qty"] * m["price"]).sum())', detectionSignature: { mustMatch: ['drop_duplicates'], mustNotMatch: [], note: 'one row per key before the join' }, tradeoff: 'Guarantee one price per sku before the join - the merge stays one-to-one and revenue is correct.', breaksWhen: 'If duplicate prices actually disagreed you would need a rule to pick one; here they match.', isTrap: false },
      { id: 'direct_merge', name: 'merge against the raw lookup', code: 'm = sales.merge(prices, on="sku")\nreturn float((m["qty"] * m["price"]).sum())', detectionSignature: { mustMatch: ['merge'], mustNotMatch: ['drop_duplicates'], note: 'lets the duplicate key fan out' }, tradeoff: 'The obvious join, and it runs.', breaksWhen: 'Any duplicate key on the right - the left row fans out and its quantity is counted once per duplicate, inflating every downstream sum.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the direct merge overstate revenue?', options: ['dedup_first', 'direct_merge'], answerId: 'direct_merge', explanation: 'The duplicate sku "a" in prices makes the merge emit two rows for the single "a" sale, counting its quantity twice. Dedup the lookup (or validate="m:1") so the join is one-to-one.' },
    ],
  },

  // ───────────────── dm-chained-assign · the copy that never updates ─────────────────
  {
    id: 'dm-chained-assign',
    title: 'Set a value on the rows you filtered',
    topic: 'pandas-window',
    difficulty: 'core',
    tags: ['loc', 'chained-indexing', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_dm_gv',
    prompt: 'Set v to 0 for every row where g equals "a", and return the whole frame with that change applied.',
    beforeWriting: 'df[mask]["v"] = 0 and df.loc[mask, "v"] = 0 look similar. One assigns to a temporary copy. Which one actually changes df?',
    signature: 'solve(df)',
    starterCode: 'def solve(df):\n    out = df.copy()\n    # set v = 0 where g == "a"\n    return out',
    hints: [
      'Selecting rows and then a column as two separate steps assigns to a throwaway intermediate.',
      'Do the selection and assignment in ONE .loc call so the write lands on the real frame.',
    ],
    solution: 'def solve(df):\n    out = df.copy()\n    out.loc[out["g"] == "a", "v"] = 0\n    return out',
    compare: { kind: 'frame', checkDtype: true, checkLike: true, ignoreIndex: true },
    debrief: 'The two group-a rows get v=0; group b is untouched.\n\n**Wrong answer that runs:** out[out["g"]=="a"]["v"] = 0 selects the rows first (making a temporary copy), then assigns to that copy - so the original out is unchanged and still reads 1,2,3. It runs (with a SettingWithCopyWarning) and returns a frame that looks like nothing happened.\n\n**Sanity check:** confirm the values actually changed. If your "after" frame equals the "before" frame, you wrote to a chained-indexing copy - collapse it into a single .loc[rows, col] assignment.',
    canonicalMethodId: 'loc_assign',
    methods: [
      { id: 'loc_assign', name: 'single .loc assignment', code: 'out = df.copy()\nout.loc[out["g"] == "a", "v"] = 0\nreturn out', detectionSignature: { mustMatch: ['.loc['], mustNotMatch: [], note: 'one indexer, writes to the real frame' }, tradeoff: 'One .loc selects rows and column together and writes in place - the reliable pattern.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'chained', name: 'chained df[mask][col] = 0', code: 'out = df.copy()\nout[out["g"] == "a"]["v"] = 0\nreturn out', detectionSignature: { mustMatch: ['"]["'], mustNotMatch: ['.loc['], note: 'two-step index assigns to a copy' }, tradeoff: 'Reads left-to-right like plain indexing.', breaksWhen: 'Any assignment - the first index returns a temporary copy, so the write is discarded and the frame is silently unchanged.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the chained version leave the frame unchanged?', options: ['loc_assign', 'chained'], answerId: 'chained', explanation: 'df[mask] returns a new temporary DataFrame; assigning to ["v"] on it writes to that throwaway, not to df. .loc[mask, "v"] = 0 targets the original in a single indexing step.' },
    ],
  },

  // ───────────────── dm-pipeline-net-revenue · a multi-step pipeline (stretch) ─────────────────
  {
    id: 'dm-pipeline-net-revenue',
    title: 'Net revenue — dedup to latest, then exclude returns',
    topic: 'data-craft',
    difficulty: 'stretch',
    tags: ['pipeline', 'dedup', 'nan-policy', 'multi-step'],
    estimatedMin: 9,
    fixtureId: 'fx_dm_orders_net',
    prompt: 'This table has one row per UPDATE to an order (order_id, ts, amount, returned). Return net revenue as a single number: for each order take its MOST RECENT row, then sum the amount of the orders that were NOT returned.',
    beforeWriting: 'Two traps stack here: stale duplicate rows, and returned orders. In which order do you handle them so neither double-counts nor leaks?',
    signature: 'solve(orders)',
    starterCode: 'def solve(orders):\n    # 1) latest row per order  2) drop returned  3) sum amount\n    ...',
    hints: [
      'First collapse to the most recent row per order_id (sort by ts, keep last).',
      'Then exclude the returned orders and sum the amount - do the dedup BEFORE the sum, or old versions sneak back in.',
    ],
    solution: 'def solve(orders):\n    latest = orders.sort_values("ts").drop_duplicates("order_id", keep="last")\n    net = latest.loc[~latest["returned"], "amount"].sum()\n    return float(net)',
    compare: { kind: 'float' },
    debrief: 'Order 1\'s latest amount is 120, order 3 is 80 and kept, order 2 is returned - so net revenue is 120 + 80 = 200.\n\n**Wrong answer that runs:** filtering out returns but skipping the dedup sums BOTH versions of order 1 (100 and 120) plus order 3: 100 + 120 + 80 = 300. It runs and returns a revenue that double-counts the superseded row - the stale update leaked straight into the total.\n\n**Sanity check:** after your dedup the row count should equal the number of distinct order_ids (3 here). If a single order contributes two amounts to the sum, the pipeline summed before it collapsed.\n\n**Interviewer follow-up:** which step order is safe if some orders have no update at all, or a return arrives as its own later row? State the grain (one row per order) before you aggregate.',
    canonicalMethodId: 'dedup_then_filter',
    methods: [
      { id: 'dedup_then_filter', name: 'dedup latest, drop returns, sum', code: 'latest = orders.sort_values("ts").drop_duplicates("order_id", keep="last")\nnet = latest.loc[~latest["returned"], "amount"].sum()\nreturn float(net)', detectionSignature: { mustMatch: ['drop_duplicates'], mustNotMatch: [], note: 'collapse to latest before summing' }, tradeoff: 'Collapse to the latest row per order first, then filter and sum - each order contributes exactly once.', breaksWhen: 'Ties on ts need an explicit tiebreak; otherwise correct.', isTrap: false },
      { id: 'skip_dedup', name: 'filter returns, then sum (no dedup)', code: 'return float(orders.loc[~orders["returned"], "amount"].sum())', detectionSignature: { mustMatch: ['returned"]'], mustNotMatch: ['drop_duplicates'], note: 'sums every version, not just the latest' }, tradeoff: 'Handles the returns and looks complete.', breaksWhen: 'Whenever an order has multiple update rows - every version is summed, so revised orders are counted more than once.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does skipping the dedup overstate net revenue?', options: ['dedup_then_filter', 'skip_dedup'], answerId: 'skip_dedup', explanation: 'Order 1 has two update rows (100 and 120); without collapsing to the latest, both are summed, adding a stale 100 to the total. Dedup to one row per order before aggregating.' },
    ],
  },

  // ───────────────── ml-f1-score · F1, not accuracy ─────────────────
  {
    id: 'ml-f1-score',
    title: 'F1 score from scratch',
    topic: 'numpy-vectorize',
    difficulty: 'core',
    tags: ['metrics', 'classification', 'from-scratch'],
    estimatedMin: 7,
    fixtureId: 'fx_ml_binary',
    prompt: 'Given two 0/1 arrays y_true and y_pred, return the F1 score (the harmonic mean of precision and recall) as a single number, without using sklearn.',
    beforeWriting: 'The classes are imbalanced and the model barely predicts positive. Would accuracy and F1 tell the same story here?',
    signature: 'solve(y_true, y_pred)',
    starterCode: 'def solve(y_true, y_pred):\n    # F1 = 2 * precision * recall / (precision + recall)\n    ...',
    hints: [
      'Count TP, FP, FN from the two arrays; precision = TP/(TP+FP), recall = TP/(TP+FN).',
      'F1 is their harmonic mean: 2*p*r/(p+r) - not the fraction of correct predictions.',
    ],
    solution: 'def solve(y_true, y_pred):\n    tp = int(((y_pred == 1) & (y_true == 1)).sum())\n    fp = int(((y_pred == 1) & (y_true == 0)).sum())\n    fn = int(((y_pred == 0) & (y_true == 1)).sum())\n    prec = tp / (tp + fp)\n    rec = tp / (tp + fn)\n    return 2 * prec * rec / (prec + rec)',
    compare: { kind: 'float' },
    debrief: 'The model finds 1 of 4 real positives with no false positives: precision 1.0, recall 0.25, so F1 = 2*1*0.25/1.25 = 0.4.\n\n**Wrong answer that runs:** returning accuracy - the fraction of matching predictions - gives 3/6 = 0.5. It runs and returns a number, but on imbalanced data it rewards predicting the majority class and hides that the model missed three of four positives.\n\n**Sanity check:** F1 must sit between precision and recall (0.25 and 1.0 here). If your metric ignores which class is which - as accuracy does - it is not F1.',
    canonicalMethodId: 'f1',
    methods: [
      { id: 'f1', name: 'precision + recall -> F1', code: 'tp = int(((y_pred == 1) & (y_true == 1)).sum())\nfp = int(((y_pred == 1) & (y_true == 0)).sum())\nfn = int(((y_pred == 0) & (y_true == 1)).sum())\nprec = tp / (tp + fp)\nrec = tp / (tp + fn)\nreturn 2 * prec * rec / (prec + rec)', detectionSignature: { mustMatch: ['tp'], mustNotMatch: [], note: 'harmonic mean of precision and recall' }, tradeoff: 'Count the confusion cells, form precision and recall, take their harmonic mean - the definition of F1.', breaksWhen: 'If a class is entirely absent (tp+fp or tp+fn is 0) you must define the zero-division convention.', isTrap: false },
      { id: 'accuracy', name: 'accuracy', code: 'return float((y_pred == y_true).mean())', detectionSignature: { mustMatch: ['mean()'], mustNotMatch: ['tp', 'fp'], note: 'fraction correct, class-blind' }, tradeoff: 'The intuitive "how often is it right" and runs.', breaksWhen: 'On imbalanced classes - it rewards guessing the majority and does not reflect precision/recall, so it is not F1.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why report F1 instead of accuracy here?', options: ['f1', 'accuracy'], answerId: 'f1', explanation: 'With imbalance and few positive predictions, accuracy (0.5) looks fine while the model misses 3 of 4 positives. F1 (0.4) reflects precision and recall together, which is what the metric asks for.' },
    ],
  },

  // ───────────────── ml-zscore · standardize, not min-max ─────────────────
  {
    id: 'ml-zscore',
    title: 'Standardize a feature (z-score)',
    topic: 'numpy-vectorize',
    difficulty: 'core',
    tags: ['normalize', 'from-scratch', 'numpy'],
    estimatedMin: 5,
    fixtureId: 'fx_ml_x',
    prompt: 'Standardize the array to z-scores: subtract the mean and divide by the standard deviation, so the result has mean 0 and unit spread. Return the standardized array.',
    beforeWriting: 'Standardizing (z-score) and scaling to 0-1 (min-max) both "normalize" - but they produce different arrays. Which one centres on 0?',
    signature: 'solve(x)',
    starterCode: 'def solve(x):\n    # (x - mean) / std\n    ...',
    hints: [
      'A z-score centres the data at 0 by subtracting the mean, then divides by the standard deviation.',
      'Min-max scaling (to 0-1) is a different transform - it does not centre on 0.',
    ],
    solution: 'def solve(x):\n    return (x - x.mean()) / x.std()',
    compare: { kind: 'array' },
    debrief: 'With mean 25 and std ~11.18, the z-scores are about [-1.34, -0.45, 0.45, 1.34] - centred on 0.\n\n**Wrong answer that runs:** min-max scaling, (x - min)/(max - min), returns [0, 0.33, 0.67, 1]. It runs and returns a normalized array, but it is bounded to 0-1 and centred near 0.5, not a zero-mean z-score - a different transform wearing the word "normalize".\n\n**Sanity check:** a z-scored array has mean 0 (values straddle zero). If your output runs 0 to 1 with no negatives, you did min-max, not standardization.',
    canonicalMethodId: 'zscore',
    methods: [
      { id: 'zscore', name: '(x - mean) / std', code: 'return (x - x.mean()) / x.std()', detectionSignature: { mustMatch: ['std()'], mustNotMatch: [], note: 'centre on 0, scale by spread' }, tradeoff: 'Subtract the mean, divide by the standard deviation - the z-score, centred on 0.', breaksWhen: 'A constant array has std 0 (division by zero); guard it if that is possible.', isTrap: false },
      { id: 'minmax', name: 'min-max to 0-1', code: 'return (x - x.min()) / (x.max() - x.min())', detectionSignature: { mustMatch: ['min()'], mustNotMatch: ['std'], note: 'rescales to 0-1, not zero-mean' }, tradeoff: 'Also "normalizes" and runs.', breaksWhen: 'When the task means standardization - min-max bounds to 0-1 and does not centre on 0, so it is a different feature scaling.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'How do you tell a z-score from min-max output?', options: ['zscore', 'minmax'], answerId: 'zscore', explanation: 'A z-score has mean 0, so values straddle zero (negatives and positives). Min-max scaling bounds the array to 0-1 with no negatives - a different normalization than the one asked for.' },
    ],
  },

];

export default problems;

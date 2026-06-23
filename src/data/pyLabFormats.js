// pyLabFormats — per-problem content for the two new PyLab showcase formats
// (PYLAB-VISION.md §3): Ambiguity drill (FORMAT A) and Refactor (FORMAT B).
//
// Decoupled from the bank: keyed by problem id, so a problem can carry an ambiguity
// drill, a refactor target, both, or neither. The runner looks the problem id up here;
// the bank (pyLabProblems.js + pyLabBatch_*.js) stays untouched.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside (so no inner escaping); \n for newlines; escape PROSE apostrophes as \' ;
// NO template literals / backticks. `node --check` before committing.
//
// FORMAT A — ambiguity: { question, options: [{ id, label, correct, why }], note }.
//   Exactly ONE option is correct:true, and it matches what that problem's canonical
//   `solution` actually computes (verified by reading the solution). The wrong options
//   are the plausible misreadings - usually the problem's existing trap is one of them.
//
// FORMAT B — refactor: { slowCode, note }. slowCode is a FULL def solve(...) that is
//   CORRECT (identical output to the canonical solution under pl_compare) but measurably
//   SLOWER at scale (a row-by-row loop / .apply / iterrows where the canonical vectorizes).
//   Both the correctness and the slower-at-scale claim are CPython-verified.

export const pyLabFormats = {

  // ───────────────────────────── pylab-rep-share-of-region (seed) ─────────────────────────────
  // AMBIGUITY: which denominator does "share" use - the region total or the whole table?
  // The solution divides by df.groupby("region")["amount"].transform("sum") -> the REGION total.
  // REFACTOR: a per-group .apply that recomputes each group's total, vs the one-pass transform.
  'pylab-rep-share-of-region': {
    ambiguity: {
      question: '"Each row\'s share of its region" - share of WHAT total? When you divide a row\'s amount, what number goes underneath?',
      options: [
        { id: 'region_total', label: 'The total amount sold in that row\'s OWN region', correct: true, why: 'What the spec says - the denominator resets per region, so West\'s rows divide by 400 and East\'s by 200. The solution broadcasts the per-region sum back with transform("sum"), which is exactly this.' },
        { id: 'whole_table', label: 'The total amount across the WHOLE table', correct: false, why: 'This answers "share of all sales", not "share of region". ana comes out 100/600 instead of 100/400 - it runs and looks like a share, but the denominator is wrong. This is the problem\'s built-in trap.' },
        { id: 'rep_total', label: 'That rep\'s own total across every region', correct: false, why: 'Each rep appears once here and reps do not span regions in this task, so this misreads "region" as "rep" and divides each amount by itself - every share becomes 1.0.' },
      ],
      note: 'Interviewers leave "share" denominator-free on purpose - name the denominator out loud (per region, per rep, or global) before you write the divide.',
    },
    refactor: {
      slowCode: 'def solve(sales):\n    df = sales.copy()\n    # row-by-row: for each row, recompute its region total by re-filtering the frame\n    shares = []\n    for _, row in df.iterrows():\n        region_total = df[df["region"] == row["region"]]["amount"].sum()\n        shares.append(row["amount"] / region_total)\n    df["share"] = shares\n    return df',
      note: 'iterrows + re-filtering the whole frame per row is O(n^2): the canonical transform("sum") broadcasts every group total back in a single pass.',
    },
  },

  // ───────────────────────────── pylab-region-total-keep-unknown (seed) ─────────────────────────────
  // AMBIGUITY: what happens to the row whose region key is unknown (None)?
  // The solution passes dropna=False -> the missing-key row is KEPT as its own group.
  'pylab-region-total-keep-unknown': {
    ambiguity: {
      question: 'One sale has an unknown region (the key is missing). When you total by region, what should happen to that sale?',
      options: [
        { id: 'keep_unknown', label: 'Keep it as its own "unknown" group so its amount still counts', correct: true, why: 'The spec is explicit - the unknown-region sale must not vanish. The solution uses groupby(dropna=False), which keeps the missing key as its own NaN group, so its 50 is still reported.' },
        { id: 'drop_unknown', label: 'Drop it - a row with no region can\'t belong to any region total', correct: false, why: 'This is what a plain groupby("region") does by default (dropna=True): the None row is silently dropped and every total quietly understates. It runs - the only tell is a sale that should be there and is not. The trap.' },
        { id: 'assign_other', label: 'Bucket it into the largest existing region so nothing is lost', correct: false, why: 'Inventing a home for the row corrupts a real region\'s total. "Keep it" means keep it as ITS OWN group, not fold it into another.' },
      ],
      note: 'Missing keys are a silent fork: the default drops them. Decide keep-vs-drop deliberately, because "the totals are slightly low" is the hardest bug to notice.',
    },
  },

  // ───────────────────────────── pylab-vectorize ─────────────────────────────
  // REFACTOR: a row-by-row .apply (Python call per row) vs the one-pass np.where.
  'pylab-vectorize': {
    refactor: {
      slowCode: 'def solve(df):\n    df = df.copy()\n    # one Python function call per row to decide the label\n    def label(v):\n        return "high" if v >= 100 else "low"\n    df["tier"] = df["order_value"].apply(label)\n    return df',
      note: 'Series.apply runs the Python label() once per row - a loop in disguise; np.where evaluates the whole column in one compiled pass.',
    },
  },

  // ───────────────────────────── pylab-groupby-topn-per-group ─────────────────────────────
  // (no honest ambiguity authored - the only fork is sort-first-or-not, which is a
  //  correctness error not a reading; tie handling has no fixture support here.)

  // ───────────────────────────── pylab-groupby-rank-within ─────────────────────────────
  // AMBIGUITY: rank within the region, or across the whole company?
  // The solution groups by region BEFORE ranking -> ranking restarts at each region.
  'pylab-groupby-rank-within': {
    ambiguity: {
      question: 'Rank 1 goes to the top seller - but top seller of WHAT pool? Does the ranking reset at each region, or run across the whole company?',
      options: [
        { id: 'within_region', label: 'Within each region - rank 1 is the best seller in THAT region', correct: true, why: 'The spec says "within their own region", and the solution groups by region before ranking, so a rep only competes with others in the same region. West\'s top is rank 1 even though East has bigger numbers.' },
        { id: 'global', label: 'Across the whole table - rank 1 is the best seller company-wide', correct: false, why: 'A single .rank() over the whole sales column answers "global standing", so East\'s big numbers push West\'s reps down to 2 and 3. It fills the column and runs, but answers the wrong question. The trap.' },
        { id: 'ascending', label: 'Within region, but rank 1 = the LOWEST seller', correct: false, why: 'Rank direction is a separate decision; here rank 1 is explicitly the TOP seller, so the rank must be descending (ascending=False). Lowest-first inverts every position.' },
      ],
      note: 'The pool is the ambiguity: "rank the reps" never says rank within what. Name the partition (per region vs global) before choosing rank().',
    },
  },

  // ───────────────────────────── pylab-groupby-transform-broadcast ─────────────────────────────
  // REFACTOR: precompute group means into a dict, then iterrows to look each one up,
  // vs the one-pass groupby.transform("mean").
  'pylab-groupby-transform-broadcast': {
    refactor: {
      slowCode: 'def solve(df):\n    df = df.copy()\n    means = df.groupby("region")["sales"].mean().to_dict()\n    # walk the rows one at a time, looking up each region\'s mean\n    out = []\n    for _, row in df.iterrows():\n        out.append(means[row["region"]])\n    df["region_mean"] = out\n    return df',
      note: 'The means are right, but iterrows walks the frame row-by-row in Python; transform("mean") aligns the group aggregate back in one vectorized pass.',
    },
  },

  // ───────────────────────────── pylab-groupby-share-of-total ─────────────────────────────
  // AMBIGUITY: "share of total" - total over what? The solution divides each region total
  // by g["sales"].sum() -> the GRAND total of all regions (shares sum to 100).
  'pylab-groupby-share-of-total': {
    ambiguity: {
      question: '"Each region\'s share of the total" - which "total" is the denominator? You divide each region\'s sales by what?',
      options: [
        { id: 'grand_total', label: 'The grand total - the sum of every region\'s sales', correct: true, why: 'Share of total means the parts must add to the whole, so the denominator is the sum across all regions. The solution divides by g["sales"].sum(); West 60 and East 40 over 100 give 60.0 and 40.0, which sum to 100.' },
        { id: 'largest_region', label: 'The largest region\'s total - everything as a percent of the biggest', correct: false, why: 'Dividing by the max (60) answers "percent of the biggest region", so the top region reads a tidy 100.0 but the column sums to 166.7, not 100. It runs and looks like a percentage. The trap.' },
        { id: 'row_count', label: 'The number of regions - the average region\'s sales', correct: false, why: 'Dividing by the count gives each region\'s ratio to the average, not its share of the whole; those values do not add to 100 either.' },
      ],
      note: 'The "shares should sum to 100" line is the spec quietly pinning the denominator - if your shares don\'t add up, you picked the wrong total.',
    },
  },

  // ───────────────────────────── pylab-pd-selection-nlargest ─────────────────────────────
  // (no honest ambiguity authored: the only fork is sort direction, which is an error not
  //  a reading, and the fixture has no ties so tie-handling has nothing to test.)

  // ───────────────────────────── pylab-pd-metrics-rate-per-group ─────────────────────────────
  // AMBIGUITY: a region's conversion rate - over its own users, or over every user?
  // The solution divides each region's conversions by g["users"] (that region's own count).
  'pylab-pd-metrics-rate-per-group': {
    ambiguity: {
      question: 'A region\'s conversion rate = its conversions divided by what? Which user count goes in the denominator?',
      options: [
        { id: 'region_users', label: 'That region\'s OWN user count', correct: true, why: 'A rate is conversions over the population it came from, and that population is the region\'s own users. The solution divides each region\'s conversions by its per-region user count - East 2/2 = 100.0, West 1/2 = 50.0.' },
        { id: 'all_users', label: 'The total user count across every region', correct: false, why: 'Dividing each region\'s conversions by all users (4) answers "this region\'s share of the whole table", not its rate - East drops to 50.0, West to 25.0. The columns and shape are right; only the denominator is wrong. The trap.' },
        { id: 'all_converters', label: 'The total number of converters across all regions', correct: false, why: 'That yields each region\'s share of conversions, a third metric again. A rate\'s denominator is the population at risk (users), not the count of successes.' },
      ],
      note: 'Per-group rates are a denominator trap: the safe instinct is "conversions over this group\'s own count", never over the global total.',
    },
  },

  // ───────────────────────────── pylab-pd-dedup-keep-last ─────────────────────────────
  // AMBIGUITY: collapsing repeated user rows - keep the first occurrence or the last?
  // Rows are oldest-first and the solution uses keep="last" -> the CURRENT (latest) state.
  'pylab-pd-dedup-keep-last': {
    ambiguity: {
      question: 'A user has several state-change rows, ordered oldest first. Collapsing to one row per user, which occurrence do you keep?',
      options: [
        { id: 'keep_last', label: 'The LAST occurrence - the user\'s most recent state', correct: true, why: 'The rows are oldest-first and the spec asks for the current state, so the latest row wins. The solution uses drop_duplicates(keep="last"); user 1 -> "b", user 2 -> "e".' },
        { id: 'keep_first', label: 'The FIRST occurrence - whatever state they started in', correct: false, why: 'On oldest-first data the first row is the user\'s ORIGINAL (stale) state. keep="first" returns "a" and "c" - one row per user, so the count looks right, but the values are out of date. The trap.' },
        { id: 'keep_either', label: 'Either - drop_duplicates keeps one row, the choice doesn\'t matter', correct: false, why: 'It matters entirely: first and last give DIFFERENT states here. The keep policy is the whole decision, not an afterthought.' },
      ],
      note: 'On time-ordered data, "one row per key" hides a fork: keep-first gives the original, keep-last gives the current. Read the row order, then choose the keep.',
    },
  },

  // ───────────────────────────── pylab-pd-dedup-dense-rank ─────────────────────────────
  // AMBIGUITY: two reps tie - what position does the NEXT rep get?
  // The solution uses method="dense" -> the next distinct value continues with no gap.
  'pylab-pd-dedup-dense-rank': {
    ambiguity: {
      question: 'Two reps tie for first and both get position 1. The next rep down - is their position 2, or 3?',
      options: [
        { id: 'dense', label: 'Position 2 - no gap after the tie', correct: true, why: 'The spec says the position after a tie must not be skipped. The solution uses rank(method="dense"), so two tied at 1 are followed by 2: positions come out [1, 1, 2, 3].' },
        { id: 'min_gap', label: 'Position 3 - the tie consumes slots 1 and 2, so the next is 3', correct: false, why: 'This is the min/standard-competition policy (rank(method="min")): the tied reps share 1, then the next distinct value SKIPS to 3, giving [1, 1, 3, 4]. It runs and also puts the tie at 1 - the divergence is only after the tie. The trap.' },
        { id: 'first', label: 'Position 2, but break the tie so the two reps get 1 and 2', correct: false, why: 'That refuses to let them tie at all (rank(method="first")), assigning 1 and 2 by row order. The spec requires tied reps to SHARE a position, so they must both be 1.' },
      ],
      note: 'Ranking ties is two decisions, not one: do ties share a position, and does the next value skip the consumed slots? "No gap after a tie" picks dense over min.',
    },
  },

  // ───────────────────────────── pylab-pd-datetime-half-open-range ─────────────────────────────
  // AMBIGUITY: a row dated exactly on the end boundary (2023-02-01) - in or out?
  // The solution uses (date >= start) & (date < end) -> the boundary day is EXCLUDED.
  'pylab-pd-datetime-half-open-range': {
    ambiguity: {
      question: 'You want January\'s rows. A row dated exactly 2023-02-01 - does it belong to this window, or to February?',
      options: [
        { id: 'exclude_end', label: 'Exclude it - it belongs to February, not January', correct: true, why: 'The spec asks for "strictly before 2023-02-01", a half-open window. The solution filters (date >= start) & (date < end), so the boundary day belongs to exactly one month - here it goes to February, and January keeps amounts [10, 20].' },
        { id: 'include_end', label: 'Include it - January runs up to and including 2023-02-01', correct: false, why: 'An inclusive upper bound (date <= end) grabs the 2023-02-01 row too, returning [10, 20, 30]. Run the same inclusive rule for February and that day is counted in BOTH months. It looks like a reasonable filter. The trap.' },
        { id: 'exclude_start', label: 'Exclude the start day instead, include the end', correct: false, why: 'Flipping which boundary is open drops the legitimate 2023-01-01 row and keeps the 2023-02-01 one - the window slides off by a day at both ends.' },
      ],
      note: 'Date windows are off-by-one farms: the half-open convention [start, end) gives every boundary day to exactly one period. Pin which end is open before you filter.',
    },
  },

  // ───────────────────────────── pylab-rmse ─────────────────────────────
  // REFACTOR: a Python loop accumulating squared residuals, vs the vectorized numpy form.
  'pylab-rmse': {
    refactor: {
      slowCode: 'def solve(y_true, y_pred):\n    import math\n    # accumulate the squared residuals one point at a time in a Python loop\n    total = 0.0\n    n = len(y_true)\n    for t, p in zip(y_true, y_pred):\n        diff = float(t) - float(p)\n        total += diff * diff\n    return math.sqrt(total / n)',
      note: 'A Python for-loop over every point does the arithmetic element-by-element in the interpreter; numpy squares, means, and roots the whole array in compiled code.',
    },
  },

  // ───────────────────────────── pylab-minmax-normalize ─────────────────────────────
  // REFACTOR: a Python list-comprehension dividing each element, vs the vectorized form.
  'pylab-minmax-normalize': {
    refactor: {
      slowCode: 'def solve(x):\n    import numpy as np\n    arr = np.asarray(x, dtype=float)\n    lo = float(arr.min())\n    hi = float(arr.max())\n    span = hi - lo\n    if span == 0:\n        return np.zeros_like(arr)\n    # rescale each element with a Python loop instead of a whole-array op\n    scaled = [(float(v) - lo) / span for v in arr]\n    return np.asarray(scaled, dtype=float)',
      note: 'The list-comprehension touches each element through the Python interpreter; (arr - lo) / span subtracts and divides the entire array in one vectorized pass.',
    },
  },

};

export default pyLabFormats;

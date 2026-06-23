// pyLabFollowups — the Follow-up chains format (PYLAB-VISION §3). A real interviewer
// does not stop when your code runs - they ESCALATE. Per problem, a short chain of
// escalating next questions, each with a concise model answer. Reveal-only (the
// discussion after a solve): answers are READ, not graded.
//
// HOUSE SYNTAX: single quotes only for JS strings; Python stored with DOUBLE quotes
// inside; \n for newlines; escape PROSE apostrophes as \' ; NO template literals /
// backticks.
//
// Shape: { '<problem-id>': [ { ask, answer }, ... ], ... }
//   ask    — the interviewer\'s next question, one line, in their voice.
//   answer — 1-3 sentences: the approach + the key gotcha/why. Tiny inline code OK.
// 2-4 steps per chain, GENUINELY escalating. Keys are real pyLabProblems ids.
// Only problems with honest escalation get a chain; trivial one-liners are skipped.

export const pyLabFollowups = {

  // ───────────────────────── pandas · groupby ─────────────────────────

  'pylab-rep-share-of-region': [
    { ask: 'Now show only reps whose share is above their own region\'s average rep share.', answer: 'After building "share", broadcast the region mean of share back and filter: "df = df[df[\"share\"] > df.groupby(\"region\")[\"share\"].transform(\"mean\")]". The point is the comparison threshold is per-region, so it has to be a transform (one value per row), not a scalar.' },
    { ask: 'A region appears with total amount 0 - what does "share" do, and what should it do?', answer: 'You divide by the region total, so a region summing to 0 gives 0/0 = NaN for every row. Decide the policy explicitly - usually fill those shares with 0.0 ("df[\"share\"] = df[\"share\"].fillna(0)") rather than ship NaNs that poison a later sum.' },
    { ask: 'How does transform compare to merge-the-total-back at 50M rows?', answer: 'transform broadcasts the group aggregate in a single vectorized pass and keeps row order; the merge materialises a second totals frame and does a hash join (extra memory + a shuffle). Same answer, transform is strictly cheaper.' },
  ],

  'pylab-groupby-topn-per-group': [
    { ask: 'Drop the sort - just use idxmax instead of sort-then-head. Same answer?', answer: 'Yes and it is cleaner: "df.loc[df.groupby(\"region\")[\"sales\"].idxmax()]" grabs each region\'s max-sales row directly, no global sort needed. idxmax returns the FIRST max on a tie, same as a stable sort + head(1).' },
    { ask: 'Two reps tie for the top in a region - what comes back, and is that acceptable?', answer: 'Both idxmax and head(1) return exactly one row (idxmax keeps the first-seen tie), so you silently drop the co-winner. If ties should both appear, that is a different op - rank within region and keep rank==1, which can yield multiple rows.' },
    { ask: 'Now the top 3 reps per region, not just the top 1.', answer: 'Sort by [region, sales desc] then "df.groupby(\"region\").head(3)" - head(n) generalises where idxmax does not. For only the n-th, "groupby(...).nth(n)".' },
  ],

  'pylab-groupby-rank-within': [
    { ask: 'Why dense here and not method="min"?', answer: 'Both put tied reps on the same rank, but min LEAVES A GAP after a tie (1,1,3) while dense does not (1,1,2). The prompt says "no gap after," which is exactly the dense policy - the divergence only shows up after a tie.' },
    { ask: 'Now keep only each region\'s top 2 ranked reps.', answer: 'Filter on the rank you just built: "df[df[\"rnk\"] <= 2]". Because rnk is dense, a 2-way tie at rank 1 means three rows can survive a "<= 2" cut - confirm that is the intended behavior vs method="first" which forces a strict ordering.' },
    { ask: 'Break ties by name so the order is deterministic - earliest name wins the lower number.', answer: 'rank cannot tie-break on a second column, so sort first then use method="first": "df.sort_values([\"region\",\"sales\",\"name\"], ascending=[True,False,True])" then "groupby(\"region\").cumcount()+1". cumcount over the sorted frame gives a strict 1..n with no shared ranks.' },
  ],

  'pylab-groupby-share-of-total': [
    { ask: 'Add a cumulative-share column - regions sorted by share descending, running total of share.', answer: 'Sort by share desc, then "g[\"cum_share\"] = g[\"share\"].cumsum()". This is the Pareto view; the last row should land on ~100.0 (modulo the per-row rounding you already applied).' },
    { ask: 'Round each share to 1 decimal but make sure the column still sums to exactly 100.0.', answer: 'Naive per-row rounding can sum to 99.9 or 100.1. The honest fix is largest-remainder: round all down, then hand the leftover 0.1 increments to the regions with the biggest rounding remainder. Flag the trade-off rather than pretend round() is exact.' },
  ],

  'pylab-filter-before-aggregate': [
    { ask: 'Now the average order value for new users PER region, not one overall number.', answer: 'Filter first, then group: "df[df[\"is_new\"]].groupby(\"region\")[\"order_value\"].mean()". Filtering before the groupby is what keeps returning-users out of every region\'s mean - the population decision still comes first.' },
    { ask: 'A region has new users but all their order_value entries are NaN - what does mean return?', answer: 'mean() skips NaN by default, so a region that is all-NaN returns NaN (empty mean), not 0. Decide whether that region should be absent, NaN, or 0 - do not let skipna quietly hand back NaN where a stakeholder expects a number.' },
    { ask: 'is_new arrives as the strings "true"/"false" instead of booleans - what breaks?', answer: 'df[df["is_new"]] needs a real boolean mask; a column of non-empty strings is all-truthy, so EVERY row passes and the filter does nothing. Coerce first ("df[\"is_new\"] = df[\"is_new\"] == \"true\"") - a classic runs-but-wrong from a dtype you did not check.' },
  ],

  'pylab-missing-fillna-group-mean': [
    { ask: 'A whole region is missing every score - what does the group-mean fill produce?', answer: 'That group\'s mean is NaN (mean of all-NaN), so fillna(s.mean()) leaves the gap as NaN - the fill silently does nothing for that region. Add a fallback to the global mean for empty groups, or report those regions as unfillable rather than ship NaNs.' },
    { ask: 'Should you fill with the mean or the median here?', answer: 'Mean is pulled by outliers; if a region has one extreme score the imputed value is skewed. Median is the robust choice for skewed score distributions - swap "s.fillna(s.mean())" for "s.fillna(s.median())". Name the assumption: imputation invents data either way.' },
  ],

  'pylab-missing-ffill': [
    { ask: 'Within a product, the rows are not in date order - is ffill still correct?', answer: 'No. ffill carries the previous ROW forward, so out-of-order rows carry the wrong "last known" price. Sort by [product, date] before the groupby ffill, or the carry-forward walks the wrong timeline.' },
    { ask: 'A product\'s value is missing both at the start and in the middle - what stays NaN?', answer: 'The opening gap stays NaN (no earlier same-product price to carry), the middle gap gets filled from the prior known price. If you need the opening gap filled too, add a per-group bfill after the ffill - but that borrows a FUTURE price, which is a different (and often illegitimate) assumption.' },
    { ask: 'Could you do this in numpy instead of groupby.ffill, and is it worth it?', answer: 'You can, with a per-group forward-fill index trick, but it is fiddly and error-prone across group boundaries. groupby("product")["price"].ffill() is already vectorized in C and respects boundaries; reaching for numpy here trades clarity for no real win.' },
  ],

  'pylab-pd-metrics-safe-ctr': [
    { ask: 'Now the overall CTR across all ads - total clicks over total impressions.', answer: 'Aggregate the raw counts, then divide once: "ad[\"clicks\"].sum() / ad[\"impressions\"].sum()". Do NOT average the per-row ctr column - the mean of ratios weights a tiny ad the same as a huge one. Sum the numerators and denominators separately.' },
    { ask: 'You guarded division by zero, but a true zero-impression ad reads 0.0 the same as a real 0% ad - is that honest?', answer: 'No - "no data" and "0% clicked" are different facts collapsed into one number. For a metric a human reads, leave zero-impression rows as NaN (or a "n/a" flag) so they are visibly excluded, and only coerce to 0 when feeding a sum that must not break.' },
    { ask: 'How would you express the safe ratio in SQL?', answer: 'A guarded divide: "CASE WHEN impressions > 0 THEN clicks * 1.0 / impressions ELSE 0 END". Same shape as np.where - and the "* 1.0" forces float division, the SQL analogue of pandas\' int/int trap.' },
  ],

  'pylab-pd-metrics-rate-per-group': [
    { ask: 'A region has zero users - what does the rate column do?', answer: 'conversions/users becomes 0/0 = NaN for that region. Decide the policy: a region with no users has an undefined rate, so NaN is arguably honest, but if a dashboard needs a number, fillna(0) AFTER you have shown the user count so the 0 is not mistaken for "0% converted."' },
    { ask: 'Sum and count of the same flag give conversions and users - why does that work?', answer: 'The converted flag is 1/0, so sum() counts the 1s (conversions) and count() counts all non-null rows (users) in a single agg pass. Watch one trap: if the flag has NaNs, count() excludes them, so users would undercount - use size() if every row is a user regardless of the flag.' },
  ],

  'pylab-pd-dedup-keep-last': [
    { ask: 'The rows are NOT pre-sorted by time - is keep="last" still the current state?', answer: 'No - keep="last" keeps the last ROW per user, which is only the latest state if rows are time-ordered. Sort by [user_id, timestamp] first, then drop_duplicates(keep="last"); otherwise "last" is just whatever landed at the bottom of the file.' },
    { ask: 'Two rows for a user share the exact same timestamp - which wins, and how do you make it deterministic?', answer: 'After sorting on timestamp alone the tie order is arbitrary, so the "current" state is non-deterministic across runs. Add a deterministic tiebreaker to the sort (an event_id, or kind="stable" to preserve input order) so the same input always yields the same winner.' },
    { ask: 'At 50M rows, is sort + drop_duplicates the cheapest way to get the latest per user?', answer: 'A full sort is O(n log n). If you only need the latest, "df.sort_values(\"timestamp\").groupby(\"user_id\").tail(1)" is similar, but "df.loc[df.groupby(\"user_id\")[\"timestamp\"].idxmax()]" avoids sorting the whole frame - one pass to find each group\'s max-timestamp row.' },
  ],

  'pylab-pd-dedup-dense-rank': [
    { ask: 'Why does method="min" give the wrong answer for "no gap after a tie"?', answer: 'min shares the tie rank then JUMPS past the skipped slots - a 2-way tie at 1 makes the next rep 3, not 2 (gives 1,1,3,4). dense shares the tie and continues at the next integer (1,1,2,3). The "no gap" wording selects dense specifically.' },
    { ask: 'Now you want a strict 1..n with NO ties at all - earliest-listed rep wins on a tie.', answer: 'That is method="first" (after ensuring stable input order), which assigns distinct consecutive ranks and breaks ties by position: tied reps become 1,2 instead of 1,1. Different question - "first" answers "give everyone a unique rank," dense answers "tied things share a rank."' },
  ],

  // ───────────────────────── pandas · merge ─────────────────────────

  'pylab-attach-price-no-fanout': [
    { ask: 'Instead of pre-deduping, how would you make merge ITSELF catch the fan-out?', answer: 'Pass validate: "orders.merge(prices, on=\"product_id\", how=\"left\", validate=\"m:1\")". It raises a MergeError the moment the right key is not unique, turning a silent row-count bug into a loud failure - safer than hoping you remembered drop_duplicates.' },
    { ask: 'The duplicate reference rows have DIFFERENT prices for the same product_id - now what?', answer: 'drop_duplicates("product_id") arbitrarily keeps one price, which may be wrong. This is now a data-quality decision, not a merge trick: dedupe by a rule (latest effective_date, max price, or flag the conflict and refuse) - silently keeping the first is the trap.' },
    { ask: 'What is the 30-second habit that would have caught this before any downstream sum?', answer: 'Assert the row count after every join: "assert out.shape[0] == orders.shape[0]". A left join must never grow the left frame; if it does, a key fanned out. Cheap, catches the whole class of bug.' },
  ],

  'pylab-users-with-no-orders': [
    { ask: 'Do it without a merge - just set membership.', answer: 'Mask on isin: "users[~users[\"user_id\"].isin(orders[\"user_id\"])][\"user_id\"].sort_values().tolist()". For "who is absent from the other table" this is clearer and cheaper than a left-join-with-indicator - no join, no _merge column to filter.' },
    { ask: 'At 50M users and 200M orders, which is cheaper - isin or the indicator merge?', answer: 'isin builds a hash set over orders\' user_id once then probes - roughly O(n+m) and lower memory than materialising a joined frame with an indicator. The merge has to align and emit every matched row first. isin wins for a pure membership question.' },
    { ask: 'user_id has nulls in one of the tables - does isin still behave?', answer: 'NaN is never equal to NaN, so a null user in users will not match a null in orders and lands in the "never bought" set - usually wrong. Drop or handle nulls in the key explicitly before the membership test; do not let NaN semantics decide who counts as a non-buyer.' },
  ],

  'pylab-audit-unmatched-keys': [
    { ask: 'Your counts include duplicate keys. The audit should be over DISTINCT keys - fix it.', answer: 'If either side has repeated keys, the outer merge fans out and the both/left_only counts inflate. De-dupe each side\'s key first ("left[[\"key\"]].drop_duplicates()") before the outer merge, or work with sets: len(L-R), len(R-L), len(L&R).' },
    { ask: 'Just give me the three counts with Python sets, no pandas.', answer: '"L, R = set(left[\"key\"]), set(right[\"key\"]); return {\"left_only\": len(L-R), \"right_only\": len(R-L), \"both\": len(L&R)}". Set difference/intersection is the natural language of an overlap audit and is inherently over distinct keys.' },
  ],

  // ───────────────────────── pandas · reshape ─────────────────────────

  'pylab-monthly-category-table': [
    { ask: 'Why pivot_table here and not df.pivot?', answer: 'df.pivot has no aggregation, so a repeated (month, category) pair makes it RAISE ("Index contains duplicate entries"). pivot_table takes aggfunc to collapse the duplicates - here aggfunc="sum" for the total. The duplicate key is exactly why pivot is the wrong tool.' },
    { ask: 'You left aggfunc at the default once and got 17.5 in a cell - what happened?', answer: 'pivot_table\'s default aggfunc is "mean", so a duplicated pair was averaged (30 and 5 -> 17.5) instead of summed (35). It runs and produces a clean grid, just answers a different question. Always name the aggregation when the key can repeat.' },
    { ask: 'Add row and column totals to the grid.', answer: 'Pass margins=True (and optionally margins_name): pivot_table(..., margins=True) appends an "All" row and column with the grand totals, computed with the same aggfunc. One flag instead of manually concatenating sums.' },
  ],

  // ───────────────────────── pandas · window ─────────────────────────

  'pylab-window-rolling-mean': [
    { ask: 'Why sort by day before rolling - the rolling call looks order-agnostic?', answer: 'rolling(3) averages the 3 physically-adjacent rows, not the 3 nearest in time. The rows arrive as days 3,1,2,5,4 - unsorted, the "3-day average" mixes non-consecutive days and every value is wrong. Sort by day first so the window walks real time.' },
    { ask: 'Instead of leaving the first two days empty, give them a partial average.', answer: 'Pass min_periods: "rolling(3, min_periods=1).mean()" lets the window emit as soon as it has 1 value, so day 1 = day1, day 2 = mean(day1,day2). Trade-off: early values are computed over fewer points, so flag them as less stable rather than treating them as full 3-day averages.' },
    { ask: 'Some calendar days are missing entirely - does rolling(3) still mean "3 days"?', answer: 'No - rolling(3) counts ROWS, so if a day is absent the window spans more than 3 calendar days. For a true time window use a time-based offset on a datetime index: "rolling(\"3D\").mean()", which respects gaps regardless of how many rows fall in them.' },
  ],

  'pylab-window-pct-change': [
    { ask: 'pct_change compares to the row above - what guarantees that row is the previous MONTH?', answer: 'Nothing, until you sort. The rows arrive as months 2,1,3, so unsorted pct_change pairs each row with whatever physically precedes it - all wrong pairings, and it runs clean. sort_values("month_num") first; order is the whole game for any vs-previous calc.' },
    { ask: 'A month has sales of 0, then the next month is positive - what does pct_change return?', answer: 'Division by the prior value means 0 -> positive gives inf (growth from a zero base is undefined). Decide the policy: leave inf, cap it, or report "n/a from a zero base" - do not let an inf silently flow into a chart or an average.' },
    { ask: 'Now growth versus the same month LAST year, not the prior row.', answer: 'pct_change takes periods: with 12 rows per year in month order, "pct_change(periods=12)" compares each month to 12 rows back (YoY). Same gotcha amplified - the frame must be sorted and have no missing months, or "12 back" is not actually a year ago.' },
  ],

  // ───────────────────────── pandas · datetime ─────────────────────────

  'pylab-pd-datetime-half-open-range': [
    { ask: 'Why a half-open window [start, end) instead of <= on both ends?', answer: 'If both January and February include their boundary day, 2023-02-01 gets counted in BOTH months and the totals double-count. Half-open (>= start, < end) makes each boundary day belong to exactly one period - the strict upper bound is the whole fix.' },
    { ask: 'The date column also carries a time component - does the strict < 2023-02-01 still hold?', answer: 'Yes, and that is the point: "< 2023-02-01 00:00:00" excludes the entire Feb 1st day including 2023-02-01 09:00, whereas "<= 2023-02-01" would only catch midnight and silently let later Feb-1 timestamps slip into January. Half-open is robust to times; inclusive-end is not.' },
    { ask: 'Generalise this to "all rows in the month containing a given date."', answer: 'Compute the bounds from the date: "s = d.to_period(\"M\").start_time; e = (d.to_period(\"M\") + 1).start_time" then mask "(date >= s) & (date < e)". Deriving the half-open bounds from a Period avoids hand-typing month-end dates (and the 28/29/30/31 trap).' },
  ],

  // ───────────────────────── numpy · vectorize ─────────────────────────

  'pylab-vectorize': [
    { ask: 'Add a third tier - "mid" for 50 to 99, "high" for 100+, "low" below 50.', answer: 'np.where nests awkwardly for 3+ buckets; reach for pd.cut: "pd.cut(df[\"order_value\"], bins=[-inf,50,100,inf], labels=[\"low\",\"mid\",\"high\"], right=False)". right=False makes the bins half-open so 100 lands in "high", not "mid" - mind the boundary.' },
    { ask: 'Why not df["order_value"].apply(lambda v: "high" if v >= 100 else "low")?', answer: 'apply runs a Python-level loop row by row - correct but orders of magnitude slower than np.where, which is one vectorized C pass over the array. At scale apply is the classic avoidable cost; np.where or pd.cut is the idiom.' },
  ],

  'pylab-softmax': [
    { ask: 'Why subtract the max before exponentiating - the math is the same?', answer: 'exp of a large score overflows to inf ("exp(1000)") and the result becomes NaN. Subtracting the max shifts the largest exponent to 0, so values stay in (0,1]; softmax is invariant to that shift, so the answer is unchanged but numerically safe. This is the whole point of the problem.' },
    { ask: 'Now softmax each ROW of a 2-D array of scores independently.', answer: 'Keep the reduction axis-aware and keepdims so broadcasting lines up: "z = z - z.max(axis=1, keepdims=True); e = np.exp(z); return e / e.sum(axis=1, keepdims=True)". Drop keepdims and the (n,) sum will not broadcast against the (n,k) matrix - a silent shape bug or a wrong-axis divide.' },
  ],

  'pylab-cosine-similarity': [
    { ask: 'Why the explicit zero-vector guard - what happens without it?', answer: 'A zero vector has norm 0, so the dot/(na*nb) divides by zero -> NaN (or a RuntimeWarning), not a meaningful similarity. The guard returns 0.0 for "no direction to compare." Without it the function silently emits NaN on a perfectly valid empty/zero input.' },
    { ask: 'Now cosine similarity of one query vector against a whole matrix of rows.', answer: 'Vectorize: normalise each row ("M / np.linalg.norm(M, axis=1, keepdims=True)"), normalise the query, then a single matrix-vector dot gives all similarities at once. Far cheaper than looping the row function n times - and watch the same zero-row guard, now per row.' },
  ],

  // ───────────────────────── python · idioms / core ─────────────────────────

  'pylab-idiom-gen-expr-stream': [
    { ask: 'Why a generator expression and not a list comprehension inside sum?', answer: 'A list comp builds the whole filtered list in memory first; the generator expression yields one value at a time, so sum consumes them lazily with O(1) extra memory. Same answer, but it scales to a stream that would not fit in RAM.' },
    { ask: 'The input is a file you can only iterate ONCE - does this still work?', answer: 'Yes - the generator pulls each line as sum requests it and never rewinds, which is exactly right for a single-pass iterator. A list comp would also consume it once, but it materialises everything; the genexpr is the memory-safe idiom for a one-shot stream.' },
  ],

  'pylab-idiom-counter-topn': [
    { ask: 'Counter.most_common(n) - what order do ties come back in?', answer: 'Ties are broken by FIRST-seen insertion order (Counter is dict-ordered), not by value - so "WARN" and "INFO" tied at 3 return in the order they first appeared. If you need a deterministic tiebreak (e.g. alphabetical), you cannot rely on most_common; sort explicitly with a key.' },
    { ask: 'Make ties break alphabetically by level, most-frequent first otherwise.', answer: 'Sort the items with a compound key: "sorted(Counter(levels).items(), key=lambda kv: (-kv[1], kv[0]))[:n]". The "-count" sorts frequency descending and "kv[0]" breaks ties ascending by name - most_common cannot express the secondary key.' },
    { ask: 'n is much smaller than the number of distinct levels - is most_common still efficient?', answer: 'most_common(n) uses a heap internally - O(d log n) for d distinct items, better than a full O(d log d) sort when n is small. So for top-3 of a million distinct levels, most_common is the right call; a full sorted() would do needless work.' },
  ],

  'pylab-py-two-sum': [
    { ask: 'What is the time and space cost of the hash-map version?', answer: 'O(n) time - one pass, each lookup/insert is O(1) average - and O(n) space for the seen dict. That beats the O(n^2) double loop; the dict trades memory to turn the inner search into a constant-time lookup.' },
    { ask: 'The input is sorted - can you drop the hash map?', answer: 'Yes: two pointers from both ends, move left in if the sum is too small, right in if too big - O(n) time and O(1) space. Sortedness is what lets you decide which pointer to move; you trade the dict\'s memory for the precondition.' },
    { ask: 'What if you must return ALL unique pairs that sum to the target, not just the first?', answer: 'On the sorted two-pointer version, when a pair matches, record it then advance BOTH pointers past their duplicate values so the same pair is not emitted twice. The dedupe-on-skip is the gotcha - without it, repeated values produce repeated pairs.' },
  ],

  'pylab-py-sliding-window': [
    { ask: 'Walk me through why this is O(n) and not O(n^2).', answer: 'Each index is visited by the right pointer once and the left pointer (start) only ever moves forward, never back - so total work is linear, not a rescan per window. The seen dict makes the "is this a repeat, and where" check O(1).' },
    { ask: 'Why "seen[x] >= start" instead of just "x in seen"?', answer: 'A page can be in seen but BEFORE the current window start (already excluded), so plain membership would jump start backward and shrink a valid window incorrectly. The ">= start" guard only reacts to repeats that lie inside the live window - the subtle correctness bug.' },
    { ask: 'Now return the actual longest substring, not just its length.', answer: 'Track the window bounds when you beat best: "if i - start + 1 > best: best = i - start + 1; bi = start". Return "seq[bi:bi+best]". Same O(n) scan - you just remember WHERE the best window was, not only its size.' },
  ],

  'pylab-py-group-anagrams': [
    { ask: 'What is the cost of the sorted-string key, and can you do better?', answer: 'Sorting each tag is O(L log L) per word for length L. A character-count key - a 26-length tuple of letter counts - is O(L), so the whole thing is O(total characters). Same grouping, cheaper key, at the cost of a slightly bulkier key object.' },
    { ask: 'Why use the sorted letters as the dict key rather than the set of letters?', answer: 'A set loses multiplicity - "aab" and "ab" share the same letter set but are not anagrams. The sorted string (or the count tuple) preserves how many of each letter, which is exactly what an anagram requires. Set keys would silently over-merge.' },
  ],

  'pylab-py-first-k-frequent': [
    { ask: 'What does the sort cost, and is it optimal for small k?', answer: 'Building the Counter is O(n); the full sort of d distinct items is O(d log d). For small k, "heapq.nlargest(k, counts.items(), key=...)" is O(d log k) - cheaper. But the heap route makes the tie-break (smaller id first) harder to express than a sort key.' },
    { ask: 'How does the sort key "(-counts[x], x)" enforce "smaller id first on a tie"?', answer: 'The tuple sorts ascending, so "-count" puts the most frequent first, and when counts tie the second element "x" orders ids ascending - smaller id wins. Encoding two rules in one tuple is the idiom; flipping a sign is how you reverse one of them.' },
  ],

  'pylab-py-merge-intervals': [
    { ask: 'Why sort first, and what is the total cost?', answer: 'Sorting by start guarantees any overlap is with the LAST kept interval only, so a single linear pass merges everything - O(n log n) overall, dominated by the sort. Without the sort you would need to compare every pair, O(n^2).' },
    { ask: 'Two bookings that only TOUCH at an endpoint, like [1,3] and [3,5] - merge or not?', answer: 'The prompt says touching counts, so the test is "start <= prev_end" (<=, not <). Use strict "<" and you would leave [1,3] and [3,5] separate. That single comparison operator is the whole edge-case decision.' },
    { ask: 'Now return the total covered length and the largest gap between bookings.', answer: 'After merging, covered length is "sum(e - s for s,e in merged)"; the largest gap is "max(next_start - prev_end)" across consecutive merged spans. Merging first is what makes both one clean pass - on raw overlapping intervals these would double-count.' },
  ],

};

export default pyLabFollowups;

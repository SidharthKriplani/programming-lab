// pyLabBatch_drills1 — migration batch: Python core drills (19 problems) from the
// legacy pythonProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// All topic 'python-core'. Pure-Python problems: return values are bool/int/str/None
// (compare kind 'value') or list/tuple (compare kind 'seq', order matters). Fixtures
// carry an engineered footgun (an exact-boundary value, a tie, a duplicate, an empty edge)
// so the traps actually diverge.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside; \n for newlines; escape PROSE apostrophes as \' ; NO template literals / backticks.
//
// Every solution + method + trap VERIFIED in CPython via pl_compare (see report):
// 8 single-method (empty dial, honesty rule), 11 multi-method (each carries >=1 trap that
// RUNS and DIVERGES). Expected output is NEVER stored - computed from `solve`.

export const fixtures = {
  // first-unique: "a" repeats, "c" is the lone single; a trailing single "d" guards against
  // a count-then-pick-any variant. Answer is "c" (first count==1 in order).
  'fx_first_unique': {
    args: ['events'],
    setup: 'events = ["a", "b", "a", "c", "b", "d"]',
    preview: 'events log in order. "a" and "b" repeat; "c" is the first to appear exactly once (answer), "d" also appears once but later.',
  },
  // two-sum: amounts where the target pair is in the MIDDLE, and the two values that sum
  // to target (2 and 7) sit at indices 1 and 2 - so returning VALUES vs INDICES diverges.
  'fx_two_sum': {
    args: ['nums', 'target'],
    setup: 'nums = [5, 2, 7, 11]\ntarget = 9',
    preview: 'nums, target=9. The pair is 2 (index 1) + 7 (index 2). Answer is indices [1, 2]; returning the values [2, 7] would be a different list.',
  },
  // anagram: a true anagram pair with repeated letters so a count (not a set) is required.
  'fx_anagram': {
    args: ['a', 'b'],
    setup: 'a = "listen"\nb = "silent"',
    preview: 'a, b. "silent" is an anagram of "listen" -> True. Both have the same letters with the same counts.',
  },
  // sliding-window: a repeat that sits BEFORE the current window start ("abba"): when the
  // second "a" is seen, its last index (0) is already left of start (2), so a naive
  // start = last+1 would walk the window backwards. Answer length 2 ("ab").
  'fx_unique_run': {
    args: ['seq'],
    setup: 'seq = "abba"',
    preview: 'seq of page views. Longest run with no repeat is "ab" or "ba" -> length 2. The repeated "a" at index 3 last occurred at index 0, which is BEHIND the window start.',
  },
  // balanced: the classic counter-killer "([)]" - bracket counts balance but the nesting
  // is wrong, so a count-only check passes it falsely. Answer False.
  'fx_balanced': {
    args: ['s'],
    setup: 's = "([)]"',
    preview: 'filter string. Counts of each bracket type balance, but the nesting is wrong -> answer False. A count-only check wrongly returns True.',
  },
  // prefix-sum first-over: cumulative totals 10,30,60,100; target 30 is hit EXACTLY at day 2.
  // ">" must NOT fire on day 2 (equal), only on day 3 where 60 > 30. Answer 3.
  'fx_revenue': {
    args: ['daily', 'target'],
    setup: 'daily = [10, 20, 30, 40]\ntarget = 30',
    preview: 'daily revenue, target=30. Cumulative is 10,30,60,100. Day 2 hits exactly 30 (not strictly over); the running total first EXCEEDS 30 on day 3. Answer 3.',
  },
  // group-anagrams: keys out of input order so a "preserve insertion order" outer-list
  // variant diverges from the required sorted-by-key order. Answer sorted: [[bat],[eat,tea,ate],[tan,nat]].
  'fx_tags': {
    args: ['tags'],
    setup: 'tags = ["tan", "eat", "tea", "ate", "nat", "bat"]',
    preview: 'tag strings. Anagram groups are {tan,nat}, {eat,tea,ate}, {bat}. Required order is sorted by the sorted-letters key -> [[bat],[eat,tea,ate],[tan,nat]], NOT first-seen order.',
  },
  // dup-within-k: the repeated id (1) sits EXACTLY k=3 apart (indices 0 and 3). "<= k" must
  // count it (True); "< k" would miss it. Answer True.
  'fx_dup_k': {
    args: ['ids', 'k'],
    setup: 'ids = [1, 2, 3, 1]\nk = 3',
    preview: 'event ids, k=3. The two 1s are exactly 3 apart -> within k -> True. A strict "< k" check wrongly returns False at this exact boundary.',
  },
  // majority: clear majority element (2 appears 4 of 7). Answer 2.
  'fx_votes': {
    args: ['votes'],
    setup: 'votes = [2, 2, 1, 1, 1, 2, 2]',
    preview: 'votes. 2 appears 4 of 7 times (> half) -> answer 2.',
  },
  // top-k: a TIE in frequency (4 and 5 both appear twice) so a missing tie-break (smaller id
  // first) diverges. Answer for k=2 is [4, 5].
  'fx_events_freq': {
    args: ['events', 'k'],
    setup: 'events = [5, 5, 4, 4, 6]\nk = 2',
    preview: 'event ids, k=2. 4 and 5 both appear twice (a TIE), 6 once. Tie broken by smaller id first -> [4, 5]. Ignoring the tie-break can return [5, 4].',
  },
  // pair-sum-sorted: sorted amounts; pair (2 at idx 1, 7 at idx 3) sums to 9. Answer [1, 3].
  'fx_sorted_ledger': {
    args: ['amounts', 'target'],
    setup: 'amounts = [1, 2, 4, 7, 11]\ntarget = 9',
    preview: 'sorted amounts, target=9. 2 (index 1) + 7 (index 3) = 9 -> answer [1, 3].',
  },
  // dedupe-in-place: a sorted list with runs of duplicates; the answer is (k, first-k values).
  // We return that pair so the comparator sees both the count and the compacted prefix.
  'fx_reading_list': {
    args: ['nums'],
    setup: 'nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]',
    preview: 'sorted list with duplicate runs. Unique values are 0,1,2,3,4 -> k=5 and prefix [0,1,2,3,4]. Answer is the pair (5, [0,1,2,3,4]).',
  },
  // merge-sorted: two ascending lists with a shared value so duplicates must be kept.
  'fx_price_feeds': {
    args: ['a', 'b'],
    setup: 'a = [1, 1, 5]\nb = [1, 2, 6]',
    preview: 'two ascending price lists sharing the value 1. Merged ascending with all duplicates -> [1, 1, 1, 2, 5, 6].',
  },
  // valid-palindrome: noisy string with punctuation and mixed case. Answer True.
  'fx_noisy_str': {
    args: ['s'],
    setup: 's = "A man, a plan, a canal: Panama"',
    preview: 'noisy string. Considering only letters/digits and ignoring case it reads the same forwards and back -> True.',
  },
  // move-zeroes: zeroes interleaved; non-zero order must be preserved. Answer [1,3,12,0,0].
  'fx_sensors': {
    args: ['nums'],
    setup: 'nums = [0, 1, 0, 3, 12]',
    preview: 'sensor readings. Move 0s to the end keeping non-zero order -> [1, 3, 12, 0, 0].',
  },
  // max-water: the widest-area answer (49) is between the height-8 (index 1) and height-7
  // (index 8) walls; a variant that moves the TALLER wall inward collapses to 8. Answer 49.
  'fx_walls': {
    args: ['heights'],
    setup: 'heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
    preview: 'wall heights at unit spacing. Most water two walls hold is 49 (height-8 wall at index 1 and height-7 wall at index 8, seven apart). Moving the taller wall instead of the shorter one misses it.',
  },
  // max-window-sum-short: list shorter than k so the guard must return 0. (A clean-window
  // fixture is not needed: the no-guard trap only diverges on the short-input case.)
  'fx_traffic_short': {
    args: ['counts', 'k'],
    setup: 'counts = [1, 2]\nk = 3',
    preview: 'counts shorter than k=3. No window of length 3 exists -> answer 0. A missing guard would crash or mis-sum.',
  },
  // min-window-len: the WHOLE list sums to exactly the target (1+1+1+1 == 4), so ">=" must
  // accept the equal case. Answer length 4. A strict ">" would return 0.
  'fx_quota': {
    args: ['counts', 'target'],
    setup: 'counts = [1, 1, 1, 1]\ntarget = 4',
    preview: 'positive counts, target=4. The only run reaching the target is the whole list, summing to EXACTLY 4 -> length 4. A strict "> target" check misses the equal case.',
  },
  // longest-k-distinct: a value whose count drops to zero must be removed from the dict or
  // the distinct count stays inflated and the window over-shrinks. "abaccc", k=2 -> 4 ("accc").
  // (The "a" leaving and re-entering is what exposes a never-deleted stale key.)
  'fx_product_views': {
    args: ['seq', 'k'],
    setup: 'seq = "abaccc"\nk = 2',
    preview: 'product views, k=2. Longest span with <= 2 distinct products is "accc" -> length 4. Forgetting to drop a count-zero key keeps the distinct count too high and over-shrinks the window to length 3.',
  },
};

export const problems = [

  // ───────────────────── first-unique · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-first-unique',
    title: 'First non-repeating event',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['hashing', 'frequency'],
    estimatedMin: 4,
    fixtureId: 'fx_first_unique',
    prompt: 'A log lists events in order. Return the first event that appears exactly once in the whole log. If every event repeats, or the log is empty, return None.',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # return the first event that occurs exactly once, else None\n    ...',
    hints: [
      'You need to know how often each event appears before you can pick one - so tally first, decide second.',
      'Once you have the tallies, walk the log in its original order and return the first event whose tally is one.',
    ],
    solution: 'def solve(events):\n    from collections import Counter\n    counts = Counter(events)\n    for e in events:\n        if counts[e] == 1:\n            return e\n    return None',
    compare: { kind: 'value' },
    debrief: 'Answer is "c". One honest shape: tally every event, then scan in original order for the first with tally one. The order of the second scan is what makes "c" win over "d" (both single, but "c" appears first). No judgment fork here - tally-then-scan is the one sane structure - so no method dial: this is a fluency rep.',
    canonicalMethodId: 'count_then_scan',
    methods: [
      { id: 'count_then_scan', name: 'tally, then scan in order', code: 'from collections import Counter\ncounts = Counter(events)\nfor e in events:\n    if counts[e] == 1:\n        return e\nreturn None', tradeoff: 'Two linear passes - one to tally, one to find the first single in original order.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── two-sum · multi-method + values-not-indices trap ─────────────────────
  {
    id: 'pylab-py-two-sum',
    title: 'Two transactions that hit a target',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['hashing'],
    estimatedMin: 6,
    fixtureId: 'fx_two_sum',
    prompt: 'Given a list of amounts and a target, return the positions [i, j] of the first two amounts that add up to the target, or None if no such pair exists.',
    signature: 'solve(nums, target)',
    starterCode: 'def solve(nums, target):\n    # return [i, j] of two amounts summing to target, else None\n    ...',
    hints: [
      'For each amount you only need to know whether the amount that completes it (target minus this one) has already gone by.',
      'Remember each amount you have seen alongside its position, so when its complement turns up you can return both positions.',
    ],
    solution: 'def solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return None',
    compare: { kind: 'seq' },
    debrief: 'Answer is [1, 2] - the positions of 2 and 7. The trap returns the VALUES that pair up ([2, 7]) instead of their positions; it runs, returns a two-element list, and is wrong because the task asked for positions. The tell is the fixture: the values (2, 7) and the indices (1, 2) differ, so a values-return is caught. The honest method tracks each amount with its index and returns the two indices when the complement appears.',
    canonicalMethodId: 'index_map',
    methods: [
      { id: 'index_map', name: 'remember position of each amount', code: 'seen = {}\nfor i, n in enumerate(nums):\n    if target - n in seen:\n        return [seen[target - n], i]\n    seen[n] = i\nreturn None', tradeoff: 'One pass; the dict maps each amount to its index so positions are returned directly.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'return_values', name: 'return the amounts, not their positions', code: 'seen = set()\nfor n in nums:\n    if target - n in seen:\n        return [target - n, n]\n    seen.add(n)\nreturn None', tradeoff: 'Finds the pair correctly but hands back the amounts.', breaksWhen: 'Always wrong when the task wants positions - it returns the two values, which only coincide with the indices by accident.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the second approach return the wrong list?', options: ['index_map', 'return_values'], answerId: 'return_values', explanation: 'It returns the two amounts that sum to the target, but the task asks for their positions. With amounts 2 and 7 at positions 1 and 2, [2, 7] and [1, 2] are different lists - a textbook "runs, wrong".' },
    ],
  },

  // ───────────────────── anagram · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-anagram',
    title: 'Are two tags anagrams?',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['hashing', 'frequency'],
    estimatedMin: 4,
    fixtureId: 'fx_anagram',
    prompt: 'Return True if the second string uses exactly the same characters as the first, each the same number of times, else False.',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # True if b uses the same characters as a, with the same counts\n    ...',
    hints: [
      'Two strings match this way exactly when every character appears the same number of times in both.',
      'Compare the per-character tallies of the two strings directly.',
    ],
    solution: 'def solve(a, b):\n    from collections import Counter\n    return Counter(a) == Counter(b)',
    compare: { kind: 'value' },
    debrief: 'Answer is True. Comparing per-character tallies is the one honest test (sorting both and comparing is a slower path to the identical answer, not a different decision). No runs-but-wrong fork exists here, so no method dial - a fluency rep.',
    canonicalMethodId: 'counter_eq',
    methods: [
      { id: 'counter_eq', name: 'compare character tallies', code: 'from collections import Counter\nreturn Counter(a) == Counter(b)', tradeoff: 'A single linear tally of each string, then one equality check.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── sliding-window · multi-method + backwards-window trap ─────────────────────
  {
    id: 'pylab-py-sliding-window',
    title: 'Longest session with no repeated page',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['window'],
    estimatedMin: 7,
    fixtureId: 'fx_unique_run',
    prompt: 'Given a sequence of page views, return the length of the longest unbroken stretch in which no page is viewed twice.',
    signature: 'solve(seq)',
    starterCode: 'def solve(seq):\n    # length of the longest contiguous run with no repeats\n    ...',
    hints: [
      'Track the start of the current clean stretch and the last position you saw each page.',
      'When a page repeats, the clean stretch can only begin AFTER the page\'s previous position - but never move that start backwards past where it already is.',
    ],
    solution: 'def solve(seq):\n    seen = {}\n    start = 0\n    best = 0\n    for i, x in enumerate(seq):\n        if x in seen and seen[x] >= start:\n            start = seen[x] + 1\n        seen[x] = i\n        best = max(best, i - start + 1)\n    return best',
    compare: { kind: 'value' },
    debrief: 'Answer is 2 (for "abba": "ab" or "ba"). The trap jumps start to seen[x] + 1 on EVERY repeat, even when the previous occurrence is already behind the current start. On "abba", the second "a" (last seen at index 0) drags start back from 2 to 1, double-counting "b" and reporting 3. The guard seen[x] >= start is the tell - only move start forward, never back. The honest method advances start only when the prior occurrence is inside the live window.',
    canonicalMethodId: 'guarded_start',
    methods: [
      { id: 'guarded_start', name: 'only move the start forward', code: 'seen = {}\nstart = 0\nbest = 0\nfor i, x in enumerate(seq):\n    if x in seen and seen[x] >= start:\n        start = seen[x] + 1\n    seen[x] = i\n    best = max(best, i - start + 1)\nreturn best', tradeoff: 'One pass; the start pointer only ever advances, so each position is visited once.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'unguarded_jump', name: 'jump the start on every repeat', code: 'seen = {}\nstart = 0\nbest = 0\nfor i, x in enumerate(seq):\n    if x in seen:\n        start = seen[x] + 1\n    seen[x] = i\n    best = max(best, i - start + 1)\nreturn best', tradeoff: 'Looks right and runs cleanly on simple inputs.', breaksWhen: 'When a repeat\'s previous position is already behind the window start - it drags start backwards and over-counts, as on "abba".', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does jumping the start on every repeat over-count?', options: ['guarded_start', 'unguarded_jump'], answerId: 'unguarded_jump', explanation: 'A page can repeat with its previous sighting already behind the window start. Moving start to that old position + 1 walks it BACKWARDS, re-including characters that were already excluded. Guarding with seen[x] >= start moves start forward only.' },
    ],
  },

  // ───────────────────── balanced · multi-method + counter-only trap ─────────────────────
  {
    id: 'pylab-py-balanced',
    title: 'Validate a nested filter expression',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['stack'],
    estimatedMin: 6,
    fixtureId: 'fx_balanced',
    prompt: 'A filter string uses round, square, and curly brackets. Return True if every opening bracket is closed by one of the same type in the correct nested order, else False.',
    signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # True if all brackets () [] {} are matched and nested correctly\n    ...',
    hints: [
      'When a closing bracket arrives, it must match the most recent still-open bracket - so you need to remember openers in the order they arrived.',
      'Keep the unclosed openers in a last-in-first-out pile; on a closer, the top of the pile must be its partner.',
    ],
    solution: 'def solve(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack',
    compare: { kind: 'value' },
    debrief: 'Answer is False for "([)]". The trap counts brackets by type and checks each count balances - which it does here (one of each), so it wrongly returns True. The tell is the nesting: counts cannot see that ")" closes before "]" when "[" was opened last. A last-in-first-out pile of openers catches it, because the top of the pile (a square bracket) does not match the incoming round closer.',
    canonicalMethodId: 'stack_match',
    methods: [
      { id: 'stack_match', name: 'match against the most recent opener', code: 'pairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nfor ch in s:\n    if ch in "([{":\n        stack.append(ch)\n    elif ch in pairs:\n        if not stack or stack.pop() != pairs[ch]:\n            return False\nreturn not stack', tradeoff: 'One pass; the opener pile encodes nesting order, so order errors are caught.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'count_only', name: 'count each bracket type', code: 'from collections import Counter\nc = Counter(s)\nreturn c["("] == c[")"] and c["["] == c["]"] and c["{"] == c["}"]', tradeoff: 'Compact and runs in one pass.', breaksWhen: 'Whenever brackets are balanced in COUNT but wrongly nested, like "([)]" - counts cannot see ordering.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does counting each bracket type accept "([)]"?', options: ['stack_match', 'count_only'], answerId: 'count_only', explanation: '"([)]" has exactly one of each bracket, so all the counts balance and the count check returns True. But ")" closes while "[" is still the innermost open bracket - a nesting error only an ordered structure (the opener pile) can detect.' },
    ],
  },

  // ───────────────────── prefix-sum first-over · multi-method + boundary (>= vs >) trap ─────────────────────
  {
    id: 'pylab-py-prefix-sum',
    title: 'Day revenue first crosses target',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['running-total'],
    estimatedMin: 5,
    fixtureId: 'fx_revenue',
    prompt: 'Given daily revenue and a target, return the 1-based day on which the running total to date first goes ABOVE the target, or -1 if it never does. Reaching the target exactly does not count - it must be strictly over.',
    signature: 'solve(daily, target)',
    starterCode: 'def solve(daily, target):\n    # 1-based day the cumulative total first exceeds target, else -1\n    ...',
    hints: [
      'Carry a running total as you walk the days; you never need to re-add earlier days.',
      'Watch the comparison: the day the total only equals the target is not yet over it.',
    ],
    solution: 'def solve(daily, target):\n    total = 0\n    for i, x in enumerate(daily):\n        total += x\n        if total > target:\n            return i + 1\n    return -1',
    compare: { kind: 'value' },
    debrief: 'Answer is 3. The cumulative total hits exactly 30 on day 2 and 60 on day 3. The trap uses >= instead of >, so it fires on day 2 where the total equals the target and returns 2 - one day early. The fixture target sits exactly on a cumulative value, which is the tell. The honest method uses a strict > so an exact tie does not count as "over".',
    canonicalMethodId: 'strict_over',
    methods: [
      { id: 'strict_over', name: 'strictly greater than target', code: 'total = 0\nfor i, x in enumerate(daily):\n    total += x\n    if total > target:\n        return i + 1\nreturn -1', tradeoff: 'One running-total pass with the correct strict comparison.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'at_or_over', name: 'greater than OR equal to target', code: 'total = 0\nfor i, x in enumerate(daily):\n    total += x\n    if total >= target:\n        return i + 1\nreturn -1', tradeoff: 'Identical except for one character; runs fine.', breaksWhen: 'When a cumulative total lands exactly on the target - it returns that day even though "exceeds" means strictly over.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the >= version return the wrong day?', options: ['strict_over', 'at_or_over'], answerId: 'at_or_over', explanation: 'On day 2 the cumulative total equals the target exactly. "Exceeds" means strictly greater, so day 2 should not count - but >= accepts the equal case and returns 2 instead of 3.' },
    ],
  },

  // ───────────────────── group-anagrams · multi-method + insertion-order trap ─────────────────────
  {
    id: 'pylab-py-group-anagrams',
    title: 'Group anagram tags',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['hashing'],
    estimatedMin: 7,
    fixtureId: 'fx_tags',
    prompt: 'Given a list of tag strings, gather the ones built from the same letters into groups. Return a list of groups - each group a list keeping the tags in their original input order - and order the groups themselves alphabetically by the group\'s sorted-letters signature.',
    signature: 'solve(tags)',
    starterCode: 'def solve(tags):\n    # return list of groups; outer list ordered by the sorted-letters signature\n    ...',
    hints: [
      'Two tags belong together exactly when their letters, sorted, are identical - that sorted-letters string is a shared signature.',
      'Bucket tags by their signature, then emit the buckets in alphabetical order of the signature, not the order they were first seen.',
    ],
    solution: 'def solve(tags):\n    from collections import defaultdict\n    buckets = defaultdict(list)\n    for t in tags:\n        key = "".join(sorted(t))\n        buckets[key].append(t)\n    return [buckets[k] for k in sorted(buckets)]',
    compare: { kind: 'seq' },
    debrief: 'Answer is [["bat"], ["eat", "tea", "ate"], ["tan", "nat"]] - groups ordered by signature ("abt" < "aet" < "ant"). The trap emits buckets in first-seen order instead of sorted order; on this input "tan" appears first, so it returns [["tan","nat"], ["eat","tea","ate"], ["bat"]] - same groups, wrong outer order. The tell is that the input is NOT pre-sorted by signature. The honest method sorts the bucket keys before emitting.',
    canonicalMethodId: 'sorted_keys',
    methods: [
      { id: 'sorted_keys', name: 'emit buckets in signature order', code: 'from collections import defaultdict\nbuckets = defaultdict(list)\nfor t in tags:\n    key = "".join(sorted(t))\n    buckets[key].append(t)\nreturn [buckets[k] for k in sorted(buckets)]', tradeoff: 'Buckets by signature, then orders the output by the signature as required.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'insertion_order', name: 'emit buckets as first seen', code: 'from collections import defaultdict\nbuckets = defaultdict(list)\nfor t in tags:\n    key = "".join(sorted(t))\n    buckets[key].append(t)\nreturn list(buckets.values())', tradeoff: 'Forms the right groups and runs.', breaksWhen: 'Whenever the input is not already in signature order - the outer list comes out in first-seen order, not sorted.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does emitting buckets in first-seen order fail?', options: ['sorted_keys', 'insertion_order'], answerId: 'insertion_order', explanation: 'The task requires the groups ordered alphabetically by their sorted-letters signature. A dict preserves insertion order, so values() comes out in first-seen order - here led by "tan" - not the required signature order led by "bat".' },
    ],
  },

  // ───────────────────── dup-within-k · multi-method + boundary (<= vs <) trap ─────────────────────
  {
    id: 'pylab-py-dup-within-k',
    title: 'Duplicate alert within k events',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['hashing'],
    estimatedMin: 6,
    fixtureId: 'fx_dup_k',
    prompt: 'Given an event stream and a distance k, return True if the same event id appears twice no more than k positions apart, else False.',
    signature: 'solve(ids, k)',
    starterCode: 'def solve(ids, k):\n    # True if any value repeats within k positions\n    ...',
    hints: [
      'For each id you only care about the most recent position you saw it.',
      'When an id reappears, compare the gap to k - mind whether a gap of exactly k counts.',
    ],
    solution: 'def solve(ids, k):\n    last = {}\n    for i, v in enumerate(ids):\n        if v in last and i - last[v] <= k:\n            return True\n        last[v] = i\n    return False',
    compare: { kind: 'value' },
    debrief: 'Answer is True. The two 1s sit at positions 0 and 3 - exactly k=3 apart. The trap uses a strict < k, so a gap of exactly k fails the check and it returns False. The fixture places the duplicate ON the boundary, which is the tell. The honest method uses <= k so a gap of exactly k still counts as "within k".',
    canonicalMethodId: 'inclusive_gap',
    methods: [
      { id: 'inclusive_gap', name: 'gap at most k (inclusive)', code: 'last = {}\nfor i, v in enumerate(ids):\n    if v in last and i - last[v] <= k:\n        return True\n    last[v] = i\nreturn False', tradeoff: 'One pass tracking the last index per id, with the inclusive comparison the task wants.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'strict_gap', name: 'gap strictly less than k', code: 'last = {}\nfor i, v in enumerate(ids):\n    if v in last and i - last[v] < k:\n        return True\n    last[v] = i\nreturn False', tradeoff: 'One character off; runs identically on most inputs.', breaksWhen: 'When the nearest duplicate is exactly k apart - "within k" includes k, but < k excludes it, so it returns False.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the strict < k check miss this duplicate?', options: ['inclusive_gap', 'strict_gap'], answerId: 'strict_gap', explanation: 'The duplicate is exactly k positions apart. "Within k positions" includes a gap of k, so the comparison must be <= k. A strict < k excludes the boundary and wrongly returns False.' },
    ],
  },

  // ───────────────────── majority · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-majority-element',
    title: 'Majority vote winner',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['hashing', 'frequency'],
    estimatedMin: 4,
    fixtureId: 'fx_votes',
    prompt: 'Given a list of votes, return the value that appears more than half the time. Assume one always exists.',
    signature: 'solve(votes)',
    starterCode: 'def solve(votes):\n    # return the value appearing more than half the time\n    ...',
    hints: [
      'Tally how often each value appears.',
      'The answer is simply the value with the highest tally.',
    ],
    solution: 'def solve(votes):\n    from collections import Counter\n    return Counter(votes).most_common(1)[0][0]',
    compare: { kind: 'value' },
    debrief: 'Answer is 2. Tally the votes and return the most common value - the one honest, readable shape. A constant-space voting algorithm reaches the same answer but is a performance refinement, not a different decision, so no method dial: a fluency rep.',
    canonicalMethodId: 'counter_top',
    methods: [
      { id: 'counter_top', name: 'tally, take the most common', code: 'from collections import Counter\nreturn Counter(votes).most_common(1)[0][0]', tradeoff: 'A single linear tally, then read off the top entry.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── top-k · multi-method + missing-tiebreak trap ─────────────────────
  {
    id: 'pylab-py-first-k-frequent',
    title: 'Top k events by volume',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['hashing'],
    estimatedMin: 7,
    fixtureId: 'fx_events_freq',
    prompt: 'Given an event log and a number k, return the k event ids that occur most often, ordered from most frequent to least. When two ids tie on frequency, the smaller id comes first.',
    signature: 'solve(events, k)',
    starterCode: 'def solve(events, k):\n    # return the k most frequent ids; ties broken by smaller id first\n    ...',
    hints: [
      'Tally each id, then order the distinct ids by how often they occur.',
      'A tie on frequency needs a second sort key - the id itself, ascending - so the ordering is fully determined.',
    ],
    solution: 'def solve(events, k):\n    from collections import Counter\n    counts = Counter(events)\n    ranked = sorted(counts, key=lambda x: (-counts[x], x))\n    return ranked[:k]',
    compare: { kind: 'seq' },
    debrief: 'Answer is [4, 5]. Ids 4 and 5 both appear twice - a tie. The trap sorts on frequency alone, leaving the tie to be broken by whatever order the tally happened to land in; here 5 was seen first, so it returns [5, 4]. The fixture\'s deliberate frequency tie is the tell. The honest method sorts by (-count, id) so the smaller id wins a tie.',
    canonicalMethodId: 'freq_then_id',
    methods: [
      { id: 'freq_then_id', name: 'sort by frequency, then id', code: 'from collections import Counter\ncounts = Counter(events)\nranked = sorted(counts, key=lambda x: (-counts[x], x))\nreturn ranked[:k]', tradeoff: 'A two-key sort makes the order fully determined - frequency first, id as the tiebreak.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'freq_only', name: 'sort by frequency only', code: 'from collections import Counter\ncounts = Counter(events)\nranked = sorted(counts, key=lambda x: -counts[x])\nreturn ranked[:k]', tradeoff: 'Returns the right ids and runs.', breaksWhen: 'When two ids tie on frequency - the order between them is left to chance, so it can return them in the wrong order.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can sorting by frequency alone return the wrong order?', options: ['freq_then_id', 'freq_only'], answerId: 'freq_only', explanation: 'Ids 4 and 5 both appear twice. With only frequency as the key, their relative order is whatever the underlying sort/tally happened to produce - here [5, 4]. The task fixes ties by smaller id first, which needs id as a second sort key.' },
    ],
  },

  // ───────────────────── pair-sum-sorted · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-pair-sum-sorted',
    title: 'Pair sum in a sorted ledger',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['two-pointers'],
    estimatedMin: 5,
    fixtureId: 'fx_sorted_ledger',
    prompt: 'Given a list of amounts already sorted from smallest to largest and a target, return the two positions [i, j] (with i before j) of the amounts that add up to the target, or None.',
    signature: 'solve(amounts, target)',
    starterCode: 'def solve(amounts, target):\n    # return [i, j] of two amounts summing to target, else None\n    ...',
    hints: [
      'Because the list is sorted, you can start with the smallest and largest and squeeze inward.',
      'If the current pair sums too low, the smaller end must move up; too high, the larger end must move down.',
    ],
    solution: 'def solve(amounts, target):\n    lo, hi = 0, len(amounts) - 1\n    while lo < hi:\n        s = amounts[lo] + amounts[hi]\n        if s == target:\n            return [lo, hi]\n        if s < target:\n            lo += 1\n        else:\n            hi -= 1\n    return None',
    compare: { kind: 'seq' },
    debrief: 'Answer is [1, 3]. With the list sorted, squeezing two pointers inward from the ends is the one natural shape - too-low moves the low end up, too-high moves the high end down. A dictionary scan reaches the same answer using extra memory, but it is not a runs-but-wrong alternative, so no method dial: a fluency rep.',
    canonicalMethodId: 'two_pointer',
    methods: [
      { id: 'two_pointer', name: 'squeeze from both ends', code: 'lo, hi = 0, len(amounts) - 1\nwhile lo < hi:\n    s = amounts[lo] + amounts[hi]\n    if s == target:\n        return [lo, hi]\n    if s < target:\n        lo += 1\n    else:\n        hi -= 1\nreturn None', tradeoff: 'One pass inward with no extra memory, exploiting the sorted order.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── dedupe-in-place · single-method (empty dial) ─────────────────────
  // HONESTY NOTE: on a SORTED list the only sane in-place dedup is a trailing write pointer.
  // The plausible "compare to nums[r-1]" variant does NOT diverge here - because the list is
  // sorted, duplicates are adjacent and the read pointer always trails its own prior read, so
  // overwrites never corrupt the comparison. There is no runs-but-wrong fork to ship.
  {
    id: 'pylab-py-remove-duplicates',
    title: 'Compact a sorted reading list',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['two-pointers'],
    estimatedMin: 6,
    fixtureId: 'fx_reading_list',
    prompt: 'Given a sorted list, rewrite it in place so each value appears once, and return both the count of unique values and those values in order. (Return the pair (count, list-of-unique-values).)',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # rewrite nums so each value appears once; return (count, unique values in order)\n    ...',
    hints: [
      'Keep a write position for the next slot that should hold a new value, trailing behind a read position scanning ahead.',
      'Because the list is sorted, a value is new exactly when it differs from the one just before it - advance the write pointer only then.',
    ],
    solution: 'def solve(nums):\n    if not nums:\n        return (0, [])\n    w = 1\n    for r in range(1, len(nums)):\n        if nums[r] != nums[w - 1]:\n            nums[w] = nums[r]\n            w += 1\n    return (w, nums[:w])',
    compare: { kind: 'seq' },
    debrief: 'Answer is (5, [0, 1, 2, 3, 4]). A trailing write pointer that advances only on a new value is the one honest in-place shape. Because the list is sorted, duplicates are adjacent, so there is no runs-but-wrong fork here - comparing against the previous element and against the last kept value give the identical result. No method dial: a fluency rep.',
    canonicalMethodId: 'write_pointer',
    methods: [
      { id: 'write_pointer', name: 'trailing write pointer', code: 'if not nums:\n    return (0, [])\nw = 1\nfor r in range(1, len(nums)):\n    if nums[r] != nums[w - 1]:\n        nums[w] = nums[r]\n        w += 1\nreturn (w, nums[:w])', tradeoff: 'One in-place pass; the write pointer advances only when a new value appears.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── merge-sorted · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-merge-sorted',
    title: 'Merge two sorted price feeds',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['two-pointers'],
    estimatedMin: 5,
    fixtureId: 'fx_price_feeds',
    prompt: 'Given two lists each already sorted from smallest to largest, return a single sorted list containing every value from both (keeping duplicates).',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # merge two sorted lists into one sorted list\n    ...',
    hints: [
      'Walk both lists at once, each with its own position, and always take the smaller of the two current heads.',
      'When one list runs out, append whatever remains of the other.',
    ],
    solution: 'def solve(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    out.extend(a[i:])\n    out.extend(b[j:])\n    return out',
    compare: { kind: 'seq' },
    debrief: 'Answer is [1, 1, 1, 2, 5, 6]. Walking both lists and emitting the smaller head is the one natural linear merge. Concatenating and re-sorting reaches the same list with more work, but it is not a runs-but-wrong fork, so no method dial: a fluency rep.',
    canonicalMethodId: 'two_pointer_merge',
    methods: [
      { id: 'two_pointer_merge', name: 'take the smaller head', code: 'i = j = 0\nout = []\nwhile i < len(a) and j < len(b):\n    if a[i] <= b[j]:\n        out.append(a[i]); i += 1\n    else:\n        out.append(b[j]); j += 1\nout.extend(a[i:])\nout.extend(b[j:])\nreturn out', tradeoff: 'A single linear pass over both lists, draining the leftover at the end.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── valid-palindrome · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-valid-palindrome',
    title: 'Palindrome check on a noisy string',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['two-pointers'],
    estimatedMin: 5,
    fixtureId: 'fx_noisy_str',
    prompt: 'Return True if the string reads the same forwards and backwards when you ignore case and consider only letters and digits, else False.',
    signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # letters-and-digits-only, case-insensitive palindrome check\n    ...',
    hints: [
      'Compare from both ends inward, skipping any character that is not a letter or digit.',
      'Lowercase the two characters before comparing so case does not matter.',
    ],
    solution: 'def solve(s):\n    lo, hi = 0, len(s) - 1\n    while lo < hi:\n        while lo < hi and not s[lo].isalnum():\n            lo += 1\n        while lo < hi and not s[hi].isalnum():\n            hi -= 1\n        if s[lo].lower() != s[hi].lower():\n            return False\n        lo += 1; hi -= 1\n    return True',
    compare: { kind: 'value' },
    debrief: 'Answer is True. Marching two pointers inward while skipping non-alphanumeric characters and lowercasing is the one honest approach. Filtering into a cleaned string and reversing it reaches the same answer with extra allocations, not a different decision, so no method dial: a fluency rep.',
    canonicalMethodId: 'two_pointer_skip',
    methods: [
      { id: 'two_pointer_skip', name: 'compare inward, skipping junk', code: 'lo, hi = 0, len(s) - 1\nwhile lo < hi:\n    while lo < hi and not s[lo].isalnum():\n        lo += 1\n    while lo < hi and not s[hi].isalnum():\n        hi -= 1\n    if s[lo].lower() != s[hi].lower():\n        return False\n    lo += 1; hi -= 1\nreturn True', tradeoff: 'One inward pass, skipping non-alphanumeric characters and comparing case-folded.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── move-zeroes · single-method (empty dial) ─────────────────────
  {
    id: 'pylab-py-move-zeroes',
    title: 'Push idle sensors to the end',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['two-pointers'],
    estimatedMin: 5,
    fixtureId: 'fx_sensors',
    prompt: 'Given a list, move every zero to the end while keeping the non-zero values in their original relative order. Rewrite the list in place and return it.',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # move all 0s to the end in place; keep non-zero order; return nums\n    ...',
    hints: [
      'Keep a write position for the next slot that should hold a non-zero value.',
      'Each time you meet a non-zero value, swap it forward into the write slot and advance that slot.',
    ],
    solution: 'def solve(nums):\n    w = 0\n    for r in range(len(nums)):\n        if nums[r] != 0:\n            nums[w], nums[r] = nums[r], nums[w]\n            w += 1\n    return nums',
    compare: { kind: 'seq' },
    debrief: 'Answer is [1, 3, 12, 0, 0]. Swapping each non-zero forward into a write slot leaves the zeroes trailing in order - the one stable in-place shape. Building a new list of non-zeros then padding zeroes reaches the same result with extra memory, not a runs-but-wrong fork, so no method dial: a fluency rep.',
    canonicalMethodId: 'swap_forward',
    methods: [
      { id: 'swap_forward', name: 'swap non-zeros into the write slot', code: 'w = 0\nfor r in range(len(nums)):\n    if nums[r] != 0:\n        nums[w], nums[r] = nums[r], nums[w]\n        w += 1\nreturn nums', tradeoff: 'One pass, in place, preserving non-zero order with no extra list.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── max-water · multi-method + wrong-pointer-move trap ─────────────────────
  {
    id: 'pylab-py-max-water',
    title: 'Widest reservoir between two walls',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['two-pointers'],
    estimatedMin: 7,
    fixtureId: 'fx_walls',
    prompt: 'Given wall heights at unit spacing, return the most water any two walls can hold between them. The water held by two walls is the shorter wall\'s height times the distance between them.',
    signature: 'solve(heights)',
    starterCode: 'def solve(heights):\n    # max water held between any two walls\n    ...',
    hints: [
      'Start with the widest possible gap - the two outermost walls - and work inward.',
      'Moving the taller wall inward can never help, since the shorter wall caps the water; move the shorter one.',
    ],
    solution: 'def solve(heights):\n    lo, hi = 0, len(heights) - 1\n    best = 0\n    while lo < hi:\n        area = min(heights[lo], heights[hi]) * (hi - lo)\n        best = max(best, area)\n        if heights[lo] < heights[hi]:\n            lo += 1\n        else:\n            hi -= 1\n    return best',
    compare: { kind: 'value' },
    debrief: 'Answer is 49 (the height-8 wall at index 1 and the height-7 wall at index 8). The trap moves the TALLER wall inward instead of the shorter one. Since the water is capped by the shorter wall, abandoning a tall wall throws away the only side that could grow the area; the trap collapses inward along the short walls and reports just 8. The tell is the large gap between the two outer-ish tall walls. The honest method always moves whichever wall is shorter, keeping the taller one in play.',
    canonicalMethodId: 'move_shorter',
    methods: [
      { id: 'move_shorter', name: 'move the shorter wall inward', code: 'lo, hi = 0, len(heights) - 1\nbest = 0\nwhile lo < hi:\n    area = min(heights[lo], heights[hi]) * (hi - lo)\n    best = max(best, area)\n    if heights[lo] < heights[hi]:\n        lo += 1\n    else:\n        hi -= 1\nreturn best', tradeoff: 'One inward pass; moving the shorter wall is the only move that can raise the capped height.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'move_taller', name: 'move the taller wall inward', code: 'lo, hi = 0, len(heights) - 1\nbest = 0\nwhile lo < hi:\n    area = min(heights[lo], heights[hi]) * (hi - lo)\n    best = max(best, area)\n    if heights[lo] < heights[hi]:\n        hi -= 1\n    else:\n        lo += 1\nreturn best', tradeoff: 'Same shape, one comparison flipped; runs cleanly.', breaksWhen: 'Always wrong - moving the taller wall discards the side that could still raise the area, so it walks past the best pair and under-reports (8 instead of 49 here).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does moving the taller wall return the wrong area?', options: ['move_shorter', 'move_taller'], answerId: 'move_taller', explanation: 'The water height is capped by the SHORTER wall, so the shorter wall is the limiting side and must move to have any chance of improvement. Moving the taller wall keeps the same short cap while losing width, so it can never beat the current pair and it sweeps past the true best.' },
    ],
  },

  // ───────────────────── max-window-sum · multi-method + missing-short-guard trap ─────────────────────
  {
    id: 'pylab-py-max-window-sum',
    title: 'Best k-minute traffic burst',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['window'],
    estimatedMin: 6,
    fixtureId: 'fx_traffic_short',
    prompt: 'Given per-minute request counts and a window length k, return the largest total over any k consecutive minutes. If there are fewer than k minutes of data, return 0.',
    signature: 'solve(counts, k)',
    starterCode: 'def solve(counts, k):\n    # max sum of any k consecutive entries; 0 if fewer than k entries\n    ...',
    hints: [
      'Keep a running total for the current k-minute span; as it slides, add the entering minute and drop the leaving one.',
      'Handle the case where there are fewer than k minutes before you start sliding - no window of length k exists, so the answer is 0.',
    ],
    solution: 'def solve(counts, k):\n    if k <= 0 or len(counts) < k:\n        return 0\n    window = sum(counts[:k])\n    best = window\n    for i in range(k, len(counts)):\n        window += counts[i] - counts[i - k]\n        best = max(best, window)\n    return best',
    compare: { kind: 'value' },
    debrief: 'Answer is 0 - there are only 2 minutes of data but k=3, so no window of length 3 exists. The trap omits the "fewer than k minutes" guard: it computes sum(counts[:k]), and because slicing past the end does not error, counts[:3] silently returns the whole 2-element list and its total (3) comes back instead of 0. The short-input fixture is the tell. The honest method checks len(counts) < k up front and returns 0.',
    canonicalMethodId: 'guarded_slide',
    methods: [
      { id: 'guarded_slide', name: 'guard short input, then slide', code: 'if k <= 0 or len(counts) < k:\n    return 0\nwindow = sum(counts[:k])\nbest = window\nfor i in range(k, len(counts)):\n    window += counts[i] - counts[i - k]\n    best = max(best, window)\nreturn best', tradeoff: 'Constant-work slide after an explicit guard for the too-short case.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'no_guard', name: 'slide without the short-input guard', code: 'window = sum(counts[:k])\nbest = window\nfor i in range(k, len(counts)):\n    window += counts[i] - counts[i - k]\n    best = max(best, window)\nreturn best', tradeoff: 'Works whenever there are at least k minutes of data.', breaksWhen: 'When the list is shorter than k - counts[:k] silently yields the whole short list and its sum is returned instead of 0.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the unguarded slide return the wrong value on a short list?', options: ['guarded_slide', 'no_guard'], answerId: 'no_guard', explanation: 'With fewer than k entries, counts[:k] just returns the whole short list (slicing does not error). Summing it gives a positive total, but no window of length k exists, so the answer should be 0. The guard catches this before the slide.' },
    ],
  },

  // ───────────────────── min-window-len · multi-method + boundary (>= vs >) trap ─────────────────────
  {
    id: 'pylab-py-min-window-len',
    title: 'Shortest run hitting a quota',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['window'],
    estimatedMin: 7,
    fixtureId: 'fx_quota',
    prompt: 'Given a list of positive counts and a target, return the length of the shortest unbroken run whose total is at least the target, or 0 if no run reaches it. Reaching the target exactly still counts.',
    signature: 'solve(counts, target)',
    starterCode: 'def solve(counts, target):\n    # shortest contiguous run summing to at least target; 0 if none\n    ...',
    hints: [
      'Grow a run on the right until its total reaches the target, then trim from the left as far as it still qualifies.',
      'Mind the comparison: a run summing to exactly the target qualifies.',
    ],
    solution: 'def solve(counts, target):\n    lo = 0\n    total = 0\n    best = float("inf")\n    for hi in range(len(counts)):\n        total += counts[hi]\n        while total >= target:\n            best = min(best, hi - lo + 1)\n            total -= counts[lo]\n            lo += 1\n    return 0 if best == float("inf") else best',
    compare: { kind: 'value' },
    debrief: 'Answer is 4. The whole list sums to exactly the target (1+1+1+1 = 4), so the only qualifying run is the full list. The trap uses a strict > target, so a run that equals the target never qualifies and it returns 0. The fixture makes the only valid run land exactly on the target, which is the tell. The honest method uses >= so the exact-target case counts.',
    canonicalMethodId: 'at_least',
    methods: [
      { id: 'at_least', name: 'qualify at total >= target', code: 'lo = 0\ntotal = 0\nbest = float("inf")\nfor hi in range(len(counts)):\n    total += counts[hi]\n    while total >= target:\n        best = min(best, hi - lo + 1)\n        total -= counts[lo]\n        lo += 1\nreturn 0 if best == float("inf") else best', tradeoff: 'Grow-then-shrink with the inclusive comparison the task wants.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'strict_over', name: 'qualify only at total > target', code: 'lo = 0\ntotal = 0\nbest = float("inf")\nfor hi in range(len(counts)):\n    total += counts[hi]\n    while total > target:\n        best = min(best, hi - lo + 1)\n        total -= counts[lo]\n        lo += 1\nreturn 0 if best == float("inf") else best', tradeoff: 'One character off; runs the same on inputs that overshoot the target.', breaksWhen: 'When the only qualifying run sums to exactly the target - a strict > never accepts it, so it wrongly returns 0.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the strict > version return 0 here?', options: ['at_least', 'strict_over'], answerId: 'strict_over', explanation: 'The whole list sums to exactly the target and no run sums higher. "At least the target" includes the equal case, so the comparison must be >=. A strict > never qualifies the exact-target run, so best stays infinite and the function returns 0.' },
    ],
  },

  // ───────────────────── longest-k-distinct · multi-method + stale-key trap ─────────────────────
  {
    id: 'pylab-py-longest-k-distinct',
    title: 'Longest span with at most k products',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['window'],
    estimatedMin: 8,
    fixtureId: 'fx_product_views',
    prompt: 'Given a sequence of product views and a number k, return the length of the longest unbroken span that contains no more than k distinct products.',
    signature: 'solve(seq, k)',
    starterCode: 'def solve(seq, k):\n    # longest contiguous span with at most k distinct values\n    ...',
    hints: [
      'Track how many of each product sit in the current span; the number of distinct products is how many have a non-zero count.',
      'When the distinct count exceeds k, shrink from the left - and be careful how you measure "distinct" as counts fall to zero.',
    ],
    solution: 'def solve(seq, k):\n    from collections import defaultdict\n    if k <= 0:\n        return 0\n    counts = defaultdict(int)\n    lo = 0\n    best = 0\n    for hi, x in enumerate(seq):\n        counts[x] += 1\n        while len(counts) > k:\n            counts[seq[lo]] -= 1\n            if counts[seq[lo]] == 0:\n                del counts[seq[lo]]\n            lo += 1\n        best = max(best, hi - lo + 1)\n    return best',
    compare: { kind: 'value' },
    debrief: 'Answer is 4 (for "abaccc", k=2: the span "accc"). The trap decrements a product\'s count when shrinking but never removes the key once it hits zero, so len(counts) keeps counting products that have already left the span. When the leading "a" is pushed out, its stale key keeps the distinct count at 2 (then 3 as "c" arrives), forcing the window to over-shrink; it reports 3 instead of 4. The tell is a product ("a") whose count returns to zero and then matters again as the window slides. The honest method deletes any key whose count reaches zero so len(counts) stays the true distinct count.',
    canonicalMethodId: 'delete_zero',
    methods: [
      { id: 'delete_zero', name: 'drop a key when its count hits zero', code: 'from collections import defaultdict\nif k <= 0:\n    return 0\ncounts = defaultdict(int)\nlo = 0\nbest = 0\nfor hi, x in enumerate(seq):\n    counts[x] += 1\n    while len(counts) > k:\n        counts[seq[lo]] -= 1\n        if counts[seq[lo]] == 0:\n            del counts[seq[lo]]\n        lo += 1\n    best = max(best, hi - lo + 1)\nreturn best', tradeoff: 'Deleting zero-count keys keeps len(counts) equal to the true distinct count in the window.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'keep_zero', name: 'decrement but never delete', code: 'from collections import defaultdict\nif k <= 0:\n    return 0\ncounts = defaultdict(int)\nlo = 0\nbest = 0\nfor hi, x in enumerate(seq):\n    counts[x] += 1\n    while len(counts) > k and lo < hi:\n        counts[seq[lo]] -= 1\n        lo += 1\n    best = max(best, hi - lo + 1)\nreturn best', tradeoff: 'Looks almost identical and runs without error.', breaksWhen: 'When a product leaves the window its key lingers with a zero count, so len(counts) overstates the distinct count and the window over-shrinks - reporting a span shorter than the true longest.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does never deleting zero-count keys shorten the reported span?', options: ['delete_zero', 'keep_zero'], answerId: 'keep_zero', explanation: 'len(counts) is used as the number of distinct products in the window. If a product\'s count falls to zero but its key stays in the dict, len(counts) still counts it - so the window is treated as having more distinct products than it really does, the shrink loop runs too far, and the measured span comes out shorter than the true longest.' },
    ],
  },

];

export default problems;

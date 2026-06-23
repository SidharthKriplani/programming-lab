// pyLabBatch_drills2 — migration batch: Python algorithm drills (19 problems) from the
// legacy pythonProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// Source patterns: sliding-window, prefix-sum, stack, binary-search, heap, intervals.
// All map to topic 'python-core' (spec-constrained; no invented topics). Prompts are
// DE-JARGONED — they state the business task and never name the technique (binary search,
// prefix sum, monotonic stack, heap, sliding window...), which the content gate enforces.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside; \n for newlines; escape PROSE apostrophes as \' ; NO template literals / backticks.
//
// Every solution + method + trap VERIFIED in CPython (3.x) via scripts/pl_compare.py:
//   8 single-method (empty dial, honesty rule) ; 11 multi-method (each carries >=1 trap
//   that RUNS and DIVERGES — an off-by-one, wrong comparison, float rounding, or unsorted
//   input). Expected output is NEVER stored — it is computed from `solve`.
//
// Trap honesty: these are mostly single-VALID-method problems with one runs-but-wrong
// variant. A trap is not a second valid approach, so those carry an EMPTY dial / no MCQs
// (the off-by-one is wrong, not a judgment fork). Only py-merge-intervals carries two
// distinct traps; none of the drills has two genuinely-correct competing methods, so no
// dial cites a cost trade-off here.

export const fixtures = {
  // sliding window: a clear dense stretch ("iii" inside abciiidef) so the count slides up to 3.
  'fx_vowel_string': {
    args: ['s', 'k'],
    setup: 's = "abciiidef"\nk = 3',
    preview: 's = "abciiidef", k = 3. The window "iii" holds 3 vowels — the densest length-3 stretch.',
  },
  // running peak: rises then a late spike (9) so the carried maximum is exercised both ways.
  'fx_readings': {
    args: ['readings'],
    setup: 'readings = [3, 1, 4, 1, 5, 9, 2]',
    preview: 'readings = [3,1,4,1,5,9,2]. Running maxima: [3,3,4,4,5,9,9].',
  },
  // count-to-target: a prefix that itself equals k from index 0 — so dropping the seed (the
  // "empty prefix has been seen once" base case) silently misses subarrays starting at index 0.
  'fx_nums_target': {
    args: ['nums', 'k'],
    setup: 'nums = [1, 1, 1]\nk = 2',
    preview: 'nums = [1,1,1], k = 2. Two windows sum to 2: [0..1] and [1..2]. The base-case seed matters here.',
  },
  // balance point: the equilibrium sits in the MIDDLE (index 3) where left sum 17 == right sum 17.
  'fx_ledger': {
    args: ['nums'],
    setup: 'nums = [1, 7, 3, 6, 5, 6]',
    preview: 'nums = [1,7,3,6,5,6]. At index 3, the left total 1+7+3 = 11 equals the right total 5+6 = 11. Balance point is index 3.',
  },
  // repeated range totals: overlapping inclusive queries against a small list.
  'fx_nums_queries': {
    args: ['nums', 'queries'],
    setup: 'nums = [1, 2, 3, 4, 5]\nqueries = [(0, 2), (1, 3), (4, 4)]',
    preview: 'nums = [1,2,3,4,5]; inclusive range totals for (0,2),(1,3),(4,4) are [6,9,5].',
  },
  // days-until-warmer: a FLAT pair (74,74) so a strict-vs-nonstrict comparison diverges on the equal day.
  'fx_temps_flat': {
    args: ['temps'],
    setup: 'temps = [73, 74, 74, 71, 76]',
    preview: 'temps = [73,74,74,71,76]. Two equal 74s in a row — an equal day is NOT warmer, so it must not resolve a wait.',
  },
  // next-greater: an EQUAL-value pair (2,2) so treating "equal" as "greater" diverges.
  'fx_prices_equal': {
    args: ['prices'],
    setup: 'prices = [2, 2, 4, 3]',
    preview: 'prices = [2,2,4,3]. The first 2 must look PAST the equal 2 to the 4 — equal is not strictly greater.',
  },
  // reverse-Polish: a NEGATIVE division (4 / -3) so truncate-toward-zero vs floor diverges.
  'fx_rpn_neg': {
    args: ['tokens'],
    setup: 'tokens = ["10", "6", "-", "-3", "/"]',
    preview: 'tokens evaluate 10 6 - = 4, then 4 / -3. Truncate-toward-zero gives -1; floored division gives -2.',
  },
  // search-sorted: the target is the LAST element (9, the exact upper boundary) so an off-by-one loop bound misses it.
  'fx_sorted_last': {
    args: ['nums', 'target'],
    setup: 'nums = [1, 3, 5, 7, 9]\ntarget = 9',
    preview: 'nums = [1,3,5,7,9], target = 9 (the last, exact-boundary element). A loop that stops one short never inspects it.',
  },
  // insertion-point: a PRESENT target (5) so a comparison that walks past equal values overshoots the slot.
  'fx_sorted_present': {
    args: ['nums', 'target'],
    setup: 'nums = [1, 3, 5, 6]\ntarget = 5',
    preview: 'nums = [1,3,5,6], target = 5 (present at index 2). Walking past the equal value lands one slot too far (index 3).',
  },
  // first-at-or-above: the threshold EXACTLY equals a value (4, which appears twice) so a strict vs
  // non-strict predicate diverges — it must stop AT the first 4, not walk past both.
  'fx_sorted_dup_threshold': {
    args: ['nums', 'threshold'],
    setup: 'nums = [1, 2, 4, 4, 5]\nthreshold = 4',
    preview: 'nums = [1,2,4,4,5], threshold = 4. First element >= 4 is at index 2. A predicate that skips equals lands at index 4.',
  },
  // integer-root: a number whose floating-point root ROUNDS UP. floor(sqrt) is 67108864, but a
  // float cast returns 67108865 — the classic float-rounding footgun near a large value.
  'fx_big_n': {
    args: ['n'],
    setup: 'n = 4503599761588224',
    preview: 'n = 4503599761588224. Exact floor of the root is 67108864; a floating-point root rounds up to 67108865.',
  },
  // slowest-rate: a tight deadline so the answer is an exact rate (4) — and a floor-instead-of-round-up
  // time estimate under-counts hours and picks a too-slow rate (3) that misses the deadline.
  'fx_piles': {
    args: ['piles', 'H'],
    setup: 'piles = [3, 6, 7, 11]\nH = 8',
    preview: 'piles = [3,6,7,11], deadline H = 8 hours. Slowest rate that fits is 4. Under-counting hours wrongly allows rate 3.',
  },
  // k-largest: a clear top-3 (12,11,5) with no ties at the boundary.
  'fx_amounts': {
    args: ['nums', 'k'],
    setup: 'nums = [3, 1, 5, 12, 2, 11]\nk = 3',
    preview: 'nums = [3,1,5,12,2,11], k = 3. Three largest, descending: [12,11,5].',
  },
  // kth-smallest: an unsorted list where the 3rd smallest is 7.
  'fx_latencies': {
    args: ['nums', 'k'],
    setup: 'nums = [7, 10, 4, 3, 20, 15]\nk = 3',
    preview: 'nums = [7,10,4,3,20,15], k = 3. Sorted ascending starts 3,4,7 — the 3rd smallest is 7.',
  },
  // top-k-frequent: counts 1->3, 2->2, 3->1 so the top 2 by frequency are [1, 2].
  'fx_topk_tags': {
    args: ['tags', 'k'],
    setup: 'tags = [1, 1, 1, 2, 2, 3]\nk = 2',
    preview: 'tags counts: 1 appears 3x, 2 appears 2x, 3 once. Top 2 by frequency: [1, 2].',
  },
  // merge-shards: three sorted lists with a duplicate value across shards (two 1s, two 4s).
  'fx_shards': {
    args: ['lists'],
    setup: 'lists = [[1, 4, 5], [1, 3, 4], [2, 6]]',
    preview: 'three sorted lists; merged ascending is [1,1,2,3,4,4,5,6]. Duplicates across shards must both survive.',
  },
  // collapse-bookings: UNSORTED input AND a touching pair (end 4 meets start 4). Built so two distinct
  // traps fire: skipping the sort merges the wrong pair, and a strict "<" leaves the touching pair split.
  'fx_bookings': {
    args: ['intervals'],
    setup: 'intervals = [[4, 7], [1, 4], [9, 11]]',
    preview: 'intervals = [[4,7],[1,4],[9,11]] (unsorted). Sorted, [1,4] and [4,7] TOUCH (4==4) -> merge to [1,7]; [9,11] stands alone.',
  },
  // min-with-fast-minimum: an operation script replayed against the structure. Engineered so the
  // minimum must restore correctly after a pop (push 5,3,7 -> min 3; pop 7 -> min still 3; pop 3 -> min 5).
  'fx_minstack_ops': {
    args: ['ops'],
    setup: 'ops = [("push", 5), ("push", 3), ("push", 7), ("get_min", None), ("top", None), ("pop", None), ("get_min", None), ("pop", None), ("get_min", None)]',
    preview: 'op script: push 5,3,7; the recorded reads are get_min=3, top=7, (pop), get_min=3, (pop), get_min=5 -> [3,7,3,5].',
  },
};

export const problems = [

  // ───────────────────── sliding-window · single-method ─────────────────────
  {
    id: 'pylab-py-max-vowels-window',
    title: 'Densest vowel stretch of length k',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['string', 'window', 'count'],
    estimatedMin: 5,
    fixtureId: 'fx_vowel_string',
    prompt: 'Given a lowercase string and a window size k, return the largest number of vowels (a, e, i, o, u) that appear together in any run of k consecutive characters. Return 0 if the string is shorter than k.',
    signature: 'solve(s, k)',
    starterCode: 'def solve(s, k):\n    # most vowels in any run of k consecutive characters; 0 if len(s) < k\n    ...',
    hints: [
      'You do not need to recount every run from scratch — as a run shifts one character right, only the character that enters and the one that leaves change the tally.',
      'Keep a count for the current run; add 1 when a vowel enters on the right, subtract 1 when a vowel leaves on the left, and track the best seen.',
    ],
    solution: 'def solve(s, k):\n    if len(s) < k or k <= 0:\n        return 0\n    vowels = set("aeiou")\n    cur = sum(1 for c in s[:k] if c in vowels)\n    best = cur\n    for i in range(k, len(s)):\n        if s[i] in vowels:\n            cur += 1\n        if s[i - k] in vowels:\n            cur -= 1\n        best = max(best, cur)\n    return best',
    compare: { kind: 'value' },
    debrief: 'On "abciiidef" with k=3 the answer is 3 (the run "iii"). Carry one running tally and adjust it by the entering and leaving character on each shift — recounting every run instead costs k work per position. There is one honest way to express this, so no method dial: a fluency rep, not a decision.',
    canonicalMethodId: 'slide_tally',
    methods: [
      { id: 'slide_tally', name: 'carried running tally', code: 'if len(s) < k or k <= 0:\n    return 0\nvowels = set("aeiou")\ncur = sum(1 for c in s[:k] if c in vowels)\nbest = cur\nfor i in range(k, len(s)):\n    if s[i] in vowels:\n        cur += 1\n    if s[i - k] in vowels:\n        cur -= 1\n    best = max(best, cur)\nreturn best', detectionSignature: { mustMatch: [], mustNotMatch: [], note: 'adjust the tally on each shift' }, tradeoff: 'One linear pass, adjusting the tally as the run shifts.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── prefix-sum · single-method ─────────────────────
  {
    id: 'pylab-py-running-max',
    title: 'Running peak of a metric',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['scan', 'running', 'list'],
    estimatedMin: 4,
    fixtureId: 'fx_readings',
    prompt: 'Given a list of readings, return a new list where each position holds the highest reading seen up to and including that position. For an empty input, return an empty list.',
    signature: 'solve(readings)',
    starterCode: 'def solve(readings):\n    # out[i] = the maximum of readings up to and including index i\n    ...',
    hints: [
      'You only ever need the best value seen so far, not the whole history.',
      'Carry that best value forward and append it at each step.',
    ],
    solution: 'def solve(readings):\n    out = []\n    cur = float("-inf")\n    for x in readings:\n        cur = max(cur, x)\n        out.append(cur)\n    return out',
    compare: { kind: 'seq' },
    debrief: 'For [3,1,4,1,5,9,2] the running peaks are [3,3,4,4,5,9,9]. Carry the best-so-far and append it each step — one linear pass. Recomputing the max over the whole prefix at every index repeats work. One honest expression, so no method dial.',
    canonicalMethodId: 'carry_best',
    methods: [
      { id: 'carry_best', name: 'carry the best-so-far', code: 'out = []\ncur = float("-inf")\nfor x in readings:\n    cur = max(cur, x)\n    out.append(cur)\nreturn out', detectionSignature: { mustMatch: [], mustNotMatch: [], note: 'one running maximum' }, tradeoff: 'A single linear scan carrying one value.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── prefix-sum · single-method ─────────────────────
  {
    id: 'pylab-py-range-sum-prefix',
    title: 'Fast repeated range totals',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['precompute', 'range', 'list'],
    estimatedMin: 7,
    fixtureId: 'fx_nums_queries',
    prompt: 'Given a list and a list of inclusive (lo, hi) index queries, return the total over each range. There may be many queries, so each one should answer in constant time after a single setup pass.',
    signature: 'solve(nums, queries)',
    starterCode: 'def solve(nums, queries):\n    # answer each inclusive (lo, hi) range total in O(1) after one setup pass\n    ...',
    hints: [
      'Precompute, once, the cumulative total up to each position.',
      'Any inclusive range total is the difference of two cumulative totals — one just past hi, one at lo.',
    ],
    solution: 'def solve(nums, queries):\n    prefix = [0]\n    for x in nums:\n        prefix.append(prefix[-1] + x)\n    return [prefix[hi + 1] - prefix[lo] for (lo, hi) in queries]',
    compare: { kind: 'seq' },
    debrief: 'The three ranges over [1,2,3,4,5] total [6,9,5]. Build one cumulative-total array (one extra slot for the empty prefix), then every range is a single subtraction. Re-summing each range instead makes q queries cost q times the list length. One honest expression — no method dial.',
    canonicalMethodId: 'cumulative',
    methods: [
      { id: 'cumulative', name: 'cumulative totals then subtract', code: 'prefix = [0]\nfor x in nums:\n    prefix.append(prefix[-1] + x)\nreturn [prefix[hi + 1] - prefix[lo] for (lo, hi) in queries]', detectionSignature: { mustMatch: [], mustNotMatch: [], note: 'difference of cumulative totals' }, tradeoff: 'One setup pass; each query is a constant-time subtraction.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── prefix-sum · multi-method + trap (forgot the base case) ─────────────────────
  {
    id: 'pylab-py-subarray-sum-k',
    title: 'Count windows summing to a target',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['count', 'running', 'footgun'],
    estimatedMin: 9,
    fixtureId: 'fx_nums_target',
    prompt: 'Given a list of integers (which may be negative) and a target k, return how many contiguous stretches of the list add up to exactly k. Aim for a single pass — not a check of every possible stretch.',
    beforeWriting: 'A stretch that starts at the very beginning has no earlier prefix to subtract. How will your bookkeeping count that one?',
    signature: 'solve(nums, k)',
    starterCode: 'def solve(nums, k):\n    # count contiguous stretches that sum to exactly k, in one pass\n    ...',
    hints: [
      'Keep a running total as you scan. A stretch ending here sums to k exactly when an earlier running total equalled (running total minus k).',
      'Count how often each running total has occurred in a dict — and account for the "empty start" total of zero before you begin.',
    ],
    solution: 'def solve(nums, k):\n    from collections import defaultdict\n    seen = defaultdict(int)\n    seen[0] = 1\n    total = 0\n    count = 0\n    for x in nums:\n        total += x\n        count += seen[total - k]\n        seen[total] += 1\n    return count',
    compare: { kind: 'value' },
    debrief: 'On [1,1,1] with k=2 the answer is 2. The tell is the base case: seeding the running-total counter with {0: 1} accounts for stretches that begin at index 0. Drop that seed and the trap returns 1 — it silently misses the stretch [0..1] whose total is exactly k, because no earlier prefix of zero was ever recorded. It runs cleanly and looks right; it is just one short.',
    canonicalMethodId: 'prefix_count',
    methods: [
      { id: 'prefix_count', name: 'running totals + seeded counter', code: 'from collections import defaultdict\nseen = defaultdict(int)\nseen[0] = 1\ntotal = 0\ncount = 0\nfor x in nums:\n    total += x\n    count += seen[total - k]\n    seen[total] += 1\nreturn count', detectionSignature: { mustMatch: ['seen[0]'], mustNotMatch: [], note: 'seeds the empty-prefix base case' }, tradeoff: 'One pass; the {0:1} seed handles stretches starting at index 0.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'no_seed', name: 'forgot the empty-prefix seed', code: 'from collections import defaultdict\nseen = defaultdict(int)\ntotal = 0\ncount = 0\nfor x in nums:\n    total += x\n    count += seen[total - k]\n    seen[total] += 1\nreturn count', detectionSignature: { mustMatch: [], mustNotMatch: ['seen[0]'], note: 'never records the empty-prefix total' }, tradeoff: 'Reads almost identically and runs.', breaksWhen: 'Any stretch that starts at index 0 — it is never counted, so the total silently undercounts.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the version without the {0:1} seed return a count that is too low?', options: ['prefix_count', 'no_seed'], answerId: 'no_seed', explanation: 'A stretch beginning at index 0 has no earlier prefix; it matches only against the "empty start" total of zero. Without seeding that zero once, every such stretch is missed, so the count silently undercounts.' },
    ],
  },

  // ───────────────────── prefix-sum · multi-method + trap (off-by-one: forgot the current element) ─────────────────────
  {
    id: 'pylab-py-equilibrium-index',
    title: 'Balance point of a ledger',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['running', 'index', 'footgun'],
    estimatedMin: 8,
    fixtureId: 'fx_ledger',
    prompt: 'Return the smallest index where the total of everything strictly to the left equals the total of everything strictly to the right. Return -1 if no such index exists. Do it without nested loops.',
    beforeWriting: 'The element AT the index belongs to neither side. Does your right-hand total exclude it?',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # smallest index where left total == right total (the index element counts for neither); -1 if none\n    ...',
    hints: [
      'Compute the grand total once. As you scan, keep the total to the left of the current index.',
      'The total to the right is the grand total minus the left total minus the current element itself.',
    ],
    solution: 'def solve(nums):\n    total = sum(nums)\n    left = 0\n    for i, x in enumerate(nums):\n        if left == total - left - x:\n            return i\n        left += x\n    return -1',
    compare: { kind: 'value' },
    debrief: 'On [1,7,3,6,5,6] the balance point is index 3 (left 11 == right 11). The tell is the current element: the right-hand total must exclude the element AT the index, i.e. grand total minus left minus the current value. The trap forgets to subtract the current element, comparing left against (total minus left) — so it never finds the balance and returns -1. It runs; it is just answering a subtly different question.',
    canonicalMethodId: 'running_left',
    methods: [
      { id: 'running_left', name: 'grand total minus left minus current', code: 'total = sum(nums)\nleft = 0\nfor i, x in enumerate(nums):\n    if left == total - left - x:\n        return i\n    left += x\nreturn -1', detectionSignature: { mustMatch: ['- left - x'], mustNotMatch: [], note: 'excludes the index element from both sides' }, tradeoff: 'One total plus a running left sum — linear.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'forgot_current', name: 'forgot to exclude the current element', code: 'total = sum(nums)\nleft = 0\nfor i, x in enumerate(nums):\n    if left == total - left:\n        return i\n    left += x\nreturn -1', detectionSignature: { mustMatch: [], mustNotMatch: ['- x'], note: 'leaves the index element on the right side' }, tradeoff: 'Looks almost identical and runs.', breaksWhen: 'Whenever the index element is non-zero — the right total is overstated, so a real balance point is missed.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does comparing left against (total - left) miss the balance point?', options: ['running_left', 'forgot_current'], answerId: 'forgot_current', explanation: 'The element at the index belongs to neither side. Leaving it in the right-hand total (total - left) overstates the right by exactly that element, so the two sides never match at a real balance point.' },
    ],
  },

  // ───────────────────── stack · multi-method + trap (nonstrict comparison) ─────────────────────
  {
    id: 'pylab-py-daily-temperatures',
    title: 'Days until a warmer reading',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['scan', 'pending', 'footgun'],
    estimatedMin: 9,
    fixtureId: 'fx_temps_flat',
    prompt: 'Given a list of daily temperatures, return a list where each entry is how many days you must wait until a strictly warmer day, or 0 if no warmer day ever follows.',
    beforeWriting: 'A day that ties the current temperature is not warmer. Does an equal reading resolve a pending wait, or leave it pending?',
    signature: 'solve(temps)',
    starterCode: 'def solve(temps):\n    # out[i] = days until a STRICTLY warmer day, else 0\n    ...',
    hints: [
      'Hold the positions of days that are still waiting for a warmer one. When a new day arrives, it resolves every waiting day it is warmer than.',
      'Resolve a waiting day only when the new reading is strictly greater — an equal reading must leave it pending.',
    ],
    solution: 'def solve(temps):\n    out = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            out[j] = i - j\n        stack.append(i)\n    return out',
    compare: { kind: 'seq' },
    debrief: 'On [73,74,74,71,76] the answer is [1,3,2,1,0]. The tell is the comparison: only a STRICTLY warmer day resolves a pending one. The trap uses "<=", so the second 74 wrongly resolves the first 74 as if it were warmer — index 1 gets a wait of 1 instead of 3. Both run; the strict comparison is the correct one because an equal reading is not warmer.',
    canonicalMethodId: 'strict_pending',
    methods: [
      { id: 'strict_pending', name: 'resolve only on strictly warmer', code: 'out = [0] * len(temps)\nstack = []\nfor i, t in enumerate(temps):\n    while stack and temps[stack[-1]] < t:\n        j = stack.pop()\n        out[j] = i - j\n    stack.append(i)\nreturn out', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'strict — equal does not resolve' }, tradeoff: 'Each position is set pending once and resolved once — linear.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'nonstrict', name: 'resolve on warmer-or-equal', code: 'out = [0] * len(temps)\nstack = []\nfor i, t in enumerate(temps):\n    while stack and temps[stack[-1]] <= t:\n        j = stack.pop()\n        out[j] = i - j\n    stack.append(i)\nreturn out', detectionSignature: { mustMatch: ['<='], mustNotMatch: [], note: 'treats equal as warmer' }, tradeoff: 'One character different; runs.', breaksWhen: 'Any pair of equal temperatures — the later equal day wrongly resolves the earlier as if it were warmer.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does "<=" give the wrong wait on a flat stretch?', options: ['strict_pending', 'nonstrict'], answerId: 'nonstrict', explanation: 'The task asks for a STRICTLY warmer day. With "<=", an equal-temperature day resolves the earlier pending day as though it were warmer, reporting a shorter wait than the real next-warmer day.' },
    ],
  },

  // ───────────────────── stack · multi-method + trap (nonstrict comparison) ─────────────────────
  {
    id: 'pylab-py-next-greater',
    title: 'Next greater price for each day',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['scan', 'pending', 'footgun'],
    estimatedMin: 8,
    fixtureId: 'fx_prices_equal',
    prompt: 'Given a list of prices, return for each one the next price to its right that is strictly greater, or -1 if none is. Aim for a single pass, not a scan-to-the-right per element.',
    beforeWriting: 'An equal price is not greater. When the next price equals an earlier one, does that earlier one get resolved?',
    signature: 'solve(prices)',
    starterCode: 'def solve(prices):\n    # out[i] = the next price to the right STRICTLY greater than prices[i], else -1\n    ...',
    hints: [
      'Hold the positions still waiting for a greater price. A new price resolves every waiting position it is strictly greater than.',
      'Use a strict comparison — an equal price must leave earlier equal positions waiting, not resolve them.',
    ],
    solution: 'def solve(prices):\n    out = [-1] * len(prices)\n    stack = []\n    for i, p in enumerate(prices):\n        while stack and prices[stack[-1]] < p:\n            out[stack.pop()] = p\n        stack.append(i)\n    return out',
    compare: { kind: 'seq' },
    debrief: 'On [2,2,4,3] the answer is [4,4,-1,-1]. The tell is the comparison. The trap uses "<=": when the second 2 arrives, it wrongly resolves the first 2 (as if 2 were greater than 2), so index 0 reports 2 instead of 4. The strict "<" is correct — an equal price is not strictly greater, so the first 2 must look past the second to the 4.',
    canonicalMethodId: 'strict_pending',
    methods: [
      { id: 'strict_pending', name: 'resolve only on strictly greater', code: 'out = [-1] * len(prices)\nstack = []\nfor i, p in enumerate(prices):\n    while stack and prices[stack[-1]] < p:\n        out[stack.pop()] = p\n    stack.append(i)\nreturn out', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'strict — equal does not resolve' }, tradeoff: 'Each position is pending once, resolved once — linear.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'nonstrict', name: 'resolve on greater-or-equal', code: 'out = [-1] * len(prices)\nstack = []\nfor i, p in enumerate(prices):\n    while stack and prices[stack[-1]] <= p:\n        out[stack.pop()] = p\n    stack.append(i)\nreturn out', detectionSignature: { mustMatch: ['<='], mustNotMatch: [], note: 'treats equal as greater' }, tradeoff: 'One character different; runs.', breaksWhen: 'Any repeated price — an equal later price wrongly resolves the earlier as its next-greater.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does "<=" report the wrong next-greater on a repeated price?', options: ['strict_pending', 'nonstrict'], answerId: 'nonstrict', explanation: 'The task asks for a STRICTLY greater price. With "<=", an equal later price resolves an earlier equal one as though it were greater, so the earlier position records the equal value instead of looking past it.' },
    ],
  },

  // ───────────────────── stack · single-method (class replayed) ─────────────────────
  {
    id: 'pylab-py-min-stack',
    title: 'Pile reads that always know the minimum',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['structure', 'class', 'invariant'],
    estimatedMin: 8,
    fixtureId: 'fx_minstack_ops',
    prompt: 'You are given a script of operations (add an item to the top, remove the top item, read the top item, read the current smallest item). Replay it on a last-in-first-out pile where reading the smallest item must be just as fast as reading the top. Return the list of values produced by the read operations, in order.',
    signature: 'solve(ops)',
    starterCode: 'def solve(ops):\n    # replay the op script on a LIFO pile; return the values from the read operations\n    # ops are ("push", x) | ("pop", None) | ("top", None) | ("get_min", None)\n    ...',
    hints: [
      'Reading the smallest item cannot scan the whole pile each time — you must already know it.',
      'Store, next to each item, the smallest value present at the moment it was added; then the current minimum is always the one stored at the top.',
    ],
    solution: 'def solve(ops):\n    class MinStack:\n        def __init__(self):\n            self._stack = []\n        def push(self, x):\n            cur_min = x if not self._stack else min(x, self._stack[-1][1])\n            self._stack.append((x, cur_min))\n        def pop(self):\n            return self._stack.pop()[0]\n        def top(self):\n            return self._stack[-1][0]\n        def get_min(self):\n            return self._stack[-1][1]\n    s = MinStack()\n    out = []\n    for op, arg in ops:\n        if op == "push":\n            s.push(arg)\n        elif op == "pop":\n            s.pop()\n        elif op == "top":\n            out.append(s.top())\n        elif op == "get_min":\n            out.append(s.get_min())\n    return out',
    compare: { kind: 'seq' },
    debrief: 'The recorded reads are [3,7,3,5]: push 5,3,7 makes the minimum 3 and the top 7; after popping 7 the minimum is still 3; after popping 3 it restores to 5. Pairing each item with the minimum present when it was added makes reading the minimum a constant-time top read, and it restores automatically on pop. The only cost is one extra stored value per item. One honest design here, so no method dial.',
    canonicalMethodId: 'paired_min',
    methods: [
      { id: 'paired_min', name: 'pair each item with the running minimum', code: 'class MinStack:\n    def __init__(self):\n        self._stack = []\n    def push(self, x):\n        cur_min = x if not self._stack else min(x, self._stack[-1][1])\n        self._stack.append((x, cur_min))\n    def pop(self):\n        return self._stack.pop()[0]\n    def top(self):\n        return self._stack[-1][0]\n    def get_min(self):\n        return self._stack[-1][1]\ns = MinStack()\nout = []\nfor op, arg in ops:\n    if op == "push":\n        s.push(arg)\n    elif op == "pop":\n        s.pop()\n    elif op == "top":\n        out.append(s.top())\n    elif op == "get_min":\n        out.append(s.get_min())\nreturn out', detectionSignature: { mustMatch: [], mustNotMatch: [], note: 'cache the minimum alongside each item' }, tradeoff: 'Constant-time minimum at the cost of one cached value per item.', breaksWhen: 'Nothing here — it is the canonical design.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── stack · multi-method + trap (floored division for negatives) ─────────────────────
  {
    id: 'pylab-py-eval-rpn',
    title: 'Evaluate a postfix formula',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['stack', 'arithmetic', 'footgun'],
    estimatedMin: 9,
    fixtureId: 'fx_rpn_neg',
    prompt: 'Evaluate a formula given as a list of tokens where each operator follows its two operands (integers as strings, plus + - * /). Division must truncate toward zero (so 4 divided by -3 is -1, not -2). Return the integer result.',
    beforeWriting: 'Python\'s integer-division operator rounds toward negative infinity. Is that the same as truncating toward zero when a negative number is involved?',
    signature: 'solve(tokens)',
    starterCode: 'def solve(tokens):\n    # evaluate the postfix tokens; division truncates TOWARD ZERO; return an int\n    ...',
    hints: [
      'Keep a pile of operands. When an operator appears, take the top two, apply it, and put the result back.',
      'For division, divide as a real number and cut off toward zero — Python\'s "//" rounds toward negative infinity and gives the wrong sign of result for negatives.',
    ],
    solution: 'def solve(tokens):\n    stack = []\n    ops = {"+", "-", "*", "/"}\n    for tok in tokens:\n        if tok in ops:\n            b = stack.pop(); a = stack.pop()\n            if tok == "+": stack.append(a + b)\n            elif tok == "-": stack.append(a - b)\n            elif tok == "*": stack.append(a * b)\n            else: stack.append(int(a / b))\n        else:\n            stack.append(int(tok))\n    return stack.pop()',
    compare: { kind: 'value' },
    debrief: 'The formula evaluates 10 6 - = 4, then 4 / -3. Truncating toward zero gives -1, the correct answer. The trap uses "//", which floors toward negative infinity, so 4 // -3 is -2 — it runs and looks reasonable but is off by one for the negative division. The fix is int(a / b), which cuts toward zero.',
    canonicalMethodId: 'trunc_zero',
    methods: [
      { id: 'trunc_zero', name: 'divide then truncate toward zero', code: 'stack = []\nops = {"+", "-", "*", "/"}\nfor tok in tokens:\n    if tok in ops:\n        b = stack.pop(); a = stack.pop()\n        if tok == "+": stack.append(a + b)\n        elif tok == "-": stack.append(a - b)\n        elif tok == "*": stack.append(a * b)\n        else: stack.append(int(a / b))\n    else:\n        stack.append(int(tok))\nreturn stack.pop()', detectionSignature: { mustMatch: ['int(a / b)'], mustNotMatch: ['//'], note: 'truncate toward zero' }, tradeoff: 'One pass; int(a / b) matches the truncate-toward-zero rule.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'floor_div', name: 'floored integer division', code: 'stack = []\nops = {"+", "-", "*", "/"}\nfor tok in tokens:\n    if tok in ops:\n        b = stack.pop(); a = stack.pop()\n        if tok == "+": stack.append(a + b)\n        elif tok == "-": stack.append(a - b)\n        elif tok == "*": stack.append(a * b)\n        else: stack.append(a // b)\n    else:\n        stack.append(int(tok))\nreturn stack.pop()', detectionSignature: { mustMatch: ['//'], mustNotMatch: [], note: 'floors toward negative infinity' }, tradeoff: 'Reads like ordinary integer division; runs.', breaksWhen: 'Any division with a negative operand — "//" floors instead of truncating, giving a result one lower.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does "//" give the wrong result for 4 divided by -3?', options: ['trunc_zero', 'floor_div'], answerId: 'floor_div', explanation: 'Python\'s "//" floors toward negative infinity, so 4 // -3 is -2. The task requires truncation toward zero, which is -1. int(a / b) cuts off the fractional part toward zero and matches the rule.' },
    ],
  },

  // ───────────────────── binary-search · multi-method + trap (off-by-one loop bound) ─────────────────────
  {
    id: 'pylab-py-binary-search',
    title: 'Find an id in a sorted index',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['sorted', 'search', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_sorted_last',
    prompt: 'Given a list sorted in ascending order and a target, return the position of the target, or -1 if it is absent. Do not scan the list one by one, and do not use the built-in index lookup.',
    beforeWriting: 'When your search narrows to a single candidate position, does your loop still inspect it — or stop one short?',
    signature: 'solve(nums, target)',
    starterCode: 'def solve(nums, target):\n    # return the position of target in the sorted list, else -1\n    ...',
    hints: [
      'Track a low and high bound for where the target could be, and repeatedly check the middle, discarding the half that cannot contain it.',
      'Be careful with the loop bound — when low and high meet on a single position, that position must still be checked.',
    ],
    solution: 'def solve(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
    compare: { kind: 'value' },
    debrief: 'The target 9 sits at the last position (index 4). The tell is the loop bound: the correct loop runs while low is less than OR EQUAL to high, so it still inspects the single remaining position when the bounds meet. The trap uses "<" (strictly less), so when the search narrows to that last position the loop exits without checking it and returns -1 — it runs, but misses any element that lands as the final candidate.',
    canonicalMethodId: 'inclusive_loop',
    methods: [
      { id: 'inclusive_loop', name: 'loop while low <= high', code: 'lo, hi = 0, len(nums) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nreturn -1', detectionSignature: { mustMatch: ['<='], mustNotMatch: [], note: 'inspects the final single candidate' }, tradeoff: 'Halves the range each step; checks the last remaining position.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'strict_loop', name: 'loop while low < high', code: 'lo, hi = 0, len(nums) - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nreturn -1', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'exits one position too early' }, tradeoff: 'Looks almost identical; runs.', breaksWhen: 'When the target is the final remaining candidate — the loop exits before checking it and wrongly returns -1.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the "low < high" loop miss the target?', options: ['inclusive_loop', 'strict_loop'], answerId: 'strict_loop', explanation: 'With an inclusive high bound, the search can narrow to a single position where low equals high. A strictly-less loop exits at that point without inspecting it, so an element sitting at the final candidate is never compared.' },
    ],
  },

  // ───────────────────── binary-search · multi-method + trap (comparison overshoots) ─────────────────────
  {
    id: 'pylab-py-search-insert',
    title: 'Where would this value slot in?',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['sorted', 'insertion', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_sorted_present',
    prompt: 'Given a sorted list of distinct values and a target, return the position where the target is, or where it would be inserted to keep the list sorted. If the target is already present, return its own position.',
    beforeWriting: 'If the target is already in the list, should your search land ON it, or just after it?',
    signature: 'solve(nums, target)',
    starterCode: 'def solve(nums, target):\n    # position of target if present, else where it would be inserted to stay sorted\n    ...',
    hints: [
      'Narrow a low/high bound toward the leftmost position where the target could sit without breaking the order.',
      'Decide carefully which side an exact match falls on — a comparison that pushes equal values rightward lands one slot too far.',
    ],
    solution: 'def solve(nums, target):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo',
    compare: { kind: 'value' },
    debrief: 'The target 5 is present at index 2, so the answer is 2. The tell is which way an exact match goes: the correct comparison keeps equal values on the high side (move low past only strictly-smaller values), landing exactly on the match. The trap pushes equal values to the left bound too (using "<="), so it walks one slot past the present target and returns 3. Both run; only the strict comparison lands on the leftmost valid position.',
    canonicalMethodId: 'left_landing',
    methods: [
      { id: 'left_landing', name: 'advance low only past strictly-smaller', code: 'lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'equal values stay on the high side' }, tradeoff: 'Converges on the leftmost valid slot; lands on a present target.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'le_overshoot', name: 'advance low past equal values too', code: 'lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] <= target:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo', detectionSignature: { mustMatch: ['<='], mustNotMatch: [], note: 'pushes equal values rightward' }, tradeoff: 'One character different; runs.', breaksWhen: 'When the target is present — it walks one slot past the match instead of landing on it.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does "<=" return one position too far for a present target?', options: ['left_landing', 'le_overshoot'], answerId: 'le_overshoot', explanation: 'Using "<=" advances the low bound past positions equal to the target, so the search settles to the right of the match rather than on it. The leftmost-slot answer needs equal values to stay on the high side, which a strict "<" achieves.' },
    ],
  },

  // ───────────────────── binary-search · multi-method + trap (predicate skips equals) ─────────────────────
  {
    id: 'pylab-py-first-geq',
    title: 'First reading at or above a threshold',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['sorted', 'boundary', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_sorted_dup_threshold',
    prompt: 'Given a sorted list and a threshold, return the position of the first element that is greater than or equal to the threshold. If every element is below it, return the length of the list.',
    beforeWriting: 'A reading that exactly equals the threshold counts as "at or above". Does your search stop at the first equal one, or skip past it?',
    signature: 'solve(nums, threshold)',
    starterCode: 'def solve(nums, threshold):\n    # position of the first element >= threshold; len(nums) if none\n    ...',
    hints: [
      'Narrow a low/high bound toward the first position where the element is no longer below the threshold.',
      'An element that equals the threshold already qualifies — your test must treat equal as "qualifies", not "keep going".',
    ],
    solution: 'def solve(nums, threshold):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < threshold:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo',
    compare: { kind: 'value' },
    debrief: 'With nums [1,2,4,4,5] and threshold 4, the first element at or above 4 is at index 2. The tell is the qualifying test: only strictly-smaller elements should advance the low bound, so the search stops at the first 4. The trap tests "<=" — it treats an element equal to the threshold as still-below, walks past both 4s, and returns 4 (the index of the 5). Both run; only the strict-below test stops at the first qualifying element.',
    canonicalMethodId: 'stop_at_equal',
    methods: [
      { id: 'stop_at_equal', name: 'advance only past strictly-below', code: 'lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] < threshold:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'equal already qualifies' }, tradeoff: 'Stops at the first element that is not below the threshold.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'skip_equal', name: 'advance past equal values too', code: 'lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] <= threshold:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo', detectionSignature: { mustMatch: ['<='], mustNotMatch: [], note: 'treats equal as still-below' }, tradeoff: 'One character different; runs.', breaksWhen: 'When the threshold equals an element — it skips past every equal value and lands on the first strictly-greater one.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the "<=" test return the wrong position when the threshold is present?', options: ['stop_at_equal', 'skip_equal'], answerId: 'skip_equal', explanation: 'An element equal to the threshold already satisfies "at or above", so it must stop the search. Testing "<=" advances the low bound past equal values, landing on the first strictly-greater element instead of the first qualifying one.' },
    ],
  },

  // ───────────────────── binary-search · multi-method + trap (float rounding) ─────────────────────
  {
    id: 'pylab-py-integer-sqrt',
    title: 'Integer square root without floats',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['integer', 'precision', 'footgun'],
    estimatedMin: 8,
    fixtureId: 'fx_big_n',
    prompt: 'Given a non-negative integer n, return the whole-number part of its square root (the largest integer whose square does not exceed n), using integer arithmetic only — no floating-point square root.',
    beforeWriting: 'A floating-point square root carries rounding error. For a very large n, can int(float_sqrt(n)) land on the wrong whole number?',
    signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # largest integer r with r*r <= n, using integer math only (no float sqrt)\n    ...',
    hints: [
      'Search for the answer between 0 and n: pick a candidate, square it, and discard the half that cannot hold the answer.',
      'Compare using integer multiplication (candidate squared against n) — that stays exact where a floating-point root can round to the wrong integer.',
    ],
    solution: 'def solve(n):\n    if n < 2:\n        return n\n    lo, hi = 1, n\n    ans = 0\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if mid * mid <= n:\n            ans = mid\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return ans',
    compare: { kind: 'value' },
    debrief: 'For n = 4503599761588224 the exact whole-number root is 67108864 (its square is exactly n). The tell is precision: searching with integer multiplication stays exact. The trap takes the floating-point square root and casts it to int — at this magnitude the float rounds up, returning 67108865, whose square exceeds n. It runs and is fast; it is just wrong by one because the float lost precision.',
    canonicalMethodId: 'int_search',
    methods: [
      { id: 'int_search', name: 'search with integer multiplication', code: 'if n < 2:\n    return n\nlo, hi = 1, n\nans = 0\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if mid * mid <= n:\n        ans = mid\n        lo = mid + 1\n    else:\n        hi = mid - 1\nreturn ans', detectionSignature: { mustMatch: ['mid * mid'], mustNotMatch: ['sqrt'], note: 'exact integer comparison' }, tradeoff: 'Exact integer math; no rounding error.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'float_sqrt', name: 'cast the floating-point root', code: 'import math\nreturn int(math.sqrt(n))', detectionSignature: { mustMatch: ['sqrt'], mustNotMatch: [], note: 'floating-point precision loss' }, tradeoff: 'Short and fast.', breaksWhen: 'For large n where the float square root rounds away from the true integer — the cast returns a value off by one.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can int(math.sqrt(n)) return the wrong integer for a large n?', options: ['int_search', 'float_sqrt'], answerId: 'float_sqrt', explanation: 'A floating-point square root has limited precision. For large n it can round up to just over the true root, so casting to int yields a value whose square exceeds n. Integer multiplication in the search avoids any rounding.' },
    ],
  },

  // ───────────────────── binary-search · multi-method + trap (under-counting hours) ─────────────────────
  {
    id: 'pylab-py-koko-rate',
    title: 'Slowest rate to clear the backlog in time',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['feasibility', 'boundary', 'footgun'],
    estimatedMin: 9,
    fixtureId: 'fx_piles',
    prompt: 'Given a list of pile sizes and a deadline of H hours, find the smallest whole-number rate r such that clearing a pile of size p takes the rounded-up value of p divided by r hours, and the total hours across all piles fits within H. A partial hour still costs a whole hour.',
    beforeWriting: 'Clearing a pile takes a WHOLE hour even for the leftover bit. Does plain integer division count that final partial hour?',
    signature: 'solve(piles, H)',
    starterCode: 'def solve(piles, H):\n    # smallest whole rate r so the total of (pile cleared at r, rounding each pile UP to whole hours) <= H\n    ...',
    hints: [
      'The answer is monotonic: a faster rate never needs more hours. Search the rate between 1 and the largest pile, testing whether each candidate fits in H.',
      'When computing hours for a pile, round UP — a pile of 7 at rate 4 takes 2 hours, not 1. Plain integer division drops the final partial hour and undercounts.',
    ],
    solution: 'def solve(piles, H):\n    import math\n    def hours(r):\n        return sum(math.ceil(p / r) for p in piles)\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if hours(mid) <= H:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo',
    compare: { kind: 'value' },
    debrief: 'For piles [3,6,7,11] and H = 8 the slowest feasible rate is 4 (hours 1+2+2+3 = 8). The tell is rounding: each pile costs whole hours, so a leftover bit rounds up. The trap computes hours with plain integer division (which floors), undercounts the total, and concludes rate 3 already fits — so it returns 3, which actually needs 10 hours and misses the deadline. Both run; only rounding-up models the whole-hour cost correctly.',
    canonicalMethodId: 'round_up_hours',
    methods: [
      { id: 'round_up_hours', name: 'round each pile up to whole hours', code: 'import math\ndef hours(r):\n    return sum(math.ceil(p / r) for p in piles)\nlo, hi = 1, max(piles)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if hours(mid) <= H:\n        hi = mid\n    else:\n        lo = mid + 1\nreturn lo', detectionSignature: { mustMatch: ['ceil'], mustNotMatch: ['//'], note: 'rounds the partial hour up' }, tradeoff: 'Models the whole-hour cost; finds the true slowest feasible rate.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'floor_hours', name: 'floored hours per pile', code: 'def hours(r):\n    return sum(p // r for p in piles)\nlo, hi = 1, max(piles)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if hours(mid) <= H:\n        hi = mid\n    else:\n        lo = mid + 1\nreturn lo', detectionSignature: { mustMatch: ['//'], mustNotMatch: ['ceil'], note: 'drops the final partial hour' }, tradeoff: 'Reads like a simple division; runs.', breaksWhen: 'Whenever a pile does not divide evenly — flooring undercounts the hours and accepts a too-slow rate that misses the deadline.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does flooring the hours per pile pick a rate that is too slow?', options: ['round_up_hours', 'floor_hours'], answerId: 'floor_hours', explanation: 'A partial pile still costs a whole hour, so hours must round up. Flooring with "//" drops that final hour, undercounts the total, and lets a slower rate appear to fit within H when it actually exceeds the deadline.' },
    ],
  },

  // ───────────────────── heap · single-method ─────────────────────
  {
    id: 'pylab-py-k-largest',
    title: 'k largest transactions',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['selection', 'top-k', 'order'],
    estimatedMin: 5,
    fixtureId: 'fx_amounts',
    prompt: 'Return the k largest values from a list, ordered from largest to smallest. When k is much smaller than the list, you should not have to fully order the whole list to get them.',
    signature: 'solve(nums, k)',
    starterCode: 'def solve(nums, k):\n    # the k largest values, largest first\n    ...',
    hints: [
      'You only need to retain the k biggest values seen, not a full ordering of everything.',
      'The standard library has a helper that returns the k largest items directly, already ordered largest-first.',
    ],
    solution: 'def solve(nums, k):\n    import heapq\n    if k <= 0:\n        return []\n    return heapq.nlargest(k, nums)',
    compare: { kind: 'seq' },
    debrief: 'For [3,1,5,12,2,11] with k=3 the answer is [12,11,5]. Retaining only the k biggest as you scan is cheaper than fully ordering the list when k is small, and the result comes back already largest-first. One honest expression, so no method dial — a fluency rep.',
    canonicalMethodId: 'nlargest',
    methods: [
      { id: 'nlargest', name: 'retain the k biggest', code: 'import heapq\nif k <= 0:\n    return []\nreturn heapq.nlargest(k, nums)', detectionSignature: { mustMatch: ['nlargest'], mustNotMatch: [], note: 'k largest, ordered' }, tradeoff: 'Keeps only k candidates while scanning; returns them ordered.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── heap · single-method ─────────────────────
  {
    id: 'pylab-py-kth-smallest',
    title: 'kth smallest latency',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['selection', 'order-statistic'],
    estimatedMin: 5,
    fixtureId: 'fx_latencies',
    prompt: 'Return the kth smallest value in a list, counting from 1 (so k=1 is the smallest). Assume k is valid for the list.',
    signature: 'solve(nums, k)',
    starterCode: 'def solve(nums, k):\n    # the kth smallest value, 1-indexed\n    ...',
    hints: [
      'You need the smallest k values; the answer is the largest among those k.',
      'A standard-library helper returns the k smallest in order — the last of them is the kth smallest.',
    ],
    solution: 'def solve(nums, k):\n    import heapq\n    return heapq.nsmallest(k, nums)[-1]',
    compare: { kind: 'value' },
    debrief: 'For [7,10,4,3,20,15] with k=3, the sorted prefix is 3,4,7, so the 3rd smallest is 7. Pulling the k smallest in order and taking the last gives the answer without fully ordering the whole list. One honest expression — no method dial.',
    canonicalMethodId: 'nsmallest',
    methods: [
      { id: 'nsmallest', name: 'k smallest, take the last', code: 'import heapq\nreturn heapq.nsmallest(k, nums)[-1]', detectionSignature: { mustMatch: ['nsmallest'], mustNotMatch: [], note: 'last of the k smallest' }, tradeoff: 'Retains only k candidates; the last is the answer.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── heap · single-method ─────────────────────
  {
    id: 'pylab-py-top-k-frequent-heap',
    title: 'Top k trending tags',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['frequency', 'top-k', 'count'],
    estimatedMin: 6,
    fixtureId: 'fx_topk_tags',
    prompt: 'Given a list of tags, return the k that occur most often, ordered from most frequent to least frequent.',
    signature: 'solve(tags, k)',
    starterCode: 'def solve(tags, k):\n    # the k most frequent tags, most-frequent first\n    ...',
    hints: [
      'First tally how many times each tag appears.',
      'Then pull the k tags with the highest tallies, ordered by tally descending.',
    ],
    solution: 'def solve(tags, k):\n    import heapq\n    from collections import Counter\n    counts = Counter(tags)\n    return [tag for tag, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]',
    compare: { kind: 'seq' },
    debrief: 'For [1,1,1,2,2,3] with k=2, tag 1 appears 3 times and tag 2 twice, so the answer is [1,2]. Tally first, then pull the k highest tallies — retaining only k candidates beats fully ordering all distinct tags when there are many. One honest expression — no method dial.',
    canonicalMethodId: 'count_then_topk',
    methods: [
      { id: 'count_then_topk', name: 'tally then pull top k', code: 'import heapq\nfrom collections import Counter\ncounts = Counter(tags)\nreturn [tag for tag, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]', detectionSignature: { mustMatch: ['nlargest'], mustNotMatch: [], note: 'top k by tally' }, tradeoff: 'Tally is linear; pulling the top k retains only k candidates.', breaksWhen: 'Nothing here — it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── heap · single-method ─────────────────────
  {
    id: 'pylab-py-merge-k-sorted',
    title: 'Merge k sorted shards',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['merge', 'sorted', 'order'],
    estimatedMin: 8,
    fixtureId: 'fx_shards',
    prompt: 'Given several already-sorted lists, combine them into one list that is sorted overall. Take advantage of the fact that each input is already in order.',
    signature: 'solve(lists)',
    starterCode: 'def solve(lists):\n    # combine several already-sorted lists into one sorted list\n    ...',
    hints: [
      'The next value of the overall result is always the smallest among the current front items of the lists.',
      'Track one front item per list, repeatedly take the smallest, and advance only the list it came from.',
    ],
    solution: 'def solve(lists):\n    import heapq\n    heap = []\n    for li, lst in enumerate(lists):\n        if lst:\n            heapq.heappush(heap, (lst[0], li, 0))\n    out = []\n    while heap:\n        val, li, idx = heapq.heappop(heap)\n        out.append(val)\n        if idx + 1 < len(lists[li]):\n            heapq.heappush(heap, (lists[li][idx + 1], li, idx + 1))\n    return out',
    compare: { kind: 'seq' },
    debrief: 'The three shards merge to [1,1,2,3,4,4,5,6], with the duplicate 1s and 4s across shards both kept. Repeatedly taking the smallest current front item and advancing only its list reuses the fact that each input is sorted; the (value, list, position) tuple keeps ties deterministic. One honest design — no method dial.',
    canonicalMethodId: 'front_items',
    methods: [
      { id: 'front_items', name: 'always take the smallest front item', code: 'import heapq\nheap = []\nfor li, lst in enumerate(lists):\n    if lst:\n        heapq.heappush(heap, (lst[0], li, 0))\nout = []\nwhile heap:\n    val, li, idx = heapq.heappop(heap)\n    out.append(val)\n    if idx + 1 < len(lists[li]):\n        heapq.heappush(heap, (lists[li][idx + 1], li, idx + 1))\nreturn out', detectionSignature: { mustMatch: [], mustNotMatch: [], note: 'one front item per list' }, tradeoff: 'Reuses each input ordering; advances one list per step.', breaksWhen: 'Nothing here — it is the canonical design.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── intervals · multi-method + two traps (no-sort, strict touch) ─────────────────────
  {
    id: 'pylab-py-merge-intervals',
    title: 'Collapse overlapping bookings',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['intervals', 'sweep', 'footgun'],
    estimatedMin: 9,
    fixtureId: 'fx_bookings',
    prompt: 'Given a list of [start, end] bookings, combine every group that overlaps or merely touches at an endpoint into a single span, and return the combined spans ordered by start. The input may arrive in any order.',
    beforeWriting: 'Two things bite here: the input is unordered, and a booking that ends exactly where the next begins should still merge. Does your sweep handle both?',
    signature: 'solve(intervals)',
    starterCode: 'def solve(intervals):\n    # merge overlapping OR touching bookings; return spans ordered by start\n    ...',
    hints: [
      'Put the bookings in order by start first, then sweep through once, extending the current span whenever the next booking begins at or before the current span ends.',
      'Use "at or before" (not strictly before) so a booking that touches the current span exactly at its end still merges.',
    ],
    solution: 'def solve(intervals):\n    if not intervals:\n        return []\n    intervals = sorted(intervals)\n    merged = [list(intervals[0])]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged',
    compare: { kind: 'seq' },
    debrief: 'The bookings [[4,7],[1,4],[9,11]] collapse to [[1,7],[9,11]]: once ordered, [1,4] and [4,7] touch at 4 and merge, while [9,11] stands alone. Two traps lurk. Skipping the sort sweeps the unordered input directly and merges the wrong pair, returning [[4,7],[9,11]]. Using a strict "<" instead of "<=" leaves the touching pair split, returning [[1,4],[4,7],[9,11]]. Both run; only sort-then-sweep with an inclusive comparison handles unordered input and exact-touch merges.',
    canonicalMethodId: 'sort_sweep',
    methods: [
      { id: 'sort_sweep', name: 'order by start, then sweep with inclusive touch', code: 'if not intervals:\n    return []\nintervals = sorted(intervals)\nmerged = [list(intervals[0])]\nfor start, end in intervals[1:]:\n    if start <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)\n    else:\n        merged.append([start, end])\nreturn merged', detectionSignature: { mustMatch: ['sorted', '<='], mustNotMatch: [], note: 'ordered input, inclusive touch' }, tradeoff: 'Ordering then a single sweep; inclusive comparison merges touching spans.', breaksWhen: 'Nothing here — it is the reference.', isTrap: false },
      { id: 'no_sort', name: 'sweep without ordering first', code: 'if not intervals:\n    return []\nmerged = [list(intervals[0])]\nfor start, end in intervals[1:]:\n    if start <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)\n    else:\n        merged.append([start, end])\nreturn merged', detectionSignature: { mustMatch: [], mustNotMatch: ['sorted'], note: 'assumes the input is already ordered' }, tradeoff: 'Reads correct and runs on already-ordered input.', breaksWhen: 'Whenever the input is not already ordered by start — out-of-order bookings are compared against the wrong current span, so overlaps are missed and the wrong pairs merge.', isTrap: true },
      { id: 'strict_touch', name: 'sweep with a strictly-before comparison', code: 'if not intervals:\n    return []\nintervals = sorted(intervals)\nmerged = [list(intervals[0])]\nfor start, end in intervals[1:]:\n    if start < merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)\n    else:\n        merged.append([start, end])\nreturn merged', detectionSignature: { mustMatch: ['<'], mustNotMatch: ['<='], note: 'excludes the exact-touch case' }, tradeoff: 'Looks almost identical; runs.', breaksWhen: 'When one booking ends exactly where the next begins — the strict comparison treats the touch as a gap and leaves the pair split.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does sweeping without sorting first miss overlaps?', options: ['sort_sweep', 'no_sort', 'strict_touch'], answerId: 'no_sort', explanation: 'The sweep compares each booking against the current span, which is only valid if bookings arrive ordered by start. On unordered input, a later booking can begin before the current span and be compared against the wrong span, so genuine overlaps are missed.' },
      { id: 'q2', stem: 'Why does a strict "<" comparison leave touching bookings split?', options: ['sort_sweep', 'no_sort', 'strict_touch'], answerId: 'strict_touch', explanation: 'A booking that begins exactly where the current span ends touches it and should merge. A strict "<" treats start == end as a gap, so the touching pair is recorded as two separate spans instead of one.' },
    ],
  },

];

export default problems;

// pyLabBatch_internals — the last two worlds (D-PL-29 / Track 2): Python Internals + Code Craft.
// Internals: is-vs-==, mutable default, late-binding closure, generator exhaustion, the
// __eq__/__hash__ contract, shallow-vs-deep copy. Code Craft: integer division, off-by-one,
// don\'t-mutate-inputs, numeric-vs-lexical, case-normalisation. Every trap RUNS AND DIVERGES
// (proven in CPython) — these are runs-but-wrong internals bugs, not syntax errors.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_int_isvseq': {
    args: ['data', 'target'],
    setup: 'data = [int("1000"), 500, int("1000")]\ntarget = int("1000")',
    preview: 'data: ids parsed from text (two are 1000, distinct objects); target = 1000. Value 1000 appears twice.',
  },
  'fx_int_batches': {
    args: ['batches'],
    setup: 'batches = [[1, 2], [3]]',
    preview: 'batches: two independent batches. Each should be tagged into a FRESH list.',
  },
  'fx_int_laten': {
    args: ['n'],
    setup: 'n = 3',
    preview: 'n = 3 → build 3 multiplier functions (×0, ×1, ×2), then call each on 10.',
  },
  'fx_int_signs': {
    args: ['nums'],
    setup: 'nums = [1, -2, 3, -4, 5]',
    preview: 'nums with 3 positives (1, 3, 5). Need both their count and their sum.',
  },
  'fx_int_coords': {
    args: ['coords'],
    setup: 'coords = [(1, 2), (1, 2), (3, 4)]',
    preview: 'coords: (1,2) appears twice, (3,4) once → 2 distinct points.',
  },
  'fx_int_matrix': {
    args: ['matrix'],
    setup: 'matrix = [[1, 2], [3, 4]]',
    preview: 'matrix: a 2x2 grid of lists. A copy will be edited; the ORIGINAL must stay unchanged.',
  },
  'fx_cc_mean': {
    args: ['xs'],
    setup: 'xs = [1, 2, 2]',
    preview: 'xs = [1, 2, 2] → the true average is 1.667, not 1.',
  },
  'fx_cc_n': {
    args: ['n'],
    setup: 'n = 5',
    preview: 'n = 5 → sum of 1..5 inclusive is 15.',
  },
  'fx_cc_unsorted': {
    args: ['xs'],
    setup: 'xs = [3, 1, 2]',
    preview: 'xs = [3, 1, 2] → return the sorted copy AND the untouched original.',
  },
  'fx_cc_amounts': {
    args: ['amounts'],
    setup: 'amounts = ["9", "100", "50"]',
    preview: 'amounts as text: numeric max is 100, but "9" sorts last alphabetically.',
  },
  'fx_cc_tags': {
    args: ['tags'],
    setup: 'tags = ["A", "a", "B"]',
    preview: 'tags: "A" and "a" are the same tag case-insensitively → 2 distinct.',
  },
};

export const problems = [

  // ───────────────── int-is-vs-eq ─────────────────
  {
    id: 'int-is-vs-eq',
    title: 'Count matches — is vs ==',
    topic: 'internals',
    difficulty: 'core',
    tags: ['identity', 'is-vs-eq', 'int-caching'],
    estimatedMin: 6,
    fixtureId: 'fx_int_isvseq',
    prompt: 'Count how many values in data equal target. The ids were parsed from text, so equal values are separate objects in memory.',
    beforeWriting: '`is` asks "the same object?"; `==` asks "the same value?". For comparing numbers, which one do you actually want?',
    signature: 'solve(data, target)',
    starterCode: 'def solve(data, target):\n    # count values equal to target\n    ...',
    hints: [
      'You want value equality, not object identity.',
      '`is` only coincidentally works for small cached ints (-5..256); for anything else it compares memory addresses.',
    ],
    solution: 'def solve(data, target):\n    return sum(1 for x in data if x == target)',
    compare: { kind: 'value' },
    debrief: 'The value 1000 appears twice, so the count is 2.\n\n**Wrong answer that runs:** using `x is target` compares object identity. Because these 1000s were built at runtime they are distinct objects, so `is` is False for all of them and the count comes back 0. It runs and returns an int — it just answered "how many are the SAME OBJECT as target", which is not the question.\n\n**Sanity check:** `is` is only for singletons like None. If your count is 0 for values you can see are equal, you compared identity — swap `is` for `==`. (It would have "worked" only if the ints were in the -5..256 cache, which is the trap.)',
    canonicalMethodId: 'eq',
    methods: [
      { id: 'eq', name: 'value equality (==)', code: 'return sum(1 for x in data if x == target)', detectionSignature: { mustMatch: ['== target'], mustNotMatch: [], note: 'compares value' }, tradeoff: 'Compares value — the right question for numbers.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'is_identity', name: 'identity (is)', code: 'return sum(1 for x in data if x is target)', detectionSignature: { mustMatch: ['is target'], mustNotMatch: [], note: 'compares object identity' }, tradeoff: 'Looks equivalent and even "works" in a REPL with small ints.', breaksWhen: 'Any int outside the -5..256 cache (or objects built at runtime) — `is` compares memory identity, so equal values that are distinct objects do not match.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does `x is target` under-count?', options: ['eq', 'is_identity'], answerId: 'is_identity', explanation: '`is` tests whether two names point at the SAME object. These equal 1000s are separate objects, so `is` is False. `==` tests value, which is what equality means for numbers. `is` is reserved for None and other singletons.' },
    ],
  },

  // ───────────────── int-mutable-default ─────────────────
  {
    id: 'int-mutable-default',
    title: 'The mutable default argument',
    topic: 'internals',
    difficulty: 'core',
    tags: ['mutable-default', 'functions', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_int_batches',
    prompt: 'For each batch (a list of items), collect its items into a fresh list, and return the list of per-batch results. Each batch must start empty and not carry items from a previous batch.',
    beforeWriting: 'A default argument is evaluated ONCE, when the function is defined. If that default is a list, what happens to it across calls?',
    signature: 'solve(batches)',
    starterCode: 'def solve(batches):\n    # collect each batch into its OWN fresh list\n    ...',
    hints: [
      'A `def f(acc=[])` default list is created once and shared by every call.',
      'Use `acc=None` and create a new list inside — the classic fix.',
    ],
    solution: 'def solve(batches):\n    def tag(items, acc=None):\n        if acc is None:\n            acc = []\n        for it in items:\n            acc.append(it)\n        return list(acc)\n    return [tag(b) for b in batches]',
    compare: { kind: 'seq' },
    debrief: 'Each batch is independent, so the result is [[1, 2], [3]].\n\n**Wrong answer that runs:** giving the helper `acc=[]` as its default reuses ONE list across every call. The first batch leaves [1, 2] in it, so the second batch appends 3 onto that and returns [1, 2, 3] → [[1, 2], [1, 2, 3]]. It runs and returns per-batch lists; the later batches just silently inherit the earlier ones.\n\n**Sanity check:** the total items across your output lists must equal the total items in the input. If a later batch is longer than its input, a shared default list is leaking state between calls.',
    canonicalMethodId: 'none_default',
    methods: [
      { id: 'none_default', name: 'acc=None, create inside', code: 'def tag(items, acc=None):\n    if acc is None:\n        acc = []\n    for it in items:\n        acc.append(it)\n    return list(acc)\nreturn [tag(b) for b in batches]', detectionSignature: { mustMatch: ['acc=None'], mustNotMatch: [], note: 'fresh list per call' }, tradeoff: 'A None sentinel, then a fresh list per call — the idiomatic fix.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'mutable_default', name: 'acc=[] default', code: 'def tag(items, acc=[]):\n    for it in items:\n        acc.append(it)\n    return list(acc)\nreturn [tag(b) for b in batches]', detectionSignature: { mustMatch: ['acc=[]'], mustNotMatch: [], note: 'one shared list, evaluated once' }, tradeoff: 'Reads like it makes a new list each time.', breaksWhen: 'Every call after the first — the default list is created once at definition and shared, so state leaks across calls.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does batch 2 come back with batch 1\'s items?', options: ['none_default', 'mutable_default'], answerId: 'mutable_default', explanation: 'A default argument is evaluated once, at definition time. `acc=[]` creates a single list shared by all calls, so items accumulate across batches. Use `acc=None` and build a fresh list inside.' },
    ],
  },

  // ───────────────── int-late-binding ─────────────────
  {
    id: 'int-late-binding',
    title: 'Closures in a loop (late binding)',
    topic: 'internals',
    difficulty: 'core',
    tags: ['closures', 'late-binding', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_int_laten',
    prompt: 'Build n functions where function i multiplies its argument by i (so ×0, ×1, …, ×(n-1)). Call each on 10 and return the results in order.',
    beforeWriting: 'A closure captures the VARIABLE i, not its value at creation time. What is i by the time you actually call the functions?',
    signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # n functions: the i-th multiplies by i; call each on 10\n    ...',
    hints: [
      'All the lambdas close over the same i, which keeps changing in the loop.',
      'Bind the current value with a default arg (lambda x, k=i: ...) so each function keeps its own k.',
    ],
    solution: 'def solve(n):\n    fns = [lambda x, k=i: x * k for i in range(n)]\n    return [f(10) for f in fns]',
    compare: { kind: 'seq' },
    debrief: 'Each function keeps its own multiplier, so calling on 10 gives [0, 10, 20].\n\n**Wrong answer that runs:** `lambda x: x * i` closes over the loop variable i, which by the time you call the functions has settled on its final value (2). So every function multiplies by 2 → [20, 20, 20]. It runs and returns n results; they are just all computed with the last i.\n\n**Sanity check:** if every function gives the same answer, they all captured the same (final) loop variable. Bind the value at creation with a default arg (k=i) so each closure freezes its own.',
    canonicalMethodId: 'capture',
    methods: [
      { id: 'capture', name: 'bind with default arg', code: 'fns = [lambda x, k=i: x * k for i in range(n)]\nreturn [f(10) for f in fns]', detectionSignature: { mustMatch: ['k=i'], mustNotMatch: [], note: 'freezes i per closure' }, tradeoff: 'A default arg captures the current i by value — each closure keeps its own.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'late_bind', name: 'close over the loop var', code: 'fns = [lambda x: x * i for i in range(n)]\nreturn [f(10) for f in fns]', detectionSignature: { mustMatch: ['x * i'], mustNotMatch: ['k=i'], note: 'all share the same i' }, tradeoff: 'Looks like each lambda gets its own i.', breaksWhen: 'Always — the lambdas share one variable i; by call time it holds its final value, so every function behaves identically.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why do all the functions multiply by the same number?', options: ['capture', 'late_bind'], answerId: 'late_bind', explanation: 'Closures capture the variable, not its value. All the lambdas reference the same i, which finishes the loop at n-1, so each call uses that final value. A default arg (k=i) freezes the value at creation.' },
    ],
  },

  // ───────────────── int-generator-exhaustion ─────────────────
  {
    id: 'int-generator-exhaustion',
    title: 'A generator is consumed once',
    topic: 'internals',
    difficulty: 'core',
    tags: ['generators', 'iterators', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_int_signs',
    prompt: 'For the positive numbers only, return a two-element list: [how many there are, their sum].',
    beforeWriting: 'A generator yields each item once and is then empty. If you count it and then sum it, what is left to sum?',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # [count of positives, sum of positives]\n    ...',
    hints: [
      'If you build a generator and iterate it once, the second pass sees nothing.',
      'Materialise the positives into a list, then both count and sum that list.',
    ],
    solution: 'def solve(nums):\n    pos = [x for x in nums if x > 0]\n    return [len(pos), sum(pos)]',
    compare: { kind: 'seq' },
    debrief: 'The positives are 1, 3, 5 → [3, 9].\n\n**Wrong answer that runs:** building a generator `(x for x in nums if x > 0)` and then doing `sum(1 for _ in gen)` for the count EXHAUSTS it, so the following `sum(gen)` sees an empty iterator and returns 0 → [3, 0]. It runs and returns two numbers; the second is silently zero because the generator was already spent.\n\n**Sanity check:** if a total is 0 while the count is positive, you iterated a one-shot generator twice. Store the items in a list first, then count and sum the list.',
    canonicalMethodId: 'materialize',
    methods: [
      { id: 'materialize', name: 'materialise to a list', code: 'pos = [x for x in nums if x > 0]\nreturn [len(pos), sum(pos)]', detectionSignature: { mustMatch: ['[x for x in nums'], mustNotMatch: [], note: 'a reusable list' }, tradeoff: 'Build the list once, then count and sum it — reusable.', breaksWhen: 'Nothing for this task; a huge stream might prefer two passes or a single accumulating loop.', isTrap: false },
      { id: 'exhaust_gen', name: 'reuse a generator', code: 'gen = (x for x in nums if x > 0)\nreturn [sum(1 for _ in gen), sum(gen)]', detectionSignature: { mustMatch: ['(x for x in nums'], mustNotMatch: [], note: 'consumed by the first pass' }, tradeoff: 'Feels memory-efficient (no list).', breaksWhen: 'The moment you iterate it twice — the first pass exhausts it, so the second computes over nothing.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the sum 0?', options: ['materialize', 'exhaust_gen'], answerId: 'exhaust_gen', explanation: 'A generator can be iterated only once. Counting it first drains it, so the subsequent sum iterates an empty generator and returns 0. Materialise to a list to iterate more than once.' },
    ],
  },

  // ───────────────── int-eq-hash-contract ─────────────────
  {
    id: 'int-eq-hash-contract',
    title: 'The __eq__ / __hash__ contract',
    topic: 'internals',
    difficulty: 'stretch',
    tags: ['dunder', 'eq-hash', 'sets'],
    estimatedMin: 8,
    fixtureId: 'fx_int_coords',
    prompt: 'Build a small Point class for the given (x, y) coordinates and return the number of DISTINCT points, where two points are equal when their coordinates match. Use a set to dedup.',
    beforeWriting: 'A set groups items by hash first, then checks equality within a bucket. If two "equal" points hash differently, will the set ever compare them?',
    signature: 'solve(coords)',
    starterCode: 'def solve(coords):\n    # define Point with value equality, then count distinct via a set\n    ...',
    hints: [
      'For a set to dedup by value, equal objects must ALSO hash equal.',
      'Define __hash__ from the same fields as __eq__ (e.g. hash((x, y))). An identity-based hash breaks dedup.',
    ],
    solution: 'def solve(coords):\n    class P:\n        def __init__(s, x, y):\n            s.x = x; s.y = y\n        def __eq__(s, o):\n            return (s.x, s.y) == (o.x, o.y)\n        def __hash__(s):\n            return hash((s.x, s.y))\n    pts = [P(x, y) for x, y in coords]\n    return len(set(pts))',
    compare: { kind: 'value' },
    debrief: 'There are 2 distinct points, since (1,2) repeats.\n\n**Wrong answer that runs:** defining __eq__ but keeping an identity-based hash (`__hash__ = object.__hash__`) means the two equal (1,2) points hash to different buckets, so the set never even compares them and treats them as distinct → 3. It runs and returns a count; equal objects just failed to collapse because their hashes disagreed.\n\n**Sanity check:** the invariant is a == b ⟹ hash(a) == hash(b). If your set has more elements than there are distinct values, __hash__ is inconsistent with __eq__ (or missing).',
    canonicalMethodId: 'eq_and_hash',
    methods: [
      { id: 'eq_and_hash', name: '__eq__ and matching __hash__', code: 'class P:\n    def __init__(s, x, y):\n        s.x = x; s.y = y\n    def __eq__(s, o):\n        return (s.x, s.y) == (o.x, o.y)\n    def __hash__(s):\n        return hash((s.x, s.y))\npts = [P(x, y) for x, y in coords]\nreturn len(set(pts))', detectionSignature: { mustMatch: ['__hash__'], mustNotMatch: ['object.__hash__'], note: 'hash from the same fields as eq' }, tradeoff: 'Hash and equality use the same fields — the set dedups by value.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'eq_id_hash', name: '__eq__ with identity hash', code: 'class P:\n    def __init__(s, x, y):\n        s.x = x; s.y = y\n    def __eq__(s, o):\n        return (s.x, s.y) == (o.x, o.y)\n    __hash__ = object.__hash__\npts = [P(x, y) for x, y in coords]\nreturn len(set(pts))', detectionSignature: { mustMatch: ['object.__hash__'], mustNotMatch: [], note: 'hash by id, eq by value — inconsistent' }, tradeoff: 'Keeps the object hashable so the set does not raise.', breaksWhen: 'Whenever equal objects need to dedup — identity hashing sends equal values to different buckets, so the set never merges them.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the set keep both (1,2) points?', options: ['eq_and_hash', 'eq_id_hash'], answerId: 'eq_id_hash', explanation: 'A set buckets by hash before checking equality. Identity-based hashing gives equal points different hashes, so they land in different buckets and are never compared. Equal objects must hash equal.' },
    ],
  },

  // ───────────────── int-shallow-vs-deep ─────────────────
  {
    id: 'int-shallow-vs-deep',
    title: 'Shallow copy shares the inner lists',
    topic: 'internals',
    difficulty: 'core',
    tags: ['copy', 'shallow-deep', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_int_matrix',
    prompt: 'Make a copy of the matrix, set the top-left cell of the COPY to 999, and return the ORIGINAL matrix — which must be unchanged.',
    beforeWriting: 'A shallow copy duplicates the outer list but shares the inner lists. If you edit a cell through the copy, whose row do you actually change?',
    signature: 'solve(matrix)',
    starterCode: 'def solve(matrix):\n    # copy, edit the copy, return the untouched original\n    ...',
    hints: [
      'matrix[:] or list(matrix) copies only the outer list; the rows are still shared.',
      'copy.deepcopy duplicates the nested lists too, so edits to the copy do not touch the original.',
    ],
    solution: 'def solve(matrix):\n    import copy\n    c = copy.deepcopy(matrix)\n    c[0][0] = 999\n    return matrix',
    compare: { kind: 'seq' },
    debrief: 'The original is untouched → [[1, 2], [3, 4]].\n\n**Wrong answer that runs:** `c = matrix[:]` copies only the outer list; both matrices still point at the SAME inner rows. So `c[0][0] = 999` reaches into the shared row and the original becomes [[999, 2], [3, 4]]. It runs and returns the matrix — mutated, because the copy was only skin-deep.\n\n**Sanity check:** after editing the copy, the original should be identical to before. If a cell changed in the original too, your copy shared its inner lists — use copy.deepcopy for nested structures.',
    canonicalMethodId: 'deep',
    methods: [
      { id: 'deep', name: 'copy.deepcopy', code: 'import copy\nc = copy.deepcopy(matrix)\nc[0][0] = 999\nreturn matrix', detectionSignature: { mustMatch: ['deepcopy'], mustNotMatch: [], note: 'duplicates nested lists' }, tradeoff: 'Duplicates the nested lists — edits to the copy cannot reach the original.', breaksWhen: 'Deepcopy is heavier; for flat structures a shallow copy is fine.', isTrap: false },
      { id: 'shallow', name: 'matrix[:] (shallow)', code: 'c = matrix[:]\nc[0][0] = 999\nreturn matrix', detectionSignature: { mustMatch: ['matrix[:]'], mustNotMatch: ['deepcopy'], note: 'shares the inner rows' }, tradeoff: 'Cheap, and fine if you never touch the inner objects.', breaksWhen: 'Any nested mutation — the inner lists are shared, so editing the copy mutates the original.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why did the original matrix change?', options: ['deep', 'shallow'], answerId: 'shallow', explanation: 'matrix[:] copies the outer list only; the inner rows are shared between both. Editing a cell through the copy mutates the shared row. copy.deepcopy duplicates the nested lists.' },
    ],
  },

  // ───────────────── cc-safe-mean-intdiv ─────────────────
  {
    id: 'cc-safe-mean-intdiv',
    title: 'Average — true division, not floor',
    topic: 'code-craft',
    difficulty: 'core',
    tags: ['integer-division', 'correctness', 'code-review'],
    estimatedMin: 4,
    fixtureId: 'fx_cc_mean',
    prompt: 'Return the average (arithmetic mean) of the list of integers as a number.',
    beforeWriting: 'The inputs are ints. Which division keeps the fractional part — / or // ?',
    signature: 'solve(xs)',
    starterCode: 'def solve(xs):\n    # arithmetic mean\n    ...',
    hints: [
      'The mean of integers is usually not an integer.',
      '`//` floors the result; `/` keeps the fraction.',
    ],
    solution: 'def solve(xs):\n    return sum(xs) / len(xs)',
    compare: { kind: 'float' },
    debrief: 'The mean of 1, 2, 2 is 5/3 ≈ 1.667.\n\n**Wrong answer that runs:** using `//` (floor division) returns 5 // 3 = 1 — a clean-looking integer that has silently dropped the fractional part. It runs and returns a number; it is just the floored mean, wrong by two-thirds here.\n\n**Sanity check:** an average of integers is rarely a whole number. If your result has no decimals, you probably used `//` where you meant `/`.',
    canonicalMethodId: 'true_div',
    methods: [
      { id: 'true_div', name: 'true division (/)', code: 'return sum(xs) / len(xs)', detectionSignature: { mustMatch: ['/ len'], mustNotMatch: ['// len'], note: 'keeps the fraction' }, tradeoff: 'True division keeps the fractional part — the actual mean.', breaksWhen: 'Empty list divides by zero; guard if that is possible.', isTrap: false },
      { id: 'floor_div', name: 'floor division (//)', code: 'return sum(xs) // len(xs)', detectionSignature: { mustMatch: ['// len'], mustNotMatch: [], note: 'drops the fraction' }, tradeoff: 'Returns a tidy integer.', breaksWhen: 'Whenever the mean is not a whole number — `//` floors it, so the average is silently rounded down.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is `sum(xs) // len(xs)` the wrong mean?', options: ['true_div', 'floor_div'], answerId: 'floor_div', explanation: '`//` is floor division: it discards the fractional part, so 5//3 is 1, not 1.667. Use `/` for a real average.' },
    ],
  },

  // ───────────────── cc-off-by-one-sum ─────────────────
  {
    id: 'cc-off-by-one-sum',
    title: 'Sum 1..n inclusive (off-by-one)',
    topic: 'code-craft',
    difficulty: 'core',
    tags: ['off-by-one', 'range', 'code-review'],
    estimatedMin: 4,
    fixtureId: 'fx_cc_n',
    prompt: 'Return the sum of all integers from 1 to n, inclusive of n.',
    beforeWriting: 'range(1, n) stops BEFORE n. What upper bound includes n itself?',
    signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # 1 + 2 + ... + n\n    ...',
    hints: [
      'range excludes its stop value.',
      'To include n, the stop has to be n + 1.',
    ],
    solution: 'def solve(n):\n    return sum(range(1, n + 1))',
    compare: { kind: 'value' },
    debrief: '1+2+3+4+5 = 15.\n\n**Wrong answer that runs:** `range(1, n)` stops at n-1, so it sums 1..4 = 10 and drops the final term. It runs and returns an int; it is just short by n because range excludes its stop value.\n\n**Sanity check:** the largest term in your sum should be n. For n=5 the answer is 15 (= n(n+1)/2); 10 means you excluded n.',
    canonicalMethodId: 'inclusive',
    methods: [
      { id: 'inclusive', name: 'range(1, n+1)', code: 'return sum(range(1, n + 1))', detectionSignature: { mustMatch: ['n + 1'], mustNotMatch: [], note: 'includes n' }, tradeoff: 'stop = n+1 includes n — the inclusive sum.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'exclusive', name: 'range(1, n)', code: 'return sum(range(1, n))', detectionSignature: { mustMatch: ['range(1, n)'], mustNotMatch: ['n + 1'], note: 'stops at n-1' }, tradeoff: 'Reads like "1 to n".', breaksWhen: 'Always for an inclusive sum — range stops before n, dropping the last term.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does range(1, n) miss the answer?', options: ['inclusive', 'exclusive'], answerId: 'exclusive', explanation: 'range excludes its stop value, so range(1, n) yields 1..n-1 and drops n. Use range(1, n+1) for an inclusive sum.' },
    ],
  },

  // ───────────────── cc-no-mutate-input ─────────────────
  {
    id: 'cc-no-mutate-input',
    title: 'Sort a copy, leave the input alone',
    topic: 'code-craft',
    difficulty: 'stretch',
    tags: ['no-mutate-inputs', 'sorted-vs-sort', 'code-review'],
    estimatedMin: 6,
    fixtureId: 'fx_cc_unsorted',
    prompt: 'Return a two-element list: [the sorted version of xs, the original xs unchanged]. The caller still needs xs in its original order, so your function must not mutate it.',
    beforeWriting: 'sorted(xs) returns a new list; xs.sort() sorts in place. Which one leaves the caller\'s list untouched?',
    signature: 'solve(xs)',
    starterCode: 'def solve(xs):\n    # return [sorted copy, original untouched]\n    ...',
    hints: [
      '.sort() mutates the list it is called on — the caller sees the change.',
      'sorted(xs) returns a new sorted list and leaves xs alone.',
    ],
    solution: 'def solve(xs):\n    srt = sorted(xs)\n    return [srt, xs]',
    compare: { kind: 'seq' },
    debrief: 'Sorted copy plus the untouched original → [[1, 2, 3], [3, 1, 2]].\n\n**Wrong answer that runs:** `xs.sort()` sorts the caller\'s list IN PLACE, then returning [xs, xs] gives [[1, 2, 3], [1, 2, 3]] — the "original" has been reordered too. It runs and returns two lists; it just destroyed the input the caller still needed.\n\n**Sanity check:** the second element must equal the input in its original order. If it comes back sorted, you mutated the argument — use sorted() (returns a copy), not .sort() (in place).\n\n**Interviewer follow-up:** why is mutating an argument dangerous even when it "works" here? Callers do not expect a read to reorder their data; it causes action-at-a-distance bugs.',
    canonicalMethodId: 'copy_sort',
    methods: [
      { id: 'copy_sort', name: 'sorted() copy', code: 'srt = sorted(xs)\nreturn [srt, xs]', detectionSignature: { mustMatch: ['sorted(xs)'], mustNotMatch: ['.sort()'], note: 'new list, input untouched' }, tradeoff: 'sorted() returns a new list; the caller\'s xs is left exactly as it was.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'inplace_sort', name: 'xs.sort() in place', code: 'xs.sort()\nreturn [xs, xs]', detectionSignature: { mustMatch: ['xs.sort()'], mustNotMatch: [], note: 'mutates the caller\'s list' }, tradeoff: 'Saves an allocation.', breaksWhen: 'Whenever the caller still needs the original order — .sort() reorders the argument in place, a side effect the caller did not ask for.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the in-place version corrupt the "original"?', options: ['copy_sort', 'inplace_sort'], answerId: 'inplace_sort', explanation: 'xs.sort() mutates the passed-in list, so the caller\'s data is reordered as a side effect. sorted(xs) returns a new list and leaves the argument untouched.' },
    ],
  },

  // ───────────────── cc-numeric-vs-lexical ─────────────────
  {
    id: 'cc-numeric-vs-lexical',
    title: 'Max of numbers stored as text',
    topic: 'code-craft',
    difficulty: 'core',
    tags: ['typing', 'string-vs-number', 'code-review'],
    estimatedMin: 5,
    fixtureId: 'fx_cc_amounts',
    prompt: 'The amounts are numbers stored as text. Return the largest amount as an int.',
    beforeWriting: 'max() on strings compares them character by character. Is "9" bigger or smaller than "100" that way?',
    signature: 'solve(amounts)',
    starterCode: 'def solve(amounts):\n    # the largest amount, as a number\n    ...',
    hints: [
      'Comparing the strings sorts them like words: "100" comes before "9".',
      'Convert to int before comparing (or pass key=int).',
    ],
    solution: 'def solve(amounts):\n    return max(int(a) for a in amounts)',
    compare: { kind: 'value' },
    debrief: 'The numeric max of 9, 100, 50 is 100.\n\n**Wrong answer that runs:** `int(max(amounts))` takes the max of the STRINGS first — lexicographically "9" > "100" (it compares "9" vs "1"), so it picks "9" and returns 9. It runs and returns an int; it just compared text order, where "9" beats "100".\n\n**Sanity check:** convert to numbers BEFORE comparing. If a single-digit value beats a three-digit one, you compared strings, not numbers.',
    canonicalMethodId: 'numeric',
    methods: [
      { id: 'numeric', name: 'convert, then max', code: 'return max(int(a) for a in amounts)', detectionSignature: { mustMatch: ['int(a) for a'], mustNotMatch: [], note: 'compare as numbers' }, tradeoff: 'Parse to int first, then compare — numeric order.', breaksWhen: 'Non-numeric text needs validation; here all parse.', isTrap: false },
      { id: 'lexical', name: 'max of strings, then int', code: 'return int(max(amounts))', detectionSignature: { mustMatch: ['max(amounts)'], mustNotMatch: ['int(a) for'], note: 'string comparison first' }, tradeoff: 'Shorter, and it runs.', breaksWhen: 'Whenever the values are numeric text of different lengths — string max compares character by character, so "9" outranks "100".', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does max() on the strings pick "9"?', options: ['numeric', 'lexical'], answerId: 'lexical', explanation: 'String comparison is lexicographic: it compares "9" vs "1" and stops — "9" is greater, so "100" loses. Convert to int before comparing to get numeric order.' },
    ],
  },

  // ───────────────── cc-case-insensitive-distinct ─────────────────
  {
    id: 'cc-case-insensitive-distinct',
    title: 'Distinct tags, case-insensitive',
    topic: 'code-craft',
    difficulty: 'core',
    tags: ['normalization', 'typing', 'correctness'],
    estimatedMin: 4,
    fixtureId: 'fx_cc_tags',
    prompt: 'Count how many DISTINCT tags there are, treating tags that differ only in letter case as the same (so "A" and "a" count once).',
    beforeWriting: 'A set dedups exact values. Do you need to normalise the case before you put them in?',
    signature: 'solve(tags)',
    starterCode: 'def solve(tags):\n    # distinct count, ignoring case\n    ...',
    hints: [
      'A raw set treats "A" and "a" as different.',
      'Lowercase each tag before adding it to the set.',
    ],
    solution: 'def solve(tags):\n    return len(set(t.lower() for t in tags))',
    compare: { kind: 'value' },
    debrief: '"A"/"a" collapse to one, plus "B" → 2 distinct.\n\n**Wrong answer that runs:** `len(set(tags))` dedups exact strings, so "A" and "a" stay separate and it returns 3. It runs and returns a count; it just never normalised case, so the same tag in two casings is counted twice.\n\n**Sanity check:** if two tags differing only in case are counted separately, you skipped normalisation. Lowercase (or casefold) before deduping.',
    canonicalMethodId: 'normalized',
    methods: [
      { id: 'normalized', name: 'lowercase, then set', code: 'return len(set(t.lower() for t in tags))', detectionSignature: { mustMatch: ['.lower()'], mustNotMatch: [], note: 'normalise before dedup' }, tradeoff: 'Normalise case first — "A" and "a" collapse.', breaksWhen: 'Unicode edge cases may want casefold() instead of lower(); fine here.', isTrap: false },
      { id: 'case_sensitive', name: 'set of raw tags', code: 'return len(set(tags))', detectionSignature: { mustMatch: ['set(tags)'], mustNotMatch: ['.lower()'], note: 'exact-string dedup' }, tradeoff: 'Simple exact dedup.', breaksWhen: 'When case should not matter — "A" and "a" are kept separate, over-counting distinct tags.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does set(tags) over-count?', options: ['normalized', 'case_sensitive'], answerId: 'case_sensitive', explanation: 'A set keys on exact value, so "A" and "a" are different members. Normalising case (lower/casefold) before deduping makes them collapse to one.' },
    ],
  },

];

export default problems;

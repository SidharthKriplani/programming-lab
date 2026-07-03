// pyLabBatch_warmups — the fluency floor (D-PL-29 / Track 2): an easy on-ramp for the newer
// worlds (data-craft, ai-ml, code-craft) + a few data-structure reflexes. Single obvious
// approach each → difficulty 'warmup', level 'fluency', EMPTY dial, no trap (honesty rule).
// Every solution executed in CPython before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_w_users': {
    args: ['events'],
    setup: 'import pandas as pd\nevents = pd.DataFrame({"user_id": [1, 1, 2, 3, 3]})',
    preview: 'events: user_ids 1,1,2,3,3 → 3 distinct users.',
  },
  'fx_w_vecs': {
    args: ['a', 'b'],
    setup: 'import numpy as np\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])',
    preview: 'a=[1,2,3], b=[4,5,6] → dot = 1*4 + 2*5 + 3*6 = 32.',
  },
  'fx_w_points': {
    args: ['a', 'b'],
    setup: 'import numpy as np\na = np.array([0.0, 0.0])\nb = np.array([3.0, 4.0])',
    preview: 'a=(0,0), b=(3,4) → straight-line distance is 5 (the 3-4-5 triangle).',
  },
  'fx_w_x': {
    args: ['x'],
    setup: 'import numpy as np\nx = np.array([2.0, 4.0, 6.0])',
    preview: 'x=[2,4,6] → mean 4.',
  },
  'fx_w_clamp': {
    args: ['x', 'lo', 'hi'],
    setup: 'x = 12\nlo = 0\nhi = 10',
    preview: 'x=12, range [0,10] → clamped to 10.',
  },
  'fx_w_ab': {
    args: ['a', 'b'],
    setup: 'a = 3\nb = 8',
    preview: 'a=3, b=8 → absolute difference 5.',
  },
  'fx_w_dups': {
    args: ['xs'],
    setup: 'xs = [3, 3, 1, 2, 2, 2]',
    preview: 'xs with repeats → 3 distinct values (1, 2, 3).',
  },
  'fx_w_ints': {
    args: ['xs'],
    setup: 'xs = [1, 2, 3, 4, 5, 6]',
    preview: 'xs 1..6 → even numbers 2,4,6 sum to 12.',
  },
  'fx_w_str': {
    args: ['s'],
    setup: 's = "hello"',
    preview: 's="hello" → reversed "olleh".',
  },
};

const warm = (o) => ({ difficulty: 'warmup', dial: { axes: [], rules: [] }, mcqs: [], ...o });

export const problems = [

  warm({
    id: 'dc-distinct-users',
    title: 'Count distinct users',
    topic: 'data-craft',
    tags: ['count', 'nunique', 'fluency'],
    estimatedMin: 3,
    fixtureId: 'fx_w_users',
    prompt: 'Each row is one event by a user. Return the number of distinct users, as an int.',
    signature: 'solve(events)',
    starterCode: 'def solve(events):\n    # how many distinct users\n    ...',
    hints: ['You want unique user_ids, not the row count.', 'Series.nunique() counts distinct values.'],
    solution: 'def solve(events):\n    return int(events["user_id"].nunique())',
    compare: { kind: 'value' },
    debrief: 'Three distinct user_ids (1, 2, 3), so the answer is 3. nunique() counts unique values; len() would count rows.',
    canonicalMethodId: 'nunique',
    methods: [{ id: 'nunique', name: 'nunique()', code: 'return int(events["user_id"].nunique())', tradeoff: 'Counts distinct values directly.', breaksWhen: 'Nothing here — the direct answer.', isTrap: false }],
  }),

  warm({
    id: 'mlx-dot-product',
    title: 'Dot product of two vectors',
    topic: 'ml-scratch',
    tags: ['numpy', 'dot-product', 'fluency'],
    estimatedMin: 3,
    fixtureId: 'fx_w_vecs',
    prompt: 'Return the dot product of the two vectors a and b (multiply elementwise, then add), as a number.',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # elementwise multiply, then sum\n    ...',
    hints: ['Pair up the elements, multiply, then add the products.', 'np.dot(a, b) does it in one call.'],
    solution: 'def solve(a, b):\n    return float(np.dot(a, b))',
    compare: { kind: 'float' },
    debrief: '1*4 + 2*5 + 3*6 = 32. np.dot multiplies elementwise and sums.',
    canonicalMethodId: 'dot',
    methods: [{ id: 'dot', name: 'np.dot', code: 'return float(np.dot(a, b))', tradeoff: 'The built-in elementwise-multiply-and-sum.', breaksWhen: 'Vectors must be the same length.', isTrap: false }],
  }),

  warm({
    id: 'mlx-euclidean-distance',
    title: 'Euclidean distance',
    topic: 'ml-scratch',
    tags: ['numpy', 'distance', 'fluency'],
    estimatedMin: 3,
    fixtureId: 'fx_w_points',
    prompt: 'Return the straight-line (Euclidean) distance between points a and b, as a number.',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # straight-line distance between a and b\n    ...',
    hints: ['Distance is the length of the difference vector (a - b).', 'np.linalg.norm gives a vector\'s length.'],
    solution: 'def solve(a, b):\n    return float(np.linalg.norm(a - b))',
    compare: { kind: 'float' },
    debrief: 'From (0,0) to (3,4) is 5 — the length of the difference vector. np.linalg.norm(a - b) computes it.',
    canonicalMethodId: 'norm',
    methods: [{ id: 'norm', name: 'norm of the difference', code: 'return float(np.linalg.norm(a - b))', tradeoff: 'The length of a - b is the distance.', breaksWhen: 'Points must have the same shape.', isTrap: false }],
  }),

  warm({
    id: 'mlx-vector-mean',
    title: 'Mean of a vector',
    topic: 'ml-scratch',
    tags: ['numpy', 'mean', 'fluency'],
    estimatedMin: 2,
    fixtureId: 'fx_w_x',
    prompt: 'Return the mean (average) of the array x, as a number.',
    signature: 'solve(x)',
    starterCode: 'def solve(x):\n    # average of the array\n    ...',
    hints: ['Sum divided by count.', 'x.mean() does it directly.'],
    solution: 'def solve(x):\n    return float(x.mean())',
    compare: { kind: 'float' },
    debrief: '(2 + 4 + 6) / 3 = 4. x.mean() averages the array.',
    canonicalMethodId: 'mean',
    methods: [{ id: 'mean', name: 'x.mean()', code: 'return float(x.mean())', tradeoff: 'The direct average.', breaksWhen: 'An empty array has no mean.', isTrap: false }],
  }),

  warm({
    id: 'cc-clamp',
    title: 'Clamp a value to a range',
    topic: 'code-craft',
    tags: ['clamp', 'min-max', 'fluency'],
    estimatedMin: 3,
    fixtureId: 'fx_w_clamp',
    prompt: 'Return x limited to the range [lo, hi]: if x is below lo return lo, if above hi return hi, otherwise x itself.',
    signature: 'solve(x, lo, hi)',
    starterCode: 'def solve(x, lo, hi):\n    # keep x within [lo, hi]\n    ...',
    hints: ['Pull x down to hi if it is too big, then push it up to lo if it is too small.', 'max(lo, min(x, hi)) clamps in one line.'],
    solution: 'def solve(x, lo, hi):\n    return max(lo, min(x, hi))',
    compare: { kind: 'value' },
    debrief: 'x=12 is above hi=10, so it clamps to 10. max(lo, min(x, hi)) caps at hi then floors at lo.',
    canonicalMethodId: 'clamp',
    methods: [{ id: 'clamp', name: 'max(lo, min(x, hi))', code: 'return max(lo, min(x, hi))', tradeoff: 'Caps at hi, then floors at lo — the standard clamp.', breaksWhen: 'Assumes lo <= hi.', isTrap: false }],
  }),

  warm({
    id: 'cc-abs-diff',
    title: 'Absolute difference',
    topic: 'code-craft',
    tags: ['abs', 'arithmetic', 'fluency'],
    estimatedMin: 2,
    fixtureId: 'fx_w_ab',
    prompt: 'Return the absolute difference between a and b (always non-negative).',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # |a - b|\n    ...',
    hints: ['Subtract, then drop the sign.', 'abs() makes any number non-negative.'],
    solution: 'def solve(a, b):\n    return abs(a - b)',
    compare: { kind: 'value' },
    debrief: '|3 - 8| = 5. abs() removes the sign so the result is order-independent.',
    canonicalMethodId: 'absdiff',
    methods: [{ id: 'absdiff', name: 'abs(a - b)', code: 'return abs(a - b)', tradeoff: 'Subtract and drop the sign.', breaksWhen: 'Nothing here.', isTrap: false }],
  }),

  warm({
    id: 'ds-unique-count',
    title: 'Count unique values',
    topic: 'idioms',
    tags: ['set', 'count', 'fluency'],
    estimatedMin: 2,
    fixtureId: 'fx_w_dups',
    prompt: 'Return how many distinct values are in the list.',
    signature: 'solve(xs)',
    starterCode: 'def solve(xs):\n    # number of distinct values\n    ...',
    hints: ['A set drops duplicates.', 'len(set(xs)) is the count of distinct values.'],
    solution: 'def solve(xs):\n    return len(set(xs))',
    compare: { kind: 'value' },
    debrief: 'The distinct values are 1, 2, 3 → 3. A set removes duplicates; len() counts what remains.',
    canonicalMethodId: 'set_len',
    methods: [{ id: 'set_len', name: 'len(set(xs))', code: 'return len(set(xs))', tradeoff: 'Dedup with a set, count the result.', breaksWhen: 'Elements must be hashable.', isTrap: false }],
  }),

  warm({
    id: 'ds-sum-of-evens',
    title: 'Sum of the even numbers',
    topic: 'idioms',
    tags: ['comprehension', 'filter', 'fluency'],
    estimatedMin: 3,
    fixtureId: 'fx_w_ints',
    prompt: 'Return the sum of only the even numbers in the list.',
    signature: 'solve(xs)',
    starterCode: 'def solve(xs):\n    # sum of the even values\n    ...',
    hints: ['A number is even when x % 2 == 0.', 'Filter to evens inside sum() with a generator expression.'],
    solution: 'def solve(xs):\n    return sum(x for x in xs if x % 2 == 0)',
    compare: { kind: 'value' },
    debrief: '2 + 4 + 6 = 12. The generator keeps only the evens (x % 2 == 0) and sum() adds them.',
    canonicalMethodId: 'sum_evens',
    methods: [{ id: 'sum_evens', name: 'sum with a filter', code: 'return sum(x for x in xs if x % 2 == 0)', tradeoff: 'Filter to evens, then sum — one pass.', breaksWhen: 'Nothing here.', isTrap: false }],
  }),

  warm({
    id: 'ds-reverse-string',
    title: 'Reverse a string',
    topic: 'idioms',
    tags: ['string', 'slice', 'fluency'],
    estimatedMin: 2,
    fixtureId: 'fx_w_str',
    prompt: 'Return the string s reversed.',
    signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # s, reversed\n    ...',
    hints: ['A slice with a negative step walks the string backwards.', 's[::-1] reverses it.'],
    solution: 'def solve(s):\n    return s[::-1]',
    compare: { kind: 'value' },
    debrief: '"hello" reversed is "olleh". The slice s[::-1] steps through the string backwards.',
    canonicalMethodId: 'slice',
    methods: [{ id: 'slice', name: 's[::-1]', code: 'return s[::-1]', tradeoff: 'A negative-step slice reverses in one expression.', breaksWhen: 'Nothing here.', isTrap: false }],
  }),

];

export default problems;

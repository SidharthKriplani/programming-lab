// pyLabBatch_drills3 — migration batch: famous Python drills + numpy/ML primitives (18 problems)
// from the legacy pythonProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// Topic map (spec-constrained, no invented topics): the numeric/ML primitives
// (rmse, minmax-normalize, accuracy, cosine, one-hot, softmax) -> 'numpy-vectorize';
// every algorithmic / recursion drill (intervals, greedy scans, factorial/fib/power/gcd,
// flatten) -> 'python-core'.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside; \n for newlines; escape PROSE apostrophes as \' ; NO template literals / backticks.
//
// Every solution + method + trap VERIFIED in CPython (numpy 2.2) via pl_compare:
// 8 single-method (empty dial, honesty rule), 10 multi-method (each carries >=1 trap that
// RUNS and DIVERGES on VALUES, not just dtype). Expected output is NEVER stored - computed
// from `solve`. solution renamed to solve(...); args from the source example.inputs.
//
// Fixtures engineered so the traps actually fire: min-meeting-rooms uses a TRIPLE overlap
// (the pairwise-only trap caps at 2 there); max-subarray uses an ALL-NEGATIVE run (the
// clamp-at-zero trap returns 0 there); best-buy-sell uses a STRICTLY DECREASING feed (the
// high-minus-low trap "sells before it buys"); softmax uses LARGE logits (~1000) so the
// naive-exp path overflows to NaN; gas-station EXACTLY breaks even (sum gas == sum cost).

export const fixtures = {
  // rmse: a clean residual mix - one exact match, two over, one under - so sqrt/mean both bite.
  'fx_rmse_pred': {
    args: ['y_true', 'y_pred'],
    setup: 'y_true = [3, 5, 2, 7]\ny_pred = [2.5, 5, 4, 8]',
    preview: 'y_true, y_pred (len 4). Residuals 0.5, 0, -2, -1; mean squared error 1.3125, its root ~1.1456.',
  },
  // minmax: an ascending trio with a clean span (min 10, max 30) -> 0, 0.5, 1.
  'fx_feature_col': {
    args: ['x'],
    setup: 'x = [10, 20, 30]',
    preview: 'x = [10, 20, 30]. Span 20, so the scaled values are 0.0, 0.5, 1.0. A constant column would divide by a zero span.',
  },
  // accuracy: 2 of 4 labels match -> 0.5, the value the integer-divide trap floors to 0.
  'fx_labels_pred': {
    args: ['y_true', 'y_pred'],
    setup: 'y_true = [1, 0, 1, 1]\ny_pred = [1, 1, 1, 0]',
    preview: 'y_true, y_pred (len 4). Two positions match -> accuracy 0.5. Integer division of 2 // 4 floors to 0.',
  },
  // cosine: nearly-but-not-exactly aligned vectors (b is 2*a except the last entry) so the
  // normalized score (~0.997) and the raw dot (31.0) are far apart - the trap cannot hide.
  'fx_two_vectors': {
    args: ['a', 'b'],
    setup: 'a = [1, 2, 3]\nb = [2, 4, 7]',
    preview: 'a, b (len 3). Almost parallel -> cosine ~0.9974. The raw, un-normalized dot product is 31.0.',
  },
  // one-hot: three labels covering columns 0, 2, 1 across 3 classes.
  'fx_class_labels': {
    args: ['labels'],
    setup: 'labels = [0, 2, 1]',
    preview: 'labels = [0, 2, 1], 3 classes -> rows [[1,0,0],[0,0,1],[0,1,0]].',
  },
  // softmax FOOTGUN: logits near 1000 so a plain exp() overflows to inf -> NaN after the divide.
  'fx_big_logits': {
    args: ['logits'],
    setup: 'logits = [1000.0, 1001.0, 1002.0]',
    preview: 'logits = [1000.0, 1001.0, 1002.0]. exp(1002) overflows to inf, so an un-shifted softmax returns NaN; the stable form gives [0.090, 0.245, 0.665].',
  },
  // can-attend: a clear double-booking - [0,30] overlaps both later meetings.
  'fx_meetings_overlap': {
    args: ['meetings'],
    setup: 'meetings = [[0, 30], [5, 10], [15, 20]]',
    preview: 'meetings = [[0,30],[5,10],[15,20]]. The [0,30] block overlaps the other two, so all-attendable is False.',
  },
  // min-meeting-rooms FOOTGUN fixture: a TRIPLE overlap. The pairwise-only trap sees a conflict
  // but caps the answer at 2; the true peak concurrency is 3.
  'fx_meetings_triple': {
    args: ['meetings'],
    setup: 'meetings = [[1, 5], [2, 6], [3, 7]]',
    preview: 'meetings = [[1,5],[2,6],[3,7]] - all three are live at time 3, so the peak needs 3 rooms. A trap that only checks neighbouring pairs caps out at 2.',
  },
  // insert-interval: a new [4,8] that swallows three middle intervals into one [3,10].
  'fx_calendar_insert': {
    args: ['intervals', 'new'],
    setup: 'intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]]\nnew = [4, 8]',
    preview: 'intervals (sorted, disjoint) + new [4,8]. The new booking merges [3,5],[6,7],[8,10] into [3,10] -> [[1,2],[3,10],[12,16]].',
  },
  // max-subarray FOOTGUN fixture: ALL NEGATIVE. The clamp-at-zero trap returns 0; the right
  // answer is the least-bad single element, -1.
  'fx_profit_allneg': {
    args: ['nums'],
    setup: 'nums = [-3, -1, -2]',
    preview: 'nums = [-3, -1, -2], all losses. The best contiguous run is the single -1. A trap that clamps the running sum at 0 wrongly returns 0 (an empty run).',
  },
  // can-jump: a 0 at index 3 walls off index 4 - unreachable from index 0.
  'fx_jumps_stuck': {
    args: ['nums'],
    setup: 'nums = [3, 2, 1, 0, 4]',
    preview: 'nums = [3,2,1,0,4]. The farthest reach stalls at index 3 (a 0), so the last index is unreachable -> False.',
  },
  // best-buy-sell FOOTGUN fixture: STRICTLY DECREASING. No profit is possible (answer 0); the
  // high-minus-low trap returns 6 by pairing the early high with the late low (selling first).
  'fx_prices_falling': {
    args: ['prices'],
    setup: 'prices = [7, 6, 4, 3, 1]',
    preview: 'prices = [7,6,4,3,1], only falling. No buy-then-later-sell makes money -> 0. The high-minus-low trap returns 7-1=6 by "selling" before it buys.',
  },
  // gas-station FOOTGUN fixture: sum(gas) == sum(cost) - EXACTLY breaks even. A loop exists
  // (start 3). A trap that forgets to reset the tank on a dip lands on the wrong start.
  'fx_gas_loop': {
    args: ['gas', 'cost'],
    setup: 'gas = [1, 2, 3, 4, 5]\ncost = [3, 4, 5, 1, 2]',
    preview: 'gas, cost (len 5), totals tie at 15 - exactly break-even. The only valid start is index 3. Forgetting to zero the tank after a dip yields index 4.',
  },
  // factorial: 5! = 120.
  'fx_n_five': {
    args: ['n'],
    setup: 'n = 5',
    preview: 'n = 5 -> 5! = 120.',
  },
  // fibonacci: fib(10) = 55. The wrong-base trap (starting 1,1) returns 89 here.
  'fx_n_ten': {
    args: ['n'],
    setup: 'n = 10',
    preview: 'n = 10 -> fib(10) = 55 (0-indexed: fib(0)=0). Seeding the pair at 1,1 instead of 0,1 returns 89.',
  },
  // fast-power: 3 ** 5 = 243. An odd exponent so the low bit must be handled.
  'fx_base_exp': {
    args: ['base', 'exp'],
    setup: 'base = 3\nexp = 5',
    preview: 'base = 3, exp = 5 -> 243. The exponent is odd, so a loop that stops one step early drops the final factor.',
  },
  // flatten-nested: ints mixed with lists nested two deep.
  'fx_nested_list': {
    args: ['nested'],
    setup: 'nested = [1, [2, 3], [4, [5, 6]]]',
    preview: 'nested = [1, [2, 3], [4, [5, 6]]] -> [1, 2, 3, 4, 5, 6].',
  },
  // gcd: 48 and 18 share gcd 6.
  'fx_two_ints': {
    args: ['a', 'b'],
    setup: 'a = 48\nb = 18',
    preview: 'a = 48, b = 18 -> gcd 6.',
  },
};

export const problems = [

  // ───────────────────── numpy-vectorize · rmse · multi-method + sqrt/mean traps ─────────────────────
  {
    id: 'pylab-rmse',
    title: 'Typical error of a forecast',
    topic: 'numpy-vectorize',
    difficulty: 'warmup',
    tags: ['numpy', 'metrics', 'error'],
    estimatedMin: 5,
    fixtureId: 'fx_rmse_pred',
    prompt: 'Given the actual values and a model\'s predictions for the same set of points, return a single number summarising how far off the predictions typically are, in the original units. Penalise larger misses more than small ones, then bring the figure back to the scale of the data.',
    signature: 'solve(y_true, y_pred)',
    starterCode: 'def solve(y_true, y_pred):\n    # one number: the typical prediction error, in the data\'s own units\n    ...',
    hints: [
      'Square each gap between prediction and truth so big misses dominate, then take the average of those squares.',
      'That average is in squared units - take its root to get back to the scale of the original values.',
    ],
    solution: 'def solve(y_true, y_pred):\n    import numpy as np\n    yt = np.asarray(y_true, dtype=float)\n    yp = np.asarray(y_pred, dtype=float)\n    return float(np.sqrt(np.mean((yt - yp) ** 2)))',
    compare: { kind: 'float', rtol: 1e-6 },
    debrief: 'The residuals are 0.5, 0, -2, -1; the mean of their squares is 1.3125 and its root is ~1.1456 - that is the answer. Two separate traps run cleanly and return the wrong number. Skip the final root and you report 1.3125, the mean SQUARED error, which is in squared units and reads far too large. Skip the mean and sum the squares instead, and you get sqrt(5.25) ~ 2.2913, a figure that grows with sample size instead of describing a typical point. Both steps - average the squares, then take the root - are load-bearing; drop either and the magnitude is wrong while the code still runs.',
    canonicalMethodId: 'root_mean_sq',
    methods: [
      { id: 'root_mean_sq', name: 'square, mean, root', code: 'import numpy as np\nyt = np.asarray(y_true, dtype=float)\nyp = np.asarray(y_pred, dtype=float)\nreturn float(np.sqrt(np.mean((yt - yp) ** 2)))', detectionSignature: { mustMatch: ['sqrt', 'mean'], mustNotMatch: [], note: 'mean of squared residuals, then its root' }, tradeoff: 'The direct, vectorized error figure in the data\'s own units.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'forgot_sqrt', name: 'mean squared error (no root)', code: 'import numpy as np\nyt = np.asarray(y_true, dtype=float)\nyp = np.asarray(y_pred, dtype=float)\nreturn float(np.mean((yt - yp) ** 2))', detectionSignature: { mustMatch: ['mean'], mustNotMatch: ['sqrt'], note: 'stops at the mean of squares - squared units' }, tradeoff: 'Runs and returns a plausible-looking error number.', breaksWhen: 'Always here - it is the mean SQUARED error (1.3125), still in squared units, so the magnitude is wrong against any real-unit threshold.', isTrap: true },
      { id: 'forgot_mean', name: 'root of the sum (no mean)', code: 'import numpy as np\nyt = np.asarray(y_true, dtype=float)\nyp = np.asarray(y_pred, dtype=float)\nreturn float(np.sqrt(np.sum((yt - yp) ** 2)))', detectionSignature: { mustMatch: ['sqrt', 'sum'], mustNotMatch: ['mean'], note: 'sums the squares instead of averaging them' }, tradeoff: 'Looks almost right and runs.', breaksWhen: 'Always here - summing instead of averaging gives sqrt(5.25) ~ 2.2913, a figure that keeps growing with the number of points rather than describing a typical error.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does dropping the square root report a number that is too large?', options: ['root_mean_sq', 'forgot_sqrt', 'forgot_mean'], answerId: 'forgot_sqrt', explanation: 'Without the root the result is the mean SQUARED error - it lives in squared units, so it cannot be compared against a tolerance stated in the data\'s real units. The root brings it back to scale.' },
      { id: 'q2', stem: 'Why does summing the squared residuals instead of averaging them mislead?', options: ['root_mean_sq', 'forgot_mean'], answerId: 'forgot_mean', explanation: 'A sum grows with the number of points, so the same typical error looks worse on a larger sample. Averaging first makes the figure a per-point error that is stable as the dataset grows.' },
    ],
  },

  // ───────────────────── numpy-vectorize · minmax-normalize · single-method ─────────────────────
  {
    id: 'pylab-minmax-normalize',
    title: 'Rescale a feature to a common range',
    topic: 'numpy-vectorize',
    difficulty: 'warmup',
    tags: ['numpy', 'scaling', 'feature'],
    estimatedMin: 4,
    fixtureId: 'fx_feature_col',
    prompt: 'Given a column of numbers, rescale it so the smallest becomes 0, the largest becomes 1, and everything else lands proportionally between. If every value is identical, return all zeros instead of failing on the flat column.',
    signature: 'solve(x)',
    starterCode: 'def solve(x):\n    # rescale onto [0, 1]; an all-equal column returns all zeros\n    ...',
    hints: [
      'Shift the column so its smallest value sits at 0, then divide by how wide the column is.',
      'A column where every value is the same has zero width - guard that case and return zeros rather than dividing by zero.',
    ],
    solution: 'def solve(x):\n    import numpy as np\n    arr = np.asarray(x, dtype=float)\n    lo = arr.min()\n    hi = arr.max()\n    span = hi - lo\n    if span == 0:\n        return np.zeros_like(arr)\n    return (arr - lo) / span',
    compare: { kind: 'array', float: true, rtol: 1e-6 },
    debrief: 'The trio [10, 20, 30] rescales to [0.0, 0.5, 1.0]: subtract the minimum and divide by the span of 20. The one footgun worth guarding is a flat column - if every value is equal the span is 0 and the divide produces NaNs across the board, which silently corrupts the feature. Returning zeros in that case keeps the column usable. There is one honest way to scale onto [0, 1], so no method dial - this is a fluency rep, with the zero-span guard as the only judgement.',
    canonicalMethodId: 'scale_span',
    methods: [
      { id: 'scale_span', name: 'subtract min, divide by span', code: 'import numpy as np\narr = np.asarray(x, dtype=float)\nlo = arr.min()\nhi = arr.max()\nspan = hi - lo\nif span == 0:\n    return np.zeros_like(arr)\nreturn (arr - lo) / span', detectionSignature: { mustMatch: ['min', 'max'], mustNotMatch: [], note: 'shift by the minimum, scale by the span, guard a zero span' }, tradeoff: 'The direct, vectorized rescale with a divide-by-zero guard.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── numpy-vectorize · accuracy · multi-method + integer-divide trap ─────────────────────
  {
    id: 'pylab-accuracy-score',
    title: 'Share of correct predictions',
    topic: 'numpy-vectorize',
    difficulty: 'warmup',
    tags: ['numpy', 'metrics', 'classification'],
    estimatedMin: 4,
    fixtureId: 'fx_labels_pred',
    prompt: 'Given a model\'s predicted labels and the true labels for the same items, return the fraction that match as a number between 0 and 1. An empty input returns 0.0 rather than failing.',
    signature: 'solve(y_true, y_pred)',
    starterCode: 'def solve(y_true, y_pred):\n    # fraction of positions where prediction equals truth; 0.0 if empty\n    ...',
    hints: [
      'Compare the two label sequences position by position - each spot is either a match or not.',
      'The fraction correct is the count of matches over the total - keep the division in real numbers so a count like 2 out of 4 stays 0.5, not 0.',
    ],
    solution: 'def solve(y_true, y_pred):\n    import numpy as np\n    yt = np.asarray(y_true)\n    yp = np.asarray(y_pred)\n    if yt.size == 0:\n        return 0.0\n    return float(np.mean(yt == yp))',
    compare: { kind: 'float', rtol: 1e-6 },
    debrief: 'Two of the four positions match, so the accuracy is 0.5. The trap counts the matches correctly (2) but divides with integer floor division - 2 // 4 is 0, not 0.5 - and returns 0.0, claiming the model got nothing right. It runs without error because both operands are integers; the floor is the silent killer. Averaging the boolean match array (or dividing in floating point) keeps the fraction honest. The empty-input guard avoids a 0/0 NaN on a quiet batch.',
    canonicalMethodId: 'mean_of_matches',
    methods: [
      { id: 'mean_of_matches', name: 'average the matches', code: 'import numpy as np\nyt = np.asarray(y_true)\nyp = np.asarray(y_pred)\nif yt.size == 0:\n    return 0.0\nreturn float(np.mean(yt == yp))', detectionSignature: { mustMatch: ['mean'], mustNotMatch: ['//'], note: 'mean over the boolean match array - True counts as 1.0' }, tradeoff: 'Correct - the boolean mean is the fraction correct, in floating point.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'integer_divide', name: 'count, then floor-divide', code: 'import numpy as np\nyt = np.asarray(y_true)\nyp = np.asarray(y_pred)\nif yt.size == 0:\n    return 0.0\ncorrect = int(np.sum(yt == yp))\nreturn float(correct // len(yt))', detectionSignature: { mustMatch: ['//'], mustNotMatch: [], note: 'integer floor division collapses any fraction to 0' }, tradeoff: 'Counts the matches correctly and runs.', breaksWhen: 'Any accuracy below 1.0 - floor division of correct // total drops the fraction to 0, so 2 of 4 reads as 0.0 instead of 0.5.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the floor-division version report 0.0 on a half-right model?', options: ['mean_of_matches', 'integer_divide'], answerId: 'integer_divide', explanation: 'correct // total is integer floor division: 2 // 4 is 0. Any accuracy that is not exactly a whole number collapses to 0. Dividing in floating point (or taking the boolean mean) preserves the 0.5.' },
    ],
  },

  // ───────────────────── numpy-vectorize · cosine · multi-method + un-normalized trap ─────────────────────
  {
    id: 'pylab-cosine-similarity',
    title: 'How aligned are two vectors',
    topic: 'numpy-vectorize',
    difficulty: 'core',
    tags: ['numpy', 'similarity', 'embeddings'],
    estimatedMin: 6,
    fixtureId: 'fx_two_vectors',
    prompt: 'Given two equal-length numeric vectors, return a score in [-1, 1] for how closely they point the same direction, ignoring how long either one is. If either vector is all zeros, return 0.0.',
    beforeWriting: 'Two vectors can point the exact same way but have very different lengths. What has to happen so length stops affecting the score?',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # direction-only similarity in [-1, 1]; 0.0 if either vector is all zeros\n    ...',
    hints: [
      'The aligned-ness of two vectors comes from their dot product - but that number also grows with their lengths.',
      'Divide the dot product by each vector\'s length so only direction remains; guard against a zero-length vector.',
    ],
    solution: 'def solve(a, b):\n    import numpy as np\n    va = np.asarray(a, dtype=float)\n    vb = np.asarray(b, dtype=float)\n    na = np.linalg.norm(va)\n    nb = np.linalg.norm(vb)\n    if na == 0 or nb == 0:\n        return 0.0\n    return float(np.dot(va, vb) / (na * nb))',
    compare: { kind: 'float', rtol: 1e-6 },
    debrief: 'The two vectors are almost parallel, so the aligned score is ~0.9974 - close to 1 but not quite, because b\'s last entry breaks perfect proportionality. The trap returns the raw dot product, 31.0, which is not even on the right scale: a similarity is meant to sit in [-1, 1], and 31 is a magnitude, not a direction. The fix divides the dot product by each vector\'s length, cancelling magnitude so only direction survives. The zero-length guard avoids dividing by zero on an empty embedding. One honest computation - the trap is purely the missing normalisation.',
    canonicalMethodId: 'normalize_dot',
    methods: [
      { id: 'normalize_dot', name: 'dot product over the lengths', code: 'import numpy as np\nva = np.asarray(a, dtype=float)\nvb = np.asarray(b, dtype=float)\nna = np.linalg.norm(va)\nnb = np.linalg.norm(vb)\nif na == 0 or nb == 0:\n    return 0.0\nreturn float(np.dot(va, vb) / (na * nb))', detectionSignature: { mustMatch: ['norm'], mustNotMatch: [], note: 'divides the dot product by both vector lengths' }, tradeoff: 'Correct - magnitude cancels, leaving a direction-only score in [-1, 1].', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'raw_dot', name: 'the bare dot product', code: 'import numpy as np\nva = np.asarray(a, dtype=float)\nvb = np.asarray(b, dtype=float)\nreturn float(np.dot(va, vb))', detectionSignature: { mustMatch: ['dot'], mustNotMatch: ['norm'], note: 'skips the length division - magnitude leaks into the score' }, tradeoff: 'Runs and returns a single number.', breaksWhen: 'Always here - without dividing by the lengths the result (31.0) carries magnitude and escapes the [-1, 1] range, so it is not a similarity at all.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is the bare dot product not a usable similarity score?', options: ['normalize_dot', 'raw_dot'], answerId: 'raw_dot', explanation: 'The dot product scales with both vectors\' lengths, so it can land anywhere (here 31.0) instead of inside [-1, 1]. Dividing by each length cancels magnitude, leaving a pure measure of how aligned the directions are.' },
    ],
  },

  // ───────────────────── numpy-vectorize · one-hot · single-method ─────────────────────
  {
    id: 'pylab-one-hot',
    title: 'Turn labels into indicator rows',
    topic: 'numpy-vectorize',
    difficulty: 'core',
    tags: ['numpy', 'encoding', 'categorical'],
    estimatedMin: 5,
    fixtureId: 'fx_class_labels',
    prompt: 'Given a list of integer class labels and the total number of classes, return one row per label where the position matching that label is 1 and every other position is 0. Return the rows as a plain nested list.',
    signature: 'solve(labels)',
    starterCode: 'def solve(labels):\n    # one row per label; a 1 in the label\'s column, 0 elsewhere; return a nested list\n    num_classes = 3\n    ...',
    hints: [
      'Start from a block of zeros with one row per label and one column per class.',
      'For each label, set a single position in its row to 1 - the position is the label value itself.',
    ],
    solution: 'def solve(labels):\n    import numpy as np\n    arr = np.zeros((len(labels), 3), dtype=int)\n    for row, lab in enumerate(labels):\n        arr[row, lab] = 1\n    return arr.tolist()',
    compare: { kind: 'array', float: false },
    debrief: 'Labels [0, 2, 1] over 3 classes give rows [[1,0,0],[0,0,1],[0,1,0]] - each row is all zeros except a single 1 at the column named by the label. The natural shape is a zero block sized rows-by-classes, then one assignment per row to flip exactly one cell on. There is one honest construction here, so no method dial - it is a fluency rep. (The label value doubles as the column index, which is why the labels must already be 0-based integers below the class count.)',
    canonicalMethodId: 'index_assign',
    methods: [
      { id: 'index_assign', name: 'zero block, flip one cell per row', code: 'import numpy as np\narr = np.zeros((len(labels), 3), dtype=int)\nfor row, lab in enumerate(labels):\n    arr[row, lab] = 1\nreturn arr.tolist()', detectionSignature: { mustMatch: ['zeros'], mustNotMatch: [], note: 'allocate zeros, set one position per row to 1' }, tradeoff: 'The direct, readable encode - one write per row.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── numpy-vectorize · softmax · multi-method + overflow trap ─────────────────────
  {
    id: 'pylab-softmax',
    title: 'Turn scores into a probability split',
    topic: 'numpy-vectorize',
    difficulty: 'core',
    tags: ['numpy', 'probability', 'stability', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_big_logits',
    prompt: 'Given a list of raw scores, return a set of positive weights that sum to 1, where larger scores get proportionally larger weights. It must stay reliable even when the scores are very large numbers.',
    beforeWriting: 'Raising e to a large number can blow past the largest value a float can hold. What can you subtract from every score, without changing the final weights, to keep the exponentials small?',
    signature: 'solve(logits)',
    starterCode: 'def solve(logits):\n    # positive weights summing to 1; must survive very large scores\n    ...',
    hints: [
      'Exponentiate each score and divide each by the total of all the exponentials so they sum to 1.',
      'Subtracting a constant from every score before exponentiating leaves the result identical - subtract the largest score so the biggest exponent becomes e^0 = 1 and nothing overflows.',
    ],
    solution: 'def solve(logits):\n    import numpy as np\n    z = np.asarray(logits, dtype=float)\n    shifted = z - np.max(z)\n    exps = np.exp(shifted)\n    return exps / np.sum(exps)',
    compare: { kind: 'array', float: true, rtol: 1e-6 },
    debrief: 'These scores sit near 1000, which is exactly where the footgun fires. The correct weights are [0.090, 0.245, 0.665]. The naive route - exponentiate the raw scores and divide by their total - calls exp(1002), which overflows a float to inf; dividing inf by inf yields NaN across the whole output. It runs (no exception, just a warning) and returns garbage. Subtracting the largest score from every score first leaves the weights mathematically unchanged but caps the biggest exponent at e^0 = 1, so nothing overflows. The shift is the entire fix; without it the function is correct on small inputs and silently broken on large ones.',
    canonicalMethodId: 'shift_by_max',
    methods: [
      { id: 'shift_by_max', name: 'subtract the max, then exponentiate', code: 'import numpy as np\nz = np.asarray(logits, dtype=float)\nshifted = z - np.max(z)\nexps = np.exp(shifted)\nreturn exps / np.sum(exps)', detectionSignature: { mustMatch: ['max'], mustNotMatch: [], note: 'shift by the maximum before exp - identical result, no overflow' }, tradeoff: 'Correct and stable - the shift cannot change the weights but prevents overflow.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'naive_exp', name: 'exponentiate the raw scores', code: 'import numpy as np\nz = np.asarray(logits, dtype=float)\nexps = np.exp(z)\nreturn exps / np.sum(exps)', detectionSignature: { mustMatch: ['exp'], mustNotMatch: ['max'], note: 'no shift - exp of a large score overflows to inf' }, tradeoff: 'Correct on small scores, and runs (with only a warning) on large ones.', breaksWhen: 'Large scores - exp(1002) overflows to inf, and inf/inf gives NaN for every weight, so the output is silently all NaN.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the un-shifted version return all NaN on scores near 1000?', options: ['shift_by_max', 'naive_exp'], answerId: 'naive_exp', explanation: 'exp(1000+) exceeds the largest representable float and becomes inf. Dividing inf by the inf total yields NaN for every entry. Subtracting the max first caps the largest exponent at e^0 = 1, so the exponentials stay finite while the weights are unchanged.' },
    ],
  },

  // ───────────────────── python-core · can-attend · single-method ─────────────────────
  {
    id: 'pylab-can-attend',
    title: 'Any double-booked meetings?',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['intervals', 'sort', 'boolean'],
    estimatedMin: 4,
    fixtureId: 'fx_meetings_overlap',
    prompt: 'Given a list of meetings as [start, end] times, return True if one person could attend all of them with no clashes, else False. A meeting that ends exactly when the next begins does not clash.',
    signature: 'solve(meetings)',
    starterCode: 'def solve(meetings):\n    # True if no two meetings overlap\n    ...',
    hints: [
      'Put the meetings in time order first - once ordered, a clash can only be between a meeting and the one right after it.',
      'A clash means the next meeting starts strictly before the current one ends; touching end-to-start is fine.',
    ],
    solution: 'def solve(meetings):\n    meetings = sorted(meetings)\n    for i in range(1, len(meetings)):\n        if meetings[i][0] < meetings[i - 1][1]:\n            return False\n    return True',
    compare: { kind: 'value' },
    debrief: 'The [0, 30] block overlaps both other meetings, so the answer is False. Once the meetings are sorted by start time, the only place a clash can hide is between neighbours - if any meeting starts before the previous one ends, there is an overlap. The strict less-than is what lets a meeting end exactly as the next begins without counting it as a clash. There is one honest way to express this, so no method dial - a fluency rep.',
    canonicalMethodId: 'sort_neighbors',
    methods: [
      { id: 'sort_neighbors', name: 'sort, then check neighbours', code: 'meetings = sorted(meetings)\nfor i in range(1, len(meetings)):\n    if meetings[i][0] < meetings[i - 1][1]:\n        return False\nreturn True', detectionSignature: { mustMatch: ['sorted'], mustNotMatch: [], note: 'order by start, a clash is a neighbour starting before the prior end' }, tradeoff: 'The direct sort-then-scan check.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── python-core · min-meeting-rooms · multi-method + pairwise-only trap ─────────────────────
  {
    id: 'pylab-min-meeting-rooms',
    title: 'Rooms needed at the busiest moment',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['intervals', 'sort', 'concurrency', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_meetings_triple',
    prompt: 'Given a list of meetings as [start, end] times, return the smallest number of rooms needed so no two meetings that run at the same time share a room.',
    beforeWriting: 'The answer is the most meetings happening AT ONCE, not just whether any two overlap. How do you count peak concurrency rather than the number of overlapping pairs?',
    signature: 'solve(meetings)',
    starterCode: 'def solve(meetings):\n    # the peak number of simultaneously-running meetings\n    ...',
    hints: [
      'Think about a timeline: every start adds one live meeting, every end frees one. The answer is the highest the live count ever reaches.',
      'Walk the start times and end times in sorted order together, raising a running count on each start and lowering it on each end that has already passed.',
    ],
    solution: 'def solve(meetings):\n    starts = sorted(m[0] for m in meetings)\n    ends = sorted(m[1] for m in meetings)\n    rooms = 0\n    best = 0\n    j = 0\n    for s in starts:\n        while j < len(ends) and ends[j] <= s:\n            rooms -= 1\n            j += 1\n        rooms += 1\n        best = max(best, rooms)\n    return best',
    compare: { kind: 'value' },
    debrief: 'All three meetings are live at time 3, so the answer is 3 rooms. The trap only ever checks whether neighbouring meetings overlap and caps its count at 2 - it detects that a clash exists but never measures how many pile up at once, so on this triple overlap it returns 2 and silently under-provisions. Both honest methods measure true concurrency: sweep the sorted starts and ends together, raising a count on each start and lowering it as ends pass, tracking the peak; or push each meeting\'s end time onto a heap and let the heap\'s size at its largest be the room count. They agree; the start/end sweep avoids the heap\'s per-step overhead.',
    canonicalMethodId: 'sweep_starts_ends',
    methods: [
      { id: 'sweep_starts_ends', name: 'sweep sorted starts and ends', code: 'starts = sorted(m[0] for m in meetings)\nends = sorted(m[1] for m in meetings)\nrooms = 0\nbest = 0\nj = 0\nfor s in starts:\n    while j < len(ends) and ends[j] <= s:\n        rooms -= 1\n        j += 1\n    rooms += 1\n    best = max(best, rooms)\nreturn best', detectionSignature: { mustMatch: ['starts', 'ends'], mustNotMatch: ['heapq'], note: 'two sorted pointers track live concurrency, peak is the answer' }, tradeoff: 'One light pass over the sorted boundaries; no auxiliary structure to maintain.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'heap_of_ends', name: 'heap of end times', code: 'import heapq\nif not meetings:\n    return 0\nmeetings = sorted(meetings)\nheap = []\nbest = 0\nfor s, e in meetings:\n    while heap and heap[0] <= s:\n        heapq.heappop(heap)\n    heapq.heappush(heap, e)\n    best = max(best, len(heap))\nreturn best', detectionSignature: { mustMatch: ['heapq'], mustNotMatch: [], note: 'heap holds active end times; its peak size is the room count' }, tradeoff: 'Same answer and very explicit about which rooms are still busy, at the cost of heap pushes and pops.', breaksWhen: 'Nothing for this task - just carries the heap\'s overhead the sweep avoids.', isTrap: false },
      { id: 'pairwise_only', name: 'check overlapping neighbours', code: 'meetings = sorted(meetings)\nrooms = 1 if meetings else 0\nfor i in range(1, len(meetings)):\n    if meetings[i][0] < meetings[i - 1][1]:\n        rooms = max(rooms, 2)\nreturn rooms', detectionSignature: { mustMatch: ['max(rooms, 2)'], mustNotMatch: ['heapq'], note: 'only ever bumps to 2 - counts that a clash exists, not how many' }, tradeoff: 'Runs and is right whenever the peak happens to be at most 2.', breaksWhen: 'Three or more meetings overlapping at once - it caps at 2 and under-counts (returns 2 here when 3 rooms are truly needed).', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['sweep_starts_ends', 'heap_of_ends'], why: 'the two-pointer sweep does a couple of sorts and a single linear pass; the heap adds a push and a pop per meeting on top of the sort.' },
        { when: { 'readability': 'team' }, rank: ['heap_of_ends', 'sweep_starts_ends'], why: 'a heap of active end times maps directly to the mental model of "rooms still occupied", which reads more obviously than two interleaved pointers.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does the neighbour-checking version under-count on three concurrent meetings?', options: ['sweep_starts_ends', 'heap_of_ends', 'pairwise_only'], answerId: 'pairwise_only', explanation: 'It only records THAT a clash exists and bumps the count to 2; it never measures how many meetings are live simultaneously. With three overlapping at once it still returns 2, under-provisioning the rooms.' },
      { id: 'q2', stem: 'On a very large schedule, which valid method does less work per meeting?', options: ['sweep_starts_ends', 'heap_of_ends'], answerId: 'sweep_starts_ends', explanation: 'After sorting, the two-pointer sweep is a single linear pass; the heap version adds a push and a pop per meeting. Same answer, the sweep avoids the per-element heap operations. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── python-core · insert-interval · single-method ─────────────────────
  {
    id: 'pylab-insert-interval',
    title: 'Slot a booking into a clean calendar',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['intervals', 'merge', 'sweep'],
    estimatedMin: 6,
    fixtureId: 'fx_calendar_insert',
    prompt: 'Given a list of non-overlapping time slots already in start order, plus one new [start, end] slot, insert the new slot and fold together anything it touches or overlaps, returning the slots still in start order.',
    signature: 'solve(intervals, new)',
    starterCode: 'def solve(intervals, new):\n    # insert new into the sorted slots, merging anything it overlaps\n    ...',
    hints: [
      'The list is already in order, so walk it once in three stretches: slots entirely before the new one, slots that touch it, slots entirely after.',
      'While a slot overlaps the new one, widen the new slot to cover both, then drop the single merged slot in before copying the rest.',
    ],
    solution: 'def solve(intervals, new):\n    res = []\n    s, e = new[0], new[1]\n    i = 0\n    n = len(intervals)\n    while i < n and intervals[i][1] < s:\n        res.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= e:\n        s = min(s, intervals[i][0])\n        e = max(e, intervals[i][1])\n        i += 1\n    res.append([s, e])\n    while i < n:\n        res.append(intervals[i])\n        i += 1\n    return res',
    compare: { kind: 'seq' },
    debrief: 'The new slot [4, 8] reaches across [3,5], [6,7] and [8,10], folding all three into [3, 10], so the result is [[1,2],[3,10],[12,16]]. Because the input is already in start order, one pass in three stretches does it: copy every slot that ends before the new one starts, then absorb each slot that still overlaps by widening the new slot to cover both, then copy the remainder. No re-sort is needed. There is one honest path here, so no method dial - a fluency rep on the sweep.',
    canonicalMethodId: 'three_phase_sweep',
    methods: [
      { id: 'three_phase_sweep', name: 'copy, absorb, copy', code: 'res = []\ns, e = new[0], new[1]\ni = 0\nn = len(intervals)\nwhile i < n and intervals[i][1] < s:\n    res.append(intervals[i])\n    i += 1\nwhile i < n and intervals[i][0] <= e:\n    s = min(s, intervals[i][0])\n    e = max(e, intervals[i][1])\n    i += 1\nres.append([s, e])\nwhile i < n:\n    res.append(intervals[i])\n    i += 1\nreturn res', detectionSignature: { mustMatch: ['while'], mustNotMatch: [], note: 'three sequential stretches over the already-sorted slots' }, tradeoff: 'A single ordered pass - no re-sort, leans on the input already being in order.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── python-core · max-subarray · multi-method + clamp-at-zero trap ─────────────────────
  {
    id: 'pylab-max-subarray',
    title: 'Best contiguous profit streak',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['scan', 'running-sum', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_profit_allneg',
    prompt: 'Given a list of daily profit-or-loss numbers, return the largest total any unbroken run of consecutive days can reach. The run must contain at least one day, even if every day is a loss.',
    beforeWriting: 'If every single day is a loss, the best run is still one day - the least-bad one. Does your running total allow a negative answer, or does it secretly reset to zero?',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # largest sum of any contiguous run of >= 1 day\n    ...',
    hints: [
      'Sweep left to right carrying a running total; at each day, either extend the current run or start fresh from today - whichever is larger.',
      'Track the best running total ever seen. The "start fresh" choice is comparing today\'s value against the running total plus today - not against zero.',
    ],
    solution: 'def solve(nums):\n    best = cur = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    return best',
    compare: { kind: 'value' },
    debrief: 'Every day here is a loss, so the best unbroken run is the single least-bad day, -1. The trap clamps its running total at zero (max of 0 and the running sum), which quietly assumes an empty run is allowed - so on an all-negative input it returns 0, a profit that never happened. The honest scan compares today\'s value against the running-total-plus-today, never against zero, so a negative best can survive. The whole judgement is whether "restart" means start from today (correct) or reset to zero (the bug that only shows up when the answer should be negative).',
    canonicalMethodId: 'extend_or_restart',
    methods: [
      { id: 'extend_or_restart', name: 'extend the run or restart at today', code: 'best = cur = nums[0]\nfor x in nums[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nreturn best', detectionSignature: { mustMatch: ['max(x'], mustNotMatch: ['max(0'], note: 'restart compares against today\'s value, allowing a negative best' }, tradeoff: 'Correct even when every value is negative - the best can be a single negative day.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'clamp_at_zero', name: 'reset the running total to zero', code: 'best = 0\ncur = 0\nfor x in nums:\n    cur = max(0, cur + x)\n    best = max(best, cur)\nreturn best', detectionSignature: { mustMatch: ['max(0'], mustNotMatch: [], note: 'clamps the running sum at 0 - assumes an empty run is allowed' }, tradeoff: 'Correct and clean whenever at least one positive run exists.', breaksWhen: 'All-negative input - clamping at zero lets the answer be an empty run, so it returns 0 instead of the least-bad single day (-1 here).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the zero-clamping version return 0 when every day is a loss?', options: ['extend_or_restart', 'clamp_at_zero'], answerId: 'clamp_at_zero', explanation: 'Clamping the running total at 0 effectively permits an empty run worth 0, which beats any negative run. With all losses it returns 0 - a streak that never happened. Comparing against today\'s value instead keeps the best honestly negative (-1).' },
    ],
  },

  // ───────────────────── python-core · can-jump · single-method ─────────────────────
  {
    id: 'pylab-can-jump',
    title: 'Can you reach the last checkpoint?',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['scan', 'reachability', 'boolean'],
    estimatedMin: 5,
    fixtureId: 'fx_jumps_stuck',
    prompt: 'Given a list where each number is the maximum number of steps you may jump forward from that spot, return True if you can get from the first spot to the last, else False.',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # True if the last index is reachable from index 0\n    ...',
    hints: [
      'Sweep left to right tracking the farthest index you could possibly have reached so far.',
      'If you ever stand on a spot that lies beyond that farthest-reachable index, you are stranded and the answer is False.',
    ],
    solution: 'def solve(nums):\n    reach = 0\n    for i, step in enumerate(nums):\n        if i > reach:\n            return False\n        reach = max(reach, i + step)\n    return True',
    compare: { kind: 'value' },
    debrief: 'The 0 at index 3 stops all forward progress, so index 4 is unreachable and the answer is False. The single sweep carries the farthest index reachable so far; the moment the current position passes that frontier, you are stranded. Each spot widens the frontier to the larger of the current reach and where this spot could jump to. There is one honest way to track this, so no method dial - a fluency rep.',
    canonicalMethodId: 'farthest_reach',
    methods: [
      { id: 'farthest_reach', name: 'track the farthest reachable index', code: 'reach = 0\nfor i, step in enumerate(nums):\n    if i > reach:\n        return False\n    reach = max(reach, i + step)\nreturn True', detectionSignature: { mustMatch: ['reach'], mustNotMatch: [], note: 'widen the frontier each step; stranded if the position passes it' }, tradeoff: 'The direct single-pass reachability scan.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── python-core · best-buy-sell · multi-method + sell-before-buy trap ─────────────────────
  {
    id: 'pylab-best-buy-sell',
    title: 'Best single buy-then-sell',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['scan', 'running-min', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_prices_falling',
    prompt: 'Given a list of daily prices in time order, return the most profit possible from buying on one day and selling on a strictly later day. If no later day is more expensive, the profit is 0.',
    beforeWriting: 'The buy must come BEFORE the sell in time. Does pairing the lowest price with the highest price respect that order, or could it accidentally sell first?',
    signature: 'solve(prices)',
    starterCode: 'def solve(prices):\n    # most profit from one buy then a strictly later sell; 0 if impossible\n    ...',
    hints: [
      'Sweep the prices in order, carrying the cheapest price seen so far.',
      'At each day, the best sale you could make today is today\'s price minus the cheapest price seen up to today - keep the largest such gap.',
    ],
    solution: 'def solve(prices):\n    min_price = float("inf")\n    best = 0\n    for p in prices:\n        min_price = min(min_price, p)\n        best = max(best, p - min_price)\n    return best',
    compare: { kind: 'value' },
    debrief: 'The prices only fall, so there is no buy-then-later-sell that makes money - the answer is 0. The trap returns the highest price minus the lowest price (7 - 1 = 6), but the high comes first and the low comes last: it "sells" on day one and "buys" on day five, which is impossible. It runs and looks like profit. The honest scan keeps the cheapest price seen SO FAR and only ever sells at a later day, so a market that only declines correctly yields 0. The whole judgement is respecting time order - the buy must precede the sell.',
    canonicalMethodId: 'track_min',
    methods: [
      { id: 'track_min', name: 'cheapest-so-far, sell later', code: 'min_price = float("inf")\nbest = 0\nfor p in prices:\n    min_price = min(min_price, p)\n    best = max(best, p - min_price)\nreturn best', detectionSignature: { mustMatch: ['min_price'], mustNotMatch: ['max(prices)'], note: 'minimum is always to the left of the sell day - time order respected' }, tradeoff: 'Correct - the buy is always an earlier day than the sell.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'high_minus_low', name: 'highest minus lowest', code: 'if not prices:\n    return 0\nreturn max(prices) - min(prices)', detectionSignature: { mustMatch: ['max(prices)', 'min(prices)'], mustNotMatch: [], note: 'ignores order - the high can fall before the low' }, tradeoff: 'Runs and gives the right number whenever the high happens to come after the low.', breaksWhen: 'A falling (or any high-before-low) market - it pairs the early high with the late low, "selling" before "buying", and reports a phantom profit (6 here when the truth is 0).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does highest-minus-lowest report a profit on a market that only falls?', options: ['track_min', 'high_minus_low'], answerId: 'high_minus_low', explanation: 'max(prices) - min(prices) ignores when each occurs. On a falling series the maximum is the first day and the minimum is the last, so it effectively sells before it buys - an impossible trade. Tracking the cheapest price seen so far forces the buy to precede the sell.' },
    ],
  },

  // ───────────────────── python-core · gas-station · multi-method + forget-reset trap ─────────────────────
  {
    id: 'pylab-gas-station',
    title: 'Where to start the delivery loop',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['scan', 'circular', 'footgun'],
    estimatedMin: 7,
    fixtureId: 'fx_gas_loop',
    prompt: 'You drive a circular route of stations. At each station you pick up gas[i] units of fuel and it costs cost[i] units to reach the next station. Return the index of a station you could start from and complete the whole loop without the tank going negative, or -1 if none exists.',
    beforeWriting: 'When the tank runs dry partway, no station you have passed can be the start. As you move the candidate start forward past the failure, what must happen to the running tank?',
    signature: 'solve(gas, cost)',
    starterCode: 'def solve(gas, cost):\n    # index you can start from to finish the loop, else -1\n    ...',
    hints: [
      'If the total gas is less than the total cost no start can work - return -1 up front.',
      'Sweep once carrying the running tank; the moment it dips below zero, no earlier station can be the start, so move the candidate start to the next station - and reset the running tank to empty as you do.',
    ],
    solution: 'def solve(gas, cost):\n    if sum(gas) < sum(cost):\n        return -1\n    start = 0\n    tank = 0\n    for i in range(len(gas)):\n        tank += gas[i] - cost[i]\n        if tank < 0:\n            start = i + 1\n            tank = 0\n    return start',
    compare: { kind: 'value' },
    debrief: 'Total gas exactly equals total cost (both 15), so a loop is possible and the only valid start is index 3. The trap correctly moves the candidate start forward whenever the tank goes negative, but forgets to reset the running tank to empty at the same time - so the leftover deficit from the abandoned stretch bleeds into the new attempt, and it lands on index 4 instead of 3. It runs and returns a real index, just the wrong one. The honest scan zeroes the tank every time it advances the start, because the new attempt begins with an empty tank, not a carried-over shortfall. The break-even total is what makes the off-by-one start visible.',
    canonicalMethodId: 'greedy_reset',
    methods: [
      { id: 'greedy_reset', name: 'advance start, reset the tank', code: 'if sum(gas) < sum(cost):\n    return -1\nstart = 0\ntank = 0\nfor i in range(len(gas)):\n    tank += gas[i] - cost[i]\n    if tank < 0:\n        start = i + 1\n        tank = 0\nreturn start', detectionSignature: { mustMatch: ['tank = 0'], mustNotMatch: [], note: 'zeroes the running tank each time the candidate start moves' }, tradeoff: 'Correct - the new attempt starts from an empty tank, not a carried deficit.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'forget_tank_reset', name: 'advance start, keep the tank', code: 'if sum(gas) < sum(cost):\n    return -1\nstart = 0\ntank = 0\nfor i in range(len(gas)):\n    tank += gas[i] - cost[i]\n    if tank < 0:\n        start = i + 1\nreturn start', detectionSignature: { mustMatch: ['start = i + 1'], mustNotMatch: ['tank = 0'], note: 'moves the start but never clears the carried-over deficit' }, tradeoff: 'Runs and returns a real station index.', breaksWhen: 'Whenever a dip forces the start forward - the leftover negative tank bleeds into the next attempt and pushes the answer off by one (returns 4 here, not 3).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does keeping the tank when advancing the start give the wrong index?', options: ['greedy_reset', 'forget_tank_reset'], answerId: 'forget_tank_reset', explanation: 'Moving the start to a new station means a fresh attempt that begins with an empty tank. If the negative tank from the abandoned stretch is not zeroed, that deficit carries into the new attempt and corrupts which station looks viable - landing on 4 instead of 3 here.' },
    ],
  },

  // ───────────────────── python-core · factorial · single-method ─────────────────────
  {
    id: 'pylab-factorial',
    title: 'Factorial of a number',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['recursion', 'math'],
    estimatedMin: 4,
    fixtureId: 'fx_n_five',
    prompt: 'Given a non-negative whole number n, return the product of every whole number from 1 up to n. The product for 0 is 1.',
    signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # product of 1..n; the product for 0 (and 1) is 1\n    ...',
    hints: [
      'The product for n is just n times the product for n minus 1.',
      'Stop the chain at the smallest case: the product for 0 or 1 is 1, with no further multiplication.',
    ],
    solution: 'def solve(n):\n    if n <= 1:\n        return 1\n    return n * solve(n - 1)',
    compare: { kind: 'value' },
    debrief: 'The product of 1 through 5 is 120. The base case (the product for 0 or 1 is 1) stops the chain; every other call multiplies n by the product for the next-smaller number. There is one honest way to express this, so no method dial - a fluency rep. (At very large n a flat loop avoids hitting the recursion depth limit, but the shape of the computation is identical.)',
    canonicalMethodId: 'recurse_down',
    methods: [
      { id: 'recurse_down', name: 'n times the smaller product', code: 'if n <= 1:\n    return 1\nreturn n * solve(n - 1)', detectionSignature: { mustMatch: ['solve(n - 1)'], mustNotMatch: [], note: 'base case at n <= 1, otherwise multiply down' }, tradeoff: 'The direct definition, read straight off the maths.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── python-core · fibonacci · multi-method + wrong-base trap ─────────────────────
  {
    id: 'pylab-fibonacci',
    title: 'The nth number in the sequence',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['recursion', 'sequence', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_n_ten',
    prompt: 'A sequence starts with 0 then 1, and every later number is the sum of the previous two. Return the number at position n, counting positions from 0 (so position 0 is the first number).',
    beforeWriting: 'The sequence is pinned by its first two numbers. If position 0 is meant to be 0, what must the starting pair be - and what goes wrong if you seed it as 1 and 1?',
    signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # the number at position n; position 0 is the first number\n    ...',
    hints: [
      'Carry the last two numbers and roll them forward n times - each step the new pair is (second, first + second).',
      'The starting pair fixes the whole sequence: position 0 must come out as the first number, so seed the pair carefully.',
    ],
    solution: 'def solve(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a',
    compare: { kind: 'value' },
    debrief: 'Position 10 is 55. Two honest methods agree: roll the last two numbers forward n times starting from the pair (0, 1), or recurse with a remembered table so each position is computed once instead of re-deriving the whole sequence. The trap seeds the pair as (1, 1) instead of (0, 1) - it still runs the same roll-forward, but the whole sequence is shifted by one position, so position 10 comes out as 89 instead of 55. It looks right on a glance because the numbers are genuine sequence values, just off by a position. The starting pair is the entire decision.',
    canonicalMethodId: 'iterative_pair',
    methods: [
      { id: 'iterative_pair', name: 'roll the pair forward', code: 'a, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nreturn a', detectionSignature: { mustMatch: ['0, 1'], mustNotMatch: [], note: 'seeds the pair at (0, 1) so position 0 is 0' }, tradeoff: 'Constant memory, one linear pass, no recursion-depth risk.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'memoized_recursion', name: 'recurse with a remembered table', code: 'memo = {0: 0, 1: 1}\ndef fib(k):\n    if k in memo:\n        return memo[k]\n    memo[k] = fib(k - 1) + fib(k - 2)\n    return memo[k]\nreturn fib(n)', detectionSignature: { mustMatch: ['memo'], mustNotMatch: [], note: 'caches each position so it is computed once' }, tradeoff: 'Same answer, reads as the recursive definition, at the cost of a cache and call-stack depth.', breaksWhen: 'Nothing for this task - just uses more memory and stack than the rolling pair.', isTrap: false },
      { id: 'wrong_base', name: 'roll forward from (1, 1)', code: 'a, b = 1, 1\nfor _ in range(n):\n    a, b = b, a + b\nreturn a', detectionSignature: { mustMatch: ['1, 1'], mustNotMatch: ['0, 1'], note: 'seeds the wrong starting pair - shifts the whole sequence by one' }, tradeoff: 'Runs and returns a genuine sequence value.', breaksWhen: 'Always here - seeding (1, 1) shifts every position by one, so position 10 returns 89 instead of 55.', isTrap: true },
    ],
    dial: {
      axes: ['data-size', 'readability'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['iterative_pair', 'memoized_recursion'], why: 'the rolling pair holds two numbers in constant memory; the memoized version stores every position and consumes call-stack depth.' },
        { when: { 'readability': 'team' }, rank: ['memoized_recursion', 'iterative_pair'], why: 'the cached recursion mirrors the textbook "sum of the previous two" definition, which reads more obviously than a two-variable roll.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does seeding the pair as (1, 1) return 89 instead of 55 at position 10?', options: ['iterative_pair', 'memoized_recursion', 'wrong_base'], answerId: 'wrong_base', explanation: 'The first two numbers fix the entire sequence. Starting at (1, 1) instead of (0, 1) shifts every position one step ahead, so the value read at position 10 is actually the value that belongs at position 11 (89).' },
      { id: 'q2', stem: 'On a large position with tight memory, which valid method is cheaper?', options: ['iterative_pair', 'memoized_recursion'], answerId: 'iterative_pair', explanation: 'The rolling pair keeps only two numbers and one loop - constant memory, no recursion depth. The memoized version stores every position and adds call-stack frames. Same answer, less overhead. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── python-core · fast-power · multi-method + loop-bound trap ─────────────────────
  {
    id: 'pylab-fast-power',
    title: 'Raise a number to a power, quickly',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['recursion', 'bitwise', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_base_exp',
    prompt: 'Given a base and a non-negative whole exponent, return the base raised to that exponent, without using the built-in power operator. It should take far fewer multiplications than the exponent itself.',
    beforeWriting: 'Halving the exponent each step is the speed-up - but an odd exponent has a leftover factor. Does your loop run far enough to fold that last factor in?',
    signature: 'solve(base, exp)',
    starterCode: 'def solve(base, exp):\n    # base ** exp, no ** operator, far fewer than exp multiplications\n    ...',
    hints: [
      'Repeatedly square the base and halve the exponent; when the exponent is odd, multiply the current base into the running result.',
      'The loop must keep going until the exponent reaches 0, not until it reaches 1 - stopping early drops the final factor.',
    ],
    solution: 'def solve(base, exp):\n    result = 1\n    while exp > 0:\n        if exp & 1:\n            result *= base\n        base *= base\n        exp >>= 1\n    return result',
    compare: { kind: 'value' },
    debrief: '3 to the 5th is 243. The honest method squares the base and halves the exponent each step, folding the current base into the result whenever the exponent\'s low bit is 1, and keeps going until the exponent hits 0. The trap stops one step too early - it loops while the exponent is greater than 1 rather than greater than 0 - so it never processes the final bit and drops the last factor, returning 3 instead of 243. It runs and returns a number; the loop bound is the single off-by-one. The fix is the stopping condition: drain the exponent all the way to 0.',
    canonicalMethodId: 'square_and_halve',
    methods: [
      { id: 'square_and_halve', name: 'square the base, drain to zero', code: 'result = 1\nwhile exp > 0:\n    if exp & 1:\n        result *= base\n    base *= base\n    exp >>= 1\nreturn result', detectionSignature: { mustMatch: ['exp > 0'], mustNotMatch: ['exp > 1'], note: 'loops until the exponent reaches 0 - every bit processed' }, tradeoff: 'Correct - the loop drains the whole exponent, so no factor is dropped.', breaksWhen: 'Nothing for this task; it is the reference.', isTrap: false },
      { id: 'loop_bound_short', name: 'stop while the exponent exceeds 1', code: 'result = 1\nwhile exp > 1:\n    if exp & 1:\n        result *= base\n    base *= base\n    exp >>= 1\nreturn result', detectionSignature: { mustMatch: ['exp > 1'], mustNotMatch: [], note: 'stops one step early, skipping the last bit' }, tradeoff: 'Runs and is right for the easy cases where the dropped bit happens to be 0.', breaksWhen: 'Any exponent whose final bit matters - stopping at 1 instead of 0 skips the last factor, so 3 to the 5th returns 3, not 243.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does looping while the exponent exceeds 1 return 3 instead of 243?', options: ['square_and_halve', 'loop_bound_short'], answerId: 'loop_bound_short', explanation: 'Halving the exponent eventually brings it to 1, which still carries one unprocessed factor. Stopping at "greater than 1" skips that final bit, dropping the last multiplication. Draining all the way to 0 folds every factor in.' },
    ],
  },

  // ───────────────────── python-core · flatten-nested · single-method ─────────────────────
  {
    id: 'pylab-flatten-nested',
    title: 'Flatten a deeply nested list',
    topic: 'python-core',
    difficulty: 'core',
    tags: ['recursion', 'nesting'],
    estimatedMin: 5,
    fixtureId: 'fx_nested_list',
    prompt: 'Given a list that may hold numbers and other lists, nested to any depth, return a single flat list of all the numbers in left-to-right order.',
    signature: 'solve(nested)',
    starterCode: 'def solve(nested):\n    # one flat list of every number, any depth, left to right\n    ...',
    hints: [
      'Walk the list item by item: a plain number gets added to the output; a list needs its own contents pulled out the same way.',
      'When you meet a sublist, hand it back to the same routine and splice in whatever flat list it returns.',
    ],
    solution: 'def solve(nested):\n    out = []\n    for item in nested:\n        if isinstance(item, list):\n            out.extend(solve(item))\n        else:\n            out.append(item)\n    return out',
    compare: { kind: 'seq' },
    debrief: 'The nested input collapses to [1, 2, 3, 4, 5, 6]. The routine mirrors the structure: a plain number is appended; a sublist is handed back to the same routine and its flat result spliced in, which works at any depth because each sublist is solved the same way. There is one honest shape here, so no method dial - a fluency rep on the recursion. (The recursion depth tracks how deeply the input is nested.)',
    canonicalMethodId: 'recurse_sublists',
    methods: [
      { id: 'recurse_sublists', name: 'append values, recurse into lists', code: 'out = []\nfor item in nested:\n    if isinstance(item, list):\n        out.extend(solve(item))\n    else:\n        out.append(item)\nreturn out', detectionSignature: { mustMatch: ['isinstance'], mustNotMatch: [], note: 'numbers appended, sublists handed back to the same routine' }, tradeoff: 'The direct structural recursion - one rule for values, one for lists.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── python-core · gcd · single-method ─────────────────────
  {
    id: 'pylab-gcd',
    title: 'Greatest common divisor',
    topic: 'python-core',
    difficulty: 'warmup',
    tags: ['recursion', 'math'],
    estimatedMin: 4,
    fixtureId: 'fx_two_ints',
    prompt: 'Given two non-negative whole numbers, return the largest whole number that divides both of them exactly.',
    signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # largest number dividing both a and b exactly\n    ...',
    hints: [
      'The largest shared divisor of two numbers is unchanged if you replace the larger with the remainder of dividing one by the other.',
      'Keep replacing until one number becomes 0; the other is then the answer.',
    ],
    solution: 'def solve(a, b):\n    if b == 0:\n        return a\n    return solve(b, a % b)',
    compare: { kind: 'value' },
    debrief: '48 and 18 share a largest divisor of 6. The shared divisor of (a, b) is the same as the shared divisor of (b, a-remainder-b), and each step shrinks the numbers fast; when the second number reaches 0 the first is the answer. There is one honest way to express this, so no method dial - a fluency rep on the remainder recursion.',
    canonicalMethodId: 'euclid',
    methods: [
      { id: 'euclid', name: 'replace with the remainder', code: 'if b == 0:\n    return a\nreturn solve(b, a % b)', detectionSignature: { mustMatch: ['a % b'], mustNotMatch: [], note: 'recurse on (b, a mod b); base case b == 0' }, tradeoff: 'The direct remainder recursion - shrinks fast to the base case.', breaksWhen: 'Nothing for this task - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

];

export default problems;

// pyLabBatch_aiml — the AI / ML Craft world (D-PL-29 / Track 2, Bucket 3): the numeric + AI-
// engineering coding that DS / ML / AIE interviews ask you to implement from scratch. ML: k-NN,
// precision/recall, confusion counts, sigmoid, train-stat standardization (leakage). AI-eng
// (pure logic over provided embeddings/scores — no live API, D-PL-29): cosine top-k retrieval,
// recall@k, MRR, fixed-size chunking with overlap, LLM-as-judge pass-rate. Every solution +
// honest method + trap executed in CPython (numpy 2.2) and proven before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_aiml_knn': {
    args: ['X_train', 'y_train', 'x', 'k'],
    setup: 'import numpy as np\nX_train = np.array([[0, 0], [0, 1], [10, 10], [10, 11]])\ny_train = np.array([0, 0, 1, 1])\nx = np.array([0, 2])\nk = 3',
    preview: 'X_train (4x2) + labels y_train; query x=[0,2]; k=3. Two points sit near x, two are far.',
  },
  'fx_aiml_binary': {
    args: ['y_true', 'y_pred'],
    setup: 'import numpy as np\ny_true = np.array([1, 1, 1, 1, 0, 0])\ny_pred = np.array([1, 0, 0, 0, 0, 0])',
    preview: 'y_true / y_pred: 4 real positives, model predicts only 1 positive (TP=1, FN=3, FP=0, TN=2).',
  },
  'fx_aiml_sigmoid': {
    args: ['x'],
    setup: 'import numpy as np\nx = np.array([-1.0, 0.0, 2.0])',
    preview: 'x: [-1, 0, 2] — sigmoid should give ~0.27, 0.5, 0.88.',
  },
  'fx_aiml_standardize': {
    args: ['train', 'test'],
    setup: 'import numpy as np\ntrain = np.array([10.0, 20.0, 30.0, 40.0])\ntest = np.array([25.0, 35.0])',
    preview: 'train (mean 25, std ~11.18) + test [25, 35]. Standardize test using TRAIN statistics.',
  },
  'fx_aiml_cosine': {
    args: ['query', 'docs', 'k'],
    setup: 'import numpy as np\nquery = np.array([1.0, 0.0])\ndocs = np.array([[1.0, 0.0], [5.0, 5.0], [0.9, 0.0]])\nk = 2',
    preview: 'query + 3 doc vectors. doc1 is big but off-direction; docs 0 and 2 point exactly at the query.',
  },
  'fx_aiml_recall': {
    args: ['retrieved', 'relevant', 'k'],
    setup: 'retrieved = [3, 1, 7, 2]\nrelevant = [1, 2, 5]\nk = 2',
    preview: 'retrieved (ranked ids), relevant = {1,2,5}, k=2. Top-2 = [3,1]; one of them is relevant.',
  },
  'fx_aiml_mrr': {
    args: ['results'],
    setup: 'results = [([9, 3, 5], 3), ([1, 2], 1), ([8, 7, 6, 4], 4)]',
    preview: 'per query: (ranked ids, the relevant id). First relevant lands at rank 2, 1, 4.',
  },
  'fx_aiml_chunk': {
    args: ['tokens', 'size', 'overlap'],
    setup: 'tokens = [0, 1, 2, 3, 4, 5, 6, 7]\nsize = 4\noverlap = 2',
    preview: 'tokens 0..7, window size 4, overlap 2 → step 2 (windows share 2 tokens).',
  },
  'fx_aiml_judge': {
    args: ['items', 'threshold'],
    setup: 'items = [{"faith": 0.9, "rel": 0.8}, {"faith": 0.6, "rel": 0.9}, {"faith": 0.95, "rel": 0.5}]\nthreshold = 0.7',
    preview: 'per answer: faithfulness + relevance scores; threshold 0.7. An answer passes only if BOTH clear it.',
  },
};

export const problems = [

  // ───────────────── mlx-knn-classify ─────────────────
  {
    id: 'mlx-knn-classify',
    title: 'k-NN classify from scratch',
    topic: 'ml-scratch',
    difficulty: 'core',
    tags: ['knn', 'from-scratch', 'numpy'],
    estimatedMin: 7,
    fixtureId: 'fx_aiml_knn',
    prompt: 'Classify the query point x by k-nearest-neighbours: find the k training points closest to x (Euclidean distance) and return the majority label among them, as an int. No sklearn.',
    beforeWriting: 'k-NN uses the k CLOSEST points. After you sort by distance, do you take the front of the list or the back?',
    signature: 'solve(X_train, y_train, x, k)',
    starterCode: 'def solve(X_train, y_train, x, k):\n    # majority label of the k nearest training points\n    ...',
    hints: [
      'Distance from x to every training row, then the k smallest.',
      'argsort gives ascending order — the nearest neighbours are at the FRONT, not the end.',
    ],
    solution: 'def solve(X_train, y_train, x, k):\n    d = np.linalg.norm(X_train - x, axis=1)\n    idx = np.argsort(d)[:k]\n    vals, counts = np.unique(y_train[idx], return_counts=True)\n    return int(vals[np.argmax(counts)])',
    compare: { kind: 'value' },
    debrief: 'x=[0,2] is closest to the two class-0 points, so the majority of its 3 nearest neighbours is class 0.\n\n**Wrong answer that runs:** slicing argsort from the END (or reversing it) takes the k FARTHEST points instead — here that flips the vote to class 1. It runs and returns a label; it just used the neighbours on the wrong side of the sort.\n\n**Sanity check:** the smallest distance in your chosen set should be the global minimum distance to x. If your neighbours are the far-away points, you sliced the wrong end of argsort.',
    canonicalMethodId: 'nearest',
    methods: [
      { id: 'nearest', name: 'k smallest distances', code: 'd = np.linalg.norm(X_train - x, axis=1)\nidx = np.argsort(d)[:k]\nvals, counts = np.unique(y_train[idx], return_counts=True)\nreturn int(vals[np.argmax(counts)])', detectionSignature: { mustMatch: ['argsort'], mustNotMatch: ['[::-1]'], note: 'front of the ascending sort' }, tradeoff: 'Sort by distance, take the front k, majority-vote — the definition of k-NN.', breaksWhen: 'Ties in the vote need a tiebreak rule; otherwise correct.', isTrap: false },
      { id: 'farthest', name: 'k largest distances', code: 'd = np.linalg.norm(X_train - x, axis=1)\nidx = np.argsort(d)[::-1][:k]\nvals, counts = np.unique(y_train[idx], return_counts=True)\nreturn int(vals[np.argmax(counts)])', detectionSignature: { mustMatch: ['[::-1]'], mustNotMatch: [], note: 'reversed sort picks the farthest' }, tradeoff: 'Looks like k-NN and runs.', breaksWhen: 'Always — reversing argsort selects the k FARTHEST points, the opposite of nearest-neighbours.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does reversing the argsort give the wrong class?', options: ['nearest', 'farthest'], answerId: 'farthest', explanation: 'argsort is ascending, so [::-1] takes the largest distances — the farthest points. k-NN votes with the k NEAREST, which are at the front of the sorted order.' },
    ],
  },

  // ───────────────── mlx-precision-recall ─────────────────
  {
    id: 'mlx-precision-recall',
    title: 'Precision and recall',
    topic: 'ml-scratch',
    difficulty: 'core',
    tags: ['metrics', 'classification', 'from-scratch'],
    estimatedMin: 6,
    fixtureId: 'fx_aiml_binary',
    prompt: 'From two 0/1 arrays y_true and y_pred, return [precision, recall] as a two-element list. Precision = TP/(TP+FP); recall = TP/(TP+FN).',
    beforeWriting: 'Precision divides by what you PREDICTED positive; recall by what was ACTUALLY positive. Which denominator is which?',
    signature: 'solve(y_true, y_pred)',
    starterCode: 'def solve(y_true, y_pred):\n    # return [precision, recall]\n    ...',
    hints: [
      'Precision: of the ones you called positive, how many were right (denominator TP+FP).',
      'Recall: of the truly positive, how many you caught (denominator TP+FN).',
    ],
    solution: 'def solve(y_true, y_pred):\n    tp = int(((y_pred == 1) & (y_true == 1)).sum())\n    fp = int(((y_pred == 1) & (y_true == 0)).sum())\n    fn = int(((y_pred == 0) & (y_true == 1)).sum())\n    return [tp / (tp + fp), tp / (tp + fn)]',
    compare: { kind: 'seq' },
    debrief: 'The model made 1 positive call and it was right (precision 1.0), but missed 3 of 4 real positives (recall 0.25) → [1.0, 0.25].\n\n**Wrong answer that runs:** returning [recall, precision] — the same two numbers in the wrong order — gives [0.25, 1.0]. It runs and returns a pair; it just labels a cautious model as high-recall when it is actually high-precision, low-recall.\n\n**Sanity check:** precision uses TP+FP (predicted-positive) as the denominator, recall uses TP+FN (actual-positive). Name which is which before you return them.',
    canonicalMethodId: 'pr',
    methods: [
      { id: 'pr', name: 'precision then recall', code: 'tp = int(((y_pred == 1) & (y_true == 1)).sum())\nfp = int(((y_pred == 1) & (y_true == 0)).sum())\nfn = int(((y_pred == 0) & (y_true == 1)).sum())\nreturn [tp / (tp + fp), tp / (tp + fn)]', detectionSignature: { mustMatch: ['tp + fp'], mustNotMatch: [], note: 'precision denominator predicted-positive' }, tradeoff: 'Count the cells, divide by the right denominator for each — precision over predicted-positive, recall over actual-positive.', breaksWhen: 'Zero predicted-positive or zero actual-positive needs a zero-division convention.', isTrap: false },
      { id: 'swapped', name: 'recall then precision', code: 'tp = int(((y_pred == 1) & (y_true == 1)).sum())\nfp = int(((y_pred == 1) & (y_true == 0)).sum())\nfn = int(((y_pred == 0) & (y_true == 1)).sum())\nreturn [tp / (tp + fn), tp / (tp + fp)]', detectionSignature: { mustMatch: ['tp + fn'], mustNotMatch: [], note: 'order flipped' }, tradeoff: 'Same two numbers, returned in order.', breaksWhen: 'The order is the answer — swapping precision and recall inverts the story the metrics tell.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Which denominator makes it precision?', options: ['pr', 'swapped'], answerId: 'pr', explanation: 'Precision = TP/(TP+FP) — divided by everything you predicted positive. Recall = TP/(TP+FN) — divided by everything actually positive. Returning them in the wrong order mislabels the model.' },
    ],
  },

  // ───────────────── mlx-confusion-counts ─────────────────
  {
    id: 'mlx-confusion-counts',
    title: 'Confusion matrix counts',
    topic: 'ml-scratch',
    difficulty: 'core',
    tags: ['metrics', 'confusion-matrix', 'from-scratch'],
    estimatedMin: 6,
    fixtureId: 'fx_aiml_binary',
    prompt: 'Return the confusion-matrix counts as a dict with keys "tp", "fp", "fn", "tn" for the two 0/1 arrays y_true and y_pred.',
    beforeWriting: 'A false positive is predicted-1 but actually-0. A false negative is predicted-0 but actually-1. Keep the two straight.',
    signature: 'solve(y_true, y_pred)',
    starterCode: 'def solve(y_true, y_pred):\n    # {"tp":..,"fp":..,"fn":..,"tn":..}\n    ...',
    hints: [
      'Each cell is a pair of conditions on (predicted, actual).',
      'FP = predicted 1 AND actual 0; FN = predicted 0 AND actual 1 — do not swap them.',
    ],
    solution: 'def solve(y_true, y_pred):\n    return {"tp": int(((y_pred == 1) & (y_true == 1)).sum()),\n            "fp": int(((y_pred == 1) & (y_true == 0)).sum()),\n            "fn": int(((y_pred == 0) & (y_true == 1)).sum()),\n            "tn": int(((y_pred == 0) & (y_true == 0)).sum())}',
    compare: { kind: 'value' },
    debrief: 'tp=1, fp=0, fn=3, tn=2 — the model was cautious: it missed positives (high FN) rather than over-calling them (FP=0).\n\n**Wrong answer that runs:** swapping the FP and FN definitions (fp = predicted-0 & actual-1) returns {tp:1, fp:3, fn:0, tn:2}. It runs and returns the right keys; it just relabels every missed positive as a false alarm, inverting what the errors mean.\n\n**Sanity check:** the four counts must sum to the number of samples (6), and FP counts predicted-1-actual-0 while FN counts predicted-0-actual-1. If FP and FN look swapped, re-read the conditions.',
    canonicalMethodId: 'counts',
    methods: [
      { id: 'counts', name: 'four masked counts', code: 'return {"tp": int(((y_pred == 1) & (y_true == 1)).sum()),\n        "fp": int(((y_pred == 1) & (y_true == 0)).sum()),\n        "fn": int(((y_pred == 0) & (y_true == 1)).sum()),\n        "tn": int(((y_pred == 0) & (y_true == 0)).sum())}', detectionSignature: { mustMatch: ['tp'], mustNotMatch: [], note: 'each cell its own condition' }, tradeoff: 'One boolean mask per cell — unambiguous.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'swap_fp_fn', name: 'FP/FN definitions swapped', code: 'return {"tp": int(((y_pred == 1) & (y_true == 1)).sum()),\n        "fp": int(((y_pred == 0) & (y_true == 1)).sum()),\n        "fn": int(((y_pred == 1) & (y_true == 0)).sum()),\n        "tn": int(((y_pred == 0) & (y_true == 0)).sum())}', detectionSignature: { mustMatch: ['y_pred == 0) & (y_true == 1'], mustNotMatch: [], note: 'fp/fn conditions crossed' }, tradeoff: 'Right keys, right total.', breaksWhen: 'It crosses the FP and FN conditions — a miss gets counted as a false alarm, which flips precision/recall downstream.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'What is a false positive?', options: ['counts', 'swap_fp_fn'], answerId: 'counts', explanation: 'FP = predicted 1 but actual 0 (a false alarm). FN = predicted 0 but actual 1 (a miss). The swapped version crosses these, inverting the error meaning.' },
    ],
  },

  // ───────────────── mlx-sigmoid ─────────────────
  {
    id: 'mlx-sigmoid',
    title: 'Sigmoid from scratch',
    topic: 'ml-scratch',
    difficulty: 'core',
    tags: ['sigmoid', 'from-scratch', 'numpy'],
    estimatedMin: 4,
    fixtureId: 'fx_aiml_sigmoid',
    prompt: 'Return the sigmoid of the array x: 1 / (1 + e^(-x)), elementwise.',
    signature: 'solve(x)',
    starterCode: 'def solve(x):\n    # 1 / (1 + exp(-x))\n    ...',
    hints: [
      'The exponent is NEGATIVE x, not positive x.',
      'A sign slip flips the curve: large x should map near 1, not near 0.',
    ],
    solution: 'def solve(x):\n    return 1 / (1 + np.exp(-x))',
    compare: { kind: 'array' },
    debrief: 'sigmoid maps -1, 0, 2 to about 0.27, 0.5, 0.88 — increasing in x.\n\n**Wrong answer that runs:** using exp(+x) instead of exp(-x) computes 1/(1+e^x), which is 1 minus the sigmoid — it returns 0.73, 0.5, 0.12, a curve that DECREASES in x. It runs and returns numbers in [0,1]; they are just the reflected curve.\n\n**Sanity check:** sigmoid is monotincreasing — a larger input must give a larger output. If big x maps near 0, your exponent has the wrong sign.',
    canonicalMethodId: 'sigmoid',
    methods: [
      { id: 'sigmoid', name: '1/(1+exp(-x))', code: 'return 1 / (1 + np.exp(-x))', detectionSignature: { mustMatch: ['exp(-x)'], mustNotMatch: [], note: 'negative exponent' }, tradeoff: 'The definition, vectorized over the array.', breaksWhen: 'Very large negative x overflows exp; a numerically-stable form guards that (not needed here).', isTrap: false },
      { id: 'sign_flip', name: '1/(1+exp(x))', code: 'return 1 / (1 + np.exp(x))', detectionSignature: { mustMatch: ['exp(x)'], mustNotMatch: ['exp(-x)'], note: 'positive exponent = reflected curve' }, tradeoff: 'One character off, and it runs.', breaksWhen: 'Always — 1/(1+e^x) is 1 minus sigmoid, a decreasing curve, so every probability is mirrored.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'How do you spot the sign-flipped sigmoid?', options: ['sigmoid', 'sign_flip'], answerId: 'sigmoid', explanation: 'Sigmoid increases with x (big x → near 1). exp(+x) gives 1/(1+e^x), which decreases — the reflected curve. The exponent must be -x.' },
    ],
  },

  // ───────────────── mlx-standardize-train-stats · leakage ─────────────────
  {
    id: 'mlx-standardize-train-stats',
    title: 'Standardize test with train statistics',
    topic: 'ml-scratch',
    difficulty: 'stretch',
    tags: ['standardize', 'data-leakage', 'from-scratch'],
    estimatedMin: 7,
    fixtureId: 'fx_aiml_standardize',
    prompt: 'Standardize the test array (subtract mean, divide by std) using the TRAINING set\'s mean and std — never the test set\'s own — so no information leaks from test into the scaling. Return the standardized test array.',
    beforeWriting: 'At inference you do not get to see the test set\'s statistics. Whose mean and std should scale the test data?',
    signature: 'solve(train, test)',
    starterCode: 'def solve(train, test):\n    # (test - train_mean) / train_std\n    ...',
    hints: [
      'The scaler is FIT on train and only APPLIED to test.',
      'Using test.mean()/test.std() leaks the test distribution into preprocessing — use the train statistics.',
    ],
    solution: 'def solve(train, test):\n    return (test - train.mean()) / train.std()',
    compare: { kind: 'array' },
    debrief: 'With train mean 25 and std ~11.18, test [25, 35] standardizes to about [0.0, 0.89].\n\n**Wrong answer that runs:** standardizing test by its OWN mean and std gives [-1, 1] — a clean-looking result that has leaked the test distribution into the transform. It runs and returns a standardized array; in a real pipeline it inflates your reported metrics because the model saw test-set statistics it would not have at inference.\n\n**Sanity check:** the mean and std in your formula must come from train. If the test output is always perfectly centred (mean 0, std 1) regardless of the train data, you fit the scaler on test — that is leakage.',
    canonicalMethodId: 'train_stats',
    methods: [
      { id: 'train_stats', name: 'fit on train, apply to test', code: 'return (test - train.mean()) / train.std()', detectionSignature: { mustMatch: ['train.mean()'], mustNotMatch: ['test.mean()'], note: 'scale test by train stats' }, tradeoff: 'Fit the scaler on train, apply to test — no leakage, matches inference-time behaviour.', breaksWhen: 'A constant train column has std 0 (division by zero); guard if possible.', isTrap: false },
      { id: 'test_stats', name: 'standardize test by its own stats', code: 'return (test - test.mean()) / test.std()', detectionSignature: { mustMatch: ['test.mean()'], mustNotMatch: [], note: 'fits the scaler on test — leakage' }, tradeoff: 'Produces a tidy zero-mean, unit-std test array.', breaksWhen: 'Always in a real pipeline — it fits preprocessing on the test set, leaking its distribution and optimistically biasing evaluation.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is standardizing test by its own mean/std a bug?', options: ['train_stats', 'test_stats'], answerId: 'test_stats', explanation: 'It fits the scaler on the test set, leaking test statistics into preprocessing. At inference you only have the train-fit scaler, so metrics computed this way are optimistically biased.' },
    ],
  },

  // ───────────────── aix-cosine-topk ─────────────────
  {
    id: 'aix-cosine-topk',
    title: 'Cosine top-k retrieval',
    topic: 'ai-eng',
    difficulty: 'stretch',
    tags: ['embeddings', 'cosine-similarity', 'retrieval'],
    estimatedMin: 8,
    fixtureId: 'fx_aiml_cosine',
    prompt: 'Given a query embedding and a matrix of document embeddings (one per row), return the indices of the k documents most similar to the query by COSINE similarity. Return them as a sorted list of ints.',
    beforeWriting: 'Cosine similarity is about direction, not magnitude. A raw dot product rewards long vectors. Which one does semantic retrieval want?',
    signature: 'solve(query, docs, k)',
    starterCode: 'def solve(query, docs, k):\n    # indices of the top-k docs by cosine similarity\n    ...',
    hints: [
      'Cosine = dot product of the L2-normalised vectors — normalise before you compare.',
      'A raw dot product ranks a long, off-direction vector above a short, perfectly-aligned one.',
    ],
    solution: 'def solve(query, docs, k):\n    qn = query / np.linalg.norm(query)\n    dn = docs / np.linalg.norm(docs, axis=1, keepdims=True)\n    sims = dn @ qn\n    idx = np.argsort(sims)[::-1][:k]\n    return sorted(int(i) for i in idx)',
    compare: { kind: 'seq' },
    debrief: 'Docs 0 and 2 point exactly at the query (cosine 1.0); doc 1 is bigger but 45° off (cosine ~0.71). Cosine top-2 = [0, 2].\n\n**Wrong answer that runs:** ranking by the raw dot product (no normalisation) lets doc 1\'s large magnitude win, returning [0, 1] instead. It runs and returns k indices; it just ranked by length, so a loud-but-off-topic document beat an on-topic one.\n\n**Sanity check:** if you normalise every vector to unit length first, the two perfectly-aligned docs must tie at the top. If a longer vector outranks an exactly-aligned one, you skipped the normalisation.',
    canonicalMethodId: 'cosine',
    methods: [
      { id: 'cosine', name: 'normalise, then dot', code: 'qn = query / np.linalg.norm(query)\ndn = docs / np.linalg.norm(docs, axis=1, keepdims=True)\nsims = dn @ qn\nidx = np.argsort(sims)[::-1][:k]\nreturn sorted(int(i) for i in idx)', detectionSignature: { mustMatch: ['norm'], mustNotMatch: [], note: 'L2-normalise before the dot' }, tradeoff: 'Normalise to unit length, then dot — true cosine, magnitude-independent.', breaksWhen: 'A zero vector has no direction (division by zero); guard if the corpus can contain one.', isTrap: false },
      { id: 'raw_dot', name: 'raw dot product', code: 'sims = docs @ query\nidx = np.argsort(sims)[::-1][:k]\nreturn sorted(int(i) for i in idx)', detectionSignature: { mustMatch: ['docs @ query'], mustNotMatch: ['norm'], note: 'no normalisation — ranks by magnitude too' }, tradeoff: 'Cheaper and often close when vectors are pre-normalised.', breaksWhen: 'When embedding norms vary — it ranks partly by magnitude, so a long off-topic vector can outrank a short on-topic one.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can a raw dot product return the wrong documents?', options: ['cosine', 'raw_dot'], answerId: 'raw_dot', explanation: 'Dot product = cosine × magnitudes, so a long vector scores high even if its direction is off. Cosine normalises out length, ranking purely by direction (semantic closeness).' },
    ],
  },

  // ───────────────── aix-recall-at-k ─────────────────
  {
    id: 'aix-recall-at-k',
    title: 'Recall@k for a retriever',
    topic: 'ai-eng',
    difficulty: 'core',
    tags: ['retrieval', 'recall', 'evaluation'],
    estimatedMin: 6,
    fixtureId: 'fx_aiml_recall',
    prompt: 'Given a ranked list of retrieved ids and the set of relevant ids, return recall@k: of all the relevant items, the fraction that appear in the top k retrieved. Return a single number.',
    beforeWriting: 'Recall@k divides by the number of RELEVANT items. Precision@k divides by k. Which denominator does this ask for?',
    signature: 'solve(retrieved, relevant, k)',
    starterCode: 'def solve(retrieved, relevant, k):\n    # fraction of relevant items found in the top k\n    ...',
    hints: [
      'Look only at the first k retrieved, and count how many are relevant.',
      'Divide that hit count by the number of relevant items — not by k (that would be precision).',
    ],
    solution: 'def solve(retrieved, relevant, k):\n    rel = set(relevant)\n    hit = len(set(retrieved[:k]) & rel)\n    return hit / len(rel)',
    compare: { kind: 'float' },
    debrief: 'Top-2 retrieved is [3, 1]; only id 1 is relevant, and there are 3 relevant ids total, so recall@2 = 1/3 ≈ 0.333.\n\n**Wrong answer that runs:** dividing the same hit count by k gives 1/2 = 0.5 — that is precision@k, not recall@k. It runs and returns a rate; it just measures purity of the top-k rather than coverage of the relevant set.\n\n**Sanity check:** the denominator should be the number of relevant items (3), not k (2). If shrinking k can never lower your score, you divided by k and computed precision.',
    canonicalMethodId: 'recall',
    methods: [
      { id: 'recall', name: 'hits over relevant count', code: 'rel = set(relevant)\nhit = len(set(retrieved[:k]) & rel)\nreturn hit / len(rel)', detectionSignature: { mustMatch: ['len(rel)'], mustNotMatch: [], note: 'denominator is the relevant set' }, tradeoff: 'Intersect top-k with the relevant set, divide by how many were relevant — recall.', breaksWhen: 'No relevant items (empty set) needs a convention for the 0/0 case.', isTrap: false },
      { id: 'precision_at_k', name: 'hits over k', code: 'rel = set(relevant)\nhit = len(set(retrieved[:k]) & rel)\nreturn hit / k', detectionSignature: { mustMatch: ['hit / k'], mustNotMatch: [], note: 'that is precision@k' }, tradeoff: 'A valid metric — just a different one.', breaksWhen: 'When the question asks recall — dividing by k measures precision (purity of the top-k), not coverage of the relevant set.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'What separates recall@k from precision@k?', options: ['recall', 'precision_at_k'], answerId: 'recall', explanation: 'Recall@k divides hits by the number of relevant items (coverage). Precision@k divides by k (purity of the returned list). Same numerator, different denominator.' },
    ],
  },

  // ───────────────── aix-mrr ─────────────────
  {
    id: 'aix-mrr',
    title: 'Mean reciprocal rank',
    topic: 'ai-eng',
    difficulty: 'core',
    tags: ['retrieval', 'mrr', 'evaluation'],
    estimatedMin: 7,
    fixtureId: 'fx_aiml_mrr',
    prompt: 'Each item is (ranked_ids, relevant_id): a ranked retrieval and the one correct id. Return the mean reciprocal rank — the average of 1/(rank of the correct id), where rank is 1-based. Return a single number.',
    beforeWriting: 'MRR averages the reciprocals of the ranks. Is that the same as one over the average rank?',
    signature: 'solve(results)',
    starterCode: 'def solve(results):\n    # average of 1/rank across queries\n    ...',
    hints: [
      'For each query, find the 1-based position of the relevant id and take its reciprocal.',
      'Average those reciprocals — averaging first and reciprocating once is a different number.',
    ],
    solution: 'def solve(results):\n    rrs = []\n    for ranked, rel in results:\n        pos = ranked.index(rel) + 1\n        rrs.append(1 / pos)\n    return sum(rrs) / len(rrs)',
    compare: { kind: 'float' },
    debrief: 'The correct id lands at ranks 2, 1, 4, so the reciprocals are 0.5, 1, 0.25 and MRR = (0.5+1+0.25)/3 ≈ 0.583.\n\n**Wrong answer that runs:** averaging the ranks first (2,1,4 → 2.33) and taking one reciprocal gives 1/2.33 ≈ 0.429. It runs and returns a number in the right range; it just applies the reciprocal in the wrong place (Jensen\'s inequality — the two are not equal).\n\n**Sanity check:** MRR is the mean of the per-query reciprocals. If you computed a single reciprocal of an averaged rank, you collapsed the queries before inverting.',
    canonicalMethodId: 'mrr',
    methods: [
      { id: 'mrr', name: 'mean of reciprocals', code: 'rrs = []\nfor ranked, rel in results:\n    pos = ranked.index(rel) + 1\n    rrs.append(1 / pos)\nreturn sum(rrs) / len(rrs)', detectionSignature: { mustMatch: ['1 / pos'], mustNotMatch: [], note: 'reciprocate per query, then average' }, tradeoff: 'Reciprocal per query, then average — the definition of MRR.', breaksWhen: 'A query with no relevant hit contributes 0 by convention; handle the not-found case.', isTrap: false },
      { id: 'recip_of_mean', name: 'reciprocal of the mean rank', code: 'ranks = []\nfor ranked, rel in results:\n    ranks.append(ranked.index(rel) + 1)\nreturn 1 / (sum(ranks) / len(ranks))', detectionSignature: { mustMatch: ['1 / (sum(ranks'], mustNotMatch: [], note: 'averages ranks, then one reciprocal' }, tradeoff: 'Looks like the same idea and runs.', breaksWhen: 'The mean of 1/rank is not 1/(mean rank) — averaging before inverting gives a systematically different number.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why is 1/(mean rank) not the MRR?', options: ['mrr', 'recip_of_mean'], answerId: 'mrr', explanation: 'The reciprocal is nonlinear, so the mean of 1/rank differs from 1/(mean rank) (Jensen\'s inequality). MRR reciprocates each rank first, then averages.' },
    ],
  },

  // ───────────────── aix-chunk-overlap ─────────────────
  {
    id: 'aix-chunk-overlap',
    title: 'Chunk tokens with overlap',
    topic: 'ai-eng',
    difficulty: 'core',
    tags: ['chunking', 'rag', 'windows'],
    estimatedMin: 6,
    fixtureId: 'fx_aiml_chunk',
    prompt: 'Split the token list into fixed-size windows of length `size` that overlap by `overlap` tokens, in order. Return a list of the windows (each a list). Consecutive windows advance by size - overlap.',
    beforeWriting: 'Overlapping chunks preserve context across boundaries. What step between window starts gives that overlap?',
    signature: 'solve(tokens, size, overlap)',
    starterCode: 'def solve(tokens, size, overlap):\n    # windows of `size`, advancing by size - overlap\n    ...',
    hints: [
      'The stride between window starts is size - overlap, not size.',
      'Stepping by size gives disjoint chunks with no shared context.',
    ],
    solution: 'def solve(tokens, size, overlap):\n    step = size - overlap\n    return [tokens[i:i + size] for i in range(0, len(tokens), step)]',
    compare: { kind: 'seq' },
    debrief: 'With size 4 and overlap 2 the stride is 2, so windows share two tokens: [0-3], [2-5], [4-7], [6-7].\n\n**Wrong answer that runs:** stepping by `size` (4) instead of `size - overlap` produces disjoint chunks [0-3], [4-7] with NO overlap. It runs and returns windows; they just lose the shared context that overlap exists to preserve, so a fact spanning a boundary gets split.\n\n**Sanity check:** adjacent windows should share exactly `overlap` tokens. If consecutive chunks have nothing in common, your stride was the full size.',
    canonicalMethodId: 'overlap',
    methods: [
      { id: 'overlap', name: 'stride = size - overlap', code: 'step = size - overlap\nreturn [tokens[i:i + size] for i in range(0, len(tokens), step)]', detectionSignature: { mustMatch: ['size - overlap'], mustNotMatch: [], note: 'advance by the reduced stride' }, tradeoff: 'Advance by size - overlap so each window shares the requested overlap.', breaksWhen: 'overlap >= size makes step <= 0 (infinite/empty); validate the inputs.', isTrap: false },
      { id: 'no_overlap', name: 'stride = size', code: 'return [tokens[i:i + size] for i in range(0, len(tokens), size)]', detectionSignature: { mustMatch: ['len(tokens), size'], mustNotMatch: ['size - overlap'], note: 'disjoint chunks, overlap ignored' }, tradeoff: 'Simple non-overlapping chunks.', breaksWhen: 'It ignores the overlap argument — chunks become disjoint, dropping the cross-boundary context that overlap is for.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'What stride gives overlapping windows?', options: ['overlap', 'no_overlap'], answerId: 'overlap', explanation: 'Advancing by size - overlap makes consecutive windows share `overlap` tokens. Stepping by the full size produces disjoint chunks with no shared context.' },
    ],
  },

  // ───────────────── aix-llm-judge-passrate ─────────────────
  {
    id: 'aix-llm-judge-passrate',
    title: 'LLM-as-judge pass rate',
    topic: 'ai-eng',
    difficulty: 'core',
    tags: ['evaluation', 'llm-judge', 'rag'],
    estimatedMin: 6,
    fixtureId: 'fx_aiml_judge',
    prompt: 'Each item has a judge\'s faithfulness and relevance scores (0-1). An answer passes only if BOTH scores meet the threshold. Return the fraction of items that pass, as a single number.',
    beforeWriting: 'The bar is BOTH scores clearing the threshold. Is that an AND or an OR — and does averaging the scores even answer the question?',
    signature: 'solve(items, threshold)',
    starterCode: 'def solve(items, threshold):\n    # fraction of items where BOTH scores >= threshold\n    ...',
    hints: [
      'Pass is a per-item AND of the two conditions, then a fraction over all items.',
      'Averaging the raw scores answers a different question than "what share passed both".',
    ],
    solution: 'def solve(items, threshold):\n    ok = sum(1 for it in items if it["faith"] >= threshold and it["rel"] >= threshold)\n    return ok / len(items)',
    compare: { kind: 'float' },
    debrief: 'Only the first answer clears 0.7 on both scores, so the pass rate is 1/3 ≈ 0.333.\n\n**Wrong answer that runs:** using OR (either score clears the bar) passes all three answers → 1.0. It runs and returns a rate; it just relaxes the gate the spec set, reporting a system as fully faithful-and-relevant when two of three answers failed one axis.\n\n**Sanity check:** an item passes only if BOTH scores clear the threshold. If your pass rate does not drop when one axis fails, you used OR instead of AND (or averaged the scores).',
    canonicalMethodId: 'both_and',
    methods: [
      { id: 'both_and', name: 'both scores >= threshold', code: 'ok = sum(1 for it in items if it["faith"] >= threshold and it["rel"] >= threshold)\nreturn ok / len(items)', detectionSignature: { mustMatch: ['and it'], mustNotMatch: [], note: 'AND of the two conditions' }, tradeoff: 'Per-item AND, then the fraction that pass — matches the both-axes bar.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'either_or', name: 'either score >= threshold', code: 'ok = sum(1 for it in items if it["faith"] >= threshold or it["rel"] >= threshold)\nreturn ok / len(items)', detectionSignature: { mustMatch: ['or it'], mustNotMatch: [], note: 'OR relaxes the gate' }, tradeoff: 'Also returns a pass rate.', breaksWhen: 'The spec says BOTH — OR passes an answer that failed one axis, overstating quality.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does OR overstate the pass rate?', options: ['both_and', 'either_or'], answerId: 'both_and', explanation: 'The bar is BOTH faithfulness AND relevance clearing the threshold. OR passes an answer that only clears one axis, so it reports more passes than actually met the standard.' },
    ],
  },

];

export default problems;

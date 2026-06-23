// pyLabBatch_idioms — migration batch: Python idioms (20 problems) from the legacy
// idiomsProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// Topic map (spec-constrained, no invented topics): every problem -> 'idioms'.
// Original patterns (comprehensions / collections / functional / context-managers /
// decorators / unpacking / dunder) are carried as tags, not as separate topics.
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside (so no inner escaping); \n for newlines; escape PROSE apostrophes as \' ;
// NO template literals / backticks.
//
// Every solution + method + trap VERIFIED in CPython (3.10) via pl_compare:
// 2 single-method (empty dial, honesty rule: gen-expr-stream, counter-topn) and
// 18 multi-method (each carries >=1 trap that RUNS and DIVERGES). Expected output is
// NEVER stored - computed from `solve` against the live fixture.
//
// solve() returns OBSERVABLE OUTPUT, not a callable: the decorator / context-manager
// problems build the construct inline and return the captured sequence (log / counts /
// restored value); the dunder problems build the object and return a tuple of its
// observable behaviour (repr string, equality bools, len, indexed items, membership).

export const fixtures = {
  // 1 dict-comp-index: a REPEATED id ("a" twice) - the footgun seed. The honest answers
  // keep the LAST position; the .index() trap keeps the FIRST, diverging on the repeat.
  'fx_idiom_ids': {
    args: ['ids'],
    setup: 'ids = ["a", "b", "c", "a"]',
    preview: 'ids: arrival order with "a" repeated at the end. Last-position map is {a:3, b:1, c:2}; a first-occurrence lookup wrongly gives a:0.',
  },
  // 2 nested-vs-flat: a 3x2 matrix. Row-major flatten is [1..6]; the zip(*) trap returns
  // column-major order [1,3,5,2,4,6] - runs, wrong order.
  'fx_idiom_matrix': {
    args: ['matrix'],
    setup: 'matrix = [[1, 2], [3, 4], [5, 6]]',
    preview: 'matrix: 3 rows of 2. Row-major flatten -> [1,2,3,4,5,6]; column-major (transpose) -> [1,3,5,2,4,6].',
  },
  // 3 gen-expr-stream: sizes with a threshold; sum of the strictly-over values is 300.
  'fx_idiom_sizes': {
    args: ['sizes', 'threshold'],
    setup: 'sizes = [100, 50, 200, 25]\nthreshold = 75',
    preview: 'sizes, threshold=75. Strictly-over values are 100 and 200 -> total 300.',
  },
  // 4 counter-topn: log levels with a clear frequency order; top-2 is INFO(3), ERROR(2).
  'fx_idiom_levels': {
    args: ['levels', 'n'],
    setup: 'levels = ["INFO", "INFO", "ERROR", "WARN", "INFO", "ERROR"]\nn = 2',
    preview: 'levels with INFO x3, ERROR x2, WARN x1. Top-2 -> [(INFO,3),(ERROR,2)].',
  },
  // 5 defaultdict-groupby: team A appears TWICE (ann, then amy) - the overwrite footgun.
  'fx_idiom_pairs': {
    args: ['pairs'],
    setup: 'pairs = [("A", "ann"), ("B", "bob"), ("A", "amy")]',
    preview: '(team, name) pairs; team A appears twice. Grouping -> {A:[ann,amy], B:[bob]}; an assigning dict-comp keeps only amy.',
  },
  // 6 deque-window: 5 readings, window 3. Last-3 is [3,4,5]; the first-n trap returns [1,2,3].
  'fx_idiom_readings': {
    args: ['readings', 'n'],
    setup: 'readings = [1, 2, 3, 4, 5]\nn = 3',
    preview: 'readings 1..5, n=3. The final last-3 window is [3,4,5]; taking the FIRST 3 gives [1,2,3].',
  },
  // 7 sorted-key: a tie at score 90 (ann, amy) so the tie-break direction is observable.
  'fx_idiom_records': {
    args: ['records'],
    setup: 'records = [("ann", 90), ("bob", 95), ("amy", 90)]',
    preview: '(name, score) with a 90-tie (ann, amy). Score desc, name asc -> [(bob,95),(amy,90),(ann,90)]; reverse=True flips the tie to (ann, amy).',
  },
  // 8 any-all: an EMPTY-string id in the middle so all() must fail and any() must pass.
  'fx_idiom_rows': {
    args: ['rows'],
    setup: 'rows = [{"id": 1}, {"id": "x"}, {"id": ""}]',
    preview: 'three rows; the last id is empty (falsy). all() -> False (the right answer); any() -> True.',
  },
  // 9 reduce-running: integers whose product (24) differs sharply from their sum (10).
  'fx_idiom_nums': {
    args: ['nums'],
    setup: 'nums = [1, 2, 3, 4]',
    preview: 'nums 1..4. Product is 24; a + fold (sum) gives 10 - a wide, obvious divergence.',
  },
  // 10 itertools-groupby: a SPLIT run "aabba" - two separate a-runs - so a whole-collection
  // tally (Counter) merges them and diverges from run-length encoding.
  'fx_idiom_runs': {
    args: ['s'],
    setup: 's = "aabba"',
    preview: 's = "aabba": runs are a2, b2, a1. A whole-string tally wrongly merges the two a-runs into a3.',
  },
  // 11 itertools-accumulate: deltas whose running totals [1,3,6,10] differ from the raw list.
  'fx_idiom_deltas': {
    args: ['deltas'],
    setup: 'deltas = [1, 2, 3, 4]',
    preview: 'deltas 1..4. Running totals are [1,3,6,10]; returning the raw deltas is the no-accumulate trap.',
  },
  // 12 contextmanager-decorator: a store whose value must be restored on exit.
  'fx_idiom_store': {
    args: ['store', 'key', 'value'],
    setup: 'store = {"mode": "prod"}\nkey = "mode"\nvalue = "test"',
    preview: 'store mode=prod; set to test inside the block. Restored -> [test, prod]; never-restored -> [test, test].',
  },
  // 13 context-class: deterministic injected clock ticks [10,13] -> elapsed 3.
  'fx_idiom_ticks': {
    args: ['ticks'],
    setup: 'ticks = [10, 13]',
    preview: 'clock ticks 10 then 13. enter records 10, exit reads 13 -> elapsed 3; a flipped subtraction gives -3.',
  },
  // 14/15/19/20: no-arg fixtures. The construct (decorator / class) is built inside solve;
  // the fixture carries nothing - the seed is the calls solve makes.
  'fx_idiom_none': {
    args: [],
    setup: '',
    preview: 'no input; solve builds the construct, drives it with fixed calls, and returns the observed behaviour.',
  },
  // 16 starred-unpack: at least two elements; middle is the strict interior.
  'fx_idiom_items': {
    args: ['items'],
    setup: 'items = [1, 2, 3, 4, 5]',
    preview: 'items 1..5. Head/tail split -> (1, 5, [2,3,4]); a *rest tail that keeps the last gives middle [2,3,4,5].',
  },
  // 17 dict-merge: a SHARED key "b" so override precedence is observable.
  'fx_idiom_config': {
    args: ['defaults', 'overrides'],
    setup: 'defaults = {"a": 1, "b": 2}\noverrides = {"b": 9}',
    preview: 'defaults a:1,b:2; overrides b:9. Overrides win -> {a:1,b:9}; swapping the spread order lets the default b:2 win.',
  },
  // 18 zip-enumerate: two parallel columns; labels are 1-based.
  'fx_idiom_columns': {
    args: ['names', 'scores'],
    setup: 'names = ["ann", "bob"]\nscores = [90, 85]',
    preview: 'names + scores paired by position. 1-based labels -> ["1. ann=90","2. bob=85"]; default start=0 gives "0." labels.',
  },
};

export const problems = [

  // ───────────────────── 1 · idioms · comprehensions · multi-method + trap (.index first-occurrence) ─────────────────────
  {
    id: 'pylab-idiom-dict-comp-index',
    title: 'Build a lookup from a list',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['comprehensions', 'dict', 'enumerate'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_ids',
    prompt: 'Given a list of ids in arrival order, return a dict mapping each id to its position in the list (the first item is position 0). When an id appears more than once, its position should be where it last arrives.',
    signature: 'solve(ids)',
    starterCode: 'def solve(ids):\n    # return {id: position}\n    ...',
    hints: [
      'You need both the running position and the value at each step.',
      'Pair each value with its position, then collapse those pairs into one mapping.',
    ],
    solution: 'def solve(ids):\n    return {v: i for i, v in enumerate(ids)}',
    compare: { kind: 'value' },
    debrief: 'The fixture repeats "a" at position 3, and that is the tell. Looking each id up with ids.index() finds its FIRST position, so the repeated "a" comes out 0 instead of 3 - it runs and returns a clean dict, just the wrong one. Both honest answers (a one-pass map over the enumerated pairs, or a plain loop that assigns position by position) naturally keep the last position, because the later write wins.',
    canonicalMethodId: 'comp',
    methods: [
      { id: 'comp', name: 'map the enumerated pairs', code: 'return {v: i for i, v in enumerate(ids)}', detectionSignature: { mustMatch: ['enumerate'], mustNotMatch: ['.index'], note: 'one pass, position from enumerate' }, tradeoff: 'The direct, single-pass mapping - intent (this is a lookup) is obvious at a glance.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
      { id: 'loop', name: 'assign in a loop', code: 'out = {}\nfor i, v in enumerate(ids):\n    out[v] = i\nreturn out', detectionSignature: { mustMatch: ['for'], mustNotMatch: ['.index'], note: 'same one-pass assignment, written long' }, tradeoff: 'Identical result, a few lines more - fine, just less compact.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'index_lookup', name: 'look up each position with .index', code: 'return {v: ids.index(v) for v in ids}', detectionSignature: { mustMatch: ['.index'], mustNotMatch: ['enumerate'], note: '.index finds the FIRST occurrence' }, tradeoff: 'Reads plausibly and runs cleanly.', breaksWhen: 'Any repeated value - .index returns its first position, so the last-position rule is silently violated (and it is O(n squared)).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the .index version give the wrong position for a repeated id?', options: ['comp', 'loop', 'index_lookup'], answerId: 'index_lookup', explanation: 'list.index returns the FIRST index of a value, so a value that arrives twice is recorded at its earliest position, not its latest. Carrying the position from enumerate avoids the re-scan and keeps the last write.' },
    ],
  },

  // ───────────────────── 2 · idioms · comprehensions · multi-method + trap (column-major) ─────────────────────
  {
    id: 'pylab-idiom-nested-vs-flat-comp',
    title: 'Flatten a matrix in one list',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['comprehensions', 'nested', 'flatten'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_matrix',
    prompt: 'Given a list of rows where each row is itself a list, return one flat list containing every element, reading across the first row, then the second, and so on.',
    signature: 'solve(matrix)',
    starterCode: 'def solve(matrix):\n    # one flat list, row by row\n    ...',
    hints: [
      'You are walking two levels: each row, and within it each element.',
      'The order out should match the order you would get by reading the grid left-to-right, top-to-bottom.',
    ],
    solution: 'def solve(matrix):\n    return [x for row in matrix for x in row]',
    compare: { kind: 'seq' },
    debrief: 'Row-major reading gives [1,2,3,4,5,6]. The trap transposes first (pairing the columns) and then flattens, so it walks the grid down each column instead of across each row and returns [1,3,5,2,4,6] - the right elements in the wrong order, which a length check would never catch. Both honest answers (a nested comprehension whose two clauses read outer-then-inner, or chaining the rows end to end) preserve row order.',
    canonicalMethodId: 'flat',
    methods: [
      { id: 'flat', name: 'nested comprehension', code: 'return [x for row in matrix for x in row]', detectionSignature: { mustMatch: ['for'], mustNotMatch: ['zip'], note: 'outer clause rows, inner clause elements' }, tradeoff: 'One expression; the two clauses read in the same order as nested loops.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'chain', name: 'chain the rows end to end', code: 'from itertools import chain\nreturn list(chain.from_iterable(matrix))', detectionSignature: { mustMatch: ['chain'], mustNotMatch: ['zip'], note: 'concatenates the sub-iterables in order' }, tradeoff: 'Same result, arguably clearest for a pure flatten; one import.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'column_major', name: 'transpose, then flatten', code: 'return [x for col in zip(*matrix) for x in col]', detectionSignature: { mustMatch: ['zip(*'], mustNotMatch: [], note: 'zip(*) transposes, so it walks columns' }, tradeoff: 'Returns all the same elements and runs cleanly.', breaksWhen: 'Always wrong here - zip(*matrix) transposes the grid, so the output is column-major [1,3,5,2,4,6], not the row-major order asked for.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the transpose-then-flatten version return the elements in the wrong order?', options: ['flat', 'chain', 'column_major'], answerId: 'column_major', explanation: 'zip(*matrix) pairs the grid by column, so flattening it walks down each column rather than across each row. Same elements, column-major order - a classic right-shape, wrong-order bug.' },
    ],
  },

  // ───────────────────── 3 · idioms · comprehensions · SINGLE-method (empty dial) ─────────────────────
  {
    id: 'pylab-idiom-gen-expr-stream',
    title: 'Total the values over a threshold',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['comprehensions', 'generator', 'streaming'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_sizes',
    prompt: 'Given a list of request sizes and a threshold, return the combined total of only the requests that are strictly larger than the threshold. Hold only one value at a time - do not build a separate filtered list first.',
    signature: 'solve(sizes, threshold)',
    starterCode: 'def solve(sizes, threshold):\n    # total of the strictly-over values, without materialising a filtered list\n    ...',
    hints: [
      'You want a sum over a filtered view of the input.',
      'A lazy producer with a condition can feed straight into the totaller, holding one value at a time.',
    ],
    solution: 'def solve(sizes, threshold):\n    return sum(x for x in sizes if x > threshold)',
    compare: { kind: 'value' },
    debrief: 'Two values clear the bar (100 and 200) for a total of 300. The lazy producer is consumed one value at a time, so no intermediate list is allocated - on a huge or streaming source that is the difference between O(1) and O(n) extra memory. There is one honest way to express this, so no method dial: it is a fluency rep, not a decision.',
    canonicalMethodId: 'genexpr',
    methods: [
      { id: 'genexpr', name: 'sum over a lazy producer', code: 'return sum(x for x in sizes if x > threshold)', detectionSignature: { mustMatch: ['sum'], mustNotMatch: [], note: 'a generator expression streamed straight into sum' }, tradeoff: 'Streams one value at a time, no intermediate list - the idiomatic filtered total.', breaksWhen: 'Nothing here - it is the canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── 4 · idioms · collections · SINGLE-method (empty dial) ─────────────────────
  {
    id: 'pylab-idiom-counter-topn',
    title: 'The most frequent levels',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['collections', 'counting', 'top-n'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_levels',
    prompt: 'Given a list of log-level strings and a number n, return the n most frequent levels as a list of (level, count) pairs, most frequent first.',
    signature: 'solve(levels, n)',
    starterCode: 'def solve(levels, n):\n    # the n most frequent (level, count) pairs, most frequent first\n    ...',
    hints: [
      'You need a frequency tally first, then the top entries from it.',
      'A purpose-built tally type can both count and hand back its most common entries already ordered.',
    ],
    solution: 'def solve(levels, n):\n    from collections import Counter\n    return Counter(levels).most_common(n)',
    compare: { kind: 'seq' },
    debrief: 'INFO leads with 3, ERROR follows with 2. The tally type returns the top n pairs already sorted by frequency, using a heap internally, so there is no separate sort to get wrong on ties. One honest expression here - no method dial; a fluency rep.',
    canonicalMethodId: 'counter',
    methods: [
      { id: 'counter', name: 'tally, then take the most common', code: 'from collections import Counter\nreturn Counter(levels).most_common(n)', detectionSignature: { mustMatch: ['Counter'], mustNotMatch: [], note: 'count then most_common(n)' }, tradeoff: 'The direct count-and-rank; most_common returns the pairs pre-sorted.', breaksWhen: 'Nothing here - canonical fluency answer.', isTrap: false },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [],
  },

  // ───────────────────── 5 · idioms · collections · multi-method + trap (dict-comp overwrite) ─────────────────────
  {
    id: 'pylab-idiom-defaultdict-groupby',
    title: 'Group names by team',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['collections', 'grouping', 'dict'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_pairs',
    prompt: 'Given a list of (team, name) pairs, return a dict mapping each team to the list of names on it, in the order they appear. A team can show up more than once.',
    signature: 'solve(pairs)',
    starterCode: 'def solve(pairs):\n    # {team: [names in order]}\n    ...',
    hints: [
      'A team can appear more than once, so you are appending to a list, not assigning a single value.',
      'You need a fresh list created the first time you see each team.',
    ],
    solution: 'def solve(pairs):\n    from collections import defaultdict\n    out = defaultdict(list)\n    for team, name in pairs:\n        out[team].append(name)\n    return dict(out)',
    compare: { kind: 'value' },
    debrief: 'Team A appears twice, and that is the trap. A one-line comprehension that maps team to name ASSIGNS rather than appends, so A keeps only its last name ("amy", losing "ann") - it runs and returns a dict, just the wrong one. Both honest answers accumulate a list per key: an auto-creating mapping, or one that lazily inserts an empty list the first time a key is touched.',
    canonicalMethodId: 'defaultdict',
    methods: [
      { id: 'defaultdict', name: 'auto-creating list mapping', code: 'from collections import defaultdict\nout = defaultdict(list)\nfor team, name in pairs:\n    out[team].append(name)\nreturn dict(out)', detectionSignature: { mustMatch: ['defaultdict'], mustNotMatch: [], note: 'the list is auto-created on first touch' }, tradeoff: 'The idiomatic accumulate-into-groups; no key-exists guard.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'setdefault', name: 'insert the list on first sight', code: 'out = {}\nfor team, name in pairs:\n    out.setdefault(team, []).append(name)\nreturn out', detectionSignature: { mustMatch: ['setdefault'], mustNotMatch: [], note: 'creates the list the first time the key is seen' }, tradeoff: 'Same result without an import; setdefault is a touch easier to misread.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'dict_comp', name: 'map team to name in one line', code: 'return {team: name for team, name in pairs}', detectionSignature: { mustMatch: ['for'], mustNotMatch: ['append', 'setdefault'], note: 'assigns, so later names overwrite earlier ones' }, tradeoff: 'Compact and runs.', breaksWhen: 'Any repeated team - it keeps only the last name, silently dropping the rest. Grouping needs accumulation, not assignment.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the one-line map lose names?', options: ['defaultdict', 'setdefault', 'dict_comp'], answerId: 'dict_comp', explanation: 'A comprehension assigns out[team] = name on each pair, so a repeated team overwrites its earlier value and keeps only the last name. Grouping needs to append into a list, not assign.' },
    ],
  },

  // ───────────────────── 6 · idioms · collections · multi-method + trap (first-n) ─────────────────────
  {
    id: 'pylab-idiom-deque-window',
    title: 'Keep the most recent readings',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['collections', 'buffer', 'window'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_readings',
    prompt: 'Stream a list of readings through a buffer that holds at most the n most recent values, dropping older ones as new ones arrive. Return the final buffer contents as a list, oldest to newest.',
    signature: 'solve(readings, n)',
    starterCode: 'def solve(readings, n):\n    # the final n most-recent readings, oldest to newest\n    ...',
    hints: [
      'As each reading arrives it joins the buffer; once the buffer is full, the oldest value must leave.',
      'The answer is about the END of the stream, not the start.',
    ],
    solution: 'def solve(readings, n):\n    from collections import deque\n    buf = deque(maxlen=n)\n    for r in readings:\n        buf.append(r)\n    return list(buf)',
    compare: { kind: 'seq' },
    debrief: 'After streaming 1..5 with a window of 3, the buffer holds [3,4,5]. The trap returns the FIRST three readings [1,2,3] - it has the right length and runs cleanly, which is exactly why it slips past a shape check. Both honest answers keep the most-recent window: a bounded buffer that drops the oldest item automatically, or a list re-trimmed to its last n each step.',
    canonicalMethodId: 'deque',
    methods: [
      { id: 'deque', name: 'bounded buffer', code: 'from collections import deque\nbuf = deque(maxlen=n)\nfor r in readings:\n    buf.append(r)\nreturn list(buf)', detectionSignature: { mustMatch: ['deque'], mustNotMatch: [], note: 'maxlen drops the oldest in O(1)' }, tradeoff: 'Appending past capacity discards the oldest in O(1); no manual trim.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'slice_tail', name: 'append then trim to the last n', code: 'buf = []\nfor r in readings:\n    buf.append(r)\n    buf = buf[-n:]\nreturn buf', detectionSignature: { mustMatch: ['[-n:]'], mustNotMatch: ['deque'], note: 'keeps the tail each step' }, tradeoff: 'Same result, but re-copies the slice every step - O(n) work where the buffer is O(1).', breaksWhen: 'Nothing functionally; just slower at scale.', isTrap: false },
      { id: 'first_n', name: 'take the first n readings', code: 'return readings[:n]', detectionSignature: { mustMatch: ['[:n]'], mustNotMatch: ['[-'], note: 'slices from the front, not the back' }, tradeoff: 'Returns n values in the right shape and runs.', breaksWhen: 'Always wrong here - it keeps the EARLIEST readings, not the most recent; the window slides forward, not back.', isTrap: true },
    ],
    dial: {
      axes: ['data-size'],
      rules: [
        { when: { 'data-size': 'large' }, rank: ['deque', 'slice_tail'], why: 'the bounded buffer drops the oldest item in O(1); re-slicing copies up to n elements on every reading.' },
      ],
    },
    mcqs: [
      { id: 'q1', stem: 'Why does readings[:n] return the wrong values?', options: ['deque', 'slice_tail', 'first_n'], answerId: 'first_n', explanation: 'A front slice keeps the earliest readings, but the window must keep the most recent. It runs and has the right length - a textbook right-shape, wrong-data bug.' },
      { id: 'q2', stem: 'On a very long stream, which valid method does less work per reading?', options: ['deque', 'slice_tail'], answerId: 'deque', explanation: 'A maxlen buffer evicts the oldest item in O(1); re-slicing to the last n copies up to n elements every step. Same answer, more work. (Magnitudes illustrative.)' },
    ],
  },

  // ───────────────────── 7 · idioms · functional · multi-method + trap (reverse loses tie order) ─────────────────────
  {
    id: 'pylab-idiom-sorted-key',
    title: 'Rank records by score then name',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['functional', 'sort', 'key'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_records',
    prompt: 'Given a list of (name, score) records, return them ordered by score from highest to lowest, and when two scores tie, by name from A to Z.',
    signature: 'solve(records)',
    starterCode: 'def solve(records):\n    # score high-to-low; ties broken by name A-to-Z\n    ...',
    hints: [
      'You are ordering by two fields with OPPOSITE directions - score descending, name ascending.',
      'A single ordering pass can take a key that ranks by score first and name second; think about how to flip just the score direction.',
    ],
    solution: 'def solve(records):\n    return sorted(records, key=lambda r: (-r[1], r[0]))',
    compare: { kind: 'seq' },
    debrief: 'ann and amy both score 90, so the tie-break direction is the whole test - the right order is (bob,95),(amy,90),(ann,90). The trap orders by score with reverse=True, which flips the ENTIRE comparison, so the tie comes out (ann, amy) - descending on name, the opposite of what was asked. It runs and looks sorted. The honest answer ranks by a key that descends on score (by negating it) while name still ascends, so only the score direction is flipped.',
    canonicalMethodId: 'tuple_key',
    methods: [
      { id: 'tuple_key', name: 'key that negates the score', code: 'return sorted(records, key=lambda r: (-r[1], r[0]))', detectionSignature: { mustMatch: ['key='], mustNotMatch: ['reverse'], note: 'negate score, name stays ascending' }, tradeoff: 'Flips only the score direction; name stays A-to-Z - the canonical multi-key sort.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'reverse_all', name: 'sort by score with reverse=True', code: 'return sorted(records, key=lambda r: r[1], reverse=True)', detectionSignature: { mustMatch: ['reverse=True'], mustNotMatch: [], note: 'reverse flips BOTH fields' }, tradeoff: 'Gets the score direction right and runs.', breaksWhen: 'Any tie - reverse=True reverses the whole comparison including the name tie-break, so tied names come out Z-to-A instead of A-to-Z.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does reverse=True break the tie order?', options: ['tuple_key', 'reverse_all'], answerId: 'reverse_all', explanation: 'reverse=True reverses the entire sort, including the name tie-break, so tied records come out Z-to-A. Negating just the score in the key flips that one field while name keeps ascending.' },
    ],
  },

  // ───────────────────── 8 · idioms · functional · multi-method + trap (any vs all) ─────────────────────
  {
    id: 'pylab-idiom-any-all',
    title: 'Check every row has an id',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['functional', 'validation', 'short-circuit'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_rows',
    prompt: 'Given a list of row dicts, return True only if every row has a non-empty "id" field, and False otherwise. A missing key or an empty string both count as failing.',
    signature: 'solve(rows)',
    starterCode: 'def solve(rows):\n    # True only if EVERY row has a truthy "id"\n    ...',
    hints: [
      'The claim is about ALL rows at once - one bad row should make the whole thing False.',
      'Fetch the id in a way that treats both a missing key and an empty string as falsy.',
    ],
    solution: 'def solve(rows):\n    return all(row.get("id") for row in rows)',
    compare: { kind: 'value' },
    debrief: 'The third row has an empty id, so the right answer is False. The trap asks whether ANY row has an id instead of whether ALL do - with one good row present it returns True, the exact opposite verdict on this batch. It runs and returns a bool; only the quantifier is wrong. The honest check asserts the property across every row and short-circuits on the first failure.',
    canonicalMethodId: 'all_gen',
    methods: [
      { id: 'all_gen', name: 'require every row', code: 'return all(row.get("id") for row in rows)', detectionSignature: { mustMatch: ['all('], mustNotMatch: ['any('], note: 'True only if every row passes' }, tradeoff: 'Reads like the sentence "all rows have an id"; short-circuits on the first failure.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'any_gen', name: 'accept if any row has one', code: 'return any(row.get("id") for row in rows)', detectionSignature: { mustMatch: ['any('], mustNotMatch: ['all('], note: 'True if at least one row passes' }, tradeoff: 'Runs and returns a bool.', breaksWhen: 'Always - it answers "is there at least one id?", the opposite of "do all rows have one?". One good row makes a batch with bad rows look valid.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the any() version pass a batch that should fail?', options: ['all_gen', 'any_gen'], answerId: 'any_gen', explanation: 'any() returns True as soon as one row has an id, so a batch with even a single valid row looks valid. The requirement is universal - every row must pass - which is all().' },
    ],
  },

  // ───────────────────── 9 · idioms · functional · multi-method + trap (sum instead of product) ─────────────────────
  {
    id: 'pylab-idiom-reduce-running',
    title: 'Multiply a list down to one number',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['functional', 'fold', 'reduce'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_nums',
    prompt: 'Given a list of integers, return the product of all of them - every element multiplied together. An empty list should give 1.',
    signature: 'solve(nums)',
    starterCode: 'def solve(nums):\n    # the product of every element; empty list -> 1\n    ...',
    hints: [
      'You are collapsing the whole list to a single value by repeatedly combining two numbers.',
      'Seed the running result at 1 so an empty list returns 1 and the multiplication starts correctly.',
    ],
    solution: 'def solve(nums):\n    from functools import reduce\n    return reduce(lambda acc, x: acc * x, nums, 1)',
    compare: { kind: 'value' },
    debrief: 'The product of 1..4 is 24. The trap folds with addition (and seeds at 0), so it returns the SUM, 10 - same fold shape, wrong combine, and it runs without complaint. Both honest answers multiply: a left fold seeded at 1, or the built-in product helper. Seeding the fold at 1 (the multiplicative identity) is what makes the empty case return 1 rather than erroring.',
    canonicalMethodId: 'reduce_mul',
    methods: [
      { id: 'reduce_mul', name: 'fold with multiply, seeded at 1', code: 'from functools import reduce\nreturn reduce(lambda acc, x: acc * x, nums, 1)', detectionSignature: { mustMatch: ['reduce'], mustNotMatch: ['+'], note: 'multiplicative fold with initial 1' }, tradeoff: 'The general fold; the explicit seed of 1 defines the empty case.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'math_prod', name: 'built-in product', code: 'import math\nreturn math.prod(nums)', detectionSignature: { mustMatch: ['math.prod'], mustNotMatch: [], note: 'standard-library product; empty -> 1' }, tradeoff: 'Clearer for a plain product, and already returns 1 on an empty list.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'reduce_add', name: 'fold with add, seeded at 0', code: 'from functools import reduce\nreturn reduce(lambda acc, x: acc + x, nums, 0)', detectionSignature: { mustMatch: ['+'], mustNotMatch: ['*'], note: 'sums instead of multiplying' }, tradeoff: 'Same fold scaffolding and runs.', breaksWhen: 'Always wrong here - it adds rather than multiplies, returning the sum (10) instead of the product (24).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the add-fold return 10 instead of 24?', options: ['reduce_mul', 'math_prod', 'reduce_add'], answerId: 'reduce_add', explanation: 'The fold scaffolding is right but the combining function adds instead of multiplies (and seeds at 0), so it computes the sum. The task is a product - multiply, seeded at 1.' },
    ],
  },

  // ───────────────────── 10 · idioms · functional · multi-method + trap (whole-collection tally) ─────────────────────
  {
    id: 'pylab-idiom-itertools-groupby',
    title: 'Encode the runs in a string',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['functional', 'itertools', 'runs'],
    estimatedMin: 6,
    fixtureId: 'fx_idiom_runs',
    prompt: 'Given a string, return a list of (character, length) pairs, one for each run of identical characters that sit next to each other. A character that reappears later, separated by others, starts a new run.',
    signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # (char, run_length) for each consecutive run\n    ...',
    hints: [
      'A run ends as soon as the character changes; a later reappearance is a separate run.',
      'Group CONSECUTIVE equal characters, then count the length of each group.',
    ],
    solution: 'def solve(s):\n    from itertools import groupby\n    return [(ch, sum(1 for _ in grp)) for ch, grp in groupby(s)]',
    compare: { kind: 'seq' },
    debrief: 'The string "aabba" has two separate a-runs, so the answer is [(a,2),(b,2),(a,1)] - and that split is the whole point. The trap tallies the WHOLE string (a appears 3 times total) and emits one entry per distinct character, [(a,3),(b,2)], merging the two a-runs and losing the final run entirely. It runs and looks like counts. The honest answer groups only ADJACENT equal characters, so a reappearance starts a fresh run.',
    canonicalMethodId: 'groupby',
    methods: [
      { id: 'groupby', name: 'group adjacent equal characters', code: 'from itertools import groupby\nreturn [(ch, sum(1 for _ in grp)) for ch, grp in groupby(s)]', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: ['Counter'], note: 'groups only CONSECUTIVE equal items' }, tradeoff: 'Built for runs - it splits the stream wherever the character changes.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'counter_tally', name: 'tally the whole string', code: 'from collections import Counter\nc = Counter(s)\nreturn [(ch, c[ch]) for ch in dict.fromkeys(s)]', detectionSignature: { mustMatch: ['Counter'], mustNotMatch: ['groupby'], note: 'counts across the whole string, ignoring adjacency' }, tradeoff: 'Returns (char, count) pairs and runs.', breaksWhen: 'Any character that appears in more than one run - a whole-string tally merges the runs (a:3) instead of reporting each run (a:2 then a:1).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the whole-string tally give the wrong answer for "aabba"?', options: ['groupby', 'counter_tally'], answerId: 'counter_tally', explanation: 'A tally counts every "a" across the string (3) and ignores that they form two separate runs. Run-length encoding needs grouping of ADJACENT equal characters, which is what groupby does.' },
    ],
  },

  // ───────────────────── 11 · idioms · functional · multi-method + trap (no accumulate) ─────────────────────
  {
    id: 'pylab-idiom-itertools-accumulate',
    title: 'Running totals of the deltas',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['functional', 'itertools', 'cumulative'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_deltas',
    prompt: 'Given a list of daily deltas, return the list of running cumulative totals: each output value is the sum of all deltas up to and including that position.',
    signature: 'solve(deltas)',
    starterCode: 'def solve(deltas):\n    # the running cumulative totals\n    ...',
    hints: [
      'The first output equals the first delta; each later output adds the next delta to the previous total.',
      'The output has the same length as the input - one running total per position.',
    ],
    solution: 'def solve(deltas):\n    from itertools import accumulate\n    return list(accumulate(deltas))',
    compare: { kind: 'seq' },
    debrief: 'The running totals of [1,2,3,4] are [1,3,6,10]. The trap returns the raw deltas unchanged - it forgot to accumulate, so it gives [1,2,3,4]; same length, identical first value, which is exactly how it sneaks past a quick glance at element zero. Both honest answers carry a running sum forward: the built-in prefix-sum helper, or a manual accumulator threaded through a loop.',
    canonicalMethodId: 'accumulate',
    methods: [
      { id: 'accumulate', name: 'built-in prefix sums', code: 'from itertools import accumulate\nreturn list(accumulate(deltas))', detectionSignature: { mustMatch: ['accumulate'], mustNotMatch: [], note: 'yields each prefix-sum lazily' }, tradeoff: 'One pass, no explicit accumulator; takes a custom binary op for running products/maxima.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'manual', name: 'thread a running sum', code: 'out = []\ntotal = 0\nfor d in deltas:\n    total += d\n    out.append(total)\nreturn out', detectionSignature: { mustMatch: ['+='], mustNotMatch: ['accumulate'], note: 'explicit accumulator in a loop' }, tradeoff: 'Same result, fully explicit - clear to any reader.', breaksWhen: 'Nothing for this task.', isTrap: false },
      { id: 'plain_list', name: 'return the deltas as-is', code: 'return list(deltas)', detectionSignature: { mustMatch: ['list('], mustNotMatch: ['accumulate', '+='], note: 'never accumulates' }, tradeoff: 'Right length, right first value, and runs.', breaksWhen: 'Always wrong here - it never accumulates, so every position past the first is just the raw delta, not a running total.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does returning the deltas unchanged pass a length check but fail the task?', options: ['accumulate', 'manual', 'plain_list'], answerId: 'plain_list', explanation: 'It has the same length and the same first element as the correct answer, but no value past index 0 carries the running sum. Cumulative totals require accumulating, which the raw list never does.' },
    ],
  },

  // ───────────────────── 12 · idioms · context-managers · multi-method + trap (no restore) ─────────────────────
  {
    id: 'pylab-idiom-contextmanager-decorator',
    title: 'Temporarily change a setting',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['context-managers', 'cleanup', 'state'],
    estimatedMin: 7,
    fixtureId: 'fx_idiom_store',
    prompt: 'Build a block-scoped tool that sets store[key] to a new value for the duration of a block and then puts the original value back when the block ends. Use it once: record the value seen INSIDE the block, then the value AFTER the block, and return [inside, after].',
    signature: 'solve(store, key, value)',
    starterCode: 'def solve(store, key, value):\n    # set store[key]=value inside a block, then restore the original on exit\n    # return [value_seen_inside, value_after]\n    ...',
    hints: [
      'Capture the original value before overwriting it, and put it back when the block finishes.',
      'The restore has to happen on the way OUT of the block, not just on the way in.',
    ],
    solution: 'def solve(store, key, value):\n    from contextlib import contextmanager\n    @contextmanager\n    def temp_value(store, key, value):\n        original = store[key]\n        store[key] = value\n        try:\n            yield\n        finally:\n            store[key] = original\n    seen = []\n    with temp_value(store, key, value):\n        seen.append(store[key])\n    seen.append(store[key])\n    return seen',
    compare: { kind: 'seq' },
    debrief: 'Inside the block the value is "test"; after it, the original "prod" must be back, so the answer is ["test","prod"]. The trap sets the new value but never restores the old one, so the "after" reading is still "test" - it returns ["test","test"], runs without error, and the leak only shows up in the second element. The honest version captures the original before overwriting and restores it on the way out (a finally clause makes that hold even if the block raises).',
    canonicalMethodId: 'finally_restore',
    methods: [
      { id: 'finally_restore', name: 'save, set, restore in finally', code: 'from contextlib import contextmanager\n@contextmanager\ndef temp_value(store, key, value):\n    original = store[key]\n    store[key] = value\n    try:\n        yield\n    finally:\n        store[key] = original\nseen = []\nwith temp_value(store, key, value):\n    seen.append(store[key])\nseen.append(store[key])\nreturn seen', detectionSignature: { mustMatch: ['finally'], mustNotMatch: [], note: 'restore runs on every exit path' }, tradeoff: 'Setup before yield, teardown after - the finally guarantees restore even on an exception.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'no_restore', name: 'set the value, never restore', code: 'from contextlib import contextmanager\n@contextmanager\ndef temp_value(store, key, value):\n    store[key] = value\n    yield\nseen = []\nwith temp_value(store, key, value):\n    seen.append(store[key])\nseen.append(store[key])\nreturn seen', detectionSignature: { mustMatch: ['yield'], mustNotMatch: ['finally', 'original'], note: 'no teardown - the override leaks' }, tradeoff: 'Sets the value correctly and the inside reading looks right.', breaksWhen: 'Always - it never puts the original back, so the change leaks past the block. "after" stays "test" instead of "prod".', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the no-restore version leave the wrong value after the block?', options: ['finally_restore', 'no_restore'], answerId: 'no_restore', explanation: 'It overwrites store[key] but never captures or restores the original, so the override persists after the block. A "temporarily change, then put back" tool needs teardown (here, a finally clause).' },
    ],
  },

  // ───────────────────── 13 · idioms · context-managers · multi-method + trap (flipped subtraction) ─────────────────────
  {
    id: 'pylab-idiom-context-class',
    title: 'A timer you can wrap a block with',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['context-managers', 'class', 'protocol'],
    estimatedMin: 7,
    fixtureId: 'fx_idiom_ticks',
    prompt: 'Build a timer object that can wrap a block: entering the block records a start reading from an injected clock, and leaving the block records an elapsed value of end-minus-start. Entering should hand back the timer itself. Drive it with a clock that returns the given ticks in order, then return (was the handle the timer itself, the elapsed value).',
    signature: 'solve(ticks)',
    starterCode: 'def solve(ticks):\n    # build a timer; on enter record start and hand back self; on exit set elapsed = end - start\n    # return (handle is the timer, elapsed)\n    ...',
    hints: [
      'Two hooks fire around the block: one on entry (record the start, return the object), one on exit (compute elapsed).',
      'elapsed is the LATER reading minus the EARLIER one - mind the order of the subtraction.',
    ],
    solution: 'def solve(ticks):\n    it = iter(ticks)\n    clock = lambda: next(it)\n    class Timer:\n        def __init__(self, c):\n            self.clock = c\n            self.elapsed = None\n        def __enter__(self):\n            self.start = self.clock()\n            return self\n        def __exit__(self, exc_type, exc, tb):\n            self.elapsed = self.clock() - self.start\n            return False\n    t = Timer(clock)\n    with t as handle:\n        same = handle is t\n    return (same, t.elapsed)',
    compare: { kind: 'seq' },
    debrief: 'The clock ticks 10 then 13, so elapsed is 13-10 = 3 and the handle is the timer itself: (True, 3). The trap subtracts the other way (start minus end), giving -3 - it runs, returns a number, and is plausibly close, which is what makes a sign error so easy to miss. The honest exit hook computes end minus start. Returning the object itself from the entry hook is what makes the "as" handle be the timer.',
    canonicalMethodId: 'enter_exit',
    methods: [
      { id: 'enter_exit', name: 'enter records start, exit measures end-start', code: 'it = iter(ticks)\nclock = lambda: next(it)\nclass Timer:\n    def __init__(self, c):\n        self.clock = c\n        self.elapsed = None\n    def __enter__(self):\n        self.start = self.clock()\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        self.elapsed = self.clock() - self.start\n        return False\nt = Timer(clock)\nwith t as handle:\n    same = handle is t\nreturn (same, t.elapsed)', detectionSignature: { mustMatch: ['self.clock() - self.start'], mustNotMatch: [], note: 'end minus start' }, tradeoff: 'Entry returns self (so "as" binds the timer); exit measures end minus start.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'flipped_delta', name: 'subtract start minus end', code: 'it = iter(ticks)\nclock = lambda: next(it)\nclass Timer:\n    def __init__(self, c):\n        self.clock = c\n        self.elapsed = None\n    def __enter__(self):\n        self.start = self.clock()\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        self.elapsed = self.start - self.clock()\n        return False\nt = Timer(clock)\nwith t as handle:\n    same = handle is t\nreturn (same, t.elapsed)', detectionSignature: { mustMatch: ['self.start - self.clock()'], mustNotMatch: [], note: 'subtraction reversed' }, tradeoff: 'Runs and returns a number of the right magnitude.', breaksWhen: 'Always - the subtraction is reversed, so elapsed comes out negative (-3 instead of 3). A sign error that survives a "looks like a duration" glance.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the flipped version report a negative elapsed time?', options: ['enter_exit', 'flipped_delta'], answerId: 'flipped_delta', explanation: 'It computes start minus end rather than end minus start, so a forward-moving clock yields a negative duration. Elapsed time is the later reading minus the earlier one.' },
    ],
  },

  // ───────────────────── 14 · idioms · decorators · multi-method + trap (increment after return) ─────────────────────
  {
    id: 'pylab-idiom-decorator-counter',
    title: 'Count how many times a function ran',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['decorators', 'wrapper', 'state'],
    estimatedMin: 7,
    fixtureId: 'fx_idiom_none',
    prompt: 'Wrap a function so it tracks how many times it has been called, exposing the running count on a .calls attribute on the wrapped function (starting at 0) and keeping the function\'s original name. Wrap a greet function with it, call the wrapped function twice, then return (the call count, the wrapped function\'s name).',
    signature: 'solve()',
    starterCode: 'def solve():\n    # wrap a function to track .calls and preserve its __name__\n    # apply to greet, call it twice, return (greet.calls, greet.__name__)\n    ...',
    hints: [
      'The wrapper runs every time the function is called - that is where the counter should tick.',
      'Make sure the count goes up BEFORE you hand back the result, and copy the original metadata onto the wrapper so the name survives.',
    ],
    solution: 'def solve():\n    import functools\n    def count_calls(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            wrapper.calls += 1\n            return fn(*args, **kwargs)\n        wrapper.calls = 0\n        return wrapper\n    @count_calls\n    def greet(name):\n        return "hi " + name\n    greet("a")\n    greet("b")\n    return (greet.calls, greet.__name__)',
    compare: { kind: 'seq' },
    debrief: 'After two calls the count is 2 and the preserved name is "greet": (2, "greet"). The trap increments AFTER the return statement, so the increment line never executes and the count stays stuck at 0 - the wrapper still returns the right values, so only the counter is silently dead. The honest wrapper ticks the counter before returning, and copying the original metadata onto the wrapper keeps the name as "greet" instead of "wrapper".',
    canonicalMethodId: 'wraps_counter',
    methods: [
      { id: 'wraps_counter', name: 'tick before returning', code: 'import functools\ndef count_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return fn(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n@count_calls\ndef greet(name):\n    return "hi " + name\ngreet("a")\ngreet("b")\nreturn (greet.calls, greet.__name__)', detectionSignature: { mustMatch: ['wrapper.calls += 1'], mustNotMatch: [], note: 'increment precedes the return' }, tradeoff: 'State on the wrapper object; metadata copied so the name survives introspection.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'inc_after_return', name: 'increment after the return', code: 'import functools\ndef count_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs)\n        wrapper.calls += 1\n    wrapper.calls = 0\n    return wrapper\n@count_calls\ndef greet(name):\n    return "hi " + name\ngreet("a")\ngreet("b")\nreturn (greet.calls, greet.__name__)', detectionSignature: { mustMatch: ['return fn'], mustNotMatch: [], note: 'increment is unreachable, after return' }, tradeoff: 'Returns the right values and runs.', breaksWhen: 'Always - the increment sits after the return, so it is unreachable and the count never moves off 0.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the second wrapper always report 0 calls?', options: ['wraps_counter', 'inc_after_return'], answerId: 'inc_after_return', explanation: 'The increment is placed after the return statement, so it is unreachable - the function returns first and the counter line never runs. The tick must happen before returning.' },
    ],
  },

  // ───────────────────── 15 · idioms · decorators · multi-method + trap (cache rebuilt per call) ─────────────────────
  {
    id: 'pylab-idiom-decorator-memoize',
    title: 'Cache a function\'s results',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['decorators', 'cache', 'closure'],
    estimatedMin: 8,
    fixtureId: 'fx_idiom_none',
    prompt: 'Wrap a function so that repeating a call with the same argument returns a remembered result instead of recomputing it, and expose the number of real (recomputed) calls on a .misses attribute. Use it on a squaring function, call it three times with the SAME argument, then return ((the three results), the number of real computations).',
    signature: 'solve()',
    starterCode: 'def solve():\n    # wrap a function to remember results by argument; track real computations in .misses\n    # apply to square, call square(5) three times, return ((r1, r2, r3), square.misses)\n    ...',
    hints: [
      'The remembered results have to OUTLIVE a single call - they live across calls, not inside one.',
      'On a repeated argument you should find the value already stored and skip the computation.',
    ],
    solution: 'def solve():\n    import functools\n    def memoize(fn):\n        cache = {}\n        @functools.wraps(fn)\n        def wrapper(*args):\n            if args not in cache:\n                wrapper.misses += 1\n                cache[args] = fn(*args)\n            return cache[args]\n        wrapper.misses = 0\n        return wrapper\n    @memoize\n    def square(x):\n        return x * x\n    results = (square(5), square(5), square(5))\n    return (results, square.misses)',
    compare: { kind: 'seq' },
    debrief: 'square(5) called three times returns (25,25,25) and should recompute only ONCE, so misses is 1. The trap rebuilds the cache as a fresh empty dict INSIDE the wrapper on every call, so nothing is ever remembered and every call is a miss - misses comes out 3. The results still look right, which is why the broken cache hides. The honest version holds the cache in the surrounding closure so it persists across calls; only the first call for a given argument is a miss.',
    canonicalMethodId: 'closure_cache',
    methods: [
      { id: 'closure_cache', name: 'cache in the enclosing closure', code: 'import functools\ndef memoize(fn):\n    cache = {}\n    @functools.wraps(fn)\n    def wrapper(*args):\n        if args not in cache:\n            wrapper.misses += 1\n            cache[args] = fn(*args)\n        return cache[args]\n    wrapper.misses = 0\n    return wrapper\n@memoize\ndef square(x):\n    return x * x\nresults = (square(5), square(5), square(5))\nreturn (results, square.misses)', detectionSignature: { mustMatch: ['cache = {}'], mustNotMatch: [], note: 'cache lives outside the wrapper, persists across calls' }, tradeoff: 'The args tuple is hashable, so it keys the cache directly; the closure keeps it alive between calls.', breaksWhen: 'Nothing here - canonical (the hand-rolled lru_cache).', isTrap: false },
      { id: 'cache_inside_wrapper', name: 'rebuild the cache each call', code: 'import functools\ndef memoize(fn):\n    @functools.wraps(fn)\n    def wrapper(*args):\n        cache = {}\n        if args not in cache:\n            wrapper.misses += 1\n            cache[args] = fn(*args)\n        return cache[args]\n    wrapper.misses = 0\n    return wrapper\n@memoize\ndef square(x):\n    return x * x\nresults = (square(5), square(5), square(5))\nreturn (results, square.misses)', detectionSignature: { mustMatch: ['cache = {}'], mustNotMatch: [], note: 'cache reset on entry, never persists' }, tradeoff: 'Returns correct values and runs.', breaksWhen: 'Always - the cache is recreated empty on every call, so nothing is ever a hit; every call recomputes and misses climbs to the call count.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the second version recompute every time despite having a cache?', options: ['closure_cache', 'cache_inside_wrapper'], answerId: 'cache_inside_wrapper', explanation: 'It creates the cache inside the wrapper, so a fresh empty dict is built on every call and nothing survives between calls. The cache must live in the enclosing closure to persist.' },
    ],
  },

  // ───────────────────── 16 · idioms · unpacking · multi-method + trap (middle keeps last) ─────────────────────
  {
    id: 'pylab-idiom-starred-unpack',
    title: 'Split off the first and last',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['unpacking', 'starred', 'slicing'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_items',
    prompt: 'Given a list of at least two elements, return a (first, last, middle) tuple where first is the first element, last is the last element, and middle is a list of everything strictly between them.',
    signature: 'solve(items)',
    starterCode: 'def solve(items):\n    # return (first, last, middle_list)\n    ...',
    hints: [
      'You want to bind the two ends and let everything in between collect into a list.',
      'A single assignment can capture the first, the last, and a starred middle that absorbs the interior.',
    ],
    solution: 'def solve(items):\n    first, *middle, last = items\n    return (first, last, middle)',
    compare: { kind: 'seq' },
    debrief: 'For [1,2,3,4,5] the answer is (1, 5, [2,3,4]). The trap binds the first element and captures everything ELSE into the starred name, then reads the last from that capture - so middle wrongly still contains the last element, [2,3,4,5]. It runs and the first/last are right; only the interior is off. The honest form puts the star BETWEEN two end targets, so it absorbs exactly the interior and the ends bind separately.',
    canonicalMethodId: 'starred',
    methods: [
      { id: 'starred', name: 'star between the two ends', code: 'first, *middle, last = items\nreturn (first, last, middle)', detectionSignature: { mustMatch: ['*middle, last'], mustNotMatch: [], note: 'star absorbs exactly the interior' }, tradeoff: 'The ends bind, the star takes the rest - cleaner than items[0], items[-1], items[1:-1].', breaksWhen: 'Needs at least two elements (both ends must bind) - which the prompt guarantees.', isTrap: false },
      { id: 'star_tail', name: 'star the whole tail, then read its end', code: 'first, *rest = items\nreturn (first, rest[-1], rest)', detectionSignature: { mustMatch: ['*rest'], mustNotMatch: ['*middle'], note: 'rest still includes the last element' }, tradeoff: 'First and last come out right and it runs.', breaksWhen: 'Always wrong here - rest captures everything after the first, including the last, so the returned middle still contains the last element.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the second version return a middle that includes the last element?', options: ['starred', 'star_tail'], answerId: 'star_tail', explanation: 'Putting the star at the end (first, *rest) makes rest absorb the entire tail, last element included. Reading rest[-1] for "last" does not remove it from rest. Placing the star between two targets binds both ends separately.' },
    ],
  },

  // ───────────────────── 17 · idioms · unpacking · multi-method + trap (spread order swapped) ─────────────────────
  {
    id: 'pylab-idiom-dict-merge',
    title: 'Merge defaults with overrides',
    topic: 'idioms',
    difficulty: 'warmup',
    tags: ['unpacking', 'dict', 'merge'],
    estimatedMin: 4,
    fixtureId: 'fx_idiom_config',
    prompt: 'Given a defaults dict and an overrides dict, return a new combined dict where, on any key they both have, the override value wins. Neither input may be mutated.',
    signature: 'solve(defaults, overrides)',
    starterCode: 'def solve(defaults, overrides):\n    # new merged dict; override wins on shared keys; inputs untouched\n    ...',
    hints: [
      'Build a fresh dict from both, so neither input changes.',
      'On a shared key, the value applied LAST is the one that survives - order matters.',
    ],
    solution: 'def solve(defaults, overrides):\n    return {**defaults, **overrides}',
    compare: { kind: 'value' },
    debrief: 'Both dicts have key "b"; the override (9) must win, so the answer is {a:1, b:9}. The trap merges in the opposite order, letting the default (2) win, so "b" comes out 2 - it returns a perfectly valid dict, just with the precedence backwards. The honest form spreads defaults first and overrides last, because on a collision the LATER spread wins; building a new dict also leaves both inputs untouched.',
    canonicalMethodId: 'spread',
    methods: [
      { id: 'spread', name: 'spread defaults then overrides', code: 'return {**defaults, **overrides}', detectionSignature: { mustMatch: ['**defaults', '**overrides'], mustNotMatch: [], note: 'overrides spread last, so they win' }, tradeoff: 'A fresh dict; later spread wins, inputs untouched.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'pipe', name: 'combine with the merge operator', code: 'return defaults | overrides', detectionSignature: { mustMatch: ['|'], mustNotMatch: [], note: 'right operand wins on collisions (3.9+)' }, tradeoff: 'Same result, very readable; the right operand wins on shared keys.', breaksWhen: 'Nothing for this task (needs Python 3.9+).', isTrap: false },
      { id: 'swapped', name: 'spread overrides then defaults', code: 'return {**overrides, **defaults}', detectionSignature: { mustMatch: ['**overrides', '**defaults'], mustNotMatch: [], note: 'defaults spread last, so they win' }, tradeoff: 'Builds a fresh dict and runs.', breaksWhen: 'Any shared key - defaults are spread last so they win, giving the DEFAULT value where the override should have taken over.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the swapped-order merge keep the wrong value on shared keys?', options: ['spread', 'pipe', 'swapped'], answerId: 'swapped', explanation: 'On a key collision the LAST spread wins. Spreading overrides first and defaults last lets the default value overwrite the override, inverting the intended precedence.' },
    ],
  },

  // ───────────────────── 18 · idioms · unpacking · multi-method + trap (default start 0) ─────────────────────
  {
    id: 'pylab-idiom-zip-enumerate',
    title: 'Number two columns by position',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['unpacking', 'zip', 'enumerate'],
    estimatedMin: 5,
    fixtureId: 'fx_idiom_columns',
    prompt: 'Given a list of names and a parallel list of scores, return a list of "i. name=score" strings, where i is the position counting from 1 for the first row.',
    signature: 'solve(names, scores)',
    starterCode: 'def solve(names, scores):\n    # ["1. name=score", "2. ..."], numbered from 1\n    ...',
    hints: [
      'Pair each name with its score by position, and lay a position counter over the pairs.',
      'The first row is numbered 1, not 0 - the counter has to start at one.',
    ],
    solution: 'def solve(names, scores):\n    return ["{}. {}={}".format(i, n, s) for i, (n, s) in enumerate(zip(names, scores), start=1)]',
    compare: { kind: 'seq' },
    debrief: 'The labels must read "1. ann=90", "2. bob=85" - numbered from 1. The trap uses the default counter that starts at 0, so every label is off by one: "0. ann=90", "1. bob=85". It runs and the name/score parts are correct; only the index is wrong. The honest form pairs the columns by position and lays a counter over them that starts at 1, instead of reaching for manual range-and-index.',
    canonicalMethodId: 'zip_enum',
    methods: [
      { id: 'zip_enum', name: 'pair the columns, count from 1', code: 'return ["{}. {}={}".format(i, n, s) for i, (n, s) in enumerate(zip(names, scores), start=1)]', detectionSignature: { mustMatch: ['start=1'], mustNotMatch: [], note: 'counter explicitly starts at 1' }, tradeoff: 'Pairs by position and overlays a 1-based counter - no range(len(...)) indexing.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'default_start', name: 'pair the columns, default counter', code: 'return ["{}. {}={}".format(i, n, s) for i, (n, s) in enumerate(zip(names, scores))]', detectionSignature: { mustMatch: ['enumerate(zip'], mustNotMatch: ['start=1'], note: 'counter starts at 0' }, tradeoff: 'Right structure, right name/score, and runs.', breaksWhen: 'Always wrong here - the default counter starts at 0, so every label is off by one (0. instead of 1.).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why are the labels off by one in the second version?', options: ['zip_enum', 'default_start'], answerId: 'default_start', explanation: 'The position counter defaults to starting at 0, so the first row is labelled 0 rather than 1. Passing start=1 makes the numbering 1-based as required.' },
    ],
  },

  // ───────────────────── 19 · idioms · dunder · multi-method + trap (equality ignores y) ─────────────────────
  {
    id: 'pylab-idiom-dunder-repr-eq',
    title: 'Make a class print and compare',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['dunder', 'repr', 'equality'],
    estimatedMin: 6,
    fixtureId: 'fx_idiom_none',
    prompt: 'Define a Point with x and y so that its developer-facing string reads exactly "Point(x=1, y=2)" for a point at (1, 2), and two points compare equal only when BOTH coordinates match (a point is never equal to a non-point). Build points at (1,2), (1,2) and (1,99); return (the string for the first, first equals second, first equals third, first equals the string "foo").',
    signature: 'solve()',
    starterCode: 'def solve():\n    # define Point with a developer string and value-equality on BOTH coordinates\n    # build p=(1,2), q=(1,2), r=(1,99); return (repr(p), p==q, p==r, p=="foo")\n    ...',
    hints: [
      'One hook controls the printed representation; another controls what == means.',
      'Equality should compare both coordinates, and refuse to claim equality with an unrelated type.',
    ],
    solution: 'def solve():\n    class Point:\n        def __init__(self, x, y):\n            self.x = x\n            self.y = y\n        def __repr__(self):\n            return "Point(x={}, y={})".format(self.x, self.y)\n        def __eq__(self, other):\n            if not isinstance(other, Point):\n                return NotImplemented\n            return (self.x, self.y) == (other.x, other.y)\n    p = Point(1, 2)\n    q = Point(1, 2)\n    r = Point(1, 99)\n    return (repr(p), p == q, p == r, p == "foo")',
    compare: { kind: 'seq' },
    debrief: 'The answer is ("Point(x=1, y=2)", True, False, False): equal coords are equal, a differing y is not, and a string is never equal. The trap compares only x, so the point at (1,99) is wrongly judged equal to (1,2) - p==r returns True. It runs and three of the four answers look right, which is how a half-implemented equality slips through. The honest equality compares BOTH coordinates and returns NotImplemented for foreign types so Python falls back correctly rather than forcing a wrong answer.',
    canonicalMethodId: 'repr_eq',
    methods: [
      { id: 'repr_eq', name: 'compare both coordinates', code: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __repr__(self):\n        return "Point(x={}, y={})".format(self.x, self.y)\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return (self.x, self.y) == (other.x, other.y)\np = Point(1, 2)\nq = Point(1, 2)\nr = Point(1, 99)\nreturn (repr(p), p == q, p == r, p == "foo")', detectionSignature: { mustMatch: ['(self.x, self.y)'], mustNotMatch: [], note: 'equality on both coordinates' }, tradeoff: 'Comparing the coordinate tuples is concise; NotImplemented lets Python fall back for foreign types.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'eq_partial', name: 'compare only x', code: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __repr__(self):\n        return "Point(x={}, y={})".format(self.x, self.y)\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x\np = Point(1, 2)\nq = Point(1, 2)\nr = Point(1, 99)\nreturn (repr(p), p == q, p == r, p == "foo")', detectionSignature: { mustMatch: ['self.x == other.x'], mustNotMatch: ['self.y'], note: 'ignores y' }, tradeoff: 'Looks right for points that happen to share x and runs.', breaksWhen: 'Any two points with the same x but different y - they are wrongly judged equal, because the comparison never looks at y.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the partial version call (1,2) and (1,99) equal?', options: ['repr_eq', 'eq_partial'], answerId: 'eq_partial', explanation: 'Its equality compares only x, so any two points sharing an x are deemed equal regardless of y. Value equality has to compare every coordinate that defines the value.' },
    ],
  },

  // ───────────────────── 20 · idioms · dunder · multi-method + trap (getitem off-by-one) ─────────────────────
  {
    id: 'pylab-idiom-dunder-len-getitem',
    title: 'Make a class act like a sequence',
    topic: 'idioms',
    difficulty: 'core',
    tags: ['dunder', 'sequence', 'getitem'],
    estimatedMin: 6,
    fixtureId: 'fx_idiom_none',
    prompt: 'Define a Playlist wrapping a list of track names so that the number of tracks, indexing into the tracks, and membership tests all work directly on the playlist. Build a playlist of ["intro", "verse", "outro"]; return (its length, the item at index 1, whether "verse" is in it, whether "bridge" is in it).',
    signature: 'solve()',
    starterCode: 'def solve():\n    # define Playlist so len(pl), pl[i], and "x" in pl all work\n    # build pl=["intro","verse","outro"]; return (len(pl), pl[1], "verse" in pl, "bridge" in pl)\n    ...',
    hints: [
      'Three behaviours to expose: a length, an index lookup, and a membership test.',
      'Each can delegate straight to the wrapped list - and index i should map to position i, not i-1.',
    ],
    solution: 'def solve():\n    class Playlist:\n        def __init__(self, tracks):\n            self.tracks = list(tracks)\n        def __len__(self):\n            return len(self.tracks)\n        def __getitem__(self, i):\n            return self.tracks[i]\n        def __contains__(self, item):\n            return item in self.tracks\n    pl = Playlist(["intro", "verse", "outro"])\n    return (len(pl), pl[1], "verse" in pl, "bridge" in pl)',
    compare: { kind: 'seq' },
    debrief: 'The answer is (3, "verse", True, False): length 3, index 1 is "verse", "verse" is present, "bridge" is not. The trap shifts the index by one (returning tracks[i-1]), so pl[1] comes back "intro" instead of "verse" - length and membership still look right, so only the indexing is off. The honest version delegates each behaviour straight to the wrapped list, mapping index i to position i.',
    canonicalMethodId: 'sequence_protocol',
    methods: [
      { id: 'sequence_protocol', name: 'delegate each behaviour to the list', code: 'class Playlist:\n    def __init__(self, tracks):\n        self.tracks = list(tracks)\n    def __len__(self):\n        return len(self.tracks)\n    def __getitem__(self, i):\n        return self.tracks[i]\n    def __contains__(self, item):\n        return item in self.tracks\npl = Playlist(["intro", "verse", "outro"])\nreturn (len(pl), pl[1], "verse" in pl, "bridge" in pl)', detectionSignature: { mustMatch: ['self.tracks[i]'], mustNotMatch: ['i - 1', 'i-1'], note: 'index i maps to position i' }, tradeoff: 'Each hook forwards to the wrapped list - sequence behaviour without subclassing list.', breaksWhen: 'Nothing here - canonical.', isTrap: false },
      { id: 'off_by_one', name: 'index shifted by one', code: 'class Playlist:\n    def __init__(self, tracks):\n        self.tracks = list(tracks)\n    def __len__(self):\n        return len(self.tracks)\n    def __getitem__(self, i):\n        return self.tracks[i - 1]\n    def __contains__(self, item):\n        return item in self.tracks\npl = Playlist(["intro", "verse", "outro"])\nreturn (len(pl), pl[1], "verse" in pl, "bridge" in pl)', detectionSignature: { mustMatch: ['i - 1'], mustNotMatch: [], note: 'maps index i to position i-1' }, tradeoff: 'Length and membership are right and it runs.', breaksWhen: 'Always wrong on indexing - mapping i to i-1 returns the previous track, so pl[1] gives "intro" instead of "verse" (and pl[0] silently wraps to the last item).', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does pl[1] return the wrong track in the second version?', options: ['sequence_protocol', 'off_by_one'], answerId: 'off_by_one', explanation: 'Its index hook maps i to position i-1, so requesting index 1 returns the item at position 0. The index handler should forward i directly to the wrapped list.' },
    ],
  },

];

export default problems;

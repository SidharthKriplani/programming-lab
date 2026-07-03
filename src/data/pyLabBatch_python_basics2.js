// pyLabBatch_python_basics2 — vanilla-Python problem-solving breadth, round 2B (D-PL-29). More
// string ops, dict/list transforms, and number/logic tasks. Easy->medium; warmups single-method,
// core carries one honest trap. All executed in CPython before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_pb2_vowels': { args: ['s'], setup: 's = "programming"', preview: 's → "prgrmmng" (vowels removed).' },
  'fx_pb2_caesar': { args: ['s', 'k'], setup: 's = "xyz"\nk = 2', preview: 's="xyz", shift 2 → "zab" (wraps past z back to a).' },
  'fx_pb2_countchar': { args: ['s', 'ch'], setup: 's = "banana"\nch = "a"', preview: '"a" appears 3 times in "banana".' },
  'fx_pb2_longword': { args: ['s'], setup: 's = "a bb cccc dd"', preview: 'longest word is "cccc"; "dd" sorts last alphabetically.' },
  'fx_pb2_anagram': { args: ['a', 'b'], setup: 'a = "aabb"\nb = "abbb"', preview: 'same letters {a,b} but different COUNTS → not anagrams.' },
  'fx_pb2_dmax': { args: ['d'], setup: 'd = {"a": 5, "b": 1, "z": 2}', preview: 'highest value is 5 → key "a" (the max KEY would be "z").' },
  'fx_pb2_dsort': { args: ['d'], setup: 'd = {"a": 3, "b": 1, "c": 2}', preview: 'keys sorted by VALUE desc → [a, c, b].' },
  'fx_pb2_chunk': { args: ['xs', 'k'], setup: 'xs = [1, 2, 3, 4, 5]\nk = 2', preview: 'chunks of 2 → [[1,2],[3,4],[5]].' },
  'fx_pb2_rotate': { args: ['xs', 'k'], setup: 'xs = [1, 2, 3, 4, 5]\nk = 2', preview: 'rotate RIGHT by 2 → [4,5,1,2,3].' },
  'fx_pb2_transpose': { args: ['m'], setup: 'm = [[1, 2, 3], [4, 5, 6]]', preview: '2x3 matrix → 3x2 transpose [[1,4],[2,5],[3,6]].' },
  'fx_pb2_primes': { args: ['n'], setup: 'n = 10', preview: 'primes up to 10 → [2,3,5,7] (1 is NOT prime).' },
  'fx_pb2_fib': { args: ['n'], setup: 'n = 6', preview: 'first 6 Fibonacci numbers → [0,1,1,2,3,5].' },
  'fx_pb2_bits': { args: ['n'], setup: 'n = 13', preview: '13 is 1101 in binary → 3 set bits.' },
  'fx_pb2_mode': { args: ['nums'], setup: 'nums = [1, 1, 2]', preview: 'most frequent value is 1 (the max value would be 2).' },
  'fx_pb2_clamp': { args: ['xs', 'lo', 'hi'], setup: 'xs = [-5, 50, 150]\nlo = 0\nhi = 100', preview: 'clamp each to [0,100] → [0,50,100]; all kept.' },
};

const W = (o) => ({ topic: 'idioms', difficulty: 'warmup', dial: { axes: [], rules: [] }, mcqs: [], compare: { kind: 'value' }, ...o });
const CO = (o) => ({ topic: 'idioms', difficulty: 'core', dial: { axes: [], rules: [] }, ...o });

export const problems = [

  W({ id: 'bp-remove-vowels', title: 'Remove the vowels', tags: ['string', 'comprehension', 'fluency'], estimatedMin: 3, fixtureId: 'fx_pb2_vowels',
    prompt: 'Return the string with all vowels (a, e, i, o, u) removed.', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # drop the vowels\n    ...',
    hints: ['Keep only the characters that are NOT vowels.', 'Join a generator that filters c not in "aeiou".'],
    solution: 'def solve(s):\n    return "".join(c for c in s if c not in "aeiou")',
    debrief: '"programming" without vowels → "prgrmmng". The generator keeps consonants and join rebuilds the string.',
    canonicalMethodId: 'filter', methods: [{ id: 'filter', name: 'join non-vowels', code: 'return "".join(c for c in s if c not in "aeiou")', tradeoff: 'Filter then join.', breaksWhen: 'Uppercase vowels would need folding; input is lower.', isTrap: false }] }),

  W({ id: 'bp-count-char', title: 'Count a character', tags: ['string', 'count', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pb2_countchar',
    prompt: 'Return how many times the character ch appears in the string s.', signature: 'solve(s, ch)',
    starterCode: 'def solve(s, ch):\n    # occurrences of ch in s\n    ...',
    hints: ['Strings have a built-in method for this.', 's.count(ch) returns the number of occurrences.'],
    solution: 'def solve(s, ch):\n    return s.count(ch)',
    debrief: '"banana" has 3 "a"s. str.count does the tally.',
    canonicalMethodId: 'count', methods: [{ id: 'count', name: 's.count(ch)', code: 'return s.count(ch)', tradeoff: 'The built-in count.', breaksWhen: 'Nothing here.', isTrap: false }] }),

  W({ id: 'bp-fib-list', title: 'First n Fibonacci numbers', tags: ['number', 'loop', 'fluency'], estimatedMin: 4, fixtureId: 'fx_pb2_fib',
    prompt: 'Return a list of the first n Fibonacci numbers, starting 0, 1, 1, 2, 3, ...', signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # first n Fibonacci numbers\n    ...',
    hints: ['Keep two running values and append as you go.', 'Update a, b = b, a + b each step.'],
    solution: 'def solve(n):\n    out = []\n    a, b = 0, 1\n    for _ in range(n):\n        out.append(a)\n        a, b = b, a + b\n    return out',
    debrief: 'n=6 → [0, 1, 1, 2, 3, 5]. Track the pair (a, b) and roll it forward each step.',
    canonicalMethodId: 'iter', methods: [{ id: 'iter', name: 'iterative pair', code: 'out = []\na, b = 0, 1\nfor _ in range(n):\n    out.append(a)\n    a, b = b, a + b\nreturn out', tradeoff: 'O(n) with two variables.', breaksWhen: 'n=0 returns an empty list.', isTrap: false }] }),

  CO({ id: 'bp-caesar-shift', title: 'Caesar shift with wraparound', tags: ['string', 'ord', 'modulo'], estimatedMin: 5, fixtureId: 'fx_pb2_caesar',
    prompt: 'Shift each lowercase letter forward by k positions in the alphabet, wrapping past "z" back to "a". Return the shifted string.',
    beforeWriting: 'Shifting "z" by 1 should give "a". Does adding k to the character code alone wrap around?',
    signature: 'solve(s, k)', starterCode: 'def solve(s, k):\n    # shift letters by k, wrapping z -> a\n    ...',
    hints: ['Work in 0..25: (ord(c) - 97 + k) % 26, then back to a letter.', 'Adding k to ord(c) without % 26 walks past "z" into non-letters.'],
    solution: 'def solve(s, k):\n    return "".join(chr((ord(c) - 97 + k) % 26 + 97) for c in s)', compare: { kind: 'value' },
    debrief: '"xyz" shifted by 2 → "zab" (y→a, z→b wrap).\n\n**Wrong answer that runs:** chr(ord(c) + k) without the % 26 pushes "y" and "z" past "z" into characters like "{" and "|". It runs and returns a string; it just never wrapped around the alphabet.\n\n**Sanity check:** every output character must still be a lowercase letter. If you see punctuation, you skipped the modulo.',
    canonicalMethodId: 'wrap', methods: [
      { id: 'wrap', name: 'mod 26 shift', code: 'return "".join(chr((ord(c) - 97 + k) % 26 + 97) for c in s)', detectionSignature: { mustMatch: ['% 26'], mustNotMatch: [], note: 'wrap in 0..25' }, tradeoff: 'Shift within 0..25 and wrap.', breaksWhen: 'Non-lowercase input would need handling.', isTrap: false },
      { id: 'no_wrap', name: 'ord + k', code: 'return "".join(chr(ord(c) + k) for c in s)', detectionSignature: { mustMatch: ['ord(c) + k'], mustNotMatch: ['% 26'], note: 'runs off the end' }, tradeoff: 'Shorter.', breaksWhen: 'Near the end of the alphabet — without % 26 the shift produces non-letter characters.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is % 26 needed?', options: ['wrap', 'no_wrap'], answerId: 'wrap', explanation: 'The alphabet is 26 letters; % 26 wraps a shift past "z" back to "a". Adding k to the raw code walks into non-letter characters.' }] }),

  CO({ id: 'bp-longest-word', title: 'Longest word', tags: ['string', 'max', 'key'], estimatedMin: 4, fixtureId: 'fx_pb2_longword',
    prompt: 'Return the longest word in the sentence (the one with the most characters).',
    beforeWriting: 'max() on strings compares them alphabetically. Is that the same as comparing by length?',
    signature: 'solve(s)', starterCode: 'def solve(s):\n    # the word with the most characters\n    ...',
    hints: ['max() takes a key= to decide what to compare by.', 'Without key=len, max compares the words alphabetically.'],
    solution: 'def solve(s):\n    return max(s.split(), key=len)', compare: { kind: 'value' },
    debrief: '"cccc" is the longest word.\n\n**Wrong answer that runs:** max(s.split()) with no key compares the words ALPHABETICALLY, so it returns "dd" (the last alphabetically), not the longest. It runs and returns a word; it just ranked by spelling instead of length.\n\n**Sanity check:** the answer should be the word with the most letters. If a short word that sorts late wins, you omitted key=len.',
    canonicalMethodId: 'by_len', methods: [
      { id: 'by_len', name: 'max(..., key=len)', code: 'return max(s.split(), key=len)', detectionSignature: { mustMatch: ['key=len'], mustNotMatch: [], note: 'compare by length' }, tradeoff: 'key=len ranks by character count.', breaksWhen: 'Ties return the first longest.', isTrap: false },
      { id: 'lexical', name: 'max(s.split())', code: 'return max(s.split())', detectionSignature: { mustMatch: ['max(s.split())'], mustNotMatch: ['key=len'], note: 'alphabetical' }, tradeoff: 'Shorter.', breaksWhen: 'Always for "longest" — without key it compares alphabetically, not by length.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does max(s.split()) return "dd"?', options: ['by_len', 'lexical'], answerId: 'by_len', explanation: 'max without a key compares strings alphabetically, so "dd" (latest) wins. key=len makes it compare by length, returning "cccc".' }] }),

  CO({ id: 'bp-is-anagram', title: 'Anagram check', tags: ['string', 'sorted', 'counts'], estimatedMin: 5, fixtureId: 'fx_pb2_anagram',
    prompt: 'Return True if a and b are anagrams (the same letters with the same counts, just reordered), else False.',
    beforeWriting: 'Two strings can use the same set of letters but different amounts. Does comparing sets catch that?',
    signature: 'solve(a, b)', starterCode: 'def solve(a, b):\n    # True if a and b are anagrams\n    ...',
    hints: ['Anagrams have identical letters AND identical counts.', 'Comparing sets ignores how many times each letter appears.'],
    solution: 'def solve(a, b):\n    return sorted(a) == sorted(b)', compare: { kind: 'value' },
    debrief: '"aabb" and "abbb" use letters {a, b} but different counts, so they are NOT anagrams → False.\n\n**Wrong answer that runs:** set(a) == set(b) only checks that the same letters APPEAR, ignoring counts, so it wrongly returns True. It runs and returns a bool; it just tested the letter set, not the multiset.\n\n**Sanity check:** anagrams need matching counts. sorted(a) == sorted(b) (or Counter(a) == Counter(b)) captures counts; a set does not.',
    canonicalMethodId: 'sorted', methods: [
      { id: 'sorted', name: 'sorted(a)==sorted(b)', code: 'return sorted(a) == sorted(b)', detectionSignature: { mustMatch: ['sorted(a)'], mustNotMatch: [], note: 'compares counts' }, tradeoff: 'Sorting compares letters and their counts.', breaksWhen: 'Whitespace/case would need normalising.', isTrap: false },
      { id: 'set_eq', name: 'set(a)==set(b)', code: 'return set(a) == set(b)', detectionSignature: { mustMatch: ['set(a)'], mustNotMatch: ['sorted'], note: 'ignores counts' }, tradeoff: 'Feels close.', breaksWhen: 'When counts differ — a set says True for "aabb"/"abbb" though they are not anagrams.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is set comparison wrong for anagrams?', options: ['sorted', 'set_eq'], answerId: 'sorted', explanation: 'A set records which letters appear, not how many. "aabb" and "abbb" share the set {a,b} but differ in counts. Sorting (or Counter) compares the actual multiset.' }] }),

  CO({ id: 'bp-dict-max-key', title: 'Key with the largest value', tags: ['dict', 'max', 'key'], estimatedMin: 4, fixtureId: 'fx_pb2_dmax',
    prompt: 'Return the KEY whose value is the largest.',
    beforeWriting: 'max(d) picks by the keys. You want the key with the largest VALUE — which needs a key= function.',
    signature: 'solve(d)', starterCode: 'def solve(d):\n    # the key with the highest value\n    ...',
    hints: ['max(d, key=d.get) compares keys by their value.', 'Plain max(d) compares the keys themselves.'],
    solution: 'def solve(d):\n    return max(d, key=d.get)', compare: { kind: 'value' },
    debrief: 'The largest value (5) belongs to key "a".\n\n**Wrong answer that runs:** max(d) compares the KEYS, so it returns "z" (the largest key), not the key with the biggest value. It runs and returns a key; it just ranked keys instead of values.\n\n**Sanity check:** the returned key\'s value should be the maximum value in the dict. If it is not, you compared keys — add key=d.get.',
    canonicalMethodId: 'by_value', methods: [
      { id: 'by_value', name: 'max(d, key=d.get)', code: 'return max(d, key=d.get)', detectionSignature: { mustMatch: ['key=d.get'], mustNotMatch: [], note: 'rank by value' }, tradeoff: 'key=d.get compares by the mapped value.', breaksWhen: 'Ties return the first max.', isTrap: false },
      { id: 'by_key', name: 'max(d)', code: 'return max(d)', detectionSignature: { mustMatch: ['max(d)'], mustNotMatch: ['key='], note: 'ranks keys' }, tradeoff: 'Shorter.', breaksWhen: 'Always for "largest value" — max(d) iterates keys and compares them, not their values.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does max(d) return "z"?', options: ['by_value', 'by_key'], answerId: 'by_value', explanation: 'Iterating a dict yields its keys, so max(d) returns the largest key ("z"). key=d.get makes max compare by the value each key maps to.' }] }),

  CO({ id: 'bp-sort-dict-by-value', title: 'Keys sorted by value', tags: ['dict', 'sorted', 'key'], estimatedMin: 5, fixtureId: 'fx_pb2_dsort',
    prompt: 'Return the dict\'s keys as a list, sorted from the highest value to the lowest.',
    beforeWriting: 'sorted(d) orders the keys themselves. You want them ordered by their VALUES.',
    signature: 'solve(d)', starterCode: 'def solve(d):\n    # keys sorted by value, descending\n    ...',
    hints: ['sorted(d, key=d.get, reverse=True) orders keys by their value.', 'Without key=, you sort the keys alphabetically.'],
    solution: 'def solve(d):\n    return sorted(d, key=d.get, reverse=True)', compare: { kind: 'seq' },
    debrief: 'Values 3 > 2 > 1 → keys [a, c, b].\n\n**Wrong answer that runs:** sorted(d, reverse=True) sorts the KEYS alphabetically (c, b, a), not by their values. It runs and returns the keys; the order just reflects spelling, not value.\n\n**Sanity check:** reading the values in your output order should be monotonic (descending here). If they are not, you sorted the keys instead of by value.',
    canonicalMethodId: 'by_value', methods: [
      { id: 'by_value', name: 'sorted(d, key=d.get)', code: 'return sorted(d, key=d.get, reverse=True)', detectionSignature: { mustMatch: ['key=d.get'], mustNotMatch: [], note: 'order by value' }, tradeoff: 'key=d.get orders keys by value.', breaksWhen: 'Ties fall back to a stable order.', isTrap: false },
      { id: 'by_key', name: 'sorted(d, reverse=True)', code: 'return sorted(d, reverse=True)', detectionSignature: { mustMatch: ['sorted(d, reverse=True)'], mustNotMatch: ['key='], note: 'sorts keys' }, tradeoff: 'Shorter.', breaksWhen: 'When you need value order — this sorts the keys alphabetically.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'What does sorted(d, reverse=True) sort by?', options: ['by_value', 'by_key'], answerId: 'by_value', explanation: 'sorted(d) iterates keys, so it sorts the keys themselves. key=d.get makes it order the keys by the value each maps to.' }] }),

  CO({ id: 'bp-chunk-list', title: 'Chunk a list', tags: ['list', 'slice', 'step'], estimatedMin: 5, fixtureId: 'fx_pb2_chunk',
    prompt: 'Split the list into consecutive chunks of size k (the last chunk may be shorter). Return a list of the chunks.',
    beforeWriting: 'Chunks are non-overlapping. What step between chunk starts avoids overlap?',
    signature: 'solve(xs, k)', starterCode: 'def solve(xs, k):\n    # consecutive chunks of size k\n    ...',
    hints: ['Slice xs[i:i+k] as i steps by k.', 'Stepping by 1 instead of k produces overlapping chunks.'],
    solution: 'def solve(xs, k):\n    return [xs[i:i + k] for i in range(0, len(xs), k)]', compare: { kind: 'seq' },
    debrief: '[1,2,3,4,5] in chunks of 2 → [[1,2],[3,4],[5]].\n\n**Wrong answer that runs:** stepping i by 1 (range(0, len(xs))) makes the slices OVERLAP — [[1,2],[2,3],[3,4],...] — and produces far too many chunks. It runs and returns lists; the stride is just wrong.\n\n**Sanity check:** the chunks should partition the list (each element appears once). If elements repeat across chunks, your step was 1, not k.',
    canonicalMethodId: 'step_k', methods: [
      { id: 'step_k', name: 'step by k', code: 'return [xs[i:i + k] for i in range(0, len(xs), k)]', detectionSignature: { mustMatch: ['len(xs), k'], mustNotMatch: [], note: 'non-overlapping' }, tradeoff: 'Advance by k so chunks do not overlap.', breaksWhen: 'k must be positive.', isTrap: false },
      { id: 'step_1', name: 'step by 1', code: 'return [xs[i:i + k] for i in range(0, len(xs))]', detectionSignature: { mustMatch: ['range(0, len(xs))'], mustNotMatch: ['len(xs), k'], note: 'overlapping windows' }, tradeoff: 'Looks similar.', breaksWhen: 'Stepping by 1 yields overlapping windows, not a partition into chunks.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why must i step by k?', options: ['step_k', 'step_1'], answerId: 'step_k', explanation: 'Non-overlapping chunks start k apart. Stepping by 1 slides a window one element at a time, overlapping and over-producing chunks.' }] }),

  CO({ id: 'bp-rotate-list', title: 'Rotate a list right', tags: ['list', 'slice', 'rotate'], estimatedMin: 4, fixtureId: 'fx_pb2_rotate',
    prompt: 'Rotate the list to the RIGHT by k positions (the last k elements move to the front). Return the rotated list.',
    beforeWriting: 'Right rotation brings the TAIL to the front. Which slice is the tail?',
    signature: 'solve(xs, k)', starterCode: 'def solve(xs, k):\n    # rotate right by k\n    ...',
    hints: ['The last k elements go first, then the rest.', 'xs[-k:] + xs[:-k] rotates right; xs[k:] + xs[:k] rotates LEFT.'],
    solution: 'def solve(xs, k):\n    return xs[-k:] + xs[:-k]', compare: { kind: 'seq' },
    debrief: 'Right by 2 → [4,5,1,2,3] (the tail [4,5] moves to the front).\n\n**Wrong answer that runs:** xs[k:] + xs[:k] rotates to the LEFT → [3,4,5,1,2], the opposite direction. It runs and returns a rotated list; it just rotated the wrong way.\n\n**Sanity check:** after a right rotation, the original last element should be near the front. If the original front elements moved to the end, you rotated left.',
    canonicalMethodId: 'right', methods: [
      { id: 'right', name: 'xs[-k:] + xs[:-k]', code: 'return xs[-k:] + xs[:-k]', detectionSignature: { mustMatch: ['xs[-k:]'], mustNotMatch: [], note: 'tail to front' }, tradeoff: 'Tail then head = right rotation.', breaksWhen: 'k should be reduced mod len for k >= len.', isTrap: false },
      { id: 'left', name: 'xs[k:] + xs[:k]', code: 'return xs[k:] + xs[:k]', detectionSignature: { mustMatch: ['xs[k:] + xs[:k]'], mustNotMatch: ['xs[-k:]'], note: 'left rotation' }, tradeoff: 'Also a rotation.', breaksWhen: 'It rotates LEFT — the opposite of what was asked.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Which slice rotates right?', options: ['right', 'left'], answerId: 'right', explanation: 'Right rotation moves the last k elements to the front: xs[-k:] + xs[:-k]. xs[k:] + xs[:k] moves the first k to the back (left rotation).' }] }),

  CO({ id: 'bp-transpose', title: 'Transpose a matrix', tags: ['list', 'zip', 'matrix'], estimatedMin: 5, fixtureId: 'fx_pb2_transpose',
    prompt: 'Transpose the matrix (list of rows): the result\'s row i is the original\'s column i. Return a list of lists.',
    beforeWriting: 'Transposing turns columns into rows. Does returning the rows unchanged do anything?',
    signature: 'solve(m)', starterCode: 'def solve(m):\n    # rows become columns\n    ...',
    hints: ['zip(*m) pairs up the i-th element of every row — i.e. the columns.', 'Wrap each zipped tuple in list().'],
    solution: 'def solve(m):\n    return [list(r) for r in zip(*m)]', compare: { kind: 'seq' },
    debrief: '[[1,2,3],[4,5,6]] transposed → [[1,4],[2,5],[3,6]].\n\n**Wrong answer that runs:** returning the rows as-is (just copying m) leaves a 2x3 matrix instead of the 3x2 transpose. It runs and returns lists; it just never swapped rows and columns.\n\n**Sanity check:** the output shape should be the input shape flipped (rows↔columns). If the dimensions are unchanged, you did not transpose — use zip(*m).',
    canonicalMethodId: 'zip_star', methods: [
      { id: 'zip_star', name: 'zip(*m)', code: 'return [list(r) for r in zip(*m)]', detectionSignature: { mustMatch: ['zip(*m)'], mustNotMatch: [], note: 'columns become rows' }, tradeoff: 'zip(*m) yields the columns as tuples.', breaksWhen: 'Ragged rows get truncated to the shortest.', isTrap: false },
      { id: 'as_is', name: 'return the rows', code: 'return [list(r) for r in m]', detectionSignature: { mustMatch: ['for r in m'], mustNotMatch: ['zip('], note: 'no transpose' }, tradeoff: 'Trivially runs.', breaksWhen: 'Always — it copies the matrix without swapping rows and columns.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'What does zip(*m) produce?', options: ['zip_star', 'as_is'], answerId: 'zip_star', explanation: 'zip(*m) takes one element from each row at each position, i.e. the columns, turning them into the transposed rows.' }] }),

  CO({ id: 'bp-primes-upto', title: 'Primes up to n', tags: ['number', 'primes', 'edge-case'], estimatedMin: 6, fixtureId: 'fx_pb2_primes',
    prompt: 'Return the list of prime numbers from 2 up to and including n, in order.',
    beforeWriting: 'Is 1 prime? Where your loop starts, and whether you include 1, decides correctness.',
    signature: 'solve(n)', starterCode: 'def solve(n):\n    # primes in [2, n]\n    ...',
    hints: ['A prime has no divisor between 2 and its square root.', 'Start the candidates at 2 — 1 is not prime.'],
    solution: 'def solve(n):\n    return [x for x in range(2, n + 1) if all(x % i for i in range(2, int(x ** 0.5) + 1))]', compare: { kind: 'seq' },
    debrief: 'Primes up to 10 → [2, 3, 5, 7].\n\n**Wrong answer that runs:** starting the candidates at 1 (and checking divisors only up to x) counts 1 as prime, because it has no divisor in an empty range — giving [1, 2, 3, 5, 7]. It runs and returns primes; it just wrongly includes 1.\n\n**Sanity check:** 1 must never appear. If it does, your candidate range started at 1 instead of 2.',
    canonicalMethodId: 'from_2', methods: [
      { id: 'from_2', name: 'candidates from 2', code: 'return [x for x in range(2, n + 1) if all(x % i for i in range(2, int(x ** 0.5) + 1))]', detectionSignature: { mustMatch: ['range(2, n + 1)'], mustNotMatch: [], note: 'excludes 1' }, tradeoff: 'Start at 2; check divisors to sqrt.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'from_1', name: 'candidates from 1', code: 'return [x for x in range(1, n + 1) if all(x % i for i in range(2, x))]', detectionSignature: { mustMatch: ['range(1, n + 1)'], mustNotMatch: [], note: 'includes 1' }, tradeoff: 'Looks complete.', breaksWhen: 'It includes 1 — with no divisor in range(2,1), the all() is vacuously True, so 1 is wrongly called prime.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the second version include 1?', options: ['from_2', 'from_1'], answerId: 'from_2', explanation: 'For x=1, range(2, 1) is empty and all([]) is True, so 1 passes the primality test. Primes start at 2 — begin the candidate range there.' }] }),

  CO({ id: 'bp-count-set-bits', title: 'Count the set bits', tags: ['number', 'binary', 'bits'], estimatedMin: 4, fixtureId: 'fx_pb2_bits',
    prompt: 'Return how many 1-bits are in the binary representation of the non-negative integer n.',
    beforeWriting: 'Set bits are 1s in BINARY. Counting "1" in the decimal string is a different thing — which do you want?',
    signature: 'solve(n)', starterCode: 'def solve(n):\n    # number of 1-bits in binary\n    ...',
    hints: ['bin(n) gives the binary string (like "0b1101").', 'Count the "1" characters in that binary string, not the decimal one.'],
    solution: 'def solve(n):\n    return bin(n).count("1")', compare: { kind: 'value' },
    debrief: '13 is 1101 in binary → 3 set bits.\n\n**Wrong answer that runs:** str(n).count("1") counts the digit "1" in the DECIMAL representation ("13" → 1), which has nothing to do with binary. It runs and returns a count; it just counted the wrong base.\n\n**Sanity check:** the count comes from the binary form. If the number has no "1" digit in decimal you would get 0, which is clearly not the bit count — use bin(n).',
    canonicalMethodId: 'binary', methods: [
      { id: 'binary', name: 'bin(n).count("1")', code: 'return bin(n).count("1")', detectionSignature: { mustMatch: ['bin(n)'], mustNotMatch: [], note: 'binary string' }, tradeoff: 'Count 1s in the binary form.', breaksWhen: 'bin() prefixes 0b, which has no extra 1s.', isTrap: false },
      { id: 'decimal', name: 'str(n).count("1")', code: 'return str(n).count("1")', detectionSignature: { mustMatch: ['str(n)'], mustNotMatch: ['bin('], note: 'decimal digits' }, tradeoff: 'Looks similar.', breaksWhen: 'Always — it counts "1" digits in base 10, not bits in base 2.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is str(n).count("1") wrong?', options: ['binary', 'decimal'], answerId: 'binary', explanation: 'Set bits are the 1s in binary. str(n) is the decimal form, so counting "1" there ("13"→1) is unrelated. Use bin(n).count("1").' }] }),

  CO({ id: 'bp-mode', title: 'Most frequent value', tags: ['list', 'counter', 'mode'], estimatedMin: 4, fixtureId: 'fx_pb2_mode',
    prompt: 'Return the value that appears most often in the list (the mode).',
    beforeWriting: 'The mode is about frequency, not magnitude. Does max() of the values give the most FREQUENT one?',
    signature: 'solve(nums)', starterCode: 'def solve(nums):\n    # the most frequent value\n    ...',
    hints: ['Count each value, then take the one with the highest count.', 'Counter(nums).most_common(1) gives the mode.'],
    solution: 'def solve(nums):\n    from collections import Counter\n    return Counter(nums).most_common(1)[0][0]', compare: { kind: 'value' },
    debrief: '1 appears twice, 2 once → the mode is 1.\n\n**Wrong answer that runs:** max(nums) returns the largest VALUE (2), which has nothing to do with how often it occurs. It runs and returns a number; it just measured magnitude, not frequency.\n\n**Sanity check:** the answer should be the value with the highest count, which can be a small number. If you returned the largest value, you used max() instead of counting.',
    canonicalMethodId: 'most_common', methods: [
      { id: 'most_common', name: 'Counter.most_common', code: 'from collections import Counter\nreturn Counter(nums).most_common(1)[0][0]', detectionSignature: { mustMatch: ['most_common'], mustNotMatch: [], note: 'by frequency' }, tradeoff: 'Count, then take the most frequent.', breaksWhen: 'Ties fall back to first-seen order.', isTrap: false },
      { id: 'max_value', name: 'max(nums)', code: 'return max(nums)', detectionSignature: { mustMatch: ['max(nums)'], mustNotMatch: ['Counter'], note: 'largest value' }, tradeoff: 'Shorter.', breaksWhen: 'Always for a mode — max returns the largest value, not the most frequent one.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is max(nums) not the mode?', options: ['most_common', 'max_value'], answerId: 'most_common', explanation: 'The mode is the most frequent value; max is the largest. Here 1 occurs most often but 2 is larger. Count occurrences to find the mode.' }] }),

  CO({ id: 'bp-clamp-list', title: 'Clamp each value', tags: ['list', 'clamp', 'comprehension'], estimatedMin: 4, fixtureId: 'fx_pb2_clamp',
    prompt: 'Clamp each value to the range [lo, hi]: below lo becomes lo, above hi becomes hi, others unchanged. Keep every element. Return the list.',
    beforeWriting: 'Clamping keeps every element but limits its value; filtering removes out-of-range ones. Which does the prompt want?',
    signature: 'solve(xs, lo, hi)', starterCode: 'def solve(xs, lo, hi):\n    # cap each value into [lo, hi], keep all\n    ...',
    hints: ['max(lo, min(x, hi)) clamps a single value.', 'A filter comprehension would DROP out-of-range values instead of capping them.'],
    solution: 'def solve(xs, lo, hi):\n    return [max(lo, min(x, hi)) for x in xs]', compare: { kind: 'seq' },
    debrief: '[-5, 50, 150] clamped to [0,100] → [0, 50, 100]; all three stay.\n\n**Wrong answer that runs:** [x for x in xs if lo <= x <= hi] FILTERS, dropping -5 and 150 and returning just [50]. It runs and returns a list; it removed the out-of-range values instead of capping them.\n\n**Sanity check:** the output length must equal the input length. If elements disappeared, you filtered instead of clamping.',
    canonicalMethodId: 'clamp', methods: [
      { id: 'clamp', name: 'max(lo, min(x, hi))', code: 'return [max(lo, min(x, hi)) for x in xs]', detectionSignature: { mustMatch: ['min(x, hi)'], mustNotMatch: [], note: 'cap, keep all' }, tradeoff: 'Cap each element; keep them all.', breaksWhen: 'Assumes lo <= hi.', isTrap: false },
      { id: 'filter', name: 'filter comprehension', code: 'return [x for x in xs if lo <= x <= hi]', detectionSignature: { mustMatch: ['if lo <= x <= hi'], mustNotMatch: ['min(x'], note: 'drops out-of-range' }, tradeoff: 'Also mentions the range.', breaksWhen: 'When elements must be kept — it removes out-of-range values instead of capping them.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the filter version lose elements?', options: ['clamp', 'filter'], answerId: 'clamp', explanation: 'Clamping changes out-of-range values to the bounds but keeps every element. A filter removes them, shortening the list.' }] }),

];

export default problems;

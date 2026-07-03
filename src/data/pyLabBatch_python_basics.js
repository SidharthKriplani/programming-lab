// pyLabBatch_python_basics — breadth on common vanilla-Python problem-solving (D-PL-29 / Track 2,
// round 2A): string manipulation + dict/list transforms + small parsing/number tasks. The
// "do it without pandas" band, skewed easy->medium. Warmups are single-method fluency reps;
// core problems carry one honest runs-but-wrong trap. All executed in CPython before shipping.
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; \n for newlines;
// escape prose apostrophes as \' ; NO template literals / backticks.

export const fixtures = {
  'fx_pb_wc': { args: ['s'], setup: 's = "the quick brown fox"', preview: 's = "the quick brown fox" → 4 words.' },
  'fx_pb_vow': { args: ['s'], setup: 's = "Programming"', preview: 's = "Programming" → 3 vowels (o, a, i).' },
  'fx_pb_title': { args: ['s'], setup: 's = "the quick brown fox"', preview: 's → "The Quick Brown Fox".' },
  'fx_pb_freq': { args: ['s'], setup: 's = "Hello"', preview: 's = "Hello" → l appears twice (case-folded).' },
  'fx_pb_revwords': { args: ['s'], setup: 's = "the quick fox"', preview: 's → "fox quick the" (word order reversed, not characters).' },
  'fx_pb_countword': { args: ['s', 'word'], setup: 's = "cat catalog cat"\nword = "cat"', preview: '"cat" as a WHOLE word appears twice; as a substring it also hides inside "catalog".' },
  'fx_pb_acronym': { args: ['s'], setup: 's = "portable document format"', preview: 's → "PDF" (first letter of each word, upper).' },
  'fx_pb_grouplen': { args: ['words'], setup: 'words = ["hi", "bye", "yo", "cat"]', preview: 'group words by length → {2: [hi, yo], 3: [bye, cat]}.' },
  'fx_pb_sumcat': { args: ['pairs'], setup: 'pairs = [("a", 10), ("b", 5), ("a", 20)]', preview: 'sum per category → {a: 30, b: 5} (a appears twice).' },
  'fx_pb_flatuniq': { args: ['nested'], setup: 'nested = [[3, 1], [2, 3], [1]]', preview: 'flatten + dedup + sort → [1, 2, 3] (3 and 1 repeat).' },
  'fx_pb_common': { args: ['a', 'b'], setup: 'a = [1, 2, 2, 3]\nb = [2, 3, 4]', preview: 'shared values, deduped and sorted → [2, 3].' },
  'fx_pb_kv': { args: ['lines'], setup: 'lines = ["a=1", "b=2", "c=3"]', preview: 'parse "k=v" lines → {a: 1, b: 2, c: 3} with INT values.' },
  'fx_pb_fizz': { args: ['n'], setup: 'n = 15', preview: 'n=15 → the classic FizzBuzz list; index 15 must be "FizzBuzz".' },
  'fx_pb_digit': { args: ['n'], setup: 'n = 1234', preview: 'n=1234 → digit sum 1+2+3+4 = 10.' },
  'fx_pb_run': { args: ['s'], setup: 's = "aabbaa"', preview: 's = "aabbaa" → longest CONSECUTIVE run is 2 (a total is 4).' },
};

const W = (o) => ({ topic: 'idioms', difficulty: 'warmup', dial: { axes: [], rules: [] }, mcqs: [], compare: { kind: 'value' }, ...o });
const CORE = (o) => ({ topic: 'idioms', difficulty: 'core', dial: { axes: [], rules: [] }, ...o });

export const problems = [

  W({ id: 'bp-word-count', title: 'Count the words', tags: ['string', 'split', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pb_wc',
    prompt: 'Return the number of words in the sentence (words are separated by spaces).', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # number of words\n    ...',
    hints: ['split() breaks a string into a list of words.', 'len() of that list is the word count.'],
    solution: 'def solve(s):\n    return len(s.split())',
    debrief: 'Four words → 4. s.split() splits on whitespace; len() counts the pieces.',
    canonicalMethodId: 'split', methods: [{ id: 'split', name: 'len(s.split())', code: 'return len(s.split())', tradeoff: 'split then count.', breaksWhen: 'Multiple spaces are handled by the default split.', isTrap: false }] }),

  W({ id: 'bp-count-vowels', title: 'Count the vowels', tags: ['string', 'count', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pb_vow',
    prompt: 'Return how many vowels (a, e, i, o, u) are in the string, counting upper and lower case.', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # count the vowels\n    ...',
    hints: ['Lowercase the string so case does not matter.', 'Count characters that are in "aeiou".'],
    solution: 'def solve(s):\n    return sum(1 for c in s.lower() if c in "aeiou")',
    debrief: '"Programming" has o, a, i → 3. Lowercasing first handles any capitals.',
    canonicalMethodId: 'count', methods: [{ id: 'count', name: 'sum over vowels', code: 'return sum(1 for c in s.lower() if c in "aeiou")', tradeoff: 'One pass, case-folded.', breaksWhen: 'Nothing here.', isTrap: false }] }),

  W({ id: 'bp-title-case', title: 'Title-case a sentence', tags: ['string', 'case', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pb_title',
    prompt: 'Return the sentence with the first letter of each word capitalised.', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # capitalise each word\n    ...',
    hints: ['There is a string method for exactly this.', 'str.title() capitalises the first letter of each word.'],
    solution: 'def solve(s):\n    return s.title()',
    debrief: '"the quick brown fox" → "The Quick Brown Fox". str.title() capitalises each word\'s first letter.',
    canonicalMethodId: 'title', methods: [{ id: 'title', name: 's.title()', code: 'return s.title()', tradeoff: 'The built-in.', breaksWhen: 'Apostrophes split words oddly; fine here.', isTrap: false }] }),

  W({ id: 'bp-digit-sum', title: 'Sum of the digits', tags: ['number', 'string', 'fluency'], estimatedMin: 2, fixtureId: 'fx_pb_digit',
    prompt: 'Return the sum of the digits of the non-negative integer n.', signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # add up the digits\n    ...',
    hints: ['Turn the number into its string of digits.', 'Sum int(d) over each character.'],
    solution: 'def solve(n):\n    return sum(int(d) for d in str(n))',
    debrief: '1+2+3+4 = 10. Iterating str(n) gives each digit as a character to convert and add.',
    canonicalMethodId: 'digits', methods: [{ id: 'digits', name: 'sum of str digits', code: 'return sum(int(d) for d in str(n))', tradeoff: 'String-then-sum is the simplest.', breaksWhen: 'Negative n would include the minus sign.', isTrap: false }] }),

  CORE({ id: 'bp-char-frequency', title: 'Character frequency', tags: ['string', 'counter', 'dict'], estimatedMin: 4, fixtureId: 'fx_pb_freq',
    prompt: 'Return a dict mapping each letter to how many times it appears, treating upper and lower case as the same letter.',
    beforeWriting: '"H" and "h" should count as one letter. Do you normalise case before counting?', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # letter -> count, case-insensitive\n    ...',
    hints: ['Counter tallies characters in one pass.', 'Lowercase the string first so "H" and "h" merge.'],
    solution: 'def solve(s):\n    from collections import Counter\n    return dict(Counter(s.lower()))', compare: { kind: 'value' },
    debrief: '"Hello" folded to lower is h,e,l,l,o → l twice.\n\n**Wrong answer that runs:** counting without lowercasing keeps "H" and any "h" as separate keys, splitting a letter\'s count across two entries. It runs and returns a dict; it just treats case as identity when the prompt said not to.\n\n**Sanity check:** the same letter in different cases should share one key. If you see both "H" and "h", you skipped the case fold.',
    canonicalMethodId: 'lower', methods: [
      { id: 'lower', name: 'Counter(s.lower())', code: 'from collections import Counter\nreturn dict(Counter(s.lower()))', detectionSignature: { mustMatch: ['lower()'], mustNotMatch: [], note: 'case-fold first' }, tradeoff: 'Fold case, then tally.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'raw_case', name: 'Counter(s)', code: 'from collections import Counter\nreturn dict(Counter(s))', detectionSignature: { mustMatch: ['Counter(s)'], mustNotMatch: ['lower'], note: 'case-sensitive keys' }, tradeoff: 'Simpler.', breaksWhen: 'When case should not matter — "H" and "h" become separate keys.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why lowercase before counting?', options: ['lower', 'raw_case'], answerId: 'lower', explanation: 'Counting the raw string keeps different cases as distinct keys, splitting a letter\'s total. Lowercasing merges "H" and "h" into one count.' }] }),

  CORE({ id: 'bp-reverse-words', title: 'Reverse the word order', tags: ['string', 'split', 'reverse'], estimatedMin: 4, fixtureId: 'fx_pb_revwords',
    prompt: 'Return the sentence with its WORDS in reverse order (not the characters).',
    beforeWriting: 'Reversing words is not reversing the string. Which one keeps each word readable?', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # reverse the order of the words\n    ...',
    hints: ['Split into words, reverse the list, join back with spaces.', 's[::-1] reverses characters, which is a different thing.'],
    solution: 'def solve(s):\n    return " ".join(s.split()[::-1])', compare: { kind: 'value' },
    debrief: '"the quick fox" → "fox quick the".\n\n**Wrong answer that runs:** s[::-1] reverses the CHARACTERS, giving "xof kciuq eht" — every word is scrambled. It runs and returns a string; it just reversed the wrong unit.\n\n**Sanity check:** each individual word should still be spelled correctly, only their order flipped. If the letters are backwards, you reversed the string instead of the word list.',
    canonicalMethodId: 'words', methods: [
      { id: 'words', name: 'split, reverse, join', code: 'return " ".join(s.split()[::-1])', detectionSignature: { mustMatch: ['split()[::-1]'], mustNotMatch: [], note: 'reverse the word list' }, tradeoff: 'Reverse the list of words, rejoin.', breaksWhen: 'Collapses repeated spaces; fine here.', isTrap: false },
      { id: 'chars', name: 's[::-1]', code: 'return s[::-1]', detectionSignature: { mustMatch: ['s[::-1]'], mustNotMatch: ['split'], note: 'reverses characters' }, tradeoff: 'Shorter.', breaksWhen: 'Always for word-order — it reverses characters, scrambling every word.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is s[::-1] wrong here?', options: ['words', 'chars'], answerId: 'chars', explanation: 's[::-1] reverses the character sequence, so words come out spelled backwards. Reversing word order means splitting into words and reversing that list.' }] }),

  CORE({ id: 'bp-count-word', title: 'Count a whole word', tags: ['string', 'split', 'count'], estimatedMin: 4, fixtureId: 'fx_pb_countword',
    prompt: 'Return how many times the given word appears in the sentence as a WHOLE word (not as part of a longer word).',
    beforeWriting: 's.count(word) also matches the word hidden inside longer words. Does that count whole words only?', signature: 'solve(s, word)',
    starterCode: 'def solve(s, word):\n    # whole-word occurrences of `word`\n    ...',
    hints: ['Split the sentence into words first, then count matches.', 's.count(word) counts substring matches, including inside other words.'],
    solution: 'def solve(s, word):\n    return s.split().count(word)', compare: { kind: 'value' },
    debrief: '"cat" is a whole word twice; the "cat" inside "catalog" does not count → 2.\n\n**Wrong answer that runs:** s.count("cat") counts substring occurrences, so it also matches inside "catalog" and returns 3. It runs and returns a count; it just counted letters-in-a-row, not whole words.\n\n**Sanity check:** a word buried inside a longer word should not add to the count. If it does, you counted substrings — split into words first.',
    canonicalMethodId: 'whole', methods: [
      { id: 'whole', name: 'split().count(word)', code: 'return s.split().count(word)', detectionSignature: { mustMatch: ['split().count'], mustNotMatch: [], note: 'match whole words' }, tradeoff: 'Count exact word tokens.', breaksWhen: 'Punctuation attached to words would need stripping.', isTrap: false },
      { id: 'substring', name: 's.count(word)', code: 'return s.count(word)', detectionSignature: { mustMatch: ['s.count(word)'], mustNotMatch: ['split'], note: 'substring matches' }, tradeoff: 'Shorter.', breaksWhen: 'When the word appears inside longer words — substring count over-counts.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does s.count over-count?', options: ['whole', 'substring'], answerId: 'substring', explanation: 'str.count matches substrings, so "cat" inside "catalog" counts too. Splitting into words and counting tokens matches whole words only.' }] }),

  CORE({ id: 'bp-acronym', title: 'Build an acronym', tags: ['string', 'comprehension', 'fluency'], estimatedMin: 3, fixtureId: 'fx_pb_acronym',
    prompt: 'Return the acronym: the first letter of each word, uppercased and joined together.',
    beforeWriting: 'You want the first letter of each WORD. Does uppercasing the whole sentence do that?', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # first letter of each word, uppercased\n    ...',
    hints: ['Split into words, take w[0] of each, uppercase, join.', 's.upper() gives the whole sentence in caps, not an acronym.'],
    solution: 'def solve(s):\n    return "".join(w[0].upper() for w in s.split())', compare: { kind: 'value' },
    debrief: '"portable document format" → "PDF".\n\n**Wrong answer that runs:** s.upper() returns the whole sentence in capitals ("PORTABLE DOCUMENT FORMAT"), not the acronym. It runs and returns a string; it just kept every letter instead of the first of each word.\n\n**Sanity check:** the result length should equal the number of words. If it is the whole sentence, you uppercased instead of taking initials.',
    canonicalMethodId: 'first_letters', methods: [
      { id: 'first_letters', name: 'first letters joined', code: 'return "".join(w[0].upper() for w in s.split())', detectionSignature: { mustMatch: ['w[0]'], mustNotMatch: [], note: 'initials of each word' }, tradeoff: 'Take each word\'s initial, join.', breaksWhen: 'Empty words would index-error; split avoids them.', isTrap: false },
      { id: 'whole_upper', name: 's.upper()', code: 'return s.upper()', detectionSignature: { mustMatch: ['s.upper()'], mustNotMatch: ['w[0]'], note: 'uppercases everything' }, tradeoff: 'Shorter.', breaksWhen: 'Always for an acronym — it keeps every letter, just capitalised.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is s.upper() wrong for an acronym?', options: ['first_letters', 'whole_upper'], answerId: 'whole_upper', explanation: 'An acronym is the first letter of each word. s.upper() keeps all letters, just in caps. Take w[0] of each word and join.' }] }),

  CORE({ id: 'bp-group-by-length', title: 'Group words by length', tags: ['dict', 'defaultdict', 'grouping'], estimatedMin: 5, fixtureId: 'fx_pb_grouplen',
    prompt: 'Return a dict mapping each word length to the list of words of that length, in order.',
    beforeWriting: 'Several words share a length. Do you append them into a list, or does one overwrite the other?', signature: 'solve(words)',
    starterCode: 'def solve(words):\n    # length -> [words of that length]\n    ...',
    hints: ['Each length maps to a LIST of words.', 'defaultdict(list) makes the first append free.'],
    solution: 'def solve(words):\n    from collections import defaultdict\n    out = defaultdict(list)\n    for w in words:\n        out[len(w)].append(w)\n    return dict(out)', compare: { kind: 'value' },
    debrief: 'Lengths: hi/yo are 2, bye/cat are 3 → {2: [hi, yo], 3: [bye, cat]}.\n\n**Wrong answer that runs:** {len(w): w for w in words} maps each length to a single word, so the later word of each length overwrites the earlier — you lose "hi" and "bye". It runs and returns a dict; it just kept one word per length.\n\n**Sanity check:** the total words across all the lists must equal the input count. If some words vanished, a comprehension overwrote on shared lengths.',
    canonicalMethodId: 'accumulate', methods: [
      { id: 'accumulate', name: 'defaultdict(list)', code: 'from collections import defaultdict\nout = defaultdict(list)\nfor w in words:\n    out[len(w)].append(w)\nreturn dict(out)', detectionSignature: { mustMatch: ['defaultdict'], mustNotMatch: [], note: 'append per length' }, tradeoff: 'Accumulate words into a list per length.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'overwrite', name: 'dict comprehension', code: 'return {len(w): w for w in words}', detectionSignature: { mustMatch: ['len(w): w'], mustNotMatch: ['append'], note: 'later word overwrites' }, tradeoff: 'One line.', breaksWhen: 'When lengths repeat — the comprehension overwrites, keeping one word per length.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the comprehension drop words?', options: ['accumulate', 'overwrite'], answerId: 'overwrite', explanation: 'A dict has unique keys, so {len(w): w} overwrites when two words share a length. Grouping needs a list per key (defaultdict(list) + append).' }] }),

  CORE({ id: 'bp-sum-by-category', title: 'Sum values by category', tags: ['dict', 'defaultdict', 'grouping'], estimatedMin: 5, fixtureId: 'fx_pb_sumcat',
    prompt: 'Given a list of (category, value) pairs, return a dict mapping each category to the SUM of its values.',
    beforeWriting: 'A category can appear more than once. Do the values accumulate, or does the last one win?', signature: 'solve(pairs)',
    starterCode: 'def solve(pairs):\n    # category -> sum of its values\n    ...',
    hints: ['Add into a running total per category.', 'defaultdict(int) starts each new category at 0.'],
    solution: 'def solve(pairs):\n    from collections import defaultdict\n    out = defaultdict(int)\n    for k, v in pairs:\n        out[k] += v\n    return dict(out)', compare: { kind: 'value' },
    debrief: 'a is 10 + 20 = 30, b is 5 → {a: 30, b: 5}.\n\n**Wrong answer that runs:** {k: v for k, v in pairs} keeps only the LAST value per category, so a comes out 20 (losing the 10). It runs and returns a dict; it just overwrote instead of summing.\n\n**Sanity check:** for a repeated category, the value should equal the sum of its entries. If it equals just the last one, you built a comprehension instead of accumulating.',
    canonicalMethodId: 'accumulate', methods: [
      { id: 'accumulate', name: 'defaultdict(int) += ', code: 'from collections import defaultdict\nout = defaultdict(int)\nfor k, v in pairs:\n    out[k] += v\nreturn dict(out)', detectionSignature: { mustMatch: ['+= v'], mustNotMatch: [], note: 'accumulate per key' }, tradeoff: 'Running total per category.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'overwrite', name: 'dict comprehension', code: 'return {k: v for k, v in pairs}', detectionSignature: { mustMatch: ['k: v for k'], mustNotMatch: ['+='], note: 'last value wins' }, tradeoff: 'One line.', breaksWhen: 'When categories repeat — it overwrites, so only the last value survives.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the comprehension undercount a?', options: ['accumulate', 'overwrite'], answerId: 'overwrite', explanation: 'The comprehension assigns out[a] twice, so the second value (20) overwrites the first (10). Summing needs accumulation (+=), not assignment.' }] }),

  CORE({ id: 'bp-flatten-unique', title: 'Flatten, dedup, sort', tags: ['list', 'set', 'flatten'], estimatedMin: 5, fixtureId: 'fx_pb_flatuniq',
    prompt: 'Flatten the list of lists into one list, remove duplicates, and return the values sorted.',
    beforeWriting: 'Values repeat across the sublists. Does your result drop the repeats?', signature: 'solve(nested)',
    starterCode: 'def solve(nested):\n    # flatten -> unique -> sorted\n    ...',
    hints: ['A double comprehension flattens one level.', 'Wrap in set() to dedup, then sorted() to order.'],
    solution: 'def solve(nested):\n    return sorted(set(x for sub in nested for x in sub))', compare: { kind: 'seq' },
    debrief: 'Flattened is 3,1,2,3,1; deduped and sorted → [1, 2, 3].\n\n**Wrong answer that runs:** flattening and sorting WITHOUT the set keeps the duplicates → [1, 1, 2, 3, 3]. It runs and returns a sorted list; it just never removed the repeats.\n\n**Sanity check:** each value should appear once. If duplicates remain, you skipped the set().',
    canonicalMethodId: 'flat_unique', methods: [
      { id: 'flat_unique', name: 'sorted(set(flatten))', code: 'return sorted(set(x for sub in nested for x in sub))', detectionSignature: { mustMatch: ['set('], mustNotMatch: [], note: 'dedup then sort' }, tradeoff: 'Flatten, dedup with a set, sort.', breaksWhen: 'Values must be hashable and comparable.', isTrap: false },
      { id: 'no_dedup', name: 'no set', code: 'return sorted(x for sub in nested for x in sub)', detectionSignature: { mustMatch: ['sorted(x for sub'], mustNotMatch: ['set('], note: 'keeps duplicates' }, tradeoff: 'Shorter.', breaksWhen: 'When values repeat — it leaves the duplicates in.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'What removes the duplicates?', options: ['flat_unique', 'no_dedup'], answerId: 'flat_unique', explanation: 'Wrapping the flattened values in set() drops repeats before sorting. Without it, duplicates survive.' }] }),

  CORE({ id: 'bp-common-elements', title: 'Common elements of two lists', tags: ['set', 'intersection', 'list'], estimatedMin: 4, fixtureId: 'fx_pb_common',
    prompt: 'Return the values that appear in BOTH lists, deduplicated and sorted.',
    beforeWriting: 'List a has a repeated 2. Should the shared value appear once, or once per duplicate?', signature: 'solve(a, b)',
    starterCode: 'def solve(a, b):\n    # values in both, unique and sorted\n    ...',
    hints: ['Set intersection gives shared values with no repeats.', 'A list comprehension "x in b" keeps duplicates from a.'],
    solution: 'def solve(a, b):\n    return sorted(set(a) & set(b))', compare: { kind: 'seq' },
    debrief: 'Shared values are 2 and 3 → [2, 3].\n\n**Wrong answer that runs:** [x for x in a if x in b] keeps a\'s duplicates, so the repeated 2 appears twice → [2, 2, 3]. It runs and returns the common values; it just did not deduplicate.\n\n**Sanity check:** each shared value should appear once. If a value repeats, you filtered the list instead of intersecting sets.',
    canonicalMethodId: 'set_intersect', methods: [
      { id: 'set_intersect', name: 'set(a) & set(b)', code: 'return sorted(set(a) & set(b))', detectionSignature: { mustMatch: ['set(a) & set(b)'], mustNotMatch: [], note: 'unique shared values' }, tradeoff: 'Set intersection dedups automatically.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'list_dups', name: 'filter a by membership', code: 'return sorted(x for x in a if x in b)', detectionSignature: { mustMatch: ['x in b'], mustNotMatch: ['set('], note: 'keeps a\'s duplicates' }, tradeoff: 'Reads left to right.', breaksWhen: 'When a has duplicates — they all pass, so the result repeats values.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why does the filter version repeat 2?', options: ['set_intersect', 'list_dups'], answerId: 'list_dups', explanation: 'Filtering a keeps every matching element, including a\'s duplicate 2. Set intersection returns each shared value once.' }] }),

  CORE({ id: 'bp-parse-kv', title: 'Parse key=value lines', tags: ['string', 'parse', 'dict'], estimatedMin: 5, fixtureId: 'fx_pb_kv',
    prompt: 'Each line is "key=value" where value is a number. Return a dict mapping key to the value as an INT.',
    beforeWriting: 'After splitting on "=", the value is still text. Does the dict store 1 or "1"?', signature: 'solve(lines)',
    starterCode: 'def solve(lines):\n    # {key: int(value)} per line\n    ...',
    hints: ['Split each line on "=" into key and value.', 'Convert the value with int() before storing it.'],
    solution: 'def solve(lines):\n    out = {}\n    for line in lines:\n        k, v = line.split("=")\n        out[k] = int(v)\n    return out', compare: { kind: 'value' },
    debrief: '{a: 1, b: 2, c: 3} with integer values.\n\n**Wrong answer that runs:** dict(line.split("=") for line in lines) builds the dict but leaves the values as STRINGS → {a: "1", ...}. It runs and returns a dict; the values are just text, so any later arithmetic on them misbehaves.\n\n**Sanity check:** the values should be ints, not strings. If "1" + "1" would concatenate rather than add, you skipped int().',
    canonicalMethodId: 'parse_int', methods: [
      { id: 'parse_int', name: 'split + int()', code: 'out = {}\nfor line in lines:\n    k, v = line.split("=")\n    out[k] = int(v)\nreturn out', detectionSignature: { mustMatch: ['int(v)'], mustNotMatch: [], note: 'convert the value' }, tradeoff: 'Parse the value to int explicitly.', breaksWhen: 'Non-numeric values need validation.', isTrap: false },
      { id: 'keep_str', name: 'dict of raw splits', code: 'return dict(line.split("=") for line in lines)', detectionSignature: { mustMatch: ['dict(line.split'], mustNotMatch: ['int('], note: 'values stay text' }, tradeoff: 'Compact.', breaksWhen: 'When values must be numbers — they stay as strings, breaking later math.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'What is wrong with dict(line.split("=") ...)?', options: ['parse_int', 'keep_str'], answerId: 'keep_str', explanation: 'It stores the value halves as strings, so you get {a: "1"}. Convert with int(v) so the values are numbers.' }] }),

  CORE({ id: 'bp-fizzbuzz', title: 'FizzBuzz', tags: ['number', 'conditionals', 'order'], estimatedMin: 5, fixtureId: 'fx_pb_fizz',
    prompt: 'Return a list for 1..n: "Fizz" if divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, otherwise the number as a string.',
    beforeWriting: 'A number divisible by both 3 and 5 is also divisible by 3. Which check has to come FIRST?', signature: 'solve(n)',
    starterCode: 'def solve(n):\n    # 1..n as Fizz / Buzz / FizzBuzz / number\n    ...',
    hints: ['Check the "both" case (divisible by 15) before the individual 3 and 5 checks.', 'Otherwise the 3-check fires first and you never reach FizzBuzz.'],
    solution: 'def solve(n):\n    out = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            out.append("FizzBuzz")\n        elif i % 3 == 0:\n            out.append("Fizz")\n        elif i % 5 == 0:\n            out.append("Buzz")\n        else:\n            out.append(str(i))\n    return out', compare: { kind: 'seq' },
    debrief: 'At 15 you get "FizzBuzz"; at 3/6/9/12 "Fizz"; at 5/10 "Buzz".\n\n**Wrong answer that runs:** checking i % 3 (or i % 5) BEFORE i % 15 means 15 matches the 3-branch first and returns "Fizz" — the FizzBuzz branch is unreachable. It runs and returns a list; index 15 is just wrong.\n\n**Sanity check:** confirm the value at 15 is "FizzBuzz". If it is "Fizz", the divisible-by-both check is not first.',
    canonicalMethodId: 'ordered', methods: [
      { id: 'ordered', name: 'check 15 first', code: 'out = []\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        out.append("FizzBuzz")\n    elif i % 3 == 0:\n        out.append("Fizz")\n    elif i % 5 == 0:\n        out.append("Buzz")\n    else:\n        out.append(str(i))\nreturn out', detectionSignature: { mustMatch: ['i % 15 == 0'], mustNotMatch: [], note: 'most specific first' }, tradeoff: 'The both-case check comes first.', breaksWhen: 'Nothing here.', isTrap: false },
      { id: 'wrong_order', name: 'check 3 first', code: 'out = []\nfor i in range(1, n + 1):\n    if i % 3 == 0:\n        out.append("Fizz")\n    elif i % 5 == 0:\n        out.append("Buzz")\n    elif i % 15 == 0:\n        out.append("FizzBuzz")\n    else:\n        out.append(str(i))\nreturn out', detectionSignature: { mustMatch: ['i % 3 == 0'], mustNotMatch: [], note: 'FizzBuzz unreachable' }, tradeoff: 'Looks complete.', breaksWhen: 'Because 15 is divisible by 3, the 3-branch fires first and "FizzBuzz" never appears.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why must the %15 check come first?', options: ['ordered', 'wrong_order'], answerId: 'ordered', explanation: '15 is divisible by 3, 5, and 15. If you check %3 first, 15 matches it and returns "Fizz". The most specific (both) condition has to be tested before the individual ones.' }] }),

  CORE({ id: 'bp-longest-run', title: 'Longest consecutive run', tags: ['string', 'itertools', 'groupby'], estimatedMin: 5, fixtureId: 'fx_pb_run',
    prompt: 'Return the length of the longest run of the SAME character appearing consecutively.',
    beforeWriting: 'A character can appear many times in total but never in a long streak. Is it total count or consecutive length?', signature: 'solve(s)',
    starterCode: 'def solve(s):\n    # length of the longest consecutive run\n    ...',
    hints: ['itertools.groupby groups consecutive equal characters.', 'The total count of a character is not the same as its longest streak.'],
    solution: 'def solve(s):\n    from itertools import groupby\n    return max(len(list(g)) for k, g in groupby(s))', compare: { kind: 'value' },
    debrief: '"aabbaa" has runs aa, bb, aa — each length 2, so the longest run is 2.\n\n**Wrong answer that runs:** taking the max TOTAL count (Counter) returns 4, because "a" appears four times overall — but those are two separate runs of 2, not one streak. It runs and returns a number; it measured frequency, not a consecutive run.\n\n**Sanity check:** the answer can never exceed the longest unbroken streak. If it equals a character\'s total count across the whole string, you measured frequency instead of consecutive length.',
    canonicalMethodId: 'consecutive', methods: [
      { id: 'consecutive', name: 'groupby run lengths', code: 'from itertools import groupby\nreturn max(len(list(g)) for k, g in groupby(s))', detectionSignature: { mustMatch: ['groupby'], mustNotMatch: [], note: 'consecutive runs' }, tradeoff: 'groupby gives each consecutive run; take the longest.', breaksWhen: 'Empty string has no run; guard if possible.', isTrap: false },
      { id: 'total_count', name: 'max total count', code: 'from collections import Counter\nreturn max(Counter(s).values())', detectionSignature: { mustMatch: ['Counter'], mustNotMatch: ['groupby'], note: 'frequency, not run' }, tradeoff: 'Simple.', breaksWhen: 'When a character recurs in separate runs — total count overstates the longest streak.', isTrap: true }],
    mcqs: [{ id: 'q1', stem: 'Why is the max Counter value wrong?', options: ['consecutive', 'total_count'], answerId: 'total_count', explanation: 'Counter gives total frequency, not consecutive length. "a" appears 4 times but in two runs of 2. groupby measures actual consecutive runs.' }] }),

];

export default problems;

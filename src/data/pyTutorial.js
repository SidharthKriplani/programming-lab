// pyTutorial — the BEGINNER on-ramp ladder for PyLab (SQLBolt-style guided walkthrough).
//
// The welcome mat in front of the PyLab gym: a complete beginner who would bounce off a
// 136-problem interview bank instead climbs short, sequential lessons — concept blurb +
// a few tiny tasks checked inline — until they can write a passing solve(). It only ramps
// 0 -> the gym's Easy floor, then HANDS OFF to the bank (graduatesTo). The gym takes them
// Easy -> Staff; the ladder never tries to reach medium/hard (that would duplicate the bank).
//
// STATUS (skeleton, 2026-06-24): the Python section's first 5 lessons are FULLY AUTHORED
// and CPython-verified; the rest are PLANNED stubs (title + topic + seed), rendered greyed
// "coming soon" — the same pattern as pyLabPlanned.js (display-only, zero gate impact).
//
// HOUSE SYNTAX: single quotes only; Python stored with DOUBLE quotes inside; code joined
// with .join('\n'); escape prose apostrophes as \' ; NO template literals / backticks.
//
// PER-TASK GRADER CONTRACT (reuses pyodideRuntime.runCheck, the Foundations "your turn"
// grader): runCheck(userCode, check) runs the learner's code then `check` in ONE fresh
// namespace; `check` inspects globals().get('var') and sets __pl_pass (bool) + __pl_msg
// (targeted, actionable — never just "wrong"). Expected values live in the check, executed,
// never hand-asserted blind: every authored task below was run in CPython (correct passes,
// wrong fails) before transcription.
//
// LESSON: { n, section, title, topic, level, status, concept, tasks[], graduatesTo? }
// TASK:   { id, prompt, starter, check, hint, solution }   // solution = canonical correct (gate-only)
// STUB:   { n, section, title, topic, status:'planned', seed }

export const PY_TUT_SECTIONS = [
  { id: 'python', label: 'Python', blurb: 'From your first variable to functions — the fluency the gym assumes.' },
  { id: 'pandas', label: 'pandas', blurb: 'Series, DataFrames, groupby, merge — the analyst-native ops.' },
];

// ── Section 1 · Python (the beginner one) ────────────────────────────────────
const PYTHON_LESSONS = [
  {
    n: 1,
    section: 'python',
    title: 'Values & variables',
    topic: 'python-core',
    level: 'beginner',
    status: 'ready',
    concept: [
      'A variable is a name pointing at a value. You make one with name = value.',
      'Values come in types: whole numbers (int) like 2026, decimals (float) like 9.99, text (str) in quotes like "Paris", and the booleans True and False.',
      'No need to declare the type — Python reads it from the value you assign.',
    ].join('\n\n'),
    tasks: [
      {
        id: 'pt-1-a',
        prompt: 'Make a variable called city holding the text Paris.',
        starter: 'city = "..."',
        solution: 'city = "Paris"',
        check: [
          'v = globals().get("city")',
          'if v == "Paris":',
          '    __pl_pass = True; __pl_msg = "Correct — city now holds the text Paris."',
          'else:',
          '    __pl_pass = False; __pl_msg = "city is " + repr(v) + ", but it should be the text Paris (in quotes)."',
        ].join('\n'),
        hint: 'Text values go inside quotes: "Paris".',
      },
      {
        id: 'pt-1-b',
        prompt: 'Make a variable called year set to the whole number 2026.',
        starter: 'year = 0',
        solution: 'year = 2026',
        check: [
          'v = globals().get("year")',
          'if v == 2026 and isinstance(v, int):',
          '    __pl_pass = True; __pl_msg = "Correct."',
          'else:',
          '    __pl_pass = False; __pl_msg = "year should be the whole number 2026 (no quotes)."',
        ].join('\n'),
        hint: 'Whole numbers have no quotes and no decimal point: 2026.',
      },
      {
        id: 'pt-1-c',
        prompt: 'Make a variable called price set to the decimal 9.99.',
        starter: 'price = 0.0',
        solution: 'price = 9.99',
        check: [
          'v = globals().get("price")',
          '__pl_pass = (v == 9.99)',
          '__pl_msg = "Correct." if __pl_pass else "price should be 9.99 — a decimal (float)."',
        ].join('\n'),
        hint: 'Decimals use a dot: 9.99.',
      },
      {
        id: 'pt-1-d',
        prompt: 'Make a variable called is_open set to the boolean True.',
        starter: 'is_open = False',
        solution: 'is_open = True',
        check: [
          'v = globals().get("is_open")',
          '__pl_pass = (v is True)',
          '__pl_msg = "Correct." if __pl_pass else "is_open should be True — the boolean, with no quotes."',
        ].join('\n'),
        hint: 'True is a keyword, not text — write it without quotes.',
      },
    ],
  },
  {
    n: 2,
    section: 'python',
    title: 'Numbers & arithmetic',
    topic: 'python-core',
    level: 'beginner',
    status: 'ready',
    concept: [
      'Python does maths with + - * / and a few extras. * and / happen before + and -, just like in school — use parentheses to change the order.',
      'Two division flavours matter: / always gives a decimal (7 / 2 is 3.5), while // does integer division and drops the remainder (7 // 2 is 3). The % operator gives the remainder by itself (17 % 5 is 2).',
    ].join('\n\n'),
    tasks: [
      {
        id: 'pt-2-a',
        prompt: 'Set total to 3 plus 4 times 5. Let Python handle the order.',
        starter: 'total = 0',
        solution: 'total = 3 + 4 * 5',
        check: [
          'v = globals().get("total")',
          'if v == 23:',
          '    __pl_pass = True; __pl_msg = "Correct — 4 * 5 runs first, then + 3."',
          'else:',
          '    __pl_pass = False; __pl_msg = "total is " + repr(v) + "; expected 23 (multiplication before addition)."',
        ].join('\n'),
        hint: 'Write it as 3 + 4 * 5 — do not add parentheses around 3 + 4.',
      },
      {
        id: 'pt-2-b',
        prompt: 'Set half to 7 divided by 2.',
        starter: 'half = 0',
        solution: 'half = 7 / 2',
        check: [
          'v = globals().get("half")',
          '__pl_pass = (v == 3.5)',
          '__pl_msg = "Correct — / gives a decimal." if __pl_pass else "Use / for normal division; expected 3.5."',
        ].join('\n'),
        hint: 'A single slash / gives the decimal result.',
      },
      {
        id: 'pt-2-c',
        prompt: 'Set whole to 7 divided by 2, dropping the remainder.',
        starter: 'whole = 0',
        solution: 'whole = 7 // 2',
        check: [
          'v = globals().get("whole")',
          '__pl_pass = (v == 3)',
          '__pl_msg = "Correct — // drops the remainder." if __pl_pass else "Use // for integer division; expected 3."',
        ].join('\n'),
        hint: 'A double slash // throws away whatever is left over.',
      },
      {
        id: 'pt-2-d',
        prompt: 'Set rem to the remainder of 17 divided by 5.',
        starter: 'rem = 0',
        solution: 'rem = 17 % 5',
        check: [
          'v = globals().get("rem")',
          '__pl_pass = (v == 2)',
          '__pl_msg = "Correct — % is the remainder." if __pl_pass else "Use %; 17 % 5 is 2."',
        ].join('\n'),
        hint: 'The % operator gives only the remainder.',
      },
    ],
  },
  {
    n: 3,
    section: 'python',
    title: 'Working with text',
    topic: 'python-core',
    level: 'beginner',
    status: 'ready',
    concept: [
      'Strings carry text and come with built-in methods you call with a dot: "hi".upper() gives "HI", and "  pad  ".strip() removes the spaces around the edges.',
      'You can split a string into pieces: "a,b,c".split(",") gives ["a", "b", "c"]. And an f-string drops a variable straight into text: with who = "Sam", f"Hi, {who}!" becomes "Hi, Sam!".',
    ].join('\n\n'),
    tasks: [
      {
        id: 'pt-3-a',
        prompt: 'Set name to "ada lovelace" converted to upper case.',
        starter: 'name = "ada lovelace"',
        solution: 'name = "ada lovelace".upper()',
        check: [
          'v = globals().get("name")',
          '__pl_pass = (v == "ADA LOVELACE")',
          '__pl_msg = "Correct." if __pl_pass else "Call .upper() on the string; expected ADA LOVELACE."',
        ].join('\n'),
        hint: 'Add .upper() to the end of the string.',
      },
      {
        id: 'pt-3-b',
        prompt: 'raw has spaces around it. Set clean to raw with those spaces removed.',
        starter: 'raw = "  hello  "\nclean = raw',
        solution: 'raw = "  hello  "\nclean = raw.strip()',
        check: [
          'v = globals().get("clean")',
          '__pl_pass = (v == "hello")',
          '__pl_msg = "Correct." if __pl_pass else ".strip() trims the surrounding spaces; expected hello."',
        ].join('\n'),
        hint: 'Use raw.strip().',
      },
      {
        id: 'pt-3-c',
        prompt: 'Set domain to the part of email after the @ sign.',
        starter: 'email = "sam@site.com"\ndomain = email',
        solution: 'email = "sam@site.com"\ndomain = email.split("@")[1]',
        check: [
          'v = globals().get("domain")',
          '__pl_pass = (v == "site.com")',
          '__pl_msg = "Correct." if __pl_pass else "Split on @ and take the second piece [1]; expected site.com."',
        ].join('\n'),
        hint: 'email.split("@") gives two pieces — you want piece number [1].',
      },
      {
        id: 'pt-3-d',
        prompt: 'Use an f-string to set greeting to "Hi, Sam!" using the variable who.',
        starter: 'who = "Sam"\ngreeting = "..."',
        solution: 'who = "Sam"\ngreeting = f"Hi, {who}!"',
        check: [
          'v = globals().get("greeting")',
          '__pl_pass = (v == "Hi, Sam!")',
          '__pl_msg = "Correct." if __pl_pass else "Put f before the quotes and {who} inside; expected Hi, Sam!."',
        ].join('\n'),
        hint: 'Start the string with f and write {who} where the name should go.',
      },
    ],
  },
  {
    n: 4,
    section: 'python',
    title: 'True, False & comparisons',
    topic: 'python-core',
    level: 'beginner',
    status: 'ready',
    concept: [
      'Comparisons ask a yes/no question and answer with True or False: == (equal), != (not equal), <, >, <=, >=. Note == is case-sensitive: "cat" == "Cat" is False.',
      'Combine them with and (both must be true), or (either is true), and not (flip it). And every value has a truthiness: an empty list, empty string, 0, and None are "falsy"; most other values are "truthy". not items is True when items is empty.',
    ].join('\n\n'),
    tasks: [
      {
        id: 'pt-4-a',
        prompt: 'age is 20. Set adult to whether age is at least 18.',
        starter: 'age = 20\nadult = False',
        solution: 'age = 20\nadult = age >= 18',
        check: [
          'v = globals().get("adult")',
          '__pl_pass = (v is True)',
          '__pl_msg = "Correct — 20 is at least 18." if __pl_pass else "Use age >= 18; it should be True."',
        ].join('\n'),
        hint: 'At least means >= (greater than or equal).',
      },
      {
        id: 'pt-4-b',
        prompt: 'Set same to whether "cat" equals "Cat".',
        starter: 'same = True',
        solution: 'same = "cat" == "Cat"',
        check: [
          'v = globals().get("same")',
          '__pl_pass = (v is False)',
          '__pl_msg = "Correct — comparison is case-sensitive, so this is False." if __pl_pass else "cat and Cat differ in case; == gives False."',
        ].join('\n'),
        hint: 'Compare them with ==. The capital C matters.',
      },
      {
        id: 'pt-4-c',
        prompt: 'Set both to whether 5 > 3 AND 2 < 1.',
        starter: 'both = True',
        solution: 'both = 5 > 3 and 2 < 1',
        check: [
          'v = globals().get("both")',
          '__pl_pass = (v is False)',
          '__pl_msg = "Correct — and needs both sides true, and 2 < 1 is False." if __pl_pass else "Use and; the result is False."',
        ].join('\n'),
        hint: 'Join the two checks with the word and.',
      },
      {
        id: 'pt-4-d',
        prompt: 'items is an empty list. Use not to set empty to whether items is falsy.',
        starter: 'items = []\nempty = False',
        solution: 'items = []\nempty = not items',
        check: [
          'v = globals().get("empty")',
          '__pl_pass = (v is True)',
          '__pl_msg = "Correct — an empty list is falsy, so not items is True." if __pl_pass else "Write not items; an empty list is falsy."',
        ].join('\n'),
        hint: 'not items flips the truthiness of the list.',
      },
    ],
  },
  {
    n: 5,
    section: 'python',
    title: 'Lists',
    topic: 'python-core',
    level: 'beginner',
    status: 'ready',
    concept: [
      'A list holds an ordered collection: nums = [4, 8, 15, 16]. You reach items by position, counting from 0: nums[0] is the first, and nums[-1] is the last.',
      'Lists grow and shrink: nums.append(23) adds to the end. And handy built-ins read across the whole list: len(nums) counts items, sum(nums) totals them, min/max find extremes.',
    ].join('\n\n'),
    tasks: [
      {
        id: 'pt-5-a',
        prompt: 'Set first to the first item of nums.',
        starter: 'nums = [4, 8, 15, 16]\nfirst = 0',
        solution: 'nums = [4, 8, 15, 16]\nfirst = nums[0]',
        check: [
          'v = globals().get("first")',
          '__pl_pass = (v == 4)',
          '__pl_msg = "Correct — positions start at 0." if __pl_pass else "The first item is nums[0]; expected 4."',
        ].join('\n'),
        hint: 'The first position is 0, so nums[0].',
      },
      {
        id: 'pt-5-b',
        prompt: 'Set last to the last item of nums using a negative index.',
        starter: 'nums = [4, 8, 15, 16]\nlast = 0',
        solution: 'nums = [4, 8, 15, 16]\nlast = nums[-1]',
        check: [
          'v = globals().get("last")',
          '__pl_pass = (v == 16)',
          '__pl_msg = "Correct — -1 is the last item." if __pl_pass else "Use nums[-1]; expected 16."',
        ].join('\n'),
        hint: 'Negative indexes count from the end: -1 is the last.',
      },
      {
        id: 'pt-5-c',
        prompt: 'Append the number 23 to the end of nums.',
        starter: 'nums = [4, 8, 15, 16]\n# add 23 to the end of nums',
        solution: 'nums = [4, 8, 15, 16]\nnums.append(23)',
        check: [
          'v = globals().get("nums")',
          '__pl_pass = (v == [4, 8, 15, 16, 23])',
          '__pl_msg = "Correct." if __pl_pass else "Use nums.append(23); expected [4, 8, 15, 16, 23]."',
        ].join('\n'),
        hint: 'nums.append(23) adds one item to the end.',
      },
      {
        id: 'pt-5-d',
        prompt: 'Set total to the sum of every item in nums.',
        starter: 'nums = [4, 8, 15, 16]\ntotal = 0',
        solution: 'nums = [4, 8, 15, 16]\ntotal = sum(nums)',
        check: [
          'v = globals().get("total")',
          '__pl_pass = (v == 43)',
          '__pl_msg = "Correct." if __pl_pass else "sum(nums) adds them all; expected 43."',
        ].join('\n'),
        hint: 'sum(nums) totals the whole list in one call.',
      },
    ],
    graduatesTo: { topic: 'python-core', label: 'Try an Easy Python problem in the gym' },
  },

  // ── PLANNED stubs (display-only, greyed "coming soon" — author next, same gated way) ──
  { n: 6,  section: 'python', title: 'Dictionaries',            topic: 'python-core', status: 'planned', seed: 'key->value lookups; d[k] vs d.get(k, default); keys/values/items; the KeyError trap.' },
  { n: 7,  section: 'python', title: 'Sets & tuples',           topic: 'python-core', status: 'planned', seed: 'set() for uniqueness + membership; tuples as fixed records; packing/unpacking.' },
  { n: 8,  section: 'python', title: 'Making decisions (if)',   topic: 'python-core', status: 'planned', seed: 'if / elif / else; indentation as structure; the = vs == mix-up.' },
  { n: 9,  section: 'python', title: 'Loops',                   topic: 'python-core', status: 'planned', seed: 'for over a list, range(); while; break / continue; off-by-one with range.' },
  { n: 10, section: 'python', title: 'enumerate & zip',         topic: 'python-core', status: 'planned', seed: 'index+value with enumerate; pair two lists with zip; the ragged-length cut.' },
  { n: 11, section: 'python', title: 'Comprehensions',          topic: 'idioms',      status: 'planned', seed: '[x for x in xs if cond]; dict/set comprehensions; readability vs a loop.' },
  { n: 12, section: 'python', title: 'Functions',               topic: 'python-core', status: 'planned', seed: 'def, parameters, return; the print-vs-return confusion; default arguments.' },
  { n: 13, section: 'python', title: 'More on functions',       topic: 'python-core', status: 'planned', seed: 'multiple returns, *args / **kwargs; the mutable-default-argument footgun.' },
  { n: 14, section: 'python', title: 'Sort by a key',           topic: 'idioms',      status: 'planned', seed: 'sorted(xs, key=...), reverse=; lambda as a key; stable sort.' },
  { n: 15, section: 'python', title: 'Counting & grouping',     topic: 'idioms',      status: 'planned', seed: 'collections.Counter for tallies; defaultdict(list) to group; .most_common(k).' },
  { n: 16, section: 'python', title: 'Rows of data',            topic: 'idioms',      status: 'planned', seed: 'split lines into fields, build dict records; join back; the header row.' },
  { n: 17, section: 'python', title: 'When things go wrong',    topic: 'python-core', status: 'planned', seed: 'try / except, fail loud vs swallow; a basic validation guard.' },
  { n: 18, section: 'python', title: 'Review · write a solve()', topic: 'python-core', status: 'planned', seed: 'tie it together: read inputs, transform, return — the shape the gym expects.' },
];

// ── Section 2 · pandas (planned — authored after the Python section ships) ────
const PANDAS_LESSONS = [
  { n: 1, section: 'pandas', title: 'Series & DataFrame',    topic: 'pandas-groupby', status: 'planned', seed: 'a column is a Series, a table is a DataFrame; dtypes; df["col"] vs df[["col"]].' },
  { n: 2, section: 'pandas', title: 'Select & filter rows',  topic: 'pandas-groupby', status: 'planned', seed: 'boolean masks, .loc; & / | with parentheses; the chained-index SettingWithCopy.' },
  { n: 3, section: 'pandas', title: 'Add & change columns',  topic: 'pandas-groupby', status: 'planned', seed: 'df["new"] = ...; assign; vectorized op vs a Python loop.' },
  { n: 4, section: 'pandas', title: 'Sort & rank',           topic: 'pandas-groupby', status: 'planned', seed: 'sort_values, ascending; nlargest; ties.' },
  { n: 5, section: 'pandas', title: 'groupby & aggregate',   topic: 'pandas-groupby', status: 'planned', seed: 'split-apply-combine; as_index; the dropna=False NaN-group trap.' },
  { n: 6, section: 'pandas', title: 'Merge two tables',      topic: 'pandas-merge',   status: 'planned', seed: 'merge on a key, how=; the many-to-many fan-out row explosion.' },
  { n: 7, section: 'pandas', title: 'Missing data',          topic: 'pandas-groupby', status: 'planned', seed: 'NaN, isna, fillna vs dropna; the silent row loss.' },
  { n: 8, section: 'pandas', title: 'Review · clean & answer', topic: 'pandas-groupby', status: 'planned', seed: 'a tiny end-to-end: filter, group, return one tidy frame — the gym\'s Easy floor.' },
];

export const pyTutorial = [...PYTHON_LESSONS, ...PANDAS_LESSONS];

// counts for the banner / progress
export const pyTutMeta = {
  readyLessons: pyTutorial.filter(l => l.status === 'ready').length,
  totalLessons: pyTutorial.length,
  readyTasks: pyTutorial
    .filter(l => l.status === 'ready')
    .reduce((s, l) => s + (l.tasks ? l.tasks.length : 0), 0),
};

export default pyTutorial;

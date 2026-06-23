// Bank — KNOW (Programming Lab, the KNOW rung).
// "How it actually works": short Python/OOP depth explainers, each with a
// RUNNABLE demo that DEMONSTRATES the mechanism (prints output). Where Gotchas
// shows a trap and the fix, KNOW shows the underlying machine so the trap stops
// being surprising.
//
// HOUSE SYNTAX (PAL CLAUDE.md): single quotes only; escape apostrophes as \' ;
// NO template literals (backticks) — Rolldown parse error. All Python is stored
// as \n-joined single-quoted strings with DOUBLE quotes used INSIDE the Python.
// Every demoCode/demoOutput pair below is VERIFIED against CPython 3.10
// (Pyodide ships CPython 3.11 — identical output for these deterministic demos).
//
// Schema per module:
//   id, cluster, title, subtitle, difficulty:'warmup'|'core'|'stretch',
//   estimatedMin, tags:[...]
//   hook        — the 'why this surprises people' opener (a situation, not a definition)
//   demoCode    — runnable Python that DEMONSTRATES the mechanism (prints output)
//   demoOutput  — verified stdout (trailing newline trimmed, matching the glass-box run)
//   explain     — [ { heading, body } ]  2-3 collapsible sections
//   mentalModel — the one-sentence model to keep
//   predict     — { question, options:[ {label, level:'wrong'|'partial'|'strong', feedback} ] }
//                 (leveled options with per-option teaching feedback; no answerIndex)
//   isFree      — true (this depth layer is free)
//   seniorRead  — { shortAnswer, why, commonMistake, interviewPhrase, connectsTo:[...] }
//                 the senior-engineer read: verdict, mechanism, the trap, the quotable line
//   connectsTo  — ['gotchas','python','pandas']

export const KNOW_CLUSTERS = {
  'objects-identity': { label: 'Objects & Identity',  accent: 'var(--accent)' },
  'evaluation-model': { label: 'Evaluation Model',    accent: 'var(--purple)' },
  'scope-closures':   { label: 'Scope & Closures',    accent: 'var(--red)' },
  'truthiness':       { label: 'Truthiness',          accent: 'var(--yellow)' },
  'data-model':       { label: 'The Data Model',      accent: 'var(--teal)' },
  'functions':        { label: 'Functions & Decorators', accent: 'var(--purple)' },
  'iteration':        { label: 'Iteration & Context', accent: 'var(--green)' },
  'objects':          { label: 'Objects & Classes',   accent: 'var(--accent)' },
  'typing':           { label: 'Typing & Style',      accent: 'var(--teal)' },
  'imports':          { label: 'Imports & Modules',   accent: 'var(--red)' },
};

export const KNOW_CLUSTER_ORDER = [
  'objects-identity', 'evaluation-model', 'scope-closures', 'truthiness', 'data-model',
  'functions', 'iteration', 'objects', 'typing', 'imports',
];

export const knowModules = [
  // ───────────────────────── Objects & Identity ─────────────────────────
  {
    id: 'know-names-are-bindings',
    yourTurn: {
      prompt: 'Make it so appending to a does NOT change b - give b its own independent list.',
      starter: 'a = [1, 2]\nb = a\na.append(3)\nprint("a", a, "b", b)',
      check: '__pl_pass = (a == [1, 2, 3] and b == [1, 2])\n__pl_msg = ("Right - b got its own list, so the append to a never reached it." if __pl_pass else "b is " + repr(b) + ". While b = a they are the SAME list - give b a copy: b = a.copy().")',
      hint: 'Assignment binds a name, it never copies. Ask for a copy explicitly: a.copy(), list(a), or a[:].',
    },
    cluster: 'objects-identity',
    title: 'Names are bindings, not boxes',
    subtitle: 'Why a = b = [] makes one list, not two.',
    difficulty: 'warmup',
    estimatedMin: 4,
    tags: ['identity', 'references', 'mutation'],
    hook: 'You write a = b = [] expecting two empty lists. You append to one. Both change. Nobody copied anything - and that is exactly the point.',
    demoCode: '# A name is a label tied to an object, not a box that holds a value.\na = b = []          # ONE list, two labels on it\na.append(1)\nprint("a:", a)\nprint("b:", b)\nprint("same object:", a is b)\n\n# Separate statements build separate objects:\nc = []\nd = []\nc.append(1)\nprint("c:", c)\nprint("d:", d)\nprint("same object:", c is d)',
    demoOutput: 'a: [1]\nb: [1]\nsame object: True\nc: [1]\nd: []\nsame object: False',
    predict: {
      question: 'After a = b = [] and a.append(1), what is b?',
      options: [
        { label: '[]',
          level: 'wrong',
          feedback: 'This assumes = made b its own list. It did not. a = b = [] evaluates [] once and binds both names to that single object, so a.append(1) is visible through b.' },
        { label: '[1]',
          level: 'strong',
          feedback: 'Right. One list, two labels. append mutates the shared object in place, so both names see [1]. To get independent lists you build them separately or call .copy().' },
        { label: 'raises an error',
          level: 'wrong',
          feedback: 'No error - append on a list is always valid. The surprise is not a crash, it is the silent aliasing: both names point at the same list.' },
      ],
    },
    explain: [
      {
        heading: 'A name points at an object',
        body: 'In Python, a variable is not a container that stores a value. It is a name bound to an object that lives elsewhere in memory. Assignment binds a name; it does not copy the object. So a = b = [] evaluates the [] once, creates one list, and binds both names to it.',
      },
      {
        heading: 'Mutation vs rebinding',
        body: 'a.append(1) mutates the shared object in place - both names see it. But a = [9] rebinds only a to a brand-new list; b still points at the old one. The trap only bites with mutable objects (list, dict, set). Immutable ones (int, str, tuple) can never be mutated, so aliasing them is harmless.',
      },
      {
        heading: 'is vs ==',
        body: '`is` asks "the same object?" (same identity, same id()). `==` asks "equal value?". Two separately-built [] are == but not `is`. This is the whole reason df2 = df then mutating df2 silently changes df.',
      },
    ],
    mentalModel: 'Assignment binds a name to an object - it never copies. To get a separate object, ask for one (.copy()).',
    isFree: true,
    seniorRead: {
      shortAnswer: 'b is [1]. a = b = [] makes ONE list with two names on it; append mutates the shared object, so both names see the change.',
      why: 'A Python variable is a name in a namespace pointing at an object - not a box holding bytes. a = b = [] evaluates the right-hand side once, builds a single list, and binds both a and b to it.\n\nThe distinction that matters under pressure is mutation vs rebinding. a.append(1) mutates the one shared list in place, so it is visible through every name bound to it. a = [9] does NOT touch the old list - it rebinds a to a new object and leaves b on the original. This is exactly why df2 = df1 then df2.dropna(inplace=True) silently edits df1: no copy ever happened.',
      commonMistake: 'Assuming = deep-copies, or using `is` to compare values. **Weak pattern:** the candidate says "they are separate because I wrote two names" and cannot explain why both changed. **Interviewer follow-up:** "will a is b be True, and how do you make b independent?" - the answer is True, and .copy() gives independence.',
      interviewPhrase: '"Names are bindings, not boxes - = rebinds a label, it never copies the object. a and b are two names on one list, so appending through a shows up in b. For an independent list I would call .copy()."',
      connectsTo: ['gotchas', 'pandas'],
    },
    connectsTo: ['gotchas', 'python', 'pandas'],
  },

  // ───────────────────────── Evaluation Model ─────────────────────────
  {
    id: 'know-generators-are-lazy',
    cluster: 'evaluation-model',
    title: 'Generators are lazy and one-shot',
    subtitle: 'Why a generator runs once and forgets, with flat memory.',
    difficulty: 'core',
    estimatedMin: 5,
    tags: ['generators', 'iterators', 'lazy', 'memory'],
    hook: 'You build a generator, loop over it, and it works. You loop again and get nothing. It is not broken - a generator is a stream you can only walk once.',
    demoCode: '# A generator computes values on demand and remembers WHERE it is, not the values.\ndef squares(n):\n    for i in range(n):\n        yield i * i\n\ng = squares(4)\nprint("first pass:", list(g))\nprint("second pass:", list(g))   # exhausted - nothing left\n\n# It holds one value at a time, so a huge range costs almost no memory:\nbig = (x for x in range(1_000_000))\nprint("gen is iterator of itself:", iter(big) is big)\nprint("type:", type(big).__name__)',
    demoOutput: 'first pass: [0, 1, 4, 9]\nsecond pass: []\ngen is iterator of itself: True\ntype: generator',
    predict: {
      question: 'g = squares(4). After list(g), what does the second list(g) return?',
      options: [
        { label: '[0, 1, 4, 9] again',
          level: 'wrong',
          feedback: 'A generator does not restart. It remembers its position, not its contents - and after the first list() it has already yielded everything and returned, so there is nothing left to walk.' },
        { label: '[]',
          level: 'strong',
          feedback: 'Right. The first list() exhausted it. A generator is a one-shot stream: once it has run to the end it is spent, so the second pass sees an empty stream. Rebuild it (call squares(4) again) to walk it twice.' },
        { label: 'raises StopIteration',
          level: 'wrong',
          feedback: 'list() consumes StopIteration internally - that signal is how it knows to stop, not an error it raises. An exhausted generator simply yields nothing, so list() hands back [].' },
      ],
    },
    explain: [
      {
        heading: 'Lazy: nothing runs until you pull',
        body: 'Calling squares(4) does not run the loop. It returns a generator object with the function frozen at the top. Each next() (which list(), for, sum() all call) resumes the function, runs to the next yield, hands back that one value, and freezes again. Values are produced one at a time, on demand.',
      },
      {
        heading: 'One-shot: position, not contents',
        body: 'A generator remembers its position in the code, not the sequence it produced. Once it has yielded the last value and the function returns, it is exhausted - future iterations see an empty stream. To walk it twice, either rebuild it (call squares(4) again) or materialise it once into a list.',
      },
      {
        heading: 'Flat memory is the payoff',
        body: 'Because only one value exists at a time, a generator over a million items costs roughly the same memory as one over ten. That is why (x for x in ...) and yield are the tools for streaming large data - you trade re-iterability for a memory footprint that does not grow with the data.',
      },
    ],
    mentalModel: 'A generator is a paused function you resume one yield at a time - lazy on the way in, exhausted on the way out.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'The second list(g) returns []. A generator is a one-shot stream: the first pass exhausts it, and it does not rewind.',
      why: 'Calling squares(4) does not run the loop - it returns a generator object with the function frozen at the top. Each next() (which list, for, and sum all call under the hood) resumes the frame, runs to the next yield, hands back one value, and freezes again. Values are produced on demand, one at a time.\n\nA generator remembers its POSITION in the code, not the sequence it produced. Once it has yielded the last value and the function returns, it is exhausted - every later iteration sees an empty stream. The payoff is flat memory: only one value exists at a time, so a generator over a million items costs about the same as one over ten. You trade re-iterability for a footprint that does not grow with the data.',
      commonMistake: 'Reusing a generator after it has been consumed - looping it once to find a max, then again to filter, and getting nothing the second time. **Weak pattern:** the candidate stores a generator in a variable and treats it like a list. **Interviewer follow-up:** "you need to iterate this twice - what do you do?" - rebuild it by calling the function again, or materialise it once with list().',
      interviewPhrase: '"A generator is lazy and one-shot - it yields values on demand and remembers its position, not its contents. Once I have walked it, it is exhausted. If I need it twice I rebuild it or pull it into a list; if I am streaming big data I keep it lazy for the flat memory."',
      connectsTo: ['gotchas', 'pandas'],
    },
    connectsTo: ['gotchas', 'python', 'pandas'],
  },

  // ───────────────────────── Scope & Closures ─────────────────────────
  {
    id: 'know-legb-and-closures',
    cluster: 'scope-closures',
    title: 'LEGB scope and the late-binding closure',
    subtitle: 'Why every lambda in a loop returns the same number.',
    difficulty: 'core',
    estimatedMin: 6,
    tags: ['scope', 'closures', 'legb', 'late-binding'],
    hook: 'You build three functions in a loop, each meant to return its own number. All three return 2. The closures did not capture the value you thought - they captured the variable.',
    demoCode: '# Name lookup walks Local -> Enclosing -> Global -> Built-in (LEGB).\n# A closure captures the VARIABLE, not the value at creation time.\ndef make_counter():\n    count = 0\n    def step():\n        nonlocal count      # reach into the enclosing scope to rebind\n        count += 1\n        return count\n    return step\n\nc = make_counter()\nprint(c(), c(), c())\n\n# Late binding: all three lambdas share the SAME i, read at call time.\nfuncs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])\n\n# Fix: bind the value NOW with a default argument.\nfuncs2 = [lambda i=i: i for i in range(3)]\nprint([f() for f in funcs2])',
    demoOutput: '1 2 3\n[2, 2, 2]\n[0, 1, 2]',
    predict: {
      question: 'funcs = [lambda: i for i in range(3)]. What does [f() for f in funcs] print?',
      options: [
        { label: '[0, 1, 2]',
          level: 'partial',
          feedback: 'This is the result you WANTED and what the default-argument fix produces - but not what this code does. These lambdas capture the variable i, not its value, so they all read i at call time, after the loop ended.' },
        { label: '[2, 2, 2]',
          level: 'strong',
          feedback: 'Right. All three lambdas close over the same variable i and read it when called, not when created. By call time the loop has finished and i is 2, so every lambda returns 2. Bind the value now with lambda i=i: i to freeze each one.' },
        { label: '[3, 3, 3]',
          level: 'wrong',
          feedback: 'Close on the late-binding idea but off by one. The loop variable stops at its last assigned value, 2 - range(3) never binds i to 3. So every lambda reads 2.' },
      ],
    },
    explain: [
      {
        heading: 'LEGB: how a name is resolved',
        body: 'When Python hits a name, it searches Local (this function), then Enclosing (any outer functions), then Global (module level), then Built-in. The first match wins. step() finds count in the enclosing make_counter frame - that frame survives as long as the closure does, which is how a "counter" keeps its state between calls.',
      },
      {
        heading: 'Closures capture variables, not values',
        body: 'The three lambdas all close over the same loop variable i. They do not snapshot i when created - they look it up when called. By the time you call them, the loop has finished and i is 2, so every lambda returns 2. This is "late binding": the value is read at call time, from the live variable.',
      },
      {
        heading: 'nonlocal vs the default-argument fix',
        body: 'nonlocal count lets step() rebind a name in the enclosing scope (without it, count += 1 would try to create a new local and crash). To freeze a loop value instead, give the lambda a default argument lambda i=i: i - default arguments are evaluated once, at definition time, so each lambda captures its own i right then.',
      },
    ],
    mentalModel: 'A closure remembers the variable, not the value - it reads it fresh on every call, so bind the value now if you need it frozen.',
    yourTurn: {
      prompt: 'Make result come out as [0, 1, 2] - each lambda should capture its OWN value, not the shared loop variable.',
      starter: 'funcs = [lambda: i for i in range(3)]\nresult = [f() for f in funcs]\nprint(result)',
      check: '__pl_pass = (result == [0, 1, 2])\n__pl_msg = ("Nailed it - each lambda froze its own value at definition time." if __pl_pass else "Still " + repr(result) + ": every lambda closes over the SAME variable i, which ends at 2. Freeze the value per iteration, e.g. lambda i=i: i.")',
      hint: 'A default argument is evaluated once, at definition time. lambda i=i: i snapshots i NOW instead of reading the live variable later.',
    },
    isFree: true,
    seniorRead: {
      shortAnswer: 'It prints [2, 2, 2]. The lambdas capture the variable i, not its value, and read it at call time - by then the loop has ended and i is 2.',
      why: 'Name resolution walks LEGB - Local, Enclosing, Global, Built-in - and the first match wins. A closure is a function that reaches into an enclosing scope; the key fact is that it captures the VARIABLE, not a snapshot of its value. The three lambdas all close over the one loop variable i and look it up when called, not when defined.\n\nThat is late binding: by the time you invoke them the loop has finished and i holds 2, so every lambda returns 2. The fix is a default argument - lambda i=i: i - because defaults are evaluated once at definition time, so each lambda freezes its own copy of i right then. The same mechanism is why nonlocal is needed for a closure to rebind (not just read) an enclosing name.',
      commonMistake: 'Building handlers or callbacks in a loop and expecting each to remember its iteration value. **Weak pattern:** the candidate "fixes" it by renaming the variable, which changes nothing. **Interviewer follow-up:** "why does i=i in the parameter list fix it?" - because default arguments bind at def-time, capturing the current value instead of the live variable.',
      interviewPhrase: '"A closure captures the variable, not the value - it reads it fresh at call time. All three lambdas share one i, so after the loop they all see 2. To freeze each value I bind it as a default argument, lambda i=i, which evaluates once at definition."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Truthiness ─────────────────────────
  {
    id: 'know-truthiness-or-default',
    yourTurn: {
      prompt: 'Fix greet so an empty string stays empty - fall back to "stranger" only when name is None.',
      starter: 'def greet(name):\n    name = name or "stranger"\n    return "Hi " + name\n\nprint(repr(greet("")), repr(greet(None)))',
      check: '__pl_pass = (greet("") == "Hi " and greet(None) == "Hi stranger")\n__pl_msg = ("Right - you default only on None now, so a valid empty value survives." if __pl_pass else "greet of the empty string gave " + repr(greet("")) + ". The or operator treats the empty string as falsy and replaces it. Default only on None: name if name is not None else the fallback.")',
      hint: 'or returns the first truthy operand, and "", 0, [] are all falsy - so a valid empty value gets replaced. Test against None explicitly.',
    },
    cluster: 'truthiness',
    title: 'Truthiness and the or-default trap',
    subtitle: 'Why name or "stranger" eats valid empty input.',
    difficulty: 'warmup',
    estimatedMin: 4,
    tags: ['truthiness', 'or', 'defaults', 'falsy'],
    hook: 'You write name or "stranger" to supply a fallback. It works - until a user passes an empty string or a count of 0, both of which are valid, and your code quietly throws them away.',
    demoCode: '# `or` returns the FIRST truthy operand, else the last - not a boolean.\n# Empty string, 0, [], {}, None all count as falsy.\ndef greet(name):\n    name = name or "stranger"\n    return "Hello, " + name\n\nprint(greet("Ada"))\nprint(greet(""))      # "" is falsy -> fallback fires (maybe wrong!)\nprint(greet(None))\n\ncount = 0\nprint("count or 10:", count or 10)   # 0 is falsy -> 10, even though 0 was real\n\n# Guard against None specifically, not "everything falsy":\nx = 0\nprint("explicit None check:", x if x is not None else 10)',
    demoOutput: 'Hello, Ada\nHello, stranger\nHello, stranger\ncount or 10: 10\nexplicit None check: 0',
    predict: {
      question: 'count = 0. What does (count or 10) evaluate to?',
      options: [
        { label: '0',
          level: 'wrong',
          feedback: 'This assumes or only swaps in the fallback when the left side is None. It does not - 0 is falsy, so or skips it and returns 10. That is exactly the bug: a real 0 gets discarded.' },
        { label: '10',
          level: 'strong',
          feedback: 'Right. or returns the first truthy operand, and 0 is falsy, so it falls through to 10 even though 0 was a legitimate value. If you only meant "replace None", test x if x is not None else 10.' },
        { label: 'True',
          level: 'wrong',
          feedback: 'or does not return a boolean - it returns one of its operands. count or 10 yields 10 (an int), never True. The boolean-ness only decides WHICH operand comes back.' },
      ],
    },
    explain: [
      {
        heading: 'What counts as falsy',
        body: 'Python treats more than just False as falsy: None, False, 0, 0.0, "", [], {}, set(), and any object whose __len__ returns 0. Everything else is truthy. So an empty string and a zero count are falsy - which is fine for a yes/no check but dangerous when 0 or "" is a legitimate value.',
      },
      {
        heading: 'or returns an operand, not a boolean',
        body: 'a or b does not return True/False. It returns a if a is truthy, otherwise b. That is what makes name or "stranger" read so naturally as a default. The bug is that it fires on ANY falsy input, so a real empty string gets replaced by the fallback.',
      },
      {
        heading: 'The fix: test what you actually mean',
        body: 'If "missing" means None specifically, test for None: x if x is not None else default. If you genuinely want "empty or missing", the or-default is correct. The trap is using or as a None-check when 0 / "" / [] are valid inputs you did not mean to discard.',
      },
    ],
    mentalModel: 'or returns the first truthy operand - so use it as a default only when every falsy value really should be replaced.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'count or 10 evaluates to 10. or returns the first truthy operand, and 0 is falsy, so the real 0 gets thrown away and the fallback fires.',
      why: 'Python treats a whole family of values as falsy: None, False, 0, 0.0, "", [], {}, set(), and any object whose __len__ is 0. The or operator does not return a boolean - it returns its first truthy operand, else the last one. That is what makes name or "stranger" read so naturally as a default.\n\nThe trap is that it fires on ANY falsy input, not just missing ones. A valid empty string, a count of 0, or an empty list all get silently replaced by the fallback. If "missing" really means None, test for None explicitly: x if x is not None else default. Reserve the or-default for cases where every falsy value genuinely should be swapped out.',
      commonMistake: 'Using or as a None-check when 0, "", or [] are legitimate inputs. **Weak pattern:** the candidate writes limit = limit or 100 and cannot explain why limit=0 turns into 100. **Interviewer follow-up:** "a user passes 0 on purpose - what happens, and how do you keep it?" - or discards it; guard with is not None instead.',
      interviewPhrase: '"x or default returns the first truthy operand, so it replaces every falsy value - 0, empty string, empty list - not just None. If 0 or an empty string is a valid input I check x is not None explicitly instead, so I do not silently eat real data."',
      connectsTo: ['gotchas', 'python', 'pandas'],
    },
    connectsTo: ['gotchas', 'python', 'pandas'],
  },

  // ───────────────────────── The Data Model ─────────────────────────
  {
    id: 'know-dunder-data-model',
    cluster: 'data-model',
    title: 'Dunder methods are the data model',
    subtitle: 'Why len(x) works on your own class once you add __len__.',
    difficulty: 'core',
    estimatedMin: 6,
    tags: ['dunder', 'protocols', 'data-model', 'len'],
    hook: 'len(), for, in, bool() are not features bolted onto built-in types. They are hooks. Define the right dunder method and your own class plugs straight into all of them.',
    demoCode: '# Built-in operations delegate to dunder ("double underscore") methods.\n# len(x) calls x.__len__(); iteration uses __getitem__ or __iter__;\n# bool(x) falls back to __len__ when there is no __bool__.\nclass Playlist:\n    def __init__(self, tracks):\n        self._tracks = tracks\n    def __len__(self):\n        return len(self._tracks)\n    def __getitem__(self, i):\n        return self._tracks[i]\n\np = Playlist(["a", "b", "c"])\nprint("len:", len(p))\nprint("truthy:", bool(p))         # no __bool__, so Python uses __len__\nprint("first:", p[0])             # __getitem__\nprint("iterates:", [t for t in p])\n\nempty = Playlist([])\nprint("empty is falsy:", bool(empty))   # __len__ == 0 -> falsy',
    demoOutput: 'len: 3\ntruthy: True\nfirst: a\niterates: [\'a\', \'b\', \'c\']\nempty is falsy: False',
    predict: {
      question: 'Playlist defines __len__ and __getitem__ but no __iter__. Does [t for t in p] work?',
      options: [
        { label: 'Yes - __getitem__ drives iteration',
          level: 'strong',
          feedback: 'Right. When there is no __iter__, Python falls back to the legacy protocol: it calls p[0], p[1], p[2]... until IndexError. So __getitem__ alone makes the object iterable.' },
        { label: 'No - needs __iter__',
          level: 'partial',
          feedback: 'For new code you SHOULD prefer __iter__ - but it is not required. Python keeps a legacy fallback that drives iteration off __getitem__ with integer indices, so this loop works as written.' },
        { label: 'No - raises TypeError',
          level: 'wrong',
          feedback: 'No TypeError here. The object is iterable via the __getitem__ fallback. You would get TypeError only if it had neither __iter__ nor __getitem__.' },
      ],
    },
    explain: [
      {
        heading: 'Built-ins delegate to dunders',
        body: 'len(x) is not magic - it calls type(x).__len__(x). Same story everywhere: x + y calls __add__, x[i] calls __getitem__, repr(x) calls __repr__, with x calls __enter__/__exit__. The "Python data model" is this set of named hooks. Implement them and your object behaves like a native one.',
      },
      {
        heading: 'bool() falls back to __len__',
        body: 'When you write if my_obj:, Python looks for __bool__. If there is none, it falls back to __len__ and treats length 0 as False, anything else as True. That is why an empty container is falsy automatically - and why a Playlist with no tracks is falsy without you writing a single comparison.',
      },
      {
        heading: 'The old iteration protocol',
        body: 'Iteration prefers __iter__, but if a class only has __getitem__, Python falls back to the legacy protocol: it calls p[0], p[1], p[2], ... until IndexError. That is why for t in p works here even without __iter__. For real classes, prefer __iter__ - but knowing the fallback explains a lot of "how does this even iterate?" code.',
      },
    ],
    mentalModel: 'Python operators and built-ins are syntax over dunder methods - implement the hook and your object joins the protocol.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'Yes - [t for t in p] works. With no __iter__, Python falls back to calling p[0], p[1]... until IndexError, so __getitem__ alone makes the object iterable.',
      why: 'Built-in operations are not bolted onto specific types - they delegate to named dunder methods. len(x) calls type(x).__len__(x); x + y calls __add__; x[i] calls __getitem__; with x calls __enter__/__exit__. The data model is exactly this set of hooks, and built-in types simply happen to define them.\n\nTruthiness rides the same machinery: with no __bool__, bool(x) falls back to __len__ and treats 0 as False, so an empty container is falsy for free. Iteration prefers __iter__, but a class with only __getitem__ still iterates via the legacy protocol - integer indexing from 0 until IndexError. That fallback is why this Playlist loops even without __iter__; for real classes you would still write __iter__ for clarity.',
      commonMistake: 'Thinking operators are hard-wired to int/str/list and cannot apply to custom classes. **Weak pattern:** the candidate writes a method called length() instead of __len__ and wonders why len(obj) fails. **Interviewer follow-up:** "make len() and a for loop work on your class" - the answer is define __len__ and either __iter__ or __getitem__.',
      interviewPhrase: '"Built-ins and operators are sugar over dunder methods - len calls __len__, for calls __iter__ or falls back to __getitem__, if calls __bool__ then __len__. Implement the right hook and my object behaves like a native type at the call site."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Evaluation Model (default args) ─────────────────────────
  {
    id: 'know-mutable-default-args',
    yourTurn: {
      prompt: 'Fix add so each call with no bucket starts EMPTY, instead of accumulating across calls.',
      starter: 'def add(x, bucket=[]):\n    bucket.append(x)\n    return bucket\n\nprint(add(1), add(2))',
      check: '__pl_pass = (add(1) == [1] and add(2) == [2])\n__pl_msg = ("Right - a fresh list every call." if __pl_pass else "A later call returned " + repr(add(2)) + ", not [2] - the default list is created once and shared. Use bucket=None, then build a new list inside.")',
      hint: 'Default arguments are evaluated ONCE at definition time and reused. Default to None and do: if bucket is None: bucket = [].',
    },
    cluster: 'evaluation-model',
    title: 'Default arguments are evaluated once',
    subtitle: 'Why a function with tags=[] remembers across calls.',
    difficulty: 'core',
    estimatedMin: 5,
    tags: ['defaults', 'mutation', 'def-time', 'closures'],
    hook: 'You give a parameter a fresh empty list as its default. You expect a fresh list every call. Instead the function accumulates - because that "default" was built exactly once, when the def line ran.',
    demoCode: '# A default value is evaluated ONCE, at def-time, and stored on the function.\n# A mutable default is therefore shared across every call that omits it.\ndef add_tag(tag, tags=[]):\n    tags.append(tag)\n    return tags\n\nprint(add_tag("urgent"))    # [\'urgent\']\nprint(add_tag("review"))    # [\'urgent\', \'review\']  <- same list!\n\n# Inspect the stored default object directly:\nprint("stored default:", add_tag.__defaults__)\n\n# Fix: use None as a sentinel and build the list inside the body.\ndef add_tag_safe(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\nprint(add_tag_safe("urgent"))   # [\'urgent\']\nprint(add_tag_safe("review"))   # [\'review\']',
    demoOutput: '[\'urgent\']\n[\'urgent\', \'review\']\nstored default: ([\'urgent\', \'review\'],)\n[\'urgent\']\n[\'review\']',
    predict: {
      question: 'add_tag has tags=[]. After add_tag("a") then add_tag("b"), the second call returns?',
      options: [
        { label: '[\'b\']',
          level: 'wrong',
          feedback: 'This assumes each call gets a fresh list. It does not. The default [] was built once at def-time and is reused by every call that omits tags, so "a" is still in it.' },
        { label: '[\'a\', \'b\']',
          level: 'strong',
          feedback: 'Right. The default list is created once when the def line runs and shared across calls, so appends accumulate. Use tags=None and build the list inside the body to get a fresh one each time.' },
        { label: 'raises an error',
          level: 'wrong',
          feedback: 'No error - appending to the shared default is perfectly valid. The bug is silent accumulation, not a crash; you can even watch the list grow in add_tag.__defaults__.' },
      ],
    },
    explain: [
      {
        heading: 'Def-time, not call-time',
        body: 'When Python runs the def line, it evaluates each default expression once and stashes the results on the function object (in __defaults__). tags=[] builds one list right then. Every later call that omits tags reuses that same stored list - so appends accumulate across calls, and you can even see the growing list in add_tag.__defaults__.',
      },
      {
        heading: 'Why only mutable defaults bite',
        body: 'A default of 0 or "x" or None is shared too, but you can never mutate it in place, so sharing is invisible. The trap is mutable defaults - [], {}, set(), and things like a pandas DataFrame - because appending or assigning into them changes the one shared object everyone sees.',
      },
      {
        heading: 'The None sentinel',
        body: 'The fix is a reflex: default to None, then build the real object inside the body. Now each call that omits the argument gets its own fresh list. Use `is None` (not `or`) for the check, so a caller can still pass an intentionally empty list.',
      },
    ],
    mentalModel: 'A default value is created once at def-time and lives on the function - so make mutable defaults None and build them in the body.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'The second call returns [\'a\', \'b\']. The default [] is built once at def-time and shared across every call that omits the argument, so appends accumulate.',
      why: 'When Python executes the def line, it evaluates each default expression once and stores the results on the function object in __defaults__. tags=[] builds one list right then, and every later call that omits tags reuses that same stored list - which is why you can literally watch it grow in add_tag.__defaults__.\n\nOnly mutable defaults bite. A default of 0 or "x" is shared too, but you can never mutate it in place, so the sharing is invisible. Lists, dicts, sets - and things like a DataFrame - are the trap, because appending or assigning into them changes the one object everyone sees. The fix is a reflex: default to None, then build the real object inside the body, using is None (not or) so a caller can still pass a deliberately empty list.',
      commonMistake: 'Writing def f(items=[]) or def f(cache={}) and being surprised state leaks between calls. **Weak pattern:** the candidate "fixes" it by clearing the list at the top of the function, which mutates the shared default differently but does not stop the sharing. **Interviewer follow-up:** "why None and not or?" - because or would also override an intentionally-empty list a caller passed.',
      interviewPhrase: '"Default arguments are evaluated once, at def-time, and stored on the function - so a mutable default like [] is shared across every call and accumulates. I default to None and build the list inside the body, checking is None so an empty list a caller passes still works."',
      connectsTo: ['gotchas', 'python', 'pandas'],
    },
    connectsTo: ['gotchas', 'python', 'pandas'],
  },

  // ───────────────────────── Objects & Identity (more) ─────────────────────────
  {
    id: 'know-is-vs-equals', cluster: 'objects-identity',
    title: 'is vs == and the caches that lie',
    subtitle: 'Why 256 is 256 but 1000 might not be.',
    difficulty: 'warmup', estimatedMin: 5,
    tags: ['identity', 'equality', 'interning', 'is'],
    hook: 'You test two values with `is` and it returns True, so you start using it everywhere. Then one day equal numbers compare False - because `is` was never checking equality, and a hidden cache had been covering for you.',
    demoCode: '# `is` compares IDENTITY (same object?); `==` compares VALUE (equal?).\n# CPython caches small ints (-5..256) and interns some short strings,\n# so `is` sometimes returns True by accident - never rely on it for values.\na = [1, 2, 3]\nb = [1, 2, 3]\nprint("== (value):", a == b)\nprint("is (identity):", a is b)\n\n# Small-int cache: 256 is reused, so both names point at one object.\nx = 256\ny = 256\nprint("256 is 256:", x is y)\n\n# Outside the cache, equal ints can be distinct objects.\nm = 1000\nn = 1000\nprint("1000 == 1000:", m == n)\n\n# The reliable test for "is it None" is `is`, because None is a singleton.\nv = None\nprint("v is None:", v is None)\n',
    demoOutput: '== (value): True\nis (identity): False\n256 is 256: True\n1000 == 1000: True\nv is None: True',
    predict: {
      question: 'x = 256; y = 256. What does (x is y) return in CPython?',
      options: [
        { label: 'True - small ints are cached',
          level: 'strong',
          feedback: 'Right. CPython pre-builds the ints -5..256 and reuses them, so both names point at the one cached object and is returns True. This is a cache artifact, not is working on values - 1000 is 1000 can be False.' },
        { label: 'False - separate objects',
          level: 'partial',
          feedback: 'This is the correct mental model for is in general - distinct literals are distinct objects - but 256 is the exception. It falls inside CPython\'s small-int cache (-5..256), so both names share one object and is is True.' },
        { label: 'Depends on the run',
          level: 'wrong',
          feedback: 'For 256 it is deterministic: the small-int cache is built at interpreter startup every time, so x is y is reliably True. The "do not rely on it" caution is about values OUTSIDE the cache, like 1000, not about randomness.' },
      ],
    },
    explain: [
      {
        heading: 'Two different questions',
        body: '`is` asks "are these the SAME object in memory?" - same identity, the thing id() would report. `==` asks "do these have equal VALUE?", which calls __eq__. Two lists built separately are == (equal contents) but not `is` (distinct objects). Confusing them is one of the most common Python bugs.',
      },
      {
        heading: 'The small-int and intern caches',
        body: 'CPython pre-builds the integers -5 through 256 and reuses them, so 256 is 256 is True - not because `is` works on values, but because both names happen to point at the one cached object. Larger ints like 1000 are not cached, so equal copies can be distinct objects. Some short strings are "interned" the same way. These caches are an optimization detail, not a guarantee you can build on.',
      },
      {
        heading: 'When is is correct',
        body: 'Use `is` only for singletons: `x is None`, `x is True`, `x is False`. None is a single object that exists exactly once, so identity IS the right test. For every value comparison - numbers, strings, lists - use `==`.',
      },
    ],
    mentalModel: '`is` checks identity, `==` checks value - the int and string caches sometimes make `is` look like `==`, so trust it only for None.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'x is y is True for 256 - but only because CPython caches small ints (-5..256). It is an identity coincidence from the cache, not is checking equality.',
      why: 'is asks "the same object in memory?" - the identity id() reports. == asks "equal value?", which calls __eq__. Two lists built separately are == (equal contents) but not is (distinct objects). Confusing the two is one of the most common Python bugs.\n\nThe caches are what make is look deceptively like ==. CPython pre-builds the integers -5 through 256 and reuses them, and interns some short strings, so 256 is 256 and "ab" is "ab" can be True - not because is works on values, but because both names happen to point at one cached object. Step outside the cache (1000, longer strings) and equal copies are distinct objects. These caches are an optimization detail, never a guarantee. The one place is is correct is singletons: x is None, x is True, x is False.',
      commonMistake: 'Using is to compare values because it "worked" on small numbers during testing. **Weak pattern:** the candidate writes if status is "active" and it passes locally, then fails in production on a non-interned string. **Interviewer follow-up:** "when is `is` the right operator?" - only for singletons like None, never for value comparison.',
      interviewPhrase: '"is checks identity, == checks value. Small ints and some strings are cached, so is can look like == by accident - but I only trust is for singletons like None. For comparing actual values I always use ==."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Truthiness (more) ─────────────────────────
  {
    id: 'know-bool-len-fallback', cluster: 'truthiness',
    title: 'How if obj: decides truth',
    subtitle: '__bool__, then __len__, then default True.',
    difficulty: 'core', estimatedMin: 5,
    tags: ['truthiness', 'bool', 'len', 'data-model'],
    hook: 'You write if cart: meaning "if the cart has items". For your own class that works only because Python has a precise fallback chain for deciding truth - and if you do not provide a hook, every instance is considered true.',
    demoCode: '# `if obj:` does not check "is it None". It asks the object for its truth\n# value: Python calls __bool__ if defined, else __len__, else defaults to True.\nclass Cart:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)        # no __bool__, so truthiness uses this\n\nfull = Cart(["a", "b"])\nempty = Cart([])\nprint("full truthy:", bool(full))\nprint("empty truthy:", bool(empty))   # __len__ == 0 -> False\n\n# __bool__ wins over __len__ when both exist.\nclass Always:\n    def __len__(self):\n        return 0                       # would say falsy...\n    def __bool__(self):\n        return True                    # ...but __bool__ overrides\nprint("len 0 but bool True:", bool(Always()))\n\n# A plain object with neither dunder is always truthy.\nclass Blank:\n    pass\nprint("no dunders:", bool(Blank()))\n',
    demoOutput: 'full truthy: True\nempty truthy: False\nlen 0 but bool True: True\nno dunders: True',
    predict: {
      question: 'A class defines __len__ returning 0 and no __bool__. Is an instance truthy?',
      options: [
        { label: 'True',
          level: 'wrong',
          feedback: 'A plain object with no truth hooks is True - but this one has __len__. With no __bool__, Python falls back to __len__, and length 0 means False.' },
        { label: 'False',
          level: 'strong',
          feedback: 'Right. No __bool__, so Python consults __len__, and 0 reads as False. That fallback is exactly why an empty list or dict is falsy for free.' },
        { label: 'raises TypeError',
          level: 'wrong',
          feedback: 'Truth-testing never raises here - the lookup chain (bool, then len, then default True) always resolves to a boolean. __len__ returning 0 is a clean False, not an error.' },
      ],
    },
    explain: [
      {
        heading: 'The truth-value lookup order',
        body: 'When Python needs a boolean from an object (if obj, while obj, bool(obj), or/and), it asks in a fixed order: call __bool__ if defined; else call __len__ and treat 0 as False, nonzero as True; else - no __bool__ and no __len__ - default to True. That chain is why an empty list/dict/set is falsy (their __len__ is 0) for free.',
      },
      {
        heading: '__bool__ overrides __len__',
        body: 'When BOTH exist, __bool__ wins. The Always demo has __len__ returning 0 (which alone would say falsy) but a __bool__ returning True, so the object is truthy. This lets you decouple "is this empty?" from "should this count as true?" when they are not the same question.',
      },
      {
        heading: 'Plain objects are always truthy',
        body: 'A class with neither __bool__ nor __len__ - like Blank - is ALWAYS truthy, even with no data. So if obj on a custom object tests "is it not None and not a special falsy type", not "does it have contents", unless you implement one of the hooks. This is a common source of "my empty object is still true" confusion.',
      },
    ],
    mentalModel: 'Truth-testing asks __bool__, then __len__ (0 is false), then defaults to True - so a custom object is truthy unless you give it one of those hooks.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'The instance is falsy. With no __bool__, Python falls back to __len__, and a length of 0 reads as False.',
      why: 'When Python needs a boolean from an object - if obj, while obj, bool(obj), or/and - it asks in a fixed order: call __bool__ if defined; else call __len__ and treat 0 as False and nonzero as True; else, with neither hook, default to True. That chain is why empty lists, dicts, and sets are falsy for free - their __len__ is 0.\n\nTwo consequences follow. When BOTH hooks exist, __bool__ wins, which lets you decouple "is this empty?" from "should this count as true?" when they differ. And a plain class with neither hook is ALWAYS truthy, even with no data - so if obj on a bare custom object tests "not None and not a special falsy type", not "has contents". That is a frequent source of "my empty object is still true" confusion.',
      commonMistake: 'Writing if my_obj: on a custom class and expecting it to mean "has data" without implementing __len__ or __bool__. **Weak pattern:** the candidate adds a count attribute and checks if obj instead of if obj.count. **Interviewer follow-up:** "what does Python check, in order, to decide truthiness?" - __bool__, then __len__ with 0 as False, then default True.',
      interviewPhrase: '"Truth-testing asks __bool__ first, then __len__ where 0 is False, then defaults to True. So an empty container is falsy for free, but a plain object with no hooks is always truthy - if I want if obj to mean has-data, I implement __len__ or __bool__."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── The Data Model (more) ─────────────────────────
  {
    id: 'know-operator-dispatch',
    yourTurn: {
      prompt: 'Make Vector support + so Vector(1, 2) + Vector(3, 4) == Vector(4, 6). Define the dunder Python calls for +.',
      starter: 'class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n\nr = Vector(1, 2) + Vector(3, 4)\nprint(r.x, r.y)',
      check: '__pl_pass = ((Vector(1, 2) + Vector(3, 4)) == Vector(4, 6))\n__pl_msg = ("Right - a + b dispatches to __add__." if __pl_pass else "Vector + Vector did not work - Python looks for __add__ and there is none. Add def __add__(self, other): return Vector(self.x + other.x, self.y + other.y).")',
      hint: 'a + b calls type(a).__add__(a, b). Return a new Vector with the summed components.',
    }, cluster: 'data-model',
    title: 'Operators dispatch to dunders',
    subtitle: 'x + y is really x.__add__(y).',
    difficulty: 'core', estimatedMin: 6,
    tags: ['operators', 'dunder', 'data-model', 'overloading'],
    hook: 'You assume + only works on numbers and strings because those are "built in". But + is not built into the types - it is a call to __add__. Give your own class that method and + works on it too.',
    demoCode: '# Operators are syntax over dunder methods. x + y tries x.__add__(y);\n# x in c tries c.__contains__(x); c[k] tries c.__getitem__(k).\nclass Money:\n    def __init__(self, cents):\n        self.cents = cents\n    def __add__(self, other):\n        return Money(self.cents + other.cents)\n    def __repr__(self):\n        return "Money(" + str(self.cents) + ")"\n\nprint("add:", Money(150) + Money(50))\n\nclass Shelf:\n    def __init__(self, items):\n        self.items = items\n    def __contains__(self, x):\n        return x in self.items\n    def __getitem__(self, i):\n        return self.items[i]\n\ns = Shelf(["milk", "eggs"])\nprint("contains:", "milk" in s)\nprint("index:", s[1])\n',
    demoOutput: 'add: Money(200)\ncontains: True\nindex: eggs',
    predict: {
      question: 'Money defines __add__. What does Money(150) + Money(50) produce?',
      options: [
        { label: 'a TypeError',
          level: 'wrong',
          feedback: 'No error - + is not restricted to built-in types. It dispatches to __add__, which Money defines, so the operation is valid.' },
        { label: 'Money(200)',
          level: 'strong',
          feedback: 'Right. x + y calls x.__add__(y), and this __add__ returns a new Money with the summed cents. The operator does whatever your method builds and returns - here, Money(200).' },
        { label: '200',
          level: 'wrong',
          feedback: 'The sum 200 is the cents value, but __add__ here wraps it: it returns Money(self.cents + other.cents), a Money object, not a bare int. The result is whatever the method returns.' },
      ],
    },
    explain: [
      {
        heading: 'Every operator has a dunder',
        body: 'Python operators are syntax over method calls. x + y tries x.__add__(y); x - y tries __sub__; x == y tries __eq__; x[k] tries __getitem__; x in c tries c.__contains__(x); len(x) calls __len__. The interpreter does not special-case int or str - it dispatches to these methods, and built-in types just happen to define them.',
      },
      {
        heading: 'Implement the hook, join the protocol',
        body: 'Define __add__ on Money and the + operator works on Money instances, returning whatever you build. Define __contains__ and __getitem__ on Shelf and `in` and indexing both work. Your class becomes indistinguishable from a built-in at the call site - that is operator overloading, and it is just method definition.',
      },
      {
        heading: 'Reflected and fallback methods',
        body: 'If x.__add__(y) returns NotImplemented (or x has no __add__), Python tries the reflected y.__radd__(x). For containment, if there is no __contains__ it falls back to iterating with __iter__ or __getitem__. The data model is a layered set of fallbacks, not a single hard-coded behavior.',
      },
    ],
    mentalModel: 'Operators and built-ins are sugar for dunder calls - implement __add__, __contains__, __getitem__ and your object speaks the same syntax as native types.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'It produces Money(200). x + y dispatches to x.__add__(y), and this __add__ returns a new Money with the summed cents.',
      why: 'Python operators are syntax over method calls. x + y tries x.__add__(y); x - y tries __sub__; x == y tries __eq__; x[k] tries __getitem__; x in c tries c.__contains__(x). The interpreter does not special-case int or str - it dispatches to these methods, and built-in types just happen to define them. Define __add__ on your class and + works on it, returning whatever you build.\n\nThe dispatch is layered with fallbacks. If x.__add__(y) returns NotImplemented (or x has no __add__), Python tries the reflected y.__radd__(x). For containment, with no __contains__ it falls back to iterating via __iter__ or __getitem__. So operator overloading is not a special feature - it is ordinary method definition plus a well-defined fallback chain.',
      commonMistake: 'Believing operator overloading is a separate language feature rather than method definition. **Weak pattern:** the candidate names a method add() and is surprised + does not call it. **Interviewer follow-up:** "your left operand does not know how to add the right one - what happens?" - Python tries the right operand\'s __radd__ before giving up with TypeError.',
      interviewPhrase: '"Operators are sugar for dunder calls - x + y is x.__add__(y), x in c is c.__contains__(x). I implement the hook and my class uses native syntax. If the left side returns NotImplemented, Python tries the right side\'s reflected method before raising."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Functions & Decorators ─────────────────────────
  {
    id: 'know-args-kwargs-binding', cluster: 'functions',
    title: 'How *args and **kwargs bind',
    subtitle: 'Where the extra positional and keyword arguments go.',
    difficulty: 'warmup', estimatedMin: 5,
    tags: ['args', 'kwargs', 'unpacking', 'signatures'],
    hook: 'You see *args and **kwargs in every wrapper and decorator and treat them as magic. They are not - they are just the two buckets Python pours leftover positional and keyword arguments into, and a star can also force callers to be explicit.',
    demoCode: '# *args collects extra POSITIONAL args into a tuple;\n# **kwargs collects extra KEYWORD args into a dict.\ndef trace(a, b, *args, **kwargs):\n    print("a:", a)\n    print("b:", b)\n    print("args:", args)\n    print("kwargs:", kwargs)\n\ntrace(1, 2, 3, 4, mode="fast", retries=2)\n\n# A bare * forces the args after it to be keyword-only.\ndef connect(host, *, timeout):\n    return host + ":" + str(timeout)\n\nprint(connect("db", timeout=30))\n\n# Unpacking AT the call site is the mirror image of collecting.\nparts = (10, 20)\nopts = {"mode": "fast"}\ndef f(x, y, mode="slow"):\n    return (x, y, mode)\nprint(f(*parts, **opts))\n',
    demoOutput: 'a: 1\nb: 2\nargs: (3, 4)\nkwargs: {\'mode\': \'fast\', \'retries\': 2}\ndb:30\n(10, 20, \'fast\')',
    predict: {
      question: 'def f(a, b, *args): ... ; you call f(1, 2, 3, 4). What is args?',
      options: [
        { label: '[3, 4]',
          level: 'partial',
          feedback: 'Right contents, wrong type. *args collects leftover positionals into a TUPLE, not a list - so it is (3, 4). The distinction matters when you forward or compare it.' },
        { label: '(3, 4)',
          level: 'strong',
          feedback: 'Right. a and b fill first with 1 and 2; *args scoops the remaining positionals into a tuple, (3, 4). That tuple is what lets a wrapper forward an arbitrary call untouched.' },
        { label: '{3: 4}',
          level: 'wrong',
          feedback: 'That is what **kwargs would build from KEYWORD args - a dict. *args handles positional leftovers and packs them into a tuple, (3, 4). The two stars collect different kinds of argument.' },
      ],
    },
    explain: [
      {
        heading: 'Two buckets for the leftovers',
        body: 'When Python binds arguments to parameters, named parameters fill first. *args then scoops up any REMAINING positional arguments into a tuple; **kwargs scoops up any remaining KEYWORD arguments into a dict. That is the whole mechanism - it is how one wrapper can forward an arbitrary call to another function untouched.',
      },
      {
        heading: 'A bare * makes things keyword-only',
        body: 'A lone * in the signature (def connect(host, *, timeout)) marks every parameter after it as keyword-only: callers MUST write timeout=30, never a bare positional. This is how libraries stop you from passing options in the wrong order by accident.',
      },
      {
        heading: 'Collecting vs unpacking',
        body: 'In a definition, * and ** COLLECT many arguments into one tuple/dict. At a call site they do the reverse: f(*parts, **opts) UNPACKS a tuple into positional slots and a dict into keyword slots. Same symbols, mirror-image jobs depending on which side of the call you are on.',
      },
    ],
    mentalModel: '*args is the tuple of leftover positionals, **kwargs the dict of leftover keywords - and the same stars unpack a sequence/mapping back into a call.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'args is the tuple (3, 4). a and b fill first; *args scoops the remaining positional arguments into a tuple.',
      why: 'When Python binds arguments to parameters, named parameters fill first. *args then collects any REMAINING positional arguments into a tuple, and **kwargs collects any remaining keyword arguments into a dict. That is the whole mechanism - and it is how one wrapper forwards an arbitrary call to another function untouched.\n\nTwo refinements matter in practice. A bare * in a signature - def connect(host, *, timeout) - makes every parameter after it keyword-only, so callers must write timeout=30 and cannot pass it by position. And the same stars reverse at the call site: in a definition * and ** COLLECT many arguments into one tuple/dict, while f(*parts, **opts) UNPACKS a tuple into positional slots and a dict into keyword slots. Same symbols, mirror-image jobs.',
      commonMistake: 'Treating *args as a list, or not knowing that bare * forces keyword-only arguments. **Weak pattern:** the candidate tries args.append(x) and hits an AttributeError because tuples are immutable. **Interviewer follow-up:** "how do you force a caller to name an argument?" - put a bare * before it in the signature.',
      interviewPhrase: '"*args is the tuple of leftover positionals, **kwargs the dict of leftover keywords - that is how a wrapper forwards any call. The same stars unpack at the call site, and a bare * makes everything after it keyword-only."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-decorators-from-scratch', cluster: 'functions',
    title: 'A decorator is just deco(func)',
    subtitle: 'Demystifying the @ line by writing it longhand.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['decorators', 'higher-order', 'functions'],
    hook: 'Decorators feel like framework magic until you see the one-line truth: @deco above a def is nothing more than func = deco(func). Once that clicks, every decorator you have ever used stops being mysterious.',
    demoCode: '# @deco above a function is EXACTLY  greet = deco(greet).\n# A decorator takes a function and returns a (usually wrapping) function.\ndef announce(func):\n    def wrapper(*args, **kwargs):\n        print("calling", func.__name__)\n        result = func(*args, **kwargs)\n        print("done")\n        return result\n    return wrapper\n\n@announce\ndef greet(name):\n    return "hi " + name\n\n# The @ line did nothing magic: greet is now the wrapper.\nprint(greet("ada"))\n\n# Prove the equivalence by hand, with no @ syntax at all:\ndef add(x, y):\n    return x + y\nadd = announce(add)\nprint(add(2, 3))\n',
    demoOutput: 'calling greet\ndone\nhi ada\ncalling add\ndone\n5',
    predict: {
      question: '@announce above def greet(...) is equivalent to which line?',
      options: [
        { label: 'greet = announce(greet)',
          level: 'strong',
          feedback: 'Right. @deco is pure sugar for func = deco(func) run right after the def. The name greet now points at whatever announce returned - the wrapper.' },
        { label: 'announce = greet(announce)',
          level: 'wrong',
          feedback: 'Backwards. The decorator is the function being CALLED with greet as its argument, not the other way round. It is greet = announce(greet) - announce receives greet and returns its replacement.' },
        { label: 'greet = greet(announce)',
          level: 'wrong',
          feedback: 'This calls greet (the undecorated function) on announce, which is not what @ does. @announce calls announce(greet) and rebinds the name greet to the result.' },
      ],
    },
    explain: [
      {
        heading: 'Functions are values',
        body: 'In Python a function is an ordinary object you can pass around and return. A decorator is just a function that takes a function and returns another function - usually a wrapper that runs some code before and after calling the original.',
      },
      {
        heading: 'The @ line is pure sugar',
        body: '@announce written above def greet is exactly greet = announce(greet), run right after the def. After that line, the name greet no longer points at your original function - it points at whatever announce returned (the wrapper). The demo proves it by decorating add(x, y) by hand with no @ at all.',
      },
      {
        heading: 'Why *args/**kwargs in the wrapper',
        body: 'The wrapper accepts *args, **kwargs so it can forward ANY call to the wrapped function unchanged, whatever its signature. This is why nearly every real decorator wraps with def wrapper(*args, **kwargs): - it has to relay arguments it does not know in advance.',
      },
    ],
    mentalModel: 'A decorator is a function-of-a-function; @deco just rebinds the name to deco(func), so the wrapper takes the original name.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'It is equivalent to greet = announce(greet). @deco is pure sugar: it calls the decorator with the function and rebinds the name to the result.',
      why: 'In Python a function is an ordinary object you can pass around and return. A decorator is just a function that takes a function and returns another function - usually a wrapper that runs code before and after calling the original. @announce written above def greet is exactly greet = announce(greet), executed right after the def.\n\nAfter that line the name greet no longer points at your original function - it points at whatever announce returned, the wrapper. The wrapper accepts *args, **kwargs precisely so it can forward ANY call to the wrapped function unchanged, whatever its signature. That is why nearly every real decorator wraps with def wrapper(*args, **kwargs) - it has to relay arguments it does not know in advance.',
      commonMistake: 'Treating decorators as framework magic instead of a function call. **Weak pattern:** the candidate cannot say what @app.route actually does to the function below it. **Interviewer follow-up:** "rewrite this decorated function without the @ syntax" - assign func = deco(func) by hand, which is all @ ever did.',
      interviewPhrase: '"A decorator is just a function that takes a function and returns one. @announce above def greet is literally greet = announce(greet) - the name now points at the wrapper. The wrapper takes *args/**kwargs so it can forward any call unchanged."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-functools-wraps',
    yourTurn: {
      prompt: 'Fix the decorator so greet.__name__ stays "greet" instead of "wrapper".',
      starter: 'import functools\n\ndef log(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@log\ndef greet(name):\n    return "Hi " + name\n\nprint(greet.__name__)',
      check: '__pl_pass = (greet.__name__ == "greet")\n__pl_msg = ("Right - @wraps copied the metadata, so greet stays greet." if __pl_pass else "greet.__name__ is " + repr(greet.__name__) + " - the wrapper replaced the function and its identity. Add @functools.wraps(func) above def wrapper.")',
      hint: 'A decorator replaces the function with the wrapper, so __name__ and __doc__ become the wrapper. functools.wraps(func) copies them across.',
    }, cluster: 'functions',
    title: 'functools.wraps and the lost identity',
    subtitle: 'Why your decorated function forgets its own name.',
    difficulty: 'core', estimatedMin: 5,
    tags: ['decorators', 'functools', 'metadata', 'introspection'],
    hook: 'You add a decorator, then later print func.__name__ for logging and it says "wrapper". Your docstrings vanish too. The decorator did its job - it just replaced your function with the wrapper, identity and all.',
    demoCode: 'import functools\n\n# A naive decorator REPLACES the function, so the wrapper identity leaks out:\n# the wrapper name and docstring show up instead of the original ones.\ndef naive(func):\n    def wrapper(*a, **k):\n        return func(*a, **k)\n    return wrapper\n\n@naive\ndef parse(text):\n    "Parse a row into fields."\n    return text.split(",")\n\nprint("naive name:", parse.__name__)\nprint("naive doc :", parse.__doc__)\n\n# functools.wraps copies the original metadata onto the wrapper.\ndef clean(func):\n    @functools.wraps(func)\n    def wrapper(*a, **k):\n        return func(*a, **k)\n    return wrapper\n\n@clean\ndef parse2(text):\n    "Parse a row into fields."\n    return text.split(",")\n\nprint("wraps name:", parse2.__name__)\nprint("wraps doc :", parse2.__doc__)\n',
    demoOutput: 'naive name: wrapper\nnaive doc : None\nwraps name: parse2\nwraps doc : Parse a row into fields.',
    predict: {
      question: 'A naive decorator wraps parse(). What does parse.__name__ print afterwards?',
      options: [
        { label: '\'parse\'',
          level: 'wrong',
          feedback: 'Only if the decorator used functools.wraps. A naive one does not, so the name reflects the wrapper, not the original - you get \'wrapper\'.' },
        { label: '\'wrapper\'',
          level: 'strong',
          feedback: 'Right. @deco rebound the name to the inner wrapper function, so its metadata - __name__, __doc__ - leaks out. functools.wraps copies the original\'s metadata back to fix this.' },
        { label: 'raises AttributeError',
          level: 'wrong',
          feedback: '__name__ always exists on a function, so there is no error - it just reports the wrong name, \'wrapper\'. The failure is silent and cosmetic until logging or docs depend on it.' },
      ],
    },
    explain: [
      {
        heading: 'The wrapper overwrites the original',
        body: 'Because @deco rebinds the name to the wrapper, every bit of metadata you read from that name - __name__, __doc__, __module__, the signature - now describes the WRAPPER, not your function. Logging, help(), and debuggers all see "wrapper" and an empty docstring. The original identity is still inside the closure, but the public name no longer reflects it.',
      },
      {
        heading: 'What wraps copies over',
        body: 'functools.wraps(func) is itself a decorator you apply to the wrapper. It copies the wrapped functions __name__, __doc__, __module__, __qualname__, and __dict__ onto the wrapper, and records __wrapped__ pointing back at the original. After that, introspection sees the real function again.',
      },
      {
        heading: 'Why it matters in practice',
        body: 'Test runners, API frameworks, and structured logging key off function names and docstrings. A decorator without @wraps quietly degrades all of them - error messages point at "wrapper", auto-generated docs go blank. Treat @functools.wraps as mandatory boilerplate on every decorator you write.',
      },
    ],
    mentalModel: 'A wrapper hides the originals name and docstring; functools.wraps copies that metadata back so the decorated function still looks like itself.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'parse.__name__ prints \'wrapper\'. The decorator rebound the name to its inner wrapper, so all the metadata now describes the wrapper, not parse.',
      why: 'Because @deco rebinds the name to the wrapper, every bit of metadata read from that name - __name__, __doc__, __module__, the signature - now describes the WRAPPER, not your function. Logging, help(), and debuggers all see "wrapper" and an empty docstring. The original identity still lives inside the closure, but the public name no longer reflects it.\n\nfunctools.wraps(func) is itself a decorator you apply to the wrapper. It copies the wrapped function\'s __name__, __doc__, __module__, __qualname__, and __dict__ onto the wrapper and sets __wrapped__ back to the original, so introspection sees the real function again. Test runners, API frameworks, and structured logging all key off names and docstrings, so treat @functools.wraps as mandatory boilerplate on every decorator.',
      commonMistake: 'Writing a decorator without @functools.wraps and then debugging why logs and auto-docs all say "wrapper". **Weak pattern:** the candidate writes a working decorator but cannot say what wraps does or why it is needed. **Interviewer follow-up:** "your error logs point at \'wrapper\' for every decorated route - why, and how do you fix it?" - the wrapper overwrote the metadata; add @functools.wraps(func).',
      interviewPhrase: '"A decorator replaces the function with its wrapper, so __name__ and __doc__ leak as \'wrapper\' and break logging and docs. I always put @functools.wraps(func) on the wrapper - it copies the real metadata back so the decorated function still looks like itself."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Iteration & Context Managers ─────────────────────────
  {
    id: 'know-iterator-protocol',
    yourTurn: {
      prompt: 'Make Countdown iterable so list(Countdown(3)) == [3, 2, 1]. Implement the protocol.',
      starter: 'class Countdown:\n    def __init__(self, n):\n        self.n = n\n\nprint(list(Countdown(3)))',
      check: '__pl_pass = (list(Countdown(3)) == [3, 2, 1])\n__pl_msg = ("Right - Countdown yields 3, 2, 1." if __pl_pass else "Did not get [3, 2, 1] - Countdown is not iterable yet. Add __iter__, e.g. def __iter__(self): return iter(range(self.n, 0, -1)).")',
      hint: 'for and list() call __iter__ to get an iterator. Simplest: def __iter__(self): return iter(range(self.n, 0, -1)).',
    }, cluster: 'iteration',
    title: 'The iterator protocol behind for',
    subtitle: 'for is iter() plus next() until StopIteration.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['iterators', 'protocol', 'stopiteration', 'for'],
    hook: 'A for loop looks like it walks an index from 0 upward. It does not. It asks the object for an iterator, then politely calls next() over and over until the object raises StopIteration to say "I am done".',
    demoCode: '# `for` does not loop by index. It calls iter(obj) once, then next(it)\n# repeatedly until StopIteration is raised. That is the iterator protocol.\nclass CountDown:\n    def __init__(self, start):\n        self.n = start\n    def __iter__(self):\n        return self           # I am my own iterator\n    def __next__(self):\n        if self.n <= 0:\n            raise StopIteration\n        self.n -= 1\n        return self.n + 1\n\nprint("loop:", [x for x in CountDown(3)])\n\n# Drive the protocol by hand to see the machine:\nit = iter([10, 20])\nprint(next(it))\nprint(next(it))\ntry:\n    next(it)\nexcept StopIteration:\n    print("exhausted")\n',
    demoOutput: 'loop: [3, 2, 1]\n10\n20\nexhausted',
    predict: {
      question: 'How does an iterator signal that there are no more values?',
      options: [
        { label: 'returns None',
          level: 'wrong',
          feedback: 'None would collide with real data - an iterator yielding None values would look "done" on every element. Python uses an exception, StopIteration, so any value including None can be a legitimate result.' },
        { label: 'raises StopIteration',
          level: 'strong',
          feedback: 'Right. __next__ raises StopIteration to mean "exhausted", and for/list/sum catch it silently. Using an exception keeps the return channel free for any real value, with no sentinel to clash with your data.' },
        { label: 'returns -1',
          level: 'wrong',
          feedback: 'A sentinel like -1 is a C-style idiom, not Python\'s. -1 is a perfectly valid value to yield, so it cannot mean "done". The protocol raises StopIteration instead.' },
      ],
    },
    explain: [
      {
        heading: 'iter() then next(), repeatedly',
        body: 'for x in obj desugars to: it = iter(obj); then loop calling next(it) and binding x, until next raises StopIteration, which the for swallows silently. Two dunders make an object iterable: __iter__ returns an iterator, and that iterator__s __next__ produces the next value or raises StopIteration.',
      },
      {
        heading: 'Iterable vs iterator',
        body: 'An ITERABLE can hand out a fresh iterator each time you call iter() on it (a list does this). An ITERATOR is the cursor that actually advances and gets exhausted. The CountDown demo is both at once: __iter__ returns self, so it can be looped only once - exactly like a generator.',
      },
      {
        heading: 'Why StopIteration, not a flag',
        body: 'Using an exception to mean "done" lets next() always return a real value when there is one, with no sentinel to collide with your data. Every consumer - for, list(), sum(), unpacking - relies on this single signal, which is why generators raise StopIteration when they return.',
      },
    ],
    mentalModel: 'for x in obj means iter(obj) once, then next() until StopIteration - looping is a protocol, not index arithmetic.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'It raises StopIteration. That exception is the protocol\'s "no more values" signal, and every consumer catches it silently.',
      why: 'for x in obj does not loop by index. It desugars to it = iter(obj), then calls next(it) repeatedly, binding x each time, until next raises StopIteration - which the for swallows. Two dunders make an object iterable: __iter__ returns an iterator, and that iterator\'s __next__ produces the next value or raises StopIteration.\n\nThe iterable/iterator distinction matters. An ITERABLE hands out a fresh iterator each time you call iter() on it - a list does this, so you can loop it repeatedly. An ITERATOR is the cursor that actually advances and gets exhausted; CountDown returns self from __iter__, so it is both at once and can be looped only once, like a generator. Using an exception rather than a sentinel to mean "done" keeps next() free to return any real value with nothing to collide with your data - which is why every consumer (for, list, sum, unpacking) relies on this single signal.',
      commonMistake: 'Confusing iterable with iterator, or expecting an exhausted iterator to restart. **Weak pattern:** the candidate makes __iter__ return self on a reusable collection and then cannot loop it twice. **Interviewer follow-up:** "why can a list be looped many times but a file object or generator only once?" - the list is an iterable that yields a new iterator each time; the others are iterators that exhaust.',
      interviewPhrase: '"for is iter() once, then next() until StopIteration - looping is a protocol, not index math. An iterable gives a fresh iterator each time; an iterator is the cursor that advances and exhausts. The StopIteration exception keeps the return channel free for any real value."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-context-manager', cluster: 'iteration',
    title: 'The with-block protocol',
    subtitle: 'Why with guarantees cleanup even on an exception.',
    difficulty: 'core', estimatedMin: 5,
    tags: ['context-manager', 'with', 'enter', 'exit'],
    hook: 'You use with open(...) so the file always closes, and trust it without knowing why. The guarantee comes from two dunder hooks - __enter__ and __exit__ - and __exit__ runs even when the body blows up.',
    demoCode: '# `with obj:` calls obj.__enter__() on the way in and obj.__exit__()\n# on the way out - even if the body raises. That guarantee is the point.\nclass Stage:\n    def __init__(self, name):\n        self.name = name\n    def __enter__(self):\n        print("open", self.name)\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        print("close", self.name)\n        return False          # do not swallow exceptions\n\nwith Stage("load"):\n    print("...work...")\n\n# __exit__ still runs when the body raises:\ntry:\n    with Stage("risky"):\n        raise ValueError("boom")\nexcept ValueError:\n    print("caught after close")\n',
    demoOutput: 'open load\n...work...\nclose load\nopen risky\nclose risky\ncaught after close',
    predict: {
      question: 'Inside a with block the body raises. Does __exit__ still run?',
      options: [
        { label: 'No - the exception skips it',
          level: 'wrong',
          feedback: 'The opposite is the whole point of with. __exit__ runs in the equivalent of a finally, so it executes whether the body finishes normally or raises - that guarantee is why with beats manual open/close.' },
        { label: 'Yes - __exit__ always runs',
          level: 'strong',
          feedback: 'Right. __exit__ is wrapped in a finally, so it runs on both the normal path and the exception path. It even receives the exception type, value, and traceback so it can clean up or log.' },
        { label: 'Only if you catch the exception',
          level: 'wrong',
          feedback: 'No catching needed - __exit__ runs before the exception propagates, regardless of whether anyone catches it. Whether the exception then continues depends on __exit__\'s return value, not on a try around the with.' },
      ],
    },
    explain: [
      {
        heading: 'Enter on the way in, exit on the way out',
        body: 'with obj as name: calls obj.__enter__() and binds its return value to name. When the block ends - normally OR via an exception - Python calls obj.__exit__(exc_type, exc, tb). That second call is wrapped in the equivalent of a finally, which is the entire reason with is safer than manual open/close.',
      },
      {
        heading: '__exit__ sees the exception',
        body: 'If the body raised, __exit__ receives the exception type, value, and traceback (otherwise three Nones). It can inspect them, log, and clean up. Whether the exception then propagates depends on the return value.',
      },
      {
        heading: 'The return value decides suppression',
        body: 'If __exit__ returns a truthy value, Python SWALLOWS the exception (treats it as handled). Return False (or None) and the exception propagates after cleanup - which is what you almost always want, and what the demo does, so the ValueError is still catchable outside the with.',
      },
    ],
    mentalModel: 'with calls __enter__ then guarantees __exit__ in a finally; __exit__ returning truthy suppresses the exception, falsy lets it propagate.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'Yes - __exit__ always runs, even when the body raises. It is wrapped in the equivalent of a finally, which is the entire reason with is safer than manual cleanup.',
      why: 'with obj as name calls obj.__enter__() and binds its return to name. When the block ends - normally OR via an exception - Python calls obj.__exit__(exc_type, exc, tb), and that call sits inside the equivalent of a finally. So cleanup is guaranteed regardless of how the body exits.\n\nIf the body raised, __exit__ receives the exception type, value, and traceback (otherwise three Nones), so it can inspect, log, and clean up. The return value then decides suppression: return truthy and Python SWALLOWS the exception as handled; return False or None and the exception propagates after cleanup. The latter is what you almost always want, which is why the demo returns False and the ValueError is still catchable outside the with.',
      commonMistake: 'Returning True from __exit__ by accident and silently swallowing every exception. **Weak pattern:** the candidate adds a return statement for the value and unknowingly suppresses errors. **Interviewer follow-up:** "your context manager hides all exceptions - why?" - because __exit__ returns a truthy value; return False/None to let them propagate.',
      interviewPhrase: '"with guarantees __exit__ runs in a finally, even on an exception - that is the safety. __exit__ gets the exception details, and its return value decides suppression: truthy swallows it, falsy or None lets it propagate, which is almost always what I want."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Objects & Classes ─────────────────────────
  {
    id: 'know-eq-hash-contract',
    yourTurn: {
      prompt: 'Make Point usable as a dict key so two equal Points collapse to ONE entry. Add what defining __eq__ took away.',
      starter: 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n\nseen = {}\nseen[Point(1, 2)] = "a"\nseen[Point(1, 2)] = "b"\nprint("entries", len(seen))',
      check: '__pl_pass = (len(seen) == 1)\n__pl_msg = ("Right - equal Points hash the same, so they share one entry." if __pl_pass else "Got " + str(len(seen)) + " entries. Defining __eq__ made Point unhashable - add __hash__ returning hash((self.x, self.y)) so equal objects hash equal.")',
      hint: 'Defining __eq__ sets __hash__ to None (unhashable). Equal objects must hash equal: def __hash__(self): return hash((self.x, self.y)).',
    }, cluster: 'objects',
    title: 'The __eq__ / __hash__ contract',
    subtitle: 'Why adding __eq__ silently breaks set membership.',
    difficulty: 'stretch', estimatedMin: 7,
    tags: ['eq', 'hash', 'sets', 'dict-keys', 'contract'],
    hook: 'You add __eq__ so two points with the same coordinates compare equal. Reasonable. But now you cannot put your object in a set - Python quietly removed __hash__ the moment you defined __eq__, and the reason is a contract you must honor.',
    demoCode: '# Defining __eq__ makes Python DROP the default __hash__, so instances\n# become unhashable - they can no longer go in a set or be dict keys,\n# until you supply a matching __hash__.\nclass PointNoHash:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n\nprint("hashable?", PointNoHash.__hash__ is None)\ntry:\n    {PointNoHash(1, 2)}\nexcept TypeError:\n    print("cannot put in a set")\n\n# The contract: equal objects MUST have equal hashes. Build hash from\n# the same fields used by __eq__ (and make them immutable).\nclass Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n    def __hash__(self):\n        return hash((self.x, self.y))\n\nprint("dedup:", len({Point(1, 2), Point(1, 2), Point(3, 4)}))\n',
    demoOutput: 'hashable? True\ncannot put in a set\ndedup: 2',
    predict: {
      question: 'A class defines __eq__ but not __hash__. Can its instances go in a set?',
      options: [
        { label: 'Yes, always',
          level: 'wrong',
          feedback: 'Defining __eq__ makes Python set __hash__ to None, so instances become unhashable and a set rejects them with TypeError. You must supply a matching __hash__ to put them in a set.' },
        { label: 'No - it becomes unhashable',
          level: 'strong',
          feedback: 'Right. The moment you define __eq__, Python drops the default identity-based __hash__ to None - because that hash would now disagree with your value-equality. Add __hash__ over the same fields to restore set/dict-key use.' },
        { label: 'Only if frozen',
          level: 'partial',
          feedback: 'A frozen dataclass DOES auto-generate __hash__, so it would work - but that is one specific tool, not the rule. A plain class with __eq__ and no __hash__ is unhashable until you write __hash__ yourself.' },
      ],
    },
    explain: [
      {
        heading: 'Defining __eq__ drops __hash__',
        body: 'By default every object is hashable (its hash is based on identity). The moment you define __eq__, Python sets __hash__ to None, making instances unhashable. This is deliberate: the default identity-hash would now disagree with your value-equality, and that disagreement would corrupt sets and dicts.',
      },
      {
        heading: 'The contract',
        body: 'Hash-based containers rely on one rule: if a == b then hash(a) == hash(b). They bucket items by hash and only compare within a bucket. If two equal objects hashed differently they could land in different buckets and a set would store both as "distinct" - silently breaking deduplication and lookups. So Python refuses to let you have __eq__ without a matching __hash__.',
      },
      {
        heading: 'Restore it from the same fields',
        body: 'Define __hash__ to return the hash of a tuple of exactly the fields your __eq__ compares: hash((self.x, self.y)). Now equal points share a hash and deduplicate correctly. Those fields should be effectively immutable - mutating a key after it is in a set makes it unfindable.',
      },
    ],
    mentalModel: 'Equal objects must hash equal; defining __eq__ nulls __hash__, so re-add __hash__ over the same fields or your objects cannot be set members or dict keys.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'No - defining __eq__ makes the class unhashable. Python sets __hash__ to None automatically, so instances cannot go in a set or be dict keys until you supply a matching __hash__.',
      why: 'By default every object is hashable via its identity. The moment you define __eq__, Python sets __hash__ to None, making instances unhashable. This is deliberate: the default identity-hash would now disagree with your value-equality, and that disagreement would corrupt hash-based containers.\n\nThe contract is one rule: if a == b then hash(a) == hash(b). Sets and dicts bucket items by hash and only compare within a bucket, so if two equal objects hashed differently they could land in different buckets and a set would store both as "distinct" - silently breaking deduplication and lookups. To restore correct behaviour, define __hash__ to return hash() of a tuple of exactly the fields __eq__ compares, e.g. hash((self.x, self.y)). Those fields should be effectively immutable, because mutating a key after it is in a set makes it unfindable.',
      commonMistake: 'Adding __eq__ for value equality and then being baffled that the object cannot go in a set, or writing a __hash__ that uses different fields than __eq__. **Weak pattern:** the candidate hashes on id() or a mutable field. **Interviewer follow-up:** "what is the rule linking __eq__ and __hash__?" - equal objects must hash equal, and the hash should come from the same immutable fields.',
      interviewPhrase: '"Defining __eq__ nulls __hash__, so the object becomes unhashable - because the contract is that equal objects must hash equal, or sets and dicts break. I restore __hash__ from the same immutable fields __eq__ uses: hash((self.x, self.y))."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-dataclass-generates', cluster: 'objects',
    title: 'What @dataclass actually writes',
    subtitle: 'The boilerplate a decorator generates for you.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['dataclass', 'init', 'repr', 'eq', 'boilerplate'],
    hook: 'You sprinkle @dataclass on a class and suddenly it has a tidy repr and compares by value. No magic - the decorator reads your type-annotated fields and writes the __init__, __repr__, and __eq__ you would otherwise type by hand.',
    demoCode: 'import dataclasses\n\n# @dataclass writes the boilerplate FOR you: __init__, __repr__, __eq__.\n@dataclasses.dataclass\nclass Row:\n    name: str\n    score: int = 0\n\nr = Row("ada", 90)\nprint("repr:", r)                       # generated __repr__\nprint("eq:", Row("ada", 90) == Row("ada", 90))   # generated __eq__\nprint("default used:", Row("bo"))\n\n# The plain-class equivalent compares by IDENTITY, so two equal rows differ:\nclass RawRow:\n    def __init__(self, name, score=0):\n        self.name, self.score = name, score\n\nprint("plain eq:", RawRow("ada", 90) == RawRow("ada", 90))\nprint("fields:", [f.name for f in dataclasses.fields(Row)])\n',
    demoOutput: 'repr: Row(name=\'ada\', score=90)\neq: True\ndefault used: Row(name=\'bo\', score=0)\nplain eq: False\nfields: [\'name\', \'score\']',
    predict: {
      question: 'Two @dataclass Row instances with identical fields - does == return True?',
      options: [
        { label: 'True - generated __eq__ compares fields',
          level: 'strong',
          feedback: 'Right. @dataclass generates an __eq__ that compares the tuple of fields, so equal data means equal objects - unlike a plain class, which inherits identity-based __eq__ from object.' },
        { label: 'False - different objects',
          level: 'partial',
          feedback: 'That is true for a PLAIN class, which compares by identity - but @dataclass overrides exactly that. Its generated __eq__ compares fields, so two Rows with the same data are equal.' },
        { label: 'raises TypeError',
          level: 'wrong',
          feedback: 'No error - comparing two same-typed dataclass instances is well-defined. The generated __eq__ compares their field tuples and returns True when they match.' },
      ],
    },
    explain: [
      {
        heading: 'Fields come from annotations',
        body: '@dataclass inspects the class-level annotations (name: str, score: int = 0) and treats each as a field, with the assigned value as its default. From that list it code-generates an __init__ that takes those parameters in order, plus __repr__ and __eq__. dataclasses.fields() lets you read the field list back at runtime.',
      },
      {
        heading: 'Generated __eq__ compares by value',
        body: 'A plain class inherits __eq__ from object, which compares identity - so two separately built rows are never equal (the demo shows RawRow("ada",90) == RawRow("ada",90) is False). The dataclass-generated __eq__ instead compares the tuple of fields, so equal data means equal objects. This is the single biggest reason to reach for a dataclass.',
      },
      {
        heading: 'Options change what is generated',
        body: '@dataclass(frozen=True) makes instances immutable and adds __hash__; order=True generates <, <=, >, >= from the field tuple; eq=False skips __eq__. The decorator is a code generator with knobs - what you get is exactly the methods you asked for, written consistently from your field declarations.',
      },
    ],
    mentalModel: '@dataclass turns annotated fields into a generated __init__, __repr__, and value-based __eq__ - it writes the boilerplate, you keep the declarations.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'Yes - == returns True. @dataclass generates an __eq__ that compares the field tuple, so equal data means equal objects, unlike a plain class.',
      why: '@dataclass inspects the class-level annotations (name: str, score: int = 0), treats each as a field with the assigned value as its default, and code-generates __init__ taking those parameters in order, plus __repr__ and __eq__. dataclasses.fields() lets you read that field list back at runtime.\n\nThe generated __eq__ is the headline. A plain class inherits __eq__ from object, which compares identity, so two separately built rows are never equal. The dataclass __eq__ instead compares the tuple of fields, so equal data means equal objects - which is the single biggest reason to reach for one. The decorator is a code generator with knobs: frozen=True makes instances immutable and adds __hash__; order=True generates the comparison operators; eq=False skips __eq__. You get exactly the methods you ask for, written consistently from your declarations.',
      commonMistake: 'Reaching for a plain class and then hand-writing __init__, __repr__, and __eq__ (often inconsistently), or forgetting that mutable dataclasses are unhashable. **Weak pattern:** the candidate cannot say which methods @dataclass actually generates. **Interviewer follow-up:** "how do you make a dataclass usable as a dict key?" - pass frozen=True so it is immutable and gets a generated __hash__.',
      interviewPhrase: '"@dataclass reads my annotated fields and generates __init__, __repr__, and a value-based __eq__ - so equal data compares equal, which a plain class does not. It is a code generator with knobs: frozen=True for immutability and hashing, order=True for comparisons."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-property-descriptor', cluster: 'objects',
    title: 'Properties turn access into a call',
    subtitle: 'Reading an attribute can run code.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['property', 'descriptors', 'encapsulation', 'validation'],
    hook: 'You start with a plain .celsius attribute, then need validation and a computed .fahrenheit. In many languages that means breaking every caller to add getters. In Python, @property lets attribute access run a method while the callers stay exactly the same.',
    demoCode: '# @property turns attribute access into a method call: reading c.celsius\n# RUNS code, so you can compute or validate instead of storing a raw value.\nclass Temp:\n    def __init__(self, c):\n        self._c = c\n    @property\n    def celsius(self):\n        return self._c\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError("below absolute zero")\n        self._c = value\n    @property\n    def fahrenheit(self):              # computed on the fly, never stored\n        return self._c * 9 / 5 + 32\n\nt = Temp(25)\nprint("read:", t.celsius)\nprint("computed F:", t.fahrenheit)\nt.celsius = 100                        # goes through the setter\nprint("after set:", t.fahrenheit)\ntry:\n    t.celsius = -300\nexcept ValueError as e:\n    print("rejected:", e)\n',
    demoOutput: 'read: 25\ncomputed F: 77.0\nafter set: 212.0\nrejected: below absolute zero',
    predict: {
      question: 'With @property celsius and its setter, what does t.celsius = -300 do?',
      options: [
        { label: 'sets it to -300',
          level: 'wrong',
          feedback: 'Plain attribute assignment would just store it, but @property routes t.celsius = v through the setter method, which here checks the value and rejects anything below absolute zero.' },
        { label: 'raises ValueError from the setter',
          level: 'strong',
          feedback: 'Right. The assignment runs the @celsius.setter method, which raises ValueError for -300. Same plain syntax at the call site, but a method runs on every write - that is the point of property.' },
        { label: 'silently ignored',
          level: 'wrong',
          feedback: 'The setter does not ignore bad input - it actively raises ValueError, which surfaces loudly. A property turns the write into a method call, so validation is enforced, not skipped.' },
      ],
    },
    explain: [
      {
        heading: 'Access becomes a method call',
        body: '@property makes celsius a managed attribute: reading t.celsius RUNS the decorated method instead of fetching a stored value, and writing t.celsius = v RUNS the @celsius.setter method. The syntax at the call site is still plain attribute access - no parentheses - so existing code does not change, but now you can validate, compute, or log on every read and write.',
      },
      {
        heading: 'Computed and validated values',
        body: 'fahrenheit has only a getter and no backing field - it is computed from _c on every read, so it can never drift out of sync. The celsius setter rejects values below absolute zero, turning an invalid assignment into a ValueError. This is encapsulation without ceremony: store what you must, compute what you can, guard what matters.',
      },
      {
        heading: 'Property is a descriptor',
        body: 'Under the hood property is a descriptor - an object that defines __get__/__set__ and lives on the CLASS, so it intercepts attribute access on every instance. That is the general mechanism behind not just @property but also methods, classmethod, and staticmethod. Descriptors are how "attribute access runs code" is implemented across the language.',
      },
    ],
    mentalModel: '@property makes an attribute run getter/setter code on read and write - same call-site syntax, with validation and computed values underneath.',
    isFree: true,
    seniorRead: {
      shortAnswer: 't.celsius = -300 raises ValueError. The assignment runs the @celsius.setter method, which rejects values below absolute zero - same plain syntax, but a method runs on every write.',
      why: '@property turns attribute access into a method call. Reading t.celsius RUNS the decorated getter instead of fetching a stored value, and writing t.celsius = v RUNS the @celsius.setter. The call-site syntax stays plain attribute access - no parentheses - so existing callers do not change, but now you can validate, compute, or log on every read and write. That is why you can start with a bare attribute and add a property later without breaking anyone.\n\nfahrenheit has only a getter and no backing field - it is computed from _c on every read, so it can never drift out of sync. Under the hood property is a descriptor: an object defining __get__/__set__ that lives on the CLASS and intercepts access on every instance. That same descriptor mechanism is how methods, classmethod, and staticmethod work - "attribute access runs code" is implemented across the language this way.',
      commonMistake: 'Reaching for Java-style getX()/setX() methods in Python, or exposing a public attribute then being unable to add validation without breaking callers. **Weak pattern:** the candidate writes def get_celsius(self) and calls it with parentheses everywhere. **Interviewer follow-up:** "how do you add validation to an existing public attribute without changing call sites?" - convert it to a @property with a setter.',
      interviewPhrase: '"@property makes attribute access run code - reading runs the getter, writing runs the setter - while the call site stays plain dotted access. So I can ship a bare attribute, then add validation or a computed value later without touching any caller. It is a descriptor under the hood."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Typing & Style ─────────────────────────
  {
    id: 'know-eafp-vs-lbyl', cluster: 'typing',
    title: 'EAFP: exceptions as control flow',
    subtitle: 'Why Python tries first and asks forgiveness.',
    difficulty: 'warmup', estimatedMin: 5,
    tags: ['exceptions', 'eafp', 'lbyl', 'style'],
    hook: 'Coming from other languages you check before every access - if key in d, if x is not None. Pythonic code often does the opposite: it just tries the operation and catches the failure. That is not sloppy; it is the EAFP style, and it is usually cleaner and safer.',
    demoCode: '# Python style is EAFP: "easier to ask forgiveness than permission" -\n# just try the operation and catch the failure, rather than pre-checking.\ndata = {"region": "EU"}\n\n# LBYL: look before you leap - check first, then act.\nif "region" in data:\n    print("LBYL:", data["region"])\n\n# EAFP: try it, handle the miss. Often cleaner and avoids a race window.\ntry:\n    print("EAFP:", data["country"])\nexcept KeyError:\n    print("EAFP: missing, using default")\n\n# Exceptions are normal control flow here, not just for catastrophes -\n# StopIteration, KeyError, and ValueError are all routine signals.\nnums = ["10", "x", "20"]\ntotal = 0\nfor s in nums:\n    try:\n        total += int(s)\n    except ValueError:\n        pass\nprint("sum of parseable:", total)\n',
    demoOutput: 'LBYL: EU\nEAFP: missing, using default\nsum of parseable: 30',
    predict: {
      question: 'What does EAFP stand for?',
      options: [
        { label: 'Easier to Ask Forgiveness than Permission',
          level: 'strong',
          feedback: 'Right. EAFP means just try the operation and catch the failure, rather than pre-checking with LBYL. Python leans this way because exceptions are cheap and the try has no race window between check and action.' },
        { label: 'Evaluate All Functions And Pass',
          level: 'wrong',
          feedback: 'Not a real acronym. EAFP is a style principle - Easier to Ask Forgiveness than Permission - about trying first and catching the exception, not pre-checking conditions.' },
        { label: 'Explicit Args For Parameters',
          level: 'wrong',
          feedback: 'Unrelated to argument passing. EAFP is about control flow: try the operation and handle the failure (Easier to Ask Forgiveness than Permission), the Pythonic alternative to LBYL.' },
      ],
    },
    explain: [
      {
        heading: 'LBYL vs EAFP',
        body: 'LBYL - Look Before You Leap - checks a condition first, then acts (if key in d: use d[key]). EAFP - Easier to Ask Forgiveness than Permission - just does the action and catches the exception if it fails. Python leans EAFP because exceptions are cheap and the try expresses intent directly.',
      },
      {
        heading: 'EAFP avoids the race window',
        body: 'Between an LBYL check and the action, the world can change - a file you just confirmed exists could be deleted, a dict key removed by another thread. EAFP has no gap: the operation and its failure handling are one atomic attempt. For anything shared or external (files, dicts, network), this is the more correct pattern, not just the prettier one.',
      },
      {
        heading: 'Exceptions are routine here',
        body: 'In Python, exceptions are normal signals, not only catastrophes: StopIteration ends every for loop, KeyError and IndexError are ordinary "not found" results, ValueError means "could not parse". Catching one to skip a bad row (the int() loop) is idiomatic flow control, not error abuse - which is why try/except reads naturally in Python code.',
      },
    ],
    mentalModel: 'Pythonic code tries the operation and catches the failure (EAFP) rather than pre-checking (LBYL) - exceptions are ordinary control flow here.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'EAFP is "Easier to Ask Forgiveness than Permission" - try the operation and catch the failure, rather than pre-checking with LBYL.',
      why: 'LBYL - Look Before You Leap - checks a condition first, then acts (if key in d: use d[key]). EAFP just does the action and catches the exception if it fails. Python leans EAFP because exceptions are cheap and the try expresses intent directly, without a separate guard clause.\n\nThe real advantage is correctness, not just style. Between an LBYL check and the action the world can change - a file you confirmed exists could be deleted, a dict key removed by another thread - and EAFP has no such gap: the operation and its failure handling are one atomic attempt. This matters for anything shared or external. And exceptions are routine signals here, not catastrophes: StopIteration ends every for loop, KeyError and IndexError are ordinary "not found" results, ValueError means "could not parse". Catching one to skip a bad row is idiomatic flow control, not error abuse.',
      commonMistake: 'Porting C/Java habits and pre-checking everything, introducing a check-then-act race. **Weak pattern:** the candidate writes if os.path.exists(p): open(p) and treats the try/except version as sloppy. **Interviewer follow-up:** "what can go wrong between your exists check and the open?" - the file can vanish in the gap; EAFP avoids the window entirely.',
      interviewPhrase: '"Pythonic style is EAFP - try the operation and catch the failure - over LBYL pre-checking. It reads cleaner and, for anything shared or external, avoids the race window between checking and acting. Exceptions are normal control flow in Python, not just for catastrophes."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-hints-dont-enforce', cluster: 'typing',
    title: 'Type hints do not run',
    subtitle: 'Why a wrong type flows straight through.',
    difficulty: 'warmup', estimatedMin: 4,
    tags: ['type-hints', 'annotations', 'runtime', 'mypy'],
    hook: 'You annotate def double(n: int) -> int and feel safe. Then you pass a string and it does not raise - it cheerfully doubles the string. Hints are documentation the interpreter records but never checks.',
    demoCode: '# Type hints are ANNOTATIONS, not checks. At runtime Python ignores them;\n# passing the wrong type does not raise - the value flows straight through.\ndef double(n: int) -> int:\n    return n * 2\n\nprint("ints:", double(5))\nprint("strings:", double("ab"))        # hint says int; str works anyway\nprint("lists:", double([1]))           # also fine - no enforcement\n\n# The hints ARE recorded, for tools (mypy) and introspection - not the interpreter.\nprint("annotations:", double.__annotations__)\n',
    demoOutput: 'ints: 10\nstrings: abab\nlists: [1, 1]\nannotations: {\'n\': <class \'int\'>, \'return\': <class \'int\'>}',
    predict: {
      question: 'def double(n: int): return n*2. What does double("ab") do at runtime?',
      options: [
        { label: 'raises TypeError',
          level: 'wrong',
          feedback: 'Hints are not enforced at runtime - Python inserts no isinstance check. A static checker like mypy would flag this before you run, but the interpreter happily runs "ab" * 2.' },
        { label: 'returns "abab"',
          level: 'strong',
          feedback: 'Right. The hint is recorded in __annotations__ and otherwise ignored, so "ab" * 2 runs and returns "abab". Hints are for tools and readers, not the running interpreter.' },
        { label: 'returns None',
          level: 'wrong',
          feedback: 'The function still returns its computed value - "ab" * 2 is "abab", not None. There is no silent failure; the wrong type simply flows through because hints do not run.' },
      ],
    },
    explain: [
      {
        heading: 'Annotations are recorded, not checked',
        body: 'At runtime CPython stores hints in __annotations__ and otherwise IGNORES them. There is no automatic isinstance check inserted anywhere. double("ab") runs "ab" * 2 and returns "abab" because str supports *. The hint said int; Python neither knows nor cares.',
      },
      {
        heading: 'Who the hints are actually for',
        body: 'Type hints exist for HUMANS and TOOLS: editors use them for autocomplete and inline errors, and static checkers like mypy or pyright analyze them BEFORE you run, flagging double("ab") as a type error at lint time. None of that touches the running interpreter - it is a separate pass over your source.',
      },
      {
        heading: 'If you want runtime enforcement',
        body: 'To actually enforce types at runtime you must add it yourself - explicit isinstance checks, or libraries like pydantic that read the annotations and validate against them. Out of the box, hints are a contract you and your tooling agree to honor; Python will happily run code that violates it.',
      },
    ],
    mentalModel: 'Type hints are annotations for tools and readers, recorded in __annotations__ but never enforced at runtime - the interpreter runs wrong types without complaint.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'double("ab") returns "abab". Hints are not enforced at runtime - "ab" * 2 just runs, because the interpreter records the annotation and otherwise ignores it.',
      why: 'At runtime CPython stores hints in __annotations__ and otherwise ignores them - there is no automatic isinstance check inserted anywhere. double("ab") runs "ab" * 2 and returns "abab" because str supports *. The hint said int; Python neither knows nor cares.\n\nHints exist for HUMANS and TOOLS, not the interpreter. Editors use them for autocomplete and inline errors; static checkers like mypy or pyright analyze them BEFORE you run and flag double("ab") at lint time. That is a separate pass over your source, never the running interpreter. If you want actual runtime enforcement you add it yourself - explicit isinstance checks, or a library like pydantic that reads the annotations and validates against them. Out of the box, hints are a contract you and your tooling agree to honor.',
      commonMistake: 'Believing a type hint guarantees the argument type at runtime, and skipping validation on external input because "it is typed". **Weak pattern:** the candidate annotates a function and assumes bad data cannot reach the body. **Interviewer follow-up:** "you annotated this as int but a string comes in from JSON - what stops it?" - nothing at runtime; you need mypy in CI or pydantic/isinstance validation at the boundary.',
      interviewPhrase: '"Type hints are annotations, not checks - Python records them in __annotations__ and runs wrong types without complaint. They are for readers and tools like mypy. If I need runtime enforcement I add it explicitly, with isinstance checks or pydantic at the boundary."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Imports & Modules ─────────────────────────
  {
    id: 'know-import-runs-once', cluster: 'imports',
    title: 'A module runs once, then caches',
    subtitle: 'Why the second import is free and silent.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['imports', 'sys-modules', 'caching', 'modules'],
    hook: 'You put a print at the top of a module and import it from three files, expecting three lines. You get one. Importing runs the module body exactly once; every later import just hands back the cached module object.',
    demoCode: 'import sys, types\n\n# Importing a module runs its top-level code ONCE; the result is cached in\n# sys.modules. Every later import of the same name reuses that cached object.\nmod = types.ModuleType("demo_pkg")\nmod_code = "print(\'module body executing\')\\nVALUE = 42"\nexec(compile(mod_code, "demo_pkg", "exec"), mod.__dict__)\nsys.modules["demo_pkg"] = mod\n\nimport demo_pkg                         # already cached - body does NOT run again\nprint("cached value:", demo_pkg.VALUE)\nprint("same object:", sys.modules["demo_pkg"] is demo_pkg)\n\nimport demo_pkg as again                # still no re-execution\nprint("re-import same:", again is demo_pkg)\n',
    demoOutput: 'module body executing\ncached value: 42\nsame object: True\nre-import same: True',
    predict: {
      question: 'A module prints at top level. You import it twice. How many times does it print?',
      options: [
        { label: 'Twice',
          level: 'wrong',
          feedback: 'This assumes each import re-runs the file. It does not. The first import runs the body and caches the module in sys.modules; the second import just hands back the cached object without re-executing.' },
        { label: 'Once',
          level: 'strong',
          feedback: 'Right. Importing executes the module body exactly once, then registers it in sys.modules. Every later import of that name reuses the cached object and skips the body, so the print fires a single time.' },
        { label: 'Zero times',
          level: 'wrong',
          feedback: 'The body does run - on the first import. Top-level code executes once when the module is first loaded, so the print fires exactly once, not never.' },
      ],
    },
    explain: [
      {
        heading: 'First import executes the body',
        body: 'The first time a module is imported, Python finds the file, executes its top-level code top to bottom (running every def, class, and statement), and builds a module object holding the resulting names. That execution is where your print fires - exactly once.',
      },
      {
        heading: 'sys.modules is the cache',
        body: 'Before running the body, Python registers the module in the sys.modules dict by name. Every subsequent import of that name checks sys.modules first, finds the already-built object, and binds it WITHOUT re-running the file. That is why the second and third imports are silent and instant, and why two imports of the same module are the same object.',
      },
      {
        heading: 'Consequences you will hit',
        body: 'Module-level code is effectively a run-once initializer - good for constants and setup, surprising if you expected it each import. To force a re-run you must del the entry from sys.modules or use importlib.reload. And circular imports get half-built modules precisely because the entry exists in sys.modules before the body finishes.',
      },
    ],
    mentalModel: 'Importing executes a module body once and caches the result in sys.modules; later imports reuse that object without re-running the file.',
    isFree: true,
    seniorRead: {
      shortAnswer: 'Once. The first import runs the module body and caches it in sys.modules; every later import reuses that cached object without re-executing the file.',
      why: 'The first time a module is imported, Python finds the file, executes its top-level code top to bottom - running every def, class, and statement - and builds a module object holding the resulting names. That execution is where a top-level print fires, exactly once. Before running the body it registers the module in the sys.modules dict by name.\n\nEvery subsequent import of that name checks sys.modules first, finds the already-built object, and binds it WITHOUT re-running the file - which is why the second and third imports are silent and instant, and why two imports of the same name are the same object. The consequences bite in practice: module-level code is a run-once initializer (great for constants, surprising if you expected it each import); to force a re-run you del the sys.modules entry or use importlib.reload; and circular imports hand back a half-built module precisely because the entry exists in sys.modules before the body finishes.',
      commonMistake: 'Expecting module-level code to run on every import, or fighting a circular import without understanding the half-built-module cause. **Weak pattern:** the candidate puts expensive setup at module top level and is surprised it does not re-run, or adds a re-import to "refresh" state. **Interviewer follow-up:** "two modules import each other and one sees a half-defined name - why?" - the importing module is registered in sys.modules before its body finishes, so the partner gets the incomplete object.',
      interviewPhrase: '"A module body runs exactly once, on first import, then the module is cached in sys.modules - later imports reuse that object without re-running the file. So module-level code is a run-once initializer, and circular imports get a half-built module because the cache entry exists before the body finishes."',
      connectsTo: ['gotchas', 'python'],
    },
    connectsTo: ['gotchas', 'python'],
  },
];

export default knowModules;

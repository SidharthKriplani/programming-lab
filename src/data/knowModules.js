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
//   predict     — { question, options:[...], answerIndex }  (optional predict-before-run gate)
//   connectsTo  — ['gotchas','python','pandas']

export const KNOW_CLUSTERS = {
  'objects-identity': { label: 'Objects & Identity', accent: 'var(--accent)' },
  'evaluation-model': { label: 'Evaluation Model',   accent: 'var(--purple)' },
  'scope-closures':   { label: 'Scope & Closures',   accent: 'var(--red)' },
  'truthiness':       { label: 'Truthiness',         accent: 'var(--yellow)' },
  'data-model':       { label: 'The Data Model',     accent: 'var(--teal)' },
};

export const KNOW_CLUSTER_ORDER = [
  'objects-identity', 'evaluation-model', 'scope-closures', 'truthiness', 'data-model',
];

export const knowModules = [
  // ───────────────────────── Objects & Identity ─────────────────────────
  {
    id: 'know-names-are-bindings',
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
      options: ['[]', '[1]', 'raises an error'],
      answerIndex: 1,
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
      options: ['[0, 1, 4, 9] again', '[]', 'raises StopIteration'],
      answerIndex: 1,
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
      options: ['[0, 1, 2]', '[2, 2, 2]', '[3, 3, 3]'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Truthiness ─────────────────────────
  {
    id: 'know-truthiness-or-default',
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
      options: ['0', '10', 'True'],
      answerIndex: 1,
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
      options: ['Yes - __getitem__ drives iteration', 'No - needs __iter__', 'No - raises TypeError'],
      answerIndex: 0,
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
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Evaluation Model (default args) ─────────────────────────
  {
    id: 'know-mutable-default-args',
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
      options: ['[\'b\']', '[\'a\', \'b\']', 'raises an error'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python', 'pandas'],
  },
];

export default knowModules;

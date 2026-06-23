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
      options: ['True - small ints are cached', 'False - separate objects', 'Depends on the run'],
      answerIndex: 0,
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
      options: ['True', 'False', 'raises TypeError'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── The Data Model (more) ─────────────────────────
  {
    id: 'know-operator-dispatch', cluster: 'data-model',
    title: 'Operators dispatch to dunders',
    subtitle: 'x + y is really x.__add__(y).',
    difficulty: 'core', estimatedMin: 6,
    tags: ['operators', 'dunder', 'data-model', 'overloading'],
    hook: 'You assume + only works on numbers and strings because those are "built in". But + is not built into the types - it is a call to __add__. Give your own class that method and + works on it too.',
    demoCode: '# Operators are syntax over dunder methods. x + y tries x.__add__(y);\n# x in c tries c.__contains__(x); c[k] tries c.__getitem__(k).\nclass Money:\n    def __init__(self, cents):\n        self.cents = cents\n    def __add__(self, other):\n        return Money(self.cents + other.cents)\n    def __repr__(self):\n        return "Money(" + str(self.cents) + ")"\n\nprint("add:", Money(150) + Money(50))\n\nclass Shelf:\n    def __init__(self, items):\n        self.items = items\n    def __contains__(self, x):\n        return x in self.items\n    def __getitem__(self, i):\n        return self.items[i]\n\ns = Shelf(["milk", "eggs"])\nprint("contains:", "milk" in s)\nprint("index:", s[1])\n',
    demoOutput: 'add: Money(200)\ncontains: True\nindex: eggs',
    predict: {
      question: 'Money defines __add__. What does Money(150) + Money(50) produce?',
      options: ['a TypeError', 'Money(200)', '200'],
      answerIndex: 1,
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
      options: ['[3, 4]', '(3, 4)', '{3: 4}'],
      answerIndex: 1,
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
      options: ['greet = announce(greet)', 'announce = greet(announce)', 'greet = greet(announce)'],
      answerIndex: 0,
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
    connectsTo: ['gotchas', 'python'],
  },
  {
    id: 'know-functools-wraps', cluster: 'functions',
    title: 'functools.wraps and the lost identity',
    subtitle: 'Why your decorated function forgets its own name.',
    difficulty: 'core', estimatedMin: 5,
    tags: ['decorators', 'functools', 'metadata', 'introspection'],
    hook: 'You add a decorator, then later print func.__name__ for logging and it says "wrapper". Your docstrings vanish too. The decorator did its job - it just replaced your function with the wrapper, identity and all.',
    demoCode: 'import functools\n\n# A naive decorator REPLACES the function, so the wrapper identity leaks out:\n# the wrapper name and docstring show up instead of the original ones.\ndef naive(func):\n    def wrapper(*a, **k):\n        return func(*a, **k)\n    return wrapper\n\n@naive\ndef parse(text):\n    "Parse a row into fields."\n    return text.split(",")\n\nprint("naive name:", parse.__name__)\nprint("naive doc :", parse.__doc__)\n\n# functools.wraps copies the original metadata onto the wrapper.\ndef clean(func):\n    @functools.wraps(func)\n    def wrapper(*a, **k):\n        return func(*a, **k)\n    return wrapper\n\n@clean\ndef parse2(text):\n    "Parse a row into fields."\n    return text.split(",")\n\nprint("wraps name:", parse2.__name__)\nprint("wraps doc :", parse2.__doc__)\n',
    demoOutput: 'naive name: wrapper\nnaive doc : None\nwraps name: parse2\nwraps doc : Parse a row into fields.',
    predict: {
      question: 'A naive decorator wraps parse(). What does parse.__name__ print afterwards?',
      options: ['\'parse\'', '\'wrapper\'', 'raises AttributeError'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Iteration & Context Managers ─────────────────────────
  {
    id: 'know-iterator-protocol', cluster: 'iteration',
    title: 'The iterator protocol behind for',
    subtitle: 'for is iter() plus next() until StopIteration.',
    difficulty: 'core', estimatedMin: 6,
    tags: ['iterators', 'protocol', 'stopiteration', 'for'],
    hook: 'A for loop looks like it walks an index from 0 upward. It does not. It asks the object for an iterator, then politely calls next() over and over until the object raises StopIteration to say "I am done".',
    demoCode: '# `for` does not loop by index. It calls iter(obj) once, then next(it)\n# repeatedly until StopIteration is raised. That is the iterator protocol.\nclass CountDown:\n    def __init__(self, start):\n        self.n = start\n    def __iter__(self):\n        return self           # I am my own iterator\n    def __next__(self):\n        if self.n <= 0:\n            raise StopIteration\n        self.n -= 1\n        return self.n + 1\n\nprint("loop:", [x for x in CountDown(3)])\n\n# Drive the protocol by hand to see the machine:\nit = iter([10, 20])\nprint(next(it))\nprint(next(it))\ntry:\n    next(it)\nexcept StopIteration:\n    print("exhausted")\n',
    demoOutput: 'loop: [3, 2, 1]\n10\n20\nexhausted',
    predict: {
      question: 'How does an iterator signal that there are no more values?',
      options: ['returns None', 'raises StopIteration', 'returns -1'],
      answerIndex: 1,
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
      options: ['No - the exception skips it', 'Yes - __exit__ always runs', 'Only if you catch the exception'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python'],
  },

  // ───────────────────────── Objects & Classes ─────────────────────────
  {
    id: 'know-eq-hash-contract', cluster: 'objects',
    title: 'The __eq__ / __hash__ contract',
    subtitle: 'Why adding __eq__ silently breaks set membership.',
    difficulty: 'stretch', estimatedMin: 7,
    tags: ['eq', 'hash', 'sets', 'dict-keys', 'contract'],
    hook: 'You add __eq__ so two points with the same coordinates compare equal. Reasonable. But now you cannot put your object in a set - Python quietly removed __hash__ the moment you defined __eq__, and the reason is a contract you must honor.',
    demoCode: '# Defining __eq__ makes Python DROP the default __hash__, so instances\n# become unhashable - they can no longer go in a set or be dict keys,\n# until you supply a matching __hash__.\nclass PointNoHash:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n\nprint("hashable?", PointNoHash.__hash__ is None)\ntry:\n    {PointNoHash(1, 2)}\nexcept TypeError:\n    print("cannot put in a set")\n\n# The contract: equal objects MUST have equal hashes. Build hash from\n# the same fields used by __eq__ (and make them immutable).\nclass Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n    def __hash__(self):\n        return hash((self.x, self.y))\n\nprint("dedup:", len({Point(1, 2), Point(1, 2), Point(3, 4)}))\n',
    demoOutput: 'hashable? True\ncannot put in a set\ndedup: 2',
    predict: {
      question: 'A class defines __eq__ but not __hash__. Can its instances go in a set?',
      options: ['Yes, always', 'No - it becomes unhashable', 'Only if frozen'],
      answerIndex: 1,
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
      options: ['True - generated __eq__ compares fields', 'False - different objects', 'raises TypeError'],
      answerIndex: 0,
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
      options: ['sets it to -300', 'raises ValueError from the setter', 'silently ignored'],
      answerIndex: 1,
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
      options: ['Easier to Ask Forgiveness than Permission', 'Evaluate All Functions And Pass', 'Explicit Args For Parameters'],
      answerIndex: 0,
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
      options: ['raises TypeError', 'returns "abab"', 'returns None'],
      answerIndex: 1,
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
      options: ['Twice', 'Once', 'Zero times'],
      answerIndex: 1,
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
    connectsTo: ['gotchas', 'python'],
  },
];

export default knowModules;

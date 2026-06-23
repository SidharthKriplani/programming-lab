// pyLabBatch_oop — migration batch: object-oriented Python (15 problems) from the legacy
// oopProblems bank into the PyLab contract (PYLAB-BUILD-SPEC §2,3,5,7).
//
// THE OOP REFRAME: PyLab grades solve()->output. These are CLASS-design problems, so each
// `solve()` DEFINES the class locally, DRIVES it (the old testSource run() body), and RETURNS
// the observable tuple (means, balances, equality bools, sort order, frozen/hashable probes).
// starterCode gives the same class skeleton + the SAME driver + return, so the user sees exactly
// what is checked - they only fill in the method bodies. fixtureId is empty (the driver builds
// every object); args=[].
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes inside;
// \n for newlines; escape PROSE apostrophes as \' ; NO template literals / backticks.
//
// Every solution + trap VERIFIED in CPython (3.10) via pl_compare {kind:'seq'}: all 15 are
// multi-method (canonical + ONE trap that RUNS and DIVERGES - a wrong CLASS design, not a
// syntax error). Each trap is a real runs-but-wrong: returns the sum not the mean, no overdraft
// guard, class-level shared count/list, __eq__ without __hash__, a stored (stale) area, a
// re-hardcoded base salary, IS-A list instead of HAS-A, __lt__ on the wrong field, a mutating
// __add__, a from_dict that ignores cls, an is_valid_id that lets bool through. Expected output
// is NEVER stored - it is computed from `solution`.

export const fixtures = {
  // Every OOP problem is self-contained: the driver inside solve() builds the objects, so the
  // fixtures carry no data - just an empty arg list and a preview of what the driver constructs.
  'fx_oop_running_average': {
    args: [],
    setup: '',
    preview: 'Driver builds a RunningAverage, reads mean() before any add (0.0), adds 10/20/30 (mean 20.0), adds 0 (mean 15.0). Returns (0.0, 20.0, 15.0).',
  },
  'fx_oop_bank_account': {
    args: [],
    setup: '',
    preview: 'Driver opens Account(100), deposits 50 (150), withdraws 30 (120), then opens Account(20) and tries to withdraw 50. Returns (150, 120, blocked?, balance-after). Canonical: (150, 120, True, 20).',
  },
  'fx_oop_batcher': {
    args: [],
    setup: '',
    preview: 'Driver runs three Batchers - size 3 over 7 ticks, size 1 over 3, size 5 over 4 - plus a two-fresh-instances independence probe. Each instance must count on its own.',
  },
  'fx_oop_event_record': {
    args: [],
    setup: '',
    preview: 'Driver builds Event("click", 3), checks field access, value equality of two equal Events, inequality, and that repr contains "Event(". Canonical: (("click",3), True, True, True).',
  },
  'fx_oop_coord': {
    args: [],
    setup: '',
    preview: 'Driver builds Coord(1,2), dedupes {Coord(1,2), Coord(1,2), Coord(3,4)} (len 2 if hashable), tries to write c.x=9 (must raise), and checks value equality. Canonical: ((1,2), 2, True, True).',
  },
  'fx_oop_cart': {
    args: [],
    setup: '',
    preview: 'Driver builds two Carts, adds "apple" to one only, and checks they stay isolated. Canonical: (default-empty?, isolated?, appended?) = (True, True, True). A shared list leaks across instances.',
  },
  'fx_oop_temperature': {
    args: [],
    setup: '',
    preview: 'Driver reads Temperature(20).celsius, sets a valid 5, tries to set -300 (must raise and leave 20), and tries to construct Temperature(-400) (must raise). Canonical: (True, True, True, True).',
  },
  'fx_oop_rectangle': {
    args: [],
    setup: '',
    preview: 'Driver checks Rectangle(4,5).area==20, that assigning r.area=99 raises, and that changing width recomputes area (6 -> 15). Canonical: (True, True, True).',
  },
  'fx_oop_employee': {
    args: [],
    setup: '',
    preview: 'Driver checks Employee("Ada",100).pay()==100, Manager("Lin",100,40).pay()==140, AND Manager("Mo",200,10).pay()==210 (the second base salary exposes a hardcoded override). Canonical: (100, 140, 210, True, True).',
  },
  'fx_oop_logger': {
    args: [],
    setup: '',
    preview: 'Driver logs three messages, reads history in order, clears, and checks the Logger is NOT a list (composition, not subclassing). Canonical: (["start","step","done"], [], True, True).',
  },
  'fx_oop_money': {
    args: [],
    setup: '',
    preview: 'Driver checks Money value equality, dedup in a set (len 2 if hashable), use as a dict key, and a labelled repr. Canonical: (True, 2, True, True). __eq__ without __hash__ makes it unhashable.',
  },
  'fx_oop_task': {
    args: [],
    setup: '',
    preview: 'Driver sorts [Task("c",3), Task("a",1), Task("b",2)] (-> a,b,c by priority), checks two direct < comparisons, and len(Task("deploy",1))==6. Canonical: (["a","b","c"], True, False, 6).',
  },
  'fx_oop_vec2': {
    args: [],
    setup: '',
    preview: 'Driver checks Vec2(1,2)+Vec2(3,4)==Vec2(4,6), value equality, inequality, and that a+b leaves a unchanged (no mutation). Canonical: (True, True, True, True).',
  },
  'fx_oop_user': {
    args: [],
    setup: '',
    preview: 'Driver builds User.from_dict({"name":"Ada","age":36}), checks it returns a User, normal init still works, AND that a subclass Admin.from_dict returns an Admin (cls, not hardcoded User). Canonical: (("Ada",36), True, True, True).',
  },
  'fx_oop_record': {
    args: [],
    setup: '',
    preview: 'Driver parses Record.from_row("7,alpha") (id cast to int), checks is_valid_id on 0/-1/"5" AND on True (a bool must be rejected). Canonical: ((7,"alpha"), True, True, True, False, False, False).',
  },
};

export const problems = [

  // ───────────────────── classes · running average · self-contained ─────────────────────
  {
    id: 'oop-running-average',
    title: 'A streaming running-average accumulator',
    topic: 'oop',
    difficulty: 'warmup',
    tags: ['classes', 'state', 'encapsulation'],
    estimatedMin: 5,
    fixtureId: 'fx_oop_running_average',
    prompt: 'You need an object that watches a stream of numbers and can report the average of everything it has seen so far, at any moment - returning 0 before it has seen anything. It must not hold on to the individual numbers, only enough to answer the question. The driver feeds it readings and asks for the average three times; return those three answers as a tuple.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class RunningAverage:\n        def __init__(self):\n            # set up internal counters\n            pass\n        def add(self, x):\n            # record one reading\n            pass\n        def mean(self):\n            # average so far; 0.0 if nothing added\n            pass\n    r = RunningAverage()\n    empty = r.mean()\n    r.add(10); r.add(20); r.add(30)\n    a = r.mean()\n    r.add(0)\n    b = r.mean()\n    return (empty, a, b)',
    hints: [
      'You can answer "what is the average so far" from just two numbers: how much has come in total, and how many readings there have been.',
      'mean() has to divide - so it must guard the moment when nothing has been added yet, returning 0.0 instead of dividing by zero.',
    ],
    solution: 'def solve():\n    class RunningAverage:\n        def __init__(self):\n            self._sum = 0.0\n            self._count = 0\n        def add(self, x):\n            self._sum += x\n            self._count += 1\n        def mean(self):\n            if self._count == 0:\n                return 0.0\n            return self._sum / self._count\n    r = RunningAverage()\n    empty = r.mean()\n    r.add(10); r.add(20); r.add(30)\n    a = r.mean()\n    r.add(0)\n    b = r.mean()\n    return (empty, a, b)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the third reading. The trap keeps a running sum and count correctly but mean() returns the SUM instead of dividing by the count, so after 10/20/30 it reports 60.0 where the average is 20.0, and after the extra 0 it still says 60.0 instead of 15.0. It runs and returns three numbers - they are just totals, not means. The honest version divides sum by count and guards the empty case so it returns 0.0 rather than dividing by zero.',
    canonicalMethodId: 'running_sum_count',
    methods: [
      { id: 'running_sum_count', name: 'running sum + count', code: 'class RunningAverage:\n    def __init__(self):\n        self._sum = 0.0\n        self._count = 0\n    def add(self, x):\n        self._sum += x\n        self._count += 1\n    def mean(self):\n        if self._count == 0:\n            return 0.0\n        return self._sum / self._count\nr = RunningAverage()\nempty = r.mean()\nr.add(10); r.add(20); r.add(30)\na = r.mean()\nr.add(0)\nb = r.mean()\nreturn (empty, a, b)', detectionSignature: { mustMatch: ['/ self._count'], mustNotMatch: [], note: 'divides the running sum by the count' }, tradeoff: 'O(1) memory and O(1) per reading - it never stores the stream.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'returns_sum', name: 'mean() returns the sum', code: 'class RunningAverage:\n    def __init__(self):\n        self._sum = 0.0\n        self._count = 0\n    def add(self, x):\n        self._sum += x\n        self._count += 1\n    def mean(self):\n        return self._sum\nr = RunningAverage()\nempty = r.mean()\nr.add(10); r.add(20); r.add(30)\na = r.mean()\nr.add(0)\nb = r.mean()\nreturn (empty, a, b)', detectionSignature: { mustMatch: ['return self._sum'], mustNotMatch: ['/ self._count'], note: 'forgets to divide by the count' }, tradeoff: 'Runs cleanly and returns a number for each call.', breaksWhen: 'Always wrong once more than one reading is in - it reports the total, not the average.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the second design return 60.0 where the average is 20.0?', options: ['running_sum_count', 'returns_sum'], answerId: 'returns_sum', explanation: 'mean() returns the accumulated sum without dividing by the count, so it reports the total of the readings rather than their average. The shape is right (a number per call), the arithmetic is not.' },
    ],
  },

  // ───────────────────── classes · bank account · self-contained ─────────────────────
  {
    id: 'oop-bank-account',
    title: 'A bank account with a guarded balance',
    topic: 'oop',
    difficulty: 'warmup',
    tags: ['classes', 'invariant', 'exceptions'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_bank_account',
    prompt: 'Model an account opened with a starting balance. It can take deposits and pay out withdrawals, but it must never let the balance go negative - a withdrawal larger than the current balance has to be refused by raising an error, leaving the balance untouched. The driver runs a normal deposit and withdrawal, then attempts an over-limit withdrawal; return the balances and whether the bad withdrawal was blocked.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Account:\n        def __init__(self, balance):\n            # store the opening balance\n            pass\n        def deposit(self, amount):\n            pass\n        def withdraw(self, amount):\n            # refuse if amount exceeds the balance\n            pass\n    acc = Account(100)\n    acc.deposit(50)\n    a = acc.balance\n    acc.withdraw(30)\n    b = acc.balance\n    over = Account(20)\n    try:\n        over.withdraw(50)\n        blocked = False\n    except ValueError:\n        blocked = True\n    return (a, b, blocked, over.balance)',
    hints: [
      'The withdraw method is the only place the rule lives - before it subtracts, it has to check whether the amount is more than what is there.',
      'Refusing means raising ValueError, not just returning - and the balance must stay exactly as it was when you refuse.',
    ],
    solution: 'def solve():\n    class Account:\n        def __init__(self, balance):\n            self.balance = balance\n        def deposit(self, amount):\n            self.balance += amount\n        def withdraw(self, amount):\n            if amount > self.balance:\n                raise ValueError("insufficient funds")\n            self.balance -= amount\n    acc = Account(100)\n    acc.deposit(50)\n    a = acc.balance\n    acc.withdraw(30)\n    b = acc.balance\n    over = Account(20)\n    try:\n        over.withdraw(50)\n        blocked = False\n    except ValueError:\n        blocked = True\n    return (a, b, blocked, over.balance)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the over-limit withdrawal. The trap subtracts unconditionally, so withdrawing 50 from a balance of 20 succeeds, never raises, and drives the balance to -30 - the tuple comes back (150, 120, False, -30) where the guarded version returns (150, 120, True, 20). It runs; it just lets the account go overdrawn, the exact invariant the class exists to protect. The guard belongs inside withdraw so no caller can bypass it.',
    canonicalMethodId: 'guarded_withdraw',
    methods: [
      { id: 'guarded_withdraw', name: 'withdraw guards the balance', code: 'class Account:\n    def __init__(self, balance):\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\nacc = Account(100)\nacc.deposit(50)\na = acc.balance\nacc.withdraw(30)\nb = acc.balance\nover = Account(20)\ntry:\n    over.withdraw(50)\n    blocked = False\nexcept ValueError:\n    blocked = True\nreturn (a, b, blocked, over.balance)', detectionSignature: { mustMatch: ['raise ValueError'], mustNotMatch: [], note: 'refuses an over-limit withdrawal' }, tradeoff: 'The invariant is enforced where the state changes - no caller can overdraw.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'no_guard', name: 'withdraw without the guard', code: 'class Account:\n    def __init__(self, balance):\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount\n    def withdraw(self, amount):\n        self.balance -= amount\nacc = Account(100)\nacc.deposit(50)\na = acc.balance\nacc.withdraw(30)\nb = acc.balance\nover = Account(20)\ntry:\n    over.withdraw(50)\n    blocked = False\nexcept ValueError:\n    blocked = True\nreturn (a, b, blocked, over.balance)', detectionSignature: { mustMatch: ['self.balance -= amount'], mustNotMatch: ['raise ValueError'], note: 'subtracts unconditionally, allowing overdraft' }, tradeoff: 'Deposit and normal withdrawals look right.', breaksWhen: 'Any withdrawal larger than the balance - it silently drives the account negative instead of refusing.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the unguarded design leave the balance at -30?', options: ['guarded_withdraw', 'no_guard'], answerId: 'no_guard', explanation: 'Without the amount > balance check, withdraw subtracts every time, so withdrawing 50 from 20 succeeds and the balance goes negative. The class is supposed to make that impossible - the guard has to live inside the method.' },
    ],
  },

  // ───────────────────── classes · batcher counter · self-contained ─────────────────────
  {
    id: 'oop-rate-limiter-counter',
    title: 'A counter that fires every Nth call',
    topic: 'oop',
    difficulty: 'core',
    tags: ['classes', 'instance-state', 'modulo'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_batcher',
    prompt: 'Build the "flush every N events" object a buffered writer uses: set up with a size n, and each time it is poked it answers yes only when the number of pokes so far is an exact multiple of n - the nth, 2nth, and so on - and no otherwise. Crucially, two of these objects must count independently of each other. The driver runs three of them at different sizes plus an independence check; return all four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Batcher:\n        def __init__(self, n):\n            # remember the size and start a tick count\n            pass\n        def tick(self):\n            # True on every nth tick, else False\n            pass\n    def run(n, calls):\n        b = Batcher(n)\n        return [b.tick() for _ in range(calls)]\n    a = run(3, 7)\n    b = run(1, 3)\n    c = run(5, 4)\n    indep = (Batcher(2).tick() is False) and (Batcher(2).tick() is False)\n    return (a, b, c, indep)',
    hints: [
      '"Is this the nth call" is just arithmetic: keep a count of pokes and test whether it divides evenly by n.',
      'For two objects to count independently, each one needs its OWN count - so the count has to be set up per instance, not shared by the class.',
    ],
    solution: 'def solve():\n    class Batcher:\n        def __init__(self, n):\n            self._n = n\n            self._count = 0\n        def tick(self):\n            self._count += 1\n            return self._count % self._n == 0\n    def run(n, calls):\n        b = Batcher(n)\n        return [b.tick() for _ in range(calls)]\n    a = run(3, 7)\n    b = run(1, 3)\n    c = run(5, 4)\n    indep = (Batcher(2).tick() is False) and (Batcher(2).tick() is False)\n    return (a, b, c, indep)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the independence probe at the end. The trap stores the count as a CLASS attribute, so every Batcher shares one counter: the three run() calls each leave the shared count where they finished, and by the time the two fresh Batcher(2) instances are poked the count is already odd, so the second one returns True where it should be False. The per-instance design (self._count in __init__) gives each object its own counter - that is the whole reason to prefer instance state over a shared global.',
    canonicalMethodId: 'instance_count',
    methods: [
      { id: 'instance_count', name: 'per-instance count', code: 'class Batcher:\n    def __init__(self, n):\n        self._n = n\n        self._count = 0\n    def tick(self):\n        self._count += 1\n        return self._count % self._n == 0\ndef run(n, calls):\n    b = Batcher(n)\n    return [b.tick() for _ in range(calls)]\na = run(3, 7)\nb = run(1, 3)\nc = run(5, 4)\nindep = (Batcher(2).tick() is False) and (Batcher(2).tick() is False)\nreturn (a, b, c, indep)', detectionSignature: { mustMatch: ['self._count = 0'], mustNotMatch: [], note: 'count is set up per instance in __init__' }, tradeoff: 'Each Batcher carries its own count - instances never interfere.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'shared_class_count', name: 'count shared on the class', code: 'class Batcher:\n    _count = 0\n    def __init__(self, n):\n        self._n = n\n    def tick(self):\n        Batcher._count += 1\n        return Batcher._count % self._n == 0\ndef run(n, calls):\n    b = Batcher(n)\n    return [b.tick() for _ in range(calls)]\na = run(3, 7)\nb = run(1, 3)\nc = run(5, 4)\nindep = (Batcher(2).tick() is False) and (Batcher(2).tick() is False)\nreturn (a, b, c, indep)', detectionSignature: { mustMatch: ['Batcher._count'], mustNotMatch: ['self._count = 0'], note: 'the counter is a single class attribute shared by all instances' }, tradeoff: 'Looks identical on a single isolated Batcher.', breaksWhen: 'The moment a second Batcher exists - they share one counter, so one instance\'s ticks bleed into the other.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the shared-count design fail only the independence check?', options: ['instance_count', 'shared_class_count'], answerId: 'shared_class_count', explanation: 'A class attribute is one object shared by every instance, so all Batchers increment the same counter. A single Batcher behaves fine, but two of them interfere - the second fresh instance inherits a count the first runs already advanced.' },
    ],
  },

  // ───────────────────── dataclasses · event record · self-contained ─────────────────────
  {
    id: 'oop-dataclass-record',
    title: 'A data record with free equality and repr',
    topic: 'oop',
    difficulty: 'warmup',
    tags: ['dataclasses', 'equality', 'repr'],
    estimatedMin: 5,
    fixtureId: 'fx_oop_event_record',
    prompt: 'You need a small record type with two fields, a name and a count, where two records holding the same values count as equal and printing one shows its field values. Writing the constructor, the equality, and the printable form all by hand is exactly the boilerplate Python can generate for you. The driver builds a record and checks field access, value equality, inequality, and that its printout is labelled; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    from dataclasses import dataclass\n    # define a record type with fields: name (str), count (int),\n    # such that equal field values mean equal records and repr is labelled\n    class Event:\n        pass\n    e = Event("click", 3)\n    fields = (e.name, e.count)\n    eq = Event("click", 3) == Event("click", 3)\n    neq = Event("click", 3) != Event("click", 4)\n    has_repr = "Event(" in repr(Event("view", 1))\n    return (fields, eq, neq, has_repr)',
    hints: [
      'Python can generate the constructor, the value-equality, and the printable form for you from just the field declarations - you only have to name the fields and their types.',
      'A plain hand-written class compares by identity (two separate objects are never equal) - the generated version compares by field values instead.',
    ],
    solution: 'def solve():\n    from dataclasses import dataclass\n    @dataclass\n    class Event:\n        name: str\n        count: int\n    e = Event("click", 3)\n    fields = (e.name, e.count)\n    eq = Event("click", 3) == Event("click", 3)\n    neq = Event("click", 3) != Event("click", 4)\n    has_repr = "Event(" in repr(Event("view", 1))\n    return (fields, eq, neq, has_repr)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the equality of two separate records. The trap is a plain class with a hand-written __init__ but no __eq__, so Event("click", 3) == Event("click", 3) compares by identity and returns False - two distinct objects are never equal by default - and its repr is the default <__main__...Event object at 0x...> form, which does not contain "Event(". So the tuple comes back (("click",3), False, True, False). The dataclass decorator generates __init__, __eq__, and __repr__ from the field declarations, giving value equality and a labelled repr for free.',
    canonicalMethodId: 'dataclass',
    methods: [
      { id: 'dataclass', name: 'a dataclass', code: 'from dataclasses import dataclass\n@dataclass\nclass Event:\n    name: str\n    count: int\ne = Event("click", 3)\nfields = (e.name, e.count)\neq = Event("click", 3) == Event("click", 3)\nneq = Event("click", 3) != Event("click", 4)\nhas_repr = "Event(" in repr(Event("view", 1))\nreturn (fields, eq, neq, has_repr)', detectionSignature: { mustMatch: ['@dataclass'], mustNotMatch: [], note: 'generates init, eq and repr from the fields' }, tradeoff: 'Zero boilerplate; value equality and a labelled repr come for free.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'plain_class', name: 'plain class, hand-written init only', code: 'class Event:\n    def __init__(self, name, count):\n        self.name = name\n        self.count = count\ne = Event("click", 3)\nfields = (e.name, e.count)\neq = Event("click", 3) == Event("click", 3)\nneq = Event("click", 3) != Event("click", 4)\nhas_repr = "Event(" in repr(Event("view", 1))\nreturn (fields, eq, neq, has_repr)', detectionSignature: { mustMatch: ['def __init__'], mustNotMatch: ['@dataclass', 'def __eq__'], note: 'no __eq__ -> identity equality; no __repr__ -> default repr' }, tradeoff: 'Field access works fine.', breaksWhen: 'Any value comparison or printout - it falls back to identity equality and the default object repr.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the plain class report two equal records as unequal?', options: ['dataclass', 'plain_class'], answerId: 'plain_class', explanation: 'Without __eq__, Python compares objects by identity, so two separately-constructed Events are never equal even with identical fields. The dataclass decorator generates a field-based __eq__ (and __repr__), which is what value records need.' },
    ],
  },

  // ───────────────────── dataclasses · frozen coord · self-contained ─────────────────────
  {
    id: 'oop-frozen-point',
    title: 'An immutable, hashable coordinate',
    topic: 'oop',
    difficulty: 'core',
    tags: ['dataclasses', 'immutability', 'hashable'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_coord',
    prompt: 'You need a coordinate value with two integer fields that, once built, can never be changed - assigning to a field afterward should fail - and that can be dropped into a set so duplicates collapse. The driver builds coords, puts duplicates in a set, attempts a field write, and checks value equality; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    from dataclasses import dataclass, FrozenInstanceError\n    # define an immutable coordinate with int fields x and y\n    class Coord:\n        pass\n    xy = (Coord(1, 2).x, Coord(1, 2).y)\n    set_len = len({Coord(1, 2), Coord(1, 2), Coord(3, 4)})\n    c = Coord(1, 2)\n    try:\n        c.x = 9\n        write_blocked = False\n    except FrozenInstanceError:\n        write_blocked = True\n    veq = Coord(0, 0) == Coord(0, 0)\n    return (xy, set_len, write_blocked, veq)',
    hints: [
      'Making the record immutable also makes it hashable, which is exactly what a set needs to collapse duplicates.',
      'A mutable record is not hashable - dropping it into a set raises, and assigning to a field afterward just silently succeeds instead of being refused.',
    ],
    solution: 'def solve():\n    from dataclasses import dataclass, FrozenInstanceError\n    @dataclass(frozen=True)\n    class Coord:\n        x: int\n        y: int\n    xy = (Coord(1, 2).x, Coord(1, 2).y)\n    set_len = len({Coord(1, 2), Coord(1, 2), Coord(3, 4)})\n    c = Coord(1, 2)\n    try:\n        c.x = 9\n        write_blocked = False\n    except FrozenInstanceError:\n        write_blocked = True\n    veq = Coord(0, 0) == Coord(0, 0)\n    return (xy, set_len, write_blocked, veq)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the set and the field write together. A non-frozen dataclass has value equality but Python makes it UNHASHABLE, so building the set raises TypeError (the driver catches it and records -1), and the c.x = 9 assignment just succeeds instead of being refused, so write_blocked comes back False - the tuple is ((1,2), -1, False, True) against the frozen ((1,2), 2, True, True). Freezing the dataclass makes the fields read-only after construction and auto-generates the hash, so duplicates collapse in the set and the stray write is refused.',
    canonicalMethodId: 'frozen',
    methods: [
      { id: 'frozen', name: 'frozen dataclass', code: 'from dataclasses import dataclass, FrozenInstanceError\n@dataclass(frozen=True)\nclass Coord:\n    x: int\n    y: int\nxy = (Coord(1, 2).x, Coord(1, 2).y)\nset_len = len({Coord(1, 2), Coord(1, 2), Coord(3, 4)})\nc = Coord(1, 2)\ntry:\n    c.x = 9\n    write_blocked = False\nexcept FrozenInstanceError:\n    write_blocked = True\nveq = Coord(0, 0) == Coord(0, 0)\nreturn (xy, set_len, write_blocked, veq)', detectionSignature: { mustMatch: ['frozen=True'], mustNotMatch: [], note: 'read-only fields, auto __hash__' }, tradeoff: 'Immutable and hashable - safe as a set member or dict key.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'not_frozen', name: 'plain (mutable) dataclass', code: 'from dataclasses import dataclass, FrozenInstanceError\n@dataclass\nclass Coord:\n    x: int\n    y: int\nxy = (Coord(1, 2).x, Coord(1, 2).y)\ntry:\n    set_len = len({Coord(1, 2), Coord(1, 2), Coord(3, 4)})\nexcept TypeError:\n    set_len = -1\nc = Coord(1, 2)\ntry:\n    c.x = 9\n    write_blocked = False\nexcept FrozenInstanceError:\n    write_blocked = True\nveq = Coord(0, 0) == Coord(0, 0)\nreturn (xy, set_len, write_blocked, veq)', detectionSignature: { mustMatch: ['@dataclass'], mustNotMatch: ['frozen=True'], note: 'no frozen -> unhashable and writable' }, tradeoff: 'Construction and equality look fine.', breaksWhen: 'The moment you need it in a set or want writes refused - a mutable dataclass is unhashable and its fields stay assignable.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can the non-frozen coord not go into a set?', options: ['frozen', 'not_frozen'], answerId: 'not_frozen', explanation: 'A dataclass with value equality but no frozen=True is unhashable - Python will not let a mutable, value-equal object be a set member or dict key, because its hash could change. frozen=True makes the fields read-only and generates a stable __hash__.' },
    ],
  },

  // ───────────────────── dataclasses · default_factory · self-contained ─────────────────────
  {
    id: 'oop-dataclass-default-factory',
    title: 'Each instance gets its own list',
    topic: 'oop',
    difficulty: 'core',
    tags: ['dataclasses', 'mutable-default', 'footgun'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_cart',
    prompt: 'Build a cart that starts empty and lets you add items to it. The catch every beginner hits: two carts built the same way must NOT share one list - adding to one must leave the other empty. The driver builds two carts, adds an item to one, and checks they stayed isolated; return whether the cart starts empty, whether the two stayed isolated, and whether adds accumulate.',
    signature: 'solve()',
    starterCode: 'def solve():\n    from dataclasses import dataclass, field\n    # define a cart whose items list is FRESH per instance (not shared),\n    # with add(x) appending to this instance only\n    class Cart:\n        pass\n    default_empty = Cart().items == []\n    a = Cart(); b = Cart()\n    a.add("apple")\n    isolated = a.items == ["apple"] and b.items == []\n    c = Cart(); c.add("x"); c.add("y")\n    appended = c.items == ["x", "y"]\n    return (default_empty, isolated, appended)',
    hints: [
      'The list has to be created freshly each time a cart is built - a default that is written once and reused will be the SAME list for every cart.',
      'There is a dedicated way to declare "call this to make a fresh default per instance" rather than handing every instance one shared object.',
    ],
    solution: 'def solve():\n    from dataclasses import dataclass, field\n    @dataclass\n    class Cart:\n        items: list = field(default_factory=list)\n        def add(self, x):\n            self.items.append(x)\n    default_empty = Cart().items == []\n    a = Cart(); b = Cart()\n    a.add("apple")\n    isolated = a.items == ["apple"] and b.items == []\n    c = Cart(); c.add("x"); c.add("y")\n    appended = c.items == ["x", "y"]\n    return (default_empty, isolated, appended)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the second cart. The trap declares the list as a class attribute (items = []), which creates ONE list shared by every instance: appending "apple" to cart a leaves cart b holding ["apple"] too, so isolated comes back False, and the later cart c is polluted by earlier adds. The tuple is (True, False, False) against the correct (True, True, True). Declaring the field with a per-instance factory makes Python build a fresh empty list for each cart - the dataclass cure for the classic mutable-default trap.',
    canonicalMethodId: 'default_factory',
    methods: [
      { id: 'default_factory', name: 'per-instance factory', code: 'from dataclasses import dataclass, field\n@dataclass\nclass Cart:\n    items: list = field(default_factory=list)\n    def add(self, x):\n        self.items.append(x)\ndefault_empty = Cart().items == []\na = Cart(); b = Cart()\na.add("apple")\nisolated = a.items == ["apple"] and b.items == []\nc = Cart(); c.add("x"); c.add("y")\nappended = c.items == ["x", "y"]\nreturn (default_empty, isolated, appended)', detectionSignature: { mustMatch: ['default_factory'], mustNotMatch: [], note: 'fresh list per instance' }, tradeoff: 'Each cart owns its own list - no cross-contamination.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'shared_list', name: 'shared class-level list', code: 'class Cart:\n    items = []\n    def add(self, x):\n        self.items.append(x)\ndefault_empty = Cart().items == []\na = Cart(); b = Cart()\na.add("apple")\nisolated = a.items == ["apple"] and b.items == []\nc = Cart(); c.add("x"); c.add("y")\nappended = c.items == ["x", "y"]\nreturn (default_empty, isolated, appended)', detectionSignature: { mustMatch: ['items = []'], mustNotMatch: ['default_factory'], note: 'one list object shared by every instance' }, tradeoff: 'A brand-new cart still looks empty.', breaksWhen: 'The moment two carts exist - they share the one list, so an add to one leaks into all of them.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does adding "apple" to one cart leak into the other?', options: ['default_factory', 'shared_list'], answerId: 'shared_list', explanation: 'A class-level items = [] creates a single list evaluated once and shared by every instance, so appending to one cart mutates the one list all carts see. default_factory=list calls list() fresh for each instance, giving every cart its own.' },
    ],
  },

  // ───────────────────── properties · temperature validation · self-contained ─────────────────────
  {
    id: 'oop-property-validation',
    title: 'A temperature that rejects impossible values',
    topic: 'oop',
    difficulty: 'core',
    tags: ['properties', 'validation', 'setter'],
    estimatedMin: 7,
    fixtureId: 'fx_oop_temperature',
    prompt: 'Build a temperature object you read and set with ordinary attribute syntax, but which refuses any value below absolute zero (-273.15) - both when set later AND at construction time - by raising an error and keeping its old value. Valid reads and writes behave normally. The driver reads, sets a valid value, tries an illegal set, and tries an illegal construction; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Temperature:\n        def __init__(self, celsius):\n            # route the initial value through the validating set path\n            pass\n        # expose celsius for read AND set, rejecting values below -273.15 on set\n    reads = Temperature(20).celsius == 20\n    t = Temperature(20)\n    t.celsius = 5\n    valid_set = t.celsius == 5\n    t2 = Temperature(20)\n    try:\n        t2.celsius = -300\n        rejected = False\n    except ValueError:\n        rejected = t2.celsius == 20\n    try:\n        Temperature(-400)\n        init_validated = False\n    except ValueError:\n        init_validated = True\n    return (reads, valid_set, rejected, init_validated)',
    hints: [
      'You want plain t.celsius = x assignment to still run a check - that means routing reads and writes through a managed attribute that wraps a hidden backing field.',
      'If __init__ assigns through the same managed set path (not straight to a hidden field), then even construction cannot sneak in an invalid value.',
    ],
    solution: 'def solve():\n    class Temperature:\n        def __init__(self, celsius):\n            self.celsius = celsius\n        @property\n        def celsius(self):\n            return self._celsius\n        @celsius.setter\n        def celsius(self, value):\n            if value < -273.15:\n                raise ValueError("below absolute zero")\n            self._celsius = value\n    reads = Temperature(20).celsius == 20\n    t = Temperature(20)\n    t.celsius = 5\n    valid_set = t.celsius == 5\n    t2 = Temperature(20)\n    try:\n        t2.celsius = -300\n        rejected = False\n    except ValueError:\n        rejected = t2.celsius == 20\n    try:\n        Temperature(-400)\n        init_validated = False\n    except ValueError:\n        init_validated = True\n    return (reads, valid_set, rejected, init_validated)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the illegal set. The trap stores celsius as a plain attribute with no managed setter, so t2.celsius = -300 just succeeds - nothing checks it - rejected comes back False, and constructing Temperature(-400) is accepted too. The tuple is (True, True, False, False) against the guarded (True, True, True, True). A managed attribute with a setter lets ordinary t.celsius = x assignment still run the validation, and routing __init__ through that same set path means even construction cannot create an invalid instance.',
    canonicalMethodId: 'property_setter',
    methods: [
      { id: 'property_setter', name: 'property with a validating setter', code: 'class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n    @property\n    def celsius(self):\n        return self._celsius\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError("below absolute zero")\n        self._celsius = value\nreads = Temperature(20).celsius == 20\nt = Temperature(20)\nt.celsius = 5\nvalid_set = t.celsius == 5\nt2 = Temperature(20)\ntry:\n    t2.celsius = -300\n    rejected = False\nexcept ValueError:\n    rejected = t2.celsius == 20\ntry:\n    Temperature(-400)\n    init_validated = False\nexcept ValueError:\n    init_validated = True\nreturn (reads, valid_set, rejected, init_validated)', detectionSignature: { mustMatch: ['@celsius.setter'], mustNotMatch: [], note: 'plain assignment runs the check' }, tradeoff: 'Validation fires on every set, including in __init__ - no invalid instance can exist.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'plain_attr', name: 'plain attribute, no guard', code: 'class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\nreads = Temperature(20).celsius == 20\nt = Temperature(20)\nt.celsius = 5\nvalid_set = t.celsius == 5\nt2 = Temperature(20)\ntry:\n    t2.celsius = -300\n    rejected = False\nexcept ValueError:\n    rejected = t2.celsius == 20\ntry:\n    Temperature(-400)\n    init_validated = False\nexcept ValueError:\n    init_validated = True\nreturn (reads, valid_set, rejected, init_validated)', detectionSignature: { mustMatch: ['self.celsius = celsius'], mustNotMatch: ['@property', '@celsius.setter'], note: 'no managed setter -> nothing validates' }, tradeoff: 'Reading and setting valid values works.', breaksWhen: 'Any out-of-range value - it is accepted silently, both on set and at construction.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the plain-attribute version accept -300?', options: ['property_setter', 'plain_attr'], answerId: 'plain_attr', explanation: 'A bare attribute assignment runs no code, so there is nothing to reject the value. A property setter intercepts t.celsius = x and runs the check; routing __init__ through it guards construction too.' },
    ],
  },

  // ───────────────────── properties · computed area · self-contained ─────────────────────
  {
    id: 'oop-computed-property',
    title: 'A read-only area that stays in sync',
    topic: 'oop',
    difficulty: 'warmup',
    tags: ['properties', 'computed', 'read-only'],
    estimatedMin: 5,
    fixtureId: 'fx_oop_rectangle',
    prompt: 'Build a rectangle with a width and a height that also exposes its area - but the area must be DERIVED from the two sides on every read, never stored, so it can never drift out of sync when a side changes, and trying to assign to it must fail. The driver checks the area, tries to assign to it, and changes a side then re-reads; return those three results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Rectangle:\n        def __init__(self, width, height):\n            pass\n        # expose area as a READ-ONLY value computed from width and height on access\n    computes = Rectangle(4, 5).area == 20\n    r = Rectangle(2, 3)\n    try:\n        r.area = 99\n        read_only = False\n    except AttributeError:\n        read_only = True\n    r2 = Rectangle(2, 3)\n    before = r2.area\n    r2.width = 5\n    after = r2.area\n    recomputes = (before, after) == (6, 15)\n    return (computes, read_only, recomputes)',
    hints: [
      'If area is computed from width and height every time it is read, it can never go stale when a side changes - there is nothing stored to fall behind.',
      'A computed value with no way to set it is read-only: assigning to it raises. Storing area as a real attribute in __init__ makes it both assignable AND stale.',
    ],
    solution: 'def solve():\n    class Rectangle:\n        def __init__(self, width, height):\n            self.width = width\n            self.height = height\n        @property\n        def area(self):\n            return self.width * self.height\n    computes = Rectangle(4, 5).area == 20\n    r = Rectangle(2, 3)\n    try:\n        r.area = 99\n        read_only = False\n    except AttributeError:\n        read_only = True\n    r2 = Rectangle(2, 3)\n    before = r2.area\n    r2.width = 5\n    after = r2.area\n    recomputes = (before, after) == (6, 15)\n    return (computes, read_only, recomputes)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the two failures together. The trap stores area as a real attribute in __init__ (self.area = width * height), so it is a plain writable field: r.area = 99 succeeds (read_only comes back False), and after changing the width the stored area is still 6, not 15, so recomputes is False too. The tuple is (True, False, False) against the computed (True, True, True). A getter-only property derives area from the sides on every access, so it cannot be assigned and cannot drift stale.',
    canonicalMethodId: 'computed_property',
    methods: [
      { id: 'computed_property', name: 'getter-only property', code: 'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    @property\n    def area(self):\n        return self.width * self.height\ncomputes = Rectangle(4, 5).area == 20\nr = Rectangle(2, 3)\ntry:\n    r.area = 99\n    read_only = False\nexcept AttributeError:\n    read_only = True\nr2 = Rectangle(2, 3)\nbefore = r2.area\nr2.width = 5\nafter = r2.area\nrecomputes = (before, after) == (6, 15)\nreturn (computes, read_only, recomputes)', detectionSignature: { mustMatch: ['@property'], mustNotMatch: ['self.area ='], note: 'area derived on read, no setter' }, tradeoff: 'Always in sync with the sides; assignment is refused.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'stored_attr', name: 'area stored in __init__', code: 'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n        self.area = width * height\ncomputes = Rectangle(4, 5).area == 20\nr = Rectangle(2, 3)\ntry:\n    r.area = 99\n    read_only = False\nexcept AttributeError:\n    read_only = True\nr2 = Rectangle(2, 3)\nbefore = r2.area\nr2.width = 5\nafter = r2.area\nrecomputes = (before, after) == (6, 15)\nreturn (computes, read_only, recomputes)', detectionSignature: { mustMatch: ['self.area ='], mustNotMatch: ['@property'], note: 'area is a plain attribute, computed once' }, tradeoff: 'The initial area is correct.', breaksWhen: 'As soon as a side changes (stale value) or someone assigns to area (it accepts the write) - it is just a normal attribute.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the stored-area version report a stale value after the width changes?', options: ['computed_property', 'stored_attr'], answerId: 'stored_attr', explanation: 'Storing area in __init__ computes it once; changing width later does not touch the stored number, so it goes stale. A getter-only property recomputes width * height on every read, so it cannot drift - and with no setter, assigning to it raises.' },
    ],
  },

  // ───────────────────── inheritance · override via super · self-contained ─────────────────────
  {
    id: 'oop-inheritance-override',
    title: 'A subclass that extends, not replaces, the base',
    topic: 'oop',
    difficulty: 'core',
    tags: ['inheritance', 'super', 'override'],
    estimatedMin: 7,
    fixtureId: 'fx_oop_employee',
    prompt: 'A base employee has a name and a pay that returns a salary. Build a manager that is a kind of employee but also earns a bonus: its pay is the employee\'s pay PLUS the bonus - and it must compute the base pay by reusing the parent\'s logic, not by re-typing the salary, so a change to how base pay works flows through automatically. The driver checks base pay, a manager\'s pay, ANOTHER manager on a different salary, the inherited name, and the type; return all five results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Employee:\n        def __init__(self, name, salary):\n            self.name = name\n            self.salary = salary\n        def pay(self):\n            return self.salary\n    class Manager(Employee):\n        def __init__(self, name, salary, bonus):\n            # reuse the base init, then record the bonus\n            pass\n        def pay(self):\n            # the base pay (via the parent) PLUS the bonus\n            pass\n    base = Employee("Ada", 100).pay()\n    override = Manager("Lin", 100, 40).pay()\n    other = Manager("Mo", 200, 10).pay()\n    name_ok = Manager("Lin", 100, 40).name == "Lin"\n    is_emp = isinstance(Manager("Lin", 100, 40), Employee)\n    return (base, override, other, name_ok, is_emp)',
    hints: [
      'The manager\'s constructor and pay should both build on the parent\'s versions rather than copying them - reuse the parent\'s setup, then add the bonus on top of the parent\'s pay.',
      'If you re-type the base salary as a literal inside the override instead of asking the parent, a manager on a different salary will come out wrong.',
    ],
    solution: 'def solve():\n    class Employee:\n        def __init__(self, name, salary):\n            self.name = name\n            self.salary = salary\n        def pay(self):\n            return self.salary\n    class Manager(Employee):\n        def __init__(self, name, salary, bonus):\n            super().__init__(name, salary)\n            self.bonus = bonus\n        def pay(self):\n            return super().pay() + self.bonus\n    base = Employee("Ada", 100).pay()\n    override = Manager("Lin", 100, 40).pay()\n    other = Manager("Mo", 200, 10).pay()\n    name_ok = Manager("Lin", 100, 40).name == "Lin"\n    is_emp = isinstance(Manager("Lin", 100, 40), Employee)\n    return (base, override, other, name_ok, is_emp)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the second manager, Mo, on a salary of 200. The trap re-types the base salary as a literal inside pay() (return 100 + self.bonus) instead of calling the parent, so it happens to match for Lin (100 + 40 = 140) but Mo comes out 110 where the parent-based answer is 210. The tuple is (100, 140, 110, True, True) against (100, 140, 210, True, True). Calling super().pay() reuses the parent\'s salary logic, so any change to how base pay is computed flows into the subclass automatically - the whole point of building on the parent rather than copying it.',
    canonicalMethodId: 'super_call',
    methods: [
      { id: 'super_call', name: 'pay() calls super().pay()', code: 'class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n    def pay(self):\n        return self.salary\nclass Manager(Employee):\n    def __init__(self, name, salary, bonus):\n        super().__init__(name, salary)\n        self.bonus = bonus\n    def pay(self):\n        return super().pay() + self.bonus\nbase = Employee("Ada", 100).pay()\noverride = Manager("Lin", 100, 40).pay()\nother = Manager("Mo", 200, 10).pay()\nname_ok = Manager("Lin", 100, 40).name == "Lin"\nis_emp = isinstance(Manager("Lin", 100, 40), Employee)\nreturn (base, override, other, name_ok, is_emp)', detectionSignature: { mustMatch: ['super().pay()'], mustNotMatch: [], note: 'extends the parent result' }, tradeoff: 'The override builds on the parent, so base-pay changes propagate.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'hardcode_base', name: 'pay() re-hardcodes the salary', code: 'class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n    def pay(self):\n        return self.salary\nclass Manager(Employee):\n    def __init__(self, name, salary, bonus):\n        super().__init__(name, salary)\n        self.bonus = bonus\n    def pay(self):\n        return 100 + self.bonus\nbase = Employee("Ada", 100).pay()\noverride = Manager("Lin", 100, 40).pay()\nother = Manager("Mo", 200, 10).pay()\nname_ok = Manager("Lin", 100, 40).name == "Lin"\nis_emp = isinstance(Manager("Lin", 100, 40), Employee)\nreturn (base, override, other, name_ok, is_emp)', detectionSignature: { mustMatch: ['return 100 +'], mustNotMatch: ['super().pay()'], note: 'bakes the base salary in as a literal' }, tradeoff: 'Looks correct for a manager whose salary happens to be 100.', breaksWhen: 'Any manager on a different salary - the hardcoded literal ignores their actual base pay.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the hardcoded override get Mo\'s pay wrong?', options: ['super_call', 'hardcode_base'], answerId: 'hardcode_base', explanation: 'Writing return 100 + self.bonus assumes every manager\'s base salary is 100. Mo earns 200, so the right answer is 210, but the literal forces 110. super().pay() asks the parent for the actual salary, so it stays correct for any manager.' },
    ],
  },

  // ───────────────────── inheritance · composition (HAS-A) · self-contained ─────────────────────
  {
    id: 'oop-composition-has-a',
    title: 'Composition: a logger that HAS-A buffer',
    topic: 'oop',
    difficulty: 'core',
    tags: ['inheritance', 'composition', 'encapsulation'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_logger',
    prompt: 'Build a logger that records messages, hands them back in order, and can clear them - exposing ONLY those three operations. The trap is reaching for subclassing a list, which would leak append, sort, pop, and slicing onto your logger. Instead the logger should HOLD a buffer internally and not itself be a list. The driver logs, reads history, clears, and checks the logger is not a list; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Logger:\n        def __init__(self):\n            # hold a private buffer (HAS-A, not IS-A)\n            pass\n        def log(self, msg):\n            pass\n        def history(self):\n            # the messages in order\n            pass\n        def clear(self):\n            pass\n    lg = Logger()\n    lg.log("start"); lg.log("step"); lg.log("done")\n    h = lg.history()\n    lg.clear()\n    after = lg.history()\n    not_a_list = not isinstance(Logger(), list)\n    starts_empty = Logger().history() == []\n    return (h, after, not_a_list, starts_empty)',
    hints: [
      'Hold a list as a private attribute and write the three methods to delegate to it - the logger HAS a buffer, it is not itself a list.',
      'If you subclass list instead, the logger IS-A list - it inherits the entire list surface and would no longer be "not a list".',
    ],
    solution: 'def solve():\n    class Logger:\n        def __init__(self):\n            self._buffer = []\n        def log(self, msg):\n            self._buffer.append(msg)\n        def history(self):\n            return list(self._buffer)\n        def clear(self):\n            self._buffer.clear()\n    lg = Logger()\n    lg.log("start"); lg.log("step"); lg.log("done")\n    h = lg.history()\n    lg.clear()\n    after = lg.history()\n    not_a_list = not isinstance(Logger(), list)\n    starts_empty = Logger().history() == []\n    return (h, after, not_a_list, starts_empty)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the "not a list" check. The trap subclasses list (Logger(list)), so the logger inherits the entire list surface - append, pop, sort, slicing - and isinstance(Logger(), list) is True, flipping not_a_list to False. The three logging operations happen to work, so the tuple is (["start","step","done"], [], False, True) against the composition (["start","step","done"], [], True, True). Holding a private buffer (HAS-A) exposes only the three operations you meant to offer, where subclassing list (IS-A) leaks a far wider surface than you want.',
    canonicalMethodId: 'composition',
    methods: [
      { id: 'composition', name: 'HAS-A buffer (composition)', code: 'class Logger:\n    def __init__(self):\n        self._buffer = []\n    def log(self, msg):\n        self._buffer.append(msg)\n    def history(self):\n        return list(self._buffer)\n    def clear(self):\n        self._buffer.clear()\nlg = Logger()\nlg.log("start"); lg.log("step"); lg.log("done")\nh = lg.history()\nlg.clear()\nafter = lg.history()\nnot_a_list = not isinstance(Logger(), list)\nstarts_empty = Logger().history() == []\nreturn (h, after, not_a_list, starts_empty)', detectionSignature: { mustMatch: ['self._buffer'], mustNotMatch: ['Logger(list)', 'class Logger(list)'], note: 'holds a private list, exposes three methods' }, tradeoff: 'Only the three intended operations are exposed; the buffer stays private.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'subclass_list', name: 'IS-A list (subclassing)', code: 'class Logger(list):\n    def log(self, msg):\n        self.append(msg)\n    def history(self):\n        return list(self)\n    def clear(self):\n        list.clear(self)\nlg = Logger()\nlg.log("start"); lg.log("step"); lg.log("done")\nh = lg.history()\nlg.clear()\nafter = lg.history()\nnot_a_list = not isinstance(Logger(), list)\nstarts_empty = Logger().history() == []\nreturn (h, after, not_a_list, starts_empty)', detectionSignature: { mustMatch: ['class Logger(list)'], mustNotMatch: [], note: 'inherits the whole list API' }, tradeoff: 'The three logging methods work.', breaksWhen: 'Any code that relies on the logger NOT being a list - it has inherited append, pop, sort, slicing and reports as a list.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does subclassing list break the "not a list" guarantee?', options: ['composition', 'subclass_list'], answerId: 'subclass_list', explanation: 'Logger(list) makes the logger IS-A list, so isinstance(logger, list) is True and the full list API (append, pop, sort, slicing) leaks onto it. Composition - holding a private list - exposes only the three methods you chose to write.' },
    ],
  },

  // ───────────────────── dunder · __eq__ + __hash__ · self-contained ─────────────────────
  {
    id: 'oop-dunder-eq-hash',
    title: 'Make instances work in a set',
    topic: 'oop',
    difficulty: 'core',
    tags: ['dunder', 'eq', 'hash'],
    estimatedMin: 7,
    fixtureId: 'fx_oop_money',
    prompt: 'Build a money value with a currency and an amount in cents. Two of them are equal when both fields match, and equal ones must collapse to a single entry in a set and work interchangeably as dictionary keys. The driver checks value equality, dedup in a set, use as a dict key, and a labelled printout; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Money:\n        def __init__(self, currency, cents):\n            self.currency = currency\n            self.cents = cents\n        # define value equality on (currency, cents), make equal instances usable in a\n        # set and as dict keys, and give a printout containing "Money"\n    eq = Money("USD", 500) == Money("USD", 500)\n    try:\n        set_len = len({Money("USD", 500), Money("USD", 500), Money("EUR", 500)})\n    except TypeError:\n        set_len = -1\n    try:\n        d = {Money("USD", 500): "x"}\n        as_key = d[Money("USD", 500)] == "x"\n    except (TypeError, KeyError):\n        as_key = False\n    has_repr = "Money" in repr(Money("USD", 500))\n    return (eq, set_len, as_key, has_repr)',
    hints: [
      'Value equality on the two fields is one method; making equal instances usable in a set or as dict keys is a SECOND method that has to agree with it.',
      'Defining only the equality method makes Python treat the class as unusable in a set - equal objects must also produce the same lookup key, derived from the same fields.',
    ],
    solution: 'def solve():\n    class Money:\n        def __init__(self, currency, cents):\n            self.currency = currency\n            self.cents = cents\n        def __eq__(self, other):\n            if not isinstance(other, Money):\n                return NotImplemented\n            return (self.currency, self.cents) == (other.currency, other.cents)\n        def __hash__(self):\n            return hash((self.currency, self.cents))\n        def __repr__(self):\n            return "Money(%r, %d)" % (self.currency, self.cents)\n    eq = Money("USD", 500) == Money("USD", 500)\n    try:\n        set_len = len({Money("USD", 500), Money("USD", 500), Money("EUR", 500)})\n    except TypeError:\n        set_len = -1\n    try:\n        d = {Money("USD", 500): "x"}\n        as_key = d[Money("USD", 500)] == "x"\n    except (TypeError, KeyError):\n        as_key = False\n    has_repr = "Money" in repr(Money("USD", 500))\n    return (eq, set_len, as_key, has_repr)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the set and the dict key. When you define equality but NOT the hash method, Python sets the class\'s hash to None and the instances become unhashable: building the set raises TypeError (the driver records -1) and using one as a dict key fails too, so as_key comes back False. The tuple is (True, -1, False, True) against the consistent (True, 2, True, True). The rule is that equal objects must hash the same, so both equality and hashing derive from the same (currency, cents) tuple - define equality without hashing and the class becomes unusable in a set or dict.',
    canonicalMethodId: 'eq_and_hash',
    methods: [
      { id: 'eq_and_hash', name: 'equality + matching hash', code: 'class Money:\n    def __init__(self, currency, cents):\n        self.currency = currency\n        self.cents = cents\n    def __eq__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return (self.currency, self.cents) == (other.currency, other.cents)\n    def __hash__(self):\n        return hash((self.currency, self.cents))\n    def __repr__(self):\n        return "Money(%r, %d)" % (self.currency, self.cents)\neq = Money("USD", 500) == Money("USD", 500)\ntry:\n    set_len = len({Money("USD", 500), Money("USD", 500), Money("EUR", 500)})\nexcept TypeError:\n    set_len = -1\ntry:\n    d = {Money("USD", 500): "x"}\n    as_key = d[Money("USD", 500)] == "x"\nexcept (TypeError, KeyError):\n    as_key = False\nhas_repr = "Money" in repr(Money("USD", 500))\nreturn (eq, set_len, as_key, has_repr)', detectionSignature: { mustMatch: ['def __hash__'], mustNotMatch: [], note: 'hash derived from the same fields as eq' }, tradeoff: 'Equal instances hash the same - a proper value object in sets and dicts.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'eq_no_hash', name: 'equality with no hash', code: 'class Money:\n    def __init__(self, currency, cents):\n        self.currency = currency\n        self.cents = cents\n    def __eq__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return (self.currency, self.cents) == (other.currency, other.cents)\n    def __repr__(self):\n        return "Money(%r, %d)" % (self.currency, self.cents)\neq = Money("USD", 500) == Money("USD", 500)\ntry:\n    set_len = len({Money("USD", 500), Money("USD", 500), Money("EUR", 500)})\nexcept TypeError:\n    set_len = -1\ntry:\n    d = {Money("USD", 500): "x"}\n    as_key = d[Money("USD", 500)] == "x"\nexcept (TypeError, KeyError):\n    as_key = False\nhas_repr = "Money" in repr(Money("USD", 500))\nreturn (eq, set_len, as_key, has_repr)', detectionSignature: { mustMatch: ['def __eq__'], mustNotMatch: ['def __hash__'], note: 'defining eq without hash makes the class unhashable' }, tradeoff: 'Direct equality comparisons still work.', breaksWhen: 'Any use in a set or as a dict key - Python makes the class unhashable the moment you define __eq__ without __hash__.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why can equal-but-no-hash instances not go in a set?', options: ['eq_and_hash', 'eq_no_hash'], answerId: 'eq_no_hash', explanation: 'When a class defines __eq__ but not __hash__, Python sets __hash__ to None and the instances become unhashable, so they cannot be set members or dict keys. Equal objects must hash equal, so both must derive from the same fields.' },
    ],
  },

  // ───────────────────── dunder · __lt__ + __len__ · self-contained ─────────────────────
  {
    id: 'oop-dunder-lt-sort',
    title: 'Sortable records that order by priority',
    topic: 'oop',
    difficulty: 'core',
    tags: ['dunder', 'lt', 'sorting'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_task',
    prompt: 'Build a task with a name and a numeric priority. A plain list of tasks must sort into ascending priority order with no key function needed, and asking for the length of a task should give the length of its name. The driver sorts a mixed list, runs two direct less-than comparisons, and takes one length; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Task:\n        def __init__(self, name, priority):\n            self.name = name\n            self.priority = priority\n        # make tasks order by priority when sorted, and len(task) the length of its name\n    tasks = [Task("c", 3), Task("a", 1), Task("b", 2)]\n    order = [t.name for t in sorted(tasks)]\n    lt = (Task("x", 1) < Task("y", 2))\n    not_lt = (Task("x", 5) < Task("y", 2))\n    length = len(Task("deploy", 1))\n    return (order, lt, not_lt, length)',
    hints: [
      'sorted() and the < operator both ask the object the same question - define how one task compares less-than another, and sorting falls out for free.',
      'Order by PRIORITY, not by name - comparing the wrong field will look right when the two happen to agree and silently wrong when they disagree.',
    ],
    solution: 'def solve():\n    class Task:\n        def __init__(self, name, priority):\n            self.name = name\n            self.priority = priority\n        def __lt__(self, other):\n            return self.priority < other.priority\n        def __len__(self):\n            return len(self.name)\n    tasks = [Task("c", 3), Task("a", 1), Task("b", 2)]\n    order = [t.name for t in sorted(tasks)]\n    lt = (Task("x", 1) < Task("y", 2))\n    not_lt = (Task("x", 5) < Task("y", 2))\n    length = len(Task("deploy", 1))\n    return (order, lt, not_lt, length)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the second comparison, Task("x", 5) < Task("y", 2). The trap defines less-than on the NAME instead of the priority, which happens to give the same answers for the first comparison and the sort (because the names already sort the same way here) but flips this one: by name "x" < "y" is True, where by priority 5 < 2 is False. The tuple is (["a","b","c"], True, True, 6) against (["a","b","c"], True, False, 6). sorted() and < both dispatch to the less-than method, so comparing the intended field - priority - is what makes the ordering correct.',
    canonicalMethodId: 'lt_by_priority',
    methods: [
      { id: 'lt_by_priority', name: '__lt__ on priority', code: 'class Task:\n    def __init__(self, name, priority):\n        self.name = name\n        self.priority = priority\n    def __lt__(self, other):\n        return self.priority < other.priority\n    def __len__(self):\n        return len(self.name)\ntasks = [Task("c", 3), Task("a", 1), Task("b", 2)]\norder = [t.name for t in sorted(tasks)]\nlt = (Task("x", 1) < Task("y", 2))\nnot_lt = (Task("x", 5) < Task("y", 2))\nlength = len(Task("deploy", 1))\nreturn (order, lt, not_lt, length)', detectionSignature: { mustMatch: ['self.priority < other.priority'], mustNotMatch: [], note: 'compares the priority field' }, tradeoff: 'Sorting and < order by priority, as intended.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'lt_by_name', name: '__lt__ on the name', code: 'class Task:\n    def __init__(self, name, priority):\n        self.name = name\n        self.priority = priority\n    def __lt__(self, other):\n        return self.name < other.name\n    def __len__(self):\n        return len(self.name)\ntasks = [Task("c", 3), Task("a", 1), Task("b", 2)]\norder = [t.name for t in sorted(tasks)]\nlt = (Task("x", 1) < Task("y", 2))\nnot_lt = (Task("x", 5) < Task("y", 2))\nlength = len(Task("deploy", 1))\nreturn (order, lt, not_lt, length)', detectionSignature: { mustMatch: ['self.name < other.name'], mustNotMatch: ['self.priority'], note: 'compares the wrong field - name, not priority' }, tradeoff: 'Agrees with the right answer whenever name order and priority order happen to match.', breaksWhen: 'Any pair where the alphabetical name order disagrees with the priority order - it sorts by the wrong key.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the name-based comparison get Task("x",5) < Task("y",2) wrong?', options: ['lt_by_priority', 'lt_by_name'], answerId: 'lt_by_name', explanation: 'Comparing names gives "x" < "y" -> True, but the task is to order by priority, where 5 < 2 is False. Both sorted() and < dispatch to __lt__, so the field it compares has to be the one you mean to order by.' },
    ],
  },

  // ───────────────────── dunder · __add__ + __eq__ · self-contained ─────────────────────
  {
    id: 'oop-dunder-add',
    title: 'Add two vectors with the + operator',
    topic: 'oop',
    difficulty: 'warmup',
    tags: ['dunder', 'add', 'immutability'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_vec2',
    prompt: 'Build a 2D vector with x and y components that supports the + operator: adding two vectors gives a new vector whose components are the sums, and two vectors with the same components compare equal. Addition must be pure - it must not change either of the vectors being added, the way numbers and tuples behave. The driver adds, checks equality and inequality, and verifies an operand was left unchanged; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Vec2:\n        def __init__(self, x, y):\n            self.x = x\n            self.y = y\n        # support v1 + v2 (componentwise, returning a NEW vector) and value equality\n    adds = (Vec2(1, 2) + Vec2(3, 4)) == Vec2(4, 6)\n    veq = Vec2(0, 0) == Vec2(0, 0)\n    neq = Vec2(1, 0) != Vec2(0, 1)\n    a = Vec2(1, 2); b = Vec2(3, 4)\n    _ = a + b\n    unchanged = (a.x, a.y) == (1, 2)\n    return (adds, veq, neq, unchanged)',
    hints: [
      'Defining how + behaves on your type lets v1 + v2 read like ordinary arithmetic - it should produce a brand-new vector from the two components.',
      'Pure addition returns a NEW vector and leaves both operands alone - if you add the other vector\'s components into self and return self, you have mutated an operand.',
    ],
    solution: 'def solve():\n    class Vec2:\n        def __init__(self, x, y):\n            self.x = x\n            self.y = y\n        def __add__(self, other):\n            return Vec2(self.x + other.x, self.y + other.y)\n        def __eq__(self, other):\n            if not isinstance(other, Vec2):\n                return NotImplemented\n            return (self.x, self.y) == (other.x, other.y)\n    adds = (Vec2(1, 2) + Vec2(3, 4)) == Vec2(4, 6)\n    veq = Vec2(0, 0) == Vec2(0, 0)\n    neq = Vec2(1, 0) != Vec2(0, 1)\n    a = Vec2(1, 2); b = Vec2(3, 4)\n    _ = a + b\n    unchanged = (a.x, a.y) == (1, 2)\n    return (adds, veq, neq, unchanged)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the unchanged-operand check. The trap adds the other vector\'s components into self and returns self instead of building a new vector, so a + b mutates a in place: after the addition a is (4, 6), not (1, 2), and unchanged comes back False. The sum itself still equals (4, 6), so the tuple is (True, True, True, False) against the pure (True, True, True, True). Returning a brand-new Vec2 keeps + pure, leaving both operands untouched - exactly how numbers and tuples behave.',
    canonicalMethodId: 'pure_add',
    methods: [
      { id: 'pure_add', name: '__add__ returns a new vector', code: 'class Vec2:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __add__(self, other):\n        return Vec2(self.x + other.x, self.y + other.y)\n    def __eq__(self, other):\n        if not isinstance(other, Vec2):\n            return NotImplemented\n        return (self.x, self.y) == (other.x, other.y)\nadds = (Vec2(1, 2) + Vec2(3, 4)) == Vec2(4, 6)\nveq = Vec2(0, 0) == Vec2(0, 0)\nneq = Vec2(1, 0) != Vec2(0, 1)\na = Vec2(1, 2); b = Vec2(3, 4)\n_ = a + b\nunchanged = (a.x, a.y) == (1, 2)\nreturn (adds, veq, neq, unchanged)', detectionSignature: { mustMatch: ['return Vec2('], mustNotMatch: ['self.x +='], note: 'builds a fresh vector, no mutation' }, tradeoff: 'Pure - a + b leaves both operands untouched.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'mutating_add', name: '__add__ mutates self', code: 'class Vec2:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __add__(self, other):\n        self.x += other.x\n        self.y += other.y\n        return self\n    def __eq__(self, other):\n        if not isinstance(other, Vec2):\n            return NotImplemented\n        return (self.x, self.y) == (other.x, other.y)\nadds = (Vec2(1, 2) + Vec2(3, 4)) == Vec2(4, 6)\nveq = Vec2(0, 0) == Vec2(0, 0)\nneq = Vec2(1, 0) != Vec2(0, 1)\na = Vec2(1, 2); b = Vec2(3, 4)\n_ = a + b\nunchanged = (a.x, a.y) == (1, 2)\nreturn (adds, veq, neq, unchanged)', detectionSignature: { mustMatch: ['self.x +='], mustNotMatch: ['return Vec2('], note: 'mutates the left operand and returns it' }, tradeoff: 'The sum value still comes out right.', breaksWhen: 'Any time the left operand is reused after a + - it was mutated in place, so it no longer holds its original value.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the mutating __add__ leave a changed after a + b?', options: ['pure_add', 'mutating_add'], answerId: 'mutating_add', explanation: 'Doing self.x += other.x writes into the left operand and returns it, so a + b changes a in place. Pure addition builds and returns a new Vec2, leaving both operands untouched - the way + works for numbers and tuples.' },
    ],
  },

  // ───────────────────── classmethods · alternate constructor · self-contained ─────────────────────
  {
    id: 'oop-classmethod-from-dict',
    title: 'An alternate constructor from a dict',
    topic: 'oop',
    difficulty: 'core',
    tags: ['classmethods', 'alternate-constructor', 'cls'],
    estimatedMin: 6,
    fixtureId: 'fx_oop_user',
    prompt: 'Build a user with a name and an age, plus a second way to construct one straight from a dict carrying "name" and "age" keys - an alternate constructor alongside the normal one. It must return a real user, and if someone subclasses the user, building from a dict through the subclass must produce an instance of the SUBCLASS, not the base. The driver builds from a dict, checks the type, the normal constructor, and a subclass build; return those four results.',
    signature: 'solve()',
    starterCode: 'def solve():\n    class User:\n        def __init__(self, name, age):\n            self.name = name\n            self.age = age\n        # add a second constructor that builds a User from a dict with "name" and "age",\n        # producing the right type even when called on a subclass\n    u = User.from_dict({"name": "Ada", "age": 36})\n    built = (u.name, u.age)\n    returns_user = isinstance(User.from_dict({"name": "x", "age": 1}), User)\n    init_ok = User("Bo", 5).name == "Bo"\n    class Admin(User):\n        pass\n    a = Admin.from_dict({"name": "Zo", "age": 9})\n    subclass_ok = isinstance(a, Admin)\n    return (built, returns_user, init_ok, subclass_ok)',
    hints: [
      'The alternate constructor receives the class it was called on - use that to build the instance, rather than naming the base class directly.',
      'If you hardcode the base class name inside the alternate constructor, calling it through a subclass still builds a base instance - the subclass identity is lost.',
    ],
    solution: 'def solve():\n    class User:\n        def __init__(self, name, age):\n            self.name = name\n            self.age = age\n        @classmethod\n        def from_dict(cls, data):\n            return cls(data["name"], data["age"])\n    u = User.from_dict({"name": "Ada", "age": 36})\n    built = (u.name, u.age)\n    returns_user = isinstance(User.from_dict({"name": "x", "age": 1}), User)\n    init_ok = User("Bo", 5).name == "Bo"\n    class Admin(User):\n        pass\n    a = Admin.from_dict({"name": "Zo", "age": 9})\n    subclass_ok = isinstance(a, Admin)\n    return (built, returns_user, init_ok, subclass_ok)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the subclass build. The trap hardcodes the base class inside the alternate constructor (return User(...)) instead of using the class it was handed, so Admin.from_dict builds a plain User, not an Admin, and subclass_ok comes back False. The tuple is (("Ada",36), True, True, False) against (("Ada",36), True, True, True). A class method receives the class it was called on as cls, and building with cls(...) means a subclass calling the alternate constructor gets an instance of the subclass - the reason alternate constructors use cls rather than the class name.',
    canonicalMethodId: 'cls_constructor',
    methods: [
      { id: 'cls_constructor', name: 'classmethod using cls', code: 'class User:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    @classmethod\n    def from_dict(cls, data):\n        return cls(data["name"], data["age"])\nu = User.from_dict({"name": "Ada", "age": 36})\nbuilt = (u.name, u.age)\nreturns_user = isinstance(User.from_dict({"name": "x", "age": 1}), User)\ninit_ok = User("Bo", 5).name == "Bo"\nclass Admin(User):\n    pass\na = Admin.from_dict({"name": "Zo", "age": 9})\nsubclass_ok = isinstance(a, Admin)\nreturn (built, returns_user, init_ok, subclass_ok)', detectionSignature: { mustMatch: ['cls(data'], mustNotMatch: [], note: 'builds with the class it was called on' }, tradeoff: 'Works through subclasses - the alternate constructor stays polymorphic.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'hardcoded_user', name: 'hardcodes the base class', code: 'class User:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    @classmethod\n    def from_dict(cls, data):\n        return User(data["name"], data["age"])\nu = User.from_dict({"name": "Ada", "age": 36})\nbuilt = (u.name, u.age)\nreturns_user = isinstance(User.from_dict({"name": "x", "age": 1}), User)\ninit_ok = User("Bo", 5).name == "Bo"\nclass Admin(User):\n    pass\na = Admin.from_dict({"name": "Zo", "age": 9})\nsubclass_ok = isinstance(a, Admin)\nreturn (built, returns_user, init_ok, subclass_ok)', detectionSignature: { mustMatch: ['User(data'], mustNotMatch: ['cls(data'], note: 'ignores cls, names the base class directly' }, tradeoff: 'Works fine as long as you only ever call it on the base class.', breaksWhen: 'Any subclass calling the alternate constructor - it builds a base instance, losing the subclass type.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does Admin.from_dict return a plain User in the hardcoded version?', options: ['cls_constructor', 'hardcoded_user'], answerId: 'hardcoded_user', explanation: 'Writing return User(...) names the base class explicitly, ignoring the class the method was called on. cls is bound to Admin when called as Admin.from_dict, so building with cls(...) produces an Admin instead.' },
    ],
  },

  // ───────────────────── classmethods · staticmethod validator · self-contained ─────────────────────
  {
    id: 'oop-staticmethod-util',
    title: 'A parser constructor and a stateless validator',
    topic: 'oop',
    difficulty: 'core',
    tags: ['classmethods', 'staticmethod', 'validation'],
    estimatedMin: 7,
    fixtureId: 'fx_oop_record',
    prompt: 'Build a record with an integer id and a label. Give it a second constructor that parses a CSV-style "id,label" row into a record (with the id turned into a real integer), and a stand-alone validity check that returns true only for non-negative whole numbers - a check that uses no record or class state at all. Watch the edge: a boolean must NOT count as a valid id. The driver parses a row, checks the id type and result type, and runs the validator on 0, -1, a string, and True; return all those results.',
    beforeWriting: 'A boolean in Python is technically a kind of integer (True behaves like 1). If your validity check only asks "is this an int and not negative", will it wrongly accept True?',
    signature: 'solve()',
    starterCode: 'def solve():\n    class Record:\n        def __init__(self, id, label):\n            self.id = id\n            self.label = label\n        # add a second constructor that parses "id,label" (id -> int) into a Record,\n        # and a stateless check that is true only for non-negative integers (NOT booleans)\n    r = Record.from_row("7,alpha")\n    parsed = (r.id, r.label)\n    id_is_int = isinstance(Record.from_row("3,beta").id, int)\n    returns_record = isinstance(Record.from_row("1,x"), Record)\n    valid = Record.is_valid_id(0)\n    negative = Record.is_valid_id(-1)\n    non_int = Record.is_valid_id("5")\n    bool_rejected = Record.is_valid_id(True)\n    return (parsed, id_is_int, returns_record, valid, negative, non_int, bool_rejected)',
    hints: [
      'The parser needs the class to build an instance (use the class it was called on); the validity check needs neither the class nor an instance - it is a stand-alone utility namespaced under the class.',
      'A bool is a subclass of int, so a naive "is it an int and >= 0" lets True through - the check has to explicitly exclude booleans.',
    ],
    solution: 'def solve():\n    class Record:\n        def __init__(self, id, label):\n            self.id = id\n            self.label = label\n        @classmethod\n        def from_row(cls, row):\n            raw_id, label = row.split(",", 1)\n            return cls(int(raw_id), label)\n        @staticmethod\n        def is_valid_id(value):\n            return isinstance(value, int) and not isinstance(value, bool) and value >= 0\n    r = Record.from_row("7,alpha")\n    parsed = (r.id, r.label)\n    id_is_int = isinstance(Record.from_row("3,beta").id, int)\n    returns_record = isinstance(Record.from_row("1,x"), Record)\n    valid = Record.is_valid_id(0)\n    negative = Record.is_valid_id(-1)\n    non_int = Record.is_valid_id("5")\n    bool_rejected = Record.is_valid_id(True)\n    return (parsed, id_is_int, returns_record, valid, negative, non_int, bool_rejected)',
    compare: { kind: 'seq' },
    debrief: 'The tell is the last check, is_valid_id(True). Because bool is a subclass of int, a naive check (isinstance(value, int) and value >= 0) accepts True - it is an int and 1 >= 0 - so bool_rejected comes back True where the careful version returns False. The tuple is ((7,"alpha"), True, True, True, False, False, True) against the correct (..., False). The parser is a class method (it needs the class to build a record); the validator is a static method (it touches no class or instance state) and must explicitly exclude booleans to reject True.',
    canonicalMethodId: 'full_validation',
    methods: [
      { id: 'full_validation', name: 'validator excludes booleans', code: 'class Record:\n    def __init__(self, id, label):\n        self.id = id\n        self.label = label\n    @classmethod\n    def from_row(cls, row):\n        raw_id, label = row.split(",", 1)\n        return cls(int(raw_id), label)\n    @staticmethod\n    def is_valid_id(value):\n        return isinstance(value, int) and not isinstance(value, bool) and value >= 0\nr = Record.from_row("7,alpha")\nparsed = (r.id, r.label)\nid_is_int = isinstance(Record.from_row("3,beta").id, int)\nreturns_record = isinstance(Record.from_row("1,x"), Record)\nvalid = Record.is_valid_id(0)\nnegative = Record.is_valid_id(-1)\nnon_int = Record.is_valid_id("5")\nbool_rejected = Record.is_valid_id(True)\nreturn (parsed, id_is_int, returns_record, valid, negative, non_int, bool_rejected)', detectionSignature: { mustMatch: ['not isinstance(value, bool)'], mustNotMatch: [], note: 'explicitly rejects booleans' }, tradeoff: 'Correctly treats True/False as invalid ids.', breaksWhen: 'Nothing here - it is the canonical answer.', isTrap: false },
      { id: 'bool_leaks', name: 'validator forgets booleans are ints', code: 'class Record:\n    def __init__(self, id, label):\n        self.id = id\n        self.label = label\n    @classmethod\n    def from_row(cls, row):\n        raw_id, label = row.split(",", 1)\n        return cls(int(raw_id), label)\n    @staticmethod\n    def is_valid_id(value):\n        return isinstance(value, int) and value >= 0\nr = Record.from_row("7,alpha")\nparsed = (r.id, r.label)\nid_is_int = isinstance(Record.from_row("3,beta").id, int)\nreturns_record = isinstance(Record.from_row("1,x"), Record)\nvalid = Record.is_valid_id(0)\nnegative = Record.is_valid_id(-1)\nnon_int = Record.is_valid_id("5")\nbool_rejected = Record.is_valid_id(True)\nreturn (parsed, id_is_int, returns_record, valid, negative, non_int, bool_rejected)', detectionSignature: { mustMatch: ['isinstance(value, int)'], mustNotMatch: ['not isinstance(value, bool)'], note: 'no bool guard -> True passes as a valid int' }, tradeoff: 'Handles real integers, negatives, and strings correctly.', breaksWhen: 'A boolean value - True is an int subclass equal to 1, so it slips through as a valid id.', isTrap: true },
    ],
    dial: { axes: [], rules: [] },
    mcqs: [
      { id: 'q1', stem: 'Why does the simpler validator accept True as a valid id?', options: ['full_validation', 'bool_leaks'], answerId: 'bool_leaks', explanation: 'In Python bool is a subclass of int and True equals 1, so isinstance(True, int) is True and True >= 0 holds. Without an explicit not isinstance(value, bool) guard, the check lets booleans through as valid ids.' },
    ],
  },

];

export default problems;

// foundationsRooms — the KNOW-frame room registry (the Foundations skeleton).
// PL's answer to PAL's Stats/Metrics/RCA/A-B Foundation rooms, re-shaped for
// programming: a TRUNK every learner climbs + BRANCHES that diverge.
//
// THIS IS A SKELETON. Every room/cluster/module below is status 'planned' — the
// architecture, not the authored content. Authority spec: docs/FOUNDATIONS-SPEC.md.
// Nothing here is imported into the app yet (no build impact); the build wires it
// room-by-room as each is authored. Supersedes the 20-card knowModules.js stub:
// 'python-foundations' (room 1) absorbs and replaces it.
//
// HOUSE SYNTAX (PAL CLAUDE.md): single quotes only; escape apostrophes as \' ;
// NO template literals (backticks) — Rolldown parse error.
//
// Per-module skeleton: { id, title, model, widget }
//   model  — the ONE manipulable thing the learner drives (NOT a definition).
//   widget — the build substrate that drives authoring cost:
//     'live'    = real code run in Pyodide; learner edits + sees actual output/cost.
//     'sim'     = bespoke SVG model (drag sliders / drag values, re-renders).
//     'stepper' = step-through state machine (frames, buckets, graph traversal).
//     'concept' = explainer-only (no execution; conceptual-in-browser topics).
// PL's edge over PAL: prefer 'live' wherever the concept runs — PAL can only 'sim'.
//
// KNOW/DO SEAM (D-PL-22): pyLabPlanned.js\'s plan-sys-* / plan-async-* / plan-n2s-*
// stubs are the DO companions (graded runnable exercises) to rooms 5 (Concurrency
// & Parallelism), 6 (Shipping Python), and 8 (The Metal) here. Same topics on both
// surfaces is BY DESIGN — KNOW installs the model, DO drills it — not duplication.
// D-PL-24 extends the seam: plan-api-* ↔ room 12 (The Wire); the SQL Lab DO bank ↔ room 13 (Storage Engines).

export const FOUNDATION_TRACKS = {
  trunk:  { label: 'The Trunk',  sub: 'The SWE-for-data floor — sequential, everyone climbs it' },
  branch: { label: 'The Branches', sub: 'Specializations that diverge once the trunk is in place' },
};

export const FOUNDATION_STATUS = 'planned'; // whole registry is skeleton until authored

// Ordered list of rooms. order is global (trunk 1-5, branches 6-7).
export const FOUNDATION_ROOMS = [

  // ───────────────────────────── TRUNK ─────────────────────────────
  {
    id: 'python-foundations',
    track: 'trunk',
    order: 1,
    title: 'Python Foundations',
    subtitle: 'The language and the mental models underneath it.',
    accent: 'var(--accent)',
    status: 'planned',
    identity: 'Names, mutability, the data model, objects — the model installed before the gotcha bites. Absorbs + replaces the current 20-card KNOW stub.',
    grounding: 'roadmap.sh/python (basics + advanced) · Python Tutor (runtime-state viz)',
    clusters: [
      {
        id: 'values-and-names',
        label: 'Values & Names',
        modules: [
          { id: 'pf-binding',     title: 'Names are bindings, not boxes', model: 'Two names, one list. Mutate through one; watch the other change. Toggle to separate statements and watch them decouple.', widget: 'live' },
          { id: 'pf-mutate-vs-rebind', title: 'Mutation vs rebinding',     model: 'Step a name between .append() (shared) and = [9] (rebind); the heap diagram updates each step.', widget: 'stepper' },
          { id: 'pf-copy-deepcopy', title: 'copy vs deepcopy',            model: 'Nest a list-in-a-list; shallow-copy then mutate the inner one; watch which references still alias.', widget: 'live' },
          { id: 'pf-mutable-default', title: 'The mutable default argument', model: 'Call the function three times; watch the \'fresh\' default accumulate across calls.', widget: 'live' },
        ],
      },
      {
        id: 'control-and-functions',
        label: 'Control & Functions',
        modules: [
          { id: 'pf-legb',        title: 'LEGB: how a name resolves',     model: 'Reference a name from nested scopes; highlight which scope (Local/Enclosing/Global/Built-in) satisfies it.', widget: 'stepper' },
          { id: 'pf-late-binding', title: 'The late-binding closure',      model: 'Build lambdas in a loop; call them after; watch every one return the final i. Add default-arg capture to fix it live.', widget: 'live' },
          { id: 'pf-args',        title: '*args / **kwargs unpacking',     model: 'Drag arguments into positional / *args / keyword / **kwargs slots; see how Python binds them.', widget: 'sim' },
          { id: 'pf-sort-key',   title: 'sorted, key=, and the lambda',   model: 'Sort the same records by different key= lambdas; watch the decorate-sort pattern reorder live - the functional trio behind every top-N screen question.', widget: 'live' },
          { id: 'pf-comprehensions', title: 'Comprehensions: loops as expressions', model: 'Transform a loop into list/set/dict comprehensions and a genexp step by step; watch scoping isolate the loop variable - and where a comprehension stops being readable.', widget: 'live' },
          { id: 'pf-generators',  title: 'Generators are lazy and one-shot', model: 'Step next() one value at a time; show nothing computes until asked; contrast memory with the list version.', widget: 'live' },
          { id: 'pf-match',      title: 'match: structural pattern matching', model: 'Feed shapes to match/case arms; watch destructuring bind names per arm and the guard clause filter - the modern control flow interviews now show.', widget: 'live' },
        ],
      },
      {
        id: 'the-data-model',
        label: 'The Data Model',
        modules: [
          { id: 'pf-dunders',     title: 'Dunders: how objects answer the language', model: 'Define __len__/__bool__/__eq__ on a toy class; call len()/if/== and watch which dunder fires.', widget: 'live' },
          { id: 'pf-truthiness',  title: 'How if obj: decides truth',      model: 'Flip __bool__ then __len__ then neither; watch the truth-test fall through the protocol.', widget: 'live' },
          { id: 'pf-iteration',   title: 'The iteration protocol',         model: 'Drive __iter__/__next__ by hand; show what a for-loop actually calls under the hood.', widget: 'stepper' },
          { id: 'pf-slicing',    title: 'Slicing: start, stop, step, and the copy', model: 'Drag start/stop/step handles on a sequence; watch a[::-1] reverse and every slice allocate a NEW list (vs the numpy view, room 4) - __getitem__ with a slice object.', widget: 'sim' },
          { id: 'pf-is-vs-eq',    title: 'is vs == and the caches that lie', model: 'Compare small ints / short strings vs large ones; watch identity flip while equality holds.', widget: 'live' },
          { id: 'pf-bytes-str',   title: 'bytes vs str: the encoding boundary', model: 'Encode one string through utf-8 and latin-1; flip the decode codec and watch mojibake appear; the UnicodeDecodeError finally has a model.', widget: 'live' },
        ],
      },
      {
        id: 'objects-and-classes',
        label: 'Objects & Classes',
        modules: [
          { id: 'pf-classes',     title: 'Classes, instances, and __dict__', model: 'Set attributes on an instance vs the class; watch where each lands in the two __dict__s.', widget: 'live' },
          { id: 'pf-inheritance', title: 'Inheritance and the MRO',        model: 'Build a diamond; call a method; trace the method-resolution order that picks the winner.', widget: 'stepper' },
          { id: 'pf-dataclasses', title: 'dataclasses: structure for free', model: 'Toggle a plain class into a @dataclass; watch __init__/__repr__/__eq__ appear.', widget: 'live' },
        ],
      },
      {
        id: 'decorators-and-context',
        label: 'Decorators & Context',
        modules: [
          { id: 'pf-decorators',  title: 'A decorator is a function wrapping a function', model: 'Wrap a function; step the call through the wrapper; show before/after and the returned closure.', widget: 'stepper' },
          { id: 'pf-context',     title: 'with: the context-manager contract', model: 'Drive __enter__/__exit__ around a block; show cleanup fires even when the body raises.', widget: 'live' },
        ],
      },
    ],
  },

  {
    id: 'the-machine',
    track: 'trunk',
    order: 2,
    title: 'The Machine',
    subtitle: 'How Python runs — and what it costs.',
    accent: 'var(--yellow)',
    status: 'planned',
    identity: 'PL\'s signature room — the one no other lab can build. Pyodide instruments real time + memory, so the cost is measured, not asserted. The glass-box thesis as a teaching surface.',
    grounding: 'OSSU core (Big-O, complexity) · High Performance Python (measure before optimize) · the glass-box layer (perf_counter + tracemalloc)',
    clusters: [
      {
        id: 'execution',
        label: 'Execution',
        modules: [
          { id: 'mc-call-stack', title: 'The call stack & recursion',     model: 'Step a recursive factorial/fib; frames push and pop on a live stack; show where the base case stops it and where infinite recursion blows it.', widget: 'stepper' },
          { id: 'mc-bytecode',   title: 'What the interpreter actually runs', model: 'dis() a one-liner; map each source token to its bytecode op; step the stack machine.', widget: 'live' },
        ],
      },
      {
        id: 'memory',
        label: 'Memory',
        modules: [
          { id: 'mc-refcount',   title: 'Refcounts and garbage collection', model: 'Bind/rebind/del names; watch an object\'s refcount tick and the object free at zero.', widget: 'stepper' },
          { id: 'mc-interning',  title: 'Interning: why some objects are shared', model: 'Create equal small ints / short strings; watch them share one id; cross the cache boundary and watch it split.', widget: 'live' },
          { id: 'mc-list-growth', title: 'The cost of a growing list',     model: 'Append in a loop; watch peak memory (tracemalloc) climb; contrast with a generator.', widget: 'live' },
          { id: 'mc-str-concat',  title: 'Why += on strings is quadratic',  model: 'Build a string with += then with join; the glass-box timing curves diverge as n grows - immutability means every += copies everything.', widget: 'live' },
        ],
      },
      {
        id: 'hashing-and-lookup',
        label: 'Hashing & Lookup',
        modules: [
          { id: 'mc-hash-buckets', title: 'How a dict hashes',            model: 'Drop keys into hash buckets; trigger a collision; show why lookup stays O(1) and why order is insertion order now.', widget: 'sim' },
          { id: 'mc-membership',   title: 'in list (O(n)) vs in set (O(1))', model: 'Race membership against a list and a set as n grows; the glass-box timing diverges live.', widget: 'live' },
        ],
      },
      {
        id: 'cost-felt',
        label: 'Cost, Felt',
        modules: [
          { id: 'mc-big-o',      title: 'Big-O, felt',                    model: 'One slider for n; watch operation counts for O(1)/O(n)/O(n log n)/O(n^2) diverge on the same axes.', widget: 'sim' },
          { id: 'mc-vectorized', title: 'Loop vs vectorized',             model: 'Same sum as a Python loop and a numpy vectorize; race the wall-clock; feel the 100x.', widget: 'live' },
          { id: 'mc-race',       title: 'The canonical-vs-brute race',    model: 'Pick n; run the smart and the brute method head-to-head; raceMethods() renders the cost bars.', widget: 'live' },
        ],
      },
    ],
  },

  {
    id: 'dsa-foundations',
    track: 'trunk',
    order: 3,
    title: 'Data Structures & Algorithms',
    subtitle: 'The structures and the transferable patterns — by pattern, capped at medium.',
    accent: 'var(--teal)',
    status: 'planned',
    identity: 'The DSA floor every coding screen assumes. By pattern (the transferable unit), easy->medium per PL\'s charter. KNOW companion to the DSA DO bank.',
    grounding: 'roadmap.sh DSA · USACO Bronze/Silver · NeetCode patterns · VisuAlgo (animated structures)',
    clusters: [
      {
        id: 'structures',
        label: 'Structures',
        modules: [
          { id: 'dsa-array',      title: 'Arrays & dynamic lists',        model: 'Insert/delete at front vs end; watch the shift cost and the amortized resize.', widget: 'sim' },
          { id: 'dsa-hashmap',    title: 'Hashmaps & sets',               model: 'Insert/lookup/delete; reuse the bucket model; show O(1) average against the list.', widget: 'sim' },
          { id: 'dsa-stack-queue', title: 'Stacks & queues',              model: 'Push/pop vs enqueue/dequeue on a live structure; show LIFO vs FIFO and the deque fix for pop(0).', widget: 'stepper' },
          { id: 'dsa-heap',       title: 'Heaps & priority',              model: 'Push values; watch the heap sift up/down to keep the invariant; pop the min.', widget: 'stepper' },
          { id: 'dsa-linked',     title: 'Linked lists & pointers',       model: 'Re-point next pointers to reverse a list; watch the chain rewire node by node.', widget: 'stepper' },
          { id: 'dsa-tree',       title: 'Trees & traversal',             model: 'Walk a tree in BFS vs DFS; highlight visit order; read off the depth.', widget: 'stepper' },
        ],
      },
      {
        id: 'patterns',
        label: 'Patterns',
        modules: [
          { id: 'dsa-two-pointer', title: 'Two pointers',                 model: 'Drag two pointers toward each other on a sorted array; watch the pair-sum converge.', widget: 'sim' },
          { id: 'dsa-window',     title: 'Sliding window',                model: 'Drag the window across a stream; watch the running constraint update without re-scanning.', widget: 'sim' },
          { id: 'dsa-prefix',     title: 'Prefix sums',                   model: 'Build the prefix array; answer a range query in O(1) by subtracting two cells.', widget: 'sim' },
          { id: 'dsa-binary-search', title: 'Binary search (+ on answer-space)', model: 'Step lo/mid/hi on a sorted array; then search the answer space of a monotonic function.', widget: 'stepper' },
          { id: 'dsa-bfs-dfs',    title: 'BFS / DFS on graphs',           model: 'Traverse a small graph; watch the frontier (queue) vs the stack drive the visit order.', widget: 'stepper' },
          { id: 'dsa-topk',       title: 'Top-K with a heap',             model: 'Stream values through a size-K heap; watch it evict to keep the K largest.', widget: 'stepper' },
          { id: 'dsa-intervals',  title: 'Intervals: merge & overlap',    model: 'Drag intervals on a timeline; watch overlaps merge after a sort.', widget: 'sim' },
          { id: 'dsa-bits',       title: 'Bits: the integer as a toolbox', model: 'Toggle individual bits of an int; watch masks, shifts, and two\'s-complement negation transform the same 8 cells - the pattern behind every bit-trick screen question.', widget: 'sim' },
          { id: 'dsa-backtrack',  title: 'Backtracking: the choice tree',  model: 'Build subsets/permutations by choosing, recursing, un-choosing; watch the decision tree grow and prune live - the pattern behind a third of medium screens.', widget: 'stepper' },
          { id: 'dsa-greedy',     title: 'Greedy: when local wins are safe', model: 'Schedule intervals greedily by end time vs by start time; watch one choice rule succeed and the other fail on the same input - the exchange argument, felt.', widget: 'sim' },
          { id: 'dsa-monotonic',  title: 'The monotonic stack',            model: 'Stream heights through a stack that stays sorted; watch each pop answer a next-greater query in amortized O(1) - the pattern under daily-temperatures and histogram problems.', widget: 'stepper' },
        ],
      },
    ],
  },

  {
    id: 'array-dataframe-foundations',
    track: 'trunk',
    order: 4,
    title: 'NumPy & pandas',
    subtitle: 'Array and DataFrame mechanics — the data-library core.',
    accent: 'var(--green)',
    status: 'planned',
    identity: 'The libraries PL\'s audience lives in. The broadcasting + copy-vs-view mental models that silently wreck beginner code. KNOW companion to the PyLab DO bank.',
    grounding: 'NumPy broadcasting docs (the stretch-not-copy viz) · Modern Pandas · SettingWithCopy canon',
    clusters: [
      {
        id: 'numpy',
        label: 'NumPy',
        modules: [
          { id: 'np-ndarray',    title: 'The ndarray & dtype',           model: 'Reshape a flat buffer into shapes; watch strides reinterpret the same memory; overflow an int8 live.', widget: 'live' },
          { id: 'np-broadcast',  title: 'Broadcasting: stretch, never copy', model: 'Drag two array shapes together; watch the size-1 axes stretch (ghosted, not allocated) or the mismatch error.', widget: 'sim' },
          { id: 'np-views',      title: 'Views vs copies',               model: 'Slice an array; assign into the slice; watch the parent change (view) vs not (copy).', widget: 'live' },
          { id: 'np-axis',       title: 'axis semantics',                model: 'Toggle axis=0/1 on a 2D sum; highlight which dimension collapses.', widget: 'sim' },
          { id: 'np-vectorize',  title: 'Vectorized vs the Python loop',  model: 'Same op as a loop and a vectorized call; race the cost (ties back to The Machine).', widget: 'live' },
        ],
      },
      {
        id: 'pandas',
        label: 'pandas',
        modules: [
          { id: 'pd-frame',      title: 'The labeled DataFrame',         model: 'Show the index + columns as first-class labels; reindex and watch rows realign.', widget: 'live' },
          { id: 'pd-align',      title: 'Index alignment',               model: 'Add two Series with different indexes; watch pandas align by label and put NaN where they do not match.', widget: 'live' },
          { id: 'pd-copy-view',  title: 'Copy vs view & SettingWithCopy', model: 'Slice a DataFrame; assign into the slice; watch the write hit a copy and silently vanish.', widget: 'live' },
          { id: 'pd-groupby',    title: 'Split-apply-combine',           model: 'Animate groupby: split into groups, apply the agg, combine back; toggle agg vs transform.', widget: 'sim' },
          { id: 'pd-reshape',    title: 'Reshape: pivot / melt / stack',  model: 'Drag a table long<->wide; watch pivot and melt move the same cells.', widget: 'sim' },
          { id: 'pd-merge',      title: 'Joins: where rows multiply',     model: 'Merge two frames with duplicate keys; watch inner/left/outer keep and drop different rows - and the silent row-count explosion every analyst ships once.', widget: 'live' },
          { id: 'pd-missing',    title: 'NaN: the value that is not equal to itself', model: 'Propagate NaN through comparisons, groupby, and mean(); watch which operations skip it, which swallow it, and why NaN == NaN is False.', widget: 'live' },
          { id: 'pd-datetime',   title: 'Datetimes: parsing, tz, and the off-by-one day', model: 'Parse the same timestamp naive and tz-aware; cross a DST boundary and resample; watch where the day silently shifts.', widget: 'live' },
        ],
      },
    ],
  },

  {
    id: 'shipping-python',
    track: 'trunk',
    order: 6,
    title: 'Shipping Python',
    subtitle: 'Notebook -> production: the SWE in SWE-for-data.',
    accent: 'var(--purple)',
    status: 'planned',
    identity: 'The capstone of the trunk and (per CURRICULUM-RESEARCH.md) PL\'s biggest untapped expansion — the line between a notebook analyst and someone who ships.',
    grounding: 'CURRICULUM-RESEARCH.md §B/§D (SWE->AIE bridge) · Made With ML · Effective Python',
    clusters: [
      {
        id: 'typing-and-validation',
        label: 'Typing & Validation',
        modules: [
          { id: 'sp-hints',      title: 'Type hints as contracts',       model: 'Annotate a cleaner; introduce a caller mistake; watch what a static check would flag (vs the silent runtime).', widget: 'concept' },
          { id: 'sp-dataclass',  title: 'dataclasses & Enums',           model: 'Turn a stringly-typed status into an Enum + dataclass; reject the bad row live.', widget: 'live' },
          { id: 'sp-pydantic',   title: 'pydantic: validate at the boundary', model: 'Feed a bad payload to a model; watch it coerce, validate, and fail loud (and the silent-coercion trap).', widget: 'live' },
        ],
      },
      {
        id: 'testing-and-guardrails',
        label: 'Testing & Guardrails',
        modules: [
          { id: 'sp-asserts',    title: 'Asserts that catch the off-by-one', model: 'Add boundary asserts to a function; feed the edge input; watch the assert stop the silent NaN.', widget: 'live' },
          { id: 'sp-pytest',     title: 'The pytest model',              model: 'Parametrize one test over four edge inputs (empty/all-dup/single/huge); watch the matrix go green/red.', widget: 'live' },
          { id: 'sp-fail-loud',  title: 'Fail-loud vs fail-silent',      model: 'Compare a bare except returning a default vs a raise; watch corruption flow past one and stop at the other.', widget: 'live' },
        ],
      },
      {
        id: 'robustness',
        label: 'Robustness',
        modules: [
          { id: 'sp-exceptions', title: 'Exceptions & the traceback',    model: 'Raise inside nested calls; read the traceback as the call stack unwinding; catch at the right layer.', widget: 'live' },
          { id: 'sp-serialize',  title: 'Serialization: json vs pickle',  model: 'Round-trip a nested config; watch json lose the dates and pickle keep the object graph.', widget: 'live' },
          { id: 'sp-files',      title: 'Files & paths: the open() contract',  model: 'Open the same file in r/rb/w/a modes with and without an encoding; watch the with block guarantee the close, and pathlib compose paths that survive the OS switch.', widget: 'live' },
          { id: 'sp-cache',      title: 'Caching with lru_cache',        model: 'Wrap an expensive call; call twice; the glass-box proves the second call is free.', widget: 'live' },
        ],
      },
      {
        id: 'from-notebook-to-service',
        label: 'Notebook -> Service',
        modules: [
          { id: 'sp-structure',  title: 'Cells -> functions -> modules', model: 'Take a linear notebook; watch it refactor into named functions with explicit inputs; the hidden-state bug disappears.', widget: 'stepper' },
          { id: 'sp-config',     title: 'Config out of the code',        model: 'Hoist magic numbers into a config object; change one value; watch every consumer update without an edit.', widget: 'live' },
          { id: 'sp-logging',    title: 'Logging: print that survives production', model: 'Swap prints for leveled logging; flip the level; watch DEBUG vanish and ERROR stay.', widget: 'live' },
          { id: 'sp-service',    title: 'The request/response boundary', model: 'Wrap the pipeline behind a handler; feed a request; trace validate -> compute -> respond, and where the 4xx vs 5xx split lives.', widget: 'sim' },
          { id: 'sp-repro',      title: 'Seed everything',               model: 'Seed only Python\'s RNG, then numpy, then the framework; watch which \'seeded\' run still differs.', widget: 'concept' },
          { id: 'sp-env',        title: 'Environments: why it works on your machine', model: 'Resolve the same import against two environments with different pinned versions; watch the API drift that pip-install-without-pins invites - the model under lockfiles.', widget: 'concept' },
        ],
      },
    ],
  },

  {
    id: 'concurrency-foundations',
    track: 'trunk',
    order: 5,
    title: 'Concurrency & Parallelism',
    subtitle: 'One interpreter, many tasks — the GIL, the event loop, and the races.',
    accent: 'var(--blue-text)',
    status: 'planned',
    identity: 'The substrate room the AIE floor demands: every LLM app is async, every data pipeline hits the GIL, every interview asks the difference. Promoted from a single buried module (the old sp-async) to a full trunk room — D-PL-22.',
    grounding: 'Fluent Python (concurrency chapters) · asyncio docs (the event-loop model) · Amdahl\'s law · plan-async-* DO stubs (pyLabPlanned.js)',
    clusters: [
      {
        id: 'one-interpreter',
        label: 'The GIL & Threads',
        modules: [
          { id: 'cc-gil',        title: 'The GIL: one bytecode at a time', model: 'Race a CPU-bound loop on 1 vs 4 threads; watch wall-clock barely move; the glass-box shows why threads did not help.', widget: 'live' },
          { id: 'cc-io-vs-cpu',  title: 'I/O-bound vs CPU-bound',          model: 'Same 4 threads, but the work is waiting instead of computing; watch the speedup appear — the GIL releases on I/O.', widget: 'live' },
          { id: 'cc-processes',  title: 'Processes: real parallelism, real cost', model: 'Slide the task size; watch process startup + serialization overhead eat the win on small work and pay off on big work.', widget: 'sim' },
          { id: 'cc-amdahl',     title: 'Amdahl\'s law, felt',             model: 'One slider for the parallel fraction, one for workers; watch the speedup ceiling flatten no matter how many workers you add.', widget: 'sim' },
          { id: 'cc-executor',   title: 'Executors: the pool you actually use', model: 'Submit 20 tasks to a ThreadPoolExecutor; slide max_workers; watch the wave pattern, as_completed ordering, and where one slow task holds the map() result.', widget: 'live' },
        ],
      },
      {
        id: 'the-event-loop',
        label: 'The Event Loop',
        modules: [
          { id: 'cc-event-loop', title: 'async/await & the event loop',   model: 'Timeline where await yields control; watch ten simulated calls interleave instead of blocking serially.', widget: 'sim' },
          { id: 'cc-await-order', title: 'What runs when',                 model: 'Predict the print order of gathered coroutines; run it; step the loop to see exactly where each task yields.', widget: 'live' },
          { id: 'cc-blocking',   title: 'The blocking call that freezes the loop', model: 'Drop one synchronous sleep into async code; watch every other task stall behind it; swap in the async version and unfreeze.', widget: 'live' },
          { id: 'cc-timeout',    title: 'Timeouts & cancellation',        model: 'Wrap an await in a timeout; watch cancellation propagate into the task and the cleanup still run.', widget: 'live' },
        ],
      },
      {
        id: 'shared-state',
        label: 'Races & Coordination',
        modules: [
          { id: 'cc-race',       title: 'The race condition',             model: 'Two workers increment one shared counter; step the interleaving; watch updates vanish between read and write.', widget: 'stepper' },
          { id: 'cc-locks',      title: 'Locks — and the deadlock',       model: 'Add a lock and fix the race; then take two locks in opposite orders and watch both workers freeze forever.', widget: 'stepper' },
          { id: 'cc-semaphore',  title: 'Semaphores: at most N at once',  model: 'Fire 20 tasks through a semaphore of 3; watch the concurrency cap hold and the queue drain in waves.', widget: 'sim' },
          { id: 'cc-backpressure', title: 'Backpressure: when producers outrun consumers', model: 'Unbound the queue and watch memory climb; bound it and watch the producer block instead — the trade made visible.', widget: 'sim' },
          { id: 'cc-memory-model', title: 'Why a data race is not just a wrong number', model: 'Step two threads through reordered reads/writes; watch an \'impossible\' result appear — the memory-model reason races are undefined behaviour, not merely nondeterministic.', widget: 'stepper' },
        ],
      },
    ],
  },

  // ──────────────────────────── BRANCHES ────────────────────────────
  // SCOPE NOTE: the branches exceed PL\'s charter (D-PL-07 easy->med; the
  // \'ML internals = MSL\'s lane\' line). Adopted as conscious amendments —
  // D-PL-21 (rooms 7 and 9), D-PL-22 (room 8, The Metal).
  {
    id: 'competitive-programming',
    track: 'branch',
    order: 7,
    title: 'Competitive Programming',
    subtitle: 'Picks up where the DSA floor ends — the USACO Gold/Platinum ladder.',
    accent: 'var(--red)',
    status: 'planned',
    charterNote: 'Above PL\'s easy->medium ceiling by design (amends D-PL-07). A branch, not the floor.',
    identity: 'Where felt Big-O graduates into beating the time limit. The canonical-vs-brute race is the spine.',
    grounding: 'USACO Guide (Silver->Platinum) · Competitive Programmer\'s Handbook · CP-Algorithms',
    clusters: [
      {
        id: 'complexity-under-constraints',
        label: 'Complexity Under Constraints',
        modules: [
          { id: 'cp-budget',     title: 'Reading the limits',            model: 'Set n and the time budget; watch which complexity class fits under it and which TLEs.', widget: 'sim' },
        ],
      },
      {
        id: 'recurrences-and-proofs',
        label: 'Recurrences & Proofs',
        modules: [
          { id: 'cp-recurrence', title: 'Solving recurrences: the Master theorem, felt', model: 'Set a, b, and f(n) on T(n) = aT(n/b) + f(n); watch the recursion tree total its levels and land in one of the three cases.', widget: 'sim' },
          { id: 'cp-amortized',  title: 'Amortized analysis: the doubling array', model: 'Append into a doubling array; watch per-op cost spike at each resize while the running average flattens to O(1) - the analysis behind myvec\'s growth policy.', widget: 'sim' },
          { id: 'cp-modular',    title: 'Modular arithmetic: counting under a cap', model: 'Overflow a running product, then redo it mod 1e9+7; watch distributivity keep every intermediate small - the tool behind every answer-modulo problem.', widget: 'sim' },
        ],
      },
      {
        id: 'dynamic-programming',
        label: 'Dynamic Programming',
        modules: [
          { id: 'cp-memo',       title: 'Memoization -> tabulation',     model: 'Step a recursive DP; watch the memo fill; flip to the bottom-up table over the same cells.', widget: 'stepper' },
          { id: 'cp-dp-shapes',  title: 'Classic DP shapes',             model: 'Fill a DP grid (knapsack/LCS-style); highlight the recurrence each cell pulls from.', widget: 'sim' },
        ],
      },
      {
        id: 'graphs-beyond-bfs',
        label: 'Graphs (beyond BFS)',
        modules: [
          { id: 'cp-dijkstra',   title: 'Shortest paths',                model: 'Relax edges on a weighted graph; watch the priority queue settle distances.', widget: 'stepper' },
          { id: 'cp-union-find', title: 'Union-find',                    model: 'Union nodes; watch the forest flatten with path compression; query connectivity.', widget: 'stepper' },
          { id: 'cp-topo',       title: 'Topological sort & MST',        model: 'Peel zero-indegree nodes for a topo order; then grow an MST edge by edge.', widget: 'stepper' },
        ],
      },
      {
        id: 'advanced-structures',
        label: 'Advanced Structures',
        modules: [
          { id: 'cp-segtree',    title: 'Segment / Fenwick trees',       model: 'Point-update + range-query on a segment tree; watch the O(log n) path light up.', widget: 'stepper' },
        ],
      },
    ],
  },

  {
    id: 'the-metal',
    track: 'branch',
    order: 8,
    title: 'The Metal',
    subtitle: 'What the hardware does with your code — cache, floats, and the GPU.',
    accent: 'var(--yellow)',
    status: 'planned',
    charterNote: 'The substrate branch (D-PL-22). Below-Python mechanics projected into runnable Python — cache effects and float bits run live in Pyodide; the GPU is modeled, never faked as executable.',
    identity: 'The Machine\'s depth sequel: room 2 shows what Python costs, this room shows WHY the hardware charges it. The systems-depth vertical — memory layout, number representation, the accelerator mental model — that separates a library operator from an engineer who can reason under the abstraction.',
    grounding: 'CS:APP (memory hierarchy, data representation) · High Performance Python · PMPP (the GPU execution model) · plan-sys-* DO stubs (pyLabPlanned.js)',
    clusters: [
      {
        id: 'memory-layout',
        label: 'Memory Layout',
        modules: [
          { id: 'mt-cache',      title: 'Cache lines: why traversal order matters', model: 'Walk the same matrix row-major then column-major; the glass-box wall-clock diverges on identical work — the cache line is the reason.', widget: 'live' },
          { id: 'mt-strides',    title: 'Strides & contiguity',           model: 'Transpose an array — free, only strides change; then .copy() and watch memory actually move; check .flags to see which is which.', widget: 'live' },
          { id: 'mt-boxed',      title: 'What a Python object costs',     model: 'Compare a list of a million ints against the numpy int32 buffer; tracemalloc shows the boxed-object tax live.', widget: 'live' },
          { id: 'mt-blocking',   title: 'Cache blocking: tiling a matmul', model: 'Slide the tile size on a blocked matrix multiply; watch the measured time dip where the tile fits cache and climb on either side.', widget: 'live' },
        ],
      },
      {
        id: 'numbers',
        label: 'Numbers',
        modules: [
          { id: 'mt-float',      title: 'IEEE-754: why 0.1 + 0.2 != 0.3', model: 'Inspect the actual bits of a float; drag the mantissa; watch which decimals are representable and which silently round.', widget: 'live' },
          { id: 'mt-precision',  title: 'float64 -> float32 -> float16',  model: 'Accumulate a long sum at each precision; watch the error grow as bits shrink — and where fp16 falls off a cliff.', widget: 'live' },
          { id: 'mt-overflow',   title: 'Overflow & dtype wrap-around',   model: 'Increment an int8 past 127; watch it wrap negative with no error — the silent bug class dtype limits create.', widget: 'live' },
          { id: 'mt-quantize',   title: 'Quantization: int8 for free(ish)', model: 'Quantize a float32 weight array to int8; slide the scale; watch memory drop 4x while the round-trip error histogram grows — the trade inference engineers tune.', widget: 'live' },
        ],
      },
      {
        id: 'the-accelerator',
        label: 'The Accelerator',
        modules: [
          { id: 'mt-simd',       title: 'SIMD: the parallelism inside one core', model: 'Same loop, scalar vs vector lanes; step how one instruction processes 8 values; the numpy speedup finally has a mechanism, not just a name.', widget: 'stepper' },
          { id: 'mt-gpu-model',  title: 'The GPU mental model: thousands of slow workers', model: 'Slide task parallelism; watch a few fast cores beat the GPU on serial work and lose by 100x on parallel work.', widget: 'sim' },
          { id: 'mt-transfer',   title: 'The transfer tax: host <-> device', model: 'Slide the compute-per-byte ratio; watch the PCIe copy dominate small kernels — why you batch work onto the device and keep it there.', widget: 'sim' },
          { id: 'mt-batching',   title: 'Batching: feeding the beast',     model: 'Slide batch size; watch GPU utilization climb, then latency pay for it — the throughput/latency trade every inference engineer tunes.', widget: 'sim' },
          { id: 'mt-roofline',   title: 'The roofline: bandwidth-bound or compute-bound', model: 'Drag a kernel\'s arithmetic intensity along the roofline; watch it pin against the memory-bandwidth slope or the compute ceiling — the one chart that explains every perf conversation.', widget: 'sim' },
          { id: 'mt-compiler',   title: 'What -O2 did to your loop',       model: 'The same C loop through the optimizer\'s passes - inline, unroll, autovectorize - against real godbolt output. The model (not the course) behind why identical source runs 10x apart.', widget: 'concept' },
          { id: 'mt-branch',     title: 'Branch prediction: the sorted-array mystery', model: 'Filter the same values sorted then shuffled; identical work, measured gap - the predictor learns the sorted branch and pays for the random one.', widget: 'live' },
        ],
      },
    ],
  },

  {
    id: 'the-os-floor',
    track: 'branch',
    order: 10,
    title: 'The OS Floor',
    subtitle: 'Processes, virtual memory, and I/O — the layer production actually breaks on.',
    accent: 'var(--teal)',
    status: 'planned',
    charterNote: 'The OS companion to rooms 5 and 8 (D-PL-23). OSTEP\'s three pillars projected into models: what Pyodide can measure runs live; kernel-side mechanics are honest steppers, never faked.',
    identity: 'Every senior systems screen assumes it: what a process IS, why the scheduler preempts you, what a page fault costs, where a socket read blocks. The room that turns \'the OS is magic\' into \'the OS is a scheduler, a page table, and a file descriptor.\'',
    grounding: 'OSTEP (virtualization / concurrency / persistence) · CS:APP ch. 8-10 · plan-tool-* DO stubs',
    clusters: [
      {
        id: 'processes-and-scheduling',
        label: 'Processes & Scheduling',
        modules: [
          { id: 'os-process',    title: 'A process is a saved machine',    model: 'Step a context switch: registers out, page table swapped, registers in; watch two processes each believe they own the CPU.', widget: 'stepper' },
          { id: 'os-scheduler',  title: 'The scheduler: who runs next',    model: 'Drag job lengths under FIFO vs shortest-first vs round-robin; watch average wait time and the starvation case flip between policies.', widget: 'sim' },
          { id: 'os-syscall',    title: 'The syscall boundary',            model: 'Step a read() from user mode into the kernel and back; watch why crossing costs microseconds and why batching syscalls matters.', widget: 'stepper' },
        ],
      },
      {
        id: 'virtual-memory',
        label: 'Virtual Memory',
        modules: [
          { id: 'os-pages',      title: 'Virtual memory: the address lie', model: 'Translate a virtual address through a page table; watch two processes use the same address for different memory.', widget: 'stepper' },
          { id: 'os-page-fault', title: 'The page fault & the disk cliff', model: 'Touch a page that is not resident; watch the fault, the disk fetch, and the 100,000x latency cliff the working-set concept exists to avoid.', widget: 'sim' },
          { id: 'os-oom',        title: 'What \'out of memory\' actually means', model: 'Grow allocations past RAM; watch swap absorb, thrash, then the OOM killer choose a victim — why your training job died at 3am.', widget: 'sim' },
        ],
      },
      {
        id: 'io-and-the-wire',
        label: 'I/O & The Wire',
        modules: [
          { id: 'os-buffering',  title: 'Buffered vs unbuffered I/O',      model: 'Write a million lines with and without buffering; the measured gap is the syscall boundary, counted.', widget: 'live' },
          { id: 'os-sockets',    title: 'A socket is a file that blocks',  model: 'Step a request through connect/send/recv; watch where the caller blocks and what a timeout actually interrupts.', widget: 'stepper' },
          { id: 'os-epoll',      title: 'epoll: how one thread serves 10k connections', model: 'Register many slow sockets with a readiness loop; watch one thread service them all — the mechanism under room 5\'s event loop.', widget: 'sim' },
          { id: 'os-signals',    title: 'Signals: SIGTERM, SIGKILL, and graceful shutdown', model: 'Send signals to a running process; watch which can be caught for cleanup and which cannot - why kill -9 corrupts and what a shutdown hook actually hooks.', widget: 'stepper' },
          { id: 'os-fd',         title: 'File descriptors are a finite table', model: 'Open connections without closing; watch the fd table fill to the ulimit and the next open fail - the too-many-open-files outage, stepped.', widget: 'stepper' },
        ],
      },
    ],
  },

  {
    id: 'cpp-second-language',
    track: 'branch',
    order: 11,
    title: 'C++: The Second Language',
    subtitle: 'Reading the language the fast layer is written in.',
    accent: 'var(--red)',
    status: 'planned',
    charterNote: 'Reading-first by design (D-PL-23): no C++ runtime in the browser, so every module is predict-then-reveal over real snippets — honest steppers and annotated reads, never a fake executor. The bilingual floor for anyone whose stack bottoms out in numpy/PyTorch C++.',
    identity: 'The interview reality for systems-depth ML roles: the fast layer is C++, and \'can you READ it\' comes before \'can you write it.\' Ownership, lifetimes, and value semantics — taught by contrast with the Python model rooms 1-2 installed.',
    grounding: 'learncpp.com (mechanics) · CS:APP ch. 2 · Compiler Explorer habit · CLRS ch. 11 (the hash map every screen asks for)',
    clusters: [
      {
        id: 'memory-and-ownership',
        label: 'Memory & Ownership',
        modules: [
          { id: 'cpp-stack-heap', title: 'Stack vs heap, for real this time', model: 'Predict where each variable lives in a snippet; step frames pushing and popping while heap blocks outlive them — the model Python hides and C++ hands you.', widget: 'stepper' },
          { id: 'cpp-pointers',  title: 'Pointers vs references',           model: 'Predict what each of *p, &x, and a reference parameter does to the caller\'s value; reveal against the annotated trace.', widget: 'stepper' },
          { id: 'cpp-raii',      title: 'RAII: the destructor is the cleanup', model: 'Step a scope exit; watch destructors fire in reverse order — including on the exception path — and compare with Python\'s with block.', widget: 'stepper' },
          { id: 'cpp-ownership', title: 'Ownership & move semantics',       model: 'Trace a vector passed by value, by reference, and moved; watch which copies allocate and which just steal the pointer.', widget: 'stepper' },
          { id: 'cpp-smart-ptr', title: 'Smart pointers: RAII for the heap',  model: 'Trace unique_ptr owning, moving, and auto-deleting; then shared_ptr\'s refcount tick to zero - why modern C++ almost never writes delete.', widget: 'stepper' },
        ],
      },
      {
        id: 'value-semantics',
        label: 'Value Semantics',
        modules: [
          { id: 'cpp-values',    title: 'Copies by default: the anti-Python', model: 'The same assignment in both languages side by side: Python binds a name, C++ copies the object — predict which mutations are visible where.', widget: 'stepper' },
          { id: 'cpp-vector',    title: 'What std::vector actually is',     model: 'Step push_back through capacity doubling — pointer, size, capacity — and recognize the dynamic array every entrance screen makes you build.', widget: 'stepper' },
          { id: 'cpp-unordered', title: 'What std::unordered_map actually is', model: 'Drop keys into buckets with chaining; reuse room 2\'s hash model; watch load factor trigger a rehash.', widget: 'sim' },
          { id: 'cpp-virtual',   title: 'virtual: dispatch decided at runtime', model: 'Call the same method through a base pointer with and without virtual; step the vtable lookup that picks the override - and what that indirection costs.', widget: 'stepper' },
          { id: 'cpp-iterators', title: 'Iterators & range-for',           model: 'Desugar for (auto& x : v) into begin()/end()/++ steps; watch an insert invalidate the iterator mid-loop - the crash Python never showed you.', widget: 'stepper' },
        ],
      },
      {
        id: 'reading-cpp',
        label: 'Reading C++',
        modules: [
          { id: 'cpp-read-signature', title: 'Reading a real signature',    model: 'Decode const T&, T&&, and auto in signatures lifted from real library code; predict what each promises the caller before the reveal.', widget: 'concept' },
          { id: 'cpp-read-error', title: 'Reading the compiler & the sanitizer', model: 'Given a template error wall and an ASan heap-overflow report, locate the actual bug line — the skill that makes the toolchain a teacher.', widget: 'concept' },
          { id: 'cpp-read-kernel', title: 'Read a real kernel',             model: 'An annotated walk through a small real C++ loop from a numeric library; map every line back to the Python call that hides it.', widget: 'concept' },
          { id: 'cpp-const',     title: 'const: the promise in the signature', model: 'Read const T&, const methods, and constexpr in real signatures; predict what each forbids the callee from doing - the contract-reading skill.', widget: 'concept' },
          { id: 'cpp-templates', title: 'Templates: code stamped at compile time', model: 'Watch vector<int> and vector<double> stamp two real functions from one template - and why the error wall names a type you never wrote.', widget: 'concept' },
          { id: 'cpp-lambdas',   title: 'Lambdas: [&] vs [=] and what gets captured', model: 'Read the same lambda with reference and value captures; predict which sees the mutation and which dangles after scope exit - modern C++\'s most-read syntax.', widget: 'concept' },
          { id: 'cpp-ub',        title: 'Undefined behaviour: the contract you broke', model: 'Predict-then-reveal on real UB snippets - signed overflow, dangling reference, out-of-bounds - and what the sanitizer vs the optimizer each did to them.', widget: 'concept' },
          { id: 'cpp-linker',    title: 'The compile-link model: why undefined reference', model: 'Step two translation units through compile then link; watch a missing definition survive compilation and explode at link - reading the toolchain\'s other error wall.', widget: 'stepper' },
        ],
      },
    ],
  },

  {
    id: 'tensors-autograd',
    track: 'branch',
    order: 9,
    title: 'Tensors & Autograd',
    subtitle: 'PyTorch / TensorFlow mechanics — how the array library thinks.',
    accent: 'var(--accent)',
    status: 'planned',
    charterNote: 'Library MECHANICS only (amends the \'no ML internals\' line). Modeling/training stays in ml-systems-lab — the KNOW->DO seam (D-PL-21).',
    identity: 'The through-line from NumPy: broadcasting -> tensors -> the autograd graph. What .backward() records, why a shape mismatch errors. Not how to train a model.',
    grounding: 'PyTorch autograd tutorial (the DAG, define-by-run) · tensor broadcasting docs',
    clusters: [
      {
        id: 'tensors',
        label: 'Tensors',
        modules: [
          { id: 'ta-tensor',     title: 'The tensor & its rank',         model: 'Build scalar->vector->matrix->N-d; show rank/shape/dtype/device on the same object.', widget: 'live' },
          { id: 'ta-broadcast',  title: 'Tensor broadcasting',           model: 'Reuse the NumPy broadcast model on tensors; drag shapes together; watch the unsqueeze + stretch.', widget: 'sim' },
        ],
      },
      {
        id: 'autograd',
        label: 'Autograd',
        modules: [
          { id: 'ta-grad',       title: 'requires_grad & the graph',     model: 'Flip requires_grad; run a forward op; watch the dynamic DAG record itself node by node (define-by-run).', widget: 'sim' },
          { id: 'ta-backward',   title: 'What .backward() does',         model: 'Call backward on a tiny expression; trace the chain rule from root to leaves; read the .grad that lands on each leaf.', widget: 'stepper' },
        ],
      },
      {
        id: 'shapes-in-practice',
        label: 'Shapes in Practice',
        modules: [
          { id: 'ta-shape-err',  title: 'The shape-mismatch error',      model: 'Feed mismatched shapes to a matmul; read the error; reshape/permute/view to fix it live.', widget: 'live' },
          { id: 'ta-nograd',     title: 'no_grad, detach, and the eval-loop leak', model: 'Run a forward pass with and without no_grad; watch the graph (and memory) build in one and not the other - the mechanics under why-does-my-eval-loop-OOM.', widget: 'sim' },
          { id: 'ta-inplace',    title: 'In-place ops vs autograd',       model: 'Mutate a tensor a saved graph still needs; watch autograd raise the version-counter error - the aliasing thread (rooms 1 and 4) at its third altitude.', widget: 'sim' },
          { id: 'ta-device',     title: 'Devices and dtypes: where the tensor lives', model: 'Move a tensor cpu->device and float32->float16; watch which ops now error across devices and what the cast costs - The Metal\'s transfer tax, at the API surface.', widget: 'sim' },
        ],
      },
    ],
  },

  // ─────────────── D-PL-24 BRANCHES (the serving-path substrate) ───────────────
  {
    id: 'the-wire',
    track: 'branch',
    order: 12,
    title: 'The Wire',
    subtitle: 'The network under every API call - latency, TCP/HTTP, bytes on the wire.',
    accent: 'var(--accent)',
    status: 'planned',
    charterNote: 'D-PL-24. The serving-path TOP half only: latency, connections, HTTP semantics, serialization. Routing/link-layer (the bottom half) deliberately excluded - no target loop asks it. KNOW twin of the plan-api-* DO stubs.',
    identity: 'Every capstone that serves and every senior loop that asks \'what happens when you call the API\' runs on this room. Distance costs, connections cost, bytes cost - all three made measurable.',
    grounding: 'The Dean/Norvig latency table - High Performance Browser Networking (Grigorik) - HTTP semantics (RFC 9110, read selectively)',
    clusters: [
      {
        id: 'the-cost-of-distance',
        label: 'The Cost of Distance',
        modules: [
          { id: 'wr-latency',    title: 'Latency numbers every engineer knows', model: 'Slide from L1 cache to same-rack to cross-continent on a log scale; watch the nanosecond-to-millisecond cliff that explains why the network is never free.', widget: 'sim' },
          { id: 'wr-rtt',        title: 'Round trips dominate',            model: 'Fetch 50 items as 50 sequential calls, then 5 batched pages, then 1 bulk call; the timeline shows RTT x count crushing payload size - the N+1 problem, felt.', widget: 'sim' },
          { id: 'wr-bw-latency', title: 'Bandwidth is not latency',        model: 'Slide each independently; watch a fat slow pipe lose to a thin fast one on small payloads and win on bulk - why CDNs and batching solve different problems.', widget: 'sim' },
        ],
      },
      {
        id: 'tcp-and-http',
        label: 'TCP & HTTP',
        modules: [
          { id: 'wr-handshake',  title: 'What a connection costs',         model: 'Step the TCP handshake plus TLS; count round trips before byte one of payload; then reuse the connection and watch keep-alive amortize it away.', widget: 'stepper' },
          { id: 'wr-pooling',    title: 'Connection pooling',              model: 'Fire 100 requests with and without a pool; watch handshake overhead stack up serially vs vanish behind reuse - why every production client pools.', widget: 'sim' },
          { id: 'wr-http',       title: 'The HTTP request, anatomized',    model: 'Assemble method + path + headers + body; fire it at a toy handler; map the response line, status class, and headers back to what the server decided.', widget: 'stepper' },
          { id: 'wr-hol',        title: 'Head-of-line blocking',           model: 'Queue responses behind one slow request on a single connection; watch everything stall; then multiplex and watch the stall dissolve - the problem HTTP/2 exists to solve.', widget: 'sim' },
        ],
      },
      {
        id: 'bytes-on-the-wire',
        label: 'Bytes on the Wire',
        modules: [
          { id: 'wr-serialize',  title: 'json vs binary on the wire',      model: 'Serialize the same record as json and a packed binary layout; compare bytes and encode/decode time measured live - the trade protobuf and friends make.', widget: 'live' },
          { id: 'wr-columnar',   title: 'Row vs column on the wire',       model: 'Ship a table row-wise then column-wise; watch column layout compress and slice better for analytics - the same layout story as The Metal\'s cache room, one level up.', widget: 'sim' },
          { id: 'wr-compress',   title: 'Compression: cheap wins, real costs', model: 'Slide compression level on a real payload; watch bytes fall while CPU time climbs - the knob every high-volume service tunes.', widget: 'live' },
          { id: 'wr-timeouts',   title: 'Timeout budgets & the retry storm', model: 'Chain three services with independent timeouts and retries; slide one latency up; watch retries multiply load downstream and the budget overrun - the cascading-failure model every serving loop asks.', widget: 'sim' },
          { id: 'wr-lb',         title: 'Load balancing: spreading the herd', model: 'Route requests round-robin vs least-connections while one backend degrades; watch tail latency and the thundering-herd retry pile-up differ by policy.', widget: 'sim' },
        ],
      },
    ],
  },

  {
    id: 'storage-engines',
    track: 'branch',
    order: 13,
    title: 'Storage Engines',
    subtitle: 'What the database actually does - indexes, logs, and why your query is slow.',
    accent: 'var(--accent)',
    status: 'planned',
    charterNote: 'D-PL-24. The KNOW room under the SQL Lab DO bank (same KNOW/DO seam as PyLab). Mechanics only - B-trees, LSM, WAL, plans; query-WRITING drills stay in SQL Lab. Vector indexes bridge to the mini-vector-DB capstone shape.',
    identity: 'PL teaches what a dict costs and what a cache line is; this room is the same glass-box turned on the database - the index, the log, and the plan, as models you drive.',
    grounding: 'Database Internals (Petrov, selectively) - Use The Index, Luke - SQLite EXPLAIN docs (Pyodide ships sqlite3, so plans run LIVE)',
    clusters: [
      {
        id: 'the-index',
        label: 'The Index',
        modules: [
          { id: 'se-btree',      title: 'The B-tree: why lookups are log n', model: 'Insert keys into a B-tree; watch nodes fill and split; trace one lookup\'s root-to-leaf path - the structure under almost every index.', widget: 'stepper' },
          { id: 'se-lsm',        title: 'The LSM tree: write fast, merge later', model: 'Stream writes into a memtable; watch it flush to sorted runs and compact; trace a read through the levels - the write-optimized answer to the B-tree.', widget: 'sim' },
          { id: 'se-index-trade', title: 'The index trade',                model: 'Run the same point lookup and full scan with and without an index on real sqlite, live; watch reads flip from O(n) to O(log n) while writes pay the maintenance tax.', widget: 'live' },
          { id: 'se-vector',     title: 'Vector indexes: flat vs approximate', model: 'Search embeddings flat (exact, O(n)) then through an IVF-style partition; slide the probe count; watch recall trade against speed - the index inside every vector DB.', widget: 'sim' },
        ],
      },
      {
        id: 'the-log-and-the-guarantee',
        label: 'The Log & The Guarantee',
        modules: [
          { id: 'se-wal',        title: 'The write-ahead log',             model: 'Write, crash mid-transaction, recover: step the WAL replay and watch committed work survive while the half-done transaction rolls back.', widget: 'stepper' },
          { id: 'se-acid',       title: 'What a transaction promises',     model: 'Interleave two transactions on one account balance; step isolation levels from read-uncommitted up; watch which anomalies (dirty read, lost update) each level kills.', widget: 'stepper' },
        ],
      },
      {
        id: 'reading-the-plan',
        label: 'Reading the Plan',
        modules: [
          { id: 'se-plan',       title: 'Why your query is slow',          model: 'EXPLAIN a real sqlite query live; toggle an index and a rewrite; watch the plan flip from SCAN to SEARCH and the measured time follow.', widget: 'live' },
          { id: 'se-layout',     title: 'Row store vs column store',       model: 'Run \'one whole row\' vs \'one column, all rows\' against both layouts; watch each layout win its own access pattern - the reason analytics engines are columnar.', widget: 'sim' },
          { id: 'se-nplus1',     title: 'The N+1 query',                   model: 'Load 50 parents then lazily fetch each child - 51 round trips on real sqlite, measured - then rewrite as one join; the ORM trap, counted. Ties to The Wire\'s RTT module.', widget: 'live' },
          { id: 'se-pagination', title: 'OFFSET vs keyset pagination',     model: 'Page 1 vs page 10,000 with OFFSET on real sqlite - watch the scan grow linearly - then keyset-paginate the same query flat; the KNOW twin of the plan-api pagination stub.', widget: 'live' },
        ],
      },
    ],
  },
];

// Convenience selectors (mirror banks.js usage). Sorted by order so display
// never depends on physical array position (D-PL-22 inserted rooms mid-list).
export const TRUNK_ROOMS  = FOUNDATION_ROOMS.filter(r => r.track === 'trunk').sort((a, b) => a.order - b.order);
export const BRANCH_ROOMS = FOUNDATION_ROOMS.filter(r => r.track === 'branch').sort((a, b) => a.order - b.order);

// Skeleton tallies (for STATUS / the future Progress dashboard).
export const FOUNDATION_TALLY = {
  rooms:    FOUNDATION_ROOMS.length,
  trunk:    TRUNK_ROOMS.length,
  branch:   BRANCH_ROOMS.length,
  clusters: FOUNDATION_ROOMS.reduce((n, r) => n + r.clusters.length, 0),
  modules:  FOUNDATION_ROOMS.reduce((n, r) => n + r.clusters.reduce((m, c) => m + c.modules.length, 0), 0),
};

// ── KNOW merge (D-PL-21 / F1 structural) ──────────────────────────────────
// The 20 authored \'Python & OOP Depth\' modules (knowModules.js) ARE Foundations
// content — there should not be two KNOW rooms. KNOW_BACKING links a planned
// module to its already-authored module (id in knowModules); that card is READY
// now (opens the runnable predict->reveal flow), the rest stay \'planned\'.
// KNOW_EXTRA adds the authored modules that have no planned counterpart, so no
// real content is lost. Upgrade path (F1+): swap each predict-run-read module
// for its driven live/sim model.
export const KNOW_BACKING = {
  'pf-binding': 'know-names-are-bindings',
  'pf-mutable-default': 'know-mutable-default-args',
  'pf-legb': 'know-legb-and-closures',
  'pf-args': 'know-args-kwargs-binding',
  'pf-generators': 'know-generators-are-lazy',
  'pf-dunders': 'know-dunder-data-model',
  'pf-truthiness': 'know-truthiness-or-default',
  'pf-iteration': 'know-iterator-protocol',
  'pf-is-vs-eq': 'know-is-vs-equals',
  'pf-dataclasses': 'know-dataclass-generates',
  'pf-decorators': 'know-decorators-from-scratch',
  'pf-context': 'know-context-manager',
  'sp-hints': 'know-hints-dont-enforce',
  'sp-exceptions': 'know-eafp-vs-lbyl',
};
// Authored modules with no planned counterpart — appended into their cluster, READY now.
export const KNOW_EXTRA = {
  'python-foundations': {
    'the-data-model': [
      { id: 'pf-bool-len', title: 'How if obj: decides truth', model: '__bool__ then __len__ then default True — the truth-test protocol, run live.', widget: 'live', live: 'know-bool-len-fallback' },
      { id: 'pf-operator-dispatch', title: 'Operators dispatch to dunders', model: 'a + b calls a.__add__(b); watch the operator resolve to the dunder.', widget: 'live', live: 'know-operator-dispatch' },
    ],
    'objects-and-classes': [
      { id: 'pf-eq-hash', title: 'The __eq__ / __hash__ contract', model: 'Override __eq__ without __hash__; watch the object break as a dict key.', widget: 'live', live: 'know-eq-hash-contract' },
      { id: 'pf-property', title: 'Properties turn access into a call', model: 'Wrap an attribute in @property; watch plain access run a method.', widget: 'live', live: 'know-property-descriptor' },
    ],
    'decorators-and-context': [
      { id: 'pf-wraps', title: 'functools.wraps and the lost identity', model: 'Decorate without wraps; watch __name__/__doc__ vanish; add wraps to restore them.', widget: 'live', live: 'know-functools-wraps' },
    ],
  },
  'the-machine': {
    'execution': [
      { id: 'mc-import-cache', title: 'A module runs once, then caches', model: 'Import twice; watch top-level code run once and sys.modules serve the cache.', widget: 'live', live: 'know-import-runs-once' },
    ],
  },
};

// Helper: every module in a cluster (planned skeleton + the authored extras).
export function clusterModules(roomId, clusterId, baseModules) {
  const extra = (KNOW_EXTRA[roomId] && KNOW_EXTRA[roomId][clusterId]) || [];
  return baseModules.concat(extra);
}
// Helper: the authored knowModule id backing a module, if any (=> READY now).
export function backingFor(mod) {
  return mod.live || KNOW_BACKING[mod.id] || null;
}

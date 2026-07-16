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
          { id: 'pf-generators',  title: 'Generators are lazy and one-shot', model: 'Step next() one value at a time; show nothing computes until asked; contrast memory with the list version.', widget: 'live' },
        ],
      },
      {
        id: 'the-data-model',
        label: 'The Data Model',
        modules: [
          { id: 'pf-dunders',     title: 'Dunders: how objects answer the language', model: 'Define __len__/__bool__/__eq__ on a toy class; call len()/if/== and watch which dunder fires.', widget: 'live' },
          { id: 'pf-truthiness',  title: 'How if obj: decides truth',      model: 'Flip __bool__ then __len__ then neither; watch the truth-test fall through the protocol.', widget: 'live' },
          { id: 'pf-iteration',   title: 'The iteration protocol',         model: 'Drive __iter__/__next__ by hand; show what a for-loop actually calls under the hood.', widget: 'stepper' },
          { id: 'pf-is-vs-eq',    title: 'is vs == and the caches that lie', model: 'Compare small ints / short strings vs large ones; watch identity flip while equality holds.', widget: 'live' },
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
        ],
      },
      {
        id: 'numbers',
        label: 'Numbers',
        modules: [
          { id: 'mt-float',      title: 'IEEE-754: why 0.1 + 0.2 != 0.3', model: 'Inspect the actual bits of a float; drag the mantissa; watch which decimals are representable and which silently round.', widget: 'live' },
          { id: 'mt-precision',  title: 'float64 -> float32 -> float16',  model: 'Accumulate a long sum at each precision; watch the error grow as bits shrink — and where fp16 falls off a cliff.', widget: 'live' },
          { id: 'mt-overflow',   title: 'Overflow & dtype wrap-around',   model: 'Increment an int8 past 127; watch it wrap negative with no error — the silent bug class dtype limits create.', widget: 'live' },
        ],
      },
      {
        id: 'the-accelerator',
        label: 'The Accelerator',
        modules: [
          { id: 'mt-gpu-model',  title: 'The GPU mental model: thousands of slow workers', model: 'Slide task parallelism; watch a few fast cores beat the GPU on serial work and lose by 100x on parallel work.', widget: 'sim' },
          { id: 'mt-transfer',   title: 'The transfer tax: host <-> device', model: 'Slide the compute-per-byte ratio; watch the PCIe copy dominate small kernels — why you batch work onto the device and keep it there.', widget: 'sim' },
          { id: 'mt-batching',   title: 'Batching: feeding the beast',     model: 'Slide batch size; watch GPU utilization climb, then latency pay for it — the throughput/latency trade every inference engineer tunes.', widget: 'sim' },
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

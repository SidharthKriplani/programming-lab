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
    order: 5,
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
        id: 'concurrency-and-repro',
        label: 'Concurrency & Reproducibility',
        modules: [
          { id: 'sp-async',      title: 'async/await & the event loop',  model: 'Timeline where await yields control; watch ten simulated calls interleave instead of blocking serially.', widget: 'sim' },
          { id: 'sp-repro',      title: 'Seed everything',               model: 'Seed only Python\'s RNG, then numpy, then the framework; watch which \'seeded\' run still differs.', widget: 'concept' },
        ],
      },
    ],
  },

  // ──────────────────────────── BRANCHES ────────────────────────────
  // SCOPE NOTE: branches 6 and 7 exceed PL\'s charter (D-PL-07 easy->med; the
  // \'ML internals = MSL\'s lane\' line). Adopted as a conscious amendment — D-PL-21.
  {
    id: 'competitive-programming',
    track: 'branch',
    order: 6,
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
    id: 'tensors-autograd',
    track: 'branch',
    order: 7,
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

// Convenience selectors (mirror banks.js usage).
export const TRUNK_ROOMS  = FOUNDATION_ROOMS.filter(r => r.track === 'trunk');
export const BRANCH_ROOMS = FOUNDATION_ROOMS.filter(r => r.track === 'branch');

// Skeleton tallies (for STATUS / the future Progress dashboard).
export const FOUNDATION_TALLY = {
  rooms:    FOUNDATION_ROOMS.length,
  trunk:    TRUNK_ROOMS.length,
  branch:   BRANCH_ROOMS.length,
  clusters: FOUNDATION_ROOMS.reduce((n, r) => n + r.clusters.length, 0),
  modules:  FOUNDATION_ROOMS.reduce((n, r) => n + r.clusters.reduce((m, c) => m + c.modules.length, 0), 0),
};

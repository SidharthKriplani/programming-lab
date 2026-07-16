// plQnaBank — PL's interview QnA bank (sibling parity: MSL qnaBank DNA, PL scope).
// Question IDs are GLOBAL and PERMANENT — never renumber or reuse.
// level: 0 recall · 1 mechanism · 2 tradeoff/diagnosis. difficulty is judged per
// question, not derived from level. answer[] lines use the house beats:
// **Answer.** the direct reply · **Mechanism.** why · **Boundary.** where it stops.
// Every technical claim below is standard, verifiable canon; anything demo-able
// is drilled by the matching Foundations module (room field).

export const PL_QNA = [
  // ── python-foundations ──
  { id: 'plq-mutable-default-01', room: 'python-foundations', level: 1, difficulty: 'easy',
    q: 'This function appends to a default list argument. The caller reports values leaking across calls. What happened?',
    answer: [
      '**Answer.** The default list is evaluated once at def time and stored on the function object — every call without the argument shares the SAME list.',
      '**Mechanism.** Defaults live in fn.__defaults__; the append mutates that shared object, so state persists across calls.',
      '**Boundary.** Immutable defaults (None, ints, strings) are safe — the fix is default None, create the list inside the body.',
    ] },
  { id: 'plq-is-eq-01', room: 'python-foundations', level: 1, difficulty: 'medium',
    q: 'A teammate\'s `if user_id is 1000:` worked in every test and fails in production. Explain.',
    answer: [
      '**Answer.** `is` tests identity, not equality — it "worked" only because CPython caches small ints (-5..256), and tests happened to use cached values or the same object.',
      '**Mechanism.** 1000 is outside the cache, so each literal can be a distinct object; identity fails even though == succeeds.',
      '**Boundary.** `is` is correct only for singletons (None, True, False). Interning behavior is an implementation detail, never a contract.',
    ] },
  { id: 'plq-closure-loop-01', room: 'python-foundations', level: 1, difficulty: 'medium',
    q: 'You build callbacks in a loop: `for i in range(3): fns.append(lambda: i)`. All three return 2. Why, and the fix?',
    answer: [
      '**Answer.** Closures capture the NAME i, not its value at creation — by call time the loop is done and i is 2 for all three.',
      '**Mechanism.** All lambdas share one enclosing scope cell; late binding reads it at call time.',
      '**Answer.** Fix: freeze the value per-lambda with a default argument (lambda i=i: i) or functools.partial.',
    ] },
  { id: 'plq-copy-depth-01', room: 'python-foundations', level: 0, difficulty: 'easy',
    q: 'When does copy.copy() not protect you, and what does deepcopy do differently?',
    answer: [
      '**Answer.** Shallow copy duplicates only the outer container — nested objects are still shared, so mutating an inner list changes both.',
      '**Mechanism.** deepcopy walks the whole object graph recursively (with a memo dict to survive cycles) and duplicates every level.',
      '**Boundary.** Deep copies of large graphs are expensive — often the real fix is not sharing mutable state in the first place.',
    ] },
  { id: 'plq-iter-protocol-01', room: 'python-foundations', level: 1, difficulty: 'medium',
    q: 'Your generator-backed report is empty on the second pass over the data. What is the model you were missing?',
    answer: [
      '**Answer.** Generators are one-shot iterators — the first full pass raises StopIteration internally and exhausts it; the second loop sees nothing.',
      '**Mechanism.** for calls iter() then next() until StopIteration; a generator IS its own iterator, so there is no fresh state to restart.',
      '**Boundary.** Lists are re-iterable because iter(list) makes a new iterator each time — materialize if you need multiple passes, or rebuild the generator.',
    ] },
  { id: 'plq-eq-hash-01', room: 'python-foundations', level: 2, difficulty: 'medium',
    q: 'After adding __eq__ to a class, instances stopped working as dict keys. Diagnose and state the contract.',
    answer: [
      '**Answer.** Defining __eq__ without __hash__ sets __hash__ to None — the class becomes unhashable by design.',
      '**Mechanism.** Dicts require: objects that compare equal MUST hash equal. A custom __eq__ breaks the inherited identity-hash guarantee, so Python disables hashing rather than corrupt buckets.',
      '**Answer.** Define __hash__ over the same fields __eq__ uses (or freeze the dataclass) — and keep those fields immutable, or a mutated key silently vanishes from its bucket.',
    ] },
  { id: 'plq-slice-copy-01', room: 'python-foundations', level: 0, difficulty: 'easy',
    q: 'Does a[1:4] give you a view or a copy — in a list, and in a numpy array?',
    answer: [
      '**Answer.** List slice: a NEW list (copy of references, O(k)). NumPy basic slice: a VIEW on the same buffer — writes hit the parent.',
      '**Mechanism.** Lists have no stride machinery; numpy reinterprets the same memory with new strides, which is why its slices are free and dangerous.',
      '**Boundary.** NumPy fancy/boolean indexing copies — the view rule is for basic slicing only.',
    ] },
  { id: 'plq-sort-stability-01', room: 'python-foundations', level: 1, difficulty: 'medium',
    q: 'Sort employees by department ascending and salary descending in one pass — and what property of Python\'s sort lets a two-pass version work too?',
    answer: [
      '**Answer.** One pass: sorted(emps, key=lambda e: (e.dept, -e.salary)).',
      '**Mechanism.** Tuple keys compare lexicographically; negating the numeric field flips its direction inside an ascending sort.',
      '**Answer.** Timsort is STABLE — equal keys keep prior order — so sorting by salary desc, then by dept asc, also yields dept-then-salary order.',
    ] },

  // ── the-machine ──
  { id: 'plq-membership-01', room: 'the-machine', level: 0, difficulty: 'easy',
    q: 'Why does `x in my_set` stay fast at a million elements while `x in my_list` does not?',
    answer: [
      '**Answer.** Set membership hashes x straight to a bucket — O(1) average; list membership scans elements one by one — O(n).',
      '**Mechanism.** The hash maps a value to a slot index directly, replacing search with arithmetic; collisions are resolved locally.',
      '**Boundary.** Worst case degrades with adversarial collisions, and set elements must be hashable.',
    ] },
  { id: 'plq-str-concat-01', room: 'the-machine', level: 1, difficulty: 'easy',
    q: 'A log formatter builds output with s += line over 100k lines and takes minutes. Diagnose.',
    answer: [
      '**Answer.** Strings are immutable — each += allocates a new string and copies both halves, so n appends do O(n^2) copying.',
      '**Mechanism.** Total copied chars ~ 1+2+...+n; at 100k lines that is billions of character copies.',
      '**Answer.** Fix: append to a list and "".join(parts) once — single allocation, O(n).',
    ] },
  { id: 'plq-refcount-cycle-01', room: 'the-machine', level: 2, difficulty: 'medium',
    q: 'CPython frees objects by refcounting — so why does it also run a garbage collector?',
    answer: [
      '**Answer.** Reference cycles (a.b = b; b.a = a) keep counts above zero forever — refcounting alone leaks them.',
      '**Mechanism.** The generational cycle collector periodically finds unreachable groups whose references are only internal and breaks them.',
      '**Boundary.** Refcounting still does most work deterministically — the GC is a backstop for cycles, not the main free path.',
    ] },
  { id: 'plq-amortized-01', room: 'the-machine', level: 1, difficulty: 'medium',
    q: 'list.append is "O(1) amortized". Unpack that phrase like you are explaining the growth policy you would implement.',
    answer: [
      '**Answer.** Appends are O(1) except when capacity is full — then the buffer over-allocates and copies all n elements.',
      '**Mechanism.** Geometric growth makes copies exponentially rare: total copy work across n appends is O(n), so the average per append is constant.',
      '**Boundary.** Individual appends can still spike O(n) — matters for latency-sensitive paths, which pre-allocate instead.',
    ] },
  { id: 'plq-vectorize-why-01', room: 'the-machine', level: 1, difficulty: 'medium',
    q: 'Same arithmetic, same n: the numpy expression is 100x faster than your for-loop. Name the actual costs the loop pays.',
    answer: [
      '**Answer.** Per-element interpreter dispatch, boxed PyObject allocation/refcounting, and pointer-chasing through non-contiguous heap objects.',
      '**Mechanism.** The vectorized call runs one compiled C loop over a contiguous typed buffer — cache lines fully used, SIMD available, zero per-element interpretation.',
      '**Boundary.** For tiny arrays the numpy call overhead can lose to the loop — vectorization wins at scale.',
    ] },

  // ── dsa-foundations ──
  { id: 'plq-two-pointer-01', room: 'dsa-foundations', level: 1, difficulty: 'easy',
    q: 'Pair-sum on a sorted array: why does moving one of two pointers never skip the answer?',
    answer: [
      '**Answer.** If the current sum is too small, only moving left rightward can increase it; too big, only moving right leftward can decrease it — the discarded combinations are provably worse.',
      '**Mechanism.** Sortedness makes each pointer move a monotone change to the sum, eliminating a whole row/column of the pair matrix per step.',
      '**Boundary.** Unsorted input breaks the argument — sort first (O(n log n)) or use a hash set instead.',
    ] },
  { id: 'plq-bfs-shortest-01', room: 'dsa-foundations', level: 1, difficulty: 'medium',
    q: 'Why does BFS give shortest paths on unweighted graphs, and where does that argument break with weights?',
    answer: [
      '**Answer.** BFS explores in expanding rings of edge-distance — a node is first reached via a minimum-edge path because all shorter rings were fully processed first.',
      '**Mechanism.** The queue preserves discovery order by level; the first visit is therefore optimal in edge count.',
      '**Boundary.** With weights, fewer edges is not less cost — a 2-edge path can beat a 1-edge path. Dijkstra restores the invariant by expanding by accumulated cost (priority queue).',
    ] },
  { id: 'plq-heap-topk-01', room: 'dsa-foundations', level: 2, difficulty: 'medium',
    q: 'Top-10 items from a stream of 10M: full sort, quickselect, or a heap — pick and defend.',
    answer: [
      '**Answer.** A size-10 MIN-heap: O(n log k) time, O(k) memory, single pass, stream-friendly.',
      '**Mechanism.** Each element either loses to the heap root (drop, O(1)) or replaces it (O(log k)); the heap always holds the 10 best seen.',
      '**Boundary.** If all data fits in memory and you need it once, quickselect is O(n) average — but it is offline, mutates the array, and gives unordered results.',
    ] },
  { id: 'plq-backtrack-01', room: 'dsa-foundations', level: 1, difficulty: 'medium',
    q: 'Your subsets solution returns N identical full lists. What line is missing from the backtracking template and why?',
    answer: [
      '**Answer.** You appended `path` itself instead of a copy — every result aliases the ONE list you keep mutating (append `path[:]`).',
      '**Mechanism.** choose/recurse/unchoose mutates path in place; all stored references show its final (unwound, often empty) state.',
      '**Boundary.** This is the rooms-1 aliasing model resurfacing inside DSA — same bug, different costume.',
    ] },
  { id: 'plq-binary-answer-01', room: 'dsa-foundations', level: 2, difficulty: 'hard',
    q: '"Minimum ship capacity to deliver packages in D days" — why is this a binary search problem with no sorted array in sight?',
    answer: [
      '**Answer.** Search the ANSWER space: feasibility is monotone in capacity — if c works, every capacity above c works.',
      '**Mechanism.** Write check(c) (greedy simulate days needed at capacity c, O(n)); bisect the smallest feasible c between max(weight) and sum(weights).',
      '**Boundary.** The pattern needs monotone feasibility; if check is not monotone in the parameter, bisection is invalid.',
    ] },
  { id: 'plq-greedy-proof-01', room: 'dsa-foundations', level: 2, difficulty: 'hard',
    q: 'Interval scheduling: earliest-END-time greedy is optimal, earliest-START is not. Sketch the exchange argument an interviewer wants.',
    answer: [
      '**Answer.** Take any optimal solution; its first interval can be swapped for the earliest-ending one without reducing count.',
      '**Mechanism.** The earliest-ending interval finishes no later, so everything compatible after the original stays compatible — repeat inductively and greedy matches optimal size.',
      '**Boundary.** Earliest-start fails because one long early interval can block many later ones — no exchange preserves the count.',
    ] },

  // ── array-dataframe-foundations ──
  { id: 'plq-broadcast-01', room: 'array-dataframe-foundations', level: 1, difficulty: 'medium',
    q: 'Shapes (3,4) and (3,) fail to add, but (3,4) and (4,) work. Walk the rule.',
    answer: [
      '**Answer.** Broadcasting aligns from the RIGHT: (3,4) vs (4,) pairs 4-with-4 then stretches the missing left axis — fine. (3,4) vs (3,) pairs 4-with-3 — mismatch.',
      '**Mechanism.** Each right-aligned dimension pair must be equal or 1; size-1 stretches virtually via strides, never allocating.',
      '**Answer.** Fix the failing case by making the intent explicit: a + b[:, None] to stretch across columns.',
    ] },
  { id: 'plq-setting-copy-01', room: 'array-dataframe-foundations', level: 2, difficulty: 'medium',
    q: 'df[df.x > 0]["y"] = 1 ran without error but changed nothing. Explain and fix.',
    answer: [
      '**Answer.** Chained indexing: the boolean filter returns a (possibly) temporary copy; the assignment wrote into it and the copy was discarded.',
      '**Mechanism.** Two separate __getitem__/__setitem__ calls — pandas cannot guarantee the write reaches the original, hence SettingWithCopyWarning.',
      '**Answer.** One atomic locate-and-set: df.loc[df.x > 0, "y"] = 1.',
    ] },
  { id: 'plq-merge-explode-01', room: 'array-dataframe-foundations', level: 2, difficulty: 'medium',
    q: 'A left join was supposed to keep 50k rows; the output has 480k. What happened and how do you make pandas refuse next time?',
    answer: [
      '**Answer.** The right table\'s join key was not unique — each left row matched many right rows, multiplying (m x n per duplicate key).',
      '**Mechanism.** Joins produce the cartesian product of matches within each key group; duplicated keys silently amplify rows.',
      '**Answer.** Assert intent: merge(..., validate="one_to_one" or "many_to_one") raises on violation; check right[key].duplicated().any() beforehand.',
    ] },
  { id: 'plq-nan-eq-01', room: 'array-dataframe-foundations', level: 1, difficulty: 'medium',
    q: 'df[df.col == np.nan] returns nothing even though the column has missing values. Why, and the two correct idioms?',
    answer: [
      '**Answer.** IEEE-754 defines NaN != NaN — equality with NaN is always False, including against another NaN.',
      '**Answer.** Use df.col.isna() (or notna()) for masks; pd.isna(x) for scalars.',
      '**Boundary.** Related trap: NaN is a float, so a missing value silently upcasts an int column to float64 unless you use nullable Int64.',
    ] },
  { id: 'plq-groupby-transform-01', room: 'array-dataframe-foundations', level: 1, difficulty: 'medium',
    q: 'agg vs transform on a groupby — when do you need each?',
    answer: [
      '**Answer.** agg collapses to one row per group (report shapes); transform returns a result ALIGNED to the original index (per-row features).',
      '**Mechanism.** transform broadcasts each group\'s statistic back onto that group\'s rows — perfect for group-demeaning or within-group fills.',
      '**Answer.** Canonical: df["dept_avg"] = df.groupby("dept")["salary"].transform("mean") — then salary - dept_avg needs no join.',
    ] },
  { id: 'plq-view-copy-np-01', room: 'array-dataframe-foundations', level: 2, difficulty: 'hard',
    q: 'A function received a numpy slice, modified it "locally", and corrupted the caller\'s data. Give the mechanism and the two-sided defense.',
    answer: [
      '**Answer.** Basic slices are VIEWS — same buffer, new strides — so in-place writes propagate to the parent.',
      '**Mechanism.** numpy avoids copies for speed; a.base is not None tells you an array borrows memory.',
      '**Answer.** Callee: copy on entry if mutating (arr = arr.copy()). Caller: pass arr.copy() or set arr.flags.writeable = False to make violations loud.',
    ] },

  // ── concurrency-foundations ──
  { id: 'plq-gil-threads-01', room: 'concurrency-foundations', level: 1, difficulty: 'easy',
    q: 'Four threads on a CPU-bound loop gave zero speedup; the same four threads on downloads gave ~4x. Reconcile.',
    answer: [
      '**Answer.** The GIL lets one thread run Python bytecode at a time — CPU-bound threads serialize. It RELEASES during blocking I/O, so downloads overlap.',
      '**Mechanism.** Waiting on sockets happens outside bytecode execution; the interpreter hands the lock to another thread meanwhile.',
      '**Answer.** CPU parallelism needs multiprocessing (real cores, separate interpreters) — paying process startup and serialization.',
    ] },
  { id: 'plq-event-loop-block-01', room: 'concurrency-foundations', level: 2, difficulty: 'medium',
    q: 'One endpoint in your async service made EVERY request slow. The offending line was requests.get. Explain the blast radius.',
    answer: [
      '**Answer.** The event loop is single-threaded cooperative scheduling — a synchronous blocking call stops the WHOLE loop, so every task stalls behind it.',
      '**Mechanism.** Tasks only yield at await points; requests.get never yields, so no other coroutine can run until it returns.',
      '**Answer.** Use an async client (httpx/aiohttp) or push the sync call off-loop: await asyncio.to_thread(requests.get, url).',
    ] },
  { id: 'plq-race-lost-update-01', room: 'concurrency-foundations', level: 1, difficulty: 'medium',
    q: 'Two threads increment a shared counter 1M times each; the result is far below 2M. Name the exact interleaving.',
    answer: [
      '**Answer.** counter += 1 is read-modify-write: both threads read the same value, both add 1, both write — one increment vanishes.',
      '**Mechanism.** The three steps are not atomic; a context switch between read and write lets updates overlap.',
      '**Answer.** Fix: a Lock around the increment — or avoid shared mutation (per-thread counters summed at the end).',
    ] },
  { id: 'plq-deadlock-order-01', room: 'concurrency-foundations', level: 2, difficulty: 'medium',
    q: 'Service froze: thread A holds lock1 waiting for lock2; thread B holds lock2 waiting for lock1. State the general prevention rule.',
    answer: [
      '**Answer.** Impose a GLOBAL lock ordering — all code acquires locks in the same agreed order, making the circular wait impossible.',
      '**Mechanism.** Deadlock needs a cycle in the waits-for graph; a total order on acquisition makes cycles unconstructible.',
      '**Boundary.** Alternatives when ordering is impractical: single coarser lock, try-with-timeout and back off, or redesign to message passing.',
    ] },

  // ── shipping-python ──
  { id: 'plq-bare-except-01', room: 'shipping-python', level: 2, difficulty: 'medium',
    q: 'A pipeline "never fails" but its numbers drifted wrong for weeks. Reviewing, you find `except: return default`. Prosecute this line.',
    answer: [
      '**Answer.** It converts every failure — including bugs and bad data — into a plausible value, moving corruption silently downstream where it cannot be traced.',
      '**Mechanism.** Fail-loud stops damage at the fault with a stack trace; fail-silent trades a visible incident for weeks of wrong outputs.',
      '**Answer.** Catch the SPECIFIC exceptions you can genuinely handle, log with context, re-raise the rest; reserve defaults for cases the business explicitly defines.',
    ] },
  { id: 'plq-pydantic-boundary-01', room: 'shipping-python', level: 1, difficulty: 'medium',
    q: 'Why validate at the service boundary instead of defensive checks scattered through the code?',
    answer: [
      '**Answer.** One choke point converts untrusted input into typed, guaranteed objects — everything downstream drops its paranoia.',
      '**Mechanism.** Parse-don\'t-validate: after the boundary model, invalid states are unrepresentable; scattered checks re-verify inconsistently and drift.',
      '**Boundary.** Watch lax coercion ("42" -> 42): where type distinctions matter, use strict mode/types.',
    ] },
  { id: 'plq-pickle-json-01', room: 'shipping-python', level: 1, difficulty: 'easy',
    q: 'Cache to disk: pickle or json? Name the two axes that decide.',
    answer: [
      '**Answer.** Trust and fidelity. json: safe, portable, human-readable, loses Python types. pickle: full object graphs, but executes arbitrary code on load and breaks across versions.',
      '**Answer.** Internal, same-version, trusted cache: pickle is fine. Anything crossing a trust or system boundary: json (or a schema format).',
      '**Boundary.** Never unpickle data you did not produce — it is code execution, not parsing.',
    ] },
  { id: 'plq-seed-01', room: 'shipping-python', level: 1, difficulty: 'easy',
    q: 'You set random.seed(42) but the experiment still is not reproducible. List what else must be seeded and why.',
    answer: [
      '**Answer.** Each RNG is independent: np.random (or the Generator you use) and the framework\'s (torch.manual_seed + CUDA seeds) need their own seeds.',
      '**Mechanism.** Libraries embed separate PRNG states; seeding stdlib random touches none of them.',
      '**Boundary.** Full determinism on GPU also needs deterministic-kernel flags — some ops are nondeterministic by default for speed.',
    ] },

  // ── the-metal / os-floor ──
  { id: 'plq-cache-traversal-01', room: 'the-metal', level: 1, difficulty: 'medium',
    q: 'Summing a matrix row-by-row vs column-by-column differs 10x with identical FLOPs. Mechanism?',
    answer: [
      '**Answer.** Memory moves in 64-byte cache lines; row-major traversal uses every element of each fetched line, column traversal wastes the line per element.',
      '**Mechanism.** Sequential access also triggers hardware prefetch; strided access defeats it, so each element pays a memory-latency round trip.',
      '**Boundary.** The same story is why numpy cares about C vs F order and why blocked/tiled loops exist.',
    ] },
  { id: 'plq-float-eq-01', room: 'the-metal', level: 0, difficulty: 'easy',
    q: 'Why is 0.1 + 0.2 == 0.3 False, and what is the professional comparison?',
    answer: [
      '**Answer.** Binary floats cannot represent 0.1 or 0.2 exactly; their rounding errors accumulate past 0.3\'s own representation.',
      '**Answer.** Compare with tolerance: math.isclose(a, b) / np.allclose — never == on computed floats. Money: decimal or integer minor units.',
    ] },
  { id: 'plq-oom-137-01', room: 'the-os-floor', level: 1, difficulty: 'medium',
    q: 'The overnight training job died with exit code 137 and no traceback. Reconstruct what happened.',
    answer: [
      '**Answer.** 137 = 128 + 9: the process was SIGKILLed — almost always the kernel OOM killer (or an orchestrator memory limit).',
      '**Mechanism.** RAM exhausted, swap thrashed, kernel picked the largest recent offender by oom_score and killed it uncatchably — hence no traceback.',
      '**Answer.** Confirm via dmesg/journal ("Out of memory: Killed process"); fix by profiling peak memory, streaming/batching data, or raising the limit.',
    ] },
  { id: 'plq-sigterm-01', room: 'the-os-floor', level: 1, difficulty: 'medium',
    q: 'Your service loses in-flight work on deploys. The platform sends SIGTERM, waits 30s, then SIGKILL. What should the process do?',
    answer: [
      '**Answer.** Handle SIGTERM: stop accepting new work, finish or checkpoint in-flight tasks, flush buffers/connections, exit 0 — well inside the grace window.',
      '**Mechanism.** SIGTERM is catchable precisely for cleanup; SIGKILL is not deliverable to a handler, so anything unfinished at that point is lost.',
      '**Boundary.** Cleanup must be fast and idempotent — a slow handler just converts graceful shutdown into the SIGKILL you tried to avoid.',
    ] },

  // ── cpp-second-language ──
  { id: 'plq-cpp-dangling-01', room: 'cpp-second-language', level: 1, difficulty: 'medium',
    q: 'Reading: a C++ function returns `int&` to a local variable. The compiler warned; it "works" in a test. What is true?',
    answer: [
      '**Answer.** Undefined behavior — the local dies with the stack frame; the reference points into a dead frame that any later call overwrites.',
      '**Mechanism.** "Works" means the memory has not been reused YET; UB permits any outcome, including passing tests and failing at -O2.',
      '**Answer.** Return by value (cheap — moved/elided), or take an output reference parameter, or heap-allocate with an owner.',
    ] },
  { id: 'plq-cpp-raii-01', room: 'cpp-second-language', level: 1, difficulty: 'medium',
    q: 'Why does C++ code reviewers approve rarely contain delete, and what runs instead?',
    answer: [
      '**Answer.** RAII: resources are owned by objects (unique_ptr, vector, lock_guard); destructors free them deterministically at scope exit — including when an exception unwinds.',
      '**Mechanism.** Ownership is encoded in the type: unique_ptr deletes in its destructor; the compiler inserts the call on every exit path — no path can forget.',
      '**Boundary.** Python\'s with-block is the same idea opt-in; in C++ it is the default lifetime model.',
    ] },
  { id: 'plq-cpp-move-01', room: 'cpp-second-language', level: 2, difficulty: 'hard',
    q: 'Reading a signature set: f(std::vector<int> v), g(const std::vector<int>& v), h(std::vector<int>&& v). What does each promise about copies and the caller\'s object?',
    answer: [
      '**Answer.** f takes an independent COPY (caller unaffected; cost O(n) unless the caller moves into it). g borrows read-only — no copy, caller\'s object untouched. h will PILLAGE — the caller\'s vector is left valid-but-empty.',
      '**Mechanism.** Move steals the heap pointer/size/capacity (three words) instead of copying n elements; std::move is just the cast that permits it.',
      '**Boundary.** After moving from an object, only assign or destroy it — reading it is a logic bug even though it is not UB for std types.',
    ] },
  { id: 'plq-cpp-vector-growth-01', room: 'cpp-second-language', level: 1, difficulty: 'medium',
    q: 'push_back invalidated a pointer you held into a std::vector. Why is that legal, and when exactly?',
    answer: [
      '**Answer.** When size hits capacity, the vector allocates a bigger buffer and moves every element — all pointers/iterators/references into the old buffer dangle.',
      '**Mechanism.** Contiguity is the contract (that is what makes it cache-fast); growth therefore must relocate.',
      '**Answer.** reserve() up front to pin capacity, use indices instead of pointers, or a deque/stable container when stability matters.',
    ] },

  // ── the-wire / storage-engines ──
  { id: 'plq-n-plus-1-01', room: 'storage-engines', level: 2, difficulty: 'medium',
    q: 'The orders page is fast in dev and 4s in prod. The query log shows 1 + 200 queries. Diagnose, fix, and name the general lesson.',
    answer: [
      '**Answer.** N+1: the ORM fetched the list, then lazily one query per row. Dev had 10 rows; prod has 200 — latency scales with result size times RTT.',
      '**Answer.** Fix: eager-load the relation (JOIN / select_related / joinedload) — one round trip.',
      '**Mechanism.** The general lesson is The Wire\'s: round trips dominate — 200 x 5ms of RTT is 1s of pure waiting no index can fix.',
    ] },
  { id: 'plq-retry-storm-01', room: 'the-wire', level: 2, difficulty: 'hard',
    q: 'A downstream slowdown became a full outage: every client timed out and retried, tripling load. Design the retry policy that survives this.',
    answer: [
      '**Answer.** Exponential backoff WITH JITTER, a retry budget (cap total attempts per window), and a circuit breaker that fails fast when the error rate spikes.',
      '**Mechanism.** Synchronized naive retries multiply load exactly when capacity is lowest (metastable failure); jitter desynchronizes, budgets bound amplification, breakers shed load to let recovery start.',
      '**Boundary.** Retry only idempotent operations — and propagate deadlines end-to-end so inner services stop working on requests the edge already abandoned.',
    ] },
  { id: 'plq-index-trade-01', room: 'storage-engines', level: 1, difficulty: 'easy',
    q: 'Adding an index made reads fast — what did it cost, and how do you decide what to index?',
    answer: [
      '**Answer.** Every write now also maintains the B-tree (insert/update/delete pay extra I/O), plus storage. Reads flip O(n) scan -> O(log n) walk.',
      '**Answer.** Index what your queries filter, join, and order by; composite indexes in that column order. Skip low-selectivity columns and write-hot tables\' incidental fields.',
      '**Boundary.** EXPLAIN is the arbiter — an index the planner never picks is pure write tax.',
    ] },
  { id: 'plq-offset-keyset-01', room: 'storage-engines', level: 1, difficulty: 'medium',
    q: 'Page 1 of the feed is instant; page 5,000 times out. Same query, only OFFSET changed. Why, and the fix?',
    answer: [
      '**Answer.** OFFSET n scans and DISCARDS n rows every request — cost grows linearly with page depth, and concurrent inserts make pages drift.',
      '**Answer.** Keyset pagination: WHERE (created_at, id) < (last_seen...) ORDER BY ... LIMIT k — the index seeks straight to the boundary, O(log n) regardless of depth.',
      '**Boundary.** Keyset cannot jump to an arbitrary page number — fine for infinite scroll, not for numbered page grids.',
    ] },
];

export const QNA_ROOMS = [...new Set(PL_QNA.map(q => q.room))];
export const QNA_TALLY = { questions: PL_QNA.length, rooms: QNA_ROOMS.length };

# PL FOUNDATIONS SPEC — the KNOW-frame room architecture

_Created 2026-06-24. The authority for PL's **KNOW frame** — what PAL's Stats/Metrics/RCA/A-B Foundation rooms are to analytics, this is to programming. Governs the room set, the per-room scope, the manipulable-model bar, the build substrate, and the scope amendment that admits the two branches. Machine-readable skeleton: `src/data/foundationsRooms.js`. Standing decision: **D-PL-21**. Triggered by `docs/FOUNDATIONS-HANDOFF.md` (the PAL mentor note) + a live read of PAL's own Foundation rooms._

> **Read this with `FOUNDATIONS-HANDOFF.md`.** The handoff is the *why* (teach by manipulation, not exposition; programming is the best possible fit for an interactive foundations lab). This is the *what* and the *how* for PL specifically.

---

## 0. The correction this spec encodes

PL shipped a KNOW frame months ago (20 modules, `knowModules.js`) and it was treated as "done." It is not — it is **predict-run-read**: a fixed snippet plus an MCQ. Measured against PAL's actual standard (every module is a *live model the learner drives* — drag a slider, watch the sampling distribution go normal), PL's KNOW is a placeholder with the lights on. PAL's KNOW is ~10x PL's whole codebase (236 files / 128k lines; 32 bespoke Stats simulators; ~3k-line Metrics/RCA/Exp runners full of inline driven widgets; 23 files with live sliders). PL has **zero** sliders today.

So this spec is not "add a few widgets." It re-scopes KNOW from a 20-card stub into the **entire Python surface, beginner -> advanced, that branches** — with libraries (numpy/pandas, then PyTorch/TF) as first-class destinations, not footnotes.

---

## 1. The shape — a trunk, then branches

PAL has four *peer* rooms because analytics is one domain. Programming is a **spine with specializations** — every canonical curriculum (roadmap.sh, OSSU) runs core -> then electives. So PL's KNOW is:

- **The Trunk** — 5 sequential rooms, the SWE-for-data floor every learner climbs.
- **The Branches** — specializations that diverge once the trunk is in place.

```
TRUNK  1 Python Foundations
       2 The Machine (how Python runs + what it costs)   <- PL's signature room
       3 Data Structures & Algorithms
       4 NumPy & pandas
       5 Shipping Python (notebook -> production)
BRANCHES  6 Competitive Programming        (amends the easy->med ceiling)
          7 Tensors & Autograd (PyTorch/TF) (mechanics only; ML lab owns modeling)
```

7 rooms · 24 clusters · 73 seed modules in the skeleton (`FOUNDATION_TALLY`). The seed is representative, not exhaustive — the rooms grow as authored.

> **SUPERSEDED 2026-07-16 (D-PL-22 §9, then D-PL-23 §10 below):** the map is now **11 rooms · 36 clusters · 121 seed modules** — Concurrency & Parallelism joins the trunk at 5, The Metal at 8, The OS Floor at 10, C++: The Second Language at 11. §§2-3 below describe the original 7; §§9-10 are the deltas and the current authority for the full set.

---

## 2. The trunk

### Room 1 — Python Foundations  `python-foundations`
**Scope.** The language and the mental models underneath it: values & names (binding/aliasing/mutability), control & functions (scope, closures, args, generators), the data model (dunders, truthiness, the iteration protocol, `is` vs `==`), objects & classes (instances, MRO, dataclasses), decorators & context managers.
**Why.** The model that has to be installed before any gotcha stops being surprising. **Absorbs and replaces** the current 20-card `knowModules.js` stub.
**Manipulable hook.** Python-Tutor-style runtime state: two names, one list, mutate one and watch the other move — live in Pyodide.
**Grounded in.** roadmap.sh/python (basics + advanced) · Python Tutor.

### Room 2 — The Machine  `the-machine`
**Scope.** How CPython runs your code and what it costs: the call stack & recursion, the memory model (refcounts/GC/interning), hashing -> dict/set O(1), Big-O *felt*, loop-vs-vectorized, the canonical-vs-brute race.
**Why.** **PL's signature room — the one no other lab can build.** Pyodide instruments real `perf_counter` + `tracemalloc`, so the cost is *measured*, not asserted. This is the glass-box thesis turned into a teaching surface.
**Manipulable hook.** A slider for `n`; watch O(1)/O(n)/O(n log n)/O(n^2) diverge on real timing.
**Grounded in.** OSSU core (Big-O) · High Performance Python (measure before you optimize) · the existing glass-box layer + `raceMethods()`.

### Room 3 — Data Structures & Algorithms  `dsa-foundations`
**Scope.** Structures (arrays, hashmaps, sets, stacks, queues, heaps, linked lists, trees) -> patterns (two-pointer, sliding window, prefix sum, binary search, BFS/DFS, top-K, intervals). By pattern, **capped at medium** per PL's charter.
**Why.** The DSA floor every coding screen assumes; KNOW companion to the DSA DO bank.
**Manipulable hook.** VisuAlgo-style animated structures + the cost race.
**Grounded in.** roadmap.sh DSA · USACO Bronze/Silver · NeetCode patterns · VisuAlgo.

### Room 4 — NumPy & pandas  `array-dataframe-foundations`
**Scope.** NumPy (the ndarray, dtypes, broadcasting, views-vs-copies, axis, vectorization) -> pandas (the labeled DataFrame, index alignment, copy-vs-view/SettingWithCopy, split-apply-combine, reshape).
**Why.** The libraries PL's audience lives in; the broadcasting + copy-view models that silently wreck beginner code. KNOW companion to the PyLab DO bank.
**Manipulable hook.** Drag two array shapes together; watch the size-1 axes stretch (ghosted, never allocated) or the mismatch error — the exact "stretch-not-copy" model the NumPy docs teach with.
**Grounded in.** NumPy broadcasting docs · Modern Pandas · the SettingWithCopy canon.

### Room 5 — Shipping Python  `shipping-python`
**Scope.** Typing & validation (hints, dataclasses, pydantic, Enums), testing & guardrails (asserts, pytest model, fail-loud), robustness (exceptions, serialization, caching), concurrency & reproducibility (async/event loop, seed-everything).
**Why.** The capstone of the trunk and — per `CURRICULUM-RESEARCH.md` — PL's biggest untapped expansion: the line between a notebook analyst and someone who ships.
**Manipulable hook.** Feed a bad payload to a pydantic model; watch it coerce, validate, and fail loud (and the silent-coercion trap).
**Grounded in.** `CURRICULUM-RESEARCH.md` §B/§D (the SWE->AIE bridge) · Made With ML · Effective Python.

---

## 3. The branches (the charter amendment — see §6)

### Room 6 — Competitive Programming  `competitive-programming`
**Scope.** Picks up where Room 3's floor ends and climbs the USACO Gold/Platinum ladder: complexity under constraints, DP (memoization -> tabulation), graphs beyond BFS (shortest paths, union-find, MST, topo sort), segment/Fenwick trees.
**Charter note.** **Above PL's easy->medium ceiling by design** (amends D-PL-07). A branch, not the floor.
**Manipulable hook.** Set `n` + the time budget; watch which complexity class fits and which TLEs. The canonical-vs-brute race is the spine.
**Grounded in.** USACO Guide (Silver->Platinum) · Competitive Programmer's Handbook · CP-Algorithms.

### Room 7 — Tensors & Autograd  `tensors-autograd`
**Scope.** **Library mechanics only**: the tensor & its rank, tensor broadcasting (extends Room 4), `requires_grad` + the dynamic define-by-run graph, what `.backward()` records (forward-record / backward-chain-rule), the shape-mismatch error.
**Charter note.** Mechanics, **not modeling**. Architectures, training loops, and evaluation stay in `ml-systems-lab`. The seam is the same KNOW->DO seam BreakLabs already uses (D-PL-21).
**Manipulable hook.** Flip `requires_grad`, run a forward op, watch the DAG record itself node by node; call `.backward()` and trace the chain rule to the `.grad` on each leaf.
**Grounded in.** PyTorch autograd tutorial (the DAG, define-by-run) · tensor broadcasting docs.

---

## 4. What makes 7 rooms feel like one product — the through-lines

Three ideas thread the rooms so the lab reads as a climb, not a pile:

1. **Binding / aliasing.** Room 1 (names are bindings) -> Room 4 (copy-vs-view / SettingWithCopy) -> Room 7 ("why did editing my tensor change the original?"). The same idea, three altitudes.
2. **Broadcasting.** Room 4 (numpy stretch-not-copy) -> Room 7 (tensor broadcasting). One model, reused.
3. **Cost / the race.** Room 2 (Big-O felt) -> Room 3 (pattern vs brute) -> Room 6 (beat the time limit). PL's glass-box is the connective tissue.

Pull any thread and you climb the lab. This is the product argument for the room *order*.

---

## 5. Build architecture (how a room is built, cheaply)

**Do not rebuild PAL's scaffold.** PL already has a working `KnowRunner` (`KnowBrowser.jsx`) with the right anatomy (work-moment hook -> leveled predict MCQ -> Pyodide demo -> reveal -> SeniorRead). The upgrade is one structural addition, not a rewrite:

- **Add an optional `interactive` widget slot** to `KnowRunner`, between the demo and the reveal. A module that carries a driven model renders it there; a module that doesn't degrades to today's predict-run-read. Back-compatible, exactly how `normalizePredict` already bridges legacy modules (D-PL-17).
- **Four widget substrates** (the `widget` field in the registry), chosen by what the concept needs and ranked by authoring cost:
  - **`live`** — real code in Pyodide; the learner edits and sees actual output + cost. *Prefer this.* **It is PL's edge over PAL** — PAL hand-builds every model in SVG because it has no runtime; PL can make the model *executable*. Most of Rooms 1, 2 (cost), 4, 5 are `live`.
  - **`sim`** — bespoke SVG that re-renders as the learner drags (broadcasting, Big-O, groupby, the two-pointer). Where the *picture* is the lesson and code can't draw it.
  - **`stepper`** — a step-through state machine (call-stack frames, hash buckets, graph traversal, the autograd DAG). Where the *dynamics* are the lesson.
  - **`concept`** — explainer-only, for the genuinely-not-in-browser topics (packaging/repro, static typing's compile-time half). Rare; never faked as interactive.
- **Registry-driven, like `banks.js`.** `foundationsRooms.js` is the single source of truth (room -> cluster -> module skeleton). A `FoundationsBrowser` reads it (config-driven grid, one component, N rooms) and routes into the upgraded `KnowRunner`. Register a room, it appears.

**The honest cost.** This is a PAL-scale build (PAL = 128k lines for four rooms; this is seven). Rooms 1-4 lean on the Pyodide `live` edge to move faster than PAL could. Rooms 6 and 7 need genuine bespoke `sim`/`stepper` viz (graph algorithms, the computation graph) and are the most expensive. Eyes open: this is months, sequenced — not a sprint.

---

## 6. Scope amendment — what the branches change (D-PL-21)

Branches 6 and 7 **break PL's written charter**, and that is recorded, not smuggled:

- **D-PL-07 (easy->medium ceiling; no contest grind)** — Room 6 is consciously above it. The ceiling **still governs the trunk** (Room 3 DSA stays easy->med); Room 6 is the opt-in branch where the grind is the point.
- **The "ML model-training internals = MSL's lane" line** (IDEAS, curriculum research) — Room 7 takes the **library mechanics** (tensors/autograd/broadcasting/shapes), MSL keeps **modeling** (architectures/training/eval). Clean KNOW->DO seam; the two labs do not collide.

This is a deliberate re-scope of what PL *is*: from "fluency floor" to "fluency floor + two depth verticals." Approved this session (Sidharth, 2026-06-24). If it ever conflicts with the distribution gate (D-PL-06) or starves the trunk, the branches pause — the trunk is the product, the branches are the upside.

---

## 7. Build order

The trunk is fully in-charter and in-Pyodide; build it first. Branches are the amendment; sequence them after the trunk has proof.

| Phase | Build | Why this order |
|---|---|---|
| **F0** | `interactive` slot in `KnowRunner` + `FoundationsBrowser` reading the registry + **one `live` module end-to-end** (Room 1 aliasing) as the architecture proof | Prove the slot before authoring at volume; one driven module beats a paper plan |
| **F1** | **Room 1 — Python Foundations** (absorb + retire the 20-card stub) | The on-ramp; replaces the placeholder; highest learner leverage |
| **F2** | **Room 2 — The Machine** | PL's signature; the glass-box already exists, so the `live`/race widgets are cheapest here |
| **F3** | **Room 4 — NumPy & pandas** | Pairs with the PyLab DO bank already shipped; broadcasting `sim` is the standout |
| **F4** | **Room 3 — DSA** | Broad but pattern-templatable; VisuAlgo-style steppers |
| **F5** | **Room 5 — Shipping Python** | The notebook->prod capstone; mostly `live` |
| **F6** | **Branch 6 — Competitive Programming** | First branch; the bespoke graph/DP viz begins |
| **F7** | **Branch 7 — Tensors & Autograd** | Last; needs the autograd-graph `sim`; confirm the MSL seam holds in practice |

Each phase is its own build session with its own spine close (PROTOCOL). Gates: the KNOW content clears `CONTENT-STANDARD.md`; every `live` demo is CPython-verified before transcribing (house rule).

---

## 8. Open questions (flagged, not assumed)

- **Nav placement.** Trunk + branches under one KNOW accordion section, or a visible trunk/branch split in the sidebar? (Registry already carries `track`.) Decide at F0.
- **Progress model.** Sequential lock (PAL's "Continue: 1. ..." resume) vs PL's current free cluster browse? The on-ramp argues for sequence in the trunk, free in the branches.
- **Skin.** Rooms render under the active skin (Platinum/green-screen, D-PL-19); the `sim`/`stepper` widgets need a skin-token pass so the SVG models theme correctly. Budget it in F0.

---

## Close / handoff

This spec + `src/data/foundationsRooms.js` are the **skeleton** — architecture and seed modules, status `planned`, nothing wired into the app yet (the registry is unimported; no build impact). The build consumes it room-by-room per §7. Authority for any KNOW-frame change. Decision: **D-PL-21**. Mirrors: handoff <-> `FOUNDATIONS-HANDOFF.md`; scope <-> D-07 / D-15; runner <-> D-PL-17.

---

## 9. Amendment D-PL-22 — the substrate expansion (2 new rooms, 9 total)

2026-07-16 19:42 IST (Thursday)

**What changed.** The 7-room map above is amended to **9 rooms · 30 clusters · 97 seed modules** (`FOUNDATION_TALLY`, re-verified programmatically). Two additions, one restructure:

```
TRUNK  1 Python Foundations
       2 The Machine
       3 Data Structures & Algorithms
       4 NumPy & pandas
       5 Concurrency & Parallelism        <- NEW (D-PL-22)
       6 Shipping Python                   (was 5; still the trunk capstone)
BRANCHES  7 Competitive Programming        (was 6)
          8 The Metal                      <- NEW (D-PL-22)
          9 Tensors & Autograd             (was 7)
```

**Room 5 — Concurrency & Parallelism** `concurrency-foundations` (trunk). Promoted from a single buried module (the old `sp-async`, now `cc-event-loop`) to a 3-cluster room: The GIL & Threads (GIL race, I/O-vs-CPU, processes, Amdahl felt) · The Event Loop (async/await timeline, await order, the blocking call that freezes the loop, timeouts & cancellation) · Races & Coordination (the race condition, locks & deadlock, semaphores, backpressure). **Why trunk, not branch:** every LLM app is async, every data pipeline hits the GIL, every mid-level screen asks the difference — this is floor, not specialization. Pyodide runs real threads-vs-GIL races and real asyncio, so most of it is `live`.

**Room 8 — The Metal** `the-metal` (branch). The Machine's depth sequel — room 2 shows what Python *costs*, room 8 shows *why the hardware charges it*: Memory Layout (cache lines via row-vs-column traversal race, strides & contiguity, the boxed-object tax) · Numbers (IEEE-754 bits, fp64→fp16 precision cliff, dtype wrap-around) · The Accelerator (the GPU mental model, the host↔device transfer tax, batching & the throughput/latency trade). Cache and float modules run `live` in Pyodide; the GPU cluster is honest `sim` — modeled, never faked as executable. **This is the systems-depth vertical** — the room that serves the ML-infra/inference/perf-engineering direction — kept as a branch because it is depth beyond the SWE-for-data floor.

**Shipping Python restructure.** Its `concurrency-and-repro` cluster is dissolved: `sp-async` moved to room 5; the cluster is replaced by **Notebook -> Service** (cells→functions→modules, config out of the code, logging, the request/response boundary, seed-everything) — making room 6 the true notebook→production capstone and the KNOW companion to the `plan-n2s-*` DO stubs.

**The KNOW/DO reconciliation (this closes an open gap).** `pyLabPlanned.js`'s wave-1 stub categories map onto rooms, by design, not by accident: `plan-async-*` ↔ room 5 · `plan-n2s-*` ↔ room 6's Notebook→Service cluster · `plan-sys-*` ↔ room 8 (cache/floats) + room 2 (Big-O bench, generator memory — already covered there). Same topic on both surfaces is the standing KNOW→DO seam (KNOW installs the model, DO drills it), now stated in both files' headers. There is ONE Foundations map — this one; `pyLabPlanned` stubs are its DO shadows.

**Build order impact.** §7's table gains two phases: **F5b — Room 5 Concurrency** (after F5 Shipping Python; mostly `live`, cheap on the existing glass-box) and **F6b — Room 8 The Metal** (after F6 CP; the two `live` clusters first, the GPU `sim` cluster last). Trunk-first rule unchanged.

**Charter note.** Room 8 extends the D-PL-21 amendment pattern (recorded, not smuggled): below-Python substrate is above the old charter's Python-fluency line. Room 5 needs no amendment — concurrency is in-charter floor. If the branches starve the trunk, the branches pause; unchanged.

---

## 10. Amendment D-PL-23 — the interview-loop audit (2 more rooms, 11 total)

2026-07-16 (Thursday), same session as D-PL-22. Triggered by an explicit audit question: **"from an interview perspective, is the map properly scoped?"** — checked against the systems-depth program's actual quarter arc (Q1 C++ + memory · Q2 hardware/GPU/quantization · Q3 OS + concurrency · Q4 OSS/DSA ramp) and the target loop (ML infra / inference / performance roles).

**The audit found four real gaps and three thin spots. All closed as skeletons:**

```
TRUNK 1-6 unchanged.
BRANCHES  7 Competitive Programming
          8 The Metal                 (extended: +4 modules)
          9 Tensors & Autograd
         10 The OS Floor              <- NEW (D-PL-23)
         11 C++: The Second Language  <- NEW (D-PL-23)
```

New tally: **11 rooms · 36 clusters · 121 seed modules** (re-verified programmatically; supersedes §9's 97).

**Room 10 — The OS Floor** `the-os-floor` (branch). The Q3-quarter gap: virtual memory, scheduling, and I/O had ZERO presence while every senior systems screen assumes them. Three clusters mirroring OSTEP's pillars: Processes & Scheduling (context switch, scheduler policies, the syscall boundary) · Virtual Memory (page tables, the page-fault disk cliff, what OOM actually means) · I/O & The Wire (buffered I/O measured live, blocking sockets, epoll — the mechanism under room 5's event loop). Kernel-side mechanics are honest steppers; what Pyodide can measure (buffering) runs live.

**Room 11 — C++: The Second Language** `cpp-second-language` (branch). The bilingual gap: the fast layer under numpy/PyTorch is C++, systems-depth loops test *reading* it, and PL had zero presence. **Reading-first by design** — no C++ runtime in the browser, so every module is predict-then-reveal over real snippets, never a fake executor. Memory & Ownership (stack/heap, pointers vs references, RAII, move) · Value Semantics (copies-by-default as the anti-Python; what std::vector and std::unordered_map actually are — the two containers every entrance screen asks you to build) · Reading C++ (signatures, compiler/ASan output, an annotated real kernel). Taught by contrast with the Python model rooms 1-2 install.

**The Metal extended** (Q2-quarter alignment): `mt-blocking` (cache tiling, measured), `mt-quantize` (int8 quantization — the inference-engineering trade), `mt-simd` (the mechanism under vectorization), `mt-roofline` (bandwidth-vs-compute — the one chart every perf conversation lands on). **Concurrency extended** (Q3): `cc-memory-model` (why a data race is UB, not just nondeterminism).

**DO-side stubs added** (pyLabPlanned, 9 stubs, 2 new categories): APIs & services (`plan-api-*`: status-code contracts, idempotency, pagination, schema versioning — the memo's pillar 6, previously promised and absent) and Tooling judgment (`plan-tool-*`: bisect, rebase disaster, dependency pinning, Docker model, read-the-profile — pillar 9, judgment-drill format).

**Deliberately NOT added, with reasons:** distributed-systems design (MSL owns ML system design; GSL owns serving-in-context — the ownership seam holds); writing-C++-graded-in-browser (impossible in Pyodide, and faking it violates the honest-widget rule); OS deep internals like filesystems/drivers (below the interview floor for these roles); anything Year-2-speculative (the program itself refuses to plan that far — the lab shadows the program, not the fog).

**Seam rule for room 11:** PL teaches C++ *reading and models*; actual compiled C++ grading stays outside PL (the private entrance-exam ledger and, later, capstone repos — different surface, different owner).

---

## 11. Amendment D-PL-24 — the IITK-checklist audit (2 more rooms, 13 total; the LAST map amendment before authoring)

2026-07-17 (Friday). Triggered by Sidharth: cross-check the map against IIT-Kanpur's CSE core **as a checklist, not a benchmark** (PLAN.md §9/§10 of the private program explicitly reject IITK-equivalence and name automata/compilers/full-theory as breadth traps — the checklist only asks "did D-PL-23 miss anything structural?").

**It missed two things. Both are serving-path substrate, both now skeletons:**

```
BRANCHES ...unchanged 7-11...
         12 The Wire          <- NEW (D-PL-24)  · CS425's top half, filtered
         13 Storage Engines   <- NEW (D-PL-24)  · CS315's mechanics, filtered
```

New tally: **13 rooms · 43 clusters · 143 seed modules** (re-verified programmatically; supersedes §10's 121).

**Room 12 — The Wire** `the-wire` (branch). The network under every API call: The Cost of Distance (the Dean/Norvig latency ladder, RTT-dominates/N+1, bandwidth-vs-latency) · TCP & HTTP (what a connection costs, pooling, the request anatomized, head-of-line blocking) · Bytes on the Wire (json-vs-binary measured live, row-vs-column shipping, compression's CPU trade). KNOW twin of the `plan-api-*` DO stubs. Routing/link-layer (the bottom half of a networks course) deliberately excluded — no target loop asks it.

**Room 13 — Storage Engines** `storage-engines` (branch). The KNOW room under the SQL Lab DO bank — the same KNOW/DO seam PyLab got in D-PL-22: The Index (B-tree splits, LSM flush/compaction, the index trade measured LIVE on sqlite — Pyodide ships sqlite3 — and flat-vs-IVF vector search) · The Log & The Guarantee (WAL crash-replay, isolation anomalies stepped) · Reading the Plan (EXPLAIN live, row-vs-column layout). Query-WRITING drills stay in SQL Lab; this room is mechanics.

**Three Tier-2 extensions:** `dsa-bits` (DSA patterns — bit manipulation, the absent screen classic; CS:APP ch.2 shadow) · `mt-compiler` (The Metal — what -O2 does, read against godbolt; the model, not the compilers course) · `cp-recurrences` cluster (CP — Master theorem felt + amortized doubling; the one seat "discrete math" earns).

**Checked and REJECTED, on record:** automata/theory-of-computation, a compilers course, full discrete math (all: program breadth traps; no target loop asks them; the lab must not tempt the program into them) · a distributed-systems/system-design room — **checked against MSL directly this session**: MSL ships 15 system-design modules (framework, recsys funnel, two-tower, ANN, ML Platform w/ feature store+serving+registry), staged scenario walkthroughs, and two dedicated tabs — the ML-shaped design coverage the target loops actually test. The seam HOLDS. Noted honestly: MSL is thin on generic distributed substrate (sharding/replication/CAP ≈ 0 hits); if that ever needs filling it belongs in MSL as a scale-substrate cluster, not in PL. Re-examine only with market-test evidence, at a checkpoint.

**Stale-note correction (recordkeeping):** the §Close line "the registry is unimported; no build impact" is SUPERSEDED — `FoundationsBrowser.jsx` is routed (App.jsx + Sidebar), reads this registry, and 21 driven interactive models are wired via `components/foundations/interactiveModules.js`. New rooms auto-appear in the app on registration. Found same session: `interactiveModules.js` still keyed the pre-D-PL-22 id `sp-async` — orphaning the AsyncTimeline model after the rename to `cc-event-loop`; fixed with this amendment.

**SUNSET CLAUSE (binding):** this is the **last** map amendment until F-phase authoring ships at least one full room's driven content. The map is now months ahead of the product; the next PL Foundations session authors modules, it does not draw territory. Any proposal to amend the map before then gets refused with a pointer to this line.

---

## 12. Amendment D-PL-25 — the exhaustiveness audit + the two authored formats (owner-invoked)

2026-07-16 22:20 IST (Thursday). Sunset-clause note: §11 barred further map amendments; the OWNER explicitly requested an exhaustiveness audit ("think like IITK faculty, a product builder, an interviewer signing off on extreme prep"), so this is an owner-invoked exception, recorded — and the clause now HARDENS: after D-PL-25, map changes require an authored room shipped, no exceptions, owner requests included (redirect to authoring).

**Triple-lens audit verdict: rooms exhaustive, module layer had 21 real holes. All closed:**

- **Faculty lens (canon per room):** R1 `pf-bytes-str` (the encoding boundary) · R2 `mc-str-concat` (quadratic +=) · R3 `dsa-backtrack`, `dsa-greedy`, `dsa-monotonic` (NeetCode-canon patterns that were absent — backtracking alone is a third of medium screens) · R4 `pd-merge` (row-explosion joins), `pd-missing` (NaN semantics), `pd-datetime` (tz/DST) · R5 `cc-executor` · R6 `sp-env` · R7 `cp-modular` · R8 `mt-branch` (sorted-array branch-prediction classic).
- **Interviewer lens (would I sign off?):** R9 `ta-nograd`, `ta-inplace`, `ta-device` (the three tensor-mechanics bugs every ML screen probes) · R10 `os-signals` (graceful shutdown), `os-fd` (too-many-open-files) · R11 `cpp-const`, `cpp-templates`, `cpp-ub` (the reading-C++ interview canon) · R12 `wr-timeouts` (retry storm — asked in every serving loop), `wr-lb` · R13 `se-nplus1`, `se-pagination`. Verdict AFTER closure: sign-off-able as a KNOW-frame for data/MLE/senior-Python loops, given the recorded seams (ML design -> MSL, GenAI serving -> GSL, SQL drills -> SQL Lab, compiled C++ -> outside PL).
- **Product lens:** exhaustiveness is journeys, not just modules — the remaining journey gaps are PARITY surfaces, not map: diagnostic/placement, spaced review, cheatsheet, QnA bank, company tracks (wave list in CLAUDE.md). No map change needed for them.
- **Checked, still rejected:** regex (library skill -> DO drills, not a Foundations model) · trie/string-algos (above the DSA floor; CP ladder covers on demand) · DNS/streaming (Wire bottom-half / GSL seam) · comprehension micro-syntax (assumed floor).

New tally: **13 rooms · 43 clusters · 167 seed modules** (verified programmatically, 0 duplicate ids).

**The two authored-format skeletons (the D-PL-25 build plan):**

1. **Climb mode** (`src/data/lessonThreads.js`) — the learnpython.org/SQLBolt format PL already proved in PyTutorial, scaled to rooms: read (<=120 words) -> drive the model -> graded YOUR TURN (runCheck) -> next. ALL trunk threads + the room-11 reading thread are sequenced (7 threads, 101 steps, every module id machine-verified against the registry); reads/yourTurns are STUBs. Authoring sessions: A1 = Room 1 content to CONTENT-STANDARD (this also completes F1 and retires the KNOW stub), A2 = The Machine, then one room per session.
2. **CppTrace** (`src/data/cppTraces.js`) — pythontutor-for-C++ WITHOUT faking a runtime: every trace is compiled with g++ -fsanitize=address,undefined, RUN, and transcribed as recorded truth; the browser steps a recording, predict-then-step at each state. House rule extended: no trace ships without its verification line (compiler + flags + date + observed output). Pilot trace `cpp-stack-heap` is IN and verified (g++ 13.3.0, output 7, sanitizer-clean); the remaining five are stub objects with verified: null (NOT renderable until their compiler receipt exists) - A3 session fills them.

Also on the shelf from the same discussion: per-module "open in Python Tutor" deep links for rooms 1-2 (zero-build garnish, at authoring time).

---

## 13. Amendment D-PL-26 — the language-surface closure (FINAL; the map freezes here)

2026-07-16 22:55 IST (Thursday). Owner-approved final batch after a language-coverage re-audit (D-PL-25 checked interview canon; this pass checked the LANGUAGE surfaces of Python and C++ end-to-end). Ten additions, tally now **13 rooms · 43 clusters · 177 seed modules** (verified, 0 dupes); Climb threads updated in step (111 steps, ids machine-verified).

- **Python (5):** `pf-comprehensions` (loops-as-expressions + scoping) · `pf-slicing` (start/stop/step; list slices allocate) · `pf-sort-key` (sorted/key=/lambda - the functional trio) · `pf-match` (structural pattern matching) · `sp-files` (the open() contract, modes/encoding/pathlib).
- **C++ reading-first (5):** `cpp-smart-ptr` (unique_ptr/shared_ptr - RAII's modern face; the worst D-PL-25 miss) · `cpp-virtual` (vtable dispatch) · `cpp-iterators` (range-for desugared + invalidation) · `cpp-lambdas` ([&] vs [=] captures) · `cpp-linker` (compile-vs-link; undefined reference).
- **Excluded permanently, with reasons:** metaclasses, descriptor protocol in depth, contextvars, C++ exception machinery, operator-overload authoring, multiple/virtual inheritance depth - encyclopedia beyond the floor and the loop. "Exhaustive" = everything that matters for the target learner, and that claim is now made deliberately.

**THE FREEZE:** the map (rooms, clusters, seed modules) is now FROZEN. No amendment mechanism remains - not owner-invoked, not audit-invoked. Anything discovered during authoring is added AS AUTHORED CONTENT inside its room's session (a module authored beyond the seed list is welcome; a planned-and-unauthored addition is not). The next spec section, if any, documents authored rooms - not territory.

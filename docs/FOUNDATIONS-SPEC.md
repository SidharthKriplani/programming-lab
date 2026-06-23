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

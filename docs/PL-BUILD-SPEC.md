# PSL BUILD SPEC — the fluency banks (DSA · Python · pandas/numpy)

_Created 2026-06-23. An HQ build spec (D-13: spec = HQ's to set), **propose-only — nothing built, nothing pushed.** Defines what a future PSL build session constructs: the three fluency banks, the variety bar they must clear, the B-ready per-problem schema, the live Pyodide IDE, the difficulty tiers, and the build order. Scope is fixed by **D-07** (PSL = the SWE layer for data people; DSA, Python, pandas; glass-box "feel the machine"; not a fourth domain lab, not a LeetCode clone) and **D-15** (PSL is the fluency rung of the four-frame Competence Model). Mirrors PAL's `SQL-VARIETY-BENCHMARK.md` (the variety bar) and `JUDGMENT-LAYER-SPIKE.md` (the schema) so the two fluency banks — SQL and Python — share one shape._

> **Where PSL sits.** In the Competence Model (`HQ/COMPETENCE-MODEL.md`), frame 2 — FLUENCY — is "the problem banks: SQL Lab, PSL, code-breaks." PAL owns the SQL bank; **PSL owns the Python/DSA/pandas bank.** It is the rung PAL (analytics), MSL (ML), and GAL (GenAI) all *assume* their users have already cleared — the shared floor under every domain lab. Build it once here; the others lean on it instead of each re-teaching `groupby`, hash maps, or why `df2 = df` mutates `df`.

---

## 0. The one decision that needs sign-off (scope pivot)

**The repo on disk is not the lab D-07 describes.** `production-systems-lab/` today is the stale Dec-2024 "Production Systems Lab" — async APIs, databases, caching, scaling, observability (FastAPI + Docker + `modules/01..05`, a one-file `frontend/index.html`). That scaffold predates the BreakLabs reorg and the D-07 re-scope. **None of it is the SWE-for-data fluency lab.** There is no `docs/`, no Python/DSA/pandas content, no Pyodide.

So before any build, one call is yours to make:

**Recommendation (B-ready assumes this):** archive the legacy infra scaffold to `_legacy/` (don't delete — the async/DB modules are decent teaching code, possibly reusable as MSL/GAL "code-breaks" later, and the LinkedIn Python track already cites this repo). **Rebuild PSL as a React + Vite SPA matching its three siblings** (PAL/MSL/GAL are all React+Vite+localStorage), with Pyodide added for in-browser Python execution. This buys sibling-consistent architecture (shared component/animation/CSS-variable system, the lazy-load pattern, the progress-localStorage pattern) and one mental model across all four labs.

| Option | What it means | Verdict |
|---|---|---|
| **A — Rebuild as React+Vite SPA + Pyodide, archive legacy** | PSL becomes the 4th sibling SPA; old infra → `_legacy/` | **Recommended.** Sibling-consistent, Pyodide fits the SPA cleanly, reuses PAL's proven patterns. |
| B — Keep the FastAPI/Docker stack, bolt a Python-exec backend on | Server-side code execution (Judge0-style) | Rejected: a backend to run user code is a security/cost/ops liability the other labs deliberately avoid; contradicts the localStorage-ghost model; nothing else in BreakLabs runs a server. |
| C — Repurpose the existing `modules/` infra content as "PSL" | Ship what's there, call it done | Rejected: violates D-07. Infra ops is not DSA/Python/pandas fluency. |

Everything below assumes **Option A**. One open sub-question flagged for you: **keep the repo slug `production-systems-lab` or rename to something fluency-true** (e.g. `python-fluency-lab` / `code-fluency-lab`)? The name "Production Systems" actively mis-signals the new scope. Rename has a Vercel/URL cost; defer it, but don't let the stale name leak into user-facing copy. **Decision required — flagged, not assumed.**

---

## 1. What PSL is (and isn't)

- **Is:** three banks of short, runnable problems that build *coding fluency* — the ability to write correct Python/pandas quickly and to read the code an LLM hands you and know if it's right. Glass-box: every problem can show *what the machine actually did* (time, memory, why the slow way is slow).
- **Isn't:** a LeetCode clone. The differentiator is (a) the **glass-box "feel the machine"** layer — you don't just pass tests, you see the cost — and (b) the **judgment layer** mirrored from the SQL bank: given a situation, *which* correct approach is right and why. A bank that only grades pass/fail teaches nothing LeetCode doesn't.
- **Ceiling is deliberate: easy→medium.** PSL is the *fluency floor*, not a competitive-programming grind. No hard DP, no segment trees, no contest tricks. If a problem needs a whiteboard and 45 minutes, it's out of scope — that's interview-theater, not fluency.

---

## 2. The fluency categories — four banks

Four content banks. Each problem declares **one primary bank** (may tag a secondary — a pandas problem can secondary-tag a Python gotcha).

### Bank A — Python gotchas ("feel the machine")
The data-person→engineer mental model. **Already seeded** by the LinkedIn Python track (PY1–PY7 in `CONTENT_QUEUE.md`): mutable default args, `a = b` aliasing, `is` vs `==` + int cache, list-vs-generator memory, late-binding closures, `in list` O(n) vs `in set` O(1), the `or`-default that eats zeros. Extend to the full set:

| Cluster | Examples |
|---|---|
| Identity & mutation | mutable defaults · aliasing vs copy vs deepcopy · mutating a list while iterating · `+=` on tuples-in-lists |
| Truthiness & comparison | `or`-default eats `0`/`""` · `is` vs `==` · `==` chaining · `nan != nan` |
| Evaluation timing | late-binding closures · default args evaluated once · generator exhaustion (one-shot) |
| Memory & cost | list vs generator · `in list` vs `in set`/`dict` · string `+=` in a loop (O(n²)) · `list.pop(0)` vs `deque` |
| Numbers | float `0.1+0.2` · int cache · float32 precision (shared with MSL SD2) · integer division `//` vs `/` |
| Scope & names | `global`/`nonlocal` · shadowing builtins (`list`, `id`, `sum`) · comprehension scope |

### Bank B — Python idioms ("the fluent way")
Not bugs — the difference between code that works and code that reads like a practitioner wrote it. The "rewrite the clumsy version" bank.

| Cluster | Examples |
|---|---|
| Comprehensions & generators | list/dict/set comp · generator for streaming · nested comp vs `itertools.product` |
| Collections | `Counter` · `defaultdict` · `deque` · `dict.get`/`setdefault` · `zip`/`enumerate` |
| Functional | `any`/`all` · `sorted(key=)` · `min`/`max(key=)` · `map`/`filter` vs comp |
| Strings | `join` vs `+=` · f-strings · `str` methods over regex for simple cases |
| Unpacking & structure | tuple unpacking · `*args`/`**kwargs` · starred assignment · `enumerate(start=)` |
| Stdlib reach | `itertools` (groupby/accumulate/pairwise) · `functools` (reduce/lru_cache) · `pathlib` |

### Bank C — DSA by pattern (easy→medium)
Organized **by pattern, not by data structure** — the way NeetCode/Blind-75 teach, because the pattern is the transferable unit. Cap at medium.

| Pattern | What it trains | Representative (authored original, not copied) | Tier |
|---|---|---|---|
| Hashing / frequency | dict/set for O(1) lookup, counting, dedup | "first non-repeating event in a log" | Warmup→Core |
| Two pointers | sorted-array convergence, in-place, pair-sum | "merge two sorted price feeds" | Core |
| Sliding window | contiguous subarray/substring under a constraint | "longest session with no repeated page" | Core |
| Prefix sum | range queries, running totals | "day the cumulative revenue first crosses target" | Warmup→Core |
| Stack | matching/monotonic, nearest-greater | "validate nested filter expression" | Core |
| Binary search | sorted search + on-answer-space | "min capacity to clear the queue in N hours" | Core→Stretch |
| Heap / top-K | k-largest, streaming priority | "top-K pages by traffic from a stream" | Core |
| Linked list | pointer manipulation, cycle detection | "detect a loop in a referral chain" | Core |
| Trees (BFS/DFS) | traversal, depth, level-order | "depth of a category tree" | Core |
| Intervals | merge/overlap | "merge overlapping maintenance windows" | Core |
| Greedy (light) | local-optimal-is-global, intervals | "min meeting rooms" | Stretch |
| Backtracking (light) | subsets/permutations, small N | "all valid coupon combinations" | Stretch (cap) |

_Explicitly out: graph shortest-path beyond BFS, DP tables, tries, union-find, segment trees, contest math. If interviews for a **data/analytics/ML** role demanded them we'd add them — they don't._

### Bank D — pandas / numpy mastery
The highest-leverage bank for PSL's actual audience (analysts, PMs, data-adjacent). The SQL bank's twin in DataFrame land, plus the numpy mental model.

| Cluster | What it trains | Note |
|---|---|---|
| Selection & indexing | `loc`/`iloc` · boolean masks · `query` · `SettingWithCopyWarning` | the #1 source of silent pandas bugs |
| groupby / aggregate | `agg`/`transform`/`apply` · multi-key · named agg | transform-vs-agg is a judgment fork |
| Reshape | `pivot`/`pivot_table` · `melt` · `stack`/`unstack` | long↔wide, mirrors SQL pivot |
| Merge / join | `merge` keys · join types · **row-count check after join** (the STF13 fanout bug) · `concat` | shared lesson with PAL's Spot-the-Flaw |
| Window / time | `rolling` · `shift` · `resample` · `cumsum` · `expanding` | mirrors SQL window funcs |
| Missing data | `fillna`/`dropna` · `isna` · the `fillna(0)` on a string col trap (STF14) | shared with PAL |
| Vectorization | vectorized vs `apply` vs Python loop · `np.where`/`np.select` vs nested `if` | the central pandas judgment + glass-box lesson |
| numpy core | broadcasting · views vs copies · dtype/overflow · boolean indexing · `axis` semantics | the "feel the machine" of array compute |

---

## 3. The Python/DSA variety benchmark — the bar the banks must clear

_Mirror of `SQL-VARIETY-BENCHMARK.md`. The standard a coverage audit scores the banks against: does PSL cover the field, and where does it beat it? Derived from a survey of the established interview-prep canon — used as a **taxonomy reference only** (§8): NeetCode 150 + NeetCode roadmap patterns, Blind 75, LeetCode Top Interview 150, StrataScratch (pandas track), DataLemur, HackerRank (Python/DS), LeetCode "Introduction to Pandas" 15, and the Python idiom canon (Real Python / Fluent Python topics)._

> Like the SQL bar: the job isn't volume, it's **variety with depth**. 200 two-sum variants and zero sliding-window is shallow. This is the checklist.

### 3a. DSA pattern coverage (Bank C)
The 12 patterns in §2-C are the core. **Must-have (8)** — a gap here gets exposed in any data/ML coding screen: hashing/frequency · two pointers · sliding window · prefix sum · stack · binary search · heap/top-K · BFS/DFS on trees. **Differentiating (4)** — depth that separates a real bank: intervals · linked-list pointer work · greedy-on-intervals · light backtracking with the *combinatorial-explosion* lesson made visible (glass-box: watch the call count blow up). **Litmus:** HackerRank/easy-LeetCode cover the must-have; the differentiating four + the glass-box cost view are where PSL wins.

### 3b. Python gotchas + idioms coverage (Banks A, B)
The clusters in §2-A and §2-B are the bar. **Must-have:** identity/mutation, truthiness/comparison, evaluation timing, the four cost traps (generator, set-membership, string-concat, deque), comprehensions, `Counter`/`defaultdict`, `enumerate`/`zip`, `sorted(key=)`. **Differentiating:** `itertools`/`functools` reach, scope subtleties, float precision tied to a *real consequence* (the MSL float32 money bug), and every gotcha carrying a runnable "watch it happen" demo — the thing a blog post can't do.

### 3c. pandas/numpy coverage (Bank D)
The 8 clusters in §2-D are the bar. **Must-have:** selection/masking, groupby agg, merge + row-count check, reshape, missing-data, rolling/shift. **Differentiating:** transform-vs-agg, vectorization-vs-apply (with the glass-box timing that makes the 100× real), numpy broadcasting + views/copies, and the **pandas analogues of PAL's SQL "analytics narrative"** problems — multi-step real analyst pipelines (clean → group → window → metric) in one DataFrame chain. This cluster is where PSL beats StrataScratch: same problems, but you *see the cost*.

### 3d. How to audit a built bank against this
For each pattern/cluster: count problems primarily exercising it, note the tier spread, flag any category at **0** (hole) or only-Warmup (shallow). Output a coverage table (category × count × tier range × verdict: covered / thin / missing), then a "where we beat the benchmark" section (glass-box cost view; judgment dial; pandas-narrative problems), then a prioritized gap list. Likely first holes for a from-scratch bank: sliding window, heap/top-K, transform-vs-agg, vectorization, numpy broadcasting.

---

## 4. The per-problem schema (B-ready)

_Additive and back-compatible, exactly as the SQL `JUDGMENT-LAYER-SPIKE.md` schema is. A problem authored once carries everything for fluency **and** the future judgment dial — no second pass. `solution` stays the single canonical answer the runner checks; `methods[]` is the judgment surface; `glassBox` is PSL's signature addition._

```js
// a PSL problem entry (src/data/<bank>Problems.js — single quotes, escape apostrophes as \' per house rule)
{
  id: 'dsa-hash-04',
  bank: 'dsa',                          // 'gotcha' | 'idiom' | 'dsa' | 'pandas'
  pattern: 'hashing',                   // for dsa/pandas: the §2 pattern/cluster
  title: 'First non-repeating event',
  difficulty: 'core',                   // 'warmup' | 'core' | 'stretch'
  prompt: '...',
  starterCode: 'def first_unique(events):\n    pass',
  tests: [                             // hidden assert-based harness, run in Pyodide
    { in: '[\'a\',\'b\',\'a\']', out: '\'b\'' },
    // edge: empty, all-repeat, single
  ],
  solution: '...full canonical Python...',     // must pass every test in Pyodide
  canonicalMethodId: 'hash',                   // which methods[] entry `solution` is

  glassBox: {                          // PSL's signature — "feel the machine"
    show: ['time', 'peakMem'],         // instrument the run (perf_counter, tracemalloc)
    contrast: 'brute',                 // method id to race the canonical against
    lesson: 'Two passes with a dict is O(n). The nested-loop count check is O(n^2) — watch it diverge as n grows.',
  },

  methods: [                           // 1 entry for warmup; 2-3 for core+ (the judgment surface)
    {
      id: 'hash',
      name: 'Two-pass dict count',
      code: '...runnable, returns canonical output...',
      detectionSignature: { mustMatch: ['/Counter|\\{\\}|dict\\(/'], mustNotMatch: ['/for .* in .*:\\n.*for /'], note: 'single-pass hashing, no nested loop' },
      complexity: 'O(n) time, O(n) space',
      tradeoff: 'One dict, two passes; reads as intent. Extra O(n) memory.',
      breaksWhen: 'Stream too large to hold all counts in memory -> need an approximate/streaming count.',
      isTrap: false,
    },
    {
      id: 'brute',
      name: 'Nested-loop count',
      code: '...O(n^2)...',
      complexity: 'O(n^2) time, O(1) space',
      tradeoff: 'No extra memory; dies at scale.',
      breaksWhen: 'n beyond ~10k -> quadratic blowup (the glassBox contrast proves it).',
      isTrap: true,                    // runs, correct, but wrong choice at scale = a Forensic bug
    },
  ],

  dial: {                              // sparse, most-specific-wins; empty for single-method warmups
    axes: ['n', 'memoryBudget', 'streaming', 'duplicatesMatter'],
    rules: [
      { when: { n: 'small' }, ranking: ['hash','brute'], reason: 'At n<1k both are instant; pick readability. Do not over-optimize.' },
      { when: { n: 'large', memoryBudget: 'tight' }, ranking: ['brute','hash'], reason: 'If you genuinely can\'t hold n counts, the O(1)-space scan wins despite being slower — a real fork.' },
    ],
  },

  mcqs: [                              // each pinned to a dial cell, cites cost not verdict
    { id: 'mcq-scale', stem: '10M events, ample RAM. The nested-loop version times out. Why, and the fix?',
      options: ['hash','brute'], answerId: 'hash',
      explanation: 'Nested loop re-scans for each element: ~10M*10M comparisons (O(n^2)). A dict makes lookup O(1), so two linear passes ~ 2*10M. Show the cost, do not assert it.' },
  ],
}
```

**Design notes (carried from the SQL spike, adapted to Python):**

- **`methods[].code` must run in Pyodide and pass every `test`** — same discipline as the SQL "verified-equal" rule. A method that silently diverges is worse than no method. The authoring harness (§5) runs every method against the tests and diffs; budget it as a required pre-commit check, same tier as PAL's apostrophe/brace audits.
- **`detectionSignature` is regex over normalized source** (lightweight; optionally an AST walk for `for`-nesting / comprehension detection). Local to *this problem's* 2–3 methods, not a universal Python classifier. Don't build a parser.
- **`dial` is sparse** — author only the cells where the recommended approach changes (≈4–8 for a method-rich problem). **An empty dial is a signal:** a problem with one reasonable approach has no judgment layer and shouldn't fake one — it's fluency-only, which is *fine* and most Warmup problems are exactly that.
- **`glassBox` is the PSL-specific field the SQL bank doesn't have** — because in-browser Python *can* be instrumented (timing, `tracemalloc`, call counts) in a way browser SQL can't. This is the lab's signature: not "did it pass" but "feel why the slow way is slow." Every problem carries at least a `lesson`; method-rich ones carry a `contrast` race.
- **`isTrap` bridges to the Forensic/Spot-the-Flaw format** exactly as in SQL: a trap method (runs, plausible, wrong-at-scale or wrong-on-edge) *is* a code-break. Tag once, feed both the dial and a future PSL Forensic tier / a LinkedIn "Spot the Flaw" post.
- **Difficulty gates authoring depth** (see §6): Warmup = `solution` + `glassBox.lesson`, empty dial. Core = 2–3 methods + small dial + `glassBox.contrast`. Stretch = full methods + dial + MCQs. Heavy judgment authoring concentrates on the Stretch tier, not all problems.

---

## 5. The live Pyodide IDE plan

**Core choice:** **Pyodide** (CPython compiled to WebAssembly) running in a **Web Worker**. Real CPython in the browser, no backend, no server-side code execution to secure or pay for — consistent with the localStorage-only sibling model. Pyodide ships prebuilt `numpy` and `pandas` wheels, so Banks A–D all run client-side. _(Pin a known-good Pyodide version at build and re-verify the pandas wheel load time/size then — the pandas+numpy payload is several MB; treat exact figures as build-time facts, not asserted here.)_

**Component stack (Option-A SPA):**
- **Editor:** CodeMirror 6 (lighter) or Monaco (heavier, full IntelliSense). Recommend CodeMirror 6 for bundle size — fluency problems are short.
- **Runtime:** Pyodide in a dedicated worker; main thread posts code, worker returns stdout/stderr/result/timing. Worker isolation = the sandbox (no DOM, no network from user code).
- **Test harness:** hidden assert-based tests (pytest-style `assert` or a tiny runner) executed in the worker after the user's code; pass/fail per case, first-failure surfaced. `tests[]` from the schema.
- **Glass-box instrumentation (the differentiator):** wrap runs in `time.perf_counter()` + `tracemalloc` (peak memory) + optional call-count for backtracking/recursion. Render the canonical-vs-contrast race as a small bar (time) / number (peak mem). This is what "feel the machine" *is* on screen.
- **Authoring/verification harness:** the same worker, run headless in a Node+Pyodide (or `pyodide` CLI) pre-commit script — execute every `methods[].code` against `tests[]`, assert all pass and the non-trap methods agree with `solution`. Mirrors `scripts/audit_sql_lab.py`. Required check before any PSL commit (same tier as apostrophe/brace audits).

**Loading strategy (the one real perf risk):**
- Pyodide core loads on first IDE open (lazy, behind a route — not on landing). Banks A–C (pure Python) need only core.
- **Bank D lazy-loads the pandas/numpy wheels on first pandas problem**, not before. Show a one-time "warming up Python…" skeleton (reuse PAL's `.pal-shimmer-box`). Cache across the session.
- Keep a non-Pyodide fallback for the *reading*/MCQ/dial problems (which don't need execution) so the judgment layer works even before the runtime warms.

**Build progression (the IDE itself):**
1. **MVP:** editor + run + hidden tests + stdout. Pass/fail. (Banks A–C usable.)
2. **Glass-box:** timing + peak-mem + the canonical-vs-contrast race.
3. **pandas:** lazy wheel load, Bank D.
4. **Judgment:** dial + MCQ UI reading the schema's `methods`/`dial`/`mcqs`.

**Security:** user code runs only in the worker's WASM sandbox — no filesystem, no network, no DOM. The blast radius is the tab. No server means no remote-execution surface at all.

---

## 6. Difficulty tiers

Three tiers, ceiling at medium (§1). Named for fluency, not LeetCode's Easy/Med/Hard, to keep the no-grind promise explicit.

| Tier | Bar | Frame role | Schema depth required |
|---|---|---|---|
| **Warmup** | one obvious correct approach; reflex-building | fluency floor | `solution` + `glassBox.lesson`; empty `dial`; `methods` optional (1) |
| **Core** | a real choice exists (hash vs scan, vectorize vs apply); the bank's center of gravity | fluency | 2–3 `methods` + small `dial` + `glassBox.contrast` |
| **Stretch** | method-rich, tradeoffs flip with scale/shape; the bridge to judgment | fluency → judgment | full `methods` + `dial` + `mcqs` |

**Rule:** the tier *is* the authoring budget. Don't over-author Warmups (no fake dial); do fully author Stretch (that's where the moat lives). A bank is healthy when it's mostly Core, anchored by enough Warmups to build reflex and enough Stretch to teach judgment — not a wall of Stretch (that's a grind, which D-07 forbids).

---

## 7. Build order

Phased, each phase shippable. **Gated by D-01 / D-10: distribution keystone first — PSL is held until the LinkedIn daily is running** (STATUS). This is the plan for *when unblocked*, sequenced by leverage.

| Phase | Build | Why this order | Rough size |
|---|---|---|---|
| **B0** | Scope decision (§0) → scaffold the SPA + Pyodide MVP IDE (run + tests) | Nothing ships without the runtime + the architecture call | infra, no content |
| **B1** | **Bank A — Python gotchas** | **Already seeded** (PY1–PY7); fastest path to first shippable content; each problem doubles as a LinkedIn post (feeds the keystone, not competes with it) | ~20–30 |
| **B2** | **Bank D — pandas/numpy** | Highest value for PSL's real audience (analysts/PMs); twins PAL's SQL bank; vectorization glass-box is the standout demo | ~30–40 |
| **B3** | **Bank C — DSA by pattern** | The "can you code at all" floor; broad but capped at medium; most pattern-templatable | ~40–60 (across 12 patterns) |
| **B4** | **Bank B — idioms** + **judgment layer** (dial/MCQ UI) across all banks | Idioms are quick once the IDE exists; judgment layer is the moat, authored last on the Stretch tier where it pays off | idioms ~20–30; judgment on Stretch subset |

**Sequencing logic:** seeded-and-promotable first (B1), audience-value next (B2), breadth floor (B3), polish + moat last (B4). Banks A and D alone make PSL a real, differentiated lab; C and the judgment layer make it complete. Each phase is its own build session with its own spine close (PROTOCOL).

---

## 8. Sourcing & moat (licensing)

- **Author original problems only.** The interview-prep canon (NeetCode, Blind 75, LeetCode, StrataScratch, HackerRank, DataLemur) is a **taxonomy reference** — it tells us *which patterns* matter (§3). It is **never** a content source: problem statements, test cases, and solutions are written from scratch, framed in BreakLabs' own data/analytics scenarios (logs, sessions, revenue, referral chains — not "houses and robbers").
- **Two reasons, both binding:** (1) **License** — LeetCode/HackerRank problem text and test data are proprietary; copying is infringement. (2) **Moat** — copied problems are commodity; the defensible asset is the *glass-box cost view + the judgment dial + the analyst-native framing*, which no canon ships. Copying would throw away the only thing that makes PSL worth building over just sending someone to NeetCode.
- **Reuse our own work freely:** the PY1–PY7 gotchas, PAL's Spot-the-Flaw lessons (STF13 merge fanout, STF14 `fillna` type bug), MSL's float32/feature-order code-breaks — these are ours, already authored, and cross-link the labs.
- **House syntax rules apply** to PSL data files exactly as PAL's CLAUDE.md mandates: single quotes only, escape apostrophes as `\'`, no template literals in data files (Vite/Rolldown parse errors). The schema examples above follow this.

---

## Close / handoff

Per D-13, this is an HQ-authored spec handed to a future **PSL build session**, which executes against it and owns PSL's operational spine (STATUS/NEXT/LINEAGE). **Held behind the distribution keystone (D-01) — do not start B0 until the LinkedIn daily is running.** The one thing needed before build: **your sign-off on §0 (Option A + the rename question).**

Mirrors in place: variety bar ↔ `PAL/docs/SQL-VARIETY-BENCHMARK.md`; per-problem schema ↔ `PAL/docs/JUDGMENT-LAYER-SPIKE.md`; scope ↔ D-07; frame ↔ D-15.

### PROPOSED PUSH — prepared, NOT executed (approve-first, CLAUDE.md rule 4)

Docs-only (new `docs/` files + spine). No `src/` change, no build/audit needed. **Not pushed.** Review, then run on your Mac:

```bash
cd ~/Documents/Professional/BreakLabs/labs/production-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add docs/PSL-BUILD-SPEC.md docs/NEXT.md && \
git commit -m "docs: PSL build spec — fluency banks (DSA/Python/pandas), schema, Pyodide IDE, build order (propose-only)" && \
git push origin main
# HQ spine (separate repo/path):
cd ~/Documents/Professional/BreakLabs && \
git add HQ/LEDGER.md HQ/STATUS.md && \
git commit -m "HQ: PSL build spec authored; ledger + status" && \
git push origin main
```
_(Adjust the second block to however HQ/ is version-controlled — confirm before running.)_

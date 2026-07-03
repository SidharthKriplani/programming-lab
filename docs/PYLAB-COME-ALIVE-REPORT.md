# PyLab — "Make It Come Alive" Investigation Report

_Date: 2026-07-03 · Pre-build investigation, for review before execution. No code changed by this report._

The brief: make PyLab come alive amazingly well, taking the PAL SQL Lab as the quality bar, while understanding that PyLab must eventually cover **every kind of Python coding that shows up in interviews** for PA, BA, DA, DS, ML, AIE, SWE, and Python/adjacent roles. This report is the investigation and a proposed plan. It does not execute anything.

---

## 1. Where PyLab actually is today (0.42.0, live)

The engine is genuinely good; the content and the "come alive" layer are the gap.

**Genuinely strong and shipped:**
- **141 problems**, all Tier-1 audited (every solution runs, every trap verified divergent in CPython), across 8 topics.
- **Glass-box runtime** — Pyodide runs real CPython in-browser and reports `{stdout, timeMs, peakKb, error}` per run. This is the differentiator vs LeetCode.
- **Judgment layer** on ~100 problems — `methods[]` (trade-offs, breaks-when, `isTrap`), 105 verified "runs-but-wrong" traps, MCQs on ~103, a method `dial` on 13.
- **Interview-loop infra all built and wired:** Trap Museum (105 traps, copy-as-post), spaced repetition (light SM-2), Mock-loop (timed → scorecard), Follow-up chains (28 chains / 73 follow-ups), Scale-it race, Ambiguity drill, Refactor challenge.
- **Four-frame nav** (KNOW/DO/BUILD/JUDGE) with Foundations (KNOW), PyLab + Gotchas (DO), Mini-Projects (BUILD), Spot-the-Flaw + Trap Museum (JUDGE).
- **Audit gate**: `audit_py.py` (T1 block), `verify_py_methods.py` (traps must diverge), `py_content_scan.mjs` (T2 warn). 0 T1 failures.

**Thin / stub / unbuilt (the real work):**
- **Content is skewed and shallow in breadth.** 51 of 141 problems are python-core drills. pandas/numpy ~55. Whole "worlds" are **empty**: `dsa-patterns`, `python-internals`, `data-craft`, `code-craft` = **0 problems** but visible as tabs → clicking them shows a blank grid.
- **Learning paths are skeletons** — 16 path objects exist with day titles and focus text, but **every `problemIds` array is empty**. The picker and day-strip render, but nothing filters.
- **Signature formats are pilot-thin** — Ambiguity (8 problems) and Refactor (5) are the marketed differentiators but sit under 6% coverage.
- **No diagnostic / placement** — role & level tags exist in `pyLabMeta.js`, and `PyLabReadiness`/`ProgressPage` components exist, but there is no placement quiz and no data flows into the readiness meter.
- **No stretch tier** — difficulty is warmup (48) + core (93) + **stretch (0)**. Content ceiling is mid-level.
- **Follow-ups are reveal-only** (no interactive branching). Phase-4 formats — **code-review, explain-it, take-home — are 0%**.

**Bottom line:** the machine is production-grade; the library and the guided experience are early. "Coming alive" = (a) porting SQL Lab's pedagogy polish onto the existing engine, and (b) filling the interview-content universe with depth, in priority order.

---

## 2. What makes PAL's SQL Lab excellent (the bar to hit)

SQL Lab is 182 problems on 12 industry datamarts, and its strength is pedagogy, not volume. The ten decisions worth porting to PyLab:

1. **Skill-gradient ordering, not insertion order.** Within a difficulty, problems are sequenced so each adds exactly one new concept (filters → aggregates → GROUP BY → HAVING → JOINs). Learning feels progressive, not random.
2. **Rich debrief parsed into labeled blocks** — "Wrong Answer (runs, measures the wrong thing)", "Sanity Check", "Before Writing / Judgment", "Interviewer Follow-Up", "Approach". A wall of text becomes navigable and teaches multiple modes. PyLab has the pieces scattered across components; SQL Lab unifies them in one debrief grammar.
3. **Spot-check validation (`checkValues`)** — validates specific cells, not just shape, catching integer-division and wrong-join bugs. PyLab's typed `pl_compare` is the analog; the lesson is to make grading catch *plausible-but-wrong*.
4. **Difficulty-aware scaffolding fade** — Easy shows only the tables you need; Hard shows everything. Table/among-columns selection becomes a taught skill.
5. **Progressive `hintSteps` with starter code** — each hint gives a concept *and* a code skeleton to fill, not the answer.
6. **Multi-industry datamarts** — 12 shared schemas let 180+ problems exist without schema fatigue. PyLab's `pyLabFixtures` is the analog and should be curated into a small set of reusable, named datasets.
7. **Business framing over syntax framing** — "The marketing team wants to re-engage lapsed users…" not "find rows where x IS NULL." Judgment, not recall.
8. **Empirical tier audits before launch** — a 7-dimension rubric (business framing, company authenticity, difficulty calibration, data realism, distinctiveness, insight quality, trade-off clarity), ≥20/35 with no dimension <3, run per batch.
9. **Forensic problems as a differentiator** — "here is broken SQL, find and fix the bug." No competitor has this. PyLab's Gotchas + Trap Museum are the seed of the same idea and should be a first-class format.
10. **A separate beginner track** — 18 sequential lessons on a tiny dataset, isolated from the 182-problem lab, removing "where do I start?" paralysis. PyLab's tutorial ladder is the analog (5 of ~18 lessons authored).

---

## 3. The Python interview universe PyLab must cover

Synthesized from current (2025–2026) interview guides across roles. Grouped into content domains, then mapped to roles by weight.

**Content domains:**

- **A. Core Python & gotchas** — mutable defaults, aliasing/copy, late binding, `is` vs `==`, truthiness, generator exhaustion, scope/closures, comprehensions, unpacking, `*args/**kwargs`, decorators. _(All roles.)_
- **B. Idioms & stdlib** — `collections` (Counter/defaultdict/deque), `heapq`, `itertools`, `functools`, `enumerate`/`zip`, sort keys, string handling. _(All roles.)_
- **C. Data manipulation (pandas/numpy)** — groupby/agg/transform, merge/join cardinality, pivot/melt/reshape, window/rolling, missing-data policy, dtypes, vectorization vs apply, broadcasting, boolean indexing. _(DA/DS/PA/BA heavy; ML/AIE moderate.)_
- **D. DSA by pattern** — arrays/two-pointer, sliding window, hashing, stack/queue, binary search, sorting trade-offs, trees/graphs BFS/DFS, linked lists, recursion, intro DP, heaps. _(SWE heavy; ML/AIE moderate; DS light.)_
- **E. OOP & design** — classes, dunder methods, inheritance vs composition, ABCs, dataclasses, descriptors, small design problems. _(SWE, ML/AIE.)_
- **F. Internals & performance** — GIL, memory model, `__slots__`, generators-vs-lists memory, big-O reasoning, profiling intuition. _(SWE, ML.)_
- **G. ML-from-scratch numerics** — implement RMSE, cosine similarity, k-NN, logistic regression, softmax, normalization, a gradient step — pure Python/NumPy, no sklearn. _(ML, DS, AIE.)_
- **H. AI-engineering coding** — RAG pipeline, embeddings + cosine similarity semantic search, chunking strategies, LLM-as-judge eval (faithfulness/relevance), async + streaming API calls, retries/rate limits, robust JSON parsing/validation. _(AIE heavy; ML moderate.)_
- **I. Data-craft / analyst judgment** — metric ambiguity (which denominator?), dedup, funnel/retention computation, date/time handling, Simpson's paradox, mean-vs-median robustness, defining "active user." _(PA/BA/DA/DS.)_
- **J. Code-craft / SWE-for-data** — pytest, typing, reproducibility/seeds, reading a PR (code review), refactoring slow code, module structure. _(All, esp. SWE/MLE/AIE.)_

**Role → domain weighting (H=heavy, M=moderate, L=light):**

| Domain | PA | BA | DA | DS | ML | AIE | SWE | Py |
|---|----|----|----|----|----|-----|-----|----|
| A Core & gotchas | M | M | M | M | H | H | H | H |
| B Idioms/stdlib | M | M | M | M | H | H | H | H |
| C pandas/numpy | H | M | H | H | M | M | L | M |
| D DSA patterns | L | L | L | M | H | H | H | M |
| E OOP/design | L | L | L | M | H | H | H | M |
| F Internals/perf | L | L | L | M | H | M | H | M |
| G ML-from-scratch | L | L | L | H | H | H | L | L |
| H AI-engineering | L | L | L | M | M | H | M | L |
| I Data-craft judgment | H | H | H | H | M | M | L | L |
| J Code-craft | L | L | M | M | H | H | H | M |

**PyLab coverage today vs this universe:**

| Domain | Have | Gap |
|---|---|---|
| A Core & gotchas | 51 core + 23 gotchas | Good; internals subset missing |
| B Idioms | 20 | Decent |
| C pandas/numpy | ~55 | merge/reshape/numpy thin |
| D DSA patterns | **0** | **Empty world** |
| E OOP/design | 15 | Judgment thin |
| F Internals/perf | ~0 (roadmap) | **Missing** |
| G ML-from-scratch | **0** | **Missing** |
| H AI-engineering | **0** | **Missing** |
| I Data-craft judgment | **0** | **Empty world; hurts PA/BA/DA most** |
| J Code-craft | **0** | **Empty world** |

The single biggest strategic gap: PyLab today mostly serves DS/DA fundamentals. **PA/BA judgment (domain I), SWE/ML fundamentals (D/E/F), and the modern ML/AIE domains (G/H) are essentially absent** — yet those are exactly the roles the brief names.

---

## 4. Proposed plan to make PyLab come alive

Two tracks. Track 1 makes what already exists *sing* (SQL-Lab polish + wiring — mostly engineering + light authoring, high perceived-quality payoff). Track 2 fills the interview universe with depth (mostly authoring, gated by the audit).

### Track 1 — Make the existing engine sing (SQL-Lab parity)
1. **Unify the debrief grammar** — one labeled-block debrief (Wrong-Answer / Sanity-Check / Before-Writing / Follow-Up / Approach) rendered consistently, ported from SQL Lab's `DebriefBlock`.
2. **Skill-gradient ordering** — sequence each world/difficulty so each problem adds one concept; author a ramp order like SQL Lab's.
3. **Populate learning paths** — fill `problemIds` for at least the python-core and pandas/numpy 3-day + 7-day paths so the picker actually curates.
4. **Fix empty-world UX** — hide worlds with 0 problems (or show an honest "coming soon" state) so no tab dead-ends.
5. **Placement/diagnostic quiz + readiness wiring** — a short per-world MCQ diagnostic that places role/level and lights up `PyLabReadiness`.
6. **Difficulty-aware scaffolding fade** — schema/hint verbosity scales down as difficulty rises.
7. **A curated, named fixture/datamart set** — consolidate `pyLabFixtures` into a small reusable library (like the 12 SQL datamarts) for consistency and less schema fatigue.

### Track 2 — Fill the interview universe (depth, in priority order)
Priority ordering balances role-breadth impact against effort and reuses existing components (glass-box, judgment layer, traps):

1. **Data-craft / analyst judgment (I)** — highest leverage for PA/BA/DA, currently 0. Metric ambiguity, missing-data policy, funnel/retention, dedup, Simpson's. Plays perfectly to the Ambiguity-drill and judgment-layer formats already built.
2. **DSA by pattern (D)** — unlocks SWE/ML/AIE, and the glass-box time/memory view is a real differentiator here (feel why O(n²) is slow). Easy→medium only, per PL's non-negotiable scope.
3. **ML-from-scratch numerics (G)** — RMSE, cosine similarity, k-NN, logistic regression, softmax; pure NumPy. Strong for DS/ML/AIE; verifiable and audit-friendly.
4. **AI-engineering coding (H)** — RAG/embeddings/cosine search, chunking, LLM-as-judge eval, async/streaming patterns. The most "2026" domain; needs care (some can't hit real APIs in-browser — design as pure-logic exercises over fixtures).
5. **OOP/design depth (E) + Internals/perf (F)** — round out SWE/ML.
6. **Code-craft (J)** — testing/typing/refactor/PR-review; overlaps the Phase-4 code-review + explain-it formats.
7. **Stretch tier + scale ambiguity/refactor/follow-up coverage to ~40–50%** across the bank.

### Track 3 — New formats (vision Phase 4, after Tracks 1–2 land)
Code-review, explain-it, take-home mini-projects.

**Every content batch runs the existing audit gate (0 Tier-1), and I'd add the SQL-Lab 7-dimension rubric as the authoring bar.** All CPython-verified before transcription, per PL's data-file rules (single quotes, no backticks).

---

## 5. Recommended first move

If it were my call: **Track 1 items 1–4 first** (debrief grammar, gradient ordering, populate paths, fix empty-world UX) — this is what makes the lab *feel* alive and finished on the content that already exists — **immediately followed by the Data-craft world** (Track 2 #1), because it's the biggest role-coverage gap and it showcases PyLab's judgment-gym identity better than any drill.

Open scoping questions for you are in the chat message accompanying this report.

_Sources: interview-scope research from InterviewQuery, DataCamp, GeeksforGeeks, Tech Interview Handbook, and 2026 AI-engineer interview guides; codebase findings from a full read of `production-systems-lab` and `product-analytics-lab`._

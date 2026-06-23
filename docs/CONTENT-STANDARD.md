# PL CONTENT STANDARD — the bar every problem clears

_The pedagogical + mechanical bar for PL's problem banks. The Python analog of PAL's `docs/SQL-CONTENT-STANDARD.md` + `EVAL_RUBRICS.md`. Enforced by `scripts/audit_problems.py` (Tier-1 blocks commit, Tier-2 warns). Built from the 2026-06-23 study of how PAL's SQL Lab is made (LINEAGE)._

## Hard gates (Tier 1 — the audit blocks commit on any failure)
1. **It runs and it's right.** Every test-based solution + its `__pl_checks` pass; every gotcha `code`/`fix.code` reproduces its declared output. The solution is the source of truth, verified against its own tests — no drift (PAL's "compute the answer from the canonical solution" principle).
2. **Required fields present.** Test-based: `id, bank, pattern, title, difficulty, prompt, starterCode, testSource, solution, glassBox`. Gotcha: `id, cluster, title, difficulty, setup, code, actualOutput, glassBox, fix, debrief`.
3. **Unique ids; valid pattern/cluster** (must exist in the bank's PATTERNS/CLUSTERS map); valid `difficulty` (`warmup|core|stretch`).
4. **Safety sandbox.** Stored Python (solution / testSource / gotcha code) may import only the allow-list (`pandas, numpy, collections, heapq, itertools, functools, math, decimal, datetime, re, bisect, string, statistics, copy, random`) and must not call `open/eval/exec/compile/input/__import__/getattr/...`. This is the Python analog of the SQL Lab's `DROP/DELETE/...` keyword ban — but AST-based, not a substring scan (substring scans miss `__import__`/`getattr`).

## Content bar (Tier 2 — the audit warns; reviewer judgment)
5. **Original, framed in a data/engineering scenario.** The interview canon (NeetCode/Blind-75, StrataScratch, DataLemur) is a taxonomy of *which patterns* to cover — never a source of problem text or test data (license + moat).
6. **`glassBox.lesson` shows the cost, doesn't assert it.** Name the idea *and* the Big-O / time-memory consequence (e.g. "dict lookup is O(1), so two passes beat the O(n^2) nested scan"). This is PL's signature — the glass box. ≥40 chars; explains *why*, not just *what*.
7. **Prompt frames the goal.** Warmups may name the idiomatic tool (`use np.where`, `use pivot_table`) — PL is a fluency lab and naming the right tool is the lesson. **Core/Stretch should frame the outcome and let the user choose the method** (closer to PAL's "never name the technique" gate).
8. **Progressive `hints[]`** (≥1, building toward — not giving — the answer). _Roadmap: 97 test-based problems currently have none; the next content pass ports PAL's `hintSteps:[{text, starterCode}]`._
9. **No duplicate titles or solutions** across the bank.

## Difficulty (market-benchmarked, pattern-anchored)
- **warmup** — one obvious correct approach; reflex-building.
- **core** — a real method choice exists (hash vs scan, vectorize vs apply); the bank's center of gravity.
- **stretch** — method-rich; the bridge to the judgment layer (B4). Easy→medium ceiling — no contest-grade DSA (D-07).

## On the schema roadmap (from the PAL study — sequenced, not yet built)
- **Shared fixtures** (the datamart pattern): a small set of named DataFrame fixtures many pandas problems share, vs today's per-problem inline data. Proposed — not forced; atomic drills read fine inline.
- **`forensic` bug-fix format + `beforeWriting`**: a broken pandas/Python snippet that *runs* and returns a plausibly-wrong result (chained-indexing, `groupby` dropping NaN keys, inner-merge silently dropping rows, integer division) — PL's true judgment layer, mirroring the SQL Forensic tier. This is B4.
- **Hints + richer debrief blocks** (Wrong-answer-that-runs / Sanity-check / Interviewer-follow-up), mirroring PAL's marker-segmented debrief.

_What deliberately does NOT carry from SQL Lab: the sql.js engine + `CREATE TABLE` strings (PL uses Pyodide + pandas), `expectedColumns/expectedRowCount` as the contract (Python returns heterogeneous types — `__pl_checks` generalizes it), and the `ORDER BY` determinism / float-normalization hacks (use pandas-native, NaN-aware comparison instead)._

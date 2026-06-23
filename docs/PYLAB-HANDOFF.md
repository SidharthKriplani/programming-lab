# SQL LAB → PY LAB HANDOFF — what SQL Lab *is*, and how to build pandas/numpy to match
_Authored 2026-06-23 by the PAL (Product Analytics Lab) SQL-Lab session, for the Programming Lab (PL) "PyLab" build. PL already matches SQL Lab on the **shell** — the `break⌇labs` brand, the four-frame nav (KNOW/DO/BUILD/JUDGE), and the Run/Submit + Reveal runner skeleton. This doc transmits the **depth** that makes SQL Lab what it is, and maps every piece to pandas/numpy so PyLab can be built to the same bar, not a lookalike._

> **PL note (received 2026-06-23):** This is the governing reference for the PyLab build. **PyLab is the single entry point for BOTH pandas/numpy AND Python.** Content depth + judgment layer + verification rigor come first; skin second. See the PL-side reading at the bottom.

---
## 0. The one sentence
SQL Lab is **not a grader that checks output** — it's a **judgment gym** where every problem teaches the difference between *a query that runs* and *a query that's right*, and the best problems have more than one valid answer plus a runs-but-wrong trap. The grading is the floor; the **content depth + the judgment layer + the verification rigor** are the product. Copy those three, not the screenshots.
If PyLab only mirrors the runner UI, it'll be a worse DataLemur. The value is below the surface.
---
## 1. What SQL Lab is (the shape)
- **192 problems** across 5 tiers: Easy, Medium, Hard, Master, and **Forensic** (a bug-hunt format — see §3.4). Tagged by company (Swiggy, Meesho, …) and role.
- Runs **real SQL in the browser** via `sql.js` (sql-wasm). PyLab's analog is **Pyodide** — which PL already has.
- Each problem is a realistic analytics scenario with an expected output, a verified solution, scaffolded hints, a **debrief built from executed output**, and — on the 106 hardest — a **judgment layer** (multiple valid methods + a "which method when" dial + judgment MCQs).
- Backed by **13 datamarts** (`ecomm`, `saas`, `fintech`, `consumer`, `health`, `gaming`, `logistics`, `marketplace`, `edtech`, `swiggy`, `meesho`, …) — each a set of tables with schema + seed rows.
- Guarded by **four verification gates** that run before any commit. This is the part that makes it trustworthy at 192 problems.
---
## 2. The four pillars to replicate
### A. The per-problem content model
Every problem is one object in `src/data/sqlLabProblems.js` with these fields (this is the schema PyLab should mirror, renaming `sql`→`code` where relevant):
```
id, title, company, companyDomain, difficulty, tags, roles, priority,
estimatedMin, datamartId, prompt, expectedColumns, expectedRowCount,
hintSteps, hints, checkValues, solution, debrief
  + the judgment layer (on Medium/Hard/Master that fork):
canonicalMethodId, methods[], dial, mcqs
```
- `solution` is the single canonical correct answer the grader checks against.
- `checkValues` are **derived from EXECUTED output**, never hand-typed (see §2.D — this is the #1 source of bugs).
- `prompt` is **de-jargoned**: it states the business task, never names the technique.
### B. The fixture / datamart model
A datamart = named tables, each with a `schema` (CREATE TABLE), a `columns` metadata array, and `rows` (seed data). Problems reference a `datamartId`; the runner builds a fresh DB from it and runs the user's query. Seed data is **small and deliberately designed** so traps and ties actually appear (e.g. one account with two transactions on the same latest day, so the ROW_NUMBER-vs-aggregate ties fork is real, not hypothetical).
**PyLab analog:** fixtures are **seed DataFrames** (constructed in a shared fixtures module or inline per problem). Same discipline: keep them tiny, and **engineer the data so the footguns fire** — duplicate index values, NaN groups, a merge key that fans out, mixed dtypes, a chained-assignment target. If the seed is too clean, your trap won't diverge and you'll be tempted to fake it (don't — see the honesty rule, §6).
### C. The judgment layer — the differentiator
This is the productized JUDGE frame. On a problem that genuinely has **more than one valid approach**, it carries:
- `canonicalMethodId` — which method the `solution` is.
- `methods[]` — 2–4 entries, each: `{ id, name, code, detectionSignature{mustMatch[],mustNotMatch[],note}, tradeoff, breaksWhen, isTrap }`. Non-trap methods **must produce identical output to `solution`**. At least one `isTrap: true` method **runs but diverges** (the "wrong answer that runs").
- `dial` — `{ axes[], rules[] }`. Sparse, most-specific-wins. Each rule: a condition subset → a ranking of methods + a one-line cost reason. Author only the cells where the recommended method changes (~3–6), not a full matrix.
- `mcqs[]` — 2–3 judgment questions, each `{ id, stem, options(=method ids), answerId, explanation }`. The explanation **cites the cost mechanism** (nested loop, shuffle+sort, copy-vs-view), with magnitudes marked illustrative — never fabricated benchmark numbers.
**The honesty rule (non-negotiable):** if a problem has only one sane method, it gets `canonicalMethodId` + that method + an **empty dial** (`dial:{axes:[],rules:[]}`, `mcqs:[]`). The empty dial is the signal "this is fluency, not judgment." Do **not** fake a fork or a trap. In SQL Lab, ~7 of the layered problems are honest empty dials; several others ship valid-method-only sets where no trap diverged on the seed.
### D. The verification gates (why it's trustworthy)
Four scripts in `scripts/`, all run before commit:
1. **`audit_sql_lab.py`** — the mechanical gate. Tier-1 (**blocks**): every problem's `solution` runs against its datamart and its output matches `expectedColumns`/`expectedRowCount`/`checkValues`. Tier-2 (warns): tag vocabulary, soft fields, `estimatedMin` ranges. **0 T1 failures required to commit.**
2. **`sql_content_scan.mjs`** — the content gate. Flags jargon-in-prompt, missing debrief structure, etc. Exits non-zero on a GATE failure.
3. **`verify_methods.py`** — the judgment-layer harness. Per problem with `methods[]`: runs every method and asserts **non-trap methods are byte-identical to `solution`**, **trap methods run AND diverge**, and `canonicalMethodId` resolves to a non-trap method that matches the solution. Also: every MCQ option/answerId must reference a real method id (prevents dial/MCQ drift).
4. **`run_sql.py`** — the authoring tool. Runs arbitrary SQL (or a problem's solution, or a `--diverge` solution-vs-wrong comparison) against a datamart. Used to **author every debrief and checkValue from REAL executed output**, and to prove a trap actually runs-but-diverges before it's written.
The non-obvious lesson: **`checkValues` and debrief numbers must come from executed output, not from reasoning.** sql.js has numeric-serialization quirks (whole-number REALs serialize as ints, `.0` suffix mismatches). Hand-written values silently fail the grader. This session also found ~25 **stale debriefs** — problems whose "wrong answer" narrative no longer diverged on the current seed because the data had drifted. Lesson for PyLab: **author against the live fixture, and re-run when the fixture changes.**
---
## 3. The content standard (how a problem is *written*)
(SQL Lab's frozen bar lives in `docs/SQL-CONTENT-STANDARD.md`; PyLab needs its own equivalent. The rules:)
1. **De-jargon the prompt.** State the business task. Never "use groupby.transform" — say "add each rep's rank within their region." The choice of technique is the test.
2. **Scaffold the hints** (≥2). Not the answer — the next idea.
3. **Build the debrief from executed output.** Run the solution and a plausible wrong variant; show the *real* divergence. The debrief's spine is "a wrong answer that runs, and the tell that catches it."
4. **Add an interviewer follow-up** and, on Hard/Master, a `beforeWriting` judgment prompt (e.g. "what does 'rate' mean here — which denominator?").
5. **The Forensic tier** ships a query/notebook that **runs and returns a plausible wrong answer**; the user finds the bug. This is the single biggest differentiator — no major platform has it because they only grade output. `isTrap` is the bridge: a trap method *is* a Forensic bug, tagged once, reusable in both formats.
---
## 4. The runner UX (what the surface does)
- **Browser view:** filter by difficulty (Warmup/Core/Stretch in PL; Easy→Master in SQL Lab) and company; solved/unsolved; search; a study-plan modal; `alsoAskedAt` company badges; solved state in `localStorage`.
- **Solve view:** prompt + `beforeWriting` → example input + expected output tables → editor → **Run (scratch, no grade) vs Submit/Check (graded)** → on correct or after hints, **Reveal solution** → **debrief** → **the judgment layer panel** → next problem. PL's runner already has Browse / Run / Submit / Reveal model solution / example-input / expected-output / past-attempts — so the skeleton matches; the **judgment layer panel is the missing surface.**
- **The judgment panel** (built in PAL's `SqlLabPage.jsx`, component `JudgmentLayer`) renders after reveal: collapsible method cards (name + code + tradeoff + "breaks when", a *Reference* badge on the canonical, a red *Trap · runs, wrong* badge on `isTrap`), the "which method when" dial, and the interactive MCQs. It returns null when `methods.length < 2`, so it's safe to drop on every problem.
---
## 5. How it was actually built (the process to copy)
- Problems and judgment layers were authored in **subagent batches of ~8**, each independently gate-verified before moving on. 13 batches took the judgment layer across all 106 eligible problems.
- **Every method executed, every number verified** — no fabricated `checkValues`, no faked traps. When a trap couldn't be made to diverge on the seed, the batch authored valid-method-only and said so.
- The gates were run **after every batch**, not at the end — so drift was caught immediately.
- Difficulty gates the depth: Easy/Medium fluency problems stay single-method (empty dial); the heavy judgment authoring concentrates on Hard/Master.
---
## 6. THE MAPPING — SQL Lab → PyLab (pandas/numpy)
This is the core of the handoff. Same systems, Python substrate.

| SQL Lab | PyLab (pandas/numpy) |
|---|---|
| `sql.js` runs SQL in-browser | **Pyodide** runs Python in-browser (PL already uses it) |
| **datamart** = tables (schema + seed rows) | **fixture** = seed `DataFrame`s (shared module or per-problem), engineered so footguns fire |
| `solution` = a SQL query | `solution` = a Python function, e.g. `def solve(df): ... return out` |
| `expectedColumns` + `checkValues` (from executed output) | **expected DataFrame** — compared with `pandas.testing.assert_frame_equal` (be explicit about `check_dtype`, `check_like` for column order, and index reset). This is *harder* than SQL — dtype/index/NaN are where bugs hide |
| Run (scratch) vs Check (graded) | already present in PL — keep it |
| **Forensic tier** ("query runs, wrong") | **the pandas footgun tier** — pandas is *richer* here: `SettingWithCopyWarning`/chained assignment that silently no-ops, **merge fan-out** (many-to-many blow-up), `groupby` dropping NaN groups, forgetting `reset_index`, index-misalignment on assignment, `==` on floats, `inplace` surprises, `apply` where a vectorized op was needed |
| `methods[]` = multiple valid SQL approaches, each == solution | `methods[]` = multiple valid pandas approaches — e.g. `groupby().transform()` vs merge-back vs `map`; vectorized vs `apply`; `.loc` vs `.query`; `pivot_table` vs `groupby().unstack()` — each must produce an **identical DataFrame** |
| `isTrap` method = runs, diverges | the footgun version: chained assignment, fan-out merge, `groupby` without `dropna=False`, integer division, mutating a slice — **runs, wrong DataFrame** |
| `dial.axes` = dataSize/index/engine/ties | pandas axes: **dataSize, memory, vectorized-vs-apply, copy-vs-view, dtype, index-alignment, NaN-policy** |
| `mcqs` cite SQL cost (nested loop, shuffle) | mcqs cite **pandas cost**: vectorized O(n) vs `apply` Python-loop, copy vs view memory, **merge cardinality**, dtype upcasting, chunking |
| `verify_methods.py` (run each method, diff vs solution) | **a pandas method verifier**: run each method's code in Python, `assert_frame_equal(method_out, solution_out)`; non-trap == solution, trap runs + diverges |
| `audit_sql_lab.py` T1 (runs + matches) | **a pandas audit**: run each `solution` against its fixture, assert the returned df matches the expected df (shape, columns, dtypes, values) |
| `run_sql.py` (`--diverge`) authoring tool | **a `run_py.py`** that runs a fixture + candidate code and diffs two DataFrames — to author debriefs from real output and prove traps diverge |
| de-jargoned prompt | identical rule — never name the pandas method in the prompt |
| house syntax (single quotes, no template literals in data files) | apply PL's data-file build-breakers; the meta-rule is the same: a gate that catches them |

**Why pandas is an easier, richer fit than SQL for this:** pandas has *more* ways to do the same thing (so the multi-method fork is more natural) and a *famous, well-documented catalog* of "runs but wrong" footguns (so the trap/Forensic tier writes itself). The judgment layer is arguably more valuable in PyLab than in SQL Lab. The one thing that's *harder*: DataFrame equality. Treat the comparison discipline (dtype + index + column-order + NaN) with the same seriousness SQL Lab treats `checkValues`-from-executed-output.
---
## 7. Suggested build order for PyLab (mirrors how SQL Lab got deep)
1. **Lock the per-problem schema** (the §2.A field set, `sql`→`code`, `datamart`→`fixture`) and the comparison contract (`assert_frame_equal` settings). Get this right first — everything keys off it.
2. **Build the audit gate** (`audit_py.py`: run every solution against its fixture, assert match) and a `run_py.py` diff tool. No content ships ungated.
3. **Author the fluency bank** (groupby/aggregate, merge/join, reshape/pivot, window, vectorize) — de-jargoned prompts, executed expected-DataFrames, scaffolded hints, executed debriefs.
4. **Add the footgun (Forensic) tier** — pandas runs-but-wrong problems. This is your differentiator; lean in.
5. **Build the judgment-layer harness** (`verify_py_methods.py`) — the pandas analog of `verify_methods.py`.
6. **Author the judgment layer** on the genuinely multi-method problems, difficulty-gated, honesty rule enforced. Reuse the runner's `JudgmentLayer` component (re-skinned to PL's accent).
7. **Run the gates after every batch.** Verify, don't trust.
---
## 8. The non-negotiables (the bar, restated)
- **Execute everything. Never hand-write expected values or fake a trap.** If it can't be verified against the live fixture, it doesn't ship.
- **De-jargon every prompt.** The technique choice is the test.
- **Debriefs are built from real divergence** — a wrong answer that runs, plus the tell.
- **The honesty rule:** single-method problems get an empty dial. Don't manufacture judgment where there isn't any.
- **Gates run before commit, every time:** audit (0 T1), content scan, method harness, syntax/build-safety.
- **The runner already matches; the depth is the work.** Resist the urge to re-skin and instead build the content + judgment + verification systems above.

_Future note: SQL Lab's visual direction is moving toward a "judgment terminal" — navy + monospace-for-data + the red `break⌇labs` seam used as a system-wide motif. When PL re-skins, build toward that shared system so the labs stay one family — but **content depth comes first, skin second.**_

---
## PL-side reading (where PL stands vs this bar, 2026-06-23)
**Already in PL (don't rebuild):** the runner skeleton + Pyodide; a committed Tier-1 audit gate (`scripts/audit_problems.py`); two-pane solve with example-input + expected-output computed live from the solution (`previewExample`); a small forensic JUDGE tier (6); de-jargoned prompts on most drills.

**The real gaps (the work):**
1. **The judgment layer** — `methods[]` (non-trap == solution; ≥1 `isTrap` that runs+diverges) + sparse `dial` + `mcqs`, and a **`verify_py_methods.py`** harness. PL's JUDGE is forensic-only today.
2. **The comparison contract decision (lock first, §7.1).** PL's drills check via `__pl_checks` (assertions); the handoff wants `solve(df)→df` compared with `assert_frame_equal` (explicit `check_dtype`/`check_like`/index reset). Decide: migrate the existing pandas/python banks, or run the new contract forward only.
3. **Engineered shared fixtures** — seed DataFrames designed so footguns fire (dup index, NaN groups, fan-out key, chained-assignment target). PL currently uses per-problem inputs.
4. **Content depth** — executed debriefs from *real* divergence, `beforeWriting` prompts, scaffolded `hints` (a known PL gap), interviewer follow-ups.
5. **The footgun/Forensic tier, expanded** — pandas is richer (chained-assignment no-op, merge fan-out, `groupby` dropna, `==` on floats, `apply`-where-vectorized). `isTrap` bridges JUDGE ↔ Forensic.

**Scope:** PyLab is the **single entry point for pandas/numpy AND Python**, not a pandas-only room.
**House syntax (PL build-breakers):** data files use single quotes; escape apostrophes as `\'`; store Python with double quotes inside; NO template literals/backticks.

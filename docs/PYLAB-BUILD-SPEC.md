# PYLAB — BUILD SPEC (schema + comparison contract + gates)
_Drafted 2026-06-23 for sign-off. Implements `docs/PYLAB-HANDOFF.md` for Programming Lab. Nothing gets authored until the **DECISIONS** here are approved — the schema + comparison contract key everything (handoff §7.1)._

PyLab is the **single entry point for pandas/numpy AND Python**, built to SQL Lab's bar: a judgment gym, not a grader. This doc locks the substrate so authoring can start.

---
## 1. The shape (DECISION 1 — structure)

**Recommended:** PyLab is **one filterable problem bank** (like SQL Lab's 192), spanning pandas/numpy + Python, with filters for **topic** (`pandas-groupby`, `pandas-merge`, `pandas-reshape`, `pandas-window`, `numpy-vectorize`, `python-core`, `idioms`, `oop`, …), **difficulty** (`warmup`/`core`/`stretch`), **company**, and solved/unsolved + search + study-plan. This replaces the four separate DO card-banks (Python Drills / Idioms / OOP / pandas) over time — they become *filters within PyLab*, not separate rooms.

> Sign-off needed: PyLab = one consolidated bank (recommended), **or** PyLab = a new bank alongside the existing four? I recommend consolidation — it matches SQL Lab's one-bank-many-filters shape and the "single entry point" intent.

---
## 2. The per-problem schema (DECISION 2 — lock this)

One object per problem in `src/data/pyLabProblems.js`. **House syntax (build-breakers):** single quotes only; escape prose apostrophes as `\'`; store Python with **double quotes inside** the single-quoted JS string (so no inner escaping); **NO template literals / backticks**.

```
{
  id, title, topic, difficulty: 'warmup'|'core'|'stretch',
  company?, companyDomain?, roles?, priority?, estimatedMin, tags[],

  fixtureId,                 // -> src/data/pyLabFixtures.js  (§4)
  prompt,                    // DE-JARGONED business task — never names the technique
  beforeWriting?,            // judgment prompt on stretch ("which denominator is 'rate'?")
  signature,                 // e.g. 'solve(sales)'  — the function the user writes
  starterCode,               // the editor seed (def solve(sales): ...)

  hints,                     // >= 2, scaffolded (the next idea, not the answer)
  solution,                  // canonical code defining solve(...). THE source of truth.
  compare,                   // typed-comparator config (§3)
  debrief,                   // built from EXECUTED divergence (a wrong-but-runs answer + the tell)

  // judgment layer (optional; only when >1 valid approach — §5):
  canonicalMethodId?, methods?, dial?, mcqs?
}
```

- **Expected output is NEVER stored hand-written.** It is computed by running `solution` against `fixtureId` (live, like PL's existing `previewExample`). The canonical solution is the single source of truth (SQL Lab's principle + PL's existing trick).
- `prompt` de-jargon is gate-enforced (§6).

---
## 3. The comparison contract (DECISION 3 — the keystone)

This is the one place pandas is *harder* than SQL. **Locking it now.**

**Every problem's `solution` and the user's code both define `solve(<fixture args>)` returning the answer** (DataFrame / Series / ndarray / scalar / list / dict). Grading = run **both** against the **same fresh fixture**, then compare outputs with a **typed comparator** `pl_compare(expected, got, cfg)`:

| return type | comparator |
|---|---|
| `DataFrame` | `pandas.testing.assert_frame_equal(got, expected, check_dtype=cfg.checkDtype, check_like=cfg.checkLike)`, after `reset_index(drop=True)` if `cfg.ignoreIndex` |
| `Series` | `assert_series_equal(...)` (same dtype/index discipline) |
| `ndarray` | `np.testing.assert_allclose` (float, `rtol`/`atol`) or `array_equal` (int/bool) per `cfg` |
| `float` | `math.isclose(rel_tol=cfg.rtol, abs_tol=cfg.atol)` |
| `list`/`tuple` | elementwise; order-sensitive unless `cfg.unordered` |
| `set`/`dict` | `==` |
| other | `==` |

`compare` (per-problem) defaults by kind. For DataFrames the default is **`{ kind:'frame', checkDtype:true, checkLike:true, ignoreIndex:true }`** — `check_like:true` makes **column order not matter**, `ignoreIndex:true` resets the index (set `false` when the index *is* the answer, e.g. a `set_index` result). dtype + index + NaN are explicit, every time — treat them as seriously as SQL Lab treats `checkValues`.

This **one contract unifies pandas + Python**: a Python problem returns a scalar/list (value path), a pandas problem returns a DataFrame (frame path). It also replaces PL's current `__pl_checks` model with "compare to the canonical solution's executed output" — cleaner, and it's already how `previewExample` thinks.

> Sign-off needed: adopt `solve()→output` + `pl_compare` as the contract (recommended), retiring `__pl_checks` for PyLab content.

---
## 4. The fixture model (engineered so footguns fire)

`src/data/pyLabFixtures.js` — each fixture is a **named Python setup string** that builds the seed object(s) (`sales = pd.DataFrame({...})`, etc.). Problems reference `fixtureId`; the runner runs the setup, then `solve`. Rules:
- **Tiny and deliberate.** Engineer the data so the traps actually diverge: duplicate index values, a NaN group, a merge key that **fans out** (many-to-many), mixed dtypes, a float that won't `==`, a chained-assignment target. If the seed is too clean the trap won't diverge — and faking it is forbidden (§7 honesty rule).
- Shared across problems where sensible (a `sales`/`users`/`events` set reused), like SQL Lab's datamarts.
- **Author against the live fixture; re-run when it changes** (SQL Lab found ~25 stale debriefs from fixture drift — don't repeat it).

---
## 5. The judgment layer (the differentiator)

Only on problems with **>1 genuinely valid approach**. Schema (mirrors SQL Lab, Python substrate):
- `canonicalMethodId` — which method `solution` is.
- `methods[]` — 2–4 of `{ id, name, code, detectionSignature{mustMatch[],mustNotMatch[],note}, tradeoff, breaksWhen, isTrap }`. **Non-trap methods must produce an output identical to `solution`** (via `pl_compare`). **≥1 `isTrap:true`** that **runs but diverges** (chained assignment, fan-out merge, `groupby` without `dropna=False`, integer division, mutating a slice).
- `dial` — `{ axes[], rules[] }`, sparse, most-specific-wins. pandas axes: **dataSize, memory, vectorized-vs-apply, copy-vs-view, dtype, index-alignment, NaN-policy**. Author only the ~3–6 cells where the recommendation changes.
- `mcqs[]` — 2–3 of `{ id, stem, options(=method ids), answerId, explanation }`. Explanations cite the **pandas cost mechanism** (vectorized O(n) vs `apply` Python-loop, copy vs view, merge cardinality, dtype upcast) — magnitudes marked illustrative, never fabricated benchmarks.
- **Honesty rule:** single-method problems get `canonicalMethodId` + that one method + **empty dial** (`dial:{axes:[],rules:[]}`, `mcqs:[]`). The empty dial means "fluency, not judgment." Never manufacture a fork.
- `isTrap` is the bridge: a trap method **is** a Forensic ("runs, wrong") bug — tag once, reuse in both the JUDGE panel and the footgun tier.

---
## 6. The four gates (PL versions, run before every commit)

1. **`scripts/audit_py.py`** — mechanical gate, **Tier-1 blocks**. For each problem: build the fixture, run `solution.solve`, assert it produces a stable, non-error output; AST-sandbox the code (no `open`/`eval`/network). Tier-2 (warns): tag vocabulary, `estimatedMin` ranges, `hints` count. **0 T1 to commit.** (Extends PL's existing `audit_problems.py`.)
2. **`scripts/py_content_scan.mjs`** — content gate. Flags **jargon-in-prompt** (a technique-name blocklist: `groupby`, `merge`, `pivot`, `transform`, `apply`, `vectorize`, …), `<2` hints, missing debrief structure, missing `beforeWriting` on `stretch`. Exits non-zero on a GATE failure.
3. **`scripts/verify_py_methods.py`** — judgment-layer harness. Per problem with `methods[]`: run every method against the fixture; assert **non-trap == `solution` output** (via `pl_compare`), **trap runs AND diverges**, `canonicalMethodId` resolves to a non-trap matching method, and every MCQ `option`/`answerId` references a real method id (prevents dial/MCQ drift).
4. **`scripts/run_py.py`** — authoring tool. Runs a fixture + candidate code and prints the output; `--diverge A B` runs two candidates and diffs the DataFrames — used to **author every debrief from real executed output** and to **prove a trap diverges** before it's written.

(Extraction: a `scripts/_extract_pylab.mjs` dumps the JS data to JSON for the Python gates, mirroring PL's existing `_extract_problems.mjs`.)

---
## 7. The content standard (the non-negotiables)

- **Execute everything.** Never hand-write an expected output or fake a trap. If it can't be verified against the live fixture, it doesn't ship.
- **De-jargon every prompt.** State the business task; the technique choice is the test. (Gate-enforced.)
- **Debriefs are built from real divergence** — a wrong answer that runs, plus the tell that catches it. Authored via `run_py.py --diverge`.
- **The honesty rule.** Single-method → empty dial. Don't manufacture judgment.
- **Comparison discipline.** dtype + index + column-order + NaN are explicit in `compare`, every problem.
- **Gates after every batch**, not at the end (SQL Lab authored in subagent batches of ~8, gate-verified each — copy that).

(A `docs/PYLAB-CONTENT-STANDARD.md` will freeze this once the spec is signed off — the analog of `SQL-CONTENT-STANDARD.md`.)

---
## 8. Runner changes (what the surface needs)

- **New grading path** in `pyodideRuntime.js`: `runPyLab(userCode, solutionCode, fixtureSetup, compareCfg)` → runs fixture, runs both `solve`s, returns `{ pass, diff, error, timeMs, peakKb }` via `pl_compare`. (Coexists with the current `runProblem`/`__pl_checks` path during migration.)
- **Solve view** keeps PL's Browse / Run (scratch) vs Submit (graded) / Reveal / example-input / expected-output / past-attempts. Add `beforeWriting` above the prompt.
- **`JudgmentLayer` panel** (port PAL's, re-skinned to PL's accent): renders after reveal, collapsible method cards (name + code + tradeoff + breaks-when, a *Reference* badge on canonical, a red *Trap · runs, wrong* badge on `isTrap`), the dial, the MCQs. Returns null when `methods.length < 2` — safe on every problem.
- **Browse** = filterable table (difficulty / topic / company / solved / search) — PL already has the two-pane + filter pattern.

---
## 9. Migration plan (existing banks → PyLab) (DECISION 4)

PL has ~155 verified `__pl_checks` drills (gotchas 23 · python 56 · idioms 20 · oop 15 · pandas 41). **Recommended:** keep them runnable; migrate into the PyLab schema in **verified batches** (pandas 41 first — highest judgment-layer value — then python/idioms/oop), re-authored to `solve()→output` + executed expected + ≥2 hints + executed debrief, gate-verified each batch. Gotchas stay a predict→reveal format (not solve-based) and remain their own thing. Retire the `__pl_checks` path when migration completes.

> Sign-off needed: migrate-into-PyLab (recommended) vs run-PyLab-forward-only-and-keep-old-banks.

---
## 10. Build order + what I need from you

Per handoff §7, once signed off:
1. **(this doc)** lock schema + comparison contract + structure. ← **needs your sign-off**
2. Build the gates (`audit_py.py`, `py_content_scan.mjs`, `verify_py_methods.py`, `run_py.py`) + `runPyLab` runtime. No content ships ungated.
3. Author the **fluency bank** (groupby/aggregate, merge/join, reshape/pivot, window, numpy-vectorize, python-core) — de-jargoned, executed expected, ≥2 hints, executed debriefs. Subagent batches of ~8, gated each.
4. Add the **footgun/Forensic tier** (chained-assignment no-op, merge fan-out, `groupby` dropna, `==` on floats, `apply`-where-vectorized).
5. Build `verify_py_methods.py` harness + author the **judgment layer** on the genuinely multi-method problems, difficulty-gated, honesty rule enforced.
6. Gates after every batch.

**Four decisions for your sign-off:** (1) PyLab = one consolidated bank; (2) the per-problem schema; (3) `solve()→output` + `pl_compare` as the contract; (4) migrate existing banks into PyLab in batches. Approve/adjust these and I'll build the gates + runtime first (step 2), then start authoring.

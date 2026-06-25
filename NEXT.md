# PL — NEXT (build queue)

_PL = Programming Lab (SWE-for-data fluency; D-07/D-15). React+Vite+Pyodide SPA. Repo: `github.com/SidharthKriplani/programming-lab`. Local: `labs/production-systems-lab`. Always read this + `STATUS.md` + `CLAUDE.md` before any session._

---

## ⚠ PUSH FIRST (Mac only)

**0.38.0–0.42.0 are all built locally but not pushed.** Run this before anything else:

```
cd ~/Documents/Professional/BreakLabs/labs/production-systems-lab && rm -f .git/index.lock .git/HEAD.lock && npm run build && git add -A && git commit -m "PL 0.38-0.42: Icon, Worlds+Gates, ramp1, two-col layout, contrast, learning paths" && git push origin main
```

**What's in this batch:**
- **0.38.0** — HQ Icon superset (84+4 icons, GLYPH_TO_ICON) + CompanyLogo (319 mappings) merged in; 6 emoji/glyphs replaced across PythonCell/MockLoop/models.
- **0.39.0** — Worlds + Gates skeleton: 7-world tab layer (`pyLabWorlds.js`, `worldGates.js`, `WorldTabs.jsx`, `WorldGate.jsx`, `GateQuiz.jsx`), PyLabBrowser fully wired.
- **0.40.0** — ramp1: `pyLabBatch_ramp1.js` — 5 warmup problems + 4 fixtures (col-mean, filter-rows, filter-notna, groupby-mean, groupby-count-nan), all CPython-verified. 141 problems / 0 T1 / 0 T2 audit clean.
- **0.41.0** — Two-column solve layout (SQL Lab parity): reveal section moved into RIGHT column; left column (prompt+schema) stays fixed. Text contrast: Graphite theme (`data-skin='platinum'][data-theme='dark'`) boosted (`--text-muted: #9a9aa0→#bbbbc2`, `--text-secondary: #c3c3c8→#dddde2`, `--text-dim: #74747a→#9a9aa0`); debrief text changed from `var(--text-secondary)` to `var(--text)`; fixture preview from `var(--text-muted)` to `var(--text)`.
- **0.42.0** — Learning paths built and wired: `src/data/pyLabPaths.js` (16 path objects: 7 worlds × 2 tiers + 2 lab-wide). PathSelector (two cards shown when no path active) + day strip (day buttons + title + focus + × to exit) wired into PyLabBrowser. Filter logic: day `problemIds` if populated → day `worlds` topics for lab-wide → world filter fallback. Path resets on world tab switch.

---

## ⏸ RESUME HERE — Content batch 2 (ramp 6-10)

**Context:** pandas/numpy world concept ladder — batch 1 (ramp 1-5) done. Batch 2 = the next 5 concepts. Same rules: one new concept per problem, CPython-verify all solutions+traps before transcribing, run audit gate (0 T1), then batch 3.

**Batch 2 (ramp 6-10):**
6. **groupby + multi-agg** — `df.groupby('dept', as_index=False).agg({'score': 'mean', 'salary': 'sum'})`. New concept: multiple aggregations in one groupby. Trap: `agg('mean')` vs `agg({'col': 'mean'})` returns different shapes.
7. **simple inner merge** — `pd.merge(left, right, on='key')`. New concept: first join. Trap: assumes key is unique — silent row multiplication if it isn't.
8. **merge with duplicate keys (fan-out trap)** — same `merge(on='key')` but `right` has duplicate keys → 4 rows from 2×2 fan-out. The trap IS the concept: show the cardinality blow-up.
9. **left merge + missing values** — `merge(how='left')`. New concept: `how='left'` keeps all left rows; unmatched right = NaN. Trap: inner merge silently drops them.
10. **pivot_table** — `df.pivot_table(index='dept', columns='role', values='score', aggfunc='mean')`. New concept: reshape (rows→column headers). Trap: `pivot` vs `pivot_table` (pivot fails on duplicates).

**Per-problem schema (full depth):** `id, title, topic, level, fixtureId, prompt, beforeWriting, starterCode, solution, compare, methods[] (≥2, one isTrap), mcqs[] (≥1), hints[] (tiered), glassBox, dial`

**Fixtures needed:**
- For 6: `fx_dept_salary` — dept+score+salary (eng×3, pm×2, designed so multi-agg gives different results per col)
- For 7: `fx_scores` + `fx_dept` — two small dfs, unique keys, clean merge
- For 8: `fx_scores` + `fx_dept_dup` — dept has duplicate key rows so merge fans out
- For 9: same left + a right with one unmatched key
- For 10: `fx_dept_role_scores` — dept×role×score (designed so pivot_table has clear non-NaN cells)

**Build steps:** author → CPython-verify solutions+traps (diverge confirmed) → run `node scripts/_extract_pylab.mjs out.json && python3 scripts/audit_py.py out.json` → 0 T1 → add to `pyLabBatch_ramp2.js` → wire into `pyLabProblems.js` + `pyLabFixtures.js` → audit clean → push.

---

## Batch 3+ and skeleton bank

**After batch 2:** scaffold 400–600 problem stubs across all worlds — title, topic, level, fixtureId, starterCode, solution, compare; empty depth fields (methods[], mcqs[], hints[]). Audit catches missing required fields (T1), warns on empty depth (T2). Bank exists; depth fills in over time, one batch at a time.

**Also:** as the bank grows, fill in `problemIds` arrays in `src/data/pyLabPaths.js` so the learning paths actually filter to curated problems instead of falling back to topic-matching. Target: batch 3+ fills in at least the pandas/numpy 3-day path's `problemIds`.

---

## ⏸ Tutorial ladder (0.37.0, in progress, lower priority)

Python lessons **1–5 authored** (values, numbers, text, booleans, lists — 20 tasks, CPython-verified). Lessons 6–18 + pandas section are planned stubs in `src/data/pyTutorial.js`.

**Next:** Python lessons 6–13 (dicts · sets/tuples · if · loops · enumerate/zip · comprehensions · functions · *args/**kwargs). Author → CPython-verify (correct passes, starter fails) → flip `status:'ready'` — appears automatically.

Authority: `docs/PYLAB-TUTORIAL-SPEC.md`. Decision: D-PL-28.

---

## ⏸ KNOW Foundations F2/F3 (lower priority, mostly authoring)

19 driven models across all 7 rooms (F0/F1 complete). Two config templates: `StateTrace` (binding/identity ×4) + `ArrayTrace` (DSA traces ×3).

**Remaining work (F2/F3):**
- `git rm` the 5 superseded bespoke files (Aliasing/CopyVsView/TwoPointer/SlidingWindow/BinarySearch — sandbox couldn't delete last session)
- Author planned modules' predict→read text alongside the existing widgets (mostly text authoring, no new engineering)
- Extend `yourTurn` to more read-run modules

Authority: `docs/FOUNDATIONS-SPEC.md`. State: `STATUS.md` KNOW section.

---

## Standing rules (always)

- **Pre-commit (PyLab):** `node scripts/_extract_pylab.mjs out.json && python3 scripts/audit_py.py out.json` — 0 T1 failures before commit.
- **macOS-only build.** Sandbox can't `npm run build` (Rollup ARM64). Prepare commands, Sidharth runs on Mac.
- **Approve-first.** `git push` auto-deploys to Vercel. Never auto-push.
- **Lock files:** `rm -f .git/index.lock .git/HEAD.lock` before every git operation.
- **Single quotes only in `src/data/*.js`.** Escape apostrophes as `\'`. No backticks.
- **Close ritual:** update STATUS.md + append LINEAGE.md + rewrite NEXT.md before ending any session.

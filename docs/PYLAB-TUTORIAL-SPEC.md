# PYLAB TUTORIAL SPEC — the beginner on-ramp ladder

_Created 2026-06-24. The SQLBolt-style guided walkthrough that lives **inside PyLab** (nothing standalone), mirroring PAL's SQL Lab "New to SQL? Start with a guided, step-by-step walkthrough" banner. The welcome mat in front of the gym: a complete beginner climbs short sequential lessons until they can write a passing `solve()`, then hands off to the bank. Skeleton shipped this session: Python section lessons 1–5 authored + CPython-verified; the rest are planned stubs._

---

## 0. The one job

The 136-problem PyLab gym assumes you can already write Python. A true beginner bounces. This ladder is the **0 → Easy** on-ramp that catches them. It **only** reaches the gym's Easy floor, then graduates into the bank (`graduatesTo`). The gym takes them Easy → Staff. **The ladder never tries to reach medium/hard** — that would duplicate the 136 problems.

This is the same KNOW→DO seam the family already uses, and the same dual-surface split PAL has (SQL Lab tutorial + Stats Foundation rooms). Lane discipline: the tutorial teaches you to **write the code** (procedural, task-driven). Foundations explains **why it behaves** (manipulable models). If a lesson drifts into concept-explanation, it collides with Foundations — keep it task-first.

---

## 1. The shape

One continuous track, two marked sections, skip-ahead anywhere (SQLBolt's affordance, and PAL's "Skip ahead anytime"):

```
Section 1 · Python  (18 lessons)  ── the beginner one, build first
Section 2 · pandas  (8 lessons)   ── author after Python ships
        ↓ graduatesTo
   PyLab gym (Easy → Correctness → Judgment → Systems)
```

Python is a prerequisite for pandas, so the absolute beginner walks both in order; the Python-fluent user skips to pandas; the pandas-fluent skips the whole thing into the gym.

---

## 2. Files

| File | Role |
|---|---|
| `src/data/pyTutorial.js` | The ladder data — lessons + tasks + stubs. House syntax, CPython-verified. |
| `src/pages/PyTutorial.jsx` | The lesson player — ladder list → lesson view (concept + tasks) → graduate. Reuses `PythonCell` + `runCheck`. |
| `src/pages/PyLabBrowser.jsx` | Wiring — banner at top of the bank + `tutorial` state + internal early-return (like Mock interview). |

No new route, no `App.jsx` / `Sidebar` change — it's an internal view of the PyLab room, exactly matching the "offering within PyLab" decision.

---

## 3. The per-task grader contract

Reuses `pyodideRuntime.runCheck(userCode, check)` — the Foundations "your turn" grader. It runs the learner's code then `check` in **one fresh namespace**; `check` sets `__pl_pass` (bool) + `__pl_msg` (targeted, actionable — never just "wrong"). The check inspects the learner's variables via `globals().get("name")`, so tasks ask the learner to **define a value**, not to print (the harness captures stdout out of namespace reach).

```
LESSON  { n, section, title, topic, level, status, concept, tasks[], graduatesTo? }
TASK    { id, prompt, starter, check, hint, solution }
STUB    { n, section, title, topic, status:'planned', seed }
```

- `concept` — de-jargoned teaching prose; paragraphs split on `\n\n`.
- `starter` — runnable-but-wrong seed (e.g. `city = "..."`) so the first Check returns a helpful nudge, not a crash.
- `solution` — the canonical correct code. **Gate-only**, never shown. Must pass its `check`; the `starter` must NOT.
- `check` — Python, double-quoted internals, `.join('\n')`. Targeted `__pl_msg` on both pass and fail.

---

## 4. The verification gate (non-negotiable, honesty rule)

Every authored task is executed before it ships — no hand-asserted expected values. The gate (run this session, 20/20 passed):

1. **Extract** ready tasks from the written file (Node ESM import).
2. For each: `runCheck(solution, check)` **must pass**; `runCheck(starter, check)` **must NOT pass** (proves the task isn't pre-solved); neither raises.
3. Brace balance 0 on all touched files; `node --check` the data file.
4. Before commit, run the macOS `npm run build` — the sandbox has no esbuild, so the full JSX build is the user's gate.

---

## 5. Build order (what's next)

| Phase | Build |
|---|---|
| **done** | Banner + lesson runner + Python lessons 1–5 (values, numbers, text, booleans, lists) + graduate hand-off. |
| **T1** | Author Python lessons 6–13 (dicts → functions) — the core fluency floor. Same gated way. |
| **T2** | Author Python lessons 14–18 (sort/key, Counter, rows, errors, review-write-a-solve). |
| **T3** | Author the pandas section (1–8) — lazy-load pandas/numpy wheels on first pandas task. |
| **continuous** | One light "runs vs right" seed at the end of relevant lessons → link into Gotchas/JUDGE (keep the moat DNA without overwhelming a beginner). |

To author a stub: replace the planned object with a full `{ concept, tasks[] }` lesson, verify every task in CPython (step 4), flip `status` to `'ready'`. It appears in the ladder automatically.

---

## 6. The moat note

What makes SQL Lab amazing is the **depth below the surface** (judgment layer, traps, verification) — not the tutorial banner. This ladder is the *welcome mat*; the gym is the *moat*. Ship both, but the "amazing" budget goes into the gym being unmissably deep. The ladder's only job is to make sure no beginner bounces before they reach it.

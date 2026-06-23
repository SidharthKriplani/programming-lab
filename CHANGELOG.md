# Changelog

All notable changes to the Production Systems Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [PL 0.9.0] - 2026-06-23 — Two new DO banks: Idioms + OOP (programming depth)

> Reframed back to PL's core — deep Python/coding fluency, not AI tooling. First pass of the "go deep on programming" plan.

### Added
- **DO — Python Idioms** (`idiomsProblems.js`): 20 drills — comprehensions, collections (Counter/defaultdict/deque), functional (sorted-key, any/all, reduce, itertools), context managers, decorators, unpacking, dunder. The fluent way to write Python. 80 checks verified.
- **DO — Python OOP** (`oopProblems.js`): 15 drills — classes, dataclasses (incl. frozen + the default_factory trap), properties + validation, inheritance vs composition, dunder methods (`__eq__`/`__hash__`/`__lt__`/`__add__`), classmethods/staticmethods. 60 checks verified.
- Both reuse the two-pane test runner + filterable browse; wired live in the DO accordion with counts.
- **Audit now gates the new banks** (idioms + oop in the extractor + bank loop). Allowlist gained the stdlib they need (contextlib/dataclasses/enum/typing/abc); blocklist tightened to the genuinely dangerous calls (`open`/`eval`/`exec`/`compile`/`__import__`) so a normal `setattr` in a property setter isn't a false positive.

### Notes
- DO is now **5 banks / 155 drills** (gotchas 23 + drills 56 + idioms 20 + oop 15 + pandas 41). esbuild green; audit 155 / 0 Tier-1.

## [PL 0.8.0] - 2026-06-23 — All four frames live: KNOW · DO · BUILD · JUDGE

> The lab was DO-only with SOON stubs. After a deep SQL Lab study, every Competence-Model frame now has real content.

### Added
- **JUDGE — Spot the Flaw** (`judgeProblems.js` + `JudgeBrowser`): 6 forensic cases — pandas/Python that *runs and returns a plausibly-wrong result* (merge fan-out, chained-indexing no-op, groupby dropping NaN keys, integer division, inner-merge row drop, `fillna(0)` on a string col). Run it → watch it lie → reveal flaw/impact/fix. All 6 broken+fixed outputs verified.
- **KNOW — Python & OOP Depth** (`knowModules.js` + `KnowBrowser`): 6 "how it actually works" explainers with a runnable demo + predict gate (names-are-bindings, lazy generators, mutable defaults, LEGB/closures, truthiness, the data model). All 6 demos verified.
- **BUILD — Mini-Projects** (`buildProjects.js` + `BuildBrowser`): 4 scaffolded projects / 12 steps (retention pipeline, metric guardrails, ETL clean, funnel) — a sequential stepper, each step checked by hidden tests, later steps calling earlier ones. 57 checks verified.
- **Shared `DebriefBlocks`** — the marker→collapsible colour-coded debrief renderer (PAL pattern), reused across all three frames.

### Notes
- All four frames wired live in the accordion nav (no more SOON). Built via three parallel agents, each self-verifying. esbuild green; audit 120 / 0 Tier-1. (Follow-up: extend the audit to gate the judge/know/build runnable code too.)

## [PL 0.7.0] - 2026-06-23 — Two-pane solve UI + browse table (SQL-Lab parity)

> The drills were a bare single column. Rebuilt the whole solving experience to match PAL's SQL Lab.

### Added
- **Two-pane `ProblemRunner`** — left: prompt + a **DATA panel** (the example input, rendered as a table) + an **EXPECTED OUTPUT panel computed live from the canonical solution** (PAL's trick — never hand-maintained) + an elapsed timer + past-attempts; right: editor + **Run** (scratch) + **Submit** (hidden tests) with per-check pass/fail and targeted "compare to the expected output" feedback.
- **`previewExample()` runtime** — runs the example setup + solution in Pyodide and serializes DataFrames / Series / scalars for the panels (seeds `pd`/`np`).
- **Filterable `ProblemBrowser` table** — progress bar (X/N solved), search, difficulty filters (Warmup/Core/Stretch), solved/unsolved filter, dense `Level · Problem · Topic` rows.
- **`example` field** ({setup, call, inputs}) on all 97 drills, powering the panels — every one verified.

### Fixed
- The python bank now loads numpy (the numpy-ml drills import it — was a latent runtime failure).

### Notes
- esbuild green; audit 120 problems / 0 Tier-1; `previewExample` verified on pandas / python / numpy samples.

## [PL 0.6.0] - 2026-06-23 — Committed audit gate + content standard (SQL-Lab alignment)

> Studied how PAL's SQL Lab is built and adopted its rigor: a committed quality gate + a frozen content standard.

### Added
- **`scripts/audit_problems.py`** — the committed quality gate (Python analog of PAL's `audit_sql_lab.py`). **Tier-1 blocks commit:** runs every test-based solution + `__pl_checks`, re-runs every gotcha `code`/`fix` and diffs the declared output, checks required-fields / unique-id / pattern-membership, and runs an **AST safety sandbox** (allow-list imports + blocked builtins — the Python analog of the SQL `DROP/DELETE` keyword ban). **Tier-2 warns** (missing hints, thin lesson, dup title/solution). `scripts/_extract_problems.mjs` dumps the banks to JSON.
- **`docs/CONTENT-STANDARD.md`** — the pedagogical + mechanical bar the audit enforces (mirrors PAL's SQL-CONTENT-STANDARD), plus the schema roadmap (shared fixtures, forensic/`beforeWriting`, hints/debrief) and what deliberately does NOT carry from sql.js.
- `CLAUDE.md` pre-commit discipline: run the audit, 0 Tier-1 before commit.

### Result
- **Audit on the full bank: 120 problems, 0 Tier-1 failures.** 97 Tier-2 hint warnings = the next content pass.

## [PL 0.5.0] - 2026-06-23 — Banks at interview scope: 56 Python + 41 pandas

> Researched what senior SWE/DS/MLE/DA/BA/PA/AIE are expected to code, then expanded both banks to interview scope.

### Added
- **Python Drills → 56** across 11 patterns: hashing, two-pointers, sliding-window, prefix-sum, stack, binary-search, heap/top-K, intervals, greedy, **numpy-ml** (RMSE, min-max normalize, accuracy, cosine similarity, one-hot, softmax — for the DS/MLE audience), recursion.
- **pandas → 41** across 10 patterns: groupby (+rank / top-N-per-group, transform, named-agg, share-of-total), merge (+anti-join, indicator, concat), reshape (melt / crosstab / stack-unstack), window (rolling / diff / cumsum / pct_change / resample), missing data, selection / query / nlargest, metrics / safe-rates, dedup / rank, datetime.

### Notes
- **120 problems total** (23 gotchas + 56 Python + 41 pandas). Every solution + test **independently re-verified** out of the built JS in CPython + pandas 2.3 — **337 checks, 100% pass**. Authored original; the interview canon used only as a pattern taxonomy (moat). esbuild green. Pyodide ships pandas ~2.0/2.1; the APIs used are stable across pandas 1.5–2.3 — confirm on the live deploy.

## [PL 0.4.0] - 2026-06-23 — Python Drills + pandas banks (test-based)

> First coding content beyond Bank A: drills you implement and run against hidden tests, in real Python and pandas.

### Added
- **Test-based problem runner** — `runProblem()` in the Pyodide runtime runs your solution + a hidden `__pl_checks` harness, returning per-check pass/fail + glass-box time/memory. `loadPackages()` lazy-loads the pandas/numpy wheels on the first pandas problem. New `ProblemRunner` + generic `ProblemBrowser` (read prompt → write function → Run tests → reveal model solution).
- **Bank C (first slice) — Python Drills** (`src/data/pythonProblems.js`): 6 famous problems by pattern (hashing, sliding window, stack, prefix sum) — first-unique, two-sum, anagram, longest-unique-run, balanced-brackets, first-day-over-target. Original, analyst-framed.
- **Bank D (first slice) — pandas / numpy** (`src/data/pandasProblems.js`): 5 analyst ops — revenue-by-category (groupby), new-user AOV (filter-before-aggregate), no-fanout merge, month×category pivot, vectorized tiering (np.where).
- DO nav gains two live banks (in the accordion); `problemProgress.js` (per-bank localStorage); `PythonCell` gains `onCodeChange`; `Icon` gains `x`.

### Notes
- 11 problems, **38/38 checks verified** in CPython + pandas 2.3 before shipping. esbuild bundle green (main ~139kb). pandas wheel loads on demand in-browser. Sourcing: original problems, the interview canon used as taxonomy only (moat).

## [PL 0.3.0] - 2026-06-23 — BreakLabs logo (D-19)

> The unified BreakLabs lockup lands. `break⌇labs · Programming` — one brand, distinct rooms.

### Added
- **`BrandMark` component** (`src/components/shared/BrandMark.jsx`) per `HQ/BRANDMARK-ROLLOUT.md` (D-19). Three variants (full / wordmark / monogram). Constant across all labs: the red fault-glyph seam + the `break⌇labs` wordmark. Per-lab: descriptor `Programming` + violet `#8B5CF6` accent.
- Wired into **7 slots**: sidebar header (full), favicon (shared red monogram), OG share card, hero (wordmark), gate header (wordmark), footer (wordmark + "part of BreakLabs"), loading (monogram).
- **OG share card** — `public/og-image.png` (1200×630, the instrument card + lockup) + `og:`/`twitter:` meta in `index.html`.
- **Sidebar Standard nav** — rebuilt the left nav to the HQ four-frame accordion spec (`DESIGN-STANDARD.md`): KNOW/DO/BUILD/JUDGE as collapsible accordions, one-open-per-level, measured-height animation (`scrollHeight`, 0.30s ease-out), chevrons, a flat TRACK row (Home), follows-navigation auto-expand, `aria-expanded`/`aria-current`. Module-scoped `Collapsible`/`Chevron`/`NavItem`. Kept PL's SOON badges + violet active pill.

### Changed
- Favicon is now the shared BreakLabs red glyph (was the violet PL stopgap — archived to `_legacy/`, D-18).

## [PL 0.2.0] - 2026-06-23 — Instrument identity + dark/light

> PL stops wearing PAL's skin and takes its own. Direction: **Instrument** (the BreakLabs "dark glass-box that exposes the machine"), the most on-brand and most distinct of three proposed.

### Added
- **Instrument theme (dark-first):** void `#0A0A0B` base, panel surfaces, **violet `#8B5CF6`** accent (PL's assigned BreakLabs track colour), with the master semantics — gold `#F2B233` = signal, red `#FB5247` = break, green `#19C37D` = fix. Type switched to **Inter + JetBrains Mono** (the brand's display + voice).
- **Light "Field Notes" mode:** warm paper `#F4F1EA` + ink, violet kept. Toggled via `[data-theme]` on `<html>` (the sibling-lab mechanism), saved to `localStorage`, with an inline anti-flash script in `index.html`. Toggle (sun/moon) lives in the sidebar footer.
- **break-glyph identity:** `public/favicon.svg` (fault-glyph monogram, violet + gold) replacing the 404; the `break⌇labs` wordmark + fault-glyph mark in the sidebar.
- New `src/utils/theme.js`; `sun`/`moon` added to `Icon.jsx`.

### Notes
- Token swap only — no component rewrites. esbuild bundle verified (exit 0). Build/deploy on push (Vercel connected).

## [PL 0.1.0] - 2026-06-23 — Re-scope to Programming Lab + B0/B1

> Lab re-scoped from **Production Systems Lab** (infra ops) to **Programming Lab (PL)** — the SWE-for-data fluency lab (HQ D-07/D-15). The Dec-2024 infra modules below are archived in `_legacy/`. From here, this changelog tracks PL.

### Added
- **B0 — SPA foundation:** React + Vite + Pyodide app, sibling-consistent with PAL/MSL/GAL. Theme = PAL `index.css` tokens + `.pal-*` animation classes. Sidebar (KNOW/DO/BUILD/JUDGE), Icon, HowToStrip, ForwardPointerCard, GateOverlay (beta passthrough), unlock.
- **MVP IDE + glass-box:** `PythonCell` — CodeMirror 6 editor running real CPython via Pyodide 0.25.1. Glass-box built in immediately: stdout + wall time (`perf_counter`) + peak memory (`tracemalloc`), plus a `raceMethods()` helper for the future DSA canonical-vs-brute race.
- **B1 — Bank A (Python Gotchas):** 23 problems, 7 clusters. Each is predict-MCQ → runnable code → glass-box reveal → runnable fix → "Copy as LinkedIn post". Seeded by PY1–PY7; 16 newly authored. Every snippet verified in CPython.
- **Pages:** `GotchaBrowser` (cluster-grouped, mobile-safe grid) + `GotchaRunner`; `App` lazy-routes home ↔ gotchas.

### Changed
- Archived legacy infra (FastAPI/Docker/`modules`/`api`/`frontend`) to `_legacy/`.

### Notes
- Not yet `npm install`/`vite build`'d (macOS-only). Repo slug rename deferred. Pyodide currently main-thread (per MSL) — worker move flagged.

## [Unreleased — legacy infra, superseded]

### Planned
- Module 3: Observability & Monitoring
- Module 4: Deployment & Infrastructure
- Module 5: Building for Scale
- Module 6: Real-World Systems

---

## [0.2.0] - 2024-12-27

### Added - Module 2: Databases & Performance
- **Main application** (`app.py`)
  - SQLite database with async queries
  - User and Post tables with proper schema
  - Endpoints demonstrating N+1 problem vs optimized joins
  - `/comparison/slow` endpoint (N+1 problem)
  - `/comparison/fast` endpoint (optimized join)
  - `/seed` endpoint for test data
  - Connection management with async

- **Module 2 README**
  - Database design principles
  - Query optimization strategies
  - Index design and impact
  - Connection pooling concepts
  - Performance testing patterns

- **Exercise 1: Schema Design**
  - Bad vs good schema comparison
  - Relationships and foreign keys
  - Index impact on performance
  - Composite indexes

- **Dependencies**
  - Added `aiosqlite` for async SQLite

### Key Features
- ✅ Real performance comparison (N+1 vs JOIN)
- ✅ SQLite for zero-setup database
- ✅ Proper schema design with constraints
- ✅ Index strategy demonstrations
- ✅ Seed data for experimentation

### Architecture
```
Module 1: Async APIs          → Why async matters
    ↓
Module 2: Databases           → What you're making async calls to
    ↓
Module 3: Observability       → Monitor what's happening
    ↓
Module 4: Deployment          → Ship to production
    ↓
Module 5: Scaling             → Handle 10,000s of requests
    ↓
Module 6: Real-World Systems  → Put it all together
```

---

## [0.1.0] - 2024-12-27

### Added
- **Initial Project Setup**
  - Project structure and organization
  - Virtual environment configuration
  - Development dependencies

- **Module 1: Async APIs & Concurrency**
  - Comprehensive README explaining async/await
  - Main application demonstrating sync vs async
  - Exercise 1: Basic async concepts (5 examples)
  - Test suite with pytest
  - Makefile with common commands
  - Docker Compose for local services

- **Documentation**
  - Root README with 6-module learning path
  - QUICKSTART guide
  - Project structure docs

- **Configuration**
  - `.gitignore`, `.env.example`, `requirements.txt`

---

## Development Notes

### Session 1: Module 1 (Dec 27)
- Created comprehensive project scaffolding
- Module 1 fully implemented
- Educational focus over production optimization

### Session 2: Module 2 (Dec 27)
- Built Module 2 with real database examples
- Demonstrated N+1 problem vs optimized queries
- Added performance comparison endpoints
- Created Exercise 1 on schema design
- Switched from Vercel to local development

### Next Steps
- Get feedback on Module 1-2
- Implement Exercises 2-5 for Module 2
- Plan Module 3 (Observability)
- Deploy to Railway or similar when ecosystem is complete

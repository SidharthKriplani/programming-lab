# Changelog

All notable changes to the Production Systems Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [PL 0.20.0] - 2026-06-24 — PyLab Phase 1: role × seniority axis + readiness dashboard

> Architected PyLab from market research — `docs/PYLAB-VISION.md`. The gap every interview tests, every role, every level, is "runs vs right." Phase 1 makes the bank legible on that axis.

### Added
- **Two-axis tagging** (`src/data/pyLabMeta.js`) — every problem gets `roles[]` (SWE/DS/MLE/AIE/DA/BA/PA) + a seniority `level` (fluency → correctness → judgment → systems), derived from topic + difficulty + the judgment layer (override-able per problem).
- **Role + level filters** in PyLab — pick a track and a depth; the bank re-weights.
- **Readiness dashboard** (`PyLabReadiness`) — per chosen role: progress across the four levels, the weakest topic, and a recommended "work next" level (the lightweight diagnostic — reads your solved distribution and tells you where you stand).
- Cards show the level; the seniority axis replaces the raw difficulty chips.
- **`docs/PYLAB-VISION.md`** — the full architecture: the two-axis map, the 9 formats (Predict/Solve/Forensic + Refactor/Code-review/Ambiguity-drill/Scale-it/Follow-up/Mock-loop/Take-home/Explain-it), the differentiators, positioning, and the phased roadmap.

### Notes
- Derived spread (136): roles MLE/AIE 131 · DS 121 · SWE 86 · DA 63 · PA 43 · BA 29; levels judgment 98 · fluency 20 · correctness 18 (systems content arrives with Scale-it/Take-home, Phase 2-4). esbuild clean.

### Next (vision roadmap)
- Phase 2 — the showcase formats: **Scale-it race**, **Ambiguity drill**, **Refactor**.

## [PL 0.19.0] - 2026-06-24 — PyLab consolidated: drills + idioms + OOP folded in (136 problems)

> "if pylab is there then pandas numpy oops python drills all should be inside it." Done — migrated the remaining 91 (56 drills + 20 idioms + 15 OOP) onto the PyLab contract in five parallel gated batches. PyLab is now the single DO bank for pandas/numpy + Python.

### Changed
- **91 more problems migrated** into PyLab: **Python Drills (56)** → `python-core` / `numpy-vectorize`; **Idioms (20)**; **OOP (15)** via a self-contained-`solve()` reframe (user writes the class, a fixed driver returns observable output, value-compared). With pandas (41) + seed (4), **PyLab = 136 problems**, **98 carry a judgment layer** (a verified runs-but-wrong trap each — off-by-one bounds, `<=` vs `<`, softmax overflow, shared mutable default, `__eq__` without `__hash__`, …); the rest honest empty dials.
- **Standalone Python Drills / Idioms / OOP rooms removed** from the nav and the Progress registry (`banks.js`). One DO bank now; **Gotchas stays its own predict→reveal room** (different format).
- Topics: python-core 51 · idioms 20 · oop 15 · pandas (groupby 19, window 14, merge 5, reshape 5) · numpy-vectorize 7.

### Verified
- Full-set gates green: `audit_py` 136 / Tier-1 0, `verify_py_methods` 136 / 98 multi-method / **0 failures**, `py_content_scan` 0. Every solution, method and trap executed in real pandas/numpy 2.x. The gates caught a cross-batch `fx_tags` fixture-key collision (renamed) and two leftover jargon prompts — exactly their job.

### Next
- New problems beyond the migrated set (deeper footgun/judgment); `beforeWriting`/study-plan/`alsoAskedAt` surfaces; cleanup pass to retire the now-dead old bank data files + routes.

## [PL 0.18.0] - 2026-06-24 — pandas folds into PyLab: 41 problems migrated, gated, verified

> Sidharth: "if pylab is there then pandas numpy oops python drills all should be inside it." Started the consolidation — migrated all 41 pandas problems onto the PyLab contract in four parallel gated subagent batches (PAL's method), then removed the standalone pandas/numpy room.

### Changed
- **41 pandas problems migrated** into PyLab — `solve(...)→output` + engineered fixtures + de-jargoned prompts + ≥2 hints + executed debriefs. Batches: groupby+vectorize (9), merge+reshape (10), window+missing (9), selection/metrics/dedup/datetime (13). **33 carry a real judgment layer** (multi-method + a verified runs-but-wrong trap: merge fan-out, dropna, chained-assignment no-op, global-vs-group denominator, unsorted-window, inclusive-vs-half-open boundary, …); genuinely single-method ones ship honest empty dials.
- PyLab is now **45 problems** (4 seed + 41 pandas), wired via `pyLabBatch_*.js` merged into `pyLabProblems.js` / `pyLabFixtures.js`.
- **Standalone "pandas / numpy" room removed** from the nav and the Progress registry (`banks.js`) — it lives inside PyLab now.

### Verified
- Full-set gates green: `audit_py` 45 / Tier-1 0, `verify_py_methods` 45 / 33 multi-method / **0 failures** (every non-trap == solution, every trap runs-and-diverges), `py_content_scan` 0. Every solution, method and trap executed in real pandas 2.3.3. esbuild + the import chain clean.

### Next
- Same migration for **Python Drills (56), Idioms (20), OOP (15)** → each folds into PyLab as it lands. Gotchas stays its own predict→reveal format.

## [PL 0.17.0] - 2026-06-24 — PyLab foundation: comparator + four gates + runtime + judgment layer (CPython-verified)

> Implements the SQL-Lab → PyLab handoff (`docs/PYLAB-HANDOFF.md` + `PYLAB-BUILD-SPEC.md`, approved). The depth systems, not a runner lookalike. PyLab = the single entry for pandas/numpy AND Python. Built foundation-first ("no content ships ungated").

### Added
- **Comparison contract** — `scripts/pl_compare.py` (mirrored as `PL_COMPARE_SRC` in the runtime): `solve(...)→output` graded by a typed comparator (`assert_frame_equal` / `assert_series_equal` / `allclose` / `isclose` / value), explicit dtype/index/column-order/NaN. Unifies pandas + Python.
- **Four committed gates** + extractor: `audit_py.py` (Tier-1 blocks — every solution runs + AST sandbox), `verify_py_methods.py` (non-trap methods == solution, traps **run-and-diverge**, canonicalMethodId + MCQ-id integrity), `py_content_scan.mjs` (jargon-in-prompt, hints, debrief), `run_py.py` (`--diverge` authoring tool), `_extract_pylab.mjs`.
- **Engineered fixtures** (`pyLabFixtures.js`) + a **4-problem proving seed** (`pyLabProblems.js`): warmup single-method (empty dial), a core multi-method judgment problem (transform vs merge-back + a global-total trap), a `dropna` footgun, a python-core value-compare. **Every solution, method and trap executed in real pandas — all gates green (Tier-1 0, method-verify 0, content-scan 0).**
- **Runtime** `runPyLab` (Pyodide) — runs the fixture, runs canonical + user `solve`, grades via `pl_compare`; glass-box timed.
- **JUDGE surface** `JudgmentLayer.jsx` — method cards (Reference / red Trap·runs-wrong badges), the which-method-when dial, interactive MCQs; renders only when ≥2 methods (honesty rule).
- **PyLab room** `PyLabBrowser.jsx` (filter by topic/difficulty/search → solve → Submit graded → Reveal → debrief → JudgmentLayer), wired into DO nav as the pandas/numpy + Python entry.

### Notes
- Foundation + proving seed; the fluency / footgun / judgment **banks** are authored on top in gated subagent batches (`PYLAB-BUILD-SPEC` §10). UI is esbuild-clean but not runtime-tested in-sandbox (no Pyodide/Vite there) — the content + gates + comparator are CPython-verified, which is the part that earns trust.

## [PL 0.16.1] - 2026-06-23 — Platinum legibility + cleanup

> The cdnfonts "Chicago" loaded as an illegible display face (and I'd wrongly put it on body text). Fixed, plus two cleanups Sidharth called.

### Changed
- **Font → Geneva** (fallback Helvetica Neue) across Platinum — the actual classic-Mac UI sans, legible, native on Mac. The bad Chicago import is removed.
- **Menu bar trimmed** — dropped File / Edit / View / Run / Special; the bar is now just the rainbow Apple, "Programming Lab", and the clock.
- **Nav symbols removed in Platinum only** — the left-nav is text-only under Platinum (`noIcons` gate); other skins keep their icons. Chevrons stay (they're the accordion control).
- **Menu-bar corner glyph → BreakLabs seam** (not Apple's apple — trademark). The classic top-left "system" corner is now the red `⌇` mark.
- **Darkened the greys** — window + sidebar from a faint `#c6c6c6` to a real medium gray `#a6a6a6`, desktop deepened to `#566e6c`. White cards now pop against actual gray instead of washing out.

## [PL 0.16.0] - 2026-06-23 — Real Platinum: white panes, Chicago, no rails + one light/dark toggle

> Sidharth on the deployed Platinum: greys too faint, side rails hated, and rightly — "you were told to supersede our constraints with *real* Platinum and you token-swapped instead." Rebuilt to the actual thing.

### Changed
- **Real-Platinum contrast** — content cards are now **white** on a gray (`#c6c6c6`) window frame, crisp black 1px borders + hard mini-drop shadows; the sidebar and main window are the gray chrome. Fixes the washed-out faint greys (the cards now read as panels on a window).
- **Side rails removed** — stripped the colored 3px `borderLeft` accent from **all 16** panels/cards/debriefs across 9 files (only the sidebar's structural nav indent kept). Flat, fully-bordered.
- **Chicago font** — the classic Mac system typeface (loaded via cdnfonts) now drives the Platinum UI, Charcoal/Geneva fallback. (approved)
- **One light/dark toggle** — the footer button swaps **light = Platinum ⇄ dark = green-screen** (single sun/moon icon). The old warm casefile light mode is **retired**; Platinum is the only light mode (D-PL-19 refined, Sidharth's call).

### Notes
- Dark mode reframed (brainstorm, mockup shown, not yet built): **dark = Mac OS X Aqua terminal + ambient Matrix rain** (green demoted to the terminal *content*; rain dim behind work, full-bright only on load/reveal/idle). Two Apple eras: light = classic Mac, dark = OS X. That's the next unit.
- esbuild-clean on all changed files; Chicago import + white panes + zero rails verified. Still no live preview in-sandbox — expect to tune once seen.

## [PL 0.15.0] - 2026-06-23 — Pluggable SKIN system + Platinum (classic Mac) skin

> Sidharth (and a friend) on the mockups: make the whole app a classic-Mac **Platinum** workstation — Apple menu bar, rainbow apple, beveled gray — and *"make it switchable so changing it won't take a heavy build again."* Built the skin system first, then Platinum as the first skin. Platinum is now the active look; green-screen becomes a skin (it'll live inside terminal windows next).

### Added
- **Pluggable skin system** (`src/utils/skin.js`, `[data-skin]` on `<html>`, anti-flash in `index.html`) — a skin is the whole visual world, swapped in one line (`setSkin`). Skins: `platinum` (default), `greenscreen` (the CRT terminal), `aqua` + `hybrid` (reserved). Token blocks scoped to `:root[data-skin='…']`; the active skin's block (appended last) overrides. A skin never touches content/logic. Governing spec: `docs/SKIN-SYSTEM.md` (D-PL-19).
- **Platinum skin** — classic Mac OS 8/9: teal-gray desktop, Platinum gray beveled windows, 1px black borders, Helvetica/Geneva, classic light-blue selection, sharp radii. **Apple menu bar** (`PlatinumMenuBar`) fixed at top with the rainbow Apple logo, app menus, and a live clock. CRT scanlines/glow suppressed under Platinum.
- **Skin-cycle button** in the sidebar footer (platinum ⇄ greenscreen) — proves the plug works.

### Notes
- Platinum **supersedes the green-screen as the active look** (D-PL-18 green-screen is now a skin, not the default).
- Built without a live preview (sandbox can't run Vite) — esbuild-clean on all six changed files; expect to tune the Platinum look once it's live (cheap — it's one token block). The literal Finder-window-with-`.py`-files + terminal-on-open is the **next unit**.

## [PL 0.14.0] - 2026-06-23 — Green-screen, finalized: Courier Prime, all-green on black, no decoration

> Aligned with Sidharth on the specifics *before* this build (after two builds drifted from the approved render): the live VT323 was ugly, white lettering had crept back, cards still carried highlight decoration. Locked: Courier Prime · all text phosphor green · pure-black background · no card highlights.

### Changed — dark mode only (shared light mode untouched)
- **Font → Courier Prime** (teletype/typewriter lineage). The render's JetBrains Mono and the shipped VT323 are both retired. Governs the whole dark UI.
- **All text phosphor green, zero white** — body `#4FE08C`, bright headings `#7FF5B0` (forced). The greenish-white body color is gone.
- **Pure-black background** (`--bg #000000`); surfaces are faint green-black.
- **No card decoration** — removed the colored top-accent bar from all four card browsers (KNOW / Gotchas / Judge / Build) and neutralized the hover lift/shadow/glow. Flat green-hairline boxes only.
- `docs/GREEN-SCREEN-IDENTITY.md` updated to match (font, palette, new law #7 "no decoration").

### Notes
- Process correction: font picked from rendered samples and green-text + no-decoration confirmed *before* executing. esbuild clean on all four browsers; Courier Prime wired, VT323 / white / top-bars verified gone.

## [PL 0.13.0] - 2026-06-23 — Green-screen, governed: pure green+black, terminal font, contrast fix

> Sidharth, on the 0.12.0 deploy: the color's right but it's not actually old-school yet — a bright green can't carry white lettering, a curved sans font kills the nostalgia, and a monochrome tube has only green + black. "Write the entire design idea down so everything is governed by it." Done.

### Added
- **`docs/GREEN-SCREEN-IDENTITY.md`** — the governing visual spec for PL (the authority; cited by D-PL-18). Laws, the green-only palette + tiers, the terminal-font rule, the CRT treatment, component patterns, do/don'ts, code map, open items. Any PL visual change is checked against this file.

### Changed — dark mode only (shared light "Field Notes" mode untouched)
- **Pure green + black** — every remaining non-green hue (red/amber/teal/purple/blue + the warm/teal gradients) collapsed to green brightness tiers. Meaning is now carried by brightness, glyphs (`✓ ✗ ! →`) and inverse video, never by hue — a real P1 monochrome tube. (break/wrong = dim/off green, not red.)
- **Terminal font** — loaded **VT323** (DEC VT320-style bitmap, no curved lettering) and set it as `--font-ui` + `--font-mono` for the whole dark UI — headings, body, nav, code. Light mode restores the shared Inter/JetBrains family.
- **Contrast fix** — no more white lettering on green: `.pal-btn-primary` / `.pal-badge-accent` / `.btn-run` carry dark phosphor ink (`--on-accent`) in dark mode, and all four white CTA icons (Home, Continue, both Submits) now use `currentColor`.

### Notes
- Verified: esbuild transform of all six changed files, VT323 wired (import + both tokens), zero non-green values left in the dark block, white-on-green eliminated, light-mode font restored.

## [PL 0.12.0] - 2026-06-23 — Green-screen identity (the old-school CRT dark mode)

> Sidharth: PL needs its own single defining color like PAL's blue — old-school, the base layer everything boots from — and that color *is* its dark mode (light mode is shared across the family). Researched the old-school monochrome phosphors (P1 green / P3 amber / P4 white); amber is already MSL, so PL's authentic slot is the **green screen**. The earlier violet "Instrument" pick is retired (supersedes D-PL-04).

### Changed — dark mode only (shared light "Field Notes" mode untouched)
- **Phosphor-green token swap** — the governing dark block retargeted from violet to P1 phosphor green: near-black green-tinted void (`#060A07`), soft greenish-white body text (`#D6E4D8`, kept readable), green accent (`#46E08A`) + green hairline borders throughout. Palette logic is the predict→break→fix loop in CRT colors: green = baseline/OK, red = break, amber = signal. Cluster hues folded into the green family for a monochrome read.
- **CRT treatment layer** (`index.css`) — a full-screen scanline + vignette overlay (mounted once in `App.jsx`, dark-only, `pointer-events:none`), subtle phosphor text-glow on headings, plus reusable `pl-panel` (box-drawing legend panel) and `pl-hud` (Star-Trek-style status readout) utilities.
- **Inverse-video active nav** — the TUI-installer highlight: active sidebar item is solid green with dark ink (icon + label + count follow via `currentColor`). Light mode keeps the pill.
- **Glass-box footer → HUD** — the run readout is now a labeled `status · runtime · peak mem` strip (emoji-free, `glassBoxParts`), styled like the references.
- `BrandMark` PL descriptor accent → green; the red seam stays (cross-lab brand constant, HQ D-19).

### Notes
- Verified: esbuild transform of App/Sidebar/PythonCell, `node --check` glassbox, zero violet left in `index.css`, light-mode tokens intact.

## [PL 0.11.0] - 2026-06-23 — KNOW becomes Foundations-grade (leveled MCQ + Senior Read)

> Sidharth: "look at the foundations of PAL - I want Python KNOW to be similar." Studied PAL's richest *data-driven* concept room - the **Stats Room** (`statsModules.js` + `StatsRunner`), not the literal "Foundations" rooms (those are hardcoded-per-module JSX that doesn't scale) - and ported its judgment + depth layer onto KNOW, keeping PL's signature runnable demo.

### Added
- **Leveled predict MCQ** - every KNOW `predict` converts from a bare correct-index to options carrying `level` (`strong`/`partial`/`wrong`) + per-option `feedback`. Picking now teaches *why* that option is strong/partial/wrong (the Stats-Room payoff), colour-coded teal/yellow/red. **20 strong · 6 partial · 34 wrong** across the bank.
- **Senior Read panel** (`src/components/shared/SeniorRead.jsx`) - a four-card debrief in every reveal: **Short answer** (the verdict), **Why** (the mechanism, pre-wrap multi-paragraph), **Common mistake** (the trap + interviewer follow-up, with **bold** spans), **Say it like this** (the quotable first-person interview line), plus "practice next" room links. Ported from PAL's `StatsConceptPanel`, themed to Instrument.
- All 20 KNOW modules authored with `seniorRead` + `isFree: true`.

### Notes
- `KnowRunner` reads **both** the new leveled shape and the legacy `answerIndex` (`normalizePredict` - back-compatible, nothing broke mid-migration).
- Verified: `node --check`, apostrophe audit, esbuild transform of `SeniorRead.jsx` + `KnowBrowser.jsx`, and a diff proving **demoCode/demoOutput/explain/mentalModel byte-identical** to the pre-migration snapshot. Item count unchanged (185); KNOW *depth* materially up.

## [PL 0.10.0] - 2026-06-23 — Progress dashboard + deeper KNOW

> Added the TRACK-level "flow" (a Progress room, like PAL) and made KNOW the rich room it should be.

### Added
- **Progress dashboard** (`ProgressPage` + `src/data/banks.js` registry) — total completion across all rooms, continue-where-you-left-off, and readiness-by-bank bars grouped by the four frames. New **TRACK** nav item.
- **KNOW deepened 6 → 20** — Python-internals explainers: identity vs equality + int/intern caches, truthiness (`__bool__`/`__len__`), operator dispatch (the data model), `*args`/`**kwargs` binding, decorators from scratch + `functools.wraps`, the iterator + context-manager protocols, the `__eq__`/`__hash__` contract, what `@dataclass` generates, properties/descriptors, EAFP vs LBYL, "hints don't enforce at runtime", modules run once. Every demo verified **deterministic for Pyodide** (no `getsizeof`/`id`/`hash`/set-order outputs that would differ in-browser).

### Notes
- **185 items across 8 banks** (KNOW 20 · DO 155 · BUILD 4 · JUDGE 6). esbuild green; audit 155 / 0 Tier-1.

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

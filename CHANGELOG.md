# Changelog

All notable changes to the Production Systems Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [PL 0.36.0] - 2026-06-24 — Planned skeletons surfaced as "coming soon" cards in PyLab

> The 0.35 skeletons were a registry only; now they're visible. The PyLab grid shows a **"Planned · coming soon"** section under the live problems — the roadmap is on-screen.

### Added
- **Planned cards in PyLab** (`PyLabBrowser` now imports `pyLabPlanned`) — the 11 stubs render as **greyed, dashed, non-clickable** cards (PLANNED badge + curriculum category + title + seed + topic/level tags) in a "Planned · coming soon" section below the real grid. They respect the topic/level/search filters and hide in review mode.
- **Display-only, not in the bank** — `pyLabPlanned` is rendered but never added to `pyLabProblems`, so gates, readiness, grading and the solved count are untouched (verified: 0 stubs leaked into the real bank).

### Verified
- esbuild clean (PyLabBrowser); full import-graph bundle exit 0; 0 planned stubs in the real bank.

### Next
- Phase 4 = author the stubs (flip greyed → real), gated, per `docs/PYLAB-CURRICULUM.md`.

## [PL 0.35.0] - 2026-06-24 — PyLab curriculum coverage audit + planned skeletons (no build impact)

> "do we have all of this covered?" — audited PyLab against PAL's PythonLab "Planned curriculum" (6 categories / 25 items), grep-verified against the live bank. **14 covered · 4 partial · 7 planned.** Skeletons stubbed for the gaps.

### Added
- **`src/data/pyLabPlanned.js`** (UNIMPORTED — zero build/gate impact, like `foundationsRooms.js`): `pyLabCurriculum` (the 25-item map, each `covered|partial|planned` + evidence) + `pyLabPlanned` (11 authoring stubs, each `{id,title,topic,level,curriculum,seed}` — the `seed` names the intended trap so authoring starts from the lesson).
- **`docs/PYLAB-CURRICULUM.md`** — the coverage table + the gated "author-one-later" recipe.

### Findings
- Solid: all atomic pandas / time-series / array ops + the **entire Interview Patterns row** (PyLab's differentiator — Ambiguity drill, trap system / Trap Museum, schema row-count validation, judgment dial). Gaps cluster into **Stats methods** (percentile, weighted avg, bootstrap) + **End-to-End tasks** (funnel, retention matrix, cohort LTV, cleaning pipeline, user classification). **5 of 11 stubs are systems-tier** → authoring them fills PyLab's currently-empty systems level (= Phase-4 take-home content).

### Verified
- `node --check` clean; confirmed **unimported** (no build impact); 25 items (14/4/7), 11 stubs (systems 5 · correctness 3 · judgment 2 · fluency 1).

### Next
- Phase 4 = author the systems-tier stubs (the End-to-End / take-home cluster) + the Stats sub-bank, gated.

## [PL 0.34.0] - 2026-06-24 — PyLab opens as its own full-screen room + "p" shortcut

> Sidharth: make PyLab open in its own frame like SQL Lab does in PAL (away from the app chrome), and add a "p" shortcut.

### Added
- **PyLab is now a full-screen room** — opening it **drops the app sidebar** (the Platinum menu bar stays as OS chrome) and PyLab fills the screen with its own top bar: **← Back · PyLab · N / 136 solved · Mock interview**. Mirrors SQL Lab taking over PAL. `App.jsx` renders `view==='pylab'` as a dedicated sidebar-less layout; `PyLabBrowser` gains an `onExitRoom` prop that swaps its page header for the room bar (and shows live solved/total).
- **Global `p` shortcut → PyLab** — guarded so it never fires while typing in an input/textarea/select or the **CodeMirror contenteditable**. PL's first single-key shortcut; the guard is built in from the start (the exact bug PAL hit when it added single-key shortcuts after the editor swap).

### Verified
- esbuild clean (App, PyLabBrowser); **full import-graph bundle exit 0**; `isContentEditable` guard + the full-screen branch + `onExitRoom` wiring all confirmed.

### Next
- Deploy 0.33 + 0.34. Then Phase 4. (Watch-item: confirm the 0.33 editor-lettering fix reads cleanly live.)

## [PL 0.33.0] - 2026-06-24 — Editor lettering visibility (active-line tint + comment/gutter contrast)

> **0.22–0.32 deployed live** (confirmed on programming-lab.vercel.app: two-pane solve view, schema panel, shape-only target, Graphite — all on). Follow-up to a visibility nit: the editor's active-line band fought the comment text on it, and comments/gutter ran low-contrast in both themes.

### Changed
- **`.cm-activeLine`** is now a faint neutral tint (new `--cm-active`: `rgba(0,0,0,0.05)` light / `rgba(255,255,255,0.06)` graphite) instead of the solid `--accent-bg` band — text on the active line stays readable.
- **Comment contrast bumped** (`--cm-comment`: light `#7a7a7a`→`#5f5f5f`, graphite `#7f848e`→`#99a0ac`); **gutter line numbers** `--text-dim`→`--text-muted`; **cursor** widened to 2px in `--text`.

### Verified
- esbuild clean (PythonCell); CSS brace-balanced; `--cm-active` defined in both theme blocks. Editor surface only — no data/logic touched.

### Next
- Confirm lettering on next deploy; if specific text is still dim, pinpoint it (screenshot). Then Phase 4.

## [PL 0.32.0] - 2026-06-24 — PyLab Phase 3 complete: Follow-up chains

> A real interviewer doesn't stop when your code works — they escalate. The last Phase-3 surface; Phase 3 done.

### Added
- **Follow-up chains** (`src/components/shared/FollowUpChain.jsx` + `src/data/pyLabFollowups.js`) — in the reveal, the interviewer's escalating next questions unfold one at a time: read the ask → think → reveal the model answer → the next ask appears. Reveal-only (it's the discussion after a solve). **28 chains / 73 escalating follow-ups** across groupby/window/merge/dedup/rank/vectorize/metrics/idioms, decoupled file keyed by id (bank untouched), self-hides when a problem has no honest escalation.

### Verified
- esbuild clean (FollowUpChain, PyLabBrowser); `pyLabFollowups.js` node-check + id-integrity (28 chains, 0 unknown ids); **full import-graph bundle exit 0**. The subagent verified every code-bearing model answer in CPython (idxmax tie behaviour, rank dense/min/first, resample bucketing, softmax overflow, `merge(validate=)`, safe-ctr `np.where`, …) and rejected ~12 problems with no honest escalation rather than padding.

### Milestone — PyLab Phases 1–3 complete
- Phase 1 (role/level axis + readiness) · Phase 2 (Scale-it race · Ambiguity drill · Refactor) · Phase 3 (Trap Museum · Spaced repetition · Mock-loop · Follow-up chains), plus the two-pane solve view + schema panel + schema autocomplete (D-PL-26) and the Graphite identity. **Next: Phase 4 — take-home · code-review · explain-it.**

### Next
- Deploy the 0.22–0.32 stack. Then Phase 4.

## [PL 0.31.0] - 2026-06-24 — Foundations: the "your turn" active do-and-check step (SQL Lab's lesson for KNOW)

> The deepest thing the learn frame can steal from PAL's SQL Lab isn't the chrome — it's the **active loop**: produce an answer and get *targeted* feedback, not just watch a demo. Rolled out to 8 read-run modules, on the existing `KnowRunner`.

### Added
- **`YourTurn` step** in `KnowRunner` (`KnowBrowser.jsx`) — optional per module (`m.yourTurn`). Edit the starter to hit a goal → **Check** (or Cmd/Ctrl+Enter) → a pass/fail verdict with *actionable* feedback ("Still [2, 2, 2]: every lambda closes over the SAME i… freeze it per-iteration, e.g. `lambda i=i: i`"), plus an optional hint. Never just "wrong" — the SQL-Lab feedback voice.
- **`runCheck(userCode, checkSource)`** in `pyodideRuntime.js` — runs the learner's code + a check snippet in ONE fresh namespace (no global leak); the check sets `__pl_pass`/`__pl_msg`. Returns `{pass, msg, stdout, error}`.
- **Rolled out to 8 modules** — late-binding closure, aliasing (b = a.copy()), the or-default that eats `""`, the mutable default arg, `__eq__`/`__hash__`, `functools.wraps`, the iterator protocol, and operator dispatch (`__add__`). Each a fix-it/achieve challenge. **All 8 CPython-verified**: every starter fails (or errors informatively — "unhashable", "not iterable", "unsupported operand"), every intended fix passes.

### Notes
- The editor half of "adapt CodeMirror" was already done by the PyLab work (D-PL-26): `PythonCell` gained names-only autocomplete (`completions` prop) + Cmd/Ctrl+Enter→`onSubmit` at `Prec.highest`. The your-turn step reuses both (`onSubmit`=Check). No duplicate editor work; no PyLab files touched.
- Deliberately did **not** import the SQL-Lab *solve furniture* (schema browser, company tags, two-pane) into the learn frame — Foundations isn't a problem bank; the driven models already show data inline. Took the pedagogy (active recall), not the skin.
- esbuild graph exit 0. Foundations-only files: `KnowBrowser.jsx`, `knowModules.js`, `pyodideRuntime.js` (additive `runCheck`).

## [PL 0.30.0] - 2026-06-24 — PyLab two-pane solve view: schema panel + schema autocomplete (adapted from SQL Lab)

> Sidharth: adopt PAL SQL-Lab's two-pane problem structure for PyLab and adapt the editor. Aligned divergence (D-PL-26): show the INPUT (with sample) but the OUTPUT SHAPE ONLY (no values) — showing the answer would defuse PyLab's runs-but-wrong traps. PL's editor was already CM6 + themed, so no swap — just autocomplete + keymap.

### Added
- **Two-pane solve view** (`PyLabBrowser` + `.pylab-solve-grid`, collapses to one column ≤900px) — left: prompt + Before-you-write + ambiguity drill + **schema panel**; right: editor + Submit + result. The reveal (solution + judgment layer + Scale-it + Refactor) stays full-width below.
- **Schema panel** (`src/components/shared/PyLabSchema.jsx` ← precomputed `src/data/pyLabSchemas.js`) — each input as a mini table (columns + dtypes + 3-row sample) and a **"Returns · shape only"** target (output columns/dtypes/rowcount, **values hidden**). `scripts/build_py_schemas.py` introspects every fixture + canonical output in CPython at build time (136 problems, 0 errors) → static at runtime, **zero Pyodide-on-open cost**.
- **Schema autocomplete** (`PythonCell` `completions` prop + `@codemirror/autocomplete`) — names-only: the fixture's arg + column names (bare + quoted), automatic as you type. No method/full-query completion (held the "cut typos, don't do the thinking" line).
- **`Cmd/Ctrl+Enter` → Submit** (`PythonCell` `onSubmit`, wrapped in `Prec.highest` so it beats CM's default "insert blank line" — the exact bug PAL hit). Solve header now shows the level instead of the WARMUP/CORE badge.

### Decisions
- **D-PL-26** — adopt SQL-Lab's two-pane + schema structure for PyLab, but show **output shape only, never values** (preserves the trap pedagogy — there's no oracle to diff against, which is the whole point). Company tags + square cards per D-PL-25.

### Notes
- PL has no global single-key shortcuts, so PAL's contenteditable-shortcut bug doesn't apply (verified). Same iCloud/mmap deploy gremlin as PAL — if a push times out, use the rsync-to-/tmp `--exclude='public/'` workaround.

### Verified
- esbuild clean (PythonCell, PyLabSchema, PyLabBrowser); `autocompletion`/`Prec` exports resolve; `pyLabSchemas.js` node-check + import clean (136 schemas); **full import-graph bundle exit 0**.

### Next
- Deploy the 0.22–0.30 stack. Then Follow-up chains.

## [PL 0.29.0] - 2026-06-24 — PyLab Phase 3: Mock-loop (timed, no-reveal interview session)

> The pressure test. Pick a length, solve under a running clock with no reveal / debrief / hints, get a scorecard — and the misses feed spaced repetition.

### Added
- **Mock-loop** (`src/components/shared/MockLoop.jsx` + a "Mock interview" launcher by the PyLab title) — **setup** (3/5/8 problems, mixed or focused by level) → a **timed session** (running clock + progress bar, prompt + fixture + editor + Submit, **no reveal/judgment/debrief**, resubmit freely, move on when ready) → a **scorecard** (solved N/total, total + avg time, per-problem pass/time). Reuses `runPyLab` for grading; passes graduate (`markSolved` + `reviewSR(id, true)`), misses → `reviewSR(id, false)` so they resurface in the review queue.

### Verified
- esbuild clean (MockLoop, PyLabBrowser); icons confirmed present; reuses the already-verified grading + spaced-repetition paths.

### Next
- Phase 3's last piece: **Follow-up chains** (the interviewer's escalating next ask — needs authored content per problem). Then Phase 4.

## [PL 0.28.0] - 2026-06-24 — Cleanup: retire the orphaned old bank rooms + dead green-screen CSS

> Paying down debt from the PyLab consolidation and the Graphite switch. No user-facing change beyond a lighter, less confusing codebase.

### Removed
- **The 4 superseded DO bank files** — `src/data/{pythonProblems,pandasProblems,idiomsProblems,oopProblems}.js` (content migrated into PyLab long ago; only stale comments referenced them) + `src/pages/ProblemBrowser.jsx` (the generic runner that served their now-unreachable routes). Cleared the dead imports + routes from `App.jsx`, the dead nav counts from `Sidebar.jsx` (`VIEW_FRAME`/`BANK_TOTAL`/`bankSolved`), and the unused imports from `banks.js`.
- **Dead green-screen CSS** (`index.css`) — the `.pl-crt-overlay` scanline overlay (+ its div in `App.jsx`) and the phosphor decorations (glow `text-shadow`, the `#7FF5B0` headings, the inverse-video green nav/buttons/badges) that Graphite made unreachable. Kept the foundation tokens components still inherit.

### Verified
- Full import-graph bundle (`esbuild --bundle src/App.jsx`) **exit 0** — no dangling imports after the 5 deletions; CSS brace-balanced; token coverage clean (nothing left undefined). A subagent ran the coordinated surgery and caught one mis-scoped token in my brief (`--gradient-accent` is used by the Home badge, not only the deleted file) and conservatively kept it.

### Next
- Deploy the whole 0.22–0.28 stack and click through. Then Phase 3 Mock-loop.

## [PL 0.27.0] - 2026-06-24 — PyLab grid → square company cards

> UI change (Sidharth): the PyLab list becomes a grid of square cards, each mapped to a representative company, with a one-line gist. The WARMUP/CORE difficulty badge drops from display (it's a filtering signal, not a label).

### Changed
- **PyLab grid is now square cards** (`src/pages/PyLabBrowser.jsx`) — company tag (brand-hue monogram + name) on top, the title, a **one-line gist** (first sentence of the prompt), then the tags (topic · level · trap). Responsive `auto-fill minmax(290px)` grid; the WARMUP/CORE difficulty badge is removed from the card.
- **`src/data/pyLabCompanies.js`** (new) — a representative company per problem, deterministic per id (FNV-1a) from a topic-appropriate pool (analytics → Airbnb/Meta/DoorDash/…, vectorize → NVIDIA/OpenAI/quant, core → Google/Amazon/…). A flavour cue like LeetCode's company tags, **not a verified "asked at X"** — easy to curate or relabel.

### Verified
- esbuild clean (PyLabBrowser), `node --check` (pyLabCompanies); 19 companies across 136 problems, healthy spread (max Microsoft 18), deterministic.

### Next
- Curate/lock specific company tags or relabel framing if wanted. Then Phase 3 Mock-loop.

## [PL 0.26.0] - 2026-06-24 — PyLab Phase 3: spaced repetition (SM-2 review queue)

> Interview prep is a memory game and the reflexes fade. PyLab now resurfaces what you'll forget, on a growing schedule.

### Added
- **Spaced repetition** (`src/utils/pyLabSR.js` + a PyLab browser strip) — a light SM-2: solving a problem schedules it (1d → 3d → ×ease, ease clamped 1.3–2.8); failing it (submit wrong, then reveal) resets it to **due now**. Only problems you actually submitted are tracked — a pure reveal schedules nothing. A **"N due for review" strip** flips the PyLab grid into a review queue (Review now / Show all); solving a due problem pushes it further out. localStorage `pl-pylab-sr-v1`, independent of the solved-progress store.
- Hooks in the runner: a passing submit → `reviewSR(id, true)`; a reveal after a failed submit → `reviewSR(id, false)` (lapse).

### Verified
- esbuild clean (PyLabBrowser), `node --check` (pyLabSR); the SM-2 logic unit-tested with a localStorage shim — intervals grow **1 → 3 → 8** (×2.6 ease) on repeated success, reset to due-now on a lapse, due-window math correct (A reappears at day 10), and a recovered card leaves the queue.

### Next
- Phase 3 cont.: **Mock-loop** (timed session, no reveal), **Follow-up chains** (the interviewer's next ask). Continuous: cleanup dead green CSS + retire old bank files.

## [PL 0.25.0] - 2026-06-24 — Dark mode is now Graphite (Platinum at night); green-screen retired

> Sidharth: "get rid of the black-green thing as our dark mode" — mocked up three dark-Platinum directions, **Graphite** chosen. The dark mode is no longer a separate green CRT skin; it's Platinum itself, dressed for night.

### Changed
- **Dark mode = Graphite Platinum** (`src/index.css`, new `:root[data-skin='platinum'][data-theme='dark']` block) — charcoal desktop, raised graphite cards, the same beveled chrome + Geneva type + red seam glyph. The toggle now flips `data-theme` (light ⇄ dark) with the skin **always Platinum**, so the menu bar, bevels, and text-only nav carry across both modes. Scoped specificity (skin+theme) wins over both the light Platinum tokens and the old base green tokens.
- **Footer toggle rewired** (`Sidebar.jsx`) from skin-cycle (platinum⇄greenscreen) to theme-toggle (light⇄dark). `theme.js` default flipped to **light** (Platinum is the adopted base); `skin.js` coerces any stale stored skin back to platinum (`LIVE=['platinum']`), so a user previously on green-screen lands on Platinum. `PlatinumMenuBar` colors tokenized so it themes.
- **Green-screen CRT retired** as the dark identity (supersedes D-PL-18). The green tokens + `.pl-crt-overlay` remain in the stylesheet but are now unreachable (skin coerced to platinum); the overlay div stays mounted and dormant. Cleanup of the dead green CSS deferred.
- **Editor syntax highlighting, theme-aware** (`PythonCell.jsx`) — added a CodeMirror `HighlightStyle` whose token colours resolve through CSS variables (`--cm-*`, defined per theme in `index.css`), so Python code is now **colourised** and adapts light (One-Light family) ↔ graphite-dark (One-Dark family) with no editor remount. Previously the code was monochrome (no highlight style was wired); the editor chrome already themed via tokens, this completes it.

### Decisions
- **D-PL-23** — the dark mode is Graphite (a dark theme of Platinum), not a separate skin. Supersedes D-PL-18 (green-screen identity). Platinum is the single skin; light/dark are its two themes.

### Verified
- esbuild clean (App, Sidebar, PlatinumMenuBar, theme.js, skin.js); `index.css` brace-balanced (164/164), graphite block present. macOS `npm run build` + approve-first push pending.

### Next
- Phase 3 cont. — spaced repetition (SM-2 review queue), mock-loop (timed, no reveal), follow-up chains. Continuous: cleanup the now-dead green CSS.

## [PL 0.24.0] - 2026-06-24 — PyLab Phase 3 opens: the Trap Museum

> First of the Phase-3 surfaces. A browsable gallery of every runs-but-wrong trap in the bank — the catalogue of code that passes review and fails in production. Pure lens over gated data: **zero new content, zero new gates.**

### Added
- **Trap Museum** (`src/pages/TrapMuseum.jsx` + `src/data/pyLabTraps.js`) — flattens every `methods[].isTrap` across the 136-problem bank into one gallery: **100 traps** across 8 topics, each already proven by `verify_py_methods` to run *and* diverge from the canonical. Filter by topic, search, expand a card to see the tempting code + why it looks right + when it breaks + the tell. **Copy-as-post on every trap** — feeds the daily-LinkedIn keystone (the distribution gate PL runs behind).
- Wired into the **JUDGE frame** (`Trap Museum` beside `Spot the Flaw`) + App route `trapmuseum`. No progress bank (it's a reference surface), so no count badge.

### Verified
- esbuild clean (TrapMuseum, App, Sidebar); `pyLabTraps.js` `node --check` + import clean — **100 traps, 0 missing both tradeoff+breaksWhen**, byTopic {python-core 30, idioms 18, oop 15, groupby 14, window 8, vectorize 6, merge 5, reshape 4}. (Caught two missing icon names — `frame`, `git-branch` — and swapped for registered ones.)

### Next
- Phase 3 cont.: **Spaced repetition** (SM-2 review queue over solved problems), **Mock-loop** (timed session, no reveal), **Follow-up chains** (the interviewer's next ask).

## [PL 0.23.0] - 2026-06-24 — PyLab Phase 2 cont.: Ambiguity drill + Refactor (format content decoupled)

> Two more showcase formats from the vision. Both run off a new **`src/data/pyLabFormats.js`** keyed by problem id — so a problem carries an ambiguity drill, a refactor target, both, or neither, and the 136-problem bank stays untouched (no re-gating).

### Added
- **Ambiguity drill** (`AmbiguityDrill.jsx`) — surfaces *above the editor*: the vague ask ("share of WHAT total?", "keep or drop the unknown-region row?", "dense or min ranking after a tie?") is pinned to one reading before you write a line. Pick the interpretation → see which the spec actually means and why the others merely run (the wrong options are usually the problem's own trap). **8 authored**, each correct option verified against what the canonical `solution` computes.
- **Refactor** (`RefactorChallenge.jsx` + `runPyLabBenchFull` runtime) — an opt-in panel in the reveal: here is code that *works but is slow*; rewrite it. Graded twice — still correct (`runPyLab` vs the canonical) **and** actually faster (a scale-race of your code vs the baseline, factor auto-derived to ~5k rows). **5 authored** (`iterrows`/`.apply`/Python-loop baselines), each CPython-verified correct-but-slower.
- `runPyLabBenchFull` — benches a full `def solve(...)` at scale (the Refactor needs to time two complete solutions; `runPyLabBench` times method bodies for the race).

### Verified
- esbuild clean on all four changed files; `pyLabFormats.js` `node --check` clean; **all 12 keys are real problem ids** (8 ambiguity + 5 refactor; rep-share carries both). The full-code bench path simulated in CPython: rep-share refactor at 5,000 rows — baseline `iterrows` **2,743 ms** vs vectorized **2.9 ms** = **959× faster** the learner earns by rewriting. Content authored + verified by a gated subagent (it rejected `nlargest`/`topn` — no honest fork, no tie support — rather than fake them).

### Next
- Phase 3 — Follow-up chains, Mock-loop, spaced repetition, the trap museum. Continuous: grow ambiguity/refactor coverage; retire the dead old bank data files + routes.

## [PL 0.22.0] - 2026-06-24 — PyLab Phase 2: the Scale-it race (the glass box, made a game)

> First showcase format from the vision (`PYLAB-VISION` §3). On any problem with ≥2 valid methods, predict which one survives at scale — then watch the cost curve actually diverge.

### Added
- **Scale-it race** (`src/components/shared/ScaleRace.jsx` + `runPyLabBench` in the runtime) — the fixture is replicated up (DataFrames/Series concat, lists/arrays tiled) and each **valid (non-trap)** method runs at a small and a large size, timed + memory-traced. Predict the winner → watch the bars diverge → get the cost lesson (pulled from the method dial). Self-hides unless a problem has ≥2 valid methods (**22 of 136 eligible** today).
- Wired into the PyLab reveal, after the judgment layer.

### Verified
- esbuild clean. The bench harness (wrap-body + generic `_pl_scale` + `tracemalloc` timing) simulated in CPython: rep-share at 20k rows — **transform 2.1 ms / 1.3 MB vs merge-back 5.7 ms / 1.4 MB** (~2.7× divergence). The race shows a real, not staged, difference.

### Next
- Phase 2 cont.: **Ambiguity drill** (`beforeWriting`→format) + **Refactor** (diff + cost race). Then Phase 3 (follow-up/mock/spaced-rep).

## [PL 0.21.0] - 2026-06-24 — KNOW re-scoped: the Foundations rooms (architecture + skeleton, planning only)

> PAL's handoff (`docs/FOUNDATIONS-HANDOFF.md`) + a live read of PAL's deployed Foundation rooms (a three-slider Mix-Shift simulator inside one Metrics module) proved PL's "shipped" KNOW frame is a 20-card predict-run-read stub against PAL's slider-driven, ~10x-larger system. KNOW is re-scoped into a **trunk + branches** Foundations architecture. **This release is planning + skeleton only — nothing is wired into the app.**

### Added
- **`docs/FOUNDATIONS-SPEC.md`** — the KNOW-frame authority: the trunk (5 rooms: Python Foundations · The Machine · DS&A · NumPy & pandas · Shipping Python) + branches (2: Competitive Programming · Tensors & Autograd), per-room scope/grounding/manipulable-hook, the 3 product through-lines (binding/aliasing · broadcasting · cost/race), the build architecture (reuse `KnowRunner` + an optional `interactive` slot; 4 widget substrates `live`/`sim`/`stepper`/`concept`; prefer Pyodide-`live` as PL's edge over PAL's hand-built SVG), the scope amendment, and build order F0→F7.
- **`src/data/foundationsRooms.js`** — the machine-readable skeleton: **7 rooms / 24 clusters / 73 seed modules**, all status `planned`, each module tagged with its widget substrate. **Unimported (no build impact);** `node --check` + import-tally verified.

### Decisions
- **D-PL-21** — KNOW becomes the Foundations rooms; the two branches **amend the charter** (Competitive Programming exceeds the easy→medium ceiling, partially superseding D-PL-07 which still governs the trunk; Tensors & Autograd takes **library mechanics only** — modeling stays in `ml-systems-lab`, same KNOW→DO seam). Re-scopes PL from "fluency floor" to "fluency floor + two depth verticals." Approved 2026-06-24.

### Wired (F0 — the rooms are now in the app)
- **`src/pages/FoundationsBrowser.jsx`** — reads the registry and renders the trunk + branches → rooms → clusters → module cards. Wired into **`App.jsx`** (lazy route `view==='foundations'`) and **`Sidebar.jsx`** (KNOW nav). Uses the lab's tokens → themes under both skins. esbuild graph → **exit 0** (Vite/Rolldown is macOS-only; sandbox-verified via esbuild).

### Merged — one KNOW room (consolidation, mirroring PyLab on the DO side)
- The 20 authored "Python & OOP Depth" modules fold **into** Foundations. `KNOW_BACKING` + `KNOW_EXTRA` (in `foundationsRooms.js`) route each to its room/cluster — **17 → Python Foundations, 2 → Shipping Python, 1 → The Machine** — where it renders as a **ready** card opening the runnable predict→reveal flow via the now-exported `KnowRunner` (solved/seen state preserved). Planned modules stay dashed/"planned"; room + page show a live `ready` count (20 ready now).
- **Standalone "Python & OOP Depth" nav item removed** — Foundations is the single KNOW surface (`know` route orphaned, harmless). Verified: all 20 authored modules reachable, no id typos, esbuild clean.

### Driven (F1 — the first manipulable model, the whole point)
- **`src/components/foundations/AliasingModel.jsx`** — Room 1's "Names are bindings" module now carries a **live, driven model**, not just predict-run-read. The learner toggles `b = a` vs `b = a.copy()`, clicks `a.append(•)` / `a = [99]`, and watches a heap diagram (names → object nodes, the list contents, `a is b`) update — **every frame computed by real CPython in Pyodide** (`runPython`), so `id()`/`is`/values are measured, not drawn. Includes a "show the Python this ran" disclosure (honest: it's real code). This is PL's edge over PAL's hand-built SVG — the model is *executable*.
- **`KnowRunner` gains an optional `interactive` slot** (between demo and reveal), driven by `src/components/foundations/interactiveModules.js` (module id → widget). Modules without an entry keep the predict-run-read flow; back-compatible. Verified: the exact frames checked in CPython (alias→same, copy→decoupled, rebind→decoupled); esbuild graph exit 0.

### Driven — two more models + planned modules now openable
- **`CopyVsViewModel.jsx`** (Room 1, live Pyodide) — the aliasing sequel: toggle `x.copy()` vs `deepcopy(x)`, mutate the inner/outer list, watch `x[0] is y[0]` flip (shallow shares inner lists, deep doesn't). CPython-verified.
- **`CallStackModel.jsx`** (Room 2, stepper) — step/play a recursive `factorial(n)`; frames push on the way down, the base case stops it, frames pop with return values on the way up; names the `RecursionError` a missing base case causes. Deterministic JS (the animation is the lesson); factorial values verified.
- **`FoundationsBrowser` now opens interactive-only planned modules** — a module is READY if it has authored content *or* a driven model; the latter open a lightweight widget runner (`WidgetRunner`). `READY_TOTAL` recomputed from a room scan (22 ready). esbuild exit 0.

### Driven — Room 2 (The Machine) cost models
- **`BigOModel.jsx`** (sim) — drag n; five cost classes (O(1)→O(n^2)) render as log-scaled bars with live op counts and the n^2-vs-n multiplier. The "felt" Big-O; ties straight to the glass-box thesis.
- **`HashBucketsModel.jsx`** (sim) — drop keys into 8 buckets (teaching hash = char-code sum mod 8), watch a real collision chain, then look a key up and see it jump straight to its bucket (O(1)) instead of scanning all N.
- **Five driven models now** across Rooms 1–2 (aliasing, copy-vs-view, call-stack, Big-O, hashing). esbuild exit 0; Big-O math + hash placement sanity-checked.

### Driven — the cost race + broadcasting (Rooms 2 & 4)
- **`VectorizedRaceModel.jsx`** (live numpy) — the glass-box thesis itself: the same sum-of-i² as a Python loop and a numpy vectorized op, raced on real Pyodide wall-clock; drag n, Run, watch the speedup. Verified loop≡numpy total (332,833,500).
- **`BroadcastModel.jsx`** (sim, Room 4) — drag two array shapes; size-1 axes stretch to match (ghost cells, "never copied"), non-1 mismatches error. Rule verified against `np.broadcast_shapes` ((3,1)+(1,4)→(3,4); (2,3)+(3,2)→error).
- **Seven driven models now** across Rooms 1, 2, 4. esbuild exit 0.

### Driven — pandas alignment, truthiness, decorators
- **`IndexAlignModel.jsx`** (live pandas, Room 4) — toggle s2&apos;s labels, watch `s1 + s2` align by label and drop NaN where a label is in only one Series. Verified: a,d→NaN, b=22, c=33.
- **`TruthinessModel.jsx`** (live, Room 1) — define `__bool__` / `__len__`, watch `bool(obj)` fall through the protocol (\_\_bool\_\_ → \_\_len\_\_ → default True). All four dispatch cases CPython-verified.
- **`DecoratorModel.jsx`** (stepper, Room 1) — step a decorated call: the name resolves to the wrapper, which runs before/after around the original and passes the value back out.
- **Ten driven models now** across Rooms 1/2/4 (the last two render inside their backed modules&apos; `KnowRunner` slot). esbuild exit 0. Widgets use `var()` tokens → theme correctly under the new Graphite dark mode (D-PL-23).

### Templated — driven models become DATA (the scalable turn, D-PL-24)
- **`StateTrace.jsx`** — a config-driven template for the recurring "binding & identity" model shape (drive ops → build Python → run live → render values + an `is` verdict). **`foundationsModels.js`** holds the configs. A new such model is now a **data entry, not a component**.
- **Collapsed aliasing + copy-vs-view onto it** (the two bespoke `AliasingModel.jsx`/`CopyVsViewModel.jsx` are now dead — `git rm` them) and **added mutable-default as config-only** — the proof that a new driven module = data. All three verified: the template generates correct CPython (a is b, x[0] is y[0], the shared default accumulating [1,2,3]). esbuild exit 0.
- Bespoke widgets stay only where the picture/dynamics need custom viz (call stack, Big-O, hashing, broadcasting, numpy race, index-align, truthiness, decorators).

### Templated cont. — slider variant + is-vs-==
- `StateTrace` gained a **slider** control and an **equality** probe (`a == b` shown alongside `a is b`). **is-vs-== migrated onto the template, config-only** (`IS_VS_EQ`): drag the value across the small-int cache and watch `is` flip (False→True at -5, True→False past 256) while `==` stays True. Verified at -6/-5/256/257. Four models on the template now (aliasing, copy-view, mutable-default, is-vs-==); ~12 driven total.

### Driven — generators + async (bespoke, the dynamics are the lesson)
- **`GeneratorModel.jsx`** (stepper, Room 1) — step `next(g)` and watch the body run to the next `yield`, pause, resume; later values stay uncomputed (lazy, faded on the tape); exhaustion raises StopIteration and can't rewind (one-shot); contrasted with the eager `[0,1,4,9]` list (the memory lesson). Sequence CPython-verified.
- **`AsyncTimelineModel.jsx`** (sim, Room 5) — toggle serial vs concurrent; `await` hands control to the loop so the three I/O tasks overlap, and the total drops from the **sum** (7) to the **longest wait** (3). Same one thread.
- **Fourteen driven models now** (4 on the StateTrace template + 10 bespoke), across Rooms 1/2/4/5. esbuild exit 0.

### Driven — Room 3 DSA pattern traces (its first models)
- **`TwoPointerModel.jsx`** — sorted array, two pointers converge; the sum vs target decides which to move (O(n), not the O(n²) nested loop). Target slider; default tuned so the pointer visibly walks inward before the match.
- **`SlidingWindowModel.jsx`** — a size-k window slides; add the entering element, subtract the leaving one (running sum + best-so-far), never re-summing → O(n) not O(n·k).
- **`BinarySearchModel.jsx`** — lo/mid/hi on a sorted array; half the space discarded each step (O(log n)); out-of-range cells dim, target selectable (try 10 — absent).
- All three are deterministic JS steppers (the trace is the lesson); results CPython-verified (pair found, max=9, index 5 / not-found). **Seventeen driven models now**, across Rooms 1/2/3/4/5. esbuild exit 0.
- *These three share a clear shape (array + indices + step narration) — a candidate "algorithm-trace" template later, the way StateTrace emerged from aliasing/copy-view.*

### Templated + the branch rooms — all 7 rooms now have models
- **`ArrayTrace.jsx`** — a second config template ("array + indices + step narration"). Two-pointer, sliding-window, binary-search **collapsed onto it** (`arrayTraceModels.js`) — DSA traces are now DATA, not components. Verified (found 5+14, best=9, index 5 / not-found).
- **`UniquePathsModel.jsx`** (Room 6, DP) — fill a grid where each cell = top + left; the subproblem reuse makes it O(R·C). Total 10 (verified C(5,2)).
- **`AutogradModel.jsx`** (Room 7) — d = a*b + b runs forward (define-by-run) then `.backward()` replays the chain rule to the leaves; b feeds two paths so its grad SUMS them (da=3, db=3, verified). The broadcasting→autograd through-line.
- **All seven rooms now have a driven model** — 19 total, **7 config-driven** across the two templates (StateTrace ×4, ArrayTrace ×3). esbuild exit 0.

### Still to do (F1 cont.)
- `git rm` the 5 now-dead bespoke files (`AliasingModel`, `CopyVsViewModel`, `TwoPointerModel`, `SlidingWindowModel`, `BinarySearchModel` — superseded by the two templates; sandbox can't delete). Then F2/F3: author the planned modules' predict→read text alongside their widgets. macOS `npm run build` + approve-first push pending.

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

# PL — NEXT (build queue)

_Renamed PSL → **PL (Programming Lab)** — 2026-06-23 (Sidharth's call). The SWE-for-data fluency lab; Python now, OOP included; DSA + pandas later. HQ dispatches build briefs here (D-13). A PL build session opens, reads this + `PL-BUILD-SPEC.md`, builds, then writes its own STATUS/LINEAGE._

## ✅ DONE — BreakLabs logo (D-19) implemented 2026-06-23 (PL 0.3.0)
`BrandMark` built (`src/components/shared/BrandMark.jsx`) per `docs/BRANDMARK-ROLLOUT.md` (canonical in HQ); descriptor `Programming`, accent violet `#8B5CF6`, red seam + wordmark constant. Wired into all 7 in-scope slots: sidebar header (full), favicon (shared red monogram — old violet favicon archived to `_legacy/`), OG card (`public/og-image.png` 1200×630 + meta tags), hero (wordmark), gate header (wordmark), footer (wordmark + "part of BreakLabs"), loading (monogram). esbuild-verified; awaiting macOS build + push.

## ✅ §0 RESOLVED — both sign-offs in, build is unblocked
- **Option A approved** (Sidharth: "approve yes"): rebuild as a **React + Vite + Pyodide SPA**, sibling-consistent with PAL/MSL/GAL; archive the legacy FastAPI/Docker/`modules` scaffold to `_legacy/` (don't delete).
- **Rename approved + DONE (2026-06-23):** lab = **PL (Programming Lab)**. The GitHub repo slug was renamed to **`programming-lab`** and the local remote repointed (`git remote set-url`); `a7677fc` pushed. (Slug rename pulled forward from "deferred" — Sidharth did it during deploy.) **Local folder stays `labs/production-systems-lab`** so the mount + CLAUDE.md paths keep working. Vercel: first deploy via dashboard import off `programming-lab`.
- **`PSL-BUILD-SPEC.md` → treat as `PL-BUILD-SPEC.md`** (rename the file in B0; same content, scope is fixed by D-07 + D-15).

## ⚠ Distribution-gate override (conscious)
PL was held behind the distribution keystone (D-01/D-10). **Sidharth is overriding that to dogfood PL early.** The override holds *only* because B1's content **is** the distribution: every Bank-A gotcha doubles as a LinkedIn post. **Condition: the daily LinkedIn post keeps running alongside the build** — PL build does not replace the keystone, it feeds it. If the daily slips, PL pauses.

## ✅ B0 + B1 SHIPPED — 2026-06-23 (this pass)
Built and verified (esbuild bundle exit 0; data + Python snippets verified). See `STATUS.md`.
- **B0:** legacy archived to `_legacy/`; React+Vite+Pyodide SPA scaffolded sibling-consistent; MVP IDE (`PythonCell`: CodeMirror → Pyodide 0.25.1) + **glass-box built early** (time + peak-mem footer; `raceMethods` ready for DSA). Inherited Sidebar/Icon/HowToStrip/ForwardPointerCard/GateOverlay/unlock.
- **B1:** Bank A = **23 Python gotchas**, 7 clusters, predict→run→reveal→fix→"copy as post". Seeded by PY1–PY7 + 16 new. `src/data/gotchaProblems.js`.
- **Not done in-sandbox:** `npm install` + `vite build` (macOS-only). Run on Mac before deploy. Git prepared approve-first, not pushed.
- **Deviation:** Pyodide on main thread (per MSL), not a worker — flagged for hardening.

**B2 (pandas → 41) + B3 (Python drills → 56) at interview scope — SHIPPED 2026-06-23**, 337 checks independently verified. 120 problems total. **Two-pane solve UI + filterable browse (0.7.0)** and **all four frames live — KNOW/BUILD/JUDGE populated (0.8.0)**. **DO Idioms (20) + OOP (15) banks SHIPPED (0.9.0)** — DO is now 5 banks / 155 drills; audit gates them. **Progress dashboard + KNOW deepened 6→20 SHIPPED (0.10.0)** — 185 items across 8 banks; `src/data/banks.js` is the bank registry. **KNOW upgraded to PAL Stats-Room Foundations format SHIPPED (0.11.0)** — leveled predict MCQ (per-option feedback) + a four-card `SeniorRead` debrief on all 20 modules; `KnowRunner.normalizePredict` is back-compatible so other banks can adopt it next (D-PL-17). **Green-screen identity SHIPPED (0.12.0)** — PL's dark mode is now the old-school CRT: P1 phosphor green `#46E08A` on void, scanlines + glow, inverse-video nav, box-panel + HUD utilities; supersedes violet (D-PL-18). Shared light mode untouched. **PYLAB FOUNDATION SHIPPED (0.17.0, 2026-06-24)** — comparator (`pl_compare`) + four gates (`audit_py`/`verify_py_methods`/`py_content_scan`/`run_py` + `_extract_pylab`) + `runPyLab` runtime + `JudgmentLayer` + `PyLabBrowser` (DO nav). 4-problem seed, all CPython-verified, all gates green. **Pre-commit (PyLab):** `node scripts/_extract_pylab.mjs out.json && PYTHONPATH=scripts python3 scripts/audit_py.py out.json && PYTHONPATH=scripts python3 scripts/verify_py_methods.py out.json && node scripts/py_content_scan.mjs` — 0 Tier-1 / 0 failures / 0 GATE before commit. **NEXT: author the fluency bank in gated subagent batches of ~8** (groupby/agg, merge/join, reshape/pivot, window, numpy-vectorize, python-core) — de-jargoned, executed expected, ≥2 hints, executed debriefs (PYLAB-BUILD-SPEC §10 step 3); then the footgun tier, then the judgment layer on multi-method problems; migrate the existing pandas/__pl_checks drills onto the contract.

**PYLAB HANDOFF RECEIVED (2026-06-23)** — `docs/PYLAB-HANDOFF.md` is the governing reference: SQL Lab is a *judgment gym*, copy the 3 depth systems (content depth + judgment layer + verification rigor), not the runner UI. **PyLab = the single entry for pandas/numpy AND Python.** PL already has runner + Pyodide + Tier-1 audit + 6 forensics; the WORK is the judgment layer (`methods[]`/`dial`/`mcqs` + `verify_py_methods.py`), the comparison contract (`solve(df)→df` + `assert_frame_equal` — DECISION: migrate `__pl_checks` or run forward), engineered shared fixtures, executed debriefs/`beforeWriting`/`hints`, and the expanded footgun/Forensic tier. Build order in handoff §7. **First step (not yet started): lock the per-problem schema + comparison contract.**

**Real Platinum + Chicago + no rails + one light/dark toggle SHIPPED (0.16.0)** — light=Platinum (only light mode; casefile retired), dark=green now. White cards on gray window, Chicago font, 16 side rails stripped. NEXT UNIT: build **dark = Mac OS X Aqua terminal + ambient Matrix rain** (the mockup `pl_aqua_dark_ambient_matrix` is approved-pending) and the **`TerminalReveal`** trickery (rain on problem-open, run-overlapped) on one problem as a unit test. Then tune Platinum once seen.
**Pluggable SKIN system + Platinum skin SHIPPED (0.15.0)** — a skin = the whole visual world, swapped in one line (`src/utils/skin.js`, `[data-skin]`); Platinum (classic Mac, Apple menu bar) is now the active look and supersedes the green-screen (which becomes a skin). Spec: `docs/SKIN-SYSTEM.md` (D-PL-19). NEXT UNIT: the terminal window for a single problem (greenscreen/aqua skin) opened from a Finder-style `.py` list, with the Matrix reveal (run-overlapped) — the `hybrid` skin. Then tune Platinum once seen live.
**Green-screen FINALIZED SHIPPED (0.14.0)** — dark mode = Courier Prime · all text phosphor green · pure-black bg · no card decoration (top bars + hover glow removed). (0.13.0 first made it pure green+black; 0.14.0 swapped VT323→Courier Prime and killed white text + card highlights.) The whole identity is written down in **`docs/GREEN-SCREEN-IDENTITY.md`** (the authority — read it before any PL visual change; D-PL-18). Open follow-ups (also listed in that doc §8): apply `pl-panel`/`pl-hud` + glow across more room surfaces (KNOW/JUDGE/BUILD) so the whole app reads as one terminal; confirm CodeMirror picks up VT323; audit small VT323 labels for legibility; decide whether the brand seam goes green in PL dark mode (currently red per HQ D-19). Reframe: PL = programming/Python depth, JUDGE = pure code forensics, NOT GenAI (D-PL-15). Roadmap in `docs/CURRICULUM-RESEARCH.md`. Remaining passes (sequence, no grind): **deepen each frame** (more JUDGE forensics, KNOW explainers, BUILD projects); **testing & typing DO banks** (code craft, not AI); **extend `audit_problems.py`** to gate the judge/know/build runnable code; then the **content-depth pass** — add `hints[]` to the test-based problems (T2 warnings; port PAL's `hintSteps`), then the **`forensic` bug-fix format + `beforeWriting`** (= PL's judgment layer / B4), and optionally **shared DataFrame fixtures** (the datamart pattern). Plus **worker-hardening (A-PL-01) is now urgent** — heavy pandas on the main thread will jank. Audit gate is committed (`scripts/audit_problems.py`, `docs/CONTENT-STANDARD.md`). Four-frame KNOW/BUILD/JUDGE spec still paper-only.

---

## Original brief (for reference) — Build now = B0 + B1 only. Nothing below B1 starts this pass.

### B0 — foundation (infra, no content)
1. Archive legacy infra → `_legacy/`; rename spec file to `PL-BUILD-SPEC.md`.
2. Scaffold the React+Vite+localStorage SPA matching the siblings (lazy-load pattern, CSS-variable system, progress-in-localStorage).
3. **MVP IDE:** CodeMirror 6 editor → run code in a **Pyodide Web Worker** → hidden assert-based tests → pass/fail + stdout. (Spec §5.)
4. **Glass-box layer — build it here, not last.** `time.perf_counter()` + `tracemalloc` peak-mem + the canonical-vs-contrast race rendered as a small bar/number. This is the entire differentiator; without it PL is just a code runner. (Spec §5 step 2.)

**Best-of-breed picks PL inherits (HQ `DESIGN-STANDARD.md`, ruled 2026-06-23 — adopt, don't reinvent):**
- **Python runner → adopt MSL's `PythonCell`** (the canonical DO-runner for Python). PL does **not** build its own Pyodide cell — reuse MSL's clean prop API (`initialCode/withPlot/readOnly/onResult`). This is the delegation rule in UI form.
- **Left nav → PAL `Sidebar.jsx`**; **icon set → PAL `Icon.jsx`** (zero-dep); **paywall → the synthesized `GateOverlay`** (GSL base + PAL portal + MSL copy); **frame-setter → MSL `HowToStrip`**; **forward-pointer → PAL `ForwardPointerCard`**.
- Nav labels: **KNOW / DO / BUILD / JUDGE** (D-15). PL's first surface is the **DO** rung.

### B1 — Bank A (Python gotchas), ~20–30 problems
- **Already seeded** by the LinkedIn Python track (PY1–PY7 in `CONTENT_QUEUE.md`): mutable defaults, aliasing vs copy, `is` vs `==`/int-cache, list-vs-generator memory, late-binding closures, `in list` O(n) vs `in set` O(1), the `or`-default that eats `0`. Extend to the full §2-A cluster set.
- **Per-problem schema = spec §4 (B-ready), authored once.** Warmup tier = `solution` + `glassBox.lesson` (empty dial). Don't over-author Warmups; no fake dials. (Judgment dial/MCQ is B4, not now.)
- **House syntax rule (PAL CLAUDE.md):** data files use single quotes only, escape apostrophes as `\'`, no template literals (Rolldown parse errors).
- Each gotcha is written to double as a LinkedIn "watch it break" post → feeds the keystone.

### Explicitly NOT now
B2 (pandas/numpy), B3 (DSA by pattern), B4 (idioms + judgment dial/MCQ). Those are later passes — each its own build session with its own spine close. Resist building all four banks at once; that's the grind D-07 forbids.

## The four-frame spec expansion (parallel, paper-only)
PL's spec is currently DO-heavy (the fluency banks). It still needs its **KNOW / BUILD / JUDGE** layers mapped to D-15 (KNOW = the Python/OOP depth explainers; BUILD = scaffolded mini-projects; JUDGE = the dial/MCQ + a Forensic/Spot-the-Flaw tier). This is a **planning** task that can run in parallel with B0+B1 — it doesn't block code, and code doesn't block it.

## Build rules (CLAUDE.md)
macOS-only build (sandbox Rollup ARM64 fails); **approve-first / never auto-push** — prepare commands, Sidharth runs them on his Mac; `rm -f .git/index.lock .git/HEAD.lock` before staging; full repo path.

**Full spec:** `docs/PL-BUILD-SPEC.md` — banks (§2), variety bar (§3), per-problem schema (§4), Pyodide IDE (§5), tiers (§6), build order (§7), sourcing/moat (§8).

# PL — STATUS

_Last updated: 2026-06-23 (build session: B0 + B1)._

## What PL is
Programming Lab — the SWE-for-data fluency lab (D-07). React + Vite + Pyodide SPA, sibling-consistent with PAL/MSL/GAL. Repo slug still `production-systems-lab` (rename deferred — NEXT.md).

## Built (this session)
- **B0 foundation:** legacy FastAPI/Docker/`modules` infra archived to `_legacy/`. New SPA scaffold (package.json/vite/index.html matching PAL's React 19 + Vite 8 + Tailwind v4 stack). Theme `index.css` = PAL tokens + `.pal-*` animation classes verbatim.
- **MVP IDE + glass-box:** `PythonCell` (CodeMirror 6 editor → Pyodide 0.25.1 from jsdelivr, main-thread per MSL) runs real Python in-browser. Glass-box layer built in now (not last): `runPythonGlassBox` captures stdout + wall time (`perf_counter`) + peak memory (`tracemalloc`); footer renders "⏱ ms · 🧠 KB peak". `raceMethods()` helper ready for the future DSA canonical-vs-brute race.
- **Inherited components:** Sidebar (KNOW/DO/BUILD/JUDGE, D-15), Icon, HowToStrip, ForwardPointerCard, synthesized GateOverlay (passthrough in beta), unlock.js (`isUnlocked()`=true).
- **B1 Bank A — Python Gotchas:** 23 problems across 7 clusters (identity-mutation 5, truthiness 4, evaluation-timing 3, memory-cost 4, numbers 3, scope-names 3, syntax 1). Each: predict-MCQ → runnable code → glass-box reveal → runnable fix → "Copy as LinkedIn post". Seeded by PY1–PY7; 16 newly authored. Every Python snippet verified against CPython.
- **Pages:** `GotchaBrowser` (DO-room, cluster-grouped grid, mobile-safe) + `GotchaRunner` (the full flow). `App` routes home ↔ gotchas with lazy-load + Suspense.

## Verified
- `node --check` + esbuild bundle of the whole import graph → exit 0 (99.4kb JS / 14.8kb CSS). Data file: 23 unique ids, integrity clean, balanced delimiters, all clusters covered.
- Every gotcha `code` + `fix` output verified in CPython 3.10; outputs chosen to be stable on Pyodide's 3.11.
- **NOT verified in-sandbox:** real `npm install` + `vite build` (macOS-only — Rollup ARM64). Must run on Sidharth's Mac before deploy.

## Known deviations / debt
- **Pyodide runs on the main thread** (adopted from MSL verbatim), not a Web Worker as the spec/NEXT suggested. Fine for short gotcha snippets; long-running DSA/pandas later should move to a worker. Flagged for a hardening pass.
- Repo slug / Vercel URL rename (`production-systems-lab` → `programming-lab`) deferred to a dedicated infra pass.
- Cost-gotchas (#13–16) use small runnable `n` for speed; the scale lesson lives in the text + post (the glass-box footer still shows the relative cost).

## Gate
Distribution-gate override is conscious + conditioned (NEXT.md): PL build proceeds only because every Bank-A gotcha doubles as a LinkedIn post. If the daily slips, PL pauses.

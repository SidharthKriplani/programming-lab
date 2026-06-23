# PL — STATUS

_Last updated: 2026-06-24 (session: KNOW re-scoped to the Foundations rooms — skeleton + spine; note: the body below still reflects the B0+B1 close and predates the PyLab consolidation in CHANGELOG 0.17-0.19 — read CHANGELOG for the current DO state)._

## This session (2026-06-24) — KNOW becomes the Foundations rooms (skeleton)
Triggered by `docs/FOUNDATIONS-HANDOFF.md` (PAL's mentor note) + a live read of PAL that proved its KNOW is ~10x PL's whole codebase and genuinely slider-driven, where PL's KNOW is a 20-card predict-run-read stub. **Decision D-PL-21:** re-scope KNOW into a **trunk + branches** room architecture — 5 trunk rooms (Python Foundations · The Machine · DS&A · NumPy & pandas · Shipping Python) + 2 branches (Competitive Programming · Tensors & Autograd). Two branches **amend the charter** (CP exceeds the easy->med ceiling; Tensors takes library mechanics only, modeling stays in MSL). **Shipped this session (planning + skeleton only, nothing wired into the app):**
- `docs/FOUNDATIONS-SPEC.md` — the authority (room scope, manipulable-model bar, the `interactive`-slot build approach, the 3 through-lines, build order F0-F7, the scope amendment).
- `src/data/foundationsRooms.js` — the machine-readable skeleton: **7 rooms / 24 clusters / 73 seed modules**, all status `planned`, each module tagged with its widget substrate (`live`/`sim`/`stepper`/`concept`). **Unimported — zero build impact.** `node --check` + import-tally verified.
- Spine logged: D-PL-21, NEXT (the Foundations build track), LINEAGE, IDEAS, CHANGELOG.
**Not done:** no `src/` wiring (no `FoundationsBrowser`, no `KnowRunner` slot yet) — that is F0, the first build phase. **Next:** F0 = add the `interactive` slot + build ONE `live` module (Room 1 aliasing) as the architecture proof, then author Room 1 to retire the stub.

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
- **Build verified on macOS (2026-06-23):** `vite 8.0.16`, 44 modules, `✓ built in 217ms` — dist JS 243kB (gzip 77kB) + lazy GotchaBrowser/CodeMirror chunk 372kB (gzip 124kB) + CSS 20kB. Committed `a7677fc`, pushed to `origin/main`.

## Known deviations / debt
- **Pyodide runs on the main thread** (adopted from MSL verbatim), not a Web Worker as the spec/NEXT suggested. Fine for short gotcha snippets; long-running DSA/pandas later should move to a worker. Flagged for a hardening pass.
- **Repo slug renamed → `programming-lab`** (GitHub repo renamed, local remote repointed via `git remote set-url`, 2026-06-23). **Local folder is still `labs/production-systems-lab`** — left as-is so the Cowork mount + BreakLabs/CLAUDE.md paths keep working; rename the local dir in a later infra pass if desired. Remote: `github.com/SidharthKriplani/programming-lab`.
- Cost-gotchas (#13–16) use small runnable `n` for speed; the scale lesson lives in the text + post (the glass-box footer still shows the relative cost).

## Identity (2026-06-23)
**Instrument** theme — dark-first, **violet `#8B5CF6`** on void `#0A0A0B`, Inter + JetBrains Mono; gold = signal, red = break, green = fix (BreakLabs master palette). Light "Field Notes" mode via `[data-theme]` toggle (sidebar footer), `localStorage`-persisted, anti-flash inline script. break-glyph favicon + `break⌇labs` wordmark. Pure token swap in `index.css` (no component rewrites). Supersedes the inherited PAL light/indigo skin.

**BreakLabs logo (D-19, PL 0.3.0):** `BrandMark` component (`break⌇labs · Programming`, red seam constant + violet descriptor) wired into 7 slots — sidebar header, favicon (shared red monogram), OG card (`public/og-image.png`), hero, gate, footer, loading. Per `docs/BRANDMARK-ROLLOUT.md`.

## Deploy
GitHub: `github.com/SidharthKriplani/programming-lab` (pushed `a7677fc`, build verified locally). **Vercel import pending** — first deploy via dashboard (Add New → Project → import `programming-lab`, Vite auto-detected). After import, every push to `main` auto-deploys.

## Gate
Distribution-gate override is conscious + conditioned (NEXT.md): PL build proceeds only because every Bank-A gotcha doubles as a LinkedIn post. If the daily slips, PL pauses.

# AUDITS — PL health log

_Known issues + debt. ✅ resolved / ⚠️ open. Newest first._

## Health snapshot — 2026-07-03
- **264 problems + 23 planned stubs. All 8 worlds. All four gates green: `audit_py.py` 0 T1 / 0 T2, `verify_py_methods.py` 0, `py_content_scan.mjs` 0.** Schemas regenerated for all 264 (0 errors). Every problem CPython-verified.
- JSX changes esbuild-validated in the sandbox; the real `npm run build` runs on Sidharth's Mac (Rollup ARM64) — nothing pushed from here.

## ✅ Resolved — 2026-07-03
- **Text read weak/thin everywhere (recurring).** Root cause was NOT the color tokens — it was `-webkit-font-smoothing: antialiased` on `body`, which thins every glyph on macOS/Chrome. Switched to `subpixel-antialiased` + `-moz-osx-font-smoothing: auto` + base `font-weight: 450`. Also lightened Platinum `--surface-2` (#dcdcdc → #eef0f2 — the gray cards were washing out text) and darkened the text tokens to near-black (charcoal `--text-dim` reserved for hints only). Supersedes A-PL-02 (contrast). Sidharth confirmed good.
- **`pylab-col-mean` trap did not diverge.** Its `df.mean()` Series-trap needed a 2nd numeric column to differ from the scalar answer; `fx_scores` gained an `age` column. Now `verify_py_methods` passes.

## ⚠️ Open
- **A-PL-01 — Pyodide runs on the main thread.** Adopted verbatim from MSL `PythonCell`. Fine for short gotcha snippets, but long-running DSA/pandas work will block the UI. Move execution to a Web Worker before B2/B3 land at scale. (Logged debt, not a bug.)
- **A-PL-02 — Theme contrast.** ✅ Resolved 2026-07-03 (see Resolved above). The recurring weak/thin-text problem was font-smoothing + the gray Platinum panel, both fixed. (The original "Instrument" theme this line referenced was superseded by the Platinum/Graphite skins — D-PL-19/23.)
- **A-PL-03 — `GotchaBrowser` chunk is ~372 kB (124 kB gzip).** Mostly CodeMirror, lazy-loaded with the room. Acceptable for now; revisit if first-room load feels slow.
- **A-PL-04 — Cost-gotchas use small `n`.** #13–16 (generator/set/string-concat/deque) run with small inputs for speed; the scale lesson lives in the text + post, and the glass-box footer still shows the relative cost. Consider a "race at scale" control later.

## ✅ Resolved
- **Favicon 404** — `public/favicon.svg` (break-glyph monogram) added in PL 0.2.0.
- **Looks like PAL** — PL inherited PAL's light/indigo theme verbatim; replaced with the violet/void Instrument identity in PL 0.2.0.
- **Build unverified in sandbox** — `npm run build` confirmed on macOS (vite 8.0.16, 217ms) at PL 0.1.0; esbuild bundle used for in-sandbox verification thereafter.

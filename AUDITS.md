# AUDITS — PL health log

_Known issues + debt. ✅ resolved / ⚠️ open. Newest first._

## ⚠️ Open
- **A-PL-01 — Pyodide runs on the main thread.** Adopted verbatim from MSL `PythonCell`. Fine for short gotcha snippets, but long-running DSA/pandas work will block the UI. Move execution to a Web Worker before B2/B3 land at scale. (Logged debt, not a bug.)
- **A-PL-02 — Theme contrast unverified on-device.** The Instrument dark + Field Notes light tokens were authored to AA but not yet checked against a live render in both modes. Verify once PL 0.2.0 is deployed; tune any token that fails.
- **A-PL-03 — `GotchaBrowser` chunk is ~372 kB (124 kB gzip).** Mostly CodeMirror, lazy-loaded with the room. Acceptable for now; revisit if first-room load feels slow.
- **A-PL-04 — Cost-gotchas use small `n`.** #13–16 (generator/set/string-concat/deque) run with small inputs for speed; the scale lesson lives in the text + post, and the glass-box footer still shows the relative cost. Consider a "race at scale" control later.

## ✅ Resolved
- **Favicon 404** — `public/favicon.svg` (break-glyph monogram) added in PL 0.2.0.
- **Looks like PAL** — PL inherited PAL's light/indigo theme verbatim; replaced with the violet/void Instrument identity in PL 0.2.0.
- **Build unverified in sandbox** — `npm run build` confirmed on macOS (vite 8.0.16, 217ms) at PL 0.1.0; esbuild bundle used for in-sandbox verification thereafter.

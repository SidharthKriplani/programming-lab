# IDEAS — PL backlog

_Tiered. Most things don't belong here — only what's specific enough to build. Cite the spec (`PL-BUILD-SPEC.md`) for the full plan._

## In progress
- **PL 0.2.0** — Instrument theme + dark/light + break-glyph. Built; awaiting Mac build + push (auto-deploys Vercel), then on-device contrast verify (A-PL-02).

## Tier 1 — next
- **B2 — pandas / numpy bank.** Highest-value bank for PL's audience. Lazy-load the Pyodide pandas/numpy wheels on first pandas problem. Spec §2-D / §3c. Pairs with the SQL bank in PAL.
- **Worker hardening (A-PL-01).** Move Pyodide execution to a Web Worker before pandas/DSA land at scale, so long runs don't block the UI.
- **Four-frame spec expansion (paper-only, parallel).** Map PL's KNOW / BUILD / JUDGE layers to D-15 (KNOW = Python/OOP depth explainers; BUILD = scaffolded mini-projects; JUDGE = the dial/MCQ + a Forensic tier). Doesn't block code.

## Tier 2
- **B3 — DSA by pattern** (hashing / two-pointers / sliding-window / heaps …, easy→med). Broad but pattern-templatable. Spec §2-C.
- **B4 — Python idioms** + the **judgment layer** (dial + MCQ UI) on the Stretch tier across banks.
- **"Race at scale" control.** Let cost-gotchas (A-PL-04) run canonical-vs-brute at a larger `n` on demand, rendering the `raceMethods()` bar.
- **Social polish.** `public/og-image.png` + a branded social card so shared links carry the Instrument identity.

## Tier 3 / later
- KNOW explainers · BUILD mini-projects · JUDGE Forensic / Spot-the-Flaw tier (each its own build pass).
- **Analytics + METRICS.md** — wire PostHog (env-gated, PII-stripped, like PAL) once there's traffic; then a real metrics spine.
- **Local-folder rename** `production-systems-lab` → `programming-lab` (dedicated infra pass; updates mount + CLAUDE.md paths).
- Stripe gate (flip `isUnlocked()`), when monetization is live.

## Lessons from the Python canon (2026-06-23 — inspiration only; author original, moat D-07)
Surveyed the standard Python books for their *pedagogical approach* (never content):
- **Learn to Code by Solving Problems (Zingaro)** — online-judge *targeted feedback* + "why does this code work" MCQs + bonus exercises. → **Tier 1: hints that react to which test failed** (fixes the live UX hole — between a failing test and Reveal there's nothing) + the judgment-MCQ layer.
- **The Hacker's Guide to Scaling Python (Danjou)** — profiling, memory, perf. → PL's glass-box IS this; add a **race-at-scale control** (O(n) vs O(n^2) made visual). Cost is the signature.
- **Treading on Python / Python In-Depth** — decorators, generators, context managers, comprehensions. → the **idioms bank (Bank B)** content map.
- **Real-World Python (Vaughan) · Python Playground / Invent Your Own Games (Sweigart)** — project-based, "ways to attack the problem." → the **BUILD rung** (scaffolded mini-projects) + the multi-method "which approach & why" (judgment dial).
- **Classic CS Problems (Kopec)** — pattern-by-pattern w/ a real-world hook → validates the DO bank as-is. **Programming & Problem Solving (Kamthane)** — fundamentals + OOP → the **KNOW rung** + OOP coverage (D-07).
- **UX fixes the live screenshot surfaced:** dead space below the buttons; two ambiguous run affordances (`Run` vs `Run tests`); no sense of what's being tested. Fold into the hints/feedback pass.
Priority: targeted hints-on-failure → idioms bank (B) → judgment MCQs → BUILD projects.

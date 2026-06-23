# IDEAS — PL backlog

_Tiered. Most things don't belong here — only what's specific enough to build. Cite the spec (`PL-BUILD-SPEC.md`) for the full plan._

## In progress
- **PL 0.2.0** — Instrument theme + dark/light + break-glyph. Built; awaiting Mac build + push (auto-deploys Vercel), then on-device contrast verify (A-PL-02).

## Tier 1 — next
- **KNOW Foundations rooms (D-PL-21) — BUILT OUT (F0+F1 done).** Re-scoped from the 20-card stub into one navigable Foundations surface: trunk (5 rooms) + branches (2), the 20 authored modules merged in, **19 driven models across all 7 rooms**, and **two config templates** (`StateTrace` + `ArrayTrace`, D-PL-24) so repeating shapes are data. Authority: `docs/FOUNDATIONS-SPEC.md`; current state: `STATUS.md` (KNOW section). **Remaining (F2/F3, mostly authoring):** write the planned modules' predict→read text alongside their widgets; migrate more shapes onto the templates; `git rm` the 5 superseded bespoke files. Supersedes the old "Four-frame spec expansion (paper-only)" line below for the KNOW half.

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

## Curriculum research → content roadmap (2026-06-23 — full doc: `docs/CURRICULUM-RESEARCH.md`)
GitHub/PyPI/roadmap + book-pedagogy research. Finding: the 4 banks are the right spine; the **uncovered, high-value territory is the SWE→AIE bridge** — the rigor that separates a notebook analyst from someone who ships. Top-12 ranked there; the picks to build next:
- **JUDGE — "read the LLM's code critically"** (hallucinated/deprecated APIs, mutable defaults, off-by-one). #1: nobody drills it; dead-on PL's "is the code an LLM handed you right?" thesis. Runnable.
- **DO — Bank G: Testing & guardrails** (asserts, edge cases, fail-loud, schema-check). The most-cited notebook→prod habit. Runnable.
- **DO — Bank E: Typing & validation** (dataclasses, pydantic, Enums — "make illegal states unrepresentable"). Runnable.
- **DO — Bank F: APIs & async** (parse JSON, `asyncio.gather`, Semaphore, retry/backoff) — the biggest AI-eng crossover; frame the no-raw-socket sandbox limit as the lesson. Partial-Pyodide.
- **DO clusters** — serialization & caching (`lru_cache`), the **Python↔SQL seam** (DataFrame→sqlite, parameterized query / injection trap).
- **BUILD** — "a tiny tested pipeline" (cell-blob → 3 pure functions + tests), async fan-out client (serial-vs-concurrent glass-box race), validate-then-transform.
- **KNOW** — Notebook→production · Typing for data code · Packaging & reproducibility (conceptual).
- **Pedagogy borrowed (format, not content):** Effective Python "Item" card → debrief schema; Cosmic Python pain-first + pros/cons → the judgment dial; High Performance Python "measure before you optimize" → the glass-box (gate the fix behind the timing); Zingaro autograder → distinguish *wrong* (correctness) from *too-slow* (glass-box timing).
- **Out of scope (named so they don't re-enter):** Docker/CI/Git *drills*, live FastAPI server, great-expectations bank, contest DP/segment-trees, ML model-training internals (MSL's lane).

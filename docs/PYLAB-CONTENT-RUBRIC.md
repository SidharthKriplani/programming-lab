# PyLab Content Rubric — the two-lens bar every problem clears

_The scorecard every PyLab problem is held to. Fuses the two guidelines: **(A) SQL-Lab pedagogy parity** and **(B) the interview-competence angle** — on top of PyLab's own non-negotiables and the mechanical audit gate. Companion to `docs/CONTENT-STANDARD.md` (which defines the Tier-1/Tier-2 machine gate); this doc is the human authoring bar. Introduced with D-PL-29._

## First: does PyLab need SQL Lab's structure? No — its pedagogy, not its shape.

SQL Lab grades by **output match**: it can show you the expected rows because the answer is unambiguous. PyLab deliberately **cannot** (D-PL-26): its moat is the **runs-but-wrong trap** — code that executes, returns a plausible number, and lies — which only works because there is *no answer key to diff against*. PyLab also has a **live runtime + glass-box cost view** SQL Lab lacks. So PyLab takes SQL Lab's proven *teaching moves* (business framing, skill-gradient, labeled debrief, forensic traps, scaffolded hints, empirical audits) and keeps its **own structure** (solve→output graded by a typed comparator, a judgment layer of methods + a verified trap + a method dial, no expected-output panel). Parity of pedagogy; divergence of structure.

## Lens A — SQL-Lab pedagogy parity (score each 1–5, floor 3)

1. **Data/business framing.** A real scenario an analyst/engineer would face — never "call `groupby`." Warmups may name the tool; core/stretch frame the outcome and let the solver choose the method.
2. **Difficulty calibration.** `warmup` = one obvious approach; `core` = a real method choice exists; `stretch` = method-rich, bridges to judgment. The stated difficulty matches the actual decision load.
3. **Distinctiveness.** Structurally different from its siblings in the same world — not a reskin.
4. **Insight quality.** Solving it teaches something that transfers, not a one-off trick.
5. **Trade-off clarity.** The debrief surfaces the alternative valid methods *and* names the runs-but-wrong trap and why it lies.
6. **Labeled debrief grammar.** Debrief uses the block markers — **`**Wrong answer that runs:**` and `**Sanity check:**` are mandatory**; `**Before you write:**`, `**Interviewer follow-up:**`, `**Approach:**` optional — so it renders as `DebriefBlocks`.
7. **Progressive hints.** ≥2, each a scaffold toward the answer, never the answer.

## Lens B — the interview-competence angle (score each 1–5, floor 3)

8. **Role × seniority accuracy.** Correctly tagged for which of SWE/DS/MLE/AIE/DA/BA/PA it serves and at which level (fluency → correctness → judgment → systems). The derivation in `pyLabMeta.js` holds, or is overridden with reason.
9. **Real interview moment.** Maps to a question an interviewer actually poses for those roles — the credibility cue (the company tag is representative, not a fabricated "asked at", per D-PL-25).
10. **The judgment test ("runs vs right").** The problem separates candidates on the thing interviews actually test: not "can you produce output" but "did you produce the *right* output, and do you know why the plausible alternative is wrong."

## Non-negotiables (pass/fail — a miss blocks the problem, regardless of score)

- **Glass-box named.** `glassBox.lesson` (or the debrief) states the cost/consequence, not just the fact.
- **Trap verified runs-and-diverges.** Every `isTrap` method executes without error and its output differs from the canonical (proven in CPython via `verify_py_methods.py`) — no oracle leak, no faked trap.
- **Honesty rule.** A genuinely single-method problem ships with an **empty dial** and no invented fork.
- **Execute-everything.** Solution + every method run in real CPython/pandas before shipping; expected output is never hand-written.
- **Mechanical gate green.** `audit_py.py` = 0 Tier-1, `verify_py_methods.py` = 0 failures, `py_content_scan.mjs` clean.

## Threshold to ship

Every dimension ≥ 3, **total ≥ 38/50**, and **all non-negotiables pass**. Anything below 38, or any dimension at 1–2, is rewritten before it enters the bank (the SQL-Lab empirical-audit discipline: score the batch, rewrite the misses, re-score).

## How it's applied

Each batch ships with a scorecard table (problem × 10 dimensions + total + non-negotiables pass) in the batch's verify output, and the mechanical gate must be green. The rubric is the human bar; the audit is the machine floor. A problem needs both.

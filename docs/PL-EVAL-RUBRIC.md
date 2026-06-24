# PL — Quality Eval Rubric

_The standing audit instrument for Programming Lab. Run this to grade any surface before shipping and during periodic health audits. Authority for "is this good enough." Companion to the four committed gates (which automate the PyLab-problem slice) and `docs/PYLAB-VISION.md` / `docs/CONTENT-STANDARD.md`. Established 2026-06-24._

## How to use it
- Each check is **T1 (blocks ship)** or **T2 (warn — log + fix soon)**, and **[auto]** (a gate/tool enforces it) or **[manual]** (human/LLM judgment).
- Verdict per check: **Pass / Warn / Fail**. Any **T1 Fail → do not ship** that surface. T2 Fails are logged in `AUDITS.md` with an owner.
- A surface "passes audit" when: 0 T1 Fails, and T2 Fails are logged. Record the run (date, surface, score) in `AUDITS.md`.
- The North Star, behind every check: **PL trains judgment, and never fabricates.** Everything is executed; nothing is hand-asserted; no claim we can't stand behind.

## The five honesty laws (any violation = T1 Fail, every surface)
1. **Execute, never assert.** Every expected output, trap divergence, model answer, cost number, and schema is produced by running real Python — not hand-written. (auto for problems; manual for prose)
2. **A trap must run AND diverge.** "Runs-but-wrong" means it executes cleanly and returns a different answer from canonical. No syntax-error "traps", no traps that just crash.
3. **No answer key for traps.** Output is shown shape-only (D-PL-26); the learner has no oracle to diff against — that's the lesson.
4. **Representative, not fabricated.** Company tags etc. are "the kind of place this is asked", never a verified "asked at X" (D-PL-25). No invented citations, metrics, or quotes.
5. **Honest emptiness.** A single-method problem ships an empty dial + empty mcqs, not a manufactured fork. A topic with no honest escalation gets no follow-up chain.

---

## 0. Cross-cutting (applies to every surface)
| # | Check | Tier | Auto/Manual |
|---|---|---|---|
| 0.1 | Full import-graph bundle (`esbuild --bundle src/App.jsx`) exits 0 — no dangling imports | T1 | auto |
| 0.2 | Data files: single quotes, apostrophes escaped `\'`, **no backticks/template literals**; `node --check` clean | T1 | auto |
| 0.3 | All colors via `var(--token)` — renders correctly in **both** Platinum (light) and Graphite (dark); no hardcoded hex that breaks a theme | T1 | manual + grep |
| 0.4 | Every `Icon name="…"` exists in `Icon.jsx` (unknown → renders null) | T2 | grep |
| 0.5 | Grids mobile-safe: `repeat(auto-fill, minmax(min(290px,100%),1fr))` (the inner `min()` prevents overflow) | T2 | grep |
| 0.6 | Spine current: CHANGELOG/STATUS/NEXT/DECISIONS reflect reality incl. **accurate deploy status** | T1 | manual |
| 0.7 | New global keydown shortcuts guard input/textarea/select **and `isContentEditable`** (the editor) | T1 | grep |

## 1. PyLab problem — the atomic unit (mostly automated by the 4 gates)
| # | Check | Tier | Auto/Manual |
|---|---|---|---|
| 1.1 | `solution` runs and returns the contract type; `solve(<fixture args>) → output` | T1 | `audit_py` |
| 1.2 | Fixture is **engineered** so the footgun can fire (NaN group, fan-out key, ties, chained-assignment target…) | T1 | manual |
| 1.3 | Code passes the AST sandbox (no banned imports/calls: os/sys/open/eval/exec/…) | T1 | `audit_py` |
| 1.4 | If multi-method: every **non-trap method ≡ solution** under `pl_compare` | T1 | `verify_py_methods` |
| 1.5 | ≥1 method `isTrap:true` that **runs and diverges** from solution | T1 | `verify_py_methods` |
| 1.6 | `compare` cfg correct for the output type (DataFrame/Series/ndarray/float/list/set/scalar) | T1 | `verify_py_methods` |
| 1.7 | Prompt **de-jargoned** (no technique-name giveaways: "sliding window", "groupby", "memoize"…) | T1 | `py_content_scan` |
| 1.8 | ≥2 hints; debrief present and **consistent with executed behavior** | T1 | `py_content_scan` + manual |
| 1.9 | `difficulty`/derived `level` sane; `roles[]` plausible; `estimatedMin` set | T2 | manual |
| 1.10 | **Honesty law 5**: single honest path → empty dial `{axes:[],rules:[]}` + `mcqs:[]` | T1 | manual |
| 1.11 | Schema regenerated (`build_py_schemas.py`) after any fixture/solution change | T1 | manual |

> Pre-commit: `audit_py` (T1=0) · `verify_py_methods` (0 failures) · `py_content_scan` (0) · `run_py --diverge` for new traps.

## 2. Judgment layer (`methods` + `dial` + `mcqs`)
| # | Check | Tier |
|---|---|---|
| 2.1 | `canonicalMethodId` resolves to a real method | T1 |
| 2.2 | Each method has `{id,name,code,tradeoff,breaksWhen}`; trap may add `detectionSignature` | T1 |
| 2.3 | `dial.rules[].rank[]` reference real method ids; `axes` are real decisions | T1 |
| 2.4 | MCQs: exactly one correct, distractors plausible (often = the trap), explanations honest | T1 |
| 2.5 | `breaksWhen`/`tradeoff` are specific and true (not generic filler) | T2 |

## 3. Showcase formats
| # | Surface | Check | Tier |
|---|---|---|---|
| 3.1 | **Ambiguity** (`pyLabFormats`) | exactly one `correct:true`, and it ≡ what the canonical solution does; wrong options are plausible misreadings | T1 |
| 3.2 | **Refactor** (`pyLabFormats`) | `slowCode` is a full `solve`, **correct** (≡ canonical via `pl_compare`) AND **slower at scale** (CPython-verified); `note` names the smell | T1 |
| 3.3 | **Follow-ups** (`pyLabFollowups`) | 2–4 **escalating** steps; every code-bearing answer **CPython-verified**; no padding (honesty law 5) | T1 |
| 3.4 | **Scale-it** (runtime) | only offered when ≥2 non-trap methods; the race shows a **real** cost divergence, not staged | T1 |
| 3.5 | All format content | decoupled file keyed by real problem id (0 unknown ids); bank untouched (no re-gating) | T1 |

## 4. Reference surfaces
| # | Surface | Check | Tier |
|---|---|---|---|
| 4.1 | **Trap Museum** (`pyLabTraps`) | pure lens over gated `methods[].isTrap`; every trap already verified; each has tradeoff or breaksWhen | T1 |
| 4.2 | **Schema** (`pyLabSchemas`) | introspected in CPython at build; **output shape-only, never values** (honesty law 3); regenerated on bank change | T1 |
| 4.3 | **Company tags** (`pyLabCompanies`) | representative + deterministic; **not** "asked at" (honesty law 4) | T1 |
| 4.4 | **Planned** (`pyLabPlanned`) | display-only; **never in `pyLabProblems`** (0 leak); gates/readiness/solved untouched; each stub has topic/level/seed | T1 |

## 5. Practice systems
| # | Surface | Check | Tier |
|---|---|---|---|
| 5.1 | **Spaced repetition** (`pyLabSR`) | SM-2 math correct (interval grows on pass, resets on lapse); tracks **only submitted**; due math right | T1 |
| 5.2 | **Mock-loop** (`MockLoop`) | timed, **no reveal/debrief/judgment** mid-session; scorecard correct; misses feed SR | T1 |
| 5.3 | Both | localStorage keys namespaced + independent of the solved-progress store | T2 |

## 6. Editor + runtime
| # | Check | Tier |
|---|---|---|
| 6.1 | `runPyLab` grades user `solve` vs canonical via the typed comparator `pl_compare` (fresh fixture each) | T1 |
| 6.2 | Editor themes via `--cm-*` tokens in both modes; active-line is a faint tint (text stays readable) | T1 |
| 6.3 | Autocomplete is **names-only** (arg + column names), no method/full-query completion | T1 |
| 6.4 | `Cmd/Ctrl+Enter` → Submit at `Prec.highest` (beats CM default) | T2 |
| 6.5 | Sandbox safety (`safety_check`) blocks banned imports/calls before running user code | T1 |

## 7. Gotchas (predict→reveal room)
| # | Check | Tier |
|---|---|---|
| 7.1 | Every Python snippet **verified against CPython**; the surprising behavior is real | T1 |
| 7.2 | Flow intact: predict MCQ → run → glass-box reveal → runnable fix → copy-as-post | T1 |
| 7.3 | The "fix" actually fixes it (runs, behaves) | T1 |

## 8. Foundations (KNOW)
| # | Check | Tier |
|---|---|---|
| 8.1 | Each module centers a **manipulable model the learner drives**, not a fixed snippet + MCQ (the re-scope bar, D-PL-21) | T1 |
| 8.2 | `live` models: every rendered frame computed by **real CPython in Pyodide** (id/is/values measured, not drawn) | T1 |
| 8.3 | Substrate honest: `live`/`sim`/`stepper`/`concept` chosen truthfully; **never faked interactivity** | T1 |
| 8.4 | `yourTurn` check gives **targeted** feedback, never bare "wrong" (D-PL-27) | T1 |
| 8.5 | Repeating shapes are config on a template (`StateTrace`/`ArrayTrace`), not N hand-written components (D-PL-24) | T2 |
| 8.6 | Registry integrity: every READY module reachable; no id typos; planned modules honestly marked | T1 |

## 9. UI / identity / accessibility
| # | Check | Tier |
|---|---|---|
| 9.1 | Platinum (light) + Graphite (dark) both coherent; one skin, two themes (D-PL-23); no green-screen reachable | T1 |
| 9.2 | Body text ≥ ~4.5:1 contrast on its background in both themes; muted/comment text legible (the lettering watch-item) | T1 |
| 9.3 | Red seam glyph used, **never the Apple logo** (trademark) | T1 |
| 9.4 | Full-screen rooms (PyLab) hide app chrome cleanly; Back returns to app | T2 |
| 9.5 | Keyboard: shortcuts discoverable + guarded; focus states visible | T2 |

## Audit procedure (a full pass)
1. Run the gates: `audit_py` (T1=0), `verify_py_methods` (0 fail), `py_content_scan` (0), and the full bundle (exit 0). → covers §0–§3 partly.
2. Sample-audit content by hand: pull ~5 problems per topic, walk §1–§4 manually (engineered fixture? honest dial? trap really diverges? debrief matches?).
3. Spot-check the formats: 3 ambiguity, 3 refactor, 3 follow-up chains against §3 (re-verify a code-bearing answer in CPython).
4. Click-through both themes for §6/§9 (editor readability, theme coherence, room behavior).
5. Foundations (§8): open 3 driven models, confirm they compute live and the substrate is honest.
6. Log the run in `AUDITS.md`: date, surfaces, T1 fails (→ block), T2 fails (→ owner + due).

## Automation coverage (and the gaps)
- **Automated today:** §1 (problem contract), §2 (method/trap integrity), §3.1–3.3 partial (content scans), §0.1–0.2 (build/syntax), §4.4 (planned-leak check).
- **Manual today (candidates to automate next):** engineered-fixture judgment (§1.2), debrief↔behavior consistency (§1.8), contrast/lettering (§9.2), escalation honesty (§3.3), Foundations substrate honesty (§8.3). A `pl_content_audit` that samples + re-executes would shrink this list.

# PYLAB — THE ARCHITECTURE (vision + roadmap)
_The blueprint for PyLab as the "Python judgment gym." Drafted 2026-06-24 from market research across DS/DA/BA/PA/SWE/MLE/AIE interviews, all seniorities. Bold by design — this is the destination; the roadmap (§9) sequences how we get there. Scope guardrail holds: PyLab is **programming/Python depth + data craft**, never ML/LLM theory (that's MSL/GSL — D-PL-15)._

---
## 0. The one bet (now validated by the market)

Every interview, every role, every level is testing the **same gap: code that *runs* vs code that's *right*.**
- DS/DA: the right metric, the missing-data trap, dedup, the denominator. Code *quality*, not theory.
- PA/BA: **notice the ambiguity, choose the metric, ask the clarifying question** before you write a line.
- SWE: juniors = fluency + output-prediction; seniors = internals (dict/set, GIL, memory), trade-offs, maintainability, architecture.
- MLE/AIE: clean production Python under time pressure, NumPy vectorization, **testing + APIs + scaling**, "explain your assumptions and edge cases."
- Take-homes: correctness-before-speed, reproducibility (seeds, deps), modules-not-notebooks, craft.

No one owns this. LeetCode grades algorithms. StrataScratch / DataLemur / InterviewQuery grade *output*. PyLab grades **judgment** — the multi-method fork, the runs-but-wrong trap, the cost curve, the craft rubric. That is the moat, and the market research says it's the thing that actually gets people hired at mid+ level.

> **The line:** "Everyone else checks if your code runs. PyLab checks if it's *right* — the way a senior interviewer does."

---
## 1. The two-axis content map: ROLE × SENIORITY

Every problem is tagged on two axes; the UI lets a learner pick a **track** and a **level**, and the bank re-weights + re-levels.

**Roles (tracks):** `SWE · DS · MLE · AIE · DA · BA · PA`. Same problem universe, different weighting and framing per track (a PA sees the metric-ambiguity framing; an SWE sees the internals/perf framing).

**Seniority ladder (the depth dial):**
| Level | What it tests | PyLab format weight |
|---|---|---|
| **Fluency** (junior) | syntax, the ops, output-prediction | Predict + Solve (single-method) |
| **Correctness** (mid) | edge cases, missing data, the obvious trap | Solve + Forensic |
| **Judgment** (senior) | multiple valid methods, trade-offs, the right metric, internals | the **judgment layer** + Refactor + Code-review |
| **Systems** (staff) | dataflow design, scaling, craft, leading the call | Scale-it + Take-home + Explain-it |

The dial isn't cosmetic: at Fluency a problem hides its judgment layer (just solve it); at Judgment it foregrounds the dial + MCQs; at Systems it adds the follow-up + the scale race.

---
## 2. The content pillars (the topic universe)

1. **Python core + internals** — the gotchas we have (is/==, mutable defaults, late-binding closures, generators) *plus* the senior internals the market names: dict/set implementation + complexity, GIL, memory model, `__slots__`, descriptors. (KNOW already seeds this.)
2. **DSA by pattern** — hashing, sliding window, stack/monotonic, heap, intervals, binary search, greedy, light DP. (Migrated — the drills.) Easy→medium ceiling (D-PL-07).
3. **pandas / numpy** — the analyst-native ops + the famous footguns. (Migrated.)
4. **Data craft** — cleaning, dedup, missing-data policy, time series, **metrics & the right denominator**, A/B basics, EDA reasoning. (Partly migrated; the richest senior-analyst vein.)
5. **Code craft (the senior layer almost nobody drills)** — testing (pytest, fixtures, mocking, parametrize), typing, OOP design + the dunder contracts, **refactoring**, **reproducibility** (seeds, deps, modules-not-notebooks), profiling/perf.
6. **Numerical / ML-adjacent (the Python of it, not the theory)** — vectorization, from-scratch metrics (rmse, softmax, cosine, one-hot), sklearn-style pipelines as *code*, save/load + an inference API shape.

---
## 3. The formats (the bold part — beyond solve→output)

The runner is a platform; each format is a thin mode over the same gated content + glass box. We have 3; here are the 9 the market demands.

| Format | What the learner does | The signal it trains | Status |
|---|---|---|---|
| **Predict** | call it before running; predict the output | fluency, the gotcha reflex | have (gotchas/KNOW) |
| **Solve** | write `solve()`, graded by output + judgment layer | correctness + method choice | have (PyLab) |
| **Forensic / Spot-the-Flaw** | code runs and lies — find the bug | the #1 differentiator; "runs ≠ right" | have (JUDGE) |
| **Refactor** | working-but-ugly/slow code → correct + idiomatic + fast | the senior craft signal; graded on the *diff* + a rubric + the glass-box race | **new** |
| **Code review** | read a "PR", flag the real flaws (multi-select) + write the comment | senior review judgment | **new** |
| **Ambiguity drill** | a vague business ask → *choose the metric/denominator first* (the `beforeWriting` made a first-class gate), then solve | the PA/DS signal: notice ambiguity, decide | **new** (beforeWriting → format) |
| **Scale-it (glass-box race)** | run on 10 rows then 10M; pick the approach that survives; see the cost curve | cost intuition, vectorize-vs-loop, the moat made a game | **new** |
| **Follow-up** | after you solve, the "interviewer" pushes: "now O(n)", "what if duplicates?", "which denominator?" — branches | the real interview loop | **new** |
| **Mock loop** | a role+level-calibrated timed set, then a debrief | the screen itself, under a clock | **new** |
| **Take-home** | a small multi-file mini-project graded on tests + **craft** (seeds, structure, reproducibility) | the senior take-home rubric no one else grades | **new** (BUILD seeds it) |
| **Explain-it** | articulate the trade-off in words; checked against the "interview phrasing" | communication — the staff signal | **new** |

The unifier: every format reuses the **fixture + canonical solution + the four gates**. A trap authored once is a Forensic bug *and* a JUDGE trap *and* a Refactor target *and* a Predict gotcha. Author depth once, surface it five ways.

---
## 4. The differentiators, productized

1. **The judgment layer** (methods · dial · mcqs) — scale it across the bank; it's the thing competitors structurally can't copy because they only grade output.
2. **The glass-box cost meter** — promote it from a footer to a *game*: the Scale-it race, cost-aware scoring ("correct, but 40× the memory"), a visible time/mem curve.
3. **The forensic/trap museum** — every `isTrap` is a reusable bug; build a browsable "Hall of Footguns" + spaced repetition so the trap you fell for *resurfaces* until you don't.
4. **The craft/reproducibility rubric** — the senior layer (tests, seeds, structure, typing) that take-homes grade and no drill site touches.
5. **Role + seniority calibration** — a 10-minute diagnostic that places you on the ladder per role, then a **readiness meter** ("Senior DS: 62% — weak on missing-data policy + the cost of apply").

---
## 5. The UI / offering

- **Pick a track + a level** on entry (or take the diagnostic). The bank re-weights and re-levels; the Progress room becomes a **readiness dashboard** per role/level with the gaps named.
- **Mock-interview mode** — calibrated timed set → debrief that cites your traps and your method choices.
- **The trap that haunts you** — spaced repetition: missed traps resurface on a schedule (the daily LinkedIn keystone feeds this).
- **Company tags** (`alsoAskedAt`) + **study plans** per role/company.
- **The judgment-terminal skin** — the shared BreakLabs visual direction (navy/mono/red-seam, the "trap crack" on a wrong answer) — *content depth first, skin second* (per the SQL-Lab handoff).
- **The follow-up + explain prompts** inline in the solve view; later, verbal mode.
- **A ladder map** — "here's what Staff-level judgment looks like on this exact problem; here's where you are."

---
## 6. Scope guardrails (so PyLab stays PyLab)

- **Programming + data craft, not domain theory.** MLE/AIE tracks drill the *Python* (vectorization, testing, APIs-as-code, pipelines-as-code), never model math or LLMs (MSL/GSL own those — D-PL-15).
- **Easy→medium DSA ceiling** (D-PL-07) — no contest-grade grind; PyLab is the fluency+judgment floor, not Codeforces.
- **Execute everything; honesty rule; gates before commit** (D-PL-20) — the trust contract is non-negotiable as we scale formats and roles.

---
## 7. Positioning (outside-the-scope, on purpose)

PyLab sits in the white space between **LeetCode** (algorithms, output-graded) and **StrataScratch / DataLemur / InterviewQuery** (SQL/pandas, output-graded). The wedge is the thing all of them skip and every senior interview tests: **judgment, craft, and the right call under ambiguity.** Distribution is already wired — every trap is a LinkedIn "watch it break" post (the keystone). Natural expansions: team/bootcamp interview-prep (B2B), a "readiness certificate" per role/level, and the cross-lab family (one judgment-terminal system across PAL/MSL/GSL/PL).

---
## 8. The metrics that matter
- **Readiness lift** per role/level (diagnostic→retest), not problems-solved.
- **Trap-resilience** (do you stop falling for a trap class) — the spaced-rep signal.
- **Method-choice accuracy** (judgment MCQs), not just pass rate.
- Distribution: traps-shipped-as-posts/week (the keystone stays alive).

---
## 9. Roadmap (phased; each phase ships gated + verified)

**Done:** the contract, four gates, runtime, judgment layer, 136 problems (pandas+drills+idioms+oop migrated). PyLab is the single DO bank.

**Phase 1 — make the bank legible (role + level).** Tag every problem with `roles[]` + `level` (fluency/correctness/judgment/systems); build the **diagnostic** + the **readiness dashboard**; surface `alsoAskedAt`. (Mostly metadata + one new page — high leverage, low risk.)

**Phase 2 — the showcase formats.** Build **Ambiguity drill** (promote `beforeWriting`), **Scale-it race** (promote the glass box), and **Refactor** — each a thin runner mode over existing content. These are the "whoa, nothing else does this" moments.

**Phase 3 — the interview loop.** **Follow-up** branches, **Mock-interview mode** (timed + debrief), **spaced-repetition** of traps + the trap museum.

**Phase 4 — craft + voice.** **Take-home mode** (multi-file + reproducibility rubric, BUILD evolved), **Code-review** format, **Explain-it** (then verbal), and the **judgment-terminal skin** across the family.

**Continuous:** author NEW depth (more footguns/judgment), keep the daily trap→post keystone running, gates after every batch.

---
_Sources behind the market read: StrataScratch, DataCamp, InterviewQuery (pandas/DS), IGotAnOffer/Exponent/InterviewQuery (MLE system-design by seniority), luminousmen / matacoder-senior / DataCamp (senior Python internals), AnalyticsVidhya/InterviewBit (DA), StrataScratch/InterviewQuery (PA/BA ambiguity), Medium/ADGEfficiency (take-home craft + reproducibility), GeeksforGeeks/InterviewBit (gotchas). Full links in the chat handoff._

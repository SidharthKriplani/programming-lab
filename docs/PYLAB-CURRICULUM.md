# PyLab — curriculum coverage + planned skeletons

_Audit 2026-06-24. PyLab vs PAL's PythonLab "Planned curriculum" (the 6-category page in `product-analytics-lab/src/pages/PythonLabBrowser.jsx`). Machine-readable map + authoring stubs: `src/data/pyLabPlanned.js` (UNIMPORTED — zero build/gate impact, like `foundationsRooms.js`). Verified against the live 136-problem bank by grep, not memory._

**Score: 14 covered · 4 partial · 7 planned (of 25).** The atomic skills and the interview/judgment layer are solid; the gaps cluster into two buckets — **Stats methods** and **End-to-End tasks** — and the End-to-End bucket *is* PyLab's empty **systems tier** (fluency 20 · correctness 18 · judgment 98 · **systems 0**), i.e. Phase-4 take-home content.

## Coverage by category

| Category | Item | Status | Where / gap |
|---|---|---|---|
| Core pandas | groupby + agg | ✅ | pandas-groupby (19) |
| Core pandas | merge safety | ✅ | pandas-merge: fan-out / validate / audit (5) |
| Core pandas | pivot_table cohorts | ⚠️ | pivot/reshape covered (5); cohort-framed pivots not yet → `plan-pandas-pivot-cohort` |
| Core pandas | apply vs np.select | ⚠️ | apply→`np.where` covered; `np.select` multi-branch absent → `plan-pandas-npselect` |
| Core pandas | data cleaning pipeline | ❌ | atomic ops exist; no end-to-end pipeline → `plan-e2e-cleaning` |
| Time Series | rolling averages | ✅ | window: smoothed 3-day average |
| Time Series | resample + WoW growth | ✅ | window: roll up to months + growth vs prior month |
| Time Series | pct_change pitfalls | ✅ | window: change from day before (+ unsorted trap) |
| Time Series | date arithmetic | ✅ | window: days signup→purchase; half-open range |
| NumPy & Stats | percentile distributions | ❌ | none (0 grep hits) → `plan-stats-percentile` |
| NumPy & Stats | weighted averages | ❌ | none → `plan-stats-weighted-avg` |
| NumPy & Stats | array operations | ✅ | numpy-vectorize: rmse, cosine, softmax, min-max (7) |
| NumPy & Stats | bootstrap in numpy | ❌ | none → `plan-stats-bootstrap` |
| Python stdlib | collections.Counter | ✅ | idioms: most-frequent, top-k tags |
| Python stdlib | defaultdict patterns | ✅ | idioms: group names by team; build a lookup |
| Python stdlib | itertools for analytics | ✅ | idioms: run-length / accumulate |
| Python stdlib | functools.reduce | ⚠️ | a fold idiom exists but not via `functools.reduce` → `plan-stdlib-reduce` |
| End-to-End | funnel in pandas | ❌ | none → `plan-e2e-funnel` |
| End-to-End | cohort LTV | ❌ | none → `plan-e2e-cohort-ltv` |
| End-to-End | user classification | ⚠️ | touched (new-user AOV, label high/low); no dedicated segmentation → `plan-e2e-user-classification` |
| End-to-End | retention matrix | ❌ | none → `plan-e2e-retention-matrix` |
| Interview Patterns | explain approach before coding | ✅ | Ambiguity drill + `beforeWriting` |
| Interview Patterns | catch silent bugs | ✅ | trap system + Trap Museum (100 traps) — merge inflation, unsorted pct_change |
| Interview Patterns | validate output row counts | ✅ | schema shape-only panel + merge-audit problem |
| Interview Patterns | narrate trade-offs | ✅ | judgment dial: methods + tradeoff/breaksWhen |

## Planned skeletons (11 stubs in `pyLabPlanned.js`)

Each stub carries `{ id, title, topic, level, curriculum, seed }`. The `seed` names the intended judgment/trap so the authoring pass starts with the lesson, not a blank page. **5 are systems-tier** (funnel, retention matrix, cohort LTV, cleaning pipeline, bootstrap) — authoring them populates the empty tier.

## How to author one (later)

A stub becomes a real problem the same gated way the rest of the bank was built:
1. Add the problem + fixture to a `pyLabBatch_*.js` on the PyLab contract: `solve(<args>) → output`, engineered fixture, ≥2 hints, executed debrief, and a judgment layer (canonical + ≥1 runs-but-wrong trap from the `seed`).
2. Run the four gates (`audit_py`, `verify_py_methods`, `py_content_scan`, + `run_py --diverge`) — 0 T1 failures, every non-trap ≡ solution, every trap runs-and-diverges.
3. Regenerate `pyLabSchemas.js` (`build_py_schemas.py`); the problem auto-tags onto the role/level axis (`pyLabMeta.js`) and the two-pane schema panel + autocomplete light up for free.
4. Remove its stub from `pyLabPlanned.js`; flip the curriculum status to `covered`.

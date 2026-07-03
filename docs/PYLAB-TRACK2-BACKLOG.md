# PyLab Track-2 Backlog — the content universe, by world × difficulty ladder × role

_The living tracker for filling PyLab's interview-content universe (D-PL-29, Track 2). Every problem clears `docs/PYLAB-CONTENT-RUBRIC.md` (two-lens bar) + the mechanical gate (`audit_py` 0 T1, `verify_py_methods` 0, `py_content_scan` 0). Update the counts + checkboxes as batches land. Companion to `docs/PYLAB-VISION.md` (the why) — this is the what-and-when._

## The difficulty ladder (a first-class axis — easy → advanced)

PyLab already derives a seniority level per problem (`pyLabMeta.levelOf`); the ladder maps to the interview arc:

| Ladder | PyLab level | `difficulty` | What it tests |
|---|---|---|---|
| **Easy** | fluency | warmup | one obvious op; build the reflex |
| **Medium** | correctness | core | the obvious edge case / the one trap |
| **Senior** | judgment | core/stretch | many valid methods → the right call + the runs-but-wrong trap + a dial |
| **Advanced** | systems | stretch | scale, craft, multi-step pipelines; the O(...) cost is the lesson |

> **UPDATE (end of 2026-07-03):** this section below was the ORIGINAL snapshot that motivated the program. It is now largely resolved — **264 problems, all 8 worlds populated, the difficulty ladder filled (9 stretch/systems problems, up from 0).** For the current numbers see `STATUS.md` → "Where we are now". The original snapshot is kept for context; the checklist further down is up to date.

**The gap (original, 2026-07-03):** every world was missing the top of the ladder — stretch = 0 and systems = 0 across the whole bank — and 4 worlds were empty. Filling senior/advanced was as important as filling the empty worlds. Ceiling stays easy→medium DSA (D-PL-07); "advanced" means depth of judgment/craft/scale, not contest algorithms. _(Resolved: all worlds populated; first 9 stretch/systems problems shipped.)_

## Coverage snapshot (ORIGINAL — 151 problems; superseded, see STATUS for current)

| World | total | easy(flu) | med(cor) | senior(jud) | adv(sys) | status |
|---|---|---|---|---|---|---|
| python-core (+idioms) | 71 | 12 | 12 | 47 | 0 | rich; **no advanced tier** |
| pandas-numpy | 55 | 8 | 6 | 41 | 0 | rich; **no advanced tier** |
| oop-design | 15 | 0 | 0 | 15 | 0 | thin on easy/medium + advanced |
| data-craft | 10 | 0 | 2 | 8 | 0 | new (shipped); grow to ~25 |
| dsa-patterns | 0 | — | — | — | — | **empty world** (DSA content currently mislabeled under python-core) |
| python-internals | 0 | — | — | — | — | **empty world** |
| code-craft | 0 | — | — | — | — | **empty world** |

_All the above are now resolved — see the checklist at the bottom of this doc and `STATUS.md`._

Two structural notes: (1) DSA problems (`two-sum`, `sliding-window`, `binary-search`, heap, intervals…) physically live under the `python-core` topic — a **taxonomy fix** (re-tag to `dsa`) would light up the DSA world without new authoring. (2) ML-from-scratch numerics already exist under `numpy-vectorize` (rmse, cosine-sim, softmax, one-hot).

---

## Bucket 1 — Basic Python data-structure manipulation (the reflex layer you called out)

_Worlds: python-core / idioms, extending into python-internals for the "why". The single densest interview bucket for every role. Target: a full easy→advanced ladder per structure._

**Lists & strings** — easy: index/slice/reverse, build with comprehension, in-place vs copy · medium: dedup preserving order, flatten one level, run-length encode, rotate, chunk into k · senior: dedup-order (dict vs set-seen, and the set-loses-order trap), two-pointer in-place, `list` vs `deque` for a queue (pop(0) is O(n)) · advanced: streaming top-k with bounded memory, stable partition, custom sort key with tie-break.

**Dicts** — easy: get/`setdefault`, keys/values/items, merge two dicts · medium: invert a dict (and the collision trap), group values by key (`defaultdict(list)` vs dict-comp-overwrites trap), count with `Counter` · senior: nested-dict traversal/update, `dict` ordering assumptions, merge with conflict policy, `Counter` arithmetic vs manual · advanced: build an inverted index, memoization store, LRU with `OrderedDict.move_to_end`.

**Sets** — easy: dedup, membership, union/intersection/difference · medium: find duplicates, common elements across lists, symmetric difference for a diff · senior: `O(n)` list-membership vs `O(1)` set (the glass-box race), unhashable-element trap, frozenset as a dict key · advanced: union-find (connected components), sliding-window distinct-count.

**Tuples / namedtuple / dataclass** — easy: unpack, swap, return multiple · medium: sort list of tuples by field, group records, `namedtuple` for readability · senior: tuple as dict key, immutability vs list, `dataclass(frozen=True)` · advanced: records → index → query pipeline.

**collections / heapq / itertools** — easy: `Counter.most_common`, `defaultdict`, `deque` append/popleft · medium: `heapq.nlargest`, `itertools.groupby` (and the must-sort-first trap), `accumulate`, `chain` · senior: top-k via heap vs full sort (cost), running median via two heaps, `groupby` streaming · advanced: k-way merge of sorted streams, bounded-memory frequency (Counter over a stream).

---

## Bucket 2 — Data manipulation (pandas/numpy + pure-python transforms)

_Worlds: pandas-numpy (mechanics) + data-craft (judgment). The DA/DS/PA take-home floor and ceiling. Target: fill medium→advanced, especially multi-step pipelines._

**Select / filter / sort** — easy: boolean filter, `nlargest`, sort by multiple keys · medium: `query`, multi-mask with `&`/`|` and the parens trap, `.loc` assignment vs `SettingWithCopy` · senior: chained-indexing trap (view vs copy), `where`/`mask` · advanced: conditional pipeline over a big frame, categorical dtype for memory.

**groupby / aggregate** — easy: group + mean/sum/count · medium: NaN-group `dropna` trap, named agg, `nunique`, filter-before-aggregate · senior: `transform` broadcast vs merge-back, top-n per group, rank within group, multiple aggs with different funcs · advanced: multi-key groupby pipeline, custom agg function, groupby over a stream/chunked.

**merge / join** — easy: inner merge on a key, keep-left · medium: left-merge + NaN, anti-join (no-orders), unmatched-key audit · senior: **duplicate-key fan-out trap** (cardinality blow-up), many-to-many, validate= · advanced: as-of/temporal join, join then aggregate pipeline, merge-order performance.

**reshape / window / time** — easy: `pivot_table`, `melt`, `cumsum`, `diff` · medium: `pivot` vs `pivot_table` (duplicate trap), rolling mean, `shift`, `resample` monthly · senior: long↔wide round-trip, window over groups, `pct_change` denominator trap · advanced: cohort/retention matrix, sessionization, calendar/gaps fill.

**numpy vectorize** — easy: vectorized arithmetic, `where`, min-max normalize · medium: broadcasting rules, boolean masking, `argsort`/`argmax` · senior: vectorize vs `apply` (the cost race), axis pitfalls, `np.where` chains · advanced: broadcasting a distance matrix, memory layout, avoiding a Python loop on 10M rows.

**data-craft judgment (analyst)** — shipped 10; grow to ~25: add cohort **retention matrix** (frame), **funnel drop-off with segments**, **A/B novelty/pre-period trap**, **guardrail vs north-star metric**, **outlier trimming policy**, **rate confidence (small-n)**, **session vs user vs event grain**, **churn vs dormant definition**, **weighted median**, **schema/dtype validation**.

---

## Bucket 3 — the other roles (DS/ML, AIE, SWE)

**ML-from-scratch numerics** (DS/ML/AIE) — have: rmse, cosine-sim, softmax, one-hot, accuracy, min-max. Add: k-NN classify, precision/recall/F1, confusion matrix, sigmoid + one gradient step, standardize (z-score), train/val split, entropy/gini, pairwise distances, IoU. _(pure numpy, verifiable.)_

**AI-engineering (pure-logic over fixtures, no live API — D-PL-29)** (AIE) — cosine-similarity semantic search (top-k retrieval), retrieval@k / recall@k, MRR, fixed vs recursive vs semantic chunking, dedup near-duplicate embeddings, LLM-as-judge scoring aggregation (faithfulness/relevance over provided scores), token-budget truncation, rerank by score, streaming-chunk assembly, JSON-output validation/repair.

**DSA by pattern** (SWE/ML/AIE) — re-tag existing python-core DSA to the `dsa` topic (taxonomy fix), then top up: hashing, two-pointer, sliding window, binary search, heap/top-k, intervals, prefix sum, stack (monotonic), BFS/DFS on a grid, 1-D DP. Easy→medium ceiling (D-PL-07).

**OOP & design** (SWE/ML/AIE) — have 15 (all senior). Add easy/medium: `__init__`/property basics, and advanced: iterator + context-manager protocols, registry/strategy pattern, `__slots__` for memory.

**python-internals** (SWE/ML) — `is` vs `==`, mutable default, late-binding closure, generator RAM vs list (glass-box), `__eq__`/`__hash__` contract, GIL intuition, shallow vs deep copy. (Several exist in Gotchas/Foundations — bridge or re-surface here.)

**code-craft** (all senior+) — assert/edge-case discipline, type hints + `Optional`, refactor a slow loop (ties to Refactor format), read-a-PR code review (ties to the future Code-review format), reproducibility/seeds.

---

## Build order (proposed) & status

- [x] **Data-craft v1** — 10 problems shipped (2026-07-03).
- [x] **Ladder batch 1** — 9 problems shipped (2026-07-03): data-structure manipulation (dedup-order, invert-multimap, group-consecutive, top-k-frequent), senior/advanced data manipulation (merge fan-out, chained-assign, multi-step net-revenue pipeline), ML-from-scratch (F1, z-score). **First 2 stretch/systems-tier problems.**
- [x] **DSA taxonomy fix** — done (2026-07-03): re-tagged 45 algorithmic drills to `dsa`; DSA world now has 50 problems + curated 3/7-day paths. 5 of 7 worlds populated.
- [x] **ML-from-scratch + AI-engineering world** — done (2026-07-03): new `ai-ml` world, 10 problems (k-NN, precision/recall, confusion, sigmoid, train-stat standardization; cosine top-k, recall@k, MRR, chunking, LLM-as-judge). 6 of 7 worlds now populated.
- [~] **Data-manipulation medium→advanced top-up** — started (fan-out, chained-indexing, pipeline). More multi-step + a scale race to go.
- [~] **Data-structures ladder** — started (4 senior traps). Easy/medium reflex tier + more structure-choice traps (set-vs-list membership, deque vs list, heap vs sort) still to fill.
- [ ] **Data-craft v2** — grow 10 → ~25.
- [x] **python-internals + code-craft worlds** — done (2026-07-03): 6 + 5 problems; **all 8 of 8 worlds now populated** (181 problems total). oop already had 15.
- [ ] **Placement diagnostic** — once worlds are populated (deferred in D-PL-29).

**Every batch:** verify all solutions + honest methods + traps in CPython first → wire → `audit_py`/`verify_py_methods`/`py_content_scan` all green → rubric-score the batch → update this tracker's counts + checkboxes.

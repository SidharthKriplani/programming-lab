# PL — NEXT (build queue)

_PL = Programming Lab (SWE-for-data fluency; D-07/D-15). React+Vite+Pyodide SPA. Repo: `github.com/SidharthKriplani/programming-lab`. Local: `labs/production-systems-lab`. Always read this + `STATUS.md` + `CLAUDE.md` before any session._

---

_Deployment note: PL 0.43.x — the "come-alive" program (D-PL-29) is essentially complete: **264 problems, all 8 worlds, the full Check/Submit/attempts/gated-reveal loop, structured inputs, the placement diagnostic, and deep linking (D-PL-30)**. Built + verified locally in batches, handed to Sidharth's Mac per batch (approve-first). Current state at a glance: STATUS.md → "Where we are now". **PyLab is PARKED to focus on PAL.**_

---

## ▶ When PyLab resumes — the backlog

Content authority: **`docs/PYLAB-TRACK2-BACKLOG.md`** (world × ladder × role, checkboxes) + **`docs/PYLAB-CONTENT-RUBRIC.md`** (the bar every problem clears). Everything in the original come-alive report is done: all 8 worlds populated, learning paths curated, empty worlds hidden, diagnostic built, difficulty ladder complete, 30 pandas + 30 python common-band breadth, 12 FAANG skeletons stubbed, deep linking.

**Remaining, roughly in priority:**
1. **Author the 12 FAANG skeletons** into real gated problems (`pyLabPlanned.js` curriculum "FAANG interview" → a new `pyLabBatch_faang.js`): LRU cache, median-of-stream, top-K buckets, LIS, num-islands, coin-change, word-break, longest-substring, merge_asof, top-N-per-group-ties, sessionize, rolling-per-group. Verify-first; note these sit ABOVE the easy→med charter (D-PL-07) — an intentional exception.
2. **Wire the Scale-race** onto the multi-step pipeline / stretch problems so the glass-box cost view pays off (ScaleRace already renders in the reveal; give the pipeline problems bench-worthy method variants).
3. **Per-item deep links** for foundations modules / judge / build (rooms are addressable via `#/<view>`; items are not yet — extend the `src/utils/hashRoute.js` pattern already used by PyLab + Gotchas). See D-PL-30.
4. **oop + python-internals warmups** (their easy tier is thin/absent) + continued depth per the backlog buckets.
5. **Grow ambiguity / refactor / follow-up coverage** (`pyLabFormats.js`, `pyLabFollowups.js`) toward ~40–50% of the bank.

**Every content batch:** author → CPython-verify solutions + honest methods + traps (traps must run AND diverge) → `node scripts/_extract_pylab.mjs out.json && python3 scripts/audit_py.py out.json && python3 scripts/verify_py_methods.py out.json && node scripts/py_content_scan.mjs out.json` (all 0) → regenerate `pyLabSchemas.js` → wire → hand Sidharth the commit.

---

## ⏸ Tutorial ladder (0.37.0, in progress, lower priority)

Python lessons **1–5 authored** (values, numbers, text, booleans, lists — 20 tasks, CPython-verified). Lessons 6–18 + pandas section are planned stubs in `src/data/pyTutorial.js`.

**Next:** Python lessons 6–13 (dicts · sets/tuples · if · loops · enumerate/zip · comprehensions · functions · *args/**kwargs). Author → CPython-verify (correct passes, starter fails) → flip `status:'ready'` — appears automatically.

Authority: `docs/PYLAB-TUTORIAL-SPEC.md`. Decision: D-PL-28.

---

## ⏸ KNOW Foundations F2/F3 (lower priority, mostly authoring)

19 driven models across all 7 rooms (F0/F1 complete). Two config templates: `StateTrace` (binding/identity ×4) + `ArrayTrace` (DSA traces ×3).

**Remaining work (F2/F3):**
- `git rm` the 5 superseded bespoke files (Aliasing/CopyVsView/TwoPointer/SlidingWindow/BinarySearch — sandbox couldn't delete last session)
- Author planned modules' predict→read text alongside the existing widgets (mostly text authoring, no new engineering)
- Extend `yourTurn` to more read-run modules

Authority: `docs/FOUNDATIONS-SPEC.md`. State: `STATUS.md` KNOW section.

---

## Standing rules (always)

- **Pre-commit (PyLab):** `node scripts/_extract_pylab.mjs out.json && python3 scripts/audit_py.py out.json` — 0 T1 failures before commit.
- **macOS-only build.** Sandbox can't `npm run build` (Rollup ARM64). Prepare commands, Sidharth runs on Mac.
- **Approve-first.** `git push` auto-deploys to Vercel. Never auto-push.
- **Lock files:** `rm -f .git/index.lock .git/HEAD.lock` before every git operation.
- **Single quotes only in `src/data/*.js`.** Escape apostrophes as `\'`. No backticks.
- **Close ritual:** update STATUS.md + append LINEAGE.md + rewrite NEXT.md before ending any session.

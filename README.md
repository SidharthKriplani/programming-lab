# Programming Lab

The SWE-for-data fluency lab — the Python, DSA, and pandas fluency that analytics and ML work assumes you already have. Practice the Python traps that pass code review and fail in production — **predict the output, watch it break, keep the reflex.** Real CPython, in your browser, via Pyodide.

Part of [BreakLabs](https://github.com/SidharthKriplani) — _how real data & AI systems work, and how they silently fail._

**Live:** [programming-lab.vercel.app](https://programming-lab.vercel.app)

## The idea

Not a LeetCode clone. Every problem is a loop: **predict the output → run it for real → see exactly what the machine did → run the fix.** You don't just pass a test — you feel why the slow or wrong way is slow or wrong. That glass-box cost view is the differentiator.

## Banks

- **PyLab** (live) — the judgment gym: **264 problems across 8 worlds** (Python Core · pandas & numpy · DSA Patterns · Python Internals · OOP & Design · Data Craft · Code Craft · AI/ML Craft), easy → advanced. Each problem is `solve()`→output graded by a typed comparator, with a runs-but-wrong trap, a glass-box time/memory readout, and a judgment layer. Loop: **Check** (run your code) → **Submit** (grade + attempt history) → **gated reveal**. A "Find my level" placement diagnostic + curated learning paths route you through it.
- **Python Gotchas** (live) — 23 traps that survive code review and fail in production: mutable defaults, aliasing, late binding, `is` vs `==`, generator exhaustion, `O(n)` membership, floating-point, and more. Each doubles as a shareable post.
- Also live: **Foundations** (KNOW, driven models), **Mini-Projects** (BUILD), **Spot-the-Flaw** + **Trap Museum** (JUDGE), and a beginner **tutorial ladder**.

The four navigation frames map to the BreakLabs Competence Model: **KNOW → DO → BUILD → JUDGE.** Every surface is deep-linkable — `#/pylab/<problem>`, `#/gotchas/<id>`, `#/<room>`.

## Stack

React + Vite SPA · Pyodide (in-browser CPython) · CodeMirror 6 · localStorage. No backend, no install — open a problem and run Python.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # macOS
```

Internal docs and the build spec live in `docs/`. Read `CLAUDE.md` before contributing.

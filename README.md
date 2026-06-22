# Programming Lab

The SWE-for-data fluency lab — the Python, DSA, and pandas fluency that analytics and ML work assumes you already have. Practice the Python traps that pass code review and fail in production — **predict the output, watch it break, keep the reflex.** Real CPython, in your browser, via Pyodide.

Part of [BreakLabs](https://github.com/SidharthKriplani) — _how real data & AI systems work, and how they silently fail._

**Live:** [programming-lab.vercel.app](https://programming-lab.vercel.app)

## The idea

Not a LeetCode clone. Every problem is a loop: **predict the output → run it for real → see exactly what the machine did → run the fix.** You don't just pass a test — you feel why the slow or wrong way is slow or wrong. That glass-box cost view is the differentiator.

## Banks

- **Python Gotchas** (live) — 23 traps that survive code review and fail in production: mutable defaults, aliasing, late binding, `is` vs `==`, generator exhaustion, `O(n)` membership, floating-point, and more. Each one doubles as a shareable post.
- **pandas / numpy** · **DSA by pattern** · **Python idioms** — next.

The four navigation frames map to the BreakLabs Competence Model: **KNOW → DO → BUILD → JUDGE.** PL's first surface is the **DO** (fluency) rung.

## Stack

React + Vite SPA · Pyodide (in-browser CPython) · CodeMirror 6 · localStorage. No backend, no install — open a problem and run Python.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # macOS
```

Internal docs and the build spec live in `docs/`. Read `CLAUDE.md` before contributing.

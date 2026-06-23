# CLAUDE.md — PL Session Briefing

Read this first, every session. Fastest path from cold start to productive work. This file is the authority for PL; when a build instruction is unclear, this beats memory (per `BreakLabs/CLAUDE.md`).

---

## Working relationship

Act as a product + engineering partner, not an assistant. Push back when something is wrong or over-scoped. Give an honest opinion before executing. Don't pipeline every input into the backlog — most things don't belong there. Name real costs and risks plainly. The job is a good product, not a productive-feeling session.

---

## What PL is (5 lines)

**Programming Lab (PL)** is the SWE-for-data fluency lab — the Python, DSA, and pandas fluency the analytics/ML labs assume you already have (HQ **D-07**; the FLUENCY rung of the Competence Model, **D-15**). React + Vite SPA running real CPython in-browser via **Pyodide**, with a **glass-box** layer that shows the time + memory each run actually costs. localStorage-only (no auth yet). Deployed on Vercel. GitHub repo: `github.com/SidharthKriplani/programming-lab`. Local folder: `labs/production-systems-lab` (slug renamed, folder kept). Current: PL 0.2.0.

---

## Scope constraint (non-negotiable)

PL stays within **coding fluency for data people**: Python (gotchas · idioms · OOP), DSA by-pattern (easy→medium, no contest grind), pandas/numpy. Full surface area + tiers + schema: `docs/PL-BUILD-SPEC.md`. Not a fourth domain lab, not a LeetCode clone — the moat is the glass-box cost view + the judgment dial, not problem volume.

---

## Non-negotiable code rules

### Data files (`src/data/*.js`) — build-breaking if violated
- **Single quotes only**; escape apostrophes as `\'` (e.g. `'product\'s metric'`).
- **No template literals (backticks)** in data files — Rolldown/Vite parse error.
- Python snippets are stored as `\n`-joined single-quoted strings. **Verify every snippet's output in real CPython before transcribing** (Pyodide ships CPython 3.11; outputs must be stable there).

### Components — reuse, don't reinvent (HQ DESIGN-STANDARD)
PL inherits sibling components: `PythonCell` (the Pyodide runner, adopted from MSL), PAL `Sidebar`/`Icon`/`ForwardPointerCard`, MSL `HowToStrip`, synthesized `GateOverlay`, PAL `unlock.js`. Don't rebuild these. Room pages use `React.lazy()` + the named-export pattern; `<Suspense>` wraps `<main>`.

### IDE / glass-box
`PythonCell` runs code in Pyodide (currently **main-thread**, per MSL — a worker move is logged debt, see AUDITS). `runPythonGlassBox()` returns `{stdout, timeMs, peakKb, error}`; the footer renders the cost. `raceMethods()` is ready for the future DSA canonical-vs-brute race. Don't add a second Pyodide loader.

### CSS — variables only, the Instrument theme
Dark-first **Instrument** identity (`src/index.css`): violet `--accent #8B5CF6` on void `--bg #0A0A0B`; gold `--yellow` = signal, red `--red` = break, green `--green` = fix (BreakLabs master palette). Light "Field Notes" mode via `:root[data-theme='light']`. Always use `var(--token)` + the `.pal-*` animation utility classes — never hardcode colors or write ad-hoc keyframes. Theme toggle: `src/utils/theme.js` (`[data-theme]` on `<html>`, localStorage `pl-theme-v1`, inline anti-flash script in `index.html`).

### Mobile grid
`gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))'` — the inner `min()` prevents mobile overflow.

### Paywall
`isUnlocked()` in `src/utils/unlock.js` returns `true` (beta). Don't change. `GateOverlay` is wired but passthrough until Stripe.

---

## File structure (what matters)

```
src/
  App.jsx                  — state routing (home ↔ gotchas), lazy pages, Suspense
  index.css                — Instrument theme tokens + [data-theme=light] + .pal-* animations
  main.jsx                 — initTheme() + mount
  data/gotchaProblems.js   — Bank A (23 gotchas, 7 clusters) + CLUSTERS map
  pages/GotchaBrowser.jsx  — DO-room browser (cluster-grouped, mobile-safe)
  pages/GotchaRunner.jsx   — predict → run → reveal → fix → copy-as-post
  components/ide/          — PythonCell.jsx, pyodideRuntime.js, glassbox.js
  components/layout/Sidebar.jsx — KNOW/DO/BUILD/JUDGE nav (D-15) + theme toggle + wordmark
  components/shared/       — Icon, HowToStrip, GateOverlay, ForwardPointerCard
  utils/                   — unlock.js, gotchaProgress.js, theme.js
public/favicon.svg         — break-glyph monogram
_legacy/                   — archived Dec-2024 infra lab (FastAPI/Docker) — do not revive
docs/                      — PL-BUILD-SPEC + operational spine (see below)
```

---

## Dev + commit workflow

```bash
npm run dev      # local
npm run build    # macOS only — sandbox can't (Rollup ARM64). MUST pass before push.
```

### Pre-commit audit (run before every commit that touches problem data)
The committed quality gate — the Python analog of PAL's `audit_sql_lab.py`. **0 Tier-1 failures required before commit.**
```bash
python3 scripts/audit_problems.py   # runs every solution+test, verifies gotcha outputs, AST-safety, required fields. Exit 1 on any T1.
```
Tier-2 warnings (e.g. missing `hints[]`) don't block but are the content-depth roadmap. Standard the audit enforces: `docs/CONTENT-STANDARD.md`. **Never hand-maintain expected outputs** — the solution is the source of truth, verified against its own `__pl_checks`.

### Git (approve-first — never auto-push)
Push **auto-deploys to Vercel** (`programming-lab.vercel.app`). Prepare commands; Sidharth reviews + runs them on his Mac.
```bash
cd ~/Documents/Professional/BreakLabs/labs/production-systems-lab
rm -f .git/index.lock .git/HEAD.lock        # the iCloud lock quirk — always clear first
npm run build
git add -A
git commit -m "PL x.y.z: ..."
git push origin main
```
- **Remote is `programming-lab`** (slug renamed); local folder stays `production-systems-lab`.
- **Hand over COMMENT-FREE commands** — Sidharth's zsh has no `interactive_comments`, so inline `# ...` gets parsed as args and breaks the line. Put notes in prose, not in the command block.

---

## Adding a new bank (B2 pandas, B3 DSA, B4 idioms — checklist)
1. `src/data/[bank]Problems.js` — single quotes, escape apostrophes, verify outputs in CPython. Use the B-ready §4 schema (`methods[]/dial/mcqs/glassBox`); gate depth by tier (`docs/PL-BUILD-SPEC.md` §6).
2. `src/utils/[bank]Progress.js` — localStorage key `pl-[bank]-progress-v1`.
3. `src/pages/[Bank]Browser.jsx` + `[Bank]Runner.jsx` — named exports; reuse PythonCell + glass-box.
4. `src/App.jsx` — lazy import + route. `src/components/layout/Sidebar.jsx` — nav item under the right frame.
5. For pandas (B2): lazy-load the Pyodide pandas/numpy wheels on first pandas problem only (spec §5).
6. **Run `python3 scripts/audit_problems.py` — 0 Tier-1 failures before commit** (`docs/CONTENT-STANDARD.md`). Verify every solution+test in CPython/pandas; the audit is the gate.

---

## MD spine (PL)

| File | Purpose |
|---|---|
| `CLAUDE.md` | This file. Read every session. The authority. |
| `README.md` | Public-facing what/why. |
| `CHANGELOG.md` | Version log (PL 0.x at top; legacy infra entries below, superseded). |
| `STATUS.md` | Cold-start "where are we" view. Read at session open. |
| `NEXT.md` | Build queue / HQ dispatch (D-13). Read at session open. |
| `LINEAGE.md` | Narrative history. Append one line per meaningful turn. |
| `DECISIONS.md` | PL-specific standing decisions (D-PL-xx). |
| `AUDITS.md` | Health + known debt. |
| `IDEAS.md` | Tiered backlog. |
| `docs/PL-BUILD-SPEC.md` | The full build spec — banks, variety bar, schema, IDE, tiers, build order. |
| `docs/CONTENT-STANDARD.md` | The pedagogical + mechanical bar every problem clears (mirrors PAL's SQL-CONTENT-STANDARD). Enforced by the audit. |
| `scripts/audit_problems.py` · `scripts/_extract_problems.mjs` | The committed quality gate (Tier-1 blocks / Tier-2 warns) + its JS-data extractor. |
| `CONTENT_QUEUE.md` · `DISTRIBUTION_PLAYBOOK.md` | LinkedIn distribution (Bank-A gotchas double as posts). |

**Note on location (D-PL-08):** PL's operational spine (STATUS/NEXT/LINEAGE/DECISIONS/AUDITS/IDEAS) lives at the **lab root**, matching the siblings (Sidharth's call). Only governing specs live in `docs/` (currently `PL-BUILD-SPEC.md`). HQ `PROTOCOL.md`/D-13 still say dispatch to `docs/NEXT.md` — for PL that target is **root `NEXT.md`** (flagged for HQ in `HQ/LEDGER.md`).

### Close ritual (non-negotiable)
Before ending a build session: update `STATUS.md`, append to `LINEAGE.md`, rewrite `NEXT.md`. A session is done when the statefulness is written, not when the work is.

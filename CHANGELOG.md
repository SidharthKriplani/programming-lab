# Changelog

All notable changes to the Production Systems Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [PL 0.3.0] - 2026-06-23 — BreakLabs logo (D-19)

> The unified BreakLabs lockup lands. `break⌇labs · Programming` — one brand, distinct rooms.

### Added
- **`BrandMark` component** (`src/components/shared/BrandMark.jsx`) per `HQ/BRANDMARK-ROLLOUT.md` (D-19). Three variants (full / wordmark / monogram). Constant across all labs: the red fault-glyph seam + the `break⌇labs` wordmark. Per-lab: descriptor `Programming` + violet `#8B5CF6` accent.
- Wired into **7 slots**: sidebar header (full), favicon (shared red monogram), OG share card, hero (wordmark), gate header (wordmark), footer (wordmark + "part of BreakLabs"), loading (monogram).
- **OG share card** — `public/og-image.png` (1200×630, the instrument card + lockup) + `og:`/`twitter:` meta in `index.html`.

### Changed
- Favicon is now the shared BreakLabs red glyph (was the violet PL stopgap — archived to `_legacy/`, D-18).

## [PL 0.2.0] - 2026-06-23 — Instrument identity + dark/light

> PL stops wearing PAL's skin and takes its own. Direction: **Instrument** (the BreakLabs "dark glass-box that exposes the machine"), the most on-brand and most distinct of three proposed.

### Added
- **Instrument theme (dark-first):** void `#0A0A0B` base, panel surfaces, **violet `#8B5CF6`** accent (PL's assigned BreakLabs track colour), with the master semantics — gold `#F2B233` = signal, red `#FB5247` = break, green `#19C37D` = fix. Type switched to **Inter + JetBrains Mono** (the brand's display + voice).
- **Light "Field Notes" mode:** warm paper `#F4F1EA` + ink, violet kept. Toggled via `[data-theme]` on `<html>` (the sibling-lab mechanism), saved to `localStorage`, with an inline anti-flash script in `index.html`. Toggle (sun/moon) lives in the sidebar footer.
- **break-glyph identity:** `public/favicon.svg` (fault-glyph monogram, violet + gold) replacing the 404; the `break⌇labs` wordmark + fault-glyph mark in the sidebar.
- New `src/utils/theme.js`; `sun`/`moon` added to `Icon.jsx`.

### Notes
- Token swap only — no component rewrites. esbuild bundle verified (exit 0). Build/deploy on push (Vercel connected).

## [PL 0.1.0] - 2026-06-23 — Re-scope to Programming Lab + B0/B1

> Lab re-scoped from **Production Systems Lab** (infra ops) to **Programming Lab (PL)** — the SWE-for-data fluency lab (HQ D-07/D-15). The Dec-2024 infra modules below are archived in `_legacy/`. From here, this changelog tracks PL.

### Added
- **B0 — SPA foundation:** React + Vite + Pyodide app, sibling-consistent with PAL/MSL/GAL. Theme = PAL `index.css` tokens + `.pal-*` animation classes. Sidebar (KNOW/DO/BUILD/JUDGE), Icon, HowToStrip, ForwardPointerCard, GateOverlay (beta passthrough), unlock.
- **MVP IDE + glass-box:** `PythonCell` — CodeMirror 6 editor running real CPython via Pyodide 0.25.1. Glass-box built in immediately: stdout + wall time (`perf_counter`) + peak memory (`tracemalloc`), plus a `raceMethods()` helper for the future DSA canonical-vs-brute race.
- **B1 — Bank A (Python Gotchas):** 23 problems, 7 clusters. Each is predict-MCQ → runnable code → glass-box reveal → runnable fix → "Copy as LinkedIn post". Seeded by PY1–PY7; 16 newly authored. Every snippet verified in CPython.
- **Pages:** `GotchaBrowser` (cluster-grouped, mobile-safe grid) + `GotchaRunner`; `App` lazy-routes home ↔ gotchas.

### Changed
- Archived legacy infra (FastAPI/Docker/`modules`/`api`/`frontend`) to `_legacy/`.

### Notes
- Not yet `npm install`/`vite build`'d (macOS-only). Repo slug rename deferred. Pyodide currently main-thread (per MSL) — worker move flagged.

## [Unreleased — legacy infra, superseded]

### Planned
- Module 3: Observability & Monitoring
- Module 4: Deployment & Infrastructure
- Module 5: Building for Scale
- Module 6: Real-World Systems

---

## [0.2.0] - 2024-12-27

### Added - Module 2: Databases & Performance
- **Main application** (`app.py`)
  - SQLite database with async queries
  - User and Post tables with proper schema
  - Endpoints demonstrating N+1 problem vs optimized joins
  - `/comparison/slow` endpoint (N+1 problem)
  - `/comparison/fast` endpoint (optimized join)
  - `/seed` endpoint for test data
  - Connection management with async

- **Module 2 README**
  - Database design principles
  - Query optimization strategies
  - Index design and impact
  - Connection pooling concepts
  - Performance testing patterns

- **Exercise 1: Schema Design**
  - Bad vs good schema comparison
  - Relationships and foreign keys
  - Index impact on performance
  - Composite indexes

- **Dependencies**
  - Added `aiosqlite` for async SQLite

### Key Features
- ✅ Real performance comparison (N+1 vs JOIN)
- ✅ SQLite for zero-setup database
- ✅ Proper schema design with constraints
- ✅ Index strategy demonstrations
- ✅ Seed data for experimentation

### Architecture
```
Module 1: Async APIs          → Why async matters
    ↓
Module 2: Databases           → What you're making async calls to
    ↓
Module 3: Observability       → Monitor what's happening
    ↓
Module 4: Deployment          → Ship to production
    ↓
Module 5: Scaling             → Handle 10,000s of requests
    ↓
Module 6: Real-World Systems  → Put it all together
```

---

## [0.1.0] - 2024-12-27

### Added
- **Initial Project Setup**
  - Project structure and organization
  - Virtual environment configuration
  - Development dependencies

- **Module 1: Async APIs & Concurrency**
  - Comprehensive README explaining async/await
  - Main application demonstrating sync vs async
  - Exercise 1: Basic async concepts (5 examples)
  - Test suite with pytest
  - Makefile with common commands
  - Docker Compose for local services

- **Documentation**
  - Root README with 6-module learning path
  - QUICKSTART guide
  - Project structure docs

- **Configuration**
  - `.gitignore`, `.env.example`, `requirements.txt`

---

## Development Notes

### Session 1: Module 1 (Dec 27)
- Created comprehensive project scaffolding
- Module 1 fully implemented
- Educational focus over production optimization

### Session 2: Module 2 (Dec 27)
- Built Module 2 with real database examples
- Demonstrated N+1 problem vs optimized queries
- Added performance comparison endpoints
- Created Exercise 1 on schema design
- Switched from Vercel to local development

### Next Steps
- Get feedback on Module 1-2
- Implement Exercises 2-5 for Module 2
- Plan Module 3 (Observability)
- Deploy to Railway or similar when ecosystem is complete

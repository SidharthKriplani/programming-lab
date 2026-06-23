# SKIN SYSTEM — PL's pluggable look architecture

_How PL swaps its entire visual world in one line. Standing decision: **D-PL-19**.
The authority for the skin **mechanism**. Each skin's internal look has its own spec
(e.g. the green terminal is governed by `GREEN-SCREEN-IDENTITY.md`)._

---

## 0. The idea

A **skin** is the whole visual world — chrome family + palette + fonts — not just a color.
It is applied as `[data-skin]` on `<html>` and swapped with a single call. The content and
logic underneath (problems, the runner, Pyodide, progress, routing) never change. Swap the
skin, the look changes; nothing else moves. This is the "plug" — change the plug, change the skin.

Skin is a **separate axis** from the dark/light theme toggle. A skin brings its own palette;
within the green-screen skin the dark/light toggle still applies, but Platinum just looks like Platinum.

---

## 1. The skins

| Skin | Status | What it is |
|---|---|---|
| `platinum` | **ACTIVE (default)** | Classic Mac OS 8/9 Platinum workstation — light, beveled, Apple menu bar, rainbow apple. The launcher/desktop. |
| `greenscreen` | live (secondary) | The P1 phosphor CRT terminal (`GREEN-SCREEN-IDENTITY.md`). Will live inside terminal windows. |
| `aqua` | reserved | Mac OS X Aqua terminal (the glossy window + Matrix reveal). |
| `hybrid` | reserved | Platinum desktop that opens Aqua terminals — the layered model. |

**Platinum supersedes the green-screen as the active look (Sidharth's call).** Green-screen is
not deleted — it becomes the skin used inside the terminal windows in a later unit.

---

## 2. The mechanism (how it works)

- **`src/utils/skin.js`** — `getSkin / setSkin / applySkin / cycleSkin / initSkin`, default `platinum`,
  persisted to `localStorage['pl-skin-v1']`. `cycleSkin()` flips platinum ⇄ greenscreen.
- **`<html data-skin="…">`** — set by an anti-flash inline script in `index.html` (before paint) and
  by `initSkin()` in `main.jsx`.
- **`src/index.css`** — each skin is a token block `:root[data-skin='<name>']` that overrides the
  base tokens (`--bg`, `--surface`, `--text`, `--accent`, `--font-ui`, `--radius`, bevels, …). The
  Platinum block is **appended last** so it wins over the green-screen tokens when active. Skins also
  carry scoped chrome rules (e.g. `:root[data-skin='platinum'] .pal-btn-primary { … }`) and
  **suppressors** (Platinum hides the CRT scanlines + phosphor glow).
- **Chrome components** that only exist in one skin are gated in React: `App.jsx` renders
  `<PlatinumMenuBar/>` only when `skin === 'platinum'`. A skin-cycle button sits in the sidebar footer.

Because almost everything reads CSS variables, a skin mostly = one token block. Only genuinely
structural chrome (the Apple menu bar, later the terminal window) needs a gated component.

---

## 3. How to add / change a skin

1. Add the name to `SKINS` in `skin.js` (already includes aqua/hybrid).
2. Add a `:root[data-skin='<name>']` token block at the end of `index.css` (palette, fonts, radii, bevels)
   + any scoped chrome rules + suppressors for treatments that shouldn't apply.
3. If the skin needs structural chrome, build the component and gate it on `skin === '<name>'` in `App.jsx`.
4. That's it — `setSkin('<name>')` switches to it. No rebuild of content/logic.

**Rule:** a skin must never touch problem data, the runner, or progress. Look only.

---

## 4. Platinum skin — the look (unit 1)

- **Desktop** teal-gray (`#6f8a8a`); windows are Platinum gray (`#dcdcdc`) with 1px black borders + soft bevels.
- **Apple menu bar** fixed at top: rainbow apple, `Programming Lab File Edit View Run Special`, live clock.
- **Font** Helvetica/Geneva (classic Mac system feel); code stays Courier.
- **Selection** = classic light-blue highlight (`#b8c8e8`) with black ink.
- **Sharp radii**, flat shadows (`1–3px` hard offset), beveled buttons/cards. No CRT scanlines/glow.

### Not in unit 1 (next units)
- Problems as `.py` files in a literal **Finder list window**, double-click → opens a **terminal**
  (the `greenscreen`/`aqua` skin) with the **Matrix reveal** (run-overlapped). That's the `hybrid` skin.
- This unit ships the Platinum **skin + system**; the Finder-window + terminal interaction is the deliberate next step.

---

## 5. Open items
- Tune Platinum once live (desktop tone, bevels, menu-bar density, Finder-style list views per room).
- Build the terminal window (greenscreen/aqua skin) for a single problem — the next unit.
- Decide the dark/light toggle's role under Platinum (currently hidden; Platinum has one palette).

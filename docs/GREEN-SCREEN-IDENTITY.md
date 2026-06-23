# GREEN-SCREEN IDENTITY — PL's governing design spec

_The single authority for how Programming Lab looks. If a screen, component, or token
disagrees with this file, the screen is wrong. Every visual change to PL's **dark mode**
must be checked against this doc. Standing decision: **D-PL-18** (supersedes the violet
"Instrument" pick, D-PL-04)._

---

## 0. The idea (read this first)

PL is the **old-school green-screen terminal** — a P1 phosphor CRT. It is the base layer
everything boots into; the lab under MSL and GSL. The identity is **nostalgic and total**:
it is not a modern dark UI with a green accent. It is a green monochrome monitor.

Two failure modes already burned us. Do not repeat them:

1. **A flat modern UI tinted green is NOT the identity.** The look comes from the *treatment*
   — monospace bitmap font, scanlines, glow, inverse-video, box-drawing panels — not the hue.
2. **A modern sans (Inter) kills the whole thing.** If the lettering has curves, it is not a
   terminal. The period font is non-negotiable.

This identity lives in **dark mode only**. Light mode ("Field Notes") is the *shared* BreakLabs
family look and is left exactly as the siblings have it — do not apply any of this to light mode.

---

## 1. The laws (non-negotiable)

1. **Green and black ONLY.** Dark mode has no other hue. No red, no amber, no teal, no purple,
   no blue, no white. A real P1 tube emitted one color; so do we.
2. **Meaning is carried by brightness, glyphs, and inverse — never by hue.**
   `✓ ✗ ! →` and bright-vs-dim green do the work that red/amber would do elsewhere.
3. **The terminal font governs everything** — headings, body, nav, labels, code. Bitmap,
   no curved lettering (VT323). Sans is forbidden in dark mode.
4. **Never white lettering on a green fill.** Bright-green fills always carry dark phosphor-ink
   text and icons (`--on-accent`). Icons on green buttons use `color="currentColor"`.
5. **CRT treatment is always on in dark mode:** scanlines + vignette overlay, phosphor glow on
   headings/chrome. Subtle — readable for a long study session, not a kitsch gimmick.
6. **Light mode is untouched.** None of the above applies to `[data-theme='light']`.

---

## 2. Color — the only palette

One hue. Five brightness tiers on a near-black green-tinted void. All tokens resolve to these.

| Role | Hex | Use |
|---|---|---|
| Void (bg) | `#060A07` | page background |
| Surface | `#0B120D` / `#0E1711` / `#121C15` | cards, panels, raised |
| Bright | `#7FF5B0` | good / active / strong / highlight text |
| Base (accent) | `#46E08A` | the phosphor — accent, primary, fills, cursor |
| Mid | `#5FD699` | partial / signal / secondary emphasis |
| Dim / off | `#9FC9AE` | "broke" / wrong / recessed (reads as *off*, still green) |
| Muted text | `#6E8274` | secondary labels |
| Body text | `#D6E4D8` | soft greenish-white — long-form prose (kept readable) |
| Borders | `#1C3E2A` → `#2E6E48` | hairline → strong green seams |
| On-green ink | `#04130B` | text/icons that sit ON a bright-green fill |

**Semantic mapping (how the old hues collapse to green):**

- success / OK / strong → **bright** `#7FF5B0`
- signal / partial / "note" → **mid** `#5FD699`
- break / error / wrong → **dim/off** `#9FC9AE` + an `✗` or `broke` glyph (never red)
- everything else (teal/purple/blue clusters) → **base** `#46E08A`

All of this is wired in `src/index.css` under `:root, :root[data-theme='dark']` — the
`--red/--yellow/--teal/--purple/--blue` families all point at greens. **Do not reintroduce a
non-green value into the dark block.**

---

## 3. Typography — the terminal font

- **Dark mode:** `--font-ui` and `--font-mono` = **`'VT323'`** (DEC VT320-style bitmap terminal
  font, loaded from Google Fonts in `index.css` line 1). Fallback `JetBrains Mono` → `monospace`.
  VT323 has **no curved lettering** — that is the point.
- **Light mode:** restored to the shared family — `Inter` (`--font-ui`) + `JetBrains Mono`
  (`--font-mono`). The terminal font is a dark-identity thing only.
- VT323 renders small/thin; if a label is illegibly small, **bump its size**, do not switch font.
- Everything inherits `--font-ui` via `body`; components reference `var(--font-ui)` / `var(--font-mono)`.
  Never hardcode `'Inter'` or a sans in a component.

---

## 4. The CRT treatment

- **Scanlines + vignette:** one fixed, click-through overlay (`.pl-crt-overlay`) mounted once in
  `App.jsx`, shown only in dark mode. Horizontal lines every 3px at ~15% black + an inset vignette.
- **Phosphor glow:** subtle `text-shadow` in phosphor green on `h1/h2`, `.pl-glow`, panel legends,
  and HUD values. Keep it low — glow should suggest a tube, not blur the text.
- **Reduced motion:** the scanlines are static; nothing animates.

---

## 5. Components & patterns

- **Inverse-video active nav** — the TUI-installer highlight bar. The active sidebar item is a
  **solid green** block with **dark ink** (label + icon + count follow via `currentColor`). Light
  mode keeps the translucent pill.
- **Box-drawing legend panels** (`.pl-panel` + `.pl-panel-legend`) — a green hairline box with a
  lowercase mono legend sitting on the top border (`repl`, `glass box`), like a conky widget /
  TUI fieldset. Use for runnable/readout panels.
- **HUD readout** (`.pl-hud`, `.pl-hud-cell`, `.pl-hud-key`, `.pl-hud-val`) — the glass-box run
  result as a `status · runtime · peak mem · break` strip, styled like a ship's-console HUD.
  Emoji-free; values from `glassBoxParts()`.
- **REPL block** — `>>>` prompts in dim green, output in bright green, a solid green block cursor.

---

## 6. Do / Don't

**Do:** keep it green-on-black; use brightness + glyphs for state; use VT323; use `pl-panel` /
`pl-hud` for new readouts; keep dark ink on green fills; keep glow/scanlines subtle.

**Don't:** add any non-green color to dark mode; use a sans/curved font in dark mode; put white
text on a green fill; build a flat modern card and call it done; touch light mode.

---

## 7. Where it lives (code map)

- `src/index.css` — `:root, :root[data-theme='dark']` token block (palette + fonts), the
  `CRT GREEN-SCREEN TREATMENT` section (overlay, glow, inverse-nav, `.pl-panel`, `.pl-hud`,
  contrast overrides), and the `[data-theme='light']` font restore.
- `src/App.jsx` — mounts `.pl-crt-overlay`.
- `src/components/layout/Sidebar.jsx` — inverse-nav (`currentColor` icon/count).
- `src/components/ide/PythonCell.jsx` + `glassbox.js` — the HUD readout (`glassBoxParts`).
- `src/components/shared/BrandMark.jsx` — descriptor accent = green; red seam stays (cross-lab, HQ D-19).

---

## 8. Open items (tracked in NEXT.md)

- Apply `.pl-panel` / `.pl-hud` + glow across more room surfaces (KNOW/JUDGE/BUILD panels) so the
  whole app — not just the sidebar + glass-box — reads as one terminal.
- CodeMirror editor font: confirm it picks up VT323 (it may set its own); fix if not.
- Very small mono labels in VT323: audit legibility, bump sizes where needed.
- Decide whether the brand seam goes green in PL dark mode (currently stays red per HQ D-19).

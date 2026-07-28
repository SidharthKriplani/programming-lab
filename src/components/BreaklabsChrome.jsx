// BreaklabsChrome — PL's copy of the shared global top-bar (D17 GSL reference implementation,
// ported for Programming Lab). "Shared-by-copy" component: this file is a standalone copy
// wired to PL's own auth/nav/theme, not a cross-repo import — see
// genai-systems-lab/src/components/BreaklabsChrome.jsx for the master reference.
//
// PL wiring is intentionally minimal per the D-port spec: brand + search + ProfileChip
// dropdown only.
//   - Search trigger (added 2026-07-28, new ruling): PL now has a v1 search (title-only
//     index over foundationsRooms.js, see data/searchIndex.js + components/SearchModal.jsx).
//     Centered in the bar like the sibling labs, desktop-only, guarded behind onSearchOpen
//     so this file stays backward-compatible if a caller omits it.
//   - No streak badge, no theme toggle, no sticky-notes tray: none of those systems exist in PL
//     yet, and the theme toggle already lives in the sidebar footer (utils/theme.js) — not
//     duplicated here.
//   - No back button: PL has no contextual "back" affordance at the chrome level.
//   - Auth: PL offers Google sign-in only, no modal, no GitHub (mirrors the GSL master's own
//     D23 comment about PL's auth surface).
import { useState, useRef, useEffect } from "react";
import { Icon } from "./shared/Icon.jsx";
import { BrandMark } from "./shared/BrandMark.jsx";

// ─── Profile chip + dropdown ───────────────────────────────────────────────────────────────
// Order matches the GSL master's spec order (Profile / My Progress / Review / My Tracks /
// Leaderboard — sep — Start Here / Resources / About — sep — Plans & Access — sep — shortcuts
// hint), with items PL has no route for omitted: Profile, Review, About, Plans & Access.
function ProfileChip({ user, onNavigateProgress, onNavigateMyTracks, onNavigateLeaderboard, onNavigateStartHere, onNavigateResources }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  const m = user.user_metadata || {};
  const name = m.full_name?.split(" ")[0] || m.name?.split(" ")[0] || user.email?.split("@")[0];

  function item(label, onClick) {
    return (
      <button onClick={() => { onClick(); setOpen(false); }}
        className="w-full text-left px-3 py-1.5 text-xs transition-all rounded-lg"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
        {label}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        title="Your profile" aria-haspopup="menu" aria-expanded={open}>
        {m.avatar_url
          ? <img src={m.avatar_url} alt="avatar" className="w-6 h-6 rounded-full shrink-0" style={{ border: "1px solid var(--border)" }} />
          : <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: "var(--accent)", color: "var(--surface)" }}>{(name || "?")[0].toUpperCase()}</div>
        }
        <span className="text-[11px] font-medium max-w-[80px] truncate" style={{ color: "var(--text-muted)" }}>{name}</span>
        <span style={{ color: "var(--text-dim)" }}><Icon name="chevron-down" size={11} /></span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-48 rounded-xl p-1.5 shadow-2xl z-50"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {item("My Progress", onNavigateProgress)}
          {item("My Tracks", onNavigateMyTracks)}
          {item("Leaderboard", onNavigateLeaderboard)}
          <div className="h-px my-1" style={{ background: "var(--border)" }} />
          {item("Start Here", onNavigateStartHere)}
          {item("Resources", onNavigateResources)}
          <div className="h-px my-1" style={{ background: "var(--border)" }} />
          <div className="px-3 py-1.5 text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>
            Keyboard shortcuts — press <kbd className="rounded px-1" style={{ border: "1px solid var(--border)" }}>?</kbd>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chrome ────────────────────────────────────────────────────────────────────────────────
export default function BreaklabsChrome({
  user, supabaseEnabled, onSignInGoogle,
  onSearchOpen, searchPlaceholder = "Search…",
  onNavigateProgress, onNavigateMyTracks, onNavigateLeaderboard, onNavigateStartHere, onNavigateResources,
}) {
  return (
    <div className="flex items-center flex-1 min-w-0 gap-2">
      <BrandMark variant="full" descriptor="PROGRAMMING" accent="#46E08A" size={16} />

      {/* D-PL new ruling (2026-07-28): centered search trigger, desktop-only, guarded
          behind onSearchOpen so this component stays backward-compatible. */}
      {onSearchOpen && (
        <div className="hidden lg:flex flex-1 justify-center min-w-0">
          <button onClick={onSearchOpen} aria-label="Search"
            className="flex items-center gap-2 lg:w-64 px-3 py-1.5 rounded-lg text-left min-w-0 transition-all hover:opacity-90"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ color: "var(--text-dim)", flexShrink: 0 }}><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3" /><line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            <span className="text-xs flex-1 truncate" style={{ color: "var(--text-dim)" }}>{searchPlaceholder}</span>
            <kbd className="hidden sm:inline text-[9px] rounded px-1 font-mono" style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }}>⌘K</kbd>
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        {supabaseEnabled && (
          user ? (
            <ProfileChip user={user}
              onNavigateProgress={onNavigateProgress} onNavigateMyTracks={onNavigateMyTracks}
              onNavigateLeaderboard={onNavigateLeaderboard} onNavigateStartHere={onNavigateStartHere}
              onNavigateResources={onNavigateResources} />
          ) : (
            <button onClick={onSignInGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
              title="Sign in with Google">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Sign in
            </button>
          )
        )}
      </div>
    </div>
  );
}

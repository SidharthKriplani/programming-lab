import { Icon } from './Icon.jsx';

// Badge shown on a tab based on unlock method
function WorldBadge({ method }) {
  if (!method) return null;
  if (method === 'quiz') {
    return (
      <span title="Quiz-verified" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: '50%',
        background: 'var(--green-bg, var(--surface-2))', flexShrink: 0,
      }}>
        <Icon name="check" size={9} color="var(--green-text)" strokeWidth={2.5} />
      </span>
    );
  }
  // 'self' or 'tutorial' — subtle dot
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: 'var(--accent)', flexShrink: 0, display: 'inline-block',
    }} title="Unlocked" />
  );
}

// WorldTabs — horizontal scrollable tab bar for the 7 worlds + an "All" tab.
// Props:
//   worlds        — PYLAB_WORLDS array
//   activeWorldId — null (all) | worldId string
//   gateStates    — result of getAllGateStates() — { [worldId]: { unlocked, method, defaultLevel } }
//   onTabClick    — (worldId | null) => void
export function WorldTabs({ worlds, activeWorldId, gateStates, onTabClick }) {
  const allActive = activeWorldId === null;

  const tabBase = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.75rem',
    border: 'none', borderBottom: '2px solid transparent',
    background: 'transparent', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600,
    whiteSpace: 'nowrap', transition: 'color 0.12s, border-color 0.12s',
    fontFamily: 'var(--font-ui, inherit)',
  };

  const tabActive = {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
  };

  const tabInactive = {
    color: 'var(--text-muted)',
    borderBottomColor: 'transparent',
  };

  const tabLocked = {
    color: 'var(--text-dim, var(--text-muted))',
    borderBottomColor: 'transparent',
    opacity: 0.7,
  };

  return (
    <div style={{
      display: 'flex', overflowX: 'auto', gap: 0,
      borderBottom: '1px solid var(--border)',
      marginBottom: '1rem',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE
    }}>
      {/* All worlds tab */}
      <button
        onClick={() => onTabClick(null)}
        style={{
          ...tabBase,
          ...(allActive ? tabActive : tabInactive),
        }}
      >
        All
      </button>

      {worlds.map(world => {
        const state = gateStates[world.id];
        const unlocked = !!(state && state.unlocked);
        const isActive = activeWorldId === world.id;

        return (
          <button
            key={world.id}
            onClick={() => onTabClick(world.id)}
            style={{
              ...tabBase,
              ...(isActive ? tabActive : unlocked ? tabInactive : tabLocked),
            }}
            title={unlocked ? world.tagline : 'Locked — click to unlock'}
          >
            <Icon
              name={world.icon}
              size={13}
              color={isActive ? 'var(--accent)' : unlocked ? 'var(--text-muted)' : 'var(--text-dim, var(--text-muted))'}
            />
            {world.label}
            {unlocked
              ? <WorldBadge method={state.method} />
              : <Icon name="lock" size={10} color="var(--text-dim, var(--text-muted))" strokeWidth={2} />
            }
          </button>
        );
      })}
    </div>
  );
}

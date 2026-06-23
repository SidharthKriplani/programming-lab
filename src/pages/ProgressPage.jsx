// ProgressPage — the TRACK-level dashboard (modeled on PAL's Progress room):
// total completion across every bank, continue-where-you-left-off, and a
// readiness-by-bank view grouped by the four frames.
import { BANKS, FRAMES, FRAME_ORDER } from '../data/banks.js';
import { getCounts } from '../utils/problemProgress.js';
import { Icon } from '../components/shared/Icon.jsx';

function statusOf(solved, total) {
  if (total === 0) return { label: 'Soon', color: 'var(--text-dim)' };
  if (solved === 0) return { label: 'Not started', color: 'var(--text-muted)' };
  if (solved >= total) return { label: 'Complete', color: 'var(--green-text)' };
  return { label: 'In progress', color: 'var(--accent)' };
}

export function ProgressPage({ onNavigate }) {
  const rows = BANKS.map(b => ({ ...b, solved: Math.min(getCounts(b.progressKey).solved, b.total) }));
  const totalSolved = rows.reduce((a, r) => a + r.solved, 0);
  const totalItems = rows.reduce((a, r) => a + r.total, 0);
  const banksComplete = rows.filter(r => r.total > 0 && r.solved >= r.total).length;
  const pct = totalItems ? Math.round((totalSolved / totalItems) * 100) : 0;
  const cont = rows.find(r => r.solved > 0 && r.solved < r.total) || rows.find(r => r.solved === 0 && r.total > 0) || rows[0];

  return (
    <div className="pal-page-enter" style={{ maxWidth: 820 }}>
      <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)' }}>Progress</h1>
      <p style={{ margin: '0 0 1.3rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{totalSolved} of {totalItems} items completed across all rooms</p>

      {/* Continue */}
      {cont && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${cont.accent}`, borderRadius: 'var(--radius)', padding: '1rem 1.15rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Continue where you left off</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>{cont.label}</div>
          </div>
          <button onClick={() => onNavigate(cont.view)} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            Continue <Icon name="arrow-right" size={15} color="currentColor" />
          </button>
        </div>
      )}

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.6rem' }}>
        {[['Overall', `${pct}%`], ['Completed', `${totalSolved}`], ['Rooms done', `${banksComplete} / ${rows.filter(r => r.total > 0).length}`]].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Readiness by frame */}
      <div style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.7rem' }}>Readiness by room</div>
      {FRAME_ORDER.map(fk => {
        const frame = FRAMES[fk];
        const banks = rows.filter(r => r.frame === fk);
        if (!banks.length) return null;
        return (
          <section key={fk} style={{ marginBottom: '1.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <Icon name={frame.icon} size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{frame.label}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{frame.sub}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {banks.map(b => {
                const st = statusOf(b.solved, b.total);
                const bpct = b.total ? Math.round((b.solved / b.total) * 100) : 0;
                return (
                  <button key={b.id} onClick={() => onNavigate(b.view)} className="pl-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem 1rem', alignItems: 'center', width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: b.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{ width: 110, height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${bpct}%`, height: '100%', background: b.accent }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>{b.solved}/{b.total}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: st.color, minWidth: 76, textAlign: 'right' }}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ProgressPage;

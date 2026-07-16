// CheatsheetPage — an actual cheatsheet (rebuilt after review, 2026-07-17).
// READ mode (default): dense grouped reference rows, every answer VISIBLE -
// a scan surface, no interaction required. QUIZ mode: answers hidden, click
// a row to reveal, strictly ONE open at a time (accordion). Stable vertical
// layout - no grid/masonry, nothing jumps when something opens.
import { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { PL_FLASHCARDS, CHEAT_GROUPS } from '../data/plCheatsheet.js';

function Row({ card, mode, open, onToggle }) {
  const showAnswer = mode === 'read' || open;
  return (
    <div
      onClick={mode === 'quiz' ? onToggle : undefined}
      style={{
        display: 'grid', gridTemplateColumns: 'minmax(200px, 34%) 1fr', gap: '1rem',
        padding: '0.6rem 0.9rem', cursor: mode === 'quiz' ? 'pointer' : 'default',
        borderTop: '1px solid var(--border)',
        background: mode === 'quiz' && open ? 'var(--surface-2)' : 'transparent',
      }}
    >
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.45 }}>
        {card.q}
      </div>
      {showAnswer ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{card.a}</div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icon name='chevron-right' size={12} color='var(--text-dim)' />
          answer out loud, then click
        </div>
      )}
    </div>
  );
}

export function CheatsheetPage() {
  const [group, setGroup] = useState('All');
  const [mode, setMode] = useState('read');   // 'read' | 'quiz'
  const [openKey, setOpenKey] = useState(null); // quiz mode: at most ONE open

  const groups = useMemo(() => {
    const wanted = group === 'All' ? CHEAT_GROUPS : [group];
    return wanted.map(g => ({ g, cards: PL_FLASHCARDS.filter(c => c.group === g) }));
  }, [group]);

  return (
    <div className='pal-page-enter' style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name='file-text' size={18} color='var(--accent)' />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Cheatsheet</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '64ch', lineHeight: 1.55 }}>
          {PL_FLASHCARDS.length} compressed answers over the Foundations territory. Read mode is the
          reference — scan it. Quiz mode hides the right column: answer out loud, click to check.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        {/* mode switch */}
        <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 999, overflow: 'hidden', marginRight: '0.6rem' }}>
          {['read', 'quiz'].map(m => (
            <button key={m} onClick={() => { setMode(m); setOpenKey(null); }}
              style={{
                fontSize: '0.72rem', fontWeight: 800, padding: '0.3rem 0.85rem', cursor: 'pointer', border: 'none',
                textTransform: 'capitalize',
                background: mode === m ? 'var(--accent)' : 'var(--surface)',
                color: mode === m ? 'var(--accent-contrast, #fff)' : 'var(--text-muted)',
              }}>
              {m}
            </button>
          ))}
        </div>
        {/* group filter */}
        {['All', ...CHEAT_GROUPS].map(g => (
          <button key={g} onClick={() => setGroup(g)}
            style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.65rem', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (group === g ? 'var(--accent-border)' : 'var(--border)'),
              background: group === g ? 'var(--accent-soft, var(--surface-2))' : 'var(--surface)',
              color: group === g ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {g}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {groups.map(({ g, cards }) => (
          <section key={g} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', padding: '0.65rem 0.9rem', background: 'var(--surface-2)' }}>
              <h2 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>{g}</h2>
              <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{cards.length}</span>
            </div>
            {cards.map(c => {
              const key = g + '|' + c.q;
              return (
                <Row key={key} card={c} mode={mode}
                  open={openKey === key}
                  onToggle={() => setOpenKey(openKey === key ? null : key)} />
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

export default CheatsheetPage;

// CheatsheetPage — flip-card recall surface over the Foundations rooms (parity:
// MSL CheatsheetTab). Data: plCheatsheet.js. Click a card to flip Q -> A; group
// chips filter; progress is deliberately NOT tracked here — this is a recall
// tool, not a bank (the banks grade; the cheatsheet refreshes).
import { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { PL_FLASHCARDS, CHEAT_GROUPS } from '../data/plCheatsheet.js';

function Card({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped(f => !f)}
      className='pal-card-hover'
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.45rem', textAlign: 'left', cursor: 'pointer',
        breakInside: 'avoid', marginBottom: '0.7rem',
        background: flipped ? 'var(--surface-2)' : 'var(--surface)',
        border: '1px solid ' + (flipped ? 'var(--accent-border)' : 'var(--border)'),
        borderRadius: 12, padding: '0.85rem 1rem', width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: flipped ? 'var(--green-text)' : 'var(--accent)', textTransform: 'uppercase' }}>
          {flipped ? 'A' : 'Q'} · {card.group}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Icon name='rotate-ccw' size={12} color='var(--text-dim)' />
        </span>
      </div>
      {!flipped
        ? <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{card.q}</div>
        : (
          <>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.45 }}>{card.q}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.55 }}>{card.a}</div>
          </>
        )}
    </button>
  );
}

export function CheatsheetPage() {
  const [group, setGroup] = useState('All');
  const cards = useMemo(
    () => (group === 'All' ? PL_FLASHCARDS : PL_FLASHCARDS.filter(c => c.group === group)),
    [group]
  );

  return (
    <div className='pal-page-enter'>
      <div style={{ marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name='file-text' size={18} color='var(--accent)' />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Cheatsheet</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '62ch', lineHeight: 1.55 }}>
          {PL_FLASHCARDS.length} flash cards over the Foundations territory — the compressed recall layer.
          Read the question, answer out loud, flip. If a card surprises you, its room installs the model.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {['All', ...CHEAT_GROUPS].map(g => (
          <button key={g} onClick={() => setGroup(g)}
            style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (group === g ? 'var(--accent-border)' : 'var(--border)'),
              background: group === g ? 'var(--accent-soft, var(--surface-2))' : 'var(--surface)',
              color: group === g ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {g === 'All' ? 'All (' + PL_FLASHCARDS.length + ')' : g}
          </button>
        ))}
      </div>

      <div style={{ columns: '320px', columnGap: '0.7rem' }}>
        {cards.map(c => <Card key={c.q} card={c} />)}
      </div>
    </div>
  );
}

export default CheatsheetPage;

// FollowUpChain — the Follow-up format (PYLAB-VISION §3, Phase 3): the interviewer doesn't
// stop when your query works — they escalate ("now per group", "handle the nulls", "at
// scale", "without pandas", "complexity?"). This unfolds those next questions one at a time:
// read the ask, think, reveal the model answer, then the next ask appears. Reveal-only
// (it's the discussion that follows a solve), shown after the judgment layer. Reads
// src/data/pyLabFollowups.js; self-hides when a problem has no chain.
import { useState } from 'react';
import { Icon } from './Icon.jsx';

export function FollowUpChain({ followups }) {
  const [open, setOpen] = useState(0); // how many answers revealed
  if (!followups || !followups.length) return null;
  const shown = Math.min(open + 1, followups.length);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="arrow-right" size={15} color="var(--accent)" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>The interviewer's next questions</span>
      </div>

      {followups.slice(0, shown).map((f, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '0.55rem' : 0 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.5 }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginRight: '0.4rem' }}>Q{i + 1}</span>{f.ask}
          </div>
          {i < open ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{f.answer}</div>
          ) : (
            <button onClick={() => setOpen(open + 1)} style={{ alignSelf: 'flex-start', padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Think, then reveal</button>
          )}
        </div>
      ))}

      {open >= followups.length && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>That's the chain — in a real loop, each "works" just buys the next question.</div>
      )}
    </div>
  );
}

export default FollowUpChain;

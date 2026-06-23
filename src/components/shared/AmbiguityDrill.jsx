// AmbiguityDrill — the Ambiguity format (PYLAB-VISION §3): before you write a line, the
// vague ask is pinned to a single reading. Pick the interpretation; see which the spec
// actually means and why the others merely run. Surfaces above the editor.
import { useState } from 'react';
import { Icon } from './Icon.jsx';

export function AmbiguityDrill({ ambiguity }) {
  const [picked, setPicked] = useState(null);
  if (!ambiguity || !(ambiguity.options || []).length) return null;
  const done = picked != null;
  const right = ambiguity.options.find(o => o.correct);
  const gotIt = done && picked === right.id;

  return (
    <div style={{ border: '1px solid var(--purple-border, var(--border))', borderRadius: 'var(--radius-sm)', background: 'var(--purple-bg, var(--surface-2))', padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="pen-line" size={15} color="var(--purple-text, var(--accent))" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Decide before you code — this ask has more than one reading</span>
      </div>
      <div style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.55 }}>{ambiguity.question}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {ambiguity.options.map(o => {
          const isPicked = picked === o.id;
          const reveal = done;
          const tone = !reveal ? null : o.correct ? 'good' : (isPicked ? 'bad' : 'dim');
          const bd = tone === 'good' ? 'var(--green-border)' : tone === 'bad' ? 'var(--red-border)' : (isPicked ? 'var(--accent)' : 'var(--border)');
          const bg = tone === 'good' ? 'var(--green-bg)' : tone === 'bad' ? 'var(--red-bg)' : 'var(--surface)';
          return (
            <button key={o.id} onClick={() => !done && setPicked(o.id)} disabled={done}
              style={{ textAlign: 'left', padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + bd, background: bg, color: 'var(--text)', cursor: done ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 600 }}>
                {reveal && o.correct && <Icon name="check" size={13} color="var(--green-text)" />}
                {reveal && isPicked && !o.correct && <Icon name="x" size={13} color="var(--red-text)" />}
                {o.label}
              </span>
              {reveal && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{o.why}</span>}
            </button>
          );
        })}
      </div>

      {done && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <strong style={{ color: gotIt ? 'var(--green-text)' : 'var(--text)' }}>{gotIt ? 'Right reading. ' : 'The spec means: ' + right.label + '. '}</strong>{ambiguity.note}
        </div>
      )}
    </div>
  );
}

export default AmbiguityDrill;

// GeneratorModel — Room 1 / evaluation. Step next() on a generator and watch it
// run only as far as the next yield, pause, and resume on the next call — nothing
// ahead is computed (lazy), and once exhausted it can't restart (one-shot). The
// contrast with the eager list is the memory lesson. Deterministic stepper.
import { useState, useEffect } from 'react';

const VALUES = [0, 1, 4, 9]; // squares of range(4)

export function GeneratorModel() {
  const [n, setN] = useState(0);     // number of next() calls (0 = not started)
  const [playing, setPlaying] = useState(false);

  const done = n > VALUES.length;        // StopIteration raised
  const produced = VALUES.slice(0, Math.min(n, VALUES.length));
  const current = n >= 1 && n <= VALUES.length ? VALUES[n - 1] : null;

  useEffect(() => {
    if (!playing) return;
    if (n > VALUES.length) { setPlaying(false); return; }
    const t = setTimeout(() => setN(x => Math.min(x + 1, VALUES.length + 1)), 850);
    return () => clearTimeout(t);
  }, [playing, n]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>g = squares()  ·  def squares(): for i in range(4): yield i*i</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setN(x => Math.min(VALUES.length + 1, x + 1))} disabled={done}>next(g)</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={done}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => { setN(0); setPlaying(false); }} ghost>reset</Btn>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {/* the yield tape — produced solid, not-yet faded (lazy) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', minWidth: 64 }}>yields:</span>
          {VALUES.map((v, i) => {
            const isProduced = i < n;
            const isCurrent = i === n - 1;
            return (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: isCurrent ? 700 : 500,
                padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-sm)',
                border: '1px ' + (isCurrent ? 'solid var(--accent)' : isProduced ? 'solid var(--border)' : 'dashed var(--border)'),
                background: isCurrent ? 'var(--accent-bg)' : 'var(--surface)',
                color: isCurrent ? 'var(--accent)' : isProduced ? 'var(--text)' : 'var(--text-dim)',
                opacity: isProduced ? 1 : 0.5,
              }}>{isProduced ? v : '·'}</span>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>generator (one at a time)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text)' }}>
              {done ? <span style={{ color: 'var(--red-text)' }}>StopIteration</span> : current === null ? <span style={{ color: 'var(--text-dim)' }}>not started</span> : current}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>eager list (all in memory)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>[0, 1, 4, 9]</div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: done ? 'var(--red-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: done ? 600 : 400 }}>
          {done
            ? 'Exhausted. A generator is one-shot — next() now raises StopIteration forever. To go again you build a NEW generator; you cannot rewind this one.'
            : current === null
              ? 'Nothing has run yet. Calling squares() does not execute the body — it just makes the generator. The first next() runs it up to the first yield.'
              : 'Each next() resumes the body, runs to the next yield, and pauses. The later values are not computed yet — that is the laziness, and why memory stays flat (one value, not the whole list).'}
        </p>
      </div>
    </div>
  );
}

function Btn({ onClick, children, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.28rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: disabled ? 'default' : 'pointer',
      border: '1px solid var(--border)', opacity: disabled ? 0.45 : 1,
      background: ghost ? 'transparent' : 'var(--surface)', color: ghost ? 'var(--text-dim)' : 'var(--text)',
    }}>{children}</button>
  );
}

export default GeneratorModel;

// InterviewQnAPage — the interview QnA bank (parity: MSL's QnA system, PL scope).
// Data: plQnaBank.js. Answer-first discipline: the answer stays hidden until the
// learner commits to answering out loud (the reveal is a choice, not a scroll).
// Answer lines carry house beats (**Answer.** / **Mechanism.** / **Boundary.**)
// rendered as labeled rows. localStorage tracks which questions were revealed —
// a coverage marker, not a grade.
import { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { PL_QNA, QNA_ROOMS } from '../data/plQnaBank.js';
import { FOUNDATION_ROOMS } from '../data/foundationsRooms.js';

const KEY = 'pl-qna-seen-v1';
const readSeen = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } };
const writeSeen = (s) => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* ignore */ } };

const ROOM_TITLE = Object.fromEntries(FOUNDATION_ROOMS.map(r => [r.id, r.title]));
const DIFF_COLOR = { easy: 'var(--green-text)', medium: 'var(--yellow, var(--accent))', hard: 'var(--red-text, var(--accent))' };

// "**Answer.** text" -> { beat: 'Answer', text }
function parseBeat(line) {
  const m = line.match(/^\*\*([A-Za-z]+)\.\*\*\s*(.*)$/);
  return m ? { beat: m[1], text: m[2] } : { beat: null, text: line };
}

function QCard({ item, seen, onReveal }) {
  const [open, setOpen] = useState(false);
  const reveal = () => { setOpen(o => !o); if (!open) onReveal(item.id); };
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          {ROOM_TITLE[item.room] || item.room} · L{item.level}
        </span>
        <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: DIFF_COLOR[item.difficulty] || 'var(--text-dim)', textTransform: 'uppercase' }}>
          {item.difficulty}
        </span>
        {seen && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            <Icon name='check' size={11} color='var(--green-text)' /> seen
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.55, marginBottom: '0.55rem' }}>{item.q}</div>
      <button onClick={reveal}
        style={{
          fontSize: '0.72rem', fontWeight: 700, padding: '0.32rem 0.75rem', borderRadius: 8, cursor: 'pointer',
          border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)',
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        }}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={12} color='currentColor' />
        {open ? 'Hide answer' : 'Answer out loud first — then reveal'}
      </button>
      {open && (
        <div style={{ marginTop: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px dashed var(--border)', paddingTop: '0.7rem' }}>
          {item.answer.map((line, i) => {
            const { beat, text } = parseBeat(line);
            return (
              <div key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'baseline' }}>
                {beat && (
                  <span style={{ flexShrink: 0, fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: beat === 'Answer' ? 'var(--accent)' : beat === 'Boundary' ? 'var(--text-dim)' : 'var(--text-muted)', width: '4.6rem' }}>
                    {beat}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InterviewQnAPage() {
  const [room, setRoom] = useState('All');
  const [diff, setDiff] = useState('All');
  const [seen, setSeen] = useState(readSeen);

  const onReveal = (id) => setSeen(prev => { const next = new Set(prev); next.add(id); writeSeen(next); return next; });
  const items = useMemo(() => PL_QNA.filter(x =>
    (room === 'All' || x.room === room) && (diff === 'All' || x.difficulty === diff)
  ), [room, diff]);

  return (
    <div className='pal-page-enter'>
      <div style={{ marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name='mic' size={18} color='var(--accent)' />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Interview QnA</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '64ch', lineHeight: 1.55 }}>
          {PL_QNA.length} real screen questions over PL’s territory, answered the way an interviewer wants to
          hear them: the direct answer, the mechanism, the boundary. Say your answer out loud BEFORE revealing —
          the reveal button is the honesty line. {seen.size}/{PL_QNA.length} seen.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        {['All', ...QNA_ROOMS].map(r => (
          <button key={r} onClick={() => setRoom(r)}
            style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.65rem', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (room === r ? 'var(--accent-border)' : 'var(--border)'),
              background: room === r ? 'var(--accent-soft, var(--surface-2))' : 'var(--surface)',
              color: room === r ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {r === 'All' ? 'All rooms' : (ROOM_TITLE[r] || r)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {['All', 'easy', 'medium', 'hard'].map(d => (
          <button key={d} onClick={() => setDiff(d)}
            style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.65rem', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (diff === d ? 'var(--accent-border)' : 'var(--border)'),
              background: diff === d ? 'var(--accent-soft, var(--surface-2))' : 'var(--surface)',
              color: diff === d ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'capitalize',
            }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {items.map(item => <QCard key={item.id} item={item} seen={seen.has(item.id)} onReveal={onReveal} />)}
        {items.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No questions match this filter.</p>}
      </div>
    </div>
  );
}

export default InterviewQnAPage;

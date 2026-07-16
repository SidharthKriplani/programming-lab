// src/components/shared/QnAPanel.jsx — the family completion-gated Interview
// QnA panel, PL edition (SKELETON, 2026-07-16). Renders the gated coming-soon
// state; real questions arrive via data/qnaBank.js per QNA-INTERVIEW-STANDARD
// (answers only for modules that pass the content pipeline — contentStatus.js).
import { QNA_BANK } from '../../data/qnaBank.js';

export function QnAPanel({ moduleId, completed }) {
  const entry = QNA_BANK[moduleId];

  return (
    <div className="mo-rise" style={{
      marginTop: '1.25rem', padding: '1rem 1.15rem', borderRadius: 12,
      background: 'var(--surface)', border: '1px dashed var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
          {completed ? '🎤 Interview QnA' : '🔒 Interview QnA'}
        </span>
        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          {entry ? `${(entry.questions || []).length} questions` : 'coming soon'}
        </span>
      </div>
      {!completed ? (
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          Finish this module (run the demo, pass the check) to unlock its interview question set.
        </p>
      ) : entry && entry.questions?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {entry.questions.map(q => (
            <div key={q.id} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginRight: 6 }}>{q.level}</span>
              {q.q}
              {q.status === 'draft' && <span style={{ marginLeft: 8, fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--yellow-text, var(--text-dim))' }}>DRAFT — answer pending</span>}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          Question set for this module is being authored — the interview projection of every Know
          module ships here (family QnA standard: L0–L3 ladders, answers gated on the content
          pipeline).
        </p>
      )}
    </div>
  );
}

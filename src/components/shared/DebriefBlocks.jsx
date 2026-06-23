// DebriefBlocks — renders a marker-segmented debrief into collapsible, colour-coded
// blocks (the PAL SQL Lab pattern). Paragraphs (\n\n-split) starting with a known
// **Marker:** become collapsible blocks; the rest render as prose with **bold**.
// Reused across the KNOW / BUILD / JUDGE frames.
import { useState } from 'react';

const BLOCKS = [
  { test: /^\*\*\s*wrong answer/i,        label: 'Wrong answer that runs', color: 'var(--red)' },
  { test: /^\*\*\s*sanity check/i,        label: 'Sanity check',           color: 'var(--teal)' },
  { test: /^\*\*\s*interviewer follow/i,  label: 'Interviewer follow-up',  color: 'var(--purple)' },
  { test: /^\*\*\s*before (you )?writ/i,  label: 'Before you write',       color: 'var(--yellow)' },
  { test: /^\*\*\s*forensic/i,            label: 'Forensic trap',          color: 'var(--yellow)' },
  { test: /^\*\*\s*(sql )?approach/i,     label: 'Approach',               color: 'var(--accent)' },
  { test: /^\*\*\s*what/i,                label: 'Approach',               color: 'var(--accent)' },
];

function renderInline(s) {
  const parts = s.split(/(\*\*.+?\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ color: 'var(--text)' }}>{p.slice(2, -2)}</strong>;
    return <span key={i}>{p}</span>;
  });
}

function Block({ label, color, body }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.5rem 0.8rem', background: 'var(--surface-2)', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{label}</span>
        <span style={{ display: 'inline-flex', transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
      </button>
      {open && (
        <p style={{ margin: 0, padding: '0.6rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{renderInline(body)}</p>
      )}
    </div>
  );
}

export function DebriefBlocks({ text }) {
  const paras = (text || '').split('\n\n').map(p => p.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {paras.map((p, i) => {
        const m = BLOCKS.find(b => b.test.test(p));
        if (!m) return <p key={i} style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{renderInline(p)}</p>;
        const body = p.replace(/^\*\*[^*]+\*\*:?\s*/, '');
        return <Block key={i} label={m.label} color={m.color} body={body} />;
      })}
    </div>
  );
}

export default DebriefBlocks;

// StartHere — the orientation page every sibling lab has (PAL/MSL/GSL parity).
// Answers three questions in one screen: what is PL, where do I enter, what is
// the method. Pure routing + copy — no state, no data deps beyond tallies.
import { Icon } from '../components/shared/Icon.jsx';
import { FOUNDATION_TALLY } from '../data/foundationsRooms.js';
import { gotchaProblems } from '../data/gotchaProblems.js';

const PATHS = [
  {
    id: 'beginner',
    icon: 'map',
    title: 'New to Python',
    who: 'You can read code but have written very little.',
    route: 'pylab',
    cta: 'Start the guided tutorial (inside PyLab)',
    steps: [
      'PyLab opens with a lesson ladder: read a little, run a little, pass the check.',
      'Graduate into the gym: short graded exercises, instant feedback.',
      'Then climb the Foundations trunk from room 1.',
    ],
  },
  {
    id: 'working',
    icon: 'terminal',
    title: 'Working analyst / data scientist',
    who: 'You ship notebooks; production Python still bites you.',
    route: 'gotchas',
    cta: 'Start with the Gotchas',
    steps: [
      'Predict-the-output traps that pass code review and fail in production.',
      'Every miss names the mental model you were missing — the Foundations room that installs it is one click away.',
      'Then: NumPy & pandas room, Shipping Python room, the DO gym on both.',
    ],
  },
  {
    id: 'interview',
    icon: 'target',
    title: 'Interview prep',
    who: 'A coding screen is on the calendar.',
    route: 'foundations',
    cta: 'Open the DSA room',
    steps: [
      'DSA room: structures + the eight patterns behind most screens, as models you drive.',
      'Drill the same patterns in PyLab; Spot the Flaw trains the code-review round.',
      'Going deeper: Competitive Programming, The Metal, and C++ branches.',
    ],
  },
];

const FRAMES_EXPLAINED = [
  { key: 'KNOW',  label: 'Foundations', desc: 'Models you drive — sliders, steppers, live code. Install the mental model.' },
  { key: 'DO',    label: 'PyLab & Gotchas', desc: 'Graded reps in real CPython. Make the model a reflex.' },
  { key: 'BUILD', label: 'Mini-Projects', desc: 'Multi-step builds that force the pieces to work together.' },
  { key: 'JUDGE', label: 'Spot the Flaw', desc: 'Read code you did not write and find what is wrong — the senior skill.' },
];

function PathCard({ p, onNavigate }) {
  return (
    <div className="pal-card-enter" style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon name={p.icon} size={16} color='var(--accent)' />
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{p.title}</span>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.who}</div>
      <ol style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {p.steps.map((s, i) => (
          <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</li>
        ))}
      </ol>
      <button onClick={() => onNavigate(p.route)} className='pal-btn-primary' style={{ alignSelf: 'flex-start', marginTop: '0.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
        {p.cta}
        <Icon name='arrow-right' size={13} color='currentColor' />
      </button>
    </div>
  );
}

export function StartHere({ onNavigate }) {
  return (
    <div className='pal-page-enter'>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name='compass' size={18} color='var(--accent)' />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Start here</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '62ch', lineHeight: 1.55 }}>
          Programming Lab is the SWE layer for data people — Python, the machine underneath it, DSA,
          NumPy &amp; pandas, and the road from notebook to production. Everything runs in your browser
          on real CPython; nothing to install. Pick the door that matches where you are.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem', marginBottom: '1.8rem' }}>
        {PATHS.map(p => <PathCard key={p.id} p={p} onNavigate={onNavigate} />)}
      </div>

      <div style={{ marginBottom: '0.6rem', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
        The method — four frames, one loop
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.7rem', marginBottom: '1.8rem' }}>
        {FRAMES_EXPLAINED.map(f => (
          <div key={f.key} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 0.9rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{f.key}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{f.label}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
        background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 0.85rem',
      }}>
        <Icon name='help-circle' size={14} color='var(--text-muted)' />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          The map today: {FOUNDATION_TALLY.rooms} Foundations rooms ({FOUNDATION_TALLY.modules} modules),{' '}
          {gotchaProblems.length} gotchas, the PyLab gym, mini-projects, and Spot the Flaw. Progress and
          streaks live on the <button onClick={() => onNavigate('progress')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Progress page</button>.
        </span>
      </div>
    </div>
  );
}

export default StartHere;

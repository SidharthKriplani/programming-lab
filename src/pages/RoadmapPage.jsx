// src/pages/RoadmapPage.jsx — "What's coming" (2026-07-16): the visible
// skeleton. Every planned module, campaign stage, and family feature that is
// arriving in PL, announced loudly instead of buried. Data-driven from
// pyLabPlanned (single source of truth — fleshing a stub updates this page
// automatically, no separate list to maintain).
import { pyLabPlanned } from '../data/pyLabPlanned.js';
import { knowModules } from '../data/knowModules.js';
import { BRIDGE_TRACKS, N2S_CAMPAIGN, FORMATS_PLANNED, BRIDGE_LINKS } from '../data/roadmapPlanned.js';
import { FOUNDATION_TALLY } from '../data/foundationsRooms.js';
import { Icon } from '../components/shared/Icon.jsx';

// Featured order — the new-arc categories first, legacy planned groups after.
const FEATURED = [
  {
    key: 'Systems floor',
    icon: 'layers',
    accent: 'var(--accent)',
    title: 'Systems Floor',
    tag: 'NEW WORLD · COMING SOON',
    blurb: 'The systems-depth interview layer for senior MLE/AIE: memory hierarchy and cache locality MEASURED (not recited), the GIL benchmarked, Amdahl’s law on real pipelines, generator memory footprints, float traps. Runnable, glass-box, honest.',
  },
  {
    key: 'Async & concurrency',
    icon: 'terminal',
    accent: 'var(--teal, var(--accent))',
    title: 'Async & Concurrency',
    tag: 'NEW WORLD · COMING SOON',
    blurb: 'The #1 AIE software skill. Order-the-awaits, semaphore-bounded LLM calls, fix-the-race with deterministic replay, timeout/retry/cancel, backpressure. Every problem graded by real execution.',
  },
  {
    key: 'Notebook → Service',
    icon: 'hammer',
    accent: 'var(--green, var(--accent))',
    title: 'Notebook → Service',
    tag: 'CAMPAIGN · COMING SOON',
    blurb: 'The DS→MLE bridge as a five-stage playable arc: extract functions → dicts become classes → package structure → tests → a mock inference endpoint. One messy notebook in, one engineer out.',
  },
];

const LEGACY_GROUPS = ['FAANG interview', 'NumPy & Stats', 'End-to-End', 'Core pandas', 'Python stdlib'];

function groupBy(list, key) {
  const out = {};
  for (const item of list) {
    const k = item[key] || 'Other';
    (out[k] = out[k] || []).push(item);
  }
  return out;
}

export function RoadmapPage({ onNavigate }) {
  const byCurriculum = groupBy(pyLabPlanned, 'curriculum');

  return (
    <div className="pal-page-enter" style={{ maxWidth: 860 }}>
      {/* Hero */}
      <span className="pal-badge-accent" style={{ marginBottom: '0.8rem' }}>ROADMAP · THE SKELETON</span>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>
        What PL is becoming.
      </h1>
      <p style={{ margin: '0 0 1.6rem', fontSize: '0.98rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '62ch' }}>
        Programming Lab is growing into the <strong style={{ color: 'var(--text)' }}>software-engineering floor of BreakLabs</strong> —
        the OOP, memory, concurrency, and architecture depth that senior MLE / AIE work (and interviews) assume.
        Everything below is announced, specced, and arriving in waves. Skeleton first, flesh next.
      </p>

      {/* Featured new worlds */}
      <div className="mo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '0.9rem', marginBottom: '2rem' }}>
        {FEATURED.map(f => {
          const items = byCurriculum[f.key] || [];
          return (
            <div key={f.key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${f.accent}`, borderRadius: 12, padding: '1.1rem 1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <Icon name={f.icon} size={16} color={f.accent} />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>{f.title}</h2>
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', color: f.accent, border: `1px solid ${f.accent}`, borderRadius: 4, padding: '0.1rem 0.4rem', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>
                {f.tag}
              </span>
              <p style={{ margin: '0 0 0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.blurb}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {items.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', flexShrink: 0 }}>◌</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>{s.title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', flexShrink: 0, textTransform: 'uppercase' }}>soon</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Foundations map callout */}
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, padding: '1rem 1.15rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
          Foundations — the full map is decided
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>{FOUNDATION_TALLY.rooms} rooms · {FOUNDATION_TALLY.clusters} clusters · {FOUNDATION_TALLY.modules} modules</strong> — a
          {' '}{FOUNDATION_TALLY.trunk}-room trunk (Python → The Machine → DSA → NumPy &amp; pandas → Concurrency → Shipping Python) and
          {' '}{FOUNDATION_TALLY.branch} branches (Competitive Programming, The Metal, Tensors &amp; Autograd). Every module named, modeled, and
          waiting for flesh — browse the skeleton in Foundations.
        </p>
      </div>

      {/* Bridge tracks — the career-transition flagships */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        The Bridges — transition tracks people actually buy
      </h2>
      <div className="mo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(255px, 100%), 1fr))', gap: '0.8rem', marginBottom: '2rem' }}>
        {BRIDGE_TRACKS.map(t => (
          <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{t.title}</span>
            </div>
            <span style={{ alignSelf: 'flex-start', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 4, padding: '0.08rem 0.35rem', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              {t.tag} · PLANNED
            </span>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.audience}</p>
            <p style={{ margin: '0 0 0.7rem', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{t.promise}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', marginTop: 'auto' }}>
              {t.spine.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notebook -> Service campaign arc */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        {N2S_CAMPAIGN.title} — the campaign, stage by stage
      </h2>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.05rem 1.15rem', marginBottom: '2rem' }}>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{N2S_CAMPAIGN.premise}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {N2S_CAMPAIGN.stages.map(st => (
            <div key={st.n} style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 4, padding: '0.05rem 0.35rem', flexShrink: 0 }}>S{st.n}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{st.title}</span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>graded by {st.gradedBy}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', flexShrink: 0 }}>soon</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '0.85rem 0 0', fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          linear unlock · pass a stage to open the next · progress persists like everything else in PL
        </p>
      </div>

      {/* Problem formats — the engine roadmap */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        New problem formats — the engine roadmap
      </h2>
      <div className="mo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(255px, 100%), 1fr))', gap: '0.7rem', marginBottom: '2rem' }}>
        {FORMATS_PLANNED.map(f => (
          <div key={f.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.85rem 0.95rem', opacity: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{f.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.55rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 4, padding: '0.08rem 0.35rem' }}>SOON</span>
            </div>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.engine}</p>
            <p style={{ margin: 0, fontSize: '0.66rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>first: </span>{f.firstExemplar}
            </p>
          </div>
        ))}
      </div>

      {/* Cross-lab bridge links */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        Cross-lab bridges — PL underneath the siblings
      </h2>
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, padding: '1rem 1.15rem', marginBottom: '2rem' }}>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The ownership contract: PL teaches the software <em>mechanic</em>; GSL / MSL teach it <em>in domain context</em>.
          These are the first five links — a sibling module will point here, never copy.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {BRIDGE_LINKS.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)', flexShrink: 0 }}>{b.from.lab}</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontWeight: 600 }}>{b.from.module}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>→</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{b.to.surface}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', flexShrink: 0 }}>soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Family features — shipped + arriving */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        Family features — PL becomes the fourth sibling
      </h2>
      <div className="mo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(255px, 100%), 1fr))', gap: '0.7rem', marginBottom: '2rem' }}>
        {[
          { label: 'Daily Rep', desc: 'One runnable problem a day — streak, freeze, Elo on your first Submit.', status: 'live', go: 'home' },
          { label: 'My Tracks + Notes', desc: 'Save anything, write Notion-grade notes (slash menu, todos, code blocks, export).', status: 'live', go: 'tracks' },
          { label: 'Ratings (Elo)', desc: 'Per-domain rating that moves with every rated attempt. Weakest-first on Progress.', status: 'live', go: 'progress' },
          { label: 'S / A / B tier tracks', desc: 'One click builds interview-frequency tiers from all 264 problems.', status: 'live', go: 'tracks' },
          { label: 'Interview QnA per module', desc: 'Every Know module gains a completion-gated L0–L3 question ladder.', status: 'soon', go: 'know' },
          { label: 'Foundations rooms', desc: `${FOUNDATION_TALLY.rooms} rooms, ${FOUNDATION_TALLY.modules} modeled modules — the trunk-and-branches KNOW map, browsable now.`, status: 'soon' },
          { label: 'Bridge tracks', desc: 'DS→MLE, AIE Software Floor, Systems Depth — the transition spines, staged.', status: 'soon' },
          { label: 'Prerequisite tags', desc: 'Sibling-lab modules declare their PL floor: “assumes pl-async” links back here.', status: 'soon' },
        ].map(f => (
          <div key={f.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.85rem 0.95rem', opacity: f.status === 'soon' ? 0.85 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{f.label}</span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.55rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                color: f.status === 'live' ? 'var(--green-text, #16a34a)' : 'var(--text-dim)',
                border: `1px solid ${f.status === 'live' ? 'var(--green-border, #16a34a)' : 'var(--border)'}`,
                borderRadius: 4, padding: '0.08rem 0.35rem',
              }}>{f.status === 'live' ? 'LIVE' : 'SOON'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</p>
            {f.status === 'live' && f.go && onNavigate && (
              <button onClick={() => onNavigate(f.go)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                Open →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* QnA rollout strip */}
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, padding: '1rem 1.15rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
          🎤 Interview QnA — rolling out across all {knowModules.length} Know modules
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Open any "How It Works" module and the gated QnA panel is already waiting under it — solve the module to
          unlock its slot. Question ladders (L0 recall → L3 systems) land bank-by-bank; answers ship only for modules
          that clear the content pipeline. Same standard as the sibling labs.
        </p>
      </div>

      {/* Legacy planned groups */}
      <h2 style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        Also in the pipeline
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
        {LEGACY_GROUPS.filter(g => (byCurriculum[g] || []).length > 0).map(g => (
          <div key={g}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              {g} <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>· {(byCurriculum[g] || []).length}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(byCurriculum[g] || []).map(s => (
                <span key={s.id} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '0.15rem 0.6rem' }}>
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        skeleton shipped 2026-07-16 · every stub above carries its authoring spec · flesh arrives in waves
      </p>
    </div>
  );
}

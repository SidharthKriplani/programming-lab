// FoundationsBrowser — the KNOW-frame, unified. ONE KNOW surface (D-PL-21):
// the trunk + branches room map (foundationsRooms.js) with the 20 authored
// "Python & OOP Depth" modules (knowModules.js) folded in. A module backed by an
// authored module is READY (opens the runnable predict->reveal flow via the shared
// KnowRunner); the rest are 'planned'. The standalone Python & OOP Depth room is
// retired into here. Named export (App lazy-imports it).
import { useState } from 'react';
import {
  FOUNDATION_TRACKS, TRUNK_ROOMS, BRANCH_ROOMS, FOUNDATION_TALLY,
  KNOW_BACKING, KNOW_EXTRA, clusterModules, backingFor,
} from '../data/foundationsRooms.js';
import { knowModules } from '../data/knowModules.js';
import { KnowRunner } from './KnowBrowser.jsx';
import { getProgress } from '../utils/problemProgress.js';
import { Icon } from '../components/shared/Icon.jsx';
import { HowToStrip } from '../components/shared/HowToStrip.jsx';

const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';
const KNOW_KEY = 'pl-know-progress-v1';
const KNOW = Object.fromEntries(knowModules.map(m => [m.id, m]));

// global count of ready (authored-backed) modules, for the banner
const READY_TOTAL = Object.keys(KNOW_BACKING).length
  + Object.values(KNOW_EXTRA).reduce((n, byCluster) => n + Object.values(byCluster).reduce((a, arr) => a + arr.length, 0), 0);

const WIDGET = {
  live:    { label: 'live',    color: 'var(--green-text)', bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  sim:     { label: 'sim',     color: 'var(--accent)',     bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  stepper: { label: 'stepper', color: 'var(--teal)',       bg: 'var(--surface-2)', border: 'var(--border)' },
  concept: { label: 'concept', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
};

function Chip({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)', color, background: bg || 'transparent',
      border: '1px solid ' + (border || color), borderRadius: 999, padding: '1px 7px',
    }}>{label}</span>
  );
}

function RoomBadge({ n, accent }) {
  return (
    <span style={{
      flex: 'none', width: 26, height: 26, borderRadius: 'var(--radius-sm)',
      background: accent, color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700,
      fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{n}</span>
  );
}

// every module of a room (planned skeleton + authored extras)
function roomModules(room) {
  return room.clusters.flatMap(c => clusterModules(room.id, c.id, c.modules));
}
function roomReady(room) {
  return roomModules(room).filter(m => { const b = backingFor(m); return b && KNOW[b]; }).length;
}
function substrateMix(room) {
  const mix = {};
  roomModules(room).forEach(m => { mix[m.widget] = (mix[m.widget] || 0) + 1; });
  return ['live', 'stepper', 'sim', 'concept'].filter(k => mix[k]).map(k => k + ' ' + mix[k]).join(' · ');
}

// ── Room card (list) ─────────────────────────────────────────────────────
function RoomCard({ room, onOpen }) {
  const ready = roomReady(room);
  const total = roomModules(room).length;
  return (
    <button
      onClick={() => onOpen(room.id)}
      className="pal-card-enter pal-card-hover"
      style={{
        textAlign: 'left', cursor: 'pointer', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.95rem 1.05rem',
        display: 'flex', flexDirection: 'column', gap: '0.55rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <RoomBadge n={room.order} accent={room.accent} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text)', lineHeight: 1.2 }}>{room.title}</span>
            {room.track === 'branch' && <Chip label="branch" color="var(--red)" />}
            {ready > 0 && <Chip label={ready + ' ready'} color="var(--green-text)" bg="var(--green-bg)" border="var(--green-border)" />}
          </div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{room.subtitle}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {room.clusters.length} clusters · {total} modules
        </span>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{substrateMix(room)}</span>
      </div>
    </button>
  );
}

// ── Module card ──────────────────────────────────────────────────────────
function ReadyCard({ mod, solved, seen, onOpen }) {
  const w = WIDGET[mod.widget] || WIDGET.live;
  return (
    <button
      onClick={onOpen}
      className="pal-card-hover"
      style={{
        textAlign: 'left', cursor: 'pointer', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.8rem 0.9rem',
        display: 'flex', flexDirection: 'column', gap: '0.4rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.25 }}>{mod.title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          {solved ? <Icon name="clipboard-check" size={14} color="var(--green-text)" /> : seen ? <Icon name="clock" size={13} color="var(--text-dim)" /> : null}
          <Chip {...w} />
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{mod.model}</p>
      <span style={{ fontSize: '0.58rem', color: 'var(--green-text)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ready · open</span>
    </button>
  );
}

function PlannedCard({ mod }) {
  const w = WIDGET[mod.widget] || WIDGET.concept;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
      padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', opacity: 0.9,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.25 }}>{mod.title}</span>
        <Chip {...w} />
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{mod.model}</p>
      <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>planned</span>
    </div>
  );
}

// ── Room detail (clusters + the in-room runner) ──────────────────────────
function RoomDetail({ room, onBack }) {
  const [activeReal, setActiveReal] = useState(null);
  const progress = getProgress(KNOW_KEY);

  // ordered list of ready knowModule ids in this room (for next-cycling)
  const readyIds = roomModules(room).map(backingFor).filter(b => b && KNOW[b]);

  if (activeReal && KNOW[activeReal]) {
    const i = readyIds.indexOf(activeReal);
    const next = readyIds[(i + 1) % readyIds.length];
    return (
      <KnowRunner
        key={activeReal}
        module={KNOW[activeReal]}
        onBack={() => { setActiveReal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onNext={() => { setActiveReal(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Back to all rooms"
        >
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <RoomBadge n={room.order} accent={room.accent} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{room.title}</h1>
            <Chip label={room.track === 'branch' ? 'branch' : 'trunk'} color={room.track === 'branch' ? 'var(--red)' : 'var(--teal)'} />
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{room.subtitle}</p>
        </div>
      </div>

      {room.identity && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
          <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.55 }}>{room.identity}</p>
        </div>
      )}
      {room.charterNote && (
        <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red-text)' }}>Charter note</span>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text)', fontSize: '0.83rem', lineHeight: 1.5 }}>{room.charterNote}</p>
        </div>
      )}
      {room.grounding && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>grounded in: {room.grounding}</div>
      )}

      {room.clusters.map(cluster => {
        const mods = clusterModules(room.id, cluster.id, cluster.modules);
        return (
          <section key={cluster.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: room.accent, display: 'inline-block' }} />
              <h2 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{cluster.label}</h2>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{mods.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '0.7rem' }}>
              {mods.map(mod => {
                const b = backingFor(mod);
                const real = b && KNOW[b];
                return real
                  ? <ReadyCard key={mod.id} mod={mod} solved={!!progress.solved[b]} seen={!!progress.seen[b]} onOpen={() => { setActiveReal(b); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                  : <PlannedCard key={mod.id} mod={mod} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ── Browser ──────────────────────────────────────────────────────────────
function Band({ meta }) {
  return (
    <div style={{ margin: '0.4rem 0 0.9rem' }}>
      <h2 style={{ margin: 0, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{meta.label}</h2>
      <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{meta.sub}</p>
    </div>
  );
}

export function FoundationsBrowser() {
  const [activeId, setActiveId] = useState(null);

  if (activeId) {
    const room = [...TRUNK_ROOMS, ...BRANCH_ROOMS].find(r => r.id === activeId);
    if (room) {
      return (
        <RoomDetail
          key={room.id}
          room={room}
          onBack={() => { setActiveId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      );
    }
  }

  return (
    <div className="pal-page-enter">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="book-open" size={18} color="var(--accent)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Foundations</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '60ch', lineHeight: 1.55 }}>
          The whole Python surface, beginner to advanced — a trunk every learner climbs, then branches that diverge. Each module is a model you drive, not a page you read.
        </p>
      </div>

      <HowToStrip
        skill="The Foundations map — what to learn, in order"
        steps={['Climb the trunk', 'Then take a branch', 'Every module is a live model']}
      />

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
        background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
        padding: '0.55rem 0.8rem', margin: '0.9rem 0 1.5rem',
      }}>
        <Icon name="info" size={14} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {FOUNDATION_TALLY.rooms} rooms · {FOUNDATION_TALLY.clusters} clusters mapped · <strong style={{ color: 'var(--green-text)' }}>{READY_TOTAL} ready now</strong> (the folded-in Python &amp; OOP depth); the rest are planned, authored room-by-room.
        </span>
      </div>

      <Band meta={FOUNDATION_TRACKS.trunk} />
      <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '0.85rem', marginBottom: '2rem' }}>
        {TRUNK_ROOMS.map(room => <RoomCard key={room.id} room={room} onOpen={setActiveId} />)}
      </div>

      <Band meta={FOUNDATION_TRACKS.branch} />
      <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '0.85rem' }}>
        {BRANCH_ROOMS.map(room => <RoomCard key={room.id} room={room} onOpen={setActiveId} />)}
      </div>
    </div>
  );
}

export default FoundationsBrowser;

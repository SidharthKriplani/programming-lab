// src/components/shared/DailyRep.jsx — the Daily Rep (2026-07-16).
//
// One runnable problem per day, same for everyone: FNV-1a hash of the local
// date indexes the PyLab bank. Solving it in the PyLab room counts — this card
// detects the solve via problemProgress, keeps the streak (with a once-a-week
// automatic streak freeze), scores Elo off the FIRST Submit attempt
// (utils/ratings.js), and copies a Wordle-style share block.
//
// Sibling of GSL/MSL/PAL's DailyDrill — but PL's daily is real code, not MCQ.

import { useState, useEffect, useMemo } from 'react';
import { pyLabProblems, PYLAB_TOPICS } from '../../data/pyLabProblems.js';
import { getProgress, getAttempts } from '../../utils/problemProgress.js';
import { recordAttempt, getRating } from '../../utils/ratings.js';
import { Icon } from './Icon.jsx';

const SALT = 'pl';
const STORE_KEY = 'pl-daily-rep-v1';
const PYLAB_KEY = 'pl-pylab-progress-v1';
const EPOCH = '2026-07-16'; // Rep #1
const SHARE_URL = 'https://programming-lab.vercel.app';
const ELO_DIFF = { warmup: 'easy', core: 'medium', stretch: 'hard' };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dayNumber(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [ey, em, ed] = EPOCH.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 86400000) + 1;
}
function prevKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) - 86400000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

function readStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    return s && typeof s === 'object' && s.history ? s : { history: {} };
  } catch { return { history: {} }; }
}
function writeStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function computeStats(history, today) {
  const solvedDays = Object.keys(history).filter(k => history[k]?.solved);
  const played = solvedDays.length;
  const firstTry = solvedDays.filter(k => history[k]?.firstTry).length;
  const active = k => !!(history[k]?.solved || history[k]?.frozen);
  let streak = 0;
  let cursor = active(today) ? today : prevKey(today);
  while (active(cursor)) { streak += 1; cursor = prevKey(cursor); }
  let best = 0;
  const activeDays = Object.keys(history).filter(active);
  const set = new Set(activeDays);
  for (const d of activeDays) {
    if (set.has(prevKey(d))) continue;
    let len = 0, c = d;
    while (set.has(c)) {
      len += 1;
      const [y, m, dd] = c.split('-').map(Number);
      const n = new Date(Date.UTC(y, m - 1, dd) + 86400000);
      c = `${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, '0')}-${String(n.getUTCDate()).padStart(2, '0')}`;
    }
    best = Math.max(best, len);
  }
  return { played, firstTry, streak, best };
}

export function DailyRep() {
  const today = todayKey();
  const repNo = dayNumber(today);
  const [store, setStore] = useState(() => readStore());
  const [copied, setCopied] = useState(false);
  const [froze, setFroze] = useState(false);

  // Deterministic daily pick (stable bank order).
  const problem = useMemo(() => {
    if (!pyLabProblems.length) return null;
    return pyLabProblems[fnv1a(SALT + ':' + today) % pyLabProblems.length];
  }, [today]);

  const entry = store.history[today] || null;
  const solvedToday = !!entry?.solved;

  // Streak freeze: bridge exactly ONE missed day, at most once per week.
  useEffect(() => {
    const s = readStore();
    const y = prevKey(today);
    const y2 = prevKey(y);
    const week = Math.floor(Date.now() / 604800000);
    const active = k => !!(s.history[k]?.solved || s.history[k]?.frozen);
    if (!active(y) && active(y2) && s.lastFreezeWeek !== week) {
      const next = { ...s, lastFreezeWeek: week, history: { ...s.history, [y]: { frozen: true } } };
      writeStore(next); setStore(next); setFroze(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solve detection: the actual solving happens in the PyLab room; this card
  // reads problemProgress on mount + window focus. First detection records the
  // day (streak) and the Elo attempt — scored off the FIRST Submit's pass/fail.
  useEffect(() => {
    function check() {
      if (!problem) return;
      const s = readStore();
      if (s.history[todayKey()]?.solved) return;
      const prog = getProgress(PYLAB_KEY);
      if (!prog.solved || !prog.solved[problem.id]) return;
      const attempts = getAttempts(PYLAB_KEY, problem.id);
      const firstTry = attempts.length ? !!attempts[0].pass : true;
      recordAttempt('PyLab · ' + (PYLAB_TOPICS[problem.topic] || problem.topic), firstTry, ELO_DIFF[problem.difficulty] || 'medium');
      const next = { ...s, history: { ...s.history, [todayKey()]: { solved: true, firstTry, qid: problem.id } } };
      writeStore(next); setStore(next);
    }
    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, [problem]);

  const stats = useMemo(() => computeStats(store.history, today), [store, today]);
  if (!problem) return null;

  const topicLabel = PYLAB_TOPICS[problem.topic] || problem.topic;
  const rating = getRating('PyLab · ' + topicLabel);

  function share() {
    const txt = [
      `BreakLabs Daily Rep #${repNo} · Programming Lab`,
      solvedToday ? (entry.firstTry ? '🟩 solved — first submit' : '🟨 solved') : '⬜ not yet',
      `🔥 ${stats.streak}-day streak · ⚡ ${topicLabel} ${rating}`,
      SHARE_URL,
    ].join('\n');
    try { navigator.clipboard.writeText(txt); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="pal-card-enter" style={{
      marginTop: '2rem', maxWidth: 560, padding: '1.1rem 1.25rem',
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: 'var(--font-mono)' }}>
          ⚡ Daily Rep #{repNo}
        </span>
        <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 999, padding: '1px 8px' }}>
          {topicLabel} · <b style={{ color: 'var(--accent)' }}>{rating}</b>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: stats.streak > 0 ? 'var(--accent)' : 'var(--text-dim)' }}>
          {stats.streak > 0 ? `🔥 ${stats.streak}-day streak` : 'one real problem · every day'}
        </span>
      </div>

      {froze && (
        <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', margin: '0 0 0.5rem' }}>
          🧊 Streak freeze used — yesterday's gap was bridged automatically.
        </p>
      )}

      <p style={{ margin: '0 0 0.7rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
        {problem.title}
      </p>

      {solvedToday ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--green, #16a34a)' }}>
            {entry.firstTry ? '🟩 Solved — first submit' : '🟨 Solved'}
          </span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            {stats.played} played · {stats.best} best streak · {stats.played ? Math.round((stats.firstTry / stats.played) * 100) : 0}% first-submit
          </span>
          <button onClick={share} className="pal-btn-primary" style={{ marginLeft: 'auto', padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}>
            {copied ? 'Copied ✓' : 'Share result'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { window.location.hash = '#/pylab/' + problem.id; }}
            className="pal-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Icon name="terminal" size={14} color="currentColor" />
            Solve today's rep →
          </button>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            first Submit is the rated attempt
          </span>
        </div>
      )}
    </div>
  );
}

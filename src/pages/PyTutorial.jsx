// PyTutorial — the beginner on-ramp inside PyLab (SQLBolt-style guided walkthrough).
// Launched from a banner at the top of PyLabBrowser; lives entirely within the DO/PyLab
// room (nothing standalone). Ladder of short lessons -> per-lesson tasks checked inline via
// runCheck (the same grader as Foundations "your turn") -> graduate into the gym.
// Named export (PyLabBrowser renders it as an internal view, like Mock interview).
import { useState, useEffect } from 'react';
import { pyTutorial, PY_TUT_SECTIONS, pyTutMeta } from '../data/pyTutorial.js';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { loadPython, runCheck } from '../components/ide/pyodideRuntime.js';
import { Icon } from '../components/shared/Icon.jsx';

const KEY = 'pl-pytut-progress-v1';

function readDone() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch { return new Set(); }
}
function writeDone(set) {
  try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

// ── One task: editor + Check, targeted feedback (mirrors KnowBrowser YourTurn) ──
function TaskCell({ task, index, passed, onPass }) {
  const [code, setCode] = useState(task.starter);
  const [verdict, setVerdict] = useState(null); // { pass, msg }
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);

  async function check() {
    setBusy(true); setVerdict(null);
    try {
      await loadPython();
      const r = await runCheck(code, task.check);
      if (r.error) {
        const lines = r.error.trim().split('\n');
        setVerdict({ pass: false, msg: 'Your code raised an error — ' + (lines[lines.length - 1] || 'check the traceback') });
      } else {
        setVerdict({ pass: r.pass, msg: r.msg });
        if (r.pass) onPass(task.id);
      }
    } catch (e) {
      setVerdict({ pass: false, msg: String(e.message || e) });
    }
    setBusy(false);
  }

  const done = passed || (verdict && verdict.pass);

  return (
    <div style={{ border: '1px solid ' + (done ? 'var(--green-border)' : 'var(--border)'), borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ width: 20, height: 20, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: done ? 'var(--green-bg)' : 'var(--surface-2)', border: '1px solid ' + (done ? 'var(--green-border)' : 'var(--border)') }}>
          {done ? <Icon name="check" size={12} color="var(--green-text)" /> : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1}</span>}
        </span>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>{task.prompt}</p>
      </div>
      <PythonCell
        initialCode={task.starter}
        label="lesson.py"
        glassBox={false}
        onCodeChange={setCode}
        onSubmit={check}
        height={Math.min(200, 56 + task.starter.split('\n').length * 20)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
        <button onClick={check} disabled={busy} className="pal-btn-primary" style={{ fontSize: '0.84rem' }}>
          {busy ? 'Checking…' : 'Check (⌘↵)'}
        </button>
        {task.hint && (
          <button onClick={() => setShowHint(h => !h)} style={{ fontSize: '0.78rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.32rem 0.65rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showHint ? 'hide hint' : 'hint'}
          </button>
        )}
      </div>
      {showHint && task.hint && (
        <p style={{ margin: '0.55rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task.hint}</p>
      )}
      {verdict && (
        <div style={{ marginTop: '0.6rem', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)', background: verdict.pass ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (verdict.pass ? 'var(--green-border)' : 'var(--red-border)'), display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
          <Icon name={verdict.pass ? 'check' : 'x'} size={14} color={verdict.pass ? 'var(--green-text)' : 'var(--red-text)'} />
          <span style={{ fontSize: '0.85rem', color: verdict.pass ? 'var(--green-text)' : 'var(--red-text)', lineHeight: 1.5 }}>{verdict.msg}</span>
        </div>
      )}
    </div>
  );
}

// ── A single lesson: concept + tasks + graduate hand-off ─────────────────────
function LessonView({ lesson, onBack, onComplete }) {
  const [passed, setPassed] = useState(new Set());

  useEffect(() => { setPassed(new Set()); }, [lesson.n]);

  function onPass(taskId) {
    setPassed(prev => {
      if (prev.has(taskId)) return prev;
      const next = new Set(prev); next.add(taskId);
      if (next.size === lesson.tasks.length) onComplete(lesson);
      return next;
    });
  }

  const paras = lesson.concept.split('\n\n');
  const allDone = passed.size === lesson.tasks.length;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <button onClick={onBack} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }} aria-label="Back to lessons">
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Lesson {lesson.n}</span>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>{lesson.title}</h1>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: allDone ? 'var(--green-text)' : 'var(--text-muted)' }}>{passed.size} / {lesson.tasks.length}</span>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {paras.map((p, i) => (
          <p key={i} style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.65 }}>{p}</p>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {lesson.tasks.map((task, i) => (
          <TaskCell key={task.id} task={task} index={i} passed={passed.has(task.id)} onPass={onPass} />
        ))}
      </div>

      {allDone && (
        <div style={{ border: '1px solid var(--green-border)', background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Icon name="check" size={16} color="var(--green-text)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--green-text)', fontWeight: 700 }}>
            Lesson {lesson.n} complete.
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {lesson.graduatesTo ? lesson.graduatesTo.label + ' — or keep climbing.' : 'On to the next lesson.'}
          </span>
          <button onClick={onBack} className="pal-btn-primary" style={{ marginLeft: 'auto', fontSize: '0.84rem' }}>
            Next lesson →
          </button>
        </div>
      )}
    </div>
  );
}

// ── The ladder (lesson list, grouped by section) + room ──────────────────────
export function PyTutorial({ onExit }) {
  const [openN, setOpenN] = useState(null);
  const [done, setDone] = useState(readDone);

  const active = openN != null ? pyTutorial.find(l => l.n === openN && l.status === 'ready' && l.section === 'python') : null;
  // lessons are keyed by section+n; the active lookup above is python-only for the skeleton

  function complete(lesson) {
    setDone(prev => {
      const next = new Set(prev); next.add(lesson.section + '-' + lesson.n);
      writeDone(next); return next;
    });
  }

  if (active) {
    return <LessonView lesson={active} onBack={() => setOpenN(null)} onComplete={complete} />;
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.7rem' }}>
        <button onClick={onExit} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.6rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem' }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Back to PyLab
        </button>
        <Icon name="book-open" size={18} color="var(--accent)" />
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>Start from zero</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>one idea at a time — skip ahead anytime</span>
      </div>

      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '64ch' }}>
        New to Python or pandas? Climb these short lessons until you can write a passing solve(). Each lesson is a concept and a few tiny tasks you complete right here. When you are ready, the gym takes over.
      </p>

      {PY_TUT_SECTIONS.map(sec => {
        const lessons = pyTutorial.filter(l => l.section === sec.id);
        return (
          <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{sec.label}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sec.blurb}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '0.55rem' }}>
              {lessons.map(l => {
                const ready = l.status === 'ready';
                const isDone = done.has(l.section + '-' + l.n);
                return (
                  <button
                    key={l.section + '-' + l.n}
                    onClick={() => ready && setOpenN(l.n)}
                    disabled={!ready}
                    style={{
                      textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      padding: '0.7rem 0.8rem', borderRadius: 'var(--radius-sm)',
                      border: '1px solid ' + (isDone ? 'var(--green-border)' : 'var(--border)'),
                      background: ready ? 'var(--surface)' : 'var(--surface-2)',
                      cursor: ready ? 'pointer' : 'default', opacity: ready ? 1 : 0.55,
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.1rem', flexShrink: 0 }}>{String(l.n).padStart(2, '0')}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{l.title}</span>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {ready ? (l.tasks.length + ' tasks') : 'Planned · coming soon'}
                      </span>
                    </span>
                    {isDone && <Icon name="check" size={14} color="var(--green-text)" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {pyTutMeta.readyLessons} of {pyTutMeta.totalLessons} lessons ready · {pyTutMeta.readyTasks} verified tasks live.
      </p>
    </div>
  );
}

export default PyTutorial;

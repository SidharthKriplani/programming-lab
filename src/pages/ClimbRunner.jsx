// ClimbRunner — Climb mode: a room's lesson thread as a guided ladder (A1).
// Data: lessonThreads.js (read -> drive the model -> graded YOUR TURN -> next).
// Grading reuses pyodideRuntime.runCheck — the same contract as PyTutorial and
// the Foundations "your turn" cells. Progress: localStorage per (room, step).
// Route: view 'climb', hash sub = room id (#/climb/python-foundations).
import { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { loadPython, runCheck } from '../components/ide/pyodideRuntime.js';
import { THREAD_BY_ROOM } from '../data/lessonThreads.js';
import { FOUNDATION_ROOMS } from '../data/foundationsRooms.js';

const KEY = 'pl-climb-progress-v1';
const readDone = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } };
const writeDone = (s) => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* ignore */ } };

const MODULE_TITLE = {};
for (const r of FOUNDATION_ROOMS) for (const c of r.clusters) for (const m of c.modules) MODULE_TITLE[m.id] = m.title;

function YourTurn({ stepId, task, done, onPass }) {
  const [code, setCode] = useState(task.starter);
  const [verdict, setVerdict] = useState(null);
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
        if (r.pass) onPass(stepId);
      }
    } catch (e) {
      setVerdict({ pass: false, msg: String(e.message || e) });
    }
    setBusy(false);
  }

  const passed = done || (verdict && verdict.pass);
  return (
    <div style={{ marginTop: '0.7rem', border: '1px solid ' + (passed ? 'var(--green-border)' : 'var(--border)'), borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: passed ? 'var(--green-text)' : 'var(--accent)', textTransform: 'uppercase' }}>
          {passed ? 'Passed' : 'Your turn'}
        </span>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>{task.prompt}</p>
      </div>
      <PythonCell
        initialCode={task.starter}
        label='climb.py'
        glassBox={false}
        onCodeChange={setCode}
        onSubmit={check}
        height={Math.min(220, 56 + task.starter.split('\n').length * 20)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
        <button onClick={check} disabled={busy} className='pal-btn-primary' style={{ fontSize: '0.84rem' }}>
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

export function ClimbRunner({ roomId, onExit }) {
  const thread = THREAD_BY_ROOM[roomId];
  const room = FOUNDATION_ROOMS.find(r => r.id === roomId);
  const [done, setDone] = useState(readDone);
  const [cursor, setCursor] = useState(0);

  const steps = thread ? thread.steps : [];
  const stepId = (i) => 'climb:' + roomId + ':' + (steps[i] ? steps[i].module : i);
  const doneCount = useMemo(() => steps.filter((s, i) => done.has(stepId(i))).length, [done, steps]);

  if (!thread || thread.status !== 'ready' || !room) {
    return (
      <div className='pal-page-enter'>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          This room’s climb is not authored yet — browse its modules in Foundations meanwhile.
        </p>
        <button onClick={onExit} className='pal-btn-primary' style={{ fontSize: '0.8rem' }}>Back to Foundations</button>
      </div>
    );
  }

  const step = steps[cursor];
  const markRead = () => {
    // read-only steps complete on Next; yourTurn steps complete on a passing check
    if (!step.yourTurn) onPass(stepId(cursor));
    if (cursor < steps.length - 1) { setCursor(cursor + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  function onPass(id) {
    setDone(prev => { if (prev.has(id)) return prev; const next = new Set(prev); next.add(id); writeDone(next); return next; });
  }

  return (
    <div className='pal-page-enter' style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 780 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <button onClick={onExit} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }} aria-label='Exit climb'>
          <Icon name='arrow-left' size={16} color='var(--text-muted)' />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{thread.title}</h1>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            step {cursor + 1} / {steps.length} · {doneCount} done
          </p>
        </div>
      </div>

      {/* ladder dots */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <button key={s.module} onClick={() => setCursor(i)} title={MODULE_TITLE[s.module] || s.module}
            style={{
              width: 14, height: 14, borderRadius: 4, cursor: 'pointer', padding: 0,
              border: '1px solid ' + (i === cursor ? 'var(--accent)' : 'var(--border)'),
              background: done.has(stepId(i)) ? 'var(--green-bg)' : i === cursor ? 'var(--surface-2)' : 'var(--surface)',
            }} />
        ))}
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1.05rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--accent)', textTransform: 'uppercase' }}>
            {MODULE_TITLE[step.module] || step.module}
          </span>
          {step.yourTurn && <span style={{ fontSize: '0.58rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>GRADED</span>}
        </div>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.65 }}>{step.read}</p>
      </div>

      {step.yourTurn && (
        <YourTurn stepId={stepId(cursor)} task={step.yourTurn} done={done.has(stepId(cursor))} onPass={onPass} />
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {cursor > 0 && (
          <button onClick={() => { setCursor(cursor - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ fontSize: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            Back
          </button>
        )}
        {cursor < steps.length - 1 ? (
          <button onClick={markRead} className='pal-btn-primary' style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            {step.yourTurn && !done.has(stepId(cursor)) ? 'Skip for now' : 'Next'}
            <Icon name='arrow-right' size={13} color='currentColor' />
          </button>
        ) : (
          <button onClick={onExit} className='pal-btn-primary' style={{ fontSize: '0.8rem' }}>
            Finish climb · back to Foundations
          </button>
        )}
      </div>
    </div>
  );
}

export default ClimbRunner;

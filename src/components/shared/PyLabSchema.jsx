// PyLabSchema — the fixture/schema panel for the two-pane PyLab solve view (adapted from
// PAL's SQL-Lab schema panel). Left side shows the INPUT (columns + dtypes + a small sample
// of values — you need these to write the code) and the TARGET SHAPE (output columns/dtypes/
// rowcount, NO values — D-PL-26: showing the answer would defuse the runs-but-wrong traps).
// Reads the precomputed src/data/pyLabSchemas.js.
import { Icon } from './Icon.jsx';

const mono = { fontFamily: 'var(--font-mono)' };
const cap = { fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)' };

function Dtype({ d }) {
  return <span style={{ ...mono, fontSize: '0.62rem', color: 'var(--text-dim)', marginLeft: '0.3rem' }}>{d}</span>;
}

function InputCard({ inp }) {
  if (inp.kind === 'df') {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)', padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <strong style={{ color: 'var(--text)' }}>{inp.name}</strong> · DataFrame · {inp.rows} rows
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.74rem' }}>
            <thead>
              <tr>{inp.cols.map(c => (
                <th key={c.name} style={{ textAlign: 'left', padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', color: 'var(--text)' }}>{c.name}<Dtype d={c.dtype} /></th>
              ))}</tr>
            </thead>
            <tbody>
              {(inp.sample || []).map((row, i) => (
                <tr key={i}>{row.map((v, j) => (
                  <td key={j} style={{ ...mono, padding: '0.25rem 0.6rem', borderBottom: '1px solid var(--border-subtle, var(--border))', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        {inp.rows > (inp.sample || []).length && <div style={{ ...mono, fontSize: '0.64rem', color: 'var(--text-dim)', padding: '0.25rem 0.6rem' }}>… {inp.rows - inp.sample.length} more rows</div>}
      </div>
    );
  }
  // non-DataFrame inputs — one compact line
  let detail = '';
  if (inp.kind === 'series') detail = 'Series · ' + inp.dtype + ' · ' + inp.rows + ' · [' + (inp.sample || []).join(', ') + ']';
  else if (inp.kind === 'ndarray') detail = 'ndarray · ' + inp.dtype + ' · shape ' + JSON.stringify(inp.shape) + ' · [' + (inp.sample || []).join(', ') + ']';
  else if (inp.kind === 'list') detail = 'list · len ' + inp.length + ' · [' + (inp.sample || []).join(', ') + ']';
  else if (inp.kind === 'dict') detail = 'dict · len ' + inp.length + ' · {' + (inp.keys || []).join(', ') + '}';
  else detail = String(inp.repr);
  return (
    <div style={{ ...mono, fontSize: '0.76rem', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.45rem 0.6rem' }}>
      <strong style={{ color: 'var(--text)' }}>{inp.name}</strong> · {detail}
    </div>
  );
}

function TargetShape({ out }) {
  let body;
  if (out.kind === 'df') {
    body = (
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {out.cols.map(c => (
          <span key={c.name} style={{ ...mono, fontSize: '0.7rem', padding: '1px 7px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{c.name}<Dtype d={c.dtype} /></span>
        ))}
        <span style={{ ...mono, fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>· {out.rows} rows</span>
      </div>
    );
  } else if (out.kind === 'series') {
    body = <span style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Series{out.name ? ' "' + out.name + '"' : ''} · {out.dtype} · {out.rows} values</span>;
  } else if (out.kind === 'ndarray') {
    body = <span style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>ndarray · {out.dtype} · shape {JSON.stringify(out.shape)}</span>;
  } else if (out.kind === 'list') {
    body = <span style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>list · {out.length} items</span>;
  } else if (out.kind === 'dict') {
    body = <span style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>dict · {out.length} keys</span>;
  } else {
    body = <span style={{ ...mono, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>a single {out.type}</span>;
  }
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '0.55rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={cap}>Returns · shape only</span>
      {body}
      <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>values hidden on purpose — match it from your own reasoning, not an answer key.</span>
    </div>
  );
}

export function PyLabSchema({ schema }) {
  if (!schema) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {(schema.inputs || []).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={cap}><Icon name="layers" size={11} color="var(--text-muted)" /> Input</span>
          {schema.inputs.map(inp => <InputCard key={inp.name} inp={inp} />)}
        </div>
      )}
      {schema.output && <TargetShape out={schema.output} />}
    </div>
  );
}

export default PyLabSchema;

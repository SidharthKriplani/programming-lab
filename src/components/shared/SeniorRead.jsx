// SeniorRead — the KNOW debrief panel, mirroring PAL's Stats Room StatsConceptPanel.
// Four stacked, colour-coded cards built from a module's `seniorRead` block:
//   Short answer (teal)  ·  Why (neutral, pre-wrap)  ·  Common mistake (yellow)  ·
//   Interview phrasing (accent, italic), then optional "connects to" chips.
// This is the depth layer that makes KNOW feel like Foundations, not a flashcard.
//
// `body` text may carry **bold** spans (e.g. **Weak pattern:**); renderBold splits
// on ** without any markdown dependency. \n\n in `why` becomes paragraph breaks
// (whiteSpace: pre-wrap). All theming via CSS variables (Instrument palette).
import { Icon } from './Icon.jsx';

// minimal **bold** renderer — splits on ** pairs, no dependency, no dangerouslySetInnerHTML
function renderBold(text) {
  const parts = String(text).split('**');
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: 'var(--text)', fontWeight: 700 }}>{p}</strong>
      : <span key={i}>{p}</span>
  );
}

function Card({ icon, label, labelColor, bg, border, children, italic }) {
  return (
    <div style={{ background: bg, border: '1px solid ' + border, borderLeft: '3px solid ' + labelColor, borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Icon name={icon} size={13} color={labelColor} />
        <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor }}>{label}</span>
      </div>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontStyle: italic ? 'italic' : 'normal' }}>
        {children}
      </p>
    </div>
  );
}

export function SeniorRead({ seniorRead, onNavigate }) {
  if (!seniorRead) return null;
  const { shortAnswer, why, commonMistake, interviewPhrase, connectsTo } = seniorRead;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
        <Icon name="book-open" size={15} color="var(--teal)" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>The senior read</span>
      </div>

      {shortAnswer && (
        <Card icon="check" label="Short answer" labelColor="var(--teal)" bg="var(--teal-bg)" border="var(--teal-border)">
          {renderBold(shortAnswer)}
        </Card>
      )}
      {why && (
        <Card icon="file-text" label="Why" labelColor="var(--text-secondary)" bg="var(--surface-2)" border="var(--border)">
          {renderBold(why)}
        </Card>
      )}
      {commonMistake && (
        <Card icon="alert-triangle" label="Common mistake" labelColor="var(--yellow-text)" bg="var(--yellow-bg)" border="var(--yellow-border)">
          {renderBold(commonMistake)}
        </Card>
      )}
      {interviewPhrase && (
        <Card icon="pen-line" label="Say it like this" labelColor="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)" italic>
          {renderBold(interviewPhrase)}
        </Card>
      )}

      {Array.isArray(connectsTo) && connectsTo.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>Practice next</span>
          {connectsTo.map(room => (
            <button
              key={room}
              onClick={() => onNavigate && onNavigate(room)}
              className="pl-chip"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface)', cursor: onNavigate ? 'pointer' : 'default', textTransform: 'capitalize' }}
            >
              {room} &rarr;
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeniorRead;

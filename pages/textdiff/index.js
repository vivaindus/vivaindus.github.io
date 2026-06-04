import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

export default function TextDiffChecker() {
  const [leftText, setLeftText] = useState('Original text\nPaste your first version here.');
  const [rightText, setRightText] = useState('Modified text\nPaste your second version here.');
  const [compareMode, setCompareMode] = useState('line');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);

  const diff = useMemo(() => {
    return compareTexts(leftText, rightText, compareMode, ignoreCase, ignoreWhitespace);
  }, [leftText, rightText, compareMode, ignoreCase, ignoreWhitespace]);

  const visibleRows = showOnlyChanged
    ? diff.rows.filter(row => row.type !== 'same')
    : diff.rows;

  const clearAll = () => {
    setLeftText('');
    setRightText('');
  };

  const swapText = () => {
    setLeftText(rightText);
    setRightText(leftText);
  };

  return (
    <ToolboxLayout
      title="Text Diff Checker - Compare Text Online"
      description="Compare two texts online and find differences by line, word or character. Use ignore case, ignore whitespace, line numbers, summary counts and private browser-based comparison."
    >
      <div style={pageWrap}>
        <section style={hero}>
          <p style={eyebrow}>Free browser-based comparison tool</p>
          <h1 style={heroTitle}>Text Diff Checker</h1>
          <p style={heroText}>
            Compare two versions of text, code, notes, articles, JSON, emails, or documents and quickly find
            added, removed, changed, and unchanged content.
          </p>
        </section>

        <section style={appPanel}>
          <div style={toolbar}>
            <label style={fieldWrap}>
              <span style={fieldLabel}>Compare mode</span>
              <select value={compareMode} onChange={(e) => setCompareMode(e.target.value)} style={inputStyle}>
                <option value="line">Line by line</option>
                <option value="word">Word by word</option>
                <option value="char">Character by character</option>
              </select>
            </label>

            <label style={checkLabel}>
              <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
              Ignore case
            </label>

            <label style={checkLabel}>
              <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
              Ignore extra whitespace
            </label>

            <label style={checkLabel}>
              <input type="checkbox" checked={showOnlyChanged} onChange={(e) => setShowOnlyChanged(e.target.checked)} />
              Show only changed
            </label>

            <button onClick={swapText} style={secondaryBtn}>Swap</button>
            <button onClick={clearAll} style={secondaryBtn}>Clear</button>
          </div>

          <div style={editorGrid}>
            <div>
              <h2 style={editorTitle}>Original text</h2>
              <textarea value={leftText} onChange={(e) => setLeftText(e.target.value)} style={textarea} />
            </div>

            <div>
              <h2 style={editorTitle}>Modified text</h2>
              <textarea value={rightText} onChange={(e) => setRightText(e.target.value)} style={textarea} />
            </div>
          </div>

          <div style={statsGrid}>
            <div style={statCard}><strong>{diff.added}</strong><span>Added</span></div>
            <div style={statCard}><strong>{diff.removed}</strong><span>Removed</span></div>
            <div style={statCard}><strong>{diff.changed}</strong><span>Changed</span></div>
            <div style={statCard}><strong>{diff.same}</strong><span>Same</span></div>
            <div style={statCard}><strong>{diff.similarity}%</strong><span>Similarity</span></div>
          </div>

          <div style={resultPanel}>
            <h2 style={panelTitle}>Comparison result</h2>
            {visibleRows.length ? (
              <div style={diffTable}>
                {visibleRows.map((row, index) => (
                  <div key={index} style={getRowStyle(row.type)}>
                    <span style={lineNo}>{row.leftLine || ''}</span>
                    <div style={diffCell}>{row.left || ''}</div>
                    <span style={lineNo}>{row.rightLine || ''}</span>
                    <div style={diffCell}>{row.right || ''}</div>
                    <span style={badge}>{getBadge(row.type)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyText}>No rows to show.</p>
            )}
          </div>
        </section>

        <section style={contentSection}>
          <h2>Compare text online and find differences</h2>
          <p>
            A text diff checker helps you compare two versions of text and quickly identify what was added, removed,
            or changed. It is useful for office documents, code snippets, articles, emails, reports, contracts, notes,
            JSON, configuration files, and copied text from different sources.
          </p>
          <p>
            This tool is designed for quick browser-based comparison. Paste the original text on the left, paste the
            modified text on the right, choose a comparison mode, and review the differences with summary counts.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Line comparison</h3><p>Best for documents, code, lists, paragraphs, and structured text.</p></div>
            <div style={seoCard}><h3>Word comparison</h3><p>Best for checking rewritten sentences, emails, article edits, and content changes.</p></div>
            <div style={seoCard}><h3>Character comparison</h3><p>Best for finding tiny changes, typos, spacing issues, and short text differences.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The comparison runs in your browser without requiring account creation.</p></div>
          </div>

          <h2>When should you use a text diff checker?</h2>
          <ul style={listStyle}>
            <li>Compare two versions of an email, article, report, or document.</li>
            <li>Find changes in code, JSON, HTML, CSS, SQL, or configuration text.</li>
            <li>Check whether edited text changed the meaning of the original.</li>
            <li>Review text copied from Word, PDFs, websites, or spreadsheets.</li>
            <li>Find missing lines, extra words, spelling changes, or formatting differences.</li>
          </ul>

          <h2>Tips for better comparison</h2>
          <ul style={listStyle}>
            <li>Use line mode for long documents and code.</li>
            <li>Use word mode for paragraphs and rewritten content.</li>
            <li>Use character mode for short values, IDs, formulas, and typo checks.</li>
            <li>Turn on ignore case when uppercase/lowercase changes are not important.</li>
            <li>Turn on ignore whitespace when extra spaces should not count as changes.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this text compare tool free?</h3><p>Yes. You can compare text online for free without creating an account.</p></div>
            <div style={seoCard}><h3>Can I compare code?</h3><p>Yes. You can paste code, JSON, HTML, CSS, SQL, or plain text into both editors.</p></div>
            <div style={seoCard}><h3>Can I ignore whitespace?</h3><p>Yes. Use the ignore whitespace option to reduce noise from extra spaces.</p></div>
            <div style={seoCard}><h3>Can I compare word by word?</h3><p>Yes. Choose word mode to compare text by words instead of full lines.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/textdiff" />
      </div>
    </ToolboxLayout>
  );
}

function compareTexts(left, right, mode, ignoreCase, ignoreWhitespace) {
  const leftUnits = splitText(left, mode);
  const rightUnits = splitText(right, mode);
  const max = Math.max(leftUnits.length, rightUnits.length);
  const rows = [];

  let added = 0;
  let removed = 0;
  let changed = 0;
  let same = 0;
  let leftLine = 1;
  let rightLine = 1;

  for (let i = 0; i < max; i++) {
    const originalLeft = leftUnits[i] ?? '';
    const originalRight = rightUnits[i] ?? '';
    const normalizedLeft = normalize(originalLeft, ignoreCase, ignoreWhitespace);
    const normalizedRight = normalize(originalRight, ignoreCase, ignoreWhitespace);

    let type = 'same';

    if (i >= leftUnits.length) {
      type = 'added';
      added++;
    } else if (i >= rightUnits.length) {
      type = 'removed';
      removed++;
    } else if (normalizedLeft !== normalizedRight) {
      type = 'changed';
      changed++;
    } else {
      same++;
    }

    rows.push({
      left: originalLeft,
      right: originalRight,
      type,
      leftLine: i < leftUnits.length ? leftLine++ : '',
      rightLine: i < rightUnits.length ? rightLine++ : ''
    });
  }

  const compared = added + removed + changed + same;
  const similarity = compared ? Math.round((same / compared) * 100) : 100;

  return { rows, added, removed, changed, same, similarity };
}

function splitText(text, mode) {
  if (mode === 'word') return text.trim() ? text.split(/\s+/) : [];
  if (mode === 'char') return Array.from(text);
  return text.split(/\r?\n/);
}

function normalize(value, ignoreCase, ignoreWhitespace) {
  let output = String(value);
  if (ignoreWhitespace) output = output.replace(/\s+/g, ' ').trim();
  if (ignoreCase) output = output.toLowerCase();
  return output;
}

function getBadge(type) {
  if (type === 'added') return 'Added';
  if (type === 'removed') return 'Removed';
  if (type === 'changed') return 'Changed';
  return 'Same';
}

function getRowStyle(type) {
  const base = {
    display: 'grid',
    gridTemplateColumns: '52px 1fr 52px 1fr 90px',
    gap: '0',
    borderBottom: '1px solid #334155',
    minWidth: '760px'
  };

  if (type === 'added') return { ...base, background: 'rgba(34,197,94,0.12)' };
  if (type === 'removed') return { ...base, background: 'rgba(239,68,68,0.12)' };
  if (type === 'changed') return { ...base, background: 'rgba(250,204,21,0.10)' };
  return base;
}

const pageWrap = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const appPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px' };
const toolbar = { display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'end', marginBottom: '24px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '12px' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px 16px', fontWeight: 900, cursor: 'pointer' };
const editorGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' };
const editorTitle = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
const textarea = { width: '100%', minHeight: '260px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '24px' };
const statCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' };
const resultPanel = { marginTop: '28px' };
const panelTitle = { color: '#fff' };
const diffTable = { border: '1px solid #334155', borderRadius: '14px', overflow: 'auto' };
const lineNo = { color: '#64748b', padding: '10px', borderRight: '1px solid #334155', textAlign: 'right', fontSize: '0.78rem' };
const diffCell = { color: '#cbd5e1', padding: '10px', borderRight: '1px solid #334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
const badge = { color: '#fff', padding: '10px', fontSize: '0.78rem', fontWeight: 900 };
const emptyText = { color: '#94a3b8', textAlign: 'center' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };

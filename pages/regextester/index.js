import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleText = `Order ID: INV-1001
Email: support@shbstores.com
Phone: +971501234567
Website: https://www.shbstores.com
Amount: AED 250.00`;

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b');
  const [text, setText] = useState(sampleText);
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false, u: false });
  const [replaceText, setReplaceText] = useState('[EMAIL]');
  const [notification, setNotification] = useState('');

  const activeFlags = Object.entries(flags).filter(([, enabled]) => enabled).map(([flag]) => flag).join('');

  const result = useMemo(() => {
    if (!pattern) {
      return { ok: false, error: 'Enter a regular expression pattern first.', matches: [], highlighted: text, replaced: '' };
    }

    try {
      const regex = new RegExp(pattern, activeFlags.includes('g') ? activeFlags : activeFlags + 'g');
      const matches = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });

        if (match[0] === '') regex.lastIndex++;
      }

      const replaceRegex = new RegExp(pattern, activeFlags);
      const replaced = text.replace(replaceRegex, replaceText);

      return {
        ok: true,
        error: '',
        matches,
        highlighted: buildHighlightedText(text, matches),
        replaced
      };
    } catch (error) {
      return { ok: false, error: error.message || 'Invalid regular expression.', matches: [], highlighted: text, replaced: '' };
    }
  }, [pattern, text, activeFlags, replaceText]);

  const updateFlag = (flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const copyText = async (value, label) => {
    if (!value) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setNotification(`${label} copied.`);
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  return (
    <ToolboxLayout
      title="Regex Tester - Test Regular Expressions Online"
      description="Test regular expressions online. Match text, highlight regex results, inspect groups, test flags, replace text, copy output and learn regex examples with this browser-based regex tester."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based text tool</p>
          <h1 style={heroTitle}>Regex Tester</h1>
          <p style={heroText}>
            Test regular expressions against text, view matches, inspect capture groups, try regex flags, preview replace
            output, and debug patterns for development, data cleaning, validation, logs, and automation.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <h2 style={panelTitle}>Regular expression</h2>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Pattern</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                style={inputStyle}
                spellCheck={false}
              />
            </label>

            <div style={flagGrid}>
              {[
                ['g', 'Global'],
                ['i', 'Ignore case'],
                ['m', 'Multiline'],
                ['s', 'Dot all'],
                ['u', 'Unicode']
              ].map(([flag, label]) => (
                <label key={flag} style={checkLabel}>
                  <input type="checkbox" checked={flags[flag]} onChange={() => updateFlag(flag)} />
                  {flag} — {label}
                </label>
              ))}
            </div>

            <div style={sampleRow}>
              <button onClick={() => setPattern('\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b')} style={sampleBtn}>Email regex</button>
              <button onClick={() => setPattern('https?:\\/\\/[^\\s]+')} style={sampleBtn}>URL regex</button>
              <button onClick={() => setPattern('\\bINV-\\d+\\b')} style={sampleBtn}>Invoice ID</button>
              <button onClick={() => setPattern('\\b\\d+(?:\\.\\d+)?\\b')} style={sampleBtn}>Numbers</button>
            </div>

            <label style={fieldWrap}>
              <span style={fieldLabel}>Test text</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text to test..."
                style={textarea}
                spellCheck={false}
              />
            </label>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Match results</h2>
              <span style={result.ok ? validBadge : errorBadge}>{result.ok ? `${result.matches.length} matches` : 'Error'}</span>
            </div>

            {result.ok ? (
              <>
                <div style={highlightBox} dangerouslySetInnerHTML={{ __html: result.highlighted }} />
                <div style={buttonRow}>
                  <button onClick={() => copyText(result.matches.map(m => m.match).join('\n'), 'Matches')} style={primaryBtn}>Copy matches</button>
                </div>
              </>
            ) : (
              <div style={errorBox}>
                <strong>Regex error</strong>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <h2 style={panelTitle}>Matches and groups</h2>
            {result.ok && result.matches.length ? (
              <div style={matchList}>
                {result.matches.map((item, index) => (
                  <div key={`${item.index}-${index}`} style={matchCard}>
                    <strong>Match {index + 1}</strong>
                    <p><strong>Text:</strong> {item.match}</p>
                    <p><strong>Index:</strong> {item.index}</p>
                    {item.groups.length > 0 && (
                      <p><strong>Groups:</strong> {item.groups.map((g, i) => `Group ${i + 1}: ${g || ''}`).join(' | ')}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyText}>{result.ok ? 'No matches found.' : 'Fix the regex error to view matches.'}</p>
            )}
          </div>

          <div style={panel}>
            <h2 style={panelTitle}>Replace preview</h2>
            <label style={fieldWrap}>
              <span style={fieldLabel}>Replacement text</span>
              <input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} style={inputStyle} />
            </label>
            <pre style={outputBox}>{result.ok ? result.replaced : 'Replace preview will appear here.'}</pre>
            <div style={buttonRow}>
              <button onClick={() => copyText(result.replaced, 'Replace output')} style={primaryBtn}>Copy replaced text</button>
            </div>
          </div>
        </section>

        <section style={statsGrid}>
          <div style={statCard}><strong>{activeFlags || 'none'}</strong><span>Flags</span></div>
          <div style={statCard}><strong>{result.matches.length}</strong><span>Matches</span></div>
          <div style={statCard}><strong>{text.length}</strong><span>Text characters</span></div>
          <div style={statCard}><strong>{pattern.length}</strong><span>Pattern length</span></div>
        </section>

        <section style={contentSection}>
          <h2>Test regular expressions online</h2>
          <p>
            Regular expressions, often called regex, are patterns used to search, match, validate, extract, and replace
            text. Regex is commonly used in JavaScript, Python, SQL tools, spreadsheets, text editors, log analysis,
            form validation, data cleaning, API processing, automation scripts, and backend development.
          </p>
          <p>
            This regex tester helps you enter a pattern, test it against sample text, highlight matches, inspect capture
            groups, try common flags, preview replacement output, and copy the matching values. It is useful when you are
            building validation rules, extracting IDs from logs, finding emails or URLs, cleaning imported data, or
            preparing search-and-replace patterns.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Regex match tester</h3><p>Test whether your regular expression matches the expected parts of your text.</p></div>
            <div style={seoCard}><h3>Capture group viewer</h3><p>Inspect capture groups and understand what each group returns.</p></div>
            <div style={seoCard}><h3>Regex replace preview</h3><p>Preview how text will look after replacing matches with your replacement value.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The regex test is designed to run in your browser without account creation.</p></div>
          </div>

          <h2>Common regex flags</h2>
          <ul style={listStyle}>
            <li><strong>g:</strong> Global search. Finds all matches instead of only the first match.</li>
            <li><strong>i:</strong> Ignore case. Matches uppercase and lowercase letters without case sensitivity.</li>
            <li><strong>m:</strong> Multiline mode. Changes how ^ and $ behave across multiple lines.</li>
            <li><strong>s:</strong> Dot all mode. Allows . to match newline characters.</li>
            <li><strong>u:</strong> Unicode mode. Improves handling of Unicode characters.</li>
          </ul>

          <h2>Useful regex examples</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Email</h3><p>Use an email pattern to find addresses in text, logs, forms, or imported lists.</p></div>
            <div style={seoCard}><h3>URL</h3><p>Find links beginning with http or https in text content.</p></div>
            <div style={seoCard}><h3>Numbers</h3><p>Extract quantities, prices, IDs, phone parts, or numeric values from messy text.</p></div>
            <div style={seoCard}><h3>Invoice IDs</h3><p>Match business references such as INV-1001, PO-2026, or custom document numbers.</p></div>
          </div>

          <h2>When to use a regex tester</h2>
          <ul style={listStyle}>
            <li>Before adding validation rules to a form.</li>
            <li>Before using find-and-replace on important text or code.</li>
            <li>When extracting emails, URLs, IDs, prices, or codes from large text.</li>
            <li>When debugging automation scripts, Apps Script, JavaScript, Python, or SQL cleanup logic.</li>
            <li>When learning how capture groups and flags change the result.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this regex tester free?</h3><p>Yes. You can test regex patterns for free without creating an account.</p></div>
            <div style={seoCard}><h3>Does it support JavaScript regex?</h3><p>Yes. The tester uses JavaScript regular expression syntax.</p></div>
            <div style={seoCard}><h3>Can I test replacement output?</h3><p>Yes. Enter replacement text and preview the replaced result.</p></div>
            <div style={seoCard}><h3>Is my text uploaded?</h3><p>The tool is designed to process text in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/regextester" />
      </div>
    </ToolboxLayout>
  );
}

function buildHighlightedText(text, matches) {
  if (!matches.length) return escapeHtml(text);

  let result = '';
  let lastIndex = 0;

  matches.forEach(match => {
    result += escapeHtml(text.slice(lastIndex, match.index));
    result += `<mark style="background:#38bdf8;color:#0f172a;padding:2px 4px;border-radius:4px;">${escapeHtml(match.match)}</mark>`;
    lastIndex = match.index + match.match.length;
  });

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const pageWrap = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const appGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' };
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px', marginBottom: '24px' };
const panelHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '13px', fontFamily: 'monospace', boxSizing: 'border-box', width: '100%' };
const textarea = { width: '100%', minHeight: '300px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const outputBox = { minHeight: '260px', maxHeight: '520px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box', marginTop: '14px' };
const highlightBox = { minHeight: '300px', maxHeight: '520px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' };
const errorBox = { minHeight: '220px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px', overflowWrap: 'anywhere' };
const flagGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '18px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', gap: '8px', alignItems: 'center' };
const sampleRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const matchList = { display: 'grid', gap: '12px', marginTop: '18px' };
const matchCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', color: '#cbd5e1', overflowWrap: 'anywhere' };
const emptyText = { color: '#94a3b8' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' };
const statCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

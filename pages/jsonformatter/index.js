import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleJson = `{
  "store": "SHB ToolBox",
  "tool": "JSON Formatter",
  "features": ["format", "validate", "minify", "copy"],
  "active": true
}`;

export default function JSONFormatter() {
  const [input, setInput] = useState(sampleJson);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [notification, setNotification] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) {
      return { valid: false, output: '', error: 'Paste JSON data to format or validate.' };
    }

    try {
      const parsed = JSON.parse(input);
      const normalized = sortKeys ? sortObjectKeys(parsed) : parsed;
      return {
        valid: true,
        output: JSON.stringify(normalized, null, Number(indent)),
        minified: JSON.stringify(normalized),
        error: ''
      };
    } catch (error) {
      return { valid: false, output: '', minified: '', error: error.message };
    }
  }, [input, indent, sortKeys]);

  const copyText = async (text, label) => {
    if (!text) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setNotification(`${label} copied.`);
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const downloadJson = () => {
    if (!result.valid) {
      setNotification('Fix JSON errors before downloading.');
      return;
    }

    const blob = new Blob([result.output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('Formatted JSON downloaded.');
  };

  return (
    <ToolboxLayout
      title="JSON Formatter and Validator - Format, Validate and Minify JSON"
      description="Format, validate, minify, sort and copy JSON online. Paste JSON data, find errors, beautify output, download formatted JSON and work privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based developer tool</p>
          <h1 style={heroTitle}>JSON Formatter & Validator</h1>
          <p style={heroText}>
            Paste JSON data, validate syntax, format readable output, minify for production, sort keys,
            copy results, and download a clean JSON file.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Input JSON</h2>
              <button onClick={() => setInput('')} style={smallBtn}>Clear</button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              style={textarea}
              spellCheck={false}
            />

            <div style={controls}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Indent spaces</span>
                <select value={indent} onChange={(e) => setIndent(e.target.value)} style={inputStyle}>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              </label>

              <label style={checkLabel}>
                <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
                Sort object keys
              </label>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Formatted output</h2>
              <span style={result.valid ? validBadge : errorBadge}>{result.valid ? 'Valid JSON' : 'Invalid JSON'}</span>
            </div>

            {result.valid ? (
              <pre style={outputBox}>{result.output}</pre>
            ) : (
              <div style={errorBox}>
                <strong>JSON error</strong>
                <p>{result.error}</p>
              </div>
            )}

            <div style={buttonRow}>
              <button onClick={() => copyText(result.output, 'Formatted JSON')} style={primaryBtn}>Copy formatted</button>
              <button onClick={() => copyText(result.minified, 'Minified JSON')} style={secondaryBtn}>Copy minified</button>
              <button onClick={downloadJson} style={secondaryBtn}>Download JSON</button>
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Format and validate JSON online</h2>
          <p>
            JSON is commonly used in APIs, web apps, automation tools, Shopify data, configuration files, analytics,
            database exports, and no-code workflows. Raw JSON can be hard to read when it is minified or copied from
            an API response. A formatter makes the structure easier to understand.
          </p>
          <p>
            This tool helps you check whether JSON syntax is valid, format nested objects and arrays, minify JSON for
            compact use, sort object keys, and copy or download the final result.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Validate JSON</h3><p>Find syntax errors such as missing commas, brackets, quotes, or invalid values.</p></div>
            <div style={seoCard}><h3>Beautify JSON</h3><p>Format minified JSON into readable indentation with 2 or 4 spaces.</p></div>
            <div style={seoCard}><h3>Minify JSON</h3><p>Copy compact JSON for APIs, scripts, configs, and storage.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>JSON formatting runs in your browser without requiring account creation.</p></div>
          </div>

          <h2>Common JSON errors</h2>
          <ul style={listStyle}>
            <li>Missing comma between properties or array items.</li>
            <li>Using single quotes instead of double quotes.</li>
            <li>Trailing comma after the last item.</li>
            <li>Unclosed brackets, braces, or quotation marks.</li>
            <li>Invalid values such as undefined or comments inside JSON.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this JSON formatter free?</h3><p>Yes. You can format, validate, minify, copy, and download JSON for free.</p></div>
            <div style={seoCard}><h3>Can I sort JSON keys?</h3><p>Yes. Enable the sort keys option to alphabetically sort object keys.</p></div>
            <div style={seoCard}><h3>Can I minify JSON?</h3><p>Yes. Use the copy minified button after your JSON is valid.</p></div>
            <div style={seoCard}><h3>Is JSON uploaded?</h3><p>The formatter is designed to process JSON in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/jsonformatter" />
      </div>
    </ToolboxLayout>
  );
}

function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = sortObjectKeys(value[key]);
      return acc;
    }, {});
  }
  return value;
}

const pageWrap = { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 90px' };
const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, fontSize: '0.78rem' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', margin: '10px 0 16px' };
const heroText = { color: '#cbd5e1', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.08rem' };
const appGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' };
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px' };
const panelHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const panelTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const textarea = { width: '100%', minHeight: '420px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace' };
const outputBox = { minHeight: '420px', maxHeight: '560px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' };
const errorBox = { minHeight: '420px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px' };
const controls = { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginTop: '18px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '12px' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const smallBtn = { ...secondaryBtn, padding: '9px 12px', fontSize: '0.78rem' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleUrl = 'https://www.shbstores.com/search?q=csv to excel converter&source=tools';

export default function URLEncoderDecoder() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState(sampleUrl);
  const [componentMode, setComponentMode] = useState(true);
  const [notification, setNotification] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) {
      return { ok: false, output: '', error: 'Enter a URL or text value first.' };
    }

    try {
      if (mode === 'encode') {
        return {
          ok: true,
          output: componentMode ? encodeURIComponent(input) : encodeURI(input),
          error: ''
        };
      }

      return {
        ok: true,
        output: componentMode ? decodeURIComponent(input) : decodeURI(input),
        error: ''
      };
    } catch (error) {
      return {
        ok: false,
        output: '',
        error: 'Invalid encoded URL text. Check incomplete percent encoding such as % or %2.'
      };
    }
  }, [input, mode, componentMode]);

  const copyOutput = async () => {
    if (!result.output) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
      setNotification('Output copied.');
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const swapInputOutput = () => {
    if (!result.output) return;
    setInput(result.output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <ToolboxLayout
      title="URL Encoder and Decoder - Encode and Decode URLs Online"
      description="Encode URLs, decode URL encoded text, convert special characters, copy output and learn when to use encodeURI or encodeURIComponent with this free browser-based URL tool."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based URL tool</p>
          <h1 style={heroTitle}>URL Encoder & Decoder</h1>
          <p style={heroText}>
            Encode URLs for safe sharing, decode percent-encoded text, convert special characters, and prepare query
            parameters for links, APIs, forms, redirects, and web development.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={tabs}>
              <button onClick={() => setMode('encode')} style={mode === 'encode' ? activeTab : tab}>Encode</button>
              <button onClick={() => setMode('decode')} style={mode === 'decode' ? activeTab : tab}>Decode</button>
            </div>

            <div style={sampleRow}>
              <button onClick={() => { setMode('encode'); setInput(sampleUrl); }} style={sampleBtn}>URL sample</button>
              <button onClick={() => { setMode('decode'); setInput('csv%20to%20excel%20converter'); }} style={sampleBtn}>Encoded text sample</button>
              <button onClick={() => { setMode('encode'); setInput('name=SHB ToolBox&category=free tools'); }} style={sampleBtn}>Query sample</button>
            </div>

            <label style={fieldWrap}>
              <span style={fieldLabel}>{mode === 'encode' ? 'URL or text to encode' : 'Encoded URL text to decode'}</span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter URL or query text...' : 'Paste encoded URL text...'}
                style={textarea}
                spellCheck={false}
              />
            </label>

            <div style={controls}>
              <label style={checkLabel}>
                <input type="checkbox" checked={componentMode} onChange={(e) => setComponentMode(e.target.checked)} />
                Encode/decode as URL component
              </label>

              <button onClick={() => setInput('')} style={secondaryBtn}>Clear</button>
              <button onClick={swapInputOutput} style={secondaryBtn}>Swap mode</button>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Output</h2>
              <span style={result.ok ? validBadge : errorBadge}>{result.ok ? 'Ready' : 'Error'}</span>
            </div>

            {result.ok ? (
              <pre style={outputBox}>{result.output}</pre>
            ) : (
              <div style={errorBox}>
                <strong>URL conversion error</strong>
                <p>{result.error}</p>
              </div>
            )}

            <div style={buttonRow}>
              <button onClick={copyOutput} style={primaryBtn}>Copy output</button>
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Encode and decode URLs online</h2>
          <p>
            URLs often contain spaces, symbols, special characters, query parameters, and non-English text. URL encoding
            converts those characters into a safe percent-encoded format so the URL can be used correctly in browsers,
            APIs, redirects, forms, tracking links, and web applications.
          </p>
          <p>
            This tool helps you encode normal text or URL parts, decode encoded text back into readable form, and choose
            between full URL encoding and URL component encoding depending on your use case.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>URL encode</h3><p>Convert spaces, symbols, and special characters into safe encoded text.</p></div>
            <div style={seoCard}><h3>URL decode</h3><p>Convert percent-encoded values such as %20 back into readable text.</p></div>
            <div style={seoCard}><h3>Query parameters</h3><p>Prepare search terms, filter values, form fields, and API parameters for URLs.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>Encoding and decoding are designed to run in your browser without account creation.</p></div>
          </div>

          <h2>What is URL encoding?</h2>
          <p>
            URL encoding, also called percent encoding, replaces unsafe or reserved characters with a percent sign and
            hexadecimal code. For example, a space is commonly encoded as %20. This helps browsers and servers understand
            where a URL path ends, where query parameters begin, and which characters are part of the actual value.
          </p>

          <h2>encodeURI vs encodeURIComponent</h2>
          <p>
            Full URL encoding keeps important URL characters such as :, /, ?, &, and = usable in a full link.
            Component encoding is stricter and is usually better for query parameter values, search terms, form values,
            and individual URL parts. When you are encoding a full URL, use full URL mode. When you are encoding a single
            value to place inside a URL, use URL component mode.
          </p>

          <h2>Examples</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Space</h3><p>hello world becomes hello%20world.</p></div>
            <div style={seoCard}><h3>Query value</h3><p>csv to excel becomes csv%20to%20excel.</p></div>
            <div style={seoCard}><h3>Symbols</h3><p>Special characters such as &, ?, =, /, and # may need encoding depending on context.</p></div>
            <div style={seoCard}><h3>International text</h3><p>UTF-8 characters can be encoded for safer use in URLs and APIs.</p></div>
          </div>

          <h2>Common URL encoding problems</h2>
          <ul style={listStyle}>
            <li>Using full URL encoding when a query parameter value needs component encoding.</li>
            <li>Forgetting to encode spaces in search terms or form values.</li>
            <li>Double-encoding values that are already encoded.</li>
            <li>Decoding broken values with incomplete percent codes.</li>
            <li>Mixing URL-safe text with normal readable text in API requests.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this URL encoder free?</h3><p>Yes. You can encode and decode URLs for free without creating an account.</p></div>
            <div style={seoCard}><h3>What does %20 mean?</h3><p>%20 is a common URL-encoded form of a space character.</p></div>
            <div style={seoCard}><h3>Should I encode a full URL or only part of it?</h3><p>Encode a full URL only when needed. For query values, URL component encoding is usually safer.</p></div>
            <div style={seoCard}><h3>Is my URL uploaded?</h3><p>The tool is designed to process URL text in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/urlencoder" />
      </div>
    </ToolboxLayout>
  );
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
const tabs = { display: 'flex', gap: '10px', marginBottom: '18px' };
const tab = { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' };
const activeTab = { ...tab, background: '#38bdf8', color: '#0f172a' };
const sampleRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const textarea = { width: '100%', minHeight: '360px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const outputBox = { minHeight: '360px', maxHeight: '520px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box' };
const errorBox = { minHeight: '360px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px', overflowWrap: 'anywhere' };
const controls = { display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginTop: '18px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', gap: '8px', alignItems: 'center' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

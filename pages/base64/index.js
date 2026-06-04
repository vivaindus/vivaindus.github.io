import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleText = 'SHB ToolBox - Free browser-based tools';

export default function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState(sampleText);
  const [urlSafe, setUrlSafe] = useState(false);
  const [notification, setNotification] = useState('');

  const result = useMemo(() => {
    if (!input) {
      return { ok: false, output: '', error: 'Enter text or Base64 data first.' };
    }

    try {
      if (mode === 'encode') {
        let encoded = encodeBase64(input);
        if (urlSafe) encoded = toUrlSafeBase64(encoded);
        return { ok: true, output: encoded, error: '' };
      }

      let cleanInput = input.trim();
      if (urlSafe) cleanInput = fromUrlSafeBase64(cleanInput);
      return { ok: true, output: decodeBase64(cleanInput), error: '' };
    } catch (error) {
      return {
        ok: false,
        output: '',
        error: mode === 'decode'
          ? 'Invalid Base64 input. Check missing characters, wrong padding, or non-Base64 text.'
          : error.message
      };
    }
  }, [input, mode, urlSafe]);

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

  const clearAll = () => {
    setInput('');
    setNotification('Cleared.');
  };

  return (
    <ToolboxLayout
      title="Base64 Encoder and Decoder - Encode and Decode Base64 Online"
      description="Encode text to Base64 and decode Base64 to readable text online. Supports UTF-8 text, URL-safe Base64, copy output, private browser-based conversion and helpful Base64 guide."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based encoding tool</p>
          <h1 style={heroTitle}>Base64 Encoder & Decoder</h1>
          <p style={heroText}>
            Encode normal text into Base64 or decode Base64 back into readable UTF-8 text. Use it for quick
            data conversion, testing, development, API work, configuration values, and safe text transfer.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={tabs}>
              <button onClick={() => setMode('encode')} style={mode === 'encode' ? activeTab : tab}>Encode</button>
              <button onClick={() => setMode('decode')} style={mode === 'decode' ? activeTab : tab}>Decode</button>
            </div>

            <div style={sampleRow}>
              <button onClick={() => { setMode('encode'); setInput(sampleText); }} style={sampleBtn}>Text sample</button>
              <button onClick={() => { setMode('decode'); setInput('U0hCIFRvb2xCb3ggLSBGcmVlIGJyb3dzZXItYmFzZWQgdG9vbHM='); }} style={sampleBtn}>Base64 sample</button>
              <button onClick={() => { setMode('encode'); setInput('{"name":"SHB ToolBox","type":"utility"}'); }} style={sampleBtn}>JSON sample</button>
            </div>

            <label style={fieldWrap}>
              <span style={fieldLabel}>{mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}</span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'}
                style={textarea}
                spellCheck={false}
              />
            </label>

            <div style={controls}>
              <label style={checkLabel}>
                <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
                URL-safe Base64
              </label>

              <button onClick={clearAll} style={secondaryBtn}>Clear</button>
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
                <strong>Conversion error</strong>
                <p>{result.error}</p>
              </div>
            )}

            <div style={buttonRow}>
              <button onClick={copyOutput} style={primaryBtn}>Copy output</button>
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Encode and decode Base64 online</h2>
          <p>
            Base64 is a common encoding method used to represent binary or text data using readable characters. It is
            often used in APIs, web development, email systems, configuration files, authentication workflows, data URLs,
            JSON payloads, and testing tools. This Base64 encoder and decoder helps you quickly convert between plain
            UTF-8 text and Base64 text directly in your browser.
          </p>
          <p>
            You can use this tool to encode normal text into Base64, decode Base64 back to readable text, create URL-safe
            Base64 strings, check whether a Base64 value is valid, and copy the result for development or documentation.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Text to Base64</h3><p>Convert readable text, JSON, configuration values, notes, or short data strings into Base64.</p></div>
            <div style={seoCard}><h3>Base64 to text</h3><p>Decode Base64 strings back into readable UTF-8 text when the input is valid.</p></div>
            <div style={seoCard}><h3>URL-safe Base64</h3><p>Use URL-safe conversion where + and / are replaced for safer use in URLs and tokens.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The conversion is designed to run in your browser without account creation.</p></div>
          </div>

          <h2>What is Base64 used for?</h2>
          <p>
            Base64 is useful when data needs to be transferred through systems that expect text. Developers often see
            Base64 in API responses, encoded credentials, email attachments, image data URLs, JWT parts, XML or JSON
            payloads, and application configuration values. Base64 does not encrypt data; it only encodes it into a
            different readable format.
          </p>

          <h2>Base64 is not encryption</h2>
          <p>
            A common mistake is thinking Base64 is secure encryption. It is not. Anyone can decode Base64 text back into
            the original value if they have the string. Do not use Base64 alone to protect passwords, secret keys, payment
            details, personal data, or confidential business information.
          </p>

          <h2>How to encode text to Base64</h2>
          <ol style={listStyle}>
            <li>Select Encode mode.</li>
            <li>Enter or paste the text you want to encode.</li>
            <li>Enable URL-safe Base64 if you need a URL-friendly output.</li>
            <li>Copy the encoded Base64 result.</li>
          </ol>

          <h2>How to decode Base64 to text</h2>
          <ol style={listStyle}>
            <li>Select Decode mode.</li>
            <li>Paste a valid Base64 string.</li>
            <li>Use URL-safe mode if the Base64 contains URL-safe characters.</li>
            <li>Copy the decoded readable text.</li>
          </ol>

          <h2>Common Base64 problems</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Invalid characters</h3><p>Base64 normally uses letters, numbers, +, /, and = padding. URL-safe Base64 may use - and _.</p></div>
            <div style={seoCard}><h3>Missing padding</h3><p>Some Base64 strings omit = padding. The decoder tries to normalize padding where possible.</p></div>
            <div style={seoCard}><h3>Not encrypted</h3><p>Base64 output can be decoded easily, so it should not be treated as a security layer.</p></div>
            <div style={seoCard}><h3>Wrong mode</h3><p>If decoding fails, check whether your input is regular Base64 or URL-safe Base64.</p></div>
          </div>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this Base64 encoder free?</h3><p>Yes. You can encode and decode Base64 text for free without creating an account.</p></div>
            <div style={seoCard}><h3>Can I decode URL-safe Base64?</h3><p>Yes. Enable URL-safe Base64 mode before decoding URL-safe strings.</p></div>
            <div style={seoCard}><h3>Is Base64 secure?</h3><p>No. Base64 is encoding, not encryption. Do not use it as a way to hide sensitive information.</p></div>
            <div style={seoCard}><h3>Is my text uploaded?</h3><p>The tool is designed to process text in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/base64" />
      </div>
    </ToolboxLayout>
  );
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const normalized = normalizeBase64(value);
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function normalizeBase64(value) {
  const clean = String(value || '').replace(/\s+/g, '');
  const padding = clean.length % 4;
  return padding ? clean + '='.repeat(4 - padding) : clean;
}

function toUrlSafeBase64(value) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromUrlSafeBase64(value) {
  return String(value || '').replace(/-/g, '+').replace(/_/g, '/');
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

import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleXml = `<store><name>SHB ToolBox</name><tools><tool>XML Formatter</tool><tool>JSON Formatter</tool></tools><active>true</active></store>`;

export default function XMLFormatter() {
  const [input, setInput] = useState(sampleXml);
  const [notification, setNotification] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) {
      return { ok: false, output: '', minified: '', error: 'Paste XML data to format or validate.' };
    }

    const validation = validateXml(input);
    if (!validation.ok) {
      return { ok: false, output: '', minified: '', error: validation.error };
    }

    const formatted = formatXml(input);
    return {
      ok: true,
      output: formatted,
      minified: minifyXml(input),
      error: ''
    };
  }, [input]);

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

  const downloadXml = () => {
    if (!result.output) {
      setNotification('Nothing to download.');
      return;
    }

    const blob = new Blob([result.output], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.xml';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('Formatted XML downloaded.');
  };

  return (
    <ToolboxLayout
      title="XML Formatter and Validator - Format XML Online"
      description="Format, validate, beautify, minify, copy and download XML online. Paste XML data, check errors, improve readability and work privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based developer tool</p>
          <h1 style={heroTitle}>XML Formatter & Validator</h1>
          <p style={heroText}>
            Paste XML data, validate structure, format readable output, minify compact XML, copy results,
            and download a clean XML file.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Input XML</h2>
              <button onClick={() => setInput('')} style={smallBtn}>Clear</button>
            </div>

            <div style={sampleRow}>
              <button onClick={() => setInput(sampleXml)} style={sampleBtn}>XML sample</button>
              <button onClick={() => setInput('<invoice><number>INV-1001</number><amount currency="AED">250</amount></invoice>')} style={sampleBtn}>Invoice sample</button>
              <button onClick={() => setInput('<items><item id="1">Apple</item><item id="2">Orange</item></items>')} style={sampleBtn}>Items sample</button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste XML here..."
              style={textarea}
              spellCheck={false}
            />
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Formatted output</h2>
              <span style={result.ok ? validBadge : errorBadge}>{result.ok ? 'Valid XML' : 'Invalid XML'}</span>
            </div>

            {result.ok ? (
              <pre style={outputBox}>{result.output}</pre>
            ) : (
              <div style={errorBox}>
                <strong>XML error</strong>
                <p>{result.error}</p>
              </div>
            )}

            <div style={buttonRow}>
              <button onClick={() => copyText(result.output, 'Formatted XML')} style={primaryBtn}>Copy formatted</button>
              <button onClick={() => copyText(result.minified, 'Minified XML')} style={secondaryBtn}>Copy minified</button>
              <button onClick={downloadXml} style={secondaryBtn}>Download XML</button>
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Format and validate XML online</h2>
          <p>
            XML is used in reports, configuration files, APIs, ERP exports, invoices, sitemaps, document systems,
            data exchange files, and legacy business applications. Minified or messy XML can be difficult to read,
            edit, debug, or share.
          </p>
          <p>
            This XML formatter helps you beautify XML with indentation, check whether the XML is valid, minify XML for
            compact use, copy the output, and download the result.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Validate XML</h3><p>Check whether your XML has valid opening tags, closing tags, nesting, and structure.</p></div>
            <div style={seoCard}><h3>Beautify XML</h3><p>Convert messy XML into readable indented output.</p></div>
            <div style={seoCard}><h3>Minify XML</h3><p>Remove extra spaces and line breaks for compact XML storage or transfer.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>XML formatting is designed to run in your browser without account creation.</p></div>
          </div>

          <h2>Common XML errors</h2>
          <ul style={listStyle}>
            <li>Missing closing tags.</li>
            <li>Incorrectly nested tags.</li>
            <li>Unescaped special characters such as &amp;.</li>
            <li>Attribute values without quotes.</li>
            <li>Multiple root elements in one XML document.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this XML formatter free?</h3><p>Yes. You can format, validate, copy, minify, and download XML for free.</p></div>
            <div style={seoCard}><h3>Can it fix broken XML?</h3><p>It shows validation errors and formats valid XML. You should correct invalid XML before using it.</p></div>
            <div style={seoCard}><h3>Can I minify XML?</h3><p>Yes. Use the copy minified button after the XML is valid.</p></div>
            <div style={seoCard}><h3>Is XML uploaded?</h3><p>The tool is designed to process XML in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/xmlformatter" />
      </div>
    </ToolboxLayout>
  );
}

function validateXml(xml) {
  if (typeof DOMParser === 'undefined') {
    return { ok: true, error: '' };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const error = doc.querySelector('parsererror');

    if (error) {
      return { ok: false, error: error.textContent || 'Invalid XML structure.' };
    }

    return { ok: true, error: '' };
  } catch (err) {
    return { ok: false, error: err.message || 'Invalid XML.' };
  }
}

function formatXml(xml) {
  const cleaned = String(xml || '').replace(/>\s+</g, '><').trim();
  const tokens = cleaned.replace(/(>)(<)(\/*)/g, '$1\n$2$3').split('\n');

  let indent = 0;
  const lines = tokens.map((line) => {
    const trimmed = line.trim();

    if (/^<\/.+>/.test(trimmed)) {
      indent = Math.max(indent - 1, 0);
    }

    const output = `${'  '.repeat(indent)}${trimmed}`;

    if (
      /^<[^!?/][^>]*[^/]?>$/.test(trimmed) &&
      !trimmed.includes('</') &&
      !trimmed.endsWith('/>')
    ) {
      indent++;
    }

    return output;
  });

  return lines.join('\n');
}

function minifyXml(xml) {
  return String(xml || '').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
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
const sampleRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const textarea = { width: '100%', minHeight: '420px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const outputBox = { minHeight: '420px', maxHeight: '560px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box' };
const errorBox = { minHeight: '420px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px', overflowWrap: 'anywhere' };
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

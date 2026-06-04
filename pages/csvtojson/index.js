import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleCsv = `name,category,price
CSV to JSON,Developer Tool,0
Excel Formula Explainer,Spreadsheet Tool,0
XML Formatter,Developer Tool,0`;

const DELIMITERS = {
  auto: 'Auto detect',
  ',': 'Comma (,)',
  ';': 'Semicolon (;)',
  '\\t': 'Tab',
  '|': 'Pipe (|)'
};

export default function CSVToJSON() {
  const [mode, setMode] = useState('paste');
  const [csvText, setCsvText] = useState(sampleCsv);
  const [delimiter, setDelimiter] = useState('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [trimValues, setTrimValues] = useState(true);
  const [outputMode, setOutputMode] = useState('objects');
  const [fileName, setFileName] = useState('converted-data');
  const [notification, setNotification] = useState('');

  const detectedDelimiter = useMemo(() => {
    if (!csvText.trim()) return ',';
    return delimiter === 'auto' ? detectDelimiter(csvText) : delimiter.replace('\\t', '\t');
  }, [csvText, delimiter]);

  const parsed = useMemo(() => {
    if (!csvText.trim()) {
      return { rows: [], json: '', error: 'Paste or upload CSV data first.' };
    }

    try {
      const rows = parseCSV(csvText, detectedDelimiter, trimValues)
        .filter(row => row.some(cell => String(cell).trim() !== ''));

      const jsonData = convertRows(rows, hasHeader, outputMode);
      const json = JSON.stringify(jsonData, null, prettyPrint ? 2 : 0);

      return { rows, json, error: '' };
    } catch (error) {
      return { rows: [], json: '', error: error.message || 'Unable to parse CSV.' };
    }
  }, [csvText, detectedDelimiter, hasHeader, outputMode, prettyPrint, trimValues]);

  const previewRows = parsed.rows.slice(0, 12);
  const columnCount = parsed.rows.reduce((max, row) => Math.max(max, row.length), 0);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setNotification('Please choose a CSV file.');
      return;
    }

    const text = await file.text();
    setCsvText(text);
    setFileName(file.name.replace(/\.csv$/i, '') || 'converted-data');
    setMode('upload');
    setNotification('CSV file loaded.');
  };

  const copyOutput = async () => {
    if (!parsed.json) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(parsed.json);
      setNotification('JSON copied.');
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const downloadJson = () => {
    if (!parsed.json) {
      setNotification('Nothing to download.');
      return;
    }

    const blob = new Blob([parsed.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(fileName || 'converted-data')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('JSON file downloaded.');
  };

  return (
    <ToolboxLayout
      title="CSV to JSON Converter - Convert CSV Data to JSON Online"
      description="Convert CSV to JSON online. Upload or paste CSV, auto-detect delimiters, use headers as keys, preview rows, copy JSON, download JSON and convert privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based data converter</p>
          <h1 style={heroTitle}>CSV to JSON Converter</h1>
          <p style={heroText}>
            Convert CSV files or pasted CSV text into clean JSON. Use headers as object keys, choose delimiters,
            preview rows, copy formatted JSON, and download a ready-to-use JSON file.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={tabs}>
              <button onClick={() => setMode('paste')} style={mode === 'paste' ? activeTab : tab}>Paste CSV</button>
              <button onClick={() => setMode('upload')} style={mode === 'upload' ? activeTab : tab}>Upload CSV</button>
            </div>

            {mode === 'upload' ? (
              <label style={uploadBox}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                <strong>Click to upload CSV</strong>
                <span>Supports comma, semicolon, tab and pipe-delimited CSV files.</span>
              </label>
            ) : (
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV data here..."
                style={textarea}
                spellCheck={false}
              />
            )}

            <div style={optionGrid}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Delimiter</span>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={inputStyle}>
                  {Object.entries(DELIMITERS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Output format</span>
                <select value={outputMode} onChange={(e) => setOutputMode(e.target.value)} style={inputStyle}>
                  <option value="objects">Array of objects</option>
                  <option value="arrays">Array of arrays</option>
                </select>
              </label>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Output file name</span>
                <input value={fileName} onChange={(e) => setFileName(e.target.value)} style={inputStyle} />
              </label>
            </div>

            <div style={checks}>
              <label><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> First row contains headers</label>
              <label><input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} /> Pretty print JSON</label>
              <label><input type="checkbox" checked={trimValues} onChange={(e) => setTrimValues(e.target.checked)} /> Trim extra spaces</label>
            </div>

            <div style={buttonRow}>
              <button onClick={copyOutput} style={primaryBtn}>Copy JSON</button>
              <button onClick={downloadJson} style={secondaryBtn}>Download JSON</button>
              <button onClick={() => setCsvText('')} style={secondaryBtn}>Clear</button>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>JSON output</h2>
              <span style={parsed.error ? errorBadge : validBadge}>{parsed.error ? 'Error' : 'Ready'}</span>
            </div>

            {parsed.error ? (
              <div style={errorBox}>
                <strong>CSV conversion error</strong>
                <p>{parsed.error}</p>
              </div>
            ) : (
              <pre style={outputBox}>{parsed.json}</pre>
            )}
          </div>
        </section>

        <section style={statsGrid}>
          <div style={statCard}><strong>{parsed.rows.length}</strong><span>Rows</span></div>
          <div style={statCard}><strong>{columnCount}</strong><span>Columns</span></div>
          <div style={statCard}><strong>{formatDelimiter(detectedDelimiter)}</strong><span>Delimiter</span></div>
          <div style={statCard}><strong>{outputMode === 'objects' ? 'Objects' : 'Arrays'}</strong><span>JSON type</span></div>
        </section>

        <section style={panel}>
          <h2 style={panelTitle}>CSV preview</h2>
          <div style={tableWrap}>
            {previewRows.length ? (
              <table style={tableStyle}>
                <tbody>
                  {previewRows.map((row, r) => (
                    <tr key={r}>
                      {Array.from({ length: columnCount }).map((_, c) => (
                        <td key={c} style={r === 0 && hasHeader ? thCell : tdCell}>{row[c] || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={emptyText}>Paste or upload CSV data to preview rows.</p>
            )}
          </div>
        </section>

        <section style={contentSection}>
          <h2>Convert CSV to JSON online</h2>
          <p>
            CSV is a simple table format used by spreadsheets, ecommerce exports, databases, analytics platforms,
            inventory systems, accounting tools, CRMs, and ERP software. JSON is a structured data format widely used
            by APIs, web applications, automation tools, JavaScript projects, mobile apps, dashboards, and configuration
            files. This converter helps you quickly transform CSV rows into clean JSON without manually rewriting data.
          </p>
          <p>
            You can paste CSV text or upload a CSV file, auto-detect the delimiter, use the first row as field names,
            generate an array of JSON objects, create an array of arrays, preview the parsed rows, copy the result, and
            download a JSON file for development or data processing.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>CSV to JSON objects</h3><p>Use the first CSV row as headers and convert each row into a JSON object with key-value pairs.</p></div>
            <div style={seoCard}><h3>CSV to JSON arrays</h3><p>Create a simple array-of-arrays format when you need raw tabular data without object keys.</p></div>
            <div style={seoCard}><h3>Delimiter detection</h3><p>Automatically detects comma, semicolon, tab, and pipe-delimited data.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The CSV conversion is designed to run in your browser without requiring account creation.</p></div>
          </div>

          <h2>When should you convert CSV to JSON?</h2>
          <ul style={listStyle}>
            <li>Preparing spreadsheet data for an API or JavaScript application.</li>
            <li>Converting Shopify, WooCommerce, inventory, or product exports into structured data.</li>
            <li>Turning accounting, sales, or report exports into machine-readable JSON.</li>
            <li>Creating sample data for a web app, dashboard, or automation workflow.</li>
            <li>Moving tabular data into tools that accept JSON instead of CSV.</li>
          </ul>

          <h2>Array of objects vs array of arrays</h2>
          <p>
            An array of objects is usually easier to read because each value has a field name. For example, a row with
            name, category, and price becomes an object with those keys. This is the best option for most APIs and web
            apps. An array of arrays is more compact and keeps the table structure closer to the original CSV, but it is
            less descriptive because values are identified by position rather than by key.
          </p>

          <h2>Tips for better CSV to JSON conversion</h2>
          <ul style={listStyle}>
            <li>Keep a clear header row when you want JSON objects.</li>
            <li>Remove duplicate column names or rename them before converting.</li>
            <li>Check the delimiter if the preview shows all data in one column.</li>
            <li>Review dates, numbers, currency values, and IDs after conversion.</li>
            <li>Keep a copy of the original CSV before editing or importing JSON elsewhere.</li>
          </ul>

          <h2>Common CSV to JSON issues</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Duplicate headers</h3><p>Duplicate column names can overwrite values in object output. Rename duplicate headers before importing.</p></div>
            <div style={seoCard}><h3>Wrong delimiter</h3><p>If columns look wrong, try comma, semicolon, tab, or pipe mode manually.</p></div>
            <div style={seoCard}><h3>Quoted commas</h3><p>CSV values with commas should be wrapped in quotes so they stay in one field.</p></div>
            <div style={seoCard}><h3>Data types</h3><p>CSV stores everything as text. Check whether your target system expects numbers, booleans, or dates.</p></div>
          </div>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this CSV to JSON converter free?</h3><p>Yes. You can convert CSV to JSON for free without creating an account.</p></div>
            <div style={seoCard}><h3>Can I upload a CSV file?</h3><p>Yes. You can upload a CSV file or paste CSV text manually.</p></div>
            <div style={seoCard}><h3>Can it convert semicolon CSV?</h3><p>Yes. Use auto-detect or choose semicolon manually from the delimiter menu.</p></div>
            <div style={seoCard}><h3>Is my CSV uploaded?</h3><p>The converter is designed to process CSV data in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/csvtojson" />
      </div>
    </ToolboxLayout>
  );
}

function detectDelimiter(text) {
  const firstLines = text.split(/\r?\n/).slice(0, 5).join('\n');
  const candidates = [',', ';', '\t', '|'];

  return candidates
    .map(d => ({ d, count: (firstLines.match(new RegExp(escapeRegExp(d), 'g')) || []).length }))
    .sort((a, b) => b.count - a.count)[0]?.d || ',';
}

function parseCSV(text, delimiter, trimValues) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(trimValues ? cell.trim() : cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(trimValues ? cell.trim() : cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(trimValues ? cell.trim() : cell);
  rows.push(row);

  return rows;
}

function convertRows(rows, hasHeader, outputMode) {
  if (outputMode === 'arrays' || !hasHeader) {
    return rows;
  }

  const headers = rows[0] || [];
  const body = rows.slice(1);

  return body.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      const key = header || `column_${index + 1}`;
      obj[key] = row[index] ?? '';
    });
    return obj;
  });
}

function sanitizeFileName(name) {
  return String(name || 'converted-data').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'converted-data';
}

function formatDelimiter(value) {
  if (value === '\t') return 'Tab';
  if (value === ',') return 'Comma';
  if (value === ';') return 'Semicolon';
  if (value === '|') return 'Pipe';
  return value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
const uploadBox = { display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', minHeight: '220px', border: '2px dashed #334155', borderRadius: '18px', cursor: 'pointer', color: '#cbd5e1', textAlign: 'center' };
const textarea = { width: '100%', minHeight: '300px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' };
const outputBox = { minHeight: '420px', maxHeight: '620px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box' };
const optionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '13px' };
const checks = { display: 'grid', gap: '10px', marginTop: '20px', color: '#cbd5e1', fontSize: '0.94rem' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBox = { minHeight: '420px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px', overflowWrap: 'anywhere' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' };
const statCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' };
const tableWrap = { overflow: 'auto', maxHeight: '420px', border: '1px solid #334155', borderRadius: '14px', marginTop: '18px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const tdCell = { border: '1px solid #334155', padding: '9px', color: '#cbd5e1', whiteSpace: 'nowrap' };
const thCell = { ...tdCell, color: '#fff', background: '#0f172a', fontWeight: 900 };
const emptyText = { color: '#94a3b8', textAlign: 'center', padding: '60px 20px' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

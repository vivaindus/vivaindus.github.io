import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const DELIMITERS = {
  auto: 'Auto detect',
  ',': 'Comma (,)',
  ';': 'Semicolon (;)',
  '\\t': 'Tab',
  '|': 'Pipe (|)'
};

export default function CSVToExcel() {
  const [mode, setMode] = useState('upload');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('converted-data');
  const [delimiter, setDelimiter] = useState('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [freezeHeader, setFreezeHeader] = useState(true);
  const [addFilter, setAddFilter] = useState(true);
  const [autoWidth, setAutoWidth] = useState(true);
  const [styleHeader, setStyleHeader] = useState(true);
  const [notification, setNotification] = useState('');

  const detectedDelimiter = useMemo(() => {
    if (!csvText.trim()) return ',';
    return delimiter === 'auto' ? detectDelimiter(csvText) : delimiter.replace('\\t', '\t');
  }, [csvText, delimiter]);

  const rows = useMemo(() => {
    if (!csvText.trim()) return [];
    return parseCSV(csvText, detectedDelimiter).filter(row => row.some(cell => String(cell).trim() !== ''));
  }, [csvText, detectedDelimiter]);

  const previewRows = rows.slice(0, 15);
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);

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
    setNotification('CSV file loaded successfully.');
  };

  const downloadExcel = () => {
    if (!rows.length) {
      setNotification('Add or upload CSV data first.');
      return;
    }

    const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const normalizedRows = rows.map(row => {
      const copy = [...row];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });

    const worksheet = XLSX.utils.aoa_to_sheet(normalizedRows);

    if (autoWidth) {
      worksheet['!cols'] = Array.from({ length: maxCols }, (_, colIndex) => {
        const maxLength = normalizedRows.reduce((max, row) => {
          return Math.max(max, String(row[colIndex] || '').length);
        }, 8);
        return { wch: Math.min(Math.max(maxLength + 2, 10), 45) };
      });
    }

    if (hasHeader && addFilter && normalizedRows.length > 1 && maxCols > 0) {
      worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: normalizedRows.length - 1, c: maxCols - 1 }
        })
      };
    }

    if (hasHeader && freezeHeader) {
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    }

    if (hasHeader && styleHeader) {
      for (let c = 0; c < maxCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'D9EAF7' } }
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(fileName || 'CSV Data'));

    XLSX.writeFile(workbook, `${sanitizeFileName(fileName || 'converted-data')}.xlsx`);
    setNotification('Excel file downloaded successfully.');
  };

  const clearAll = () => {
    setCsvText('');
    setFileName('converted-data');
    setNotification('Workspace cleared.');
  };

  return (
    <ToolboxLayout
      title="CSV to Excel Converter - Convert CSV to XLSX Online"
      description="Convert CSV files to Excel XLSX online. Upload or paste CSV, preview rows, detect delimiters, add filters, auto-fit columns, and download a clean Excel workbook."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based spreadsheet tool</p>
          <h1 style={heroTitle}>CSV to Excel Converter</h1>
          <p style={heroText}>
            Convert CSV data into a clean Excel workbook with preview, delimiter detection, header options,
            filters, frozen header row, and auto-fit columns.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={tabs}>
              <button onClick={() => setMode('upload')} style={mode === 'upload' ? activeTab : tab}>Upload CSV</button>
              <button onClick={() => setMode('paste')} style={mode === 'paste' ? activeTab : tab}>Paste CSV</button>
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
                <span>Supports comma, semicolon, tab and pipe-delimited data.</span>
              </label>
            ) : (
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV data here..."
                style={textarea}
              />
            )}

            <div style={optionGrid}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Output file name</span>
                <input value={fileName} onChange={(e) => setFileName(e.target.value)} style={inputStyle} />
              </label>

              <label style={fieldWrap}>
                <span style={fieldLabel}>Delimiter</span>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={inputStyle}>
                  {Object.entries(DELIMITERS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={checks}>
              <label><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> First row is header</label>
              <label><input type="checkbox" checked={addFilter} onChange={(e) => setAddFilter(e.target.checked)} /> Add Excel filter</label>
              <label><input type="checkbox" checked={freezeHeader} onChange={(e) => setFreezeHeader(e.target.checked)} /> Freeze header row</label>
              <label><input type="checkbox" checked={autoWidth} onChange={(e) => setAutoWidth(e.target.checked)} /> Auto-fit columns</label>
              <label><input type="checkbox" checked={styleHeader} onChange={(e) => setStyleHeader(e.target.checked)} /> Style header row</label>
            </div>

            <div style={buttonRow}>
              <button onClick={downloadExcel} style={primaryBtn}>Download XLSX</button>
              <button onClick={clearAll} style={secondaryBtn}>Clear</button>
            </div>
          </div>

          <div style={panel}>
            <h2 style={panelTitle}>Preview</h2>
            <div style={statsGrid}>
              <div style={statCard}><strong>{rows.length}</strong><span>Rows</span></div>
              <div style={statCard}><strong>{columnCount}</strong><span>Columns</span></div>
              <div style={statCard}><strong>{formatDelimiter(detectedDelimiter)}</strong><span>Delimiter</span></div>
            </div>

            <div style={tableWrap}>
              {previewRows.length ? (
                <table style={tableStyle}>
                  <tbody>
                    {previewRows.map((row, r) => (
                      <tr key={r}>
                        {Array.from({ length: columnCount }).map((_, c) => (
                          <td key={c} style={r === 0 && hasHeader ? thCell : tdCell}>
                            {row[c] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={emptyText}>Upload or paste CSV data to preview rows.</p>
              )}
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Convert CSV to Excel XLSX online</h2>
          <p>
            CSV files are useful for exports, reports, inventory lists, bank statements, ecommerce data, analytics,
            and database records. Excel workbooks are easier to read, filter, share, print, and analyze.
          </p>
          <p>
            This converter helps you turn raw CSV data into a cleaner Excel workbook. You can upload a CSV file or paste
            CSV text manually, preview the rows, choose the correct delimiter, and download an XLSX file that opens in
            Microsoft Excel, Google Sheets, LibreOffice, and other spreadsheet tools.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Delimiter detection</h3><p>Automatically detects comma, semicolon, tab, and pipe-separated data.</p></div>
            <div style={seoCard}><h3>Live preview</h3><p>Check rows and columns before downloading the Excel file.</p></div>
            <div style={seoCard}><h3>Excel-friendly output</h3><p>Add filters, freeze the header row, style headers, and auto-fit columns.</p></div>
            <div style={seoCard}><h3>Private conversion</h3><p>The CSV is processed in your browser without requiring account creation.</p></div>
          </div>

          <h2>Why convert CSV to Excel?</h2>
          <p>
            CSV is a plain-text format, which makes it lightweight and compatible with many systems. But plain CSV files
            do not store formatting, filters, frozen rows, column widths, workbook sheets, colors, or formulas. Excel files
            are more convenient when you need to review data, share reports with a team, print tables, or prepare records
            for accounting, inventory, HR, ecommerce, or office work.
          </p>

          <h2>Common CSV problems this tool helps with</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Wrong columns</h3><p>If a CSV opens in one column, the delimiter is usually wrong. Try comma, semicolon, tab, or pipe.</p></div>
            <div style={seoCard}><h3>Messy exports</h3><p>System exports from ERP, POS, Shopify, analytics, or bank portals often need cleaner Excel formatting.</p></div>
            <div style={seoCard}><h3>Large tables</h3><p>Filters and frozen headers make long CSV files easier to review after conversion.</p></div>
            <div style={seoCard}><h3>Sharing reports</h3><p>XLSX files are easier for many office users to open, filter, save, and reuse.</p></div>
          </div>

          <h2>How to convert CSV to XLSX</h2>
          <ol style={listStyle}>
            <li>Upload your CSV file or paste CSV text into the converter.</li>
            <li>Let the tool auto-detect the delimiter, or choose comma, semicolon, tab, or pipe manually.</li>
            <li>Check the live preview to confirm that rows and columns are separated correctly.</li>
            <li>Choose Excel options such as header row, filters, frozen header, styled header, and auto-fit columns.</li>
            <li>Click Download XLSX and open the file in Excel or your preferred spreadsheet app.</li>
          </ol>

          <h2>CSV delimiter guide</h2>
          <p>
            A delimiter is the character used to separate values in each row. Many CSV files use commas, but some regions
            and software exports use semicolons. Tab-delimited files are common in reports copied from spreadsheets, and
            pipe-delimited files are often used in technical exports. If your preview looks wrong, changing the delimiter
            is usually the first fix.
          </p>

          <h2>Tips before downloading Excel</h2>
          <ul style={listStyle}>
            <li>Keep the first row as a header if it contains column names.</li>
            <li>Use filters when you want to sort or search large reports.</li>
            <li>Freeze the header row for long spreadsheets.</li>
            <li>Check date, number, and currency columns after opening the XLSX file.</li>
            <li>Keep the original CSV file as a backup before editing the Excel version.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Is this CSV to Excel converter free?</h3><p>Yes. You can convert CSV data to XLSX without creating an account.</p></div>
            <div style={seoCard}><h3>Does it support pasted CSV?</h3><p>Yes. You can upload a file or paste CSV text manually.</p></div>
            <div style={seoCard}><h3>Can it detect semicolon CSV files?</h3><p>Yes. The tool can auto-detect common delimiters or let you select them manually.</p></div>
            <div style={seoCard}><h3>Is my CSV uploaded to a server?</h3><p>The conversion is designed to run in your browser using local file reading and XLSX generation.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/csvtoexcel" />
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

function parseCSV(text, delimiter) {
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
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function sanitizeFileName(name) {
  return String(name || 'converted-data').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'converted-data';
}

function sanitizeSheetName(name) {
  return sanitizeFileName(name).slice(0, 31) || 'CSV Data';
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
const appGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' };
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '28px' };
const tabs = { display: 'flex', gap: '10px', marginBottom: '20px' };
const tab = { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' };
const activeTab = { ...tab, background: '#38bdf8', color: '#0f172a' };
const uploadBox = { display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', minHeight: '190px', border: '2px dashed #334155', borderRadius: '18px', cursor: 'pointer', color: '#cbd5e1', textAlign: 'center' };
const textarea = { width: '100%', minHeight: '190px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '18px', padding: '16px', resize: 'vertical' };
const optionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '13px' };
const checks = { display: 'grid', gap: '10px', marginTop: '20px', color: '#cbd5e1', fontSize: '0.94rem' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '14px 20px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '14px 20px', fontWeight: 900, cursor: 'pointer' };
const panelTitle = { color: '#fff', marginTop: 0 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' };
const statCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' };
const tableWrap = { overflow: 'auto', maxHeight: '420px', border: '1px solid #334155', borderRadius: '14px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const tdCell = { border: '1px solid #334155', padding: '9px', color: '#cbd5e1', whiteSpace: 'nowrap' };
const thCell = { ...tdCell, color: '#fff', background: '#0f172a', fontWeight: 900 };
const emptyText = { color: '#94a3b8', textAlign: 'center', padding: '60px 20px' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

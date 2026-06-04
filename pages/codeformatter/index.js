import React, { useMemo, useState } from 'react';
import { format as formatSql } from 'sql-formatter';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const sampleSql = `SELECT customer_id, customer_name, order_date, total_amount FROM sales_orders WHERE order_date BETWEEN '2026-01-01' AND '2026-01-31' ORDER BY order_date;`;

export default function CodeFormatter() {
  const [input, setInput] = useState(sampleSql);
  const [language, setLanguage] = useState('sql');
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
  const [sqlDialect, setSqlDialect] = useState('sql');
  const [notification, setNotification] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) {
      return { ok: false, output: '', error: 'Paste code to format.' };
    }

    try {
      if (language === 'sql') {
        const preparedSql = protectSapPlaceholders(input);

        try {
          const formattedSql = formatSql(preparedSql.sql, {
            language: sqlDialect,
            keywordCase: uppercaseKeywords ? 'upper' : 'preserve',
            linesBetweenQueries: 1
          });

          return {
            ok: true,
            output: restoreSapPlaceholders(formattedSql, preparedSql.placeholders),
            error: '',
            fallback: false
          };
        } catch (error) {
          return {
            ok: true,
            output: lenientSqlCleanup(input, uppercaseKeywords),
            error: `Strict SQL formatting failed: ${error.message}. A basic cleanup preview is shown below. Please review SQL syntax, quotes, commas, aliases, and placeholders before using it.`,
            fallback: true
          };
        }
      }

      if (language === 'json') {
        const parsed = JSON.parse(input);
        return { ok: true, output: JSON.stringify(parsed, null, 2), error: '' };
      }

      return {
        ok: true,
        output: basicFormat(input, language),
        error: ''
      };
    } catch (error) {
      return { ok: false, output: '', error: error.message };
    }
  }, [input, language, uppercaseKeywords, sqlDialect]);

  const copyOutput = async () => {
    if (!result.output) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
      setNotification('Formatted code copied.');
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  const downloadOutput = () => {
    if (!result.output) {
      setNotification('Nothing to download.');
      return;
    }

    const ext = language === 'sql' ? 'sql' : language === 'json' ? 'json' : 'txt';
    const blob = new Blob([result.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-code.${ext}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotification('Formatted code downloaded.');
  };

  return (
    <ToolboxLayout
      title="Code Formatter - Format SQL, JSON, HTML, CSS and Scripts Online"
      description="Format code online for SQL, JSON, HTML, CSS, JavaScript, Apps Script and VBA. Beautify messy code, copy output, download formatted code and work privately in your browser."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based code tool</p>
          <h1 style={heroTitle}>Code Formatter</h1>
          <p style={heroText}>
            Format messy SQL, JSON, HTML, CSS, JavaScript, Apps Script, VBA, and code snippets into cleaner,
            readable output.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Input code</h2>
              <button onClick={() => setInput('')} style={smallBtn}>Clear</button>
            </div>

            <div style={controls}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="javascript">JavaScript / Apps Script</option>
                  <option value="vba">VBA / Excel Macro</option>
                  <option value="plain">Plain text</option>
                </select>
              </label>

              {language === 'sql' && (
                <label style={fieldWrap}>
                  <span style={fieldLabel}>SQL dialect</span>
                  <select value={sqlDialect} onChange={(e) => setSqlDialect(e.target.value)} style={inputStyle}>
                    <option value="sql">Standard SQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="tsql">T-SQL</option>
                    <option value="plsql">PL/SQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </label>
              )}

              {language === 'sql' && (
                <label style={checkLabel}>
                  <input type="checkbox" checked={uppercaseKeywords} onChange={(e) => setUppercaseKeywords(e.target.checked)} />
                  Uppercase SQL keywords
                </label>
              )}
            </div>

            <div style={sampleRow}>
              <button onClick={() => { setLanguage('sql'); setInput(sampleSql); }} style={sampleBtn}>SQL sample</button>
              <button onClick={() => { setLanguage('json'); setInput('{"name":"SHB ToolBox","active":true,"tools":["JSON","SQL"]}'); }} style={sampleBtn}>JSON sample</button>
              <button onClick={() => { setLanguage('html'); setInput('<div><h1>Hello</h1><p>Formatted HTML</p></div>'); }} style={sampleBtn}>HTML sample</button>
              <button onClick={() => { setLanguage('css'); setInput('body{margin:0;color:#111;} .card{padding:20px;border-radius:12px;}'); }} style={sampleBtn}>CSS sample</button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste code here..."
              style={textarea}
              spellCheck={false}
            />
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Formatted output</h2>
              <span style={result.fallback ? warningBadge : result.ok ? validBadge : errorBadge}>{result.fallback ? 'Cleanup preview' : result.ok ? 'Formatted' : 'Error'}</span>
            </div>

            {result.ok ? (
              <>
                {result.fallback && <div style={warningBox}>{result.error}</div>}
                <pre style={outputBox}>{result.output}</pre>
              </>
            ) : (
              <div style={errorBox}>
                <strong>Formatting error</strong>
                <p>{result.error}</p>
              </div>
            )}

            <div style={buttonRow}>
              <button onClick={copyOutput} style={primaryBtn}>Copy output</button>
              <button onClick={downloadOutput} style={secondaryBtn}>Download</button>
            </div>
          </div>
        </section>

        <section style={contentSection}>
          <h2>Format code online</h2>
          <p>
            Code often becomes difficult to read when it is copied from emails, PDFs, database tools, ERP query windows,
            websites, chat messages, or minified files. A code formatter adds indentation, line breaks, and structure so
            the code becomes easier to review, edit, debug, and share.
          </p>
          <p>
            This tool is especially useful for SQL queries, JSON data, HTML snippets, CSS blocks, JavaScript, Google Apps
            Script, VBA macros, and plain text code samples.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>SQL formatter</h3><p>Format SELECT queries, JOINs, WHERE clauses, ORDER BY, GROUP BY, and long database queries.</p></div>
            <div style={seoCard}><h3>JSON formatter</h3><p>Validate and beautify JSON data with readable indentation.</p></div>
            <div style={seoCard}><h3>Script formatting</h3><p>Clean up JavaScript, Apps Script, VBA, and copied code snippets for easier reading.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>Formatting is designed to run in your browser without requiring account creation.</p></div>
          </div>

          <h2>When to use a code formatter</h2>
          <ul style={listStyle}>
            <li>Format a long SQL query copied from SAP Business One, ERP, or database tools.</li>
            <li>Beautify JSON returned from an API or automation tool.</li>
            <li>Clean copied HTML, CSS, JavaScript, Apps Script, or VBA code.</li>
            <li>Prepare code examples for documentation, tutorials, or team sharing.</li>
            <li>Find missing brackets, quotes, commas, or messy structure more easily.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Can this format SQL queries?</h3><p>Yes. SQL formatting is supported with readable line breaks and keyword formatting.</p></div>
            <div style={seoCard}><h3>Can it validate JSON?</h3><p>Yes. Choose JSON mode to validate and format JSON data.</p></div>
            <div style={seoCard}><h3>Does it fix broken code?</h3><p>It formats readable code, but it cannot safely guess every missing quote, keyword, or bracket.</p></div>
            <div style={seoCard}><h3>Is my code uploaded?</h3><p>The formatter is designed to process code in your browser.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/codeformatter" />
      </div>
    </ToolboxLayout>
  );
}

function protectSapPlaceholders(sql) {
  const placeholders = [];
  const safeSql = sql.replace(/\[%\d+\]/g, (match) => {
    const token = `'__SAP_PLACEHOLDER_${placeholders.length}__'`;
    placeholders.push({ token: token.replace(/'/g, ''), value: match });
    return token;
  });

  return { sql: safeSql, placeholders };
}

function restoreSapPlaceholders(sql, placeholders) {
  let output = sql;

  placeholders.forEach(({ token, value }) => {
    output = output.replaceAll(`'${token}'`, value);
    output = output.replaceAll(token, value);
  });

  return output;
}

function lenientSqlCleanup(sql, uppercaseKeywords) {
  let output = String(sql || '').trim();

  const keywordMap = [
    'SELECT', 'FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'JOIN', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'AND', 'OR'
  ];

  keywordMap.forEach(keyword => {
    const replacement = uppercaseKeywords ? keyword : keyword.toLowerCase();
    const pattern = new RegExp('\\s+' + keyword.replace(/ /g, '\\s+') + '\\s+', 'gi');
    if (['AND', 'OR'].includes(keyword)) {
      output = output.replace(pattern, ` ${replacement} `);
    } else {
      output = output.replace(pattern, `\n${replacement}\n    `);
    }
  });

  output = output
    .replace(/,\s*/g, ',\n    ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+;/g, ';')
    .trim();

  return output;
}

function basicFormat(code, language) {
  const trimmed = code.trim();

  if (language === 'html') {
    return trimmed
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  if (language === 'css') {
    return trimmed
      .replace(/\{/g, ' {\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  if (language === 'javascript' || language === 'vba') {
    return trimmed
      .replace(/;/g, ';\n')
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  return trimmed;
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
const controls = { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginBottom: '18px' };
const sampleRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' };
const sampleBtn = { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px' };
const checkLabel = { color: '#cbd5e1', display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '12px' };
const textarea = { width: '100%', minHeight: '420px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace' };
const outputBox = { minHeight: '420px', maxHeight: '560px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' };
const errorBox = { minHeight: '420px', background: 'rgba(239,68,68,0.1)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px', padding: '20px' };
const buttonRow = { display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const secondaryBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const smallBtn = { ...secondaryBtn, padding: '9px 12px', fontSize: '0.78rem' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const warningBadge = { color: '#facc15', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const warningBox = { color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '14px', padding: '12px', marginBottom: '12px', fontSize: '0.9rem', lineHeight: 1.6 };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

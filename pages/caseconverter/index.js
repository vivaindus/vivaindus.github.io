import React, { useState, useEffect, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

export default function CaseConverter() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;

    return { words, characters, charactersNoSpaces, lines, sentences };
  }, [text]);

  const saveHistory = () => {
    setHistory(prev => [...prev.slice(-19), text]);
  };

  const updateText = (newText, message) => {
    if (!text && newText !== '') {
      setNotification('⚠️ Please enter or paste text first.');
      return;
    }

    saveHistory();
    setText(newText);
    setNotification(message);
  };

  const copyText = async () => {
    if (!text) {
      setNotification('⚠️ Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setNotification('Copied to clipboard 📋');
    } catch {
      setNotification('⚠️ Copy failed. Please select and copy manually.');
    }
  };

  const downloadText = () => {
    if (!text) {
      setNotification('⚠️ Nothing to download.');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'converted-text.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotification('Text file downloaded ✅');
  };

  const undo = () => {
    if (history.length === 0) {
      setNotification('⚠️ Nothing to undo.');
      return;
    }

    const previous = history[history.length - 1];
    setText(previous);
    setHistory(prev => prev.slice(0, -1));
    setNotification('Undo complete ↩️');
  };

  const clearText = () => {
    if (!text) return;
    saveHistory();
    setText('');
    setNotification('Workspace cleared 🗑️');
  };

  const wordsFromText = (value) => {
    return value
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean);
  };

  const toSentenceCase = (value) => {
    return value
      .toLowerCase()
      .replace(/(^\s*[a-zA-Z]|[.!?]\s+[a-zA-Z])/g, match => match.toUpperCase());
  };

  const toTitleCase = (value) => {
    const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via']);
    return value
      .toLowerCase()
      .split(/(\s+)/)
      .map((word, index, arr) => {
        const clean = word.toLowerCase();
        const isFirstOrLast = index === 0 || index === arr.length - 1;
        if (!isFirstOrLast && smallWords.has(clean)) return clean;
        return word.replace(/\b[a-z]/g, char => char.toUpperCase());
      })
      .join('');
  };

  const toCamelCase = (value) => {
    const words = wordsFromText(value);
    return words
      .map((word, index) => {
        const lower = word.toLowerCase();
        return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join('');
  };

  const toPascalCase = (value) => {
    return wordsFromText(value)
      .map(word => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join('');
  };

  const toSnakeCase = (value) => wordsFromText(value).map(w => w.toLowerCase()).join('_');
  const toKebabCase = (value) => wordsFromText(value).map(w => w.toLowerCase()).join('-');
  const toConstantCase = (value) => wordsFromText(value).map(w => w.toUpperCase()).join('_');

  const toSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  };

  const toggleCase = (value) => {
    return value
      .split('')
      .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
      .join('');
  };

  const removeExtraSpaces = (value) => value.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
  const trimEachLine = (value) => value.split(/\r\n|\r|\n/).map(line => line.trim()).join('\n');
  const removeEmptyLines = (value) => value.split(/\r\n|\r|\n/).filter(line => line.trim() !== '').join('\n');

  const removeDuplicateLines = (value) => {
    const seen = new Set();
    return value
      .split(/\r\n|\r|\n/)
      .filter(line => {
        const key = line.trim();
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join('\n');
  };

  const sortLinesAZ = (value) => value.split(/\r\n|\r|\n/).sort((a, b) => a.localeCompare(b)).join('\n');
  const sortLinesZA = (value) => value.split(/\r\n|\r|\n/).sort((a, b) => b.localeCompare(a)).join('\n');
  const reverseLines = (value) => value.split(/\r\n|\r|\n/).reverse().join('\n');
  const addLineNumbers = (value) => value.split(/\r\n|\r|\n/).map((line, index) => `${index + 1}. ${line}`).join('\n');
  return (
    <ToolboxLayout
      title="Case Converter - Convert Text to Uppercase, Lowercase, Title Case, camelCase and More"
      description="Use the free SHB ToolBox case converter to format text into uppercase, lowercase, sentence case, title case, camelCase, PascalCase, snake_case, kebab-case, URL slugs, and clean line lists."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free online text formatter</p>
          <h1 style={heroTitle}>Case Converter and Text Cleaner</h1>
          <p style={heroText}>
            Paste text once and convert it into common writing, coding, and SEO formats. This tool helps writers,
            students, developers, marketers, and data users clean text, standardize capitalization, prepare URL slugs,
            remove duplicate lines, and copy the final result quickly.
          </p>
        </section>

        <section style={toolLayout}>
          <div style={editorPanel}>
            <div style={editorTop}>
              <div>
                <h2 style={panelTitle}>Paste or type your text</h2>
                <p style={panelText}>Use the buttons below to transform or clean your content instantly.</p>
              </div>
              <button onClick={clearText} style={smallDanger}>Clear</button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              style={textareaStyle}
            />

            <div style={statsGrid}>
              <div style={statBox}><strong>{stats.words}</strong><span>Words</span></div>
              <div style={statBox}><strong>{stats.characters}</strong><span>Characters</span></div>
              <div style={statBox}><strong>{stats.charactersNoSpaces}</strong><span>No spaces</span></div>
              <div style={statBox}><strong>{stats.lines}</strong><span>Lines</span></div>
              <div style={statBox}><strong>{stats.sentences}</strong><span>Sentences</span></div>
            </div>
          </div>

          <aside style={sidePanel}>
            <button onClick={copyText} style={primaryBtn}>Copy Text</button>
            <button onClick={downloadText} style={secondaryBtn}>Download .txt</button>
            <button onClick={undo} disabled={history.length === 0} style={history.length ? secondaryBtn : disabledBtn}>Undo</button>

            <div style={tipBox}>
              <h3 style={tipTitle}>Quick guide</h3>
              <p style={tipText}>
                Use <strong>Title Case</strong> for headings, <strong>camelCase</strong> for JavaScript variables,
                <strong> snake_case</strong> for Python or SQL, and <strong>kebab-case</strong> for URLs and file names.
              </p>
            </div>
          </aside>
        </section>

        <section style={actionsSection}>
          <h2 style={sectionTitle}>Case conversions</h2>
          <div style={buttonGrid}>
            <button onClick={() => updateText(text.toUpperCase(), 'Converted to UPPERCASE ✅')} style={actionBtn}>UPPERCASE</button>
            <button onClick={() => updateText(text.toLowerCase(), 'Converted to lowercase ✅')} style={actionBtn}>lowercase</button>
            <button onClick={() => updateText(toSentenceCase(text), 'Converted to Sentence case ✅')} style={actionBtn}>Sentence case</button>
            <button onClick={() => updateText(toTitleCase(text), 'Converted to Title Case ✅')} style={actionBtn}>Title Case</button>
            <button onClick={() => updateText(toCamelCase(text), 'Converted to camelCase ✅')} style={actionBtn}>camelCase</button>
            <button onClick={() => updateText(toPascalCase(text), 'Converted to PascalCase ✅')} style={actionBtn}>PascalCase</button>
            <button onClick={() => updateText(toSnakeCase(text), 'Converted to snake_case ✅')} style={actionBtn}>snake_case</button>
            <button onClick={() => updateText(toKebabCase(text), 'Converted to kebab-case ✅')} style={actionBtn}>kebab-case</button>
            <button onClick={() => updateText(toConstantCase(text), 'Converted to CONSTANT_CASE ✅')} style={actionBtn}>CONSTANT_CASE</button>
            <button onClick={() => updateText(toggleCase(text), 'Toggle case applied ✅')} style={actionBtn}>tOGGLE cASE</button>
            <button onClick={() => updateText(toSlug(text), 'SEO URL slug created ✅')} style={actionBtn}>URL slug</button>
          </div>
        </section>

        <section style={actionsSection}>
          <h2 style={sectionTitle}>Text cleaning and line tools</h2>
          <div style={buttonGrid}>
            <button onClick={() => updateText(removeExtraSpaces(text), 'Extra spaces removed ✅')} style={utilityBtn}>Remove extra spaces</button>
            <button onClick={() => updateText(trimEachLine(text), 'Each line trimmed ✅')} style={utilityBtn}>Trim each line</button>
            <button onClick={() => updateText(removeEmptyLines(text), 'Empty lines removed ✅')} style={utilityBtn}>Remove empty lines</button>
            <button onClick={() => updateText(removeDuplicateLines(text), 'Duplicate lines removed ✅')} style={utilityBtn}>Remove duplicate lines</button>
            <button onClick={() => updateText(sortLinesAZ(text), 'Lines sorted A-Z ✅')} style={utilityBtn}>Sort lines A-Z</button>
            <button onClick={() => updateText(sortLinesZA(text), 'Lines sorted Z-A ✅')} style={utilityBtn}>Sort lines Z-A</button>
            <button onClick={() => updateText(reverseLines(text), 'Lines reversed ✅')} style={utilityBtn}>Reverse lines</button>
            <button onClick={() => updateText(addLineNumbers(text), 'Line numbers added ✅')} style={utilityBtn}>Add line numbers</button>
          </div>
        </section>

        
        <RelatedTools currentPath="/caseconverter" />

<section style={contentSection}>
          <h2 style={contentTitle}>What is a case converter?</h2>
          <p style={para}>
            A case converter changes the capitalization and structure of text. It can turn a paragraph into uppercase,
            lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, or a
            search-friendly URL slug. This is useful when text has been copied from different sources and needs a consistent
            format.
          </p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <h3 style={infoTitle}>For writing and editing</h3>
              <p style={paraSmall}>
                Writers, students, and editors can use sentence case, title case, uppercase, and lowercase tools to clean
                headings, article titles, social captions, product descriptions, and copied text.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For developers</h3>
              <p style={paraSmall}>
                Developers often need naming formats such as camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE
                for variables, class names, file names, routes, database columns, and environment keys.
              </p>
            </div>

            <div style={infoCard}>
              <h3 style={infoTitle}>For SEO and content work</h3>
              <p style={paraSmall}>
                The URL slug option converts a title into a clean lowercase phrase separated by hyphens. This helps prepare
                readable URLs, blog slugs, file names, and content labels.
              </p>
            </div>
          </div>

          <h2 style={contentTitle}>Useful text cleaning features</h2>
          <p style={para}>
            Case conversion is only one part of text formatting. SHB ToolBox also includes line utilities that remove empty
            lines, trim each line, sort lists, reverse line order, remove duplicates, and add line numbers. These features
            are helpful when cleaning spreadsheet exports, copied PDF text, product lists, email lists, keyword lists, and
            plain text data.
          </p>

          <h2 style={contentTitle}>Privacy note</h2>
          <p style={para}>
            Text can contain private notes, business information, passwords, drafts, or customer details. This tool is designed
            for browser-based text formatting and does not require a login. For sensitive content, always review what you paste
            into any online tool and avoid sharing private data unnecessarily.
          </p>
        </section>

        <section style={faqSection}>
          <h2 style={contentTitle}>Case Converter FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3 style={faqQ}>What is the difference between camelCase and PascalCase?</h3>
              <p style={paraSmall}>camelCase starts with a lowercase word, while PascalCase capitalizes the first letter of every word.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>What is kebab-case used for?</h3>
              <p style={paraSmall}>kebab-case is commonly used for URLs, slugs, file names, CSS class names, and readable web paths.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I remove duplicate lines?</h3>
              <p style={paraSmall}>Yes. Paste a list and click Remove duplicate lines. The first copy is kept and later duplicates are removed.</p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I download the converted text?</h3>
              <p style={paraSmall}>Yes. Use the Download .txt button to save the current text as a plain text file.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1150px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '870px', margin: '0 auto', lineHeight: 1.75 };

const toolLayout = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '24px', alignItems: 'start' };
const editorPanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '28px', boxShadow: '0 14px 35px rgba(0,0,0,0.2)' };
const editorTop = { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' };
const panelTitle = { color: '#fff', fontSize: '1.45rem', margin: '0 0 8px' };
const panelText = { color: '#94a3b8', lineHeight: 1.6, margin: 0 };
const textareaStyle = { width: '100%', minHeight: '390px', background: '#0f172a', color: '#fff', padding: '22px', borderRadius: '22px', border: '1px solid #334155', fontSize: '1rem', resize: 'vertical', outline: 'none', lineHeight: 1.7 };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginTop: '16px' };
const statBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#94a3b8', textAlign: 'center' };

const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '22px', display: 'grid', gap: '12px', position: 'sticky', top: '92px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', fontSize: '0.95rem' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 850, cursor: 'pointer' };
const disabledBtn = { ...secondaryBtn, opacity: 0.35, cursor: 'not-allowed' };
const smallDanger = { background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px 14px', borderRadius: '12px', fontWeight: 850, cursor: 'pointer' };
const tipBox = { marginTop: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px' };
const tipTitle = { color: '#38bdf8', margin: '0 0 10px', fontSize: '1rem' };
const tipText = { color: '#94a3b8', lineHeight: 1.7, fontSize: '0.88rem', margin: 0 };

const actionsSection = { marginTop: '28px', background: '#1e293b', border: '1px solid #334155', borderRadius: '26px', padding: '28px' };
const sectionTitle = { color: '#fff', fontSize: '1.35rem', margin: '0 0 18px' };
const buttonGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '11px' };
const actionBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 850, fontSize: '0.86rem' };
const utilityBtn = { background: 'rgba(56,189,248,0.08)', color: '#cbd5e1', border: '1px solid #334155', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 800, fontSize: '0.84rem' };

const contentSection = { marginTop: '76px', borderTop: '1px solid #334155', paddingTop: '55px' };
const contentTitle = { color: '#fff', fontSize: '1.75rem', lineHeight: 1.25, margin: '0 0 18px' };
const para = { color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: '0 0 28px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '28px 0 48px' };
const infoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const infoTitle = { color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem' };
const paraSmall = { color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px' };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 10px' };
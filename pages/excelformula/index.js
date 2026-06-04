import React, { useMemo, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';
import { getExcelFunctionInfo } from '../../lib/excelFunctions';
import { buildDetailedExplanation } from '../../lib/excelFormulaExplainer';

const sampleFormula = '=IF(AND(A2<>"",B2>0),VLOOKUP(A2,Sheet2!$A$2:$D$100,4,FALSE),"Not Found")';


function extractCleanExcelReferences(formula) {
  const source = String(formula || '');

  const protectedRanges = [];
  const foundRanges = [];
  const foundCells = [];

  const addRange = (value, start, end) => {
    if (!foundRanges.includes(value)) foundRanges.push(value);
    protectedRanges.push({ start, end });
  };

  // Full sheet ranges, for example Sheet2!$A$2:$D$100 or 'Sales Sheet'!A1:D10
  const sheetRangePattern = /(?:'[^']+'|[A-Za-z_][A-Za-z0-9_ ]*)!\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+/g;

  // Normal ranges, for example $A$2:$D$100 or A1:D10
  const rangePattern = /\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+/g;

  // Cell references, but not when preceded by letters/numbers/_/!
  // This prevents Sheet2 becoming EET2.
  const cellPattern = /(?<![A-Za-z0-9_!])\$?[A-Z]{1,3}\$?\d+\b/g;

  let match;

  while ((match = sheetRangePattern.exec(source)) !== null) {
    addRange(match[0], match.index, match.index + match[0].length);
  }

  while ((match = rangePattern.exec(source)) !== null) {
    const insideExistingRange = protectedRanges.some(part => match.index >= part.start && match.index < part.end);
    if (!insideExistingRange) {
      addRange(match[0], match.index, match.index + match[0].length);
    }
  }

  while ((match = cellPattern.exec(source)) !== null) {
    const insideRange = protectedRanges.some(part => match.index >= part.start && match.index < part.end);
    if (!insideRange && !foundCells.includes(match[0])) {
      foundCells.push(match[0]);
    }
  }

  return [...foundRanges, ...foundCells];
}



function getCleanFormulaReferences(formula) {
  const source = String(formula || '');
  const ranges = [];
  const cells = [];
  const protectedParts = [];

  function addRange(value, start, end) {
    if (!ranges.includes(value)) ranges.push(value);
    protectedParts.push({ start, end });
  }

  const sheetRangePattern = /(?:'[^']+'|[A-Za-z_][A-Za-z0-9_ ]*)!\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+/g;
  const rangePattern = /\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+/g;
  const cellPattern = /(?<![A-Za-z0-9_!])\$?[A-Z]{1,3}\$?\d+\b/g;

  let m;

  while ((m = sheetRangePattern.exec(source)) !== null) {
    addRange(m[0], m.index, m.index + m[0].length);
  }

  while ((m = rangePattern.exec(source)) !== null) {
    const inside = protectedParts.some(p => m.index >= p.start && m.index < p.end);
    if (!inside) addRange(m[0], m.index, m.index + m[0].length);
  }

  while ((m = cellPattern.exec(source)) !== null) {
    const inside = protectedParts.some(p => m.index >= p.start && m.index < p.end);
    if (!inside && !cells.includes(m[0])) cells.push(m[0]);
  }

  return { references: cells, ranges };
}


export default function ExcelFormulaTool() {
  const [formula, setFormula] = useState(sampleFormula);
  const [indentSize, setIndentSize] = useState(4);
  const [notification, setNotification] = useState('');

  const analysis = useMemo(() => analyzeFormula(formula, indentSize), [formula, indentSize]);

  const copyFormatted = async () => {
    if (!analysis.formatted) {
      setNotification('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(analysis.formatted);
      setNotification('Formatted formula copied.');
    } catch {
      setNotification('Copy failed. Please select and copy manually.');
    }
  };

  return (
    <ToolboxLayout
      title="Excel Formula Formatter and Explainer - Beautify Excel Formulas"
      description="Format, beautify, analyze and explain Excel formulas online. Detect functions, check brackets, improve readability, copy formatted formulas and learn common Excel functions."
    >
      <div style={pageWrap}>
        {notification && <div style={toast}>{notification}</div>}

        <section style={hero}>
          <p style={eyebrow}>Free browser-based Excel tool</p>
          <h1 style={heroTitle}>Excel Formula Formatter & Explainer</h1>
          <p style={heroText}>
            Paste an Excel formula, beautify it with clean line breaks, detect functions, check brackets,
            and understand what common functions are doing.
          </p>
        </section>

        <section style={appGrid}>
          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Input formula</h2>
              <button onClick={() => setFormula('')} style={smallBtn}>Clear</button>
            </div>

            <div style={sampleRow}>
              <button onClick={() => setFormula(sampleFormula)} style={sampleBtn}>VLOOKUP sample</button>
              <button onClick={() => setFormula('=SUMIFS($E:$E,$A:$A,A2,$B:$B,">="&DATE(2026,1,1),$B:$B,"<="&DATE(2026,1,31))')} style={sampleBtn}>SUMIFS sample</button>
              <button onClick={() => setFormula('=IFERROR(INDEX($D$2:$D$100,MATCH(A2,$A$2:$A$100,0)),"Missing")')} style={sampleBtn}>INDEX MATCH sample</button>
              <button onClick={() => setFormula('=LET(total,SUM(B2:B20),tax,total*5%,total+tax)')} style={sampleBtn}>LET sample</button>
            </div>

            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="Paste Excel formula here..."
              style={textarea}
              spellCheck={false}
            />

            <div style={controls}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Indent size</span>
                <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} style={inputStyle}>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              </label>

              <button onClick={copyFormatted} style={primaryBtn}>Copy formatted formula</button>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHead}>
              <h2 style={panelTitle}>Formatted formula</h2>
              <span style={analysis.isBalanced ? validBadge : errorBadge}>
                {analysis.isBalanced ? 'Brackets OK' : 'Check brackets'}
              </span>
            </div>

            <pre style={outputBox}>{analysis.formatted || 'Formatted formula will appear here.'}</pre>
          </div>
        </section>

        <section style={statsGrid}>
          <div style={statCard}><strong>{analysis.length}</strong><span>Characters</span></div>
          <div style={statCard}><strong>{analysis.functions.length}</strong><span>Functions</span></div>
          <div style={statCard}><strong>{analysis.openBrackets}</strong><span>Open brackets</span></div>
          <div style={statCard}><strong>{analysis.closeBrackets}</strong><span>Close brackets</span></div>
        </section>

        <section style={panel}>
          <h2 style={panelTitle}>Formula walkthrough</h2>

          <div style={walkGrid}>
            <div style={walkCard}>
              <h3>Main purpose</h3>
              <p>{analysis.walkthrough.mainPurpose}</p>
            </div>

            <div style={walkCard}>
              <h3>How it works</h3>
              <ul style={walkList}>
                {analysis.walkthrough.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <div style={walkCard}>
              <h3>References found</h3>
              <p>{extractCleanExcelReferences(formula).length ? extractCleanExcelReferences(formula).join(', ') : 'No cell references detected.'}</p>
            </div>

            <div style={walkCard}>
              <h3>Ranges found</h3>
              <p>{analysis.ranges.length ? cleanFormulaRefs.ranges.join(', ') : 'No direct ranges detected.'}</p>
            </div>
          </div>

          <div style={noteBox}>
            This is a rule-based explanation to help you understand the formula structure. Always test important formulas
            in Excel or Google Sheets before using them in business, finance, stock, payroll, or reporting files.
          </div>
        </section>

        {analysis.detailedExplanation?.pattern && (
          <section style={panel}>
            <h2 style={panelTitle}>Pattern detected: {analysis.detailedExplanation.pattern.name}</h2>

            <div style={patternSummary}>
              {analysis.detailedExplanation.pattern.summary}
            </div>

            <div style={patternList}>
              {analysis.detailedExplanation.pattern.points.map((point, index) => (
                <div key={index} style={patternItem}>{point}</div>
              ))}
            </div>
          </section>
        )}

        <section style={panel}>
          <h2 style={panelTitle}>Detailed formula explanation</h2>

          <div style={detailOverall}>
            {analysis.detailedExplanation?.overall}
          </div>

          <div style={detailList}>
            {(analysis.detailedExplanation?.items || []).map((item, index) => (
              <div key={index} style={detailItem}>{item}</div>
            ))}
          </div>
        </section>

        <section style={panel}>
          <h2 style={panelTitle}>Functions detected</h2>
          {analysis.functions.length ? (
            <div style={functionGrid}>
              {analysis.functions.map(fn => (
                <div key={fn} style={functionCard}>
                  <h3>{fn}</h3>
                  <p>{getExcelFunctionInfo(fn)?.description || 'This function was detected in the formula, but it is not yet in the local explanation database.'}</p>
                  {getExcelFunctionInfo(fn)?.syntax && (
                    <p style={syntaxText}><strong>Syntax:</strong> {getExcelFunctionInfo(fn).syntax}</p>
                  )}
                  {getExcelFunctionInfo(fn)?.args?.length > 0 && (
                    <ul style={miniList}>
                      {getExcelFunctionInfo(fn).args.map((arg, index) => (
                        <li key={index}>{arg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={mutedText}>No functions detected yet.</p>
          )}
        </section>

        <section style={contentSection}>
          <h2>Format and understand Excel formulas online</h2>
          <p>
            Long Excel formulas can become difficult to read when they include nested IF statements, lookup functions,
            multiple conditions, date logic, text functions, or error handling. Formatting the formula across multiple
            lines makes it easier to debug and explain.
          </p>
          <p>
            This tool helps you beautify Excel formulas, detect common functions, check bracket balance, and review
            plain-English explanations of popular functions such as IF, VLOOKUP, XLOOKUP, SUMIFS, INDEX, MATCH, LET,
            TEXT, and IFERROR.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}><h3>Beautify formulas</h3><p>Break long formulas into readable lines with indentation around brackets and separators.</p></div>
            <div style={seoCard}><h3>Detect functions</h3><p>Find Excel functions used inside the formula and review simple explanations.</p></div>
            <div style={seoCard}><h3>Check brackets</h3><p>Compare opening and closing brackets to quickly spot possible formula structure issues.</p></div>
            <div style={seoCard}><h3>Private workflow</h3><p>The formula is analyzed in your browser without requiring account creation.</p></div>
          </div>

          <h2>When to use an Excel formula formatter</h2>
          <ul style={listStyle}>
            <li>Understand a formula received from someone else.</li>
            <li>Debug nested IF, VLOOKUP, XLOOKUP, INDEX MATCH, SUMIFS, or LET formulas.</li>
            <li>Prepare Excel formulas for tutorials, documentation, or training notes.</li>
            <li>Find missing brackets or confusing nested logic.</li>
            <li>Make long formulas easier to review before using them in a workbook.</li>
          </ul>

          <h2>FAQ</h2>
          <div style={seoGrid}>
            <div style={seoCard}><h3>Can this explain any Excel formula?</h3><p>It explains detected common functions and gives structure help. It is not a full AI formula interpreter.</p></div>
            <div style={seoCard}><h3>Can it fix broken formulas?</h3><p>It can help spot bracket issues and readability problems, but you should verify formula logic in Excel.</p></div>
            <div style={seoCard}><h3>Does it support Google Sheets formulas?</h3><p>Many Excel and Google Sheets functions overlap, so it can help with common formulas from both tools.</p></div>
            <div style={seoCard}><h3>Is my formula uploaded?</h3><p>The tool is designed to run in your browser using local analysis.</p></div>
          </div>
        </section>

        <RelatedTools currentPath="/excelformula" />
      </div>
    </ToolboxLayout>
  );
}

function analyzeFormula(value, indentSize) {
  const formula = String(value || '').trim();
  const formatted = formatFormula(formula, indentSize);
  const functions = Array.from(
    new Set(
      (formula.match(/\b[A-Z][A-Z0-9_.]*(?=\s*\()/gi) || [])
        .map(x => x.toUpperCase())
    )
  ).sort();

  const openBrackets = (formula.match(/\(/g) || []).length;
  const closeBrackets = (formula.match(/\)/g) || []).length;

  return {
    formatted,
    functions,
    references: detectCellReferences(formula),
    ranges: detectRanges(formula),
    walkthrough: buildFormulaWalkthrough(formula, functions),
    lineExplanation: buildLineByLineExplanation(formatted),
    detailedExplanation: buildDetailedExplanation(formula),
    openBrackets,
    closeBrackets,
    isBalanced: openBrackets === closeBrackets,
    length: formula.length
  };
}

function formatFormula(formula, indentSize) {
  if (!formula) return '';

  let output = '';
  let indent = 0;
  let inString = false;
  const spaces = (level) => ' '.repeat(Math.max(0, level) * indentSize);

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    if (char === '"') {
      inString = !inString;
      output += char;
      continue;
    }

    if (!inString && char === '(') {
      output += '(\n';
      indent++;
      output += spaces(indent);
    } else if (!inString && char === ',') {
      output += ',\n' + spaces(indent);
    } else if (!inString && char === ')') {
      indent = Math.max(0, indent - 1);
      output += '\n' + spaces(indent) + ')';
    } else {
      output += char;
    }
  }

  return output
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .trim();
}

function detectCellReferences(formula) {
  return Array.from(new Set((formula.match(/\$?[A-Z]{1,3}\$?\d+/gi) || []).map(ref => ref.toUpperCase()))).sort();
}

function detectRanges(formula) {
  return Array.from(new Set((formula.match(/\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+/gi) || []).map(ref => ref.toUpperCase()))).sort();
}

function buildLineByLineExplanation(formattedFormula) {
  const lines = String(formattedFormula || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return lines.map(line => ({
    line,
    meaning: explainFormulaLine(line)
  }));
}

function explainFormulaLine(line) {
  const clean = String(line || '').trim().replace(/,$/, '');

  if (/^=IF\($/i.test(clean) || /^IF\($/i.test(clean)) {
    return 'Starts an IF function. Excel checks a condition, then returns one result if TRUE and another result if FALSE.';
  }

  if (/^IFS\($/i.test(clean)) {
    return 'Starts an IFS function. Excel checks multiple conditions and returns the result for the first TRUE condition.';
  }

  if (/^IFERROR\($/i.test(clean)) {
    return 'Starts IFERROR. Excel tries the main calculation first. If it returns an error, Excel returns the fallback value instead.';
  }

  if (/^SUM\($/i.test(clean)) {
    return 'Starts SUM. Excel adds the numbers or range returned inside this function.';
  }

  if (/^SUMIF\($/i.test(clean)) {
    return 'Starts SUMIF. Excel adds values only when one condition is met.';
  }

  if (/^SUMIFS\($/i.test(clean)) {
    return 'Starts SUMIFS. Excel adds values only when multiple conditions are met.';
  }

  if (/^COUNTIF\($/i.test(clean)) {
    return 'Starts COUNTIF. Excel counts cells that meet one condition.';
  }

  if (/^COUNTIFS\($/i.test(clean)) {
    return 'Starts COUNTIFS. Excel counts cells that meet multiple conditions.';
  }

  if (/^AND\($/i.test(clean)) {
    return 'Starts AND. Every condition inside this block must be TRUE for the AND result to be TRUE.';
  }

  if (/^OR\($/i.test(clean)) {
    return 'Starts OR. At least one condition inside this block must be TRUE for the OR result to be TRUE.';
  }

  if (/^INDIRECT\($/i.test(clean)) {
    return 'Starts INDIRECT. Excel converts text into a real cell or range reference, for example text like G2808:G2815 becomes an actual range.';
  }

  if (/^ROW\($/i.test(clean)) {
    return 'Starts ROW. If no reference is supplied, it returns the current row number.';
  }

  if (/^ROW\(\)$/i.test(clean)) {
    return 'ROW() returns the current row number. It is often used to build dynamic references based on the row where the formula is placed.';
  }

  if (/^ROW\(\s*\$?[A-Z]{1,3}\$?\d+\s*\)$/i.test(clean)) {
    const ref = clean.match(/\$?[A-Z]{1,3}\$?\d+/i)?.[0] || 'the referenced cell';
    return `Returns the row number of ${ref}.`;
  }

  if (/^VLOOKUP\($/i.test(clean)) {
    return 'Starts VLOOKUP. Excel searches the first column of a table and returns a related value from another column.';
  }

  if (/^XLOOKUP\($/i.test(clean)) {
    return 'Starts XLOOKUP. Excel searches one range and returns a matching value from another range.';
  }

  if (/^INDEX\($/i.test(clean)) {
    return 'Starts INDEX. Excel returns a value from a specific row and column position in a range.';
  }

  if (/^MATCH\($/i.test(clean)) {
    return 'Starts MATCH. Excel finds the position of a value inside a range.';
  }

  if (/^\$?[A-Z]{1,3}\$?\d+<>""$/i.test(clean)) {
    const ref = clean.replace(/<>""/i, '');
    return `${ref}<>"" means ${ref} is not blank.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+=""$/i.test(clean)) {
    const ref = clean.replace(/=""/i, '');
    return `${ref}="" means ${ref} is blank.`;
  }

  if (/^\$?[A-Z]{1,3}\$?\d+$/i.test(clean)) {
    return `${clean} is a cell reference used by the surrounding function.`;
  }

  if (/^"\w+"\s*&\s*ROW\($/i.test(clean)) {
    const prefix = clean.match(/^"([^"]+)"/)?.[1] || '';
    return `Starts building a text cell reference by joining "${prefix}" with a row number. For example, it can create ${prefix}2808.`;
  }

  if (/^"\w+"\s*&\s*ROW\(\)$/i.test(clean)) {
    const prefix = clean.match(/^"([^"]+)"/)?.[1] || '';
    return `Builds a text cell reference by joining "${prefix}" with the current row number.`;
  }

  if (/^"\w+"\s*&\s*ROW\(\s*\$?[A-Z]{1,3}\$?\d+\s*\)$/i.test(clean)) {
    const prefix = clean.match(/^"([^"]+)"/)?.[1] || '';
    const ref = clean.match(/\$?[A-Z]{1,3}\$?\d+/i)?.[0] || 'the referenced cell';
    return `Builds a text cell reference by joining "${prefix}" with the row number of ${ref}.`;
  }

  if (clean.includes('&":"&')) {
    return 'Joins a start reference and an end reference with ":" to create range text like G2808:G2815.';
  }

  if (clean.includes('&')) {
    return 'Uses & to join text pieces together. This is often used to build dynamic references or labels.';
  }

  if (clean === '""') {
    return 'Returns a blank value, so the result cell appears empty.';
  }

  if (/^"[^"]*"$/.test(clean)) {
    return `Returns the text value ${clean}.`;
  }

  if (clean === ')') {
    return 'Closes the current function block.';
  }

  if (clean === '),') {
    return 'Closes the current function block and moves to the next argument.';
  }

  if (clean === ',') {
    return 'Separates one argument from the next argument.';
  }

  if (/^[><=]=?/.test(clean) || clean.includes('>') || clean.includes('<') || clean.includes('=')) {
    return 'This is a comparison or condition used by the surrounding function.';
  }

  return 'This line is an argument or part of the surrounding formula logic.';
}

function buildFormulaWalkthrough(formula, functions) {
  const upperFormula = String(formula || '').toUpperCase();
  const steps = [];

  let mainPurpose = 'This formula calculates a result based on the functions, references, and conditions used inside it.';

  if (functions.includes('IF')) {
    mainPurpose = 'This formula uses IF logic to return different results depending on one or more conditions.';
    steps.push('It checks a condition first. If the condition is TRUE, it returns one result; if FALSE, it returns another result.');
  }

  if (functions.includes('IFERROR')) {
    steps.push('It uses IFERROR to handle errors. If the main calculation fails, the formula returns an alternate value instead of showing an Excel error.');
  }

  if (functions.includes('AND')) {
    steps.push('It uses AND to require multiple conditions to be TRUE at the same time.');
  }

  if (functions.includes('OR')) {
    steps.push('It uses OR to allow at least one condition to be TRUE.');
  }

  if (functions.includes('SUM')) {
    steps.push('It uses SUM to add numbers or values from a range.');
  }

  if (functions.includes('SUMIF') || functions.includes('SUMIFS')) {
    steps.push('It uses conditional summing, meaning values are added only when matching criteria are satisfied.');
  }

  if (functions.includes('VLOOKUP')) {
    steps.push('It uses VLOOKUP to search for a value in the first column of a table and return a related value from another column.');
  }

  if (functions.includes('XLOOKUP')) {
    steps.push('It uses XLOOKUP to search for a value and return a matching result from another range.');
  }

  if (functions.includes('INDEX') && functions.includes('MATCH')) {
    steps.push('It uses INDEX and MATCH together to find a matching position and return a value from another range.');
  }

  if (functions.includes('INDIRECT')) {
    steps.push('It uses INDIRECT to convert text into an actual cell or range reference. This is often used for dynamic ranges.');
  }

  if (functions.includes('ROW')) {
    steps.push('It uses ROW to get a row number, often to build dynamic cell references such as G2808 or H2809.');
  }

  if (upperFormula.includes('<>""')) {
    steps.push('It checks whether a cell is not blank. If the checked cell is blank, the formula may return blank or skip calculation.');
  }

  if (upperFormula.includes('&')) {
    steps.push('It joins text pieces using &, which may be used to build cell references, labels, or dynamic range text.');
  }

  if (upperFormula.includes('""')) {
    steps.push('It returns a blank value in at least one case, usually to keep the worksheet clean when there is no data.');
  }

  const refs = detectCellReferences(formula);
  if (refs.length) {
    steps.push(`It uses these cell references: ${refs.slice(0, 12).join(', ')}${refs.length > 12 ? ', and more' : ''}.`);
  }

  if (!steps.length) {
    steps.push('The formula appears to use basic references, operators, or text. Add a more complex formula to see a deeper walkthrough.');
  }

  steps.push('For complex formulas, a helper-column method may be easier to maintain than one very long nested formula.');

  return { mainPurpose, steps };
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
const textarea = { width: '100%', minHeight: '300px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '16px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace' };
const outputBox = { minHeight: '300px', maxHeight: '520px', overflow: 'auto', background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' };
const controls = { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginTop: '18px' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.78rem', fontWeight: 900 };
const inputStyle = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '12px' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '13px 18px', fontWeight: 900, cursor: 'pointer' };
const smallBtn = { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '12px', padding: '9px 12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem' };
const validBadge = { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const errorBadge = { color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 900 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' };
const statCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' };
const functionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '18px' };
const patternSummary = { color: '#fff', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.7, marginTop: '18px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' };
const patternList = { display: 'grid', gap: '12px', marginTop: '16px', width: '100%' };
const patternItem = { color: '#cbd5e1', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', lineHeight: 1.7, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' };
const detailOverall = { color: '#fff', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', lineHeight: 1.7, marginTop: '18px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' };
const detailList = { display: 'grid', gap: '12px', marginTop: '16px', width: '100%' };
const detailItem = { color: '#cbd5e1', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px', lineHeight: 1.7, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' };
const lineExplainWrap = { display: 'grid', gap: '12px', marginTop: '18px' };
const lineExplainRow = { display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 1.4fr', gap: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px' };
const formulaLine = { color: '#38bdf8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.88rem' };
const lineMeaning = { color: '#cbd5e1', margin: 0, lineHeight: 1.6 };
const walkGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '18px' };
const walkCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '18px', color: '#cbd5e1' };
const walkList = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '20px', margin: 0 };
const noteBox = { marginTop: '16px', color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '16px', padding: '14px', lineHeight: 1.6 };

const functionCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '18px', color: '#cbd5e1' };
const syntaxText = { color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 };
const miniList = { color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.7, paddingLeft: '18px' };
const mutedText = { color: '#94a3b8' };
const contentSection = { marginTop: '70px', color: '#cbd5e1', lineHeight: 1.8 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const listStyle = { color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '22px' };
const toast = { position: 'fixed', top: '86px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, zIndex: 1000 };

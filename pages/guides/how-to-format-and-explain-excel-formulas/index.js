import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function ExcelFormulaGuide() {
  return (
    <ToolboxLayout
      title="How to Format and Explain Excel Formulas"
      description="A complete guide to formatting and understanding Excel formulas. Learn IF, IFERROR, AND, SUMIFS, VLOOKUP, XLOOKUP, INDEX MATCH, INDIRECT, nested formulas and troubleshooting tips."
    >
      <article style={wrap}>
        <p style={eyebrow}>Excel formula guide</p>
        <h1 style={title}>How to Format and Explain Excel Formulas</h1>

        <p style={intro}>
          Excel formulas can be simple, such as adding two cells, or very complex, with nested IF statements, lookups,
          dynamic ranges, error handling and many levels of brackets. When a formula grows too long, it becomes difficult
          to read, explain, audit and fix. This guide explains how to format Excel formulas, understand each function,
          read nested logic and troubleshoot common formula issues.
        </p>

        <p>
          This guide is useful for spreadsheet users, accountants, inventory teams, students, data users, office staff and
          anyone who receives Excel files with formulas they did not create. It is also helpful when you want to explain a
          formula to someone else or document how a worksheet works.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Need to understand a formula now?</strong>
            <p style={ctaText}>Paste your formula into the Excel Formula tool to format it and get a detailed explanation.</p>
          </div>
          <Link href="/excelformula" style={cta}>Open Excel Formula Explainer →</Link>
        </div>

        <h2>Why Excel formulas become hard to read</h2>
        <p>
          Formulas become difficult when many calculations are combined into one line. A short formula such as
          <strong> =SUM(A1:A10)</strong> is easy to understand. But a long formula with IF, IFERROR, AND, INDIRECT and
          lookup functions can become confusing because every comma, bracket and argument matters.
        </p>

        <p>Common reasons formulas become hard to understand include:</p>

        <ul style={list}>
          <li>Too many nested functions inside one formula.</li>
          <li>Several logical tests joined together.</li>
          <li>Lookups that use large table ranges.</li>
          <li>Dynamic ranges built using text and INDIRECT.</li>
          <li>Error handling that hides the real error.</li>
          <li>References to helper cells on other rows or sheets.</li>
          <li>Long formulas written on one line without indentation.</li>
        </ul>

        <h2>Why formatting a formula helps</h2>
        <p>
          Formula formatting does not change the calculation. It only changes the visual layout so the formula becomes
          easier to read. A formatted formula separates functions, arguments and nested blocks into multiple lines.
        </p>

        <h3>One-line formula</h3>
        <pre style={code}>{`=IF(A2<>"",IFERROR(VLOOKUP(A2,Sheet2!$A$2:$D$100,4,FALSE),"Not Found"),"")`}</pre>

        <h3>Formatted formula</h3>
        <pre style={code}>{`=IF(
  A2<>"",
  IFERROR(
    VLOOKUP(
      A2,
      Sheet2!$A$2:$D$100,
      4,
      FALSE
    ),
    "Not Found"
  ),
  ""
)`}</pre>

        <p>
          The formatted version is easier to inspect because you can see the main IF condition, the IFERROR section, the
          VLOOKUP arguments and the final blank result separately.
        </p>

        <h2>How to read an Excel formula step by step</h2>

        <h3>Step 1: Identify the outer function</h3>
        <p>
          Start with the outermost function. In many complex formulas, the outer function controls the main decision. For
          example:
        </p>

        <pre style={code}>{`=IF(A2<>"", calculation, "")`}</pre>

        <p>
          This means: if A2 is not blank, run the calculation. Otherwise, return blank. Understanding the outer function
          gives you the main purpose before you look at the smaller parts.
        </p>

        <h3>Step 2: Separate function arguments</h3>
        <p>
          Most Excel functions use arguments separated by commas. For IF, the three main arguments are logical test, value
          if TRUE and value if FALSE.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>IF argument</th>
                <th style={th}>Meaning</th>
                <th style={th}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Logical test</td>
                <td style={td}>The condition Excel checks.</td>
                <td style={td}>A2&lt;&gt;&quot;&quot;</td>
              </tr>
              <tr>
                <td style={td}>Value if TRUE</td>
                <td style={td}>What Excel returns if the test is true.</td>
                <td style={td}>VLOOKUP(...)</td>
              </tr>
              <tr>
                <td style={td}>Value if FALSE</td>
                <td style={td}>What Excel returns if the test is false.</td>
                <td style={td}>&quot;&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Step 3: Explain each condition</h3>
        <p>
          Conditions are often easier than they look. For example, <strong>A2&lt;&gt;&quot;&quot;</strong> simply means A2 is not
          blank. <strong>B2&gt;0</strong> means B2 is greater than zero. <strong>A2=&quot;&quot;</strong> means A2 is blank.
        </p>

        <h3>Step 4: Read nested functions inside out</h3>
        <p>
          After you understand the outer function, move inward. If an IF contains IFERROR, explain IFERROR next. If
          IFERROR contains VLOOKUP, explain VLOOKUP after that. This approach prevents confusion.
        </p>

        <h2>Common Excel functions explained</h2>

        <div style={grid}>
          <div style={card}>
            <h3>IF</h3>
            <p>Checks a condition and returns one result if TRUE and another result if FALSE.</p>
          </div>
          <div style={card}>
            <h3>IFS</h3>
            <p>Checks multiple conditions in order and returns the result for the first TRUE condition.</p>
          </div>
          <div style={card}>
            <h3>IFERROR</h3>
            <p>Returns a fallback value if the main calculation causes an error.</p>
          </div>
          <div style={card}>
            <h3>AND</h3>
            <p>Returns TRUE only when all conditions are TRUE.</p>
          </div>
          <div style={card}>
            <h3>OR</h3>
            <p>Returns TRUE when at least one condition is TRUE.</p>
          </div>
          <div style={card}>
            <h3>SUM</h3>
            <p>Adds numbers or values from a range.</p>
          </div>
          <div style={card}>
            <h3>SUMIF / SUMIFS</h3>
            <p>Adds values that meet one or more conditions.</p>
          </div>
          <div style={card}>
            <h3>COUNTIF / COUNTIFS</h3>
            <p>Counts cells that meet one or more conditions.</p>
          </div>
          <div style={card}>
            <h3>VLOOKUP</h3>
            <p>Searches the first column of a table and returns a value from another column.</p>
          </div>
          <div style={card}>
            <h3>XLOOKUP</h3>
            <p>Searches one range and returns a matching value from another range.</p>
          </div>
          <div style={card}>
            <h3>INDEX MATCH</h3>
            <p>Uses MATCH to find a position and INDEX to return the value at that position.</p>
          </div>
          <div style={card}>
            <h3>INDIRECT</h3>
            <p>Converts text into an actual cell reference or range reference.</p>
          </div>
        </div>

        <h2>How to understand logical tests</h2>
        <p>
          Logical tests compare values. They return TRUE or FALSE. Once you understand the comparison symbols, many Excel
          formulas become easier to read.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Expression</th>
                <th style={th}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={td}>A2=&quot;&quot;</td><td style={td}>A2 is blank.</td></tr>
              <tr><td style={td}>A2&lt;&gt;&quot;&quot;</td><td style={td}>A2 is not blank.</td></tr>
              <tr><td style={td}>B2&gt;0</td><td style={td}>B2 is greater than zero.</td></tr>
              <tr><td style={td}>C2&lt;=100</td><td style={td}>C2 is less than or equal to 100.</td></tr>
              <tr><td style={td}>D2=&quot;Paid&quot;</td><td style={td}>D2 equals the text “Paid”.</td></tr>
              <tr><td style={td}>E2&lt;&gt;F2</td><td style={td}>E2 is not equal to F2.</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Example: IF with VLOOKUP</h2>
        <pre style={code}>{`=IF(
  A2<>"",
  VLOOKUP(
    A2,
    Sheet2!$A$2:$D$100,
    4,
    FALSE
  ),
  "Not Found"
)`}</pre>

        <p>
          This formula checks whether A2 is not blank. If A2 has a value, it searches for A2 in the first column of
          Sheet2!$A$2:$D$100 and returns the value from the fourth column. If A2 is blank, it returns “Not Found”.
        </p>

        <h2>Example: IFERROR with lookup</h2>
        <pre style={code}>{`=IFERROR(
  XLOOKUP(
    A2,
    Products[SKU],
    Products[Price]
  ),
  "Missing"
)`}</pre>

        <p>
          This formula searches for the value in A2 inside the Products SKU column and returns the matching price. If the
          lookup fails or causes an error, it returns “Missing”. IFERROR is useful for user-friendly output, but it can
          also hide the original error, so use it carefully.
        </p>

        <h2>Example: Dynamic range with INDIRECT</h2>
        <pre style={code}>{`=SUM(
  INDIRECT(
    "G"&ROW()&":G"&ROW()+5
  )
)`}</pre>

        <p>
          This formula builds a range reference as text, such as G10:G15, then INDIRECT converts that text into a real
          Excel range. SUM then adds the values in that range. INDIRECT is powerful, but it can make formulas harder to
          audit because the referenced range is built dynamically.
        </p>

        <h2>Why IFERROR needs careful explanation</h2>
        <p>
          IFERROR catches errors and returns a fallback value. This is useful when you want a clean sheet, but it can hide
          problems such as invalid ranges, missing lookup values, wrong data types or broken references. When explaining a
          formula, always say what calculation IFERROR is trying first and what it returns if that calculation fails.
        </p>

        <h2>Common Excel formula errors</h2>
        <div style={grid}>
          <div style={card}>
            <h3>#N/A</h3>
            <p>Often means a lookup value was not found.</p>
          </div>
          <div style={card}>
            <h3>#VALUE!</h3>
            <p>Often means the formula used the wrong data type, such as text where a number was expected.</p>
          </div>
          <div style={card}>
            <h3>#REF!</h3>
            <p>Usually means the formula refers to a deleted or invalid cell reference.</p>
          </div>
          <div style={card}>
            <h3>#DIV/0!</h3>
            <p>Means the formula tried to divide by zero or a blank value.</p>
          </div>
          <div style={card}>
            <h3>#NAME?</h3>
            <p>Often means Excel does not recognize a function name, named range or text value.</p>
          </div>
          <div style={card}>
            <h3>#SPILL!</h3>
            <p>Can happen with dynamic array formulas when output cells are blocked.</p>
          </div>
        </div>

        <h2>Best practices for writing formulas</h2>
        <ul style={list}>
          <li>Use clear helper columns when one formula becomes too complex.</li>
          <li>Use absolute references such as $A$2:$D$100 when copied formulas should keep the same range.</li>
          <li>Use meaningful sheet names and table names.</li>
          <li>Do not hide all errors with IFERROR unless you understand what errors are possible.</li>
          <li>Break long formulas into smaller parts during troubleshooting.</li>
          <li>Test formulas with blank values, zero values, missing lookups and normal cases.</li>
          <li>Document important formulas if other people will use the workbook.</li>
        </ul>

        <h2>How the Excel Formula Explainer helps</h2>
        <p>
          The <Link href="/excelformula" style={inlineLink}>Excel Formula Explainer</Link> is designed to help users
          format and understand formulas more easily. It can make formulas more readable, detect common Excel functions,
          explain logical tests, describe nested IF and IFERROR logic and provide a practical walkthrough. It is especially
          useful when a formula is copied from a workbook and you want to understand what it is doing before editing it.
        </p>

        <h2>When a formula should be simplified</h2>
        <p>
          Not every complex formula should stay complex. If a formula is very long, difficult to audit and used across
          many rows, a helper-column method may be better. Helper columns can make logic easier to check, especially for
          grouped totals, dynamic ranges and multi-step business rules.
        </p>

        <h2>Final checklist for understanding a formula</h2>
        <ul style={list}>
          <li>Format the formula into readable lines.</li>
          <li>Identify the outer function.</li>
          <li>Separate the main arguments.</li>
          <li>Explain each logical test in simple words.</li>
          <li>Identify lookup ranges and return columns.</li>
          <li>Check whether IFERROR is hiding a real error.</li>
          <li>Look for dynamic references created with INDIRECT.</li>
          <li>Test the formula with example values.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Does formatting a formula change the result?</h3>
            <p>No. Formatting only changes how the formula is displayed. The calculation stays the same.</p>
          </div>
          <div style={card}>
            <h3>Why are nested IF formulas difficult?</h3>
            <p>They contain several conditions and results inside each other, making it hard to see which part belongs where.</p>
          </div>
          <div style={card}>
            <h3>Is IFERROR always good?</h3>
            <p>No. It is useful for clean output, but it can hide errors that should be fixed.</p>
          </div>
          <div style={card}>
            <h3>Should I use helper columns?</h3>
            <p>Yes, when a formula becomes too long or difficult for others to maintain.</p>
          </div>
        </div>
      </article>
    </ToolboxLayout>
  );
}

const wrap = { maxWidth: '940px', margin: '0 auto', padding: '50px 20px 90px', color: '#cbd5e1', lineHeight: 1.8 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1 };
const intro = { fontSize: '1.12rem', color: '#e2e8f0' };
const ctaBox = { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '22px', margin: '30px 0' };
const ctaText = { margin: '6px 0 0', color: '#94a3b8' };
const cta = { color: '#0f172a', background: '#38bdf8', padding: '12px 16px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' };
const inlineLink = { color: '#38bdf8', fontWeight: 900 };
const code = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '16px', overflow: 'auto', color: '#e2e8f0' };
const list = { paddingLeft: '24px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '680px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

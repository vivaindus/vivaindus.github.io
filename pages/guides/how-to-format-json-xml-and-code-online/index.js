import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function FormatCodeGuide() {
  return (
    <ToolboxLayout
      title="How to Format JSON, XML and Code Online"
      description="A complete guide to formatting JSON, XML, SQL, HTML, CSS, JavaScript, Apps Script, VBA and code snippets online. Learn validation, beautifying, minifying, errors and best practices."
    >
      <article style={wrap}>
        <p style={eyebrow}>Code formatting guide</p>
        <h1 style={title}>How to Format JSON, XML and Code Online</h1>

        <p style={intro}>
          JSON, XML and code snippets are often copied from APIs, logs, websites, database tools, browser consoles,
          spreadsheets, documentation pages or automation scripts. When the content is minified, compressed or badly
          indented, it becomes difficult to read and easy to break. A formatter turns messy text into structured,
          readable output so you can inspect it, debug it and share it more confidently.
        </p>

        <p>
          This guide explains how to format JSON, XML and common code snippets online, what each formatting option means,
          how to identify common errors and how to use SHB ToolBox tools for cleaner development and data workflows.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Format your data or code now</strong>
            <p style={ctaText}>Use dedicated tools for JSON, XML and general code formatting.</p>
          </div>
          <div style={ctaLinks}>
            <Link href="/jsonformatter" style={cta}>JSON Formatter →</Link>
            <Link href="/xmlformatter" style={cta}>XML Formatter →</Link>
            <Link href="/codeformatter" style={cta}>Code Formatter →</Link>
          </div>
        </div>

        <h2>Why formatting matters</h2>
        <p>
          Formatting does not usually change the meaning of the data or code. It changes the visual structure. Indentation,
          line breaks and spacing help humans understand what belongs together. This is especially important for nested
          JSON objects, XML tags, SQL queries, HTML structures and long script snippets.
        </p>

        <p>Good formatting helps you:</p>
        <ul style={list}>
          <li>Find missing commas, brackets, quotes or closing tags.</li>
          <li>Understand nested data structures more quickly.</li>
          <li>Share code with another person in a readable way.</li>
          <li>Review API responses and configuration files.</li>
          <li>Compare before and after changes.</li>
          <li>Prepare code snippets for documentation, support tickets or debugging.</li>
        </ul>

        <h2>JSON formatting explained</h2>
        <p>
          JSON is widely used in APIs, web apps, configuration files, browser storage, automation tools and JavaScript
          projects. JSON uses objects, arrays, strings, numbers, booleans and null values. A small mistake, such as a
          missing comma or an extra trailing comma, can make JSON invalid.
        </p>

        <h3>Minified JSON example</h3>
        <pre style={code}>{`{"orderId":1001,"customer":{"name":"John","city":"Dubai"},"items":[{"sku":"A1","qty":2},{"sku":"B2","qty":1}]}`}</pre>

        <h3>Formatted JSON example</h3>
        <pre style={code}>{`{
  "orderId": 1001,
  "customer": {
    "name": "John",
    "city": "Dubai"
  },
  "items": [
    {
      "sku": "A1",
      "qty": 2
    },
    {
      "sku": "B2",
      "qty": 1
    }
  ]
}`}</pre>

        <p>
          The formatted version is easier to inspect because nested objects and arrays are clearly separated. You can see
          that customer is an object and items is an array of objects.
        </p>

        <h2>How to use the JSON Formatter</h2>
        <ol style={list}>
          <li>Open the <Link href="/jsonformatter" style={inlineLink}>JSON Formatter</Link>.</li>
          <li>Paste your JSON data into the input box.</li>
          <li>Click format or use the available formatting option.</li>
          <li>Check for validation errors if the JSON is invalid.</li>
          <li>Copy or download the formatted output.</li>
          <li>Use minify if you need compact JSON for storage or transfer.</li>
        </ol>

        <h2>Common JSON errors</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Missing comma</h3>
            <p>JSON values inside an object or array must be separated by commas.</p>
          </div>
          <div style={card}>
            <h3>Trailing comma</h3>
            <p>JSON does not allow a comma after the final item in an object or array.</p>
          </div>
          <div style={card}>
            <h3>Single quotes</h3>
            <p>JSON strings and keys must use double quotes, not single quotes.</p>
          </div>
          <div style={card}>
            <h3>Unquoted keys</h3>
            <p>Object keys must be quoted in valid JSON.</p>
          </div>
          <div style={card}>
            <h3>Broken brackets</h3>
            <p>Every opening bracket or brace must have a matching closing bracket or brace.</p>
          </div>
          <div style={card}>
            <h3>Invalid comments</h3>
            <p>Standard JSON does not support comments like // or /* */.</p>
          </div>
        </div>

        <h2>XML formatting explained</h2>
        <p>
          XML is used in feeds, documents, configuration files, integrations, invoices, legacy systems, sitemaps and many
          business data formats. XML uses tags, attributes and nested elements. Formatting XML makes it easier to see the
          parent-child structure.
        </p>

        <h3>Unformatted XML example</h3>
        <pre style={code}>{`<order><id>1001</id><customer city="Dubai">John</customer><total>250</total></order>`}</pre>

        <h3>Formatted XML example</h3>
        <pre style={code}>{`<order>
  <id>1001</id>
  <customer city="Dubai">John</customer>
  <total>250</total>
</order>`}</pre>

        <p>
          The formatted XML clearly shows that id, customer and total belong inside order. This makes troubleshooting much
          easier when files contain many levels of nesting.
        </p>

        <h2>How to use the XML Formatter</h2>
        <ol style={list}>
          <li>Open the <Link href="/xmlformatter" style={inlineLink}>XML Formatter</Link>.</li>
          <li>Paste XML data into the input area.</li>
          <li>Format it to add indentation and line breaks.</li>
          <li>Check for missing closing tags or incorrect nesting.</li>
          <li>Copy or download the cleaned XML output.</li>
        </ol>

        <h2>Common XML errors</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Missing closing tag</h3>
            <p>Every opened tag should usually have a matching closing tag.</p>
          </div>
          <div style={card}>
            <h3>Incorrect nesting</h3>
            <p>Tags must close in the correct order. Inner tags should close before outer tags.</p>
          </div>
          <div style={card}>
            <h3>Invalid attribute quotes</h3>
            <p>Attribute values should be quoted properly, usually with double quotes.</p>
          </div>
          <div style={card}>
            <h3>Special characters</h3>
            <p>Characters like &amp; may need escaping in XML content.</p>
          </div>
        </div>

        <h2>Code formatting explained</h2>
        <p>
          Code formatting is useful when you copy code from an email, documentation page, browser console, SQL editor,
          spreadsheet cell or AI response. A formatter can improve readability by adding indentation and line breaks.
          This helps with SQL, HTML, CSS, JavaScript, Apps Script, VBA and other scripts.
        </p>

        <h2>How to use the Code Formatter</h2>
        <ol style={list}>
          <li>Open the <Link href="/codeformatter" style={inlineLink}>Code Formatter</Link>.</li>
          <li>Choose the language or let the app detect the type where available.</li>
          <li>Paste your code snippet.</li>
          <li>Format the code to improve indentation and readability.</li>
          <li>Review the result carefully before using it in production.</li>
          <li>Copy or download the formatted code.</li>
        </ol>

        <h2>SQL formatting example</h2>
        <p>
          SQL queries often become difficult to read when SELECT fields, JOIN clauses and WHERE conditions are written on
          one line. Formatting separates each part of the query.
        </p>

        <pre style={code}>{`SELECT
  T0."DocNum",
  T0."DocDate",
  T1."ItemCode",
  T1."Quantity"
FROM
  OPDN T0
INNER JOIN
  PDN1 T1 ON T0."DocEntry" = T1."DocEntry"
WHERE
  T0."DocDate" BETWEEN [%0] AND [%1]
ORDER BY
  T0."DocDate";`}</pre>

        <p>
          This is easier to read because the selected columns, table joins, condition and ordering are clearly separated.
        </p>

        <h2>Formatting vs validating vs fixing</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Action</th>
                <th style={th}>What it does</th>
                <th style={th}>What it does not do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Formatting</td>
                <td style={td}>Improves layout, indentation and readability.</td>
                <td style={td}>Does not guarantee the logic is correct.</td>
              </tr>
              <tr>
                <td style={td}>Validation</td>
                <td style={td}>Checks whether the structure is valid, such as JSON syntax.</td>
                <td style={td}>Does not confirm business meaning is correct.</td>
              </tr>
              <tr>
                <td style={td}>Fixing</td>
                <td style={td}>Requires understanding the actual error and intended result.</td>
                <td style={td}>Should not be fully automatic for important code.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Minify vs beautify</h2>
        <p>
          Beautifying makes content easier for humans to read. Minifying makes content smaller by removing unnecessary
          spaces and line breaks. Use beautify when debugging or reviewing. Use minify when you need compact output for a
          file, API or website.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Beautify</h3>
            <p>Adds line breaks and indentation. Best for reading, debugging and sharing.</p>
          </div>
          <div style={card}>
            <h3>Minify</h3>
            <p>Removes extra spaces and line breaks. Best for compact storage or transfer.</p>
          </div>
        </div>

        <h2>Privacy and safety tips</h2>
        <p>
          Before pasting code or data into any online tool, check whether it contains secrets. Avoid sharing passwords,
          private API keys, access tokens, customer records or confidential business data. For sensitive data, remove or
          mask private values before formatting.
        </p>

        <ul style={list}>
          <li>Remove API keys before sharing code snippets.</li>
          <li>Do not paste live passwords or private credentials.</li>
          <li>Mask customer phone numbers and emails if not needed.</li>
          <li>Keep backups of original code before editing.</li>
          <li>Review formatted output before using it in production.</li>
        </ul>

        <h2>Common use cases</h2>
        <div style={grid}>
          <div style={card}>
            <h3>API response review</h3>
            <p>Format JSON returned by an API to inspect fields, arrays and nested objects.</p>
          </div>
          <div style={card}>
            <h3>Configuration cleanup</h3>
            <p>Format JSON or XML configuration files before editing.</p>
          </div>
          <div style={card}>
            <h3>SQL query sharing</h3>
            <p>Format SQL queries before sending them to a colleague or support team.</p>
          </div>
          <div style={card}>
            <h3>Apps Script or VBA review</h3>
            <p>Clean pasted script snippets before editing or saving them.</p>
          </div>
          <div style={card}>
            <h3>HTML and CSS snippets</h3>
            <p>Make copied website code easier to inspect and modify.</p>
          </div>
          <div style={card}>
            <h3>Error investigation</h3>
            <p>Use formatting to find missing brackets, broken tags or misplaced commas.</p>
          </div>
        </div>

        <h2>Best practices before using formatted output</h2>
        <ul style={list}>
          <li>Check that the formatter did not change string values.</li>
          <li>Validate JSON before sending it to an API.</li>
          <li>Test SQL queries in a safe environment before running on real data.</li>
          <li>Use version control or backups for important code.</li>
          <li>Do not assume formatted code is automatically correct.</li>
          <li>Use a dedicated validator when strict compliance matters.</li>
        </ul>

        <h2>Final checklist</h2>
        <ul style={list}>
          <li>Choose the correct formatter: JSON, XML or code.</li>
          <li>Paste only the content that needs formatting.</li>
          <li>Remove sensitive values before using online tools.</li>
          <li>Review validation errors carefully.</li>
          <li>Copy or download the output only after checking it.</li>
          <li>Test code before using it in production.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Does formatting change my code?</h3>
            <p>Formatting should mainly change spacing and indentation, but always review output before using it.</p>
          </div>
          <div style={card}>
            <h3>Why is my JSON invalid?</h3>
            <p>Common reasons include missing commas, single quotes, trailing commas or unclosed brackets.</p>
          </div>
          <div style={card}>
            <h3>Can XML be formatted if tags are broken?</h3>
            <p>Badly broken XML may need fixing before it can be formatted correctly.</p>
          </div>
          <div style={card}>
            <h3>Should I paste API keys into a formatter?</h3>
            <p>No. Remove private keys, tokens and passwords before using any online formatting tool.</p>
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
const ctaLinks = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
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

import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function CsvGuide() {
  return (
    <ToolboxLayout
      title="How to Convert CSV to Excel and JSON Online"
      description="A complete guide to converting CSV files to Excel XLSX and JSON online. Learn CSV headers, delimiters, Excel output, JSON objects, JSON arrays, common CSV errors and best practices."
    >
      <article style={wrap}>
        <p style={eyebrow}>CSV conversion guide</p>
        <h1 style={title}>How to Convert CSV to Excel and JSON Online</h1>

        <p style={intro}>
          CSV files are used everywhere: product exports, inventory lists, accounting reports, customer lists, bank
          statements, analytics downloads, order reports, supplier price lists, shipping data and database exports. CSV is
          simple and flexible, but it is not always comfortable to read or use directly. That is why many users convert CSV
          to Excel for spreadsheet work, or CSV to JSON for apps, APIs, websites and automation.
        </p>

        <p>
          This guide explains how CSV files work, when to convert CSV to Excel, when to convert CSV to JSON, how headers
          and delimiters affect the result, how to avoid broken columns, and how to prepare clean data before using it in
          business or development workflows.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Convert your CSV now</strong>
            <p style={ctaText}>Use the CSV tools to preview, clean and download your converted output.</p>
          </div>
          <div style={ctaLinks}>
            <Link href="/csvtoexcel" style={cta}>Open CSV to Excel →</Link>
            <Link href="/csvtojson" style={cta}>Open CSV to JSON →</Link>
          </div>
        </div>

        <h2>What is a CSV file?</h2>
        <p>
          CSV stands for comma-separated values. It is a plain text format used to store table-like data. Each line is
          usually one row, and each value in the row is separated by a delimiter. The delimiter is often a comma, but some
          systems use semicolon, tab or pipe.
        </p>

        <pre style={code}>{`Item Code,Item Name,Price,Stock
SHB-1001,Premium Tray,305,12
SHB-1002,Kids Dress,35,40
SHB-1003,Co-ord Set,45,22`}</pre>

        <p>
          The first row often contains headers. Headers describe what each column means. In the example above, the headers
          are Item Code, Item Name, Price and Stock.
        </p>

        <h2>CSV to Excel vs CSV to JSON: which one should you choose?</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Conversion</th>
                <th style={th}>Best for</th>
                <th style={th}>Typical users</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>CSV to Excel</td>
                <td style={td}>Viewing, filtering, editing, sharing and reporting spreadsheet data.</td>
                <td style={td}>Business users, accountants, inventory teams, ecommerce teams, office staff.</td>
              </tr>
              <tr>
                <td style={td}>CSV to JSON</td>
                <td style={td}>Using table data in APIs, apps, scripts, websites, dashboards and automation.</td>
                <td style={td}>Developers, data users, automation users, technical teams.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>When should you convert CSV to Excel?</h2>
        <p>
          Convert CSV to Excel when you want to work with the data in a spreadsheet. Excel format is easier for many
          people because it opens in a familiar workbook layout. It can preserve columns clearly, support filters, allow
          formulas, make data easier to review and create a cleaner file for sharing.
        </p>

        <h3>CSV to Excel is useful for:</h3>
        <ul style={list}>
          <li>Opening product exports in a readable workbook.</li>
          <li>Sharing inventory reports with staff or suppliers.</li>
          <li>Reviewing order lists and sales reports.</li>
          <li>Cleaning customer lists before upload.</li>
          <li>Preparing data for manual editing.</li>
          <li>Converting raw CSV downloads into a more professional file.</li>
        </ul>

        <h2>How to use the CSV to Excel tool</h2>
        <ol style={list}>
          <li>Open the <Link href="/csvtoexcel" style={inlineLink}>CSV to Excel tool</Link>.</li>
          <li>Upload or paste your CSV data.</li>
          <li>Check whether the columns are detected correctly.</li>
          <li>Preview the table output before downloading.</li>
          <li>Download the generated XLSX file.</li>
          <li>Open it in Excel, Google Sheets, LibreOffice or another spreadsheet app.</li>
        </ol>

        <p>
          The most important step is previewing the data. If all values appear in one column, the delimiter may be wrong.
          If product names break into multiple columns, the original CSV may need proper quotes around values that contain
          commas.
        </p>

        <h2>When should you convert CSV to JSON?</h2>
        <p>
          Convert CSV to JSON when the data needs to be used by software. JSON is common in web apps, APIs, JavaScript,
          Node.js, Python scripts, dashboards, browser storage and automation workflows. JSON gives each record a clear
          structure that programs can read easily.
        </p>

        <h3>CSV to JSON is useful for:</h3>
        <ul style={list}>
          <li>Preparing product data for a custom app.</li>
          <li>Sending spreadsheet data to an API.</li>
          <li>Creating sample data for development.</li>
          <li>Converting exported reports into structured records.</li>
          <li>Using CSV data in JavaScript or Apps Script.</li>
          <li>Building dashboards, prototypes or test datasets.</li>
        </ul>

        <h2>How to use the CSV to JSON tool</h2>
        <ol style={list}>
          <li>Open the <Link href="/csvtojson" style={inlineLink}>CSV to JSON tool</Link>.</li>
          <li>Paste or upload your CSV data.</li>
          <li>Choose whether the first row should be treated as headers.</li>
          <li>Select the JSON output style if the tool provides options.</li>
          <li>Preview the JSON output.</li>
          <li>Copy or download the JSON file.</li>
        </ol>

        <h2>JSON objects vs JSON arrays</h2>
        <p>
          The most common CSV to JSON format is an array of objects. Each row becomes one object, and each column header
          becomes a key.
        </p>

        <pre style={code}>{`[
  {
    "Item Code": "SHB-1001",
    "Item Name": "Premium Tray",
    "Price": "305",
    "Stock": "12"
  },
  {
    "Item Code": "SHB-1002",
    "Item Name": "Kids Dress",
    "Price": "35",
    "Stock": "40"
  }
]`}</pre>

        <p>
          This format is easy to read because every value has a name. It is usually best for APIs, apps and automation.
          Another possible format is an array of arrays, where each row is just a list of values. That format is more
          compact, but harder to understand because the meaning depends on column position.
        </p>

        <h2>Understanding CSV headers</h2>
        <p>
          Headers are very important when converting CSV to JSON. If the first row contains headers, the JSON keys come
          from that row. If headers are missing, the converter may create generic column names or output arrays instead of
          objects.
        </p>

        <h3>Good headers</h3>
        <pre style={code}>{`Product Code,Product Name,Price,Quantity`}</pre>

        <h3>Weak headers</h3>
        <pre style={code}>{`Column1,Column2,Column3,Column4`}</pre>

        <p>
          Good headers make the output useful. Weak headers make the JSON harder to understand and maintain.
        </p>

        <h2>Understanding delimiters</h2>
        <p>
          A delimiter is the character that separates columns. Most CSV files use commas, but not all. Some regions and
          systems use semicolons because comma may be used as a decimal separator. Some exports use tab-separated values.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Comma delimiter</h3>
            <p>Most common format. Example: name,price,stock</p>
          </div>
          <div style={card}>
            <h3>Semicolon delimiter</h3>
            <p>Common in some regional spreadsheet exports. Example: name;price;stock</p>
          </div>
          <div style={card}>
            <h3>Tab delimiter</h3>
            <p>Often used when values contain many commas. It is sometimes called TSV.</p>
          </div>
          <div style={card}>
            <h3>Pipe delimiter</h3>
            <p>Used in some technical exports. Example: name|price|stock</p>
          </div>
        </div>

        <h2>Common CSV problems and how to fix them</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Everything appears in one column</h3>
            <p>The delimiter may be wrong. Try comma, semicolon, tab or pipe depending on the file source.</p>
          </div>
          <div style={card}>
            <h3>Product names break columns</h3>
            <p>If a value contains commas, it should be wrapped in quotes, like "Premium Tray, Large".</p>
          </div>
          <div style={card}>
            <h3>JSON keys look wrong</h3>
            <p>Check the first row. It should contain clean headers if you want an array of objects.</p>
          </div>
          <div style={card}>
            <h3>Special characters look broken</h3>
            <p>Save or export the CSV as UTF-8 when possible.</p>
          </div>
          <div style={card}>
            <h3>Leading zeros disappear</h3>
            <p>Spreadsheet apps may treat codes as numbers. Keep product codes, phone numbers and IDs as text.</p>
          </div>
          <div style={card}>
            <h3>Empty rows appear in output</h3>
            <p>Remove blank rows before converting, especially at the top or bottom of the file.</p>
          </div>
        </div>

        <h2>CSV conversion examples for business</h2>
        <h3>Example 1: Product list</h3>
        <p>
          A shop exports product data as CSV. The team can convert CSV to Excel to check product names, prices and stock.
          A developer can convert the same CSV to JSON to import products into a web app or custom dashboard.
        </p>

        <h3>Example 2: Order report</h3>
        <p>
          An ecommerce order export may contain order number, customer name, city, payment amount and status. CSV to Excel
          is useful for filtering and reviewing. CSV to JSON is useful for sending the data into an internal order tracker.
        </p>

        <h3>Example 3: Barcode label data</h3>
        <p>
          Product codes and label details can be stored in CSV, then uploaded into the <Link href="/barcodegenerator" style={inlineLink}>Barcode Generator</Link>.
          This is useful when creating many barcode labels from a spreadsheet.
        </p>

        <h2>Best practices before converting CSV</h2>
        <ul style={list}>
          <li>Keep the first row as clear headers.</li>
          <li>Remove blank rows before the header row.</li>
          <li>Check that every row has the same number of columns.</li>
          <li>Use quotes for values that contain commas.</li>
          <li>Keep IDs and product codes as text if leading zeros matter.</li>
          <li>Use UTF-8 encoding for better character support.</li>
          <li>Preview the output before using it in another system.</li>
        </ul>

        <h2>When not to use automatic conversion</h2>
        <p>
          Automatic conversion is useful, but some files need manual review. If the CSV contains sensitive financial
          records, legal records, complex formulas, merged spreadsheet cells, or unusual delimiters, review the output
          carefully before using it. CSV does not store formatting, formulas or multiple sheets like an Excel workbook.
        </p>

        <h2>Final checklist</h2>
        <ul style={list}>
          <li>Confirm whether you need Excel or JSON output.</li>
          <li>Check the delimiter.</li>
          <li>Confirm the first row contains correct headers.</li>
          <li>Preview the converted result.</li>
          <li>Download the file and open it before sharing or importing.</li>
          <li>Keep the original CSV as a backup.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Can I convert CSV to Excel online?</h3>
            <p>Yes. Use the CSV to Excel tool to convert CSV data into an XLSX workbook.</p>
          </div>
          <div style={card}>
            <h3>Can I convert CSV to JSON?</h3>
            <p>Yes. Use the CSV to JSON tool to create structured JSON from spreadsheet-style data.</p>
          </div>
          <div style={card}>
            <h3>Why is my CSV in one column?</h3>
            <p>The delimiter may not be comma. Try semicolon, tab or another delimiter depending on the source.</p>
          </div>
          <div style={card}>
            <h3>Does CSV keep Excel formatting?</h3>
            <p>No. CSV stores plain data only. It does not preserve colors, formulas, multiple sheets or formatting.</p>
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

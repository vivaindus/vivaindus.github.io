import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function BarcodeLabelsGuide() {
  return (
    <ToolboxLayout
      title="How to Create and Print Barcode Labels Online"
      description="A complete guide to creating barcode labels online. Learn barcode types, CSV upload, label size, barcode text, print settings, PNG download and common barcode printing mistakes."
    >
      <article style={wrap}>
        <p style={eyebrow}>Barcode printing guide</p>
        <h1 style={title}>How to Create and Print Barcode Labels Online</h1>

        <p style={intro}>
          Barcode labels are used in shops, warehouses, offices, ecommerce stores, inventory rooms, delivery workflows,
          libraries, packaging teams and document management systems. A good barcode label should be easy to scan, easy
          to read, correctly sized for the label paper and clear enough for daily use. This guide explains how to create
          barcode labels online, choose the correct barcode type, prepare label data, upload CSV files, adjust label size,
          download label PNG files and print barcode sheets correctly.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Create barcode labels now</strong>
            <p style={ctaText}>Use the free Barcode Generator to create single labels, bulk labels, CSV labels and printable barcode sheets.</p>
          </div>
          <Link href="/barcodegenerator" style={cta}>Open Barcode Generator →</Link>
        </div>

        <h2>What is a barcode label?</h2>
        <p>
          A barcode label is a printed label that contains a machine-readable barcode and, usually, human-readable text.
          The barcode stores a value such as a SKU, product code, serial number, batch number, location code, invoice
          number or item reference. A scanner reads the barcode and sends that value to a computer, POS system, inventory
          system or spreadsheet.
        </p>
        <p>
          A barcode label can contain only a barcode, or it can include extra printed details such as product name, price,
          size, batch, expiry date, warehouse location or supplier reference. The right layout depends on how the label
          will be used.
        </p>

        <h2>Common uses for barcode labels</h2>
        <ul style={list}>
          <li><strong>Retail products:</strong> Product identification, pricing, checkout and stock control.</li>
          <li><strong>Warehouse inventory:</strong> SKU labels, shelf labels, bin labels and carton labels.</li>
          <li><strong>Asset tracking:</strong> Office equipment, tools, devices, machinery and fixed assets.</li>
          <li><strong>Document tracking:</strong> File numbers, invoice references, delivery notes and internal records.</li>
          <li><strong>Ecommerce operations:</strong> Product picking, packing, returns, stock movement and dispatch labels.</li>
          <li><strong>Manufacturing and packaging:</strong> Batch codes, item references, production runs and carton identification.</li>
        </ul>

        <h2>Step 1: Choose the right barcode type</h2>
        <p>
          The first decision is the barcode type. The barcode type controls what kind of data can be encoded, how large
          the barcode becomes and whether the barcode is suitable for your scanner or software. For many internal business
          workflows, <strong>Code 128</strong> is the best starting point because it supports letters, numbers and many
          symbols while staying compact.
        </p>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Barcode type</th>
                <th style={th}>Best for</th>
                <th style={th}>Important note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Code 128</td>
                <td style={td}>SKUs, product IDs, serial numbers, internal labels, warehouse labels</td>
                <td style={td}>Best general-purpose option for most business labels.</td>
              </tr>
              <tr>
                <td style={td}>Code 39</td>
                <td style={td}>Simple alphanumeric inventory and asset labels</td>
                <td style={td}>Easy to use, but less compact than Code 128.</td>
              </tr>
              <tr>
                <td style={td}>EAN-13 / EAN-8</td>
                <td style={td}>Retail product barcodes</td>
                <td style={td}>Requires valid retail barcode numbers with correct length.</td>
              </tr>
              <tr>
                <td style={td}>UPC-A</td>
                <td style={td}>Retail products, especially North American systems</td>
                <td style={td}>Requires valid 12-digit UPC data.</td>
              </tr>
              <tr>
                <td style={td}>ITF-14</td>
                <td style={td}>Cartons, boxes, outer packaging and logistics</td>
                <td style={td}>Usually uses 14-digit data.</td>
              </tr>
              <tr>
                <td style={td}>QR Code</td>
                <td style={td}>URLs, text, product pages, instructions, contact details</td>
                <td style={td}>Can hold more data than 1D barcodes.</td>
              </tr>
              <tr>
                <td style={td}>Data Matrix / PDF417 / Aztec</td>
                <td style={td}>Compact 2D labels, tickets, IDs, manufacturing and document workflows</td>
                <td style={td}>Useful when more data must fit in a small area.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          If you are unsure which barcode type to choose, use <strong>Code 128</strong> for normal internal labels. Use
          EAN or UPC only when you are working with official retail product numbers. Use QR Code when the value is a URL
          or longer text that would make a 1D barcode too wide.
        </p>

        <h2>Step 2: Prepare your barcode data</h2>
        <p>
          Your barcode value should be clean and consistent. Avoid unnecessary spaces before or after the value. Keep SKU
          formats consistent so staff can recognize them easily. For example, use one format such as SHB-1001, SHB-1002
          and SHB-1003 instead of mixing many styles.
        </p>

        <h3>Simple list format</h3>
        <p>
          Simple list mode is best when you only need barcode values. Enter one barcode value per line. Each line becomes
          one barcode label.
        </p>

        <pre style={code}>{`SHB-1001
SHB-1002
SHB-1003
SHB-1004`}</pre>

        <p>
          In simple list mode, the barcode value is shown inside the barcode image when “Show barcode text” is enabled.
          The value should not be repeated again below the barcode unless you intentionally add extra label text.
        </p>

        <h3>Multi-line label format</h3>
        <p>
          Multi-line label mode is useful when the label needs more information. The first line is the barcode value. The
          remaining lines are printed as label text. A blank line separates one label from the next.
        </p>

        <pre style={code}>{`4108701256100
Premium Tray
Price: 305
Batch: 256100

4108701256117
Premium Tray Large
Price: 425
Batch: 256117`}</pre>

        <p>
          This format is useful for product labels because the barcode can encode the product code, while the printed
          lines show details that staff or customers can read without scanning.
        </p>

        <h2>Step 3: Use CSV upload for bulk barcode labels</h2>
        <p>
          CSV upload is the best method when you need to create many labels from Excel, Google Sheets, an inventory export
          or an ecommerce product list. Instead of typing each label manually, you can prepare rows in a spreadsheet and
          upload the CSV file.
        </p>

        <p>The recommended CSV headers are:</p>

        <pre style={code}>{`Barcode Value,Row1 Text,Row1 Value,Row2 Text,Row2 Value,Row3 Text,Row3 Value,Row4 Text,Row4 Value`}</pre>

        <p>
          The <strong>Barcode Value</strong> column is the value encoded into the barcode. The Row Text and Row Value
          columns are combined into readable label lines. For example, if Row1 Text is “Item” and Row1 Value is “Premium
          Tray”, the label can show “Item: Premium Tray”.
        </p>

        <h3>Example CSV row</h3>
        <pre style={code}>{`Barcode Value,Row1 Text,Row1 Value,Row2 Text,Row2 Value,Row3 Text,Row3 Value
4108701256100,Item,Premium Tray,Price,305,Batch,256100`}</pre>

        <p>
          CSV upload is especially helpful for shops, warehouses and ecommerce stores because product data can be edited
          in a spreadsheet first and then converted into labels quickly.
        </p>

        <h2>Step 4: Adjust barcode design settings</h2>
        <p>
          Barcode design settings control how the barcode looks and how much room is available for label text. The goal is
          to make the barcode easy to scan and the printed details easy to read.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Scale</h3>
            <p>Controls barcode thickness and resolution. Higher scale can make the barcode sharper, but it may also take more space.</p>
          </div>
          <div style={card}>
            <h3>Barcode height</h3>
            <p>Controls the height of 1D barcode bars. Taller bars are usually easier to scan on printed labels.</p>
          </div>
          <div style={card}>
            <h3>Show barcode text</h3>
            <p>Displays the barcode value inside the barcode image when supported. This helps humans read the code manually.</p>
          </div>
          <div style={card}>
            <h3>Show custom label text</h3>
            <p>Displays product name, price, batch or other custom lines below the barcode.</p>
          </div>
          <div style={card}>
            <h3>Barcode area %</h3>
            <p>Controls how much label height is reserved for the barcode. Reduce it when you need more text space.</p>
          </div>
          <div style={card}>
            <h3>Main and extra text size</h3>
            <p>Controls the size of label details below the barcode. Reduce text size if the label looks crowded.</p>
          </div>
        </div>

        <h2>Step 5: Set label size and paper layout</h2>
        <p>
          Label size should match the real label paper. If your sticker label is 60mm wide and 40mm high, set label width
          to 60mm and label height to 40mm. If the label is too small for the barcode and text, either increase the label
          height or reduce text size.
        </p>

        <ul style={list}>
          <li><strong>Label width:</strong> The real width of one printed label.</li>
          <li><strong>Label height:</strong> The real height of one printed label.</li>
          <li><strong>Gap:</strong> Space between labels on the sheet or roll.</li>
          <li><strong>Page margin:</strong> Blank space around the full printed page.</li>
          <li><strong>Columns per page:</strong> Number of labels from left to right.</li>
          <li><strong>Rows per page:</strong> Number of labels from top to bottom.</li>
        </ul>

        <h2>Step 6: Download label PNG files</h2>
        <p>
          PNG download is useful when you want to insert barcode labels into documents, product sheets, design files,
          packaging artwork or internal systems. A good barcode label download should include the full label design, not
          only the barcode image. That means the PNG should include the barcode plus any product name, price, batch or
          custom label details you added.
        </p>

        <h2>Step 7: Print barcode labels correctly</h2>
        <p>
          Before printing many labels, print one test page. In the browser print dialog, choose the same paper size that
          you selected in the app. Disable headers and footers, and use 100% scale where possible. If the preview does
          not align with your label sheet, adjust page margin, gap, rows, columns, label width and label height.
        </p>

        <h2>Save and reuse your barcode settings</h2>
        <p>
          If you spend time adjusting label size and printer layout, save those settings. A settings download file helps
          you restore the same layout later, even on another computer. This is useful for shops and warehouses where
          multiple staff may use the same label printer.
        </p>

        <h2>Common barcode printing mistakes</h2>
        <ul style={list}>
          <li><strong>Using the wrong barcode type:</strong> Use Code 128 for internal labels unless your system requires another type.</li>
          <li><strong>Making labels too small:</strong> A barcode that is too small may not scan reliably.</li>
          <li><strong>Adding too much text:</strong> Increase label height or reduce font size for multi-line labels.</li>
          <li><strong>Using wrong print scale:</strong> Browser scaling can shift labels away from sticker positions.</li>
          <li><strong>Skipping scan tests:</strong> Always test one printed barcode before printing many labels.</li>
        </ul>

        <h2>Barcode label troubleshooting</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Barcode is too wide</h3>
            <p>Increase label width, reduce data length, lower scale, or use a 2D barcode such as QR Code for longer text.</p>
          </div>
          <div style={card}>
            <h3>Barcode does not scan</h3>
            <p>Print larger, increase barcode height, improve contrast and avoid blurry low-quality printing.</p>
          </div>
          <div style={card}>
            <h3>Text is cut off</h3>
            <p>Increase label height, reduce text size, or reduce barcode area percentage to give text more room.</p>
          </div>
          <div style={card}>
            <h3>Labels do not align</h3>
            <p>Check paper size, margins, gaps, rows, columns and browser print scale.</p>
          </div>
        </div>

        <h2>Final checklist before printing many labels</h2>
        <ul style={list}>
          <li>Choose the correct barcode type.</li>
          <li>Confirm barcode values are clean and not too long.</li>
          <li>Use CSV upload for large product lists.</li>
          <li>Match label size to real sticker paper.</li>
          <li>Check live preview before downloading or printing.</li>
          <li>Print one test page first.</li>
          <li>Scan the barcode with your actual scanner or phone.</li>
          <li>Save your settings for future use.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Which barcode type is best for inventory?</h3>
            <p>Code 128 is usually the best choice for internal inventory, SKU and product labels.</p>
          </div>
          <div style={card}>
            <h3>Can I create labels from Excel?</h3>
            <p>Yes. Prepare your product data in Excel, save as CSV, then upload the CSV file.</p>
          </div>
          <div style={card}>
            <h3>Can I print barcode labels directly?</h3>
            <p>Yes. Set label size, paper size, rows, columns, margins and gaps, then use the print option.</p>
          </div>
          <div style={card}>
            <h3>Why does EAN or UPC show an error?</h3>
            <p>EAN and UPC require valid digit lengths and proper data. For normal internal labels, use Code 128.</p>
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
const code = { background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '16px', overflow: 'auto', color: '#e2e8f0' };
const list = { paddingLeft: '24px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '20px 0' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const tableWrap = { overflowX: 'auto', margin: '20px 0', border: '1px solid #334155', borderRadius: '16px' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '720px', background: '#1e293b' };
const th = { textAlign: 'left', padding: '14px', color: '#fff', borderBottom: '1px solid #334155', background: '#0f172a' };
const td = { padding: '14px', borderBottom: '1px solid #334155', verticalAlign: 'top' };

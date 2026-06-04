import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';

export default function PDFWorkflowGuide() {
  return (
    <ToolboxLayout
      title="How to Merge, Split and Compress PDF Files Online"
      description="A complete guide to merging, splitting and compressing PDF files online. Learn PDF workflows for forms, invoices, applications, scanned documents, email sharing and file size limits."
    >
      <article style={wrap}>
        <p style={eyebrow}>PDF workflow guide</p>
        <h1 style={title}>How to Merge, Split and Compress PDF Files Online</h1>

        <p style={intro}>
          PDF files are used for invoices, contracts, certificates, visa applications, school documents, job applications,
          scanned forms, reports, ID copies, delivery notes and business records. But PDFs often need basic cleanup before
          they can be sent or uploaded. You may need to combine several PDFs into one file, extract only selected pages or
          reduce a large PDF file size.
        </p>

        <p>
          This guide explains when to merge PDF files, when to split PDF files, when to compress PDFs, how to prepare
          documents for upload, and how to avoid common mistakes such as wrong page order, unreadable compressed scans or
          files that still exceed upload limits.
        </p>

        <div style={ctaBox}>
          <div>
            <strong>Work with PDF files now</strong>
            <p style={ctaText}>Use PDF Merger, PDF Splitter and PDF Compressor for common document workflows.</p>
          </div>
          <div style={ctaLinks}>
            <Link href="/pdfmerge" style={cta}>PDF Merger →</Link>
            <Link href="/pdfsplit" style={cta}>PDF Splitter →</Link>
            <Link href="/pdfcompressor" style={cta}>PDF Compressor →</Link>
          </div>
        </div>

        <h2>PDF merge, split and compress: what is the difference?</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Task</th>
                <th style={th}>What it does</th>
                <th style={th}>When to use it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Merge PDF</td>
                <td style={td}>Combines multiple PDF files into one PDF.</td>
                <td style={td}>When documents belong together and must be submitted as one file.</td>
              </tr>
              <tr>
                <td style={td}>Split PDF</td>
                <td style={td}>Extracts selected pages or separates a PDF into smaller files.</td>
                <td style={td}>When you only need certain pages or want to remove unwanted pages.</td>
              </tr>
              <tr>
                <td style={td}>Compress PDF</td>
                <td style={td}>Reduces PDF file size.</td>
                <td style={td}>When a PDF is too large for email, portals, WhatsApp or upload limits.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>When should you merge PDF files?</h2>
        <p>
          Merge PDFs when multiple files need to be treated as one complete document. For example, an application may ask
          for one PDF containing a passport copy, visa copy, photo, certificate and signed form. Instead of uploading many
          separate files, you can merge them into one organized PDF.
        </p>

        <h3>Common reasons to merge PDFs</h3>
        <ul style={list}>
          <li>Combining invoice and supporting documents.</li>
          <li>Creating one application PDF from multiple scanned pages.</li>
          <li>Joining certificates, ID copies and forms into one file.</li>
          <li>Combining reports from different departments.</li>
          <li>Preparing one PDF package for email or upload.</li>
          <li>Putting signed pages back with the original document.</li>
        </ul>

        <h2>How to use the PDF Merger</h2>
        <ol style={list}>
          <li>Open the <Link href="/pdfmerge" style={inlineLink}>PDF Merger</Link>.</li>
          <li>Upload the PDF files you want to combine.</li>
          <li>Arrange files in the correct order.</li>
          <li>Preview the order if thumbnails are available.</li>
          <li>Merge the files.</li>
          <li>Download the final PDF and open it to confirm the page order.</li>
        </ol>

        <h2>PDF merge example</h2>
        <p>
          Imagine you need to submit a document package with a signed application, passport copy, Emirates ID copy and
          salary certificate. You can arrange the files in this order:
        </p>

        <pre style={code}>{`1. Signed application form.pdf
2. Passport copy.pdf
3. Emirates ID copy.pdf
4. Salary certificate.pdf`}</pre>

        <p>
          After merging, the final PDF should be opened and checked before submission. Page order matters because many
          portals and offices expect documents in a logical sequence.
        </p>

        <h2>When should you split PDF files?</h2>
        <p>
          Split PDFs when a large file contains pages you do not need, or when one PDF contains several separate documents.
          Splitting helps you extract only the relevant pages and keep the final file clean.
        </p>

        <h3>Common reasons to split PDFs</h3>
        <ul style={list}>
          <li>Extracting one certificate from a scanned bundle.</li>
          <li>Removing unnecessary blank pages.</li>
          <li>Separating invoices from one monthly PDF.</li>
          <li>Extracting selected pages for email.</li>
          <li>Creating separate files from each page.</li>
          <li>Reducing file size by keeping only required pages.</li>
        </ul>

        <h2>How to use the PDF Splitter</h2>
        <ol style={list}>
          <li>Open the <Link href="/pdfsplit" style={inlineLink}>PDF Splitter</Link>.</li>
          <li>Upload the PDF file.</li>
          <li>Select the page range or pages you want to extract.</li>
          <li>Split or extract the selected pages.</li>
          <li>Download the new PDF file.</li>
          <li>Open the output file and confirm only the required pages are included.</li>
        </ol>

        <h2>PDF page range examples</h2>
        <p>
          Page range selection helps you extract exactly what you need. Different tools may use different input formats,
          but these examples show the common idea:
        </p>

        <pre style={code}>{`1-3     Extract pages 1 to 3
5       Extract only page 5
2,4,6   Extract pages 2, 4 and 6
1-2,7   Extract pages 1 to 2 and page 7`}</pre>

        <p>
          Always check the final PDF because page numbers in the viewer may not always match printed page numbers inside
          the document.
        </p>

        <h2>When should you compress PDF files?</h2>
        <p>
          Compress a PDF when it is too large to upload or share. Scanned documents and image-heavy PDFs are often very
          large because each page may contain a full-size image. Compression reduces file size by optimizing images and
          internal PDF data.
        </p>

        <h3>Common reasons to compress PDFs</h3>
        <ul style={list}>
          <li>Email attachment size limits.</li>
          <li>Job application portal upload limits.</li>
          <li>Visa, school, bank or government form limits.</li>
          <li>WhatsApp or mobile sharing limitations.</li>
          <li>Slow uploads caused by scanned documents.</li>
          <li>Need to store many documents with less space.</li>
        </ul>

        <h2>How to use the PDF Compressor</h2>
        <ol style={list}>
          <li>Open the <Link href="/pdfcompressor" style={inlineLink}>PDF Compressor</Link>.</li>
          <li>Upload the PDF file.</li>
          <li>Select a compression level if available.</li>
          <li>Compress the file.</li>
          <li>Compare original and compressed file size.</li>
          <li>Open the compressed PDF and check readability.</li>
        </ol>

        <h2>Compression level: quality vs file size</h2>
        <p>
          PDF compression often requires balance. Strong compression creates a smaller file but may reduce image quality.
          Light compression keeps better quality but may not reduce file size enough. The right choice depends on how the
          PDF will be used.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>Light compression</h3>
            <p>Best when document quality matters and the file only needs a small size reduction.</p>
          </div>
          <div style={card}>
            <h3>Medium compression</h3>
            <p>Good balance for most scanned documents, email sharing and general uploads.</p>
          </div>
          <div style={card}>
            <h3>Strong compression</h3>
            <p>Useful when upload limits are strict, but always check small text and stamps after compression.</p>
          </div>
        </div>

        <h2>Recommended PDF workflow</h2>
        <p>
          The best order depends on your task, but for many document submissions this workflow works well:
        </p>

        <ol style={list}>
          <li><strong>Remove unnecessary pages first:</strong> Split or extract only required pages.</li>
          <li><strong>Arrange documents correctly:</strong> Put files in logical order.</li>
          <li><strong>Merge into one PDF:</strong> Combine the final selected documents.</li>
          <li><strong>Compress last:</strong> Reduce the final merged PDF if it is too large.</li>
          <li><strong>Review output:</strong> Open the final file and check page order, quality and size.</li>
        </ol>

        <h2>Common PDF workflows</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Application upload</h3>
            <p>Split required pages, merge supporting documents, then compress to meet portal limits.</p>
          </div>
          <div style={card}>
            <h3>Invoice package</h3>
            <p>Merge invoice, delivery note and payment proof into one file for customer or accounting records.</p>
          </div>
          <div style={card}>
            <h3>Scanned documents</h3>
            <p>Remove blank pages, rotate if needed, merge in order and compress if file size is too high.</p>
          </div>
          <div style={card}>
            <h3>Email sharing</h3>
            <p>Merge related files and compress the final PDF to keep attachment size manageable.</p>
          </div>
          <div style={card}>
            <h3>Certificate extraction</h3>
            <p>Split one certificate or selected pages from a larger PDF bundle.</p>
          </div>
          <div style={card}>
            <h3>Record keeping</h3>
            <p>Merge monthly documents into organized PDF files and compress for storage.</p>
          </div>
        </div>

        <h2>File naming best practices</h2>
        <p>
          Clear filenames make PDF files easier to find later. Avoid names like scan1.pdf or document-final-new2.pdf.
          Use names that explain the content, date and purpose.
        </p>

        <pre style={code}>{`Good:
2026-06-invoice-1001.pdf
passport-copy-john.pdf
application-documents-final.pdf

Weak:
scan.pdf
newfile.pdf
final-final2.pdf`}</pre>

        <h2>Common PDF mistakes and fixes</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Wrong page order</h3>
            <p>Arrange files before merging and open the final PDF before sending.</p>
          </div>
          <div style={card}>
            <h3>File still too large</h3>
            <p>Remove unnecessary pages first, then use stronger compression if quality remains acceptable.</p>
          </div>
          <div style={card}>
            <h3>Text becomes unreadable</h3>
            <p>Use lighter compression or rescan the document with better settings.</p>
          </div>
          <div style={card}>
            <h3>Blank pages included</h3>
            <p>Split or remove blank pages before merging the final file.</p>
          </div>
          <div style={card}>
            <h3>Wrong document uploaded</h3>
            <p>Use clear filenames and preview the final PDF before submission.</p>
          </div>
          <div style={card}>
            <h3>Portal rejects file</h3>
            <p>Check file size, page count, password protection and accepted file type.</p>
          </div>
        </div>

        <h2>Privacy tips for PDF tools</h2>
        <p>
          PDFs often contain personal or business information. Before using any tool, consider the sensitivity of your
          files. For highly confidential legal, medical, financial or identity documents, follow your organization’s data
          handling rules. Keep original copies as backups and avoid sharing final documents with the wrong recipient.
        </p>

        <h2>Best practices before sending or uploading a PDF</h2>
        <ul style={list}>
          <li>Open the final PDF after processing.</li>
          <li>Check page order from beginning to end.</li>
          <li>Zoom in and confirm text is readable.</li>
          <li>Confirm signatures, stamps and seals are visible.</li>
          <li>Check final file size against upload limits.</li>
          <li>Use a clear filename.</li>
          <li>Keep a backup of the original files.</li>
        </ul>

        <h2>Final checklist</h2>
        <ul style={list}>
          <li>Split first if only selected pages are needed.</li>
          <li>Merge only final required files.</li>
          <li>Compress after merging if file size is too large.</li>
          <li>Check the final PDF visually before sending.</li>
          <li>Use  readable filenames.</li>
          <li>Keep original copies safe.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div style={grid}>
          <div style={card}>
            <h3>Should I compress before or after merging?</h3>
            <p>Usually compress after merging, so the final combined PDF is optimized once.</p>
          </div>
          <div style={card}>
            <h3>Can I extract only one page from a PDF?</h3>
            <p>Yes. Use the PDF Splitter to extract the page or page range you need.</p>
          </div>
          <div style={card}>
            <h3>Why did compression reduce quality?</h3>
            <p>Strong compression may reduce image quality. Use a lighter setting if small text becomes unclear.</p>
          </div>
          <div style={card}>
            <h3>Can I merge scanned PDFs?</h3>
            <p>Yes. Scanned PDFs can be merged, but they may become large, so compression may be needed afterward.</p>
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

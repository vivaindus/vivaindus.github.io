import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';
import RelatedTools from '../../../components/RelatedTools';

export default function EditSignPdfGuide() {
  return (
    <ToolboxLayout
      title="How to Edit and Sign a PDF Online"
      description="Learn how to add text, signatures, stamps, images, highlights, boxes, headers, footers, page numbers and metadata to PDF files online."
    >
      <main style={pageWrap}>
        <article style={articleCard}>
          <p style={eyebrow}>PDF Guide</p>
          <h1 style={title}>How to Edit and Sign a PDF Online</h1>

          <p style={intro}>
            PDF files are used for invoices, forms, approvals, applications, reports, contracts, certificates,
            delivery notes, and office documents. Sometimes you do not need a full desktop PDF program — you only
            need to add a signature, write a note, place a stamp, highlight an area, or add page numbers.
          </p>

          <div style={ctaBox}>
            <div>
              <h2 style={ctaTitle}>Need to edit a PDF now?</h2>
              <p style={ctaText}>
                Use SHB ToolBox PDF Editor to add text, signatures, stamps, images, highlights, boxes, headers,
                footers, page numbers, Bates numbers, and metadata directly in your browser.
              </p>
            </div>
            <Link href="/pdfeditor" style={primaryBtn}>Open PDF Editor</Link>
          </div>

          <section style={section}>
            <h2 style={h2}>What can you edit in a PDF?</h2>
            <p style={para}>
              PDF editing can mean different things. Some users want to change the original text inside a PDF,
              while others only want to annotate the document. Browser-based editors are best for practical tasks
              like adding visible items on top of the PDF page: text, signatures, stamps, images, boxes, highlights,
              page numbers, and headers or footers.
            </p>
            <p style={para}>
              If a PDF is scanned, the page may behave like an image. In that case, you can still place annotations
              on the page, but directly editing the original text may require OCR or a more advanced document workflow.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Common PDF editing tasks</h2>
            <div style={checkGrid}>
              <div style={checkCard}>
                <h3 style={h3}>Add text</h3>
                <p style={paraSmall}>Write names, dates, notes, amounts, approval comments, or missing form details.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Add signature</h3>
                <p style={paraSmall}>Upload a transparent signature image and place it on approval areas or signature lines.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Add stamp or logo</h3>
                <p style={paraSmall}>Place company stamps, paid marks, approved marks, seals, logos, or image labels.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Highlight important areas</h3>
                <p style={paraSmall}>Mark important text, totals, dates, reference numbers, or approval sections.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Add page numbers</h3>
                <p style={paraSmall}>Number pages for reports, submissions, agreements, and multi-page documents.</p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Edit metadata</h3>
                <p style={paraSmall}>Add document title, author, subject, and keywords for cleaner document organization.</p>
              </div>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Step-by-step: sign a PDF online</h2>
            <ol style={steps}>
              <li>
                <strong>Open the PDF Editor.</strong>
                <span>Select your PDF file and wait for the page preview to load.</span>
              </li>
              <li>
                <strong>Upload your signature.</strong>
                <span>Use a clean PNG or JPG signature image. Transparent PNG usually looks best.</span>
              </li>
              <li>
                <strong>Place the signature.</strong>
                <span>Click the signature tool, place it on the correct area, then move or resize it if needed.</span>
              </li>
              <li>
                <strong>Adjust layer order.</strong>
                <span>If a signature overlaps a stamp or image, use bring forward/send backward controls so it appears correctly.</span>
              </li>
              <li>
                <strong>Review the preview carefully.</strong>
                <span>Zoom in and check whether the signature, stamp, text, and page layout look correct.</span>
              </li>
              <li>
                <strong>Download the edited PDF.</strong>
                <span>Save the output with a clear filename and keep the original copy separately.</span>
              </li>
            </ol>
          </section>

          <section style={section}>
            <h2 style={h2}>Tips for clean PDF signing</h2>
            <ul style={list}>
              <li>Use a transparent PNG signature when possible.</li>
              <li>Keep a copy of the original PDF before editing.</li>
              <li>Do not cover important text, dates, totals, or reference numbers.</li>
              <li>Use layer controls if a stamp hides your signature.</li>
              <li>Check all pages before sending the final PDF.</li>
              <li>Use page numbers for multi-page approvals or reports.</li>
              <li>Use metadata fields for better document organization.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>PDF editor checklist before downloading</h2>
            <div style={exampleBox}>
              <p>✅ Correct PDF file selected</p>
              <p>✅ Text is readable and placed correctly</p>
              <p>✅ Signature is visible and not hidden behind a stamp</p>
              <p>✅ Stamp or logo size looks professional</p>
              <p>✅ Highlights do not block important text</p>
              <p>✅ Page numbers and headers/footers are correct</p>
              <p>✅ Output filename is clear</p>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>FAQ: Edit and sign PDF online</h2>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I sign a PDF without installing software?</h3>
              <p style={paraSmall}>
                Yes. A browser-based PDF editor can add a signature image directly on top of the PDF page.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I move and resize added items?</h3>
              <p style={paraSmall}>
                Yes. In SHB ToolBox PDF Editor, added items such as text, signatures, images, boxes, and highlights can be moved and resized.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why is my signature hidden behind a stamp?</h3>
              <p style={paraSmall}>
                This happens when the stamp layer is above the signature layer. Use bring forward or send backward controls to correct the order.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can scanned PDFs be edited?</h3>
              <p style={paraSmall}>
                You can annotate scanned PDFs by adding visible items on top of the page. Directly changing scanned text usually requires OCR.
              </p>
            </div>
          </section>

          <div style={buttonRow}>
            <Link href="/pdfeditor" style={primaryBtn}>Edit PDF Now</Link>
            <Link href="/signaturemaker" style={secondaryBtn}>Create Signature</Link>
            <Link href="/pdfcompressor" style={secondaryBtn}>Compress PDF</Link>
          </div>

          <RelatedTools currentPath="/pdfeditor" />
        </article>
      </main>
    </ToolboxLayout>
  );
}

const pageWrap = { maxWidth: '1050px', margin: '0 auto', padding: '60px 20px 90px' };
const articleCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '42px', lineHeight: 1.85 };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.08em' };
const title = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05, margin: '10px 0 20px' };
const intro = { color: '#cbd5e1', fontSize: '1.12rem', maxWidth: '850px' };
const section = { marginTop: '52px' };
const h2 = { color: '#fff', fontSize: '1.75rem', marginBottom: '14px' };
const h3 = { color: '#38bdf8', fontSize: '1.05rem', margin: '0 0 8px' };
const para = { color: '#cbd5e1', fontSize: '1rem', marginBottom: '16px' };
const paraSmall = { color: '#94a3b8', fontSize: '0.95rem', margin: 0 };
const ctaBox = { marginTop: '30px', display: 'flex', gap: '22px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#0f172a', border: '1px solid #334155', borderRadius: '22px', padding: '24px' };
const ctaTitle = { color: '#fff', margin: '0 0 8px', fontSize: '1.25rem' };
const ctaText = { color: '#94a3b8', margin: 0, maxWidth: '650px' };
const primaryBtn = { background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block' };
const secondaryBtn = { background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 900, display: 'inline-block', border: '1px solid #334155' };
const checkGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '22px' };
const checkCard = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '20px' };
const steps = { color: '#cbd5e1', display: 'grid', gap: '16px', paddingLeft: '22px' };
const exampleBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px', color: '#cbd5e1' };
const list = { color: '#cbd5e1', paddingLeft: '22px' };
const buttonRow = { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' };
const faqItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginBottom: '14px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 8px' };

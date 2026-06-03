import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';
import RelatedTools from '../../../components/RelatedTools';

export default function CompressPdfGuide() {
  return (
    <ToolboxLayout
      title="How to Compress PDF Without Losing Quality"
      description="Learn how to reduce PDF file size for email, forms, WhatsApp and uploads while keeping text, images and scanned pages readable."
    >
      <main style={pageWrap}>
        <article style={articleCard}>
          <p style={eyebrow}>PDF Guide</p>
          <h1 style={title}>How to Compress PDF Without Losing Quality</h1>

          <p style={intro}>
            PDF files can become large because of scanned pages, high-resolution images, embedded fonts, forms, or multiple
            pages inside one document. A smaller PDF is easier to email, upload to portals, share on WhatsApp, and store
            safely. The goal is not just to make the file tiny — the goal is to reduce size while keeping the document readable.
          </p>

          <div style={ctaBox}>
            <div>
              <h2 style={ctaTitle}>Need to reduce a PDF now?</h2>
              <p style={ctaText}>
                Use SHB ToolBox PDF Compressor to reduce PDF size directly in your browser for emails, online forms,
                job applications, school uploads, business documents, and scanned files.
              </p>
            </div>
            <Link href="/pdfcompressor" style={primaryBtn}>Open PDF Compressor</Link>
          </div>

          <section style={section}>
            <h2 style={h2}>Why PDF files become too large</h2>
            <p style={para}>
              The most common reason for a large PDF is image data. A scanned document is usually not text; it is a set of
              images placed inside a PDF container. If the scan resolution is very high, the file size can quickly grow.
              Product catalogs, reports, invoices with logos, brochures, and signed documents can also become large when
              they contain high-quality photos or repeated image elements.
            </p>
            <p style={para}>
              Text-only PDFs are usually much smaller because the file stores characters, fonts, and layout instructions.
              Image-heavy PDFs need more compression care because reducing size too much can make text blurry or signatures
              difficult to read.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Best compression settings for different uses</h2>
            <div style={checkGrid}>
              <div style={checkCard}>
                <h3 style={h3}>Email and WhatsApp</h3>
                <p style={paraSmall}>
                  Use medium compression. Keep text readable and avoid over-compressing scanned pages with signatures or stamps.
                </p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Online application forms</h3>
                <p style={paraSmall}>
                  Use stronger compression only if the portal has a strict file limit. Always open the output PDF before uploading.
                </p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Invoices and business documents</h3>
                <p style={paraSmall}>
                  Keep logos, totals, invoice numbers, TRN details, names, and signatures clear enough for review and printing.
                </p>
              </div>

              <div style={checkCard}>
                <h3 style={h3}>Scanned certificates</h3>
                <p style={paraSmall}>
                  Avoid aggressive compression. Certificates, IDs, and official documents must remain sharp and readable.
                </p>
              </div>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Step-by-step: compress a PDF safely</h2>
            <ol style={steps}>
              <li>
                <strong>Open the PDF Compressor.</strong>
                <span>Choose a trusted browser-based compressor and select your PDF file.</span>
              </li>
              <li>
                <strong>Check the original file size.</strong>
                <span>Before compressing, note the original size so you can compare how much was reduced.</span>
              </li>
              <li>
                <strong>Choose a balanced quality level.</strong>
                <span>Start with normal or medium compression. Only use stronger compression when you really need a smaller file.</span>
              </li>
              <li>
                <strong>Download the compressed PDF.</strong>
                <span>Save the new version with a clear filename so you do not overwrite your original document by mistake.</span>
              </li>
              <li>
                <strong>Open and inspect the output.</strong>
                <span>Zoom in and check names, numbers, signatures, tables, stamps, and small text before sharing or uploading.</span>
              </li>
            </ol>
          </section>

          <section style={section}>
            <h2 style={h2}>What “without losing quality” really means</h2>
            <p style={para}>
              Every PDF compression method has a trade-off. If a PDF contains large images, reducing the file size usually
              means lowering image quality, reducing resolution, or simplifying the file. A good compressor tries to keep
              the visible quality acceptable while removing unnecessary file weight.
            </p>
            <p style={note}>
              Important: Always check the compressed PDF manually. For legal, medical, visa, banking, tax, school, or job
              documents, readability is more important than getting the smallest possible file size.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Common mistakes to avoid</h2>
            <ul style={list}>
              <li>Compressing the only copy of an important document without keeping the original.</li>
              <li>Using maximum compression for scanned documents with small text.</li>
              <li>Uploading a compressed file without opening it first.</li>
              <li>Ignoring page rotation or missing pages after compression.</li>
              <li>Making signatures, stamps, barcodes, or QR codes unreadable.</li>
              <li>Assuming every PDF can be reduced by the same percentage.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>PDF compression checklist</h2>
            <div style={exampleBox}>
              <p>✅ File opens without error</p>
              <p>✅ All pages are present</p>
              <p>✅ Text is readable at normal zoom</p>
              <p>✅ Signatures and stamps are visible</p>
              <p>✅ Tables, totals, and numbers are clear</p>
              <p>✅ File size meets the upload limit</p>
              <p>✅ Original copy is safely saved</p>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>FAQ: Compress PDF online</h2>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I compress PDF files for free?</h3>
              <p style={paraSmall}>
                Yes. SHB ToolBox PDF Compressor lets you reduce PDF file size online without creating an account.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Will compression remove pages?</h3>
              <p style={paraSmall}>
                A normal compressor should not remove pages. Still, always open the downloaded PDF and check all pages before sharing it.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Why is my scanned PDF still large?</h3>
              <p style={paraSmall}>
                Scanned PDFs are image-heavy. If the pages are high-resolution scans, the file may remain larger than a text-only PDF.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>What is the best compression level?</h3>
              <p style={paraSmall}>
                Use balanced compression for most files. Use stronger compression only when the upload limit is strict.
              </p>
            </div>
          </section>

          <div style={buttonRow}>
            <Link href="/pdfcompressor" style={primaryBtn}>Compress PDF Now</Link>
            <Link href="/pdfmerge" style={secondaryBtn}>Open PDF Merger</Link>
            <Link href="/pdfeditor" style={secondaryBtn}>Open PDF Editor</Link>
          </div>

          <RelatedTools currentPath="/pdfcompressor" />
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
const note = { color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '16px', padding: '16px' };
const buttonRow = { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' };
const faqItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginBottom: '14px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 8px' };

import React from 'react';
import Link from 'next/link';
import ToolboxLayout from '../../../components/ToolboxLayout';
import RelatedTools from '../../../components/RelatedTools';

export default function UAETaxInvoiceGuide() {
  return (
    <ToolboxLayout
      title="How to Create a UAE Tax Invoice Online"
      description="Learn how to create a UAE tax invoice with TRN, VAT, invoice number, seller and buyer details, item lines, totals, and printable PDF output."
    >
      <main style={pageWrap}>
        <article style={articleCard}>
          <p style={eyebrow}>Business Guide</p>
          <h1 style={title}>How to Create a UAE Tax Invoice Online</h1>

          <p style={intro}>
            A clear tax invoice is important for UAE businesses, freelancers, service providers, and online sellers.
            A properly prepared invoice helps customers understand what they purchased, how VAT was calculated,
            and how much they need to pay.
          </p>

          <div style={ctaBox}>
            <div>
              <h2 style={ctaTitle}>Need to create one now?</h2>
              <p style={ctaText}>
                Use SHB ToolBox Tax Invoice Pro to prepare an invoice with item lines, VAT fields, TRN details,
                discounts, shipping, payment status, signature, logo, and print/PDF output.
              </p>
            </div>
            <Link href="/invoicegenerator" style={primaryBtn}>Open Tax Invoice Pro</Link>
          </div>

          <section style={section}>
            <h2 style={h2}>What is a UAE tax invoice?</h2>
            <p style={para}>
              A UAE tax invoice is a document issued by a supplier to a customer for a taxable supply. It normally
              records the seller details, buyer details, invoice date, invoice number, description of goods or services,
              taxable value, VAT amount, and total amount payable.
            </p>
            <p style={para}>
              In the UAE, VAT is administered by the Federal Tax Authority. Businesses that are registered for VAT
              commonly include their Tax Registration Number, also called TRN, on invoices. If your business is not
              VAT registered, you should avoid presenting your document as a VAT tax invoice unless you are legally
              allowed to do so.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Important details to include on a UAE invoice</h2>
            <p style={para}>
              The exact invoice format depends on your business type, VAT registration status, customer type, and
              the nature of the transaction. However, a professional UAE invoice commonly includes the following:
            </p>

            <div style={checkGrid}>
              <div style={checkCard}>
                <h3 style={h3}>Seller details</h3>
                <p style={paraSmall}>Business name, address, email, phone number, website, and TRN if VAT registered.</p>
              </div>
              <div style={checkCard}>
                <h3 style={h3}>Buyer details</h3>
                <p style={paraSmall}>Customer name, address, email, phone, and buyer TRN if relevant for B2B transactions.</p>
              </div>
              <div style={checkCard}>
                <h3 style={h3}>Invoice identity</h3>
                <p style={paraSmall}>Invoice number, invoice date, due date, reference number, and invoice status.</p>
              </div>
              <div style={checkCard}>
                <h3 style={h3}>Item lines</h3>
                <p style={paraSmall}>Description, quantity, unit price, discount, VAT rate, VAT amount, and line total.</p>
              </div>
              <div style={checkCard}>
                <h3 style={h3}>Payment details</h3>
                <p style={paraSmall}>Bank details, payment link, payment terms, amount paid, balance due, and notes.</p>
              </div>
              <div style={checkCard}>
                <h3 style={h3}>Final totals</h3>
                <p style={paraSmall}>Subtotal, discount, VAT total, shipping, round off, grand total, and balance due.</p>
              </div>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>Step-by-step: create a UAE tax invoice online</h2>

            <ol style={steps}>
              <li>
                <strong>Choose the invoice type.</strong>{' '}
                <span> Use Tax Invoice when VAT details are required. Use a normal invoice, quotation, or receipt only when appropriate.</span>
              </li>
              <li>
                <strong>Add your business details.</strong>{' '}
                <span> Enter your company name, address, contact details, and TRN if your business is VAT registered.</span>
              </li>
              <li>
                <strong>Add customer details.</strong>{' '}
                <span> Enter the customer name and contact information. For B2B customers, add buyer TRN when relevant.</span>
              </li>
              <li>
                <strong> Enter products or services.</strong>{' '}
                <span> Add each item with description, quantity, rate, discount if any, and VAT percentage.</span>
              </li>
              <li>
                <strong>Review VAT and totals.</strong>{' '}
                <span> Check subtotal, VAT total, shipping, round-off, total paid, and balance due before issuing.</span>
              </li>
              <li>
                <strong>Add branding and signature.</strong>{' '}
                <span> Upload a logo, add an authorized signature, and write payment instructions or terms.</span>
              </li>
              <li>
                <strong>Print or save as PDF.</strong>{' '}
                <span> Use your browser print option or PDF download button to save a clean copy for your records.</span>
              </li>
            </ol>
          </section>

          <section style={section}>
            <h2 style={h2}>Simple UAE VAT invoice example</h2>
            <div style={exampleBox}>
              <p><strong>Invoice No:</strong> INV-2026-001</p>
              <p><strong>Invoice Date:</strong> 01-06-2026</p>
              <p><strong>Seller:</strong> Your Business Name, Dubai, UAE</p>
              <p><strong>Seller TRN:</strong> 100000000000000</p>
              <p><strong>Buyer:</strong> Customer Name</p>
              <p><strong>Item:</strong> Website maintenance service</p>
              <p><strong>Amount:</strong> AED 1,000.00</p>
              <p><strong>VAT 5%:</strong> AED 50.00</p>
              <p><strong>Total:</strong> AED 1,050.00</p>
            </div>
            <p style={para}>
              This is only a simplified example. Your actual invoice may need more details depending on your transaction,
              business registration, customer type, and record-keeping requirements.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Common invoice mistakes to avoid</h2>
            <ul style={list}>
              <li>Using duplicate invoice numbers without a clear numbering sequence.</li>
              <li>Forgetting to add TRN on VAT invoices when the business is VAT registered.</li>
              <li>Mixing tax-inclusive and tax-exclusive pricing without checking the final total.</li>
              <li>Leaving customer details incomplete for business customers.</li>
              <li>Not saving PDF copies for internal records.</li>
              <li>Adding VAT wording when the business is not registered or not allowed to charge VAT.</li>
              <li>Forgetting payment terms, due date, bank details, or balance due.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>When should a UAE business register for VAT?</h2>
            <p style={para}>
              UAE VAT registration depends on taxable supplies, imports, and FTA rules. The Federal Tax Authority states
              that a business must register for VAT if its taxable supplies and imports exceed the mandatory registration
              threshold of AED 375,000. Voluntary registration may be available when taxable supplies, imports, or taxable
              expenses exceed AED 187,500.
            </p>
            <p style={note}>
              This guide is for general information only and is not tax, legal, or accounting advice. Always confirm your
              obligations with the UAE Federal Tax Authority or a qualified tax advisor.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Why use SHB ToolBox Tax Invoice Pro?</h2>
            <p style={para}>
              SHB ToolBox Tax Invoice Pro is built for small businesses that need a quick, clean, and browser-based invoice
              workspace. You can edit the invoice directly, add multiple item lines, calculate VAT, add discounts and shipping,
              upload a logo and signature, save a draft in your browser, and print or save the final invoice as PDF.
            </p>

            <div style={buttonRow}>
              <Link href="/invoicegenerator" style={primaryBtn}>Create Invoice Now</Link>
              <Link href="/percentagecalculator" style={secondaryBtn}>Open Percentage Calculator</Link>
            </div>
          </section>

          <section style={section}>
            <h2 style={h2}>FAQ: UAE tax invoice online</h2>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I create a UAE tax invoice online for free?</h3>
              <p style={paraSmall}>
                Yes. You can use SHB ToolBox Tax Invoice Pro to prepare a printable invoice directly in your browser.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I add VAT and TRN details?</h3>
              <p style={paraSmall}>
                Yes. The invoice generator includes VAT fields, seller TRN, buyer TRN, VAT totals, and invoice totals.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Can I save the invoice as PDF?</h3>
              <p style={paraSmall}>
                Yes. You can print or save the invoice as PDF using the built-in browser print/PDF workflow.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQ}>Is my invoice data uploaded to a server?</h3>
              <p style={paraSmall}>
                The invoice is created in your browser. If you use draft saving, it is saved in your current browser local storage.
              </p>
            </div>
          </section>

          <RelatedTools currentPath="/invoicegenerator" />
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
const exampleBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '22px', color: '#cbd5e1', fontFamily: 'monospace' };
const list = { color: '#cbd5e1', paddingLeft: '22px' };
const note = { color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '16px', padding: '16px' };
const buttonRow = { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' };
const faqItem = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', marginBottom: '14px' };
const faqQ = { color: '#fff', fontSize: '1rem', margin: '0 0 8px' };
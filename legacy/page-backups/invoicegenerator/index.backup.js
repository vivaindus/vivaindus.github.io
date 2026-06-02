import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const currencies = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR', 'OMR'];

const defaultInvoice = {
  status: 'DRAFT',
  invoiceTitle: 'TAX INVOICE',
  invoiceNumber: 'INV-2026-001',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  currency: 'AED',
  taxMode: 'exclusive',
  seller: {
    name: 'Your Company Name',
    trn: '',
    address: 'Business Bay, Dubai, UAE',
    email: '',
    phone: ''
  },
  buyer: {
    name: '',
    trn: '',
    address: '',
    email: '',
    phone: ''
  },
  items: [
    {
      id: 1,
      description: '',
      qty: 1,
      rate: 0,
      vatRate: 5
    }
  ],
  discount: 0,
  shipping: 0,
  amountPaid: 0,
  notes: 'Thank you for your business.',
  terms: 'Payment is due as per the agreed terms. Please verify invoice details before payment.',
  bankDetails: '',
  logo: '',
  locked: false
};

export default function InvoiceEngine() {
  const [mounted, setMounted] = useState(false);
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [notification, setNotification] = useState('');

  const totals = useMemo(() => calculateInvoice(invoice), [invoice]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message) => {
    setNotification(message);
  };

  const updateInvoice = (field, value) => {
    if (invoice.locked) return;
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (section, field, value) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateItem = (id, field, value) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => (
        item.id === id ? { ...item, [field]: value } : item
      ))
    }));
  };

  const addItem = () => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: '',
          qty: 1,
          rate: 0,
          vatRate: 5
        }
      ]
    }));
  };

  const removeItem = (id) => {
    if (invoice.locked) return;

    setInvoice(prev => ({
      ...prev,
      items: prev.items.length === 1
        ? prev.items
        : prev.items.filter(item => item.id !== id)
    }));
  };

  const duplicateItem = (id) => {
    if (invoice.locked) return;

    setInvoice(prev => {
      const target = prev.items.find(item => item.id === id);
      if (!target) return prev;

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            ...target,
            id: Date.now()
          }
        ]
      };
    });
  };

  const handleLogoUpload = (event) => {
    if (invoice.locked) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image logo.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo should be below 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setInvoice(prev => ({ ...prev, logo: reader.result }));
      showToast('Logo uploaded.');
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('shb_invoice_draft', JSON.stringify(invoice));
      showToast('Draft saved in this browser.');
    } catch {
      showToast('Could not save draft.');
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('shb_invoice_draft');
      if (!saved) {
        showToast('No saved draft found.');
        return;
      }

      setInvoice(JSON.parse(saved));
      showToast('Draft loaded.');
    } catch {
      showToast('Could not load draft.');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('shb_invoice_draft');
    setInvoice(defaultInvoice);
    showToast('Draft cleared.');
  };

  const copySummary = async () => {
    const summary = [
      `${invoice.invoiceTitle}`,
      `Invoice Number: ${invoice.invoiceNumber}`,
      `Invoice Date: ${invoice.invoiceDate}`,
      `Due Date: ${invoice.dueDate || 'Not set'}`,
      `Seller: ${invoice.seller.name}`,
      `Seller TRN: ${invoice.seller.trn || 'Not provided'}`,
      `Buyer: ${invoice.buyer.name || 'Not provided'}`,
      `Buyer TRN: ${invoice.buyer.trn || 'Not provided'}`,
      `Subtotal: ${invoice.currency} ${formatMoney(totals.subtotal)}`,
      `Discount: ${invoice.currency} ${formatMoney(totals.discount)}`,
      `Shipping / Charges: ${invoice.currency} ${formatMoney(totals.shipping)}`,
      `VAT Total: ${invoice.currency} ${formatMoney(totals.totalVat)}`,
      `Grand Total: ${invoice.currency} ${formatMoney(totals.grandTotal)}`,
      `Amount Paid: ${invoice.currency} ${formatMoney(totals.amountPaid)}`,
      `Balance Due: ${invoice.currency} ${formatMoney(totals.balanceDue)}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Invoice summary copied.');
    } catch {
      showToast('Copy failed.');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const lockInvoice = () => {
    setInvoice(prev => ({
      ...prev,
      locked: !prev.locked,
      status: prev.locked ? 'DRAFT' : 'FINAL'
    }));
  };

  if (!mounted) {
    return (
      <div style={loadingWrap}>
        Loading invoice engine...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Invoice Generator - Free UAE VAT Invoice Maker | SHB ToolBox</title>
        <meta
          name="description"
          content="Create professional invoices online with SHB ToolBox. Add seller and buyer details, TRN, VAT, line items, discount, shipping, payment status, notes, terms, logo and print or save as PDF."
        />
      </Head>

      <style>{printStyles}</style>

      <div style={pageShell}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <nav style={topBar} className="no-print">
          <a href="/" style={brandLink}>SHB<span style={{ color: '#38bdf8' }}>ToolBox</span></a>

          <div style={topActions}>
            <button onClick={saveDraft} style={ghostBtn}>Save Draft</button>
            <button onClick={loadDraft} style={ghostBtn}>Load Draft</button>
            <button onClick={copySummary} style={ghostBtn}>Copy Summary</button>
            <button onClick={lockInvoice} style={invoice.locked ? lockActiveBtn : darkBtn}>
              {invoice.locked ? 'Edit Mode' : 'Final Lock'}
            </button>
            <button onClick={printInvoice} style={primaryBtn}>Print / Save PDF</button>
          </div>
        </nav>

        <main style={mainGrid}>
          <section style={editorPanel} className="no-print">
            <div style={editorHeader}>
              <div>
                <p style={eyebrow}>Free professional invoice maker</p>
                <h1 style={editorTitle}>Invoice Generator</h1>
                <p style={editorText}>
                  Create a clean invoice with VAT, TRN fields, payment details, notes, logo and a printable preview.
                </p>
              </div>
              <span style={invoice.locked ? finalBadge : draftBadge}>{invoice.status}</span>
            </div>

            <EditorCard title="Invoice details">
              <div style={threeGrid}>
                <Field label="Invoice title">
                  <input
                    value={invoice.invoiceTitle}
                    onChange={event => updateInvoice('invoiceTitle', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Invoice number">
                  <input
                    value={invoice.invoiceNumber}
                    onChange={event => updateInvoice('invoiceNumber', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Currency">
                  <select
                    value={invoice.currency}
                    onChange={event => updateInvoice('currency', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Invoice date">
                  <input
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={event => updateInvoice('invoiceDate', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Due date">
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={event => updateInvoice('dueDate', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="VAT mode">
                  <select
                    value={invoice.taxMode}
                    onChange={event => updateInvoice('taxMode', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  >
                    <option value="exclusive">VAT exclusive prices</option>
                    <option value="inclusive">VAT inclusive prices</option>
                  </select>
                </Field>
              </div>
            </EditorCard>

            <EditorCard title="Seller and buyer">
              <div style={twoGrid}>
                <div style={partyBox}>
                  <h3 style={partyTitle}>Seller details</h3>

                  <Field label="Seller name">
                    <input
                      value={invoice.seller.name}
                      onChange={event => updateNested('seller', 'name', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Seller TRN">
                    <input
                      value={invoice.seller.trn}
                      onChange={event => updateNested('seller', 'trn', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                      placeholder="15-digit TRN if applicable"
                    />
                  </Field>

                  <Field label="Seller address">
                    <textarea
                      value={invoice.seller.address}
                      onChange={event => updateNested('seller', 'address', event.target.value)}
                      disabled={invoice.locked}
                      style={textareaStyle}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      value={invoice.seller.email}
                      onChange={event => updateNested('seller', 'email', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      value={invoice.seller.phone}
                      onChange={event => updateNested('seller', 'phone', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <div style={partyBox}>
                  <h3 style={partyTitle}>Buyer details</h3>

                  <Field label="Buyer name">
                    <input
                      value={invoice.buyer.name}
                      onChange={event => updateNested('buyer', 'name', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Buyer TRN">
                    <input
                      value={invoice.buyer.trn}
                      onChange={event => updateNested('buyer', 'trn', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                      placeholder="Optional"
                    />
                  </Field>

                  <Field label="Buyer address">
                    <textarea
                      value={invoice.buyer.address}
                      onChange={event => updateNested('buyer', 'address', event.target.value)}
                      disabled={invoice.locked}
                      style={textareaStyle}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      value={invoice.buyer.email}
                      onChange={event => updateNested('buyer', 'email', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      value={invoice.buyer.phone}
                      onChange={event => updateNested('buyer', 'phone', event.target.value)}
                      disabled={invoice.locked}
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            </EditorCard>

            <EditorCard title="Line items">
              <div style={itemsWrap}>
                {invoice.items.map((item, index) => (
                  <div key={item.id} style={itemRow}>
                    <div style={itemNumber}>#{index + 1}</div>

                    <div style={itemDescription}>
                      <Field label="Description">
                        <input
                          value={item.description}
                          onChange={event => updateItem(item.id, 'description', event.target.value)}
                          disabled={invoice.locked}
                          style={inputStyle}
                          placeholder="Product or service description"
                        />
                      </Field>
                    </div>

                    <div style={itemInputs}>
                      <Field label="Qty">
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={event => updateItem(item.id, 'qty', event.target.value)}
                          disabled={invoice.locked}
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Rate">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={event => updateItem(item.id, 'rate', event.target.value)}
                          disabled={invoice.locked}
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="VAT %">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.vatRate}
                          onChange={event => updateItem(item.id, 'vatRate', event.target.value)}
                          disabled={invoice.locked}
                          style={inputStyle}
                        />
                      </Field>
                    </div>

                    <div style={lineActions}>
                      <button onClick={() => duplicateItem(item.id)} disabled={invoice.locked} style={miniBtn}>Copy</button>
                      <button onClick={() => removeItem(item.id)} disabled={invoice.locked || invoice.items.length === 1} style={dangerMiniBtn}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addItem} disabled={invoice.locked} style={addBtn}>
                + Add line item
              </button>
            </EditorCard>

            <EditorCard title="Adjustments and payment">
              <div style={threeGrid}>
                <Field label="Discount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.discount}
                    onChange={event => updateInvoice('discount', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Shipping / charges">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.shipping}
                    onChange={event => updateInvoice('shipping', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Amount paid">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.amountPaid}
                    onChange={event => updateInvoice('amountPaid', event.target.value)}
                    disabled={invoice.locked}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </EditorCard>

            <EditorCard title="Logo, notes and terms">
              <div style={twoGrid}>
                <Field label="Logo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={invoice.locked}
                    style={fileStyle}
                  />
                </Field>

                <Field label="Bank / payment details">
                  <textarea
                    value={invoice.bankDetails}
                    onChange={event => updateInvoice('bankDetails', event.target.value)}
                    disabled={invoice.locked}
                    style={textareaStyle}
                    placeholder="Bank name, IBAN, payment link or account details"
                  />
                </Field>
              </div>

              <div style={twoGrid}>
                <Field label="Notes">
                  <textarea
                    value={invoice.notes}
                    onChange={event => updateInvoice('notes', event.target.value)}
                    disabled={invoice.locked}
                    style={textareaStyle}
                  />
                </Field>

                <Field label="Terms">
                  <textarea
                    value={invoice.terms}
                    onChange={event => updateInvoice('terms', event.target.value)}
                    disabled={invoice.locked}
                    style={textareaStyle}
                  />
                </Field>
              </div>
            </EditorCard>

            <EditorCard title="Browser draft controls">
              <div style={draftActions}>
                <button onClick={saveDraft} style={secondaryBtn}>Save draft</button>
                <button onClick={loadDraft} style={secondaryBtn}>Load draft</button>
                <button onClick={clearDraft} style={dangerBtn}>Clear draft</button>
              </div>
              <p style={smallNote}>
                Drafts are saved only in this browser using local storage. They are not uploaded to SHB ToolBox.
              </p>
            </EditorCard>

            <section style={seoSection}>
              <h2 style={seoTitle}>Free invoice generator for professional billing</h2>
              <p style={seoPara}>
                This invoice generator helps freelancers, small businesses, service providers, online sellers and UAE-based
                businesses create a professional invoice with seller details, buyer details, TRN fields, VAT rates, itemized
                totals, discounts, shipping charges, payment notes and printable formatting.
              </p>

              <div style={seoGrid}>
                <div style={seoCard}>
                  <h3>VAT and TRN fields</h3>
                  <p>
                    Add seller TRN and buyer TRN fields when applicable. The preview clearly shows VAT rate, VAT amount,
                    taxable value and total payable.
                  </p>
                </div>

                <div style={seoCard}>
                  <h3>Printable PDF workflow</h3>
                  <p>
                    Use the browser print option to print or save the invoice as PDF. This keeps the workflow simple and
                    compatible with most desktop and mobile browsers.
                  </p>
                </div>

                <div style={seoCard}>
                  <h3>Privacy-first invoice creation</h3>
                  <p>
                    The invoice is created in your browser. Draft saving uses browser local storage, and you can clear it
                    anytime from the page.
                  </p>
                </div>
              </div>

              <h2 style={seoTitle}>Invoice generator FAQ</h2>
              <div style={faqGrid}>
                <div style={faqItem}>
                  <h3>Can I create a UAE VAT invoice?</h3>
                  <p>
                    Yes, this tool includes seller TRN, buyer TRN, VAT percentage, VAT amount, invoice number and invoice date
                    fields. Always confirm official tax requirements with your accountant or the UAE FTA.
                  </p>
                </div>

                <div style={faqItem}>
                  <h3>Can I save the invoice as PDF?</h3>
                  <p>
                    Yes. Click Print / Save PDF and choose “Save as PDF” in your browser print dialog.
                  </p>
                </div>

                <div style={faqItem}>
                  <h3>Does the tool upload my invoice data?</h3>
                  <p>
                    No. The invoice is edited in your browser. Saved drafts remain in your browser local storage.
                  </p>
                </div>

                <div style={faqItem}>
                  <h3>Can I add discounts and paid amount?</h3>
                  <p>
                    Yes. You can add discount, shipping or extra charges, amount paid and balance due.
                  </p>
                </div>
              </div>
            </section>
          </section>

          <section style={previewPanel}>
            <InvoicePreview invoice={invoice} totals={totals} />
          </section>
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function EditorCard({ title, children }) {
  return (
    <section style={cardStyle}>
      <h2 style={cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function InvoicePreview({ invoice, totals }) {
  return (
    <div id="print-invoice" style={paperStyle}>
      <header style={invoiceHeader}>
        <div>
          <h2 style={invoiceTitle}>{invoice.invoiceTitle || 'INVOICE'}</h2>
          <p style={mutedLine}>Invoice #: <strong>{invoice.invoiceNumber}</strong></p>
          <p style={mutedLine}>Invoice Date: <strong>{formatDate(invoice.invoiceDate)}</strong></p>
          {invoice.dueDate && <p style={mutedLine}>Due Date: <strong>{formatDate(invoice.dueDate)}</strong></p>}
          <p style={statusPill}>{invoice.status}</p>
        </div>

        <div style={logoWrap}>
          {invoice.logo ? (
            <img src={invoice.logo} style={logoImg} alt="Company logo" />
          ) : (
            <div style={logoPlaceholder}>LOGO</div>
          )}
        </div>
      </header>

      <section style={partyGridPreview}>
        <div style={partyPreviewBox}>
          <h3 style={previewBoxTitle}>Seller</h3>
          <p style={partyName}>{invoice.seller.name || 'Seller Name'}</p>
          {invoice.seller.trn && <p style={previewSmall}>TRN: {invoice.seller.trn}</p>}
          <p style={previewSmall}>{invoice.seller.address}</p>
          {invoice.seller.email && <p style={previewSmall}>Email: {invoice.seller.email}</p>}
          {invoice.seller.phone && <p style={previewSmall}>Phone: {invoice.seller.phone}</p>}
        </div>

        <div style={partyPreviewBox}>
          <h3 style={previewBoxTitle}>Bill To</h3>
          <p style={partyName}>{invoice.buyer.name || 'Buyer Name'}</p>
          {invoice.buyer.trn && <p style={previewSmall}>TRN: {invoice.buyer.trn}</p>}
          {invoice.buyer.address && <p style={previewSmall}>{invoice.buyer.address}</p>}
          {invoice.buyer.email && <p style={previewSmall}>Email: {invoice.buyer.email}</p>}
          {invoice.buyer.phone && <p style={previewSmall}>Phone: {invoice.buyer.phone}</p>}
        </div>
      </section>

      <table style={previewTable}>
        <thead>
          <tr>
            <th style={thLeft}>Description</th>
            <th style={thRight}>Qty</th>
            <th style={thRight}>Rate</th>
            <th style={thRight}>Taxable</th>
            <th style={thRight}>VAT</th>
            <th style={thRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {totals.items.map((item, index) => (
            <tr key={`${item.id}-${index}`}>
              <td style={tdLeft}>{item.description || 'Item description'}</td>
              <td style={tdRight}>{formatQty(item.qty)}</td>
              <td style={tdRight}>{formatMoney(item.rate)}</td>
              <td style={tdRight}>{formatMoney(item.taxable)}</td>
              <td style={tdRight}>{formatMoney(item.vatAmount)}</td>
              <td style={tdRight}>{formatMoney(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section style={summarySection}>
        <div style={notesBox}>
          {invoice.notes && (
            <>
              <h3 style={previewBoxTitle}>Notes</h3>
              <p style={previewSmall}>{invoice.notes}</p>
            </>
          )}

          {invoice.terms && (
            <>
              <h3 style={previewBoxTitle}>Terms</h3>
              <p style={previewSmall}>{invoice.terms}</p>
            </>
          )}

          {invoice.bankDetails && (
            <>
              <h3 style={previewBoxTitle}>Payment Details</h3>
              <p style={previewSmall}>{invoice.bankDetails}</p>
            </>
          )}
        </div>

        <div style={totalsBox}>
          <SummaryLine label="Subtotal" value={`${invoice.currency} ${formatMoney(totals.subtotal)}`} />
          <SummaryLine label="Discount" value={`${invoice.currency} ${formatMoney(totals.discount)}`} />
          <SummaryLine label="Shipping / Charges" value={`${invoice.currency} ${formatMoney(totals.shipping)}`} />
          <SummaryLine label="VAT Total" value={`${invoice.currency} ${formatMoney(totals.totalVat)}`} />
          <div style={grandLine}>
            <span>Grand Total</span>
            <strong>{invoice.currency} {formatMoney(totals.grandTotal)}</strong>
          </div>
          <SummaryLine label="Amount Paid" value={`${invoice.currency} ${formatMoney(totals.amountPaid)}`} />
          <div style={balanceLine}>
            <span>Balance Due</span>
            <strong>{invoice.currency} {formatMoney(totals.balanceDue)}</strong>
          </div>
        </div>
      </section>

      <section style={vatSummary}>
        <h3 style={previewBoxTitle}>VAT Summary</h3>
        <table style={miniTable}>
          <thead>
            <tr>
              <th style={miniTh}>VAT Rate</th>
              <th style={miniTh}>Taxable Amount</th>
              <th style={miniTh}>VAT Amount</th>
            </tr>
          </thead>
          <tbody>
            {totals.vatSummary.map(row => (
              <tr key={row.rate}>
                <td style={miniTd}>{row.rate}%</td>
                <td style={miniTd}>{invoice.currency} {formatMoney(row.taxable)}</td>
                <td style={miniTd}>{invoice.currency} {formatMoney(row.vat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer style={invoiceFooter}>
        <p>
          This invoice was generated with SHB ToolBox. Please verify tax, legal and payment details before issuing.
        </p>
      </footer>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={summaryLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function calculateInvoice(invoice) {
  const items = invoice.items.map(item => {
    const qty = safeNumber(item.qty);
    const rate = safeNumber(item.rate);
    const vatRate = safeNumber(item.vatRate);
    const rawAmount = qty * rate;

    let taxable;
    let vatAmount;
    let lineTotal;

    if (invoice.taxMode === 'inclusive' && vatRate > 0) {
      taxable = rawAmount / (1 + vatRate / 100);
      vatAmount = rawAmount - taxable;
      lineTotal = rawAmount;
    } else {
      taxable = rawAmount;
      vatAmount = taxable * (vatRate / 100);
      lineTotal = taxable + vatAmount;
    }

    return {
      ...item,
      qty,
      rate,
      vatRate,
      taxable,
      vatAmount,
      lineTotal
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.taxable, 0);
  const discount = Math.min(safeNumber(invoice.discount), subtotal);
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const discountRatio = subtotal > 0 ? subtotalAfterDiscount / subtotal : 1;

  const adjustedItems = items.map(item => ({
    ...item,
    taxable: item.taxable * discountRatio,
    vatAmount: item.vatAmount * discountRatio,
    lineTotal: item.taxable * discountRatio + item.vatAmount * discountRatio
  }));

  const totalVat = adjustedItems.reduce((sum, item) => sum + item.vatAmount, 0);
  const shipping = safeNumber(invoice.shipping);
  const amountPaid = safeNumber(invoice.amountPaid);
  const grandTotal = subtotalAfterDiscount + totalVat + shipping;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const vatMap = new Map();

  adjustedItems.forEach(item => {
    const key = String(item.vatRate);
    const existing = vatMap.get(key) || { rate: item.vatRate, taxable: 0, vat: 0 };
    existing.taxable += item.taxable;
    existing.vat += item.vatAmount;
    vatMap.set(key, existing);
  });

  return {
    items: adjustedItems,
    subtotal,
    discount,
    shipping,
    amountPaid,
    totalVat,
    grandTotal,
    balanceDue,
    vatSummary: Array.from(vatMap.values())
  };
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return safeNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatQty(value) {
  return safeNumber(value).toLocaleString(undefined, {
    maximumFractionDigits: 3
  });
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

const printStyles = `
@media print {
  body {
    background: white !important;
  }

  .no-print {
    display: none !important;
  }

  #print-invoice {
    box-shadow: none !important;
    margin: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    border: none !important;
  }

  @page {
    size: A4;
    margin: 12mm;
  }
}
`;

const loadingWrap = {
  background: '#0f172a',
  color: '#94a3b8',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const pageShell = {
  background: '#0f172a',
  color: '#0f172a',
  minHeight: '100vh',
  fontFamily: 'Inter, system-ui, sans-serif'
};

const toast = {
  position: 'fixed',
  top: '84px',
  right: '20px',
  background: '#38bdf8',
  color: '#0f172a',
  padding: '12px 22px',
  borderRadius: '12px',
  fontWeight: 900,
  zIndex: 2000,
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
};

const topBar = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  height: '70px',
  background: '#1e293b',
  borderBottom: '1px solid #334155',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 22px',
  gap: '16px',
  flexWrap: 'wrap'
};

const brandLink = {
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 950,
  fontSize: '1.2rem'
};

const topActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const mainGrid = {
  maxWidth: '1500px',
  margin: '0 auto',
  padding: '30px 20px 90px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.05fr) minmax(420px, 0.95fr)',
  gap: '24px',
  alignItems: 'start'
};

const editorPanel = {
  display: 'grid',
  gap: '20px'
};

const editorHeader = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '28px',
  padding: '28px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '18px',
  alignItems: 'flex-start'
};

const eyebrow = {
  color: '#38bdf8',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 900,
  fontSize: '0.75rem',
  margin: '0 0 10px'
};

const editorTitle = {
  color: '#fff',
  fontSize: '2.1rem',
  margin: '0 0 10px',
  lineHeight: 1.1
};

const editorText = {
  color: '#cbd5e1',
  lineHeight: 1.7,
  margin: 0
};

const cardStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '26px',
  padding: '24px'
};

const cardTitle = {
  color: '#fff',
  margin: '0 0 18px',
  fontSize: '1.18rem'
};

const twoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px'
};

const threeGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px'
};

const fieldWrap = {
  display: 'grid',
  gap: '8px',
  color: '#fff'
};

const labelStyle = {
  fontSize: '0.76rem',
  color: '#94a3b8',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '14px',
  color: '#fff',
  padding: '13px',
  outline: 'none',
  fontSize: '0.95rem'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '86px',
  resize: 'vertical',
  lineHeight: 1.55
};

const fileStyle = {
  ...inputStyle,
  padding: '11px'
};

const partyBox = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '18px',
  display: 'grid',
  gap: '14px'
};

const partyTitle = {
  color: '#38bdf8',
  margin: 0,
  fontSize: '1rem'
};

const itemsWrap = {
  display: 'grid',
  gap: '14px'
};

const itemRow = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '14px',
  display: 'grid',
  gridTemplateColumns: '42px minmax(180px, 1fr)',
  gap: '14px'
};

const itemNumber = {
  background: '#1e293b',
  color: '#38bdf8',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 950
};

const itemDescription = {
  minWidth: 0
};

const itemInputs = {
  gridColumn: '2 / -1',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))',
  gap: '12px'
};

const lineActions = {
  gridColumn: '2 / -1',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end'
};

const addBtn = {
  width: '100%',
  marginTop: '16px',
  background: 'rgba(56,189,248,0.12)',
  color: '#38bdf8',
  border: '1px solid #334155',
  padding: '14px',
  borderRadius: '14px',
  fontWeight: 950,
  cursor: 'pointer'
};

const draftActions = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const primaryBtn = {
  background: '#38bdf8',
  color: '#082f49',
  border: 'none',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 950,
  cursor: 'pointer'
};

const secondaryBtn = {
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 850,
  cursor: 'pointer'
};

const ghostBtn = {
  background: '#0f172a',
  color: '#cbd5e1',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 850,
  cursor: 'pointer'
};

const darkBtn = {
  background: '#020617',
  color: '#fff',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 950,
  cursor: 'pointer'
};

const lockActiveBtn = {
  ...darkBtn,
  background: '#16a34a'
};

const miniBtn = {
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '9px 11px',
  fontWeight: 800,
  cursor: 'pointer'
};

const dangerMiniBtn = {
  ...miniBtn,
  background: '#7f1d1d'
};

const dangerBtn = {
  background: 'transparent',
  color: '#f87171',
  border: '1px solid #f87171',
  borderRadius: '12px',
  padding: '11px 14px',
  fontWeight: 850,
  cursor: 'pointer'
};

const draftBadge = {
  background: 'rgba(251,191,36,0.12)',
  color: '#fbbf24',
  border: '1px solid rgba(251,191,36,0.3)',
  borderRadius: '999px',
  padding: '8px 12px',
  fontWeight: 950,
  fontSize: '0.8rem'
};

const finalBadge = {
  background: 'rgba(34,197,94,0.12)',
  color: '#22c55e',
  border: '1px solid rgba(34,197,94,0.3)',
  borderRadius: '999px',
  padding: '8px 12px',
  fontWeight: 950,
  fontSize: '0.8rem'
};

const smallNote = {
  color: '#94a3b8',
  lineHeight: 1.65,
  fontSize: '0.9rem',
  margin: '14px 0 0'
};

const previewPanel = {
  position: 'sticky',
  top: '90px'
};

const paperStyle = {
  background: '#fff',
  color: '#111827',
  width: '100%',
  maxWidth: '850px',
  minHeight: '1100px',
  margin: '0 auto',
  borderRadius: '18px',
  padding: '44px',
  boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px'
};

const invoiceHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  borderBottom: '4px solid #111827',
  paddingBottom: '24px'
};

const invoiceTitle = {
  margin: '0 0 14px',
  fontSize: '2.45rem',
  letterSpacing: '-0.06em',
  fontWeight: 950
};

const mutedLine = {
  color: '#475569',
  fontSize: '0.86rem',
  margin: '4px 0'
};

const statusPill = {
  display: 'inline-block',
  margin: '10px 0 0',
  background: '#eff6ff',
  color: '#1d4ed8',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '0.75rem',
  fontWeight: 950
};

const logoWrap = {
  minWidth: '120px',
  display: 'flex',
  justifyContent: 'flex-end'
};

const logoImg = {
  maxWidth: '150px',
  maxHeight: '90px',
  objectFit: 'contain'
};

const logoPlaceholder = {
  width: '130px',
  height: '70px',
  background: '#111827',
  color: '#fff',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 950
};

const partyGridPreview = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px'
};

const partyPreviewBox = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '18px',
  background: '#f8fafc'
};

const previewBoxTitle = {
  margin: '0 0 10px',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748b',
  fontWeight: 950
};

const partyName = {
  margin: '0 0 8px',
  color: '#111827',
  fontWeight: 950,
  fontSize: '1rem'
};

const previewSmall = {
  color: '#475569',
  fontSize: '0.84rem',
  lineHeight: 1.55,
  margin: '4px 0',
  whiteSpace: 'pre-wrap'
};

const previewTable = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thLeft = {
  textAlign: 'left',
  background: '#111827',
  color: '#fff',
  padding: '12px',
  fontSize: '0.75rem'
};

const thRight = {
  ...thLeft,
  textAlign: 'right'
};

const tdLeft = {
  borderBottom: '1px solid #e5e7eb',
  padding: '12px',
  fontSize: '0.84rem',
  verticalAlign: 'top'
};

const tdRight = {
  ...tdLeft,
  textAlign: 'right'
};

const summarySection = {
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  gap: '22px',
  alignItems: 'start'
};

const notesBox = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '16px'
};

const totalsBox = {
  display: 'grid',
  gap: '10px'
};

const summaryLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  color: '#475569',
  fontSize: '0.85rem'
};

const grandLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  borderTop: '3px solid #111827',
  paddingTop: '12px',
  fontSize: '1rem',
  fontWeight: 950
};

const balanceLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '12px',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 950
};

const vatSummary = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '16px'
};

const miniTable = {
  width: '100%',
  borderCollapse: 'collapse'
};

const miniTh = {
  textAlign: 'left',
  color: '#64748b',
  borderBottom: '1px solid #e5e7eb',
  padding: '8px',
  fontSize: '0.78rem'
};

const miniTd = {
  padding: '8px',
  borderBottom: '1px solid #f1f5f9',
  color: '#334155',
  fontSize: '0.82rem'
};

const invoiceFooter = {
  marginTop: 'auto',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '14px',
  color: '#94a3b8',
  fontSize: '0.76rem',
  lineHeight: 1.5
};

const seoSection = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '26px',
  padding: '26px',
  color: '#cbd5e1'
};

const seoTitle = {
  color: '#fff',
  fontSize: '1.55rem',
  margin: '0 0 16px'
};

const seoPara = {
  lineHeight: 1.85,
  margin: '0 0 24px'
};

const seoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  margin: '20px 0 34px'
};

const seoCard = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '18px',
  padding: '18px',
  lineHeight: 1.7
};

const faqGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px'
};

const faqItem = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '18px',
  padding: '18px',
  lineHeight: 1.7
};

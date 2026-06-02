import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import RelatedTools from '../../components/RelatedTools';

const today = new Date().toISOString().slice(0, 10);

const createDefaultInvoice = () => ({
  documentType: 'Tax Invoice',
  invoiceNumber: 'INV-2026-001',
  invoiceDate: today,
  dueDate: '',
  status: 'Draft',
  copyLabel: 'Original',
  currency: 'AED',
  taxMode: 'exclusive',
  discountMode: 'amount',
  discountValue: 0,
  shipping: 0,
  roundOff: 0,
  amountPaid: 0,
  brandColor: '#2563eb',
  template: 'modern',
  fontFamily: 'Inter',
  paperStyle: 'clean',
  printPaperSize: 'A4',
  printOrientation: 'portrait',
  printMargin: 10,
  compactPrint: false,
  showQr: true,
  showVatSummary: true,
  showSignature: true,
  logo: '',
  signature: '',
  seller: {
    name: 'Your Business Name',
    trn: '',
    address: 'Dubai, United Arab Emirates',
    email: '',
    phone: '',
    website: ''
  },
  buyer: {
    name: 'Customer Name',
    trn: '',
    address: '',
    email: '',
    phone: ''
  },
  customField: {
    label: 'Reference',
    value: ''
  },
  items: [
    {
      id: 1,
      description: 'Product or service description',
      qty: 1,
      rate: 0,
      discount: 0,
      vatRate: 5
    }
  ],
  bankDetails: '',
  notes: 'Thank you for your business.',
  terms: 'Payment is due as per the agreed terms. Please verify invoice details before payment.',
  footerNote: 'Generated with SHB ToolBox. Please verify tax, legal and payment details before issuing this document.',
  locked: false
});

const currencies = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR', 'OMR', 'KWD', 'BHD'];
const documentTypes = ['Tax Invoice', 'Invoice', 'Proforma Invoice', 'Quotation', 'Receipt', 'Credit Note'];
const statuses = ['Draft', 'Sent', 'Part Paid', 'Paid', 'Overdue', 'Cancelled'];
const copyLabels = ['Original', 'Duplicate', 'Triplicate', 'Customer Copy', 'Supplier Copy'];
const templates = [
  { value: 'modern', label: 'Modern Blue' },
  { value: 'classic', label: 'Classic Black' },
  { value: 'minimal', label: 'Minimal Clean' },
  { value: 'premium', label: 'Premium Accent' }
];
const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Verdana'];
const paperStyles = ['clean', 'bordered', 'soft'];

export default function InvoiceGenerator() {
  const [mounted, setMounted] = useState(false);
  const [invoice, setInvoice] = useState(createDefaultInvoice);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  const totals = useMemo(() => calculateInvoice(invoice), [invoice]);
  const qrValue = useMemo(() => {
    return [
      invoice.documentType,
      `No: ${invoice.invoiceNumber}`,
      `Date: ${invoice.invoiceDate}`,
      `Seller: ${invoice.seller.name}`,
      invoice.seller.trn ? `Seller TRN: ${invoice.seller.trn}` : '',
      `Buyer: ${invoice.buyer.name}`,
      invoice.buyer.trn ? `Buyer TRN: ${invoice.buyer.trn}` : '',
      `Total: ${invoice.currency} ${formatMoney(totals.grandTotal)}`,
      `Balance: ${invoice.currency} ${formatMoney(totals.balanceDue)}`
    ].filter(Boolean).join('\n');
  }, [invoice, totals]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showToast = (message) => setNotification(message);

  const update = (field, value) => {
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
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
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
          discount: 0,
          vatRate: 5
        }
      ]
    }));
  };

  const duplicateItem = (id) => {
    if (invoice.locked) return;
    setInvoice(prev => {
      const target = prev.items.find(item => item.id === id);
      if (!target) return prev;
      return {
        ...prev,
        items: [...prev.items, { ...target, id: Date.now() }]
      };
    });
  };

  const removeItem = (id) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length <= 1 ? prev.items : prev.items.filter(item => item.id !== id)
    }));
  };

  const moveItem = (index, direction) => {
    if (invoice.locked) return;
    setInvoice(prev => {
      const next = [...prev.items];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return { ...prev, items: next };
    });
  };

  const uploadImage = (field, file) => {
    if (invoice.locked || !file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image should be below 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setInvoice(prev => ({ ...prev, [field]: reader.result }));
      showToast(`${field === 'logo' ? 'Logo' : 'Signature'} uploaded.`);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('shb_invoice_generator_draft', JSON.stringify(invoice));
      showToast('Draft saved in this browser.');
    } catch {
      showToast('Could not save draft.');
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('shb_invoice_generator_draft');
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
    localStorage.removeItem('shb_invoice_generator_draft');
    setInvoice(createDefaultInvoice());
    showToast('Draft cleared.');
  };

  const copySummary = async () => {
    const summary = buildInvoiceSummary(invoice, totals);

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Invoice summary copied.');
    } catch {
      showToast('Copy failed.');
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(buildInvoiceSummary(invoice, totals));
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const downloadPDF = async () => {
    const invoiceNode = document.getElementById('invoice-print-area');

    if (!invoiceNode) {
      showToast('Invoice preview not found.');
      return;
    }

    setPdfGenerating(true);
    showToast('Preparing professional A4 PDF...');

    try {
      const [{ jsPDF }, htmlToImage] = await Promise.all([
        import('jspdf'),
        import('html-to-image')
      ]);

      document.body.classList.add('pdf-export-mode');
      await new Promise(resolve => setTimeout(resolve, 250));

      const canvas = await htmlToImage.toCanvas(invoiceNode, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => !(node.classList && node.classList.contains('no-print'))
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const marginMm = 10;
      const usableWidthMm = pageWidthMm - marginMm * 2;
      const usableHeightMm = pageHeightMm - marginMm * 2;

      const pxPerMm = canvas.width / usableWidthMm;
      const pageHeightPx = Math.floor(usableHeightMm * pxPerMm);
      const pageMarginPx = Math.floor(10 * pxPerMm);

      const avoidRanges = getPdfAvoidRanges(invoiceNode, canvas);
      const breakPoints = getSmartPdfBreakPoints(canvas.height, pageHeightPx, avoidRanges, pageMarginPx);

      for (let pageIndex = 0; pageIndex < breakPoints.length - 1; pageIndex++) {
        const startY = breakPoints[pageIndex];
        const endY = breakPoints[pageIndex + 1];
        const sliceHeight = Math.max(1, endY - startY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          startY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const imgData = pageCanvas.toDataURL('image/png');
        const imgHeightMm = sliceHeight / pxPerMm;

        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(
          imgData,
          'PNG',
          marginMm,
          marginMm,
          usableWidthMm,
          Math.min(imgHeightMm, usableHeightMm),
          undefined,
          'FAST'
        );
      }

      const cleanName = sanitizeFileName(`${invoice.documentType || 'invoice'}-${invoice.invoiceNumber || 'document'}`);
      pdf.save(`${cleanName}.pdf`);

      showToast('PDF downloaded successfully.');
    } catch (error) {
      console.error(error);
      showToast('PDF download failed. Try Print / Save PDF.');
    } finally {
      document.body.classList.remove('pdf-export-mode');
      setPdfGenerating(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const toggleLock = () => {
    setInvoice(prev => ({
      ...prev,
      locked: !prev.locked,
      status: prev.locked ? 'Draft' : prev.status === 'Draft' ? 'Sent' : prev.status
    }));
  };

  if (!mounted) {
    return (
      <div style={loadingWrap}>
        Loading invoice generator...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Free Invoice Generator - UAE VAT Invoice Maker | SHB ToolBox</title>
        <meta
          name="description"
          content="Create professional invoices online with SHB ToolBox. Free invoice generator with UAE VAT fields, TRN, logo, signature, discounts, shipping, payment status, QR code, browser draft saving and print PDF."
        />
      </Head>

      <style>{getPrintStyles(invoice)}</style>
      <style>{`
        #invoice-print-area textarea::-webkit-resizer {
          display: none;
        }
      `}</style>

      <div style={pageShell}>
        {notification && <div style={toast}>{notification}</div>}

        <header style={topBar} className="no-print">
          <Link href="/" style={brandLink}>SHB<span style={{ color: '#38bdf8' }}>ToolBox</span></Link>

          <div style={topActions}>
            <button onClick={saveDraft} style={toolbarBtn}>Save Draft</button>
            <button onClick={loadDraft} style={toolbarBtn}>Load Draft</button>
            <button onClick={copySummary} style={toolbarBtn}>Copy Summary</button>
            <button onClick={shareWhatsApp} style={toolbarBtn}>WhatsApp</button>
            <button onClick={toggleLock} style={invoice.locked ? lockOnBtn : toolbarDarkBtn}>
              {invoice.locked ? 'Edit Mode' : 'Final Lock'}
            </button>
            <button onClick={downloadPDF} disabled={pdfGenerating} style={pdfGenerating ? toolbarDisabledBtn : toolbarPrimaryBtn}>
              {pdfGenerating ? 'Preparing PDF...' : 'Download PDF'}
            </button>
            <button onClick={printInvoice} style={toolbarPrimaryBtn}>Print</button>
          </div>
        </header>

        <main style={workspace}>
          <aside style={settingsPanel} className="no-print">
            <section style={settingsHero}>
              <p style={eyebrow}>Free professional invoice maker</p>
              <h1 style={settingsTitle}>Invoice Generator</h1>
              <p style={settingsText}>
                Edit directly on the invoice, customize branding, calculate VAT, save drafts, and print or save as PDF.
              </p>
            </section>

            <Panel title="Document Setup">
              <Field label="Document type">
                <select value={invoice.documentType} onChange={e => update('documentType', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {documentTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </Field>

              <Field label="Status">
                <select value={invoice.status} onChange={e => update('status', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {statuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </Field>

              <Field label="Copy label">
                <select value={invoice.copyLabel} onChange={e => update('copyLabel', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {copyLabels.map(label => <option key={label}>{label}</option>)}
                </select>
              </Field>

              <Field label="Currency">
                <select value={invoice.currency} onChange={e => update('currency', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {currencies.map(currency => <option key={currency}>{currency}</option>)}
                </select>
              </Field>

              <Field label="VAT mode">
                <select value={invoice.taxMode} onChange={e => update('taxMode', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  <option value="exclusive">VAT exclusive prices</option>
                  <option value="inclusive">VAT inclusive prices</option>
                </select>
              </Field>
            </Panel>

            <Panel title="Design">
              <Field label="Template">
                <select value={invoice.template} onChange={e => update('template', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {templates.map(template => <option key={template.value} value={template.value}>{template.label}</option>)}
                </select>
              </Field>

              <Field label="Brand color">
                <input type="color" value={invoice.brandColor} onChange={e => update('brandColor', e.target.value)} disabled={invoice.locked} style={colorInput} />
              </Field>

              <Field label="Font">
                <select value={invoice.fontFamily} onChange={e => update('fontFamily', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {fonts.map(font => <option key={font}>{font}</option>)}
                </select>
              </Field>

              <Field label="Paper style">
                <select value={invoice.paperStyle} onChange={e => update('paperStyle', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  {paperStyles.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </Field>

              <label style={checkRow}>
                <input type="checkbox" checked={invoice.showQr} onChange={e => update('showQr', e.target.checked)} disabled={invoice.locked} />
                Show QR summary
              </label>

              <label style={checkRow}>
                <input type="checkbox" checked={invoice.showVatSummary} onChange={e => update('showVatSummary', e.target.checked)} disabled={invoice.locked} />
                Show VAT summary
              </label>

              <label style={checkRow}>
                <input type="checkbox" checked={invoice.showSignature} onChange={e => update('showSignature', e.target.checked)} disabled={invoice.locked} />
                Show signature section
              </label>
            </Panel>

            <Panel title="Print & PDF Options">
              <Field label="Paper size">
                <select
                  value={invoice.printPaperSize}
                  onChange={e => update('printPaperSize', e.target.value)}
                  disabled={invoice.locked}
                  style={inputStyle}
                >
                  <option value="A4">A4 - 210 × 297 mm</option>
                  <option value="Letter">Letter - 8.5 × 11 in</option>
                  <option value="Legal">Legal - 8.5 × 14 in</option>
                </select>
              </Field>

              <Field label="Orientation">
                <select
                  value={invoice.printOrientation}
                  onChange={e => update('printOrientation', e.target.value)}
                  disabled={invoice.locked}
                  style={inputStyle}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </Field>

              <Field label="Print margin">
                <select
                  value={invoice.printMargin}
                  onChange={e => update('printMargin', Number(e.target.value))}
                  disabled={invoice.locked}
                  style={inputStyle}
                >
                  <option value={6}>Narrow - 6 mm</option>
                  <option value={10}>Standard - 10 mm</option>
                  <option value={14}>Comfort - 14 mm</option>
                  <option value={18}>Wide - 18 mm</option>
                </select>
              </Field>

              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={invoice.compactPrint}
                  onChange={e => update('compactPrint', e.target.checked)}
                  disabled={invoice.locked}
                />
                Compact print layout
              </label>

              <p style={smallText}>
                For best PDF output, choose “Save as PDF”, turn off browser headers/footers, and enable background graphics if you want colors.
              </p>
            </Panel>

            <Panel title="Logo and Signature">
              <Field label="Upload logo">
                <input type="file" accept="image/*" onChange={e => uploadImage('logo', e.target.files?.[0])} disabled={invoice.locked} style={fileInputStyle} />
              </Field>

              <Field label="Upload signature">
                <input type="file" accept="image/*" onChange={e => uploadImage('signature', e.target.files?.[0])} disabled={invoice.locked} style={fileInputStyle} />
              </Field>
            </Panel>

            <Panel title="Adjustments">
              <Field label="Invoice discount mode">
                <select value={invoice.discountMode} onChange={e => update('discountMode', e.target.value)} disabled={invoice.locked} style={inputStyle}>
                  <option value="amount">Fixed amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </Field>

              <Field label="Invoice discount">
                <input type="number" value={invoice.discountValue} onChange={e => update('discountValue', e.target.value)} disabled={invoice.locked} style={inputStyle} />
              </Field>

              <Field label="Shipping / extra charges">
                <input type="number" value={invoice.shipping} onChange={e => update('shipping', e.target.value)} disabled={invoice.locked} style={inputStyle} />
              </Field>

              <Field label="Round off adjustment">
                <input type="number" value={invoice.roundOff} onChange={e => update('roundOff', e.target.value)} disabled={invoice.locked} style={inputStyle} />
              </Field>

              <Field label="Amount paid">
                <input type="number" value={invoice.amountPaid} onChange={e => update('amountPaid', e.target.value)} disabled={invoice.locked} style={inputStyle} />
              </Field>
            </Panel>

            <Panel title="Browser Draft">
              <div style={draftButtons}>
                <button onClick={saveDraft} style={sideBtn}>Save</button>
                <button onClick={loadDraft} style={sideBtn}>Load</button>
                <button onClick={clearDraft} style={dangerBtn}>Clear</button>
              </div>
              <p style={smallText}>Drafts are saved only in your current browser local storage.</p>
            </Panel>
          </aside>

          <section style={invoiceArea}>
            <InvoicePaper
              invoice={invoice}
              totals={totals}
              qrValue={qrValue}
              update={update}
              updateNested={updateNested}
              updateItem={updateItem}
              addItem={addItem}
              duplicateItem={duplicateItem}
              removeItem={removeItem}
              moveItem={moveItem}
            />

            <section style={seoSection} className="no-print">
              <h2>Free online invoice generator with VAT, TRN and PDF print</h2>
              <p>
                SHB ToolBox Invoice Generator helps freelancers, service providers, shops, online sellers and small businesses
                create professional invoices directly in the browser. You can add seller details, buyer details, TRN fields,
                line items, VAT, discounts, shipping, payment status, bank details, notes, terms, logo and signature.
              </p>

              <div style={seoGrid}>
                <div>
                  <h3>Direct invoice editing</h3>
                  <p>Edit most invoice fields directly on the invoice preview. This makes the workflow faster and more natural than filling long separate forms.</p>
                </div>
                <div>
                  <h3>VAT-ready calculations</h3>
                  <p>Choose VAT inclusive or VAT exclusive prices, set line-level VAT rates and review the VAT summary before printing.</p>
                </div>
                <div>
                  <h3>Privacy-first workflow</h3>
                  <p>Your invoice is created in the browser. Draft saving uses local storage on your device, and you can clear it at any time.</p>
                </div>
              </div>

              <h2>Invoice Generator FAQ</h2>
              <div style={faqGrid}>
                <div>
                  <h3>Can I save the invoice as PDF?</h3>
                  <p>Yes. Click Print / Save PDF and choose “Save as PDF” in your browser print dialog.</p>
                </div>
                <div>
                  <h3>Can I create a UAE VAT invoice?</h3>
                  <p>The tool includes TRN, VAT percentage, VAT amount and VAT summary fields. Always confirm final compliance with your accountant or tax advisor.</p>
                </div>
                <div>
                  <h3>Does this store my invoice online?</h3>
                  <p>No account or backend is used. Saved drafts remain in your browser local storage only.</p>
                </div>
                <div>
                  <h3>Can I add logo and signature?</h3>
                  <p>Yes. You can upload a logo and signature image, then print or save the invoice as PDF.</p>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </>
  );
}

function InvoicePaper({ invoice, totals, qrValue, update, updateNested, updateItem, addItem, duplicateItem, removeItem, moveItem }) {
  const accent = getTemplateColor(invoice);
  const disabled = invoice.locked;

  return (
    <div id="invoice-print-area" style={{
      ...paperStyle,
      fontFamily: `${invoice.fontFamily}, system-ui, sans-serif`,
      border: invoice.paperStyle === 'bordered' ? `2px solid ${accent}` : 'none',
      background: invoice.paperStyle === 'soft' ? '#f8fafc' : '#ffffff'
    }}>
      <div style={{ ...copyWatermark, color: accent }}>{invoice.copyLabel}</div>

      <header style={{ ...invoiceHeader, borderBottomColor: accent }}>
        <div style={headerLeft}>
          <EditableInput
            value={invoice.documentType}
            onChange={value => update('documentType', value)}
            disabled={disabled}
            style={{ ...paperTitle, color: accent }}
          />

          <div style={metaGrid}>
            <PaperField label="Invoice No">
              <EditableInput value={invoice.invoiceNumber} onChange={value => update('invoiceNumber', value)} disabled={disabled} style={paperInput} />
            </PaperField>
            <PaperField label="Invoice Date">
              <input type="date" value={invoice.invoiceDate} onChange={e => update('invoiceDate', e.target.value)} disabled={disabled} style={paperInput} />
            </PaperField>
            <PaperField label="Due Date">
              <input type="date" value={invoice.dueDate} onChange={e => update('dueDate', e.target.value)} disabled={disabled} style={paperInput} />
            </PaperField>
          </div>

          {invoice.customField.label || invoice.customField.value ? (
            <div style={customFieldRow}>
              <EditableInput
                value={invoice.customField.label}
                onChange={value => updateNested('customField', 'label', value)}
                disabled={disabled}
                style={smallPaperInput}
                placeholder="Field label"
              />
              <EditableInput
                value={invoice.customField.value}
                onChange={value => updateNested('customField', 'value', value)}
                disabled={disabled}
                style={smallPaperInput}
                placeholder="Value"
              />
            </div>
          ) : null}
        </div>

        <div style={headerRight}>
          {invoice.logo ? (
            <img src={invoice.logo} style={logoImg} alt="Business logo" />
          ) : (
            <div style={{ ...logoPlaceholder, borderColor: accent, color: accent }}>LOGO</div>
          )}

          <span style={{ ...statusBadge, background: getStatusColor(invoice.status) }}>{invoice.status}</span>
        </div>
      </header>

      <section style={partyGrid}>
        <div style={partyBox}>
          <h3 style={{ ...partyHeading, color: accent }}>From</h3>
          <EditableInput value={invoice.seller.name} onChange={value => updateNested('seller', 'name', value)} disabled={disabled} style={partyNameInput} />
          <PaperField label="TRN">
            <EditableInput value={invoice.seller.trn} onChange={value => updateNested('seller', 'trn', value)} disabled={disabled} style={paperInput} placeholder="Seller TRN" />
          </PaperField>
          <EditableTextarea value={invoice.seller.address} onChange={value => updateNested('seller', 'address', value)} disabled={disabled} style={paperTextarea} placeholder="Seller address" />
          <EditableInput value={invoice.seller.email} onChange={value => updateNested('seller', 'email', value)} disabled={disabled} style={paperInput} placeholder="Seller email" />
          <EditableInput value={invoice.seller.phone} onChange={value => updateNested('seller', 'phone', value)} disabled={disabled} style={paperInput} placeholder="Seller phone" />
          <EditableInput value={invoice.seller.website} onChange={value => updateNested('seller', 'website', value)} disabled={disabled} style={paperInput} placeholder="Website" />
        </div>

        <div style={partyBox}>
          <h3 style={{ ...partyHeading, color: accent }}>Bill To</h3>
          <EditableInput value={invoice.buyer.name} onChange={value => updateNested('buyer', 'name', value)} disabled={disabled} style={partyNameInput} />
          <PaperField label="TRN">
            <EditableInput value={invoice.buyer.trn} onChange={value => updateNested('buyer', 'trn', value)} disabled={disabled} style={paperInput} placeholder="Buyer TRN" />
          </PaperField>
          <EditableTextarea value={invoice.buyer.address} onChange={value => updateNested('buyer', 'address', value)} disabled={disabled} style={paperTextarea} placeholder="Buyer address" />
          <EditableInput value={invoice.buyer.email} onChange={value => updateNested('buyer', 'email', value)} disabled={disabled} style={paperInput} placeholder="Buyer email" />
          <EditableInput value={invoice.buyer.phone} onChange={value => updateNested('buyer', 'phone', value)} disabled={disabled} style={paperInput} placeholder="Buyer phone" />
        </div>
      </section>

      <section>
        <table style={itemTable}>
          <thead>
            <tr>
              <th style={thLeft}>Item Description</th>
              <th style={thRight}>Qty</th>
              <th style={thRight}>Rate</th>
              <th style={thRight}>Disc.</th>
              <th style={thRight}>VAT %</th>
              <th style={thRight}>VAT</th>
              <th style={thRight}>Total</th>
              <th style={thAction} className="no-print">Actions</th>
            </tr>
          </thead>

          <tbody>
            {totals.items.map((item, index) => (
              <tr key={item.id}>
                <td style={tdLeft}>
                  <EditableTextarea value={item.description} onChange={value => updateItem(item.id, 'description', value)} disabled={disabled} style={tableTextarea} />
                </td>
                <td style={tdRight}>
                  <EditableInput type="number" value={item.qty} onChange={value => updateItem(item.id, 'qty', value)} disabled={disabled} style={tableInput} />
                </td>
                <td style={tdRight}>
                  <EditableInput type="number" value={item.rate} onChange={value => updateItem(item.id, 'rate', value)} disabled={disabled} style={tableInput} />
                </td>
                <td style={tdRight}>
                  <EditableInput type="number" value={item.discount} onChange={value => updateItem(item.id, 'discount', value)} disabled={disabled} style={tableInput} />
                </td>
                <td style={tdRight}>
                  <EditableInput type="number" value={item.vatRate} onChange={value => updateItem(item.id, 'vatRate', value)} disabled={disabled} style={tableInput} />
                </td>
                <td style={tdRight}>{formatMoney(item.vatAmount)}</td>
                <td style={tdRight}>{formatMoney(item.lineTotal)}</td>
                <td style={tdAction} className="no-print">
                  <div style={rowActions}>
                    <button onClick={() => moveItem(index, -1)} disabled={disabled || index === 0} style={tinyBtn}>↑</button>
                    <button onClick={() => moveItem(index, 1)} disabled={disabled || index === totals.items.length - 1} style={tinyBtn}>↓</button>
                    <button onClick={() => duplicateItem(item.id)} disabled={disabled} style={tinyBtn}>Copy</button>
                    <button onClick={() => removeItem(item.id)} disabled={disabled || totals.items.length === 1} style={tinyDangerBtn}>×</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem} disabled={disabled} style={{ ...addLineBtn, color: accent, borderColor: accent }} className="no-print">
          + Add item line
        </button>
      </section>

      <section style={summaryGrid}>
        <div style={leftSummary}>
          <BlockTitle color={accent}>Payment Details</BlockTitle>
          <EditableTextarea value={invoice.bankDetails} onChange={value => update('bankDetails', value)} disabled={disabled} style={paperTextareaLarge} placeholder="Bank details, IBAN, payment link or payment instructions" />

          <BlockTitle color={accent}>Notes</BlockTitle>
          <EditableTextarea value={invoice.notes} onChange={value => update('notes', value)} disabled={disabled} style={paperTextareaLarge} />

          <BlockTitle color={accent}>Terms & Conditions</BlockTitle>
          <EditableTextarea value={invoice.terms} onChange={value => update('terms', value)} disabled={disabled} style={paperTextareaLarge} />
        </div>

        <div style={totalsBox}>
          <SummaryLine label="Subtotal" value={`${invoice.currency} ${formatMoney(totals.subtotal)}`} />
          <SummaryLine label="Line Discounts" value={`${invoice.currency} ${formatMoney(totals.lineDiscount)}`} />
          <SummaryLine label="Invoice Discount" value={`${invoice.currency} ${formatMoney(totals.invoiceDiscount)}`} />
          <SummaryLine label="VAT Total" value={`${invoice.currency} ${formatMoney(totals.totalVat)}`} />
          <SummaryLine label="Shipping / Charges" value={`${invoice.currency} ${formatMoney(totals.shipping)}`} />
          <SummaryLine label="Round Off" value={`${invoice.currency} ${formatMoney(totals.roundOff)}`} />

          <div style={{ ...grandTotalLine, borderColor: accent }}>
            <span>Grand Total</span>
            <strong style={{ color: accent }}>{invoice.currency} {formatMoney(totals.grandTotal)}</strong>
          </div>

          <SummaryLine label="Amount Paid" value={`${invoice.currency} ${formatMoney(totals.amountPaid)}`} />

          <div style={{ ...balanceDueLine, background: accent }}>
            <span>Balance Due</span>
            <strong>{invoice.currency} {formatMoney(totals.balanceDue)}</strong>
          </div>
        </div>
      </section>

      {invoice.showVatSummary && (
        <section style={vatBox}>
          <BlockTitle color={accent}>VAT Summary</BlockTitle>
          <table style={vatTable}>
            <thead>
              <tr>
                <th style={vatTh}>VAT Rate</th>
                <th style={vatTh}>Taxable Amount</th>
                <th style={vatTh}>VAT Amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.vatSummary.map(row => (
                <tr key={row.rate}>
                  <td style={vatTd}>{row.rate}%</td>
                  <td style={vatTd}>{invoice.currency} {formatMoney(row.taxable)}</td>
                  <td style={vatTd}>{invoice.currency} {formatMoney(row.vat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer style={invoiceFooter}>
        {invoice.showSignature && (
          <div style={signatureBlock}>
            {invoice.signature ? (
              <img src={invoice.signature} style={signatureImg} alt="Signature" />
            ) : (
              <div style={signatureLine}>Authorized Signature</div>
            )}
          </div>
        )}

        {invoice.showQr && (
          <div style={qrBlock}>
            <QRCodeCanvas value={qrValue} size={86} level="M" includeMargin />
            <span>Invoice QR Summary</span>
          </div>
        )}
      </footer>

      <EditableTextarea
        value={invoice.footerNote || ''}
        onChange={value => update('footerNote', value)}
        disabled={disabled}
        style={verificationNote}
        placeholder="Footer note"
      />
    </div>
  );
}

function EditableInput({ value, onChange, disabled, style, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
      disabled={disabled}
      style={style}
    />
  );
}

function EditableTextarea({ value, onChange, disabled, style, placeholder }) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
      disabled={disabled}
      style={style}
    />
  );
}

function PaperField({ label, children }) {
  return (
    <label style={paperField}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <section style={panelCard}>
      <h2 style={panelTitle}>{title}</h2>
      <div style={panelBody}>{children}</div>
    </section>
  );
}

function BlockTitle({ color, children }) {
  return (
    <h3 style={{ ...blockTitle, color }}>{children}</h3>
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
  const rawItems = invoice.items.map(item => {
    const qty = safeNumber(item.qty);
    const rate = safeNumber(item.rate);
    const itemDiscount = Math.min(safeNumber(item.discount), qty * rate);
    const vatRate = safeNumber(item.vatRate);
    const grossBeforeDiscount = qty * rate;
    const rawAmount = Math.max(0, grossBeforeDiscount - itemDiscount);

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
      discount: itemDiscount,
      vatRate,
      taxable,
      vatAmount,
      lineTotal,
      grossBeforeDiscount
    };
  });

  const subtotalBeforeLineDiscount = rawItems.reduce((sum, item) => sum + item.grossBeforeDiscount, 0);
  const lineDiscount = rawItems.reduce((sum, item) => sum + item.discount, 0);
  const taxableBeforeInvoiceDiscount = rawItems.reduce((sum, item) => sum + item.taxable, 0);

  let invoiceDiscount = 0;
  if (invoice.discountMode === 'percent') {
    invoiceDiscount = taxableBeforeInvoiceDiscount * (safeNumber(invoice.discountValue) / 100);
  } else {
    invoiceDiscount = safeNumber(invoice.discountValue);
  }

  invoiceDiscount = Math.min(Math.max(0, invoiceDiscount), taxableBeforeInvoiceDiscount);
  const discountRatio = taxableBeforeInvoiceDiscount > 0
    ? (taxableBeforeInvoiceDiscount - invoiceDiscount) / taxableBeforeInvoiceDiscount
    : 1;

  const items = rawItems.map(item => ({
    ...item,
    taxable: item.taxable * discountRatio,
    vatAmount: item.vatAmount * discountRatio,
    lineTotal: item.taxable * discountRatio + item.vatAmount * discountRatio
  }));

  const subtotal = taxableBeforeInvoiceDiscount;
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const shipping = safeNumber(invoice.shipping);
  const roundOff = safeNumber(invoice.roundOff);
  const amountPaid = safeNumber(invoice.amountPaid);
  const grandTotal = Math.max(0, subtotal - invoiceDiscount + totalVat + shipping + roundOff);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const vatMap = new Map();
  items.forEach(item => {
    const key = String(item.vatRate);
    const existing = vatMap.get(key) || { rate: item.vatRate, taxable: 0, vat: 0 };
    existing.taxable += item.taxable;
    existing.vat += item.vatAmount;
    vatMap.set(key, existing);
  });

  return {
    items,
    subtotal,
    subtotalBeforeLineDiscount,
    lineDiscount,
    invoiceDiscount,
    totalVat,
    shipping,
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue,
    vatSummary: Array.from(vatMap.values())
  };
}

function buildInvoiceSummary(invoice, totals) {
  return [
    `${invoice.documentType} - ${invoice.invoiceNumber}`,
    `Status: ${invoice.status}`,
    `Date: ${invoice.invoiceDate}`,
    invoice.dueDate ? `Due Date: ${invoice.dueDate}` : '',
    `Seller: ${invoice.seller.name}`,
    invoice.seller.trn ? `Seller TRN: ${invoice.seller.trn}` : '',
    `Buyer: ${invoice.buyer.name}`,
    invoice.buyer.trn ? `Buyer TRN: ${invoice.buyer.trn}` : '',
    `Grand Total: ${invoice.currency} ${formatMoney(totals.grandTotal)}`,
    `Amount Paid: ${invoice.currency} ${formatMoney(totals.amountPaid)}`,
    `Balance Due: ${invoice.currency} ${formatMoney(totals.balanceDue)}`
  ].filter(Boolean).join('\n');
}

function getPdfAvoidRanges(invoiceNode, canvas) {
  const rootBox = invoiceNode.getBoundingClientRect();
  const scaleY = canvas.height / Math.max(1, rootBox.height);

  const selectors = [
    'tr',
    'thead',
    'tfoot',
    'textarea',
    'canvas',
    'img',
    'footer',
    'section'
  ];

  const ranges = [];

  invoiceNode.querySelectorAll(selectors.join(',')).forEach(node => {
    const box = node.getBoundingClientRect();

    if (!box.height || box.height < 8) return;

    const top = (box.top - rootBox.top) * scaleY;
    const bottom = (box.bottom - rootBox.top) * scaleY;

    if (bottom <= 0 || top >= canvas.height) return;

    // Only avoid splitting reasonably sized blocks.
    // Very large blocks are allowed to split because they cannot fit on one page.
    if ((bottom - top) < canvas.height * 0.72) {
      ranges.push({
        top: Math.max(0, top),
        bottom: Math.min(canvas.height, bottom)
      });
    }
  });

  return ranges.sort((a, b) => a.top - b.top);
}

function getSmartPdfBreakPoints(totalHeight, pageHeight, avoidRanges, marginPx) {
  const breaks = [0];
  let current = 0;
  let safety = 0;

  while (current + pageHeight < totalHeight && safety < 100) {
    safety += 1;

    let proposed = current + pageHeight;

    const conflict = avoidRanges.find(range => (
      proposed > range.top + marginPx &&
      proposed < range.bottom - marginPx
    ));

    if (conflict) {
      const beforeBlock = Math.floor(conflict.top - marginPx);

      // Only move the break upward if it leaves a useful amount of content on the page.
      if (beforeBlock > current + pageHeight * 0.45) {
        proposed = beforeBlock;
      } else {
        proposed = Math.ceil(conflict.bottom + marginPx);
      }
    }

    if (proposed <= current + 80) {
      proposed = current + pageHeight;
    }

    proposed = Math.min(proposed, totalHeight);

    breaks.push(proposed);
    current = proposed;
  }

  if (breaks[breaks.length - 1] < totalHeight) {
    breaks.push(totalHeight);
  }

  return breaks;
}

function sanitizeFileName(value) {
  return String(value || 'invoice')
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'invoice';
}

function getTemplateColor(invoice) {
  if (invoice.template === 'classic') return '#111827';
  if (invoice.template === 'minimal') return '#475569';
  if (invoice.template === 'premium') return '#7c3aed';
  return invoice.brandColor || '#2563eb';
}

function getStatusColor(status) {
  if (status === 'Paid') return '#16a34a';
  if (status === 'Part Paid') return '#f59e0b';
  if (status === 'Overdue') return '#dc2626';
  if (status === 'Cancelled') return '#64748b';
  if (status === 'Sent') return '#2563eb';
  return '#475569';
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

function getPrintStyles(invoice) {
  const paperSize = invoice.printPaperSize || 'A4';
  const orientation = invoice.printOrientation || 'portrait';
  const margin = Number(invoice.printMargin) || 10;
  const compact = invoice.compactPrint;

  const paperWidth = paperSize === 'Letter' ? '216mm' : paperSize === 'Legal' ? '216mm' : '210mm';
  const paperMinHeight = paperSize === 'Letter' ? '279mm' : paperSize === 'Legal' ? '356mm' : '297mm';

  return `
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box !important;
  }

  html,
  body {
    width: 100% !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
  }

  body > div,
  #__next {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .no-print {
    display: none !important;
  }

  #invoice-print-area {
    display: block !important;
    width: ${paperWidth} !important;
    max-width: ${paperWidth} !important;
    min-height: ${paperMinHeight} !important;
    margin: 0 auto !important;
    padding: ${compact ? '8mm' : '11mm'} !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }

  #invoice-print-area input,
  #invoice-print-area textarea,
  #invoice-print-area select {
    border: none !important;
    outline: none !important;
    background: transparent !important;
    box-shadow: none !important;
    resize: none !important;
    overflow: hidden !important;
    color: #111827 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  #invoice-print-area textarea {
    min-height: ${compact ? '28px' : '38px'} !important;
  }

  #invoice-print-area table {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

  #invoice-print-area tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  #invoice-print-area img,
  #invoice-print-area canvas,
  #invoice-print-area svg {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  #invoice-print-area button {
    display: none !important;
  }

  @page {
    size: ${paperSize} ${orientation};
    margin: ${margin}mm;
  }
}
`;
}

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
  color: '#fff',
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
  zIndex: 3000,
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
};

const topBar = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  minHeight: '70px',
  background: '#1e293b',
  borderBottom: '1px solid #334155',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '12px 22px',
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

const toolbarBtn = {
  background: '#0f172a',
  color: '#cbd5e1',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '10px 12px',
  fontWeight: 850,
  cursor: 'pointer'
};

const toolbarDarkBtn = {
  ...toolbarBtn,
  background: '#020617',
  color: '#fff'
};

const lockOnBtn = {
  ...toolbarBtn,
  background: '#16a34a',
  color: '#fff'
};

const toolbarPrimaryBtn = {
  background: '#38bdf8',
  color: '#082f49',
  border: 'none',
  borderRadius: '12px',
  padding: '10px 12px',
  fontWeight: 950,
  cursor: 'pointer'
};

const toolbarDisabledBtn = {
  ...toolbarPrimaryBtn,
  opacity: 0.55,
  cursor: 'not-allowed'
};

const workspace = {
  maxWidth: '1560px',
  margin: '0 auto',
  padding: '28px 20px 90px',
  display: 'grid',
  gridTemplateColumns: '340px minmax(0, 1fr)',
  gap: '24px',
  alignItems: 'start'
};

const settingsPanel = {
  position: 'sticky',
  top: '92px',
  display: 'grid',
  gap: '16px'
};

const settingsHero = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '24px',
  padding: '22px'
};

const eyebrow = {
  color: '#38bdf8',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 900,
  fontSize: '0.72rem',
  margin: '0 0 10px'
};

const settingsTitle = {
  color: '#fff',
  fontSize: '1.8rem',
  margin: '0 0 10px'
};

const settingsText = {
  color: '#cbd5e1',
  lineHeight: 1.65,
  margin: 0
};

const panelCard = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '22px',
  padding: '18px'
};

const panelTitle = {
  color: '#fff',
  margin: '0 0 14px',
  fontSize: '1rem'
};

const panelBody = {
  display: 'grid',
  gap: '14px'
};

const fieldWrap = {
  display: 'grid',
  gap: '8px'
};

const fieldLabel = {
  color: '#94a3b8',
  fontSize: '0.76rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '13px',
  color: '#fff',
  padding: '12px',
  outline: 'none'
};

const fileInputStyle = {
  ...inputStyle,
  padding: '10px'
};

const colorInput = {
  width: '100%',
  height: '46px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '13px',
  padding: '6px',
  cursor: 'pointer'
};

const checkRow = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  color: '#cbd5e1',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

const draftButtons = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '8px'
};

const sideBtn = {
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '10px',
  fontWeight: 850,
  cursor: 'pointer'
};

const dangerBtn = {
  ...sideBtn,
  background: '#7f1d1d'
};

const smallText = {
  color: '#94a3b8',
  lineHeight: 1.6,
  fontSize: '0.85rem',
  margin: 0
};

const invoiceArea = {
  display: 'grid',
  gap: '28px'
};

const paperStyle = {
  position: 'relative',
  background: '#fff',
  color: '#111827',
  maxWidth: '980px',
  width: '100%',
  minHeight: '1280px',
  margin: '0 auto',
  borderRadius: '20px',
  padding: '46px',
  boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  overflow: 'hidden'
};

const copyWatermark = {
  position: 'absolute',
  right: '42px',
  top: '18px',
  fontSize: '0.72rem',
  fontWeight: 950,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  opacity: 0.6
};

const invoiceHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '28px',
  borderBottom: '4px solid',
  paddingBottom: '26px',
  marginBottom: '26px'
};

const headerLeft = {
  flex: 1
};

const headerRight = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '16px'
};

const paperTitle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '2.7rem',
  fontWeight: 950,
  letterSpacing: '-0.06em',
  marginBottom: '16px'
};

const metaGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
  gap: '12px',
  maxWidth: '650px'
};

const paperField = {
  display: 'grid',
  gap: '4px',
  color: '#64748b',
  fontSize: '0.72rem',
  fontWeight: 900,
  textTransform: 'uppercase'
};

const paperInput = {
  width: '100%',
  border: '1px solid transparent',
  background: 'rgba(15,23,42,0.035)',
  borderRadius: '10px',
  padding: '8px',
  color: '#111827',
  outline: 'none',
  fontSize: '0.86rem'
};

const smallPaperInput = {
  ...paperInput,
  fontSize: '0.78rem'
};

const customFieldRow = {
  display: 'grid',
  gridTemplateColumns: '130px 1fr',
  gap: '8px',
  maxWidth: '420px',
  marginTop: '12px'
};

const logoImg = {
  maxWidth: '160px',
  maxHeight: '92px',
  objectFit: 'contain'
};

const logoPlaceholder = {
  width: '150px',
  height: '78px',
  border: '2px dashed',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 950
};

const statusBadge = {
  color: '#fff',
  borderRadius: '999px',
  padding: '7px 12px',
  fontWeight: 950,
  fontSize: '0.78rem'
};

const partyGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px',
  marginBottom: '28px'
};

const partyBox = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  padding: '18px',
  display: 'grid',
  gap: '8px'
};

const partyHeading = {
  margin: '0 0 6px',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 950
};

const partyNameInput = {
  ...paperInput,
  fontSize: '1rem',
  fontWeight: 950,
  background: 'transparent',
  padding: '4px 0'
};

const paperTextarea = {
  ...paperInput,
  minHeight: '54px',
  resize: 'vertical',
  lineHeight: 1.45
};

const paperTextareaLarge = {
  ...paperInput,
  minHeight: '70px',
  resize: 'vertical',
  lineHeight: 1.5,
  background: 'transparent',
  padding: '4px 0'
};

const itemTable = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '12px'
};

const thLeft = {
  textAlign: 'left',
  background: '#111827',
  color: '#fff',
  padding: '12px',
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const thRight = {
  ...thLeft,
  textAlign: 'right'
};

const thAction = {
  ...thLeft,
  textAlign: 'center',
  width: '160px'
};

const tdLeft = {
  borderBottom: '1px solid #e5e7eb',
  padding: '10px',
  verticalAlign: 'top'
};

const tdRight = {
  ...tdLeft,
  textAlign: 'right',
  fontSize: '0.84rem'
};

const tdAction = {
  ...tdLeft,
  textAlign: 'center'
};

const tableInput = {
  width: '82px',
  border: '1px solid transparent',
  background: 'rgba(15,23,42,0.035)',
  borderRadius: '8px',
  padding: '7px',
  color: '#111827',
  outline: 'none',
  textAlign: 'right'
};

const tableTextarea = {
  width: '100%',
  minHeight: '42px',
  border: '1px solid transparent',
  background: 'rgba(15,23,42,0.035)',
  borderRadius: '8px',
  padding: '8px',
  color: '#111827',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.4
};

const rowActions = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '5px',
  justifyContent: 'center'
};

const tinyBtn = {
  background: '#e2e8f0',
  color: '#0f172a',
  border: 'none',
  borderRadius: '8px',
  padding: '5px 7px',
  fontSize: '0.68rem',
  fontWeight: 850,
  cursor: 'pointer'
};

const tinyDangerBtn = {
  ...tinyBtn,
  background: '#fee2e2',
  color: '#991b1b'
};

const addLineBtn = {
  background: 'transparent',
  border: '1px dashed',
  borderRadius: '12px',
  width: '100%',
  padding: '11px',
  fontWeight: 950,
  cursor: 'pointer',
  marginBottom: '26px'
};

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 330px',
  gap: '28px',
  alignItems: 'start',
  marginTop: '26px'
};

const leftSummary = {
  display: 'grid',
  gap: '12px'
};

const blockTitle = {
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '8px 0 0',
  fontWeight: 950
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
  fontSize: '0.87rem'
};

const grandTotalLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  borderTop: '3px solid',
  paddingTop: '12px',
  fontSize: '1rem',
  fontWeight: 950
};

const balanceDueLine = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  color: '#fff',
  padding: '12px',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 950
};

const vatBox = {
  marginTop: '26px',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '16px'
};

const vatTable = {
  width: '100%',
  borderCollapse: 'collapse'
};

const vatTh = {
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  padding: '8px',
  color: '#64748b',
  fontSize: '0.78rem'
};

const vatTd = {
  padding: '8px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '0.84rem',
  color: '#334155'
};

const invoiceFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  alignItems: 'flex-end',
  marginTop: '34px',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px'
};

const signatureBlock = {
  minWidth: '220px'
};

const signatureImg = {
  maxWidth: '190px',
  maxHeight: '70px',
  objectFit: 'contain'
};

const signatureLine = {
  borderTop: '1px solid #94a3b8',
  paddingTop: '8px',
  color: '#64748b',
  fontSize: '0.82rem',
  width: '190px',
  textAlign: 'center'
};

const qrBlock = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  alignItems: 'center',
  color: '#64748b',
  fontSize: '0.72rem',
  fontWeight: 850
};

const verificationNote = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#94a3b8',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  marginTop: '24px',
  minHeight: '38px',
  resize: 'vertical',
  overflow: 'hidden',
  fontFamily: 'inherit',
  display: 'block'
};

const seoSection = {
  maxWidth: '980px',
  margin: '0 auto',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '24px',
  padding: '28px',
  color: '#cbd5e1',
  lineHeight: 1.8
};

const seoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  margin: '24px 0'
};

const faqGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px'
};
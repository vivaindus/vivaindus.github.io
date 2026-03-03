import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InvoiceLogicEngine } from '../../engine-data/logic'; // Our financial engine
import { invoiceStyles } from './styles'; // Dedicated styles

export default function EnterpriseInvoiceApp() {
  const [status, setStatus] = useState('DRAFT'); // DRAFT, FINAL, CANCELLED
  const [currentRevision, setCurrentRevision] = useState(1);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Invoice Data State - Comprehensive to match all Refrens.com features
  const [invoice, setInvoice] = useState({
    invoiceTitle: "Tax Invoice",
    invoiceNumber: "INV-2026-0001",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    supplyDate: "",
    poReference: "",
    currency: "AED",
    exchangeRate: 1.0,
    reverseCharge: false,
    
    // Business Details
    billedBy: { name: "", taxId: "", address: "", phone: "", email: "", website: "", bankDetails: "" },
    
    // Client Details
    billedTo: { name: "", taxId: "", address: "", shippingAddress: "", phone: "", email: "" },
    
    // Line Items & Dynamic Columns
    columns: [
      { key: 'sn', label: 'SN', visible: true, width: '40px', print: true },
      { key: 'itemCode', label: 'Item Code', visible: false, width: '80px', print: true },
      { key: 'name', label: 'Item', visible: true, width: 'auto', print: true },
      { key: 'description', label: 'Description', visible: true, width: '200px', print: true },
      { key: 'hsn', label: 'HSN/SAC', visible: false, width: '80px', print: true },
      { key: 'qty', label: 'Qty', visible: true, width: '70px', print: true },
      { key: 'unit', label: 'Unit', visible: false, width: '60px', print: true },
      { key: 'unitPrice', label: 'Rate', visible: true, width: '100px', print: true },
      { key: 'lineCharge', label: 'Charge', visible: false, width: '80px', print: true },
      { key: 'lineDiscount', label: 'Discount', visible: true, width: '80px', print: true },
      { key: 'taxRate', label: 'VAT %', visible: true, width: '70px', print: true },
      { key: 'netAmount', label: 'Net Amt', visible: false, width: '100px', print: true },
      { key: 'taxAmount', label: 'Tax Amt', visible: false, width: '100px', print: true },
      { key: 'grossAmount', label: 'Gross Amt', visible: false, width: '100px', print: true },
      { key: 'total', label: 'Amount', visible: true, width: '120px', print: true },
      { key: 'costPrice', label: 'Cost', visible: false, width: '80px', isPrivate: true, print: false } // Private & hidden in print
    ],
    items: [{ 
      id: Date.now(), name: "Service A", description: "", hsn: "", qty: 1, unit: "Pcs", unitPrice: 100, 
      lineCharge: 0, chargeType: 'fixed', // Line-level charge
      lineDiscount: 0, discountType: 'percent', // Line-level discount
      taxRate: 5, itemCode: "", costPrice: 0 
    }],

    // Global Adjustments
    globalDiscount: { value: 0, type: 'percent', layer: 'before_tax', print: true }, // Global discount config
    extraCharges: [{ id: 'shipping', name: 'Shipping', value: 0, taxable: true, taxRate: 5, print: true }], // Extra charges
    tdsRate: 0, // TDS rate

    // Calculation & UI Config
    config: { roundingMode: 'HALF_EVEN', precision: 2, taxInclusive: false },
    manualRounding: null, // 'up' or 'down'

    // Document Footer
    invoiceNotes: "Thank you for your business. We appreciate your prompt payment.",
    paymentTerms: "Payment due within 30 days.",
    signatureImage: null, // Base64 or URL for signature
    qrCodePlaceholder: true, // Show QR code placeholder
  });

  // Calculate totals using the financial engine
  const calculatedTotals = useMemo(() => {
    const engine = new InvoiceLogic(invoice.config);
    return engine.calculate(invoice);
  }, [invoice]);

  const validationErrors = useMemo(() => InvoiceLogic.validate(invoice), [invoice]);

  const isLocked = status === 'FINAL';

  // --- UI Update Handlers ---
  const updateInvoice = (field, value, path = []) => {
    const newState = JSON.parse(JSON.stringify(invoice)); // Deep copy for immutability
    let current = newState;
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        current[path[i]][field] = value;
      } else {
        current = current[path[i]];
      }
    }
    if (path.length === 0) { // Top-level field
      newState[field] = value;
    }
    setInvoice(newState);
  };

  const updateItem = (itemId, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItemRow = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(), name: "", description: "", hsn: "", qty: 1, unit: "Pcs", unitPrice: 0,
        lineCharge: 0, chargeType: 'fixed',
        lineDiscount: 0, discountType: 'percent',
        taxRate: 5, itemCode: "", costPrice: 0
      }]
    }));
  };

  const removeItemRow = (idToRemove) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== idToRemove)
    }));
  };

  const toggleColumnVisibility = (key) => {
    setInvoice(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    }));
  };

  const toggleColumnPrintVisibility = (key) => {
    setInvoice(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.key === key ? { ...col, print: !col.print } : col
      )
    }));
  };

  const handleFinalize = () => {
    if (validationErrors.length > 0) {
      setShowValidationErrors(true);
      alert("Please fix validation errors before finalizing.");
      return;
    }
    if (window.confirm("Finalizing this invoice will lock it for editing. Continue?")) {
      setStatus('FINAL');
      // In a real app, this would save to Supabase / backend and mark as immutable
      // For this prototype, it just locks the UI
    }
  };

  const handleCreateNewRevision = () => {
    if (window.confirm("Creating a new revision will unlock the invoice for editing. Continue?")) {
      setStatus('DRAFT');
      setCurrentRevision(prev => prev + 1);
      // In a real app, this would create a new entry in a revision history table
    }
  };

  const handleDownloadPDF = () => {
    window.print(); // Uses browser's native print to PDF for selectable text
  };

  // --- Render ---
  return (
    <div className="refrens-layout">
      {/* Inject styles dynamically */}
      <style>{invoiceStyles}</style>

      {/* Validation Errors Overlay */}
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="no-print" style={{position: 'fixed', top: '1rem', right: '1rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', zIndex: 1000, maxWidth: '300px'}}>
          <h3 style={{marginTop: 0, fontSize: '1rem'}}>Validation Errors:</h3>
          <ul style={{margin: 0, paddingLeft: '1.2rem', listStyleType: 'disc'}}>
            {validationErrors.map((error, idx) => (
              <li key={idx} style={{marginBottom: '0.25rem', fontSize: '0.85rem'}}>{error}</li>
            ))}
          </ul>
          <button onClick={() => setShowValidationErrors(false)} className="btn btn-secondary btn-small mt-3">Dismiss</button>
        </div>
      )}

      <div className="grid-container">
        {/* LEFT SECTION: Editor Controls */}
        <div className="controls-panel space-y-4 no-print">
          {/* Main Actions */}
          <div className="card">
            <h2 className="card-header">Document Actions</h2>
            <button className="btn btn-primary w-full mb-2" onClick={handleFinalize} disabled={isLocked}>
              {isLocked ? '🔒 Finalized & Locked' : 'Finalize & Lock'}
            </button>
            <button className="btn btn-secondary w-full" onClick={handleDownloadPDF}>
              Download PDF
            </button>
            {isLocked && (
              <button className="btn btn-outline w-full mt-2" onClick={handleCreateNewRevision}>
                Create New Revision (Unlock)
              </button>
            )}
          </div>

          {/* Core Invoice Details */}
          <div className="card">
            <h2 className="card-header">Invoice Details</h2>
            <div className="mb-3">
              <label className="input-label">Invoice Title</label>
              <input className="r-input" value={invoice.invoiceTitle} onChange={e => updateInvoice('invoiceTitle', e.target.value)} disabled={isLocked} />
            </div>
            <div className="mb-3">
              <label className="input-label">Invoice Number</label>
              <input className="r-input" value={invoice.invoiceNumber} onChange={e => updateInvoice('invoiceNumber', e.target.value)} disabled={isLocked} />
            </div>
            <div className="row mb-3">
              <div>
                <label className="input-label">Issue Date</label>
                <input type="date" className="r-input" value={invoice.issueDate} onChange={e => updateInvoice('issueDate', e.target.value)} disabled={isLocked} />
              </div>
              <div>
                <label className="input-label">Due Date</label>
                <input type="date" className="r-input" value={invoice.dueDate} onChange={e => updateInvoice('dueDate', e.target.value)} disabled={isLocked} />
              </div>
            </div>
            <div className="mb-3">
              <label className="input-label">PO Reference</label>
              <input className="r-input" value={invoice.poReference} onChange={e => updateInvoice('poReference', e.target.value)} disabled={isLocked} />
            </div>
            <div className="row mb-3">
              <div>
                <label className="input-label">Currency</label>
                <select className="r-select" value={invoice.currency} onChange={e => updateInvoice('currency', e.target.value)} disabled={isLocked}>
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="input-label">Exchange Rate</label>
                <input type="number" step="0.0001" className="r-input" value={invoice.exchangeRate} onChange={e => updateInvoice('exchangeRate', parseFloat(e.target.value))} disabled={isLocked} />
              </div>
            </div>
          </div>

          {/* Business & Client Details */}
          <div className="card">
            <h2 className="section-heading">Business Details</h2>
            <div className="mb-3"><label className="input-label">Company Name</label><input className="r-input" value={invoice.billedBy.name} onChange={e => updateInvoice('name', e.target.value, ['billedBy'])} disabled={isLocked} /></div>
            <div className="mb-3"><label className="input-label">TRN / Tax ID</label><input className="r-input" value={invoice.billedBy.taxId} onChange={e => updateInvoice('taxId', e.target.value, ['billedBy'])} disabled={isLocked} /></div>
            <div className="mb-3"><label className="input-label">Address</label><textarea className="r-textarea" value={invoice.billedBy.address} onChange={e => updateInvoice('address', e.target.value, ['billedBy'])} disabled={isLocked} /></div>
            <h2 className="section-heading mt-4">Client Details</h2>
            <div className="mb-3"><label className="input-label">Client Name</label><input className="r-input" value={invoice.billedTo.name} onChange={e => updateInvoice('name', e.target.value, ['billedTo'])} disabled={isLocked} /></div>
            <div className="mb-3"><label className="input-label">Client TRN</label><input className="r-input" value={invoice.billedTo.taxId} onChange={e => updateInvoice('taxId', e.target.value, ['billedTo'])} disabled={isLocked} /></div>
            <div className="mb-3"><label className="input-label">Client Address</label><textarea className="r-textarea" value={invoice.billedTo.address} onChange={e => updateInvoice('address', e.target.value, ['billedTo'])} disabled={isLocked} /></div>
            <button className="field-toggle-btn" onClick={() => updateInvoice('showShippingAddress', !invoice.showShippingAddress, ['billedTo'])}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg> Add Shipping Address
            </button>
            {invoice.billedTo.showShippingAddress && (
                <div className="mb-3 mt-2"><label className="input-label">Shipping Address</label><textarea className="r-textarea" value={invoice.billedTo.shippingAddress} onChange={e => updateInvoice('shippingAddress', e.target.value, ['billedTo'])} disabled={isLocked} /></div>
            )}
          </div>

          {/* Line Item & Column Management */}
          <div className="card">
            <h2 className="section-heading">Line Items & Columns</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {invoice.columns.map(col => (
                <span key={col.key} className={`column-control-pill ${col.visible ? 'active' : ''}`} onClick={() => toggleColumnVisibility(col.key)}>
                  {col.label} {col.isPrivate && ' (P)'}
                </span>
              ))}
            </div>
            {invoice.items.map((item, idx) => (
              <div key={item.id} className={`card mb-3 ${isLocked ? 'section-locked' : ''}`}>
                <div className="card-header">
                  <h3 style={{fontSize: '1rem'}}>Item #{idx + 1}</h3>
                  <button className="btn btn-danger btn-small" onClick={() => removeItemRow(item.id)} disabled={isLocked}>X</button>
                </div>
                <div className="mb-3"><label className="input-label">Item Name</label><input className="r-input" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} disabled={isLocked} /></div>
                <div className="mb-3"><label className="input-label">Description</label><textarea className="r-textarea" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} disabled={isLocked} /></div>
                <div className="row mb-3">
                  <div><label className="input-label">Qty</label><input type="number" className="r-input" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value))} disabled={isLocked} /></div>
                  <div><label className="input-label">Unit</label><input className="r-input" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} disabled={isLocked} /></div>
                  <div><label className="input-label">Unit Price</label><input type="number" className="r-input" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} disabled={isLocked} /></div>
                </div>
                <div className="row mb-3">
                  <div><label className="input-label">Line Discount (%)</label><input type="number" className="r-input" value={item.lineDiscount} onChange={e => updateItem(item.id, 'lineDiscount', parseFloat(e.target.value))} disabled={isLocked} /></div>
                  <div><label className="input-label">Tax Rate (%)</label><input type="number" className="r-input" value={item.taxRate} onChange={e => updateItem(item.id, 'taxRate', parseFloat(e.target.value))} disabled={isLocked} /></div>
                </div>
              </div>
            ))}
            <button className="btn-add-line" onClick={addItemRow} disabled={isLocked}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg> Add New Line
            </button>
          </div>

          {/* Global Adjustments */}
          <div className="card">
            <h2 className="section-heading">Global Adjustments</h2>
            <div className="mb-3">
              <label className="input-label">Global Discount Value</label>
              <input type="number" className="r-input" value={invoice.globalDiscount.value} onChange={e => updateInvoice('value', parseFloat(e.target.value), ['globalDiscount'])} disabled={isLocked} />
            </div>
            <div className="row mb-3">
              <div>
                <label className="input-label">Type</label>
                <select className="r-select" value={invoice.globalDiscount.type} onChange={e => updateInvoice('type', e.target.value, ['globalDiscount'])} disabled={isLocked}>
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
              <div>
                <label className="input-label">Apply Layer</label>
                <select className="r-select" value={invoice.globalDiscount.layer} onChange={e => updateInvoice('layer', e.target.value, ['globalDiscount'])} disabled={isLocked}>
                  <option value="before_tax">Before Tax</option>
                  <option value="after_tax">After Tax</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="input-label">TDS Rate (%)</label>
              <input type="number" className="r-input" value={invoice.tdsRate} onChange={e => updateInvoice('tdsRate', parseFloat(e.target.value))} disabled={isLocked} />
            </div>
            <h3 className="input-label mt-4">Extra Charges</h3>
            {invoice.extraCharges.map(charge => (
              <div key={charge.id} className="row mb-2">
                <div><input className="r-input" value={charge.name} onChange={e => updateInvoice('name', e.target.value, ['extraCharges', invoice.extraCharges.findIndex(c => c.id === charge.id)])} disabled={isLocked} /></div>
                <div><input type="number" className="r-input" value={charge.value} onChange={e => updateInvoice('value', parseFloat(e.target.value), ['extraCharges', invoice.extraCharges.findIndex(c => c.id === charge.id)])} disabled={isLocked} /></div>
              </div>
            ))}
          </div>

          {/* Configuration & Controls */}
          <div className="card">
            <h2 className="section-heading">Calculation Config</h2>
            <div className="mb-3"><label className="input-label">Decimal Precision</label><input type="number" className="r-input" value={invoice.config.precision} onChange={e => updateInvoice('precision', parseInt(e.target.value), ['config'])} disabled={isLocked} /></div>
            <div className="mb-3"><label className="input-label">Rounding Mode</label><select className="r-select" value={invoice.config.roundingMode} onChange={e => updateInvoice('roundingMode', e.target.value, ['config'])} disabled={isLocked}><option value="HALF_EVEN">Banker's (Half-Even)</option><option value="HALF_UP">Standard (Half-Up)</option></select></div>
            <div className="mb-3"><label className="input-label">Tax Mode</label><select className="r-select" value={invoice.config.taxInclusive ? 'inclusive' : 'exclusive'} onChange={e => updateInvoice('taxInclusive', e.target.value === 'inclusive', ['config'])} disabled={isLocked}><option value="exclusive">Exclusive</option><option value="inclusive">Inclusive</option></select></div>
            <h3 className="input-label mt-4">Manual Rounding</h3>
            <div className="row">
              <button className="btn btn-outline w-full" onClick={() => updateInvoice('manualRounding', 'up')} disabled={isLocked}>Round Up</button>
              <button className="btn btn-outline w-full" onClick={() => updateInvoice('manualRounding', 'down')} disabled={isLocked}>Round Down</button>
              <button className="btn btn-outline w-full" onClick={() => updateInvoice('manualRounding', null)} disabled={isLocked}>Clear</button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Invoice Preview */}
        <div className="invoice-preview-wrapper card sticky top-4">
          <div className="invoice-paper" id="invoicePreview">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="flex-1">
                <h1 style={{fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem'}}>{invoice.invoiceTitle}</h1>
                <h2 style={{fontSize: '1.5rem', fontWeight: 700}}>{invoice.billedBy.name || "YOUR COMPANY NAME"}</h2>
                <p style={{fontSize: '0.8rem', color: '#4b5563', marginTop: '0.25rem'}}>{invoice.billedBy.address}</p>
                <p style={{fontSize: '0.8rem', color: '#4b5563'}}>TRN: {invoice.billedBy.taxId}</p>
              </div>
              <div className="company-logo-placeholder">
                <img src={invoice.billedBy.logo} alt="Company Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                {!invoice.billedBy.logo && 'LOGO'}
              </div>
            </div>

            {/* Invoice Meta & Client Details */}
            <div className="flex justify-between gap-10 mb-12 border-y border-slate-100 py-8">
              <div className="flex-1 space-y-1">
                <span className="input-label" style={{color: '#2563eb'}}>BILLED TO</span>
                <p style={{fontSize: '1rem', fontWeight: 700}}>{invoice.billedTo.name || "Client Name"}</p>
                <p style={{fontSize: '0.8rem', color: '#4b5563'}}>{invoice.billedTo.address}</p>
                {invoice.billedTo.taxId && <p style={{fontSize: '0.8rem', color: '#4b5563'}}>TRN: {invoice.billedTo.taxId}</p>}
              </div>
              <div style={{width: '240px'}} className="space-y-1">
                <div className="flex justify-between"><span className="input-label">Invoice #</span><span className="font-bold text-sm">{invoice.invoiceNumber}</span></div>
                <div className="flex justify-between"><span className="input-label">Issue Date</span><span className="font-bold text-sm">{invoice.issueDate}</span></div>
                <div className="flex justify-between"><span className="input-label">Due Date</span><span className="font-bold text-sm">{invoice.dueDate}</span></div>
                <div className="flex justify-between"><span className="input-label">Currency</span><span className="font-bold text-sm">{invoice.currency}</span></div>
                {invoice.poReference && <div className="flex justify-between"><span className="input-label">PO Ref.</span><span className="font-bold text-sm">{invoice.poReference}</span></div>}
              </div>
            </div>

            {/* Items Table */}
            <table className="invoice-table mb-8">
              <thead>
                <tr>
                  {invoice.columns.filter(c => c.visible && c.print).map(col => (
                    <th key={col.key} style={{width: col.width}}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calculatedTotals.items.map((item, idx) => (
                  <tr key={item.id}>
                    {invoice.columns.filter(c => c.visible && c.print).map(col => (
                      <td key={col.key} className={col.isPrivate ? 'private-col-print-hidden' : ''}>
                        {col.key === 'sn' ? (idx + 1) :
                         col.key === 'total' ? (item.grossAmount || 0).toFixed(2) :
                         item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="totals-summary">
              <div className="totals-row"><span>Subtotal (Net)</span> <span>{calculatedTotals.subtotal.toFixed(2)}</span></div>
              {calculatedTotals.totalLineDiscount !== 0 && <div className="totals-row"><span>Line Discounts</span> <span>-{calculatedTotals.totalLineDiscount.toFixed(2)}</span></div>}
              {calculatedTotals.totalGlobalDiscount !== 0 && <div className="totals-row"><span>Global Discount</span> <span>-{calculatedTotals.totalGlobalDiscount.toFixed(2)}</span></div>}
              {calculatedTotals.totalExtraCharges !== 0 && <div className="totals-row"><span>Extra Charges</span> <span>{calculatedTotals.totalExtraCharges.toFixed(2)}</span></div>}
              {Object.entries(calculatedTotals.taxSummary).map(([rate, amount]) => (
                <div key={rate} className="totals-row text-xs text-slate-500"><span>VAT @ {rate}%</span> <span>{amount.toFixed(2)}</span></div>
              ))}
              {calculatedTotals.tdsAmount !== 0 && <div className="totals-row" style={{color: '#dc2626'}}><span>TDS Deduction</span> <span>-{calculatedTotals.tdsAmount.toFixed(2)}</span></div>}
              {calculatedTotals.roundingAdjustment !== 0 && <div className="totals-row text-xs text-slate-500 italic"><span>Rounding Adj.</span> <span>{calculatedTotals.roundingAdjustment.toFixed(2)}</span></div>}
              <div className="totals-row grand-total">
                <span>Total Due</span>
                <span>{invoice.currency} {calculatedTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: invoice.config.precision })}</span>
              </div>
              <p className="text-right text-xs text-slate-500 mt-2">{InvoiceLogic.numberToWords(calculatedTotals.grandTotal)}</p>
            </div>

            {/* Footer Notes, Terms, Signature */}
            <div style={{marginTop: '4rem'}}>
              <h3 className="input-label">Invoice Notes</h3>
              <p style={{fontSize: '0.8rem', color: '#4b5563'}}>{invoice.invoiceNotes}</p>
              <h3 className="input-label mt-4">Terms & Conditions</h3>
              <p style={{fontSize: '0.8rem', color: '#4b5563'}}>{invoice.paymentTerms}</p>
            </div>

            <div className="flex justify-between items-end mt-20">
              <div className="w-48 text-center border-t border-slate-200 pt-2">
                <span className="text-xs text-slate-500">Customer Signature</span>
              </div>
              <div className="w-48 text-center border-t border-black pt-2">
                <span className="text-xs font-bold">Authorized Signatory</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
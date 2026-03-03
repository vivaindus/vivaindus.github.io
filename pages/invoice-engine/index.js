import React, { useState, useMemo } from 'react';
import { EnterpriseInvoiceEngine } from '../../engine-data/logic';

const enterpriseCSS = `
  .app-bg { background: #f0f2f5; min-height: 100vh; padding: 40px 20px; font-family: 'Inter', system-ui, sans-serif; }
  .split-layout { display: flex; flex-direction: column; gap: 30px; max-width: 1600px; margin: 0 auto; }
  @media (min-width: 1200px) { .split-layout { flex-direction: row; } }
  
  .editor-pane { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 350px; }
  .preview-pane { width: 100%; max-width: 210mm; position: sticky; top: 40px; margin: 0 auto; }
  
  .editor-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .invoice-paper { background: white; width: 210mm; min-height: 297mm; padding: 60px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); position: relative; }
  
  .r-input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 14px; transition: all 0.2s; background: #fff; }
  .r-input:hover:not(:disabled) { border-color: #cbd5e1; background: #f8fafc; }
  .r-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .label-tiny { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px; }
  
  .paper-table { width: 100%; border-collapse: collapse; margin: 40px 0; }
  .paper-table th { background: #f8fafc; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
  .paper-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }

  .btn-lock { background: #000; color: #fff; width: 100%; padding: 16px; border-radius: 10px; font-weight: 800; border: none; cursor: pointer; transition: 0.2s; }
  .btn-lock:hover { background: #1a1a1a; transform: translateY(-1px); }
  .btn-line { background: none; border: 1px dashed #cbd5e1; color: #64748b; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; width: 100%; }

  .total-block { width: 350px; margin-left: auto; margin-top: 50px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
  .grand-row { border-top: 3px solid #000; margin-top: 15px; padding-top: 15px; font-weight: 900; font-size: 24px; color: #000; display: flex; justify-content: space-between; }
  
  .tag { display: inline-block; padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 10px; margin: 2px; cursor: pointer; font-weight: 700; background: #fff; }
  .tag.active { background: #2563eb; color: #fff; border-color: #2563eb; }

  @media print {
    .no-print { display: none !important; }
    .app-bg { padding: 0; background: white; }
    .invoice-paper { box-shadow: none; border: none; padding: 15mm; width: 100%; height: auto; }
    thead { display: table-header-group; }
    .private-col { display: none !important; }
  }
`;

export default function EnterpriseRefrensApp() {
  const [status, setStatus] = useState('DRAFT');
  const [invoice, setInvoice] = useState({
    title: "Tax Invoice",
    invoiceNo: "INV-2026-0001",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    currency: "AED",
    billedBy: { name: "", taxId: "", address: "" },
    billedTo: { name: "", taxId: "", address: "" },
    items: [{ id: Date.now(), name: "", qty: 1, unitPrice: 0, taxRate: 5 }],
    columns: [
      { key: 'sn', label: 'SN', visible: true, width: '40px' },
      { key: 'name', label: 'Description', visible: true, width: 'auto' },
      { key: 'qty', label: 'Qty', visible: true, width: '70px' },
      { key: 'unitPrice', label: 'Rate', visible: true, width: '100px' },
      { key: 'taxRate', label: 'VAT %', visible: true, width: '80px' },
      { key: 'lineTotal', label: 'Total', visible: true, width: '120px' },
      { key: 'costPrice', label: 'Cost', visible: false, isPrivate: true }
    ],
    globalDiscount: { value: 0, type: 'percent', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    manualRounding: null,
    config: { roundingMode: 'HALF_EVEN', precision: 2, taxInclusive: false }
  });

  const totals = useMemo(() => {
    const engine = new EnterpriseInvoiceEngine(invoice.config);
    return engine.calculate(invoice);
  }, [invoice]);

  const isLocked = status === 'FINAL';

  const updateItem = (id, field, value) => {
    if (isLocked) return;
    const next = invoice.items.map(it => it.id === id ? { ...it, [field]: value } : it);
    setInvoice({ ...invoice, items: next });
  };

  return (
    <div className="app-bg">
      <style>{enterpriseCSS}</style>
      <div className="split-layout">
        
        {/* LEFT: POWER EDITOR */}
        <div className="editor-pane no-print">
          <div className="editor-card">
            <button className="btn-lock" onClick={() => setStatus('FINAL')} disabled={isLocked}>
              {isLocked ? '🔒 DOCUMENT LOCKED' : 'FINALIZE & DOWNLOAD'}
            </button>
            <button className="btn-secondary mt-3" onClick={() => window.print()}>PRINT PDF</button>
            {isLocked && <button className="btn-secondary mt-3 text-red-600 border-red-100" onClick={() => setStatus('DRAFT')}>UNLOCK FOR EDITING</button>}
          </div>

          <div className="editor-card">
            <span className="label-tiny">Invoice Meta</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input className="r-input" placeholder="Invoice #" defaultValue={invoice.invoiceNo} onChange={e => setInvoice({...invoice, invoiceNo: e.target.value})} disabled={isLocked} />
              <input className="r-input" type="date" defaultValue={invoice.date} disabled={isLocked} />
            </div>
            <select className="r-input mt-3" onChange={e => setInvoice({...invoice, currency: e.target.value})} disabled={isLocked}>
                <option value="AED">AED - Dirham</option>
                <option value="USD">USD - Dollar</option>
                <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div className="editor-card">
            <span className="label-tiny">Your Business Details</span>
            <input className="r-input font-bold" placeholder="Business Name" onChange={e => setInvoice({...invoice, billedBy: {...invoice.billedBy, name: e.target.value}})} disabled={isLocked} />
            <input className="r-input mt-2" placeholder="TRN / VAT ID" onChange={e => setInvoice({...invoice, billedBy: {...invoice.billedBy, taxId: e.target.value}})} disabled={isLocked} />
            <textarea className="r-input mt-2 h-20" placeholder="Address" onChange={e => setInvoice({...invoice, billedBy: {...invoice.billedBy, address: e.target.value}})} disabled={isLocked} />
          </div>

          <div className="editor-card">
            <span className="label-tiny">Client Details</span>
            <input className="r-input font-bold" placeholder="Client Name" onChange={e => setInvoice({...invoice, billedTo: {...invoice.billedTo, name: e.target.value}})} disabled={isLocked} />
            <textarea className="r-input mt-2 h-20" placeholder="Client Address" onChange={e => setInvoice({...invoice, billedTo: {...invoice.billedTo, address: e.target.value}})} disabled={isLocked} />
          </div>

          <div className="editor-card">
            <span className="label-tiny">Toggle Columns</span>
            <div className="flex flex-wrap mt-2">
               {invoice.columns.map(c => (
                 <div key={c.key} className={`tag ${c.visible ? 'active' : ''}`} onClick={() => {
                   const next = invoice.columns.map(col => col.key === c.key ? {...col, visible: !col.visible} : col);
                   setInvoice({...invoice, columns: next});
                 }}>{c.label}</div>
               ))}
            </div>
          </div>

          <div className="editor-card">
            <span className="label-tiny">Pipeline Settings</span>
            <div className="space-y-4 mt-2">
               <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={invoice.config.taxInclusive} onChange={e => setInvoice({...invoice, config: {...invoice.config, taxInclusive: e.target.checked}})} />
                  Tax Inclusive Pricing
               </label>
               <div className="flex justify-between items-center text-sm">
                  <span>TDS / Withholding %</span>
                  <input type="number" className="r-input w-24" onChange={e => setInvoice({...invoice, tdsRate: parseFloat(e.target.value) || 0})} />
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span>Global Discount</span>
                  <input type="number" className="r-input w-24" placeholder="Value" onChange={e => setInvoice({...invoice, globalDiscount: {...invoice.globalDiscount, value: parseFloat(e.target.value) || 0}})} />
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT: REAL-TIME A4 PREVIEW */}
        <div className="preview-pane">
          <div className="invoice-paper">
            
            <header className="flex justify-between items-start">
               <div>
                  <h1 style={{fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '-2px'}}>{invoice.title}</h1>
                  <p style={{fontSize: '24px', fontWeight: 800, marginTop: '30px', color: '#000'}}>{invoice.billedBy.name || "COMPANY NAME"}</p>
                  <p style={{fontSize: '13px', color: '#64748b', maxWidth: '350px'}}>{invoice.billedBy.address}</p>
                  <p style={{fontSize: '11px', fontWeight: 800, color: '#000', marginTop: '10px'}}>TRN: {invoice.billedBy.taxId}</p>
               </div>
               <div style={{width: '180px', height: '110px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 900, fontSize: '11px'}}>BUSINESS LOGO</div>
            </header>

            <section className="flex justify-between gap-12 mt-16 py-10 border-y border-slate-100">
               <div className="flex-1">
                  <span className="label-tiny" style={{color: '#2563eb'}}>Billed To</span>
                  <p style={{fontSize: '16px', fontWeight: 800, color: '#000', marginBottom: '5px'}}>{invoice.billedTo.name || "Client Name"}</p>
                  <p style={{fontSize: '13px', color: '#64748b', whiteSpace: 'pre-wrap'}}>{invoice.billedTo.address}</p>
               </div>
               <div style={{width: '240px'}} className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="label-tiny">Invoice No</span> <span className="font-bold">{invoice.invoiceNo}</span></div>
                  <div className="flex justify-between text-sm"><span className="label-tiny">Date</span> <span className="font-bold">{invoice.date}</span></div>
                  <div className="flex justify-between text-sm"><span className="label-tiny">Currency</span> <span className="font-bold">{invoice.currency}</span></div>
               </div>
            </section>

            <table className="paper-table">
               <thead>
                  <tr>
                     {invoice.columns.filter(c => c.visible).map(col => (
                       <th key={col.key} className={col.isPrivate ? 'private-col' : ''} style={{width: col.width}}>{col.label}</th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {totals.items.map((item, idx) => (
                    <tr key={item.id}>
                       {invoice.columns.filter(c => c.visible).map(col => (
                         <td key={col.key} className={col.isPrivate ? 'private-col' : ''}>
                           {col.key === 'sn' ? (idx + 1) :
                            col.key === 'lineTotal' ? <span className="font-black">{(item.lineTotal || 0).toFixed(2)}</span> :
                            <input className="r-input border-none p-0 bg-transparent font-medium" defaultValue={item[col.key]} onChange={e => updateItem(item.id, col.key, e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value)} disabled={isLocked} />
                           }
                         </td>
                       ))}
                    </tr>
                  ))}
               </tbody>
            </table>

            {!isLocked && <button className="btn-line no-print" onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), name: "", qty: 1, unitPrice: 0, taxRate: 5}]})}>+ ADD ITEM</button>}

            <div className="total-block">
               <div className="total-row"><span>Subtotal</span> <span className="font-bold">{totals.subtotal.toFixed(2)}</span></div>
               <div className="total-row"><span>Total Tax</span> <span className="font-bold">{totals.totalTax.toFixed(2)}</span></div>
               {totals.tdsAmount > 0 && <div className="total-row text-red-600 font-bold"><span>TDS Deduction</span> <span>-{totals.tdsAmount.toFixed(2)}</span></div>}
               {totals.roundingAdjustment !== 0 && <div className="total-row italic text-slate-400"><span>Rounding Adjustment</span> <span>{totals.roundingAdjustment.toFixed(2)}</span></div>}
               
               <div className="grand-row">
                  <span className="tracking-tighter uppercase">Total Due</span>
                  <span>{invoice.currency} {totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               <p style={{textAlign: 'right', fontSize: '10px', fontWeight: 900, color: '#94a3b8', marginTop: '12px', textTransform: 'uppercase'}}>{EnterpriseInvoiceEngine.toWords(totals.grandTotal)}</p>
            </div>

            <footer className="mt-24 border-t border-slate-100 pt-10 flex justify-between items-end">
               <div className="w-64">
                  <span className="label-tiny">Terms & Notes</span>
                  <p style={{fontSize: '11px', color: '#64748b', lineHeight: '1.5', marginTop: '10px'}}>1. Please pay within 15 days of invoice date.<br/>2. All taxes are as per UAE VAT Law.</p>
               </div>
               <div className="w-56 text-center border-t border-slate-900 pt-3">
                  <span className="text-[10px] font-black text-slate-900 uppercase">Authorized Signatory</span>
               </div>
            </footer>

            <div className="absolute bottom-10 left-[60px] right-[60px] flex justify-between text-[8px] font-black text-slate-200 tracking-[5px] uppercase">
                <span>Ref: {invoice.invoiceNo}</span>
                <span>Audit Stamp: {btoa(invoice.invoiceNo).substring(0, 10)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
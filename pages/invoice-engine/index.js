import React, { useState, useMemo, useEffect } from 'react';
import { InvoiceEngine, numberToWords } from '../../engine-data/logic';
import { InvoiceStyles } from '../../engine-data/styles';

export default function FullEnterpriseInvoice() {
  const [status, setStatus] = useState('DRAFT');
  const [revision, setRevision] = useState(1);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState({
    invoiceNo: "INV-2024-001",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    supplyDate: "",
    poRef: "",
    currency: "USD",
    fxRate: 1.0,
    reverseCharge: false,
    company: { name: "", address: "", taxId: "", bank: "" },
    customer: { name: "", address: "", taxId: "", shipAddress: "" },
    items: [{ id: 1, description: "", qty: 1, unitPrice: 0, taxRate: 0, chargeValue: 0, discountValue: 0 }],
    columns: [
      { key: 'sn', label: 'SN', visible: true, width: 40, isPrivate: false },
      { key: 'description', label: 'Item Description', visible: true, width: 'auto', isPrivate: false },
      { key: 'qty', label: 'Qty', visible: true, width: 60, isPrivate: false },
      { key: 'unitPrice', label: 'Price', visible: true, width: 100, isPrivate: false },
      { key: 'taxRate', label: 'Tax %', visible: true, width: 60, isPrivate: false },
      { key: 'lineTotal', label: 'Total', visible: true, width: 100, isPrivate: false }
    ],
    globalDiscount: { value: 0, type: 'fixed', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    config: { roundingMode: 'HALF_EVEN', precision: 2, taxInclusive: false },
    terms: "Payment due within 30 days."
  });

  const totals = useMemo(() => {
    const engine = new InvoiceEngine(invoice.config);
    return engine.calculate(invoice);
  }, [invoice]);

  const isLocked = status === 'FINAL';

  const finalize = () => {
    if (confirm("Locking this invoice will make it immutable. Proceed?")) {
      setStatus('FINAL');
      setHistory([...history, { timestamp: new Date().toLocaleString(), action: 'Finalized', rev: revision }]);
    }
  };

  const createNewRevision = () => {
    setStatus('DRAFT');
    setRevision(prev => prev + 1);
    setHistory([...history, { timestamp: new Date().toLocaleString(), action: 'Created New Revision', rev: revision + 1 }]);
  };

  return (
    <div className={InvoiceStyles.canvas}>
      <style>{InvoiceStyles.printCSS}</style>

      {/* 🛠️ Enterprise Sidebar (Configuration & Audit) */}
      <aside className={InvoiceStyles.sidebar}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl italic tracking-tighter text-slate-900">ENGINE CONTROLS</h2>
          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold uppercase">{status}</span>
        </div>

        <section className="space-y-6">
          <div className="space-y-3">
            <button onClick={isLocked ? createNewRevision : finalize} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform">
              {isLocked ? "📝 EDIT (NEW REVISION)" : "🔒 FINALIZE & LOCK"}
            </button>
            <button onClick={() => window.print()} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">🖨️ PRINT PDF</button>
          </div>

          <div className="border-t pt-4">
            <span className={InvoiceStyles.label}>Column Management</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {invoice.columns.map((col, idx) => (
                <button 
                  key={col.key} 
                  onClick={() => {
                    const next = [...invoice.columns];
                    next[idx].visible = !next[idx].visible;
                    setInvoice({...invoice, columns: next});
                  }}
                  className={`px-2 py-1 text-[9px] font-bold border rounded ${col.visible ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400'}`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div>
              <span className={InvoiceStyles.label}>Rounding Mode</span>
              <select className="w-full text-xs p-2 border rounded" onChange={e => setInvoice({...invoice, config: {...invoice.config, roundingMode: e.target.value}})}>
                <option value="HALF_EVEN">Banker's (Even)</option>
                <option value="HALF_UP">Standard (Up)</option>
              </select>
            </div>
            <div>
              <span className={InvoiceStyles.label}>TDS Rate %</span>
              <input type="number" className="w-full text-xs p-2 border rounded" onChange={e => setInvoice({...invoice, tdsRate: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="border-t pt-4">
            <span className={InvoiceStyles.label}>Audit History</span>
            <div className="mt-2 space-y-2">
              {history.map((h, i) => (
                <div key={i} className="text-[10px] bg-slate-50 p-2 rounded flex justify-between">
                  <span>Rev {h.rev}: {h.action}</span>
                  <span className="text-slate-400">{h.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </aside>

      {/* 📄 A4 Canvas */}
      <div className={InvoiceStyles.page}>
        {/* Status Watermark */}
        {isLocked && <div className="absolute top-10 right-10 border-4 border-green-600 text-green-600 px-4 py-2 font-black rotate-12 opacity-30 text-2xl uppercase">Immutable Final</div>}

        <header className="flex justify-between items-start">
          <div className="w-2/3">
            <h1 className={InvoiceStyles.h1}>Tax Invoice</h1>
            <div className="mt-6 space-y-1">
              <input placeholder="COMPANY NAME" className={`${InvoiceStyles.value} text-2xl w-full border-none p-0 outline-none`} disabled={isLocked} />
              <textarea placeholder="Legal Address, Tax ID, Registration No" className="w-full border-none p-0 text-xs text-slate-400 h-16 resize-none outline-none" disabled={isLocked} />
            </div>
          </div>
          <div className="text-right">
            <div className="w-32 h-32 ml-auto bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-300 uppercase">QR / IRN Placeholder</span>
            </div>
          </div>
        </header>

        <section className={InvoiceStyles.metadataGrid}>
          <div className="grid grid-cols-2 gap-y-3">
            <span className={InvoiceStyles.label}>Invoice No</span> <input className="text-xs font-bold border-none p-0" defaultValue={invoice.invoiceNo} disabled={isLocked} />
            <span className={InvoiceStyles.label}>Supply Date</span> <input type="date" className="text-xs border-none p-0" disabled={isLocked} />
            <span className={InvoiceStyles.label}>Due Date</span> <input type="date" className="text-xs border-none p-0 text-red-500 font-bold" disabled={isLocked} />
            <span className={InvoiceStyles.label}>Currency</span> <select className="text-xs border-none p-0" disabled={isLocked}><option>USD</option><option>EUR</option><option>INR</option></select>
          </div>
          <div className="space-y-4">
            <div>
              <span className={InvoiceStyles.label}>Billed To</span>
              <input placeholder="Client Entity Name" className="text-sm font-bold w-full border-none p-0" disabled={isLocked} />
              <textarea placeholder="Client Tax Address" className="w-full border-none p-0 text-xs text-slate-400 h-12 resize-none" disabled={isLocked} />
            </div>
          </div>
        </section>

        {/* Dynamic Column Table */}
        <table className="w-full mb-10">
          <thead className={InvoiceStyles.thead}>
            <tr>
              {invoice.columns.filter(c => c.visible).map(col => (
                <th key={col.key} className={`p-3 text-left ${col.isPrivate ? 'bg-amber-100 text-amber-900 print:hidden' : ''}`} style={{ width: col.width }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totals.items.map((item, idx) => (
              <tr key={idx} className="group">
                {invoice.columns.filter(c => c.visible).map(col => (
                  <td key={col.key} className={`${InvoiceStyles.cell} ${col.isPrivate ? 'bg-amber-50 print:hidden' : ''}`}>
                    {col.key === 'sn' ? (idx + 1) : 
                     col.key === 'lineTotal' ? <span className="font-bold">{item.lineTotal.toFixed(2)}</span> :
                     <input 
                        type="text"
                        className="w-full bg-transparent border-none p-0 text-xs focus:ring-1 focus:ring-blue-500 rounded"
                        value={item[col.key]}
                        disabled={isLocked}
                        onChange={e => {
                          const next = [...invoice.items];
                          next[idx][col.key] = e.target.value;
                          setInvoice({...invoice, items: next});
                        }}
                     />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Full Totals Breakdown UI */}
        <div className="mt-auto grid grid-cols-2 gap-20 pt-10 border-t-2 border-slate-900">
          <div>
            <span className={InvoiceStyles.label}>Bank Details</span>
            <textarea placeholder="Account Name, Number, IBAN/SWIFT" className="w-full border p-2 text-[10px] font-mono h-24 rounded-lg bg-slate-50" disabled={isLocked} />
            <div className="mt-6 flex gap-10">
               <div className="text-center">
                  <div className="h-12 w-32 border-b-2 border-slate-100 mb-2"></div>
                  <span className="text-[8px] font-black uppercase text-slate-300">Customer Signature</span>
               </div>
               <div className="text-center">
                  <div className="h-12 w-32 border-b-2 border-slate-900 mb-2 bg-slate-50"></div>
                  <span className="text-[8px] font-black uppercase text-slate-900">Authorized Signatory</span>
               </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className={InvoiceStyles.totalsLine}><span>Subtotal</span> <span>{totals.subtotal.toFixed(2)}</span></div>
            <div className={InvoiceStyles.totalsLine}><span>Total Line Discounts</span> <span className="text-green-600">-{totals.totalLineDiscount.toFixed(2)}</span></div>
            <div className={InvoiceStyles.totalsLine}><span>Global Discount</span> <span className="text-green-600">-{totals.totalGlobalDiscount.toFixed(2)}</span></div>
            {totals.taxSummary.map(tax => (
              <div key={tax.rate} className={InvoiceStyles.totalsLine}><span>Tax @ {tax.rate}%</span> <span>{tax.amt.toFixed(2)}</span></div>
            ))}
            <div className={InvoiceStyles.totalsLine}><span>Extra Charges</span> <span>{totals.totalExtraCharges.toFixed(2)}</span></div>
            <div className={InvoiceStyles.totalsLine}><span className="text-red-500">TDS Deduction</span> <span className="text-red-500">-{totals.tdsAmount.toFixed(2)}</span></div>
            <div className={InvoiceStyles.totalsLine}><span className="text-slate-400 italic">Rounding Adjustment</span> <span className="text-slate-400 italic">{totals.roundingAdjustment.toFixed(2)}</span></div>
            
            <div className={InvoiceStyles.grandTotal}>
              <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
              <span className="text-3xl font-black">{invoice.currency} {totals.payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-right text-[9px] font-black text-slate-400 mt-2 italic uppercase">{numberToWords(totals.payable)}</p>
          </div>
        </div>

        <footer className="mt-10 border-t pt-4 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
           <span>Revision: {revision} | ID: {invoice.invoiceNo}</span>
           <span className="no-print">Page <span className="page-number"></span></span>
        </footer>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { InvoiceLogic } from '../../engine-data/logic';

export default function EnterpriseInvoiceApp() {
  const [status, setStatus] = useState('DRAFT'); // DRAFT, FINAL, CANCELLED
  const [activeSections, setActiveSections] = useState({ 
    shipping: false, bank: true, signature: true, terms: true, tds: false 
  });

  const [invoice, setInvoice] = useState({
    title: "Tax Invoice",
    invoiceNo: "INV-2026-0001",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    currency: "AED",
    billedBy: { name: "", taxId: "", address: "", phone: "", email: "" },
    billedTo: { name: "", taxId: "", address: "", shipping: "" },
    items: [{ id: Date.now(), name: "", desc: "", hsn: "", qty: 1, unit: "Pcs", unitPrice: 0, taxRate: 5, discountValue: 0, discountType: 'percent' }],
    columns: [
      { key: 'name', label: 'Item', visible: true, width: '30%' },
      { key: 'hsn', label: 'HSN/SAC', visible: false, width: '10%' },
      { key: 'qty', label: 'Qty', visible: true, width: '10%' },
      { key: 'unitPrice', label: 'Rate', visible: true, width: '15%' },
      { key: 'taxRate', label: 'VAT %', visible: true, width: '10%' },
      { key: 'lineTotal', label: 'Amount', visible: true, width: '15%' }
    ],
    globalDiscount: { value: 0, type: 'percent', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    manualRounding: null,
    config: { taxInclusive: false }
  });

  const totals = useMemo(() => {
    const engine = new InvoiceLogic(invoice.config);
    return engine.calculate(invoice);
  }, [invoice]);

  const isLocked = status !== 'DRAFT';

  // State Update Helpers
  const updateItem = (id, field, value) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, { id: Date.now(), name: "", desc: "", qty: 1, unitPrice: 0, taxRate: 5 }] });
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 flex justify-center gap-8 no-print:bg-white">
      <div className="app-container flex gap-8 max-w-[1400px] w-full items-start">
        
        {/* DOCUMENT CANVAS */}
        <main className="a4-canvas">
          {status === 'CANCELLED' && <div className="absolute inset-0 flex items-center justify-center text-[100px] font-black text-red-500 opacity-10 rotate-45 pointer-events-none">CANCELLED</div>}

          {/* Header */}
          <header className="flex justify-between items-start mb-12">
            <div className="flex-1">
              <input className="refrens-input text-4xl font-black uppercase tracking-tight w-full" defaultValue={invoice.title} disabled={isLocked} />
              <div className="grid grid-cols-2 gap-4 mt-8 w-[350px]">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Invoice No</label>
                  <input className="refrens-input font-bold" defaultValue={invoice.invoiceNo} disabled={isLocked} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Date</label>
                  <input type="date" className="refrens-input" defaultValue={invoice.date} disabled={isLocked} />
                </div>
              </div>
            </div>
            <div className="w-40 h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">Logo Upload</div>
          </header>

          {/* Billing */}
          <section className="flex justify-between gap-10 mb-12 border-y border-slate-50 py-8">
            <div className="flex-1 space-y-2">
              <span className="text-[11px] font-black text-blue-600 uppercase">Billed By</span>
              <input className="refrens-input font-black block" placeholder="Your Company Name" disabled={isLocked} />
              <textarea className="refrens-input text-slate-500 text-xs w-full h-16 resize-none" placeholder="Company Address, Tax ID, Phone" disabled={isLocked} />
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[11px] font-black text-blue-600 uppercase">Billed To</span>
              <input className="refrens-input font-black block" placeholder="Client Name" disabled={isLocked} />
              <textarea className="refrens-input text-slate-500 text-xs w-full h-16 resize-none" placeholder="Client Address, Tax ID" disabled={isLocked} />
            </div>
          </section>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                {invoice.columns.filter(c => c.visible).map(col => (
                  <th key={col.key} className="p-3 text-left text-[10px] uppercase font-black text-slate-500" style={{ width: col.width }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-50">
                  {invoice.columns.filter(c => c.visible).map(col => (
                    <td key={col.key} className="p-2">
                      {col.key === 'lineTotal' ? <span className="font-bold text-sm">{(item.total || 0).toFixed(2)}</span> :
                       <input 
                         className="refrens-input w-full text-sm" 
                         type={typeof item[col.key] === 'number' ? 'number' : 'text'}
                         value={item[col.key]}
                         onChange={e => updateItem(item.id, col.key, e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                         disabled={isLocked}
                       />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem} className="no-print text-blue-600 font-bold text-xs hover:underline mb-12 disabled:opacity-0" disabled={isLocked}>+ Add New Line</button>

          {/* Totals Section */}
          <div className="ml-auto w-[350px] space-y-2 mt-10">
            <div className="flex justify-between text-sm text-slate-500 uppercase font-bold"><span>Subtotal</span> <span>{totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-slate-500 uppercase font-bold"><span>Tax Total</span> <span>{totals.totalTax.toFixed(2)}</span></div>
            {totals.taxSummary.map(t => (
              <div key={t.rate} className="flex justify-between text-[11px] text-slate-400 pl-4 italic"><span>Tax @ {t.rate}%</span> <span>{t.amt.toFixed(2)}</span></div>
            ))}
            <div className="flex justify-between border-t-4 border-black pt-4 items-center">
              <span className="text-xl font-black uppercase">Total Due</span>
              <span className="text-3xl font-black">{invoice.currency} {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-right text-[10px] font-black text-slate-400 mt-2 uppercase italic">{InvoiceLogic.toWords(totals.grandTotal)}</p>
          </div>

          {/* Bank & Sign */}
          <footer className="mt-20 flex justify-between gap-10 items-end">
            <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase">Bank Account Details</span>
               <textarea className="refrens-input w-full mt-2 h-20 text-xs font-mono bg-transparent" placeholder="Bank Name, IBAN, Swift Code" disabled={isLocked} />
            </div>
            <div className="w-48 text-center border-t border-slate-900 pt-2">
               <span className="text-[10px] font-black text-slate-900 uppercase">Authorized Signatory</span>
            </div>
          </footer>
        </main>

        {/* SIDEBAR CONTROLS */}
        <aside className="sidebar w-[350px] no-print">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 sticky top-10 space-y-6">
            <button 
              onClick={() => setStatus('FINAL')} 
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-black transition-all disabled:opacity-50"
              disabled={isLocked}
            >
              {isLocked ? '🔒 DOCUMENT LOCKED' : 'FINALIZE & DOWNLOAD'}
            </button>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Configuration</span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={invoice.config.taxInclusive} onChange={e => setInvoice({...invoice, config: {...invoice.config, taxInclusive: e.target.checked}})} disabled={isLocked} />
                  Tax Inclusive Mode
                </label>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Rounding</span>
                  <div className="flex gap-2">
                    <button onClick={() => setInvoice({...invoice, manualRounding: 'up'})} className="px-2 py-1 border rounded text-[10px] hover:bg-slate-50" disabled={isLocked}>UP</button>
                    <button onClick={() => setInvoice({...invoice, manualRounding: 'down'})} className="px-2 py-1 border rounded text-[10px] hover:bg-slate-50" disabled={isLocked}>DOWN</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Column Toggle</span>
              <div className="flex flex-wrap gap-2">
                {invoice.columns.map(col => (
                  <button 
                    key={col.key} 
                    onClick={() => {
                      const next = [...invoice.columns];
                      const target = next.find(c => c.key === col.key);
                      target.visible = !target.visible;
                      setInvoice({...invoice, columns: next});
                    }}
                    className={`text-[9px] px-2 py-1 rounded-full border transition-all font-black ${col.visible ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {isLocked && (
              <button onClick={() => setStatus('DRAFT')} className="w-full border-2 border-red-100 text-red-600 py-3 rounded-xl font-bold text-xs hover:bg-red-50">
                UNLOCK FOR EDITING
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
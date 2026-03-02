import React, { useState, useMemo } from 'react';
import { InvoiceEngine, numberToWords } from '../../engine-data/logic';
import { InvoiceStyles } from '../../engine-data/styles';

export default function EnterpriseInvoice() {
  const [status, setStatus] = useState('DRAFT'); // DRAFT, FINAL, CANCELLED
  const [invoice, setInvoice] = useState({
    invoiceNo: "INV-001",
    date: new Date().toISOString().split('T')[0],
    company: { name: "", address: "", taxId: "" },
    customer: { name: "", address: "", taxId: "" },
    items: [{ id: 1, description: "", qty: 1, unitPrice: 0, taxRate: 0 }],
    globalDiscount: { value: 0, type: 'fixed', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    config: { roundingMode: 'HALF_EVEN', precision: 2, taxInclusive: false }
  });

  const totals = useMemo(() => {
    const engine = new InvoiceEngine(invoice.config);
    return engine.calculate(invoice.items, invoice.globalDiscount, invoice.extraCharges, invoice.tdsRate);
  }, [invoice]);

  const isLocked = status !== 'DRAFT';

  return (
    <div className={InvoiceStyles.canvas}>
      {/* 🛠️ Floating Toolbar */}
      <div className="w-[210mm] bg-white mb-4 p-4 rounded-xl flex justify-between items-center no-print shadow-lg">
        <div className="flex gap-3">
          <button 
            onClick={() => setStatus('FINAL')} 
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs"
            disabled={isLocked}
          >FINALIZE & LOCK</button>
          <button onClick={() => window.print()} className="bg-slate-100 px-4 py-2 rounded font-bold text-xs">PRINT PDF</button>
        </div>
        <span className="text-[10px] font-black uppercase text-slate-400">Status: {status}</span>
      </div>

      {/* 📄 The A4 Invoice */}
      <div className={InvoiceStyles.page}>
        {status === 'CANCELLED' && <div className={InvoiceStyles.watermark}>CANCELLED</div>}

        <header className="flex justify-between items-start mb-16">
          <div className="w-2/3">
            <h1 className="text-4xl font-black text-slate-900 italic mb-6">TAX INVOICE</h1>
            <div className="space-y-1">
              <input 
                placeholder="YOUR COMPANY NAME" 
                className={`${InvoiceStyles.inputClean} font-bold text-lg`}
                onChange={e => setInvoice({...invoice, company: {...invoice.company, name: e.target.value}})}
                disabled={isLocked}
              />
              <textarea 
                placeholder="Address & Tax ID" 
                className={`${InvoiceStyles.inputClean} text-slate-500 text-xs h-20`}
                onChange={e => setInvoice({...invoice, company: {...invoice.company, address: e.target.value}})}
                disabled={isLocked}
              />
            </div>
          </div>
          <div className="text-right">
             <div className="w-32 h-16 border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-300 font-bold">LOGO</div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-10 mb-12 py-8 border-y border-slate-100">
           <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">Invoice No:</span> <input className="font-bold border-none p-0 w-32 text-right" defaultValue={invoice.invoiceNo} disabled={isLocked} /></div>
              <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">Date:</span> <input type="date" className="border-none p-0 w-32 text-right" defaultValue={invoice.date} disabled={isLocked} /></div>
           </div>
           <div className="text-sm">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Bill To:</h5>
              <input placeholder="Customer Name" className="font-bold block w-full border-none p-0 mb-1" disabled={isLocked} />
              <textarea placeholder="Customer Address & Tax ID" className="text-slate-500 text-xs w-full border-none p-0 h-12" disabled={isLocked} />
           </div>
        </section>

        <table className="w-full mb-10">
          <thead className={InvoiceStyles.tableHead}>
            <tr>
              <th className="p-3 text-left w-12">SN</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Tax %</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totals.items.map((item, idx) => (
              <tr key={idx}>
                <td className={InvoiceStyles.tableCell}>{idx + 1}</td>
                <td className={InvoiceStyles.tableCell}>
                  <input 
                    className={InvoiceStyles.inputClean} 
                    placeholder="Item details..." 
                    onChange={e => {
                      const newItems = [...invoice.items];
                      newItems[idx].description = e.target.value;
                      setInvoice({...invoice, items: newItems});
                    }}
                    disabled={isLocked}
                  />
                </td>
                <td className={`${InvoiceStyles.tableCell} text-right`}>
                  <input 
                    type="number" 
                    className={`${InvoiceStyles.inputClean} text-right`} 
                    defaultValue={item.qty} 
                    onChange={e => {
                      const newItems = [...invoice.items];
                      newItems[idx].qty = parseFloat(e.target.value);
                      setInvoice({...invoice, items: newItems});
                    }}
                    disabled={isLocked}
                  />
                </td>
                <td className={`${InvoiceStyles.tableCell} text-right font-mono`}>
                  <input 
                    type="number" 
                    className={`${InvoiceStyles.inputClean} text-right`} 
                    defaultValue={item.unitPrice} 
                    onChange={e => {
                      const newItems = [...invoice.items];
                      newItems[idx].unitPrice = parseFloat(e.target.value);
                      setInvoice({...invoice, items: newItems});
                    }}
                    disabled={isLocked}
                  />
                </td>
                <td className={`${InvoiceStyles.tableCell} text-right text-slate-400`}>{item.taxRate}%</td>
                <td className={`${InvoiceStyles.tableCell} text-right font-bold`}>{item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLocked && (
          <button 
            className="no-print text-blue-600 font-bold text-xs mb-10"
            onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), description: "", qty: 1, unitPrice: 0, taxRate: 0}]})}
          >+ ADD LINE</button>
        )}

        <div className="mt-auto flex justify-between items-end border-t-2 border-slate-900 pt-10">
           <div className="w-1/2">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Amount in Words</p>
              <p className="text-xs font-bold text-slate-600 italic leading-relaxed">{numberToWords(totals.grandTotal)}</p>
           </div>
           <div className="w-1/3 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400"><span>Subtotal:</span> <span>{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs font-bold text-slate-400"><span>Total Tax:</span> <span>{totals.totalTax.toFixed(2)}</span></div>
              <div className="flex justify-between text-2xl font-black text-slate-900 border-t pt-4"><span>TOTAL:</span> <span>{totals.grandTotal.toFixed(2)}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
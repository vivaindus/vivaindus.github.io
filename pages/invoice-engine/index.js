import React, { useState, useMemo, useEffect } from 'react';
import { FinancialPipeline } from '../../engine-data/logic';
import { AuditEngine } from '../../engine-data/audit-engine';
import { 
  Plus, Trash2, Lock, Unlock, Printer, 
  RotateCcw, History, CheckCircle, Shield 
} from 'lucide-react';

export default function EnterpriseInvoice() {
  const [invoice, setInvoice] = useState({
    status: 'DRAFT',
    number: 'TAX-2024-001',
    version: 1,
    issueDate: new Date().toISOString().split('T')[0],
    currency: 'AED',
    isTaxInclusive: false,
    items: [{ id: '1', name: '', qty: 1, rate: 0, taxP: 5 }],
    columns: [
      { key: 'name', label: 'Item Name', visible: true },
      { key: 'hsn', label: 'HSN/SAC', visible: true },
      { key: 'qty', label: 'Qty', visible: true },
      { key: 'rate', label: 'Rate', visible: true },
      { key: 'taxP', label: 'VAT %', visible: true },
      { key: 'total', label: 'Line Total', visible: true },
    ],
    auditLog: [],
    history: []
  });

  const totals = useMemo(() => FinancialPipeline.execute(invoice), [invoice]);

  const toggleLock = async () => {
    if (invoice.status === 'FINAL') return;
    const hash = await AuditEngine.generateIntegrityHash(invoice);
    setInvoice(prev => ({ 
      ...prev, 
      status: 'FINAL', 
      locked: true, 
      integrityHash: hash,
      finalizedAt: new Date().toISOString()
    }));
  };

  const createRevision = () => {
    const revised = AuditEngine.createRevision(invoice);
    setInvoice(revised);
  };

  return (
    <div id="invoice-root" className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Styles scoped specifically to #invoice-root */}
      <style jsx global>{`
        #invoice-root { --primary: #2563eb; }
        #invoice-root input:disabled { background: #f8fafc; cursor: not-allowed; border-color: #e2e8f0; }
        @media print {
          #invoice-root .no-print { display: none !important; }
          #invoice-root .print-only { display: block !important; }
          #invoice-root { background: white; padding: 0; }
        }
      `}</style>

      {/* ACTION BAR */}
      <nav className="no-print sticky top-0 z-50 flex items-center justify-between border-b bg-white/90 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-600 p-2 text-white"><Shield size={20}/></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter">Enterprise Invoice Engine</h1>
            <p className="text-[10px] text-slate-400 font-mono">{invoice.integrityHash || 'UNSECURED_DRAFT'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'FINAL' ? (
            <button onClick={createRevision} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600">
              <RotateCcw size={14}/> Create Revision (v{invoice.version + 1})
            </button>
          ) : (
            <button onClick={toggleLock} className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
              <Lock size={14}/> Finalize & Lock
            </button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-xs font-bold hover:bg-slate-50">
            <Printer size={14}/> Print A4
          </button>
        </div>
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-2">
        {/* EDITOR PANEL */}
        <section className="no-print h-[calc(100vh-70px)] overflow-y-auto border-r p-8">
          <div className="mx-auto max-w-2xl space-y-8">
            {/* COMPLIANCE HEADER */}
            <div className="grid grid-cols-2 gap-6 rounded-xl border border-blue-100 bg-blue-50/30 p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Invoice Title</label>
                <select 
                  disabled={invoice.locked}
                  className="w-full rounded-lg border-slate-200 bg-white p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  value={invoice.title}
                  onChange={e => setInvoice({...invoice, title: e.target.value})}
                >
                  <option>TAX INVOICE</option>
                  <option>CREDIT NOTE</option>
                  <option>PROFORMA INVOICE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Invoice Number</label>
                <input 
                  disabled={invoice.locked}
                  className="w-full rounded-lg border-slate-200 p-2 text-sm font-bold"
                  value={invoice.number}
                  onChange={e => setInvoice({...invoice, number: e.target.value})}
                />
              </div>
            </div>

            {/* DYNAMIC COLUMN EDITOR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Transaction Lines</h3>
                <button 
                  disabled={invoice.locked}
                  onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now().toString(), name: '', qty: 1, rate: 0, taxP: 5}]})}
                  className="text-[10px] font-black text-blue-600 hover:underline"
                >
                  + ADD POSITION
                </button>
              </div>

              <div className="space-y-3">
                {invoice.items.map((item, idx) => (
                  <div key={item.id} className="group relative rounded-xl border bg-white p-4 transition-all hover:border-blue-300 shadow-sm">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 space-y-1">
                        <input 
                          disabled={invoice.locked}
                          placeholder="Item Description" 
                          className="w-full border-none p-0 text-sm font-bold focus:ring-0"
                          value={item.name}
                          onChange={e => {
                            const newItems = [...invoice.items];
                            newItems[idx].name = e.target.value;
                            setInvoice({...invoice, items: newItems});
                          }}
                        />
                        <input 
                          disabled={invoice.locked}
                          placeholder="HSN/SAC" 
                          className="w-full border-none p-0 text-[10px] text-slate-400 focus:ring-0 uppercase"
                          value={item.hsn}
                          onChange={e => {
                            const newItems = [...invoice.items];
                            newItems[idx].hsn = e.target.value;
                            setInvoice({...invoice, items: newItems});
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-slate-400">Qty</label>
                        <input 
                          disabled={invoice.locked}
                          type="number" 
                          className="w-full border-none p-0 text-sm focus:ring-0"
                          value={item.qty}
                          onChange={e => {
                            const newItems = [...invoice.items];
                            newItems[idx].qty = e.target.value;
                            setInvoice({...invoice, items: newItems});
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-slate-400">Rate</label>
                        <input 
                          disabled={invoice.locked}
                          type="number" 
                          className="w-full border-none p-0 text-sm focus:ring-0"
                          value={item.rate}
                          onChange={e => {
                            const newItems = [...invoice.items];
                            newItems[idx].rate = e.target.value;
                            setInvoice({...invoice, items: newItems});
                          }}
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <label className="text-[9px] font-bold text-slate-400">VAT %</label>
                        <input 
                          disabled={invoice.locked}
                          type="number" 
                          className="w-full border-none p-0 text-right text-sm focus:ring-0 font-bold"
                          value={item.taxP}
                          onChange={e => {
                            const newItems = [...invoice.items];
                            newItems[idx].taxP = e.target.value;
                            setInvoice({...invoice, items: newItems});
                          }}
                        />
                      </div>
                    </div>
                    {!invoice.locked && (
                      <button 
                        onClick={() => setInvoice({...invoice, items: invoice.items.filter(i => i.id !== item.id)})}
                        className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-red-600 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* A4 PREVIEW ENGINE */}
        <section className="bg-slate-200 p-12 overflow-y-auto print:bg-white print:p-0">
          <div className="mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-[20mm] shadow-2xl print:m-0 print:shadow-none">
            {/* WATERMARK FOR CANCELLED */}
            {invoice.status === 'CANCELLED' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08] rotate-45">
                <h1 className="text-[120px] font-black border-8 border-red-600 p-10 text-red-600">CANCELLED</h1>
              </div>
            )}

            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
              <div>
                <h2 className="text-4xl font-black tracking-tighter">{invoice.title || 'TAX INVOICE'}</h2>
                <div className="mt-6 space-y-1 text-sm">
                  <p className="font-black">Seller TRN: <span className="font-normal text-slate-600">100349200000003</span></p>
                  <p className="font-black">Address: <span className="font-normal text-slate-600">Business Bay, Dubai, UAE</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="h-16 w-32 bg-slate-900 text-white flex items-center justify-center font-bold italic">LOGO</div>
                <div className="mt-6 text-sm">
                  <p className="font-black">Invoice #: <span className="font-normal">{invoice.number}</span></p>
                  <p className="font-black">Date: <span className="font-normal">{invoice.issueDate}</span></p>
                  <p className="font-black text-blue-600">Version: {invoice.version}.0</p>
                </div>
              </div>
            </div>

            <table className="mt-12 w-full text-left">
              <thead className="border-b-2 border-slate-900 bg-slate-50">
                <tr className="text-[10px] font-black uppercase tracking-widest">
                  <th className="py-4 pl-4">Description</th>
                  <th className="py-4 text-right">Qty</th>
                  <th className="py-4 text-right">Rate</th>
                  <th className="py-4 text-right">VAT</th>
                  <th className="py-4 text-right pr-4">Amount ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {totals.items.map((item, idx) => (
                  <tr key={idx} className="text-xs">
                    <td className="py-5 pl-4">
                      <p className="font-bold">{item.name || 'Untitled Line Item'}</p>
                      <p className="text-[9px] text-slate-400 uppercase mt-1">HSN: {item.hsn || '---'}</p>
                    </td>
                    <td className="py-5 text-right font-medium">{item.qty}</td>
                    <td className="py-5 text-right font-medium">{item.rate.toFixed(2)}</td>
                    <td className="py-5 text-right font-medium text-slate-400">{item.step6_tax?.toFixed(2) || '0.00'}</td>
                    <td className="py-5 text-right font-black pr-4">{item.step6_lineTotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-black uppercase text-slate-400 tracking-widest">Net Subtotal</span>
                  <span className="font-bold">{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-black uppercase text-slate-400 tracking-widest">Total VAT</span>
                  <span className="font-bold">{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-4">
                  <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
                  <span className="text-xl font-black text-blue-600">{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* TAX SUMMARY BLOCK (UAE COMPLIANT) */}
            <div className="mt-20 grid grid-cols-2 gap-12 border-t pt-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Tax Aggregation Summary</h4>
                <div className="space-y-1">
                  {totals.taxSummary.map(tax => (
                    <div key={tax.rate} className="flex justify-between text-[10px] border-b border-slate-50 pb-1">
                      <span className="text-slate-500 italic">Standard Rate {tax.rate}%</span>
                      <span className="font-bold">{tax.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-24 w-24 border p-1 bg-slate-50">
                  <div className="h-full w-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-400 font-bold">QR CODE</div>
                </div>
                <p className="text-[8px] font-mono text-slate-400 max-w-[150px] text-right break-all">
                  SHA-256: {invoice.integrityHash || 'DRAFT_STAMP_PENDING'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
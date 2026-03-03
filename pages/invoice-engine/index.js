import React, { useState, useMemo, useEffect } from 'react';
import { calculateInvoice } from '@/engine-data/logic';
import { transitionStatus } from '@/engine-data/audit-engine';
import { Settings, FileText, CheckCircle, Lock, Download, Printer, Plus, Trash2 } from 'lucide-react';

const InvoiceEngine = () => {
  const [invoice, setInvoice] = useState({
    status: 'DRAFT',
    number: 'INV-2024-001',
    items: [{ id: 1, name: '', qty: 1, rate: 0, taxP: 5 }],
    globalDiscount: { value: 0, type: 'fixed' },
    extraCharges: 0,
    currency: 'AED',
    isTaxInclusive: false,
    auditLog: []
  });

  const totals = useMemo(() => calculateInvoice(invoice, {}), [invoice]);

  const addItem = () => {
    if (invoice.locked) return;
    setInvoice({
      ...invoice,
      items: [...invoice.items, { id: Date.now(), name: '', qty: 1, rate: 0, taxP: 5 }]
    });
  };

  const updateItem = (id, field, value) => {
    if (invoice.locked) return;
    setInvoice({
      ...invoice,
      items: invoice.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  return (
    <div id="invoice-root" className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Top Header / Action Bar */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">FIN-CORE ENGINE v2.0</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              invoice.status === 'FINAL' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              ● {invoice.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => setInvoice(await transitionStatus(invoice, 'FINAL'))}
              className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:opacity-50"
              disabled={invoice.locked}
            >
              <Lock size={16} /> Finalize & Lock
            </button>
            <button className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">
              <Printer size={16} /> Print PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        {/* LEFT: EDITOR PANEL */}
        <section className="h-[calc(100vh-64px)] overflow-y-auto border-r p-8">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Number</label>
                <input 
                  disabled={invoice.locked}
                  value={invoice.number}
                  onChange={(e) => setInvoice({...invoice, number: e.target.value})}
                  className="w-full rounded-lg border-slate-200 bg-white p-3 shadow-sm transition-focus focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Currency</label>
                <select 
                  disabled={invoice.locked}
                  className="w-full rounded-lg border-slate-200 bg-white p-3 shadow-sm"
                  value={invoice.currency}
                  onChange={(e) => setInvoice({...invoice, currency: e.target.value})}
                >
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Line Items</h3>
                <button 
                  onClick={addItem}
                  disabled={invoice.locked}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  + Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-blue-200">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 space-y-1">
                        <input 
                          placeholder="Item Name" 
                          disabled={invoice.locked}
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full border-none p-0 text-sm font-semibold focus:ring-0" 
                        />
                        <input placeholder="HSN/SAC" className="w-full border-none p-0 text-[10px] text-slate-400 focus:ring-0" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400">Qty</label>
                        <input 
                          type="number" 
                          disabled={invoice.locked}
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                          className="w-full border-none p-0 text-sm focus:ring-0" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400">Rate</label>
                        <input 
                          type="number" 
                          disabled={invoice.locked}
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                          className="w-full border-none p-0 text-sm focus:ring-0" 
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <label className="block text-[10px] text-slate-400">VAT%</label>
                        <input 
                          type="number" 
                          disabled={invoice.locked}
                          value={item.taxP}
                          onChange={(e) => updateItem(item.id, 'taxP', e.target.value)}
                          className="w-full border-none p-0 text-right text-sm focus:ring-0" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: A4 LIVE PREVIEW */}
        <section className="h-[calc(100vh-64px)] overflow-y-auto bg-slate-200 p-12 print:p-0">
          <div className="mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-[20mm] shadow-2xl print:m-0 print:shadow-none">
            {/* Professional Print Layout */}
            <div className="flex justify-between border-b-2 border-slate-900 pb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter">TAX INVOICE</h2>
                <p className="mt-2 text-sm text-slate-500">TRN: 10034920000003</p>
              </div>
              <div className="text-right">
                <div className="h-12 w-32 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-dashed">LOGO</div>
                <p className="mt-4 text-sm font-bold">{invoice.number}</p>
                <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <table className="mt-12 w-full text-left text-sm">
              <thead className="border-b-2 border-slate-900">
                <tr>
                  <th className="py-3 font-bold">Item Description</th>
                  <th className="py-3 text-right font-bold">Qty</th>
                  <th className="py-3 text-right font-bold">Rate</th>
                  <th className="py-3 text-right font-bold">VAT</th>
                  <th className="py-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {totals.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4">
                      <p className="font-bold">{item.name || 'Untitled Item'}</p>
                    </td>
                    <td className="py-4 text-right">{item.qty}</td>
                    <td className="py-4 text-right">{item.rate.toFixed(2)}</td>
                    <td className="py-4 text-right">{item.lineTax.toFixed(2)}</td>
                    <td className="py-4 text-right font-bold">{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">VAT (5%)</span>
                  <span>{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-3 font-black text-lg">
                  <span>TOTAL</span>
                  <span>{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Compliance Section */}
            <div className="mt-24 grid grid-cols-2 gap-8 border-t pt-8">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Tax Summary</h4>
                {Object.entries(totals.taxSummary).map(([rate, amt]) => (
                  <div key={rate} className="flex justify-between text-[10px]">
                    <span>VAT {rate}%</span>
                    <span>{amt.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-end gap-2">
                 {/* QR Placeholer for ZATCA/FTA */}
                 <div className="h-20 w-20 bg-slate-50 border p-1">
                    <div className="h-full w-full bg-slate-200" />
                 </div>
                 <p className="text-[8px] text-slate-400 font-mono break-all max-w-[150px]">
                   {invoice.hash || 'DRAFT_NO_HASH'}
                 </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InvoiceEngine;
import React, { useState, useMemo, useEffect } from 'react';
import Decimal from 'decimal.js';
import { 
  Lock, Unlock, Printer, Plus, Trash2, 
  ChevronDown, ShieldCheck, AlertCircle, FileText,
  Download, Globe, Landmark, Scale
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 
 * I. DETERMINISTIC FINANCIAL ENGINE
 * Implements 12-step calculation pipeline with Banker's Rounding
 */
const FinancialEngine = {
  calculate: (data) => {
    // Internal precision: 20 decimal places
    const DP = 20;
    const items = data.items || [];
    const isTaxInclusive = data.isTaxInclusive || false;
    const globalDiscVal = new Decimal(data.globalDiscount?.value || 0);
    const extraCharges = new Decimal(data.extraCharges || 0);

    // 1-3. Line Item Pipeline
    let processedItems = items.map(item => {
      const qty = new Decimal(item.qty || 0);
      const rate = new Decimal(item.rate || 0);
      let base = qty.mul(rate);

      // Line Level Adjustments
      if (item.discount) {
        base = item.discountType === 'percent' 
          ? base.sub(base.mul(new Decimal(item.discount).div(100)))
          : base.sub(new Decimal(item.discount));
      }
      return { ...item, lineBase: base };
    });

    const totalLineBase = processedItems.reduce((acc, i) => acc.add(i.lineBase), new Decimal(0));

    // 4. Pro-rata Global Discount Distribution
    const gDisc = data.globalDiscount?.type === 'percent'
      ? totalLineBase.mul(globalDiscVal.div(100))
      : globalDiscVal;

    processedItems = processedItems.map(item => {
      const share = totalLineBase.isZero() ? new Decimal(0) : item.lineBase.div(totalLineBase);
      const itemDiscShare = gDisc.mul(share);
      return { ...item, taxableAmount: item.lineBase.sub(itemDiscShare) };
    });

    // 5-6. Tax Engine (Inclusive/Exclusive)
    let taxGroups = {};
    processedItems = processedItems.map(item => {
      const taxRate = new Decimal(item.taxP || 0);
      let taxAmt, netAmt;

      if (isTaxInclusive) {
        netAmt = item.taxableAmount.div(taxRate.div(100).add(1));
        taxAmt = item.taxableAmount.sub(netAmt);
      } else {
        netAmt = item.taxableAmount;
        taxAmt = netAmt.mul(taxRate.div(100));
      }

      const rateKey = taxRate.toString();
      taxGroups[rateKey] = (taxGroups[rateKey] || new Decimal(0)).add(taxAmt);

      return { 
        ...item, 
        netAmount: netAmt, 
        taxAmount: taxAmt, 
        lineTotal: netAmt.add(taxAmt) 
      };
    });

    // 7-12. Totals & Banker's Rounding
    const subtotal = processedItems.reduce((acc, i) => acc.add(i.netAmount), new Decimal(0));
    const totalTax = processedItems.reduce((acc, i) => acc.add(i.taxAmount), new Decimal(0));
    const rawGrandTotal = subtotal.add(totalTax).add(extraCharges);
    
    // Final Banker's Rounding (HALF_EVEN)
    const grandTotal = rawGrandTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);

    return {
      items: processedItems,
      taxGroups,
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      totalTax: totalTax.toDecimalPlaces(2).toNumber(),
      grandTotal: grandTotal.toNumber(),
      roundingDiff: grandTotal.sub(rawGrandTotal).toNumber()
    };
  },

  async generateHash(data) {
    const encoder = new TextEncoder();
    const cleanData = JSON.stringify({ ...data, hash: undefined, status: 'FINAL' });
    const msgBuffer = encoder.encode(cleanData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

/**
 * II. COMPONENT UTILITIES
 */
function cn(...inputs) { return twMerge(clsx(inputs)); }

/**
 * III. MAIN ENTERPRISE ENGINE COMPONENT
 */
export default function EnterpriseInvoiceGenerator() {
  const [invoice, setInvoice] = useState({
    status: 'DRAFT',
    number: 'INV-2026-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'AED',
    isTaxInclusive: false,
    items: [{ id: '1', name: '', qty: 1, rate: 0, taxP: 5, discount: 0, discountType: 'percent' }],
    globalDiscount: { value: 0, type: 'fixed' },
    extraCharges: 0,
    notes: '',
    hash: null,
    locked: false
  });

  const totals = useMemo(() => FinancialEngine.calculate(invoice), [invoice]);

  const toggleLock = async () => {
    if (invoice.locked) {
      setInvoice(prev => ({ ...prev, locked: false, status: 'DRAFT', hash: null }));
    } else {
      const hash = await FinancialEngine.generateHash(invoice);
      setInvoice(prev => ({ ...prev, locked: true, status: 'FINAL', hash }));
    }
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
      items: [...prev.items, { id: Math.random().toString(), name: '', qty: 1, rate: 0, taxP: 5 }]
    }));
  };

  const removeItem = (id) => {
    if (invoice.locked || invoice.items.length === 1) return;
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  return (
    <div id="invoice-root" className="min-h-screen bg-[#f8fafc] text-[#1e293b] antialiased selection:bg-blue-100">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Scale size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-900">Enterprise Invoice Engine</h1>
            <div className="flex items-center gap-2">
              <span className={cn(
                "h-2 w-2 rounded-full",
                invoice.locked ? "bg-green-500 animate-pulse" : "bg-amber-500"
              )} />
              <span className="text-[10px] font-black uppercase text-slate-500">{invoice.status} MODE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLock}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all",
              invoice.locked 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
            )}
          >
            {invoice.locked ? <Unlock size={14} /> : <Lock size={14} />}
            {invoice.locked ? "UNLOCK FOR EDITING" : "FINALIZE & LOCK"}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} /> PRINT PDF
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* LEFT: FINANCIAL EDITOR */}
        <section className="h-[calc(100vh-73px)] overflow-y-auto p-8 print:hidden">
          <div className="mx-auto max-w-4xl space-y-8">
            
            {/* INVOICE META */}
            <div className="grid grid-cols-3 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference Number</label>
                <input 
                  disabled={invoice.locked}
                  value={invoice.number}
                  onChange={e => setInvoice(prev => ({...prev, number: e.target.value}))}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Date</label>
                <input 
                  type="date"
                  disabled={invoice.locked}
                  value={invoice.date}
                  onChange={e => setInvoice(prev => ({...prev, date: e.target.value}))}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 text-sm focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Currency</label>
                <select 
                   disabled={invoice.locked}
                   value={invoice.currency}
                   onChange={e => setInvoice(prev => ({...prev, currency: e.target.value}))}
                   className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 text-sm focus:bg-white"
                >
                  <option value="AED">AED - Dirham</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* LINE ITEMS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Transaction Lines</h3>
                <button 
                  onClick={addItem}
                  disabled={invoice.locked}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline disabled:text-slate-300"
                >
                  <Plus size={12} /> ADD POSITION
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4">Description</th>
                      <th className="w-24 p-4">Qty</th>
                      <th className="w-32 p-4">Unit Rate</th>
                      <th className="w-24 p-4">Tax %</th>
                      <th className="w-32 p-4 text-right">Line Total</th>
                      <th className="w-12 p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50">
                        <td className="p-4">
                          <input 
                            placeholder="Service/Product name..."
                            disabled={invoice.locked}
                            value={item.name}
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-sm font-medium focus:ring-0"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number"
                            disabled={invoice.locked}
                            value={item.qty}
                            onChange={e => updateItem(item.id, 'qty', e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number"
                            disabled={invoice.locked}
                            value={item.rate}
                            onChange={e => updateItem(item.id, 'rate', e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number"
                            disabled={invoice.locked}
                            value={item.taxP}
                            onChange={e => updateItem(item.id, 'taxP', e.target.value)}
                            className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
                          />
                        </td>
                        <td className="p-4 text-right font-mono text-xs font-bold">
                          {FinancialEngine.calculate({ ...invoice, items: [item] }).grandTotal.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => removeItem(item.id)}
                            disabled={invoice.locked}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADJSUTMENTS */}
            <div className="grid grid-cols-2 gap-8">
               <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400">Global Adjustments</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Global Discount</label>
                      <input 
                        type="number"
                        disabled={invoice.locked}
                        value={invoice.globalDiscount.value}
                        onChange={e => setInvoice(prev => ({...prev, globalDiscount: {...prev.globalDiscount, value: e.target.value}}))}
                        className="w-full rounded-lg border-slate-200 text-sm"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Tax Mode</label>
                      <button 
                        disabled={invoice.locked}
                        onClick={() => setInvoice(prev => ({...prev, isTaxInclusive: !prev.isTaxInclusive}))}
                        className={cn(
                          "w-full rounded-lg border py-2 text-[10px] font-bold transition-all",
                          invoice.isTaxInclusive ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white text-slate-600"
                        )}
                      >
                        {invoice.isTaxInclusive ? "TAX INCLUSIVE" : "TAX EXCLUSIVE"}
                      </button>
                    </div>
                  </div>
               </div>
               <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400">Notes & Terms</h4>
                  <textarea 
                    disabled={invoice.locked}
                    placeholder="Payment instructions, bank details, etc..."
                    className="w-full rounded-lg border-slate-200 text-sm h-20"
                    value={invoice.notes}
                    onChange={e => setInvoice(prev => ({...prev, notes: e.target.value}))}
                  />
               </div>
            </div>
          </div>
        </section>

        {/* RIGHT: A4 ENGINE PREVIEW */}
        <aside className="h-[calc(100vh-73px)] overflow-y-auto bg-slate-800 p-8 flex justify-center print:bg-white print:p-0 print:h-auto">
          <div className="box-border min-h-[297mm] w-[210mm] origin-top scale-[0.85] bg-white p-[15mm] shadow-2xl transition-transform hover:scale-[0.88] print:m-0 print:scale-100 print:shadow-none">
            
            {/* INVOICE HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900">TAX INVOICE</h2>
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller TRN</p>
                  <p className="text-xs font-bold text-slate-700 underline decoration-blue-200 decoration-2">10034920000003</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black tracking-[0.2em] mb-4">ORIGINAL</div>
                <p className="text-sm font-black text-slate-900">{invoice.number}</p>
                <p className="text-xs font-medium text-slate-500">Date: {invoice.date}</p>
              </div>
            </div>

            {/* LINE TABLE */}
            <table className="mt-16 w-full text-left">
              <thead className="border-b-2 border-slate-900">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  <th className="py-4">Service Description</th>
                  <th className="py-4 text-right">Qty</th>
                  <th className="py-4 text-right">Rate</th>
                  <th className="py-4 text-right">VAT</th>
                  <th className="py-4 text-right">Total ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {totals.items.map((item, idx) => (
                  <tr key={idx} className="text-xs">
                    <td className="py-5 font-bold text-slate-800">{item.name || 'Undefined Service'}</td>
                    <td className="py-5 text-right font-medium">{item.qty}</td>
                    <td className="py-5 text-right font-medium">{item.rate.toFixed(2)}</td>
                    <td className="py-5 text-right font-medium text-slate-500">{item.taxAmount.toFixed(2)}</td>
                    <td className="py-5 text-right font-black text-slate-900">{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS SECTION */}
            <div className="mt-10 flex justify-end border-t border-slate-100 pt-8">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Net Subtotal</span>
                  <span className="font-bold text-slate-700">{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Total VAT</span>
                  <span className="font-bold text-slate-700">{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-4">
                  <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
                  <span className="text-xl font-black text-blue-600">{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* AUDIT & COMPLIANCE FOOTER */}
            <div className="mt-auto pt-24 border-t border-slate-50">
               <div className="grid grid-cols-2 gap-12 items-end">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Notes</p>
                      <p className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-wrap">{invoice.notes || "Standard net-30 terms apply."}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right">
                    <div className="h-24 w-24 bg-slate-50 border p-1 border-slate-200">
                       <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 font-bold">QR CODE</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Integrity Hash (SHA-256)</p>
                      <p className="font-mono text-[7px] text-slate-400 break-all max-w-[180px]">
                        {invoice.hash || "UNFINALIZED_DOCUMENT_DRAFT"}
                      </p>
                    </div>
                  </div>
               </div>
               <p className="mt-8 text-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                 Powered by High-Performance Enterprise Invoice Engine v2.0
               </p>
            </div>
          </div>
        </aside>
      </main>

      {/* TAILWIND PRINT OVERRIDES */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          #invoice-root { background: white !important; }
          @page { size: A4; margin: 0; }
          main { display: block !important; }
          aside { position: static !important; width: 100% !important; overflow: visible !important; padding: 0 !important; }
          aside > div { scale: 1 !important; transform: none !important; margin: 0 auto !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
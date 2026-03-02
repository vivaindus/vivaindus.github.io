import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; // Ensure supabase is initialized
import { InvoiceLogic, InvoiceValidator, FormulaEngine } from '../../engine-data/logic';
import { InvoiceStyles } from '../../engine-data/styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function InvoiceGenerator() {
  const [mode, setMode] = useState('DRAFT'); // DRAFT, FINAL, CANCELLED
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-' + Date.now(),
    items: [{ qty: 1, unitPrice: 0, taxRate: 0, description: 'New Item' }],
    columns: [
      { key: 'description', label: 'Description', visible: true, isPrivate: false },
      { key: 'qty', label: 'Qty', visible: true, isPrivate: false },
      { key: 'unitPrice', label: 'Unit Price', visible: true, isPrivate: false },
      { key: 'taxRate', label: 'Tax %', visible: true, isPrivate: false },
      { key: 'lineTotal', label: 'Total', visible: true, isPrivate: false },
    ],
    config: { roundingMode: 'HALF_EVEN', taxInclusive: false },
    globalDiscount: { value: 0, type: 'percent', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    payments: { received: 0, balance: 0 }
  });

  // Calculate Totals using Logic Engine
  const totals = useMemo(() => {
    const engine = new InvoiceLogic(invoiceData.config);
    return engine.calculate(
      invoiceData.items, 
      invoiceData.globalDiscount, 
      invoiceData.extraCharges, 
      invoiceData.tdsRate
    );
  }, [invoiceData]);

  const errors = InvoiceValidator.validate(invoiceData);

  // Supabase Persistence: Save Invoice
  const saveToSupabase = async (status = 'DRAFT') => {
    if (status === 'FINAL' && errors.length > 0) return alert("Fix errors before finalizing");
    
    const { data, error } = await supabase
      .from('invoices')
      .upsert({ 
        invoice_number: invoiceData.invoiceNumber,
        content: invoiceData,
        grand_total: totals.grandTotal,
        status: status,
        updated_at: new Date()
      });

    if (!error) {
      setMode(status);
      alert(`Invoice saved as ${status}`);
    }
  };

  return (
    <div className={InvoiceStyles.canvas}>
      <style>{InvoiceStyles.printCSS}</style>

      <div className="flex max-w-[1400px] mx-auto">
        {/* Left: Invoice Canvas */}
        <div className="flex-1 overflow-x-auto pb-20">
          <div className={`a4-page invoice-container relative ${mode === 'CANCELLED' ? 'opacity-50' : ''}`}>
            {mode === 'CANCELLED' && <div className="watermark">CANCELLED</div>}
            
            <header className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">TAX INVOICE</h1>
                <input 
                  className="mt-2 text-lg text-slate-500 border-none outline-none"
                  value={invoiceData.invoiceNumber}
                  onChange={e => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                  disabled={mode !== 'DRAFT'}
                />
              </div>
              <div className="text-right">
                <div className="h-16 w-40 bg-slate-100 flex items-center justify-center border-2 border-dashed rounded italic text-slate-400">
                  Upload Logo
                </div>
              </div>
            </header>

            {/* Dynamic Items Table */}
            <table className="w-full mb-8">
              <thead className={InvoiceStyles.tableHeader}>
                <tr>
                  {invoiceData.columns.filter(c => c.visible).map(col => (
                    <th key={col.key} className="p-3 text-left">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, idx) => (
                  <tr key={idx} className="group">
                    {invoiceData.columns.filter(c => c.visible).map(col => (
                      <td key={col.key} className={`${InvoiceStyles.cell} ${col.isPrivate ? 'bg-amber-50 private-column' : ''}`}>
                        <input 
                          className={InvoiceStyles.input}
                          value={item[col.key]}
                          onChange={(e) => {
                            if (mode !== 'DRAFT') return;
                            const newItems = [...invoiceData.items];
                            newItems[idx][col.key] = e.target.value;
                            setInvoiceData({...invoiceData, items: newItems});
                          }}
                          disabled={mode !== 'DRAFT'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <button 
              className="no-print mb-8 text-blue-600 font-bold text-sm"
              onClick={() => setInvoiceData({...invoiceData, items: [...invoiceData.items, {qty: 1, unitPrice: 0, taxRate: 0}]})}
            >+ Add Line Item</button>

            {/* Summary Grid */}
            <div className="flex justify-end pt-8 border-t-2 border-slate-900">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount</span>
                  <span>{totals.totalTax.toFixed(2)}</span>
                </div>
                {totals.tdsAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>TDS Deduction</span>
                    <span>-{totals.tdsAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="font-bold">GRAND TOTAL</span>
                  <span className={InvoiceStyles.grandTotal}>{totals.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enterprise Sidebar */}
        <aside className={InvoiceStyles.sidebar}>
          <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">Control Panel</h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.print()}
              className="w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-black transition"
            >Print / Export PDF</button>
            
            <button 
              onClick={() => saveToSupabase('FINAL')}
              className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition"
              disabled={mode === 'FINAL'}
            >Finalize & Lock</button>

            {mode === 'FINAL' && (
              <button 
                onClick={() => saveToSupabase('CANCELLED')}
                className="w-full bg-red-100 text-red-600 p-3 rounded font-bold"
              >Mark as Cancelled</button>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-sm mb-4">Calculation Config</h3>
            <label className="flex items-center space-x-2 text-sm">
              <input 
                type="checkbox" 
                checked={invoiceData.config.taxInclusive}
                onChange={e => setInvoiceData({
                  ...invoiceData, 
                  config: {...invoiceData.config, taxInclusive: e.target.checked}
                })}
              />
              <span>Tax Inclusive Mode</span>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              <p className="font-bold mb-1">Validation Blockers:</p>
              <ul className="list-disc pl-4">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { CalculateInvoice } from '../../engine-data/logic';
import { 
  Plus, Trash2, ShieldCheck, Printer, 
  Settings2, Download, Lock, ChevronRight 
} from 'lucide-react';
import QRCode from 'qrcode.js';

const DEFAULT_COLUMNS = [
  { id: 'sn', label: 'S.N.', visible: true, isPrivate: false },
  { id: 'itemName', label: 'Item Name', visible: true, isPrivate: false },
  { id: 'hsn', label: 'HSN/SAC', visible: true, isPrivate: false },
  { id: 'sku', label: 'SKU', visible: true, isPrivate: false },
  { id: 'qty', label: 'Qty', visible: true, isPrivate: false },
  { id: 'unit', label: 'Unit', visible: true, isPrivate: false },
  { id: 'rate', label: 'Rate', visible: true, isPrivate: false },
  { id: 'discount', label: 'Discount', visible: true, isPrivate: false },
  { id: 'taxPercent', label: 'Tax %', visible: true, isPrivate: false },
  { id: 'taxAmount', label: 'Tax Amount', visible: true, isPrivate: true },
  { id: 'lineTotal', label: 'Line Total', visible: true, isPrivate: false }
];
const DynamicColumnEngine = [
  { id: 'name', label: 'Item Description', width: 'flex-1' },
  { id: 'hsn', label: 'HSN/SAC', width: 'w-24' },
  { id: 'qty', label: 'Qty', width: 'w-20' },
  { id: 'rate', label: 'Rate', width: 'w-28' },
  { id: 'taxP', label: 'VAT %', width: 'w-20' },
  { id: 'total', label: 'Line Total', width: 'w-32' },
];

export default function EnterpriseInvoice() {
  const [invoice, setInvoice] = useState({
    version: 1,
    status: 'DRAFT', // 'DRAFT', 'FINAL', 'CANCELLED'
    lockedAt: null,
    history: [],
    auditLog: [],
    number: 'INV-2024-001',
    currency: 'AED',
    items: [{ id: 1, name: '', hsn: '', qty: 1, rate: 0, taxP: 5 }],
    globalDiscountPreTax: { value: 0, type: 'fixed' },
    tdsRate: 0,
    roundingMethod: 'HALF_EVEN',
    locked: false
  });

  const totals = useMemo(() => CalculateInvoice(invoice), [invoice]);

  const updateItem = (id, field, val) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  // Add column configuration state
  const [columnConfig, setColumnConfig] = useState(
    DynamicColumnEngine.map(col => ({
      ...col,
      visible: true,
      isPrivate: false // Hide in print if true
    }))
  );

  // Add toggle UI in editor panel
  const toggleColumnVisibility = (colId) => {
    setColumnConfig(prev =>
      prev.map(col =>
        col.id === colId ? { ...col, visible: !col.visible } : col
      )
    );
  };
  
  const renameColumn = (colId, newLabel) => {
    setColumnConfig(prev =>
      prev.map(col =>
        col.id === colId ? { ...col, label: newLabel } : col
      )
    );
  };
  

  const createRevision = () => {
    const currentInvoice = {
      ...invoice,
      version: invoice.version + 1,
      status: 'DRAFT',
      locked: false,
      lockedAt: null
    };

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'REVISION_CREATED',
      fromVersion: invoice.version,
      toVersion: currentInvoice.version
    };

    setInvoice({
      ...currentInvoice,
      history: [
        ...(invoice.history || []),
        {
          version: invoice.version,
          status: invoice.status,
          items: invoice.items,
          lockedAt: invoice.lockedAt
        }
      ],
      auditLog: [...(invoice.auditLog || []), auditEntry]
    });
  };

  const finalizeInvoice = () => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'FINALIZED',
      version: invoice.version
    };

    setInvoice({
      ...invoice,
      status: 'FINAL',
      locked: true,
      lockedAt: new Date().toISOString(),
      auditLog: [...(invoice.auditLog || []), auditEntry]
    });

    alert(`Invoice v${invoice.version} is now FINAL. Create a revision to edit.`);
  };

  const cancelInvoice = () => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'CANCELLED',
      version: invoice.version
    };

    setInvoice({
      ...invoice,
      status: 'CANCELLED',
      locked: true,
      auditLog: [...(invoice.auditLog || []), auditEntry]
    });
  };

  const generateInvoiceQR = (invoiceData, totals) => {
    // Guard: Check if required data exists
    if (!invoiceData || !totals || !totals.grandTotal) {
      return null;
    }

    const qrString = JSON.stringify({
      invoiceNo: invoiceData.invoiceNo || 'DRAFT',
      date: invoiceData.issueDate || new Date().toISOString().split('T')[0],
      total: totals.grandTotal.toString(),
      seller: invoiceData.seller?.name || 'N/A',
      buyer: invoiceData.buyer?.name || 'N/A'
    });

    try {
      const qr = new QRCode({
        text: qrString,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff'
      });
      return qr.createDataURL();
    } catch (err) {
      console.error('QR Generation failed:', err);
      return null;
    }
  };

  const qrCodeUrl = useMemo(() => {
    if (!invoice || !totals) return null;
    return generateInvoiceQR(invoice, totals);
  }, [invoice.invoiceNo, invoice.issueDate, invoice.seller?.name, invoice.buyer?.name, totals?.grandTotal]);

  return (
    <div id="invoice-root" className="min-h-screen bg-[#F3F4F6] font-sans antialiased text-slate-900">
      {/* 1. Global Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body, #invoice-root { background: white !important; padding: 0 !important; }
          #preview-pane { padding: 0 !important; }
          .a4-paper { box-shadow: none !important; margin: 0 !important; border: none !important; }
        }
        .ghost-input {
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .ghost-input:hover:not(:disabled), .ghost-input:focus {
          background: white;
          border-color: #E2E8F0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .a4-paper {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          margin: auto;
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* 2. NAVIGATION BAR */}
      <nav className="no-print sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Fin-Core Engine</h1>
            <p className="text-[10px] font-bold text-slate-400">ENTERPRISE GENERATOR v3.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setInvoice({...invoice, locked: !invoice.locked})}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all ${
              invoice.locked ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {invoice.locked ? <Lock size={14} /> : <Settings2 size={14} />}
            {invoice.locked ? 'UNSET FINAL' : 'FINAL LOCK'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-black hover:bg-slate-50">
            <Printer size={14} /> PRINT PDF
          </button>
        </div>
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_550px]">
        {/* 3. EDITOR PANEL (LEFT) */}
        <section className="no-print h-[calc(100vh-73px)] overflow-y-auto p-12">
          <div className="mx-auto max-w-4xl space-y-12">
            
            {/* Header Metadata */}
            <div className="grid grid-cols-3 gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Type</label>
                <input className="ghost-input w-full rounded-md p-2 text-sm font-bold uppercase" value="Tax Invoice" disabled={invoice.locked} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Number</label>
                <input className="ghost-input w-full rounded-md p-2 text-sm font-bold" value={invoice.number} disabled={invoice.locked} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</label>
                <select className="ghost-input w-full rounded-md p-2 text-sm font-bold appearance-none">
                  <option>AED - UAE Dirham</option>
                  <option>USD - Dollar</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Transaction Lines</h3>
                <button 
                  onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), name: '', qty: 1, rate: 0, taxP: 5}]})}
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-700"
                >
                  <Plus size={14} /> ADD POSITION
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {columnConfig
                        .filter(col => col.visible && !col.isPrivate) // Hide private columns in print
                        .map(col => (
                          <th key={col.id} className="border-b border-gray-300 px-2 py-1 text-left text-xs font-semibold">
                            {col.label}
                          </th>
                        ))
                      }
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50">
                        <td className="p-2"><input disabled={invoice.locked} className="ghost-input w-full p-2" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} /></td>
                        <td className="p-2"><input disabled={invoice.locked} className="ghost-input w-full p-2" value={item.hsn} onChange={e => updateItem(item.id, 'hsn', e.target.value)} /></td>
                        <td className="p-2"><input disabled={invoice.locked} type="number" className="ghost-input w-full p-2" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} /></td>
                        <td className="p-2"><input disabled={invoice.locked} type="number" className="ghost-input w-full p-2" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} /></td>
                        <td className="p-2"><input disabled={invoice.locked} type="number" className="ghost-input w-full p-2" value={item.taxP} onChange={e => updateItem(item.id, 'taxP', e.target.value)} /></td>
                        <td className="p-4 text-right font-black text-slate-900">
                          {(item.qty * item.rate).toFixed(2)}
                        </td>
                        <td className="p-2">
                          <button onClick={() => setInvoice({...invoice, items: invoice.items.filter(i => i.id !== item.id)})} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column Configuration */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Column Configuration</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {columnConfig.map(col => (
                  <div key={col.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumnVisibility(col.id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <input
                      type="text"
                      value={col.label}
                      onChange={e => renameColumn(col.id, e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border rounded bg-white hover:border-blue-300"
                      disabled={invoice.locked}
                    />
                    {col.isPrivate && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400">Compliance & Tax</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">TDS / Withholding (%)</label>
                    <input type="number" className="ghost-input w-full rounded-lg border border-slate-100 p-2 text-sm" value={invoice.tdsRate} onChange={e => setInvoice({...invoice, tdsRate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Extra Charges (Fixed)</label>
                    <input type="number" className="ghost-input w-full rounded-lg border border-slate-100 p-2 text-sm" />
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-900 bg-slate-900 p-8 text-white shadow-xl shadow-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs opacity-60">
                    <span>Subtotal</span>
                    <span>{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-60">
                    <span>Tax Aggregation</span>
                    <span>{totals.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-black">
                    <span>TOTAL DUE</span>
                    <span className="text-indigo-400">{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PREVIEW PANE (RIGHT) */}
        <section id="preview-pane" className="bg-slate-300 p-12 overflow-y-auto flex justify-center print:bg-white print:p-0">
          <div className={`relative w-full bg-white shadow-lg border-4 border-gray-200 p-8 ${
            invoice.status === 'CANCELLED' ? 'cancelled' : ''
          }`} style={{ height: '297mm', width: '210mm' }}>
            
            {/* WATERMARK */}
            {invoice.status === 'CANCELLED' && (
              <div className="invoice-watermark">CANCELLED</div>
            )}

            {/* REST OF INVOICE CONTENT */}
            <div className={invoice.status === 'CANCELLED' ? 'relative z-10 opacity-75' : 'relative z-10'}>
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter">TAX INVOICE</h2>
                  <div className="mt-6 text-[11px] space-y-1 uppercase tracking-wider text-slate-500">
                    <p className="font-black text-slate-900">Seller TRN: 100349200000003</p>
                    <p>Business Bay, Level 15</p>
                    <p>Dubai, United Arab Emirates</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-16 w-32 bg-slate-100 border border-dashed flex items-center justify-center text-[10px] text-slate-400 font-bold">LOGO</div>
                  <div className="mt-6 text-[11px] font-black uppercase">
                    <p>Invoice #: {invoice.number}</p>
                    <p className="text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <table className="mt-12 w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                    <th className="py-4">Item Details</th>
                    <th className="py-4 text-right">Qty</th>
                    <th className="py-4 text-right">Rate</th>
                    <th className="py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {totals.items.map((item, idx) => (
                    <tr key={idx} className="text-[12px]">
                      <td className="py-6">
                        <p className="font-black text-slate-900">{item.name || 'Undefined Item'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">HSN: {item.hsn || '---'}</p>
                      </td>
                      <td className="py-6 text-right font-medium">{item.qty}</td>
                      <td className="py-6 text-right font-medium">{item.rate.toFixed(2)}</td>
                      <td className="py-6 text-right font-black text-slate-900">{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-20 ml-auto w-64 space-y-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Net Subtotal</span>
                  <span>{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>VAT (5%)</span>
                  <span>{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-4 text-sm font-black">
                  <span>GRAND TOTAL</span>
                  <span className="text-lg tracking-tighter">{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-32 border-t border-slate-100 pt-10 grid grid-cols-2 gap-12">
                 <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Terms & Payment</h5>
                    <p className="text-[10px] leading-relaxed text-slate-500 italic">
                      All payments should be made via bank transfer to the details mentioned in the service agreement. 
                      Late payments incur a 2% monthly fee.
                    </p>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <div className="h-24 w-24 bg-slate-50 border p-1 border-slate-200">
                       <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 font-bold">ZATCA QR</div>
                    </div>
                    <p className="text-[7px] font-mono text-slate-300 break-all max-w-[150px] text-right">
                      SHA-256: {Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
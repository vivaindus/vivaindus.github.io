import React, { useState, useMemo } from 'react';
import { CalculateInvoice } from '../../engine-data/logic';
import { invoiceStyles } from '../../engine-data/styles';
import { 
  Plus, Trash2, ShieldCheck, Printer, 
  Lock, Settings2, Download, Eye, EyeOff 
} from 'lucide-react';

export default function EnterpriseInvoice() {
  const [invoice, setInvoice] = useState({
    status: 'DRAFT',
    number: 'INV-2024-001',
    currency: 'AED',
    items: [{ id: Date.now(), name: '', qty: 1, rate: 0, taxP: 5 }],
    columns: [
      { id: 'name', label: 'Description', visible: true },
      { id: 'qty', label: 'Qty', visible: true },
      { id: 'rate', label: 'Rate', visible: true },
      { id: 'taxP', label: 'VAT %', visible: true },
      { id: 'total', label: 'Total', visible: true },
    ],
    locked: false,
    isTaxInclusive: false
  });

  const totals = useMemo(() => CalculateInvoice(invoice), [invoice]);

  const updateItem = (id, field, val) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  return (
    <div id="invoice-root">
      {/* ISOLATED CSS INJECTION */}
      <style dangerouslySetInnerHTML={{ __html: invoiceStyles }} />

      {/* TOP SAAS BAR */}
      <nav className="no-print sticky top-0 z-50 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-sm font-black uppercase tracking-tighter">Fin-Core v3.0</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setInvoice({...invoice, locked: !invoice.locked, status: invoice.locked ? 'DRAFT' : 'FINAL'})}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
              invoice.locked ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white shadow-xl'
            }`}
          >
            {invoice.locked ? <Settings2 size={14}/> : <Lock size={14}/>}
            {invoice.locked ? 'EDIT MODE' : 'FINAL LOCK'}
          </button>
          <button onClick={() => window.print()} className="bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer size={18} />
          </button>
        </div>
      </nav>

      <div className="engine-container">
        {/* LEFT: EDITOR PANEL */}
        <section className="no-print editor-panel">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Metadata Card */}
            <div className="saas-card grid grid-cols-3 gap-8">
              <div className="space-y-2">
                <span className="section-title">Invoice Number</span>
                <input 
                  disabled={invoice.locked}
                  className="ghost-input font-black" 
                  value={invoice.number} 
                  onChange={e => setInvoice({...invoice, number: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <span className="section-title">Currency</span>
                <select className="ghost-input font-black">
                  <option>AED - Dirham</option>
                  <option>USD - Dollar</option>
                </select>
              </div>
              <div className="space-y-2 text-right">
                <span className="section-title">Tax Mode</span>
                <button 
                  onClick={() => setInvoice({...invoice, isTaxInclusive: !invoice.isTaxInclusive})}
                  className={`text-[10px] font-black px-3 py-1 rounded-full border ${invoice.isTaxInclusive ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-400'}`}
                >
                  {invoice.isTaxInclusive ? 'TAX INCLUSIVE' : 'TAX EXCLUSIVE'}
                </button>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="saas-card overflow-hidden !p-0">
               <div className="p-8 border-b border-slate-50">
                  <span className="section-title !mb-0">Transaction Positions</span>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-6">Description</th>
                      <th className="w-24 p-6">Qty</th>
                      <th className="w-32 p-6">Rate</th>
                      <th className="w-24 p-6">VAT %</th>
                      <th className="w-10 p-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id} className="group hover:bg-blue-50/20">
                        <td className="p-3">
                          <input 
                            disabled={invoice.locked}
                            className="ghost-input font-bold" 
                            value={item.name} 
                            placeholder="Item description..."
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            disabled={invoice.locked}
                            type="number" 
                            className="ghost-input" 
                            value={item.qty} 
                            onChange={e => updateItem(item.id, 'qty', e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            disabled={invoice.locked}
                            type="number" 
                            className="ghost-input" 
                            value={item.rate} 
                            onChange={e => updateItem(item.id, 'rate', e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            disabled={invoice.locked}
                            type="number" 
                            className="ghost-input" 
                            value={item.taxP} 
                            onChange={e => updateItem(item.id, 'taxP', e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <button 
                            disabled={invoice.locked}
                            onClick={() => setInvoice({...invoice, items: invoice.items.filter(i => i.id !== item.id)})}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <button 
                disabled={invoice.locked}
                onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), name: '', qty: 1, rate: 0, taxP: 5}]})}
                className="w-full py-4 bg-slate-50/50 text-[10px] font-black text-blue-600 uppercase hover:bg-blue-50"
               >
                 + Add Line Position
               </button>
            </div>
          </div>
        </section>

        {/* RIGHT: PREVIEW PANEL */}
        <section className="preview-panel">
          <div className={`a4-paper ${invoice.status === 'CANCELLED' ? 'watermark-cancelled' : ''}`}>
            
            <header style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'4px solid #000', paddingBottom:'2rem'}}>
               <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <h2 style={{fontSize:'36px', fontWeight:900, margin:0, letterSpacing:'-0.05em'}}>TAX INVOICE</h2>
                  <div style={{fontSize:'11px', fontWeight:'bold', color:'#666', textTransform:'uppercase'}}>
                    <p style={{color:'#000', marginBottom:'4px'}}>Seller TRN: 100349200000003</p>
                    <p>Business Bay, Dubai, UAE</p>
                  </div>
               </div>
               <div style={{textAlign:'right'}}>
                  <div style={{height:'60px', width:'120px', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontStyle:'italic', fontSize:'14px'}}>LOGO</div>
                  <div style={{marginTop:'1.5rem', fontSize:'11px', fontWeight:900, textTransform:'uppercase'}}>
                    <p>Invoice #: {invoice.number}</p>
                    <p style={{color:'#999'}}>Date: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>
            </header>

            <table className="line-table">
              <thead>
                <tr>
                  {invoice.columns.filter(c => c.visible).map(col => (
                    <th key={col.id}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {totals.items.map((item, idx) => (
                  <tr key={idx} style={{fontSize:'12px'}}>
                    {invoice.columns.filter(c => c.visible).map(col => (
                      <td key={col.id} style={{textAlign: col.id === 'name' ? 'left' : 'right'}}>
                        {col.id === 'total' ? item.lineTotal.toFixed(2) : item[col.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{marginLeft:'auto', width:'250px', marginTop:'3rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', fontWeight:900, textTransform:'uppercase', color:'#999'}}>
                  <span>Net Subtotal</span>
                  <span style={{color:'#000'}}>{totals.subtotal.toFixed(2)}</span>
               </div>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', fontWeight:900, textTransform:'uppercase', color:'#999'}}>
                  <span>Total VAT (5%)</span>
                  <span style={{color:'#000'}}>{totals.totalTax.toFixed(2)}</span>
               </div>
               <div style={{display:'flex', justifyContent:'space-between', borderTop:'3px solid #000', paddingTop:'1rem', fontSize:'16px', fontWeight:900}}>
                  <span style={{letterSpacing:'-0.02em'}}>TOTAL DUE</span>
                  <span style={{color:'var(--primary)'}}>{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
               </div>
            </div>

            <footer style={{marginTop:'auto', paddingTop:'5rem', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
               <div style={{width:'50%', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                  <span style={{fontSize:'9px', fontWeight:900, textTransform:'uppercase', color:'#999'}}>Legal Compliance</span>
                  <p style={{fontSize:'9px', color:'#999', lineHeight:1.5, fontStyle:'italic'}}>
                    Calculated via Fin-Core Engine using Banker's Rounding (HALF_EVEN). 
                    Final document hash verified for audit trails. 
                    Standard payment terms apply.
                  </p>
               </div>
               <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem'}}>
                  <div style={{height:'70px', width:'70px', border:'1px solid #eee', background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:900, color:'#ccc'}}>QR CODE</div>
                  <span style={{fontSize:'7px', fontFamily:'monospace', color:'#ccc'}}>HASH: {Math.random().toString(36).substring(2, 15)}</span>
               </div>
            </footer>

          </div>
        </section>
      </div>
    </div>
  );
}
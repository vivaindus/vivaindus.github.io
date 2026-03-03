import React, { useState, useMemo, useEffect } from 'react';
import Decimal from 'decimal.js';

// --- ENTERPRISE UTILITIES ---
const generateHash = async (data) => {
  const encoder = new TextEncoder();
  const cleanData = JSON.stringify({ ...data, hash: undefined, status: 'FINAL' });
  const msgBuffer = encoder.encode(cleanData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const formatCurrency = (val, symbol = 'AED') => {
  return symbol + ' ' + new Decimal(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

export default function EnterpriseInvoiceGenerator() {
  // --- 1. STATE MANAGEMENT ---
  const [invoice, setInvoice] = useState({
    status: 'DRAFT',
    number: 'INV-' + new Date().getFullYear() + '-001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'AED',
    isTaxInclusive: false,
    businessInfo: { name: 'Your Company LLC', trn: '100XXXXXXXXX003', address: 'Dubai, UAE' },
    clientInfo: { name: '', trn: '', address: '' },
    items: [{ id: Date.now(), name: '', qty: 1, rate: 0, taxP: 5, discount: 0 }],
    globalDiscount: 0,
    extraCharges: 0,
    notes: 'Thank you for your business.',
    hash: null,
    locked: false
  });

  // --- 2. DETERMINISTIC 12-STEP CALCULATION ENGINE ---
  const totals = useMemo(() => {
    const items = invoice.items;
    const isInclusive = invoice.isTaxInclusive;
    
    // Step 1-3: Line Base & Initial Adjustments
    let processed = items.map(item => {
      const q = new Decimal(item.qty || 0);
      const r = new Decimal(item.rate || 0);
      const lineBase = q.mul(r).sub(item.discount || 0);
      return { ...item, lineBase };
    });

    const totalLineBase = processed.reduce((acc, i) => acc.add(i.lineBase), new Decimal(0));

    // Step 4: Pro-rata Global Discount Distribution
    const gDisc = new Decimal(invoice.globalDiscount || 0);
    processed = processed.map(item => {
      const share = totalLineBase.isZero() ? new Decimal(0) : item.lineBase.div(totalLineBase);
      return { ...item, taxableBase: item.lineBase.sub(gDisc.mul(share)) };
    });

    // Step 5-9: Multi-Tax Engine & Grouping
    let taxGroups = {};
    processed = processed.map(item => {
      const rate = new Decimal(item.taxP || 0);
      let tax, net;
      if (isInclusive) {
        net = item.taxableBase.div(rate.div(100).add(1));
        tax = item.taxableBase.sub(net);
      } else {
        net = item.taxableBase;
        tax = net.mul(rate.div(100));
      }
      const rKey = rate.toString();
      taxGroups[rKey] = (taxGroups[rKey] || new Decimal(0)).add(tax);
      return { ...item, net, tax, total: net.add(tax) };
    });

    // Step 10-12: Final Totals & Banker's Rounding
    const subtotal = processed.reduce((acc, i) => acc.add(i.net), new Decimal(0));
    const totalTax = processed.reduce((acc, i) => acc.add(i.tax), new Decimal(0));
    const grandTotalRaw = subtotal.add(totalTax).add(invoice.extraCharges || 0);
    const grandTotal = grandTotalRaw.toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);

    return { items: processed, taxGroups, subtotal, totalTax, grandTotal };
  }, [invoice]);

  // --- 3. ACTIONS ---
  const handleLock = async () => {
    if (invoice.locked) {
      setInvoice(prev => ({ ...prev, locked: false, status: 'DRAFT', hash: null }));
    } else {
      const hash = await generateHash(invoice);
      setInvoice(prev => ({ ...prev, locked: true, status: 'FINAL', hash }));
    }
  };

  const updateItem = (id, field, val) => {
    if (invoice.locked) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: val } : i)
    }));
  };

  return (
    <div id="invoice-engine-container">
      {/* CSS ISOLATION LAYER */}
      <style dangerouslySetInnerHTML={{ __html: `
        #invoice-engine-container {
          --primary: #2563eb;
          --bg: #f1f5f9;
          --border: #e2e8f0;
          --text-main: #0f172a;
          --text-muted: #64748b;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .top-nav {
          background: white;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 450px;
          flex: 1;
          height: calc(100vh - 70px);
        }
        .editor-side {
          padding: 2rem;
          overflow-y: auto;
          background: var(--bg);
        }
        .preview-side {
          background: #334155;
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          justify-content: center;
        }
        .card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .section-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          display: block;
        }
        .input-group { margin-bottom: 1rem; }
        .input-group label { display: block; font-size: 0.8rem; margin-bottom: 0.3rem; font-weight: 600; }
        input, select, textarea {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.9rem;
          box-sizing: border-box;
        }
        .btn {
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-outline { background: white; border: 1px solid var(--border); color: var(--text-main); }
        
        /* A4 PAPER STYLING */
        .a4-paper {
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 20mm;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          box-sizing: border-box;
          color: #000;
          position: relative;
        }
        .paper-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 2rem; }
        .line-table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
        .line-table th { border-bottom: 2px solid #000; text-align: left; padding: 0.8rem 0.5rem; font-size: 0.75rem; text-transform: uppercase; }
        .line-table td { padding: 1rem 0.5rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
        .totals-box { margin-left: auto; width: 250px; margin-top: 2rem; }
        .total-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; }
        .grand-total { border-top: 2px solid #000; margin-top: 0.5rem; padding-top: 0.5rem; font-weight: 900; font-size: 1.1rem; }
        
        .hash-box { margin-top: 5rem; font-family: monospace; font-size: 8px; color: #94a3b8; word-break: break-all; }
        @media print {
          .top-nav, .editor-side { display: none !important; }
          .main-layout { display: block; height: auto; }
          .preview-side { padding: 0; background: white; }
          .a4-paper { box-shadow: none; width: 100%; margin: 0; }
        }
      `}} />

      {/* TOP NAVIGATION */}
      <nav className="top-nav">
        <div style={{display:'flex', alignItems:'center', gap: '1rem'}}>
          <div style={{background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', fontWeight: 900}}>EC</div>
          <div>
            <div style={{fontWeight: 900, fontSize: '0.9rem'}}>FIN-CORE ENGINE v3.0</div>
            <div style={{fontSize: '0.6rem', color: 'var(--text-muted)'}}>{invoice.status} | {invoice.locked ? 'IMMUTABLE' : 'READ_WRITE'}</div>
          </div>
        </div>
        <div style={{display:'flex', gap: '0.5rem'}}>
          <button className="btn btn-outline" onClick={() => window.print()}>PRINT PDF</button>
          <button className={`btn ${invoice.locked ? 'btn-outline' : 'btn-primary'}`} onClick={handleLock}>
            {invoice.locked ? '🔓 UNLOCK' : '🔒 FINALIZE & LOCK'}
          </button>
        </div>
      </nav>

      <div className="main-layout">
        {/* LEFT: EDITOR */}
        <div className="editor-side">
          <div className="card">
            <span className="section-label">Document Metadata</span>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
              <div className="input-group">
                <label>Invoice #</label>
                <input value={invoice.number} disabled={invoice.locked} onChange={e => setInvoice({...invoice, number: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Issue Date</label>
                <input type="date" value={invoice.issueDate} disabled={invoice.locked} onChange={e => setInvoice({...invoice, issueDate: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Currency</label>
                <select value={invoice.currency} disabled={invoice.locked} onChange={e => setInvoice({...invoice, currency: e.target.value})}>
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
              <span className="section-label" style={{margin:0}}>Transaction Items</span>
              <button className="btn btn-outline" style={{padding:'0.3rem 0.6rem'}} onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), name:'', qty:1, rate:0, taxP:5, discount:0}]})} disabled={invoice.locked}>+ ADD LINE</button>
            </div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{fontSize:'0.7rem', color:'var(--text-muted)', textAlign:'left'}}>
                  <th>Description</th>
                  <th width="80">Qty</th>
                  <th width="120">Rate</th>
                  <th width="80">VAT %</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td><input value={item.name} placeholder="Item description" disabled={invoice.locked} onChange={e => updateItem(item.id, 'name', e.target.value)} /></td>
                    <td><input type="number" value={item.qty} disabled={invoice.locked} onChange={e => updateItem(item.id, 'qty', e.target.value)} /></td>
                    <td><input type="number" value={item.rate} disabled={invoice.locked} onChange={e => updateItem(item.id, 'rate', e.target.value)} /></td>
                    <td><input type="number" value={item.taxP} disabled={invoice.locked} onChange={e => updateItem(item.id, 'taxP', e.target.value)} /></td>
                    <td><button onClick={() => setInvoice({...invoice, items: invoice.items.filter(i => i.id !== item.id)})} disabled={invoice.locked || invoice.items.length === 1}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
            <div className="card">
              <span className="section-label">Global Adjustments</span>
              <div className="input-group">
                <label>Global Discount (Fixed)</label>
                <input type="number" value={invoice.globalDiscount} disabled={invoice.locked} onChange={e => setInvoice({...invoice, globalDiscount: e.target.value})} />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <input type="checkbox" style={{width:'auto'}} checked={invoice.isTaxInclusive} onChange={e => setInvoice({...invoice, isTaxInclusive: e.target.checked})} disabled={invoice.locked} />
                <label style={{fontSize:'0.8rem'}}>Tax Inclusive Pricing</label>
              </div>
            </div>
            <div className="card">
              <span className="section-label">Compliance Notes</span>
              <textarea style={{height:'85px'}} value={invoice.notes} disabled={invoice.locked} onChange={e => setInvoice({...invoice, notes: e.target.value})} />
            </div>
          </div>
        </div>

        {/* RIGHT: A4 PREVIEW */}
        <div className="preview-side">
          <div className="a4-paper">
            <div className="paper-header">
              <div>
                <div style={{fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em'}}>TAX INVOICE</div>
                <div style={{marginTop: '1rem', fontSize: '0.8rem'}}>
                  <strong>{invoice.businessInfo.name}</strong><br/>
                  TRN: {invoice.businessInfo.trn}<br/>
                  {invoice.businessInfo.address}
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{height: '60px', width: '120px', background: '#eee', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#aaa'}}>LOGO</div>
                <div style={{fontSize: '0.8rem'}}>
                  <strong>Invoice: {invoice.number}</strong><br/>
                  Date: {invoice.issueDate}
                </div>
              </div>
            </div>

            <table className="line-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{textAlign:'right'}}>Qty</th>
                  <th style={{textAlign:'right'}}>Rate</th>
                  <th style={{textAlign:'right'}}>VAT</th>
                  <th style={{textAlign:'right'}}>Amount ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody>
                {totals.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: 700}}>{item.name || 'Service Item'}</td>
                    <td style={{textAlign:'right'}}>{item.qty}</td>
                    <td style={{textAlign:'right'}}>{new Decimal(item.rate).toFixed(2)}</td>
                    <td style={{textAlign:'right'}}>{item.tax.toFixed(2)}</td>
                    <td style={{textAlign:'right', fontWeight: 700}}>{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals-box">
              <div className="total-row">
                <span>Subtotal (Net)</span>
                <span>{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Total VAT</span>
                <span>{totals.totalTax.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL DUE</span>
                <span>{formatCurrency(totals.grandTotal, invoice.currency)}</span>
              </div>
            </div>

            <div style={{marginTop: '4rem'}}>
              <div className="section-label">Notes & Terms</div>
              <p style={{fontSize: '0.75rem', lineHeight: 1.5}}>{invoice.notes}</p>
            </div>

            <div className="hash-box">
              DOCUMENT_INTEGRITY_HASH: {invoice.hash || 'PRE_STAMP_DRAFT'}
              <br/>
              COMPLIANCE: FTA VAT EXECUTIVE DECREE NO. 8 OF 2017
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
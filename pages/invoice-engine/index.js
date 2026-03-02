import React, { useState, useMemo } from 'react';
import { InvoiceEngine, numberToWords } from '../../engine-data/logic';

export default function RefrensStyleInvoice() {
  const [status, setStatus] = useState('DRAFT');
  const [invoice, setInvoice] = useState({
    invoiceNo: "INV-2024-001",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    currency: "USD",
    company: { name: "", address: "", taxId: "" },
    customer: { name: "", address: "", taxId: "" },
    items: [{ id: Date.now(), description: "", qty: 1, unitPrice: 0, taxRate: 0 }],
    globalDiscount: { value: 0, type: 'percent', layer: 'before_tax' },
    extraCharges: [],
    tdsRate: 0,
    config: { roundingMode: 'HALF_EVEN', precision: 2, taxInclusive: false }
  });

  const totals = useMemo(() => {
    const engine = new InvoiceEngine(invoice.config);
    return engine.calculate(invoice);
  }, [invoice]);

  const isLocked = status === 'FINAL';

  return (
    <div className="refrens-container">
      <style>{`
        .refrens-container {
          background-color: #f3f4f6;
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }
        .main-wrapper {
          display: flex;
          gap: 30px;
          max-width: 1200px;
          width: 100%;
        }
        .invoice-paper {
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 60px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          position: relative;
        }
        .sidebar {
          width: 320px;
          position: sticky;
          top: 40px;
          height: fit-content;
        }
        .action-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-bottom: 12px;
        }
        .btn-secondary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .input-minimal {
          border: 1px solid transparent;
          padding: 4px 8px;
          width: 100%;
          font-size: 14px;
          transition: border 0.2s;
        }
        .input-minimal:hover:not(:disabled), .input-minimal:focus {
          border-color: #e2e8f0;
          background: #f8fafc;
          outline: none;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 60px;
        }
        .logo-box {
          width: 150px;
          height: 80px;
          background: #f1f5f9;
          border: 2px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
        }
        .label-group {
          margin-bottom: 20px;
        }
        .label {
          font-size: 10px;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 40px 0;
        }
        .items-table th {
          background: #f8fafc;
          padding: 12px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .totals-section {
          margin-left: auto;
          width: 300px;
          margin-top: 40px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #475569;
        }
        .grand-total {
          border-top: 2px solid #000;
          margin-top: 12px;
          padding-top: 12px;
          font-weight: 900;
          font-size: 18px;
          color: #000;
        }
        @media print {
          .sidebar, .no-print { display: none !important; }
          .refrens-container { background: white; padding: 0; }
          .invoice-paper { box-shadow: none; padding: 20mm; }
        }
      `}</style>

      <div className="main-wrapper">
        {/* INVOICE PAPER AREA */}
        <div className="invoice-paper">
          <div className="invoice-header">
            <div>
              <h1 style={{fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '20px'}}>Tax Invoice</h1>
              <div className="label-group">
                <input 
                  className="input-minimal" 
                  style={{fontSize: '18px', fontWeight: 700}} 
                  placeholder="Your Company Name" 
                  disabled={isLocked}
                />
                <textarea 
                  className="input-minimal" 
                  style={{height: '60px', color: '#64748b'}} 
                  placeholder="Company Address & Tax ID"
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="logo-box">UPLOAD LOGO</div>
          </div>

          <div style={{display: 'flex', gap: '40px', marginBottom: '40px'}}>
            <div style={{flex: 1}}>
              <span className="label">Bill To</span>
              <input className="input-minimal" style={{fontWeight: 700}} placeholder="Customer Name" disabled={isLocked} />
              <textarea className="input-minimal" style={{height: '60px', color: '#64748b'}} placeholder="Customer Address & Tax ID" disabled={isLocked} />
            </div>
            <div style={{width: '200px'}}>
              <div className="label-group">
                <span className="label">Invoice No.</span>
                <input className="input-minimal" defaultValue={invoice.invoiceNo} disabled={isLocked} />
              </div>
              <div className="label-group">
                <span className="label">Date</span>
                <input type="date" className="input-minimal" defaultValue={invoice.date} disabled={isLocked} />
              </div>
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th style={{width: '50%'}}>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax %</th>
                <th style={{textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td><input className="input-minimal" placeholder="Item description" disabled={isLocked} /></td>
                  <td>
                    <input 
                      type="number" 
                      className="input-minimal" 
                      value={item.qty} 
                      onChange={e => {
                        const next = [...invoice.items];
                        next[idx].qty = parseFloat(e.target.value) || 0;
                        setInvoice({...invoice, items: next});
                      }}
                      disabled={isLocked}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="input-minimal" 
                      value={item.unitPrice} 
                      onChange={e => {
                        const next = [...invoice.items];
                        next[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setInvoice({...invoice, items: next});
                      }}
                      disabled={isLocked}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="input-minimal" 
                      value={item.taxRate} 
                      onChange={e => {
                        const next = [...invoice.items];
                        next[idx].taxRate = parseFloat(e.target.value) || 0;
                        setInvoice({...invoice, items: next});
                      }}
                      disabled={isLocked}
                    />
                  </td>
                  <td style={{textAlign: 'right', fontWeight: 700}}>{item.lineTotal?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLocked && (
            <button 
              className="btn-secondary no-print" 
              style={{width: 'auto', padding: '8px 16px'}}
              onClick={() => setInvoice({...invoice, items: [...invoice.items, {id: Date.now(), qty: 1, unitPrice: 0, taxRate: 0}]})}
            >+ Add New Line</button>
          )}

          <div className="totals-section">
            <div className="total-row"><span>Subtotal</span> <span>{totals.subtotal.toFixed(2)}</span></div>
            <div className="total-row"><span>Total Tax</span> <span>{totals.totalTax.toFixed(2)}</span></div>
            <div className="total-row grand-total">
              <span>Grand Total</span>
              <span>{invoice.currency} {totals.grandTotal.toFixed(2)}</span>
            </div>
            <p style={{fontSize: '10px', textAlign: 'right', marginTop: '10px', color: '#94a3b8', fontWeight: 800}}>
              {numberToWords(totals.grandTotal)}
            </p>
          </div>
        </div>

        {/* SIDEBAR AREA */}
        <div className="sidebar no-print">
          <div className="action-card">
            <button className="btn-primary" onClick={() => setStatus('FINAL')}>{isLocked ? '✓ Locked' : 'Finalize & Lock'}</button>
            <button className="btn-secondary" onClick={() => window.print()}>Print / Save PDF</button>
          </div>
          <div className="action-card">
            <span className="label">Configuration</span>
            <div style={{marginTop: '15px'}}>
               <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'}}>
                  <input type="checkbox" onChange={e => setInvoice({...invoice, config: {...invoice.config, taxInclusive: e.target.checked}})} />
                  Tax Inclusive Mode
               </label>
            </div>
            <div style={{marginTop: '15px'}}>
               <span className="label">TDS Rate %</span>
               <input 
                  type="number" 
                  className="input-minimal" 
                  style={{border: '1px solid #e2e8f0', borderRadius: '4px'}}
                  onChange={e => setInvoice({...invoice, tdsRate: parseFloat(e.target.value) || 0})}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
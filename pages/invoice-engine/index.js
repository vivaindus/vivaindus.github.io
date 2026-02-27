import React, { useState, useEffect, useMemo, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';
import { supabase } from '../../lib/supabase';

export default function ShbEnterpriseInvoice() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);

    // --- Enterprise State Management ---
    const [config, setConfig] = useState({ country: 'AE', theme: '#064e3b', template: 'modern' });
    const [columns, setColumns] = useState({ hsn: false, discount: true, tax: true, unit: false });
    const [meta, setMeta] = useState({
        title: 'TAX INVOICE', iNum: 'INV-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().split('T')[0],
        sender: 'SHIFA STORES\nDubai, UAE\nTRN: 100XXXXXXXXXXXX',
        client: 'CLIENT NAME\nAddress\nTRN: 100XXXXXXXXXXXX',
        notes: 'Thank you for choosing Shifa Stores.',
        status: 'unpaid'
    });
    const [items, setItems] = useState([{ id: 1, name: 'Product Name', qty: 1, rate: 100, disc: 0, tax: 5, hsn: '' }]);

    useEffect(() => { setMounted(true); }, []);

    // --- Calculation Engine ---
    const totals = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        const rows = items.map(item => {
            const gross = item.qty * item.rate;
            const discAmt = (gross * item.disc) / 100;
            const taxable = gross - discAmt;
            const taxAmt = (taxable * item.tax) / 100;
            return { ...item, total: taxable + taxAmt, taxAmt, taxable };
        });
        const subtotal = rows.reduce((a, b) => a + b.taxable, 0);
        const taxTotal = rows.reduce((a, b) => a + b.taxAmt, 0);
        const grandTotal = subtotal + taxTotal;
        return { rows, subtotal, taxTotal, grandTotal, jur, words: amountToWords(grandTotal, jur) };
    }, [items, config]);

    // --- Enterprise Features ---
    const saveToCloud = async () => {
        const { error } = await supabase.from('shb_invoices').upsert({
            invoice_number: meta.iNum,
            total_amount: totals.grandTotal,
            status: meta.status,
            invoice_data: { meta, items, config, columns }
        });
        alert(error ? "Error saving" : "Invoice Synced to Cloud! ✅");
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(img, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save(`${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Suite" description="Complete Billing Management System">
            <div style={styles.container}>
                
                {/* 1. THE SETTINGS SIDEBAR (Refrens Style) */}
                <aside style={styles.sidebar}>
                    <h3 style={styles.h3}>Design & Layout</h3>
                    <label style={styles.lCap}>Primary Theme Color</label>
                    <input type="color" value={config.theme} onChange={e => setConfig({...config, theme: e.target.value})} style={{width:'100%', height:'40px', border:'none', marginBottom:'20px'}} />
                    
                    <h3 style={styles.h3}>Column Configuration</h3>
                    <div style={styles.toggleGroup}>
                        <label style={styles.checkLabel}><input type="checkbox" checked={columns.hsn} onChange={e => setColumns({...columns, hsn: e.target.checked})} /> Show HSN/SAC</label>
                        <label style={styles.checkLabel}><input type="checkbox" checked={columns.discount} onChange={e => setColumns({...columns, discount: e.target.checked})} /> Show Discount</label>
                        <label style={styles.checkLabel}><input type="checkbox" checked={columns.unit} onChange={e => setColumns({...columns, unit: e.target.checked})} /> Show Units (kg/pcs)</label>
                    </div>

                    <h3 style={styles.h3}>Jurisdiction</h3>
                    <select style={styles.sel} value={config.country} onChange={e => setConfig({...config, country: e.target.value})}>
                        {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                    </select>

                    <h3 style={styles.h3}>Invoice Status</h3>
                    <select style={styles.sel} value={meta.status} onChange={e => setMeta({...meta, status: e.target.value})}>
                        <option value="unpaid">Unpaid / Draft</option>
                        <option value="paid">Mark as Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>

                    <button onClick={saveToCloud} style={{width:'100%', padding:'15px', background:'#34d399', border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold', cursor:'pointer', marginBottom:'10px'}}>SAVE TO CLOUD</button>
                    <button onClick={exportPDF} style={{width:'100%', padding:'15px', background:config.theme, border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold', cursor:'pointer'}}>DOWNLOAD PDF</button>
                </aside>

                {/* 2. THE LIVE PREVIEW (Paper) */}
                <main style={styles.workspace}>
                    <div ref={invoiceRef} style={styles.paper}>
                        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'8px', background:config.theme}}></div>
                        
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'40px'}}>
                            <div style={{flex:1}}>
                                <input style={{...styles.inlineInput, fontSize:'2.2rem', fontWeight:'900', color:config.theme}} value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} />
                                <textarea style={{...styles.inlineInput, height:'100px', marginTop:'15px'}} value={meta.sender} onChange={e => setMeta({...meta, sender: e.target.value})} />
                            </div>
                            <div style={{textAlign:'right', width:'250px'}}>
                                <div style={{background:'#f8fafc', height:'100px', border:'1px dashed #cbd5e1', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>Add Brand Logo</span>
                                </div>
                                <div style={{marginTop:'20px'}}>
                                    <div style={{fontSize:'0.8rem'}}>No: <b>{meta.iNum}</b></div>
                                    <div style={{fontSize:'0.8rem'}}>Date: <b>{meta.date}</b></div>
                                </div>
                            </div>
                        </div>

                        <div style={{marginBottom:'30px'}}>
                            <span style={styles.lCap}>BILL TO:</span>
                            <textarea style={{...styles.inlineInput, fontWeight:'bold', fontSize:'1.1rem'}} value={meta.client} onChange={e => setMeta({...meta, client: e.target.value})} />
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>DESCRIPTION</th>
                                    {columns.hsn && <th style={styles.th}>HSN</th>}
                                    <th style={styles.th}>QTY</th>
                                    <th style={styles.th}>RATE</th>
                                    {columns.discount && <th style={styles.th}>DISC %</th>}
                                    <th style={{...styles.th, textAlign:'right'}}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {totals.rows.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td style={styles.td}><input style={styles.inlineInput} value={item.name} onChange={e => {const ni=[...items]; ni[idx].name=e.target.value; setItems(ni);}} /></td>
                                        {columns.hsn && <td style={styles.td}><input style={styles.inlineInput} value={item.hsn} onChange={e => {const ni=[...items]; ni[idx].hsn=e.target.value; setItems(ni);}} /></td>}
                                        <td style={styles.td}><input type="number" style={styles.inlineInput} value={item.qty} onChange={e => {const ni=[...items]; ni[idx].qty=e.target.value; setItems(ni);}} /></td>
                                        <td style={styles.td}><input type="number" style={styles.inlineInput} value={item.rate} onChange={e => {const ni=[...items]; ni[idx].rate=e.target.value; setItems(ni);}} /></td>
                                        {columns.discount && <td style={styles.td}><input type="number" style={styles.inlineInput} value={item.disc} onChange={e => {const ni=[...items]; ni[idx].disc=e.target.value; setItems(ni);}} /></td>}
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.total.toFixed(totals.jur.decimals)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setItems([...items, {id: Date.now(), name:'', qty:1, rate:0, disc:0, tax: totals.jur.taxRate}])} style={{background:'none', border:'1px dashed #ccc', width:'100%', padding:'10px', cursor:'pointer', marginTop:'10px', color:'#94a3b8'}}>+ Add New Line</button>

                        <div style={styles.totalsArea}>
                            <div style={styles.totalsTable}>
                                <div style={styles.totalRow}><span>Subtotal</span><span>{totals.subtotal.toFixed(totals.jur.decimals)}</span></div>
                                <div style={styles.totalRow}><span>{totals.jur.taxLabel} Total</span><span>{totals.taxTotal.toFixed(totals.jur.decimals)}</span></div>
                                <div style={styles.grandTotal}><span>GRAND TOTAL</span><span>{totals.jur.currency} {totals.grandTotal.toFixed(totals.jur.decimals)}</span></div>
                            </div>
                        </div>

                        <div style={{marginTop:'40px'}}>
                            <span style={styles.lCap}>AMOUNT IN WORDS:</span>
                            <p style={{fontWeight:'bold', color:config.theme}}>{totals.words}</p>
                        </div>
                    </div>
                </main>
            </div>
        </ToolboxLayout>
    );
}
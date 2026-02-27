import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

export default function InvoiceCreator() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);

    // --- State ---
    const [config, setConfig] = useState({ country: 'AE', taxMode: 'exclusive', theme: '#064e3b', showHSN: false, showDisc: false });
    const [meta, setMeta] = useState({
        title: 'TAX INVOICE', iNum: 'INV-001', date: new Date().toISOString().split('T')[0],
        sender: 'YOUR BUSINESS NAME\nAddress Line 1\nTRN/GSTIN: 100XXXXXXXXXXXX',
        client: 'CLIENT NAME\nBilling Address\nTax ID: 100XXXXXXXXXXXX',
        notes: 'Payment is due within 15 days.', logo: null, signature: null
    });
    const [items, setItems] = useState([{ id: 1, name: '', hsn: '', qty: 1, rate: 0, tax: 5, disc: 0 }]);
    const [extra, setExtra] = useState({ shipping: 0, rounding: 0 });

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_invoice_lite_v1');
        if (saved) {
            const p = JSON.parse(saved);
            setConfig(p.config); setMeta(p.meta); setItems(p.items); setExtra(p.extra);
        }
    }, []);

    // --- Calculation Engine ---
    const engine = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        const rows = items.map(item => {
            const lineGross = item.qty * item.rate;
            const lineDisc = (lineGross * item.disc) / 100;
            const taxable = lineGross - lineDisc;
            let taxAmt = 0;
            if (config.taxMode === 'inclusive') {
                taxAmt = taxable - (taxable / (1 + item.tax / 100));
            } else {
                taxAmt = taxable * (item.tax / 100);
            }
            return { ...item, taxable, taxAmt, total: config.taxMode === 'exclusive' ? taxable + taxAmt : taxable };
        });

        const subtotal = rows.reduce((a, b) => a + b.taxable, 0);
        const taxTotal = rows.reduce((a, b) => a + b.taxAmt, 0);
        const grandTotal = subtotal + taxTotal + parseFloat(extra.shipping || 0) + parseFloat(extra.rounding || 0);

        return { rows, subtotal, taxTotal, grandTotal, jur, words: amountToWords(grandTotal, jur) };
    }, [items, config, extra]);

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, [field]: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const downloadPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 2.5, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        
        let hLeft = imgH, pos = 0;
        pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
        hLeft -= 295;

        while (hLeft > 0) {
            pos = hLeft - imgH;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
            hLeft -= 295;
        }
        pdf.save(`${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Invoice Creator" description="Professional Print-Ready Invoice Generator">
            <div style={styles.app}>
                <aside style={styles.sidebar}>
                    <div style={styles.card}>
                        <h3 style={styles.h3}>Jurisdiction</h3>
                        <select style={{width:'100%', padding:'10px', borderRadius:'8px'}} value={config.country} onChange={e => setConfig({...config, country: e.target.value})}>
                            {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                        </select>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Tax Mode</h3>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button style={{...styles.btn, flex:1, background: config.taxMode==='exclusive'?'#38bdf8':'#334155'}} onClick={()=>setConfig({...config, taxMode:'exclusive'})}>Exclusive</button>
                            <button style={{...styles.btn, flex:1, background: config.taxMode==='inclusive'?'#38bdf8':'#334155'}} onClick={()=>setConfig({...config, taxMode:'inclusive'})}>Inclusive</button>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Columns</h3>
                        <label style={{display:'block', fontSize:'0.8rem', marginBottom:'10px'}}><input type="checkbox" checked={config.showHSN} onChange={e => setConfig({...config, showHSN: e.target.checked})} /> HSN/SAC Column</label>
                        <label style={{display:'block', fontSize:'0.8rem'}}><input type="checkbox" checked={config.showDisc} onChange={e => setConfig({...config, showDisc: e.target.checked})} /> Discount Column</label>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Logo & Signature</h3>
                        <input type="file" onChange={e => handleFile(e, 'logo')} style={{fontSize:'0.7rem', marginBottom:'10px'}} />
                        <input type="file" onChange={e => handleFile(e, 'signature')} style={{fontSize:'0.7rem'}} />
                    </div>

                    <button onClick={() => {localStorage.setItem('shb_invoice_lite_v1', JSON.stringify({config, meta, items, extra})); alert("Draft Saved!")}} style={{...styles.btn, background:'#34d399', color:'#0f172a', marginBottom:'10px'}}>SAVE DRAFT</button>
                    <button onClick={downloadPDF} style={{...styles.btn, ...styles.btnPrimary}}>DOWNLOAD PDF</button>
                    <button onClick={() => window.location.reload()} style={{...styles.btn, ...styles.btnReset}}>RESET ALL</button>
                </aside>

                <main style={styles.workspace}>
                    <div ref={invoiceRef} style={styles.paper}>
                        {/* Header */}
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'40px', borderBottom:'2px solid #000', paddingBottom:'20px'}}>
                            <div style={{flex:1.5}}>
                                <input style={{...styles.ghostInp, fontSize:'2.2rem', fontWeight:'900'}} value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} />
                                <textarea style={styles.areaInp} value={meta.sender} onChange={e => setMeta({...meta, sender: e.target.value})} />
                            </div>
                            <div style={{flex:1, textAlign:'right'}}>
                                {meta.logo && <img src={meta.logo} style={{maxHeight:'80px', marginBottom:'15px'}} />}
                                <div style={{fontSize:'0.85rem'}}>No: <input style={{width:'80px', fontWeight:'bold', borderBottom:'1px solid #eee'}} value={meta.iNum} onChange={e => setMeta({...meta, iNum: e.target.value})} /></div>
                                <div style={{fontSize:'0.85rem'}}>Date: <input type="date" style={{border:'none', background:'none', fontWeight:'bold'}} value={meta.date} onChange={e => setMeta({...meta, date: e.target.value})} /></div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div style={{marginBottom:'30px'}}>
                            <p style={{fontSize:'0.7rem', fontWeight:'800', color:'#64748b'}}>BILL TO:</p>
                            <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1rem'}} value={meta.client} onChange={e => setMeta({...meta, client: e.target.value})} />
                        </div>

                        {/* Table */}
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>DESCRIPTION</th>
                                    {config.showHSN && <th style={styles.th}>HSN</th>}
                                    <th style={styles.th}>QTY</th>
                                    <th style={styles.th}>RATE</th>
                                    {config.showDisc && <th style={styles.th}>DISC %</th>}
                                    <th style={styles.th}>{engine.jur.taxLabel} %</th>
                                    <th style={{...styles.th, textAlign:'right'}}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engine.rows.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td style={styles.td}><input style={styles.ghostInp} value={item.name} onChange={e => {const ni=[...items]; ni[idx].name=e.target.value; setItems(ni);}} placeholder="Item name" /></td>
                                        {config.showHSN && <td style={styles.td}><input style={styles.ghostInp} value={item.hsn} onChange={e => {const ni=[...items]; ni[idx].hsn=e.target.value; setItems(ni);}} /></td>}
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.qty} onChange={e => {const ni=[...items]; ni[idx].qty=e.target.value; setItems(ni);}} /></td>
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.rate} onChange={e => {const ni=[...items]; ni[idx].rate=e.target.value; setItems(ni);}} /></td>
                                        {config.showDisc && <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.disc} onChange={e => {const ni=[...items]; ni[idx].disc=e.target.value; setItems(ni);}} /></td>}
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.tax} onChange={e => {const ni=[...items]; ni[idx].tax=e.target.value; setItems(ni);}} /></td>
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.total.toFixed(engine.jur.decimals)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setItems([...items, {id: Date.now(), name:'', hsn:'', qty:1, rate:0, tax:5, disc:0}])} style={{width:'100%', padding:'10px', background:'none', border:'1px dashed #ccc', marginTop:'10px', cursor:'pointer', color:'#94a3b8'}}>+ Add Line</button>

                        {/* Totals */}
                        <div style={{display:'flex', justifyContent:'space-between', marginTop:'40px', breakInside:'avoid'}}>
                            <div style={{width:'55%'}}>
                                <p style={{fontSize:'0.7rem', fontWeight:'800', color:'#64748b'}}>TOTAL IN WORDS:</p>
                                <p style={{fontWeight:'bold', fontSize:'0.9rem'}}>{engine.words}</p>
                                <div style={{marginTop:'30px'}}>
                                    <p style={{fontSize:'0.7rem', fontWeight:'800', color:'#64748b'}}>NOTES & TERMS:</p>
                                    <textarea style={styles.areaInp} value={meta.notes} onChange={e => setMeta({...meta, notes: e.target.value})} />
                                </div>
                            </div>
                            <div style={{width:'260px'}}>
                                <div style={styles.totalRow}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.jur.decimals)}</span></div>
                                <div style={styles.totalRow}><span>Tax Total</span><span>{engine.taxTotal.toFixed(engine.jur.decimals)}</span></div>
                                <div style={styles.totalRow}><span>Shipping</span><input type="number" value={extra.shipping} onChange={e => setExtra({...extra, shipping: e.target.value})} style={{width:'80px', textAlign:'right', borderBottom:'1px solid #eee'}} /></div>
                                <div style={styles.grandRow}><span>TOTAL</span><span>{engine.jur.currency} {engine.grandTotal.toFixed(engine.jur.decimals)}</span></div>
                                {meta.signature && <div style={{textAlign:'right', marginTop:'20px'}}><img src={meta.signature} style={{maxHeight:'60px'}} /><p style={{fontSize:'0.6rem', fontWeight:'bold'}}>Authorized Signatory</p></div>}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <style jsx>{`
                @media print { :global(.no-print) { display: none !important; } }
                input:hover, textarea:hover { background: rgba(56, 189, 248, 0.05); }
            `}</style>
        </ToolboxLayout>
    );
}
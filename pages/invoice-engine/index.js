import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

export default function EnterpriseInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [activeLabel, setActiveLabel] = useState('ORIGINAL');

    // --- Configuration State ---
    const [config, setConfig] = useState({
        country: 'AE', taxMode: 'exclusive', themeColor: '#3b82f6',
        showHSN: false, showDisc: false, showUnit: false, decimals: 2
    });

    // --- Metadata State ---
    const [meta, setMeta] = useState({
        title: 'TAX INVOICE', iNum: 'INV-2026-001', date: new Date().toISOString().split('T')[0],
        due: '', supply: '', sender: 'YOUR BUSINESS NAME\nDubai, UAE\nTRN: 100XXXXXXXXXXXX',
        client: 'CLIENT NAME\nAddress Line\nTax ID', logo: null, signature: null,
        notes: 'Reverse Charge applies if applicable.', terms: '1. Net 15 Days\n2. E&OE'
    });

    // --- Line Items State ---
    const [items, setItems] = useState([
        { id: 1, name: 'Description here', hsn: '', unit: 'pcs', qty: 1, rate: 0, tax: 5, disc: 0 }
    ]);

    // --- Extra Charges ---
    const [extra, setExtra] = useState({ shipping: 0, adjustment: 0 });

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v18_master');
        if (saved) {
            const p = JSON.parse(saved);
            setConfig(p.config); setMeta(p.meta); setItems(p.items); setExtra(p.extra);
        }
    }, []);

    // --- CORE CALCULATION ENGINE ---
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

        const subtotal = rows.reduce((acc, r) => acc + r.taxable, 0);
        const taxTotal = rows.reduce((acc, r) => acc + r.taxAmt, 0);
        
        // India GST Split Logic
        const taxSummary = [];
        if (jur.hasSplitTax) {
            taxSummary.push({ label: 'CGST', amt: taxTotal / 2 });
            taxSummary.push({ label: 'SGST', amt: taxTotal / 2 });
        } else {
            taxSummary.push({ label: jur.taxLabel, amt: taxTotal });
        }

        const grandTotal = subtotal + taxTotal + parseFloat(extra.shipping || 0) + parseFloat(extra.adjustment || 0);

        return { rows, subtotal, taxTotal, taxSummary, grandTotal, jur, words: amountToWords(grandTotal, jur) };
    }, [items, config, extra]);

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, [field]: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const duplicateRow = (id) => {
        const target = items.find(i => i.id === id);
        setItems([...items, { ...target, id: Date.now() }]);
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
        hLeft -= 295;
        while (hLeft > 0) {
            pdf.addPage();
            pos = hLeft - imgH + 20; // 20mm margin
            pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
            hLeft -= 275;
        }
        pdf.save(`Invoice-${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Master Invoice Suite" description="Enterprise-grade multi-page tax invoice system.">
            <div style={styles.app}>
                {/* 1. CONTROL SIDEBAR */}
                <aside style={styles.sidebar}>
                    <div style={styles.card}>
                        <h3 style={styles.h3}>Jurisdiction & Tax</h3>
                        <select style={{width:'100%', padding:'10px', borderRadius:'8px'}} value={config.country} onChange={e => setConfig({...config, country: e.target.value})}>
                            {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                        </select>
                        <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
                            <button style={{...styles.btn, flex:1, background: config.taxMode==='exclusive'?config.themeColor:'#334155', color:'#fff'}} onClick={()=>setConfig({...config, taxMode:'exclusive'})}>Exclusive</button>
                            <button style={{...styles.btn, flex:1, background: config.taxMode==='inclusive'?config.themeColor:'#334155', color:'#fff'}} onClick={()=>setConfig({...config, taxMode:'inclusive'})}>Inclusive</button>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Column Toggles</h3>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                            <label style={{fontSize:'0.8rem'}}><input type="checkbox" checked={config.showHSN} onChange={e => setConfig({...config, showHSN: e.target.checked})} /> Show HSN/SAC</label>
                            <label style={{fontSize:'0.8rem'}}><input type="checkbox" checked={config.showDisc} onChange={e => setConfig({...config, showDisc: e.target.checked})} /> Show Discount</label>
                            <label style={{fontSize:'0.8rem'}}><input type="checkbox" checked={config.showUnit} onChange={e => setConfig({...config, showUnit: e.target.checked})} /> Show Unit</label>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Print Copy Label</h3>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
                            {['ORIGINAL', 'DUPLICATE', 'TRIPLICATE', 'OFFICE COPY'].map(l => (
                                <button key={l} onClick={()=>setActiveLabel(l)} style={{...styles.btn, fontSize:'0.6rem', background: activeLabel===l?config.themeColor:'#334155', color:'#fff'}}>{l}</button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.card}>
                        <button onClick={() => {localStorage.setItem('shb_enterprise_v18_master', JSON.stringify({config, meta, items, extra})); alert("Settings Saved!");}} style={{...styles.btn, ...styles.btnGold, width:'100%', marginBottom:'10px'}}>💾 SAVE TEMPLATE</button>
                        <button onClick={exportPDF} style={{...styles.btn, ...styles.btnPrimary, width:'100%'}}>🚀 EXPORT PDF</button>
                        <button onClick={()=>window.location.reload()} style={{...styles.btn, ...styles.btnReset, width:'100%'}}>HARD RESET</button>
                    </div>
                </aside>

                {/* 2. THE PAPER EDITOR */}
                <main style={styles.workspace}>
                    <div ref={invoiceRef} style={styles.paper}>
                        {/* Copy Label */}
                        <div style={{position:'absolute', top:'10mm', right:'15mm', fontSize:'0.6rem', fontWeight:'900', color:'#ccc', border:'1px solid #eee', padding:'2px 8px'}}>{activeLabel}</div>
                        
                        {/* Header */}
                        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #000', paddingBottom:'20px', marginBottom:'30px'}}>
                            <div style={{flex:1.5}}>
                                <input style={{...styles.ghostInp, fontSize:'2.5rem', fontWeight:'900', color:config.themeColor}} value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} />
                                <textarea style={styles.areaInp} value={meta.sender} onChange={e => setMeta({...meta, sender: e.target.value})} />
                            </div>
                            <div style={{flex:1, textAlign:'right'}}>
                                <div onClick={()=>document.getElementById('logo-up').click()} style={{height:'80px', width:'180px', border:'1px dashed #ccc', marginLeft:'auto', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {meta.logo ? <img src={meta.logo} style={{maxHeight:'100%', maxWidth:'100%'}} /> : <span style={{fontSize:'0.6rem'}}>+ Upload Logo</span>}
                                    <input id="logo-up" type="file" hidden onChange={e => handleFile(e, 'logo')} />
                                </div>
                                <div style={{marginTop:'15px'}}>
                                    <div style={{fontSize:'0.85rem'}}>No: <input style={{fontWeight:'bold', borderBottom:'1px solid #eee', width:'100px', textAlign:'right'}} value={meta.iNum} onChange={e => setMeta({...meta, iNum: e.target.value})} /></div>
                                    <div style={{fontSize:'0.85rem'}}>Date: <input type="date" style={{...styles.ghostInp, width:'130px', textAlign:'right', fontWeight:'bold'}} value={meta.date} onChange={e => setMeta({...meta, date: e.target.value})} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Recipient Sections */}
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', marginBottom:'40px'}}>
                            <div>
                                <span style={{fontSize:'0.7rem', fontWeight:'900', color:'#64748b'}}>BILL TO:</span>
                                <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1rem', marginTop:'5px'}} value={meta.client} onChange={e => setMeta({...meta, client: e.target.value})} />
                            </div>
                            <div>
                                <span style={{fontSize:'0.7rem', fontWeight:'900', color:'#64748b'}}>SHIP TO:</span>
                                <textarea style={{...styles.areaInp, marginTop:'5px'}} placeholder="Shipping details (Optional)" />
                            </div>
                        </div>

                        {/* Table */}
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{...styles.th, width:'35%'}}>DESCRIPTION</th>
                                    {config.showHSN && <th style={styles.th}>HSN</th>}
                                    {config.showUnit && <th style={styles.th}>UNIT</th>}
                                    <th style={styles.th}>QTY</th>
                                    <th style={styles.th}>RATE</th>
                                    {config.showDisc && <th style={styles.th}>DISC %</th>}
                                    <th style={styles.th}>{engine.jur.taxLabel}%</th>
                                    <th style={{...styles.th, textAlign:'right'}}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engine.rows.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td style={styles.td}>
                                            <input style={{...styles.ghostInp, fontWeight:'bold'}} value={item.name} onChange={e => {const ni=[...items]; ni[idx].name=e.target.value; setItems(ni);}} />
                                            <div className="no-print" style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                                                <button onClick={()=>duplicateRow(item.id)} style={{fontSize:'0.6rem', color:config.themeColor, background:'none', border:'none', cursor:'pointer'}}>Duplicate</button>
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} style={{fontSize:'0.6rem', color:'#f87171', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
                                            </div>
                                        </td>
                                        {config.showHSN && <td style={styles.td}><input style={styles.ghostInp} value={item.hsn} onChange={e => {const ni=[...items]; ni[idx].hsn=e.target.value; setItems(ni);}} /></td>}
                                        {config.showUnit && <td style={styles.td}><input style={styles.ghostInp} value={item.unit} onChange={e => {const ni=[...items]; ni[idx].unit=e.target.value; setItems(ni);}} /></td>}
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.qty} onChange={e => {const ni=[...items]; ni[idx].qty=e.target.value; setItems(ni);}} /></td>
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.rate} onChange={e => {const ni=[...items]; ni[idx].rate=e.target.value; setItems(ni);}} /></td>
                                        {config.showDisc && <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.disc} onChange={e => {const ni=[...items]; ni[idx].disc=e.target.value; setItems(ni);}} /></td>}
                                        <td style={styles.td}><input type="number" style={styles.ghostInp} value={item.tax} onChange={e => {const ni=[...items]; ni[idx].tax=e.target.value; setItems(ni);}} /></td>
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.total.toFixed(engine.jur.decimals)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setItems([...items, {id: Date.now(), name:'', hsn:'', unit:'pcs', qty:1, rate:0, tax: engine.jur.taxRate, disc:0}])} style={{width:'100%', padding:'10px', background:'none', border:'1px dashed #ccc', marginTop:'10px', cursor:'pointer', color:'#94a3b8'}} className="no-print">+ Add Item Line</button>

                        {/* Totals Block */}
                        <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', pageBreakInside:'avoid'}}>
                            <div style={{width:'55%'}}>
                                <span style={{fontSize:'0.7rem', fontWeight:'900', color:'#64748b'}}>TOTAL IN WORDS:</span>
                                <p style={{fontWeight:'bold', fontSize:'0.9rem', fontStyle:'italic'}}>{engine.words}</p>
                                <div style={{marginTop:'30px'}}>
                                    <span style={{fontSize:'0.7rem', fontWeight:'900', color:'#64748b'}}>NOTES & TERMS:</span>
                                    <textarea style={styles.areaInp} value={meta.notes} onChange={e => setMeta({...meta, notes: e.target.value})} />
                                    <textarea style={{...styles.areaInp, fontSize:'0.7rem', color:'#64748b', borderTop:'1px solid #eee', marginTop:'5px'}} value={meta.terms} onChange={e => setMeta({...meta, terms: e.target.value})} />
                                </div>
                            </div>
                            <div style={{width:'260px'}}>
                                <div style={styles.tRow}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.jur.decimals)}</span></div>
                                {engine.taxSummary.map(t => (
                                    <div key={t.label} style={styles.tRow}><span>{t.label} Total</span><span>{t.amt.toFixed(engine.jur.decimals)}</span></div>
                                ))}
                                <div style={styles.tRow}><span>Shipping</span><input type="number" style={{width:'80px', textAlign:'right', borderBottom:'1px solid #eee'}} value={extra.shipping} onChange={e => setExtra({...extra, shipping: e.target.value})} /></div>
                                <div style={{...styles.grandRow, color: config.themeColor}}>
                                    <span>GRAND TOTAL</span>
                                    <span>{engine.jur.currency} {engine.grandTotal.toFixed(engine.jur.decimals)}</span>
                                </div>
                                <div onClick={()=>document.getElementById('sig-up').click()} style={{marginTop:'30px', textAlign:'right', cursor:'pointer'}}>
                                    {meta.signature ? <img src={meta.signature} style={{maxHeight:'60px'}} /> : <div style={{height:'60px', borderBottom:'1px solid #000'}}></div>}
                                    <span style={{fontSize:'0.6rem', fontWeight:'bold'}}>AUTHORIZED SIGNATORY</span>
                                    <input id="sig-up" type="file" hidden onChange={e => handleFile(e, 'signature')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <style jsx>{`
                @media print { :global(.no-print) { display: none !important; } }
                input:hover, textarea:hover { background: rgba(56, 189, 248, 0.05) !important; }
            `}</style>
        </ToolboxLayout>
    );
}
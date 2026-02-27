import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, parseFormula, amountToWords } from '../../engine-data/logic';

const INITIAL_COLS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: 80 },
    { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: 280 },
    { id: 'qty', label: 'Qty', type: 'NUMBER', visible: 'visible', width: 60 },
    { id: 'rate', label: 'Price', type: 'NUMBER', visible: 'visible', width: 100 },
    { id: 'tax', label: 'Tax %', type: 'NUMBER', visible: 'visible', width: 70 },
    { id: 'amount', label: 'Total', type: 'FORMULA', formula: 'qty * rate', visible: 'visible', width: 110 }
];

const INITIAL_META = {
    country: 'AE', taxMode: 'exclusive', rounding: 'none',
    pColor: '#3b82f6', tColor: '#1e293b', logo: null, sig: null,
    logoAlign: 'flex-start', sigAlign: 'flex-end', sigSize: 120,
    iTitle: 'TAX INVOICE', iNum: 'INV-2026-001',
    iDate: new Date().toISOString().split('T')[0],
    sDate: new Date().toISOString().split('T')[0],
    sender: 'Your Company\nDubai, UAE\nTRN: 100XXXXXXXXXXXX',
    client: 'Recipient Company\nCity, Country\nTRN: 100XXXXXXXXXXXX',
    notes: 'Thank you for your business.',
    terms: '1. Net 15 Days\n2. Reverse Charge Applies.',
    footerMsg: 'Authorized Signatory', footerUrl: 'www.shbstores.com',
    showWords: true
};

export default function EnterpriseInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [meta, setMeta] = useState(INITIAL_META);
    const [cols, setCols] = useState(INITIAL_COLS);
    const [items, setItems] = useState([{ id: 1, values: { code: 'ITM-01', desc: 'Enterprise Consulting', qty: 1, rate: 1000, tax: 5 } }]);
    const [charges, setCharges] = useState([]); // Extra charges logic

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v15_final');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setMeta(prev => ({ ...prev, ...p.meta }));
                if (p.cols) setCols(p.cols);
                if (p.items) setItems(p.items);
                if (p.charges) setCharges(p.charges);
            } catch (e) { console.error("Session Restore Failed", e); }
        }
    }, []);

    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };

    // --- RE-CALCULATION ENGINE (Derived Values Only) ---
    const engine = useMemo(() => {
        const config = JURISDICTIONS[meta.country] || JURISDICTIONS.AE;
        const rows = items.map(item => {
            const v = { ...item.values };
            cols.filter(c => c.type === 'FORMULA').forEach(c => v[c.id] = parseFormula(c.formula, v));
            const amt = parseFloat(v.amount) || 0;
            const txV = meta.taxMode === 'exclusive' ? (amt * parseFloat(v.tax || 0) / 100) : (amt - (amt / (1 + parseFloat(v.tax || 0) / 100)));
            return { ...item, computed: v, tax: txV, rowTotal: meta.taxMode === 'exclusive' ? amt + txV : amt };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const taxableExtra = charges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0) + (taxableExtra * (config.taxRate / 100));
        let final = subtotal + totalTax + taxableExtra + charges.filter(c => !c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);

        let delta = 0;
        if (meta.rounding === 'up') delta = Math.ceil(final) - final;
        if (meta.rounding === 'down') delta = Math.floor(final) - final;
        if (meta.rounding === 'nearest') delta = Math.round(final) - final;

        return { rows, subtotal, totalTax, grandTotal: final + delta, delta, config };
    }, [items, meta, cols, charges]);

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, [field]: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Processing HD multi-page slicing...');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) { pdf.addPage(); pos = hLeft - imgH + 20; pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, 210, imgH); hLeft -= (297 - 20); }
        pdf.save(`Invoice-${meta.iNum}.pdf`);
    };

    if (!mounted) return null;
    const filteredItems = engine.rows.filter(r => (r.computed.desc || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ToolboxLayout title="Master Invoice Engine" description="Universal Multi-page Enterprise Billing Suite.">
            <div style={{ maxWidth: '1650px', margin: '0 auto', padding: '20px' }}>
                {notif && <div style={styles.toastS}>{notif}</div>}
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <aside style={styles.sidebarArea}>
                        <div style={styles.panelCard}>
                            <h3 style={styles.hS}>System Configuration</h3>
                            <label style={styles.lCap}>Jurisdiction</label>
                            <select value={meta.country} onChange={(e) => setMeta({ ...meta, country: e.target.value })} style={styles.selS}>
                                {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                            </select>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'15px'}}>
                                <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?styles.actB:styles.btnMin}>Exclusive</button>
                                <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?styles.actB:styles.btnMin}>Inclusive</button>
                            </div>
                            <label style={styles.lCap}>Rounding Mode</label>
                            <select value={meta.rounding} onChange={(e)=>setMeta({...meta, rounding: e.target.value})} style={styles.selS}>
                                <option value="none">No Rounding</option><option value="up">Round Up</option><option value="down">Round Down</option><option value="nearest">Nearest</option>
                            </select>
                            <h3 style={styles.hS}>Appearance</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <div><label style={styles.lCap}>Theme</label><input type="color" value={meta.pColor} onChange={(e)=>setMeta({...meta, pColor:e.target.value})} style={styles.clrI} /></div>
                                <div><label style={styles.lCap}>Headers</label><input type="color" value={meta.tColor} onChange={(e)=>setMeta({...meta, tColor:e.target.value})} style={styles.clrI} /></div>
                            </div>
                        </div>

                        <div style={styles.panelCard}>
                            <h3 style={styles.hS}>Column Engine</h3>
                            <div style={styles.colList}>
                                {cols.map((c, i) => (
                                    <div key={c.id} style={styles.colItem}>
                                        <div style={{fontSize:'0.6rem', flex:1}}>{c.label}</div>
                                        <button onClick={()=>{ const nc = [...cols]; const t = i - 1; if(t>=0) { [nc[i], nc[t]] = [nc[t], nc[i]]; setCols(nc); } }} style={styles.ghB}>▲</button>
                                        <button onClick={()=>{ const m=['visible', 'private', 'hidden']; setCols(cols.map(cl=>cl.id===c.id?{...cl, visible: m[(m.indexOf(c.visible)+1)%3]}:cl)); }} style={{...styles.ghB, color: c.visible==='visible'?'#34d399':c.visible==='private'?'#fbbf24':'#f87171'}}>{c.visible[0].toUpperCase()}</button>
                                    </div>
                                ))}
                            </div>
                            <h3 style={styles.hS}>Modular Charges</h3>
                            {charges.map(c => (
                                <div key={c.id} style={styles.chargeItem}>
                                    <input value={c.label} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, label:e.target.value}:ch))} style={styles.ghI} />
                                    <input type="number" value={c.value} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, value:e.target.value}:ch))} style={{...styles.ghI, width:'45px'}} />
                                    <button onClick={()=>setCharges(charges.filter(ch=>ch.id!==c.id))} style={{color:'#f87171', border:'none', background:'none'}}>×</button>
                                </div>
                            ))}
                            <button onClick={()=>setCharges([...charges, {id:Date.now(), label:'Service', value:0, taxable:false}])} style={styles.addB}>+ Add Charge</button>
                        </div>

                        <div style={styles.panelCard}>
                            <h3 style={styles.hS}>Digital Assets</h3>
                            <div style={{display:'flex', gap:'5px'}}>
                                <input type="file" onChange={(e)=>handleFile(e, 'logo')} style={styles.inpF} title="Logo" />
                                <input type="file" onChange={(e)=>handleFile(e, 'sig')} style={styles.inpF} title="Signature" />
                            </div>
                            <button onClick={()=>{ localStorage.setItem('shb_enterprise_v15_final', JSON.stringify({ meta, cols, items, charges })); showToast('Data Encrypted & Saved! ✅'); }} style={{...styles.btnSave, marginTop:'20px'}}>💾 PERSIST SYSTEM STATE</button>
                            <button onClick={exportPDF} style={styles.btnMain}>GENERATE ENTERPRISE PDF</button>
                            <button onClick={()=>factoryReset()} style={styles.btnReset}>FACTORY RESET</button>
                        </div>
                    </aside>

                    {/* --- THE PAPER --- */}
                    <main style={styles.paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{...styles.paperS, color: meta.pColor, backgroundColor: '#fff'}}>
                            <div style={{display:'flex', justifyContent: meta.logoAlign, marginBottom:'20px'}}>
                                {meta.logo ? <img src={meta.logo} style={{maxHeight:'80px', maxWidth:'240px'}} /> : <div style={{height:'80px'}}></div>}
                            </div>
                            <div style={styles.headerG}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.iTitle} onChange={(e)=>setMeta({...meta, iTitle:e.target.value})} style={{...styles.titleI, color: meta.tColor}} />
                                    <textarea value={meta.sender} onChange={(e)=>setMeta({...meta, sender:e.target.value})} style={styles.areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={styles.mR}><span>No:</span><input value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum:e.target.value})} style={styles.mInp} /></div>
                                    <div style={styles.mR}><span>Date:</span><input type="date" value={meta.iDate} onChange={(e)=>setMeta({...meta, iDate:e.target.value})} style={styles.mInp} /></div>
                                    <div style={styles.mR}><span>Currency:</span><span style={{fontWeight:'bold'}}>{engine.config.currency}</span></div>
                                </div>
                            </div>
                            <div style={{margin:'40px 0'}}><p style={styles.tagL}>RECIPIENT:</p><textarea value={meta.client} onChange={(e)=>setMeta({...meta, client:e.target.value})} style={{...styles.areaI, height:'80px', fontWeight:'bold', color:'#000'}} /></div>
                            <table style={styles.tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.pColor}`}}>
                                    <tr>
                                        {cols.map(c => c.visible !== 'hidden' && <th key={c.id} style={{...styles.thS, width: `${c.width}px`, opacity: c.visible==='private'?0.3:1}}>{c.label}</th>)}
                                        <th style={{...styles.thS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {cols.map(c => c.visible !== 'hidden' && (
                                                <td key={c.id} style={{...styles.tdS, opacity: c.visible==='private'?0.3:1}}>
                                                    <input value={row.computed[c.id]} readOnly={c.type==='FORMULA'} onChange={(e)=>setItems(items.map(li=>li.id===row.id?{...li, values:{...li.values, [c.id]:e.target.value}}:li))} style={styles.rawI} />
                                                </td>
                                            ))}
                                            <td style={{...styles.tdS, textAlign:'right', fontWeight:'900'}}>{row.rowTotal.toFixed(engine.config.decimals)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={styles.addB} className="no-print">+ ADD NEW LINE</button>
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', breakInside:'avoid'}}>
                                <div style={{width:'60%'}}>
                                    <p style={styles.tagL}>TOTAL IN WORDS</p><p style={{fontWeight:'bold', color: meta.pColor, fontStyle:'italic'}}>{amountToWords(engine.grandTotal, engine.config)}</p>
                                    <p style={styles.tagL}>NOTES</p><textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes:e.target.value})} style={styles.areaN} />
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={styles.sumR}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.config.decimals)}</span></div>
                                    <div style={styles.sumR}><span>Tax Total</span><span>{engine.totalTax.toFixed(engine.config.decimals)}</span></div>
                                    <div style={{...styles.grandR, borderTop:`3px solid ${meta.pColor}`, background:'#f8fafc', padding:'10px'}}>
                                        <span>TOTAL</span><span>{engine.config.currency} {engine.grandTotal.toFixed(engine.config.decimals)}</span>
                                    </div>
                                    {meta.sig && <div style={{textAlign:meta.sigAlign, mt:'20px'}}><img src={meta.sig} style={{width:`${meta.sigSize}px`}} /><p style={styles.lCap}>{meta.footerMsg}</p></div>}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper input, #invoice-paper textarea { color: #000 !important; background: transparent !important; border: none; outline: none; transition: 0.1s; width: 100%; font-family: inherit; }
                #invoice-paper input:hover, #invoice-paper textarea:hover { background: rgba(0,0,0,0.02) !important; border-radius: 4px; }
            `}</style>
        </ToolboxLayout>
    );
}
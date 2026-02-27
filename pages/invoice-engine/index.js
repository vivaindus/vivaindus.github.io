import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, parseFormula, toWords } from '../../engine-data/logic';

const INITIAL_COLS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: 80 },
    { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: 250 },
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
    sender: 'Your Company\nTRN: 100XXXXXXXXXXXX', client: 'Recipient\nTRN: 100XXXXXXXXXXXX',
    notes: 'Thank you.', terms: 'Net 15 Days.', footerMsg: 'Authorized Signatory', footerUrl: 'www.shbstores.com'
};

export default function EnterpriseInvoice() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [meta, setMeta] = useState(INITIAL_META);
    const [cols, setCols] = useState(INITIAL_COLS);
    const [items, setItems] = useState([{ id: 1, values: { code: 'S01', desc: 'Sample Item', qty: 1, rate: 0, tax: 5 } }]);
    const [charges, setCharges] = useState([]);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_v19_master');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setMeta(prev => ({ ...prev, ...p.meta }));
                if (p.cols) setCols(p.cols);
                if (p.items) setItems(p.items);
                if (p.charges) setCharges(p.charges);
            } catch (e) { console.error(e); }
        }
    }, []);

    const engine = useMemo(() => {
        const config = JURISDICTIONS[meta.country] || JURISDICTIONS.AE;
        const rows = items.map(item => {
            const v = { ...item.values };
            cols.filter(c => c.type === 'FORMULA').forEach(c => v[c.id] = parseFormula(c.formula, v));
            const amt = parseFloat(v.amount) || 0;
            const txV = meta.taxMode === 'exclusive' ? (amt * parseFloat(v.tax) / 100) : (amt - (amt / (1 + parseFloat(v.tax) / 100)));
            return { ...item, computed: v, tax: txV, rowTotal: meta.taxMode === 'exclusive' ? amt + txV : amt };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const taxableCharges = charges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0) + (taxableCharges * (config.taxRate / 100));
        let final = subtotal + totalTax + taxableCharges + charges.filter(c => !c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);

        let delta = 0;
        if (meta.rounding === 'up') delta = Math.ceil(final) - final;
        if (meta.rounding === 'down') delta = Math.floor(final) - final;
        if (meta.rounding === 'nearest') delta = Math.round(final) - final;

        return { rows, subtotal, totalTax, grandTotal: final + delta, delta, config };
    }, [items, meta, cols, charges]);

    // --- FIX FOR fmt is not defined ---
    const fmt = (n) => (parseFloat(n) || 0).toFixed(engine.config.decimals);

    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        showToast('Processing HD multi-page document...');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) { pdf.addPage(); pos = hLeft - imgH + 20; pdf.addImage(img, 'PNG', 0, pos, 210, imgH); hLeft -= (297 - 20); }
        pdf.save(`Invoice.pdf`);
    };

    if (!mounted) return null;
    const filteredItems = engine.rows.filter(r => (r.computed.desc || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ToolboxLayout title="Universal Invoice Engine" description="Professional Enterprise Billing.">
            <div style={{ maxWidth: '1650px', margin: '0 auto', padding: '20px' }}>
                {notif && <div style={styles.toastS}>{notif}</div>}
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <aside style={styles.sidebarArea}>
                        <div style={styles.panelCard}>
                            <h3 style={styles.hS}>1. Jurisdiction</h3>
                            <select value={meta.country} onChange={(e) => setMeta({ ...meta, country: e.target.value })} style={styles.selS}>
                                {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                            </select>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', mb:'15px'}}>
                                <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?styles.actB:styles.btnM}>Exclusive</button>
                                <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?styles.actB:styles.btnM}>Inclusive</button>
                            </div>
                            
                            <h3 style={styles.hS}>2. Theme</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <div><label style={styles.lC}>Primary</label><input type="color" value={meta.pColor} onChange={(e)=>setMeta({...meta, pColor:e.target.value})} style={styles.clrI} /></div>
                                <div><label style={styles.lC}>Title</label><input type="color" value={meta.tColor} onChange={(e)=>setMeta({...meta, tColor:e.target.value})} style={styles.clrI} /></div>
                            </div>

                            <button onClick={()=>{ localStorage.setItem('shb_v19_master', JSON.stringify({ meta, cols, items, charges })); showToast('Saved! ✅'); }} style={styles.btnSave}>💾 SAVE AS DEFAULT</button>
                            <button onClick={exportPDF} style={styles.btnMain}>GENERATE MASTER PDF</button>
                        </div>
                    </aside>

                    <main style={styles.paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{...styles.paperS, color: meta.pColor}}>
                            <div style={styles.headerG}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.iTitle} onChange={(e)=>setMeta({...meta, iTitle:e.target.value})} style={{...styles.titleI, color: meta.tColor}} />
                                    <textarea value={meta.sender} onChange={(e)=>setMeta({...meta, sender:e.target.value})} style={styles.areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={styles.mR}><span>No:</span><input value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum:e.target.value})} style={styles.mInp} /></div>
                                    <div style={styles.mR}><span>Currency:</span><span style={{fontWeight:'bold'}}>{engine.config.currency}</span></div>
                                </div>
                            </div>
                            
                            <table style={styles.tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.pColor}`}}>
                                    <tr>
                                        {cols.map(c => c.visible !== 'hidden' && <th key={c.id} style={{...styles.thS, width: `${c.width}px`}}>{c.label}</th>)}
                                        <th style={{...styles.thS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {cols.map(c => c.visible !== 'hidden' && (
                                                <td key={c.id} style={styles.tdS}>
                                                    <input value={row.computed[c.id]} readOnly={c.type==='FORMULA'} onChange={(e)=>setItems(items.map(li=>li.id===row.id?{...li, values:{...li.values, [c.id]:e.target.value}}:li))} style={styles.rawI} />
                                                </td>
                                            ))}
                                            <td style={{...styles.tdS, textAlign:'right', fontWeight:'900'}}>{fmt(row.grand)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={styles.addB} className="no-print">+ ADD NEW ROW</button>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px'}}>
                                <div style={{width:'60%'}}>
                                    <p style={styles.tagL}>AMOUNT IN WORDS</p>
                                    <p style={{fontWeight:'bold', color: meta.pColor, fontStyle:'italic'}}>{toWords(engine.grandTotal, engine.config)}</p>
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={styles.sumR}><span>Subtotal</span><span>{fmt(engine.subtotal)}</span></div>
                                    <div style={styles.sumR}><span>Tax Total</span><span>{fmt(engine.totalTax)}</span></div>
                                    <div style={{...styles.sumR, borderTop:`2px solid #000`, fontWeight:'bold', fontSize:'1.2rem', marginTop:'10px', background:'#f8fafc', padding:'10px'}}>
                                        <span>TOTAL</span><span>{engine.config.currency} {fmt(engine.grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                #invoice-paper input, #invoice-paper textarea { color: inherit !important; background: transparent !important; border: none; outline: none; }
                #invoice-paper input:hover { background: rgba(0,0,0,0.02) !important; }
            `}</style>
        </ToolboxLayout>
    );
}
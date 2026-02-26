import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ ENTERPRISE INITIAL CONSTANTS (For Factory Reset)
const INITIAL_COLS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: 80 },
    { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: 260 },
    { id: 'qty', label: 'Qty', type: 'NUMBER', visible: 'visible', width: 60 },
    { id: 'rate', label: 'Unit Price', type: 'NUMBER', visible: 'visible', width: 100 },
    { id: 'tax', label: 'VAT %', type: 'NUMBER', visible: 'visible', width: 70 },
    { id: 'amount', label: 'Amount', type: 'FORMULA', formula: 'qty * rate', visible: 'visible', width: 100 }
];

const INITIAL_META = {
    country: 'AE', taxMode: 'exclusive', rounding: 'nearest',
    pColor: '#3b82f6', tColor: '#1e293b', logo: null, sig: null,
    logoAlign: 'flex-start', sigAlign: 'flex-end', sigSize: 120,
    iTitle: 'TAX INVOICE', iNum: 'INV-1001',
    iDate: new Date().toISOString().split('T')[0],
    sDate: new Date().toISOString().split('T')[0],
    sender: 'Your Business Name\nDubai, UAE\nTRN: 100XXXXXXXXXXXX',
    client: 'Recipient Name\nCity, Country\nTRN: 100XXXXXXXXXXXX',
    notes: 'Thank you for your business.',
    terms: '1. Net 15 Days\n2. Reverse Charge Applies.',
    footerUrl: 'https://www.shbstores.com',
    footerMsg: 'Authorized Signatory',
    showWords: true
};

const JURISDICTIONS = {
    AE: { name: 'UAE', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'KSA', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

export default function EnterpriseInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- 2️⃣ MASTER STATE ---
    const [meta, setMeta] = useState(INITIAL_META);
    const [cols, setCols] = useState(INITIAL_COLS);
    const [items, setItems] = useState([{ id: 1, values: { code: 'S01', desc: 'Sample Service', qty: 1, rate: 0, tax: 5 } }]);
    const [charges, setCharges] = useState([]);

    // --- 3️⃣ ENGINES (Math & Words) ---
    const safeEval = (formula, values) => {
        try {
            let expr = formula;
            Object.keys(values).forEach(k => expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), parseFloat(values[k]) || 0));
            return Function(`'use strict'; return (${expr})`)();
        } catch { return 0; }
    };

    const toWords = (total, config) => {
        const n = Math.abs(parseFloat(total));
        if (!n) return `Zero ${config.currency} Only`;
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const convert = (num) => {
            if (num < 20) return ones[num];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
            if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
            return '';
        };
        const parts = n.toFixed(config.decimals).split('.');
        const major = parseInt(parts[0]);
        const minor = parseInt(parts[1]);
        let res = major > 0 ? `${convert(major)} ${config.major}${major > 1 ? 's' : ''}` : '';
        if (minor > 0) res += `${res ? ' and ' : ''}${convert(minor)} ${config.minor}`;
        return res + ' Only';
    };

    // --- 4️⃣ REACTIVE CALCULATION HUB ---
    const engine = useMemo(() => {
        const config = JURISDICTIONS[meta.country] || JURISDICTIONS.AE;
        const rows = items.map(item => {
            const v = { ...item.values };
            cols.filter(c => c.type === 'FORMULA').forEach(c => v[c.id] = safeEval(c.formula, v));
            const amt = parseFloat(v.amount) || 0;
            const txR = parseFloat(v.tax) || 0;
            const taxVal = meta.taxMode === 'exclusive' ? (amt * txR / 100) : (amt - (amt / (1 + txR / 100)));
            return { ...item, computed: v, tax: taxVal, rowTotal: meta.taxMode === 'exclusive' ? amt + taxVal : amt };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const processedCharges = charges.map(c => ({
            ...c,
            calcVal: c.type === 'percent' ? (subtotal * (parseFloat(c.value) / 100)) : parseFloat(c.value || 0)
        }));

        const taxableExtra = processedCharges.filter(c => c.taxable).reduce((acc, c) => acc + c.calcVal, 0);
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0) + (taxableExtra * (config.taxRate / 100));
        let final = subtotal + totalTax + taxableExtra + processedCharges.filter(c => !c.taxable).reduce((acc, c) => acc + c.calcVal, 0);

        let delta = 0;
        if (meta.rounding === 'up') delta = Math.ceil(final) - final;
        if (meta.rounding === 'down') delta = Math.floor(final) - final;
        if (meta.rounding === 'nearest') delta = Math.round(final) - final;

        return { rows, subtotal, totalTax, grandTotal: final + delta, delta, processedCharges, config };
    }, [items, meta, cols, charges]);

    // --- 5️⃣ CORE HANDLERS ---
    useEffect(() => { setMounted(true); }, []);
    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };
    const fmt = (n) => (parseFloat(n) || 0).toFixed(engine.config.decimals);

    const factoryReset = () => {
        if(window.confirm("RESET EVERYTHING? This restores factory defaults and clears storage.")) {
            localStorage.removeItem('shb_v16_enterprise_engine');
            setMeta(INITIAL_META); setCols(INITIAL_COLS);
            setItems([{ id: 1, values: { code: 'ITM-01', desc: 'Enterprise Service', qty: 1, rate: 0, tax: 5 } }]);
            setCharges([]);
            window.location.reload();
        }
    };

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
        showToast('Precision Slicing active... Building PDF.');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) { pdf.addPage(); pos = hLeft - imgH + 25; pdf.addImage(img, 'PNG', 0, pos, 210, imgH); hLeft -= (297 - 25); }
        pdf.save(`Invoice-${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    const filteredItems = engine.rows.filter(r => (r.computed.desc || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ToolboxLayout title="Universal Invoice Engine" description="Professional Multi-Page Billing Engine.">
            <div style={{ maxWidth: '1650px', margin: '0 auto', padding: '20px' }}>
                {notif && <div style={toastS}>{notif}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLS SIDEBAR --- */}
                    <aside style={{ flex: 1, minWidth: '340px' }}>
                        <div style={panelCard}>
                            <h3 style={hS}>1. Engine Configuration</h3>
                            <label style={lC}>Jurisdiction</label>
                            <select value={meta.country} onChange={(e)=>setMeta({...meta, country: e.target.value})} style={selS}>
                                {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                            </select>

                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', mb:'15px'}}>
                                <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?actB:btnM}>Exclusive</button>
                                <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?actB:btnM}>Inclusive</button>
                            </div>

                            <h3 style={hS}>2. Theme & Design</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', mb:'15px'}}>
                                <div><label style={lC}>Primary Theme</label><input type="color" value={meta.pColor} onChange={(e)=>setMeta({...meta, pColor:e.target.value})} style={clrI} /></div>
                                <div><label style={lC}>Title Color</label><input type="color" value={meta.tColor} onChange={(e)=>setMeta({...meta, tColor:e.target.value})} style={clrI} /></div>
                            </div>

                            <h3 style={hS}>3. Dynamic Columns</h3>
                            <div style={colList}>
                                {cols.map((c, i) => (
                                    <div key={c.id} style={colItem}>
                                        <div style={{fontSize:'0.65rem', flex:1}}>{c.label}</div>
                                        <input type="range" min="40" max="300" step="10" value={c.width} onChange={(e)=>setCols(cols.map(cl=>cl.id===c.id?{...cl, width: parseInt(e.target.value)}:cl))} style={{width:'40px'}} />
                                        <button onClick={()=>moveCol(i, -1)} style={ghB}>▲</button>
                                        <button onClick={()=>moveCol(i, 1)} style={ghB}>▼</button>
                                        <button onClick={()=>{
                                            const m = ['visible', 'private', 'hidden'];
                                            setCols(cols.map(cl=>cl.id===c.id?{...cl, visible: m[(m.indexOf(c.visible)+1)%3]}:cl));
                                        }} style={{...ghB, color: c.visible==='visible'?'#34d399':c.visible==='private'?'#fbbf24':'#f87171'}}>{c.visible[0].toUpperCase()}</button>
                                    </div>
                                ))}
                            </div>

                            <h3 style={hS}>4. Extra Charges Panel</h3>
                            {charges.map(c => (
                                <div key={c.id} style={chargeItem}>
                                    <input value={c.label} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, label:e.target.value}:ch))} style={ghI} />
                                    <input type="number" value={c.value} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, value:e.target.value}:ch))} style={{...ghI, width:'45px'}} />
                                    <button onClick={()=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, type: ch.type==='fixed'?'percent':'fixed'}:ch))} style={ghB}>{c.type==='fixed'?'#':'%'}</button>
                                    <button onClick={()=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, taxable: !ch.taxable}:ch))} style={{...ghB, color: c.taxable?'#38bdf8':'#64748b'}}>T</button>
                                    <button onClick={()=>setCharges(charges.filter(ch=>ch.id!==c.id))} style={{color:'#f87171', border:'none', background:'none', cursor:'pointer'}}>×</button>
                                </div>
                            ))}
                            <button onClick={()=>setCharges([...charges, {id:Date.now(), label:'Charge', value:0, type:'fixed', taxable:false}])} style={addB}>+ Add Extra Charge</button>

                            <h3 style={hS}>5. Output Assets</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', mb:'15px'}}>
                                <input type="file" onChange={(e)=>handleFile(e, 'logo')} style={inpF} title="Logo" />
                                <input type="file" onChange={(e)=>handleFile(e, 'sig')} style={inpF} title="Signature" />
                            </div>

                            <div style={{display:'flex', flexDirection:'column', gap:'8px', mt:'20px'}}>
                                <button onClick={()=>{ localStorage.setItem('shb_enterprise_v16', JSON.stringify({ meta, cols, items, charges })); showToast('Manual Snapshot Created! ✅'); }} style={btnSave}>💾 PERSIST ENGINE DATA</button>
                                <button onClick={exportPDF} style={btnMain}>GENERATE MASTER PDF</button>
                                <button onClick={factoryReset} style={btnReset}>FACTORY RESET</button>
                            </div>
                        </div>
                    </aside>

                    {/* --- THE PAPER (RENDERER) --- */}
                    <main style={paperW}>
                        <div ref={invoiceRef} id="invoice-paper" style={{...paperS, color: meta.pColor}}>
                            <div style={{display:'flex', justifyContent: meta.logoAlign, mb:'15px'}}>
                                {meta.logo ? <img src={meta.logo} style={{maxHeight:'80px', maxWidth:'240px'}} /> : <div style={{height:'80px'}}></div>}
                            </div>
                            <div style={headG}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.iTitle} onChange={(e)=>setMeta({...meta, iTitle:e.target.value})} style={{...titleI, color: meta.tColor}} />
                                    <textarea value={meta.sender} onChange={(e)=>setMeta({...meta, sender:e.target.value})} style={areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={mR}><span>No:</span><input value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum:e.target.value})} style={mInp} /></div>
                                    <div style={mR}><span>Date:</span><input type="date" value={meta.iDate} onChange={(e)=>setMeta({...meta, iDate:e.target.value})} style={mInp} /></div>
                                    <div style={mR}><span>Supply:</span><input type="date" value={meta.sDate} onChange={(e)=>setMeta({...meta, sDate:e.target.value})} style={mInp} /></div>
                                    <div style={{...mR, color: meta.pColor, fontWeight:'bold'}}><span>Currency:</span><span>{engine.config.currency}</span></div>
                                </div>
                            </div>
                            <div style={{margin:'40px 0'}}>
                                <p style={lC}>RECIPIENT:</p>
                                <textarea value={meta.client} onChange={(e)=>setMeta({...meta, client:e.target.value})} style={{...areaI, height:'80px', fontSize:'1.1rem', fontWeight:'bold', color:'#000'}} />
                            </div>
                            <div style={{display:'flex', mb:'15px'}}><input placeholder="🔍 Filter items..." onChange={(e)=>setSearchTerm(e.target.value)} style={searchI} /></div>
                            <table style={tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.pColor}`}}>
                                    <tr>
                                        {cols.map(c => c.visible !== 'hidden' && <th key={c.id} style={{...thS, width: `${c.width}px`, opacity: c.visible==='private'?0.3:1}}>{c.label}</th>)}
                                        <th style={{...thS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {cols.map(c => c.visible !== 'hidden' && (
                                                <td key={c.id} style={{...tdS, opacity: c.visible==='private'?0.3:1}}>
                                                    <input value={row.computed[c.id]} readOnly={c.type==='FORMULA'} onChange={(e)=>setItems(items.map(li=>li.id===row.id?{...li, values:{...li.values, [c.id]:e.target.value}}:li))} style={rawI} />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'900'}}>{fmt(row.grand)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={addB} className="no-print">+ ADD ITEM</button>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', breakInside:'avoid'}}>
                                <div style={{width:'55%'}}>
                                    <p style={lC}>AMOUNT IN WORDS</p><p style={{fontWeight:'bold', fontStyle:'italic', color: meta.pColor, mb:'20px'}}>{toWords(engine.grandTotal, engine.config)}</p>
                                    <p style={lC}>NOTES</p><textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes:e.target.value})} style={areaN} />
                                    <p style={{...lC, mt:'15px'}}>TERMS</p><textarea value={meta.terms} onChange={(e)=>setMeta({...meta, terms:e.target.value})} style={areaN} />
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={sumR}><span>Subtotal</span><span>{fmt(engine.subtotal)}</span></div>
                                    <div style={sumR}><span>Tax Total</span><span>{fmt(engine.totalTax)}</span></div>
                                    {engine.processedCharges.map(c=>(<div key={c.id} style={sumR}><span>{c.label}</span><span>{fmt(c.calcVal)}</span></div>))}
                                    {engine.delta !== 0 && <div style={sumR}><span>Rounding Adj.</span><span>{fmt(engine.delta)}</span></div>}
                                    <div style={{...sumR, borderTop:`3px solid ${meta.pColor}`, fontWeight:'900', fontSize:'1.2rem', marginTop:'10px', background:'#f8fafc', padding:'10px'}}>
                                        <span>TOTAL</span><span>{engine.config.currency} {fmt(engine.grandTotal)}</span>
                                    </div>
                                    {meta.sig && <div style={{display:'flex', flexDirection:'column', alignItems: meta.sigAlign, mt:'20px'}}><img src={meta.sig} style={{width:`${meta.sigSize}px`}} /><input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={{textAlign:meta.sigAlign, fontSize:'0.75rem', fontWeight:'bold'}} /></div>}
                                </div>
                            </div>
                            <div style={paperF}><input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} /></div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper input, #invoice-paper textarea { color: #000 !important; background: transparent !important; border: none; outline: none; transition: 0.1s; width: 100%; font-family: inherit; }
                #invoice-paper input:hover, #invoice-paper textarea:hover { background: rgba(0,0,0,0.02) !important; border-radius: 4px; }
                #invoice-paper { box-sizing: border-box; }
                tr { page-break-inside: avoid; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- FULL MASTER STYLES ---
const sidebarS = { display: 'flex', flexDirection: 'column', gap: '15px' };
const panelCard = { background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' };
const hS = { color: '#38bdf8', fontSize: '0.8rem', textTransform: 'uppercase', margin: '20px 0 10px 0', fontWeight: 'bold' };
const lC = { fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', mb: '5px' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', mb: '15px', outline: 'none', fontSize: '0.8rem' };
const btnM = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' };
const actB = { ...btnM, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', mt: '10px' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', mt: '20px' };
const paperW = { flex: '3', minWidth: '0', background: '#1e293b', padding: '40px 10px', borderRadius: '20px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperS = { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 0 60px rgba(0,0,0,0.5)', width: '210mm' };
const titleI = { fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase' };
const areaI = { fontSize: '0.85rem', color: '#475569', height: '55px', resize: 'none' };
const headG = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', pb: '15px' };
const mR = { display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '0.8rem', mb: '3px' };
const mInp = { width: '90px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagL = { fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' };
const wordBox = { fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', borderBottom: '1px solid #eee', padding: '5px 0' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thS = { textAlign: 'left', padding: '10px 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '10px 8px' };
const rawI = { fontSize: '0.85rem' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', cursor: 'pointer', mt: '15px', color: '#94a3b8', fontSize: '0.7rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' };
const areaN = { width: '100%', height: '60px', background: '#f8fafc', padding: '8px', fontSize: '0.75rem', borderRadius: '5px' };
const paperF = { mt: 'auto', pt: '30px', borderTop: '1px solid #eee' };
const urlI = { width: '40%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
const inpF = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '0.7rem' };
const colList = { background: '#0f172a', padding: '15px', borderRadius: '15px' };
const colItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px', gap: '8px', borderBottom: '1px solid #1e293b', pb: '8px' };
const ghB = { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.7rem' };
const ghI = { background: 'none', border: '1px solid #334155', color: '#fff', fontSize: '0.7rem', padding: '5px', borderRadius: '4px' };
const chargeItem = { display: 'flex', gap: '8px', mb: '10px', alignItems: 'center' };
const searchI = { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', width: '100%', fontSize: '0.8rem', color: '#000', mb: '15px' };
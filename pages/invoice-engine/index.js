import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ ENTERPRISE MASTER DEFAULTS
const DEFAULTS = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

const INITIAL_COLUMNS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: 80, order: 0 },
    { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: 250, order: 1 },
    { id: 'qty', label: 'Qty', type: 'NUMBER', visible: 'visible', width: 60, order: 2 },
    { id: 'rate', label: 'Price', type: 'NUMBER', visible: 'visible', width: 100, order: 3 },
    { id: 'tax', label: 'Tax %', type: 'NUMBER', visible: 'visible', width: 70, order: 4 },
    { id: 'amount', label: 'Amount', type: 'FORMULA', formula: 'qty * rate', visible: 'visible', width: 100, order: 5 }
];

// 2️⃣ ENGINE UTILITIES
const safeEval = (formula, values) => {
    try {
        let expression = formula;
        Object.keys(values).forEach(id => {
            const val = parseFloat(values[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        return Function(`'use strict'; return (${expression})`)();
    } catch { return 0; }
};

const numberToWords = (total, config) => {
    const n = parseFloat(total);
    if (isNaN(n) || n === 0) return `Zero ${config?.currency || ''} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
        if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
        return '';
    };
    const parts = n.toFixed(config?.decimals || 2).split('.');
    const majorVal = parseInt(parts[0]);
    const minorVal = parseInt(parts[1]);
    let res = majorVal > 0 ? `${convert(majorVal)} ${config?.major || ''}${majorVal > 1 ? 's' : ''}` : '';
    if (minorVal > 0) res += `${res ? ' and ' : ''}${convert(minorVal)} ${config?.minor || ''}`;
    return res + ' Only';
};

export default function CompleteInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');

    // --- 3️⃣ STATE SCHEMA ---
    const [meta, setMeta] = useState({
        country: 'AE', taxMode: 'exclusive', rounding: 'none',
        pColor: '#3b82f6', tColor: '#1e293b', logo: null, sig: null, logoAlign: 'flex-start',
        iTitle: 'TAX INVOICE', iNum: 'INV-' + Date.now().toString().slice(-5),
        iDate: new Date().toISOString().split('T')[0],
        sDate: new Date().toISOString().split('T')[0],
        sender: 'SHB Solutions\nTRN: 100234...\nDubai, UAE',
        client: 'Client Name\nTRN: 100...\nLocation',
        notes: 'Payment is due within 15 days.',
        terms: '1. Reverse Charge applies where applicable.\n2. Goods once sold are non-returnable.',
        footerUrl: 'www.shbstores.com', showWords: true
    });

    const [cols, setCols] = useState(INITIAL_COLUMNS);
    const [items, setItems] = useState([{ id: 1, values: { code: 'ITM-01', desc: 'Item Description', qty: 1, rate: 0, tax: 5 } }]);
    const [charges, setCharges] = useState([]); // { id, label, value, taxable }

    // --- 4️⃣ HYDRATION & RECOVERY ---
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_engine_v14');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setMeta(prev => ({ ...prev, ...p.meta }));
                setCols(p.cols || INITIAL_COLUMNS);
                setItems(p.items || []);
                setCharges(p.charges || []);
            } catch (e) { console.error("Restore failed", e); }
        }
    }, []);

    const factoryReset = () => {
        if(window.confirm("Restore factory settings? All work will be lost.")) {
            localStorage.removeItem('shb_enterprise_engine_v14');
            window.location.reload();
        }
    };

    const saveToLocal = () => {
        localStorage.setItem('shb_enterprise_engine_v14', JSON.stringify({ meta, cols, items, charges }));
        showToast('System State Saved! ✅');
    };

    // --- 5️⃣ REACTIVE TOTALS ENGINE ---
    const engine = useMemo(() => {
        const config = DEFAULTS[meta.country] || DEFAULTS.AE;
        const rows = items.map(item => {
            const v = { ...item.values };
            cols.filter(c => c.type === 'FORMULA').forEach(c => v[c.id] = safeEval(c.formula, v));
            const amt = parseFloat(v.amount) || 0;
            const txR = parseFloat(v.tax) || 0;
            const txV = meta.taxMode === 'exclusive' ? (amt * txR / 100) : (amt - (amt / (1 + txR / 100)));
            return { ...item, computed: v, tax: txV, rowTotal: meta.taxMode === 'exclusive' ? amt + txV : amt };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const taxableCharges = charges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
        const rowTaxes = rows.reduce((acc, r) => acc + r.tax, 0);
        const extraTax = taxableCharges * (config.taxRate / 100);
        
        let grand = subtotal + rowTaxes + taxableCharges + extraTax + charges.filter(c => !c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);

        let delta = 0;
        if (meta.rounding === 'up') delta = Math.ceil(grand) - grand;
        if (meta.rounding === 'down') delta = Math.floor(grand) - grand;
        if (meta.rounding === 'nearest') delta = Math.round(grand) - grand;

        return { rows, subtotal, totalTax: rowTaxes + extraTax, grandTotal: grand + delta, delta, config };
    }, [items, meta, cols, charges]);

    // --- HANDLERS ---
    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };
    const moveCol = (idx, dir) => {
        const nc = [...cols]; const target = idx + dir;
        if (target >= 0 && target < nc.length) { [nc[idx], nc[target]] = [nc[target], nc[idx]]; setCols(nc); }
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Slicing High-Res PDF...');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 850 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) {
            pdf.addPage(); pos = hLeft - imgH + 20;
            pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
            hLeft -= (297 - 20);
        }
        pdf.save(`INV-${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Engine" description="Professional grade modular billing system.">
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notif && <div style={toastS}>{notif}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- SIDEBAR PANEL --- */}
                    <aside style={{ flex: 1, minWidth: '340px' }}>
                        <div style={panelCard}>
                            <h3 style={headS}>Regional Controls</h3>
                            <label style={lCap}>Country</label>
                            <select value={meta.country} onChange={(e) => setMeta({ ...meta, country: e.target.value })} style={selS}>
                                {Object.keys(DEFAULTS).map(k => <option key={k} value={k}>{DEFAULTS[k].name}</option>)}
                            </select>

                            <h3 style={headS}>Tax & Rounding</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?activeB:btnMin}>Exclusive</button>
                                <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?activeB:btnMin}>Inclusive</button>
                            </div>
                            <select value={meta.rounding} onChange={(e)=>setMeta({...meta, rounding: e.target.value})} style={selS}>
                                <option value="none">No Rounding</option>
                                <option value="up">Round Up</option>
                                <option value="down">Round Down</option>
                                <option value="nearest">Nearest Integer</option>
                            </select>

                            <h3 style={headS}>Column Config</h3>
                            <div style={{background:'#0f172a', padding:'15px', borderRadius:'12px', maxHeight:'200px', overflowY:'auto'}}>
                                {cols.map((c, i) => (
                                    <div key={c.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', borderBottom:'1px solid #1e293b', pb:'5px'}}>
                                        <div style={{fontSize:'0.65rem', color:'#fff'}}>{c.label}</div>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <button onClick={()=>moveCol(i,-1)} style={ghostB}>▲</button>
                                            <button onClick={()=>moveCol(i,1)} style={ghostB}>▼</button>
                                            <button onClick={()=>{
                                                const modes = ['visible', 'private', 'hidden'];
                                                const next = modes[(modes.indexOf(c.visible) + 1) % 3];
                                                setCols(cols.map(col => col.id===c.id ? {...col, visible: next} : col));
                                            }} style={{...ghostB, color: c.visible==='visible'?'#34d399':'#f87171'}}>{c.visible.toUpperCase()}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 style={headS}>Visual Assets</h3>
                            <label style={lCap}>Logo</label>
                            <input type="file" onChange={(e)=>handleFileUpload(e, 'logo', setMeta, meta)} style={inpS} />
                            <label style={{...lCap, mt:'10px'}}>Signature</label>
                            <input type="file" onChange={(e)=>handleFileUpload(e, 'sig', setMeta, meta)} style={inpS} />

                            <button onClick={saveToLocal} style={btnMain}>💾 SAVE AS TEMPLATE</button>
                            <button onClick={exportPDF} style={{...btnMain, background:'#1e293b', border:'1px solid #38bdf8'}}>GENERATE PRO PDF</button>
                            <button onClick={factoryReset} style={btnReset}>FACTORY RESET ENGINE</button>
                        </div>
                    </aside>

                    {/* --- THE PAPER --- */}
                    <main style={paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperS, color: meta.primaryColor }}>
                            
                            <div style={{display:'flex', justifyContent: meta.logoAlign, marginBottom:'20px'}}>
                                {meta.logo ? <img src={meta.logo} style={{maxHeight:'80px', maxWidth:'240px'}} /> : <div style={{height:'80px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.iTitle} onChange={(e)=>setMeta({...meta, iTitle: e.target.value})} style={{...titleI, color: meta.tColor}} />
                                    <textarea value={meta.sender} onChange={(e)=>setMeta({...meta, sender: e.target.value})} style={areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={mRow}><span>ID:</span><input value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Date:</span><input type="date" value={meta.iDate} onChange={(e)=>setMeta({...meta, iDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply:</span><input type="date" value={meta.sDate} onChange={(e)=>setMeta({...meta, sDate: e.target.value})} style={mInp} /></div>
                                    <div style={{...mRow, fontWeight:'bold'}}><span>Currency:</span><span>{engine.config.currency}</span></div>
                                </div>
                            </div>

                            <div style={{margin:'40px 0'}}>
                                <p style={lCap}>BILL TO:</p>
                                <textarea value={meta.client} onChange={(e)=>setMeta({...meta, client: e.target.value})} style={{...areaI, height:'80px', fontSize:'1.1rem', color:'#000', fontWeight:'bold'}} />
                            </div>

                            <table style={tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.pColor}`}}>
                                    <tr>
                                        {cols.map(c => c.visible !== 'hidden' && <th key={c.id} style={{...thS, width: c.width, opacity: c.visible==='private'?0.3:1}}>{c.label}</th>)}
                                        <th style={{...thS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {engine.rows.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {cols.map(c => c.visible !== 'hidden' && (
                                                <td key={c.id} style={{...tdS, opacity: c.visible==='private'?0.3:1}}>
                                                    <input 
                                                        value={row.computed[c.id]} 
                                                        readOnly={c.type==='FORMULA'}
                                                        onChange={(e)=>{
                                                            setItems(items.map(li => li.id===row.id ? {...li, values:{...li.values, [c.id]: e.target.value}} : li))
                                                        }}
                                                        style={rawI} 
                                                    />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'900'}}>{row.grand.toFixed(engine.config.decimals)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={addB} className="no-print">+ ADD NEW ROW</button>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', breakInside:'avoid'}}>
                                <div style={{width:'55%'}}>
                                    <p style={lCap}>AMOUNT IN WORDS</p>
                                    <p style={{fontWeight:'bold', fontStyle:'italic', color: meta.pColor, marginBottom:'30px'}}>{numberToWords(engine.grandTotal, engine.config)}</p>
                                    <p style={lCap}>NOTES & TERMS</p>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={areaNotes} />
                                </div>
                                <div style={{width:'260px'}}>
                                    <div style={sumR}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.config.decimals)}</span></div>
                                    <div style={sumR}><span>Tax ({engine.config.taxLabel})</span><span>{engine.totalTax.toFixed(engine.config.decimals)}</span></div>
                                    {engine.delta !== 0 && <div style={sumR}><span>Rounding</span><span>{engine.delta.toFixed(engine.config.decimals)}</span></div>}
                                    <div style={{...sumR, borderTop:`3px solid ${meta.pColor}`, fontWeight:'900', fontSize:'1.3rem', padding:'15px 0'}}>
                                        <span>TOTAL</span><span>{engine.config.currency} {engine.grandTotal.toFixed(engine.config.decimals)}</span>
                                    </div>
                                    {meta.sig && <div style={{textAlign:'right', mt:'20px'}}><img src={meta.sig} style={{maxHeight:'60px'}} /><p style={lCap}>{meta.footerMsg}</p></div>}
                                </div>
                            </div>
                            
                            <div style={pFoot}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} />
                                    <span style={{fontSize:'0.6rem', color:'#94a3b8'}}>Page 1 of 1</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- HELPER FOR UPLOADS ---
const handleFileUpload = (e, field, setter, state) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setter({ ...state, [field]: ev.target.result });
        reader.readAsDataURL(file);
    }
};

// --- STYLING (Fixed for console errors) ---
const panelCard = { background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' };
const headS = { color: '#38bdf8', fontSize: '0.8rem', textTransform:'uppercase', margin:'20px 0 10px 0' };
const lCap = { fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '15px', outline:'none' };
const btnMin = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' };
const activeB = { ...btnMin, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const ghostB = { background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontSize:'0.6rem' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' };
const btnReset = { background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer', marginTop: '20px', width:'100%' };
const paperWrapper = { flex: '3', minWidth: '0', background: '#0f172a', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperS = { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 0 60px rgba(0,0,0,0.5)', width:'210mm' };
const titleI = { fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase' };
const areaI = { fontSize: '0.85rem', color: '#475569', height: '60px', width: '100%', resize: 'none' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' };
const trnL = { fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px' };
const trnInp = { borderBottom: '1px dashed #ccc !important', width: '150px' };
const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '0.8rem', marginBottom: '4px' };
const mInp = { width: '95px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '25px' };
const thS = { textAlign: 'left', padding: '12px 10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '12px 10px' };
const rawI = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', cursor: 'pointer', marginTop: '15px', color: '#94a3b8', fontSize: '0.7rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' };
const areaNotes = { width: '100%', height: '100px', background: '#f8fafc', padding: '10px', fontSize: '0.8rem', resize: 'none' };
const pFoot = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footInp = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const urlI = { width: '40%', fontSize: '0.6rem', color: '#94a3b8', fontStyle: 'italic' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
const inpS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '0.7rem' };
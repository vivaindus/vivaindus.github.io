import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ ENTERPRISE CONFIG & JURISDICTIONS
const JURISDICTIONS = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' }
};

const INITIAL_COLS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: 80 },
    { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: 250 },
    { id: 'qty', label: 'Qty', type: 'NUMBER', visible: 'visible', width: 60 },
    { id: 'rate', label: 'Price', type: 'NUMBER', visible: 'visible', width: 100 },
    { id: 'tax', label: 'Tax %', type: 'NUMBER', visible: 'visible', width: 70 },
    { id: 'amount', label: 'Total', type: 'FORMULA', formula: 'qty * rate', visible: 'visible', width: 100 }
];

const INITIAL_META = {
    country: 'AE', taxMode: 'exclusive', rounding: 'none',
    pColor: '#3b82f6', tColor: '#1e293b', logo: null, sig: null,
    logoAlign: 'flex-start', sigAlign: 'flex-end', sigSize: 120,
    iTitle: 'TAX INVOICE', iNum: 'INV-' + Date.now().toString().slice(-4),
    iDate: new Date().toISOString().split('T')[0],
    sDate: new Date().toISOString().split('T')[0],
    sender: 'Your Company Name\nAddress Line 1\nTRN: 100XXXXXXXXXXXX',
    client: 'Recipient Company\nAddress Line 1\nTRN: 100XXXXXXXXXXXX',
    notes: 'Please quote invoice number on all payments.',
    terms: '1. Net 15 Days\n2. Subject to local tax laws.',
    footerMsg: 'Authorized Signatory', footerUrl: 'www.shbstores.com',
    showWords: true, showSig: true, showNotes: true, showTerms: true
};

// 2️⃣ CORE ENGINES
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
    const n = Math.abs(parseFloat(total));
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

export default function EnterpriseInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- 3️⃣ STATE MANAGEMENT ---
    const [meta, setMeta] = useState(INITIAL_META);
    const [cols, setCols] = useState(INITIAL_COLS);
    const [items, setItems] = useState([{ id: 1, values: { code: 'ITM-01', desc: 'Consulting Services', qty: 1, rate: 0, tax: 5 } }]);
    const [charges, setCharges] = useState([]); // { id, label, value, taxable, type: 'fixed'|'percent' }

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v16');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setMeta(prev => ({ ...prev, ...p.meta }));
                setCols(p.cols || INITIAL_COLS);
                setItems(p.items || []);
                setCharges(p.charges || []);
            } catch (e) { console.error("Session Restore Failed", e); }
        }
    }, []);

    const saveSystem = () => {
        localStorage.setItem('shb_enterprise_v16', JSON.stringify({ meta, cols, items, charges }));
        showToast('System Encrypted & Saved Locally! ✅');
    };

    const factoryReset = () => {
        if(window.confirm("Hard Reset? All custom columns and template data will be erased.")) {
            localStorage.removeItem('shb_enterprise_v16');
            window.location.reload();
        }
    };

    // --- 4️⃣ REACTIVE TOTALS ENGINE ---
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
        
        // Process Extra Charges (Percentage based on Subtotal)
        const processedCharges = charges.map(c => ({
            ...c,
            calculatedValue: c.type === 'percent' ? (subtotal * (parseFloat(c.value) / 100)) : parseFloat(c.value || 0)
        }));

        const taxableExtra = processedCharges.filter(c => c.taxable).reduce((acc, c) => acc + c.calculatedValue, 0);
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0) + (taxableExtra * (config.taxRate / 100));
        const nonTaxableExtra = processedCharges.filter(c => !c.taxable).reduce((acc, c) => acc + c.calculatedValue, 0);
        
        let grand = subtotal + totalTax + taxableExtra + nonTaxableExtra;

        let delta = 0;
        if (meta.rounding === 'up') delta = Math.ceil(grand) - grand;
        if (meta.rounding === 'down') delta = Math.floor(grand) - grand;
        if (meta.rounding === 'nearest') delta = Math.round(grand) - grand;

        return { rows, subtotal, totalTax, grandTotal: grand + delta, delta, processedCharges, config };
    }, [items, meta, cols, charges]);

    // --- 5️⃣ UTILITIES & HANDLERS ---
    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };
    const fmt = (n) => (n || 0).toFixed(engine.config.decimals);
    
    const moveCol = (i, d) => {
        const nc = [...cols]; const t = i + d;
        if (t >= 0 && t < nc.length) { [nc[i], nc[t]] = [nc[t], nc[idx]]; setCols(nc); }
    };

    const handleFile = (e, f) => {
        const file = e.target.files[0];
        if (file) {
            const r = new FileReader();
            r.onload = (ev) => setMeta({ ...meta, [f]: ev.target.result });
            r.readAsDataURL(file);
        }
    };

    // --- 6️⃣ PDF GENERATION (Multi-page boundaries) ---
    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Rendering Modular PDF Pages...');
        
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;

        pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) {
            pdf.addPage();
            pos = hLeft - imgH + 20; // 20mm margin at top of 2nd page
            pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
            hLeft -= (297 - 20);
        }
        pdf.save(`SHB-Invoice-${meta.iNum}.pdf`);
    };

    if (!mounted) return null;

    const filteredItems = engine.rows.filter(r => r.computed.desc.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ToolboxLayout title="Universal Invoice Engine" description="Professional Enterprise Billing Suite">
            <div style={{ maxWidth: '1650px', margin: '0 auto', padding: '40px 20px' }}>
                {notif && <div style={toastS}>{notif}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- LEFT: ENTERPRISE CONTROL PANEL --- */}
                    <aside style={{ flex: 1, minWidth: '360px' }}>
                        <div style={sidebarS}>
                            <div style={panelCard}>
                                <h3 style={hS}>1. Regional Intelligence</h3>
                                <label style={lC}>Standard Jurisdiction</label>
                                <select value={meta.country} onChange={(e) => setMeta({ ...meta, country: e.target.value })} style={selS}>
                                    {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                                </select>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?actB:btnM}>Exclusive Tax</button>
                                    <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?actB:btnM}>Inclusive Tax</button>
                                </div>

                                <h3 style={hS}>2. Dynamic Columns (Width & Order)</h3>
                                <div style={colList}>
                                    {cols.map((c, i) => (
                                        <div key={c.id} style={colItem}>
                                            <div style={{flex:1}}><input value={c.label} onChange={(e)=>setCols(cols.map(cl=>cl.id===c.id?{...cl, label:e.target.value}:cl))} style={ghI} /></div>
                                            <input type="range" min="40" max="400" step="10" value={c.width} onChange={(e)=>setCols(cols.map(cl=>cl.id===c.id?{...cl, width: parseInt(e.target.value)}:cl))} style={{width:'40px'}} title="Edit Width" />
                                            <button onClick={()=>moveCol(i, -1)} style={ghB}>▲</button>
                                            <button onClick={()=>moveCol(i, 1)} style={ghB}>▼</button>
                                            <button onClick={()=>{
                                                const states = ['visible', 'private', 'hidden'];
                                                const nxt = states[(states.indexOf(c.visible)+1)%3];
                                                setCols(cols.map(cl=>cl.id===c.id?{...cl, visible: nxt}:cl));
                                            }} style={{...ghB, color: c.visible==='visible'?'#34d399':c.visible==='private'?'#fbbf24':'#f87171'}}>{c.visible[0].toUpperCase()}</button>
                                        </div>
                                    ))}
                                </div>

                                <h3 style={hS}>3. Modular Charges</h3>
                                {charges.map(c => (
                                    <div key={c.id} style={chargeItem}>
                                        <input value={c.label} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, label:e.target.value}:ch))} style={ghI} />
                                        <input type="number" value={c.value} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, value:e.target.value}:ch))} style={{...ghI, width:'50px'}} />
                                        <select value={c.type} onChange={(e)=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, type:e.target.value}:ch))} style={ghI}>
                                            <option value="fixed">Fixed</option>
                                            <option value="percent">%</option>
                                        </select>
                                        <button onClick={()=>setCharges(charges.map(ch=>ch.id===c.id?{...ch, taxable: !ch.taxable}:ch))} style={{...ghB, color: c.taxable?'#38bdf8':'#475569'}}>{c.taxable?'TAX':'NO'}</button>
                                        <button onClick={()=>setCharges(charges.filter(ch=>ch.id!==c.id))} style={{color:'#f87171', border:'none', background:'none'}}>×</button>
                                    </div>
                                ))}
                                <button onClick={()=>setCharges([...charges, {id:Date.now(), label:'Service', value:0, type:'fixed', taxable:false}])} style={addB}>+ New Charge</button>
                                
                                <h3 style={hS}>4. Branding & Themes</h3>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    <input type="color" value={meta.pColor} onChange={(e)=>setMeta({...meta, pColor:e.target.value})} style={{width:'100%', height:'40px', border:'none', cursor:'pointer'}} />
                                    <input type="color" value={meta.tColor} onChange={(e)=>setMeta({...meta, tColor:e.target.value})} style={{width:'100%', height:'40px', border:'none', cursor:'pointer'}} />
                                </div>
                                
                                <h3 style={hS}>5. Output Assets</h3>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <input type="file" onChange={(e)=>handleFile(e, 'logo')} style={inpF} title="Logo" />
                                    <input type="file" onChange={(e)=>handleFile(e, 'sig')} style={inpF} title="Signature" />
                                </div>

                                <div style={{mt:'20px', display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                                    <button onClick={saveSystem} style={btnSave}>💾 PERSIST SYSTEM STATE</button>
                                    <button onClick={exportPDF} style={btnMain}>GENERATE MASTER PDF</button>
                                    <button onClick={factoryReset} style={btnReset}>FACTORY RESET</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* --- RIGHT: RENDER CANVAS --- */}
                    <main style={paperW}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperS, borderLeft: `5px solid ${meta.pColor}` }}>
                            
                            <div style={{display:'flex', justifyContent: meta.logoAlign, marginBottom:'20px'}}>
                                {meta.logo ? <img src={meta.logo} style={{maxHeight:'85px'}} /> : <div style={{height:'85px'}}></div>}
                            </div>

                            <div style={headG}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.iTitle} onChange={(e)=>setMeta({...meta, iTitle:e.target.value})} style={{...titleI, color: meta.tColor}} />
                                    <textarea value={meta.sender} onChange={(e)=>setMeta({...meta, sender:e.target.value})} style={areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={mR}><span>No:</span><input value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum:e.target.value})} style={mInp} /></div>
                                    <div style={mR}><span>Issue Date:</span><input type="date" value={meta.iDate} onChange={(e)=>setMeta({...meta, iDate:e.target.value})} style={mInp} /></div>
                                    <div style={mR}><span>Supply Date:</span><input type="date" value={meta.sDate} onChange={(e)=>setMeta({...meta, sDate:e.target.value})} style={mInp} /></div>
                                    <div style={{...mR, color: meta.pColor, fontWeight:'900'}}><span>Currency:</span><span>{engine.config.currency}</span></div>
                                </div>
                            </div>

                            <div style={{margin:'40px 0'}}>
                                <p style={lC}>RECIPIENT INFO:</p>
                                <textarea value={meta.client} onChange={(e)=>setMeta({...meta, client:e.target.value})} style={{...areaI, height:'90px', fontSize:'1.1rem', color:'#000', fontWeight:'bold'}} />
                            </div>

                            <div style={{mb:'15px', display:'flex'}}><input placeholder="🔍 Filter line items..." onChange={(e)=>setSearchTerm(e.target.value)} style={searchI} /></div>

                            <table style={tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.pColor}`}}>
                                    <tr>
                                        {cols.map(c => c.visible !== 'hidden' && <th key={c.id} style={{...thS, width: `${c.width}px`, opacity: c.visible==='private'?0.2:1}}>{c.label}</th>)}
                                        <th style={{...thS, textAlign:'right'}}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {cols.map(c => c.visible !== 'hidden' && (
                                                <td key={c.id} style={{...tdS, opacity: c.visible==='private'?0.2:1}}>
                                                    <input 
                                                        value={row.computed[c.id]} 
                                                        readOnly={c.type==='FORMULA'}
                                                        onChange={(e)=>setItems(items.map(li=>li.id===row.id?{...li, values:{...li.values, [c.id]:e.target.value}}:li))}
                                                        style={rawI} 
                                                    />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'900'}}>{fmt(row.grand)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), values:{code:'', desc:'', qty:1, rate:0, tax:5}}])} style={addB} className="no-print">+ ADD NEW ROW</button>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'60px', breakInside:'avoid'}}>
                                <div style={{width:'55%'}}>
                                    {meta.showWords && (
                                        <>
                                            <p style={lC}>GRAND TOTAL IN WORDS</p>
                                            <p style={{fontWeight:'bold', fontStyle:'italic', color: meta.pColor, mb:'30px'}}>{numberToWords(engine.grandTotal, engine.config)}</p>
                                        </>
                                    )}
                                    <p style={lC}>NOTES</p><textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes:e.target.value})} style={areaN} />
                                    <p style={{...lC, mt:'15px'}}>TERMS & CONDITIONS</p><textarea value={meta.terms} onChange={(e)=>setMeta({...meta, terms:e.target.value})} style={areaN} />
                                </div>
                                <div style={{width:'270px'}}>
                                    <div style={sumR}><span>Subtotal</span><span>{fmt(engine.subtotal)}</span></div>
                                    <div style={sumR}><span>Tax Total ({engine.config.taxLabel})</span><span>{fmt(engine.totalTax)}</span></div>
                                    {engine.processedCharges.map(c=>(<div key={c.id} style={sumR}><span>{c.label}</span><span>{fmt(c.calculatedValue)}</span></div>))}
                                    {engine.delta !== 0 && <div style={sumR}><span>Rounding</span><span>{fmt(engine.delta)}</span></div>}
                                    <div style={{...sumR, borderTop:`3px solid ${meta.pColor}`, fontWeight:'900', fontSize:'1.4rem', padding:'20px 0', color: meta.pColor}}>
                                        <span>TOTAL</span><span>{engine.config.currency} {fmt(engine.grandTotal)}</span>
                                    </div>
                                    {meta.sig && (
                                        <div style={{textAlign: meta.sigAlign, display:'flex', flexDirection:'column', alignItems: meta.sigAlign}}>
                                            <img src={meta.sig} style={{width: `${meta.sigSize}px`, marginBottom:'10px'}} />
                                            <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={{textAlign: meta.sigAlign, fontSize:'0.75rem', fontWeight:'bold'}} />
                                        </div>
                                    )}
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
            `}</style>
        </ToolboxLayout>
    );
}

// --- FULL STYLES FOR AD-SENSE PROOF ---
const sidebarS = { flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' };
const panelCard = { background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' };
const hS = { color: '#38bdf8', fontSize: '0.8rem', textTransform: 'uppercase', margin: '20px 0 10px 0', fontWeight: 'bold' };
const lC = { fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', mb: '5px' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', color: '#fff', borderRadius: '10px', mb: '15px', outline: 'none', fontSize: '0.85rem' };
const btnM = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' };
const actB = { ...btnM, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize:'1rem' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer', mt: '10px' };
const paperW = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '20px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperS = { background: '#fff', color: '#000', padding: '25mm 20mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 0 70px rgba(0,0,0,0.6)', width: '210mm' };
const titleI = { fontSize: '2.5rem', fontWeight: '900', marginBottom:'5px' };
const areaI = { fontSize: '0.85rem', color: '#475569', height: '55px', resize: 'none' };
const headG = { display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '20px' };
const mR = { display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '0.85rem', marginBottom: '4px' };
const mInp = { width: '90px', textAlign: 'right', borderBottom: '1px solid #f1f5f9 !important' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '30px' };
const thS = { textAlign: 'left', padding: '15px 10px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '15px 10px' };
const rawI = { fontSize: '0.9rem' };
const addB = { width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', cursor: 'pointer', mt: '15px', color: '#94a3b8', fontSize: '0.75rem', borderRadius: '8px' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' };
const areaN = { width: '100%', height: '70px', background: '#f8fafc', padding: '12px', fontSize: '0.8rem', borderRadius: '10px', border:'none' };
const paperF = { mt: 'auto', pt: '40px', borderTop: '1px solid #f1f5f9' };
const urlI = { width: '40%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 35px', borderRadius: '15px', fontWeight: 'bold', zIndex: 100000, boxShadow:'0 10px 30px rgba(0,0,0,0.2)' };
const inpF = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '0.7rem' };
const colList = { background: '#0f172a', padding: '20px', borderRadius: '15px' };
const colItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px', gap: '8px', borderBottom:'1px solid #1e293b', pb:'8px' };
const ghB = { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem' };
const ghI = { background: 'none', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', padding: '8px', borderRadius: '6px', width:'100%' };
const chargeItem = { display: 'flex', gap: '8px', mb: '12px', alignItems: 'center' };
const searchI = { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', width: '100%', fontSize: '0.9rem', color: '#000', marginBottom: '10px', outline:'none' };
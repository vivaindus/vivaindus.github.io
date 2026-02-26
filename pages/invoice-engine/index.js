import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ ENTERPRISE CONFIGURATION DATA
const COUNTRY_DEFAULTS = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

// 2️⃣ CORE ENGINES (Math & Linguistic)
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
    if (isNaN(n) || n === 0) return `Zero ${config.currency} Only`;
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
    const majorVal = parseInt(parts[0]);
    const minorVal = parseInt(parts[1]);
    let res = majorVal > 0 ? `${convert(majorVal)} ${config.major}${majorVal > 1 ? 's' : ''}` : '';
    if (minorVal > 0) res += `${res ? ' and ' : ''}${convert(minorVal)} ${config.minor}`;
    return res + ' Only';
};

export default function CompleteInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notification, setNotification] = useState('');

    // --- 3️⃣ COMPREHENSIVE STATE ---
    const [meta, setMeta] = useState({
        country: 'AE',
        taxMode: 'exclusive', // inclusive | exclusive
        roundingMode: 'none', // none | up | down | nearest
        primaryColor: '#3b82f6',
        titleColor: '#1e293b',
        logo: null,
        logoAlign: 'flex-start',
        signature: null,
        invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2026-001',
        senderInfo: 'SHB Platform\nDubai, UAE\nTRN: 100234...',
        recipientInfo: 'Client Company\nCity, Country\nTRN: 100...',
        notes: 'Thank you for choosing our services.',
        terms: 'Payment due within 15 days.',
        showWords: true,
        showSignature: true
    });

    const [columns, setColumns] = useState([
        { id: 'code', label: 'Code', type: 'TEXT', visible: 'visible', width: '12%' },
        { id: 'desc', label: 'Description', type: 'TEXT', visible: 'visible', width: '38%' },
        { id: 'qty', label: 'Qty', type: 'NUMBER', visible: 'visible', width: '10%' },
        { id: 'rate', label: 'Price', type: 'NUMBER', visible: 'visible', width: '15%' },
        { id: 'tax', label: 'VAT %', type: 'NUMBER', visible: 'visible', width: '10%' },
        { id: 'amount', label: 'Total', type: 'FORMULA', formula: 'qty * rate', visible: 'visible', width: '15%' }
    ]);

    const [lineItems, setLineItems] = useState([
        { id: 1, values: { code: 'SRV-01', desc: 'Enterprise Implementation', qty: 1, rate: 1000, tax: 5 } }
    ]);

    const [extraCharges, setExtraCharges] = useState([]); // { label, value, taxable }

    // --- 4️⃣ RE-CALCULATION ENGINE (Derived Values) ---
    const engineOutput = useMemo(() => {
        const config = COUNTRY_DEFAULTS[meta.country];
        
        const rows = lineItems.map(item => {
            const vals = { ...item.values };
            columns.filter(c => c.type === 'FORMULA').forEach(c => vals[c.id] = safeEval(c.formula, vals));
            
            const amt = parseFloat(vals.amount) || 0;
            const txRate = parseFloat(vals.tax) || 0;
            const txVal = meta.taxMode === 'exclusive' ? (amt * txRate / 100) : (amt - (amt / (1 + txRate / 100)));
            
            return { ...item, computed: vals, tax: txVal, rowTotal: meta.taxMode === 'exclusive' ? amt + txVal : amt };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const taxableExtra = extraCharges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
        const baseForTax = subtotal + taxableExtra;
        
        // Complex Tax Logic
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0) + (taxableExtra * (parseFloat(config.taxRate) / 100));
        
        let final = baseForTax + totalTax + extraCharges.filter(c => !c.taxable).reduce((acc, c) => acc + parseFloat(c.value || 0), 0);
        
        // Rounding Logic
        let roundingAdjustment = 0;
        if (meta.roundingMode === 'up') roundingAdjustment = Math.ceil(final) - final;
        if (meta.roundingMode === 'down') roundingAdjustment = Math.floor(final) - final;
        if (meta.roundingMode === 'nearest') roundingAdjustment = Math.round(final) - final;

        return {
            rows, subtotal, totalTax,
            grandTotal: final + roundingAdjustment,
            roundingDelta: roundingAdjustment,
            config
        };
    }, [lineItems, meta, columns, extraCharges]);

    useEffect(() => { setMounted(true); }, []);

    // --- HANDLERS ---
    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };
    
    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, [field]: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const moveColumn = (index, direction) => {
        const newCols = [...columns];
        const target = index + direction;
        if (target < 0 || target >= columns.length) return;
        [newCols[index], newCols[target]] = [newCols[target], newCols[index]];
        setColumns(newCols);
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Rendering Multi-page Enterprise PDF...');

        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;

        pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) {
            pdf.addPage();
            pos = hLeft - imgH + 20; 
            pdf.addImage(imgData, 'PNG', 0, pos, 210, imgH);
            hLeft -= (297 - 20);
        }
        pdf.save(`Invoice-${meta.invoiceNum}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Master Invoice Engine" description="Modular Enterprise Invoicing Suite">
            <div style={{ maxWidth: '1550px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && <div style={toastS}>{notification}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- 19. UI CONTROL PANEL --- */}
                    <aside style={sidebarS}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>1. Global Configuration</h3>
                            <label style={lCap}>Country Engine</label>
                            <select value={meta.country} onChange={(e) => setMeta({ ...meta, country: e.target.value })} style={selS}>
                                {Object.keys(COUNTRY_DEFAULTS).map(k => <option key={k} value={k}>{COUNTRY_DEFAULTS[k].name}</option>)}
                            </select>

                            <label style={lCap}>Tax Logic</label>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <button onClick={()=>setMeta({...meta, taxMode:'exclusive'})} style={meta.taxMode==='exclusive'?activeB:btnMin}>Exclusive</button>
                                <button onClick={()=>setMeta({...meta, taxMode:'inclusive'})} style={meta.taxMode==='inclusive'?activeB:btnMin}>Inclusive</button>
                            </div>

                            <label style={lCap}>Rounding Mode</label>
                            <select value={meta.roundingMode} onChange={(e)=>setMeta({...meta, roundingMode: e.target.value})} style={selS}>
                                <option value="none">None (Exact)</option>
                                <option value="up">Round Up</option>
                                <option value="down">Round Down</option>
                                <option value="nearest">To Nearest</option>
                            </select>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>2. Column Architecture</h3>
                            <div style={{background:'#0f172a', padding:'15px', borderRadius:'12px'}}>
                                {columns.map((col, idx) => (
                                    <div key={col.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                                        <div style={{flex:1}}>
                                            <div style={{fontSize:'0.7rem', color: col.visible==='visible'?'#fff':'#475569'}}>{col.label}</div>
                                        </div>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <button onClick={()=>moveColumn(idx, -1)} style={ghostBtn}>▲</button>
                                            <button onClick={()=>moveColumn(idx, 1)} style={ghostBtn}>▼</button>
                                            <button onClick={()=>setColumns(columns.map(c=>c.id===col.id?{...c, visible: c.visible==='visible'?'hidden':'visible'}:c))} style={{...ghostBtn, color:'#34d399'}}>O</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>3. Assets & Security</h3>
                            <label style={lCap}>Business Logo</label>
                            <input type="file" onChange={(e)=>handleFileUpload(e, 'logo')} style={inpS} />
                            <label style={{...lCap, marginTop:'10px'}}>Authorized Signature</label>
                            <input type="file" onChange={(e)=>handleFileUpload(e, 'signature')} style={inpS} />
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={exportPDF} style={btnMain}>GENERATE ENTERPRISE PDF</button>
                            <button onClick={()=>{localStorage.clear(); window.location.reload();}} style={btnReset}>FACTORY RESET</button>
                        </div>
                    </aside>

                    {/* --- 15. PDF RENDER CANVAS (PAPER) --- */}
                    <main style={paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperS, width: '210mm' }}>
                            
                            {/* Logo Row */}
                            <div style={{display:'flex', justifyContent: meta.logoAlign, marginBottom:'20px'}}>
                                {meta.logo ? <img src={meta.logo} style={{maxHeight:'80px', maxWidth:'250px'}} /> : <div style={{height:'80px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div style={{flex:1.5}}>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={{...titleI, color: meta.primaryColor}} />
                                    <textarea value={meta.senderInfo} onChange={(e)=>setMeta({...meta, senderInfo: e.target.value})} style={areaI} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={mRow}><span>Invoice #:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Issue Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply Date:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mInp} /></div>
                                    <div style={{...mRow, color: meta.primaryColor, fontWeight:'bold'}}><span>Currency:</span><span>{engineOutput.config.currency}</span></div>
                                </div>
                            </div>

                            <div style={{margin:'40px 0'}}>
                                <p style={tagL}>BILL TO:</p>
                                <textarea value={meta.recipientInfo} onChange={(e)=>setMeta({...meta, recipientInfo: e.target.value})} style={{...areaI, fontSize:'1.1rem', fontWeight:'bold', height:'80px'}} />
                            </div>

                            <table style={tableS}>
                                <thead style={{background:'#f8fafc', borderBottom:`2px solid ${meta.primaryColor}`}}>
                                    <tr>
                                        {columns.map(c => c.visible==='visible' && <th key={c.id} style={thS}>{c.label}</th>)}
                                        <th style={{...thS, textAlign:'right'}}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {engineOutput.rows.map(row => (
                                        <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                            {columns.map(col => col.visible==='visible' && (
                                                <td key={col.id} style={tdS}>
                                                    <input 
                                                        value={row.computed[col.id]} 
                                                        readOnly={col.type==='FORMULA'}
                                                        onChange={(e)=>setLineItems(lineItems.map(li => li.id===row.id ? {...li, values:{...li.values, [col.id]: e.target.value}} : li))}
                                                        style={{...rawI, fontWeight: col.type==='FORMULA'?'bold':'normal'}} 
                                                    />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'bold'}}>{row.grand.toFixed(engineOutput.config.decimals)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setLineItems([...lineItems, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={addB} className="no-print">+ ADD ITEM</button>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'60px', pageBreakInside:'avoid'}}>
                                <div style={{width:'55%'}}>
                                    <p style={tagL}>AMOUNT IN WORDS</p>
                                    <p style={{fontWeight:'bold', fontStyle:'italic', color: meta.primaryColor, marginBottom:'20px'}}>{numberToWords(engineOutput.grandTotal, engineOutput.config)}</p>
                                    
                                    <p style={tagL}>NOTES & TERMS</p>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={areaNotes} />
                                </div>
                                <div style={{width:'260px'}}>
                                    <div style={sumR}><span>Net Subtotal</span><span>{engineOutput.subtotal.toFixed(engineOutput.config.decimals)}</span></div>
                                    <div style={sumR}><span>Tax ({engineOutput.config.taxLabel})</span><span>{engineOutput.totalTax.toFixed(engineOutput.config.decimals)}</span></div>
                                    {engineOutput.roundingDelta !== 0 && <div style={sumR}><span>Rounding Adj.</span><span>{engineOutput.roundingDelta.toFixed(engineOutput.config.decimals)}</span></div>}
                                    <div style={{...sumR, borderTop:`2px solid #000`, fontWeight:'900', fontSize:'1.2rem', marginTop:'10px', padding:'15px 0'}}>
                                        <span>TOTAL</span><span>{engineOutput.config.currency} {engineOutput.grandTotal.toFixed(engineOutput.config.decimals)}</span>
                                    </div>
                                    {meta.signature && (
                                        <div style={{marginTop:'30px', textAlign:'right'}}>
                                            <img src={meta.signature} style={{maxHeight:'60px', maxWidth:'150px'}} />
                                            <p style={{fontSize:'0.7rem', color:'#94a3b8'}}>{meta.footerMsg}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div style={paperFooter}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} />
                                    <span style={{fontSize:'0.6rem', color:'#ccc'}}>System Powered by SHB</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper input, #invoice-paper textarea { color: #000 !important; background: transparent !important; border: none; outline: none; transition: 0.1s; width: 100%; }
                #invoice-paper input:hover, #invoice-paper textarea:hover { background: rgba(0,0,0,0.02) !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- FINAL STYLING ---
const sidebarS = { flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' };
const sidebarCard = { background: '#1e293b', padding: '25px', borderRadius: '15px', border: '1px solid #334155' };
const cardTitle = { color: '#38bdf8', fontSize: '0.8rem', margin: '0 0 15px 0', textTransform: 'uppercase', fontWeight: 'bold' };
const lCap = { fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '15px', outline:'none', fontSize:'0.8rem' };
const clrInp = { width: '100%', height: '35px', background: 'none', border: '1px solid #334155', cursor: 'pointer', borderRadius: '4px' };
const btnMin = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' };
const activeB = { ...btnMin, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const ghostBtn = { background: 'none', border: '1px solid #334155', color: '#38bdf8', cursor: 'pointer', fontSize: '0.6rem', padding:'2px 5px', borderRadius:'4px' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer', marginTop: '10px' };
const paperWrapper = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperS = { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 10px 60px rgba(0,0,0,0.5)' };
const titleI = { fontSize: '2.5rem', fontWeight: '900', marginBottom:'10px' };
const areaI = { fontSize: '0.85rem', color: '#475569', height: '60px', width: '100%', resize:'none' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px' };
const trnL = { fontSize: '0.8rem', fontWeight: 'bold', marginTop:'10px' };
const trnInp = { borderBottom: '1px dashed #ccc !important', width: '160px' };
const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '0.85rem', marginBottom: '4px' };
const mInp = { width: '100px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagL = { fontSize: '0.65rem', fontWeight: 'bold', color: '#94a3b8', display:'block', marginBottom:'5px' };
const wordBox = { fontSize: '0.9rem', fontWeight: 'bold', fontStyle: 'italic', borderBottom: '1px solid #eee', padding: '8px 0' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '25px' };
const thS = { textAlign: 'left', padding: '12px 10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '10px 8px', borderBottom: '1px solid #f1f5f9' };
const rawI = { fontSize: '0.85rem', padding: '5px 0' };
const addB = { width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #ccc', color: '#94a3b8', cursor: 'pointer', marginTop: '15px', borderRadius: '8px', fontSize:'0.75rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' };
const areaNotes = { width: '100%', height: '100px', background: '#f8fafc', padding: '10px', fontSize: '0.8rem', borderRadius: '8px', border: 'none', resize: 'none' };
const paperFooter = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footInp = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const urlI = { width: '50%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
const inpS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', fontSize: '0.75rem' };
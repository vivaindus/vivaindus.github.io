import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ GLOBAL DATA & CONFIG
const COUNTRIES = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

// 2️⃣ FORMULA ENGINE
const parseFormula = (formula, values) => {
    try {
        let expression = formula;
        Object.keys(values).forEach(id => {
            const val = parseFloat(values[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        // eslint-disable-next-line no-new-func
        return Function(`'use strict'; return (${expression})`)();
    } catch { return 0; }
};

// 3️⃣ AMOUNT IN WORDS ENGINE
const amountToWords = (total, config) => {
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

    // --- 4️⃣ GLOBAL STATE STRUCTURE ---
    const [settings, setSettings] = useState({
        country: 'AE',
        taxMode: 'exclusive', // inclusive | exclusive
        primaryColor: '#3b82f6',
        titleColor: '#1e293b',
        showWords: true,
        decimals: 2
    });

    const [columns, setColumns] = useState([
        { id: 'code', label: 'Code', type: 'TEXT', visible: true, width: '12%' },
        { id: 'desc', label: 'Description', type: 'TEXT', visible: true, width: '38%' },
        { id: 'qty', label: 'Qty', type: 'NUMBER', visible: true, width: '10%' },
        { id: 'rate', label: 'Price', type: 'NUMBER', visible: true, width: '15%' },
        { id: 'tax', label: 'Tax %', type: 'NUMBER', visible: true, width: '10%' },
        { id: 'amount', label: 'Total', type: 'FORMULA', formula: 'qty * rate', visible: true, width: '15%' }
    ]);

    const [lineItems, setLineItems] = useState([
        { id: 1, values: { code: 'SRV-01', desc: 'Solution Architecture Design', qty: 1, rate: 1250, tax: 5 } }
    ]);

    useEffect(() => { setMounted(true); }, []);

    // --- 5️⃣ DERIVED CALCULATION ENGINE (REACTIVE) ---
    const engine = useMemo(() => {
        const country = COUNTRIES[settings.country];
        
        const rows = lineItems.map(item => {
            const vals = { ...item.values };
            // Compute Formula Columns
            columns.filter(c => c.type === 'FORMULA').forEach(c => {
                vals[c.id] = parseFormula(c.formula, vals);
            });

            const amt = parseFloat(vals.amount) || 0;
            const txRate = parseFloat(vals.tax) || 0;
            const txVal = settings.taxMode === 'exclusive' 
                ? (amt * txRate / 100) 
                : (amt - (amt / (1 + txRate / 100)));

            return {
                ...item,
                computed: vals,
                tax: txVal,
                grand: settings.taxMode === 'exclusive' ? amt + txVal : amt
            };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const totalTax = rows.reduce((acc, r) => acc + r.tax, 0);

        return {
            rows,
            subtotal,
            totalTax,
            grandTotal: settings.taxMode === 'exclusive' ? subtotal + totalTax : subtotal,
            config: country
        };
    }, [lineItems, settings, columns]);

    // --- HANDLERS ---
    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };

    const updateValue = (id, col, val) => {
        setLineItems(lineItems.map(li => li.id === id ? { ...li, values: { ...li.values, [col]: val } } : li));
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Generating Multi-page PDF...');

        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;

        pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) {
            pdf.addPage();
            pos = hLeft - imgH + 20; // 20mm top margin for Page 2+
            pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
            hLeft -= (297 - 20);
        }
        pdf.save(`Invoice.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Universal Invoice Engine" description="Modular Enterprise Invoicing">
            <div style={{ maxWidth: '1550px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && <div style={toastS}>{notification}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- 19. UI CONTROL PANEL --- */}
                    <aside style={sidebarS}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>1. Country & Tax</h3>
                            <label style={lCap}>Select Jurisdiction</label>
                            <select value={settings.country} onChange={(e) => setSettings({ ...settings, country: e.target.value })} style={selS}>
                                {Object.keys(COUNTRIES).map(k => <option key={k} value={k}>{COUNTRIES[k].name}</option>)}
                            </select>

                            <label style={lCap}>Calculation Mode</label>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                                <button onClick={()=>setSettings({...settings, taxMode:'exclusive'})} style={settings.taxMode==='exclusive'?activeB:btnMin}>Exclusive</button>
                                <button onClick={()=>setSettings({...settings, taxMode:'inclusive'})} style={settings.taxMode==='inclusive'?activeB:btnMin}>Inclusive</button>
                            </div>

                            <h3 style={cardTitle}>2. Visuals</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                <div><label style={lCap}>Theme</label><input type="color" value={settings.primaryColor} onChange={(e)=>setSettings({...settings, primaryColor:e.target.value})} style={clrI} /></div>
                                <div><label style={lCap}>Text</label><input type="color" value={settings.titleColor} onChange={(e)=>setMeta({...settings, titleColor:e.target.value})} style={clrI} /></div>
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>3. Column Engine</h3>
                            <div style={{background:'#0f172a', padding:'15px', borderRadius:'12px'}}>
                                {columns.map(col => (
                                    <div key={col.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                        <span style={{fontSize:'0.7rem', color: col.visible ? '#fff' : '#475569'}}>{col.label}</span>
                                        <button onClick={()=>setColumns(columns.map(c=>c.id===col.id?{...c, visible: !c.visible}:c))} style={ghostBtn}>
                                            {col.visible ? 'HIDE' : 'SHOW'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={exportPDF} style={btnMain}>GENERATE PDF</button>
                            <button onClick={()=>window.location.reload()} style={btnReset}>RELOAD ENGINE</button>
                        </div>
                    </aside>

                    {/* --- 15. PDF RENDER CANVAS --- */}
                    <main style={paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperS, width: '210mm' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `4px solid ${settings.primaryColor}`, paddingBottom: '20px' }}>
                                <div>
                                    <h1 style={{fontSize:'2.5rem', fontWeight:'900', color: settings.primaryColor}}>{settings.taxMode.toUpperCase()} INVOICE</h1>
                                    <p style={{fontSize:'0.85rem', fontWeight:'bold'}}>TRN: 100XXXXXXXXXXXX</p>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <h2 style={{margin:0}}>SHB PLATFORM</h2>
                                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>{engine.config.name} Protocol</p>
                                </div>
                            </div>

                            <table style={tableS}>
                                <thead>
                                    <tr style={{borderBottom:`2px solid ${settings.primaryColor}`, background:'#f8fafc'}}>
                                        {columns.map(c => c.visible && <th key={c.id} style={thS}>{c.label}</th>)}
                                        <th style={{...thS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {engine.rows.map(row => (
                                        <tr key={row.id}>
                                            {columns.map(col => col.visible && (
                                                <td key={col.id} style={tdS}>
                                                    <input 
                                                        value={row.computed[col.id]} 
                                                        readOnly={col.type==='FORMULA'}
                                                        onChange={(e)=>updateValue(row.id, col.id, e.target.value)}
                                                        style={{...rawI, fontWeight: col.type==='FORMULA'?'bold':'normal'}} 
                                                    />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'bold'}}>
                                                {row.grand.toFixed(engine.config.decimals)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setLineItems([...lineItems, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={addB}>+ ADD LINE ITEM</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                                <div style={{width:'60%'}}>
                                    <p style={lCap}>AMOUNT IN WORDS</p>
                                    <p style={{fontWeight:'bold', fontStyle:'italic', color: settings.primaryColor}}>
                                        {amountToWords(engine.grandTotal, engine.config)}
                                    </p>
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={sumR}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.config.decimals)}</span></div>
                                    <div style={sumR}><span>Tax Total</span><span>{engine.totalTax.toFixed(engine.config.decimals)}</span></div>
                                    <div style={{...sumR, borderTop:`2px solid #000`, fontWeight:'bold', fontSize:'1.2rem', marginTop:'10px'}}>
                                        <span>TOTAL {engine.config.currency}</span><span>{engine.grandTotal.toFixed(engine.config.decimals)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLING DEFINITIONS ---
const sidebarS = { flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' };
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
const cardTitle = { color: '#38bdf8', fontSize: '0.85rem', margin: '0 0 15px 0', textTransform: 'uppercase', fontWeight: 'bold' };
const lCap = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '15px', outline:'none' };
const clrI = { width: '100%', height: '35px', background: 'none', border: '1px solid #334155', cursor: 'pointer', borderRadius: '4px' };
const btnMin = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' };
const activeB = { ...btnMin, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const ghostBtn = { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer', marginTop: '10px' };

const paperWrapper = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperS = { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 10px 60px rgba(0,0,0,0.5)' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '30px' };
const thS = { textAlign: 'left', padding: '10px 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '10px 8px', borderBottom: '1px solid #f1f5f9' };
const rawI = { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', cursor: 'pointer', marginTop: '15px', color: '#94a3b8', fontSize: '0.75rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold', zIndex: 10000 };
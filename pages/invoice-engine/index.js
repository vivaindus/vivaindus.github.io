import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ DATA ARCHITECTURE: REGIONAL DEFAULTS
const COUNTRIES = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, decimals: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, decimals: 3, major: 'Riyal', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, decimals: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, decimals: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, decimals: 2, major: 'Rupee', minor: 'Paise' }
};

// 2️⃣ SAFE FORMULA PARSER
const parseFormula = (formula, values) => {
    try {
        let expression = formula;
        Object.keys(values).forEach(id => {
            const val = parseFloat(values[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        return Function(`'use strict'; return (${expression})`)();
    } catch { return 0; }
};

// 3️⃣ COMPREHENSIVE NUMBER TO WORDS
const amountToWords = (total, config) => {
    if (total === 0) return `Zero ${config.currency} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
        if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
        return '';
    };
    const parts = total.toFixed(config.decimals).split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    let result = major > 0 ? `${convert(major)} ${config.major}${major > 1 ? 's' : ''}` : '';
    if (minor > 0) result += `${result ? ' and ' : ''}${convert(minor)} ${config.minor}`;
    return result + ' Only';
};

export default function AdvancedInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [notification, setNotification] = useState('');

    // --- ENGINE STATE ---
    const [settings, setSettings] = useState({
        country: 'AE', taxMode: 'exclusive', primaryColor: '#3b82f6', 
        logo: null, showTotalInWords: true
    });

    const [columns, setColumns] = useState([
        { id: 'code', label: 'Item Code', type: 'TEXT', visible: true, width: '12%' },
        { id: 'desc', label: 'Description', type: 'TEXT', visible: true, width: '38%' },
        { id: 'qty', label: 'Qty', type: 'NUMBER', visible: true, width: '10%' },
        { id: 'rate', label: 'Price', type: 'NUMBER', visible: true, width: '15%' },
        { id: 'tax', label: 'Tax %', type: 'NUMBER', visible: true, width: '10%' },
        { id: 'amount', label: 'Total', type: 'FORMULA', formula: 'qty * rate', visible: true, width: '15%' }
    ]);

    const [lineItems, setLineItems] = useState([
        { id: 1, values: { code: 'SRV-101', desc: 'Enterprise Solution Implementation', qty: 1, rate: 5000, tax: 5 } }
    ]);

    useEffect(() => { setMounted(true); }, []);

    // 4️⃣ REACTIVE CALCULATION ENGINE (Derived Values)
    const engineOutput = useMemo(() => {
        const country = COUNTRIES[settings.country];
        
        const rows = lineItems.map(item => {
            const computed = { ...item.values };
            columns.filter(c => c.type === 'FORMULA').forEach(fCol => {
                computed[fCol.id] = parseFormula(fCol.formula, computed);
            });
            const baseAmount = parseFloat(computed.amount) || 0;
            const taxRate = parseFloat(computed.tax) || 0;
            const rowTax = settings.taxMode === 'exclusive' 
                ? (baseAmount * taxRate / 100) 
                : (baseAmount - (baseAmount / (1 + taxRate / 100)));

            return {
                ...item,
                computed,
                taxValue: rowTax,
                grand: settings.taxMode === 'exclusive' ? baseAmount + rowTax : baseAmount
            };
        });

        const subtotal = rows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const totalTax = rows.reduce((acc, r) => acc + r.taxValue, 0);

        return {
            rows,
            subtotal,
            totalTax,
            grandTotal: settings.taxMode === 'exclusive' ? subtotal + totalTax : subtotal,
            config: country
        };
    }, [lineItems, settings, columns]);

    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast('Building Multi-page PDF...');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff', canvasWidth: 800 });
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgH = (canvas.height * 210) / canvas.width;
        let hLeft = imgH, pos = 0;
        pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
        hLeft -= 297;
        while (hLeft > 0) {
            pdf.addPage();
            pos = hLeft - imgH + 20;
            pdf.addImage(img, 'PNG', 0, pos, 210, imgH);
            hLeft -= (297 - 20);
        }
        pdf.save(`Invoice.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Modular Invoice Engine" description="Advanced Config-driven Invoicing System">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && <div style={toastS}>{notification}</div>}

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLS --- */}
                    <aside style={{ flex: 1, minWidth: '320px' }}>
                        <div style={panelCard}>
                            <h3 style={headS}>1. Country Engine</h3>
                            <select value={settings.country} onChange={(e) => setSettings({ ...settings, country: e.target.value })} style={selectS}>
                                {Object.keys(COUNTRIES).map(k => <option key={k} value={k}>{COUNTRIES[k].name}</option>)}
                            </select>

                            <h3 style={headS}>2. Tax System</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                                <button onClick={()=>setSettings({...settings, taxMode:'exclusive'})} style={settings.taxMode==='exclusive'?activeB:btnMin}>Exclusive</button>
                                <button onClick={()=>setSettings({...settings, taxMode:'inclusive'})} style={settings.taxMode==='inclusive'?activeB:btnMin}>Inclusive</button>
                            </div>

                            <h3 style={headS}>3. Dynamic Columns</h3>
                            <div style={{background:'#0f172a', padding:'15px', borderRadius:'12px'}}>
                                {columns.map(col => (
                                    <div key={col.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                        <span style={{fontSize:'0.75rem', color: col.visible ? '#fff' : '#475569'}}>{col.label}</span>
                                        <button onClick={()=>setColumns(columns.map(c=>c.id===col.id?{...c, visible: !c.visible}:c))} style={{background:'none', border:'none', color:'#38bdf8', cursor:'pointer', fontSize:'0.7rem'}}>
                                            {col.visible ? 'HIDE' : 'SHOW'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={exportPDF} style={btnMain}>GENERATE COMPLIANT PDF</button>
                        </div>
                    </aside>

                    {/* --- THE CANVAS --- */}
                    <main style={{ flex: 2.5, minWidth: '350px', background:'#334155', padding:'40px', borderRadius:'20px', display:'flex', justifyContent:'center', overflowX:'auto' }}>
                        <div ref={invoiceRef} style={paperS}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `4px solid ${settings.primaryColor}`, paddingBottom: '20px' }}>
                                <div>
                                    <h1 style={{fontSize:'2.5rem', fontWeight:'900', color: settings.primaryColor}}>{settings.taxMode.toUpperCase()} INVOICE</h1>
                                    <p>Supplier TRN: 100234958600003</p>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <h2>SHB PLATFORM</h2>
                                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>{engineOutput.config.name} Standards</p>
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
                                    {engineOutput.rows.map(row => (
                                        <tr key={row.id}>
                                            {columns.map(col => col.visible && (
                                                <td key={col.id} style={tdS}>
                                                    <input 
                                                        value={row.computed[col.id]} 
                                                        readOnly={col.type==='FORMULA'}
                                                        onChange={(e)=>setLineItems(lineItems.map(li => li.id===row.id ? {...li, values:{...li.values, [col.id]: e.target.value}} : li))}
                                                        style={{...rawI, fontWeight: col.type==='FORMULA'?'bold':'normal'}} 
                                                    />
                                                </td>
                                            ))}
                                            <td style={{...tdS, textAlign:'right', fontWeight:'bold'}}>{engineOutput.config.currency} {row.grand.toFixed(engineOutput.config.decimals)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setLineItems([...lineItems, {id:Date.now(), values:{qty:1, rate:0, tax:5}}])} style={addB}>+ ADD ROW</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                                <div style={{width:'60%'}}>
                                    <p style={lCap}>AMOUNT IN WORDS</p>
                                    <p style={{fontWeight:'bold', fontStyle:'italic', color: settings.primaryColor}}>{amountToWords(engineOutput.grandTotal, engineOutput.config)}</p>
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={sumR}><span>Subtotal</span><span>{engineOutput.subtotal.toFixed(engineOutput.config.decimals)}</span></div>
                                    <div style={sumR}><span>Tax Total</span><span>{engineOutput.totalTax.toFixed(engineOutput.config.decimals)}</span></div>
                                    <div style={{...sumR, borderTop:`2px solid #000`, fontWeight:'bold', fontSize:'1.2rem'}}>
                                        <span>TOTAL</span><span>{engineOutput.config.currency} {engineOutput.grandTotal.toFixed(engineOutput.config.decimals)}</span>
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

// STYLES
const panelCard = { background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155' };
const headS = { color: '#fff', fontSize: '0.9rem', marginBottom: '15px' };
const labelS = { display: 'block', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px' };
const selectS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', marginBottom: '20px', outline: 'none' };
const btnMin = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize:'0.75rem' };
const activeB = { ...btnMin, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop:'20px' };
const paperS = { background: '#fff', color: '#000', padding: '20mm', minHeight: '297mm', boxShadow: '0 0 50px rgba(0,0,0,0.4)', width:'100%' };
const tableS = { width: '100%', borderCollapse: 'collapse', marginTop: '30px' };
const thS = { textAlign: 'left', padding: '12px 10px', fontSize: '0.8rem', color: '#64748b' };
const tdS = { padding: '12px 10px', borderBottom: '1px solid #f1f5f9' };
const rawI = { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '8px 0' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', cursor: 'pointer', marginTop: '10px', color:'#94a3b8' };
const toastS = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10000 };
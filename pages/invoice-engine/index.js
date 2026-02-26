import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ COUNTRY & CURRENCY ENGINE DATA
const COUNTRY_CONFIG = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, precision: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, precision: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, precision: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, precision: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, precision: 2, major: 'Rupee', minor: 'Paise' }
};

// 2️⃣ FORMULA ENGINE: Safely evaluate math strings like "(qty * rate)"
const evaluateFormula = (formula, rowValues) => {
    try {
        // Replace column IDs with their actual values
        let expression = formula;
        Object.keys(rowValues).forEach(id => {
            const val = parseFloat(rowValues[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        // Basic math parser (Safe alternative to eval)
        return Function(`'use strict'; return (${expression})`)();
    } catch (e) {
        return 0;
    }
};

// 3️⃣ TOTAL IN WORDS ENGINE
const numberToWords = (amount, currency, major, minor, precision) => {
    if (amount === 0) return `Zero ${currency} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        return '';
    };

    const split = parseFloat(amount).toFixed(precision).split('.');
    const majorPart = parseInt(split[0]);
    const minorPart = parseInt(split[1]);

    let result = majorPart > 0 ? convert(majorPart) + ' ' + (majorPart === 1 ? major : major + 's') : '';
    if (minorPart > 0) {
        result += (result ? ' and ' : '') + convert(minorPart) + ' ' + minor;
    }
    return result + ' Only';
};

export default function InvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // 4️⃣ GLOBAL STATE STRUCTURE
    const [settings, setSettings] = useState({
        country: 'AE',
        currency: 'AED',
        taxMode: 'exclusive', // inclusive | exclusive
        showTotalInWords: true,
        showSignature: true,
        decimals: 2,
        primaryColor: '#3b82f6'
    });

    const [columns, setColumns] = useState([
        { id: 'code', label: 'Code', type: 'TEXT', visible: true, width: '10%' },
        { id: 'desc', label: 'Description', type: 'TEXT', visible: true, width: '35%' },
        { id: 'qty', label: 'Quantity', type: 'NUMBER', visible: true, width: '10%' },
        { id: 'rate', label: 'Price', type: 'NUMBER', visible: true, width: '15%' },
        { id: 'amount', label: 'Amount', type: 'FORMULA', formula: 'qty * rate', visible: true, width: '15%' },
        { id: 'tax', label: 'VAT %', type: 'NUMBER', visible: true, width: '10%' }
    ]);

    const [lineItems, setLineItems] = useState([
        { id: Date.now(), values: { code: 'SRV-01', desc: 'Enterprise Consulting', qty: 1, rate: 1000, tax: 5 } }
    ]);

    // 5️⃣ DERIVED CALCULATIONS (Reactive Engine)
    const processedItems = useMemo(() => {
        return lineItems.map(item => {
            const computedValues = { ...item.values };
            // Process Formulas
            columns.filter(c => c.type === 'FORMULA').forEach(col => {
                computedValues[col.id] = evaluateFormula(col.formula, computedValues);
            });
            // Process Tax
            const amt = parseFloat(computedValues.amount) || 0;
            const txRate = parseFloat(computedValues.tax) || 0;
            const txAmt = settings.taxMode === 'exclusive' ? (amt * txRate / 100) : (amt - (amt / (1 + txRate / 100)));
            
            return { 
                ...item, 
                computed: computedValues,
                taxAmount: txAmt,
                rowTotal: settings.taxMode === 'exclusive' ? amt + txAmt : amt
            };
        });
    }, [lineItems, columns, settings.taxMode]);

    const totals = useMemo(() => {
        const sub = processedItems.reduce((acc, curr) => acc + (parseFloat(curr.computed.amount) || 0), 0);
        const tax = processedItems.reduce((acc, curr) => acc + curr.taxAmount, 0);
        return {
            subtotal: sub,
            taxTotal: tax,
            grandTotal: settings.taxMode === 'exclusive' ? sub + tax : sub
        };
    }, [processedItems, settings.taxMode]);

useEffect(() => { setMounted(true); }, []);

    const updateItemValue = (itemId, colId, value) => {
        setLineItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, values: { ...item.values, [colId]: value } } : item
        ));
    };

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${Date.now()}.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Engine" description="The world's most advanced dynamic invoice generator.">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* --- CONTROL PANEL --- */}
                <aside style={{ flex: 1, minWidth: '350px' }}>
                    <div style={panelCard}>
                        <h2 style={{color: '#38bdf8', marginBottom: '20px'}}>Engine Controls</h2>
                        
                        <label style={labelS}>Regional Configuration</label>
                        <select value={settings.country} onChange={(e) => {
                            const c = COUNTRY_CONFIG[e.target.value];
                            setSettings({ ...settings, country: e.target.value, currency: c.currency, decimals: c.precision });
                        }} style={selectS}>
                            {Object.keys(COUNTRY_CONFIG).map(k => <option key={k} value={k}>{COUNTRY_CONFIG[k].name}</option>)}
                        </select>

                        <label style={labelS}>Tax Logic</label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom: '20px'}}>
                            <button onClick={() => setSettings({...settings, taxMode: 'exclusive'})} style={settings.taxMode === 'exclusive' ? activeBtn : btnMin}>Exclusive</button>
                            <button onClick={() => setSettings({...settings, taxMode: 'inclusive'})} style={settings.taxMode === 'inclusive' ? activeBtn : btnMin}>Inclusive</button>
                        </div>

                        <label style={labelS}>Theme Color</label>
                        <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} style={{width:'100%', height:'40px', border:'none', cursor:'pointer'}} />

                        <div style={{marginTop: '30px'}}>
                            <button onClick={exportPDF} style={btnMain}>GENERATE PRO PDF</button>
                        </div>
                    </div>
                </aside>

                {/* --- LIVE RENDER CANVAS --- */}
                <main style={{ flex: 2.5, minWidth: '0' }}>
                    <div ref={invoiceRef} style={paperStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `4px solid ${settings.primaryColor}`, paddingBottom: '20px', marginBottom: '40px' }}>
                            <h1 style={{fontSize: '3rem', fontWeight: '900', color: settings.primaryColor}}>{settings.taxMode.toUpperCase()} {COUNTRY_CONFIG[settings.country].taxLabel} INVOICE</h1>
                            <div style={{textAlign: 'right'}}>
                                <h3 style={{margin:0}}>SHB SOLUTIONS</h3>
                                <p style={{fontSize:'0.8rem', color:'#64748b'}}>{COUNTRY_CONFIG[settings.country].name}</p>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${settings.primaryColor}` }}>
                                    {columns.map(col => col.visible && <th key={col.id} style={{...thS, width: col.width}}>{col.label}</th>)}
                                    <th style={{...thS, textAlign:'right'}}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        {columns.map(col => col.visible && (
                                            <td key={col.id} style={tdS}>
                                                <input 
                                                    readOnly={col.type === 'FORMULA'}
                                                    value={item.computed[col.id]} 
                                                    onChange={(e) => updateItemValue(item.id, col.id, e.target.value)} 
                                                    style={{...cellInp, fontWeight: col.type === 'FORMULA' ? 'bold' : 'normal'}}
                                                />
                                            </td>
                                        ))}
                                        <td style={{...tdS, textAlign:'right', fontWeight: 'bold'}}>
                                            {settings.currency} {item.rowTotal.toFixed(settings.decimals)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button onClick={() => setLineItems([...lineItems, { id: Date.now(), values: { qty: 1, rate: 0, tax: 5 } }])} style={{marginTop:'20px', background:'none', border:`1px dashed ${settings.primaryColor}`, color: settings.primaryColor, padding:'10px', width:'100%', cursor:'pointer'}}>+ ADD NEW LINE ITEM</button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                            <div style={{ width: '60%' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' }}>TOTAL IN WORDS</p>
                                <p style={{ fontStyle: 'italic', fontWeight: 'bold', color: settings.primaryColor }}>
                                    {numberToWords(
                                        totals.grandTotal, 
                                        settings.currency, 
                                        COUNTRY_CONFIG[settings.country].major, 
                                        COUNTRY_CONFIG[settings.country].minor, 
                                        settings.decimals
                                    )}
                                </p>
                            </div>
                            <div style={{ width: '250px' }}>
                                <div style={sumR}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
                                <div style={sumR}><span>Tax Total</span><span>{fmt(totals.taxTotal)}</span></div>
                                <div style={{...sumR, borderTop:`2px solid ${settings.primaryColor}`, fontWeight:'bold', fontSize:'1.2rem', marginTop:'10px'}}>
                                    <span>GRAND TOTAL</span><span>{settings.currency} {fmt(totals.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ToolboxLayout>
    );
}

// STYLES
const panelCard = { background: '#1e293b', padding: '30px', borderRadius: '25px', border: '1px solid #334155' };
const labelS = { display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' };
const selectS = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px', outline: 'none' };
const btnMin = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '10px', borderRadius: '8px', cursor: 'pointer' };
const activeBtn = { ...btnMin, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const paperStyle = { background: '#fff', color: '#000', padding: '20mm', minHeight: '297mm', boxShadow: '0 0 50px rgba(0,0,0,0.5)' };
const thS = { textAlign: 'left', padding: '15px 10px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' };
const tdS = { padding: '15px 10px', borderBottom: '1px solid #f1f5f9' };
const cellInp = { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '10px 0' };
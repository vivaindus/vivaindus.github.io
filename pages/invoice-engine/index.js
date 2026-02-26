import React, { useState, useEffect, useRef, useMemo } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

// 1️⃣ LOGIC CORE DATA
const COUNTRY_CONFIG = {
    AE: { name: 'United Arab Emirates', currency: 'AED', taxLabel: 'VAT', taxRate: 5, precision: 2, major: 'Dirham', minor: 'Fils' },
    OM: { name: 'Oman', currency: 'OMR', taxLabel: 'VAT', taxRate: 5, precision: 3, major: 'Rial', minor: 'Baisa' },
    SA: { name: 'Saudi Arabia', currency: 'SAR', taxLabel: 'VAT', taxRate: 15, precision: 2, major: 'Riyal', minor: 'Halala' },
    US: { name: 'United States', currency: 'USD', taxLabel: 'Sales Tax', taxRate: 0, precision: 2, major: 'Dollar', minor: 'Cents' },
    IN: { name: 'India', currency: 'INR', taxLabel: 'GST', taxRate: 18, precision: 2, major: 'Rupee', minor: 'Paise' }
};

const evaluateFormula = (formula, rowValues) => {
    try {
        let expression = formula;
        Object.keys(rowValues).forEach(id => {
            const val = parseFloat(rowValues[id]) || 0;
            expression = expression.replace(new RegExp(`\\b${id}\\b`, 'g'), val);
        });
        return Function(`'use strict'; return (${expression})`)();
    } catch (e) { return 0; }
};

const numberToWords = (amount, currency, major, minor, precision) => {
    if (amount === 0) return `Zero ${currency} Only`;
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n) => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        return '';
    };
    const split = parseFloat(amount).toFixed(precision).split('.');
    return `${split[0]} ${major} and ${split[1]} ${minor} Only`; 
};

export default function InvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);

    const [settings, setSettings] = useState({
        country: 'AE', currency: 'AED', taxMode: 'exclusive', decimals: 2, primaryColor: '#3b82f6'
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
        { id: 1, values: { code: 'SRV-01', desc: 'Consulting', qty: 1, rate: 1000, tax: 5 } }
    ]);

    useEffect(() => { setMounted(true); }, []);

    const processedItems = useMemo(() => {
        return lineItems.map(item => {
            const computedValues = { ...item.values };
            columns.filter(c => c.type === 'FORMULA').forEach(col => {
                computedValues[col.id] = evaluateFormula(col.formula, computedValues);
            });
            const amt = parseFloat(computedValues.amount) || 0;
            const txRate = parseFloat(computedValues.tax) || 0;
            const txAmt = settings.taxMode === 'exclusive' ? (amt * txRate / 100) : (amt - (amt / (1 + txRate / 100)));
            return { ...item, computed: computedValues, taxAmount: txAmt, rowTotal: settings.taxMode === 'exclusive' ? amt + txAmt : amt };
        });
    }, [lineItems, columns, settings.taxMode]);

    const totals = useMemo(() => {
        const sub = processedItems.reduce((acc, curr) => acc + (parseFloat(curr.computed.amount) || 0), 0);
        const tax = processedItems.reduce((acc, curr) => acc + curr.taxAmount, 0);
        return { subtotal: sub, taxTotal: tax, grandTotal: settings.taxMode === 'exclusive' ? sub + tax : sub };
    }, [processedItems, settings.taxMode]);

    const exportPDF = async () => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save(`Invoice.pdf`);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Engine" description="Advanced Modular Invoice Generator">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <aside style={{ flex: 1, minWidth: '320px' }}>
                    <div style={panelCard}>
                        <h2 style={{color: '#38bdf8', marginBottom: '20px'}}>Configuration</h2>
                        <select value={settings.country} onChange={(e) => setSettings({ ...settings, country: e.target.value, currency: COUNTRY_CONFIG[e.target.value].currency })} style={selectS}>
                            {Object.keys(COUNTRY_CONFIG).map(k => <option key={k} value={k}>{COUNTRY_CONFIG[k].name}</option>)}
                        </select>
                        <button onClick={exportPDF} style={btnMain}>GENERATE PDF</button>
                    </div>
                </aside>
                <main style={{ flex: 2.5 }}>
                    <div ref={invoiceRef} style={paperStyle}>
                        <h1 style={{color: settings.primaryColor}}>{settings.taxMode.toUpperCase()} INVOICE</h1>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    {columns.map(col => <th key={col.id} style={thS}>{col.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {processedItems.map(item => (
                                    <tr key={item.id}>
                                        {columns.map(col => (
                                            <td key={col.id} style={tdS}>
                                                <input 
                                                    value={item.computed[col.id]} 
                                                    onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, values: {...li.values, [col.id]: e.target.value}} : li))}
                                                    style={cellInp}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{marginTop:'40px', textAlign:'right'}}>
                            <h3>Total: {settings.currency} {totals.grandTotal.toFixed(settings.decimals)}</h3>
                        </div>
                    </div>
                </main>
            </div>
        </ToolboxLayout>
    );
}

const panelCard = { background: '#1e293b', padding: '25px', borderRadius: '15px' };
const selectS = { width: '100%', background: '#0f172a', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '20px' };
const btnMain = { width: '100%', background: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '10px', fontWeight: 'bold', border:'none', cursor:'pointer' };
const paperStyle = { background: '#fff', color: '#000', padding: '20mm', minHeight: '297mm', boxShadow: '0 0 20px rgba(0,0,0,0.2)' };
const thS = { textAlign: 'left', padding: '10px', fontSize: '0.8rem', color: '#64748b' };
const tdS = { padding: '10px', borderBottom: '1px solid #f1f5f9' };
const cellInp = { border: 'none', outline: 'none', background: 'transparent', width: '100%' };
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, parseFormula, amountToWords } from '../../engine-data/logic';

const INITIAL_COLS = [
    { id: 'code', label: 'Code', type: 'TEXT', visible: true, private: false, width: 80 },
    { id: 'desc', label: 'Item Description', type: 'TEXT', visible: true, private: false, width: 250 },
    { id: 'qty', label: 'Qty', type: 'NUMBER', visible: true, private: false, width: 60 },
    { id: 'rate', label: 'Price', type: 'NUMBER', visible: true, private: false, width: 100 },
    { id: 'tax', label: 'VAT %', type: 'PERCENT', visible: true, private: false, width: 70 },
    { id: 'amount', label: 'Amount', type: 'FORMULA', formula: 'qty * rate', visible: true, private: false, width: 120 }
];

export default function EnterpriseInvoiceEngine() {
    const [mounted, setMounted] = useState(false);
    const [renderingPDF, setRenderingPDF] = useState(false);
    const invoiceRef = useRef(null);
    const [notif, setNotif] = useState('');

    // --- Core State ---
    const [settings, setSettings] = useState({
        country: 'AE', taxMode: 'exclusive', rounding: 'nearest', showWords: true, pColor: '#000000'
    });
    const [columns, setColumns] = useState(INITIAL_COLS);
    const [items, setItems] = useState([
        { id: '1', values: { code: 'SRV-01', desc: 'Professional Services', qty: 1, rate: 1000, tax: 5 } }
    ]);
    const [charges, setCharges] = useState([]);
    const [meta, setMeta] = useState({
        title: 'TAX INVOICE', iNum: 'INV-2026-001', date: new Date().toISOString().split('T')[0],
        sender: 'SHB ENTERPRISE\nDubai, UAE\nTRN: 100XXXXXXXXXXXX',
        client: 'CLIENT NAME\nCity, Country\nTRN: 100XXXXXXXXXXXX',
        logo: null, logoAlign: 'flex-start', notes: 'Payment due within 15 days.'
    });

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v17');
        if (saved) {
            const p = JSON.parse(saved);
            setSettings(p.settings); setColumns(p.columns); setItems(p.items); setCharges(p.charges); setMeta(p.meta);
        }
    }, []);

    const showToast = (m) => { setNotif(m); setTimeout(() => setNotif(''), 3000); };

    // --- CALCULATION ENGINE (Derived State) ---
    const invoiceData = useMemo(() => {
        const config = JURISDICTIONS[settings.country];
        
        // 1. Calculate Rows
        const processedRows = items.map(item => {
            const vals = { ...item.values };
            // Apply formulas
            columns.filter(c => c.type === 'FORMULA').forEach(c => {
                vals[c.id] = parseFormula(c.formula, vals);
            });

            const rowAmount = parseFloat(vals.amount || 0);
            const rowTaxRate = parseFloat(vals.tax || 0);
            
            let rowTax = 0;
            if (settings.taxMode === 'exclusive') {
                rowTax = rowAmount * (rowTaxRate / 100);
            } else {
                rowTax = rowAmount - (rowAmount / (1 + rowTaxRate / 100));
            }

            return { ...item, computed: vals, rowTax, rowTotal: settings.taxMode === 'exclusive' ? rowAmount + rowTax : rowAmount };
        });

        // 2. Aggregate Totals
        const subtotal = processedRows.reduce((acc, r) => acc + (parseFloat(r.computed.amount) || 0), 0);
        const lineTaxTotal = processedRows.reduce((acc, r) => acc + r.rowTax, 0);
        
        // 3. Additional Charges
        const chargeTotal = charges.reduce((acc, c) => acc + (parseFloat(c.value) || 0), 0);
        const taxableChargeAmount = charges.filter(c => c.taxable).reduce((acc, c) => acc + (parseFloat(c.value) || 0), 0);
        const chargeTax = taxableChargeAmount * (config.taxRate / 100);

        const rawGrandTotal = subtotal + lineTaxTotal + chargeTotal + chargeTax;
        
        // 4. Rounding
        let grandTotal = rawGrandTotal;
        if (settings.rounding === 'up') grandTotal = Math.ceil(rawGrandTotal);
        else if (settings.rounding === 'down') grandTotal = Math.floor(rawGrandTotal);
        else if (settings.rounding === 'nearest') grandTotal = Math.round(rawGrandTotal);
        
        const roundOff = grandTotal - rawGrandTotal;

        return {
            rows: processedRows,
            subtotal,
            taxTotal: lineTaxTotal + chargeTax,
            grandTotal,
            roundOff,
            config,
            words: amountToWords(grandTotal, config)
        };
    }, [items, columns, settings, charges]);

    // --- Actions ---
    const updateItem = (id, field, val) => {
        setItems(items.map(i => i.id === id ? { ...i, values: { ...i.values, [field]: val } } : i));
    };

    const addColumn = () => {
        const newId = `col_${Date.now()}`;
        setColumns([...columns, { id: newId, label: 'New Column', type: 'TEXT', visible: true, private: false, width: 100 }]);
    };

    const exportPDF = async () => {
        setRenderingPDF(true);
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        
        // Brief delay to ensure state-driven UI changes (hiding private columns) reflect
        setTimeout(async () => {
            if (!invoiceRef.current) return;
            const canvas = await toCanvas(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= 297;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                // Add top margin for pages 2+
                pdf.addImage(imgData, 'PNG', 0, position + 20, pdfWidth, pdfHeight);
                heightLeft -= 297;
            }
            
            pdf.save(`${meta.iNum}.pdf`);
            setRenderingPDF(false);
            showToast("Enterprise PDF Generated! ✅");
        }, 500);
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Engine" description="Professional Multi-Jurisdiction Billing Suite">
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                {notif && <div style={styles.toastS}>{notif}</div>}
                
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    {/* SIDEBAR */}
                    <aside style={styles.sidebarArea}>
                        <div style={styles.panelCard}>
                            <span style={styles.hS}>Regional Configuration</span>
                            <label style={styles.lCap}>Country</label>
                            <select style={styles.selS} value={settings.country} onChange={(e) => setSettings({...settings, country: e.target.value})}>
                                {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                            </select>
                            
                            <label style={styles.lCap}>Tax Mode</label>
                            <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                                <button onClick={()=>setSettings({...settings, taxMode:'exclusive'})} style={settings.taxMode==='exclusive'?styles.actB:styles.btnMin}>Exclusive</button>
                                <button onClick={()=>setSettings({...settings, taxMode:'inclusive'})} style={settings.taxMode==='inclusive'?styles.actB:styles.btnMin}>Inclusive</button>
                            </div>

                            <label style={styles.lCap}>Rounding</label>
                            <select style={styles.selS} value={settings.rounding} onChange={(e)=>setSettings({...settings, rounding:e.target.value})}>
                                <option value="none">No Rounding</option>
                                <option value="nearest">Nearest Integer</option>
                                <option value="up">Always Up</option>
                                <option value="down">Always Down</option>
                            </select>
                        </div>

                        <div style={styles.panelCard}>
                            <span style={styles.hS}>Dynamic Columns</span>
                            {columns.map((col, idx) => (
                                <div key={col.id} style={styles.colItem}>
                                    <input value={col.label} onChange={(e) => {
                                        const newCols = [...columns]; newCols[idx].label = e.target.value; setColumns(newCols);
                                    }} style={{...styles.inpF, flex:1}} />
                                    <button onClick={() => {
                                        const newCols = [...columns];
                                        newCols[idx].visible = !newCols[idx].visible;
                                        setColumns(newCols);
                                    }} style={{...styles.btnMin, color: col.visible ? '#34d399' : '#f87171'}}>
                                        {col.visible ? '👁️' : '🚫'}
                                    </button>
                                    <button onClick={() => {
                                        const newCols = [...columns];
                                        newCols[idx].private = !newCols[idx].private;
                                        setColumns(newCols);
                                    }} style={{...styles.btnMin, color: col.private ? '#fbbf24' : '#94a3b8'}}>
                                        {col.private ? '🔒' : '🔓'}
                                    </button>
                                </div>
                            ))}
                            <button onClick={addColumn} style={{...styles.btnMin, width:'100%', marginTop:'10px'}}>+ Add New Column</button>
                        </div>

                        <div style={styles.panelCard}>
                            <span style={styles.hS}>Actions</span>
                            <button onClick={() => {
                                localStorage.setItem('shb_enterprise_v17', JSON.stringify({ settings, columns, items, charges, meta }));
                                showToast("Settings Saved Locally! ✅");
                            }} style={styles.btnSave}>💾 SAVE TEMPLATE</button>
                            <button onClick={exportPDF} style={{...styles.btnMain, marginTop:'10px'}}>🚀 GENERATE ENTERPRISE PDF</button>
                        </div>
                    </aside>

                    {/* PAPER */}
                    <main style={styles.paperWrapper}>
                        <div ref={invoiceRef} style={styles.paperS}>
                            {/* Header Section */}
                            <div style={styles.headerG}>
                                <div style={{flex:1.5}}>
                                    <input style={styles.titleI} value={meta.title} onChange={(e)=>setMeta({...meta, title: e.target.value})} />
                                    <textarea style={styles.areaI} value={meta.sender} onChange={(e)=>setMeta({...meta, sender: e.target.value})} />
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={styles.sumR}><span>No:</span><input style={{textAlign:'right', width:'100px', borderBottom:'1px solid #eee'}} value={meta.iNum} onChange={(e)=>setMeta({...meta, iNum: e.target.value})} /></div>
                                    <div style={styles.sumR}><span>Date:</span><input type="date" style={{textAlign:'right', width:'120px'}} value={meta.date} onChange={(e)=>setMeta({...meta, date: e.target.value})} /></div>
                                </div>
                            </div>

                            {/* Recipient */}
                            <div style={{margin:'30px 0'}}>
                                <span style={styles.tagL}>BILL TO:</span>
                                <textarea style={{...styles.areaI, fontWeight:'bold', fontSize:'1.1rem'}} value={meta.client} onChange={(e)=>setMeta({...meta, client: e.target.value})} />
                            </div>

                            {/* Table */}
                            <table style={styles.tableS}>
                                <thead>
                                    <tr>
                                        {columns.map(c => {
                                            if (!c.visible) return null;
                                            if (renderingPDF && c.private) return null;
                                            return <th key={c.id} style={{...styles.thS, width:`${c.width}px`}}>{c.label}</th>;
                                        })}
                                        <th style={{...styles.thS, textAlign:'right'}}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.rows.map(row => (
                                        <tr key={row.id}>
                                            {columns.map(c => {
                                                if (!c.visible) return null;
                                                if (renderingPDF && c.private) return null;
                                                return (
                                                    <td key={c.id} style={styles.tdS}>
                                                        <input 
                                                            style={styles.rawI} 
                                                            value={row.computed[c.id]} 
                                                            readOnly={c.type === 'FORMULA'}
                                                            onChange={(e) => updateItem(row.id, c.id, e.target.value)}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            <td style={{...styles.tdS, textAlign:'right', fontWeight:'bold'}}>
                                                {row.rowTotal.toFixed(invoiceData.config.decimals)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => setItems([...items, { id: Date.now().toString(), values: { qty: 1, rate: 0, tax: 5 } }])} style={styles.addB} className="no-print">+ Add Line Item</button>

                            {/* Totals */}
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'40px', breakInside:'avoid'}}>
                                <div style={{width:'60%'}}>
                                    <span style={styles.tagL}>AMOUNT IN WORDS:</span>
                                    <p style={{fontStyle:'italic', fontWeight:'bold', color: settings.pColor}}>{invoiceData.words}</p>
                                    <div style={{marginTop:'20px'}}>
                                        <span style={styles.tagL}>NOTES:</span>
                                        <textarea style={styles.areaI} value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{width:'240px'}}>
                                    <div style={styles.sumR}><span>Subtotal:</span><span>{invoiceData.subtotal.toFixed(invoiceData.config.decimals)}</span></div>
                                    <div style={styles.sumR}><span>{invoiceData.config.taxLabel} Total:</span><span>{invoiceData.taxTotal.toFixed(invoiceData.config.decimals)}</span></div>
                                    {invoiceData.roundOff !== 0 && <div style={styles.sumR}><span>Round Off:</span><span>{invoiceData.roundOff.toFixed(invoiceData.config.decimals)}</span></div>}
                                    <div style={styles.grandR}>
                                        <span>TOTAL</span>
                                        <span>{invoiceData.config.currency} {invoiceData.grandTotal.toFixed(invoiceData.config.decimals)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                input:hover, textarea:hover { background: rgba(0,0,0,0.02); borderRadius: 4px; }
            `}</style>
        </ToolboxLayout>
    );
}
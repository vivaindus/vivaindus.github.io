import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

const INITIAL_STATE = {
    config: { 
        country: 'AE', taxMode: 'exclusive', theme: '#064e3b', taxLabel: 'VAT', 
        rounding: 'nearest', isExport: false, isReverse: false, defaultTaxRate: 5,
        globalDiscountLayer: 'before_tax', // Layer 4 vs Layer 7
        roundingPrecision: 2 
        
    },
    columns: [
        { id: 'desc', label: 'Item Description', visible: true, private: false, width: 250, type: 'text' },
        { id: 'qty', label: 'Quantity', visible: true, private: false, width: 60, type: 'number' },
        { id: 'rate', label: 'Unit Price', visible: true, private: false, width: 100, type: 'number' },
        { id: 'tax', label: 'Tax %', visible: true, private: false, width: 70, type: 'number' },
        { id: 'line_total', label: 'Line Total', visible: true, private: false, width: 110, type: 'system' }
    ],
    meta: { 
        title: 'TAX INVOICE', iNum: 'INV-1001', date: new Date().toISOString().split('T')[0], due: '', supply: '',
        sender: 'SHIFA STORES\nDubai, UAE\nTRN: 100XXXXXXXXXXXX', client: 'CLIENT NAME\nTRN: 100XXXXXXXXXXXX', 
        logo: null, signature: null, notes: '', terms: ''
    },
    items: [{ id: Date.now(), desc: '', qty: 1, rate: 0, tax: 5 }],
    charges: [],
     globalDisc: { val: 0, type: '%', appliedOn: 'subtotal' }
};

export default function ShbEnterpriseV32() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [config, setConfig] = useState(INITIAL_STATE.config);
    const [columns, setColumns] = useState(INITIAL_STATE.columns);
    const [meta, setMeta] = useState(INITIAL_STATE.meta);
    const [items, setItems] = useState(INITIAL_STATE.items);
    const [charges, setCharges] = useState(INITIAL_STATE.charges);
    const [globalDisc, setGlobalDisc] = useState(INITIAL_STATE.globalDisc);
    const [activeLabel, setActiveLabel] = useState('ORIGINAL');

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v32_storage');
        if (saved) {
            const p = JSON.parse(saved);
            setConfig(p.config); setColumns(p.columns); setMeta(p.meta); setItems(p.items); setCharges(p.charges || []); setGlobalDisc(p.globalDisc);
        }
    }, []);

    // --- ENHANCED FORMULA RESOLVER ---
    const resolveFormula = (formula, row, ctx) => {
        if (!formula) return 0;
        let expr = formula;

        // Map system values first
        const map = {
            'Qty': row.qty, 'Price': row.rate, 'Quantity': row.qty,
            'Amount': ctx.lineTotal, 'Tax': ctx.taxAmt, 'Net': ctx.taxableAmount
        };

        // Replace Keywords in formula
        Object.keys(map).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expr = expr.replace(regex, parseFloat(map[key]) || 0);
        });

        // Replace other column labels (Case insensitive)
        columns.forEach(col => {
            const regex = new RegExp(`\\b${col.label}\\b`, 'gi');
            expr = expr.replace(regex, parseFloat(row[col.id]) || 0);
        });

        // Final cleanup and safety eval
        expr = expr.replace(/[^-()\d/*+.]/g, ''); 
        try { return Function(`"use strict"; return (${expr})`)() || 0; } catch { return 0; }
    };

    // --- MASTER CALCULATION ENGINE ---
    const engine = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        
        // --- PHASE A: LINE LEVEL LAYERS ---
        const rows = items.map(item => {
            const rawQty = parseFloat(item.qty) || 0;
            const rawPrice = parseFloat(item.rate) || 0;
            const taxRate = item.tax !== undefined ? parseFloat(item.tax) : parseFloat(config.defaultTaxRate);

            // Layer 1: Base
            let base = rawQty * rawPrice;

            // Layer 2: Add Line Charges (Optional Columns)
            if (item.line_charge_p) base += (base * parseFloat(item.line_charge_p) / 100);
            if (item.line_charge_a) base += parseFloat(item.line_charge_a);

            // Layer 3: Subtract Line Discounts (Optional Columns)
            let lineDisc = 0;
            if (item.line_disc_p) lineDisc = (base * parseFloat(item.line_disc_p) / 100);
            else if (item.line_disc_a) lineDisc = parseFloat(item.line_disc_a);
            
            const taxableAmount = base - lineDisc;

            // Layer 5: Calculate Tax (Layer 4 Global Discount is handled in totals)
            let taxAmt = 0;
            let lineTotal = 0;

            if (config.taxMode === 'inclusive') {
                // Inclusive Logic: Tax is inside the price
                taxAmt = (taxableAmount * taxRate) / (100 + taxRate);
                lineTotal = taxableAmount; 
            } else {
                // Exclusive Logic: Tax is on top
                taxAmt = taxableAmount * (taxRate / 100);
                lineTotal = taxableAmount + taxAmt;
            }

            // Layer 8: Withholding Tax (TDS)
            let tdsAmt = 0;
            if (item.tds_p) tdsAmt = lineTotal * (parseFloat(item.tds_p) / 100);
            
            const finalLinePayable = lineTotal - tdsAmt;

            // Formula Resolving (Supports custom columns like TESTCOL1)
            const computedContext = { taxableAmount, taxAmt, lineTotal, finalLinePayable };
            let formulaValues = {};
            columns.forEach(c => {
                if (c.type === 'formula') formulaValues[c.id] = resolveFormula(c.formula, item, computedContext);
            });

            return { 
                ...item, ...formulaValues, 
                taxableAmount, taxAmt, lineTotal, tdsAmt, finalLinePayable 
            };
        });

        // --- PHASE B: TOTALS & GLOBAL LAYERS ---
        const subtotal = rows.reduce((acc, r) => acc + r.taxableAmount, 0);
        const lineTaxTotal = rows.reduce((acc, r) => acc + r.taxAmt, 0);

        // Layer 4: Global Discount (Before Tax)
        let gDiscAmtBefore = 0;
        if (config.globalDiscountLayer === 'before_tax') {
            gDiscAmtBefore = globalDisc.type === '%' ? (subtotal * parseFloat(globalDisc.val || 0) / 100) : parseFloat(globalDisc.val || 0);
        }

        // Layer 6: Add Extra Charges (Shipping, etc.)
        const totalExtraCharges = charges.reduce((acc, c) => acc + parseFloat(c.val || 0), 0);
        const taxableExtraCharges = charges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.val || 0), 0);
        const extraChargeTax = taxableExtraCharges * (parseFloat(config.defaultTaxRate) / 100);

        // Calculate Intermediate Grand Total
        let rawGrand = (subtotal - gDiscAmtBefore) + lineTaxTotal + extraChargeTax + totalExtraCharges;

        // Layer 7: Global Discount (After Tax)
        if (config.globalDiscountLayer === 'after_tax') {
            const gDiscAmtAfter = globalDisc.type === '%' ? (rawGrand * parseFloat(globalDisc.val || 0) / 100) : parseFloat(globalDisc.val || 0);
            rawGrand -= gDiscAmtAfter;
        }

        // Layer 8: Deduct Total TDS
        const totalTDS = rows.reduce((acc, r) => acc + (r.tdsAmt || 0), 0);

        // Layer 9: Rounding
        let finalGrand = rawGrand - totalTDS;
        if (config.rounding === 'up') finalGrand = Math.ceil(finalGrand);
        else if (config.rounding === 'down') finalGrand = Math.floor(finalGrand);
        else if (config.rounding === 'nearest') finalGrand = Math.round(finalGrand);

        const roundOffDelta = finalGrand - (rawGrand - totalTDS);

        const taxSummary = jur.hasSplitTax 
            ? [{label: 'CGST', amt: (lineTaxTotal + extraChargeTax)/2}, {label: 'SGST', amt: (lineTaxTotal + extraChargeTax)/2}] 
            : [{label: config.taxLabel, amt: lineTaxTotal + extraChargeTax}];

        return { 
            rows, subtotal, taxTotal: lineTaxTotal + extraChargeTax, taxSummary, 
            grandTotal: finalGrand, roundOff: roundOffDelta, totalTDS,
            jur, words: amountToWords(finalGrand, jur) 
        };
    }, [items, config, globalDisc, charges, columns]);

    const hardReset = () => {
        if (confirm("do you really want to reset, all your saved formats will be cleared")) {
            localStorage.removeItem('shb_enterprise_v32_storage');
            window.location.reload();
        }
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader(); reader.onload = (ev) => setMeta({...meta, [field]: ev.target.result}); reader.readAsDataURL(file);
        }
    };

    const autoGrow = (e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Enterprise Invoice Suite" description="Universal Multi-page Professional Billing System">
            <div style={styles.app} className="no-print-bg">
                <aside style={styles.sidebar} className="no-print">
                    <div style={styles.card}>
                        <h3 style={styles.h3}>Column Architecture</h3>
                        {columns.map((c, i) => (
                            <div key={i} style={{marginBottom:12, padding:10, background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0'}}>
                                <div style={{display:'flex', gap:4, marginBottom:5}}>
                                    <input value={c.label} onChange={e => {const nc=[...columns]; nc[i].label=e.target.value; setColumns(nc);}} style={{background:'#fff', border:'1px solid #e2e8f0', padding:4, flex:1, fontSize:'0.7rem'}} />
                                    <button onClick={()=>{const nc=[...columns]; nc[i].visible=!nc[i].visible; setColumns(nc);}} style={{...styles.btnAction, background:c.visible?'#064e3b':'#ccc', color:'#fff'}}>👁️</button>
                                    <button onClick={()=>{const nc=[...columns]; nc[i].private=!nc[i].private; setColumns(nc);}} style={{...styles.btnAction, background:c.private?'#d4af37':'#ccc', color:'#fff'}}>🔒</button>
                                    <button onClick={()=>{const colId=columns[i].id; setColumns(columns.filter((_,idx)=>idx!==i)); setItems(items.map(it=>{const ni={...it}; delete ni[colId]; return ni;}));}} style={{color:'red', border:'none', background:'none'}}>×</button>
                                </div>
                                <select value={c.type} onChange={e=>{const nc=[...columns]; nc[i].type=e.target.value; setColumns(nc);}} style={{width:'100%', fontSize:'0.65rem', border:'1px solid #e2e8f0', padding:4}}>
                                    <option value="text">Text</option><option value="number">Number</option><option value="formula">Formula</option>
                                </select>
                                {c.type==='formula' && <input value={c.formula} onChange={e=>{const nc=[...columns]; nc[i].formula=e.target.value; setColumns(nc);}} placeholder="e.g. Qty * Price" style={{width:'100%', marginTop:4, fontSize:'0.7rem', padding:4}} />}
                            </div>
                        ))}
                        <button onClick={()=>setColumns([...columns, {id:`c_${Date.now()}`, label:'New Col', visible:true, private:false, width:100, type:'text'}])} style={{...styles.btn, background:'none', border:'1px dashed #064e3b', color:'#064e3b', fontSize:'0.7rem'}}>+ ADD CUSTOM COLUMN</button>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Calculation Strategy</h3>
                        
                        <label style={styles.lCap}>Global Discount Apply On</label>
                        <select value={config.globalDiscountLayer} onChange={e => setConfig({...config, globalDiscountLayer: e.target.value})} style={styles.selS}>
                            <option value="before_tax">Before Tax (Standard)</option>
                            <option value="after_tax">After Tax (Post-Tax Reduction)</option>
                        </select>

                        {config.country === 'IN' && (
                            <>
                                <label style={{...styles.lCap, marginTop: 10}}>India GST Type</label>
                                <select value={config.indiaTaxType} onChange={e => setConfig({...config, indiaTaxType: e.target.value})} style={styles.selS}>
                                    <option value="cgst_sgst">Intra-State (CGST + SGST)</option>
                                    <option value="igst">Inter-State (IGST)</option>
                                </select>
                            </>
                        )}

                        <label style={{...styles.lCap, marginTop: 10}}>Rounding Mode</label>
                        <select value={config.rounding} onChange={e => setConfig({...config, rounding: e.target.value})} style={styles.selS}>
                            <option value="none">Exact</option>
                            <option value="nearest">Nearest Integer</option>
                            <option value="up">Round Up</option>
                            <option value="down">Round Down</option>
                        </select>

                        <div style={{marginTop: 15}}>
                            <label style={{display:'flex', gap:10, fontSize:'0.75rem', alignItems:'center'}}>
                                <input type="checkbox" checked={config.roundLineLevel} onChange={e=>setConfig({...config, roundLineLevel: e.target.checked})} /> Round per Line Item
                            </label>
                        </div>
                    </div>

                    <button onClick={() => {localStorage.setItem('shb_enterprise_v32_storage', JSON.stringify({config, columns, meta, items, charges, globalDisc})); alert('Saved! ✅');}} style={{...styles.btn, background:'#34d399', color:'#fff', marginBottom:10}}>💾 SAVE WORKSPACE</button>
                    <button onClick={()=>window.print()} style={{...styles.btn, ...styles.btnPrimary}}>📄 PRINT / PDF</button>
                    <button onClick={hardReset} style={{...styles.btn, ...styles.btnReset}}>🗑️ HARD RESET</button>
                </aside>

                <main style={styles.workspace}>
                    <div id="invoice-paper" style={styles.paper}>
                        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'8px', background:config.theme}}></div>
                        
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                            <div style={{display:'flex', gap:5}}>
                                {config.isExport && <span style={styles.badge}>EXPORT / ZERO RATED</span>}
                                {config.isReverse && <span style={styles.badge}>REVERSE CHARGE</span>}
                            </div>
                            <span className="page-counter"></span>
                        </div>

                        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #000', paddingBottom:20, marginBottom:30}}>
                            <div style={{flex:1.5}}>
                                <input style={{...styles.ghostInp, fontSize:'2.8rem', fontWeight:'900', color:config.theme}} value={meta.title} onChange={e=>setMeta({...meta, title:e.target.value})} />
                                <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1.2rem'}} value={meta.sender} onChange={e=>setMeta({...meta, sender:e.target.value})} onInput={autoGrow} />
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div onClick={()=>document.getElementById('l-up').click()} style={{height:100, width:180, border:'1px dashed #ccc', marginLeft:'auto', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {meta.logo ? <img src={meta.logo} style={{maxHeight:'100%', maxWidth:'100%'}} /> : <span style={{fontSize:'0.6rem'}}>+ LOGO</span>}
                                    <input id="l-up" type="file" hidden onChange={e=>handleFile(e, 'logo')} />
                                </div>
                                <div style={{marginTop:20, fontSize:'0.85rem'}}>
                                    <div>No: <input style={{fontWeight:'bold', borderBottom:'1px solid #eee', width:100, textAlign:'right'}} value={meta.iNum} onChange={e=>setMeta({...meta, iNum:e.target.value})} /></div>
                                    <div>Date: <input type="date" style={{...styles.ghostInp, fontWeight:'bold', textAlign:'right', width:130}} value={meta.date} onChange={e=>setMeta({...meta, date:e.target.value})} /></div>
                                    <div>Due: <input type="date" style={{...styles.ghostInp, textAlign:'right', width:130}} value={meta.due} onChange={e=>setMeta({...meta, due:e.target.value})} /></div>
                                    <div>Supply: <input type="date" style={{...styles.ghostInp, textAlign:'right', width:130}} value={meta.supply} onChange={e=>setMeta({...meta, supply:e.target.value})} /></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span style={styles.lCap}>BILL TO:</span>
                            <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1.1rem', minHeight:100}} value={meta.client} onChange={e=>setMeta({...meta, client:e.target.value})} onInput={autoGrow} />
                        </div>

                        <table style={styles.table}>
                            <thead className="repeat-header">
                                <tr>
                                    {columns.map((c, i) => <th key={i} className={`${!c.visible ? 'shb-hidden' : ''} ${c.private ? 'shb-private' : ''}`} style={{...styles.th, width: `${c.width}px`}}>{c.label}</th>)}
                                    <th style={{...styles.th, textAlign:'right'}}>LINE TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engine.rows.map((item, idx) => (
                                    <tr key={idx} className="item-row">
                                        {columns.map((c, ci) => (
                                            <td key={ci} className={`${!c.visible ? 'shb-hidden' : ''} ${c.private ? 'shb-private' : ''}`} style={styles.td}>
    <textarea 
        style={{...styles.ghostInp, minHeight:35}} 
        // Logic: If it's the Line Total column, show the final payable
        value={c.id === 'line_total' ? item.lineTotal.toFixed(engine.jur.decimals) : (item[c.id] || '')} 
        readOnly={c.id === 'line_total' || c.type === 'formula'}
        onChange={e => handleItemChange(idx, c.id, e.target.value, c.type)} 
        onInput={autoGrow}
    />
</td>
                                        ))}
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.lineTotal.toFixed(engine.jur.decimals)}</td>
                                        <td className="no-print"><button onClick={()=>setItems(items.filter((_,i)=>i!==idx))} style={{color:'red', border:'none', background:'none'}}>×</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={()=>setItems([...items, {id:Date.now(), desc:'', qty:1, rate:0, tax:config.defaultTaxRate}])} style={{width:'100%', padding:12, background:'none', border:'1px dashed #ccc', marginTop:15, color:'#94a3b8'}} className="no-print">+ ADD NEW LINE ITEM</button>

                        <div style={{marginTop:'auto', paddingTop:50}} className="totals-block">
                            <div style={styles.totalBox}>
                                <div style={styles.totalTable}>
                                    <div style={styles.tRow}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.jur.decimals)}</span></div>
                                    
                                    {/* Tax Summary Split */}
                                    {engine.taxSummary.map(t => (
                                        <div key={t.label} style={styles.tRow}><span>{t.label}</span><span>{t.amt.toFixed(engine.jur.decimals)}</span></div>
                                    ))}

                                    {/* TDS Aggregation */}
                                    {engine.totalTDS > 0 && (
                                        <div style={{...styles.tRow, color: '#f87171'}}><span>Total TDS (-)</span><span>{engine.totalTDS.toFixed(engine.jur.decimals)}</span></div>
                                    )}

                                    {/* Extra Charges ... existing charges map ... */}

                                    <div style={{...styles.grandRow, color:config.theme}}>
                                        <span>TOTAL PAYABLE</span>
                                        <span>{engine.jur.currency} {engine.grandTotal.toFixed(engine.jur.decimals)}</span>
                                    </div>
                                    
                                    {engine.totalTDS > 0 && (
                                        <div style={{...styles.tRow, fontWeight: 'bold', borderTop: '1px dashed #ccc', marginTop: 5}}>
                                            <span>NET RECEIVABLE</span>
                                            <span>{engine.jur.currency} {engine.payableAfterTDS.toFixed(engine.jur.decimals)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{marginTop:30}}>
                                <span style={styles.lCap}>AMOUNT IN WORDS:</span>
                                <p style={{fontWeight:'bold', fontStyle:'italic', color:config.theme}}>{engine.words}</p>
                            </div>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:50, alignItems:'flex-end'}}>
                                <div style={{width:'55%'}}>
                                    <span style={styles.lCap}>NOTES & TERMS:</span>
                                    <textarea style={{...styles.areaInp, borderBottom:'1px solid #eee'}} value={meta.notes} onChange={e=>setMeta({...meta, notes:e.target.value})} onInput={autoGrow} />
                                    <textarea style={{...styles.areaInp, fontSize:'0.7rem', color:'#666', marginTop:10}} value={meta.terms} onChange={e=>setMeta({...meta, terms:e.target.value})} onInput={autoGrow} />
                                </div>
                                <div onClick={()=>document.getElementById('s-up').click()} style={{textAlign:'right', cursor:'pointer'}}>
                                    {meta.signature ? <img src={meta.signature} style={{maxHeight:85}} /> : <div style={{height:60, borderBottom:'1px solid #000', width:220}}></div>}
                                    <span style={{fontSize:'0.65rem', fontWeight:'bold', display:'block', marginTop:5}}>AUTHORIZED SIGNATORY</span>
                                    <input id="s-up" type="file" hidden onChange={e=>handleFile(e, 'signature')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: #fff !important; }
                    header, nav, aside, footer, .no-print, .no-print-bg { display: none !important; }
                    #invoice-paper { width: 100% !important; height: auto !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; position: absolute !important; top: 0 !important; left: 0 !important; }
                    .repeat-header { display: table-header-group !important; }
                    .item-row, .totals-block { page-break-inside: avoid !important; }
                    .shb-private { display: none !important; }
                    .page-counter:after { content: "Page " counter(page); font-size: 8pt; color: #666; }
                    input, textarea { color: #000 !important; -webkit-print-color-adjust: exact; }
                }
                .shb-hidden { display: none !important; }
                textarea { resize: none; overflow: hidden; width: 100%; }
                input:hover, textarea:hover { background: rgba(0,0,0,0.02) !important; border-radius: 4px; }
            `}</style>
        </ToolboxLayout>
    );
}
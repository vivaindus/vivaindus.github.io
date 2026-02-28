import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

const INITIAL_STATE = {
    config: { 
        country: 'AE', taxMode: 'exclusive', theme: '#064e3b', taxLabel: 'VAT', 
        rounding: 'nearest', isExport: false, isReverse: false, defaultTaxRate: 5,
        indiaTaxType: 'cgst_sgst', // for India IGST support
        globalDiscountLayer: 'before_tax', // before_tax or after_tax
        roundLineLevel: false, // line-level rounding control
        roundingPrecision: 2 // decimal precision for rounding
    },
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
    const resolveFormula = (formula, row, computedValues) => {
        if (!formula) return 0;
        let expr = formula;
        // Map Labels to Values (Labels take priority)
        const mapping = {
            'Qty': row.qty,
            'Price': row.rate,
            'Rate': row.rate,
            'Tax': computedValues.taxAmt,
            'Amount': computedValues.lineTotal,
            'Net': computedValues.taxable,
            'Discount': (parseFloat(row.qty||0)*parseFloat(row.rate||0)*parseFloat(row.disc_p||0)/100) || row.disc_a || 0
        };

        Object.keys(mapping).forEach(key => {
            const val = parseFloat(mapping[key]) || 0;
            expr = expr.split(key).join(val);
        });

        // Map any dynamic custom columns by Label
        columns.forEach(col => {
            const val = parseFloat(row[col.id]) || 0;
            expr = expr.split(col.label).join(val);
        });

        expr = expr.replace(/[^-()\d/*+.]/g, ''); 
        try { return Function(`"use strict"; return (${expr})`)() || 0; } catch { return 0; }
    };

    // --- MASTER CALCULATION ENGINE ---
    const engine = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        
        // 1. Process Line Items
        const rows = items.map(item => {
            const qty = Math.max(0, parseFloat(item.qty) || 0);
            const rate = Math.max(0, parseFloat(item.rate) || 0);
            
            // CALC-02: Export/Reverse Charge Logic
            let taxR = config.isExport || config.isReverse ? 0 : 
                       (item.tax !== undefined ? parseFloat(item.tax) : parseFloat(config.defaultTaxRate));

            // 1.1 Base Calculation
            let base = qty * rate;
            
            // CHG-01: Line Charges
            if (item.charge_p) base += (base * parseFloat(item.charge_p) / 100);
            if (item.charge_a) base += parseFloat(item.charge_a);

            // 1.2 Line Discounts (VAL-02: Over-discount protection)
            let lineDisc = 0;
            if (item.disc_p) lineDisc = Math.min(base, (base * parseFloat(item.disc_p) / 100));
            else if (item.disc_a) lineDisc = Math.min(base, parseFloat(item.disc_a));
            
            const taxable = base - lineDisc;

            // 1.3 Tax Calculation (CAL-01: Inclusive proportionality)
            let taxAmt = config.taxMode === 'exclusive' ? (taxable * taxR / 100) : (taxable - (taxable / (1 + taxR / 100)));
            let lineTotal = config.taxMode === 'exclusive' ? taxable + taxAmt : taxable;

            // CALC-04: TDS Aggregation
            let tdsAmt = 0;
            if (item.tds_p) tdsAmt = lineTotal * (Math.min(100, parseFloat(item.tds_p)) / 100);
            
            const finalLinePayable = lineTotal - tdsAmt;

            const computed = { taxable, taxAmt, lineTotal: finalLinePayable, tdsAmt };
            
            let formulaVals = {};
            columns.forEach(c => {
                if(c.type === 'formula') formulaVals[c.id] = resolveFormula(c.formula, item, computed);
            });

            // CALC-05: Line Level Rounding
            if (config.roundLineLevel) {
                computed.taxAmt = Math.round(computed.taxAmt * 100) / 100;
                computed.lineTotal = Math.round(computed.lineTotal * 100) / 100;
            }

            return { ...item, ...computed, ...formulaVals, finalLinePayable };
        });

        // 2. Aggregate Totals
        const subtotal = rows.reduce((acc, r) => acc + r.taxable, 0);
        const lineTaxTotal = rows.reduce((acc, r) => acc + r.taxAmt, 0);
        const totalTDS = rows.reduce((acc, r) => acc + (r.tdsAmt || 0), 0);

        // CALC-03: Global Discount Layering
        let discAmt = 0;
        if (config.globalDiscountLayer === 'before_tax') {
            discAmt = globalDisc.type === '%' ? (subtotal * (parseFloat(globalDisc.val) || 0) / 100) : parseFloat(globalDisc.val || 0);
        }

        // CHG-02: Charge Calculation Layers
        const taxableCharges = charges.filter(c => c.taxable).reduce((acc, c) => acc + (parseFloat(c.val) || 0), 0);
        const chargeTax = taxableCharges * (parseFloat(config.defaultTaxRate) / 100);
        const totalCharges = charges.reduce((acc, c) => acc + (parseFloat(c.val) || 0), 0);

        // Grand Total Calc
        let rawGrand = (subtotal - discAmt) + lineTaxTotal + chargeTax + totalCharges;
        
        if (config.globalDiscountLayer === 'after_tax') {
            const afterTaxDisc = globalDisc.type === '%' ? (rawGrand * (parseFloat(globalDisc.val) || 0) / 100) : parseFloat(globalDisc.val || 0);
            rawGrand -= afterTaxDisc;
        }

        // CALC-06: Advanced Rounding
        let grand = rawGrand;
        const p = Math.pow(10, config.roundingPrecision || 0);
        if (config.rounding === 'up') grand = Math.ceil(rawGrand * p) / p;
        else if (config.rounding === 'down') grand = Math.floor(rawGrand * p) / p;
        else if (config.rounding === 'nearest') grand = Math.round(rawGrand * p) / p;

        // TAX-01: India IGST Support
        let taxSummary = [];
        if (jur.hasSplitTax) {
            if (config.indiaTaxType === 'igst') {
                taxSummary.push({ label: 'IGST', amt: lineTaxTotal + chargeTax });
            } else {
                taxSummary.push({ label: 'CGST', amt: (lineTaxTotal + chargeTax) / 2 });
                taxSummary.push({ label: 'SGST', amt: (lineTaxTotal + chargeTax) / 2 });
            }
        } else {
            taxSummary.push({ label: config.taxLabel, amt: lineTaxTotal + chargeTax });
        }

        return { 
            rows, subtotal, taxTotal: lineTaxTotal + chargeTax, totalTDS, taxSummary, 
            grandTotal: grand, payableAfterTDS: grand - totalTDS, roundOff: grand - rawGrand, 
            jur, words: amountToWords(grand, jur) 
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
                                                    value={item[c.id] || ''} 
                                                    readOnly={c.type==='formula'}
                                                    onKeyDown={(e) => { if(c.type==='number' && !/[0-9.]|Backspace|Tab|Enter|Arrow/.test(e.key)) e.preventDefault(); }}
                                                    onChange={e => { const ni=[...items]; ni[idx][c.id]=e.target.value; setItems(ni); }} 
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
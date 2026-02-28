import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

const INITIAL_STATE = {
    config: { country: 'AE', taxMode: 'exclusive', theme: '#064e3b', taxLabel: 'VAT', rounding: 'nearest', isExport: false, isReverse: false, defaultTaxRate: 5 },
    columns: [
        { id: 'desc', label: 'Description', visible: true, private: false, width: 250, type: 'text' },
        { id: 'qty', label: 'Qty', visible: true, private: false, width: 60, type: 'number' },
        { id: 'rate', label: 'Price', visible: true, private: false, width: 100, type: 'number' },
        { id: 'tax', label: 'Tax %', visible: true, private: false, width: 70, type: 'number' }
    ],
    meta: { 
        title: 'TAX INVOICE', iNum: 'INV-1001', date: new Date().toISOString().split('T')[0], due: '', supply: '',
        sender: 'SHIFA STORES\nDubai, UAE\nTRN: 100XXXXXXXXXXXX', client: 'CLIENT NAME\nTRN: 100XXXXXXXXXXXX', 
        logo: null, signature: null, notes: '', terms: ''
    },
    items: [{ id: Date.now(), desc: '', qty: 1, rate: 0, tax: 5 }],
    charges: [],
    globalDisc: { val: 0, type: '%' }
};

export default function EnterpriseInvoiceSaaS() {
    const [mounted, setMounted] = useState(false);
    const invoiceRef = useRef(null);
    const [config, setConfig] = useState(INITIAL_STATE.config);
    const [columns, setColumns] = useState(INITIAL_STATE.columns);
    const [meta, setMeta] = useState(INITIAL_STATE.meta);
    const [items, setItems] = useState(INITIAL_STATE.items);
    const [charges, setCharges] = useState(INITIAL_STATE.charges);
    const [globalDisc, setGlobalDisc] = useState(INITIAL_STATE.globalDisc);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v28_final');
        if (saved) {
            const p = JSON.parse(saved);
            setConfig(p.config); setColumns(p.columns); setMeta(p.meta); setItems(p.items); setCharges(p.charges || []); setGlobalDisc(p.globalDisc);
        }
    }, []);

    // --- FORMULA RESOLVER ---
    const resolveFormula = (formula, row) => {
        if (!formula) return 0;
        let expr = formula;
        [...columns].sort((a,b) => b.label.length - a.label.length).forEach(col => {
            const val = parseFloat(row[col.id]) || 0;
            expr = expr.split(col.label).join(val);
        });
        expr = expr.replace(/[^-()\d/*+.]/g, ''); // Safety sanitize
        try { return Function(`"use strict"; return (${expr})`)() || 0; } catch { return 0; }
    };

    // --- CALCULATION ENGINE ---
    const engine = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        const rows = items.map(item => {
            let comp = { ...item };
            columns.forEach(c => { if(c.type==='formula') comp[c.id] = resolveFormula(c.formula, item); });
            const base = (parseFloat(comp.qty) || 0) * (parseFloat(comp.rate) || 0);
            const taxR = comp.tax !== undefined ? parseFloat(comp.tax) : parseFloat(config.defaultTaxRate);
            const tax = config.taxMode === 'exclusive' ? (base * taxR / 100) : (base - (base / (1 + taxR / 100)));
            return { ...comp, lineBase: base, lineTax: tax, lineTotal: config.taxMode === 'exclusive' ? base + tax : base };
        });

        const subtotal = rows.reduce((a, b) => a + b.lineBase, 0);
        const totalLineTax = rows.reduce((a, b) => a + b.lineTax, 0);
        const discAmt = globalDisc.type === '%' ? (subtotal * (parseFloat(globalDisc.val) || 0) / 100) : parseFloat(globalDisc.val || 0);
        
        const discountedSubtotal = subtotal - discAmt;
        const taxableChargeVal = charges.filter(c => c.taxable).reduce((a, b) => a + parseFloat(b.val || 0), 0);
        const chargeTax = taxableChargeVal * (config.defaultTaxRate / 100);
        
        const rawGrand = discountedSubtotal + totalLineTax + chargeTax + charges.reduce((a, b) => a + parseFloat(b.val || 0), 0);
        let grand = rawGrand;
        if (config.rounding === 'up') grand = Math.ceil(rawGrand);
        else if (config.rounding === 'down') grand = Math.floor(rawGrand);
        else if (config.rounding === 'nearest') grand = Math.round(rawGrand);

        const taxSummary = jur.hasSplitTax 
            ? [{label: 'CGST', amt: (totalLineTax+chargeTax)/2}, {label: 'SGST', amt: (totalLineTax+chargeTax)/2}] 
            : [{label: config.taxLabel, amt: totalLineTax + chargeTax}];

        return { rows, subtotal, taxTotal: totalLineTax + chargeTax, taxSummary, grandTotal: grand, roundOff: grand - rawGrand, jur, words: amountToWords(grand, jur) };
    }, [items, config, globalDisc, charges, columns]);

    const handleHardReset = () => {
        if (confirm("Reset everything? Your saved settings and columns will be lost.")) {
            localStorage.removeItem('shb_enterprise_v28_final');
            window.location.reload();
        }
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const r = new FileReader(); r.onload = (ev) => setMeta({...meta, [field]: ev.target.result}); r.readAsDataURL(file);
        }
    };

    const autoGrow = (e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Master Invoice Engine" description="Professional Enterprise Billing Suite">
            <div style={styles.app} className="no-print-bg">
                <aside style={styles.sidebar} className="no-print">
                    <div style={styles.card}>
                        <h3 style={styles.h3}>Tax Configuration</h3>
                        <label style={styles.lCap}>Default Rate (%)</label>
                        <input type="number" value={config.defaultTaxRate} onChange={e=>setConfig({...config, defaultTaxRate: e.target.value})} style={{width:'100%', padding:8, background:'#0f172a', color:'#fff', border:'1px solid #334155', borderRadius:6}} />
                        <label style={{...styles.lCap, marginTop:10}}>Tax Label</label>
                        <input value={config.taxLabel} onChange={e=>setConfig({...config, taxLabel: e.target.value})} style={{width:'100%', padding:8, background:'#0f172a', color:'#fff', border:'1px solid #334155', borderRadius:6}} />
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Advanced Column Engine</h3>
                        {columns.map((c, i) => (
                            <div key={i} style={{marginBottom:10, padding:10, background:'#1e293b', borderRadius:8}}>
                                <div style={{display:'flex', gap:4, marginBottom:5}}>
                                    <input value={c.label} onChange={e => {const nc=[...columns]; nc[i].label=e.target.value; setColumns(nc);}} style={{background:'#0f172a', color:'#fff', border:'1px solid #334155', padding:4, flex:1, fontSize:'0.7rem'}} />
                                    <button onClick={()=>{const nc=[...columns]; nc[i].visible=!nc[i].visible; setColumns(nc);}} style={{background:c.visible?'#34d399':'#475569', border:'none', color:'#fff', width:24, borderRadius:4}}>👁️</button>
                                    <button onClick={()=>{const nc=[...columns]; nc[i].private=!nc[i].private; setColumns(nc);}} style={{background:c.private?'#fbbf24':'#475569', border:'none', color:'#fff', width:24, borderRadius:4}}>🔒</button>
                                    <button onClick={()=>{const colId=columns[i].id; setColumns(columns.filter((_,idx)=>idx!==i)); setItems(items.map(it=>{const ni={...it}; delete ni[colId]; return ni;}));}} style={{color:'#f87171', background:'none', border:'none'}}>×</button>
                                </div>
                                <select value={c.type} onChange={e=>{const nc=[...columns]; nc[i].type=e.target.value; setColumns(nc);}} style={{width:'100%', background:'#0f172a', color:'#fff', fontSize:'0.65rem', border:'1px solid #334155'}}>
                                    <option value="text">Text</option><option value="number">Number</option><option value="formula">Formula</option>
                                </select>
                                {c.type==='formula' && <input value={c.formula} onChange={e=>{const nc=[...columns]; nc[i].formula=e.target.value; setColumns(nc);}} placeholder="e.g. Qty * Price" style={{width:'100%', marginTop:4, background:'#0f172a', color:'#38bdf8', fontSize:'0.7rem'}} />}
                            </div>
                        ))}
                        <button onClick={()=>setColumns([...columns, {id:`c_${Date.now()}`, label:'New Col', visible:true, private:false, width:100, type:'text'}])} style={{...styles.btn, background:'none', border:'1px dashed #334155', color:'#38bdf8', fontSize:'0.7rem'}}>+ ADD COLUMN</button>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>System Operations</h3>
                        <button onClick={() => {localStorage.setItem('shb_enterprise_v28_final', JSON.stringify({config, columns, meta, items, charges, globalDisc})); alert('Workspace Persistent! ✅');}} style={{...styles.btn, background:'#34d399', color:'#0f172a', marginBottom:10}}>💾 SAVE WORKSPACE</button>
                        <button onClick={()=>window.print()} style={{...styles.btn, ...styles.btnPrimary}}>📄 PRINT / PDF</button>
                        <button onClick={handleHardReset} style={{...styles.btn, ...styles.btnReset}}>🗑️ HARD RESET</button>
                    </div>
                </aside>

                <main style={styles.workspace}>
                    <div id="invoice-doc" style={styles.paper}>
                        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'8px', background:config.theme}}></div>
                        
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                            <div style={{display:'flex', gap:5}}>
                                {config.isExport && <span className="shb-badge">EXPORT / ZERO RATED</span>}
                                {config.isReverse && <span className="shb-badge">REVERSE CHARGE</span>}
                            </div>
                            <span className="shb-page-counter"></span>
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
                                </div>
                            </div>
                        </div>

                        <div style={{marginBottom:35}}>
                            <span style={styles.lCap}>BILL TO:</span>
                            <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1.1rem', minHeight:120}} value={meta.client} onChange={e=>setMeta({...meta, client:e.target.value})} onInput={autoGrow} />
                        </div>

                        <table style={styles.table}>
                            <thead className="shb-repeat-header">
                                <tr>
                                    {columns.map((c, i) => <th key={i} className={`${!c.visible ? 'shb-hidden' : ''} ${c.private ? 'shb-private' : ''}`} style={{...styles.th, width: `${c.width}px`}}>{c.label}</th>)}
                                    <th style={{...styles.th, textAlign:'right'}}>LINE TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engine.rows.map((item, idx) => (
                                    <tr key={idx} className="shb-item-row">
                                        {columns.map((c, ci) => (
                                            <td key={ci} className={`${!c.visible ? 'shb-hidden' : ''} ${c.private ? 'shb-private' : ''}`} style={styles.td}>
                                                <textarea 
                                                    style={{...styles.ghostInp, minHeight:30}} 
                                                    value={item[c.id] || ''} 
                                                    readOnly={c.type==='formula'}
                                                    onChange={e => { const ni=[...items]; ni[idx][c.id]=e.target.value; setItems(ni); }} 
                                                    onInput={autoGrow}
                                                />
                                            </td>
                                        ))}
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.lineTotal.toFixed(engine.jur.decimals)}</td>
                                        <td className="no-print" style={{width:20, border:'none'}}><button onClick={()=>setItems(items.filter((_,i)=>i!==idx))} style={{color:'red', border:'none', background:'none'}}>×</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={()=>setItems([...items, {id:Date.now(), desc:'', qty:1, rate:0, tax:config.defaultTaxRate}])} style={{width:'100%', padding:10, background:'none', border:'1px dashed #ccc', marginTop:15, color:'#94a3b8'}} className="no-print">+ ADD ITEM</button>

                        <div style={{marginTop:'auto', paddingTop:50}} className="shb-totals-container">
                            <div style={styles.totalBox}>
                                <div style={styles.totalTable}>
                                    <div style={styles.tRow}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.jur.decimals)}</span></div>
                                    {engine.taxSummary.map(t => <div key={t.label} style={styles.tRow}><span>{t.label} Total</span><span>{t.amt.toFixed(engine.jur.decimals)}</span></div>)}
                                    <div style={styles.tRow}><span>Discount</span><div style={{display:'flex', gap:5}}><input type="number" style={{width:50, textAlign:'right'}} value={globalDisc.val} onChange={e=>setGlobalDisc({...globalDisc, val:e.target.value})} /><select value={globalDisc.type} onChange={e=>setGlobalDisc({...globalDisc, type:e.target.value})}><option>%</option><option>Fixed</option></select></div></div>
                                    
                                    {charges.map((c, i) => (
                                        <div key={i} style={styles.tRow}>
                                            <input value={c.label} onChange={e => {const nc=[...charges]; nc[i].label=e.target.value; setCharges(nc);}} style={{width:100, border:'none'}} />
                                            <div style={{display:'flex', alignItems:'center', gap:5}}>
                                                <input type="number" value={c.val} onChange={e => {const nc=[...charges]; nc[i].val=e.target.value; setCharges(nc);}} style={{width:60, textAlign:'right'}} />
                                                <button className="no-print" onClick={()=>setCharges(charges.filter((_,idx)=>idx!==i))} style={{color:'red', background:'none', border:'none'}}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="no-print" onClick={()=>setCharges([...charges, {label:'Extra Charge', val:0, taxable:false}])} style={{fontSize:'0.6rem', color:config.theme, background:'none', border:'none', float:'right'}}>+ Add Charge</button>

                                    {engine.roundOff !== 0 && <div style={styles.tRow}><span style={{fontStyle:'italic'}}>Rounding Adj.</span><span>{engine.roundOff.toFixed(engine.jur.decimals)}</span></div>}
                                    <div style={{...styles.grandRow, color:config.theme}}>
                                        <span>GRAND TOTAL</span><span>{engine.jur.currency} {engine.grandTotal.toFixed(engine.jur.decimals)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{marginTop:30}}>
                                <span style={styles.lCap}>AMOUNT IN WORDS:</span>
                                <p style={{fontWeight:'bold', fontStyle:'italic'}}>{engine.words}</p>
                            </div>

                            <div style={{display:'flex', justifyContent:'space-between', marginTop:50, alignItems:'flex-end'}}>
                                <div style={{width:'55%'}}>
                                    <span style={styles.lCap}>NOTES & TERMS:</span>
                                    <textarea style={{...styles.areaInp, borderBottom:'1px solid #eee'}} value={meta.notes} onChange={e=>setMeta({...meta, notes:e.target.value})} onInput={autoGrow} />
                                    <textarea style={{...styles.areaInp, fontSize:'0.7rem', color:'#666', marginTop:10}} value={meta.terms} onChange={e=>setMeta({...meta, terms:e.target.value})} onInput={autoGrow} />
                                </div>
                                <div onClick={()=>document.getElementById('s-up').click()} style={{textAlign:'right', cursor:'pointer'}}>
                                    {meta.signature ? <img src={meta.signature} style={{maxHeight:80}} /> : <div style={{height:60, borderBottom:'1px solid #000', width:200}}></div>}
                                    <span style={{fontSize:'0.65rem', fontWeight:'bold', display:'block'}}>AUTHORIZED SIGNATORY</span>
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
                    body { background: #fff !important; margin: 0; padding: 0; }
                    .no-print, .no-print-bg { display: none !important; }
                    #invoice-doc { width: 100% !important; height: auto !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; }
                    .shb-repeat-header { display: table-header-group !important; }
                    .shb-item-row, .shb-totals-container { page-break-inside: avoid !important; }
                    .shb-page-counter:after { content: "Page " counter(page); font-size: 8pt; color: #666; }
                    .shb-private { display: none !important; }
                    input, textarea { color: #000 !important; }
                }
                .shb-hidden { display: none !important; }
                textarea { resize: none; overflow: hidden; width: 100%; }
                input:hover, textarea:hover { background: rgba(0,0,0,0.02) !important; border-radius: 4px; }
                .shb-badge { font-size: 0.6rem; background: #000; color:#fff; padding: 4px 10px; border: 1px solid #000; font-weight: 900; }
            `}</style>
        </ToolboxLayout>
    );
}
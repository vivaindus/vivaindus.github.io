import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';
import { styles } from '../../engine-data/styles';
import { JURISDICTIONS, amountToWords } from '../../engine-data/logic';

const INITIAL_STATE = {
    config: { country: 'AE', taxMode: 'exclusive', theme: '#064e3b', taxLabel: 'VAT', rounding: 'nearest', isExport: false, isReverse: false, decimals: 2 },
    columns: [
        { id: 'desc', label: 'Item Description', visible: true, private: false, width: 250 },
        { id: 'qty', label: 'Qty', visible: true, private: false, width: 60 },
        { id: 'rate', label: 'Price', visible: true, private: false, width: 100 },
        { id: 'tax', label: 'Tax %', visible: true, private: false, width: 70 }
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
    const [config, setConfig] = useState(INITIAL_STATE.config);
    const [columns, setColumns] = useState(INITIAL_STATE.columns);
    const [meta, setMeta] = useState(INITIAL_STATE.meta);
    const [items, setItems] = useState(INITIAL_STATE.items);
    const [charges, setCharges] = useState(INITIAL_STATE.charges);
    const [globalDisc, setGlobalDisc] = useState(INITIAL_STATE.globalDisc);
    const [activeLabel, setActiveLabel] = useState('ORIGINAL');

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('shb_enterprise_v24_master');
        if (saved) {
            const p = JSON.parse(saved);
            setConfig(p.config); setColumns(p.columns); setMeta(p.meta); setItems(p.items); setCharges(p.charges || []); setGlobalDisc(p.globalDisc || { val: 0, type: '%' });
        }
    }, []);

    // --- ENGINE ---
    const engine = useMemo(() => {
        const jur = JURISDICTIONS[config.country];
        const rows = items.map(item => {
            const base = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
            const taxR = parseFloat(item.tax) || 0;
            const tax = config.taxMode === 'exclusive' ? (base * taxR / 100) : (base - (base / (1 + taxR / 100)));
            return { ...item, lineBase: base, lineTax: tax, lineTotal: config.taxMode === 'exclusive' ? base + tax : base };
        });

        const subtotal = rows.reduce((acc, r) => acc + r.lineBase, 0);
        const totalLineTax = rows.reduce((acc, r) => acc + r.lineTax, 0);
        const discAmt = globalDisc.type === '%' ? (subtotal * (parseFloat(globalDisc.val) || 0) / 100) : parseFloat(globalDisc.val || 0);
        
        const taxableCharges = charges.filter(c => c.taxable).reduce((acc, c) => acc + parseFloat(c.val || 0), 0);
        const chargeTax = taxableCharges * (jur.taxRate / 100);
        const totalCharges = charges.reduce((acc, c) => acc + parseFloat(c.val || 0), 0);

        const rawGrand = subtotal + totalLineTax + chargeTax + totalCharges - discAmt;
        let grand = rawGrand;
        if (config.rounding === 'up') grand = Math.ceil(rawGrand);
        else if (config.rounding === 'down') grand = Math.floor(rawGrand);
        else if (config.rounding === 'nearest') grand = Math.round(rawGrand);

        const taxSummary = jur.hasSplitTax 
            ? [{label: 'CGST', amt: (totalLineTax+chargeTax)/2}, {label: 'SGST', amt: (totalLineTax+chargeTax)/2}] 
            : [{label: config.taxLabel, amt: totalLineTax + chargeTax}];

        return { rows, subtotal, taxTotal: totalLineTax + chargeTax, taxSummary, grandTotal: grand, roundOff: grand - rawGrand, jur, words: amountToWords(grand, jur) };
    }, [items, config, globalDisc, charges]);

    const handleHardReset = () => {
        if (confirm("REALLY RESET? All your saved formats and data will be permanently cleared.")) {
            localStorage.removeItem('shb_enterprise_v24_master');
            window.location.reload();
        }
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader(); reader.onload = (ev) => setMeta({...meta, [field]: ev.target.result}); reader.readAsDataURL(file);
        }
    };

    if (!mounted) return null;

    return (
        <ToolboxLayout title="Master Invoice Engine" description="Refrens-Level Professional Billing System">
            <div style={styles.app} className="no-print-bg">
                {/* 1. SIDEBAR CONTROLS */}
                <aside style={styles.sidebar} className="no-print">
                    <div style={styles.card}>
                        <h3 style={styles.h3}>Advanced Column Engine</h3>
                        {columns.map((c, i) => (
                            <div key={i} style={{display:'flex', gap:5, marginBottom:8, alignItems:'center'}}>
                                <input value={c.label} onChange={e => {const nc=[...columns]; nc[i].label=e.target.value; setColumns(nc);}} style={{background:'#0f172a', color:'#fff', border:'1px solid #334155', padding:5, borderRadius:4, flex:1, fontSize:'0.7rem'}} />
                                <button onClick={()=>{const nc=[...columns]; nc[i].visible=!nc[i].visible; setColumns(nc);}} style={{background:c.visible?'#34d399':'#334155', border:'none', color:'#fff', padding:5, borderRadius:4}} title="Toggle Visibility">{c.visible?'👁️':'🚫'}</button>
                                <button onClick={()=>{const nc=[...columns]; nc[i].private=!nc[i].private; setColumns(nc);}} style={{background:c.private?'#fbbf24':'#334155', border:'none', color:'#fff', padding:5, borderRadius:4}} title="Private Mode">{c.private?'🔒':'🔓'}</button>
                                <button onClick={()=>{setColumns(columns.filter((_,idx)=>idx!==i))}} style={{color:'#f87171', background:'none', border:'none', cursor:'pointer'}}>×</button>
                            </div>
                        ))}
                        <button onClick={()=>setColumns([...columns, {id:`c_${Date.now()}`, label:'New Col', visible:true, private:false, width:100}])} style={{...styles.btn, background:'none', border:'1px dashed #334155', color:'#38bdf8'}}>+ ADD CUSTOM COLUMN</button>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Configuration</h3>
                        <label style={styles.lCap}>Jurisdiction</label>
                        <select style={{width:'100%', padding:10, borderRadius:8, background:'#0f172a', color:'#fff'}} value={config.country} onChange={e => setConfig({...config, country: e.target.value})}>
                            {Object.keys(JURISDICTIONS).map(k => <option key={k} value={k}>{JURISDICTIONS[k].name}</option>)}
                        </select>
                        <label style={{...styles.lCap, marginTop:15}}>Theme Color</label>
                        <input type="color" value={config.theme} onChange={e=>setConfig({...config, theme:e.target.value})} style={{width:'100%', height:40, border:'none', cursor:'pointer'}} />
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Rounding Adjustment</h3>
                        <select value={config.rounding} onChange={e => setConfig({...config, rounding: e.target.value})} style={{width:'100%', padding:10, borderRadius:8, background:'#0f172a', color:'#fff'}}>
                            <option value="none">No Rounding</option>
                            <option value="nearest">Nearest Integer</option>
                            <option value="up">Round Up (Ceil)</option>
                            <option value="down">Round Down (Floor)</option>
                        </select>
                        <div style={{marginTop:15}}>
                            <label style={{display:'flex', gap:10, color:'#fff', fontSize:'0.75rem', alignItems:'center'}}><input type="checkbox" checked={config.isExport} onChange={e=>setConfig({...config, isExport:e.target.checked})} /> Zero Rated / Export Mode</label>
                            <label style={{display:'flex', gap:10, color:'#fff', fontSize:'0.75rem', alignItems:'center', marginTop:10}}><input type="checkbox" checked={config.isReverse} onChange={e=>setConfig({...config, isReverse:e.target.checked})} /> Reverse Charge Applied</label>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.h3}>Print Copy</h3>
                        <select style={{width:'100%', padding:10}} value={activeLabel} onChange={e=>setActiveLabel(e.target.value)}>
                            <option>ORIGINAL</option><option>DUPLICATE</option><option>TRIPLICATE</option><option>OFFICE COPY</option>
                        </select>
                    </div>

                    <button onClick={() => {localStorage.setItem('shb_enterprise_v24_master', JSON.stringify({config, columns, meta, items, charges, globalDisc})); alert('System Saved! ✅');}} style={{...styles.btn, background:'#34d399', color:'#0f172a', marginBottom:10}}>💾 SAVE TO LOCAL STORAGE</button>
                    <button onClick={()=>window.print()} style={{...styles.btn, ...styles.btnPrimary}}>📄 PRINT / EXPORT PDF</button>
                    <button onClick={handleHardReset} style={{...styles.btn, ...styles.btnReset}}>🗑️ HARD RESET</button>
                </aside>

                {/* 2. THE DOCUMENT (WYSIWYG) */}
                <main style={styles.workspace}>
                    <div id="invoice-document" style={styles.paper}>
                        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'8px', background:config.theme}}></div>
                        
                        {/* Status Badges */}
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                            <div style={{display:'flex', gap:5}}>
                                {config.isExport && <span className="badge">ZERO RATED EXPORT</span>}
                                {config.isReverse && <span className="badge">REVERSE CHARGE</span>}
                            </div>
                            <span className="page-counter"></span>
                        </div>

                        {/* Branding Header */}
                        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #000', paddingBottom:20, marginBottom:30}}>
                            <div style={{flex:1.5}}>
                                <input style={{...styles.ghostInp, fontSize:'2.8rem', fontWeight:'900', color:config.theme}} value={meta.title} onChange={e=>setMeta({...meta, title:e.target.value})} />
                                <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1.2rem'}} value={meta.sender} onChange={e=>setMeta({...meta, sender:e.target.value})} />
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div onClick={()=>document.getElementById('l-up').click()} style={{height:100, width:180, border:'1px dashed #ccc', marginLeft:'auto', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {meta.logo ? <img src={meta.logo} style={{maxHeight:'100%', maxWidth:'100%'}} /> : <span style={{fontSize:'0.6rem'}}>+ LOGO</span>}
                                    <input id="l-up" type="file" hidden onChange={e=>handleFile(e, 'logo')} />
                                </div>
                                <div style={{marginTop:20, fontSize:'0.85rem'}}>
                                    <div>Inv No: <input style={{fontWeight:'bold', borderBottom:'1px solid #eee', width:100, textAlign:'right'}} value={meta.iNum} onChange={e=>setMeta({...meta, iNum:e.target.value})} /></div>
                                    <div>Date: <input type="date" style={{...styles.ghostInp, fontWeight:'bold', textAlign:'right', width:130}} value={meta.date} onChange={e=>setMeta({...meta, date:e.target.value})} /></div>
                                    <div>Due: <input type="date" style={{...styles.ghostInp, textAlign:'right', width:130}} value={meta.due} onChange={e=>setMeta({...meta, due:e.target.value})} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div style={{marginBottom:35}}>
                            <span style={styles.lCap}>BILL TO:</span>
                            <textarea style={{...styles.areaInp, fontWeight:'bold', fontSize:'1.1rem', minHeight:120}} value={meta.client} onChange={e=>setMeta({...meta, client:e.target.value})} />
                        </div>

                        {/* Professional Table with Repeating Header */}
                        <table style={styles.table}>
                            <thead className="repeat-header">
                                <tr>
                                    {columns.map((c, i) => (c.visible && (!c.private)) && <th key={i} style={styles.th}>{c.label}</th>)}
                                    <th style={{...styles.th, textAlign:'right'}}>LINE TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engine.rows.map((item, idx) => (
                                    <tr key={idx} className="item-row">
                                        {columns.map((c, ci) => (c.visible && (!c.private)) && (
                                            <td key={ci} style={styles.td}>
                                                <textarea 
                                                    style={styles.ghostInp} 
                                                    value={item[c.id] || ''} 
                                                    onChange={e => { const ni=[...items]; ni[idx][c.id]=e.target.value; setItems(ni); }} 
                                                    rows={1}
                                                />
                                            </td>
                                        ))}
                                        <td style={{...styles.td, textAlign:'right', fontWeight:'bold'}}>{item.lineTotal.toFixed(engine.jur.decimals)}</td>
                                        <td className="no-print" style={{width:20, border:'none'}}><button onClick={()=>setItems(items.filter((_,i)=>i!==idx))} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>×</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={()=>setItems([...items, {id:Date.now(), desc:'', qty:1, rate:0, tax:5}])} style={{width:'100%', padding:10, background:'none', border:'1px dashed #ccc', marginTop:15, cursor:'pointer'}} className="no-print">+ ADD NEW LINE</button>

                        {/* Totals & Signature Block */}
                        <div style={{marginTop:'auto', paddingTop:50}} className="totals-container">
                            <div style={styles.totalBox}>
                                <div style={styles.totalTable}>
                                    <div style={styles.tRow}><span>Subtotal</span><span>{engine.subtotal.toFixed(engine.jur.decimals)}</span></div>
                                    {engine.taxSummary.map(t => <div key={t.label} style={styles.tRow}><span>{t.label} Total</span><span>{t.amt.toFixed(engine.jur.decimals)}</span></div>)}
                                    <div style={styles.tRow}><span>Total Discount</span><div style={{display:'flex', gap:5}}><input type="number" style={{width:50, textAlign:'right'}} value={globalDisc.val} onChange={e=>setGlobalDisc({...globalDisc, val:e.target.value})} /><select onChange={e=>setGlobalDisc({...globalDisc, type:e.target.value})}><option>%</option><option>Fixed</option></select></div></div>
                                    
                                    {charges.map((c, i) => (
                                        <div key={i} style={styles.tRow}>
                                            <input value={c.label} onChange={e => {const nc=[...charges]; nc[i].label=e.target.value; setCharges(nc);}} style={{width:100, border:'none'}} />
                                            <div style={{display:'flex', alignItems:'center', gap:5}}>
                                                <input type="number" value={c.val} onChange={e => {const nc=[...charges]; nc[i].val=e.target.value; setCharges(nc);}} style={{width:60, textAlign:'right'}} />
                                                <button className="no-print" onClick={()=>setCharges(charges.filter((_,idx)=>idx!==i))} style={{color:'red', background:'none', border:'none'}}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="no-print" onClick={()=>setCharges([...charges, {label:'Extra Charge', val:0, taxable:false}])} style={{fontSize:'0.6rem', color:config.theme, background:'none', border:'none', cursor:'pointer', float:'right'}}>+ Add Charge</button>

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
                                    <textarea style={{...styles.areaInp, borderBottom:'1px solid #eee'}} value={meta.notes} onChange={e=>setMeta({...meta, notes:e.target.value})} />
                                    <textarea style={{...styles.areaInp, fontSize:'0.7rem', color:'#666', marginTop:10}} value={meta.terms} onChange={e=>setMeta({...meta, terms:e.target.value})} />
                                </div>
                                <div onClick={()=>document.getElementById('s-up').click()} style={{textAlign:'right', cursor:'pointer'}}>
                                    {meta.signature ? <img src={meta.signature} style={{maxHeight:80}} /> : <div style={{height:60, borderBottom:'1px solid #000', width:200}}></div>}
                                    <span style={{fontSize:'0.65rem', fontWeight:'bold', display:'block'}}>{activeLabel} AUTHORIZED SIGNATORY</span>
                                    <input id="s-up" type="file" hidden onChange={e=>handleFile(e, 'signature')} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Page Footer */}
                        <div className="print-footer" style={{marginTop:20, fontSize:'0.6rem', color:'#999', textAlign:'center'}}>
                            {meta.title} #{meta.iNum} - Powered by shbstores.com
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @media screen {
                    .badge { font-size: 0.6rem; background: #f1f5f9; padding: 4px 10px; border: 1px solid #e2e8f0; font-weight: 900; }
                }
                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: #fff !important; margin: 0; padding: 0; }
                    .no-print, .no-print-bg { display: none !important; }
                    #invoice-document { width: 100% !important; height: auto !important; padding: 15mm !important; box-shadow: none !important; margin: 0 !important; }
                    .repeat-header { display: table-header-group !important; }
                    .item-row { page-break-inside: avoid !important; }
                    .totals-container { page-break-inside: avoid !important; }
                    
                    /* Automated Page Numbering */
                    .page-counter:after { content: "Page " counter(page); font-size: 8pt; color: #666; }
                    
                    /* Ensure text color for printing */
                    input, textarea { color: #000 !important; -webkit-print-color-adjust: exact; }
                }
                textarea { overflow: hidden; width: 100%; }
                input:hover, textarea:hover { background: rgba(0,0,0,0.02) !important; }
            `}</style>
        </ToolboxLayout>
    );
}
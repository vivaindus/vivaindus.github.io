import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ProfessionalInvoiceSuite() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    const [meta, setMeta] = useState({
        logo: null, logoAlign: 'flex-start', primaryColor: '#000000', titleColor: '#3b82f6',
        invoiceTitle: 'TAX INVOICE', invoiceNum: 'INV-2026-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0],
        currency: 'AED', decimals: 2, 
        senderName: 'Your Business Name', senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        clientName: 'Recipient Company Name', clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Client Location, City, Country',
        notes: 'Reverse Charge applies if applicable. Thank you for your business.',
        footerMsg: 'Authorized Signatory', 
        footerUrl: 'https://www.shbstores.com/invoicegenerator' 
    });

    const [items, setItems] = useState([{ id: 1, code: 'S01', desc: 'Consulting Service', qty: 1, price: 0, vatRate: 5 }]);

    useEffect(() => {
        const saved = localStorage.getItem('shb_invoice_final_v12');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta); setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_invoice_final_v12', JSON.stringify({ meta, items }));
        showToast('Settings saved successfully! ✅');
    };

    // --- SAFE MATH UTILITIES ---
    const safeNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    const fmt = (num) => safeNum(num).toFixed(meta.decimals);

    // --- ACCURATE AMOUNT IN WORDS ---
    const toWords = (total) => {
        const n_total = safeNum(total);
        if (n_total === 0) return 'Zero ' + meta.currency + ' Only';
        
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        function convert_number(num) {
            if (num < 20) return a[num];
            if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
            if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert_number(num % 100) : '');
            if (num < 1000000) return convert_number(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert_number(num % 1000) : '');
            return '';
        }

        const amount = n_total.toFixed(2);
        const [d, f] = amount.split('.');
        let str = convert_number(parseInt(d)) + ' ' + meta.currency;
        if (parseInt(f) > 0) str += ' and ' + convert_number(parseInt(f)) + ' Fils';
        return str + ' Only';
    };

    const calculateLineVat = (item) => (safeNum(item.qty) * safeNum(item.price)) * (safeNum(item.vatRate) / 100);
    const calculateLineTotal = (item) => (safeNum(item.qty) * safeNum(item.price)) + calculateLineVat(item);

    const subtotal = items.reduce((acc, item) => acc + (safeNum(item.qty) * safeNum(item.price)), 0);
    const totalVat = items.reduce((acc, item) => acc + calculateLineVat(item), 0);
    const grandTotal = subtotal + totalVat;

    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };
    
    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, logo: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // --- PRO PDF EXPORT ENGINE (Fixes Split Clipping) ---
    const exportFile = async (type) => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Preparing HD ${type.toUpperCase()}...`);

        const canvas = await toCanvas(invoiceRef.current, {
            pixelRatio: 3, 
            backgroundColor: '#ffffff',
            canvasWidth: 800 
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', pageSize.toLowerCase());
        const pWidth = pdf.internal.pageSize.getWidth();
        const pHeight = pdf.internal.pageSize.getHeight();
        const imgH = (canvas.height * pWidth) / canvas.width;
        
        let heightLeft = imgH;
        let position = 0;
        const topMarginBuffer = 20; // Correct gap for 2nd page start

        pdf.addImage(imgData, 'PNG', 0, position, pWidth, imgH);
        heightLeft -= pHeight;

        while (heightLeft > 0) {
            pdf.addPage();
            // Start lower on next page to create "Header space"
            position = heightLeft - imgH + topMarginBuffer;
            pdf.addImage(imgData, 'PNG', 0, position, pWidth, imgH);
            heightLeft -= (pHeight - topMarginBuffer);
        }
        
        if (type === 'png') {
            const link = document.createElement('a');
            link.download = `Invoice.png`; link.href = imgData; link.click();
        } else {
            pdf.save(`Invoice-${meta.invoiceNum}.pdf`);
        }
        showToast('Document Ready! ✅');
    };

    return (
        <ToolboxLayout title="Pro Tax Invoice Suite" description="Universal Multi-page UAE Tax Invoice Suite.">
            <div style={{ maxWidth: '1550px', margin: '0 auto', padding: '20px' }}>
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLLER SIDEBAR --- */}
                    <aside style={sidebarS}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Themes & Colors</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <div><label style={lCap}>Theme Color</label><input type="color" value={meta.titleColor} onChange={(e)=>setMeta({...meta, titleColor:e.target.value})} style={clrInp} /></div>
                                <div><label style={lCap}>Text Color</label><input type="color" value={meta.primaryColor} onChange={(e)=>setMeta({...meta, primaryColor:e.target.value})} style={clrInp} /></div>
                            </div>
                            
                            <h3 style={cardTitle}>Compliance</h3>
                            <label style={lCap}>Decimals</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selS}>
                                <option value={2}>2 Decimals (Standard)</option>
                                <option value={3}>3 Decimals (Oman)</option>
                            </select>
                            
                            <label style={lCap}>Logo Position</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE SETTINGS</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>GET PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>GET PNG</button>
                            </div>
                            <button onClick={() => { if(window.confirm("Confirm reset?")) { localStorage.clear(); window.location.reload(); } }} style={btnReset}>HARD RESET</button>
                        </div>
                    </aside>

                    {/* --- THE PAPER --- */}
                    <main style={paperWrapper}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ 
                            ...paperStyle, 
                            width: pageSize === 'A4' ? '210mm' : '215.9mm',
                            color: meta.primaryColor
                        }}>
                            
                            {/* Logo */}
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '20px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '85px', maxWidth: '250px', objectFit:'contain' }} alt="Logo" /> : <div style={{height:'85px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div style={{flex: 2}}>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={{...titleI, color: meta.titleColor}} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={compT} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrI} />
                                    <div style={trnL}>Supplier TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnInp} /></div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={mRow}><span>No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Curr:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...mInp, fontWeight:'bold', color: meta.titleColor}} /></div>
                                </div>
                            </div>

                            <div style={{ margin: '30px 0' }}>
                                <span style={tagL}>BILL TO</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientT} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrI} />
                                <div style={trnL}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnInp} /></div>
                            </div>

                            <table style={tableB}>
                                <thead style={{...thR, borderBottom: `2px solid ${meta.titleColor}` }}>
                                    <tr style={{ color: meta.titleColor }}>
                                        <th style={tc}>Code</th><th style={{...tc, width:'35%'}}>Description</th><th style={tc}>Qty</th><th style={tc}>Price</th><th style={tc}>VAT%</th><th style={tc}>VAT Amt</th><th style={{...tc, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} style={itemR}>
                                            <td style={tc}><input value={item.code} onChange={(e)=>updateItem(item.id, 'code', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><textarea value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={{...rawI, resize:'none'}} /></td>
                                            <td style={tc}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.vatRate} onChange={(e)=>updateItem(item.id, 'vatRate', e.target.value)} style={rawI} /></td>
                                            <td style={tc}>{fmt(calculateLineVat(item))}</td>
                                            <td style={{...tc, textAlign:'right', fontWeight:'bold'}}>
                                                {fmt(calculateLineTotal(item))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delBtn}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id: Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addB} className="no-print">+ Add Item Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', pageBreakInside: 'avoid' }}>
                                <div style={{ width: '60%' }}>
                                    <span style={tagLabel}>AMOUNT IN WORDS</span>
                                    <div style={{...wordBox, color: meta.titleColor}}>{toWords(grandTotal)}</div>
                                    <span style={{...tagLabel, marginTop:'20px'}}>NOTES & DECLARATIONS</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesArea} />
                                </div>
                                <div style={{ width: '240px' }}>
                                    <div style={sumR}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                    <div style={sumR}><span>Total VAT</span><span>{fmt(totalVat)}</span></div>
                                    <div style={{...grandRow, borderLeft: `5px solid ${meta.titleColor}`, color: meta.titleColor, background: '#f8fafc'}}>
                                        <span>TOTAL</span><span>{meta.currency} {fmt(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={pFoot}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footInp} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} />
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Page 1 of 1</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <div style={seoCont}>
                    <h2 style={{color: '#38bdf8'}}>Universal Professional Tax Invoice Management</h2>
                    <p>SHB Invoice Suite is engineered for global business compliance, specifically optimized for UAE FTA (Federal Tax Authority) and GCC regional standards. Our tool includes real-time line-level VAT calculation, persistent local storage for branding, and high-fidelity multi-page PDF generation.</p>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper { background: white !important; font-family: 'Segoe UI', Arial, sans-serif; }
                #invoice-paper input, #invoice-paper textarea { color: inherit !important; background: transparent !important; border: none; outline: none; transition: 0.1s; width: 100%; }
                #invoice-paper input:hover { background: rgba(0,0,0,0.02) !important; border-radius: 4px; }
                tr { page-break-inside: avoid !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- Styles ---
const sidebarS = { flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' };
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 10px 0' };
const lCap = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom:'3px' };
const clrInp = { width: '100%', height: '35px', background: 'none', border: '1px solid #334155', cursor: 'pointer', borderRadius:'4px' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', color: '#fff', borderRadius: '8px', marginBottom: '10px', fontSize:'0.8rem' };
const paperWrapper = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const paperStyle = { background: '#fff', padding: '20mm 15mm', display: 'flex', flexDirection: 'column', minHeight: '297mm', boxShadow: '0 10px 60px rgba(0,0,0,0.5)' };
const titleI = { fontSize: '2.5rem', fontWeight: '900' };
const compT = { fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' };
const addrI = { fontSize: '0.8rem', color: '#475569', height: '40px' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px' };
const trnL = { fontSize: '0.8rem', fontWeight: 'bold' };
const trnInp = { borderBottom: '1px dashed #ccc !important', width: '150px' };
const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '5px', fontSize: '0.8rem', marginBottom: '3px' };
const mInp = { width: '95px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagL = { fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' };
const wordBox = { fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', borderBottom: '1px solid #eee', padding: '5px 0' };
const clientT = { fontSize: '1.2rem', fontWeight: 'bold' };
const tableB = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const thR = { borderTop: '2px solid #000' };
const tc = { padding: '10px 5px', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemR = { verticalAlign: 'top' };
const rawI = { fontSize: '0.75rem' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', color: '#94a3b8', cursor: 'pointer', marginTop: '10px', borderRadius:'5px' };
const delBtn = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.85rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px' };
const notesArea = { width: '100%', height: '60px', background: '#f8fafc', padding: '8px', fontSize: '0.75rem' };
const pFoot = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footInp = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const urlI = { width: '50%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnExport = { background: '#38bdf8', color: '#0f172a', padding: '10px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', marginTop:'10px' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
const seoCont = { marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.8' };
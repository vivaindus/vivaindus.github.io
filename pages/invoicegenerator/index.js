import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PerfectInvoiceSuite() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    const [meta, setMeta] = useState({
        logo: null, logoAlign: 'flex-start', invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2024-001', invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0], currency: 'AED', decimals: 2,
        senderName: 'Your Company', senderTRN: '100XXXXXXXXXXXX', senderAddress: 'City, UAE',
        clientName: 'Client Name', clientTRN: '100XXXXXXXXXXXX', clientAddress: 'Sharjah, UAE',
        notes: 'Reverse Charge applies.', footerMsg: 'Authorized Signatory',
        footerUrl: 'https://www.shbstores.com/invoicegenerator'
    });

    const [items, setItems] = useState([{ id: 1, code: 'S01', desc: 'Description', qty: 1, price: 0, vatRate: 5 }]);

    useEffect(() => {
        const saved = localStorage.getItem('shb_final_invoice_v6');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_final_invoice_v6', JSON.stringify({ meta, items }));
        showToast('Business Settings Saved! ✅');
    };

    const handleHardReset = () => {
        if (window.confirm("Hard Reset will clear all cached branding and TRN data. Proceed?")) {
            localStorage.removeItem('shb_final_invoice_v6');
            window.location.reload();
        }
    };

    const fmt = (num) => parseFloat(num || 0).toFixed(meta.decimals);
    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };
    
    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, logo: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const exportFile = async (type) => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast(`Preparing ${type.toUpperCase()}...`);

        // We use a scale and ensure no offset for clipping fix
        const canvas = await toCanvas(invoiceRef.current, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            canvasWidth: pageSize === 'A4' ? 794 : 816, // Fixed widths to prevent clipping
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', pageSize.toLowerCase());
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (type === 'png') {
            const link = document.createElement('a');
            link.download = `${meta.invoiceNum}.png`; link.href = imgData; link.click();
        } else {
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`${meta.invoiceNum}.pdf`);
        }
    };

    return (
        <ToolboxLayout title="Master Tax Invoice" description="UAE FTA & GCC Compliant Tax Invoice Suite with Multi-Page PDF and Logo control.">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px' }}>
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <aside style={sidebar}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Configuration</h3>
                            <label style={lCap}>Decimal Precision</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selS}>
                                <option value={2}>2 Decimals</option>
                                <option value={3}>3 Decimals</option>
                            </select>

                            <label style={lCap}>Paper Format</label>
                            <select value={pageSize} onChange={(e)=>setPageSize(e.target.value)} style={selS}>
                                <option value="A4">A4 International</option>
                                <option value="Letter">US Letter</option>
                            </select>

                            <label style={lCap}>Logo Position</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                            <input type="file" onChange={handleLogo} style={{marginTop:'10px', fontSize:'0.7rem'}} />
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE DATA</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>PNG</button>
                            </div>
                            <button onClick={handleHardReset} style={btnReset}>HARD RESET</button>
                        </div>
                    </aside>

                    <main style={paperContainer}>
                        <div ref={invoiceRef} style={{ ...paperStyle, width: pageSize === 'A4' ? '210mm' : '215.9mm' }}>
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '15px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '70px' }} alt="Logo" /> : <div style={{height:'70px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={titleI} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={compT} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrI} />
                                    <div style={trnL}>TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnI} /></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={mR}><span>No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mI} /></div>
                                    <div style={mR}><span>Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mI} /></div>
                                    <div style={mR}><span>Supply:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mI} /></div>
                                    <div style={mR}><span>Curr:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...mI, fontWeight:'bold'}} /></div>
                                </div>
                            </div>

                            <div style={{ margin: '25px 0' }}>
                                <span style={tagL}>BILL TO</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientT} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrI} />
                                <div style={trnL}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnI} /></div>
                            </div>

                            <table style={tableB}>
                                <thead style={thR}>
                                    <tr>
                                        <th style={tcS}>Code</th>
                                        <th style={{...tcS, width:'35%'}}>Description</th>
                                        <th style={tcS}>Qty</th>
                                        <th style={tcS}>Price</th>
                                        <th style={tcS}>VAT %</th>
                                        <th style={tcS}>VAT Amt</th>
                                        <th style={{...tcS, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} style={itemR}>
                                            <td style={tcS}><input value={item.code} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, code:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tcS}><textarea value={item.desc} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, desc:e.target.value}:i))} style={{...rawI, resize:'none'}} /></td>
                                            <td style={tcS}><input value={item.qty} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, qty:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tcS}><input value={item.price} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, price:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tcS}><input value={item.vatRate} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, vatRate:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tcS}>{fmt((item.qty*item.price)*(item.vatRate/100))}</td>
                                            <td style={{...tcS, textAlign:'right', fontWeight:'bold'}}>{fmt((item.qty*item.price) + (item.qty*item.price)*(item.vatRate/100))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delB}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addLB} className="no-print">+ Add Item Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                <div style={{ width: '55%' }}><span style={tagL}>NOTES</span><textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesA} /></div>
                                <div style={{ width: '220px' }}>
                                    <div style={sumR}><span>Net Subtotal:</span><span>{fmt(items.reduce((acc, i)=>acc+(i.qty*i.price), 0))}</span></div>
                                    <div style={sumR}><span>Total VAT:</span><span>{fmt(items.reduce((acc, i)=>acc+(i.qty*i.price*(i.vatRate/100)), 0))}</span></div>
                                    <div style={grandR}><span>TOTAL {meta.currency}</span><span>{fmt(items.reduce((acc, i)=>acc+(i.qty*i.price*(1+i.vatRate/100)), 0))}</span></div>
                                </div>
                            </div>

                            <div style={pFoot}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footInp} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} />
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Page 1 of 1</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- SEO CONTENT --- */}
                <div style={seoSection}>
                    <h2 style={{color: '#38bdf8'}}>Global Compliance Tax Invoice Management</h2>
                    <p>SHB Professional Invoice Generator provides multi-currency, multi-jurisdiction compliance. Optimized for UAE VAT (FTA) and GCC standards, including support for TRN tracking and line-level tax calculation.</p>
                    <h3 style={{color: '#38bdf8', marginTop:'20px'}}>Precision & Privacy</h3>
                    <p>Toggle between 2 and 3 decimal places for exact OMR or AED accounting. Data is stored entirely in your local browser storage for maximum privacy.</p>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper { background: white !important; color: black !important; }
                #invoice-paper input, #invoice-paper textarea { color: black !important; background: transparent !important; border: none; outline: none; }
                #invoice-paper input:hover { background: #f1f5f9 !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- MINIFIED STYLES FOR PERFORMANCE ---
const sidebar = { flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' };
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
const paperContainer = { flex: '3', overflowX: 'auto', background: '#334155', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center' };
const paperStyle = { background: '#fff', padding: '20mm', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 10px 0' };
const lCap = { fontSize: '0.7rem', color: '#64748b', display: 'block' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', color: '#fff', borderRadius: '8px', marginBottom: '10px' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnExport = { width: '100%', background: '#38bdf8', color: '#0f172a', padding: '10px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnReset = { marginTop: '10px', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' };
const titleI = { fontSize: '2.5rem', fontWeight: '900', width: '100%' };
const compT = { fontSize: '1.3rem', fontWeight: 'bold', width: '100%', marginTop: '5px' };
const addrI = { width: '100%', fontSize: '0.8rem', color: '#475569', height: '40px' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px' };
const trnL = { fontSize: '0.8rem', fontWeight: 'bold' };
const trnI = { borderBottom: '1px dashed #ccc !important', width: '140px' };
const mR = { display: 'flex', justifyContent: 'flex-end', gap: '5px', fontSize: '0.8rem', marginBottom: '3px' };
const mI = { width: '90px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagL = { fontSize: '0.65rem', fontWeight: 'bold', color: '#94a3b8' };
const clientT = { fontSize: '1.1rem', fontWeight: 'bold', width: '100%' };
const tableB = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const thR = { borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' };
const tcS = { padding: '8px 5px', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemR = { verticalAlign: 'top' };
const rawI = { width: '100%', fontSize: '0.75rem' };
const addLB = { width: '100%', padding: '8px', background: '#f8fafc', border: '1px dashed #ccc', color: '#94a3b8', cursor: 'pointer', marginTop: '10px' };
const delB = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer' };
const sumR = { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.8rem' };
const grandR = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1rem', marginTop: '5px' };
const notesA = { width: '100%', height: '50px', background: '#f8fafc', padding: '8px', fontSize: '0.75rem' };
const pFoot = { marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #eee' };
const footInp = { width: '100%', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' };
const urlI = { width: '60%', fontSize: '0.6rem', color: '#cbd5e1', fontStyle: 'italic' };
const seoSection = { marginTop: '50px', borderTop: '1px solid #334155', paddingTop: '30px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', zIndex: 10000 };
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function GlobalInvoiceGenerator() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // --- State: Compliance & Meta ---
    const [meta, setMeta] = useState({
        logo: null,
        logoAlign: 'flex-start',
        invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2024-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0],
        currency: 'AED',
        decimals: 2, 
        senderName: 'Your Business Name',
        senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        clientName: 'Client Company Name',
        clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Client Location, City, Country',
        notes: 'Reverse Charge applies if applicable. Thank you for your business.',
        footerMsg: 'Authorized Signatory', 
        footerUrl: 'https://www.shbstores.com/invoicegenerator' 
    });

    const [items, setItems] = useState([
        { id: 1, code: 'SRV-01', desc: 'Item Description', qty: 1, price: 0, vatRate: 5 }
    ]);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_invoice_master_v5');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_invoice_master_v5', JSON.stringify({ meta, items }));
        showToast('Business Data Saved Locally! ✅');
    };

    const handleHardReset = () => {
        if (window.confirm("RESET WORKSPACE? This will clear all data and delete your saved template.")) {
            localStorage.removeItem('shb_invoice_master_v5');
            window.location.reload();
        }
    };

    // --- Item Update Logic ---
    const updateItem = (id, field, value) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setItems(newItems);
    };

    // --- Math Engine ---
    const fmt = (num) => parseFloat(num || 0).toFixed(meta.decimals);
    const calculateLineVat = (i) => (i.qty * i.price) * (i.vatRate / 100);
    const calculateLineTotal = (i) => (i.qty * i.price) + calculateLineVat(i);
    const subtotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
    const totalVat = items.reduce((acc, i) => acc + calculateLineVat(i), 0);
    const grandTotal = subtotal + totalVat;

    // --- Toast & Logo ---
    const showToast = (m) => { setNotification(m); setTimeout(() => setNotification(''), 3000); };
    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, logo: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    // --- High Precision Export Engine ---
    const exportFile = async (type) => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Rendering ${type.toUpperCase()}...`);

        const canvas = await toCanvas(invoiceRef.current, {
            pixelRatio: 2.5, 
            backgroundColor: '#ffffff'
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
        showToast('Document Downloaded Successfully!');
    };

    return (
        <ToolboxLayout title="Pro Tax Invoice Suite" description="Universal Tax Invoice Generator with UAE TRN support.">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    
                    {/* --- SIDEBAR --- */}
                    <aside style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'sticky', top: '100px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Format & Compliance</h3>
                            <label style={lCaption}>Precision</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selStyle}>
                                <option value={2}>2 Decimals</option>
                                <option value={3}>3 Decimals</option>
                                <option value={0}>0 Decimals</option>
                            </select>

                            <label style={lCaption}>Page Size</label>
                            <select value={pageSize} onChange={(e)=>setPageSize(e.target.value)} style={selStyle}>
                                <option value="A4">A4 International</option>
                                <option value="Letter">US Letter</option>
                            </select>

                            <label style={lCaption}>Branding (Logo Upload)</label>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                            
                            <label style={lCaption}>Logo Location</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE AS DEFAULT</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>📄 GET PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>🖼️ GET PNG</button>
                            </div>
                        </div>

                        <button onClick={handleHardReset} style={btnReset}>🗑️ RESET ALL</button>
                    </aside>

                    {/* --- PAPER CONTAINER --- */}
                    <main style={{ 
                        flex: '3', 
                        minWidth: '0', // Important for flex wrapping
                        background: '#334155', 
                        padding: '40px 20px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', // Centers the paper
                        overflowX: 'auto' // Allows scrolling if window is too small
                    }}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ 
                            ...paperStyle, 
                            width: pageSize === 'A4' ? '210mm' : '215.9mm',
                            minHeight: pageSize === 'A4' ? '297mm' : '279.4mm',
                            margin: '0 auto', // Ensures equal side margins
                            boxSizing: 'border-box'
                        }}>
                            
                            {/* Logo */}
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '20px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '80px', maxWidth: '250px', objectFit: 'contain' }} alt="Logo" /> : <div style={{height:'80px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div style={{flex: 2}}>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={titleInput} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={companyTitle} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrInput} />
                                    <div style={trnLine}>Supplier TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnInp} /></div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={mRow}><span>No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Curr:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...mInp, fontWeight:'bold'}} /></div>
                                </div>
                            </div>

                            <div style={{ margin: '30px 0' }}>
                                <span style={tagLabel}>RECIPIENT / BILL TO</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientTitle} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrInput} />
                                <div style={trnLine}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnInp} /></div>
                            </div>

                            <table style={tableBody}>
                                <thead style={tableHeaderRow}>
                                    <tr>
                                        <th style={tc}>Code</th>
                                        <th style={{...tc, width:'35%'}}>Description</th>
                                        <th style={tc}>Qty</th>
                                        <th style={tc}>Price</th>
                                        <th style={tc}>VAT %</th>
                                        <th style={tc}>VAT</th>
                                        <th style={{...tc, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} style={itemRow}>
                                            <td style={tc}><input value={item.code} onChange={(e)=>updateItem(item.id, 'code', e.target.value)} style={rawInp} /></td>
                                            <td style={tc}><textarea value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={{...rawInp, resize:'none'}} /></td>
                                            <td style={tc}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', parseFloat(e.target.value))} style={rawInp} /></td>
                                            <td style={tc}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', parseFloat(e.target.value))} style={rawInp} /></td>
                                            <td style={tc}><input type="number" value={item.vatRate} onChange={(e)=>updateItem(item.id, 'vatRate', parseFloat(e.target.value))} style={rawInp} /></td>
                                            <td style={tc}>{fmt(calculateLineVat(item))}</td>
                                            <td style={{...tc, textAlign:'right', fontWeight:'bold'}}>
                                                {fmt(calculateLineTotal(item))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delBtn}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setItems([...items, {id: Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addLineBtn} className="no-print">+ Add New Item</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{ width: '55%' }}>
                                    <span style={tagLabel}>NOTES & DECLARATIONS</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesArea} />
                                </div>
                                <div style={{ width: '240px' }}>
                                    <div style={sumRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                    <div style={sumRow}><span>Total VAT</span><span>{fmt(totalVat)}</span></div>
                                    <div style={grandRow}><span>TOTAL ({meta.currency})</span><span style={{fontSize:'1.3rem'}}>{fmt(grandTotal)}</span></div>
                                </div>
                            </div>

                            <div style={paperFooter}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footerInp} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlInp} />
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Professional Document generated by shbstores.com</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper { box-sizing: border-box; transition: box-shadow 0.3s; box-shadow: 0 0 20px rgba(0,0,0,0.3); }
                #invoice-paper input, #invoice-paper textarea { 
                    color: #000 !important; 
                    background: transparent !important; 
                    border: none; 
                    outline: none; 
                    font-family: inherit;
                }
                #invoice-paper input:hover, #invoice-paper textarea:hover { 
                    background: rgba(56, 189, 248, 0.05) !important; 
                }
            `}</style>
        </Head>
    );
}

// --- STYLES (Keep as you have them, with slight tweaks for alignment) ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 15px 0' };
const lCaption = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px' };
const inpStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' };
const selStyle = { ...inpStyle, cursor: 'pointer', marginBottom: '10px' };
const paperStyle = { background: '#ffffff', color: '#000000', padding: '15mm', display: 'flex', flexDirection: 'column' };
const titleInput = { fontSize: '2.5rem', fontWeight: '900', color: '#000', width: '100%', textTransform: 'uppercase' };
const companyTitle = { fontSize: '1.4rem', fontWeight: 'bold', width: '100%', marginTop: '10px' };
const addrInput = { width: '100%', fontSize: '0.85rem', color: '#475569', height: '50px', marginTop: '5px' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' };
const trnLine = { fontSize: '0.85rem', fontWeight: 'bold', marginTop: '10px' };
const trnInp = { borderBottom: '1px dashed #cbd5e1 !important', width: '180px', marginLeft: '5px' };
const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '6px' };
const mInp = { width: '120px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagLabel = { fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', display: 'block' };
const clientTitle = { fontSize: '1.25rem', fontWeight: 'bold', width: '100%' };
const tableBody = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const tableHeaderRow = { borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' };
const tc = { padding: '10px 8px', fontSize: '0.85rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemRow = { verticalAlign: 'top' };
const rawInp = { width: '100%', fontSize: '0.85rem' };
const addLineBtn = { width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#38bdf8', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold', borderRadius: '8px' };
const delBtn = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' };
const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '8px' };
const notesArea = { width: '100%', height: '80px', border: 'none', background: '#f8fafc', padding: '10px', fontSize: '0.85rem', borderRadius: '8px' };
const paperFooter = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footerInp = { width: '100%', textAlign: 'center', fontSize: '0.95rem', fontWeight: 'bold' };
const urlInp = { width: '50%', fontSize: '0.7rem', color: '#94a3b8' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const btnExport = { background: '#38bdf8', color: '#0f172a', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
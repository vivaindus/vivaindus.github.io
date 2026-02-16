import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ProfessionalGlobalInvoice() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // --- State: Meta & Compliance ---
    const [meta, setMeta] = useState({
        logo: null,
        logoAlign: 'flex-start',
        invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2024-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0],
        currency: 'AED',
        decimals: 2, // Adjustable decimals (2 for UAE, 3 for Oman)
        senderName: 'Your Business Name',
        senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        clientName: 'Client Company Name',
        clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Client Location, City, Country',
        notes: 'Reverse Charge applies if applicable.',
        footerMsg: 'Authorized Signatory', // Custom Centered Footer
    });

    // --- State: Items ---
    const [items, setItems] = useState([
        { id: 1, code: 'SRV-01', desc: 'Item Description', qty: 1, price: 0, vatRate: 5 }
    ]);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_global_invoice_v4');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_global_invoice_v4', JSON.stringify({ meta, items }));
        showToast('Business data saved locally! ✅');
    };

    // --- Logic: Hard Reset ---
    const handleHardReset = () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete your saved company details, TRN, and logo. This action cannot be undone.")) {
            localStorage.removeItem('shb_global_invoice_v4');
            window.location.reload(true); // Hard refresh
        }
    };

    // --- Logic: Formatting ---
    const fmt = (num) => parseFloat(num).toFixed(meta.decimals);

    const calculateLineVat = (qty, price, rate) => (qty * price) * (rate / 100);
    const calculateLineTotal = (qty, price, rate) => (qty * price) + calculateLineVat(qty, price, rate);

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const totalVat = items.reduce((acc, item) => acc + calculateLineVat(item.qty, item.price, item.vatRate), 0);
    const grandTotal = subtotal + totalVat;

    // --- Handlers ---
    const showToast = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setMeta({ ...meta, logo: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const exportFile = async (type) => {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Generating Professional ${type.toUpperCase()}...`);
        const dataUrl = await toPng(invoiceRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });

        if (type === 'png') {
            const link = document.createElement('a');
            link.download = `${meta.invoiceNum}.png`;
            link.href = dataUrl;
            link.click();
        } else {
            const pdf = new jsPDF('p', 'mm', pageSize.toLowerCase());
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Handle simple multi-page by adding full height image
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${meta.invoiceNum}.pdf`);
        }
    };

    return (
        <ToolboxLayout title="Universal Tax Invoice Suite" description="UAE & GCC compliant tax invoice generator with adjustable decimals and logo branding.">
            <div style={{ maxWidth: '1450px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLS PANEL --- */}
                    <aside style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Settings & Compliance</h3>
                            
                            <label style={lCaption}>Decimal Places (2 for UAE, 3 for Oman)</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selStyle}>
                                <option value={2}>2 Decimals (Standard)</option>
                                <option value={3}>3 Decimals (OMR/BHD/KWD)</option>
                                <option value={0}>0 Decimals</option>
                            </select>

                            <label style={lCaption}>Page Size</label>
                            <select value={pageSize} onChange={(e)=>setPageSize(e.target.value)} style={selStyle}>
                                <option value="A4">A4 International</option>
                                <option value="Letter">US Letter</option>
                            </select>

                            <label style={lCaption}>Upload Logo</label>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Save & Export</h3>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE TEMPLATE</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>📄 PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>🖼️ PNG</button>
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={{...cardTitle, color: '#f87171'}}>Danger Zone</h3>
                            <button onClick={handleHardReset} style={btnReset}>🗑️ HARD RESET ALL DATA</button>
                        </div>
                    </aside>

                    {/* --- THE INVOICE PAPER (STRICT WHITE/BLACK) --- */}
                    <main style={{ flex: '3', minWidth: '350px' }}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperStyle, width: pageSize === 'A4' ? '210mm' : '215.9mm' }}>
                            
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '10px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '80px' }} alt="Company Logo" /> : <div style={{height:'80px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={titleInput} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={companyTitle} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrInput} />
                                    <div style={trnLine}>Supplier TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnInp} /></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={mRow}><span>Invoice No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply Date:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Currency:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...mInp, fontWeight:'bold'}} /></div>
                                </div>
                            </div>

                            <div style={{ margin: '30px 0' }}>
                                <span style={tagLabel}>BILL TO</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientTitle} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrInput} />
                                <div style={trnLine}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnInp} /></div>
                            </div>

                            <table style={tableBody}>
                                <thead>
                                    <tr style={tableHeaderRow}>
                                        <th style={cellStyle}>Code</th>
                                        <th style={{...cellStyle, width:'35%'}}>Description</th>
                                        <th style={cellStyle}>Qty</th>
                                        <th style={cellStyle}>Unit Price</th>
                                        <th style={cellStyle}>VAT %</th>
                                        <th style={cellStyle}>VAT Amt</th>
                                        <th style={{...cellStyle, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={item.id} style={itemRow}>
                                            <td style={cellStyle}><input value={item.code} onChange={(e)=>updateItem(item.id, 'code', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input type="number" value={item.vatRate} onChange={(e)=>updateItem(item.id, 'vatRate', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}>{fmt(calculateLineVat(item.qty, item.price, item.vatRate))}</td>
                                            <td style={{...cellStyle, textAlign:'right', fontWeight:'bold'}}>
                                                {fmt(calculateLineTotal(item.qty, item.price, item.vatRate))}
                                                <button onClick={()=>removeItem(item.id)} className="no-print" style={delBtn}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setItems([...items, {id: Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addLineBtn}>+ Add Item Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', pageBreakInside: 'avoid' }}>
                                <div style={{ width: '55%' }}>
                                    <span style={tagLabel}>NOTES & TERMS</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesArea} />
                                </div>
                                <div style={{ width: '250px' }}>
                                    <div style={sumRow}><span>Net Subtotal:</span><span>{fmt(subtotal)}</span></div>
                                    <div style={sumRow}><span>VAT Total:</span><span>{fmt(totalVat)}</span></div>
                                    <div style={grandRow}>
                                        <span>TOTAL {meta.currency}</span>
                                        <span>{fmt(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC FOOTER & PAGE NUMBERING */}
                            <div style={paperFooter}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footerInp} />
                                <div style={{fontSize:'0.65rem', color:'#94a3b8', marginTop:'10px'}}>Generated via SHB ToolBox • Page 1 of 1</div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- SEO SECTION --- */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Gold Standard in Global Tax Invoicing</h2>
                    <p>SHB Professional Invoice Suite is engineered to adapt to international tax jurisdictions, including the UAE, Oman, Saudi Arabia, and the UK. By providing <strong>granular decimal control</strong>, we ensure that businesses operating in currencies like the Omani Rial (3 decimals) or the Japanese Yen (0 decimals) can maintain perfect accounting accuracy.</p>
                    
                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Strict Compliance & Data Privacy</h3>
                    <p>Our platform enforces a <strong>White-Label Policy</strong>. Every invoice generated is forced into a high-contrast black-on-white format, ensuring it meets legal submission standards for government audits and bank reviews. With local browser storage, your TRN and company details are preserved privately on your machine, never touching the cloud.</p>
                </div>
            </div>

            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper input, #invoice-paper textarea { color: #000 !important; background: transparent !important; }
                #invoice-paper input:focus, #invoice-paper textarea:focus { background: #f8fafc !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- STYLING OBJECTS ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 15px 0' };
const lCaption = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px' };
const inpStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' };
const selStyle = { ...inpStyle, cursor: 'pointer', marginBottom: '10px' };

const paperStyle = { background: '#ffffff', color: '#000000', padding: '20mm', margin: '0 auto', boxShadow: '0 10px 50px rgba(0,0,0,0.5)', minHeight: '297mm', display: 'flex', flexDirection: 'column' };
const titleInput = { fontSize: '2.8rem', fontWeight: '900', border: 'none', outline: 'none', width: '100%', color: '#000' };
const companyTitle = { fontSize: '1.4rem', fontWeight: 'bold', border: 'none', outline: 'none', width: '100%', marginTop: '10px' };
const addrInput = { border: 'none', outline: 'none', width: '100%', resize: 'none', fontSize: '0.85rem', color: '#475569', height: '50px', lineHeight: '1.4' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' };
const trnLine = { fontSize: '0.85rem', fontWeight: 'bold', color: '#000' };
const trnInp = { border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', width: '180px', fontWeight: 'bold' };

const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '5px' };
const mInp = { border: 'none', width: '110px', textAlign: 'right', outline: 'none', borderBottom: '1px solid #eee' };
const tagLabel = { fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' };
const clientTitle = { fontSize: '1.2rem', fontWeight: 'bold', border: 'none', outline: 'none', width: '100%' };

const tableBody = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const tableHeaderRow = { borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' };
const cellStyle = { padding: '12px 8px', fontSize: '0.8rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemRow = { verticalAlign: 'top' };
const rawInp = { border: 'none', width: '100%', outline: 'none', fontSize: '0.8rem', padding: '5px 0' };

const addLineBtn = { width: '100%', padding: '10px', background: 'none', border: '1px dashed #cbd5e1', color: '#94a3b8', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' };
const delBtn = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '5px' };

const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px', background: '#f8fafc' };
const notesArea = { width: '100%', height: '80px', border: 'none', background: '#f8fafc', padding: '10px', fontSize: '0.8rem', resize: 'none', outline: 'none' };

const paperFooter = { marginTop: 'auto', paddingTop: '50px', textAlign: 'center', borderTop: '1px solid #f1f5f9' };
const footerInp = { width: '80%', border: 'none', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none' };

const btnSave = { width: '100%', background: '#34d399', border: 'none', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnExport = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer', flex: 1 };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10000, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
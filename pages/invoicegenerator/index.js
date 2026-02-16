import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ProfessionalTaxInvoice() {
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
        decimals: 2, 
        senderName: 'Your Business Name',
        senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        clientName: 'Client Company Name',
        clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Client Location, City, Country',
        notes: 'Reverse Charge applies if applicable. Thank you for your business.',
        footerMsg: 'Authorized Signatory', 
        footerUrl: 'https://www.shbstores.com/invoicegenerator' // Editable Link
    });

    const [items, setItems] = useState([
        { id: 1, code: 'SRV-01', desc: 'Item Description', qty: 1, price: 0, vatRate: 5 }
    ]);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_global_invoice_v5');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_global_invoice_v5', JSON.stringify({ meta, items }));
        showToast('Settings saved to browser! ✅');
    };

    const handleHardReset = () => {
        if (window.confirm("CRITICAL: This will delete all saved templates and clear the workspace. Continue?")) {
            localStorage.removeItem('shb_global_invoice_v5');
            window.location.reload();
        }
    };

    // --- Logic: Formatting ---
    const fmt = (num) => {
        const val = parseFloat(num);
        return isNaN(val) ? (0).toFixed(meta.decimals) : val.toFixed(meta.decimals);
    };

    const calculateLineVat = (item) => (item.qty * item.price) * (item.vatRate / 100);
    const calculateLineTotal = (item) => (item.qty * item.price) + calculateLineVat(item);

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const totalVat = items.reduce((acc, item) => acc + calculateLineVat(item), 0);
    const grandTotal = subtotal + totalVat;

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

    const updateItem = (id, field, value) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    // --- High Quality Multi-Page Export Engine ---
    const exportFile = async (type) => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Rendering ${type.toUpperCase()}... Please wait.`);

        // Force precise scale for A4/Letter dimensions
        const canvas = await toCanvas(invoiceRef.current, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        
        if (type === 'png') {
            const link = document.createElement('a');
            link.download = `${meta.invoiceNum}.png`;
            link.href = imgData;
            link.click();
        } else {
            const pdf = new jsPDF('p', 'mm', pageSize.toLowerCase());
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Subsequent Pages
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`${meta.invoiceNum}.pdf`);
        }
        showToast('Document Ready! ✅');
    };

    return (
        <ToolboxLayout title="Pro Tax Invoice Generator" description="Advanced multi-page UAE and Global Tax Invoice Suite with TRN and Logo support.">
            <div style={{ maxWidth: '1450px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLS --- */}
                    <aside style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Settings</h3>
                            <label style={lCaption}>Decimals</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selStyle}>
                                <option value={2}>2 (UAE Standard)</option>
                                <option value={3}>3 (Oman/Bahrain)</option>
                            </select>

                            <label style={lCaption}>Paper Size</label>
                            <select value={pageSize} onChange={(e)=>setPageSize(e.target.value)} style={selStyle}>
                                <option value="A4">A4 (210x297mm)</option>
                                <option value="Letter">Letter (8.5x11in)</option>
                            </select>

                            <label style={lCaption}>Upload Logo</label>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE DATA LOCALLY</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>📄 PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>🖼️ PNG</button>
                            </div>
                        </div>

                        <button onClick={handleHardReset} style={btnReset}>🗑️ RESET WORKSPACE</button>
                    </aside>

                    {/* --- THE PAPER --- */}
                    <main style={{ flex: '3', overflowX: 'auto', background: '#334155', padding: '40px', borderRadius: '8px' }}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ 
                            ...paperStyle, 
                            width: pageSize === 'A4' ? '210mm' : '215.9mm',
                            backgroundColor: '#ffffff'
                        }}>
                            
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '10px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '70px' }} alt="Logo" /> : <div style={{height:'70px'}}></div>}
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
                                <thead style={tableHeaderRow}>
                                    <tr>
                                        <th style={cellStyle}>Code</th>
                                        <th style={{...cellStyle, width:'35%'}}>Description</th>
                                        <th style={cellStyle}>Qty</th>
                                        <th style={cellStyle}>Price</th>
                                        <th style={cellStyle}>VAT %</th>
                                        <th style={cellStyle}>VAT Amt</th>
                                        <th style={{...cellStyle, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} style={itemRow}>
                                            <td style={cellStyle}><input value={item.code} onChange={(e)=>updateItem(item.id, 'code', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><textarea value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={{...rawInp, resize:'none'}} /></td>
                                            <td style={cellStyle}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}><input type="number" value={item.vatRate} onChange={(e)=>updateItem(item.id, 'vatRate', e.target.value)} style={rawInp} /></td>
                                            <td style={cellStyle}>{fmt(calculateLineVat(item))}</td>
                                            <td style={{...cellStyle, textAlign:'right', fontWeight:'bold'}}>
                                                {fmt(calculateLineTotal(item))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delBtn}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setItems([...items, {id: Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addLineBtn} className="no-print">+ Add Item Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', pageBreakInside: 'avoid' }}>
                                <div style={{ width: '55%' }}>
                                    <span style={tagLabel}>NOTES & TERMS</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesArea} />
                                </div>
                                <div style={{ width: '250px' }}>
                                    <div style={sumRow}><span>Subtotal:</span><span>{fmt(subtotal)}</span></div>
                                    <div style={sumRow}><span>VAT Total:</span><span>{fmt(totalVat)}</span></div>
                                    <div style={grandRow}>
                                        <span>TOTAL {meta.currency}</span>
                                        <span>{fmt(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={paperFooter}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footerInp} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlInp} />
                                    <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Page 1 of 1</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper { color: #000 !important; background: #fff !important; }
                #invoice-paper input, #invoice-paper textarea { color: #000 !important; background: transparent !important; border: none; outline: none; }
                #invoice-paper input:hover { background: #f8fafc !important; }
                tr { page-break-inside: avoid !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- STYLING ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 15px 0' };
const lCaption = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px' };
const inpStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' };
const selStyle = { ...inpStyle, cursor: 'pointer', marginBottom: '10px' };

const paperStyle = { background: '#ffffff', color: '#000000', padding: '15mm 20mm', margin: '0 auto', minHeight: '297mm', display: 'flex', flexDirection: 'column' };
const titleInput = { fontSize: '2.5rem', fontWeight: '900', color: '#000', width: '100%' };
const companyTitle = { fontSize: '1.4rem', fontWeight: 'bold', width: '100%', marginTop: '5px' };
const addrInput = { width: '100%', fontSize: '0.85rem', color: '#475569', height: '45px' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px' };
const trnLine = { fontSize: '0.85rem', fontWeight: 'bold' };
const trnInp = { borderBottom: '1px dashed #cbd5e1 !important', width: '180px' };

const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '5px' };
const mInp = { width: '110px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagLabel = { fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', marginBottom: '5px' };
const clientTitle = { fontSize: '1.2rem', fontWeight: 'bold', width: '100%' };

const tableBody = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const tableHeaderRow = { borderTop: '2px solid #000', borderBottom: '2px solid #000' };
const cellStyle = { padding: '10px 8px', fontSize: '0.8rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemRow = { verticalAlign: 'top' };
const rawInp = { width: '100%', fontSize: '0.8rem' };

const addLineBtn = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#94a3b8', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' };
const delBtn = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' };

const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' };
const notesArea = { width: '100%', height: '60px', border: 'none', background: '#f8fafc', padding: '10px', fontSize: '0.8rem' };

const paperFooter = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footerInp = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const urlInp = { width: '50%', fontSize: '0.65rem', color: '#cbd5e1', fontStyle: 'italic' };

const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const btnExport = { background: '#38bdf8', color: '#0f172a', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', marginTop: 'auto' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10000 };
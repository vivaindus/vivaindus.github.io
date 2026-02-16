import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { jsPDF } from 'jspdf';

export default function ProfessionalInvoice() {
    // --- State Management ---
    const [businessData, setBusinessData] = useState({
        logo: null,
        logoAlign: 'flex-start',
        companyName: 'SHB SOLUTIONS LTD',
        companyAddress: '123 Business Way, Dubai, UAE',
        invoiceTitle: 'INVOICE',
        invoiceNum: 'INV-1001',
        date: new Date().toISOString().split('T')[0],
        clientName: 'Valued Client',
        clientAddress: 'Client Office, Suite 404',
        notes: 'Thank you for your business. Please pay within 15 days.',
        taxRate: 5,
        currency: '$'
    });

    const [columns, setColumns] = useState({
        item: 'Description',
        qty: 'Qty',
        price: 'Unit Price',
        total: 'Amount'
    });

    const [items, setItems] = useState([{ id: 1, desc: 'Professional Consultation', qty: 1, price: 150 }]);
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // --- Persistence (Local Storage) ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_invoice_pro_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            setBusinessData(parsed.business);
            setColumns(parsed.cols);
            setItems(parsed.items);
        }
    }, []);

    const saveLocally = () => {
        const dataToSave = { business: businessData, cols: columns, items: items };
        localStorage.setItem('shb_invoice_pro_data', JSON.stringify(dataToSave));
        showToast('Settings saved locally! ✅');
    };

    // --- Handlers ---
    const showToast = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => setBusinessData({ ...businessData, logo: readerEvent.target.result });
            reader.readAsDataURL(file);
        }
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const taxTotal = (subtotal * businessData.taxRate) / 100;
    const grandTotal = subtotal + taxTotal;

    // --- Export Logic ---
    const exportImage = async (format) => {
        const { toPng } = await import('html-to-image');
        if (!invoiceRef.current) return;
        
        showToast(`Preparing ${format.toUpperCase()}...`);
        const dataUrl = await toPng(invoiceRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
        
        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `${businessData.invoiceNum}.png`;
            link.href = dataUrl;
            link.click();
        } else {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${businessData.invoiceNum}.pdf`);
        }
    };

    return (
        <ToolboxLayout title="Pro Invoice Suite" description="Generate high-end business invoices with custom branding, local storage, and PDF/PNG export.">
            <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* --- SIDEBAR CONTROLS --- */}
                    <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <section style={cardStyle}>
                            <h3 style={sectionHeading}>Branding & Layout</h3>
                            <label style={labelStyle}>Company Logo</label>
                            <input type="file" onChange={handleLogoUpload} style={inputStyle} />
                            
                            <label style={labelStyle}>Logo Alignment</label>
                            <select value={businessData.logoAlign} onChange={(e)=>setBusinessData({...businessData, logoAlign: e.target.value})} style={inputStyle}>
                                <option value="flex-start">Left</option>
                                <option value="center">Center</option>
                                <option value="flex-end">Right</option>
                            </select>

                            <label style={labelStyle}>Currency Symbol</label>
                            <input type="text" value={businessData.currency} onChange={(e)=>setBusinessData({...businessData, currency: e.target.value})} style={inputStyle} />
                        </section>

                        <section style={cardStyle}>
                            <h3 style={sectionHeading}>Custom Labels</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                <div><label style={labelStyle}>Header: Item</label><input value={columns.item} onChange={(e)=>setColumns({...columns, item: e.target.value})} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Header: Qty</label><input value={columns.qty} onChange={(e)=>setColumns({...columns, qty: e.target.value})} style={inputStyle} /></div>
                            </div>
                        </section>

                        <section style={cardStyle}>
                            <h3 style={sectionHeading}>Actions</h3>
                            <button onClick={saveLocally} style={btnSecondary}>💾 SAVE TEMPLATE LOCALLY</button>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'10px'}}>
                                <button onClick={() => exportImage('pdf')} style={btnPrimary}>📄 GET PDF</button>
                                <button onClick={() => exportImage('png')} style={btnPrimary}>🖼️ GET PNG</button>
                            </div>
                        </section>
                    </div>

                    {/* --- MAIN LIVE INVOICE AREA --- */}
                    <div style={{ flex: 2.5, minWidth: '350px' }}>
                        <div ref={invoiceRef} style={paperStyle}>
                            
                            {/* Logo Area */}
                            {businessData.logo && (
                                <div style={{ display: 'flex', justifyContent: businessData.logoAlign, marginBottom: '20px' }}>
                                    <img src={businessData.logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px' }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div>
                                    <input value={businessData.companyName} onChange={(e)=>setBusinessData({...businessData, companyName: e.target.value})} style={brandInput} />
                                    <textarea value={businessData.companyAddress} onChange={(e)=>setBusinessData({...businessData, companyAddress: e.target.value})} style={addressInput} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <input value={businessData.invoiceTitle} onChange={(e)=>setBusinessData({...businessData, invoiceTitle: e.target.value})} style={{...brandInput, textAlign:'right', color:'#38bdf8', fontSize:'1.8rem'}} />
                                    <p># <input value={businessData.invoiceNum} onChange={(e)=>setBusinessData({...businessData, invoiceNum: e.target.value})} style={ghostInput} /></p>
                                    <p><input type="date" value={businessData.date} onChange={(e)=>setBusinessData({...businessData, date: e.target.value})} style={ghostInput} /></p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                                <div style={infoBlock}>
                                    <span style={labelCaption}>BILL TO</span>
                                    <input value={businessData.clientName} onChange={(e)=>setBusinessData({...businessData, clientName: e.target.value})} style={boldInput} />
                                    <textarea value={businessData.clientAddress} onChange={(e)=>setBusinessData({...businessData, clientAddress: e.target.value})} style={addressInput} />
                                </div>
                            </div>

                            {/* Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={thStyle}>{columns.item}</th>
                                        <th style={thStyle}>{columns.qty}</th>
                                        <th style={thStyle}>{columns.price}</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>{columns.total}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={tdStyle}><input value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={itemInput} /></td>
                                            <td style={tdStyle}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', parseFloat(e.target.value))} style={itemInput} /></td>
                                            <td style={tdStyle}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', parseFloat(e.target.value))} style={itemInput} /></td>
                                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>{businessData.currency}{(item.qty * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <button onClick={()=>setItems([...items, {id: Date.now(), desc:'', qty:1, price:0}])} style={{marginTop:'10px', background:'none', border:'1px dashed #cbd5e1', width:'100%', padding:'10px', cursor:'pointer', color:'#64748b'}}>+ Add New Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{width:'50%'}}>
                                    <span style={labelCaption}>NOTES & TERMS</span>
                                    <textarea value={businessData.notes} onChange={(e)=>setBusinessData({...businessData, notes: e.target.value})} style={notesInput} />
                                </div>
                                <div style={{ width: '220px' }}>
                                    <div style={sumRow}><span>Subtotal</span><span>{businessData.currency}{subtotal.toFixed(2)}</span></div>
                                    <div style={sumRow}><span>Tax (<input type="number" value={businessData.taxRate} onChange={(e)=>setBusinessData({...businessData, taxRate: e.target.value})} style={{width:'35px', background:'none', border:'none', fontWeight:'bold'}} />%)</span><span>{businessData.currency}{taxTotal.toFixed(2)}</span></div>
                                    <div style={grandRow}><span>TOTAL</span><span>{businessData.currency}{grandTotal.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SEO SECTION --- */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Cloud-Free Billing & Invoice Management</h2>
                    <p>The SHB Invoice Suite is a best-in-class utility designed for modern entrepreneurs, freelancers, and small business owners. Managing accounts receivable requires tools that are not only professional in output but also respect the privacy of your financial data.</p>
                    
                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Custom Branding & Design Control</h3>
                    <p>Standard templates often lack the flexibility needed for real branding. Our generator provides full control over your <strong>Company Logo</strong>, including precision alignment and sizing. You can also customize every <strong>Column Header</strong>, allowing the tool to adapt to any industry—from time-based consulting to product-based shipping.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Smart Persistence with Local Storage</h3>
                    <p>Unlike many online tools that force you to re-type your business name every time, SHB ToolBox uses <strong>Persistent Local Storage</strong>. This saves your business address, tax rates, and branding settings directly in your browser. Your data remains on your machine—never uploaded to the cloud—ensuring you can generate recurring invoices in seconds without privacy risks.</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLING ---
const cardStyle = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
const sectionHeading = { color: '#38bdf8', fontSize: '1rem', marginTop: 0, marginBottom: '15px' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', marginBottom: '10px' };
const paperStyle = { background: '#fff', color: '#000', padding: '50px', borderRadius: '4px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', minHeight: '800px' };
const brandInput = { background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 'bold', width: '100%', outline: 'none' };
const addressInput = { background: 'none', border: 'none', width: '100%', fontSize: '0.85rem', color: '#475569', resize: 'none', outline: 'none' };
const ghostInput = { background: 'none', border: 'none', width: '120px', fontSize: '0.9rem', textAlign: 'right', outline: 'none' };
const labelCaption = { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const boldInput = { background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', width: '100%', outline: 'none' };
const thStyle = { padding: '12px 10px', fontSize: '0.8rem', color: '#475569' };
const tdStyle = { padding: '15px 10px' };
const itemInput = { border: 'none', background: 'none', width: '100%', outline: 'none', fontSize: '0.9rem' };
const notesInput = { background: '#f8fafc', border: 'none', width: '100%', height: '100px', padding: '10px', fontSize: '0.8rem', outline: 'none', resize: 'none' };
const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', fontWeight: 'bold', marginTop: '10px', fontSize: '1.1rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' };
const btnSecondary = { background: '#34d399', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const infoBlock = { borderLeft: '4px solid #f1f5f9', paddingLeft: '15px' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 25px', borderRadius: '10px', fontWeight: 'bold', zIndex: 9999, boxShadow: '0 5px 20px rgba(0,0,0,0.2)' };
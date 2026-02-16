import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ProfessionalTaxInvoice() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // --- State: Business & Compliance Data ---
    const [meta, setMeta] = useState({
        logo: null,
        logoAlign: 'flex-start',
        invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2024-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0],
        currency: 'AED',
        // Supplier
        senderName: 'Your Business Name',
        senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        // Recipient
        clientName: 'Client Company Name',
        clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Industrial Area, Sharjah, UAE',
        notes: 'Reverse Charge applies if applicable. Please pay within 15 days.',
    });

    // --- State: Line Items ---
    const [items, setItems] = useState([
        { id: 1, code: 'SRV-01', desc: 'Software Development', qty: 1, price: 1000, vatRate: 5 }
    ]);

    // --- Local Storage Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_tax_invoice_v3');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_tax_invoice_v3', JSON.stringify({ meta, items }));
        showToast('Business data saved locally! ✅');
    };

    // --- Logic: Calculations ---
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

    const addItem = () => setItems([...items, { id: Date.now(), code: '', desc: '', qty: 1, price: 0, vatRate: 5 }]);
    
    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id) => items.length > 1 && setItems(items.filter(i => i.id !== id));

    // --- Export Logic (High Quality) ---
    const exportFile = async (type) => {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Generating ${type.toUpperCase()}...`);
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
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${meta.invoiceNum}.pdf`);
        }
    };

    return (
        <ToolboxLayout title="UAE Tax Invoice Generator" description="Create UAE VAT compliant tax invoices with TRN, line-level tax, and PDF export.">
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONFIGURATION PANEL (LEFT) --- */}
                    <aside style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Page & Branding</h3>
                            <label style={lCaption}>Page Format</label>
                            <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={selStyle}>
                                <option value="A4">A4 Standard</option>
                                <option value="Letter">Letter (US)</option>
                            </select>
                            
                            <label style={lCaption}>Company Logo</label>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                            
                            <label style={lCaption}>Logo Position</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Quick Save</h3>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE AS DEFAULT TEMPLATE</button>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '10px' }}>Saves your company name, TRN, and address to this browser.</p>
                        </div>

                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Export Options</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>📄 PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>🖼️ PNG</button>
                            </div>
                        </div>
                    </aside>

                    {/* --- LIVE INVOICE (CENTER) --- */}
                    <main style={{ flex: '3', minWidth: '350px' }}>
                        <div ref={invoiceRef} style={{ ...paperStyle, width: pageSize === 'A4' ? '210mm' : '215.9mm', minHeight: pageSize === 'A4' ? '297mm' : '279.4mm' }}>
                            
                            {/* Prominent Tax Invoice Header */}
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '20px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '70px' }} alt="Logo" /> : <div style={{ height: '70px' }}></div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                                <div>
                                    <input value={meta.invoiceTitle} onChange={(e) => setMeta({ ...meta, invoiceTitle: e.target.value })} style={titleInput} />
                                    <input value={meta.senderName} onChange={(e) => setMeta({ ...meta, senderName: e.target.value })} style={companyTitle} />
                                    <textarea value={meta.senderAddress} onChange={(e) => setMeta({ ...meta, senderAddress: e.target.value })} style={addrInput} />
                                    <div style={trnLabel}>TRN: <input value={meta.senderTRN} onChange={(e) => setMeta({ ...meta, senderTRN: e.target.value })} style={trnInput} /></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={metaGroup}><span>Invoice #</span><input value={meta.invoiceNum} onChange={(e) => setMeta({ ...meta, invoiceNum: e.target.value })} style={metaInp} /></div>
                                    <div style={metaGroup}><span>Date of Issue</span><input type="date" value={meta.invoiceDate} onChange={(e) => setMeta({ ...meta, invoiceDate: e.target.value })} style={metaInp} /></div>
                                    <div style={metaGroup}><span>Date of Supply</span><input type="date" value={meta.supplyDate} onChange={(e) => setMeta({ ...meta, supplyDate: e.target.value })} style={metaInp} /></div>
                                    <div style={metaGroup}><span>Currency</span><input value={meta.currency} onChange={(e) => setMeta({ ...meta, currency: e.target.value })} style={metaInp} /></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <span style={lblSection}>BILL TO:</span>
                                <input value={meta.clientName} onChange={(e) => setMeta({ ...meta, clientName: e.target.value })} style={clientTitle} />
                                <textarea value={meta.clientAddress} onChange={(e) => setMeta({ ...meta, clientAddress: e.target.value })} style={addrInput} />
                                <div style={trnLabel}>Recipient TRN: <input value={meta.clientTRN} onChange={(e) => setMeta({ ...meta, clientTRN: e.target.value })} style={trnInput} /></div>
                            </div>

                            {/* VAT Table */}
                            <table style={tableMain}>
                                <thead>
                                    <tr style={thRow}>
                                        <th style={tc}>Code</th>
                                        <th style={{ ...tc, width: '30%' }}>Description</th>
                                        <th style={tc}>Qty</th>
                                        <th style={tc}>Unit Price</th>
                                        <th style={tc}>VAT %</th>
                                        <th style={tc}>VAT Amt</th>
                                        <th style={{ ...tc, textAlign: 'right' }}>Total ({meta.currency})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} style={tdRow}>
                                            <td style={tc}><input value={item.code} onChange={(e) => updateItem(item.id, 'code', e.target.value)} style={cellInp} /></td>
                                            <td style={tc}><input value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} style={cellInp} /></td>
                                            <td style={tc}><input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} style={cellInp} /></td>
                                            <td style={tc}><input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} style={cellInp} /></td>
                                            <td style={tc}><input type="number" value={item.vatRate} onChange={(e) => updateItem(item.id, 'vatRate', e.target.value)} style={cellInp} /></td>
                                            <td style={tc}>{calculateLineVat(item.qty, item.price, item.vatRate).toFixed(2)}</td>
                                            <td style={{ ...tc, textAlign: 'right', fontWeight: 'bold' }}>
                                                {calculateLineTotal(item.qty, item.price, item.vatRate).toFixed(2)}
                                                <button onClick={() => removeItem(item.id)} className="no-print" style={btnDel}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={addItem} style={btnAddLine}>+ ADD ITEM</button>

                            {/* Summary & Totals */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{ width: '50%' }}>
                                    <span style={lblSection}>NOTES & DECLARATIONS</span>
                                    <textarea value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} style={notesInp} />
                                </div>
                                <div style={{ width: '250px' }}>
                                    <div style={summRow}><span>Net Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
                                    <div style={summRow}><span>Total VAT</span><span>{totalVat.toFixed(2)}</span></div>
                                    <div style={grandRow}><span>GRAND TOTAL</span><span>{meta.currency} {grandTotal.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>UAE VAT Compliant Tax Invoice Solutions</h2>
                    <p>The SHB Tax Invoice Suite is designed to meet the rigorous requirements of the Federal Tax Authority (FTA) of the UAE. Under the UAE VAT law, a Tax Invoice must contain specific mandatory fields to be legally valid for input tax recovery. Our generator simplifies this process, ensuring your documentation is always professional and compliant.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Mandatory UAE Tax Invoice Requirements</h3>
                    <p>Our tool integrates all elements required by UAE law, including:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>"Tax Invoice" Designation:</strong> Must be displayed prominently at the top of the document.</li>
                        <li><strong>TRN Tracking:</strong> Dedicated fields for the Tax Registration Number (TRN) of both the supplier and the recipient.</li>
                        <li><strong>Sequential Numbering:</strong> A unique identification number for easy tracking and auditing.</li>
                        <li><strong>Supply vs. Issue Dates:</strong> Distinct fields for the date of the invoice and the date the actual supply occurred.</li>
                        <li><strong>Line-Level VAT Breakdown:</strong> Detailed calculations for each line item including unit price, quantity, tax rate, and tax amount.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Browser-Based Privacy and Persistence</h3>
                    <p>We prioritize your business data security. Using <strong>Local Storage</strong> technology, SHB ToolBox remembers your company details and TRN locally in your browser. No financial data or customer details are ever uploaded to our cloud servers, making this a 100% private tool for small businesses and freelancers.</p>
                </div>
            </div>

            <style jsx>{`
                @media print { .no-print { display: none; } }
                input:hover, textarea:hover { background: #f1f5f9; border-radius: 4px; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- STYLING (Internal Objects for Layout) ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', marginTop: 0, marginBottom: '15px' };
const lCaption = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px' };
const inpStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#fff', marginBottom: '10px' };
const selStyle = { ...inpStyle, cursor: 'pointer' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer', flex: 1 };

const paperStyle = { background: '#fff', color: '#000', padding: '15mm', margin: '0 auto', boxShadow: '0 0 30px rgba(0,0,0,0.5)', overflow: 'hidden' };
const titleInput = { fontSize: '2.5rem', fontWeight: '900', border: 'none', outline: 'none', background: 'none', width: '100%', color: '#000' };
const companyTitle = { fontSize: '1.4rem', fontWeight: 'bold', border: 'none', outline: 'none', background: 'none', width: '100%', marginTop: '10px' };
const clientTitle = { fontSize: '1.1rem', fontWeight: 'bold', border: 'none', outline: 'none', background: 'none', width: '100%' };
const addrInput = { border: 'none', outline: 'none', background: 'none', width: '100%', resize: 'none', fontSize: '0.85rem', color: '#475569', height: '60px' };
const trnLabel = { fontSize: '0.85rem', fontWeight: 'bold', color: '#000', marginTop: '5px' };
const trnInput = { border: 'none', borderBottom: '1px dashed #cbd5e1', outline: 'none', fontSize: '0.85rem', fontWeight: 'bold', width: '150px' };

const metaGroup = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '5px', color: '#475569' };
const metaInp = { border: 'none', borderBottom: '1px solid #e2e8f0', width: '100px', textAlign: 'right', outline: 'none', background: 'none' };
const lblSection = { fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' };

const tableMain = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thRow = { borderTop: '2px solid #000', borderBottom: '2px solid #000' };
const tc = { padding: '12px 8px', fontSize: '0.8rem', textAlign: 'left' };
const tdRow = { borderBottom: '1px solid #f1f5f9' };
const cellInp = { border: 'none', background: 'none', width: '100%', outline: 'none', fontSize: '0.8rem' };

const btnAddLine = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b', cursor: 'pointer', marginTop: '10px' };
const btnDel = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '5px' };

const summRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' };
const notesInp = { width: '100%', height: '100px', border: 'none', background: '#f8fafc', padding: '10px', fontSize: '0.8rem', resize: 'none', outline: 'none' };

const btnSave = { width: '100%', background: '#34d399', border: 'none', color: '#0f172a', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnExport = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10000, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' };
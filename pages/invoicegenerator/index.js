import React, { useState, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function InvoiceGenerator() {
    const [invoiceInfo, setInvoiceInfo] = useState({
        invoiceNum: 'INV-1001',
        date: new Date().toISOString().split('T')[0],
        company: 'Your Company Name',
        client: 'Client Name',
        taxRate: 5
    });

    const [items, setItems] = useState([
        { id: 1, desc: 'Web Design Service', qty: 1, price: 500 }
    ]);

    const invoiceRef = useRef(null);

    const handleInfoChange = (e) => {
        setInvoiceInfo({ ...invoiceInfo, [e.target.name]: e.target.value });
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), desc: 'New Item', qty: 1, price: 0 }]);
    };

    const removeItem = (id) => {
        if (items.length > 1) setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const taxAmount = (subtotal * invoiceInfo.taxRate) / 100;
    const total = subtotal + taxAmount;

    const downloadInvoice = async () => {
        const { toPng } = await import('html-to-image');
        if (invoiceRef.current === null) return;
        
        toPng(invoiceRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${invoiceInfo.invoiceNum}.png`;
                link.href = dataUrl;
                link.click();
            });
    };

    return (
        <ToolboxLayout title="Professional Invoice Generator" description="Create, calculate, and download professional business invoices for free.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Invoice Generator</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Professional billing for freelancers and small businesses.</p>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* INPUT PANEL */}
                    <div style={{ flex: 1, minWidth: '300px', background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' }}>
                        <h4 style={{ color: '#38bdf8', marginTop: 0 }}>Invoice Details</h4>
                        <input type="text" name="company" placeholder="From: Company Name" onChange={handleInfoChange} style={inputStyle} />
                        <input type="text" name="client" placeholder="To: Client Name" onChange={handleInfoChange} style={inputStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input type="text" name="invoiceNum" placeholder="INV-001" onChange={handleInfoChange} style={inputStyle} />
                            <input type="date" name="date" value={invoiceInfo.date} onChange={handleInfoChange} style={inputStyle} />
                        </div>
                        <input type="number" name="taxRate" placeholder="Tax Rate (%)" value={invoiceInfo.taxRate} onChange={handleInfoChange} style={inputStyle} />
                        
                        <button onClick={addItem} style={btnAdd}>+ ADD LINE ITEM</button>
                        <button onClick={downloadInvoice} style={btnPrimary}>💾 DOWNLOAD INVOICE (PNG)</button>
                    </div>

                    {/* LIVE PREVIEW (Actual Invoice) */}
                    <div ref={invoiceRef} style={{ flex: 2, minWidth: '350px', background: '#fff', color: '#000', padding: '40px', borderRadius: '5px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a' }}>INVOICE</h2>
                                <p style={{ color: '#64748b' }}>#{invoiceInfo.invoiceNum}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ margin: 0 }}>{invoiceInfo.company}</h4>
                                <p style={{ fontSize: '0.8rem' }}>Date: {invoiceInfo.date}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>BILL TO:</p>
                            <h4 style={{ margin: 0 }}>{invoiceInfo.client}</h4>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '10px 0' }}>DESCRIPTION</th>
                                    <th>QTY</th>
                                    <th>PRICE</th>
                                    <th style={{ textAlign: 'right' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 0' }}>
                                            <input value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} style={tableInput} />
                                        </td>
                                        <td>
                                            <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} style={{ ...tableInput, width: '40px' }} />
                                        </td>
                                        <td>
                                            <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} style={{ ...tableInput, width: '80px' }} />
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            ${(item.qty * item.price).toFixed(2)}
                                            <button onClick={() => removeItem(item.id)} style={btnDel}>&times;</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginLeft: 'auto', width: '200px' }}>
                            <div style={summaryRow}><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                            <div style={summaryRow}><span>Tax ({invoiceInfo.taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>
                            <div style={{ ...summaryRow, borderTop: '2px solid #0f172a', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px', paddingTop: '10px' }}>
                                <span>TOTAL:</span><span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Online Invoice Generator for Small Businesses</h2>
                    <p>
                        The SHB Invoice Generator is a high-utility business tool designed to simplify the billing process for freelancers, 
                        consultants, and small business owners. Creating a professional invoice is essential for getting paid on time 
                        and maintaining a professional image with your clients.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Key Features of our Billing Suite</h3>
                    <ul>
                        <li><strong>Dynamic Line Items:</strong> Add as many services or products as you need. Our table expands automatically to fit your data.</li>
                        <li><strong>Automatic Math Engine:</strong> Stop using a calculator. Our system automatically updates subtotals, tax amounts, and grand totals in real-time as you adjust quantities and prices.</li>
                        <li><strong>Custom Tax Support:</strong> Whether you need to apply GST, VAT, or a standard sales tax, simply enter your local percentage and we handle the rest.</li>
                        <li><strong>High-Resolution Export:</strong> Download your finished invoice as a high-quality image file that is ready for email attachment or physical printing.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy is Our Business Model</h3>
                    <p>
                        Financial data is highly sensitive. Many "cloud" invoice generators store your client names, earnings, and company details 
                        on their servers. At SHB ToolBox, we prioritize your security. Our tool uses <strong>Client-Side logic</strong>. 
                        Your invoice details are processed entirely in your browser's memory. We do not store your invoices in our 
                        database or Supabase servers. When you close the tab, your data is gone—making this one of the 
                        most secure ways to generate a quick bill.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', marginBottom: '10px' };
const btnAdd = { width: '100%', background: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px', borderRadius: '10px', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const tableInput = { border: 'none', background: 'transparent', fontSize: '0.9rem', width: '100%', outline: 'none' };
const btnDel = { background: 'none', border: 'none', color: '#f87171', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' };
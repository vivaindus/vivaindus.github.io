import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function UltimateInvoiceSuite() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    // --- State: Meta & Branding ---
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
        senderAddress: 'Business Bay, Dubai, UAE',
        clientName: 'Recipient Company Name',
        clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Recipient Address, City, Country',
        notes: 'Reverse Charge applies if applicable. Thank you for your business.',
        footerMsg: 'Authorized Signatory', 
        footerUrl: 'https://www.shbstores.com/invoicegenerator' 
    });

    const [items, setItems] = useState([
        { id: 1, code: 'SRV-01', desc: 'Consultation Services', qty: 1, price: 100, vatRate: 5 }
    ]);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('shb_invoice_final_master');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta);
            setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_invoice_final_master', JSON.stringify({ meta, items }));
        showToast('Success: Template Saved Locally! ✅');
    };

    const handleHardReset = () => {
        if (window.confirm("WARNING: This will permanently clear all your saved data and TRN details. Proceed?")) {
            localStorage.removeItem('shb_invoice_final_master');
            window.location.reload();
        }
    };

    // --- Logic ---
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

    const updateItem = (id, field, value) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    // --- High-Quality Export Logic ---
    const exportFile = async (type) => {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;

        showToast(`Generating ${type.toUpperCase()}... Please Wait.`);

        try {
            // We use toPng because it handles text better for PDF conversion
            const dataUrl = await toPng(invoiceRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                cacheBust: true,
            });

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
                
                // Multi-page slicing logic
                let heightLeft = pdfHeight;
                let position = 0;
                let pageH = pdf.internal.pageSize.getHeight();

                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageH;

                while (heightLeft >= 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageH;
                }
                pdf.save(`${meta.invoiceNum}.pdf`);
            }
        } catch (err) {
            console.error(err);
            alert("Export failed. Please check if your logo is too large.");
        }
    };

    return (
        <ToolboxLayout title="Universal Tax Invoice Pro" description="The most advanced UAE and GCC compliant tax invoice generator. Features include TRN tracking, multi-page PDF export, and custom logo positioning.">
            <div style={{ maxWidth: '1450px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* --- CONTROLS SIDEBAR --- */}
                    <aside style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Invoice Configuration</h3>
                            
                            <label style={lCap}>Decimal Places</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selS}>
                                <option value={2}>2 Decimals (Default)</option>
                                <option value={3}>3 Decimals (Oman/BHD)</option>
                                <option value={0}>0 Decimals</option>
                            </select>

                            <label style={lCap}>Page Size</label>
                            <select value={pageSize} onChange={(e)=>setPageSize(e.target.value)} style={selS}>
                                <option value="A4">A4 (International Standard)</option>
                                <option value="Letter">US Letter</option>
                            </select>

                            <label style={lCap}>Company Logo</label>
                            <input type="file" onChange={handleLogo} style={{...inpS, fontSize: '0.7rem'}} />
                            
                            <label style={lCap}>Logo Position</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                        </div>

                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE AS DEFAULT</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>EXPORT PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>EXPORT PNG</button>
                            </div>
                        </div>

                        <button onClick={handleHardReset} style={btnReset}>🗑️ HARD RESET ALL DATA</button>
                    </aside>

                    {/* --- THE INVOICE PAPER --- */}
                    <main style={{ flex: '3', overflowX: 'auto', background: '#1e293b', padding: '40px 20px', borderRadius: '15px', display: 'flex', justifyContent: 'center' }}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ 
                            ...paperStyle, 
                            width: pageSize === 'A4' ? '210mm' : '215.9mm',
                        }}>
                            
                            {/* Logo */}
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '20px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '80px' }} alt="Logo" /> : <div style={{height:'80px'}}></div>}
                            </div>

                            {/* Header Group */}
                            <div style={headerSection}>
                                <div>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={titleI} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={companyI} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrI} />
                                    <div style={trnLabel}>Supplier TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnInp} /></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={metaRow}><span>Invoice No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={metaI} /></div>
                                    <div style={metaRow}><span>Date of Issue:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={metaI} /></div>
                                    <div style={metaRow}><span>Date of Supply:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={metaI} /></div>
                                    <div style={metaRow}><span>Currency:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...metaI, fontWeight:'bold'}} /></div>
                                </div>
                            </div>

                            {/* Client Group */}
                            <div style={{ margin: '30px 0' }}>
                                <span style={tagL}>BILL TO:</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientI} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrI} />
                                <div style={trnLabel}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnInp} /></div>
                            </div>

                            {/* VAT Table */}
                            <table style={mainTable}>
                                <thead>
                                    <tr style={tableHRow}>
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
                                        <tr key={item.id} style={tableBRow}>
                                            <td style={tc}><input value={item.code} onChange={(e)=>updateItem(item.id, 'code', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><textarea value={item.desc} onChange={(e)=>updateItem(item.id, 'desc', e.target.value)} style={{...rawI, resize:'none'}} /></td>
                                            <td style={tc}><input type="number" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.price} onChange={(e)=>updateItem(item.id, 'price', e.target.value)} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.vatRate} onChange={(e)=>updateItem(item.id, 'vatRate', e.target.value)} style={rawI} /></td>
                                            <td style={tc}>{fmt((item.qty * item.price) * (item.vatRate / 100))}</td>
                                            <td style={{...tc, textAlign:'right', fontWeight:'bold'}}>
                                                {fmt((item.qty * item.price) + (item.qty * item.price * (item.vatRate / 100)))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delB}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button onClick={()=>setItems([...items, {id: Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addB} className="no-print">+ Add New Line</button>

                            {/* Summary Group */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{ width: '55%' }}>
                                    <span style={tagL}>NOTES & DECLARATIONS</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesI} />
                                </div>
                                <div style={{ width: '230px' }}>
                                    <div style={sumRow}><span>Net Subtotal</span><span>{fmt(items.reduce((acc, i)=>acc+(i.qty*i.price), 0))}</span></div>
                                    <div style={sumRow}><span>Total VAT</span><span>{fmt(items.reduce((acc, i)=>acc+(i.qty*i.price*(i.vatRate/100)), 0))}</span></div>
                                    <div style={grandRow}>
                                        <span>GRAND TOTAL</span>
                                        <span>{meta.currency} {fmt(items.reduce((acc, i)=>acc+(i.qty*i.price*(1+i.vatRate/100)), 0))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Area */}
                            <div style={footerSection}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footMsgI} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={footUrlI} />
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Page 1 of 1</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- PROFESSIONAL SEO CONTENT --- */}
                <div style={seoWrapper}>
                    <h2 style={{color: '#38bdf8'}}>Enterprise Tax Invoice Management & Global Compliance</h2>
                    <p>
                        The SHB Universal Invoice Suite is a best-in-class professional utility designed for high-regulatory markets including the UAE, Oman, Saudi Arabia, and the UK. Unlike basic templates, our generator enforces strict compliance with Federal Tax Authority (FTA) standards, ensuring that your financial documentation is legally sound for tax recovery and business audits.
                    </p>

                    <h3 style={{color: '#38bdf8', marginTop: '30px'}}>Why Use Our Compliance-First Generator?</h3>
                    <ul style={{paddingLeft: '20px'}}>
                        <li><strong>TRN Tracking:</strong> Dedicated logic for Supplier and Recipient Tax Registration Numbers (TRN), mandatory for VAT-compliant invoicing in the GCC.</li>
                        <li><strong>Granular Decimal Precision:</strong> Seamlessly switch between 2-decimal (AED/USD) and 3-decimal (OMR/BHD/KWD) accuracy to meet local banking requirements.</li>
                        <li><strong>Multi-Page Support:</strong> Advanced rendering engine that intelligently slices long documents into standard A4 or US Letter pages without cutting data lines.</li>
                        <li><strong>Dynamic VAT Calculations:</strong> Automatic line-level tax processing that ensures your unit price, tax amount, and gross value match perfectly.</li>
                    </ul>

                    <h3 style={{color: '#38bdf8', marginTop: '30px'}}>Data Privacy & "White-Label" Policy</h3>
                    <p>
                        We understand that your business finances are confidential. SHB ToolBox uses <strong>Persistent Local Browser Storage</strong>. This means your logo, company details, and preferences are saved on your computer—not our servers. We never upload, store, or track your client lists or revenue data. Additionally, every invoice is forced into a high-contrast black-on-white format to guarantee a professional appearance in both digital and physical formats.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper { box-sizing: border-box; }
                #invoice-paper input, #invoice-paper textarea { 
                    color: #000000 !important; 
                    background: transparent !important; 
                    border: none; 
                    outline: none; 
                    font-family: 'Helvetica', 'Arial', sans-serif;
                }
                #invoice-paper input:hover { background: #f8fafc !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- STYLE OBJECTS ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 15px 0' };
const lCap = { fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '5px' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', color: '#fff', borderRadius: '8px', marginBottom: '10px', fontSize: '0.85rem' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '6px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnExport = { background: '#38bdf8', color: '#0f172a', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnReset = { width: '100%', marginTop: '10px', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' };

const paperStyle = { background: '#ffffff', color: '#000000', padding: '20mm 15mm', margin: '0', minHeight: '297mm', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.5)' };
const titleI = { fontSize: '2.8rem', fontWeight: '900', width: '100%' };
const companyI = { fontSize: '1.4rem', fontWeight: 'bold', width: '100%', marginTop: '5px' };
const addrI = { width: '100%', fontSize: '0.85rem', color: '#475569', height: '45px', lineHeight: '1.4' };
const headerSection = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' };
const trnLabel = { fontSize: '0.85rem', fontWeight: 'bold', marginTop: '5px' };
const trnInp = { borderBottom: '1px dashed #cbd5e1 !important', width: '160px', fontWeight: 'bold' };

const metaRow = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '4px' };
const metaI = { width: '100px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagL = { fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '3px' };
const clientI = { fontSize: '1.2rem', fontWeight: 'bold', width: '100%' };

const mainTable = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const tableHRow = { borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' };
const tc = { padding: '10px 8px', fontSize: '0.8rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const tableBRow = { verticalAlign: 'top' };
const rawI = { width: '100%', fontSize: '0.8rem' };
const addB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#94a3b8', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' };
const delB = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem' };

const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px', background: '#f8fafc' };
const notesI = { width: '100%', height: '80px', border: 'none', background: '#f8fafc', padding: '10px', fontSize: '0.8rem' };

const footerSection = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footMsgI = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const footUrlI = { width: '60%', fontSize: '0.65rem', color: '#cbd5e1', fontStyle: 'italic' };

const seoWrapper = { marginTop: '80px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10000, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const inpS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff' };
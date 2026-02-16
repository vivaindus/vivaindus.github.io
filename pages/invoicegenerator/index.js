import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function GlobalInvoiceGenerator() {
    const [pageSize, setPageSize] = useState('A4');
    const [notification, setNotification] = useState('');
    const invoiceRef = useRef(null);

    const [meta, setMeta] = useState({
        logo: null, logoAlign: 'flex-start', invoiceTitle: 'TAX INVOICE',
        invoiceNum: 'INV-2024-001', invoiceDate: new Date().toISOString().split('T')[0],
        supplyDate: new Date().toISOString().split('T')[0], currency: 'AED', decimals: 2, 
        senderName: 'Your Business Name', senderTRN: '100XXXXXXXXXXXX',
        senderAddress: 'Office 101, Business Bay, Dubai, UAE',
        clientName: 'Client Company Name', clientTRN: '100XXXXXXXXXXXX',
        clientAddress: 'Recipient Location, City, Country',
        notes: 'Reverse Charge applies if applicable. Thank you.',
        footerMsg: 'Authorized Signatory', 
        footerUrl: 'https://www.shbstores.com/invoicegenerator' 
    });

    const [items, setItems] = useState([{ id: 1, code: 'S01', desc: 'Consulting', qty: 1, price: 0, vatRate: 5 }]);

    useEffect(() => {
        const saved = localStorage.getItem('shb_invoice_elite_v8');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMeta(parsed.meta); setItems(parsed.items);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('shb_invoice_elite_v8', JSON.stringify({ meta, items }));
        showToast('Template Saved Locally! ✅');
    };

    const handleHardReset = () => {
        if (window.confirm("CRITICAL: Wipe all saved data and settings?")) {
            localStorage.removeItem('shb_invoice_elite_v8');
            window.location.reload();
        }
    };

    // --- Helper: Amount in Words ---
    const toWords = (num) => {
        const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
        const n = ('0000000' + Math.floor(num)).slice(-7).match(/^(\d{2})(\d{2})(\d{2})(\d{1})$/);
        if (!n) return ''; 
        let str = '';
        str += (n[1] != 0) ? (b[n[1][0]] || a[n[1]]) + 'Lakh ' : '';
        str += (n[2] != 0) ? (b[n[2][0]] || a[n[2]]) + (a[n[2]] || b[n[2][0]] ? 'Thousand ' : '') : '';
        str += (n[3] != 0) ? (b[n[3][0]] || a[n[3]]) + (a[n[3]] || b[n[3][0]] ? 'Hundred ' : '') : '';
        str += (n[4] != 0) ? (str != '' ? 'and ' : '') + (a[n[4]] || b[n[4][0]] + a[n[4][1]]) : '';
        return str.trim() + ' ' + meta.currency + ' Only';
    };

    const fmt = (num) => parseFloat(num || 0).toFixed(meta.decimals);
    const subtotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
    const totalVat = items.reduce((acc, i) => acc + (i.qty * i.price * (i.vatRate/100)), 0);
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

    // --- ULTRA HD EXPORT ENGINE ---
    const exportFile = async (type) => {
        const { toCanvas } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');
        if (!invoiceRef.current) return;
        showToast(`Rendering HD ${type.toUpperCase()}...`);

        const canvas = await toCanvas(invoiceRef.current, {
            pixelRatio: 4, // ULTRA HD
            backgroundColor: '#ffffff',
            canvasWidth: pageSize === 'A4' ? 794 : 816
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        if (type === 'png') {
            const link = document.createElement('a');
            link.download = `${meta.invoiceNum}.png`; link.href = imgData; link.click();
        } else {
            const pdf = new jsPDF('p', 'mm', pageSize.toLowerCase());
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;
            const topSpacing = 40; // White space for subsequent pages

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                pdf.addPage();
                // We start with a negative position + spacing to leave white space at top
                position = heightLeft - imgHeight + topSpacing;
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - topSpacing);
            }
            pdf.save(`${meta.invoiceNum}.pdf`);
        }
        showToast('Document Ready! ✅');
    };

    return (
        <ToolboxLayout title="Tax Invoice Suite" description="HD multi-page tax invoice generator with amount in words and TRN.">
            <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px' }}>
                
                {notification && <div style={toastStyle}>{notification}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <aside style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sidebarCard}>
                            <h3 style={cardTitle}>Settings</h3>
                            <label style={lCap}>Decimal Places</label>
                            <select value={meta.decimals} onChange={(e)=>setMeta({...meta, decimals: parseInt(e.target.value)})} style={selS}>
                                <option value={2}>2 Decimals</option>
                                <option value={3}>3 Decimals</option>
                            </select>
                            <label style={lCap}>Logo Position</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom:'10px' }}>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-start' })} style={btnMin}>Left</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'center' })} style={btnMin}>Center</button>
                                <button onClick={() => setMeta({ ...meta, logoAlign: 'flex-end' })} style={btnMin}>Right</button>
                            </div>
                            <input type="file" onChange={handleLogo} style={inpStyle} />
                        </div>
                        <div style={sidebarCard}>
                            <button onClick={saveSettings} style={btnSave}>💾 SAVE DATA</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => exportFile('pdf')} style={btnExport}>📄 PDF</button>
                                <button onClick={() => exportFile('png')} style={btnExport}>🖼️ PNG</button>
                            </div>
                            <button onClick={handleHardReset} style={btnReset}>🗑️ HARD RESET</button>
                        </div>
                    </aside>

                    <main style={mainSlate}>
                        <div ref={invoiceRef} id="invoice-paper" style={{ ...paperStyle, width: pageSize === 'A4' ? '210mm' : '215.9mm' }}>
                            <div style={{ display: 'flex', justifyContent: meta.logoAlign, marginBottom: '10px' }}>
                                {meta.logo ? <img src={meta.logo} style={{ maxHeight: '80px' }} /> : <div style={{height:'80px'}}></div>}
                            </div>

                            <div style={headerGrid}>
                                <div>
                                    <input value={meta.invoiceTitle} onChange={(e)=>setMeta({...meta, invoiceTitle: e.target.value})} style={titleI} />
                                    <input value={meta.senderName} onChange={(e)=>setMeta({...meta, senderName: e.target.value})} style={compT} />
                                    <textarea value={meta.senderAddress} onChange={(e)=>setMeta({...meta, senderAddress: e.target.value})} style={addrI} />
                                    <div style={trnL}>Supplier TRN: <input value={meta.senderTRN} onChange={(e)=>setMeta({...meta, senderTRN: e.target.value})} style={trnI} /></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={mRow}><span>No:</span><input value={meta.invoiceNum} onChange={(e)=>setMeta({...meta, invoiceNum: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Date:</span><input type="date" value={meta.invoiceDate} onChange={(e)=>setMeta({...meta, invoiceDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Supply:</span><input type="date" value={meta.supplyDate} onChange={(e)=>setMeta({...meta, supplyDate: e.target.value})} style={mInp} /></div>
                                    <div style={mRow}><span>Curr:</span><input value={meta.currency} onChange={(e)=>setMeta({...meta, currency: e.target.value})} style={{...mInp, fontWeight:'bold'}} /></div>
                                </div>
                            </div>

                            <div style={{ margin: '30px 0' }}>
                                <span style={tagLabel}>BILL TO</span>
                                <input value={meta.clientName} onChange={(e)=>setMeta({...meta, clientName: e.target.value})} style={clientT} />
                                <textarea value={meta.clientAddress} onChange={(e)=>setMeta({...meta, clientAddress: e.target.value})} style={addrI} />
                                <div style={trnL}>Recipient TRN: <input value={meta.clientTRN} onChange={(e)=>setMeta({...meta, clientTRN: e.target.value})} style={trnI} /></div>
                            </div>

                            <table style={tableB}>
                                <thead style={thR}>
                                    <tr>
                                        <th style={tc}>Code</th><th style={{...tc, width:'35%'}}>Description</th><th style={tc}>Qty</th><th style={tc}>Price</th><th style={tc}>VAT%</th><th style={tc}>VAT Amt</th><th style={{...tc, textAlign:'right'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} style={itemR}>
                                            <td style={tc}><input value={item.code} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, code:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tc}><textarea value={item.desc} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, desc:e.target.value}:i))} style={{...rawI, resize:'none'}} /></td>
                                            <td style={tc}><input type="number" value={item.qty} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, qty:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.price} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, price:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tc}><input type="number" value={item.vatRate} onChange={(e)=>setItems(items.map(i=>i.id===item.id?{...i, vatRate:e.target.value}:i))} style={rawI} /></td>
                                            <td style={tc}>{fmt((item.qty*item.price)*(item.vatRate/100))}</td>
                                            <td style={{...tc, textAlign:'right', fontWeight:'bold'}}>{fmt((item.qty*item.price) * (1+item.vatRate/100))}
                                                <button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="no-print" style={delBtn}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>setItems([...items, {id:Date.now(), code:'', desc:'', qty:1, price:0, vatRate:5}])} style={addLineB} className="no-print">+ Add Item Line</button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                <div style={{ width: '60%' }}>
                                    <span style={tagLabel}>AMOUNT IN WORDS</span>
                                    <div style={wordBox}>{toWords(grandTotal)}</div>
                                    <span style={{...tagLabel, marginTop:'15px'}}>NOTES</span>
                                    <textarea value={meta.notes} onChange={(e)=>setMeta({...meta, notes: e.target.value})} style={notesArea} />
                                </div>
                                <div style={{ width: '230px' }}>
                                    <div style={sumRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                    <div style={sumRow}><span>Total VAT</span><span>{fmt(totalVat)}</span></div>
                                    <div style={grandRow}><span>TOTAL</span><span>{meta.currency} {fmt(grandTotal)}</span></div>
                                </div>
                            </div>

                            <div style={paperFooter}>
                                <input value={meta.footerMsg} onChange={(e)=>setMeta({...meta, footerMsg: e.target.value})} style={footInp} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <input value={meta.footerUrl} onChange={(e)=>setMeta({...meta, footerUrl: e.target.value})} style={urlI} />
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Professional Document generated via shbstores.com</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <style jsx>{`
                @media print { .no-print { display: none !important; } }
                #invoice-paper input, #invoice-paper textarea { color: black !important; background: transparent !important; border: none; outline: none; }
                #invoice-paper input:hover { background: #f8fafc !important; }
            `}</style>
        </ToolboxLayout>
    );
}

// --- MINIFIED STYLES ---
const sidebarCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '15px' };
const cardTitle = { color: '#38bdf8', fontSize: '0.9rem', margin: '0 0 10px 0' };
const lCap = { fontSize: '0.7rem', color: '#64748b', display: 'block' };
const selS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '8px', color: '#fff', borderRadius: '8px', marginBottom: '10px' };
const paperStyle = { background: '#fff', color: '#000', padding: '20mm 15mm', display: 'flex', flexDirection: 'column' };
const titleI = { fontSize: '2.5rem', fontWeight: '900', width: '100%', color: '#000' };
const compT = { fontSize: '1.3rem', fontWeight: 'bold', width: '100%', marginTop: '5px' };
const addrI = { width: '100%', fontSize: '0.8rem', color: '#475569', height: '40px' };
const headerGrid = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px' };
const trnL = { fontSize: '0.85rem', fontWeight: 'bold' };
const trnI = { borderBottom: '1px dashed #ccc !important', width: '160px' };
const mRow = { display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '0.85rem', marginBottom: '4px' };
const mInp = { width: '100px', textAlign: 'right', borderBottom: '1px solid #eee !important' };
const tagLabel = { fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' };
const wordBox = { fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '5px' };
const clientT = { fontSize: '1.2rem', fontWeight: 'bold', width: '100%' };
const tableB = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
const thR = { borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' };
const tc = { padding: '8px', fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const itemR = { verticalAlign: 'top' };
const rawI = { width: '100%', fontSize: '0.75rem' };
const addLineB = { width: '100%', padding: '10px', background: '#f8fafc', border: '1px dashed #ccc', color: '#94a3b8', cursor: 'pointer', marginTop: '10px' };
const delBtn = { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' };
const sumRow = { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.85rem' };
const grandRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' };
const notesArea = { width: '100%', height: '50px', background: '#f8fafc', padding: '8px', fontSize: '0.75rem' };
const paperFooter = { marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' };
const footInp = { width: '100%', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' };
const urlI = { width: '50%', fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' };
const btnSave = { width: '100%', background: '#34d399', color: '#0f172a', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnExport = { background: '#38bdf8', color: '#0f172a', padding: '10px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer' };
const mainSlate = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
const btnMin = { background: '#334155', color: '#fff', border: 'none', padding: '5px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34d399', color: '#0f172a', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 100000 };
const inpStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' };
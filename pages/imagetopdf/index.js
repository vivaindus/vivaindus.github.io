import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function ImageToPDF() {
    const [mounted, setMounted] = useState(false);
    const [images, setImages] = useState([]);
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('p');
    const [generating, setGenerating] = useState(false);
    const [notification, setNotification] = useState('');

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // Toast logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        }));
        setImages([...images, ...newImages]);
        setNotification(`${files.length} images added to queue! 📥`);
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const generatePDF = async () => {
        if (images.length === 0) return;
        setGenerating(true);
        const { jsPDF } = await import('jspdf');
        
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 0; i < images.length; i++) {
            if (i > 0) doc.addPage();
            const img = await loadImage(images[i].url);
            const imgProps = doc.getImageProperties(img);
            const ratio = imgProps.width / imgProps.height;
            
            let drawWidth = pageWidth - 20; 
            let drawHeight = drawWidth / ratio;

            if (drawHeight > pageHeight - 20) {
                drawHeight = pageHeight - 20;
                drawWidth = drawHeight * ratio;
            }

            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            doc.addImage(img, 'JPEG', x, y, drawWidth, drawHeight);
        }

        doc.save(`SHB_Document_${Date.now()}.pdf`);
        setGenerating(false);
        setNotification('PDF Generated and Downloaded! 📄✅');
    };

    const loadImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
        });
    };

    if (!mounted) return <ToolboxLayout title="Image to PDF" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Starting PDF Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Image to PDF Converter - Combine JPG & PNG into PDF" 
            description="Convert your photos and scans into a single professional PDF document. Choose between A4 and Letter sizes with high-quality resolution and 100% privacy."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Professional Image to PDF Creator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Turning phone photos into a professional document shouldn't be hard. Our tool allows you to 
                        combine multiple <strong>JPG, PNG, and WebP</strong> images into a single, clean PDF, 
                        formatted for global printing standards.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>🖨️ A4 & Letter Sizes</span>
                        <span>🔒 Private Local Build</span>
                        <span>📄 Multi-Image Batch</span>
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    {/* SETTINGS BAR */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <label style={lCap}>Paper Standard</label>
                            <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={inputS}>
                                <option value="a4">A4 (International)</option>
                                <option value="letter">Letter (US/Canada)</option>
                                <option value="a3">A3 (Large Poster)</option>
                            </select>
                        </div>
                        <div>
                            <label style={lCap}>Page Orientation</label>
                            <select value={orientation} onChange={(e) => setOrientation(e.target.value)} style={inputS}>
                                <option value="p">Portrait (Vertical)</option>
                                <option value="l">Landscape (Horizontal)</option>
                            </select>
                        </div>
                    </div>

                    {/* UPLOAD ZONE */}
                    <div style={dropZone}>
                        <input type="file" multiple accept="image/*" onChange={handleUpload} style={fileInput} />
                        <div style={{ fontSize: '3rem' }}>➕</div>
                        <p style={{ fontSize: '1.2rem', color: '#fff', marginTop: '10px' }}>Click to Add Images to Queue</p>
                        <p style={{ color: '#475569', fontSize: '0.8rem' }}>{images.length} images currently selected</p>
                    </div>

                    {/* PREVIEW GRID */}
                    {images.length > 0 && (
                        <div style={{ marginTop: '40px', animation: 'fadeIn 0.5s' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                {images.map((img) => (
                                    <div key={img.id} style={thumbCard}>
                                        <img src={img.url} style={thumbImg} alt="Preview" />
                                        <button onClick={() => removeImage(img.id)} style={btnRemove}>&times;</button>
                                        <div style={{fontSize: '0.65rem', color: '#475569', padding: '5px'}}>{img.size}</div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={generatePDF} disabled={generating} style={btnPrimary}>
                                {generating ? 'Processing Digital Assets...' : `BUILD PDF DOCUMENT (${images.length} PAGES)`}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Digital Archiving: The Importance of a Reliable Image to PDF Suite</h2>
                    <p>
                        In a modern paperless environment, converting physical documents into digital PDF files is a critical workflow. 
                        Whether you are an office administrator digitizing invoices or a student compiling lecture notes, 
                        The <strong>SHB Image to PDF Suite</strong> provides an industrial-grade solution to transform raw pixels 
                        into standardized portable documents.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Universal Printing Standards: A4 vs. Letter</h3>
                    <p>
                        Global documentation relies on two primary standards. <strong>A4 (210 x 297mm)</strong> is the standard for 
                        Europe, Asia, and the GCC region, while <strong>Letter (8.5 x 11in)</strong> is used primarily in North America. 
                        Our tool allows you to select these standards before conversion, ensuring that your final PDF looks identical 
                        when shared or printed anywhere in the world.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Smart Aspect Ratio Sizing</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Unlike basic converters that stretch your images to fill the page, SHB ToolBox uses 
                                <strong>High-Fidelity Scaling</strong>. Our engine analyzes the dimensions of every uploaded photo 
                                and fits it to the page while maintaining its original proportions. This prevents distortions 
                                of faces, text, and signatures.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Batch-Processing Power</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Why convert one by one when you can do it all at once? Our suite supports <strong>Multi-Image Uploads</strong>. 
                                You can select twenty photos of a contract, Receipt, or ID, and our tool will generate a twenty-page 
                                PDF in a single operation, perfectly indexed and ready for email.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Professional Output Quality</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                We use the <strong>jsPDF standard</strong> library to ensure that the final document is 
                                vector-compliant where possible. This results in smaller file sizes that don't sacrifice the 
                                legibility of your document scans.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>The Security of Client-Side Processing</h3>
                    <p>
                        Document privacy is non-negotiable. Traditional online converters require you to upload your personal 
                        identity cards, medical receipts, or confidential business records to a remote server. At 
                        <strong>SHB ToolBox</strong>, we eliminate this risk. Every part of the conversion process happens 
                        <strong>locally in your browser</strong>. Your files are processed in your computer's temporary memory 
                        and are never uploaded to our servers or stored in our database.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' };
const inputS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none' };
const dropZone = { border: '3px dashed #334155', padding: '60px 20px', borderRadius: '25px', textAlign: 'center', background: '#0f172a', position: 'relative' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const btnPrimary = { width: '100%', marginTop: '30px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const thumbCard = { position: 'relative', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' };
const thumbImg = { width: '100%', height: '100px', objectFit: 'cover' };
const btnRemove = { position: 'absolute', top: '5px', right: '5px', background: '#f87171', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' };
import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import { jsPDF } from 'jspdf';

export default function ImageToPDF() {
    const [images, setImages] = useState([]);
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('p');
    const [generating, setGenerating] = useState(false);

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const generatePDF = async () => {
        if (images.length === 0) return;
        setGenerating(true);
        
        // Configuration for A4
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
            
            // Calculate dimensions to fit page while maintaining aspect ratio
            const ratio = imgProps.width / imgProps.height;
            let drawWidth = pageWidth - 20; // 10mm margins
            let drawHeight = drawWidth / ratio;

            if (drawHeight > pageHeight - 20) {
                drawHeight = pageHeight - 20;
                drawWidth = drawHeight * ratio;
            }

            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            doc.addImage(img, 'JPEG', x, y, drawWidth, drawHeight);
        }

        doc.save('shb_converted_document.pdf');
        setGenerating(false);
    };

    const loadImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
        });
    };

    return (
        <ToolboxLayout title="Image to PDF Converter" description="Convert multiple JPG, PNG, and WebP images into a single professional PDF document.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Image to PDF Creator</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Combine multiple photos into one secure PDF file.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* SETTINGS BAR */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <div>
                            <label style={labelStyle}>Page Size</label>
                            <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={selectStyle}>
                                <option value="a4">A4 (Standard)</option>
                                <option value="letter">Letter (US)</option>
                                <option value="a3">A3 (Large)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Orientation</label>
                            <select value={orientation} onChange={(e) => setOrientation(e.target.value)} style={selectStyle}>
                                <option value="p">Portrait</option>
                                <option value="l">Landscape</option>
                            </select>
                        </div>
                    </div>

                    {/* UPLOAD ZONE */}
                    <div style={dropZone}>
                        <input type="file" multiple accept="image/*" onChange={handleUpload} style={fileInput} />
                        <p>➕ Add Images to PDF</p>
                        <small>{images.length} images selected</small>
                    </div>

                    {/* PREVIEW GRID */}
                    {images.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
                                {images.map((img) => (
                                    <div key={img.id} style={thumbCard}>
                                        <img src={img.url} style={thumbImg} alt="Preview" />
                                        <button onClick={() => removeImage(img.id)} style={btnRemove}>&times;</button>
                                        <div style={{fontSize: '0.6rem', overflow: 'hidden', whiteSpace: 'nowrap'}}>{img.size}</div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={generatePDF} disabled={generating} style={btnPrimary}>
                                {generating ? 'Processing PDF...' : `GENERATE PDF (${images.length} PAGES)`}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Ultimate Image to PDF Conversion Utility</h2>
                    <p>
                        The SHB Image to PDF Converter is a professional-grade tool designed for students, office administrators, and freelancers 
                        who need to compile multiple visual documents into a single, organized PDF file. Whether you are submitting an 
                        assignment, creating a digital portfolio, or archiving receipts, our tool provides a fast and secure solution.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Supports Multiple Formats & Page Layouts</h3>
                    <p>
                        Our converter supports all common image formats including <strong>JPG, PNG, and WebP</strong>. Unlike 
                        basic converters, we offer full control over the final document layout:
                    </p>
                    <ul>
                        <li><strong>Standard Page Sizes:</strong> Choose between A4 (International Standard) or Letter (US Standard) for perfect printing.</li>
                        <li><strong>Orientation Control:</strong> Switch between Portrait and Landscape modes to accommodate wide photos or technical drawings.</li>
                        <li><strong>Smart Scaling:</strong> Our engine automatically maintains the aspect ratio of your images, ensuring they are not stretched or distorted when placed on the PDF page.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy and Security Matter</h3>
                    <p>
                        When converting personal documents like ID cards, certificates, or financial records, you should never upload them 
                        to a cloud-based server. The SHB ToolBox operates <strong>100% Client-Side</strong>. All images are processed 
                        within your browser's memory using the `jsPDF` engine. Your files are never sent to our servers, never stored 
                        in Supabase, and remain completely private on your own device.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>How to Convert Images to PDF?</h3>
                    <ol>
                        <li>Select your preferred page size and orientation (Portrait is default).</li>
                        <li>Upload one or more images using the add button.</li>
                        <li>Preview your images and remove any mistakes using the "X" button on the thumbnail.</li>
                        <li>Click "Generate PDF" to instantly download your combined document.</li>
                    </ol>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '40px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const labelStyle = { fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '5px' };
const selectStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '10px', outline: 'none' };
const thumbCard = { position: 'relative', background: '#0f172a', padding: '5px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' };
const thumbImg = { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px', marginBottom: '5px' };
const btnRemove = { position: 'absolute', top: '-5px', right: '-5px', background: '#f87171', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '14px', lineHeight: '1' };
const btnPrimary = { width: '100%', marginTop: '30px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
import React, { useState, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFToImage() {
    const [pdfFile, setPdfFile] = useState(null);
    const [images, setImages] = useState([]);
    const [converting, setConverting] = useState(false);
    const [format, setFormat] = useState('image/png');

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImages([]);
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const convertPDF = async () => {
        if (!pdfFile) return;
        setConverting(true);
        setImages([]);

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const tempImages = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High quality 2x scale
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const dataUrl = canvas.toDataURL(format);
            tempImages.push({
                page: i,
                url: dataUrl
            });
        }

        setImages(tempImages);
        setConverting(false);
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        images.forEach((img, idx) => {
            const base64Data = img.url.replace(/^data:image\/(png|jpeg);base64,/, "");
            zip.file(`page_${idx + 1}.${format === 'image/png' ? 'png' : 'jpg'}`, base64Data, { base64: true });
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "shb_pdf_images.zip";
        link.click();
    };

    return (
        <ToolboxLayout title="PDF to Image Converter" description="Convert PDF pages to high-quality PNG or JPG images instantly in your browser.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>PDF to Image Suite</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Extract individual pages from your PDF documents as high-resolution images.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* SETTINGS */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Select Output Format</label>
                        <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
                            <option value="image/png">PNG (Best Quality)</option>
                            <option value="image/jpeg">JPG (Smaller Size)</option>
                        </select>
                    </div>

                    {/* UPLOAD ZONE */}
                    {!pdfFile ? (
                        <div style={dropZone}>
                            <input type="file" accept="application/pdf" onChange={handleUpload} style={fileInput} />
                            <p>📄 Select PDF to Convert</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #38bdf8', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>{pdfFile.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={convertPDF} disabled={converting} style={btnPrimary}>
                                    {converting ? 'Rendering Pages...' : 'EXTRACT ALL PAGES'}
                                </button>
                                <button onClick={() => {setPdfFile(null); setImages([]);}} style={btnSecondary}>RESET</button>
                            </div>
                        </div>
                    )}

                    {/* PREVIEW & DOWNLOAD */}
                    {images.length > 0 && (
                        <div style={{ marginTop: '40px' }}>
                            <button onClick={downloadZip} style={btnDownload}>📦 DOWNLOAD ALL AS ZIP</button>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                {images.map((img) => (
                                    <div key={img.page} style={imgCard}>
                                        <img src={img.url} style={{ width: '100%', borderRadius: '8px' }} alt={`Page ${img.page}`} />
                                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>Page {img.page}</div>
                                        <a href={img.url} download={`page_${img.page}.${format === 'image/png' ? 'png' : 'jpg'}`} style={{color: '#38bdf8', textDecoration: 'none', fontSize: '0.75rem'}}>Download PNG</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional PDF to Image Extraction Utility</h2>
                    <p>
                        The SHB PDF to Image Converter is a powerful utility designed for users who need to transform static PDF documents 
                        into high-quality image formats. This is essential for sharing document pages on social media, integrating 
                        PDF content into presentations, or extracting visual assets from complex reports.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>High-Resolution Rendering Engine</h3>
                    <p>
                        Unlike many online converters that produce blurry results, our tool uses a <strong>2.0x supersampling scale</strong>. 
                        This means every PDF page is rendered at twice its original resolution before being converted to a 
                        PNG or JPG file. This ensures that even small text and fine lines in technical drawings remain 
                        crystal clear after the conversion.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy-First Processing (Local Rendering)</h3>
                    <p>
                        PDF documents often contain sensitive information like banking statements, legal contracts, and personal identity 
                        documents. At SHB ToolBox, we prioritize your security. Our converter uses <strong>Client-Side PDF Rendering</strong>. 
                        The conversion happens entirely inside your browser. No PDF data is ever uploaded to our servers, and no 
                        intermediate images are stored in a database. Your data remains strictly on your device.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Key Features of our PDF Suite</h3>
                    <ul>
                        <li><strong>Batch Extraction:</strong> Convert all pages of a large PDF at once with a single click.</li>
                        <li><strong>Format Choice:</strong> Select between PNG (lossless) for maximum quality or JPG for better compression and smaller file sizes.</li>
                        <li><strong>ZIP Export:</strong> Instead of downloading dozens of images one by one, our tool automatically compiles all rendered pages into a single, organized ZIP archive.</li>
                    </ul>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '60px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const selectStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '10px', outline: 'none' };
const btnPrimary = { flex: 2, background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { flex: 1, background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDownload = { width: '100%', background: '#34d399', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const imgCard = { background: '#0f172a', padding: '10px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' };
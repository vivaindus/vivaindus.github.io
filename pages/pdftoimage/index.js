import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

export default function PDFToImage() {
    const [pdfFile, setPdfFile] = useState(null);
    const [images, setImages] = useState([]);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [format, setFormat] = useState('image/png');
    const [pdfjsLib, setPdfjsLib] = useState(null);
    const [notification, setNotification] = useState('');

    // --- Dynamic Load PDF.js (Vercel Fix) ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('pdfjs-dist/build/pdf').then((pdfjs) => {
                pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
                setPdfjsLib(pdfjs);
            });
        }
    }, []);

    // --- Toast Notification Logic ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImages([]);
            setProgress(0);
        } else {
            alert("Please upload a valid PDF document.");
        }
    };

    const convertPDF = async () => {
        if (!pdfFile || !pdfjsLib) return;
        setConverting(true);
        setImages([]);
        setProgress(0);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;
            const tempImages = [];

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // 2.0x scale for HD quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                const dataUrl = canvas.toDataURL(format);
                tempImages.push({ page: i, url: dataUrl });
                
                // Update Progress Bar
                setProgress(Math.round((i / totalPages) * 100));
            }

            setImages(tempImages);
            setNotification(`Successfully converted ${totalPages} pages!`);
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Error processing PDF. The file might be encrypted or corrupted.");
        }
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
        link.download = `shb_pdf_export_${Date.now()}.zip`;
        link.click();
    };

    return (
        <ToolboxLayout title="PDF to Image Converter" description="Convert PDF pages to high-resolution PNG or JPG images instantly and privately.">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>PDF to Image Suite</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>High-definition extraction of document pages into visual image formats.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* SETTINGS */}
                    <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Select Image Format</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
                                <option value="image/png">PNG (Best Quality)</option>
                                <option value="image/jpeg">JPG (Smallest Size)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button onClick={() => { setPdfFile(null); setImages([]); setProgress(0); }} style={btnGhost}>Change PDF File</button>
                        </div>
                    </div>

                    {/* UPLOAD & PROGRESS AREA */}
                    {!pdfFile ? (
                        <div style={dropZone}>
                            <input type="file" accept="application/pdf" onChange={handleUpload} style={fileInput} />
                            <p style={{ fontSize: '1.2rem' }}>📄 Click to Upload PDF</p>
                            <small style={{ color: '#475569' }}>Encryption protected files are not supported</small>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #38bdf8', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#fff' }}>{pdfFile.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '5px 0' }}>File Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>

                            {/* PROGRESS BAR */}
                            {converting && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                                        <span>Conversion Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#0f172a', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.3s ease-out' }}></div>
                                    </div>
                                </div>
                            )}

                            {!converting && images.length === 0 && (
                                <button onClick={convertPDF} style={btnPrimary}>START CONVERSION</button>
                            )}
                        </div>
                    )}

                    {/* DOWNLOAD SECTION */}
                    {images.length > 0 && (
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button onClick={downloadZip} style={btnDownload}>📦 DOWNLOAD ALL AS ZIP ARCHIVE</button>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                {images.map((img) => (
                                    <div key={img.page} style={imgCard}>
                                        <img src={img.url} style={{ width: '100%', borderRadius: '8px', border: '1px solid #334155' }} alt={`Page ${img.page}`} />
                                        <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>Page {img.page}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- COMPREHENSIVE SEO CONTENT SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Professional Solution for PDF to Image Conversion</h2>
                    <p>
                        The SHB PDF to Image Converter is an advanced utility built for high-performance extraction of document content. 
                        In a world where digital assets need to be shared across multiple platforms, the ability to transform a 
                        static PDF document into high-resolution JPG or PNG images is essential for professionals, creators, and administrators alike.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>High-Fidelity Rendering & Supersampling</h3>
                    <p>
                        Most basic online converters yield blurry or pixelated results because they render at a low resolution. 
                        Our tool uses <strong>2.0x Scale Supersampling</strong>. This means we render each PDF page at double the standard 
                        DPI before converting it to an image format. This technique preserves the sharp lines of typography, the details 
                        of architectural blueprints, and the vibrant colors of digital magazines.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy is Our Core Feature</h3>
                    <p>
                        PDF documents often contain your most sensitive data—including bank statements, medical records, or 
                        legal contracts. Conventional online converters require you to upload these documents to a remote cloud server. 
                        SHB ToolBox uses <strong>Private Client-Side Processing</strong>. The entire conversion logic happens 
                        directly in your computer's browser memory. Your PDF never touches our database, and it is never 
                        transmitted over the internet, ensuring 100% data security.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Key Workflow Benefits</h3>
                    <ul>
                        <li><strong>Batch Processing:</strong> Extract every page of a multi-page document in one operation.</li>
                        <li><strong>Lossless PNG Support:</strong> Ideal for designers who need to maintain transparent layers or high-contrast graphics.</li>
                        <li><strong>Optimized JPEG Export:</strong> Best for social media sharing and email attachments where file size management is a priority.</li>
                        <li><strong>ZIP Compiling:</strong> Our automated archiving engine bundles all extracted pages into a single ZIP file for easy one-click storage.</li>
                    </ul>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '80px 20px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const selectStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '12px', outline: 'none', marginTop: '8px' };
const labelStyle = { fontSize: '0.85rem', color: '#94a3b8' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnDownload = { width: '100%', background: '#34d399', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnGhost = { background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' };
const imgCard = { background: '#0f172a', padding: '10px', borderRadius: '15px', border: '1px solid #334155' };
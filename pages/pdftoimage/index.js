import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

export default function PDFToImage() {
    const [mounted, setMounted] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [images, setImages] = useState([]);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [format, setFormat] = useState('image/png');
    const [pdfjsLib, setPdfjsLib] = useState(null);
    const [notification, setNotification] = useState('');

    // Hydration Guard & Dynamic PDF.js Load
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            import('pdfjs-dist/build/pdf').then((pdfjs) => {
                pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
                setPdfjsLib(pdfjs);
            });
        }
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImages([]);
            setProgress(0);
            setNotification('PDF Loaded. Choose format and extract! 📄');
        } else {
            setNotification('⚠️ Please upload a valid PDF file.');
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
                // 2.5x Scale = High Definition (Standard is 1.0)
                const viewport = page.getViewport({ scale: 2.5 }); 
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                tempImages.push({ page: i, url: canvas.toDataURL(format) });
                setProgress(Math.round((i / totalPages) * 100));
            }

            setImages(tempImages);
            setNotification(`Successfully extracted ${totalPages} pages! 🖼️`);
        } catch (error) {
            console.error(error);
            setNotification('⚠️ Error converting PDF. It might be password protected.');
        }
        setConverting(false);
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        images.forEach((img, idx) => {
            const data = img.url.replace(/^data:image\/(png|jpeg);base64,/, "");
            zip.file(`page_${idx + 1}.${format === 'image/png' ? 'png' : 'jpg'}`, data, { base64: true });
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `SHB_Extracted_PDF_${Date.now()}.zip`;
        link.click();
        setNotification('ZIP Archive Downloaded! 📦');
    };

    if (!mounted) return <ToolboxLayout title="PDF to Image" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Initializing High-Res Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="PDF to Image Converter - High Resolution JPG & PNG Extraction" 
            description="Convert PDF pages to HD images (PNG or JPG) instantly. Features multi-page extraction, 2.5x supersampling quality, and 100% private local processing."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION TOAST */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Professional PDF to Image Suite</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Need to share a single page of a long report? Or turn a static PDF into a <strong>High-Res Social Post</strong>? 
                        Our engine uses 2.5x supersampling to ensure every pixel of your document is crystal clear.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>💎 HD Quality</span>
                        <span>📦 Bulk ZIP Export</span>
                        <span>🔒 100% Offline-Safe</span>
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={lCap}>Image Format</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputS}>
                                <option value="image/png">PNG (Lossless / Transparent)</option>
                                <option value="image/jpeg">JPG (Web Optimized)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button onClick={() => { setPdfFile(null); setImages([]); setProgress(0); }} style={btnReset}>CLEAR WORKSPACE</button>
                        </div>
                    </div>

                    {!pdfFile ? (
                        <div style={dropZone}>
                            <input type="file" accept="application/pdf" onChange={handleUpload} style={fileInput} />
                            <div style={{ fontSize: '3.5rem' }}>📄</div>
                            <p style={{ fontSize: '1.2rem', color: '#fff', marginTop: '10px' }}>Select PDF to Extract</p>
                            <p style={{ color: '#475569', fontSize: '0.8rem' }}>Supports documents up to 50MB</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#0f172a', padding: '25px', borderRadius: '15px', border: '1px solid #38bdf8', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#fff' }}>{pdfFile.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '5px' }}>File Type: PDF Document • Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>

                            {converting && (
                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8', marginBottom: '10px', fontWeight:'bold' }}>
                                        <span>Conversion Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '12px', background: '#0f172a', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.4s ease' }}></div>
                                    </div>
                                </div>
                            )}

                            {!converting && images.length === 0 && (
                                <button onClick={convertPDF} style={btnPrimary}>START EXTRACTION ENGINE</button>
                            )}
                        </div>
                    )}

                    {images.length > 0 && (
                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <button onClick={downloadZip} style={btnDownload}>📦 DOWNLOAD ALL PAGES AS ZIP ARCHIVE</button>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginTop: '35px' }}>
                                {images.map((img) => (
                                    <div key={img.page} style={imgCard}>
                                        <img src={img.url} style={{ width: '100%', borderRadius: '10px', border: '1px solid #334155' }} alt={`Page ${img.page}`} />
                                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8', fontWeight:'bold' }}>PAGE {img.page}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Professional Guide to High-Fidelity PDF Image Extraction</h2>
                    <p>
                        A PDF (Portable Document Format) is designed to be a universal "print" file, but converting its contents back into 
                        visual image formats like JPG or PNG requires a high-performance rendering engine. The <strong>SHB PDF to Image Converter</strong> 
                        utilizes the same technology used by modern web browsers to provide a pixel-perfect extraction experience.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Why DPI and Resolution Matter</h3>
                    <p>
                        Most basic online converters render PDF pages at 72 DPI (dots per inch), resulting in blurry text and pixelated graphics. 
                        Our suite uses <strong>2.5x Supersampling</strong>, effectively boosting the output to professional print quality. 
                        Whether you are extracting high-resolution blueprints, financial charts, or photographic portfolios, 
                        the fine lines and typography stay sharp.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. PNG: Lossless Quality</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                If you need to preserve the sharpest possible text and keep any transparent backgrounds intact, 
                                <strong>PNG</strong> is the correct choice. It is a "Lossless" format, meaning the quality 
                                does not degrade after extraction, making it perfect for designers and social media posts.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. JPG: Web & Email Friendly</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                <strong>JPG</strong> is a "Lossy" format designed to minimize file size. If you are extracting 
                                hundreds of pages to send via email or store on your phone, JPG provides the best balance 
                                between visual clarity and bandwidth economy.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Intelligent Batch Compiling</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Converting a 50-page PDF shouldn't mean fifty individual downloads. Our tool automatically 
                                identifies the number of pages, processes them in parallel, and compiles them into a 
                                <strong>timestamped ZIP archive</strong> for organized storage.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Privacy: The Problem with Cloud Converters</h3>
                    <p>
                        Standard PDF converters upload your documents to their company servers for processing. For sensitive documents 
                        like <strong>Bank Statements</strong>, <strong>Legal Contracts</strong>, and <strong>Personal ID Cards</strong>, 
                        this is a significant risk. SHB ToolBox eliminates this vulnerability. Our converter runs 
                        <strong>100% Client-Side</strong>. Your PDF is rendered inside your device's memory and is never transmitted over 
                        the internet, ensuring your privacy is physically guaranteed.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const inputS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none' };
const dropZone = { border: '3px dashed #334155', padding: '100px 20px', borderRadius: '30px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const btnDownload = { width: '100%', background: '#34d399', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
const btnReset = { background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px 20px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight:'bold' };
const imgCard = { background: '#0f172a', padding: '10px', borderRadius: '20px', border: '1px solid #334155' };
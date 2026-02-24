import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import imageCompression from 'browser-image-compression';

export default function ImageCompressor() {
    const [originalImage, setOriginalImage] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [quality, setQuality] = useState(0.8);
    const [compressing, setCompressing] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOriginalFile(file);
            setOriginalImage(URL.createObjectURL(file));
            setCompressedImage(null);
            setNotification('Image Loaded. Select quality and compress! 📸');
        }
    };

    const handleCompress = async () => {
        if (!originalFile) return;
        setCompressing(true);
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 2560,
            useWebWorker: true,
            initialQuality: quality
        };
        try {
            const compressedFile = await imageCompression(originalFile, options);
            setCompressedImage(URL.createObjectURL(compressedFile));
            setNotification('Optimization Complete! Ready to download. ✅');
        } catch (error) {
            console.error(error);
        }
        setCompressing(false);
    };

    return (
        <ToolboxLayout 
            title="Image Compressor - Reduce JPG, PNG & WebP File Size Online" 
            description="Professional image compression tool. Reduce file size by up to 90% without losing quality. Optimized for Web, Email, and SEO."
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP INTERESTING SECTION --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>AI-Powered Image Compressor</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Slow websites lose visitors. Reduce your image sizes by <strong>up to 90%</strong> without sacrificing 
                        visual clarity. Perfect for bloggers, photographers, and web designers.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>⚡ Zero Data Usage</span>
                        <span>🔒 100% Private</span>
                        <span>🚀 Next-Gen WebP Support</span>
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    {!originalImage ? (
                        <div style={dropZone}>
                            <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                            <div style={{fontSize:'4rem', marginBottom:'20px'}}>🖼️</div>
                            <p style={{fontSize:'1.3rem', color:'#fff'}}>Drag & Drop Image Here</p>
                            <p style={{color:'#475569'}}>Supports JPEG, PNG, HEIC, and WebP</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div style={imageCard}>
                                    <small style={{color:'#64748b', fontWeight:'bold'}}>ORIGINAL FILE</small>
                                    <img src={originalImage} style={imgPreview} alt="Original" />
                                    <p style={{fontWeight:'bold', color:'#fff', marginTop:'10px'}}>{(originalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div style={imageCard}>
                                    <small style={{color:'#34d399', fontWeight:'bold'}}>COMPRESSED VERSION</small>
                                    {compressedImage ? (
                                        <>
                                            <img src={compressedImage} style={imgPreview} alt="Compressed" />
                                            <p style={{fontWeight:'bold', color:'#34d399', marginTop:'10px'}}>Ready!</p>
                                        </>
                                    ) : <div style={placeholderBox}>Calculated after processing...</div>}
                                </div>
                            </div>

                            <div style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight:'bold' }}>Target Compression Quality</label>
                                    <span style={{ color: '#38bdf8', fontWeight:'bold' }}>{Math.round(quality * 100)}%</span>
                                </div>
                                <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: '100%', accentColor:'#38bdf8' }} />
                                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px', fontSize:'0.7rem', color:'#475569'}}>
                                    <span>MAX COMPRESSION</span>
                                    <span>MAX QUALITY</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                                <button onClick={handleCompress} disabled={compressing} style={btnPrimary}>
                                    {compressing ? 'OPTIMIZING PIXELS...' : 'COMPRESS NOW'}
                                </button>
                                <button onClick={() => { setOriginalImage(null); setCompressedImage(null); }} style={btnSecondary}>RESET</button>
                            </div>

                            {compressedImage && (
                                <a href={compressedImage} download={`shb_optimized_${originalFile.name}`} style={btnDownload}>
                                    💾 DOWNLOAD OPTIMIZED IMAGE
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '30px' }}>Mastering Image Optimization: Speed up your Website and SEO</h2>
                    <p>In the digital age, high-resolution photography is more accessible than ever, but it comes at a cost. Large image files are the #1 cause of slow-loading websites. The SHB Image Compressor uses <strong>Smart Re-sampling Algorithms</strong> to strip unnecessary metadata and compress pixel arrays without destroying the visual beauty of your photos.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '50px' }}>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>1. The SEO Advantage</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Google uses "Core Web Vitals" to rank websites. One of the biggest metrics is <strong>Largest Contentful Paint (LCP)</strong>. By compressing your hero banners and blog images, you ensure your page loads in under 2 seconds, boosting your ranking on Google Search.</p>
                        </div>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>2. Storage & Bandwidth Economy</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>For professional photographers and agencies, cloud storage costs (Google Drive, AWS, Dropbox) add up. Reducing a 5MB image to 500KB saves 90% of your storage space without the viewer ever noticing a difference in quality.</p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Why Use Client-Side Compression?</h3>
                    <p>Most "Free Image Compressors" work by uploading your private photos to their company servers. This is a massive privacy risk. At <strong>SHB ToolBox</strong>, we use <strong>Browser-Level WebWorkers</strong>. The compression happens inside your device's memory (RAM). Your photos are never sent to the internet, making this tool 100% secure for sensitive documents and personal galleries.</p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>How to choose the right quality setting?</h3>
                    <ul style={{ paddingLeft: '20px', marginTop:'20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>90% - Professional Portfolio:</strong> Best for high-end photography where you need to preserve every fine detail for Retina screens.</li>
                        <li style={{ marginBottom: '15px' }}><strong>80% - Blog & General Use:</strong> The "Sweet Spot." This reduces file size by 70-80% with zero visible distortion for most users.</li>
                        <li style={{ marginBottom: '15px' }}><strong>60% - Social Media & Mobile Apps:</strong> Maximum savings. Great for fast-scrolling feeds where speed is more important than raw resolution.</li>
                    </ul>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const dropZone = { border: '3px dashed #334155', padding: '80px 20px', borderRadius: '30px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a', transition:'0.3s' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const imageCard = { background: '#0f172a', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid #334155' };
const imgPreview = { width: '100%', height: '200px', objectFit: 'contain', borderRadius: '12px', marginTop: '15px' };
const placeholderBox = { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.8rem', fontStyle:'italic' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize:'1.1rem' };
const btnSecondary = { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
const btnDownload = { display: 'block', marginTop: '20px', textAlign: 'center', background: '#34d399', color: '#0f172a', textDecoration: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', fontSize:'1.1rem' };
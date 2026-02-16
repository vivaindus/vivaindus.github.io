import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const PRESETS = [
    { name: 'Instagram Post', w: 1080, h: 1080 },
    { name: 'Instagram Story', w: 1080, h: 1920 },
    { name: 'Facebook Cover', w: 820, h: 312 },
    { name: 'YouTube Thumb', w: 1280, h: 720 },
    { name: 'Twitter Post', w: 1200, h: 675 },
];

export default function ImageResizer() {
    const [originalImage, setOriginalImage] = useState(null);
    const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 }); // Keep track of the original size
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [aspectRatio, setAspectRatio] = useState(1);
    const [lockRatio, setLockRatio] = useState(true);
    const [resizedUrl, setResizedUrl] = useState(null);
    const [format, setFormat] = useState('image/jpeg');
    const [notification, setNotification] = useState('');

    // --- Toast Logic ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImage(event.target.result);
                    const w = img.width;
                    const h = img.height;
                    setNaturalDimensions({ width: w, height: h });
                    setDimensions({ width: w, height: h });
                    setAspectRatio(w / h);
                    setResizedUrl(null);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        const val = parseInt(value) || 0;
        if (name === 'width') {
            setDimensions({
                width: val,
                height: lockRatio ? Math.round(val / aspectRatio) : dimensions.height
            });
        } else {
            setDimensions({
                height: val,
                width: lockRatio ? Math.round(val * aspectRatio) : dimensions.width
            });
        }
    };

    const applyPreset = (p) => {
        setLockRatio(false); // Unlock to allow platform-specific crops
        setDimensions({ width: p.w, height: p.h });
        setNotification(`Applied ${p.name} preset`);
    };

    const resetToOriginal = () => {
        setDimensions(naturalDimensions);
        setLockRatio(true);
        setResizedUrl(null);
        setNotification('Reset to original dimensions');
    };

    const clearAll = () => {
        setOriginalImage(null);
        setNaturalDimensions({ width: 0, height: 0 });
        setDimensions({ width: 0, height: 0 });
        setResizedUrl(null);
        setNotification('Workspace cleared');
    };

    const processImage = () => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = originalImage;
        img.onload = () => {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
            setResizedUrl(canvas.toDataURL(format, 0.9));
            setNotification('Image generated successfully!');
        };
    };

    return (
        <ToolboxLayout title="Image Resizer Pro" description="Resize images for social media, website banners, and custom needs instantly.">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION TOAST */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Image Resizer Pro</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>High-quality pixel-perfect resizing for professional digital media.</p>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* LEFT SIDE: CONTROLS */}
                    <div style={{ flex: 1, minWidth: '320px', background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        {!originalImage ? (
                            <div style={dropZone}>
                                <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                                <p style={{ fontSize: '1.2rem' }}>📁 Click to Upload Image</p>
                                <small style={{ color: '#475569' }}>Supports PNG, JPG, WebP</small>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ color: '#38bdf8', margin: 0 }}>Adjustment Tools</h4>
                                    <button onClick={clearAll} style={btnGhost}>Change Image</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={labelStyle}>Width (px)</label>
                                        <input type="number" name="width" value={dimensions.width} onChange={handleDimensionChange} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Height (px)</label>
                                        <input type="number" name="height" value={dimensions.height} onChange={handleDimensionChange} style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} /> Lock Aspect Ratio
                                    </label>
                                    <button onClick={resetToOriginal} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset to Original Size</button>
                                </div>

                                <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Platform Presets</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                                    {PRESETS.map(p => (
                                        <button key={p.name} onClick={() => applyPreset(p)} style={btnPreset}>
                                            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.w} x {p.h}</div>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={processImage} style={btnPrimary}>GENERATE RESIZED IMAGE</button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: PREVIEW */}
                    <div style={{ flex: 1.5, minWidth: '320px', background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                        {originalImage ? (
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <h4 style={{ color: '#94a3b8', marginTop: 0, marginBottom: '20px' }}>Real-time Preview</h4>
                                <img 
                                    src={resizedUrl || originalImage} 
                                    style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '12px', border: '4px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                                    alt="Preview" 
                                />
                                {resizedUrl && (
                                    <div style={{ marginTop: '25px' }}>
                                        <a href={resizedUrl} download="shb_resized_image.jpg" style={btnDownload}>💾 DOWNLOAD RESIZED IMAGE</a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#475569' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}>🖼️</p>
                                <p>Upload an image to start resizing</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SEO CONTENT SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Image Resizing for Social Media & Web Development</h2>
                    <p>
                        SHB Image Resizer Pro is a specialized utility designed to give you precise control over your digital media dimensions. 
                        Whether you are an Instagram creator, a web developer optimizing UI elements, or a professional photographer needing specific 
                        aspect ratios, our tool provides a browser-based, high-fidelity solution.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Use Pixel-Perfect Resizing?</h3>
                    <p>
                        Different digital platforms require exact resolutions for the best display quality. If your image is too small, it appears 
                        blurry; if it's too large, the platform will apply its own "lossy" compression, destroying your visual clarity. Our tool 
                        helps you avoid these pitfalls with:
                    </p>
                    <ul>
                        <li><strong>Social Media Presets:</strong> Pre-configured dimensions for Instagram Posts, Stories, YouTube Thumbnails, and Facebook Covers.</li>
                        <li><strong>Aspect Ratio Locking:</strong> Maintains the proportions of your image to prevent "stretching" or "squashing" your subjects.</li>
                        <li><strong>HTML5 Canvas Rendering:</strong> Uses the latest browser technology to re-sample your image at the highest quality possible.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy-First Workflow</h3>
                    <p>
                        Most online resizers upload your private photos to their servers. At SHB ToolBox, we prioritize your security. 
                        All resizing logic is <strong>executed locally in your browser</strong>. Your images never leave your device, ensuring 100% 
                        confidentiality for sensitive documents or proprietary brand assets.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '100px 20px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', marginTop: '5px', outline: 'none' };
const labelStyle = { fontSize: '0.8rem', color: '#94a3b8' };
const btnPreset = { background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: '0.2s' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnDownload = { display: 'inline-block', background: '#34d399', color: '#0f172a', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' };
const btnGhost = { background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' };
import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const PRESETS = [
    { name: 'Instagram Post', w: 1080, h: 1080, cat: 'Social' },
    { name: 'Instagram Story', w: 1080, h: 1920, cat: 'Social' },
    { name: 'YouTube Thumb', w: 1280, h: 720, cat: 'Video' },
    { name: 'Facebook Cover', w: 820, h: 312, cat: 'Social' },
    { name: 'LinkedIn Banner', w: 1584, h: 396, cat: 'Pro' },
];

export default function ImageResizer() {
    const [mounted, setMounted] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [lockRatio, setLockRatio] = useState(true);
    const [resizedUrl, setResizedUrl] = useState(null);
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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImage(event.target.result);
                    setNaturalDimensions({ width: img.width, height: img.height });
                    setDimensions({ width: img.width, height: img.height });
                    setResizedUrl(null);
                    setNotification('Image Loaded! Ready to resize. 🖼️');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        const val = parseInt(value) || 0;
        const ratio = naturalDimensions.width / naturalDimensions.height;

        if (name === 'width') {
            setDimensions({
                width: val,
                height: lockRatio ? Math.round(val / ratio) : dimensions.height
            });
        } else {
            setDimensions({
                height: val,
                width: lockRatio ? Math.round(val * ratio) : dimensions.width
            });
        }
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
            setResizedUrl(canvas.toDataURL('image/jpeg', 0.92));
            setNotification('Image Resized Successfully! ✅');
        };
    };

    if (!mounted) return <ToolboxLayout title="Image Resizer" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Booting Graphics Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Image Resizer - Custom Dimensions & Social Presets" 
            description="Resize your images for Instagram, YouTube, and Facebook instantly. Maintain aspect ratio and high-quality resolution with our local browser-based resizer."
        >
            <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Image Resizer Pro</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Visual content is the language of the internet. Whether you're optimizing a <strong>YouTube Thumbnail</strong> 
                        or fitting a <strong>LinkedIn Banner</strong>, our tool ensures your pixels stay sharp and your aspect 
                        ratios stay perfect.
                    </p>
                </div>

                {/* --- CALCULATOR / APP AREA --- */}
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* CONTROLS */}
                    <div style={{ flex: 1, minWidth: '320px', background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        {!originalImage ? (
                            <div style={dropZone}>
                                <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                                <p style={{ fontSize: '1.2rem', color: '#fff' }}>📁 Click to Upload</p>
                                <small style={{ color: '#475569' }}>PNG, JPG, WebP supported</small>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Custom Dimensions</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={lCap}>Width (px)</label>
                                        <input type="number" name="width" value={dimensions.width} onChange={handleDimensionChange} style={inputS} />
                                    </div>
                                    <div>
                                        <label style={lCap}>Height (px)</label>
                                        <input type="number" name="height" value={dimensions.height} onChange={handleDimensionChange} style={inputS} />
                                    </div>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '25px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} /> 
                                    Lock Aspect Ratio ({ (naturalDimensions.width / naturalDimensions.height).toFixed(2) }:1)
                                </label>

                                <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Social Media Presets</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                                    {PRESETS.map(p => (
                                        <button key={p.name} onClick={() => { setLockRatio(false); setDimensions({ width: p.w, height: p.h }); }} style={btnPreset}>
                                            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.w}x{p.h}</div>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={processImage} style={btnPrimary}>GENERATE NEW IMAGE</button>
                                <button onClick={() => { setOriginalImage(null); setResizedUrl(null); }} style={btnReset}>START NEW</button>
                            </div>
                        )}
                    </div>

                    {/* PREVIEW */}
                    <div style={{ flex: 1.5, minWidth: '320px', background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid #334155', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        {originalImage ? (
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <img src={resizedUrl || originalImage} style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '12px', border: '4px solid #1e293b' }} alt="Preview" />
                                {resizedUrl && (
                                    <div style={{ marginTop: '20px' }}>
                                        <a href={resizedUrl} download="shb_resized.jpg" style={btnDownload}>💾 DOWNLOAD IMAGE</a>
                                    </div>
                                )}
                            </div>
                        ) : <p style={{ color: '#475569' }}>Your preview will appear here</p>}
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Science of Image Resizing & Social Media Impact</h2>
                    <p>
                        Image resizing is more than just changing numbers; it is a critical step in digital asset management. 
                        When you upload an image to platforms like Instagram or LinkedIn, their internal servers often 
                        crop or compress your files automatically. By using the <strong>SHB Image Resizer Pro</strong>, 
                        you take control of your visual narrative by providing platforms with the exact pixels they require.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Why Aspect Ratio is Critical</h3>
                    <p>
                        Aspect ratio is the proportional relationship between an image's width and height. If you 
                        stretch a landscape photo to fit a square profile picture without maintaining the ratio, 
                        your image will appear "squashed." Our tool includes an <strong>Aspect Ratio Lock</strong> 
                        that ensures as you increase the width, the height adjusts perfectly to maintain original proportions.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Professional High-DPI Output</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                For "Retina" and 4K displays, using the correct resolution is vital. An Instagram post 
                                at 1080x1080 remains sharp even on high-end smartphones. Our resizer uses the 
                                <strong>HTML5 Canvas API</strong> with high-quality smoothing enabled to ensure that 
                                downscaling doesn't result in "Aliasing" (jagged edges).
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. SEO & Loading Speed</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Large images are heavy. If you use a 4000px image for a 300px website widget, 
                                your page speed will drop significantly. By resizing images to their exact "display size" 
                                before uploading to your blog, you improve your Google Core Web Vitals score.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Multi-Platform Presets</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Remembering the dimensions for every platform is impossible. Our suite includes 
                                one-click presets for the <strong>GCC's most popular platforms</strong>, including 
                                Instagram, Facebook, and LinkedIn, saving you hours of searching.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '60px', fontSize: '1.5rem' }}>Privacy-First Creative Workspace</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, your data is never used for training or tracking. 
                        Traditional online resizers upload your photos to their servers. We use <strong>Client-Side 
                        Rendering</strong>. Your photos stay in your browser's local memory. This not only makes 
                        the tool faster but ensures that sensitive company documents or personal photography 
                        stays 100% private and secure.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styles
const dropZone = { border: '3px dashed #334155', padding: '80px 20px', borderRadius: '25px', textAlign: 'center', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const inputS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none' };
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const btnPreset = { background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnReset = { width: '100%', background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '10px', borderRadius: '15px', cursor: 'pointer', marginTop: '10px', fontSize: '0.8rem', fontWeight: 'bold' };
const btnDownload = { background: '#34d399', color: '#0f172a', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block' };
const statItem = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
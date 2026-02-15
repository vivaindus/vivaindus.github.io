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
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [aspectRatio, setAspectRatio] = useState(1);
    const [lockRatio, setLockRatio] = useState(true);
    const [resizedUrl, setResizedUrl] = useState(null);
    const [format, setFormat] = useState('image/jpeg');

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImage(event.target.result);
                    setDimensions({ width: img.width, height: img.height });
                    setAspectRatio(img.width / img.height);
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

    const applyPreset = (w, h) => {
        setLockRatio(false); // Unlock to allow preset dimensions
        setDimensions({ width: w, height: h });
    };

    const processImage = () => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = originalImage;
        img.onload = () => {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
            setResizedUrl(canvas.toDataURL(format, 0.9));
        };
    };

    return (
        <ToolboxLayout title="Image Resizer Pro" description="Resize images for social media with custom dimensions and presets.">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Image Resizer Pro</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>Professional pixel-perfect resizing for all platforms.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    
                    {/* LEFT COLUMN: CONTROLS */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        {!originalImage ? (
                            <div style={dropZone}>
                                <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                                <p>📁 Select Image</p>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ color: '#38bdf8', marginTop: 0 }}>Dimensions</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Width (px)</label>
                                        <input type="number" name="width" value={dimensions.width} onChange={handleDimensionChange} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Height (px)</label>
                                        <input type="number" name="height" value={dimensions.height} onChange={handleDimensionChange} style={inputStyle} />
                                    </div>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '30px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} />
                                    Lock Aspect Ratio
                                </label>

                                <h4 style={{ color: '#38bdf8' }}>Social Media Presets</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '30px' }}>
                                    {PRESETS.map(p => (
                                        <button key={p.name} onClick={() => applyPreset(p.w, p.h)} style={btnPreset}>
                                            {p.name} <small style={{color:'#64748b'}}>({p.w}x{p.h})</small>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={processImage} style={btnPrimary}>GENERATE RESIZED IMAGE</button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center' }}>
                        <h4 style={{ color: '#94a3b8', marginTop: 0 }}>Preview</h4>
                        {originalImage ? (
                            <div style={{ position: 'relative' }}>
                                <img src={resizedUrl || originalImage} style={{ maxWidth: '100%', borderRadius: '12px', border: '4px solid #1e293b' }} alt="Preview" />
                                {resizedUrl && (
                                    <a href={resizedUrl} download="shb_resized.jpg" style={btnDownload}>DOWNLOAD RESIZED IMAGE</a>
                                )}
                            </div>
                        ) : <p style={{ color: '#475569', marginTop: '100px' }}>Upload an image to see the preview.</p>}
                    </div>
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Advanced Image Resizing & Social Media Optimization</h2>
                    <p>
                        The SHB Image Resizer Pro is a specialized utility designed for content creators, web developers, and social media managers. 
                        Changing the dimensions of an image is not just about stretching pixels; it is about maintaining visual integrity 
                        while meeting the strict requirements of modern digital platforms.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>One-Click Social Media Presets</h3>
                    <p>
                        Every social platform has its own optimal resolution. Posting a wrong-sized image can lead to awkward cropping or 
                        blurry visuals. Our tool includes built-in presets for:
                    </p>
                    <ul>
                        <li><strong>Instagram Posts & Stories:</strong> Perfect 1:1 and 9:16 ratios for maximum engagement.</li>
                        <li><strong>Facebook & YouTube:</strong> Exact dimensions for Cover photos and Video Thumbnails to ensure your branding isn't cut off.</li>
                        <li><strong>Custom Work:</strong> Full control over Width and Height for custom website banners or UI elements.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>The Importance of Aspect Ratio</h3>
                    <p>
                        Our <strong>Aspect Ratio Lock</strong> feature ensures that when you change the width, the height adjusts automatically 
                        to prevent "squashing" or "stretching" your photo. This is crucial for maintaining the professional look of 
                        portraits and landscape photography.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>High-Quality Canvas Rendering</h3>
                    <p>
                        Unlike basic CSS scaling, SHB ToolBox uses the <strong>HTML5 Canvas API</strong> to re-render your image. 
                        This process uses sub-pixel interpolation to ensure that even when downscaling a large 4K image, 
                        the resulting file remains sharp and clear.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy-First Workflow</h3>
                    <p>
                        Your media is your own. We do not upload your images to any server. All resizing logic happens <strong>locally in your browser</strong>. 
                        This means faster processing times and total security for your private photos, company assets, or client projects.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '60px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', marginTop: '5px' };
const labelStyle = { fontSize: '0.8rem', color: '#94a3b8' };
const btnPreset = { background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDownload = { display: 'block', marginTop: '20px', background: '#34d399', color: '#0f172a', padding: '15px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' };
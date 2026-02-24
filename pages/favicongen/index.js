import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

const ICON_SIZES = [
    { size: 16, name: 'favicon-16x16.png', label: 'Classic Tab' },
    { size: 32, name: 'favicon-32x32.png', label: 'Bookmark' },
    { size: 180, name: 'apple-touch-icon.png', label: 'iOS/iPhone' },
    { size: 192, name: 'android-chrome-192x192.png', label: 'Android' },
    { size: 512, name: 'android-chrome-512x512.png', label: 'PWA Large' },
];

export default function FaviconGenerator() {
    const [sourceImage, setSourceImage] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
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
            const url = URL.createObjectURL(file);
            setSourceImage(file);
            setPreviewUrl(url);
            setNotification('Image uploaded successfully! ✅');
        }
    };

    const generateIcons = async () => {
        if (!sourceImage) return;
        setGenerating(true);
        const zip = new JSZip();
        const img = new Image();
        img.src = previewUrl;

        await new Promise((resolve) => {
            img.onload = () => {
                ICON_SIZES.forEach(({ size, name }) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, size, size);
                    const dataUrl = canvas.toDataURL('image/png');
                    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
                    zip.file(name, base64Data, { base64: true });
                });
                resolve();
            };
        });

        zip.file("implementation_guide.txt", "SHB ToolBox - Favicon Implementation\n\n1. Move these files to your website root directory.\n2. Paste this code into your <head> section:\n\n<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png'>\n<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png'>");

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "shb_favicon_package.zip";
        link.click();
        setGenerating(false);
        setNotification('Package ready for download! 📦');
    };

    return (
        <ToolboxLayout 
            title="Favicon & App Icon Generator - Pro Web Identity Tool" 
            description="Create professional favicon packages for Apple, Android, and Desktop browsers. Automatically resize your logo into 16x16, 32x32, 180x180, and more."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: INTERESTING HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Professional Favicon Generator</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Your website's <strong>Favicon</strong> is the first part of your brand users see in their browser tabs. 
                        Don't settle for a blurry icon—generate a complete, pixel-perfect <strong>App Icon Suite</strong> for all 
                        modern devices in a single click.
                    </p>
                </div>

                {/* --- APP AREA --- */}
                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    {!previewUrl ? (
                        <div style={dropZone}>
                            <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                            <div style={{ fontSize: '3rem' }}>📁</div>
                            <p style={{ fontSize: '1.2rem', color: '#fff', marginTop: '10px' }}>Select or Drag your Logo</p>
                            <p style={{ color: '#475569', fontSize: '0.8rem' }}>PNG, JPG, or WebP (Square image recommended)</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                <div>
                                    <p style={lCap}>ORIGINAL LOGO</p>
                                    <img src={previewUrl} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '15px', border: '3px solid #0f172a' }} alt="Source" />
                                </div>
                                <div>
                                    <p style={lCap}>TAB PREVIEW (16x16)</p>
                                    <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                                        <img src={previewUrl} style={{ width: '16px', height: '16px' }} alt="16px" />
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>SHB ToolBox...</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                                <button onClick={generateIcons} disabled={generating} style={btnPrimary}>
                                    {generating ? 'Processing Bundle...' : 'GENERATE ICON PACKAGE (.ZIP)'}
                                </button>
                                <button onClick={() => setPreviewUrl(null)} style={btnSecondary}>UPLOAD NEW IMAGE</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '30px' }}>The Technical Standards of Website Favicons</h2>
                    <p>
                        In the early days of the web, a single <strong>favicon.ico</strong> file was all you needed. Today, 
                        with the rise of High-DPI (Retina) screens, smartphones, and PWAs (Progressive Web Apps), 
                        providing a single icon is no longer enough. The SHB Favicon Suite automates the creation of 
                        every specialized file format required by Google, Apple, and Microsoft.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '50px' }}>
                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.2rem' }}>1. Desktop Browser Requirements</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Standard browsers like Chrome and Firefox use <strong>16x16px</strong> icons for tabs and 
                                <strong>32x32px</strong> icons for bookmarks and toolbar shortcuts. Providing PNG versions of these 
                                ensures the best color accuracy and transparency rendering across different operating systems.
                            </p>
                        </div>
                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.2rem' }}>2. The Apple Touch Icon</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                iOS devices (iPhone and iPad) require a specific <strong>180x180px</strong> icon when a user selects 
                                "Add to Home Screen." Our tool automatically generates this file with the correct naming 
                                convention (apple-touch-icon.png) so that Safari can find it instantly.
                            </p>
                        </div>
                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.2rem' }}>3. Android Chrome & PWA Specs</h3>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                For Android users, Google recommends a manifest-driven approach with <strong>192x192px</strong> 
                                and <strong>512x512px</strong> icons. These large formats are vital for Progressive Web Apps, 
                                as they serve as the splash screen and app drawer icon on mobile devices.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Implementation Best Practices</h3>
                    <p>
                        Once you download your SHB Favicon Package, it is best practice to place all generated PNGs into your 
                        website's <strong>root directory</strong>. While modern browsers are very smart at detecting icons, 
                        always include the meta tags in your HTML <code>&lt;head&gt;</code> to ensure 100% compatibility across 
                        older devices and specific social sharing crawlers.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Privacy-First Logo Processing</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we respect your brand's intellectual property. Unlike cloud generators 
                        that upload your logo to their servers for storage or analysis, our Favicon Generator uses 
                        <strong>High-Performance Browser Canvas</strong>. Every resize and ZIP generation happens entirely 
                        on your local machine. Your high-resolution brand assets never touch our database or Supabase records, 
                        ensuring your design stays secure.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const dropZone = { border: '3px dashed #334155', padding: '100px 20px', borderRadius: '25px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const lCap = { fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px 30px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' };
const btnSecondary = { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '18px 30px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
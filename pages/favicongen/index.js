import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

const ICON_SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
];

export default function FaviconGenerator() {
    const [sourceImage, setSourceImage] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSourceImage(file);
            setPreviewUrl(url);
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
                    
                    // Draw image centered and scaled
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    const dataUrl = canvas.toDataURL('image/png');
                    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
                    zip.file(name, base64Data, { base64: true });
                });
                resolve();
            };
        });

        // Add a basic instructions file
        zip.file("instructions.txt", "Upload these files to your website root and add these tags to your <head>:\n\n<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png'>\n<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png'>");

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "shb_favicon_pack.zip";
        link.click();
        setGenerating(false);
    };

    return (
        <ToolboxLayout title="Favicon & App Icon Generator" description="Convert your logo into all standard favicon sizes for Apple, Android, and Web.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Favicon Generator</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Generate a complete set of website icons in seconds.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {!previewUrl ? (
                        <div style={dropZone}>
                            <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                            <p>🖼️ Upload Your Logo (Square recommended)</p>
                            <small>Supports PNG, JPG, WebP</small>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Original</p>
                                    <img src={previewUrl} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #334155' }} alt="Source" />
                                </div>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Browser Tab Preview</p>
                                    <div style={{ background: '#0f172a', padding: '10px 20px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={previewUrl} style={{ width: '16px', height: '16px' }} alt="16px" />
                                        <span style={{ fontSize: '0.7rem', color: '#fff' }}>SHB ToolBox...</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={generateIcons} disabled={generating} style={btnPrimary}>
                                {generating ? 'Processing Icons...' : 'GENERATE FAVICON PACK (ZIP)'}
                            </button>
                            <button onClick={() => setPreviewUrl(null)} style={{ background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer', marginTop: '15px', display: 'block', margin: '15px auto' }}>Change Image</button>
                        </div>
                    )}
                </div>

                {/* --- SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Complete Favicon & App Icon Solutions</h2>
                    <p>
                        The SHB Favicon Generator is a vital utility for web developers and business owners. A favicon is not just a decoration; it is a critical part of your website's branding and user experience. It helps users find your tab among dozens of others and provides a professional look when your site is bookmarked or added to a home screen.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why You Need Multiple Icon Sizes</h3>
                    <p>
                        Different devices and browsers require different image dimensions to display your logo clearly. Our tool automatically creates the industry-standard "Favicon Pack" which includes:
                    </p>
                    <ul>
                        <li><strong>Standard Favicons (16x16 & 32x32):</strong> Used by classic desktop browsers like Chrome, Firefox, and Safari for tabs and bookmarks.</li>
                        <li><strong>Apple Touch Icon (180x180):</strong> Required by iOS devices when a user adds your website to their iPhone or iPad home screen.</li>
                        <li><strong>Android Chrome Icons (192x192 & 512x512):</strong> Essential for Progressive Web Apps (PWAs) and Android device home screens.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Pixel-Perfect Canvas Scaling</h3>
                    <p>
                        Our generator uses advanced HTML5 Canvas interpolation. This means that even if you upload a large logo, our engine will downscale it while maintaining as much detail and color accuracy as possible, ensuring your icon looks sharp even at the tiny 16-pixel size.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '60px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative', background: '#0f172a' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
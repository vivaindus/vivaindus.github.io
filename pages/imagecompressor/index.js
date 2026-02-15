import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import imageCompression from 'browser-image-compression';

export default function ImageCompressor() {
    const [originalImage, setOriginalImage] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [quality, setQuality] = useState(0.8);
    const [compressing, setCompressing] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOriginalFile(file);
            setOriginalImage(URL.createObjectURL(file));
            setCompressedImage(null);
        }
    };

    const handleCompress = async () => {
        if (!originalFile) return;
        setCompressing(true);
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: quality
        };
        try {
            const compressedFile = await imageCompression(originalFile, options);
            setCompressedImage(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error(error);
        }
        setCompressing(false);
    };

    return (
        <ToolboxLayout title="Pro Image Compressor" description="Compress JPG, PNG, and WebP images locally without losing quality.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '10px' }}>Image Compressor</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Reduce file size without losing visual quality.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* UPLOAD SECTION */}
                    {!originalImage ? (
                        <div style={dropZone}>
                            <input type="file" accept="image/*" onChange={handleUpload} style={fileInput} />
                            <p>📸 Click or Drag Image to Upload</p>
                            <small>Supports JPG, PNG, WebP</small>
                        </div>
                    ) : (
                        <div>
                            {/* COMPARISON VIEW */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div style={imageCard}>
                                    <small style={{color:'#38bdf8'}}>ORIGINAL</small>
                                    <img src={originalImage} style={imgPreview} alt="Original" />
                                    <p>{(originalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div style={imageCard}>
                                    <small style={{color:'#34d399'}}>COMPRESSED</small>
                                    {compressedImage ? (
                                        <>
                                            <img src={compressedImage} style={imgPreview} alt="Compressed" />
                                            <p>Optimized</p>
                                        </>
                                    ) : <div style={placeholderBox}>Waiting...</div>}
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Compression Quality: {Math.round(quality * 100)}%</label>
                                <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: '100%' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleCompress} disabled={compressing} style={btnPrimary}>
                                    {compressing ? 'Compressing...' : 'START COMPRESSION'}
                                </button>
                                <button onClick={() => setOriginalImage(null)} style={btnSecondary}>RESET</button>
                            </div>

                            {compressedImage && (
                                <a href={compressedImage} download={`shb_compressed_${originalFile.name}`} style={btnDownload}>
                                    DOWNLOAD COMPRESSED IMAGE
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* --- SEO CONTENT SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Online Image Compression</h2>
                    <p>
                        In the modern digital landscape, image optimization is critical for website performance, email efficiency, and storage management. 
                        The SHB Image Compressor provides a professional-grade solution to reduce the file size of your photos without 
                        sacrificing visible clarity.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Optimize Your Images?</h3>
                    <p>
                        High-resolution images from modern smartphones and cameras often exceed 5MB in size. While these look great, they cause 
                        significant issues:
                    </p>
                    <ul>
                        <li><strong>SEO & Page Speed:</strong> Large images slow down websites, leading to lower rankings on Google.</li>
                        <li><strong>Email Limits:</strong> Many email providers cap attachments at 20MB. Compressing images allows you to send more files in a single message.</li>
                        <li><strong>Storage Costs:</strong> Cloud storage like Google Drive or Dropbox fills up quickly with raw photos. Compressed versions save up to 80% of space.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Smart Local Compression Technology</h3>
                    <p>
                        Safety is our priority. Unlike other online tools that upload your private photos to a central server, the 
                        SHB ToolBox uses <strong>Client-Side browser processing</strong>. Your images never leave your computer. 
                        We use the `browser-image-compression` engine to perform advanced mathematical re-encoding directly in your 
                        RAM, ensuring your personal and professional photos remain 100% private.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Supported Formats and Usage</h3>
                    <p>
                        Our suite fully supports <strong>JPEG, PNG, and WebP</strong> formats. Use the quality slider to find the 
                        perfect balance between file size reduction and visual detail. We recommend 80% for web use and 90% for 
                        high-quality social media posts.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const dropZone = { border: '3px dashed #334155', padding: '60px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', position: 'relative', cursor: 'pointer' };
const fileInput = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const imageCard = { background: '#0f172a', padding: '15px', borderRadius: '15px', textAlign: 'center' };
const imgPreview = { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' };
const placeholderBox = { height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.8rem' };
const btnPrimary = { flex: 2, background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { flex: 1, background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDownload = { display: 'block', marginTop: '15px', textAlign: 'center', background: '#34d399', color: '#0f172a', textDecoration: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' };
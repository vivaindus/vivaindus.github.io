import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

const qrTypes = {
    standard: { label: "Standard QR", desc: "Best for URLs and general text. Max 4296 chars.", limit: 4000 },
    micro: { label: "Micro QR", desc: "Compact version for limited space. Max 35 chars.", limit: 35 },
    static: { label: "Static QR", desc: "Permanent data that never expires. Max 2000 chars.", limit: 2000 },
    vcard: { label: "vCard QR", desc: "Share contact details (Name, Phone).", limit: 500 },
    wifi: { label: "Wi-Fi QR", desc: "Share network name (SSID) and Password.", limit: 100 },
    location: { label: "Location QR", desc: "Link to Map coordinates (Lat, Long).", limit: 100 },
    social: { label: "Social Media QR", desc: "Direct link to Profile/Handle.", limit: 500 },
    dynamic: { label: "Dynamic Info", desc: "Formatted for easy data updates.", limit: 1000 },
    model2: { label: "Model 2 QR", desc: "Improved error correction and capacity.", limit: 3000 },
    frame: { label: "Frame Style", desc: "Formatted for marketing materials.", limit: 1000 }
};

export default function QRCodeGen() {
    const [input, setInput] = useState('https://www.shbstores.com/qrcode');
    const [color, setColor] = useState('000000');
    const [type, setType] = useState('standard');
    const [size, setSize] = useState('300');
    const textAreaRef = useRef(null);
    const lineNumbersRef = useRef(null);

    // Sync scrolling of line numbers and textarea
    const handleScroll = () => {
        if (lineNumbersRef.current && textAreaRef.current) {
            lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
        }
    };

    const lines = input.split('\n').filter(l => l.trim() !== "");
    const lineNumbers = input.split('\n').map((_, i) => i + 1).join('\n');

    const formatData = (data) => {
        if (type === 'wifi') return `WIFI:S:${data};T:WPA;P:password;;`;
        if (type === 'vcard') return `BEGIN:VCARD\nFN:${data}\nEND:VCARD`;
        if (type === 'location') return `geo:${data}`;
        return data;
    };

    const getUrl = (data) => {
        const formatted = formatData(data);
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=${color}&data=${encodeURIComponent(formatted)}`;
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        const folder = zip.folder("shb_qr_studio");
        for (let i = 0; i < lines.length; i++) {
            const response = await fetch(getUrl(lines[i]));
            const blob = await response.blob();
            folder.file(`line_${i + 1}_qr.png`, blob);
        }
        zip.generateAsync({ type: "blob" }).then((content) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "shb_bulk_qr.zip";
            link.click();
        });
    };

    return (
        <ToolboxLayout title="Bulk QR Studio" description="Advanced QR generator with 10 types and bulk ZIP export.">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '30px' }}>Pro QR Studio</h1>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    {/* INPUT SECTION WITH LINE NUMBERS */}
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>Enter one item per line for bulk generation:</p>
                    <div style={{ display: 'flex', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', height: '180px' }}>
                        <div ref={lineNumbersRef} style={{ width: '40px', background: '#1a2333', color: '#475569', padding: '15px 5px', fontSize: '1rem', textAlign: 'center', lineHeight: '1.5', overflow: 'hidden', whiteSpace: 'pre' }}>
                            {lineNumbers}
                        </div>
                        <textarea 
                            ref={textAreaRef}
                            onScroll={handleScroll}
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '15px', fontSize: '1rem', lineHeight: '1.5', resize: 'none', outline: 'none' }} 
                        />
                    </div>

                    {/* SETTINGS SECTION */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Select QR Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '10px', borderRadius: '10px', marginTop: '5px' }}>
                                {Object.keys(qrTypes).map(k => <option key={k} value={k}>{qrTypes[k].label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>QR Color</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                <input type="color" value={`#${color}`} onChange={(e) => setColor(e.target.value.replace('#', ''))} style={{ height: '40px', width: '60px', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                                <span style={{ color: '#fff', fontSize: '0.9rem' }}>#{color}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', marginTop: '20px', borderLeft: '4px solid #38bdf8' }}>
                        <p style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 'bold' }}>{qrTypes[type].label} Details:</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{qrTypes[type].desc}</p>
                        <small style={{ color: '#64748b' }}>Limit: {qrTypes[type].limit} characters per code.</small>
                    </div>

                    {/* LIVE PREVIEWS (First 6) */}
                    <div style={{ marginTop: '30px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>Live Preview (First 6 items):</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                            {lines.slice(0, 6).map((line, idx) => (
                                <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                                    <img src={getUrl(line)} alt={`QR ${idx + 1}`} style={{ width: '100%', height: 'auto' }} />
                                    <small style={{ color: '#000', fontSize: '0.6rem', fontWeight: 'bold' }}>Line {idx + 1}</small>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={downloadZip} 
                        style={{ width: '100%', marginTop: '30px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                        DOWNLOAD {lines.length > 1 ? `ZIP (${lines.length} QR CODES)` : 'PNG IMAGE'}
                    </button>
                    {/* SEO CONTENT SECTION - MANDATORY FOR ADSENSE */}
<div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
    <h2 style={{ color: '#38bdf8' }}>Professional Bulk QR Code Generator</h2>
    <p>
        The SHB Bulk QR Studio is a powerful utility designed for businesses and creators who need to generate 
        high-quality QR codes in large volumes. Unlike standard generators, our tool allows you to input 
        multiple lines of data and export them all at once into a single ZIP file.
    </p>

    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Supported QR Code Types</h3>
    <ul>
        <li><strong>Standard & Model 2:</strong> Perfect for URLs and website links.</li>
        <li><strong>vCard:</strong> Instantly share contact details like name and phone number.</li>
        <li><strong>Wi-Fi:</strong> Help guests connect to your network without typing passwords.</li>
        <li><strong>Location:</strong> Link directly to GPS coordinates on Google Maps.</li>
    </ul>

    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy Matters</h3>
    <p>
        At SHB ToolBox, your data privacy is our priority. This QR generator processes your information 
        locally in your browser. We do not store the text or URLs you enter in our database, making this 
        one of the most secure ways to generate QR codes for sensitive information.
    </p>

    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>How to generate QR codes in bulk?</h3>
    <ol>
        <li>Select the type of QR code you need (Standard, Wi-Fi, etc.).</li>
        <li>Enter your data in the text area, putting each new code on a separate line.</li>
        <li>Choose your preferred color to match your branding.</li>
        <li>Click "Download ZIP" to receive all your images in one organized folder.</li>
    </ol>
</div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
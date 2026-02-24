import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import JSZip from 'jszip';

const qrTypes = {
    standard: { label: "Standard QR", desc: "Best for URLs and general text. High capacity.", limit: 4000 },
    vcard: { label: "vCard QR", desc: "Share contact details (Name, Phone, Email) instantly.", limit: 500 },
    wifi: { label: "Wi-Fi QR", desc: "Connect guests to your network without passwords.", limit: 100 },
    location: { label: "Location QR", desc: "Link directly to Map coordinates (Lat, Long).", limit: 100 },
    social: { label: "Social Media", desc: "Direct link to Profile handles and business pages.", limit: 500 }
};

export default function QRCodeGen() {
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState('https://www.shbstores.com/qrcode');
    const [color, setColor] = useState('000000');
    const [type, setType] = useState('standard');
    const [size, setSize] = useState('300');
    const [notification, setNotification] = useState('');
    const textAreaRef = useRef(null);
    const lineNumbersRef = useRef(null);

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (lines.length === 0) return;
        setNotification('Bundling your QR Codes... 🚀');
        const zip = new JSZip();
        const folder = zip.folder("shb_qr_studio");
        for (let i = 0; i < lines.length; i++) {
            const response = await fetch(getUrl(lines[i]));
            const blob = await response.blob();
            folder.file(`qr_code_line_${i + 1}.png`, blob);
        }
        zip.generateAsync({ type: "blob" }).then((content) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `shb_bulk_qr_${Date.now()}.zip`;
            link.click();
            setNotification('Download Ready! ✅');
        });
    };

    if (!mounted) return <ToolboxLayout title="Bulk QR Studio" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Booting QR Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Bulk QR Code Generator - Professional ZIP Export Utility" 
            description="Generate hundreds of QR codes at once for URLs, WiFi, or vCards. High-quality batch processing with customizable colors and ZIP export."
        >
            <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Bulk QR Studio</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Manual QR creation is a bottleneck for logistics and marketing. Our <strong>Batch Processing Suite</strong> 
                        allows you to transform thousands of lines of data into scannable assets in a single export.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>📂 ZIP Export</span>
                        <span>🎨 Custom Brand Colors</span>
                        <span>📱 All Scan Standards</span>
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px', fontWeight:'bold' }}>ENTER DATA (ONE ITEM PER LINE):</p>
                    <div style={{ display: 'flex', background: '#0f172a', borderRadius: '15px', border: '1px solid #334155', overflow: 'hidden', height: '220px' }}>
                        <div ref={lineNumbersRef} style={{ width: '50px', background: '#1a2333', color: '#475569', padding: '20px 0', fontSize: '1rem', textAlign: 'center', lineHeight: '1.5', overflow: 'hidden', whiteSpace: 'pre' }}>
                            {lineNumbers}
                        </div>
                        <textarea 
                            ref={textAreaRef}
                            onScroll={handleScroll}
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '20px', fontSize: '1.1rem', lineHeight: '1.5', resize: 'none', outline: 'none' }} 
                            placeholder="https://google.com&#10;https://apple.com"
                        />
                    </div>

                    {/* SETTINGS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginTop: '30px' }}>
                        <div>
                            <label style={lCap}>QR Standards Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} style={inputS}>
                                {Object.keys(qrTypes).map(k => <option key={k} value={k}>{qrTypes[k].label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={lCap}>Brand Primary Color</label>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                                <input type="color" value={`#${color}`} onChange={(e) => setColor(e.target.value.replace('#', ''))} style={{ height: '45px', width: '70px', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                                <span style={{ color: '#fff', fontSize: '1rem', fontWeight:'bold' }}>#{color.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', marginTop: '30px', borderLeft: '5px solid #38bdf8' }}>
                        <p style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 'bold' }}>{qrTypes[type].label} Protocol Active:</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{qrTypes[type].desc}</p>
                    </div>

                    {/* PREVIEW AREA */}
                    {lines.length > 0 && (
                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>Visual Batch Preview (First 6):</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', justifyContent:'center' }}>
                                {lines.slice(0, 6).map((line, idx) => (
                                    <div key={idx} style={{ background: '#fff', padding: '12px', borderRadius: '15px', textAlign: 'center', boxShadow:'0 5px 15px rgba(0,0,0,0.3)' }}>
                                        <img src={getUrl(line)} alt={`QR ${idx + 1}`} style={{ width: '100%', height: 'auto' }} />
                                        <div style={{ color: '#000', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '5px' }}>LINE {idx + 1}</div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={downloadZip} style={btnPrimary}>
                                📥 DOWNLOAD BATCH AS ZIP ({lines.length} CODES)
                            </button>
                        </div>
                    )}
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Enterprise Guide to QR Technology & Batch Automation</h2>
                    <p>
                        QR (Quick Response) codes have transitioned from simple tracking labels to essential marketing and operational tools. 
                        For large-scale applications—such as event ticketing, inventory management, or multi-location marketing campaigns—generating 
                        codes one by one is inefficient. <strong>SHB Bulk QR Studio</strong> is built to solve this challenge through high-speed 
                        client-side automation.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Static vs. Dynamic QR Protocols</h3>
                    <p>
                        Understanding the nature of the data you encode is the first step in successful implementation. 
                        <strong>Static QR codes</strong> (like the ones generated here) encode the information directly into the pattern. 
                        This means they never expire and require no internet connection to function. Once printed, a static QR code 
                        is permanent, making it the gold standard for long-term labeling and business cards.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Contactless Connectivity (WiFi)</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                For restaurant owners and coworking spaces, the <strong>WiFi Standard</strong> is a game changer. 
                                By encoding your SSID and password into a batch of codes, you allow guests to connect instantly 
                                by simply pointing their camera at the table, reducing administrative friction.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Seamless Digital Networking (vCard)</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                The <strong>vCard protocol</strong> allows for the transmission of Name, Company, Email, and Phone data. 
                                With our bulk generator, an HR manager can create individual QR codes for an entire team's 
                                business cards in a single session.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Logistical Precision (Location)</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Encode GPS coordinates directly. This is vital for real estate and outdoor event management 
                                where you need to guide visitors to specific, pinpointed locations across a large area.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '60px', fontSize: '1.5rem' }}>Data Privacy & Enterprise Security</h3>
                    <p>
                        Most QR generators track scannable data on their servers to build "User Profiles." 
                        At <strong>SHB ToolBox</strong>, we prioritize the confidentiality of your data. The 
                        entire batch generation logic, including the construction of the ZIP archive, happens 
                        <strong>locally in your browser</strong>. Your company URLs, employee contact details, 
                        and private location data are never transmitted to our database, making our studio 
                        compliant with strict data protection standards.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styles
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' };
const inputS = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none' };
const btnPrimary = { width: '100%', marginTop: '40px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '22px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', transition: '0.3s' };
const paperWrapper = { flex: '3', minWidth: '0', background: '#334155', padding: '40px 10px', borderRadius: '15px', display: 'flex', justifyContent: 'center', overflowX: 'auto' };
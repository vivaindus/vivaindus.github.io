import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function QRCodeGen() {
    const [input, setInput] = useState('https://shbstores.com');
    const [size, setSize] = useState('300');

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(input)}`;

    const downloadQR = async () => {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shb-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ToolboxLayout title="QR Generator" description="Create and download custom QR codes.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1>QR Generator</h1>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Link or text..." style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', marginBottom: '20px' }} />

                    <div style={{marginBottom:'20px'}}>
                        <label style={{color:'#94a3b8', fontSize:'0.8rem'}}>Download Quality (Resolution):</label>
                        <select value={size} onChange={(e)=>setSize(e.target.value)} style={{marginLeft:'10px', background:'#0f172a', color:'#fff', padding:'5px', borderRadius:'5px'}}>
                            <option value="200">Standard (200x200)</option>
                            <option value="500">High Quality (500x500)</option>
                            <option value="1000">Ultra HD (1000x1000)</option>
                        </select>
                    </div>

                    <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '12px' }}>
                        <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                    </div>

                    <button onClick={downloadQR} style={{ display: 'block', width: '100%', marginTop: '20px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        DOWNLOAD PNG
                    </button>
                </div>
            </div>
        </ToolboxLayout>
    );
}
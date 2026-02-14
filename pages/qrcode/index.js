import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function QRCodeGen() {
    const [input, setInput] = useState('https://shbstores.com');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(input)}`;

    return (
        <ToolboxLayout title="QR Code Generator" description="Generate free QR codes for links, text, or phone numbers.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '10px', color: '#38bdf8' }}>QR Generator</h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Turn any link or text into a QR code</p>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter website link..."
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}
                    />

                    <div style={{ background: '#fff', padding: '20px', display: 'inline-block', borderRadius: '15px', marginTop: '10px' }}>
                        <img src={qrUrl} alt="QR Code" style={{ display: 'block' }} />
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '20px' }}>
                        Right-click the image to save or copy the QR code.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}
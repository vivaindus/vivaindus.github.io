import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PasswordGen() {
    const [password, setPassword] = useState('Click_Generate');
    const [length, setLength] = useState(12);

    const generate = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(retVal);
    };

    const copy = () => {
        navigator.clipboard.writeText(password);
        alert("Copied to clipboard!");
    };

    return (
        <ToolboxLayout title="Password Generator" description="Generate secure, random passwords instantly.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '30px' }}>Secure Pass Generator</h1>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', fontSize: '1.2rem', color: '#38bdf8', wordBreak: 'break-all', marginBottom: '20px', border: '1px solid #334155' }}>
                        {password}
                    </div>

                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Length: {length}</label>
                    <input type="range" min="8" max="32" value={length} onChange={(e) => setLength(e.target.value)} style={{ width: '100%', marginBottom: '30px' }} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={generate} style={{ flex: 2, background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>GENERATE</button>
                        <button onClick={copy} style={{ flex: 1, background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>COPY</button>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
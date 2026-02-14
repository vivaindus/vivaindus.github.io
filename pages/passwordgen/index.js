import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PasswordGen() {
    const [password, setPassword] = useState('Click_Generate');
    const [length, setLength] = useState(12);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('pass_history')) || [];
        setHistory(saved);
    }, []);

    const generate = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let newPass = "";
        for (let i = 0; i < length; ++i) {
            newPass += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(newPass);
        
        // Update History
        const newHistory = [newPass, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('pass_history', JSON.stringify(newHistory));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
    };

    return (
        <ToolboxLayout title="Password Generator" description="Generate secure passwords and track your history.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1>Password Generator</h1>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', marginBottom: '30px' }}>
                    <div onClick={() => copyToClipboard(password)} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', fontSize: '1.2rem', color: '#38bdf8', wordBreak: 'break-all', marginBottom: '20px', border: '1px solid #334155', cursor: 'pointer' }}>
                        {password}
                    </div>
                    <small style={{color:'#64748b'}}>Click password to copy</small>

                    <div style={{margin:'20px 0'}}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Length: {length}</label>
                        <input type="range" min="8" max="32" value={length} onChange={(e) => setLength(e.target.value)} style={{ width: '100%' }} />
                    </div>

                    <button onClick={generate} style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>GENERATE NEW</button>
                </div>

                {history.length > 0 && (
                    <div style={{ textAlign: 'left', background: '#1e293b', padding: '20px', borderRadius: '20px' }}>
                        <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Recent Passwords</h4>
                        {history.map((pass, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#0f172a', borderRadius: '8px', marginBottom: '8px' }}>
                                <code style={{fontSize:'0.9rem', color:'#cbd5e1'}}>{pass}</code>
                                <button onClick={() => copyToClipboard(pass)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' }}>COPY</button>
                            </div>
                        ))}
                    </div>
                )}
                useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('pass_history')) || [];
    setHistory(saved);
}, []);

const generate = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPass = "";
    for (let i = 0; i < length; ++i) {
        newPass += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPass);
    
    // Update History
    const newHistory = [newPass, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('pass_history', JSON.stringify(newHistory));
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
};

return (
    <ToolboxLayout title="Password Generator" description="Generate secure passwords and track your history.">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
            <h1>Password Generator</h1>
            
            <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', marginBottom: '30px' }}>
                <div onClick={() => copyToClipboard(password)} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', fontSize: '1.2rem', color: '#38bdf8', wordBreak: 'break-all', marginBottom: '20px', border: '1px solid #334155', cursor: 'pointer' }}>
                    {password}
                </div>
                <small style={{color:'#64748b'}}>Click password to copy</small>

                <div style={{margin:'20px 0'}}>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Length: {length}</label>
                    <input type="range" min="8" max="32" value={length} onChange={(e) => setLength(e.target.value)} style={{ width: '100%' }} />
                </div>

                <button onClick={generate} style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>GENERATE NEW</button>
            </div>

            {history.length > 0 && (
                <div style={{ textAlign: 'left', background: '#1e293b', padding: '20px', borderRadius: '20px' }}>
                    <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Recent Passwords</h4>
                    {history.map((pass, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#0f172a', borderRadius: '8px', marginBottom: '8px' }}>
                            <code style={{fontSize:'0.9rem', color:'#cbd5e1'}}>{pass}</code>
                            <button onClick={() => copyToClipboard(pass)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' }}>COPY</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </ToolboxLayout>
);
            </div>
        </ToolboxLayout>
    );
}
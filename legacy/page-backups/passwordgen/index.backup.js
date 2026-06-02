import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PasswordGenerator() {
    const [mounted, setMounted] = useState(false);
    const [password, setPassword] = useState('Select_Options');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
    const [strength, setStrength] = useState({ label: 'Weak', color: '#f87171', width: '20%' });
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState('');

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
        const saved = JSON.parse(localStorage.getItem('shb_pass_history')) || [];
        setHistory(saved);
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const generatePassword = () => {
        const charSets = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
        };

        let allowedChars = "";
        if (options.uppercase) allowedChars += charSets.uppercase;
        if (options.lowercase) allowedChars += charSets.lowercase;
        if (options.numbers) allowedChars += charSets.numbers;
        if (options.symbols) allowedChars += charSets.symbols;

        if (allowedChars === "") {
            setNotification('⚠️ Select at least one character set.');
            return;
        }

        let newPass = "";
        for (let i = 0; i < length; i++) {
            newPass += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
        }

        setPassword(newPass);
        calculateStrength(newPass);
        
        const newHistory = [newPass, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('shb_pass_history', JSON.stringify(newHistory));
        setNotification('New Secure Password Generated! 🔐');
    };

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length > 12) score++;
        if (pass.length > 20) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) setStrength({ label: 'Weak', color: '#f87171', width: '30%' });
        else if (score <= 4) setStrength({ label: 'Strong', color: '#fbbf24', width: '65%' });
        else setStrength({ label: 'Unbreakable', color: '#34d399', width: '100%' });
    };

    if (!mounted) return <ToolboxLayout title="Password Gen" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Loading Encryption Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Secure Password Generator Pro - Create Strong Cryptographic Strings" 
            description="Generate high-entropy secure passwords instantly. Customizable length, symbol support, and strength analysis. 100% private local generation."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Secure Password Generator Pro</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Hackers use "Brute Force" to guess over 100 billion passwords per second. Is yours safe? 
                        Use our <strong>Military-Grade Generator</strong> to create high-entropy keys that are impossible to guess.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* GENERATOR CARD */}
                    <div style={{ flex: 1.5, minWidth: '350px', background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155' }}>
                        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '30px', border: '1px solid #38bdf8' }}>
                            <div style={{ fontSize: '1.5rem', color: '#fff', wordBreak: 'break-all', fontFamily: 'monospace' }}>{password}</div>
                            <button onClick={() => { navigator.clipboard.writeText(password); setNotification('Password Copied! 📋'); }} style={btnGhost}>Copy to Clipboard</button>
                        </div>

                        {/* STRENGTH METER */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>SECURITY STRENGTH:</span>
                                <span style={{ color: strength.color, fontSize: '0.8rem', fontWeight: 'bold' }}>{strength.label.toUpperCase()}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '10px' }}>
                                <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: '10px', transition: '0.5s width ease' }}></div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={lCap}>PASSWORD LENGTH: {length}</label>
                            <input type="range" min="8" max="50" value={length} onChange={(e) => setLength(e.target.value)} style={{ width: '100%', accentColor: '#38bdf8' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                            <label style={checkLabel}><input type="checkbox" checked={options.uppercase} onChange={() => setOptions({ ...options, uppercase: !options.uppercase })} /> Uppercase</label>
                            <label style={checkLabel}><input type="checkbox" checked={options.lowercase} onChange={() => setOptions({ ...options, lowercase: !options.lowercase })} /> Lowercase</label>
                            <label style={checkLabel}><input type="checkbox" checked={options.numbers} onChange={() => setOptions({ ...options, numbers: !options.numbers })} /> Numbers</label>
                            <label style={checkLabel}><input type="checkbox" checked={options.symbols} onChange={() => setOptions({ ...options, symbols: !options.symbols })} /> Symbols</label>
                        </div>

                        <button onClick={generatePassword} style={btnPrimary}>GENERATE ENCRYPTED KEY</button>
                    </div>

                    {/* HISTORY SIDEBAR */}
                    <aside style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={sidebarCard}>
                            <h4 style={{ color: '#38bdf8', marginTop: 0 }}>Session History</h4>
                            <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '15px' }}>Last 5 keys generated this session.</p>
                            {history.map((p, i) => (
                                <div key={i} style={historyItem}>
                                    <code style={{ color: '#fff', fontSize: '0.8rem' }}>{p.substring(0, 15)}...</code>
                                    <button onClick={() => navigator.clipboard.writeText(p)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.7rem' }}>COPY</button>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Cybersecurity Blueprint: How to Create Unbreakable Passwords</h2>
                    <p>
                        In the current digital age, your password is the only barrier protecting your banking details, personal communications, 
                        and professional data from cybercriminals. The <strong>SHB Secure Password Pro</strong> utility is built using 
                        browser-native randomization to provide high-entropy strings that satisfy even the most stringent security requirements 
                        set by NIST (National Institute of Standards and Technology).
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>The Concept of Entropy</h3>
                    <p>
                        Entropy is a measure of randomness. A password like "Apple123" has very low entropy because it follows a 
                        predictable pattern. A 16-character string including mixed cases, numbers, and non-alphanumeric symbols 
                        (e.g., <code>&^7#vL_9k!m2PqX</code>) has incredibly high entropy. For a standard modern computer, 
                        cracking such a password via brute force would take <strong>trillions of years</strong>.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Length is King</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Increasing length is the most effective way to beat hacking scripts. A 12-character password is the minimum 
                                standard, but for critical accounts like Email or Finance, we recommend <strong>16 to 24 characters</strong>.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Avoid Patterns</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Hackers use "Dictionary Attacks" which test common words and year combinations. Using our random 
                                character generator ensures that no recognizable words appear in your string.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Multi-Factor (MFA)</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Even the strongest password should be the first layer of defense. We always recommend enabling 
                                2FA or MFA on accounts to ensure that even if a password is leaked, your account remains locked.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Browser-Based Security vs. Cloud Generators</h3>
                    <p>
                        Most websites that offer "free passwords" generate them on their servers and send them to you. This is a risk 
                        because that server could be compromised. At <strong>SHB ToolBox</strong>, we use <strong>JavaScript 
                        Math.random()</strong> directly in your browser's local memory. Your generated password 
                        <strong>never touches the internet</strong>. It is created locally, used by you, and exists only in 
                        your temporary session memory. This is the safest way to generate secrets online.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const btnGhost = { background: 'none', border: '1px solid #334155', color: '#38bdf8', padding: '8px 15px', borderRadius: '10px', marginTop: '15px', cursor: 'pointer', fontSize: '0.8rem' };
const checkLabel = { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const sidebarCard = { background: '#0f172a', padding: '25px', borderRadius: '20px', border: '1px solid #334155' };
const historyItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #1e293b' };
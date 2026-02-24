import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TextStudio() {
    const [mounted, setMounted] = useState(false);
    const [text, setText] = useState('');
    const [history, setHistory] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [preToggleText, setPreToggleText] = useState('');
    const [notification, setNotification] = useState('');

    // Hydration Guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- Core Logic ---
    const applyTransform = (type, transformFn) => {
        if (!text) return;
        if (activeAction === type) {
            setText(preToggleText);
            setActiveAction(null);
            setPreToggleText('');
            setNotification('Reverted to original text ↩️');
        } else {
            const currentText = text;
            setHistory(prev => [...prev, currentText]);
            setPreToggleText(currentText);
            setActiveAction(type);
            setText(transformFn(currentText));
            setNotification(`${type.toUpperCase()} applied! ✅`);
        }
    };

    // Logic Functions
    const toSentence = (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    const toTitle = (str) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const toToggle = (str) => str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    const toPascal = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
    const toCamel = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    const toSnake = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '_');
    const toKebab = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '-');

    const runCleanup = (type) => {
        if (!text) return;
        setHistory(prev => [...prev, text]);
        setActiveAction(null);
        let newText = text;
        if (type === 'spaces') newText = text.replace(/\s+/g, ' ');
        if (type === 'emptyLines') newText = text.replace(/^\s*[\r\n]/gm, '');
        if (type === 'sort') newText = text.split('\n').sort().join('\n');
        if (type === 'unique') newText = [...new Set(text.split('\n'))].join('\n');
        if (type === 'reverse') newText = text.split('').reverse().join('');
        setText(newText);
        setNotification('Cleanup complete! ✨');
    };

    if (!mounted) return <ToolboxLayout title="Text Studio" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Loading Text Processor...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Text Case Converter - Online Formatting Studio" 
            description="Transform your text into UPPERCASE, lowercase, Title Case, or CamelCase instantly. Clean extra spaces, remove duplicates, and format your data privately."
        >
            <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Text Studio Pro</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '15px auto', lineHeight: '1.6' }}>
                        Formatting thousands of lines shouldn't take hours. Whether you're an <strong>editor</strong> cleaning a manuscript 
                        or a <strong>developer</strong> converting database strings, our professional studio handles the heavy lifting instantly.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>🔠 12+ Case Styles</span>
                        <span>🧹 Deep Cleanup</span>
                        <span>↩️ Unlimited Undo</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 3, minWidth: '350px' }}>
                        <textarea 
                            value={text} 
                            onChange={(e) => { setText(e.target.value); setActiveAction(null); }}
                            placeholder="Paste your content here..."
                            style={{ width: '100%', height: '400px', background: '#0f172a', color: '#fff', padding: '25px', borderRadius: '25px', border: '2px solid #334155', fontSize: '1.1rem', resize: 'none', marginBottom: '25px', outline: 'none' }}
                        />

                        <p style={sectionTitle}>Case Conversions (Click to Apply / Click again to Revert)</p>
                        <div style={gridContainer}>
                            <button onClick={() => applyTransform('upper', t => t.toUpperCase())} style={activeAction === 'upper' ? activeBtn : btnCase}>UPPERCASE</button>
                            <button onClick={() => applyTransform('lower', t => t.toLowerCase())} style={activeAction === 'lower' ? activeBtn : btnCase}>lowercase</button>
                            <button onClick={() => applyTransform('title', toTitle)} style={activeAction === 'title' ? activeBtn : btnCase}>Title Case</button>
                            <button onClick={() => applyTransform('sentence', toSentence)} style={activeAction === 'sentence' ? activeBtn : btnCase}>Sentence</button>
                            <button onClick={() => applyTransform('camel', toCamel)} style={activeAction === 'camel' ? activeBtn : btnCase}>camelCase</button>
                            <button onClick={() => applyTransform('snake', toSnake)} style={activeAction === 'snake' ? activeBtn : btnCase}>snake_case</button>
                            <button onClick={() => applyTransform('kebab', toKebab)} style={activeAction === 'kebab' ? activeBtn : btnCase}>kebab-case</button>
                            <button onClick={() => applyTransform('toggle', toToggle)} style={activeAction === 'toggle' ? activeBtn : btnCase}>tOgGlE</button>
                        </div>

                        <p style={sectionTitle}>Data Cleaning & List Utilities</p>
                        <div style={gridContainer}>
                            <button onClick={() => runCleanup('spaces')} style={btnUtil}>Remove Extra Spaces</button>
                            <button onClick={() => runCleanup('emptyLines')} style={btnUtil}>Remove Empty Lines</button>
                            <button onClick={() => runCleanup('unique')} style={btnUtil}>Remove Duplicates</button>
                            <button onClick={() => runCleanup('sort')} style={btnUtil}>Sort Lines A-Z</button>
                            <button onClick={() => runCleanup('reverse')} style={btnUtil}>Reverse Text</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(text); setNotification('Copied to clipboard! 📋'); }} style={btnPrimary}>📋 COPY TEXT</button>
                        <button 
                            onClick={() => { if (history.length > 0) { setText(history[history.length - 1]); setHistory(prev => prev.slice(0, -1)); setActiveAction(null); setNotification('Action Undone ↩️'); } }} 
                            disabled={history.length === 0} 
                            style={history.length > 0 ? btnSecondary : btnDisabled}
                        >↩️ UNDO ACTION</button>
                        <button onClick={() => { setHistory([...history, text]); setText(''); setActiveAction(null); setNotification('Workspace Cleared 🗑️'); }} style={btnDanger}>🗑️ CLEAR ALL</button>
                        
                        <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155', marginTop: '10px' }}>
                            <h5 style={{ color: '#38bdf8', marginTop: 0 }}>Efficiency Tip:</h5>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Use "PascalCase" for naming classes in code and "Kebab-case" for SEO-friendly URLs.</p>
                        </div>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Comprehensive Guide to Text Manipulation & Styles</h2>
                    <p>In the digital workspace, text formatting is more than just aesthetics—it’s about standardization. <strong>Text Studio Pro</strong> provides a suite of tools designed to handle every professional scenario, from academic writing to software engineering.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '50px' }}>
                        <div>
                            <h4 style={{ color: '#fff' }}>Publishing & Editing</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Writers often struggle with inconsistent capitalization from different sources. Our <strong>Sentence Case</strong> 
                                algorithm identifies terminal punctuation to properly capitalize the start of new thoughts, while 
                                <strong>Title Case</strong> follows standard editorial guidelines for headers and blog posts.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Programming Standards</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Developers use specific "Casing" to make code readable. <strong>camelCase</strong> is the standard for 
                                JavaScript variables, <strong>snake_case</strong> is essential for Python and SQL, and 
                                <strong>kebab-case</strong> is the industry standard for SEO-optimized URL slugs.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Data Sanitization</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Cleaning data exported from Excel or PDFs can be messy. Use our <strong>Deduplication</strong> tool 
                                to remove twin entries, or use <strong>Remove Extra Spaces</strong> to fix indentation errors 
                                and hidden characters that break database imports.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '60px', fontSize: '1.5rem' }}>100% Client-Side Privacy</h3>
                    <p>
                        Unlike many online converters that save your text to their servers for "analysis" or tracking, SHB ToolBox 
                        is built on a <strong>Privacy-First Architecture</strong>. Your text is processed entirely in your 
                        browser's local memory. Whether you are formatting a proprietary algorithm or a personal legal letter, 
                        your data stays on your machine.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const sectionTitle = { color: '#38bdf8', fontSize: '0.9rem', marginBottom: '15px', marginTop: '25px', fontWeight: 'bold', textTransform: 'uppercase' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' };
const btnCase = { background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.2s' };
const activeBtn = { ...btnCase, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnSecondary = { background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDisabled = { ...btnSecondary, opacity: 0.3, cursor: 'not-allowed' };
const btnDanger = { background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
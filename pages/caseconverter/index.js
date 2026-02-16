import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TextStudio() {
    const [text, setText] = useState('');
    const [history, setHistory] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [preToggleText, setPreToggleText] = useState('');
    const [copyMsg, setCopyMsg] = useState(false);

    // --- In-App Notification Logic ---
    useEffect(() => {
        if (copyMsg) {
            const timer = setTimeout(() => setCopyMsg(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copyMsg]);

    // --- Core Logic ---
    const applyTransform = (type, transformFn) => {
        if (!text) return;

        if (activeAction === type) {
            setText(preToggleText);
            setActiveAction(null);
            setPreToggleText('');
        } else {
            const currentText = text;
            setHistory(prev => [...prev, currentText]);
            setPreToggleText(currentText);
            setActiveAction(type);
            setText(transformFn(currentText));
        }
    };

    // --- Logic Functions ---
    const toSentence = (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    const toTitle = (str) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const toToggle = (str) => str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    const toPascal = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
    const toCamel = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    const toSnake = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '_');
    const toKebab = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '-');
    const toDot = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '.');

    const runCleanup = (type) => {
        if (!text) return;
        setHistory(prev => [...prev, text]);
        setActiveAction(null);
        let newText = text;
        if (type === 'spaces') newText = text.replace(/\s+/g, ' ');
        if (type === 'emptyLines') newText = text.replace(/^\s*[\r\n]/gm, '');
        if (type === 'breaks') newText = text.replace(/\n/g, ' ');
        if (type === 'sort') newText = text.split('\n').sort().join('\n');
        if (type === 'unique') newText = [...new Set(text.split('\n'))].join('\n');
        if (type === 'lineNumbers') newText = text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n');
        if (type === 'reverse') newText = text.split('').reverse().join('');
        setText(newText);
    };

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopyMsg(true);
    };

    const downloadTxt = () => {
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "shb_text_studio_export.txt";
        link.click();
        URL.revokeObjectURL(url);
    };

    const stats = {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length,
        lines: text.trim() ? text.split('\n').length : 0
    };

    return (
        <ToolboxLayout title="Text Studio Pro" description="Advanced case conversion and text cleaning utility.">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* NOTIFICATION TOAST */}
                {copyMsg && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#34d399', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        ✅ Copied to Clipboard!
                    </div>
                )}

                {/* STATS */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#1e293b', padding: '15px 25px', borderRadius: '15px', border: '1px solid #334155' }}>
                    <div style={statBox}>Words: <span style={{color: '#38bdf8'}}>{stats.words}</span></div>
                    <div style={statBox}>Characters: <span style={{color: '#38bdf8'}}>{stats.chars}</span></div>
                    <div style={statBox}>Lines: <span style={{color: '#38bdf8'}}>{stats.lines}</span></div>
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 3, minWidth: '350px' }}>
                        <textarea 
                            value={text} 
                            onChange={(e) => { setText(e.target.value); setActiveAction(null); }}
                            placeholder="Type or paste text here..."
                            style={{ width: '100%', height: '400px', background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '20px', border: '2px solid #334155', fontSize: '1.1rem', resize: 'none', marginBottom: '20px', outline: 'none' }}
                        />

                        <p style={sectionTitle}>Case Transformations (Click again to revert)</p>
                        <div style={gridContainer}>
                            <button onClick={() => applyTransform('upper', t => t.toUpperCase())} style={activeAction === 'upper' ? activeBtn : btnCase}>UPPERCASE</button>
                            <button onClick={() => applyTransform('lower', t => t.toLowerCase())} style={activeAction === 'lower' ? activeBtn : btnCase}>lowercase</button>
                            <button onClick={() => applyTransform('title', toTitle)} style={activeAction === 'title' ? activeBtn : btnCase}>Title Case</button>
                            <button onClick={() => applyTransform('sentence', toSentence)} style={activeAction === 'sentence' ? activeBtn : btnCase}>Sentence case</button>
                            <button onClick={() => applyTransform('toggle', toToggle)} style={activeAction === 'toggle' ? activeBtn : btnCase}>tOgGlE cAsE</button>
                            <button onClick={() => applyTransform('camel', toCamel)} style={activeAction === 'camel' ? activeBtn : btnCase}>camelCase</button>
                            <button onClick={() => applyTransform('pascal', toPascal)} style={activeAction === 'pascal' ? activeBtn : btnCase}>PascalCase</button>
                            <button onClick={() => applyTransform('snake', toSnake)} style={activeAction === 'snake' ? activeBtn : btnCase}>snake_case</button>
                            <button onClick={() => applyTransform('kebab', toKebab)} style={activeAction === 'kebab' ? activeBtn : btnCase}>kebab-case</button>
                            <button onClick={() => applyTransform('dot', toDot)} style={activeAction === 'dot' ? activeBtn : btnCase}>dot.case</button>
                        </div>

                        <p style={sectionTitle}>Professional Cleanup Tools</p>
                        <div style={gridContainer}>
                            <button onClick={() => runCleanup('spaces')} style={btnUtil}>Remove Extra Spaces</button>
                            <button onClick={() => runCleanup('emptyLines')} style={btnUtil}>Remove Empty Lines</button>
                            <button onClick={() => runCleanup('breaks')} style={btnUtil}>Remove Line Breaks</button>
                            <button onClick={() => runCleanup('sort')} style={btnUtil}>Sort Lines A-Z</button>
                            <button onClick={() => runCleanup('unique')} style={btnUtil}>Remove Duplicates</button>
                            <button onClick={() => runCleanup('lineNumbers')} style={btnUtil}>Add Line Numbers</button>
                            <button onClick={() => runCleanup('reverse')} style={btnUtil}>Reverse All Text</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={handleCopy} style={btnPrimary}>📋 Copy to Clipboard</button>
                        <button onClick={() => { if (history.length > 0) { setText(history[history.length - 1]); setHistory(prev => prev.slice(0, -1)); setActiveAction(null); } }} disabled={history.length === 0} style={history.length > 0 ? btnSecondary : btnDisabled}>↩️ Undo Action</button>
                        <button onClick={downloadTxt} style={btnSecondary}>💾 Save as .TXT</button>
                        <button onClick={() => { setHistory([...history, text]); setText(''); setActiveAction(null); }} style={btnDanger}>🗑️ Clear Workspace</button>
                    </div>
                </div>

                {/* --- SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Ultimate Professional Text Manipulation & Transformation Suite</h2>
                    <p>The SHB Text Studio is a high-performance, all-in-one utility designed for content creators, software developers, and data analysts. Whether you are formatting source code or cleaning up a manuscript, our tool provides every essential transformation in a private, browser-based environment.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Advanced Case Conversion & Naming Conventions</h3>
                    <p>Modern workflows require specific text formats. Our engine supports technical conventions like <strong>camelCase</strong>, <strong>snake_case</strong>, and <strong>PascalCase</strong>, alongside standard <strong>Title Case</strong> and <strong>Sentence case</strong> for professional writing.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy-First Architecture Matters</h3>
                    <p>Unlike online text editors that upload your data to a server, SHB ToolBox processes everything <strong>locally in your browser</strong>. Your sensitive documents, passwords, or code snippets never leave your computer, ensuring 100% privacy and intellectual property protection.</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

const statBox = { fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' };
const sectionTitle = { color: '#38bdf8', fontSize: '0.9rem', marginBottom: '15px', marginTop: '20px', fontWeight: 'bold' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' };
const btnCase = { background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.2s' };
const activeBtn = { ...btnCase, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.75rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDisabled = { ...btnSecondary, opacity: 0.3, cursor: 'not-allowed' };
const btnDanger = { background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
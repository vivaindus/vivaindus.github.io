import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function CaseConverter() {
    const [text, setText] = useState('');
    const [history, setHistory] = useState([]);
    const [lastAction, setLastAction] = useState(null);
    const [originalStates, setOriginalStates] = useState({});

    // --- Helper to save history before an action ---
    const recordAction = (actionName) => {
        setHistory(prev => [...prev, text]);
        setLastAction(actionName);
    };

    // --- Core Logic with Toggling ---
    const transform = (type) => {
        // If clicking the SAME button again, revert using originalStates
        if (lastAction === type && originalStates[type] !== undefined) {
            setText(originalStates[type]);
            setLastAction(null);
            return;
        }

        // Save the current state as "Original" before applying this specific type
        const currentText = text;
        setOriginalStates(prev => ({ ...prev, [type]: currentText }));
        recordAction(type);

        let newText = text;
        switch (type) {
            case 'upper': newText = text.toUpperCase(); break;
            case 'lower': newText = text.toLowerCase(); break;
            case 'title': newText = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); break;
            case 'sentence': 
                newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); 
                break;
            case 'toggle': 
                newText = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); 
                break;
            case 'camel': 
                newText = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); 
                break;
            case 'pascal': 
                newText = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/^\w/, c => c.toUpperCase()); 
                break;
            case 'snake': newText = text.toLowerCase().trim().replace(/[\s\W]+/g, '_'); break;
            case 'kebab': newText = text.toLowerCase().trim().replace(/[\s\W]+/g, '-'); break;
            case 'dot': newText = text.toLowerCase().trim().replace(/[\s\W]+/g, '.'); break;
            default: break;
        }
        setText(newText);
    };

    const cleanup = (type) => {
        recordAction(type);
        let newText = text;
        switch (type) {
            case 'spaces': newText = text.replace(/\s+/g, ' '); break;
            case 'trim': newText = text.trim(); break;
            case 'breaks': newText = text.replace(/\n/g, ' '); break;
            case 'emptyLines': newText = text.replace(/^\s*[\r\n]/gm, ''); break;
            case 'quotes': newText = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); break;
            case 'lineNumbers': newText = text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'); break;
            case 'reverse': newText = text.split('').reverse().join(''); break;
            case 'sort': newText = text.split('\n').sort().join('\n'); break;
            case 'unique': newText = [...new Set(text.split('\n'))].join('\n'); break;
            default: break;
        }
        setText(newText);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const previous = history[history.length - 1];
            setText(previous);
            setHistory(prev => prev.slice(0, -1)); // Remove last item from history
            setLastAction(null);
        }
    };

    const downloadTxt = () => {
        const file = new Blob([text], {type: 'text/plain'});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = "shb_text_export.txt";
        link.click();
    };

    // Stats Logic
    const stats = {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length,
        lines: text.trim() ? text.split('\n').length : 0
    };

    return (
        <ToolboxLayout title="Advanced Text Case Studio" description="Convert case, clean data, and format text with professional tools.">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* STATS HEADER */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#1e293b', padding: '15px', borderRadius: '15px', border: '1px solid #334155' }}>
                    <div style={statBox}>Words: <span style={{color: '#38bdf8'}}>{stats.words}</span></div>
                    <div style={statBox}>Characters: <span style={{color: '#38bdf8'}}>{stats.chars}</span></div>
                    <div style={statBox}>Lines: <span style={{color: '#38bdf8'}}>{stats.lines}</span></div>
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* INPUT & TRANSFORMS */}
                    <div style={{ flex: 3, minWidth: '350px' }}>
                        <textarea 
                            value={text} 
                            onChange={(e) => { setText(e.target.value); setLastAction(null); }}
                            placeholder="Type or paste text here..."
                            style={{ width: '100%', height: '350px', background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '20px', border: '2px solid #334155', fontSize: '1.1rem', resize: 'none', marginBottom: '20px', outline: 'none', transition: 'border 0.3s' }}
                        />

                        <h4 style={{color:'#38bdf8', marginBottom:'15px'}}>Case Transformations (Click to apply, click again to revert)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '30px' }}>
                            <button onClick={() => transform('upper')} style={lastAction === 'upper' ? activeBtn : btnCase}>UPPERCASE</button>
                            <button onClick={() => transform('lower')} style={lastAction === 'lower' ? activeBtn : btnCase}>lowercase</button>
                            <button onClick={() => transform('title')} style={lastAction === 'title' ? activeBtn : btnCase}>Title Case</button>
                            <button onClick={() => transform('sentence')} style={lastAction === 'sentence' ? activeBtn : btnCase}>Sentence</button>
                            <button onClick={() => transform('camel')} style={lastAction === 'camel' ? activeBtn : btnCase}>camelCase</button>
                            <button onClick={() => transform('pascal')} style={lastAction === 'pascal' ? activeBtn : btnCase}>PascalCase</button>
                            <button onClick={() => transform('snake')} style={lastAction === 'snake' ? activeBtn : btnCase}>snake_case</button>
                            <button onClick={() => transform('kebab')} style={lastAction === 'kebab' ? activeBtn : btnCase}>kebab-case</button>
                        </div>

                        <h4 style={{color:'#38bdf8', marginBottom:'15px'}}>Content Cleanup & Line Tools</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                            <button onClick={() => cleanup('spaces')} style={btnUtil}>Clean Extra Spaces</button>
                            <button onClick={() => cleanup('emptyLines')} style={btnUtil}>Remove Empty Lines</button>
                            <button onClick={() => cleanup('breaks')} style={btnUtil}>Remove Line Breaks</button>
                            <button onClick={() => cleanup('sort')} style={btnUtil}>Sort A-Z (Lines)</button>
                            <button onClick={() => cleanup('unique')} style={btnUtil}>Remove Duplicates</button>
                            <button onClick={() => cleanup('lineNumbers')} style={btnUtil}>Add Line Numbers</button>
                        </div>
                    </div>

                    {/* ACTION SIDEBAR */}
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => { recordAction('copy'); navigator.clipboard.writeText(text); alert('Copied!'); }} style={btnPrimary}>📋 Copy Text</button>
                        <button onClick={handleUndo} disabled={history.length === 0} style={history.length > 0 ? btnSecondary : btnDisabled}>↩️ Undo Action</button>
                        <button onClick={downloadTxt} style={btnSecondary}>💾 Save as .TXT</button>
                        <button onClick={() => { recordAction('clear'); setText(''); }} style={btnDanger}>🗑️ Clear Workspace</button>
                        
                        <div style={{ marginTop: '20px', background: '#1e293b', padding: '15px', borderRadius: '15px', border: '1px solid #334155' }}>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}><strong>Info:</strong> SHB Text Studio processes all data locally. Your private notes never leave your browser.</p>
                        </div>
                    </div>
                </div>

                {/* --- PROFESSIONAL SEO SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Definitive Tool for Professional Text Manipulation</h2>
                    <p>The SHB Case Studio is an advanced productivity suite designed for writers, software engineers, and digital marketers who require precise control over their text data. Unlike basic converters, our platform combines complex case transformations with heavy-duty data cleaning features.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Integrated Case Logic & Naming Conventions</h3>
                    <p>In modern workflows, case formatting is more than just aesthetics—it is a technical requirement. Our tool supports standard conventions like <strong>CamelCase</strong> and <strong>Snake_Case</strong> for developers, alongside <strong>Title Case</strong> for content creators. The smart toggle feature allows users to switch between formats and revert instantly without losing their original data.</p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Enterprise-Grade Cleanup & List Management</h3>
                    <p>Cleaning messy data is a primary use case for professional editors. SHB Text Studio offers specialized utilities to <strong>remove empty lines</strong>, <strong>sort lines alphabetically</strong>, and <strong>normalize smart quotes</strong>. These tools are indispensable for cleaning up database exports or formatting text copied from inconsistent sources like PDF files.</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLING ---
const statBox = { fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' };
const btnCase = { background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.2s' };
const activeBtn = { ...btnCase, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.75rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDisabled = { ...btnSecondary, opacity: 0.3, cursor: 'not-allowed' };
const btnDanger = { background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
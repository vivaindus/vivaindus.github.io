import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TextStudio() {
    const [text, setText] = useState('');
    const [history, setHistory] = useState([]); // Standard Undo Stack
    const [activeAction, setActiveAction] = useState(null); // Tracks the current toggle
    const [preToggleText, setPreToggleText] = useState(''); // Stores text before the toggle started

    // --- Core Logic ---
    const applyTransform = (type, transformFn) => {
        if (!text) return;

        if (activeAction === type) {
            // TOGGLE OFF: Revert to exactly how it was before this button was pressed
            setText(preToggleText);
            setActiveAction(null);
            setPreToggleText('');
        } else {
            // TOGGLE ON: Save state and apply
            const currentText = text;
            
            // 1. Add current state to Undo History
            setHistory(prev => [...prev, currentText]);
            
            // 2. Set up Toggle data
            setPreToggleText(currentText);
            setActiveAction(type);
            
            // 3. Apply the transformation
            setText(transformFn(currentText));
        }
    };

    // --- Logic Functions ---
    const toSentence = (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    const toTitle = (str) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const toToggle = (str) => str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    const toCamel = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    const toPascal = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
    const toSnake = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '_');
    const toKebab = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '-');
    const toDot = (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '.');

    // --- Cleanup Functions (Direct, no toggle) ---
    const runCleanup = (type) => {
        if (!text) return;
        setHistory(prev => [...prev, text]);
        setActiveAction(null); // Cleanups reset the toggle state

        let newText = text;
        if (type === 'spaces') newText = text.replace(/\s+/g, ' ');
        if (type === 'emptyLines') newText = text.replace(/^\s*[\r\n]/gm, '');
        if (type === 'breaks') newText = text.replace(/\n/g, ' ');
        if (type === 'sort') newText = text.split('\n').sort().join('\n');
        if (type === 'unique') newText = [...new Set(text.split('\n'))].join('\n');
        if (type === 'lineNumbers') newText = text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n');
        setText(newText);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const previous = history[history.length - 1];
            setText(previous);
            setHistory(prev => prev.slice(0, -1));
            setActiveAction(null); // Undo resets toggle state
        }
    };

    const downloadTxt = () => {
        const file = new Blob([text], {type: 'text/plain'});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = "shb_text_export.txt";
        link.click();
    };

    const stats = {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length,
        lines: text.trim() ? text.split('\n').length : 0
    };

    return (
        <ToolboxLayout title="Text Case Studio" description="Advanced text transformation and cleaning tool.">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* HEADER STATS */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#1e293b', padding: '15px 25px', borderRadius: '15px', border: '1px solid #334155' }}>
                    <div style={statBox}>Words: <span style={{color: '#38bdf8'}}>{stats.words}</span></div>
                    <div style={statBox}>Chars: <span style={{color: '#38bdf8'}}>{stats.chars}</span></div>
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

                        {/* CASE BUTTONS */}
                        <p style={sectionTitle}>Case Transformations (Click again to revert)</p>
                        <div style={gridContainer}>
                            <button onClick={() => applyTransform('upper', t => t.toUpperCase())} style={activeAction === 'upper' ? activeBtn : btnCase}>UPPERCASE</button>
                            <button onClick={() => applyTransform('lower', t => t.toLowerCase())} style={activeAction === 'lower' ? activeBtn : btnCase}>lowercase</button>
                            <button onClick={() => applyTransform('title', toTitle)} style={activeAction === 'title' ? activeBtn : btnCase}>Title Case</button>
                            <button onClick={() => applyTransform('sentence', toSentence)} style={activeAction === 'sentence' ? activeBtn : btnCase}>Sentence</button>
                            <button onClick={() => applyTransform('toggle', toToggle)} style={activeAction === 'toggle' ? activeBtn : btnCase}>tOgGlE cAsE</button>
                            <button onClick={() => applyTransform('camel', toCamel)} style={activeAction === 'camel' ? activeBtn : btnCase}>camelCase</button>
                            <button onClick={() => applyTransform('snake', toSnake)} style={activeAction === 'snake' ? activeBtn : btnCase}>snake_case</button>
                            <button onClick={() => applyTransform('kebab', toKebab)} style={activeAction === 'kebab' ? activeBtn : btnCase}>kebab-case</button>
                        </div>

                        {/* CLEANUP BUTTONS */}
                        <p style={sectionTitle}>Cleanup Tools</p>
                        <div style={gridContainer}>
                            <button onClick={() => runCleanup('spaces')} style={btnUtil}>Remove Extra Spaces</button>
                            <button onClick={() => runCleanup('emptyLines')} style={btnUtil}>Remove Empty Lines</button>
                            <button onClick={() => runCleanup('breaks')} style={btnUtil}>Remove Line Breaks</button>
                            <button onClick={() => runCleanup('sort')} style={btnUtil}>Sort A-Z</button>
                            <button onClick={() => runCleanup('unique')} style={btnUtil}>Remove Duplicates</button>
                            <button onClick={() => runCleanup('lineNumbers')} style={btnUtil}>Add Line Numbers</button>
                        </div>
                    </div>

                    {/* UTILITY SIDEBAR */}
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(text); alert('Copied!'); }} style={btnPrimary}>📋 Copy Text</button>
                        <button onClick={handleUndo} disabled={history.length === 0} style={history.length > 0 ? btnSecondary : btnDisabled}>↩️ Undo Action</button>
                        <button onClick={downloadTxt} style={btnSecondary}>💾 Save as .TXT</button>
                        <button onClick={() => { setHistory([...history, text]); setText(''); setActiveAction(null); }} style={btnDanger}>🗑️ Clear Workspace</button>
                        
                        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginTop: '15px' }}>
                            <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' }}>PRO TIPS:</p>
                            <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                <li>Use Snake Case for URL slugs.</li>
                                <li>Undo works for up to 50 steps.</li>
                                <li>Formatting happens in your browser for 100% privacy.</li>
                            </ul>
                        </div>
                    </div>
                </div>
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
const statBox = { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const sectionTitle = { color: '#38bdf8', fontSize: '0.9rem', marginBottom: '15px', marginTop: '20px', fontWeight: 'bold' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' };
const btnCase = { background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.3s' };
const activeBtn = { ...btnCase, background: '#38bdf8', color: '#0f172a', borderColor: '#38bdf8' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.75rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#334155', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDisabled = { ...btnSecondary, opacity: 0.3, cursor: 'not-allowed' };
const btnDanger = { background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
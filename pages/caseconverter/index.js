import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TextStudio() {
    const [text, setText] = useState('');
    const [history, setHistory] = useState(['']); // For basic Undo

    // --- Core Transformations ---
    const transform = (type) => {
        setHistory([...history, text]);
        let newText = text;

        switch (type) {
            case 'upper': newText = text.toUpperCase(); break;
            case 'lower': newText = text.toLowerCase(); break;
            case 'title': newText = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); break;
            case 'sentence': newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break;
            case 'toggle': newText = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); break;
            case 'camel': newText = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); break;
            case 'pascal': newText = text.toLowerCase().replace(new RegExp(/[-_ ]+/, 'g'), ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, ''); break;
            case 'snake': newText = text.toLowerCase().replace(/[\s\W]+/g, '_'); break;
            case 'kebab': newText = text.toLowerCase().replace(/[\s\W]+/g, '-'); break;
            case 'dot': newText = text.toLowerCase().replace(/[\s\W]+/g, '.'); break;
            case 'reverse': newText = text.split('').reverse().join(''); break;
            default: break;
        }
        setText(newText);
    };

    // --- Cleanup Tools ---
    const cleanup = (type) => {
        setHistory([...history, text]);
        let newText = text;
        switch (type) {
            case 'spaces': newText = text.replace(/\s+/g, ' '); break;
            case 'trim': newText = text.trim(); break;
            case 'breaks': newText = text.replace(/\n/g, ' '); break;
            case 'emptyLines': newText = text.replace(/^\s*[\r\n]/gm, ''); break;
            case 'quotes': newText = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); break;
            case 'duplicates': newText = [...new Set(text.split('\n'))].join('\n'); break;
            case 'sortAZ': newText = text.split('\n').sort().join('\n'); break;
            case 'sortZA': newText = text.split('\n').sort().reverse().join('\n'); break;
            case 'lineNumbers': newText = text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'); break;
            default: break;
        }
        setText(newText);
    };

    const downloadTxt = () => {
        const element = document.createElement("a");
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "shb-text-studio.txt";
        document.body.appendChild(element);
        element.click();
    };

    // Stats
    const stats = {
        words: text.split(/\s+/).filter(x => x.length > 0).length,
        chars: text.length,
        lines: text.split('\n').filter(x => x.length > 0).length
    };

    return (
        <ToolboxLayout title="Professional Text Studio" description="Advanced text case converter and cleaning suite.">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOP HEADER: STATS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '15px 25px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <div style={statBox}>Words: <span>{stats.words}</span></div>
                    <div style={statBox}>Characters: <span>{stats.chars}</span></div>
                    <div style={statBox}>Lines: <span>{stats.lines}</span></div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* LEFT PANEL: INPUT & TOOLS */}
                    <div style={{ flex: 3, minWidth: '300px' }}>
                        <textarea 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder="Paste your text here for instant processing..."
                            style={{ width: '100%', height: '350px', background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #38bdf8', fontSize: '1rem', resize: 'none', marginBottom: '20px', outline: 'none' }}
                        />

                        {/* MIDDLE: CASE BUTTONS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '30px' }}>
                            <button onClick={() => transform('upper')} style={btnCase}>UPPERCASE</button>
                            <button onClick={() => transform('lower')} style={btnCase}>lowercase</button>
                            <button onClick={() => transform('title')} style={btnCase}>Title Case</button>
                            <button onClick={() => transform('sentence')} style={btnCase}>Sentence Case</button>
                            <button onClick={() => transform('toggle')} style={btnCase}>tOgGlE cAsE</button>
                            <button onClick={() => transform('camel')} style={btnCase}>camelCase</button>
                            <button onClick={() => transform('pascal')} style={btnCase}>PascalCase</button>
                            <button onClick={() => transform('snake')} style={btnCase}>snake_case</button>
                            <button onClick={() => transform('kebab')} style={btnCase}>kebab-case</button>
                            <button onClick={() => transform('dot')} style={btnCase}>dot.case</button>
                        </div>

                        {/* BOTTOM: ADVANCED & CLEANUP */}
                        <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>Text Cleaning & Advanced Tools</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                            <button onClick={() => cleanup('spaces')} style={btnUtil}>Remove Extra Spaces</button>
                            <button onClick={() => cleanup('emptyLines')} style={btnUtil}>Remove Empty Lines</button>
                            <button onClick={() => cleanup('breaks')} style={btnUtil}>Remove Line Breaks</button>
                            <button onClick={() => cleanup('quotes')} style={btnUtil}>Normalize Quotes</button>
                            <button onClick={() => cleanup('lineNumbers')} style={btnUtil}>Add Line Numbers</button>
                            <button onClick={() => cleanup('duplicates')} style={btnUtil}>Remove Duplicates</button>
                            <button onClick={() => cleanup('sortAZ')} style={btnUtil}>Sort A-Z</button>
                            <button onClick={() => transform('reverse')} style={btnUtil}>Reverse Text</button>
                        </div>
                    </div>

                    {/* RIGHT SIDE PANEL: UTILITIES */}
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={() => navigator.clipboard.writeText(text)} style={btnPrimary}>📋 Copy Text</button>
                        <button onClick={() => setText('')} style={btnDanger}>🗑️ Clear All</button>
                        <button onClick={downloadTxt} style={btnSecondary}>💾 Download .TXT</button>
                        <button onClick={() => setText(history[history.length - 1] || '')} style={btnSecondary}>↩️ Undo</button>
                        
                        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginTop: '10px' }}>
                            <h5 style={{ color: '#38bdf8', marginTop: 0 }}>Pro Tip</h5>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Use "Sentence Case" after pasting text from PDFs to fix weird capitalization automatically.</p>
                        </div>
                    </div>
                </div>

                {/* SEO FOOTER */}
                {/* --- COMPREHENSIVE SEO CONTENT SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Ultimate Professional Text Manipulation & Transformation Suite</h2>
                    <p>
                        The SHB Text Studio is a high-performance, all-in-one utility designed to bridge the gap between content creation and technical data processing. Whether you are a developer formatting code, an editor cleaning up a manuscript, or a data analyst organizing messy lists, our suite provides every essential transformation tool in a single, secure interface.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>Advanced Case Conversion</h3>
                            <p>
                                Move beyond simple uppercase and lowercase. Our engine supports technical naming conventions essential for modern programming and documentation:
                            </p>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li><strong>camelCase & PascalCase:</strong> Instantly format variables for JavaScript, Java, and C# development.</li>
                                <li><strong>snake_case & kebab-case:</strong> Perfect for Python programming, CSS class naming, and SEO-friendly URL slug generation.</li>
                                <li><strong>Sentence & Title Case:</strong> Automatically correct capitalization for blog posts, headers, and academic papers using intelligent grammar logic.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>Smart Text Sanitization</h3>
                            <p>
                                Cleaning "dirty" data from PDFs, emails, or old databases can take hours. Our cleanup tools do it in one click:
                            </p>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li><strong>Whitespace Management:</strong> Remove leading/trailing spaces or collapse multiple spaces into one.</li>
                                <li><strong>Line Optimization:</strong> Strip empty lines, remove line breaks to create single-line strings, or add line numbers for easy referencing.</li>
                                <li><strong>Quote Normalization:</strong> Convert "Smart Quotes" from word processors into straight quotes for code compatibility.</li>
                            </ul>
                        </div>
                    </div>

                    {/* --- COMPREHENSIVE SEO CONTENT SECTION --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>The Ultimate Professional Text Manipulation & Transformation Suite</h2>
                    <p>
                        The SHB Text Studio is a high-performance, all-in-one utility designed to bridge the gap between content creation and technical data processing. Whether you are a developer formatting code, an editor cleaning up a manuscript, or a data analyst organizing messy lists, our suite provides every essential transformation tool in a single, secure interface.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>Advanced Case Conversion</h3>
                            <p>
                                Move beyond simple uppercase and lowercase. Our engine supports technical naming conventions essential for modern programming and documentation:
                            </p>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li><strong>camelCase & PascalCase:</strong> Instantly format variables for JavaScript, Java, and C# development.</li>
                                <li><strong>snake_case & kebab-case:</strong> Perfect for Python programming, CSS class naming, and SEO-friendly URL slug generation.</li>
                                <li><strong>Sentence & Title Case:</strong> Automatically correct capitalization for blog posts, headers, and academic papers using intelligent grammar logic.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>Smart Text Sanitization</h3>
                            <p>
                                Cleaning "dirty" data from PDFs, emails, or old databases can take hours. Our cleanup tools do it in one click:
                            </p>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li><strong>Whitespace Management:</strong> Remove leading/trailing spaces or collapse multiple spaces into one.</li>
                                <li><strong>Line Optimization:</strong> Strip empty lines, remove line breaks to create single-line strings, or add line numbers for easy referencing.</li>
                                <li><strong>Quote Normalization:</strong> Convert "Smart Quotes" from word processors into straight quotes for code compatibility.</li>
                            </ul>
                        </div>
                    </div>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Data Organization & List Management</h3>
                    <p>
                        Text Studio includes powerful list-handling features. You can <strong>Sort Lines A-Z</strong> or Z-A instantly, which is vital for organizing CSV data or alphabetical lists. The <strong>Remove Duplicate Lines</strong> feature is a favorite for database administrators and marketers who need to clean up mailing lists or unique ID sets without using complex Excel formulas.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Real-Time Analysis and Export</h3>
                    <p>
                        Stay informed with our live stats header, tracking your word count, character count, and line count as you type. Once your text is perfectly formatted, use our <strong>Direct .TXT Download</strong> feature to save your work as a physical file, or use the 1-click clipboard utility to move your data back into your workflow.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Why Privacy-First Processing Matters</h3>
                    <p>
                        In the age of AI and cloud storage, your text data is often harvested for training or tracking. At SHB ToolBox, we use <strong>Client-Side JavaScript Logic</strong>. This means your text never leaves your computer. Whether you are formatting a sensitive legal document or a proprietary block of code, the transformation happens 100% locally. Your privacy is not just a feature; it is our architecture.
                    </p>
                </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// --- STYLES ---
const statBox = { color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem' };
const btnCase = { background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const btnUtil = { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#334155', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnDanger = { background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function WordCounter() {
    const [mounted, setMounted] = useState(false);
    const [text, setText] = useState('');
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

    // Analysis Logic
    const stats = {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length,
        charsNoSpace: text.replace(/\s+/g, '').length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphs: text.split(/\n+/).filter(p => p.trim().length > 0).length,
        readingTime: Math.ceil(text.trim().split(/\s+/).filter(x => x).length / 200) // 200 wpm average
    };

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setNotification('Text copied to clipboard! 📋');
    };

    if (!mounted) return <ToolboxLayout title="Word Counter" description="Loading Analyzer..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Booting Linguistic Engine...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Word Counter - Detailed Text & Sentence Analysis" 
            description="Count words, characters, sentences, and estimated reading time. Learn about character limits for SEO, Social Media, and Academic writing with our private tool."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Word Counter & Text Analyzer</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Writing for SEO, Social Media, or University? Precision matters. Our <strong>Advanced Analysis Suite</strong> 
                        provides instant structural metrics to ensure your content hits every technical benchmark.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>⏱️ Reading Time</span>
                        <span>📑 Paragraph Stats</span>
                        <span>🔒 100% Private</span>
                    </div>
                </div>

                {/* --- APP AREA --- */}
                <div style={{ background: '#1e293b', padding: '35px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    <textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your content here for real-time analysis..."
                        style={{ width: '100%', height: '350px', background: '#0f172a', border: '2px solid #334155', color: '#fff', padding: '25px', borderRadius: '20px', fontSize: '1.1rem', outline: 'none', resize: 'none', marginBottom: '30px', transition: 'border-color 0.3s' }}
                    />

                    {/* LIVE STATS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <div style={statCard}>
                            <span style={statLabel}>WORDS</span>
                            <div style={statValue}>{stats.words}</div>
                        </div>
                        <div style={statCard}>
                            <span style={statLabel}>CHARACTERS</span>
                            <div style={statValue}>{stats.chars}</div>
                        </div>
                        <div style={statCard}>
                            <span style={statLabel}>SENTENCES</span>
                            <div style={statValue}>{stats.sentences}</div>
                        </div>
                        <div style={statCard}>
                            <span style={statLabel}>READ TIME</span>
                            <div style={{...statValue, color: '#34d399'}}>{stats.readingTime}m</div>
                        </div>
                        <div style={statCard}>
                            <span style={statLabel}>PARAGRAPHS</span>
                            <div style={statValue}>{stats.paragraphs}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button onClick={handleCopy} style={btnPrimary}>📋 COPY CLEAN TEXT</button>
                        <button onClick={() => { setText(''); setNotification('Workspace Cleared! 🗑️'); }} style={btnSecondary}>🗑️ CLEAR ALL</button>
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>Text Analysis 101: Why Word & Character Counts Rule the Web</h2>
                    <p>
                        In the modern digital landscape, content is subject to strict constraints. Whether it's the 
                        <strong> Character Limits</strong> of a social media platform or the <strong>Word Count</strong> requirements 
                        of an academic paper, understanding the structure of your writing is essential for effective communication. 
                        The <strong>SHB Word Counter</strong> goes beyond basic counting to provide a comprehensive structural breakdown.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Essential Digital Constraints</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '30px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. SEO & Search Engines</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Google Search results display specific lengths. To prevent your titles from being cut off (truncated), 
                                your <strong>Meta Title</strong> should be under 60 characters, and your <strong>Meta Description</strong> 
                                should stay around 155-160 characters. Using our real-time character counter ensures your SEO remains perfect.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Social Media Authority</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Every platform has its "Sweet Spot." X (Twitter) enforces a hard limit of 280 characters. LinkedIn 
                                posts perform best when the first "hook" is under 140 characters. Instagram captions are often 
                                truncated after 125 characters. Plan your social strategy with millimetric precision.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>The Psychology of Reading Time</h3>
                    <p>
                        User attention spans are shrinking. Research indicates that the average human reads at a speed of 
                        <strong> 200 to 250 words per minute (WPM)</strong>. Our analyzer automatically calculates the 
                        Estimated Reading Time (ERT), allowing bloggers and email marketers to inform their readers of the 
                        time commitment required before they start reading. An ERT of 3-5 minutes is the "Goldilocks Zone" 
                        for maximum engagement.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Academic and Professional Standards</h3>
                    <p>
                        Most academic essays and professional reports demand strict word count adherence (e.g., a 2,000-word limit). 
                        Our tool identifies <strong>Paragraph breaks and Sentence structures</strong>, helping you improve the 
                        readability of your work. Shorter sentences generally improve clarity, especially in technical 
                        documentation and legal writing.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>100% Private Text Processing</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we respect your intellectual property. Unlike cloud-based counters 
                        that save your drafts to their servers, our Word Counter runs <strong>entirely in your browser</strong>. 
                        Your text is processed in your device's local memory and is never uploaded to the internet. 
                        Write your most sensitive drafts with absolute peace of mind.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const statCard = { background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid #334155', textAlign: 'center' };
const statLabel = { fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px' };
const statValue = { fontSize: '1.8rem', color: '#fff', fontWeight: '900' };
const btnPrimary = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnSecondary = { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
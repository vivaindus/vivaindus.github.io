import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function WordCounter() {
    const [text, setText] = useState('');

    const wordCount = text.split(/\s+/).filter(item => item !== "").length;
    const charCount = text.length;
    const sentenceCount = text.split(/[.!?]+/).filter(item => item !== "").length;
    const readingTime = Math.ceil(wordCount / 200); // Avg 200 words per minute

    return (
        <ToolboxLayout title="Word Counter" description="Count words, characters, and sentences in real-time.">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#38bdf8' }}>Word Counter</h1>
                
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <textarea 
                        placeholder="Paste your text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ width: '100%', height: '250px', background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #334155', fontSize: '1.1rem', resize: 'none', marginBottom: '20px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div style={{ padding: '15px', background: '#0f172a', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' }}>{wordCount}</div>
                            <small style={{ color: '#94a3b8' }}>WORDS</small>
                        </div>
                        <div style={{ padding: '15px', background: '#0f172a', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' }}>{charCount}</div>
                            <small style={{ color: '#94a3b8' }}>CHARACTERS</small>
                        </div>
                        <div style={{ padding: '15px', background: '#0f172a', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' }}>{sentenceCount}</div>
                            <small style={{ color: '#94a3b8' }}>SENTENCES</small>
                        </div>
                        <div style={{ padding: '15px', background: '#38bdf8', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{readingTime}m</div>
                            <small style={{ fontWeight: 'bold' }}>READ TIME</small>
                        </div>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
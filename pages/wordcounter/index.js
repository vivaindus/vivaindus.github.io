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
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Content Analysis & Word Counter</h2>
                    <p>
                        The SHB Word Counter is an essential utility for writers, students, and SEO professionals. 
                        In digital publishing, meeting specific length requirements is crucial—whether you are 
                        writing a university essay, a meta-description for a website, or a social media post. 
                        Our tool provides a real-time, comprehensive breakdown of your text's structure.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Advanced Metrics for Better Writing</h3>
                    <p>
                        Go beyond basic counting with our four-point analysis system:
                    </p>
                    <ul>
                        <li><strong>Precise Word Count:</strong> Perfect for tracking progress against academic assignments or freelance writing word-counts.</li>
                        <li><strong>Character Tracking:</strong> Crucial for social media managers working within strict limits for platforms like X (Twitter), LinkedIn, and Instagram.</li>
                        <li><strong>Sentence Analysis:</strong> Helps you understand the complexity and readability of your content by tracking how many sentences you’ve structured.</li>
                        <li><strong>Estimated Reading Time:</strong> Based on the standard human reading speed of 200 words per minute, this metric helps bloggers and email marketers estimate how long it will take their audience to consume their content.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Designed for SEO & Digital Marketing</h3>
                    <p>
                        Search engine algorithms often favor content that falls within specific length ranges. Use the SHB 
                        Word Counter to ensure your blog intros are concise and your long-form articles hit the necessary 
                        benchmarks for high ranking. The real-time update logic allows you to edit and trim your 
                        paragraphs while watching the numbers adjust instantly.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy & Intellectual Property</h3>
                    <p>
                        Your writing is your property. Unlike many online word counters that save your text to their 
                        database for "analysis," the SHB ToolBox operates entirely on a <strong>Privacy-First</strong> 
                        model. Your text is never sent to our servers, never stored in Supabase, and never seen 
                        by anyone but you. All counting logic happens directly inside your browser.
                    </p>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}
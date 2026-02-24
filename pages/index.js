import React, { useState } from 'react';
import ToolboxLayout, { toolGroups } from '../components/ToolboxLayout';

export default function Home() {
    const [expandedTool, setExpandedTool] = useState(null);

    return (
        <ToolboxLayout title="Free Online Utilities" description="Access SHB ToolBox - 20 professional-grade utilities grouped for efficiency.">
            
            {/* HERO SECTION */}
            <div style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '100px 20px', textAlign: 'center', borderBottom: '1px solid #334155' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>One Hub. <span style={{color:'#38bdf8'}}>20+ Powerful Tools.</span></h1>
                <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>Professional, private, and 100% free web utilities for modern digital workflows.</p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                
                {Object.keys(toolGroups).map(groupKey => (
                    <section key={groupKey} style={{ marginBottom: '80px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <span style={{ fontSize: '2rem' }}>{toolGroups[groupKey].icon}</span>
                            <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>{toolGroups[groupKey].label}</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {toolGroups[groupKey].tools.map(tool => (
                                <div 
                                    key={tool.href} 
                                    style={{ 
                                        background: '#1e293b', 
                                        borderRadius: '20px', 
                                        padding: '25px', 
                                        border: '1px solid #334155',
                                        transition: '0.3s transform',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>{tool.name}</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>{tool.desc}</p>
                                    
                                    {expandedTool === tool.name ? (
                                        <div style={{ animation: 'fadeIn 0.3s', paddingBottom: '60px' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                                                Our {tool.name} is optimized for high performance and strict privacy. 
                                                All calculations and processing occur on your device. 
                                                Ideal for professional use in high-regulatory environments.
                                            </p>
                                            <button onClick={() => setExpandedTool(null)} style={btnLink}>Show Less</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setExpandedTool(tool.name)} style={btnLink}>Learn More...</button>
                                    )}

                                    <a href={tool.href} style={btnOpen}>OPEN TOOL</a>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* BOTTOM AUTHORITY TEXT */}
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '50px', borderRadius: '30px', border: '1px solid #38bdf8', marginTop: '40px', color:'#94a3b8', lineHeight:'1.8' }}>
                    <h2 style={{color:'#fff', marginBottom:'20px'}}>Why Industry Professionals Choose SHB ToolBox</h2>
                    <p>Building a digital workflow requires tools that are not only accurate but also respect data privacy. SHB ToolBox is engineered to handle sensitive tasks—from UAE Tax Invoices to Military-Grade Passwords—without ever uploading your data to a cloud server. Our centralized hub provides every utility a developer, student, or business owner needs in one clean, Ad-optimized interface.</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Inline Styles
const btnLink = { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px' };
const btnOpen = { position: 'absolute', bottom: '20px', right: '20px', background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' };
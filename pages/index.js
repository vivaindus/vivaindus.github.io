import React from 'react';
import ToolboxLayout from '../components/ToolboxLayout';

const tools = [
    { title: 'Tax Invoice Pro', desc: 'Compliant UAE VAT invoice generator.', link: '/invoicegenerator', icon: '📄' },
    { title: 'Image Compressor', desc: 'Reduce file size without quality loss.', link: '/imagecompressor', icon: '🗜️' },
    { title: 'Image Resizer', desc: 'Social media presets and custom sizing.', link: '/imageresizer', icon: '🖼️' },
    { title: 'Case Converter', desc: 'Advanced text cleaning and case suite.', link: '/caseconverter', icon: '🔡' },
    { title: 'Bulk QR Studio', desc: 'Generate multiple QR codes as ZIP.', link: '/qrcode', icon: '📱' },
    { title: 'PDF to Image', desc: 'HD extraction of PDF pages to PNG/JPG.', link: '/pdftoimage', icon: '📑' },
    { title: 'Image to PDF', desc: 'Combine multiple images into one PDF.', link: '/imagetopdf', icon: '📦' },
    { title: 'Favicon Gen', desc: 'Create full website icon sets in seconds.', link: '/favicongen', icon: '⭐' },
    { title: 'EMI Calculator', desc: 'Home and personal loan payment planner.', link: '/emicalculator', icon: '💰' },
    { title: 'SIP Calculator', desc: 'Investment and wealth gain visualizer.', link: '/sipcalculator', icon: '📈' },
    { title: 'Thumbnail Grab', desc: 'Extract HD images from any YT link.', link: '/thumbnaildownloader', icon: '🎥' },
    { title: 'CPS Test', desc: 'Clicks per second speed counter.', link: '/cpstest', icon: '🖱️' },
    { title: 'BMI Calculator', desc: 'Health and body mass index tracker.', link: '/bmicalculator', icon: '⚖️' },
    { title: 'Age Calculator', desc: 'Precise chronological age counting.', link: '/agecalculator', icon: '📅' },
    { title: 'Reaction Test', desc: 'Measure neurological reflex speed.', link: '/reactiontest', icon: '⚡' },
    { title: 'Unit Converter', desc: 'Metric and imperial conversion suite.', link: '/unitconverter', icon: '🔄' },
    { title: 'Password Gen', desc: 'Secure, encrypted string generation.', link: '/passwordgen', icon: '🔐' },
    { title: 'Word Counter', desc: 'Real-time text analysis and reading time.', link: '/wordcounter', icon: '📝' },
    { title: 'Percentage Suite', desc: 'Fast calculations for business discounts.', link: '/percentagecalculator', icon: '📊' },
    { title: 'Task Manager', desc: 'Organize chores with local storage save.', link: '/tasklist', icon: '✅' },
];

export default function Home() {
    return (
        <ToolboxLayout 
            title="Free Online Utilities" 
            description="Access the professional SHB ToolBox - 10 free utilities including QR Generator, BMI Calculator, and more."
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3rem', color: '#38bdf8', marginBottom: '10px' }}>SHB ToolBox</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Professional, fast, and free utility tools for everyone.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                    {tools.map((tool) => (
                        <a key={tool.link} href={tool.link} style={{ textDecoration: 'none' }}>
                            <div style={{ 
                                background: '#1e293b', 
                                padding: '30px', 
                                borderRadius: '20px', 
                                border: '1px solid #334155',
                                transition: 'transform 0.2s',
                                height: '100%'
                            }}>
                                <span style={{ fontSize: '2rem' }}>{tool.icon}</span>
                                <h3 style={{ color: '#38bdf8', marginTop: '15px' }}>{tool.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{tool.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>

                <section style={{ marginTop: '80px', borderTop: '1px solid #1e293b', paddingTop: '40px', color: '#94a3b8' }}>
                    <h2>Why use SHB ToolBox?</h2>
                    <p>Our tools are designed for speed and privacy. We use client-side processing to ensure that your sensitive data (like passwords and task lists) remains private whenever possible. With no forced registration and a clean interface, SHB ToolBox is the best hub for daily digital tasks.</p>
                </section>
            </div>
        </ToolboxLayout>
    );
}
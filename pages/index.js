import React from 'react';
import ToolboxLayout from '../components/ToolboxLayout';

const tools = [
    { title: 'Bulk QR Studio', desc: 'Generate multiple QR codes at once with ZIP export.', link: '/qrcode', icon: '📱' },
    { title: 'CPS Test', desc: 'Measure your mouse clicking speed in seconds.', link: '/cpstest', icon: '🖱️' },
    { title: 'BMI Calculator', desc: 'Calculate Body Mass Index for health tracking.', link: '/bmicalculator', icon: '⚖️' },
    { title: 'Age Calculator', desc: 'Find your exact age in years, months, and days.', link: '/agecalculator', icon: '📅' },
    { title: 'Reaction Test', desc: 'Test your reflexes and visual response time.', link: '/reactiontest', icon: '⚡' },
    { title: 'Unit Converter', desc: 'Convert length, weight, and volume instantly.', link: '/unitconverter', icon: '🔄' },
    { title: 'Password Generator', desc: 'Create secure, encrypted passwords for your accounts.', link: '/passwordgen', icon: '🔐' },
    { title: 'Word Counter', desc: 'Count characters and words for writing tasks.', link: '/wordcounter', icon: '📝' },
    { title: 'Percentage Calc', desc: 'Fast calculations for discounts and markups.', link: '/percentagecalculator', icon: '📊' },
    { title: 'Task List Pro', desc: 'Organize your daily chores with a simple database list.', link: '/tasklist', icon: '✅' },
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
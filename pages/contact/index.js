import React from 'react';
import Head from 'next/head';

export default function Contact() {
    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>Contact Us | SHB ToolBox</title>
            </Head>

            <nav style={{ background: '#1e293b', padding: '15px 20px', borderBottom: '1px solid #334155' }}>
                <a href="/cpstest" style={{ fontWeight: 'bold', color: '#38bdf8', textDecoration: 'none' }}>SHB ToolBox</a>
            </nav>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Get in Touch</h1>
                <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Have a question about our tools or products? We are here to help.</p>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', marginBottom: '20px' }}>
                    <h3 style={{ color: '#38bdf8' }}>WhatsApp Support</h3>
                    <p>For immediate assistance with apps:</p>
                    <a href="https://wa.me/971543768200" target="_blank" style={{ display: 'inline-block', marginTop: '10px', background: '#25D366', color: '#fff', padding: '12px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
                        Chat on WhatsApp
                    </a>
                </div>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <h3 style={{ color: '#38bdf8' }}>Email Address</h3>
                    <p>For inquiries:</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>support@shbstores.com</p>
                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                <a href="/cpstest" style={{ color: '#fff', margin: '0 10px' }}>Home</a>
                <a href="/privacy" style={{ color: '#fff', margin: '0 10px' }}>Privacy Policy</a>
            </footer>
        </div>
    );
}
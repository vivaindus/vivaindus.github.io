import React from 'react';
import Head from 'next/head';

export default function PrivacyPolicy() {
    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>Privacy Policy | SHB ToolBox</title>
            </Head>

            <nav style={{ background: '#1e293b', padding: '15px 20px', borderBottom: '1px solid #334155' }}>
                <a href="/cpstest" style={{ fontWeight: 'bold', color: '#38bdf8', textDecoration: 'none' }}>SHB ToolBox</a>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', lineHeight: '1.8' }}>
                <h1 style={{ color: '#38bdf8' }}>Privacy Policy</h1>
                <p>Last updated: February 2024</p>
                
                <h3 style={{ marginTop: '30px', color: '#38bdf8' }}>1. Information We Collect</h3>
                <p>We do not require user accounts. However, we use <strong>Google Analytics</strong> to monitor traffic. This tool collects data such as your IP address, browser type, and pages visited to help us improve user experience.</p>

                <h3 style={{ marginTop: '30px', color: '#38bdf8' }}>2. Cookies</h3>
                <p>We use cookies to understand site usage. You can choose to disable cookies through your individual browser options.</p>

                <h3 style={{ marginTop: '30px', color: '#38bdf8' }}>3. Data for Tools</h3>
                <p>Data entered into our <strong>BMI Calculator</strong> or <strong>CPS Test</strong> is processed locally in your browser and is not stored on our servers.</p>

                <h3 style={{ marginTop: '30px', color: '#38bdf8' }}>4. External Links</h3>
                <p>Our site contains links to other websites (like WhatsApp). We are not responsible for the privacy practices of such other sites.</p>

                <h3 style={{ marginTop: '30px', color: '#38bdf8' }}>5. Contact Us</h3>
                <p>If you have questions about this policy, contact us at <strong>support@shbstores.com</strong>.</p>
            </div>
            
            <footer style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                <a href="/cpstest" style={{ color: '#fff', margin: '0 10px' }}>Home</a>
                <a href="/contact" style={{ color: '#fff', margin: '0 10px' }}>Contact</a>
            </footer>
        </div>
    );
}
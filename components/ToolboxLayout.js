import React from 'react';
import Head from 'next/head';
import Link from 'next/link'; // IMPORT LINK COMPONENT

// --- NAV LINKS ---
const navLinks = [
    { name: 'CPS TEST', href: '/cpstest' },
    { name: 'BMI CALC', href: '/bmicalculator' },
    { name: 'AGE CALC', href: '/agecalculator' },
    { name: 'REACTION', href: '/reactiontest' },
    { name: 'UNIT CONV', href: '/unitconverter' },
    { name: 'PASSWORD', href: '/passwordgen' },
    { name: 'WORD COUNT', href: '/wordcounter' },
    { name: 'QR GEN', href: '/qrcode' },
    { name: 'PERCENTAGE', href: '/percentagecalculator' },
    { name: 'TASK LIST', href: '/tasklist' },
];

export default function ToolboxLayout({ children, title, description }) {
    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>{title} | SHB ToolBox</title>
                <meta name="description" content={description} />
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8152928186282906"
     crossorigin="anonymous"></script>
            </Head>

            {/* SHARED NAVIGATION */}
            <nav style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 100 }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8', marginRight: '20px', whiteSpace: 'nowrap' }}>SHB ToolBox</span>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {link.name}
                        </Link>
                    ))}
                </div>
            </nav>

            <main style={{ minHeight: '80vh' }}>
                {children}
            </main>

            {/* SHARED FOOTER */}
            <footer style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.8rem', borderTop: '1px solid #1e293b', marginTop: '40px' }}>
                <div style={{ marginBottom: '15px' }}>
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} style={{ color: '#94a3b8', textDecoration: 'none', margin: '0 10px' }}>{link.name}</Link>
                    ))}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <Link href="/about" style={{ color: '#38bdf8', textDecoration: 'none', margin: '0 10px' }}>About Us</Link>
                    <Link href="/privacy" style={{ color: '#38bdf8', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</Link>
                    <Link href="/contact" style={{ color: '#38bdf8', textDecoration: 'none', margin: '0 10px' }}>Contact Us</Link>
                </div>
                &copy; 2024 SHB ToolBox - Professional Utility Hub
            </footer>
        </div>
    );
}
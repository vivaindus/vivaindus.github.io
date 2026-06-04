import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// --- THE TOOL ENGINE ---
export const toolGroups = {
    business: {
        label: 'Finance & Business',
        icon: '💼',
        tools: [
            { name: 'Tax Invoice Pro', href: '/invoicegenerator', desc: 'UAE FTA Compliant billing.' },
            { name: 'EMI Calculator', href: '/emicalculator', desc: 'Loan and debt planner.' },
            { name: 'SIP Calculator', href: '/sipcalculator', desc: 'Wealth & compounding tool.' },
            { name: 'Percentage Suite', href: '/percentagecalculator', desc: 'Commercial math utilities.' },
            { name: 'Task Manager', href: '/tasklist', desc: 'Productivity & list export.' },
        ]
    },
    images: {
        label: 'Image & Design',
        icon: '🎨',
        tools: [
            { name: 'Image Compressor', href: '/imagecompressor', desc: 'Reduce size, keep quality.' },
            { name: 'Image Resizer', desc: 'Social media pixel control.', href: '/imageresizer' },
            { name: 'PDF to Image', desc: 'HD extraction of PDF pages.', href: '/pdftoimage' },
            { name: 'Image to PDF', desc: 'Convert photos to documents.', href: '/imagetopdf' },
            { name: 'PDF Merger', desc: 'Combine multiple PDFs.', href: '/pdfmerge' },
            { name: 'PDF Splitter', desc: 'Extract PDF pages.', href: '/pdfsplit' },
            { name: 'PDF Compressor', desc: 'Reduce PDF file size.', href: '/pdfcompressor' },
            { name: 'PDF Editor', desc: 'Annotate, sign and edit PDFs.', href: '/pdfeditor' },
            { name: 'Signature Maker', desc: 'Draw or type signatures.', href: '/signaturemaker' },
            { name: 'Passport Photo Maker', desc: 'Create visa and ID photos.', href: '/passportphoto' },
            { name: 'Favicon Gen', desc: 'Web & App icon package.', href: '/favicongen' },
            { name: 'YT Thumbnails', desc: 'Extract 4K video covers.', href: '/thumbnaildownloader' },
            { name: 'Bulk QR Studio', desc: 'Generate QR codes in ZIP.', href: '/qrcode' },
            { name: 'Barcode Generator', desc: 'Create, download and print barcode labels.', href: '/barcodegenerator' },
        ]
    },
    text: {
        label: 'Text & Content',
        icon: '🔡',
        tools: [
            { name: 'Case Studio', href: '/caseconverter', desc: 'Professional text processing.' },
            { name: 'Word Counter', href: '/wordcounter', desc: 'Deep linguistic analysis.' },
            { name: 'Password Pro', href: '/passwordgen', desc: 'Encrypted key generation.' },
            { name: 'Unit Converter', href: '/unitconverter', desc: 'Global technical conversion.' },
            { name: 'CSV to Excel', href: '/csvtoexcel', desc: 'Convert CSV files to XLSX.' },
            { name: 'CSV to JSON', href: '/csvtojson', desc: 'Convert CSV data to JSON.' },
            { name: 'Text Diff Checker', href: '/textdiff', desc: 'Compare text differences.' },
            { name: 'Regex Tester', href: '/regextester', desc: 'Test regular expressions.' },
            { name: 'JSON Formatter', href: '/jsonformatter', desc: 'Format and validate JSON.' },
            { name: 'XML Formatter', href: '/xmlformatter', desc: 'Format and validate XML.' },
            { name: 'Base64 Tool', href: '/base64', desc: 'Encode and decode Base64.' },
            { name: 'URL Encoder', href: '/urlencoder', desc: 'Encode and decode URLs.' },
            { name: 'JWT Decoder', href: '/jwtdecoder', desc: 'Decode JSON Web Tokens.' },
            { name: 'UUID Generator', href: '/uuidgenerator', desc: 'Generate UUIDs and GUIDs.' },
            { name: 'Code Formatter', href: '/codeformatter', desc: 'Format SQL, JSON and scripts.' },
            { name: 'Excel Formula', href: '/excelformula', desc: 'Format and explain formulas.' },
        ]
    },
    health: {
        label: 'Speed & Health',
        icon: '⚡',
        tools: [
            { name: 'CPS Test', href: '/cpstest', desc: 'Clicks per second trainer.' },
            { name: 'Reaction Test', href: '/reactiontest', desc: 'Neurological speed check.' },
            { name: 'BMI Calculator', href: '/bmicalculator', desc: 'Clinical body mass index.' },
            { name: 'Age Calculator', href: '/agecalculator', desc: 'Precise chronology engine.' },
        ]
    }
};

export default function ToolboxLayout({ children, title, description }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    let cleanPath = router.asPath.split('?')[0].split('#')[0];

    if (cleanPath !== '/' && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }

    const canonicalUrl = cleanPath === '/'
        ? 'https://www.shbstores.com/'
        : `https://www.shbstores.com${cleanPath}`;

    const pageTitle = title ? `${title} | SHB ToolBox` : 'SHB ToolBox';
    const pageDescription = description || 'Free browser-based tools for business, PDF, images, text, finance, productivity, and everyday calculations.';

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={canonicalUrl} />
                {/* AdSense will be injected here via _document.js or _app.js as we fixed before */}
            </Head>

            {/* --- REFRENS-STYLE TABBED NAVBAR --- */}
            <nav style={navBar}>
                <div style={navContainer}>
                    <Link href="/" style={logoS}>SHB<span style={{color:'#38bdf8'}}>ToolBox</span></Link>
                    
                    <div style={desktopMenu}>
                        <Link href="/invoicegenerator" style={tabItem}>Invoice</Link>
                        <Link href="/imagecompressor" style={tabItem}>Compress</Link>
                        <Link href="/caseconverter" style={tabItem}>Text</Link>
                        
                        <div style={dropdownWrapper} onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
                            <button style={dropdownBtn}>More Tools <span style={{fontSize:'0.7rem'}}>▼</span></button>
                            
                            {isMenuOpen && (
                                <div style={megaMenu}>
                                    {Object.keys(toolGroups).map(key => (
                                        <div key={key} style={menuColumn}>
                                            <h4 style={columnTitle}>{toolGroups[key].icon} {toolGroups[key].label}</h4>
                                            {toolGroups[key].tools.map(tool => (
                                                <Link key={tool.href} href={tool.href} style={menuLink}>{tool.name}</Link>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
                {children}
            </main>

            {/* --- SHARED FOOTER --- */}
            <footer style={footerS}>
                <div style={{ marginBottom: '20px', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'15px' }}>
                    <Link href="/about" style={fLink}>About Us</Link>
                    <Link href="/privacy" style={fLink}>Privacy Policy</Link>
                    <Link href="/terms" style={fLink}>Terms of Use</Link>
                    <Link href="/disclaimer" style={fLink}>Disclaimer</Link>
                    <Link href="/contact" style={fLink}>Contact Us</Link>
                </div>
                <p style={{color:'#475569', fontSize:'0.75rem'}}>&copy; 2026 SHB ToolBox by SHB Stores. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Styles
const navBar = { background: '#1e293b', borderBottom: '1px solid #334155', position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: '70px' };
const navContainer = { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px' };
const logoS = { fontWeight: '900', fontSize: '1.4rem', textDecoration: 'none', color: '#fff', marginRight: '40px' };
const desktopMenu = { display: 'flex', alignItems: 'center', gap: '5px', height: '100%' };
const tabItem = { padding: '0 20px', height: '70px', display: 'flex', alignItems: 'center', color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', transition: '0.2s', borderBottom: '3px solid transparent' };
const dropdownWrapper = { position: 'relative', height: '100%', display: 'flex', alignItems: 'center' };
const dropdownBtn = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', padding: '0 20px' };
const megaMenu = { position: 'absolute', top: '70px', right: '-100px', background: '#1e293b', border: '1px solid #334155', borderRadius: '0 0 15px 15px', padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 200px)', gap: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'slideIn 0.2s ease-out' };
const menuColumn = { display: 'flex', flexDirection: 'column', gap: '8px' };
const columnTitle = { color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '5px' };
const menuLink = { color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', padding: '5px 0', transition: '0.2s' };
const footerS = { textAlign: 'center', padding: '60px 20px', borderTop: '1px solid #1e293b', background: '#0f172a' };
const fLink = { color: '#38bdf8', textDecoration: 'none', fontSize: '0.85rem' };
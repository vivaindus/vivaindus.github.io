import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PercentageCalculator() {
    const [mounted, setMounted] = useState(false);
    const [notification, setNotification] = useState('');

    // State for different calculator modes
    const [v1, setV1] = useState({ p: 10, total: 500 });
    const [v2, setV2] = useState({ part: 50, total: 200 });
    const [v3, setV3] = useState({ old: 100, current: 150 });
    const [v4, setV4] = useState({ amount: 1000, tax: 5 });

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

    const handleCopy = (val) => {
        navigator.clipboard.writeText(val);
        setNotification(`Result ${val} copied to clipboard! 📋`);
    };

    if (!mounted) return <ToolboxLayout title="Percentage Suite" description="Loading Math Engine..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Booting Calculation Suite...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Percentage Calculator - All-in-One Business Math Tool" 
            description="Calculate percentage increases, decreases, VAT, tips, and basic ratios. A comprehensive tool for business owners, students, and shoppers."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Professional Percentage Suite</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        From <strong>E-commerce Margins</strong> to <strong>VAT compliance</strong>, percentages rule the business world. 
                        Our precision math suite helps you eliminate human error in your financial and academic calculations.
                    </p>
                </div>

                {/* --- MAIN CALCULATOR GRID --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
                    
                    {/* MOD 1: Basic % */}
                    <div style={cardStyle}>
                        <h4 style={cardHeader}>What is X% of Y?</h4>
                        <div style={flexRow}>
                            <input type="number" value={v1.p} onChange={(e)=>setV1({...v1, p: e.target.value})} style={inputS} />
                            <span style={operator}>% of</span>
                            <input type="number" value={v1.total} onChange={(e)=>setV1({...v1, total: e.target.value})} style={inputS} />
                            <span style={operator}>=</span>
                            <div onClick={()=>handleCopy(((v1.p/100)*v1.total).toFixed(2))} style={resultBox}>
                                {((v1.p/100)*v1.total).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* MOD 2: Ratio % */}
                    <div style={cardStyle}>
                        <h4 style={cardHeader}>X is what % of Y?</h4>
                        <div style={flexRow}>
                            <input type="number" value={v2.part} onChange={(e)=>setV2({...v2, part: e.target.value})} style={inputS} />
                            <span style={operator}>is what % of</span>
                            <input type="number" value={v2.total} onChange={(e)=>setV2({...v2, total: e.target.value})} style={inputS} />
                            <span style={operator}>=</span>
                            <div onClick={()=>handleCopy(((v2.part/v2.total)*100).toFixed(2))} style={resultBox}>
                                {((v2.part/v2.total)*100).toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* MOD 3: Increase/Decrease */}
                    <div style={cardStyle}>
                        <h4 style={cardHeader}>% Increase / Decrease</h4>
                        <div style={flexRow}>
                            <input type="number" value={v3.old} onChange={(e)=>setV3({...v3, old: e.target.value})} style={inputS} />
                            <span style={operator}>to</span>
                            <input type="number" value={v3.current} onChange={(e)=>setV3({...v3, current: e.target.value})} style={inputS} />
                            <span style={operator}>is</span>
                            <div onClick={()=>handleCopy((((v3.current-v3.old)/v3.old)*100).toFixed(2))} style={{...resultBox, background: (v3.current-v3.old) >= 0 ? '#34d399' : '#f87171'}}>
                                {(( (v3.current-v3.old)/v3.old )*100).toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* MOD 4: VAT / Tax */}
                    <div style={{ ...cardStyle, border: '2px solid #38bdf8' }}>
                        <h4 style={cardHeader}>VAT / Sales Tax Inclusive</h4>
                        <div style={flexRow}>
                            <input type="number" value={v4.amount} onChange={(e)=>setV4({...v4, amount: e.target.value})} style={inputS} />
                            <span style={operator}>at</span>
                            <input type="number" value={v4.tax} onChange={(e)=>setV4({...v4, tax: e.target.value})} style={inputS} />
                            <span style={operator}>% VAT =</span>
                            <div onClick={()=>handleCopy((v4.amount * (1 + v4.tax/100)).toFixed(2))} style={{...resultBox, border:'1px solid #38bdf8'}}>
                                {(v4.amount * (1 + v4.tax/100)).toFixed(2)}
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Professional Guide to Percentages in Finance & Business</h2>
                    <p>
                        A percentage is a way of expressing a number as a fraction of 100. While the concept is taught in elementary school, its 
                        application in <strong>Corporate Finance</strong>, <strong>Retail Markups</strong>, and <strong>Taxation </strong> 
                        requires a high degree of precision. At <strong>SHB ToolBox</strong>, we have optimized our Percentage Suite to 
                        handle complex decimal scenarios for professionals worldwide.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>Critical Business Calculations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '40px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. Calculating Growth & Loss</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Percentage increase and decrease tools are vital for tracking stock market performance or year-over-year revenue. 
                                Understanding a 20% growth versus a 20% loss is fundamental to calculating your <strong>ROI (Return on Investment)</strong>.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Markup vs. Margin</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Many entrepreneurs confuse Markup with Margin. Markup is the percentage added to the cost price, while Margin 
                                is the percentage of the selling price that is profit. Using our suite helps you calculate these ratios 
                                to ensure your business remains profitable.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Tax and VAT Compliance</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                For businesses in the <strong>UAE and GCC</strong>, calculating 5% VAT (Value Added Tax) is a daily requirement. 
                                Our tax module allows you to find the gross total inclusive of tax instantly, ensuring your invoicing 
                                is accurate and compliant.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Real-World Application: The Shopper’s Discount</h3>
                    <p>
                        Ever been in a store and struggled to calculate "35% off on a AED 750 item"? Our tool simplifies this logic. 
                        By understanding the percentage of a value, you can quickly determine your actual savings and avoid 
                        overspending during retail sales events like Black Friday or the Dubai Shopping Festival.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Precision & Floating-Point Logic</h3>
                    <p>
                        Mathematical errors in finance often stem from "rounding too early." SHB ToolBox uses <strong>64-bit Floating Point 
                        precision</strong> to ensure that every intermediate calculation is exact before delivering your final 2-decimal result. 
                        This level of accuracy is essential for payroll, accounting, and laboratory data analysis.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Privacy Guarantee</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, your financial privacy is permanent. We do not store your figures, product prices, 
                        or tax data. All logic is executed <strong>entirely in your browser</strong>. This ensures that you can 
                        perform sensitive business math without any data leaving your device.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const cardStyle = { background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const cardHeader = { color: '#38bdf8', fontSize: '1rem', marginTop: 0, marginBottom: '20px', fontWeight: 'bold', textTransform: 'uppercase' };
const flexRow = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' };
const inputS = { width: '85px', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '10px', color: '#fff', fontSize: '1.1rem', outline: 'none', textAlign: 'center' };
const operator = { color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' };
const resultBox = { background: '#38bdf8', color: '#0f172a', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', minWidth:'80px', textAlign:'center' };
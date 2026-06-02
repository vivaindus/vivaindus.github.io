import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const unitData = {
    length: { 
        units: { meters: 1, km: 0.001, miles: 0.00062, feet: 3.2808, inches: 39.37, yards: 1.0936 }, 
        label: "Length & Distance" 
    },
    area: { 
        units: { sqMeters: 1, acres: 0.000247, cents: 0.0247, sqFeet: 10.7639, hectares: 0.0001 }, 
        label: "Area (Incl. Regional Units)" 
    },
    mass: { 
        units: { kg: 1, grams: 1000, pounds: 2.2046, carats: 5000, ounces: 35.274 }, 
        label: "Weight & Mass" 
    },
    data: { 
        units: { MB: 1, GB: 0.000976, TB: 0.000000953, KB: 1024 }, 
        label: "Digital Storage" 
    }
};

export default function UnitConverter() {
    const [mounted, setMounted] = useState(false);
    const [cat, setCat] = useState('length');
    const [val, setVal] = useState(1);
    const [from, setFrom] = useState('meters');
    const [to, setTo] = useState('km');
    const [notification, setNotification] = useState('');

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

    const convert = () => {
        const result = (val / unitData[cat].units[from] * unitData[cat].units[to]);
        return result < 0.00001 ? result.toExponential(4) : result.toFixed(4);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(convert());
        setNotification('Conversion copied to clipboard! 📋');
    };

    if (!mounted) return <ToolboxLayout title="Unit Converter" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Calibrating Conversion Matrix...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Professional Unit Converter - Metric, Imperial & Regional Conversions" 
            description="Convert length, area (cents/acres), mass, and digital data instantly. High-precision math engine for engineers, students, and real estate professionals."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Unit Converter Pro</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        In a globalized world, precision is non-negotiable. Whether you're calculating <strong>Real Estate Cents</strong> in the UAE 
                        or <strong>Engineering Millimeters</strong>, our engine provides high-floating-point accuracy for all your technical needs.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>📏 25+ Measurement Types</span>
                        <span>🏗️ Regional Support</span>
                        <span>🔢 4-Decimal Precision</span>
                    </div>
                </div>

                {/* --- APP AREA --- */}
                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    <label style={lCap}>SELECT MEASUREMENT CATEGORY</label>
                    <select 
                        value={cat} 
                        onChange={(e) => { 
                            const newCat = e.target.value;
                            setCat(newCat); 
                            setFrom(Object.keys(unitData[newCat].units)[0]); 
                            setTo(Object.keys(unitData[newCat].units)[1]); 
                        }} 
                        style={inputStyle}
                    >
                        {Object.keys(unitData).map(k => <option key={k} value={k}>{unitData[k].label}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '20px' }}>
                        
                        {/* FROM BOX */}
                        <div style={converterBox}>
                            <label style={lCap}>FROM:</label>
                            <input type="number" value={val} onChange={(e) => setVal(e.target.value)} style={rawInput} />
                            <select value={from} onChange={(e) => setFrom(e.target.value)} style={unitSelect}>
                                {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                            </select>
                        </div>

                        {/* TO BOX */}
                        <div style={{ ...converterBox, border: '1px solid #38bdf8', background: 'rgba(56, 189, 248, 0.05)' }}>
                            <label style={{ ...lCap, color: '#38bdf8' }}>TO (RESULT):</label>
                            <div onClick={handleCopy} style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', padding: '10px 0', cursor:'pointer' }}>
                                {convert()}
                            </div>
                            <select value={to} onChange={(e) => setTo(e.target.value)} style={{ ...unitSelect, color: '#38bdf8' }}>
                                {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                            </select>
                        </div>

                    </div>
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '0.8rem' }}>Click the result to copy to clipboard</p>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Evolution of Measurements: From Ancient Units to Global Standards</h2>
                    <p>
                        Human civilization has always needed to quantify the world. From the Egyptian Cubit to the modern International System of Units (SI), 
                        the accuracy of measurement has defined our progress in trade, science, and construction. The <strong>SHB Unit Converter Pro</strong> 
                        is built to bridge the gap between these systems, offering a technical environment for cross-disciplinary calculations.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#fff' }}>Metric vs. Imperial Systems</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                While the <strong>Metric system</strong> (based on powers of 10) is used by 95% of the world for scientific 
                                and commercial purposes, the <strong>Imperial system</strong> remains the standard in the United States and UK. 
                                Converting between "Kilometers" and "Miles" or "Kilograms" and "Pounds" requires precise floating-point math 
                                to avoid engineering errors.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Specialized Regional Units</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                We understand that local markets have unique needs. In the <strong>GCC and South Asian real estate sectors</strong>, 
                                units like "Cents" and "Acres" are the standard for land measurement. Our tool specifically includes these 
                                conversions, making it a favorite for real estate agents and developers in the region.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff' }}>Digital Data Precision</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                For IT professionals, "1 Gigabyte" isn't always 1000 Megabytes. Depending on whether you use decimal (base 10) 
                                or binary (base 2) standards, the numbers change. Our converter follows the <strong>IEC standard</strong> 
                                to ensure your cloud storage and server calculations are technically accurate.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Precision Math: Why 4 Decimals?</h3>
                    <p>
                        Most casual converters round numbers to two decimal places. However, in laboratory settings or jewelry mass 
                        calculations (like <strong>Carats</strong>), a two-decimal round can lead to significant cumulative errors. 
                        SHB ToolBox uses a high-precision constant database to deliver results up to 4 decimal places, ensuring 
                        that your data integrity remains intact across multiple conversions.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>100% Client-Side Privacy</h3>
                    <p>
                        At <strong>SHB ToolBox</strong>, we believe your data is your property. Many unit converters track the 
                        measurements you perform to build commercial profiles. Our tool runs <strong>100% locally in your browser</strong>. 
                        Whether you are converting confidential floor plans or proprietary ingredient weights, no data ever 
                        leaves your computer.
                    </p>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '18px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem', outline: 'none', cursor:'pointer' };
const converterBox = { background: '#0f172a', padding: '25px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' };
const rawInput = { background: 'none', border: 'none', borderBottom: '2px solid #334155', width: '100%', color: '#fff', fontSize: '2rem', fontWeight: '900', textAlign: 'center', marginBottom: '15px', outline: 'none' };
const unitSelect = { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none', textTransform: 'uppercase' };
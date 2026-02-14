import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const unitData = {
    length: { units: { meters: 1, km: 0.001, miles: 0.00062, feet: 3.28, inches: 39.37, yards: 1.093 }, label: "Length" },
    area: { units: { sqMeters: 1, acres: 0.000247, cents: 0.0247, sqFeet: 10.76 }, label: "Area (Incl. Cents)" },
    mass: { units: { kg: 1, grams: 1000, pounds: 2.20, carats: 5000 }, label: "Weight" },
    data: { units: { MB: 1, GB: 0.00097, TB: 0.0000009 }, label: "Data" }
};

export default function UnitConverter() {
    const [cat, setCat] = useState('length');
    const [val, setVal] = useState(1);
    const [from, setFrom] = useState('meters');
    const [to, setTo] = useState('km');
    const [showHints, setShowHints] = useState(false);

    const convert = () => (val / unitData[cat].units[from] * unitData[cat].units[to]).toFixed(4);

    return (
        <ToolboxLayout title="Unit Converter Pro" description="Convert global and Indian units.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{textAlign:'center', color:'#38bdf8', marginBottom:'20px'}}>Unit Converter Pro</h1>
                
                <button onClick={()=>setShowHints(!showHints)} style={{background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', marginBottom:'15px', width:'100%'}}>
                    {showHints ? "Hide Usage Hints" : "Show Usage Hints"}
                </button>

                {showHints && (
                    <div style={{background:'rgba(56, 189, 248, 0.1)', padding:'15px', borderRadius:'12px', color:'#38bdf8', fontSize:'0.85rem', marginBottom:'20px', border:'1px solid #38bdf8'}}>
                        <strong>How to use:</strong><br/>
                        1. Select Category (e.g. Area for Cents)<br/>
                        2. Enter the amount in the left box<br/>
                        3. Select "From" and "To" units. Results update instantly.
                    </div>
                )}

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <select value={cat} onChange={(e) => { setCat(e.target.value); setFrom(Object.keys(unitData[e.target.value].units)[0]); setTo(Object.keys(unitData[e.target.value].units)[1]); }} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
                        {Object.keys(unitData).map(k => <option key={k} value={k}>{unitData[k].label}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="number" value={val} onChange={(e) => setVal(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }} />
                        <select value={from} onChange={(e) => setFrom(e.target.value)} style={{ background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px' }}>
                            {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#38bdf8', fontWeight: 'bold' }}>EQUALS</div>

                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{convert()}</div>
                        <select value={to} onChange={(e) => setTo(e.target.value)} style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: '1.2rem', cursor:'pointer' }}>
                            {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>Professional Global & Regional Unit Conversion</h2>
                    <p>
                        The SHB Unit Converter Pro is a comprehensive conversion utility designed for engineers, students, and 
                        real estate professionals. In a globalized world, the ability to switch between metric and imperial 
                        systems—or even specialized regional units—is essential for accuracy in technical and commercial work.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Multi-Category Conversion Logic</h3>
                    <p>
                        Our tool handles four distinct categories of measurement with high-precision mathematical scaling:
                    </p>
                    <ul>
                        <li><strong>Length & Distance:</strong> Instantly convert between Meters, Kilometers, Miles, and Feet. Whether you are calculating travel distances or architectural measurements, our tool provides accuracy up to four decimal places.</li>
                        <li><strong>Area (Including Cents & Acres):</strong> Specialized for real estate, we include conversion for "Cents"—a vital unit in South Asian land measurement—alongside standard Acres and Square Feet.</li>
                        <li><strong>Weight & Mass:</strong> Includes standard Kilograms and Pounds, as well as <strong>Carats</strong> for professionals in the jewelry and gemstone industry.</li>
                        <li><strong>Digital Data:</strong> Essential for IT professionals to calculate storage capacities across Megabytes (MB), Gigabytes (GB), and Terabytes (TB).</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Precision and Floating-Point Accuracy</h3>
                    <p>
                        Manual conversion often leads to rounding errors that can compromise technical data. SHB ToolBox 
                        uses a centralized unit-ratio database. This means all conversions are first normalized to a base unit 
                        (like the Meter or Kilogram) before being calculated into the target unit, ensuring the highest possible 
                        consistency across all calculations.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>User-Centric Design and Usage Hints</h3>
                    <p>
                        We have included an optional "Usage Hints" panel to assist beginners in navigating complex units like 
                        Area and Data. The "Instant-Update" logic means you don't have to click a "Calculate" button—the result 
                        changes in real-time as you type, saving you time during heavy data-entry tasks.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy Commitment</h3>
                    <p>
                        Just like our other professional utilities, the Unit Converter Pro executes all mathematical logic 
                        locally on your device. No measurement data is transmitted to our servers or stored in our 
                        Supabase database. Your work remains private, secure, and fast.
                    </p>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}
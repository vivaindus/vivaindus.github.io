import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const unitData = {
    length: { units: { meters: 1, km: 0.001, miles: 0.000621371, feet: 3.28084 }, label: "Distance", hint: "Useful for travel and mapping." },
    area: { units: { sqMeters: 1, acres: 0.000247105, sqFeet: 10.7639 }, label: "Area", hint: "Best for real estate and land size." },
    temp: { units: { celsius: 1, fahrenheit: 1, kelvin: 1 }, label: "Temperature", hint: "Weather and science conversions." },
    mass: { units: { kg: 1, grams: 1000, pounds: 2.20462 }, label: "Weight", hint: "Great for cooking and gym tracking." },
    data: { units: { MB: 1, GB: 0.000976, TB: 0.0000009 }, label: "Digital Data", hint: "Check your storage and file sizes." },
    tip: { units: { five: 0.05, ten: 0.10, fifteen: 0.15, twenty: 0.20 }, label: "Tip Calculator", hint: "Quickly calculate restaurant tips." }
};

export default function UnitConverter() {
    const [cat, setCat] = useState('length');
    const [val, setVal] = useState(1);
    const [fromUnit, setFromUnit] = useState('meters');
    const [toUnit, setToUnit] = useState('km');
    const [showHint, setShowHint] = useState(true);

    const convert = () => {
        if (cat === 'temp') {
            if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return (val * 9/5 + 32).toFixed(2);
            if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return ((val - 32) * 5/9).toFixed(2);
            return val;
        }
        if (cat === 'tip') return (val * unitData.tip.units[toUnit]).toFixed(2);
        
        const inBase = val / unitData[cat].units[fromUnit];
        return (inBase * unitData[cat].units[toUnit]).toFixed(4);
    };

    return (
        <ToolboxLayout title="Unit Converter Pro" description="Convert anything from data to tips.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '20px' }}>Unit Converter Pro</h1>
                
                <button onClick={()=>setShowHint(!showHint)} style={{background:'none', border:'1px solid #334155', color:'#94a3b8', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', marginBottom:'10px'}}>
                    {showHint ? "Hide Hint" : "Show Hint"}
                </button>

                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    {showHint && <p style={{background:'#0f172a', padding:'10px', borderRadius:'8px', color:'#38bdf8', fontSize:'0.8rem', marginBottom:'15px'}}>💡 {unitData[cat].hint}</p>}
                    
                    <select value={cat} onChange={(e) => { setCat(e.target.value); setFromUnit(Object.keys(unitData[e.target.value].units)[0]); setToUnit(Object.keys(unitData[e.target.value].units)[1]); }} 
                            style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
                        {Object.keys(unitData).map(k => <option key={k} value={k}>{unitData[k].label}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="number" value={val} onChange={(e) => setVal(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }} />
                        <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} style={{ background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px' }}>
                            {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#38bdf8', fontWeight: 'bold' }}>RESULT</div>

                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{convert()}</div>
                        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: '1.2rem' }}>
                            {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
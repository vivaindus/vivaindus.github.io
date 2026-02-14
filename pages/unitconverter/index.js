import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

const unitData = {
    length: { units: { meters: 1, km: 0.001, miles: 0.000621371, feet: 3.28084, inches: 39.3701 }, label: "Length & Distance" },
    area: { units: { sqMeters: 1, sqKm: 0.000001, sqMiles: 0.0000003861, acres: 0.000247105, sqFeet: 10.7639 }, label: "Area" },
    mass: { units: { kg: 1, grams: 1000, pounds: 2.20462, ounces: 35.274, tons: 0.001 }, label: "Mass & Weight" },
    volume: { units: { liters: 1, ml: 1000, gallons: 0.264172, cubicMeters: 0.001, cups: 4.22675 }, label: "Volume" },
    data: { units: { MB: 1, KB: 1024, GB: 0.0009765625, TB: 0.0000009537, bits: 8388608 }, label: "Digital Data" },
    speed: { units: { mps: 1, kph: 3.6, mph: 2.23694, knots: 1.94384 }, label: "Speed" },
    time: { units: { seconds: 1, minutes: 1/60, hours: 1/3600, days: 1/86400 }, label: "Time" }
};

export default function UnitConverter() {
    const [cat, setCat] = useState('length');
    const [val, setVal] = useState(1);
    const [fromUnit, setFromUnit] = useState('meters');
    const [toUnit, setToUnit] = useState('km');

    const convert = () => {
        const inBase = val / unitData[cat].units[fromUnit];
        const result = inBase * unitData[cat].units[toUnit];
        return result.toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    return (
        <ToolboxLayout title="Advanced Unit Converter" description="Convert Area, Mass, Data, Speed and more.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '30px' }}>Unit Converter Pro</h1>
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    
                    <label style={{ color: '#94a3b8' }}>Category</label>
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

                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#38bdf8', fontWeight: 'bold' }}>IS EQUAL TO</div>

                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{convert()}</div>
                        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                            {Object.keys(unitData[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
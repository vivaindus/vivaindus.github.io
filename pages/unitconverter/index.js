import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function UnitConverter() {
    const [val, setVal] = useState(1);
    const [type, setType] = useState('kmToMiles');

    const conversions = {
        kmToMiles: (v) => (v * 0.621371).toFixed(2) + " Miles",
        milesToKm: (v) => (v / 0.621371).toFixed(2) + " Km",
        kgToLbs: (v) => (v * 2.20462).toFixed(2) + " Lbs",
        lbsToKg: (v) => (v / 2.20462).toFixed(2) + " Kg",
        cToF: (v) => ((v * 9/5) + 32).toFixed(1) + " °F",
        fToC: (v) => ((v - 32) * 5/9).toFixed(1) + " °C",
    };

    return (
        <ToolboxLayout title="Unit Converter" description="Quickly convert length, weight, and temperature.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '30px' }}>Unit Converter</h1>
                
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <select 
                        onChange={(e) => setType(e.target.value)}
                        style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}
                    >
                        <option value="kmToMiles">Kilometers to Miles</option>
                        <option value="milesToKm">Miles to Kilometers</option>
                        <option value="kgToLbs">Kilograms to Pounds</option>
                        <option value="lbsToKg">Pounds to Kilograms</option>
                        <option value="cToF">Celsius to Fahrenheit</option>
                        <option value="fToC">Fahrenheit to Celsius</option>
                    </select>

                    <input 
                        type="number" 
                        value={val} 
                        onChange={(e) => setVal(e.target.value)}
                        style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #334155', fontSize: '1.5rem', textAlign: 'center' }}
                    />
                    
                    <div style={{ margin: '20px 0', fontSize: '1.2rem', color: '#94a3b8' }}>EQUALS</div>
                    
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8' }}>
                        {conversions[type](val)}
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
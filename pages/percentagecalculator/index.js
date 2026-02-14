import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PercentageCalculator() {
    // Logic 1: What is X% of Y
    const [p1, setP1] = useState(10); const [v1, setV1] = useState(758);
    // Logic 2: X is what % of Y
    const [p2, setP2] = useState(7);  const [v2, setV2] = useState(874);
    // Logic 3: VAT/GST
    const [v3, setV3] = useState(854); const [vat, setVat] = useState(5);

    return (
        <ToolboxLayout title="Percentage Calculator" description="Calculate discounts, VAT, and percentage differences easily.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '30px' }}>Percentage Suite</h1>

                {/* Box 1 */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '10px' }}>What is X% of Y?</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="number" value={p1} onChange={(e)=>setP1(e.target.value)} style={{ width: '60px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '8px' }} />
                        <span>% of</span>
                        <input type="number" value={v1} onChange={(e)=>setV1(e.target.value)} style={{ width: '100px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '8px' }} />
                        <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>= {((p1 / 100) * v1).toFixed(2)}</span>
                    </div>
                </div>

                {/* Box 2 */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '10px' }}>X is what % of Y?</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="number" value={p2} onChange={(e)=>setP2(e.target.value)} style={{ width: '70px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '8px' }} />
                        <span>is what % of</span>
                        <input type="number" value={v2} onChange={(e)=>setV2(e.target.value)} style={{ width: '100px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px', borderRadius: '8px' }} />
                        <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>= {((p2 / v2) * 100).toFixed(2)}%</span>
                    </div>
                </div>

                {/* Box 3: VAT/GST */}
                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '2px solid #38bdf8' }}>
                    <h3 style={{ marginBottom: '15px' }}>Tax / VAT Calculator</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Amount</label>
                        <input type="number" value={v3} onChange={(e)=>setV3(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }} /></div>
                        <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tax %</label>
                        <input type="number" value={vat} onChange={(e)=>setVat(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                            <small>TAX AMOUNT</small>
                            <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold' }}>₹{((v3 * vat) / 100).toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                            <small>TOTAL PRICE</small>
                            <div style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: 'bold' }}>₹{(parseFloat(v3) + (v3 * vat / 100)).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolboxLayout>
    );
}
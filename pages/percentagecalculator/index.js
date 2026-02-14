import React, { useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function PercentageCalculator() {
    const [p1, setP1] = useState(10); const [v1, setV1] = useState(750);
    const [p2, setP2] = useState(50);  const [v2, setV2] = useState(500);
    const [v3, setV3] = useState(1000); const [vat, setVat] = useState(5);

    const copy = (val) => {
        navigator.clipboard.writeText(val);
        alert("Copied to clipboard: " + val);
    };

    return (
        <ToolboxLayout title="Percentage Calculator" description="Fast, copy-friendly percentage and VAT calculator.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Percentage Suite</h1>
                <p style={{textAlign:'center', color:'#94a3b8', marginBottom:'20px'}}>Click any result to copy the value.</p>

                {/* Type 1: X% of Y */}
                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '10px' }}>What is X% of Y?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                        <input type="number" value={p1} onChange={(e)=>setP1(e.target.value)} style={{ width: '80px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }} />
                        <span>% of</span>
                        <input type="number" value={v1} onChange={(e)=>setV1(e.target.value)} style={{ width: '120px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }} />
                        <span>=</span>
                        <div onClick={()=>copy(((p1/100)*v1).toFixed(2))} style={{ background:'#38bdf8', color:'#0f172a', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>
                            {((p1 / 100) * v1).toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Type 2: X is what % of Y */}
                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '10px' }}>X is what % of Y?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                        <input type="number" value={p2} onChange={(e)=>setP2(e.target.value)} style={{ width: '100px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }} />
                        <span>is what % of</span>
                        <input type="number" value={v2} onChange={(e)=>setV2(e.target.value)} style={{ width: '120px', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }} />
                        <span>=</span>
                        <div onClick={()=>copy(((p2/v2)*100).toFixed(2))} style={{ background:'#38bdf8', color:'#0f172a', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>
                            {((p2 / v2) * 100).toFixed(2)} %
                        </div>
                    </div>
                </div>

                {/* Type 3: VAT/GST */}
                <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '2px solid #38bdf8' }}>
                    <h3 style={{ marginBottom: '20px' }}>Tax / VAT Calculator</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Base Amount</label>
                            <input type="number" value={v3} onChange={(e)=>setV3(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tax %</label>
                            <input type="number" value={vat} onChange={(e)=>setVat(e.target.value)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div onClick={()=>copy(((v3*vat)/100).toFixed(2))} style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155', cursor:'pointer' }}>
                            <small style={{color:'#94a3b8'}}>TAX ONLY</small>
                            <div style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 'bold' }}>{((v3 * vat) / 100).toFixed(2)}</div>
                        </div>
                        <div onClick={()=>copy((parseFloat(v3) + (v3 * vat / 100)).toFixed(2))} style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155', cursor:'pointer' }}>
                            <small style={{color:'#94a3b8'}}>TOTAL</small>
                            <div style={{ color: '#34d399', fontSize: '1.4rem', fontWeight: 'bold' }}>{(parseFloat(v3) + (v3 * vat / 100)).toFixed(2)}</div>
                        </div>
                    </div>
                    <p style={{textAlign:'center', marginTop:'15px', fontSize:'0.75rem', color:'#64748b'}}>Click to copy the value</p>
                </div>
            </div>
        </ToolboxLayout>
    );
}
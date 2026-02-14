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
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>Mastering Math with the SHB Percentage Suite</h2>
                    <p>
                        Percentages are a fundamental part of our daily lives—from calculating shopping discounts to understanding 
                        business growth and tax liabilities. The SHB Percentage Suite is a comprehensive utility designed to 
                        handle the three most common percentage tasks instantly and accurately.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>What Can This Tool Calculate?</h3>
                    <p>
                        We have simplified complex formulas into three easy-to-use modules:
                    </p>
                    <ul>
                        <li><strong>Percentage of a Value (X% of Y):</strong> Ideal for finding the exact amount of a discount or a tip. For example, finding 15% of a $750 bill.</li>
                        <li><strong>Percentage Conversion (X is what % of Y):</strong> Useful for tracking progress or calculating margins. For instance, if you have completed 50 tasks out of 500, this tool tells you that you are 10% finished.</li>
                        <li><strong>VAT & Tax Calculator:</strong> A specialized module for business owners and shoppers to calculate Value Added Tax (VAT) or Sales Tax. It provides both the tax-only amount and the final total.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>The Math Behind the Percentage</h3>
                    <p>
                        To calculate a percentage manually, you usually divide the part by the whole and multiply by 100. 
                        Our tool automates this process using high-precision JavaScript logic. This ensures that even 
                        with large numbers or complex decimals, you get a result rounded to two decimal places—the 
                        standard for financial and academic calculations.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Efficiency Features: Click-to-Copy</h3>
                    <p>
                        We built SHB ToolBox for professionals. That is why every result in this suite is "copy-friendly." 
                        Instead of manually highlighting and copying a number, simply click the result button. 
                        The value is instantly saved to your clipboard, allowing you to paste it directly into 
                        your spreadsheets, emails, or accounting software like Excel or QuickBooks.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy and Security</h3>
                    <p>
                        Your financial data is your business. The SHB ToolBox does not store any of the numbers 
                        you input into our calculators. All logic is executed within your browser session, 
                        meaning no data is transmitted to our servers or third-party databases.
                    </p>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}
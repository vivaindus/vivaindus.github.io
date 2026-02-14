import React, { useState } from 'react';
import Head from 'next/head';

export default function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const [catColor, setCatColor] = useState('#38bdf8');
    const [tips, setTips] = useState([]);

    const calculateBMI = (e) => {
        e.preventDefault();
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            if (bmiValue < 18.5) {
                setCategory('Underweight');
                setCatColor('#fbbf24');
                setTips(['Focus on nutrient-dense foods.', 'Include protein in every meal.', 'Try strength training to build muscle.']);
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                setCategory('Normal Weight');
                setCatColor('#34d399');
                setTips(['Maintain your current balanced diet.', 'Stay hydrated (2-3 liters/day).', 'Consistency is key to long-term health.']);
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                setCategory('Overweight');
                setCatColor('#fb923c');
                setTips(['Monitor portion sizes.', 'Increase daily steps (aim for 10k).', 'Reduce processed sugar intake.']);
            } else {
                setCategory('Obese');
                setCatColor('#f87171');
                setTips(['Consult a healthcare provider.', 'Start with low-impact cardio like walking.', 'Track your daily calorie intake.']);
            }
        }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif', paddingBottom: '50px' }}>
            <Head>
                <title>BMI Calculator & Chart | SHB ToolBox</title>
                <meta name="description" content="Free BMI Calculator with reference chart and health tips. Calculate your Body Mass Index easily." />
            </Head>

            {/* NAVIGATION */}
            <nav style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>SHB ToolBox</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="/cpstest" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>CPS TEST</a>
                    <a href="/bmicalculator" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>BMI CALC</a>
                </div>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>BMI Calculator</h1>
                    <p style={{ color: '#94a3b8' }}>Professional Health Analysis Tool</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                    
                    {/* INPUT FORM */}
                    <form onSubmit={calculateBMI} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '200px', marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Weight (kg)</label>
                                <input type="number" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" required style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ flex: '1', minWidth: '200px', marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Height (cm)</label>
                                <input type="number" step="any" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 170" required style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' }}>
                            CALCULATE BMI
                        </button>
                    </form>

                    {/* RESULTS & TIPS SECTION */}
                    {bmi && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: `2px solid ${catColor}`, textAlign: 'center' }}>
                                <p style={{ color: '#94a3b8', margin: 0 }}>YOUR SCORE</p>
                                <h2 style={{ fontSize: '4rem', margin: '10px 0', color: catColor }}>{bmi}</h2>
                                <span style={{ padding: '6px 15px', background: catColor, color: '#0f172a', borderRadius: '20px', fontWeight: 'bold' }}>{category.toUpperCase()}</span>
                            </div>
                            <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                                <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Health Tips for You:</h3>
                                <ul style={{ paddingLeft: '20px', color: '#cbd5e1' }}>
                                    {tips.map((tip, i) => <li key={i} style={{ marginBottom: '10px' }}>{tip}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* BMI REFERENCE CHART */}
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>BMI Reference Chart</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <th style={{ padding: '12px', color: '#94a3b8' }}>Category</th>
                                        <th style={{ padding: '12px', color: '#94a3b8' }}>BMI Range (kg/m²)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 'bold' }}>Underweight</td>
                                        <td style={{ padding: '12px' }}>Less than 18.5</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '12px', color: '#34d399', fontWeight: 'bold' }}>Normal Weight</td>
                                        <td style={{ padding: '12px' }}>18.5 – 24.9</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '12px', color: '#fb923c', fontWeight: 'bold' }}>Overweight</td>
                                        <td style={{ padding: '12px' }}>25.0 – 29.9</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '12px', color: '#f87171', fontWeight: 'bold' }}>Obese</td>
                                        <td style={{ padding: '12px' }}>30.0 or Higher</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '0.8rem' }}>
                &copy; 2024 SHB ToolBox - Data source: WHO Standard Guidelines
            </footer>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                button:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}
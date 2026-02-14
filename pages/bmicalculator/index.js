import React, { useState } from 'react';
import Head from 'next/head';

export default function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const [catColor, setCatColor] = useState('#38bdf8');

    const calculateBMI = (e) => {
        e.preventDefault();
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            if (bmiValue < 18.5) {
                setCategory('Underweight');
                setCatColor('#fbbf24'); // Yellow
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                setCategory('Normal Weight');
                setCatColor('#34d399'); // Green
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                setCategory('Overweight');
                setCatColor('#fb923c'); // Orange
            } else {
                setCategory('Obese');
                setCatColor('#f87171'); // Red
            }
        }
    };

    const reset = () => {
        setWeight('');
        setHeight('');
        setBmi(null);
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <Head>
                <title>BMI Calculator - Free Health Tool | SHB ToolBox</title>
                <meta name="description" content="Calculate your Body Mass Index (BMI) instantly. Free, accurate, and easy-to-use health tool." />
            </Head>

            {/* SHARED NAVIGATION */}
            <nav style={{ background: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>SHB ToolBox</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="/cpstest" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>CPS TEST</a>
                    <a href="/bmicalculator" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>BMI CALC</a>
                </div>
            </nav>

            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>BMI Calculator</h1>
                    <p style={{ color: '#94a3b8' }}>Check your Body Mass Index quickly</p>
                </header>

                <form onSubmit={calculateBMI} style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Weight (kg)</label>
                        <input 
                            type="number" 
                            step="any"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g. 72"
                            required
                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Height (cm)</label>
                        <input 
                            type="number" 
                            step="any"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="e.g. 175"
                            required
                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '1rem' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        CALCULATE
                    </button>
                </form>

                {/* RESULTS AREA */}
                {bmi && (
                    <div style={{ marginTop: '30px', textAlign: 'center', background: '#1e293b', padding: '30px', borderRadius: '24px', border: `2px solid ${catColor}`, animation: 'fadeIn 0.4s ease' }}>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>YOUR BMI IS</p>
                        <h2 style={{ fontSize: '3.5rem', margin: '10px 0', color: catColor }}>{bmi}</h2>
                        <div style={{ display: 'inline-block', padding: '6px 15px', background: catColor, color: '#0f172a', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px' }}>
                            {category.toUpperCase()}
                        </div>
                        <button 
                            onClick={reset}
                            style={{ display: 'block', margin: '0 auto', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            CLEAR
                        </button>
                    </div>
                )}
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.8rem' }}>
                &copy; 2024 SHB ToolBox - Free Web Utilities
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}